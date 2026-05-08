import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useFormStore } from '../../hooks/useFormStore';
import FormHeader from '../../components/layout/FormHeader';
import StepIndicator from '../../components/ui/StepIndicator';
import SchoolForm from '../../components/forms/SchoolForm';
import StudentForm from '../../components/forms/StudentForm';
import AcademicForm from '../../components/forms/AcademicForm';
import ParentsForm from '../../components/forms/ParentsForm';
import { Colors } from '../../constants/theme';

export default function DataEntryScreen() {
  const {
    currentStep,
    setCurrentStep,
    school,
    student,
    academic,
    parents,
    updateSchool,
    updateStudent,
    updateAcademic,
    updateParents,
    resetForm,
  } = useFormStore();

  const goNext = () => setCurrentStep(currentStep + 1);
  const goBack = () => setCurrentStep(currentStep - 1);
  const handleSubmit = () => {
    resetForm();
    setCurrentStep(1);
  };

  const renderForm = () => {
    switch (currentStep) {
      case 1:
        return (
          <SchoolForm
            data={school}
            onChange={updateSchool}
            onNext={goNext}
          />
        );
      case 2:
        return (
          <StudentForm
            data={student}
            onChange={updateStudent}
            onNext={goNext}
            onBack={goBack}
          />
        );
      case 3:
        return (
          <AcademicForm
            data={academic}
            onChange={updateAcademic}
            onNext={goNext}
            onBack={goBack}
          />
        );
      case 4:
        return (
          <ParentsForm
            data={parents}
            onChange={updateParents}
            onBack={goBack}
            onSubmit={handleSubmit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FormHeader />
        <StepIndicator
          currentStep={currentStep}
          onStepPress={setCurrentStep}
        />
        <View style={styles.formContainer}>
          {renderForm()}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.gray100,
  },
  formContainer: {
    flex: 1,
  },
});
