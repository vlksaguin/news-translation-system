export const DIALECTS = [
  { code: "tl", label: "Tagalog" },
  { code: "ceb", label: "Cebuano" },
  { code: "ilo", label: "Ilocano" },
  { code: "hil", label: "Hiligaynon" },
  { code: "war", label: "Waray" },
  { code: "pam", label: "Kapampangan" },
];

export const DIALECT_CODE_TO_LABEL = Object.fromEntries(
  DIALECTS.map((dialect) => [dialect.code, dialect.label])
);
