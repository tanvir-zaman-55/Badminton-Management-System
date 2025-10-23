import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Users,
  Plus,
  Crown,
  UserPlus,
  LogOut,
  Shield,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

interface TeamManagementProps {
  userId: Id<"users">;
}

export function TeamManagement({ userId }: TeamManagementProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  const myTeams = useQuery(api.teams.getUserTeams, { userId }) ?? [];
  const allTeams = useQuery(api.teams.list) ?? [];
  const createTeam = useMutation(api.teams.create);
  const joinTeam = useMutation(api.teams.join);
  const leaveTeam = useMutation(api.teams.removeMember);

  const teamMembers = useQuery(
    api.teams.getById,
    selectedTeam ? { teamId: selectedTeam._id } : "skip"
  );

  const handleCreateTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const maxMembers = parseInt(formData.get("maxMembers") as string);

    try {
      await createTeam({
        userId,
        name,
        description: description || undefined,
        maxMembers: maxMembers || 6,
      });
      toast.success("Team created successfully!");
      setShowCreateDialog(false);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinTeam = async (teamId: Id<"teams">) => {
    try {
      await joinTeam({ userId, teamId });
      toast.success("Joined team successfully!");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleLeaveTeam = async (teamId: Id<"teams">) => {
    if (!confirm("Are you sure you want to leave this team?")) return;

    try {
      await leaveTeam({ teamId, userId, requesterId: userId });
      toast.success("Left team successfully");
      setSelectedTeam(null);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const availableTeams = allTeams.filter(
    (team) => !myTeams.some((myTeam) => myTeam._id === team._id)
  );

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary">My Teams</p>
                <p className="text-3xl font-bold text-charcoal-900">{myTeams.length}</p>
              </div>
              <Users className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary">Available Teams</p>
                <p className="text-3xl font-bold text-charcoal-900">{availableTeams.length}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Team
        </Button>
      </div>

      {/* Teams Tabs */}
      <Tabs defaultValue="my-teams" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-teams">My Teams ({myTeams.length})</TabsTrigger>
          <TabsTrigger value="all-teams">All Teams ({allTeams.length})</TabsTrigger>
        </TabsList>

        {/* My Teams */}
        <TabsContent value="my-teams" className="space-y-3 mt-4">
          {myTeams.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-2">No teams yet</p>
                <p className="text-sm text-gray-500 mb-4">Create or join a team to get started</p>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Team
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myTeams.map((team: any) => (
                <Card
                  key={team._id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedTeam(team)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <CardDescription className="mt-1 line-clamp-2">
                          {team.description || "No description"}
                        </CardDescription>
                      </div>
                      {team.userRole === "captain" && (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                          <Crown className="w-3 h-3 mr-1" />
                          Captain
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>
                          {team.memberCount} / {team.maxMembers || 6} members
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{format(team.createdAt, "MMM yyyy")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* All Teams */}
        <TabsContent value="all-teams" className="space-y-3 mt-4">
          {allTeams.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No teams available</p>
                <p className="text-sm text-gray-500 mt-1">Be the first to create a team!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allTeams.map((team: any) => {
                const isMember = myTeams.some((myTeam) => myTeam._id === team._id);
                const isFull = team.memberCount >= (team.maxMembers || 6);

                return (
                  <Card key={team._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{team.name}</CardTitle>
                          <CardDescription className="mt-1 line-clamp-2">
                            {team.description || "No description"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>
                            {team.memberCount} / {team.maxMembers || 6} members
                          </span>
                        </div>
                        <div className="text-gray-600">
                          <span className="font-medium">{team.captainName}</span>
                          <span className="text-xs ml-1">(Captain)</span>
                        </div>
                      </div>

                      {isMember ? (
                        <Button variant="outline" disabled className="w-full">
                          <Users className="w-4 h-4 mr-2" />
                          Already a Member
                        </Button>
                      ) : isFull ? (
                        <Button variant="outline" disabled className="w-full">
                          Team Full
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleJoinTeam(team._id)}
                          className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Join Team
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Team Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Create a team and invite others to join you
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTeam}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Team Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter team name"
                  required
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your team..."
                  rows={3}
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxMembers">Max Members</Label>
                <Input
                  id="maxMembers"
                  name="maxMembers"
                  type="number"
                  min={2}
                  max={20}
                  defaultValue={6}
                  disabled={isCreating}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isCreating ? "Creating..." : "Create Team"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Team Details Dialog */}
      <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTeam?.name}</DialogTitle>
            <DialogDescription>
              {selectedTeam?.description || "No description provided"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Team Members</h4>
              <div className="space-y-2">
                {teamMembers?.members?.map((member: any) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                        {member.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{member.user?.name}</span>
                    </div>
                    {member.role === "captain" && (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                        <Crown className="w-3 h-3 mr-1" />
                        Captain
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            {selectedTeam?.userRole !== "captain" && (
              <Button
                variant="destructive"
                onClick={() => handleLeaveTeam(selectedTeam?._id)}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Leave Team
              </Button>
            )}
            <Button variant="outline" onClick={() => setSelectedTeam(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
