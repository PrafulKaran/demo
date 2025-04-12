// src/components/ApologyCard.jsx
import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import styles from './ApologyCard.module.css'; // Import CSS module
import HeartSVG from '../svg/HeartSVG';             // Import SVG component
import ParticleCanvas from './ParticleCanvas';   // Import Canvas component

function ApologyCard() {
    // State variables
    const [isMending, setIsMending] = useState(false);   // Is heart animation running?
    const [isMended, setIsMended] = useState(false);     // Has heart animation finished?
    const [triggerParticleBurst, setTriggerParticleBurst] = useState(0); // Counter to trigger canvas burst
    const [heartPosition, setHeartPosition] = useState({ x: 0, y: 0 }); // Heart center coords for burst

    // Refs to DOM elements
    const cardRef = useRef(null);            // Ref for the main card div (GSAP context)
    const svgRef = useRef(null);             // Ref for the HeartSVG component's root SVG element
    const heartContainerRef = useRef(null);  // Ref for the div wrapping the HeartSVG
    const noButtonRef = useRef(null);        // Ref for the "No" button element
    const buttonContainerRef = useRef(null); // Ref for the container holding buttons

    // Ref to store the beating animation instance for potential control/cleanup
    const heartBeatAnim = useRef(null);

    // Effect to calculate heart center position on mount and potential resize
    useEffect(() => {
        const calculateHeartPosition = () => {
            if (heartContainerRef.current) {
                const rect = heartContainerRef.current.getBoundingClientRect();
                // Calculate center relative to the viewport
                setHeartPosition({
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                });
            }
        };
        calculateHeartPosition(); // Initial calculation
        window.addEventListener('resize', calculateHeartPosition); // Recalculate on resize
        return () => window.removeEventListener('resize', calculateHeartPosition); // Cleanup listener
    }, []); // Empty dependency array: run once on mount, cleanup on unmount

    // Handler for clicking the "Yes" button
    const handleYesClick = () => {
        // Prevent animation if already running or finished
        if (isMending || isMended) return;
        setIsMending(true); // Set state: animation starting
        setTriggerParticleBurst(0); // Reset burst trigger if re-clicking somehow

        // --- Stop any existing heartbeat animation before starting mend ---
        if (heartBeatAnim.current) {
            heartBeatAnim.current.kill(); // Stop the animation
            heartBeatAnim.current = null;
        }
        // ---

        const svgElement = svgRef.current; // Get the SVG DOM node
        if (!svgElement) { setIsMending(false); return; } // Exit if SVG ref not ready

        // Select elements within the SVG for animation
        const mendLines = svgElement.querySelectorAll('.mend-line');
        const crackLines = svgElement.querySelectorAll('.crack-line');
        const heartOutline = svgElement.querySelector('.heart-outline');
        const heartFill = svgElement.querySelector('.heart-fill');

        // Basic check if all necessary elements exist
        if (!mendLines.length || !crackLines.length || !heartOutline || !heartFill) {
            console.error("SVG elements for animation not found!"); setIsMending(false); return;
        }

        // --- Prepare Mending Lines for drawing animation ---
        // Set stroke-dasharray/offset to make them initially invisible
        mendLines.forEach(line => {
            const length = line.getTotalLength();
            if (typeof length === 'number' && isFinite(length)) {
                // Set initial state: full dash, full offset, opacity 1 (ready to draw)
                gsap.set(line, { strokeDasharray: length, strokeDashoffset: length, opacity: 1 });
            } else {
                // Fallback if length calculation fails
                console.warn("Could not get total length for a mend line:", line);
                gsap.set(line, { strokeDasharray: 'none', strokeDashoffset: 0, opacity: 1 });
            }
        });

        // --- Create MAIN MENDING GSAP Timeline ---
        const tl = gsap.timeline({
            // onComplete callback: runs when the entire timeline finishes
            onComplete: () => {
                setIsMending(false); // Set state: animation finished
                setIsMended(true);   // Set state: heart is healed
                setTriggerParticleBurst(prev => prev + 1); // Trigger particle burst

                // --- START HEARTBEAT ANIMATION ---
                // Ensure heartFill element is still available
                if (heartFill) {
                    // Start a new, independent, looping animation stored in the ref
                    heartBeatAnim.current = gsap.to(heartFill, {
                        scale: 1.08, // Scale up slightly (adjust value for desired intensity)
                        duration: 0.6, // Duration of one beat phase (up or down - adjust for speed)
                        ease: 'sine.inOut', // Smooth easing
                        repeat: -1, // Repeat indefinitely
                        yoyo: true, // Animate back to original scale automatically
                        transformOrigin: "center center", // Ensure scaling originates from the center
                        overwrite: "auto" // Prevent conflicts if somehow triggered again while running
                    });
                }
                // --- END HEARTBEAT ANIMATION ---
            }
        });

        // --- Define Mending Animation Sequence ---
        // 1. Draw the glowing Mending Lines (animate stroke offset to 0)
        tl.to(mendLines, {
            strokeDashoffset: 0,
            duration: 1.5,
            ease: "power1.inOut",
            stagger: 0.3 // Stagger start time for each line
        });
        // 2. Fade Out the original Crack Lines (start overlapping with step 1)
        tl.to(crackLines, {
            opacity: 0,
            duration: 1.0,
            ease: "power1.out"
        }, "-=1.2"); // Timing: overlap with previous step
        // 3. Fade Out the Mending Lines *after* they finish drawing (plus a slight delay)
        tl.to(mendLines, {
            opacity: 0,
            duration: 0.5,
            ease: "power1.out",
            delay: 0.2 // Wait briefly after drawing before fading
        }, ">"); // Timing: start after previous step naturally completes (+ delay)
        // 4. Fade In the Solid Heart Fill (start as mending lines begin to fade)
        tl.to(heartFill, {
            opacity: 1,
            duration: 1.0,
            ease: "sine.inOut"
        }, "<"); // Timing: start simultaneously with previous step
        // 5. Fade Out the initial Gray Outline (optional, for cleaner look)
        tl.to(heartOutline, {
            opacity: 0,
            duration: 0.5
        }, "<+=0.2"); // Timing: start slightly after fill starts fading in
        // 6. Ensure scale is 1 before heartbeat starts (important if removing a prior pulse)
        tl.set(heartFill, { scale: 1, transformOrigin: "center center" }, "-=0.1"); // Explicitly set scale and origin

    };

    // Handler for "No" button interaction (MouseOver and TouchStart)
    const handleNoInteraction = (event) => {
        // Optional: Prevent default touch behavior like scrolling if needed
        // if (event.type === 'touchstart') { event.preventDefault(); }

        const noButton = noButtonRef.current;
        const container = buttonContainerRef.current;
        // Stop if already mended or elements aren't ready
        if (!noButton || !container || isMended) return;

        // Use getBoundingClientRect for reliable dimensions, independent of box-sizing
        const containerRect = container.getBoundingClientRect();
        const buttonRect = noButton.getBoundingClientRect();

        // Calculate maximum possible coordinates within the container, accounting for padding
        const paddingBuffer = 10; // Safety buffer from edges
        const maxX = containerRect.width - buttonRect.width - (paddingBuffer * 2);
        const maxY = containerRect.height - buttonRect.height - (paddingBuffer); // Less vertical buffer usually needed

        const safeMaxX = Math.max(0, maxX); // Ensure max isn't negative if container is too small
        const safeMaxY = Math.max(0, maxY);

        // Define a "safe zone" around the Yes button (center) to avoid placing No button there
        const safeZoneCenterX = containerRect.width / 2;
        const safeZoneWidth = Math.min(100, containerRect.width * 0.4); // Adaptive safe zone width
        const safeZoneStartX = safeZoneCenterX - safeZoneWidth / 2;
        const safeZoneEndX = safeZoneCenterX + safeZoneWidth / 2;

        let randX, randY;
        const currentLeft = noButton.offsetLeft; // Get current position for comparison

        // Try multiple times to find a suitable random position
        let attempts = 0;
        do {
            // Calculate random position within the safe bounds
            randX = Math.random() * safeMaxX + paddingBuffer;
            randY = Math.random() * safeMaxY + (paddingBuffer / 2);
            attempts++;
        } while (
            // Conditions to re-try:
            (Math.abs(randX - currentLeft) < 40 || // Too close horizontally to previous position
                (randX > safeZoneStartX && randX < safeZoneEndX)) && // Inside the central safe zone
            attempts < 10 // Safety break to prevent infinite loop
        );

        // Ensure final calculated position doesn't exceed bounds due to randomness/buffer
        const finalX = Math.max(paddingBuffer, Math.min(randX, safeMaxX + paddingBuffer));
        const finalY = Math.max(paddingBuffer / 2, Math.min(randY, safeMaxY + paddingBuffer / 2));

        // Apply the new position using direct style manipulation
        noButton.style.left = `${finalX}px`;
        noButton.style.top = `${finalY}px`;
    };

    // Effect for GSAP Cleanup: Crucial to prevent memory leaks
    useEffect(() => {
        // Create a GSAP context associated with the cardRef
        // This allows GSAP to track animations created within this component
        const ctx = gsap.context(() => {
            // Initial GSAP setups could go here if needed on mount
        }, cardRef); // Scope the context to the card element

        // Return a cleanup function that runs when the component unmounts
        return () => {
            // Kill the heartbeat animation specifically if it exists when unmounting
            if (heartBeatAnim.current) {
                heartBeatAnim.current.kill();
                heartBeatAnim.current = null; // Clear the ref
            }
            // Revert all other GSAP animations/settings created in this context
            ctx.revert();
        };
    }, []); // Empty dependency array ensures this runs only on mount and unmount


    // --- Render the Component ---
    return (
        <div className={styles.cardWrapper}>
            {/* Particle Canvas: Rendered first, positioned behind the card */}
            <ParticleCanvas
                className={styles.particleCanvas}
                triggerBurst={triggerParticleBurst} // Pass the trigger state
                heartCenter={heartPosition}         // Pass the calculated heart center coords
            />

            {/* The Card itself */}
            <div className={styles.card} ref={cardRef}> {/* Attach GSAP context ref */}
                {/* Container for the Heart SVG */}
                <div ref={heartContainerRef} className={styles.heartContainer}>
                    {/* Pass svgRef and a className for CSS sizing */}
                    <HeartSVG ref={svgRef} className={styles.theHeartSvg} />
                </div>

                {/* Apology Message Section */}
                <div className={styles.message}>

                    {/* --- REPLACE the existing <p> tags with these --- */}

                    <p><strong>Rasgulla...</strong></p>
                    <p>I know maine gadbad kar di. Sach mein, from the bottom of my heart, I'm truly sorry.</p>
                    <p>Pata hai maine aapko hurt kiya, aur mujhe uss baat ka bahut bura lag raha hai.</p>
                    <p>aap mere liye sab kuch ho, seriously. My whole world.</p>
                    <p>aapki smile ke bina na... everything feels incomplete </p>
                    <p>I really hope you can forgive me.</p>

                    {/* --- End of replacement --- */}

                </div>
                {/* Quote Section */}
                <div className={styles.quote}>
                    "You're not just a part of my world, Rasgulla... aap hi meri duniya ho."
                </div>

                {/* Button Container */}
                <div ref={buttonContainerRef} className={styles.buttonContainer}>
                    {/* YES Button: Uses button element for accessibility */}
                    <button
                        className={styles.button}
                        onClick={handleYesClick}
                        disabled={isMending || isMended} // Disable during/after animation
                        aria-label="Forgive Me"
                    >
                        {/* Checkmark SVG - fill changes when mended */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill={isMended ? 'limegreen' : 'green'} width="60" height="60" viewBox="0 0 24 24"><path d="M20.285 6.709l-11.285 11.293-5.285-5.293 1.414-1.414 3.871 3.879 9.871-9.879z" /></svg>
                    </button>

                    {/* NO Button: Uses button element, handles mouse and touch */}
                    <button
                        ref={noButtonRef}
                        className={`${styles.button} ${styles.noButton}`} // Combine base and positional styles
                        onMouseOver={handleNoInteraction} // Trigger runaway on hover
                        onTouchStart={handleNoInteraction} // Trigger runaway on touch
                        disabled={isMended} // Disable after Yes is clicked
                        aria-label="Not Yet"
                    >
                        {/* Cross SVG - stroke changes when mended */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={isMended ? 'lightgrey' : 'red'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                {/* Optional confirmation message displayed after mending */}
                {isMended && <p style={{ color: 'limegreen', marginTop: '15px', fontWeight: 'bold' }}>I Love You! ❤️</p>}
            </div>
        </div>
    );
}

export default ApologyCard;