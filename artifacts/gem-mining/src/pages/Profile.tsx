import React from "react";
import { format } from "date-fns";
import { Card, Input, Label, StatCard } from "@/components/ui";
import { useGetMe } from "@workspace/api-client-react";
import { ShieldCheck, User as UserIcon, Calendar, Fingerprint } from "lucide-react";

export default function Profile() {
  const { data: user } = useGetMe();

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account information and security settings.</p>
      </header>

      <Card className="p-8">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8 pb-8 border-b border-border">
          <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-primary text-3xl font-bold">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-foreground">{user.username}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
              <span className="text-xs px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md font-medium">ID: #{user.id}</span>
              <span className={`text-xs px-2.5 py-1 rounded-md font-bold ${user.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
              {user.isAdmin && <span className="text-xs px-2.5 py-1 bg-accent/10 text-accent rounded-md font-bold">Administrator</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <UserIcon size={20} className="text-primary" /> Account Details
            </h3>
            <div className="space-y-4">
              <div>
                <Label>Username</Label>
                <Input disabled value={user.username} className="bg-secondary/30" />
              </div>
              <div>
                <Label>Registration Date</Label>
                <div className="flex items-center gap-2 px-3 py-2 bg-secondary/30 rounded-md border border-border text-sm text-muted-foreground">
                  <Calendar size={16} />
                  {format(new Date(user.createdAt), 'PPP')}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldCheck size={20} className="text-primary" /> Security
            </h3>
            <div className="space-y-4">
              <div>
                <Label>Recovery Question</Label>
                <div className="flex items-center gap-2 px-3 py-2 bg-secondary/30 rounded-md border border-border text-sm text-foreground">
                  <Fingerprint size={16} className="text-primary" />
                  {user.recoveryQuestion}
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your recovery answer is securely hashed. If you lose your password, you'll need your recovery answer to regain access to your account.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
