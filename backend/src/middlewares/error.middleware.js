import ApiError from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  console.log(err);
  if (err instanceof ApiError) {
    return res
      .status(err.statusCode)
      .json({ success: err.success, message: err.message });
  } else {
    return res.status(500).json({
      success: err.success,
      message: "Internal server error.",
      stack: process.env.NODE_ENV === "development" ? err.stack : null,
    });
  }
};

export default errorHandler;
