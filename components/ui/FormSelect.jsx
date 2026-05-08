import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

const FormSelect = ({
  label,
  required = false,
  placeholder = 'Select...',
  options,
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const [visible, setVisible] = useState(false);

  const handleSelect = (item) => {
    onChange(item);
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.required}> *</Text>}
      </View>

      <TouchableOpacity
        style={[
          styles.selector,
          error ? styles.selectorError : null,
          disabled ? styles.selectorDisabled : null,
        ]}
        onPress={() => !disabled && setVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.selectorText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modalContainer}>
            <SafeAreaView>
              {/* Handle bar */}
              <View style={styles.handleBar} />

              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{label}</Text>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setVisible(false)}
                >
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={options}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.option,
                      value === item && styles.selectedOption,
                    ]}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        value === item && styles.selectedOptionText,
                      ]}
                    >
                      {item}
                    </Text>
                    {value === item && (
                      <View style={styles.checkCircle}>
                        <Text style={styles.checkmark}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
                style={styles.list}
                showsVerticalScrollIndicator={false}
              />
            </SafeAreaView>
          </View>
        </TouchableOpacity>
      </Modal>
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
  selector: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 50,
  },
  selectorError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  selectorDisabled: {
    backgroundColor: Colors.gray100,
    opacity: 0.6,
  },
  selectorText: {
    fontSize: FontSize.md,
    color: Colors.black,
    flex: 1,
  },
  placeholderText: {
    color: Colors.placeholderColor,
  },
  arrow: {
    fontSize: 10,
    color: Colors.primary,
    marginLeft: Spacing.sm,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '72%',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: Colors.gray300,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 13,
    color: Colors.gray600,
    fontWeight: '700',
  },
  list: {
    paddingBottom: Spacing.xxxl,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.gray100,
  },
  selectedOption: {
    backgroundColor: Colors.primaryLight,
  },
  optionText: {
    fontSize: FontSize.md,
    color: Colors.gray800,
  },
  selectedOptionText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '700',
  },
});

export default FormSelect;