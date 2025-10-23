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
import { Badge } from "../ui/badge";
import {
  Trophy,
  Calendar,
  Clock,
  Users,
  IndianRupee,
  MapPin,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";

interface MyTrainingSessionsProps {
  userId: Id<"users">;
}

export function MyTrainingSessions({ userId }: MyTrainingSessionsProps) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const mySessions = useQuery(api.trainers.getUserSessions, { userId }) ?? [];
  const cancelBooking = useMutation(api.trainers.cancelSessionBooking);

  const upcomingSessions = mySessions.filter(
    (s) => new Date(s.date) >= new Date() && s.status === "scheduled"
  );

  const pastSessions = mySessions.filter(
    (s) => new Date(s.date) < new Date() || s.status === "completed"
  );

  const handleCancelBooking = async (sessionId: Id<"coachingSessions">) => {
    if (!confirm("Are you sure you want to cancel this session booking?")) {
      return;
    }

    setCancellingId(sessionId);
    try {
      await cancelBooking({ sessionId, userId });
      toast.success("Booking cancelled successfully");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary">Total Sessions</p>
                <p className="text-3xl font-bold text-charcoal-900">
                  {mySessions.length}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary">Upcoming</p>
                <p className="text-3xl font-bold text-charcoal-900">
                  {upcomingSessions.length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary">Completed</p>
                <p className="text-3xl font-bold text-charcoal-900">
                  {pastSessions.length}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Upcoming Training Sessions
          </CardTitle>
          <CardDescription className="text-white/90">
            Your scheduled coaching sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-2">
                No upcoming sessions
              </p>
              <p className="text-sm text-gray-500">
                Browse trainers to book your first coaching session
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map((session: any) => (
                <Card
                  key={session._id}
                  className="border-2 border-emerald-100 hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Trainer Info */}
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold shadow">
                            {session.trainer?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-lg text-charcoal-900">
                              {session.trainer?.name || "Unknown Trainer"}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="capitalize text-xs">
                                {session.type}
                              </Badge>
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">
                                {session.status}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Session Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(session.date), "MMM d, yyyy")}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>
                              {session.startTime}:00 ({session.duration}min)
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{session.court?.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>
                              {session.studentIds?.length}/{session.capacity}
                            </span>
                          </div>
                        </div>

                        {session.price && (
                          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                            <IndianRupee className="w-5 h-5" />
                            <span>₹{session.price}</span>
                          </div>
                        )}
                      </div>

                      {/* Cancel Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => handleCancelBooking(session._id)}
                        disabled={cancellingId === session._id}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        {cancellingId === session._id ? "Cancelling..." : "Cancel"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Sessions */}
      {pastSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Past Sessions</CardTitle>
            <CardDescription>Your completed training history</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {pastSessions.map((session: any) => (
                <div
                  key={session._id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-4 h-4 text-purple-600" />
                        <span className="font-semibold text-gray-900">
                          {session.trainer?.name || "Unknown Trainer"}
                        </span>
                        <Badge variant="outline" className="capitalize text-xs">
                          {session.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{format(new Date(session.date), "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{session.startTime}:00</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{session.court?.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
