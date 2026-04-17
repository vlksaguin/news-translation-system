import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  return (
    <div className="border-b border-[#9D0759]/50 bg-gradient-to-r from-[#9D0759] via-[#b80f6b] to-[#D94C9A] text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div
          className="brand-heading cursor-pointer text-3xl font-bold tracking-tight"
          onClick={() => navigate("/public")}
        >
          Balita.
        </div>

        <div className="flex gap-2 text-sm font-semibold">
          <button
            onClick={() => navigate("/")}
            className="rounded-full border border-[#f8c9e1]/60 bg-white/10 px-4 py-1.5 hover:bg-white/20"
          >
            Editor
          </button>
          <button
            onClick={() => navigate("/public")}
            className="rounded-full border border-[#f8c9e1]/70 bg-[#9D0759] text-white px-4 py-1.5 hover:bg-[#b80f6b]"
          >
            Public Demo
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;