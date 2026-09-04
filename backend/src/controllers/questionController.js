import Question from "../models/Question.js";

export const createQuestion = async (req, res, next) => {
  try {
    const {
      question,
      category,
      difficulty = "medium",
      answer = "",
      explanation = "",
    } = req.body;

    if (!question || !category) {
      return res.status(400).json({
        success: false,
        message: "Question and category are required",
      });
    }

    const newQuestion = await Question.create({
      user: req.user.userId,
      question,
      category,
      difficulty,
      answer,
      explanation,
    });

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      question: newQuestion,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find({
      user: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      questions,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.status(200).json({
      success: true,
      question,
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (req, res, next) => {
  try {
    const allowedFields = [
      "question",
      "category",
      "difficulty",
      "answer",
      "explanation",
      "pinned",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const question = await Question.findOneAndUpdate(
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

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      question,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const togglePin = async (req, res, next) => {
  try {
    const question = await Question.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    question.pinned = !question.pinned;

    await question.save();

    res.status(200).json({
      success: true,
      message: question.pinned
        ? "Question pinned"
        : "Question unpinned",
      question,
    });
  } catch (error) {
    next(error);
  }
};