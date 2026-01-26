import React, { useState, useEffect } from 'react';
import './Board.css';
import Loading from './Loading'; // 로딩 컴포넌트 import

function Board({ changeView, api_url }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${api_url}/posts?page=1`);
        if (!response.ok) {
          throw new Error('게시글을 불러오는 데 실패했습니다.');
        }
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [api_url]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('ko-KR', options);
  };

  const renderContent = () => {
    if (loading) {
      return <Loading />;
    }
    if (error) {
      return <p className="error-message">오류: {error}</p>;
    }
    if (posts.length === 0) {
      return <p>아직 게시글이 없습니다. 첫 글을 작성해보세요!</p>;
    }
    return (
      <ul className="post-list">
        {posts.map(post => (
          <li key={post.id} className="post-item" onClick={() => changeView(`post/${post.id}`)}>
            <div className="post-title">{post.title}</div>
            <div className="post-meta">
              <span className="post-author">{post.nickname}</span>
              <span className="post-date">{formatDate(post.created_at)}</span>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="board-container">
      <div className="board-header">
        <h1>게시판</h1>
        <button className="new-post-button" onClick={() => changeView('post/new')}>새 글 작성하기</button>
      </div>
      <div className="board-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default Board;
