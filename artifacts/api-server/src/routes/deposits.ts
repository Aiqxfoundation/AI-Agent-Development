import { Router } from "express";
import { db, depositsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

// GET /deposits
router.get("/", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const deposits = await db.select().from(depositsTable)
      .where(eq(depositsTable.userId, user.id))
      .orderBy(depositsTable.createdAt);

    res.json(deposits.map(d => ({
      id: d.id,
      amountUsdt: d.amountUsdt,
      status: d.status,
      txHash: d.txHash,
      createdAt: d.createdAt.toISOString(),
      approvedAt: d.approvedAt?.toISOString() ?? null,
    })));
  } catch (err) {
    console.error("Get deposits error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /deposits
router.post("/", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { amountUsdt, txHash } = req.body;

    if (!amountUsdt || amountUsdt < 10) {
      res.status(400).json({ error: "Minimum deposit is $10 USDT" });
      return;
    }

    const [deposit] = await db.insert(depositsTable).values({
      userId: user.id,
      amountUsdt,
      txHash: txHash || null,
    }).returning();

    res.status(201).json({
      id: deposit.id,
      amountUsdt: deposit.amountUsdt,
      status: deposit.status,
      txHash: deposit.txHash,
      createdAt: deposit.createdAt.toISOString(),
      approvedAt: null,
    });
  } catch (err) {
    console.error("Create deposit error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
