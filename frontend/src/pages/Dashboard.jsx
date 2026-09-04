import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser } from "../services/authService";

export default function Dashboard() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("interviewprep_user");

    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await getCurrentUser();

        if (response.success) {
          setUser(response.user);

          localStorage.setItem(
            "interviewprep_user",
            JSON.stringify(response.user)
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const stats = user?.stats || {};

  if (loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-400">
            INTERVIEWPREP AI
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Welcome back, {user?.name || "Candidate"} 👋
          </h1>

          <p className="mt-2 text-slate-400">
            Continue practicing and improve your interview performance.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Interviews"
            value={stats.interviewsCompleted || 0}
            icon="🎯"
          />

          <StatCard
            title="Questions"
            value={stats.questionsPracticed || 0}
            icon="❓"
          />

          <StatCard
            title="Average Score"
            value={`${stats.averageScore || 0}%`}
            icon="📊"
          />

          <StatCard
            title="Current Streak"
            value={`${stats.currentStreak || 0} 🔥`}
            icon="🔥"
          />

          <StatCard
            title="Longest Streak"
            value={`${stats.longestStreak || 0} days`}
            icon="🏆"
          />
        </div>

        {/* Main Actions */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <ActionCard
            title="Start AI Interview"
            description="Take an adaptive interview powered by Gemini."
            button="Start Interview"
            to="/interview/setup"
          />

          <ActionCard
            title="View Analytics"
            description="Track scores, skills and improvement areas."
            button="View Analytics"
            to="/analytics"
          />

          <ActionCard
            title="Preparation Plan"
            description="Generate a personalized AI preparation plan."
            button="Open Plan"
            to="/preparation-plan"
          />
        </div>

        {/* Progress */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">
            Your Progress
          </h2>

          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-slate-400">
                Average Interview Score
              </span>

              <span className="font-semibold">
                {stats.averageScore || 0}%
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                style={{
                  width: `${Math.min(
                    stats.averageScore || 0,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Streak Section */}
        <div className="mt-8 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-400">
                PRACTICE STREAK
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                {stats.currentStreak || 0} day streak 🔥
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Keep practicing regularly to build your streak.
              </p>
            </div>

            <Link
              to="/interview/setup"
              className="rounded-lg bg-orange-500 px-5 py-3 text-center font-semibold text-white transition hover:bg-orange-600"
            >
              Practice Today
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {title}
        </p>

        <span className="text-xl">
          {icon}
        </span>
      </div>

      <h2 className="mt-3 text-2xl font-bold">
        {value}
      </h2>
    </div>
  );
}

function ActionCard({
  title,
  description,
  button,
  to,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xl font-semibold">
        {title}
      </h2>

      <p className="mt-2 min-h-12 text-sm text-slate-400">
        {description}
      </p>

      <Link
        to={to}
        className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-700"
      >
        {button} →
      </Link>
    </div>
  );
}