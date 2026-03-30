import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  return (
    <div className="bg-purple-700 text-white">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-3">
        <div
          className="text-2xl font-bold cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          paraluman.
        </div>

        <div className="flex gap-2 text-sm">
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded border border-white/40 px-3 py-1 hover:bg-white/10"
          >
            Editor
          </button>
          <button
            onClick={() => navigate("/public")}
            className="rounded border border-white/40 px-3 py-1 hover:bg-white/10"
          >
            Public Demo
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;