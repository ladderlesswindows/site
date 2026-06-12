import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { Camera } from "lucide-react-native";
import { useJobDraft } from "@/core/jobs/job-draft-context";
import { BigButton } from "@/core/ui-components/BigButton";
import { useTheme } from "@/core/theme-context";

/**
 * Screens Before Cleaning
 * 
 * This is the dedicated phase for documenting the pile of screens 
 * before they are cleaned. This has been siloed from the walls flow
 * into its own route group for better modular organization.
 */
export default function ScreensBefore() {
  const { currentJob } = useJobDraft();
  const { isDark } = useTheme();

  const address = currentJob?.address || "this job";

  const openCamera = () => {
    // Camera remains in the walls capture flow for now (shared tool)
    router.push("/new-job/camera?mode=before-screens");
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pt-8 pb-4"
        keyboardShouldPersistTaps="handled"
      >
        <Text className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Screens — Before Cleaning
        </Text>
        <Text className={`mt-1 text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {address}
        </Text>

        <BigButton
          onPress={openCamera}
          variant="primary"
          size="xl"
          icon={<Camera size={28} color="#fff" />}
          className="mt-6"
        >
          Open Camera
        </BigButton>

        <Text className={`text-center text-xl mt-8 leading-relaxed max-w-[320px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Take photo of stack of screens before cleaning.
        </Text>

        <Text className={`text-center text-sm mt-4 max-w-[280px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          One clear photo of the pile is enough.
        </Text>

        <BigButton
          onPress={() => router.replace("/new-job/final")}
          variant="secondary"
          size="xl"
          className="mt-8"
        >
          No Screens
        </BigButton>
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
