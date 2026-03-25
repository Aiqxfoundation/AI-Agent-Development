import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { Card, Button, Input, Label, Badge } from "@/components/ui";
import { useGetMyWithdrawals, useCreateWithdrawal, useGetWallet } from "@workspace/api-client-react";
import { formatCurrency, cn } from "@/lib/utils";
import { ArrowUpCircle, AlertTriangle } from "lucide-react";

export default function Withdraw() {
  const [currency, setCurrency] = useState<"usdt" | "etr">("usdt");
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  const queryClient = useQueryClient();
  const { data: withdrawals, isLoading: isLoadingHistory } = useGetMyWithdrawals();
  const { data: wallet } = useGetWallet();
  const { mutate: withdraw, isPending } = useCreateWithdrawal();

  const available = currency === "usdt" ? wallet?.usdtBalance : wallet?.etrBalance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (numAmount > (available || 0)) {
      toast.error("Insufficient balance");
      return;
    }
    if (!walletAddress.trim()) {
      toast.error("Please enter a wallet address");
      return;
    }

    withdraw(
      { data: { currency, amount: numAmount, walletAddress: walletAddress.trim() } },
      {
        onSuccess: () => {
          toast.success("Withdrawal request submitted for approval");
          setAmount("");
          setWalletAddress("");
          queryClient.invalidateQueries();
        },
        onError: (err: any) => toast.error(err?.data?.error || err?.message || "Failed to submit withdrawal"),
      }
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Withdraw Funds</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Request an external transfer of your assets to a personal wallet on BSC (BEP-20).
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-3">
            <ArrowUpCircle size={20} className="text-primary" /> New Request
          </h2>

          {/* Currency Toggle */}
          <div className="flex gap-1 p-1 bg-secondary rounded-lg mb-6">
            <button
              type="button"
              onClick={() => setCurrency("usdt")}
              className={cn(
                "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all",
                currency === "usdt"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              USDT (BSC/BEP-20)
            </button>
            <button
              type="button"
              onClick={() => setCurrency("etr")}
              className={cn(
                "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all",
                currency === "etr"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              ETR Token
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex justify-between mb-2">
                <Label>Amount</Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => setAmount(String(available || 0))}
                >
                  Available: {currency === "usdt" ? formatCurrency(available || 0) : `${(available || 0).toFixed(4)} ETR`}
                </button>
              </div>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder="0.00"
              />
            </div>

            <div>
              <Label>Destination Wallet Address (BSC / BEP-20)</Label>
              <Input
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                required
                placeholder="0x..."
                className="mt-1 font-mono text-sm"
              />
              <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-xs text-amber-500 flex items-center gap-1">
                  <AlertTriangle size={14} className="shrink-0" />
                  Double-check the address. Transfers are irreversible once approved.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              variant="destructive"
              className="w-full h-12 text-base mt-4"
              disabled={isPending}
            >
              {isPending ? "Submitting..." : "Submit Withdrawal Request"}
            </Button>
          </form>
        </Card>

        {/* History */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Withdrawal History</h2>
          {isLoadingHistory ? (
            <p className="text-muted-foreground text-sm">Loading history...</p>
          ) : !withdrawals?.length ? (
            <p className="text-muted-foreground py-8 text-center bg-secondary/20 rounded-lg border border-dashed border-border text-sm">
              No withdrawals found.
            </p>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-sm whitespace-nowrap defi-table">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Asset</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-4 text-muted-foreground">
                        {format(new Date(w.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-4 uppercase font-semibold text-foreground">{w.currency}</td>
                      <td className="px-4 py-4 font-semibold text-destructive">
                        {w.currency === "usdt" ? formatCurrency(w.amount) : `${w.amount} ETR`}
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          variant={
                            w.status === "approved"
                              ? "success"
                              : w.status === "rejected"
                              ? "destructive"
                              : "warning"
                          }
                        >
                          {w.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
