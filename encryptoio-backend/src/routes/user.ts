import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import User from "../models/User";

const router = Router();

router.get("/me", requireAuth, async (req: any, res) => {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      email: user.email,
      status: user.status,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

export default router;