const errorMiddleware = (err, req, res, _next) => {
  console.error("API Error:", {
    message: err.message,
    method: req.method,
    path: req.originalUrl,
  });

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Database validation failed",
      errors: Object.values(err.errors).map(
        (error) => error.message
      ),
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid resource ID",
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate value already exists",
    });
  }

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Internal server error"
        : err.message,
  });
};

export default errorMiddleware;