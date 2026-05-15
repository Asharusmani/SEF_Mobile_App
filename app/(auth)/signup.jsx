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
  Alert,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { registerUser } from '../../api/auth';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const clearError = (field) =>
    setErrors((prev) => ({ ...prev, [field]: null }));

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
      newErrors.password = 'Must have uppercase, lowercase, number & special char (@$!%*?&)';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await registerUser({ name, email, password, confirmPassword });
      Alert.alert(
        'Account Created!',
        'Your account has been created successfully.',
        [{ text: 'Sign In', onPress: () => router.replace('/(auth)/signin') }]
      );
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please try again.';

      console.log('[SignUp Error]', err.response?.status, message);
      console.log('[SignUp Errors]', err.response?.data?.errors);

      const backendErrors = err.response?.data?.errors;
      if (backendErrors) {
        setErrors({
          name: backendErrors.name,
          email: backendErrors.email,
          password: backendErrors.password,
          confirmPassword: backendErrors.confirmPassword,
        });
      } else {
        const msg = message.toLowerCase();
        if (msg.includes('email')) {
          setErrors({ email: message });
        } else {
          Alert.alert('Registration Failed', message);
        }
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
        <View style={styles.brandSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🏫</Text>
          </View>
          <Text style={styles.brandTitle}>Create Account</Text>
          <Text style={styles.brandSubtitle}>SEF Student Profile System</Text>
        </View>

        <View style={styles.card}>

          {/* Full Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>FULL NAME</Text>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : null]}
              value={name}
              onChangeText={(v) => { setName(v); clearError('name'); }}
              placeholder="e.g. Muhammad Usman"
              placeholderTextColor={Colors.placeholderColor}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          {/* Email */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              ref={emailRef}
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
                placeholder="e.g. Test@1234"
                placeholderTextColor={Colors.placeholderColor}
                secureTextEntry={!showPassword}
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password
              ? <Text style={styles.errorText}>{errors.password}</Text>
              : <Text style={styles.hintText}>Uppercase, lowercase, number & special char (@$!%*?&)</Text>
            }
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>CONFIRM PASSWORD</Text>
            <View style={styles.passwordRow}>
              <TextInput
                ref={confirmPasswordRef}
                style={[
                  styles.input,
                  styles.passwordInput,
                  errors.confirmPassword ? styles.inputError : null,
                ]}
                value={confirmPassword}
                onChangeText={(v) => { setConfirmPassword(v); clearError('confirmPassword'); }}
                placeholder="Re-enter your password"
                placeholderTextColor={Colors.placeholderColor}
                secureTextEntry={!showConfirmPassword}
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.eyeIcon}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.confirmPassword
              ? <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              : null
            }
          </View>

          <TouchableOpacity
            style={[styles.signUpBtn, loading && styles.btnDisabled]}
            onPress={handleSignUp}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.signUpBtnText}>
              {loading ? 'Creating Account...' : 'Create Account →'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signInLink}
            onPress={() => router.replace('/(auth)/signin')}
          >
            <Text style={styles.signInLinkText}>
              Already have an account?{' '}
              <Text style={styles.signInLinkBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>

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
  brandSection: { alignItems: 'center', marginBottom: Spacing.xxl },
  logoCircle: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md, borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoEmoji: { fontSize: 34 },
  brandTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.white },
  brandSubtitle: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
  card: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    padding: Spacing.xxl, shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18, shadowRadius: 24, elevation: 12,
  },
  fieldContainer: { marginBottom: Spacing.lg },
  label: {
    fontSize: FontSize.xs, fontWeight: '700',
    color: Colors.labelColor, letterSpacing: 0.8, marginBottom: Spacing.sm,
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
    top: 0, bottom: 0, justifyContent: 'center', paddingHorizontal: Spacing.sm,
  },
  eyeIcon: { fontSize: 18 },
  errorText: { fontSize: FontSize.xs, color: Colors.error, marginTop: Spacing.xs },
  hintText: { fontSize: FontSize.xs, color: Colors.gray400, marginTop: Spacing.xs },
  signUpBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg, alignItems: 'center', marginTop: Spacing.sm,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  btnDisabled: { backgroundColor: Colors.gray400, shadowOpacity: 0, elevation: 0 },
  signUpBtnText: {
    color: Colors.white, fontSize: FontSize.lg, fontWeight: '700', letterSpacing: 0.3,
  },
  signInLink: { marginTop: Spacing.xl, alignItems: 'center' },
  signInLinkText: { fontSize: FontSize.sm, color: Colors.gray600 },
  signInLinkBold: { color: Colors.primary, fontWeight: '700' },
});