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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { authClient, ROLE_ROUTES, toAuthUser } from "@/lib/auth";
import { useForm } from "@tanstack/react-form";
import {
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

// Form-specific role type (only allowed values for registration)
type FormRole = "STUDENT" | "TUTOR";

interface SignUpInput {
  email: string;
  password: string;
  name: string;
  role: FormRole;
  callbackURL?: string;
}

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain one uppercase letter")
      .regex(/[0-9]/, "Must contain one number")
      .regex(/[^A-Za-z0-9]/, "Must contain one special character"),
    confirmPassword: z.string(),
    role: z.union([z.literal("STUDENT"), z.literal("TUTOR")]),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/dashboard";
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "STUDENT" as const,
      acceptTerms: false,
    } as RegisterFormData,
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      try {
        const signUpData: SignUpInput = {
          email: value.email,
          password: value.password,
          name: value.name,
          role: value.role,
        };

        const { data, error } = await authClient.signUp.email(
          signUpData as unknown as Parameters<
            typeof authClient.signUp.email
          >[0],
        );

        if (error) {
          if (error.message?.includes("already exists")) {
            toast.error("An account with this email already exists");
          } else if (
            error.message?.toLowerCase().includes("email not verified") ||
            error.message?.toLowerCase().includes("verify")
          ) {
            toast.success("Account created! Please verify your email.");
            router.push(
              `/verify-email?email=${encodeURIComponent(value.email)}`,
            );
            return;
          } else if (error.message?.includes("invalid")) {
            toast.error("Invalid registration details");
          } else {
            toast.error(error.message || "Registration failed");
          }
          return;
        }

        if (!data) {
          toast.error("No data returned from server");
          return;
        }

        const user = toAuthUser(data.user);

        if (user.status === "BANNED") {
          toast.error(
            "Your account has been suspended. Please contact support.",
          );
          return;
        }

        // Check if email verification is required
        if (!user.emailVerified) {
          toast.success(
            "Account created! Please check your email to verify your account.",
          );
          router.push(`/verify-email?email=${encodeURIComponent(user.email)}`);
          return;
        }

        // If email is already verified (e.g., auto-verified by provider), proceed to dashboard
        toast.success(
          `Welcome, ${user.name || "User"}! Your account has been created.`,
        );

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

  const handleGoogleRegister = async () => {
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
      toast.error("Google registration failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Create an account
        </CardTitle>
        <CardDescription className="text-center">
          Join SkillBridge and start your learning journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          className="w-full h-11 font-medium"
          onClick={handleGoogleRegister}
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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
                if (!value) return undefined;
                const result = registerSchema.shape.name.safeParse(value);
                if (!result.success) {
                  return result.error.issues[0]?.message || "Invalid name";
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
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
            name="email"
            validators={{
              onChange: ({ value }) => {
                if (!value) return undefined;
                const result = registerSchema.shape.email.safeParse(value);
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
                const result = registerSchema.shape.password.safeParse(value);
                if (!result.success) {
                  return result.error.issues[0]?.message || "Invalid password";
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
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
                {field.state.meta.errors?.[0] ? (
                  <p className="text-sm text-destructive font-medium">
                    {field.state.meta.errors[0]}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters with uppercase, number, and
                    special character
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="confirmPassword"
            validators={{
              onChange: ({ value, fieldApi }) => {
                if (!value) return undefined;
                if (value !== fieldApi.form.getFieldValue("password")) {
                  return "Passwords do not match";
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={isLoading}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
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

          <form.Field
            name="role"
            validators={{
              onChange: ({ value }) => {
                if (!value) return "Please select a role";
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-3">
                <Label>I want to...</Label>
                <RadioGroup
                  value={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(value as FormRole)
                  }
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem
                      value="STUDENT"
                      id="student"
                      className="peer sr-only"
                      disabled={isLoading}
                    />
                    <Label
                      htmlFor="student"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                    >
                      <UserIcon className="mb-3 h-6 w-6" />
                      <div className="font-semibold">Learn</div>
                      <div className="text-xs text-muted-foreground">
                        Find a tutor
                      </div>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="TUTOR"
                      id="tutor"
                      className="peer sr-only"
                      disabled={isLoading}
                    />
                    <Label
                      htmlFor="tutor"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                    >
                      <GraduationCap className="mb-3 h-6 w-6" />
                      <div className="font-semibold">Teach</div>
                      <div className="text-xs text-muted-foreground">
                        Become a tutor
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
                {field.state.meta.errors?.[0] && (
                  <p className="text-sm text-destructive font-medium">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="acceptTerms"
            validators={{
              onChange: ({ value }) => {
                if (!value) return "You must accept the terms and conditions";
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="flex items-start space-x-2 pt-1">
                <Checkbox
                  id="terms"
                  checked={field.state.value}
                  onCheckedChange={(checked) =>
                    field.handleChange(checked === true)
                  }
                  disabled={isLoading}
                  className="mt-1"
                />
                <div className="space-y-1 leading-none">
                  <Label
                    htmlFor="terms"
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    I accept the{" "}
                    <Link
                      href="/terms"
                      className="text-primary hover:underline font-medium"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-primary hover:underline font-medium"
                    >
                      Privacy Policy
                    </Link>
                  </Label>
                  {field.state.meta.errors?.[0] && (
                    <p className="text-sm text-destructive font-medium">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
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
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 pt-4">
        <div className="text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary hover:underline font-semibold"
          >
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
