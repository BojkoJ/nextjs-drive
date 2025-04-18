import "server-only"

import { int, text, index, singlestoreTableCreator, bigint } from "drizzle-orm/singlestore-core";

export const createTable = singlestoreTableCreator(
  (name) => `bojko_drive_${name}`,
)

export const files_table = createTable("files_table", {
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

export type DB_FileType = typeof files_table.$inferSelect;

export const folders_table = createTable("folders_table", {
  id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
  name: text("name").notNull(),
  parent: bigint("parent", { mode: "number", unsigned: true }),
}, (t) => {
  return [
    // chceme indexovat na parentovi, abychom rychle načetli obsah složky když ji uživatel otevře
    index("parent_index").on(t.parent),
  ]
});

export type DB_FolderType = typeof folders_table.$inferSelect;