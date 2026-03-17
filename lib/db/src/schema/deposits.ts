import { pgTable, serial, integer, doublePrecision, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const depositsTable = pgTable("deposits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amountUsdt: doublePrecision("amount_usdt").notNull(),
  status: text("status").notNull().default("pending"), // pending | approved | rejected
  txHash: text("tx_hash"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  approvedAt: timestamp("approved_at"),
});

export const insertDepositSchema = createInsertSchema(depositsTable).omit({
  id: true,
  createdAt: true,
  approvedAt: true,
  status: true,
});

export type InsertDeposit = z.infer<typeof insertDepositSchema>;
export type Deposit = typeof depositsTable.$inferSelect;
