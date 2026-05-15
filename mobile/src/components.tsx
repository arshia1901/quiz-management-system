/**
 * mobile/src/components.tsx
 * Shared UI components matching the web design system.
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, typography, spacing, radius } from "./theme";

// ─── StatusBadge ─────────────────────────────────────────────────────────────
interface StatusBadgeProps { status: string }
export function StatusBadge({ status }: StatusBadgeProps) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    live:     { bg: colors.greenSoft,  text: colors.green,  label: "● Live" },
    draft:    { bg: "rgba(100,100,120,0.2)", text: colors.textMuted, label: "Draft" },
    closed:   { bg: colors.amberSoft,  text: colors.amber,  label: "Closed" },
    flagged:  { bg: colors.redSoft,    text: colors.red,    label: "⚠ Flagged" },
    completed:{ bg: colors.greenSoft,  text: colors.green,  label: "Completed" },
  };
  const cfg = map[status] || map.draft;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

// ─── DiffBadge ───────────────────────────────────────────────────────────────
export function DiffBadge({ diff }: { diff: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    easy:   { bg: colors.greenSoft, text: colors.green },
    medium: { bg: colors.amberSoft, text: colors.amber },
    hard:   { bg: colors.redSoft,   text: colors.red },
  };
  const cfg = map[diff] || { bg: "rgba(100,100,120,0.2)", text: colors.textMuted };
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.badgeText, { color: cfg.text }]}>{diff}</Text>
    </View>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  up?: boolean;
  accent?: string;
}
export function StatCard({ label, value, delta, up, accent }: StatCardProps) {
  return (
    <Card style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, accent ? { color: accent } : {}]}>{value}</Text>
      {delta ? (
        <Text style={[styles.statDelta, { color: up ? colors.green : colors.amber }]}>
          {up ? "↑" : "↓"} {delta}
        </Text>
      ) : null}
    </Card>
  );
}

// ─── PrimaryButton ────────────────────────────────────────────────────────────
interface ButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  small?: boolean;
}
export function Button({ label, onPress, loading, disabled, style, variant = "primary", small }: ButtonProps) {
  if (variant === "primary") {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled || loading} style={[styles.btnWrap, style]} activeOpacity={0.85}>
        <LinearGradient
          colors={["#6c63ff", "#a855f7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.btnPrimary, small && styles.btnSmall]}
        >
          {loading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.btnPrimaryText}>{label}</Text>}
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  if (variant === "danger") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.btnSecondary, { borderColor: colors.red, backgroundColor: colors.redSoft }, small && styles.btnSmall, style]}
        activeOpacity={0.8}
      >
        <Text style={[styles.btnSecondaryText, { color: colors.red }]}>{label}</Text>
      </TouchableOpacity>
    );
  }
  if (variant === "ghost") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.btnGhost, small && styles.btnSmall, style]}
        activeOpacity={0.7}
      >
        <Text style={styles.btnGhostText}>{label}</Text>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.btnSecondary, small && styles.btnSmall, style]}
      activeOpacity={0.8}
    >
      <Text style={styles.btnSecondaryText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── SectionTitle ─────────────────────────────────────────────────────────────
export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </View>
  );
}

// ─── LoadingScreen ────────────────────────────────────────────────────────────
export function LoadingScreen() {
  return (
    <View style={styles.loadingScreen}>
      <ActivityIndicator color={colors.accent} size="large" />
    </View>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
export function Divider() {
  return <View style={styles.divider} />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: typography.xs,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: colors.bg2,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.bg4,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: 120,
    padding: spacing.md,
  },
  statLabel: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginBottom: 4,
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: typography["2xl"],
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },
  statDelta: {
    fontSize: typography.xs,
    fontWeight: "500",
  },
  btnWrap: {},
  btnPrimary: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: typography.md,
    letterSpacing: 0.3,
  },
  btnSecondary: {
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.bg4,
    backgroundColor: colors.bg3,
  },
  btnSecondaryText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: typography.md,
  },
  btnGhost: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  btnGhostText: {
    color: colors.accent,
    fontWeight: "600",
    fontSize: typography.sm,
  },
  btnSmall: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: "700",
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: typography.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyMessage: {
    fontSize: typography.base,
    color: colors.textMuted,
    textAlign: "center",
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: colors.bg1,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: colors.bg4,
    marginVertical: spacing.md,
  },
});
