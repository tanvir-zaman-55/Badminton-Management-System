import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { CourtScheduler } from "../components/dashboard/CourtScheduler";
import { MyBookings } from "../components/dashboard/MyBookings";
import { TeamManagement } from "../components/dashboard/TeamManagement";
import { BrowseTrainers } from "../components/dashboard/BrowseTrainers";
import { MembershipManagement } from "../components/dashboard/MembershipManagement";
import { MyTrainingSessions } from "../components/dashboard/MyTrainingSessions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  CalendarCheck,
  BookOpen,
  Award,
  Users,
  Trophy,
  TrendingUp,
  Calendar,
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

interface UserDashboardProps {
  userName: string;
  userId: Id<"users">;
}

export function UserDashboard({ userName, userId }: UserDashboardProps) {
  const [activeView, setActiveView] = useState<"book" | "bookings" | "membership">("book");
  const membership = useQuery(api.memberships.getUserMembership, { userId });
  const bookings = useQuery(api.bookings.listForUser, { userId });

  const upcomingBookings = bookings?.filter(
    (b) => b.status === "confirmed" && new Date(b.bookingDate) >= new Date()
  ) || [];

  const handleViewMembership = () => {
    setActiveView("membership");
    // In a full app, this would navigate to MyMembership page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Welcome, {userName}!
            </h1>
            <p className="text-lg text-secondary mt-2">
              Book courts, manage your membership, and connect with coaches
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-secondary">
                    Upcoming Bookings
                  </CardTitle>
                  <CalendarCheck className="w-5 h-5 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-charcoal-900">
                  {upcomingBookings.length}
                </div>
                <p className="text-xs text-secondary mt-1">
                  Courts reserved
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-secondary">
                    Membership
                  </CardTitle>
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-charcoal-900">
                  {membership?.tier?.name || "No Membership"}
                </div>
                <Button
                  variant="link"
                  className="text-xs p-0 h-auto text-blue-600"
                  onClick={handleViewMembership}
                >
                  {membership?.status === "active" ? "View details" : "Get membership"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-secondary">
                    Discount Rate
                  </CardTitle>
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-charcoal-900">
                  {membership?.tier?.benefits?.discountPercent || 0}%
                </div>
                <p className="text-xs text-secondary mt-1">
                  On all bookings
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="book-court" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
              <TabsTrigger value="book-court">
                <BookOpen className="w-4 h-4 mr-2" />
                Book Court
              </TabsTrigger>
              <TabsTrigger value="my-bookings">
                <Calendar className="w-4 h-4 mr-2" />
                My Bookings
              </TabsTrigger>
              <TabsTrigger value="teams">
                <Users className="w-4 h-4 mr-2" />
                Teams
              </TabsTrigger>
              <TabsTrigger value="membership">
                <Award className="w-4 h-4 mr-2" />
                Membership
              </TabsTrigger>
              <TabsTrigger value="coaching">
                <Trophy className="w-4 h-4 mr-2" />
                Find Coaches
              </TabsTrigger>
              <TabsTrigger value="my-sessions">
                <TrendingUp className="w-4 h-4 mr-2" />
                My Sessions
              </TabsTrigger>
            </TabsList>

            {/* Book Court Tab */}
            <TabsContent value="book-court">
              <CourtScheduler userId={userId} />
            </TabsContent>

            {/* My Bookings Tab */}
            <TabsContent value="my-bookings">
              <MyBookings userId={userId} />
            </TabsContent>

            {/* Teams Tab */}
            <TabsContent value="teams">
              <TeamManagement userId={userId} />
            </TabsContent>

            {/* Membership Tab */}
            <TabsContent value="membership">
              <MembershipManagement userId={userId} />
            </TabsContent>

            {/* Find Coaches Tab */}
            <TabsContent value="coaching">
              <BrowseTrainers userId={userId} />
            </TabsContent>

            {/* My Training Sessions Tab */}
            <TabsContent value="my-sessions">
              <MyTrainingSessions userId={userId} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
