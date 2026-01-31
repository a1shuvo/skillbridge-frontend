"use client";

import { useEffect, useState } from "react";
import { adminService, type AdminUser } from "@/lib/services/admin.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Ban,
  CheckCircle,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  User,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  
  // Filters
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch users - defined inside useEffect to avoid dependency warnings
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await adminService.getAllUsers({
          role: roleFilter,
          status: statusFilter,
        });
        setUsers(response.data);
        setCurrentPage(1); // Reset to first page when filters change
      } catch {
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleRefresh = () => {
    setRoleFilter("ALL");
    setStatusFilter("ALL");
    setSearchQuery("");
    setCurrentPage(1);
    
    // Manual refresh with reset filters
    const refresh = async () => {
      setLoading(true);
      try {
        const response = await adminService.getAllUsers({
          role: "ALL",
          status: "ALL",
        });
        setUsers(response.data);
        toast.success("Users refreshed");
      } catch {
        toast.error("Failed to refresh users");
      } finally {
        setLoading(false);
      }
    };
    refresh();
  };

  const handleStatusToggle = async (user: AdminUser) => {
    const newStatus = user.status === "ACTIVE" ? "BANNED" : "ACTIVE";
    const action = newStatus === "BANNED" ? "ban" : "unban";
    
    if (!window.confirm(`Are you sure you want to ${action} ${user.name || user.email}?`)) {
      return;
    }

    setUpdating(user.id);
    try {
      await adminService.updateUser(user.id, { status: newStatus });
      toast.success(`User ${action}ned successfully`);
      // Update local state immediately
      setUsers((prev) => prev.map((u) => 
        u.id === user.id ? { ...u, status: newStatus } : u
      ));
    } catch {
      toast.error(`Failed to ${action} user`);
    } finally {
      setUpdating(null);
    }
  };

  // Filter users locally by search query
  const filteredUsers = users.filter((user) => 
    (user.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Client-side pagination (since backend returns all users)
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      ADMIN: "destructive",
      TUTOR: "default",
      STUDENT: "secondary",
    };
    return <Badge variant={variants[role] || "outline"}>{role}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      ACTIVE: "default",
      BANNED: "destructive",
    };
    return (
      <Badge variant={variants[status] || "outline"} className="flex items-center w-fit">
        {status === "ACTIVE" ? (
          <CheckCircle className="h-3 w-3 mr-1" />
        ) : (
          <Ban className="h-3 w-3 mr-1" />
        )}
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
          <p className="text-muted-foreground">
            Manage platform users and ban/unban accounts.
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <label className="text-sm font-medium mb-2 block">Role</label>
              <Select value={roleFilter} onValueChange={(val) => {
                setRoleFilter(val);
                setCurrentPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="TUTOR">Tutor</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-48">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="BANNED">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
              <User className="h-12 w-12 mb-4 opacity-50" />
              <p>No users found</p>
              {(roleFilter !== "ALL" || statusFilter !== "ALL" || searchQuery) && (
                <Button 
                  variant="link" 
                  onClick={() => {
                    setRoleFilter("ALL");
                    setStatusFilter("ALL");
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {user.name || "N/A"}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {user.email}
                            </span>
                            {user.tutorProfile && (
                              <span className="text-xs text-muted-foreground mt-1">
                                Rating: {user.tutorProfile.avgRating.toFixed(1)} ★
                                {user.tutorProfile.isVerified && " • Verified"}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.role !== "ADMIN" ? (
                            <Button
                              variant={user.status === "ACTIVE" ? "destructive" : "outline"}
                              size="sm"
                              onClick={() => handleStatusToggle(user)}
                              disabled={updating === user.id}
                            >
                              {updating === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : user.status === "ACTIVE" ? (
                                <>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Ban
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Unban
                                </>
                              )}
                            </Button>
                          ) : (
                            <Badge variant="outline" className="gap-1">
                              <Shield className="h-3 w-3" />
                              Protected
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of{" "}
                    {filteredUsers.length} users
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm px-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}