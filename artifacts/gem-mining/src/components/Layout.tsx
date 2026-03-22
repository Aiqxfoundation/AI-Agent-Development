import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, ArrowDownCircle, Pickaxe, ArrowRightLeft, 
  Wallet, ArrowUpCircle, Users, UserCircle, ShieldAlert, LogOut, Menu, X 
} from "lucide-react";
import { cn, formatGems } from "@/lib/utils";
import { useGetWallet, useLogout } from "@workspace/api-client-react";
import type { UserProfile } from "@workspace/api-client-react";

import { Badge } from "./ui";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/deposit", label: "Deposit USDT", icon: ArrowDownCircle },
  { href: "/mining", label: "Gem Mining", icon: Pickaxe },
  { href: "/convert", label: "Convert Gems", icon: ArrowRightLeft },
  { href: "/wallet", label: "My Wallet", icon: Wallet },
  { href: "/withdraw", label: "Withdraw", icon: ArrowUpCircle },
  { href: "/referral", label: "Referrals", icon: Users },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

export function Layout({ children, user }: { children: React.ReactNode, user: UserProfile }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: wallet } = useGetWallet();
  const { mutate: logout } = useLogout();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        localStorage.removeItem('etr_token');
        setLocation('/login');
      }
    });
  };

  const NavLinks = () => (
    <div className="space-y-1 mt-6">
      {NAV_ITEMS.map((item) => {
        const active = location === item.href;
        return (
          <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 font-medium",
              active 
                ? "bg-primary/10 text-primary border-l-2 border-primary" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <item.icon size={20} className={cn("w-5 h-5", active ? "text-primary" : "text-muted-foreground")} />
            {item.label}
          </Link>
        );
      })}
      {user.isAdmin && (
        <Link href="/admin" onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 font-medium mt-1",
            location === "/admin"
              ? "bg-primary/10 text-primary border-l-2 border-primary" 
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <ShieldAlert size={20} className={cn("w-5 h-5", location === "/admin" ? "text-primary" : "text-muted-foreground")} />
          Admin Panel
        </Link>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-[260px] bg-card border-r border-border transform transition-transform duration-300 flex flex-col md:translate-x-0 md:static",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}images/logo-icon.png`} alt="Logo" className="w-8 h-8 object-contain" />
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-foreground text-lg">ETR</span>
              <span className="text-muted-foreground text-sm">Mining</span>
            </div>
          </div>
          <button className="md:hidden text-muted-foreground" onClick={() => setMobileOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 custom-scrollbar">
          <NavLinks />
        </div>

        <div className="mt-auto">
          <div className="bg-secondary/50 rounded-lg p-3 mx-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-foreground text-sm truncate">{user.username}</span>
              <Badge variant={user.isActive ? "success" : "warning"}>
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Gems Balance</span>
              <span className="text-primary font-mono text-sm font-bold">
                {wallet ? formatGems(wallet.gemsBalance) : "..."}
              </span>
            </div>
          </div>
          
          <div className="px-3 pb-6">
            <button onClick={handleLogout} className="flex w-full items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 transition-colors text-sm font-medium">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}images/logo-icon.png`} alt="Logo" className="w-8 h-8 object-contain" />
            <span className="font-bold text-foreground">ETR</span>
          </div>
          <button onClick={() => setMobileOpen(true)} className="text-foreground p-1">
            <Menu size={28} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
          {!user.isActive && !user.isAdmin && (
            <div className="mb-8 p-4 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-orange-500">Account Inactive</h3>
                <p className="text-muted-foreground text-sm mt-1">Make your first USDT deposit to activate mining and unlock all features.</p>
              </div>
              <Link href="/deposit" className="shrink-0 px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-md hover:bg-orange-600 transition-colors">
                Deposit Now
              </Link>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
