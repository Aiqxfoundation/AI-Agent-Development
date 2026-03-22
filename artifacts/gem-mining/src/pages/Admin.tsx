import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { Card, Button, Badge, StatCard } from "@/components/ui";
import { 
  useAdminGetUsers, useAdminBanUser, 
  useAdminGetDeposits, useAdminApproveDeposit, useAdminRejectDeposit,
  useAdminGetWithdrawals, useAdminApproveWithdrawal, useAdminRejectWithdrawal,
  useAdminGetStats 
} from "@workspace/api-client-react";
import { formatCurrency, formatGems } from "@/lib/utils";
import { Users, UserX, UserCheck, Gem, DollarSign, Repeat, Clock, CreditCard, Shield } from "lucide-react";

export default function Admin() {
  const [tab, setTab] = useState<"stats"|"users"|"deposits"|"withdrawals">("stats");

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="text-primary" /> Admin Panel
          </h1>
          <p className="text-muted-foreground mt-1">Ecosystem management and monitoring dashboard.</p>
        </div>
      </header>

      <div className="flex border-b border-border w-full overflow-x-auto custom-scrollbar">
        {(["stats", "users", "deposits", "withdrawals"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-4 text-sm font-medium capitalize transition-all border-b-2 -mb-[2px] whitespace-nowrap ${
              tab === t 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "stats" && <AdminStats />}
        {tab === "users" && <AdminUsers />}
        {tab === "deposits" && <AdminDeposits />}
        {tab === "withdrawals" && <AdminWithdrawals />}
      </div>
    </div>
  );
}

function AdminStats() {
  const { data: stats, isLoading } = useAdminGetStats();
  if (isLoading) return <div className="text-primary">Loading stats...</div>;
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Total Users" value={stats.totalUsers} icon={<Users size={20} />} />
      <StatCard title="Active Users" value={stats.activeUsers} icon={<UserCheck size={20} />} color="text-emerald-500" />
      <StatCard title="Banned Users" value={stats.bannedUsers} icon={<UserX size={20} />} color="text-red-500" />
      <StatCard title="Total Gems Mined" value={formatGems(stats.totalGemsMined)} icon={<Gem size={20} />} color="text-primary" />
      
      <StatCard title="USDT Deposited" value={formatCurrency(stats.totalDepositsUsdt)} icon={<DollarSign size={20} />} color="text-emerald-500" />
      <StatCard title="ETR Converted" value={formatGems(stats.totalEtrConverted)} icon={<Repeat size={20} />} />
      <StatCard 
        title="Pending Deposits" 
        value={stats.pendingDeposits} 
        icon={<Clock size={20} />} 
        color="text-amber-500"
        className={stats.pendingDeposits > 0 ? "border-amber-500/50 bg-amber-500/5" : ""}
      />
      <StatCard 
        title="Pending Withdrawals" 
        value={stats.pendingWithdrawals} 
        icon={<CreditCard size={20} />} 
        color="text-amber-500"
        className={stats.pendingWithdrawals > 0 ? "border-amber-500/50 bg-amber-500/5" : ""}
      />
    </div>
  );
}

function AdminUsers() {
  const { data: users, isLoading } = useAdminGetUsers();
  const { mutate: banUser } = useAdminBanUser();
  const qc = useQueryClient();

  const handleBan = (id: number, current: boolean) => {
    banUser({ userId: id, data: { banned: !current } }, {
      onSuccess: () => { toast.success("User status updated"); qc.invalidateQueries(); }
    });
  };

  if (isLoading) return <div className="p-12 text-center text-muted-foreground">Loading users...</div>;

  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm border-collapse defi-table">
          <thead>
            <tr className="bg-secondary/50 text-muted-foreground">
              <th className="p-4 font-medium border-b border-border">ID / Username</th>
              <th className="p-4 font-medium border-b border-border">Status</th>
              <th className="p-4 font-medium border-b border-border">Balances</th>
              <th className="p-4 font-medium border-b border-border text-right">Total Dep</th>
              <th className="p-4 font-medium border-b border-border">Joined</th>
              <th className="p-4 font-medium border-b border-border text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users?.map(u => (
              <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{u.username}</span>
                    <span className="text-xs text-muted-foreground">#{u.id}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {u.isActive ? <Badge variant="success">Active</Badge> : <Badge>Inactive</Badge>}
                    {u.isAdmin && <Badge variant="warning">Admin</Badge>}
                    {u.isBanned && <Badge variant="destructive">Banned</Badge>}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-0.5 text-xs">
                    <span className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Gems:</span>
                      <span className="text-foreground font-mono">{formatGems(u.gemsBalance)}</span>
                    </span>
                    <span className="flex justify-between gap-4">
                      <span className="text-muted-foreground">ETR:</span>
                      <span className="text-accent font-mono">{u.etrBalance.toFixed(2)}</span>
                    </span>
                    <span className="flex justify-between gap-4">
                      <span className="text-muted-foreground">USDT:</span>
                      <span className="text-emerald-500 font-mono">{u.usdtBalance.toFixed(2)}</span>
                    </span>
                  </div>
                </td>
                <td className="p-4 text-right font-mono text-emerald-500">{formatCurrency(u.totalDepositUsdt)}</td>
                <td className="p-4 text-muted-foreground text-xs">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                <td className="p-4 text-right">
                  {!u.isAdmin && (
                    <Button 
                      variant={u.isBanned ? 'default' : 'outline'} 
                      size="sm" 
                      onClick={() => handleBan(u.id, u.isBanned)}
                      className={u.isBanned ? "bg-emerald-600 hover:bg-emerald-500" : "text-destructive hover:bg-destructive/10 border-destructive/20"}
                    >
                      {u.isBanned ? "Unban" : "Ban"}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function AdminDeposits() {
  const { data: deposits, isLoading } = useAdminGetDeposits();
  const { mutate: approve } = useAdminApproveDeposit();
  const { mutate: reject } = useAdminRejectDeposit();
  const qc = useQueryClient();

  const handleAction = (id: number, action: 'approve' | 'reject') => {
    const mutator = action === 'approve' ? approve : reject;
    mutator({ depositId: id }, {
      onSuccess: () => { toast.success(`Deposit ${action}d`); qc.invalidateQueries(); },
      onError: (err: any) => toast.error(err.error || "Action failed")
    });
  };

  if (isLoading) return <div className="p-12 text-center text-muted-foreground">Loading deposits...</div>;

  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm border-collapse defi-table">
          <thead>
            <tr className="bg-secondary/50 text-muted-foreground">
              <th className="p-4 font-medium border-b border-border">User</th>
              <th className="p-4 font-medium border-b border-border text-right">Amount</th>
              <th className="p-4 font-medium border-b border-border">TX Hash</th>
              <th className="p-4 font-medium border-b border-border">Date</th>
              <th className="p-4 font-medium border-b border-border">Status</th>
              <th className="p-4 font-medium border-b border-border text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {deposits?.map(d => (
              <tr key={d.id} className={`hover:bg-secondary/20 transition-colors ${d.status === 'pending' ? 'bg-amber-500/5' : ''}`}>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{d.username}</span>
                    <span className="text-xs text-muted-foreground">#{d.userId}</span>
                  </div>
                </td>
                <td className="p-4 text-right font-bold text-emerald-500">{formatCurrency(d.amountUsdt)}</td>
                <td className="p-4 font-mono text-xs max-w-[120px] truncate">{d.txHash || '-'}</td>
                <td className="p-4 text-muted-foreground text-xs">{format(new Date(d.createdAt), 'MMM d, HH:mm')}</td>
                <td className="p-4">
                  <Badge variant={d.status === 'approved' ? 'success' : d.status === 'rejected' ? 'destructive' : 'warning'}>
                    {d.status}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  {d.status === 'pending' && (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={() => handleAction(d.id, 'approve')} className="bg-emerald-600 hover:bg-emerald-500 h-8 px-3">Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => handleAction(d.id, 'reject')} className="text-destructive border-destructive/20 h-8 px-3">Reject</Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function AdminWithdrawals() {
  const { data: withdrawals, isLoading } = useAdminGetWithdrawals();
  const { mutate: approve } = useAdminApproveWithdrawal();
  const { mutate: reject } = useAdminRejectWithdrawal();
  const qc = useQueryClient();

  const handleAction = (id: number, action: 'approve' | 'reject') => {
    const mutator = action === 'approve' ? approve : reject;
    mutator({ withdrawalId: id }, {
      onSuccess: () => { toast.success(`Withdrawal ${action}d`); qc.invalidateQueries(); },
      onError: (err: any) => toast.error(err.error || "Action failed")
    });
  };

  if (isLoading) return <div className="p-12 text-center text-muted-foreground">Loading withdrawals...</div>;

  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm border-collapse defi-table">
          <thead>
            <tr className="bg-secondary/50 text-muted-foreground">
              <th className="p-4 font-medium border-b border-border">User</th>
              <th className="p-4 font-medium border-b border-border text-right">Asset/Amount</th>
              <th className="p-4 font-medium border-b border-border">Wallet</th>
              <th className="p-4 font-medium border-b border-border">Date</th>
              <th className="p-4 font-medium border-b border-border">Status</th>
              <th className="p-4 font-medium border-b border-border text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {withdrawals?.map(w => (
              <tr key={w.id} className={`hover:bg-secondary/20 transition-colors ${w.status === 'pending' ? 'bg-amber-500/5' : ''}`}>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{w.username}</span>
                    <span className="text-xs text-muted-foreground">#{w.userId}</span>
                  </div>
                </td>
                <td className="p-4 text-right font-bold">
                  {w.currency === 'usdt' ? <span className="text-emerald-500">{formatCurrency(w.amount)}</span> : <span className="text-accent">{w.amount} ETR</span>}
                </td>
                <td className="p-4 font-mono text-xs max-w-[150px] truncate">{w.walletAddress}</td>
                <td className="p-4 text-muted-foreground text-xs">{format(new Date(w.createdAt), 'MMM d, HH:mm')}</td>
                <td className="p-4">
                  <Badge variant={w.status === 'approved' ? 'success' : w.status === 'rejected' ? 'destructive' : 'warning'}>
                    {w.status}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  {w.status === 'pending' && (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={() => handleAction(w.id, 'approve')} className="bg-emerald-600 hover:bg-emerald-500 h-8 px-3">Mark Paid</Button>
                      <Button size="sm" variant="outline" onClick={() => handleAction(w.id, 'reject')} className="text-destructive border-destructive/20 h-8 px-3">Reject</Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
