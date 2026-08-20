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

  // Densely packed under ~$15 so a bunch of these surface within the first
  // 30 minutes at the default COA, regardless of which cost basis is picked
  // (continuous ≈ $6.44, waking ≈ $9.66, school-year ≈ $12.93 by minute 30).
  // Thresholds continue upward, more sparsely, for longer or higher-COA runs.
  var MILESTONES = [
    { threshold: 0.05, options: [
      "a single jellybean from a mall vending machine",
      "one Chiclet, sold individually",
      "a waived library late fee",
      "a single staple from a novelty stapler museum"
    ] },
    { threshold: 0.15, options: [
      "a pay-phone call, back when those existed",
      "a gumball from a dented machine",
      "a mystery sticker from a vending machine",
      "one Chuck E. Cheese skee-ball token"
    ] },
    { threshold: 0.30, options: [
      "a single spin of a shopping-mall fortune wheel",
      "the quarter left in a decommissioned parking meter",
      "a Bazooka Joe comic tucked inside gum",
      "a toll on a very short bridge"
    ] },
    { threshold: 0.50, options: [
      "a gumball from a hospital gift-shop machine",
      "a single scratch-off lottery ticket, losing",
      "a five-minute slot on a parking meter",
      "two rubber bouncy balls from a quarter machine"
    ] },
    { threshold: 0.75, options: [
      "a subway fare from several decades ago",
      "a plastic ring from a gumball machine",
      "a coin tossed into a wishing well, never refunded",
      "a jawbreaker the size of a golf ball"
    ] },
    { threshold: 1.00, options: [
      "a Zoltar fortune-telling machine reading",
      "a scratch-and-sniff sticker sheet",
      "a mini bag of airplane pretzels",
      "one attempt at a carnival 'guess your weight' booth"
    ] },
    { threshold: 1.50, options: [
      "a bite-sized sample of a Renaissance Faire turkey leg",
      "a grip-strength test at an arcade",
      "a temporary boardwalk tattoo",
      "a fresh-squeezed orange juice from a mall kiosk"
    ] },
    { threshold: 2.00, options: [
      "one hand-cranked pencil sharpening at a novelty museum",
      "a caricature artist's five-minute rough sketch",
      "a ticket to pet an alpaca at a petting zoo",
      "a fortune cookie, purchased individually"
    ] },
    { threshold: 2.75, options: [
      "one carnival ring-toss attempt",
      "an off-brand novelty foam finger",
      "a temporary hair-chalk streak at a county fair",
      "a single go on a coin-operated horse ride"
    ] },
    { threshold: 3.50, options: [
      "a single novelty rubber duck",
      "a can of discontinued Sriracha rooster sauce",
      "a mystery Beanie Baby at a flea market",
      "a mini disco ball, desk-sized"
    ] },
    { threshold: 4.50, options: [
      "an astronaut ice cream pouch",
      "a taxidermied jackalope postcard",
      "a single hand-blown artisanal ice cube",
      "a genuine subway token from 1970s New York"
    ] },
    { threshold: 5.50, options: [
      "a haunted Ouija board, provenance papers not included",
      "an artisanal popsicle, gourmet flavor",
      "a mini bottle of luxury hotel shampoo",
      "a spectator pass to a competitive cheese-rolling race"
    ] },
    { threshold: 6.75, options: [
      "a sample-sized cup of civet-poop coffee",
      "a mystery grab-bag from a comic shop",
      "a single ride on a mall carousel",
      "a crystal-ball keychain from a boardwalk psychic"
    ] },
    { threshold: 8.00, options: [
      "a bespoke novelty bow tie",
      "a vintage postcard from a roadside attraction",
      "a single round at a competitive whistling open mic",
      "a palm reading at a boardwalk stand"
    ] },
    { threshold: 9.50, options: [
      "an hour of parking validation at a fancy hotel",
      "a snow globe from an airport gift shop",
      "a mood ring, guaranteed inaccurate",
      "a timed-entry ticket to an 'Instagram museum'"
    ] },
    { threshold: 11.00, options: [
      "an artisanal cocktail ice sphere",
      "a drop-in competitive yodeling lesson",
      "a squeaky novelty rubber chicken",
      "a roll of vintage arcade tokens"
    ] },
    { threshold: 13.00, options: [
      "an entry-level bespoke monocle",
      "a single game of skee-ball, unlimited replays excluded",
      "an oversized souvenir pencil",
      "a fortune-teller's full tarot reading"
    ] },
    { threshold: 18, options: [
      "a well-loved first-edition Garfield comic",
      "an hour with a professional cuddler",
      "a Ouija board with actual 'provenance papers'",
      "a competitive cheese-rolling entry fee"
    ] },
    { threshold: 25, options: [
      "a miniature hand-carved cuckoo clock",
      "a decommissioned parking meter, unbolted and shipped",
      "a tiny fragment of a real meteorite",
      "a certified splinter of the Berlin Wall"
    ] },
    { threshold: 35, options: [
      "a rehair for a concert cellist's bow",
      "a heat-entry fee for a competitive eating contest",
      "a single session observing a hostage negotiator at work",
      "an artisan-grade bespoke monocle"
    ] },
    { threshold: 50, options: [
      "a student-grade Stradivarius-style bow rehair",
      "a small vintage neon 'OPEN' sign",
      "a lifetime supply of astronaut ice cream",
      "an emotional-support goldfish's plane ticket"
    ] },
    { threshold: 75, options: [
      "a three-session competitive yodeling lesson package",
      "a full-size taxidermied jackalope",
      "a Fabergé egg keychain replica",
      "a single training session for a bomb-sniffing dog"
    ] },
    { threshold: 110, options: [
      "a trial membership to a discreet whisky society",
      "a small vintage neon sign restoration",
      "a palm-sized certified chunk of the Berlin Wall",
      "an emotional-support peacock's short-haul plane ticket"
    ] },
    { threshold: 160, options: [
      "a Fabergé egg replica, the good fake",
      "a bomb-sniffing dog's single continuing-education course",
      "a full-size hand-carved cuckoo clock",
      "a qualifier entry to a competitive eating championship"
    ] },
    { threshold: 230, options: [
      "a lifetime membership to a discreet whisky society",
      "a full vintage neon sign restoration",
      "a professional-grade Stradivarius bow rehair",
      "a palm-sized certified meteorite fragment"
    ] },
    { threshold: 330, options: [
      "a matched set of three decommissioned parking meters",
      "a private tasting at a discreet whisky society",
      "a final-round seat at a competitive eating championship",
      "an emotional-support peacock's business-class long-haul ticket"
    ] },
    { threshold: 480, options: [
      "a bomb-sniffing dog's full certification course",
      "a competitive eating championship's runner-up purse",
      "a vintage jukebox in need of restoration",
      "a museum-quality Fabergé egg replica"
    ] },
    { threshold: 700, options: [
      "a museum-sized certified chunk of the Berlin Wall",
      "a gold-plated novelty decommissioned parking meter",
      "a corporate retreat's hostage-negotiator guest appearance",
      "a professionally restored and shipped vintage neon sign"
    ] },
    { threshold: 1000, options: [
      "a replacement tire for a well-used Zamboni",
      "a private tasting menu for a discreet whisky society gala",
      "a collector's-edition decommissioned fire hydrant",
      "a raffle entry for a seat from a decommissioned Concorde"
    ] },
    { threshold: 1500, options: [
      "a private island day-trip, no overnight",
      "a fully operational used Zamboni",
      "a mascot costume for a minor-league baseball team",
      "a decommissioned fire truck missing a few parts"
    ] },
    { threshold: 2200, options: [
      "a decommissioned school bus, still yellow",
      "a retired NYC taxi medallion, decorative only",
      "a vintage subway car retired from service",
      "a small fixer-upper sailboat, leaks not included"
    ] },
    { threshold: 3200, options: [
      "a fractional stake in a minor-league baseball team",
      "a small fixer-upper yacht, leaks not included",
      "a fully restored decommissioned fire truck",
      "a fractional-ownership seat from a decommissioned Concorde"
    ] },
    { threshold: 5000, options: [
      "a private island rental for a long weekend",
      "a competitive eating championship's grand prize purse",
      "the real kind of retired NYC taxi medallion",
      "a decommissioned subway car, delivered to your backyard"
    ] },
    { threshold: 8000, options: [
      "a seaworthy(ish) small yacht",
      "a majority share in a minor-league baseball team",
      "a private island rental, a full week",
      "a decommissioned amusement-park carousel, missing two horses"
    ] },
    { threshold: 15000, options: [
      "a private island rental, an entire summer",
      "a fractional-ownership stake in a decommissioned Concorde jet",
      "a fixer-upper private island, outright",
      "a minor-league baseball team's naming rights, one season"
    ] }
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
      "That's <strong>" + formatMoney(perHour, 2) + "/hour</strong> of tuition.";
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
      if (idx >= 0) {
        var options = MILESTONES[idx].options;
        var pick = options[Math.floor(Math.random() * options.length)];
        milestoneEl.textContent = "That's the cost of " + pick + ".";
      } else {
        milestoneEl.textContent = "";
      }
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
