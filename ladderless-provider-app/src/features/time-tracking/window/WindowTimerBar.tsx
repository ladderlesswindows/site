import React, { useState } from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePathname } from "expo-router";
import { useJobDraft } from "@/core/jobs/job-draft-context";
import { useWindowTimer } from "./useWindowTimer";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function WindowTimerBar() {
  const { currentJob, hasDraft } = useJobDraft();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  // Gig mode when inside the active job flow; general counter otherwise
  const isInGig = pathname.includes("new-job") || pathname.includes("gig-safety") || pathname.includes("gig-plan");
  const activeJobId = isInGig ? (currentJob?.id ?? null) : null;

  const { isRunning, elapsed, start, stop, save, discard } = useWindowTimer(activeJobId);
  const [confirming, setConfirming] = useState(false);

  if (!hasDraft) return null;

  const handleStop = () => {
    stop();
    setConfirming(true);
  };

  const handleSave = async () => {
    await save();
    setConfirming(false);
  };

  const handleDiscard = () => {
    discard();
    setConfirming(false);
  };

  return (
    <>
      <View style={[styles.bar, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.modeTag}>
          <Text style={styles.modeText}>{isInGig ? "GIG" : "GENERAL"}</Text>
        </View>
        {isRunning ? (
          <>
            <Text style={styles.elapsed}>{fmt(elapsed)}</Text>
            <Pressable onPress={handleStop} style={styles.stopBtn}>
              <Text style={styles.btnText}>STOP</Text>
            </Pressable>
          </>
        ) : (
          <Pressable onPress={start} style={styles.startBtn}>
            <Text style={styles.btnText}>START WINDOW</Text>
          </Pressable>
        )}
      </View>

      <Modal visible={confirming} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Save window time?</Text>
            <Text style={styles.cardTime}>{fmt(elapsed)}</Text>
            <Pressable onPress={handleSave} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Save</Text>
            </Pressable>
            <Pressable onPress={handleDiscard} style={styles.discardBtn}>
              <Text style={styles.discardBtnText}>Discard</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 8,
    paddingHorizontal: 16,
    backgroundColor: "#0f172a",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modeTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: "#1e293b",
  },
  modeText: {
    color: "#475569",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },
  elapsed: {
    flex: 1,
    color: "#e2e8f0",
    fontSize: 26,
    fontWeight: "600",
    // @ts-ignore — fontVariant works on iOS
    fontVariant: ["tabular-nums"],
  },
  startBtn: {
    flex: 1,
    backgroundColor: "#16a34a",
    borderRadius: 22,
    paddingVertical: 13,
    alignItems: "center",
  },
  stopBtn: {
    backgroundColor: "#dc2626",
    borderRadius: 22,
    paddingVertical: 13,
    paddingHorizontal: 36,
  },
  btnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.5,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 28,
  },
  cardLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  cardTime: {
    color: "white",
    fontSize: 52,
    fontWeight: "700",
    // @ts-ignore
    fontVariant: ["tabular-nums"],
    marginBottom: 28,
  },
  saveBtn: {
    backgroundColor: "#16a34a",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 10,
  },
  saveBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  discardBtn: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  discardBtnText: {
    color: "#64748b",
    fontWeight: "600",
    fontSize: 16,
  },
});
