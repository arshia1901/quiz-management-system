/**
 * mobile/app/(teacher)/profile.tsx
 * Teacher profile + logout.
 */

import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../src/store";
import { Card, Button, Divider } from "../../src/components";
import { colors, typography, spacing, radius } from "../../src/theme";

export default function TeacherProfile() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: logout },
    ]);
  };

  const initials = (user?.name ?? "T")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Profile</Text>

      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <LinearGradient
          colors={["#6c63ff", "#a855f7"]}
          style={styles.avatar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </LinearGradient>
        <Text style={styles.name}>{user?.name}</Text>
        <View style={styles.rolePill}>
          <Text style={styles.roleText}>👨‍🏫 Teacher</Text>
        </View>
      </View>

      {/* Info */}
      <Card>
        <InfoRow label="Email" value={user?.email ?? "—"} />
        <Divider />
        <InfoRow label="Role" value="Teacher" />
        <Divider />
        <InfoRow label="User ID" value={(user?.user_id ?? "").slice(0, 8) + "..."} />
      </Card>

      <Button label="Sign out" onPress={handleLogout} variant="danger" style={{ marginTop: spacing.md }} />
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg1 },
  content: { padding: spacing.lg, paddingTop: 56 },
  pageTitle: {
    fontSize: typography["2xl"],
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.xl,
    letterSpacing: -0.5,
  },
  avatarWrap: { alignItems: "center", marginBottom: spacing["2xl"] },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  avatarText: { fontSize: 32, fontWeight: "800", color: "#fff" },
  name: { fontSize: typography.xl, fontWeight: "800", color: colors.text, marginBottom: 8 },
  rolePill: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  roleText: { fontSize: typography.sm, color: colors.accent, fontWeight: "700" },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  infoLabel: { fontSize: typography.sm, color: colors.textMuted, fontWeight: "500" },
  infoValue: { fontSize: typography.sm, color: colors.text, fontWeight: "600", flexShrink: 1, textAlign: "right" },
});
