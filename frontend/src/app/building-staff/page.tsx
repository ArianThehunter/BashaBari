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
import { Shield, Key, UserCheck, Building2, UserPlus, DollarSign, Wrench, Clock, FileText, CheckCircle2 } from "lucide-react";

export default function BuildingStaffPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"staff" | "vendor_logs">("staff");
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isVendorLogOpen, setIsVendorLogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<BuildingStaff | null>(null);
  const [isPaySalaryOpen, setIsPaySalaryOpen] = useState(false);
  const [salaryAmount, setSalaryAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bkash" | "nagad">("cash");

  // Form State for New Staff (Bi-Directional Checkbox Matrix)
  const [newStaff, setNewStaff] = useState<CreateStaffInput>({
    property_id: 1, // Default property
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
    monthly_salary: 1500000, // ৳15,000 in poisha
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

  const updateStaffRoleMutation = useMutation({
    mutationFn: ({ id, is_caretaker, is_security_guard }: { id: number; is_caretaker: boolean; is_security_guard: boolean }) =>
      staffService.updateStaff(id, { is_caretaker, is_security_guard }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["building-staff"] });
    },
  });

  const paySalaryMutation = useMutation({
    mutationFn: ({ id, amount, payment_method }: { id: number; amount: number; payment_method: "cash" | "bkash" | "nagad" }) =>
      staffService.paySalary(id, { amount, payment_method }),
    onSuccess: (data) => {
      alert(`Salary Paid Successfully! Cash Voucher Generated: ${data.voucher_number}`);
      queryClient.invalidateQueries({ queryKey: ["building-staff"] });
      setIsPaySalaryOpen(false);
    },
  });

  const createVendorLogMutation = useMutation({
    mutationFn: (data: CreateVendorVisitInput) => vendorLogService.createVendorLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-visit-logs"] });
      setIsVendorLogOpen(false);
    },
  });

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createStaffMutation.mutate(newStaff);
  };

  const handleVendorLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createVendorLogMutation.mutate(newVisit);
  };

  const handlePaySalarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    const poisha = Math.round(parseFloat(salaryAmount) * 100);
    paySalaryMutation.mutate({
      id: selectedStaff.id,
      amount: poisha,
      payment_method: paymentMethod,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Building Staff & Security Register
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage caretakers, security guards, dual-duty roles, contracted agencies, and technician logs.
            <span className="ml-2 text-xs font-semibold text-primary">সিকিউরিটি ও কেয়ারটেকার রেজিষ্টার</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setIsAddStaffOpen(true)} className="gap-2 font-bold bg-primary text-white">
            <UserPlus className="w-4 h-4" />
            Add Staff / Agency Contract
          </Button>
          <Button onClick={() => setIsVendorLogOpen(true)} variant="outline" className="gap-2 font-bold border-slate-700">
            <Wrench className="w-4 h-4" />
            Log Technician Visit
          </Button>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-slate-700 space-x-6">
        <button
          onClick={() => setActiveTab("staff")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 ${
            activeTab === "staff"
              ? "border-primary text-primary"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Active Staff & Guards ({staffList.length})
        </button>
        <button
          onClick={() => setActiveTab("vendor_logs")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 ${
            activeTab === "vendor_logs"
              ? "border-primary text-primary"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          Technician Visit Logs ({vendorLogs.length})
        </button>
      </div>

      {/* TAB 1: ACTIVE STAFF LIST */}
      {activeTab === "staff" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingStaff ? (
            <p className="text-slate-400">Loading staff records...</p>
          ) : staffList.length === 0 ? (
            <p className="text-slate-400">No staff members registered yet.</p>
          ) : (
            staffList.map((staff) => (
              <Card key={staff.id} className="shadow-lg border-slate-800 bg-slate-900 text-slate-100">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                        {staff.name}
                      </CardTitle>
                      <CardDescription className="text-slate-400 text-xs">
                        📞 {staff.phone} {staff.nid_number ? `| NID: ${staff.nid_number}` : ""}
                      </CardDescription>
                    </div>
                    {/* Role Badges */}
                    {staff.staff_role === "guard_caretaker_dual" || staff.staff_role === "caretaker_guard_dual" ? (
                      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 gap-1">
                        <Shield className="w-3 h-3" />
                        <Key className="w-3 h-3" />
                        Dual Duty
                      </Badge>
                    ) : staff.staff_role === "security_guard" ? (
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40 gap-1">
                        <Shield className="w-3 h-3" />
                        Security Guard
                      </Badge>
                    ) : staff.staff_role === "bariwala_manager" ? (
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 gap-1">
                        <Building2 className="w-3 h-3" />
                        Owner Manager
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 gap-1">
                        <Key className="w-3 h-3" />
                        Caretaker
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 text-xs text-slate-300">
                  {/* Bi-Directional Duty Checkbox Toggle Engine */}
                  <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
                    <p className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider">
                      Dynamic Duty Configuration (দ্বৈত দায়িত্ব নির্বাচন)
                    </p>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={staff.is_caretaker}
                          onChange={(e) =>
                            updateStaffRoleMutation.mutate({
                              id: staff.id,
                              is_caretaker: e.target.checked,
                              is_security_guard: staff.is_security_guard,
                            })
                          }
                          className="w-4 h-4 rounded text-primary border-slate-700 bg-slate-900"
                        />
                        <Key className="w-3.5 h-3.5 text-emerald-400" />
                        Caretaker Duties
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={staff.is_security_guard}
                          onChange={(e) =>
                            updateStaffRoleMutation.mutate({
                              id: staff.id,
                              is_caretaker: staff.is_caretaker,
                              is_security_guard: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded text-primary border-slate-700 bg-slate-900"
                        />
                        <Shield className="w-3.5 h-3.5 text-blue-400" />
                        Security Guard Duties
                      </label>
                    </div>
                  </div>

                  {/* Details & Contract */}
                  <div className="space-y-1">
                    <p className="flex items-center justify-between">
                      <span className="text-slate-400">Shift / Work Hours:</span>
                      <span className="font-semibold text-slate-200">{staff.shift_hours}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-slate-400">Employment Type:</span>
                      <span className="font-semibold text-slate-200 uppercase">
                        {staff.employment_type === "agency_contracted"
                          ? `🏢 ${staff.agency_name || "Agency Contract"}`
                          : "Direct Employee"}
                      </span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-slate-400">Monthly Salary / Fee:</span>
                      <span className="font-bold text-emerald-400 text-sm">
                        ৳{(staff.monthly_salary / 100).toLocaleString("en-BD")}
                      </span>
                    </p>
                  </div>

                  {/* Action: Pay Salary */}
                  <Button
                    onClick={() => {
                      setSelectedStaff(staff);
                      setSalaryAmount((staff.monthly_salary / 100).toString());
                      setIsPaySalaryOpen(true);
                    }}
                    className="w-full font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white mt-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    Pay Salary & Issue Cash Voucher
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* TAB 2: TECHNICIAN VISIT LOGS */}
      {activeTab === "vendor_logs" && (
        <div className="space-y-4">
          <Card className="shadow-lg border-slate-800 bg-slate-900 text-slate-100">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" />
                Technician & Service Vendor Entry Register
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                History of plumbers, electricians, elevator technicians, and water tank cleaning visits recorded by Caretaker or Security Guard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLogs ? (
                <p className="text-slate-400">Loading visit logs...</p>
              ) : vendorLogs.length === 0 ? (
                <p className="text-slate-400">No technician visits logged yet.</p>
              ) : (
                <div className="divide-y divide-slate-800">
                  {vendorLogs.map((log) => (
                    <div key={log.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{log.technician_name}</span>
                          <span className="text-slate-400 text-xs">(📞 {log.technician_phone})</span>
                          <Badge variant="outline" className="capitalize border-slate-700 text-slate-300">
                            {log.service_category}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          🏢 {log.company_name || "Independent Specialist"} | 📝 Purpose: {log.purpose_of_visit}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          🕒 Entry: {new Date(log.entry_time).toLocaleString("en-BD")}
                          {log.recorded_by_staff ? ` | Recorded By: ${log.recorded_by_staff.name} (${log.recorded_by_staff.staff_role})` : ""}
                        </p>
                      </div>

                      {log.amount_paid > 0 && (
                        <div className="text-right">
                          <span className="text-xs text-slate-400">Spot Cash Paid:</span>
                          <p className="font-bold text-emerald-400 text-sm">
                            ৳{(log.amount_paid / 100).toLocaleString("en-BD")}
                          </p>
                          <span className="text-[10px] text-slate-400">Ref: {log.receipt_reference || "Cash"}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL: ADD STAFF */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-lg space-y-4 text-slate-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Add Building Staff / Security Agency
            </h2>

            <form onSubmit={handleStaffSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <Label>Full Name / Guard Name</Label>
                <Input
                  type="text"
                  placeholder="e.g. Motiur Rahman"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  required
                  className="bg-slate-950 border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    placeholder="01711223344"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    required
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label>NID Number (Optional)</Label>
                  <Input
                    type="text"
                    placeholder="NID Number"
                    value={newStaff.nid_number}
                    onChange={(e) => setNewStaff({ ...newStaff, nid_number: e.target.value })}
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* Bi-Directional Duty Checkbox Matrix */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                <p className="font-bold text-slate-300">Select Staff Duty Duties (সহজ দায়িত্ব নির্বাচন):</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newStaff.is_caretaker}
                    onChange={(e) => setNewStaff({ ...newStaff, is_caretaker: e.target.checked })}
                    className="w-4 h-4 rounded text-primary"
                  />
                  <span>Performs Caretaker Duties (কেয়ারটেকার দায়িত্ব)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newStaff.is_security_guard}
                    onChange={(e) => setNewStaff({ ...newStaff, is_security_guard: e.target.checked })}
                    className="w-4 h-4 rounded text-primary"
                  />
                  <span>Performs Security Guard Duties (সিকিউরিটি গার্ড দায়িত্ব)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newStaff.is_agency_contracted}
                    onChange={(e) =>
                      setNewStaff({
                        ...newStaff,
                        is_agency_contracted: e.target.checked,
                        employment_type: e.target.checked ? "agency_contracted" : "direct_employed",
                      })
                    }
                    className="w-4 h-4 rounded text-primary"
                  />
                  <span>Contracted Security Agency (Monthly Rotation)</span>
                </label>
              </div>

              {newStaff.is_agency_contracted && (
                <div className="space-y-1">
                  <Label>Agency Name</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Elite Security Bangladesh Ltd."
                    value={newStaff.agency_name}
                    onChange={(e) => setNewStaff({ ...newStaff, agency_name: e.target.value })}
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Shift Hours</Label>
                  <Input
                    type="text"
                    placeholder="08:00 AM - 08:00 PM"
                    value={newStaff.shift_hours}
                    onChange={(e) => setNewStaff({ ...newStaff, shift_hours: e.target.value })}
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Monthly Salary / Fee (৳)</Label>
                  <Input
                    type="number"
                    placeholder="15000"
                    value={newStaff.monthly_salary / 100}
                    onChange={(e) => setNewStaff({ ...newStaff, monthly_salary: Math.round(parseFloat(e.target.value || "0") * 100) })}
                    required
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddStaffOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-white font-bold">
                  Save Staff Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG TECHNICIAN VISIT */}
      {isVendorLogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-lg space-y-4 text-slate-100">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              Log Technician / Service Visit
            </h2>

            <form onSubmit={handleVendorLogSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Technician Name</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Kalam Hossain"
                    value={newVisit.technician_name}
                    onChange={(e) => setNewVisit({ ...newVisit, technician_name: e.target.value })}
                    required
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    placeholder="01755667788"
                    value={newVisit.technician_phone}
                    onChange={(e) => setNewVisit({ ...newVisit, technician_phone: e.target.value })}
                    required
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Company Name (Optional)</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Dhaka Electric"
                    value={newVisit.company_name}
                    onChange={(e) => setNewVisit({ ...newVisit, company_name: e.target.value })}
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Service Category</Label>
                  <select
                    value={newVisit.service_category}
                    onChange={(e) => setNewVisit({ ...newVisit, service_category: e.target.value as any })}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-md text-white"
                  >
                    <option value="plumbing">Plumbing (প্লাম্বিং)</option>
                    <option value="electrical">Electrical (ইলেকট্রিক)</option>
                    <option value="elevator">Elevator Repair (লিফট মেরামত)</option>
                    <option value="tank_cleaning">Water Tank Cleaning</option>
                    <option value="generator">Generator Maintenance</option>
                    <option value="other">Other Service</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Work Purpose & Description</Label>
                <Input
                  type="text"
                  placeholder="e.g. Repaired main water line leak on 3rd floor"
                  value={newVisit.purpose_of_visit}
                  onChange={(e) => setNewVisit({ ...newVisit, purpose_of_visit: e.target.value })}
                  required
                  className="bg-slate-950 border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Spot Cash Paid (৳)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newVisit.amount_paid ? newVisit.amount_paid / 100 : ""}
                    onChange={(e) => setNewVisit({ ...newVisit, amount_paid: Math.round(parseFloat(e.target.value || "0") * 100) })}
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Payment Method</Label>
                  <select
                    value={newVisit.payment_method}
                    onChange={(e) => setNewVisit({ ...newVisit, payment_method: e.target.value as any })}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-md text-white"
                  >
                    <option value="cash">Cash (ক্যাশ)</option>
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsVendorLogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-white font-bold">
                  Record Entry Log
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PAY SALARY */}
      {isPaySalaryOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md space-y-4 text-slate-100">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Pay Salary & Generate Cash Voucher
            </h2>
            <p className="text-xs text-slate-400">
              Staff Member: <span className="font-bold text-white">{selectedStaff.name}</span> ({selectedStaff.staff_role})
            </p>

            <form onSubmit={handlePaySalarySubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <Label>Salary Amount (৳)</Label>
                <Input
                  type="number"
                  value={salaryAmount}
                  onChange={(e) => setSalaryAmount(e.target.value)}
                  required
                  className="bg-slate-950 border-slate-700 text-white font-bold text-lg"
                />
              </div>

              <div className="space-y-1">
                <Label>Payment Mode</Label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-md text-white font-semibold"
                >
                  <option value="cash">Cash Payment (ক্যাশ ক্যাশিয়ার)</option>
                  <option value="bkash">bKash Mobile Wallet</option>
                  <option value="nagad">Nagad Mobile Wallet</option>
                </select>
              </div>

              <div className="p-3 bg-emerald-950/40 rounded-lg border border-emerald-800/40 text-emerald-300 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Generating this payment automatically creates an official Cash Expense Voucher (EXP-202608-XXX) in the general ledger.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsPaySalaryOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                  Confirm Payment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
