import { useState, useRef } from "react";

export const useCountdown = () => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const startCountdown = (duration: number, onComplete: () => void) => {
    handleCancelCountdown();
    setCountdown(duration);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownRef.current!);
          countdownRef.current = null;
          onComplete();
        }
        return prev! - 1 > 0 ? prev! - 1 : 0;
      });
    }, 1000);
  };

  const handleCancelCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = null;
    setCountdown(null);
  };

  return { countdown, startCountdown, handleCancelCountdown };
};