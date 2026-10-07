import { useEffect, useRef } from "react";

export default function useNoteSound(volume) {
  const audioContextRef = useRef(null);
  const volumeRef = useRef(volume);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  const prepareAudio = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;

    const context = audioContextRef.current || new AudioContext();
    audioContextRef.current = context;
    if (context.state === "suspended") context.resume();
    return context;
  };

  const playNote = (row) => {
    const context = prepareAudio();
    if (!context) return;

    const midi = 108 - row;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2 * volumeRef.current, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.35);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  };

  return { playNote, prepareAudio };
}
