// Falam audio manager — storage layer between entries and playback
// (docs/ARCHITECTURE.md §8, docs/AUDIO.md §10-11):
// Entry → manager → local cache? → play / download → cache → play.
// UI components use `useFalamAudioSource()` and never touch expo-file-system
// or construct storage URLs themselves (AGENTS.md §27).

import { useEffect, useState } from "react";
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
  | { status: "unavailable"; reason: FalamAudioUnavailableReason };

function cacheDirectory(): Directory {
  return new Directory(Paths.cache, FALAM_AUDIO_CACHE_SUBDIR);
}

function cachedFile(audioId: string): File {
  return new File(cacheDirectory(), falamCacheFilename(audioId));
}

/** True when a recording file exists in the local cache. Never throws. */
export async function isAudioCached(audioId: string): Promise<boolean> {
  try {
    return cachedFile(audioId).exists;
  } catch {
    return false;
  }
}

export type FalamAudioResolution =
  | { status: "bundled"; source: number }
  | { status: "cached"; uri: string }
  | { status: "unavailable"; reason: FalamAudioUnavailableReason };

/**
 * Resolve an audio id to a playable source. Downloads when online with a
 * configured remote (cache → play); otherwise reports honestly. The bundled
 * registry is checked first so offline playback keeps working with zero
 * network. Never throws — failures resolve to `unavailable`.
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
    try {
      const dir = cacheDirectory();
      const file = await File.downloadFileAsync(
        falamRemoteUrl(FALAM_AUDIO_REMOTE_BASE_URL, audioId),
        dir,
      );
      return { status: "cached", uri: file.uri };
    } catch {
      return { status: "unavailable", reason: "not-cached" };
    }
  }
  if (second === "offline") {
    return { status: "unavailable", reason: "offline" };
  }
  return { status: "unavailable", reason: "not-cached" };
}

/**
 * Reactive playback source for an entry's audio id. `online` should reflect
 * current connectivity (treat unknown as online — never block bundled
 * playback on an inconclusive network read).
 *
 * "checking"/"idle" are derived during render, not stored: the only state
 * update lives in the async resolution callback, which keeps the
 * set-state-in-effect lint clean and avoids a stale "ready" flashing for a
 * previous id.
 */
export function useFalamAudioSource(
  audioId: string | undefined,
  online: boolean,
): FalamAudioState {
  const [resolved, setResolved] = useState<{
    key: string;
    outcome: Extract<FalamAudioState, { status: "ready" | "unavailable" }>;
  } | null>(null);

  const key = `${audioId ?? "none"}|${online ? "online" : "offline"}`;
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

  if (audioId === undefined) return { status: "idle" };
  if (resolved !== null && resolved.key === key) return resolved.outcome;
  return { status: "checking" };
}
