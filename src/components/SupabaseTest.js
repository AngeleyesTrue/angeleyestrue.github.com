import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState('테스트 중...')
  const [error, setError] = useState(null)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      // Supabase 연결 테스트 - auth 상태 확인
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        setError(error.message)
        setConnectionStatus('연결 실패')
      } else {
        setConnectionStatus('Supabase 연결 성공!')
      }
    } catch (err) {
      setError(err.message)
      setConnectionStatus('연결 중 오류 발생')
    }
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>Supabase 연결 테스트</h3>
      <p>상태: <strong>{connectionStatus}</strong></p>
      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          <strong>오류:</strong> {error}
        </div>
      )}
      <button onClick={testConnection} style={{ marginTop: '10px' }}>
        다시 테스트
      </button>
    </div>
  )
}

export default SupabaseTest