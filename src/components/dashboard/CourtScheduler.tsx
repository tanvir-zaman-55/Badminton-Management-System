import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Clock, IndianRupee, Percent, Trophy, CalendarIcon } from "lucide-react";

interface CourtSchedulerProps {
  userId: Id<"users">;
}

const durations = [
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "1.5 hours", value: 90 },
  { label: "2 hours", value: 120 },
];

const purposes = ["Practice", "Match", "Training", "Tournament", "Casual Play"];

const getCourtTimeSlots = (court: any) => {
  const start = court.openHours?.start ?? 6;
  const end = court.openHours?.end ?? 22;
  return Array.from({ length: end - start }, (_, i) => start + i);
};

export function CourtScheduler({ userId }: CourtSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<Id<"courts"> | null>(null);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [duration, setDuration] = useState<number>(60);
  const [purpose, setPurpose] = useState<string>("Practice");
  const [notes, setNotes] = useState<string>("");
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurringPattern, setRecurringPattern] = useState<"weekly" | "monthly">("weekly");
  const [recurringEndDate, setRecurringEndDate] = useState<string>("");

  const formattedDate = selectedDate;

  const courts = useQuery(api.courts.list) ?? [];
  const bookings = useQuery(api.bookings.getBookingsForDate, { bookingDate: formattedDate }) ?? [];
  const membership = useQuery(api.memberships.getUserMembership, { userId });
  const pricing = useQuery(
    api.pricing.calculatePrice,
    selectedCourt && selectedTime && selectedDate
      ? {
          courtId: selectedCourt,
          date: formattedDate,
          startTime: selectedTime,
          duration,
        }
      : "skip"
  );

  const createBooking = useMutation(api.bookings.create);
  const createRecurringBooking = useMutation(api.bookings.createRecurring);

  const selectedCourtData = courts.find((c) => c._id === selectedCourt);

  const handleSlotClick = (courtId: Id<"courts">, startTime: number) => {
    if (!selectedDate) {
      toast.error("Please select a date first.");
      return;
    }
    setSelectedCourt(courtId);
    setSelectedTime(startTime);
    setShowBookingDialog(true);
  };

  const handleBooking = async () => {
    if (!selectedCourt || selectedTime === null) {
      toast.error("Please select a court and time slot.");
      return;
    }

    if (isRecurring && !recurringEndDate) {
      toast.error("Please select an end date for recurring booking.");
      return;
    }

    try {
      if (isRecurring && recurringEndDate) {
        const result = await createRecurringBooking({
          userId,
          courtId: selectedCourt,
          bookingDate: formattedDate,
          startTime: selectedTime,
          duration,
          purpose,
          notes: notes || undefined,
          recurringPattern,
          recurringEndDate: recurringEndDate,
        });
        toast.success(
          `Created ${result.bookingsCreated} recurring bookings out of ${result.totalAttempted} attempts!`
        );
      } else {
        await createBooking({
          userId,
          courtId: selectedCourt,
          bookingDate: formattedDate,
          startTime: selectedTime,
          duration,
          purpose,
          notes: notes || undefined,
        });
        toast.success(`Court booked successfully for ${selectedTime}:00!`);
      }

      setShowBookingDialog(false);
      resetForm();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const resetForm = () => {
    setSelectedCourt(null);
    setSelectedTime(null);
    setDuration(60);
    setPurpose("Practice");
    setNotes("");
    setIsRecurring(false);
    setRecurringPattern("weekly");
    setRecurringEndDate("");
  };

  const isSlotBooked = (courtId: Id<"courts">, startTime: number) => {
    return bookings.some(
      (b) =>
        b.courtId === courtId &&
        b.startTime === startTime &&
        b.bookingDate === formattedDate
    );
  };

  const isSlotInPast = (startTime: number) => {
    if (!selectedDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);

    // If selected date is today, check if time slot has passed
    if (selected.getTime() === today.getTime()) {
      const currentHour = new Date().getHours();
      return startTime <= currentHour;
    }

    return false;
  };

  const calculateDiscount = () => {
    if (!membership || !pricing) return null;

    const discountPercent = membership.tier?.benefits?.discountPercent || 0;
    if (discountPercent === 0) return null;

    const discountAmount = (pricing.totalPrice * discountPercent) / 100;
    const finalPrice = pricing.totalPrice - discountAmount;

    return { discountPercent, discountAmount, finalPrice };
  };

  const discount = calculateDiscount();

  return (
    <>
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Book a Court</CardTitle>
            {membership && membership.tier && (
              <Badge className="bg-white/20 text-white border-white/30">
                <Trophy className="w-4 h-4 mr-1" />
                {membership.tier.name} Member
              </Badge>
            )}
          </div>
          <CardDescription className="text-white/90">
            Select a date and available time slot to book your court
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Date Selection */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-charcoal-900">Select Date</h3>
                </div>
                <div className="p-4">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Legend */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-charcoal-900">Slot Status</h3>
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-emerald-500 rounded flex-shrink-0"></div>
                    <span className="text-xs text-gray-600">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-500 rounded flex-shrink-0"></div>
                    <span className="text-xs text-gray-600">Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-300 rounded flex-shrink-0"></div>
                    <span className="text-xs text-gray-600">Past Time</span>
                  </div>
                </div>
              </div>

              {/* Selected Date Info */}
              {selectedDate && (
                <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-lg p-4 border border-emerald-200">
                  <div className="flex items-center gap-2 text-emerald-700 mb-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span className="text-xs font-semibold">Selected Date</span>
                  </div>
                  <p className="text-sm font-bold text-charcoal-900">
                    {format(new Date(selectedDate), "EEEE, MMM d, yyyy")}
                  </p>
                </div>
              )}
            </div>

            {/* Courts Grid */}
            <div className="lg:col-span-3 space-y-4">
            {courts.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">No courts available</p>
                <p className="text-sm text-gray-500 mt-1">Please contact administration</p>
              </div>
            ) : (
              courts.map((court) => {
                const courtTimeSlots = getCourtTimeSlots(court);

                return (
                  <div
                    key={court._id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-charcoal-900 mb-1">{court.name}</h3>
                          <p className="text-sm text-gray-600">
                            {court.openHours
                              ? `Open: ${court.openHours.start}:00 - ${court.openHours.end}:00`
                              : "Open: 6:00 - 22:00 (default)"}
                          </p>
                          {(court.hourlyRate || court.dailyRate || court.weeklyRate || court.monthlyRate) && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {court.hourlyRate && (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                                  ₹{court.hourlyRate}/hr
                                </Badge>
                              )}
                              {court.dailyRate && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                                  ₹{court.dailyRate}/day
                                </Badge>
                              )}
                              {court.weeklyRate && (
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                                  ₹{court.weeklyRate}/week
                                </Badge>
                              )}
                              {court.monthlyRate && (
                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                                  ₹{court.monthlyRate}/month
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        {court.amenities && court.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1 ml-4">
                            {court.amenities.slice(0, 3).map((amenity, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-white">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
                        {courtTimeSlots.map((hour) => {
                          const booked = isSlotBooked(court._id, hour);
                          const inPast = isSlotInPast(hour);
                          const isDisabled = booked || inPast;

                          return (
                            <button
                              key={hour}
                              onClick={() => handleSlotClick(court._id, hour)}
                              disabled={isDisabled}
                              className={`px-2 py-2 text-xs font-semibold rounded-md transition-all duration-150 ${
                                booked
                                  ? "bg-red-500 text-white cursor-not-allowed"
                                  : inPast
                                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                  : "bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-md active:scale-95"
                              }`}
                            >
                              {hour}:00
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl">Complete Your Booking</DialogTitle>
            <DialogDescription className="text-base">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-charcoal-700">{selectedCourtData?.name}</span>
                <span className="text-sm">
                  {selectedDate && format(new Date(selectedDate), "EEEE, MMMM d, yyyy")} at {selectedTime}:00
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Booking Details Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wide">
                Booking Details
              </h3>

              {/* Duration Selection */}
              <div className="space-y-2">
                <Label htmlFor="duration" className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  Duration
                </Label>
                <Select value={duration.toString()} onValueChange={(val) => setDuration(Number(val))}>
                  <SelectTrigger id="duration" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {durations.map((d) => (
                      <SelectItem key={d.value} value={d.value.toString()}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Purpose Selection */}
              <div className="space-y-2">
                <Label htmlFor="purpose" className="flex items-center gap-2 text-sm">
                  <Trophy className="w-4 h-4 text-blue-600" />
                  Purpose
                </Label>
                <Select value={purpose} onValueChange={setPurpose}>
                  <SelectTrigger id="purpose" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {purposes.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm">
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requirements or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Recurring Booking */}
              <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="recurring" className="text-sm font-medium cursor-pointer">
                    Make this a recurring booking
                  </Label>
                </div>

                {isRecurring && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="pattern" className="text-xs">
                        Repeat Pattern
                      </Label>
                      <Select value={recurringPattern} onValueChange={(v) => setRecurringPattern(v as any)}>
                        <SelectTrigger id="pattern" className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="text-xs">
                        End Date
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={recurringEndDate}
                        onChange={(e) => setRecurringEndDate(e.target.value)}
                        min={selectedDate ? new Date(new Date(selectedDate).getTime() + 86400000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                        className="h-10"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wide">
                Pricing Summary
              </h3>

              {!pricing ? (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </div>
                  <p className="text-sm text-secondary mt-2">Calculating price...</p>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-emerald-50 to-blue-50 p-4 rounded-lg border border-emerald-200 space-y-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary">Rate per hour</span>
                    <span className="font-semibold flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" />
                      {pricing.pricePerHour}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary">Duration</span>
                    <span className="font-semibold">{duration} minutes</span>
                  </div>
                  {discount && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-secondary">Subtotal</span>
                        <span className="font-semibold flex items-center gap-1">
                          <IndianRupee className="w-4 h-4" />
                          {pricing.totalPrice}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-emerald-700 bg-emerald-50 -mx-2 px-2 py-1.5 rounded">
                        <span className="flex items-center gap-1">
                          <Percent className="w-4 h-4" />
                          Member Discount ({discount.discountPercent}%)
                        </span>
                        <span className="font-semibold">-₹{discount.discountAmount.toFixed(0)}</span>
                      </div>
                    </>
                  )}
                  <div className="pt-2 border-t border-emerald-300 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-charcoal-900">Total Amount</span>
                      <span className="font-bold text-2xl text-emerald-700 flex items-center gap-1">
                        <IndianRupee className="w-6 h-6" />
                        {discount ? discount.finalPrice.toFixed(0) : pricing.totalPrice}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowBookingDialog(false);
                resetForm();
              }}
              className="flex-1 sm:flex-initial"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBooking}
              disabled={!pricing}
              className="flex-1 sm:flex-initial bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 disabled:opacity-50"
            >
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
