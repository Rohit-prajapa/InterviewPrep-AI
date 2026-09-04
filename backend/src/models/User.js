import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    role: {
      type: String,
      enum: [
        "student",
        "developer",
        "software-engineer",
        "frontend-developer",
        "backend-developer",
        "full-stack-developer",
        "data-scientist",
        "devops-engineer",
        "ai-engineer",
        "other",
      ],
      default: "student",
    },

    profile: {
      experience: {
        type: String,
        enum: ["fresher", "0-1", "1-3", "3-5", "5+"],
        default: "fresher",
      },

      skills: {
        type: [String],
        default: [],
      },

      targetRole: {
        type: String,
        default: "",
        trim: true,
      },
    },

    stats: {
      interviewsCompleted: {
        type: Number,
        default: 0,
      },

      questionsPracticed: {
        type: Number,
        default: 0,
      },

      averageScore: {
        type: Number,
        default: 0,
      },

      currentStreak: {
        type: Number,
        default: 0,
      },

      longestStreak: {
        type: Number,
        default: 0,
      },

      lastPracticeDate: {
        type: Date,
        default: null,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    profile: this.profile,
    stats: this.stats,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = mongoose.model("User", userSchema);

export default User;