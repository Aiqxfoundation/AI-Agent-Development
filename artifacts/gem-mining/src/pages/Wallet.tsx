import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, Button, Input, Label, StatCard } from "@/components/ui";
import { useGetWallet, useTransferEtr } from "@workspace/api-client-react";
import { formatCurrency, formatGems } from "@/lib/utils";
import { Send, Wallet as WalletIcon, Coins, Gem, DollarSign } from "lucide-react";
import { Link } from "wouter";

export default function Wallet() {
  const [toUsername, setToUsername] = useState("");
  const [amount, setAmount] = useState("");
  const queryClient = useQueryClient();

  const { data: wallet, isLoading } = useGetWallet();
  const { mutate: transfer, isPending } = useTransferEtr();

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

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
        <h1 className="text-3xl font-bold text-foreground">Wallet</h1>
        <p className="text-muted-foreground mt-1">Manage your assets and transfer ETR to other miners.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Gems Balance" 
          value={wallet ? formatGems(wallet.gemsBalance) : "0"} 
          icon={<Gem size={20} />} 
          className="border-t-4 border-t-primary"
        />
        <StatCard 
          title="ETR Balance" 
          value={wallet?.etrBalance.toFixed(4) || "0.0000"} 
          icon={<Coins size={20} />} 
          className="border-t-4 border-t-accent"
          color="text-accent"
        />
        <StatCard 
          title="USDT Balance" 
          value={wallet ? formatCurrency(wallet.usdtBalance) : "$0.00"} 
          icon={<DollarSign size={20} />} 
          className="border-t-4 border-t-emerald-500"
          color="text-emerald-500"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-8">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Send size={20} className="text-primary" /> Transfer ETR
          </h2>
          <form onSubmit={handleTransfer} className="space-y-5">
            <div>
              <Label>Recipient Username</Label>
              <Input 
                value={toUsername} 
                onChange={e => setToUsername(e.target.value)} 
                required 
                placeholder="Enter username" 
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <Label>Amount (ETR)</Label>
                <span className="text-xs text-muted-foreground">Available: {wallet?.etrBalance || 0}</span>
              </div>
              <Input 
                type="number" 
                step="0.0001" 
                min="0.0001" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                required 
                placeholder="0.00" 
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Sending..." : "Send ETR"}
            </Button>
          </form>
        </Card>

        <Card className="p-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <WalletIcon size={32} className="text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Withdraw Assets</h3>
          <p className="text-muted-foreground mb-6 max-w-xs">Transfer your ETR or USDT to an external crypto wallet.</p>
          <Link href="/withdraw">
            <Button variant="outline" className="w-full">
              Go to Withdrawals
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
