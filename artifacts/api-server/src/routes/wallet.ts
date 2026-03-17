import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

// GET /wallet
router.get("/", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    res.json({
      gemsBalance: user.gemsBalance,
      etrBalance: user.etrBalance,
      usdtBalance: user.usdtBalance,
    });
  } catch (err) {
    console.error("Wallet error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /wallet/transfer
router.post("/transfer", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { toUsername, amount } = req.body;

    if (!toUsername || !amount || amount <= 0) {
      res.status(400).json({ error: "Invalid transfer request" });
      return;
    }

    if (user.etrBalance < amount) {
      res.status(400).json({ error: "Insufficient ETR balance" });
      return;
    }

    if (toUsername === user.username) {
      res.status(400).json({ error: "Cannot transfer to yourself" });
      return;
    }

    const [recipient] = await db.select().from(usersTable).where(eq(usersTable.username, toUsername));
    if (!recipient) {
      res.status(400).json({ error: "Recipient user not found" });
      return;
    }

    if (recipient.isBanned) {
      res.status(400).json({ error: "Recipient account is not accessible" });
      return;
    }

    // Deduct from sender
    await db.update(usersTable).set({
      etrBalance: user.etrBalance - amount,
    }).where(eq(usersTable.id, user.id));

    // Add to recipient
    await db.update(usersTable).set({
      etrBalance: recipient.etrBalance + amount,
    }).where(eq(usersTable.id, recipient.id));

    res.json({ message: `Successfully transferred ${amount} ETR to ${toUsername}` });
  } catch (err) {
    console.error("Transfer error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
