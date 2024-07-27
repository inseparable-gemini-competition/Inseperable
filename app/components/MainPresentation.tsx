import React from "react";
import { View } from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import { Button, Text } from "react-native-ui-lib";
import { translate } from "@/app/helpers/i18n";
import { styles } from "@/app/screens/MainStyles";
import MainLayout from "@/app/components/MainLayout";
import CameraScreen from "@/app/screens/CamerScreen";
import VoiceActivationButton from "@/app/components/VoiceActivationModal";
import { ModalFactory } from "@/app/components/ModalFactory";
import { categories } from "@/app/helpers/categories";
import CategoryScreen from "@/app/screens/CategoryScreen";
import { useModals } from "@/hooks/ui/useModals";
import { useFeedback } from "@/hooks/ui/useFeedback";
import { useImageCapture } from "@/hooks/ui/useImageCapture";
import { useNavigationAndUser } from "@/hooks/authentication/useNavigationAndUser";
import { useSituationAndTaboo } from "@/hooks/ui/useSituationAndTaboo";
import { useDonation } from "@/hooks/ui/useDonation";
import { useTipSelection } from "@/hooks/ui/useTipsSelection";
import { useVoiceActivation } from "@/hooks/ui/useVoiceActivation";

interface MainPresentationProps {
  modals: ReturnType<typeof useModals>;
  tipSelection: ReturnType<typeof useTipSelection>;
  feedback: ReturnType<typeof useFeedback>;
  imageCapture: ReturnType<typeof useImageCapture>;
  navigationAndUser: ReturnType<typeof useNavigationAndUser>;
  situationAndTaboo: ReturnType<typeof useSituationAndTaboo>;
  donation: ReturnType<typeof useDonation>;
  voiceActivation: ReturnType<typeof useVoiceActivation>;
  handleCommand: (command: string) => Promise<void>;
}

const MainPresentation: React.FC<MainPresentationProps> = ({
  modals,
  tipSelection,
  feedback,
  imageCapture,
  navigationAndUser,
  situationAndTaboo,
  donation,
  voiceActivation,
  handleCommand,
}) => {
  if (imageCapture.showCamera && !imageCapture.permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>{translate("permissionText")}</Text>
        <Button
          onPress={imageCapture.requestPermission}
          label={translate("grantPermission")}
        />
      </View>
    );
  }

  return (
    <MainLayout
      onResetPress={navigationAndUser.handleResetAndLogout}
      backgroundImage={navigationAndUser.userData?.mostFamousLandmark || ""}
    >
      <LongPressGestureHandler
        onHandlerStateChange={voiceActivation.handleLongPress}
        minDurationMs={500}
      >
        <View style={{ flex: 1 }}>
          {imageCapture.showCamera || imageCapture.capturedImage ? (
            <CameraScreen
              showCamera={imageCapture.showCamera}
              capturedImage={imageCapture.capturedImage}
              cameraRef={imageCapture.cameraRef}
              onManualCapture={imageCapture.handleManualCapture}
              onCancelCountdown={imageCapture.handleCancelCountdown}
              onBackPress={() => imageCapture.handleCleanup(feedback.stop)}
              cameraAnimatedStyle={imageCapture.cameraAnimatedStyle}
              facing={imageCapture.facing}
              countdown={imageCapture.countdown || 0}
              isLoadingFromGemini={feedback.isLoadingFromGemini}
              feedbackText={feedback.feedbackText || ""}
              onDismissFeedback={feedback.dismissFeedback}
              onCloseFeedback={() => {
                imageCapture.setCapturedImage(null);
                feedback.stop();
              }}
            />
          ) : (
            <CategoryScreen
              categories={categories as any}
              onCategoryPress={(category) => handleCommand(category)}
              country={navigationAndUser.userData?.country || ""}
              description={navigationAndUser.userData?.description || ""}
              animatedStyle={imageCapture.animatedStyle}
            />
          )}
          <VoiceActivationButton
            onPress={() =>
              voiceActivation.handleLongPress({
                nativeEvent: { state: State.ACTIVE },
              })
            }
            isListening={voiceActivation.listening}
          />
          <ModalFactory
            modals={modals}
            donation={donation}
            feedback={feedback}
            situationAndTaboo={situationAndTaboo}
            tipSelection={tipSelection}
            voiceActivation={voiceActivation}
            userData={navigationAndUser.userData}
          />
        </View>
      </LongPressGestureHandler>
    </MainLayout>
  );
};

export default MainPresentation;
