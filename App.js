import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, update } from 'firebase/database';

// Vercel 환경 변수에서 파이어베이스 설정을 직접 안전하게 가져옵니다.
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: `https://${process.env.REACT_APP_FIREBASE_AUTH_DOMAIN?.split('.')[0]}-default-rtdb.firebaseio.com`,
  projectId: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN?.split('.')[0],
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// 파이어베이스 초기화
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

const USER_UID = "user_2026_demo";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [constitution, setConstitution] = useState('normal'); 
  const [selectedStyle, setSelectedStyle] = useState('#미니멀'); 
  const [dailyCondition, setDailyCondition] = useState('normal'); 
  const [weather, setWeather] = useState({ temp: 18, status: '맑음' }); 
  const [recommendation, setRecommendation] = useState([]); 

  useEffect(() => {
    setWeather({ temp: 19, status: '구름 조금' });

    const userRef = ref(db, `users/${USER_UID}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.constitution) setConstitution(data.constitution);
        if (data.selectedStyle) setSelectedStyle(data.selectedStyle);
        if (data.dailyCondition) setDailyCondition(data.dailyCondition);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firebase 로드 실패:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let computedTemp = weather.temp;
    
    if (constitution === 'hot') computedTemp += 2;  
    if (constitution === 'cold') computedTemp -= 2; 

    if (dailyCondition === 'cool') computedTemp += 3; 
    if (dailyCondition === 'warm') computedTemp -= 3; 

    let clothesResult = [];
    if (computedTemp >= 23) {
      clothesResult = ['린넨 셔츠', '반팔 티셔츠', '얇은 슬랙스', '반바지', '샌들'];
    } else if (computedTemp >= 17 && computedTemp < 23) {
      clothesResult = ['셔츠/블라우스', '가벼운 가디건', '맨투맨티', '데님 청바지', '스니커즈'];
    } else if (computedTemp >= 9 && computedTemp < 17) {
      clothesResult = ['트렌치 코트', '자켓', '니트웨어', '면바지', '로퍼'];
    } else {
      clothesResult = ['두꺼운 패딩/코트', '기모 맨투맨', '겨울 슬랙스', '목도리', '워커'];
    }
    
    setRecommendation(clothesResult);
  }, [weather.temp, constitution, dailyCondition]);

  const handleSaveSetup = (type, style) => {
    setConstitution(type);
    setSelectedStyle(style);
    set(ref(db, `users/${USER_UID}`), {
      constitution: type,
      selectedStyle: style,
      dailyCondition: 'normal'
    });
  };

  const handleConditionChange = (condition) => {
    setDailyCondition(condition);
    update(ref(db, `users/${USER_UID}`), {
      dailyCondition: condition
    });
  };

  if (loading) {
    return (
      <div style={styles.center}>
        <p style={styles.loadingText}>사용자 성향 및 옷장 데이터를 동기화 중입니다...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.scrollContainer}>
        
        <div style={styles.header}>
          <h2 style={styles.locationText}>📍 현재 위치: 부산광역시 남구</h2>
          <p style={styles.weatherText}>기상청 기준: {weather.temp}°C ({weather.status})</p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>나의 기본 체질 및 스타일 설정</h3>
          <div style={styles.buttonRow}>
            <button 
              style={{...styles.btn, ...(constitution === 'hot' ? styles.activeBtn : {})}} 
              onClick={() => handleSaveSetup('hot', '#스트릿')}
            >
              <span style={constitution === 'hot' ? styles.activeText : styles.btnText}>🔥 더위 많이 탐</span>
            </button>
            <button 
              style={{...styles.btn, ...(constitution === 'cold' ? styles.activeBtn : {})}} 
              onClick={() => handleSaveSetup('cold', '#미니멀')}
            >
              <span style={constitution === 'cold' ? styles.activeText : styles.btnText}>❄️ 추위 많이 탐</span>
            </button>
          </div>
          <p style={styles.subInfo}>현재 저장된 스타일: {selectedStyle}</p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>오늘 아침 나의 컨디션은?</h3>
          <div style={styles.buttonRow}>
            <button 
              style={{...styles.condBtn, ...(dailyCondition === 'cool' ? {backgroundColor: '#e0f2fe', borderColor: '#38bdf8'} : {})}} 
              onClick={() => handleConditionChange('cool')}
            >
              <span style={{...styles.condBtnText, ...(dailyCondition === 'cool' ? {color: '#0369a1'} : {})}}>시원하게</span>
            </button>
            <button 
              style={{...styles.condBtn, ...(dailyCondition === 'normal' ? {backgroundColor: '#f3f4f6', borderColor: '#d1d5db'} : {})}} 
              onClick={() => handleConditionChange('normal')}
            >
              <span style={{...styles.condBtnText, ...(dailyCondition === 'normal' ? {color: '#374151'} : {})}}>보통</span>
            </button>
            <button 
              style={{...styles.condBtn, ...(dailyCondition === 'warm' ? {backgroundColor: '#fee2e2', borderColor: '#f87171'} : {})}} 
              onClick={() => handleConditionChange('warm')}
            >
              <span style={{...styles.condBtnText, ...(dailyCondition === 'warm' ? {color: '#b91c1c'} : {})}}>따뜻하게</span>
            </button>
          </div>
        </div>

        <div style={{...styles.card, ...styles.recommendCard}}>
          <h3 style={styles.recommendTitle}>✨ 오늘 날씨 추천 OOTD 착장</h3>
          <p style={styles.styleTag}>{selectedStyle} 스타일 조합 가이드</p>
          <div style={styles.clothesList}>
            {recommendation.map((item, index) => (
              <div key={index} style={styles.clothesItem}>
                <p style={styles.clothesText}>✔ {item}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f9fafb', width: '100%', fontFamily: 'sans-serif', boxSizing: 'border-box', padding: '20px' },
  scrollContainer: { maxWidth: '600px', margin: '0 auto', width: '100%' },
  center: { display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  loadingText: { fontSize: '14px', color: '#6b7280' },
  header: { marginBottom: '20px', textAlign: 'center', padding: '16px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  locationText: { fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 },
  weatherText: { fontSize: '13px', color: '#4b5563', marginTop: '4px', marginBottom: 0 },
  card: { backgroundColor: '#ffffff', padding: '18px', borderRadius: '20px', marginBottom: '16px', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  cardTitle: { fontSize: '14px', fontWeight: '700', marginTop: 0, marginBottom: '14px', color: '#1f2937' },
  buttonRow: { display: 'flex', justifyContent: 'space-between', gap: '8px' },
  btn: { flex: 1, padding: '12px 0', border: '1px solid #e5e7eb', borderRadius: '12px', backgroundColor: '#ffffff', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  activeBtn: { backgroundColor: '#1f2937', borderColor: '#1f2937' },
  btnText: { color: '#4b5563', fontSize: '13px', fontWeight: '500' },
  activeText: { color: '#ffffff', fontSize: '13px', fontWeight: '600' },
  subInfo: { marginTop: '12px', marginBottom: 0, fontSize: '12px', color: '#9ca3af', textAlign: 'right' },
  condBtn: { flex: 1, padding: '14px 0', borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  condBtnText: { fontSize: '13px', fontWeight: '700', color: '#9ca3af' },
  recommendCard: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
  recommendTitle: { fontSize: '16px', fontWeight: '800', color: '#ffffff', marginTop: 0, marginBottom: '4px' },
  styleTag: { color: '#38bdf8', fontSize: '12px', marginTop: 0, marginBottom: '16px', fontWeight: '600' },
  clothesList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  clothesItem: { backgroundColor: 'rgba(255, 255, 255, 0.07)', padding: '14px', borderRadius: '10px' },
  clothesText: { color: '#f8fafc', fontSize: '14px', fontWeight: '600', margin: 0 }
};
