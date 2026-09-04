import mongoose from "mongoose";

const preparationPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    targetRole: {
      type: String,
      required: true,
    },

    goals: {
      type: [String],
      default: [],
    },

    weeks: [
      {
        week: Number,
        title: String,
        topics: [String],
        tasks: [String],
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],

    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  { timestamps: true }
);

const PreparationPlan = mongoose.model(
  "PreparationPlan",
  preparationPlanSchema
);

export default PreparationPlan;