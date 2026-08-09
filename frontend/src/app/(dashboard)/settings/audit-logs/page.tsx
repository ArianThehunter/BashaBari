"use client";

import { useState } from "react";
import { useOrganization } from "@/hooks/use-organization";
import { useAuditLogs } from "@/hooks/use-audit-log";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShieldCheck, Search, User, Globe, Clock, Loader2 } from "lucide-react";

export default function SecurityAuditLogsPage() {
  const { activeOrgId } = useOrganization();
  const [searchTerm, setSearchTerm] = useState("");

  const { logs, meta, isLoading } = useAuditLogs({
    organization_id: activeOrgId,
    search: searchTerm || undefined,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Security & System Audit Logs</h1>
        <p className="text-sm text-muted-foreground">
          Immutable event log of administrative actions, contract terminations, tenant deletions, and payment refunds
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by event type, actor name, or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="text-xs font-semibold text-muted-foreground">
          Total Recorded Audit Events: <span className="text-foreground font-bold">{meta.total}</span>
        </div>
      </div>

      {/* Audit Logs Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Audit Trail History
          </CardTitle>
          <CardDescription>
            Timestamped security events with client IP addresses and user actor profiles.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" /> Loading audit log entries...
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground space-y-2">
              <ShieldCheck className="w-10 h-10 mx-auto text-muted-foreground" />
              <p className="font-semibold text-base">No Audit Events Logged</p>
              <p className="text-xs max-w-sm mx-auto">
                No administrative security actions have been logged for this organization yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Actor / User</TableHead>
                  <TableHead>Client IP Address</TableHead>
                  <TableHead>Auditable Entity</TableHead>
                  <TableHead className="text-right">Timestamp</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`capitalize font-mono text-xs font-bold ${
                          log.event.includes("deleted")
                            ? "bg-destructive/10 text-destructive border-destructive/30"
                            : log.event.includes("terminated")
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                              : "bg-primary/10 text-primary border-primary/30"
                        }`}
                      >
                        {log.event}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs">
                        <p className="font-semibold text-foreground flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-primary" />
                          {log.user?.name || "System Automated"}
                        </p>
                        {log.user?.email && (
                          <p className="text-muted-foreground text-[11px]">{log.user.email}</p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs flex items-center gap-1 font-mono text-muted-foreground">
                        <Globe className="w-3.5 h-3.5" />
                        <span>{log.ip_address || "127.0.0.1"}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs font-mono">
                        <span className="text-muted-foreground">ID #{log.auditable_id}</span>
                        <span className="text-[10px] text-muted-foreground block truncate max-w-[150px]">
                          {log.auditable_type.split("\\").pop()}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right text-xs text-muted-foreground font-mono">
                      <div className="flex items-center justify-end gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(log.created_at).toLocaleString()}</span>
                      </div>
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
