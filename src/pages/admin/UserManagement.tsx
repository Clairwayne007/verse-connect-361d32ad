import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, MoreHorizontal, Shield, ShieldCheck, Crown, Loader2, Eye, Sparkles, Trash2 } from "lucide-react";
import { useAuth, type AppRole } from "@/contexts/AuthContext";
import { UserDetailsModal } from "@/components/admin/UserDetailsModal";

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  balance: number;
  role: AppRole;
  createdAt: string;
  avatar_url?: string;
  reviewed?: boolean;
}

const UserManagement = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const currentUserRole = currentUser?.role;
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [newRole, setNewRole] = useState<AppRole>("user");
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRefresh = useCallback(() => {
    fetchUsers();
  }, []);

  useRealtimeSubscription(
    [{ table: "profiles", alertOnInsert: "🆕 New User Registered" }],
    handleRefresh
  );

  const fetchUsers = async () => {
    try {
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (rolesRes.error) throw rolesRes.error;

      const roleMap = new Map<string, AppRole>();
      rolesRes.data?.forEach((r) => {
        const currentRole = roleMap.get(r.user_id);
        if (!currentRole || r.role === "admin" || (r.role === "moderator" && currentRole === "user")) {
          roleMap.set(r.user_id, r.role as AppRole);
        }
      });

      const usersWithRoles: UserWithRole[] = (profilesRes.data || []).map((profile) => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        balance: Number(profile.balance) || 0,
        role: roleMap.get(profile.id) || "user",
        createdAt: profile.created_at
          ? new Date(profile.created_at).toLocaleDateString() + " " + new Date(profile.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : "N/A",
        reviewed: profile.reviewed ?? false,
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (currentUserRole === "admin" && user.role === "moderator") return false;
    return (
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleRoleChange = async () => {
    if (!selectedUser) return;
    setUpdating(true);
    try {
      await supabase.from("user_roles").delete().eq("user_id", selectedUser.id);
      if (newRole !== "user") {
        const { error } = await supabase.from("user_roles").insert({ user_id: selectedUser.id, role: newRole });
        if (error) throw error;
      }
      setUsers((prev) => prev.map((user) => user.id === selectedUser.id ? { ...user, role: newRole } : user));
      toast({ title: "Role Updated", description: `${selectedUser.name} is now ${newRole === "admin" ? "an" : "a"} ${newRole}` });
      setRoleDialogOpen(false);
    } catch (error) {
      console.error("Error updating role:", error);
      toast({ title: "Error", description: "Failed to update user role", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("delete-user", {
        body: { user_id: selectedUser.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      toast({ title: "User Deleted", description: `${selectedUser.name} has been permanently deleted.` });
      setDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({ title: "Error", description: error.message || "Failed to delete user", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const openRoleDialog = (user: UserWithRole, role: AppRole) => {
    setSelectedUser(user);
    setNewRole(role);
    setRoleDialogOpen(true);
  };

  const getRoleBadge = (role: AppRole) => {
    switch (role) {
      case "admin":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive flex items-center gap-1">
            <Crown className="h-3 w-3" /> Admin
          </span>
        );
      case "moderator":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Moderator
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">User</span>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>User Management</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        {user.name}
                        {!user.reviewed && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary text-primary-foreground flex items-center gap-0.5">
                            <Sparkles className="h-3 w-3" /> NEW
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>${user.balance.toLocaleString()}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{user.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={async () => {
                                setSelectedUser(user);
                                setDetailsModalOpen(true);
                                if (!user.reviewed) {
                                  await supabase.from("profiles").update({ reviewed: true }).eq("id", user.id);
                                  setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, reviewed: true } : u));
                                }
                              }}
                            >
                              <Eye className="h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            {/* Delete user option for admin and moderator */}
                            {user.role !== "moderator" && user.id !== currentUser?.id && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="gap-2 text-destructive focus:text-destructive"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" /> Delete User
                                </DropdownMenuItem>
                              </>
                            )}
                            {/* Only show role management for moderators */}
                            {currentUserRole === "moderator" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="gap-2" disabled={user.role === "admin"} onClick={() => openRoleDialog(user, "admin")}>
                                  <Crown className="h-4 w-4 text-destructive" /> Promote to Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2" disabled={user.role === "moderator"} onClick={() => openRoleDialog(user, "moderator")}>
                                  <ShieldCheck className="h-4 w-4 text-primary" /> Make Moderator
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="gap-2" disabled={user.role === "user"} onClick={() => openRoleDialog(user, "user")}>
                                  <Shield className="h-4 w-4" /> Demote to User
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {!loading && filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No users found matching your search</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Role Change Confirmation Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Role Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to change <strong>{selectedUser?.name}</strong>'s role to <strong>{newRole}</strong>?
              {newRole === "admin" && (
                <span className="block mt-2 text-destructive">
                  Admins have full access to manage users, transactions, and system settings.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRoleChange} disabled={updating}>
              {updating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Updating...</> : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete <strong>{selectedUser?.name}</strong> ({selectedUser?.email})?
              <span className="block mt-2 text-destructive font-medium">
                This action cannot be undone. All user data including investments, deposits, and withdrawals will be permanently deleted.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={deleting}>
              {deleting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Deleting...</> : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Modal */}
      <UserDetailsModal user={selectedUser} open={detailsModalOpen} onOpenChange={setDetailsModalOpen} />
    </AdminLayout>
  );
};

export default UserManagement;