import React, { useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Button } from "react-native-ui-lib";
import { styles as globalStyles, modalStyles } from "@/app/screens/MainStyles";
import GenericBottomSheet, {
  GenericBottomSheetTextInput,
} from "./GenericBottomSheet";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { colors } from "@/app/theme";
import { useExtractCulturalInsights } from "@/hooks/logic/useVideoCulturalinsight";
import YoutubePlayer from "react-native-youtube-iframe";
import { convertMarkdownToPlainText } from "@/app/helpers/markdown";

interface YouTubeCulturalInsightsModalProps {
  visible: boolean;
  onClose: () => void;
}

const YouTubeCulturalInsightsModal: React.FC<
  YouTubeCulturalInsightsModalProps
> = ({ visible, onClose }) => {
  const { translate, currentLanguage } = useTranslations();
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const [videoId, setVideoId] = useState<string | null>(null);

  const {
    data: culturalInsights,
    isLoading,
    refetch,
  } = useExtractCulturalInsights(youtubeUrl, currentLanguage);

  const onSubmit = (): void => {
    const videoId = extractVideoId(youtubeUrl);
    if (videoId) {
      setVideoId(videoId);
      refetch();
    } else {
      // Handle invalid URL
      console.error("Invalid YouTube URL");
    }
  };

  const extractVideoId = (url: string): string | null => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  return (
    <GenericBottomSheet
      visible={visible}
      onClose={() => {
        onClose();
        setYoutubeUrl("");
        setVideoId(null);
      }}
      enableScroll={true}
      textToSpeak={culturalInsights}
    >
      {!culturalInsights ? (
        <>
          <Text style={modalStyles.modalTitle}>
            {translate("getCulturalContext")}
          </Text>
          {isLoading ? (
            <View style={[globalStyles.loadingContainer, { height: 100 }]}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>
                {translate("analyzingVideo")}
              </Text>
            </View>
          ) : (
            <>
              {videoId && (
                <View style={styles.videoContainer}>
                  <YoutubePlayer height={200} play={false} videoId={videoId} />
                </View>
              )}
              <GenericBottomSheetTextInput
                placeholder={translate("enterYoutubeUrl")}
                value={youtubeUrl}
                onChangeText={setYoutubeUrl}
                keyboardType="url"
                style={[modalStyles.textInput, styles.youtubeInput]}
              />
              <Button
                style={styles.submitButton}
                onPress={onSubmit}
                label={translate("getInsights")}
                backgroundColor={colors.primary}
              />
            </>
          )}
        </>
      ) : (
        <View style={styles.insightsContainer}>
          {videoId && (
            <View style={styles.videoContainer}>
              <YoutubePlayer height={200} play={false} videoId={videoId} />
            </View>
          )}
          <Text style={styles.insightsTitle}>
            {translate("culturalInsights")}
          </Text>
          <Text style={styles.insightsText}>
            {convertMarkdownToPlainText(culturalInsights)}
          </Text>
        </View>
      )}
    </GenericBottomSheet>
  );
};

const styles = StyleSheet.create({
  loadingText: {
    textAlign: "center",
    fontFamily: "marcellus",
    color: colors.primary,
    marginTop: 10,
  },
  submitButton: {
    marginVertical: 8,
    maxWidth: "80%",
    alignSelf: "center",
  },
  insightsContainer: {
    padding: 20,
    alignItems: "center",
  },
  insightsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 10,
  },
  insightsText: {
    fontSize: 16,
    color: colors.dark,
    textAlign: "center",
    marginBottom: 20,
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    color: colors.secondary,
    textAlign: "center",
  },
  youtubeInput: {
    height: 40, // Reduced height for the YouTube URL input
  },
  videoContainer: {
    width: "100%",
    marginBottom: 20,
  },
});

export default YouTubeCulturalInsightsModal;
