#!/usr/bin/env node
// Dictionary import validator (docs/DATA.md §14, AGENTS.md §4/§6/§33/§34).
// Validates contributor JSON files against the DictionaryEntry schema and,
// with --emit, writes canonical production JSON (derived searchKey filled in,
// unverified statuses coerced to draft).
//
// Usage:
//   node scripts/validate-dictionary.mjs [--emit out.json] [--strict]
//     [--allow-verified] <file.json...>
//
// Rules enforced:
// - Missing/fabricated linguistic data is an error, never auto-filled.
// - `word` is never rewritten: surrounding whitespace is an error (fix at
//   the source), and a present-but-wrong `searchKey` is an error, not a
//   silent fix. A missing `searchKey` is derived (normalization, §8).
// - Imported data is NEVER marked reviewed/verified without human review:
//   such statuses are coerced to `draft` unless --allow-verified is passed.
// - Potential duplicates are reported, never merged (AGENTS.md §34).
// - Entry ids must be stable strings: re-importing the same file is
//   idempotent (INSERT OR IGNORE), and keeping an id replaces nothing —
//   to correct an entry, keep its id and fix the source file.
// Exit code: 1 on errors, or on warnings with --strict. Otherwise 0.

import { readFileSync, writeFileSync } from "node:fs";

const PARTS_OF_SPEECH = new Set([
  "noun",
  "verb",
  "adjective",
  "adverb",
  "pronoun",
  "preposition",
  "conjunction",
  "interjection",
  "particle",
  "phrase",
]);

const VERIFICATION_STATUSES = new Set(["draft", "reviewed", "verified"]);

const ENTRY_KEYS = new Set([
  "id",
  "word",
  "searchKey",
  "pronunciation",
  "partOfSpeech",
  "definitions",
  "synonyms",
  "antonyms",
  "relatedWords",
  "notes",
  "audioId",
  "source",
  "verificationStatus",
  "createdAt",
  "updatedAt",
]);

// Mirror of src/utils/normalize.ts — deliberately a single expression in
// both places so drift is obvious. Keep in sync.
function normalizeSearchKey(input) {
  return input.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
}

function parseArgs(argv) {
  const options = {
    emit: null,
    strict: false,
    allowVerified: false,
    files: [],
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--emit") {
      options.emit = argv[++i];
    } else if (arg === "--strict") {
      options.strict = true;
    } else if (arg === "--allow-verified") {
      options.allowVerified = true;
    } else if (arg.startsWith("--")) {
      console.error(`Unknown flag: ${arg}`);
      process.exit(2);
    } else {
      options.files.push(arg);
    }
  }
  return options;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

function checkStringArray(label, value, where, errors) {
  if (!Array.isArray(value)) {
    errors.push(`${where}: "${label}" must be an array of strings`);
    return;
  }
  for (const item of value) {
    if (!isNonEmptyString(item)) {
      errors.push(`${where}: "${label}" must contain only non-empty strings`);
      break;
    }
  }
}

function validateEntry(entry, where, seenIds, errors, warnings) {
  if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
    errors.push(`${where}: entry must be an object`);
    return null;
  }

  for (const key of Object.keys(entry)) {
    if (!ENTRY_KEYS.has(key)) {
      warnings.push(`${where}: unknown field "${key}" (possible typo)`);
    }
  }

  if (!isNonEmptyString(entry.id)) {
    errors.push(`${where}: "id" is required (stable non-empty string)`);
    return null;
  }
  if (seenIds.has(entry.id)) {
    errors.push(`${where}: duplicate entry id "${entry.id}"`);
  } else {
    seenIds.add(entry.id);
  }

  if (typeof entry.word !== "string" || entry.word.trim().length === 0) {
    errors.push(`${where}: "word" is required (original Falam spelling)`);
    return null;
  }
  if (entry.word !== entry.word.trim()) {
    errors.push(
      `${where}: "word" has surrounding whitespace — fix at the source, imports never rewrite spelling`,
    );
  }

  const expectedKey = normalizeSearchKey(entry.word);
  let derivedKey = false;
  if (entry.searchKey === undefined) {
    derivedKey = true;
  } else if (entry.searchKey !== expectedKey) {
    errors.push(
      `${where}: "searchKey" does not match the normalized word — fix at the source, imports never silently correct it`,
    );
  }

  if (entry.partOfSpeech !== undefined && !PARTS_OF_SPEECH.has(entry.partOfSpeech)) {
    errors.push(
      `${where}: unknown partOfSpeech "${entry.partOfSpeech}" (never guess — omit when unknown)`,
    );
  }

  if (!Array.isArray(entry.definitions) || entry.definitions.length === 0) {
    errors.push(`${where}: "definitions" must be a non-empty array (one item per sense)`);
  } else {
    const senseIds = new Set();
    entry.definitions.forEach((sense, i) => {
      const senseWhere = `${where} > definitions[${i}]`;
      if (sense === null || typeof sense !== "object") {
        errors.push(`${senseWhere}: sense must be an object`);
        return;
      }
      if (!isNonEmptyString(sense.id)) {
        errors.push(`${senseWhere}: sense "id" is required`);
      } else if (senseIds.has(sense.id)) {
        errors.push(`${senseWhere}: duplicate sense id "${sense.id}"`);
      } else {
        senseIds.add(sense.id);
      }
      if (typeof sense.english !== "string" || sense.english.trim().length === 0) {
        errors.push(`${senseWhere}: sense "english" is required (never leave a sense without a meaning)`);
      }
      if (sense.examples !== undefined) {
        if (!Array.isArray(sense.examples)) {
          errors.push(`${senseWhere}: "examples" must be an array`);
        } else {
          sense.examples.forEach((example, j) => {
            const exWhere = `${senseWhere} > examples[${j}]`;
            if (example === null || typeof example !== "object") {
              errors.push(`${exWhere}: example must be an object`);
              return;
            }
            if (typeof example.falam !== "string" || example.falam.length === 0) {
              errors.push(`${exWhere}: example "falam" is required (never invent example sentences)`);
            }
            if (typeof example.english !== "string") {
              warnings.push(`${exWhere}: example has no English translation (kept, flagged for review)`);
            }
          });
        }
      }
    });
  }

  for (const field of ["synonyms", "antonyms", "relatedWords"]) {
    if (entry[field] !== undefined) {
      checkStringArray(field, entry[field], where, errors);
    }
  }
  if (entry.pronunciation !== undefined && typeof entry.pronunciation !== "string") {
    errors.push(`${where}: "pronunciation" must be a string (omit when unknown)`);
  } else if (entry.pronunciation === "") {
    warnings.push(`${where}: empty "pronunciation" — omit the field instead of shipping an empty string`);
  }
  if (entry.notes !== undefined && typeof entry.notes !== "string") {
    errors.push(`${where}: "notes" must be a string`);
  }
  if (entry.audioId !== undefined && !isNonEmptyString(entry.audioId)) {
    errors.push(`${where}: "audioId" must be a non-empty string when present`);
  }

  if (entry.source === undefined) {
    warnings.push(`${where}: no "source" — provenance is required for production data`);
  } else {
    const source = entry.source;
    if (source === null || typeof source !== "object") {
      errors.push(`${where}: "source" must be an object`);
    } else {
      if (!isNonEmptyString(source.sourceId) || !isNonEmptyString(source.sourceName)) {
        errors.push(`${where}: "source" needs non-empty sourceId and sourceName`);
      }
    }
  }

  let coerced = false;
  let status = entry.verificationStatus;
  if (status === undefined) {
    status = "draft";
    warnings.push(`${where}: no verificationStatus — imported as "draft"`);
  } else if (!VERIFICATION_STATUSES.has(status)) {
    errors.push(`${where}: unknown verificationStatus "${status}"`);
    status = "draft";
  } else if (status !== "draft" && !options_ref.allowVerified) {
    status = "draft";
    coerced = true;
    warnings.push(
      `${where}: claimed "${entry.verificationStatus}" without human review — coerced to "draft" (pass --allow-verified only after real review)`,
    );
  }

  return { entry, searchKey: expectedKey, derivedKey, coerced, status };
}

// Set after parseArgs so validateEntry can read it without threading params.
const options_ref = { allowVerified: false };

function main() {
  const options = parseArgs(process.argv.slice(2));
  options_ref.allowVerified = options.allowVerified;

  if (options.files.length === 0) {
    console.error(
      "Usage: node scripts/validate-dictionary.mjs [--emit out.json] [--strict] [--allow-verified] <file.json...>",
    );
    process.exit(2);
  }

  const errors = [];
  const warnings = [];
  const seenIds = new Set();
  const canonical = [];
  // searchKey -> entries, for duplicate detection (never merged, only reported).
  const byKey = new Map();
  let derivedCount = 0;
  let coercedCount = 0;

  for (const file of options.files) {
    let raw;
    try {
      raw = readFileSync(file, "utf8");
    } catch {
      errors.push(`${file}: cannot read file`);
      continue;
    }
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      errors.push(`${file}: invalid JSON`);
      continue;
    }
    if (!Array.isArray(parsed)) {
      errors.push(`${file}: top level must be an array of entries`);
      continue;
    }
    let fileErrors = 0;
    parsed.forEach((entry, index) => {
      const before = errors.length;
      const result = validateEntry(entry, `${file}[${index}]`, seenIds, errors, warnings);
      fileErrors += errors.length - before;
      if (result !== null) {
        if (result.derivedKey) derivedCount++;
        if (result.coerced) coercedCount++;
        canonical.push({
          ...result.entry,
          searchKey: result.entry.searchKey ?? result.searchKey,
          verificationStatus: result.status,
        });
        const list = byKey.get(result.searchKey) ?? [];
        list.push({
          file,
          id: result.entry.id,
          word: result.entry.word,
          partOfSpeech: result.entry.partOfSpeech,
        });
        byKey.set(result.searchKey, list);
      }
    });
    console.log(`${file}: ${parsed.length} entries, ${fileErrors} errors`);
  }

  for (const [key, group] of byKey) {
    if (group.length < 2) continue;
    const byPos = new Map();
    for (const item of group) {
      const pos = item.partOfSpeech ?? "(none)";
      const list = byPos.get(pos) ?? [];
      list.push(item);
      byPos.set(pos, list);
    }
    for (const [pos, dupes] of byPos) {
      if (dupes.length < 2) continue;
      const ids = dupes.map((d) => `${d.file}::${d.id}`).join(", ");
      warnings.push(
        `Potential duplicates for "${key}" (${pos}): ${ids} — preserved, needs human review (AGENTS.md §34)`,
      );
    }
  }

  for (const warning of warnings) {
    console.log(`  warning: ${warning}`);
  }

  if (errors.length > 0) {
    console.log(`\n✖ Import blocked: ${errors.length} error(s). Nothing was written.`);
    for (const error of errors) {
      console.log(`  error: ${error}`);
    }
    process.exit(1);
  }

  if (options.emit !== null && options.emit !== undefined) {
    writeFileSync(options.emit, `${JSON.stringify(canonical, null, 2)}\n`, "utf8");
    console.log(
      `\n✔ Wrote ${options.emit} (${canonical.length} entries, ${derivedCount} derived searchKey, ${coercedCount} coerced to draft)`,
    );
  } else {
    console.log(
      `\n✔ Valid (${canonical.length} entries, ${warnings.length} warnings). Pass --emit to write canonical JSON.`,
    );
  }

  if (warnings.length > 0 && options.strict) {
    console.log("Strict mode: warnings fail the import.");
    process.exit(1);
  }
}

main();
