import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-blue-500">404</h1>

        <h2 className="mt-4 text-2xl font-semibold">
          Page Not Found
        </h2>

        <p className="mt-2 text-slate-400">
          The page you are looking for doesn't exist.
        </p>

        <Link
          to="/dashboard"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}