(function () {
  "use strict";

  // ---------- Cost bases (seconds) ----------
  // "Every second of 3 years": 3 years, continuous, accounting for leap years (365.25 days/yr).
  var SECONDS_CONTINUOUS = 3 * 365.25 * 24 * 60 * 60; // 94,672,800
  // "Only waking hours (16h/day)": same 3-year span, but only 16 waking hours count per day.
  var SECONDS_WAKING = 3 * 365.25 * 16 * 60 * 60;
  // "Awake, school year only": ~39-week academic year, 16 waking hours/day, over 3 years.
  var SECONDS_SCHOOLYEAR = 3 * (39 * 7) * 16 * 60 * 60;

  var BASES = {
    continuous: SECONDS_CONTINUOUS,
    waking: SECONDS_WAKING,
    schoolyear: SECONDS_SCHOOLYEAR
  };

  var DEFAULT_COA = 338886;

  var MILESTONES = [
    { threshold: 6, text: "That's a large oat latte, gone." },
    { threshold: 85, text: "You've now burned a casebook." },
    { threshold: 300, text: "That's a bar-prep lecture, up in smoke." },
    { threshold: 1200, text: "A month of New Haven rent, evaporated." },
    { threshold: 5000, text: "You could've bought a decent used car." },
    { threshold: 20000, text: "That's a year of a 1L's take-home pay, gone in a break." }
  ];

  // ---------- Elements ----------
  var amountEl = document.getElementById("amount");
  var elapsedEl = document.getElementById("elapsed");
  var rateLineEl = document.getElementById("rateLine");
  var milestoneEl = document.getElementById("milestone");
  var coaInput = document.getElementById("coaInput");
  var basisSelect = document.getElementById("basisSelect");
  var startBtn = document.getElementById("startBtn");
  var pauseBtn = document.getElementById("pauseBtn");
  var resetBtn = document.getElementById("resetBtn");

  // ---------- State ----------
  var coaValue = DEFAULT_COA;
  var programSeconds = BASES.continuous;
  var running = false;
  var startEpoch = null;
  var accumulatedMs = 0;
  var rafId = null;
  var currentMilestoneIndex = -1;

  function ratePerSecond() {
    return coaValue / programSeconds;
  }

  function formatMoney(n, decimals) {
    var parts = n.toFixed(decimals).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return "$" + parts.join(".");
  }

  function formatElapsed(ms) {
    var totalCs = Math.floor(ms / 10);
    var cs = totalCs % 100;
    var totalSeconds = Math.floor(totalCs / 100);
    var seconds = totalSeconds % 60;
    var minutes = Math.floor(totalSeconds / 60);
    function pad(n) {
      return n < 10 ? "0" + n : "" + n;
    }
    return pad(minutes) + ":" + pad(seconds) + "." + pad(cs);
  }

  function updateRateLine() {
    var perHour = ratePerSecond() * 3600;
    rateLineEl.innerHTML =
      "You're incinerating <strong>" + formatMoney(perHour, 2) + "/hour</strong> of tuition.";
  }

  function updateMilestone(cost) {
    var idx = -1;
    for (var i = 0; i < MILESTONES.length; i++) {
      if (cost >= MILESTONES[i].threshold) {
        idx = i;
      }
    }
    if (idx !== currentMilestoneIndex) {
      currentMilestoneIndex = idx;
      milestoneEl.textContent = idx >= 0 ? MILESTONES[idx].text : "";
    }
  }

  function currentElapsedMs() {
    return running ? Date.now() - startEpoch : accumulatedMs;
  }

  function render() {
    var elapsedMs = currentElapsedMs();
    var cost = (elapsedMs / 1000) * ratePerSecond();
    amountEl.textContent = formatMoney(cost, 4);
    elapsedEl.textContent = formatElapsed(elapsedMs);
    updateMilestone(cost);
  }

  function loop() {
    render();
    if (running) {
      rafId = requestAnimationFrame(loop);
    }
  }

  function updateButtonStates() {
    startBtn.disabled = running;
    pauseBtn.disabled = !running;
    resetBtn.disabled = !running && accumulatedMs === 0;
  }

  // ---------- Controls ----------
  startBtn.addEventListener("click", function () {
    if (running) return;
    startEpoch = Date.now() - accumulatedMs;
    running = true;
    updateButtonStates();
    loop();
  });

  pauseBtn.addEventListener("click", function () {
    if (!running) return;
    accumulatedMs = Date.now() - startEpoch;
    running = false;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    updateButtonStates();
    render();
  });

  resetBtn.addEventListener("click", function () {
    running = false;
    startEpoch = null;
    accumulatedMs = 0;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    updateButtonStates();
    render();
  });

  // ---------- COA input ----------
  function setCoaFromRaw(raw) {
    var cleaned = raw.replace(/[^0-9.]/g, "");
    var firstDot = cleaned.indexOf(".");
    if (firstDot !== -1) {
      cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
    }
    var value = parseFloat(cleaned);
    coaValue = isNaN(value) ? 0 : value;
    updateRateLine();
    render();
  }

  coaInput.addEventListener("input", function () {
    setCoaFromRaw(coaInput.value);
  });

  coaInput.addEventListener("blur", function () {
    coaInput.value = formatMoney(coaValue, 0);
  });

  coaInput.addEventListener("focus", function () {
    coaInput.value = coaValue ? String(coaValue) : "";
    coaInput.select();
  });

  // ---------- Cost basis ----------
  basisSelect.addEventListener("change", function () {
    programSeconds = BASES[basisSelect.value] || BASES.continuous;
    updateRateLine();
    render();
  });

  // ---------- Init ----------
  coaInput.value = formatMoney(coaValue, 0);
  updateRateLine();
  updateButtonStates();
  render();
})();
