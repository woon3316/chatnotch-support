(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");
  const hero = document.querySelector(".hero");

  if (hero && finePointer.matches && !reducedMotion.matches) {
    const mascot = hero.querySelector(".mascot");
    const eyes = hero.querySelector(".mascot-eyes");
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

    const pointAt = (clientX, clientY) => {
      const rect = hero.getBoundingClientRect();
      const pivotX = rect.left + rect.width / 2;
      const pivotY = rect.top + 8;
      const dx = clientX - pivotX;
      const dy = Math.max(210, clientY - pivotY);

      targetAngle = clamp(-Math.atan2(dx, dy) * 180 / Math.PI * 0.56, -14, 14);
      targetSpotX = clamp((clientX - rect.left) / rect.width * 100, 14, 86);
      targetSpotY = clamp((clientY - rect.top) / rect.height * 100, 30, 84);

      if (!mascot) return;
      const mascotRect = mascot.getBoundingClientRect();
      const mascotCenterX = mascotRect.left + mascotRect.width / 2;
      const mascotCenterY = mascotRect.top + mascotRect.height / 2;
      const mascotDx = clientX - mascotCenterX;
      const mascotDy = clientY - mascotCenterY;

      targetMascotX = clamp(mascotDx * .012, -7, 7);
      targetMascotY = clamp(mascotDy * .007, -4, 4);
      targetMascotTilt = clamp(mascotDx * .006, -2.8, 2.8);
      targetEyeX = clamp(mascotDx * .025, -10, 10);
      targetEyeY = clamp(mascotDy * .018, -7, 7);
    };

    hero.addEventListener("pointermove", (event) => pointAt(event.clientX, event.clientY));
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

    if (mascot) {
      mascot.addEventListener("pointerdown", () => {
        mascot.classList.add("is-winking");
        window.setTimeout(() => mascot.classList.remove("is-winking"), 420);
      });

      const blink = () => {
        mascot.classList.add("is-blinking");
        window.setTimeout(() => mascot.classList.remove("is-blinking"), 155);
        window.setTimeout(blink, 2600 + Math.random() * 3200);
      };
      window.setTimeout(blink, 1800);
    }

    const animateHero = () => {
      velocity += (targetAngle - angle) * .045;
      velocity *= .87;
      angle += velocity;
      spotX += (targetSpotX - spotX) * .085;
      spotY += (targetSpotY - spotY) * .085;
      mascotX += (targetMascotX - mascotX) * .085;
      mascotY += (targetMascotY - mascotY) * .085;
      mascotTilt += (targetMascotTilt - mascotTilt) * .075;
      eyeX += (targetEyeX - eyeX) * .12;
      eyeY += (targetEyeY - eyeY) * .12;

      hero.style.setProperty("--lamp-angle", `${angle.toFixed(3)}deg`);
      hero.style.setProperty("--spot-x", `${spotX.toFixed(2)}%`);
      hero.style.setProperty("--spot-y", `${spotY.toFixed(2)}%`);
      if (mascot) {
        mascot.style.setProperty("--mascot-x", `${mascotX.toFixed(2)}px`);
        mascot.style.setProperty("--mascot-y", `${mascotY.toFixed(2)}px`);
        mascot.style.setProperty("--mascot-tilt", `${mascotTilt.toFixed(2)}deg`);
      }
      if (eyes) {
        eyes.style.setProperty("--eye-x", `${eyeX.toFixed(2)}px`);
        eyes.style.setProperty("--eye-y", `${eyeY.toFixed(2)}px`);
      }
      window.requestAnimationFrame(animateHero);
    };

    window.requestAnimationFrame(animateHero);
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
    }, { threshold: .12, rootMargin: "0px 0px -7%" });
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

  const stage = document.querySelector("[data-pulse-stage]");
  if (stage) {
    const preview = stage.querySelector("[data-pulse-preview]");
    const label = stage.querySelector("[data-pulse-label]");
    const buttons = [...stage.querySelectorAll("[data-pulse-src]")];
    let activeIndex = 0;

    const showPreview = (button) => {
      const nextIndex = buttons.indexOf(button);
      if (nextIndex < 0 || nextIndex === activeIndex) return;
      activeIndex = nextIndex;
      buttons.forEach((item, index) => {
        const active = index === activeIndex;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      preview.classList.add("is-switching");
      window.setTimeout(() => {
        preview.src = button.dataset.pulseSrc;
        preview.alt = button.dataset.pulseAlt || "ChatNotch 原版界面";
        if (label) label.textContent = button.dataset.pulseLabel || button.textContent.trim();
        preview.decode?.().catch(() => {}).finally(() => {
          requestAnimationFrame(() => preview.classList.remove("is-switching"));
        });
      }, 120);
    };

    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));
      button.addEventListener("click", () => showPreview(button));
    });

    stage.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      showPreview(buttons[(activeIndex + direction + buttons.length) % buttons.length]);
    });

    const tilt = stage.querySelector("[data-pulse-tilt]");
    if (tilt && finePointer.matches && !reducedMotion.matches) {
      stage.addEventListener("pointermove", (event) => {
        const rect = stage.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        tilt.style.setProperty("--stage-rotate-x", `${(-y * 1.2).toFixed(2)}deg`);
        tilt.style.setProperty("--stage-rotate-y", `${(x * 1.5).toFixed(2)}deg`);
      });
      stage.addEventListener("pointerleave", () => {
        tilt.style.setProperty("--stage-rotate-x", "0deg");
        tilt.style.setProperty("--stage-rotate-y", "0deg");
      });
    }
  }
})();
