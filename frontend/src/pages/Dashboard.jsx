import { useEffect, useMemo, useState } from "react";
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
  const averageScore = Number(stats.averageScore || 0);

  const performance = useMemo(
    () => getPerformance(averageScore),
    [averageScore]
  );

  if (loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

          <p className="text-slate-300">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            Welcome Header
        ===================================================== */}
        <section className="mb-8 overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-blue-500/10 via-slate-900 to-slate-900 p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-wide text-blue-400">
                INTERVIEWPREP AI
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome back, {user?.name || "Candidate"} 👋
              </h1>

              <p className="mt-3 max-w-2xl text-slate-400">
                Continue practicing with Gemini AI and improve your
                interview performance one session at a time.
              </p>
            </div>

            <Link
              to="/interview/setup"
              className="w-fit rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-700"
            >
              Start AI Interview →
            </Link>
          </div>
        </section>

        {/* =====================================================
            Stats
        ===================================================== */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
            value={`${averageScore}%`}
            icon="📊"
            valueClass={performance.textClass}
          />

          <StatCard
            title="Current Streak"
            value={`${stats.currentStreak || 0} days`}
            icon="🔥"
          />

          <StatCard
            title="Longest Streak"
            value={`${stats.longestStreak || 0} days`}
            icon="🏆"
          />
        </div>

        {/* =====================================================
            Performance Status
        ===================================================== */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-400">
                Interview Readiness
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h2
                  className={`text-2xl font-bold ${performance.textClass}`}
                >
                  {performance.label}
                </h2>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${performance.badgeClass}`}
                >
                  {averageScore}/100
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                {performance.description}
              </p>
            </div>

            <Link
              to="/analytics"
              className="w-fit rounded-lg border border-slate-700 bg-slate-950 px-5 py-3 text-sm font-semibold transition hover:bg-slate-800"
            >
              View Detailed Analytics →
            </Link>
          </div>
        </section>

        {/* =====================================================
            Main Actions
        ===================================================== */}
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              Continue Preparation
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose what you want to work on next.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <ActionCard
              icon="🤖"
              title="AI Interview"
              description="Take an adaptive interview powered by Gemini AI."
              button="Start Interview"
              to="/interview/setup"
            />

            <ActionCard
              icon="📈"
              title="Analytics"
              description="Track scores, skills, trends, and improvement areas."
              button="View Analytics"
              to="/analytics"
            />

            <ActionCard
              icon="📚"
              title="Preparation Plan"
              description="Follow your personalized AI interview preparation plan."
              button="Open Plan"
              to="/preparation-plan"
            />

            <ActionCard
              icon="📝"
              title="Interview History"
              description="Review your previous interviews and performance."
              button="View History"
              to="/interviews"
            />
          </div>
        </section>

        {/* =====================================================
            Progress
        ===================================================== */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Your Progress
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your current average interview score.
              </p>
            </div>

            <span
              className={`text-lg font-bold ${performance.textClass}`}
            >
              {averageScore}%
            </span>
          </div>

          <div className="mt-6">
            <div className="h-4 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-700 ${performance.barClass}`}
                style={{
                  width: `${Math.min(Math.max(averageScore, 0), 100)}%`,
                }}
              />
            </div>

            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>0</span>
              <span>50</span>
              <span>80</span>
              <span>100</span>
            </div>
          </div>
        </section>

        {/* =====================================================
            Streak
        ===================================================== */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-r from-orange-500/10 to-slate-900 p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-wide text-orange-400">
                PRACTICE STREAK
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                {stats.currentStreak || 0} day streak 🔥
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Keep practicing regularly to build consistency and
                improve your interview confidence.
              </p>
            </div>

            <Link
              to="/interview/setup"
              className="w-fit rounded-xl bg-orange-500 px-6 py-3 text-center font-semibold transition hover:bg-orange-600"
            >
              Practice Today →
            </Link>
          </div>
        </section>

        {/* =====================================================
            Quick Tip
        ===================================================== */}
        <section className="mt-8 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
              💡
            </div>

            <div>
              <p className="font-semibold text-blue-400">
                Interview Tip
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                Don't focus only on getting the answer correct.
                Practice explaining your reasoning clearly and
                confidently, just like you would in a real interview.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// =====================================================
// Components
// =====================================================

function StatCard({
  title,
  value,
  icon,
  valueClass = "text-white",
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:-translate-y-0.5 hover:border-slate-700">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          {title}
        </p>

        <span className="text-xl">
          {icon}
        </span>
      </div>

      <h2
        className={`mt-4 break-words text-2xl font-bold ${valueClass}`}
      >
        {value}
      </h2>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
  button,
  to,
}) {
  return (
    <div className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-blue-500/30">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
        {icon}
      </div>

      <h2 className="mt-5 text-lg font-semibold">
        {title}
      </h2>

      <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-400">
        {description}
      </p>

      <Link
        to={to}
        className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-blue-700"
      >
        {button} →
      </Link>
    </div>
  );
}

// =====================================================
// Helpers
// =====================================================

function getPerformance(score) {
  if (score >= 80) {
    return {
      label: "Excellent",
      description:
        "You are showing strong interview readiness. Keep practicing to stay consistent.",
      textClass: "text-green-400",
      barClass: "bg-green-500",
      badgeClass: "bg-green-500/10 text-green-400",
    };
  }

  if (score >= 60) {
    return {
      label: "Good",
      description:
        "You have a solid foundation. Focus on your weaker areas to improve.",
      textClass: "text-yellow-400",
      barClass: "bg-yellow-500",
      badgeClass: "bg-yellow-500/10 text-yellow-400",
    };
  }

  return {
    label: "Needs Practice",
    description:
      "Practice more interviews and focus on strengthening your fundamentals.",
    textClass: "text-red-400",
    barClass: "bg-red-500",
    badgeClass: "bg-red-500/10 text-red-400",
  };
}