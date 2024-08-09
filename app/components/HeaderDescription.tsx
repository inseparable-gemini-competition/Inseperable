import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigationAndUser } from "@/hooks";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/app/theme";
import { CustomText } from "@/app/components/CustomText";

interface HeaderDescriptionProps {
  country: string;
  handleFontSettings: () => void;
}

const HeaderDescription: React.FC<HeaderDescriptionProps> = ({
  country,
  handleFontSettings,
}) => {
  const { handleRecommendation, handleResetAndLogout } = useNavigationAndUser();
  return (
    <>
      <View style={styles.container}>
        <CustomText style={styles.title}>{country}</CustomText>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleFontSettings}
          >
            <Ionicons name="text" size={24} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleResetAndLogout}
          >
            <Ionicons name="log-out" size={24} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleRecommendation}
          >
            <Ionicons name="refresh" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    alignSelf: "flex-start",
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    backgroundColor: colors.headerBackground,
    paddingVertical: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 50,
    fontWeight: "bold",
    color: colors.white,
  },
  buttonContainer: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
});

export default HeaderDescription;
