import PreparationPlan from "../models/PreparationPlan.js";
import User from "../models/User.js";
import Evaluation from "../models/Evaluation.js";
import { generatePreparationPlan } from "../services/geminiService.js";

export const createPreparationPlan = async (req, res, next) => {
  try {
    const {
      targetRole,
      goals = [],
      weeks = [],
    } = req.body;

    if (!targetRole) {
      return res.status(400).json({
        success: false,
        message: "Target role is required",
      });
    }

    const plan = await PreparationPlan.create({
      user: req.user.userId,
      targetRole,
      goals,
      weeks,
      progress: 0,
    });

    res.status(201).json({
      success: true,
      message: "Preparation plan created successfully",
      plan,
    });
  } catch (error) {
    next(error);
  }
};

export const generateAIPlan = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const evaluations = await Evaluation.find({
      user: req.user.userId,
    });

    const total = evaluations.length;

    const average = (field) => {
      if (!total) return 0;

      return Math.round(
        evaluations.reduce(
          (sum, item) => sum + (item[field] || 0),
          0
        ) / total
      );
    };

    const technicalAccuracy = average(
      "technicalAccuracy"
    );

    const communication = average(
      "communication"
    );

    const confidence = average("confidence");

    const weakAreas = [];

    if (technicalAccuracy < 70) {
      weakAreas.push("Technical accuracy");
    }

    if (communication < 70) {
      weakAreas.push("Communication");
    }

    if (confidence < 70) {
      weakAreas.push("Confidence");
    }

    evaluations.forEach((item) => {
      if (item.missingConcepts?.length) {
        weakAreas.push(
          ...item.missingConcepts
        );
      }

      if (item.weaknesses?.length) {
        weakAreas.push(
          ...item.weaknesses
        );
      }
    });

    const uniqueWeakAreas = [
      ...new Set(weakAreas),
    ].slice(0, 15);

    const result = await generatePreparationPlan({
      targetRole:
        user.profile?.targetRole ||
        user.role ||
        "Software Developer",

      experience:
        user.profile?.experience ||
        "fresher",

      skills:
        user.profile?.skills || [],

      averageScore:
        user.stats?.averageScore || 0,

      technicalAccuracy,
      communication,
      confidence,

      weakAreas: uniqueWeakAreas,
    });

    const existingPlan =
      await PreparationPlan.findOne({
        user: req.user.userId,
      }).sort({ createdAt: -1 });

    let plan;

    if (existingPlan) {
      existingPlan.targetRole =
        result.targetRole;

      existingPlan.goals =
        result.goals || [];

      existingPlan.weeks =
        result.weeks || [];

      existingPlan.progress = 0;

      plan = await existingPlan.save();
    } else {
      plan = await PreparationPlan.create({
        user: req.user.userId,

        targetRole:
          result.targetRole ||
          user.profile?.targetRole ||
          user.role ||
          "Software Developer",

        goals:
          result.goals || [],

        weeks:
          result.weeks || [],

        progress: 0,
      });
    }

    res.status(200).json({
      success: true,
      message:
        "AI preparation plan generated successfully",
      plan,
    });
  } catch (error) {
    next(error);
  }
};

export const getPreparationPlan = async (
  req,
  res,
  next
) => {
  try {
    const plan =
      await PreparationPlan.findOne({
        user: req.user.userId,
      }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      plan,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePreparationPlan = async (
  req,
  res,
  next
) => {
  try {
    const allowedFields = [
      "goals",
      "weeks",
      "progress",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (
      updates.progress !== undefined &&
      (updates.progress < 0 ||
        updates.progress > 100)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Progress must be between 0 and 100",
      });
    }

    const plan =
      await PreparationPlan.findOneAndUpdate(
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

    if (!plan) {
      return res.status(404).json({
        success: false,
        message:
          "Preparation plan not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Preparation plan updated successfully",
      plan,
    });
  } catch (error) {
    next(error);
  }
};