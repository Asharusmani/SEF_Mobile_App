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
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

// DB field mapping (students table):
// grNo             STRING(50)  allowNull: false
// studentId        STRING(50)  allowNull: false, unique
// cnicBForm        STRING(20)  allowNull: true
// studentName      STRING(150) allowNull: false
// surname          STRING(100) allowNull: true
// dob              DATEONLY    allowNull: true   → DD/MM/YYYY string on form
// gender           STRING(10)  allowNull: true
// religion         STRING(20)  allowNull: true
// bloodGroup       STRING(5)   allowNull: true
// motherTongue     STRING(50)  allowNull: true
// address          STRING(300) allowNull: true
// village          STRING(100) allowNull: true
// emergencyContact STRING(20)  allowNull: true
// refugee          STRING(5)   allowNull: true   defaultValue: "No"
// photoUrl         STRING(500) allowNull: true
//
// DB field mapping (student_disabilities table):
// hasDisability    STRING(5)   allowNull: true   defaultValue: "No"
// seeingDiff       STRING(5)   allowNull: true   defaultValue: "No"
// hearingDiff      STRING(5)   allowNull: true   defaultValue: "No"
// walkingDiff      STRING(5)   allowNull: true   defaultValue: "No"
// rememberingDiff  STRING(5)   allowNull: true   defaultValue: "No"
// speechDisorder   STRING(5)   allowNull: true   defaultValue: "No"
// selfCare         STRING(5)   allowNull: true   defaultValue: "No"

const GENDERS = [
  { label: 'Male',   value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other',  value: 'other' },
];
const RELIGIONS = [
  { label: 'Muslim',     value: 'muslim' },
  { label: 'Non-Muslim', value: 'non_muslim' },
];
const MOTHER_TONGUES = [
  { label: 'Sindhi',  value: 'sindhi' },
  { label: 'Urdu',    value: 'urdu' },
  { label: 'Balochi', value: 'balochi' },
  { label: 'Brahvi',  value: 'brahvi' },
  { label: 'Punjabi', value: 'punjabi' },
  { label: 'Pashto',  value: 'pashto' },
  { label: 'Other',   value: 'other' },
];
const BLOOD_GROUPS = [
  { label: 'A+',  value: 'a+' },
  { label: 'A-',  value: 'a-' },
  { label: 'B+',  value: 'b+' },
  { label: 'B-',  value: 'b-' },
  { label: 'AB+', value: 'ab+' },
  { label: 'AB-', value: 'ab-' },
  { label: 'O+',  value: 'o+' },
  { label: 'O-',  value: 'o-' },
];
const DISABILITY_ITEMS = [
  { key: 'seeingDifficulty',     label: 'Seeing Difficulty',            icon: '👁' },
  { key: 'hearingDifficulty',    label: 'Hearing Difficulty',           icon: '👂' },
  { key: 'walkingDifficulty',    label: 'Walking Difficulty',           icon: '🦯' },
  { key: 'rememberingDifficulty',label: 'Remembering / Concentrating',  icon: '🧠' },
  { key: 'speechDisorder',       label: 'Speech Disorder',              icon: '🗣' },
  { key: 'selfCare',             label: 'Self Care (Washing / Dressing)',icon: '🤲' },
];

// Yup schema — every max() mirrors the DB STRING(n) length
const studentSchema = Yup.object({
  grNumber: Yup.string()
    .required('GR Number is required')
    .max(50, 'GR Number must be under 50 characters'),       // grNo STRING(50)

  studentName: Yup.string()
    .required('Student name is required')
    .max(150, 'Name must be under 150 characters'),          // studentName STRING(150)

  surname: Yup.string()
    .max(100, 'Surname must be under 100 characters')        // surname STRING(100)
    .nullable().optional(),

  dateOfBirth: Yup.string()
    .required('Date of birth is required')
    .matches(/^\d{2}\/\d{2}\/\d{4}$/, 'Use format DD/MM/YYYY'), // dob DATEONLY

  gender: Yup.string()
    .required('Please select gender')
    .max(10),                                                // gender STRING(10)

  religion: Yup.string()
    .required('Please select religion')
    .max(20),                                                // religion STRING(20)

  motherTongue: Yup.string()
    .max(50)                                                 // motherTongue STRING(50)
    .nullable().optional(),

  bloodGroup: Yup.string()
    .max(5)                                                  // bloodGroup STRING(5)
    .nullable().optional(),

  bForm: Yup.string()
    .max(20, 'CNIC/B-Form too long')                        // cnicBForm STRING(20)
    .nullable()
    .transform((v) => v === '' ? null : v)
    .matches(/^\d{5}-\d{7}-\d$/, 'Format: 12345-1234567-1')
    .optional(),

  address: Yup.string()
    .max(300, 'Address must be under 300 characters')        // address STRING(300)
    .nullable().optional(),

  village: Yup.string()
    .max(100, 'Village must be under 100 characters')        // village STRING(100)
    .nullable().optional(),

  emergencyContact: Yup.string()
    .max(20)                                                 // emergencyContact STRING(20)
    .nullable()
    .transform((v) => v === '' ? null : v)
    .matches(/^03\d{2}-\d{7}$/, 'Format: 03XX-XXXXXXX')
    .optional(),

  // disability fields — all STRING(5) → "Yes" / "No"
  disabilityEnabled:      Yup.boolean().optional(),
  refugeeStudent:         Yup.boolean().optional(),
  seeingDifficulty:      Yup.boolean().optional(),
  hearingDifficulty:     Yup.boolean().optional(),
  walkingDifficulty:     Yup.boolean().optional(),
  rememberingDifficulty: Yup.boolean().optional(),
  speechDisorder:        Yup.boolean().optional(),
  selfCare:              Yup.boolean().optional(),
});

// ── Sub-components ────────────────────────────────────────────────────────────

const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionLine} />
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionLine} />
  </View>
);

const DisabilityCard = ({ item, value, onChange }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const handleToggle = (val) => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1,    duration: 80, useNativeDriver: true }),
    ]).start();
    onChange(val);
  };
  return (
    <Animated.View style={[styles.disabilityCard, value && styles.disabilityCardActive, { transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.disabilityCardLeft}>
        <View style={[styles.disabilityIconWrap, value && styles.disabilityIconWrapActive]}>
          <Text style={styles.disabilityIcon}>{item.icon}</Text>
        </View>
        <Text style={[styles.disabilityLabel, value && styles.disabilityLabelActive]} numberOfLines={2}>
          {item.label}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={handleToggle}
        trackColor={{ false: C.gray200, true: '#a7f3d0' }}
        thumbColor={value ? C.primary : C.white}
        ios_backgroundColor={C.gray200}
      />
    </Animated.View>
  );
};

const DisabilitySection = ({ data, onChange }) => {
  const expandAnim = useRef(new Animated.Value(0)).current;
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = (enabled) => {
    setIsExpanded(enabled);
    Animated.spring(expandAnim, { toValue: enabled ? 1 : 0, friction: 8, tension: 60, useNativeDriver: false }).start();
    if (!enabled) {
      const reset = {};
      DISABILITY_ITEMS.forEach((i) => { reset[i.key] = false; });
      onChange({ disabilityEnabled: false, ...reset });
    } else {
      onChange({ disabilityEnabled: true });
    }
  };

  const subFieldsMaxHeight = expandAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 620] });
  const subFieldsOpacity   = expandAnim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0, 1] });

  return (
    <View style={styles.card}>
      <SectionHeader title="ADDITIONAL INFORMATION" />

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
          value={data.refugeeStudent}
          onValueChange={(v) => onChange({ refugeeStudent: v })}
          trackColor={{ false: C.gray200, true: '#a7f3d0' }}
          thumbColor={data.refugeeStudent ? C.primary : C.white}
          ios_backgroundColor={C.gray200}
        />
      </View>

      <View style={styles.cardDivider} />

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => toggleExpand(!data.disabilityEnabled)}
        style={[styles.disabilityMasterRow, data.disabilityEnabled && styles.disabilityMasterRowActive]}
      >
        <View style={styles.disabilityMasterLeft}>
          <View style={[styles.toggleBadge, styles.toggleBadgeDisability, data.disabilityEnabled && styles.toggleBadgeDisabilityActive]}>
            <Text style={[styles.toggleBadgeText, data.disabilityEnabled && { color: C.white }]}>D</Text>
          </View>
          <View>
            <Text style={[styles.toggleRowTitle, data.disabilityEnabled && styles.disabilityMasterTitleActive]}>
              Disability
            </Text>
            <Text style={styles.toggleRowSub}>
              {data.disabilityEnabled ? 'Tap to disable · select types below' : 'Expands sub-fields when enabled'}
            </Text>
          </View>
        </View>
        <View style={styles.disabilityMasterRight}>
          {data.disabilityEnabled && (
            <View style={styles.disabilityBadgeCount}>
              <Text style={styles.disabilityBadgeCountText}>
                {DISABILITY_ITEMS.filter((i) => data[i.key]).length}/{DISABILITY_ITEMS.length}
              </Text>
            </View>
          )}
          <Switch
            value={data.disabilityEnabled}
            onValueChange={toggleExpand}
            trackColor={{ false: C.gray200, true: '#fca5a5' }}
            thumbColor={data.disabilityEnabled ? '#ef4444' : C.white}
            ios_backgroundColor={C.gray200}
          />
        </View>
      </TouchableOpacity>

      <Animated.View style={{ maxHeight: subFieldsMaxHeight, opacity: subFieldsOpacity, overflow: 'hidden' }}>
        <View style={styles.disabilitySubWrap}>
          <Text style={styles.disabilitySubHint}>Select all that apply — each field is independently toggled</Text>
          <View style={styles.disabilityGrid}>
            {DISABILITY_ITEMS.map((item) => (
              <DisabilityCard
                key={item.key}
                item={item}
                value={!!data[item.key]}
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
  const [errors, setErrors] = useState({});

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
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Card 1: Photo */}
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

        {/* Card 2: Basic Info */}
        <View style={styles.card}>
          <SectionHeader title="STUDENT INFORMATION" />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <FormInput
                label="GR Number"
                required
                value={data.grNumber}
                onChangeText={(v) => onChange({ grNumber: v })}
                placeholder="GR-2024-001"
                maxLength={50}
                error={errors.grNumber}
              />
            </View>
            <View style={styles.halfField}>
              <FormInput
                label="Student ID"
                value={data.studentId}
                onChangeText={(v) => onChange({ studentId: v })}
                placeholder="System generated"
                hint="Auto-assigned"
                editable={false}
                maxLength={50}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <FormInput
                label="Student Full Name"
                required
                value={data.studentName}
                onChangeText={(v) => onChange({ studentName: v })}
                placeholder="As per B-Form"
                maxLength={150}
                error={errors.studentName}
              />
            </View>
            <View style={styles.halfField}>
              <FormInput
                label="Surname"
                value={data.surname}
                onChangeText={(v) => onChange({ surname: v })}
                placeholder="Family name"
                maxLength={100}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <FormInput
                label="Date of Birth"
                required
                value={data.dateOfBirth}
                onChangeText={(v) => onChange({ dateOfBirth: v })}
                placeholder="DD/MM/YYYY"
                keyboardType="numeric"
                maxLength={10}
                error={errors.dateOfBirth}
                hint="Not a future date"
              />
            </View>
            <View style={styles.halfField}>
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
                value={data.motherTongue}
                onChange={(v) => onChange({ motherTongue: v })}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <FormSelect
                label="Blood Group"
                options={BLOOD_GROUPS}
                value={data.bloodGroup}
                onChange={(v) => onChange({ bloodGroup: v })}
              />
            </View>
            <View style={styles.halfField} />
          </View>
        </View>

        {/* Card 3: Identity */}
        <View style={styles.card}>
          <SectionHeader title="IDENTITY DOCUMENTS" />
          <FormInput
            label="CNIC / B-Form No."
            value={data.bForm}
            onChangeText={(v) => onChange({ bForm: v })}
            placeholder="XXXXX-XXXXXXX-X"
            keyboardType="numeric"
            maxLength={20}
            error={errors.bForm}
            hint="Child's B-Form number"
          />
        </View>

        {/* Card 4: Address */}
        <View style={styles.card}>
          <SectionHeader title="ADDRESS DETAILS" />

          <FormInput
            label="Address"
            value={data.address}
            onChangeText={(v) => onChange({ address: v })}
            placeholder="Complete home address..."
            multiline
            numberOfLines={3}
            maxLength={300}
            style={styles.textArea}
          />

          <FormInput
            label="Village / Area"
            value={data.village}
            onChangeText={(v) => onChange({ village: v })}
            placeholder="Village or locality name"
            maxLength={100}
          />

          <FormInput
            label="Emergency Contact"
            value={data.emergencyContact}
            onChangeText={(v) => onChange({ emergencyContact: v })}
            placeholder="03XX-XXXXXXX"
            keyboardType="phone-pad"
            maxLength={20}
            error={errors.emergencyContact}
            hint="Pakistani mobile format"
          />
        </View>

        {/* Card 5: Disability */}
        <DisabilitySection data={data} onChange={onChange} />
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title="← Back" onPress={onBack} variant="outline" style={styles.backBtn} />
        <PrimaryButton title="Continue →" onPress={handleNext} style={styles.nextBtn} />
      </View>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const C = {
  primary: '#059669',
  primaryLight: '#d1fae5',
  primaryMid: '#6ee7b7',
  danger: '#ef4444',
  dangerLight: '#fee2e2',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray400: '#9ca3af',
  gray600: '#4b5563',
  gray800: '#1f2937',
  white: '#ffffff',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.gray100 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 12 },
  card: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 0.5,
    borderColor: C.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sectionLine: { flex: 1, height: 1, backgroundColor: C.primary, opacity: 0.2 },
  sectionTitle: { fontSize: 10, fontWeight: '700', color: C.primary, letterSpacing: 1.4, marginHorizontal: 10 },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  textArea: { minHeight: 80, textAlignVertical: 'top', paddingTop: 10 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  toggleRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  toggleRowTitle: { fontSize: 14, fontWeight: '600', color: C.gray800 },
  toggleRowSub: { fontSize: 11, color: C.gray400, marginTop: 1 },
  toggleBadge: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  toggleBadgeText: { fontSize: 13, fontWeight: '700', color: C.gray600 },
  toggleBadgeRefugee: { backgroundColor: '#eff6ff' },
  toggleBadgeDisability: { backgroundColor: C.gray100 },
  toggleBadgeDisabilityActive: { backgroundColor: '#fee2e2' },
  cardDivider: { height: 1, backgroundColor: C.gray200, marginVertical: 12 },
  disabilityMasterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, paddingVertical: 8 },
  disabilityMasterRowActive: {},
  disabilityMasterLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  disabilityMasterRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  disabilityMasterTitleActive: { color: '#dc2626' },
  disabilityBadgeCount: { backgroundColor: C.dangerLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  disabilityBadgeCountText: { fontSize: 11, fontWeight: '700', color: '#dc2626' },
  disabilitySubWrap: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: C.gray200 },
  disabilitySubHint: { fontSize: 11, color: C.gray400, marginBottom: 12, textAlign: 'center', fontStyle: 'italic' },
  disabilityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  disabilityCard: {
    width: '47.5%',
    backgroundColor: C.gray50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.gray200,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  disabilityCardActive: { backgroundColor: '#f0fdf4', borderColor: C.primaryMid },
  disabilityCardLeft: { flex: 1, gap: 6 },
  disabilityIconWrap: { width: 38, height: 38, borderRadius: 10, backgroundColor: C.gray200, alignItems: 'center', justifyContent: 'center' },
  disabilityIconWrapActive: { backgroundColor: C.primaryLight },
  disabilityIcon: { fontSize: 18 },
  disabilityLabel: { fontSize: 12, fontWeight: '500', color: C.gray600, lineHeight: 16 },
  disabilityLabelActive: { color: '#065f46', fontWeight: '600' },
  footer: {
    backgroundColor: C.white,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: C.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  backBtn: { flex: 1 },
  nextBtn: { flex: 2 },
});

export default StudentFormSectionB;