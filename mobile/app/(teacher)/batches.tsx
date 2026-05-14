/**
 * mobile/app/(teacher)/batches.tsx
 * Classroom/batch manager for teachers.
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
import { batchesAPI, usersAPI } from "../../src/api";
import { Card, SectionTitle, Button, EmptyState, Divider } from "../../src/components";
import { colors, typography, spacing, radius } from "../../src/theme";

export default function TeacherBatches() {
  const [batches, setBatches] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);

  const load = async () => {
    try {
      const [bt, st] = await Promise.all([batchesAPI.list(), usersAPI.list("STUDENT")]);
      setBatches(bt || []);
      setAllStudents(st || []);
    } catch (e) {}
    finally { setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);
  const onRefresh = () => { setRefreshing(true); load(); };

  const handleDeleteBatch = (batch: any) => {
    Alert.alert("Delete batch", `Delete "${batch.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try { await batchesAPI.delete(batch.batch_id); load(); }
          catch (e: any) { Alert.alert("Error", e.message); }
        },
      },
    ]);
  };

  const handleEnroll = async (batch_id: string, student_id: string) => {
    try {
      await batchesAPI.enroll(batch_id, student_id);
      load();
    } catch (e: any) { Alert.alert("Error", e.message); }
  };

  const handleRemove = async (batch_id: string, student_id: string) => {
    try {
      await batchesAPI.removeEnroll(batch_id, student_id);
      load();
    } catch (e: any) { Alert.alert("Error", e.message); }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Classrooms</Text>
          <Button label="+ New" onPress={() => setShowCreate(true)} small />
        </View>

        {batches.length === 0
          ? <EmptyState icon="🏫" message="No classrooms yet — create one!" />
          : batches.map((b) => {
              const isExpanded = expandedBatch === b.batch_id;
              const enrolled = b.students ?? [];
              const enrolledIds = new Set(enrolled.map((s: any) => s.user_id));
              const unenrolled = allStudents.filter((s) => !enrolledIds.has(s.user_id));

              return (
                <Card key={b.batch_id} style={styles.batchCard}>
                  <TouchableOpacity
                    onPress={() => setExpandedBatch(isExpanded ? null : b.batch_id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.batchTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.batchName}>{b.name}</Text>
                        <Text style={styles.batchMeta}>
                          {b.department && `${b.department} · `}
                          {b.semester && `Sem ${b.semester} · `}
                          {enrolled.length} students
                        </Text>
                      </View>
                      <Text style={styles.chevron}>{isExpanded ? "▲" : "▼"}</Text>
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <>
                      <Divider />
                      <Text style={styles.subheading}>Enrolled Students</Text>
                      {enrolled.length === 0
                        ? <Text style={styles.emptyText}>No students enrolled yet</Text>
                        : enrolled.map((s: any) => (
                            <View key={s.user_id} style={styles.studentRow}>
                              <Text style={styles.studentName}>{s.name}</Text>
                              <Button
                                label="Remove"
                                onPress={() => handleRemove(b.batch_id, s.user_id)}
                                variant="danger"
                                small
                              />
                            </View>
                          ))}

                      {unenrolled.length > 0 && (
                        <>
                          <Text style={[styles.subheading, { marginTop: spacing.md }]}>Add Students</Text>
                          {unenrolled.slice(0, 10).map((s: any) => (
                            <View key={s.user_id} style={styles.studentRow}>
                              <Text style={styles.studentName}>{s.name}</Text>
                              <Button
                                label="Enroll"
                                onPress={() => handleEnroll(b.batch_id, s.user_id)}
                                variant="secondary"
                                small
                              />
                            </View>
                          ))}
                        </>
                      )}

                      <Divider />
                      <Button
                        label="Delete Batch"
                        onPress={() => handleDeleteBatch(b)}
                        variant="danger"
                        small
                      />
                    </>
                  )}
                </Card>
              );
            })}
      </ScrollView>

      <CreateBatchModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => { setShowCreate(false); load(); }}
      />
    </View>
  );
}

// ─── Create Batch Modal ────────────────────────────────────────────────────────
function CreateBatchModal({
  visible, onClose, onCreated,
}: { visible: boolean; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => { setName(""); setDepartment(""); setSemester(""); setAcademicYear(""); setSubject(""); };

  const handleCreate = async () => {
    if (!name.trim()) { Alert.alert("Required", "Batch name is required."); return; }
    setLoading(true);
    try {
      await batchesAPI.create({
        name: name.trim(),
        department: department.trim() || null,
        semester: semester.trim() || null,
        academic_year: academicYear.trim() || null,
        subject: subject.trim() || null,
      });
      reset(); onCreated();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={modal.root}>
          <View style={modal.header}>
            <Text style={modal.title}>New Classroom</Text>
            <TouchableOpacity onPress={() => { reset(); onClose(); }}>
              <Text style={modal.close}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={modal.body} keyboardShouldPersistTaps="handled">
            <Field label="Batch Name *" value={name} onChangeText={setName} placeholder='e.g. "ISE A 2024"' />
            <Field label="Department" value={department} onChangeText={setDepartment} placeholder="e.g. Computer Science" />
            <Field label="Semester" value={semester} onChangeText={setSemester} placeholder="e.g. 5" keyboardType="numeric" />
            <Field label="Academic Year" value={academicYear} onChangeText={setAcademicYear} placeholder="e.g. 2024-2025" />
            <Field label="Subject" value={subject} onChangeText={setSubject} placeholder="e.g. Data Structures" />
            <Button label="Create Classroom" onPress={handleCreate} loading={loading} style={{ marginTop: spacing.lg }} />
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
  batchCard: { marginBottom: spacing.sm },
  batchTop: { flexDirection: "row", alignItems: "center" },
  batchName: { fontSize: typography.md, fontWeight: "700", color: colors.text, marginBottom: 2 },
  batchMeta: { fontSize: typography.xs, color: colors.textMuted },
  chevron: { fontSize: 12, color: colors.textFaint, paddingLeft: 8 },
  subheading: { fontSize: typography.sm, fontWeight: "700", color: colors.textMuted, marginBottom: spacing.sm },
  emptyText: { fontSize: typography.sm, color: colors.textFaint, marginBottom: spacing.sm },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.bg4,
  },
  studentName: { fontSize: typography.sm, color: colors.text, flex: 1 },
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
});
