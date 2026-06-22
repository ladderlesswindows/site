import React, { useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { Camera, Trash2 } from "lucide-react-native";
import { useJobDraft } from "@/core/jobs/job-draft-context";
import { BigButton } from "@/core/ui-components/BigButton";
import { PhotoThumbnail } from "@/core/ui-components/PhotoThumbnail";
import { BrandingHeader } from "@/core/ui-components/BrandingHeader";


const MAX_FINAL_PHOTOS = 4;
const MAX_NOTES_LENGTH = 2000;
const MAX_REVIEW_PREFILL_LENGTH = 500;

export default function FinalStep() {
  const {
    currentJob,
    addFinalPhoto,
    removeFinalPhoto,
    setFinalNotes,
    updateCustomerDetails,
    completeJob,
    setEndTime,
  } = useJobDraft();

  const [notes, setNotes] = useState(currentJob?.final_notes || "");
  const [reviewPrefill, setReviewPrefill] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);

  // New optional customer / contact details (collected before Complete)
  const [contactPerson, setContactPerson] = useState(currentJob?.contact_person || "");
  const [addressNotes, setAddressNotes] = useState(currentJob?.address_notes || "");
  const [phone, setPhone] = useState(currentJob?.phone || "");
  const [email, setEmail] = useState(currentJob?.email || "");
  const [mailingList, setMailingList] = useState<number | null>(currentJob?.mailing_list ?? null);
  const [howFind, setHowFind] = useState(currentJob?.how_find || "");
  const [rating, setRating] = useState<number | null>(currentJob?.customer_rating ?? null);

  const finalPhotos = currentJob?.final_photos || [];
  const photoCount = finalPhotos.length;
  const canAddMore = photoCount < MAX_FINAL_PHOTOS;

  const openCameraForFinalPhoto = () => {
    if (!canAddMore) return;
    router.push("/new-job/camera?mode=final");
  };

  const handleRemovePhoto = async (photoId: string) => {
    Alert.alert("Remove photo?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await removeFinalPhoto(photoId);
          } catch (e) {
            console.error("Failed to remove final photo", e);
          }
        },
      },
    ]);
  };

  const handleNotesChange = (text: string) => {
    if (text.length <= MAX_NOTES_LENGTH) {
      setNotes(text);
    }
  };

  const saveNotes = async () => {
    await setFinalNotes(notes.trim());
  };

  // Save helpers for new details (use null for empty to keep DB clean)
  const saveContactPerson = async () => {
    await updateCustomerDetails({ contact_person: contactPerson.trim() || null });
  };
  const saveAddressNotes = async () => {
    await updateCustomerDetails({ address_notes: addressNotes.trim() || null });
  };
  const savePhone = async () => {
    await updateCustomerDetails({ phone: phone.trim() || null });
  };
  const saveEmail = async () => {
    await updateCustomerDetails({ email: email.trim() || null });
  };
  const saveMailingList = async (val: number | null) => {
    await updateCustomerDetails({ mailing_list: val });
  };
  const saveHowFind = async () => {
    await updateCustomerDetails({ how_find: howFind.trim() || null });
  };
  const saveRating = async (val: number | null) => {
    await updateCustomerDetails({ customer_rating: val });
  };

  const handleCompleteJob = async () => {
    if (isCompleting) return;

    await saveNotes();
    await saveContactPerson();
    await saveAddressNotes();
    await savePhone();
    await saveEmail();
    await saveMailingList(mailingList);
    await saveHowFind();
    await saveRating(rating);

    setIsCompleting(true);
    try {
      // Close both timers (engaged + working) at the same moment for now
      await setEndTime();

      const completedJob = await completeJob();

      // Fire-and-forget — don't block navigation on network
      const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "https://www.ladderlesswindows.com";
      fetch(`${apiUrl}/api/worker/end-gig`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: completedJob.supabase_booking_id ?? null,
          worker_notes: reviewPrefill.trim() || "Gig completed.",
        }),
      }).catch(() => {});

      router.replace({
        pathname: "/new-job/summary",
        params: { jobId: completedJob.id },
      });
    } catch (err) {
      console.error("Failed to complete job:", err);
      Alert.alert("Error", "Could not complete the job. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 px-6 pt-6 bg-slate-50" contentContainerClassName="pb-12">
      <BrandingHeader />
      <Text className="text-2xl font-semibold tracking-tight mb-1 text-slate-900">
        Final Photos &amp; Details
      </Text>
      <Text className="mb-6 text-slate-600">
        Up to {MAX_FINAL_PHOTOS} photos + notes, contact info &amp; records
      </Text>

        {/* Final Photos Section */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-3 px-1">
            <Text className="text-lg font-semibold text-slate-800">
              Final Photos ({photoCount}/{MAX_FINAL_PHOTOS})
            </Text>
            {canAddMore && (
              <Pressable onPress={openCameraForFinalPhoto} className="flex-row items-center">
                <Camera size={20} color="#1e40af" />
                <Text className="text-blue-600 font-semibold ml-1">Add Photo</Text>
              </Pressable>
            )}
          </View>

          {photoCount > 0 ? (
            <View className="flex-row flex-wrap gap-3">
              {finalPhotos.map((photo, index) => (
                <PhotoThumbnail
                  key={photo.id}
                  uri={photo.photo_uri}
                  size={110}
                  label={`#${index + 1}`}
                  onRemove={() => handleRemovePhoto(photo.id)}
                />
              ))}
            </View>
          ) : (
            <Pressable
              onPress={openCameraForFinalPhoto}
              className="border-2 border-dashed border-slate-300 rounded-3xl py-10 items-center active:bg-slate-100"
            >
              <Camera size={32} color="#64748b" />
              <Text className="text-slate-500 mt-3 text-lg">Add final photos</Text>
            </Pressable>
          )}

          {!canAddMore && (
            <Text className="text-xs text-emerald-600 mt-2 px-1">
              Maximum of {MAX_FINAL_PHOTOS} final photos reached.
            </Text>
          )}
        </View>

        {/* How'd it go? Section */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-slate-800 mb-2 px-1">
            How'd it go?
          </Text>
          <TextInput
            value={reviewPrefill}
            onChangeText={(text) => {
              if (text.length <= MAX_REVIEW_PREFILL_LENGTH) setReviewPrefill(text);
            }}
            placeholder="Great job — super friendly customer, dogs were well-behaved, second story had tricky screens but we got them perfect."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={6}
            maxLength={MAX_REVIEW_PREFILL_LENGTH}
            className="bg-white border-2 border-slate-300 rounded-2xl p-4 text-lg text-slate-900 min-h-[112px]"
            textAlignVertical="top"
          />
          <Text className="text-right text-xs text-slate-400 mt-1 pr-1">
            {reviewPrefill.length} / {MAX_REVIEW_PREFILL_LENGTH}
          </Text>
        </View>

        {/* Notes Section */}
        <View>
          <Text className="text-lg font-semibold text-slate-800 mb-2 px-1">
            Final Notes
          </Text>
          <TextInput
            value={notes}
            onChangeText={handleNotesChange}
            onBlur={saveNotes}
            placeholder="Any special notes about the job, damage, customer requests, etc."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={6}
            maxLength={MAX_NOTES_LENGTH}
            className="bg-white border-2 border-slate-300 rounded-2xl p-4 text-lg text-slate-900 min-h-[112px]"
            textAlignVertical="top"
          />
          <Text className="text-right text-xs text-slate-400 mt-1 pr-1">
            {notes.length} / {MAX_NOTES_LENGTH}
          </Text>
        </View>

        {/* New optional fields below final notes (as requested) */}
        <View className="mt-8">
          <Text className="text-lg font-semibold text-slate-800 mb-1 px-1">
            Contact &amp; Follow-up Info
          </Text>
          <Text className="text-sm text-slate-500 mb-4 px-1">Optional — for records and follow-up</Text>

          {/* 1. Contact Person (extra length for sentence) */}
          <View className="mb-4">
            <Text className="text-lg font-semibold text-slate-800 mb-2 px-1">Contact Person</Text>
            <TextInput
              value={contactPerson}
              onChangeText={setContactPerson}
              onBlur={saveContactPerson}
              placeholder="e.g. Jane Smith (office manager)"
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={2}
              className="bg-white border-2 border-slate-300 rounded-2xl p-4 text-lg text-slate-900 min-h-[60px]"
              textAlignVertical="top"
            />
          </View>

          {/* 2. Address notes, e.g. rear building */}
          <View className="mb-4">
            <Text className="text-lg font-semibold text-slate-800 mb-2 px-1">Address Notes</Text>
            <TextInput
              value={addressNotes}
              onChangeText={setAddressNotes}
              onBlur={saveAddressNotes}
              placeholder="e.g. rear building, gate code 1234, park in alley"
              placeholderTextColor="#94a3b8"
              className="bg-white border-2 border-slate-300 rounded-2xl p-4 text-lg text-slate-900"
            />
          </View>

          {/* 3. Phone */}
          <View className="mb-4">
            <Text className="text-lg font-semibold text-slate-800 mb-2 px-1">Phone</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              onBlur={savePhone}
              placeholder="(555) 123-4567"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
              className="bg-white border-2 border-slate-300 rounded-2xl p-4 text-lg text-slate-900"
            />
          </View>

          {/* 4. Email */}
          <View className="mb-4">
            <Text className="text-lg font-semibold text-slate-800 mb-2 px-1">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              onBlur={saveEmail}
              placeholder="name@example.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-white border-2 border-slate-300 rounded-2xl p-4 text-lg text-slate-900"
            />
          </View>

          {/* 5. Mailing list? (yes/no buttons) */}
          <View className="mb-4">
            <Text className="text-lg font-semibold text-slate-800 mb-2 px-1">Mailing List?</Text>
            <View className="flex-row gap-3">
              <Pressable
                onPress={async () => {
                  const v = 1;
                  setMailingList(v);
                  await saveMailingList(v);
                }}
                className={`flex-1 py-3 rounded-2xl border-2 items-center active:opacity-80 ${
                  mailingList === 1 ? "bg-emerald-600 border-emerald-600" : "bg-white border-slate-300"
                }`}
              >
                <Text className={`text-base font-semibold ${mailingList === 1 ? "text-white" : "text-slate-700"}`}>
                  Yes
                </Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  const v = 0;
                  setMailingList(v);
                  await saveMailingList(v);
                }}
                className={`flex-1 py-3 rounded-2xl border-2 items-center active:opacity-80 ${
                  mailingList === 0 ? "bg-red-600 border-red-600" : "bg-white border-slate-300"
                }`}
              >
                <Text className={`text-base font-semibold ${mailingList === 0 ? "text-white" : "text-slate-700"}`}>
                  No
                </Text>
              </Pressable>
            </View>
            <Text className="text-[11px] text-slate-400 mt-1 px-1">Optional — add to mailing list?</Text>
          </View>

          {/* 6. How Find (extra length text entry for sentence) */}
          <View className="mb-4">
            <Text className="text-lg font-semibold text-slate-800 mb-2 px-1">How did you find us?</Text>
            <TextInput
              value={howFind}
              onChangeText={setHowFind}
              onBlur={saveHowFind}
              placeholder="Google, Yelp, referred by neighbor, drove by the sign, etc."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={2}
              className="bg-white border-2 border-slate-300 rounded-2xl p-4 text-lg text-slate-900 min-h-[60px]"
              textAlignVertical="top"
            />
          </View>

          {/* 7. 1-5 rating (labeled "Internal" in UI) */}
          <View className="mb-2">
            <Text className="text-lg font-semibold text-slate-800 mb-1 px-1">Internal</Text>
            <View className="flex-row justify-between px-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <Pressable
                  key={num}
                  onPress={async () => {
                    const v = num;
                    setRating(v);
                    await saveRating(v);
                  }}
                  className={`w-11 h-11 rounded-full border-2 items-center justify-center ${
                    rating === num ? "bg-blue-600 border-blue-700" : "bg-white border-slate-300 active:bg-slate-100"
                  }`}
                >
                  <Text className={`text-xl font-bold tabular-nums ${rating === num ? "text-white" : "text-slate-700"}`}>
                    {num}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Complete Job Button */}
      <View className="px-6 pb-8 pt-4 bg-white border-t border-slate-100">
        <BigButton
          variant="success"
          size="xl"
          onPress={handleCompleteJob}
          disabled={isCompleting}
          loading={isCompleting}
        >
          Mark Job Complete
        </BigButton>
      </View>
    </View>
  );
}
