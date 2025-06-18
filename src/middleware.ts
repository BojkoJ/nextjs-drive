import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Přeskočíme Next.js interní routy a všechny statické soubory, pokud nejsou v search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Vždy spustíme pro všechny API routy
    "/(api|trpc)(.*)",
  ],
};
