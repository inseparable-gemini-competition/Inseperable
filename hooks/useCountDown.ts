import { useState, useRef, useCallback } from "react";

export const useCountdown = () => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const startCountdown = useCallback(() => {
    handleCancelCountdown();
    setCountdown(10);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return prev;
        if (prev === 0) {
          clearInterval(countdownRef.current!);
          countdownRef.current = null;
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleCancelCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    countdownRef.current = null;
    setCountdown(null);
  }, []);

  return {
    countdown,
    startCountdown,
    handleCancelCountdown,
  };
};
