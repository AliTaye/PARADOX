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

// Stub all levels 6–20 with teaser text
stubLevel(5,  'THE SHRINKING CAGE',   'The walls are closing in. Act fast or start over.');
stubLevel(6,  'HIDDEN IN PLAIN SIGHT','It blends perfectly. Almost.');
stubLevel(7,  'BELOW THE FOLD',       'They told you not to scroll. They lied.');
stubLevel(8,  'READ THE MACHINE',     'The answer isn\'t on the screen. Look elsewhere.');
stubLevel(9,  'REVERSE LOGIC',        '"Do not click this." You know what to do.');
stubLevel(10, 'PERSISTENCE OF VISION','Blink and you\'ll miss it. Literally.');
stubLevel(11, 'THE VIEWPORT VAULT',   'The interface knows your window size.');
stubLevel(12, 'SIGNAL vs. NOISE',     '50 buttons. 1 truth. Good luck.');
stubLevel(13, 'WHAT CASTS THE SHADOW','Click what you see. Or what you don\'t.');
stubLevel(14, 'TABBING THROUGH DARK', 'The lights are off. Your keyboard is a flashlight.');
stubLevel(15, 'CLICKTHROUGH PARADOX', 'The hole in the layer is the door.');
stubLevel(16, 'THE HIDDEN SEAM',      'Drag it. All the way to the corner.');
stubLevel(17, 'SELECT AND SEE',       'Ctrl+A reveals everything. Including lies.');
stubLevel(18, 'THE RECURSION TRAP',   'A game inside a game. Solve both.');
stubLevel(19, 'YOU ARE THE PUZZLE',   'The final answer is doing absolutely nothing.');

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
