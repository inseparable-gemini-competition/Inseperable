import React, { useState, useRef, useEffect, memo } from "react";
import {
  View,
  Text,
  ImageBackground,
  Image,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  ActivityIndicator,
  Linking,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import Animated, { Easing, withTiming } from "react-native-reanimated";
import Voice from "@react-native-voice/voice";
import * as Speech from "expo-speech";
import { useMain } from "@/hooks/useMain";
import { Dialog, PanningProvider, Button } from "react-native-ui-lib";
import useStore from "../store";
import { generateSchema } from "@/hooks/utils/generateSchema";
import { useJsonControlledGeneration } from "@/hooks/useJsonControlledGeneration";
import { useNavigation } from "expo-router";
import { NavigationProp } from "@react-navigation/native";
import { auth } from "@/app/helpers/firebaseConfig";
import { signOut } from "firebase/auth";
import { translate } from "@/app/helpers/i18n";  // Import translate function
import {styles, modalStyles} from './MainStyles';
import {categories, Category} from '@/app/helpers/categories';
import CategoryCard from "@/app/components/CategoryCard";


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
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { userData, setUserData } = useStore();
  const navigation = useNavigation<NavigationProp<any>>();

  const openBrowser = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Couldn't load page", err)
    );
  };

  const {
    showCamera,
    setShowCamera,
    capturedImage,
    setCapturedImage,
    countdown,
    cameraRef,
    handleManualCapture,
    cameraOpacity,
    opacity,
    animatedStyle,
    cameraAnimatedStyle,
    handleShowCamera,
    handleCancelCountdown,
    isLoadingFromGemini,
    feedbackText,
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
    const validCommands = ["read", "identify", "price", "donate", "cancel"];
    const command = commands[commands.length - 1];

    if (validCommands.includes(command) && command !== lastCommand) {
      setLastCommand(command);
      console.log(translate("validCommand"), command);
      setListening(false);
      clearVoiceCountdown();
      Voice.stop();
      handleCommand(command, true); // Call the handler for the command
    } else {
      console.log(translate("invalidCommand"), command);
    }
  };

  const handleCommand = async (command: string, autoCapture?: boolean) => {
    let prompt = "";
    switch (command) {
      case "read":
        prompt = "Read the text in this image.";
        break;
      case "identify":
        prompt =
          "Identify the image, give a concise and professional description within three lines. If it's a historical landmark, provide brief information about it.";
        break;
      case "price":
        prompt =
          "Analyze the photo to identify the item. If uncertain, provide a reasonable assumption based on visual cues. Determine the fair market price range for the item (or assumed equivalent) in Egypt as of July 2024, considering its condition if possible. Respond with the item name (or assumption) followed by the estimated price range in Egyptian Pounds (EGP), omitting any introductory phrases";
        break;
      case "donate":
        prompt =
          "tell me about donation entities or organizations you have to give url, name and description (6 exact lines) for the organization that could benefit from my donation in" +
          userData?.country;
        await handleDonate(prompt); // Handle the donation command directly
        return;
      case "plan":
        navigation.navigate("Plan");
        return;
      case "shop":
        navigation.navigate("Shopping");
        return;
      default:
        prompt = "";
    }

    if (prompt && prompt !== "donate") {
      setCurrentPrompt(prompt);
      onVoiceRecognitionClosed();
      handleShowCamera({ autoCapture });
    }
  };

  const handleDonate = async (prompt: string) => {
    try {
      generate(prompt);
      setDonationModalVisible(true);
    } catch (error) {
      console.log("Error fetching donation information:", error);
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

  const dismissFeedback = () => {
    setCapturedImage(null);
    Speech.stop();
  };

  const onVoiceRecognitionClosed = () => {
    setListening(false);
    clearVoiceCountdown();
    setVoiceCountdown(null);
    Voice.stop();
  };

  if (showCamera && !permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          {translate("permissionText")}
        </Text>
        <Button onPress={requestPermission} label={translate("grantPermission")} />
      </View>
    );
  }


  const renderCategoryItem = ({ item }: { item: typeof categories[0] }) => (
    <CategoryCard
      title={translate(item.title)}
      imageUrl={item.imageUrl}
      onPress={() => {
        if (item.title !== 'donate' && item.title !== 'shop' && item.title !== 'environmentalImpact' && item.title !== 'whatToSay') {
          handleShowCamera();
        }
        handleCommand(item.title);
      }}
    />
  );


  const MemoizedCategoryItem = memo(renderCategoryItem);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.subtitle}>
        {showFullDescription
          ? userData?.description
          : userData?.description.slice(0, 160) + "..."}
      </Text>
      <TouchableOpacity
        onPress={() => setShowFullDescription(!showFullDescription)}
      >
        <Text style={styles.seeMoreText}>
          {showFullDescription ? translate("seeLess") : translate("seeMore")}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const handleResetAndLogout = async () => {
    // Clear user data (if any specific data to be cleared)
    // Log out from Firebase
    try {
      await signOut(auth);
      setUserData(null as any);

      // Navigate to login or home screen if needed
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <TouchableWithoutFeedback onLongPress={handleLongPress}>
      <View style={{ flex: 1 }}>
        <ImageBackground
          source={{
            uri: userData?.mostFamousLandmark,
          }}
          style={styles.background}
        >
          {!(showCamera || capturedImage) && (
            <View style={styles.fixedHeader}>
              <Text style={styles.title}>{userData?.country}</Text>
            </View>
          )}
          <View style={styles.container}>
            {(showCamera || capturedImage) && (
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={() => {
                    setShowCamera(false);
                    setCapturedImage(null);
                    cameraOpacity.value = 0;
                    opacity.value = withTiming(1, {
                      duration: 700,
                      easing: Easing.inOut(Easing.ease),
                    });
                  }}
                >
                  <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
              </View>
            )}
            {!!showCamera ? (
              <Animated.View style={[{ flex: 1 }, cameraAnimatedStyle]}>
                {countdown !== null && (
                  <View style={styles.countdownContainer}>
                    <Text style={styles.countdownText}>{countdown}</Text>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={handleCancelCountdown}
                    >
                      <Text style={styles.cancelText}>{translate("cancelAutoCapture")}</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <CameraView ref={cameraRef} facing={facing} style={{ flex: 1 }}>
                  <TouchableOpacity
                    style={styles.captureButton}
                    onPress={handleManualCapture}
                  >
                    <Ionicons name="camera" size={40} color="black" />
                  </TouchableOpacity>
                </CameraView>
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
                      <Text style={styles.loadingText}>{translate("analyzing")}</Text>
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
                <FlatList
                  data={categories}
                  showsVerticalScrollIndicator={false}
                  ListHeaderComponent={renderHeader}
                  renderItem={({ item }) => (
                    <MemoizedCategoryItem item={item} />
                  )}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  columnWrapperStyle={styles.cardContainer}
                  contentContainerStyle={styles.flatListContentContainer}
                  style={{ flex: 1 }} // Ensure FlatList takes full space
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
        <Modal
          visible={listening && voiceCountdown !== null}
          transparent={true}
          animationType="slide"
          onRequestClose={onVoiceRecognitionClosed}
        >
          <View style={modalStyles.modalContainer}>
            <View style={modalStyles.modalContent}>
              <Text style={modalStyles.modalCountdownText}>
                {voiceCountdown} seconds
              </Text>
              <Text style={modalStyles.modalRecognizing}>
                {translate("recognizing")}
              </Text>
              <Text style={modalStyles.modalCommandText}>{command}</Text>

              <TouchableOpacity
                style={modalStyles.modalCancelButton}
                onPress={() => {
                  setListening(false);
                  clearVoiceCountdown();
                  setVoiceCountdown(null);
                  Voice.stop();
                }}
              >
                <Text style={modalStyles.modalCancelText}>{translate("cancel")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal
          visible={donationModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setDonationModalVisible(false)}
        >
          <View style={modalStyles.modalContainer}>
            <View style={modalStyles.modalContent}>
              {isLoading ? (
                <View style={[styles.loadingContainer, { height: 100 }]}>
                  <ActivityIndicator />
                </View>
              ) : (
                <>
                  <Text style={modalStyles.modalTitle}>{translate("donationInfo")}</Text>
                  <Text style={modalStyles.modalText}>{result?.name}</Text>
                  <Text style={modalStyles.modalText}>
                    {result?.description}
                  </Text>
                  <Button
                    style={modalStyles.modalButton}
                    onPress={() => {
                      const url =
                        "https://translate.google.com/translate?sl=auto&tl=${userData?.baseLanguage}&u=" +
                        encodeURIComponent(result?.websiteLink);
                      openBrowser(url);
                    }}
                    label={translate("viewInGoogleTranslate")}
                  />
                  <Button
                    style={modalStyles.modalCloseButton}
                    onPress={() => setDonationModalVisible(false)}
                    label={translate("close")}
                  />
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};



export default Main;
