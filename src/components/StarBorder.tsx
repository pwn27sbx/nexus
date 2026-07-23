import React from 'react';

interface StarBorderProps {
  as?: React.ElementType;
  className?: string;
  color?: string;
  speed?: string;
  children: React.ReactNode;
  [key: string]: any;
}

const StarBorder: React.FC<StarBorderProps> = ({
  as: Component = 'button',
  className = '',
  color = 'rgba(255,255,255,1)',
  speed = '4s',
  children,
  ...rest
}) => {
  return (
    <Component
      className={`relative inline-block overflow-hidden rounded-[20px] p-[2.5px] group ${className}`}
      {...rest}
    >
      {/* Soft Glow Layer */}
      <div
        className="absolute inset-0 z-0 blur-xl opacity-80"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
          backgroundSize: '200% 100%',
          animation: `sweep ${speed} linear infinite`,
        }}
      />
      {/* Sharp Beam Layer */}
      <div
        className="absolute inset-0 z-0 opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent 30%, ${color} 50%, transparent 70%)`,
          backgroundSize: '200% 100%',
          animation: `sweep ${speed} linear infinite`,
        }}
      />
      <div className="relative w-full h-full rounded-[17.5px] bg-transparent">{children}</div>

      <style>{`
                @keyframes sweep {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
    </Component>
  );
};

export default StarBorder;
