import React from "react";
import { useSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import styles from "./SignupPage.module.css";

export function SignupPage() {
  const { isLoaded, signUp } = useSignUp();
  const navigate = useNavigate();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [verificationPending, setVerificationPending] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [verifying, setVerifying] = React.useState(false);

  React.useEffect(() => {
    setFullName("");
    setEmail("");
    setUsername("");
    setPassword("");
  }, []);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError("Username is required");
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }

    if (!isLoaded || !signUp) return;

    try {
      setIsSubmitting(true);

      await signUp.create({
        emailAddress: email.trim(),
        password,
        firstName: fullName.trim() || undefined,
        unsafeMetadata: { username: trimmedUsername },
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setVerificationPending(true);
    } catch (err: unknown) {
      const clerkError = (err as { errors?: Array<{ message?: string }> })?.errors?.[0]?.message;
      setError(clerkError || (err instanceof Error ? err.message : "Sign up failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!signUp) return;

    setVerifying(true);
    setError(null);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        navigate("/login");
      }
    } catch (err: unknown) {
      const clerkError = (err as { errors?: Array<{ message?: string }> })?.errors?.[0]?.message;
      setError(clerkError || (err instanceof Error ? err.message : "Invalid verification code"));
    } finally {
      setVerifying(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!isLoaded || !signUp) return;
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/signup",
        redirectUrlComplete: "/login",
      });
    } catch (err: unknown) {
      const clerkError = (err as { errors?: Array<{ message?: string }> })?.errors?.[0]?.message;
      setError(clerkError || (err instanceof Error ? err.message : "Google sign-up failed"));
    }
  };

  if (verificationPending) {
    return (
      <div className={styles.verificationWrapper}>
        <div className={styles.verificationInner}>
          <h2 className={styles.title}>Verify your email</h2>
          <p className={styles.verificationText}>
            Enter the 6-digit code sent to your email address.
          </p>

          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter verification code"
            className={styles.input}
          />

          <button
            type="button"
            onClick={handleVerify}
            disabled={verifying}
            className={styles.verificationBtn}
          >
            {verifying ? "Verifying..." : "Verify"}
          </button>

          {error && <div className={styles.error}>{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>Sign up to get started with Encrypto.io</p>

        <form
          key="signup-form"
          className={styles.form}
          onSubmit={handleEmailSignup}
          autoComplete="off"
        >
          <input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={styles.input}
            autoComplete="name"
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            autoComplete="email"
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            autoComplete="new-password"
          />
          <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
            {isSubmitting ? "Signing up..." : "Sign up"}
          </button>
        </form>

        <button type="button" onClick={handleGoogleSignup} className={styles.googleBtn}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.72 1.22 9.22 3.6l6.86-6.86C35.78 2.48 30.3 0 24 0 14.82 0 6.9 5.48 2.96 13.44l7.98 6.2C12.88 13.06 17.96 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.5 24.5c0-1.7-.14-3.34-.4-4.92H24v9.3h12.66c-.54 2.92-2.2 5.4-4.66 7.08l7.24 5.64C43.9 37.1 46.5 31.36 46.5 24.5z" />
            <path fill="#FBBC05" d="M10.94 28.64a14.5 14.5 0 010-9.28l-7.98-6.2A23.94 23.94 0 000 24c0 3.9.94 7.6 2.96 10.84l7.98-6.2z" />
            <path fill="#34A853" d="M24 48c6.3 0 11.78-2.08 15.7-5.66l-7.24-5.64c-2 1.34-4.56 2.14-8.46 2.14-6.04 0-11.12-3.56-13.06-8.64l-7.98 6.2C6.9 42.52 14.82 48 24 48z" />
          </svg>
          Continue with Google
        </button>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.footer}>
          Already have an account?{" "}
          <span className={styles.footerLink} onClick={() => navigate("/login")}>
            Log in
          </span>
        </div>
      </div>
    </div>
  );
}
