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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <LoadingModal isOpen={isLoggingIn} message="Signing you in..." />
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 shadow-md w-80"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">
          paraluman.
        </h1>

        <input
          placeholder="Username"
          className="border p-2 w-full mb-3"
          disabled={isLoggingIn}
          required
        />

        <input
          placeholder="Password"
          type="password"
          className="border p-2 w-full mb-4"
          disabled={isLoggingIn}
          required
        />

        <button
          type="submit"
          disabled={isLoggingIn}
          className="bg-purple-700 text-white w-full py-2"
        >
          {isLoggingIn ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;