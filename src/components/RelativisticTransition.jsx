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
    
    // Physics durations: blackhole gets extra time to feel massive
    const duration = type === 'blackhole' ? 2400 : type === 'warp' ? 1800 : type === 'supernova' ? 1900 : 1700;

    // Initialize arrays depending on transition type
    const particles = [];
    const stars = []; // Specifically for blackhole background stars
    const secondaryList = []; // Helper for extra elements

    if (type === 'blackhole') {
      // 1. Accretion gas particles (swirling dust lanes)
      const numGasParticles = 350;
      for (let i = 0; i < numGasParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 80 + Math.random() * (Math.min(width, height) * 0.5);
        particles.push({
          angle,
          radius,
          speed: 0.03 + Math.random() * 0.04,
          size: 1.0 + Math.random() * 3.0,
          orbitOffset: (Math.random() - 0.5) * 15,
          hue: Math.random() > 0.8 ? 25 : Math.random() * 20, // Orange-red base
          alpha: 0.4 + Math.random() * 0.6,
        });
      }

      // 2. Background stars for gravitational lensing
      const numStars = 120;
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 0.8 + Math.random() * 1.5,
          alpha: 0.3 + Math.random() * 0.7,
        });
      }
    } else if (type === 'warp') {
      // 1. 3D Starfield
      const numWarpStars = 400;
      for (let i = 0; i < numWarpStars; i++) {
        particles.push({
          x: (Math.random() - 0.5) * width * 2.5,
          y: (Math.random() - 0.5) * height * 2.5,
          z: Math.random() * width,
          size: 0.5 + Math.random() * 2.0,
          color: Math.random() > 0.85 
            ? 'rgba(120, 220, 255, 0.95)' // Cyan/Blue trails
            : Math.random() > 0.9 
              ? 'rgba(255, 120, 220, 0.9)' // Magenta sparks
              : 'rgba(255, 255, 255, 0.95)', // White
        });
      }

      // 2. Swirling Nebula Clouds
      const numClouds = 6;
      for (let i = 0; i < numClouds; i++) {
        secondaryList.push({
          angle: (i * Math.PI * 2) / numClouds,
          radius: 50 + Math.random() * 200,
          speed: 0.005 + Math.random() * 0.005,
          size: 150 + Math.random() * 250,
          hue: i % 3 === 0 ? 270 : i % 3 === 1 ? 190 : 320, // Violet, Cyan, Pink
        });
      }
    } else if (type === 'supernova') {
      // 1. Ejecta sparks
      const numSparks = 250;
      for (let i = 0; i < numSparks; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2.0 + Math.random() * 18.0;
        particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 1.5 + Math.random() * 4.5,
          hue: Math.random() > 0.7 
            ? 195 + Math.random() * 25  // Blue-white hot core elements
            : Math.random() > 0.5 
              ? 10 + Math.random() * 20 // Orange
              : 350 + Math.random() * 20, // Red
          alpha: 1.0,
          drag: 0.965 + Math.random() * 0.02,
          sizeDecay: 0.985 + Math.random() * 0.01,
        });
      }
    } else if (type === 'redshift') {
      // 1. Ripple waves
      const numRipples = 6;
      for (let i = 0; i < numRipples; i++) {
        particles.push({
          radius: i * 140,
          speed: 3.5 + Math.random() * 2.0,
          opacity: 1.0,
        });
      }
    } else {
      // Quantum Tunneling Grid Nodes and Binary Streams
      const numNodes = 40;
      for (let i = 0; i < numNodes; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          size: 2 + Math.random() * 4,
          alpha: 0.15 + Math.random() * 0.45,
        });
      }

      const numStreams = 70;
      for (let i = 0; i < numStreams; i++) {
        secondaryList.push({
          x: Math.random() * width,
          y: Math.random() * height,
          speed: 3 + Math.random() * 6,
          char: Math.random() > 0.5 ? '1' : '0',
          size: 10 + Math.random() * 14,
          opacity: 0.2 + Math.random() * 0.6,
        });
      }
    }

    // Mathematical coordinate warping for general relativity space-time fabric bending
    const getWarpedCoords = (x, y, warpStrength, singularityRadius) => {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < singularityRadius) {
        return { wx: centerX, wy: centerY, scale: 0 };
      }

      // Einstein gravitational lensing formula: bend factor increases closer to singularity
      const pull = Math.pow(Math.max(0.1, dist / 200), 2.2);
      const warpFactor = 1 - Math.exp(-pull / (warpStrength + 0.0001));
      const warpedDist = dist * warpFactor;

      return {
        wx: centerX + (dx / dist) * warpedDist,
        wy: centerY + (dy / dist) * warpedDist,
        scale: warpFactor,
      };
    };

    // Helper to draw space-time grid fabric
    const drawSpaceTimeGrid = (warpStrength, singularityRadius) => {
      const alpha = Math.max(0, 0.22 * (1 - (warpStrength / 3.0)));
      ctx.strokeStyle = `rgba(34, 197, 94, ${alpha})`;
      ctx.lineWidth = 0.85;

      const gridSize = 50;
      const xLines = Math.ceil(width / gridSize);
      const yLines = Math.ceil(height / gridSize);

      // Horizontal lines (drawn as segments to enable warping)
      for (let y = 0; y <= yLines; y++) {
        const ly = y * gridSize;
        ctx.beginPath();
        for (let x = 0; x <= width; x += 15) {
          const { wx, wy } = getWarpedCoords(x, ly, warpStrength, singularityRadius);
          if (x === 0) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        }
        ctx.stroke();
      }

      // Vertical lines
      for (let x = 0; x <= xLines; x++) {
        const lx = x * gridSize;
        ctx.beginPath();
        for (let y = 0; y <= height; y += 15) {
          const { wx, wy } = getWarpedCoords(lx, y, warpStrength, singularityRadius);
          if (y === 0) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        }
        ctx.stroke();
      }
    };

    // Helper to draw clock gears with neon outline and drop shadow
    const drawGear = (x, y, radius, numTeeth, angle, color, alpha, shadowColor) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.globalAlpha = alpha;

      // Enable neon glow properties
      ctx.shadowBlur = 15;
      ctx.shadowColor = shadowColor || color;

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 3.0;

      // Outer Ring
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.85, 0, Math.PI * 2);
      ctx.stroke();

      // Inner Hub Ring
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.25, 0, Math.PI * 2);
      ctx.stroke();

      // Spoke Crossbars
      const spokeCount = 6;
      for (let i = 0; i < spokeCount; i++) {
        ctx.rotate(Math.PI / (spokeCount / 2));
        ctx.fillRect(-2, -radius * 0.8, 4, radius * 1.6);
      }

      // Gear Teeth
      for (let i = 0; i < numTeeth; i++) {
        const toothAngle = (i * Math.PI * 2) / numTeeth;
        ctx.save();
        ctx.rotate(toothAngle);
        
        ctx.beginPath();
        ctx.moveTo(-5, -radius * 0.83);
        ctx.lineTo(-3, -radius - 4);
        ctx.lineTo(3, -radius - 4);
        ctx.lineTo(5, -radius * 0.83);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    };

    // Animation loop
    const draw = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1.0);

      // Clean canvas
      ctx.clearRect(0, 0, width, height);

      // ====================================================================
      // ANIMATION 1: RELATIVISTIC BLACK HOLE (Gargantua General Relativity)
      // ====================================================================
      if (type === 'blackhole') {
        const warpStrength = progress * 3.2;
        const singularityRadius = 90 * progress;

        // 1. Draw and lens background stars
        ctx.fillStyle = '#ffffff';
        stars.forEach((s) => {
          const { wx, wy, scale } = getWarpedCoords(s.x, s.y, warpStrength, singularityRadius);
          if (scale > 0) {
            ctx.globalAlpha = s.alpha * (1.0 - progress * 0.3);
            ctx.beginPath();
            ctx.arc(wx, wy, s.size * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        });
        ctx.globalAlpha = 1.0;

        // 2. Draw space-time fabric grid (warped)
        drawSpaceTimeGrid(warpStrength, singularityRadius);

        // 3. Volumetric Accretion Disk (Einstein Lensing)
        const glowRadius = (Math.min(width, height) * 0.38) * (1.0 - progress * 0.45);
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        // Lensed Back of Accretion Disk (bent OVER the event horizon by gravity)
        ctx.lineWidth = 25 * (1.0 - progress * 0.8);
        ctx.shadowBlur = 35 * (1.0 - progress * 0.5);
        ctx.shadowColor = 'rgba(255, 60, 0, 0.8)';
        
        ctx.strokeStyle = 'rgba(255, 110, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY - 8 * progress, glowRadius * 1.05, glowRadius * 0.45, 0, Math.PI, 0);
        ctx.stroke();

        // Lensed Back of Accretion Disk (bent UNDER the event horizon by gravity)
        ctx.strokeStyle = 'rgba(255, 45, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + 8 * progress, glowRadius * 1.05, glowRadius * 0.42, 0, 0, Math.PI);
        ctx.stroke();

        // Main Horizontal Accretion Disk crossing the center
        // Create Relativistic Doppler Boosting Gradient (left half is blue/white-hot, right is red/dim)
        const boostGrad = ctx.createLinearGradient(centerX - glowRadius * 1.4, centerY, centerX + glowRadius * 1.4, centerY);
        boostGrad.addColorStop(0, 'rgba(220, 245, 255, 0.9)'); // White-blue hot (moving towards observer)
        boostGrad.addColorStop(0.25, 'rgba(255, 200, 50, 0.85)'); // Yellow
        boostGrad.addColorStop(0.5, 'rgba(255, 90, 0, 0.7)'); // Orange
        boostGrad.addColorStop(0.75, 'rgba(200, 30, 0, 0.45)'); // Deep red
        boostGrad.addColorStop(1, 'rgba(100, 0, 0, 0.15)'); // Dim infra-red (moving away)

        ctx.strokeStyle = boostGrad;
        ctx.lineWidth = 45 * (1.0 - progress * 0.8);
        ctx.shadowColor = 'rgba(255, 140, 0, 0.6)';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, glowRadius * 1.4, glowRadius * 0.16, -Math.PI / 18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 4. Swirling Gas Orbit Particles (Accretion Flow)
        particles.forEach((p) => {
          const speedMultiplier = 1.0 + progress * 8.0;
          p.angle += p.speed * speedMultiplier;
          p.radius -= (p.radius * 0.016) * speedMultiplier; // Spiral inwards due to gravity

          // Keep recycling particles that fall into singularity
          if (p.radius < singularityRadius + 2) {
            p.radius = 120 + Math.random() * (Math.min(width, height) * 0.45);
            p.angle = Math.random() * Math.PI * 2;
          }

          // Map orbit coordinates to ellipse
          const pxRaw = centerX + Math.cos(p.angle) * p.radius;
          const pyRaw = centerY + Math.sin(p.angle) * p.radius * 0.35; // Flattened orbit plane

          // Apply relativistic gravity warp
          const { wx, wy, scale } = getWarpedCoords(pxRaw, pyRaw, warpStrength, singularityRadius);

          if (scale > 0) {
            // Doppler color shift based on angle (left side of disk is brighter & hotter)
            const cosAngle = Math.cos(p.angle); // -1 is leftmost, 1 is rightmost
            let hue = p.hue;
            let saturation = 100;
            let lightness = 55;

            if (cosAngle < -0.2) {
              // Hotter (Blue/White shifted)
              hue = 200 + (1.0 + cosAngle) * 50; // Cyan-white range
              lightness = 75 + Math.abs(cosAngle) * 15;
            } else {
              // Cooler (Red shifted)
              hue = Math.max(0, 30 + cosAngle * 25); // Orange to red
              lightness = 40 + (1.0 - cosAngle) * 15;
            }

            ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${p.alpha * (1.0 - progress * 0.4)})`;
            ctx.beginPath();
            ctx.arc(wx, wy, p.size * scale * (1.0 - progress * 0.6), 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // 5. Event Horizon (Perfect Schwarzschild Black Sphere)
        const currentSingularityRadius = singularityRadius * (1.0 + Math.sin(progress * Math.PI * 6) * 0.04) * (1.0 - progress * 0.2);
        
        ctx.fillStyle = '#000000';
        ctx.save();
        ctx.shadowColor = '#ff3c00';
        ctx.shadowBlur = 45 * (1.0 - progress * 0.8);
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.max(0, currentSingularityRadius), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Singularity event horizon expansion overlay
        if (progress > 0.8) {
          const fade = (progress - 0.8) / 0.2;
          // Volumetric gravity suck out: dark wave swallowing everything
          const waveRadius = (progress - 0.8) * Math.max(width, height) * 1.5;
          const radialGrad = ctx.createRadialGradient(centerX, centerY, currentSingularityRadius, centerX, centerY, waveRadius);
          radialGrad.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
          radialGrad.addColorStop(0.5, 'rgba(11, 15, 25, 0.9)');
          radialGrad.addColorStop(1.0, 'rgba(11, 15, 25, 0.0)');
          
          ctx.fillStyle = radialGrad;
          ctx.beginPath();
          ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(0, 0, 0, ${fade})`;
          ctx.fillRect(0, 0, width, height);
        }

      // ====================================================================
      // ANIMATION 2: COSMIC WORMHOLE / WARP JUMP
      // ====================================================================
      } else if (type === 'warp') {
        // Space vacuum background
        ctx.fillStyle = '#020308';
        ctx.fillRect(0, 0, width, height);

        // 1. Draw swirling rotating nebula layers
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(progress * Math.PI * 1.6);
        
        secondaryList.forEach((c) => {
          c.angle += c.speed;
          const cx = Math.cos(c.angle) * c.radius;
          const cy = Math.sin(c.angle) * c.radius;

          const cloudGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, c.size);
          cloudGrad.addColorStop(0, `hsla(${c.hue}, 95%, 45%, ${0.18 * (1.0 - progress * 0.4)})`);
          cloudGrad.addColorStop(0.5, `hsla(${c.hue + 30}, 90%, 35%, ${0.08 * (1.0 - progress * 0.4)})`);
          cloudGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = cloudGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, c.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();

        // 2. Draw spiraling warp wormhole tunnel rings
        const numRings = 7;
        ctx.save();
        ctx.lineWidth = 2.0;
        for (let i = 0; i < numRings; i++) {
          const ringProgress = (progress + i / numRings) % 1.0;
          // Exponential expansion to simulate flying down a tunnel
          const ringRad = Math.pow(ringProgress, 3.0) * Math.max(width, height) * 0.9;
          
          if (ringRad > 5) {
            // Draw ring as a spiral path
            ctx.beginPath();
            const points = 60;
            for (let j = 0; j <= points; j++) {
              const theta = (j * Math.PI * 2) / points;
              // Add spiral twist based on progress
              const twist = ringProgress * Math.PI * 1.5;
              const r = ringRad * (1.0 + Math.sin(theta * 3 + twist) * 0.08);
              const rx = centerX + Math.cos(theta + twist) * r;
              const ry = centerY + Math.sin(theta + twist) * r;
              
              if (j === 0) ctx.moveTo(rx, ry);
              else ctx.lineTo(rx, ry);
            }
            ctx.closePath();
            
            const alpha = 0.45 * (1.0 - ringProgress);
            ctx.strokeStyle = `rgba(0, 190, 255, ${alpha})`;
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(0, 190, 255, 0.5)';
            ctx.stroke();
          }
        }
        ctx.restore();

        // 3. 3D Starfield velocity stretch lines
        ctx.save();
        particles.forEach((p) => {
          // Accelerate z velocity exponentially to simulate hit-to-lightspeed
          const warpSpeed = 12 + Math.pow(progress, 2.5) * 110;
          p.z -= warpSpeed;

          // Recycle star when it goes past camera
          if (p.z <= 10) {
            p.z = width;
            p.x = (Math.random() - 0.5) * width * 2.5;
            p.y = (Math.random() - 0.5) * height * 2.5;
          }

          // Perspective projections
          const k = 140.0 / Math.max(0.1, p.z);
          const px = p.x * k + centerX;
          const py = p.y * k + centerY;

          // Stretch vector to trailing position
          const tailZ = p.z + warpSpeed * 1.8;
          const tailK = 140.0 / Math.max(0.1, tailZ);
          const pxPrev = p.x * tailK + centerX;
          const pyPrev = p.y * tailK + centerY;

          if (px >= 0 && px <= width && py >= 0 && py <= height) {
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.size * (k * 0.95);
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(pxPrev, pyPrev);
            ctx.stroke();
          }
        });
        ctx.restore();

        // 4. Blinding white warp tunnel exit flash
        if (progress > 0.78) {
          const flashFade = (progress - 0.78) / 0.22;
          ctx.fillStyle = `rgba(255, 255, 255, ${flashFade})`;
          ctx.fillRect(0, 0, width, height);
        }

      // ====================================================================
      // ANIMATION 3: SUPERNOVA EXPLOSION & CAMERA LENS FLARE
      // ====================================================================
      } else if (type === 'supernova') {
        // Space background
        ctx.fillStyle = '#06050b';
        ctx.fillRect(0, 0, width, height);

        // Pre-blast Star Pulsation / Ignition Phase
        if (progress < 0.25) {
          const preProgress = progress / 0.25;
          const size = 15 + Math.pow(preProgress, 4.0) * 180;
          
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          
          // Corona Glow
          const coronaGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, size * 1.6);
          coronaGrad.addColorStop(0, '#ffffff');
          coronaGrad.addColorStop(0.3, '#cceeff');
          coronaGrad.addColorStop(0.6, 'rgba(255, 140, 0, 0.85)');
          coronaGrad.addColorStop(0.9, 'rgba(255, 30, 0, 0.4)');
          coronaGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
          
          ctx.fillStyle = coronaGrad;
          ctx.beginPath();
          ctx.arc(centerX, centerY, size * 1.6, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
        } else {
          // Blast Phase
          const blastProgress = (progress - 0.25) / 0.75;

          // 1. Particle Debris Ejecta with drag forces
          particles.forEach((p) => {
            p.vx *= p.drag;
            p.vy *= p.drag;
            p.x += p.vx * (1.0 + blastProgress * 1.6);
            p.y += p.vy * (1.0 + blastProgress * 1.6);
            p.alpha -= 0.0075;
            p.size *= p.sizeDecay;

            if (p.alpha > 0 && p.size > 0.1) {
              ctx.fillStyle = `hsla(${p.hue}, 100%, 65%, ${p.alpha})`;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fill();
            }
          });

          // 2. Expanding Volumetric Plasma Shockwave Ring
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          
          const waveRadius = Math.max(1, blastProgress * Math.max(width, height) * 0.95);
          const shockGrad = ctx.createRadialGradient(centerX, centerY, Math.max(0, waveRadius - 120), centerX, centerY, waveRadius + 20);
          shockGrad.addColorStop(0, 'rgba(0, 150, 255, 0)');
          shockGrad.addColorStop(0.4, `rgba(230, 248, 255, ${0.9 * (1.0 - blastProgress)})`);
          shockGrad.addColorStop(0.7, `rgba(255, 130, 0, ${0.7 * (1.0 - blastProgress)})`);
          shockGrad.addColorStop(0.9, `rgba(255, 20, 0, ${0.4 * (1.0 - blastProgress)})`);
          shockGrad.addColorStop(1.0, 'rgba(120, 0, 0, 0)');

          ctx.fillStyle = shockGrad;
          ctx.beginPath();
          ctx.arc(centerX, centerY, waveRadius + 20, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // 3. Cinematic Camera Lens Flare & Volumetric Rays (God Rays)
          if (blastProgress < 0.65) {
            const flareAlpha = Math.max(0, 1.0 - blastProgress * 1.6);
            ctx.save();
            ctx.globalCompositeOperation = 'screen';

            // God Rays (volumetric light spokes radiating from center)
            const numRays = 24;
            ctx.fillStyle = `rgba(255, 225, 180, ${0.08 * flareAlpha})`;
            for (let i = 0; i < numRays; i++) {
              const rayAngle = (i * Math.PI * 2) / numRays + blastProgress * 0.4;
              ctx.beginPath();
              ctx.moveTo(centerX, centerY);
              ctx.lineTo(centerX + Math.cos(rayAngle - 0.05) * width, centerY + Math.sin(rayAngle - 0.05) * height);
              ctx.lineTo(centerX + Math.cos(rayAngle + 0.05) * width, centerY + Math.sin(rayAngle + 0.05) * height);
              ctx.closePath();
              ctx.fill();
            }

            // Anamorphic horizontal glare line (bright sci-fi lens flare)
            const glareGrad = ctx.createLinearGradient(0, centerY, width, centerY);
            glareGrad.addColorStop(0, 'rgba(0, 180, 255, 0)');
            glareGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.95 * flareAlpha})`);
            glareGrad.addColorStop(1, 'rgba(0, 180, 255, 0)');
            ctx.fillStyle = glareGrad;
            ctx.fillRect(0, centerY - 10, width, 20);

            // Inner supernova central core glow
            const coreGlowGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 150 * (1.0 - blastProgress));
            coreGlowGrad.addColorStop(0, `rgba(255, 255, 255, ${1.0 * flareAlpha})`);
            coreGlowGrad.addColorStop(0.3, `rgba(180, 230, 255, ${0.8 * flareAlpha})`);
            coreGlowGrad.addColorStop(0.7, `rgba(255, 120, 0, ${0.4 * flareAlpha})`);
            coreGlowGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = coreGlowGrad;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 150 * (1.0 - blastProgress), 0, Math.PI * 2);
            ctx.fill();

            // Diagonal lens reflection circles (sliding across the screen along the lens axis)
            const lensAngle = Math.PI / 5.5; // diagonal flare axis
            // Reflection scale and offset points along the line passing through center
            const reflectionOffsets = [-0.6, -0.35, -0.15, 0.2, 0.5, 0.8, 1.1];
            const reflectionSizes = [45, 18, 30, 60, 22, 100, 35];
            const reflectionColors = [
              `rgba(0, 210, 255, ${0.12 * flareAlpha})`, // Cyan
              `rgba(150, 0, 255, ${0.08 * flareAlpha})`, // Purple
              `rgba(255, 0, 180, ${0.05 * flareAlpha})`, // Magenta
              `rgba(255, 230, 100, ${0.1 * flareAlpha})`, // Yellow
              `rgba(0, 255, 120, ${0.07 * flareAlpha})`, // Green
              `rgba(255, 80, 0, ${0.03 * flareAlpha})`,   // Amber
              `rgba(0, 120, 255, ${0.09 * flareAlpha})`  // Blue
            ];

            for (let i = 0; i < reflectionOffsets.length; i++) {
              const dist = width * 0.45 * reflectionOffsets[i] * blastProgress;
              const rx = centerX + Math.cos(lensAngle) * dist;
              const ry = centerY + Math.sin(lensAngle) * dist;
              const rSize = Math.max(1, reflectionSizes[i] * (1.0 - blastProgress * 0.5));

              ctx.fillStyle = reflectionColors[i];
              ctx.strokeStyle = reflectionColors[i].replace(/[\d.]+\)$/, '0.35)'); // sharper outline
              ctx.lineWidth = 1.5;

              ctx.beginPath();
              ctx.arc(rx, ry, rSize, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
            }

            ctx.restore();
          }
        }

        // 4. White flash blowout transition
        if (progress > 0.72) {
          const fadeAmount = (progress - 0.72) / 0.28;
          ctx.fillStyle = `rgba(255, 255, 255, ${fadeAmount})`;
          ctx.fillRect(0, 0, width, height);
        }

      // ====================================================================
      // ANIMATION 4: CHROME-REDSHIFT GEARS & TIME DILATION RIPPLES
      // ====================================================================
      } else if (type === 'redshift') {
        // Space ripples (Sine wave coordinates warping simulating temporal distortion)
        particles.forEach((w) => {
          w.radius += w.speed;
          if (w.radius > Math.max(width, height) * 0.75) {
            w.radius = 0;
          }

          const relativeRad = w.radius / (Math.max(width, height) * 0.75);
          const alpha = 0.32 * (1.0 - relativeRad);

          ctx.strokeStyle = `rgba(255, 0, 100, ${alpha})`;
          ctx.lineWidth = 6 * (1.0 - relativeRad);
          ctx.beginPath();
          ctx.arc(centerX, centerY, w.radius, 0, Math.PI * 2);
          ctx.stroke();
        });

        // Time dilation slowing rotation (starts fast, slows down exponentially)
        const spinAngle = Math.pow(progress, 0.4) * Math.PI * 6.5;
        const opacity = (1.0 - progress);

        // Chromatic Aberration Gears (Draw red/cyan channels offset slightly)
        // Composite operation screen allows color channels to blend together
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        const aberrationOffset = 4.5 * Math.sin(progress * Math.PI);

        // 1. RED CHANNEL (offset left)
        drawGear(centerX - aberrationOffset, centerY, 150, 16, spinAngle, '#ff0055', opacity * 0.9, 'rgba(255, 0, 50, 0.7)');
        drawGear(centerX - 195 - aberrationOffset, centerY + 80, 90, 10, -spinAngle * 1.66 + Math.PI / 10, '#ff0055', opacity * 0.9, 'rgba(255, 0, 50, 0.7)');
        drawGear(centerX + 185 - aberrationOffset, centerY - 105, 75, 8, -spinAngle * 2.0 + Math.PI / 8, '#ff0055', opacity * 0.9, 'rgba(255, 0, 50, 0.7)');

        // 2. CYAN CHANNEL (offset right)
        drawGear(centerX + aberrationOffset, centerY, 150, 16, spinAngle, '#00ffcc', opacity * 0.9, 'rgba(0, 255, 200, 0.7)');
        drawGear(centerX - 195 + aberrationOffset, centerY + 80, 90, 10, -spinAngle * 1.66 + Math.PI / 10, '#00ffcc', opacity * 0.9, 'rgba(0, 255, 200, 0.7)');
        drawGear(centerX + 185 + aberrationOffset, centerY - 105, 75, 8, -spinAngle * 2.0 + Math.PI / 8, '#00ffcc', opacity * 0.9, 'rgba(0, 255, 200, 0.7)');

        ctx.restore();

        // 3. Clockwork Details, Roman numerals & hands (on top, aligned)
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.globalAlpha = opacity;
        ctx.font = 'bold 16px "Outfit", sans-serif';
        ctx.fillStyle = '#f9fafb';
        ctx.shadowColor = '#00beff';
        ctx.shadowBlur = 10;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const romanNumerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
        for (let i = 0; i < 12; i++) {
          const angle = (i * Math.PI) / 6;
          const rx = Math.sin(angle) * 120;
          const ry = -Math.cos(angle) * 120;
          ctx.fillText(romanNumerals[i], rx, ry);
        }

        // Hour Hand
        ctx.save();
        ctx.rotate(spinAngle / 12);
        ctx.strokeStyle = '#ec4899';
        ctx.shadowColor = '#ec4899';
        ctx.lineWidth = 5.0;
        ctx.beginPath();
        ctx.moveTo(0, 12);
        ctx.lineTo(0, -55);
        ctx.stroke();
        ctx.restore();

        // Minute Hand
        ctx.save();
        ctx.rotate(spinAngle);
        ctx.strokeStyle = '#00ff80';
        ctx.shadowColor = '#00ff80';
        ctx.lineWidth = 3.0;
        ctx.beginPath();
        ctx.moveTo(0, 18);
        ctx.lineTo(0, -90);
        ctx.stroke();
        ctx.restore();

        ctx.restore();

        // Blinding deep redshift-violet color overlay
        if (progress > 0.75) {
          const shift = (progress - 0.75) / 0.25;
          ctx.fillStyle = `rgba(10, 2, 22, ${shift * 0.98})`;
          ctx.fillRect(0, 0, width, height);
        }

      // ====================================================================
      // ANIMATION 5: QUANTUM TUNNELING WAVEFUNCTION COLLAPSE
      // ====================================================================
      } else {
        // Dark cybernetic grid background
        ctx.fillStyle = '#030806';
        ctx.fillRect(0, 0, width, height);

        // 1. Glowing Cyber Network Nodes
        ctx.save();
        particles.forEach((n) => {
          n.x += n.vx;
          n.y += n.vy;

          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;

          ctx.fillStyle = `rgba(0, 255, 128, ${n.alpha * (1.0 - progress * 0.5)})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#00ff80';
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw node links
        ctx.strokeStyle = `rgba(0, 255, 128, ${0.04 * (1.0 - progress)})`;
        ctx.lineWidth = 1.0;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
        ctx.restore();

        // 2. Glitching Binary Code Rain
        ctx.save();
        secondaryList.forEach((s) => {
          s.y += s.speed * (1.0 + progress * 2.5);
          if (s.y > height) {
            s.y = 0;
            s.x = Math.random() * width;
          }

          // Randomly mutate characters
          if (Math.random() > 0.95) {
            s.char = Math.random() > 0.5 ? '1' : '0';
          }

          ctx.font = `bold ${s.size}px monospace`;
          ctx.fillStyle = `rgba(0, 220, 255, ${s.opacity * (1.0 - progress * 0.6)})`;
          ctx.shadowBlur = 5;
          ctx.shadowColor = '#00bfff';
          ctx.fillText(s.char, s.x, s.y);
        });
        ctx.restore();

        // 3. Schrödinger Wavefunction Collapse Particle Beam
        // Renders fluctuating probability wave that collapses to central delta line
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 255, 128, 0.85)';
        ctx.lineWidth = 3.0;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#00ff80';
        ctx.beginPath();

        const waveAmp = 120 * (1.0 - progress * 0.95); // Wave collapses to 0 amplitude
        const waveFreq = 0.025 + progress * 0.05;
        const timeScale = elapsed * 0.018;

        for (let x = 0; x <= width; x += 8) {
          // Gaussian wave packet envelope: centered in screen width
          const gaussianEnvelope = Math.exp(-Math.pow((x - centerX) / (width * 0.22), 2.0));
          // Oscillating wave equation
          const waveY = centerY + Math.sin(x * waveFreq - timeScale) * waveAmp * gaussianEnvelope;

          if (x === 0) ctx.moveTo(x, waveY);
          else ctx.lineTo(x, waveY);
        }
        ctx.stroke();
        ctx.restore();

        // Glowing scan line sweeping across screen
        const scanY = (progress * height * 1.5) % height;
        const scanGrad = ctx.createLinearGradient(0, scanY - 80, 0, scanY + 80);
        scanGrad.addColorStop(0, 'rgba(0, 255, 128, 0)');
        scanGrad.addColorStop(0.5, `rgba(0, 255, 128, ${0.16 * (1.0 - progress)})`);
        scanGrad.addColorStop(1.0, 'rgba(0, 255, 128, 0)');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanY - 80, width, 160);

        // 4. Glitchy matrix collapse blackout
        if (progress > 0.82) {
          const fade = (progress - 0.82) / 0.18;
          ctx.fillStyle = `rgba(6, 20, 12, ${fade})`;
          ctx.fillRect(0, 0, width, height);
        }
      }

      // Stop loop or request next frame
      if (progress < 1.0) {
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
