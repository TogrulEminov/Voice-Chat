"use client";

import React, { useEffect, useState } from "react";
import { SiGoogleassistant } from "react-icons/si";
import { RiChatHistoryLine } from "react-icons/ri";
import { useDashboardStore } from "@/utils/dasboardStore";
import TextToSpeech from "../TextToSpeech";

const ConversationHistory = () => {
  const { refresh, feedback, transcribedText } = useDashboardStore();
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!refresh) return;
    setConversations((prevConversations) => [
      ...prevConversations,
      {
        userInput: transcribedText,
        assistantResponse: feedback,
        createdAt: new Date().toUTCString(),
      },
    ]);
  }, [refresh, feedback, transcribedText]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/conversations/read", {
          method: "GET",
          cache: "no-store",
        });
        if (!response.ok) {
          const { message } = await response.json();
          setError(message || "Konuşmalar alınırken bir hata oluştu.");
          return;
        }

        const data = await response.json();
        if (data) {
          setConversations(data);
        }
      } catch (err) {
        setError("Sunucuya bağlanırken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }
  if (loading) {
    return <p className="text-red-black">loading....</p>;
  }

  return (
    <div className="flex flex-col flex-1">
      <h2 className="text-2xl py-2 bg-black  px-6 flex items-center justify-center gap-2 font-semibold text-gray-200 dark:text-gray-100 mb-4">
        <RiChatHistoryLine />
        Conversation History
      </h2>
      {conversations.length === 0 && (
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
          Henüz bir konuşma yok.
        </p>
      )}
      {conversations.length > 0 && (
        <div className="space-y-4  max-h-[80vh] h-full   p-10  bg-white overflow-y-scroll">
          {conversations?.map((conv) => (
            <div
              key={conv.createdAt}
              className="flex flex-col space-y-2 max-h-[700px]"
            >
              {/* Kullanıcı Mesajı */}
              <div className="self-end  max-w-[70%] bg-blue-500  rounded-tl-[40px] rounded-bl-[40px] rounded-br-[40px] text-black p-4 rounded-lg shadow-md">
                <p className="text-base text-white">{conv.userInput}</p>
                <p className="text-xs text-gray-200 mt-1">
                  {new Date(conv.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Asistan Mesajı */}
              <div className="self-start max-w-[70%] relative  bg-[#EEEEEE] dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-4   rounded-tl-[40px] rounded-bt-[40px] rounded-br-[40px] rounded-tr-[40px] shadow-md">
                <p className="text-base">{conv.assistantResponse}</p>
                <p className="text-xs mb-2 text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(conv.createdAt).toLocaleString()}
                </p>
                <TextToSpeech text={conv.assistantResponse} />
                <div className="absolute -bottom-5 -left-6">
                  <SiGoogleassistant className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversationHistory;
