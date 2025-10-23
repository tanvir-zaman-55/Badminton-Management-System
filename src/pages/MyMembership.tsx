import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Crown,
  CheckCircle,
  Sparkles,
  Zap,
  Calendar,
  TrendingUp,
  Award,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

interface MyMembershipProps {
  userId: Id<"users">;
}

export function MyMembership({ userId }: MyMembershipProps) {
  const membership = useQuery(api.memberships.getUserMembership, { userId });
  const tiers = useQuery(api.memberships.listTiers);
  const purchaseMembership = useMutation(api.memberships.purchaseMembership);

  const handlePurchase = async (tierId: Id<"membershipTiers">) => {
    try {
      await purchaseMembership({ userId, tierId });
      toast.success("Membership purchased successfully!");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const getTierIcon = (tierName: string) => {
    if (tierName.includes("VIP")) return Crown;
    if (tierName.includes("Premium")) return Zap;
    if (tierName.includes("Regular")) return Award;
    return Sparkles;
  };

  const currentTier = membership?.tier;
  const isActive = membership?.status === "active";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            My Membership
          </h1>
          <p className="text-lg text-secondary mt-2">
            Manage your membership and explore upgrade options
          </p>
        </div>

        {/* Current Membership Status */}
        {currentTier && isActive ? (
          <Card className="mb-8 border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-blue-50 shadow-xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = getTierIcon(currentTier.name);
                    return <Icon className="w-10 h-10 text-emerald-600" />;
                  })()}
                  <div>
                    <CardTitle className="text-2xl">{currentTier.name} Member</CardTitle>
                    <CardDescription className="text-base">Active Membership</CardDescription>
                  </div>
                </div>
                <Badge className="bg-emerald-600 text-white border-0 text-base px-4 py-2">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Active
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-secondary text-sm">
                    <Calendar className="w-4 h-4" />
                    Expires on
                  </div>
                  <div className="text-xl font-bold text-charcoal-900">
                    {membership.expiryDate
                      ? format(new Date(membership.expiryDate), "MMMM d, yyyy")
                      : "No expiry"}
                  </div>
                </div>

                {currentTier.benefits?.discountPercent && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-secondary text-sm">
                      <TrendingUp className="w-4 h-4" />
                      Discount Rate
                    </div>
                    <div className="text-xl font-bold text-emerald-700">
                      {currentTier.benefits.discountPercent}% off all bookings
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-emerald-200">
                <h3 className="font-bold text-charcoal-900 mb-3">Your Benefits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentTier.benefits?.discountPercent && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{currentTier.benefits.discountPercent}% discount on all bookings</span>
                    </div>
                  )}
                  {currentTier.benefits?.priorityBooking && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Priority court booking</span>
                    </div>
                  )}
                  {currentTier.benefits?.advanceBookingDays && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{currentTier.benefits.advanceBookingDays} days advance booking</span>
                    </div>
                  )}
                  {currentTier.benefits?.freeCoachingSessions && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>
                        {currentTier.benefits.freeCoachingSessions} free coaching session(s)/month
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 border-2 border-gray-300 bg-gray-50">
            <CardContent className="p-8 text-center">
              <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-charcoal-900 mb-2">
                No Active Membership
              </h3>
              <p className="text-secondary">
                Purchase a membership below to unlock exclusive benefits and discounts!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Available Membership Tiers */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-charcoal-900">
            {isActive ? "Upgrade Your Membership" : "Choose Your Plan"}
          </h2>
          <p className="text-secondary mt-1">
            Select the perfect tier for your badminton journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers?.map((tier) => {
            const Icon = getTierIcon(tier.name);
            const isCurrentTier = currentTier?._id === tier._id;
            const isPremium = tier.name.includes("Premium") || tier.name.includes("VIP");

            return (
              <Card
                key={tier._id}
                className={`relative ${
                  isCurrentTier
                    ? "border-2 border-emerald-500 shadow-xl"
                    : isPremium
                    ? "border-2 border-blue-300 shadow-lg"
                    : "border border-gray-200"
                } hover:shadow-2xl transition-all duration-300`}
              >
                {isPremium && !isCurrentTier && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-teal-600 text-white border-0">
                    Popular
                  </Badge>
                )}

                {isCurrentTier && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white border-0">
                    Current Plan
                  </Badge>
                )}

                <CardHeader className="space-y-4">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
                      tier.name.includes("VIP")
                        ? "from-purple-500 to-pink-500"
                        : tier.name.includes("Premium")
                        ? "from-blue-500 to-teal-500"
                        : tier.name.includes("Regular")
                        ? "from-emerald-500 to-green-500"
                        : "from-gray-400 to-gray-500"
                    } flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <div>
                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {tier.description || "Standard membership benefits"}
                    </CardDescription>
                  </div>

                  <div>
                    <div className="text-3xl font-bold text-charcoal-900">
                      ₹{tier.price.toLocaleString()}
                    </div>
                    <p className="text-xs text-secondary">
                      {tier.durationDays === 1 ? "per day" : `per ${tier.durationDays} days`}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {tier.benefits?.discountPercent && tier.benefits.discountPercent > 0 && (
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{tier.benefits.discountPercent}% booking discount</span>
                    </div>
                  )}
                  {tier.benefits?.priorityBooking && (
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>Priority booking</span>
                    </div>
                  )}
                  {tier.benefits?.advanceBookingDays && (
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{tier.benefits.advanceBookingDays} days advance booking</span>
                    </div>
                  )}
                </CardContent>

                <CardFooter>
                  <Button
                    className={`w-full ${
                      isCurrentTier
                        ? "bg-gray-400 cursor-not-allowed"
                        : isPremium
                        ? "bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                        : "bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
                    }`}
                    onClick={() => handlePurchase(tier._id)}
                    disabled={isCurrentTier}
                  >
                    {isCurrentTier ? "Current Plan" : tier.price === 0 ? "Select" : "Purchase"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
