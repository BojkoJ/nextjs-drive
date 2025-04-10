import { int, text, singlestoreTable, index, singlestoreTableCreator, bigint } from "drizzle-orm/singlestore-core";

export const createTable = singlestoreTableCreator(
  (name) => `bojko_drive_${name}`,
)

export const files = createTable("files_table", {
  id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
  name: text("name").notNull(),
  size: int("size").notNull(),
  url: text("url").notNull(),
  parent: bigint("parent", { mode: "number", unsigned: true }).notNull(),
}, (t) => {
  return [
    // chceme indexovat na parentovi, abychom rychle načetli obsah složky když ji uživatel otevře
    index("parent_index").on(t.parent),
  ]
});

export type DB_FileType = typeof files.$inferSelect;

export const folders = createTable("folders_table", {
  id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
  name: text("name").notNull(),
  parent: bigint("parent", { mode: "number", unsigned: true }),
}, (t) => {
  return [
    // chceme indexovat na parentovi, abychom rychle načetli obsah složky když ji uživatel otevře
    index("parent_index").on(t.parent),
  ]
});

export type DB_FolderType = typeof folders.$inferSelect;