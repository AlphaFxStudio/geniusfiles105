import { createFileRoute } from "@tanstack/react-router";

/**
 * Référence temporelle du serveur, utilisée par le système de quotas.
 *
 * Aucune donnée n'est reçue, stockée ni renvoyée en dehors de l'heure
 * courante : ce point d'entrée est volontairement anonyme et sans état.
 */
export const Route = createFileRoute("/api/public/time")({
  server: {
    handlers: {
      GET: () =>
        new Response(JSON.stringify({ now: Date.now() }), {
          headers: {
            "content-type": "application/json",
            "cache-control": "no-store",
          },
        }),
    },
  },
});
