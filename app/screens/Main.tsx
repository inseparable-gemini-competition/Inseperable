import React, { useState, useRef, useEffect } from "react";
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
} from "react-native";
import { CameraView } from "expo-camera"; // Make sure to import the correct Camera module
import { Ionicons } from "@expo/vector-icons";
import Animated, { Easing, withTiming } from "react-native-reanimated";
import Voice from "@react-native-voice/voice";
import * as Speech from "expo-speech";
import { useMain } from "@/hooks/useMain";

const categories = [
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
];

const Main = () => {
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
  } = useMain();

  const [clickCount, setClickCount] = useState<number>(0);
  const [listening, setListening] = useState<boolean>(false);
  const [voiceCountdown, setVoiceCountdown] = useState<number | null>(null);
  const [lastCommand, setLastCommand] = useState<string>("");
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);
  const voiceCountdownRef = useRef<NodeJS.Timeout | null>(null);
  const [command, setCommand] = useState<string>("");

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

    // فصل الأوامر المتكررة واختيار آخر أمر صحيح
    const commands = result.value[0].toLowerCase().split(" ");
    const validCommands = ["read", "identify", "price", "cancel"];
    const command = commands[commands.length - 1];

    if (validCommands.includes(command) && command !== lastCommand) {
      setLastCommand(command);
      console.log("Valid command:", command);
      setListening(false);
      clearVoiceCountdown();
      Voice.stop();
    } else {
      console.log("Invalid or repeated command ignored:", command);
    }
  };

  const handleThreeClicks = () => {
    console.log("Screen clicked");
    if (clickTimeout.current) clearTimeout(clickTimeout.current);
    setClickCount((prev) => prev + 1);
    clickTimeout.current = setTimeout(() => setClickCount(0), 1000);

    if (clickCount === 2) {
      console.log("Three clicks detected");
      setClickCount(0);
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
    // Ensure any previous countdowns are cleared before starting a new one
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
          return 0; // Ensure the countdown stops at 0
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

  return (
    <TouchableWithoutFeedback onPress={handleThreeClicks}>
      <View style={{ flex: 1 }}>
        <ImageBackground
          source={{
            uri: "https://images.pexels.com/photos/33571/tutankhamun-death-mask-pharaonic-egypt.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
          }}
          style={styles.background}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => {
                  setShowCamera(false);
                  setCapturedImage(null);
                  cameraOpacity.value = 0;
                  opacity.value = withTiming(1, {
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                  });
                }}
              >
                <Text style={styles.icon}>{"<"}</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.icon}>☰</Text>
              </TouchableOpacity>
            </View>
            {!!showCamera ? (
              <Animated.View style={[{ flex: 1 }, cameraAnimatedStyle]}>
                {countdown !== null && (
                  <View style={styles.countdownContainer}>
                    <Text style={styles.countdownText}>{countdown}</Text>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={handleCancelCountdown}
                    >
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <CameraView ref={cameraRef} style={{ flex: 1 }}>
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
              </View>
            ) : (
              <Animated.View style={[styles.content, animatedStyle]}>
                <View>
                  <Text style={styles.title}>Egypt</Text>
                  <Text style={styles.subtitle}>
                    Egypt is the cradle of civilization, the land of the
                    pharaohs, and a country of rich history and culture.
                  </Text>
                </View>

                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={!!voiceCountdown}
                  onRequestClose={() => {
                    setListening(false);
                    clearVoiceCountdown();
                    setVoiceCountdown(null);
                    Voice.stop();
                  }}
                >
                  <View style={modalStyles.modalContainer}>
                    <View style={modalStyles.modalContent}>
                      <Text style={modalStyles.modalCountdownText}>
                        {voiceCountdown} seconds
                      </Text>
                      <Text style={modalStyles.modalRecognizing}>
                        Recognizing your command..
                      </Text>
                      <Text style={modalStyles.modalCommandText}>
                        {command}
                      </Text>

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

                <FlatList
                  data={categories}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.card]}
                      onPress={handleShowCamera}
                    >
                      <Image source={item.imageUrl} style={styles.cardImage} />
                      <Text style={styles.cardText}>{item.title}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  columnWrapperStyle={styles.cardContainer}
                  contentContainerStyle={{ paddingBottom: 16 }}
                />
              </Animated.View>
            )}
          </View>
        </ImageBackground>
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
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 16,
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
  cardContainer: {
    justifyContent: "space-between",
    marginTop: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: "48%",
    alignItems: "center",
    padding: 16,
    marginBottom: 16,
  },
  cardImage: {
    width: "100%",
    height: 100,
    borderRadius: 16,
  },
  cardText: {
    marginTop: 8,
    fontSize: 18,
    fontFamily: "Roboto-Bold",
  },
  countdownContainer: {
    position: "absolute",
    top: "40%",
    left: "50%",
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
    backgroundColor: "rgba(255, 0, 0, 0.7)",
    borderRadius: 10,
  },
  cancelText: {
    color: "white",
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
  },
  modalRecognizing: {
    fontSize: 18,
    color: "grey",
    marginBottom: 10,
  },
  modalCommandText: {
    fontSize: 24,
    color: "black",
    marginBottom: 20,
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
  },
});

export default Main;
