// Shared repository instance (module scope, created once).
// Seeded with synthetic placeholders; the expo-sqlite implementation will
// replace `createInMemoryDictionaryRepository` here without touching callers.

import { placeholderEntries } from "@/mocks/placeholderEntries";
import { createInMemoryDictionaryRepository } from "./dictionary-repository";

export const dictionaryRepository =
  createInMemoryDictionaryRepository(placeholderEntries);
