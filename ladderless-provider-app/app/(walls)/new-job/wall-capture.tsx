import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Alert, Image, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Camera } from 'lucide-react-native';
import { useJobDraft } from '@/core/jobs/job-draft-context';
import { BigButton } from '@/core/ui-components/BigButton';
import { NumberInput } from '@/core/ui-components/NumberInput';
import { useTheme } from '@/core/theme-context';

type WallCaptureParams = {
  photoUri?: string;
  sectionId?: string;   // for editing existing wall
};

/**
 * WallCaptureScreen
 * 
 * This is the single dedicated "working page" for capturing or editing one wall.
 * 
 * Responsibilities:
 * - Accept an optional photo (from camera or none for fast tally)
 * - Allow user to enter windows + screens counts (photo is optional)
 * - Support editing an existing wall (prefills current values)
 * - Save back to the job draft via addSection or updateSection
 * 
 * This is the one stable place that should be modified if we want to add more fields
 * to wall capture in the future (notes, condition, material, etc.).
 */
export default function WallCaptureScreen() {
  const params = useLocalSearchParams<WallCaptureParams>();
  const { currentJob, addSection, updateSection } = useJobDraft();
  const { isDark } = useTheme();

  const [windows, setWindows] = useState(0);
  const [screens, setScreens] = useState(0);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = !!params.sectionId;
  const hasPhoto = !!params.photoUri;

  // Prefill form when editing an existing wall
  useEffect(() => {
    if (isEditing && params.sectionId && currentJob?.sections) {
      const existing = currentJob.sections.find((s) => s.id === params.sectionId);
      if (existing) {
        setWindows(existing.windows ?? 0);
        setScreens(existing.screens ?? 0);
        setNotes(existing.notes || '');
      }
    }
  }, [isEditing, params.sectionId, currentJob?.sections]);

  /**
   * Save the current wall (new or edit).
   * @param goToFinal - when true, after saving we jump straight to the final/completion step
   *                    instead of going back to the walls list. This gives the user the
   *                    "This is my last wall" option directly from the capture screen.
   */
  const handleSave = async (goToFinal: boolean = false) => {
    if (windows === 0 && screens === 0) {
      Alert.alert('Add Counts', 'Please enter the number of windows or screens.');
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing && params.sectionId) {
        await updateSection(params.sectionId, {
          windows,
          screens,
          notes: notes || null,
        });
      } else {
        await addSection(
          {
            photo_uri: params.photoUri || '', // allow empty photo
            windows,
            screens,
            notes: notes || null,
          },
          params.photoUri || '' // this param is only used for saving photo if new
        );
      }

      if (goToFinal) {
        // User declared this the final wall right here in the capture screen
        router.replace('/new-job/final');
      } else {
        // Always replace back to the walls list page (instead of plain back()).
        // This avoids leaving stale wall-capture instances in the stack when the
        // user went through the camera → wall-capture(replace) path.
        router.replace('/new-job/walls');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not save this wall.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetake = () => {
    // For now, go back to camera. We can improve this later.
    router.replace({
      pathname: '/new-job/camera',
      params: { mode: 'wall' },
    });
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pt-12 pb-10"
        keyboardShouldPersistTaps="handled"
      >
        <Text className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {isEditing ? 'Edit Wall' : 'New Wall'}
        </Text>

        {/* Photo Preview (optional) */}
        {hasPhoto ? (
          <Pressable onPress={() => { /* TODO: open full screen photo viewer */ }} className="mb-6">
            <View className="rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-700">
              <Image
                source={{ uri: params.photoUri }}
                style={{ width: '100%', height: 220 }}
                resizeMode="cover"
              />
            </View>
            <Text className="text-center text-blue-600 mt-2">Tap to view full photo</Text>
          </Pressable>
        ) : (
          <View className="mb-6 items-center py-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl">
            <Camera size={32} color={isDark ? '#64748b' : '#94a3b8'} />
            <Text className={`mt-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              No photo attached
            </Text>
          </View>
        )}

        {hasPhoto && (
          <Pressable onPress={handleRetake} className="mb-6">
            <Text className="text-blue-600 text-center font-medium">Retake Photo</Text>
          </Pressable>
        )}

        {/* Offer to attach a photo when landing directly on capture screen (green button path) */}
        {!hasPhoto && !isEditing && (
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/new-job/camera',
                params: { mode: 'wall' },
              })
            }
            className="mb-6 items-center py-6 border-2 border-dashed border-blue-400 rounded-3xl active:bg-slate-100 dark:active:bg-slate-800"
          >
            <Camera size={28} color={isDark ? '#60a5fa' : '#2563eb'} />
            <Text className="mt-2 text-blue-600 dark:text-blue-400 font-semibold">
              Take Wall Photo (optional)
            </Text>
            <Text className="text-xs text-slate-500 mt-1">Photo can be added later if needed</Text>
          </Pressable>
        )}

        {/* Counts */}
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

        {/* Future: Notes field can go here */}

        <View className="mt-8 gap-3">
          <BigButton
            variant="primary"
            size="xl"
            onPress={() => handleSave(false)}
            disabled={isSaving}
            loading={isSaving}
          >
            {isEditing ? 'Save Changes' : 'Save Wall'}
          </BigButton>

          {/* "This is my last wall" option — only offered when adding a new wall, not when editing.
              This lets the user finish the walls phase directly from the capture screen
              without having to go back to the list first. */}
          {!isEditing && (
            <BigButton
              variant="success"
              size="lg"
              onPress={() => handleSave(true)}
              disabled={isSaving}
              loading={isSaving}
            >
              This is my last wall
            </BigButton>
          )}

          <Pressable onPress={() => router.back()} className="py-4">
            <Text className={`text-center text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
