// src/components/ChatScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
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
  FirestoreError
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '@/app/helpers/firebaseConfig';
import { useRoute, RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  ChatScreen: { recipientId: string };
};

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'ChatScreen'>;

interface ChatMessage {
  _id: string;
  text: string;
  createdAt: Date;
  user: {
    _id: string;
    name: string;
  };
}

const ChatScreen: React.FC = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const { recipientId } = route.params || { recipientId: 'default' };
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const PAGE_SIZE = 10; // Number of messages to load per page

  const getChatRoomId = (userId1: string, userId2: string) => {
    return [userId1, userId2].sort().join('_');
  };

  useEffect(() => {
    const authenticateUser = async () => {
      onAuthStateChanged(auth, async (user: User | null) => {
        if (user) {
          console.log('User already signed in:', user.uid);
          setUserId(user.uid);
        } else {
          try {
            const userCredential = await signInAnonymously(auth);
            console.log('User signed in anonymously:', userCredential.user.uid);
            setUserId(userCredential.user.uid);
          } catch (error) {
            console.error('Error signing in anonymously:', error);
          }
        }
        setLoading(false);
      });
    };

    authenticateUser();

    const fetchInitialMessages = async () => {
      if (!userId) return;
      const chatRoomId = getChatRoomId(userId, recipientId);
      const q = query(
        collection(db, 'chatRooms', chatRoomId, 'messages'),
        orderBy('createdAt', 'desc'),
        limit(PAGE_SIZE)
      );

      const snapshot = await getDocs(q);
      const messagesData = snapshot.docs.map((doc) => {
        const firebaseData = doc.data();
        const data: IMessage = {
          _id: doc.id,
          text: firebaseData.text,
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
          const data: IMessage = {
            _id: doc.id,
            text: firebaseData.text,
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
      collection(db, 'chatRooms', chatRoomId, 'messages'),
      orderBy('createdAt', 'desc'),
      startAfter(lastVisible),
      limit(PAGE_SIZE)
    );

    const snapshot = await getDocs(q);
    const messagesData = snapshot.docs.map((doc) => {
      const firebaseData = doc.data();
      const data: IMessage = {
        _id: doc.id,
        text: firebaseData.text,
        createdAt: firebaseData.createdAt.toDate(),
        user: {
          _id: firebaseData.userId,
          name: firebaseData.userName,
        },
      };
      return data;
    });

    setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    setMessages((prevMessages) => GiftedChat.append(prevMessages, messagesData));
    setLoadingMore(false);
  };

  const handleSend = async (newMessages: IMessage[] = []) => {
    const newMessage = newMessages[0];
    if (newMessage && userId) {
      try {
        const chatRoomId = getChatRoomId(userId, recipientId);
        await addDoc(collection(db, 'chatRooms', chatRoomId, 'messages'), {
          text: newMessage.text,
          createdAt: new Date(),
          userId: userId,
          userName: `User-${userId.substring(0, 6)}`, // Generates a fake username for display
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <GiftedChat
      messages={messages}
      onSend={handleSend}
      user={{
        _id: userId || '',
      }}
      loadEarlier={!loadingMore && !!lastVisible}
      onLoadEarlier={fetchMoreMessages}
      isLoadingEarlier={loadingMore}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;
