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
  {
    id: "000002",
    entryId: "entry_user_015",
    file: "000002.m4a",
    verified: false,
    consentNote:
      "Speaker identity and consent unrecorded — obtain before any distribution.",
  },
  {
    id: "000003",
    entryId: "entry_user_001",
    file: "000003.m4a",
    verified: false,
    consentNote:
      "Speaker identity and consent unrecorded — obtain before any distribution.",
  },
  {
    id: "000004",
    entryId: "entry_user_003",
    file: "000004.m4a",
    verified: false,
    consentNote:
      "Speaker identity and consent unrecorded — obtain before any distribution.",
  },
  {
    id: "000005",
    entryId: "entry_user_008",
    file: "000005.m4a",
    verified: false,
    consentNote:
      "Speaker identity and consent unrecorded — obtain before any distribution.",
  },
  {
    id: "000006",
    entryId: "entry_user_013",
    file: "000006.m4a",
    verified: false,
    consentNote:
      "Speaker identity and consent unrecorded — obtain before any distribution.",
  },
  {
    id: "000007",
    entryId: "entry_user_016",
    file: "000007.m4a",
    verified: false,
    consentNote:
      "Speaker identity and consent unrecorded — obtain before any distribution.",
  },
  {
    id: "000008",
    entryId: "entry_user_023",
    file: "000008.m4a",
    verified: false,
    consentNote:
      "Speaker identity and consent unrecorded — obtain before any distribution.",
  },
  {
    id: "000009",
    entryId: "entry_user_024",
    file: "000009.m4a",
    verified: false,
    consentNote:
      "Speaker identity and consent unrecorded — obtain before any distribution.",
  },
];

/**
 * Bundled-asset sources, by audio ID. Currently empty on purpose: all
 * recordings ship remote-only (GitHub release, see FALAM_AUDIO_REMOTE_BASE_URL)
 * so the app package stays small. To bundle a small essential set again
 * (e.g. for guaranteed offline-first demo), add its static require() lines
 * here — Metro cannot bundle dynamic paths, so every id needs its own line.
 */
const bundledSources: Record<string, number> = {};

/** Bundled-asset source for an audio ID, or undefined when not bundled. */
export function getFalamAudioSource(audioId: string): number | undefined {
  return bundledSources[audioId];
}
