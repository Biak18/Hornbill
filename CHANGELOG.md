# Changelog

All notable changes to the Falam Dictionary app are documented here.
Entries aggregate conventional commits; every bullet must be verifiable
from `git log`.

## Unreleased

- English device-voice pronunciation per meaning (expo-speech), with engine
  fallback, silence watchdog, and TTS-engine guidance.
- Falam recordings via AudioManager: bundled, cached, explicit tap-to-download
  from the v-audio-1 release, honest offline states.
- Offline banner, database-unavailable fallback screen, search pagination.
- History grouped by day with view times; favorites and recents show times.
- Dictionary import validator (`npm run validate:dictionary`) and test suites
  (`npm test`: vitest; `npm run typecheck`; `npm run lint`).

## 1.0.0

- Initial offline-first Falam → English dictionary demo: local SQLite
  dictionary, bidirectional search, entry detail, wordbook, history,
  light/dark/system themes, 25-draft-entry demo wordlist.
