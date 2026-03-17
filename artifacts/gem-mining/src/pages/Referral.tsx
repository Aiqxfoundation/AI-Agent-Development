import React from "react";
import { toast } from "sonner";
import { Card, Button, Badge } from "@/components/ui";
import { useGetMyReferrals } from "@workspace/api-client-react";
import { formatGems } from "@/lib/utils";
import { Users, Copy, Network } from "lucide-react";
import { format } from "date-fns";

export default function Referral() {
  const { data: refData, isLoading } = useGetMyReferrals();

  const handleCopy = () => {
    if (!refData) return;
    const link = `${window.location.origin}/signup?ref=${refData.referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Referral link copied!");
  };

  if (isLoading) return <div className="p-8 text-primary">Loading network...</div>;
  if (!refData) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header>
        <h1 className="text-4xl font-display font-bold gold-gradient-text text-glow">Referral Network</h1>
        <p className="text-muted-foreground mt-2">Build your syndicate. Earn 15% from Level 1 and 5% from Level 2 gem claims.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-8 md:col-span-2 flex flex-col justify-center border-primary/30">
          <h2 className="text-lg font-semibold text-muted-foreground mb-4">Your Invitation Link</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 bg-black/50 border border-primary/30 p-4 rounded-xl font-mono text-primary truncate">
              {window.location.origin}/signup?ref={refData.referralCode}
            </div>
            <Button onClick={handleCopy} className="h-[58px] shrink-0"><Copy className="mr-2" size={18}/> Copy Link</Button>
          </div>
        </Card>

        <Card className="p-8 bg-gradient-to-br from-card to-primary/10 border-primary/50 text-center flex flex-col justify-center">
          <p className="text-sm font-semibold text-primary mb-2">Total Bonus Earned</p>
          <p className="text-4xl font-display font-bold text-white text-glow mb-1">{formatGems(refData.totalRewardGems)}</p>
          <p className="text-xs text-muted-foreground">Gems</p>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-2xl font-display text-white mb-6 flex items-center gap-2">
            <Users className="text-primary" /> Level 1 <Badge className="ml-2 bg-primary/20">15%</Badge>
          </h2>
          {!refData.level1.length ? (
            <p className="text-muted-foreground text-sm">No direct referrals yet.</p>
          ) : (
            <div className="space-y-3">
              {refData.level1.map(u => (
                <div key={u.username} className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-white/5">
                  <div>
                    <p className="font-bold text-white">{u.username}</p>
                    <p className="text-xs text-muted-foreground">Joined {format(new Date(u.joinedAt), 'MMM d, yyyy')}</p>
                  </div>
                  <Badge variant={u.isActive ? 'success' : 'default'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-display text-white mb-6 flex items-center gap-2">
            <Network className="text-accent" /> Level 2 <Badge className="ml-2 bg-accent/20 text-accent">5%</Badge>
          </h2>
          {!refData.level2.length ? (
            <p className="text-muted-foreground text-sm">No secondary referrals yet.</p>
          ) : (
            <div className="space-y-3">
              {refData.level2.map(u => (
                <div key={u.username} className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-white/5">
                  <div>
                    <p className="font-bold text-white">{u.username}</p>
                    <p className="text-xs text-muted-foreground">Joined {format(new Date(u.joinedAt), 'MMM d, yyyy')}</p>
                  </div>
                  <Badge variant={u.isActive ? 'success' : 'default'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
