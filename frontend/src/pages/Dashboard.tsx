import { useEffect, useState } from "react";

import {
  FolderKanban,
  Bug,
  AlertTriangle,
  FlaskConical,
  PlayCircle,
  CheckCircle,
  XCircle,
  Activity
} from "lucide-react";

import {
  getDashboardStats
} from "../services/dashboard.service";

import type {
  DashboardStats
} from "../services/dashboard.service";


export default function Dashboard() {

  const [stats, setStats] =
    useState<DashboardStats | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  useEffect(() => {

    let cancelled = false;

    async function loadDashboard() {

      try {

        const data = await getDashboardStats();

        if (!cancelled) {
          setStats(data);
        }

      } catch (error) {

        console.error(error);

        if (!cancelled) {
          setError("Unable to load dashboard statistics");
        }

      } finally {

        if (!cancelled) {
          setLoading(false);
        }

      }

    }

    loadDashboard();

    return () => {
      cancelled = true;
    };

  }, []);


  const cards = [

    {
      title: "Projects",
      value: stats?.totalProjects ?? 0,
      icon: FolderKanban
    },

    {
      title: "Total Bugs",
      value: stats?.totalBugs ?? 0,
      icon: Bug
    },

    {
      title: "Open Bugs",
      value: stats?.openBugs ?? 0,
      icon: Activity
    },

    {
      title: "Critical Bugs",
      value: stats?.criticalBugs ?? 0,
      icon: AlertTriangle
    },

    {
      title: "Test Cases",
      value: stats?.totalTestCases ?? 0,
      icon: FlaskConical
    },

    {
      title: "Test Runs",
      value: stats?.totalTestRuns ?? 0,
      icon: PlayCircle
    },

    {
      title: "Passed Tests",
      value: stats?.passedTests ?? 0,
      icon: CheckCircle
    },

    {
      title: "Failed Tests",
      value: stats?.failedTests ?? 0,
      icon: XCircle
    }

  ];


  return (

    <main className="page-container">

      <div className="page-header">

        <div>

          <h1>Overview</h1>

          <p>
            Monitor your projects, defects and test executions.
          </p>

        </div>

      </div>


      {loading && (
        <p>Loading dashboard...</p>
      )}


      {error && (
        <p className="error">{error}</p>
      )}


      {!loading && !error && (

        <div className="dashboard-grid">

          {cards.map(card => {

            const Icon = card.icon;

            return (

              <div
                className="dashboard-card"
                key={card.title}
              >

                <Icon size={26} />

                <h3>{card.title}</h3>

                <p className="stat-value">
                  {card.value}
                </p>

              </div>

            );

          })}

        </div>

      )}

    </main>

  );

}