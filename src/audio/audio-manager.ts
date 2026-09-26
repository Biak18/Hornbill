// Falam audio manager — storage layer between entries and playback
// (docs/ARCHITECTURE.md §8, docs/AUDIO.md §10-11):
// Entry → manager → local cache? → download (explicit tap only) → cache → play.
//
// Downloads NEVER start on their own: resolving an id only reports
// `downloadable`, and the UI renders a download button the user taps
// deliberately — opening an entry must not spend mobile data silently.
// UI components use `useFalamAudio()` / `downloadFalamAudio()` and never
// touch expo-file-system or construct storage URLs (AGENTS.md §27).

import { useCallback, useEffect, useState } from "react";
import { Directory, File, Paths } from "expo-file-system";
import { getFalamAudioSource } from "./audio-files";
import {
  decideFalamAudio,
  FALAM_AUDIO_CACHE_SUBDIR,
  FALAM_AUDIO_REMOTE_BASE_URL,
  falamCacheFilename,
  falamRemoteUrl,
  type FalamAudioUnavailableReason,
} from "./falam-resolution";

export type FalamAudioState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "ready"; source: number | string }
  | { status: "downloadable" }
  | { status: "unavailable"; reason: FalamAudioUnavailableReason };

function cacheDirectory(): Directory {
  return new Directory(Paths.cache, FALAM_AUDIO_CACHE_SUBDIR);
}

// Cache-change broadcast: a download on one screen (entry) must flip every
// other mounted audio hook (featured card) from `downloadable` to `ready`.
// Without this, the card keeps showing "Download audio" for a file that is
// already cached.
type CacheListener = () => void;

const cacheListeners = new Set<CacheListener>();

export function notifyAudioCacheChanged(): void {
  for (const listener of [...cacheListeners]) {
    listener();
  }
}

function useCacheEpoch(): number {
  const [epoch, setEpoch] = useState(0);
  useEffect(() => {
    const listener: CacheListener = () => {
      setEpoch((value) => value + 1);
    };
    cacheListeners.add(listener);
    return () => {
      cacheListeners.delete(listener);
    };
  }, []);
  return epoch;
}

/** Ensure the cache subdirectory exists. Returns false when it cannot be
 * created — callers then report unavailability instead of letting the
 * download fail against a missing folder. */
function ensureCacheDirectory(): boolean {
  try {
    if (!cacheDirectory().exists) {
      Paths.cache.createDirectory(FALAM_AUDIO_CACHE_SUBDIR);
    }
    return true;
  } catch (error) {
    if (__DEV__) {
      console.warn("[audio-manager] cache dir unavailable:", error);
    }
    return false;
  }
}

function cachedFile(audioId: string): File {
  return new File(cacheDirectory(), falamCacheFilename(audioId));
}

/** True when a recording file exists in the local cache AND is non-empty. * Failed downloads can leave 0-byte stubs behind; trusting bare existence
 * wedges the entry on an unplayable file with no recovery. Non-empty files
 * short-circuit here, empty ones fall through to re-download (idempotent
 * overwrite heals them). Never throws. */
export async function isAudioCached(audioId: string): Promise<boolean> {
  try {
    const file = cachedFile(audioId);
    if (!file.exists) return false;
    // Clips are ~30KB — reading the bytes for a length check is trivial.
    const buffer = await file.arrayBuffer();
    return buffer.byteLength > 0;
  } catch {
    return false;
  }
}

export type FalamAudioResolution =
  | { status: "bundled"; source: number }
  | { status: "cached"; uri: string }
  | { status: "downloadable"; url: string }
  | { status: "unavailable"; reason: FalamAudioUnavailableReason };

/**
 * Resolve an audio id WITHOUT downloading: bundled and cached ids return a
 * playable source; anything else reports `downloadable` (with its URL) or
 * `unavailable`. The bundled registry is checked first so offline playback
 * keeps working with zero network. Never throws.
 */
export async function resolveFalamAudio(
  audioId: string,
  online: boolean,
): Promise<FalamAudioResolution> {
  const bundled = getFalamAudioSource(audioId);
  const snapshot = {
    hasRecording: true,
    bundled: bundled !== undefined,
    cached: false,
    remoteConfigured: FALAM_AUDIO_REMOTE_BASE_URL !== undefined,
    online,
  };
  const first = decideFalamAudio(snapshot);
  if (first === "bundled") {
    return { status: "bundled", source: bundled as number };
  }
  snapshot.cached = await isAudioCached(audioId);
  const second = decideFalamAudio(snapshot);
  if (second === "cached") {
    try {
      return { status: "cached", uri: cachedFile(audioId).uri };
    } catch {
      return { status: "unavailable", reason: "not-cached" };
    }
  }
  if (second === "downloadable" && FALAM_AUDIO_REMOTE_BASE_URL !== undefined) {
    return {
      status: "downloadable",
      url: falamRemoteUrl(FALAM_AUDIO_REMOTE_BASE_URL, audioId),
    };
  }
  if (second === "offline") {
    return { status: "unavailable", reason: "offline" };
  }
  return { status: "unavailable", reason: "not-cached" };
}

/**
 * Download a recording into the local cache. Called ONLY from an explicit
 * user tap (download button) — never during resolution, never on screen
 * open. Idempotent overwrite heals partial files from failed attempts.
 * Returns true when the file is now cached and playable.
 */
export async function downloadFalamAudio(audioId: string): Promise<boolean> {
  if (FALAM_AUDIO_REMOTE_BASE_URL === undefined) return false;
  if (!ensureCacheDirectory()) return false;
  const url = falamRemoteUrl(FALAM_AUDIO_REMOTE_BASE_URL, audioId);
  try {
    const destination = new File(
      cacheDirectory(),
      falamCacheFilename(audioId),
    );
    await File.downloadFileAsync(url, destination, { idempotent: true });
    const cached = await isAudioCached(audioId);
    if (cached) {
      notifyAudioCacheChanged();
    }
    return cached;
  } catch (error) {
    // Surfaced in dev (Metro) so a failing host/redirect shows its real
    // native error instead of a silent "Audio unavailable".
    if (__DEV__) {
      console.warn("[audio-manager] download failed:", url, error);
    }
    return false;
  }
}

/**
 * Reactive audio state for an entry's audio id, plus an explicit download
 * action. `online` should reflect current connectivity (treat unknown as
 * online — never block bundled playback on an inconclusive network read).
 *
 * "checking"/"idle" are derived during render, not stored: the only state
 * updates live in async callbacks, which keeps the set-state-in-effect lint
 * clean and avoids a stale "ready" flashing for a previous id.
 */
export function useFalamAudio(
  audioId: string | undefined,
  online: boolean,
): {
  audio: FalamAudioState;
  downloading: boolean;
  download: () => Promise<void>;
} {
  const [resolved, setResolved] = useState<{
    key: string;
    outcome: Extract<
      FalamAudioState,
      { status: "ready" | "downloadable" | "unavailable" }
    >;
  } | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const cacheEpoch = useCacheEpoch();

  const key = `${audioId ?? "none"}|${online ? "online" : "offline"}|${epoch}|${cacheEpoch}`;
  useEffect(() => {
    if (audioId === undefined) return;
    let live = true;
    resolveFalamAudio(audioId, online).then((resolution) => {
      if (!live) return;
      if (resolution.status === "bundled") {
        setResolved({
          key,
          outcome: { status: "ready", source: resolution.source },
        });
      } else if (resolution.status === "cached") {
        setResolved({
          key,
          outcome: { status: "ready", source: resolution.uri },
        });
      } else if (resolution.status === "downloadable") {
        setResolved({ key, outcome: { status: "downloadable" } });
      } else {
        setResolved({
          key,
          outcome: { status: "unavailable", reason: resolution.reason },
        });
      }
    });
    return () => {
      live = false;
    };
  }, [audioId, online, key]);

  // Explicit user tap only. Re-resolution afterwards picks up the cached
  // file (or surfaces the failure) — nothing downloads implicitly.
  const download = useCallback(async () => {
    if (audioId === undefined) return;
    setDownloading(true);
    try {
      await downloadFalamAudio(audioId);
    } finally {
      setDownloading(false);
      setEpoch((value) => value + 1);
    }
  }, [audioId]);

  if (audioId === undefined) {
    return { audio: { status: "idle" }, downloading: false, download };
  }
  if (resolved !== null && resolved.key === key) {
    return { audio: resolved.outcome, downloading, download };
  }
  return { audio: { status: "checking" }, downloading, download };
}
