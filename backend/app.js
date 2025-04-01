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
import { removeUnverifiedAccounts } from "./automation/removeUnverifiedAccounts.js";
import path from "path";

export const app = express();
config({ path: "./config.env" });

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

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

// removeUnverifiedAccounts();
connectDB();

app.use(errorMiddleware);
