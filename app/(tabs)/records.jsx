import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

const DEMO_RECORDS = [
  { id: '1', name: 'Ahmed Ali Khan', grade: 'Grade 5', school: 'Faizan Public School', date: '01/05/2025' },
  { id: '2', name: 'Fatima Noor', grade: 'Grade 3', school: 'Model School Karachi', date: '28/04/2025' },
  { id: '3', name: 'Usman Tariq', grade: 'Grade 8', school: 'Al-Noor School', date: '25/04/2025' },
  { id: '4', name: 'Sara Malik', grade: 'Grade 6', school: 'Bright Future Academy', date: '22/04/2025' },
  { id: '5', name: 'Hassan Raza', grade: 'Grade 4', school: 'Faizan Public School', date: '20/04/2025' },
];

export default function RecordsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Student Records</Text>
        <Text style={styles.headerSubtitle}>{DEMO_RECORDS.length} entries found</Text>
      </View>

      <FlatList
        data={DEMO_RECORDS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.7}>
            <View style={styles.cardLeft}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name[0]}</Text>
              </View>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.studentName}>{item.name}</Text>
              <Text style={styles.studentMeta}>{item.grade} · {item.school}</Text>
              <Text style={styles.studentDate}>Added: {item.date}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        )}
        ListHeaderComponent={
          <View style={styles.demoTag}>
            <Text style={styles.demoText}>📋 Demo Data — Records will appear here after submission</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.gray100,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  list: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  demoTag: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  demoText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardLeft: { marginRight: Spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.white,
  },
  cardContent: { flex: 1 },
  studentName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.black,
  },
  studentMeta: {
    fontSize: FontSize.sm,
    color: Colors.gray500,
    marginTop: 2,
  },
  studentDate: {
    fontSize: FontSize.xs,
    color: Colors.gray400,
    marginTop: 2,
  },
  arrow: {
    fontSize: 22,
    color: Colors.gray400,
    marginLeft: Spacing.sm,
  },
});
