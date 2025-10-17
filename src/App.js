// src/App.js
import React, { useEffect, useRef, useState } from "react";

// --- Web Speech API 훅 ---
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

function useBrowserSTT({ lang = "ko-KR", onPartial, onFinal } = {}) {
  const recRef = useRef(null);

  const start = () => {
    if (!SR) {
      alert("이 브라우저는 실시간 음성인식을 지원하지 않아요. (Chrome 권장)");
      return;
    }
    const rec = new SR();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e) => {
      const r = e.results[e.resultIndex];
      const txt = r[0].transcript;
      if (r.isFinal) onFinal?.(txt);
      else onPartial?.(txt);
    };
    rec.onerror = (e) => console.warn("SpeechRecognition error:", e.error);

    rec.start();
    recRef.current = rec;
  };

  const stop = () => {
    try { recRef.current?.stop(); } catch {}
    recRef.current = null;
  };

  return { start, stop };
}
// -------------------------

export default function App() {
  const [partial, setPartial] = useState("");
  const [finals, setFinals] = useState([]);

  const stt = useBrowserSTT({
    lang: "ko-KR",
    onPartial: (t) => setPartial(t),
    onFinal:   (t) => { setFinals((p) => [...p, t]); setPartial(""); },
  });

  // 간단 스타일
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      body { margin:0; font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,'Fira Sans','Droid Sans','Helvetica Neue',sans-serif; }
      .wrap { min-height:100vh; background:#282c34; color:#fff; display:flex; flex-direction:column; align-items:center; padding:40px 16px; }
      .title { font-size:40px; margin:0 0 16px; }
      .sub { opacity:.85; margin-bottom:32px; }
      .row { display:flex; gap:12px; margin:8px 0 16px; }
      .btn { background:#61dafb; color:#282c34; border:none; border-radius:8px; padding:10px 18px; font-weight:700; cursor:pointer; }
      .btn:hover { background:#21a1f1; }
      .box { width:min(800px,90%); background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.15); border-radius:10px; padding:12px; min-height:44px; }
      h3 { margin:16px 0 8px; }
      ul { width:min(800px,90%); text-align:left; line-height:1.6; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="wrap">
      <h1 className="title">실시간 STT 데모 (브라우저)</h1>
      <p className="sub">버튼을 누르고 말하면 partial은 즉시, final은 문장 확정 시 아래에 쌓여요.</p>

      <div className="row">
        <button className="btn" onClick={stt.start}>🎤 브라우저 STT 시작</button>
        <button className="btn" onClick={stt.stop}>⏹ 정지</button>
      </div>

      <h3>partial</h3>
      <div className="box">{partial || "여기에 실시간 partial 텍스트가 표시됩니다."}</div>

      <h3>final</h3>
      <ul>
        {finals.map((t, i) => <li key={i}>{t}</li>)}
      </ul>
    </div>
  );
}
