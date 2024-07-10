import { useRef, useState } from "react";
import { PanResponder, PanResponderInstance } from "react-native";

const useTouch = (
    initialHeight: number,
    minHeight: number,
    maxHeight: number
  ): { height: number; panResponder: PanResponderInstance } => {
    const [height, setHeight] = useState(initialHeight);
    const initialHeightRef = useRef(initialHeight);
  
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        initialHeightRef.current = height;
      },
      onPanResponderMove: (_, gestureState) => {
        const newHeight = initialHeightRef.current + gestureState.dy;
        if (newHeight >= minHeight && newHeight <= maxHeight) {
          setHeight(newHeight);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const newHeight = initialHeightRef.current + gestureState.dy;
        if (newHeight >= minHeight && newHeight <= maxHeight) {
          setHeight(newHeight);
        }
      },
    });
  
    return { height, panResponder };
  };
  
  export default useTouch;