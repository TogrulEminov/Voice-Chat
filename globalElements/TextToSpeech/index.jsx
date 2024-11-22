"use client";
import React, { useEffect, useState } from "react";
import { FaPlay } from "react-icons/fa";
import { FaPause } from "react-icons/fa";
const TextToSpeech = ({ text }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState(null);
  useEffect(() => {
    const synth = window.speechSynthesis;
    // Function to filter emojis
    const cleanText = (input) =>
      input.replace(
        /[\u{1F600}-\u{1F6FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/gu,
        ""
      );

    const filteredText = cleanText(text);
    const u = new SpeechSynthesisUtterance(filteredText);
    u.lang = "en-US";
    u.volume = 0.5;
    // Handle voices
    const setVoice = () => {
      const voices = synth.getVoices();
      const femaleVoice = voices.find(
        (voice) => voice.name.includes("Female") || voice.name.includes("en-US")
      );
      if (femaleVoice) u.voice = femaleVoice;
      setUtterance(u);
    };

    if (synth.getVoices().length > 0) {
      setVoice();
    } else {
      synth.addEventListener("voiceschanged", setVoice);
    }

    return () => {
      synth.cancel();
      synth.removeEventListener("voiceschanged", setVoice);
    };
  }, [text]);
  const handlePlay = () => {
    const synth = window.speechSynthesis;
    if (!utterance) return;
    if (synth.speaking && !isPaused) {
      synth.pause();
      setIsPaused(true);
    } else if (isPaused) {
      synth.resume();
      setIsPaused(false);
    } else {
      synth.cancel();
      synth.speak(utterance);
      setIsPaused(false);
    }
  };
  return (
    <button onClick={handlePlay}>{isPaused ? <FaPause /> : <FaPlay />}</button>
  );
};
export default TextToSpeech;
