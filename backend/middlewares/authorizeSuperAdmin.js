import { SuperAdmin } from "../models/adminModel.js";
import { catchAsyncError } from "./catchAsyncError.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";

export const authorizeSuperAdmin = catchAsyncError(async (req, res, next) => {
  const token =
    req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }

  // Verify JWT token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Find the superadmin by ID
  const superAdmin = await SuperAdmin.findById(decoded.id);
  if (!superAdmin) {
    return next(new ErrorHandler("SuperAdmin not found", 404));
  }

  // Attach the superadmin to the request object
  req.user = superAdmin;
  next();
});
