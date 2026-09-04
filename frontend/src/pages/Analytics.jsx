import { useEffect, useState } from "react";
import api from "../services/api";

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const response = await api.get("/analytics");

        if (!response.data.success) {
          throw new Error("Unable to load analytics");
        }

        setAnalytics(response.data.analytics);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            "Unable to load analytics."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading analytics...
      </div>
    );
  }

  const data = analytics || {
    totalInterviews: 0,
    totalQuestions: 0,
    averageScore: 0,
    technicalAccuracy: 0,
    completeness: 0,
    communication: 0,
    confidence: 0,
    skillScores: [],
    weakestSkill: null,
    improvementAreas: [],
    scoreTrend: [],
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-400">
            PERFORMANCE ANALYTICS
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Your Interview Analytics
          </h1>

          <p className="mt-2 text-slate-400">
            Track your progress and identify areas that need improvement.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
            {error}
          </div>
        )}

        {/* Overview */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Interviews"
            value={data.totalInterviews}
          />

          <StatCard
            title="Questions"
            value={data.totalQuestions}
          />

          <StatCard
            title="Average Score"
            value={`${data.averageScore}%`}
          />

          <StatCard
            title="Weakest Skill"
            value={
              data.weakestSkill?.skill || "No data"
            }
          />
        </div>

        {/* Skill Performance */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">
            Skill Performance
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Progress
              label="Technical Accuracy"
              value={data.technicalAccuracy}
            />

            <Progress
              label="Completeness"
              value={data.completeness}
            />

            <Progress
              label="Communication"
              value={data.communication}
            />

            <Progress
              label="Confidence"
              value={data.confidence}
            />
          </div>
        </div>

        {/* Trend + Improvement */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">
              Score Progress
            </h2>

            {data.scoreTrend?.length === 0 ? (
              <p className="mt-6 text-slate-400">
                Complete more interviews to see your progress.
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {data.scoreTrend.map((item) => (
                  <div key={item.interview}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-slate-400">
                        Interview {item.interview}
                      </span>

                      <span className="font-semibold">
                        {item.score}%
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all"
                        style={{
                          width: `${item.score}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">
              Improvement Areas
            </h2>

            {data.improvementAreas?.length === 0 ? (
              <div className="mt-6 rounded-lg bg-green-500/10 p-4 text-green-400">
                🎉 No major weak areas detected.
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {data.improvementAreas.map(
                  (area, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-slate-800 bg-slate-950 p-4"
                    >
                      <span className="text-yellow-400">
                        ⚠
                      </span>

                      <span className="ml-3 text-slate-300">
                        {area}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}

            {data.weakestSkill && (
              <div className="mt-6 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
                <p className="text-sm text-blue-400">
                  Priority Area
                </p>

                <p className="mt-1 font-semibold">
                  Improve {data.weakestSkill.skill}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Current score: {data.weakestSkill.score}%
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm text-slate-400">
        {title}
      </p>

      <h2 className="mt-3 text-2xl font-bold">
        {value}
      </h2>
    </div>
  );
}

function Progress({ label, value }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-slate-300">
          {label}
        </span>

        <span className="font-semibold">
          {value}%
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500"
          style={{
            width: `${value}%`,
          }}
        />
      </div>
    </div>
  );
}