/**
 * mobile/app/(teacher)/dashboard.tsx
 * Teacher home screen — mirrors web TeacherDashboard.
 */

import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../src/store";
import { analyticsAPI, quizzesAPI } from "../../src/api";
import { Card, StatCard, SectionTitle, StatusBadge, DiffBadge, EmptyState } from "../../src/components";
import { colors, typography, spacing, radius } from "../../src/theme";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [an, qz] = await Promise.all([
        analyticsAPI.teacher(),
        quizzesAPI.list(),
      ]);
      setAnalytics(an);
      setQuizzes(qz || []);
    } catch (e) {}
    finally { setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);
  const onRefresh = () => { setRefreshing(true); load(); };

  const activeQuizzes = quizzes.filter((q) => q.status === "live");
  const draftQuizzes = quizzes.filter((q) => q.status === "draft");

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <LinearGradient
        colors={["rgba(108,99,255,0.12)", "rgba(168,85,247,0.06)"]}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View>
          <Text style={styles.heroGreeting}>
            Welcome back, {user?.name?.split(" ")[0] ?? "Teacher"} 👋
          </Text>
          <Text style={styles.heroSub}>
            {activeQuizzes.length} active · {draftQuizzes.length} draft quizzes
          </Text>
        </View>
        <Text style={styles.heroEmoji}>📋</Text>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard
          label="Avg Score"
          value={analytics?.avg_score ? `${analytics.avg_score}%` : "—"}
          accent={colors.green}
        />
        <StatCard
          label="Attempts"
          value={analytics?.total_attempts ?? "—"}
        />
        <StatCard
          label="Flags"
          value={analytics?.cheating_flags ?? 0}
          accent={colors.red}
        />
      </View>

      {/* Active quizzes */}
      <SectionTitle title="Active Quizzes" subtitle="Currently live" />
      {activeQuizzes.length === 0
        ? <EmptyState icon="🚀" message='No live quizzes — go to Quizzes tab to publish one' />
        : activeQuizzes.map((q) => <QuizRow key={q.quiz_id} quiz={q} />)}

      {/* Draft quizzes */}
      {draftQuizzes.length > 0 && (
        <>
          <SectionTitle title="Drafts" subtitle="Not yet published" />
          {draftQuizzes.map((q) => <QuizRow key={q.quiz_id} quiz={q} />)}
        </>
      )}
    </ScrollView>
  );
}

function QuizRow({ quiz }: { quiz: any }) {
  return (
    <Card style={styles.quizCard}>
      <View style={styles.quizTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.quizTitle} numberOfLines={1}>{quiz.title}</Text>
          <Text style={styles.quizMeta}>
            {quiz.questions ?? 0} questions · {quiz.attempts ?? 0} attempts
          </Text>
        </View>
        <View style={{ gap: 4, alignItems: "flex-end" }}>
          <StatusBadge status={quiz.status} />
          {quiz.avg_score > 0 && (
            <Text style={[
              styles.avgScore,
              { color: quiz.avg_score > 75 ? colors.green : quiz.avg_score > 60 ? colors.amber : colors.red }
            ]}>
              ⌀ {quiz.avg_score}%
            </Text>
          )}
        </View>
      </View>
      {quiz.batch_name && (
        <Text style={styles.batch}>📚 {quiz.batch_name}</Text>
      )}
    </Card>
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
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(108,99,255,0.2)",
  },
  heroGreeting: { fontSize: typography.lg, fontWeight: "800", color: colors.text, marginBottom: 4 },
  heroSub: { fontSize: typography.sm, color: colors.textMuted },
  heroEmoji: { fontSize: 36 },
  statsRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  quizCard: { marginBottom: spacing.sm },
  quizTop: { flexDirection: "row", gap: spacing.sm, marginBottom: 6 },
  quizTitle: { fontSize: typography.md, fontWeight: "700", color: colors.text, marginBottom: 2 },
  quizMeta: { fontSize: typography.xs, color: colors.textMuted },
  avgScore: { fontSize: typography.xs, fontWeight: "700" },
  batch: { fontSize: typography.xs, color: colors.textFaint },
});
