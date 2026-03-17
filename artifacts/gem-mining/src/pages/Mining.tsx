import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, Button } from "@/components/ui";
import { useGetMiningStatus, useClaimGems } from "@workspace/api-client-react";
import { formatGems } from "@/lib/utils";
import { Pickaxe, Timer, Target, Zap } from "lucide-react";

export default function Mining() {
  const queryClient = useQueryClient();
  const { data: status, isLoading } = useGetMiningStatus();
  const { mutate: claim, isPending } = useClaimGems();

  const handleClaim = () => {
    if (!status?.pendingGems || status.pendingGems <= 0) {
      return toast.error("No gems available to claim right now.");
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
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-display font-bold gold-gradient-text text-glow tracking-widest">Mining Core</h1>
        <p className="text-muted-foreground mt-3 text-lg">Extract ETR Gems passively over time.</p>
      </header>

      {!status.isActive ? (
        <Card className="p-12 text-center border-amber-500/30 bg-amber-500/5">
          <Pickaxe size={64} className="mx-auto text-amber-500/50 mb-6" />
          <h2 className="text-2xl font-display text-amber-400 mb-2">Mining Inactive</h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            Your mining core is currently dormant. You must deposit USDT to activate the core and begin generating gems.
          </p>
          <a href="/deposit" className="inline-block px-8 py-3 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            Activate Core (Deposit USDT)
          </a>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Mystical Orb Section */}
          <div className="flex flex-col items-center justify-center relative py-12">
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: ["0 0 40px rgba(168,85,247,0.3)", "0 0 80px rgba(168,85,247,0.6)", "0 0 40px rgba(168,85,247,0.3)"]
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="relative rounded-full z-10"
            >
              <img src={`${import.meta.env.BASE_URL}images/mining-orb.png`} className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-full" alt="Mining Orb" />
            </motion.div>

            <div className="mt-12 text-center relative z-20">
              <p className="text-muted-foreground uppercase tracking-widest text-sm font-bold mb-2">Ready to Claim</p>
              <p className="text-5xl font-display text-white text-glow mb-8">{formatGems(status.pendingGems)}</p>
              <Button size="lg" onClick={handleClaim} disabled={isPending || status.pendingGems <= 0} className="w-64 h-14 text-xl">
                {isPending ? "Extracting..." : "Claim Gems"}
              </Button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="space-y-6">
            <Card className="p-8">
              <h3 className="text-2xl font-display text-primary border-b border-primary/20 pb-4 mb-6 flex items-center gap-3">
                <Zap /> Core Performance
              </h3>
              
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground font-medium flex items-center gap-2"><Target size={16} /> Target Yield</span>
                    <span className="text-white font-mono">{formatGems(status.gemsBalance)} / {formatGems(status.totalGemsTarget)}</span>
                  </div>
                  <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-primary/30 p-0.5">
                    <div className="h-full bg-gradient-to-r from-primary to-amber-300 rounded-full" style={{ width: `${Math.min(100, status.progressPercent)}%` }} />
                  </div>
                  <p className="text-xs text-right mt-2 text-primary/70">{status.progressPercent.toFixed(2)}% Completed</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-black/40 p-5 rounded-xl border border-primary/10">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Daily Generation</p>
                    <p className="text-xl font-bold text-emerald-400">+{formatGems(status.dailyRate)}</p>
                  </div>
                  <div className="bg-black/40 p-5 rounded-xl border border-primary/10">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><Timer size={14}/> Est. Time Left</p>
                    <p className="text-xl font-bold text-white">{status.daysRemaining} Days</p>
                  </div>
                </div>

                <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl text-sm text-primary/90">
                  <p><strong>Note:</strong> Your daily generation rate is directly tied to your total active USDT deposit. Increase your deposit to boost production speed.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
