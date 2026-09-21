import { useEffect, useState } from "react";
import { Clock3, X, ArrowRight } from "lucide-react";
import axios from "axios";

import api from "../services/api";

interface HistoryEntry {
  id: number;
  bug_id: number;
  old_status: string | null;
  new_status: string;
  changed_at: string;
  changed_by: number;
  changed_by_name: string;
}

interface BugHistoryProps {
  bugId: number;
  bugTitle: string;
  onClose: () => void;
}

export default function BugHistory({
  bugId,
  bugTitle,
  onClose
}: BugHistoryProps) {

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    let cancelled = false;

    async function loadHistory() {

      setLoading(true);
      setError("");

      try {

        const response = await api.get(
          `/bugs/${bugId}/history`
        );

        if (!cancelled) {
          setHistory(response.data.history);
        }

      } catch (error) {

        if (!cancelled) {

          if (axios.isAxiosError(error)) {

            setError(
              error.response?.data?.message ||
              "Unable to load bug history"
            );

          } else {

            setError("Unexpected error");

          }

        }

      } finally {

        if (!cancelled) {
          setLoading(false);
        }

      }

    }

    loadHistory();

    return () => {
      cancelled = true;
    };

  }, [bugId]);


  return (

    <div className="modal-overlay">

      <div className="modal history-modal">

        <div className="modal-header">

          <div>

            <h2>Bug History</h2>

            <p>
              BUG-{bugId}: {bugTitle}
            </p>

          </div>

          <button
            type="button"
            className="close-button"
            onClick={onClose}
            aria-label="Close history"
          >
            <X size={20} />
          </button>

        </div>


        {loading && (
          <p>Loading history...</p>
        )}


        {error && (
          <p className="error">{error}</p>
        )}


        {!loading && !error && history.length === 0 && (

          <div className="empty-state">

            <Clock3 size={36} />

            <h3>No history available</h3>

            <p>
              No status changes have been recorded yet.
            </p>

          </div>

        )}


        {!loading && !error && history.length > 0 && (

          <div className="history-timeline">

            {history.map(entry => (

              <div
                className="history-entry"
                key={entry.id}
              >

                <div className="history-dot" />

                <div className="history-content">

                  <div className="history-meta">

                    <strong>
                      {entry.changed_by_name}
                    </strong>

                    <span>

                      {new Date(
                        entry.changed_at
                      ).toLocaleString()}

                    </span>

                  </div>


                  <div className="history-transition">

                    <span className="history-status">

                      {entry.old_status || "CREATED"}

                    </span>

                    <ArrowRight size={16} />

                    <span className="history-status">

                      {entry.new_status}

                    </span>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );

}