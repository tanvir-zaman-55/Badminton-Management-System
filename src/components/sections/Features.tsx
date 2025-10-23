import { motion } from "framer-motion";
import {
  CalendarCheck,
  Award,
  Users,
  Target,
  TrendingUp,
  Bell,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "../ui/card";

const features = [
  {
    icon: CalendarCheck,
    title: "Flexible Court Booking",
    description:
      "Book courts for 30 minutes to multiple hours with our advanced scheduling system. Real-time availability and instant confirmation.",
    gradient: "from-emerald-400 to-teal-600",
  },
  {
    icon: Award,
    title: "4-Tier Membership",
    description:
      "Choose from Day Pass, Regular, Premium, or VIP tiers. Enjoy exclusive discounts, priority booking, and special perks.",
    gradient: "from-blue-400 to-blue-600",
  },
  {
    icon: Users,
    title: "Team Management",
    description:
      "Create and manage your teams effortlessly. Organize practices, track members, and compete in leagues with your squad.",
    gradient: "from-teal-400 to-emerald-600",
  },
  {
    icon: Target,
    title: "Professional Coaching",
    description:
      "Train with certified coaches. Book private or group sessions, track your progress, and elevate your game to the next level.",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    icon: TrendingUp,
    title: "Smart Pricing",
    description:
      "Dynamic pricing based on peak hours and demand. Member discounts automatically applied. Transparent rates with no hidden fees.",
    gradient: "from-blue-500 to-teal-500",
  },
  {
    icon: Bell,
    title: "Priority Waitlist",
    description:
      "Join the waitlist when courts are full. Premium members get priority notifications when slots become available.",
    gradient: "from-teal-500 to-blue-500",
  },
];

export function Features() {
  return (
    <section className="py-32 bg-gradient-to-b from-emerald-50 via-blue-50/30 to-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4 mb-20"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-charcoal-900 leading-tight">
            Everything You Need{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              To Excel
            </span>
          </h2>
          <p className="text-lg text-secondary max-w-2xl mx-auto leading-relaxed">
            From flexible booking to professional coaching, our comprehensive platform
            makes managing your badminton journey simple and enjoyable.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
                <CardHeader className="space-y-6">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <CardTitle className="text-xl">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
