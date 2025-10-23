import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { LogIn, UserPlus, Loader2 } from "lucide-react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

interface SignInFormProps {
  onSignIn: (userId: Id<"users">) => void;
  onForgotPassword?: () => void;
}

export function SignInForm({ onSignIn, onForgotPassword }: SignInFormProps) {
  const signUp = useMutation(api.simpleAuth.signUp);
  const signIn = useMutation(api.simpleAuth.signIn);

  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      if (flow === "signUp") {
        const result = await signUp({ email, password });
        toast.success("Account created successfully!");
        onSignIn(result.userId as Id<"users">);
      } else {
        const result = await signIn({ email, password });
        toast.success("Welcome back!");
        onSignIn(result.userId as Id<"users">);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not complete request";
      toast.error(message);
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-2xl border-0 backdrop-blur-xl bg-white">
      <CardHeader className="space-y-2 text-center bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-t-lg pb-8">
        <div className="w-16 h-16 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg mb-2">
          {flow === "signIn" ? (
            <LogIn className="w-8 h-8 text-white" />
          ) : (
            <UserPlus className="w-8 h-8 text-white" />
          )}
        </div>
        <CardTitle className="text-3xl font-bold">
          {flow === "signIn" ? "Welcome Back" : "Create Account"}
        </CardTitle>
        <p className="text-white/90 text-sm">
          {flow === "signIn"
            ? "Sign in to continue to your dashboard"
            : "Join us to start booking courts"}
        </p>
      </CardHeader>

      <CardContent className="space-y-6 p-8">
        {/* Email/Password form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-charcoal-900"
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              required
              disabled={submitting}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-charcoal-900"
              >
                Password
              </label>
              {flow === "signIn" && onForgotPassword && (
                <button
                  type="button"
                  onClick={onForgotPassword}
                  disabled={submitting}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold transition-colors hover:underline disabled:opacity-50"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <Input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              required
              minLength={6}
              disabled={submitting}
              className="h-11"
            />
            {flow === "signUp" && (
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 h-12 text-base font-semibold shadow-lg"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span>
                  {flow === "signIn" ? "Signing in..." : "Creating account..."}
                </span>
              </>
            ) : (
              <>
                {flow === "signIn" ? (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    <span>Sign In</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    <span>Sign Up</span>
                  </>
                )}
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">
                {flow === "signIn" ? "New here?" : "Already a member?"}
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-2 border-emerald-200 hover:bg-emerald-50 text-emerald-700 h-11 font-semibold"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            disabled={submitting}
          >
            {flow === "signIn" ? "Create new account" : "Sign in instead"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
