import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, Linking } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/core/theme-context";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://www.ladderlesswindows.com";

export default function GigPlanScreen() {
  const { isDark } = useTheme();
  const params = useLocalSearchParams<{
    gigId?: string;
    address: string;
    phone?: string;
    customerName?: string;
    notes?: string;
    email?: string;
    windowCount?: string;
    totalPrice?: string;
    serviceDate?: string;
    serviceTime?: string;
  }>();
  const { gigId, address, phone, customerName, notes, email, windowCount, totalPrice, serviceDate, serviceTime } = params;

  const [navigating, setNavigating] = useState(false);
  const [arriving, setArriving] = useState(false);

  const bg = isDark ? "#0f172a" : "#f8fafc";
  const textMain = isDark ? "#f1f5f9" : "#0f172a";
  const textSub = isDark ? "rgba(255,255,255,0.45)" : "#64748b";
  const card = isDark ? "rgba(255,255,255,0.05)" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const divider = isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9";

  const rows: Array<{ label: string; value: string; dim?: boolean }> = [];
  if (customerName) rows.push({ label: "Customer", value: customerName });
  rows.push({ label: "Address", value: address });
  if (phone) rows.push({ label: "Phone", value: phone });
  if (email) rows.push({ label: "Email", value: email });
  if (serviceDate) rows.push({ label: "Date", value: serviceDate });
  if (serviceTime) rows.push({ label: "Time", value: serviceTime });
  if (windowCount && parseInt(windowCount) > 0) rows.push({ label: "Windows", value: windowCount });
  if (totalPrice && parseFloat(totalPrice) > 0) rows.push({ label: "Price", value: `$${totalPrice}` });
  if (notes) rows.push({ label: "Access Notes", value: notes });
  rows.push({ label: "Sq Footage", value: "— public records lookup coming soon", dim: true });

  const toSafety = (smsAlreadySent = false) => {
    const p = new URLSearchParams({ address, phone: phone ?? "" });
    if (gigId) p.set("bookingId", gigId);
    if (customerName) p.set("customerName", customerName);
    if (notes) p.set("notes", notes);
    if (email) p.set("email", email);
    if (smsAlreadySent) p.set("smsAlreadySent", "true");
    router.push(`/gig-safety?${p.toString()}`);
  };

  const handleNavigateNotify = async () => {
    if (navigating) return;
    setNavigating(true);
    try {
      if (phone) {
        fetch(`${API_URL}/api/worker/notify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, first_name: customerName ?? null, address }),
        }).catch(() => {});
      }
      Linking.openURL(`https://maps.apple.com/?daddr=${encodeURIComponent(address)}`).catch(() =>
        Linking.openURL(`https://maps.google.com/?daddr=${encodeURIComponent(address)}`)
      );
      toSafety(false);
    } finally {
      setNavigating(false);
    }
  };

  const handleArrived = async () => {
    if (arriving) return;
    setArriving(true);
    try {
      if (phone) {
        fetch(`${API_URL}/api/worker/notify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, first_name: customerName ?? null, address, type: "arrival" }),
        }).catch(() => {});
      }
      toSafety(true);
    } finally {
      setArriving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 180 }}>

        {/* Map placeholder */}
        <View style={{
          height: 220, borderRadius: 16, marginBottom: 20, overflow: "hidden",
          backgroundColor: isDark ? "#0a1628" : "#e8f0fe",
          borderWidth: 1, borderColor: isDark ? "rgba(59,130,246,0.18)" : "#c7d8fb",
          justifyContent: "center", alignItems: "center",
        }}>
          {[44, 88, 132, 176].map(y => (
            <View key={y} style={{ position: "absolute", left: 0, right: 0, top: y, height: 1, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)" }} />
          ))}
          {[60, 120, 180, 240, 300].map(x => (
            <View key={x} style={{ position: "absolute", top: 0, bottom: 0, left: x, width: 1, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)" }} />
          ))}
          <Text style={{ fontSize: 11, color: isDark ? "rgba(59,130,246,0.5)" : "rgba(59,130,246,0.45)", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
            Route Map
          </Text>
          <Text style={{ fontSize: 13, color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)" }}>
            Your dot + job dot + est. drive
          </Text>
          <Text style={{ fontSize: 11, color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.2)", marginTop: 3 }}>
            Coming soon
          </Text>
        </View>

        {/* Job details */}
        <View style={{ backgroundColor: card, borderRadius: 14, borderWidth: 1, borderColor: cardBorder, overflow: "hidden" }}>
          {rows.map((row, i) => (
            <View
              key={row.label}
              style={{
                flexDirection: "row", paddingVertical: 13, paddingHorizontal: 16,
                borderTopWidth: i === 0 ? 0 : 1, borderTopColor: divider,
                alignItems: "flex-start",
              }}
            >
              <Text style={{ color: textSub, fontSize: 12, fontWeight: "700", width: 100, paddingTop: 1 }}>{row.label}</Text>
              <Text style={{ flex: 1, color: row.dim ? textSub : textMain, fontSize: 13, fontStyle: row.dim ? "italic" : "normal" }}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Fixed bottom actions */}
      <View style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        paddingHorizontal: 20, paddingBottom: 44, paddingTop: 16,
        backgroundColor: bg, borderTopWidth: 1, borderTopColor: cardBorder,
        gap: 10,
      }}>
        <Pressable
          onPress={handleNavigateNotify}
          disabled={navigating}
          style={{ backgroundColor: "#10b981", borderRadius: 24, paddingVertical: 18, alignItems: "center", opacity: navigating ? 0.6 : 1 }}
        >
          <Text style={{ color: "white", fontSize: 17, fontWeight: "700" }}>
            {navigating ? "Opening Maps…" : "Navigate & Notify"}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 2 }}>
            Texts client you're on the way • Opens Maps
          </Text>
        </Pressable>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={() => router.back()}
            style={{ flex: 1, borderWidth: 1, borderColor: cardBorder, borderRadius: 20, paddingVertical: 12, alignItems: "center", backgroundColor: card }}
          >
            <Text style={{ color: textSub, fontSize: 14, fontWeight: "500" }}>← Back</Text>
          </Pressable>
          <Pressable
            onPress={handleArrived}
            disabled={arriving}
            style={{ flex: 1, borderWidth: 1, borderColor: "rgba(16,185,129,0.35)", borderRadius: 20, paddingVertical: 12, alignItems: "center", backgroundColor: isDark ? "rgba(16,185,129,0.08)" : "#f0fdf4", opacity: arriving ? 0.6 : 1 }}
          >
            <Text style={{ color: "#10b981", fontSize: 14, fontWeight: "600" }}>
              {arriving ? "…" : "Arrived"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
