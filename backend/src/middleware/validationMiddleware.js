export default function validationMiddleware(schema) {
  return (req, res, next) => {
    const result = schema(req.body);
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }
    next();
  };
}
