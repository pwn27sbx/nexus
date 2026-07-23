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
  color = 'white',
  speed = '6s',
  children,
  ...rest
}) => {
  return (
    <Component
      className={`relative inline-block overflow-hidden rounded-[20px] p-[1px] group ${className}`}
      {...rest}
    >
      <div
        className="absolute inset-[-100%] z-0 origin-center"
        style={{
          background: `conic-gradient(from 90deg at 50% 50%, transparent 50%, ${color} 100%)`,
          animation: `spin ${speed} linear infinite`,
        }}
      />
      <div className="relative w-full h-full rounded-[19px] bg-transparent">{children}</div>

      <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
    </Component>
  );
};

export default StarBorder;
