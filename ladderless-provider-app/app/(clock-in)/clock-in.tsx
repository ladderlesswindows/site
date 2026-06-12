import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { useJobDraft } from "@/core/jobs/job-draft-context";
import { useTheme } from "@/core/theme-context";
import { BrandingHeader } from "@/core/ui-components/BrandingHeader";
import { WeatherWidget } from "@/features/weather";

export default function ClockInWelcome() {
  const { createDraft, startEngagedTime, setSafetyChecks } = useJobDraft();
  const { isDark } = useTheme();
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [selectedChecks, setSelectedChecks] = useState<string[]>([]);

  const safetyOptions = [
    "Client Nearby",
    "Smartwatch Charged",
    "Assistant on site",
  ];

  const toggleCheck = (option: string) => {
    if (selectedChecks.includes(option)) {
      setSelectedChecks(selectedChecks.filter((c) => c !== option));
    } else {
      setSelectedChecks([...selectedChecks, option]);
    }
  };

  const canClockIn = selectedChecks.length > 0;

  const handleClockIn = async () => {
    if (isClockingIn || !canClockIn) return;

    setIsClockingIn(true);
    try {
      // This starts your "engaged time" for the day (overall clocked-in time)
      await createDraft();
      await startEngagedTime();
      await setSafetyChecks(selectedChecks);

      router.replace("/home");
    } catch (err) {
      console.error("Failed to clock in:", err);
    } finally {
      setIsClockingIn(false);
    }
  };

  return (
    <View className={`flex-1 px-6 pt-12 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Branding Banner (includes its own theme toggle) */}
      <BrandingHeader />

      {/* Weather - Prominently shown on Clock-in (enabled = real API calls + auto refresh) */}
      <WeatherWidget enabled={true} />

      {/* Safety Action Plan */}
      <View className="flex-1 justify-center">
        <Text className={`text-3xl font-bold tracking-tight text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Safety Action Plan
        </Text>

        <Text className={`text-center mt-2 mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Select at least one before clocking in
        </Text>

        <View className="space-y-4">
          {safetyOptions.map((option) => {
            const isSelected = selectedChecks.includes(option);
            return (
              <Pressable
                key={option}
                onPress={() => toggleCheck(option)}
                className={`flex-row items-center p-4 rounded-2xl border-2 active:opacity-80 ${
                  isSelected
                    ? isDark 
                      ? 'bg-emerald-900/30 border-emerald-500' 
                      : 'bg-emerald-50 border-emerald-500'
                    : isDark 
                      ? 'bg-slate-900 border-slate-700' 
                      : 'bg-white border-slate-300'
                }`}
              >
                <View
                  className={`w-6 h-6 mr-4 rounded border-2 items-center justify-center ${
                    isSelected 
                      ? 'bg-emerald-600 border-emerald-600' 
                      : isDark 
                        ? 'border-slate-500' 
                        : 'border-slate-400'
                  }`}
                >
                  {isSelected && <Text className="text-white text-sm font-bold">✓</Text>}
                </View>
                <Text className={`text-lg flex-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Clock In Button */}
      <View className="pb-12">
        <Pressable
          onPress={handleClockIn}
          disabled={isClockingIn || !canClockIn}
          className="bg-blue-600 active:bg-blue-700 rounded-3xl py-6 items-center shadow-sm active:opacity-90"
          style={{ opacity: (isClockingIn || !canClockIn) ? 0.5 : 1 }}
        >
          <Text className="text-white text-2xl font-semibold tracking-wide">
            {isClockingIn ? "Clocking In..." : "Clock In"}
          </Text>
        </Pressable>

        {/* View Past Jobs - secondary action under primary Clock In */}
        <Pressable
          onPress={() => router.push("/previous-jobs")}
          className={`mt-4 border-2 rounded-3xl py-4 items-center ${
            isDark
              ? "bg-slate-900 border-slate-700 active:bg-slate-800"
              : "bg-white border-slate-300 active:bg-slate-100"
          }`}
        >
          <Text
            className={`text-lg font-medium ${
              isDark ? "text-slate-200" : "text-slate-800"
            }`}
          >
            View Past Jobs
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
