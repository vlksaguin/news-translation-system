import React from "react";

function ArticleCard({ article, onClick }) {
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

        <button onClick={onClick} className="bg-purple-700 text-white px-3 py-1 text-sm">
          Edit Article
        </button>
      </div>
    </div>
  );
}

export default ArticleCard;