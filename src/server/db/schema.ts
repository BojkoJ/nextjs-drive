import { int, text, singlestoreTable } from "drizzle-orm/singlestore-core";

export const users = singlestoreTable("users_table", {
  id: int("id").primaryKey().autoincrement(),
  name: text("name").notNull(),
  age: int("age"),
});
