import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, ArrowDownCircle, Pickaxe, ArrowRightLeft, 
  Wallet, ArrowUpCircle, Users, UserCircle, ShieldAlert, LogOut, Menu, X 
} from "lucide-react";
import { cn, formatGems } from "@/lib/utils";
import { useGetWallet, useLogout } from "@workspace/api-client-react";
import type { UserProfile } from "@workspace/api-client-react";

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
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
              active 
                ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(251,191,36,0.1)]" 
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            <item.icon size={20} className={active ? "text-primary" : ""} />
            {item.label}
          </Link>
        );
      })}
      {user.isAdmin && (
        <Link href="/admin" onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium mt-4",
            location === "/admin"
              ? "bg-accent/20 text-accent border border-accent/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]" 
              : "text-accent/70 hover:bg-accent/10 hover:text-accent"
          )}
        >
          <ShieldAlert size={20} />
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
        "fixed inset-y-0 left-0 z-50 w-72 bg-card/95 border-r border-primary/20 backdrop-blur-2xl transform transition-transform duration-300 flex flex-col md:translate-x-0 md:static",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between border-b border-primary/10">
          <div className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}images/logo-icon.png`} alt="Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            <h1 className="font-display text-xl font-bold gold-gradient-text tracking-wider">ETR Mining</h1>
          </div>
          <button className="md:hidden text-muted-foreground" onClick={() => setMobileOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="px-4 py-3 mb-4 rounded-xl bg-black/30 border border-primary/10">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Gems Balance</p>
            <p className="text-2xl font-display text-primary text-glow">{wallet ? formatGems(wallet.gemsBalance) : "..."}</p>
          </div>
          <NavLinks />
        </div>

        <div className="p-4 border-t border-primary/10">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors font-medium">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-primary/20 bg-card/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}images/logo-icon.png`} alt="Logo" className="w-8 h-8 object-contain" />
            <span className="font-display font-bold text-primary">ETR</span>
          </div>
          <button onClick={() => setMobileOpen(true)} className="text-primary p-1">
            <Menu size={28} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
          {!user.isActive && !user.isAdmin && (
            <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-amber-400 text-lg">Account Inactive</h3>
                <p className="text-amber-200/70 text-sm mt-1">Make your first USDT deposit to activate mining and unlock all features.</p>
              </div>
              <Link href="/deposit" className="shrink-0 px-4 py-2 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition-colors">
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
