// app/(auth)/verify-email/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [isResending, setIsResending] = useState(false);

  const verifyToken = useCallback(
    async (verificationToken: string) => {
      try {
        const { error } = await authClient.verifyEmail({
          query: { token: verificationToken },
        });

        if (error) {
          toast.error(error.message || "Invalid or expired token");
          setStatus("error");
          return;
        }

        toast.success("Email verified successfully!");
        setStatus("success");

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/login?verified=true");
        }, 2000);
      } catch {
        toast.error("Failed to verify email");
        setStatus("error");
      }
    },
    [router],
  );

  // Verify token automatically if present
  useEffect(() => {
    if (token) {
      verifyToken(token);
    } else {
      setStatus("error");
    }
  }, [token, verifyToken]);

  const resendEmail = async () => {
    if (!email) {
      toast.error("No email address found");
      return;
    }

    setIsResending(true);
    try {
      const { error } = await authClient.sendVerificationEmail({
        email: decodeURIComponent(email),
      });

      if (error) {
        toast.error(error.message || "Failed to resend email");
        return;
      }

      toast.success("Verification email sent! Check your inbox.");
    } catch {
      toast.error("Failed to send email");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <h1 className="text-2xl font-bold">Verifying your email...</h1>
            <p className="text-muted-foreground">Please wait a moment</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <h1 className="text-2xl font-bold">Email Verified!</h1>
            <p className="text-muted-foreground">Redirecting you to login...</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 mx-auto text-red-500" />
            <h1 className="text-2xl font-bold">Verification Failed</h1>
            <p className="text-muted-foreground">
              {token
                ? "This link has expired or is invalid."
                : "No verification token found."}
            </p>

            {email && (
              <div className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground">
                  Need a new verification link?
                </p>
                <Button
                  onClick={resendEmail}
                  disabled={isResending}
                  className="w-full"
                >
                  {isResending ? "Sending..." : "Resend Verification Email"}
                </Button>
              </div>
            )}

            <div className="pt-4">
              <Link href="/login" className="text-primary hover:underline">
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
