(() => {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  const finePointer = window.matchMedia("(pointer: fine)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!finePointer.matches || reducedMotion.matches) return;

  let targetAngle = 0;
  let targetShift = 0;
  let targetSpotX = 50;
  let targetSpotY = 47;
  let angle = 0;
  let angleVelocity = 0;
  let shift = 0;
  let shiftVelocity = 0;
  let spotX = 50;
  let spotY = 47;

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const nx = Math.max(-1, Math.min(1, x * 2 - 1));
    const ny = Math.max(-1, Math.min(1, y * 2 - 1));

    targetAngle = nx * 9;
    targetShift = nx * 54;
    targetSpotX = 50 + nx * 25;
    targetSpotY = 47 + ny * 16;
  });

  hero.addEventListener("pointerleave", () => {
    targetAngle = 0;
    targetShift = 0;
    targetSpotX = 50;
    targetSpotY = 47;
  });

  hero.addEventListener("pointerdown", () => {
    angleVelocity += targetAngle > 0 ? 0.75 : -0.75;
  });

  const animate = () => {
    angleVelocity += (targetAngle - angle) * 0.035;
    angleVelocity *= 0.88;
    angle += angleVelocity;

    shiftVelocity += (targetShift - shift) * 0.024;
    shiftVelocity *= 0.86;
    shift += shiftVelocity;

    spotX += (targetSpotX - spotX) * 0.075;
    spotY += (targetSpotY - spotY) * 0.075;

    hero.style.setProperty("--lamp-angle", `${angle.toFixed(3)}deg`);
    hero.style.setProperty("--lamp-shift", `${shift.toFixed(2)}px`);
    hero.style.setProperty("--spot-x", `${spotX.toFixed(2)}%`);
    hero.style.setProperty("--spot-y", `${spotY.toFixed(2)}%`);
    window.requestAnimationFrame(animate);
  };

  window.requestAnimationFrame(animate);
})();
