import React, { useState, useEffect } from 'react';
import './Comments.css';

function Comments({ postId, api_url, session }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${api_url}/posts/${postId}/comments`);
      if (!response.ok) {
        throw new Error('댓글을 불러오는 데 실패했습니다.');
      }
      const data = await response.json();
      setComments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId, api_url]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${api_url}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '댓글 작성에 실패했습니다.');
      }
      
      setNewComment('');
      // 댓글 작성 성공 후 댓글 목록 다시 불러오기
      fetchComments();

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('ko-KR', options);
  };
  
  return (
    <div className="comments-section">
      <h3 className="comments-title">댓글</h3>
      
      <div className="comments-list">
        {loading && <p>댓글을 불러오는 중...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && comments.length === 0 && <p>아직 댓글이 없습니다.</p>}
        {comments.map(comment => (
          <div key={comment.id} className="comment-item">
            <img src={comment.profile_image_url} alt={comment.nickname} className="comment-author-avatar" />
            <div className="comment-content">
              <div className="comment-author-name">{comment.nickname}</div>
              <div className="comment-text">{comment.is_deleted ? '(무적절한 표현으로 삭제된 댓글입니다.)' : comment.content}{comment.is_purified && ' (부적절한 표현으로 수정됨)'}</div>
              <div className="comment-date">{formatDate(comment.created_at)}</div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 입력하세요..."
          className="comment-input"
          rows="3"
          disabled={!session || isSubmitting}
        />
        <button type="submit" className="comment-submit-button" disabled={!session || isSubmitting}>
          {isSubmitting ? '등록 중...' : '등록'}
        </button>
      </form>
      {!session && <p className="comment-login-prompt">댓글을 작성하려면 로그인이 필요합니다.</p>}
    </div>
  );
}

export default Comments;
