"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staffService, type CreateStaffInput } from "@/services/staff-service";
import { vendorLogService, type CreateVendorVisitInput } from "@/services/vendor-log-service";
import type { BuildingStaff, VendorVisitLog } from "@/types/staff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, UserCheck, UserPlus, DollarSign, Wrench, FileText } from "lucide-react";

export default function BuildingStaffPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"staff" | "vendor_logs">("staff");
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isVendorLogOpen, setIsVendorLogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<BuildingStaff | null>(null);
  const [isPaySalaryOpen, setIsPaySalaryOpen] = useState(false);
  const [salaryAmount, setSalaryAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bkash" | "nagad">("cash");

  // Form State for New Staff
  const [newStaff, setNewStaff] = useState<CreateStaffInput>({
    property_id: 1,
    name: "",
    phone: "",
    nid_number: "",
    is_caretaker: true,
    is_security_guard: false,
    is_agency_contracted: false,
    is_owner_manager: false,
    employment_type: "direct_employed",
    agency_name: "",
    shift_type: "day_shift",
    shift_hours: "08:00 AM - 08:00 PM",
    monthly_salary: 1500000, // à§³15,000 in poisha
  });

  // Form State for Technician Entry Log
  const [newVisit, setNewVisit] = useState<CreateVendorVisitInput>({
    property_id: 1,
    technician_name: "",
    technician_phone: "",
    company_name: "",
    service_category: "plumbing",
    entry_time: new Date().toISOString().slice(0, 16),
    purpose_of_visit: "",
    amount_paid: 0,
    payment_method: "cash",
  });

  // Queries
  const { data: staffList = [], isLoading: isLoadingStaff } = useQuery<BuildingStaff[]>({
    queryKey: ["building-staff"],
    queryFn: () => staffService.getStaffList(),
  });

  const { data: vendorLogs = [], isLoading: isLoadingLogs } = useQuery<VendorVisitLog[]>({
    queryKey: ["vendor-visit-logs"],
    queryFn: () => vendorLogService.getVendorLogs(),
  });

  // Mutations
  const createStaffMutation = useMutation({
    mutationFn: (data: CreateStaffInput) => staffService.createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["building-staff"] });
      setIsAddStaffOpen(false);
    },
  });

  const createVendorLogMutation = useMutation({
    mutationFn: (data: CreateVendorVisitInput) => vendorLogService.createVendorLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-visit-logs"] });
      setIsVendorLogOpen(false);
    },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" /> Building Staff &amp; Security Register
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage caretakers, security guards, contracted agencies, and technician logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setIsAddStaffOpen(true)} className="gap-2 font-bold">
            <UserPlus className="w-4 h-4" /> Add Staff / Agency Contract
          </Button>

          <Button variant="outline" onClick={() => setIsVendorLogOpen(true)} className="gap-2">
            <Wrench className="w-4 h-4" /> Log Technician Visit
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-6">
        <button
          onClick={() => setActiveTab("staff")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "staff"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserCheck className="w-4 h-4" /> Active Staff &amp; Guards ({staffList.length})
        </button>

        <button
          onClick={() => setActiveTab("vendor_logs")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "vendor_logs"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="w-4 h-4" /> Technician Visit Logs ({vendorLogs.length})
        </button>
      </div>

      {/* Staff View */}
      {activeTab === "staff" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingStaff ? (
            <p className="text-sm text-muted-foreground col-span-full">Loading staff members...</p>
          ) : staffList.length === 0 ? (
            <Card className="col-span-full p-8 text-center text-muted-foreground border-border bg-card">
              No staff members registered yet.
            </Card>
          ) : (
            staffList.map((staff) => (
              <Card key={staff.id} className="border-border bg-card shadow-xs flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-bold">{staff.name}</CardTitle>
                      <CardDescription className="text-xs font-mono">{staff.phone}</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs font-semibold">
                      {staff.employment_type === "agency_contracted" ? "Agency" : "Direct"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 text-xs">
                  <div className="flex flex-wrap gap-1.5">
                    {staff.is_caretaker && <Badge className="bg-emerald-600/10 text-emerald-600 border-emerald-500/30">Caretaker</Badge>}
                    {staff.is_security_guard && <Badge className="bg-blue-600/10 text-blue-600 border-blue-500/30">Security Guard</Badge>}
                    {staff.is_owner_manager && <Badge className="bg-amber-600/10 text-amber-600 border-amber-500/30">Bariwala Manager</Badge>}
                  </div>

                  <div className="p-3 rounded-lg bg-accent/40 border border-border space-y-1 font-mono text-[11px]">
                    <p><span className="text-muted-foreground font-sans">Shift:</span> {staff.shift_hours}</p>
                    <p><span className="text-muted-foreground font-sans">Salary:</span> à§³ {(staff.monthly_salary / 100).toLocaleString("en-BD")}/mo</p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full font-semibold gap-1.5"
                    onClick={() => {
                      setSelectedStaff(staff);
                      setSalaryAmount((staff.monthly_salary / 100).toString());
                      setIsPaySalaryOpen(true);
                    }}
                  >
                    <DollarSign className="w-3.5 h-3.5" /> Pay Monthly Salary
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Vendor Logs View */}
      {activeTab === "vendor_logs" && (
        <Card className="border-border bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold">Technician Entry Logs</CardTitle>
            <CardDescription className="text-xs">
              Audit log of plumbers, electricians, and elevator technicians entering premises
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingLogs ? (
              <p className="text-sm text-muted-foreground">Loading visit logs...</p>
            ) : vendorLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No technician visits logged yet.</p>
            ) : (
              <div className="space-y-3">
                {vendorLogs.map((log) => (
                  <div key={log.id} className="p-4 rounded-xl border border-border bg-background flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-foreground">{log.technician_name} ({log.company_name})</p>
                      <p className="text-muted-foreground">{log.purpose_of_visit} â€¢ Category: {log.service_category}</p>
                    </div>
                    <div className="text-right font-mono">
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">à§³ {log.amount_paid.toLocaleString("en-BD")}</p>
                      <p className="text-muted-foreground text-[10px]">{new Date(log.entry_time).toLocaleString("en-GB")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal 1: Add Staff */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-border bg-card shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Add Building Staff Member</CardTitle>
              <CardDescription className="text-xs">Register new caretaker, security guard, or manager</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1">
                <Label>Full Name</Label>
                <Input value={newStaff.name} onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} placeholder="e.g. Md. Rahim Uddin" />
              </div>

              <div className="space-y-1">
                <Label>Phone Number</Label>
                <Input value={newStaff.phone} onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })} placeholder="01711000000" />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newStaff.is_caretaker} onChange={(e) => setNewStaff({ ...newStaff, is_caretaker: e.target.checked })} />
                  <span>Caretaker Role</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newStaff.is_security_guard} onChange={(e) => setNewStaff({ ...newStaff, is_security_guard: e.target.checked })} />
                  <span>Security Guard</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setIsAddStaffOpen(false)}>Cancel</Button>
                <Button size="sm" onClick={() => createStaffMutation.mutate(newStaff)}>Save Staff Member</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal 2: Log Technician Visit */}
      {isVendorLogOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-border bg-card shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Log Technician Visit</CardTitle>
              <CardDescription className="text-xs">Log plumber, electrician, or repair technician entry</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1">
                <Label>Technician Name</Label>
                <Input value={newVisit.technician_name} onChange={(e) => setNewVisit({ ...newVisit, technician_name: e.target.value })} placeholder="e.g. Master Plumber Kalam" />
              </div>

              <div className="space-y-1">
                <Label>Company / Agency Name</Label>
                <Input value={newVisit.company_name} onChange={(e) => setNewVisit({ ...newVisit, company_name: e.target.value })} placeholder="e.g. Dhaka Plumbing Services" />
              </div>

              <div className="space-y-1">
                <Label>Purpose of Visit</Label>
                <Input value={newVisit.purpose_of_visit} onChange={(e) => setNewVisit({ ...newVisit, purpose_of_visit: e.target.value })} placeholder="Fixed Flat B-202 sink leak" />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setIsVendorLogOpen(false)}>Cancel</Button>
                <Button size="sm" onClick={() => createVendorLogMutation.mutate(newVisit)}>Log Technician Entry</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal 3: Pay Salary */}
      {isPaySalaryOpen && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-border bg-card shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Pay Staff Salary</CardTitle>
              <CardDescription className="text-xs">
                Issue monthly salary payment for {selectedStaff.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1">
                <Label>Monthly Salary Amount (BDT)</Label>
                <Input
                  type="number"
                  value={salaryAmount}
                  onChange={(e) => setSalaryAmount(e.target.value)}
                  placeholder="15000"
                />
              </div>
              <div className="space-y-1">
                <Label>Payment Method</Label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as "cash" | "bkash" | "nagad")}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                >
                  <option value="cash">Cash Voucher</option>
                  <option value="bkash">bKash MFS</option>
                  <option value="nagad">Nagad MFS</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setIsPaySalaryOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    paySalaryMutation.mutate({
                      id: selectedStaff.id,
                      amount: Math.round((parseFloat(salaryAmount) || 0) * 100),
                      payment_method: paymentMethod,
                    })
                  }
                >
                  Confirm &amp; Issue Voucher
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}