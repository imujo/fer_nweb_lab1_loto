import { createFileRoute } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import { getTicketById, getDrawResults } from "@/db/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DrawResults } from "@/components/DrawResults";

export const Route = createFileRoute("/ticket/$ticketId")({
  component: TicketDisplayPage,
  loader: async ({ params }) => {
    const ticket = await getTicketById(params.ticketId);
    if (!ticket) {
      return { ticket: null, drawResults: null };
    }

    const drawResults = await getDrawResults(ticket.roundId);
    return { ticket, drawResults };
  },
});

function TicketDisplayPage() {
  const { ticket, drawResults } = Route.useLoaderData();
  const params = useParams({ from: "/ticket/$ticketId" });

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Ticket Not Found</CardTitle>
            <CardDescription>
              The ticket you're looking for doesn't exist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                No ticket found with ID: {params.ticketId}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ticketNumbers = JSON.parse(ticket.numbers || "[]");
  const drawnNumbers = drawResults
    ? JSON.parse(drawResults.numbers || "[]")
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Lottery Ticket
            </CardTitle>
            <CardDescription>
              View your ticket details and results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Ticket Information</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Ticket ID:</strong> {ticket.id}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Personal ID:</strong> {ticket.personalId}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Created:</strong>{" "}
                  {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Your Numbers</h3>
              <div className="flex flex-wrap gap-2">
                {ticketNumbers.map((num: number, index: number) => (
                  <Badge
                    key={index}
                    variant="default"
                    className="text-lg px-3 py-1"
                  >
                    {num}
                  </Badge>
                ))}
              </div>
            </div>

            <DrawResults
              ticketNumbers={ticketNumbers}
              drawnNumbers={drawnNumbers || []}
              drawnAt={drawResults?.drawnAt}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
