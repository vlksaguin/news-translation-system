function ArticleCard( {article, onClick} ) {
    return (
        <div>
            <h3>{article.title_en}</h3>
            <p>Status: {article.status}</p>
        </div>

    );
}

export default ArticleCard;