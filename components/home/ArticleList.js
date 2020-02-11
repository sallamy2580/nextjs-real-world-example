import React from "react";
import { useRouter } from "next/router";
import useSWR from "swr";

import ArticlePreview from "./ArticlePreview";
import fetcher from "../../lib/utils/fetcher";
import ListErrors from "../common/ListErrors";
import LoadingSpinner from "../common/LoadingSpinner";
import Pagination from "../common/Pagination";
import PageContext from "../../lib/context/PageContext";
import PageCountContext from "../../lib/context/PageCountContext";
import useIsMounted from "../../lib/hooks/useIsMounted";
import useViewport from "../../lib/hooks/useViewport";
import { SERVER_BASE_URL, DEFAULT_LIMIT } from "../../lib/utils/constant";

const ArticleList = ({ initialArticles }) => {
  const { page, setPage } = React.useContext(PageContext);
  const { pageCount } = React.useContext(PageCountContext);

  const isMounted = useIsMounted();

  const router = useRouter();
  const { asPath, query } = router;
  const { vw } = useViewport();
  const lastIndex = Math.ceil(pageCount / 20);

  const fetchURL =
    Object.keys(query).length === 0
      ? `${SERVER_BASE_URL}/articles?offset=${page * DEFAULT_LIMIT}`
      : `${SERVER_BASE_URL}/articles${asPath}&offset=${page * DEFAULT_LIMIT}`;

  const { data: fetchedArticles, error: articleError } = useSWR(
    fetchURL,
    fetcher
  );

  if (articleError) {
    return (
      <div className="col-md-9">
        <div className="feed-toggle">
          <ul className="nav nav-pills outline-active"></ul>
        </div>
        <ListErrors errors={articleError} />
      </div>
    );
  }

  if (isMounted && !fetchedArticles) {
    return <LoadingSpinner />;
  }

  const articles =
    (fetchedArticles && fetchedArticles.articles) || initialArticles;

  if (articles && articles.length === 0) {
    return <div className="article-preview">No articles are here... yet.</div>;
  }

  return (
    <div>
      {articles &&
        articles.map(article => (
          <ArticlePreview key={article.slug} article={article} />
        ))}

      <Pagination
        total={pageCount}
        limit={20}
        pageCount={vw >= 768 ? 10 : 5}
        currentPage={page}
      >
        {({ pages, currentPage, hasNextPage, hasPreviousPage }) => (
          <React.Fragment>
            <li
              key={`first-button`}
              className="page-item"
              onClick={e => {
                e.preventDefault();
                setPage(0);
              }}
            >
              <a className="page-link">{`<<`}</a>
            </li>
            {hasPreviousPage && (
              <li
                key={`prev-button`}
                className="page-item"
                onClick={e => {
                  e.preventDefault();
                  setPage(page - 1);
                }}
              >
                <a className="page-link">{`<`}</a>
              </li>
            )}
            {pages.map(page => {
              const isCurrent = page === currentPage;
              const handleClick = e => {
                e.preventDefault();
                setPage(page);
              };
              return (
                <li
                  key={page.toString()}
                  className={isCurrent ? "page-item active" : "page-item"}
                  onClick={handleClick}
                >
                  <a className="page-link">{page + 1}</a>
                </li>
              );
            })}
            {hasNextPage && (
              <li
                key={`next-button`}
                className="page-item"
                onClick={e => {
                  e.preventDefault();
                  setPage(page + 1);
                }}
              >
                <a className="page-link">{`>`}</a>
              </li>
            )}
            <li
              key={`last-button`}
              className="page-item"
              onClick={e => {
                e.preventDefault();
                setPage(lastIndex);
              }}
            >
              <a className="page-link">{`>>`}</a>
            </li>
          </React.Fragment>
        )}
      </Pagination>
    </div>
  );
};

export default ArticleList;
