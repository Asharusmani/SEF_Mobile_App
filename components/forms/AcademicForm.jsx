import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import * as Yup from 'yup';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import ShiftSelector from '../ui/ShiftSelector';
import DocumentUpload from '../ui/DocumentUpload';
import PrimaryButton from '../ui/PrimaryButton';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { GRADES } from '../../constants/formData';

const MEDIUM_OPTIONS = ['Urdu', 'English', 'Sindhi', 'Both (Urdu + English)'];
const YES_NO = ['Yes', 'No'];

// DB field mapping (academic_info table):
// dateAdmission       DATEONLY    allowNull: true   → DD/MM/YYYY string on form
// academicYear        STRING(10)  allowNull: true
// classAdmitted       STRING(20)  allowNull: true
// currentClass        STRING(20)  allowNull: true  ← "grade" on form
// section             STRING(5)   allowNull: true
// shift               STRING(20)  allowNull: true
// medium              STRING(20)  allowNull: true
// studentStatus       STRING(30)  allowNull: true
// lastSchoolType      STRING(10)  allowNull: true  (SEF / NON-SEF)
// lastSchoolStudentId STRING(50)  allowNull: true  ← "rollNumber" on form
// lastSchoolName      STRING(200) allowNull: true  ← "previousSchool" on form
// lastClassAttended   STRING(20)  allowNull: true  ← "previousGrade" on form

const academicSchema = Yup.object({
  // Required fields (allowNull: false equivalent via form requirement)
  grade: Yup.string()
    .required('Please select current grade')
    .max(20, 'Grade value too long'),           // maps to currentClass STRING(20)

  rollNumber: Yup.string()
    .required('Roll number is required')
    .max(50, 'Roll number too long'),            // maps to lastSchoolStudentId STRING(50)

  admissionDate: Yup.string()
    .required('Admission date is required')
    .matches(/^\d{2}\/\d{2}\/\d{4}$/, 'Use format DD/MM/YYYY'), // maps to dateAdmission DATEONLY

  mediumOfInstruction: Yup.string()
    .required('Please select medium')
    .max(20, 'Medium value too long'),           // maps to medium STRING(20)

  // Optional fields
  previousSchool: Yup.string()
    .max(200, 'School name must be under 200 characters') // maps to lastSchoolName STRING(200)
    .nullable()
    .optional(),

  previousGrade: Yup.string()
    .max(20)                                     // maps to lastClassAttended STRING(20)
    .nullable()
    .optional(),

  disabilityStatus: Yup.string()
    .max(5)                                      // maps to hasDisability STRING(5)  e.g. "Yes"/"No"
    .nullable()
    .optional(),

  disabilityType: Yup.string()
    .nullable()
    .optional(),

  scholarshipStatus: Yup.string()
    .nullable()
    .optional(),
});

const AcademicForm = ({ data, onChange, onNext, onBack }) => {
  const [errors, setErrors] = useState({});

  const handleNext = async () => {
    try {
      await academicSchema.validate(data, { abortEarly: false });
      setErrors({});
      onNext();
    } catch (err) {
      const newErrors = {};
      err.inner.forEach((e) => { newErrors[e.path] = e.message; });
      setErrors(newErrors);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Card 1: Academic Info */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionTitle}>Academic Information</Text>
            <View style={styles.sectionLine} />
          </View>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <FormSelect
                label="Current Grade"
                required
                options={GRADES}
                value={data.grade}
                onChange={(v) => onChange({ grade: v })}
                error={errors.grade}
              />
            </View>
            <View style={styles.halfField}>
              <FormInput
                label="Roll Number"
                required
                value={data.rollNumber}
                onChangeText={(v) => onChange({ rollNumber: v })}
                placeholder="e.g. 2024-001"
                maxLength={50}
                error={errors.rollNumber}
              />
            </View>
          </View>

          <FormInput
            label="Admission Date"
            required
            value={data.admissionDate}
            onChangeText={(v) => onChange({ admissionDate: v })}
            placeholder="DD/MM/YYYY"
            keyboardType="numeric"
            maxLength={10}
            error={errors.admissionDate}
          />

          <FormSelect
            label="Medium of Instruction"
            required
            options={MEDIUM_OPTIONS}
            value={data.mediumOfInstruction}
            onChange={(v) => onChange({ mediumOfInstruction: v })}
            error={errors.mediumOfInstruction}
          />
        </View>

        {/* Card 2: Previous School */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionTitle}>Previous School</Text>
            <View style={styles.sectionLine} />
          </View>

          <FormInput
            label="Previous School Name"
            value={data.previousSchool}
            onChangeText={(v) => onChange({ previousSchool: v })}
            placeholder="If transferred, enter previous school"
            maxLength={200}
            hint="Leave blank if new admission"
          />

          <FormSelect
            label="Previous Grade Completed"
            options={GRADES}
            value={data.previousGrade}
            onChange={(v) => onChange({ previousGrade: v })}
          />
        </View>

        {/* Card 3: Additional Details */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionTitle}>Additional Details</Text>
            <View style={styles.sectionLine} />
          </View>

          <ShiftSelector
            label="Disability Status"
            options={YES_NO}
            value={data.disabilityStatus}
            onChange={(v) =>
              onChange({
                disabilityStatus: v,
                disabilityType: v === 'No' ? '' : data.disabilityType,
              })
            }
          />

          {data.disabilityStatus === 'Yes' && (
            <FormInput
              label="Disability Type"
              value={data.disabilityType}
              onChangeText={(v) => onChange({ disabilityType: v })}
              placeholder="e.g. Visual, Hearing, Physical"
            />
          )}

          <ShiftSelector
            label="Scholarship Status"
            options={YES_NO}
            value={data.scholarshipStatus}
            onChange={(v) => onChange({ scholarshipStatus: v })}
          />
        </View>

        {/* Card 4: Documents */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionTitle}>Required Documents</Text>
            <View style={styles.sectionLine} />
          </View>

          <DocumentUpload
            label="Birth Certificate"
            value={data.birthCertificate}
            onChange={(f) => onChange({ birthCertificate: f })}
            type="both"
            hint="PDF or image of birth certificate"
          />

          <DocumentUpload
            label="Transfer Certificate"
            value={data.transferCertificate}
            onChange={(f) => onChange({ transferCertificate: f })}
            type="both"
            hint="Required if transferred from another school"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title="← Back" onPress={onBack} variant="outline" style={styles.backBtn} />
        <PrimaryButton title="Continue →" onPress={handleNext} style={styles.nextBtn} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray100 },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.xl, paddingBottom: Spacing.lg },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 0.5,
    borderColor: Colors.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: Spacing.md,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl },
  sectionLine: { flex: 1, height: 1.5, backgroundColor: Colors.primary, opacity: 0.2 },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginHorizontal: Spacing.md,
  },
  row: { flexDirection: 'row', gap: Spacing.md },
  halfField: { flex: 1 },
  footer: {
    backgroundColor: Colors.white,
    padding: Spacing.xl,
    flexDirection: 'row',
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  backBtn: { flex: 1 },
  nextBtn: { flex: 2 },
});

export default AcademicForm;