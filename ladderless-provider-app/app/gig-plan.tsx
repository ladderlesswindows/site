import React, { useState, useEffect } from "react";
import {
  View, Text, Pressable, ScrollView, Linking, ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import { useTheme } from "@/core/theme-context";
import { BrandingHeader } from "@/core/ui-components/BrandingHeader";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://www.ladderlesswindows.com";

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function GigPlanScreen() {
  const { isDark } = useTheme();
  const params = useLocalSearchParams<{
    gigId?: string;
    address: string;
    phone?: string;
    customerName?: string;
    notes?: string;
    email?: string;
  }>();
  const { gigId, address, phone, customerName, notes, email } = params;

  const [distance, setDistance] = useState<number | null>(null);
  const [distLoading, setDistLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  const bg = isDark ? "#0f172a" : "#f8fafc";
  const textMain = isDark ? "#f1f5f9" : "#0f172a";
  const textSub = isDark ? "rgba(255,255,255,0.45)" : "#64748b";
  const card = isDark ? "rgba(255,255,255,0.05)" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") { setDistLoading(false); return; }
        const loc = await Location.getCurrentPositionAsync({});
        const geo: Array<{ lat: string; lon: string }> = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
          { headers: { "User-Agent": "SimpleWindowsCleaning/1.0" } }
        ).then(r => r.json());
        if (geo.length > 0) {
          setDistance(haversine(
            loc.coords.latitude, loc.coords.longitude,
            parseFloat(geo[0].lat), parseFloat(geo[0].lon)
          ));
        }
      } catch {
        // silently fail
      } finally {
        setDistLoading(false);
      }
    })();
  }, [address]);

  const handleStartGig = async () => {
    if (starting) return;
    setStarting(true);
    try {
      if (phone) {
        fetch(`${API_URL}/api/worker/notify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, first_name: customerName ?? null, address }),
        }).catch(() => {});
      }
      const mapsUrl = `https://maps.apple.com/?daddr=${encodeURIComponent(address)}`;
      Linking.openURL(mapsUrl).catch(() =>
        Linking.openURL(`https://maps.google.com/?daddr=${encodeURIComponent(address)}`)
      );
      const p = new URLSearchParams({ address, phone: phone ?? "" });
      if (gigId) p.set("bookingId", gigId);
      if (customerName) p.set("customerName", customerName);
      if (notes) p.set("notes", notes);
      if (email) p.set("email", email);
      router.push(`/gig-safety?${p.toString()}`);
    } finally {
      setStarting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 160 }}>
        <BrandingHeader />

        {/* Customer + address */}
        <View style={{
          backgroundColor: card, borderRadius: 14, borderWidth: 1, borderColor: cardBorder,
          padding: 16, marginTop: 8, marginBottom: 14,
        }}>
          {customerName ? (
            <Text style={{ color: textMain, fontSize: 18, fontWeight: "700", marginBottom: 4 }}>{customerName}</Text>
          ) : null}
          <Text style={{ color: customerName ? textSub : textMain, fontSize: 15, fontWeight: customerName ? "400" : "600" }}>
            {address}
          </Text>
          {notes ? (
            <Text style={{ color: textSub, fontSize: 12, fontStyle: "italic", marginTop: 8 }}>{notes}</Text>
          ) : null}
        </View>

        {/* Distance estimate */}
        <View style={{
          backgroundColor: card, borderRadius: 14, borderWidth: 1, borderColor: cardBorder,
          padding: 20, marginBottom: 14, alignItems: "center",
        }}>
          <Text style={{ color: textSub, fontSize: 11, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10 }}>
            Straight-line Distance
          </Text>
          {distLoading ? (
            <ActivityIndicator color="#3b82f6" />
          ) : distance !== null ? (
            <Text style={{ color: textMain, fontSize: 40, fontWeight: "800", lineHeight: 44 }}>
              {distance.toFixed(1)}
              <Text style={{ fontSize: 18, color: textSub, fontWeight: "400" }}> mi</Text>
            </Text>
          ) : (
            <Text style={{ color: textSub, fontSize: 14 }}>Could not estimate</Text>
          )}
          <Text style={{ color: textSub, fontSize: 10, marginTop: 6 }}>
            As the crow flies — tap Start Gig for real directions
          </Text>
        </View>

        {/* Map placeholder */}
        <View style={{
          backgroundColor: card, borderRadius: 14, borderWidth: 1,
          borderColor: isDark ? "rgba(59,130,246,0.2)" : "#dbeafe",
          height: 200, justifyContent: "center", alignItems: "center",
          marginBottom: 16,
        }}>
          <Text style={{ fontSize: 36, marginBottom: 8 }}>🗺</Text>
          <Text style={{ color: textMain, fontSize: 14, fontWeight: "600" }}>Map view — coming soon</Text>
          <Text style={{ color: textSub, fontSize: 11, marginTop: 4, textAlign: "center", paddingHorizontal: 20 }}>
            Your dot + job dot + driving miles (like Instacart)
          </Text>
        </View>

        <Text style={{ color: textSub, fontSize: 12, textAlign: "center", lineHeight: 18 }}>
          No SMS sent yet.{"\n"}Tap Start Gig when you're ready to head out.
        </Text>
      </ScrollView>

      {/* Fixed bottom CTA */}
      <View style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        paddingHorizontal: 20, paddingBottom: 44, paddingTop: 16,
        backgroundColor: bg, borderTopWidth: 1, borderTopColor: cardBorder,
      }}>
        <Pressable
          onPress={handleStartGig}
          disabled={starting}
          style={{
            backgroundColor: "#10b981", borderRadius: 24,
            paddingVertical: 18, alignItems: "center",
            opacity: starting ? 0.6 : 1,
          }}
        >
          <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>
            {starting ? "Starting…" : "Start Gig — Notify Client →"}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 3 }}>
            Opens Maps • Texts client you're on the way
          </Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={{ alignItems: "center", paddingTop: 14 }}>
          <Text style={{ color: textSub, fontSize: 14 }}>← Back</Text>
        </Pressable>
      </View>
    </View>
  );
}
