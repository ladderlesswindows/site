import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { Camera } from "lucide-react-native";
import { useJobDraft } from "@/core/jobs/job-draft-context";
import { BigButton } from "@/core/ui-components/BigButton";
import { PhotoThumbnail } from "@/core/ui-components/PhotoThumbnail";
import { useTheme } from "@/core/theme-context";

/**
 * Screens After Cleaning
 * 
 * Dedicated screen for photographing the pile of screens after cleaning
 * and the option to mark that all screens have been reinstalled.
 * 
 * This phase has been extracted into its own route group `(screens)`
 * to better reflect the shift from per-wall documentation to screen-specific control.
 */
export default function ScreensAfter() {
  const { currentJob } = useJobDraft();
  const { isDark } = useTheme();

  const address = currentJob?.address || "this job";

  const openCamera = () => {
    // Camera capture tool is currently still located under the walls capture flow.
    // Using /new-job/camera with mode flag to distinguish after-screens vs walls vs final.
    router.push("/new-job/camera?mode=after-screens");
  };

  const handleAllReinstalled = () => {
    router.replace("/new-job/final");
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pt-8 pb-4"
        keyboardShouldPersistTaps="handled"
      >
        <Text className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Screens — After Cleaning
        </Text>
        <Text className={`mt-1 text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {address}
        </Text>

        {/* Photo Previews - show after taking (like walls flow) */}
        {(currentJob?.before_clean_photo_uri || currentJob?.after_clean_photo_uri) && (
          <View className="py-4">
            {currentJob?.before_clean_photo_uri && (
              <View className="mb-4">
                <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  BEFORE (just taken)
                </Text>
                <PhotoThumbnail uri={currentJob.before_clean_photo_uri} size={180} />
              </View>
            )}
            {currentJob?.after_clean_photo_uri && (
              <View>
                <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  AFTER (just taken)
                </Text>
                <PhotoThumbnail uri={currentJob.after_clean_photo_uri} size={180} />
              </View>
            )}
          </View>
        )}

        <BigButton
          onPress={openCamera}
          variant="primary"
          size="xl"
          icon={<Camera size={28} color="#fff" />}
        >
          Open Camera
        </BigButton>

        <Text className={`text-center text-xl mt-8 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Take photo of screens after cleaning.
        </Text>

        <View className="mt-10">
          <BigButton
            onPress={handleAllReinstalled}
            variant="success"
            size="xl"
          >
            All Screens Reinstalled
          </BigButton>
        </View>

        {/* Jump to complete — at the end of the screens sequence, as requested */}
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
      </ScrollView>

      <View className="px-6 pb-8">
        <Pressable onPress={() => router.back()} className="py-3">
          <Text className={`text-center text-base ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Back
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
