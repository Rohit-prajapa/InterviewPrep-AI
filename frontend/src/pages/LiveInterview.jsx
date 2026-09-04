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
      navigate("/interview/setup");
      return;
    }

    setSetup(parsedSetup);

    const loadQuestions = async () => {
      try {
        const response = await generateQuestions(parsedSetup);

        if (!response.success || !response.questions?.length) {
          throw new Error("No questions generated");
        }

        setQuestions(response.questions);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message ||
            "Unable to generate interview questions.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [navigate]);

  const handleNext = async () => {
    if (!answer.trim() || evaluating || generatingNext) return;

    setEvaluating(true);
    setError("");

    try {
      const currentQuestion = questions[questionIndex];

      const response = await evaluateAnswer({
        interview: setup.interviewId,
        question: currentQuestion.question,
        answer,
        role: setup.role,
        mode: setup.mode,
      });

      if (!response.success) {
        throw new Error("Evaluation failed");
      }

      const newEvaluation = {
        question: currentQuestion.question,
        answer,
        evaluation: response.evaluation,
      };

      const updatedEvaluations = [...evaluations, newEvaluation];

      setEvaluations(updatedEvaluations);

      if (questionIndex + 1 >= Number(setup.questionCount)) {
        const averageScore = Math.round(
          updatedEvaluations.reduce(
            (sum, item) => sum + (item.evaluation?.overallScore || 0),
            0,
          ) / updatedEvaluations.length,
        );

        await completeInterview(setup.interviewId, averageScore);

        localStorage.setItem(
          "interview_evaluations",
          JSON.stringify(updatedEvaluations),
        );

        localStorage.removeItem("interview_setup");

        navigate(`/interview/${setup.interviewId}/result`);
        return;
      }

      setGeneratingNext(true);

      const adaptiveResponse = await generateAdaptiveQuestion({
        role: setup.role,
        mode: setup.mode,
        previousQuestion: currentQuestion.question,
        previousAnswer: answer,
        previousScore: response.evaluation?.overallScore || 0,
        difficulty: currentQuestion.difficulty || setup.difficulty,
      });

      if (!adaptiveResponse.success || !adaptiveResponse.question) {
        throw new Error("Unable to generate adaptive question");
      }

      setQuestions((prev) => [...prev, adaptiveResponse.question]);

      setAnswer("");
      setQuestionIndex((prev) => prev + 1);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to process your answer.",
      );
    } finally {
      setEvaluating(false);
      setGeneratingNext(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

          <p className="text-slate-300">AI is preparing your interview...</p>
        </div>
      </div>
    );
  }

  if (error && !questions.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="max-w-lg rounded-2xl border border-red-500/30 bg-slate-900 p-8 text-center">
          <h2 className="text-2xl font-bold">Unable to Start Interview</h2>

          <p className="mt-3 text-red-300">{error}</p>

          <button
            onClick={() => navigate("/interview/setup")}
            className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700"
          >
            Back to Setup
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[questionIndex];

  const totalQuestions = Number(setup?.questionCount || 5);

  const progress = Math.min(
    Math.round(((questionIndex + 1) / totalQuestions) * 100),
    100,
  );

  const isLastQuestion = questionIndex + 1 >= totalQuestions;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-400">ADAPTIVE AI INTERVIEW</p>

            <h1 className="mt-1 text-2xl font-bold">{setup?.role}</h1>
          </div>

          <div className="text-right">
            <p className="text-sm text-slate-400">Question</p>

            <p className="text-xl font-bold">
              {questionIndex + 1} / {totalQuestions}
            </p>
          </div>
        </div>

        <div className="mb-8 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <div className="mb-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
              {currentQuestion?.category}
            </span>

            <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
              {currentQuestion?.difficulty}
            </span>

            <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
              Adaptive
            </span>
          </div>

          <h2 className="text-xl font-semibold leading-relaxed">
            {currentQuestion?.question}
          </h2>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={9}
            disabled={evaluating || generatingNext}
            className="mt-6 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none transition focus:border-blue-500 disabled:opacity-60"
          />

          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {answer.trim().length} characters
            </p>

            <button
              onClick={handleNext}
              disabled={!answer.trim() || evaluating || generatingNext}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {evaluating
                ? "AI Evaluating..."
                : generatingNext
                  ? "AI Adapting Question..."
                  : isLastQuestion
                    ? "Finish Interview"
                    : "Submit & Next →"}
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-center text-sm text-slate-400">
          🤖 The next question adapts to your previous performance.
        </div>
      </div>
    </div>
  );
}
