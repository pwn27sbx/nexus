import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
}

const BlurText: React.FC<BlurTextProps> = ({
  text,
  delay = 100,
  className = '',
  animateBy = 'words',
  direction = 'top',
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const yOffset = direction === 'top' ? -20 : 20;

  return (
    <span ref={ref} className={`${className} flex flex-wrap justify-center`}>
      {elements.map((element, index) => (
        <motion.span
          key={`${element}-${index}`}
          initial={{ filter: 'blur(10px)', opacity: 0, transform: `translate3d(0,${yOffset}px,0)` }}
          animate={
            inView ? { filter: 'blur(0px)', opacity: 1, transform: 'translate3d(0,0px,0)' } : {}
          }
          transition={{
            duration: 1.2,
            delay: (index * delay) / 1000,
            ease: [0.16, 1, 0.3, 1], // Custom ease out
          }}
          className={`inline-block ${animateBy === 'words' ? 'mr-[0.25em]' : ''}`}
        >
          {element === ' ' ? '\u00A0' : element}
        </motion.span>
      ))}
    </span>
  );
};

export default BlurText;
