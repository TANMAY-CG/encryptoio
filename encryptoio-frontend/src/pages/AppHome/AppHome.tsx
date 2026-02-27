import { useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import styles from "./AppHome.module.css";

export function AppHome() {
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.brand}>ENCRYPTO.IO</div>
        <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
          Logout
        </button>
      </header>
      <main className={styles.main}>Welcome to App Home</main>
    </div>
  );
}
