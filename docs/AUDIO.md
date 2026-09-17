# Audio System

## 1. Purpose

The dictionary requires pronunciation for both English and Falam.

The two languages use different pronunciation strategies.

```text
English
  ↓
Text
  ↓
English TTS
  ↓
Audio

Falam
  ↓
Dictionary Entry
  ↓
Native Recording
  ↓
Audio
```

## 2. English TTS

English TTS can use the platform/device speech engine when available.

Keep the implementation behind an audio/TTS service abstraction.

Example:

```ts
speakEnglish(text)
```

Do not assume every device has the same voice or offline voice package.

## 3. Falam Pronunciation

The primary Falam pronunciation method is native-speaker recording.

A native speaker records the word, and the recording is associated with the dictionary entry.

## 4. Recording Format

Possible formats:

- M4A/AAC
- Opus
- MP3

Choose based on Android/iOS support, Expo support, file size, quality, and decoding performance.

Do not use unnecessarily high-quality recordings that dramatically increase storage size.

## 5. Recording Guidelines

Native speakers should record in a quiet environment.

Maintain consistency in:

- microphone distance
- recording environment
- speaking volume
- sample quality
- pronunciation
- file naming

Avoid aggressive noise reduction that damages speech.

## 6. File Naming

Do not use the Falam spelling as the primary filename.

Prefer stable IDs:

```text
000001.m4a
000002.m4a
000003.m4a
```

This avoids Unicode filename and spelling-change problems.

## 7. Audio Metadata

Maintain metadata separately from the actual file.

```ts
{
  id: "000001",
  entryId: "entry_000001",
  speakerId: "speaker_01",
  format: "m4a",
  verified: true
}
```

## 8. Speaker Information

Keep speaker information in project data where appropriate.

The public app does not necessarily need to expose personal speaker information.

Obtain appropriate permission before publishing recordings.

## 9. Copyright and Consent

Native-speaker recordings must have clear permission for their intended use.

Record:

- who created the recording
- who owns the recording
- permission/license
- permitted distribution
- whether commercial use is allowed
- whether modification is allowed

Do not publish recordings without appropriate rights.

## 10. Distribution

For small datasets:

App → Bundled audio

For larger datasets:

App → Audio storage/CDN → Download → Local cache

## 11. Offline Behavior

If audio is cached, play immediately.

If it is not cached and the user is online, download → cache → play.

If it is not cached and the user is offline, clearly show that pronunciation audio is unavailable offline.

## 12. Future Falam TTS

Native recordings should not prevent future TTS.

Native recordings should remain available for words where pronunciation accuracy is especially important.
