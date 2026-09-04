import { useEffect, useState } from "react";
import {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  togglePinQuestion,
} from "../services/questionService";

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    question: "",
    category: "Technical",
    difficulty: "medium",
    answer: "",
    explanation: "",
  });

  const [editingId, setEditingId] = useState(null);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getQuestions();

      if (!response.success) {
        throw new Error("Unable to load questions");
      }

      setQuestions(response.questions || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load questions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      question: "",
      category: "Technical",
      difficulty: "medium",
      answer: "",
      explanation: "",
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.question.trim()) return;

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        const response = await updateQuestion(editingId, form);

        if (!response.success) {
          throw new Error("Unable to update question");
        }
      } else {
        const response = await createQuestion(form);

        if (!response.success) {
          throw new Error("Unable to create question");
        }
      }

      resetForm();
      await loadQuestions();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save question."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (question) => {
    setEditingId(question._id);

    setForm({
      question: question.question || "",
      category: question.category || "Technical",
      difficulty: question.difficulty || "medium",
      answer: question.answer || "",
      explanation: question.explanation || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await deleteQuestion(id);

      if (!response.success) {
        throw new Error("Unable to delete question");
      }

      setQuestions((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to delete question."
      );
    }
  };

  const handlePin = async (id) => {
    try {
      setError("");

      const response = await togglePinQuestion(id);

      if (!response.success) {
        throw new Error("Unable to update pin status");
      }

      setQuestions((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
                ...item,
                pinned: response.question.pinned,
              }
            : item
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to update pin status."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-400">
            QUESTION BANK
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Interview Questions
          </h1>

          <p className="mt-2 text-slate-400">
            Create, manage and save your interview questions.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6"
        >
          <h2 className="text-xl font-semibold">
            {editingId ? "Edit Question" : "Add Question"}
          </h2>

          <textarea
            name="question"
            value={form.question}
            onChange={handleChange}
            placeholder="Enter interview question..."
            rows={4}
            required
            className="mt-5 w-full rounded-lg border border-slate-700 bg-slate-950 p-4 text-white outline-none focus:border-blue-500"
          />

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="input"
            >
              <option value="Technical">Technical</option>
              <option value="HR">HR</option>
              <option value="Behavioral">Behavioral</option>
              <option value="Database">Database</option>
              <option value="DSA">DSA</option>
              <option value="System Design">System Design</option>
            </select>

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
          </div>

          <textarea
            name="answer"
            value={form.answer}
            onChange={handleChange}
            placeholder="Your answer..."
            rows={4}
            className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-950 p-4 text-white outline-none focus:border-blue-500"
          />

          <textarea
            name="explanation"
            value={form.explanation}
            onChange={handleChange}
            placeholder="Explanation..."
            rows={3}
            className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-950 p-4 text-white outline-none focus:border-blue-500"
          />

          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Question"
                : "Add Question"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-700 px-5 py-3 font-semibold hover:bg-slate-800"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Saved Questions
          </h2>

          <span className="text-sm text-slate-400">
            {questions.length} questions
          </span>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            Loading questions...
          </div>
        ) : questions.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
            <p className="text-slate-400">
              No saved questions yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((item) => (
              <div
                key={item._id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
              >
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                    {item.category}
                  </span>

                  <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-400">
                    {item.difficulty}
                  </span>

                  {item.pinned && (
                    <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400">
                      📌 Pinned
                    </span>
                  )}
                </div>

                <h3 className="mt-4 text-lg font-semibold">
                  {item.question}
                </h3>

                {item.answer && (
                  <p className="mt-3 text-sm text-slate-400">
                    <span className="font-semibold text-slate-300">
                      Answer:
                    </span>{" "}
                    {item.answer}
                  </p>
                )}

                {item.explanation && (
                  <p className="mt-2 text-sm text-slate-400">
                    <span className="font-semibold text-slate-300">
                      Explanation:
                    </span>{" "}
                    {item.explanation}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => handlePin(item._id)}
                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
                  >
                    {item.pinned ? "Unpin" : "Pin"}
                  </button>

                  <button
                    onClick={() => handleEdit(item)}
                    className="rounded-lg border border-blue-500/30 px-4 py-2 text-sm text-blue-400 hover:bg-blue-500/10"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(item._id)}
                    className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}