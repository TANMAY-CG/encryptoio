import React from "react";
import { useUser, useAuth, useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminPage.module.css";

type PendingUser = { _id: string; username: string; email?: string };

export function AdminPage() {
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [pending, setPending] = React.useState<PendingUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [accessDenied, setAccessDenied] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isSignedIn) {
      navigate("/login");
      return;
    }

    const fetchPending = async () => {
      setLoading(true);
      setError(null);
      setAccessDenied(false);
      try {
        const token = await getToken();
        const res = await fetch("http://localhost:3000/admin/pending", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          navigate("/login");
          return;
        }
        if (res.status === 403) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }
        if (!res.ok) {
          setError("Failed to load pending users");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setPending(Array.isArray(data) ? data : []);
      } catch {
        setError("Failed to load pending users");
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, [isSignedIn, getToken, navigate]);

  const handleApprove = async (id: string) => {
    const token = await getToken();
    if (!token) return;
    setActionLoading(id);
    try {
      const res = await fetch(`http://localhost:3000/admin/approve/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setPending((prev) => prev.filter((u) => u._id !== id));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const token = await getToken();
    if (!token) return;
    setActionLoading(id);
    try {
      const res = await fetch(`http://localhost:3000/admin/reject/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setPending((prev) => prev.filter((u) => u._id !== id));
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    signOut();
    navigate("/");
  };

  if (!isSignedIn || loading) {
    return (
      <div className={styles.loadingWrapper}>
        <p>Loading...</p>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className={styles.accessDeniedWrapper}>
        <h1 className={styles.accessDeniedTitle}>Access Denied</h1>
        <p className={styles.accessDeniedText}>You do not have permission to view this page.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorWrapper}>
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.brand}>ENCRYPTO.io</div>
        <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
          Logout
        </button>
      </header>

      <div className={styles.main}>
        <h1 className={styles.title}>Hey Admin! How you doin&apos; today?</h1>

        <div className={styles.card}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.theadRow}>
                <th className={styles.thLeft}>Name</th>
                <th className={styles.thRight}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pending.length === 0 ? (
                <tr>
                  <td colSpan={2} className={styles.emptyCell}>
                    No pending users.
                  </td>
                </tr>
              ) : (
                pending.map((user) => (
                  <tr key={user._id} className={styles.bodyRow}>
                    <td className={styles.tdName}>{user.username}</td>
                    <td className={styles.tdAction}>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          onClick={() => handleReject(user._id)}
                          disabled={actionLoading === user._id}
                          className={styles.btnDisprove}
                        >
                          Disprove
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(user._id)}
                          disabled={actionLoading === user._id}
                          className={styles.btnApprove}
                        >
                          Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
