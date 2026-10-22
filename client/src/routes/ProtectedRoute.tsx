import {
  Navigate,
} from "react-router-dom";

import type {
  ReactNode,
} from "react";

interface User {
  _id?: string;
  id?: string;

  fullName: string;
  email: string;

  role:
    | "patient"
    | "doctor"
    | "admin";
}

interface ProtectedRouteProps {
  children: ReactNode;

  allowedRoles?: (
    | "patient"
    | "doctor"
    | "admin"
  )[];
}

const ProtectedRoute = ({
  children,
  allowedRoles,
}: ProtectedRouteProps) => {
  const token =
    localStorage.getItem(
      "token"
    );

  const storedUser =
    localStorage.getItem(
      "user"
    );

  if (
    !token ||
    !storedUser
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  try {
    const user: User =
      JSON.parse(
        storedUser
      );

    if (
      allowedRoles &&
      !allowedRoles.includes(
        user.role
      )
    ) {
      if (
        user.role ===
        "admin"
      ) {
        return (
          <Navigate
            to="/admin-dashboard"
            replace
          />
        );
      }

      if (
        user.role ===
        "doctor"
      ) {
        return (
          <Navigate
            to="/doctor-dashboard"
            replace
          />
        );
      }

      if (
        user.role ===
        "patient"
      ) {
        return (
          <Navigate
            to="/dashboard"
            replace
          />
        );
      }

      return (
        <Navigate
          to="/"
          replace
        />
      );
    }

    return <>{children}</>;
  } catch (error) {
    console.error(
      "PROTECTED ROUTE ERROR:",
      error
    );

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }
};

export default ProtectedRoute;