import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Image } from "react-native";
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
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';

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

    // // Request permissions for audio recording, camera, and media library
    // (async () => {
    //   const { status: audioStatus } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    //   const { status: cameraStatus } = await Permissions.askAsync(Permissions.CAMERA);
    //   const { status: mediaLibraryStatus } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
      
    //   if (audioStatus !== 'granted' || cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
    //     console.error('Necessary permissions not granted');
    //   }
    // })();
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
    setMessages((prevMessages) =>
      GiftedChat.append(prevMessages, messagesData)
    );
    setLoadingMore(false);
  };

  const handleSend = async (newMessages: IMessage[] = []) => {
    const newMessage = newMessages[0];
    console.log("newMessage", newMessage);
    if (newMessage && userId) {
      try {
        const chatRoomId = getChatRoomId(userId, recipientId);
        await addDoc(collection(db, "chatRooms", chatRoomId, "messages"), {
          text: newMessage.text,
          translatedText: "",
          createdAt: new Date(),
          userId: userId,
          userName: `User-${userId.substring(0, 6)}`,
          audio: newMessage.audio,
          image: newMessage.image,
          video: newMessage.video,
        });
      } catch (error) {
        console.error("Error sending message:", error);
      }
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
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    

    if (uri) {
      const audioBlob = await fetch(uri).then(r => r.blob());
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
    }
  };

  const pickImage = async () => {
    console.log('here')
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });


    console.log('result ', result)
    if (!result.cancelled) {
      const { uri } = result as { uri: string };
      console.log('fuck')
      const response = await fetch(uri);
      console.log('there 1')
      const blob = await response.blob();
      const fileRef = ref(storage, `media/${Date.now()}_${uri.split('/').pop()}`);
      await uploadBytes(fileRef, blob);
      console.log('there')
      const downloadURL = await getDownloadURL(fileRef);

      console.log('ddd ', downloadURL)

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
    }
  };

  const renderInputToolbar = (props: any) => (
    <InputToolbar
      {...props}
      containerStyle={styles.inputToolbar}
      renderActions={() => (
        <Actions
          {...props}
          containerStyle={styles.actions}
          icon={() => (
            <UILibView row>
              <TouchableOpacity onPress={pickImage} style={styles.actionButton}>
                <Ionicons name="image" size={24} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={isRecording ? stopRecording : startRecording}
                style={styles.actionButton}
              >
                <Ionicons
                  name={isRecording ? "stop-circle" : "mic"}
                  size={24}
                  color={isRecording ? colors.error : colors.primary}
                />
              </TouchableOpacity>
            </UILibView>
          )}
        />
      )}
    />
  );

  const renderMessageAudio = (props: any) => {
    return (
      <UILibView style={styles.audioContainer}>
        <TouchableOpacity onPress={() => {}/* Play audio logic */}>
          <Ionicons name="play" size={24} color={colors.primary} />
        </TouchableOpacity>
        <UILibText style={styles.audioText}>Audio message</UILibText>
      </UILibView>
    );
  };

  const renderMessageVideo = (props: any) => {
    return (
      <UILibView style={styles.videoContainer}>
        <TouchableOpacity onPress={() => {}/* Play video logic */}>
          <Image source={{ uri: props.currentMessage.video }} style={styles.videoThumbnail} />
          <Ionicons name="play-circle" size={48} color={colors.primary} style={styles.playIcon} />
        </TouchableOpacity>
      </UILibView>
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
        <UILibText style={styles.headerText}>
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
          renderMessageAudio={renderMessageAudio}
          renderMessageVideo={renderMessageVideo}
          onSend={handleSend}
          user={{
            _id: userId || "",
          }}
          loadEarlier={!loadingMore && !!lastVisible}
          onLoadEarlier={fetchMoreMessages}
          isLoadingEarlier={loadingMore}
          renderInputToolbar={renderInputToolbar}
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
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    marginHorizontal: 5,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bubbleLeft,
    borderRadius: 20,
    padding: 10,
    marginVertical: 5,
  },
  audioText: {
    marginLeft: 10,
    fontFamily: 'marcellus',
    fontSize: 14,
    color: colors.text,
  },
  videoContainer: {
    width: 200,
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 5,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
  },
});

export default Chat