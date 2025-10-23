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
  IndianRupee,
  TrendingUp,
  Calendar,
  Users,
  Trophy,
  DollarSign,
} from "lucide-react";

interface RevenueAnalyticsProps {
  userId: Id<"users">;
}

export function RevenueAnalytics({ userId }: RevenueAnalyticsProps) {
  const bookings = useQuery(api.bookings.listAll, { userId }) ?? [];

  // Filter confirmed bookings with price
  const confirmedBookings = bookings.filter(
    (b) => b.status === "confirmed" && b.price
  );

  // Calculate total revenue
  const totalRevenue = confirmedBookings.reduce(
    (sum, b) => sum + (b.price || 0),
    0
  );

  // Get today's date at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get start of week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  // Get start of month
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Calculate revenue by time period
  const todayRevenue = confirmedBookings
    .filter((b) => new Date(b.bookingDate) >= today)
    .reduce((sum, b) => sum + (b.price || 0), 0);

  const weekRevenue = confirmedBookings
    .filter((b) => new Date(b.bookingDate) >= startOfWeek)
    .reduce((sum, b) => sum + (b.price || 0), 0);

  const monthRevenue = confirmedBookings
    .filter((b) => new Date(b.bookingDate) >= startOfMonth)
    .reduce((sum, b) => sum + (b.price || 0), 0);

  // Calculate revenue per court
  const revenueByCourtMap = confirmedBookings.reduce((acc, booking) => {
    const courtName = booking.courtName || "Unknown";
    acc[courtName] = (acc[courtName] || 0) + (booking.price || 0);
    return acc;
  }, {} as Record<string, number>);

  const revenueByCourtArray = Object.entries(revenueByCourtMap)
    .map(([court, revenue]) => ({ court, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Calculate revenue per user
  const revenueByUserMap = confirmedBookings.reduce((acc, booking) => {
    const userName = booking.userName || "Unknown";
    const userId = booking.userId;
    if (!acc[userId]) {
      acc[userId] = { name: userName, revenue: 0, bookings: 0 };
    }
    acc[userId].revenue += booking.price || 0;
    acc[userId].bookings += 1;
    return acc;
  }, {} as Record<string, { name: string; revenue: number; bookings: number }>);

  const topUsers = Object.entries(revenueByUserMap)
    .map(([userId, data]) => ({ userId, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Calculate average booking value
  const avgBookingValue =
    confirmedBookings.length > 0 ? totalRevenue / confirmedBookings.length : 0;

  return (
    <div className="space-y-6">
      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-secondary">
                Total Revenue
              </CardTitle>
              <IndianRupee className="w-5 h-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-charcoal-900">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-secondary mt-1">
              From {confirmedBookings.length} bookings
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-secondary">
                This Month
              </CardTitle>
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-charcoal-900">
              ₹{monthRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-secondary mt-1">Monthly revenue</p>
          </CardContent>
        </Card>

        <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-secondary">
                This Week
              </CardTitle>
              <TrendingUp className="w-5 h-5 text-teal-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-charcoal-900">
              ₹{weekRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-secondary mt-1">Weekly revenue</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-secondary">
                Avg Booking
              </CardTitle>
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-charcoal-900">
              ₹{Math.round(avgBookingValue)}
            </div>
            <p className="text-xs text-secondary mt-1">Per booking</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Revenue by Court */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-emerald-600" />
              Top Courts by Revenue
            </CardTitle>
            <CardDescription>
              Courts generating the most revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            {revenueByCourtArray.length > 0 ? (
              <div className="space-y-4">
                {revenueByCourtArray.map((item, index) => (
                  <div key={item.court} className="flex items-center gap-3">
                    <Badge
                      className={
                        index === 0
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-100 text-gray-700"
                      }
                    >
                      #{index + 1}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-medium text-charcoal-900">
                        {item.court}
                      </div>
                      <div className="text-sm text-secondary">
                        ₹{item.revenue.toLocaleString()} revenue
                      </div>
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full"
                        style={{
                          width: `${(item.revenue / revenueByCourtArray[0].revenue) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary text-center py-8">
                No court revenue data yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Revenue by User */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Top Customers by Revenue
            </CardTitle>
            <CardDescription>
              Customers with highest booking value
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topUsers.length > 0 ? (
              <div className="space-y-4">
                {topUsers.map((user, index) => (
                  <div key={user.userId} className="flex items-center gap-3">
                    <Badge
                      className={
                        index === 0
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700"
                      }
                    >
                      #{index + 1}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-medium text-charcoal-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-secondary">
                        {user.bookings} bookings • ₹{user.revenue.toLocaleString()}
                      </div>
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(user.revenue / topUsers[0].revenue) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary text-center py-8">
                No customer revenue data yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
