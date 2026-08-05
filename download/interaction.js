(() => {
  const hero = document.querySelector(".hero");
  const finePointer = window.matchMedia("(pointer: fine)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (hero && finePointer.matches && !reducedMotion.matches) {
    const spotlightButton = hero.querySelector(".hero-actions .download-target");
    let targetAngle = 0;
    let angle = 0;
    let velocity = 0;
    let targetSpotX = 50;
    let targetSpotY = 57;
    let spotX = 50;
    let spotY = 57;
    let lastPointer = null;
    let buttonFocused = false;

    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

    const pointLampAt = (clientX, clientY) => {
      const rect = hero.getBoundingClientRect();
      const pivotX = rect.left + rect.width / 2;
      const pivotY = rect.top + 8;
      const dx = clientX - pivotX;
      const dy = Math.max(210, clientY - pivotY);
      targetAngle = clamp(-Math.atan2(dx, dy) * 180 / Math.PI * 0.56, -14, 14);
      targetSpotX = clamp((clientX - rect.left) / rect.width * 100, 14, 86);
      targetSpotY = clamp((clientY - rect.top) / rect.height * 100, 30, 84);
    };

    const focusDownload = () => {
      if (!spotlightButton) return;
      const heroRect = hero.getBoundingClientRect();
      const buttonRect = spotlightButton.getBoundingClientRect();
      const buttonX = buttonRect.left + buttonRect.width / 2;
      const buttonY = buttonRect.top + buttonRect.height / 2;
      const pivotX = heroRect.left + heroRect.width / 2;
      const pivotY = heroRect.top + 210;
      const dx = buttonX - pivotX;
      const dy = Math.max(180, buttonY - pivotY);
      const beamAngle = clamp(-Math.atan2(dx, dy) * 180 / Math.PI, -58, 58);

      buttonFocused = true;
      targetAngle = clamp(beamAngle * 0.2, -12, 12);
      targetSpotX = clamp((buttonX - heroRect.left) / heroRect.width * 100, 12, 88);
      targetSpotY = clamp((buttonY - heroRect.top) / heroRect.height * 100, 30, 88);
      hero.style.setProperty("--beam-angle", `${beamAngle.toFixed(2)}deg`);
      hero.classList.add("download-focus");
    };

    hero.addEventListener("pointermove", (event) => {
      lastPointer = { x: event.clientX, y: event.clientY };
      if (!buttonFocused) pointLampAt(event.clientX, event.clientY);
    });

    hero.addEventListener("pointerleave", () => {
      buttonFocused = false;
      hero.classList.remove("download-focus");
      targetAngle = 0;
      targetSpotX = 50;
      targetSpotY = 57;
    });

    if (spotlightButton) {
      spotlightButton.addEventListener("pointerenter", focusDownload);
      spotlightButton.addEventListener("focus", focusDownload);
      const releaseDownload = () => {
        buttonFocused = false;
        hero.classList.remove("download-focus");
        if (lastPointer) pointLampAt(lastPointer.x, lastPointer.y);
      };
      spotlightButton.addEventListener("pointerleave", releaseDownload);
      spotlightButton.addEventListener("blur", releaseDownload);
    }

    const animateLamp = () => {
      velocity += (targetAngle - angle) * 0.045;
      velocity *= 0.87;
      angle += velocity;
      spotX += (targetSpotX - spotX) * 0.085;
      spotY += (targetSpotY - spotY) * 0.085;

      hero.style.setProperty("--lamp-angle", `${angle.toFixed(3)}deg`);
      hero.style.setProperty("--spot-x", `${spotX.toFixed(2)}%`);
      hero.style.setProperty("--spot-y", `${spotY.toFixed(2)}%`);
      window.requestAnimationFrame(animateLamp);
    };

    window.requestAnimationFrame(animateLamp);
  }

  const reveals = document.querySelectorAll(".reveal");
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    reveals.forEach((element) => element.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -7%" });
    reveals.forEach((element) => revealObserver.observe(element));
  }

  const video = document.querySelector("#product-video");
  const replayButton = document.querySelector(".video-replay");
  if (video && replayButton) {
    replayButton.addEventListener("click", () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    });
  }
})();
