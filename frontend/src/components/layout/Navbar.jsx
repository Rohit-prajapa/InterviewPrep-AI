import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-slate-800 bg-slate-900 px-6 py-4 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/dashboard" className="text-xl font-bold">
          InterviewPrep AI
        </Link>

        <div className="hidden gap-5 md:flex">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/interview/setup">Interview</Link>
          <Link to="/questions">Questions</Link>
          <Link to="/analytics">Analytics</Link>
          <Link to="/preparation-plan">Preparation</Link>
          <Link to="/profile">Profile</Link>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-slate-400 sm:block">
            {user?.name}
          </span>

          <button
            onClick={logout}
            className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}