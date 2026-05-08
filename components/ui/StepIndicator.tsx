import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize } from '../../constants/theme';
import { FORM_STEPS } from '../../constants/formData';

interface StepIndicatorProps {
  currentStep: number;
  onStepPress?: (step: number) => void;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  onStepPress,
}) => {
  return (
    <View style={styles.container}>
      {FORM_STEPS.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;

        return (
          <TouchableOpacity
            key={step.id}
            style={[styles.step, isActive && styles.stepActive]}
            onPress={() => isCompleted && onStepPress?.(step.id)}
            activeOpacity={isCompleted ? 0.7 : 1}
          >
            <Text
              style={[
                styles.stepNumber,
                isActive && styles.stepNumberActive,
                isCompleted && styles.stepNumberCompleted,
              ]}
            >
              {isCompleted ? '✓' : step.id}
            </Text>
            <Text
              style={[
                styles.stepLabel,
                isActive && styles.stepLabelActive,
                isCompleted && styles.stepLabelCompleted,
              ]}
            >
              {step.label}
            </Text>
            {isActive && <View style={styles.activeUnderline} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryDark,
    paddingTop: Spacing.sm,
  },
  step: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.sm,
    position: 'relative',
  },
  stepActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  stepNumber: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 2,
  },
  stepNumberActive: {
    color: Colors.white,
  },
  stepNumberCompleted: {
    color: Colors.accent,
  },
  stepLabel: {
    fontSize: FontSize.xs - 1,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.6,
  },
  stepLabelActive: {
    color: Colors.white,
  },
  stepLabelCompleted: {
    color: Colors.accent,
  },
  activeUnderline: {
    position: 'absolute',
    bottom: 0,
    left: Spacing.lg,
    right: Spacing.lg,
    height: 3,
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
});

export default StepIndicator;
