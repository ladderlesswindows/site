import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Edit2, Trash2 } from "lucide-react-native";
import { Section } from "@/core/jobs/types";

interface SectionCardProps {
  section: Section;
  index: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function SectionCard({ section, index, onEdit, onDelete }: SectionCardProps) {
  return (
    <View className="flex-row bg-white border border-slate-200 rounded-3xl p-4 mb-3">
      {/* Thumbnail */}
      <View className="mr-4">
        <Image
          source={{ uri: section.photo_uri }}
          className="w-20 h-20 rounded-2xl bg-slate-100"
          resizeMode="cover"
        />
      </View>

      {/* Content */}
      <View className="flex-1 justify-center">
        <Text className="text-lg font-semibold text-slate-900">
          Wall / Section {index + 1}
        </Text>
        <Text className="text-base text-slate-700 mt-0.5">
          {section.windows} windows • {section.screens} screens
        </Text>
        {section.notes && (
          <Text className="text-sm text-slate-500 mt-1" numberOfLines={2}>
            {section.notes}
          </Text>
        )}
      </View>

      {/* Actions */}
      <View className="justify-between py-1">
        {onEdit && (
          <Pressable onPress={onEdit} className="p-2" hitSlop={8}>
            <Edit2 size={20} color="#475569" />
          </Pressable>
        )}
        {onDelete && (
          <Pressable onPress={onDelete} className="p-2" hitSlop={8}>
            <Trash2 size={20} color="#dc2626" />
          </Pressable>
        )}
      </View>
    </View>
  );
}
