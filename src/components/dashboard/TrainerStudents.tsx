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
  Users,
  Calendar,
  Trophy,
  IndianRupee,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface TrainerStudentsProps {
  trainerId: Id<"trainers">;
}

export function TrainerStudents({ trainerId }: TrainerStudentsProps) {
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  // Get all sessions for this trainer
  const sessions = useQuery(api.trainers.listSessions, { trainerId }) ?? [];

  // Get all users to map student IDs to names
  const users = useQuery(api.simpleAuth.getAllUsers) ?? [];

  // Build student data structure
  const studentDataMap = sessions.reduce((acc, session) => {
    session.studentIds?.forEach((studentId) => {
      if (!acc[studentId]) {
        const user = users.find((u) => u._id === studentId);
        acc[studentId] = {
          id: studentId,
          name: user?.name || "Unknown Student",
          email: user?.email || "",
          sessions: [],
          totalSessions: 0,
          upcomingSessions: 0,
          completedSessions: 0,
          totalRevenue: 0,
        };
      }

      acc[studentId].sessions.push({
        id: session._id,
        type: session.type,
        date: session.date,
        startTime: session.startTime,
        duration: session.duration,
        status: session.status,
        price: session.price || 0,
        courtName: session.court?.name || "Unknown Court",
      });

      acc[studentId].totalSessions += 1;
      if (session.status === "scheduled" && new Date(session.date) >= new Date()) {
        acc[studentId].upcomingSessions += 1;
      }
      if (session.status === "completed") {
        acc[studentId].completedSessions += 1;
      }
      if (session.price) {
        acc[studentId].totalRevenue += session.price;
      }
    });
    return acc;
  }, {} as Record<string, any>);

  const students = Object.values(studentDataMap).sort(
    (a: any, b: any) => b.totalSessions - a.totalSessions
  );

  const toggleStudent = (studentId: string) => {
    setExpandedStudent(expandedStudent === studentId ? null : studentId);
  };

  if (students.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Students</CardTitle>
          <CardDescription>
            Students who have booked your coaching sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-secondary">No students yet</p>
            <p className="text-sm text-secondary mt-1">
              Students will appear here once they book your sessions
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary">Total Students</p>
                <p className="text-3xl font-bold text-charcoal-900">
                  {students.length}
                </p>
              </div>
              <Users className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary">Total Sessions</p>
                <p className="text-3xl font-bold text-charcoal-900">
                  {students.reduce((sum: number, s: any) => sum + s.totalSessions, 0)}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary">Total Revenue</p>
                <p className="text-3xl font-bold text-charcoal-900">
                  ₹{students.reduce((sum: number, s: any) => sum + s.totalRevenue, 0).toLocaleString()}
                </p>
              </div>
              <IndianRupee className="w-8 h-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {students.map((student: any, index) => (
          <Card
            key={student.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
          >
            <CardContent className="p-4">
              <div
                onClick={() => toggleStudent(student.id)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg text-charcoal-900">
                        {student.name}
                      </h3>
                      {index === 0 && (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                          <Trophy className="w-3 h-3 mr-1" />
                          Top Student
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-secondary">{student.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 mr-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">
                      {student.totalSessions}
                    </p>
                    <p className="text-xs text-secondary">Total Sessions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {student.upcomingSessions}
                    </p>
                    <p className="text-xs text-secondary">Upcoming</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-teal-600">
                      ₹{student.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-secondary">Revenue</p>
                  </div>
                </div>

                {expandedStudent === student.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>

              {/* Expanded Session History */}
              {expandedStudent === student.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-charcoal-900 mb-3">
                    Session History
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {student.sessions
                      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((session: any) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <Badge
                              variant="outline"
                              className="capitalize text-xs"
                            >
                              {session.type}
                            </Badge>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-charcoal-900">
                                {session.courtName}
                              </p>
                              <p className="text-xs text-secondary">
                                {format(new Date(session.date), "MMM d, yyyy")} at{" "}
                                {session.startTime}:00 ({session.duration} min)
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              className={
                                session.status === "scheduled"
                                  ? "bg-blue-100 text-blue-700"
                                  : session.status === "completed"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-gray-100 text-gray-700"
                              }
                            >
                              {session.status}
                            </Badge>
                            {session.price > 0 && (
                              <span className="text-sm font-semibold text-teal-700">
                                ₹{session.price}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
