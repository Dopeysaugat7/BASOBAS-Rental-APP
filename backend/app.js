import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./database/dbConnection.js";
import { errorMiddleware } from "./middlewares/error.js";
import userRouter from "./routes/userRouter.js";
import superAdminRouter from "./routes/superAdminRouter.js";
import propertyRouter from "./routes/propertyRouter.js";
import visitRouter from "./routes/visitRouter.js";
import bookingRouter from "./routes/bookingRouter.js";
import favoritesRouter from "./routes/favoriteRouter.js";
import paymentRouter from "./routes/paymentRouter.js";
import chatRouter from "./routes/chatRouter.js";
import reviewRouter from "./routes/reviewRouter.js";
import { removeUnverifiedAccounts } from "./automation/removeUnverifiedAccounts.js";
import path from "path";
import { createServer } from "http";
import { initializeSocket } from "./socket.js";

export const app = express();
config({ path: "./config.env" });

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Make io instance available in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", true);

// Serve static files from uploads directory
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/v1/user", userRouter);
app.use("/api/v1/superadmin", superAdminRouter);
app.use("/api/properties", propertyRouter);
app.use("/api/visits", visitRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/chat", chatRouter);
app.use("/api/reviews", reviewRouter);

// removeUnverifiedAccounts();
connectDB();

app.use(errorMiddleware);
