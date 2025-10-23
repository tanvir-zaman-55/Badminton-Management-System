import { useState, useEffect } from "react";
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
import { Progress } from "../ui/progress";
import {
  Trophy,
  Calendar,
  TrendingUp,
  Award,
  Percent,
  Clock,
  CheckCircle,
  Zap,
} from "lucide-react";

interface MembershipManagementProps {
  userId: Id<"users">;
}

export function MembershipManagement({ userId }: MembershipManagementProps) {
  const membership = useQuery(api.memberships.getUserMembership, { userId });
  const tiers = useQuery(api.memberships.listTiers) ?? [];
  const bookings = useQuery(api.bookings.listForUser, { userId }) ?? [];
  const purchaseMembership = useMutation(api.memberships.purchaseMembership);
  const initializeTiers = useMutation(api.memberships.initializeDefaultTiers);

  const [purchasing, setPurchasing] = useState(false);

  // Auto-initialize tiers on first load if none exist
  useEffect(() => {
    if (tiers.length === 0) {
      initializeTiers({ userId }).catch(() => {
        // Silently fail if already initialized by another user
      });
    }
  }, [tiers.length]);

  // Calculate analytics
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
  const thisMonthBookings = bookings.filter((b) => {
    const bookingDate = new Date(b.bookingDate);
    const now = new Date();
    return (
      bookingDate.getMonth() === now.getMonth() &&
      bookingDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const totalSpent = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + (b.price || 0), 0);

  const handlePurchase = async (tierId: Id<"membershipTiers">) => {
    setPurchasing(true);
    try {
      await purchaseMembership({ userId, tierId });
      toast.success("Membership purchased successfully!");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setPurchasing(false);
    }
  };

  const getDaysRemaining = () => {
    if (!membership?.expiryDate) return 0;
    const now = Date.now();
    const diff = membership.expiryDate - now;
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  const getProgressPercentage = () => {
    if (!membership?.startDate || !membership?.expiryDate) return 0;
    const now = Date.now();
    const total = membership.expiryDate - membership.startDate;
    const elapsed = now - membership.startDate;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  return (
    <div className="space-y-6">
      {/* Current Membership Status */}
      {membership ? (
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Trophy className="w-6 h-6" />
                  {membership.tier?.name} Member
                </CardTitle>
                <CardDescription className="text-white/90">
                  Active membership with exclusive benefits
                </CardDescription>
              </div>
              <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                {getDaysRemaining()} days left
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Membership Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Membership Progress</span>
                <span className="font-semibold">{Math.round(getProgressPercentage())}%</span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Started: {new Date(membership.startDate).toLocaleDateString()}</span>
                <span>Expires: {new Date(membership.expiryDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Benefits */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Your Benefits
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {membership.tier?.benefits?.discountPercent && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <Percent className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-900">
                        {membership.tier.benefits.discountPercent}% Discount
                      </p>
                      <p className="text-xs text-emerald-600">On all bookings</p>
                    </div>
                  </div>
                )}
                {membership.tier?.benefits?.priorityBooking && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Priority Booking</p>
                      <p className="text-xs text-blue-600">Book before others</p>
                    </div>
                  </div>
                )}
                {membership.tier?.benefits?.freeGuestPasses && (
                  <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <Trophy className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm font-semibold text-orange-900">
                        {membership.tier.benefits.freeGuestPasses} Guest Passes
                      </p>
                      <p className="text-xs text-orange-600">Per month</p>
                    </div>
                  </div>
                )}
                {membership.tier?.benefits?.courtAccessHours && (
                  <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-semibold text-purple-900">
                        {membership.tier.benefits.courtAccessHours}h Access
                      </p>
                      <p className="text-xs text-purple-600">Per month</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Membership</h3>
            <p className="text-gray-600 mb-4">
              Upgrade to a membership plan to unlock exclusive benefits and discounts
            </p>
          </CardContent>
        </Card>
      )}

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Bookings</span>
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-emerald-900">{totalBookings}</p>
            <p className="text-xs text-emerald-600 mt-1">
              {confirmedBookings} confirmed
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">This Month</span>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-900">{thisMonthBookings}</p>
            <p className="text-xs text-blue-600 mt-1">bookings made</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Spent</span>
              <Trophy className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-900">₹{totalSpent}</p>
            <p className="text-xs text-purple-600 mt-1">lifetime value</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Savings</span>
              <Percent className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-orange-900">
              ₹{membership?.tier?.benefits?.discountPercent ? Math.round(totalSpent * (membership.tier.benefits.discountPercent / 100)) : 0}
            </p>
            <p className="text-xs text-orange-600 mt-1">with discount</p>
          </CardContent>
        </Card>
      </div>

      {/* Available Membership Tiers */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Membership Plans</h2>

        {tiers.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-12 text-center">
              <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Membership Plans...</h3>
              <p className="text-gray-600">
                Please wait while we load available membership options
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier) => {
              const isActive = membership?.tierId === tier._id;
              return (
                <Card
                key={tier._id}
                className={`border-2 transition-all ${
                  isActive
                    ? "border-purple-500 shadow-lg"
                    : "border-gray-200 hover:border-purple-300 hover:shadow-md"
                }`}
              >
                <CardHeader className={isActive ? "bg-purple-50" : ""}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                    {isActive && (
                      <Badge className="bg-purple-600 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">₹{tier.price}</p>
                    <p className="text-sm text-gray-600">
                      for {tier.durationDays} days
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    {tier.benefits?.discountPercent && (
                      <div className="flex items-center gap-2 text-emerald-700">
                        <CheckCircle className="w-4 h-4" />
                        <span>{tier.benefits.discountPercent}% discount on bookings</span>
                      </div>
                    )}
                    {tier.benefits?.priorityBooking && (
                      <div className="flex items-center gap-2 text-blue-700">
                        <CheckCircle className="w-4 h-4" />
                        <span>Priority booking access</span>
                      </div>
                    )}
                    {tier.benefits?.freeGuestPasses && (
                      <div className="flex items-center gap-2 text-orange-700">
                        <CheckCircle className="w-4 h-4" />
                        <span>{tier.benefits.freeGuestPasses} guest passes/month</span>
                      </div>
                    )}
                    {tier.benefits?.courtAccessHours && (
                      <div className="flex items-center gap-2 text-purple-700">
                        <CheckCircle className="w-4 h-4" />
                        <span>{tier.benefits.courtAccessHours} hours court access/month</span>
                      </div>
                    )}
                  </div>

                  {!isActive && (
                    <Button
                      onClick={() => handlePurchase(tier._id)}
                      disabled={purchasing}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      {purchasing ? "Processing..." : "Purchase Plan"}
                    </Button>
                  )}
                </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
