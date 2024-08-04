import React from "react";
import { ImageBackground, View, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MainLayoutProps } from "../types";
import { styles } from "@/app/screens/MainStyles";
import { useTranslations } from "@/hooks/ui/useTranslations";

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  onResetPress,
  backgroundImage,
}) => {
  const { translate } = useTranslations();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground
        source={{ uri: backgroundImage }}
        style={styles.background}
      >
        <View style={styles.container}>{children}</View>
        <TouchableOpacity style={styles.resetButton} onPress={onResetPress}>
          <Text style={styles.resetButtonText}>{translate("travelAgain")}</Text>
        </TouchableOpacity>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default MainLayout;
