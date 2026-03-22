import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { Card, Button, Input, Label, Badge } from "@/components/ui";
import { useGetMyDeposits, useCreateDeposit } from "@workspace/api-client-react";
import { Copy, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const TRC20_ADDRESS = "TGbsMRjcSgKgWJZhBJKoLJY9VqZj8cRYUG";

export default function Deposit() {
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const queryClient = useQueryClient();

  const { data: deposits, isLoading } = useGetMyDeposits();
  const { mutate: createDeposit, isPending } = useCreateDeposit();

  const handleCopy = () => {
    navigator.clipboard.writeText(TRC20_ADDRESS);
    toast.success("Wallet address copied to clipboard!");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    createDeposit({ data: { amountUsdt: Number(amount), txHash } }, {
      onSuccess: () => {
        toast.success("Deposit request submitted! Awaiting admin approval.");
        setAmount("");
        setTxHash("");
        queryClient.invalidateQueries();
      },
      onError: (err: any) => toast.error(err.error || "Failed to submit deposit")
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Deposit USDT</h1>
        <p className="text-muted-foreground text-sm mt-1">Send TRC20 USDT to activate your account and start mining.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-primary" /> Instructions
            </h2>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>1. Send ONLY <strong className="text-foreground">USDT (TRC20 Network)</strong> to the address below.</p>
              <p>2. After sending, enter the exact amount and Transaction Hash (TXID) here to notify us.</p>
              <p>3. Deposits are manually verified and usually approved within 2 hours.</p>
            </div>
          </div>

          <div className="bg-secondary/50 border border-border p-4 rounded-lg">
            <Label className="text-xs text-muted-foreground mb-2 block">Official TRC20 Address</Label>
            <div className="flex items-center gap-3">
              <code className="flex-1 text-primary text-base font-mono break-all bg-background/50 p-2 rounded border border-border">{TRC20_ADDRESS}</code>
              <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0 h-10 w-10 p-0">
                <Copy size={16} />
              </Button>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg flex gap-3 text-amber-500">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <p className="text-sm">Minimum deposit is $100. Sending other tokens or using a different network will result in permanent loss of funds.</p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Submit Transfer Details</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label>Amount Sent (USDT)</Label>
              <Input type="number" step="0.01" min="1" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="e.g. 100" />
            </div>
            <div>
              <Label>Transaction Hash (TXID)</Label>
              <Input value={txHash} onChange={e => setTxHash(e.target.value)} required placeholder="e.g. 8a3b..." />
            </div>
            <Button type="submit" className="w-full h-12 text-base mt-4" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit Deposit Request"}
            </Button>
          </form>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Deposit History</h2>
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading history...</p>
        ) : !deposits?.length ? (
          <p className="text-muted-foreground py-8 text-center bg-secondary/20 rounded-lg border border-dashed border-border text-sm">No deposits found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap defi-table">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">TX Hash</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {deposits.map(d => (
                  <tr key={d.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-4 text-muted-foreground">{format(new Date(d.createdAt), 'MMM d, yyyy HH:mm')}</td>
                    <td className="px-4 py-4 font-semibold text-emerald-500">{formatCurrency(d.amountUsdt)}</td>
                    <td className="px-4 py-4 font-mono text-xs max-w-[200px] truncate text-muted-foreground">{d.txHash}</td>
                    <td className="px-4 py-4">
                      <Badge variant={d.status === 'approved' ? 'success' : d.status === 'rejected' ? 'destructive' : 'warning'}>
                        {d.status.toUpperCase()}
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
  );
}
