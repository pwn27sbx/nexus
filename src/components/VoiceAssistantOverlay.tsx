import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceAssistantOverlayProps {
  isListening: boolean;
  transcript: string;
  onStop: () => void;
  isProcessing?: boolean;
}

const VoiceAssistantOverlay: React.FC<VoiceAssistantOverlayProps> = ({
  isListening,
  transcript,
  onStop,
  isProcessing = false,
}) => {
  return (
    <AnimatePresence>
      {(isListening || isProcessing) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center p-6"
        >
          {/* Liquid Glass Background */}
          <div className="absolute inset-0 bg-[rgba(15,10,30,0.4)] backdrop-blur-[48px] saturate-[150%] -z-10" />

          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl flex flex-col items-center"
          >
            {/* Visualizer Orb */}
            <div className="relative w-40 h-40 flex items-center justify-center mb-10">
              {/* Outer glow rings */}
              <motion.div
                animate={{
                  scale: isListening ? [1, 1.5, 1.2] : 1,
                  opacity: isListening ? [0.3, 0, 0.3] : 0,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#3b82f6] blur-2xl"
              />
              <motion.div
                animate={{
                  scale: isListening ? [1, 1.3, 1] : 1.1,
                  rotate: isListening ? [0, 180, 360] : 0,
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute inset-4 rounded-full bg-gradient-to-br from-[#ec4899] to-[#8b5cf6] opacity-70 blur-xl"
              />

              {/* Core Orb */}
              <button
                onClick={onStop}
                className="relative z-10 w-24 h-24 rounded-full bg-[rgba(255,255,255,0.1)] backdrop-blur-xl border border-[rgba(255,255,255,0.3)] shadow-[inset_0_4px_16px_rgba(255,255,255,0.2),0_8px_32px_rgba(124,58,237,0.4)] flex items-center justify-center overflow-hidden transition-transform hover:scale-105"
              >
                {/* Liquid fill animation inside the orb */}
                <motion.div
                  animate={{
                    y: isListening ? ['0%', '-10%', '0%'] : '0%',
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-[-50%] bg-gradient-to-t from-[#7c3aed] to-transparent opacity-40 blur-md"
                  style={{ borderRadius: '45%' }}
                />

                {isProcessing ? (
                  <svg
                    className="w-8 h-8 text-white animate-spin relative z-20"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray="32"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-8 h-8 text-white relative z-20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Transcript Text */}
            <div className="text-center min-h-[120px]">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-[rgba(255,255,255,0.6)] mb-4">
                {isProcessing ? 'Analizando...' : transcript || 'Te escucho...'}
              </h2>

              <p className="text-[rgba(255,255,255,0.5)] font-medium text-sm">
                {isProcessing
                  ? 'Buscando las mejores herramientas para ti'
                  : 'Toca el círculo para finalizar'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VoiceAssistantOverlay;
