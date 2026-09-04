import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getInterviews } from "../services/interviewService";

export default function InterviewHistory() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInterviews = async () => {
      try {
        const response = await getInterviews();

        if (!response.success) {
          throw new Error("Unable to load interviews");
        }

        setInterviews(response.interviews || []);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message ||
            "Unable to load interview history."
        );
      } finally {
        setLoading(false);
      }
    };

    loadInterviews();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
          <p className="text-slate-300">
            Loading interview history...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-400">
            PERFORMANCE
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Interview History
          </h1>

          <p className="mt-2 text-slate-400">
            Review your previous AI interview sessions.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {interviews.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <h2 className="text-xl font-semibold">
              No interviews yet
            </h2>

            <p className="mt-2 text-slate-400">
              Start your first AI interview to see your results here.
            </p>

            <Link
              to="/interview/setup"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700"
            >
              Start AI Interview
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="border-b border-slate-800 bg-slate-950">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                      Role
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                      Mode
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                      Difficulty
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                      Score
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {interviews.map((interview) => (
                    <tr
                      key={interview._id}
                      className="border-b border-slate-800 last:border-0 hover:bg-slate-800/40"
                    >
                      <td className="px-6 py-5 font-semibold">
                        {interview.role}
                      </td>

                      <td className="px-6 py-5 capitalize text-slate-300">
                        {interview.mode}
                      </td>

                      <td className="px-6 py-5 capitalize text-slate-300">
                        {interview.difficulty}
                      </td>

                      <td className="px-6 py-5">
                        <span className="font-bold text-blue-400">
                          {interview.overallScore || 0}/100
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            interview.status === "completed"
                              ? "bg-green-500/10 text-green-400"
                              : "bg-yellow-500/10 text-yellow-400"
                          }`}
                        >
                          {interview.status}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <Link
                          to={`/interview/${interview._id}/result`}
                          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold hover:bg-slate-700"
                        >
                          View Result
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6">
          <Link
            to="/interview/setup"
            className="inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700"
          >
            + New Interview
          </Link>
        </div>
      </div>
    </div>
  );
}