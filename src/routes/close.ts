import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { closeCurrentRound } from "@/db/queries";
import { authMiddleware } from "@/lib/auth-middleware";

export const Route = createFileRoute("/close")({
  server: {
    middleware: [authMiddleware],
    handlers: {
      POST: async () => {
        try {
          const closedRound = await closeCurrentRound();
          if (!closedRound) {
            return json(undefined, { status: 204 });
          }
          return json({ success: true, round: closedRound }, { status: 200 });
        } catch (error) {
          console.error("Error closing round:", error);

          return json({ error: "Failed to close round" }, { status: 500 });
        }
      },
    },
  },
});
