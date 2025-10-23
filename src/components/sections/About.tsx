import { motion } from "framer-motion";
import { Check, Trophy, Users, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "../ui/card";

const achievements = [
  "Professional-grade wooden courts",
  "Certified coaching staff",
  "State-of-the-art facilities",
  "Tournament hosting venue",
];

const stats = [
  { icon: MapPin, value: "8+", label: "Premium Courts" },
  { icon: Users, value: "500+", label: "Active Members" },
  { icon: Clock, value: "15hrs", label: "Daily Hours" },
];

export function About() {
  return (
    <section className="py-32 bg-gradient-to-b from-white to-emerald-50/30">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Image/Visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-emerald-400/20 via-blue-400/10 to-teal-400/20 relative overflow-hidden shadow-2xl border border-emerald-200">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4 p-12">
                  <motion.div
                    animate={{
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-emerald-600 to-blue-600 flex items-center justify-center shadow-lg"
                  >
                    <Trophy className="w-16 h-16 text-white" />
                  </motion.div>
                  <p className="text-2xl font-bold text-charcoal-900">
                    Excellence
                    <br />
                    <span className="text-emerald-600">in Every Game</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Floating shuttlecock decoration */}
            <motion.div
              animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-6 -right-6 w-24 h-24 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg rotate-12 flex items-center justify-center"
            >
              <span className="text-4xl">🏸</span>
            </motion.div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-charcoal-900 leading-tight">
                About{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  Our Arena
                </span>
              </h2>
              <p className="text-lg text-secondary leading-relaxed">
                We're passionate about badminton and dedicated to providing the best
                playing experience. With world-class facilities and a vibrant community,
                we've become the premier destination for badminton enthusiasts of all levels.
              </p>
            </div>

            {/* Achievements */}
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-base text-charcoal-800 font-medium">
                    {achievement}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="text-center hover:shadow-xl transition-shadow border-emerald-200">
                    <CardContent className="p-6 space-y-2">
                      <stat.icon className="w-8 h-8 mx-auto text-emerald-600" />
                      <p className="text-2xl font-bold text-charcoal-900">
                        {stat.value}
                      </p>
                      <p className="text-xs text-secondary font-medium">
                        {stat.label}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
