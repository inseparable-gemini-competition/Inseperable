import React, { useState, useEffect } from "react";
import { View, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import { GiftedChat, IMessage, MessageText, Bubble } from "react-native-gifted-chat";
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
import { useSignIn } from "@/hooks/useSignIn";
import {
  View as UILibView,
  Text as UILibText,
  LoaderScreen,
} from "react-native-ui-lib";
import { colors } from "@/app/theme";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons

type RootStackParamList = {
  ChatScreen: { recipientId: string };
};

type ChatScreenRouteProp = RouteProp<RootStackParamList, "ChatScreen">;

interface ChatMessage extends IMessage {
  translatedText?: string;
}

const ChatScreen: React.FC = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const { recipientId } = route.params || {
    recipientId: "2iecagcxcgYrnOj8AaiZEYZfvrf2",
  };
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const PAGE_SIZE = 10; // Number of messages to load per page

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

      // Subscribe to real-time updates
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
          translatedText: "", // Initialize translated text
          createdAt: new Date(),
          userId: userId,
          userName: `User-${userId.substring(0, 6)}`, // Generates a fake username for display
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
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <UILibView flex>
        <GiftedChat
          messages={messages}
          renderBubble={(props) => <Bubble {...props} wrapperStyle={{ left: { backgroundColor: colors.warning } }} />} 
          renderMessageText={(props) => <CustomMessageText {...props} />}
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

const CustomMessageText = (props: { currentMessage: ChatMessage }) => {
  const { currentMessage } = props;

  return (
    <UILibView>
      <MessageText {...props} />
      {currentMessage.translatedText ? (
        <UILibText style={styles.translatedText}>
          {currentMessage.translatedText}
        </UILibText>
      ) : (
        <UILibText style={styles.translatedText}>Translating...</UILibText>
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
    paddingVertical: 30,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: colors.white,
    fontSize: 18,
    fontFamily: "marcellus",
  },
  translatedText: {
    fontSize: 12,
    marginTop: 5,
    marginLeft: 10,
    color: colors.white,
    fontFamily: "marcellus",
  },
});

export default ChatScreen;
