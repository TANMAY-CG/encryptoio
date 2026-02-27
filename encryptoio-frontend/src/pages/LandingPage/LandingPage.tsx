import { useUser } from "@clerk/clerk-react";
import { Navigate, useNavigate } from "react-router-dom";
import styles from "./LandingPage.module.css";

export function LandingPage() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  if (isSignedIn) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <h1 className={styles.title}>ENCRYPTO.io</h1>
        <p className={styles.subtitle}>
          Enter the world of "Truly" end-to-end encrypted file sharing & communication
        </p>
        <button type="button" className={styles.enterBtn} onClick={() => navigate("/login")}>
          Enter
        </button>
      </div>
    </div>
  );
}
