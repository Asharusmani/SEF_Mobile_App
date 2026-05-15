import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

const FormHeader = () => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.header}>

        {/* Logo box */}
        <View style={styles.logoBox}>
          <Text style={styles.logoIcon}>🏫</Text>
        </View>

        {/* Title + subtitle */}
        <View style={styles.headerText}>
          <Text style={styles.title}>SEF Student Profile</Text>
          <Text style={styles.subtitle}>
            Foundation Assisted Schools · Data Collection
          </Text>
        </View>

        {/* FAS badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>FAS</Text>
        </View>

      </View>

      {/* Accent underline */}
      <View style={styles.accentLine} />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  logoBox: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoIcon: {
    fontSize: 22,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 3,
    letterSpacing: 0.2,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1.5,
  },
  accentLine: {
    height: 3,
    backgroundColor: Colors.secondary,
    opacity: 0.7,
  },
});

export default FormHeader;