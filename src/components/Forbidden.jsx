import React from 'react';
import './Forbidden.css';

function Forbidden() {
  return (
    <div className="forbidden-container">
      <h1>403</h1>
      <p>이 페이지에 접근할 권한이 없습니다.</p>
      <a href="/#form">홈으로 돌아가기</a>
    </div>
  );
}

export default Forbidden;
