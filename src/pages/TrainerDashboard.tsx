import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { CourtScheduler } from "../components/dashboard/CourtScheduler";
import { MyBookings } from "../components/dashboard/MyBookings";
import { TrainerStudents } from "../components/dashboard/TrainerStudents";
import { TrainerProfile } from "../components/dashboard/TrainerProfile";
import { CreateSession } from "../components/dashboard/CreateSession";
import {
  Trophy,
  Users,
  Calendar,
  IndianRupee,
  BookOpen,
  UserCircle,
  Plus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

interface TrainerDashboardProps {
  userName: string;
  userId: Id<"users">;
}

export function TrainerDashboard({ userName, userId }: TrainerDashboardProps) {
  const [showCreateSession, setShowCreateSession] = useState(false);

  // Get trainer profile
  const trainers = useQuery(api.trainers.list);
  const myTrainerProfile = trainers?.find((t) => t.userId === userId);

  // Get my coaching sessions
  const mySessions = useQuery(
    api.trainers.listSessions,
    myTrainerProfile ? { trainerId: myTrainerProfile._id } : "skip"
  );

  // Calculate stats
  const upcomingSessions = mySessions?.filter(
    (s) => new Date(s.date) >= new Date() && s.status === "scheduled"
  ) || [];

  const totalStudents = new Set(
    mySessions?.flatMap((s) => s.studentIds) || []
  ).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Trainer Dashboard
            </h1>
            <p className="text-lg text-secondary mt-2">
              Welcome back, Coach {userName}!
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-secondary">
                    Upcoming Sessions
                  </CardTitle>
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-charcoal-900">
                  {upcomingSessions.length}
                </div>
                <p className="text-xs text-secondary mt-1">
                  Sessions scheduled
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-secondary">
                    Total Students
                  </CardTitle>
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-charcoal-900">
                  {totalStudents}
                </div>
                <p className="text-xs text-secondary mt-1">
                  Active students
                </p>
              </CardContent>
            </Card>

            <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-secondary">
                    Rating
                  </CardTitle>
                  <Trophy className="w-5 h-5 text-teal-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-charcoal-900">
                  {myTrainerProfile?.rating?.toFixed(1) || "N/A"}
                </div>
                <p className="text-xs text-secondary mt-1">
                  {myTrainerProfile?.totalReviews || 0} reviews
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue={myTrainerProfile ? "sessions" : "profile"} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile">
                <UserCircle className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="sessions" disabled={!myTrainerProfile}>
                <Calendar className="w-4 h-4 mr-2" />
                Sessions
              </TabsTrigger>
              <TabsTrigger value="students" disabled={!myTrainerProfile}>
                <Users className="w-4 h-4 mr-2" />
                Students
              </TabsTrigger>
              <TabsTrigger value="book-court">
                <BookOpen className="w-4 h-4 mr-2" />
                Book Court
              </TabsTrigger>
              <TabsTrigger value="my-bookings">
                My Bookings
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <TrainerProfile userId={userId} userName={userName} />
            </TabsContent>

            {/* My Coaching Sessions */}
            <TabsContent value="sessions" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>My Coaching Sessions</CardTitle>
                      <CardDescription>
                        Sessions you've created and scheduled
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => setShowCreateSession(true)}
                      className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Session
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {!mySessions || mySessions.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-secondary">No coaching sessions yet</p>
                      <p className="text-sm text-secondary mt-1">
                        Create your first session to start coaching
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {mySessions.map((session) => (
                        <Card key={session._id} className="border-emerald-200">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="capitalize">
                                    {session.type}
                                  </Badge>
                                  <Badge
                                    className={
                                      session.status === "scheduled"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-gray-100 text-gray-700"
                                    }
                                  >
                                    {session.status}
                                  </Badge>
                                </div>
                                <div className="space-y-1">
                                  <p className="font-medium">{session.court?.name}</p>
                                  <p className="text-sm text-secondary">
                                    {session.date} at {session.startTime}:00 ({session.duration} min)
                                  </p>
                                  <p className="text-sm text-secondary">
                                    Capacity: {session.studentIds?.length || 0} / {session.capacity}
                                  </p>
                                  {session.price && (
                                    <p className="text-sm font-medium text-emerald-700 flex items-center gap-1">
                                      <IndianRupee className="w-4 h-4" />
                                      {session.price} per session
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* My Students */}
            <TabsContent value="students">
              {myTrainerProfile ? (
                <TrainerStudents trainerId={myTrainerProfile._id} />
              ) : (
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
                      <p className="text-secondary">Trainer profile not found</p>
                      <p className="text-sm text-secondary mt-1">
                        Please contact admin to set up your trainer profile
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Book Court (Trainers can also book courts) */}
            <TabsContent value="book-court">
              <CourtScheduler userId={userId} />
            </TabsContent>

            {/* My Court Bookings */}
            <TabsContent value="my-bookings">
              <MyBookings userId={userId} />
            </TabsContent>
          </Tabs>

          {/* Create Session Dialog */}
          {myTrainerProfile && (
            <CreateSession
              trainerId={myTrainerProfile._id}
              open={showCreateSession}
              onOpenChange={setShowCreateSession}
            />
          )}
        </div>
      </main>
    </div>
  );
}
