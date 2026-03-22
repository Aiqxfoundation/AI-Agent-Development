import React, { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useGetMe } from "@workspace/api-client-react";

import { Layout } from "@/components/Layout";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Deposit from "@/pages/Deposit";
import Mining from "@/pages/Mining";
import Convert from "@/pages/Convert";
import Wallet from "@/pages/Wallet";
import Withdraw from "@/pages/Withdraw";
import Referral from "@/pages/Referral";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";
import { Pickaxe } from "lucide-react";

// Global fetch interceptor to inject JWT and handle 401s
const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  const token = localStorage.getItem('etr_token');
  if (token && typeof input === 'string' && input.startsWith('/api/')) {
    init = init || {};
    init.headers = {
      ...init.headers,
      Authorization: `Bearer ${token}`
    };
  }
  const response = await originalFetch(input, init);
  if (response.status === 401 && window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
    localStorage.removeItem('etr_token');
    window.dispatchEvent(new Event('auth-unauthorized'));
  }
  return response;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Redirect({ to }: { to: string }) {
  const [, setLocation] = useLocation();
  useEffect(() => { setLocation(to); }, [to, setLocation]);
  return null;
}

function ProtectedRoutes() {
  const { data: user, isLoading, error } = useGetMe({ query: { retry: false } });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background flex-col gap-4">
        <Pickaxe size={48} className="text-primary animate-bounce" />
        <p className="text-primary font-display animate-pulse text-lg">Connecting to vault...</p>
      </div>
    );
  }

  if (error || !user) {
    return <Redirect to="/login" />;
  }

  return (
    <Layout user={user}>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/deposit" component={Deposit} />
        <Route path="/mining" component={Mining} />
        <Route path="/convert" component={Convert} />
        <Route path="/wallet" component={Wallet} />
        <Route path="/withdraw" component={Withdraw} />
        <Route path="/referral" component={Referral} />
        <Route path="/profile" component={Profile} />
        {user.isAdmin && <Route path="/admin" component={Admin} />}
        <Route path="/"><Redirect to="/dashboard" /></Route>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function Router() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    const handler = () => setLocation('/login');
    window.addEventListener('auth-unauthorized', handler);
    return () => window.removeEventListener('auth-unauthorized', handler);
  }, [setLocation]);

  return (
    <Switch>
      <Route path="/login"><Auth mode="login" /></Route>
      <Route path="/signup"><Auth mode="signup" /></Route>
      <Route path="/recovery"><Auth mode="recovery" /></Route>
      <Route path="/:rest*"><ProtectedRoutes /></Route>
      <Route path="/"><Redirect to="/dashboard" /></Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <Toaster theme="dark" position="top-right" richColors toastOptions={{
        style: { background: 'hsl(220 12% 10%)', border: '1px solid hsl(220 12% 16%)', color: 'hsl(220 9% 92%)' }
      }} />
    </QueryClientProvider>
  );
}
