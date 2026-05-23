import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Platform } from "react-native";

import { GlassIconButton } from "./GlassIconButton";

interface GlassBackButtonProps {
  /** Custom onPress handler. If not provided, navigates back using router.back() */
  onPress?: () => void;
}

/**
 * A glass-effect back button with an arrow icon.
 * Navigates back by default, or calls custom onPress if provided.
 */
export function GlassBackButton({ onPress }: GlassBackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <GlassIconButton
      icon={
        <Ionicons
          name={Platform.OS === "android" ? "arrow-back" : "chevron-back"}
          size={22}
          color="#000000"
        />
      }
      onPress={handleBack}
    />
  );
}
