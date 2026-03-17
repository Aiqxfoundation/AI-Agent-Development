import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import {
  calculatePendingGems,
  DAILY_GEMS_PER_100_USDT,
  GEMS_PER_100_USDT,
  MINING_PERIOD_DAYS
} from "../lib/mining.js";

const router = Router();

// GET /mining/status
router.get("/status", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;

    if (!user.isActive || !user.miningStartedAt) {
      res.json({
        isActive: false,
        gemsBalance: user.gemsBalance,
        pendingGems: 0,
        totalDepositUsdt: user.totalDepositUsdt,
        dailyRate: 0,
        miningStartedAt: null,
        lastClaimedAt: null,
        progressPercent: 0,
        totalGemsTarget: 0,
        daysRemaining: 0,
      });
      return;
    }

    const pendingGems = calculatePendingGems(
      user.totalDepositUsdt,
      user.miningStartedAt,
      user.lastClaimedAt
    );

    const dailyRate = (user.totalDepositUsdt / 100) * DAILY_GEMS_PER_100_USDT;
    const totalGemsTarget = (user.totalDepositUsdt / 100) * GEMS_PER_100_USDT;

    const now = new Date();
    const totalDaysSinceStart = (now.getTime() - user.miningStartedAt.getTime()) / (1000 * 60 * 60 * 24);
    const daysElapsed = Math.min(totalDaysSinceStart, MINING_PERIOD_DAYS);
    const daysRemaining = Math.max(0, MINING_PERIOD_DAYS - daysElapsed);
    const progressPercent = (daysElapsed / MINING_PERIOD_DAYS) * 100;

    res.json({
      isActive: true,
      gemsBalance: user.gemsBalance,
      pendingGems: Math.floor(pendingGems),
      totalDepositUsdt: user.totalDepositUsdt,
      dailyRate: Math.floor(dailyRate),
      miningStartedAt: user.miningStartedAt.toISOString(),
      lastClaimedAt: user.lastClaimedAt?.toISOString() ?? null,
      progressPercent: Math.min(100, progressPercent),
      totalGemsTarget,
      daysRemaining: Math.ceil(daysRemaining),
    });
  } catch (err) {
    console.error("Mining status error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /mining/claim
router.post("/claim", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;

    if (!user.isActive || !user.miningStartedAt) {
      res.status(400).json({ error: "Mining not active. Deposit USDT to activate." });
      return;
    }

    const pendingGems = calculatePendingGems(
      user.totalDepositUsdt,
      user.miningStartedAt,
      user.lastClaimedAt
    );

    if (pendingGems < 1) {
      res.status(400).json({ error: "No gems to claim yet" });
      return;
    }

    const claimedGems = Math.floor(pendingGems);
    const newBalance = user.gemsBalance + claimedGems;

    await db.update(usersTable).set({
      gemsBalance: newBalance,
      lastClaimedAt: new Date(),
    }).where(eq(usersTable.id, user.id));

    res.json({ claimedGems, newBalance });
  } catch (err) {
    console.error("Claim gems error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
