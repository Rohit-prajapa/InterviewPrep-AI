import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      experience,
      skills,
      targetRole,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || "student",
      profile: {
        experience: experience || "fresher",
        skills: skills || [],
        targetRole: targetRole || "",
      },
    });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update only lastLogin without triggering full document validation.
    await User.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    const token = generateToken(user._id.toString());

    const updatedUser = await User.findById(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: updatedUser.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};