import { useState } from "react";
import { Platform } from "react-native";

const useZoom = () => {
    const [zoom, setZoom] = useState(0);

    const handlePinchGesture = (nativeEvent: any) => {
      const { scale, velocity: rawVelocity } = nativeEvent.nativeEvent;
      const velocity = rawVelocity / 20;
  
      const adjustmentFactor = Platform.OS === "ios" ? 0.2 : 700;
      let newZoom = zoom + scale * velocity * adjustmentFactor;
  
      // Ensure newZoom stays within bounds
      newZoom = Math.max(0, Math.min(newZoom, 1));
  
      setZoom(newZoom);
    };
  
    return { zoom, handlePinchGesture };
  };
  
  export default useZoom;