import React from "react";
import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { ADMIN_EMAIL } from "../constants/roles";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, user } = useUser();

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  const email = user?.primaryEmailAddress?.emailAddress;

  if (email !== ADMIN_EMAIL) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
