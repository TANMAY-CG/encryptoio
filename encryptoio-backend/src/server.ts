import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db";
import { webhookHandler } from "./routes/webhook";
import adminRoutes from "./routes/admin";
import userRoutes from "./routes/user";
dotenv.config();

const app = express();

// Middleware
app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.post(
  "/webhook/clerk",
  express.raw({ type: "application/json" }),
  webhookHandler
);

app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
// Health check route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Encrypto.io backend running" });
});

connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
