import { Router } from "express";
import { db, withdrawalsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

// GET /withdrawals
router.get("/", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const withdrawals = await db.select().from(withdrawalsTable)
      .where(eq(withdrawalsTable.userId, user.id))
      .orderBy(withdrawalsTable.createdAt);

    res.json(withdrawals.map(w => ({
      id: w.id,
      currency: w.currency,
      amount: w.amount,
      walletAddress: w.walletAddress,
      status: w.status,
      createdAt: w.createdAt.toISOString(),
      processedAt: w.processedAt?.toISOString() ?? null,
    })));
  } catch (err) {
    console.error("Get withdrawals error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /withdrawals
router.post("/", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { currency, amount, walletAddress } = req.body;

    if (!currency || !["etr", "usdt"].includes(currency)) {
      res.status(400).json({ error: "Invalid currency. Use 'etr' or 'usdt'" });
      return;
    }

    if (!amount || amount <= 0) {
      res.status(400).json({ error: "Invalid amount" });
      return;
    }

    if (!walletAddress) {
      res.status(400).json({ error: "Wallet address required" });
      return;
    }

    // Check balance
    if (currency === "etr" && user.etrBalance < amount) {
      res.status(400).json({ error: "Insufficient ETR balance" });
      return;
    }
    if (currency === "usdt" && user.usdtBalance < amount) {
      res.status(400).json({ error: "Insufficient USDT balance" });
      return;
    }

    // Deduct from balance immediately (pending withdrawal)
    if (currency === "etr") {
      await db.update(usersTable).set({ etrBalance: user.etrBalance - amount }).where(eq(usersTable.id, user.id));
    } else {
      await db.update(usersTable).set({ usdtBalance: user.usdtBalance - amount }).where(eq(usersTable.id, user.id));
    }

    const [withdrawal] = await db.insert(withdrawalsTable).values({
      userId: user.id,
      currency,
      amount,
      walletAddress,
    }).returning();

    res.status(201).json({
      id: withdrawal.id,
      currency: withdrawal.currency,
      amount: withdrawal.amount,
      walletAddress: withdrawal.walletAddress,
      status: withdrawal.status,
      createdAt: withdrawal.createdAt.toISOString(),
      processedAt: null,
    });
  } catch (err) {
    console.error("Create withdrawal error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
