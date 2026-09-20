import { NavLink, Outlet, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  FolderKanban,
  Bug,
  FlaskConical,
  PlayCircle,
  LogOut,
  ShieldCheck
} from "lucide-react";

import type { User } from "../types";

export default function DashboardLayout() {

  const navigate = useNavigate();

  const storedUser = sessionStorage.getItem("bugpilot_user");

  const user: User | null = storedUser
    ? JSON.parse(storedUser)
    : null;

  const navigation = [
    {
      name: "Overview",
      path: "/dashboard",
      icon: LayoutDashboard
    },
    {
      name: "Projects",
      path: "/projects",
      icon: FolderKanban
    },
    {
      name: "Bugs",
      path: "/bugs",
      icon: Bug
    },
    {
      name: "Test Cases",
      path: "/test-cases",
      icon: FlaskConical
    },
    {
      name: "Test Runs",
      path: "/test-runs",
      icon: PlayCircle
    }
  ];

  function logout() {

    sessionStorage.removeItem("bugpilot_token");

    sessionStorage.removeItem("bugpilot_user");

    navigate("/login");

  }

  return (

    <div className="app-layout">

      <aside className="sidebar">

        <div className="sidebar-brand">

          <div className="brand-icon">
            <Bug size={24} />
          </div>

          <div>
            <h1>BugPilot</h1>
            <span>QA MANAGEMENT</span>
          </div>

        </div>

        <div className="sidebar-section-title">
          WORKSPACE
        </div>

        <nav className="sidebar-nav">

          {navigation.map(item => {

            const Icon = item.icon;

            return (

              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >

                <Icon size={20} />

                <span>{item.name}</span>

              </NavLink>

            );

          })}

        </nav>

        <div className="sidebar-bottom">

          <div className="sidebar-user">

            <div className="user-avatar">

              {user?.name?.charAt(0).toUpperCase() ?? "U"}

            </div>

            <div className="user-details">

              <strong>{user?.name}</strong>

              <span>
                <ShieldCheck size={13} />
                {user?.role}
              </span>

            </div>

          </div>

          <button
            className="logout-button"
            onClick={logout}
          >

            <LogOut size={18} />

            Sign out

          </button>

        </div>

      </aside>

      <div className="app-content">

        <Outlet />

      </div>

    </div>

  );

}