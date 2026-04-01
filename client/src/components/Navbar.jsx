import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  return (
    <div className="border-b border-purple-900/30 bg-gradient-to-r from-purple-900 via-purple-800 to-fuchsia-800 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div
          className="brand-heading cursor-pointer text-3xl font-bold tracking-tight"
          onClick={() => navigate("/public")}
        >
          paraluman.
        </div>

        <div className="flex gap-2 text-sm font-semibold">
          <button
            onClick={() => navigate("/")}
            className="rounded-full border border-white/30 px-4 py-1.5 hover:bg-white/15"
          >
            Editor
          </button>
          <button
            onClick={() => navigate("/public")}
            className="rounded-full border border-white/40 bg-white/10 px-4 py-1.5 hover:bg-white/20"
          >
            Public Demo
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;