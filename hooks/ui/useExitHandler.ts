import { useEffect } from "react";
import { Alert, BackHandler } from "react-native";

const useExitHandler = (noModalVisible: boolean, onDismiss?: () => void) => {
  useEffect(() => {
    const backAction = () => {
      if (noModalVisible) {
        Alert.alert("Hold on!", "Are you sure you want to exit?", [
          {
            text: "Cancel",
            onPress: () => null,
            style: "cancel",
          },
          { text: "YES", onPress: () => BackHandler.exitApp() },
        ]);
      } else {
        onDismiss?.();
      }

      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);
};

export default useExitHandler;
