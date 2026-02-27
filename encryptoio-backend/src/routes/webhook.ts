import { Request, Response } from "express";
import { Webhook } from "svix";
import User from "../models/User";

export const webhookHandler = async (req: Request, res: Response) => {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      throw new Error("CLERK_WEBHOOK_SECRET is not set");
    }

    const payload = req.body as Buffer;
    const bodyString = payload.toString("utf8");

    const headers = req.headers;
    const svix_id = headers["svix-id"] as string;
    const svix_timestamp = headers["svix-timestamp"] as string;
    const svix_signature = headers["svix-signature"] as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({ error: "Missing svix headers" });
    }

    const wh = new Webhook(WEBHOOK_SECRET);
    wh.verify(bodyString, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });

    const evt = JSON.parse(bodyString);

    if (evt.type === "user.created") {
      if (
        !evt ||
        !evt.data ||
        !Array.isArray(evt.data.email_addresses) ||
        evt.data.email_addresses.length === 0 ||
        !evt.data.email_addresses[0]?.email_address
      ) {
        return res.status(400).json({ error: "Invalid Clerk payload: missing email" });
      }

      const email = evt.data.email_addresses[0].email_address;
      const { id, username } = evt.data;

      const existing = await User.findOne({ clerkId: id });
      if (existing) {
        return res.status(200).json({ message: "User already exists" });
      }

      await User.create({
        clerkId: id,
        email,
        username: username || email,
        status: "pending",
      });
    }

    return res.status(200).json({ message: "Webhook received" });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(400).json({ error: "Webhook verification failed" });
  }
};
