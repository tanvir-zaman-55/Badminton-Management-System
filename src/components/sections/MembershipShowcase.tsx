import { motion } from "framer-motion";
import { Check, Zap, Crown, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const membershipTiers = [
  {
    name: "Day Pass",
    icon: Sparkles,
    price: 0,
    period: "per day",
    description: "Perfect for trying out our facilities",
    gradient: "from-gray-400 to-gray-600",
    borderColor: "border-gray-200",
    popular: false,
    benefits: [
      "Access to all courts",
      "Standard booking hours",
      "Pay-as-you-go pricing",
      "Guest booking available",
    ],
  },
  {
    name: "Regular",
    icon: Check,
    price: 2000,
    period: "per month",
    description: "Great for regular players",
    gradient: "from-emerald-400 to-teal-600",
    borderColor: "border-emerald-200",
    popular: false,
    benefits: [
      "10% discount on bookings",
      "14 days advance booking",
      "Team creation & management",
      "Priority customer support",
      "Free equipment storage",
    ],
  },
  {
    name: "Premium",
    icon: Zap,
    price: 4000,
    period: "per month",
    description: "For serious badminton enthusiasts",
    gradient: "from-blue-500 to-blue-700",
    borderColor: "border-blue-300",
    popular: true,
    benefits: [
      "20% discount on bookings",
      "30 days advance booking",
      "Priority court allocation",
      "1 free coaching session/month",
      "Guest pass (2 per month)",
      "Access to premium courts",
      "Tournament registration priority",
    ],
  },
  {
    name: "VIP",
    icon: Crown,
    price: 7000,
    period: "per month",
    description: "Ultimate badminton experience",
    gradient: "from-purple-500 to-pink-600",
    borderColor: "border-purple-300",
    popular: false,
    benefits: [
      "30% discount on bookings",
      "60 days advance booking",
      "Guaranteed court availability",
      "4 free coaching sessions/month",
      "Unlimited guest passes",
      "Exclusive VIP lounge access",
      "Free tournament entries",
      "Personal locker facility",
      "Complimentary refreshments",
    ],
  },
];

interface MembershipShowcaseProps {
  onGetStarted?: () => void;
}

export function MembershipShowcase({ onGetStarted }: MembershipShowcaseProps) {
  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      // Scroll to top to show sign in button
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <section className="py-32 bg-gradient-to-b from-white via-emerald-50/50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-charcoal-900 leading-tight">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Membership
            </span>
          </h2>
          <p className="text-lg text-secondary max-w-2xl mx-auto leading-relaxed">
            Select the perfect tier for your badminton journey. All memberships include
            access to our world-class facilities and community.
          </p>
        </motion.div>

        {/* Membership Tiers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {membershipTiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-gradient-to-r from-blue-600 to-teal-600 text-white border-0 shadow-lg">
                  Most Popular
                </Badge>
              )}

              <Card
                className={`h-full flex flex-col ${tier.borderColor} border-2 hover:shadow-2xl transition-all duration-300 ${
                  tier.popular ? "scale-105 shadow-xl" : "hover:-translate-y-2"
                }`}
              >
                <CardHeader className="space-y-4 pb-6">
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center shadow-lg`}
                  >
                    <tier.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Tier Name */}
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {tier.description}
                    </CardDescription>
                  </div>

                  {/* Price */}
                  <div className="pt-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-charcoal-900">
                        ₹{tier.price.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-secondary mt-1">{tier.period}</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pb-6">
                  {/* Benefits List */}
                  <div className="space-y-3">
                    {tier.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-charcoal-700 leading-relaxed">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="pt-6 mt-auto">
                  <Button
                    className={`w-full ${
                      tier.popular
                        ? "bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                        : "bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
                    }`}
                    size="lg"
                    onClick={handleGetStarted}
                  >
                    {tier.price === 0 ? "Get Started" : "Choose Plan"}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-secondary text-sm">
            All prices include GST. Cancel or upgrade anytime.{" "}
            <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium underline">
              View full comparison
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
