import React, { useMemo, useRef, ReactNode, useState, useEffect } from "react";
import {
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { useTextToSpeech } from "@/app/context/TextToSpeechContext";
import SpeechControlIcon from "@/app/components/SpeechControlIcon";

import { Ionicons } from "@expo/vector-icons";
import { useVoiceToText } from "@/hooks/ui/useVoiceToText";
import { colors } from "@/app/theme";
import useExitHandler from "@/hooks/ui/useExitHandler";

interface GenericBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  snapPoints?: (string | number)[];
  initialIndex?: number;
  backdropComponent?: React.FC<any> | null;
  enableScroll?: boolean;
  contentContainerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  inputStyle?: ViewStyle;
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
  textToSpeak?: string;
  onSubmit?: (text: string) => void;
  cancelSpeaking?: boolean;
}

const defaultRenderBackdrop = (props: any) => (
  <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
);

export const GenericBottomSheetTextInput = BottomSheetTextInput;

const GenericBottomSheet: React.FC<GenericBottomSheetProps> = ({
  visible,
  onClose,
  children,
  snapPoints = ["50%", "75%", "90%"],
  initialIndex = 0,
  backdropComponent = defaultRenderBackdrop,
  enableScroll = true,
  contentContainerStyle,
  inputStyle,
  textStyle,
  textToSpeak,
  onSubmit,
  cancelSpeaking,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { speak, stop } = useTextToSpeech();
  useExitHandler(false, onClose);

  useEffect(() => {
    if (cancelSpeaking) {
      stop();
      setIsSpeaking(false);
    }
  }, [cancelSpeaking]);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const { isListening, startListening, stopListening, isSendingMessage } =
    useVoiceToText(onSubmit ?? (() => {}));
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const memoizedSnapPoints = useMemo(() => snapPoints, [snapPoints]);

  const ContentComponent = enableScroll
    ? BottomSheetScrollView
    : BottomSheetView;

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      stop();
      setIsSpeaking(false);
    } else if (textToSpeak) {
      speak(textToSpeak, { onDone: () => setIsSpeaking(false) });
      setIsSpeaking(true);
    }
  };

  useEffect(() => {
    if (isListening) {
      setIsButtonDisabled(false);
    }
  }, [isListening]);

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      setIsButtonDisabled(true);
      startListening();
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={visible ? initialIndex : -1}
      snapPoints={memoizedSnapPoints}
      onChange={(index) => {
        if (index === -1) {
          onClose();
          Keyboard.dismiss();
          if (isSpeaking) {
            stop();
            setIsSpeaking(false);
          }
        }
      }}
      backdropComponent={backdropComponent}
      animateOnMount
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      enablePanDownToClose
      overDragResistanceFactor={10}
    >
      <ContentComponent
        contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
        keyboardShouldPersistTaps={"handled"}
        nestedScrollEnabled
      >
        <View style={styles.iconContainer}>
          {Boolean(textToSpeak) && (
            <SpeechControlIcon
              isSpeaking={isSpeaking}
              onToggle={handleToggleSpeech}
              style={styles.speechIcon}
            />
          )}
          {!textToSpeak &&
            onSubmit &&
            (Boolean(!isSendingMessage) ? (
              <TouchableOpacity
                onPress={handleVoiceToggle}
                style={[
                  styles.voiceIcon,
                  isButtonDisabled && styles.disabledButton,
                ]}
                disabled={isButtonDisabled}
              >
                <Ionicons
                  name={isListening ? "mic" : "mic-outline"}
                  size={24}
                  color={
                    isListening
                      ? colors.danger
                      : isButtonDisabled
                      ? colors.secondary
                      : colors.black
                  }
                />
              </TouchableOpacity>
            ) : (
              <ActivityIndicator size="small" />
            ))}
        </View>
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child, {
                style: {
                  ...styles.text,
                  ...textStyle,
                  ...(child.props.style || {}),
                  ...(child.type === GenericBottomSheetTextInput
                    ? { ...styles.input, ...inputStyle }
                    : {}),
                },
              } as any)
            : child
        )}
      </ContentComponent>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
    minHeight: "100%",
  },
  text: {
    fontSize: 16,
    color: "#333",
  },
  input: {
    height: 100,
    width: "100%",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 10,
    color: "#333",
    marginBottom: 16,
    textAlignVertical: "top",
  },
  button: {
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: "center",
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 0,
  },
  speechIcon: {
    marginRight: 16,
  },
  voiceIcon: {
    padding: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  transcript: {
    marginTop: 16,
    fontSize: 14,
    fontStyle: "italic",
    color: "#666",
  },
});

export default GenericBottomSheet;
