import { motion } from "framer-motion";
import { ArrowRight, Trophy, Users, Award } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface HeroProps {
  onGetStarted?: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  const scrollToMemberships = () => {
    const membershipSection = document.querySelector('section:has(h2)');
    if (membershipSection) {
      // Find the membership section by looking for the heading containing "Membership"
      const allSections = document.querySelectorAll('section');
      for (const section of allSections) {
        if (section.textContent?.includes('Choose Your Membership')) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }
    }
  };

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Animated gradient blobs - badminton theme colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-400/20 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-400/20 to-emerald-400/30 blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-32">
        <div className="text-center space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <Badge className="shadow-lg bg-emerald-100 text-emerald-700 border-emerald-200 text-base px-4 py-2">
              <span className="text-2xl mr-2">🏸</span>
              Premier Badminton Facility
            </Badge>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-charcoal-900 leading-tight"
          >
            Elevate Your
            <br />
            <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Badminton Game
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl lg:text-2xl text-secondary max-w-3xl mx-auto leading-relaxed"
          >
            Book premium courts, join competitive teams, train with professional coaches, and become part of our thriving badminton community.
          </motion.p>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap gap-3 justify-center"
          >
            <span className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-charcoal-700 border border-emerald-200 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-600" />
              8 Premium Courts
            </span>
            <span className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-charcoal-700 border border-blue-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Team Management
            </span>
            <span className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-charcoal-700 border border-teal-200 flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-600" />
              Pro Coaches
            </span>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
          >
            <Button
              size="xl"
              className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
              onClick={handleGetStarted}
            >
              Book a Court
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              onClick={scrollToMemberships}
            >
              View Memberships
            </Button>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto pt-12"
          >
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">8+</div>
              <div className="text-sm text-secondary mt-1">Premium Courts</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">500+</div>
              <div className="text-sm text-secondary mt-1">Active Members</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">20+</div>
              <div className="text-sm text-secondary mt-1">Pro Trainers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">15hrs</div>
              <div className="text-sm text-secondary mt-1">Daily Hours</div>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-6 h-10 border-2 border-emerald-400/30 rounded-full flex items-start justify-center p-2"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
