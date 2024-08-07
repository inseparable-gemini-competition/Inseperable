import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
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
import { View as UILibView, Text as UILibText } from "react-native-ui-lib";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/app/theme";
import { useTranslations } from "@/hooks/ui/useTranslations";
import * as ImagePicker from "expo-image-picker";
import useStore from "@/app/store";

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
  const {translate} = useTranslations();
  const [lastVisible, setLastVisible] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const PAGE_SIZE = 10;

  const { isRTL } = useTranslations();
  const [imageUploading, setImageUploading] = useState(false);
  const { userData } = useStore();
  const navigation = useNavigation();
  const userId = userData?.id || "";

  const getChatRoomId = (userId1: string, userId2: string) => {
    return [userId1, userId2].sort().join("_");
  };

  useEffect(() => {
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

    (async () => {
      if (Platform.OS !== "web") {
        const { status: cameraStatus } =
          await ImagePicker.requestCameraPermissionsAsync();
        const { status: mediaLibraryStatus } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (cameraStatus !== "granted" || mediaLibraryStatus !== "granted") {
          Alert.alert(
            "Permission required",
            "Please grant camera and media library permissions to use this feature."
          );
        }
      }
    })();
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

  const handleSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      const newMessage = newMessages[0];
      if (newMessage && userId) {
        try {
          const chatRoomId = getChatRoomId(userId, recipientId);
          await addDoc(collection(db, "chatRooms", chatRoomId, "messages"), {
            text: newMessage.text || "",
            translatedText: "",
            createdAt: new Date(),
            userId: userId,
            userName: `User-${userId.substring(0, 6)}`,
            audio: newMessage.audio || null,
            image: newMessage.image || null,
            video: newMessage.video || null,
          });
        } catch (error) {
          console.error("Error sending message:", error);
          Alert.alert("Error", "Failed to send message. Please try again.");
        }
      }
    },
    [userId, recipientId]
  );

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
                      _id: userId,
                      name: `User-${userId.substring(0, 6)}`,
                    },
                    image: downloadURL,
                  };

                  handleSend([newMediaMessage]);
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

  const CustomInputToolbar = (props) => (
    <InputToolbar
      {...props}
      containerStyle={styles.inputToolbar}
      renderActions={() => (
        <Actions
          {...props}
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
            </UILibView>
          )}
        />
      )}
    />
  );

  const renderMessageImage = (props: any) => {
    const { currentMessage } = props;
    return (
      <Image
        source={{ uri: currentMessage.image }}
        style={styles.imageMessage}
      />
    );
  };

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
        <UILibText style={styles.headerText}>
          {translate("chatAbout")} {itemName}
        </UILibText>
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
            <CustomMessageText {...props} currentUserId={userId} />
          )}
          renderMessageImage={renderMessageImage}
          onSend={handleSend}
          user={{
            _id: userId,
          }}
          loadEarlier={!loadingMore && !!lastVisible}
          onLoadEarlier={fetchMoreMessages}
          isLoadingEarlier={loadingMore}
          renderInputToolbar={(props) => <CustomInputToolbar {...props} />}
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
  const { translate } = useTranslations();

  return (
    <UILibView>
      <MessageText {...props} />
      {currentMessage.translatedText ? (
        <UILibText style={[styles.translatedText, { color: textColor }]}>
          {currentMessage.translatedText}
        </UILibText>
      ) : (
        <UILibText style={[styles.translatedText, { color: textColor }]}>
          {translate("Translating")}...
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
    width: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "column",
    alignItems: "center",
    marginHorizontal: 10,
    padding: 5,
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
  imageMessage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginVertical: 5,
  },
});

export default Chat;
