import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: 'start' | 'end' | 'center';
  className?: string;
  useOriginalCharsOnly?: boolean;
  animateOn?: 'view' | 'hover';
}

const DecryptedText: React.FC<DecryptedTextProps> = ({
  text,
  speed = 40,
  maxIterations = 15,
  sequential = false,
  revealDirection = 'start',
  className = '',
  useOriginalCharsOnly = false,
  animateOn = 'view',
}) => {
  const [currentText, setCurrentText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);
  const [isScrambling, setIsScrambling] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let currentIteration = 0;

    const startScrambling = () => {
      setIsScrambling(true);
      interval = setInterval(() => {
        setCurrentText((prev) => {
          if (currentIteration >= maxIterations) {
            clearInterval(interval);
            setIsScrambling(false);
            return text;
          }

          return text
            .split('')
            .map((char, index) => {
              if (char === ' ') return ' ';

              const progress = currentIteration / maxIterations;
              let shouldReveal = false;

              if (sequential) {
                if (revealDirection === 'start') {
                  shouldReveal = index / text.length < progress;
                } else if (revealDirection === 'end') {
                  shouldReveal = (text.length - index) / text.length < progress;
                } else if (revealDirection === 'center') {
                  const center = text.length / 2;
                  const distance = Math.abs(index - center);
                  shouldReveal = 1 - distance / center < progress;
                }
              } else {
                shouldReveal = Math.random() < progress;
              }

              if (shouldReveal) return char;

              if (useOriginalCharsOnly) {
                const randomChar = text[Math.floor(Math.random() * text.length)];
                return randomChar === ' '
                  ? text[Math.floor(Math.random() * text.length)]
                  : randomChar;
              }

              return characters[Math.floor(Math.random() * characters.length)];
            })
            .join('');
        });
        currentIteration++;
      }, speed);
    };

    if (animateOn === 'hover' && isHovering && !isScrambling) {
      startScrambling();
    } else if (animateOn === 'view' && !isScrambling) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            startScrambling();
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      if (containerRef.current) observer.observe(containerRef.current);
      return () => observer.disconnect();
    }

    return () => clearInterval(interval);
  }, [
    text,
    speed,
    maxIterations,
    sequential,
    revealDirection,
    useOriginalCharsOnly,
    animateOn,
    isHovering,
  ]);

  return (
    <motion.span
      ref={containerRef}
      onMouseEnter={() => animateOn === 'hover' && setIsHovering(true)}
      onMouseLeave={() => animateOn === 'hover' && setIsHovering(false)}
      className={`inline-block ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {currentText}
    </motion.span>
  );
};

export default DecryptedText;
