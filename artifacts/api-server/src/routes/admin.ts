import { Router } from "express";
import { db, usersTable, depositsTable, withdrawalsTable, conversionsTable, systemConfigTable } from "@workspace/db";
import { eq, count, sum } from "drizzle-orm";
import { requireAdmin } from "../lib/auth.js";

const router = Router();

// GET /admin/users
router.get("/users", requireAdmin, async (_req, res) => {
  try {
    const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
    res.json(users.map(u => ({
      id: u.id,
      username: u.username,
      isActive: u.isActive,
      isBanned: u.isBanned,
      isAdmin: u.isAdmin,
      gemsBalance: u.gemsBalance,
      etrBalance: u.etrBalance,
      usdtBalance: u.usdtBalance,
      totalDepositUsdt: u.totalDepositUsdt,
      createdAt: u.createdAt.toISOString(),
    })));
  } catch (err) {
    console.error("Admin get users error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /admin/users/:userId/ban
router.post("/users/:userId/ban", requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { banned } = req.body;

    if (typeof banned !== "boolean") {
      res.status(400).json({ error: "banned field must be boolean" });
      return;
    }

    await db.update(usersTable).set({ isBanned: banned }).where(eq(usersTable.id, userId));
    res.json({ message: `User ${banned ? "banned" : "unbanned"} successfully` });
  } catch (err) {
    console.error("Admin ban user error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /admin/deposits
router.get("/deposits", requireAdmin, async (_req, res) => {
  try {
    const deposits = await db.select({
      id: depositsTable.id,
      userId: depositsTable.userId,
      username: usersTable.username,
      amountUsdt: depositsTable.amountUsdt,
      status: depositsTable.status,
      txHash: depositsTable.txHash,
      createdAt: depositsTable.createdAt,
    }).from(depositsTable)
      .leftJoin(usersTable, eq(depositsTable.userId, usersTable.id))
      .orderBy(depositsTable.createdAt);

    res.json(deposits.map(d => ({
      id: d.id,
      userId: d.userId,
      username: d.username || "Unknown",
      amountUsdt: d.amountUsdt,
      status: d.status,
      txHash: d.txHash,
      createdAt: d.createdAt.toISOString(),
    })));
  } catch (err) {
    console.error("Admin get deposits error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /admin/deposits/:depositId/approve
router.post("/deposits/:depositId/approve", requireAdmin, async (req, res) => {
  try {
    const depositId = parseInt(req.params.depositId);

    const [deposit] = await db.select().from(depositsTable).where(eq(depositsTable.id, depositId));
    if (!deposit) {
      res.status(404).json({ error: "Deposit not found" });
      return;
    }

    if (deposit.status !== "pending") {
      res.status(400).json({ error: "Deposit is not pending" });
      return;
    }

    const now = new Date();

    // Approve deposit and update user
    await db.update(depositsTable).set({
      status: "approved",
      approvedAt: now,
    }).where(eq(depositsTable.id, depositId));

    // Get current user data
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, deposit.userId));
    if (user) {
      const newTotalDeposit = user.totalDepositUsdt + deposit.amountUsdt;
      const wasAlreadyActive = user.isActive;

      await db.update(usersTable).set({
        isActive: true,
        totalDepositUsdt: newTotalDeposit,
        // Start mining if not already active
        miningStartedAt: wasAlreadyActive ? user.miningStartedAt : now,
      }).where(eq(usersTable.id, user.id));
    }

    res.json({ message: "Deposit approved successfully" });
  } catch (err) {
    console.error("Admin approve deposit error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /admin/deposits/:depositId/reject
router.post("/deposits/:depositId/reject", requireAdmin, async (req, res) => {
  try {
    const depositId = parseInt(req.params.depositId);

    const [deposit] = await db.select().from(depositsTable).where(eq(depositsTable.id, depositId));
    if (!deposit) {
      res.status(404).json({ error: "Deposit not found" });
      return;
    }

    await db.update(depositsTable).set({ status: "rejected" }).where(eq(depositsTable.id, depositId));
    res.json({ message: "Deposit rejected" });
  } catch (err) {
    console.error("Admin reject deposit error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /admin/withdrawals
router.get("/withdrawals", requireAdmin, async (_req, res) => {
  try {
    const withdrawals = await db.select({
      id: withdrawalsTable.id,
      userId: withdrawalsTable.userId,
      username: usersTable.username,
      currency: withdrawalsTable.currency,
      amount: withdrawalsTable.amount,
      walletAddress: withdrawalsTable.walletAddress,
      status: withdrawalsTable.status,
      createdAt: withdrawalsTable.createdAt,
    }).from(withdrawalsTable)
      .leftJoin(usersTable, eq(withdrawalsTable.userId, usersTable.id))
      .orderBy(withdrawalsTable.createdAt);

    res.json(withdrawals.map(w => ({
      id: w.id,
      userId: w.userId,
      username: w.username || "Unknown",
      currency: w.currency,
      amount: w.amount,
      walletAddress: w.walletAddress,
      status: w.status,
      createdAt: w.createdAt.toISOString(),
    })));
  } catch (err) {
    console.error("Admin get withdrawals error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /admin/withdrawals/:withdrawalId/approve
router.post("/withdrawals/:withdrawalId/approve", requireAdmin, async (req, res) => {
  try {
    const withdrawalId = parseInt(req.params.withdrawalId);
    await db.update(withdrawalsTable).set({
      status: "approved",
      processedAt: new Date(),
    }).where(eq(withdrawalsTable.id, withdrawalId));

    res.json({ message: "Withdrawal approved" });
  } catch (err) {
    console.error("Admin approve withdrawal error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /admin/withdrawals/:withdrawalId/reject
router.post("/withdrawals/:withdrawalId/reject", requireAdmin, async (req, res) => {
  try {
    const withdrawalId = parseInt(req.params.withdrawalId);

    const [withdrawal] = await db.select().from(withdrawalsTable).where(eq(withdrawalsTable.id, withdrawalId));
    if (!withdrawal) {
      res.status(404).json({ error: "Withdrawal not found" });
      return;
    }

    // Refund the user
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, withdrawal.userId));
    if (user) {
      if (withdrawal.currency === "etr") {
        await db.update(usersTable).set({ etrBalance: user.etrBalance + withdrawal.amount }).where(eq(usersTable.id, user.id));
      } else {
        await db.update(usersTable).set({ usdtBalance: user.usdtBalance + withdrawal.amount }).where(eq(usersTable.id, user.id));
      }
    }

    await db.update(withdrawalsTable).set({
      status: "rejected",
      processedAt: new Date(),
    }).where(eq(withdrawalsTable.id, withdrawalId));

    res.json({ message: "Withdrawal rejected and refunded" });
  } catch (err) {
    console.error("Admin reject withdrawal error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /admin/stats
router.get("/stats", requireAdmin, async (_req, res) => {
  try {
    const users = await db.select().from(usersTable);
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const bannedUsers = users.filter(u => u.isBanned).length;

    const totalGemsMined = users.reduce((sum, u) => sum + u.gemsBalance, 0);
    const totalDepositsUsdt = users.reduce((sum, u) => sum + u.totalDepositUsdt, 0);

    const [etrRow] = await db.select({ total: sum(conversionsTable.outputAmount) })
      .from(conversionsTable).where(eq(conversionsTable.outputType, "etr"));
    const totalEtrConverted = etrRow?.total ? parseFloat(etrRow.total) : 0;

    const [totalEtrRow] = await db.select().from(systemConfigTable).where(eq(systemConfigTable.key, "total_etr_swapped"));
    const totalEtrSupplyUsed = totalEtrRow ? parseFloat(totalEtrRow.value) : 0;

    const deposits = await db.select().from(depositsTable);
    const pendingDeposits = deposits.filter(d => d.status === "pending").length;

    const withdrawals = await db.select().from(withdrawalsTable);
    const pendingWithdrawals = withdrawals.filter(w => w.status === "pending").length;

    res.json({
      totalUsers,
      activeUsers,
      bannedUsers,
      totalGemsMined,
      totalEtrConverted,
      totalEtrSupplyUsed,
      totalDepositsUsdt,
      pendingDeposits,
      pendingWithdrawals,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
