import Interview from "../models/Interview.js";
import Evaluation from "../models/Evaluation.js";

export const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const interviews = await Interview.find({
      user: userId,
      status: "completed",
    }).sort({ completedAt: 1 });

    const evaluations = await Evaluation.find({
      user: userId,
    });

    const totalInterviews = interviews.length;
    const totalQuestions = evaluations.length;

    const average = (field) => {
      if (!evaluations.length) return 0;

      return Math.round(
        evaluations.reduce(
          (sum, item) => sum + (item[field] || 0),
          0
        ) / evaluations.length
      );
    };

    const averageScore =
      totalInterviews > 0
        ? Math.round(
            interviews.reduce(
              (sum, interview) =>
                sum + (interview.overallScore || 0),
              0
            ) / totalInterviews
          )
        : 0;

    const technicalAccuracy = average("technicalAccuracy");
    const completeness = average("completeness");
    const communication = average("communication");
    const confidence = average("confidence");

    const skillScores = [
      {
        skill: "Technical Accuracy",
        score: technicalAccuracy,
      },
      {
        skill: "Completeness",
        score: completeness,
      },
      {
        skill: "Communication",
        score: communication,
      },
      {
        skill: "Confidence",
        score: confidence,
      },
    ];

    const weakestSkill = [...skillScores].sort(
      (a, b) => a.score - b.score
    )[0];

    const improvementAreas = [];

    if (technicalAccuracy < 70) {
      improvementAreas.push("Technical accuracy");
    }

    if (completeness < 70) {
      improvementAreas.push("Answer completeness");
    }

    if (communication < 70) {
      improvementAreas.push("Communication");
    }

    if (confidence < 70) {
      improvementAreas.push("Confidence");
    }

    const scoreTrend = interviews.map((interview, index) => ({
      interview: index + 1,
      score: interview.overallScore || 0,
      date: interview.completedAt || interview.createdAt,
    }));

    res.status(200).json({
      success: true,
      analytics: {
        totalInterviews,
        totalQuestions,
        averageScore,
        technicalAccuracy,
        completeness,
        communication,
        confidence,
        skillScores,
        weakestSkill,
        improvementAreas,
        scoreTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};