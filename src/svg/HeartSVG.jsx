// src/components/HeartSVG.jsx
import React, { forwardRef } from 'react';

const HeartSVG = forwardRef((props, ref) => {
  // Heart path data (used for both outline and fill)
  const heartPathData = "M55,95 L15,55 Q0,40 15,25 C30,10 55,25 55,50 C55,25 80,10 95,25 Q110,40 95,55 Z";

  return (
    // No fixed width/height here, controlled by CSS via className from parent
    <svg
      ref={ref}
      viewBox="0 0 110 100" // Keep viewBox for intrinsic scaling
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }} // Allow potential glow effects
      {...props} // Spread props like className
    >
      {/* Heart Fill (Starts hidden, target for final state) */}
      <path
        className="heart-fill" // Target class for GSAP
        d={heartPathData}
        fill="#EF5350" // Final healthy red color
        opacity="0"    // Starts fully transparent
      />

      {/* Heart Outline (Starts gray, might fade later) */}
      <path
        className="heart-outline" // Target class for GSAP
        d={heartPathData}
        fill="none"          // No fill for the outline itself
        stroke="#888888"     // Initial gray color
        strokeWidth="1.5"
        opacity="1"          // Starts visible
      />

      {/* Crack Lines (visible initially, dark gray) */}
      <g className="cracks">
        <path
          className="crack-line" // Target class for GSAP
          d="M55,50 L40,65 Q45,75 55,95"
          fill="none"
          stroke="#555555" // Dark gray crack color
          strokeWidth="1"
          opacity="1"     // Start visible
        />
        <path
          className="crack-line" // Target class for GSAP
          d="M55,50 L70,60 Q80,50 95,55"
          fill="none"
          stroke="#555555"
          strokeWidth="1"
          opacity="1"
        />
         <path
          className="crack-line" // Target class for GSAP
          d="M55,50 L40,35 Q30,45 15,55"
          fill="none"
          stroke="#555555"
          strokeWidth="1"
          opacity="1"
        />
      </g>

      {/* Mending Lines (hidden initially, trace the crack lines) */}
      {/* Apply glow directly to the group */}
      <g className="mending-lines" style={{ filter: 'drop-shadow(0 0 3px #FFD700)' }}>
         <path
          className="mend-line" // Target class for GSAP
          id="mend-line-1"      // Optional ID
          d="M55,50 L40,65 Q45,75 55,95"
          fill="none"
          stroke="#FFD700" // Gold color for mending
          strokeWidth="2.5" // Slightly thicker than crack
          strokeLinecap="round"
          opacity="0"       // Start hidden (GSAP sets opacity to 1 then draws)
          // stroke-dasharray/offset set via GSAP
        />
         <path
          className="mend-line" // Target class for GSAP
          id="mend-line-2"
          d="M55,50 L70,60 Q80,50 95,55"
          fill="none"
          stroke="#FFD700"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0"
        />
         <path
          className="mend-line" // Target class for GSAP
          id="mend-line-3"
          d="M55,50 L40,35 Q30,45 15,55"
          fill="none"
          stroke="#FFD700"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0"
        />
      </g>
    </svg>
  );
});

export default HeartSVG;