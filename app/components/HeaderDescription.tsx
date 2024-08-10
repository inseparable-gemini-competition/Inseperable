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
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <CustomText 
          style={styles.title}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {country}
        </CustomText>
      </View>
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
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    backgroundColor: colors.headerBackground,
    paddingVertical: 10,
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 50,
    fontWeight: "bold",
    color: colors.white,
  },
  buttonContainer: {
    flexDirection: "row",
    flexShrink: 0,
  },
  iconButton: {
    marginLeft: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
});

export default HeaderDescription;