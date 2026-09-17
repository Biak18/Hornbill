# Architecture

## 1. Overview

The application should be an offline-first React Native/Expo application.

The architecture should keep dictionary data independent from presentation.

```text
Mobile Application
       │
React Native UI
       │
Search Service
       │
Dictionary Repository
       │
 ┌─────┴─────┐
 │           │
Local DB   Audio Manager
             │
        ┌────┴────┐
        │         │
      Local    Remote
      Audio    Audio
```

## 2. Suggested Layers

UI → Features → Services → Repositories → Local Storage

## 3. UI

React Native components are responsible for:

- rendering
- interaction
- navigation
- accessibility

They should not contain complex dictionary search logic.

## 4. Search Service

Search logic should live outside UI components.

Conceptually:

```ts
searchDictionary(query)
```

Small datasets may use optimized local search. Large datasets should use SQLite indexes/full-text search as needed.

## 5. Local Database

Use a local database when dataset size makes JSON/in-memory storage impractical.

Potential structure:

- entries
- definitions
- examples
- sources
- audio
- favorites
- history

## 6. Favorites

Favorites reference dictionary entry IDs and work offline.

## 7. History

History references entry IDs or searches and is stored locally.

## 8. Audio Architecture

### Falam

Entry → audioId → Local cache? → Play or Download → Cache → Play

### English

English TTS may use the device's TTS engine.

Keep TTS behind an abstraction such as:

```ts
speakEnglish(text)
```

## 9. Audio Storage Strategy

Do not bundle millions of pronunciation recordings in the application package.

Use:

- bundled audio for small/essential collections
- downloadable audio
- local cache

## 10. Future Falam TTS

The architecture should allow Falam TTS to be added later without requiring a complete rewrite.

## 11. Backend

The first version does not require a backend.

A backend may eventually support:

- dictionary updates
- audio distribution
- user contributions
- synchronization
- analytics
- content moderation
- reviewer workflows

The offline dictionary should remain usable even if the backend is unavailable.

## 12. Performance

Avoid:

- loading millions of entries into React state
- scanning huge arrays on every keystroke
- loading all audio files
- rendering huge result lists at once

Use indexed local queries and virtualized lists where necessary.

## 13. Scalability

The architecture should support growth from 10K to 100K to 1M+ entries.

Optimize based on measured requirements rather than premature optimization.
