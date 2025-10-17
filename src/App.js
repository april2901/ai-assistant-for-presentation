import React, { useState, useEffect } from 'react';

// STT API 연동을 위한 메인 앱 컴포넌트
function App() {
  // 상태(State) 변수 정의
  const [selectedFile, setSelectedFile] = useState(null); // 선택된 음성 파일
  const [apiResponse, setApiResponse] = useState(null);   // API 응답 결과
  const [loading, setLoading] = useState(false);          // 로딩 상태
  const [error, setError] = useState(null);               // 에러 메시지
  const [language, setLanguage] = useState('Kor');        // STT 언어 설정 (기본값 'Kor')

  // 컴포넌트 마운트 시 동적으로 스타일 삽입
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
          'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
          sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      .App {
        text-align: center;
      }
      .App-header {
        background-color: #282c34;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: calc(10px + 2vmin);
        color: white;
        padding: 20px;
      }
      .control-panel {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        margin-top: 20px;
        padding: 20px;
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
      }
      .file-input, .language-select {
        background-color: #fff;
        color: #282c34;
        border-radius: 8px;
        padding: 10px 15px;
        border: none;
        font-size: 16px;
        cursor: pointer;
      }
      .language-select {
        appearance: none;
        background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23282c34%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');
        background-repeat: no-repeat;
        background-position: right 1rem center;
        background-size: .65em auto;
        padding-right: 2.5rem;
      }
      .api-button {
        background-color: #61dafb;
        color: #282c34;
        border: none;
        border-radius: 8px;
        padding: 12px 24px;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .api-button:hover:not(:disabled) {
        background-color: #21a1f1;
        transform: translateY(-2px);
      }
      .api-button:disabled {
        background-color: #555;
        color: #999;
        cursor: not-allowed;
      }
      .response-container {
        margin-top: 30px;
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 20px;
        width: 80%;
        max-width: 800px;
        text-align: left;
        font-size: 16px;
        font-family: 'Courier New', Courier, monospace;
      }
      .response-container pre {
        white-space: pre-wrap;
        word-wrap: break-word;
      }
      .error-message {
        color: #ff6b6b;
        font-weight: bold;
      }
    `;
    document.head.appendChild(styleTag);
    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  /**
   * 파일 입력(input) 변경 시 호출되는 함수
   */
  const handleFileChange = (event) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };
  
  /**
   * 언어 선택(select) 변경 시 호출되는 함수
   */
  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  /**
   * 'API 요청 보내기' 버튼 클릭 시 호출되는 비동기 함수
   */
  const handleApiCall = async () => {
    if (!selectedFile) {
      // alert는 사용자 경험에 좋지 않으므로 console에 로그를 남깁니다.
      console.warn("먼저 음성 파일을 선택해주세요.");
      setError("먼저 음성 파일을 선택해주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    setApiResponse(null);

    // Node.js 예제 코드를 참고하여 URL을 동적으로 생성
    const apiUrl = `/recog/v1/stt?lang=${language}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'x-ncp-apigw-api-key-id': process.env.REACT_APP_NCP_CLIENT_ID,
          'x-ncp-apigw-api-key': process.env.REACT_APP_NCP_CLIENT_SECRET,
          'Content-Type': 'application/octet-stream'
        },
        body: selectedFile
      });

      if (!response.ok) {
        // 서버에서 온 에러 메시지를 포함하여 에러 객체 생성
        const errorText = await response.text();
        throw new Error(`API 요청 실패: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      setApiResponse(data);

    } catch (e) {
      setError(e.message);
      console.error("API 요청 중 에러 발생:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Naver Clova Speech-to-Text (STT)</h1>
        <p>음성 파일을 선택하고 언어를 설정한 뒤, 버튼을 눌러 텍스트로 변환해 보세요.</p>
        
        <div className="control-panel">
          {/* 언어 선택 드롭다운 */}
          <select value={language} onChange={handleLanguageChange} className="language-select">
            <option value="Kor">한국어 (Kor)</option>
            <option value="Jpn">일본어 (Jpn)</option>
            <option value="Eng">영어 (Eng)</option>
            <option value="Chn">중국어 (Chn)</option>
          </select>
          
          {/* 파일 선택 input (accept 속성으로 오디오 파일만 받도록 개선) */}
          <input type="file" onChange={handleFileChange} className="file-input" accept="audio/*" />
        </div>

        {/* API 요청 버튼 */}
        <button onClick={handleApiCall} disabled={!selectedFile || loading} className="api-button">
          {loading ? '변환 중...' : '텍스트로 변환하기'}
        </button>

        {/* 응답 결과 표시 */}
        <div className="response-container">
          {error && <div className="error-message"><strong>에러:</strong> {error}</div>}
          {apiResponse && (
            <div>
              <h2>변환 결과:</h2>
              <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;

