import React, { useEffect, useRef } from 'react';

export default function RelativisticTransition({ type, onComplete }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Handle window resize
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const centerX = width / 2;
    const centerY = height / 2;
    const startTime = Date.now();
    const duration = type === 'blackhole' ? 2000 : 1600; // Blackhole gets slightly longer for full rotation

    // Particle Classes depending on transition type
    const particles = [];
    const numParticles = type === 'warp' ? 200 : type === 'blackhole' ? 180 : type === 'supernova' ? 120 : 60;

    // Initialize particles
    if (type === 'blackhole') {
      // Swirling accretion disk particles
      for (let i = 0; i < numParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 150 + Math.random() * (Math.min(width, height) * 0.4);
        particles.push({
          angle,
          radius,
          speed: 0.04 + Math.random() * 0.04,
          size: 1 + Math.random() * 3,
          color: `hsl(${15 + Math.random() * 30}, 100%, ${60 + Math.random() * 30}%)`, // Orange-red accretion colors
        });
      }
    } else if (type === 'warp') {
      // Hyperdrive starfield particles
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: (Math.random() - 0.5) * width,
          y: (Math.random() - 0.5) * height,
          z: Math.random() * width,
          size: 0.5 + Math.random() * 1.5,
        });
      }
    } else if (type === 'supernova') {
      // Burst sparks
      for (let i = 0; i < numParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 12;
        particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 1 + Math.random() * 4,
          color: `hsl(${Math.random() * 45}, 100%, ${50 + Math.random() * 50}%)`, // Red/Orange/Yellow sparks
          alpha: 1,
        });
      }
    } else if (type === 'redshift') {
      // Ripple waves
      for (let i = 0; i < 8; i++) {
        particles.push({
          radius: i * 80,
          speed: 3 + Math.random() * 2,
          alpha: 0.8 - i * 0.1,
        });
      }
    } else {
      // Quantum tunneling matrix items
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          char: Math.random() > 0.5 ? '1' : '0',
          speed: 1 + Math.random() * 4,
          size: 10 + Math.random() * 14,
          color: `rgba(${Math.random() > 0.5 ? '0, 255, 128' : '0, 190, 255'}, ${0.1 + Math.random() * 0.8})`,
        });
      }
    }

    // Animation Loop
    const draw = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Clean canvas
      ctx.clearRect(0, 0, width, height);

      // ----------------------------------------------------------------
      // ANIMATION 1: BLACK HOLE VORTEX
      // ----------------------------------------------------------------
      if (type === 'blackhole') {
        // Accretion background glow
        const glowRadius = (Math.min(width, height) * 0.35) * (1 - progress * 0.4);
        const grad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, Math.max(10, glowRadius));
        grad.addColorStop(0, 'rgba(0,0,0,1)');
        grad.addColorStop(0.15, 'rgba(10, 0, 5, 0.95)');
        grad.addColorStop(0.2, 'rgba(255, 60, 0, 0.9)');
        grad.addColorStop(0.3, 'rgba(255, 140, 0, 0.4)');
        grad.addColorStop(0.6, 'rgba(130, 0, 255, 0.15)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.max(10, glowRadius * 2.5), 0, Math.PI * 2);
        ctx.fill();

        // Swirling accretion stars
        particles.forEach((p) => {
          // Increase speed and pull towards center as time passes
          const speedMultiplier = 1 + progress * 5;
          p.angle += p.speed * speedMultiplier;
          p.radius -= (p.radius * 0.015) * speedMultiplier; // Spiral inwards

          if (p.radius < 10) {
            p.radius = 150 + Math.random() * (Math.min(width, height) * 0.4);
          }

          const px = centerX + Math.cos(p.angle) * p.radius;
          const py = centerY + Math.sin(p.angle) * p.radius;

          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(px, py, p.size * (1 - progress * 0.7), 0, Math.PI * 2);
          ctx.fill();
        });

        // Event Horizon: Central singularity
        const singularityRadius = 65 * (1 + Math.sin(progress * Math.PI) * 0.15) * (1 - progress);
        ctx.shadowColor = '#ff6600';
        ctx.shadowBlur = 25 * (1 - progress);
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.max(0, singularityRadius), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow

        // Gravitational Lens distortion rings
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.12 * (1 - progress)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.max(1, singularityRadius * 1.5), 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 120, 0, ${0.08 * (1 - progress)})`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.max(1, singularityRadius * 2.2), 0, Math.PI * 2);
        ctx.stroke();

        // Fade viewport to pitch black at the end
        if (progress > 0.8) {
          const darkFade = (progress - 0.8) / 0.2;
          ctx.fillStyle = `rgba(0, 0, 0, ${darkFade})`;
          ctx.fillRect(0, 0, width, height);
        }

      // ----------------------------------------------------------------
      // ANIMATION 2: HYPERDRIVE WARP DRIVE
      // ----------------------------------------------------------------
      } else if (type === 'warp') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        // Render warping star trails
        particles.forEach((p) => {
          // Adjust z depth to zoom in
          const warpSpeed = 10 + progress * 65;
          p.z -= warpSpeed;

          if (p.z <= 0) {
            p.z = width;
            p.x = (Math.random() - 0.5) * width;
            p.y = (Math.random() - 0.5) * height;
          }

          // Calculate screen projections
          const k = 128.0 / p.z;
          const px = p.x * k + centerX;
          const py = p.y * k + centerY;

          // Stretch length based on speed/distance
          const tailLength = 1 + (warpSpeed * 0.15);
          const pxPrev = p.x * (128.0 / (p.z + tailLength)) + centerX;
          const pyPrev = p.y * (128.0 / (p.z + tailLength)) + centerY;

          if (px >= 0 && px <= width && py >= 0 && py <= height) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, (1 - p.z / width) * 1.5)})`;
            ctx.lineWidth = p.size * (k * 0.8);
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(pxPrev, pyPrev);
            ctx.stroke();
          }
        });

        // Blinding white flash overlay at hyperspace snap
        if (progress > 0.75) {
          const flashFade = (progress - 0.75) / 0.25;
          ctx.fillStyle = `rgba(255, 255, 255, ${flashFade})`;
          ctx.fillRect(0, 0, width, height);
        }

      // ----------------------------------------------------------------
      // ANIMATION 3: SUPERNOVA EXPLOSION
      // ----------------------------------------------------------------
      } else if (type === 'supernova') {
        // Expand core star
        if (progress < 0.3) {
          const size = 10 + progress * 150;
          const starGrad = ctx.createRadialGradient(centerX, centerY, 1, centerX, centerY, size);
          starGrad.addColorStop(0, '#ffffff');
          starGrad.addColorStop(0.3, '#ffea88');
          starGrad.addColorStop(0.6, 'rgba(255, 90, 0, 0.8)');
          starGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');

          ctx.fillStyle = starGrad;
          ctx.beginPath();
          ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Shockwave rings expanding
          const shockProgress = (progress - 0.3) / 0.7;
          const waveRadius = Math.max(1, shockProgress * Math.max(width, height) * 0.85);

          // Render exploding spark particles
          particles.forEach((p) => {
            p.x += p.vx * (1 + shockProgress * 1.5);
            p.y += p.vy * (1 + shockProgress * 1.5);
            p.alpha -= 0.012;

            if (p.alpha > 0) {
              ctx.fillStyle = p.color;
              ctx.globalAlpha = p.alpha;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fill();
            }
          });
          ctx.globalAlpha = 1.0; // Reset alpha

          // Plasma shockwave ring
          const ringGrad = ctx.createRadialGradient(centerX, centerY, Math.max(0, waveRadius - 60), centerX, centerY, waveRadius + 10);
          ringGrad.addColorStop(0, 'rgba(0, 150, 255, 0)');
          ringGrad.addColorStop(0.7, `rgba(255, 255, 255, ${0.9 * (1 - shockProgress)})`);
          ringGrad.addColorStop(0.85, `rgba(255, 95, 0, ${0.7 * (1 - shockProgress)})`);
          ringGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');

          ctx.fillStyle = ringGrad;
          ctx.beginPath();
          ctx.arc(centerX, centerY, waveRadius + 10, 0, Math.PI * 2);
          ctx.fill();
        }

        // Full screen blinding white fadeout
        if (progress > 0.7) {
          const fadeAmount = (progress - 0.7) / 0.3;
          ctx.fillStyle = `rgba(255, 255, 255, ${fadeAmount})`;
          ctx.fillRect(0, 0, width, height);
        }

      // ----------------------------------------------------------------
      // ANIMATION 4: TIME DILATION CLOCK & REDSHIFT RIPPLES
      // ----------------------------------------------------------------
      } else if (type === 'redshift') {
        // Redshift wave ripples
        particles.forEach((w) => {
          w.radius += w.speed;
          if (w.radius > Math.max(width, height) * 0.6) {
            w.radius = 0;
          }

          ctx.strokeStyle = `rgba(255, 0, 128, ${(0.25 * (1 - w.radius / (Math.max(width, height) * 0.6)))})`;
          ctx.lineWidth = 12 * (1 - w.radius / (Math.max(width, height) * 0.6));
          ctx.beginPath();
          ctx.arc(centerX, centerY, w.radius, 0, Math.PI * 2);
          ctx.stroke();
        });

        // Draw time-dilation clock face in center
        ctx.save();
        ctx.translate(centerX, centerY);
        const clockScale = 120 * (1 - Math.sin(progress * Math.PI) * 0.1);
        
        // Outer rim
        ctx.strokeStyle = `rgba(0, 190, 255, ${0.7 * (1 - progress)})`;
        ctx.lineWidth = 6;
        ctx.shadowColor = '#00beff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, 0, clockScale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Hour markings
        ctx.strokeStyle = `rgba(0, 190, 255, ${0.5 * (1 - progress)})`;
        ctx.lineWidth = 3;
        for (let i = 0; i < 12; i++) {
          ctx.rotate(Math.PI / 6);
          ctx.beginPath();
          ctx.moveTo(0, -clockScale + 8);
          ctx.lineTo(0, -clockScale + 18);
          ctx.stroke();
        }

        // Ticking Clock Hands (Speed warps dynamically)
        // Spin fast initially, then slow to a complete standstill
        const clockAngle = (Math.pow(progress, 0.4) * Math.PI * 18);
        
        // Hour hand
        ctx.save();
        ctx.rotate(clockAngle / 12);
        ctx.strokeStyle = `rgba(255, 0, 128, ${0.9 * (1 - progress)})`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, 15);
        ctx.lineTo(0, -clockScale * 0.5);
        ctx.stroke();
        ctx.restore();

        // Minute hand
        ctx.save();
        ctx.rotate(clockAngle);
        ctx.strokeStyle = `rgba(0, 255, 128, ${0.9 * (1 - progress)})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 20);
        ctx.lineTo(0, -clockScale * 0.85);
        ctx.stroke();
        ctx.restore();

        ctx.restore();

        // Redshift chromatic warp overlay
        if (progress > 0.8) {
          const shiftFade = (progress - 0.8) / 0.2;
          ctx.fillStyle = `rgba(10, 0, 25, ${shiftFade * 0.95})`;
          ctx.fillRect(0, 0, width, height);
        }

      // ----------------------------------------------------------------
      // ANIMATION 5: QUANTUM TUNNELING BINARY GRID
      // ----------------------------------------------------------------
      } else {
        // Render digital binary particles scanning vertically
        particles.forEach((p) => {
          p.y += p.speed * (1 + progress * 2);
          if (p.y > height) {
            p.y = 0;
            p.x = Math.random() * width;
          }

          ctx.font = `bold ${p.size}px monospace`;
          ctx.fillStyle = p.color;
          ctx.fillText(p.char, p.x, p.y);

          // Change character randomly
          if (Math.random() > 0.95) {
            p.char = p.char === '1' ? '0' : '1';
          }
        });

        // Scanline bar
        const scanY = (progress * height * 1.5) % height;
        ctx.fillStyle = 'rgba(0, 255, 128, 0.08)';
        ctx.fillRect(0, scanY - 50, width, 100);

        // Blinding grid fadeout
        if (progress > 0.85) {
          const gridFade = (progress - 0.85) / 0.15;
          ctx.fillStyle = `rgba(10, 25, 20, ${gridFade})`;
          ctx.fillRect(0, 0, width, height);
        }
      }

      // Stop loop or continue frame
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(draw);
      } else {
        onComplete();
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [type, onComplete]);

  return (
    <div className="relativistic-transition-overlay">
      <canvas ref={canvasRef} className="relativistic-transition-canvas" />
      <style>{`
        .relativistic-transition-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 9999;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .relativistic-transition-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
