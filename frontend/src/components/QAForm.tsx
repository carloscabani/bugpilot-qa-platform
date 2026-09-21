import { useEffect, useState } from "react";

import type {
  ChangeEvent,
  FormEvent
} from "react";

import axios from "axios";

import api from "../services/api";

import type {
  Project,
  Bug,
  TestCase,
  User
} from "../types";


type QAResource =
  | "test-cases"
  | "test-runs";


interface QAFormProps {
  resource: QAResource;
  onCreated: () => void;
}


export default function QAForm({
  resource,
  onCreated
}: QAFormProps) {

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);

  const [bugs, setBugs] = useState<Bug[]>([]);

  const [testCases, setTestCases] = useState<TestCase[]>([]);


  const storedUser = sessionStorage.getItem("bugpilot_user");

  const user: User | null = storedUser
    ? JSON.parse(storedUser)
    : null;


  const canCreate =
    user?.role === "ADMIN" ||
    user?.role === "QA";


  const [form, setForm] = useState({

    project_id: "",

    bug_id: "",

    title: "",

    description: "",

    preconditions: "",

    steps: "",

    expected_result: "",

    priority: "MEDIUM",

    test_type: "MANUAL",

    test_case_id: "",

    status: "PASS",

    environment: "",

    actual_result: "",

    notes: ""

  });


  useEffect(() => {

    if (!open) {
      return;
    }

    async function loadOptions() {

      setError("");

      try {

        if (resource === "test-cases") {

          const [
            projectsResponse,
            bugsResponse
          ] = await Promise.all([

            api.get("/projects"),

            api.get("/bugs")

          ]);

          setProjects(
            projectsResponse.data.projects
          );

          setBugs(
            bugsResponse.data.bugs
          );

        } else {

          const response = await api.get(
            "/test-cases"
          );

          setTestCases(
            response.data.test_cases
          );

        }

      } catch (error) {

        console.error(error);

        setError(
          "Unable to load form options"
        );

      }

    }

    loadOptions();

  }, [open, resource]);


  function updateField(
    event: ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) {

    const { name, value } = event.target;

    setForm(previous => ({

      ...previous,

      [name]: value,

      ...(name === "project_id"
        ? { bug_id: "" }
        : {})

    }));

  }


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setLoading(true);

    setError("");

    try {

      if (resource === "test-cases") {

        await api.post("/test-cases", {

          project_id: Number(
            form.project_id
          ),

          bug_id: form.bug_id
            ? Number(form.bug_id)
            : null,

          title: form.title,

          description: form.description,

          preconditions: form.preconditions,

          steps: form.steps,

          expected_result:
            form.expected_result,

          priority: form.priority,

          test_type: form.test_type

        });

      } else {

        await api.post("/test-runs", {

          test_case_id: Number(
            form.test_case_id
          ),

          status: form.status,

          environment: form.environment,

          actual_result:
            form.actual_result,

          notes: form.notes

        });

      }

      setOpen(false);

      onCreated();

    } catch (error) {

      if (axios.isAxiosError(error)) {

        setError(
          error.response?.data?.message ||
          "Unable to save record"
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
        onClick={() => setOpen(true)}
      >

        {resource === "test-cases"
          ? "+ New Test Case"
          : "+ Record Test Run"}

      </button>


      {open && (

        <div className="modal-overlay">

          <div className="modal">

            <div className="modal-header">

              <h2>

                {resource === "test-cases"
                  ? "Create Test Case"
                  : "Record Test Execution"}

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


              {resource === "test-cases" ? (

                <>

                  <label>Project</label>

                  <select
                    name="project_id"
                    value={form.project_id}
                    onChange={updateField}
                    required
                  >

                    <option value="">
                      Select project
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


                  <label>
                    Related Bug (optional)
                  </label>

                  <select
                    name="bug_id"
                    value={form.bug_id}
                    onChange={updateField}
                  >

                    <option value="">
                      No related bug
                    </option>

                    {bugs
                      .filter(
                        bug =>
                          bug.project_id ===
                          Number(form.project_id)
                      )
                      .map(bug => (

                        <option
                          key={bug.id}
                          value={bug.id}
                        >

                          BUG-{bug.id}: {bug.title}

                        </option>

                      ))}

                  </select>


                  <label>Test Case Title</label>

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
                    rows={2}
                  />


                  <label>Preconditions</label>

                  <textarea
                    name="preconditions"
                    value={form.preconditions}
                    onChange={updateField}
                    rows={2}
                  />


                  <label>Test Steps</label>

                  <textarea
                    name="steps"
                    value={form.steps}
                    onChange={updateField}
                    required
                    rows={4}
                  />


                  <label>Expected Result</label>

                  <textarea
                    name="expected_result"
                    value={form.expected_result}
                    onChange={updateField}
                    required
                    rows={3}
                  />


                  <div className="form-row">

                    <div>

                      <label>Priority</label>

                      <select
                        name="priority"
                        value={form.priority}
                        onChange={updateField}
                      >

                        <option value="LOW">
                          Low
                        </option>

                        <option value="MEDIUM">
                          Medium
                        </option>

                        <option value="HIGH">
                          High
                        </option>

                        <option value="URGENT">
                          Urgent
                        </option>

                      </select>

                    </div>


                    <div>

                      <label>Test Type</label>

                      <select
                        name="test_type"
                        value={form.test_type}
                        onChange={updateField}
                      >

                        <option value="MANUAL">
                          Manual
                        </option>

                        <option value="AUTOMATED">
                          Automated
                        </option>

                      </select>

                    </div>

                  </div>

                </>

              ) : (

                <>

                  <label>Test Case</label>

                  <select
                    name="test_case_id"
                    value={form.test_case_id}
                    onChange={updateField}
                    required
                  >

                    <option value="">
                      Select test case
                    </option>

                    {testCases.map(testCase => (

                      <option
                        key={testCase.id}
                        value={testCase.id}
                      >

                        TC-{testCase.id}: {testCase.title}

                      </option>

                    ))}

                  </select>


                  <label>Execution Result</label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={updateField}
                  >

                    <option value="PASS">
                      PASS
                    </option>

                    <option value="FAIL">
                      FAIL
                    </option>

                    <option value="BLOCKED">
                      BLOCKED
                    </option>

                  </select>


                  <label>Environment</label>

                  <input
                    name="environment"
                    value={form.environment}
                    onChange={updateField}
                    placeholder="Chrome / Windows 11"
                  />


                  <label>Actual Result</label>

                  <textarea
                    name="actual_result"
                    value={form.actual_result}
                    onChange={updateField}
                    rows={3}
                  />


                  <label>Notes</label>

                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={updateField}
                    rows={3}
                  />

                </>

              )}


              {error && (

                <p className="error">
                  {error}
                </p>

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
                    : resource === "test-cases"
                      ? "Create Test Case"
                      : "Record Execution"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </>

  );

}