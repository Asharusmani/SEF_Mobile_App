// app/(tabs)/records.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Modal, StatusBar,
  TextInput, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import {
  setCurrentStep, setCreatedStudentDbId,
  updateSchool, updateStudent, updateAcademic, updateParents, resetForm,
} from '../../store/slices/formSlice';

import FormHeader    from '../../components/layout/FormHeader';
import StepIndicator from '../../components/ui/StepIndicator';
import SchoolForm    from '../../components/forms/SchoolForm';
import StudentForm   from '../../components/forms/StudentForm';
import AcademicForm  from '../../components/forms/AcademicForm';
import ParentsForm   from '../../components/forms/ParentsForm';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

import { createStudent, createAcademic, getAllStudents } from '../../api/students';
import { createParent }         from '../../api/parents/parents';
import { buildStudentPayload }  from '../../constants/studentData';
import { buildAcademicPayload } from '../../constants/academicData';

const PAGE_LIMIT = 10;

const AVATAR_COLORS = ['#2563EB', '#7C3AED', '#059669', '#DC2626', '#D97706', '#0891B2'];
const avatarColor = (name = '') =>
  AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ onAdd }) => (
  <View style={styles.emptyWrap}>
    <View style={styles.emptyIcon}>
      <Text style={styles.emptyEmoji}>🎒</Text>
    </View>
    <Text style={styles.emptyTitle}>No Students Yet</Text>
    <Text style={styles.emptyBody}>
      Tap the button below to register your first student.
    </Text>
    <TouchableOpacity style={styles.emptyBtn} onPress={onAdd} activeOpacity={0.85}>
      <Text style={styles.emptyBtnText}>+ Add First Student</Text>
    </TouchableOpacity>
  </View>
);

// ─── Student card ─────────────────────────────────────────────────────────────
const StudentCard = ({ item }) => {
  const name  = item.name_of_student || '—';
  const grNo  = item.gr_no           || '—';
  const cls   =
    item.studentAcademic?.current_class ||
    item.academic?.current_class        ||
    item.current_class                  ||
    '—';
  const school =
    item.school?.schoolName  ||
    item.school?.school_name ||
    '—';
  const color = avatarColor(name);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.75}>
      <View style={[styles.cardAccent, { backgroundColor: color }]} />
      <View style={[styles.avatar, { backgroundColor: color + '18' }]}>
        <Text style={[styles.avatarText, { color }]}>
          {name[0]?.toUpperCase()}
        </Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.studentName} numberOfLines={1}>{name}</Text>
        <View style={styles.badgeRow}>
          {cls !== '—' && (
            <View style={[styles.badge, { backgroundColor: color + '18' }]}>
              <Text style={[styles.badgeText, { color }]}>Class {cls}</Text>
            </View>
          )}
          <Text style={styles.grText}>GR# {grNo}</Text>
        </View>
        <Text style={styles.schoolText} numberOfLines={1}>{school}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function RecordsScreen() {
  const dispatch = useAppDispatch();

  const [students,    setStudents]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error,       setError]       = useState(null);
  const [search,      setSearch]      = useState('');
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [total,       setTotal]       = useState(0);

  const searchTimer   = useRef(null);
  const isFirstSearch = useRef(true);
  const schoolCodeRef = useRef('');

  const [showForm,    setShowForm]    = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const currentStep        = useAppSelector((s) => s.form.currentStep);
  const createdStudentDbId = useAppSelector((s) => s.form.createdStudentDbId);
  const school             = useAppSelector((s) => s.form.school);
  const student            = useAppSelector((s) => s.form.student);
  const academic           = useAppSelector((s) => s.form.academic);
  const parents            = useAppSelector((s) => s.form.parents);

  // ── School code — Redux + AsyncStorage dono se lo ─────────────────────────
useEffect(() => {
  if (!school?.schoolCode) return;               // Redux mein code nahi hai to kuch mat karo
  schoolCodeRef.current = school.schoolCode;
  AsyncStorage.setItem('lastSchoolCode', school.schoolCode).catch(() => {});
  fetchPage({ pageNum: 1, searchVal: '' });       // ← Redux code aate hi fetch karo
}, [school?.schoolCode]); 

  // ── Initial load — AsyncStorage se school code lo ─────────────────────────
useEffect(() => {
  if (school?.schoolCode) return;                // Redux mein hai to yeh useEffect kuch na kare
  const init = async () => {
    try {
      const saved = await AsyncStorage.getItem('lastSchoolCode');
      if (saved) {
        schoolCodeRef.current = saved;
        fetchPage({ pageNum: 1 });
      } else {
        setLoading(false);                       // koi code nahi — loading band karo
      }
    } catch {
      setLoading(false);
    }
  };
  init();
}, []);  

  // ── Core fetch ─────────────────────────────────────────────────────────────
  const fetchPage = useCallback(async ({
    pageNum   = 1,
    searchVal = search,
    isRefresh = false,
  } = {}) => {
    const code = schoolCodeRef.current;

    console.log('=== FETCH PAGE ===', { code, pageNum, searchVal });

    if (!code) {
      setLoading(false);
      return;
    }

    try {
      if (isRefresh || pageNum === 1) {
        isRefresh ? setRefreshing(true) : setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const params = {
        page:  pageNum,
        limit: PAGE_LIMIT,
        ...(searchVal.trim() && { search: searchVal.trim() }),
      };

      const res = await getAllStudents(code, params);
      console.log('=== RESPONSE ===', JSON.stringify(res, null, 2));

      const incoming = Array.isArray(res?.data) ? res.data : [];
      const tp       = res?.totalPages ?? 1;
      const tot      = res?.total      ?? incoming.length;

      setTotalPages(tp);
      setTotal(tot);
      setPage(pageNum);
      setStudents((prev) => pageNum === 1 ? incoming : [...prev, ...incoming]);
    } catch (err) {
      console.log('=== FETCH ERROR ===', err?.response?.data || err?.message);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load students',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [search]);

  // ── Search debounce ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isFirstSearch.current) { isFirstSearch.current = false; return; }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetchPage({ pageNum: 1, searchVal: search });
    }, 500);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  // ── Infinite scroll ────────────────────────────────────────────────────────
  const handleEndReached = () => {
    if (loadingMore || loading || page >= totalPages) return;
    fetchPage({ pageNum: page + 1 });
  };

  // ── Pull to refresh ────────────────────────────────────────────────────────
  const handleRefresh = () => {
    fetchPage({ pageNum: 1, searchVal: search, isRefresh: true });
  };

  // ── Form open / close ──────────────────────────────────────────────────────
  const openForm = () => {
    dispatch(resetForm());
    setShowForm(true);
  };

  const closeForm = () => {
    dispatch(resetForm());
    setShowForm(false);
  };

  // ── Step handlers ──────────────────────────────────────────────────────────
  const handleSchoolNext = () => dispatch(setCurrentStep(2));

  const handleStudentNext = async () => {
    setFormLoading(true);
    try {
      const payload = buildStudentPayload({
        ...student,
        school_code: school.schoolCode,
      });
      const res  = await createStudent(payload, student.profilePhoto);
      const dbId = res?.data?.studentId ?? null;
      dispatch(setCreatedStudentDbId(dbId));
      dispatch(setCurrentStep(3));
    } catch (err) {
      Alert.alert(
        'Student Error',
        err?.response?.data?.message || err?.message || 'Failed to save student',
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleAcademicNext = async () => {
    if (!createdStudentDbId) {
      Alert.alert('Error', 'Student ID missing — go back and resubmit student info');
      return;
    }
    setFormLoading(true);
    try {
      const payload = buildAcademicPayload(academic, createdStudentDbId);
      await createAcademic(payload);
      dispatch(setCurrentStep(4));
    } catch (err) {
      Alert.alert(
        'Academic Error',
        err?.response?.data?.message || err?.message || 'Failed to save academic info',
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!createdStudentDbId) {
      Alert.alert('Error', 'Student ID missing');
      return;
    }
    setFormLoading(true);
    try {
      await createParent(parents, createdStudentDbId);
      dispatch(resetForm());
      setShowForm(false);
      fetchPage({ pageNum: 1, searchVal: search });
      Alert.alert('✅ Success', 'Student registered successfully!');
    } catch (err) {
      Alert.alert(
        'Parents Error',
        err?.response?.data?.message || err?.message || 'Failed to save parent info',
      );
    } finally {
      setFormLoading(false);
    }
  };

  const goBack = () => dispatch(setCurrentStep(currentStep - 1));

  // ── Form renderer ──────────────────────────────────────────────────────────
  const renderForm = () => {
    switch (currentStep) {
      case 1:
        return (
          <SchoolForm
            data={school}
            onChange={(d) => dispatch(updateSchool(d))}
            onNext={handleSchoolNext}
          />
        );
      case 2:
        return (
          <StudentForm
            data={student}
            onChange={(d) => dispatch(updateStudent(d))}
            onNext={handleStudentNext}
            onBack={goBack}
          />
        );
      case 3:
        return (
          <AcademicForm
            data={academic}
            onChange={(d) => dispatch(updateAcademic(d))}
            onNext={handleAcademicNext}
            onBack={goBack}
          />
        );
      case 4:
        return (
          <ParentsForm
            data={parents}
            onChange={(d) => dispatch(updateParents(d))}
            onBack={goBack}
            onSubmit={handleFinalSubmit}
          />
        );
      default:
        return null;
    }
  };

  // ── Footer loader ──────────────────────────────────────────────────────────
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.footerLoaderText}>Loading more...</Text>
      </View>
    );
  };

  // ── Content renderer ───────────────────────────────────────────────────────
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading students...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerWrap}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorBody}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => fetchPage({ pageNum: 1 })}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={students}
        keyExtractor={(item, i) => String(item.id ?? item.student_id ?? i)}
        contentContainerStyle={[
          styles.list,
          students.length === 0 && styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={<EmptyState onAdd={openForm} />}
        ListFooterComponent={renderFooter}
        renderItem={({ item }) => <StudentCard item={item} />}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
      />
    );
  };

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeTop} edges={['top']} />
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Student Records</Text>
            <Text style={styles.headerSub}>
              {loading ? '...' : `${total} student${total !== 1 ? 's' : ''}`}
            </Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={openForm} activeOpacity={0.85}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name or GR number..."
            placeholderTextColor={Colors.gray400 ?? '#9CA3AF'}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {renderContent()}

        {!loading && students.length > 0 && (
          <TouchableOpacity style={styles.fab} onPress={openForm} activeOpacity={0.85}>
            <Text style={styles.fabText}>＋</Text>
          </TouchableOpacity>
        )}
      </View>
      <SafeAreaView style={styles.safeBottom} edges={['bottom']} />

      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeForm}
      >
        <SafeAreaProvider>
          <SafeAreaView style={styles.safeTop} edges={['top']} />
          <View style={styles.container}>
            <View style={styles.modalTopBar}>
              <FormHeader />
              <TouchableOpacity style={styles.closeFormBtn} onPress={closeForm}>
                <Text style={styles.closeFormText}>✕</Text>
              </TouchableOpacity>
            </View>
            <StepIndicator
              currentStep={currentStep}
              onStepPress={(s) => dispatch(setCurrentStep(s))}
            />
            <View style={styles.formContainer}>{renderForm()}</View>
            {formLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={Colors.primary} />
              </View>
            )}
          </View>
          <SafeAreaView style={styles.safeBottom} edges={['bottom']} />
        </SafeAreaProvider>
      </Modal>
    </SafeAreaProvider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeTop:    { backgroundColor: Colors.primary },
  safeBottom: { backgroundColor: Colors.white },
  container:  { flex: 1, backgroundColor: Colors.gray100 ?? '#F3F4F6' },
  header: {
    backgroundColor:   Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical:   Spacing.lg,
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
  },
  headerTitle: { fontSize: FontSize.xl ?? 20, fontWeight: '800', color: '#fff' },
  headerSub:   { fontSize: FontSize.xs ?? 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  addBtn: {
    backgroundColor:   'rgba(255,255,255,0.2)',
    borderRadius:      BorderRadius.md ?? 10,
    paddingHorizontal: Spacing.lg,
    paddingVertical:   Spacing.sm,
    borderWidth:       1,
    borderColor:       'rgba(255,255,255,0.35)',
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm ?? 14 },
  searchWrap: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   '#fff',
    marginHorizontal:  Spacing.lg,
    marginTop:         Spacing.lg,
    marginBottom:      Spacing.sm,
    borderRadius:      BorderRadius.md ?? 10,
    paddingHorizontal: Spacing.md,
    borderWidth:       1,
    borderColor:       Colors.gray200 ?? '#E5E7EB',
    shadowColor:       '#000',
    shadowOffset:      { width: 0, height: 1 },
    shadowOpacity:     0.05,
    shadowRadius:      4,
    elevation:         2,
  },
  searchIcon:  { fontSize: 14, marginRight: Spacing.sm },
  searchInput: { flex: 1, height: 44, fontSize: FontSize.sm ?? 14, color: Colors.black ?? '#111' },
  clearIcon:   { fontSize: 13, color: Colors.gray400 ?? '#9CA3AF', padding: 4 },
  list:        { padding: Spacing.lg, paddingTop: Spacing.sm },
  listEmpty:   { flex: 1, justifyContent: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius:    BorderRadius.lg ?? 14,
    flexDirection:   'row',
    alignItems:      'center',
    overflow:        'hidden',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.07,
    shadowRadius:    8,
    elevation:       3,
  },
  cardAccent:  { width: 4, alignSelf: 'stretch' },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center', margin: Spacing.md,
  },
  avatarText:  { fontSize: FontSize.lg ?? 18, fontWeight: '800' },
  cardContent: { flex: 1, paddingVertical: Spacing.md, paddingRight: Spacing.sm },
  studentName: { fontSize: FontSize.md ?? 15, fontWeight: '700', color: Colors.black ?? '#111' },
  badgeRow:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 3 },
  badge:       { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText:   { fontSize: FontSize.xs ?? 11, fontWeight: '700' },
  grText:      { fontSize: FontSize.xs ?? 11, color: Colors.gray500 ?? '#6B7280' },
  schoolText:  { fontSize: FontSize.xs ?? 11, color: Colors.gray400 ?? '#9CA3AF', marginTop: 2 },
  chevron:     { fontSize: 22, color: Colors.gray300 ?? '#D1D5DB', marginHorizontal: Spacing.md },
  emptyWrap:   { alignItems: 'center', padding: Spacing.xl },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primaryLight ?? '#EFF6FF',
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg,
  },
  emptyEmoji:   { fontSize: 36 },
  emptyTitle:   { fontSize: FontSize.lg ?? 18, fontWeight: '800', color: Colors.black ?? '#111', marginBottom: Spacing.sm },
  emptyBody:    { fontSize: FontSize.sm ?? 14, color: Colors.gray500 ?? '#6B7280', textAlign: 'center', marginBottom: Spacing.xl },
  emptyBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md ?? 10,
    paddingHorizontal: Spacing.xxl ?? 32, paddingVertical: Spacing.md,
  },
  emptyBtnText:     { color: '#fff', fontWeight: '700', fontSize: FontSize.md ?? 15 },
  centerWrap:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  loadingText:      { marginTop: Spacing.md, color: Colors.gray500 ?? '#6B7280', fontSize: FontSize.sm ?? 14 },
  errorEmoji:       { fontSize: 40, marginBottom: Spacing.md },
  errorTitle:       { fontSize: FontSize.lg ?? 18, fontWeight: '700', color: Colors.black ?? '#111', marginBottom: Spacing.sm },
  errorBody:        { fontSize: FontSize.sm ?? 14, color: Colors.gray500 ?? '#6B7280', textAlign: 'center', marginBottom: Spacing.xl },
  retryBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md ?? 10,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
  },
  retryText:        { color: '#fff', fontWeight: '700', fontSize: FontSize.md ?? 15 },
  footerLoader:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  footerLoaderText: { fontSize: FontSize.sm ?? 14, color: Colors.gray500 ?? '#6B7280' },
  fab: {
    position: 'absolute', right: Spacing.xl, bottom: Spacing.xl,
    width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  fabText:        { fontSize: 26, color: '#fff', lineHeight: 30 },
  modalTopBar:    { position: 'relative' },
  closeFormBtn: {
    position: 'absolute', right: Spacing.lg, top: 0, bottom: 0,
    justifyContent: 'center', paddingHorizontal: Spacing.md, zIndex: 10,
  },
  closeFormText:  { fontSize: 16, color: '#fff', fontWeight: '700' },
  formContainer:  { flex: 1 },
  loadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center', alignItems: 'center', zIndex: 999,
  },
});