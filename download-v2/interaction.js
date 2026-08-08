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

      hero.style.setProperty("--lamp-angle", `${angle.toFixed(3)}deg`);
      hero.style.setProperty("--spot-x", `${spotX.toFixed(2)}%`);
      hero.style.setProperty("--spot-y", `${spotY.toFixed(2)}%`);
      if (mascot) {
        mascot.style.setProperty("--mascot-x", `${mascotX.toFixed(2)}px`);
        mascot.style.setProperty("--mascot-y", `${mascotY.toFixed(2)}px`);
        mascot.style.setProperty("--mascot-tilt", `${mascotTilt.toFixed(2)}deg`);
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

  const visualPreview = document.querySelector("[data-visual-preview]");
  const visualButtons = document.querySelectorAll("[data-visual-src]");
  if (visualPreview && visualButtons.length) {
    visualButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (button.classList.contains("is-active")) return;
        visualPreview.classList.add("is-switching");
        window.setTimeout(() => {
          visualPreview.src = button.dataset.visualSrc;
          visualPreview.alt = button.dataset.visualAlt || "ChatNotch 原版界面";
          visualButtons.forEach((item) => item.classList.toggle("is-active", item === button));
          visualPreview.decode?.().catch(() => {}).finally(() => {
            window.requestAnimationFrame(() => visualPreview.classList.remove("is-switching"));
          });
        }, 120);
      });
    });
  }

  const liveDemo = document.querySelector("[data-live-demo]");
  if (liveDemo) {
    const liveMac = liveDemo.querySelector("[data-live-mac]");
    const island = liveDemo.querySelector("[data-live-island]");
    const toggleButtons = liveDemo.querySelectorAll("[data-live-toggle]");
    const stateButtons = liveDemo.querySelectorAll("[data-live-state]");
    const stateNumber = liveDemo.querySelector("[data-live-state-number]");
    const stateLabel = liveDemo.querySelector("[data-live-state-label]");
    const moduleButtons = liveDemo.querySelectorAll("[data-live-module]");
    const panels = liveDemo.querySelectorAll("[data-live-panel]");
    const settingsButton = liveDemo.querySelector("[data-live-settings]");
    const settingsPopover = liveDemo.querySelector("[data-live-settings-popover]");
    const pinButton = liveDemo.querySelector("[data-live-pin]");
    let isPinned = false;
    let ignoreNextClick = false;
    let hoverTimer = 0;
    let collapseTimer = 0;
    const states = ["compact", "expanded", "full"];
    const stateMeta = {
      compact: { number: "01", label: "紧凑" },
      expanded: { number: "02", label: "展开" },
      full: { number: "03", label: "完整" }
    };

    const setState = (state) => {
      const nextState = states.includes(state) ? state : "compact";
      island.dataset.state = nextState;
      liveMac.classList.toggle("is-interacting", nextState !== "compact");
      if (stateNumber) stateNumber.textContent = stateMeta[nextState].number;
      if (stateLabel) stateLabel.textContent = stateMeta[nextState].label;
      stateButtons.forEach((button) => {
        button.classList.toggle("is-active", button.dataset.liveState === nextState);
        button.setAttribute("aria-pressed", String(button.dataset.liveState === nextState));
      });
      toggleButtons.forEach((button) => {
        button.setAttribute("aria-label", nextState === "full" ? "收起 ChatNotch" : "继续展开 ChatNotch");
      });
      if (nextState !== "full" && settingsPopover) settingsPopover.hidden = true;
    };

    const moveState = (direction) => {
      const index = Math.max(0, states.indexOf(island.dataset.state));
      setState(states[Math.max(0, Math.min(states.length - 1, index + direction))]);
    };

    toggleButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (ignoreNextClick) return;
        if (island.dataset.state === "full") setState("compact");
        else moveState(1);
      });
    });

    stateButtons.forEach((button) => {
      button.addEventListener("click", () => setState(button.dataset.liveState));
    });

    const selectModule = (moduleName) => {
      island.dataset.module = moduleName;
      panels.forEach((panel) => {
        const active = panel.dataset.livePanel === moduleName;
        panel.hidden = !active;
        panel.classList.toggle("is-active", active);
      });
      moduleButtons.forEach((button) => {
        const active = button.dataset.liveModule === moduleName;
        button.classList.toggle("is-active", active);
        if (button.getAttribute("role") === "tab") button.setAttribute("aria-selected", String(active));
      });
      if (settingsPopover) settingsPopover.hidden = true;
    };

    moduleButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setState("full");
        selectModule(button.dataset.liveModule);
      });
    });

    if (window.matchMedia("(pointer: fine)").matches) {
      island.addEventListener("pointerenter", () => {
        window.clearTimeout(collapseTimer);
        if (island.dataset.state !== "compact") return;
        hoverTimer = window.setTimeout(() => setState("expanded"), 300);
      });
      island.addEventListener("pointerleave", () => {
        window.clearTimeout(hoverTimer);
        if (isPinned || island.dataset.state !== "expanded") return;
        collapseTimer = window.setTimeout(() => setState("compact"), 520);
      });
    }

    const moduleNames = ["home", "volume", "shelf", "calendar", "weather", "battery"];
    const cycleModule = (direction) => {
      const current = Math.max(0, moduleNames.indexOf(island.dataset.module));
      const next = (current + direction + moduleNames.length) % moduleNames.length;
      setState("full");
      selectModule(moduleNames[next]);
    };

    let pointerStart = null;
    island.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      pointerStart = { x: event.clientX, y: event.clientY };
    });
    island.addEventListener("pointerup", (event) => {
      if (!pointerStart) return;
      const deltaX = event.clientX - pointerStart.x;
      const deltaY = event.clientY - pointerStart.y;
      pointerStart = null;
      if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 18) return;
      ignoreNextClick = true;
      window.setTimeout(() => { ignoreNextClick = false; }, 0);
      if (Math.abs(deltaY) > Math.abs(deltaX)) moveState(deltaY < 0 ? 1 : -1);
      else cycleModule(deltaX < 0 ? 1 : -1);
    });
    island.addEventListener("pointercancel", () => { pointerStart = null; });

    if (pinButton) {
      pinButton.addEventListener("click", () => {
        isPinned = !isPinned;
        pinButton.setAttribute("aria-pressed", String(isPinned));
        pinButton.setAttribute("aria-label", isPinned ? "取消固定灵动岛" : "固定灵动岛");
      });
    }

    if (settingsButton && settingsPopover) {
      settingsButton.addEventListener("click", () => {
        settingsPopover.hidden = !settingsPopover.hidden;
      });
    }

    liveDemo.querySelectorAll(".live-days button").forEach((button) => {
      button.addEventListener("click", () => {
        liveDemo.querySelectorAll(".live-days button").forEach((item) => item.classList.remove("is-selected"));
        button.classList.add("is-selected");
      });
    });

    const updateReminderCount = () => {
      const remaining = liveDemo.querySelectorAll(".live-home-panel [data-live-reminder]:not(.is-done)").length;
      const label = liveDemo.querySelector("[data-live-reminder-count]");
      if (label) label.textContent = `${remaining} 项`;
    };

    liveDemo.querySelectorAll("[data-live-reminder]").forEach((button) => {
      button.addEventListener("click", () => {
        button.classList.toggle("is-done");
        updateReminderCount();
      });
    });

    const tracks = [
      { title: "理想三旬", lyric: "雨后有车驶来" },
      { title: "收听浓烟下的", lyric: "驶过暮色苍白" },
      { title: "夏夜晚风", lyric: "时间就这样轻轻经过" }
    ];
    let trackIndex = 0;
    let isPlaying = true;
    let elapsed = 5;
    const duration = 210;
    const playButton = liveDemo.querySelector("[data-live-play]");
    const progress = liveDemo.querySelector("[data-live-progress]");
    const elapsedLabel = liveDemo.querySelector("[data-live-elapsed]");
    const titleLabel = liveDemo.querySelector(".live-media-head strong");
    const lyricLabel = liveDemo.querySelector("[data-live-lyric]");
    const compactLyric = liveDemo.querySelector("[data-live-compact-lyric]");
    const compactEqualizer = liveDemo.querySelector("[data-live-compact-eq]");
    const peekProgress = liveDemo.querySelector("[data-live-peek-progress]");
    const peekPlay = liveDemo.querySelector("[data-live-peek-play]");
    const peekTitle = liveDemo.querySelector(".live-peek-copy strong");
    const peekLyric = liveDemo.querySelector("[data-live-peek-lyric]");

    const renderPlayback = () => {
      const progressValue = Math.min(100, elapsed / duration * 100);
      const playGlyph = isPlaying ? "Ⅱ" : "▶";
      if (playButton) {
        playButton.textContent = playGlyph;
        playButton.setAttribute("aria-label", isPlaying ? "暂停" : "播放");
      }
      if (progress) progress.style.width = `${progressValue}%`;
      if (peekProgress) peekProgress.style.width = `${progressValue}%`;
      if (compactEqualizer) compactEqualizer.classList.toggle("is-paused", !isPlaying);
      if (peekPlay) peekPlay.textContent = playGlyph;
      if (elapsedLabel) elapsedLabel.textContent = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;
      if (titleLabel) titleLabel.textContent = tracks[trackIndex].title;
      if (lyricLabel) lyricLabel.textContent = tracks[trackIndex].lyric;
      if (compactLyric) compactLyric.textContent = tracks[trackIndex].lyric;
      if (peekTitle) peekTitle.textContent = tracks[trackIndex].title;
      if (peekLyric) peekLyric.textContent = tracks[trackIndex].lyric;
    };

    if (playButton) {
      playButton.addEventListener("click", () => {
        isPlaying = !isPlaying;
        renderPlayback();
      });
    }

    const changeTrack = (direction) => {
      trackIndex = (trackIndex + direction + tracks.length) % tracks.length;
      elapsed = 0;
      renderPlayback();
    };
    const previousButton = liveDemo.querySelector("[data-live-prev]");
    const nextButton = liveDemo.querySelector("[data-live-next]");
    if (previousButton) previousButton.addEventListener("click", () => changeTrack(-1));
    if (nextButton) nextButton.addEventListener("click", () => changeTrack(1));

    window.setInterval(() => {
      if (!isPlaying) return;
      elapsed = (elapsed + 1) % duration;
      renderPlayback();
    }, 1000);
    renderPlayback();

    const volumeInput = liveDemo.querySelector("[data-live-volume]");
    const volumeLabel = liveDemo.querySelector("[data-live-volume-label]");
    if (volumeInput && volumeLabel) {
      volumeInput.addEventListener("input", () => {
        volumeLabel.textContent = `${volumeInput.value}%`;
      });
    }

    const fileList = liveDemo.querySelector("[data-live-file-list]");
    const dropZone = liveDemo.querySelector("[data-live-dropzone]");
    const addFiles = (files) => {
      if (!fileList || !files || files.length === 0) return;
      Array.from(files).slice(0, 3).forEach((file) => {
        const chip = document.createElement("span");
        chip.textContent = file.name;
        chip.title = file.name;
        fileList.appendChild(chip);
      });
      while (fileList.children.length > 3) fileList.firstElementChild.remove();
    };

    if (dropZone) {
      ["dragenter", "dragover"].forEach((eventName) => {
        dropZone.addEventListener(eventName, (event) => {
          event.preventDefault();
          dropZone.classList.add("is-targeted");
        });
      });
      ["dragleave", "drop"].forEach((eventName) => {
        dropZone.addEventListener(eventName, (event) => {
          event.preventDefault();
          dropZone.classList.remove("is-targeted");
        });
      });
      dropZone.addEventListener("drop", (event) => addFiles(event.dataTransfer.files));
      dropZone.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.addEventListener("change", () => addFiles(input.files));
        input.click();
      });
    }

    const clearClipboard = liveDemo.querySelector("[data-live-clear]");
    const clipboardItems = liveDemo.querySelector("[data-live-clip-items]");
    const clipboardCount = liveDemo.querySelector("[data-live-clip-count]");
    if (clearClipboard && clipboardItems && clipboardCount) {
      clearClipboard.addEventListener("click", () => {
        clipboardItems.replaceChildren();
        clipboardCount.textContent = "0/9";
      });
    }

    const airDrop = liveDemo.querySelector(".live-airdrop");
    if (airDrop) {
      airDrop.addEventListener("click", () => {
        const subtitle = airDrop.querySelector("small");
        if (!subtitle) return;
        subtitle.textContent = "正在查找附近设备…";
        window.setTimeout(() => { subtitle.textContent = "拖放以共享"; }, 1800);
      });
    }

    let calendarMonth = 7;
    const monthTitle = liveDemo.querySelector("[data-live-month-title]");
    const gridDays = liveDemo.querySelector("[data-live-grid-days]");
    const renderCalendar = () => {
      if (!monthTitle || !gridDays) return;
      const year = 2026;
      const firstDay = new Date(year, calendarMonth, 1).getDay();
      const dayCount = new Date(year, calendarMonth + 1, 0).getDate();
      monthTitle.textContent = `${["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"][calendarMonth]} ${year}`;
      gridDays.replaceChildren();
      for (let index = 0; index < 35; index += 1) {
        const button = document.createElement("button");
        button.type = "button";
        const day = index - firstDay + 1;
        if (day < 1 || day > dayCount) {
          button.textContent = "·";
          button.className = "is-muted";
          button.disabled = true;
        } else {
          button.textContent = String(day);
          if (calendarMonth === 7 && day === 5) button.classList.add("is-today", "is-selected");
          button.addEventListener("click", () => {
            gridDays.querySelectorAll("button").forEach((item) => item.classList.remove("is-selected"));
            button.classList.add("is-selected");
          });
        }
        gridDays.appendChild(button);
      }
    };
    const previousMonth = liveDemo.querySelector("[data-live-month-prev]");
    const nextMonth = liveDemo.querySelector("[data-live-month-next]");
    if (previousMonth) previousMonth.addEventListener("click", () => { calendarMonth = (calendarMonth + 11) % 12; renderCalendar(); });
    if (nextMonth) nextMonth.addEventListener("click", () => { calendarMonth = (calendarMonth + 1) % 12; renderCalendar(); });
    renderCalendar();

    setState("compact");
    selectModule("home");

    island.addEventListener("keydown", (event) => {
      if (event.key === "ArrowUp") { event.preventDefault(); moveState(1); }
      if (event.key === "ArrowDown") { event.preventDefault(); moveState(-1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); cycleModule(-1); }
      if (event.key === "ArrowRight") { event.preventDefault(); cycleModule(1); }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && island.dataset.state !== "compact" && !isPinned) setState("compact");
    });
  }

})();
