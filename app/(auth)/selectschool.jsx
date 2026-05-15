// app/(auth)/selectschool.jsx
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, Animated,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useAppDispatch } from '../../hooks/useAppDispatch';
import { updateSchool }   from '../../store/slices/formSlice';
import { getSchoolById }  from '../../api/form/school';
import { Colors }         from '../../constants/theme';

export default function SelectSchoolScreen() {
  const router   = useRouter();
  const dispatch = useAppDispatch();

  const [code,    setCode]    = useState('');
  const [school,  setSchool]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue:  8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleSearch = async () => {
    const trimmed = code.trim();
    if (!trimmed) { setError('Please enter a school code'); shake(); return; }

    setError(''); setSchool(null); setLoading(true);
    try {
      // GET /schools/getSchoolById/:id → returns { school_code, school_name }
      const data = await getSchoolById(trimmed);
      if (!data) throw new Error('School not found');
      setSchool(data);
    } catch (err) {
      const msg =
        err?.response?.status === 404
          ? 'No school found with this code.'
          : err?.response?.data?.message || err?.message || 'Search failed';
      setError(msg);
      shake();
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!school) return;
    dispatch(updateSchool({
      schoolCode: school.school_code ?? '',
      schoolName: school.school_name ?? '',
    }));
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconWrap}>
                <Text style={styles.icon}>🏫</Text>
              </View>
              <Text style={styles.title}>Select Your School</Text>
              <Text style={styles.subtitle}>Enter your school code to continue</Text>
            </View>

            {/* Input */}
            <Animated.View style={[styles.inputRow, error ? styles.inputRowError : null, { transform: [{ translateX: shakeAnim }] }]}>
              <TextInput
                style={styles.input}
                placeholder="Enter school code"
                placeholderTextColor="#9CA3AF"
                value={code}
                onChangeText={(t) => { setCode(t); setError(''); setSchool(null); }}
                autoCapitalize="characters"
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />
              {code.length > 0 && (
                <TouchableOpacity onPress={() => { setCode(''); setSchool(null); setError(''); }}>
                  <Text style={styles.clearText}>✕</Text>
                </TouchableOpacity>
              )}
            </Animated.View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.searchBtn, loading && { opacity: 0.65 }]}
              onPress={handleSearch}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.searchBtnText}>Search</Text>}
            </TouchableOpacity>

            {/* Result — only school_name + school_code */}
            {school && (
              <View style={styles.card}>
                <View style={styles.cardStripe} />
                <View style={styles.cardBody}>
                  <Text style={styles.cardName}>{school.school_name}</Text>
                  <Text style={styles.cardCode}>Code: {school.school_code}</Text>
                </View>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
                  <Text style={styles.confirmBtnText}>✓ Confirm & Continue</Text>
                </TouchableOpacity>
              </View>
            )}

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const P = Colors.primary ?? '#1B6B4A';
const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#F0F7F4' },
  scroll:        { flexGrow: 1, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 40 },
  header:        { alignItems: 'center', marginBottom: 40 },
  iconWrap:      {
    width: 72, height: 72, borderRadius: 20, backgroundColor: P,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    shadowColor: P, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  icon:          { fontSize: 34 },
  title:         { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 6 },
  subtitle:      { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  inputRow:      {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, borderWidth: 1.5, borderColor: '#E5E7EB',
    paddingHorizontal: 16, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  inputRowError: { borderColor: '#EF4444' },
  input:         { flex: 1, height: 52, fontSize: 16, color: '#111827', letterSpacing: 0.5 },
  clearText:     { fontSize: 14, color: '#9CA3AF', padding: 6 },
  errorText:     { color: '#EF4444', fontSize: 13, marginBottom: 12, marginLeft: 2 },
  searchBtn:     {
    backgroundColor: P, borderRadius: 14, height: 52,
    justifyContent: 'center', alignItems: 'center', marginBottom: 28,
    shadowColor: P, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  searchBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  card:          {
    backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 6,
  },
  cardStripe:    { height: 6, backgroundColor: P },
  cardBody:      { padding: 20 },
  cardName:      { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 6 },
  cardCode:      { fontSize: 14, color: P, fontWeight: '700', letterSpacing: 0.5 },
  confirmBtn:    {
    backgroundColor: P, margin: 16, marginTop: 4,
    borderRadius: 12, height: 50, justifyContent: 'center', alignItems: 'center',
  },
  confirmBtnText:{ color: '#fff', fontSize: 15, fontWeight: '700' },
});