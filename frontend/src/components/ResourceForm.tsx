import { useEffect, useState } from "react";

import axios from "axios";

import api from "../services/api";

import type { Project, User } from "../types";

type Resource = "projects" | "bugs";

interface ResourceFormProps {
  resource: Resource;
  onCreated: () => void;
}

export default function ResourceForm({
  resource,
  onCreated
}: ResourceFormProps) {

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);

  const storedUser = sessionStorage.getItem("bugpilot_user");

  const user: User | null = storedUser
    ? JSON.parse(storedUser)
    : null;

  const canCreate =
    user?.role === "ADMIN" ||
    (resource === "bugs" && user?.role === "QA");

  const [form, setForm] = useState({
    name: "",
    description: "",
    project_id: "",
    title: "",
    severity: "MEDIUM",
    priority: "MEDIUM",
    environment: "",
    steps_to_reproduce: "",
    expected_result: "",
    actual_result: ""
  });


  useEffect(() => {

    if (resource !== "bugs" || !open) {
      return;
    }

    async function loadProjects() {

      try {

        const response = await api.get("/projects");

        setProjects(response.data.projects);

      } catch (error) {

        console.error(error);

        setError("Unable to load projects");

      }

    }

    loadProjects();

  }, [resource, open]);


  function updateField(
    event:
      React.ChangeEvent<HTMLInputElement> |
      React.ChangeEvent<HTMLTextAreaElement> |
      React.ChangeEvent<HTMLSelectElement>
  ) {

    const { name, value } = event.target;

    setForm(previous => ({
      ...previous,
      [name]: value
    }));

  }


  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setLoading(true);
    setError("");

    try {

      if (resource === "projects") {

        await api.post("/projects", {
          name: form.name,
          description: form.description
        });

      } else {

        await api.post("/bugs", {

          project_id: Number(form.project_id),

          title: form.title,

          description: form.description,

          severity: form.severity,

          priority: form.priority,

          environment: form.environment,

          steps_to_reproduce: form.steps_to_reproduce,

          expected_result: form.expected_result,

          actual_result: form.actual_result

        });

      }

      setOpen(false);

      setForm({
        name: "",
        description: "",
        project_id: "",
        title: "",
        severity: "MEDIUM",
        priority: "MEDIUM",
        environment: "",
        steps_to_reproduce: "",
        expected_result: "",
        actual_result: ""
      });

      onCreated();

    } catch (error) {

      if (axios.isAxiosError(error)) {

        setError(
          error.response?.data?.message ||
          "Unable to create record"
        );

      } else {

        setError("Unexpected error");

      }

    } finally {

      setLoading(false);

    }

  }


  if (!canCreate) {
    return null;
  }


  return (

    <>

      <button
        className="primary-button"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
      >

        + {resource === "projects"
          ? "New Project"
          : "Report Bug"}

      </button>


      {open && (

        <div className="modal-overlay">

          <div className="modal">

            <div className="modal-header">

              <h2>

                {resource === "projects"
                  ? "Create Project"
                  : "Report New Bug"}

              </h2>

              <button
                type="button"
                className="close-button"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>

            </div>


            <form
              className="resource-form"
              onSubmit={handleSubmit}
            >

              {resource === "projects" ? (

                <>

                  <label>Project Name</label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={updateField}
                    required
                    maxLength={150}
                  />

                  <label>Description</label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={updateField}
                    rows={4}
                  />

                </>

              ) : (

                <>

                  <label>Project</label>

                  <select
                    name="project_id"
                    value={form.project_id}
                    onChange={updateField}
                    required
                  >

                    <option value="">
                      Select a project
                    </option>

                    {projects.map(project => (

                      <option
                        key={project.id}
                        value={project.id}
                      >

                        {project.name}

                      </option>

                    ))}

                  </select>


                  <label>Bug Title</label>

                  <input
                    name="title"
                    value={form.title}
                    onChange={updateField}
                    required
                    maxLength={200}
                  />


                  <label>Description</label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={updateField}
                    required
                    rows={3}
                  />


                  <div className="form-row">

                    <div>

                      <label>Severity</label>

                      <select
                        name="severity"
                        value={form.severity}
                        onChange={updateField}
                      >

                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>

                      </select>

                    </div>


                    <div>

                      <label>Priority</label>

                      <select
                        name="priority"
                        value={form.priority}
                        onChange={updateField}
                      >

                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>

                      </select>

                    </div>

                  </div>


                  <label>Environment</label>

                  <input
                    name="environment"
                    value={form.environment}
                    onChange={updateField}
                    placeholder="Chrome / Windows 11"
                  />


                  <label>Steps to Reproduce</label>

                  <textarea
                    name="steps_to_reproduce"
                    value={form.steps_to_reproduce}
                    onChange={updateField}
                    rows={3}
                  />


                  <label>Expected Result</label>

                  <textarea
                    name="expected_result"
                    value={form.expected_result}
                    onChange={updateField}
                    rows={2}
                  />


                  <label>Actual Result</label>

                  <textarea
                    name="actual_result"
                    value={form.actual_result}
                    onChange={updateField}
                    rows={2}
                  />

                </>

              )}


              {error && (
                <p className="error">{error}</p>
              )}


              <div className="form-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={loading}
                >

                  {loading
                    ? "Saving..."
                    : resource === "projects"
                      ? "Create Project"
                      : "Report Bug"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </>

  );

}