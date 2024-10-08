import React from "react";
import { View } from "react-native";
import { State } from "react-native-gesture-handler";
import { Button, Text } from "react-native-ui-lib";
import { styles } from "@/app/screens/MainStyles";
import MainLayout from "@/app/components/MainLayout";
import CameraScreen from "@/app/screens/CamerScreen";
import VoiceActivationButton from "@/app/components/VoiceActivationModal";
import { ModalFactory } from "@/app/components/ModalFactory";
import { categories } from "@/app/helpers/categories";
import CategoryScreen from "@/app/screens/CategoryScreen";
import { useModals } from "@/hooks/ui/useModals";
import { useTextFeedback } from "@/hooks/ui/useTextFeedback";
import { useCamera } from "@/hooks/ui/useCamera";
import { useModalHandlers } from "@/hooks/ui/useModalHandlers";
import { useDonation } from "@/hooks/ui/useDonation";
import { useTipSelection } from "@/hooks/ui/useTipsSelection";
import { useVoiceActivation } from "@/hooks/ui/useVoiceActivation";
import { useTranslations } from "@/hooks/ui/useTranslations";
import useStore from "@/app/store";
import { CustomText } from "@/app/components/CustomText";
import { useFont } from "@/app/context/fontContext";

interface MainPresentationProps {
  modals: ReturnType<typeof useModals>;
  tipSelection: ReturnType<typeof useTipSelection>;
  textFeedBack: ReturnType<typeof useTextFeedback>;
  imageCapture: ReturnType<typeof useCamera>;
  modalHandlers: ReturnType<typeof useModalHandlers>;
  donation: ReturnType<typeof useDonation>;
  voiceActivation: ReturnType<typeof useVoiceActivation>;
  handleCommand: (command: string) => Promise<void>;
}

const MainPresentation: React.FC<MainPresentationProps> = ({
  modals,
  tipSelection,
  textFeedBack,
  imageCapture,
  modalHandlers,
  donation,
  voiceActivation,
  handleCommand,
}) => {
  const { translate } = useTranslations();
  const {selectedFont} = useFont();
  const { userData } = useStore();
  if (imageCapture.showCamera && !imageCapture.permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <CustomText style={styles.permissionText}>
          {translate("permissionText")}
        </CustomText>
        <Button
          onPress={imageCapture.requestPermission}
          label={translate("grantPermission")}
          labelStyle={{ fontFamily: selectedFont }}
        />
      </View>
    );
  }

  return (
    <MainLayout backgroundImage={userData?.mostFamousLandmark || ""}>
      <View style={{ flex: 1 }}>
        {imageCapture.showCamera || imageCapture.capturedImage ? (
          <CameraScreen
            showCamera={imageCapture.showCamera}
            capturedImage={imageCapture.capturedImage}
            cameraRef={imageCapture.cameraRef}
            onManualCapture={imageCapture.handleManualCapture}
            onCancelCountdown={imageCapture.handleCancelCountdown}
            onBackPress={() => imageCapture.handleCleanup(textFeedBack.stop)}
            cameraAnimatedStyle={imageCapture.cameraAnimatedStyle}
            facing={imageCapture.facing || "back"}
            countdown={imageCapture.countdown || 0}
            isLoadingFromGemini={textFeedBack.isLoadingFromGemini}
            feedbackText={textFeedBack.feedbackText || ""}
            onDismissFeedback={textFeedBack.dismissFeedback}
            onCloseFeedback={() => {
              imageCapture.setCapturedImage(null);
              textFeedBack.stop();
              textFeedBack.reset();
            }}
          />
        ) : (
          <>
            <CategoryScreen
              categories={categories as any}
              handleFontSettings={modalHandlers.handleFontSettings}
              onCategoryPress={(category) => handleCommand(category)}
              country={userData?.country || ""}
              description={userData?.description || ""}
              animatedStyle={imageCapture.animatedStyle}
            />
            <VoiceActivationButton
              onPress={() =>
                voiceActivation.handleMicPress({
                  nativeEvent: { state: State.ACTIVE },
                })
              }
              isListening={!!voiceActivation.isListening}
              isLoading={!!voiceActivation.isProcessing}
            />
          </>
        )}

        <ModalFactory
          modals={modals}
          donation={donation}
          feedback={textFeedBack}
          modalHandlers={modalHandlers}
          tipSelection={tipSelection}
          userData={userData}
        />
      </View>
    </MainLayout>
  );
};

export default MainPresentation;
