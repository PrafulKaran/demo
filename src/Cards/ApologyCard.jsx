// src/components/ApologyCard.jsx
import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import styles from './ApologyCard.module.css';
import HeartSVG from '../svg/HeartSVG';

function ApologyCard() {
  const [isMending, setIsMending] = useState(false);
  const [isMended, setIsMended] = useState(false);

  const cardRef = useRef(null);
  const svgRef = useRef(null);
  const noButtonRef = useRef(null);
  const buttonContainerRef = useRef(null);

  const handleYesClick = () => {
    if (isMending || isMended) return;
    setIsMending(true);

    const svgElement = svgRef.current;
    if (!svgElement) {
        setIsMending(false); return;
    }

    // Target the specific elements by class name within the SVG
    const mendLines = svgElement.querySelectorAll('.mend-line');
    const crackLines = svgElement.querySelectorAll('.crack-line');
    const heartOutline = svgElement.querySelector('.heart-outline');
    const heartFill = svgElement.querySelector('.heart-fill');

    // Basic check if elements exist
    if (!mendLines.length || !crackLines.length || !heartOutline || !heartFill) {
        console.error("SVG elements for animation not found!");
        setIsMending(false); return;
    }

    // --- Prepare Mending Lines for drawing animation ---
    mendLines.forEach(line => {
      const length = line.getTotalLength();
      if (typeof length === 'number' && isFinite(length)) {
           gsap.set(line, {
            strokeDasharray: length,
            strokeDashoffset: length,
            opacity: 1 // Make visible right before animation starts drawing
          });
      } else {
          console.warn("Could not get total length for a mend line:", line);
          gsap.set(line, { strokeDasharray: 'none', strokeDashoffset: 0, opacity: 1});
      }
    });

    // --- Create GSAP Timeline ---
    const tl = gsap.timeline({
      onComplete: () => {
        setIsMending(false);
        setIsMended(true);
        // Final state: Solid red heart is visible
      }
    });

    // --- Animation Sequence ---

    // 1. Draw the glowing Mending Lines
    tl.to(mendLines, {
      strokeDashoffset: 0,
      duration: 1.5,
      ease: "power1.inOut",
      stagger: 0.3 // Stagger the start of each line drawing
    });

    // 2. Fade Out the original Crack Lines (start slightly after mending starts)
    tl.to(crackLines, {
      opacity: 0,
      duration: 1.0,
      ease: "power1.out"
    }, "-=1.2"); // Overlap significantly with mend line drawing

    // 3. Fade Out the Mending Lines *after* they finish drawing
    // Add a short delay before they start fading
    tl.to(mendLines, {
      opacity: 0,
      duration: 0.5,
      ease: "power1.out",
      delay: 0.2 // Wait a moment after drawing completes
    }, ">"); // Start after the previous step completes (+ delay)

    // 4. Fade In the Solid Heart Fill (start as mending lines fade)
    tl.to(heartFill, {
      opacity: 1,
      duration: 1.0,
      ease: "sine.inOut"
    }, "<"); // Start at the same time the mending lines start fading out

    // 5. Fade Out the initial Gray Outline (optional, looks cleaner)
    tl.to(heartOutline, {
       opacity: 0, // Fade out the outline
       // Or change color: stroke: "#B71C1C", // Darker red outline
       duration: 0.5
    }, "<+=0.2"); // Start slightly after fill starts fading in

    // 6. Final Pulse of the Healed Heart (targeting the fill)
    tl.to(heartFill, {
        scale: 1.05,
        duration: 0.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: 1,
        transformOrigin: "center center" // Ensure scaling is centered
    }, "-=0.3"); // Overlap slightly with the end of the fill fade-in

  };

  // Runaway Button Logic (keep as is)
  const handleNoMouseOver = () => {
      // ... (same logic as before) ...
      const noButton = noButtonRef.current;
      const container = buttonContainerRef.current;
      if (!noButton || !container || isMended) return;

      const containerRect = container.getBoundingClientRect();
      const maxX = container.offsetWidth - noButton.offsetWidth - 10;
      const maxY = container.offsetHeight - noButton.offsetHeight - 10;

      const safeZoneCenterX = container.offsetWidth / 2;
      const safeZoneWidth = 100;
      const safeZoneStartX = safeZoneCenterX - safeZoneWidth / 2;
      const safeZoneEndX = safeZoneCenterX + safeZoneWidth / 2;

      let randX, randY;
      const currentLeft = noButton.offsetLeft;

      let attempts = 0;
      do {
          randX = Math.random() * maxX;
          randY = Math.random() * maxY;
          attempts++;
      } while (
          (Math.abs(randX - currentLeft) < 50 ||
           (randX > safeZoneStartX && randX < safeZoneEndX)) &&
          attempts < 10
      );

      noButton.style.left = `${randX}px`;
      noButton.style.top = `${randY}px`;
  };


  // GSAP Cleanup (keep as is)
  useEffect(() => {
    const ctx = gsap.context(() => {}, cardRef);
    return () => ctx.revert();
  }, []);


  // JSX (keep as is, button state logic remains the same)
  return (
    <div className={styles.cardWrapper}>
      <div className={styles.card} ref={cardRef}>
        <div className={styles.heartContainer}>
          <HeartSVG ref={svgRef} />
        </div>

        <div className={styles.message}>
          {/* Message */}
          <p><strong>I messed up. I'm truly sorry.</strong></p>
          <p>You mean the world to me, and I hate that I made you feel hurt.</p>
          <p>Every moment without your smile feels like a broken code I can't fix.</p>
          <p>I wish I could rewind time, hold your hand, and remind you how much you matter to me — again and again.</p>
        </div>
        <div className={styles.quote}>
          "In a world full of bugs, you're my only exception."
        </div>

        <div ref={buttonContainerRef} className={styles.buttonContainer}>
          {/* YES Button */}
           <button
              className={styles.button}
              onClick={handleYesClick}
              disabled={isMending || isMended}
              aria-label="Forgive Me"
           >
            <svg xmlns="http://www.w3.org/2000/svg" fill={isMended ? 'limegreen' : 'green'} width="60" height="60" viewBox="0 0 24 24">
                <path d="M20.285 6.709l-11.285 11.293-5.285-5.293 1.414-1.414 3.871 3.879 9.871-9.879z"/>
            </svg>
          </button>

          {/* NO Button */}
          <button
            ref={noButtonRef}
            className={`${styles.button} ${styles.noButton}`}
            onMouseOver={handleNoMouseOver}
            disabled={isMended}
            aria-label="Not Yet"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={isMended ? 'lightgrey' : 'red'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
         {isMended && <p style={{color: 'green', marginTop: '15px', fontWeight: 'bold'}}>Thank you! ❤️</p>}
      </div>
    </div>
  );
}

export default ApologyCard;