import { useState, useRef } from "react";
import { CameraView } from "expo-camera";

export const useCamera = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<CameraView | null>(null);

  const handleCapture = async () => {
    if (cameraRef.current) {
      const photo = (await cameraRef.current.takePictureAsync()) as any;
      setCapturedImage(photo.uri);
      setShowCamera(false);
      return photo.uri;
    }
    return null;
  };

  return {
    showCamera,
    setShowCamera,
    capturedImage,
    setCapturedImage,
    cameraRef,
    handleCapture,
  };
};