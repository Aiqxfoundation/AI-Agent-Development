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
    if (Number(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

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
        <h1 className="text-2xl font-bold text-foreground">Forge Assets</h1>
        <p className="text-muted-foreground text-sm mt-1">Convert your raw gems into tradable ETR tokens or direct USDT.</p>
      </header>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Transmutation</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <Label>From: Gems</Label>
                  <span className="text-xs text-primary cursor-pointer hover:underline" onClick={() => setAmount(String(wallet?.gemsBalance || 0))}>Max: {wallet ? formatGems(wallet.gemsBalance) : 0}</span>
                </div>
                <Input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="0" className="text-lg h-12" />
              </div>

              <div className="flex justify-center text-muted-foreground">
                <ArrowRightLeft size={20} />
              </div>

              <div>
                <Label>To: Output Currency</Label>
                <select 
                  className="flex h-12 w-full rounded-md border border-border bg-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors cursor-pointer"
                  value={outputType} 
                  onChange={e => setOutputType(e.target.value as "etr" | "usdt")}
                >
                  <option value="etr">ETR Token</option>
                  <option value="usdt">USDT (Tether)</option>
                </select>
              </div>

              <div className="bg-secondary/30 border border-border p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Expected Output</p>
                <p className="text-xl font-bold text-foreground">
                  ≈ {outputType === 'etr' ? expectedOutput.toFixed(4) + ' ETR' : formatCurrency(expectedUsdt)}
                </p>
              </div>

              <Button type="submit" className="w-full h-12 text-base" disabled={isPending}>
                {isPending ? "Forging..." : "Convert"}
              </Button>
            </form>
          </Card>

          {stats && (
            <Card className="p-6">
              <h3 className="font-bold text-foreground flex items-center gap-2 mb-3"><Info size={18}/> Market Rate</h3>
              <p className="text-sm text-muted-foreground mb-2">Current Exchange: <strong className="text-foreground">{formatGems(stats.conversionRateGemsPerEtr)} Gems = 1 ETR</strong></p>
              {stats.isDynamicRateActive && (
                <Badge variant="warning" className="w-full justify-center mt-2">Dynamic Halving Active</Badge>
              )}
            </Card>
          )}
        </div>

        <Card className="lg:col-span-3 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Transmutation History</h2>
          {isLoadingHistory ? (
            <p className="text-muted-foreground text-sm">Loading history...</p>
          ) : !conversions?.length ? (
            <p className="text-muted-foreground py-12 text-center bg-secondary/20 rounded-lg border border-dashed border-border text-sm">No conversions performed yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap defi-table">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Gems Spent</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Received</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {conversions.map(c => (
                    <tr key={c.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-4 text-muted-foreground">{format(new Date(c.createdAt), 'MMM d, yy HH:mm')}</td>
                      <td className="px-4 py-4 font-semibold text-destructive">-{formatGems(c.gemsSpent)}</td>
                      <td className="px-4 py-4 font-semibold text-emerald-500">
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
