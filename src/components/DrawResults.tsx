import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface DrawResultsProps {
  ticketNumbers: number[];
  drawnNumbers: number[];
  drawnAt?: Date;
}

export function DrawResults({
  ticketNumbers,
  drawnNumbers,
  drawnAt,
}: DrawResultsProps) {
  if (!drawnNumbers || drawnNumbers.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          Draw results are not available yet. Please check back later.
        </AlertDescription>
      </Alert>
    );
  }

  const matchedNumbers = ticketNumbers.filter((n) => drawnNumbers.includes(n));
  const matchedCount = matchedNumbers.length;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Draw Results</h3>
      <div className="space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-800 mb-2">
            Drawn Numbers:
          </p>
          <div className="flex flex-wrap gap-2">
            {drawnNumbers.map((num: number, index: number) => (
              <Badge
                key={index}
                variant="outline"
                className="text-lg px-3 py-1 bg-blue-100 border-blue-300"
              >
                {num}
              </Badge>
            ))}
          </div>
          {drawnAt && (
            <p className="text-xs text-blue-600 mt-2">
              Drawn on: {new Date(drawnAt).toLocaleString()}
            </p>
          )}
        </div>

        <Alert>
          <AlertDescription className="space-y-2">
            <p className="font-semibold">Match Results:</p>
            <p className="text-sm">
              You matched <strong>{matchedCount}</strong> number(s)
            </p>
            {matchedCount > 0 && (
              <p className="text-sm">
                Matched numbers: {matchedNumbers.join(", ")}
              </p>
            )}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

interface CurrentRoundDrawProps {
  roundId: number;
}

export async function getCurrentRoundDraw(roundId: number) {
  const { getDrawResults } = await import("@/db/queries");
  return await getDrawResults(roundId);
}
