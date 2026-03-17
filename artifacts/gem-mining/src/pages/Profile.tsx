import React from "react";
import { format } from "date-fns";
import { Card, Input, Label } from "@/components/ui";
import { useGetMe } from "@workspace/api-client-react";
import { ShieldCheck, User as UserIcon } from "lucide-react";

export default function Profile() {
  const { data: user } = useGetMe();

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <header>
        <h1 className="text-4xl font-display font-bold gold-gradient-text text-glow">Identity & Security</h1>
        <p className="text-muted-foreground mt-2">View your account details and security settings.</p>
      </header>

      <Card className="p-8 border-primary/20">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-primary/10">
          <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary">
            <UserIcon size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-display text-white">{user.username}</h2>
            <div className="flex gap-2 mt-2">
              <span className="text-xs px-2 py-1 bg-black/50 rounded-md text-muted-foreground">ID: #{user.id}</span>
              <span className={`text-xs px-2 py-1 rounded-md font-bold ${user.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
              {user.isAdmin && <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded-md font-bold">Admin</span>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label>Username</Label>
              <Input disabled value={user.username} className="bg-black/50 opacity-70" />
            </div>
            <div>
              <Label>Account Created</Label>
              <Input disabled value={format(new Date(user.createdAt), 'PPP')} className="bg-black/50 opacity-70" />
            </div>
          </div>

          <div className="pt-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="text-primary" /> Security Recovery
            </h3>
            <div className="space-y-4">
              <div>
                <Label>Your Recovery Question</Label>
                <Input disabled value={user.recoveryQuestion} className="bg-black/50 border-primary/40 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Your recovery answer is securely hashed and cannot be displayed. You will need it to reset your password if lost.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
