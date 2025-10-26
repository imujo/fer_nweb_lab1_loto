import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentRound, getDrawResults } from "@/db/queries";
import { useAuth0 } from "@auth0/auth0-react";
import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/")({
  component: HomePage,
  loader: async () => {
    const currentRound = await getCurrentRound();
    let drawResults = null;

    if (currentRound) {
      drawResults = await getDrawResults(currentRound.id);
    }

    return { currentRound, drawResults };
  },
});

function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const { currentRound, drawResults } = Route.useLoaderData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-gray-900">
                Loto App
              </CardTitle>
            </div>
            <div className="flex space-x-4">
              {currentRound?.isActive ? (
                <Button onClick={() => (window.location.href = "/buy-ticket")}>
                  Buy Ticket
                </Button>
              ) : (
                <Button disabled>Buy Ticket</Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isAuthenticated && user ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    Current Round Status
                    {currentRound ? (
                      currentRound.isActive ? (
                        <Badge variant="default" className="bg-green-500">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Closed</Badge>
                      )
                    ) : (
                      <Badge variant="outline">No Round</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {currentRound
                      ? `Round #${currentRound.roundNumber}`
                      : "No round has been created yet"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentRound ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Status:{" "}
                        {currentRound.isActive ? (
                          <Badge variant="default" className="bg-green-500">
                            Active - Tickets Available
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Closed</Badge>
                        )}
                      </p>
                      {currentRound.createdAt && (
                        <p className="text-sm text-gray-600">
                          Created:{" "}
                          {new Date(currentRound.createdAt).toLocaleString()}
                        </p>
                      )}
                      {currentRound.closedAt && (
                        <p className="text-sm text-gray-600">
                          Closed:{" "}
                          {new Date(currentRound.closedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      No active round. Please wait for the next round to start.
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : null}

            {/* Draw Results Section */}
            {isAuthenticated &&
              user &&
              !currentRound?.isActive &&
              drawResults && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Latest Draw Results
                    </CardTitle>
                    <CardDescription>
                      Winning numbers for this round
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-800 mb-2">
                        Drawn Numbers:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {JSON.parse(drawResults.numbers || "[]").map(
                          (num: number, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-lg px-3 py-1 bg-blue-100 border-blue-300"
                            >
                              {num}
                            </Badge>
                          )
                        )}
                      </div>
                      {drawResults.drawnAt && (
                        <p className="text-xs text-blue-600 mt-2">
                          Drawn on:{" "}
                          {new Date(drawResults.drawnAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

            {!isAuthenticated && (
              <div className="text-center space-y-4">
                <h2 className="text-xl font-semibold text-gray-700">
                  Welcome to Loto App
                </h2>
                <p className="text-gray-600">
                  Please log in to start playing the lottery!
                </p>
                <Alert>
                  <AlertDescription>
                    You need to be logged in to purchase lottery tickets and
                    view your results.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
