/**
 * mobile/app/(student)/dashboard.tsx
 * Student home screen — mirrors web StudentDashboard.
 */

import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/store";
import { analyticsAPI, quizzesAPI } from "../../src/api";
import {
  Card,
  StatCard,
  SectionTitle,
  StatusBadge,
  EmptyState,
  Button,
} from "../../src/components";
import { colors, typography, spacing, radius } from "../../src/theme";

export default function StudentDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [analytics, setAnalytics] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [an, qz] = await Promise.all([
        analyticsAPI.student(),
        quizzesAPI.list(),
      ]);
      setAnalytics(an);
      setQuizzes(qz || []);
    } catch (e) {
      // silently handle — show empty states
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);
  const onRefresh = () => { setRefreshing(true); load(); };

  const liveQuizzes = quizzes.filter((q: any) => q.status === "live");

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero banner */}
      <LinearGradient
        colors={["rgba(34,211,160,0.12)", "rgba(77,166,255,0.06)"]}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.heroGreeting}>Hey {user?.name?.split(" ")[0] ?? "Student"}! 🚀</Text>
          <Text style={styles.heroSub}>
            {liveQuizzes.length > 0
              ? `${liveQuizzes.length} quiz${liveQuizzes.length > 1 ? "zes" : ""} available`
              : "No quizzes available right now"}
          </Text>
        </View>
        <View style={styles.heroScore}>
          <Text style={styles.heroScoreValue}>
            {analytics?.avg_score ? `${analytics.avg_score}%` : "—"}
          </Text>
          <Text style={styles.heroScoreLabel}>Avg score</Text>
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard label="Quizzes Taken" value={analytics?.total_quizzes ?? "—"} />
        <StatCard label="Avg Score" value={analytics?.avg_score ? `${analytics.avg_score}%` : "—"} accent={colors.green} />
      </View>

      {/* Upcoming quizzes */}
      <SectionTitle title="Available Quizzes" subtitle="Live quizzes for your batch" />
      {liveQuizzes.length === 0
        ? <EmptyState icon="📭" message="No live quizzes for your batch yet" />
        : liveQuizzes.map((q: any) => (
            <Card key={q.quiz_id} style={styles.quizCard}>
              <View style={styles.quizCardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quizTitle} numberOfLines={1}>{q.title}</Text>
                  <Text style={styles.quizMeta}>
                    ⏱ {q.duration}min · {q.questions ?? "—"} questions
                  </Text>
                </View>
                <StatusBadge status={q.status} />
              </View>
              {q.batch_name && (
                <Text style={styles.quizBatch}>📚 {q.batch_name}</Text>
              )}
              <Text style={styles.comingSoon}>Quiz taking coming soon in v2 →</Text>
            </Card>
          ))}

      {/* Recent quizzes */}
      {(analytics?.recent ?? []).length > 0 && (
        <>
          <SectionTitle title="Recent Results" />
          {analytics.recent.map((r: any, i: number) => (
            <Card key={i}>
              <View style={styles.recentRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recentTitle}>{r.title}</Text>
                  <Text style={styles.recentTime}>{new Date(r.submit_time).toLocaleDateString()}</Text>
                </View>
                <Text style={[
                  styles.recentScore,
                  { color: r.score > 75 ? colors.green : r.score > 50 ? colors.amber : colors.red }
                ]}>
                  {r.score}
                </Text>
              </View>
            </Card>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg1 },
  content: { padding: spacing.lg, paddingTop: 56 },
  hero: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(34,211,160,0.2)",
  },
  heroGreeting: { fontSize: typography.xl, fontWeight: "800", color: colors.text, marginBottom: 4 },
  heroSub: { fontSize: typography.sm, color: colors.textMuted },
  heroScore: { alignItems: "flex-end" },
  heroScoreValue: { fontSize: typography["3xl"], fontWeight: "700", color: colors.green },
  heroScoreLabel: { fontSize: typography.xs, color: colors.textFaint },
  statsRow: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg },
  quizCard: { marginBottom: spacing.sm },
  quizCardTop: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  quizTitle: { fontSize: typography.md, fontWeight: "700", color: colors.text, marginBottom: 2 },
  quizMeta: { fontSize: typography.xs, color: colors.textMuted },
  quizBatch: { fontSize: typography.xs, color: colors.textFaint, marginBottom: 8 },
  comingSoon: { fontSize: typography.xs, color: colors.accent, fontStyle: "italic" },
  recentRow: { flexDirection: "row", alignItems: "center" },
  recentTitle: { fontSize: typography.base, fontWeight: "600", color: colors.text },
  recentTime: { fontSize: typography.xs, color: colors.textFaint },
  recentScore: { fontSize: typography.xl, fontWeight: "800" },
});
