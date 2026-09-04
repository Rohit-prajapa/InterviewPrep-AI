import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getInterviewById,
} from "../services/interviewService";
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
          setEvaluations(evaluationResponse.data.evaluations);
        }
      } catch (err) {
        console.error(err);

        // Fallback for the currently stored local result.
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

  const averageScore =
    interview?.overallScore ??
    (evaluations.length
      ? Math.round(
          evaluations.reduce(
            (sum, item) =>
              sum + (item.evaluation?.overallScore || item.overallScore || 0),
            0
          ) / evaluations.length
        )
      : 0);

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

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-400">
            INTERVIEW COMPLETED
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Your Interview Results
          </h1>

          <p className="mt-2 text-slate-400">
            Review your performance and identify areas to improve.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-4">
          <ScoreCard
            title="Overall Score"
            value={averageScore}
          />

          <ScoreCard
            title="Technical Accuracy"
            value={technicalAccuracy}
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

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">
              Performance Breakdown
            </h2>

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

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">
              Interview Summary
            </h2>

            <div className="mt-5 space-y-3 text-slate-300">
              <p>
                <span className="text-slate-500">
                  Role:
                </span>{" "}
                {interview?.role || "Interview"}
              </p>

              <p>
                <span className="text-slate-500">
                  Mode:
                </span>{" "}
                {interview?.mode || "Technical"}
              </p>

              <p>
                <span className="text-slate-500">
                  Difficulty:
                </span>{" "}
                {interview?.difficulty || "Medium"}
              </p>

              <p>
                <span className="text-slate-500">
                  Questions:
                </span>{" "}
                {evaluations.length ||
                  interview?.questionCount ||
                  0}
              </p>

              <p>
                <span className="text-slate-500">
                  Status:
                </span>{" "}
                {interview?.status || "Completed"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">
            Question-by-Question Feedback
          </h2>

          {evaluations.length === 0 ? (
            <p className="mt-5 text-slate-400">
              No evaluation details available.
            </p>
          ) : (
            <div className="mt-6 space-y-6">
              {evaluations.map((item, index) => {
                const evaluation =
                  item.evaluation || item;

                return (
                  <div
                    key={item._id || index}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-semibold leading-relaxed">
                        {index + 1}.{" "}
                        {item.question}
                      </h3>

                      <span className="shrink-0 rounded-full bg-blue-500/10 px-3 py-1 text-sm font-bold text-blue-400">
                        {evaluation.overallScore || 0}/100
                      </span>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-medium text-slate-400">
                        Your Answer
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-slate-300">
                        {item.answer}
                      </p>
                    </div>

                    {evaluation.strengths?.length > 0 && (
                      <div className="mt-5">
                        <p className="text-sm font-medium text-green-400">
                          Strengths
                        </p>

                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
                          {evaluation.strengths.map(
                            (strength, i) => (
                              <li key={i}>{strength}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {evaluation.weaknesses?.length > 0 && (
                      <div className="mt-5">
                        <p className="text-sm font-medium text-red-400">
                          Areas to Improve
                        </p>

                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
                          {evaluation.weaknesses.map(
                            (weakness, i) => (
                              <li key={i}>{weakness}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {evaluation.missingConcepts?.length > 0 && (
                      <div className="mt-5">
                        <p className="text-sm font-medium text-yellow-400">
                          Missing Concepts
                        </p>

                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
                          {evaluation.missingConcepts.map(
                            (concept, i) => (
                              <li key={i}>{concept}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {evaluation.idealAnswer && (
                      <div className="mt-5 rounded-lg border border-slate-800 bg-slate-900 p-4">
                        <p className="text-sm font-medium text-blue-400">
                          Ideal Answer
                        </p>

                        <p className="mt-2 text-sm leading-relaxed text-slate-300">
                          {evaluation.idealAnswer}
                        </p>
                      </div>
                    )}

                    {evaluation.followUpQuestion && (
                      <div className="mt-5">
                        <p className="text-sm font-medium text-purple-400">
                          AI Follow-up Question
                        </p>

                        <p className="mt-2 text-sm text-slate-300">
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

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/interview/setup")}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700"
          >
            Take Another Interview
          </button>

          <button
            onClick={() => navigate("/analytics")}
            className="rounded-lg bg-slate-800 px-5 py-3 font-semibold hover:bg-slate-700"
          >
            View Analytics
          </button>

          <button
            onClick={() => navigate("/interviews")}
            className="rounded-lg bg-slate-800 px-5 py-3 font-semibold hover:bg-slate-700"
          >
            Interview History
          </button>
        </div>
      </div>
    </div>
  );
}

function getAverage(evaluations, field) {
  if (!evaluations.length) return 0;

  const total = evaluations.reduce((sum, item) => {
    const evaluation = item.evaluation || item;
    return sum + (evaluation[field] || 0);
  }, 0);

  return Math.round(total / evaluations.length);
}

function ScoreCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm text-slate-400">
        {title}
      </p>

      <div className="mt-3 flex items-end gap-1">
        <span className="text-4xl font-bold">
          {value}
        </span>

        <span className="mb-1 text-slate-500">
          /100
        </span>
      </div>
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

        <span className="font-semibold text-white">
          {value}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}