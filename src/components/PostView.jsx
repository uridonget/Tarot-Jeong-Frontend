import React, { useState, useEffect } from 'react';
import './PostView.css';
import Loading from './Loading';
import Comments from './Comments'; // Comments 컴포넌트 import

function PostView({ postId, api_url, changeView, session }) { // session prop 추가
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      try {
        setLoading(true);
        const response = await fetch(`${api_url}/posts/${postId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('게시글을 찾을 수 없습니다.');
          } else {
            throw new Error('게시글을 불러오는 데 실패했습니다.');
          }
        } else {
          const data = await response.json();
          setPost(data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [api_url, postId]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('ko-KR', options);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="post-view-container error-container">
        <h2>오류</h2>
        <p>{error}</p>
        <button onClick={() => changeView('board')}>목록으로 돌아가기</button>
      </div>
    );
  }

  if (!post) {
    return null; // or some other placeholder
  }

  return (
    <div className="post-view-container">
      <div className="post-view-header">
        <h1 className="post-view-title">{post.title}</h1>
        <div className="post-view-meta">
          <div className="author-info">
            <img src={post.profile_image_url} alt={post.nickname} className="author-avatar" />
            <span className="author-name">{post.nickname}</span>
          </div>
          <span className="post-view-date">{formatDate(post.created_at)}</span>
        </div>
      </div>

      <div className="post-view-content">
        {post.content}
      </div>



      {/* 댓글 섹션 추가 */}
      <Comments postId={postId} api_url={api_url} session={session} />
    </div>
  );
}

export default PostView;
