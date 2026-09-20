import { useEffect, useState } from "react";

import {
  FolderKanban,
  Bug,
  FlaskConical,
  PlayCircle
} from "lucide-react";

import api from "../services/api";
import ResourceForm from "../components/ResourceForm";
import BugActions from "../components/BugActions"; 

type Resource =
  | "projects"
  | "bugs"
  | "test-cases"
  | "test-runs";


interface ResourcePageProps {
  resource: Resource;
}


interface ResourceItem {
  id: number;

  name?: string;
  title?: string;

  description?: string;

  status?: string;
  severity?: string;
  priority?: string;

  test_type?: string;

  environment?: string;

  created_at?: string;
  executed_at?: string;

  assigned_to?: number | null;
  assignee_name?: string | null;
}


const resourceConfig = {

  projects: {
    title: "Projects",
    description: "Manage your software projects.",
    endpoint: "/projects",
    responseKey: "projects",
    icon: FolderKanban
  },

  bugs: {
    title: "Bugs",
    description: "Track, assign and resolve software defects.",
    endpoint: "/bugs",
    responseKey: "bugs",
    icon: Bug
  },

  "test-cases": {
    title: "Test Cases",
    description: "Manage manual and automated test scenarios.",
    endpoint: "/test-cases",
    responseKey: "test_cases",
    icon: FlaskConical
  },

  "test-runs": {
    title: "Test Runs",
    description: "Review test execution results.",
    endpoint: "/test-runs",
    responseKey: "test_runs",
    icon: PlayCircle
  }

};


export default function ResourcePage({
  resource
}: ResourcePageProps) {

  const config = resourceConfig[resource];

  const Icon = config.icon;

  const [items, setItems] = useState<ResourceItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
 
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {

    let cancelled = false;

    async function loadData() {

      setLoading(true);
      setError("");

      try {

        const response = await api.get(config.endpoint);

        if (!cancelled) {

          setItems(
            response.data[config.responseKey] ?? []
          );

        }

      } catch (error) {

        console.error(error);

        if (!cancelled) {
          setError("Unable to load data.");
        }

      } finally {

        if (!cancelled) {
          setLoading(false);
        }

      }

    }

    loadData();

    return () => {
      cancelled = true;
    };

  }, [resource, config.endpoint, config.responseKey, refreshKey]);


  return (

    <main className="page-container">

      <div className="page-header">

        <div>

         <div className="page-heading">

           <Icon size={30} />

            <h1>{config.title}</h1>

         </div>

         <p>{config.description}</p>

  </div>


  {(resource === "projects" || resource === "bugs") && (

    <ResourceForm

      resource={resource}

      onCreated={() => {
        setRefreshKey(previous => previous + 1);
      }}

    />

  )}

</div>


      {loading && (
        <div className="content-card">
          Loading...
        </div>
      )}


      {error && (
        <div className="content-card error">
          {error}
        </div>
      )}


      {!loading && !error && (

        <div className="content-card">

          <div className="content-card-header">

            <h2>
              All {config.title}
            </h2>

            <span className="count-badge">
              {items.length} total
            </span>

          </div>


          {items.length === 0 ? (

            <div className="empty-state">

              <Icon size={40} />

              <h3>No records found</h3>

              <p>
                There are no records available yet.
              </p>

            </div>

          ) : (

            <div className="table-container">

              <table className="data-table">

                <thead>

                  <tr>

                    <th>ID</th>

                    <th>Name / Title</th>

                    <th>Status / Type</th>

                    <th>Priority</th>

                        {resource === "bugs" && (
                            <th>Assigned To</th>
                        )}

                    <th>Date</th>

                        {resource === "bugs" && (
                            <th>Actions</th>
                        )}

                  </tr>

                </thead>


                <tbody>

                  {items.map(item => (

                    <tr key={item.id}>

                      <td>
                        #{item.id}
                      </td>

                      <td className="item-title">

                        {item.name ||
                          item.title ||
                          `Record ${item.id}`}

                      </td>

                      <td>

                        <span className="status-badge">

                          {item.status ||
                            item.test_type ||
                            "ACTIVE"}

                        </span>

                      </td>

                      <td>

                        {item.priority || "—"}
                      
                      </td>

                            {resource === "bugs" && (

                                <td>

                                    {item.assignee_name || "Unassigned"}

                                </td>

                            )}

                      
                      <td>

                        {item.created_at ||
                        item.executed_at

                          ? new Date(
                              item.created_at ||
                              item.executed_at!
                            ).toLocaleDateString()

                          : "—"}

                      </td>

                      {resource === "bugs" && (

                    <td>

                        <BugActions

                            bugId={item.id}

                            status={item.status || "OPEN"}

                            assignedTo={item.assigned_to ?? null}

                            onUpdated={() => {

                                setRefreshKey(
                                    previous => previous + 1
                            );

                }}

    />

  </td>

)}

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      )}

    </main>

  );

}