import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/core/theme-context";

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
  const { address, phone, customerName, notes, email, windowCount, totalPrice, serviceDate, serviceTime } = params;

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
  rows.push({ label: "Sq Footage", value: "— (public records lookup coming soon)", dim: true });

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 120 }}>

        {/* Map placeholder */}
        <View style={{
          height: 220, borderRadius: 16, marginBottom: 20, overflow: "hidden",
          backgroundColor: isDark ? "#0a1628" : "#e8f0fe",
          borderWidth: 1, borderColor: isDark ? "rgba(59,130,246,0.18)" : "#c7d8fb",
          justifyContent: "center", alignItems: "center",
        }}>
          {/* Grid lines to suggest a map */}
          {[40, 80, 120, 160].map(y => (
            <View key={y} style={{ position: "absolute", left: 0, right: 0, top: y, height: 1, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)" }} />
          ))}
          {[60, 120, 180, 240, 300].map(x => (
            <View key={x} style={{ position: "absolute", top: 0, bottom: 0, left: x, width: 1, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)" }} />
          ))}
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 11, color: isDark ? "rgba(59,130,246,0.5)" : "rgba(59,130,246,0.45)", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
              Route Map
            </Text>
            <Text style={{ fontSize: 13, color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)" }}>
              Your dot + job dot + est. drive — coming soon
            </Text>
          </View>
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
              <Text style={{
                flex: 1, color: row.dim ? textSub : textMain,
                fontSize: 13, fontStyle: row.dim ? "italic" : "normal",
              }}>{row.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Back button */}
      <View style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        paddingHorizontal: 20, paddingBottom: 44, paddingTop: 16,
        backgroundColor: bg, borderTopWidth: 1, borderTopColor: cardBorder,
      }}>
        <Pressable
          onPress={() => router.back()}
          style={{
            borderWidth: 1, borderColor: cardBorder, borderRadius: 24,
            paddingVertical: 16, alignItems: "center", backgroundColor: card,
          }}
        >
          <Text style={{ color: textMain, fontSize: 16, fontWeight: "600" }}>← Back to Gig List</Text>
        </Pressable>
      </View>
    </View>
  );
}
