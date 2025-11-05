import { useEffect, useState, useCallback, useRef } from "react";
import { Loader } from "../Loader/Loader";
import { Messages } from "../Messages/Messages";
import { Controls } from "../Controls/Controls";
import styles from "./Chat.module.css";

export function Chat({
  assistant,
  isActive = false,
  chatId,
  chatMessages,
  onChatMessagesUpdate,
}) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const isInitialMount = useRef(true);

  // Initialize messages when chat changes
  useEffect(() => {
    setMessages(chatMessages);

    if (assistant?.name === "googleai") {
      assistant.createChat(chatMessages);
    }
  }, [chatId]);

  // Update parent only when messages change from user interaction
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    onChatMessagesUpdate(chatId, messages);
  }, [messages]);

  function updateLastMessageContent(content) {
    setMessages((prevMessages) =>
      prevMessages.map((message, index) =>
        index === prevMessages.length - 1
          ? { ...message, content: `${message.content}${content}` }
          : message
      )
    );
  }

  function addMessage(message) {
    setMessages((prevMessages) => [...prevMessages, message]);
  }

  async function handleContentSend(content) {
    if (!assistant) {
      addMessage({
        content: "No AI assistant selected. Please choose an assistant from the dropdown.",
        role: "system",
      });
      return;
    }

    addMessage({ content, role: "user" });
    setIsLoading(true);
    
    try {
      const result = await assistant.chatStream(
        content,
        messages.filter(({ role }) => role !== "system")
      );

      let isFirstChunk = false;
      for await (const chunk of result) {
        if (!isFirstChunk) {
          isFirstChunk = true;
          addMessage({ content: "", role: "assistant" });
          setIsLoading(false);
          setIsStreaming(true);
        }

        updateLastMessageContent(chunk);
      }

      setIsStreaming(false);
    } catch (error) {
      console.error("Chat error:", error);
      
      let errorMessage = "Sorry, I couldn't process your request. Please try again!";
      
      if (error.message?.includes("API key") || error.message?.includes("401")) {
        errorMessage = "API key is missing or invalid. Please check your configuration.";
      } else if (error.message?.includes("quota") || error.message?.includes("429")) {
        errorMessage = "API quota exceeded. Please try again later or use a different assistant.";
      } else if (error.message?.includes("network") || error.message?.includes("fetch")) {
        errorMessage = "Network error. Please check your connection and try again.";
      }

      addMessage({
        content: errorMessage,
        role: "system",
      });
      setIsLoading(false);
      setIsStreaming(false);
    }
  }

  if (!isActive) return null;

  return (
    <>
      {isLoading && <Loader />}

      <div className={styles.Chat}>
        <Messages messages={messages} />
      </div>

      <Controls
        isDisabled={isLoading || isStreaming}
        onSend={handleContentSend}
      />
    </>
  );
}
