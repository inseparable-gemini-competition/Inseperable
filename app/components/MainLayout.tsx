import React from "react";
import { ImageBackground, View} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MainLayoutProps } from "../types";
import { styles } from "@/app/screens/MainStyles";
import { useTranslations } from "@/hooks/ui/useTranslations";

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  backgroundImage,
}) => {

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground
        source={{ uri: backgroundImage }}
        style={styles.background}
      >
        <View style={styles.container}>{children}</View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default MainLayout;
