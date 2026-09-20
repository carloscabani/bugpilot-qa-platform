import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import api from "../services/api";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setError("");
    setLoading(true);

    try {

      const response = await api.post("/auth/login", {
        email,
        password
      });

      sessionStorage.setItem(
        "bugpilot_token",
        response.data.token
      );

      sessionStorage.setItem(
        "bugpilot_user",
        JSON.stringify(response.data.user)
      );

      navigate("/dashboard");

    } catch (error) {

      if (axios.isAxiosError(error)) {

        setError(
          error.response?.data?.message ||
          "Unable to connect to BugPilot"
        );

      } else {

        setError("Unexpected error");

      }

    } finally {

      setLoading(false);

    }

  }

  return (

    <div className="login-page">

      <div className="login-card">

        <h1>BugPilot</h1>

        <p>QA-first defect management platform</p>

        <form onSubmit={handleSubmit}>

          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="error">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

        </form>

      </div>

    </div>

  );

}