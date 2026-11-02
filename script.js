(() => {
  "use strict";

  const roles = {
    monitor: { name: "张晨鸽", title: "班长", emoji: "👑" },
    study: { name: "张思雨", title: "学习委员", emoji: "📚" },
    youth: { name: "殷紫怡", title: "团支书", emoji: "🎖️" },
    arts: { name: "张一冰", title: "文艺委员", emoji: "🎨" },
    labor: { name: "李易乐", title: "劳动委员", emoji: "🧹" },
  };

  const screens = {
    intro: document.getElementById("screenIntro"),
    scanning: document.getElementById("screenScanning"),
    identity: document.getElementById("screenIdentity"),
    alert: document.getElementById("screenAlert"),
    final: document.getElementById("screenFinal"),
  };

  const modeByScreen = {
    intro: "intro",
    scanning: "scanning",
    identity: "identity",
    alert: "alert",
    final: "final",
  };

  const themeColorByScreen = {
    intro: "#08090b",
    scanning: "#08090b",
    identity: "#08090b",
    alert: "#08090b",
    final: "#08090b",
  };

  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const roleButtons = [...document.querySelectorAll(".role-card")];
  const startButton = document.getElementById("startButton");
  const selectionStatus = document.getElementById("selectionStatus");
  const soundToggle = document.getElementById("soundToggle");
  const scanScreen = screens.scanning;
  const scanTitle = document.getElementById("scanTitle");
  const scanDetail = document.getElementById("scanDetail");
  const progressTrack = document.getElementById("progressTrack");
  const progressFill = document.getElementById("progressFill");
  const progressLabel = document.getElementById("progressLabel");
  const scanSteps = [...document.querySelectorAll(".scan-step")];
  const targetName = document.getElementById("targetName");
  const targetRole = document.getElementById("targetRole");
  const alertName = document.getElementById("alertName");
  const alertRole = document.getElementById("alertRole");
  const continueButton = document.getElementById("continueButton");
  const identityTimer = document.getElementById("identityTimer");
  const countdownValue = document.getElementById("countdownValue");
  const countdownDots = [...document.querySelectorAll(".countdown-dots i")];
  const alertContent = document.getElementById("alertContent");
  const impactOverlay = document.getElementById("impactOverlay");
  const impactParticles = document.getElementById("impactParticles");
  const restartButton = document.getElementById("restartButton");

  const scanStages = [
    {
      at: 0,
      title: "正在连接数据库",
      detail: "正在建立加密神经链路 …",
    },
    {
      at: 1450,
      title: "正在分析身份",
      detail: "正在读取班级身份特征 …",
    },
    {
      at: 3050,
      title: "正在匹配目标",
      detail: "正在比对 2,077 条虚构记录 …",
    },
    {
      at: 4750,
      title: "正在锁定目标",
      detail: "锁定信号增强，正在校准坐标 …",
    },
    {
      at: 6550,
      title: "身份识别成功",
      detail: "目标匹配完成，正在生成身份档案 …",
    },
  ];

  let selectedRoleId = "";
  let currentScreen = "intro";
  let scanFrame = 0;
  let countdownFrame = 0;
  let identityInterval = 0;
  let soundEnabled = true;
  let audioContext = null;
  let detonationStarted = false;
  let lastCountdownNumber = null;
  let activeTimers = new Set();

  const AudioEngine = {
    ensureContext() {
      if (!soundEnabled) return null;

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;

      if (!audioContext) {
        audioContext = new AudioContextClass();
      }

      if (audioContext.state === "suspended") {
        audioContext.resume().catch(() => {});
      }

      return audioContext;
    },

    tone({
      frequency = 520,
      endFrequency = frequency,
      duration = 0.12,
      volume = 0.025,
      type = "sine",
      delay = 0,
    } = {}) {
      const context = this.ensureContext();
      if (!context) return;

      const startAt = context.currentTime + delay;
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, startAt);
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(30, endFrequency),
        startAt + duration,
      );

      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startAt);
      oscillator.stop(startAt + duration + 0.03);
    },

    click() {
      this.tone({ frequency: 720, endFrequency: 960, duration: 0.07, volume: 0.017 });
    },

    stage(index) {
      const notes = [360, 470, 590, 750, 980];
      this.tone({
        frequency: notes[index] || 640,
        endFrequency: (notes[index] || 640) * 1.18,
        duration: 0.14,
        volume: 0.025,
        type: "triangle",
      });
    },

    verified() {
      [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
        this.tone({
          frequency,
          duration: 0.36,
          volume: 0.026,
          type: "sine",
          delay: index * 0.085,
        });
      });
    },

    alarmTick(seconds) {
      const urgent = seconds <= 3;
      this.tone({
        frequency: urgent ? 920 : 640,
        endFrequency: urgent ? 760 : 560,
        duration: urgent ? 0.16 : 0.09,
        volume: urgent ? 0.036 : 0.023,
        type: "square",
      });

      if (urgent && seconds > 0) {
        this.tone({
          frequency: 720,
          endFrequency: 620,
          duration: 0.11,
          volume: 0.025,
          type: "square",
          delay: 0.18,
        });
      }
    },

    boom() {
      const context = this.ensureContext();
      if (!context) return;

      const duration = 1.35;
      const frameCount = Math.floor(context.sampleRate * duration);
      const buffer = context.createBuffer(1, frameCount, context.sampleRate);
      const data = buffer.getChannelData(0);

      for (let index = 0; index < frameCount; index += 1) {
        const envelope = Math.pow(1 - index / frameCount, 2.15);
        data[index] = (Math.random() * 2 - 1) * envelope;
      }

      const noise = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const noiseGain = context.createGain();

      noise.buffer = buffer;
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(720, context.currentTime);
      filter.frequency.exponentialRampToValueAtTime(95, context.currentTime + duration);
      noiseGain.gain.setValueAtTime(0.2, context.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(context.destination);
      noise.start();

      this.tone({
        frequency: 92,
        endFrequency: 36,
        duration: 0.95,
        volume: 0.11,
        type: "sine",
      });

      this.tone({
        frequency: 170,
        endFrequency: 54,
        duration: 0.52,
        volume: 0.055,
        type: "triangle",
        delay: 0.03,
      });
    },
  };

  function schedule(callback, delay) {
    const timerId = window.setTimeout(() => {
      activeTimers.delete(timerId);
      callback();
    }, delay);

    activeTimers.add(timerId);
    return timerId;
  }

  function cancelScheduledWork() {
    activeTimers.forEach((timerId) => window.clearTimeout(timerId));
    activeTimers.clear();

    if (scanFrame) {
      window.cancelAnimationFrame(scanFrame);
      scanFrame = 0;
    }

    if (countdownFrame) {
      window.cancelAnimationFrame(countdownFrame);
      countdownFrame = 0;
    }

    if (identityInterval) {
      window.clearInterval(identityInterval);
      identityInterval = 0;
    }
  }

  function updateSoundButton() {
    soundToggle.setAttribute("aria-pressed", String(soundEnabled));
    soundToggle.setAttribute("aria-label", soundEnabled ? "关闭音效" : "开启音效");
    soundToggle.title = soundEnabled ? "关闭音效" : "开启音效";
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    updateSoundButton();

    if (soundEnabled) {
      AudioEngine.ensureContext();
      AudioEngine.verified();
    }
  }

  function showScreen(screenName) {
    const nextScreen = screens[screenName];
    if (!nextScreen || currentScreen === screenName) return;

    Object.entries(screens).forEach(([name, screen]) => {
      const isCurrent = name === screenName;
      screen.classList.toggle("is-active", isCurrent);
      screen.hidden = !isCurrent;
      screen.setAttribute("aria-hidden", String(!isCurrent));
    });

    currentScreen = screenName;
    document.body.dataset.mode = modeByScreen[screenName];
    themeColorMeta?.setAttribute("content", themeColorByScreen[screenName]);
    window.scrollTo(0, 0);
  }

  function setSelectedRole(roleId) {
    const role = roles[roleId];
    if (!role) return;

    selectedRoleId = roleId;
    roleButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.role === roleId));
    });

    startButton.disabled = false;
    selectionStatus.textContent = `已选择：${role.emoji} ${role.title} · 授权完成`;
    selectionStatus.classList.add("has-selection");
    AudioEngine.click();
  }

  function resetScanUI() {
    scanScreen.classList.remove("is-verified");
    progressFill.style.width = "0%";
    progressTrack.setAttribute("aria-valuenow", "0");
    progressLabel.textContent = "0%";
    scanTitle.textContent = scanStages[0].title;
    scanDetail.textContent = scanStages[0].detail;

    scanSteps.forEach((step, index) => {
      step.classList.toggle("is-active", index === 0);
      step.classList.remove("is-done");
    });
  }

  function updateScanStage(stageIndex) {
    const stage = scanStages[stageIndex];
    if (!stage) return;

    scanTitle.textContent = stage.title;
    scanDetail.textContent = stage.detail;

    scanSteps.forEach((step, index) => {
      step.classList.toggle("is-active", index === stageIndex);
      step.classList.toggle("is-done", index < stageIndex);
    });

    AudioEngine.stage(stageIndex);
  }

  function startScan() {
    if (!selectedRoleId) return;

    cancelScheduledWork();
    resetScanUI();
    showScreen("scanning");
    AudioEngine.verified();

    const startAt = performance.now();
    const totalDuration = 8000;
    let activeStage = 0;
    let lastProgress = -1;

    const updateProgress = (now) => {
      const elapsed = Math.min(totalDuration, now - startAt);
      const progress = Math.min(99, Math.round((elapsed / totalDuration) * 100));

      if (progress !== lastProgress) {
        lastProgress = progress;
        progressFill.style.width = `${progress}%`;
        progressLabel.textContent = `${progress}%`;
        progressTrack.setAttribute("aria-valuenow", String(progress));
      }

      while (
        activeStage + 1 < scanStages.length &&
        elapsed >= scanStages[activeStage + 1].at
      ) {
        activeStage += 1;
        updateScanStage(activeStage);
      }

      if (activeStage === scanStages.length - 1) {
        scanScreen.classList.add("is-verified");
      }

      if (elapsed < totalDuration) {
        scanFrame = window.requestAnimationFrame(updateProgress);
      }
    };

    scanFrame = window.requestAnimationFrame(updateProgress);

    schedule(() => {
      progressFill.style.width = "100%";
      progressLabel.textContent = "100%";
      progressTrack.setAttribute("aria-valuenow", "100");
      scanScreen.classList.add("is-verified");
      updateScanStage(scanStages.length - 1);
    }, totalDuration - 110);

    schedule(showIdentity, totalDuration + 80);
  }

  function showIdentity() {
    const role = roles[selectedRoleId];
    if (!role) return;

    cancelScheduledWork();
    targetName.textContent = role.name;
    targetRole.textContent = role.title;
    alertName.textContent = role.name;
    alertRole.textContent = role.title;
    showScreen("identity");
    AudioEngine.verified();

    let secondsLeft = 4;
    identityTimer.textContent = String(secondsLeft).padStart(2, "0");

    identityInterval = window.setInterval(() => {
      secondsLeft -= 1;
      identityTimer.textContent = String(Math.max(0, secondsLeft)).padStart(2, "0");

      if (secondsLeft <= 0) {
        window.clearInterval(identityInterval);
        identityInterval = 0;
      }
    }, 1000);

    schedule(startAlert, 4100);
  }

  function startAlert() {
    if (!selectedRoleId) return;

    cancelScheduledWork();
    showScreen("alert");
    detonationStarted = false;
    lastCountdownNumber = null;
    alertContent.style.opacity = "";
    alertContent.style.transform = "";
    document.body.classList.remove("has-impact");
    screens.alert.classList.remove("is-shaking");
    impactOverlay.classList.remove("is-active");
    impactOverlay.setAttribute("aria-hidden", "true");
    AudioEngine.alarmTick(10);

    const deadline = performance.now() + 10000;
    let lastDotCount = -1;

    updateCountdownDots(0);

    const updateCountdown = (now) => {
      if (detonationStarted) return;

      const remainingMs = Math.max(0, deadline - now);
      const seconds = Math.ceil(remainingMs / 1000);

      if (seconds !== lastCountdownNumber) {
        lastCountdownNumber = seconds;
        countdownValue.textContent = String(seconds);
        countdownValue.classList.remove("is-ticking");
        void countdownValue.offsetWidth;
        countdownValue.classList.add("is-ticking");

        const dotCount = Math.min(8, Math.round(((10 - seconds) / 10) * 8));
        if (dotCount !== lastDotCount) {
          lastDotCount = dotCount;
          updateCountdownDots(dotCount);
        }

        if (seconds > 0 && seconds < 10) {
          AudioEngine.alarmTick(seconds);
        }
      }

      if (remainingMs <= 0) {
        detonate();
        return;
      }

      countdownFrame = window.requestAnimationFrame(updateCountdown);
    };

    countdownFrame = window.requestAnimationFrame(updateCountdown);
  }

  function updateCountdownDots(activeCount) {
    countdownDots.forEach((dot, index) => {
      dot.classList.toggle("is-on", index < activeCount);
    });
  }

  function detonate() {
    if (detonationStarted) return;
    detonationStarted = true;

    if (countdownFrame) {
      window.cancelAnimationFrame(countdownFrame);
      countdownFrame = 0;
    }

    countdownValue.textContent = "0";
    updateCountdownDots(8);
    screens.alert.classList.add("is-shaking");
    document.body.classList.add("has-impact");
    impactOverlay.classList.add("is-active");
    impactOverlay.setAttribute("aria-hidden", "false");

    AudioEngine.boom();
    schedule(showFinal, 2650);
  }

  function showFinal() {
    cancelScheduledWork();
    screens.alert.classList.remove("is-shaking");
    document.body.classList.remove("has-impact");
    impactOverlay.classList.remove("is-active");
    impactOverlay.setAttribute("aria-hidden", "true");
    showScreen("final");
    AudioEngine.verified();
  }

  function buildImpactParticles() {
    const colors = ["#ffffff", "#cfd3da", "#777c84"];
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < 24; index += 1) {
      const particle = document.createElement("i");
      const angle = (360 / 24) * index + (Math.random() * 14 - 7);
      const distance = 115 + Math.random() * 190;
      const size = 3 + Math.random() * 7;

      particle.className = "impact-particle";
      particle.style.setProperty("--angle", `${angle}deg`);
      particle.style.setProperty("--distance", `${distance}px`);
      particle.style.setProperty("--size", `${size}px`);
      particle.style.setProperty("--color", colors[index % colors.length]);
      particle.style.setProperty("--duration", `${0.7 + Math.random() * 0.7}s`);
      particle.style.setProperty("--delay", `${Math.random() * 0.12}s`);
      fragment.appendChild(particle);
    }

    impactParticles.appendChild(fragment);
  }

  function resetExperience() {
    cancelScheduledWork();
    AudioEngine.click();

    selectedRoleId = "";
    detonationStarted = false;
    lastCountdownNumber = null;
    startButton.disabled = true;
    selectionStatus.textContent = "等待职务授权";
    selectionStatus.classList.remove("has-selection");

    roleButtons.forEach((button) => {
      button.setAttribute("aria-pressed", "false");
    });

    targetName.textContent = "—";
    targetRole.textContent = "—";
    alertName.textContent = "—";
    alertRole.textContent = "—";
    identityTimer.textContent = "04";
    countdownValue.textContent = "10";
    updateCountdownDots(0);
    resetScanUI();

    screens.alert.classList.remove("is-shaking");
    document.body.classList.remove("has-impact");
    impactOverlay.classList.remove("is-active");
    impactOverlay.setAttribute("aria-hidden", "true");

    showScreen("intro");
    schedule(() => startButton.focus({ preventScroll: true }), 450);
  }

  roleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setSelectedRole(button.dataset.role);
    });
  });

  startButton.addEventListener("click", startScan);
  soundToggle.addEventListener("click", toggleSound);
  continueButton.addEventListener("click", startAlert);
  restartButton.addEventListener("click", resetExperience);

  document.querySelector(".wordmark").addEventListener("click", (event) => {
    event.preventDefault();
    if (currentScreen !== "intro") {
      resetExperience();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && soundEnabled && audioContext?.state === "suspended") {
      audioContext.resume().catch(() => {});
    }
  });

  buildImpactParticles();
  updateSoundButton();
})();
