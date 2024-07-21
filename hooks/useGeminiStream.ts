import { useState, useCallback } from "react";
import { useMutation, UseMutationResult } from "react-query";
import { fetch } from "react-native-fetch-api";

const API_KEY = "AIzaSyDTiF7YjBUWM0l0nKpzicv9R6kReU3dn8Q";
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${API_KEY}`;
interface MessagePart {
  text: string;
}

interface Message {
  role: "user" | "model";
  parts: MessagePart[];
}

interface FetchResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    }[];
  }[];
}

const fetchContent = async (messages: Message[]): Promise<string> => {
  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: messages,
    }),
    reactNative: { textStreaming: true },
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Failed to get reader from response body");
  }

  const decoder = new TextDecoder("utf-8");
  let done = false;
  let result = "";

  while (!done) {
    const { value, done: streamDone } = await reader.read();
    done = streamDone;
    result += decoder.decode(value, { stream: true });
  }

  return result;
};

interface UseGenerateContentResult {
  messages: Message[];
  sendMessage: (userText: string) => void;
  isLoading: boolean;
  error: unknown;
  lastResponse: string;
}

export const useGenerateContent = (
  initialMessage: string,
  onSuccess?: (data: string) => void,
): UseGenerateContentResult => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "user", parts: [{ text: initialMessage }] },
  ]);
  const [lastResponse, setLastResponse] = useState<string>("");

  const mutation: UseMutationResult<string, unknown, Message[], unknown> =
    useMutation((messages: Message[]) => fetchContent(messages), {
      onSuccess: (data) => {
        const parsedResult: FetchResponse[] = JSON.parse(data);
        const answer = parsedResult
          .map((item) =>
            item.candidates
              .map((candidate) =>
                candidate.content.parts.map((part) => part.text).join(" ")
              )
              .join("")
          )
          .join("");
        setLastResponse(answer);
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "model", parts: [{ text: answer }] },
        ]);
        onSuccess?.(answer);
      },
      onError: (error) => {
        console.error("Error fetching content:", error);
      },
    });

  const sendMessage = useCallback(
    (userText: string) => {
      const newMessages: Message[] = [
        ...messages,
        { role: "user", parts: [{ text: userText }] },
      ];
      setMessages(newMessages);
      mutation.mutate(newMessages);
    },
    [messages, mutation]
  );

  return {
    messages,
    sendMessage,
    isLoading: mutation.isLoading,
    error: mutation.error,
    lastResponse,
  };
};
