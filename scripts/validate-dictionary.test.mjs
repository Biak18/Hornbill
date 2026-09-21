// Import-validator CLI tests (scripts/validate-dictionary.mjs).
// Spawns the script against temp fixtures (MOCK- words only) and asserts
// exit codes plus emitted canonical JSON: errors block, warnings report,
// verified-claims coerce, duplicates are preserved, --strict fails warnings.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const SCRIPT = fileURLToPath(
  new URL("./validate-dictionary.mjs", import.meta.url),
);

function fixture(name, value) {
  const dir = mkdtempSync(join(tmpdir(), "dict-test-"));
  const file = join(dir, name);
  writeFileSync(file, JSON.stringify(value), "utf8");
  return file;
}

function run(args) {
  try {
    const stdout = execFileSync("node", [SCRIPT, ...args], {
      encoding: "utf8",
    });
    return { status: 0, stdout };
  } catch (error) {
    return {
      status: error.status ?? 1,
      stdout: `${error.stdout ?? ""}${error.stderr ?? ""}`,
    };
  }
}

function validEntry(id, word) {
  return {
    id,
    word,
    definitions: [{ id: `${id}__sense1`, english: `English for ${word}` }],
    source: { sourceId: "test", sourceName: "Test source" },
    verificationStatus: "draft",
  };
}

describe("validate-dictionary.mjs", () => {
  it("accepts a clean file", () => {
    const file = fixture("ok.json", [validEntry("v1", "MOCK-ok")]);
    const result = run([file]);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("0 errors");
  });

  it("blocks errors and writes nothing", () => {
    const file = fixture("bad.json", [
      {
        id: "b1",
        word: "  padded ",
        definitions: [{ id: "b1s1", english: "" }],
      },
    ]);
    const out = join(tmpdir(), `dict-blocked-${Date.now()}.json`);
    const result = run(["--emit", out, file]);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("Import blocked");
    expect(() => readFileSync(out, "utf8")).toThrow();
  });

  it("emits canonical JSON with derived searchKey", () => {
    const file = fixture("emit.json", [validEntry("e1", "MOCK-Emit")]);
    const out = join(tmpdir(), `dict-emit-${Date.now()}.json`);
    const result = run(["--emit", out, file]);
    expect(result.status).toBe(0);
    const emitted = JSON.parse(readFileSync(out, "utf8"));
    expect(emitted).toHaveLength(1);
    expect(emitted[0].searchKey).toBe("mock-emit");
    expect(emitted[0].word).toBe("MOCK-Emit");
  });

  it("coerces unverified reviewed/verified claims to draft", () => {
    const file = fixture("coerce.json", [
      { ...validEntry("c1", "MOCK-coerce"), verificationStatus: "verified" },
    ]);
    const out = join(tmpdir(), `dict-coerce-${Date.now()}.json`);
    const result = run(["--emit", out, file]);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('coerced to "draft"');
    const emitted = JSON.parse(readFileSync(out, "utf8"));
    expect(emitted[0].verificationStatus).toBe("draft");
  });

  it("keeps verified status with --allow-verified", () => {
    const file = fixture("allowed.json", [
      { ...validEntry("a1", "MOCK-allow"), verificationStatus: "verified" },
    ]);
    const out = join(tmpdir(), `dict-allow-${Date.now()}.json`);
    const result = run(["--emit", out, "--allow-verified", file]);
    expect(result.status).toBe(0);
    const emitted = JSON.parse(readFileSync(out, "utf8"));
    expect(emitted[0].verificationStatus).toBe("verified");
  });

  it("reports duplicates without merging them", () => {
    const file = fixture("dup.json", [
      validEntry("d1", "MOCK-dupe"),
      validEntry("d2", "MOCK-dupe"),
    ]);
    const out = join(tmpdir(), `dict-dup-${Date.now()}.json`);
    const result = run(["--emit", out, file]);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Potential duplicates");
    const emitted = JSON.parse(readFileSync(out, "utf8"));
    expect(emitted.map((e) => e.id).sort()).toEqual(["d1", "d2"]);
  });

  it("fails warnings under --strict", () => {
    const file = fixture("strict.json", [
      validEntry("s1", "MOCK-strict"),
      validEntry("s2", "MOCK-strict"),
    ]);
    const result = run(["--strict", file]);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("Strict mode");
  });
});
