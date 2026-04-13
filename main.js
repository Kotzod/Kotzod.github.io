const tiltTargets = document.querySelectorAll(
  ".interactive-tilt, .project-card, .cv-item, .badge-card",
);
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
const globalBall = document.getElementById("globalBall");
const aboutParticleCanvas = document.getElementById("aboutParticleCanvas");
const globalBallMoveEventName = "global-ball-move";

function initOceanDotsBackground() {
  const existing = document.getElementById("oceanDotsCanvas");
  if (existing) {
    existing.remove();
  }

  const canvas = document.createElement("canvas");
  canvas.id = "oceanDotsCanvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const fields = [
    { x: 0.2, y: 0.24, r: 0.24, phase: 0.1, spin: 0.85 },
    { x: 0.72, y: 0.28, r: 0.3, phase: 1.5, spin: 1.08 },
    { x: 0.56, y: 0.72, r: 0.28, phase: 2.4, spin: 0.74 },
    { x: 0.36, y: 0.56, r: 0.23, phase: 3.1, spin: 0.98 },
  ];

  let rafId = 0;
  let width = 0;
  let height = 0;
  let step = 10;
  const pulses = new Map();

  const syncSize = () => {
    const pixelRatio = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    step = width < 700 ? 8 : 10;
  };

  const getPulse = (ix, iy) => {
    const key = `${ix}:${iy}`;
    let value = pulses.get(key);
    if (value === undefined) {
      value = Math.random() * 0.45;
      pulses.set(key, value);
    }
    return value;
  };

  const renderFrame = (timeMs) => {
    const t = timeMs * 0.001;

    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, "#eff8ff");
    bg.addColorStop(0.45, "#d9ecfb");
    bg.addColorStop(1, "#b4d8f3");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    fields.forEach((field) => {
      field.x += Math.cos(t * 0.08 + field.phase) * 0.00048;
      field.y += Math.sin(t * 0.11 + field.phase) * 0.0004;
      field.r = 0.2 + 0.12 * (0.5 + 0.5 * Math.sin(t * 0.24 + field.phase));

      if (field.x > 1.2) field.x = -0.2;
      if (field.y > 1.2) field.y = -0.2;
      if (field.x < -0.2) field.x = 1.2;
      if (field.y < -0.2) field.y = 1.2;
    });

    for (let y = 0, iy = 0; y <= height + step; y += step, iy += 1) {
      for (let x = 0, ix = 0; x <= width + step; x += step, ix += 1) {
        let intensity = 0;

        for (let i = 0; i < fields.length; i += 1) {
          const field = fields[i];
          const cx = field.x * width;
          const cy = field.y * height;
          const dx = x - cx;
          const dy = y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const normDist = dist / (Math.min(width, height) * field.r);
          const core = Math.max(0, 1 - normDist);
          const angle = Math.atan2(dy, dx);

          const petals =
            0.5 +
            0.5 * Math.sin(angle * 6 + t * (0.72 + field.spin) + field.phase);
          const ring = Math.exp(
            -((normDist - 0.56) * (normDist - 0.56)) / 0.04,
          );

          intensity += core * core * 0.85 + ring * petals * 0.75;
        }

        const pulseBase = getPulse(ix, iy);
        const interference =
          0.18 * Math.sin(x * 0.018 + y * 0.015 + t * 1.08 + pulseBase * 8.0);
        const pulse =
          0.24 *
          Math.sin(t * (1.08 + pulseBase * 2.4) + (ix * 0.21 + iy * 0.12));

        // Random pop-in/out effect - dots appear and disappear everywhere
        const popCycle = (t * 1.2 + pulseBase * 12.4) % 6.28;
        const popPulse = Math.max(0, Math.sin(popCycle) * 1.8);

        const value = Math.max(
          0,
          Math.min(2.2, intensity + pulse + interference + popPulse),
        );
        const radius = 0.5 + value * 3.6;
        const blue = Math.floor(108 + value * 94);

        ctx.fillStyle = `rgba(11, 54, ${blue}, ${0.32 + value * 0.38})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    rafId = requestAnimationFrame(renderFrame);
  };

  window.addEventListener("resize", syncSize);
  syncSize();

  if (reducedMotion) {
    renderFrame(0);
    cancelAnimationFrame(rafId);
    return;
  }

  rafId = requestAnimationFrame(renderFrame);
}

function initTiltEffects() {
  if (reducedMotion) {
    return;
  }

  tiltTargets.forEach((element) => {
    let rafId = 0;
    const state = { rx: 0, ry: 0, tx: 0, ty: 0 };

    const render = () => {
      element.style.transform = `perspective(900px) rotateX(${state.rx}deg) rotateY(${state.ry}deg) translate3d(${state.tx}px, ${state.ty}px, 0)`;
      rafId = 0;
    };

    // Initialize each element with a stable baseline transform.
    render();

    element.addEventListener("pointermove", (event) => {
      const bounds = element.getBoundingClientRect();
      const px = (event.clientX - bounds.left) / bounds.width - 0.5;
      const py = (event.clientY - bounds.top) / bounds.height - 0.5;

      state.ry = px * 7;
      state.rx = -py * 6;
      state.tx = px * 3;
      state.ty = py * 2.5;

      if (!rafId) {
        rafId = requestAnimationFrame(render);
      }
    });

    element.addEventListener("pointerleave", () => {
      state.rx = 0;
      state.ry = 0;
      state.tx = 0;
      state.ty = 0;

      if (!rafId) {
        rafId = requestAnimationFrame(render);
      }
    });
  });
}

function initGlobalBall() {
  if (!globalBall) {
    return;
  }

  const state = {
    dragging: false,
    offsetX: 29,
    offsetY: 29,
    pointerX: 0,
    pointerY: 0,
    autoScrollRaf: 0,
    smoothRaf: 0,
    posX: 26,
    posY: 120,
    targetX: 26,
    targetY: 120,
    velX: 0,
    velY: 0,
    ballW: 58,
    ballH: 58,
    prevCenterX: 0,
    prevCenterY: 0,
  };

  const updateBallSize = () => {
    state.ballW = globalBall.offsetWidth || 58;
    state.ballH = globalBall.offsetHeight || 58;
  };

  const getTopDistanceBoost = (clientY) => {
    if (clientY >= 0) {
      return 1;
    }

    // When the pointer goes above the viewport into browser UI (tabs/bookmarks),
    // increase response proportionally to distance.
    return Math.min(4.5, 1 + Math.abs(clientY) / 42);
  };

  const getScrollDelta = (clientY) => {
    const edgeThreshold = 72;
    const topBoost = getTopDistanceBoost(clientY);

    if (clientY < 0) {
      return -Math.min(52, Math.ceil((Math.abs(clientY) / 3 + 10) * topBoost));
    }

    if (clientY > window.innerHeight) {
      return Math.min(28, Math.ceil((clientY - window.innerHeight) / 4) + 8);
    }

    if (clientY < edgeThreshold) {
      return -Math.ceil((edgeThreshold - clientY) / 6);
    }

    if (clientY > window.innerHeight - edgeThreshold) {
      return Math.ceil((clientY - (window.innerHeight - edgeThreshold)) / 6);
    }

    return 0;
  };

  const clampToViewport = (x, y) => {
    const maxX = window.innerWidth - state.ballW;
    const maxY = window.innerHeight - state.ballH;
    return {
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(0, Math.min(y, maxY)),
    };
  };

  const applyBallPosition = (x, y) => {
    globalBall.style.transform = `translate3d(${x}px, ${y}px, 0)`;

    const centerX = x + state.ballW * 0.5;
    const centerY = y + state.ballH * 0.5;
    window.dispatchEvent(
      new CustomEvent(globalBallMoveEventName, {
        detail: {
          x: centerX,
          y: centerY,
          px: state.prevCenterX,
          py: state.prevCenterY,
          dragging: state.dragging,
        },
      }),
    );

    state.prevCenterX = centerX;
    state.prevCenterY = centerY;
  };

  const updateTargetFromPointer = () => {
    const target = clampToViewport(
      state.pointerX - state.offsetX,
      state.pointerY - state.offsetY,
    );
    state.targetX = target.x;
    state.targetY = target.y;
  };

  const animateBall = () => {
    const dx = state.targetX - state.posX;
    const dy = state.targetY - state.posY;
    const dist = Math.hypot(dx, dy);
    const speedBoost = getTopDistanceBoost(state.pointerY);

    // Softer/heavier preset: gentler pull, longer glide, stronger near-target stick.
    const stickyGain = dist < 16 ? 1.75 : dist < 42 ? 1.28 : 1;
    const spring = Math.min(0.36, 0.105 * speedBoost * stickyGain);
    const damping = dist < 18 ? 0.74 : 0.82;

    state.velX = (state.velX + dx * spring) * damping;
    state.velY = (state.velY + dy * spring) * damping;

    state.posX += state.velX;
    state.posY += state.velY;

    const clamped = clampToViewport(state.posX, state.posY);
    if (clamped.x !== state.posX) {
      state.posX = clamped.x;
      state.velX = 0;
    }
    if (clamped.y !== state.posY) {
      state.posY = clamped.y;
      state.velY = 0;
    }

    if (
      dist < 0.7 &&
      Math.abs(state.velX) < 0.06 &&
      Math.abs(state.velY) < 0.06
    ) {
      state.posX = state.targetX;
      state.posY = state.targetY;
      state.velX = 0;
      state.velY = 0;
      applyBallPosition(state.posX, state.posY);

      if (!state.dragging) {
        state.smoothRaf = 0;
        return;
      }
    }

    applyBallPosition(state.posX, state.posY);
    state.smoothRaf = requestAnimationFrame(animateBall);
  };

  const ensureBallAnimation = () => {
    if (!state.smoothRaf) {
      state.smoothRaf = requestAnimationFrame(animateBall);
    }
  };

  const autoScrollTick = () => {
    if (!state.dragging) {
      state.autoScrollRaf = 0;
      return;
    }

    const delta = getScrollDelta(state.pointerY);
    if (delta !== 0) {
      window.scrollBy(0, delta);
      updateTargetFromPointer();
      ensureBallAnimation();
    }

    state.autoScrollRaf = requestAnimationFrame(autoScrollTick);
  };

  globalBall.addEventListener("pointerdown", (event) => {
    updateBallSize();
    state.dragging = true;
    globalBall.classList.add("is-dragging");
    state.offsetX = state.ballW / 2;
    state.offsetY = state.ballH / 2;
    state.pointerX = event.clientX;
    state.pointerY = event.clientY;
    event.preventDefault();
    globalBall.setPointerCapture(event.pointerId);

    updateTargetFromPointer();
    ensureBallAnimation();

    if (!state.autoScrollRaf) {
      state.autoScrollRaf = requestAnimationFrame(autoScrollTick);
    }
  });

  const handleDragPointer = (event) => {
    if (!state.dragging) {
      return;
    }

    state.pointerX = event.clientX;
    state.pointerY = event.clientY;
    updateTargetFromPointer();
    ensureBallAnimation();
  };

  globalBall.addEventListener("pointermove", handleDragPointer);

  if ("onpointerrawupdate" in window) {
    globalBall.addEventListener("pointerrawupdate", handleDragPointer);
  }

  const release = () => {
    state.dragging = false;
    globalBall.classList.remove("is-dragging");

    if (Math.abs(state.velX) > 0.02 || Math.abs(state.velY) > 0.02) {
      ensureBallAnimation();
    }

    if (state.autoScrollRaf) {
      cancelAnimationFrame(state.autoScrollRaf);
      state.autoScrollRaf = 0;
    }
  };

  globalBall.addEventListener("pointerup", release);
  globalBall.addEventListener("pointercancel", release);

  window.addEventListener("resize", () => {
    updateBallSize();
    const rect = globalBall.getBoundingClientRect();
    const clamped = clampToViewport(rect.left, rect.top);
    state.posX = clamped.x;
    state.posY = clamped.y;
    state.targetX = clamped.x;
    state.targetY = clamped.y;
    applyBallPosition(clamped.x, clamped.y);
  });

  updateBallSize();
  state.prevCenterX = state.posX + state.ballW * 0.5;
  state.prevCenterY = state.posY + state.ballH * 0.5;
  state.targetX = state.posX;
  state.targetY = state.posY;
  applyBallPosition(state.posX, state.posY);
}

function initAboutParticleText() {
  if (!aboutParticleCanvas) {
    return;
  }

  const ctx = aboutParticleCanvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const offscreen = document.createElement("canvas");
  const offCtx = offscreen.getContext("2d", { willReadFrequently: true });
  if (!offCtx) {
    return;
  }

  const mouse = { x: -9999, y: -9999, px: -9999, py: -9999 };
  const ball = {
    x: -9999,
    y: -9999,
    px: -9999,
    py: -9999,
    active: false,
  };
  let particles = [];
  let rafId = 0;

  const sourceText =
    "Why did the edge server go bankrupt? Because it ran out of cache.";

  const computeTextLayout = (width, height) => {
    const text = sourceText || "Oliver Chandler";
    const words = text.split(/\s+/).filter(Boolean);
    const fontSize = Math.max(24, Math.min(40, Math.round(width * 0.043)));
    const lineHeight = Math.round(fontSize * 1.3);
    const maxWidth = Math.max(260, width - 38);
    const lines = [];
    let line = "";

    offCtx.font = `600 ${fontSize}px Outfit, "Segoe UI", sans-serif`;

    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;
      if (offCtx.measureText(candidate).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    });

    if (line) {
      lines.push(line);
    }

    const totalHeight = lines.length * lineHeight;
    const startY = Math.max(14, Math.floor((height - totalHeight) / 2));

    return { lines, fontSize, lineHeight, startY };
  };

  const syncSize = () => {
    const rect = aboutParticleCanvas.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio || 1;
    const height = Math.max(280, Math.min(360, Math.round(rect.width * 0.38)));
    aboutParticleCanvas.width = Math.floor(rect.width * pixelRatio);
    aboutParticleCanvas.height = Math.floor(height * pixelRatio);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    offscreen.width = rect.width;
    offscreen.height = height;
  };

  const buildParticles = () => {
    const width = offscreen.width;
    const height = offscreen.height;
    const layout = computeTextLayout(width, height);

    offCtx.clearRect(0, 0, width, height);
    offCtx.fillStyle = "#0f3d4c";
    offCtx.textAlign = "left";
    offCtx.textBaseline = "top";
    offCtx.font = `600 ${layout.fontSize}px Outfit, "Segoe UI", sans-serif`;

    layout.lines.forEach((row, i) => {
      const rowWidth = offCtx.measureText(row).width;
      const x = (width - rowWidth) / 2;
      offCtx.fillText(row, x, layout.startY + i * layout.lineHeight);
    });

    const image = offCtx.getImageData(0, 0, width, height).data;
    const targets = [];
    const step = 3;

    for (let y = 1; y < height - 1; y += step) {
      for (let x = 1; x < width - 1; x += step) {
        const alpha = image[(y * width + x) * 4 + 3];
        // Fill the entire glyph body so dots form complete letters.
        if (alpha < 72) {
          continue;
        }
        targets.push({ x, y });
      }
    }

    const maxParticles = 4800;
    const selected =
      targets.length > maxParticles
        ? targets.filter(
            (_, i) => i % Math.ceil(targets.length / maxParticles) === 0,
          )
        : targets;

    particles = selected.map((target, index) => {
      const existing = particles[index];
      return {
        x: existing?.x ?? Math.random() * width,
        y: existing?.y ?? Math.random() * height,
        tx: target.x,
        ty: target.y,
        vx: existing?.vx ?? 0,
        vy: existing?.vy ?? 0,
      };
    });
  };

  const animate = () => {
    const width = offscreen.width;
    const height = offscreen.height;
    const mouseActive = mouse.x > -9000 && mouse.y > -9000;
    const ballRangePad = 88;
    const ballActive =
      ball.active &&
      ball.x > -ballRangePad &&
      ball.x < width + ballRangePad &&
      ball.y > -ballRangePad &&
      ball.y < height + ballRangePad;
    const hasInteractor = mouseActive || ballActive;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f6fbff";
    ctx.fillRect(0, 0, width, height);

    // Keep the sentence readable while particles animate around the glyph shape.
    ctx.globalAlpha = 0.36;
    ctx.drawImage(offscreen, 0, 0, width, height);
    ctx.globalAlpha = 1;

    ctx.fillStyle = "#0e5a7c";

    const applyRepel = (
      p,
      sourceX,
      sourceY,
      sourcePrevX,
      sourcePrevY,
      radiusSq,
      trailRadiusSq,
      strength,
      trailStrength,
    ) => {
      const dx = p.x - sourceX;
      const dy = p.y - sourceY;
      const distSq = dx * dx + dy * dy;
      if (distSq < radiusSq && distSq > 0.0001) {
        const force = 1 - distSq / radiusSq;
        p.vx += (dx / Math.sqrt(distSq)) * force * strength;
        p.vy += (dy / Math.sqrt(distSq)) * force * strength;
      }

      // Keep interaction responsive during fast motion by repelling from the
      // previous pointer position too (short trail segment).
      const tdx = p.x - sourcePrevX;
      const tdy = p.y - sourcePrevY;
      const trailDistSq = tdx * tdx + tdy * tdy;
      if (trailDistSq < trailRadiusSq && trailDistSq > 0.0001) {
        const trailForce = 1 - trailDistSq / trailRadiusSq;
        p.vx += (tdx / Math.sqrt(trailDistSq)) * trailForce * trailStrength;
        p.vy += (tdy / Math.sqrt(trailDistSq)) * trailForce * trailStrength;
      }
    };

    particles.forEach((p) => {
      const ax = (p.tx - p.x) * 0.042;
      const ay = (p.ty - p.y) * 0.042;

      if (!hasInteractor) {
        // Non-bouncy settle mode after pointer leaves the canvas.
        p.vx *= 0.42;
        p.vy *= 0.42;
        p.x += (p.tx - p.x) * 0.24 + p.vx;
        p.y += (p.ty - p.y) * 0.24 + p.vy;

        if (Math.abs(p.tx - p.x) < 0.15 && Math.abs(p.ty - p.y) < 0.15) {
          p.x = p.tx;
          p.y = p.ty;
          p.vx = 0;
          p.vy = 0;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.35, 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      if (mouseActive) {
        applyRepel(
          p,
          mouse.x,
          mouse.y,
          mouse.px,
          mouse.py,
          2800,
          3200,
          0.95,
          0.62,
        );
      }

      if (ballActive) {
        applyRepel(p, ball.x, ball.y, ball.px, ball.py, 3800, 4600, 1.08, 0.7);
      }

      p.vx = (p.vx + ax) * 0.91;
      p.vy = (p.vy + ay) * 0.91;
      p.x += p.vx;
      p.y += p.vy;

      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.35, 0, Math.PI * 2);
      ctx.fill();
    });

    rafId = requestAnimationFrame(animate);
  };

  const updatePointer = (event) => {
    const rect = aboutParticleCanvas.getBoundingClientRect();
    mouse.px = mouse.x;
    mouse.py = mouse.y;
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
  };

  aboutParticleCanvas.addEventListener("pointermove", updatePointer);

  if ("onpointerrawupdate" in window) {
    aboutParticleCanvas.addEventListener("pointerrawupdate", updatePointer);
  }

  aboutParticleCanvas.addEventListener("pointerleave", () => {
    mouse.x = -9999;
    mouse.y = -9999;
    mouse.px = -9999;
    mouse.py = -9999;
  });

  window.addEventListener(globalBallMoveEventName, (event) => {
    const detail = event.detail;
    if (!detail || typeof detail !== "object") {
      return;
    }

    if (!detail.dragging) {
      ball.active = false;
      ball.x = -9999;
      ball.y = -9999;
      ball.px = -9999;
      ball.py = -9999;
      return;
    }

    const rect = aboutParticleCanvas.getBoundingClientRect();
    ball.active = true;
    ball.px = detail.px - rect.left;
    ball.py = detail.py - rect.top;
    ball.x = detail.x - rect.left;
    ball.y = detail.y - rect.top;
  });

  window.addEventListener("resize", () => {
    cancelAnimationFrame(rafId);
    syncSize();
    buildParticles();
    if (!reducedMotion) {
      animate();
    }
  });

  syncSize();
  buildParticles();

  if (reducedMotion) {
    const width = offscreen.width;
    const height = offscreen.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f6fbff";
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 0.42;
    ctx.drawImage(offscreen, 0, 0, width, height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#126782";
    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.tx, p.ty, 1.3, 0, Math.PI * 2);
      ctx.fill();
    });
    return;
  }

  animate();
}

initTiltEffects();
initOceanDotsBackground();
initGlobalBall();
initAboutParticleText();
