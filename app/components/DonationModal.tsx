import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Linking,
  StyleSheet,
} from "react-native";
import { Button, ButtonSize } from "react-native-ui-lib";
import GenericBottomSheet from "./GenericBottomSheet";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { colors } from "@/app/theme";
import { CustomText } from "@/app/components/CustomText";

interface DonationModalProps {
  visible: boolean;
  isLoading: boolean;
  result: {
    name: string;
    description: string;
    websiteLink: string;
  } | null;
  onClose: () => void;
  userLanguage: string;
}

const DonationModal: React.FC<DonationModalProps> = ({
  visible,
  isLoading,
  result,
  onClose,
  userLanguage,
}) => {
  const { translate } = useTranslations();

  const handleOpenLink = () => {
    if (result?.websiteLink) {
      const url = `https://translate.google.com/translate?sl=auto&tl=${userLanguage}&u=${encodeURIComponent(
        result.websiteLink
      )}`;
      Linking.openURL(url).catch((err) =>
        console.error("Couldn't load page", err)
      );
    }
  };

  return (
    <GenericBottomSheet
      visible={visible}
      onClose={onClose}
      enableScroll
      textToSpeak={result?.description}
    >
      <View style={styles.container}>
        <CustomText style={styles.title}>{translate("donationInfo")}</CustomText>
        <CustomText
          style={{
            marginVertical: 5,
            textAlign: "center",
          }}
        >
          {translate("weWillRecommendADonationEntityToYou")}
        </CustomText>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <CustomText style={styles.loadingText}>
              {translate("fetchingDonationInfo")}
            </CustomText>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            <CustomText style={styles.name}>{result?.name}</CustomText>
            <CustomText style={styles.description}>{result?.description}</CustomText>
            <Button
              size={ButtonSize.large}
              borderRadius={10}
              onPress={handleOpenLink}
              label={translate("viewInGoogleTranslate")}
              backgroundColor={colors.black}
              labelStyle={{
                color: colors.white,
                fontSize: 18,
                fontWeight: "normal",
                fontFamily: "marcellus",
                textShadowOffset: { width: 0, height: 0.1 },
                textShadowRadius: 0.1,
                textShadowColor: "rgba(0, 0, 0, 0.3)",
              }}
              style={{
                height: 50,
                borderRadius: 8,
              }}
            />
          </View>
        )}
      </View>
    </GenericBottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.black,
    textAlign: "center",
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: colors.black,
    textAlign: "center",
  },
  contentContainer: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 20,
  },
  name: {
    fontSize: 18,
    color: colors.black,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: colors.black,
    marginBottom: 20,
  },
  button: {
    marginVertical: 8,
    maxWidth: "80%",
    alignSelf: "center",
    backgroundColor: colors.primary,
  },
});

export default DonationModal;
