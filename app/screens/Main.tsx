import React from "react";
import {
  View,
  ImageBackground,
  Image,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { useMain } from "@/hooks/ui/useMain";
import { Button, Dialog, PanningProvider } from "react-native-ui-lib";
import { translate } from "@/app/helpers/i18n";
import { styles } from "./MainStyles";
import { categories } from "@/app/helpers/categories";
import CameraView from "@/app/components/CameraView";
import VoiceRecognitionModal from "@/app/components/VoiceRecognitionModal";
import DonationModal from "@/app/components/DonationModal";
import CategoryList from "@/app/components/CategoryList";
import HeaderDescription from "@/app/components/HeaderDescription";
import TabooModal from "@/app/components/TabooModal"; // Import TabooModal
import { SafeAreaView } from "react-native-safe-area-context";
import TipsModal from "@/app/components/tipModal";
import WhatToSayModal from "@/app/components/WhatToSayModal";
import { LongPressGestureHandler } from "react-native-gesture-handler";

const Main = () => {
  const {
    showCamera,
    voiceCountdown,
    capturedImage,
    listening,
    setCapturedImage,
    countdown,
    cameraRef,
    handleManualCapture,
    animatedStyle,
    cameraAnimatedStyle,
    handleCommand,
    handleCancelCountdown,
    isLoadingFromGemini,
    feedbackText,
    handleCleanup,
    stopSpeech,
    onVoiceRecognitionClosed,
    facing,
    isDonationLoading,
    donationResult,
    permission,
    requestPermission,
    donationModalVisible,
    setDonationModalVisible,
    command,
    handleLongPress,
    dismissFeedback,
    userData,
    handleResetAndLogout,
    tabooModalVisible,
    setTabooModalVisible,
    whatToSayModalVisible,
    setWhatToSayModalVisible,
    handleSituationSubmit,
    userSituation,
    setUserSituation,
    resetGeneratedText,
    tipsModalVisible,
    setTipsModalVisible,
    handleSelectTipType,
  } = useMain();

  if (showCamera && !permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>{translate("permissionText")}</Text>
        <Button
          onPress={requestPermission}
          label={translate("grantPermission")}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LongPressGestureHandler
        onHandlerStateChange={handleLongPress}
        minDurationMs={500}
      >
        <View style={{ flex: 1 }}>
          <ImageBackground
            source={{
              uri: userData?.mostFamousLandmark,
            }}
            style={styles.background}
          >
            {!(showCamera || capturedImage) && (
              <HeaderDescription
                country={userData?.country}
                description={userData?.description}
              />
            )}
            <View style={styles.container}>
              {(showCamera || capturedImage) && (
                <View style={styles.header}>
                  <TouchableOpacity
                    onPress={() => {
                      if (showCamera) {
                        handleCleanup(stopSpeech);
                      } else {
                        dismissFeedback();
                      }
                    }}
                  >
                    <Ionicons name="arrow-back" size={24} color="black" />
                  </TouchableOpacity>
                </View>
              )}
              {showCamera ? (
                <Animated.View style={[{ flex: 1 }, cameraAnimatedStyle]}>
                  <CameraView
                    facing={facing}
                    countdown={countdown}
                    cameraRef={cameraRef}
                    onManualCapture={handleManualCapture}
                    onCancelCountdown={handleCancelCountdown}
                  />
                </Animated.View>
              ) : capturedImage ? (
                <View style={{ flex: 1 }}>
                  <Image source={{ uri: capturedImage }} style={{ flex: 1 }} />
                  {isLoadingFromGemini && (
                    <TouchableOpacity
                      style={styles.bottomOverlay}
                      onPress={dismissFeedback}
                    >
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#ffffff" />
                        <Text style={styles.loadingText}>
                          {translate("analyzing")}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  <Dialog
                    visible={!!feedbackText}
                    bottom
                    onDismiss={() => {
                      setCapturedImage(null);
                      stopSpeech();
                    }}
                    panDirection={PanningProvider.Directions.DOWN}
                  >
                    <Text style={styles.feedbackText}>{feedbackText}</Text>
                  </Dialog>
                </View>
              ) : (
                <Animated.View style={[styles.content, animatedStyle]}>
                  <CategoryList
                    categories={categories}
                    onCategoryPress={(category) => handleCommand(category)}
                    country={userData?.country}
                    description={userData?.description}
                  />
                </Animated.View>
              )}
            </View>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetAndLogout}
            >
              <Text style={styles.resetButtonText}>{translate("survey")}</Text>
            </TouchableOpacity>
          </ImageBackground>
          <VoiceRecognitionModal
            visible={listening && voiceCountdown !== null}
            countdown={voiceCountdown}
            command={command}
            onCancel={onVoiceRecognitionClosed}
          />
          <DonationModal
            visible={donationModalVisible}
            isLoading={isDonationLoading}
            result={donationResult}
            onClose={() => setDonationModalVisible(false)}
            userLanguage={userData?.baseLanguage}
          />
          <TabooModal
            visible={tabooModalVisible} // TabooModal visibility
            isLoading={isLoadingFromGemini}
            result={feedbackText || ""}
            onClose={() => {
              setTabooModalVisible(false);
              stopSpeech();
              resetGeneratedText();
            }}
          />
          <WhatToSayModal
            visible={whatToSayModalVisible}
            isLoading={isLoadingFromGemini}
            result={feedbackText || ""}
            onClose={() => {
              setWhatToSayModalVisible(false);
              stopSpeech();
              resetGeneratedText();
            }}
            onSubmit={handleSituationSubmit}
            userSituation={userSituation}
            setUserSituation={setUserSituation}
          />
          <TipsModal
            visible={tipsModalVisible}
            isLoading={isLoadingFromGemini}
            result={feedbackText || ""}
            onClose={() => {
              setTipsModalVisible(false);
              stopSpeech();
              resetGeneratedText();
            }}
            onSelectTipType={handleSelectTipType}
          />
        </View>
      </LongPressGestureHandler>
    </SafeAreaView>
  );
};

export default Main;
