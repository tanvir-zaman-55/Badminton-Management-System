import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { CalendarIcon, Plus, Users, Clock, IndianRupee } from "lucide-react";

interface CreateSessionProps {
  trainerId: Id<"trainers">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSession({ trainerId, open, onOpenChange }: CreateSessionProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [sessionType, setSessionType] = useState<"private" | "group" | "assessment">("group");

  const courts = useQuery(api.courts.list) ?? [];
  const createSession = useMutation(api.trainers.createSession);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    setIsCreating(true);

    const formData = new FormData(e.currentTarget);
    const courtId = formData.get("courtId") as string;
    const startTime = parseInt(formData.get("startTime") as string);
    const duration = parseInt(formData.get("duration") as string);
    const capacity = parseInt(formData.get("capacity") as string);
    const price = parseFloat(formData.get("price") as string);
    const notes = formData.get("notes") as string;

    if (!courtId) {
      toast.error("Please select a court");
      setIsCreating(false);
      return;
    }

    try {
      await createSession({
        trainerId,
        courtId: courtId as Id<"courts">,
        type: sessionType,
        date: selectedDate,
        startTime,
        duration,
        capacity,
        price: price || undefined,
        notes: notes || undefined,
      });

      toast.success("Coaching session created successfully!");
      onOpenChange(false);

      // Reset form
      setSelectedDate("");
      setSessionType("group");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Plus className="w-6 h-6 text-emerald-600" />
            Create Coaching Session
          </DialogTitle>
          <DialogDescription>
            Schedule a new coaching session for students to book
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Session Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Session Type</Label>
            <Select
              value={sessionType}
              onValueChange={(value) => setSessionType(value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private (1-on-1)</SelectItem>
                <SelectItem value="group">Group Session</SelectItem>
                <SelectItem value="assessment">Skill Assessment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Court Selection */}
          <div className="space-y-2">
            <Label htmlFor="courtId">Court</Label>
            <Select name="courtId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a court" />
              </SelectTrigger>
              <SelectContent>
                {courts.map((court) => (
                  <SelectItem key={court._id} value={court._id}>
                    {court.name} {court.openHours ? `(${court.openHours.start}:00 - ${court.openHours.end}:00)` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-emerald-600" />
              Session Date
            </Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
              disabled={isCreating}
              className="w-full"
            />
          </div>

          {/* Time and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Start Time (24h)
              </Label>
              <Input
                id="startTime"
                name="startTime"
                type="number"
                min={0}
                max={23}
                defaultValue={9}
                required
                disabled={isCreating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                min={30}
                max={240}
                step={30}
                defaultValue={60}
                required
                disabled={isCreating}
              />
            </div>
          </div>

          {/* Capacity and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity" className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                Max Students
              </Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min={1}
                max={20}
                defaultValue={sessionType === "private" ? 1 : 6}
                required
                disabled={isCreating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-teal-600" />
                Price per Student (₹)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                min={0}
                step={50}
                placeholder="Optional"
                disabled={isCreating}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Session Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Add any special instructions, requirements, or focus areas..."
              disabled={isCreating}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
            >
              {isCreating ? "Creating..." : "Create Session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
