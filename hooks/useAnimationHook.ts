import {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
  } from "react-native-reanimated";
  
  export const useAnimation = () => {
    const opacity = useSharedValue(1);
    const cameraOpacity = useSharedValue(0);
  
    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
    }));
  
    const cameraAnimatedStyle = useAnimatedStyle(() => ({
      opacity: cameraOpacity.value,
    }));
  
    const fadeOut = (duration: number, onComplete: () => void) => {
      opacity.value = withTiming(
        0,
        {
          duration,
          easing: Easing.inOut(Easing.ease),
        },
        () => runOnJS(onComplete)()
      );
    };
  
    const fadeIn = (duration: number) => {
      opacity.value = withTiming(1, {
        duration,
        easing: Easing.inOut(Easing.ease),
      });
    };
  
    const fadeInCamera = (duration: number) => {
      cameraOpacity.value = withTiming(1, {
        duration,
        easing: Easing.inOut(Easing.ease),
      });
    };
  
    return {
      opacity,
      cameraOpacity,
      animatedStyle,
      cameraAnimatedStyle,
      fadeOut,
      fadeIn,
      fadeInCamera,
    };
  };