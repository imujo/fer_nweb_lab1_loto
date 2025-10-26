import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { createNewRound } from "@/db/queries";
import { authMiddleware } from "@/lib/auth-middleware";

export const Route = createFileRoute("/api/new-round")({
  server: {
    middleware: [authMiddleware],
    handlers: {
      POST: async () => {
        try {
          const newRound = await createNewRound();
          if (!newRound) {
            return json(undefined, { status: 204 });
          }

          return json({ success: true, round: newRound }, { status: 201 });
        } catch (error) {
          console.error("Error creating new round:", error);
          return json({ error: "Failed to create new round" }, { status: 500 });
        }
      },
    },
  },
});
