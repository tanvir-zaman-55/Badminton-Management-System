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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Trophy,
  Star,
  Clock,
  Users,
  Award,
  Calendar,
  IndianRupee,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";

interface BrowseTrainersProps {
  userId: Id<"users">;
}

export function BrowseTrainers({ userId }: BrowseTrainersProps) {
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);
  const [bookingSessionId, setBookingSessionId] = useState<string | null>(null);

  const trainers = useQuery(api.trainers.list) ?? [];
  const trainerSessions = useQuery(
    api.trainers.listSessions,
    selectedTrainer ? { trainerId: selectedTrainer._id } : "skip"
  );

  const bookSession = useMutation(api.trainers.bookSession);

  const upcomingSessions = (trainerSessions ?? []).filter(
    (s) => s.status === "scheduled" && new Date(s.date) >= new Date()
  );

  const handleBookSession = async (sessionId: Id<"coachingSessions">) => {
    setBookingSessionId(sessionId);
    try {
      await bookSession({ sessionId, userId });
      toast.success("Session booked successfully!");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBookingSessionId(null);
    }
  };

  const isUserBooked = (session: any) => {
    return session.studentIds?.includes(userId);
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-charcoal-900">{trainers.length}</h3>
              <p className="text-sm text-secondary">Professional Coaches Available</p>
            </div>
            <Trophy className="w-12 h-12 text-emerald-600" />
          </div>
        </CardContent>
      </Card>

      {/* Trainers Grid */}
      {trainers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No trainers available yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Check back later for coaching opportunities
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.map((trainer: any) => (
            <Card
              key={trainer._id}
              className="hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
              onClick={() => setSelectedTrainer(trainer)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {trainer.name.charAt(0).toUpperCase()}
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                    <Trophy className="w-3 h-3 mr-1" />
                    Certified
                  </Badge>
                </div>
                <CardTitle className="text-xl">{trainer.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {trainer.specialization || "Badminton Coach"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Rating */}
                {trainer.rating && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-semibold text-charcoal-900">
                        {trainer.rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-gray-500">
                      ({trainer.totalReviews || 0} reviews)
                    </span>
                  </div>
                )}

                {/* Experience */}
                {trainer.experience && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span>{trainer.experience} years experience</span>
                  </div>
                )}

                {/* Hourly Rate */}
                {trainer.hourlyRate && (
                  <div className="flex items-center gap-2 text-sm bg-emerald-50 p-2 rounded">
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-charcoal-900">
                      ₹{trainer.hourlyRate}/hour
                    </span>
                  </div>
                )}

                <Button
                  className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 mt-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTrainer(trainer);
                  }}
                >
                  View Sessions
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Trainer Details Dialog */}
      <Dialog open={!!selectedTrainer} onOpenChange={() => setSelectedTrainer(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {selectedTrainer?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl">{selectedTrainer?.name}</DialogTitle>
                <DialogDescription className="text-base mt-1">
                  {selectedTrainer?.specialization || "Badminton Coach"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Trainer Info */}
            <div className="grid grid-cols-2 gap-4">
              {selectedTrainer?.rating && (
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-5 h-5 text-amber-500 fill-current" />
                    <span className="text-2xl font-bold text-charcoal-900">
                      {selectedTrainer.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedTrainer.totalReviews || 0} reviews
                  </p>
                </div>
              )}

              {selectedTrainer?.experience && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-5 h-5 text-blue-600" />
                    <span className="text-2xl font-bold text-charcoal-900">
                      {selectedTrainer.experience}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Years of experience</p>
                </div>
              )}

              {selectedTrainer?.hourlyRate && (
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-2 mb-1">
                    <IndianRupee className="w-5 h-5 text-emerald-600" />
                    <span className="text-2xl font-bold text-charcoal-900">
                      ₹{selectedTrainer.hourlyRate}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Per hour</p>
                </div>
              )}

              {selectedTrainer?.certifications && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-semibold text-charcoal-900">Certified</span>
                  </div>
                  <p className="text-sm text-gray-600">Professional coach</p>
                </div>
              )}
            </div>

            {/* Bio */}
            {selectedTrainer?.bio && (
              <div>
                <h4 className="text-sm font-semibold text-charcoal-900 mb-2">About</h4>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {selectedTrainer.bio}
                </p>
              </div>
            )}

            {/* Upcoming Sessions */}
            <div>
              <h4 className="text-sm font-semibold text-charcoal-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Upcoming Sessions ({upcomingSessions.length})
              </h4>

              {upcomingSessions.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">No upcoming sessions available</p>
                  <p className="text-xs text-gray-500 mt-1">Check back later for new sessions</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {upcomingSessions.map((session: any) => (
                    <div
                      key={session._id}
                      className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="capitalize text-xs">
                              {session.type}
                            </Badge>
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">
                              {session.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{session.court?.name}</span>
                          </div>
                        </div>
                        {session.price && (
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                              <IndianRupee className="w-4 h-4" />
                              <span>{session.price}</span>
                            </div>
                            <div className="text-xs text-gray-500">per session</div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{format(new Date(session.date), "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{session.startTime}:00 ({session.duration}min)</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Users className="w-3.5 h-3.5" />
                          <span>
                            {session.studentIds?.length || 0}/{session.capacity}
                          </span>
                        </div>
                      </div>

                      {isUserBooked(session) ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-3 border-emerald-600 text-emerald-700"
                          disabled
                        >
                          ✓ Booked
                        </Button>
                      ) : session.studentIds?.length < session.capacity ? (
                        <Button
                          size="sm"
                          className="w-full mt-3 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
                          onClick={() => handleBookSession(session._id)}
                          disabled={bookingSessionId === session._id}
                        >
                          {bookingSessionId === session._id ? "Booking..." : "Book Session"}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-3"
                          disabled
                        >
                          Full
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
