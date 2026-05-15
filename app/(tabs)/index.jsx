// app/(tabs)/index.jsx
import React, { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

import { useAppDispatch }   from '../../hooks/useAppDispatch';
import { useAppSelector }   from '../../hooks/useAppSelector';
import {
  setCurrentStep,
  setCreatedStudentDbId,
  updateSchool,
  updateStudent,
  updateAcademic,
  updateParents,
  resetForm,
} from '../../store/slices/formSlice';

import FormHeader    from '../../components/layout/FormHeader';
import StepIndicator from '../../components/ui/StepIndicator';
import SchoolForm    from '../../components/forms/SchoolForm';
import StudentForm   from '../../components/forms/StudentForm';
import AcademicForm  from '../../components/forms/AcademicForm';
import ParentsForm   from '../../components/forms/ParentsForm';
import { Colors }    from '../../constants/theme';

import { createStudent, createAcademic } from '../../api/students';
import { createParent }                  from '../../api/parents/parents';       // ← NEW
import { buildStudentPayload }           from '../../constants/studentData';
import { buildAcademicPayload }          from '../../constants/academicData';

export default function DataEntryScreen() {
  const dispatch = useAppDispatch();

  const currentStep        = useAppSelector((s) => s.form.currentStep);
  const createdStudentDbId = useAppSelector((s) => s.form.createdStudentDbId);
  const school             = useAppSelector((s) => s.form.school);
  const student            = useAppSelector((s) => s.form.student);
  const academic           = useAppSelector((s) => s.form.academic);
  const parents            = useAppSelector((s) => s.form.parents);

  const [loading, setLoading] = useState(false);

  // ── Step 1: School ──────────────────────────────────────────────────────────
  const handleSchoolNext = () => dispatch(setCurrentStep(2));

  // ── Step 2: Student ─────────────────────────────────────────────────────────
  const handleStudentNext = async () => {
    console.log('=== STUDENT SUBMIT ===');
    setLoading(true);
    try {
      const payload = buildStudentPayload({ ...student, school_code: school.schoolCode });
      console.log('=== STUDENT PAYLOAD ===', JSON.stringify(payload, null, 2));
      const res = await createStudent(payload, student.profilePhoto);
      console.log('=== STUDENT SUCCESS ===', res);
      const dbId = res?.data?.studentId ?? null;
      dispatch(setCreatedStudentDbId(dbId));
      console.log('=== DB ID STORED IN REDUX ===', dbId);
      dispatch(setCurrentStep(3));
    } catch (err) {
      console.log('=== STUDENT ERROR ===', err?.response?.status, JSON.stringify(err?.response?.data));
      Alert.alert('Student Error', err?.response?.data?.message || err?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Academic ────────────────────────────────────────────────────────
  const handleAcademicNext = async () => {
    console.log('=== ACADEMIC SUBMIT ===');
    if (!createdStudentDbId) {
      Alert.alert('Error', 'Student ID missing — please go back and resubmit student info');
      return;
    }
    setLoading(true);
    try {
      const payload = buildAcademicPayload(academic, createdStudentDbId);
      console.log('=== ACADEMIC PAYLOAD ===', JSON.stringify(payload, null, 2));
      const res = await createAcademic(payload);
      console.log('=== ACADEMIC SUCCESS ===', res);
      dispatch(setCurrentStep(4));
    } catch (err) {
      console.log('=== ACADEMIC ERROR ===', err?.response?.status, JSON.stringify(err?.response?.data));
      Alert.alert('Academic Error', err?.response?.data?.message || err?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 4: Parents (final submit) ─────────────────────────────────────────
  const handleFinalSubmit = async () => {
    console.log('=== PARENTS SUBMIT ===');
    if (!createdStudentDbId) {
      Alert.alert('Error', 'Student ID missing — please go back and resubmit student info');
      return;
    }
    setLoading(true);
    try {
      console.log('=== PARENTS PAYLOAD (pre-build) ===', JSON.stringify(parents, null, 2));
      const res = await createParent(parents, createdStudentDbId);
      console.log('=== PARENTS SUCCESS ===', res);

      // All 4 steps done — reset and celebrate
      dispatch(resetForm());
      Alert.alert('✅ Success', 'Student registered successfully!');
    } catch (err) {
      console.log('=== PARENTS ERROR ===', err?.response?.status, JSON.stringify(err?.response?.data));
      Alert.alert('Parents Error', err?.response?.data?.message || err?.message || 'Failed to save parent info');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => dispatch(setCurrentStep(currentStep - 1));

  const renderForm = () => {
    switch (currentStep) {
      case 1: return <SchoolForm   data={school}   onChange={(d) => dispatch(updateSchool(d))}   onNext={handleSchoolNext} />;
      case 2: return <StudentForm  data={student}  onChange={(d) => dispatch(updateStudent(d))}  onNext={handleStudentNext}  onBack={goBack} />;
      case 3: return <AcademicForm data={academic} onChange={(d) => dispatch(updateAcademic(d))} onNext={handleAcademicNext} onBack={goBack} />;
      case 4: return (
        <ParentsForm
          data={parents}
          onChange={(d) => dispatch(updateParents(d))}
          onBack={goBack}
          onSubmit={handleFinalSubmit}   // ← now calls the real API
        />
      );
      default: return null;
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeTop} edges={['top']} />
      <View style={styles.container}>
        <FormHeader />
        <StepIndicator currentStep={currentStep} onStepPress={(s) => dispatch(setCurrentStep(s))} />
        <View style={styles.formContainer}>{renderForm()}</View>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}
      </View>
      <SafeAreaView style={styles.safeBottom} edges={['bottom']} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeTop:       { backgroundColor: Colors.primary },
  safeBottom:    { backgroundColor: Colors.white },
  container:     { flex: 1, backgroundColor: Colors.gray100 },
  formContainer: { flex: 1 },
  loadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center', alignItems: 'center', zIndex: 999,
  },
});