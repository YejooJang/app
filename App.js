import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { db } from './firebase';
import { ref, set, onValue, update } from 'firebase/database';

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
      <View style={styles.center}>
        <Text style={styles.loadingText}>사용자 성향 및 옷장 데이터를 동기화 중입니다...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <View style={styles.header}>
          <Text style={styles.locationText}>📍 현재 위치: 부산광역시 남구</Text>
          <Text style={styles.weatherText}>기상청 기준: {weather.temp}°C ({weather.status})</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>나의 기본 체질 및 스타일 설정</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.btn, constitution === 'hot' && styles.activeBtn]} 
              onPress={() => handleSaveSetup('hot', '#스트릿')}
            >
              <Text style={constitution === 'hot' ? styles.activeText : styles.btnText}>🔥 더위 많이 탐</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.btn, constitution === 'cold' && styles.activeBtn]} 
              onPress={() => handleSaveSetup('cold', '#미니멀')}
            >
              <Text style={constitution === 'cold' ? styles.activeText : styles.btnText}>❄️ 추위 많이 탐</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subInfo}>현재 저장된 스타일: {selectedStyle}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>오늘 아침 나의 컨디션은?</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.condBtn, dailyCondition === 'cool' && {backgroundColor: '#e0f2fe', borderColor: '#38bdf8'}]} 
              onPress={() => handleConditionChange('cool')}
            >
              <Text style={[styles.condBtnText, dailyCondition === 'cool' && {color: '#0369a1'}]}>시원하게</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.condBtn, dailyCondition === 'normal' && {backgroundColor: '#f3f4f6', borderColor: '#d1d5db'}]} 
              onPress={() => handleConditionChange('normal')}
            >
              <Text style={[styles.condBtnText, dailyCondition === 'normal' && {color: '#374151'}]}>보통</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.condBtn, dailyCondition === 'warm' && {backgroundColor: '#fee2e2', borderColor: '#f87171'}]} 
              onPress={() => handleConditionChange('warm')}
            >
              <Text style={[styles.condBtnText, dailyCondition === 'warm' && {color: '#b91c1c'}]}>따뜻하게</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, styles.recommendCard]}>
          <Text style={styles.recommendTitle}>✨ 오늘 날씨 추천 OOTD 착장</Text>
          <Text style={styles.styleTag}>{selectedStyle} 스타일 조합 가이드</Text>
          <View style={styles.clothesList}>
            {recommendation.map((item, index) => (
              <View key={index} style={styles.clothesItem}>
                <Text style={styles.clothesText}>✔ {item}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scrollContainer: { padding: 20, maxWidth: 600, marginHorizontal: 'auto', width: '100%' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  loadingText: { fontSize: 14, color: '#6b7280' },
  header: { marginBottom: 20, alignItems: 'center', padding: 16, backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6' },
  locationText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  weatherText: { fontSize: 13, color: '#4b5563', marginTop: 4 },
  card: { backgroundColor: '#ffffff', padding: 18, borderRadius: 20, marginBottom: 16, borderStyle: 'solid', borderWidth: 1, borderColor: '#f3f4f6' },
  cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 14, color: '#1f2937' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  btn: { flex: 1, paddingVertical: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, alignItems: 'center', backgroundColor: '#ffffff' },
  activeBtn: { backgroundColor: '#1f2937', borderColor: '#1f2937' },
  btnText: { color: '#4b5563', fontSize: 13, fontWeight: '500' },
  activeText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  subInfo: { marginTop: 12, fontSize: 12, color: '#9ca3af', textAlign: 'right' },
  condBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb' },
  condBtnText: { fontSize: 13, fontWeight: '700', color: '#9ca3af' },
  recommendCard: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
  recommendTitle: { fontSize: 16, fontWeight: '800', color: '#ffffff', marginBottom: 4 },
  styleTag: { color: '#38bdf8', fontSize: 12, marginBottom: 16, fontWeight: '600' },
  clothesList: { gap: 8 },
  clothesItem: { backgroundColor: 'rgba(255, 255, 255, 0.07)', padding: 14, borderRadius: 10 },
  clothesText: { color: '#f8fafc', fontSize: 14, fontWeight: '600' }
});