import User from "../models/User.js";

// ==========================================
// GET CURRENT USER PROFILE
// ==========================================
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// UPDATE CURRENT USER PROFILE
// ==========================================
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const {
      name,
      targetRole,
      experience,
      skills,
    } = req.body;

    // ------------------------------
    // VALIDATION
    // ------------------------------

    if (
      name !== undefined &&
      (typeof name !== "string" ||
        name.trim().length < 2 ||
        name.trim().length > 50)
    ) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 50 characters",
      });
    }

    if (
      targetRole !== undefined &&
      (typeof targetRole !== "string" ||
        targetRole.trim().length > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Target role is invalid",
      });
    }

    if (
      experience !== undefined &&
      (typeof experience !== "string" ||
        experience.trim().length > 50)
    ) {
      return res.status(400).json({
        success: false,
        message: "Experience value is invalid",
      });
    }

    if (
      skills !== undefined &&
      (!Array.isArray(skills) || skills.length > 30)
    ) {
      return res.status(400).json({
        success: false,
        message: "Skills must be an array with at most 30 items",
      });
    }

    // ------------------------------
    // CLEAN SKILLS
    // ------------------------------

    let cleanedSkills;

    if (Array.isArray(skills)) {
      cleanedSkills = [
        ...new Set(
          skills
            .filter((skill) => typeof skill === "string")
            .map((skill) => skill.trim())
            .filter(Boolean)
            .map((skill) => skill.slice(0, 50))
        ),
      ];
    }

    // ------------------------------
    // BUILD UPDATE
    // ------------------------------

    const updateData = {};

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (targetRole !== undefined) {
      updateData["profile.targetRole"] =
        targetRole.trim();
    }

    if (experience !== undefined) {
      updateData["profile.experience"] =
        experience.trim();
    }

    if (skills !== undefined) {
      updateData["profile.skills"] =
        cleanedSkills;
    }

    // ------------------------------
    // UPDATE USER
    // ------------------------------

    const updatedUser =
      await User.findByIdAndUpdate(
        userId,
        {
          $set: updateData,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};