import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "@/app/screens/MainStyles";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { useNavigationAndUser } from "@/hooks";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/app/theme";

interface HeaderDescriptionProps {
  country: string;
}

const HeaderDescription: React.FC<HeaderDescriptionProps> = ({ country }) => {
  const { translate } = useTranslations();
  const { handleRecommendation, handleResetAndLogout } = useNavigationAndUser();
  return (
    <View
      style={{
        paddingHorizontal: 16,
        alignSelf: "flex-start",
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
      }}
    >
      <Text style={styles.title}>{country}</Text>
      <View>
        <TouchableOpacity
          style={[styles.resetButton, { marginRight: 8 }]}
          onPress={handleResetAndLogout}
        >
          <Ionicons name="log-out" size={24} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleRecommendation}
        >
          <Ionicons name="compass" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HeaderDescription;