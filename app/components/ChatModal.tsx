import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Animated,
  Platform,
} from "react-native";
import {
  GiftedChat,
  IMessage,
  Send,
  Bubble,
  BubbleProps,
  SendProps,
} from "react-native-gifted-chat";
import { StackScreenProps } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { useGenerateContent } from "@/hooks";
import { CustomText } from "@/app/components/CustomText";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/app/theme";
import { convertMarkdownToPlainText } from "@/app/helpers/markdown";

type RootStackParamList = {
  ChatScreenModal: { promptType: string; subject: string };
  TripRecommendationModal: undefined;
};

type ChatScreenModalProps = StackScreenProps<
  RootStackParamList,
  "ChatScreenModal"
>;

interface StylesProps {
  container: ViewStyle;
  header: ViewStyle;
  backButton: ViewStyle;
  title: TextStyle;
  messagesContainer: ViewStyle;
  textInput: TextStyle;
  sendContainer: ViewStyle;
  sendButtonText: TextStyle;
  userBubble: ViewStyle;
  aiBubble: ViewStyle;
  userBubbleText: TextStyle;
  aiBubbleText: TextStyle;
  sendIconRTL: TextStyle;
}

const HEADER_HEIGHT = 60;

const ChatScreenModal: React.FC<ChatScreenModalProps> = ({
  navigation,
  route,
}) => {
  const { promptType, subject } = route.params;
  const { translate, isRTL } = useTranslations();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { sendMessage } = useGenerateContent({
    promptType: promptType,
    inputData: { subject, chatHistory: JSON.stringify(messages) },
    onSuccess: (result: string) => {
      const aiMessage: IMessage = {
        _id: Date.now().toString(),
        text: convertMarkdownToPlainText(result),
        createdAt: new Date(),
        user: {
          _id: 2,
          name: "AI Assistant",
        },
      };
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [aiMessage])
      );
      setIsTyping(false);
    },
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, newMessages)
      );
      setIsTyping(true);
      sendMessage(newMessages[0].text);
    },
    [sendMessage]
  );

  const renderSend = (props: SendProps<IMessage>) => {
    return (
      <Send {...props} containerStyle={styles.sendContainer}>
        <Ionicons name="send" size={20} style={[isRTL && styles.sendIconRTL]} />
      </Send>
    );
  };

  const renderBubble = (props: BubbleProps<IMessage>) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: styles.aiBubble,
          right: styles.userBubble,
        }}
        textStyle={{
          left: styles.aiBubbleText,
          right: styles.userBubbleText,
        }}
      />
    );
  };

  const fadeInDownStyle = {
    opacity: fadeAnim,
    transform: [
      {
        translateY: fadeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-50, 0],
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
        style={styles.container}
      >
        <Animated.View style={[styles.header, fadeInDownStyle]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons
              name={isRTL ? "arrow-forward" : "arrow-back"}
              size={24}
              color={colors.white}
            />
          </TouchableOpacity>
          <CustomText style={styles.title}>
            {translate("chatWithAI")}
          </CustomText>
        </Animated.View>

        <GiftedChat
          messages={messages}
          onSend={onSend}
          user={{
            _id: 1,
          }}
          renderSend={renderSend}
          renderBubble={renderBubble}
          placeholder={translate("askQuestion")}
          isTyping={isTyping}
          renderAvatar={null}
          alwaysShowSend
          scrollToBottom
          renderUsernameOnMessage
          textInputProps={{
            multiline: true,
          }}
          messagesContainerStyle={styles.messagesContainer}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create<StylesProps>({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: colors.headerBackground,
    height: HEADER_HEIGHT,
    paddingHorizontal: 15,
    paddingTop: Platform.OS === "ios" ? 20 : 0,
  },
  backButton: {
    padding: 10,
  },
  title: {
    color: colors.white,
    fontSize: 18,
    marginLeft: 15,
  },
  messagesContainer: {
    backgroundColor: "transparent",
  },
  textInput: {
    fontFamily: "marcellus",
    color: colors.dark,
    backgroundColor: colors.white,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  sendIconRTL: {
    transform: [{ scaleX: -1 }],
  },
  sendContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  sendButtonText: {
    color: colors.primary,
  },
  userBubble: {
    backgroundColor: colors.bubbleRight,
    borderBottomRightRadius: 0,
  },
  aiBubble: {
    backgroundColor: colors.bubbleLeft,
    borderBottomLeftRadius: 0,
  },
  userBubbleText: {
    color: colors.bubbleRightText,
  },
  aiBubbleText: {
    color: colors.black,
  },
});

export default ChatScreenModal;
