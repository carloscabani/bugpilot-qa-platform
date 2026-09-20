import type { ReactNode } from "react";

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import DashboardLayout from "./layouts/DashboardLayout";

import ResourcePage from "./pages/ResourcePage";


function ProtectedRoute({
  children
}: {
  children: ReactNode;
}) {

  const token = sessionStorage.getItem("bugpilot_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;

}


export default function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/projects"
            element={<ResourcePage resource="projects" />}
          />

          <Route
            path="/bugs"
            element={<ResourcePage resource="bugs" />}
          />

          <Route
            path="/test-cases"
            element={<ResourcePage resource="test-cases" />}
          />

          <Route
            path="/test-runs"
            element={<ResourcePage resource="test-runs" />}
          />

        </Route>

        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />

      </Routes>

    </BrowserRouter>

  );

}