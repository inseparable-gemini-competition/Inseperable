import React from "react";
import { ImageBackground, View, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MainLayoutProps } from "../types";
import { styles } from "@/app/screens/MainStyles";
import { translate } from "@/app/helpers/i18n";

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  onResetPress,
  backgroundImage,
}) => (
  <SafeAreaView style={{ flex: 1 }}>
    <ImageBackground
      source={{ uri: backgroundImage }}
      style={styles.background}
    >
      <View style={styles.container}>{children}</View>
      <TouchableOpacity style={styles.resetButton} onPress={onResetPress}>
        <Text style={styles.resetButtonText}>{translate("survey")}</Text>
      </TouchableOpacity>
    </ImageBackground>
  </SafeAreaView>
);

export default MainLayout;
