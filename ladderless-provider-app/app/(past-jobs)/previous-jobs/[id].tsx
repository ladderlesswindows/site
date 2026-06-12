import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { PhotoThumbnail } from "@/core/ui-components/PhotoThumbnail";

interface JobDetail {
  id: string;
  address: string | null;
  completed_at: string | null;
  engaged_start: string | null;
  work_start: string | null;
  end_time: string | null;
  total_windows: number;
  total_screens: number;
  final_notes: string | null;
  before_clean_photo_uri: string | null;
  after_clean_photo_uri: string | null;
  miles_driven: number;
  safety_checks: string | null;
  // New fields
  contact_person: string | null;
  address_notes: string | null;
  phone: string | null;
  email: string | null;
  mailing_list: number | null;
  how_find: string | null;
  customer_rating: number | null;
}

interface Wall {
  id: string;
  sort_order: number;
  windows: number;
  screens: number;
  photo_uri: string;
}

interface FinalPhoto {
  id: string;
  sort_order: number;
  photo_uri: string;
}

export default function JobDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();

  const [job, setJob] = useState<JobDetail | null>(null);
  const [walls, setWalls] = useState<Wall[]>([]);
  const [finalPhotos, setFinalPhotos] = useState<FinalPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadJob = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const jobRow = await db.getFirstAsync<any>(
          `SELECT * FROM jobs WHERE id = ?`,
          [id]
        );

        if (!jobRow) {
          setJob(null);
          return;
        }

        const wallsRows = await db.getAllAsync<any>(
          `SELECT * FROM sections WHERE job_id = ? ORDER BY sort_order`,
          [id]
        );

        const finalRows = await db.getAllAsync<any>(
          `SELECT * FROM final_photos WHERE job_id = ? ORDER BY sort_order`,
          [id]
        );

        setJob({
          id: jobRow.id,
          address: jobRow.address,
          completed_at: jobRow.completed_at,
          engaged_start: jobRow.engaged_start,
          work_start: jobRow.work_start,
          end_time: jobRow.end_time,
          total_windows: jobRow.total_windows || 0,
          total_screens: jobRow.total_screens || 0,
          final_notes: jobRow.final_notes,
          before_clean_photo_uri: jobRow.before_clean_photo_uri,
          after_clean_photo_uri: jobRow.after_clean_photo_uri,
          miles_driven: jobRow.miles_driven || 0,
          safety_checks: jobRow.safety_checks,
          contact_person: jobRow.contact_person,
          address_notes: jobRow.address_notes,
          phone: jobRow.phone,
          email: jobRow.email,
          mailing_list: jobRow.mailing_list ?? null,
          how_find: jobRow.how_find,
          customer_rating: jobRow.customer_rating ?? null,
        });

        setWalls(wallsRows);
        setFinalPhotos(finalRows);
      } catch (err) {
        console.error("Failed to load job detail:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [db, id]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString();
  };

  const calcDuration = (start: string | null, end: string | null) => {
    if (!start || !end) return "—";
    const diff = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
    return `${diff} min`;
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  if (!job) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center px-6">
        <Text className="text-xl text-slate-600">Job not found</Text>
        <Pressable onPress={() => router.back()} className="mt-6">
          <Text className="text-blue-600 text-lg">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const wallCount = walls.length;

  return (
    <ScrollView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="px-6 pt-8 pb-4 bg-white border-b border-slate-100">
        <Text className="text-3xl font-bold text-slate-900 tracking-tight" numberOfLines={1}>
          {job.address || "No address"}
        </Text>
        <Text className="text-slate-500 mt-1">
          Completed {formatDate(job.completed_at)}
        </Text>
      </View>

      {/* Time & Summary */}
      <View className="px-6 pt-6">
        <View className="bg-white rounded-3xl p-5 border border-slate-200 mb-6">
          <Text className="text-sm font-semibold text-slate-500 tracking-wider mb-3">TIME TRACKING</Text>

          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-slate-600">Clock In</Text>
              <Text className="text-slate-900 font-medium text-right">{formatDate(job.engaged_start)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-slate-600">Begin Gig</Text>
              <Text className="text-slate-900 font-medium text-right">{formatDate(job.work_start)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-slate-600">Completed</Text>
              <Text className="text-slate-900 font-medium text-right">{formatDate(job.end_time)}</Text>
            </View>

            <View className="h-px bg-slate-200 my-2" />

            <View className="flex-row justify-between">
              <Text className="text-slate-600 font-medium">Engaged Time</Text>
              <Text className="text-blue-600 font-bold">{calcDuration(job.engaged_start, job.end_time)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-slate-600 font-medium">Working Time</Text>
              <Text className="text-emerald-600 font-bold">{calcDuration(job.work_start, job.end_time)}</Text>
            </View>
          </View>
        </View>

        {/* Safety Action Plan */}
        {job.safety_checks != null && (
          <View className="bg-white rounded-3xl p-5 border border-slate-200 mb-6">
            <Text className="text-sm font-semibold text-slate-500 tracking-wider mb-3">SAFETY ACTION PLAN</Text>
            <View className="flex-row flex-wrap gap-2">
              {(() => {
                try {
                  const checks = JSON.parse(job.safety_checks);
                  if (Array.isArray(checks) && checks.length > 0) {
                    return checks.map((check: string, i: number) => (
                      <View key={i} className="bg-emerald-100 px-3 py-1 rounded-full">
                        <Text className="text-emerald-700 text-sm font-medium">{check}</Text>
                      </View>
                    ));
                  }
                  return <Text className="text-slate-500 italic">None selected</Text>;
                } catch {
                  return <Text className="text-slate-600">{job.safety_checks}</Text>;
                }
              })()}
            </View>
          </View>
        )}

        {/* Totals */}
        <View className="bg-white rounded-3xl p-5 border border-slate-200 mb-6">
          <Text className="text-sm font-semibold text-slate-500 tracking-wider mb-4">TOTALS</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-3xl font-bold text-slate-900">{wallCount}</Text>
              <Text className="text-xs text-slate-500 mt-1 tracking-wider">WALLS</Text>
            </View>
            <View className="items-center">
              <Text className="text-3xl font-bold text-blue-600">{job.total_windows}</Text>
              <Text className="text-xs text-slate-500 mt-1 tracking-wider">WINDOWS</Text>
            </View>
            <View className="items-center">
              <Text className="text-3xl font-bold text-emerald-600">{job.total_screens}</Text>
              <Text className="text-xs text-slate-500 mt-1 tracking-wider">SCREENS</Text>
            </View>
            <View className="items-center">
              <Text className="text-3xl font-bold text-amber-600">{job.miles_driven}</Text>
              <Text className="text-xs text-slate-500 mt-1 tracking-wider">MILES</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {job.final_notes && (
          <View className="bg-white rounded-3xl p-5 border border-slate-200 mb-6">
            <Text className="text-sm font-semibold text-slate-500 tracking-wider mb-2">NOTES</Text>
            <Text className="text-slate-700 leading-relaxed">{job.final_notes}</Text>
          </View>
        )}

        {/* Contact & Follow-up (new optional fields, including rating) */}
        {(job.contact_person || job.address_notes || job.phone || job.email || job.how_find || job.mailing_list != null || job.customer_rating != null) && (
          <View className="bg-white rounded-3xl p-5 border border-slate-200 mb-6">
            <Text className="text-sm font-semibold text-slate-500 tracking-wider mb-3">CONTACT &amp; FOLLOW-UP</Text>

            {job.contact_person && (
              <View className="flex-row justify-between mb-1">
                <Text className="text-slate-600">Contact</Text>
                <Text className="text-slate-900 font-medium text-right flex-1 ml-2" numberOfLines={2}>{job.contact_person}</Text>
              </View>
            )}
            {job.address_notes && (
              <View className="flex-row justify-between mb-1">
                <Text className="text-slate-600">Address Notes</Text>
                <Text className="text-slate-900 font-medium text-right flex-1 ml-2" numberOfLines={2}>{job.address_notes}</Text>
              </View>
            )}
            {job.phone && (
              <View className="flex-row justify-between mb-1">
                <Text className="text-slate-600">Phone</Text>
                <Text className="text-slate-900 font-medium text-right flex-1 ml-2">{job.phone}</Text>
              </View>
            )}
            {job.email && (
              <View className="flex-row justify-between mb-1">
                <Text className="text-slate-600">Email</Text>
                <Text className="text-slate-900 font-medium text-right flex-1 ml-2">{job.email}</Text>
              </View>
            )}
            {job.how_find && (
              <View className="flex-row justify-between mb-1">
                <Text className="text-slate-600">How Found</Text>
                <Text className="text-slate-900 font-medium text-right flex-1 ml-2" numberOfLines={2}>{job.how_find}</Text>
              </View>
            )}
            {job.mailing_list != null && (
              <View className="flex-row justify-between mb-1">
                <Text className="text-slate-600">Mailing List</Text>
                <Text className="text-slate-900 font-medium text-right flex-1 ml-2">{job.mailing_list ? "Yes" : "No"}</Text>
              </View>
            )}
            {job.customer_rating != null && (
              <View className="flex-row justify-between">
                <Text className="text-slate-600">Internal</Text>
                <Text className="text-slate-900 font-medium text-right flex-1 ml-2">{job.customer_rating}/5</Text>
              </View>
            )}
          </View>
        )}

        {/* Walls with thumbnails */}
        <View className="mb-8">
          <Text className="text-sm font-semibold text-slate-500 tracking-wider mb-3 px-1">WALLS ({wallCount})</Text>
          {walls.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-4">
              {walls.map((wall, index) => (
                <View key={wall.id} className="bg-white rounded-3xl p-3 border border-slate-200 w-40">
                  <PhotoThumbnail uri={wall.photo_uri} size={130} label={`#${index + 1}`} />
                  <View className="mt-3">
                    <Text className="text-base font-semibold text-slate-900">Wall {index + 1}</Text>
                    <Text className="text-sm text-slate-600 mt-0.5">
                      {wall.windows} windows • {wall.screens} screens
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text className="text-slate-500 px-1">No walls recorded.</Text>
          )}
        </View>

        {/* Before Clean Photo */}
        {job.before_clean_photo_uri && (
          <View className="mb-8">
            <Text className="text-sm font-semibold text-slate-500 tracking-wider mb-3 px-1">SCREENS BEFORE CLEANING</Text>
            <View className="bg-white rounded-3xl p-3 border border-slate-200">
              <PhotoThumbnail uri={job.before_clean_photo_uri} size={200} />
            </View>
          </View>
        )}

        {/* After Clean Photo (Screens pile after cleaning) */}
        {job.after_clean_photo_uri && (
          <View className="mb-8">
            <Text className="text-sm font-semibold text-slate-500 tracking-wider mb-3 px-1">SCREENS AFTER CLEANING</Text>
            <View className="bg-white rounded-3xl p-3 border border-slate-200">
              <PhotoThumbnail uri={job.after_clean_photo_uri} size={200} />
            </View>
          </View>
        )}

        {/* Final Photos */}
        <View className="mb-10">
          <Text className="text-sm font-semibold text-slate-500 tracking-wider mb-3 px-1">
            FINAL PHOTOS ({finalPhotos.length})
          </Text>
          {finalPhotos.length > 0 ? (
            <View className="flex-row flex-wrap gap-3">
              {finalPhotos.map((photo, index) => (
                <PhotoThumbnail
                  key={photo.id}
                  uri={photo.photo_uri}
                  size={100}
                  label={`#${index + 1}`}
                />
              ))}
            </View>
          ) : (
            <Text className="text-slate-500 px-1">No final photos.</Text>
          )}
        </View>
      </View>

      <View className="h-12" />

      {/* Return to start a new job */}
      <View className="px-6 pb-8">
        <Pressable onPress={() => router.replace("/clock-in")} className="py-4">
          <Text className="text-center text-blue-600 text-lg font-semibold">
            Return to Home
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
