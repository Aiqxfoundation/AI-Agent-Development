import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, Button, StatCard } from "@/components/ui";
import { useGetMiningStatus, useClaimGems } from "@workspace/api-client-react";
import { formatGems, cn } from "@/lib/utils";
import { Pickaxe, Timer, Target, Zap, TrendingUp, Wallet } from "lucide-react";
import { useLocation } from "wouter";

export default function Mining() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { data: status, isLoading } = useGetMiningStatus();
  const { mutate: claim, isPending } = useClaimGems();

  const handleClaim = () => {
    if (!status?.pendingGems || status.pendingGems <= 0) {
      toast.error("No gems available to claim right now.");
      return;
    }
    claim(undefined, {
      onSuccess: (res) => {
        toast.success(`Successfully claimed ${formatGems(res.claimedGems)} Gems!`);
        queryClient.invalidateQueries();
      },
      onError: (err: any) => toast.error(err.error || "Failed to claim gems")
    });
  };

  if (isLoading) return <div className="p-8 text-primary">Loading mining apparatus...</div>;
  if (!status) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            Gem Mining
            <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-secondary text-[10px] font-bold uppercase tracking-wider">
              <span className={cn("w-2 h-2 rounded-full", status.isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-muted-foreground")} />
              {status.isActive ? "Active" : "Inactive"}
            </div>
          </h1>
          <p className="text-muted-foreground mt-1">Extract ETR Gems passively over time based on your USDT deposit.</p>
        </div>
      </header>

      {!status.isActive ? (
        <Card className="p-16 text-center border-dashed border-2">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <Pickaxe size={32} className="text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Mining Core Inactive</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Your mining core is currently dormant. You must deposit USDT to activate the core and begin generating gems.
          </p>
          <Button onClick={() => setLocation("/deposit")} size="lg" className="px-10">
            Activate Core (Deposit USDT)
          </Button>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Gems Balance" 
              value={formatGems(status.gemsBalance)} 
              icon={<Wallet size={18} />}
              color="text-primary"
            />
            <StatCard 
              title="Pending Gems" 
              value={formatGems(status.pendingGems)} 
              icon={<TrendingUp size={18} />}
              color="text-emerald-500"
            />
            <StatCard 
              title="Daily Rate" 
              value={`+${formatGems(status.dailyRate)}`} 
              icon={<Zap size={18} />}
              color="text-amber-500"
            />
            <StatCard 
              title="Days Remaining" 
              value={status.daysRemaining} 
              icon={<Timer size={18} />}
              color="text-blue-500"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Mining Visualization */}
            <Card className="lg:col-span-2 p-12 flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="w-48 h-48 rounded-full bg-card border border-primary/20 flex items-center justify-center relative shadow-[0_0_50px_rgba(249,115,22,0.15)] mb-10"
                  style={{
                    boxShadow: "0 0 40px rgba(249,115,22,0.1), inset 0 0 20px rgba(249,115,22,0.05)"
                  }}
                >
                  <motion.div
                    animate={{ 
                      rotate: 360,
                    }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20"
                  />
                  <div className="bg-primary/10 p-6 rounded-full">
                    <Pickaxe size={64} className="text-primary" />
                  </div>
                </motion.div>

                <div className="text-center">
                  <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold mb-1">Accumulated Gems</p>
                  <p className="text-6xl font-bold text-foreground mb-8 font-mono">{formatGems(status.pendingGems)}</p>
                  
                  <Button 
                    size="lg" 
                    onClick={handleClaim} 
                    disabled={isPending || status.pendingGems <= 0} 
                    className="w-56 h-14 text-lg font-bold shadow-lg shadow-primary/20"
                  >
                    {isPending ? "Claiming..." : "Claim Gems"}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Progress and Info */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                  <Target size={20} className="text-primary" />
                  Mining Progress
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground font-mono font-bold">{status.progressPercent.toFixed(2)}%</span>
                    </div>
                    <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, status.progressPercent)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-primary" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Mined</p>
                      <p className="text-sm font-bold text-foreground font-mono">{formatGems(status.gemsBalance)}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Target</p>
                      <p className="text-sm font-bold text-foreground font-mono">{formatGems(status.totalGemsTarget)}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-primary/20 bg-primary/5">
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">Mining Intelligence</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your daily gem generation rate is calculated based on your active USDT stake. 
                  Gems are accumulated in real-time and can be claimed to your main balance at any time.
                  Once the target yield is reached, the mining cycle completes.
                </p>
                <div className="mt-4 pt-4 border-t border-primary/10">
                  <button onClick={() => setLocation("/deposit")} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                    Increase Stake to Boost Rate <TrendingUp size={12} />
                  </button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
