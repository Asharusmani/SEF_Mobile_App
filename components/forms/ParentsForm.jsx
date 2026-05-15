// components/forms/ParentsForm.jsx
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Yup from 'yup';
import { BorderRadius, Colors, FontSize, Spacing } from '../../constants/theme';
import DocumentUpload from '../ui/DocumentUpload';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import PrimaryButton from '../ui/PrimaryButton';

// ── Dropdown options ──────────────────────────────────────────────────────────
// Values must match backend validator exactly (guardian_occupation enum)
const OCCUPATIONS = [
  'Government Employee',
  'Private Employee',
  'Self Employed',
  'Farmer',
  'Unemployed',
  'Other',
];

const QUALIFICATIONS = [
  'Illiterate', 'Primary', 'Middle', 'Matric',
  'Intermediate', 'Graduation', 'Post-Grad',
];

// ── Regex helpers ─────────────────────────────────────────────────────────────
const cnicRegex   = /^\d{5}-\d{7}-\d{1}$/;
const mobileRegex = /^03\d{9}$/;

// ── Auto-format helpers ───────────────────────────────────────────────────────

/**
 * formatCnic
 * - Strips everything except digits
 * - Hard-caps at 13 digits (so user can never type more)
 * - Inserts dashes: XXXXX-XXXXXXX-X
 *
 * Examples:
 *   "4220112345671"  → "42201-1234567-1"
 *   "42201123"       → "42201-123"
 *   "422011234567"   → "42201-1234567"   (12 digits, dash2 not yet shown)
 */
const formatCnic = (raw = '') => {
  // 1. Keep only digits, cap at 13
  const digits = raw.replace(/\D/g, '').slice(0, 13);

  // 2. Build formatted string with dashes
  if (digits.length <= 5)  return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
};

/**
 * formatPhone
 * - Strips everything except digits
 * - Hard-caps at 11 digits (03XXXXXXXXX)
 *
 * We don't add dashes for phone — just enforce numeric + 11-digit cap.
 * If you want the "03XX-XXXXXXX" display format, swap the return line.
 */
const formatPhone = (raw = '') => {
  return raw.replace(/\D/g, '').slice(0, 11);
};

// ── Validation schema ─────────────────────────────────────────────────────────
const parentsSchema = Yup.object({
  fatherName: Yup.string()
    .required('Father / Guardian name is required')
    .max(100, 'Name must be under 100 characters'),

  fatherContact: Yup.string()
    .required("Father's mobile is required")
    .matches(mobileRegex, 'Enter valid number e.g. 03001234567')
    .max(20),

  guardianRelationship: Yup.string().max(50).nullable().optional(),

  fatherCnic: Yup.string()
    .matches(cnicRegex, 'Format: XXXXX-XXXXXXX-X')
    .max(20)
    .nullable()
    .transform((v) => (v === '' ? null : v))
    .optional(),

  fatherEmail: Yup.string()
    .email('Enter a valid email address')
    .max(150)
    .nullable()
    .transform((v) => (v === '' ? null : v))
    .optional(),

  fatherOccupation:    Yup.string().max(50).nullable().optional(),
  fatherQualification: Yup.string().max(50).nullable().optional(),

  motherName: Yup.string()
    .max(100, 'Name must be under 100 characters')
    .nullable()
    .optional(),

  motherCnic: Yup.string()
    .matches(cnicRegex, 'Format: XXXXX-XXXXXXX-X')
    .max(20)
    .nullable()
    .transform((v) => (v === '' ? null : v))
    .optional(),

  motherContact: Yup.string()
    .matches(mobileRegex, 'Enter valid number e.g. 03001234567')
    .max(20)
    .nullable()
    .transform((v) => (v === '' ? null : v))
    .optional(),

  motherOccupation: Yup.string().max(50).nullable().optional(),
  motherEducation:  Yup.string().max(50).nullable().optional(),

  guardianName:    Yup.string().max(150).nullable().optional(),
  guardianContact: Yup.string().max(20).nullable().optional(),

  monthlyIncome: Yup.string()
    .nullable()
    .transform((v) => (v === '' ? null : v))
    .test('is-number', 'Enter a valid amount in PKR', (v) => !v || !isNaN(Number(v)))
    .optional(),
});

// ── Component ─────────────────────────────────────────────────────────────────
/**
 * ParentsForm
 *
 * Responsibilities:
 *  1. Render all parent/guardian fields.
 *  2. Run Yup validation on "Submit" press.
 *  3. If valid → call onSubmit() which is handled by the parent screen
 *     (DataEntryScreen) and hits POST /student-parent/create.
 *  4. Loading state & global overlay are managed by DataEntryScreen;
 *     the Submit button shows a local spinner only while the parent
 *     prop hasn't resolved yet (guarded by `submitting` state).
 */
const ParentsForm = ({ data, onChange, onBack, onSubmit }) => {
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      // Validate against current data
      await parentsSchema.validate(data, { abortEarly: false });
      setErrors({});

      // Delegate the actual API call to DataEntryScreen
      setSubmitting(true);
      await onSubmit();           // onSubmit is now async in index.jsx
    } catch (err) {
      if (err.name === 'ValidationError') {
        const newErrors = {};
        err.inner.forEach((e) => { newErrors[e.path] = e.message; });
        setErrors(newErrors);
      }
      // API errors are handled (Alert) inside DataEntryScreen — no need to re-throw
    } finally {
      setSubmitting(false);
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
        {/* ── Card 1: Father Details ───────────────────────────────── */}
        <View style={styles.card}>
          <SectionHeader title="Father Details" />

          <FormInput
            label="Father / Guardian Name"
            required
            value={data.fatherName}
            onChangeText={(v) => onChange({ fatherName: v })}
            placeholder="e.g. Muhammad Ali Khan"
            maxLength={100}
            error={errors.fatherName}
          />

          <FormInput
            label="Relation (if Guardian)"
            value={data.guardianRelationship}
            onChangeText={(v) => onChange({ guardianRelationship: v })}
            placeholder="e.g. Grand Father, Uncle"
            maxLength={50}
            hint="Leave blank if Father is guardian"
          />

          <FormInput
            label="Father CNIC"
            value={data.fatherCnic}
            onChangeText={(v) => onChange({ fatherCnic: formatCnic(v) })}
            placeholder="XXXXX-XXXXXXX-X"
            keyboardType="numeric"
            maxLength={15}
            error={errors.fatherCnic}
          />

          <FormInput
            label="Father Email"
            value={data.fatherEmail}
            onChangeText={(v) => onChange({ fatherEmail: v })}
            placeholder="e.g. father@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            maxLength={150}
            error={errors.fatherEmail}
          />

          <FormInput
            label="Father Mobile"
            required
            value={data.fatherContact}
            onChangeText={(v) => onChange({ fatherContact: formatPhone(v) })}
            placeholder="03XXXXXXXXX"
            keyboardType="phone-pad"
            maxLength={11}
            error={errors.fatherContact}
          />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <FormSelect
                label="Father Occupation"
                options={OCCUPATIONS}
                value={data.fatherOccupation}
                onChange={(v) => onChange({ fatherOccupation: v })}
              />
            </View>
            <View style={styles.halfField}>
              <FormSelect
                label="Father Qualification"
                options={QUALIFICATIONS}
                value={data.fatherQualification}
                onChange={(v) => onChange({ fatherQualification: v })}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <DocumentUpload
                label="Father CNIC Front"
                value={data.fatherCnicFront}
                onChange={(f) => onChange({ fatherCnicFront: f })}
                type="image"
                hint="JPEG/PNG, max 2MB"
              />
            </View>
            <View style={styles.halfField}>
              <DocumentUpload
                label="Father CNIC Back"
                value={data.fatherCnicBack}
                onChange={(f) => onChange({ fatherCnicBack: f })}
                type="image"
                hint="JPEG/PNG, max 2MB"
              />
            </View>
          </View>
        </View>

        {/* ── Card 2: Mother Details ───────────────────────────────── */}
        <View style={styles.card}>
          <SectionHeader title="Mother Details" />

          <FormInput
            label="Mother Name"
            value={data.motherName}
            onChangeText={(v) => onChange({ motherName: v })}
            placeholder="e.g. Fatima Ali"
            maxLength={100}
            error={errors.motherName}
          />

          <FormInput
            label="Mother CNIC"
            value={data.motherCnic}
            onChangeText={(v) => onChange({ motherCnic: formatCnic(v) })}
            placeholder="XXXXX-XXXXXXX-X"
            keyboardType="numeric"
            maxLength={15}
            error={errors.motherCnic}
          />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <FormSelect
                label="Occupation"
                options={OCCUPATIONS}
                value={data.motherOccupation}
                onChange={(v) => onChange({ motherOccupation: v })}
              />
            </View>
            <View style={styles.halfField}>
              <FormSelect
                label="Education"
                options={QUALIFICATIONS}
                value={data.motherEducation}
                onChange={(v) => onChange({ motherEducation: v })}
              />
            </View>
          </View>

          <FormInput
            label="Mother's Contact"
            value={data.motherContact}
            onChangeText={(v) => onChange({ motherContact: formatPhone(v) })}
            placeholder="03XXXXXXXXX"
            keyboardType="phone-pad"
            maxLength={11}
            error={errors.motherContact}
          />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <DocumentUpload
                label="Mother CNIC Front"
                value={data.motherCnicFront}
                onChange={(f) => onChange({ motherCnicFront: f })}
                type="image"
                hint="JPEG/PNG, max 2MB"
              />
            </View>
            <View style={styles.halfField}>
              <DocumentUpload
                label="Mother CNIC Back"
                value={data.motherCnicBack}
                onChange={(f) => onChange({ motherCnicBack: f })}
                type="image"
                hint="JPEG/PNG, max 2MB"
              />
            </View>
          </View>
        </View>

        {/* ── Card 3: Guardian & Income ────────────────────────────── */}
        <View style={styles.card}>
          <SectionHeader title="Guardian & Income" />

          <FormInput
            label="Guardian Name"
            value={data.guardianName}
            onChangeText={(v) => onChange({ guardianName: v })}
            placeholder="If different from parents"
            maxLength={150}
            hint="Leave blank if parent is guardian"
          />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <FormInput
                label="Guardian Contact"
                value={data.guardianContact}
                onChangeText={(v) => onChange({ guardianContact: formatPhone(v) })}
                placeholder="03001234567"
                keyboardType="phone-pad"
                maxLength={11}
              />
            </View>
            <View style={styles.halfField}>
              <FormInput
                label="Monthly Income (PKR)"
                value={data.monthlyIncome}
                onChangeText={(v) => onChange({ monthlyIncome: v })}
                placeholder="e.g. 25000"
                keyboardType="numeric"
                error={errors.monthlyIncome}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="← Back"
          onPress={onBack}
          variant="outline"
          style={styles.backBtn}
          disabled={submitting}
        />
        <PrimaryButton
          title={submitting ? 'Submitting...' : 'Submit ✓'}
          onPress={handleSubmit}
          loading={submitting}
          style={styles.submitBtn}
        />
      </View>
    </View>
  );
};

// ── Helper ────────────────────────────────────────────────────────────────────
const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionLine} />
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionLine} />
  </View>
);

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
    fontSize:         FontSize.xs,
    fontWeight:       '700',
    color:            Colors.primary,
    letterSpacing:    1.2,
    textTransform:    'uppercase',
    marginHorizontal: Spacing.md,
  },

  row:       { flexDirection: 'row', gap: Spacing.md },
  halfField: { flex: 1 },

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
  backBtn:   { flex: 1 },
  submitBtn: { flex: 2 },
});

export default ParentsForm;