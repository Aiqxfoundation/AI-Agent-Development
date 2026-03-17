import React, { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useLogin, useSignup, useRecoverPassword } from "@workspace/api-client-react";
import { Button, Input, Card, Label } from "@/components/ui";

export default function Auth({ mode: initialMode }: { mode: 'login' | 'signup' | 'recovery' }) {
  const [mode, setMode] = useState(initialMode);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    username: "", password: "", confirmPassword: "", 
    recoveryQuestion: "", recoveryAnswer: "", newPassword: "", referredBy: ""
  });

  const { mutate: login, isPending: isLoggingIn } = useLogin();
  const { mutate: signup, isPending: isSigningUp } = useSignup();
  const { mutate: recover, isPending: isRecovering } = useRecoverPassword();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login({ data: { username: form.username, password: form.password } }, {
      onSuccess: (res) => {
        localStorage.setItem('etr_token', res.token);
        queryClient.invalidateQueries();
        setLocation('/dashboard');
      },
      onError: (err: any) => toast.error(err.error || "Login failed")
    });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error("Passwords do not match");
    signup({ data: form }, {
      onSuccess: (res) => {
        localStorage.setItem('etr_token', res.token);
        queryClient.invalidateQueries();
        toast.success("Account created successfully!");
        setLocation('/dashboard');
      },
      onError: (err: any) => toast.error(err.error || "Signup failed")
    });
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    recover({ data: { username: form.username, recoveryAnswer: form.recoveryAnswer, newPassword: form.newPassword } }, {
      onSuccess: () => {
        toast.success("Password recovered successfully! Please login.");
        setMode('login');
      },
      onError: (err: any) => toast.error(err.error || "Recovery failed")
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-background p-4">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src={`${import.meta.env.BASE_URL}images/hero-bg.png`} alt="Background" className="w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <Card className="w-full max-w-md p-8 z-10 border-primary/40 shadow-[0_0_40px_rgba(251,191,36,0.15)] relative overflow-visible">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
          <div className="w-24 h-24 rounded-full bg-card border-4 border-primary/30 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.3)]">
            <img src={`${import.meta.env.BASE_URL}images/logo-icon.png`} alt="Logo" className="w-16 h-16 object-contain" />
          </div>
        </div>

        <div className="mt-8 text-center mb-8">
          <h1 className="text-3xl font-display font-bold gold-gradient-text text-glow">
            {mode === 'login' ? 'Enter the Vault' : mode === 'signup' ? 'Begin Your Journey' : 'Recover Access'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {mode === 'login' ? 'Login to your ETR mining account' : mode === 'signup' ? 'Create an account to start mining gems' : 'Reset your lost password'}
          </p>
        </div>

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label>Username</Label>
              <Input name="username" value={form.username} onChange={handleChange} required />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" name="password" value={form.password} onChange={handleChange} required />
            </div>
            <Button type="submit" className="w-full h-12 text-lg" disabled={isLoggingIn}>
              {isLoggingIn ? 'Authenticating...' : 'Login'}
            </Button>
            <div className="flex justify-between text-sm mt-4 text-primary/80">
              <button type="button" onClick={() => setMode('recovery')} className="hover:text-primary hover:underline">Forgot password?</button>
              <button type="button" onClick={() => setMode('signup')} className="hover:text-primary hover:underline">Create account</button>
            </div>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label>Username</Label>
              <Input name="username" value={form.username} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Password</Label>
                <Input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} />
              </div>
              <div>
                <Label>Confirm Password</Label>
                <Input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required minLength={6} />
              </div>
            </div>
            <div>
              <Label>Recovery Question <span className="text-muted-foreground font-normal">(e.g. First pet's name)</span></Label>
              <Input name="recoveryQuestion" value={form.recoveryQuestion} onChange={handleChange} required />
            </div>
            <div>
              <Label>Recovery Answer</Label>
              <Input name="recoveryAnswer" value={form.recoveryAnswer} onChange={handleChange} required />
            </div>
            <div>
              <Label>Referral Code (Optional)</Label>
              <Input name="referredBy" value={form.referredBy} onChange={handleChange} placeholder="Username of referrer" />
            </div>
            <Button type="submit" className="w-full h-12 text-lg mt-2" disabled={isSigningUp}>
              {isSigningUp ? 'Creating Account...' : 'Sign Up'}
            </Button>
            <div className="text-center text-sm mt-4 text-primary/80">
              <button type="button" onClick={() => setMode('login')} className="hover:text-primary hover:underline">Already have an account? Login</button>
            </div>
          </form>
        )}

        {mode === 'recovery' && (
          <form onSubmit={handleRecovery} className="space-y-5">
            <div>
              <Label>Username</Label>
              <Input name="username" value={form.username} onChange={handleChange} required />
            </div>
            <div>
              <Label>Recovery Answer</Label>
              <Input name="recoveryAnswer" value={form.recoveryAnswer} onChange={handleChange} required />
            </div>
            <div>
              <Label>New Password</Label>
              <Input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} required minLength={6} />
            </div>
            <Button type="submit" className="w-full h-12 text-lg" disabled={isRecovering}>
              {isRecovering ? 'Resetting...' : 'Reset Password'}
            </Button>
            <div className="text-center text-sm mt-4 text-primary/80">
              <button type="button" onClick={() => setMode('login')} className="hover:text-primary hover:underline">Back to Login</button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
