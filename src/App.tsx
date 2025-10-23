import { useState, useEffect } from "react";
import { Hero } from "./components/sections/Hero";
import { About } from "./components/sections/About";
import { Features } from "./components/sections/Features";
import { MembershipShowcase } from "./components/sections/MembershipShowcase";
import { Contact } from "./components/sections/Contact";
import { Footer } from "./components/sections/Footer";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { AdminDashboard } from "./pages/AdminDashboard";
import { UserDashboard } from "./pages/UserDashboard";
import { TrainerDashboard } from "./pages/TrainerDashboard";
import { VerifyEmail } from "./pages/VerifyEmail";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { VerificationBanner } from "./components/auth/VerificationBanner";
import { Toaster } from "sonner";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

type AuthView = "signin" | "verify-email" | "forgot-password" | "reset-password";

export default function App() {
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [authView, setAuthView] = useState<AuthView>("signin");
  const [resetEmail, setResetEmail] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const savedUserId = localStorage.getItem("userId");
    if (savedUserId) {
      const isValidConvexId = savedUserId.startsWith('j') && savedUserId.length > 20;
      if (isValidConvexId) {
        setUserId(savedUserId as Id<"users">);
      } else {
        localStorage.removeItem("userId");
      }
    }
  }, []);

  const currentUser = useQuery(
    api.simpleAuth.getUser,
    userId ? { userId } : "skip"
  );

  useEffect(() => {
    if (userId && currentUser === null) {
      setUserId(null);
      localStorage.removeItem("userId");
    }
  }, [userId, currentUser]);

  const handleSignIn = (newUserId: Id<"users">) => {
    setUserId(newUserId);
    localStorage.setItem("userId", newUserId);
    setShowAuthModal(false);
  };

  const handleSignOut = () => {
    setUserId(null);
    localStorage.removeItem("userId");
    setAuthView("signin");
  };

  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.role === "admin";
  const isTrainer = currentUser?.role === "trainer";
  const needsVerification = isAuthenticated && !currentUser?.emailVerified;

  if (authView === "verify-email" && userId && currentUser) {
    return (
      <>
        <VerifyEmail
          userId={userId}
          email={currentUser.email}
          onVerified={() => setAuthView("signin")}
        />
        <Toaster position="top-center" />
      </>
    );
  }

  if (authView === "forgot-password") {
    return (
      <>
        <ForgotPassword
          onCodeSent={(email) => {
            setResetEmail(email);
            setAuthView("reset-password");
          }}
          onBack={() => setAuthView("signin")}
        />
        <Toaster position="top-center" />
      </>
    );
  }

  if (authView === "reset-password") {
    return (
      <>
        <ResetPassword
          email={resetEmail}
          onSuccess={() => setAuthView("signin")}
          onBack={() => setAuthView("forgot-password")}
        />
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <div className="min-h-screen">
      {needsVerification && (
        <VerificationBanner
          userId={userId!}
          onVerifyClick={() => setAuthView("verify-email")}
        />
      )}

      <header className="fixed top-4 right-4 z-50 animate-fade-in">
        {isAuthenticated ? (
          <SignOutButton onSignOut={handleSignOut} userName={currentUser?.name} />
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            Sign In
          </button>
        )}
      </header>

      {isAuthenticated && userId ? (
        <>
          {isAdmin ? (
            <AdminDashboard userId={userId} />
          ) : isTrainer ? (
            <TrainerDashboard userName={currentUser?.name || "Trainer"} userId={userId} />
          ) : (
            <UserDashboard userName={currentUser?.name || "User"} userId={userId} />
          )}
        </>
      ) : (
        <>
          <main>
            <Hero onGetStarted={() => setShowAuthModal(true)} />
            <About />
            <Features />
            <MembershipShowcase onGetStarted={() => setShowAuthModal(true)} />
            <Contact />
          </main>
          <Footer />
          {showAuthModal && (
            <div
              className="fixed inset-0 bg-charcoal-900/50 backdrop-blur-sm z-40 flex items-center justify-center p-6 animate-fade-in"
              onClick={() => setShowAuthModal(false)}
            >
              <div
                className="max-w-md w-full animate-scale-in relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors flex items-center justify-center text-gray-600 hover:text-gray-900 z-10"
                  aria-label="Close modal"
                >
                  ✕
                </button>
                <SignInForm
                  onSignIn={handleSignIn}
                  onForgotPassword={() => {
                    setShowAuthModal(false);
                    setAuthView("forgot-password");
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(139, 92, 246, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          },
        }}
      />
    </div>
  );
}
