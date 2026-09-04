import { useEffect, useState } from "react";
import {
  generatePreparationPlan,
  getPreparationPlan,
  updatePreparationPlan,
} from "../services/preparationService";

export default function PreparationPlan() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    try {
      const response = await getPreparationPlan();

      if (response.success) {
        setPlan(response.plan);
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Unable to load preparation plan."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");

    try {
      const response = await generatePreparationPlan();

      if (!response.success) {
        throw new Error("Failed to generate preparation plan");
      }

      setPlan(response.plan);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to generate AI preparation plan."
      );
    } finally {
      setGenerating(false);
    }
  };

  const toggleWeek = async (weekIndex) => {
    if (!plan) return;

    const updatedWeeks = plan.weeks.map((week, index) =>
      index === weekIndex
        ? {
            ...week,
            completed: !week.completed,
          }
        : week
    );

    const completedWeeks = updatedWeeks.filter(
      (week) => week.completed
    ).length;

    const progress = Math.round(
      (completedWeeks / updatedWeeks.length) * 100
    );

    try {
      const response = await updatePreparationPlan(
        plan._id,
        {
          weeks: updatedWeeks,
          progress,
        }
      );

      if (response.success) {
        setPlan(response.plan);
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to update preparation plan."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
          <p className="text-slate-300">
            Loading preparation plan...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold text-blue-400">
              AI COACH
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Personalized Preparation Plan
            </h1>

            <p className="mt-2 text-slate-400">
              Your AI-generated roadmap based on your interview performance.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generating
              ? "Generating..."
              : plan
              ? "Regenerate AI Plan"
              : "Generate AI Plan"}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {!plan ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <h2 className="text-2xl font-bold">
              Build Your AI Roadmap
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-slate-400">
              Generate a personalized 4-week preparation plan based on your
              target role, skills and interview performance.
            </p>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {generating
                ? "AI is creating your plan..."
                : "Generate My Plan →"}
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
                <p className="text-sm text-blue-400">
                  Target Role
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {plan.targetRole}
                </h2>

                <div className="mt-6">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-400">
                      Overall Progress
                    </span>

                    <span className="font-semibold">
                      {plan.progress || 0}%
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{
                        width: `${plan.progress || 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">
                  Weeks
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  {plan.weeks?.length || 0}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Structured preparation roadmap
                </p>
              </div>
            </div>

            {plan.goals?.length > 0 && (
              <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <h2 className="text-xl font-semibold">
                  Your Goals
                </h2>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {plan.goals.map((goal, index) => (
                    <div
                      key={index}
                      className="rounded-lg bg-slate-950 p-4 text-slate-300"
                    >
                      <span className="mr-2 text-blue-400">
                        ✓
                      </span>
                      {goal}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 space-y-5">
              {plan.weeks?.map((week, index) => (
                <div
                  key={index}
                  className={`rounded-2xl border p-6 transition ${
                    week.completed
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-slate-800 bg-slate-900"
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-blue-400">
                        WEEK {week.week}
                      </p>

                      <h2 className="mt-1 text-xl font-bold">
                        {week.title}
                      </h2>
                    </div>

                    <button
                      onClick={() => toggleWeek(index)}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                        week.completed
                          ? "bg-green-500/10 text-green-400"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {week.completed
                        ? "✓ Completed"
                        : "Mark Complete"}
                    </button>
                  </div>

                  {week.topics?.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold text-slate-400">
                        Topics
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {week.topics.map((topic, topicIndex) => (
                          <span
                            key={topicIndex}
                            className="rounded-full bg-blue-500/10 px-3 py-1 text-sm text-blue-400"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {week.tasks?.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold text-slate-400">
                        Action Items
                      </h3>

                      <ul className="mt-3 space-y-2">
                        {week.tasks.map((task, taskIndex) => (
                          <li
                            key={taskIndex}
                            className="flex gap-3 text-slate-300"
                          >
                            <span className="text-blue-400">
                              •
                            </span>

                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}