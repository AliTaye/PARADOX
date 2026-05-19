/* ═══════════════════════════════════════════════════════════════
   PARADOX — script.js
   Modular UI Puzzle Game Engine
   Levels 1–5 fully coded. Levels 6–20 architecture stubs ready.
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────
   ENGINE CORE
───────────────────────────────────────────── */
const Engine = (() => {

  let currentLevel = 0;
  const TOTAL_LEVELS = 20;

  const screens = {
    start:  document.getElementById('start-screen'),
    game:   document.getElementById('game-screen'),
    end:    document.getElementById('end-screen'),
  };

  const stage           = document.getElementById('stage');
  const levelNumEl      = document.getElementById('level-num');
  const levelTitleHud   = document.getElementById('level-title-hud');
  const successOverlay  = document.getElementById('success-overlay');

  /* Show a screen, hide others */
  function goTo(screenName) {
    Object.values(screens).forEach(s => {
      s.classList.remove('active');
    });
    screens[screenName].classList.add('active');
  }

  /* Flash the success overlay, then load next level */
  function levelComplete() {
    successOverlay.classList.remove('hidden');
    setTimeout(() => {
      successOverlay.classList.add('hidden');
      currentLevel++;
      if (currentLevel >= TOTAL_LEVELS) {
        goTo('end');
      } else {
        loadLevel(currentLevel);
      }
    }, 1800);
  }

  /* Clear stage and mount a level */
  function loadLevel(idx) {
    // Update HUD
    levelNumEl.textContent = String(idx + 1).padStart(2, '0');

    // Clear previous level content
    stage.innerHTML = '';
    stage.style.cssText = ''; // reset any inline styles

    const level = Levels[idx];
    if (!level) {
      console.warn(`Level ${idx} not yet implemented.`);
      return;
    }

    levelTitleHud.textContent = level.title;

    // Mount the level
    level.mount(stage, levelComplete);
  }

  /* Public API */
  return {
    start() {
      goTo('game');
      currentLevel = 0;
      loadLevel(0);
    },
    restart() {
      loadLevel(currentLevel);
    },
    advance: levelComplete,
    getLevel: () => currentLevel,
  };
})();

/* ─────────────────────────────────────────────
   LEVEL REGISTRY
   Each level: { title, mount(stage, done) }
   mount() sets up DOM inside `stage`,
   calls done() when the puzzle is solved.
───────────────────────────────────────────── */
const Levels = [];

/* ═══════════════════════════════════════════════════════════════
   LEVEL 01 — "THE INVISIBLE DOOR"
   The NEXT button is there — but opacity: 0.
   Player must hover over empty space to find it.
   Hint fades in after 5 seconds.
═══════════════════════════════════════════════════════════════ */
Levels[0] = {
  title: 'THE INVISIBLE DOOR',
  mount(stage, done) {
    stage.innerHTML = `
      <div class="level-card fade-in">
        <span class="tag">LEVEL 01</span>
        <h2>SOMETHING IS MISSING</h2>
        <p>The button exists.<br>You just can't see it.</p>
      </div>
      <div class="level-prompt" id="l1-hint" style="opacity:0">
        ↳ Try hovering below the card…
      </div>
      <button id="l1-hidden-btn" class="puzzle-btn">PROCEED →</button>
    `;

    const btn  = stage.querySelector('#l1-hidden-btn');
    const hint = stage.querySelector('#l1-hint');

    // Reveal button on hover
    btn.addEventListener('mouseenter', () => {
      btn.style.opacity = '1';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.opacity = '0';
    });
    btn.addEventListener('click', done);

    // Show hint after 5 seconds
    setTimeout(() => {
      hint.style.opacity = '1';
    }, 5000);
  },
};

/* ═══════════════════════════════════════════════════════════════
   LEVEL 02 — "THE ESCAPIST"
   The button runs away from the cursor.
   After 7 failed escapes it gets tired and stops.
   Then the player can click it.
═══════════════════════════════════════════════════════════════ */
Levels[1] = {
  title: 'THE ESCAPIST',
  mount(stage, done) {
    stage.innerHTML = `
      <div class="level-card fade-in">
        <span class="tag">LEVEL 02</span>
        <h2>CATCH ME IF YOU CAN</h2>
        <p>The button doesn't want to be clicked.<br>Wear it down.</p>
      </div>
      <button id="l2-btn" class="puzzle-btn" style="position:absolute">CLICK ME</button>
      <div class="level-prompt">↳ Chase it until it gives up.</div>
    `;

    const btn = stage.querySelector('#l2-btn');
    const stageRect = () => stage.getBoundingClientRect();

    let escapes = 0;
    const MAX_ESCAPES = 7;
    let tired = false;

    // Place randomly in stage
    function randomPos() {
      const sr = stageRect();
      const bw = btn.offsetWidth;
      const bh = btn.offsetHeight;
      const x = Math.random() * (sr.width  - bw - 40) + 20;
      const y = Math.random() * (sr.height - bh - 60) + 20;
      return { x, y };
    }

    const init = randomPos();
    btn.style.left = init.x + 'px';
    btn.style.top  = init.y + 'px';

    btn.addEventListener('mouseenter', () => {
      if (tired) return;
      escapes++;
      const p = randomPos();
      btn.style.left = p.x + 'px';
      btn.style.top  = p.y + 'px';

      if (escapes >= MAX_ESCAPES) {
        tired = true;
        btn.textContent = '…fine.';
        btn.style.transition = 'left 0.5s, top 0.5s, opacity 0.3s';
        btn.style.opacity = '0.6';
      }
    });

    btn.addEventListener('click', () => {
      if (tired) done();
    });
  },
};

/* ═══════════════════════════════════════════════════════════════
   LEVEL 03 — "ONE OF US IS REAL"
   Four buttons. Three are pointer-events:none decoys.
   One real button has a 1px border difference.
   Player must figure out which one.
═══════════════════════════════════════════════════════════════ */
Levels[2] = {
  title: 'ONE OF US IS REAL',
  mount(stage, done) {
    stage.innerHTML = `
      <div class="level-card fade-in">
        <span class="tag">LEVEL 03</span>
        <h2>FIND THE REAL ONE</h2>
        <p>Four buttons. Three are lies.<br>One will respond.</p>
        <div class="l3-btn-wrap">
          <button class="puzzle-btn l3-btn" id="l3-a">OPTION A</button>
          <button class="puzzle-btn l3-btn" id="l3-b">OPTION B</button>
          <button class="puzzle-btn l3-btn real" id="l3-c">OPTION C</button>
          <button class="puzzle-btn l3-btn" id="l3-d">OPTION D</button>
        </div>
      </div>
      <div class="level-prompt">↳ Only one button is clickable. Find it.</div>
    `;

    // Real button is C — has a faint accent border as the only visual hint
    const real = stage.querySelector('#l3-c');
    real.style.borderBottom = '2px solid rgba(200,255,0,0.25)';
    real.addEventListener('click', done);

    // Decoys give a satisfying-but-useless flash
    ['#l3-a','#l3-b','#l3-d'].forEach(id => {
      const btn = stage.querySelector(id);
      btn.addEventListener('click', () => {
        btn.style.opacity = '0.3';
        setTimeout(() => btn.style.opacity = '', 200);
      });
    });
  },
};

/* ═══════════════════════════════════════════════════════════════
   LEVEL 04 — "BACKWARDS LOCK"
   A slider that appears to go 0→100.
   But it's visually reversed (direction:rtl).
   The actual value must reach 0 (the visual right) to proceed.
   A numeric display shows the real value — confusing the player.
═══════════════════════════════════════════════════════════════ */
Levels[3] = {
  title: 'BACKWARDS LOCK',
  mount(stage, done) {
    stage.innerHTML = `
      <div class="level-card fade-in">
        <span class="tag">LEVEL 04</span>
        <h2>SLIDE TO UNLOCK</h2>
        <p>Drag the slider all the way to unlock.<br>It's simpler than it looks.</p>
        <div id="l4-slider-wrap">
          <input type="range" id="l4-slider" min="0" max="100" value="50" />
          <div id="l4-val">VALUE: 50</div>
        </div>
      </div>
      <div class="level-prompt">↳ Slide it. All the way.</div>
    `;

    const slider = stage.querySelector('#l4-slider');
    const valEl  = stage.querySelector('#l4-val');

    slider.addEventListener('input', () => {
      const v = parseInt(slider.value);
      valEl.textContent = `VALUE: ${v}`;

      // Visually reversed — value 0 means slider thumb is on right side
      // Player must drag LEFT to reach visual right (=value 0)
      if (v === 0) {
        valEl.textContent = 'UNLOCKED';
        valEl.style.color = 'var(--accent)';
        setTimeout(done, 600);
      }
    });
  },
};

/* ═══════════════════════════════════════════════════════════════
   LEVEL 05 — "THE GLASS CEILING"
   A transparent div sits on top of the button, blocking it.
   The glass div has pointer-events but no visible indicator.
   Player must right-click the glass (context menu won't show),
   OR discover they can DRAG the glass layer off the button.
   Dragging the overlay away from center reveals the real button.
═══════════════════════════════════════════════════════════════ */
Levels[4] = {
  title: 'THE GLASS CEILING',
  mount(stage, done) {
    stage.innerHTML = `
      <div class="level-card fade-in" style="position:relative; overflow:visible">
        <span class="tag">LEVEL 05</span>
        <h2>SOMETHING BLOCKS THE WAY</h2>
        <p>The button is right there.<br>Why can't you click it?</p>
        <div style="position:relative; margin-top:24px; display:inline-block;">
          <button id="l5-real-btn" class="puzzle-btn" style="position:relative; z-index:1;">UNLOCK</button>
          <!-- Glass pane sits exactly over the button -->
          <div id="l5-glass"
            style="position:absolute; inset:-8px; z-index:10; cursor:grab; background:rgba(255,255,255,0.0);"
            title="Something feels wrong here…">
          </div>
        </div>
      </div>
      <div id="l5-hint-text" class="level-prompt">
        ↳ The cursor changes where you can't click.
      </div>
    `;

    const glass   = stage.querySelector('#l5-glass');
    const realBtn = stage.querySelector('#l5-real-btn');

    // Drag-to-remove the glass layer
    let dragging = false;
    let startX, startY, origLeft, origTop;

    glass.addEventListener('mousedown', (e) => {
      dragging = true;
      glass.style.cursor = 'grabbing';
      startX = e.clientX;
      startY = e.clientY;
      origLeft = glass.offsetLeft;
      origTop  = glass.offsetTop;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      glass.style.left = (origLeft + dx) + 'px';
      glass.style.top  = (origTop  + dy) + 'px';

      // If dragged more than 80px away, it's off the button
      if (Math.abs(dx) > 80 || Math.abs(dy) > 80) {
        glass.style.pointerEvents = 'none';
        glass.style.opacity = '0';
        glass.style.transition = 'opacity 0.3s';
      }
    });

    document.addEventListener('mouseup', () => {
      dragging = false;
      glass.style.cursor = 'grab';
    });

    realBtn.addEventListener('click', done);
  },
};

/* ═══════════════════════════════════════════════════════════════
   LEVELS 6–20 — CONCEPT STUBS
   Architecture is wired in. Full code in next generation.
═══════════════════════════════════════════════════════════════ */

function stubLevel(idx, title, teaser) {
  Levels[idx] = {
    title,
    mount(stage, done) {
      stage.innerHTML = `
        <div class="level-card fade-in">
          <span class="tag">LEVEL ${String(idx+1).padStart(2,'0')} — COMING NEXT</span>
          <h2>${title}</h2>
          <p style="color:var(--text-dim)">${teaser}</p>
          <button class="puzzle-btn" style="margin-top:24px;opacity:0.4" disabled>LOCKED</button>
        </div>
        <div class="level-prompt" style="color:var(--accent2)">
          ↳ Request the next code batch to unlock levels 6–20.
        </div>
      `;
      // Auto-advance stubs for testing (remove in production)
      // setTimeout(done, 1500);
    }
  };
}

/* ─── Conceptual designs for Levels 6–20 ──────────────────────

LEVEL 06 — "SHRINKING WINDOW"
  Title: THE SHRINKING CAGE
  Mechanic: The stage div slowly animates narrower every 3 s.
  A button sits at the far right edge. The player must click it
  before the stage collapses to 0. If missed, stage resets.
  DOM trick: setInterval shrinks stage width via CSS transition.

LEVEL 07 — "COLOUR CAMOUFLAGE"
  Title: HIDDEN IN PLAIN SIGHT
  Mechanic: Seven buttons, all the same colour as the background
  (#111 on #111). One button has a 1px box-shadow that betrays it
  only on careful inspection. Player discovers it by tabbing or
  zooming the browser.
  DOM trick: tabindex, :focus outline reveals the real button.

LEVEL 08 — "THE SCROLL TRAP"
  Title: BELOW THE FOLD
  Mechanic: Stage has overflow:scroll but scrollbar is hidden.
  The real button is 3× viewport height below. A fake "NO SCROLL"
  label at the top misleads. Player must scroll down to find it.
  DOM trick: Custom scrollbar, scroll-snap, hidden overflow.

LEVEL 09 — "CONSOLE CRYPTIC"
  Title: READ THE MACHINE
  Mechanic: A locked door UI. Console.log prints: "Key: OPEN"
  The stage has an <input> field. Typing "OPEN" unlocks it.
  DOM trick: console.log hint, keyboard input validation.

LEVEL 10 — "THE MIRROR"
  Title: REVERSE LOGIC
  Mechanic: An upside-down (transform: rotate(180deg)) interface.
  All labels say "DO NOT CLICK THIS" with a red X. The real action
  is clicking one of the "forbidden" buttons. The decoy is labelled
  "CLICK HERE →" but does nothing.
  DOM trick: CSS transform on the entire card, pointer-event inversion.

LEVEL 11 — "PHANTOM CLICK"
  Title: PERSISTENCE OF VISION
  Mechanic: The button is visible for only 80ms every 3 seconds
  (CSS animation alternating opacity 0↔1). Player must click during
  the brief flash. Miss = resets timer.
  DOM trick: CSS @keyframes with 97% opacity:0, 3% opacity:1.

LEVEL 12 — "RESIZE TO REVEAL"
  Title: THE VIEWPORT VAULT
  Mechanic: The button exists in CSS but only appears when the
  browser window is narrower than 500px (responsive breakpoint).
  Player must physically resize their browser window.
  DOM trick: @media query hides/shows the real button.

LEVEL 13 — "THE DECOY STORM"
  Title: SIGNAL vs. NOISE
  Mechanic: 50 buttons flood the screen, all identical, moving
  randomly. One button has a slightly different letter spacing.
  Hovering reveals a faint glow; clicking it completes the level.
  DOM trick: Hundreds of absolutely-positioned elements, rAF movement.

LEVEL 14 — "SHADOW DOOR"
  Title: WHAT CASTS THE SHADOW
  Mechanic: A large button-shaped shadow is visible on the stage.
  The actual button is transparent, positioned exactly over its
  shadow (offset). Player clicks the shadow, misses. Must click
  slightly offset (the invisible button above the shadow).
  DOM trick: box-shadow offset, transparent button over shadow.

LEVEL 15 — "FOCUS TUNNEL"
  Title: TABBING THROUGH THE DARK
  Mechanic: Screen is completely black. A message says "Use Tab."
  Tabbing through hidden elements focuses each. One element, when
  focused, reveals a lit outline and Enter completes the level.
  DOM trick: :focus-visible, tabindex, keyboard event listeners.

LEVEL 16 — "THE DOUBLE AGENT"
  Title: CLICKTHROUGH PARADOX
  Mechanic: Two overlapping cards — card A is on top with high z-index
  and a hole (clip-path) cut out. The hole reveals card B behind it.
  Clicking the hole area passes through to card B's button.
  DOM trick: clip-path polygon hole, pointer-events, z-index layering.

LEVEL 17 — "DRAG THE TRUTH"
  Title: THE HIDDEN SEAM
  Mechanic: A blank stage. A draggable rectangular element that looks
  decorative. Dragging it to a specific corner of the screen reveals
  a portal (hidden button) that was underneath it.
  DOM trick: Draggable div, getBoundingClientRect collision detection.

LEVEL 18 — "SELECTION SECRET"
  Title: SELECT AND SEE
  Mechanic: A paragraph of garbled text. One word is "PARADOX"
  buried in it with color: var(--bg) (invisible). Selecting all text
  (Ctrl+A) highlights it. That selected state triggers a CSS
  ::selection rule that fires a JS selectionchange event, solving it.
  DOM trick: ::selection CSS, document.getSelection(), selectionchange.

LEVEL 19 — "TRIPLE MIRROR"
  Title: THE RECURSION TRAP
  Mechanic: An iframe (or CSS-mirrored clone) of the game UI itself
  is embedded inside the stage. The player must interact with the
  inner puzzle (which is a simplified mini-version) to unlock the
  outer level. Solving inner triggers outer done().
  DOM trick: Nested puzzle engine instance, postMessage or shared state.

LEVEL 20 — "THE FINAL PARADOX"
  Title: YOU ARE THE PUZZLE
  Mechanic: A blank screen with the text "The game is already solved."
  Nothing is clickable. After 10 seconds of inactivity, tiny text
  appears: "Stop trying." After 5 more: "You won by doing nothing."
  The level auto-completes if the player doesn't touch mouse/keyboard
  for 15 seconds. Any interaction resets the 15-second timer.
  DOM trick: Inactivity timer, mousemove/keydown/click listeners reset timer.
  The ultimate anti-UX lesson: sometimes the best interaction is none.

─────────────────────────────────────────────────────────────── */

/* ═══════════════════════════════════════════════════════════════
   LEVEL 06 — "THE SHRINKING CAGE"
   The stage border collapses inward every 2s.
   A button sits at the far-right edge of an inner track.
   Player must click it before the cage crushes to zero width.
   Miss = cage resets with a taunt. Succeeds on click.
═══════════════════════════════════════════════════════════════ */
Levels[5] = {
  title: 'THE SHRINKING CAGE',
  mount(stage, done) {
    stage.innerHTML = `
      <div class="level-card fade-in" style="width:90%;max-width:520px;">
        <span class="tag">LEVEL 06</span>
        <h2>THE SHRINKING CAGE</h2>
        <p>The walls are closing.<br>The button is at the edge. Hurry.</p>
      </div>

      <!-- The track that shrinks -->
      <div id="l6-track">
        <div id="l6-bar"></div>
        <button id="l6-edge-btn" class="puzzle-btn">NOW</button>
      </div>
      <div id="l6-taunt" class="level-prompt" style="opacity:0;color:var(--accent2)"></div>
      <div class="level-prompt" style="bottom:16px">↳ Click the button before the cage closes.</div>
    `;

    const track  = stage.querySelector('#l6-track');
    const bar    = stage.querySelector('#l6-bar');
    const btn    = stage.querySelector('#l6-edge-btn');
    const taunt  = stage.querySelector('#l6-taunt');

    const TAUNTS = [
      'Too slow.', 'Again.', 'It almost felt real.', 'Faster.', 'Did you even try?'
    ];
    let tauntIdx = 0;
    let width = 100; // percent
    let intervalId;

    function startShrink() {
      width = 100;
      bar.style.width = width + '%';
      track.style.opacity = '1';
      btn.style.opacity = '1';
      btn.disabled = false;

      clearInterval(intervalId);
      intervalId = setInterval(() => {
        width -= 8;
        bar.style.width = Math.max(0, width) + '%';
        // Button rides the bar edge
        btn.style.right = (100 - Math.max(0, width)) + '%';

        if (width <= 0) {
          clearInterval(intervalId);
          btn.disabled = true;
          taunt.textContent = TAUNTS[tauntIdx % TAUNTS.length];
          tauntIdx++;
          taunt.style.opacity = '1';
          setTimeout(() => {
            taunt.style.opacity = '0';
            setTimeout(startShrink, 400);
          }, 900);
        }
      }, 350);
    }

    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      clearInterval(intervalId);
      done();
    });

    startShrink();
  },
};

/* ═══════════════════════════════════════════════════════════════
   LEVEL 07 — "COLOUR CAMOUFLAGE"
   Nine buttons rendered in #111 text on #111 background —
   invisible. One button has a microscopic 1px accent box-shadow.
   Tabbing (keyboard) reveals focus outlines on all.
   Hovering over ANY lights up a tiny cursor‑trail that helps hunt.
   Clicking the shadow-betrayed button wins.
═══════════════════════════════════════════════════════════════ */
Levels[6] = {
  title: 'HIDDEN IN PLAIN SIGHT',
  mount(stage, done) {
    // Real button index (0-based, fixed at 4 = centre grid)
    const REAL_IDX = 4;

    let btns = '';
    for (let i = 0; i < 9; i++) {
      btns += `<button class="l7-btn" data-idx="${i}" tabindex="${i + 1}"></button>`;
    }

    stage.innerHTML = `
      <div class="level-card fade-in" style="max-width:460px">
        <span class="tag">LEVEL 07</span>
        <h2>HIDDEN IN PLAIN SIGHT</h2>
        <p>Nine buttons. All invisible.<br>One has a tell. Find it.</p>
      </div>
      <div id="l7-grid">${btns}</div>
      <div class="level-prompt">↳ Look closer. Or use your keyboard.</div>
    `;

    const buttons = stage.querySelectorAll('.l7-btn');
    buttons.forEach((b, i) => {
      if (i === REAL_IDX) {
        // The only visible hint: 1px lime shadow, nearly imperceptible
        b.style.boxShadow = '0 0 0 1px rgba(200,255,0,0.18)';
        b.addEventListener('click', done);
      } else {
        b.addEventListener('click', () => {
          // Wrong click: flash the stage red for 120ms
          stage.style.background = 'rgba(255,60,95,0.06)';
          setTimeout(() => stage.style.background = '', 120);
        });
      }
    });
  },
};

/* ═══════════════════════════════════════════════════════════════
   LEVEL 08 — "BELOW THE FOLD"
   Stage is a tall scrollable container (hidden scrollbar).
   Top reads "— SCROLL DISABLED —". It's a lie.
   The real button is 280vh below, revealed only by scrolling.
   A subtle parallax glow moves as you scroll, guiding downward.
═══════════════════════════════════════════════════════════════ */
Levels[7] = {
  title: 'BELOW THE FOLD',
  mount(stage, done) {
    stage.innerHTML = `
      <div id="l8-scroll-container">

        <!-- Top section — the decoy -->
        <div id="l8-top">
          <div class="level-card" style="border-color:var(--accent2)">
            <span class="tag" style="border-color:var(--accent2);color:var(--accent2)">LEVEL 08</span>
            <h2>BELOW THE FOLD</h2>
            <p>Scroll is disabled on this level.<br>The button is right here.</p>
            <button class="puzzle-btn" id="l8-decoy-btn" style="margin-top:20px;opacity:0.9">UNLOCK</button>
          </div>
          <div style="margin-top:40px;font-size:0.6rem;color:var(--muted);letter-spacing:0.2em">
            — SCROLL DISABLED —
          </div>
        </div>

        <!-- Deep hidden section -->
        <div id="l8-deep">
          <div id="l8-glow-ball"></div>
          <div style="text-align:center;margin-bottom:32px">
            <div style="font-size:0.6rem;letter-spacing:0.2em;color:var(--text-dim);margin-bottom:12px">
              YOU FOUND IT.
            </div>
            <button id="l8-real-btn" class="puzzle-btn">THIS IS REAL →</button>
          </div>
        </div>

      </div>
    `;

    const container  = stage.querySelector('#l8-scroll-container');
    const decoyBtn   = stage.querySelector('#l8-decoy-btn');
    const realBtn    = stage.querySelector('#l8-real-btn');
    const glowBall   = stage.querySelector('#l8-glow-ball');

    // Decoy does nothing — just wobbles
    decoyBtn.addEventListener('click', () => {
      decoyBtn.textContent = 'nothing happened.';
      decoyBtn.style.opacity = '0.3';
      setTimeout(() => {
        decoyBtn.textContent = 'UNLOCK';
        decoyBtn.style.opacity = '0.9';
      }, 800);
    });

    // Parallax glow chases scroll progress
    container.addEventListener('scroll', () => {
      const prog = container.scrollTop / (container.scrollHeight - container.clientHeight);
      glowBall.style.opacity = String(prog);
      glowBall.style.transform = `translateX(-50%) scale(${0.5 + prog * 1.2})`;
    });

    realBtn.addEventListener('click', done);
  },
};

/* ═══════════════════════════════════════════════════════════════
   LEVEL 09 — "CONSOLE CRYPTIC"
   A locked terminal UI. Input field demands a password.
   The password ("DISSOLVE") is printed ONLY in the browser console.
   Player must open DevTools to find it.
   Wrong answers animate a glitch rejection. Correct = done().
═══════════════════════════════════════════════════════════════ */
Levels[8] = {
  title: 'READ THE MACHINE',
  mount(stage, done) {
    stage.innerHTML = `
      <div class="level-card fade-in" style="max-width:440px">
        <span class="tag">LEVEL 09</span>
        <h2>READ THE MACHINE</h2>
        <p>A password is required.<br>It is not written here.</p>
        <div id="l9-terminal">
          <div id="l9-log"></div>
          <div id="l9-input-row">
            <span id="l9-prompt">❯</span>
            <input id="l9-input" type="text" autocomplete="off" spellcheck="false" placeholder="enter key…" maxlength="20" />
          </div>
        </div>
      </div>
      <div class="level-prompt">↳ The answer is in the machine. Not this one.</div>
    `;

    // Plant the key in the console NOW
    console.clear();
    console.log('%c[PARADOX — LEVEL 09]', 'color:#c8ff00;font-weight:bold;font-size:1rem;font-family:monospace');
    console.log('%c> SYSTEM ACCESS REQUIRED', 'color:#555;font-size:0.8rem;font-family:monospace');
    console.log('%c> DECRYPTION KEY: %cDISSOLVE', 'color:#333;font-size:0.8rem;font-family:monospace', 'color:#c8ff00;font-weight:bold;font-size:0.9rem;font-family:monospace');
    console.log('%c> Enter key into interface to proceed.', 'color:#2a2a2a;font-size:0.75rem;font-family:monospace');

    const input  = stage.querySelector('#l9-input');
    const log    = stage.querySelector('#l9-log');
    const prompt = stage.querySelector('#l9-prompt');

    function addLog(text, color = 'var(--text-dim)') {
      const line = document.createElement('div');
      line.style.cssText = `color:${color};font-size:0.7rem;letter-spacing:0.08em;margin-bottom:4px;`;
      line.textContent = text;
      log.appendChild(line);
      log.scrollTop = log.scrollHeight;
    }

    addLog('> PARADOX SECURITY TERMINAL v2.1');
    addLog('> Awaiting decryption key…');

    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const val = input.value.trim().toUpperCase();
      input.value = '';

      addLog(`❯ ${val}`, 'var(--text)');

      if (val === 'DISSOLVE') {
        addLog('> KEY ACCEPTED. LAYER DISSOLVING…', 'var(--accent)');
        prompt.style.color = 'var(--accent)';
        input.disabled = true;
        setTimeout(done, 900);
      } else {
        addLog('> ACCESS DENIED. WRONG KEY.', 'var(--accent2)');
        // Glitch the card
        const card = stage.querySelector('.level-card');
        card.style.transform = 'translateX(6px)';
        setTimeout(() => card.style.transform = 'translateX(-6px)', 80);
        setTimeout(() => card.style.transform = '', 160);
      }
    });

    input.focus();
  },
};

/* ═══════════════════════════════════════════════════════════════
   LEVEL 10 — "REVERSE LOGIC"
   The entire card is rotated 180° (upside-down).
   All buttons scream "DO NOT CLICK — DANGER".
   The actual solve button is labelled "SAFE — CLICK HERE" but
   has pointer-events:none and does nothing.
   One of the "DANGER" buttons is real and fires done().
   The trap: every instinct says avoid the red buttons.
   Twist: the card is flipped, so "DO NOT" reads as a directive
   when the player reads it right-side-up mentally.
═══════════════════════════════════════════════════════════════ */
Levels[9] = {
  title: 'REVERSE LOGIC',
  mount(stage, done) {
    // Pick one of 3 danger buttons as the real one (fixed: index 1)
    const REAL = 1;

    let dangerBtns = '';
    for (let i = 0; i < 3; i++) {
      dangerBtns += `
        <button class="puzzle-btn l10-danger" data-real="${i === REAL}"
          style="background:var(--accent2);color:#fff;margin:6px;display:block;width:100%">
          ✕ DO NOT CLICK — DANGER
        </button>`;
    }

    stage.innerHTML = `
      <div id="l10-card" class="level-card fade-in" style="max-width:380px; transform:rotate(180deg)">
        <span class="tag">LEVEL 10</span>
        <h2>REVERSE LOGIC</h2>
        <p>Trust the interface.<br>It has never lied to you.</p>
        ${dangerBtns}
        <button class="puzzle-btn" id="l10-safe"
          style="margin-top:12px;width:100%;background:var(--accent);color:var(--bg);pointer-events:none">
          ✓ SAFE — CLICK HERE
        </button>
      </div>
      <div class="level-prompt" style="transform:rotate(180deg);bottom:auto;top:24px;left:50%;transform:translateX(-50%) rotate(180deg)">
        ↳ Something feels wrong. Maybe that's the point.
      </div>
    `;

    stage.querySelectorAll('.l10-danger').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.real === 'true') {
          done();
        } else {
          // Flash and shake
          btn.style.opacity = '0.3';
          setTimeout(() => btn.style.opacity = '', 200);
        }
      });
    });
  },
};

/* ═══════════════════════════════════════════════════════════════
   LEVEL 11 — "PERSISTENCE OF VISION"
   Button flickers for 120ms every ~4s. Miss three times and
   the interval accelerates. A pulse-ring gives a rhythm cue.
═══════════════════════════════════════════════════════════════ */
Levels[10] = {
  title: 'PERSISTENCE OF VISION',
  mount(stage, done) {
    stage.innerHTML = `
      <div class="level-card fade-in" style="max-width:420px">
        <span class="tag">LEVEL 11</span>
        <h2>PERSISTENCE OF VISION</h2>
        <p>It exists for a fraction of a second.<br>Be ready.</p>
        <div id="l11-pulse-ring"></div>
      </div>
      <button id="l11-flash-btn" class="puzzle-btn">CLICK</button>
      <div id="l11-miss-count" class="level-prompt" style="color:var(--accent2);opacity:0;bottom:48px"></div>
      <div class="level-prompt" style="bottom:16px">&#8627; Watch the rhythm. Strike when it appears.</div>
    `;

    const btn    = stage.querySelector('#l11-flash-btn');
    const missEl = stage.querySelector('#l11-miss-count');
    const ring   = stage.querySelector('#l11-pulse-ring');

    let misses   = 0;
    let interval = 4000;
    const FLASH  = 120;
    let cycleT, flashT, alive = true;

    btn.style.opacity       = '0';
    btn.style.pointerEvents = 'none';
    btn.style.position      = 'absolute';
    btn.style.bottom        = '90px';

    function flash() {
      if (!alive) return;
      btn.style.opacity       = '1';
      btn.style.pointerEvents = 'all';
      ring.classList.add('l11-ring-pop');

      flashT = setTimeout(() => {
        if (!alive) return;
        btn.style.opacity       = '0';
        btn.style.pointerEvents = 'none';
        ring.classList.remove('l11-ring-pop');

        misses++;
        if (misses >= 3) interval = Math.max(1400, interval - 600);
        missEl.textContent  = 'MISSED x' + misses;
        missEl.style.opacity = '1';
        setTimeout(() => { if (alive) missEl.style.opacity = '0'; }, 700);
        scheduleCycle();
      }, FLASH);
    }

    function scheduleCycle() {
      if (!alive) return;
      cycleT = setTimeout(() => {
        ring.classList.add('l11-ring-pre');
        setTimeout(() => {
          ring.classList.remove('l11-ring-pre');
          flash();
        }, 600);
      }, interval - 600);
    }

    btn.addEventListener('click', () => {
      alive = false;
      clearTimeout(cycleT);
      clearTimeout(flashT);
      done();
    });

    scheduleCycle();
  },
};

/* ═══════════════════════════════════════════════════════════════
   LEVEL 12 — "THE VIEWPORT VAULT"
   Unlock button only appears when window.innerWidth < 520px.
   A live width readout shows the player exactly how far to resize.
═══════════════════════════════════════════════════════════════ */
Levels[11] = {
  title: 'THE VIEWPORT VAULT',
  mount(stage, done) {
    const THRESHOLD = 520;

    stage.innerHTML = `
      <div class="level-card fade-in" style="max-width:460px">
        <span class="tag">LEVEL 12</span>
        <h2>THE VIEWPORT VAULT</h2>
        <p>The button exists.<br>But not at this width.</p>
        <div id="l12-width-display">
          <span id="l12-cur-w">--</span>
          <span style="color:var(--text-dim)"> &rarr; </span>
          <span style="color:var(--accent2)">${THRESHOLD}px</span>
        </div>
        <div id="l12-bar-wrap"><div id="l12-bar-fill"></div></div>
      </div>
      <button id="l12-vault-btn" class="puzzle-btn" style="display:none;position:absolute;bottom:80px">
        NARROW ENOUGH &#8594;
      </button>
      <div class="level-prompt">&#8627; Resize the browser window.</div>
    `;

    const vaultBtn = stage.querySelector('#l12-vault-btn');
    const curWEl   = stage.querySelector('#l12-cur-w');
    const barFill  = stage.querySelector('#l12-bar-fill');

    function update() {
      const w   = window.innerWidth;
      curWEl.textContent = w + 'px';
      const pct = Math.min(100, Math.max(0, ((THRESHOLD + 200 - w) / (THRESHOLD + 200)) * 100));
      barFill.style.width = pct + '%';

      if (w < THRESHOLD) {
        vaultBtn.style.display   = 'block';
        curWEl.style.color       = 'var(--accent)';
        barFill.style.background = 'var(--accent)';
      } else {
        vaultBtn.style.display   = 'none';
        curWEl.style.color       = 'var(--accent2)';
        barFill.style.background = 'var(--accent2)';
      }
    }

    update();
    window.addEventListener('resize', update);

    vaultBtn.addEventListener('click', () => {
      window.removeEventListener('resize', update);
      done();
    });
  },
};

/* ═══════════════════════════════════════════════════════════════
   LEVEL 13 — "SIGNAL vs. NOISE"
   60 drifting buttons, all identical. One has wider letter-spacing
   and glows lime on hover. Clicking wrong flashes a red penalty.
═══════════════════════════════════════════════════════════════ */
Levels[12] = {
  title: 'SIGNAL vs. NOISE',
  mount(stage, done) {
    const COUNT    = 60;
    const REAL_IDX = Math.floor(Math.random() * COUNT);

    stage.innerHTML = `
      <div id="l13-arena"></div>
      <div id="l13-header"><span class="tag" style="border:none">LEVEL 13 — SIGNAL vs. NOISE</span></div>
      <div class="level-prompt" style="z-index:10;pointer-events:none">&#8627; One of them is different. Find it.</div>
    `;

    const arena = stage.querySelector('#l13-arena');
    const W = stage.offsetWidth;
    const H = stage.offsetHeight;
    const particles = [];

    for (let i = 0; i < COUNT; i++) {
      const btn = document.createElement('button');
      btn.className = 'l13-dot';
      btn.textContent = 'x';
      btn.dataset.real = (i === REAL_IDX) ? 'true' : 'false';
      if (i === REAL_IDX) btn.classList.add('l13-real');
      arena.appendChild(btn);

      const p = {
        el:  btn,
        x:   Math.random() * (W - 40),
        y:   Math.random() * (H - 100) + 50,
        vx:  (Math.random() - 0.5) * 0.55,
        vy:  (Math.random() - 0.5) * 0.55,
      };
      particles.push(p);
      btn.style.left = p.x + 'px';
      btn.style.top  = p.y + 'px';

      btn.addEventListener('click', () => {
        if (btn.dataset.real === 'true') {
          alive = false;
          cancelAnimationFrame(rafId);
          done();
        } else {
          stage.style.background = 'rgba(255,60,95,0.07)';
          setTimeout(() => stage.style.background = '', 380);
        }
      });
    }

    let alive = true, rafId;

    function tick() {
      if (!alive) return;
      particles.forEach(p => {
        p.x += p.vx;  p.y += p.vy;
        if (p.x < 0   || p.x > W - 30) { p.vx *= -1; p.x = Math.max(0, Math.min(W - 30, p.x)); }
        if (p.y < 50  || p.y > H - 50) { p.vy *= -1; p.y = Math.max(50, Math.min(H - 50, p.y)); }
        p.el.style.left = p.x + 'px';
        p.el.style.top  = p.y + 'px';
      });
      rafId = requestAnimationFrame(tick);
    }
    tick();
  },
};

/* ═══════════════════════════════════════════════════════════════
   LEVEL 14 — "WHAT CASTS THE SHADOW"
   A box-shadow "button" is painted on screen (visual only).
   The real transparent button floats 60px above the shadow.
   Clicks on the stage (not the ghost) create red miss-dots.
═══════════════════════════════════════════════════════════════ */
Levels[13] = {
  title: 'WHAT CASTS THE SHADOW',
  mount(stage, done) {
    stage.innerHTML = `
      <div class="level-card fade-in" style="max-width:440px">
        <span class="tag">LEVEL 14</span>
        <h2>WHAT CASTS THE SHADOW</h2>
        <p>Click the button.</p>
      </div>
      <div id="l14-shadow-decoy"></div>
      <button id="l14-ghost-btn"></button>
      <div class="level-prompt">&#8627; The shadow is not the button.</div>
    `;

    const shadowEl = stage.querySelector('#l14-shadow-decoy');
    const ghostBtn = stage.querySelector('#l14-ghost-btn');
    const BW = 180, BH = 48;
    const cx = stage.offsetWidth  / 2 - BW / 2;
    const cy = stage.offsetHeight / 2 - BH / 2 + 60;

    shadowEl.style.cssText = `
      position:absolute; left:${cx}px; top:${cy}px;
      width:${BW}px; height:${BH}px;
      pointer-events:none;
      box-shadow: 10px 12px 0 0 rgba(200,255,0,0.2);
    `;

    ghostBtn.style.cssText = `
      position:absolute; left:${cx}px; top:${cy - 60}px;
      width:${BW}px; height:${BH}px;
      background:transparent; border:none; cursor:cell; z-index:20;
    `;

    stage.addEventListener('click', (e) => {
      if (e.target === ghostBtn) return;
      const dot = document.createElement('div');
      const r   = stage.getBoundingClientRect();
      dot.style.cssText = `
        position:absolute;
        left:${e.clientX - r.left - 4}px; top:${e.clientY - r.top - 4}px;
        width:8px; height:8px; background:var(--accent2);
        border-radius:50%; pointer-events:none;
        animation:l14-miss 0.5s forwards;
      `;
      stage.appendChild(dot);
      setTimeout(() => dot.remove(), 500);
    });

    ghostBtn.addEventListener('click', done);
  },
};

/* ═══════════════════════════════════════════════════════════════
   LEVEL 15 — "TABBING THROUGH THE DARK"
   Stage is black. Tab through 8 hidden buttons.
   The real one (index 4) glows lime on focus + shows ENTER label.
   Mouse clicks are blocked. Keyboard only.
═══════════════════════════════════════════════════════════════ */
Levels[14] = {
  title: 'TABBING THROUGH THE DARK',
  mount(stage, done) {
    const REAL_IDX = 4;
    const TOTAL    = 8;

    let nodes = '';
    for (let i = 0; i < TOTAL; i++) {
      nodes += `<button class="l15-node ${i === REAL_IDX ? 'l15-real' : ''}"
                  data-real="${i === REAL_IDX}"
                  tabindex="${i + 1}"></button>`;
    }

    stage.innerHTML = `
      <div id="l15-void">
        <p id="l15-msg">The light follows focus.</p>
        <div id="l15-nodes">${nodes}</div>
        <p id="l15-sub">&#8212; keyboard only &#8212;</p>
      </div>
      <div id="l15-focus-label"></div>
    `;

    const labelEl = stage.querySelector('#l15-focus-label');

    stage.querySelectorAll('.l15-node').forEach(btn => {
      btn.addEventListener('focus', () => {
        const isReal = btn.dataset.real === 'true';
        if (isReal) {
          btn.classList.add('l15-lit');
          labelEl.textContent   = '[ PRESS ENTER ]';
          labelEl.style.opacity = '1';
          labelEl.style.color   = 'var(--accent)';
        } else {
          labelEl.textContent   = '...';
          labelEl.style.opacity = '0.25';
          labelEl.style.color   = 'var(--text-dim)';
        }
      });
      btn.addEventListener('blur', () => {
        btn.classList.remove('l15-lit');
        labelEl.style.opacity = '0';
      });
      btn.addEventListener('keydown', e => {
        if ((e.key === 'Enter' || e.key === ' ') && btn.dataset.real === 'true') {
          e.preventDefault();
          done();
        }
      });
      btn.addEventListener('click', e => e.preventDefault());
    });
  },
};

/* ═══════════════════════════════════════════════════════════════
   LEVEL 16 — "CLICKTHROUGH PARADOX"
   Two stacked cards. Top card has a clip-path polygon with a
   rectangular hole cut out of its centre. pointer-events:none
   on the hole zone passes clicks through to card B's button below.
   Clicking anywhere on the solid part of card A = nothing.
   The player must find and click the hole → hits button underneath.
═══════════════════════════════════════════════════════════════ */
Levels[15] = {
  title: 'CLICKTHROUGH PARADOX',
  mount(stage, done) {
    stage.innerHTML = `
      <!-- Bottom card — the real target -->
      <div id="l16-card-b">
        <button id="l16-real-btn" class="puzzle-btn">THROUGH THE HOLE</button>
      </div>

      <!-- Top card — blocks clicks except through the hole -->
      <div id="l16-card-a">
        <span class="tag">LEVEL 16</span>
        <h2>CLICKTHROUGH PARADOX</h2>
        <p>The top layer has a flaw.<br>Find the gap. Click through it.</p>
        <div id="l16-hole-outline"></div>
      </div>

      <div class="level-prompt">&#8627; Not everything you see is solid.</div>
    `;

    /* The hole is centred at 50% 62% of card-a, size 180x48px.
       We'll compute it after layout so coords are pixel-perfect. */
    const cardA  = stage.querySelector('#l16-card-a');
    const outline = stage.querySelector('#l16-hole-outline');

    /* After paint, carve clip-path */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const r  = cardA.getBoundingClientRect();
        const sr = stage.getBoundingClientRect();

        // Hole position relative to cardA (pct)
        const hW = 188, hH = 52;
        const hX = (r.width  - hW) / 2;
        const hY = r.height * 0.60;

        // clip-path polygon with rectangular hole (even-odd rule workaround:
        // outer rect counter-clockwise, hole clockwise)
        const p = (v, total) => (v / total * 100).toFixed(3) + '%';
        const W = r.width, H = r.height;

        // outer boundary (clockwise)
        const outer = `0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%`;
        // hole boundary (counter-clockwise) — creates the see-through gap
        const hx1 = p(hX,       W), hy1 = p(hY,       H);
        const hx2 = p(hX + hW,  W), hy2 = p(hY + hH,  H);
        const hole = `${hx1} ${hy1}, ${hx1} ${hy2}, ${hx2} ${hy2}, ${hx2} ${hy1}, ${hx1} ${hy1}`;

        cardA.style.clipPath  = `polygon(evenodd, ${outer}, ${hole})`;
        cardA.style.webkitClipPath = `polygon(evenodd, ${outer}, ${hole})`;

        // position the outline marker over the hole
        outline.style.cssText = `
          position:absolute;
          left:${hX}px; top:${hY}px;
          width:${hW}px; height:${hH}px;
          border:1px dashed rgba(200,255,0,0.18);
          pointer-events:none;
          z-index:5;
        `;
      });
    });

    stage.querySelector('#l16-real-btn').addEventListener('click', done);
  },
};

/* ═══════════════════════════════════════════════════════════════
   LEVEL 17 — "THE HIDDEN SEAM"
   A large decorative draggable panel fills most of the stage.
   It looks like a grid / texture — purely aesthetic.
   Underneath it, anchored to the bottom-right corner, hides a
   glowing button. Drag the panel far enough away (top-left) to
   expose the corner, then click the button.
   Collision: checks if panel no longer overlaps the button zone.
═══════════════════════════════════════════════════════════════ */
Levels[16] = {
  title: 'THE HIDDEN SEAM',
  mount(stage, done) {
    stage.innerHTML = `
      <!-- Secret button fixed to bottom-right -->
      <button id="l17-secret-btn" class="puzzle-btn">
        FOUND IT
      </button>
      <div id="l17-secret-label">drag the panel away</div>

      <!-- Draggable panel -->
      <div id="l17-panel">
        <div id="l17-grid-pattern"></div>
        <div id="l17-panel-label">
          <span class="tag" style="border-color:var(--muted)">LEVEL 17</span>
          <p style="margin-top:8px;font-size:0.7rem;color:var(--text-dim);letter-spacing:0.1em">
            THE HIDDEN SEAM
          </p>
          <p style="font-size:0.6rem;color:var(--muted);margin-top:4px">
            &#8627; something is underneath
          </p>
        </div>
      </div>
    `;

    const panel   = stage.querySelector('#l17-panel');
    const secret  = stage.querySelector('#l17-secret-btn');
    const label   = stage.querySelector('#l17-secret-label');
    let dragging  = false, sx, sy, ox, oy;
    let revealed  = false;

    panel.addEventListener('mousedown', e => {
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      ox = panel.offsetLeft; oy = panel.offsetTop;
      panel.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      const dx = e.clientX - sx;
      const dy = e.clientY - sy;
      panel.style.left = (ox + dx) + 'px';
      panel.style.top  = (oy + dy) + 'px';
      checkReveal();
    });

    document.addEventListener('mouseup', () => {
      dragging = false;
      panel.style.cursor = 'grab';
    });

    function checkReveal() {
      const pr = panel.getBoundingClientRect();
      const br = secret.getBoundingClientRect();
      // Overlapping if rects intersect
      const overlap = !(pr.right  < br.left  ||
                        pr.left   > br.right ||
                        pr.bottom < br.top   ||
                        pr.top    > br.bottom);
      if (!overlap && !revealed) {
        revealed = true;
        secret.classList.add('l17-revealed');
        label.style.opacity = '0';
      } else if (overlap && revealed) {
        revealed = false;
        secret.classList.remove('l17-revealed');
        label.style.opacity = '1';
      }
    }

    secret.addEventListener('click', () => {
      if (revealed) done();
    });
  },
};

/* ═══════════════════════════════════════════════════════════════
   LEVEL 18 — "SELECT AND SEE"
   A dense paragraph of garbled ASCII noise fills the card.
   Hidden inside: the word RIFT in colour: var(--bg) — invisible.
   Player must select all text (Ctrl+A / Cmd+A) which highlights
   everything and reveals RIFT via CSS ::selection contrast.
   A selectionchange listener detects when RIFT is inside the
   selection range and calls done() with a short delay.
═══════════════════════════════════════════════════════════════ */
Levels[17] = {
  title: 'SELECT AND SEE',
  mount(stage, done) {
    // Build garbled text with hidden word injected at random position
    const ROWS = 12, COLS = 52;
    const chars = '░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αβπΣσµτΦΘΩδ∞φεή';
    function rChar() { return chars[Math.floor(Math.random() * chars.length)]; }

    let rows = [];
    for (let r = 0; r < ROWS; r++) {
      let row = '';
      for (let c = 0; c < COLS; c++) row += rChar();
      rows.push(row);
    }

    // Inject hidden word at row 5, col 22
    const WORD     = 'RIFT';
    const HIDE_ROW = 5, HIDE_COL = 22;
    let target = rows[HIDE_ROW];
    rows[HIDE_ROW] = target.slice(0, HIDE_COL)
      + WORD
      + target.slice(HIDE_COL + WORD.length);

    // Build spans: hidden word gets the bg-colour class
    let html = '';
    rows.forEach((row, ri) => {
      if (ri === HIDE_ROW) {
        html += '<span class="l18-noise">'
          + escHtml(row.slice(0, HIDE_COL)) + '</span>'
          + '<span class="l18-secret" id="l18-secret">' + WORD + '</span>'
          + '<span class="l18-noise">' + escHtml(row.slice(HIDE_COL + WORD.length)) + '</span>'
          + '\n';
      } else {
        html += '<span class="l18-noise">' + escHtml(row) + '</span>\n';
      }
    });

    function escHtml(s) {
      return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    stage.innerHTML = `
      <div class="level-card fade-in" style="max-width:520px">
        <span class="tag">LEVEL 18</span>
        <h2>SELECT AND SEE</h2>
        <p style="margin-bottom:16px">The truth is in the text.<br>You just can't see it.</p>
        <pre id="l18-text" style="user-select:text">${html}</pre>
      </div>
      <div class="level-prompt">&#8627; Select everything. Highlight the invisible.</div>
    `;

    let solved = false;
    document.addEventListener('selectionchange', () => {
      if (solved) return;
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;
      const secretEl = stage.querySelector('#l18-secret');
      if (!secretEl) return;

      // Check if secret element is inside selection
      try {
        const range = sel.getRangeAt(0);
        const cmp   = range.comparePoint(secretEl, 0);
        if (cmp === 0) {   // 0 = inside range
          solved = true;
          secretEl.style.color    = 'var(--accent)';
          secretEl.style.fontSize = '1.1em';
          setTimeout(done, 700);
        }
      } catch(e) {}
    });
  },
};

/* ═══════════════════════════════════════════════════════════════
   LEVEL 19 — "THE RECURSION TRAP"
   A shrunk clone of the PARADOX start screen is embedded inside
   the stage as a self-contained mini-puzzle. It has its own
   fake "start" button and a one-step inner level.
   Solving the inner puzzle (clicking a hidden button inside the
   mini-frame) fires a custom event the outer engine catches.
   The outer level then completes. Two layers of the same UI.
═══════════════════════════════════════════════════════════════ */
Levels[18] = {
  title: 'THE RECURSION TRAP',
  mount(stage, done) {
    stage.innerHTML = `
      <div id="l19-outer-msg" class="fade-in">
        <span class="tag" style="display:block;text-align:center;margin-bottom:12px">LEVEL 19</span>
        <p style="font-size:0.7rem;color:var(--text-dim);letter-spacing:0.08em;text-align:center;margin-bottom:20px">
          You are inside the game.<br>There is a game inside you.
        </p>
      </div>

      <!-- Mini recursed game frame -->
      <div id="l19-frame">
        <div id="l19-inner-hud">
          <span style="font-size:0.55rem;letter-spacing:0.2em;color:var(--text-dim)">INNER LAYER</span>
        </div>
        <div id="l19-inner-stage">
          <div id="l19-inner-start">
            <p style="font-size:0.75rem;letter-spacing:0.1em;margin-bottom:16px">PARADOX <span style="color:var(--accent2)">&#8734;</span></p>
            <button id="l19-inner-start-btn" class="puzzle-btn" style="font-size:0.65rem;padding:8px 20px">
              ENTER
            </button>
          </div>
          <div id="l19-inner-puzzle" style="display:none;width:100%;height:100%;align-items:center;justify-content:center;flex-direction:column;gap:16px">
            <p style="font-size:0.6rem;color:var(--text-dim);letter-spacing:0.08em;text-align:center">
              Find the exit.<br>It matches the background.
            </p>
            <div id="l19-btn-grid"></div>
          </div>
        </div>
      </div>

      <div class="level-prompt">&#8627; Solve the game within the game.</div>
    `;

    // Build inner puzzle: 9 buttons, one invisible (bg colour), rest dim
    const grid    = stage.querySelector('#l19-btn-grid');
    const REAL_I  = 4;
    for (let i = 0; i < 9; i++) {
      const b = document.createElement('button');
      b.className = 'l19-inner-btn';
      b.textContent = '·';
      if (i === REAL_I) {
        b.classList.add('l19-inner-real');
        b.style.color      = 'var(--bg)';        // invisible text
        b.style.background = 'var(--bg)';        // invisible bg
        b.style.border     = '1px solid var(--border)';
      }
      b.addEventListener('click', () => {
        if (i === REAL_I) {
          b.style.background = 'var(--accent)';
          b.style.color      = 'var(--bg)';
          setTimeout(() => {
            // Signal outer level
            stage.dispatchEvent(new CustomEvent('inner-solved'));
          }, 400);
        } else {
          b.style.opacity = '0.2';
          setTimeout(() => b.style.opacity = '', 300);
        }
      });
      grid.appendChild(b);
    }

    // Inner start button → show puzzle
    stage.querySelector('#l19-inner-start-btn').addEventListener('click', () => {
      stage.querySelector('#l19-inner-start').style.display   = 'none';
      const pz = stage.querySelector('#l19-inner-puzzle');
      pz.style.display = 'flex';
    });

    // Outer listens for inner solved
    stage.addEventListener('inner-solved', () => done(), { once: true });
  },
};

/* ═══════════════════════════════════════════════════════════════
   LEVEL 20 — "YOU ARE THE PUZZLE"
   THE FINAL PARADOX.
   Stage is completely blank. One centred line of text.
   Nothing is clickable. Every interaction (mouse, key, scroll)
   resets a 15-second inactivity timer.
   At 10s: first message fades in.
   At 13s: second message.
   At 15s: done() fires — game won by doing NOTHING.
   The hardest instruction: stop trying.
═══════════════════════════════════════════════════════════════ */
Levels[19] = {
  title: 'YOU ARE THE PUZZLE',
  mount(stage, done) {
    stage.innerHTML = `
      <div id="l20-center">
        <p id="l20-line1">The game is already solved.</p>
        <p id="l20-line2"></p>
        <p id="l20-line3"></p>
      </div>
      <div id="l20-timer-bar"><div id="l20-timer-fill"></div></div>
    `;

    const line2 = stage.querySelector('#l20-line2');
    const line3 = stage.querySelector('#l20-line3');
    const fill  = stage.querySelector('#l20-timer-fill');

    const TOTAL  = 15000;
    let start    = Date.now();
    let msg2done = false, msg3done = false;
    let rafId, solved = false;

    function reset() {
      if (solved) return;
      start    = Date.now();
      msg2done = false;
      msg3done = false;
      line2.style.opacity = '0';
      line3.style.opacity = '0';
      line2.textContent   = '';
      line3.textContent   = '';
      fill.style.transition = 'none';
      fill.style.width      = '0%';
    }

    function tick() {
      if (solved) return;
      const elapsed = Date.now() - start;
      const pct     = Math.min(100, (elapsed / TOTAL) * 100);

      fill.style.transition = 'none';
      fill.style.width      = pct + '%';

      // Change colour as time progresses
      const g = Math.floor((pct / 100) * 255);
      fill.style.background = `rgb(${Math.floor(200 * pct/100)}, ${g}, 0)`;

      if (elapsed >= 10000 && !msg2done) {
        msg2done = true;
        line2.textContent   = 'Stop trying.';
        line2.style.opacity = '1';
      }
      if (elapsed >= 13000 && !msg3done) {
        msg3done = true;
        line3.textContent   = 'You already won.';
        line3.style.opacity = '1';
      }
      if (elapsed >= TOTAL) {
        solved = true;
        cancelAnimationFrame(rafId);
        cleanup();
        setTimeout(done, 800);
        return;
      }

      rafId = requestAnimationFrame(tick);
    }

    // Any activity = reset
    const events = ['mousemove','mousedown','keydown','scroll','touchstart','wheel'];
    function onActivity() { reset(); }
    events.forEach(ev => window.addEventListener(ev, onActivity));

    function cleanup() {
      events.forEach(ev => window.removeEventListener(ev, onActivity));
      cancelAnimationFrame(rafId);
    }

    // Start
    rafId = requestAnimationFrame(tick);
  },
};

/* ─────────────────────────────────────────────
   BOOT — Wire up buttons, start engine
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  // Animate start screen elements in
  document.querySelectorAll('.start-content > *').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = `opacity 0.6s ${i * 0.08}s var(--transition), transform 0.6s ${i * 0.08}s var(--transition)`;
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  });

  document.getElementById('start-btn').addEventListener('click', () => {
    const startScreen = document.getElementById('start-screen');
    startScreen.classList.add('exit');
    setTimeout(() => {
      startScreen.classList.remove('active', 'exit');
      Engine.start();
    }, 500);
  });

  document.getElementById('restart-btn').addEventListener('click', () => {
    Engine.restart();
  });

  document.getElementById('play-again-btn').addEventListener('click', () => {
    const endScreen = document.getElementById('end-screen');
    endScreen.classList.remove('active');
    Engine.start();
  });

  // Drop a console hint for Level 09 (planted early for discovery)
  console.log('%c[PARADOX]', 'color:#c8ff00;font-weight:bold;font-size:1.2rem;');
  console.log('%cYou found the machine layer. Remember this place.', 'color:#555;font-size:0.85rem;');
  console.log('%cLevel 09 key will appear here when the time comes.', 'color:#2a2a2a;font-size:0.75rem;');
});
