import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
    },

    mode: {
      type: String,
      enum: ["technical", "hr", "behavioral", "mixed"],
      default: "technical",
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    currentDifficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    questionCount: {
      type: Number,
      min: 1,
      max: 50,
      default: 10,
    },

    questions: [
      {
        question: String,
        category: String,
        difficulty: {
          type: String,
          enum: ["easy", "medium", "hard"],
        },
        answer: String,
        score: {
          type: Number,
          default: 0,
        },
        feedback: String,
      },
    ],

    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;