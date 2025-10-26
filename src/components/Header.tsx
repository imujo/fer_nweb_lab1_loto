import { Link } from "@tanstack/react-router";
import { LoginButton } from "./LoginButton";

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/">
              <h1 className="text-xl font-bold text-gray-900">Loto App</h1>
            </Link>
          </div>
          <div className="flex items-center">
            <LoginButton />
          </div>
        </div>
      </div>
    </header>
  );
}
