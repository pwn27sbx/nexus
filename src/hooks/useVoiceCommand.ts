import { useState, useEffect, useCallback, useRef } from 'react';

// Extend the window object to include the speech recognition APIs
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useVoiceCommand() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        // For multiple languages, we can use 'es-ES' or let it auto-detect based on browser.
        recognitionRef.current.lang = 'es-ES'; // Spanish by default since user speaks Spanish

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setError(event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      } else {
        setError('El reconocimiento de voz no está soportado en este navegador.');
      }
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      setTranscript('');
      setError('');
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      // isListening will be set to false in onend
    }
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
  };
}
