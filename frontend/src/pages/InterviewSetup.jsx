import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createInterview } from "../services/interviewService";

export default function InterviewSetup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    role: "Full Stack Developer",
    mode: "technical",
    difficulty: "medium",
    questionCount: 5,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await createInterview({
        ...form,
        questionCount: Number(form.questionCount),
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to create interview");
      }

      localStorage.setItem(
        "interview_setup",
        JSON.stringify({
          ...form,
          questionCount: Number(form.questionCount),
          interviewId: response.interview._id,
        })
      );

      navigate("/interview/live");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to create interview."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-400">
            AI INTERVIEW SIMULATOR
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Configure Your Interview
          </h1>

          <p className="mt-2 text-slate-400">
            Choose your role, interview mode, difficulty and question count.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
        >
          {error && (
            <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Target Role">
              <input
                name="role"
                value={form.role}
                onChange={handleChange}
                placeholder="e.g. Full Stack Developer"
                className="input"
                required
              />
            </Field>

            <Field label="Interview Mode">
              <select
                name="mode"
                value={form.mode}
                onChange={handleChange}
                className="input"
              >
                <option value="technical">Technical</option>
                <option value="hr">HR</option>
                <option value="behavioral">Behavioral</option>
                <option value="mixed">Mixed</option>
              </select>
            </Field>

            <Field label="Difficulty">
              <select
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                className="input"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </Field>

            <Field label="Number of Questions">
              <select
                name="questionCount"
                value={form.questionCount}
                onChange={handleChange}
                className="input"
              >
                <option value="5">5 Questions</option>
                <option value="10">10 Questions</option>
                <option value="15">15 Questions</option>
                <option value="20">20 Questions</option>
              </select>
            </Field>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Interview..." : "Start AI Interview →"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>

      {children}
    </div>
  );
}