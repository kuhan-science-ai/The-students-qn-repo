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
    
    // Transitions have tailored durations to give the physics engine time to shine
    const duration = type === 'blackhole' ? 2600 : type === 'warp' ? 2000 : type === 'supernova' ? 2200 : 1800;

    // Transition Particles and Extra Arrays
    const particles = [];
    const secondaryList = [];
    const stars = []; // For backgrounds and lensing

    // ====================================================================
    // INITIALIZATION STAGE
    // ====================================================================
    if (type === 'blackhole') {
      // 1. Keplerian Accretion Disk Gas (380 particles)
      for (let i = 0; i < 380; i++) {
        const angle = Math.random() * Math.PI * 2;
        // Keplerian distribution: more particles closer to the center
        const radius = 80 + Math.pow(Math.random(), 1.5) * (Math.min(width, height) * 0.5);
        particles.push({
          type: 'gas',
          angle,
          radius,
          // Keplerian velocity: v = constant / sqrt(r)
          baseSpeed: 0.25 + Math.random() * 0.15,
          size: 1.0 + Math.random() * 2.8,
          orbitOffset: (Math.random() - 0.5) * 8,
          hue: Math.random() > 0.85 ? 30 : Math.random() > 0.4 ? 18 : 5, // Yellow-orange-red mix
          alpha: 0.3 + Math.random() * 0.7,
        });
      }

      // 2. Relativistic Jets (collimated polar outflow particles)
      for (let i = 0; i < 120; i++) {
        particles.push({
          type: 'jet',
          ySign: Math.random() > 0.5 ? 1 : -1, // Upward or downward jet
          distance: Math.random() * height * 0.6,
          speed: 8 + Math.random() * 12,
          angleOffset: Math.random() * Math.PI * 2, // helical path phase
          size: 1.0 + Math.random() * 2.5,
          alpha: 0.4 + Math.random() * 0.6,
        });
      }

      // 3. Background Stars for Gravitational Lensing
      for (let i = 0; i < 150; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 0.6 + Math.random() * 1.6,
          alpha: 0.2 + Math.random() * 0.8,
        });
      }
    } else if (type === 'warp') {
      // 1. 3D Stars with chromatic channel properties
      for (let i = 0; i < 550; i++) {
        particles.push({
          x: (Math.random() - 0.5) * width * 3.0,
          y: (Math.random() - 0.5) * height * 3.0,
          z: Math.random() * width,
          size: 0.5 + Math.random() * 2.2,
          colorType: Math.random() > 0.85 ? 'blue' : Math.random() > 0.9 ? 'magenta' : 'white',
        });
      }

      // 2. Volumetric Nebula Particle Clouds (texture simulation)
      for (let i = 0; i < 40; i++) {
        secondaryList.push({
          x: (Math.random() - 0.5) * width * 0.8,
          y: (Math.random() - 0.5) * height * 0.8,
          radius: 120 + Math.random() * 180,
          angle: Math.random() * Math.PI * 2,
          speed: (Math.random() > 0.5 ? 1 : -1) * (0.002 + Math.random() * 0.003),
          hue: Math.random() > 0.6 ? 280 : Math.random() > 0.3 ? 190 : 330, // Violet, Cyan, Pink
          alpha: 0.04 + Math.random() * 0.06,
        });
      }
    } else if (type === 'supernova') {
      // 1. Star filaments (electricity / shockwave tendrils)
      for (let i = 0; i < 16; i++) {
        const angle = (i * Math.PI * 2) / 16;
        secondaryList.push({
          angle,
          segments: [],
          maxSegments: 15,
        });
      }

      // 2. Plasma blast particles
      for (let i = 0; i < 300; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3.0 + Math.random() * 22.0;
        particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 1.0 + Math.random() * 5.0,
          hue: Math.random() > 0.85 ? 195 : Math.random() > 0.5 ? 24 : 355, // Blue-white core, yellow, red
          alpha: 1.0,
          drag: 0.96 + Math.random() * 0.02,
          sizeDecay: 0.982 + Math.random() * 0.012,
        });
      }
    } else if (type === 'redshift') {
      // 1. Time ripples
      for (let i = 0; i < 7; i++) {
        particles.push({
          radius: i * 130,
          speed: 4.0 + Math.random() * 1.5,
        });
      }

      // 2. Ghost trails for gears
      for (let i = 0; i < 5; i++) {
        secondaryList.push({
          alpha: 0.15 - i * 0.03,
          delay: i * 4, // delay frame count
        });
      }
    } else {
      // Quantum Tunneling probability cloud
      // 1. Hydrogen-like atomic orbital d-orbital probability cloud
      for (let i = 0; i < 600; i++) {
        // Form a cloverleaf orbital: 4 lobes
        const lobeIndex = Math.floor(Math.random() * 4);
        const lobeAngle = (lobeIndex * Math.PI) / 2 + (Math.random() - 0.5) * 0.65;
        const radius = 60 + Math.pow(Math.random(), 1.5) * 220;
        
        particles.push({
          type: 'orbital',
          angle: lobeAngle,
          radius,
          size: 0.8 + Math.random() * 1.8,
          alpha: 0.2 + Math.random() * 0.6,
          speed: 0.02 + Math.random() * 0.03,
        });
      }

      // 2. Glitching Binary streams
      for (let i = 0; i < 75; i++) {
        secondaryList.push({
          x: Math.random() * width,
          y: Math.random() * height,
          speed: 4 + Math.random() * 6,
          char: Math.random() > 0.5 ? '1' : '0',
          size: 9 + Math.random() * 13,
          opacity: 0.15 + Math.random() * 0.5,
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

      // Einstein gravitational lensing equation
      const pull = Math.pow(Math.max(0.1, dist / 200), 2.2);
      const warpFactor = 1.0 - Math.exp(-pull / (warpStrength + 0.0001));
      const warpedDist = dist * warpFactor;

      return {
        wx: centerX + (dx / dist) * warpedDist,
        wy: centerY + (dy / dist) * warpedDist,
        scale: warpFactor,
      };
    };

    // Helper to draw space-time grid fabric
    const drawSpaceTimeGrid = (warpStrength, singularityRadius, spinDragging = 0) => {
      const alpha = Math.max(0, 0.25 * (1.0 - (warpStrength / 3.5)));
      ctx.strokeStyle = `rgba(34, 197, 94, ${alpha})`;
      ctx.lineWidth = 0.8;

      const gridSize = 45;
      const xLines = Math.ceil(width / gridSize);
      const yLines = Math.ceil(height / gridSize);

      // Horizontal lines
      for (let y = 0; y <= yLines; y++) {
        const ly = y * gridSize;
        ctx.beginPath();
        for (let x = 0; x <= width; x += 15) {
          let tx = x;
          let ty = ly;

          // Lense-Thirring frame-dragging spiral distortion (time dilation)
          if (spinDragging > 0) {
            const dx = x - centerX;
            const dy = ly - centerY;
            const r = Math.sqrt(dx * dx + dy * dy);
            const dragFactor = spinDragging / (Math.max(10, r / 150) * Math.max(10, r / 150));
            const angle = Math.atan2(dy, dx) + dragFactor;
            tx = centerX + Math.cos(angle) * r;
            ty = centerY + Math.sin(angle) * r;
          }

          const { wx, wy } = getWarpedCoords(tx, ty, warpStrength, singularityRadius);
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
          let tx = lx;
          let ty = y;

          if (spinDragging > 0) {
            const dx = lx - centerX;
            const dy = y - centerY;
            const r = Math.sqrt(dx * dx + dy * dy);
            const dragFactor = spinDragging / (Math.max(10, r / 150) * Math.max(10, r / 150));
            const angle = Math.atan2(dy, dx) + dragFactor;
            tx = centerX + Math.cos(angle) * r;
            ty = centerY + Math.sin(angle) * r;
          }

          const { wx, wy } = getWarpedCoords(tx, ty, warpStrength, singularityRadius);
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

      ctx.shadowBlur = 15;
      ctx.shadowColor = shadowColor || color;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 3.0;

      // Outer Ring
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.85, 0, Math.PI * 2);
      ctx.stroke();

      // Inner Hub
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.22, 0, Math.PI * 2);
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
        ctx.lineTo(-3, -radius - 5);
        ctx.lineTo(3, -radius - 5);
        ctx.lineTo(5, -radius * 0.83);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    };

    // Main animation logic
    const draw = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1.0);

      // Clean canvas
      ctx.clearRect(0, 0, width, height);

      // ====================================================================
      // ANIMATION 1: BLACK HOLE (Keplerian Accretion Disk, Lensed Stars & Polar Jets)
      // ====================================================================
      if (type === 'blackhole') {
        const warpStrength = progress * 3.4;
        const singularityRadius = 95 * progress;

        // 1. Draw and lens background stars
        ctx.fillStyle = '#ffffff';
        stars.forEach((s) => {
          const { wx, wy, scale } = getWarpedCoords(s.x, s.y, warpStrength, singularityRadius);
          if (scale > 0) {
            ctx.globalAlpha = s.alpha * (1.0 - progress * 0.25);
            ctx.beginPath();
            ctx.arc(wx, wy, s.size * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        });
        ctx.globalAlpha = 1.0;

        // 2. Draw space-time fabric grid (warped)
        drawSpaceTimeGrid(warpStrength, singularityRadius);

        // 3. Volumetric Polar Relativistic Plasma Jets (Vertical beam structures)
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        
        // Collimated beam glow
        const jetGlowRadius = 24 * (1.0 - progress * 0.7);
        const jetGrad = ctx.createLinearGradient(centerX - jetGlowRadius, centerY, centerX + jetGlowRadius, centerY);
        jetGrad.addColorStop(0, 'rgba(0, 60, 255, 0)');
        jetGrad.addColorStop(0.5, `rgba(0, 190, 255, ${0.45 * (1.0 - progress * 0.6)})`);
        glareColor: jetGrad.addColorStop(1, 'rgba(0, 60, 255, 0)');
        
        ctx.fillStyle = jetGrad;
        // Draw top jet beam
        ctx.beginPath();
        ctx.moveTo(centerX - jetGlowRadius, centerY);
        ctx.lineTo(centerX - jetGlowRadius * 2.5, 0);
        ctx.lineTo(centerX + jetGlowRadius * 2.5, 0);
        ctx.lineTo(centerX + jetGlowRadius, centerY);
        ctx.closePath();
        ctx.fill();

        // Draw bottom jet beam
        ctx.beginPath();
        ctx.moveTo(centerX - jetGlowRadius, centerY);
        ctx.lineTo(centerX - jetGlowRadius * 2.5, height);
        ctx.lineTo(centerX + jetGlowRadius * 2.5, height);
        ctx.lineTo(centerX + jetGlowRadius, centerY);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        // 4. Volumetric Accretion Disk (Einstein Lensing)
        const glowRadius = (Math.min(width, height) * 0.38) * (1.0 - progress * 0.45);
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        // Lensed Back of Accretion Disk (bent OVER the event horizon by gravity)
        ctx.lineWidth = 26 * (1.0 - progress * 0.75);
        ctx.shadowBlur = 40 * (1.0 - progress * 0.45);
        ctx.shadowColor = 'rgba(255, 55, 0, 0.85)';
        
        ctx.strokeStyle = 'rgba(255, 110, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY - 9 * progress, glowRadius * 1.06, glowRadius * 0.46, 0, Math.PI, 0);
        ctx.stroke();

        // Lensed Back of Accretion Disk (bent UNDER the event horizon by gravity)
        ctx.strokeStyle = 'rgba(255, 40, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + 9 * progress, glowRadius * 1.06, glowRadius * 0.43, 0, 0, Math.PI);
        ctx.stroke();

        // Main Horizontal Accretion Disk crossing the center
        // Create Relativistic Doppler Boosting Gradient (left half is blue/white-hot, right is red/dim)
        const boostGrad = ctx.createLinearGradient(centerX - glowRadius * 1.45, centerY, centerX + glowRadius * 1.45, centerY);
        boostGrad.addColorStop(0, 'rgba(220, 245, 255, 0.95)'); // White-blue hot (moving towards observer)
        boostGrad.addColorStop(0.2, 'rgba(0, 191, 255, 0.9)'); // Cyan hot interface
        boostGrad.addColorStop(0.35, 'rgba(255, 205, 50, 0.85)'); // Yellow
        boostGrad.addColorStop(0.55, 'rgba(255, 80, 0, 0.7)'); // Orange
        boostGrad.addColorStop(0.8, 'rgba(190, 20, 0, 0.4)'); // Deep red
        boostGrad.addColorStop(1, 'rgba(90, 0, 0, 0.1)'); // Dim infra-red (moving away)

        ctx.strokeStyle = boostGrad;
        ctx.lineWidth = 55 * (1.0 - progress * 0.78);
        ctx.shadowColor = 'rgba(255, 130, 0, 0.65)';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, glowRadius * 1.45, glowRadius * 0.17, -Math.PI / 18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 5. Draw Orbiting Gas & Polar Jet particles
        particles.forEach((p) => {
          if (p.type === 'gas') {
            // Keplerian speed: speed decreases farther out
            // speed multiplier simulates rapid acceleration near horizon
            const keplerSpeed = p.baseSpeed * (120 / Math.sqrt(p.radius));
            const speedMultiplier = 1.0 + progress * 8.0;
            p.angle += keplerSpeed * speedMultiplier * 0.01;
            p.radius -= (p.radius * 0.016) * speedMultiplier; // Gravitational fall

            // Recycle fallen gas particles
            if (p.radius < singularityRadius + 2) {
              p.radius = 120 + Math.random() * (Math.min(width, height) * 0.45);
              p.angle = Math.random() * Math.PI * 2;
            }

            const pxRaw = centerX + Math.cos(p.angle) * p.radius;
            const pyRaw = centerY + Math.sin(p.angle) * p.radius * 0.35; // flattened ellipse orbit

            const { wx, wy, scale } = getWarpedCoords(pxRaw, pyRaw, warpStrength, singularityRadius);

            if (scale > 0) {
              // Color shifting based on Kepler speed and angle (Doppler shifts)
              const cosAngle = Math.cos(p.angle);
              let hue = p.hue;
              let lightness = 55;
              let saturation = 100;

              if (cosAngle < -0.25) {
                // Moving towards observer: Blue-shifted hot gas
                hue = 195 + (1.0 + cosAngle) * 50;
                lightness = 70 + Math.abs(cosAngle) * 20;
              } else {
                // Moving away: Red-shifted cool gas
                hue = Math.max(0, 25 + cosAngle * 25);
                lightness = 45 + (1.0 - cosAngle) * 15;
              }

              ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${p.alpha * (1.0 - progress * 0.35)})`;
              ctx.beginPath();
              ctx.arc(wx, wy, p.size * scale * (1.0 - progress * 0.5), 0, Math.PI * 2);
              ctx.fill();
            }
          } else if (p.type === 'jet') {
            // Jet movement vertically outwards
            p.distance += p.speed * (1.0 + progress * 2.0);
            
            // Helical movement model (corkscrew wrapping around magnetic fields)
            const helixRadius = 15 * (1.0 + p.distance / 120);
            const timeAngle = (p.distance * 0.02) + p.angleOffset;
            const px = centerX + Math.cos(timeAngle) * helixRadius;
            const py = centerY + p.ySign * p.distance;

            // Apply light gravitational warping near hub
            const { wx, wy, scale } = getWarpedCoords(px, py, warpStrength, singularityRadius);

            if (scale > 0 && p.distance < height * 0.6) {
              const alpha = p.alpha * (1.0 - p.distance / (height * 0.6)) * (1.0 - progress * 0.6);
              ctx.fillStyle = `rgba(0, 210, 255, ${alpha})`;
              ctx.shadowBlur = 6;
              ctx.shadowColor = '#00bfff';
              
              ctx.beginPath();
              ctx.arc(wx, wy, p.size * scale, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        });

        // 6. Photon Sphere Boundary Glow (fused light orbit right at Event Horizon)
        if (singularityRadius > 5) {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          ctx.strokeStyle = `rgba(255, 185, 0, ${0.85 * (1.0 - progress * 0.35)})`;
          ctx.lineWidth = 4.0 * (1.0 + Math.sin(progress * Math.PI * 15) * 0.15); // flickering quantum plasma
          ctx.shadowBlur = 22;
          ctx.shadowColor = 'rgba(255, 120, 0, 0.9)';
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, singularityRadius + 2.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // 7. Event Horizon Shadow (Schwarzschild black sphere)
        const currentSingularityRadius = singularityRadius * (1.0 + Math.sin(progress * Math.PI * 7) * 0.035) * (1.0 - progress * 0.2);
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.max(0, currentSingularityRadius), 0, Math.PI * 2);
        ctx.fill();

        // 8. Dynamic Gravitational Expansion (sucking in everything)
        if (progress > 0.8) {
          const fade = (progress - 0.8) / 0.2;
          const waveRadius = (progress - 0.8) * Math.max(width, height) * 1.6;
          const radialGrad = ctx.createRadialGradient(centerX, centerY, currentSingularityRadius, centerX, centerY, waveRadius);
          radialGrad.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
          radialGrad.addColorStop(0.4, 'rgba(11, 15, 25, 0.95)');
          radialGrad.addColorStop(1.0, 'rgba(11, 15, 25, 0.0)');
          
          ctx.fillStyle = radialGrad;
          ctx.beginPath();
          ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(0, 0, 0, ${fade})`;
          ctx.fillRect(0, 0, width, height);
        }

      // ====================================================================
      // ANIMATION 2: COSMIC WORMHOLE / WARP JUMP (Volumetric Nebula & Alcubierre Bubble)
      // ====================================================================
      } else if (type === 'warp') {
        ctx.fillStyle = '#010206';
        ctx.fillRect(0, 0, width, height);

        // 1. Draw volumetric particle nebula clouds
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(progress * Math.PI * 0.8);
        
        secondaryList.forEach((c) => {
          c.angle += c.speed;
          const cx = c.x + Math.cos(c.angle) * 35;
          const cy = c.y + Math.sin(c.angle) * 35;

          const cloudGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, c.radius);
          cloudGrad.addColorStop(0, `hsla(${c.hue}, 95%, 45%, ${c.alpha * (1.0 - progress * 0.4)})`);
          cloudGrad.addColorStop(0.5, `hsla(${c.hue + 25}, 90%, 35%, ${(c.alpha * 0.4) * (1.0 - progress * 0.4)})`);
          cloudGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = cloudGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, c.radius, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();

        // 2. Swirling twisted wormhole rings
        const numRings = 8;
        ctx.save();
        ctx.lineWidth = 2.5;
        for (let i = 0; i < numRings; i++) {
          const ringProgress = (progress + i / numRings) % 1.0;
          const ringRad = Math.pow(ringProgress, 2.8) * Math.max(width, height) * 0.95;
          
          if (ringRad > 10) {
            ctx.beginPath();
            const points = 72;
            for (let j = 0; j <= points; j++) {
              const theta = (j * Math.PI * 2) / points;
              // Swirling twist displacement
              const twist = ringProgress * Math.PI * 2.2;
              const r = ringRad * (1.0 + Math.sin(theta * 4 + twist) * 0.06);
              const rx = centerX + Math.cos(theta + twist) * r;
              const ry = centerY + Math.sin(theta + twist) * r;
              
              if (j === 0) ctx.moveTo(rx, ry);
              else ctx.lineTo(rx, ry);
            }
            ctx.closePath();
            
            const alpha = 0.5 * (1.0 - ringProgress);
            ctx.strokeStyle = `rgba(0, 195, 255, ${alpha})`;
            ctx.shadowBlur = 12;
            ctx.shadowColor = 'rgba(0, 195, 255, 0.65)';
            ctx.stroke();
          }
        }
        ctx.restore();

        // 3. Alcubierre Warp Bubble (Cyan energy crackle boundary)
        const bubbleRad = Math.pow(progress, 2.0) * Math.max(width, height) * 0.75;
        if (bubbleRad > 10 && progress < 0.85) {
          ctx.save();
          ctx.strokeStyle = `rgba(0, 255, 220, ${0.75 * (1.0 - progress)})`;
          ctx.shadowBlur = 20;
          ctx.shadowColor = 'rgba(0, 255, 220, 0.8)';
          ctx.lineWidth = 3.0;

          // Draw bubble ring with electrical discharges
          ctx.beginPath();
          const bubblePoints = 90;
          for (let i = 0; i <= bubblePoints; i++) {
            const theta = (i * Math.PI * 2) / bubblePoints;
            // Generate lightning jitter
            const jitter = (Math.random() - 0.5) * 12 * (1.0 - progress);
            const rx = centerX + Math.cos(theta) * (bubbleRad + jitter);
            const ry = centerY + Math.sin(theta) * (bubbleRad + jitter);
            
            if (i === 0) ctx.moveTo(rx, ry);
            else ctx.lineTo(rx, ry);
          }
          ctx.closePath();
          ctx.stroke();

          // Electrical sparks branching outwards from the warp bubble
          if (Math.random() > 0.45) {
            ctx.strokeStyle = `rgba(180, 255, 255, ${0.8 * (1.0 - progress)})`;
            ctx.lineWidth = 1.5;
            for (let i = 0; i < 4; i++) {
              const sparkAngle = Math.random() * Math.PI * 2;
              let sx = centerX + Math.cos(sparkAngle) * bubbleRad;
              let sy = centerY + Math.sin(sparkAngle) * bubbleRad;
              ctx.beginPath();
              ctx.moveTo(sx, sy);
              for (let j = 0; j < 5; j++) {
                sx += Math.cos(sparkAngle + (Math.random() - 0.5) * 0.8) * 18;
                sy += Math.sin(sparkAngle + (Math.random() - 0.5) * 0.8) * 18;
                ctx.lineTo(sx, sy);
              }
              ctx.stroke();
            }
          }
          ctx.restore();
        }

        // 4. 3D Chromatic Star Trails
        ctx.save();
        particles.forEach((p) => {
          const warpSpeed = 10 + Math.pow(progress, 2.4) * 120;
          p.z -= warpSpeed;

          if (p.z <= 10) {
            p.z = width;
            p.x = (Math.random() - 0.5) * width * 3.0;
            p.y = (Math.random() - 0.5) * height * 3.0;
          }

          const k = 140.0 / Math.max(0.1, p.z);
          const px = p.x * k + centerX;
          const py = p.y * k + centerY;

          const tailZ = p.z + warpSpeed * 2.0;
          const tailK = 140.0 / Math.max(0.1, tailZ);
          const pxPrev = p.x * tailK + centerX;
          const pyPrev = p.y * tailK + centerY;

          if (px >= 0 && px <= width && py >= 0 && py <= height) {
            // Draw slightly chromatic-separated trails (blue/cyan/white sparks)
            if (p.colorType === 'blue') {
              ctx.strokeStyle = `rgba(0, 191, 255, ${0.9 * (140.0 / p.z)})`;
            } else if (p.colorType === 'magenta') {
              ctx.strokeStyle = `rgba(255, 0, 128, ${0.85 * (140.0 / p.z)})`;
            } else {
              ctx.strokeStyle = `rgba(255, 255, 255, ${0.95 * (140.0 / p.z)})`;
            }
            
            ctx.lineWidth = p.size * (k * 0.9);
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(pxPrev, pyPrev);
            ctx.stroke();
          }
        });
        ctx.restore();

        // 5. Whiteout exit flash
        if (progress > 0.78) {
          const flashFade = (progress - 0.78) / 0.22;
          ctx.fillStyle = `rgba(255, 255, 255, ${flashFade})`;
          ctx.fillRect(0, 0, width, height);
        }

      // ====================================================================
      // ANIMATION 3: SUPERNOVA (Stellar Implosion Phase, Plasma Filaments & Flare)
      // ====================================================================
      } else if (type === 'supernova') {
        ctx.fillStyle = '#040308';
        ctx.fillRect(0, 0, width, height);

        const implosionLimit = 0.22; // Explodes after 22% of progress

        // IMPLOSION PHASE (Star compresses and gathers energy)
        if (progress < implosionLimit) {
          const impProgress = progress / implosionLimit;
          // Star shrinks from massive corona size down to tiny point
          const size = 150 * (1.0 - Math.pow(impProgress, 2.5)) + 8;
          
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          
          // Shrinking space fabric grid (gravitational pull inward)
          const meshWarp = impProgress * -1.8; // Negative warp draws grid inwards
          drawSpaceTimeGrid(meshWarp, 0);

          // Glowing blue-purple implosion corona
          const impGrad = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, size * 1.5);
          impGrad.addColorStop(0, '#ffffff');
          impGrad.addColorStop(0.2, '#b3f5ff');
          impGrad.addColorStop(0.5, `rgba(139, 92, 246, ${0.8 * impProgress})`); // Purple
          impGrad.addColorStop(0.85, 'rgba(0, 30, 150, 0.45)'); // Deep blue
          impGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
          
          ctx.fillStyle = impGrad;
          ctx.beginPath();
          ctx.arc(centerX, centerY, size * 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Compression particle flow (particles shooting INWARDS to center)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          for (let i = 0; i < 15; i++) {
            const angle = (i * Math.PI * 2) / 15 + impProgress * Math.PI;
            const r = 250 * (1.0 - impProgress) + 10;
            const px = centerX + Math.cos(angle) * r;
            const py = centerY + Math.sin(angle) * r;
            ctx.beginPath();
            ctx.arc(px, py, 2.0, 0, Math.PI * 2);
            ctx.fill();
          }
          
          ctx.restore();
        } else {
          // EXPLOSION PHASE (Stellar detonation)
          const blastProgress = (progress - implosionLimit) / (1.0 - implosionLimit);

          // 1. Detailed Jagged Electrical Plasma Filaments (Radially shooting outwards)
          ctx.save();
          ctx.strokeStyle = `rgba(180, 240, 255, ${0.95 * (1.0 - blastProgress)})`;
          ctx.shadowBlur = 18;
          ctx.shadowColor = '#00f2ff';
          ctx.lineWidth = 2.5;

          secondaryList.forEach((tendril) => {
            // Re-generate lightning pathways dynamically for animation flickering
            const segments = [];
            let cx = centerX;
            let cy = centerY;
            const length = blastProgress * Math.max(width, height) * 0.9;
            const steps = 12;
            
            segments.push({ x: cx, y: cy });
            for (let j = 0; j < steps; j++) {
              const segLen = length / steps;
              const angleJitter = (Math.random() - 0.5) * 0.65;
              cx += Math.cos(tendril.angle + angleJitter) * segLen;
              cy += Math.sin(tendril.angle + angleJitter) * segLen;
              segments.push({ x: cx, y: cy });
            }

            ctx.beginPath();
            ctx.moveTo(segments[0].x, segments[0].y);
            for (let j = 1; j < segments.length; j++) {
              ctx.lineTo(segments[j].x, segments[j].y);
            }
            ctx.stroke();
          });
          ctx.restore();

          // 2. Blast sparks with air drag resistance
          particles.forEach((p) => {
            p.vx *= p.drag;
            p.vy *= p.drag;
            p.x += p.vx * (1.0 + blastProgress * 1.5);
            p.y += p.vy * (1.0 + blastProgress * 1.5);
            p.alpha -= 0.007;
            p.size *= p.sizeDecay;

            if (p.alpha > 0 && p.size > 0.1) {
              ctx.fillStyle = `hsla(${p.hue}, 100%, 65%, ${p.alpha})`;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fill();
            }
          });

          // 3. Volumetric Expanding Shockwave Plasma Ring
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          
          const waveRadius = Math.max(1, blastProgress * Math.max(width, height) * 0.95);
          const shockGrad = ctx.createRadialGradient(centerX, centerY, Math.max(0, waveRadius - 150), centerX, centerY, waveRadius + 30);
          shockGrad.addColorStop(0, 'rgba(0, 150, 255, 0)');
          shockGrad.addColorStop(0.3, `rgba(0, 210, 255, ${0.35 * (1.0 - blastProgress)})`);
          shockGrad.addColorStop(0.55, `rgba(235, 248, 255, ${0.9 * (1.0 - blastProgress)})`); // White ring edge
          shockGrad.addColorStop(0.75, `rgba(255, 120, 0, ${0.65 * (1.0 - blastProgress)})`); // Orange outer
          shockGrad.addColorStop(0.9, `rgba(200, 10, 0, ${0.35 * (1.0 - blastProgress)})`);
          shockGrad.addColorStop(1.0, 'rgba(100, 0, 0, 0)');

          ctx.fillStyle = shockGrad;
          ctx.beginPath();
          ctx.arc(centerX, centerY, waveRadius + 30, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // 4. Volumetric Light Ray Spokes & Camera Lens Flares
          if (blastProgress < 0.68) {
            const flareAlpha = Math.max(0, 1.0 - blastProgress * 1.55);
            ctx.save();
            ctx.globalCompositeOperation = 'screen';

            // Volumetric God Rays
            const numRays = 30;
            ctx.fillStyle = `rgba(255, 230, 190, ${0.09 * flareAlpha})`;
            for (let i = 0; i < numRays; i++) {
              const rayAngle = (i * Math.PI * 2) / numRays + blastProgress * 0.35;
              ctx.beginPath();
              ctx.moveTo(centerX, centerY);
              ctx.lineTo(centerX + Math.cos(rayAngle - 0.04) * width, centerY + Math.sin(rayAngle - 0.04) * height);
              ctx.lineTo(centerX + Math.cos(rayAngle + 0.04) * width, centerY + Math.sin(rayAngle + 0.04) * height);
              ctx.closePath();
              ctx.fill();
            }

            // Anamorphic flare horizontal line
            const glareGrad = ctx.createLinearGradient(0, centerY, width, centerY);
            glareGrad.addColorStop(0, 'rgba(0, 191, 255, 0)');
            glareGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.98 * flareAlpha})`);
            glareGrad.addColorStop(1, 'rgba(0, 191, 255, 0)');
            ctx.fillStyle = glareGrad;
            ctx.fillRect(0, centerY - 12, width, 24);

            // Anamorphic vertical thin crosshair ray
            const verticalGrad = ctx.createLinearGradient(centerX, 0, centerX, height);
            verticalGrad.addColorStop(0, 'rgba(0, 191, 255, 0)');
            verticalGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.75 * flareAlpha})`);
            verticalGrad.addColorStop(1, 'rgba(0, 191, 255, 0)');
            ctx.fillStyle = verticalGrad;
            ctx.fillRect(centerX - 4, 0, 8, height);

            // Center blast core
            const coreGlowGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 180 * (1.0 - blastProgress));
            coreGlowGrad.addColorStop(0, `rgba(255, 255, 255, ${1.0 * flareAlpha})`);
            coreGlowGrad.addColorStop(0.25, `rgba(180, 240, 255, ${0.85 * flareAlpha})`);
            coreGlowGrad.addColorStop(0.65, `rgba(255, 110, 0, ${0.4 * flareAlpha})`);
            coreGlowGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = coreGlowGrad;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 180 * (1.0 - blastProgress), 0, Math.PI * 2);
            ctx.fill();

            // Hexagonal lens reflections sliding along diagonal line
            const lensAngle = Math.PI / 6.0;
            const reflectionOffsets = [-0.65, -0.4, -0.2, 0.1, 0.35, 0.6, 0.9, 1.2];
            const reflectionSizes = [50, 22, 35, 75, 25, 110, 40, 65];
            const reflectionColors = [
              `rgba(0, 225, 255, ${0.14 * flareAlpha})`, // Cyan
              `rgba(170, 50, 255, ${0.09 * flareAlpha})`, // Violet
              `rgba(255, 0, 190, ${0.06 * flareAlpha})`, // Pink
              `rgba(255, 235, 120, ${0.12 * flareAlpha})`, // Gold
              `rgba(0, 255, 140, ${0.08 * flareAlpha})`, // Green
              `rgba(255, 70, 0, ${0.04 * flareAlpha})`,   // Red-orange
              `rgba(0, 110, 255, ${0.11 * flareAlpha})`,  // Royal Blue
              `rgba(0, 255, 255, ${0.05 * flareAlpha})`   // Cyan outer
            ];

            for (let i = 0; i < reflectionOffsets.length; i++) {
              const dist = width * 0.42 * reflectionOffsets[i] * blastProgress;
              const rx = centerX + Math.cos(lensAngle) * dist;
              const ry = centerY + Math.sin(lensAngle) * dist;
              const rSize = Math.max(1, reflectionSizes[i] * (1.0 - blastProgress * 0.45));

              ctx.fillStyle = reflectionColors[i];
              ctx.strokeStyle = reflectionColors[i].replace(/[\d.]+\)$/, '0.4)');
              ctx.lineWidth = 1.8;

              // Draw hexagon instead of simple circle
              ctx.beginPath();
              for (let side = 0; side < 6; side++) {
                const angle = (side * Math.PI) / 3;
                const hx = rx + Math.cos(angle) * rSize;
                const hy = ry + Math.sin(angle) * rSize;
                if (side === 0) ctx.moveTo(hx, hy);
                else ctx.lineTo(hx, hy);
              }
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
            }

            ctx.restore();
          }
        }

        // Starburst white flash blowout
        if (progress > 0.72) {
          const fadeAmount = (progress - 0.72) / 0.28;
          ctx.fillStyle = `rgba(255, 255, 255, ${fadeAmount})`;
          ctx.fillRect(0, 0, width, height);
        }

      // ====================================================================
      // ANIMATION 4: CHROME-REDSHIFT (Lense-Thirring Space Frame-Dragging)
      // ====================================================================
      } else if (type === 'redshift') {
        const draggingVortexStrength = progress * Math.PI * 4;

        // 1. Ripple space coordinate distortion
        particles.forEach((w) => {
          w.radius += 4.5;
          if (w.radius > Math.max(width, height) * 0.75) {
            w.radius = 0;
          }

          const relativeRad = w.radius / (Math.max(width, height) * 0.75);
          const alpha = 0.35 * (1.0 - relativeRad);

          ctx.strokeStyle = `rgba(255, 0, 100, ${alpha})`;
          ctx.lineWidth = 6 * (1.0 - relativeRad);
          ctx.beginPath();
          ctx.arc(centerX, centerY, w.radius, 0, Math.PI * 2);
          ctx.stroke();
        });

        // 2. Draw Lense-Thirring drag coordinate grid
        drawSpaceTimeGrid(progress * 2.8, 0, draggingVortexStrength);

        // Slow down rotation exponentially
        const spinAngle = Math.pow(progress, 0.4) * Math.PI * 6.5;
        const opacity = (1.0 - progress);

        // 3. Render 5 interconnected neon clockwork gears
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const abErr = 5.0 * Math.sin(progress * Math.PI); // Chromatic aberration shift offset

        const gearsConfig = [
          { x: centerX, y: centerY, r: 140, teeth: 16, mult: 1, color: '#00ffcc', shadow: 'rgba(0, 255, 200, 0.7)' }, // Center
          { x: centerX - 185, y: centerY + 80, r: 90, teeth: 10, mult: -1.55, phase: Math.PI / 10, color: '#ff0055', shadow: 'rgba(255, 0, 50, 0.7)' }, // Bottom-Left
          { x: centerX + 175, y: centerY - 95, r: 75, teeth: 8, mult: -1.86, phase: Math.PI / 8, color: '#00ccff', shadow: 'rgba(0, 190, 255, 0.7)' }, // Top-Right
          { x: centerX - 150, y: centerY - 130, r: 60, teeth: 7, mult: -2.33, phase: Math.PI / 6, color: '#ffea00', shadow: 'rgba(255, 230, 0, 0.7)' }, // Top-Left
          { x: centerX + 180, y: centerY + 105, r: 80, teeth: 9, mult: -1.75, phase: Math.PI / 9, color: '#ff00ea', shadow: 'rgba(255, 0, 200, 0.7)' }  // Bottom-Right
        ];

        // Draw ghost trailing paths for smooth motion blur
        secondaryList.forEach((trail) => {
          const trailAngle = Math.pow(Math.max(0, progress - trail.delay * 0.005), 0.4) * Math.PI * 6.5;
          const trailOpacity = opacity * trail.alpha;

          gearsConfig.forEach((g) => {
            // Draw red channel ghost
            drawGear(g.x - abErr * 0.7, g.y, g.r, g.teeth, trailAngle * g.mult + (g.phase || 0), '#ff0055', trailOpacity * 0.5, 'rgba(255, 0, 50, 0.3)');
            // Draw cyan channel ghost
            drawGear(g.x + abErr * 0.7, g.y, g.r, g.teeth, trailAngle * g.mult + (g.phase || 0), '#00ffcc', trailOpacity * 0.5, 'rgba(0, 255, 200, 0.3)');
          });
        });

        // Draw primary gears (RED channel offset left)
        gearsConfig.forEach((g) => {
          drawGear(g.x - abErr, g.y, g.r, g.teeth, spinAngle * g.mult + (g.phase || 0), '#ff0055', opacity * 0.9, g.shadow);
        });

        // Draw primary gears (CYAN channel offset right)
        gearsConfig.forEach((g) => {
          drawGear(g.x + abErr, g.y, g.r, g.teeth, spinAngle * g.mult + (g.phase || 0), '#00ffcc', opacity * 0.9, g.shadow);
        });

        ctx.restore();

        // 4. Roman numerals
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.globalAlpha = opacity;
        ctx.font = 'bold 17px "Outfit", sans-serif';
        ctx.fillStyle = '#f9fafb';
        ctx.shadowColor = '#00beff';
        ctx.shadowBlur = 12;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const romans = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
        for (let i = 0; i < 12; i++) {
          const angle = (i * Math.PI) / 6;
          const rx = Math.sin(angle) * 115;
          const ry = -Math.cos(angle) * 115;
          ctx.fillText(romans[i], rx, ry);
        }

        // Hour Hand
        ctx.save();
        ctx.rotate(spinAngle / 12);
        ctx.strokeStyle = '#ec4899';
        ctx.shadowColor = '#ec4899';
        ctx.lineWidth = 5.0;
        ctx.beginPath();
        ctx.moveTo(0, 12);
        ctx.lineTo(0, -52);
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
        ctx.lineTo(0, -88);
        ctx.stroke();
        ctx.restore();

        ctx.restore();

        // Redshift color overlay
        if (progress > 0.75) {
          const shift = (progress - 0.75) / 0.25;
          ctx.fillStyle = `rgba(12, 1, 24, ${shift * 0.98})`;
          ctx.fillRect(0, 0, width, height);
        }

      // ====================================================================
      // ANIMATION 5: QUANTUM TUNNELING (Atomic d-orbital Probability Clouds)
      // ====================================================================
      } else {
        ctx.fillStyle = '#020704';
        ctx.fillRect(0, 0, width, height);

        // 1. Fluctuating Atomic Orbital Cloud Nodes (Hydrogen d-orbital representation)
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        
        particles.forEach((p) => {
          // Orbit spin rotation (probability wave fluctuation)
          p.angle += p.speed * (1.0 + progress * 2.0);
          
          // Project probability orbital coordinate
          const px = centerX + Math.cos(p.angle) * p.radius;
          // Shape lobes using trigonometric amplitude modulation
          const py = centerY + Math.sin(p.angle) * p.radius * 0.8 * Math.cos(p.angle * 2.0);

          ctx.fillStyle = `rgba(0, 255, 128, ${p.alpha * (1.0 - progress * 0.55)})`;
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();

        // Quantum entanglement strings snapping
        ctx.save();
        ctx.strokeStyle = `rgba(0, 210, 255, ${0.16 * (1.0 - progress)})`;
        ctx.lineWidth = 1.0;
        for (let i = 0; i < 8; i++) {
          const idx1 = Math.floor(Math.random() * particles.length);
          const idx2 = Math.floor(Math.random() * particles.length);
          const p1 = particles[idx1];
          const p2 = particles[idx2];
          
          if (p1 && p2) {
            const x1 = centerX + Math.cos(p1.angle) * p1.radius;
            const y1 = centerY + Math.sin(p1.angle) * p1.radius * 0.8 * Math.cos(p1.angle * 2.0);
            const x2 = centerX + Math.cos(p2.angle) * p2.radius;
            const y2 = centerY + Math.sin(p2.angle) * p2.radius * 0.8 * Math.cos(p2.angle * 2.0);
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        }
        ctx.restore();

        // 2. Glitching Binary rainfall with horizontal scanline displacement
        ctx.save();
        secondaryList.forEach((s) => {
          s.y += s.speed * (1.0 + progress * 2.5);
          if (s.y > height) {
            s.y = 0;
            s.x = Math.random() * width;
          }

          if (Math.random() > 0.94) {
            s.char = Math.random() > 0.5 ? '1' : '0';
          }

          // Horizontal glitch scan jitter
          let gx = s.x;
          if (Math.random() > 0.98) {
            gx += (Math.random() - 0.5) * 80;
          }

          ctx.font = `bold ${s.size}px monospace`;
          ctx.fillStyle = `rgba(0, 210, 255, ${s.opacity * (1.0 - progress * 0.6)})`;
          ctx.shadowBlur = 5;
          ctx.shadowColor = '#00bfff';
          ctx.fillText(s.char, gx, s.y);
        });
        ctx.restore();

        // 3. Schrödinger Wavefunction Collapse Beam
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 255, 128, 0.85)';
        ctx.lineWidth = 3.5;
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#00ff80';
        ctx.beginPath();

        // Wave collapsing into flat line at progress end
        const waveAmp = 140 * (1.0 - progress * 0.96);
        const waveFreq = 0.022 + progress * 0.04;
        const timeScale = elapsed * 0.022;

        for (let x = 0; x <= width; x += 8) {
          const gaussianEnvelope = Math.exp(-Math.pow((x - centerX) / (width * 0.2), 2.0));
          // Oscillating wavefunction
          const waveY = centerY + Math.sin(x * waveFreq - timeScale) * waveAmp * gaussianEnvelope;

          if (x === 0) ctx.moveTo(x, waveY);
          else ctx.lineTo(x, waveY);
        }
        ctx.stroke();
        ctx.restore();

        // Sweeping Laser Grid Scanline
        const scanY = (progress * height * 1.55) % height;
        const scanGrad = ctx.createLinearGradient(0, scanY - 90, 0, scanY + 90);
        scanGrad.addColorStop(0, 'rgba(0, 255, 128, 0)');
        scanGrad.addColorStop(0.5, `rgba(0, 255, 128, ${0.18 * (1.0 - progress)})`);
        scanGrad.addColorStop(1.0, 'rgba(0, 255, 128, 0)');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanY - 90, width, 180);

        // 4. Glitchy matrix collapse blackout
        if (progress > 0.82) {
          const fade = (progress - 0.82) / 0.18;
          ctx.fillStyle = `rgba(5, 18, 10, ${fade})`;
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
