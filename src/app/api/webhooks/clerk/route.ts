import { type NextRequest } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { env } from "~/env";
import { deleteAllUserData } from "~/server/db/mutations";

// Clerk webhook (Dashboard → Webhooks → endpoint https://<doména>/api/webhooks/clerk, událost "user.deleted").
// Zajišťuje právo na výmaz: smazáním účtu zmizí i všechny soubory a složky uživatele (čl. 17 GDPR).
export async function POST(req: NextRequest) {
  if (!env.CLERK_WEBHOOK_SIGNING_SECRET) {
    return Response.json(
      { error: "Webhook is not configured" },
      { status: 503 },
    );
  }

  let event: Awaited<ReturnType<typeof verifyWebhook>>;
  try {
    event = await verifyWebhook(req, {
      signingSecret: env.CLERK_WEBHOOK_SIGNING_SECRET,
    });
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "user.deleted" && event.data.id) {
    try {
      await deleteAllUserData(event.data.id);
    } catch (err) {
      // 500 → Clerk (Svix) webhook zopakuje, mazání je idempotentní
      console.error("Failed to erase user data:", err);
      return Response.json({ error: "Erasure failed" }, { status: 500 });
    }
  }

  return new Response(null, { status: 204 });
}
