// src/components/ParticleCanvas.jsx
import React, { useRef, useEffect, useState } from 'react';

// Configuration for particles
const PARTICLE_CONFIG = {
  count: 100, // Base number of particles (adjust as needed)
  mobileCount: 60, // Reduced count for smaller screens
  minSpeed: 0.1,
  maxSpeed: 0.5,
  minRadius: 1,
  maxRadius: 2.5,
  color: 'rgba(255, 255, 255, 0.6)', // Subtle white/transparent
  burstSpeedMultiplier: 6, // How fast particles burst outwards (adjust)
  burstDampening: 0.96, // How quickly burst speed fades (0.9 to 0.99)
  // Optional connection line settings (can impact performance)
  // connectionDistance: 100,
  // connectionColor: 'rgba(255, 255, 255, 0.05)',
};

const ParticleCanvas = ({ className, triggerBurst, heartCenter }) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationFrameIdRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isBursting, setIsBursting] = useState(false);

  // Initialize or reset particles
  const initializeParticles = (canvas) => {
    particlesRef.current = [];
    const { width, height } = canvas;
    // Adjust count based on screen width
    const isMobile = width < 600;
    const count = isMobile ? PARTICLE_CONFIG.mobileCount : PARTICLE_CONFIG.count;

    for (let i = 0; i < count; i++) {
      const radius = Math.random() * (PARTICLE_CONFIG.maxRadius - PARTICLE_CONFIG.minRadius) + PARTICLE_CONFIG.minRadius;
      const x = Math.random() * width;
      const y = Math.random() * height;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * (PARTICLE_CONFIG.maxSpeed - PARTICLE_CONFIG.minSpeed) + PARTICLE_CONFIG.minSpeed;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      particlesRef.current.push({
        x, y, vx, vy, radius,
        initialVx: vx, initialVy: vy, // Store original velocity for reset
        targetX: null, targetY: null, burstSpeed: 0
      });
    }
  };

  // Update particle positions and handle effects
  const updateParticles = (canvas) => {
    const { width, height } = canvas;
    particlesRef.current.forEach(p => {
      // Burst effect
      if (isBursting && p.burstSpeed > 0) {
          p.x += p.vx * p.burstSpeed;
          p.y += p.vy * p.burstSpeed;
          p.burstSpeed *= PARTICLE_CONFIG.burstDampening; // Dampen burst speed
          if (p.burstSpeed < 0.1) {
              p.burstSpeed = 0;
              // Reset to normal drift speed/direction after burst fades
              p.vx = p.initialVx;
              p.vy = p.initialVy;
          }
      } else if (!isBursting && p.burstSpeed === 0) { // Only drift if not bursting & burst is finished
          // Normal drift
          p.x += p.vx;
          p.y += p.vy;
      }

      // Boundary checks (wrap around screen)
      if (p.x < -p.radius) p.x = width + p.radius;
      if (p.x > width + p.radius) p.x = -p.radius;
      if (p.y < -p.radius) p.y = height + p.radius;
      if (p.y > height + p.radius) p.y = -p.radius;
    });
  };

  // Draw particles
  const drawParticles = (ctx) => {
      particlesRef.current.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = PARTICLE_CONFIG.color;
        ctx.fill();
      });

    // --- Optional: Draw connection lines (commented out by default) ---
    // const connectDistSq = PARTICLE_CONFIG.connectionDistance * PARTICLE_CONFIG.connectionDistance;
    // ctx.lineWidth = 0.5;
    // ctx.strokeStyle = PARTICLE_CONFIG.connectionColor;
    // for (let i = 0; i < particlesRef.current.length; i++) {
    //     for (let j = i + 1; j < particlesRef.current.length; j++) {
    //         const p1 = particlesRef.current[i];
    //         const p2 = particlesRef.current[j];
    //         const dx = p1.x - p2.x;
    //         const dy = p1.y - p2.y;
    //         const distanceSq = dx * dx + dy * dy;
    //         if (distanceSq < connectDistSq) {
    //             ctx.beginPath();
    //             ctx.moveTo(p1.x, p1.y);
    //             ctx.lineTo(p2.x, p2.y);
    //             ctx.stroke();
    //         }
    //     }
    // }
    // --- End Optional Connection Lines ---
  };

  // Animation loop
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas each frame
    updateParticles(canvas); // Update positions
    drawParticles(ctx);      // Draw particles

    animationFrameIdRef.current = requestAnimationFrame(animate); // Continue loop
  };

  // Effect for setup, resize handling, and starting animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      // Only resize and re-initialize if dimensions actually changed
      if (newWidth !== dimensions.width || newHeight !== dimensions.height) {
          setDimensions({ width: newWidth, height: newHeight });
          canvas.width = newWidth;
          canvas.height = newHeight;
          initializeParticles(canvas); // Re-initialize particles for new size/count
      }
    };

    handleResize(); // Initial size setup & particle init
    window.addEventListener('resize', handleResize); // Add resize listener

    animationFrameIdRef.current = requestAnimationFrame(animate); // Start animation loop

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize); // Remove listener
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current); // Stop animation loop
      }
    };
  }, [dimensions.width, dimensions.height]); // Rerun effect if dimensions change

  // Effect to handle the burst trigger from the parent
  useEffect(() => {
      // Trigger only when the counter increments (value > 0) and heartCenter is known
      if (triggerBurst > 0 && heartCenter && heartCenter.x !== 0) {
          setIsBursting(true);
          particlesRef.current.forEach(p => {
              // Calculate direction vector from heart center to particle
              const dx = p.x - heartCenter.x;
              const dy = p.y - heartCenter.y;
              const dist = Math.sqrt(dx*dx + dy*dy);

              // Normalize the direction vector (handle zero distance case)
              const burstVx = (dist > 0) ? dx / dist : Math.cos(Math.random() * Math.PI * 2);
              const burstVy = (dist > 0) ? dy / dist : Math.sin(Math.random() * Math.PI * 2);

              p.vx = burstVx; // Set direction for burst (temporary)
              p.vy = burstVy;
              // Assign random burst speed magnitude
              p.burstSpeed = Math.random() * PARTICLE_CONFIG.burstSpeedMultiplier + (PARTICLE_CONFIG.burstSpeedMultiplier / 2);
          });

          // Automatically reset bursting state after a while
          const timer = setTimeout(() => {
              setIsBursting(false);
              // Particles will naturally reset velocity via updateParticles logic
          }, 2500); // Duration of burst effect visibility (adjust as needed)

          return () => clearTimeout(timer); // Cleanup timeout if trigger changes quickly
      }
  }, [triggerBurst, heartCenter]); // Depend on trigger counter and heartCenter position

  return <canvas ref={canvasRef} className={className} />;
};

export default ParticleCanvas;