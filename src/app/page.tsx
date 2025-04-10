import DriveContent from "~/components/drive-content";
import { db } from "~/server/db";
import {
  files_table as filesSchema,
  folders_table as foldersSchema,
} from "~/server/db/schema";

export default function GoogleDriveClone() {
  //const files = await db.select().from(filesSchema);
  //const folders = await db.select().from(foldersSchema);

  //return <DriveContent files={files} folders={folders} />;

  return <div className="">Homepage</div>;
}
