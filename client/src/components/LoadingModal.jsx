import React from "react";

function LoadingModal({ isOpen, message }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label="Translation n progress"
    >
      <div className="w-[90%] max-w-sm rounded-xl bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-purple-700" />
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Please wait</h2>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}

export default LoadingModal;