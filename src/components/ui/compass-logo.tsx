import React from 'react';

interface CompassLogoProps {
  size?: number;
  className?: string;
}

export function CompassLogo({ size = 64, className = "" }: CompassLogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Compass Rose Background */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute"
      >
        {/* Outer compass ring - Teal */}
        <circle
          cx="32"
          cy="32"
          r="30"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-primary"
        />
        
        {/* Inner compass ring - Light Blue */}
        <circle
          cx="32"
          cy="32"
          r="24"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          className="text-secondary"
          opacity="0.7"
        />
        
        {/* Compass Points - N, E, S, W */}
        <g className="text-primary font-semibold">
          <text x="32" y="10" textAnchor="middle" className="text-sm font-bold fill-current">N</text>
          <text x="54" y="36" textAnchor="middle" className="text-sm font-bold fill-current">E</text>
          <text x="32" y="58" textAnchor="middle" className="text-sm font-bold fill-current">S</text>
          <text x="10" y="36" textAnchor="middle" className="text-sm font-bold fill-current">W</text>
        </g>
        
        {/* Compass needle pointing up/north - Teal and Orange */}
        <g transform="translate(32, 32)">
          {/* North pointing needle - Teal */}
          <path
            d="M 0 -18 L 3 -6 L 0 -8 L -3 -6 Z"
            fill="currentColor"
            className="text-primary"
          />
          {/* South pointing needle - Orange */}
          <path
            d="M 0 18 L 3 6 L 0 8 L -3 6 Z"
            fill="currentColor"
            className="text-accent"
          />
        </g>
        
        {/* Center dot */}
        <circle
          cx="32"
          cy="32"
          r="2"
          fill="currentColor"
          className="text-primary"
        />
      </svg>
      
      {/* House silhouette with family icon - Orange/Yellow */}
      <svg
        width={size * 0.4}
        height={size * 0.3}
        viewBox="0 0 24 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute bottom-0 text-accent"
        style={{ bottom: size * 0.15 }}
      >
        {/* House shape */}
        <path
          d="M12 2 L4 8 L4 16 L20 16 L20 8 L12 2 Z"
          fill="currentColor"
          className="text-accent"
        />
        
        {/* Family icon inside house */}
        <g transform="translate(12, 12)" className="text-white">
          {/* Parent 1 */}
          <circle cx="-2" cy="-2" r="1" fill="currentColor" />
          <rect x="-2.5" y="-1" width="1" height="2" fill="currentColor" />
          
          {/* Parent 2 */}
          <circle cx="2" cy="-2" r="1" fill="currentColor" />
          <rect x="1.5" y="-1" width="1" height="2" fill="currentColor" />
          
          {/* Child */}
          <circle cx="0" cy="-1" r="0.7" fill="currentColor" />
          <rect x="-0.3" y="-0.5" width="0.6" height="1.5" fill="currentColor" />
        </g>
      </svg>
      
      {/* Heart accent on top - Orange */}
      <svg
        width={size * 0.15}
        height={size * 0.15}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-0 text-accent"
        style={{ top: size * 0.05 }}
      >
        <path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          fill="currentColor"
        />
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
