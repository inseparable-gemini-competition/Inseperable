import React, { useState, useEffect } from "react";
import { View, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import {
  GiftedChat,
  IMessage,
  MessageText,
  Bubble,
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
import { db } from "@/app/helpers/firebaseConfig";
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

type RootStackParamList = {
  ChatScreen: { recipientId: string };
};

type ChatScreenRouteProp = RouteProp<RootStackParamList, "ChatScreen">;

interface ChatMessage extends IMessage {
  translatedText?: string;
}

const ChatScreen: React.FC = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const { recipientId, itemName } = route.params || {
    recipientId: "2iecagcxcgYrnOj8AaiZEYZfvrf2",
  };
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const PAGE_SIZE = 10;

  const { isRTL } = useTranslations();

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
      };
      return data;
    });

    setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    setMessages((prevMessages) =>
      GiftedChat.append(prevMessages, messagesData)
    );
    setLoadingMore(false);
  };

  const handleSend = async (newMessages: IMessage[] = []) => {
    const newMessage = newMessages[0];
    if (newMessage && userId) {
      try {
        const chatRoomId = getChatRoomId(userId, recipientId);
        await addDoc(collection(db, "chatRooms", chatRoomId, "messages"), {
          text: newMessage.text,
          translatedText: "",
          createdAt: new Date(),
          userId: userId,
          userName: `User-${userId.substring(0, 6)}`,
        });
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
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
        <UILibText style={{ top: 38, fontFamily: "marcellus", fontSize: 22 }}>
          Chat about {itemName}
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
            <CustomMessageText
              {...(props as any)}
              currentUserId={userId || ""}
            />
          )}
          onSend={handleSend}
          user={{
            _id: userId || "",
          }}
          loadEarlier={!loadingMore && !!lastVisible}
          onLoadEarlier={fetchMoreMessages}
          isLoadingEarlier={loadingMore}
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
  },
  backButton: {
    paddingStart: 5,
    marginTop: 40,
    marginEnd: 10,
  },
  translatedText: {
    fontSize: 12,
    marginTop: 5,
    marginStart: 10,
    fontFamily: "marcellus",
  },
});

export default ChatScreen;
