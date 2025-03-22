import ErrorHandler from "./error.js";
import { catchAsyncError } from "./catchAsyncError.js";

export const verifyIP = catchAsyncError(async (req, res, next) => {
  const superAdmin = req.user; // Assuming the superadmin is authenticated
  const clientIP = req.ip || req.connection.remoteAddress;

  // Check if the client's IP is in the allowedIPs list
  if (!superAdmin.allowedIPs.includes(clientIP)) {
    return next(
      new ErrorHandler(
        `Access denied. IP address (${clientIP}) is not allowed.`,
        403
      )
    );
  }

  next();
});
