import {
  int,
  text,
  index,
  singlestoreTableCreator,
  bigint,
  timestamp,
  varchar,
} from "drizzle-orm/singlestore-core";

export const createTable = singlestoreTableCreator(
  (name) => `bojko-drive-${name}`,
);

export const files_table = createTable(
  "files_table",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement(),
    ownerId: text("owner_id").notNull(),
    name: text("name").notNull(),
    size: int("size").notNull(),
    url: text("url").notNull(),
    parent: bigint("parent", { mode: "number", unsigned: true }).notNull(),
    order: int("order").notNull().default(0),
    created_at: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => {
    return [
      // chceme indexovat na parentovi, abychom rychle načetli obsah složky když ji uživatel otevře
      index("parent_index").on(t.parent),
      // dále indexujeme na ownerId, abychom rychle načetli všechny soubory uživatele
      index("owner_index").on(t.ownerId),
    ];
  },
);

export type DB_FileType = typeof files_table.$inferSelect;

export const folders_table = createTable(
  "folders_table",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement(),
    ownerId: text("owner_id").notNull(),
    name: text("name").notNull(),
    parent: bigint("parent", { mode: "number", unsigned: true }),
    order: int("order").notNull().default(0),
    created_at: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => {
    return [
      // chceme indexovat na parentovi, abychom rychle načetli obsah složky když ji uživatel otevře
      index("parent_index").on(t.parent),
      // dále indexujeme na ownerId, abychom rychle načetli všechny složky uživatele
      index("owner_index").on(t.ownerId),
    ];
  },
);

export type DB_FolderType = typeof folders_table.$inferSelect;

// Anonymní log souhlasů – důkaz "předem prokazatelného souhlasu" (§ 89 odst. 3 zákona č. 127/2005 Sb., čl. 7(1) GDPR).
// Neobsahuje žádné ID uživatele ani IP, jen náhodné consentId z prohlížeče a solený hash IP.
export const consent_log_table = createTable(
  "consent_log_table",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement(),
    consentId: varchar("consent_id", { length: 36 }).notNull(),
    type: varchar("type", { length: 16 }).notNull(), // "cookies" | "privacy"
    granted: int("granted").notNull(), // 1 = souhlas, 0 = odmítnutí / odvolání
    policyVersion: varchar("policy_version", { length: 32 }).notNull(),
    ipHash: varchar("ip_hash", { length: 64 }).notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => {
    return [
      // dohledání všech záznamů jednoho prohlížeče
      index("consent_id_index").on(t.consentId),
      // mazání starých záznamů
      index("created_at_index").on(t.created_at),
    ];
  },
);
