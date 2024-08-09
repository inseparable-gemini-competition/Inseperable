import React, { useState, useEffect, useCallback } from "react";
import {
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
  Bubble,
  Send,
  Actions,
  MessageText,
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
import { View, Text } from "react-native-ui-lib";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from "expo-image-picker";
import useStore from "@/app/store";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { colors } from "@/app/theme";
import { CustomText } from "@/app/components/CustomText";


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
  const { translate } = useTranslations();
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
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
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

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
            userName: userData?.email ? userData.email.split('@')[0] : 'Unknown',
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
    [userId, recipientId, userData]
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
                  const fileRef = ref(storage, `media/${Date.now()}_${uri.split("/").pop()}`);
                  await uploadBytes(fileRef, blob);
                  const downloadURL = await getDownloadURL(fileRef);

                  const newMediaMessage: ChatMessage = {
                    _id: Date.now().toString(),
                    createdAt: new Date(),
                    user: {
                      _id: userId,
                      name: userData?.email ? userData.email.split('@')[0] : 'Unknown',
                    },
                    image: downloadURL,
                  };

                  handleSend([newMediaMessage]);
                } catch (error) {
                  console.error("Error picking or uploading image:", error);
                  Alert.alert("Error", `Failed to upload image: ${error.message}`);
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

  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: colors.bubbleLeft,
            marginLeft: 10,
          },
          right: {
            backgroundColor: colors.bubbleRight,
            marginRight: 10,
          },
        }}
        textStyle={{
          left: {
            color: colors.bubbleLeftText,
          },
          right: {
            color: colors.bubbleRightText,
          },
        }}
      />
    );
  };

  const renderMessageText = (props: any) => {
    const { currentMessage } = props;
    return (
      <View>
        <MessageText {...props} />
        {currentMessage.translatedText && (
          <CustomText style={[
            styles.translatedText,
            { color: currentMessage.user._id === userId ? colors.translatedTextDark : colors.translatedTextLight }
          ]}>
            {currentMessage.translatedText}
          </CustomText>
        )}
      </View>
    );
  };

  const renderSend = (props: any) => {
    return (
      <Send {...props}>
        <View style={styles.sendButton}>
          <Ionicons name="send" size={24} color={colors.primary} />
        </View>
      </Send>
    );
  };

  const renderActions = (props: any) => {
    if (imageUploading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }
    return (
      <Actions
        {...props}
        containerStyle={styles.actionButton}
        icon={() => (
          <Ionicons name="image" size={24} color={colors.primary} />
        )}
        onPressActionButton={pickImage}
      />
    );
  };

  return (
    <LinearGradient
      colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons
              name={isRTL ? "chevron-forward" : "chevron-back"}
              size={24}
              color={colors.white}
            />
          </TouchableOpacity>
          <CustomText style={styles.headerText}>
            {translate("chatAbout")} {itemName}
          </CustomText>
        </View>
        <GiftedChat
          messages={messages}
          onSend={handleSend}
          user={{
            _id: userId,
          }}
          renderBubble={renderBubble}
          renderMessageText={renderMessageText}
          renderSend={renderSend}
          renderActions={renderActions}
          placeholder={translate("typeMessage")}
          alwaysShowSend
          scrollToBottom
          infiniteScroll
          loadEarlier={!loadingMore && !!lastVisible}
          onLoadEarlier={fetchMoreMessages}
          isLoadingEarlier={loadingMore}
          renderAvatarOnTop
          renderUsernameOnMessage
          showUserAvatar
          showAvatarForEveryMessage
          renderMessageImage={(props) => (
            <Image
              source={{ uri: props.currentMessage.image }}
              style={styles.messageImage}
            />
          )}
          messagesContainerStyle={styles.messagesContainer}
          textInputStyle={styles.textInput}
          bottomOffset={Platform.OS === 'ios' ? 30 : 0}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: colors.headerBackground,
  },
  backButton: {
    padding: 5,
  },
  headerText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  messagesContainer: {
    paddingBottom: 10,
  },
  sendButton: {
    marginRight: 10,
    marginBottom: 5,
  },
  actionButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    marginBottom: 5,
  },
  loadingContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    marginBottom: 5,
  },
  textInput: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.secondary,
    marginHorizontal: 10,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 8,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 13,
    margin: 3,
    resizeMode: 'cover',
  },
  translatedText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5,
    marginLeft: 10,
    marginRight: 10,
  },
});
export default Chat;

