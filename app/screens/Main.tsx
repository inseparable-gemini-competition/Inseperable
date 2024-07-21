import React, { useState, useRef, useEffect, memo } from "react";
import {
  StyleSheet,
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

type Category = {
  id: string;
  title: string;
  imageUrl: any;
};

const categories: Category[] = [
  {
    id: "1",
    title: "Identify",
    imageUrl: require("../../assets/images/marks.png"),
  },
  {
    id: "2",
    title: "Fair Price",
    imageUrl: require("../../assets/images/fair-pricee.png"),
  },
  {
    id: "3",
    title: "Read",
    imageUrl: require("../../assets/images/menu.png"),
  },
  {
    id: "4",
    title: "Donate",
    imageUrl: require("../../assets/images/help.png"),
  },
  {
    id: "5",
    title: "Plan",
    imageUrl: require("../../assets/images/plan.png"),
  },
  {
    id: "6",
    title: "Shop",
    imageUrl: require("../../assets/images/shop.png"),
  },
];

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
  const { userData } = useStore();
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
      console.log("Valid command:", command);
      setListening(false);
      clearVoiceCountdown();
      Voice.stop();
      handleCommand(command, true); // Call the handler for the command
    } else {
      console.log("Invalid or repeated command ignored:", command);
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
    Speech.speak("You have 10 seconds to say your command", {
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
          console.log("Voice countdown finished, stopping voice recognition");
          setListening(false);
          Voice.stop()
            .then(() => {
              console.log("Voice recognition stopped");
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
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} label="Grant Permission" />
      </View>
    );
  }

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        if (item.title !== "Donate" && item.title !== "Shop")
          handleShowCamera();
        const command =
          item.title === "Identify"
            ? "identify"
            : item.title === "Fair Price"
            ? "price"
            : item.title === "Read"
            ? "read"
            : item.title === "Donate"
            ? "donate"
            : item.title === "Shop"
            ? "shop"
            : "plan";
        handleCommand(command);
      }}
    >
      <Image source={item.imageUrl} style={styles.cardImage} />
      <Text style={styles.cardText}>{item.title}</Text>
    </TouchableOpacity>
  );

  const MemoizedCategoryItem = memo(renderCategoryItem);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.subtitle}>
        {showFullDescription
          ? userData.description
          : userData.description.slice(0, 160) + "..."}
      </Text>
      <TouchableOpacity
        onPress={() => setShowFullDescription(!showFullDescription)}
      >
        <Text style={styles.seeMoreText}>
          {showFullDescription ? "See Less" : "See More"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <TouchableWithoutFeedback onLongPress={handleLongPress}>
      <View style={{ flex: 1 }}>
        <ImageBackground
          source={{
            uri: userData?.mostFamousLandmark,
          }}
          style={styles.background}
        >
          {! (showCamera || capturedImage) && <View style={styles.fixedHeader}>
            <Text style={styles.title}>{userData.country}</Text>
          </View>}
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
                      <Text style={styles.cancelText}>Cancel auto capture</Text>
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
                      <Text style={styles.loadingText}>Analyzing...</Text>
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
                  renderItem={({ item }) => <MemoizedCategoryItem item={item} />}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  columnWrapperStyle={styles.cardContainer}
                  contentContainerStyle={styles.flatListContentContainer}
                  style={{ flex: 1 }} // Ensure FlatList takes full space
                />
              </Animated.View>
            )}
          </View>
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
                Recognizing your command...
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
                <Text style={modalStyles.modalCancelText}>Cancel</Text>
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
                  <Text style={modalStyles.modalTitle}>Donation Info</Text>
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
                    label="View in Google Translate"
                  />
                  <Button
                    style={modalStyles.modalCloseButton}
                    onPress={() => setDonationModalVisible(false)}
                    label="Close"
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

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    marginTop: 20,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 20,
  },
  fixedHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: "rgba(255, 255, 255, 0.75)", // Added to match the container background
    zIndex: 1, // Ensure it stays on top
  },
  headerContainer: {
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.75)", // Match container background
  },
  title: {
    fontSize: 48,
    fontFamily: "marcellus",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: "marcellus",
    marginVertical: 16,
  },
  seeMoreText: {
    fontSize: 16,
    color: "blue",
    textDecorationLine: "underline",
  },
  cardContainer: {
    justifyContent: "space-between",
    marginTop: 16,
    paddingHorizontal: 16, // Increase touchable area
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: "42%",
    alignItems: "center",
    padding: 16,
    marginBottom: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  cardImage: {
    width: "100%",
    height: 70,
    borderRadius: 16,
  },
  cardText: {
    marginTop: 8,
    fontSize: 18,
    fontFamily: "marcellus",
  },
  countdownContainer: {
    position: "absolute",
    top: "40%",
    left: "40%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: "center",
    zIndex: 1,
  },
  voicedownContainer: {
    position: "absolute",
    top: "40%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: "center",
    zIndex: 1,
  },
  countdownText: {
    fontSize: 48,
    color: "white",
    fontFamily: "marcellus",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  recognizing: {
    fontSize: 14,
    color: "white",
    fontFamily: "marcellus",
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  cancelButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#ffb33e",
    borderRadius: 15,
  },
  cancelText: {
    color: "white",
    fontFamily: "marcellus",
    fontSize: 18,
  },
  captureButton: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#000",
  },
  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 20,
    alignItems: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 24,
    marginLeft: 10,
    fontFamily: "marcellus",
  },
  feedbackText: {
    color: "#ffffff",
    fontSize: 18,
    textAlign: "center",
    paddingHorizontal: 20,
    fontFamily: "marcellus",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  permissionText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 16,
  },
  flatListContentContainer: {
    paddingBottom: 16,
    paddingHorizontal: 8, // Increase touchable area
  },
});

const modalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  modalCountdownText: {
    fontSize: 30,
    color: "black",
    marginBottom: 10,
    fontFamily: "marcellus",
  },
  modalRecognizing: {
    fontSize: 18,
    color: "grey",
    marginBottom: 10,
    fontFamily: "marcellus",
  },
  modalCommandText: {
    fontSize: 24,
    color: "black",
    marginBottom: 20,
    fontFamily: "marcellus",
  },
  modalCancelButton: {
    backgroundColor: "red",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalCancelText: {
    color: "white",
    fontSize: 18,
    fontFamily: "marcellus",
  },
  modalTitle: {
    fontSize: 34,
    marginBottom: 10,
    fontFamily: "marcellus",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "marcellus",
  },
  modalButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalButtonText: {
    color: "white",
    fontSize: 18,
    fontFamily: "marcellus",
  },
  modalCloseButton: {
    backgroundColor: "#f44336",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalCloseButtonText: {
    color: "white",
    fontSize: 18,
    fontFamily: "marcellus",
  },
});

export default Main;
