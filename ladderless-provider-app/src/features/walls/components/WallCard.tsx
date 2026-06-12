import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { Section } from '@/core/jobs/types';

interface WallCardProps {
  section: Section;
  index: number;
  onPress: () => void;           // For editing
  onDelete?: () => void;
}

export function WallCard({ section, index, onPress, onDelete }: WallCardProps) {
  const hasPhoto = !!section.photo_uri;

  return (
    <Pressable
      onPress={onPress}
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-3 flex-row"
    >
      {/* Thumbnail or placeholder */}
      <View className="w-20 h-20 mr-4 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 items-center justify-center">
        {hasPhoto ? (
          <Image
            source={{ uri: section.photo_uri }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <Text className="text-slate-400 text-xs text-center px-1">
            No Photo
          </Text>
        )}
      </View>

      {/* Info */}
      <View className="flex-1 justify-center">
        <Text className="text-lg font-semibold text-slate-900 dark:text-white">
          Wall {index + 1}
        </Text>
        <Text className="text-base text-slate-600 dark:text-slate-300 mt-1">
          {section.windows} windows • {section.screens} screens
        </Text>
        {section.notes && (
          <Text className="text-sm text-slate-500 dark:text-slate-400 mt-1" numberOfLines={1}>
            {section.notes}
          </Text>
        )}
      </View>

      {/* Optional delete button - can be added later */}
      {onDelete && (
        <Pressable onPress={onDelete} className="justify-center pl-3">
          <Text className="text-red-500 text-sm">Delete</Text>
        </Pressable>
      )}
    </Pressable>
  );
}
