import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  GiftedChat,
  IMessage,
  MessageText,
  Bubble,
  InputToolbar,
  Actions,
} from "react-native-gifted-chat";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { storage, db } from "@/app/helpers/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { useSignIn } from "@/hooks/authentication/useSignIn";
import {
  View as UILibView,
  Text as UILibText,
  LoaderScreen,
} from "react-native-ui-lib";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/app/theme";
import { useTranslations } from "@/hooks/ui/useTranslations";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";

type RootStackParamList = {
  ChatScreen: { recipientId: string; itemName: string };
};

type ChatScreenRouteProp = RouteProp<RootStackParamList, "ChatScreen">;

interface ChatMessage extends IMessage {
  translatedText?: string;
  audio?: string;
  image?: string;
  video?: string;
}

const Chat: React.FC = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const { recipientId, itemName } = route.params || {
    recipientId: "2iecagcxcgYrnOj8AaiZEYZfvrf2",
    itemName: "Default Item",
  };
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const PAGE_SIZE = 10;

  const { isRTL } = useTranslations();
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [audioUploading, setAudioUploading] = useState(false);
  const [audioPlaybackStatus, setAudioPlaybackStatus] = useState<{
    [key: string]: boolean;
  }>({});
  const soundRef = useRef<{ [key: string]: Audio.Sound }>({});

  const getChatRoomId = (userId1: string, userId2: string) => {
    return [userId1, userId2].sort().join("_");
  };
  const { userId, loading, setLoading, authenticateUser } = useSignIn();
  const navigation = useNavigation();

  useEffect(() => {
    authenticateUser();
    const fetchInitialMessages = async () => {
      if (!userId) return;
      const chatRoomId = getChatRoomId(userId, recipientId);
      const q = query(
        collection(db, "chatRooms", chatRoomId, "messages"),
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE)
      );

      const snapshot = await getDocs(q);
      const messagesData = snapshot.docs.map((doc) => {
        const firebaseData = doc.data();
        const data: ChatMessage = {
          _id: doc.id,
          text: firebaseData.text,
          translatedText: firebaseData.translatedText,
          createdAt: firebaseData.createdAt.toDate(),
          user: {
            _id: firebaseData.userId,
            name: firebaseData.userName,
          },
          audio: firebaseData.audio,
          image: firebaseData.image,
          video: firebaseData.video,
        };
        return data;
      });

      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setMessages(messagesData);
      setLoading(false);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const realTimeMessages = snapshot.docs.map((doc) => {
          const firebaseData = doc.data();
          const data: ChatMessage = {
            _id: doc.id,
            text: firebaseData.text,
            translatedText: firebaseData.translatedText,
            createdAt: firebaseData.createdAt.toDate(),
            user: {
              _id: firebaseData.userId,
              name: firebaseData.userName,
            },
            audio: firebaseData.audio,
            image: firebaseData.image,
            video: firebaseData.video,
          };
          return data;
        });
        setMessages(realTimeMessages);
      });

      return () => unsubscribe();
    };

    if (userId) {
      fetchInitialMessages();
    }

    // Request permissions for audio recording, camera, and media library
    (async () => {
      const { status: audioStatus } = await Audio.requestPermissionsAsync();
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaLibraryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (
        audioStatus !== "granted" ||
        cameraStatus !== "granted" ||
        mediaLibraryStatus !== "granted"
      ) {
        console.error("Necessary permissions not granted");
      }
    })();

    return () => {
      Object.values(soundRef.current).forEach((sound) => {
        sound.unloadAsync();
      });
    };
  }, [userId]);

  const fetchMoreMessages = async () => {
    if (loadingMore || !lastVisible || !userId) return;

    setLoadingMore(true);

    const chatRoomId = getChatRoomId(userId, recipientId);
    const q = query(
      collection(db, "chatRooms", chatRoomId, "messages"),
      orderBy("createdAt", "desc"),
      startAfter(lastVisible),
      limit(PAGE_SIZE)
    );

    const snapshot = await getDocs(q);
    const messagesData = snapshot.docs.map((doc) => {
      const firebaseData = doc.data();
      const data: ChatMessage = {
        _id: doc.id,
        text: firebaseData.text,
        translatedText: firebaseData.translatedText,
        createdAt: firebaseData.createdAt.toDate(),
        user: {
          _id: firebaseData.userId,
          name: firebaseData.userName,
        },
        audio: firebaseData.audio,
        image: firebaseData.image,
        video: firebaseData.video,
      };
      return data;
    });

    setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    setMessages((prevMessages) => [...prevMessages, ...messagesData]);
    setLoadingMore(false);
  };

  const handleSend = async (newMessages: IMessage[] = []) => {
    const newMessage = newMessages[0];
    if (newMessage && userId) {
      try {
        const chatRoomId = getChatRoomId(userId, recipientId);
        await addDoc(collection(db, "chatRooms", chatRoomId, "messages"), {
          text: newMessage?.text || "",
          translatedText: "",
          createdAt: new Date(),
          userId: userId,
          userName: `User-${userId.substring(0, 6)}`,
          audio: newMessage?.audio || null,
          image: newMessage?.image || null,
          video: newMessage?.video || null,
        });
        Alert.alert("Success", "Message sent successfully.");
      } catch (error) {
        console.error("Error sending message:", error.message);
        Alert.alert("Error", "Failed to send message. Please try again.");
      }
    } else {
      console.error("Invalid message or user ID");
      Alert.alert("Error", "Invalid message or user ID.");
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        const { uri } = result.assets[0];

        Alert.alert(
          "Confirm Image",
          "Do you want to send this image?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Send",
              onPress: async () => {
                try {
                  setImageUploading(true);
                  const response = await fetch(uri);
                  const blob = await response.blob();
                  const fileRef = ref(
                    storage,
                    `media/${Date.now()}_${uri.split("/").pop()}`
                  );
                  await uploadBytes(fileRef, blob);
                  const downloadURL = await getDownloadURL(fileRef);

                  const newMediaMessage: ChatMessage = {
                    _id: Date.now().toString(),
                    createdAt: new Date(),
                    user: {
                      _id: userId || "",
                      name: `User-${userId?.substring(0, 6)}`,
                    },
                    image: downloadURL,
                  };

                  handleSend([newMediaMessage]);
                  Alert.alert("Success", "Image uploaded successfully.");
                } catch (error) {
                  console.error("Error picking or uploading image:", error);
                  Alert.alert(
                    "Error",
                    `Failed to upload image: ${error.message}`
                  );
                } finally {
                  setImageUploading(false);
                }
              },
            },
          ],
          { cancelable: true }
        );
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", `Failed to pick image: ${error.message}`);
    }
  };

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      Alert.alert("Recording", "Audio recording started.");
    } catch (err) {
      console.error("Failed to start recording", err);
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    setAudioUploading(true);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        const audioBlob = await fetch(uri).then((r) => r.blob());
        const audioRef = ref(storage, `audios/${Date.now()}.m4a`);
        await uploadBytes(audioRef, audioBlob);
        const audioUrl = await getDownloadURL(audioRef);

        const newAudioMessage: ChatMessage = {
          _id: Date.now().toString(),
          createdAt: new Date(),
          user: {
            _id: userId || "",
            name: `User-${userId?.substring(0, 6)}`,
          },
          audio: audioUrl,
        };

        handleSend([newAudioMessage]);
        Alert.alert("Success", "Audio uploaded successfully.");
      }
    } catch (err) {
      console.error("Failed to stop recording or upload audio", err);
      Alert.alert(
        "Error",
        "Failed to stop recording or upload audio. Please try again."
      );
    } finally {
      setAudioUploading(false);
    }
  };

  const playAudio = async (audioUrl: string) => {
    try {
      if (soundRef.current[audioUrl]) {
        if (audioPlaybackStatus[audioUrl]) {
          await soundRef.current[audioUrl].pauseAsync();
          setAudioPlaybackStatus((prev) => ({ ...prev, [audioUrl]: false }));
        } else {
          await soundRef.current[audioUrl].playAsync();
          setAudioPlaybackStatus((prev) => ({ ...prev, [audioUrl]: true }));
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true }
        );

        soundRef.current[audioUrl] = newSound;
        setAudioPlaybackStatus((prev) => ({ ...prev, [audioUrl]: true }));

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setAudioPlaybackStatus((prev) => ({ ...prev, [audioUrl]: false }));
          }
        });
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      Alert.alert("Error", "Failed to play audio. Please try again.");
    }
  };

  const CustomInputToolbar = () => (
    <InputToolbar
      containerStyle={styles.inputToolbar}
      renderActions={() => (
        <Actions
          containerStyle={styles.actions}
          icon={() => (
            <UILibView row>
              {imageUploading ? (
                <UILibView style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <UILibText style={styles.loadingText}>Uploading...</UILibText>
                </UILibView>
              ) : (
                <TouchableOpacity
                  onPress={pickImage}
                  style={styles.actionButton}
                >
                  <Ionicons name="image" size={24} color={colors.primary} />
                  <UILibText style={styles.buttonText}>Image</UILibText>
                </TouchableOpacity>
              )}
              {audioUploading ? (
                <UILibView style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <UILibText style={styles.loadingText}>
                    Uploading audio...
                  </UILibText>
                </UILibView>
              ) : isRecording ? (
                <TouchableOpacity
                  onPress={stopRecording}
                  style={[styles.actionButton, styles.recordingButton]}
                >
                  <Ionicons name="stop-circle" size={24} color={colors.error} />
                  <UILibText
                    style={[styles.buttonText, { color: colors.error }]}
                  >
                    Stop
                  </UILibText>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={startRecording}
                  style={styles.actionButton}
                >
                  <Ionicons name="mic" size={24} color={colors.primary} />
                  <UILibText style={styles.buttonText}>Record</UILibText>
                </TouchableOpacity>
              )}
            </UILibView>
          )}
        />
      )}
    />
  );

  const MessageAudio = (props: any) => {
    const { currentMessage } = props;

    const [audio, setaudio] = useState() as any;

    useEffect(() => {
      setaudio(currentMessage.audio);
    }, [currentMessage]);

    const isPlaying = audioPlaybackStatus[audio] || false;

    return (
      <UILibView style={styles.audioContainer}>
        <TouchableOpacity onPress={() => playAudio(audio)}>
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
        <UILibText style={styles.audioText}>
          {isPlaying ? "Playing..." : "Audio message"}
        </UILibText>
      </UILibView>
    );
  };

  const renderMessageImage = (props: any) => {
    const { currentMessage } = props;
    return (
      <Image
        source={{ uri: currentMessage.image }}
        style={styles.imageMessage}
      />
    );
  };

  if (loading) {
    return (
      <UILibView flex center>
        <LoaderScreen message="Loading chat..." color={colors.info} />
      </UILibView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons
            name={isRTL ? "arrow-forward" : "arrow-back"}
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
        <UILibText style={styles.headerText}>Chat about {itemName}</UILibText>
      </View>
      <UILibView flex>
        <GiftedChat
          messages={messages}
          renderBubble={(props) => (
            <Bubble
              {...props}
              wrapperStyle={{
                left: {
                  backgroundColor: colors.bubbleLeft,
                  borderRadius: 20,
                  marginTop: 10,
                },
                right: {
                  borderRadius: 20,
                },
              }}
              textStyle={{
                right: {
                  color: "white",
                },
              }}
            />
          )}
          renderMessageText={(props) => (
            <CustomMessageText
              {...(props as any)}
              currentUserId={userId || ""}
            />
          )}
          renderMessageAudio={(props) => <MessageAudio {...props} />}
          renderMessageImage={renderMessageImage}
          onSend={handleSend}
          user={{
            _id: userId || "",
          }}
          loadEarlier={!loadingMore && !!lastVisible}
          onLoadEarlier={fetchMoreMessages}
          isLoadingEarlier={loadingMore}
          renderInputToolbar={() => <CustomInputToolbar />}
          inverted={true}
          listViewProps={{
            onEndReached: fetchMoreMessages,
            onEndReachedThreshold: 0.1,
          }}
        />
      </UILibView>
    </SafeAreaView>
  );
};

const CustomMessageText = (props: {
  currentMessage: ChatMessage;
  currentUserId: string;
}) => {
  const { currentMessage, currentUserId } = props;
  const isRightBubble = currentMessage.user._id === currentUserId;
  const textColor = isRightBubble ? "white" : colors.translatedTextLight;

  return (
    <UILibView>
      <MessageText {...props} />
      {currentMessage.translatedText ? (
        <UILibText style={[styles.translatedText, { color: textColor }]}>
          {currentMessage.translatedText}
        </UILibText>
      ) : (
        <UILibText style={[styles.translatedText, { color: textColor }]}>
          Translating...
        </UILibText>
      )}
    </UILibView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  backButton: {
    paddingStart: 5,
    marginEnd: 10,
  },
  headerText: {
    fontFamily: "marcellus",
    fontSize: 22,
  },
  translatedText: {
    fontSize: 12,
    marginTop: 5,
    marginStart: 10,
    fontFamily: "marcellus",
  },
  inputToolbar: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actions: {
    width: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "column",
    alignItems: "center",
    marginHorizontal: 10,
    padding: 5,
  },
  recordingButton: {
    backgroundColor: colors.errorLight,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 12,
    marginTop: 2,
    color: colors.primary,
  },
  loadingContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginHorizontal: 10,
  },
  loadingText: {
    fontSize: 10,
    marginTop: 2,
    color: colors.primary,
  },
  audioContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bubbleLeft,
    borderRadius: 20,
    padding: 10,
    marginVertical: 5,
  },
  audioText: {
    marginLeft: 10,
    fontFamily: "marcellus",
    fontSize: 14,
    color: colors.text,
  },
  imageMessage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginVertical: 5,
  },
  videoContainer: {
    width: 200,
    height: 150,
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 5,
  },
  videoThumbnail: {
    width: "100%",
    height: "100%",
  },
  playIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -24 }, { translateY: -24 }],
  },
});

export default Chat;
