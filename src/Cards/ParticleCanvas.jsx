// src/components/ParticleCanvas.jsx
import React, { useRef, useEffect, useState } from 'react';

// Configuration for particles
const PARTICLE_CONFIG = {
  count: 100, // Number of particles
  minSpeed: 0.1,
  maxSpeed: 0.5,
  minRadius: 1,
  maxRadius: 2.5,
  color: 'rgba(255, 255, 255, 0.6)', // Subtle white/transparent
  connectionDistance: 100, // Max distance to draw connection lines (optional)
  connectionColor: 'rgba(255, 255, 255, 0.05)', // Very faint connection lines
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
    for (let i = 0; i < PARTICLE_CONFIG.count; i++) {
      const radius = Math.random() * (PARTICLE_CONFIG.maxRadius - PARTICLE_CONFIG.minRadius) + PARTICLE_CONFIG.minRadius;
      const x = Math.random() * width;
      const y = Math.random() * height;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * (PARTICLE_CONFIG.maxSpeed - PARTICLE_CONFIG.minSpeed) + PARTICLE_CONFIG.minSpeed;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      particlesRef.current.push({ x, y, vx, vy, radius, initialVx: vx, initialVy: vy, targetX: null, targetY: null, burstSpeed: 0 });
    }
  };

  // Update particle positions and handle effects
  const updateParticles = (canvas, ctx) => {
    const { width, height } = canvas;
    particlesRef.current.forEach(p => {
      // Burst effect
      if (isBursting && p.burstSpeed > 0) {
          p.x += p.vx * p.burstSpeed;
          p.y += p.vy * p.burstSpeed;
          p.burstSpeed *= 0.96; // Dampen burst speed
          if (p.burstSpeed < 0.1) {
              p.burstSpeed = 0;
              // Reset to normal drift after burst fades
              p.vx = p.initialVx;
              p.vy = p.initialVy;
          }
      } else {
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

  // Draw particles and optional connections
  const drawParticles = (ctx) => {
      particlesRef.current.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = PARTICLE_CONFIG.color;
        ctx.fill();
      });

    // Optional: Draw faint connection lines between close particles
    // This can be performance intensive, keep connectionDistance reasonable
    // ctx.lineWidth = 0.5;
    // ctx.strokeStyle = PARTICLE_CONFIG.connectionColor;
    // for (let i = 0; i < particlesRef.current.length; i++) {
    //     for (let j = i + 1; j < particlesRef.current.length; j++) {
    //         const dx = particlesRef.current[i].x - particlesRef.current[j].x;
    //         const dy = particlesRef.current[i].y - particlesRef.current[j].y;
    //         const distance = Math.sqrt(dx * dx + dy * dy);
    //         if (distance < PARTICLE_CONFIG.connectionDistance) {
    //             ctx.beginPath();
    //             ctx.moveTo(particlesRef.current[i].x, particlesRef.current[i].y);
    //             ctx.lineTo(particlesRef.current[j].x, particlesRef.current[j].y);
    //             ctx.stroke();
    //         }
    //     }
    // }
  };

  // Animation loop
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateParticles(canvas, ctx);
    drawParticles(ctx);

    animationFrameIdRef.current = requestAnimationFrame(animate);
  };

  // Effect for setup and resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      setDimensions({ width: newWidth, height: newHeight });
      canvas.width = newWidth;
      canvas.height = newHeight;
      // Re-initialize particles on resize to distribute them evenly
      initializeParticles(canvas);
    };

    handleResize(); // Initial size setup
    window.addEventListener('resize', handleResize);

    // Start animation loop
    animationFrameIdRef.current = requestAnimationFrame(animate);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Effect to handle the burst trigger from the parent
  useEffect(() => {
      if (triggerBurst && heartCenter) {
          setIsBursting(true);
          particlesRef.current.forEach(p => {
              // Calculate direction vector from heart center
              const dx = p.x - heartCenter.x;
              const dy = p.y - heartCenter.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              // Normalize the direction vector
              const burstVx = (dist > 0) ? dx / dist : Math.random() - 0.5;
              const burstVy = (dist > 0) ? dy / dist : Math.random() - 0.5;

              p.vx = burstVx; // Set direction for burst
              p.vy = burstVy;
              p.burstSpeed = Math.random() * 8 + 4; // Assign random burst speed magnitude
          });

          // Reset burst state after a delay (e.g., 2 seconds)
          const timer = setTimeout(() => {
              setIsBursting(false);
              // Could optionally reset particles to drift here if needed
              // Or let the update loop handle it when burstSpeed dampens
          }, 2000);
          return () => clearTimeout(timer); // Cleanup timeout
      }
  }, [triggerBurst, heartCenter]); // Depend on trigger and heartCenter


  return <canvas ref={canvasRef} className={className} />;
};

export default ParticleCanvas;