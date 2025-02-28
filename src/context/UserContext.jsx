import React, { createContext, useEffect, useState } from "react";
import run from "../gemini";

export const Datacontext = createContext();

function UserContext({ children }) {
  let [speaking, setSpeaking] = useState(false);
  let [prompt, setPrompt] = useState("listening...");
  let [response, setResponse] = useState(false);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const loadVoices = () => {
      let availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  function speak(text) {
    if (!text) return;

    console.log("Shifra says:", text);

    window.speechSynthesis.cancel(); // Stop any previous speech
    let text_speak = new SpeechSynthesisUtterance(text);

    // Select a proper female voice
    let selectedVoice =
      voices.find((voice) => voice.name.includes("Google UK English Female")) ||
      voices.find((voice) => voice.name.includes("Google US English Female")) ||
      voices.find((voice) => voice.name.includes("Microsoft Zira")) ||
      voices.find((voice) => voice.lang.includes("en") && voice.name.includes("Female")) ||
      voices[0];

    text_speak.voice = selectedVoice;
    text_speak.volume = 1;
    text_speak.rate = 1;
    text_speak.pitch = 1;
    text_speak.lang = "en-GB";

    text_speak.onstart = () => {
      console.log("Shifra is speaking...");
    };

    text_speak.onend = () => {
      console.log("Finished speaking.");
      setTimeout(() => {
        setSpeaking(false); // ✅ Only update state AFTER speech is done
        setResponse(false);  // ✅ Reset response state to show button
      }, 500); // Small delay to ensure smooth transition
    };

    text_speak.onerror = (e) => console.error("Speech Synthesis Error:", e);

    window.speechSynthesis.speak(text_speak);
}

  

  async function aiResponse(prompt) {
    console.log("User said:", prompt);
    try {
      let text = await run(prompt);
      let cleanText = text.replace(/\*/g, "").replace(/google/gi, "Kashish");
      setPrompt(cleanText);
      speak(cleanText);
      setResponse(true);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      speak("Sorry, I couldn't process that.");
    }
  }

  let speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!speechRecognition) {
    console.error("Speech Recognition not supported in this browser.");
  }

  let recognition = new speechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-GB";

  recognition.onstart = () => {
    console.log("Listening... 🎤 Speak now.");
  };

  recognition.onresult = (event) => {
    let transcript = event.results[0][0].transcript;
    setPrompt(transcript);
    recognition.stop();
    takeCommand(transcript.toLowerCase());
  };

  recognition.onerror = (event) => {
    console.error("Speech Recognition Error:", event.error);
  };

  function takeCommand(command) {
    if (command.includes("open") && command.includes("youtube")) {
      window.open("https://www.youtube.com/", "_blank");
      speak("Opening YouTube");
      setPrompt("Opening YouTube...");
      setResponse(true);
      setTimeout(() => {
        setSpeaking(false);
      }, 5000);
    } else if (command.includes("open") && command.includes("google")) {
      window.open("https://www.google.com/", "_blank");
      speak("Opening Google");
      setPrompt("Opening Google...");
      setResponse(true);
      setTimeout(() => {
        setSpeaking(false);
      }, 5000);
    } else if (command.includes("time")) {
      let time = new Date().toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "numeric",
      });
      speak("The time is " + time);
      setPrompt(time); // ✅ Now the time will display on screen
      setResponse(true); // ✅ Trigger speaking animation
      setTimeout(() => {
        setSpeaking(false);
      }, 5000);
    } else if (command.includes("date")) {
      let date = new Date().toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      speak("Today's date is " + date);
      setPrompt(date); // ✅ Now the date will display on screen
      setResponse(true); // ✅ Trigger speaking animation
      setTimeout(() => {
        setSpeaking(false);
      }, 5000);
    } else {
      aiResponse(command); // ✅ Handle normal AI responses
    }
  }
  

  let value = {
    recognition,
    speaking,
    setSpeaking,
    speak,
    aiResponse,
    prompt,
    setPrompt,
    response,
    setResponse,
  };

  return <Datacontext.Provider value={value}>{children}</Datacontext.Provider>;
}

export default UserContext;
