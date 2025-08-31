import React, { useState, useEffect } from 'react';

const SimpleApp = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎯 개인 프로필 플랫폼</h1>
      <p>React + Vite 환경이 정상 작동 중입니다!</p>
      
      <div style={{ 
        border: '1px solid #28a745', 
        padding: '15px', 
        margin: '20px 0',
        borderRadius: '5px',
        backgroundColor: '#d4edda'
      }}>
        <h3>✅ 기본 환경 설정 완료</h3>
        <ul>
          <li>React 19 + Vite 7</li>
          <li>Supabase JavaScript SDK</li>
          <li>환경 변수 시스템</li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleApp;