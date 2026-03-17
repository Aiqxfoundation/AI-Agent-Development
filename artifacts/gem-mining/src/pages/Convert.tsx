import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { Card, Button, Input, Label, Badge } from "@/components/ui";
import { useGetMyConversions, useCreateConversion, useGetSystemStats, useGetWallet } from "@workspace/api-client-react";
import { formatCurrency, formatGems } from "@/lib/utils";
import { ArrowRightLeft, Info } from "lucide-react";

export default function Convert() {
  const [amount, setAmount] = useState("");
  const [outputType, setOutputType] = useState<"etr" | "usdt">("etr");
  const queryClient = useQueryClient();

  const { data: conversions, isLoading: isLoadingHistory } = useGetMyConversions();
  const { data: stats } = useGetSystemStats();
  const { data: wallet } = useGetWallet();
  const { mutate: convert, isPending } = useCreateConversion();

  const currentRate = stats?.conversionRateGemsPerEtr || 100000;
  const expectedOutput = Number(amount) > 0 ? (Number(amount) / currentRate) : 0;
  // USDT value is tied 1:1 to ETR roughly if 100 ETR = $350 (rate 3.5)
  // Let's rely on the backend to do exact math, we'll just show ETR equivalent.
  const expectedUsdt = expectedOutput * 3.5;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(amount) <= 0) return toast.error("Enter a valid amount");

    convert({ data: { gemsAmount: Number(amount), outputType } }, {
      onSuccess: () => {
        toast.success(`Successfully converted gems!`);
        setAmount("");
        queryClient.invalidateQueries();
      },
      onError: (err: any) => toast.error(err.error || "Failed to convert")
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <header>
        <h1 className="text-4xl font-display font-bold gold-gradient-text text-glow">Forge Assets</h1>
        <p className="text-muted-foreground mt-2">Convert your raw gems into tradable ETR tokens or direct USDT.</p>
      </header>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8 border-accent/40 shadow-[0_0_30px_rgba(168,85,247,0.15)] relative overflow-visible">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-accent/20 rounded-full blur-2xl" />
            <h2 className="text-2xl font-display text-white mb-6">Transmutation</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Amount of Gems</Label>
                  <span className="text-xs text-primary cursor-pointer hover:underline" onClick={() => setAmount(String(wallet?.gemsBalance || 0))}>Max: {wallet ? formatGems(wallet.gemsBalance) : 0}</span>
                </div>
                <Input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="0" className="text-xl h-14" />
              </div>

              <div className="flex justify-center text-accent">
                <ArrowRightLeft size={24} />
              </div>

              <div>
                <Label>Output Currency</Label>
                <select 
                  className="flex w-full rounded-lg border border-primary/30 bg-input/80 px-4 py-3 text-base text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer"
                  value={outputType} 
                  onChange={e => setOutputType(e.target.value as "etr" | "usdt")}
                >
                  <option value="etr">ETR Token (Fantasy Asset)</option>
                  <option value="usdt">USDT (Tether)</option>
                </select>
              </div>

              <div className="bg-black/40 border border-primary/20 p-4 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Expected Output</p>
                <p className="text-2xl font-bold text-white">
                  ≈ {outputType === 'etr' ? expectedOutput.toFixed(4) + ' ETR' : formatCurrency(expectedUsdt)}
                </p>
              </div>

              <Button type="submit" className="w-full h-14 text-lg" disabled={isPending}>
                {isPending ? "Forging..." : "Execute Conversion"}
              </Button>
            </form>
          </Card>

          {stats && (
            <Card className="p-6 bg-primary/5 border-primary/20">
              <h3 className="font-bold text-primary flex items-center gap-2 mb-3"><Info size={18}/> Market Rate</h3>
              <p className="text-sm text-white/80 mb-2">Current Exchange: <strong className="text-white">{formatGems(stats.conversionRateGemsPerEtr)} Gems = 1 ETR</strong></p>
              {stats.isDynamicRateActive && (
                <Badge variant="warning" className="w-full justify-center mt-2">Dynamic Halving Active</Badge>
              )}
            </Card>
          )}
        </div>

        <Card className="lg:col-span-3 p-8">
          <h2 className="text-2xl font-display text-primary mb-6">Transmutation History</h2>
          {isLoadingHistory ? (
            <p className="text-muted-foreground">Loading history...</p>
          ) : !conversions?.length ? (
            <p className="text-muted-foreground py-12 text-center bg-black/20 rounded-xl border border-dashed border-primary/20">No conversions performed yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-xs uppercase text-muted-foreground border-b border-primary/20">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Gems Spent</th>
                    <th className="px-4 py-3">Received</th>
                    <th className="px-4 py-3">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10">
                  {conversions.map(c => (
                    <tr key={c.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-4">{format(new Date(c.createdAt), 'MMM d, yy HH:mm')}</td>
                      <td className="px-4 py-4 font-bold text-red-400">-{formatGems(c.gemsSpent)}</td>
                      <td className="px-4 py-4 font-bold text-emerald-400">
                        +{c.outputType === 'usdt' ? formatCurrency(c.outputAmount) : `${c.outputAmount} ETR`}
                      </td>
                      <td className="px-4 py-4 text-xs text-muted-foreground">{formatGems(c.conversionRate)} / ETR</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
