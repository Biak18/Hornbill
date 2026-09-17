// USER-CONTRIBUTED FALAM WORDLIST — DRAFT, UNVERIFIED.
//
// Provenance: provided by the app owner on 2026-09-17 for demo purposes.
// Status: every entry is `verificationStatus: "draft"`. Nothing here has
// native-speaker or lexicographic review. DO NOT mark `reviewed`/`verified`
// and DO NOT ship to production without the verification pass in
// docs/ROADMAP.md (Phase 1: Human Review → Verification).
//
// Fidelity rules applied while structuring the raw wordlist:
// - Original Falam spelling preserved verbatim (pa vs paa, tha vs ṭha kept
//   as separate entries; never merged or "corrected").
// - Lines sharing a headword + part of speech became senses of one entry;
//   distinct POS or clearly distinct meaning clusters stayed separate
//   entries (AGENTS.md §34: preserve, don't auto-merge when uncertain).
// - Example sentences kept exactly as given. Where the source gave no
//   English translation, `english` is left empty — never invented.
// - Compounds without glosses are preserved in entry notes, not as meanings.
//
// DO NOT REPLACE this file with generated "demo" content. Any replacement
// must carry real provenance or remain obviously synthetic (MOCK-* tokens).

import type { DictionaryEntry } from "@/types/dictionary";
import { normalizeSearchKey } from "@/utils/normalize";

const USER_SOURCE = {
  sourceId: "user-contribution-2026-09-17",
  sourceName: "User-contributed Falam wordlist (unverified)",
  reference: "Provided by the app owner on 2026-09-17; draft, unverified",
} as const;

type SenseInput = {
  english: string;
  examples?: { falam: string; english?: string }[];
};

function makeEntry(
  id: string,
  word: string,
  partOfSpeech: DictionaryEntry["partOfSpeech"],
  senses: SenseInput[],
  notes?: string,
): DictionaryEntry {
  return {
    id,
    word,
    searchKey: normalizeSearchKey(word),
    ...(partOfSpeech ? { partOfSpeech } : {}),
    definitions: senses.map((sense, index) => ({
      id: `${id}__sense${index + 1}`,
      english: sense.english,
      ...(sense.examples
        ? {
            examples: sense.examples.map((example) => ({
              falam: example.falam,
              english: example.english ?? "",
            })),
          }
        : {}),
    })),
    ...(notes ? { notes } : {}),
    source: { ...USER_SOURCE },
    verificationStatus: "draft",
  };
}

export const placeholderEntries: DictionaryEntry[] = [
  makeEntry("entry_user_001", "ei", "verb", [
    {
      english: "to eat",
      examples: [{ falam: "Rawl kan ei." }],
    },
    { english: "to take" },
    { english: "to have (food)" },
  ]),
  makeEntry("entry_user_002", "ei", "verb", [
    {
      english: "erode; corrode",
      examples: [{ falam: "Thirleng ke in ka dip a ei tlek thluh." }],
    },
  ]),
  makeEntry("entry_user_003", "nu", "noun", [
    {
      english: "mother",
      examples: [
        {
          falam:
            "Nu cu insang sungih mi pawimawh bik a si. Na nu cu kan nu thawn khukhri-aw an si.",
        },
      ],
    },
    { english: "married woman" },
    { english: "female of the species; fruit bearing tree or plant" },
    { english: "aunty (one calls his/her mother's younger or older sister)" },
    {
      english: "wife (refered by man speaker)",
      examples: [
        {
          falam:
            "Kan nu cu dawr ah a um ringring ko. Nan nu teh ziang a ṭuan ṭheu?",
        },
      ],
    },
    {
      english: "female; feminine gender",
      examples: [{ falam: "Na ar lei mi cu a nū maw a pa saw?" }],
    },
    { english: "coward" },
  ]),
  makeEntry("entry_user_004", "nu", "verb", [{ english: "be womanly" }]),
  makeEntry("entry_user_005", "nu", "adjective", [
    {
      english: "soft",
      examples: [{ falam: "Hi nâm cu nâm nū a si, a har a kawi cingcing." }],
    },
  ]),
  // No part of speech given in the source — left undefined, never guessed.
  makeEntry("entry_user_006", "nu", undefined, [
    {
      english: "Mrs; Ms",
      examples: [{ falam: "Nu Than Thluai in thla a cam pei." }],
    },
  ]),
  makeEntry("entry_user_007", "pa", "adjective", [
    {
      english:
        "(number siar tivek ah) unit (pak, sawm, za = unit, ten, hundred)",
    },
    { english: "male of the species (as in mipa, uipa, rulpa, etc.)" },
    {
      english: "thin",
      examples: [{ falam: "Na hni cu a pâ tuk, thleng lohli aw." }],
    },
  ]),
  makeEntry(
    "entry_user_008",
    "pa",
    "noun",
    [
      {
        english:
          "father; dad; leader of the family; full grown man; full grown male",
      },
      { english: "mushroom" },
      {
        english: "musculine gender; male",
        examples: [{ falam: "Na zukneng kah mi cu a nū maw a pāw saw a si?" }],
      },
      {
        english: "father; uncle (one's father's brothers)",
        examples: [
          {
            falam:
              "Ka pa in i duhdaw zet. Anih le a nau cu pa hmun nu dang an si.",
          },
        ],
      },
      { english: "head; leader" },
      {
        english: "husband",
        examples: [{ falam: "Kan pa cu Malaysia ah a um." }],
      },
      {
        english: "(title) Mr",
        examples: [{ falam: "Pa Thang Lung cu a ra tel thei lo." }],
      },
      { english: "man who have got a child or children" },
    ],
    "Compounds given without glosses: sentlung pa; pa-uithin; pa-leng; pasi; mau pa; pawl pa.",
  ),
  makeEntry("entry_user_009", "pa", "verb", [
    {
      english: "be brave",
      examples: [
        {
          falam: "Na fapa cu a pā tuk lawmmam; si dawh tikah a ṭap lo riai.",
        },
      ],
    },
  ]),
  makeEntry("entry_user_010", "paa", "adjective", [
    { english: "thin; slim; slender; flimsy" },
  ]),
  makeEntry("entry_user_011", "paa", "noun", [
    { english: "mushroom, fungus" },
  ]),
  makeEntry("entry_user_012", "paa", "particle", [
    {
      english: "particle used to convey the meaning of ‘very’, ‘much’",
      examples: [{ falam: "Ka duh paa lo." }, { falam: "Mawi ka ti paa lo." }],
    },
  ]),
  makeEntry("entry_user_013", "tha", "noun", [
    { english: "sinew, muscle, ligament, tendon" },
    { english: "energy, power, strength, force" },
    { english: "tissue, muscle" },
    {
      english: "strength, power, might, energy, vigour",
      examples: [
        {
          falam:
            "A tha a ṭha. A tha a cat. Tha hnih an seng zo. Tha ba a sut, or sam.",
        },
      ],
    },
  ]),
  makeEntry("entry_user_014", "ṭha", "adjective", [
    {
      english:
        "good, well, fine, virtuous, proper, nice, excellent, noble, splendid, high quality, good quality, first class, first rate",
    },
    { english: "good, nice, well" },
  ]),
  makeEntry("entry_user_015", "tidai", "noun", [
    { english: "water, cold water" },
    {
      english: "water, fluid, serum, juice, soup",
      examples: [{ falam: "Tidai ka in, ti khur, tiva, etc." }],
    },
  ]),
  makeEntry("entry_user_016", "rawl", "noun", [
    { english: "food, diet, victuals, meal, fodder, cooked rice, meat" },
    {
      english: "staple food",
      examples: [
        {
          falam:
            "Tuihlan pi le pu pawlih rawl cu kawhhawl le tanṭhe a si.",
        },
      ],
    },
    { english: "cooked rice" },
    {
      english: "voice",
      examples: [
        { falam: "A cau tuk ih a rawl hman a suak thei nawn lo." },
      ],
    },
  ]),
  makeEntry("entry_user_017", "rawl", "verb", [
    {
      english: "hide; runaway",
      examples: [
        { falam: "Anih cu inn tlung loin ram ah a răwl feufeu ringring." },
      ],
    },
  ]),
  makeEntry("entry_user_018", "rawl", "verb", [
    {
      english: "to stiff and sore",
      examples: [
        { falam: "Bawhlung ka lehnak ah ka pheiphawng a răwl thluh." },
      ],
    },
  ]),
  makeEntry("entry_user_019", "rol", "verb", [
    {
      english:
        "to hide oneself, to live alone, to go somewhere for safety, to live in seclusion",
    },
  ]),
  makeEntry("entry_user_020", "rol", "verb", [{ english: "to live alone" }]),
  makeEntry("entry_user_021", "rol", "adjective", [
    { english: "living in seclusion" },
  ]),
  makeEntry("entry_user_022", "biakinn", "noun", [
    {
      english:
        "church, chapel, sanctuary, temple, synagogue, kirk, mosque, cathedral, house of God, place of worship",
    },
    {
      english: "church",
      examples: [
        {
          falam:
            "Biakinn sung na luh veten na phone kha awn lo dingin 'silent mode' ah ret aw.",
        },
      ],
    },
  ]),
  makeEntry("entry_user_023", "naute", "noun", [
    { english: "baby, child, infant, tiny baby, young child" },
    {
      english: "baby",
      examples: [{ falam: "Nan naute cu a va duhnung ngekngi ha." }],
    },
  ]),
  makeEntry("entry_user_024", "mawi", "adjective", [
    {
      english:
        "pretty; good-looking; beautiful; handsome; (esp of a woman) comely; presentable",
    },
    {
      english: "pretty; beautiful",
      examples: [{ falam: "Na papar cu a mawi tuk ual." }],
    },
    { english: "scenic beauty; good looking" },
  ]),
  makeEntry("entry_user_025", "mawi", "verb", [
    {
      english: "make something beatiful",
      examples: [{ falam: "Zuk nan tar mi in nan inn a mawi nasa." }],
    },
  ]),
];
