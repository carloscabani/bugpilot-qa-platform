import { useState } from "react";

import axios from "axios";

import {
  BrainCircuit,
  X,
  AlertTriangle
} from "lucide-react";

import api from "../services/api";

interface BugAnalysisProps {
  bugId: number;
  bugTitle: string;
  onClose: () => void;
}

interface AnalysisResult {
  score: number;
  suggested_priority: string;
  reasons: string[];
}

interface AnalysisResponse {
  bug_id: number;
  current_priority: string;
  analysis: AnalysisResult;
}

export default function BugAnalysis({
  bugId,
  bugTitle,
  onClose
}: BugAnalysisProps) {

  const [reproducible, setReproducible] =
    useState(false);

  const [userImpact, setUserImpact] =
    useState("MEDIUM");

  const [analysis, setAnalysis] =
    useState<AnalysisResponse | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  async function runAnalysis() {

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {

      const response =
        await api.post<AnalysisResponse>(
          `/intelligence/bugs/${bugId}/analyze`,
          {
            reproducible,
            user_impact: userImpact
          }
        );

      setAnalysis(response.data);

    } catch (error) {

      if (axios.isAxiosError(error)) {

        setError(
          error.response?.data?.message ||
          "Unable to analyze bug"
        );

      } else {

        setError("Unexpected error");

      }

    } finally {

      setLoading(false);

    }

  }


  return (

    <div className="modal-overlay">

      <div className="modal analysis-modal">

        <div className="modal-header">

          <div>

            <h2 className="analysis-heading">

              <BrainCircuit size={26} />

              Intelligent Bug Analysis

            </h2>

            <p>
              BUG-{bugId}: {bugTitle}
            </p>

          </div>

          <button
            type="button"
            className="close-button"
            onClick={onClose}
          >

            <X size={20} />

          </button>

        </div>


        <div className="resource-form">

          <label htmlFor="reproducible">

            Is the defect reproducible?

          </label>

          <select
            id="reproducible"
            value={String(reproducible)}
            onChange={(e) => {

              setReproducible(
                e.target.value === "true"
              );

              setAnalysis(null);

            }}
          >

            <option value="false">
              No
            </option>

            <option value="true">
              Yes
            </option>

          </select>


          <label htmlFor="user-impact">

            User Impact

          </label>

          <select
            id="user-impact"
            value={userImpact}
            onChange={(e) => {

              setUserImpact(e.target.value);

              setAnalysis(null);

            }}
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

          </select>


          <button
            type="button"
            className="primary-button"
            onClick={runAnalysis}
            disabled={loading}
          >

            {loading
              ? "Analyzing..."
              : "Run Analysis"}

          </button>

        </div>


        {error && (

          <p className="error">
            {error}
          </p>

        )}


        {analysis && (

          <div className="analysis-result">

            <h3>Analysis Result</h3>


            <div className="analysis-priorities">

              <div>

                <span>
                  Current Priority
                </span>

                <strong>
                  {analysis.current_priority}
                </strong>

              </div>


              <div>

                <span>
                  Suggested Priority
                </span>

                <strong className="suggested-priority">

                  {analysis.analysis.suggested_priority}

                </strong>

              </div>

            </div>


            <div className="analysis-score">

              <h4>Risk Score</h4>

              <strong>

                {analysis.analysis.score}/100

              </strong>

              <div className="score-bar">

                <div
                  className="score-progress"
                  style={{
                    width:
                      `${analysis.analysis.score}%`
                  }}
                />

              </div>

            </div>


            <div className="analysis-reasons">

              <h4>
                <AlertTriangle size={18} />
                Analysis Reasons
              </h4>

              {analysis.analysis.reasons.length > 0 ? (

                <ul>

                  {analysis.analysis.reasons.map(
                    (reason, index) => (

                      <li key={index}>
                        {reason}
                      </li>

                    )
                  )}

                </ul>

              ) : (

                <p>
                  No additional risk factors identified.
                </p>

              )}

            </div>


            <p className="analysis-disclaimer">

              This is a rule-based recommendation.
              The final priority decision remains
              with the QA team.

            </p>

          </div>

        )}

      </div>

    </div>

  );

}