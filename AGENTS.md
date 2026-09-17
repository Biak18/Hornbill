# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Falam Dictionary — Project Instructions

This file is the primary instruction set for AI coding agents working on this project.

Read this file before making any changes.

For detailed requirements, also read the relevant documents under `docs/`.

---

# 1. Project Overview

This project is a mobile **Falam Chin → English Dictionary** built with React Native and Expo.

The application is intended to provide:

- Falam vocabulary
- English definitions
- Part of speech
- Pronunciation information
- Example sentences
- Related words
- Favorites
- Search history
- English pronunciation
- Falam native-speaker pronunciation recordings
- Offline dictionary access
- Fast dictionary search

The most important part of this project is the **quality and reliability of the Falam linguistic data**.

The application UI and code are important, but incorrect linguistic data is unacceptable.

---

# 2. Read the Documentation

Before implementing a significant feature, read the relevant documentation.

```text
docs/
├── PRD.md
├── DATA.md
├── LINGUISTICS.md
├── ARCHITECTURE.md
├── AUDIO.md
└── ROADMAP.md
```

Use the documents as the source of project requirements.

Do not contradict documented requirements without first explaining why the requirement should change.

---

# 3. Core Development Priority

When making implementation decisions, prioritize requirements in this order:

1. Falam linguistic accuracy
2. Data correctness
3. Data provenance
4. Data verification
5. Search quality
6. Offline functionality
7. Accessibility and usability
8. Performance
9. UI consistency
10. Visual polish and animation

Do not sacrifice linguistic accuracy or data integrity for visual polish.

---

# 4. CRITICAL RULE — NEVER INVENT FALAM DATA

This is the most important project rule.

## Never fabricate Falam linguistic information.

AI must NOT invent:

- Falam words
- Falam translations
- English definitions
- Falam pronunciation
- IPA
- Falam example sentences
- Falam synonyms
- Falam antonyms
- Falam related words
- Falam grammar information
- Falam etymology
- Falam dialect information
- Falam usage information
- native-speaker audio
- claims that a word is commonly used
- claims that a word is standard
- claims about regional usage

If reliable information is unavailable:

```text
Unknown
↓
Leave the field empty or mark it for review
↓
Do NOT invent a value
```

A missing dictionary entry is better than a fabricated dictionary entry.

---

# 5. Falam Language Boundary

The target language is **Falam Chin**.

Do not silently substitute information from:

- Hakha Chin
- Tedim / Zomi
- Mizo
- Burmese
- other Chin languages
- other Kuki-Chin languages
- generic "Chin" sources

Similarity between languages is NOT sufficient evidence that a word has the same meaning or pronunciation in Falam.

If a source contains another language, identify it explicitly.

If the language identity is uncertain:

```text
verificationStatus = "draft"
```

and flag it for human review.

---

# 6. Human Verification

AI is not the final linguistic authority.

Dictionary data should progress through:

```text
draft
  ↓
reviewed
  ↓
verified
```

### draft

Imported or manually collected information that has not been sufficiently reviewed.

### reviewed

A knowledgeable reviewer has examined the entry.

### verified

The entry has sufficient evidence and appropriate linguistic/native-speaker verification for production use.

Do not automatically mark AI-generated or automatically imported data as `verified`.

---

# 7. Data Provenance

Dictionary information should retain its source whenever possible.

Track information such as:

- source name
- source type
- author
- publication/reference
- URL when applicable
- license
- import date
- verification status
- reviewer information when appropriate

Never remove provenance merely because the application does not display it publicly.

Provenance is part of the dataset's integrity.

---

# 8. Copyright and Licensing

Do not assume that publicly accessible dictionary data can automatically be copied into this application.

Before importing external data, determine whether the source permits:

- copying
- modification
- storage
- redistribution
- offline use
- commercial use
- database redistribution
- API caching

When a source has attribution requirements, preserve the required attribution.

If licensing is unclear, flag the source for review instead of assuming permission.

---

# 9. Preserve Original Falam Spelling

The original spelling of a Falam word is important.

Do not silently normalize, rewrite, "correct", or replace the source spelling.

Use separate fields when normalization is required.

For example:

```text
word
  ↓
Original displayed spelling

searchKey
  ↓
Normalized search representation
```

The user-facing dictionary entry should preserve the intended spelling.

Search normalization must not overwrite the original word.

---

# 10. Unicode

Falam text must be treated as Unicode data.

Be careful with:

- diacritics
- combining characters
- punctuation
- apostrophes
- whitespace
- Unicode normalization
- capitalization

Do not assume ASCII-only text.

When implementing search, consider Unicode normalization without changing the displayed source spelling.

---

# 11. Multiple Meanings

A word may have multiple meanings.

Do not combine unrelated meanings into one long definition.

Prefer:

```text
Word
├── Sense 1
│   ├── English definition
│   └── Examples
│
├── Sense 2
│   ├── English definition
│   └── Examples
│
└── Sense 3
    ├── English definition
    └── Examples
```

Each sense should remain distinguishable.

---

# 12. Example Sentences

Example sentences must be evidence-based.

Do not invent Falam example sentences and present them as authentic language.

Examples should preferably come from:

- reliable linguistic sources
- verified dictionary sources
- native speakers
- reviewed corpus material
- manually verified contributors

If an example has not been verified, mark it appropriately.

---

# 13. Pronunciation

Pronunciation must be based on reliable evidence.

Do not generate pronunciation information merely because a word "looks like" another word.

For Falam pronunciation:

- Prefer native-speaker recordings.
- Keep the recording associated with the exact dictionary entry.
- Verify that the recording corresponds to the correct spelling and meaning.
- Support legitimate pronunciation variants where necessary.

For English pronunciation, platform/device TTS may be used.

Keep English TTS behind an abstraction so it can be replaced later.

Example:

```ts
speakEnglish(text);
```

Do not couple dictionary components directly to a specific TTS implementation.

---

# 14. Falam Audio

Falam pronunciation should initially use **native-speaker recordings** rather than assuming that an operating-system TTS engine supports Falam correctly.

Audio should use stable identifiers.

Prefer:

```text
audio/
└── falam/
    ├── 000001.m4a
    ├── 000002.m4a
    └── 000003.m4a
```

Do not use the raw Falam word as the primary filename.

Example:

```ts
{
  id: "000001",
  entryId: "entry_000001"
}
```

The audio system must be designed so that millions of audio files are not bundled into the application package.

Use local caching and remote/on-demand distribution for large datasets.

---

# 15. Native Speaker Recordings and Consent

Native-speaker recordings must have appropriate permission.

Before distributing a recording, establish that the project has permission to use it.

Keep relevant recording metadata separately from the public dictionary entry when appropriate.

Do not expose unnecessary personal information about speakers.

---

# 16. Product Philosophy

This is a **dictionary first** application.

Do not turn it into a generic AI translator.

The core experience is:

```text
Open app
   ↓
Search Falam word
   ↓
Find dictionary entry
   ↓
Read English meaning
   ↓
Listen to pronunciation
   ↓
Review examples / related words
   ↓
Favorite if useful
```

The dictionary dataset is the core product.

---

# 17. UI/UX Direction

The UI should be **inspired by the UX philosophy of Papago by NAVER**, while remaining an original design.

Use the following principles:

- language-first
- clean
- minimal
- spacious
- friendly
- fast
- readable
- low visual noise
- obvious primary actions
- strong typography hierarchy
- simple navigation

The application should feel like a modern language tool rather than a traditional dense dictionary.

## Do NOT clone Papago.

Do not copy:

- Papago logo
- NAVER branding
- Papago mascot
- proprietary assets
- exact branded colors
- exact screen layouts
- exact component designs
- exact proprietary illustrations

Use the interaction philosophy as inspiration and create an original visual identity for the Falam Dictionary.

---

# 18. Primary UI

The main screen should prioritize dictionary search.

The primary language direction is:

```text
Falam → English
```

The main screen should make it immediately obvious:

- what language is being searched
- where the user should type
- how to search
- what recent/results information is available

Keep the search experience simple.

---

# 19. Dictionary Entry UI

A dictionary entry should prioritize the word itself.

Recommended information hierarchy:

```text
Falam Word
    ↓
Pronunciation
    ↓
Part of Speech
    ↓
English Meaning(s)
    ↓
Example(s)
    ↓
Related Words
    ↓
Audio / Favorite
```

Do not overcrowd the screen.

Information should be progressively organized rather than displayed as one giant block.

---

# 20. React Native / Expo

Use:

- React Native
- Expo
- TypeScript
- Expo Router where appropriate
- modern React patterns
- appropriate Expo APIs
- `StyleSheet.create`

Prefer maintainable React Native code over unnecessary abstractions.

Do not introduce a library merely because it is popular.

Every dependency should have a clear purpose.

---

# 21. Styling

Prefer:

```ts
StyleSheet.create(...)
```

over utility-class styling systems unless there is a documented project reason to do otherwise.

Keep visual tokens centralized where practical:

```text
colors
spacing
radius
typography
shadows
```

Avoid scattering arbitrary values throughout components.

Maintain consistency across:

- spacing
- typography
- borders
- radii
- buttons
- cards
- inputs
- icons
- states

---

# 22. Dark Mode

Support:

- light mode
- dark mode
- system preference where appropriate

Do not hardcode colors directly into every component.

Use theme tokens.

---

# 23. Offline First

The dictionary's core functionality should work without an internet connection.

The architecture should allow:

```text
UI
 ↓
Dictionary Repository
 ↓
Local Database
```

The app should not require an API request for every dictionary lookup.

Internet connectivity may later be used for:

- dataset updates
- audio downloads
- contributions
- synchronization
- optional analytics
- future services

But the core dictionary experience should remain usable offline.

---

# 24. Do Not Load Huge Datasets Into React State

The project may eventually contain a very large dictionary.

Do NOT design the application around:

```ts
const [allWords, setAllWords] = useState(...)
```

for millions of entries.

Do not:

- load the entire dictionary into memory
- scan millions of entries on every keystroke
- render thousands of dictionary entries at once
- load all pronunciation audio
- keep the entire dataset in Zustand

Use an appropriate local database and indexed queries.

---

# 25. Search

Search quality is a core feature.

Consider:

- exact match
- prefix match
- partial match where appropriate
- normalized search
- case handling
- Unicode normalization
- relevance ranking
- pagination
- indexed queries
- fast local lookup

Search logic must live outside UI components.

Prefer:

```text
UI
 ↓
Search Service
 ↓
Dictionary Repository
 ↓
Local Database
```

rather than putting database queries directly inside screens.

---

# 26. State Management

Use state management only where it provides clear value.

Potential global state:

- favorites
- history
- settings
- theme/preferences

Do not use global state as a replacement for the dictionary database.

Dictionary data belongs in the repository/database layer.

---

# 27. Audio Architecture

Use an abstraction between the UI and audio implementation.

Example:

```text
Dictionary Entry
      ↓
Audio Manager
      ↓
Check local cache
   ┌──┴──┐
 found  missing
   ↓       ↓
 play   download
           ↓
         cache
           ↓
          play
```

Do not make UI components responsible for:

- downloading audio
- caching audio
- constructing storage URLs
- managing audio files

---

# 28. Scalability

The application should be capable of growing from:

```text
100 entries
    ↓
1,000
    ↓
10,000
    ↓
100,000
    ↓
1,000,000+
```

Do not prematurely optimize for 10 million entries.

However, do not create an architecture that makes large datasets impossible.

Build simple first, but keep the data/repository boundary clean.

---

# 29. Backend

A backend is not automatically required for V1.

Do not add:

- Supabase
- authentication
- realtime
- server APIs
- cloud functions

unless a concrete requirement needs them.

A future backend may support:

- dictionary updates
- audio distribution
- reviewer workflows
- contributions
- synchronization
- moderation
- analytics

The initial application should avoid unnecessary backend complexity.

---

# 30. File and Folder Organization

Keep responsibilities separated.

A reasonable structure is:

```text
app/
├── (tabs)/
├── entry/
└── ...

src/
├── components/
├── features/
│   ├── search/
│   ├── dictionary/
│   ├── favorites/
│   ├── history/
│   └── audio/
├── services/
├── repositories/
├── database/
├── hooks/
├── stores/
├── types/
├── constants/
└── utils/

assets/
└── audio/

docs/
```

Adjust this structure when the project grows, but preserve clear separation of responsibilities.

---

# 31. Data and UI Separation

Dictionary data must not be hardcoded throughout UI components.

Avoid:

```tsx
<Text>Some Falam word</Text>
```

for production dictionary content.

Instead:

```text
Database
   ↓
Repository
   ↓
Feature
   ↓
Screen
   ↓
Component
```

This makes it possible to update and expand the dictionary without rewriting UI code.

---

# 32. AI Usage

AI may assist with:

- code generation
- refactoring
- schema design
- data transformation
- formatting
- deduplication assistance
- import tooling
- validation tooling
- documentation
- test generation
- search implementation
- UI implementation

AI must NOT be treated as the linguistic authority.

Especially:

```text
AI-generated Falam information
        ≠
Verified Falam information
```

Any uncertain linguistic output must be flagged for review.

---

# 33. Data Import Pipeline

Prefer this workflow:

```text
Source
  ↓
Raw Import
  ↓
Parsing
  ↓
Normalization
  ↓
Deduplication
  ↓
Human Review
  ↓
Verification
  ↓
Production Dataset
```

Do not directly insert unverified external data into the production dictionary.

---

# 34. Duplicate Entries

Do not automatically merge entries merely because their spelling looks similar.

Potential duplicates may represent:

- multiple meanings
- grammatical differences
- dialect variants
- spelling variants
- different sources
- genuinely different words

When uncertain, preserve the records and flag them for human review.

---

# 35. Testing

Test important dictionary behavior, especially:

- exact search
- prefix search
- Unicode handling
- empty search
- no results
- duplicate results
- multiple meanings
- favorites
- history
- offline access
- audio lookup
- audio cache
- theme switching
- large dataset queries

Do not only test whether screens render.

---

# 36. Performance

Avoid unnecessary:

- re-renders
- database queries
- network requests
- audio downloads
- state updates
- large list renders

Use appropriate list virtualization for large result sets.

Measure performance before introducing complex optimizations.

---

# 37. Accessibility

The application should support:

- readable text sizes
- sufficient contrast
- accessible touch targets
- screen-reader labels where appropriate
- clear audio controls
- meaningful button labels
- understandable empty/error states

Do not rely solely on icons to communicate important actions.

---

# 38. Error Handling

Errors should be explicit and recoverable.

Examples:

```text
No dictionary result
Audio unavailable
Audio download failed
Database unavailable
Invalid imported data
Unverified entry
```

Do not silently convert errors into fabricated content.

---

# 39. Implementation Order

Prefer this development sequence:

```text
1. Research Falam sources
        ↓
2. Define data model
        ↓
3. Establish source/provenance system
        ↓
4. Build initial verified dataset
        ↓
5. Build local database
        ↓
6. Build dictionary repository
        ↓
7. Build search
        ↓
8. Build dictionary entry screen
        ↓
9. Build favorites/history
        ↓
10. Add English TTS
        ↓
11. Add Falam native audio
        ↓
12. Add audio caching/distribution
        ↓
13. Expand dataset
        ↓
14. Improve search
        ↓
15. Polish UI
```

Do not reverse this priority merely because UI work is easier to demonstrate.

---

# 40. Before Making Changes

Before implementing a significant feature:

1. Read `AGENTS.md`.
2. Read the relevant documentation under `docs/`.
3. Inspect the existing project structure.
4. Reuse existing patterns where appropriate.
5. Avoid introducing unnecessary dependencies.
6. Consider offline behavior.
7. Consider data integrity.
8. Consider future dataset scale.

---

# 41. Before Adding a New Dependency

Ask:

- Is this actually necessary?
- Does Expo/React Native already provide the functionality?
- Does the project already have a suitable dependency?
- Does the dependency support the current Expo SDK?
- Does it work offline if required?
- Does it introduce unnecessary native complexity?

Prefer fewer dependencies when the built-in platform APIs are sufficient.

---

# 42. Definition of Done

A feature is not complete merely because the UI appears.

Consider it complete only when appropriate:

- functionality works
- TypeScript types are correct
- offline behavior is considered
- loading states exist
- empty states exist
- errors are handled
- accessibility is considered
- tests are updated where appropriate
- no unnecessary dependency was introduced
- dictionary data is not fabricated
- source/provenance is preserved
- documentation is updated when architecture or requirements change

---

# 43. Golden Rule

When uncertain about Falam linguistic information:

**STOP AND FLAG IT FOR REVIEW.**

Do not guess.

When uncertain about architecture:

**Prefer the simplest solution that preserves the project's long-term data integrity and scalability.**

The fundamental principle of this project is:

```text
Collect
   ↓
Structure
   ↓
Verify
   ↓
Clean
   ↓
Store
   ↓
Search
   ↓
Pronounce
   ↓
Present
```

The dictionary data comes first.

The application exists to make that data useful.
