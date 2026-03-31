import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingModal from "../components/LoadingModal";

function LoginPage() {
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      localStorage.setItem("user", "editor");
      navigate("/dashboard");
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <div className="page-enter min-h-screen bg-transparent px-4 py-12">
      <LoadingModal isOpen={isLoggingIn} message="Signing you in..." />
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="news-hero p-7 md:p-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-purple-700">Editorial Control Center</p>
          <h1 className="brand-heading mb-4 text-4xl font-bold text-slate-900">Paraluman News Translation Desk</h1>
          <p className="max-w-2xl text-base text-slate-700">
            Prepare source stories, coordinate multilingual reviews, and publish reader-ready coverage with a newsroom workflow inspired by modern media dashboards.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="surface-muted p-3">
              <p className="text-xs uppercase text-slate-500">Workflow</p>
              <p className="font-semibold text-slate-900">Draft to Publish</p>
            </div>
            <div className="surface-muted p-3">
              <p className="text-xs uppercase text-slate-500">Coverage</p>
              <p className="font-semibold text-slate-900">6 Dialects</p>
            </div>
            <div className="surface-muted p-3">
              <p className="text-xs uppercase text-slate-500">Reader Site</p>
              <p className="font-semibold text-slate-900">Public Demo</p>
            </div>
          </div>
        </section>

        <form onSubmit={handleLogin} className="surface p-7 md:p-8">
          <h2 className="brand-heading mb-1 text-2xl font-bold text-purple-900">Editor Sign In</h2>
          <p className="mb-5 text-sm text-slate-600">Validation is coming next phase. Use any credentials for now.</p>

          <input
            placeholder="Username"
            className="field mb-3"
            disabled={isLoggingIn}
            required
          />

          <input
            placeholder="Password"
            type="password"
            className="field mb-5"
            disabled={isLoggingIn}
            required
          />

          <button
            type="submit"
            disabled={isLoggingIn}
            className="btn-primary w-full py-2.5"
          >
            {isLoggingIn ? "Logging in..." : "Enter Editorial Desk"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;