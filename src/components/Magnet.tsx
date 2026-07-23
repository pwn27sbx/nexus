import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface MagnetProps {
  children: React.ReactNode;
  padding?: number;
  disabled?: boolean;
  magnetStrength?: number;
  wrapperClassName?: string;
  innerClassName?: string;
}

const Magnet: React.FC<MagnetProps> = ({
  children,
  padding = 100,
  disabled = false,
  magnetStrength = 2,
  wrapperClassName = '',
  innerClassName = '',
}) => {
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const magnetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && !disabled) {
      const handleMouseMove = (e: MouseEvent) => {
        if (magnetRef.current) {
          const { left, top, width, height } = magnetRef.current.getBoundingClientRect();
          const centerX = left + width / 2;
          const centerY = top + height / 2;
          const distX = Math.abs(centerX - e.clientX);
          const distY = Math.abs(centerY - e.clientY);

          if (distX < width / 2 + padding && distY < height / 2 + padding) {
            setPosition({
              x: (e.clientX - centerX) / magnetStrength,
              y: (e.clientY - centerY) / magnetStrength,
            });
          } else {
            setIsActive(false);
            setPosition({ x: 0, y: 0 });
          }
        }
      };
      window.addEventListener('mousemove', handleMouseMove);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [isActive, padding, disabled, magnetStrength]);

  return (
    <div
      ref={magnetRef}
      className={`inline-block relative z-10 ${wrapperClassName}`}
      onMouseMove={() => !disabled && setIsActive(true)}
      onMouseLeave={() => {
        setIsActive(false);
        setPosition({ x: 0, y: 0 });
      }}
    >
      <motion.div
        animate={{ x: position.x, y: position.y }}
        transition={{
          type: 'spring',
          stiffness: isActive ? 150 : 200,
          damping: isActive ? 15 : 20,
          mass: 0.5,
        }}
        className={innerClassName}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default Magnet;
