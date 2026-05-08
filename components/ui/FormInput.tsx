import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

interface FormInputProps extends TextInputProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  required = false,
  error,
  hint,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.required}> *</Text>}
      </View>
      <TextInput
        style={[
          styles.input,
          error ? styles.inputError : null,
          style,
        ]}
        placeholderTextColor={Colors.placeholderColor}
        {...props}
      />
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.labelColor,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  required: {
    fontSize: FontSize.md,
    color: Colors.error,
    fontWeight: '700',
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.black,
    minHeight: 50,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  hintText: {
    fontSize: FontSize.xs,
    color: Colors.gray500,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});

export default FormInput;
