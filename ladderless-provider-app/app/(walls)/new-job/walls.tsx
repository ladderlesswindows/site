import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { Camera } from "lucide-react-native";
import { useJobDraft } from "@/core/jobs/job-draft-context";
import { useTheme } from "@/core/theme-context";
import { BigButton } from "@/core/ui-components/BigButton";
import { NumberInput } from "@/core/ui-components/NumberInput";
import { BrandingHeader } from "@/core/ui-components/BrandingHeader";
import { WeatherWidget } from "@/features/weather";
import { useClockOut } from "@/features/time-tracking";
import { WallCard } from "@/features/walls/components/WallCard";

const MAX_WALLS = 20;

export default function WallsScreen() {
  const {
    currentJob,
    createDraft,
    addSection,
    removeSection,
    startWorkTime,
    isLoading,
  } = useJobDraft();

  const { isDark } = useTheme();
  const { clockOut } = useClockOut();

  const sections = currentJob?.sections ?? [];

  const [windows, setWindows] = useState(0);
  const [screens, setScreens] = useState(0);

  // Live stopwatch for working time (since Begin Gig was tapped)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Ensure we have a draft job when entering this screen
  useEffect(() => {
    if (!isLoading && !currentJob) {
      createDraft();
    }
  }, [isLoading, currentJob, createDraft]);

  // Live working time stopwatch (updates every second once Begin Gig is tapped)
  useEffect(() => {
    const workStart = currentJob?.work_start;
    if (!workStart) {
      setElapsedSeconds(0);
      return;
    }

    const startTime = new Date(workStart).getTime();

    const tick = () => {
      const now = Date.now();
      const seconds = Math.floor((now - startTime) / 1000);
      setElapsedSeconds(Math.max(0, seconds));
    };

    tick(); // run immediately
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [currentJob?.work_start]);

  const wallCount = sections.length;



  const formatElapsedTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDeleteSection = (sectionId: string, index: number) => {
    Alert.alert(
      "Delete Wall?",
      `Remove Wall ${index + 1} and its photo?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => removeSection(sectionId),
        },
      ]
    );
  };

  // Quick path: create one wall entry with no photo and jump straight to final
  const handleQuickComplete = async () => {
    if (windows === 0 && screens === 0) {
      Alert.alert("Add Counts", "Please enter windows or screens before completing.");
      return;
    }

    try {
      await addSection(
        {
          photo_uri: "", // no photo
          windows,
          screens,
          notes: null,
        },
        "" // no photo to save
      );

      setWindows(0);
      setScreens(0);
      router.replace("/new-job/final");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not save the quick tally.");
    }
  };

  if (isLoading) {
    return (
      <View className={`flex-1 items-center justify-center ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <Text className={isDark ? 'text-slate-400' : 'text-slate-500'}>Loading job…</Text>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <BrandingHeader />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pt-4 pb-24"
        keyboardShouldPersistTaps="handled"
      >
        {/* Weather widget (compact on walls flow) */}
        <WeatherWidget enabled={true} compact />

        {/* Gig timer / Begin Gig - always visible near top for time accuracy */}
        {!currentJob?.work_start ? (
          <Pressable
            onPress={async () => {
              try {
                await startWorkTime();
              } catch (e) {
                console.error("Failed to start work time", e);
              }
            }}
            className="bg-emerald-600 active:bg-emerald-700 rounded-3xl py-4 items-center mb-6"
          >
            <Text className="text-white text-xl font-semibold tracking-wide">Begin Gig</Text>
          </Pressable>
        ) : (
          <View className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-2xl p-4 mb-6 items-center">
            <Text className="text-xs font-medium text-emerald-600 dark:text-emerald-400 tracking-widest">GIG TIME</Text>
            <Text className={`text-4xl font-bold tabular-nums tracking-tighter mt-1 ${isDark ? 'text-white' : 'text-emerald-900'}`}>
              {formatElapsedTime(elapsedSeconds)}
            </Text>
          </View>
        )}

        {/* === EXACT REQUESTED ENTRY: Quick fields + small red button + big green button === */}
        <View className="mb-2">
          <Text className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Walls &amp; Windows
          </Text>
          <Text className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Quick tally or start with photos
          </Text>
        </View>

        {/* Fast path card: just the two fields + small red button at the end */}
        <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 mb-4">
          <NumberInput
            label="Windows"
            value={windows}
            onChange={setWindows}
            min={0}
            max={99}
          />
          <NumberInput
            label="Screens"
            value={screens}
            onChange={setScreens}
            min={0}
            max={99}
          />

          {/* Small red "No Photos/Complete" button — goes straight to final step */}
          <Pressable
            onPress={handleQuickComplete}
            disabled={windows === 0 && screens === 0}
            className={`mt-3 self-start px-5 py-2.5 rounded-2xl ${
              windows === 0 && screens === 0
                ? 'bg-red-300 opacity-60'
                : 'bg-red-600 active:bg-red-700'
            }`}
          >
            <Text className="text-white text-base font-semibold">No Photos/Complete</Text>
          </Pressable>
          <Text className="text-[11px] text-red-500 dark:text-red-400 mt-1.5">
            Skips photos and jumps to Complete Documentation
          </Text>
        </View>

        {/* Big green button — primary photo path. Goes to WallCaptureScreen (photo optional) */}
        <BigButton
          variant="success"
          size="xl"
          onPress={() => router.push("/new-job/wall-capture?mode=add")}
          icon={<Camera size={24} color="#fff" />}
        >
          Add First Wall Photo
        </BigButton>
        <Text className={`text-center text-xs mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Photo is optional. Takes you to the capture workspace then the wall list.
        </Text>

        {/* === WALLS LIST (appears once you have any captured walls via WallCaptureScreen) === */}
        {sections.length > 0 && (
          <View className="mt-8">
            <View className="flex-row items-center justify-between mb-3">
              <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Documented Walls ({sections.length})
              </Text>
              <Pressable
                onPress={() => router.push("/new-job/wall-capture?mode=add")}
                className="bg-slate-800 dark:bg-slate-700 active:bg-black px-4 py-1.5 rounded-xl"
              >
                <Text className="text-white text-sm font-semibold">+ Add</Text>
              </Pressable>
            </View>

            {sections.map((section, index) => (
              <WallCard
                key={section.id}
                section={section}
                index={index}
                onPress={() => {
                  router.push({
                    pathname: "/new-job/wall-capture",
                    params: { sectionId: section.id },
                  });
                }}
                onDelete={() => handleDeleteSection(section.id, index)}
              />
            ))}

            {/* Document Screens Cleaning — goes to the before/after pile photo sequence */}
            <BigButton
              variant="primary"
              size="xl"
              onPress={() => router.replace("/new-job/screens-before")}
              className="mt-4"
            >
              Document Screens Cleaning
            </BigButton>
            <Text className="text-center text-xs mt-2 text-slate-500">
              Before + after photos of the screen pile (optional step)
            </Text>

            {/* Jump to the page with Complete Documentation button */}
            <BigButton
              variant="primary"
              size="xl"
              onPress={() => router.replace("/new-job/final")}
              className="mt-3"
            >
              Jump to Complete Documentation
            </BigButton>
            <Text className="text-center text-xs mt-2 text-slate-500">
              Review totals, add final photos/notes, then finish the job
            </Text>
          </View>
        )}

        {/* Helpful empty state when no walls yet */}
        {sections.length === 0 && (
          <View className="mt-6 items-center">
            <Text className={`text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'} max-w-[280px]`}>
              For 5-second jobs just enter counts and tap the red button. For normal jobs tap the green button to begin photo documentation.
            </Text>
          </View>
        )}

        {/* Max walls notice */}
        {wallCount >= MAX_WALLS && (
          <Text className="text-center text-red-600 mt-4 text-sm font-medium">
            Maximum of {MAX_WALLS} walls reached for this job.
          </Text>
        )}
      </ScrollView>

      {/* Clock Out footer — available on every gig screen */}
      <Pressable
        className="items-center py-3 border-t border-slate-200 dark:border-slate-800"
        onPress={() => {
          Alert.alert(
            "Clock Out?",
            "Are you sure? This will Reset the gig AND turn off your shift timer.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Clock Out",
                style: "destructive",
                onPress: async () => {
                  await clockOut();
                  router.replace("/clock-in");
                },
              },
            ]
          );
        }}
      >
        <Text className="text-red-600 text-base font-medium">Clock Out</Text>
      </Pressable>
    </View>
  );
}
