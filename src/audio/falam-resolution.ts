// Falam audio resolution — pure decision layer (docs/ARCHITECTURE.md §8).
// No native imports: fully unit-tested. The async manager
// (./audio-manager.ts) gathers the snapshot (bundled? cached?) and acts on
// the decision. Filenames are stable numeric ids, never Falam words
// (AGENTS.md §14, docs/AUDIO.md §6).

/** Remote base URL for downloadable recordings. Unset until Phase 5
 * distribution exists — until then every non-cached id is honestly
 * unavailable, never a dead download button. */
export const FALAM_AUDIO_REMOTE_BASE_URL: string | undefined = undefined;

export const FALAM_AUDIO_CACHE_SUBDIR = "falam-audio";

export type FalamAudioUnavailableReason =
  | "no-recording"
  | "not-cached"
  | "offline";

export type FalamAudioDecision =
  | "bundled"
  | "cached"
  | "downloadable"
  | "not-cached"
  | "offline";

export type FalamAudioSnapshot = {
  /** The entry references a known recording id. */
  hasRecording: boolean;
  /** The id resolves to a bundled asset. */
  bundled: boolean;
  /** The id resolves to a file in the local cache. */
  cached: boolean;
  /** A remote distribution base URL is configured. */
  remoteConfigured: boolean;
  /** The device currently has usable connectivity. */
  online: boolean;
};

/**
 * Decide how to play a Falam recording. Priority: bundled → cached →
 * download (online + remote configured) → honest unavailability.
 * Callers attach the actual source/URI/download to the decision.
 */
export function decideFalamAudio(
  snapshot: FalamAudioSnapshot,
): FalamAudioDecision {
  if (!snapshot.hasRecording) return "not-cached";
  if (snapshot.bundled) return "bundled";
  if (snapshot.cached) return "cached";
  if (!snapshot.remoteConfigured) return "not-cached";
  if (!snapshot.online) return "offline";
  return "downloadable";
}

/** Map a decision to the user-facing unavailability reason (if any). */
export function unavailableReason(
  decision: FalamAudioDecision,
): FalamAudioUnavailableReason | null {
  if (decision === "not-cached") return "not-cached";
  if (decision === "offline") return "offline";
  return null;
}

/** Cache filename for a recording id — numeric id only, never the word. */
export function falamCacheFilename(audioId: string): string {
  return `${audioId}.m4a`;
}

/** Remote URL for a recording id under a configured base URL. */
export function falamRemoteUrl(baseUrl: string, audioId: string): string {
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return `${base}${falamCacheFilename(audioId)}`;
}
