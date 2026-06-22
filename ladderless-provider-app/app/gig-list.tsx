import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, TextInput, Pressable,
  RefreshControl, Alert, ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/core/theme-context";
import { BrandingHeader } from "@/core/ui-components/BrandingHeader";
import { WeatherWidget } from "@/features/weather";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://www.ladderlesswindows.com";

interface Gig {
  id: string;
  service_date: string;
  service_time: string;
  address: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  status: string;
  window_count: number;
  total_price: number;
}

function gigDateLabel(dateStr: string): { text: string; color: string } {
  const today = new Date().toISOString().slice(0, 10);
  if (dateStr === today) return { text: "Today", color: "#10b981" };
  const tom = new Date(); tom.setDate(tom.getDate() + 1);
  if (dateStr === tom.toISOString().slice(0, 10)) return { text: "Tomorrow", color: "#3b82f6" };
  if (dateStr < today) return { text: new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }), color: "#f87171" };
  return { text: new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }), color: "rgba(255,255,255,0.7)" };
}

export default function GigListScreen() {
  const { isDark } = useTheme();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [fName, setFName] = useState("");
  const [fAddress, setFAddress] = useState("");
  const [fPhone, setFPhone] = useState("");
  const [fEmail, setFEmail] = useState("");
  const [fWindows, setFWindows] = useState("");
  const [fRate, setFRate] = useState("");
  const [fFlat, setFFlat] = useState("");
  const [fNotes, setFNotes] = useState("");
  const [fDate, setFDate] = useState("");

  const bg = isDark ? "#0f172a" : "#f8fafc";
  const card = isDark ? "rgba(255,255,255,0.05)" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const textMain = isDark ? "#f1f5f9" : "#0f172a";
  const textSub = isDark ? "rgba(255,255,255,0.45)" : "#64748b";
  const inputBg = isDark ? "rgba(255,255,255,0.07)" : "#f1f5f9";
  const inputBorder = isDark ? "rgba(255,255,255,0.12)" : "#cbd5e1";

  const fetchGigs = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/worker/gigs`);
      const json = await res.json();
      setGigs(json.gigs ?? []);
    } catch (e) {
      console.error("Failed to fetch gigs:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchGigs(); }, [fetchGigs]);

  const windowSubtotal = (parseFloat(fWindows) || 0) * (parseFloat(fRate) || 0);
  const flatAmount = parseFloat(fFlat) || 0;
  const totalPrice = Math.round((windowSubtotal + flatAmount) * 100) / 100;

  const resetForm = () => {
    setFName(""); setFAddress(""); setFPhone(""); setFEmail("");
    setFWindows(""); setFRate(""); setFFlat(""); setFNotes(""); setFDate("");
  };

  const goToSafety = (bookingId: string, address: string, phone: string, customerName?: string, notes?: string, email?: string) => {
    const p = new URLSearchParams({ bookingId, address, phone });
    if (customerName) p.set("customerName", customerName);
    if (notes) p.set("notes", notes);
    if (email) p.set("email", email);
    router.push(`/gig-safety?${p.toString()}`);
  };

  const goToPlan = (gig: Gig, name: string | null) => {
    const p = new URLSearchParams({ gigId: gig.id, address: gig.address, phone: gig.phone ?? "" });
    if (name) p.set("customerName", name);
    if (gig.notes) p.set("notes", gig.notes);
    if (gig.email) p.set("email", gig.email);
    if (gig.window_count > 0) p.set("windowCount", String(gig.window_count));
    if (gig.total_price > 0) p.set("totalPrice", String(gig.total_price));
    p.set("serviceDate", gig.service_date);
    p.set("serviceTime", gig.service_time);
    router.push(`/gig-plan?${p.toString()}`);
  };

  const createGig = async (status: "pending" | "lead", thenStart = false) => {
    if (!fAddress.trim() || !fPhone.trim()) {
      Alert.alert("Required", "Address and phone are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/worker/gigs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: fAddress.trim(), phone: fPhone.trim(),
          email: fEmail.trim() || null,
          customer_name: fName.trim() || null,
          notes: fNotes.trim() || null,
          service_date: fDate || new Date().toISOString().slice(0, 10),
          window_count: parseInt(fWindows) || 0,
          total_price: totalPrice,
          status,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      if (thenStart) {
        goToSafety(json.id, fAddress.trim(), fPhone.trim(), fName.trim() || undefined, fNotes.trim() || undefined, fEmail.trim() || undefined);
      } else {
        setShowForm(false);
        resetForm();
        fetchGigs();
      }
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  const markLead = async (gig: Gig) => {
    try {
      await fetch(`${API_URL}/api/worker/gigs`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: gig.id, status: "lead" }),
      });
      setGigs(prev => prev.map(g => g.id === gig.id ? { ...g, status: "lead" } : g));
    } catch {
      Alert.alert("Error", "Could not update.");
    }
  };

  const fieldStyle = { backgroundColor: inputBg, borderWidth: 1, borderColor: inputBorder, borderRadius: 10, padding: 11, color: textMain, fontSize: 15 };
  const labelStyle = { color: textSub, fontSize: 11, fontWeight: "700" as const, letterSpacing: 0.8, textTransform: "uppercase" as const, marginBottom: 4 };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bg }}
      contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20, paddingTop: 56 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchGigs(); }} />}
    >
      <BrandingHeader />
      <WeatherWidget enabled={true} compact={true} />

      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 14 }}>
        <Text style={{ color: textMain, fontSize: 22, fontWeight: "700" }}>Your Gigs</Text>
        <Pressable
          onPress={() => { setShowForm(!showForm); if (!showForm) resetForm(); }}
          style={{ backgroundColor: "#3b82f6", borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16 }}
        >
          <Text style={{ color: "white", fontWeight: "700", fontSize: 14 }}>{showForm ? "Cancel" : "+ Add Gig"}</Text>
        </Pressable>
      </View>

      {/* Add Gig Form */}
      {showForm && (
        <View style={{ backgroundColor: card, borderRadius: 16, borderWidth: 1, borderColor: "#3b82f6", padding: 16, marginBottom: 14 }}>
          <Text style={{ color: textMain, fontSize: 16, fontWeight: "700", marginBottom: 12 }}>New Gig</Text>

          <View style={{ marginBottom: 10 }}>
            <Text style={labelStyle}>Customer Name</Text>
            <TextInput value={fName} onChangeText={setFName} placeholder="Jane Smith (optional)" placeholderTextColor={textSub} style={fieldStyle} />
          </View>
          <View style={{ marginBottom: 10 }}>
            <Text style={labelStyle}>Address *</Text>
            <TextInput value={fAddress} onChangeText={setFAddress} placeholder="123 Main St, Santa Cruz" placeholderTextColor={textSub} style={fieldStyle} />
          </View>
          <View style={{ marginBottom: 10 }}>
            <Text style={labelStyle}>Phone *</Text>
            <TextInput value={fPhone} onChangeText={setFPhone} placeholder="(831) 555-0100" placeholderTextColor={textSub} keyboardType="phone-pad" style={fieldStyle} />
          </View>
          <View style={{ marginBottom: 10 }}>
            <Text style={labelStyle}>Email (optional)</Text>
            <TextInput value={fEmail} onChangeText={setFEmail} placeholder="jane@email.com" placeholderTextColor={textSub} keyboardType="email-address" autoCapitalize="none" style={fieldStyle} />
          </View>

          {/* Pricing */}
          <View style={{ marginBottom: 4 }}>
            <Text style={labelStyle}>Pricing</Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: textSub, fontSize: 10, marginBottom: 3 }}>Windows</Text>
                <TextInput value={fWindows} onChangeText={setFWindows} placeholder="0" placeholderTextColor={textSub} keyboardType="number-pad" style={fieldStyle} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: textSub, fontSize: 10, marginBottom: 3 }}>$/window</Text>
                <TextInput value={fRate} onChangeText={setFRate} placeholder="0.00" placeholderTextColor={textSub} keyboardType="decimal-pad" style={fieldStyle} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: textSub, fontSize: 10, marginBottom: 3 }}>Flat rate</Text>
                <TextInput value={fFlat} onChangeText={setFFlat} placeholder="0.00" placeholderTextColor={textSub} keyboardType="decimal-pad" style={fieldStyle} />
              </View>
            </View>
            {totalPrice > 0 && (
              <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 6, marginBottom: 6 }}>
                {windowSubtotal > 0 && flatAmount > 0 && (
                  <Text style={{ color: textSub, fontSize: 11 }}>${windowSubtotal.toFixed(2)} + ${flatAmount.toFixed(2)} =</Text>
                )}
                <Text style={{ color: "#10b981", fontSize: 15, fontWeight: "700" }}>Total ${totalPrice.toFixed(2)}</Text>
              </View>
            )}
          </View>

          <View style={{ marginBottom: 10 }}>
            <Text style={labelStyle}>Access Notes</Text>
            <TextInput
              value={fNotes} onChangeText={setFNotes}
              placeholder="Gate code, dog on premises, ring bell, park in rear…"
              placeholderTextColor={textSub} multiline numberOfLines={3}
              style={[fieldStyle, { minHeight: 72, textAlignVertical: "top" }]}
            />
          </View>
          <View style={{ marginBottom: 16 }}>
            <Text style={labelStyle}>Service Date (optional)</Text>
            <TextInput value={fDate} onChangeText={setFDate} placeholder={new Date().toISOString().slice(0, 10)} placeholderTextColor={textSub} style={fieldStyle} />
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable onPress={() => createGig("pending", true)} disabled={saving}
              style={{ flex: 2, backgroundColor: "#10b981", borderRadius: 12, paddingVertical: 13, alignItems: "center" }}>
              <Text style={{ color: "white", fontWeight: "700", fontSize: 15 }}>{saving ? "…" : "▶ Start Now"}</Text>
            </Pressable>
            <Pressable onPress={() => createGig("pending", false)} disabled={saving}
              style={{ flex: 1.5, borderWidth: 1, borderColor: "#3b82f6", borderRadius: 12, paddingVertical: 13, alignItems: "center", backgroundColor: isDark ? "rgba(59,130,246,0.12)" : "#eff6ff" }}>
              <Text style={{ color: "#3b82f6", fontWeight: "700", fontSize: 14 }}>📅 Schedule</Text>
            </Pressable>
            <Pressable onPress={() => createGig("lead", false)} disabled={saving}
              style={{ flex: 1, backgroundColor: inputBg, borderWidth: 1, borderColor: inputBorder, borderRadius: 12, paddingVertical: 13, alignItems: "center" }}>
              <Text style={{ color: textSub, fontWeight: "700", fontSize: 14 }}>Lead</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Gig list */}
      {loading ? (
        <ActivityIndicator color="#3b82f6" style={{ marginTop: 40 }} />
      ) : gigs.length === 0 ? (
        <Text style={{ color: textSub, textAlign: "center", marginTop: 40, fontSize: 14 }}>
          No upcoming gigs.{"\n"}Tap "+ Add Gig" to create one.
        </Text>
      ) : (
        gigs.map(gig => {
          const { text: dateText, color: dateColor } = gigDateLabel(gig.service_date);
          const name = [gig.first_name, gig.last_name].filter(Boolean).join(" ") || null;
          const isLead = gig.status === "lead";

          return (
            <Pressable
              key={gig.id}
              onPress={() => goToPlan(gig, name)}
              style={{
                backgroundColor: card, borderRadius: 14, borderWidth: 1,
                borderColor: isLead ? "rgba(251,191,36,0.35)" : cardBorder,
                padding: 14, marginBottom: 10, flexDirection: "row", gap: 12, alignItems: "flex-start",
              }}
            >
              {/* Date badge */}
              <View style={{ alignItems: "center", minWidth: 52, paddingTop: 2 }}>
                <Text style={{ color: dateColor, fontSize: 13, fontWeight: "800" }}>{dateText}</Text>
                {isLead && <Text style={{ color: "#fbbf24", fontSize: 10, fontWeight: "700", marginTop: 2 }}>LEAD</Text>}
                {gig.total_price > 0 && (
                  <Text style={{ color: textSub, fontSize: 10, marginTop: 4 }}>${gig.total_price}</Text>
                )}
              </View>

              {/* Info */}
              <View style={{ flex: 1 }}>
                {name && <Text style={{ color: textMain, fontSize: 15, fontWeight: "600", marginBottom: 2 }}>{name}</Text>}
                <Text style={{ color: name ? textSub : textMain, fontSize: name ? 12 : 14, fontWeight: name ? "400" : "600" }}>{gig.address}</Text>
                {gig.phone && <Text style={{ color: textSub, fontSize: 11, marginTop: 2 }}>{gig.phone}</Text>}
                {gig.email && <Text style={{ color: textSub, fontSize: 11, marginTop: 1 }}>{gig.email}</Text>}
                {gig.notes && (
                  <Text style={{ color: textSub, fontSize: 11, fontStyle: "italic", marginTop: 4 }} numberOfLines={2}>{gig.notes}</Text>
                )}
              </View>

              {/* Right side: Lead toggle + chevron */}
              <View style={{ alignItems: "flex-end", justifyContent: "space-between", alignSelf: "stretch" }}>
                {!isLead ? (
                  <Pressable
                    onPress={(e) => { e.stopPropagation?.(); markLead(gig); }}
                    style={{ borderWidth: 1, borderColor: "rgba(251,191,36,0.4)", borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: isDark ? "rgba(251,191,36,0.08)" : "#fffbeb" }}
                  >
                    <Text style={{ color: "#f59e0b", fontWeight: "600", fontSize: 11 }}>Lead</Text>
                  </Pressable>
                ) : (
                  <View style={{ width: 8 }} />
                )}
                <Text style={{ color: textSub, fontSize: 18, lineHeight: 18 }}>›</Text>
              </View>
            </Pressable>
          );
        })
      )}
    </ScrollView>
  );
}
