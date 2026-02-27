import React from "react";
import { useUser, useSignIn, useAuth, useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { ADMIN_EMAIL } from "../../constants/roles";
import styles from "./LoginPage.module.css";

export function LoginPage() {
  const { isSignedIn, user } = useUser();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [approvalMessage, setApprovalMessage] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const hasCheckedApproval = React.useRef(false);

  React.useEffect(() => {
    if (!isSignedIn || hasCheckedApproval.current) return;

    const checkApproval = async () => {
      try {
        const token = await getToken();
        const res = await fetch("http://localhost:3000/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        hasCheckedApproval.current = true;
        if (data.status === "approved") {
          const userEmail = user?.primaryEmailAddress?.emailAddress;
          if (userEmail === ADMIN_EMAIL) {
            navigate("/admin");
          } else {
            navigate("/app");
          }
        } else if (data.status === "pending") {
          setApprovalMessage("Awaiting admin approval");
        } else {
          setError("Unable to determine approval status");
        }
      } catch {
        setError("Failed to verify approval status");
      }
    };

    checkApproval();
  }, [isSignedIn, getToken, navigate, user]);

  React.useEffect(() => {
    setEmail("");
    setPassword("");
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setApprovalMessage(null);

    if (!isLoaded || !signIn) return;

    try {
      setIsSubmitting(true);

      if (isSignedIn) {
        await signOut();
      }

      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive?.({ session: result.createdSessionId });

        const token = await getToken();

        const res = await fetch("http://localhost:3000/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to verify approval status");
        }

        const data = await res.json();

        if (data.status === "approved") {
          const userEmail = user?.primaryEmailAddress?.emailAddress;
          if (userEmail === ADMIN_EMAIL) {
            navigate("/admin");
          } else {
            navigate("/app");
          }
        } else if (data.status === "pending") {
          setApprovalMessage("Awaiting admin approval");
        } else {
          setError("Unable to determine approval status");
        }
      } else {
        setError("Login not completed");
      }
    } catch (err: unknown) {
      const clerkError = (err as { errors?: Array<{ message?: string }> })?.errors?.[0]?.message;
      setError(clerkError || (err instanceof Error ? err.message : "Login failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isLoaded || !signIn) return;

    if (isSignedIn) {
      await signOut();
    }

    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/login",
        redirectUrlComplete: "/login",
      });
    } catch (err: unknown) {
      const clerkError = (err as { errors?: Array<{ message?: string }> })?.errors?.[0]?.message;
      setError(clerkError || (err instanceof Error ? err.message : "Google sign-in failed"));
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Log in to access your encrypted workspace.</p>

        <form
          key="login-form"
          className={styles.form}
          onSubmit={handleEmailLogin}
          autoComplete="off"
        >
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            autoComplete="username"
          />
          <div className={styles.passwordWrap}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.passwordInput}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className={styles.togglePassword}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <button type="button" onClick={handleGoogleLogin} className={styles.googleBtn}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.72 1.22 9.22 3.6l6.86-6.86C35.78 2.48 30.3 0 24 0 14.82 0 6.9 5.48 2.96 13.44l7.98 6.2C12.88 13.06 17.96 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.5 24.5c0-1.7-.14-3.34-.4-4.92H24v9.3h12.66c-.54 2.92-2.2 5.4-4.66 7.08l7.24 5.64C43.9 37.1 46.5 31.36 46.5 24.5z" />
            <path fill="#FBBC05" d="M10.94 28.64a14.5 14.5 0 010-9.28l-7.98-6.2A23.94 23.94 0 000 24c0 3.9.94 7.6 2.96 10.84l7.98-6.2z" />
            <path fill="#34A853" d="M24 48c6.3 0 11.78-2.08 15.7-5.66l-7.24-5.64c-2 1.34-4.56 2.14-8.46 2.14-6.04 0-11.12-3.56-13.06-8.64l-7.98 6.2C6.9 42.52 14.82 48 24 48z" />
          </svg>
          Continue with Google
        </button>

        {error && <div className={styles.error}>{error}</div>}
        {approvalMessage && <div className={styles.approvalMessage}>{approvalMessage}</div>}

        <div className={styles.footer}>
          Don&apos;t have an account?{" "}
          <span className={styles.footerLink} onClick={() => navigate("/signup")}>
            Sign up
          </span>
        </div>
      </div>
    </div>
  );
}
