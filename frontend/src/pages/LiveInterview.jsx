import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  generateQuestions,
  evaluateAnswer,
  generateAdaptiveQuestion,
} from "../services/aiService";

import { completeInterview } from "../services/interviewService";

export default function LiveInterview() {
  const navigate = useNavigate();

  const [setup, setSetup] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");

  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [generatingNext, setGeneratingNext] = useState(false);

  const [error, setError] = useState("");
  const [evaluations, setEvaluations] = useState([]);

  useEffect(() => {
    const savedSetup = localStorage.getItem("interview_setup");

    if (!savedSetup) {
      navigate("/interview/setup");
      return;
    }

    let parsedSetup;

    try {
      parsedSetup = JSON.parse(savedSetup);
    } catch {
      localStorage.removeItem("interview_setup");
      navigate("/interview/setup");
      return;
    }

    setSetup(parsedSetup);

    const loadQuestions = async () => {
      try {
        setError("");

        const response = await generateQuestions(parsedSetup);

        if (!response.success || !response.questions?.length) {
          throw new Error("No questions generated");
        }

        setQuestions(response.questions);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to generate interview questions."
        );
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [navigate]);

  const handleNext = async () => {
    const trimmedAnswer = answer.trim();

    if (
      !trimmedAnswer ||
      evaluating ||
      generatingNext
    ) {
      return;
    }

    if (trimmedAnswer.length < 20) {
      setError(
        "Please provide a little more detail in your answer."
      );
      return;
    }

    setEvaluating(true);
    setError("");

    try {
      const currentQuestion = questions[questionIndex];

      if (!currentQuestion?.question) {
        throw new Error("Current question is unavailable.");
      }

      // =====================================================
      // Evaluate Answer
      // =====================================================

      const response = await evaluateAnswer({
        interview: setup.interviewId,
        question: currentQuestion.question,
        answer: trimmedAnswer,
        role: setup.role,
        mode: setup.mode,
      });

      if (!response.success || !response.evaluation) {
        throw new Error("AI evaluation failed.");
      }

      const newEvaluation = {
        question: currentQuestion.question,
        answer: trimmedAnswer,
        evaluation: response.evaluation,
      };

      const updatedEvaluations = [
        ...evaluations,
        newEvaluation,
      ];

      setEvaluations(updatedEvaluations);

      // =====================================================
      // Finish Interview
      // =====================================================

      if (
        questionIndex + 1 >=
        Number(setup.questionCount)
      ) {
        const averageScore = Math.round(
          updatedEvaluations.reduce(
            (sum, item) =>
              sum +
              Number(
                item.evaluation?.overallScore || 0
              ),
            0
          ) / updatedEvaluations.length
        );

        await completeInterview(
          setup.interviewId,
          averageScore
        );

        localStorage.setItem(
          "interview_evaluations",
          JSON.stringify(updatedEvaluations)
        );

        localStorage.removeItem("interview_setup");

        navigate(
          `/interview/${setup.interviewId}/result`
        );

        return;
      }

      // =====================================================
      // Generate Adaptive Question
      // =====================================================

      setEvaluating(false);
      setGeneratingNext(true);

      const adaptiveResponse =
        await generateAdaptiveQuestion({
          role: setup.role,
          mode: setup.mode,
          previousQuestion: currentQuestion.question,
          previousAnswer: trimmedAnswer,
          previousScore:
            response.evaluation?.overallScore || 0,
          difficulty:
            currentQuestion.difficulty ||
            setup.difficulty,
        });

      if (
        !adaptiveResponse.success ||
        !adaptiveResponse.question
      ) {
        throw new Error(
          "Unable to generate the next adaptive question."
        );
      }

      setQuestions((prev) => [
        ...prev,
        adaptiveResponse.question,
      ]);

      setAnswer("");
      setQuestionIndex((prev) => prev + 1);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to process your answer. Please try again."
      );
    } finally {
      setEvaluating(false);
      setGeneratingNext(false);
    }
  };

  // =====================================================
  // Loading
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

          <h2 className="text-xl font-semibold">
            AI is preparing your interview
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Gemini is generating questions based on your
            selected role and interview settings.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // Fatal Error
  // =====================================================

  if (error && !questions.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="w-full max-w-lg rounded-2xl border border-red-500/30 bg-slate-900 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-xl">
            ⚠️
          </div>

          <h2 className="mt-5 text-2xl font-bold">
            Unable to Start Interview
          </h2>

          <p className="mt-3 text-sm leading-6 text-red-300">
            {error}
          </p>

          <button
            onClick={() =>
              navigate("/interview/setup")
            }
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-700"
          >
            Back to Setup
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion =
    questions[questionIndex];

  const totalQuestions = Number(
    setup?.questionCount || 5
  );

  const currentNumber = questionIndex + 1;

  const progress = Math.min(
    Math.round(
      (currentNumber / totalQuestions) * 100
    ),
    100
  );

  const isLastQuestion =
    currentNumber >= totalQuestions;

  const answerLength = answer.trim().length;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* =====================================================
            Header
        ===================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold tracking-wide text-blue-400">
                ADAPTIVE AI INTERVIEW
              </p>

              <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400">
                Gemini AI
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
              {setup?.role || "Interview"}
            </h1>

            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1">
                {capitalize(setup?.mode || "technical")}
              </span>

              <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1">
                {capitalize(setup?.difficulty || "medium")}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-center">
            <p className="text-xs text-slate-500">
              QUESTION
            </p>

            <p className="mt-1 text-lg font-bold">
              {currentNumber}{" "}
              <span className="text-slate-500">
                / {totalQuestions}
              </span>
            </p>
          </div>
        </div>

        {/* =====================================================
            Progress
        ===================================================== */}

        <div className="mb-6">
          <div className="mb-2 flex justify-between text-xs">
            <span className="text-slate-500">
              Interview Progress
            </span>

            <span className="font-semibold text-blue-400">
              {progress}%
            </span>
          </div>

          <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        {/* =====================================================
            Error
        ===================================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <div className="flex gap-3">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* =====================================================
            Question Card
        ===================================================== */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-7">

          {/* Tags */}
          <div className="mb-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400">
              {currentQuestion?.category ||
                "General"}
            </span>

            <span className="rounded-full bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-400">
              {capitalize(
                currentQuestion?.difficulty ||
                  setup?.difficulty ||
                  "medium"
              )}
            </span>

            <span className="rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400">
              Adaptive
            </span>
          </div>

          {/* Question */}
          <h2 className="text-xl font-semibold leading-8 sm:text-2xl">
            {currentQuestion?.question}
          </h2>

          <p className="mt-3 text-sm text-slate-500">
            Explain your answer clearly and include examples
            where appropriate.
          </p>

          {/* Answer */}
          <textarea
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);

              if (error) {
                setError("");
              }
            }}
            placeholder="Type your answer here..."
            rows={10}
            disabled={
              evaluating || generatingNext
            }
            className="mt-6 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm leading-6 text-white placeholder:text-slate-600 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          />

          {/* Answer Info */}
          <div className="mt-3 flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
            <span
              className={
                answerLength < 20
                  ? "text-slate-500"
                  : "text-green-400"
              }
            >
              {answerLength} characters
            </span>

            {answerLength > 0 &&
              answerLength < 20 && (
                <span className="text-yellow-400">
                  Add more detail for a better evaluation.
                </span>
              )}

            {answerLength >= 20 && (
              <span className="text-slate-500">
                Your answer is ready to submit.
              </span>
            )}
          </div>

          {/* Submit */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">
              {isLastQuestion
                ? "This is your final question."
                : "The next question will adapt to your performance."}
            </div>

            <button
              onClick={handleNext}
              disabled={
                !answer.trim() ||
                answerLength < 20 ||
                evaluating ||
                generatingNext
              }
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {evaluating
                ? "🤖 AI Evaluating..."
                : generatingNext
                  ? "✨ AI Adapting..."
                  : isLastQuestion
                    ? "Finish Interview →"
                    : "Submit & Next →"}
            </button>
          </div>
        </div>

        {/* =====================================================
            AI Status
        ===================================================== */}

        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
              🤖
            </div>

            <div>
              <p className="text-sm font-medium text-slate-300">
                Adaptive AI Interview
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Gemini evaluates your answer and adjusts
                the next question based on your performance.
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            Interview Progress Summary
        ===================================================== */}

        {evaluations.length > 0 && (
          <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Questions completed
              </p>

              <p className="font-semibold text-white">
                {evaluations.length} /{" "}
                {totalQuestions}
              </p>
            </div>

            <div className="mt-3 flex gap-1.5">
              {Array.from({
                length: totalQuestions,
              }).map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 flex-1 rounded-full ${
                    index < evaluations.length
                      ? "bg-green-500"
                      : index === questionIndex
                        ? "bg-blue-500"
                        : "bg-slate-800"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// Helpers
// =====================================================

function capitalize(value) {
  if (!value) return "";

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}