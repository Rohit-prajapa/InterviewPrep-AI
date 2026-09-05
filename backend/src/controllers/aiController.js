import {
  generateInterviewQuestions,
  evaluateAnswer,
  generateAdaptiveQuestion,
} from "../services/geminiService.js";

import Evaluation from "../models/Evaluation.js";
import Interview from "../models/Interview.js";

// ============================================================
// GENERATE INTERVIEW QUESTIONS
// ============================================================

export const generateQuestions = async (req, res, next) => {
  try {
    const {
      role,
      difficulty = "medium",
      mode = "technical",
      questionCount = 10,
    } = req.body;

    if (!role || !role.trim()) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    const count = Number(questionCount);

    if (!Number.isInteger(count) || count < 1 || count > 50) {
      return res.status(400).json({
        success: false,
        message: "Question count must be between 1 and 50",
      });
    }

    const result = await generateInterviewQuestions({
      role: role.trim(),
      difficulty,
      mode,
      questionCount: count,
    });

    // Support both:
    // { questions: [...] }
    // and
    // [...]
    const questions = Array.isArray(result)
      ? result
      : Array.isArray(result?.questions)
        ? result.questions
        : [];

    console.log("Generated questions:", questions.length);

    if (questions.length === 0) {
      return res.status(502).json({
        success: false,
        message: "AI generated no questions. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error("Generate Questions Error:", error);
    next(error);
  }
};

// ============================================================
// EVALUATE CANDIDATE ANSWER
// ============================================================

export const evaluateCandidateAnswer = async (req, res, next) => {
  try {
    const {
      interview,
      question,
      answer,
      role,
      mode = "technical",
    } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    if (!answer || !answer.trim()) {
      return res.status(400).json({
        success: false,
        message: "Answer is required",
      });
    }

    if (!role || !role.trim()) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    // Verify interview ownership before calling AI
    let interviewDoc = null;

    if (interview) {
      interviewDoc = await Interview.findOne({
        _id: interview,
        user: req.user.userId,
      });

      if (!interviewDoc) {
        return res.status(404).json({
          success: false,
          message: "Interview not found",
        });
      }
    }

    const aiEvaluation = await evaluateAnswer({
      question: question.trim(),
      answer: answer.trim(),
      role: role.trim(),
      mode,
    });

    if (!aiEvaluation || typeof aiEvaluation !== "object") {
      return res.status(502).json({
        success: false,
        message: "AI could not evaluate the answer. Please try again.",
      });
    }

    let savedEvaluation = null;

    if (interviewDoc) {
      savedEvaluation = await Evaluation.create({
        user: req.user.userId,
        interview: interviewDoc._id,
        question: question.trim(),
        answer: answer.trim(),

        technicalAccuracy: Number(
          aiEvaluation.technicalAccuracy ?? 0
        ),

        completeness: Number(
          aiEvaluation.completeness ?? 0
        ),

        communication: Number(
          aiEvaluation.communication ?? 0
        ),

        confidence: Number(
          aiEvaluation.confidence ?? 0
        ),

        overallScore: Number(
          aiEvaluation.overallScore ?? 0
        ),

        strengths: Array.isArray(aiEvaluation.strengths)
          ? aiEvaluation.strengths
          : [],

        weaknesses: Array.isArray(aiEvaluation.weaknesses)
          ? aiEvaluation.weaknesses
          : [],

        missingConcepts: Array.isArray(
          aiEvaluation.missingConcepts
        )
          ? aiEvaluation.missingConcepts
          : [],

        idealAnswer:
          aiEvaluation.idealAnswer || "",

        followUpQuestion:
          aiEvaluation.followUpQuestion || "",
      });
    }

    return res.status(200).json({
      success: true,
      evaluation: aiEvaluation,
      savedEvaluation,
    });
  } catch (error) {
    console.error("Evaluate Answer Error:", error);
    next(error);
  }
};

// ============================================================
// GENERATE ADAPTIVE QUESTION
// ============================================================

export const generateAdaptive = async (req, res, next) => {
  try {
    const {
      role,
      mode = "technical",
      previousQuestion,
      previousAnswer,
      previousScore,
      difficulty = "medium",
    } = req.body;

    if (!role || !role.trim()) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    if (!previousQuestion || !previousQuestion.trim()) {
      return res.status(400).json({
        success: false,
        message: "Previous question is required",
      });
    }

    if (!previousAnswer || !previousAnswer.trim()) {
      return res.status(400).json({
        success: false,
        message: "Previous answer is required",
      });
    }

    if (previousScore === undefined || previousScore === null) {
      return res.status(400).json({
        success: false,
        message: "Previous score is required",
      });
    }

    const score = Number(previousScore);

    if (Number.isNaN(score) || score < 0 || score > 100) {
      return res.status(400).json({
        success: false,
        message: "Previous score must be between 0 and 100",
      });
    }

    const question = await generateAdaptiveQuestion({
      role: role.trim(),
      mode,
      previousQuestion: previousQuestion.trim(),
      previousAnswer: previousAnswer.trim(),
      previousScore: score,
      difficulty,
    });

    if (!question) {
      return res.status(502).json({
        success: false,
        message: "AI could not generate an adaptive question.",
      });
    }

    return res.status(200).json({
      success: true,
      question,
    });
  } catch (error) {
    console.error("Generate Adaptive Question Error:", error);
    next(error);
  }
};