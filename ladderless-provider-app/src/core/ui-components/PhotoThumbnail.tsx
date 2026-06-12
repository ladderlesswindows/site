import React from "react";
import { View, Image, Pressable, Text } from "react-native";
import { X } from "lucide-react-native";

interface PhotoThumbnailProps {
  uri: string;
  onRemove?: () => void;
  size?: number;
  label?: string;
}

export function PhotoThumbnail({ uri, onRemove, size = 96, label }: PhotoThumbnailProps) {
  return (
    <View className="relative" style={{ width: size, height: size }}>
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: 16 }}
        resizeMode="cover"
      />

      {onRemove && (
        <Pressable
          onPress={onRemove}
          className="absolute -top-2 -right-2 bg-red-600 w-8 h-8 rounded-full items-center justify-center border-2 border-white shadow"
          hitSlop={10}
        >
          <X size={16} color="white" />
        </Pressable>
      )}

      {label && (
        <View className="absolute bottom-1 left-1 bg-black/60 px-2 py-0.5 rounded">
          <Text className="text-white text-[10px] font-medium">{label}</Text>
        </View>
      )}
    </View>
  );
}
