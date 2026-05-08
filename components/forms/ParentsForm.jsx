import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import * as Yup from 'yup';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import DocumentUpload from '../ui/DocumentUpload';
import PrimaryButton from '../ui/PrimaryButton';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { OCCUPATIONS, EDUCATION_LEVELS, RELATIONSHIPS } from '../../constants/formData';

// DB field mapping (parent_info table):
// fatherName      STRING(150) allowNull: true
// relation        STRING(50)  allowNull: true   ← guardianRelationship on form
// fatherCnic      STRING(20)  allowNull: true
// fatherMobile    STRING(20)  allowNull: true   ← fatherContact on form
// fatherEmail     STRING(150) allowNull: true
// occupation      STRING(50)  allowNull: true   ← fatherOccupation on form
// qualification   STRING(50)  allowNull: true   ← fatherEducation on form
// (mother fields map similarly via separate record or extended schema)
// (guardianCnic uploaded as fatherCnicFrontUrl/Key via DocumentUpload)

// Pakistani mobile: starts with 0, total 11 digits
const pkMobile = /^0\d{10}$/;

const parentsSchema = Yup.object({
  // Father
  fatherName: Yup.string()
    .required("Father's name is required")
    .max(150, "Father's name must be under 150 characters"),  // STRING(150)

  fatherCnic: Yup.string()
    .max(20, 'CNIC too long')                                 // STRING(20)
    .nullable()
    .optional(),

  fatherOccupation: Yup.string()
    .max(50)                                                  // STRING(50)
    .nullable()
    .optional(),

  fatherEducation: Yup.string()
    .max(50)                                                  // STRING(50)
    .nullable()
    .optional(),

  fatherContact: Yup.string()
    .max(20)                                                  // STRING(20)
    .nullable()
    .transform((v) => v === '' ? null : v)
    .matches(pkMobile, 'Enter valid 11-digit number (e.g. 03001234567)')
    .optional(),

  // Mother
  motherName: Yup.string()
    .required("Mother's name is required")
    .max(150, "Mother's name must be under 150 characters"),  // STRING(150)

  motherCnic: Yup.string()
    .max(20)                                                  // STRING(20)
    .nullable()
    .optional(),

  motherOccupation: Yup.string()
    .max(50)                                                  // STRING(50)
    .nullable()
    .optional(),

  motherEducation: Yup.string()
    .max(50)                                                  // STRING(50)
    .nullable()
    .optional(),

  motherContact: Yup.string()
    .max(20)                                                  // STRING(20)
    .nullable()
    .transform((v) => v === '' ? null : v)
    .matches(pkMobile, 'Enter valid 11-digit number (e.g. 03001234567)')
    .optional(),

  // Guardian
  guardianName: Yup.string()
    .max(150)
    .nullable()
    .optional(),

  guardianRelationship: Yup.string()
    .max(50)                                                  // maps to relation STRING(50)
    .nullable()
    .optional(),

  guardianContact: Yup.string()
    .max(20)
    .nullable()
    .optional(),

  // Income
  monthlyIncome: Yup.string()
    .nullable()
    .transform((v) => v === '' ? null : v)
    .test('is-number', 'Enter a valid amount in PKR', (v) => !v || !isNaN(Number(v)))
    .optional(),
});

const ParentsForm = ({ data, onChange, onBack, onSubmit }) => {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      await parentsSchema.validate(data, { abortEarly: false });
      setErrors({});
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        Alert.alert(
          '✅ Form Submitted!',
          'Student profile has been successfully saved.',
          [{ text: 'OK', onPress: onSubmit }]
        );
      }, 1500);
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
        {/* Card 1: Father */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionTitle}>Father Details</Text>
            <View style={styles.sectionLine} />
          </View>

          <FormInput
            label="Father's Full Name"
            required
            value={data.fatherName}
            onChangeText={(v) => onChange({ fatherName: v })}
            placeholder="e.g. Muhammad Ali Khan"
            maxLength={150}
            error={errors.fatherName}
          />

          <FormInput
            label="Father's CNIC"
            value={data.fatherCnic}
            onChangeText={(v) => onChange({ fatherCnic: v })}
            placeholder="12345-1234567-1"
            keyboardType="numeric"
            maxLength={20}
          />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <FormSelect
                label="Occupation"
                options={OCCUPATIONS}
                value={data.fatherOccupation}
                onChange={(v) => onChange({ fatherOccupation: v })}
              />
            </View>
            <View style={styles.halfField}>
              <FormSelect
                label="Education"
                options={EDUCATION_LEVELS}
                value={data.fatherEducation}
                onChange={(v) => onChange({ fatherEducation: v })}
              />
            </View>
          </View>

          <FormInput
            label="Father's Contact"
            value={data.fatherContact}
            onChangeText={(v) => onChange({ fatherContact: v })}
            placeholder="e.g. 03001234567"
            keyboardType="phone-pad"
            maxLength={20}
            error={errors.fatherContact}
          />
        </View>

        {/* Card 2: Mother */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionTitle}>Mother Details</Text>
            <View style={styles.sectionLine} />
          </View>

          <FormInput
            label="Mother's Full Name"
            required
            value={data.motherName}
            onChangeText={(v) => onChange({ motherName: v })}
            placeholder="e.g. Fatima Ali"
            maxLength={150}
            error={errors.motherName}
          />

          <FormInput
            label="Mother's CNIC"
            value={data.motherCnic}
            onChangeText={(v) => onChange({ motherCnic: v })}
            placeholder="12345-1234567-1"
            keyboardType="numeric"
            maxLength={20}
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
                options={EDUCATION_LEVELS}
                value={data.motherEducation}
                onChange={(v) => onChange({ motherEducation: v })}
              />
            </View>
          </View>

          <FormInput
            label="Mother's Contact"
            value={data.motherContact}
            onChangeText={(v) => onChange({ motherContact: v })}
            placeholder="e.g. 03001234567"
            keyboardType="phone-pad"
            maxLength={20}
            error={errors.motherContact}
          />
        </View>

        {/* Card 3: Guardian & Income */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionTitle}>Guardian & Income</Text>
            <View style={styles.sectionLine} />
          </View>

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
              <FormSelect
                label="Relationship"
                options={RELATIONSHIPS}
                value={data.guardianRelationship}
                onChange={(v) => onChange({ guardianRelationship: v })}
              />
            </View>
            <View style={styles.halfField}>
              <FormInput
                label="Guardian Contact"
                value={data.guardianContact}
                onChangeText={(v) => onChange({ guardianContact: v })}
                placeholder="03001234567"
                keyboardType="phone-pad"
                maxLength={20}
              />
            </View>
          </View>

          <FormInput
            label="Monthly Household Income (PKR)"
            value={data.monthlyIncome}
            onChangeText={(v) => onChange({ monthlyIncome: v })}
            placeholder="e.g. 25000"
            keyboardType="numeric"
            error={errors.monthlyIncome}
          />

          <DocumentUpload
            label="Guardian CNIC / Document"
            value={data.guardianCnic}
            onChange={(f) => onChange({ guardianCnic: f })}
            type="both"
            hint="Upload parent or guardian CNIC copy"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title="← Back" onPress={onBack} variant="outline" style={styles.backBtn} />
        <PrimaryButton
          title={loading ? 'Submitting...' : 'Submit ✓'}
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitBtn}
        />
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
  submitBtn: { flex: 2 },
});

export default ParentsForm;