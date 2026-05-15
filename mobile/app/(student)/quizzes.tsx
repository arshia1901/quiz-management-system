/**
 * mobile/app/(student)/quizzes.tsx
 * Full quiz list for student — all quizzes for their batch.
 */

import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { quizzesAPI } from "../../src/api";
import { Card, SectionTitle, StatusBadge, DiffBadge, EmptyState } from "../../src/components";
import { colors, typography, spacing, radius } from "../../src/theme";

export default function StudentQuizzes() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await quizzesAPI.list();
      setQuizzes(data || []);
    } catch (e) {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);
  const onRefresh = () => { setRefreshing(true); load(); };

  const live = quizzes.filter((q) => q.status === "live");
  const closed = quizzes.filter((q) => q.status === "closed");

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>My Quizzes</Text>

      <SectionTitle title="Available Now" subtitle="Live quizzes for your batch" />
      {live.length === 0
        ? <EmptyState icon="📭" message="No live quizzes right now" />
        : live.map((q) => <QuizRow key={q.quiz_id} quiz={q} />)}

      {closed.length > 0 && (
        <>
          <SectionTitle title="Completed" subtitle="Past quizzes" />
          {closed.map((q) => <QuizRow key={q.quiz_id} quiz={q} />)}
        </>
      )}
    </ScrollView>
  );
}

function QuizRow({ quiz }: { quiz: any }) {
  const startTime = quiz.start_time ? new Date(quiz.start_time).toLocaleString() : null;
  const endTime = quiz.end_time ? new Date(quiz.end_time).toLocaleString() : null;

  return (
    <Card style={styles.card}>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={2}>{quiz.title}</Text>
          {quiz.subject && (
            <View style={styles.subjectBadge}>
              <Text style={styles.subjectText}>{quiz.subject}</Text>
            </View>
          )}
        </View>
        <View style={{ gap: 4, alignItems: "flex-end" }}>
          <StatusBadge status={quiz.status} />
          <DiffBadge diff={quiz.difficulty} />
        </View>
      </View>

      <View style={styles.metaRow}>
        <MetaChip icon="⏱" label={`${quiz.duration} min`} />
        <MetaChip icon="❓" label={`${quiz.questions ?? 0} questions`} />
        <MetaChip icon="⭐" label={`${quiz.total_marks ?? 0} marks`} />
      </View>

      {quiz.batch_name && <Text style={styles.batch}>📚 {quiz.batch_name}</Text>}

      {(startTime || endTime) && (
        <Text style={styles.window}>
          🗓 {startTime ?? "—"} → {endTime ?? "—"}
        </Text>
      )}
    </Card>
  );
}

function MetaChip({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{icon} {label}</Text>
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
  card: { marginBottom: spacing.sm },
  top: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.md },
  title: { fontSize: typography.md, fontWeight: "700", color: colors.text, marginBottom: 6 },
  subjectBadge: {
    backgroundColor: "rgba(100,100,120,0.2)",
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  subjectText: { fontSize: 11, color: colors.textMuted, fontWeight: "600" },
  metaRow: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap", marginBottom: 8 },
  chip: {
    backgroundColor: colors.bg3,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipText: { fontSize: typography.xs, color: colors.textMuted, fontWeight: "500" },
  batch: { fontSize: typography.xs, color: colors.textFaint, marginBottom: 4 },
  window: { fontSize: typography.xs, color: colors.textFaint },
});
