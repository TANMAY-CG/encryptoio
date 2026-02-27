import { Router } from "express";
import mongoose from "mongoose";
import User from "../models/User";
import { requireAuth } from "../middleware/requireAuth";
import { isAdmin } from "../middleware/isAdmin";

const router = Router();

// Get all pending users
router.get("/pending", requireAuth, isAdmin, async (req, res) => {
  try {
    const users = await User.find({ status: "pending" });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pending users" });
  }
});

// Approve user
router.post("/approve/:id", requireAuth, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User approved", user });
  } catch (error) {
    res.status(500).json({ error: "Approval failed" });
  }
});

// Reject user
router.delete("/reject/:id", requireAuth, isAdmin, async (req, res) => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ message: "User rejected and deleted" });
  } catch (error) {
    res.status(500).json({ error: "Rejection failed" });
  }
});

export default router;