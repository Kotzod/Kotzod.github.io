const heroCanvas = document.getElementById("textCanvas");
const heroStatus = document.getElementById("canvasStatus");
const labCanvas = document.getElementById("pretextLabCanvas");
const labStatus = document.getElementById("pretextLabStatus");
const projectsCanvas = document.getElementById("projectsCanvas");
const projectsStatus = document.getElementById("projectsStatus");
const projectsGrid = document.getElementById("projectsGrid");
const hero = document.querySelector(".hero");
const tiltTargets = document.querySelectorAll(".interactive-tilt");

const heroCtx = heroCanvas?.getContext("2d");
const labCtx = labCanvas?.getContext("2d");
const projectsCtx = projectsCanvas?.getContext("2d");
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const pointer = {
  x: 0,
  y: 0,
  tx: 0,
  ty: 0,
};

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";

  for (let i = 0; i < words.length; i += 1) {
    const candidate = `${line}${words[i]} `;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line.trim());
      line = `${words[i]} `;
    } else {
      line = candidate;
    }
  }

  if (line) {
    lines.push(line.trim());
  }

  return lines;
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

    element.addEventListener("pointermove", (event) => {
      const bounds = element.getBoundingClientRect();
      const px = (event.clientX - bounds.left) / bounds.width - 0.5;
      const py = (event.clientY - bounds.top) / bounds.height - 0.5;

      state.ry = px * 7;
      state.rx = -py * 6;
      state.tx = px * 3.2;
      state.ty = py * 2.8;

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

function drawFallback() {
  if (heroCtx && heroCanvas) {
    heroCtx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
    heroCtx.fillStyle = "#98e6dc";
    heroCtx.font = "700 22px Syne, sans-serif";
    heroCtx.fillText("Playful UI, serious foundations.", 22, 60);
    heroCtx.fillStyle = "#ecf7ff";
    heroCtx.font = "400 15px Outfit, sans-serif";
    heroCtx.fillText(
      "Canvas effect is optional; content stays semantic.",
      22,
      95,
    );
  }

  if (labCtx && labCanvas) {
    labCtx.clearRect(0, 0, labCanvas.width, labCanvas.height);
    labCtx.fillStyle = "#0f3d4c";
    labCtx.font = "700 20px Syne, sans-serif";
    labCtx.fillText("Pretext lab fallback mode", 26, 68);
    labCtx.fillStyle = "#36576b";
    labCtx.font = "400 14px Outfit, sans-serif";
    labCtx.fillText(
      "Animations and ribbons will appear when pretext loads.",
      26,
      95,
    );
  }

  if (heroStatus) {
    heroStatus.textContent =
      "Fallback canvas mode active (pretext unavailable).";
  }
  if (labStatus) {
    labStatus.textContent = "Pretext lab fallback active.";
  }
}

async function loadPretext() {
  return import("https://esm.sh/@chenglou/pretext@latest");
}

function initProjectsSpotlight(pretext) {
  const cards = Array.from(
    document.querySelectorAll(".project-card[data-project-id]"),
  );

  if (
    !projectsCanvas ||
    !projectsCtx ||
    !projectsStatus ||
    cards.length === 0
  ) {
    return;
  }

  const projects = [
    {
      id: "dreamhouse",
      title: "Dreamhouse",
      subtitle: "Salesforce DX",
      description:
        "Config-driven Salesforce DX project with a platform-style workflow (SFDX + LWC).",
      stack: ["Salesforce", "SFDX", "LWC"],
    },
    {
      id: "datapipeline-final",
      title: "Final_project_Oliver_Chandler",
      subtitle: "Python Data Pipeline",
      description:
        "End-to-end data pipeline project with runnable scripts, helpers, and packaged outputs.",
      stack: ["Python", "Data", "Pipelines"],
    },
    {
      id: "final-assignment",
      title: "Final_Assignment",
      subtitle: "React + Vite",
      description:
        "Frontend app built with modern tooling and routing, focused on maintainable UI structure.",
      stack: ["React", "Vite", "Router"],
    },
    {
      id: "final-app",
      title: "final_app",
      subtitle: "Node/Express API",
      description:
        "Backend API with MongoDB/Mongoose, JWT authentication, password hashing, and input validation.",
      stack: ["Node", "Express", "MongoDB"],
    },
    {
      id: "fullstack-project",
      title: "fullstack_project",
      subtitle: "Full-stack",
      description:
        "Split frontend/backend project with client-server coordination and API contracts.",
      stack: ["Full-stack", "API", "Web"],
    },
    {
      id: "bowd-example",
      title: "bowd-w04-example-main",
      subtitle: "Full-stack Example",
      description:
        "Example full-stack app layout with separate backend and frontend directories.",
      stack: ["Backend", "Frontend", "Examples"],
    },
    {
      id: "weather-app",
      title: "final_assignement",
      subtitle: "Weather App",
      description:
        "Forecast app with API fetching, tables, charts, and computed statistics.",
      stack: ["JavaScript", "API", "Charts"],
    },
    {
      id: "valentines",
      title: "valentine-projects-main",
      subtitle: "Interactive Bundle",
      description:
        "A bundle of small interactive web experiences built for playful UI experimentation.",
      stack: ["Web", "Interaction", "Mini-apps"],
    },
    {
      id: "unity",
      title: "Unity project",
      subtitle: "Game Dev",
      description:
        "Unity game project bundle combining scenes, assets, and scripts.",
      stack: ["Unity", "C#", "Game"],
    },
    {
      id: "frontend-server",
      title: "server",
      subtitle: "Standalone Server",
      description:
        "Separate server-side app used alongside frontend coursework projects.",
      stack: ["Node", "Server", "Tooling"],
    },
  ];

  const byId = new Map(projects.map((project) => [project.id, project]));
  const cachedPrepared = new Map();

  const spotlightWidth = projectsCanvas.width;
  const spotlightHeight = projectsCanvas.height;

  const titleFont = "800 22px Syne";
  const subtitleFont = "600 13px Outfit";
  const bodyFont = "400 14px Outfit";
  const tagFont = "600 12px Outfit";

  const getPrepared = (text, font) => {
    if (!pretext?.prepareWithSegments) {
      return null;
    }

    const key = `${font}::${text}`;
    if (cachedPrepared.has(key)) {
      return cachedPrepared.get(key);
    }

    const prepared = pretext.prepareWithSegments(text, font, {
      whiteSpace: "normal",
      wordBreak: "normal",
    });
    cachedPrepared.set(key, prepared);
    return prepared;
  };

  const paintBackground = () => {
    projectsCtx.clearRect(0, 0, spotlightWidth, spotlightHeight);
    const bg = projectsCtx.createLinearGradient(
      0,
      0,
      spotlightWidth,
      spotlightHeight,
    );
    bg.addColorStop(0, "#ffffff");
    bg.addColorStop(1, "#eef7fd");
    projectsCtx.fillStyle = bg;
    projectsCtx.fillRect(0, 0, spotlightWidth, spotlightHeight);
  };

  const drawTextBlockFallback = (
    text,
    font,
    x,
    y,
    maxWidth,
    lineHeight,
    color,
  ) => {
    projectsCtx.font = font;
    projectsCtx.fillStyle = color;
    const lines = wrapLines(projectsCtx, text, maxWidth);
    lines.forEach((line, index) => {
      projectsCtx.fillText(line, x, y + index * lineHeight);
    });
    return y + lines.length * lineHeight;
  };

  const drawTextBlockPretext = (
    text,
    font,
    x,
    y,
    maxWidth,
    lineHeight,
    color,
  ) => {
    const prepared = getPrepared(text, font);
    if (!prepared) {
      return drawTextBlockFallback(
        text,
        font,
        x,
        y,
        maxWidth,
        lineHeight,
        color,
      );
    }

    const { lines, lineCount } = pretext.layoutWithLines(
      prepared,
      maxWidth,
      lineHeight,
    );
    projectsCtx.font = font;
    projectsCtx.fillStyle = color;
    for (let i = 0; i < lines.length; i += 1) {
      projectsCtx.fillText(lines[i].text, x, y + i * lineHeight);
    }
    return { nextY: y + lineCount * lineHeight, lineCount };
  };

  const renderSpotlight = (projectId) => {
    const project = byId.get(projectId) ?? projects[0];
    paintBackground();

    const padX = 18;
    const padY = 20;
    const maxWidth = spotlightWidth - padX * 2;

    projectsCtx.fillStyle = "#14213d";
    projectsCtx.fillRect(12, 12, spotlightWidth - 24, spotlightHeight - 24);
    projectsCtx.globalCompositeOperation = "source-over";
    projectsCtx.clearRect(13, 13, spotlightWidth - 26, spotlightHeight - 26);

    let cursorY = padY;

    const titleResult = drawTextBlockPretext(
      project.title,
      titleFont,
      padX,
      cursorY,
      maxWidth,
      28,
      "#0f3d4c",
    );

    cursorY = (titleResult?.nextY ?? titleResult) + 2;

    const subtitleResult = drawTextBlockPretext(
      project.subtitle,
      subtitleFont,
      padX,
      cursorY,
      maxWidth,
      18,
      "#5b7083",
    );

    cursorY = (subtitleResult?.nextY ?? subtitleResult) + 12;

    const descriptionResult = drawTextBlockPretext(
      project.description,
      bodyFont,
      padX,
      cursorY,
      maxWidth,
      20,
      "#12263a",
    );

    cursorY = (descriptionResult?.nextY ?? descriptionResult) + 12;

    const tagLine = project.stack.join("  •  ");
    const tagsResult = drawTextBlockPretext(
      tagLine,
      tagFont,
      padX,
      cursorY,
      maxWidth,
      18,
      "#1d8a99",
    );

    projectsCtx.fillStyle = "rgba(18, 38, 58, 0.45)";
    projectsCtx.font = "600 11px Outfit";
    if (pretext?.layoutWithLines) {
      const totalLines =
        (titleResult?.lineCount ?? 0) +
        (subtitleResult?.lineCount ?? 0) +
        (descriptionResult?.lineCount ?? 0) +
        (tagsResult?.lineCount ?? 0);
      projectsCtx.fillText(
        `pretext layout: ~${totalLines} lines`,
        padX,
        spotlightHeight - 18,
      );
    } else {
      projectsCtx.fillText("fallback layout mode", padX, spotlightHeight - 18);
    }

    if (projectsStatus) {
      projectsStatus.textContent = pretext?.layoutWithLines
        ? `Spotlight ready (pretext active). Showing: ${project.title}`
        : `Spotlight ready (fallback). Showing: ${project.title}`;
    }

    cards.forEach((card) => {
      card.classList.toggle("is-active", card.dataset.projectId === project.id);
    });
  };

  const onSelect = (event) => {
    const card = event.target?.closest?.(".project-card[data-project-id]");
    if (!card) {
      return;
    }
    renderSpotlight(card.dataset.projectId);
  };

  cards.forEach((card) => {
    card.addEventListener("pointerenter", onSelect);
    card.addEventListener("focusin", onSelect);
  });

  projectsGrid?.addEventListener?.("pointerleave", () => {
    renderSpotlight(projects[0].id);
  });

  renderSpotlight(projects[0].id);
}

async function initPretextExperience() {
  if (!heroCtx || !heroCanvas || !labCtx || !labCanvas) {
    initProjectsSpotlight(null);
    return;
  }

  try {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    const pretext = await loadPretext();
    const { prepare, layout } = pretext;

    const heroText =
      "Measured by pretext. Animated with cursor parallax. Built on semantic HTML.";
    const heroFont = "700 24px Syne";
    const heroPrepared = prepare(heroText, heroFont);
    const heroMetrics = layout(heroPrepared, 440, 32);

    const ribbons = [
      "pretext-driven layout metrics",
      "GPU-friendly canvas redraw",
      "cursor-reactive motion",
      "semantic DOM + accessible content",
      "lightweight animation loop",
    ];

    const ribbonData = ribbons.map((text, index) => {
      const font = index % 2 === 0 ? "700 24px Syne" : "600 20px Outfit";
      const prepared = prepare(text, font);
      const metrics = layout(prepared, 500, 28);
      return { text, font, metrics, offset: index * 170 };
    });

    if (heroStatus) {
      heroStatus.textContent = "pretext hero effects running.";
    }
    if (labStatus) {
      labStatus.textContent = "pretext lab ribbons active.";
    }

    let last = performance.now();
    let t = 0;

    const animate = (now) => {
      if (document.hidden) {
        requestAnimationFrame(animate);
        return;
      }

      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      t += dt;

      pointer.x += (pointer.tx - pointer.x) * 0.09;
      pointer.y += (pointer.ty - pointer.y) * 0.09;

      const shiftX = pointer.x * 9;
      const shiftY = pointer.y * 7;

      heroCtx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
      const bg = heroCtx.createLinearGradient(
        0,
        0,
        heroCanvas.width,
        heroCanvas.height,
      );
      bg.addColorStop(0, "#0f2f42");
      bg.addColorStop(1, "#0a2230");
      heroCtx.fillStyle = bg;
      heroCtx.fillRect(0, 0, heroCanvas.width, heroCanvas.height);

      heroCtx.save();
      heroCtx.translate(shiftX, shiftY);
      heroCtx.fillStyle = "#99f6e4";
      heroCtx.font = heroFont;
      const lines = wrapLines(heroCtx, heroText, 440);
      lines.forEach((line, i) => {
        heroCtx.fillText(line, 20, 42 + i * 32);
      });
      heroCtx.restore();

      heroCtx.fillStyle = "rgba(236, 247, 255, 0.95)";
      heroCtx.font = "400 14px Outfit, sans-serif";
      heroCtx.fillText(
        `pretext metrics: ${heroMetrics.lineCount} lines, ${Math.round(heroMetrics.height)}px`,
        20,
        190,
      );

      labCtx.clearRect(0, 0, labCanvas.width, labCanvas.height);
      labCtx.fillStyle = "#eff8ff";
      labCtx.fillRect(0, 0, labCanvas.width, labCanvas.height);

      labCtx.fillStyle = "#194357";
      labCtx.font = "700 14px Outfit";
      labCtx.fillText("PRETEXT RIBBONS", 20, 24);

      ribbonData.forEach((ribbon, index) => {
        const speed = 22 + index * 6;
        const baseX =
          (labCanvas.width + ribbon.offset - t * speed * 36) %
          (labCanvas.width + 320);
        const x = labCanvas.width - baseX + pointer.x * (index + 1) * 2;
        const y = 56 + index * 25 + Math.sin(t * 2.4 + index) * 4;

        labCtx.font = ribbon.font;
        labCtx.fillStyle = index % 2 === 0 ? "#0d5a80" : "#d9622a";
        labCtx.fillText(ribbon.text, x, y);

        labCtx.fillStyle = "rgba(18, 38, 58, 0.4)";
        labCtx.font = "400 11px Outfit";
        labCtx.fillText(
          `${ribbon.metrics.lineCount}L / ${Math.round(ribbon.metrics.height)}px`,
          x + 4,
          y + 13,
        );
      });

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
    initProjectsSpotlight(pretext);
  } catch (error) {
    drawFallback();
    initProjectsSpotlight(null);
  }
}

function initCursorParallax() {
  if (!hero || reducedMotion) {
    return;
  }

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    pointer.tx = (event.clientX - rect.left) / rect.width - 0.5;
    pointer.ty = (event.clientY - rect.top) / rect.height - 0.5;
  });

  hero.addEventListener("pointerleave", () => {
    pointer.tx = 0;
    pointer.ty = 0;
  });
}

initTiltEffects();
initCursorParallax();
initPretextExperience();
