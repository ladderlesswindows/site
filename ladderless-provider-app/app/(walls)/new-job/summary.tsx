import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { BigButton } from "@/core/ui-components/BigButton";
import { exportJobToSpreadsheet } from "@/core/jobs/export-to-spreadsheet";
import { BrandingHeader } from "@/core/ui-components/BrandingHeader";

interface CompletedJobData {
  id: string;
  address: string | null;
  total_windows: number;
  total_screens: number;
  wallCount: number;
  // New optional details (no rating per request)
  contact_person: string | null;
  address_notes: string | null;
  phone: string | null;
  email: string | null;
  mailing_list: number | null;
  how_find: string | null;
}

export default function JobSummary() {
  const db = useSQLiteContext();
  const { jobId } = useLocalSearchParams<{ jobId?: string }>();
  const [jobData, setJobData] = useState<CompletedJobData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCompletedJob = async () => {
      setIsLoading(true);
      try {
        let jobRow: any = null;

        if (jobId) {
          jobRow = await db.getFirstAsync(
            `SELECT id, address, total_windows, total_screens, contact_person, address_notes, phone, email, mailing_list, how_find 
             FROM jobs 
             WHERE id = ?`,
            [jobId]
          );
        } else {
          // Fallback: get the most recently completed job
          jobRow = await db.getFirstAsync(
            `SELECT id, address, total_windows, total_screens, contact_person, address_notes, phone, email, mailing_list, how_find 
             FROM jobs 
             WHERE status = 'completed' 
             ORDER BY completed_at DESC 
             LIMIT 1`
          );
        }

        if (jobRow) {
          const wallCountRow = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM sections WHERE job_id = ?`,
            [jobRow.id]
          );

          setJobData({
            id: jobRow.id,
            address: jobRow.address,
            total_windows: jobRow.total_windows || 0,
            total_screens: jobRow.total_screens || 0,
            wallCount: wallCountRow?.count || 0,
            contact_person: jobRow.contact_person || null,
            address_notes: jobRow.address_notes || null,
            phone: jobRow.phone || null,
            email: jobRow.email || null,
            mailing_list: jobRow.mailing_list ?? null,
            how_find: jobRow.how_find || null,
          });
        }
      } catch (err) {
        console.error("Failed to load completed job summary:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCompletedJob();
  }, [db, jobId]);

  const handleViewPreviousJobs = () => {
    router.push("/previous-jobs");
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#1e40af" />
        <Text className="mt-4 text-slate-500">Loading job summary...</Text>
      </View>
    );
  }

  const address = jobData?.address || "Unknown address";
  const wallCount = jobData?.wallCount || 0;
  const totalWindows = jobData?.total_windows || 0;
  const totalScreens = jobData?.total_screens || 0;

  return (
    <View className="flex-1 bg-slate-50">
      <BrandingHeader />

      <ScrollView
        className="flex-1 px-6 pt-8 bg-slate-50"
        contentContainerClassName="pb-12"
      >
        {/* Key Info */}
        <View className="bg-white rounded-3xl p-6 mb-6 border border-slate-200">
          <Text className="text-sm text-slate-500 tracking-wider mb-1">JOB ADDRESS</Text>
          <Text className="text-2xl font-semibold text-slate-900">{address}</Text>

          <View className="h-px bg-slate-200 my-5" />

          <View className="flex-row justify-between">
            <View>
              <Text className="text-sm text-slate-500">WALLS</Text>
              <Text className="text-4xl font-bold text-slate-900 mt-1">{wallCount}</Text>
            </View>
            <View>
              <Text className="text-sm text-slate-500">WINDOWS</Text>
              <Text className="text-4xl font-bold text-blue-600 mt-1">{totalWindows}</Text>
            </View>
            <View>
              <Text className="text-sm text-slate-500">SCREENS</Text>
              <Text className="text-4xl font-bold text-emerald-600 mt-1">{totalScreens}</Text>
            </View>
          </View>
        </View>

        {/* Contact & follow-up details (from final step; excludes the Internal 1-5 rating) */}
        {(jobData?.contact_person || jobData?.address_notes || jobData?.phone || jobData?.email || jobData?.how_find || jobData?.mailing_list != null) && (
          <View className="bg-white rounded-3xl p-6 mb-6 border border-slate-200">
            <Text className="text-sm text-slate-500 tracking-wider mb-3">CONTACT &amp; FOLLOW-UP</Text>

            {jobData?.contact_person && (
              <View className="mb-2">
                <Text className="text-xs text-slate-500">CONTACT PERSON</Text>
                <Text className="text-base text-slate-900">{jobData.contact_person}</Text>
              </View>
            )}
            {jobData?.address_notes && (
              <View className="mb-2">
                <Text className="text-xs text-slate-500">ADDRESS NOTES</Text>
                <Text className="text-base text-slate-900">{jobData.address_notes}</Text>
              </View>
            )}
            {jobData?.phone && (
              <View className="mb-2">
                <Text className="text-xs text-slate-500">PHONE</Text>
                <Text className="text-base text-slate-900">{jobData.phone}</Text>
              </View>
            )}
            {jobData?.email && (
              <View className="mb-2">
                <Text className="text-xs text-slate-500">EMAIL</Text>
                <Text className="text-base text-slate-900">{jobData.email}</Text>
              </View>
            )}
            {jobData?.how_find && (
              <View className="mb-2">
                <Text className="text-xs text-slate-500">HOW FOUND</Text>
                <Text className="text-base text-slate-900">{jobData.how_find}</Text>
              </View>
            )}
            {jobData?.mailing_list != null && (
              <View>
                <Text className="text-xs text-slate-500">MAILING LIST</Text>
                <Text className="text-base text-slate-900">{jobData.mailing_list ? "Yes" : "No"}</Text>
              </View>
            )}
          </View>
        )}

        <Text className="text-center text-slate-500 px-8 text-base leading-relaxed">
          All documentation has been saved locally. You can export reports later from the job history.
        </Text>
      </ScrollView>

      <View className="px-6 pb-8 gap-3">
        <BigButton
          variant="primary"
          size="xl"
          onPress={async () => {
            if (!jobData?.id) return;
            try {
              await exportJobToSpreadsheet(jobData.id, db);
            } catch (err) {
              console.error(err);
              alert("Failed to export spreadsheet. Please try again.");
            }
          }}
        >
          Export to Spreadsheet
        </BigButton>

        <BigButton
          variant="secondary"
          size="xl"
          onPress={handleViewPreviousJobs}
        >
          View Previous Jobs
        </BigButton>

        <Pressable onPress={() => router.replace("/clock-in")} className="py-4">
          <Text className="text-center text-blue-600 text-lg font-semibold">
            Return to Home
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
