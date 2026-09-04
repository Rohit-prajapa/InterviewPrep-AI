import {
  generateInterviewQuestions,
  evaluateAnswer,
  generateAdaptiveQuestion,
} from "../services/geminiService.js";

import Evaluation from "../models/Evaluation.js";
import Interview from "../models/Interview.js";

export const generateQuestions = async (req, res, next) => {
  try {
    const {
      role,
      difficulty = "medium",
      mode = "technical",
      questionCount = 10,
    } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    const result = await generateInterviewQuestions({
      role,
      difficulty,
      mode,
      questionCount: Number(questionCount),
    });

    res.status(200).json({
      success: true,
      questions: result.questions || [],
    });
  } catch (error) {
    next(error);
  }
};

export const evaluateCandidateAnswer = async (req, res, next) => {
  try {
    const {
      interview,
      question,
      answer,
      role,
      mode = "technical",
    } = req.body;

    if (!question || !answer || !role) {
      return res.status(400).json({
        success: false,
        message: "Question, answer and role are required",
      });
    }

    const aiEvaluation = await evaluateAnswer({
      question,
      answer,
      role,
      mode,
    });

    let savedEvaluation = null;

    if (interview) {
      const interviewDoc = await Interview.findOne({
        _id: interview,
        user: req.user.userId,
      });

      if (!interviewDoc) {
        return res.status(404).json({
          success: false,
          message: "Interview not found",
        });
      }

      savedEvaluation = await Evaluation.create({
        user: req.user.userId,
        interview,
        question,
        answer,
        technicalAccuracy:
          aiEvaluation.technicalAccuracy || 0,
        completeness:
          aiEvaluation.completeness || 0,
        communication:
          aiEvaluation.communication || 0,
        confidence:
          aiEvaluation.confidence || 0,
        overallScore:
          aiEvaluation.overallScore || 0,
        strengths:
          aiEvaluation.strengths || [],
        weaknesses:
          aiEvaluation.weaknesses || [],
        missingConcepts:
          aiEvaluation.missingConcepts || [],
        idealAnswer:
          aiEvaluation.idealAnswer || "",
        followUpQuestion:
          aiEvaluation.followUpQuestion || "",
      });
    }

    res.status(200).json({
      success: true,
      evaluation: aiEvaluation,
      savedEvaluation,
    });
  } catch (error) {
    next(error);
  }
};

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

    if (
      !role ||
      !previousQuestion ||
      !previousAnswer ||
      previousScore === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Role, previous question, previous answer and previous score are required",
      });
    }

    const question = await generateAdaptiveQuestion({
      role,
      mode,
      previousQuestion,
      previousAnswer,
      previousScore: Number(previousScore),
      difficulty,
    });

    res.status(200).json({
      success: true,
      question,
    });
  } catch (error) {
    next(error);
  }
};