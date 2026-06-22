import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { useJobDraft } from "@/core/jobs/job-draft-context";
import { useTheme } from "@/core/theme-context";
import { BrandingHeader } from "@/core/ui-components/BrandingHeader";
import { WeatherWidget } from "@/features/weather";

export default function ClockInWelcome() {
  const { createDraft, startEngagedTime } = useJobDraft();
  const { isDark } = useTheme();
  const [isClockingIn, setIsClockingIn] = useState(false);

  const handleClockIn = async () => {
    if (isClockingIn) return;
    setIsClockingIn(true);
    try {
      await createDraft();
      await startEngagedTime();
      router.replace("/gig-list");
    } catch (err) {
      console.error("Failed to clock in:", err);
    } finally {
      setIsClockingIn(false);
    }
  };

  return (
    <View className={`flex-1 px-6 pt-12 ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
      <BrandingHeader />
      <WeatherWidget enabled={true} />

      <View className="flex-1 justify-center items-center">
        <Text className={`text-4xl font-bold tracking-tight text-center mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
          Good morning.
        </Text>
        <Text className={`text-center text-base ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Tap to start your day and see your gigs.
        </Text>
      </View>

      <View className="pb-12 gap-3">
        <Pressable
          onPress={handleClockIn}
          disabled={isClockingIn}
          className="bg-blue-600 active:bg-blue-700 rounded-3xl py-6 items-center shadow-sm"
          style={{ opacity: isClockingIn ? 0.6 : 1 }}
        >
          <Text className="text-white text-2xl font-semibold tracking-wide">
            {isClockingIn ? "Clocking In…" : "Clock In"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/previous-jobs")}
          className={`border-2 rounded-3xl py-4 items-center ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-300"}`}
        >
          <Text className={`text-lg font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>
            View Past Jobs
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
