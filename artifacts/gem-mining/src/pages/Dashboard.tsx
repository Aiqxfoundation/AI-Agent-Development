import React from "react";
import { Card } from "@/components/ui";
import { cn, formatCurrency, formatGems } from "@/lib/utils";
import { useGetWallet, useGetMiningStatus, useGetSystemStats } from "@workspace/api-client-react";
import { Pickaxe, Gem, Coins, Activity } from "lucide-react";

export default function Dashboard() {
  const { data: wallet } = useGetWallet();
  const { data: mining } = useGetMiningStatus();
  const { data: stats } = useGetSystemStats();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-display font-bold gold-gradient-text text-glow">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of your mining empire and assets.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-t-4 border-t-primary">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-xl text-primary">
              <Gem size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Total Gems</p>
              <p className="text-2xl font-bold text-foreground">{wallet ? formatGems(wallet.gemsBalance) : "..."}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-t-4 border-t-accent">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/20 rounded-xl text-accent">
              <Coins size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">ETR Balance</p>
              <p className="text-2xl font-bold text-foreground">{wallet?.etrBalance.toFixed(2) || "..."}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-t-4 border-t-emerald-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
              <WalletIcon size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">USDT Balance</p>
              <p className="text-2xl font-bold text-foreground">{wallet ? formatCurrency(wallet.usdtBalance) : "..."}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-t-4 border-t-blue-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
              <Pickaxe size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Daily Mining Rate</p>
              <p className="text-2xl font-bold text-foreground">{mining ? formatGems(mining.dailyRate) : "..."}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <Card className="p-8">
          <h2 className="text-2xl font-display font-semibold text-primary mb-6 flex items-center gap-2">
            <Activity className="text-primary" /> System Statistics
          </h2>
          {stats ? (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">ETR Circulating Supply</span>
                  <span className="font-mono">{formatGems(stats.etrCirculating)} / {formatGems(stats.etrTotalSupply)}</span>
                </div>
                <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: `${(stats.etrCirculating / stats.etrTotalSupply) * 100}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 p-4 rounded-xl border border-primary/10">
                  <p className="text-xs text-muted-foreground">Current Conversion Rate</p>
                  <p className="text-lg font-bold text-primary mt-1">{formatGems(stats.conversionRateGemsPerEtr)} Gems / ETR</p>
                </div>
                <div className="bg-black/30 p-4 rounded-xl border border-primary/10">
                  <p className="text-xs text-muted-foreground">Rate Status</p>
                  <p className={cn("text-lg font-bold mt-1", stats.isDynamicRateActive ? "text-amber-400" : "text-emerald-400")}>
                    {stats.isDynamicRateActive ? "Dynamic (Halved)" : "Standard"}
                  </p>
                </div>
              </div>
            </div>
          ) : <p className="text-muted-foreground">Loading stats...</p>}
        </Card>

        <Card className="p-8 relative overflow-hidden flex flex-col justify-center items-center text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
          <img src={`${import.meta.env.BASE_URL}images/mining-orb.png`} className="w-32 h-32 rounded-full shadow-[0_0_40px_rgba(251,191,36,0.3)] mb-6 opacity-80" />
          <h3 className="text-2xl font-display text-white mb-2">Ready to expand?</h3>
          <p className="text-muted-foreground mb-6">Deposit more USDT to significantly increase your daily gem generation rate.</p>
          <a href="/deposit" className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-amber-400 transition-colors shadow-lg shadow-primary/20">
            Increase Power
          </a>
        </Card>
      </div>
    </div>
  );
}

function WalletIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}
