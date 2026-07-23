import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionConstructor = new () => SpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const isSafari = () => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /Safari/i.test(ua) && !/Chrome|Chromium|CriOS|Edg|OPR|Firefox/i.test(ua);
};

/** Safari requires webkitSpeechRecognition; prefer it on WebKit browsers. */
export const getSpeechRecognitionConstructor = (): SpeechRecognitionConstructor | null => {
  if (typeof window === "undefined") return null;

  if (typeof window.webkitSpeechRecognition !== "undefined") {
    console.log("[Speech] Using webkitSpeechRecognition");
    return window.webkitSpeechRecognition;
  }

  if (typeof window.SpeechRecognition !== "undefined") {
    console.log("[Speech] Using SpeechRecognition");
    return window.SpeechRecognition;
  }

  console.log("[Speech] Speech recognition not available");
  return null;
};

type UseSpeechRecognitionOptions = {
  lang?: string;
  onTranscript?: (text: string, isFinal: boolean) => void;
};

const DEBUG_DISMISS_MS = 8000;

export const useSpeechRecognition = ({
  lang = "en-US",
  onTranscript,
}: UseSpeechRecognitionOptions = {}) => {
  const [isSupported] = useState(() => getSpeechRecognitionConstructor() !== null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugMessage, setDebugMessage] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const listeningRef = useRef(false);

  const showDebug = useCallback((message: string) => {
    console.log(`[Speech] ${message}`);
    setDebugMessage(message);
  }, []);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    if (!debugMessage) return undefined;
    const timer = window.setTimeout(() => setDebugMessage(null), DEBUG_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [debugMessage]);

  const setListening = useCallback((value: boolean) => {
    listeningRef.current = value;
    setIsListening(value);
  }, []);

  const getRecognition = useCallback((): SpeechRecognition | null => {
    if (recognitionRef.current) {
      return recognitionRef.current;
    }

    const SpeechRecognitionAPI = getSpeechRecognitionConstructor();
    if (!SpeechRecognitionAPI) {
      return null;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = !isSafari();
    recognition.maxAlternatives = 1;

    console.log("[Speech] recognition created", {
      lang: recognition.lang,
      continuous: recognition.continuous,
      interimResults: recognition.interimResults,
      safari: isSafari(),
    });
    showDebug("Recognition instance created");

    recognition.addEventListener("start", () => {
      console.log("[Speech] onstart");
      showDebug("Recognition started — speak now");
      setListening(true);
      setError(null);
    });

    recognition.addEventListener("result", (event) => {
      const speechEvent = event as SpeechRecognitionEvent;
      console.log("[Speech] onresult", {
        resultIndex: speechEvent.resultIndex,
        resultsLength: speechEvent.results.length,
      });

      let transcript = "";
      for (let index = speechEvent.resultIndex; index < speechEvent.results.length; index += 1) {
        transcript += speechEvent.results[index][0].transcript;
      }

      const trimmed = transcript.trim();
      if (!trimmed) return;

      const isFinal = speechEvent.results[speechEvent.results.length - 1]?.isFinal ?? false;
      showDebug(isFinal ? `Heard: "${trimmed}"` : `Listening: "${trimmed}"`);
      onTranscriptRef.current?.(trimmed, isFinal);
    });

    recognition.addEventListener("error", (event) => {
      const speechEvent = event as SpeechRecognitionErrorEvent;
      console.log("[Speech] onerror", speechEvent.error, speechEvent.message);

      const code = speechEvent.error;
      if (code === "aborted") {
        setListening(false);
        showDebug("Recognition aborted");
        return;
      }

      if (code === "no-speech") {
        setListening(false);
        setError("No speech detected. Tap the microphone and try again.");
        showDebug("No speech detected");
        return;
      }

      const messageByCode: Record<string, string> = {
        "not-allowed":
          "Microphone or speech recognition access was denied. Check Safari Settings → Websites → Microphone.",
        "service-not-allowed":
          "Speech recognition is disabled. Enable Dictation in System Settings → Keyboard → Dictation (macOS Safari).",
        "audio-capture": "Microphone unavailable. Check your input device and permissions.",
        network: "Speech recognition needs a network connection (Safari uses Apple's speech service).",
        "language-not-supported": `Language "${lang}" is not supported for speech recognition.`,
      };

      const message =
        messageByCode[code] ??
        `Voice input error (${code}${speechEvent.message ? `: ${speechEvent.message}` : ""}).`;

      setError(message);
      showDebug(`Error: ${code}`);
      setListening(false);
    });

    recognition.addEventListener("end", () => {
      console.log("[Speech] onend");
      showDebug("Recognition ended");
      setListening(false);
    });

    recognitionRef.current = recognition;
    return recognition;
  }, [lang, setListening, showDebug]);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || !listeningRef.current) {
      setListening(false);
      return;
    }

    console.log("[Speech] stopListening called");
    try {
      recognition.stop();
    } catch (stopError) {
      console.log("[Speech] stop failed, aborting", stopError);
      try {
        recognition.abort();
      } catch {
        // ignore
      }
    }
    setListening(false);
  }, [setListening]);

  const startListening = useCallback(() => {
    console.log("[Speech] startListening called");

    const recognition = getRecognition();
    if (!recognition) {
      const message = "Voice input is not supported in this browser.";
      setError(message);
      showDebug(message);
      return;
    }

    setError(null);

    try {
      console.log("[Speech] calling recognition.start()");
      showDebug("Starting recognition…");
      recognition.start();
      console.log("[Speech] recognition.start() invoked");
    } catch (startError) {
      const message =
        startError instanceof Error
          ? `Unable to start voice input: ${startError.message}`
          : "Unable to start voice input. Please try again.";

      console.log("[Speech] recognition.start() threw", startError);
      setError(message);
      showDebug(message);
      setListening(false);

      // Safari can throw InvalidStateError if a session hasn't fully ended — reset instance.
      try {
        recognition.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
  }, [getRecognition, setListening, showDebug, stopListening]);

  const handleMicClick = useCallback(() => {
    console.log("[Speech] microphone button clicked", { isListening: listeningRef.current });
    showDebug("Microphone button clicked");

    if (listeningRef.current) {
      stopListening();
      return;
    }

    startListening();
  }, [showDebug, startListening, stopListening]);

  useEffect(() => () => {
    console.log("[Speech] cleanup on unmount");
    try {
      recognitionRef.current?.abort();
    } catch {
      // ignore
    }
    recognitionRef.current = null;
    listeningRef.current = false;
  }, []);

  return {
    isSupported,
    isListening,
    error,
    debugMessage,
    startListening,
    stopListening,
    handleMicClick,
  };
};
