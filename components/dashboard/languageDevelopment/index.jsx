"use client";
// Bileşenlerin sadece istemci tarafında çalışacak şekilde düzenlenmesi
import dynamic from "next/dynamic";
import { useDashboardStore } from "@/utils/dasboardStore";
import React, { useEffect } from "react";
import Image from "next/image";
const AudioRecorder = dynamic(() => import("@/globalElements/AudioRecorder"), {
  ssr: false,
});
const LanguageDevelopment = () => {
  const {
    feedback,
    setFeedback,
    toggleRefresh,
    asistantAudioUrl,
    setAsistantAudioUrl,
    transcribedText,
    setTranscribedText,
  } = useDashboardStore((state) => state);

  const handleRecordingComplete = async (blob) => {
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

      if (!audioResponse.ok)
        throw new Error(
          (await audioResponse.json()).error || "Ses işleme hatası"
        );

      const { transcribedText } = await audioResponse.json();
      setTranscribedText(transcribedText);

      // Step 2: Process transcribed text
      const textRes = await fetch("/api/process-text/create", {
        method: "POST",
        body: JSON.stringify({ text: transcribedText }),
      });

      if (!textRes.ok)
        throw new Error(
          (await textRes.json()).message || "Metin işleme hatası"
        );

      const { assistantMessage } = await textRes.json();
      setFeedback(assistantMessage);

      // Step 3: Convert response to speech
      const ttsRes = await fetch("/api/text-to-speech/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: assistantMessage }),
      });
      if (!ttsRes.ok)
        throw new Error(
          (await ttsRes.json()).message || "Ses dönüştürme hatası"
        );

      setAsistantAudioUrl(URL.createObjectURL(await ttsRes.blob()));
      toggleRefresh();
    } catch (error) {
      console.error("İşlem hatası:", error);
      setFeedback(error.message || "Beklenmeyen bir hata oluştu");
      setAsistantAudioUrl(null);
      setTranscribedText("");
    }
  };
  useEffect(() => {
    if (asistantAudioUrl) {
      const audio = new Audio(asistantAudioUrl);
      audio.play();
      return () => audio.pause();
    }
  }, [asistantAudioUrl]);
  return (
    <>
      <div className="flex  m-4">
        <div className="bg-[#F4F4F4] h-full dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full flex-grow-0 flex-shrink-0 basis-[70%] transition duration-200">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
            İngilizce Dil Geliştirme
          </h1>

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

        <div className="flex-1">
          <div className="flex items-center flex-col ">
            <Image
              src="/images/person.jpeg"
              alt="person"
              width={200}
              height={200}
            />
            <AudioRecorder onRecordingComplete={handleRecordingComplete} />
          </div>
        </div>
      </div>
    </>
  );
};

export default LanguageDevelopment;
