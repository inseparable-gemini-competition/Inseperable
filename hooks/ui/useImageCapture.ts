// hooks/useImageCapture.ts
import { useCamera } from "@/hooks/ui/useCamera";

export const useImageCapture = (mutateAsync: any, currentPromptType: string) => {
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
    setFacing,
    countdown,
  } = useCamera(mutateAsync, currentPromptType);

  return {
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
    setFacing,
    countdown,
  };
};