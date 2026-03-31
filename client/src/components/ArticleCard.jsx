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
      : "View Article";

  // For draft articles, show source title/body
  const displayTitle = article.source?.title || article.title || "Untitled";
  const displayLanguage = status === "draft" ? "English" : (article.language || "EN");

  return (
    <div
      className="surface cursor-pointer overflow-hidden transition hover:-translate-y-0.5 hover:shadow-xl"
      onClick={onClick}
    >
      <div className="border-b border-purple-100 bg-gradient-to-r from-purple-50 to-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-purple-700">
        Editorial Item
      </div>
      <div className="p-4">
        <h3 className="brand-heading mb-2 text-xl font-bold text-slate-900">{displayTitle}</h3>
        <p className="mb-2 inline-flex items-center gap-2 text-sm text-slate-600">
          <span className={`h-2.5 w-2.5 rounded-full ${statusMeta.dotClass}`} />
          Status: {statusMeta.label}
        </p>
        <p className="mb-2 text-sm text-slate-500">
          Language: {displayLanguage}
        </p>
        <p className="text-sm text-slate-700">Author: {authorLabel}</p>
        <p className="mb-4 text-sm text-slate-600">{dateLabel}</p>

        <button 
          className="btn-primary text-sm"
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