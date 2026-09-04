import mongoose from "mongoose";

const evaluationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
    },

    question: {
      type: String,
      required: true,
    },

    answer: {
      type: String,
      required: true,
    },

    technicalAccuracy: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    completeness: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    communication: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    missingConcepts: {
      type: [String],
      default: [],
    },

    idealAnswer: {
      type: String,
      default: "",
    },

    followUpQuestion: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Evaluation = mongoose.model("Evaluation", evaluationSchema);

export default Evaluation;