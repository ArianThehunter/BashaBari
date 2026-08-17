"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  X,
} from "lucide-react";

interface RentRevisionModalProps {
  unitId: string;
  unitNumber: string;
  currentBaseRentBdt: number;
  lastRevisedAt?: string; // ISO date string
  userRole?: string; // 'owner' | 'bariwala' | 'caretaker' | 'staff'
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RentRevisionModal({
  unitId,
  unitNumber,
  currentBaseRentBdt,
  lastRevisedAt,
  userRole = "owner",
  isOpen,
  onClose,
  onSuccess,
}: RentRevisionModalProps) {
  const isOwner = ["owner", "bariwala", "admin"].includes(userRole.toLowerCase());

  // Statutory 20% Maximum Cap
  const maxCapBdt = currentBaseRentBdt * 1.2;

  const [proposedRent, setProposedRent] = useState<string>(currentBaseRentBdt.toString());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const numericProposedRent = parseFloat(proposedRent) || 0;
  const isIncrease = numericProposedRent > currentBaseRentBdt;
  const isExceedingCap = isIncrease && numericProposedRent > maxCapBdt;

  // Calculate cooling period (24 months)
  let isCoolingPeriodActive = false;
  let nextEligibleDateStr = "";
  if (lastRevisedAt) {
    const lastRevDate = new Date(lastRevisedAt);
    const nextEligible = new Date(lastRevDate);
    nextEligible.setMonth(nextEligible.getMonth() + 24);

    if (new Date() < nextEligible) {
      isCoolingPeriodActive = true;
      nextEligibleDateStr = nextEligible.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  }

  const handleReviseRent = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isOwner) {
      setErrorMsg("Role Restricted: Only Property Owners (Bariwalas) can authorize rent increases.");
      return;
    }

    if (isIncrease && isCoolingPeriodActive) {
      setErrorMsg(`Statutory Cooling Period Active: Under Premises Rent Control Act 1992 of Bangladesh, rent revision is locked for 24 months. Next eligible date: ${nextEligibleDateStr}.`);
      return;
    }

    if (isExceedingCap) {
      setErrorMsg(`Statutory Ceiling Exceeded: Maximum allowed rent cap is ৳ ${maxCapBdt.toLocaleString("en-BD", { minimumFractionDigits: 2 })} (20% cap above ৳ ${currentBaseRentBdt.toLocaleString("en-BD")}).`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Send poisha amount (1 BDT = 100 poisha)
      const poishaAmount = Math.round(numericProposedRent * 100);

      const res = await fetch(`/api/v1/units/${unitId}/revise-rent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          new_base_rent_amount: poishaAmount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to revise rent.");
      }

      setSuccessMsg(data.message || "Rent revised successfully under Premises Rent Control Act 1992.");
      if (onSuccess) onSuccess();

      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-border bg-card shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/30">
              Act 1992 Statutory Engine
            </Badge>
          </div>
          <CardTitle className="text-xl font-extrabold flex items-center gap-2 text-foreground">
            <Scale className="w-5 h-5 text-primary" />
            Rent Revision: Flat Unit {unitNumber}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Premises Rent Control Act 1992 of Bangladesh Statutory Calculator
          </p>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Owner Role Status */}
          {!isOwner ? (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-600 dark:text-rose-400 font-semibold">
              <Lock className="w-4 h-4 shrink-0" />
              <span>Role Restricted: Only Property Owners (Bariwalas) can authorize rent increases.</span>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Authorized Property Owner (Bariwala) Access</span>
            </div>
          )}

          {/* Current Rent vs Statutory Ceiling */}
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-accent/40 border border-border space-y-1">
              <span className="text-muted-foreground font-sans block text-[11px]">Current Base Rent</span>
              <span className="text-base font-bold text-foreground font-sans">
                ৳ {currentBaseRentBdt.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-accent/40 border border-border space-y-1">
              <span className="text-muted-foreground font-sans block text-[11px]">20% Max Statutory Cap</span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-sans">
                ৳ {maxCapBdt.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Cooling Period Status */}
          {isCoolingPeriodActive && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1 text-xs">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Statutory 24-Month Cooling Period Active</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Rent increases are locked under Section 16 &amp; 18 of the Premises Rent Control Act 1992. Next eligible revision date: <strong className="text-foreground">{nextEligibleDateStr}</strong>.
              </p>
            </div>
          )}

          {/* Proposed Rent Input */}
          <div className="space-y-2">
            <Label htmlFor="proposed-rent" className="text-xs font-bold flex items-center justify-between">
              <span>Proposed New Monthly Rent (BDT)</span>
              {isIncrease && (
                <span className="text-emerald-600 dark:text-emerald-400 font-normal text-[11px] flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +{(((numericProposedRent - currentBaseRentBdt) / currentBaseRentBdt) * 100).toFixed(1)}% revision
                </span>
              )}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground font-bold text-sm">৳</span>
              <Input
                id="proposed-rent"
                type="number"
                value={proposedRent}
                onChange={(e) => setProposedRent(e.target.value)}
                disabled={!isOwner}
                className="pl-8 font-bold text-base"
                placeholder="Enter new rent amount"
              />
            </div>
          </div>

          {/* Real-Time Live Validation Feedback */}
          {isIncrease && (
            <div className="text-xs">
              {isExceedingCap ? (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Exceeds 20% statutory ceiling (৳ {maxCapBdt.toLocaleString("en-BD")} Max Cap).</span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Valid rent revision under Owner Discretion (Within ৳ {maxCapBdt.toLocaleString("en-BD")} statutory cap).</span>
                </div>
              )}
            </div>
          )}

          {/* Alert Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              {successMsg}
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleReviseRent}
              disabled={!isOwner || isExceedingCap || (isIncrease && isCoolingPeriodActive) || isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-1.5"
            >
              {isSubmitting ? "Saving Revision..." : "Confirm Rent Revision"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
