// Falam native-audio registry (AGENTS.md §14, docs/AUDIO.md §7).
// Stable numeric IDs are the filenames — never the Falam word — so
// respellings don't break links and Unicode never touches a path.
// `verified` marks a human listening-check against the linked entry, NOT
// mere file existence. Speaker identity/consent metadata must be recorded
// before any distribution (docs/AUDIO.md §9); unknown until then.

export type FalamAudioMeta = {
  id: string;
  entryId: string;
  file: string;
  verified: boolean;
  consentNote: string;
};

export const falamAudioRegistry: FalamAudioMeta[] = [
  {
    id: "000001",
    entryId: "entry_user_022",
    file: "000001.m4a",
    verified: false,
    consentNote:
      "Speaker identity and consent unrecorded — obtain before any distribution.",
  },
];

/** Bundled-asset source for an audio ID, or undefined when not bundled. */
export function getFalamAudioSource(audioId: string): number | undefined {
  if (audioId === "000001") {
    return require("../../assets/audio/falam/000001.m4a");
  }
  return undefined;
}
