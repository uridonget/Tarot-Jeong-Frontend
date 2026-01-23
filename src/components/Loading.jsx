import React from 'react';
import './Loading.css';

function Loading() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>카드를 해석하고 있습니다...</p>
    </div>
  );
}

export default Loading;