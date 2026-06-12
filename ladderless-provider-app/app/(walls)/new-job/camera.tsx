import React, { useRef, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { CameraView, CameraType, useCameraPermissions, CameraCapturedPicture } from "expo-camera";
import { X, RotateCw, Zap, ZapOff } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useJobDraft } from "@/core/jobs/job-draft-context";
import { BigButton } from "@/core/ui-components/BigButton";

export default function CameraCapture() {
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<"off" | "on">("off");
  const [isCapturing, setIsCapturing] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const {
    setPendingWallPhoto,
    setBeforeCleanPhoto,
    setAfterCleanPhoto,
    addFinalPhoto,
  } = useJobDraft();

  if (!permission) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-8">
        <Text className="text-white text-2xl font-semibold text-center mb-6">
          Camera Access Needed
        </Text>
        <Text className="text-slate-300 text-lg text-center mb-10">
          Ladderless Provider needs your camera to document windows and screens for each wall.
        </Text>
        <BigButton onPress={requestPermission} variant="primary" size="xl">
          Grant Camera Permission
        </BigButton>
        <Pressable onPress={() => router.back()} className="mt-6">
          <Text className="text-slate-400 text-lg">Cancel</Text>
        </Pressable>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleFlash = () => {
    setFlash((current) => (current === "off" ? "on" : "off"));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const photo: CameraCapturedPicture = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });

      if (photo?.uri) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        if (mode === "before-screens") {
          await setBeforeCleanPhoto(photo.uri);
          router.replace("/new-job/screens-after");
        } else if (mode === "after-screens") {
          await setAfterCleanPhoto(photo.uri);
          // Use explicit replace instead of back() to avoid stack history issues
          // after crossing between the (walls) and (screens) route groups.
          router.replace("/new-job/screens-after");
        } else if (mode === "final") {
          await addFinalPhoto(photo.uri);
          router.back(); // Return to the calling screen (can add more for final)
        } else {
          // New architecture: go to dedicated WallCaptureScreen with the photo
          router.replace({
            pathname: "/new-job/wall-capture",
            params: { photoUri: photo.uri },
          });
        }
      }
    } catch (error) {
      console.error("Failed to take picture:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
        flash={flash}
        active={true}
        onCameraReady={() => {}}
      />

      {/* Top controls */}
      <View className="absolute top-14 left-0 right-0 flex-row justify-between px-6 z-10">
        <Pressable
          onPress={() => router.back()}
          className="bg-black/60 w-12 h-12 rounded-full items-center justify-center"
          hitSlop={16}
        >
          <X size={24} color="#fff" />
        </Pressable>

        <View className="flex-row gap-3">
          <Pressable
            onPress={toggleFlash}
            className="bg-black/60 w-12 h-12 rounded-full items-center justify-center"
            hitSlop={16}
          >
            {flash === "on" ? <Zap size={22} color="#fff" /> : <ZapOff size={22} color="#fff" />}
          </Pressable>
          <Pressable
            onPress={toggleCameraFacing}
            className="bg-black/60 w-12 h-12 rounded-full items-center justify-center"
            hitSlop={16}
          >
            <RotateCw size={22} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* Large capture button - glove friendly */}
      <View className="absolute bottom-12 left-0 right-0 items-center z-10">
        <Pressable
          onPress={takePicture}
          disabled={isCapturing}
          className="w-20 h-20 rounded-full border-[6px] border-white items-center justify-center bg-black/30 active:opacity-80"
          style={{ opacity: isCapturing ? 0.6 : 1 }}
        >
          {isCapturing ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <View className="w-14 h-14 rounded-full bg-white" />
          )}
        </Pressable>
        <Text className="text-white/70 text-sm mt-3 tracking-widest">TAP TO CAPTURE</Text>
      </View>
    </View>
  );
}
