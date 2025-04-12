// src/components/ApologyCard.jsx
import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import styles from './ApologyCard.module.css';
import HeartSVG from '../svg/HeartSVG';
import ParticleCanvas from './ParticleCanvas'; // Import the canvas component

function ApologyCard() {
  const [isMending, setIsMending] = useState(false);
  const [isMended, setIsMended] = useState(false);
  const [triggerParticleBurst, setTriggerParticleBurst] = useState(0); // Use a counter to trigger effect
  const [heartPosition, setHeartPosition] = useState({ x: 0, y: 0 });

  const cardRef = useRef(null);
  const svgRef = useRef(null);
  const heartContainerRef = useRef(null); // Ref for the div containing the heart
  const noButtonRef = useRef(null);
  const buttonContainerRef = useRef(null);

  // Calculate heart center position when SVG ref is available
  useEffect(() => {
    if (heartContainerRef.current) {
      const rect = heartContainerRef.current.getBoundingClientRect();
      // Calculate center relative to the viewport
      setHeartPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
    }
  }, []); // Calculate on mount (adjust if layout changes dynamically)


  const handleYesClick = () => {
    if (isMending || isMended) return;
    setIsMending(true);
    setTriggerParticleBurst(0); // Reset burst trigger

    const svgElement = svgRef.current;
    if (!svgElement) { setIsMending(false); return; }

    const mendLines = svgElement.querySelectorAll('.mend-line');
    const crackLines = svgElement.querySelectorAll('.crack-line');
    const heartOutline = svgElement.querySelector('.heart-outline');
    const heartFill = svgElement.querySelector('.heart-fill');

    if (!mendLines.length || !crackLines.length || !heartOutline || !heartFill) {
        console.error("SVG elements for animation not found!"); setIsMending(false); return;
    }

    mendLines.forEach(line => { /* ... (stroke dash setup) ... */
        const length = line.getTotalLength();
        if (typeof length === 'number' && isFinite(length)) {
             gsap.set(line, { strokeDasharray: length, strokeDashoffset: length, opacity: 1 });
        } else {
            gsap.set(line, { strokeDasharray: 'none', strokeDashoffset: 0, opacity: 1});
        }
     });

    // --- Create GSAP Timeline ---
    const tl = gsap.timeline({
      onComplete: () => {
        setIsMending(false);
        setIsMended(true);
        // --- Trigger particle burst AFTER animation completes ---
        setTriggerParticleBurst(prev => prev + 1); // Increment counter to trigger effect in canvas
      }
    });

    // --- Animation Sequence (same as before) ---
    // 1. Draw Mending Lines
    tl.to(mendLines, { strokeDashoffset: 0, duration: 1.5, ease: "power1.inOut", stagger: 0.3 });
    // 2. Fade Out Cracks
    tl.to(crackLines, { opacity: 0, duration: 1.0, ease: "power1.out" }, "-=1.2");
    // 3. Fade Out Mending Lines
    tl.to(mendLines, { opacity: 0, duration: 0.5, ease: "power1.out", delay: 0.2 }, ">");
    // 4. Fade In Heart Fill
    tl.to(heartFill, { opacity: 1, duration: 1.0, ease: "sine.inOut" }, "<");
    // 5. Fade Out Outline
    tl.to(heartOutline, { opacity: 0, duration: 0.5 }, "<+=0.2");
    // 6. Final Pulse
    tl.to(heartFill, { scale: 1.05, duration: 0.4, ease: "sine.inOut", yoyo: true, repeat: 1, transformOrigin: "center center" }, "-=0.3");

  };

  // Runaway Button Logic (keep as is)
  const handleNoMouseOver = () => { /* ... (same logic) ... */
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


  // JSX - Add ParticleCanvas and heartContainerRef
  return (
    <div className={styles.cardWrapper}>
      {/* Canvas goes here, behind the card */}
      <ParticleCanvas
          className={styles.particleCanvas}
          triggerBurst={triggerParticleBurst} // Pass trigger state
          heartCenter={heartPosition} // Pass calculated heart center
      />

      <div className={styles.card} ref={cardRef}>
         {/* Add ref to the heart's container div */}
        <div ref={heartContainerRef} className={styles.heartContainer}>
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
             {/* SVG */}
             <svg xmlns="http://www.w3.org/2000/svg" fill={isMended ? 'limegreen' : 'green'} width="60" height="60" viewBox="0 0 24 24"><path d="M20.285 6.709l-11.285 11.293-5.285-5.293 1.414-1.414 3.871 3.879 9.871-9.879z"/></svg>
          </button>

          {/* NO Button */}
          <button
            ref={noButtonRef}
            className={`${styles.button} ${styles.noButton}`}
            onMouseOver={handleNoMouseOver}
            disabled={isMended}
            aria-label="Not Yet"
          >
             {/* SVG */}
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={isMended ? 'lightgrey' : 'red'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
         {isMended && <p style={{color: 'limegreen', marginTop: '15px', fontWeight: 'bold'}}>Thank you! ❤️</p>}
      </div>
    </div>
  );
}

export default ApologyCard;