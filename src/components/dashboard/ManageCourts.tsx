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
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Plus, Building2, CheckCircle, XCircle, Edit, Trash2 } from "lucide-react";

interface ManageCourtsProps {
  userId: Id<"users">;
}

export function ManageCourts({ userId }: ManageCourtsProps) {
  const [newCourtName, setNewCourtName] = useState("");
  const [startHour, setStartHour] = useState(6);
  const [endHour, setEndHour] = useState(22);
  const [hourlyRate, setHourlyRate] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [weeklyRate, setWeeklyRate] = useState("");
  const [monthlyRate, setMonthlyRate] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingCourt, setEditingCourt] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const courts = useQuery(api.courts.list) ?? [];
  const addCourt = useMutation(api.courts.add);
  const updateCourt = useMutation(api.courts.update);
  const deleteCourt = useMutation(api.courts.deleteCourt);

  const handleAddCourt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourtName.trim()) {
      toast.error("Court name cannot be empty.");
      return;
    }
    if (startHour >= endHour) {
      toast.error("Start hour must be before end hour.");
      return;
    }
    setIsAdding(true);
    try {
      await addCourt({
        userId,
        name: newCourtName,
        openHours: {
          start: startHour,
          end: endHour,
        },
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        dailyRate: dailyRate ? parseFloat(dailyRate) : undefined,
        weeklyRate: weeklyRate ? parseFloat(weeklyRate) : undefined,
        monthlyRate: monthlyRate ? parseFloat(monthlyRate) : undefined,
      });
      setNewCourtName("");
      setStartHour(6);
      setEndHour(22);
      setHourlyRate("");
      setDailyRate("");
      setWeeklyRate("");
      setMonthlyRate("");
      toast.success("Court added successfully!");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditCourt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCourt) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const startHour = parseInt(formData.get("startHour") as string);
    const endHour = parseInt(formData.get("endHour") as string);
    const hourlyRateVal = formData.get("hourlyRate") as string;
    const dailyRateVal = formData.get("dailyRate") as string;
    const weeklyRateVal = formData.get("weeklyRate") as string;
    const monthlyRateVal = formData.get("monthlyRate") as string;

    if (startHour >= endHour) {
      toast.error("Start hour must be before end hour.");
      return;
    }

    setIsEditing(true);
    try {
      await updateCourt({
        userId,
        courtId: editingCourt._id,
        name,
        openHours: {
          start: startHour,
          end: endHour,
        },
        hourlyRate: hourlyRateVal ? parseFloat(hourlyRateVal) : undefined,
        dailyRate: dailyRateVal ? parseFloat(dailyRateVal) : undefined,
        weeklyRate: weeklyRateVal ? parseFloat(weeklyRateVal) : undefined,
        monthlyRate: monthlyRateVal ? parseFloat(monthlyRateVal) : undefined,
      });
      toast.success("Court updated successfully!");
      setEditingCourt(null);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteCourt = async (courtId: Id<"courts">, courtName: string) => {
    if (!confirm(`Are you sure you want to delete "${courtName}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteCourt({ userId, courtId });
      toast.success("Court deleted successfully!");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6" />
          <div>
            <CardTitle className="text-2xl">Manage Courts</CardTitle>
            <CardDescription className="text-white/90">
              Add and manage badminton courts
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Add Court Form */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <h3 className="text-sm font-semibold text-charcoal-900 mb-3">Add New Court</h3>
          <form onSubmit={handleAddCourt} className="space-y-3">
            <Input
              type="text"
              value={newCourtName}
              onChange={(e) => setNewCourtName(e.target.value)}
              placeholder="Enter court name (e.g., Court 1)"
              className="h-11"
            />
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Open Hour (24h format)
                </label>
                <Input
                  type="number"
                  min={0}
                  max={23}
                  value={startHour}
                  onChange={(e) => setStartHour(parseInt(e.target.value))}
                  className="h-11"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Close Hour (24h format)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={24}
                  value={endHour}
                  onChange={(e) => setEndHour(parseInt(e.target.value))}
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Pricing (Optional)</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  min={0}
                  step={50}
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="Hourly (₹)"
                  className="h-11"
                />
                <Input
                  type="number"
                  min={0}
                  step={100}
                  value={dailyRate}
                  onChange={(e) => setDailyRate(e.target.value)}
                  placeholder="Daily (₹)"
                  className="h-11"
                />
                <Input
                  type="number"
                  min={0}
                  step={500}
                  value={weeklyRate}
                  onChange={(e) => setWeeklyRate(e.target.value)}
                  placeholder="Weekly (₹)"
                  className="h-11"
                />
                <Input
                  type="number"
                  min={0}
                  step={1000}
                  value={monthlyRate}
                  onChange={(e) => setMonthlyRate(e.target.value)}
                  placeholder="Monthly (₹)"
                  className="h-11"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isAdding}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isAdding ? "Adding..." : "Add Court"}
            </Button>
          </form>
        </div>

        {/* Courts List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-charcoal-900">
              Existing Courts ({courts.length})
            </h3>
          </div>

          {courts.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No courts yet</p>
              <p className="text-sm text-gray-500 mt-1">Add your first court above</p>
            </div>
          ) : (
            <div className="space-y-2">
              {courts.map((court) => (
                <div
                  key={court._id}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {court.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-charcoal-900">{court.name}</h4>
                      {court.openHours ? (
                        <p className="text-sm text-gray-600">
                          Open: {court.openHours.start}:00 - {court.openHours.end}:00
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600">
                          Open: 6:00 - 22:00 (default)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        court.status === "active"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                          : "bg-red-100 text-red-700 border-red-300"
                      }
                      variant="outline"
                    >
                      {court.status === "active" ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {court.status}
                    </Badge>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCourt(court)}
                      className="border-blue-200 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCourt(court._id, court.name)}
                      disabled={isDeleting}
                      className="border-red-200 hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Edit Court Dialog */}
    <Dialog open={!!editingCourt} onOpenChange={() => setEditingCourt(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Court</DialogTitle>
          <DialogDescription>
            Update court information and operating hours
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleEditCourt}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Court Name</Label>
              <Input
                id="edit-name"
                name="name"
                defaultValue={editingCourt?.name}
                required
                disabled={isEditing}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="edit-startHour">Open Hour (24h format)</Label>
                <Input
                  id="edit-startHour"
                  name="startHour"
                  type="number"
                  min={0}
                  max={23}
                  defaultValue={editingCourt?.openHours?.start ?? 6}
                  disabled={isEditing}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-endHour">Close Hour (24h format)</Label>
                <Input
                  id="edit-endHour"
                  name="endHour"
                  type="number"
                  min={1}
                  max={24}
                  defaultValue={editingCourt?.openHours?.end ?? 22}
                  disabled={isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Pricing (Optional)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  name="hourlyRate"
                  type="number"
                  min={0}
                  step={50}
                  placeholder="Hourly (₹)"
                  defaultValue={editingCourt?.hourlyRate}
                  disabled={isEditing}
                />
                <Input
                  name="dailyRate"
                  type="number"
                  min={0}
                  step={100}
                  placeholder="Daily (₹)"
                  defaultValue={editingCourt?.dailyRate}
                  disabled={isEditing}
                />
                <Input
                  name="weeklyRate"
                  type="number"
                  min={0}
                  step={500}
                  placeholder="Weekly (₹)"
                  defaultValue={editingCourt?.weeklyRate}
                  disabled={isEditing}
                />
                <Input
                  name="monthlyRate"
                  type="number"
                  min={0}
                  step={1000}
                  placeholder="Monthly (₹)"
                  defaultValue={editingCourt?.monthlyRate}
                  disabled={isEditing}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingCourt(null)}
              disabled={isEditing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isEditing}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isEditing ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
