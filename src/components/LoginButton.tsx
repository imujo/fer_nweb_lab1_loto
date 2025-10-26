import { Button } from "@/components/ui/button";
import { useAuth0 } from "@auth0/auth0-react";

export function LoginButton() {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } =
    useAuth0();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        <span className="text-gray-600">Loading...</span>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center space-x-4">
        <div className="text-sm">
          <div className="flex items-center space-x-2">
            <p className="font-medium text-gray-900">
              {user.name || user.email}
            </p>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() =>
            logout({
              logoutParams: { returnTo: import.meta.env.VITE_BASE_URL },
            })
          }
        >
          Logout
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={() => loginWithRedirect()} size="sm">
      Login
    </Button>
  );
}
