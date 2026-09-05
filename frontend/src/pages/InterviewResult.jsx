import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getInterviewById } from "../services/interviewService";
import api from "../services/api";

export default function InterviewResult() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResult = async () => {
      try {
        const interviewResponse = await getInterviewById(id);

        if (!interviewResponse.success) {
          throw new Error("Interview not found");
        }

        setInterview(interviewResponse.interview);

        const evaluationResponse = await api.get(
          `/evaluations/interview/${id}`
        );

        if (evaluationResponse.data.success) {
          setEvaluations(evaluationResponse.data.evaluations || []);
        }
      } catch (err) {
        console.error(err);

        const saved = localStorage.getItem("interview_evaluations");

        if (saved) {
          try {
            setEvaluations(JSON.parse(saved));
          } catch {
            setEvaluations([]);
          }
        }

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load interview result."
        );
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [id]);

  const averageScore = useMemo(() => {
    if (interview?.overallScore !== undefined && interview?.overallScore !== null) {
      return Math.round(interview.overallScore);
    }

    if (!evaluations.length) return 0;

    return Math.round(
      evaluations.reduce((sum, item) => {
        const evaluation = item.evaluation || item;
        return sum + Number(evaluation.overallScore || 0);
      }, 0) / evaluations.length
    );
  }, [interview, evaluations]);

  const technicalAccuracy = getAverage(
    evaluations,
    "technicalAccuracy"
  );

  const completeness = getAverage(
    evaluations,
    "completeness"
  );

  const communication = getAverage(
    evaluations,
    "communication"
  );

  const confidence = getAverage(
    evaluations,
    "confidence"
  );

  const performance = getPerformanceLevel(averageScore);

  const totalQuestions =
    evaluations.length || interview?.questionCount || 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
          <p className="text-slate-300">
            Loading interview result...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-wide text-blue-400">
                INTERVIEW COMPLETED
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Your Interview Results
              </h1>

              <p className="mt-2 max-w-2xl text-slate-400">
                Review your performance, understand your weak areas,
                and improve your interview skills.
              </p>
            </div>

            <div
              className={`w-fit rounded-full border px-4 py-2 text-sm font-semibold ${performance.badgeClass}`}
            >
              {performance.label}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
            {error}
          </div>
        )}

        {/* Overall Result */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3">

          {/* Main Score */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-1">
            <p className="text-sm font-medium text-slate-400">
              Overall Performance
            </p>

            <div className="mt-5 flex items-center gap-5">
              <ScoreCircle value={averageScore} />

              <div>
                <p className={`text-xl font-bold ${performance.textClass}`}>
                  {performance.label}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {performance.description}
                </p>
              </div>
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-slate-900 p-6 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-xl">
                ✨
              </div>

              <div>
                <p className="text-sm font-medium text-blue-400">
                  AI Recommendation
                </p>

                <h2 className="text-lg font-semibold">
                  {getRecommendation(averageScore)}
                </h2>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-300">
              Focus on your lowest-scoring areas first. Review the
              missing concepts and ideal answers below, then practice
              another interview to measure your improvement.
            </p>
          </div>
        </div>

        {/* Score Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <ScoreCard
            title="Overall Score"
            value={averageScore}
          />

          <ScoreCard
            title="Technical Accuracy"
            value={technicalAccuracy}
          />

          <ScoreCard
            title="Completeness"
            value={completeness}
          />

          <ScoreCard
            title="Communication"
            value={communication}
          />

          <ScoreCard
            title="Confidence"
            value={confidence}
          />
        </div>

        {/* Breakdown + Summary */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          {/* Performance Breakdown */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div>
              <h2 className="text-xl font-semibold">
                Performance Breakdown
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your average score across important interview skills.
              </p>
            </div>

            <div className="mt-6 space-y-5">
              <Progress
                label="Technical Accuracy"
                value={technicalAccuracy}
              />

              <Progress
                label="Completeness"
                value={completeness}
              />

              <Progress
                label="Communication"
                value={communication}
              />

              <Progress
                label="Confidence"
                value={confidence}
              />
            </div>
          </div>

          {/* Interview Summary */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">
              Interview Summary
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <InfoItem
                label="Role"
                value={interview?.role || "Interview"}
              />

              <InfoItem
                label="Mode"
                value={capitalize(interview?.mode || "technical")}
              />

              <InfoItem
                label="Difficulty"
                value={capitalize(interview?.difficulty || "medium")}
              />

              <InfoItem
                label="Questions"
                value={totalQuestions}
              />

              <InfoItem
                label="Status"
                value={capitalize(interview?.status || "completed")}
              />

              <InfoItem
                label="Score"
                value={`${averageScore}/100`}
              />
            </div>
          </div>
        </div>

        {/* Question Feedback */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div>
            <h2 className="text-xl font-semibold">
              Question-by-Question Feedback
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review each answer and understand how you can improve.
            </p>
          </div>

          {evaluations.length === 0 ? (
            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-6 text-center">
              <p className="text-slate-400">
                No evaluation details available.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {evaluations.map((item, index) => {
                const evaluation = item.evaluation || item;
                const score = Number(evaluation.overallScore || 0);
                const scoreInfo = getScoreInfo(score);

                return (
                  <div
                    key={item._id || index}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-5 transition hover:border-slate-700"
                  >
                    {/* Question Header */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-sm font-bold text-blue-400">
                          {index + 1}
                        </span>

                        <h3 className="font-semibold leading-relaxed text-white">
                          {item.question || "Interview Question"}
                        </h3>
                      </div>

                      <span
                        className={`w-fit shrink-0 rounded-full px-3 py-1 text-sm font-bold ${scoreInfo.badgeClass}`}
                      >
                        {score}/100
                      </span>
                    </div>

                    {/* Score Breakdown */}
                    <div className="mt-5 grid gap-3 sm:grid-cols-4">
                      <MiniScore
                        label="Technical"
                        value={evaluation.technicalAccuracy}
                      />

                      <MiniScore
                        label="Complete"
                        value={evaluation.completeness}
                      />

                      <MiniScore
                        label="Communication"
                        value={evaluation.communication}
                      />

                      <MiniScore
                        label="Confidence"
                        value={evaluation.confidence}
                      />
                    </div>

                    {/* Your Answer */}
                    <div className="mt-6">
                      <p className="text-sm font-semibold text-slate-400">
                        Your Answer
                      </p>

                      <div className="mt-2 rounded-lg border border-slate-800 bg-slate-900 p-4">
                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                          {item.answer || "No answer recorded."}
                        </p>
                      </div>
                    </div>

                    {/* Strengths */}
                    {evaluation.strengths?.length > 0 && (
                      <FeedbackList
                        title="Strengths"
                        items={evaluation.strengths}
                        type="success"
                      />
                    )}

                    {/* Weaknesses */}
                    {evaluation.weaknesses?.length > 0 && (
                      <FeedbackList
                        title="Areas to Improve"
                        items={evaluation.weaknesses}
                        type="danger"
                      />
                    )}

                    {/* Missing Concepts */}
                    {evaluation.missingConcepts?.length > 0 && (
                      <FeedbackList
                        title="Missing Concepts"
                        items={evaluation.missingConcepts}
                        type="warning"
                      />
                    )}

                    {/* Ideal Answer */}
                    {evaluation.idealAnswer && (
                      <div className="mt-5 rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
                        <p className="text-sm font-semibold text-blue-400">
                          Ideal Answer
                        </p>

                        <p className="mt-3 text-sm leading-6 text-slate-300">
                          {evaluation.idealAnswer}
                        </p>
                      </div>
                    )}

                    {/* Follow-up */}
                    {evaluation.followUpQuestion && (
                      <div className="mt-5 rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">
                        <p className="text-sm font-semibold text-purple-400">
                          AI Follow-up Question
                        </p>

                        <p className="mt-3 text-sm leading-6 text-slate-300">
                          {evaluation.followUpQuestion}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            onClick={() => navigate("/interview/setup")}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-700"
          >
            Take Another Interview
          </button>

          <button
            onClick={() => navigate("/analytics")}
            className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 font-semibold transition hover:bg-slate-800"
          >
            View Analytics
          </button>

          <button
            onClick={() => navigate("/interviews")}
            className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 font-semibold transition hover:bg-slate-800"
          >
            Interview History
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-xl border border-slate-700 bg-transparent px-6 py-3 font-semibold text-slate-300 transition hover:bg-slate-900"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Helpers
// =====================================================

function getAverage(evaluations, field) {
  if (!evaluations.length) return 0;

  const total = evaluations.reduce((sum, item) => {
    const evaluation = item.evaluation || item;
    return sum + Number(evaluation[field] || 0);
  }, 0);

  return Math.round(total / evaluations.length);
}

function getPerformanceLevel(score) {
  if (score >= 80) {
    return {
      label: "Excellent Performance",
      description: "Strong interview performance. Keep practicing.",
      textClass: "text-green-400",
      badgeClass:
        "border-green-500/20 bg-green-500/10 text-green-400",
    };
  }

  if (score >= 60) {
    return {
      label: "Good Performance",
      description: "Good foundation with some areas to improve.",
      textClass: "text-yellow-400",
      badgeClass:
        "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
    };
  }

  return {
    label: "Needs More Practice",
    description: "Focus on your weak areas and practice again.",
    textClass: "text-red-400",
    badgeClass:
      "border-red-500/20 bg-red-500/10 text-red-400",
  };
}

function getRecommendation(score) {
  if (score >= 80) {
    return "You're showing strong interview readiness.";
  }

  if (score >= 60) {
    return "You're on the right track. Strengthen your weak concepts.";
  }

  return "Focus on fundamentals and practice more interview questions.";
}

function getScoreInfo(score) {
  if (score >= 80) {
    return {
      badgeClass:
        "bg-green-500/10 text-green-400",
    };
  }

  if (score >= 60) {
    return {
      badgeClass:
        "bg-yellow-500/10 text-yellow-400",
    };
  }

  return {
    badgeClass:
      "bg-red-500/10 text-red-400",
  };
}

function capitalize(value) {
  if (!value) return "";

  return value.charAt(0).toUpperCase() + value.slice(1);
}

// =====================================================
// Components
// =====================================================

function ScoreCircle({ value }) {
  return (
    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-8 border-slate-800">
      <div className="text-center">
        <span className="text-3xl font-bold">
          {value}
        </span>

        <span className="block text-xs text-slate-500">
          /100
        </span>
      </div>
    </div>
  );
}

function ScoreCard({ title, value }) {
  const scoreInfo = getScoreInfo(value);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:-translate-y-0.5 hover:border-slate-700">
      <p className="min-h-[40px] text-sm leading-5 text-slate-400">
        {title}
      </p>

      <div className="mt-2 flex items-end gap-1">
        <span className={`text-3xl font-bold ${scoreInfo.textClass}`}>
          {value}
        </span>

        <span className="mb-1 text-sm text-slate-500">
          /100
        </span>
      </div>
    </div>
  );
}

function Progress({ label, value }) {
  const scoreInfo = getScoreInfo(value);

  return (
    <div>
      <div className="mb-2 flex justify-between gap-3 text-sm">
        <span className="text-slate-300">
          {label}
        </span>

        <span className={`font-semibold ${scoreInfo.textClass}`}>
          {value}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-700 ${scoreInfo.barClass}`}
          style={{
            width: `${Math.min(Math.max(value, 0), 100)}%`,
          }}
        />
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-slate-200">
        {value}
      </p>
    </div>
  );
}

function MiniScore({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-200">
        {Number(value || 0)}/100
      </p>
    </div>
  );
}

function FeedbackList({ title, items, type }) {
  const styles = {
    success: {
      title: "text-green-400",
      box: "border-green-500/10 bg-green-500/5",
      bullet: "bg-green-400",
    },
    danger: {
      title: "text-red-400",
      box: "border-red-500/10 bg-red-500/5",
      bullet: "bg-red-400",
    },
    warning: {
      title: "text-yellow-400",
      box: "border-yellow-500/10 bg-yellow-500/5",
      bullet: "bg-yellow-400",
    },
  };

  const style = styles[type];

  return (
    <div className={`mt-5 rounded-xl border p-4 ${style.box}`}>
      <p className={`text-sm font-semibold ${style.title}`}>
        {title}
      </p>

      <ul className="mt-3 space-y-2">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex gap-3 text-sm leading-5 text-slate-300"
          >
            <span
              className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${style.bullet}`}
            />

            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}