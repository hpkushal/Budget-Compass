import React from 'react';

interface CompassLogoProps {
  size?: number;
  className?: string;
}

export function CompassLogo({ size = 64, className = "" }: CompassLogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer compass ring - Teal */}
        <circle
          cx="50"
          cy="50"
          r="48"
          stroke="#2D9A8C"
          strokeWidth="3"
          fill="white"
        />
        
        {/* Inner compass circle - Light background */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="#F8FFFE"
        />
        
        {/* Compass Points - N, W, E, S */}
        <g className="font-bold" fill="#2D9A8C">
          <text x="50" y="15" textAnchor="middle" fontSize="12" fontWeight="bold">N</text>
          <text x="15" y="55" textAnchor="middle" fontSize="12" fontWeight="bold">W</text>
          <text x="85" y="55" textAnchor="middle" fontSize="12" fontWeight="bold">E</text>
          <text x="50" y="90" textAnchor="middle" fontSize="12" fontWeight="bold">S</text>
        </g>
        
        {/* Compass needle pointing north - Teal */}
        <g transform="translate(50, 50)">
          <path
            d="M 0 -25 L 4 -8 L 0 -10 L -4 -8 Z"
            fill="#2D9A8C"
          />
          <circle cx="0" cy="0" r="2" fill="#2D9A8C" />
        </g>
        
        {/* Heart accent on top - Orange */}
        <g transform="translate(50, 8)">
          <path
            d="M0 4c-2.5-2.5-6.5-2.5-9 0-2.5 2.5-2.5 6.5 0 9l9 9 9-9c2.5-2.5 2.5-6.5 0-9-2.5-2.5-6.5-2.5-9 0z"
            fill="#F59E0B"
            transform="scale(0.4)"
          />
        </g>
        
        {/* House with family at bottom - Orange */}
        <g transform="translate(50, 75)">
          {/* House shape */}
          <path
            d="M0 -8 L-8 0 L-8 8 L8 8 L8 0 Z"
            fill="#F59E0B"
          />
          
          {/* Family silhouettes inside house */}
          <g fill="white">
            {/* Adult 1 */}
            <circle cx="-3" cy="2" r="1.5" />
            <rect x="-3.5" y="3" width="1" height="3" />
            
            {/* Adult 2 */}
            <circle cx="3" cy="2" r="1.5" />
            <rect x="2.5" y="3" width="1" height="3" />
            
            {/* Child */}
            <circle cx="0" cy="3" r="1" />
            <rect x="-0.5" y="4" width="1" height="2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

interface BudgetCompassLogoProps {
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function BudgetCompassLogo({ 
  showText = true, 
  size = 'md', 
  className = "" 
}: BudgetCompassLogoProps) {
  const sizes = {
    sm: { logo: 32, text: 'text-lg' },
    md: { logo: 48, text: 'text-xl' },
    lg: { logo: 64, text: 'text-2xl' },
    xl: { logo: 80, text: 'text-3xl' }
  };
  
  const currentSize = sizes[size];
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <CompassLogo size={currentSize.logo} />
      {showText && (
        <div className="flex flex-col">
          <h1 className={`font-bold text-foreground leading-tight ${currentSize.text}`}>
            <span className="font-extrabold">BUDGET</span>{' '}
            <span className="font-normal">COMPASS</span>
          </h1>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Navigate Your Family's Finances
          </p>
        </div>
      )}
    </div>
  );
}
