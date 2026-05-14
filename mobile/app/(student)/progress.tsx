/**
 * mobile/app/(student)/progress.tsx
 * Student progress / analytics screen.
 */

import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { analyticsAPI } from "../../src/api";
import { Card, SectionTitle, EmptyState, LoadingScreen } from "../../src/components";
import { colors, typography, spacing, radius } from "../../src/theme";

export default function StudentProgress() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await analyticsAPI.student();
      setData(res);
    } catch (e) {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);
  const onRefresh = () => { setRefreshing(true); load(); };

  if (loading) return <LoadingScreen />;

  const recent: any[] = data?.recent ?? [];

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>My Progress</Text>

      {/* Summary cards */}
      <View style={styles.statsGrid}>
        <Card style={styles.bigStat}>
          <Text style={styles.bigStatValue}>{data?.total_quizzes ?? 0}</Text>
          <Text style={styles.bigStatLabel}>Quizzes Taken</Text>
        </Card>
        <Card style={[styles.bigStat, { borderColor: "rgba(34,211,160,0.3)" }]}>
          <Text style={[styles.bigStatValue, { color: colors.green }]}>
            {data?.avg_score ?? 0}%
          </Text>
          <Text style={styles.bigStatLabel}>Avg Score</Text>
        </Card>
      </View>

      {/* Score bar chart */}
      {recent.length > 0 && (
        <>
          <SectionTitle title="Score Trends" subtitle="Your last 5 quiz results" />
          <Card>
            <View style={styles.barChart}>
              {recent.map((r: any, i: number) => {
                const pct = Math.min(100, Math.max(0, r.score ?? 0));
                const barColor = pct > 75 ? colors.green : pct > 50 ? colors.amber : colors.red;
                return (
                  <View key={i} style={styles.barCol}>
                    <Text style={[styles.barScore, { color: barColor }]}>{pct}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { height: `${pct}%` as any, backgroundColor: barColor }]} />
                    </View>
                    <Text style={styles.barLabel} numberOfLines={1}>
                      {(r.title ?? "").slice(0, 6)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>
        </>
      )}

      {/* Recent results list */}
      <SectionTitle title="Recent Results" />
      {recent.length === 0
        ? <EmptyState icon="📊" message="Complete quizzes to see your results here" />
        : recent.map((r: any, i: number) => (
            <Card key={i}>
              <View style={styles.resultRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultTitle}>{r.title}</Text>
                  <Text style={styles.resultDate}>
                    {r.submit_time ? new Date(r.submit_time).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric"
                    }) : ""}
                  </Text>
                </View>
                <View style={styles.scoreCircle}>
                  <Text style={[
                    styles.scoreCircleText,
                    { color: r.score > 75 ? colors.green : r.score > 50 ? colors.amber : colors.red }
                  ]}>
                    {r.score ?? 0}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
    </ScrollView>
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
  statsGrid: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg },
  bigStat: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.xl,
    borderColor: "rgba(108,99,255,0.3)",
  },
  bigStatValue: {
    fontSize: typography["3xl"],
    fontWeight: "800",
    color: colors.accent,
    marginBottom: 4,
  },
  bigStatLabel: { fontSize: typography.sm, color: colors.textMuted, fontWeight: "500" },
  barChart: {
    flexDirection: "row",
    height: 120,
    gap: spacing.sm,
    alignItems: "flex-end",
  },
  barCol: { flex: 1, alignItems: "center", height: "100%" },
  barScore: { fontSize: 10, fontWeight: "700", marginBottom: 4 },
  barTrack: {
    flex: 1,
    width: "70%",
    backgroundColor: colors.bg3,
    borderRadius: radius.sm,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  barFill: { width: "100%", borderRadius: radius.sm },
  barLabel: { fontSize: 9, color: colors.textFaint, marginTop: 4, textAlign: "center" },
  resultRow: { flexDirection: "row", alignItems: "center" },
  resultTitle: { fontSize: typography.base, fontWeight: "600", color: colors.text, marginBottom: 2 },
  resultDate: { fontSize: typography.xs, color: colors.textFaint },
  scoreCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.bg3,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreCircleText: { fontSize: typography.md, fontWeight: "800" },
});
