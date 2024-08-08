import React, { useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Button } from 'react-native-ui-lib';
import { styles as globalStyles, modalStyles } from '@/app/screens/MainStyles';
import GenericBottomSheet from './GenericBottomSheet';
import { useTranslations } from '@/hooks/ui/useTranslations';
import { colors } from '@/app/theme';
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { convertMarkdownToPlainText } from '@/app/helpers/markdown';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import {functions, storage} from '../helpers/firebaseConfig'

interface VideoCulturalInsightsModalProps {
  visible: boolean;
  onClose: () => void;
}

const VideoCulturalInsightsModal: React.FC<VideoCulturalInsightsModalProps> = ({ visible, onClose }) => {
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

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          Alert.alert(translate("errorTitle"), translate("uploadFailed"));
          setIsUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('File available at', downloadURL);
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

  const analyzeVideo = useCallback(async (videoUrl: string) => {
    setIsAnalyzing(true);
    try {
      const extractCulturalVideoAnalysis = httpsCallable(functions, 'extractCulturalVideoAnalysis');
      const result = await extractCulturalVideoAnalysis({ videoUrl, language: currentLanguage });
      setCulturalInsights(result.data.culturalInsights);
    } catch (error) {
      console.error("Analysis failed:", error);
      Alert.alert(translate("errorTitle"), translate("analysisFailed"));
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentLanguage, translate]);

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
      textToSpeak={culturalInsights}
    >
      {!culturalInsights ? (
        <>
          <Text style={modalStyles.modalTitle}>
            {translate("getCulturalContext")}
          </Text>
          {isUploading || isAnalyzing ? (
            <View style={[globalStyles.loadingContainer, { height: 100 }]}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>
                {isUploading ? `${translate("uploadingVideo")} ${uploadProgress.toFixed(0)}%` : translate("analyzingVideo")}
              </Text>
            </View>
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
              <Button
                style={styles.button}
                onPress={pickVideo}
                label={translate("selectVideo")}
                backgroundColor={colors.secondary}
              />
              <Button
                style={styles.button}
                onPress={uploadVideo}
                label={translate("uploadAndAnalyze")}
                backgroundColor={colors.primary}
                disabled={!videoUri || isUploading}
              />
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
            style={styles.button}
            onPress={resetState}
            label={translate("analyzeAnotherVideo")}
            backgroundColor={colors.secondary}
          />
        </View>
      )}
    </GenericBottomSheet>
  );
};

const styles = StyleSheet.create({
  loadingText: {
    textAlign: 'center',
    fontFamily: 'marcellus',
    color: colors.primary,
    marginTop: 10,
  },
  button: {
    marginVertical: 8,
    maxWidth: '80%',
    alignSelf: 'center',
  },
  insightsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  insightsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  insightsText: {
    fontSize: 16,
    color: colors.dark,
    textAlign: 'center',
    marginBottom: 20,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    marginBottom: 20,
  },
  video: {
    flex: 1,
  },
});

export default VideoCulturalInsightsModal;