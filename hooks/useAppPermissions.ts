import { useCameraPermissions } from "expo-camera";
import { useEffect } from "react";
import { Platform, PermissionsAndroid } from "react-native";

// Custom Hook for Permissions
const useAppPermissions = () => {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === "android") {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log("Microphone permission denied");
          }
        } catch (err) {
          console.log("Permission request error: ", err);
        }
      }

      if (cameraPermission && !cameraPermission.granted) {
        requestCameraPermission();
      }
    };

    requestPermissions();
  }, [cameraPermission, requestCameraPermission]);

  return { cameraPermission, requestCameraPermission };
};

export default useAppPermissions;
