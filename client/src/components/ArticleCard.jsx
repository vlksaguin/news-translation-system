import React from "react";

function ArticleCard( {article, onClick} ) {
    return (
        <div onClick={onClick}>
            <h3>{article.title}</h3>
            <p>Language: {article.language}</p>
        </div>

    );
}

export default ArticleCard;