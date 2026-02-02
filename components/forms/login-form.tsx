"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authClient, type AuthUser, ROLE_ROUTES } from "@/lib/auth";
import { useForm } from "@tanstack/react-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/dashboard";
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    } as LoginFormData,
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      try {
        const { data, error } = await authClient.signIn.email({
          email: value.email,
          password: value.password,
          rememberMe: value.rememberMe,
        });

        if (error) {
          // Email verification error
          if (
            error.message?.toLowerCase().includes("email not verified") ||
            error.message?.toLowerCase().includes("verify your email")
          ) {
            toast.error("Please verify your email address");
            router.push(
              `/verify-email?email=${encodeURIComponent(value.email)}`,
            );
            setIsLoading(false);
            return;
          }

          if (error.message?.includes("Invalid")) {
            toast.error("Invalid email or password");
          } else if (error.message?.includes("banned")) {
            toast.error(
              "Your account has been suspended. Please contact support.",
            );
          } else {
            toast.error(error.message || "Authentication failed");
          }
          return;
        }

        // Type assertion for custom fields
        const user = data.user as unknown as AuthUser;

        // Additional safety check
        if (!user.emailVerified) {
          toast.error("Please verify your email address");
          router.push(`/verify-email?email=${encodeURIComponent(value.email)}`);
          return;
        }

        if (user.status === "BANNED") {
          toast.error(
            "Your account has been suspended. Please contact support.",
          );
          return;
        }

        toast.success(`Welcome back, ${user.name || "User"}!`);

        const targetUrl =
          ROLE_ROUTES[user.role] || decodeURIComponent(returnUrl);
        router.push(targetUrl);
        router.refresh();
      } catch {
        toast.error("Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const callbackUrl = new URL(
        "/api/auth/callback/google",
        window.location.origin,
      );
      callbackUrl.searchParams.set("redirect", decodeURIComponent(returnUrl));

      await authClient.signIn.social({
        provider: "google",
        callbackURL: callbackUrl.toString(),
      });
    } catch {
      toast.error("Google login failed. Please check your configuration.");
      setGoogleLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Welcome back
        </CardTitle>
        <CardDescription className="text-center">
          Sign in to your SkillBridge account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Google Login */}
        <Button
          variant="outline"
          className="w-full h-11 font-medium"
          onClick={handleGoogleLogin}
          disabled={isLoading || googleLoading}
          type="button"
        >
          {googleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-3 text-muted-foreground font-medium">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Email Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                if (!value) return undefined;
                const result = loginSchema.shape.email.safeParse(value);
                if (!result.success) {
                  return result.error.issues[0]?.message || "Invalid email";
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isLoading}
                  className="h-11"
                />
                {field.state.meta.errors?.[0] && (
                  <p className="text-sm text-destructive font-medium">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => {
                if (!value) return undefined;
                const result = loginSchema.shape.password.safeParse(value);
                if (!result.success) {
                  return result.error.issues[0]?.message || "Invalid password";
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={isLoading}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {field.state.meta.errors?.[0] && (
                  <p className="text-sm text-destructive font-medium">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="rememberMe">
            {(field) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={field.state.value}
                  onCheckedChange={(checked) =>
                    field.handleChange(checked === true)
                  }
                  disabled={isLoading}
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me for 30 days
                </Label>
              </div>
            )}
          </form.Field>

          <Button
            type="submit"
            className="w-full h-11 font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 pt-4">
        <div className="text-sm text-muted-foreground text-center">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-primary hover:underline font-semibold"
          >
            Sign up for free
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
