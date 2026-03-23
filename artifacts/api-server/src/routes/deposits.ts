import { Router } from "express";
import { db, depositsTable, depositAddressesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
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
      assignedAddress: d.assignedAddress,
      hasScreenshot: !!d.screenshotData,
      screenshotData: d.screenshotData,
      createdAt: d.createdAt.toISOString(),
      approvedAt: d.approvedAt?.toISOString() ?? null,
    })));
  } catch (err) {
    console.error("Get deposits error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /deposits/generate-address — returns a random active BSC address
router.get("/generate-address", requireAuth, async (_req, res) => {
  try {
    const addresses = await db.select()
      .from(depositAddressesTable)
      .where(eq(depositAddressesTable.isActive, true));

    if (!addresses.length) {
      res.status(503).json({ error: "No deposit addresses available. Please contact support." });
      return;
    }

    const random = addresses[Math.floor(Math.random() * addresses.length)];
    res.json({
      id: random.id,
      address: random.address,
      label: random.label,
      network: random.network,
    });
  } catch (err) {
    console.error("Generate address error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /deposits
router.post("/", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { amountUsdt, txHash, screenshotData, assignedAddress } = req.body;

    if (!amountUsdt || amountUsdt < 10) {
      res.status(400).json({ error: "Minimum deposit is $10 USDT" });
      return;
    }

    if (!txHash && !screenshotData) {
      res.status(400).json({ error: "Please provide either a transaction hash or upload a payment screenshot." });
      return;
    }

    // Validate base64 screenshot size (max ~5MB base64)
    if (screenshotData && screenshotData.length > 7 * 1024 * 1024) {
      res.status(400).json({ error: "Screenshot file size too large. Maximum 5MB." });
      return;
    }

    const [deposit] = await db.insert(depositsTable).values({
      userId: user.id,
      amountUsdt,
      txHash: txHash || null,
      screenshotData: screenshotData || null,
      assignedAddress: assignedAddress || null,
    }).returning();

    res.status(201).json({
      id: deposit.id,
      amountUsdt: deposit.amountUsdt,
      status: deposit.status,
      txHash: deposit.txHash,
      assignedAddress: deposit.assignedAddress,
      hasScreenshot: !!deposit.screenshotData,
      createdAt: deposit.createdAt.toISOString(),
      approvedAt: null,
    });
  } catch (err) {
    console.error("Create deposit error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /deposits/:id/screenshot — user deletes their own screenshot
router.delete("/:id/screenshot", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const depositId = parseInt(req.params.id);

    const [deposit] = await db.select()
      .from(depositsTable)
      .where(and(eq(depositsTable.id, depositId), eq(depositsTable.userId, user.id)));

    if (!deposit) {
      res.status(404).json({ error: "Deposit not found" });
      return;
    }

    if (deposit.status !== "pending") {
      res.status(400).json({ error: "Cannot edit a processed deposit" });
      return;
    }

    await db.update(depositsTable)
      .set({ screenshotData: null })
      .where(eq(depositsTable.id, depositId));

    res.json({ message: "Screenshot removed" });
  } catch (err) {
    console.error("Delete screenshot error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
