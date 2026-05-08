import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

interface ShiftSelectorProps {
  label: string;
  required?: boolean;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const ShiftSelector: React.FC<ShiftSelectorProps> = ({
  label,
  required = false,
  options,
  value,
  onChange,
  error,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.required}> *</Text>}
      </View>
      <View style={styles.optionsRow}>
        {options.map((option, index) => {
          const isSelected = value === option;
          const isFirst = index === 0;
          const isLast = index === options.length - 1;
          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.option,
                isFirst && styles.optionFirst,
                isLast && styles.optionLast,
                isSelected && styles.optionSelected,
              ]}
              onPress={() => onChange(option)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
  optionsRow: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  option: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  optionFirst: {
    borderLeftWidth: 0,
  },
  optionLast: {
    borderRightWidth: 0,
  },
  optionSelected: {
    backgroundColor: Colors.primary,
  },
  optionText: {
    fontSize: FontSize.md,
    color: Colors.gray700,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: Colors.white,
    fontWeight: '700',
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});

export default ShiftSelector;
