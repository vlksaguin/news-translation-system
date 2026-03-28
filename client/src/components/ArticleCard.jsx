import React from "react";

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

function ArticleCard({ article, onClick }) {
  const authorLabel = article.author || "Unknown";
  const publishedLabel = formatDate(article.publishedAt);
  const editedLabel = article.editedAt ? formatDate(article.editedAt) : "Never";

  return (
    <div
      className="bg-white shadow-md hover:shadow-xl transition cursor-pointer rounded overflow-hidden"
    >
      {/* <img
        src="https://via.placeholder.com/400x200"
        className="w-full h-40 object-cover"
      /> */}

      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{article.title}</h3>
        <p className="text-sm text-gray-500 mb-2">
          Language: {article.language}
        </p>
        <p className="text-sm text-gray-600">Author: {authorLabel}</p>
        <p className="text-sm text-gray-600">Published: {publishedLabel}</p>
        <p className="text-sm text-gray-600 mb-3">Last edited: {editedLabel}</p>

        <button onClick={onClick} className="bg-purple-700 text-white px-3 py-1 text-sm">
          Edit Article
        </button>
      </div>
    </div>
  );
}

export default ArticleCard;