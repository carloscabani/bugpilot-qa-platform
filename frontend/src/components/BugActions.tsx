import { useEffect, useState } from "react";
import axios from "axios";

import api from "../services/api";

import type { User } from "../types";

interface Developer {
  id: number;
  name: string;
  role: string;
}

interface BugActionsProps {
  bugId: number;
  status: string;
  assignedTo: number | null;
  onUpdated: () => void;
}

const transitions: Record<string, string[]> = {
  OPEN: ["IN_PROGRESS"],

  IN_PROGRESS: ["READY_FOR_QA"],

  READY_FOR_QA: ["CLOSED", "REOPENED"],

  REOPENED: ["IN_PROGRESS"],

  CLOSED: []
};

export default function BugActions({
  bugId,
  status,
  assignedTo,
  onUpdated
}: BugActionsProps) {

  const storedUser = sessionStorage.getItem("bugpilot_user");

  const user: User | null = storedUser
    ? JSON.parse(storedUser)
    : null;

  const [developers, setDevelopers] = useState<Developer[]>([]);

  const [developerId, setDeveloperId] = useState(
    assignedTo ? String(assignedTo) : ""
  );

  const [newStatus, setNewStatus] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const canAssign =
    user?.role === "ADMIN" ||
    user?.role === "QA";

  const isAssignedDeveloper =
    user?.role === "DEVELOPER" &&
    user.id === assignedTo;

  const isValidator =
    user?.role === "ADMIN" ||
    user?.role === "QA";

  const availableTransitions =
    transitions[status] ?? [];

  const allowedStatuses = availableTransitions.filter(
    nextStatus => {

      if (
        nextStatus === "IN_PROGRESS" ||
        nextStatus === "READY_FOR_QA"
      ) {
        return isAssignedDeveloper;
      }

      if (
        nextStatus === "CLOSED" ||
        nextStatus === "REOPENED"
      ) {
        return isValidator;
      }

      return false;

    }
  );

  useEffect(() => {

    if (!canAssign) {
      return;
    }

    async function loadDevelopers() {

      try {

        const response = await api.get("/users");

        const developerUsers = response.data.users.filter(
          (user: Developer) =>
            user.role === "DEVELOPER"
        );

        setDevelopers(developerUsers);

      } catch (error) {

        console.error(error);

      }

    }

    loadDevelopers();

  }, [canAssign]);

  useEffect(() => {

    setDeveloperId(
      assignedTo ? String(assignedTo) : ""
    );

  }, [assignedTo]);

  useEffect(() => {

    setNewStatus("");

  }, [status]);


  async function assignDeveloper() {

    if (!developerId) {
      return;
    }

    setLoading(true);
    setError("");

    try {

      await api.patch(`/bugs/${bugId}/assign`, {
        developer_id: Number(developerId)
      });

      onUpdated();

    } catch (error) {

      if (axios.isAxiosError(error)) {

        setError(
          error.response?.data?.message ||
          "Unable to assign developer"
        );

      } else {

        setError("Unexpected error");

      }

    } finally {

      setLoading(false);

    }

  }


  async function updateStatus() {

    if (!newStatus) {
      return;
    }

    setLoading(true);
    setError("");

    try {

      await api.patch(`/bugs/${bugId}/status`, {
        status: newStatus
      });

      setNewStatus("");

      onUpdated();

    } catch (error) {

      if (axios.isAxiosError(error)) {

        setError(
          error.response?.data?.message ||
          "Unable to update status"
        );

      } else {

        setError("Unexpected error");

      }

    } finally {

      setLoading(false);

    }

  }


  return (

    <div className="bug-actions">

      {canAssign && (

        <div className="bug-action-group">

          <select
            value={developerId}
            onChange={(e) =>
              setDeveloperId(e.target.value)
            }
            disabled={loading}
          >

            <option value="">
              Select developer
            </option>

            {developers.map(developer => (

              <option
                key={developer.id}
                value={developer.id}
              >

                {developer.name}

              </option>

            ))}

          </select>

          <button
            onClick={assignDeveloper}
            disabled={!developerId || loading}
          >

            Assign

          </button>

        </div>

      )}


      {allowedStatuses.length > 0 && (

        <div className="bug-action-group">

          <select
            value={newStatus}
            onChange={(e) =>
              setNewStatus(e.target.value)
            }
            disabled={loading}
          >

            <option value="">
              Change status
            </option>

            {allowedStatuses.map(nextStatus => (

              <option
                key={nextStatus}
                value={nextStatus}
              >

                {nextStatus.replaceAll("_", " ")}

              </option>

            ))}

          </select>

          <button
            onClick={updateStatus}
            disabled={!newStatus || loading}
          >

            Update

          </button>

        </div>

      )}


      {error && (
        <p className="error">
          {error}
        </p>
      )}

    </div>

  );

}