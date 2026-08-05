(() => {
  const hero = document.querySelector(".hero");
  const finePointer = window.matchMedia("(pointer: fine)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (hero && finePointer.matches && !reducedMotion.matches) {
    const mascot = hero.querySelector(".mascot");
    let targetAngle = 0;
    let angle = 0;
    let velocity = 0;
    let targetSpotX = 50;
    let targetSpotY = 57;
    let spotX = 50;
    let spotY = 57;
    let targetMascotX = 0;
    let targetMascotY = 0;
    let targetMascotTilt = 0;
    let mascotX = 0;
    let mascotY = 0;
    let mascotTilt = 0;
    let targetEyeX = 0;
    let targetEyeY = 0;
    let eyeX = 0;
    let eyeY = 0;

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

      if (mascot) {
        const mascotRect = mascot.getBoundingClientRect();
        const mascotCenterX = mascotRect.left + mascotRect.width / 2;
        const mascotCenterY = mascotRect.top + mascotRect.height / 2;
        const mascotDx = clientX - mascotCenterX;
        const mascotDy = clientY - mascotCenterY;
        targetMascotX = clamp(mascotDx * .014, -6, 6);
        targetMascotY = clamp(mascotDy * .008, -3, 3);
        targetMascotTilt = clamp(mascotDx * .008, -3.2, 3.2);
        targetEyeX = clamp(mascotDx * .025, -7, 7);
        targetEyeY = clamp(mascotDy * .02, -5, 5);
      }
    };

    hero.addEventListener("pointermove", (event) => {
      pointLampAt(event.clientX, event.clientY);
    });

    hero.addEventListener("pointerleave", () => {
      targetAngle = 0;
      targetSpotX = 50;
      targetSpotY = 57;
      targetMascotX = 0;
      targetMascotY = 0;
      targetMascotTilt = 0;
      targetEyeX = 0;
      targetEyeY = 0;
    });

    const animateLamp = () => {
      velocity += (targetAngle - angle) * 0.045;
      velocity *= 0.87;
      angle += velocity;
      spotX += (targetSpotX - spotX) * 0.085;
      spotY += (targetSpotY - spotY) * 0.085;
      mascotX += (targetMascotX - mascotX) * 0.085;
      mascotY += (targetMascotY - mascotY) * 0.085;
      mascotTilt += (targetMascotTilt - mascotTilt) * 0.075;
      eyeX += (targetEyeX - eyeX) * 0.16;
      eyeY += (targetEyeY - eyeY) * 0.16;

      hero.style.setProperty("--lamp-angle", `${angle.toFixed(3)}deg`);
      hero.style.setProperty("--spot-x", `${spotX.toFixed(2)}%`);
      hero.style.setProperty("--spot-y", `${spotY.toFixed(2)}%`);
      if (mascot) {
        mascot.style.setProperty("--mascot-x", `${mascotX.toFixed(2)}px`);
        mascot.style.setProperty("--mascot-y", `${mascotY.toFixed(2)}px`);
        mascot.style.setProperty("--mascot-tilt", `${mascotTilt.toFixed(2)}deg`);
        mascot.style.setProperty("--eye-x", `${eyeX.toFixed(2)}px`);
        mascot.style.setProperty("--eye-y", `${eyeY.toFixed(2)}px`);
      }
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
