import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize } from '../../constants/theme';

// Tab icon component — color properly pass hota hai
const TabIcon = ({ emoji, color, focused }) => (
  <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
    <Text style={styles.emoji}>{emoji}</Text>
  </View>
);

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  // Android navigation bar ka bottom padding
  const bottomPad = Platform.OS === 'android' ? Math.max(insets.bottom, 8) : 8;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray400,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.gray200,
          borderTopWidth: 1,
          paddingBottom: bottomPad,
          paddingTop: 6,
          height: 56 + bottomPad,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.07,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Data Entry',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon emoji="📋" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: 'Records',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon emoji="📁" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon emoji="👤" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  iconWrapActive: {
    backgroundColor: Colors.primaryLight,
  },
  emoji: {
    fontSize: 20,
  },
});