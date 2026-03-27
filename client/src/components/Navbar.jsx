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

        <div className="hidden md:flex gap-6 text-sm">
          <p>Latest News</p>
          <p>Politics</p>
          <p>Business</p>
          <p>Technology</p>
          <p>Health</p>
          <p>Sports</p>
          <p>Entertainment</p>
        </div>
      </div>
    </div>
  );
}

export default Navbar;