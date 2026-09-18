// Shared repository instance (module scope, created once).
// expo-sqlite implementation over the local database (docs/ARCHITECTURE.md
// §5, AGENTS.md §23-24). The in-memory implementation remains for tests.
// The database seeds from the user-contributed DRAFT wordlist until Phase 1
// verified imports replace the seed (see src/database/database.ts).

import { db } from "@/database/database";
import { createSqliteDictionaryRepository } from "./sqlite-repository";

export const dictionaryRepository = createSqliteDictionaryRepository(db);
