import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Users,
  Shield,
  UserCog,
  CheckCircle,
  XCircle,
  Trophy,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface UserManagementProps {
  userId: Id<"users">;
}

const roleColors = {
  admin: "bg-purple-100 text-purple-700 border-purple-300",
  user: "bg-blue-100 text-blue-700 border-blue-300",
  trainer: "bg-emerald-100 text-emerald-700 border-emerald-300",
};

const roleIcons = {
  admin: Shield,
  user: Users,
  trainer: Trophy,
};

export function UserManagement({ userId }: UserManagementProps) {
  const users = useQuery(api.simpleAuth.listAllUsers, { adminUserId: userId });
  const updateUserRole = useMutation(api.simpleAuth.updateUserRole);
  const [updatingUserId, setUpdatingUserId] = useState<Id<"users"> | null>(null);

  const handleRoleChange = async (targetUserId: Id<"users">, newRole: "admin" | "user" | "trainer") => {
    setUpdatingUserId(targetUserId);
    try {
      await updateUserRole({
        adminUserId: userId,
        targetUserId,
        newRole,
      });
      toast.success("User role updated successfully");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleKey = role as keyof typeof roleColors;
    const Icon = roleIcons[roleKey] || Users;
    return (
      <Badge variant="outline" className={roleColors[roleKey]}>
        <Icon className="w-3 h-3 mr-1" />
        {role}
      </Badge>
    );
  };

  return (
    <Card className="bg-gradient-to-br from-white to-purple-50/30 border-purple-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <UserCog className="w-6 h-6 text-purple-600" />
          User Management
        </CardTitle>
        <CardDescription>
          Manage user roles and permissions across the system
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!users || users.length === 0 ? (
          <div className="text-center py-8 text-secondary">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="rounded-lg border border-purple-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-purple-50">
                  <TableHead className="font-bold">Name</TableHead>
                  <TableHead className="font-bold">Email</TableHead>
                  <TableHead className="font-bold">Role</TableHead>
                  <TableHead className="font-bold">Verified</TableHead>
                  <TableHead className="font-bold">Joined</TableHead>
                  <TableHead className="font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const isCurrentUser = user._id === userId;
                  const isUpdating = updatingUserId === user._id;

                  return (
                    <TableRow key={user._id} className="hover:bg-purple-50/50">
                      <TableCell className="font-medium">
                        {user.name}
                        {isCurrentUser && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            You
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-secondary">{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        {user.emailVerified ? (
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </TableCell>
                      <TableCell className="text-secondary text-sm">
                        {user.createdAt
                          ? format(new Date(user.createdAt), "MMM d, yyyy")
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {isCurrentUser ? (
                          <span className="text-xs text-secondary italic">
                            Cannot modify own role
                          </span>
                        ) : (
                          <Select
                            value={user.role}
                            onValueChange={(value) =>
                              handleRoleChange(user._id, value as "admin" | "user" | "trainer")
                            }
                            disabled={isUpdating}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  User
                                </div>
                              </SelectItem>
                              <SelectItem value="trainer">
                                <div className="flex items-center gap-2">
                                  <Trophy className="w-4 h-4" />
                                  Trainer
                                </div>
                              </SelectItem>
                              <SelectItem value="admin">
                                <div className="flex items-center gap-2">
                                  <Shield className="w-4 h-4" />
                                  Admin
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Role Information */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-bold text-charcoal-900">User</p>
                  <p className="text-xs text-secondary">Book courts, join teams</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-emerald-600" />
                <div>
                  <p className="font-bold text-charcoal-900">Trainer</p>
                  <p className="text-xs text-secondary">Create coaching sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="font-bold text-charcoal-900">Admin</p>
                  <p className="text-xs text-secondary">Full system access</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
