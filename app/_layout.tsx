// RootLayout.tsx
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import useStore from "./store";
import { translations as initialTranslations } from "@/app/helpers/translations";
import { TextToSpeechProvider } from "@/app/context/TextToSpeechContext";
import { FontProvider } from "@/app/context/fontContext";


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    marcellus: require("../assets/fonts/Marcellus-Regular.ttf"),
    OpenDyslexic: require("../assets/fonts/OpenDyslexic-Regular.otf"),
    'OpenDyslexic-Bold': require("../assets/fonts/OpenDyslexic-Bold.otf"),
  });
  const { setTranslations } = useStore();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    // Initialize translations
    setTranslations(initialTranslations);
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FontProvider>
        <TextToSpeechProvider>
            <Stack>
              <Stack.Screen name="(main)" options={{ headerShown: false }} />
            </Stack>
        </TextToSpeechProvider>
      </FontProvider>
    </GestureHandlerRootView>
  );
}
