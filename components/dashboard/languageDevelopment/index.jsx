"use client";
// Bileşenlerin sadece istemci tarafında çalışacak şekilde düzenlenmesi
import dynamic from "next/dynamic";
import { useDashboardStore } from "@/utils/dasboardStore";
import React, { useEffect } from "react";
const AudioRecorder = dynamic(() => import("@/globalElements/AudioRecorder"), {
  ssr: false,
});
const LanguageDevelopment = () => {
  const feedback = useDashboardStore((state) => state.feedback);
  const setFeedback = useDashboardStore((state) => state.setFeedback);
  const toggleRefresh = useDashboardStore((state) => state.toggleRefresh);
  const asistantAudioUrl = useDashboardStore((state) => state.asistantAudioUrl);
  const transcribedText = useDashboardStore((state) => state.transcribedText);
  const setAsistantAudioUrl = useDashboardStore(
    (state) => state.setAsistantAudioUrl
  );
  const setTranscribedText = useDashboardStore(
    (state) => state.setTranscribedText
  );

  const handleRecordingComplete = async (blob) => {
    const resetStates = () => {
      setFeedback("");
      setTranscribedText("");
      setAsistantAudioUrl((prevUrl) => {
        if (prevUrl) URL.revokeObjectURL(prevUrl);
        return null;
      });
    };

    try {
      if (!blob) {
        throw new Error("Ses kaydı alınamadı");
      }

      // Step 1: Process audio and get transcription
      const formData = new FormData();
      formData.append("audio", blob, "audio.wav");
      const audioResponse = await fetch("/api/process-audio/create", {
        method: "POST",
        body: formData,
      });

      if (!audioResponse.ok) {
        const errorData = await audioResponse.json();
        throw new Error(errorData.error || "Ses işleme hatası");
      }

      const audioData = await audioResponse.json();
      setTranscribedText(audioData.transcribedText);

      // Step 2: Process transcribed text
      const textResponse = await fetch("/api/process-text/create", {
        method: "POST",
        body: JSON.stringify({ text: audioData.transcribedText }),
      });

      if (!textResponse.ok) {
        const textError = await textResponse.json();
        throw new Error(textError.message || "Metin işleme hatası");
      }

      const processedText = await textResponse.json();
      setFeedback(processedText.text);

      // Step 3: Convert response to speech
      const ttsResponse = await fetch("/api/text-to-speech/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: processedText.assistantMessage,
        }),
      });

      if (!ttsResponse.ok) {
        const ttsError = await ttsResponse.json();
        throw new Error(ttsError.message || "Ses dönüştürme hatası");
      }

      const audioBlob = await ttsResponse.blob();
      const newUrl = URL.createObjectURL(audioBlob);
      setAsistantAudioUrl(newUrl);

      // Update conversation history
      toggleRefresh();
    } catch (error) {
      console.error("İşlem hatası:", error);
      resetStates();
      setFeedback(error.message || "Beklenmeyen bir hata oluştu");
    }
  };

  useEffect(() => {
    let audio;
    const playAudio = async () => {
      try {
        audio = new Audio(asistantAudioUrl);
        await audio.play();
      } catch (error) {
        console.error("Ses oynatılamadı:", error);
      }
    };

    if (asistantAudioUrl) {
      playAudio();
    }

    return () => {
      audio?.pause();
    };
  }, [asistantAudioUrl]);
  return (
    <div className="bg-[#F4F4F4] h-full dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full flex-shrink-0 lg:w-[400px] transition duration-200">
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
        İngilizce Dil Geliştirme
      </h1>
      <AudioRecorder onRecordingComplete={handleRecordingComplete} />
      {transcribedText && (
        <div className="mt-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Senin Metnin:
          </h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {transcribedText}
          </p>
        </div>
      )}
      {feedback && (
        <div className="mt-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Geri Bildirim:
          </h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {feedback}
          </p>
        </div>
      )}
    </div>
  );
};

export default LanguageDevelopment;
