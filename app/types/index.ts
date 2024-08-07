import { ReactNode } from "react";
import { ViewStyle } from "react-native";

export interface UserData {
  mostFamousLandmark: string;
  country: string;
  description: string;
  baseLanguage: string;
}

export interface Category {
  id: string;
  title: string;
  imageUrl: string;
  openCamera: boolean;
}

export interface ModalProps {
  visible: boolean;
  isLoading: boolean;
  result: string;
  onClose: () => void;
}

export interface MainLayoutProps {
  children: ReactNode;
  backgroundImage: string;
}

export interface CategoryScreenProps {
  categories: Category[];
  onCategoryPress: (category: string) => void;
  country: string;
  description: string;
  animatedStyle: ViewStyle;
}

export interface CameraScreenProps {
  showCamera: boolean;
  capturedImage: string | null;
  cameraRef: any; // Replace 'any' with the proper type from your camera library
  onManualCapture: () => void;
  onCancelCountdown: () => void;
  onBackPress: () => void;
  cameraAnimatedStyle: ViewStyle;
  facing: "front" | "back";
  countdown: number;
  isLoadingFromGemini: boolean;
  feedbackText: string;
  onDismissFeedback: () => void;
  onCloseFeedback: () => void;
}
