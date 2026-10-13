"use strict";

/* =========================================================
   A DATE TO REMEMBER — SHRADDHA'S BIRTHDAY EXPERIENCE
   Lightweight, one-screen scenes with reliable navigation.
   Music file: assets/preet-re.mp3
========================================================= */

const CONFIG = {
  birthday: { year: 2026, month: 9, day: 14, name: "Shraddha" },
  startTime: { hour: 23, minute: 59, second: 50 },
  simulatedSecondMs: 700,
  starCount: 58
};

const PHASES = [
  { id: "waiting", durationMs: 2300, eyebrow: "THE NIGHT BEFORE YOUR DAY", title: "October has a little magic.", description: "And one particular date deserves all the attention. 💗", status: "Something special is getting closer…" },
  { id: "almost", durationMs: 2300, eyebrow: "JUST A LITTLE LONGER", title: "Some moments are worth waiting for.", description: "And this one is almost here… ✨", status: "Every second brings us closer…" },
  { id: "secret", durationMs: 2300, eyebrow: "A LITTLE SECRET", title: "Keep this moment close.", description: "In just a little while, the date will tell its own story. ♡", status: "A little more magic is on its way…" },
  { id: "midnight", durationMs: 1500, eyebrow: "THE MOMENT HAS ARRIVED", title: "And just like that… it's your day.", description: "A new date. A new little reason to smile. ✨", status: "Midnight has arrived!" },
  { id: "reveal", durationMs: 4800, eyebrow: "A DATE TO REMEMBER", title: "October has a little magic.", description: "Some dates feel a little more special. Today, the spotlight belongs to you. 💗✨", status: "Today is all about you. ♡" },
  { id: "welcome", durationMs: 0 }
];

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const el = {
  starField: $("#starField"),
  countdown: $("#countdownPhase"),
  message: $("#messagePhase"),
  messageEyebrow: $("#messageEyebrow"),
  messageTitle: $("#messageTitle"),
  messageDescription: $("#messageDescription"),
  clockStatus: $("#clockStatus"),
  digitalTime: $("#digitalTime"),
  digitalDate: $("#digitalDate"),
  ticks: $("#clockTicks"),
  numbers: $("#clockNumbers"),
  hourHand: $("#hourHand"),
  minuteHand: $("#minuteHand"),
  calendarDays: $("#calendarDays"),
  calendarNote: $("#calendarNote"),
  dateReveal: $("#dateReveal"),
  revealNumber: $("#revealNumber"),
  welcome: $("#welcomePhase"),
  replay: $("#replayButton"),
  surprise: $("#surpriseButton"),
  topIntro: $(".top-intro")
};

let phaseTimer = null;
let clockTimer = null;
let sceneTimer = null;
let runToken = 0;
let simulatedSeconds = 0;
let birthdayRevealed = false;

/* ------------------------ ambient background ------------------------ */
function createStars() {
  if (!el.starField) return;
  el.starField.replaceChildren();
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < CONFIG.starCount; i++) {
    const star = document.createElement("span");
    star.className = "star";
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.setProperty("--duration", `${3.2 + Math.random() * 4.5}s`);
    star.style.setProperty("--delay", `${Math.random() * -6}s`);
    fragment.appendChild(star);
  }
  el.starField.appendChild(fragment);
}

function createParticles() {
  const container = $("#particles");
  if (!container || container.children.length) return;
  const count = 14;
  for (let i = 0; i < count; i++) {
    const particle = document.createElement("span");
    particle.className = "particle";
    const size = 2 + Math.random() * 4;
    particle.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;top:${Math.random()*100}%;animation:float ${6+Math.random()*8}s ease-in-out ${Math.random()*-5}s infinite;`;
    container.appendChild(particle);
  }
}

/* ---------------------------- clock -------------------------------- */
function createClockFace() {
  const svgNS = "http://www.w3.org/2000/svg";
  if (!el.ticks || !el.numbers) return;
  el.ticks.replaceChildren();
  el.numbers.replaceChildren();
  for (let i = 0; i < 60; i++) {
    const angle = (i * 6 * Math.PI) / 180;
    const major = i % 5 === 0;
    const inner = major ? 126 : 133;
    const tick = document.createElementNS(svgNS, "line");
    tick.setAttribute("x1", 160 + inner * Math.sin(angle));
    tick.setAttribute("y1", 160 - inner * Math.cos(angle));
    tick.setAttribute("x2", 160 + 141 * Math.sin(angle));
    tick.setAttribute("y2", 160 - 141 * Math.cos(angle));
    tick.setAttribute("class", major ? "clock-tick major" : "clock-tick");
    el.ticks.appendChild(tick);
  }
  for (let n = 1; n <= 12; n++) {
    const angle = (n * 30 * Math.PI) / 180;
    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", 160 + 105 * Math.sin(angle));
    text.setAttribute("y", 160 - 105 * Math.cos(angle));
    text.setAttribute("class", "clock-number");
    text.textContent = String(n);
    el.numbers.appendChild(text);
  }
}

function pad(n) { return String(n).padStart(2, "0"); }
function getSimulatedTime() {
  const t = CONFIG.startTime.hour * 3600 + CONFIG.startTime.minute * 60 + CONFIG.startTime.second + simulatedSeconds;
  const seconds = ((t % 86400) + 86400) % 86400;
  return { hour: Math.floor(seconds / 3600), minute: Math.floor((seconds % 3600) / 60), second: seconds % 60 };
}
function renderClock() {
  if (!el.digitalTime || !el.hourHand || !el.minuteHand) return;
  const t = getSimulatedTime();
  const h12 = t.hour % 12 || 12;
  const hAngle = (h12 + t.minute / 60 + t.second / 3600) * 30;
  const mAngle = (t.minute + t.second / 60) * 6;
  el.hourHand.setAttribute("transform", `rotate(${hAngle} 160 160)`);
  el.minuteHand.setAttribute("transform", `rotate(${mAngle} 160 160)`);
  el.digitalTime.textContent = `${pad(h12)}:${pad(t.minute)}:${pad(t.second)} ${t.hour >= 12 ? "PM" : "AM"}`;
  const shownDate = birthdayRevealed ? CONFIG.birthday.day : 13;
  el.digitalDate.textContent = new Date(CONFIG.birthday.year, CONFIG.birthday.month, shownDate)
    .toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).toUpperCase();
}
function stopClock() { if (clockTimer !== null) { clearInterval(clockTimer); clockTimer = null; } }
function startClock() {
  stopClock();
  simulatedSeconds = 0;
  renderClock();
  clockTimer = setInterval(() => {
    simulatedSeconds += 1;
    renderClock();
    if (simulatedSeconds >= 10 && !birthdayRevealed) {
      birthdayRevealed = true;
      updateCalendar();
      renderClock();
    }
  }, CONFIG.simulatedSecondMs);
}
function updateCalendar() {
  if (!el.calendarDays) return;
  const { year, month, day } = CONFIG.birthday;
  const first = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  el.calendarDays.replaceChildren();
  for (let i = 0; i < first; i++) {
    const blank = document.createElement("span");
    blank.className = "calendar-day empty";
    blank.setAttribute("aria-hidden", "true");
    el.calendarDays.appendChild(blank);
  }
  for (let n = 1; n <= total; n++) {
    const cell = document.createElement("span");
    cell.className = "calendar-day";
    cell.textContent = String(n);
    if (!birthdayRevealed && n === 13) cell.classList.add("is-today");
    if (birthdayRevealed && n === day) {
      cell.classList.add("is-birthday");
      cell.setAttribute("aria-label", "Birthday date, October 14");
    }
    el.calendarDays.appendChild(cell);
  }
  if (el.calendarNote) {
    el.calendarNote.innerHTML = birthdayRevealed
      ? '<span class="note-heart">♡</span><span>Today, the spotlight belongs to you.</span>'
      : '<span class="note-heart">♡</span><span>One particular date has a little magic.</span>';
  }
  el.dateReveal?.classList.toggle("is-visible", birthdayRevealed);
  if (el.revealNumber) el.revealNumber.textContent = String(day);
}

/* ------------------------ phase sequence ---------------------------- */
function showWelcome() {
  stopClock();
  el.countdown.hidden = true;
  el.message.hidden = true;
  el.welcome.hidden = false;
}
function renderPhase(phase) {
  if (!phase || !el.message) return;
  el.message.classList.add("is-changing");
  window.setTimeout(() => {
    el.messageEyebrow.textContent = phase.eyebrow || "";
    el.messageTitle.textContent = phase.title || "";
    el.messageDescription.textContent = phase.description || "";
    el.clockStatus.textContent = phase.status || "";
    el.message.classList.remove("is-changing");
  }, 130);
  if (phase.id === "midnight" || phase.id === "reveal") {
    birthdayRevealed = true;
    updateCalendar();
    renderClock();
  }
  if (phase.id === "welcome") showWelcome();
}
function runPhase(index, token) {
  if (token !== runToken || index >= PHASES.length) return;
  const phase = PHASES[index];
  renderPhase(phase);
  if (phaseTimer !== null) clearTimeout(phaseTimer);
  phaseTimer = null;
  if (phase.durationMs > 0) phaseTimer = setTimeout(() => runPhase(index + 1, token), phase.durationMs);
}
function startExperience() {
  runToken++;
  if (phaseTimer !== null) clearTimeout(phaseTimer);
  phaseTimer = null;
  stopClock();
  simulatedSeconds = 0;
  birthdayRevealed = false;
  el.countdown.hidden = false;
  el.message.hidden = false;
  el.welcome.hidden = true;
  if (el.topIntro) el.topIntro.hidden = false;
  el.replay.hidden = false;
  el.dateReveal?.classList.remove("is-visible");
  createClockFace();
  updateCalendar();
  startClock();
  runPhase(0, runToken);
}

/* ------------------------- journey assets --------------------------- */
const PHOTO = {
  // Birthday-themed generated art is intentionally different on these two screens.
  journey: "assets/photos/pink-birthday-poster.webp",
  celebration: "assets/photos/lavender-birthday.webp",
  gallery: [
    "assets/photos/shraddha-mauve-selfie.webp",
    "assets/photos/shraddha-purple-saree.webp",
    "assets/photos/scrapbook-birthday.webp",
    "assets/photos/shraddha-blue-saree-pose.webp",
    "assets/photos/shraddha-red-outfit.webp",
    "assets/photos/shraddha-blue-saree-seated.webp",
    "assets/photos/bw-collage.webp",
    "assets/photos/shraddha-blue-saree-smile.webp",
    "assets/photos/shraddha-teal-saree.webp",
    "assets/photos/shraddha-blue-saree-selfie.webp",
    "assets/photos/elegant-collage.webp",
    "assets/photos/pink-birthday-poster.webp",
    "assets/photos/lavender-birthday.webp"
  ]
};

const gifts = [
  {
    key: "bouquet", title: "A little bouquet",
    art: `<div class="gift-art bouquet-art" aria-label="A bouquet of red roses"><div class="bouquet-wrap"></div><span class="rose rose-a">🌹</span><span class="rose rose-b">🌹</span><span class="rose rose-c">🌹</span><span class="rose rose-d">🌹</span><span class="rose rose-e">🌹</span><span class="bouquet-leaf leaf-a">🌿</span><span class="bouquet-leaf leaf-b">🌿</span></div>`,
    text: "Phool toh bhej nahi sakta, isliye virtual hi sahi… sambhaal ke rakhna, madam! 🌹😂",
    extra: "Aur haan, bouquet ko paani dene ki zaroorat nahi. Smart gift, right? 🤭"
  },
  {
    key: "chocolate", title: "Something sweet",
    art: `<div class="gift-art chocolate-art" aria-label="A box of assorted chocolates"><div class="choco-box"><span>🍫</span><span>🍬</span><span>🍫</span><span>🍬</span><span>🍫</span><span>🍬</span></div><span class="choco-heart">♡</span></div>`,
    text: "Main toh wahan hoon nahi… isliye chocolates khud hi kha lena. Meri permission hai! 😂🍫",
    extra: "Share karne ka natak mat karna… gift tumhara hai. Bas wrapper dustbin mein! 🤭"
  },
  {
    key: "teddy", title: "A tiny teddy",
    art: `<div class="gift-art teddy-art" aria-label="A cute teddy bear with a heart"><span class="teddy-halo">✦</span><span class="teddy-main">🧸</span><span class="teddy-heart">💗</span><span class="teddy-spark">✧</span></div>`,
    text: "Ye teddy tumhari company ke liye… jab koi pareshan kare, ise pakad ke baith jaana. 😂🧸",
    extra: "Please, ise bhi apni tarah attitude mat sikha dena. Ek madam kaafi hain! 🤣"
  }
];

const journey = {
  root: null,
  audio: null,
  currentScene: null,
  history: [],
  currentGift: 0,
  letterOpened: false,
  audioReady: false,
  musicMuted: false
};

function ensureJourney() {
  if (journey.root) return;
  journey.root = document.createElement("section");
  journey.root.id = "birthdayJourney";
  journey.root.className = "birthday-journey";
  journey.root.hidden = true;
  journey.root.setAttribute("aria-label", "Shraddha's birthday journey");
  document.body.appendChild(journey.root);

  journey.audio = document.createElement("audio");
  journey.audio.id = "birthdaySong";
  journey.audio.src = "assets/preet-re.mp3";
  journey.audio.loop = true;
  journey.audio.preload = "metadata";
  journey.audio.volume = 0.68;
  journey.audio.addEventListener("play", updateMusicButton);
  journey.audio.addEventListener("pause", updateMusicButton);
  journey.audio.addEventListener("error", () => {
    journey.audioReady = false;
    updateMusicButton();
    const msg = $("#sceneToast", journey.root);
    if (msg && !journey.audio.paused) msg.textContent = "Add your song at assets/preet-re.mp3 to hear Preet Re. ♡";
  });

  journey.root.addEventListener("click", handleJourneyClick);
}

function controlsMarkup() {
  return `<button type="button" class="scene-back" data-action="back" aria-label="Go back to the previous scene" title="Previous scene"><span aria-hidden="true">←</span><span class="back-label">Back</span></button>
  <button type="button" class="scene-music" data-action="music" aria-label="Play birthday music" title="Play / pause music"><span class="music-symbol" aria-hidden="true">♫</span><span class="music-state">Music</span></button>
  <div class="scene-toast" id="sceneToast" role="status" aria-live="polite"></div>`;
}

function showScene(sceneId, markup, options = {}) {
  ensureJourney();
  if (sceneTimer !== null) { clearTimeout(sceneTimer); sceneTimer = null; }
  const { track = true } = options;
  if (track && journey.currentScene) {
    journey.history.push({ sceneId: journey.currentScene, giftIndex: journey.currentGift, letterOpened: journey.letterOpened });
  }
  journey.currentScene = sceneId;
  journey.root.className = `birthday-journey ${sceneId}`;
  journey.root.innerHTML = controlsMarkup() + markup;
  journey.root.hidden = false;
  el.countdown.hidden = true;
  el.message.hidden = true;
  el.welcome.hidden = true;
  if (el.topIntro) el.topIntro.hidden = true;
  el.replay.hidden = true;
  updateMusicButton();
  // Reset internal scroll at every scene; gallery has its own scrolling area.
  const content = $(".scene-content", journey.root);
  if (content) content.scrollTop = 0;
}

function button(label, action, className = "") {
  return `<button type="button" class="journey-button ${className}" data-action="${action}">${label}</button>`;
}

function cakeMarkup({ flames = true, cuttable = false } = {}) {
  return `<div class="cake-illustration ${flames ? "has-flames" : "flames-out"} ${cuttable ? "cake-is-cuttable" : ""}" role="img" aria-label="Three-tier pink and lavender princess birthday cake">
    <div class="cake-candles" aria-hidden="true"><span class="candle"><i></i></span><span class="candle"><i></i></span><span class="candle"><i></i></span><span class="candle"><i></i></span><span class="candle"><i></i></span></div>
    <div class="cake-tier tier-top"><span>✦　♡　✦</span><i class="tier-pearl p1"></i><i class="tier-pearl p2"></i></div>
    <div class="cake-tier tier-middle"><span>Happy Birthday</span><div class="tier-garland">✿　✧　✿</div></div>
    <div class="cake-tier tier-bottom"><span>Princess Shraddha</span><div class="tier-garland">♡　✿　♡　✿　♡</div></div>
    <div class="cake-plate"><span>✧</span><span>♡</span><span>✧</span><span>♡</span><span>✧</span></div>
    <div class="cake-smoke" aria-hidden="true">〰　〰　〰</div>
    ${cuttable ? `<div class="cake-slice-piece" aria-hidden="true"><span>♡</span><i></i></div><div class="cake-knife" aria-hidden="true"><span></span></div><div class="cut-flowers" aria-hidden="true"><span>🌸</span><span>🌷</span><span>💐</span><span>🌼</span><span>💗</span><span>✦</span><span>🌺</span><span>✨</span></div>` : ""}
  </div>`;
}

function openJourney() {
  ensureJourney();
  journey.history = [];
  journey.currentScene = null;
  journey.currentGift = 0;
  journey.letterOpened = false;
  journey.musicMuted = false;
  // This is a direct user gesture, so the browser may allow playback here.
  attemptMusicPlayback(false);
  renderScene("scene-intro", { track: false });
}

function renderScene(sceneId, options = {}) {
  switch (sceneId) {
    case "scene-intro": return showIntro(options);
    case "scene-wish": return showWish(options);
    case "scene-candles": return showCandles(options);
    case "scene-cake": return showCake(options);
    case "scene-celebration": return showCelebration(options);
    case "scene-gift-box": return showGiftBox(options);
    case "scene-gift": return showGift(journey.currentGift, options);
    case "scene-gallery": return showGallery(options);
    case "scene-final": return showFinal(options);
    default: return showIntro(options);
  }
}

function showIntro(options = {}) {
  showScene("scene-intro", `<div class="scene-content intro-content">
    <p class="scene-eyebrow">A LITTLE SURPRISE, JUST FOR YOU</p>
    <img class="scene-photo journey-photo" src="${PHOTO.journey}" alt="Birthday portrait for Shraddha" fetchpriority="high">
    <div class="reveal-heart" aria-hidden="true">♡</div>
    <p class="scene-kicker">The wait is over…</p>
    <h1>Your little<br><span>birthday journey</span></h1>
    <p class="scene-copy">Aaj ka din tumhara hai, madam. Get comfy — ab thodi si birthday masti shuru karte hain. 💗</p>
    <div class="music-note" aria-live="polite">♫ <span class="music-help">Preet Re — add your MP3 to turn the music on.</span></div>
    ${button("Let's Begin the Birthday Fun ✨", "wish")}
    <p class="scene-hint">P.S. No skipping straight to the gifts. Rules are rules. 😂</p>
  </div>`, { track: options.track ?? true });
}

function showWish(options = {}) {
  showScene("scene-wish", `<div class="scene-content scene-cake-content">
    <p class="scene-eyebrow">MAKE A WISH</p>
    <h1>Close your eyes<br>and make a wish.</h1>
    <p class="scene-copy">Kuch aisa maangna jo tumhare dil ke kareeb ho. No telling anyone, okay? Wishes are secret. 🤫💗</p>
    ${cakeMarkup({ flames: true })}
    <p class="scene-hint">Ek wish dil se maangna… aur haan, extra chocolate wali wish valid hai. 🤭</p>
    ${button("Wish Made — Light the Candles 🕯️", "candles")}
  </div>`, { track: options.track ?? true });
}

function showCandles(options = {}) {
  showScene("scene-candles", `<div class="scene-content scene-cake-content">
    <p class="scene-eyebrow">ONE DEEP BREATH</p>
    <h1>Make your wish<br>come true.</h1>
    <p class="scene-copy">Ab candles bujhao, madam — wish universe tak pahunchni chahiye! 🌬️💗</p>
    ${cakeMarkup({ flames: true })}
    ${button("Blow Out the Candles 🌬️", "blow", "blow-button")}
    <p class="scene-hint">Phook maarne ka button hai… phone ko sach mein mat phoonk dena. 😂</p>
  </div>`, { track: options.track ?? true });
}

function blowCandles() {
  const cake = $(".cake-illustration", journey.root);
  const btn = $('[data-action="blow"]', journey.root);
  if (!cake || btn?.disabled) return;
  cake.classList.add("candles-blown");
  if (btn) { btn.disabled = true; btn.textContent = "Wish sent to the universe ✨"; }
  const hint = $(".scene-hint", journey.root);
  if (hint) hint.textContent = "Wish delivered. Universe ne seen kar liya. ✨😂";
  sceneTimer = window.setTimeout(() => showCake(), 1350);
}

function showCake(options = {}) {
  showScene("scene-cake", `<div class="scene-content scene-cake-content cake-cut-content">
    <p class="scene-eyebrow">THE CAKE-CUTTING CEREMONY</p>
    <h1>Now, cut your<br><span>princess cake!</span></h1>
    <p class="scene-copy">First wish, then candles… ab cake cutting toh banta hai. First slice birthday girl ki! 👑🍰</p>
    ${cakeMarkup({ flames: false, cuttable: true })}
    <p class="scene-hint">Ready? Slice tumhari, crumbs meri taraf se imaginary. 😌</p>
    ${button("Cut the Cake 🍰", "cut", "cut-button")}
  </div>`, { track: options.track ?? true });
}

function cutCake() {
  const root = journey.root;
  if (root.classList.contains("cake-is-cutting")) return;
  root.classList.add("cake-is-cutting");
  const btn = $('[data-action="cut"]', root);
  if (btn) { btn.disabled = true; btn.textContent = "One slice for the birthday girl! 🍰"; }
  const hint = $(".scene-hint", root);
  if (hint) hint.textContent = "Oho! Slice alag ho gayi… ab celebration rokna mana hai! 🌸✨";
  sceneTimer = window.setTimeout(() => showCelebration(), 1900);
}

function showCelebration(options = {}) {
  const sprinkle = Array.from({ length: 46 }, (_, i) => `<i style="--i:${i};--x:${(i*37)%100};--delay:${(i%9)*-.37}s">${i%4===0 ? "♥" : i%4===1 ? "✦" : i%4===2 ? "•" : "✿"}</i>`).join("");
  showScene("scene-celebration", `<div class="confetti-layer" aria-hidden="true">${sprinkle}</div>
    <div class="scene-content celebration-content">
      <p class="scene-eyebrow">IT'S YOUR DAY!</p>
      <img class="scene-photo celebration-photo" src="${PHOTO.celebration}" alt="Lavender birthday celebration portrait for Shraddha" loading="eager">
      <div class="celebration-emoji" aria-hidden="true">🎉 💗 🎉</div>
      <h1>Let's Celebrate!</h1>
      <p class="scene-copy">May your year be full of little wins, unexpected happiness, genuine smiles, and people who make you feel understood. 🥹✨</p>
      <p class="celebration-tease">Aaj ke liye attitude allowed hai. Kal se phir normal madam mode. 😌😂</p>
      ${button("Unwrap Your Little Gifts 🎁", "gifts")}
    </div>`, { track: options.track ?? true });
}

function showGiftBox(options = {}) {
  journey.currentGift = 0;
  showScene("scene-gift-box", `<div class="scene-content gift-content">
    <p class="scene-eyebrow">A FEW LITTLE THINGS FOR YOU</p>
    <h1>Wait, madam… 🎁</h1>
    <p class="scene-copy">Birthday toh ho gaya… lekin tumhare gifts abhi baaki hain! 👀</p>
    <button type="button" class="gift-box" data-action="open-gift" aria-label="Tap to open the gift box">
      <span class="gift-box-glow"></span><span class="gift-bow">🎀</span><span class="gift-body-emoji">🎁</span><span class="gift-box-spark spark-one">✦</span><span class="gift-box-spark spark-two">✧</span>
    </button>
    <p class="scene-hint">Tap the gift box to open it. Suspense mein mat rakho, madam! 👀</p>
  </div>`, { track: options.track ?? true });
}

function showGift(index, options = {}) {
  if (index >= gifts.length) { showGallery(); return; }
  if (index < 0) index = 0;
  const gift = gifts[index];
  showScene("scene-gift", `<div class="scene-content individual-gift">
    <p class="scene-eyebrow">A LITTLE SOMETHING FOR YOU ♡</p>
    ${gift.art}
    <h1>${gift.title}</h1>
    <p class="scene-copy">${gift.text}</p>
    <p class="gift-extra">${gift.extra}</p>
    ${button(index === gifts.length - 1 ? "Open Your Scrapbook 📸" : "Okay, What's Next? 👀", "next-gift")}
  </div>`, { track: options.track ?? true });
  // Update after showScene records the previous gift state for Back navigation.
  journey.currentGift = index;
}

function showGallery(options = {}) {
  const labels = [
    "A little birthday magic ✨", "Birthday girl energy 💗", "Main-character moment 👑",
    "A smile worth saving ♡", "Soft moments, happy heart 🌷", "That lovely smile ♡",
    "Just being you ✨", "Stay this happy 🌸", "A favourite little memory ♡",
    "Some things never need a caption 💗", "A little sunshine ✨", "A day to remember 🎂", "You, being you ♡"
  ];
  // Reverse the established gallery order: the last memories now appear first.
  const ordered = [...PHOTO.gallery].reverse();
  const galleryMarkup = ordered.map((src, i) => `<figure class="photo-placeholder photo-${i % 6}"><img src="${src}" alt="Birthday scrapbook memory ${i + 1}" loading="lazy"><figcaption>${labels[i] || "A little memory ♡"}</figcaption></figure>`).join("");
  showScene("scene-gallery", `<div class="scene-content gallery-content">
    <p class="scene-eyebrow">LITTLE MOMENTS, BIG MEMORIES</p>
    <h1>Your little scrapbook <span class="heading-camera">📸</span></h1>
    <p class="scene-copy gallery-copy">Some moments deserve to be kept a little closer. ♡</p>
    <div class="scrapbook-frame"><div class="scrapbook-grid">${galleryMarkup}</div></div>
    <p class="scene-hint gallery-hint">Scroll through your memories… aur haan, itni photos hain ki choose karna impossible hai. 😂</p>
    ${button("Open Your Birthday Letter 💌", "final")}
  </div>`, { track: options.track ?? true });
}

function showFinal(options = {}) {
  journey.letterOpened = false;
  showScene("scene-final", `<div class="scene-content final-content">
    <p class="scene-eyebrow">ONE LAST LITTLE SURPRISE</p>
    <h1>A letter, just<br><span>for you.</span></h1>
    <p class="scene-copy final-intro">Isko kholne se pehle ek promise: aaj ke din bas smile karna. 💌</p>
    <button type="button" class="letter-envelope" data-action="open-letter" aria-label="Open the birthday letter">
      <span class="envelope-heart">♡</span><span class="envelope-flap"></span><span class="envelope-paper-label">For Shraddha</span><span class="envelope-seal">✉</span>
    </button>
    <p class="scene-hint">Tap the button below to open your letter.</p>
    ${button("Open Your Letter 💌", "open-letter", "open-letter-button")}
    <div class="letter-revealed" hidden>
      <article class="letter-paper">
        <p class="letter-salutation">Dear Shraddha,</p>
        <p>I hope this year brings you the kind of happiness that feels peaceful, the kind of people who understand you without making you explain everything, and the courage to go after the things you really want.</p>
        <p>Keep being your own kind of person — a little unpredictable, a little stubborn, full of your own thoughts, and impossible to fit into just one description. You never have to become someone else to be appreciated.</p>
        <p>You deserve good days, honest people, lots of laughter, and memories that make you smile even later. I hope today gives you one more reason to smile. ✨</p>
        <p class="letter-signoff">Enjoy your day, birthday girl.<br>And haan… treat pending hai! 😂💗</p>
      </article>
      ${button("Relive the Birthday Journey ↻", "replay-journey", "replay-journey-button")}
    </div>
  </div>`, { track: options.track ?? true });
}

function updateMusicButton() {
  if (!journey.root) return;
  const btn = $(".scene-music", journey.root);
  if (!btn) return;
  const playing = Boolean(journey.audio && !journey.audio.paused && !journey.audio.muted && !journey.audio.error && journey.audio.readyState >= 2 && journey.audio.currentSrc);
  btn.classList.toggle("is-playing", Boolean(playing));
  btn.setAttribute("aria-label", playing ? "Mute birthday music" : "Play birthday music");
  btn.title = playing ? "Mute birthday music" : "Play birthday music";
  const symbol = $(".music-symbol", btn);
  const label = $(".music-state", btn);
  if (symbol) symbol.textContent = playing ? "♫" : "♪̸";
  if (label) label.textContent = playing ? "On" : "Sound";
  const help = $(".music-help", journey.root);
  if (help) help.textContent = playing ? "Preet Re is playing softly ♡" : "Preet Re — add the MP3 to enable music.";
}

async function attemptMusicPlayback(showError = true) {
  if (!journey.audio) ensureJourney();
  if (!journey.audio) return false;
  if (journey.musicMuted) journey.audio.muted = true;
  else journey.audio.muted = false;
  try {
    await journey.audio.play();
    journey.audioReady = true;
    updateMusicButton();
    return true;
  } catch (err) {
    journey.audioReady = false;
    updateMusicButton();
    if (showError) {
      const toast = $("#sceneToast", journey.root);
      if (toast) {
        toast.textContent = journey.audio.error
          ? "Song missing — add assets/preet-re.mp3 to enable music. ♡"
          : "Tap once more if your browser blocked the music. ♡";
        toast.classList.add("is-visible");
        window.setTimeout(() => toast.classList.remove("is-visible"), 3600);
      }
    }
    return false;
  }
}

function toggleMusic() {
  ensureJourney();
  if (!journey.audio) return;
  if (!journey.audio.paused && !journey.audio.muted) {
    journey.audio.pause();
    journey.musicMuted = true;
  } else {
    journey.musicMuted = false;
    journey.audio.muted = false;
    attemptMusicPlayback(true);
  }
  updateMusicButton();
}

function leaveJourneyToWelcome() {
  if (sceneTimer !== null) { clearTimeout(sceneTimer); sceneTimer = null; }
  journey.root.hidden = true;
  journey.currentScene = null;
  journey.history = [];
  if (el.topIntro) el.topIntro.hidden = false;
  el.welcome.hidden = false;
  el.replay.hidden = false;
  // Preserve the welcome screen; do not restart its countdown.
}

function goBack() {
  if (sceneTimer !== null) { clearTimeout(sceneTimer); sceneTimer = null; }
  const previous = journey.history.pop();
  if (previous) {
    // Restore per-scene state (notably which gift was open) without
    // recording a new history entry.
    journey.currentGift = previous.giftIndex ?? 0;
    journey.letterOpened = previous.letterOpened ?? false;
    renderScene(previous.sceneId, { track: false });
  } else {
    leaveJourneyToWelcome();
  }
}

function openLetter() {
  if (journey.letterOpened) return;
  journey.letterOpened = true;
  const envelope = $(".letter-envelope", journey.root);
  const button = $(".open-letter-button", journey.root);
  const hint = $(".scene-hint", journey.root);
  const revealed = $(".letter-revealed", journey.root);
  if (envelope) envelope.classList.add("is-opening");
  if (button) { button.disabled = true; button.textContent = "Opening your note… 💗"; }
  window.setTimeout(() => {
    if (envelope) envelope.hidden = true;
    if (hint) hint.hidden = true;
    if (button) button.hidden = true;
    if (revealed) revealed.hidden = false;
    const content = $(".final-content", journey.root);
    if (content) content.classList.add("letter-opened");
    const scrollContent = $(".scene-content", journey.root);
    if (scrollContent) scrollContent.scrollTop = 0;
  }, 450);
}

function handleJourneyClick(event) {
  const target = event.target instanceof Element ? event.target.closest("[data-action]") : null;
  if (!target || target.disabled) return;
  const action = target.dataset.action;
  if (action === "back") return goBack();
  if (action === "music") return toggleMusic();
  if (action === "wish") return showWish();
  if (action === "candles") return showCandles();
  if (action === "blow") return blowCandles();
  if (action === "cut") return cutCake();
  if (action === "gifts") return showGiftBox();
  if (action === "open-gift") {
    target.classList.add("gift-opening");
    target.disabled = true;
    sceneTimer = window.setTimeout(() => showGift(0), 420);
    return;
  }
  if (action === "next-gift") return showGift(journey.currentGift + 1);
  if (action === "final") return showFinal();
  if (action === "open-letter") return openLetter();
  if (action === "replay-journey") {
    if (journey.audio) { journey.audio.pause(); journey.audio.currentTime = 0; }
    journey.musicMuted = false;
    journey.history = [];
    journey.currentScene = null;
    journey.currentGift = 0;
    journey.letterOpened = false;
    attemptMusicPlayback(false);
    return renderScene("scene-intro", { track: false });
  }
}

/* -------------------------- event setup ----------------------------- */
el.replay?.addEventListener("click", startExperience);
el.surprise?.addEventListener("click", openJourney);

function init() {
  createStars();
  createParticles();
  createClockFace();
  updateCalendar();
  startExperience();
}

init();


