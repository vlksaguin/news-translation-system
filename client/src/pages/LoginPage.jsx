import React from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();
    localStorage.setItem("user", "editor");
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
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
          required
        />

        <input
          placeholder="Password"
          type="password"
          className="border p-2 w-full mb-4"
          required
        />

        <button
          type="submit"
          className="bg-purple-700 text-white w-full py-2"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginPage;