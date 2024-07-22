import React, { useState, useRef, useEffect } from "react";
import {
  View,
  ImageBackground,
  Image,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import Voice from "@react-native-voice/voice";
import * as Speech from "expo-speech";
import { useMain } from "@/hooks/useMain";
import { Button, Dialog, PanningProvider } from "react-native-ui-lib";
import useStore from "../store";
import { useJsonControlledGeneration } from "@/hooks/useJsonControlledGeneration";
import { useNavigation } from "expo-router";
import { NavigationProp } from "@react-navigation/native";
import { auth } from "@/app/helpers/firebaseConfig";
import { signOut } from "firebase/auth";
import { translate } from "@/app/helpers/i18n";
import { styles } from "./MainStyles";
import { categories } from "@/app/helpers/categories";
import { generateSchema } from "@/hooks/utils/generateSchema";

// Import new components
import CameraView from "@/app/components/CameraView";
import VoiceRecognitionModal from "@/app/components/VoiceRecognitionModal";
import DonationModal from "@/app/components/DonationModal";
import CategoryList from "@/app/components/CategoryList";
import HeaderDescription from "@/app/components/HeaderDescription";
import { SafeAreaView } from "react-native-safe-area-context";

const Main = () => {
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [listening, setListening] = useState<boolean>(false);
  const [voiceCountdown, setVoiceCountdown] = useState<number | null>(null);
  const [lastCommand, setLastCommand] = useState<string>("");
  const voiceCountdownRef = useRef<NodeJS.Timeout | null>(null);
  const [command, setCommand] = useState<string>("");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [donationModalVisible, setDonationModalVisible] = useState(false);
  const { userData, setUserData } = useStore();
  const navigation = useNavigation<NavigationProp<any>>();

  const {
    showCamera,
    capturedImage,
    setCapturedImage,
    countdown,
    cameraRef,
    handleManualCapture,
    animatedStyle,
    cameraAnimatedStyle,
    handleShowCamera,
    handleCancelCountdown,
    isLoadingFromGemini,
    feedbackText,
    handleCleanup,
    stopSpeech,
  } = useMain({ currentPrompt });

  const schema = generateSchema("recommendation donation entity name", {
    name: ["string", "donation entity name"],
    websiteLink: ["string", "donation entity website link"],
    description: ["string", "donation entity 6 lines description"],
  });
  const { generate, isLoading, result } = useJsonControlledGeneration(schema);

  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechPartialResults = (e) => {
      setCommand(e?.value?.[e?.value?.length - 1]?.split(" ")?.pop() || "");
    };
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  useEffect(() => {
    if (showCamera && !permission?.granted) {
      requestPermission();
    }
  }, [showCamera]);

  const onSpeechStart = (e: any) => {
    console.log("onSpeechStart:", e);
  };

  const onSpeechEnd = (e: any) => {
    console.log("onSpeechEnd:", e);
  };

  const onSpeechError = (e: any) => {
    console.log("onSpeechError:", e);
  };

  const onSpeechResults = (result: any) => {
    console.log("onSpeechResults:", result);
    const commands = result.value[0].toLowerCase().split(" ");
    const command = commands[commands.length - 1];
    handleCommand(command);
  };

  const handleCommand = async (command: string) => {
    Speech.stop();
    setLastCommand(command);
    onVoiceRecognitionClosed();

    switch (command) {
      case "read":
      case "identify":
      case "price":
        let prompt = "";
        if (command === "read") {
          prompt = "Read the text in this image.";
        } else if (command === "identify") {
          prompt =
            "Identify the image, give a concise and professional description within three lines. If it's a historical landmark, provide brief information about it.";
        } else if (command === "price") {
          prompt =
            "Analyze the photo to identify the item. If uncertain, provide a reasonable assumption based on visual cues. Determine the fair market price range for the item (or assumed equivalent) in Egypt as of July 2024, considering its condition if possible. Respond with the item name (or assumption) followed by the estimated price range in Egyptian Pounds (EGP), omitting any introductory phrases";
        }
        setCurrentPrompt(prompt);
        handleShowCamera({ autoCapture: true });
        break;
      case "donate":
        const donatePrompt = `Tell me about donation entities or organizations you have to give url, name and description (6 exact lines) for the organization that could benefit from my donation in ${userData?.country}`;
        await handleDonate(donatePrompt);
        break;
      case "plan":
        navigation.navigate("Plan");
        break;
      case "shop":
        navigation.navigate("Shopping");
        break;
      default:
        console.log("Unknown command:", command);
    }
  };

  const handleDonate = async (prompt: string) => {
    try {
      await generate(prompt);
      setDonationModalVisible(true);
    } catch (error) {
      console.error("Error fetching donation information:", error);
    }
  };

  const handleLongPress = () => {
    if (!showCamera || !capturedImage) {
      console.log("Deep click (long press) detected");
      activateVoiceCommand();
    }
  };

  const activateVoiceCommand = () => {
    console.log("Activating voice command");
    setListening(true);
    Speech.speak(translate("youHave10Seconds"), {
      onDone: () => {
        console.log("Speech finished, starting voice recognition");
        startVoiceCountdown();
        Voice.start("en-US")
          .then(() => {
            console.log("Voice recognition started");
          })
          .catch((err) => {
            console.log("Voice recognition start error:", err);
          });
      },
      onError: (err) => {
        console.log("Speech error:", err);
      },
    });
  };

  const startVoiceCountdown = () => {
    console.log("Starting voice countdown");
    clearVoiceCountdown();
    setVoiceCountdown(10);
    voiceCountdownRef.current = setInterval(() => {
      setVoiceCountdown((prev) => {
        if (prev && prev <= 1) {
          clearVoiceCountdown();
          console.log(translate("countdownFinished"));
          setListening(false);
          Voice.stop()
            .then(() => {
              console.log(translate("voiceRecognitionStopped"));
            })
            .catch((err) => {
              console.log("Voice recognition stop error:", err);
            });
          return 0;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  const clearVoiceCountdown = () => {
    if (voiceCountdownRef.current) {
      clearInterval(voiceCountdownRef.current);
      voiceCountdownRef.current = null;
    }
  };

  const onVoiceRecognitionClosed = () => {
    setListening(false);
    clearVoiceCountdown();
    setVoiceCountdown(null);
    Voice.stop();
  };

  const handleResetAndLogout = async () => {
    try {
      await signOut(auth);
      setUserData(null as any);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const dismissFeedback = () => {
    setCapturedImage(null);
    stopSpeech();
  };

  if (showCamera && !permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>{translate("permissionText")}</Text>
        <Button
          onPress={requestPermission}
          label={translate("grantPermission")}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={{flex: 1}}>
      <TouchableWithoutFeedback onLongPress={handleLongPress}>
        <View style={{ flex: 1 }}>
          <ImageBackground
            source={{
              uri: userData?.mostFamousLandmark,
            }}
            style={styles.background}
          >
            {!(showCamera || capturedImage) && (
              <HeaderDescription
                country={userData?.country}
                description={userData?.description}
              />
            )}
            <View style={styles.container}>
              {(showCamera || capturedImage) && (
                <View style={styles.header}>
                  <TouchableOpacity
                    onPress={() => {
                      if (showCamera) {
                        handleCleanup();
                      } else {
                        dismissFeedback();
                      }
                      stopSpeech();
                    }}
                  >
                    <Ionicons name="arrow-back" size={24} color="black" />
                  </TouchableOpacity>
                </View>
              )}
              {showCamera ? (
                <Animated.View style={[{ flex: 1 }, cameraAnimatedStyle]}>
                  <CameraView
                    facing={facing}
                    countdown={countdown}
                    cameraRef={cameraRef}
                    onManualCapture={handleManualCapture}
                    onCancelCountdown={handleCancelCountdown}
                  />
                </Animated.View>
              ) : capturedImage ? (
                <View style={{ flex: 1 }}>
                  <Image source={{ uri: capturedImage }} style={{ flex: 1 }} />
                  {isLoadingFromGemini && (
                    <TouchableOpacity
                      style={styles.bottomOverlay}
                      onPress={dismissFeedback}
                    >
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#ffffff" />
                        <Text style={styles.loadingText}>
                          {translate("analyzing")}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  <Dialog
                    visible={!!feedbackText}
                    bottom
                    onDismiss={() => setCapturedImage(null)}
                    panDirection={PanningProvider.Directions.DOWN}
                  >
                    <Text style={styles.feedbackText}>{feedbackText}</Text>
                  </Dialog>
                </View>
              ) : (
                <Animated.View style={[styles.content, animatedStyle]}>
                  <CategoryList
                    categories={categories}
                    onCategoryPress={(category) => handleCommand(category)}
                    country={userData?.country}
                    description={userData?.description}
                  />
                </Animated.View>
              )}
            </View>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetAndLogout}
            >
              <Text style={styles.resetButtonText}>{translate("survey")}</Text>
            </TouchableOpacity>
          </ImageBackground>
          <VoiceRecognitionModal
            visible={listening && voiceCountdown !== null}
            countdown={voiceCountdown}
            command={command}
            onCancel={onVoiceRecognitionClosed}
          />
          <DonationModal
            visible={donationModalVisible}
            isLoading={isLoading}
            result={result}
            onClose={() => setDonationModalVisible(false)}
            userLanguage={userData?.baseLanguage}
          />
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default Main;
