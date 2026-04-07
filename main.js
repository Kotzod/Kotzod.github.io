const tiltTargets = document.querySelectorAll(".interactive-tilt");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

initTiltEffects();
