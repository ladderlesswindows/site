import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, ScrollView, RefreshControl, ActivityIndicator, Alert } from "react-native";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { BigButton, BrandingHeader } from "@/core/ui-components";
import { useTheme } from "@/core/theme-context";
import { exportAllPastJobsToCSV, deleteJobPhotos } from "@/core/jobs";

interface CompletedJob {
  id: string;
  address: string | null;
  completed_at: string | null;
  total_windows: number;
  total_screens: number;
  wall_count: number;
}

export default function PreviousJobs() {
  const db = useSQLiteContext();
  const { isDark, toggleTheme } = useTheme();
  const [jobs, setJobs] = useState<CompletedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadJobs = useCallback(async () => {
    try {
      const rows = await db.getAllAsync<any>(
        `SELECT 
          j.id, 
          j.address, 
          j.completed_at, 
          j.total_windows, 
          j.total_screens,
          (SELECT COUNT(*) FROM sections WHERE job_id = j.id) as wall_count
         FROM jobs j
         WHERE j.status = 'completed'
         ORDER BY j.completed_at DESC`
      );

      const formatted: CompletedJob[] = rows.map((r) => ({
        id: r.id,
        address: r.address,
        completed_at: r.completed_at,
        total_windows: r.total_windows || 0,
        total_screens: r.total_screens || 0,
        wall_count: r.wall_count || 0,
      }));

      setJobs(formatted);
    } catch (err) {
      console.error("Failed to load previous jobs:", err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [db]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const onRefresh = () => {
    setRefreshing(true);
    loadJobs();
  };

  const handleExportAllPastJobs = () => {
    if (jobs.length === 0) return;

    Alert.alert(
      "Export All Past Jobs?",
      `Export ${jobs.length} completed job(s) to a CSV spreadsheet?\n\nThis creates a simple CSV you can open in Excel/Numbers/etc. It does not delete anything yet.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Export CSV",
          onPress: async () => {
            try {
              const filePath = await exportAllPastJobsToCSV(db);

              // After successful export, offer to clear (user's choice)
              Alert.alert(
                "Export successful",
                `CSV saved and shared.\n\nClear all past jobs from the app now? (Your CSV is the permanent record.)`,
                [
                  {
                    text: "Keep in app",
                    style: "cancel",
                    onPress: () => {
                      loadJobs(); // just refresh
                    },
                  },
                  {
                    text: "Clear list",
                    style: "destructive",
                    onPress: async () => {
                      try {
                        const ids = await db.getAllAsync<{ id: string }>(
                          `SELECT id FROM jobs WHERE status = 'completed'`
                        );

                        await db.withTransactionAsync(async () => {
                          await db.runAsync(`DELETE FROM jobs WHERE status = 'completed'`);
                        });

                        for (const { id } of ids) {
                          await deleteJobPhotos(id);
                        }

                        await loadJobs();
                        Alert.alert("Cleared", `${ids.length} job(s) removed from the app.`);
                      } catch (clearErr) {
                        console.error("Clear failed:", clearErr);
                        Alert.alert("Error", "Could not clear some jobs. They may still appear.");
                        loadJobs();
                      }
                    },
                  },
                ]
              );
            } catch (err) {
              console.error("Export failed:", err);
              Alert.alert("Error", "Failed to export CSV. See console for details.");
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <BrandingHeader />

      {/* Quick way to start a new job from history */}
      <Pressable
        onPress={() => router.replace("/clock-in")}
        className="py-3 items-center"
      >
        <Text className="text-center text-blue-600 text-base font-semibold">
          Return to Home
        </Text>
      </Pressable>

      {/* Simple batch export for all past jobs (CSV) */}
      {jobs.length > 0 && (
        <View className="px-6 pt-1 pb-4">
          <BigButton
            variant="primary"
            size="lg"
            onPress={handleExportAllPastJobs}
          >
            Export All Past Jobs to Spreadsheet
          </BigButton>
          <Text className="text-[11px] text-center text-slate-500 mt-1.5 px-3 leading-snug">
            Exports a CSV of all completed jobs. After export you can choose to clear the list.
          </Text>
        </View>
      )}

      {jobs.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8 pb-20">
          <Text className="text-2xl text-slate-700 text-center">No completed jobs yet</Text>
          <Text className="text-slate-500 text-center mt-2">
            Finish a job and it will appear here.
          </Text>
          <View className="mt-8">
            <BigButton onPress={() => router.replace("/clock-in")} variant="primary">
              Return to Home
            </BigButton>
          </View>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pt-4 pb-24"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {jobs.map((job) => (
            <Pressable
              key={job.id}
              onPress={() => router.push(`/previous-jobs/${job.id}`)}
              className="bg-white rounded-3xl p-5 mb-4 border border-slate-200 active:bg-slate-50"
            >
              <Text className="text-xl font-semibold text-slate-900" numberOfLines={1}>
                {job.address || "No address"}
              </Text>

              <Text className="text-sm text-slate-500 mt-1">
                Completed {formatDate(job.completed_at)}
              </Text>

              <View className="flex-row justify-between mt-4 pt-4 border-t border-slate-100">
                <View>
                  <Text className="text-xs text-slate-500">WALLS</Text>
                  <Text className="text-2xl font-bold text-slate-900">{job.wall_count}</Text>
                </View>
                <View>
                  <Text className="text-xs text-slate-500">WINDOWS</Text>
                  <Text className="text-2xl font-bold text-blue-600">{job.total_windows}</Text>
                </View>
                <View>
                  <Text className="text-xs text-slate-500">SCREENS</Text>
                  <Text className="text-2xl font-bold text-emerald-600">{job.total_screens}</Text>
                </View>
              </View>

              <Text className="text-blue-600 text-sm font-medium mt-4">View details →</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <View className={`absolute bottom-0 left-0 right-0 p-4 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'} border-t`}>
        <BigButton onPress={() => router.push('/schedule')} variant="secondary">
          View Schedule
        </BigButton>
      </View>
    </View>
  );
}
