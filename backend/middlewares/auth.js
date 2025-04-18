// Importing a custom utility to catch async errors and forward them to the error handler
import { catchAsyncError } from "./catchAsyncError.js";
// Importing the jsonwebtoken library to verify JWT tokens
import jwt from "jsonwebtoken";
// Importing a custom error handler class for sending error responses
import ErrorHandler from "./error.js";
// Importing the User model to fetch user data from the database
import { User } from "../models/userModel.js";

// Middleware to check if a user is authenticated
export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  // Extracting the token from cookies
  const { token } = req.cookies;

  // If no token is found, throw an authentication error
  if (!token) {
    return next(new ErrorHandler("User is not authenticated", 400));
  }

  // Verifying the token using the secret key from environment variables
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Fetching the user data based on the ID in the decoded token and attaching it to the request object
  req.user = await User.findById(decoded.id);

  // Proceed to the next middleware or route handler
  next();
});
