import { Request, Response, NextFunction } from "express";
import User from "../models/User";

export const isAdmin = async (req: any, res: Response, next: NextFunction) => {
  try {
    const clerkId = req.auth?.userId;

    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findOne({ clerkId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({ error: "Server error" });
  }
};