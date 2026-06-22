import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useJobDraft } from "@/core/jobs/job-draft-context";
import { useTheme } from "@/core/theme-context";
import { BrandingHeader } from "@/core/ui-components/BrandingHeader";
import { WeatherWidget } from "@/features/weather";

const SAFETY_OPTIONS = [
  "Client Nearby",
  "Smartwatch Charged",
  "Assistant on site",
];

export default function GigSafetyScreen() {
  const { isDark } = useTheme();
  const db = useSQLiteContext();
  const { updateJobMeta, updateCustomerDetails, setSafetyChecks, currentJob } = useJobDraft();

  const params = useLocalSearchParams<{
    bookingId?: string;
    address?: string;
    phone?: string;
    customerName?: string;
    notes?: string;
    email?: string;
  }>();

  const { bookingId, address, phone, customerName, notes } = params;
  const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://www.ladderlesswindows.com";

  const [selectedChecks, setSelectedChecks] = useState<string[]>([]);
  const [starting, setStarting] = useState(false);

  const toggle = (opt: string) =>
    setSelectedChecks(prev => prev.includes(opt) ? prev.filter(c => c !== opt) : [...prev, opt]);

  const handleBeginGig = async () => {
    if (selectedChecks.length === 0) {
      Alert.alert("Safety Check", "Select at least one safety confirmation before starting.");
      return;
    }
    if (starting) return;
    setStarting(true);
    try {
      // Update the draft with this gig's address and customer
      if (address) await updateJobMeta({ address, customer_name: customerName ?? null });
      if (phone) await updateCustomerDetails({ phone });
      if (notes) await updateCustomerDetails({ address_notes: notes });

      // Link the Supabase booking ID into the local job
      if (bookingId && currentJob?.id) {
        await db.runAsync(
          "UPDATE jobs SET supabase_booking_id = ? WHERE id = ?",
          [bookingId, currentJob.id]
        );
      }

      await setSafetyChecks(selectedChecks);

      if (phone) {
        fetch(`${API_URL}/api/worker/notify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, first_name: customerName ?? null, address, type: "arrival" }),
        }).catch(() => {});
      }

      router.replace("/new-job/walls");
    } catch (err) {
      console.error("Failed to start gig:", err);
      Alert.alert("Error", "Could not start gig. Please try again.");
    } finally {
      setStarting(false);
    }
  };

  const bg = isDark ? "#0f172a" : "#f8fafc";
  const textMain = isDark ? "#f1f5f9" : "#0f172a";
  const textSub = isDark ? "rgba(255,255,255,0.45)" : "#64748b";

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 20 }}>
        <BrandingHeader />
        <WeatherWidget enabled={false} compact={true} />

        {/* Gig context card */}
        {(address || customerName) && (
          <View style={{
            backgroundColor: isDark ? "rgba(59,130,246,0.08)" : "#eff6ff",
            borderRadius: 14, borderWidth: 1, borderColor: "rgba(59,130,246,0.25)",
            padding: 14, marginBottom: 20,
          }}>
            {customerName && (
              <Text style={{ color: textMain, fontSize: 16, fontWeight: "700", marginBottom: 4 }}>{customerName}</Text>
            )}
            {address && (
              <Text style={{ color: textSub, fontSize: 13 }}>{address}</Text>
            )}
            {notes && (
              <Text style={{ color: textSub, fontSize: 12, fontStyle: "italic", marginTop: 6 }}>{notes}</Text>
            )}
          </View>
        )}

        {/* Safety checklist */}
        <Text style={{ color: textMain, fontSize: 26, fontWeight: "800", textAlign: "center", marginBottom: 6 }}>
          Safety Action Plan
        </Text>
        <Text style={{ color: textSub, textAlign: "center", fontSize: 14, marginBottom: 24 }}>
          Confirm at least one before starting
        </Text>

        <View style={{ gap: 12 }}>
          {SAFETY_OPTIONS.map(opt => {
            const on = selectedChecks.includes(opt);
            return (
              <Pressable
                key={opt}
                onPress={() => toggle(opt)}
                style={{
                  flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 16, borderWidth: 2,
                  backgroundColor: on ? (isDark ? "rgba(16,185,129,0.12)" : "#f0fdf4") : (isDark ? "#0f172a" : "#fff"),
                  borderColor: on ? "#10b981" : (isDark ? "#334155" : "#cbd5e1"),
                }}
              >
                <View style={{
                  width: 24, height: 24, borderRadius: 6, borderWidth: 2, marginRight: 14,
                  alignItems: "center", justifyContent: "center",
                  backgroundColor: on ? "#10b981" : "transparent",
                  borderColor: on ? "#10b981" : (isDark ? "#475569" : "#94a3b8"),
                }}>
                  {on && <Text style={{ color: "white", fontSize: 14, fontWeight: "800" }}>✓</Text>}
                </View>
                <Text style={{ color: textMain, fontSize: 17, fontWeight: "500", flex: 1 }}>{opt}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Begin Gig button */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 12, backgroundColor: bg }}>
        <Pressable
          onPress={handleBeginGig}
          disabled={starting || selectedChecks.length === 0}
          style={{
            backgroundColor: "#10b981", borderRadius: 24, paddingVertical: 20,
            alignItems: "center",
            opacity: (starting || selectedChecks.length === 0) ? 0.5 : 1,
          }}
        >
          <Text style={{ color: "white", fontSize: 22, fontWeight: "700" }}>
            {starting ? "Starting…" : "Begin Gig →"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
