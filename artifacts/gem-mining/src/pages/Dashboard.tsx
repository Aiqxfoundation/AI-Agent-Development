import React from "react";
import { Card, StatCard, Badge } from "@/components/ui";
import { cn, formatCurrency, formatGems } from "@/lib/utils";
import { useGetWallet, useGetMiningStatus, useGetSystemStats } from "@workspace/api-client-react";
import { Pickaxe, Gem, Coins, Activity, ArrowUpRight, Repeat, Wallet, Users, LayoutDashboard } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: wallet } = useGetWallet();
  const { data: mining } = useGetMiningStatus();
  const { data: stats } = useGetSystemStats();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your mining activity and platform statistics.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Gems Balance" 
          value={wallet ? formatGems(wallet.gemsBalance) : "..."} 
          icon={<Gem size={20} />}
          color="text-primary"
        />
        <StatCard 
          title="ETR Balance" 
          value={wallet?.etrBalance !== undefined ? wallet.etrBalance.toFixed(2) : "..."} 
          icon={<Coins size={20} />}
          color="text-amber-500"
        />
        <StatCard 
          title="USDT Balance" 
          value={wallet ? formatCurrency(wallet.usdtBalance) : "..."} 
          icon={<Wallet size={20} />}
          color="text-emerald-500"
        />
        <StatCard 
          title="Daily Mining Rate" 
          value={mining ? `+${formatGems(mining.dailyRate)}` : "..."} 
          subtitle="Gems per day"
          icon={<Pickaxe size={20} />}
          color="text-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="text-primary w-5 h-5" /> Mining Status
            </h2>
            {mining?.isActive && (
              <Badge variant="success">Active</Badge>
            )}
          </div>

          {mining ? (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress to Target</span>
                  <span className="font-medium">{mining.progressPercent.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500" 
                    style={{ width: `${mining.progressPercent}%` }} 
                  />
                </div>
                <div className="flex justify-between text-xs mt-2 text-muted-foreground">
                  <span>{formatGems(mining.gemsBalance)} mined</span>
                  <span>Target: {formatGems(mining.totalGemsTarget)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Time Remaining</p>
                  <p className="text-sm font-semibold">{mining.daysRemaining} Days</p>
                </div>
                <Link to="/mining">
                  <Badge variant="info" className="cursor-pointer hover:bg-blue-500/20 transition-colors">
                    View Details
                  </Badge>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Pickaxe className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
              <p className="text-muted-foreground">No active mining session found.</p>
              <Link to="/deposit" className="mt-4 text-primary hover:underline text-sm font-medium">
                Start mining today
              </Link>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <LayoutDashboard className="text-primary w-5 h-5" /> Platform Stats
          </h2>
          {stats ? (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">ETR Circulating Supply</span>
                  <span className="font-mono text-xs">{formatGems(stats.etrCirculating)} / {formatGems(stats.etrTotalSupply)}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500/60" 
                    style={{ width: `${(stats.etrCirculating / stats.etrTotalSupply) * 100}%` }} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/30 p-4 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground">Conversion Rate</p>
                  <p className="text-lg font-bold text-foreground mt-1">{formatGems(stats.conversionRateGemsPerEtr)} <span className="text-xs font-normal text-muted-foreground">Gems/ETR</span></p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground">Rate Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={cn("w-2 h-2 rounded-full", stats.isDynamicRateActive ? "bg-amber-500" : "bg-emerald-500")} />
                    <p className={cn("text-sm font-bold", stats.isDynamicRateActive ? "text-amber-500" : "text-emerald-500")}>
                      {stats.isDynamicRateActive ? "Halved" : "Standard"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-secondary rounded w-3/4" />
              <div className="h-8 bg-secondary rounded" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-20 bg-secondary rounded" />
                <div className="h-20 bg-secondary rounded" />
              </div>
            </div>
          )}
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard 
            to="/deposit" 
            icon={<ArrowUpRight className="text-emerald-500" />} 
            title="Deposit" 
            subtitle="Add USDT to start mining" 
          />
          <QuickActionCard 
            to="/mining" 
            icon={<Pickaxe className="text-blue-500" />} 
            title="Mining" 
            subtitle="Claim your daily rewards" 
          />
          <QuickActionCard 
            to="/convert" 
            icon={<Repeat className="text-amber-500" />} 
            title="Convert" 
            subtitle="Exchange Gems for ETR" 
          />
          <QuickActionCard 
            to="/referral" 
            icon={<Users className="text-purple-500" />} 
            title="Referrals" 
            subtitle="Invite friends & earn 20%" 
          />
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ to, icon, title, subtitle }: { to: string, icon: React.ReactNode, title: string, subtitle: string }) {
  return (
    <Link to={to}>
      <Card className="p-4 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-secondary rounded-lg group-hover:bg-primary/10 transition-colors">
            {icon}
          </div>
          <div>
            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{title}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

