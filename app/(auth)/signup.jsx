import React, { useState } from 'react';
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

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = 'Enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8)
      newErrors.password = 'Password must be at least 8 characters';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Account Created!', 'Your account has been created successfully.', [
        { text: 'Sign In', onPress: () => router.replace('/(auth)/sign-in') },
      ]);
    }, 1200);
  };

  const Field = ({ label, value, setter, placeholder, error, options = {} }) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        value={value}
        onChangeText={setter}
        placeholder={placeholder}
        placeholderTextColor={Colors.placeholderColor}
        autoCorrect={false}
        {...options}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🏫</Text>
          </View>
          <Text style={styles.brandTitle}>Create Account</Text>
          <Text style={styles.brandSubtitle}>SEF Student Profile System</Text>
        </View>

        <View style={styles.card}>
          <Field
            label="FULL NAME"
            value={fullName}
            setter={setFullName}
            placeholder="e.g. Muhammad Usman"
            error={errors.fullName}
            options={{ autoCapitalize: 'words' }}
          />

          <Field
            label="EMAIL ADDRESS"
            value={email}
            setter={setEmail}
            placeholder="example@sef.org.pk"
            error={errors.email}
            options={{ keyboardType: 'email-address', autoCapitalize: 'none' }}
          />

          {/* Password with toggle */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  errors.password ? styles.inputError : null,
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="Min 8 characters"
                placeholderTextColor={Colors.placeholderColor}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}
          </View>

          <Field
            label="CONFIRM PASSWORD"
            value={confirmPassword}
            setter={setConfirmPassword}
            placeholder="Re-enter your password"
            error={errors.confirmPassword}
            options={{ secureTextEntry: true }}
          />

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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: Spacing.xxxl,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoEmoji: { fontSize: 34 },
  brandTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.white,
  },
  brandSubtitle: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  fieldContainer: { marginBottom: Spacing.lg },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.labelColor,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.black,
    minHeight: 50,
    backgroundColor: Colors.white,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  passwordRow: { position: 'relative' },
  passwordInput: { paddingRight: 50 },
  eyeBtn: {
    position: 'absolute',
    right: Spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  eyeIcon: { fontSize: 18 },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  signUpBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  btnDisabled: {
    backgroundColor: Colors.gray400,
    shadowOpacity: 0,
    elevation: 0,
  },
  signUpBtnText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  signInLink: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  signInLinkText: {
    fontSize: FontSize.sm,
    color: Colors.gray600,
  },
  signInLinkBold: {
    color: Colors.primary,
    fontWeight: '700',
  },
});