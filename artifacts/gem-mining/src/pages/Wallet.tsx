import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, Button, Input, Label } from "@/components/ui";
import { useGetWallet, useTransferEtr } from "@workspace/api-client-react";
import { formatCurrency, formatGems } from "@/lib/utils";
import { Send, Wallet as WalletIcon } from "lucide-react";

export default function Wallet() {
  const [toUsername, setToUsername] = useState("");
  const [amount, setAmount] = useState("");
  const queryClient = useQueryClient();

  const { data: wallet, isLoading } = useGetWallet();
  const { mutate: transfer, isPending } = useTransferEtr();

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(amount) <= 0) return toast.error("Enter a valid amount");

    transfer({ data: { toUsername, amount: Number(amount) } }, {
      onSuccess: () => {
        toast.success(`Successfully sent ${amount} ETR to ${toUsername}`);
        setToUsername("");
        setAmount("");
        queryClient.invalidateQueries();
      },
      onError: (err: any) => toast.error(err.error || "Transfer failed")
    });
  };

  if (isLoading) return <div className="p-8 text-primary">Loading wallet...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header>
        <h1 className="text-4xl font-display font-bold gold-gradient-text text-glow">Treasury</h1>
        <p className="text-muted-foreground mt-2">Manage your assets and transfer ETR to other miners.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-card to-card border-t-4 border-t-primary">
          <p className="text-sm font-semibold text-muted-foreground mb-2">Gems Balance</p>
          <p className="text-3xl font-display text-primary">{wallet ? formatGems(wallet.gemsBalance) : 0}</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-card to-card border-t-4 border-t-accent">
          <p className="text-sm font-semibold text-muted-foreground mb-2">ETR Balance</p>
          <p className="text-3xl font-display text-accent">{wallet?.etrBalance.toFixed(4) || 0}</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-card to-card border-t-4 border-t-emerald-500">
          <p className="text-sm font-semibold text-muted-foreground mb-2">USDT Balance</p>
          <p className="text-3xl font-display text-emerald-400">{wallet ? formatCurrency(wallet.usdtBalance) : 0}</p>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <Card className="p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
          <h2 className="text-2xl font-display text-white mb-6 flex items-center gap-3">
            <Send className="text-accent" /> Transfer ETR
          </h2>
          <form onSubmit={handleTransfer} className="space-y-5 relative z-10">
            <div>
              <Label>Recipient Username</Label>
              <Input value={toUsername} onChange={e => setToUsername(e.target.value)} required placeholder="e.g. miner123" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <Label>Amount (ETR)</Label>
                <span className="text-xs text-muted-foreground">Available: {wallet?.etrBalance || 0}</span>
              </div>
              <Input type="number" step="0.0001" min="0.0001" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="0.00" />
            </div>
            <Button type="submit" className="w-full h-12 text-lg bg-accent hover:bg-accent/80 text-white shadow-accent/20" disabled={isPending}>
              {isPending ? "Sending..." : "Send ETR"}
            </Button>
          </form>
        </Card>

        <Card className="p-8 flex flex-col items-center justify-center text-center bg-black/20 border-dashed border-2 border-primary/30">
          <WalletIcon size={64} className="text-primary/40 mb-6" />
          <h3 className="text-xl font-display text-white mb-2">Withdraw to External Wallet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">Ready to cash out? Head to the withdrawal section to transfer ETR or USDT to your external crypto wallet.</p>
          <a href="/withdraw" className="px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors">
            Go to Withdrawals
          </a>
        </Card>
      </div>
    </div>
  );
}
