import React from "react";

function getStatusMeta(status) {
  if (status === "draft") {
    return { label: "Draft", dotClass: "bg-gray-400" };
  }

  if (status === "for_review") {
    return { label: "For Review", dotClass: "bg-slate-500" };
  }

  if (status === "published") {
    return { label: "Published", dotClass: "bg-emerald-500" };
  }

  return { label: "For Review", dotClass: "bg-slate-400" };
}

function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString();
}

function ArticleCard({ article, status, onClick }) {
  const statusMeta = getStatusMeta(status || article.status || "draft");
  const authorLabel = article.author || "Unknown";
  const publishedLabel = formatDate(article.publishedAt);
  
  // For draft articles, show created date instead of published
  const dateLabel = status === "draft" 
    ? `Created: ${formatDate(article.createdAt)}`
    : `Published: ${publishedLabel}`;

  // Button text based on status
  const buttonText =
    status === "draft"
      ? "Edit Article"
      : status === "for_review"
      ? "Edit Translations"
      : "Edit Article";

  // For draft articles, show source title/body
  const displayTitle = article.source?.title || article.title || "Untitled";
  const displayLanguage = status === "draft" ? "English" : (article.language || "EN");

  return (
    <div
      className="bg-white shadow-md hover:shadow-xl transition cursor-pointer rounded overflow-hidden"
      onClick={onClick}
    >
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{displayTitle}</h3>
        <p className="text-sm text-gray-600 mb-2 inline-flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${statusMeta.dotClass}`} />
          Status: {statusMeta.label}
        </p>
        <p className="text-sm text-gray-500 mb-2">
          Language: {displayLanguage}
        </p>
        <p className="text-sm text-gray-600">Author: {authorLabel}</p>
        <p className="text-sm text-gray-600 mb-3">{dateLabel}</p>

        <button 
          className="bg-purple-700 text-white px-3 py-1 text-sm"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}

export default ArticleCard;