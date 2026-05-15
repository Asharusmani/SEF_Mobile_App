import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Animated, Switch,
} from 'react-native';
import * as Yup from 'yup';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import DocumentUpload from '../ui/DocumentUpload';
import PrimaryButton from '../ui/PrimaryButton';
import CustomDatePicker from '../ui/CustomDatePicker';

// ─────────────────────────────────────────────────────────────────────────────
// Backend field mapping (student model + studentSchema):
//
// gr_no              → GR Number
// name_of_student    → Student Full Name
// student_dob        → Date of Birth  FORMAT: DD-MM-YYYY  ← IMPORTANT
// gender             → "Male" | "Female"  (Other nahi backend mein)
// religion           → "Islam" | "Christianity" | "Hinduism" | "Other"
// village            → Village/Area
// mother_tongue      → Mother Tongue
// blood_group        → Blood Group
// refugee_student    → "Yes" | "No"  (boolean nahi, string!)
// disability         → "Yes" | "No"
// seeing_difficulty  → "Yes" | "No"
// hearing_difficulty → "Yes" | "No"
// walking_difficulty → "Yes" | "No"
// remembering_or_concentrating → "Yes" | "No"
// speech_disorder    → "Yes" | "No"
// self_care          → "Yes" | "No"
// bform_no           → CNIC/B-Form  FORMAT: XXXXX-XXXXXXX-X
// residential_address → Address
// emergency_contact  → 11 digits NO dash  (03XXXXXXXXX)
// school_code        → passed from parent screen
// ─────────────────────────────────────────────────────────────────────────────

// Backend mein sirf Male/Female — Other nahi
const GENDERS = [
  { label: 'Male',   value: 'Male' },
  { label: 'Female', value: 'Female' },
];

// Backend: "Islam" | "Christianity" | "Hinduism" | "Other"
const RELIGIONS = [
  { label: 'Islam',       value: 'Islam' },
  { label: 'Christianity',value: 'Christianity' },
  { label: 'Hinduism',    value: 'Hinduism' },
  { label: 'Other',       value: 'Other' },
];

const MOTHER_TONGUES = [
  { label: 'Sindhi',  value: 'Sindhi' },
  { label: 'Urdu',    value: 'Urdu' },
  { label: 'Balochi', value: 'Balochi' },
  { label: 'Brahvi',  value: 'Brahvi' },
  { label: 'Punjabi', value: 'Punjabi' },
  { label: 'Pashto',  value: 'Pashto' },
  { label: 'Other',   value: 'Other' },
];

const BLOOD_GROUPS = [
  { label: 'A+',  value: 'A+' },
  { label: 'A-',  value: 'A-' },
  { label: 'B+',  value: 'B+' },
  { label: 'B-',  value: 'B-' },
  { label: 'AB+', value: 'AB+' },
  { label: 'AB-', value: 'AB-' },
  { label: 'O+',  value: 'O+' },
  { label: 'O-',  value: 'O-' },
];

const DISABILITY_ITEMS = [
  { key: 'seeing_difficulty',           label: 'Seeing Difficulty',             icon: '👁'  },
  { key: 'hearing_difficulty',          label: 'Hearing Difficulty',            icon: '👂'  },
  { key: 'walking_difficulty',          label: 'Walking Difficulty',            icon: '🦯'  },
  { key: 'remembering_or_concentrating',label: 'Remembering / Concentrating',  icon: '🧠'  },
  { key: 'speech_disorder',             label: 'Speech Disorder',              icon: '🗣'   },
  { key: 'self_care',                   label: 'Self Care (Washing/Dressing)', icon: '🤲'  },
];

// ── B-Form formatter: XXXXX-XXXXXXX-X ────────────────────────────────────────
const formatBForm = (text) => {
  const digits = text.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5)  return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
};

// ── Emergency contact: raw 11 digits (no dash) for backend ───────────────────
// Display ke liye 03XX-XXXXXXX dikhao, lekin backend ko 03XXXXXXXXX bhejo
const formatPhoneDisplay = (digits) => {
  if (!digits) return '';
  const d = digits.replace(/\D/g, '');
  if (d.length <= 4) return d;
  return `${d.slice(0, 4)}-${d.slice(4)}`;
};

// DD/MM/YYYY (CustomDatePicker) → DD-MM-YYYY (backend expects)
const convertDateForBackend = (dateStr) => {
  if (!dateStr) return '';
  return dateStr.replace(/\//g, '-');
};

// ── Yup validation (frontend display ke liye) ─────────────────────────────────
const studentSchema = Yup.object({
  gr_no: Yup.string()
    .required('GR Number is required')
    .max(50, 'GR Number must be under 50 characters'),

  name_of_student: Yup.string()
    .required('Student name is required')
    .max(150, 'Name must be under 150 characters'),

  student_dob: Yup.string()
    .required('Date of birth is required')
    .matches(/^\d{2}\/\d{2}\/\d{4}$/, 'Select date of birth'),

  gender: Yup.string()
    .oneOf(['Male', 'Female'], 'Select gender')
    .required('Please select gender'),

  religion: Yup.string()
    .oneOf(['Islam', 'Christianity', 'Hinduism', 'Other'], 'Select religion')
    .required('Please select religion'),

  mother_tongue: Yup.string().max(50).nullable().optional(),
  blood_group:   Yup.string().max(5).nullable().optional(),

  bform_no: Yup.string()
    .nullable()
    .transform((v) => (v === '' ? null : v))
    .matches(/^\d{5}-\d{7}-\d$/, 'Format: XXXXX-XXXXXXX-X')
    .optional(),

  residential_address: Yup.string().max(300).nullable().optional(),
  village: Yup.string().max(100).nullable().optional(),

  // Emergency contact: user 11 digits type karta hai, display mein dash hota hai
  emergency_contact: Yup.string()
    .nullable()
    .transform((v) => (v === '' ? null : v))
    .matches(/^\d{11}$/, 'Must be 11 digits (03XXXXXXXXX)')
    .optional(),
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const boolToYesNo = (val) => (val ? 'Yes' : 'No');

const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionLine} />
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionLine} />
  </View>
);

// ── Disability Card ───────────────────────────────────────────────────────────
const DisabilityCard = ({ item, value, onChange }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isActive  = value === 'Yes';

  const handleToggle = (val) => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1,    duration: 80, useNativeDriver: true }),
    ]).start();
    onChange(val ? 'Yes' : 'No'); // backend "Yes"/"No" string
  };

  return (
    <Animated.View style={[
      styles.disabilityCard,
      isActive && styles.disabilityCardActive,
      { transform: [{ scale: scaleAnim }] },
    ]}>
      <View style={styles.disabilityCardLeft}>
        <View style={[styles.disabilityIconWrap, isActive && styles.disabilityIconWrapActive]}>
          <Text style={styles.disabilityIcon}>{item.icon}</Text>
        </View>
        <Text style={[styles.disabilityLabel, isActive && styles.disabilityLabelActive]} numberOfLines={2}>
          {item.label}
        </Text>
      </View>
      <Switch
        value={isActive}
        onValueChange={handleToggle}
        trackColor={{ false: C.gray200, true: '#a7f3d0' }}
        thumbColor={isActive ? C.primary : C.white}
        ios_backgroundColor={C.gray200}
      />
    </Animated.View>
  );
};

// ── Disability Section ────────────────────────────────────────────────────────
const DisabilitySection = ({ data, onChange }) => {
  const expandAnim    = useRef(new Animated.Value(data.disability === 'Yes' ? 1 : 0)).current;
  const isEnabled     = data.disability === 'Yes';

  const toggleExpand = (enabled) => {
    Animated.spring(expandAnim, {
      toValue: enabled ? 1 : 0,
      friction: 8, tension: 60, useNativeDriver: false,
    }).start();

    if (!enabled) {
      const reset = { disability: 'No' };
      DISABILITY_ITEMS.forEach((i) => { reset[i.key] = 'No'; });
      onChange(reset);
    } else {
      onChange({ disability: 'Yes' });
    }
  };

  const subFieldsMaxHeight = expandAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 620] });
  const subFieldsOpacity   = expandAnim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0, 1] });
  const activeCount        = DISABILITY_ITEMS.filter((i) => data[i.key] === 'Yes').length;

  return (
    <View style={styles.card}>
      <SectionHeader title="ADDITIONAL INFORMATION" />

      {/* Refugee toggle — "Yes"/"No" string */}
      <View style={styles.toggleRow}>
        <View style={styles.toggleRowLeft}>
          <View style={[styles.toggleBadge, styles.toggleBadgeRefugee]}>
            <Text style={styles.toggleBadgeText}>R</Text>
          </View>
          <View>
            <Text style={styles.toggleRowTitle}>Refugee Student</Text>
            <Text style={styles.toggleRowSub}>Mark if applicable</Text>
          </View>
        </View>
        <Switch
          value={data.refugee_student === 'Yes'}
          onValueChange={(v) => onChange({ refugee_student: v ? 'Yes' : 'No' })}
          trackColor={{ false: C.gray200, true: '#a7f3d0' }}
          thumbColor={data.refugee_student === 'Yes' ? C.primary : C.white}
          ios_backgroundColor={C.gray200}
        />
      </View>

      <View style={styles.cardDivider} />

      {/* Disability master toggle */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => toggleExpand(!isEnabled)}
        style={styles.disabilityMasterRow}
      >
        <View style={styles.disabilityMasterLeft}>
          <View style={[styles.toggleBadge, styles.toggleBadgeDisability, isEnabled && styles.toggleBadgeDisabilityActive]}>
            <Text style={[styles.toggleBadgeText, isEnabled && { color: C.white }]}>D</Text>
          </View>
          <View>
            <Text style={[styles.toggleRowTitle, isEnabled && styles.disabilityMasterTitleActive]}>
              Disability
            </Text>
            <Text style={styles.toggleRowSub}>
              {isEnabled ? 'Tap to disable · select types below' : 'Expands sub-fields when enabled'}
            </Text>
          </View>
        </View>
        <View style={styles.disabilityMasterRight}>
          {isEnabled && (
            <View style={styles.disabilityBadgeCount}>
              <Text style={styles.disabilityBadgeCountText}>{activeCount}/{DISABILITY_ITEMS.length}</Text>
            </View>
          )}
          <Switch
            value={isEnabled}
            onValueChange={toggleExpand}
            trackColor={{ false: C.gray200, true: '#fca5a5' }}
            thumbColor={isEnabled ? '#ef4444' : C.white}
            ios_backgroundColor={C.gray200}
          />
        </View>
      </TouchableOpacity>

      <Animated.View style={{ maxHeight: subFieldsMaxHeight, opacity: subFieldsOpacity, overflow: 'hidden' }}>
        <View style={styles.disabilitySubWrap}>
          <Text style={styles.disabilitySubHint}>Select all that apply</Text>
          <View style={styles.disabilityGrid}>
            {DISABILITY_ITEMS.map((item) => (
              <DisabilityCard
                key={item.key}
                item={item}
                value={data[item.key]}
                onChange={(val) => onChange({ [item.key]: val })}
              />
            ))}
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

// ── Main Form ─────────────────────────────────────────────────────────────────
const StudentFormSectionB = ({ data, onChange, onNext, onBack }) => {
  const [errors, setErrors]                 = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Emergency contact: display state (with dash), backend state (raw digits)
  const [phoneDisplay, setPhoneDisplay] = useState(
    data.emergency_contact ? formatPhoneDisplay(data.emergency_contact) : ''
  );

  const handlePhoneChange = (text) => {
    // Sirf digits
    const digits = text.replace(/\D/g, '').slice(0, 11);
    setPhoneDisplay(formatPhoneDisplay(digits));
    // Backend ko raw 11 digits
    onChange({ emergency_contact: digits });
  };

  const handleNext = async () => {
    try {
      await studentSchema.validate(data, { abortEarly: false });
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
      <CustomDatePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={(dateStr) => {
          // CustomDatePicker DD/MM/YYYY deta hai
          // Backend DD-MM-YYYY chahta hai — store both
          onChange({
            student_dob:         dateStr,               // display (DD/MM/YYYY)
            student_dob_backend: convertDateForBackend(dateStr), // submit (DD-MM-YYYY)
          });
        }}
        initialValue={data.student_dob}
        title="Date of Birth"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Photo ── */}
        <View style={styles.card}>
          <SectionHeader title="PROFILE PHOTO" />
          <DocumentUpload
            label="Student Photo"
            value={data.profilePhoto}
            onChange={(f) => onChange({ profilePhoto: f })}
            type="image"
            hint="JPEG or PNG · passport size · max 2MB"
          />
        </View>

        {/* ── Student Info ── */}
        <View style={styles.card}>
          <SectionHeader title="STUDENT INFORMATION" />

          <View style={styles.row}>
            <View style={styles.halfField}>
              {/* gr_no → backend field */}
              <FormInput
                label="GR Number"
                required
                value={data.gr_no}
                onChangeText={(v) => onChange({ gr_no: v })}
                placeholder="GR-2024-001"
                maxLength={50}
                error={errors.gr_no}
              />
            </View>
            <View style={styles.halfField}>
              <FormInput
                label="Student ID"
                value={data.student_id}
                onChangeText={(v) => onChange({ student_id: v })}
                placeholder="System generated"
                editable={false}
                maxLength={50}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfField}>
              {/* name_of_student → backend field */}
              <FormInput
                label="Student Full Name"
                required
                value={data.name_of_student}
                onChangeText={(v) => onChange({ name_of_student: v })}
                placeholder="As per B-Form"
                maxLength={150}
                error={errors.name_of_student}
              />
            </View>
            <View style={styles.halfField}>
              {/* sno → backend field */}
              <FormInput
                label="S.No"
                value={data.sno}
                onChangeText={(v) => onChange({ sno: v })}
                placeholder="Serial No."
                maxLength={50}
              />
            </View>
          </View>

          {/* Date of Birth + Gender */}
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>
                Date of Birth <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => setShowDatePicker(true)}
                style={[styles.dateBtn, errors.student_dob && styles.dateBtnError]}
              >
                <Text style={[styles.dateBtnText, !data.student_dob && styles.dateBtnPlaceholder]}>
                  {data.student_dob || 'DD/MM/YYYY'}
                </Text>
                <Text style={styles.dateBtnIcon}>📅</Text>
              </TouchableOpacity>
              {errors.student_dob
                ? <Text style={styles.fieldError}>{errors.student_dob}</Text>
                : <Text style={styles.fieldHint}>Tap to open calendar</Text>
              }
            </View>

            <View style={styles.halfField}>
              {/* gender: "Male"/"Female" only */}
              <FormSelect
                label="Gender"
                required
                options={GENDERS}
                value={data.gender}
                onChange={(v) => onChange({ gender: v })}
                error={errors.gender}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfField}>
              {/* religion: "Islam"/"Christianity"/"Hinduism"/"Other" */}
              <FormSelect
                label="Religion"
                required
                options={RELIGIONS}
                value={data.religion}
                onChange={(v) => onChange({ religion: v })}
                error={errors.religion}
              />
            </View>
            <View style={styles.halfField}>
              <FormSelect
                label="Mother Tongue"
                options={MOTHER_TONGUES}
                value={data.mother_tongue}
                onChange={(v) => onChange({ mother_tongue: v })}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <FormSelect
                label="Blood Group"
                options={BLOOD_GROUPS}
                value={data.blood_group}
                onChange={(v) => onChange({ blood_group: v })}
              />
            </View>
            <View style={styles.halfField} />
          </View>
        </View>

        {/* ── B-Form ── */}
        <View style={styles.card}>
          <SectionHeader title="IDENTITY DOCUMENTS" />
          {/* bform_no: XXXXX-XXXXXXX-X */}
          <FormInput
            label="CNIC / B-Form No."
            value={data.bform_no}
            onChangeText={(raw) => onChange({ bform_no: formatBForm(raw) })}
            placeholder="XXXXX-XXXXXXX-X"
            keyboardType="numeric"
            maxLength={15}
            error={errors.bform_no}
            hint="13 digits, dashes auto-lagte hain"
          />
        </View>

        {/* ── Address ── */}
        <View style={styles.card}>
          <SectionHeader title="ADDRESS DETAILS" />

          {/* residential_address → backend field */}
          <FormInput
            label="Residential Address"
            value={data.residential_address}
            onChangeText={(v) => onChange({ residential_address: v })}
            placeholder="Complete home address..."
            multiline
            numberOfLines={3}
            maxLength={300}
            style={styles.textArea}
          />

          {/* village → backend field */}
          <FormInput
            label="Village / Area"
            value={data.village}
            onChangeText={(v) => onChange({ village: v })}
            placeholder="Village or locality name"
            maxLength={100}
          />

          {/* emergency_contact: 11 digits raw (03XXXXXXXXX), display mein dash */}
          <FormInput
            label="Emergency Contact"
            value={phoneDisplay}
            onChangeText={handlePhoneChange}
            placeholder="03XX-XXXXXXX"
            keyboardType="number-pad"
            maxLength={12}
            error={errors.emergency_contact}
            hint="11 digits — 03XXXXXXXXX"
          />
        </View>

        {/* ── Disability — refugee_student, disability, seeing_difficulty etc ── */}
        <DisabilitySection data={data} onChange={onChange} />
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title="← Back"     onPress={onBack}     variant="outline" style={styles.backBtn} />
        <PrimaryButton title="Continue →" onPress={handleNext}                   style={styles.nextBtn} />
      </View>
    </View>
  );
};

// ── Colors ────────────────────────────────────────────────────────────────────
const C = {
  primary:      '#059669',
  primaryLight: '#d1fae5',
  primaryMid:   '#6ee7b7',
  danger:       '#ef4444',
  dangerLight:  '#fee2e2',
  gray50:       '#f9fafb',
  gray100:      '#f3f4f6',
  gray200:      '#e5e7eb',
  gray400:      '#9ca3af',
  gray600:      '#4b5563',
  gray800:      '#1f2937',
  white:        '#ffffff',
};

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: C.gray100 },
  scroll:        { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 12 },
  card: {
    backgroundColor: C.white, borderRadius: 16, padding: 20,
    borderWidth: 0.5, borderColor: C.gray200,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginBottom: 12,
  },
  sectionHeader:  { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sectionLine:    { flex: 1, height: 1, backgroundColor: C.primary, opacity: 0.2 },
  sectionTitle:   { fontSize: 10, fontWeight: '700', color: C.primary, letterSpacing: 1.4, marginHorizontal: 10 },
  row:            { flexDirection: 'row', gap: 12 },
  halfField:      { flex: 1 },
  textArea:       { minHeight: 80, textAlignVertical: 'top', paddingTop: 10 },
  fieldLabel:     { fontSize: 13, fontWeight: '600', color: C.gray600, marginBottom: 6 },
  requiredStar:   { color: C.danger },
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
  fieldError:         { fontSize: 11, color: C.danger, marginTop: 4 },
  toggleRow:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  toggleRowLeft:      { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  toggleRowTitle:     { fontSize: 14, fontWeight: '600', color: C.gray800 },
  toggleRowSub:       { fontSize: 11, color: C.gray400, marginTop: 1 },
  toggleBadge:                 { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  toggleBadgeText:             { fontSize: 13, fontWeight: '700', color: C.gray600 },
  toggleBadgeRefugee:          { backgroundColor: '#eff6ff' },
  toggleBadgeDisability:       { backgroundColor: C.gray100 },
  toggleBadgeDisabilityActive: { backgroundColor: '#fee2e2' },
  cardDivider:             { height: 1, backgroundColor: C.gray200, marginVertical: 12 },
  disabilityMasterRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, paddingVertical: 8 },
  disabilityMasterLeft:    { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  disabilityMasterRight:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  disabilityMasterTitleActive: { color: '#dc2626' },
  disabilityBadgeCount:     { backgroundColor: C.dangerLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  disabilityBadgeCountText: { fontSize: 11, fontWeight: '700', color: '#dc2626' },
  disabilitySubWrap: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: C.gray200 },
  disabilitySubHint: { fontSize: 11, color: C.gray400, marginBottom: 12, textAlign: 'center', fontStyle: 'italic' },
  disabilityGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  disabilityCard: {
    width: '47.5%', backgroundColor: C.gray50, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.gray200, padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8,
  },
  disabilityCardActive:     { backgroundColor: '#f0fdf4', borderColor: C.primaryMid },
  disabilityCardLeft:       { flex: 1, gap: 6 },
  disabilityIconWrap:       { width: 38, height: 38, borderRadius: 10, backgroundColor: C.gray200, alignItems: 'center', justifyContent: 'center' },
  disabilityIconWrapActive: { backgroundColor: C.primaryLight },
  disabilityIcon:           { fontSize: 18 },
  disabilityLabel:          { fontSize: 12, fontWeight: '500', color: C.gray600, lineHeight: 16 },
  disabilityLabelActive:    { color: '#065f46', fontWeight: '600' },
  footer: {
    backgroundColor: C.white, padding: 16, flexDirection: 'row', gap: 12,
    borderTopWidth: 1, borderTopColor: C.gray200,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 8,
  },
  backBtn: { flex: 1 },
  nextBtn: { flex: 2 },
});

export default StudentFormSectionB;