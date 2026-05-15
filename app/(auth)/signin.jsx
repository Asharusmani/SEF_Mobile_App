import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { loginUser } from '../../api/auth';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const passwordRef = useRef(null);

  const clearError = (field) =>
    setErrors((prev) => ({ ...prev, [field]: null }));

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = 'Enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await loginUser({ email: email.trim().toLowerCase(), password });
      router.replace('/(auth)/selectschool');
      // instead of router.replace('/(tabs)')
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Something went wrong. Please try again.';

      console.log('[SignIn Error]', err.response?.status, message);

      const msg = message.toLowerCase();
      if (
        msg.includes('invalid credentials') ||
        msg.includes('password') ||
        msg.includes('attempts remaining')
      ) {
        setErrors({ password: message });
      } else if (msg.includes('email')) {
        setErrors({ email: message });
      } else {
        Alert.alert('Sign In Failed', message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {/* Brand */}
        <View style={styles.brandSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🏫</Text>
          </View>
          <Text style={styles.brandTitle}>SEF Student Profile</Text>
          <Text style={styles.brandSubtitle}>
            Foundation Assisted Schools · Data Collection
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome Back</Text>
          <Text style={styles.cardSubtitle}>Sign in to continue</Text>

          {/* Email */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              value={email}
              onChangeText={(v) => { setEmail(v); clearError('email'); }}
              placeholder="example@sef.org.pk"
              placeholderTextColor={Colors.placeholderColor}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          {/* Password */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.passwordRow}>
              <TextInput
                ref={passwordRef}
                style={[
                  styles.input,
                  styles.passwordInput,
                  errors.password ? styles.inputError : null,
                ]}
                value={password}
                onChangeText={(v) => { setPassword(v); clearError('password'); }}
                placeholder="Enter your password"
                placeholderTextColor={Colors.placeholderColor}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleSignIn}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.signInBtn, loading && styles.signInBtnDisabled]}
            onPress={handleSignIn}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.signInBtnText}>
              {loading ? 'Signing In...' : 'Sign In →'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.signUpBtn}
            onPress={() => router.push('/(auth)/signup')}
          >
            <Text style={styles.signUpBtnText}>Create New Account</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>SEF Data Collection v1.0</Text>
        {/* Extra padding so form is not behind keyboard on Android */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: Spacing.xxxl,
  },
  brandSection: { alignItems: 'center', marginBottom: Spacing.xxxl },
  logoCircle: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg, borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoEmoji: { fontSize: 38 },
  brandTitle: {
    fontSize: FontSize.xxl, fontWeight: '800',
    color: Colors.white, letterSpacing: 0.3,
  },
  brandSubtitle: {
    fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)',
    marginTop: Spacing.xs, textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    padding: Spacing.xxl, shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18, shadowRadius: 24, elevation: 12,
  },
  cardTitle: {
    fontSize: FontSize.xxl, fontWeight: '800',
    color: Colors.primary, marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    fontSize: FontSize.md, color: Colors.gray500,
    marginBottom: Spacing.xxl,
  },
  fieldContainer: { marginBottom: Spacing.lg },
  label: {
    fontSize: FontSize.xs, fontWeight: '700',
    color: Colors.labelColor, letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md, fontSize: FontSize.md,
    color: Colors.black, minHeight: 50, backgroundColor: Colors.white,
  },
  inputError: { borderColor: Colors.error, backgroundColor: Colors.errorLight },
  passwordRow: { position: 'relative' },
  passwordInput: { paddingRight: 50 },
  eyeBtn: {
    position: 'absolute', right: Spacing.md,
    top: 0, bottom: 0, justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  eyeIcon: { fontSize: 18 },
  errorText: { fontSize: FontSize.xs, color: Colors.error, marginTop: Spacing.xs },
  forgotText: {
    fontSize: FontSize.sm, color: Colors.primary,
    fontWeight: '600', textAlign: 'right', marginBottom: Spacing.xl,
  },
  signInBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  signInBtnDisabled: { backgroundColor: Colors.gray400, shadowOpacity: 0, elevation: 0 },
  signInBtnText: {
    color: Colors.white, fontSize: FontSize.lg,
    fontWeight: '700', letterSpacing: 0.3,
  },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.xl },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.gray200 },
  dividerText: {
    fontSize: FontSize.xs, color: Colors.gray400,
    fontWeight: '700', marginHorizontal: Spacing.md, letterSpacing: 1,
  },
  signUpBtn: {
    borderWidth: 2, borderColor: Colors.primary,
    borderRadius: BorderRadius.lg, paddingVertical: Spacing.lg, alignItems: 'center',
  },
  signUpBtnText: { color: Colors.primary, fontSize: FontSize.md, fontWeight: '700' },
  version: {
    color: 'rgba(255,255,255,0.4)', fontSize: FontSize.xs,
    textAlign: 'center', marginTop: Spacing.xl,
  },
});