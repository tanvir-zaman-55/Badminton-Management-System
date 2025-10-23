import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Calendar,
  Clock,
  User,
  Building2,
  IndianRupee,
  CheckCircle,
  XCircle,
  Filter,
} from "lucide-react";

interface AdminAllBookingsProps {
  userId: Id<"users">;
}

export function AdminAllBookings({ userId }: AdminAllBookingsProps) {
  const allBookings = useQuery(api.bookings.listAll, { userId }) ?? [];

  // Filter bookings
  const confirmedBookings = allBookings.filter((b) => b.status === "confirmed");
  const cancelledBookings = allBookings.filter((b) => b.status === "cancelled");
  const upcomingBookings = confirmedBookings.filter(
    (b) => new Date(b.bookingDate) >= new Date(new Date().setHours(0, 0, 0, 0))
  );
  const pastBookings = confirmedBookings.filter(
    (b) => new Date(b.bookingDate) < new Date(new Date().setHours(0, 0, 0, 0))
  );

  const renderBookingCard = (booking: any) => (
    <div
      key={booking._id}
      className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h4 className="font-semibold text-charcoal-900">{booking.courtName}</h4>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-3.5 h-3.5" />
            <span>{booking.userName}</span>
          </div>
        </div>

        <Badge
          className={
            booking.status === "confirmed"
              ? "bg-emerald-100 text-emerald-700 border-emerald-300"
              : "bg-red-100 text-red-700 border-red-300"
          }
          variant="outline"
        >
          {booking.status === "confirmed" ? (
            <CheckCircle className="w-3 h-3 mr-1" />
          ) : (
            <XCircle className="w-3 h-3 mr-1" />
          )}
          {booking.status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-sm bg-blue-50 p-2 rounded">
          <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="text-charcoal-900 font-medium">
            {format(new Date(booking.bookingDate), "MMM d, yyyy")}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm bg-emerald-50 p-2 rounded">
          <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="text-charcoal-900 font-medium">
            {booking.startTime}:00 ({booking.duration || 60}m)
          </span>
        </div>
      </div>

      {booking.price && (
        <div className="mt-3 flex items-center gap-2 text-sm bg-teal-50 p-2 rounded">
          <IndianRupee className="w-4 h-4 text-teal-600" />
          <span className="font-semibold text-charcoal-900">₹{booking.price}</span>
          <span className="text-gray-600">revenue</span>
        </div>
      )}
    </div>
  );

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          <div>
            <CardTitle className="text-2xl">All Bookings</CardTitle>
            <CardDescription className="text-white/90">
              View and manage all court bookings
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">
              All ({allBookings.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastBookings.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({cancelledBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {allBookings.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No bookings yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Bookings will appear here once users start booking courts
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2">
                {allBookings.map(renderBookingCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-3">
            {upcomingBookings.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No upcoming bookings</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2">
                {upcomingBookings.map(renderBookingCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-3">
            {pastBookings.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-12 text-center">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No past bookings</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2">
                {pastBookings.map(renderBookingCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-3">
            {cancelledBookings.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-12 text-center">
                <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No cancelled bookings</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2">
                {cancelledBookings.map(renderBookingCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
