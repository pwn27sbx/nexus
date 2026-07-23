import { useState, useCallback, useRef } from 'react';

export function useVoiceCommand() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalText, setFinalText] = useState('');
  const [audioData, setAudioData] = useState<{ base64: string; mimeType: string } | null>(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'native' | 'audio'>('native');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  const startMediaRecorder = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('La grabación de audio no está soportada en este navegador.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          const base64String = base64data.split(',')[1];
          setAudioData({ base64: base64String, mimeType });
        };
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        setIsListening(false);
      };

      mediaRecorder.start();
      setMode('audio');
      setIsListening(true);
      setTranscript('Escuchando...');
    } catch (e: any) {
      console.error('Microphone permission denied or error:', e);
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError')
        setError('not-allowed');
      else setError(e.message || 'Error al acceder al micrófono');
      setIsListening(false);
    }
  };

  const startListening = useCallback(() => {
    setTranscript('');
    setFinalText('');
    setAudioData(null);
    setError('');

    // First Line of Defense: Native Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = 'es-ES';
        recognition.interimResults = true;
        recognition.continuous = false;

        let hasError = false;
        let finalResult = '';

        recognition.onstart = () => {
          setIsListening(true);
          setMode('native');
          setTranscript('Escuchando...');
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
          finalResult = currentTranscript;
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          hasError = true;

          // Si el navegador bloquea la API nativa (Brave/Edge sin red, etc.), iniciamos el Respaldo
          if (
            event.error === 'network' ||
            event.error === 'not-allowed' ||
            event.error === 'audio-capture' ||
            event.error === 'aborted'
          ) {
            console.log('Activando modo respaldo (MediaRecorder)...');
            startMediaRecorder();
          } else {
            setError(event.error);
            setIsListening(false);
          }
        };

        recognition.onend = () => {
          if (!hasError) {
            if (finalResult) {
              setFinalText(finalResult);
            }
            setIsListening(false);
          }
        };

        recognition.start();
      } catch (e) {
        console.log('Error iniciando SpeechRecognition, activando modo respaldo...');
        startMediaRecorder();
      }
    } else {
      // Second Line of Defense: Fallback to Audio Recording directly (Firefox)
      console.log('SpeechRecognition no soportado, activando modo respaldo directamente...');
      startMediaRecorder();
    }
  }, []);

  const stopListening = useCallback(() => {
    if (mode === 'native' && recognitionRef.current) {
      recognitionRef.current.stop();
    } else if (
      mode === 'audio' &&
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.stop();
    }
  }, [mode]);

  return {
    isListening,
    transcript,
    finalText,
    audioData,
    error,
    mode,
    startListening,
    stopListening,
  };
}
