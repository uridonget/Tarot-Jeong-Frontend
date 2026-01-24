import React from 'react';
import './NotFound.css';

function NotFound() {
  return (
    <div className="not-found-container">
      <h1>404</h1>
      <p>페이지를 찾을 수 없습니다.</p>
      <a href="/#form">홈으로 돌아가기</a>
    </div>
  );
}

export default NotFound;
