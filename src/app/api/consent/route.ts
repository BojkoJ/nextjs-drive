import { createHmac } from "node:crypto";
import { z } from "zod";
import { env } from "~/env";
import { logConsent } from "~/server/db/mutations";

const bodySchema = z.object({
  consentId: z.uuid(),
  type: z.enum(["cookies", "privacy"]),
  granted: z.boolean(),
  version: z.string().min(1).max(32),
});

// Za Netlify je skutečná IP klienta v x-nf-client-connection-ip, jinak bereme první hodnotu z x-forwarded-for.
function getClientIp(req: Request) {
  return (
    req.headers.get("x-nf-client-connection-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  // IP neukládáme, jen HMAC s tajným klíčem (pseudonymizace)
  const ipHash = createHmac("sha256", env.CONSENT_HASH_SALT)
    .update(getClientIp(req))
    .digest("hex");

  try {
    await logConsent({
      consentId: parsed.data.consentId,
      type: parsed.data.type,
      granted: parsed.data.granted,
      policyVersion: parsed.data.version,
      ipHash,
    });
  } catch (err) {
    console.error("Failed to log consent:", err);
    return Response.json({ error: "Could not log consent" }, { status: 500 });
  }

  return new Response(null, { status: 204 });
}
