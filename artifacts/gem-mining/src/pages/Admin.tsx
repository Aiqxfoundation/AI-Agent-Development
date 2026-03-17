import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { Card, Button, Badge } from "@/components/ui";
import { 
  useAdminGetUsers, useAdminBanUser, 
  useAdminGetDeposits, useAdminApproveDeposit, useAdminRejectDeposit,
  useAdminGetWithdrawals, useAdminApproveWithdrawal, useAdminRejectWithdrawal,
  useAdminGetStats 
} from "@workspace/api-client-react";
import { formatCurrency, formatGems } from "@/lib/utils";

export default function Admin() {
  const [tab, setTab] = useState<"stats"|"users"|"deposits"|"withdrawals">("stats");

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <header>
        <h1 className="text-4xl font-display font-bold text-accent text-glow">Admin Overseer</h1>
        <p className="text-muted-foreground mt-2">Manage the entire ecosystem from this command center.</p>
      </header>

      <div className="flex overflow-x-auto gap-2 p-1 bg-black/40 rounded-xl border border-white/5 inline-flex">
        {(["stats", "users", "deposits", "withdrawals"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${tab === t ? 'bg-accent text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "stats" && <AdminStats />}
      {tab === "users" && <AdminUsers />}
      {tab === "deposits" && <AdminDeposits />}
      {tab === "withdrawals" && <AdminWithdrawals />}
    </div>
  );
}

function AdminStats() {
  const { data: stats, isLoading } = useAdminGetStats();
  if (isLoading) return <div className="text-primary">Loading...</div>;
  if (!stats) return null;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="p-6 border-accent/30"><p className="text-sm text-muted-foreground">Total Users</p><p className="text-3xl font-display">{stats.totalUsers}</p></Card>
      <Card className="p-6 border-emerald-500/30"><p className="text-sm text-muted-foreground">Active Users</p><p className="text-3xl font-display text-emerald-400">{stats.activeUsers}</p></Card>
      <Card className="p-6 border-red-500/30"><p className="text-sm text-muted-foreground">Banned Users</p><p className="text-3xl font-display text-red-400">{stats.bannedUsers}</p></Card>
      
      <Card className="p-6 border-primary/30"><p className="text-sm text-muted-foreground">Total Gems Mined</p><p className="text-3xl font-display text-primary">{formatGems(stats.totalGemsMined)}</p></Card>
      <Card className="p-6"><p className="text-sm text-muted-foreground">Total USDT Deposited</p><p className="text-3xl font-display text-emerald-400">{formatCurrency(stats.totalDepositsUsdt)}</p></Card>
      <Card className="p-6"><p className="text-sm text-muted-foreground">ETR Converted</p><p className="text-3xl font-display">{formatGems(stats.totalEtrConverted)}</p></Card>
      
      <Card className="p-6 bg-amber-500/10 border-amber-500/30"><p className="text-sm text-amber-500">Pending Deposits</p><p className="text-3xl font-display text-amber-400">{stats.pendingDeposits}</p></Card>
      <Card className="p-6 bg-amber-500/10 border-amber-500/30"><p className="text-sm text-amber-500">Pending Withdrawals</p><p className="text-3xl font-display text-amber-400">{stats.pendingWithdrawals}</p></Card>
    </div>
  );
}

function AdminUsers() {
  const { data: users } = useAdminGetUsers();
  const { mutate: banUser } = useAdminBanUser();
  const qc = useQueryClient();

  const handleBan = (id: number, current: boolean) => {
    banUser({ userId: id, data: { banned: !current } }, {
      onSuccess: () => { toast.success("User status updated"); qc.invalidateQueries(); }
    });
  };

  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-black/50 text-muted-foreground text-xs uppercase">
            <tr>
              <th className="p-4">ID / Username</th>
              <th className="p-4">Status</th>
              <th className="p-4">Balances</th>
              <th className="p-4">Total Dep</th>
              <th className="p-4">Joined</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users?.map(u => (
              <tr key={u.id} className="hover:bg-white/5">
                <td className="p-4"><span className="text-xs text-muted-foreground mr-2">#{u.id}</span><strong className="text-white">{u.username}</strong></td>
                <td className="p-4 flex gap-1">
                  {u.isActive ? <Badge variant="success">Active</Badge> : <Badge>Inactive</Badge>}
                  {u.isAdmin && <Badge variant="warning">Admin</Badge>}
                  {u.isBanned && <Badge variant="destructive">Banned</Badge>}
                </td>
                <td className="p-4 text-xs space-y-1">
                  <div>G: {formatGems(u.gemsBalance)}</div>
                  <div className="text-accent">E: {u.etrBalance.toFixed(2)}</div>
                  <div className="text-emerald-400">U: {u.usdtBalance.toFixed(2)}</div>
                </td>
                <td className="p-4 text-emerald-400">{formatCurrency(u.totalDepositUsdt)}</td>
                <td className="p-4 text-muted-foreground">{format(new Date(u.createdAt), 'MMM d, yy')}</td>
                <td className="p-4">
                  {!u.isAdmin && (
                    <Button variant={u.isBanned ? 'default' : 'outline'} size="sm" onClick={() => handleBan(u.id, u.isBanned)} className={u.isBanned ? "bg-emerald-600 hover:bg-emerald-500" : "border-red-500 text-red-500 hover:bg-red-500/20"}>
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
  const { data: deposits } = useAdminGetDeposits();
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

  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-black/50 text-muted-foreground text-xs uppercase">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Amount</th>
              <th className="p-4">TX Hash</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {deposits?.map(d => (
              <tr key={d.id} className="hover:bg-white/5">
                <td className="p-4"><strong className="text-white">{d.username}</strong> <span className="text-xs text-muted-foreground">#{d.userId}</span></td>
                <td className="p-4 font-bold text-emerald-400">{formatCurrency(d.amountUsdt)}</td>
                <td className="p-4 font-mono text-xs">{d.txHash || '-'}</td>
                <td className="p-4 text-muted-foreground">{format(new Date(d.createdAt), 'MMM d, HH:mm')}</td>
                <td className="p-4"><Badge variant={d.status === 'approved' ? 'success' : d.status === 'rejected' ? 'destructive' : 'warning'}>{d.status}</Badge></td>
                <td className="p-4 flex gap-2">
                  {d.status === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => handleAction(d.id, 'approve')} className="bg-emerald-600 hover:bg-emerald-500 border-none text-white h-8 px-3">Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => handleAction(d.id, 'reject')} className="border-red-500 text-red-500 hover:bg-red-500/20 h-8 px-3">Reject</Button>
                    </>
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
  const { data: withdrawals } = useAdminGetWithdrawals();
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

  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-black/50 text-muted-foreground text-xs uppercase">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Asset/Amount</th>
              <th className="p-4">Wallet</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {withdrawals?.map(w => (
              <tr key={w.id} className="hover:bg-white/5">
                <td className="p-4"><strong className="text-white">{w.username}</strong> <span className="text-xs text-muted-foreground">#{w.userId}</span></td>
                <td className="p-4 font-bold">
                  {w.currency === 'usdt' ? <span className="text-emerald-400">{formatCurrency(w.amount)}</span> : <span className="text-accent">{w.amount} ETR</span>}
                </td>
                <td className="p-4 font-mono text-xs">{w.walletAddress}</td>
                <td className="p-4 text-muted-foreground">{format(new Date(w.createdAt), 'MMM d, HH:mm')}</td>
                <td className="p-4"><Badge variant={w.status === 'approved' ? 'success' : w.status === 'rejected' ? 'destructive' : 'warning'}>{w.status}</Badge></td>
                <td className="p-4 flex gap-2">
                  {w.status === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => handleAction(w.id, 'approve')} className="bg-emerald-600 hover:bg-emerald-500 border-none text-white h-8 px-3">Mark Paid</Button>
                      <Button size="sm" variant="outline" onClick={() => handleAction(w.id, 'reject')} className="border-red-500 text-red-500 hover:bg-red-500/20 h-8 px-3">Reject</Button>
                    </>
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
