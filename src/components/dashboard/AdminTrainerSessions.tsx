import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Calendar, Clock, Users, Trophy, IndianRupee } from "lucide-react";
import { useState } from "react";

interface AdminTrainerSessionsProps {
  userId: Id<"users">;
}

export function AdminTrainerSessions({ userId }: AdminTrainerSessionsProps) {
  const [selectedTrainer, setSelectedTrainer] = useState<string>("all");

  const trainers = useQuery(api.trainers.list) ?? [];
  const allSessions = useQuery(api.trainers.listSessions, {}) ?? [];

  const filteredSessions =
    selectedTrainer === "all"
      ? allSessions
      : allSessions.filter((s) => s.trainerId === selectedTrainer);

  const upcomingSessions = filteredSessions.filter(
    (s) => new Date(s.date) >= new Date() && s.status === "scheduled"
  );

  const completedSessions = filteredSessions.filter(
    (s) => s.status === "completed"
  );

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Trainer Sessions Overview
          </CardTitle>
          <CardDescription className="text-white/90">
            Monitor all coaching sessions across all trainers
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Filter by Trainer */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 min-w-[100px]">
              Filter by Trainer:
            </label>
            <Select value={selectedTrainer} onValueChange={setSelectedTrainer}>
              <SelectTrigger className="w-[300px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trainers</SelectItem>
                {trainers.map((trainer) => (
                  <SelectItem key={trainer._id} value={trainer._id}>
                    {trainer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-secondary">Total Sessions</p>
                    <p className="text-3xl font-bold text-charcoal-900">
                      {filteredSessions.length}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-emerald-600" />
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
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-secondary">Completed</p>
                    <p className="text-3xl font-bold text-charcoal-900">
                      {completedSessions.length}
                    </p>
                  </div>
                  <Trophy className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          All Sessions ({filteredSessions.length})
        </h3>

        {filteredSessions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No sessions found</p>
              <p className="text-sm text-gray-500 mt-1">
                {selectedTrainer === "all"
                  ? "No coaching sessions have been created yet"
                  : "This trainer hasn't created any sessions yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((session) => (
              <Card
                key={session._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Trainer Info */}
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-indigo-600" />
                        <span className="font-semibold text-gray-900">
                          {session.trainer?.name || "Unknown Trainer"}
                        </span>
                      </div>

                      {/* Session Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{session.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>
                            {session.startTime}:00 ({session.duration} min)
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>
                            {session.studentIds?.length || 0} / {session.capacity}
                          </span>
                        </div>
                        {session.price && (
                          <div className="flex items-center gap-2 text-emerald-700 font-medium">
                            <IndianRupee className="w-4 h-4" />
                            <span>₹{session.price}</span>
                          </div>
                        )}
                      </div>

                      {/* Court and Type */}
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {session.type}
                        </Badge>
                        <Badge variant="outline">{session.court?.name}</Badge>
                        <Badge
                          className={
                            session.status === "scheduled"
                              ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                              : "bg-gray-100 text-gray-700 border-gray-300"
                          }
                        >
                          {session.status}
                        </Badge>
                      </div>

                      {/* Notes */}
                      {session.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                          "{session.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
