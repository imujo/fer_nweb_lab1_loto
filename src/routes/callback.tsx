import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const Route = createFileRoute("/callback")({
  component: CallbackComponent,
  beforeLoad: async () => {
    return {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    };
  },
});

function CallbackComponent() {
  const { isLoading, error, isAuthenticated, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      setTimeout(() => {
        navigate({ to: "/" });
      }, 2000);
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (error && error.message && error.message.includes("state")) {
      console.error("Auth0 Error:", error);

      if (retryCount < maxRetries) {
        console.log(
          `Retrying authentication (${retryCount + 1}/${maxRetries})...`
        );

        const storedRetryCount = parseInt(
          sessionStorage.getItem("auth_retry_count") || "0"
        );
        if (storedRetryCount >= maxRetries) {
          console.error(
            "Max retry count reached. Please try logging in again."
          );
          return;
        }

        sessionStorage.setItem(
          "auth_retry_count",
          String(storedRetryCount + 1)
        );

        setTimeout(() => {
          loginWithRedirect();
        }, 1000);

        setRetryCount(storedRetryCount + 1);
      } else {
        console.error("Max retry count reached. Clearing retry count.");
        sessionStorage.removeItem("auth_retry_count");
        navigate({ to: "/" });
      }
    } else if (error) {
      console.error("Auth0 Error:", error);
    }
  }, [error, retryCount, loginWithRedirect, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Authenticating...</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Please wait while we log you in...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              Authentication Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                <strong>Error:</strong> {error.message}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-96">
        <CardHeader>
          <CardTitle className="text-center text-green-600">Success!</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              You have been successfully logged in. Redirecting to home page...
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
