"use client";
import { useState, useRef, useEffect } from "react";
import { FaMicrophoneLines } from "react-icons/fa6";
import { FaRegPauseCircle } from "react-icons/fa";
import { useDashboardStore } from "@/utils/dasboardStore";

export default function AudioRecorder({ onRecordingComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRecordingComplete, setIsRecordingComplete] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0); // Kaydın süresi

  const { setAsistantAudioUrl, setUserAudioUrl, userAudioUrl } =
    useDashboardStore((state) => state);
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimeoutRef = useRef(null); // Zamanlayıcıyı saklamak için referans
  const timerRef = useRef(null); // Timer referansı
  console.log(timerRef, "timerRef");
  console.log(recordingTime, "recordingTime");

  useEffect(() => {
    // Temizlik işlemi: Timer'ı temizle ve akışı durdur
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current); // Zamanlayıcıyı temizle
      }
      audioRef?.current?.srcObject
        ?.getTracks()
        .forEach((track) => track.stop());
    };
  }, []);

  const startRecording = async () => {
    try {
      setErrorMessage(""); // Her yeni kayda başlarken hatayı sıfırla

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioRef.current.srcObject = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) =>
        audioChunksRef.current.push(event.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const url = URL.createObjectURL(blob);

        setUserAudioUrl(url);
        setAsistantAudioUrl(null);
        onRecordingComplete(blob);
        setIsRecordingComplete(true); // Kayıt tamamlandığında durumu güncelle
        clearInterval(timerRef.current); // Timer'ı durdur
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0); // Süreyi sıfırla
      setIsRecordingComplete(false); // Kayıt başlamadan önce tamamlama durumunu sıfırla

      // Kayıt süresi için bir interval başlat
      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1); // Her saniyede bir süreyi artır
      }, 1000);

      // 1 dakika sonra kaydı durdur
      recordingTimeoutRef.current = setTimeout(() => {
        stopRecording();
        setErrorMessage("Ses kaydı 1 dakikayı geçemez.");
      }, 60000);
    } catch (error) {
      const message =
        error.name === "NotAllowedError"
          ? "Mikrofon izni verilmedi."
          : error.name === "NotFoundError"
          ? "Mikrofon bulunamadı."
          : `Hata: ${error.message}`;
      alert(message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      audioRef.current.srcObject?.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current); // Zamanlayıcıyı temizle
    }
  };

  // Saniyeyi '00:05' formatında göstermek için yardımcı fonksiyon
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-end justify-center ">
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
        {recordingTime ? (
          <span className="text-red-700">{formatTime(recordingTime)}</span>
        ) : (
          ""
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

      {isRecordingComplete && userAudioUrl && (
        <div className="mt-4 p-4 bg-green-200 rounded-lg shadow-lg max-w-xs text-center">
          <p className="text-sm font-semibold">Ses kaydınız tamamlandı!</p>
          <audio controls src={userAudioUrl} className="mt-2" />
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 text-red-600 font-semibold">{errorMessage}</div>
      )}

      {/* Mikrofon akışını dinlemek için bir gizli ses öğesi */}
      <audio ref={audioRef} hidden />
    </div>
  );
}
