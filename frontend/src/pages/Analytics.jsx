import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Analytics() {
  const [interviews, setInterviews] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [interviewResponse, evaluationResponse] =
        await Promise.all([
          api.get("/interviews"),
          api.get("/evaluations"),
        ]);

      const interviewData =
        interviewResponse?.data?.interviews ||
        interviewResponse?.data?.data ||
        [];

      const evaluationData =
        evaluationResponse?.data?.evaluations ||
        evaluationResponse?.data?.data ||
        [];

      setInterviews(
        Array.isArray(interviewData)
          ? interviewData
          : []
      );

      setEvaluations(
        Array.isArray(evaluationData)
          ? evaluationData
          : []
      );
    } catch (err) {
      console.error("Analytics error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  const completedInterviews = useMemo(
    () =>
      interviews.filter(
        (interview) =>
          interview.status === "completed" ||
          interview.status === "complete"
      ),
    [interviews]
  );

  const averageScore = useMemo(() => {
    if (completedInterviews.length === 0) return 0;

    const scores = completedInterviews
      .map((item) => Number(item.overallScore || 0))
      .filter((score) => score >= 0);

    if (scores.length === 0) return 0;

    return Math.round(
      scores.reduce((sum, score) => sum + score, 0) /
        scores.length
    );
  }, [completedInterviews]);

  const skillScores = useMemo(() => {
    if (!evaluations.length) {
      return {
        technicalAccuracy: 0,
        completeness: 0,
        communication: 0,
        confidence: 0,
      };
    }

    const total = evaluations.length;

    return {
      technicalAccuracy: Math.round(
        evaluations.reduce(
          (sum, item) =>
            sum + Number(item.technicalAccuracy || 0),
          0
        ) / total
      ),

      completeness: Math.round(
        evaluations.reduce(
          (sum, item) =>
            sum + Number(item.completeness || 0),
          0
        ) / total
      ),

      communication: Math.round(
        evaluations.reduce(
          (sum, item) =>
            sum + Number(item.communication || 0),
          0
        ) / total
      ),

      confidence: Math.round(
        evaluations.reduce(
          (sum, item) =>
            sum + Number(item.confidence || 0),
          0
        ) / total
      ),
    };
  }, [evaluations]);

  const weakestSkill = useMemo(() => {
    const skills = [
      {
        name: "Technical Accuracy",
        score: skillScores.technicalAccuracy,
      },
      {
        name: "Completeness",
        score: skillScores.completeness,
      },
      {
        name: "Communication",
        score: skillScores.communication,
      },
      {
        name: "Confidence",
        score: skillScores.confidence,
      },
    ];

    return skills.reduce(
      (weakest, current) =>
        current.score < weakest.score
          ? current
          : weakest,
      skills[0]
    );
  }, [skillScores]);

  const scoreTrend = useMemo(() => {
    return [...completedInterviews]
      .sort(
        (a, b) =>
          new Date(a.createdAt) -
          new Date(b.createdAt)
      )
      .slice(-7);
  }, [completedInterviews]);

  const highestScore = useMemo(() => {
    if (!completedInterviews.length) return 0;

    return Math.max(
      ...completedInterviews.map((item) =>
        Number(item.overallScore || 0)
      )
    );
  }, [completedInterviews]);

  const readiness = useMemo(() => {
    if (averageScore >= 85) {
      return {
        label: "Interview Ready",
        description:
          "Excellent performance. Keep practising to stay consistent.",
        className:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
        icon: "🚀",
      };
    }

    if (averageScore >= 70) {
      return {
        label: "Almost Ready",
        description:
          "Good progress. Focus on your weakest areas.",
        className:
          "border-blue-500/20 bg-blue-500/10 text-blue-400",
        icon: "📈",
      };
    }

    if (averageScore >= 50) {
      return {
        label: "Keep Practising",
        description:
          "You are improving. More focused practice will help.",
        className:
          "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
        icon: "💪",
      };
    }

    return {
      label: "Start Practising",
      description:
        "Complete mock interviews to build your performance data.",
      className:
        "border-purple-500/20 bg-purple-500/10 text-purple-400",
      icon: "🎯",
    };
  }, [averageScore]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-64 rounded-xl bg-slate-800" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-32 rounded-2xl bg-slate-900"
                />
              ))}
            </div>
            <div className="h-80 rounded-2xl bg-slate-900" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* ================= HEADER ================= */}

        <div className="mb-8">
          <p className="text-sm font-medium text-blue-400">
            PERFORMANCE
          </p>

          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
            Analytics
          </h1>

          <p className="mt-2 text-slate-400">
            Track your interview performance and identify
            areas for improvement.
          </p>
        </div>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-red-400">
              {error}
            </p>

            <button
              onClick={loadAnalytics}
              className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20"
            >
              Retry
            </button>
          </div>
        )}

        {/* ================= READINESS ================= */}

        <section
          className={`mb-8 rounded-3xl border p-6 ${readiness.className}`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950/40 text-2xl">
                {readiness.icon}
              </div>

              <div>
                <p className="text-sm opacity-70">
                  CURRENT STATUS
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  {readiness.label}
                </h2>

                <p className="mt-1 text-sm opacity-70">
                  {readiness.description}
                </p>
              </div>

            </div>

            <div className="text-left sm:text-right">
              <p className="text-sm opacity-70">
                Average Score
              </p>

              <p className="text-4xl font-bold">
                {averageScore}%
              </p>
            </div>

          </div>
        </section>

        {/* ================= OVERVIEW CARDS ================= */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon="🎤"
            title="Total Interviews"
            value={completedInterviews.length}
            description="Completed mock interviews"
          />

          <StatCard
            icon="⭐"
            title="Average Score"
            value={`${averageScore}%`}
            description="Overall performance"
          />

          <StatCard
            icon="🏆"
            title="Best Score"
            value={`${highestScore}%`}
            description="Highest interview score"
          />

          <StatCard
            icon="💬"
            title="Questions"
            value={evaluations.length}
            description="Answers evaluated by AI"
          />

        </section>

        {/* ================= SKILL PERFORMANCE ================= */}

        <section className="mt-8">

          <div className="mb-4">
            <h2 className="text-xl font-bold">
              Skill Performance
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              See how you are performing across key interview skills.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <SkillCard
              title="Technical Accuracy"
              score={skillScores.technicalAccuracy}
              icon="🧠"
            />

            <SkillCard
              title="Completeness"
              score={skillScores.completeness}
              icon="📚"
            />

            <SkillCard
              title="Communication"
              score={skillScores.communication}
              icon="💬"
            />

            <SkillCard
              title="Confidence"
              score={skillScores.confidence}
              icon="🎯"
            />

          </div>
        </section>

        {/* ================= SCORE TREND ================= */}

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-xl font-bold">
                Score Trend
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Your latest interview performance.
              </p>
            </div>

            {scoreTrend.length > 0 && (
              <div className="rounded-xl bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
                Last {scoreTrend.length} interviews
              </div>
            )}

          </div>

          {scoreTrend.length > 0 ? (
            <div className="mt-8 space-y-5">

              {scoreTrend.map((interview, index) => {
                const score = Math.round(
                  Number(interview.overallScore || 0)
                );

                return (
                  <div key={interview._id || index}>

                    <div className="mb-2 flex items-center justify-between text-sm">

                      <span className="max-w-[70%] truncate text-slate-300">
                        {interview.role || "Mock Interview"}
                      </span>

                      <span className="font-bold text-white">
                        {score}%
                      </span>

                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-800">

                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                        style={{
                          width: `${Math.min(score, 100)}%`,
                        }}
                      />

                    </div>

                  </div>
                );
              })}

            </div>
          ) : (
            <EmptyState
              icon="📊"
              title="No performance data yet"
              description="Complete your first mock interview to see your score trend."
            />
          )}

        </section>

        {/* ================= IMPROVEMENT AREAS ================= */}

        <section className="mt-8 grid gap-6 lg:grid-cols-2">

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-orange-500/10 p-3 text-xl">
                ⚡
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  Priority Area
                </h2>

                <p className="text-sm text-slate-400">
                  Your weakest measured skill
                </p>
              </div>

            </div>

            <div className="mt-6 rounded-2xl bg-slate-950/60 p-5">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-slate-400">
                    Focus on
                  </p>

                  <p className="mt-1 text-xl font-bold">
                    {weakestSkill.name}
                  </p>
                </div>

                <span className="text-2xl font-bold text-orange-400">
                  {weakestSkill.score}%
                </span>

              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">

                <div
                  className="h-full rounded-full bg-orange-500"
                  style={{
                    width: `${Math.min(
                      weakestSkill.score,
                      100
                    )}%`,
                  }}
                />

              </div>

              <p className="mt-4 text-sm leading-6 text-slate-400">
                Practise this area during your next mock
                interviews and review the AI feedback after
                each answer.
              </p>

            </div>

          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-emerald-500/10 p-3 text-xl">
                💡
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  Recommended Actions
                </h2>

                <p className="text-sm text-slate-400">
                  Improve your interview readiness
                </p>
              </div>

            </div>

            <div className="mt-6 space-y-3">

              <Recommendation
                number="01"
                title="Practise weak skills"
                description={`Focus on ${weakestSkill.name}.`}
              />

              <Recommendation
                number="02"
                title="Take another mock interview"
                description="Use Gemini AI feedback to improve."
              />

              <Recommendation
                number="03"
                title="Review previous answers"
                description="Learn from your weaknesses and missing concepts."
              />

            </div>

          </div>

        </section>

        {/* ================= QUICK ACTIONS ================= */}

        <section className="mt-8">

          <div className="mb-4">
            <h2 className="text-xl font-bold">
              Quick Actions
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <ActionCard
              to="/interview/setup"
              icon="🎤"
              title="Start AI Interview"
              description="Take a new adaptive mock interview."
            />

            <ActionCard
              to="/interviews/history"
              icon="📋"
              title="Interview History"
              description="Review your previous interviews."
            />

            <ActionCard
              to="/preparation"
              icon="📚"
              title="Preparation Plan"
              description="Continue your personalised preparation."
            />

          </div>

        </section>

      </div>
    </div>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  icon,
  title,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:-translate-y-1 hover:border-slate-700">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-blue-500/10 p-3 text-xl">
          {icon}
        </div>

      </div>

      <p className="mt-4 text-xs text-slate-500">
        {description}
      </p>

    </div>
  );
}

/* =====================================================
   SKILL CARD
===================================================== */

function SkillCard({
  title,
  score,
  icon,
}) {
  const getScoreText = () => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Needs Work";
    return "Needs Focus";
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold">
            {score}%
          </p>
        </div>

        <div className="rounded-xl bg-slate-800 p-3 text-xl">
          {icon}
        </div>

      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">

        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
          style={{
            width: `${Math.min(score, 100)}%`,
          }}
        />

      </div>

      <p className="mt-3 text-xs font-medium text-slate-500">
        {getScoreText()}
      </p>

    </div>
  );
}

/* =====================================================
   RECOMMENDATION
===================================================== */

function Recommendation({
  number,
  title,
  description,
}) {
  return (
    <div className="flex gap-4 rounded-xl bg-slate-950/60 p-4">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-xs font-bold text-blue-400">
        {number}
      </div>

      <div>
        <p className="font-semibold text-slate-200">
          {title}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

    </div>
  );
}

/* =====================================================
   ACTION CARD
===================================================== */

function ActionCard({
  to,
  icon,
  title,
  description,
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-blue-500/40 hover:bg-slate-900/80"
    >

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-xl transition group-hover:scale-105">
        {icon}
      </div>

      <h3 className="mt-5 font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <p className="mt-4 text-sm font-semibold text-blue-400">
        Open →
      </p>

    </Link>
  );
}

/* =====================================================
   EMPTY STATE
===================================================== */

function EmptyState({
  icon,
  title,
  description,
}) {
  return (
    <div className="mt-8 rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-10 text-center">

      <div className="text-4xl">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  );
}