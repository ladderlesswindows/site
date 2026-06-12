import React from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Minus, Plus } from "lucide-react-native";

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  helpText?: string;
}

export function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max = 999,
  helpText,
}: NumberInputProps) {
  const changeBy = (delta: number) => {
    const next = Math.max(min, Math.min(max, value + delta));
    onChange(next);
  };

  const handleTextChange = (text: string) => {
    const num = parseInt(text.replace(/[^0-9]/g, ""), 10);
    if (isNaN(num)) {
      onChange(min);
    } else {
      onChange(Math.max(min, Math.min(max, num)));
    }
  };

  return (
    <View className="mb-6">
      <Text className="text-lg font-semibold text-slate-800 mb-2 px-1">{label}</Text>

      <View className="flex-row items-center gap-3">
        {/* Big minus button */}
        <Pressable
          onPress={() => changeBy(-1)}
          className="bg-slate-200 active:bg-slate-300 w-14 h-14 rounded-2xl items-center justify-center"
          hitSlop={12}
        >
          <Minus size={26} color="#334155" />
        </Pressable>

        {/* Large number input */}
        <View className="flex-1 bg-white border-2 border-slate-300 rounded-2xl px-6 py-2">
          <TextInput
            value={String(value)}
            onChangeText={handleTextChange}
            keyboardType="numeric"
            style={styles.input}
            selectTextOnFocus
          />
        </View>

        {/* Big plus button */}
        <Pressable
          onPress={() => changeBy(1)}
          className="bg-slate-200 active:bg-slate-300 w-14 h-14 rounded-2xl items-center justify-center"
          hitSlop={12}
        >
          <Plus size={26} color="#334155" />
        </Pressable>
      </View>

      {helpText && (
        <Text className="text-sm text-slate-500 mt-1.5 px-1">{helpText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    textAlign: "center",
    fontSize: 36,
    fontWeight: "700",
    color: "#0f172a",
  },
});
