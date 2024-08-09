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
        <Text style={styles.title}>{translate("donationInfo")}</Text>
        <Text
          style={{
            marginVertical: 5,
            fontFamily: "marcellus",
            textAlign: "center",
          }}
        >
          {translate("weWillRecommendADonationEntityToYou")}
        </Text>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              {translate("fetchingDonationInfo")}
            </Text>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            <Text style={styles.name}>{result?.name}</Text>
            <Text style={styles.description}>{result?.description}</Text>
            <Button
              size={ButtonSize.large}
              borderRadius={10}
              onPress={handleOpenLink}
              label={translate("viewInGoogleTranslate")}
              backgroundColor={colors.black}
              labelStyle={{ fontFamily: "marcellus" }}
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
    fontFamily: "marcellus",
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
    fontFamily: "marcellus",
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
    fontFamily: "marcellus",
  },
  description: {
    fontSize: 16,
    color: colors.black,
    fontFamily: "marcellus",
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
