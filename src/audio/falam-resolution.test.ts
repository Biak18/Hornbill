// Falam audio resolution tests (docs/ARCHITECTURE.md §8).
// Priority: bundled → cached → downloadable → honest unavailability.
// Filenames stay numeric ids, never Falam words (AGENTS.md §14).

import { describe, expect, it } from "vitest";
import {
  decideFalamAudio,
  falamCacheFilename,
  falamRemoteUrl,
  unavailableReason,
  type FalamAudioSnapshot,
} from "./falam-resolution";

const BASE: FalamAudioSnapshot = {
  hasRecording: true,
  bundled: false,
  cached: false,
  remoteConfigured: false,
  online: true,
};

describe("decideFalamAudio", () => {
  it("prefers bundled over everything", () => {
    expect(
      decideFalamAudio({ ...BASE, bundled: true, cached: true }),
    ).toBe("bundled");
  });

  it("plays cached files when not bundled", () => {
    expect(decideFalamAudio({ ...BASE, cached: true })).toBe("cached");
  });

  it("reports not-cached when no remote is configured", () => {
    expect(decideFalamAudio(BASE)).toBe("not-cached");
    expect(decideFalamAudio({ ...BASE, online: false })).toBe("not-cached");
  });

  it("reports offline when a remote exists but connectivity is down", () => {
    expect(
      decideFalamAudio({ ...BASE, remoteConfigured: true, online: false }),
    ).toBe("offline");
  });

  it("downloads when online with a configured remote", () => {
    expect(
      decideFalamAudio({ ...BASE, remoteConfigured: true, online: true }),
    ).toBe("downloadable");
  });

  it("treats entries without a recording id as not-cached", () => {
    expect(decideFalamAudio({ ...BASE, hasRecording: false })).toBe(
      "not-cached",
    );
  });
});

describe("unavailableReason", () => {
  it("maps decisions to user-facing reasons", () => {
    expect(unavailableReason("not-cached")).toBe("not-cached");
    expect(unavailableReason("offline")).toBe("offline");
    expect(unavailableReason("bundled")).toBeNull();
    expect(unavailableReason("cached")).toBeNull();
    expect(unavailableReason("downloadable")).toBeNull();
  });
});

describe("filenames", () => {
  it("uses numeric ids, never words", () => {
    expect(falamCacheFilename("000001")).toBe("000001.m4a");
  });

  it("joins remote URLs with exactly one slash", () => {
    expect(falamRemoteUrl("https://cdn.example/a", "000001")).toBe(
      "https://cdn.example/a/000001.m4a",
    );
    expect(falamRemoteUrl("https://cdn.example/a/", "000001")).toBe(
      "https://cdn.example/a/000001.m4a",
    );
  });
});
