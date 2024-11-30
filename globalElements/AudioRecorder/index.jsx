"use client";
import React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { FaMicrophoneLines } from "react-icons/fa6";
import { FaRegPauseCircle } from "react-icons/fa";
import { useDashboardStore } from "@/utils/dasboardStore";

export default function AudioRecorder({ onRecordingComplete }) {
  const MIN_BLOB_SIZE = 24 * 1024; // 88 KB for ~1 second of audio
  const MAX_RECORDING_DURATION = 60000; // 60 seconds in milliseconds

  const [isRecording, setIsRecording] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);

  const { setAsistantAudioUrl, setUserAudioUrl, userAudioUrl } =
    useDashboardStore((state) => state);

  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const timeoutRef = useRef(null);
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      audioRef.current.srcObject?.getTracks().forEach((track) => track.stop());
    }
    resetState();
  }, []);
  useEffect(() => {
    return () => {
      stopRecording();
      clearInterval(timerRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, [stopRecording]);

  const resetState = () => {
    setIsRecording(false);
    setRecordingTime(0);
    setErrorMessage("");
    clearInterval(timerRef.current);
    clearTimeout(timeoutRef.current);
  };

  const startRecording = async () => {
    try {
      setErrorMessage(""); // Reset error message
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioRef.current.srcObject = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) =>
        audioChunksRef.current.push(event.data);

      mediaRecorder.onstop = () => handleRecordingStop();

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Auto-stop recording after MAX_RECORDING_DURATION
      timeoutRef.current = setTimeout(() => {
        stopRecording();
        setErrorMessage("Ses kaydı 1 dakikayı geçemez.");
      }, MAX_RECORDING_DURATION);
    } catch (error) {
      const message =
        error.name === "NotAllowedError"
          ? "Mikrofon izni verilmedi."
          : error.name === "NotFoundError"
          ? "Mikrofon bulunamadı."
          : `Hata: ${error.message}`;
      setErrorMessage(message);
    }
  };

  const handleRecordingStop = () => {
    const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
    console.log(blob.size);

    if (blob.size < MIN_BLOB_SIZE) {
      setErrorMessage("Ses kaydı en az 1 saniye olmalıdır.");
      return;
    }

    const url = URL.createObjectURL(blob);
    setUserAudioUrl(url);
    setAsistantAudioUrl(null);
    onRecordingComplete(blob);
    resetState();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-end justify-center">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-6 py-6 mt-4 rounded-full font-semibold shadow-lg transition duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
            isRecording
              ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
              : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
          } text-white`}
        >
          {isRecording ? (
            <FaRegPauseCircle className="w-14 h-14" />
          ) : (
            <FaMicrophoneLines className="w-14 h-14" />
          )}
        </button>
        {recordingTime > 0 && (
          <span className="text-red-700 ml-4">{formatTime(recordingTime)}</span>
        )}
      </div>

      {isRecording && (
        <div className="mt-4 p-4 bg-gray-200 rounded-lg shadow-lg max-w-xs text-center">
          <p className="text-sm font-semibold">Ses kaydınız başlatıldı...</p>
          <div className="mt-2 text-xs text-gray-500">
            Kaydınız devam ediyor...
          </div>
        </div>
      )}

      {userAudioUrl && !isRecording && (
        <div className="mt-4 p-4 bg-green-200 rounded-lg shadow-lg max-w-xs text-center">
          <p className="text-sm font-semibold">Ses kaydınız tamamlandı!</p>
          <audio controls src={userAudioUrl} className="mt-2" />
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 text-red-600 font-semibold">{errorMessage}</div>
      )}

      {/* Hidden audio element for microphone stream */}
      <audio ref={audioRef} hidden />
    </div>
  );
}
