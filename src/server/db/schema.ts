import {
  int,
  text,
  index,
  singlestoreTableCreator,
  bigint,
  timestamp,
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
