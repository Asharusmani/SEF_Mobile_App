import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="signin" />       {/* ← pehle */}
      <Stack.Screen name="signup" />
      <Stack.Screen name="selectschool" /> {/* ← baad mein */}
    </Stack>
  );
}