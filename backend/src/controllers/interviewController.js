import Interview from "../models/Interview.js";
import User from "../models/User.js";
import Evaluation from "../models/Evaluation.js";

export const createInterview = async (req, res, next) => {
  try {
    const {
      role,
      mode = "technical",
      difficulty = "medium",
      questionCount = 10,
    } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    const interview = await Interview.create({
      user: req.user.userId,
      role,
      mode,
      difficulty,
      currentDifficulty: difficulty,
      questionCount: Number(questionCount),
    });

    res.status(201).json({
      success: true,
      message: "Interview created successfully",
      interview,
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find({
      user: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewById = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInterview = async (req, res, next) => {
  try {
    const allowedFields = [
      "currentDifficulty",
      "questions",
      "overallScore",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const interview = await Interview.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.userId,
      },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Interview updated successfully",
      interview,
    });
  } catch (error) {
    next(error);
  }
};

export const completeInterview = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const overallScore = Number(req.body.overallScore || 0);

    const interview = await Interview.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    if (interview.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Interview is already completed",
      });
    }

    interview.status = "completed";
    interview.completedAt = new Date();
    interview.overallScore = Math.min(
      Math.max(overallScore, 0),
      100
    );

    await interview.save();

    const evaluations = await Evaluation.find({
      user: userId,
      interview: interview._id,
    });

    const questionsPracticed = evaluations.length;

    const allCompletedInterviews = await Interview.find({
      user: userId,
      status: "completed",
    });

    const averageScore =
      allCompletedInterviews.length > 0
        ? Math.round(
            allCompletedInterviews.reduce(
              (sum, item) =>
                sum + (item.overallScore || 0),
              0
            ) / allCompletedInterviews.length
          )
        : 0;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // -----------------------------
    // STREAK CALCULATION
    // -----------------------------

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentStreak = user.stats?.currentStreak || 0;
    let longestStreak = user.stats?.longestStreak || 0;

    const lastPracticeDate = user.stats?.lastPracticeDate
      ? new Date(user.stats.lastPracticeDate)
      : null;

    if (lastPracticeDate) {
      lastPracticeDate.setHours(0, 0, 0, 0);

      const differenceInDays = Math.floor(
        (today - lastPracticeDate) /
          (1000 * 60 * 60 * 24)
      );

      if (differenceInDays === 0) {
        currentStreak = Math.max(currentStreak, 1);
      } else if (differenceInDays === 1) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }

    longestStreak = Math.max(
      longestStreak,
      currentStreak
    );

    const updatedInterviewsCompleted =
      (user.stats?.interviewsCompleted || 0) + 1;

    const updatedQuestionsPracticed =
      (user.stats?.questionsPracticed || 0) +
      questionsPracticed;

    await User.updateOne(
      { _id: userId },
      {
        $set: {
          "stats.averageScore": averageScore,
          "stats.currentStreak": currentStreak,
          "stats.longestStreak": longestStreak,
          "stats.lastPracticeDate": today,
        },
        $inc: {
          "stats.interviewsCompleted": 1,
          "stats.questionsPracticed": questionsPracticed,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Interview completed successfully",
      interview,
      stats: {
        currentStreak,
        longestStreak,
        averageScore,
        interviewsCompleted:
          updatedInterviewsCompleted,
        questionsPracticed:
          updatedQuestionsPracticed,
      },
    });
  } catch (error) {
    next(error);
  }
};