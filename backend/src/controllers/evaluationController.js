import Evaluation from "../models/Evaluation.js";

export const createEvaluation = async (req, res, next) => {
  try {
    const {
      interview,
      question,
      answer,
      technicalAccuracy = 0,
      completeness = 0,
      communication = 0,
      confidence = 0,
      strengths = [],
      weaknesses = [],
      missingConcepts = [],
      idealAnswer = "",
      followUpQuestion = "",
    } = req.body;

    if (!interview || !question || !answer) {
      return res.status(400).json({
        success: false,
        message: "Interview, question and answer are required",
      });
    }

    const overallScore = Math.round(
      (technicalAccuracy +
        completeness +
        communication +
        confidence) /
        4
    );

    const evaluation = await Evaluation.create({
      user: req.user.userId,
      interview,
      question,
      answer,
      technicalAccuracy,
      completeness,
      communication,
      confidence,
      overallScore,
      strengths,
      weaknesses,
      missingConcepts,
      idealAnswer,
      followUpQuestion,
    });

    res.status(201).json({
      success: true,
      message: "Evaluation created successfully",
      evaluation,
    });
  } catch (error) {
    next(error);
  }
};

export const getEvaluations = async (req, res, next) => {
  try {
    const evaluations = await Evaluation.find({
      user: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      evaluations,
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewEvaluations = async (req, res, next) => {
  try {
    const evaluations = await Evaluation.find({
      user: req.user.userId,
      interview: req.params.interviewId,
    }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      evaluations,
    });
  } catch (error) {
    next(error);
  }
};

export const getEvaluationById = async (req, res, next) => {
  try {
    const evaluation = await Evaluation.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found",
      });
    }

    res.status(200).json({
      success: true,
      evaluation,
    });
  } catch (error) {
    next(error);
  }
};