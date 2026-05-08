import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

const MENU_ITEMS = [
  { icon: '📋', label: 'My Submissions', count: '5' },
  { icon: '🏫', label: 'Assigned Schools', count: '3' },
  { icon: '📊', label: 'Reports', count: '' },
  { icon: '⚙️', label: 'Settings', count: '' },
  { icon: '❓', label: 'Help & Support', count: '' },
];

export default function ProfileScreen() {
  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => router.replace('/(auth)/signin') },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>U</Text>
        </View>
        <Text style={styles.name}>Data Entry Officer</Text>
        <Text style={styles.email}>officer@sef.org.pk</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>SEF Staff</Text>
        </View>
      </View>

      <View style={styles.content}>
        {MENU_ITEMS.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} activeOpacity={0.7}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <View style={styles.menuRight}>
              {item.count ? (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{item.count}</Text>
                </View>
              ) : null}
              <Text style={styles.menuArrow}>›</Text>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>SEF Student Profile v1.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.gray100 },
  header: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: Spacing.md,
  },
  avatarText: { fontSize: 34, fontWeight: '700', color: Colors.white },
  name: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.white },
  email: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  badge: {
    marginTop: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  badgeText: { fontSize: FontSize.xs, color: Colors.white, fontWeight: '700' },
  content: { flex: 1, padding: Spacing.xl },
  menuItem: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: { fontSize: 20, marginRight: Spacing.md },
  menuLabel: { flex: 1, fontSize: FontSize.md, color: Colors.black, fontWeight: '500' },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  countBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  countText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '700' },
  menuArrow: { fontSize: 22, color: Colors.gray400 },
  signOutBtn: {
    marginTop: Spacing.xl,
    borderWidth: 2,
    borderColor: Colors.error,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  signOutText: { fontSize: FontSize.md, color: Colors.error, fontWeight: '700' },
  version: {
    textAlign: 'center',
    color: Colors.gray400,
    fontSize: FontSize.xs,
    marginTop: Spacing.xl,
  },
});
