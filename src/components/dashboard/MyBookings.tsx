import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  IndianRupee,
  MapPin,
  Trophy,
  FileText,
  XCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface MyBookingsProps {
  userId: Id<"users">;
}

export function MyBookings({ userId }: MyBookingsProps) {
  const bookings = useQuery(api.bookings.listForUser, { userId }) ?? [];
  const cancelBooking = useMutation(api.bookings.cancel);
  const [cancellingId, setCancellingId] = useState<Id<"bookings"> | null>(null);

  const handleCancel = async (bookingId: Id<"bookings">) => {
    setCancellingId(bookingId);
    try {
      await cancelBooking({ userId, bookingId });
      toast.success("Booking cancelled successfully.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setCancellingId(null);
    }
  };

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const upcomingBookings = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.bookingDate) >= now
  );

  const pastBookings = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.bookingDate) < now
  );

  const cancelledBookings = bookings.filter((b) => b.status === "cancelled");

  const formatDuration = (minutes: number = 60) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = minutes / 60;
    return hours === 1 ? "1 hour" : `${hours} hours`;
  };

  const calculateEndTime = (startTime: number, duration: number = 60) => {
    const totalMinutes = startTime * 60 + duration;
    const endHour = Math.floor(totalMinutes / 60);
    const endMin = totalMinutes % 60;
    return `${endHour}:${endMin.toString().padStart(2, "0")}`;
  };

  const renderBookingCard = (booking: any, showCancel: boolean = false) => (
    <Card key={booking._id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <h3 className="font-semibold text-lg text-charcoal-900">{booking.courtName}</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-secondary">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(booking.bookingDate), "EEE, MMM d, yyyy")}
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

        {/* Compact Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center gap-2 text-sm bg-blue-50 p-2 rounded">
            <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-medium text-charcoal-900">
                {booking.startTime}:00 - {calculateEndTime(booking.startTime, booking.duration)}
              </div>
              <div className="text-xs text-secondary">{formatDuration(booking.duration)}</div>
            </div>
          </div>

          {booking.price && (
            <div className="flex items-center gap-2 text-sm bg-emerald-50 p-2 rounded">
              <IndianRupee className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-medium text-charcoal-900">₹{booking.price}</div>
                <div className="text-xs text-secondary">Total</div>
              </div>
            </div>
          )}
        </div>

        {/* Purpose Badge */}
        {booking.purpose && (
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-3.5 h-3.5 text-teal-600" />
            <Badge variant="outline" className="capitalize text-xs">
              {booking.purpose}
            </Badge>
          </div>
        )}

        {/* Notes - Collapsed */}
        {booking.notes && (
          <div className="mb-3">
            <div className="text-xs text-secondary mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Notes
            </div>
            <div className="text-sm text-charcoal-700 bg-gray-50 p-2 rounded border border-gray-200 line-clamp-2">
              {booking.notes}
            </div>
          </div>
        )}

        {/* Guest Info */}
        {booking.isGuest && booking.guestName && (
          <div className="bg-blue-50 p-2 rounded border border-blue-200 mb-3">
            <div className="text-xs text-blue-700 font-medium mb-0.5">Guest Booking</div>
            <div className="text-sm text-blue-900">
              {booking.guestName}
              {booking.guestPhone && ` • ${booking.guestPhone}`}
            </div>
          </div>
        )}

        {/* Cancel Button */}
        {showCancel && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleCancel(booking._id)}
            disabled={cancellingId === booking._id}
            className="w-full mt-2"
          >
            <XCircle className="w-4 h-4 mr-2" />
            {cancellingId === booking._id ? "Cancelling..." : "Cancel Booking"}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="bg-gradient-to-br from-white to-emerald-50/30 p-6 rounded-xl shadow-lg border border-emerald-100">
      <h2 className="text-2xl font-bold text-charcoal-900 mb-6">My Bookings</h2>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({cancelledBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingBookings.length > 0 ? (
            upcomingBookings.map((booking) => renderBookingCard(booking, true))
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-secondary text-lg">No upcoming bookings</p>
              <p className="text-secondary text-sm mt-1">
                Book a court to get started!
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastBookings.length > 0 ? (
            pastBookings.map((booking) => renderBookingCard(booking, false))
          ) : (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-secondary text-lg">No past bookings</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledBookings.length > 0 ? (
            cancelledBookings.map((booking) => renderBookingCard(booking, false))
          ) : (
            <div className="text-center py-12">
              <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-secondary text-lg">No cancelled bookings</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
