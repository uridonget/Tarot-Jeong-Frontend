import React, { useState } from 'react';
import './PostEditor.css';

function PostEditor({ session, api_url, changeView }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${api_url}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // 성공적으로 등록 후 게시판으로 이동
      changeView('board');

    } catch (err) {
      console.error("Error creating post:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-editor-container">
      <h1>새 글 작성</h1>
      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group">
          <label htmlFor="post-title">제목</label>
          <input
            id="post-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            maxLength="100"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="post-content">내용</label>
          <textarea
            id="post-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            rows="15"
            required
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button" 
            onClick={() => changeView('board')}
            disabled={isSubmitting}
          >
            취소
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? '등록 중...' : '글 등록하기'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PostEditor;
