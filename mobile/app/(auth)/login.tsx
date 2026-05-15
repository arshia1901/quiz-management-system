/**
 * mobile/app/(auth)/login.tsx
 * Login screen — matches web AuthScreen exactly:
 *  - Role selector cards (Student / Teacher)
 *  - Email + password fields
 *  - Login / Register tabs
 */

import { useState } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../src/store";
import { authAPI } from "../../src/api";
import { Button } from "../../src/components";
import { colors, typography, spacing, radius } from "../../src/theme";

type Tab = "login" | "signup";
type Role = "STUDENT" | "TEACHER";

export default function LoginScreen() {
  const { login } = useAuth();

  const [tab, setTab] = useState<Tab>("login");
  const [role, setRole] = useState<Role>("STUDENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please enter email and password.");
      return;
    }
    if (tab === "signup" && !name.trim()) {
      Alert.alert("Missing fields", "Please enter your full name.");
      return;
    }

    setLoading(true);
    try {
      let res: any;
      if (tab === "login") {
        res = await authAPI.login(email.trim().toLowerCase(), password, role);
      } else {
        res = await authAPI.register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
          department: department.trim() || undefined,
        });
      }
      await login({ ...res, role: res.role });
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const roles: { key: Role; icon: string; label: string; desc: string }[] = [
    { key: "STUDENT", icon: "🎓", label: "Student", desc: "Take quizzes & track progress" },
    { key: "TEACHER", icon: "👨‍🏫", label: "Teacher", desc: "Create & manage assessments" },
  ];

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {/* Background gradient */}
      <LinearGradient
        colors={["rgba(108,99,255,0.15)", "rgba(168,85,247,0.05)", colors.bg1]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoRow}>
            <LinearGradient
              colors={["#6c63ff", "#a855f7"]}
              style={styles.logoIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.logoEmoji}>⚡</Text>
            </LinearGradient>
            <Text style={styles.logoText}>
              Examify<Text style={styles.logoAccent}>.ai</Text>
            </Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Tabs */}
            <View style={styles.tabRow}>
              {(["login", "signup"] as Tab[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.tabItem, tab === t && styles.tabItemActive]}
                  onPress={() => setTab(t)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                    {t === "login" ? "Sign in" : "Create account"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.title}>
              {tab === "login" ? "Welcome back" : "Join Examify"}
            </Text>
            <Text style={styles.subtitle}>
              {tab === "login" ? "Sign in to your account" : "Create your free account"}
            </Text>

            {/* Role selector */}
            <View style={styles.roleRow}>
              {roles.map((r) => (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.roleCard, role === r.key && styles.roleCardActive]}
                  onPress={() => setRole(r.key)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.roleIcon}>{r.icon}</Text>
                  <Text style={[styles.roleName, role === r.key && styles.roleNameActive]}>
                    {r.label}
                  </Text>
                  <Text style={styles.roleDesc}>{r.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with email</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Form fields */}
            {tab === "signup" && (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your name"
                  placeholderTextColor={colors.textFaint}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={styles.input}
                placeholder="you@college.edu"
                placeholderTextColor={colors.textFaint}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.textFaint}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {tab === "signup" && (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Department (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Computer Science"
                  placeholderTextColor={colors.textFaint}
                  value={department}
                  onChangeText={setDepartment}
                />
              </View>
            )}

            <Button
              label={tab === "login" ? "Sign in" : "Create account"}
              onPress={handleSubmit}
              loading={loading}
              style={{ marginTop: spacing.sm }}
            />

            <Text style={styles.footer}>
              Secured by JWT · Role-based access · One-device restriction
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg1,
  },
  scroll: {
    flexGrow: 1,
    padding: spacing["2xl"],
    justifyContent: "center",
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: spacing["3xl"],
    justifyContent: "center",
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  logoEmoji: {
    fontSize: 20,
  },
  logoText: {
    fontSize: typography["2xl"],
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.5,
  },
  logoAccent: {
    color: colors.accent,
  },
  card: {
    backgroundColor: colors.bg2,
    borderRadius: radius.xl,
    padding: spacing["2xl"],
    borderWidth: 1,
    borderColor: colors.bg4,
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: colors.bg3,
    borderRadius: radius.md,
    padding: 3,
    marginBottom: spacing.xl,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: radius.sm,
    alignItems: "center",
  },
  tabItemActive: {
    backgroundColor: colors.bg1,
    borderWidth: 1,
    borderColor: colors.bg4,
  },
  tabText: {
    fontSize: typography.sm,
    color: colors.textMuted,
    fontWeight: "500",
  },
  tabTextActive: {
    color: colors.text,
    fontWeight: "700",
  },
  title: {
    fontSize: typography.xl,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: typography.sm,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  roleRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  roleCard: {
    flex: 1,
    backgroundColor: colors.bg3,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.bg4,
    alignItems: "center",
    gap: 4,
  },
  roleCardActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  roleIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  roleName: {
    fontSize: typography.sm,
    fontWeight: "700",
    color: colors.textMuted,
  },
  roleNameActive: {
    color: colors.accent,
  },
  roleDesc: {
    fontSize: 10,
    color: colors.textFaint,
    textAlign: "center",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.bg4,
  },
  dividerText: {
    fontSize: typography.xs,
    color: colors.textFaint,
    whiteSpace: "nowrap",
  } as any,
  fieldGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.xs,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: 6,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: colors.bg3,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.bg4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: typography.base,
  },
  footer: {
    fontSize: typography.xs,
    color: colors.textFaint,
    textAlign: "center",
    marginTop: spacing.lg,
  },
});
