import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { useJobDraft } from "@/core/jobs/job-draft-context";
import { SectionCard } from "@/core/ui-components/SectionCard";
import { BigButton } from "@/core/ui-components/BigButton";
import type { Section } from "@/core/jobs/types";
import { BrandingHeader } from "@/core/ui-components/BrandingHeader";

export default function WallsReview() {
  const { currentJob, totalWindows, totalScreens } = useJobDraft();

  const sections = currentJob?.sections ?? [];
  const wallCount = sections.length;

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <BrandingHeader />

      <ScrollView className="flex-1 px-6" contentContainerClassName="pb-10 pt-6">
        {/* Grand Totals - prominent and glove-friendly */}
        <View className="mb-8">
          <Text className="text-sm font-semibold text-slate-500 tracking-wider mb-3 px-1">
            JOB TOTALS
          </Text>

          <View className="bg-white rounded-3xl p-6 border border-slate-200">
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-5xl font-bold text-slate-900">
                  {wallCount}
                </Text>
                <Text className="text-lg text-slate-600">Walls Documented</Text>
              </View>
            </View>

            <View className="flex-row gap-4">
              {/* Total Windows */}
              <View className="flex-1 bg-blue-50 rounded-2xl p-5">
                <Text className="text-sm font-medium text-blue-700 tracking-wider">
                  WINDOWS
                </Text>
                <Text className="text-5xl font-bold text-blue-900 mt-1">
                  {totalWindows}
                </Text>
              </View>

              {/* Total Screens */}
              <View className="flex-1 bg-emerald-50 rounded-2xl p-5">
                <Text className="text-sm font-medium text-emerald-700 tracking-wider">
                  SCREENS
                </Text>
                <Text className="text-5xl font-bold text-emerald-900 mt-1">
                  {totalScreens}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Per-wall breakdown */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-slate-500 tracking-wider mb-3 px-1">
            WALL BREAKDOWN
          </Text>

          {sections.length > 0 ? (
            sections.map((section: Section, index: number) => (
              <SectionCard
                key={section.id}
                section={section}
                index={index}
              />
            ))
          ) : (
            <View className="bg-white rounded-3xl p-8 items-center border border-slate-200">
              <Text className="text-slate-500">No walls recorded yet.</Text>
            </View>
          )}
        </View>

        {/* Helpful note */}
        <View className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <Text className="text-amber-800 text-sm leading-relaxed">
            These counts represent the windows and screens identified before cleaning.
            You can continue to document before/after photos in the next steps.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom actions */}
      <View className="px-6 pb-8 pt-4 bg-white border-t border-slate-100 gap-3">
        <BigButton
          variant="primary"
          size="xl"
          onPress={() => {
            // Move to the Screens (before/after cleaning) phase
            router.replace("/new-job/screens-before");
          }}
        >
          Continue Documentation
        </BigButton>

        <Pressable
          onPress={() => router.replace("/new-job/walls")}
          className="py-4 items-center"
        >
          <Text className="text-slate-500 text-base font-medium">
            Review walls again
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
