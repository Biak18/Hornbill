# Roadmap

## Phase 0 — Research

Before significant coding:

- identify reliable Falam sources
- identify existing Falam dictionaries
- identify native speakers/reviewers
- investigate data licenses
- investigate existing English dictionary datasets
- define initial orthography/data conventions

Deliverable: reliable source inventory.

## Phase 1 — Data Foundation

Create:

- dictionary schema
- source tracking
- verification status
- import format
- validation scripts
- duplicate detection

Initial target: 100–1,000 verified entries, depending on available source material.

## Phase 2 — Dictionary Prototype

Build:

- local dictionary database
- search
- entry details
- favorites
- history
- light/dark/system themes

No unnecessary backend.

## Phase 3 — English Pronunciation

Add English TTS.

Requirements:

- English language selection
- play/pause handling
- graceful failure
- device compatibility testing

## Phase 4 — Falam Native Audio

Start collecting native recordings.

Process:

Select words → Native speaker records → Quality check → Linguistic verification → Associate audio ID → Publish

Do not wait for the entire dictionary to have audio.

## Phase 5 — Audio Distribution

For larger datasets:

- remote audio storage
- downloadable audio
- local cache
- cache management
- offline playback
- optional language/audio packs

## Phase 6 — Data Expansion

Grow the verified dataset:

1K → 10K → 100K → 1M+

At every stage, maintain verification quality.

## Phase 7 — English Dataset Integration

Investigate licensed English resources:

- dictionary APIs
- open lexical databases
- downloadable dictionary datasets
- WordNet-style lexical resources
- Wiktionary-derived datasets
- commercial dictionary APIs

For every source verify:

- license
- attribution
- redistribution
- offline storage
- modification
- commercial use
- API limits

## Phase 8 — Advanced Search

When the dataset becomes large, improve search with:

- SQLite indexes
- full-text search
- prefix search
- normalized search
- relevance ranking
- efficient pagination

Benchmark before optimizing.

## Phase 9 — Community / Reviewer Workflow

Possible future workflow:

User → Suggested correction → Reviewer → Linguistic verification → Production dataset

Users should not directly modify authoritative dictionary data.

## Phase 10 — Falam TTS Research

After the dataset and native recordings are mature:

- investigate available Falam speech models
- investigate TTS research
- evaluate pronunciation quality
- investigate licensing
- investigate on-device inference
- compare generated speech against native recordings

Do not replace native recordings merely because a TTS model exists.

## Phase 11 — Large-Scale Dictionary

Potential long-term scale:

1M+ entries + large pronunciation dataset + native-speaker recordings + high-performance local search

At this stage, revisit database architecture, compression, audio distribution, language packs, indexing, synchronization, storage costs, and update mechanisms.
