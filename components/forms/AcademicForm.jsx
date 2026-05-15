import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import * as Yup from 'yup';
import FormInput     from '../ui/FormInput';
import FormSelect    from '../ui/FormSelect';
import ShiftSelector from '../ui/ShiftSelector';
import DocumentUpload from '../ui/DocumentUpload';
import PrimaryButton from '../ui/PrimaryButton';
import CustomDatePicker from '../ui/CustomDatePicker';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
// GRADES_OPTIONS defined locally below — backend-aligned values

const THIS_YEAR = new Date().getFullYear();

// ── Dropdown options ──────────────────────────────────────────────────────────
// Backend expected formats:
const ACADEMIC_YEARS   = ['2024-2025', '2025-2026', '2026-2027', '2027-2028'];
const SECTION_OPTIONS  = ['A', 'B', 'C', 'D'];
const SHIFT_OPTIONS    = ['Morning', 'Evening'];
const MEDIUM_OPTIONS   = ['Sindhi', 'Urdu', 'English'];
const STATUS_OPTIONS   = ['Active', 'Inactive', 'Transferred', 'Dropped', 'Passed Out'];
const LAST_SCHOOL_TYPE = ['SEF', 'NON-SEF'];

// Backend ENUM: Katchi,One,Two,Three,Four,Five,Six,Seven,Eight,Nine,Ten
const GRADES_OPTIONS = [
  { label: 'Katchi', value: 'Katchi' },
  { label: 'One',    value: 'One'    },
  { label: 'Two',    value: 'Two'    },
  { label: 'Three',  value: 'Three'  },
  { label: 'Four',   value: 'Four'   },
  { label: 'Five',   value: 'Five'   },
  { label: 'Six',    value: 'Six'    },
  { label: 'Seven',  value: 'Seven'  },
  { label: 'Eight',  value: 'Eight'  },
  { label: 'Nine',   value: 'Nine'   },
  { label: 'Ten',    value: 'Ten'    },
];

// DD/MM/YYYY → DD-MM-YYYY (backend format)
const convertDateForBackend = (dateStr) => {
  if (!dateStr) return '';
  return dateStr.replace(/\//g, '-');
};

const academicSchema = Yup.object({
  admissionDate: Yup.string()
    .required('Admission date is required')
    .matches(/^\d{2}\/\d{2}\/\d{4}$/, 'Select admission date')
    .test('not-future', 'Admission date cannot be in the future', (value) => {
      if (!value) return true;
      const [dd, mm, yyyy] = value.split('/');
      const date = new Date(`${yyyy}-${mm}-${dd}`);
      return date <= new Date();
    }),

  academicYear: Yup.string()
    .required('Please select academic year')
    .matches(/^\d{4}-\d{4}$/, 'Academic year must be in format 2024-2025')
    .max(10),

  classAdmitted: Yup.string()
    .required('Please select class admitted')
    .max(20),

  currentClass: Yup.string()
    .required('Please select current class')
    .max(20),

  shift: Yup.string()
    .required('Please select shift')
    .max(20),

  studentStatus: Yup.string()
    .required('Please select student status')
    .max(30),

  section: Yup.string().max(5).nullable().optional(),
  mediumOfInstruction: Yup.string().max(20).nullable().optional(),
  lastSchoolType: Yup.string().max(10).nullable().optional(),

  lastSchoolStudentId: Yup.string()
    .max(50)
    .nullable()
    .when('lastSchoolType', {
      is: 'SEF',
      then: (s) => s.required('Student ID is required for SEF schools'),
    }),

  lastSchoolName:    Yup.string().max(200).nullable().optional(),
  lastClassAttended: Yup.string().max(20).nullable().optional(),
});

const AcademicForm = ({ data, onChange, onNext, onBack }) => {
  const [errors, setErrors]             = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  const isSEF    = data.lastSchoolType === 'SEF';
  const isNonSEF = data.lastSchoolType === 'NON-SEF';

  return (
    <View style={styles.container}>

      {/* Date Picker Modal */}
      <CustomDatePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={(dateStr) => {
          onChange({
            admissionDate:         dateStr,                        // display DD/MM/YYYY
            admissionDate_backend: convertDateForBackend(dateStr), // backend DD-MM-YYYY
          });
        }}
        initialValue={data.admissionDate}
        title="Date of Admission"
        maxYear={THIS_YEAR}  // future dates block
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Card 1: Academic Information ─────────────────────────────── */}
        <View style={styles.card}>
          <SectionHeader title="Academic Information" />

          {/* Row: Admission Date + Academic Year */}
          <View style={styles.row}>
            <View style={styles.halfField}>
              {/* Date of Admission — CustomDatePicker */}
              <Text style={styles.fieldLabel}>
                Date of Admission <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => setShowDatePicker(true)}
                style={[styles.dateBtn, errors.admissionDate && styles.dateBtnError]}
              >
                <Text style={[styles.dateBtnText, !data.admissionDate && styles.dateBtnPlaceholder]}>
                  {data.admissionDate || 'DD/MM/YYYY'}
                </Text>
                <Text style={styles.dateBtnIcon}>📅</Text>
              </TouchableOpacity>
              {errors.admissionDate
                ? <Text style={styles.fieldError}>{errors.admissionDate}</Text>
                : <Text style={styles.fieldHint}>Tap to open calendar</Text>
              }
            </View>

            <View style={styles.halfField}>
              <FormSelect
                label="Academic Year"
                required
                options={ACADEMIC_YEARS}
                value={data.academicYear}
                onChange={(v) => onChange({ academicYear: v })}
                error={errors.academicYear}
              />
            </View>
          </View>

          {/* Row: Class Admitted + Current Class */}
          <View style={styles.row}>
            <View style={styles.halfField}>
              <FormSelect
                label="Class Admitted"
                required
                options={GRADES_OPTIONS}
                value={data.classAdmitted}
                onChange={(v) => onChange({ classAdmitted: v })}
                error={errors.classAdmitted}
              />
            </View>
            <View style={styles.halfField}>
              <FormSelect
                label="Current Class"
                required
                options={GRADES_OPTIONS}
                value={data.currentClass}
                onChange={(v) => onChange({ currentClass: v })}
                error={errors.currentClass}
              />
            </View>
          </View>

          {/* Row: Section + Shift */}
          <View style={styles.row}>
            <View style={styles.halfField}>
              <FormSelect
                label="Section"
                options={SECTION_OPTIONS}
                value={data.section}
                onChange={(v) => onChange({ section: v })}
                error={errors.section}
              />
            </View>
            <View style={styles.halfField}>
              <FormSelect
                label="Shift"
                required
                options={SHIFT_OPTIONS}
                value={data.shift}
                onChange={(v) => onChange({ shift: v })}
                error={errors.shift}
              />
            </View>
          </View>

          {/* Row: Medium of Instruction + Student Status */}
          <View style={styles.row}>
            <View style={styles.halfField}>
              <FormSelect
                label="Medium of Instruction"
                options={MEDIUM_OPTIONS}
                value={data.mediumOfInstruction}
                onChange={(v) => onChange({ mediumOfInstruction: v })}
                error={errors.mediumOfInstruction}
              />
            </View>
            <View style={styles.halfField}>
              <FormSelect
                label="Student Status"
                required
                options={STATUS_OPTIONS}
                value={data.studentStatus}
                onChange={(v) => onChange({ studentStatus: v })}
                error={errors.studentStatus}
              />
            </View>
          </View>
        </View>

        {/* ── Card 2: Last School Information ──────────────────────────── */}
        <View style={styles.card}>
          <SectionHeader title="Last School Information" />

          <ShiftSelector
            label="Last School — Type"
            options={LAST_SCHOOL_TYPE}
            value={data.lastSchoolType}
            onChange={(v) =>
              onChange({
                lastSchoolType:      v,
                lastSchoolStudentId: '',
                lastSchoolName:      '',
                lastClassAttended:   '',
              })
            }
          />

          {isSEF && (
            <FormInput
              label="Last School — Student ID"
              required
              value={data.lastSchoolStudentId}
              onChangeText={(v) => onChange({ lastSchoolStudentId: v })}
              placeholder="Enter SEF student ID"
              maxLength={50}
              hint="Triggers auto-fill from SEF records"
              error={errors.lastSchoolStudentId}
            />
          )}

          {isNonSEF && (
            <>
              <FormInput
                label="Last School — Name"
                value={data.lastSchoolName}
                onChangeText={(v) => onChange({ lastSchoolName: v })}
                placeholder="Enter previous school name"
                maxLength={200}
                error={errors.lastSchoolName}
              />
              <FormSelect
                label="Last Class Attended"
                options={GRADES_OPTIONS}
                value={data.lastClassAttended}
                onChange={(v) => onChange({ lastClassAttended: v })}
                error={errors.lastClassAttended}
              />
            </>
          )}
        </View>

        {/* ── Card 3: Required Documents ───────────────────────────────── */}
        <View style={styles.card}>
          <SectionHeader title="Required Documents" />

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
        <PrimaryButton title="← Back"     onPress={onBack}     variant="outline" style={styles.backBtn} />
        <PrimaryButton title="Continue →" onPress={handleNext}                   style={styles.nextBtn} />
      </View>
    </View>
  );
};

// ── Small helper ──────────────────────────────────────────────────────────────
const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionLine} />
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionLine} />
  </View>
);

const C = {
  primary:  '#059669',
  danger:   '#ef4444',
  gray50:   '#f9fafb',
  gray100:  '#f3f4f6',
  gray200:  '#e5e7eb',
  gray400:  '#9ca3af',
  gray600:  '#4b5563',
  gray800:  '#1f2937',
  white:    '#ffffff',
};

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.gray100 },
  scroll:        { flex: 1 },
  scrollContent: { padding: Spacing.xl, paddingBottom: Spacing.lg },

  card: {
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.lg,
    padding:         Spacing.xl,
    borderWidth:     0.5,
    borderColor:     Colors.gray200,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.06,
    shadowRadius:    8,
    elevation:       3,
    marginBottom:    Spacing.md,
  },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl },
  sectionLine:   { flex: 1, height: 1.5, backgroundColor: Colors.primary, opacity: 0.2 },
  sectionTitle:  {
    fontSize: FontSize.xs, fontWeight: '700', color: Colors.primary,
    letterSpacing: 1.2, textTransform: 'uppercase', marginHorizontal: Spacing.md,
  },

  row:       { flexDirection: 'row', gap: Spacing.md },
  halfField: { flex: 1 },

  // Date picker button — same as StudentFormSectionB
  fieldLabel:         { fontSize: 13, fontWeight: '600', color: C.gray600, marginBottom: 6 },
  requiredStar:       { color: C.danger },
  dateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: C.gray200, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 11, backgroundColor: C.white,
  },
  dateBtnError:       { borderColor: C.danger },
  dateBtnText:        { fontSize: 14, color: C.gray800, flex: 1 },
  dateBtnPlaceholder: { color: C.gray400 },
  dateBtnIcon:        { fontSize: 16 },
  fieldHint:          { fontSize: 11, color: C.gray400, marginTop: 4 },
  fieldError:         { fontSize: 11, color: C.danger,  marginTop: 4 },

  footer: {
    backgroundColor: Colors.white,
    padding:         Spacing.xl,
    flexDirection:   'row',
    gap:             Spacing.md,
    borderTopWidth:  1,
    borderTopColor:  Colors.gray200,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: -3 },
    shadowOpacity:   0.06,
    shadowRadius:    8,
    elevation:       8,
  },
  backBtn: { flex: 1 },
  nextBtn: { flex: 2 },
});

export default AcademicForm;