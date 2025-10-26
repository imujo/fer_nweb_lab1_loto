import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import {
  storeDrawResults,
  getCurrentRound,
  getDrawResults,
} from "@/db/queries";
import { authMiddleware } from "@/lib/auth-middleware";
import { storeResultsSchema } from "@/lib/validations";

export const Route = createFileRoute("/api/store-results")({
  server: {
    middleware: [authMiddleware],
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();

          const validationResult = storeResultsSchema.safeParse(body);
          if (!validationResult.success) {
            return json(
              {
                error: "Validation failed",
                details: validationResult.error.issues,
              },
              { status: 400 }
            );
          }

          const { numbers } = validationResult.data;

          const currentRound = await getCurrentRound();
          if (!currentRound || currentRound.isActive) {
            return json(
              {
                error:
                  "Cannot store results while round is active or no round exists",
              },
              { status: 400 }
            );
          }

          const existingResults = await getDrawResults(currentRound.id);
          if (existingResults) {
            return json(
              { error: "Results already exist for this round" },
              { status: 400 }
            );
          }

          const draw = await storeDrawResults(currentRound.id, numbers);
          return json({ success: true, draw }, { status: 201 });
        } catch (error) {
          console.error("Error storing draw results:", error);
          return json(
            { error: "Failed to store draw results" },
            { status: 500 }
          );
        }
      },
    },
  },
});
