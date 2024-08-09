import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { colors } from "@/app/theme";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { useGenerateContent } from "@/hooks";

type RootStackParamList = {
  ChatScreenModal: { placeName: string };
  TripRecommendationModal: undefined;
};

type ChatScreenModalProps = StackScreenProps<RootStackParamList, 'ChatScreenModal'>;

interface ChatMessage {
  text: string;
  isUser: boolean;
}

const ChatScreenModal: React.FC<ChatScreenModalProps> = ({ navigation, route }) => {
  const { placeName } = route.params;
  const { translate } = useTranslations();
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");

  const { sendMessage, isLoading } = useGenerateContent({
    promptType: "placeQuestion",
    inputData: { place: placeName, chatHistory: JSON.stringify(chatHistory) },
    onSuccess: (result) => {
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { text: inputText, isUser: true },
        { text: result, isUser: false },
      ]);
      setInputText("");
    },
  });

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(inputText);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>{translate("back")}</Text>
      </TouchableOpacity>

      <ScrollView style={styles.chatContainer}>
        {chatHistory.map((chat, index) => (
          <View
            key={index}
            style={[
              styles.chatBubble,
              chat.isUser ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text style={styles.chatText}>{chat.text}</Text>
          </View>
        ))}
        {isLoading && (
          <ActivityIndicator
            color={colors.primary}
            style={styles.loadingResponse}
          />
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={translate("askQuestion")}
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>{translate("send")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  closeButton: {
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  closeButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontFamily: "marcellus",
  },
  chatContainer: {
    flex: 1,
    marginBottom: 20,
  },
  chatBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: "80%",
  },
  userBubble: {
    backgroundColor: colors.secondary,
    alignSelf: "flex-end",
  },
  aiBubble: {
    backgroundColor: colors.primary,
    alignSelf: "flex-start",
  },
  chatText: {
    color: colors.white,
    fontFamily: "marcellus",
  },
  loadingResponse: {
    marginVertical: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.primary,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderColor: colors.primary,
    borderWidth: 1,
    marginRight: 10,
    fontFamily: "marcellus",
  },
  sendButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 10,
  },
  sendButtonText: {
    color: colors.white,
    fontFamily: "marcellus",
  },
});

export default ChatScreenModal;
