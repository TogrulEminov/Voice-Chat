"use client";
import { useState, useRef, useEffect } from "react";
import { FaMicrophoneLines } from "react-icons/fa6";
import { FaRegPauseCircle } from "react-icons/fa";
import { useDashboardStore } from "@/utils/dasboardStore";

export default function AudioRecorder({ onRecordingComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const setAsistantAudioUrl = useDashboardStore(
    (state) => state.setAsistantAudioUrl
  );
  const setUserAudioUrl = useDashboardStore((state) => state.setUserAudioUrl);
  const userAudioUrl = useDashboardStore((state) => state.userAudioUrl);

  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    return () => {
      const tracks = audioRef.current?.srcObject?.getTracks();
      tracks?.forEach((track) => track.stop());
      audioRef.current = null;
      mediaRecorderRef.current = null;
    };
  }, []);

  const startRecording = async () => {
    try {
      if (!window.MediaRecorder) {
        alert("Tarayıcınız ses kaydını desteklemiyor.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioRef.current.srcObject = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const url = URL.createObjectURL(blob);

        // İstifadəçi səsi üçün URL təyin edilir
        setUserAudioUrl(url);
        // Asistan səsi sıfırlanır
        setAsistantAudioUrl(null);

        // Səsi üst komponentə ötür
        onRecordingComplete(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      if (error.name === "NotAllowedError") {
        alert("Mikrofon izni verilmedi.");
      } else if (error.name === "NotFoundError") {
        alert("Mikrofon bulunamadı.");
      } else {
        alert("Beklenmeyen bir hata oluştu: " + error.message);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Mikrofonu kapatma
      const tracks = audioRef.current.srcObject?.getTracks();
      tracks?.forEach((track) => track.stop());
      audioRef.current.srcObject = null;
    }
  };

  return (
    <div className="flex flex-col items-center">
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

      {userAudioUrl && (
        <div className="mt-4">
          <audio controls src={userAudioUrl} />
        </div>
      )}

      {/* Mikrofon akışını dinlemek için bir gizli ses öğesi */}
      <audio ref={audioRef} hidden />
    </div>
  );
}
