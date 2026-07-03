import { auth } from "@clerk/nextjs/server";
import { GetUserStorageUsage } from "~/server/db/queries";
import { DRIVE_LIMIT_BYTES, DRIVE_LIMIT_MB } from "~/lib/storage-limit";

export async function StorageMeter() {
  const session = await auth();
  if (!session.userId) return null;

  const usedBytes = await GetUserStorageUsage(session.userId);
  const usedMB = usedBytes / (1024 * 1024);
  const remainingMB = Math.max(0, DRIVE_LIMIT_MB - usedMB);
  const usedPercent = Math.min(100, (usedBytes / DRIVE_LIMIT_BYTES) * 100);
  const isNearLimit = usedPercent >= 90;

  return (
    <div className="hidden w-40 flex-col gap-1.5 sm:flex">
      <span className="font-mono text-[0.6875rem] tracking-wide text-muted-foreground">
        <span className="font-bold text-foreground">
          {remainingMB.toFixed(2)}
        </span>{" "}
        of {DRIVE_LIMIT_MB}MB free
      </span>
      <div className="h-1.5 w-full overflow-hidden border border-border bg-muted">
        <div
          className={`h-full transition-[width] duration-300 ${isNearLimit ? "bg-destructive" : "bg-primary"}`}
          style={{ width: `${usedPercent}%` }}
        />
      </div>
    </div>
  );
}
