import React, { useState, useCallback } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { Button, ButtonSize, ProgressBar } from "react-native-ui-lib";
import { styles as globalStyles } from "@/app/screens/MainStyles";
import GenericBottomSheet from "./GenericBottomSheet";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { colors } from "@/app/theme";
import { Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { convertMarkdownToPlainText } from "@/app/helpers/markdown";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { httpsCallable } from "firebase/functions";
import { functions, storage } from "../helpers/firebaseConfig";

interface VideoCulturalInsightsModalProps {
  visible: boolean;
  onClose: () => void;
}

const VideoCulturalInsightsModal: React.FC<VideoCulturalInsightsModalProps> = ({
  visible,
  onClose,
}) => {
  const { translate, currentLanguage } = useTranslations();
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [culturalInsights, setCulturalInsights] = useState<string | null>(null);

  const pickVideo = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setVideoUri(result.assets[0].uri);
    }
  }, []);

  const uploadVideo = useCallback(async () => {
    if (!videoUri) return;

    setIsUploading(true);
    try {
      const response = await fetch(videoUri);
      const blob = await response.blob();
      const filename = `videos/${Date.now()}.mp4`;
      const storageRef = ref(storage, filename);

      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          Alert.alert(translate("errorTitle"), translate("uploadFailed"));
          setIsUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("File available at", downloadURL);
          setIsUploading(false);
          analyzeVideo(downloadURL);
        }
      );
    } catch (error) {
      console.error("Error in uploadVideo:", error);
      Alert.alert(translate("errorTitle"), translate("uploadFailed"));
      setIsUploading(false);
    }
  }, [videoUri, translate]);

  const analyzeVideo = useCallback(
    async (videoUrl: string) => {
      setIsAnalyzing(true);
      try {
        const extractCulturalVideoAnalysis = httpsCallable(
          functions,
          "extractCulturalVideoAnalysis"
        );
        const result = await extractCulturalVideoAnalysis({
          videoUrl,
          language: currentLanguage,
        });
        setCulturalInsights(result.data.culturalInsights);
      } catch (error) {
        console.error("Analysis failed:", error);
        Alert.alert(translate("errorTitle"), translate("analysisFailed"));
      } finally {
        setIsAnalyzing(false);
      }
    },
    [currentLanguage, translate]
  );

  const resetState = useCallback(() => {
    setVideoUri(null);
    setUploadProgress(0);
    setCulturalInsights(null);
  }, []);

  return (
    <GenericBottomSheet
      visible={visible}
      onClose={() => {
        onClose();
        resetState();
      }}
      enableScroll={true}
      textToSpeak={culturalInsights || ""}
    >
      {!culturalInsights ? (
        <>
          <Text style={styles.modalTitle}>
            {translate("getCulturalContext")}
          </Text>
          <Text
            style={{
              marginBottom: 20,
              fontFamily: "marcellus",
              textAlign: "center",
            }}
          >
            {translate("weWillAnalyzeYourVideoCulturally")}
          </Text>
          {isUploading || isAnalyzing ? (
            <>
              {isUploading ? (
                <ProgressBar
                  progress={uploadProgress}
                  progressColor={colors.warning}
                  fullWidth
                  style={{ width: "80%", alignSelf: "center" }}
                />
              ) : (
                <ActivityIndicator size={"large"} />
              )}

              <View
                style={[globalStyles.loadingContainer, styles.loadingContainer]}
              >
                <Text style={styles.loadingText}>
                  {isUploading
                    ? `${translate("uploadingVideo")} ${uploadProgress.toFixed(
                        0
                      )}%`
                    : translate("analyzingVideo")}
                </Text>
              </View>
            </>
          ) : (
            <>
              {videoUri && (
                <View style={styles.videoContainer}>
                  <Video
                    source={{ uri: videoUri }}
                    style={styles.video}
                    useNativeControls
                    resizeMode="contain"
                  />
                </View>
              )}
              {!videoUri && (
                <Button
                  size={ButtonSize.large}
                  onPress={pickVideo}
                  borderRadius={8}
                  label={translate("selectVideo")}
                  backgroundColor={colors.black}
                  labelStyle={{
                    color: "white",
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
              )}
              {videoUri && (
                <Button
                  onPress={uploadVideo}
                  label={translate("uploadAndAnalyze")}
                  size={ButtonSize.large}
                  borderRadius={10}
                  backgroundColor={colors.primary}
                  disabled={!videoUri || isUploading}
                  labelStyle={{
                    color: 'white',
                    fontSize: 18,
                    fontWeight: 'normal',
                    fontFamily: "marcellus",
                    textShadowOffset: { width: 0, height: 0.1 },
                    textShadowRadius: 0.1,
                    textShadowColor: 'rgba(0, 0, 0, 0.3)'
                  }}
                  style={{
                    height: 50,
                    borderRadius: 8,
                  }}
                />
              )}
            </>
          )}
        </>
      ) : (
        <View style={styles.insightsContainer}>
          <Text style={styles.insightsTitle}>
            {translate("culturalInsights")}
          </Text>
          <Text style={styles.insightsText}>
            {convertMarkdownToPlainText(culturalInsights)}
          </Text>
          <Button
            onPress={resetState}
            size={ButtonSize.large}
            borderRadius={10}
            label={translate("analyzeAnotherVideo")}
            backgroundColor={colors.black}
            labelStyle={{
              color: "white",
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
    </GenericBottomSheet>
  );
};

const styles = StyleSheet.create({
  modalTitle: {
    fontSize: 24,
    color: colors.primary,
    fontFamily: "marecllus",
    textAlign: "center",
    marginVertical: 20,
  },
  loadingContainer: {
    height: 90,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    textAlign: "center",
    fontFamily: "marcellus",
    color: colors.primary,
    marginTop: 10,
    fontSize: 18,
  },
  button: {
    marginVertical: 10,
    alignSelf: "center",
    borderRadius: 25,
    paddingVertical: 12,
  },
  uploadButton: {
    backgroundColor: colors.primary,
  },
  analyzeButton: {
    backgroundColor: colors.secondary,
  },
  insightsContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 15,
  },
  insightsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 10,
    textAlign: "center",
  },
  insightsText: {
    fontSize: 16,
    color: colors.dark,
    fontFamily: "marcellus",
    textAlign: "center",
    marginBottom: 20,
  },
  videoContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  video: {
    flex: 1,
  },
});

export default VideoCulturalInsightsModal;
