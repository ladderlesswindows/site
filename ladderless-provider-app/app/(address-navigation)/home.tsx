import { router } from "expo-router";
import { View, Text, Pressable, TextInput, Linking, Alert, Keyboard, TouchableWithoutFeedback } from "react-native";
import { useState } from "react";
import { useJobDraft } from "@/core/jobs/job-draft-context";
import { useClockOut, useResetGig } from "@/features/time-tracking";
import * as Location from "expo-location";
import { Sun, Moon } from "lucide-react-native";
import { useTheme } from "@/core/theme-context";
import { useSQLiteContext } from "expo-sqlite";
import { BrandingHeader } from "@/core/ui-components/BrandingHeader";

export default function Home() {
  const { createDraft, updateJobMeta, currentJob } = useJobDraft();
  const { resetGig } = useResetGig();
  const { clockOut } = useClockOut();
  const { isDark } = useTheme();
  const db = useSQLiteContext();

  // Split address fields for cleaner spreadsheet data
  const [street, setStreet] = useState("");
  const [cityStateZip, setCityStateZip] = useState("");
  const [miles, setMiles] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  const fullAddress = [street.trim(), cityStateZip.trim()].filter(Boolean).join(", ");
  const canStart = fullAddress.length > 0;

  // Free "autocomplete" - Use Current Location (device native reverse geocoding, no API cost)
  const handleUseCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Location access is required to use this feature.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const geo = await Location.reverseGeocodeAsync(loc.coords);

      if (geo.length > 0) {
        const g = geo[0];
        const streetPart = [g.streetNumber, g.street].filter(Boolean).join(" ");
        const cityPart = [g.city, g.region, g.postalCode].filter(Boolean).join(", ");

        if (streetPart) setStreet(streetPart);
        if (cityPart) setCityStateZip(cityPart);
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Location error", "Could not get your current location.");
    }
  };

  const handleNavigate = () => {
    if (!fullAddress) return;
    const url = `https://maps.apple.com/?address=${encodeURIComponent(fullAddress)}`;
    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`)
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className={`flex-1 px-6 pt-12 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        {/* Branding Banner */}
        <BrandingHeader />

        {/* Action buttons - above address for better UX */}
        <View className="flex-row gap-4 mb-6">
        {/* Continue - goes to walls to Begin Gig */}
        <Pressable
          onPress={async () => {
            if (!canStart || isStarting) return;
            setIsStarting(true);
            try {
              const jobId = await createDraft({ address: fullAddress });

              // Ensure address is saved (handles case where draft was pre-created on Clock In page)
              if (fullAddress) {
                await updateJobMeta({ address: fullAddress });
              }

              const milesNum = parseFloat(miles) || 0;

              // Save miles to the job
              if (milesNum > 0) {
                await db.runAsync(
                  `UPDATE jobs SET miles_driven = ? WHERE id = ?`,
                  [milesNum, jobId]
                );
              }

              router.push("/new-job/walls");
            } catch (err) {
              console.error(err);
            } finally {
              setIsStarting(false);
            }
          }}
          disabled={!canStart || isStarting}
          className="flex-1 bg-blue-600 active:bg-blue-700 rounded-3xl py-5 items-center"
          style={{ opacity: canStart && !isStarting ? 1 : 0.5 }}
        >
          <Text className="text-white text-xl font-semibold">Continue</Text>
        </Pressable>

        {/* Navigate */}
        <Pressable
          onPress={handleNavigate}
          disabled={!canStart}
          className="flex-1 bg-emerald-600 active:bg-emerald-700 rounded-3xl py-5 items-center"
          style={{ opacity: canStart ? 1 : 0.5 }}
        >
          <Text className="text-white text-xl font-semibold">Navigate</Text>
        </Pressable>
      </View>

      {/* Miles Tracking - moved above address per request */}
      <View className="mb-6">
        <Text className={`text-lg font-semibold mb-2 px-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
          Miles Driven
        </Text>
        <TextInput
          value={miles}
          onChangeText={setMiles}
          placeholder="0"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          className={`border-2 rounded-2xl px-5 py-3 text-xl ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
        />
        <Text className={`text-xs mt-1.5 px-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Enter miles driven total for this gig for taxes spreadsheet
        </Text>
      </View>

      {/* Address Input - Required for spreadsheet naming */}
      <View className="mb-6">
        <Text className={`text-lg font-semibold mb-2 px-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
          Job Address <Text className="text-red-500">*</Text>
        </Text>

        <TextInput
          value={street}
          onChangeText={setStreet}
          placeholder="123 Main Street"
          placeholderTextColor="#94a3b8"
          className={`border-2 rounded-2xl px-5 py-3 text-xl mb-3 ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
        />

        <View className="flex-row items-center gap-2">
          <TextInput
            value={cityStateZip}
            onChangeText={setCityStateZip}
            placeholder="City, State, ZIP"
            placeholderTextColor="#94a3b8"
            className={`flex-1 border-2 rounded-2xl px-5 py-3 text-xl ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            autoCapitalize="words"
            autoCorrect={false}
          />
          <Pressable
            onPress={handleUseCurrentLocation}
            className="bg-slate-200 active:bg-slate-300 rounded-2xl px-4 py-4"
          >
            <Text className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Use Location</Text>
          </Pressable>
        </View>

        <Text className={`text-xs mt-1.5 px-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Free location lookup • Used for spreadsheet + navigation
        </Text>
      </View>

      {/* View Past Jobs */}
      <Pressable
        className="bg-white border-2 border-slate-300 active:bg-slate-100 rounded-3xl py-5 items-center mb-4"
        onPress={() => router.push("/previous-jobs")}
      >
        <Text className="text-slate-800 text-xl font-medium">View Past Jobs</Text>
      </Pressable>

      {/* Reset Gig - destructive action */}
      <Pressable
        className="items-center py-3 mb-2"
        onPress={() => {
          Alert.alert(
            "Reset Gig?",
            "Are you sure? This will delete any photos and data and bring you back to Begin Gig.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Reset",
                style: "destructive",
                onPress: async () => {
                  await resetGig();
                  router.replace("/home");
                },
              },
            ]
          );
        }}
      >
        <Text className="text-red-600 text-base font-medium">Reset Gig</Text>
      </Pressable>

      {/* Clock Out - ends shift + resets gig */}
      <Pressable
        className="items-center py-3 mb-2"
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
                  try {
                    await clockOut();           // Ends shift timer + resets gig data
                    router.replace("/clock-in");
                  } catch (err) {
                    console.error("Clock out failed:", err);
                  }
                },
              },
            ]
          );
        }}
      >
        <Text className="text-red-600 text-base font-medium">Clock Out</Text>
      </Pressable>

      {/* Debug info */}
      <View className="mt-auto pb-8">
        <Text className={`text-center text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Expo SDK 54 • NativeWind v5 • SQLite ready
        </Text>
        <Text className={`text-center text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Glove-friendly design in progress
        </Text>
      </View>

      </View>
    </TouchableWithoutFeedback>
  );
}
