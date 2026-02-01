import { Navigate, Outlet } from "react-router-dom";

const isAuthenticated = () => {
  const token = localStorage.getItem("access_token");
  return !!token;
};

export default function PrivateRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  return <Outlet />;
}
