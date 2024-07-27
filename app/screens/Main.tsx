import React from "react";
import { View } from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import CategoryScreen from "./CategoryScreen";
import { useModals } from "@/hooks/ui/useModals";
import { useTipSelection } from "@/hooks/ui/useTipsSelection";
import { useFeedback } from "@/hooks/ui/useFeedback";
import { useImageCapture } from "@/hooks/ui/useImageCapture";
import { useNavigationAndUser } from "@/hooks/authentication/useNavigationAndUser";
import { useSituationAndTaboo } from "@/hooks/ui/useSituationAndTaboo";
import { useDonation } from "@/hooks/ui/useDonation";
import { useVoiceActivation } from "@/hooks/ui/useVoiceActivation";
import { Button, Text } from "react-native-ui-lib";
import { translate } from "@/app/helpers/i18n";
import { styles } from "@/app/screens/MainStyles";
import MainLayout from "@/app/components/MainLayout";
import CameraScreen from "@/app/screens/CamerScreen";
import VoiceRecognitionModal from "@/app/components/VoiceRecognitionModal";
import DonationModal from "@/app/components/DonationModal";
import WhatToSayModal from "@/app/components/WhatToSayModal";
import TabooModal from "@/app/components/TabooModal";
import TipsModal from "@/app/components/tipModal";
import VoiceActivationButton from "@/app/components/VoiceActivationModal";
import { categories } from "@/app/helpers/categories";

const Main = () => {
  const {
    tabooModalVisible,
    setTabooModalVisible,
    whatToSayModalVisible,
    setWhatToSayModalVisible,
    tipsModalVisible,
    setTipsModalVisible,
  } = useModals();

  const { selectedTipType, handleSelectTipType } = useTipSelection();

  const {
    currentPromptType,
    setCurrentPromptType,
    mutateAsync,
    isLoadingFromGemini,
    feedbackText,
    reset: resetGeneratedText,
    stop: stopSpeech,
    dismissFeedback,
  } = useFeedback();

  const {
    showCamera,
    capturedImage,
    cameraRef,
    handleManualCapture,
    handleCancelCountdown,
    handleShowCamera,
    handleCleanup,
    animatedStyle,
    cameraAnimatedStyle,
    permission,
    requestPermission,
    setCapturedImage,
    facing,
    countdown,
  } = useImageCapture(mutateAsync, currentPromptType);

  const { navigation, userData, handleResetAndLogout } = useNavigationAndUser();

  const {
    userSituation,
    setUserSituation,
    handleSituationSubmit,
    handleTabooSubmit,
  } = useSituationAndTaboo(mutateAsync, userData, setTabooModalVisible);

  const {
    donationModalVisible,
    setDonationModalVisible,
    isDonationLoading,
    donationResult,
    handleDonate,
  } = useDonation();

  const handleCommand = async (command: string) => {
    onVoiceRecognitionClosed();
    setCurrentPromptType(command);
    switch (command) {
      case "read":
      case "identify":
      case "price":
        handleShowCamera({ autoCapture: true });
        break;
      case "donate":
        await handleDonate();
        break;
      case "taboo":
        handleTabooSubmit();
        break;
      case "whatToSay":
        setWhatToSayModalVisible(true);
        break;
      case "plan":
        navigation.navigate("Plan");
        break;
      case "shop":
        navigation.navigate("Shopping");
        break;
      case "impact":
        navigation.navigate("EnvImpact");
        break;
      case "tips":
        setTipsModalVisible(true);
        break;
      default:
        console.log("Unknown command:", command);
    }
  };



  const {
    listening,
    voiceCountdown,
    onVoiceRecognitionClosed,
    command,
    handleLongPress,
  } = useVoiceActivation(handleCommand, showCamera, capturedImage);


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
    <MainLayout
      onResetPress={handleResetAndLogout}
      backgroundImage={userData?.mostFamousLandmark || ""}
    >
      <LongPressGestureHandler
        onHandlerStateChange={handleLongPress}
        minDurationMs={500}
      >
        <View style={{ flex: 1 }}>
          {showCamera || capturedImage ? (
            <CameraScreen
              showCamera={showCamera}
              capturedImage={capturedImage}
              cameraRef={cameraRef}
              onManualCapture={handleManualCapture}
              onCancelCountdown={handleCancelCountdown}
              onBackPress={() => handleCleanup(stopSpeech)}
              cameraAnimatedStyle={cameraAnimatedStyle}
              facing={facing}
              countdown={countdown || 0}
              isLoadingFromGemini={isLoadingFromGemini}
              feedbackText={feedbackText || ""}
              onDismissFeedback={dismissFeedback}
              onCloseFeedback={() => {
                setCapturedImage(null);
                stopSpeech();
              }}
            />
          ) : (
            <CategoryScreen
              categories={categories as any}
              onCategoryPress={(category) => handleCommand(category)}
              country={userData?.country || ""}
              description={userData?.description || ""}
              animatedStyle={animatedStyle}
            />
          )}
          <VoiceActivationButton
            onPress={() =>
              handleLongPress({ nativeEvent: { state: State.ACTIVE } })
            }
            isListening={listening}
          />
          <VoiceRecognitionModal
            visible={listening && voiceCountdown !== null}
            countdown={voiceCountdown || 0}
            command={command}
            onCancel={onVoiceRecognitionClosed}
          />
          <DonationModal
            visible={donationModalVisible}
            isLoading={isDonationLoading}
            result={donationResult}
            onClose={() => setDonationModalVisible(false)}
            userLanguage={userData?.baseLanguage || ""}
          />
          <TabooModal
            visible={tabooModalVisible}
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
    </MainLayout>
  );
};

export default Main;
