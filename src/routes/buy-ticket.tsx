import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTicket, getCurrentRound } from "@/db/queries";
import { useAuth0 } from "@auth0/auth0-react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { generateQRCode } from "@/lib/qr-code";

export const Route = createFileRoute("/buy-ticket")({
  component: BuyTicketPage,
  loader: async () => {
    const currentRound = await getCurrentRound();
    return { currentRound };
  },
});

function BuyTicketPage() {
  const { user, isAuthenticated, isLoading: isLoadingAuth0 } = useAuth0();
  const navigate = useNavigate();
  const { currentRound } = Route.useLoaderData();

  const [personalId, setPersonalId] = useState("");
  const [numbers, setNumbers] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);

  if (!isLoadingAuth0 && (!isAuthenticated || !user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to purchase tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: "/" })}>Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentRound || !currentRound.isActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>No Active Round</CardTitle>
            <CardDescription>
              Tickets are not available at the moment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Please wait for the next round to start.
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate({ to: "/" })} className="mt-4">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const numberArray = numbers
        .split(",")
        .map((n) => n.trim())
        .filter((n) => n !== "")
        .map((n) => parseInt(n));
      if (personalId.trim().length === 0) {
        setError("Personal ID is required");
        setIsLoading(false);
        return;
      }

      if (personalId.length > 20) {
        setError("Personal ID must be 20 characters or less");
        setIsLoading(false);
        return;
      }

      if (numberArray.length < 6 || numberArray.length > 10) {
        setError("You must select between 6 and 10 numbers");
        setIsLoading(false);
        return;
      }
      const uniqueNumbers = new Set(numberArray);
      if (uniqueNumbers.size !== numberArray.length) {
        setError("All numbers must be unique");
        setIsLoading(false);
        return;
      }

      for (const num of numberArray) {
        if (isNaN(num) || num < 1 || num > 45) {
          setError("All numbers must be between 1 and 45");
          setIsLoading(false);
          return;
        }
      }

      const result = await createTicket({
        data: {
          personalId: personalId.trim(),
          numbers: numberArray,
          roundId: currentRound.id,
        },
      });

      if (result) {
        setTicketId(result.id);
        setSuccess(true);
        setPersonalId("");
        setNumbers("");

        try {
          const qrResult = await generateQRCode({
            data: { ticketId: result.id },
          });
          if (qrResult && qrResult.qrCode) {
            setQrCode(qrResult.qrCode);
          }
        } catch (qrError) {
          console.error("Error generating QR code:", qrError);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-green-600 text-center">
              Success!
            </CardTitle>
            <CardDescription className="text-center">
              Your ticket has been purchased
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {qrCode && (
              <div className="flex flex-col items-center space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-center">
                      Your Ticket QR Code
                    </CardTitle>
                    <CardDescription className="text-center">
                      Scan this QR code to view your ticket details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <img
                      src={qrCode}
                      alt="Ticket QR Code"
                      className="border-4 border-gray-300 rounded-lg p-4 bg-white shadow-lg"
                      style={{ maxWidth: "300px", width: "100%" }}
                    />
                    {ticketId && (
                      <p className="text-sm text-gray-500 mt-4">
                        Ticket ID: {ticketId.substring(0, 8)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <Button onClick={() => navigate({ to: "/" })}>Go to Home</Button>
              <Button variant="outline" onClick={() => setSuccess(false)}>
                Buy Another Ticket
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Buy Lottery Ticket
            </CardTitle>
            <CardDescription>
              Round #{currentRound.roundNumber} - Enter your numbers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="personalId">
                  Personal ID (OIB or Passport Number)
                </Label>
                <Input
                  id="personalId"
                  type="text"
                  value={personalId}
                  onChange={(e) => setPersonalId(e.target.value)}
                  placeholder="Enter your personal ID"
                  maxLength={20}
                  required
                />
                <p className="text-sm text-gray-500">Maximum 20 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numbers">
                  Numbers (6-10 numbers, comma-separated, 1-45)
                </Label>
                <Input
                  id="numbers"
                  type="text"
                  value={numbers}
                  onChange={(e) => setNumbers(e.target.value)}
                  placeholder="e.g., 1, 5, 12, 23, 31, 42"
                  required
                />
                <p className="text-sm text-gray-500">
                  Enter 6 to 10 numbers between 1 and 45, separated by commas
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex space-x-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Processing..." : "Buy Ticket"}
                </Button>
                <Link to="/">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
