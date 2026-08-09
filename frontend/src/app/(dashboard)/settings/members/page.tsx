"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOrganization, useOrganizationMembers } from "@/hooks/use-organization";
import { addMemberSchema, type AddMemberInput } from "@/lib/validations/organization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Trash2, Loader2, ShieldCheck, AlertCircle } from "lucide-react";

export default function TeamMembersPage() {
  const { activeOrgId } = useOrganization();
  const {
    members,
    roles,
    isLoadingMembers,
    addMember,
    isAddingMember,
    removeMember,
    isRemovingMember,
  } = useOrganizationMembers(activeOrgId);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddMemberInput>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      email: "",
      role_id: undefined,
    },
  });

  const onSubmit = async (data: AddMemberInput) => {
    setServerError(null);
    try {
      await addMember(data);
      setIsDialogOpen(false);
      reset();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("Failed to add member. Please verify user exists.");
      }
    }
  };

  const handleRemove = async (memberId: number) => {
    if (confirm("Are you sure you want to remove this team member?")) {
      try {
        await removeMember(memberId);
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Failed to remove member.");
      }
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Members & Roles</h1>
          <p className="text-sm text-muted-foreground">
            Manage caretakers, accountants, and staff permissions within your organization
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 font-semibold">
              <UserPlus className="w-4 h-4" /> Add Team Member
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Add Team Member
              </DialogTitle>
              <DialogDescription>
                Assign a role to a registered user by entering their email address.
              </DialogDescription>
            </DialogHeader>

            {serverError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="email">User Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="caretaker@example.com"
                  disabled={isAddingMember}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Assign Role</Label>
                <Select
                  onValueChange={(val) => setValue("role_id", Number(val))}
                  disabled={isAddingMember}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={String(role.id)}>
                        <span className="font-semibold capitalize">{role.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role_id && (
                  <p className="text-xs text-destructive">{errors.role_id.message}</p>
                )}
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isAddingMember}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isAddingMember} className="gap-2">
                  {isAddingMember ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Adding...
                    </>
                  ) : (
                    "Add Member"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Active Team Members
          </CardTitle>
          <CardDescription>
            Members have access to property operations based on their assigned role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingMembers ? (
            <div className="py-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading members...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p className="text-sm font-semibold">{member.user?.name || "User"}</p>
                        <p className="text-xs text-muted-foreground">{member.user?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={member.is_owner ? "default" : "secondary"}
                        className="capitalize gap-1"
                      >
                        {member.is_owner && <ShieldCheck className="w-3 h-3 text-primary-foreground" />}
                        {member.role?.name || (member.is_owner ? "Owner" : "Member")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-emerald-600 border-emerald-500/20 bg-emerald-500/10">
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {!member.is_owner && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemove(member.id)}
                          disabled={isRemovingMember}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
