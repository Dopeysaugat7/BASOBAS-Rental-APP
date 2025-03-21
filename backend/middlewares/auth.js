import { catchAsyncError } from "./catchAsyncError";
import ErrorHandler from "../utils/error.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("User is not authenticated", 400));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
});
