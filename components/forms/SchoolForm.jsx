import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import * as Yup from 'yup';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import ShiftSelector from '../ui/ShiftSelector';
import PrimaryButton from '../ui/PrimaryButton';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { SCHOOL_LEVELS, SCHOOL_SHIFTS, DISTRICT_LIST, DISTRICTS } from '../../constants/formData';

// DB field mapping:
// schoolCode    STRING(20)  allowNull: false, unique
// schoolName    STRING(200) allowNull: false
// schoolLevel   STRING(50)  allowNull: true
// schoolShift   STRING(20)  allowNull: true
// district      STRING(100) allowNull: true
// taluka        STRING(100) allowNull: true
// unionCouncil  STRING(100) allowNull: true
// schoolAddress STRING(300) allowNull: true

const schoolSchema = Yup.object({
  schoolCode: Yup.string()
    .required('School code is required')
    .matches(/^\d{9}$/, 'School code must be 9 digits')
    .max(20, 'School code too long'),

  schoolName: Yup.string()
    .required('School name is required')
    .min(3, 'School name must be at least 3 characters')
    .max(200, 'School name must be under 200 characters'),

  schoolLevel: Yup.string().max(50).nullable().optional(),
  schoolShift:  Yup.string().max(20).nullable().optional(),
  district:     Yup.string().max(100).nullable().optional(),
  taluka:       Yup.string().max(100).nullable().optional(),
  unionCouncil: Yup.string().max(100).nullable().optional(),
  schoolAddress:Yup.string().max(300, 'Address must be under 300 characters').nullable().optional(),
});

const SchoolForm = ({ data, onChange, onNext }) => {
  const [errors, setErrors] = useState({});
  const talukaOptions = data.district ? DISTRICTS[data.district] || [] : [];

  const handleNext = async () => {
    try {
      await schoolSchema.validate(data, { abortEarly: false });
      setErrors({});
      onNext();
    } catch (err) {
      const newErrors = {};
      err.inner.forEach((e) => { newErrors[e.path] = e.message; });
      setErrors(newErrors);
    }
  };

  const handleDistrictChange = (district) => {
    onChange({ district, taluka: '' });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionTitle}>School Information</Text>
            <View style={styles.sectionLine} />
          </View>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <FormInput
                label="School Code"
                required
                value={data.schoolCode}
                onChangeText={(v) => onChange({ schoolCode: v })}
                placeholder="e.g. 160105061"
                keyboardType="numeric"
                maxLength={20}
                error={errors.schoolCode}
              />
            </View>
            <View style={styles.halfField}>
              <FormSelect
                label="School Level"
                options={SCHOOL_LEVELS}
                value={data.schoolLevel}
                onChange={(v) => onChange({ schoolLevel: v })}
                error={errors.schoolLevel}
              />
            </View>
          </View>

          <FormInput
            label="School Name"
            required
            value={data.schoolName}
            onChangeText={(v) => onChange({ schoolName: v })}
            placeholder="e.g. Faizan Public School"
            maxLength={200}
            error={errors.schoolName}
          />

          <ShiftSelector
            label="School Shift"
            options={SCHOOL_SHIFTS}
            value={data.schoolShift}
            onChange={(v) => onChange({ schoolShift: v })}
            error={errors.schoolShift}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.sectionLine} />
          </View>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <FormSelect
                label="District"
                options={DISTRICT_LIST}
                value={data.district}
                onChange={handleDistrictChange}
                placeholder="Select District"
                error={errors.district}
              />
            </View>
            <View style={styles.halfField}>
              <FormSelect
                label="Taluka"
                options={talukaOptions}
                value={data.taluka}
                onChange={(v) => onChange({ taluka: v })}
                placeholder="Select district first"
                disabled={!data.district}
                error={errors.taluka}
              />
            </View>
          </View>

          <FormInput
            label="Union Council"
            value={data.unionCouncil}
            onChangeText={(v) => onChange({ unionCouncil: v })}
            placeholder="e.g. Makhdom Bilawal"
            maxLength={100}
          />

          <FormInput
            label="School Address"
            value={data.schoolAddress}
            onChangeText={(v) => onChange({ schoolAddress: v })}
            placeholder="Complete address..."
            multiline
            numberOfLines={3}
            maxLength={300}
            style={styles.textArea}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title="Continue →" onPress={handleNext} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray100 },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.xl, paddingBottom: Spacing.lg, gap: Spacing.md },
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
  textArea: { minHeight: 90, textAlignVertical: 'top', paddingTop: Spacing.md },
  footer: {
    backgroundColor: Colors.white,
    padding: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default SchoolForm;