import React, { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { Card, Button, Input, Label, Badge } from "@/components/ui";
import {
  useGenerateDepositAddress,
  useCreateDepositFull,
  useGetDepositsFull,
} from "@workspace/api-client-react";
import { Copy, AlertCircle, CheckCircle2, RefreshCw, Upload, X, ImageIcon, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function Deposit() {
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [assignedAddress, setAssignedAddress] = useState<string | null>(null);
  const [assignedAddressLabel, setAssignedAddressLabel] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const { data: deposits, isLoading: isLoadingHistory } = useGetDepositsFull();
  const { mutate: createDeposit, isPending: isSubmitting } = useCreateDepositFull();
  const {
    refetch: generateAddress,
    isFetching: isGenerating,
  } = useGenerateDepositAddress();

  const handleGenerateAddress = async () => {
    const result = await generateAddress();
    if (result.data) {
      setAssignedAddress(result.data.address);
      setAssignedAddressLabel(result.data.label || result.data.network);
      toast.success("BSC address assigned! Send USDT to this address.");
    } else {
      toast.error("No deposit addresses available. Please contact support.");
    }
  };

  const handleCopyAddress = () => {
    if (!assignedAddress) return;
    navigator.clipboard.writeText(assignedAddress);
    toast.success("Address copied to clipboard!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large. Maximum 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setScreenshotPreview(result);
      setScreenshotData(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScreenshot = () => {
    setScreenshotPreview(null);
    setScreenshotData(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = Number(amount);
    if (!numAmount || numAmount < 10) {
      toast.error("Minimum deposit is $10 USDT.");
      return;
    }

    if (!txHash && !screenshotData) {
      toast.error("Please provide either a Transaction Hash or upload a payment screenshot.");
      return;
    }

    createDeposit(
      {
        amountUsdt: numAmount,
        txHash: txHash || undefined,
        screenshotData: screenshotData || undefined,
        assignedAddress: assignedAddress || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Deposit submitted! Awaiting admin approval (usually within 2 hours).");
          setAmount("");
          setTxHash("");
          setScreenshotPreview(null);
          setScreenshotData(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          queryClient.invalidateQueries();
        },
        onError: (err: any) => toast.error(err?.data?.error || err?.message || "Failed to submit deposit"),
      }
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Deposit USDT</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Send USDT on the BNB Smart Chain (BSC/BEP-20) network to activate your account and start mining.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Instructions & Address */}
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-primary" /> How to Deposit
            </h2>
            <ol className="space-y-3 text-sm text-muted-foreground list-none">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">1</span>
                Click <strong className="text-foreground mx-1">Generate BSC Address</strong> below to get a unique deposit address.
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">2</span>
                Send <strong className="text-foreground mx-1">USDT (BEP-20)</strong> only to the assigned address.
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">3</span>
                Submit the form with your amount and either your TX hash or a payment screenshot.
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">4</span>
                Admin verifies and approves within ~2 hours.
              </li>
            </ol>
          </div>

          {/* Generate Address Section */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateAddress}
              disabled={isGenerating}
              className="w-full h-11 font-semibold border-primary/30 text-primary hover:bg-primary/5"
            >
              <Wallet size={18} className="mr-2" />
              {isGenerating ? "Assigning Address..." : assignedAddress ? "Get New Address" : "Generate BSC Address"}
              {!isGenerating && <RefreshCw size={14} className="ml-2 opacity-50" />}
            </Button>

            {assignedAddress && (
              <div className="bg-secondary/50 border border-primary/20 p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">
                    BSC (BEP-20) Deposit Address
                    {assignedAddressLabel && (
                      <span className="ml-2 text-primary/70">{assignedAddressLabel}</span>
                    )}
                  </Label>
                  <Button variant="ghost" size="sm" onClick={handleCopyAddress} className="h-7 px-2 text-primary">
                    <Copy size={14} className="mr-1" /> Copy
                  </Button>
                </div>
                <code className="block text-primary text-sm font-mono break-all bg-background/60 p-3 rounded border border-border">
                  {assignedAddress}
                </code>
              </div>
            )}
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg flex gap-3 text-amber-500">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <div className="text-sm space-y-1">
              <p className="font-semibold">Important</p>
              <p>Send <strong>USDT on BSC (BEP-20)</strong> ONLY. Sending other tokens or wrong networks will result in permanent loss of funds. Minimum: $10 USDT.</p>
            </div>
          </div>
        </Card>

        {/* Submission Form */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Submit Transfer Details</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label>Amount Sent (USDT)</Label>
              <Input
                type="number"
                step="0.01"
                min="10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder="e.g. 100"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Minimum: $10.00 USDT</p>
            </div>

            <div>
              <Label>Transaction Hash (TXID) <span className="text-muted-foreground font-normal">— optional if screenshot provided</span></Label>
              <Input
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="0x..."
                className="mt-1 font-mono text-sm"
              />
            </div>

            {/* Screenshot Upload */}
            <div>
              <Label>Payment Screenshot <span className="text-muted-foreground font-normal">— optional if TX hash provided</span></Label>
              <div className="mt-1">
                {screenshotPreview ? (
                  <div className="relative">
                    <img
                      src={screenshotPreview}
                      alt="Payment screenshot"
                      className="w-full h-40 object-cover rounded-lg border border-border"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveScreenshot}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    <Upload size={20} />
                    <span className="text-sm">Click to upload screenshot (max 5 MB)</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {assignedAddress && (
              <div className="text-xs text-muted-foreground bg-secondary/30 rounded p-2 border border-border">
                Address to include with submission: <code className="text-primary">{assignedAddress}</code>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Deposit Request"}
            </Button>
          </form>
        </Card>
      </div>

      {/* Deposit History */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Deposit History</h2>
        {isLoadingHistory ? (
          <p className="text-muted-foreground text-sm">Loading history...</p>
        ) : !deposits?.length ? (
          <p className="text-muted-foreground py-8 text-center bg-secondary/20 rounded-lg border border-dashed border-border text-sm">
            No deposits found. Submit your first deposit above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap defi-table">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Address</th>
                  <th className="px-4 py-3 font-medium">Proof</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {deposits.map((d) => (
                  <tr key={d.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-4 text-muted-foreground">
                      {format(new Date(d.createdAt), "MMM d, yyyy HH:mm")}
                    </td>
                    <td className="px-4 py-4 font-semibold text-emerald-500">
                      {formatCurrency(d.amountUsdt)}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs max-w-[140px] truncate text-muted-foreground">
                      {d.assignedAddress || "—"}
                    </td>
                    <td className="px-4 py-4">
                      {d.hasScreenshot ? (
                        <span className="flex items-center gap-1 text-blue-400 text-xs">
                          <ImageIcon size={13} /> Screenshot
                        </span>
                      ) : d.txHash ? (
                        <span className="font-mono text-xs max-w-[100px] truncate block">{d.txHash}</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        variant={
                          d.status === "approved"
                            ? "success"
                            : d.status === "rejected"
                            ? "destructive"
                            : "warning"
                        }
                      >
                        {d.status.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
