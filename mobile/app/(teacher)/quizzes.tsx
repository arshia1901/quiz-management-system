/**
 * mobile/app/(teacher)/quizzes.tsx
 * Quiz manager for teachers — list, status change, delete.
 */

import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { quizzesAPI, batchesAPI } from "../../src/api";
import {
  Card,
  SectionTitle,
  StatusBadge,
  DiffBadge,
  Button,
  EmptyState,
  Divider,
} from "../../src/components";
import { colors, typography, spacing, radius } from "../../src/theme";

type QuizStatus = "draft" | "live" | "closed";

export default function TeacherQuizzes() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    try {
      const [qz, bt] = await Promise.all([quizzesAPI.list(), batchesAPI.list()]);
      setQuizzes(qz || []);
      setBatches(bt || []);
    } catch (e) {}
    finally { setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);
  const onRefresh = () => { setRefreshing(true); load(); };

  const handleDelete = (quiz: any) => {
    Alert.alert("Delete quiz", `Delete "${quiz.title}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try { await quizzesAPI.delete(quiz.quiz_id); load(); }
          catch (e: any) { Alert.alert("Error", e.message); }
        },
      },
    ]);
  };

  const cycleStatus = async (quiz: any) => {
    const next: Record<QuizStatus, QuizStatus> = { draft: "live", live: "closed", closed: "draft" };
    const newStatus = next[quiz.status as QuizStatus] ?? "draft";
    try {
      await quizzesAPI.update(quiz.quiz_id, {
        title: quiz.title,
        subject: quiz.subject,
        batch_id: quiz.batch_id,
        duration: quiz.duration,
        total_marks: quiz.total_marks,
        status: newStatus,
        settings: {
          fullscreen: quiz.setting_fullscreen,
          randomQ: quiz.setting_random_q,
          randomOpts: quiz.setting_random_opts,
          copyPaste: quiz.setting_copy_paste,
          tabDetect: quiz.setting_tab_detect,
        },
      });
      load();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const grouped = {
    live: quizzes.filter((q) => q.status === "live"),
    draft: quizzes.filter((q) => q.status === "draft"),
    closed: quizzes.filter((q) => q.status === "closed"),
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Quiz Manager</Text>
          <Button label="+ New" onPress={() => setShowCreate(true)} small />
        </View>

        {quizzes.length === 0 && (
          <EmptyState icon="📝" message="No quizzes yet — create your first quiz!" />
        )}

        {(["live", "draft", "closed"] as QuizStatus[]).map((status) =>
          grouped[status].length > 0 ? (
            <View key={status}>
              <SectionTitle
                title={status === "live" ? "🟢 Live" : status === "draft" ? "📄 Drafts" : "🔒 Closed"}
              />
              {grouped[status].map((q) => (
                <Card key={q.quiz_id} style={styles.quizCard}>
                  <View style={styles.quizTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.quizTitle} numberOfLines={2}>{q.title}</Text>
                      <Text style={styles.quizMeta}>
                        {q.subject} · {q.questions ?? 0}q · {q.duration}min
                      </Text>
                      {q.batch_name && <Text style={styles.batch}>📚 {q.batch_name}</Text>}
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 4 }}>
                      <StatusBadge status={q.status} />
                      <DiffBadge diff={q.difficulty} />
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaChip}>👁 {q.attempts ?? 0} attempts</Text>
                    {q.avg_score > 0 && (
                      <Text style={[styles.metaChip, {
                        color: q.avg_score > 75 ? colors.green : q.avg_score > 60 ? colors.amber : colors.red
                      }]}>
                        ⌀ {q.avg_score}%
                      </Text>
                    )}
                  </View>

                  <Divider />

                  <View style={styles.actionRow}>
                    <Button
                      label={status === "draft" ? "Publish →" : status === "live" ? "Close" : "Reopen"}
                      onPress={() => cycleStatus(q)}
                      variant="secondary"
                      small
                    />
                    <Button
                      label="Delete"
                      onPress={() => handleDelete(q)}
                      variant="danger"
                      small
                    />
                  </View>
                </Card>
              ))}
            </View>
          ) : null
        )}
      </ScrollView>

      <CreateQuizModal
        visible={showCreate}
        batches={batches}
        onClose={() => setShowCreate(false)}
        onCreated={() => { setShowCreate(false); load(); }}
      />
    </View>
  );
}

// ─── Create Quiz Modal ─────────────────────────────────────────────────────────
function CreateQuizModal({
  visible,
  batches,
  onClose,
  onCreated,
}: {
  visible: boolean;
  batches: any[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState("30");
  const [batchId, setBatchId] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => { setTitle(""); setSubject(""); setDuration("30"); setBatchId(""); };

  const handleCreate = async () => {
    if (!title.trim() || !subject.trim()) {
      Alert.alert("Required", "Please enter title and subject.");
      return;
    }
    setLoading(true);
    try {
      await quizzesAPI.create({
        title: title.trim(),
        subject: subject.trim(),
        duration: Number(duration) || 30,
        batch_id: batchId || null,
        settings: { fullscreen: true, randomQ: true, randomOpts: false, copyPaste: true, tabDetect: true },
      });
      reset();
      onCreated();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={modal.root}>
          <View style={modal.header}>
            <Text style={modal.title}>New Quiz</Text>
            <TouchableOpacity onPress={() => { reset(); onClose(); }}>
              <Text style={modal.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={modal.body} keyboardShouldPersistTaps="handled">
            <Field label="Quiz Title *" value={title} onChangeText={setTitle} placeholder="e.g. Data Structures Mid-Term" />
            <Field label="Subject *" value={subject} onChangeText={setSubject} placeholder="e.g. Computer Science" />
            <Field label="Duration (minutes)" value={duration} onChangeText={setDuration} keyboardType="numeric" placeholder="30" />

            <Text style={modal.label}>Assign to Batch</Text>
            <View style={modal.batchList}>
              <TouchableOpacity
                style={[modal.batchItem, !batchId && modal.batchItemActive]}
                onPress={() => setBatchId("")}
              >
                <Text style={[modal.batchText, !batchId && { color: colors.accent }]}>None</Text>
              </TouchableOpacity>
              {batches.map((b) => (
                <TouchableOpacity
                  key={b.batch_id}
                  style={[modal.batchItem, batchId === b.batch_id && modal.batchItemActive]}
                  onPress={() => setBatchId(b.batch_id)}
                >
                  <Text style={[modal.batchText, batchId === b.batch_id && { color: colors.accent }]}>
                    {b.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button label="Create Quiz" onPress={handleCreate} loading={loading} style={{ marginTop: spacing.lg }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType }: any) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={modal.label}>{label}</Text>
      <TextInput
        style={modal.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        keyboardType={keyboardType ?? "default"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg1 },
  content: { padding: spacing.lg, paddingTop: 56 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  pageTitle: { fontSize: typography["2xl"], fontWeight: "800", color: colors.text, letterSpacing: -0.5 },
  quizCard: { marginBottom: spacing.sm },
  quizTop: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.sm },
  quizTitle: { fontSize: typography.md, fontWeight: "700", color: colors.text, marginBottom: 2 },
  quizMeta: { fontSize: typography.xs, color: colors.textMuted },
  batch: { fontSize: typography.xs, color: colors.textFaint, marginTop: 2 },
  metaRow: { flexDirection: "row", gap: spacing.md, marginBottom: 8 },
  metaChip: { fontSize: typography.xs, color: colors.textMuted, fontWeight: "600" },
  actionRow: { flexDirection: "row", gap: spacing.sm },
});

const modal = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.bg4,
  },
  title: { fontSize: typography.xl, fontWeight: "800", color: colors.text },
  close: { fontSize: 20, color: colors.textMuted, padding: 4 },
  body: { padding: spacing.xl },
  label: {
    fontSize: typography.xs,
    fontWeight: "600",
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 6,
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
  batchList: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  batchItem: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.bg4,
    backgroundColor: colors.bg3,
  },
  batchItemActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  batchText: { fontSize: typography.sm, color: colors.textMuted, fontWeight: "600" },
});
