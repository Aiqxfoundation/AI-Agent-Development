import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { Card, Button, Input, Label, Badge } from "@/components/ui";
import { useGetMyWithdrawals, useCreateWithdrawal, useGetWallet } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpCircle, AlertTriangle } from "lucide-react";

export default function Withdraw() {
  const [currency, setCurrency] = useState<"usdt" | "etr">("usdt");
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  
  const queryClient = useQueryClient();
  const { data: withdrawals, isLoading: isLoadingHistory } = useGetMyWithdrawals();
  const { data: wallet } = useGetWallet();
  const { mutate: withdraw, isPending } = useCreateWithdrawal();

  const available = currency === 'usdt' ? wallet?.usdtBalance : wallet?.etrBalance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(amount) <= 0) return toast.error("Enter a valid amount");
    if (Number(amount) > (available || 0)) return toast.error("Insufficient balance");

    withdraw({ data: { currency, amount: Number(amount), walletAddress } }, {
      onSuccess: () => {
        toast.success("Withdrawal request submitted for approval");
        setAmount("");
        setWalletAddress("");
        queryClient.invalidateQueries();
      },
      onError: (err: any) => toast.error(err.error || "Failed to submit withdrawal")
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header>
        <h1 className="text-4xl font-display font-bold gold-gradient-text text-glow">Withdraw Funds</h1>
        <p className="text-muted-foreground mt-2">Request external transfer of your assets to a personal wallet.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-8 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]">
          <h2 className="text-2xl font-display text-white mb-6 flex items-center gap-3">
            <ArrowUpCircle className="text-red-400" /> New Request
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label>Asset to Withdraw</Label>
              <select 
                className="flex w-full rounded-lg border border-primary/30 bg-input/80 px-4 py-3 text-base text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer"
                value={currency} 
                onChange={e => setCurrency(e.target.value as "usdt" | "etr")}
              >
                <option value="usdt">USDT (TRC20)</option>
                <option value="etr">ETR Token</option>
              </select>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <Label>Amount</Label>
                <span className="text-xs text-primary cursor-pointer hover:underline" onClick={() => setAmount(String(available || 0))}>
                  Available: {currency === 'usdt' ? formatCurrency(available || 0) : `${available || 0} ETR`}
                </span>
              </div>
              <Input type="number" step="0.01" min="1" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="0.00" />
            </div>
            <div>
              <Label>Destination Wallet Address</Label>
              <Input value={walletAddress} onChange={e => setWalletAddress(e.target.value)} required placeholder={`Enter ${currency.toUpperCase()} address`} />
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <AlertTriangle size={12} className="text-amber-500" /> Double check the address. Transfers are irreversible.
              </p>
            </div>
            <Button type="submit" className="w-full h-12 text-lg !bg-gradient-to-r !from-red-600 !to-red-900 border-red-500 shadow-red-500/20" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </Card>

        <Card className="p-8">
          <h2 className="text-2xl font-display text-primary mb-6">Withdrawal History</h2>
          {isLoadingHistory ? (
            <p className="text-muted-foreground">Loading history...</p>
          ) : !withdrawals?.length ? (
            <p className="text-muted-foreground py-8 text-center bg-black/20 rounded-xl border border-dashed border-primary/20">No withdrawals found.</p>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-xs uppercase text-muted-foreground border-b border-primary/20">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Asset</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10">
                  {withdrawals.map(w => (
                    <tr key={w.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-4">{format(new Date(w.createdAt), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-4 uppercase font-bold text-white">{w.currency}</td>
                      <td className="px-4 py-4 font-bold text-red-400">
                        {w.currency === 'usdt' ? formatCurrency(w.amount) : w.amount}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={w.status === 'approved' ? 'success' : w.status === 'rejected' ? 'destructive' : 'warning'}>
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
