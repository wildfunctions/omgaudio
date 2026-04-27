// Preset library — 100+ procedural game sounds.
// Each preset: { name, description, category, patch: { version, name, nodes, output } }

(function () {
  'use strict';

  // helpers to keep the library compact
  const noise = (color) => ({ type: 'noise', params: { color } });
  const tone = (waveform, points, vibratoRate, vibratoDepth) => ({
    type: 'tone',
    params: { waveform, points, vibratoRate: vibratoRate || 0, vibratoDepth: vibratoDepth || 0 },
  });
  const filter = (type, cutoff, q, mod) => ({
    type: 'filter',
    params: {
      type, cutoff, q,
      modEnabled: !!mod,
      modShape: (mod && mod.shape) || 'sharkfin',
      modDur: (mod && mod.dur) || 200,
      modDepth: (mod && mod.depth) || 0,
    },
  });
  const env = (a, h, r) => ({ type: 'envelope', params: { attack: a, hold: h, release: r } });
  const dist = (amount, wet) => ({ type: 'distortion', params: { amount, wet } });
  const dl = (time, feedback, wet) => ({ type: 'delay', params: { time, feedback, wet } });
  const rv = (decay, wet) => ({ type: 'reverb', params: { decay, wet } });
  const ch = (rate, depth, wet) => ({ type: 'chorus', params: { rate, depth, wet } });
  const bc = (bits, bandwidth, wet) => ({ type: 'bitcrusher', params: { bits, bandwidth, wet: wet == null ? 1 : wet } });
  const pp = (time, feedback, wet) => ({ type: 'pingpong', params: { time, feedback, wet } });
  const rvX = (type, decay, wet) => ({ type: 'reverb', params: { type, decay, wet } });
  const fm = (waveform, points, modRatio, modIndex, modDecay) => ({
    type: 'fm', params: { waveform, points, modRatio, modIndex, modDecay },
  });
  // attach randomization to a preset object
  const withRandom = (presetObj, random) => {
    presetObj.patch.random = random;
    return presetObj;
  };

  const _toCats = (c) => Array.isArray(c) ? c.slice() : [c];
  const P = (name, desc, cat, nodes, gain) => ({
    name, description: desc, categories: _toCats(cat),
    patch: { version: 1, name, nodes, output: { gain: gain == null ? 0.4 : gain } },
  });

  // polyphonic patch builder — voices is an array of { gain, nodes }
  const PV = (name, desc, cat, voices, gain) => ({
    name, description: desc, categories: _toCats(cat),
    patch: { version: 2, name, voices, output: { gain: gain == null ? 0.4 : gain } },
  });

  const PRESETS = {

    // ---------------- COMBAT ----------------
    swoosh_heavy: P('Heavy swoosh', 'Slower, deeper swing — two-handed weapon.', 'combat', [
      noise('brown'),
      filter('bandpass', 300, 4, { shape: 'sharkfin', dur: 350, depth: 2000 }),
      env(20, 350, 250),
    ], 0.6),

    swoosh_quick: P('Quick swoosh', 'Light weapon — dagger or whip flick.', 'combat', [
      noise('white'),
      filter('bandpass', 1200, 8, { shape: 'sharkfin', dur: 100, depth: 5000 }),
      env(5, 100, 60),
    ], 0.45),

    laser: P('Laser zap', 'Sawtooth pitch sweep down — sci-fi blaster.', 'combat', [
      tone('sawtooth', [{ t: 0, freq: "D7" }, { t: 220, freq: "G2", ramp: 'exp' }]),
      env(1, 200, 60),
    ], 0.3),

    laser_charged: P('Charged laser', 'Slow charge then release — heavy beam weapon.', 'combat', [
      tone('sawtooth', [{ t: 0, freq: "G3" }, { t: 200, freq: "G5", ramp: 'linear' }, { t: 400, freq: "F#7", ramp: 'linear' }, { t: 600, freq: "B1", ramp: 'exp' }]),
      env(150, 400, 150),
      rv(0.8, 0.3),
    ], 0.35),

    explosion: P('Explosion', 'White-noise burst, lowpass-filtered, with reverb tail.', ['combat', 'impact'], [
      noise('white'),
      filter('lowpass', 4000, 1, { shape: 'ramp-down', dur: 600, depth: -3500 }),
      env(5, 80, 600),
      dist(60, 0.4),
      rv(2.0, 0.4),
    ], 0.5),

    explosion_big: P('Big explosion', 'Massive boom — earth-shaking impact.', ['combat', 'impact'], [
      noise('brown'),
      filter('lowpass', 2000, 1.5, { shape: 'ramp-down', dur: 1200, depth: -1800 }),
      env(8, 200, 1500),
      dist(120, 0.6),
      rv(3.5, 0.5),
    ], 0.6),

    shotgun: P('Shotgun blast', 'Wider, fuller boom than a pistol.', ['combat', 'impact'], [
      noise('white'),
      filter('lowpass', 3000, 1, { shape: 'ramp-down', dur: 250, depth: -2500 }),
      env(2, 60, 250),
      dist(100, 0.6),
      rv(0.8, 0.3),
    ], 0.55),

    machinegun: P('Machine gun', 'Rapid-fire bursts via delay echoes.', 'combat', [
      noise('white'),
      filter('bandpass', 1200, 3),
      env(1, 30, 30),
      dist(60, 0.5),
      dl(80, 0.85, 0.6),
    ], 0.45),

    cannon: P('Cannon shot', 'Deep artillery boom.', ['combat', 'impact'], [
      noise('brown'),
      filter('lowpass', 800, 2, { shape: 'ramp-down', dur: 700, depth: -700 }),
      env(2, 100, 800),
      dist(150, 0.7),
      rv(2.5, 0.4),
    ], 0.6),

    arrow_whoosh: P('Arrow whoosh', 'Short tight whoosh of an arrow in flight.', ['combat', 'movement'], [
      noise('pink'),
      filter('bandpass', 1500, 10, { shape: 'sharkfin', dur: 130, depth: 4000 }),
      env(5, 130, 80),
    ], 0.4),

    arrow_hit: P('Arrow hit', 'Thud of an arrow striking wood.', ['combat', 'impact'], [
      noise('brown'),
      filter('bandpass', 400, 6, { shape: 'ramp-down', dur: 60, depth: 0 }),
      env(1, 20, 90),
    ], 0.5),

    sword_clash: P('Sword clash', 'High metallic ring of two blades meeting.', ['combat', 'impact'], [
      tone('triangle', [{ t: 0, freq: "C#7" }, { t: 30, freq: "E7" }, { t: 60, freq: "A6" }]),
      env(1, 80, 600),
      rv(1.5, 0.4),
    ], 0.4),

    sword_unsheath: P('Sword unsheath', 'Slow metallic scrape — drawing a blade.', 'combat', [
      noise('pink'),
      filter('bandpass', 1500, 12, { shape: 'ramp-up', dur: 350, depth: 3000 }),
      env(20, 350, 200),
    ], 0.4),

    fireball: P('Fireball cast', 'Whoosh of magical fire being thrown.', ['combat', 'magic'], [
      noise('pink'),
      filter('bandpass', 1000, 4, { shape: 'sharkfin', dur: 300, depth: 2500 }),
      env(15, 250, 350),
      dist(50, 0.4),
      rv(1.5, 0.35),
    ], 0.45),

    ice_shard: P('Ice shard', 'Crystalline high-pitched zap.', ['combat', 'magic'], [
      tone('triangle', [{ t: 0, freq: "B7" }, { t: 80, freq: "D#7", ramp: 'linear' }]),
      env(1, 100, 250),
      rv(1.2, 0.5),
    ], 0.35),

    thunder: P('Thunder strike', 'Heavy lightning crack with rumbling tail.', ['combat', 'ambience'], [
      noise('brown'),
      filter('lowpass', 600, 2, { shape: 'ramp-down', dur: 1500, depth: -300 }),
      env(5, 200, 1500),
      dist(80, 0.5),
      rv(3.0, 0.5),
    ], 0.6),

    whip_crack: P('Whip crack', 'Sharp snapping noise.', 'combat', [
      noise('white'),
      filter('highpass', 4000, 8, { shape: 'sharkfin', dur: 60, depth: 2000 }),
      env(1, 30, 60),
      dist(30, 0.4),
    ], 0.45),

    grenade_beep: P('Grenade beep', 'Warning tick of an armed explosive.', 'combat', [
      tone('square', [{ t: 0, freq: "B5" }]),
      env(1, 30, 20),
      dl(180, 0.7, 0.5),
    ], 0.35),

    // ---------------- PICKUP ----------------
    coin: P('Mario coin', 'Two-note square chime (B5 → E6). The "cha-ching!"', 'pickup', [
      tone('square', [{ t: 0, freq: "B5" }, { t: 60, freq: "E6" }]),
      env(1, 200, 50),
    ], 0.3),

    coin_silver: P('Silver coin', 'Lower, fuller coin pickup.', 'pickup', [
      tone('triangle', [{ t: 0, freq: "E5" }, { t: 70, freq: "A5" }]),
      env(1, 220, 80),
      rv(0.6, 0.25),
    ], 0.35),

    ring: P('Sonic ring', 'Two-note bell — high sine pair with reverb.', ['pickup', 'reward'], [
      tone('sine', [{ t: 0, freq: "G6" }, { t: 60, freq: "D7" }]),
      env(1, 180, 220),
      rv(0.8, 0.4),
    ], 0.4),

    powerup: P('Power-up', 'Fast ascending arpeggio — square wave.', ['pickup', 'reward'], [
      tone('square', [
        { t: 0, freq: "C5" }, { t: 60, freq: "E5" }, { t: 120, freq: "G5" },
        { t: 180, freq: "C6" }, { t: 240, freq: "E6" }, { t: 300, freq: "G6" },
      ]),
      env(1, 350, 80),
    ], 0.3),

    one_up: P('1-Up', 'Bouncy major arpeggio — extra life jingle.', ['pickup', 'reward', 'game-state'], [
      tone('square', [
        { t: 0, freq: "G5" }, { t: 100, freq: "C6" }, { t: 200, freq: "E6" }, { t: 300, freq: "G6" },
        { t: 400, freq: "D6" }, { t: 500, freq: "G6" },
      ]),
      env(1, 600, 200),
    ], 0.3),

    gem_chime: P('Gem chime', 'Sparkling crystalline pickup.', ['pickup', 'reward'], [
      tone('sine', [{ t: 0, freq: "C7" }, { t: 50, freq: "G7" }, { t: 100, freq: "C8" }]),
      env(1, 200, 400),
      rv(1.5, 0.5),
    ], 0.3),

    key_pickup: P('Key pickup', 'Short metallic ting.', 'pickup', [
      tone('triangle', [{ t: 0, freq: "A6" }, { t: 40, freq: "D7" }]),
      env(1, 100, 350),
      rv(1.2, 0.4),
    ], 0.35),

    health_pickup: P('Health pickup', 'Three-note ascending chime — refreshing.', ['pickup', 'magic'], [
      tone('sine', [{ t: 0, freq: "A5" }, { t: 100, freq: "D6" }, { t: 200, freq: "G6" }]),
      env(1, 320, 250),
      rv(0.8, 0.35),
    ], 0.35),

    score_chime: P('Score chime', 'Quick high ping.', ['pickup', 'reward'], [
      tone('sine', [{ t: 0, freq: "E7" }]),
      env(1, 150, 200),
      rv(0.8, 0.3),
    ], 0.3),

    bonus_star: P('Bonus star', 'Twinkle-twinkle glimmer.', ['pickup', 'reward'], [
      tone('sine', [
        { t: 0, freq: "B6" }, { t: 60, freq: "D#7" }, { t: 120, freq: "F#7" }, { t: 180, freq: "D#7" },
        { t: 240, freq: "F#7" }, { t: 300, freq: "A7" },
      ], 8, 30),
      env(1, 350, 300),
      rv(1.5, 0.45),
    ], 0.3),

    magic_orb: P('Magic orb pickup', 'Mystical absorbing tone.', ['magic', 'pickup'], [
      tone('sine', [{ t: 0, freq: "E5" }, { t: 250, freq: "E6", ramp: 'linear' }]),
      env(20, 250, 400),
      ch(2.5, 0.005, 0.6),
      rv(1.5, 0.5),
    ], 0.4),

    treasure: P('Treasure pickup', 'Triumphant short chime.', ['pickup', 'reward'], [
      tone('triangle', [{ t: 0, freq: "C6" }, { t: 80, freq: "E6" }, { t: 160, freq: "G6" }, { t: 240, freq: "C7" }]),
      env(1, 350, 400),
      rv(1.5, 0.4),
    ], 0.35),

    // ---------------- MOVEMENT ----------------
    jump: P('Mario jump', 'Square wave with rapid upward pitch sweep.', 'movement', [
      tone('square', [{ t: 0, freq: "A3" }, { t: 130, freq: "C#6", ramp: 'linear' }]),
      env(1, 130, 30),
    ], 0.35),

    double_jump: P('Double jump', 'Two short pitch jumps in succession.', 'movement', [
      tone('square', [
        { t: 0, freq: "A3" }, { t: 100, freq: "A5", ramp: 'linear' },
        { t: 130, freq: "A4" }, { t: 230, freq: "E6", ramp: 'linear' },
      ]),
      env(1, 240, 40),
    ], 0.35),

    footstep: P('Footstep', 'Brown-noise thud — boot on dirt.', ['footstep', 'movement'], [
      noise('brown'),
      filter('lowpass', 800, 2),
      env(2, 30, 80),
    ], 0.5),

    footstep_grass: P('Footstep grass', 'Soft swishy step.', ['footstep', 'movement'], [
      noise('white'),
      filter('highpass', 2500, 4),
      env(3, 40, 100),
    ], 0.3),

    footstep_metal: P('Footstep metal', 'Clanky boot on metal floor.', ['footstep', 'movement'], [
      noise('white'),
      filter('bandpass', 2200, 12, { shape: 'ramp-down', dur: 80, depth: -200 }),
      env(1, 30, 200),
      rv(0.5, 0.3),
    ], 0.4),

    footstep_water: P('Footstep water', 'Wet splashy step.', ['footstep', 'movement'], [
      noise('white'),
      filter('lowpass', 2000, 1.5, { shape: 'ramp-down', dur: 100, depth: -1500 }),
      env(2, 40, 150),
    ], 0.4),

    pacman: P('Pacman waka', 'Square-wave alternating low/high — "waka waka".', ['movement', 'chiptune'], [
      tone('square', [{ t: 0, freq: "B3" }, { t: 60, freq: "B4" }, { t: 120, freq: "B3" }, { t: 180, freq: "B4" }]),
      filter('bandpass', 600, 4),
      env(1, 230, 20),
    ], 0.35),

    dash: P('Dash', 'Quick whoosh of accelerated movement.', 'movement', [
      noise('pink'),
      filter('highpass', 1000, 4, { shape: 'sharkfin', dur: 150, depth: 3000 }),
      env(5, 130, 80),
    ], 0.4),

    teleport: P('Teleport', 'High-frequency sweep with reverb.', ['magic', 'movement'], [
      tone('sine', [{ t: 0, freq: "G3" }, { t: 200, freq: "B7", ramp: 'exp' }]),
      env(20, 200, 300),
      rv(1.5, 0.5),
    ], 0.3),

    portal: P('Portal whoosh', 'Long swirling vortex.', ['magic', 'movement'], [
      noise('pink'),
      filter('bandpass', 800, 4, { shape: 'triangle', dur: 800, depth: 2500 }),
      env(80, 700, 400),
      ch(1.5, 0.008, 0.5),
      rv(2.5, 0.5),
    ], 0.35),

    splash: P('Splash', 'Water splash on impact.', ['movement', 'ambience'], [
      noise('white'),
      filter('lowpass', 3000, 1, { shape: 'ramp-down', dur: 250, depth: -2500 }),
      env(2, 50, 280),
      rv(0.6, 0.3),
    ], 0.45),

    bubble: P('Bubble', 'Underwater rising bubble pop.', ['movement', 'ambience'], [
      tone('sine', [{ t: 0, freq: "G4" }, { t: 100, freq: "F#6", ramp: 'exp' }]),
      env(5, 100, 80),
    ], 0.3),

    landing_thud: P('Landing thud', 'Heavy boot impact on landing.', ['movement', 'impact'], [
      noise('brown'),
      filter('lowpass', 300, 2, { shape: 'ramp-down', dur: 200, depth: -100 }),
      env(2, 80, 250),
      dist(40, 0.3),
    ], 0.55),

    slide: P('Slide', 'Skidding stop on floor.', 'movement', [
      noise('pink'),
      filter('bandpass', 2000, 6, { shape: 'ramp-down', dur: 400, depth: -1000 }),
      env(20, 350, 200),
    ], 0.35),

    fall_whistle: P('Falling whistle', 'Descending pitch — falling into a hole.', ['movement', 'ui'], [
      tone('sine', [{ t: 0, freq: "F#6" }, { t: 600, freq: "G2", ramp: 'exp' }]),
      env(20, 600, 100),
    ], 0.3),

    // ---------------- REWARD ----------------
    secret: P('Zelda secret jingle', '6-note arpeggio for puzzle solved / item found.', 'reward', [
      tone('triangle', [
        { t: 0, freq: "G5" }, { t: 90, freq: "F#5" }, { t: 180, freq: "D#5" },
        { t: 270, freq: "A4" }, { t: 360, freq: "A#4" }, { t: 450, freq: "E5" },
      ]),
      env(5, 540, 250),
      rv(1.2, 0.3),
    ], 0.4),

    chest: P('Zelda chest open', 'Ascending triumphant arpeggio with reverb.', ['reward', 'pickup'], [
      tone('triangle', [
        { t: 0, freq: "D5" }, { t: 180, freq: "G5" }, { t: 360, freq: "B5" }, { t: 540, freq: "D6" },
      ]),
      env(5, 1200, 700),
      rv(2.5, 0.45),
    ], 0.35),

    level_complete: P('Level complete', 'Bouncy victory fanfare.', ['reward', 'game-state'], [
      tone('square', [
        { t: 0, freq: "C5" }, { t: 100, freq: "E5" }, { t: 200, freq: "G5" }, { t: 300, freq: "C6" },
        { t: 400, freq: "A5" }, { t: 500, freq: "C6" }, { t: 600, freq: "E6" }, { t: 750, freq: "G6" },
      ]),
      env(1, 900, 400),
      rv(0.8, 0.25),
    ], 0.35),

    achievement: P('Achievement unlocked', 'Two-tone bell with reverb.', 'reward', [
      tone('sine', [{ t: 0, freq: "E6" }, { t: 250, freq: "A6" }]),
      env(1, 500, 600),
      rv(1.5, 0.45),
    ], 0.4),

    victory: P('Victory fanfare', 'Long ascending major arpeggio.', ['reward', 'game-state'], [
      tone('triangle', [
        { t: 0, freq: "C5" }, { t: 200, freq: "E5" }, { t: 400, freq: "G5" },
        { t: 600, freq: "C6" }, { t: 1000, freq: "G6" },
      ]),
      env(5, 1500, 800),
      rv(2.0, 0.4),
    ], 0.4),

    quest_complete: P('Quest complete', 'Triumphant 5-note resolution.', 'reward', [
      tone('triangle', [
        { t: 0, freq: "E5" }, { t: 150, freq: "G5" }, { t: 300, freq: "B5" },
        { t: 450, freq: "E6" }, { t: 700, freq: "C6" },
      ]),
      env(5, 1100, 600),
      rv(1.8, 0.4),
    ], 0.4),

    save_game: P('Save game', 'Short ascending double note.', 'reward', [
      tone('sine', [{ t: 0, freq: "A5" }, { t: 100, freq: "E6" }]),
      env(1, 250, 300),
      rv(0.8, 0.3),
    ], 0.35),

    combo_chime: P('Combo chime', 'Quick brilliant chime.', 'reward', [
      tone('sine', [{ t: 0, freq: "G6" }, { t: 50, freq: "C7" }, { t: 100, freq: "E7" }]),
      env(1, 250, 250),
      rv(1.0, 0.4),
    ], 0.3),

    new_record: P('New record', 'Triumph fanfare with celebration.', ['reward', 'game-state'], [
      tone('square', [
        { t: 0, freq: "G5" }, { t: 100, freq: "B5" }, { t: 200, freq: "D6" },
        { t: 300, freq: "B5" }, { t: 400, freq: "G6" },
      ]),
      env(1, 700, 500),
      rv(1.5, 0.4),
    ], 0.35),

    perfect: P('Perfect!', 'Major triad upward.', 'reward', [
      tone('sine', [{ t: 0, freq: "C5" }, { t: 80, freq: "E5" }, { t: 160, freq: "G5" }, { t: 240, freq: "C6" }]),
      env(1, 400, 400),
      rv(1.0, 0.35),
    ], 0.35),

    // ---------------- UI ----------------
    uiclick: P('UI click', 'Tiny bandpass tick — menu / button feedback.', 'ui', [
      noise('white'),
      filter('bandpass', 3000, 12),
      env(1, 5, 25),
    ], 0.5),

    menu_hover: P('Menu hover', 'Subtle high tick.', 'ui', [
      tone('sine', [{ t: 0, freq: "B6" }]),
      env(1, 20, 60),
    ], 0.2),

    menu_select: P('Menu select', 'Confirming click + ping.', 'ui', [
      tone('sine', [{ t: 0, freq: "G6" }, { t: 30, freq: "C7" }]),
      env(1, 80, 120),
    ], 0.3),

    error_buzz: P('Error buzz', 'Distorted low buzz — invalid action.', 'ui', [
      tone('square', [{ t: 0, freq: "G3" }, { t: 80, freq: "F#3" }]),
      env(1, 150, 50),
      dist(80, 0.5),
    ], 0.3),

    notification: P('Notification', 'Pleasant ping with reverb.', 'ui', [
      tone('sine', [{ t: 0, freq: "A6" }, { t: 80, freq: "D7" }]),
      env(1, 200, 350),
      rv(1.0, 0.4),
    ], 0.3),

    pause_open: P('Pause menu', 'Quick descending pair.', 'ui', [
      tone('sine', [{ t: 0, freq: "A5" }, { t: 80, freq: "E5" }]),
      env(1, 150, 100),
    ], 0.3),

    countdown_tick: P('Countdown tick', 'Sharp short beep.', ['ui', 'game-state'], [
      tone('square', [{ t: 0, freq: "B5" }]),
      env(1, 80, 30),
    ], 0.3),

    countdown_go: P('Countdown go', 'Rising "go!" tone.', ['ui', 'game-state'], [
      tone('square', [{ t: 0, freq: "B5" }, { t: 200, freq: "F#6", ramp: 'linear' }]),
      env(1, 250, 150),
    ], 0.35),

    type_tick: P('Typewriter tick', 'Tiny letter-typed click.', 'ui', [
      noise('white'),
      filter('bandpass', 4000, 14),
      env(1, 2, 10),
    ], 0.4),

    cancel: P('Cancel', 'Descending two-note rejection.', 'ui', [
      tone('square', [{ t: 0, freq: "E5" }, { t: 80, freq: "A4" }]),
      env(1, 150, 80),
    ], 0.3),

    popup: P('Popup', 'Quick rising pop.', 'ui', [
      tone('sine', [{ t: 0, freq: "G5" }, { t: 80, freq: "G6", ramp: 'linear' }]),
      env(1, 100, 100),
    ], 0.3),

    alert: P('Alert', 'Two-tone alarm.', ['ui', 'game-state'], [
      tone('square', [{ t: 0, freq: "A5" }, { t: 100, freq: "E5" }, { t: 200, freq: "A5" }, { t: 300, freq: "E5" }]),
      env(1, 400, 50),
    ], 0.35),

    error_low: P('Low error', 'Single low buzz.', 'ui', [
      tone('square', [{ t: 0, freq: "A2" }]),
      env(2, 250, 100),
      dist(40, 0.4),
    ], 0.3),

    blip: P('Blip', 'Generic short UI blip.', 'ui', [
      tone('square', [{ t: 0, freq: "F#6" }]),
      env(1, 30, 20),
    ], 0.3),

    // ---------------- AMBIENCE ----------------
    wind: P('Wind howl', 'Long airy gust.', 'ambience', [
      noise('pink'),
      filter('bandpass', 600, 4, { shape: 'triangle', dur: 2000, depth: 800 }),
      env(300, 1500, 800),
    ], 0.35),

    rain: P('Rain', 'Steady high-frequency hiss.', 'ambience', [
      noise('white'),
      filter('highpass', 4000, 1.5),
      env(200, 2000, 500),
    ], 0.3),

    water_drip: P('Water drip', 'Single droplet pinging in a cave.', 'ambience', [
      tone('sine', [{ t: 0, freq: "G5" }, { t: 30, freq: "G6" }]),
      env(1, 60, 250),
      rv(2.0, 0.6),
    ], 0.35),

    heartbeat: P('Heartbeat', 'Two low thumps — lub-dub.', ['ambience', 'creature'], [
      tone('sine', [{ t: 0, freq: "B1" }, { t: 80, freq: "G1" }, { t: 200, freq: "B1" }, { t: 280, freq: "G1" }]),
      env(20, 400, 100),
      dist(40, 0.4),
    ], 0.55),

    breathing: P('Breathing', 'Slow inhale-exhale with filtered noise.', ['ambience', 'creature'], [
      noise('pink'),
      filter('bandpass', 500, 3, { shape: 'triangle', dur: 1500, depth: 600 }),
      env(300, 1300, 500),
    ], 0.3),

    door_slam: P('Door slam', 'Heavy wooden thud.', ['ambience', 'impact'], [
      noise('brown'),
      filter('lowpass', 400, 2, { shape: 'ramp-down', dur: 200, depth: -100 }),
      env(1, 80, 250),
      rv(1.0, 0.35),
    ], 0.5),

    machine_hum: P('Machine hum', 'Low industrial drone.', 'ambience', [
      tone('sawtooth', [{ t: 0, freq: "G2" }]),
      filter('lowpass', 600, 2),
      env(100, 2000, 500),
    ], 0.25),

    electric_hum: P('Electric hum', '60Hz mains buzz.', 'ambience', [
      tone('sawtooth', [{ t: 0, freq: "B1" }], 5, 1),
      filter('lowpass', 800, 4),
      env(50, 1500, 500),
      dist(20, 0.3),
    ], 0.25),

    cricket: P('Cricket chirp', 'Short repetitive chirps.', ['ambience', 'creature'], [
      tone('triangle', [{ t: 0, freq: "C#8" }, { t: 30, freq: "C#8" }]),
      env(1, 30, 30),
      dl(80, 0.6, 0.7),
    ], 0.25),

    bird_chirp: P('Bird chirp', 'Quick rising tweet.', ['ambience', 'creature'], [
      tone('sine', [{ t: 0, freq: "C#7" }, { t: 50, freq: "A7", ramp: 'linear' }, { t: 80, freq: "F7" }]),
      env(1, 100, 80),
    ], 0.3),

    insect_buzz: P('Insect buzz', 'Sustained high-frequency drone.', ['ambience', 'creature'], [
      tone('sawtooth', [{ t: 0, freq: "G3" }], 12, 30),
      filter('bandpass', 800, 6),
      env(50, 1500, 200),
    ], 0.2),

    wave_lap: P('Wave lap', 'Soft beach wash.', 'ambience', [
      noise('pink'),
      filter('lowpass', 1500, 1.5, { shape: 'triangle', dur: 1800, depth: 1000 }),
      env(300, 1500, 700),
    ], 0.35),

    // ---------------- VEHICLE ----------------
    rocket: P('Rocket launch', 'Massive sustained roar.', ['vehicle', 'impact', 'combat'], [
      noise('white'),
      filter('lowpass', 1500, 1.5),
      env(200, 1800, 800),
      dist(80, 0.6),
      rv(2.0, 0.4),
    ], 0.5),

    jetpack: P('Jetpack', 'Continuous propulsion hiss.', 'vehicle', [
      noise('pink'),
      filter('bandpass', 1500, 3),
      env(50, 1200, 300),
      dist(30, 0.3),
    ], 0.35),

    spaceship_engine: P('Spaceship engine', 'Sci-fi cruising drone.', 'vehicle', [
      tone('sawtooth', [{ t: 0, freq: "B1" }], 0.5, 2),
      filter('lowpass', 800, 4),
      env(100, 1500, 500),
      ch(0.4, 0.01, 0.6),
    ], 0.3),

    // ---------------- CREATURE ----------------
    monster_growl: P('Monster growl', 'Low rumbling creature voice.', ['creature', 'ambience'], [
      tone('sawtooth', [{ t: 0, freq: "D#2" }, { t: 400, freq: "B1", ramp: 'linear' }, { t: 800, freq: "F#2" }], 8, 8),
      filter('lowpass', 500, 4),
      env(50, 700, 300),
      dist(120, 0.6),
    ], 0.5),

    dragon_roar: P('Dragon roar', 'Massive predatory bellow.', ['creature', 'combat'], [
      tone('sawtooth', [{ t: 0, freq: "B1" }, { t: 600, freq: "B2", ramp: 'linear' }, { t: 1200, freq: "G1" }], 5, 12),
      filter('lowpass', 700, 2),
      env(50, 1300, 600),
      dist(150, 0.7),
      rv(1.5, 0.4),
    ], 0.55),

    zombie_groan: P('Zombie groan', 'Slow undead moan.', ['creature', 'ambience'], [
      tone('triangle', [{ t: 0, freq: "A2" }, { t: 600, freq: "F#2", ramp: 'linear' }], 3, 5),
      filter('lowpass', 600, 5),
      env(80, 700, 400),
      dist(50, 0.5),
    ], 0.4),

    bee_buzz: P('Bee buzz', 'Rapid wing flutter.', ['creature', 'ambience'], [
      tone('sawtooth', [{ t: 0, freq: "A3" }], 25, 30),
      filter('bandpass', 1000, 4),
      env(20, 600, 100),
    ], 0.25),

    frog_ribbit: P('Frog ribbit', 'Two-pulse croak.', ['creature', 'ambience'], [
      tone('sawtooth', [{ t: 0, freq: "G3" }, { t: 80, freq: "B2" }, { t: 160, freq: "G3" }, { t: 240, freq: "B2" }]),
      filter('lowpass', 600, 6),
      env(2, 250, 50),
      dist(60, 0.5),
    ], 0.4),

    bird_squawk: P('Bird squawk', 'Loud pterodactyl-like cry.', ['creature'], [
      tone('sawtooth', [{ t: 0, freq: "D5" }, { t: 200, freq: "D6", ramp: 'linear' }, { t: 400, freq: "G4" }]),
      filter('bandpass', 1500, 4),
      env(2, 400, 100),
      dist(40, 0.4),
    ], 0.4),

    alien_speak: P('Alien speak', 'Modulated incomprehensible chatter.', ['creature'], [
      tone('square', [
        { t: 0, freq: "A4" }, { t: 80, freq: "E5" }, { t: 160, freq: "E4" },
        { t: 240, freq: "C#5" }, { t: 320, freq: "A5" }, { t: 400, freq: "A3" },
      ], 12, 20),
      filter('bandpass', 1500, 6),
      env(10, 450, 150),
      ch(3, 0.005, 0.5),
    ], 0.35),

    evil_laugh: P('Evil laugh', 'Menacing villain cackle.', ['creature', 'magic'], [
      tone('sawtooth', [
        { t: 0, freq: "F#3" }, { t: 100, freq: "A3" }, { t: 200, freq: "F#3" }, { t: 300, freq: "B3" },
        { t: 400, freq: "G3" }, { t: 500, freq: "C#4" }, { t: 600, freq: "D#3" },
      ], 4, 15),
      filter('lowpass', 1000, 3),
      env(20, 700, 300),
      dist(80, 0.5),
      rv(1.5, 0.35),
    ], 0.4),

    wolf_howl: P('Wolf howl', 'Long mournful cry.', ['creature', 'ambience'], [
      tone('sawtooth', [{ t: 0, freq: "A3" }, { t: 600, freq: "A4", ramp: 'linear' }, { t: 1500, freq: "E4" }], 4, 3),
      filter('bandpass', 800, 6),
      env(100, 1400, 500),
      rv(2.5, 0.5),
    ], 0.4),

    // ---------------- MAGIC ----------------
    spell_cast: P('Spell cast', 'Building incantation whoosh.', ['magic'], [
      noise('pink'),
      filter('bandpass', 600, 6, { shape: 'ramp-up', dur: 600, depth: 3500 }),
      env(50, 600, 300),
      ch(2, 0.005, 0.4),
      rv(1.5, 0.4),
    ], 0.35),

    heal_sparkle: P('Heal sparkle', 'Glittering ascending arpeggio.', ['magic', 'pickup'], [
      tone('sine', [
        { t: 0, freq: "G6" }, { t: 80, freq: "C7" }, { t: 160, freq: "E7" },
        { t: 240, freq: "G7" }, { t: 320, freq: "C8" },
      ]),
      env(1, 500, 600),
      rv(2.0, 0.5),
    ], 0.3),

    mana_refill: P('Mana refill', 'Quick rising sparkle.', ['magic', 'pickup'], [
      tone('triangle', [
        { t: 0, freq: "A5" }, { t: 80, freq: "D6" }, { t: 160, freq: "G6" }, { t: 240, freq: "C7" },
      ]),
      env(1, 350, 350),
      rv(1.2, 0.4),
    ], 0.35),

    magic_charge: P('Magic charge-up', 'Building energy hum.', ['magic'], [
      tone('sawtooth', [{ t: 0, freq: "G2" }, { t: 1000, freq: "G5", ramp: 'exp' }]),
      filter('lowpass', 1500, 6),
      env(50, 1000, 200),
      ch(2, 0.005, 0.5),
      rv(1.5, 0.4),
    ], 0.35),

    zap: P('Magic zap', 'Quick electric high-frequency hit.', ['magic', 'combat'], [
      tone('sawtooth', [{ t: 0, freq: "F#7" }, { t: 100, freq: "G5", ramp: 'exp' }]),
      env(1, 100, 100),
      dist(80, 0.5),
      rv(0.8, 0.4),
    ], 0.3),

    enchant: P('Enchant', 'Shimmering sustained tone.', ['magic'], [
      tone('sine', [{ t: 0, freq: "A5" }, { t: 800, freq: "D6", ramp: 'linear' }], 6, 12),
      env(100, 1000, 500),
      ch(1, 0.008, 0.6),
      rv(2.0, 0.5),
    ], 0.35),

    curse: P('Curse', 'Descending menacing tone.', ['magic'], [
      tone('sawtooth', [{ t: 0, freq: "G5" }, { t: 800, freq: "D#2", ramp: 'exp' }]),
      filter('lowpass', 1500, 4),
      env(20, 800, 400),
      dist(100, 0.6),
      rv(1.5, 0.5),
    ], 0.4),

    dispel: P('Dispel', 'Sparkling release of magic.', ['magic'], [
      noise('white'),
      filter('highpass', 3000, 6, { shape: 'ramp-down', dur: 400, depth: 2000 }),
      env(2, 350, 400),
      rv(1.5, 0.5),
    ], 0.3),

    portal_open: P('Portal open', 'Massive rising vortex.', ['magic', 'movement'], [
      noise('pink'),
      filter('bandpass', 200, 4, { shape: 'ramp-up', dur: 1500, depth: 4000 }),
      env(100, 1500, 800),
      ch(1.5, 0.01, 0.6),
      rv(3.0, 0.6),
    ], 0.4),

    summon: P('Summon', 'Building tone with reverb.', ['magic'], [
      tone('triangle', [{ t: 0, freq: "A3" }, { t: 1000, freq: "A5", ramp: 'linear' }]),
      env(50, 1200, 800),
      ch(2, 0.006, 0.5),
      rv(2.5, 0.5),
    ], 0.35),

    shield_up: P('Shield up', 'Protective magic aura.', ['magic'], [
      tone('sine', [{ t: 0, freq: "A4" }, { t: 300, freq: "E5", ramp: 'linear' }]),
      env(20, 400, 400),
      ch(2, 0.005, 0.5),
      rv(1.5, 0.5),
    ], 0.35),

    fire_spell: P('Fire spell', 'Crackling fiery burst.', ['magic', 'combat'], [
      noise('white'),
      filter('bandpass', 1500, 3, { shape: 'sharkfin', dur: 400, depth: -800 }),
      env(10, 400, 500),
      dist(80, 0.5),
      rv(1.2, 0.4),
    ], 0.4),

    // ---------------- GAME-STATE ----------------
    game_over: P('Game over', 'Descending sad melody.', 'game-state', [
      tone('square', [
        { t: 0, freq: "C5" }, { t: 200, freq: "B4" }, { t: 400, freq: "A4" },
        { t: 600, freq: "G4" }, { t: 800, freq: "E4" },
      ]),
      env(1, 1000, 500),
      rv(0.8, 0.3),
    ], 0.35),

    win_fanfare: P('Win fanfare', 'Triumphant major arpeggio.', ['reward', 'game-state'], [
      tone('square', [
        { t: 0, freq: "C5" }, { t: 100, freq: "E5" }, { t: 200, freq: "G5" }, { t: 300, freq: "C6" },
        { t: 500, freq: "G5" }, { t: 600, freq: "C6" },
      ]),
      env(1, 800, 400),
      rv(1.5, 0.35),
    ], 0.4),

    respawn: P('Respawn', 'Quick warp-in chime.', 'game-state', [
      tone('sine', [{ t: 0, freq: "G3" }, { t: 200, freq: "F#6", ramp: 'exp' }]),
      env(1, 200, 250),
      rv(1.0, 0.4),
    ], 0.35),

    spawn_warp: P('Spawn warp', 'Sci-fi materialization.', ['game-state', 'magic'], [
      noise('white'),
      filter('bandpass', 200, 6, { shape: 'ramp-up', dur: 500, depth: 4000 }),
      env(2, 500, 200),
      rv(1.2, 0.45),
    ], 0.35),

    death: P('Death', 'Pitch falls and cuts out.', ['game-state', 'creature'], [
      tone('square', [{ t: 0, freq: "A5" }, { t: 600, freq: "G1", ramp: 'exp' }]),
      env(1, 600, 200),
    ], 0.35),

    high_score: P('High score', 'Celebratory ascending chime.', ['reward', 'game-state'], [
      tone('sine', [
        { t: 0, freq: "C6" }, { t: 100, freq: "E6" }, { t: 200, freq: "G6" }, { t: 300, freq: "C7" },
        { t: 400, freq: "G6" }, { t: 500, freq: "E7" },
      ]),
      env(1, 700, 500),
      rv(1.5, 0.4),
    ], 0.35),

    continue_screen: P('Continue?', 'Suspenseful alternating beeps.', ['game-state', 'ui'], [
      tone('square', [
        { t: 0, freq: "E5" }, { t: 200, freq: "A5" }, { t: 400, freq: "E5" }, { t: 600, freq: "A5" },
      ]),
      env(1, 800, 100),
    ], 0.3),

    boss_intro: P('Boss intro', 'Heavy power chord stinger.', ['game-state', 'creature'], [
      tone('sawtooth', [{ t: 0, freq: "C2" }], 0.5, 1),
      filter('lowpass', 800, 4),
      env(2, 800, 400),
      dist(100, 0.6),
      rv(1.5, 0.4),
    ], 0.45),

    insert_coin: P('Insert coin', 'Arcade attract chime.', 'game-state', [
      tone('square', [
        { t: 0, freq: "C6" }, { t: 100, freq: "G5" }, { t: 200, freq: "C6" }, { t: 300, freq: "E6" },
      ]),
      env(1, 400, 200),
    ], 0.3),

    game_start: P('Game start', 'Energetic kick-off jingle.', 'game-state', [
      tone('square', [
        { t: 0, freq: "C5" }, { t: 80, freq: "E5" }, { t: 160, freq: "G5" },
        { t: 240, freq: "C6" }, { t: 320, freq: "E6" },
      ]),
      env(1, 450, 200),
      rv(0.8, 0.3),
    ], 0.35),

    low_health: P('Low health alarm', 'Repeating warning ping.', ['game-state', 'ui'], [
      tone('sine', [{ t: 0, freq: "A6" }]),
      env(1, 80, 60),
      dl(180, 0.7, 0.6),
    ], 0.3),

    timer_warning: P('Timer warning', 'Fast urgent ticks.', ['game-state', 'ui'], [
      tone('square', [{ t: 0, freq: "A5" }]),
      env(1, 30, 20),
      dl(150, 0.85, 0.7),
    ], 0.3),

    pause_zelda: P('Zelda pause', 'Iconic short pause sound.', ['game-state', 'ui'], [
      tone('square', [{ t: 0, freq: "A5" }]),
      env(1, 60, 60),
    ], 0.3),

    // ---------------- CHIPTUNE (bitcrusher-flavored) ----------------
    chip_jump: P('Chip jump', '4-bit-crushed Mario-style jump.', ['chiptune', 'movement'], [
      tone('square', [{ t: 0, freq: "A3" }, { t: 130, freq: "C#6", ramp: 'linear' }]),
      env(1, 130, 30),
      bc(3, 4000, 1),
    ], 0.35),

    chip_coin: P('Chip coin', 'Lo-fi pickup chime.', ['chiptune', 'pickup'], [
      tone('square', [{ t: 0, freq: "B5" }, { t: 60, freq: "E6" }]),
      env(1, 200, 50),
      bc(4, 5000, 1),
    ], 0.3),

    chip_explosion: P('Chip explosion', '8-bit boom — Atari-style.', ['chiptune', 'combat', 'impact'], [
      noise('white'),
      filter('lowpass', 2000, 1.2, { shape: 'ramp-down', dur: 400, depth: -1500 }),
      env(2, 80, 400),
      bc(3, 3000, 1),
    ], 0.45),

    chip_laser: P('Chip laser', 'Crunchy retro blaster.', ['chiptune', 'combat'], [
      tone('square', [{ t: 0, freq: "A6" }, { t: 200, freq: "G2", ramp: 'exp' }]),
      env(1, 200, 60),
      bc(3, 4000, 1),
    ], 0.3),

    chip_powerup: P('Chip powerup', 'Crunchy ascending arpeggio.', ['chiptune', 'pickup', 'reward'], [
      tone('square', [
        { t: 0, freq: "C5" }, { t: 60, freq: "E5" }, { t: 120, freq: "G5" },
        { t: 180, freq: "C6" }, { t: 240, freq: "E6" }, { t: 300, freq: "G6" },
      ]),
      env(1, 350, 80),
      bc(4, 5000, 1),
    ], 0.3),

    chip_death: P('Chip death', 'NES death descend.', ['chiptune', 'game-state'], [
      tone('square', [
        { t: 0, freq: "A5" }, { t: 80, freq: "B5" }, { t: 160, freq: "E5" },
        { t: 320, freq: "A4" }, { t: 480, freq: "A3" }, { t: 700, freq: "A2" },
      ]),
      env(1, 800, 200),
      bc(3, 3500, 1),
    ], 0.3),

    chip_select: P('Chip select', 'Lo-fi menu confirm.', ['chiptune', 'ui'], [
      tone('square', [{ t: 0, freq: "G6" }, { t: 30, freq: "C7" }]),
      env(1, 80, 50),
      bc(3, 5000, 1),
    ], 0.3),

    gameboy_blip: P('Game Boy blip', 'Tiny lo-fi square pulse.', ['chiptune', 'ui'], [
      tone('square', [{ t: 0, freq: "E6" }]),
      env(1, 30, 20),
      bc(2, 3500, 1),
    ], 0.3),

    chip_kick: P('Chip kick', '8-bit drum kick — sine pitch drop.', ['chiptune', 'drums'], [
      tone('sine', [{ t: 0, freq: "G3" }, { t: 80, freq: "G1", ramp: 'exp' }]),
      env(1, 80, 50),
      bc(4, 1500, 1),
    ], 0.5),

    chip_snare: P('Chip snare', 'Lo-fi noise hit.', ['chiptune', 'drums'], [
      noise('white'),
      filter('highpass', 1500, 4),
      env(1, 30, 80),
      bc(3, 4000, 1),
    ], 0.4),

    chip_hihat: P('Chip hi-hat', 'Tiny crunchy noise tick.', ['chiptune', 'drums'], [
      noise('white'),
      filter('highpass', 6000, 2),
      env(1, 5, 40),
      bc(3, 8000, 1),
    ], 0.3),

    chip_arpeggio: P('Chip arpeggio', 'Fast looping melodic line.', ['chiptune', 'music'], [
      tone('square', [
        { t: 0, freq: "C5" }, { t: 60, freq: "E5" }, { t: 120, freq: "G5" },
        { t: 180, freq: "C6" }, { t: 240, freq: "G5" }, { t: 300, freq: "E5" },
        { t: 360, freq: "C5" }, { t: 420, freq: "E5" }, { t: 480, freq: "G5" },
      ]),
      env(1, 540, 80),
      bc(4, 5000, 1),
    ], 0.3),

    broken_radio: P('Broken radio', 'Heavily crushed white noise wash.', ['chiptune', 'ambience'], [
      noise('white'),
      filter('bandpass', 1500, 4, { shape: 'triangle', dur: 800, depth: 600 }),
      env(50, 700, 200),
      bc(2, 2500, 1),
    ], 0.3),

    rom_corrupt: P('ROM corrupt', 'Glitchy data-error stutter.', ['chiptune', 'game-state'], [
      tone('sawtooth', [
        { t: 0, freq: "A4" }, { t: 30, freq: "C#7" }, { t: 60, freq: "A3" },
        { t: 90, freq: "G#7" }, { t: 120, freq: "A2" }, { t: 150, freq: "C#8" },
      ]),
      env(1, 200, 80),
      bc(2, 3000, 1),
      dl(60, 0.7, 0.5),
    ], 0.3),

    arcade_credit: P('Arcade credit', 'Coin-drop chime.', ['chiptune', 'game-state'], [
      tone('square', [{ t: 0, freq: "G6" }, { t: 80, freq: "E6" }, { t: 160, freq: "C6" }, { t: 240, freq: "G6" }]),
      env(1, 350, 100),
      bc(4, 6000, 1),
    ], 0.3),

    // ---------------- AMBIENT PADS (polyphonic) ----------------
    pad_major: PV('Major pad', '3-voice C major triad with chorus.', ['pad', 'music'], [
      { gain: 0.6, nodes: [tone('triangle', [{ t: 0, freq: "C4" }]), env(80, 1500, 800), ch(1.5, 0.005, 0.5)] },
      { gain: 0.5, nodes: [tone('triangle', [{ t: 0, freq: "E4" }]), env(100, 1500, 800), ch(1.5, 0.005, 0.5)] },
      { gain: 0.5, nodes: [tone('triangle', [{ t: 0, freq: "G4" }]), env(120, 1500, 800), ch(1.5, 0.005, 0.5)] },
    ], 0.45),

    pad_minor: PV('Minor pad', 'Brooding minor triad pad.', ['pad', 'music'], [
      { gain: 0.6, nodes: [tone('triangle', [{ t: 0, freq: "A3" }]), env(80, 1500, 1000), ch(1.5, 0.005, 0.5)] },
      { gain: 0.5, nodes: [tone('triangle', [{ t: 0, freq: "C4" }]), env(100, 1500, 1000), ch(1.5, 0.005, 0.5)] },
      { gain: 0.5, nodes: [tone('triangle', [{ t: 0, freq: "E4" }]), env(120, 1500, 1000), ch(1.5, 0.005, 0.5)] },
    ], 0.45),

    pad_sus: PV('Sus pad', 'Suspended chord — uneasy openness.', ['pad', 'music'], [
      { gain: 0.6, nodes: [tone('triangle', [{ t: 0, freq: "C4" }]), env(80, 1500, 1000), ch(1.5, 0.005, 0.5)] },
      { gain: 0.5, nodes: [tone('triangle', [{ t: 0, freq: "F4" }]), env(100, 1500, 1000), ch(1.5, 0.005, 0.5)] },
      { gain: 0.5, nodes: [tone('triangle', [{ t: 0, freq: "G4" }]), env(120, 1500, 1000), ch(1.5, 0.005, 0.5)] },
    ], 0.45),

    pad_drone: PV('Detuned drone', '5-voice slightly detuned saw — endless drift.', ['pad', 'ambience'], [
      { gain: 0.4, nodes: [tone('sawtooth', [{ t: 0, freq: "A2" }]), env(200, 2000, 1500), filter('lowpass', 1200, 2)] },
      { gain: 0.4, nodes: [tone('sawtooth', [{ t: 0, freq: "A2" }]), env(200, 2000, 1500), filter('lowpass', 1200, 2)] },
      { gain: 0.4, nodes: [tone('sawtooth', [{ t: 0, freq: "A2" }]), env(200, 2000, 1500), filter('lowpass', 1200, 2)] },
      { gain: 0.4, nodes: [tone('sawtooth', [{ t: 0, freq: "A3" }]), env(200, 2000, 1500), filter('lowpass', 1500, 2)] },
      { gain: 0.4, nodes: [tone('sawtooth', [{ t: 0, freq: "A3" }]), env(200, 2000, 1500), filter('lowpass', 1500, 2)] },
    ], 0.35),

    pad_choir: PV('Choir pad', 'Triangle voices through hall reverb.', ['pad', 'ambience', 'magic'], [
      { gain: 0.5, nodes: [tone('triangle', [{ t: 0, freq: "C4" }], 4, 4), env(150, 2000, 1500), ch(2, 0.008, 0.6), rvX('hall', 3.0, 0.5)] },
      { gain: 0.5, nodes: [tone('triangle', [{ t: 0, freq: "G4" }], 4, 4), env(180, 2000, 1500), ch(2, 0.008, 0.6), rvX('hall', 3.0, 0.5)] },
      { gain: 0.5, nodes: [tone('triangle', [{ t: 0, freq: "C5" }], 4, 4), env(200, 2000, 1500), ch(2, 0.008, 0.6), rvX('hall', 3.0, 0.5)] },
    ], 0.45),

    pad_horror: PV('Horror drone', 'Dissonant low cluster.', ['pad', 'ambience'], [
      { gain: 0.5, nodes: [tone('sawtooth', [{ t: 0, freq: "A1" }], 0.3, 1), env(200, 3000, 1500), filter('lowpass', 600, 4)] },
      { gain: 0.4, nodes: [tone('sawtooth', [{ t: 0, freq: "A#1" }], 0.3, 1), env(200, 3000, 1500), filter('lowpass', 600, 4)] },
      { gain: 0.3, nodes: [tone('sawtooth', [{ t: 0, freq: "F#2" }], 0.3, 1), env(200, 3000, 1500), filter('lowpass', 700, 4)] },
    ], 0.35),

    pad_scifi: PV('Sci-fi drone', 'Spaceship engine room ambience.', ['pad', 'ambience'], [
      { gain: 0.5, nodes: [tone('sawtooth', [{ t: 0, freq: "C#2" }], 0.3, 2), env(200, 2500, 1000), filter('lowpass', 800, 3)] },
      { gain: 0.4, nodes: [tone('sawtooth', [{ t: 0, freq: "G#2" }], 0.3, 2), env(200, 2500, 1000), filter('lowpass', 1000, 3)] },
      { gain: 0.3, nodes: [tone('triangle', [{ t: 0, freq: "F#6" }], 8, 30), env(300, 2500, 1000), ch(3, 0.005, 0.5)] },
    ], 0.4),

    pad_mystic: PV('Mystic pad', 'Shimmering ethereal triad.', ['pad', 'magic'], [
      { gain: 0.4, nodes: [tone('sine', [{ t: 0, freq: "C5" }]), env(150, 2000, 1500), ch(2, 0.005, 0.6), rvX('cathedral', 3.5, 0.6)] },
      { gain: 0.4, nodes: [tone('sine', [{ t: 0, freq: "E5" }]), env(180, 2000, 1500), ch(2, 0.005, 0.6), rvX('cathedral', 3.5, 0.6)] },
      { gain: 0.4, nodes: [tone('sine', [{ t: 0, freq: "G5" }]), env(200, 2000, 1500), ch(2, 0.005, 0.6), rvX('cathedral', 3.5, 0.6)] },
    ], 0.4),

    organ_chord: PV('Organ chord', 'Stacked square waves — power chord stab.', ['pad', 'music'], [
      { gain: 0.5, nodes: [tone('square', [{ t: 0, freq: "C3" }]), env(5, 800, 200)] },
      { gain: 0.5, nodes: [tone('square', [{ t: 0, freq: "G3" }]), env(5, 800, 200)] },
      { gain: 0.5, nodes: [tone('square', [{ t: 0, freq: "C4" }]), env(5, 800, 200)] },
    ], 0.35),

    // ---------------- LAYERED IMPACTS (polyphonic) ----------------
    mega_explosion: PV('Mega explosion', 'Sub + body + crackle layered impact.', ['impact', 'combat'], [
      { gain: 0.7, nodes: [tone('sine', [{ t: 0, freq: "D#2" }, { t: 800, freq: "B0", ramp: 'exp' }]), env(2, 200, 800), dist(60, 0.5)] },
      { gain: 0.6, nodes: [noise('brown'), filter('lowpass', 1500, 1.5, { shape: 'ramp-down', dur: 800, depth: -1200 }), env(5, 150, 800), dist(80, 0.5), rvX('hall', 2.5, 0.4)] },
      { gain: 0.4, nodes: [noise('white'), filter('highpass', 3000, 4), env(2, 60, 200), dist(40, 0.4)] },
    ], 0.5),

    thunder_clap: PV('Thunder clap', 'Sub-bass rumble + mid crack + high sizzle.', ['impact', 'ambience', 'combat'], [
      { gain: 0.6, nodes: [noise('brown'), filter('lowpass', 200, 2), env(20, 300, 1500), rvX('cathedral', 3.5, 0.5)] },
      { gain: 0.5, nodes: [noise('white'), filter('bandpass', 800, 4, { shape: 'ramp-down', dur: 200, depth: -400 }), env(2, 100, 600), dist(80, 0.5)] },
      { gain: 0.3, nodes: [noise('white'), filter('highpass', 4000, 4), env(2, 40, 300)] },
    ], 0.55),

    meteor_impact: PV('Meteor impact', 'Massive deep thud + rocky scatter.', ['impact', 'combat'], [
      { gain: 0.7, nodes: [tone('sine', [{ t: 0, freq: "B1" }, { t: 600, freq: "G0", ramp: 'exp' }]), env(2, 150, 800), dist(100, 0.6)] },
      { gain: 0.5, nodes: [noise('brown'), filter('lowpass', 600, 2), env(2, 200, 1000), dist(60, 0.4), rvX('cathedral', 3.0, 0.5)] },
      { gain: 0.3, nodes: [noise('pink'), filter('bandpass', 2000, 4), env(20, 400, 600)] },
    ], 0.55),

    metal_collision: PV('Metal collision', 'Iron clang + ringing harmonics.', ['impact'], [
      { gain: 0.6, nodes: [noise('white'), filter('bandpass', 1200, 12, { shape: 'ramp-down', dur: 100, depth: -200 }), env(1, 40, 600), rvX('plate', 1.5, 0.5)] },
      { gain: 0.5, nodes: [tone('triangle', [{ t: 0, freq: "A6" }, { t: 50, freq: "D7" }, { t: 100, freq: "F#6" }]), env(1, 100, 800), rvX('plate', 1.5, 0.5)] },
      { gain: 0.4, nodes: [tone('sine', [{ t: 0, freq: "C#8" }]), env(1, 80, 600), rvX('plate', 1.5, 0.5)] },
    ], 0.45),

    pile_drive: PV('Pile drive', 'Heavy machine slam.', ['impact'], [
      { gain: 0.7, nodes: [tone('sine', [{ t: 0, freq: "G2" }, { t: 200, freq: "D#1", ramp: 'exp' }]), env(2, 100, 400), dist(80, 0.5)] },
      { gain: 0.5, nodes: [noise('brown'), filter('lowpass', 800, 2), env(1, 80, 400), dist(60, 0.4), rvX('room', 1.0, 0.4)] },
    ], 0.55),

    giant_step: PV('Giant footstep', 'Earth-shaking footfall.', ['footstep', 'impact', 'movement'], [
      { gain: 0.7, nodes: [tone('sine', [{ t: 0, freq: "C#2" }, { t: 300, freq: "B0", ramp: 'exp' }]), env(2, 150, 600), dist(40, 0.4)] },
      { gain: 0.5, nodes: [noise('brown'), filter('lowpass', 400, 2), env(2, 100, 500), dist(60, 0.4), rvX('cathedral', 2.5, 0.4)] },
    ], 0.55),

    volcano_erupt: PV('Volcano erupt', 'Long sub rumble + lava spit.', ['impact', 'ambience'], [
      { gain: 0.7, nodes: [tone('sine', [{ t: 0, freq: "D#1" }], 3, 8), env(200, 3000, 1500), dist(60, 0.5)] },
      { gain: 0.5, nodes: [noise('brown'), filter('lowpass', 600, 2), env(150, 3000, 1500), dist(80, 0.5)] },
      { gain: 0.3, nodes: [noise('white'), filter('bandpass', 2500, 4), env(100, 2500, 1500)] },
    ], 0.5),

    crash_glass: PV('Glass shatter', 'Bright high splinter sound.', ['impact'], [
      { gain: 0.5, nodes: [noise('white'), filter('highpass', 3000, 6, { shape: 'ramp-down', dur: 300, depth: 2000 }), env(1, 80, 400), rvX('plate', 1.2, 0.4)] },
      { gain: 0.4, nodes: [tone('triangle', [{ t: 0, freq: "B7" }, { t: 80, freq: "A7" }, { t: 160, freq: "F8" }]), env(1, 200, 500), rvX('plate', 1.2, 0.4)] },
    ], 0.4),

    // ---------------- MOVING (ping-pong) ----------------
    swoosh_pass: P('Sword swoosh (passing-by)', 'Stereo swoosh that flies past.', 'moving', [
      noise('pink'),
      filter('bandpass', 600, 6, { shape: 'sharkfin', dur: 220, depth: 3500 }),
      env(15, 220, 160),
      pp(80, 0.5, 0.6),
    ], 0.4),

    arrow_pass: P('Arrow flyby', 'Whistling arrow with stereo movement.', ['moving', 'combat'], [
      noise('pink'),
      filter('bandpass', 1500, 10, { shape: 'sharkfin', dur: 130, depth: 4000 }),
      env(5, 130, 80),
      pp(60, 0.55, 0.5),
    ], 0.35),

    ufo_pass: P('UFO flyby', 'Wobbly sci-fi craft passing overhead.', 'moving', [
      tone('sawtooth', [{ t: 0, freq: "D5" }, { t: 800, freq: "G3", ramp: 'linear' }], 6, 60),
      filter('bandpass', 1500, 4),
      env(50, 800, 400),
      pp(150, 0.55, 0.6),
      rvX('hall', 1.5, 0.3),
    ], 0.35),

    bullet_pass: P('Bullet whizz-by', 'Tight whoosh past your ear.', ['moving', 'combat'], [
      noise('white'),
      filter('bandpass', 2500, 12, { shape: 'sharkfin', dur: 80, depth: 3000 }),
      env(1, 60, 50),
      pp(40, 0.5, 0.6),
    ], 0.35),

    drone_pass: P('Drone overhead', 'Buzzing drone moving across.', 'moving', [
      tone('sawtooth', [{ t: 0, freq: "B3" }], 30, 30),
      filter('bandpass', 1200, 4),
      env(100, 800, 300),
      pp(180, 0.5, 0.55),
    ], 0.3),

    ricochet: P('Ricochet', 'Bouncing bullet with stereo bounces.', ['moving', 'combat'], [
      tone('triangle', [{ t: 0, freq: "C#7" }, { t: 80, freq: "F#6", ramp: 'exp' }]),
      env(1, 80, 200),
      pp(110, 0.7, 0.7),
    ], 0.35),

    teleport_stereo: P('Teleport (stereo)', 'Materialization with swirling echoes.', ['magic', 'movement'], [
      tone('sine', [{ t: 0, freq: "G3" }, { t: 200, freq: "B7", ramp: 'exp' }]),
      env(20, 200, 300),
      pp(90, 0.7, 0.6),
      rvX('cathedral', 2.0, 0.4),
    ], 0.3),

    // ---------------- DRUMS ----------------
    kick_808: PV('808 kick', 'Sub-bass drum hit with click.', ['drums', 'impact'], [
      { gain: 0.8, nodes: [tone('sine', [{ t: 0, freq: "D#2" }, { t: 100, freq: "D#1", ramp: 'exp' }]), env(1, 80, 200), dist(40, 0.4)] },
      { gain: 0.3, nodes: [noise('white'), filter('highpass', 4000, 2), env(1, 5, 20)] },
    ], 0.55),

    snare_classic: PV('Classic snare', 'Tone body + noise crack.', ['drums', 'impact'], [
      { gain: 0.5, nodes: [tone('triangle', [{ t: 0, freq: "G3" }, { t: 50, freq: "D3", ramp: 'exp' }]), env(1, 50, 80)] },
      { gain: 0.7, nodes: [noise('white'), filter('highpass', 1500, 2), env(1, 30, 120), dist(30, 0.3)] },
    ], 0.5),

    hihat_closed: P('Hi-hat closed', 'Tight high-frequency tick.', 'drums', [
      noise('white'),
      filter('highpass', 7000, 2),
      env(1, 5, 30),
    ], 0.35),

    hihat_open: P('Hi-hat open', 'Sustained sizzle.', 'drums', [
      noise('white'),
      filter('highpass', 6000, 2),
      env(1, 5, 250),
    ], 0.3),

    tom_low: PV('Low tom', 'Deep drum with body.', ['drums', 'impact'], [
      { gain: 0.7, nodes: [tone('sine', [{ t: 0, freq: "B2" }, { t: 200, freq: "B1", ramp: 'exp' }]), env(1, 100, 250), dist(20, 0.3)] },
      { gain: 0.2, nodes: [noise('pink'), filter('lowpass', 800, 2), env(1, 30, 100)] },
    ], 0.5),

    tom_high: PV('High tom', 'Bright drum with rebound.', ['drums', 'impact'], [
      { gain: 0.6, nodes: [tone('sine', [{ t: 0, freq: "B3" }, { t: 200, freq: "C3", ramp: 'exp' }]), env(1, 100, 250), dist(20, 0.3)] },
      { gain: 0.2, nodes: [noise('pink'), filter('lowpass', 1200, 2), env(1, 30, 100)] },
    ], 0.5),

    clap: P('Hand clap', 'Short noise burst with reverb.', 'drums', [
      noise('white'),
      filter('bandpass', 1500, 4),
      env(1, 30, 80),
      rvX('room', 0.4, 0.4),
    ], 0.45),

    crash_cymbal: P('Crash cymbal', 'Bright shimmering crash.', ['drums', 'impact'], [
      noise('white'),
      filter('highpass', 3000, 2),
      env(1, 80, 1500),
      rvX('plate', 2.0, 0.3),
    ], 0.4),

    ride_cymbal: P('Ride cymbal', 'Sustained metallic shimmer.', 'drums', [
      noise('white'),
      filter('bandpass', 5000, 4),
      env(1, 100, 600),
      rvX('plate', 1.5, 0.3),
    ], 0.3),

    shaker: P('Shaker', 'Quick noise pulse.', 'drums', [
      noise('white'),
      filter('highpass', 5000, 2),
      env(2, 30, 60),
    ], 0.3),

    woodblock: P('Woodblock', 'Sharp wooden tick.', ['drums', 'ui'], [
      tone('triangle', [{ t: 0, freq: "D6" }, { t: 30, freq: "G5", ramp: 'exp' }]),
      env(1, 30, 80),
    ], 0.4),

    rim_shot: PV('Rim shot', 'Snare with high tone snap.', ['drums', 'impact'], [
      { gain: 0.4, nodes: [tone('triangle', [{ t: 0, freq: "G5" }, { t: 30, freq: "D5", ramp: 'exp' }]), env(1, 30, 60)] },
      { gain: 0.5, nodes: [noise('white'), filter('highpass', 3000, 2), env(1, 10, 60)] },
    ], 0.4),

    // ---------------- IR-flavored variants of existing ----------------
    chest_cathedral: P('Chest open (cathedral)', 'Triumph in a vast stone chamber.', ['reward', 'pickup'], [
      tone('triangle', [
        { t: 0, freq: "D5" }, { t: 180, freq: "G5" }, { t: 360, freq: "B5" }, { t: 540, freq: "D6" },
      ]),
      env(5, 1200, 700),
      rvX('cathedral', 4.0, 0.55),
    ], 0.35),

    secret_hall: P('Secret jingle (hall)', 'Discovery in a wide hall.', 'reward', [
      tone('triangle', [
        { t: 0, freq: "G5" }, { t: 90, freq: "F#5" }, { t: 180, freq: "D#5" },
        { t: 270, freq: "A4" }, { t: 360, freq: "A#4" }, { t: 450, freq: "E5" },
      ]),
      env(5, 540, 250),
      rvX('hall', 2.5, 0.45),
    ], 0.4),

    footstep_tunnel: P('Footstep (tunnel)', 'Boot in a long echoing corridor.', ['footstep', 'movement', 'ambience'], [
      noise('brown'),
      filter('lowpass', 800, 2),
      env(2, 30, 80),
      rvX('tunnel', 2.0, 0.55),
    ], 0.45),

    spell_chamber: P('Spell (stone chamber)', 'Magic cast in a small reverberant room.', ['magic'], [
      noise('pink'),
      filter('bandpass', 600, 6, { shape: 'ramp-up', dur: 600, depth: 3500 }),
      env(50, 600, 300),
      rvX('room', 1.2, 0.55),
    ], 0.35),

    sword_clash_plate: P('Sword clash (plate)', 'Metallic ring through plate reverb.', ['combat', 'impact'], [
      tone('triangle', [{ t: 0, freq: "C#7" }, { t: 30, freq: "E7" }, { t: 60, freq: "A6" }]),
      env(1, 80, 600),
      rvX('plate', 2.0, 0.5),
    ], 0.4),

    drip_cathedral: P('Water drip (cathedral)', 'Single droplet in a vast space.', 'ambience', [
      tone('sine', [{ t: 0, freq: "G5" }, { t: 30, freq: "G6" }]),
      env(1, 60, 250),
      rvX('cathedral', 4.5, 0.7),
    ], 0.35),

    // ---------------- FM SYNTHESIS ----------------
    fm_bell: P('FM bell', 'Classic ringing bell with metallic shimmer.', ['fm', 'pickup', 'reward'], [
      fm('sine', [{ t: 0, freq: "A5" }], 1.4, 6, 1500),
      env(1, 1500, 800),
      rvX('hall', 2.0, 0.4),
    ], 0.35),

    fm_bell_low: P('Tubular bell', 'Deep church bell.', ['fm', 'reward'], [
      fm('sine', [{ t: 0, freq: "A3" }], 1.4, 8, 2500),
      env(1, 2500, 1500),
      rvX('cathedral', 4.0, 0.5),
    ], 0.4),

    fm_epiano: P('Electric piano', 'DX7-style electric piano.', ['fm', 'music'], [
      fm('sine', [{ t: 0, freq: "A4" }], 14, 3, 200),
      env(1, 600, 400),
      rvX('room', 1.0, 0.25),
    ], 0.35),

    fm_brass: P('FM brass', 'Synthetic brass stab.', ['fm', 'music'], [
      fm('sawtooth', [{ t: 0, freq: "A3" }], 1, 4, 80),
      env(15, 400, 200),
    ], 0.35),

    fm_bass: P('FM bass', 'Punchy synth bass.', ['fm', 'music'], [
      fm('sine', [{ t: 0, freq: "A2" }], 0.5, 4, 100),
      env(1, 400, 100),
      dist(20, 0.3),
    ], 0.5),

    fm_dx_bass: P('Lately bass', 'Iconic DX7 bass — hollow & punchy.', ['fm', 'music'], [
      fm('sine', [{ t: 0, freq: "A2" }], 1, 6, 150),
      env(1, 500, 200),
    ], 0.4),

    fm_glass: P('Glass tone', 'Pure crystal harmonic.', ['fm', 'ambience'], [
      fm('sine', [{ t: 0, freq: "A6" }], 3.5, 4, 1500),
      env(1, 1500, 800),
      rvX('plate', 2.0, 0.4),
    ], 0.3),

    fm_water: P('Water droplet', 'Single droplet plink.', ['fm', 'ambience'], [
      fm('sine', [{ t: 0, freq: "D6" }, { t: 100, freq: "D7", ramp: 'exp' }], 7, 6, 100),
      env(1, 150, 250),
      rvX('cathedral', 3.0, 0.5),
    ], 0.3),

    fm_marimba: P('Marimba', 'Wooden mallet on tuned bar.', ['fm', 'music'], [
      fm('sine', [{ t: 0, freq: "C5" }], 4, 6, 80),
      env(1, 200, 250),
    ], 0.35),

    fm_kalimba: P('Kalimba', 'Thumb piano pluck.', ['fm', 'music'], [
      fm('sine', [{ t: 0, freq: "A5" }], 5, 4, 60),
      env(1, 250, 300),
      rvX('room', 0.8, 0.3),
    ], 0.3),

    fm_gong: P('Gong', 'Massive metallic crash with long ring.', ['fm', 'reward', 'ambience'], [
      fm('sine', [{ t: 0, freq: "A2" }], 1.4, 12, 3500),
      env(1, 3500, 2000),
      rvX('cathedral', 5.0, 0.5),
    ], 0.4),

    fm_chime: P('Chime', 'High bright bell tone.', ['fm', 'pickup', 'reward'], [
      fm('sine', [{ t: 0, freq: "G6" }], 2.1, 5, 1200),
      env(1, 1200, 600),
      rvX('hall', 2.0, 0.4),
    ], 0.3),

    fm_clang: P('Metallic clang', 'Inharmonic metal hit.', ['fm', 'impact'], [
      fm('sine', [{ t: 0, freq: "A4" }], 2.7, 8, 600),
      env(1, 600, 400),
      rvX('plate', 1.5, 0.45),
    ], 0.4),

    fm_pluck: P('FM pluck string', 'Plucked synthetic string.', ['fm', 'music'], [
      fm('sine', [{ t: 0, freq: "E4" }], 1, 5, 200),
      env(1, 400, 250),
    ], 0.4),

    fm_celesta: P('Celesta', 'Sweet bell-like keyboard.', ['fm', 'music'], [
      fm('sine', [{ t: 0, freq: "E6" }], 2, 3, 600),
      env(1, 600, 400),
      rvX('hall', 1.5, 0.35),
    ], 0.3),

    fm_vibraphone: P('Vibraphone', 'Mallet on metal bars with vibrato.', ['fm', 'music'], [
      fm('sine', [{ t: 0, freq: "E5" }], 3, 4, 1000),
      env(1, 1200, 800),
      ch(5, 0.003, 0.4),
      rvX('room', 1.2, 0.3),
    ], 0.3),

    fm_organ: P('FM organ', 'Bright synth organ tone.', ['fm', 'music'], [
      fm('sine', [{ t: 0, freq: "A3" }], 2, 3, 50),
      env(20, 600, 200),
      ch(0.5, 0.005, 0.4),
    ], 0.35),

    fm_bell_tower: PV('Bell tower', 'Three overlapping bells in a cathedral.', ['fm', 'ambience'], [
      { gain: 0.5, nodes: [fm('sine', [{ t: 0, freq: "A3" }], 1.4, 8, 3000), env(1, 3000, 2000), rvX('cathedral', 5.0, 0.5)] },
      { gain: 0.4, nodes: [fm('sine', [{ t: 200, freq: "E4" }], 1.4, 7, 2800), env(1, 3000, 2000), rvX('cathedral', 5.0, 0.5)] },
      { gain: 0.3, nodes: [fm('sine', [{ t: 500, freq: "A4" }], 1.4, 6, 2500), env(1, 3000, 2000), rvX('cathedral', 5.0, 0.5)] },
    ], 0.4),

    fm_music_box: P('Music box', 'Tiny mechanical chime.', ['fm', 'music'], [
      fm('sine', [
        { t: 0, freq: "G6" }, { t: 200, freq: "C7" }, { t: 400, freq: "E7" },
        { t: 600, freq: "C7" }, { t: 800, freq: "G6" },
      ], 4, 4, 250),
      env(1, 1100, 400),
      rvX('room', 1.0, 0.3),
    ], 0.3),

    fm_alarm: P('FM alarm', 'Synthetic alarm horn.', ['fm', 'ui', 'game-state'], [
      fm('sawtooth', [{ t: 0, freq: "E5" }, { t: 100, freq: "A5" }, { t: 200, freq: "E5" }, { t: 300, freq: "A5" }], 1, 6, 50),
      env(1, 400, 100),
      dist(40, 0.4),
    ], 0.35),

    fm_pad: PV('FM pad', 'Lush evolving pad with FM bell layer.', ['fm', 'pad'], [
      { gain: 0.5, nodes: [fm('sine', [{ t: 0, freq: "C4" }], 2, 2, 800), env(150, 2500, 1500), ch(2, 0.005, 0.5)] },
      { gain: 0.4, nodes: [fm('sine', [{ t: 0, freq: "G4" }], 2, 2, 800), env(180, 2500, 1500), ch(2, 0.005, 0.5)] },
      { gain: 0.3, nodes: [fm('sine', [{ t: 0, freq: "C5" }], 2.1, 3, 1200), env(200, 2500, 1500), rvX('hall', 2.5, 0.4)] },
    ], 0.4),

    // ---------------- HUMANIZED (per-trigger random) ----------------
    footstep_humanized: withRandom(P('Footstep (humanized)', 'Each play slightly different — natural footfall.', ['footstep', 'movement'], [
      noise('brown'),
      filter('lowpass', 800, 2),
      env(2, 30, 80),
    ], 0.5), { pitch: 0, time: 0.15, filter: 0.2, gain: 0.15 }),

    footstep_grass_human: withRandom(P('Footstep grass (humanized)', 'Natural-feeling grass crunches.', ['footstep', 'movement'], [
      noise('white'),
      filter('highpass', 2500, 4),
      env(3, 40, 100),
    ], 0.3), { pitch: 0, time: 0.2, filter: 0.25, gain: 0.2 }),

    coin_random: withRandom(P('Coin (varied pickup)', 'Slight pitch variation per pickup.', 'pickup', [
      tone('square', [{ t: 0, freq: "B5" }, { t: 60, freq: "E6" }]),
      env(1, 200, 50),
    ], 0.3), { pitch: 0.03, time: 0.1, filter: 0, gain: 0.1 }),

    hihat_humanized: withRandom(P('Hi-hat (humanized)', 'Natural-feeling hat pattern variation.', 'drums', [
      noise('white'),
      filter('highpass', 7000, 2),
      env(1, 5, 30),
    ], 0.35), { pitch: 0, time: 0.2, filter: 0.15, gain: 0.25 }),

    swoosh_humanized: withRandom(P('Swoosh (humanized)', 'Each swing slightly different.', 'combat', [
      noise('pink'),
      filter('bandpass', 600, 6, { shape: 'sharkfin', dur: 220, depth: 3500 }),
      env(15, 220, 160),
    ], 0.5), { pitch: 0, time: 0.1, filter: 0.15, gain: 0.1 }),

    arrow_humanized: withRandom(P('Arrow whoosh (humanized)', 'Different bow draw / release each time.', 'combat', [
      noise('pink'),
      filter('bandpass', 1500, 10, { shape: 'sharkfin', dur: 130, depth: 4000 }),
      env(5, 130, 80),
    ], 0.4), { pitch: 0, time: 0.15, filter: 0.2, gain: 0.15 }),

    rain_drips: withRandom(P('Rain drips (varied)', 'Random droplet timing and pitch.', 'ambience', [
      tone('sine', [{ t: 0, freq: "G5" }, { t: 30, freq: "G6" }]),
      env(1, 60, 250),
      rvX('cathedral', 2.5, 0.5),
    ], 0.35), { pitch: 0.15, time: 0.2, filter: 0, gain: 0.2 }),

    crackle_random: withRandom(P('Fire crackle (random)', 'Natural crackle variation.', 'ambience', [
      noise('white'),
      filter('bandpass', 2500, 12, { shape: 'sharkfin', dur: 60, depth: -1500 }),
      env(1, 20, 80),
    ], 0.4), { pitch: 0, time: 0.3, filter: 0.3, gain: 0.3 }),

    // ---------------- WAVE 3: MORE FM ----------------
    fm_pluck_bass: P('FM pluck bass', 'Short staccato bass pluck.', ['fm', 'music'], [
      fm('sine', [{ t: 0, freq: 'A2' }], 1, 4, 80),
      env(1, 150, 80),
    ], 0.5),

    fm_acid_bass: P('Acid bass', '303-flavored squelch.', ['fm', 'music'], [
      fm('sawtooth', [{ t: 0, freq: 'A2' }], 1, 8, 60),
      filter('lowpass', 800, 14, { shape: 'sharkfin', dur: 250, depth: 2500 }),
      env(1, 250, 80),
      dist(40, 0.4),
    ], 0.4),

    fm_clarinet: P('FM clarinet', 'Soft hollow woodwind.', ['fm', 'music'], [
      fm('sine', [{ t: 0, freq: 'D4' }], 3, 2, 50),
      env(40, 800, 200),
      ch(0.5, 0.003, 0.3),
      rvX('room', 1.0, 0.25),
    ], 0.35),

    fm_flute: PV('FM flute', 'Pure tone with breathy noise layer.', ['fm', 'music'], [
      { gain: 0.7, nodes: [fm('sine', [{ t: 0, freq: 'A4' }], 1, 1, 50), env(60, 800, 250)] },
      { gain: 0.15, nodes: [noise('pink'), filter('bandpass', 2000, 4), env(80, 800, 250)] },
    ], 0.4),

    fm_horn: P('FM horn', 'Synth brass with slow attack.', ['fm', 'music'], [
      fm('sawtooth', [{ t: 0, freq: 'A2' }], 1, 5, 100),
      env(60, 800, 300),
      rvX('hall', 1.5, 0.3),
    ], 0.4),

    fm_steel_drum: P('Steel drum', 'Caribbean tuned-metal hit.', ['fm', 'music'], [
      fm('sine', [{ t: 0, freq: 'C5' }], 2.7, 6, 400),
      env(1, 600, 400),
      rvX('plate', 1.5, 0.4),
    ], 0.35),

    fm_synth_lead: P('Synth lead', 'Bright cutting solo lead.', ['fm', 'music'], [
      fm('sawtooth', [{ t: 0, freq: 'A4' }], 1, 4, 200),
      env(10, 600, 200),
      ch(2, 0.005, 0.5),
      rvX('hall', 1.0, 0.3),
    ], 0.35),

    fm_xylophone: P('Xylophone', 'Bright wooden mallet.', ['fm', 'music'], [
      fm('sine', [{ t: 0, freq: 'C6' }], 6, 5, 60),
      env(1, 200, 250),
      rvX('room', 0.8, 0.3),
    ], 0.3),

    fm_organ_perc: P('Percussive organ', 'Fast-attack organ stab.', ['fm', 'music'], [
      fm('sine', [{ t: 0, freq: 'C4' }], 2, 5, 80),
      env(1, 500, 200),
    ], 0.35),

    telephone_ring: P('Telephone ring', 'Classic two-tone phone bell.', ['fm', 'ui'], [
      fm('sine', [{ t: 0, freq: 'A4' }, { t: 50, freq: 'B4' }, { t: 100, freq: 'A4' }, { t: 150, freq: 'B4' }], 1, 2, 50),
      filter('bandpass', 1200, 6),
      env(1, 1200, 80),
      dl(120, 0.5, 0.5),
    ], 0.3),

    alarm_clock: P('Alarm clock', 'Buzzy mechanical alarm.', ['fm', 'ui'], [
      fm('square', [{ t: 0, freq: 'F#5' }], 1.05, 3, 100),
      env(1, 800, 80),
      dist(50, 0.4),
      dl(150, 0.6, 0.6),
    ], 0.3),

    fm_warm_pad: PV('Warm FM pad', 'Lush slow-attack pad.', ['fm', 'pad'], [
      { gain: 0.5, nodes: [fm('sine', [{ t: 0, freq: 'C3' }], 0.5, 1, 1000), env(200, 2500, 1500), ch(2, 0.005, 0.6)] },
      { gain: 0.5, nodes: [fm('sine', [{ t: 0, freq: 'G3' }], 0.5, 1, 1000), env(220, 2500, 1500), ch(2, 0.005, 0.6)] },
      { gain: 0.5, nodes: [fm('sine', [{ t: 0, freq: 'C4' }], 0.5, 1, 1000), env(240, 2500, 1500), ch(2, 0.005, 0.6), rvX('hall', 2.0, 0.4)] },
    ], 0.4),

    // ---------------- WAVE 3: POLYPHONIC STACKS ----------------
    lightning_strike: PV('Lightning strike', 'Sub thud + broadband crack + bright flash.', ['impact', 'ambience', 'combat'], [
      { gain: 0.7, nodes: [tone('sine', [{ t: 0, freq: 'B0' }, { t: 600, freq: 'D#-1', ramp: 'exp' }]), env(2, 100, 800), dist(80, 0.5)] },
      { gain: 0.6, nodes: [noise('white'), filter('bandpass', 2000, 4, { shape: 'ramp-down', dur: 300, depth: -1000 }), env(2, 80, 600), dist(100, 0.6)] },
      { gain: 0.4, nodes: [noise('white'), filter('highpass', 6000, 4), env(1, 30, 200)] },
    ], 0.55),

    rocket_takeoff: PV('Rocket takeoff', 'Sub rumble + filtered roar + high whine.', ['vehicle', 'impact'], [
      { gain: 0.7, nodes: [noise('brown'), filter('lowpass', 200, 2), env(150, 2500, 1500), dist(100, 0.6)] },
      { gain: 0.5, nodes: [noise('white'), filter('bandpass', 1500, 2, { shape: 'ramp-up', dur: 2000, depth: 1500 }), env(200, 2200, 1000), dist(60, 0.4)] },
      { gain: 0.3, nodes: [tone('sawtooth', [{ t: 0, freq: 'F#5' }, { t: 2000, freq: 'A6', ramp: 'linear' }]), env(200, 2200, 800), filter('bandpass', 4000, 6)] },
    ], 0.55),

    boss_appears: PV('Boss appears', 'Cinematic stinger.', ['game-state', 'creature'], [
      { gain: 0.6, nodes: [tone('sawtooth', [{ t: 0, freq: 'C2' }]), env(2, 1500, 800), dist(100, 0.5), filter('lowpass', 600, 3)] },
      { gain: 0.5, nodes: [tone('sawtooth', [{ t: 0, freq: 'G2' }]), env(2, 1500, 800), dist(100, 0.5), filter('lowpass', 800, 3)] },
      { gain: 0.4, nodes: [noise('brown'), filter('lowpass', 400, 2), env(2, 1000, 1000), rvX('cathedral', 3.0, 0.5)] },
    ], 0.5),

    respawn_chord: PV('Respawn chord', 'Three-voice major triad warp-in.', ['game-state', 'magic'], [
      { gain: 0.5, nodes: [tone('sine', [{ t: 0, freq: 'C3' }, { t: 200, freq: 'C5', ramp: 'exp' }]), env(20, 250, 400)] },
      { gain: 0.5, nodes: [tone('sine', [{ t: 0, freq: 'E3' }, { t: 200, freq: 'E5', ramp: 'exp' }]), env(20, 250, 400)] },
      { gain: 0.5, nodes: [tone('sine', [{ t: 0, freq: 'G3' }, { t: 200, freq: 'G5', ramp: 'exp' }]), env(20, 250, 400), rvX('hall', 1.5, 0.4)] },
    ], 0.4),

    portal_open_chord: PV('Portal chord open', 'Sustained polychord with ascending sweep.', ['magic', 'movement'], [
      { gain: 0.4, nodes: [tone('sawtooth', [{ t: 0, freq: 'C3' }]), env(150, 2000, 1000), filter('lowpass', 1500, 4)] },
      { gain: 0.4, nodes: [tone('sawtooth', [{ t: 0, freq: 'F3' }]), env(180, 2000, 1000), filter('lowpass', 1500, 4)] },
      { gain: 0.4, nodes: [tone('sawtooth', [{ t: 0, freq: 'A3' }]), env(200, 2000, 1000), filter('lowpass', 1500, 4)] },
      { gain: 0.4, nodes: [noise('pink'), filter('bandpass', 800, 4, { shape: 'ramp-up', dur: 1800, depth: 4000 }), env(150, 1800, 800), rvX('cathedral', 3.0, 0.5)] },
    ], 0.4),

    ambient_drone_5ths: PV('Slow drone (fifths)', 'Cinematic 5-voice detuned drone.', ['pad', 'ambience'], [
      { gain: 0.4, nodes: [tone('sawtooth', [{ t: 0, freq: 'C2' }]), env(300, 3000, 2000), filter('lowpass', 600, 2)] },
      { gain: 0.4, nodes: [tone('sawtooth', [{ t: 0, freq: 'C2' }], 0.3, 2), env(300, 3000, 2000), filter('lowpass', 600, 2)] },
      { gain: 0.3, nodes: [tone('sawtooth', [{ t: 0, freq: 'G2' }]), env(350, 3000, 2000), filter('lowpass', 800, 2)] },
      { gain: 0.3, nodes: [tone('sawtooth', [{ t: 0, freq: 'G2' }], 0.3, 2), env(350, 3000, 2000), filter('lowpass', 800, 2)] },
      { gain: 0.2, nodes: [tone('sawtooth', [{ t: 0, freq: 'C3' }]), env(400, 3000, 2000), filter('lowpass', 1000, 2)] },
    ], 0.35),

    string_swell_horror: PV('Horror string swell', '4 detuned saws building tension.', ['pad', 'ambience'], [
      { gain: 0.4, nodes: [tone('sawtooth', [{ t: 0, freq: 'A4' }]), env(2500, 200, 500), filter('lowpass', 1500, 4)] },
      { gain: 0.4, nodes: [tone('sawtooth', [{ t: 0, freq: 'A#4' }]), env(2500, 200, 500), filter('lowpass', 1500, 4)] },
      { gain: 0.4, nodes: [tone('sawtooth', [{ t: 0, freq: 'D5' }]), env(2700, 200, 500), filter('lowpass', 1800, 4)] },
      { gain: 0.4, nodes: [tone('sawtooth', [{ t: 0, freq: 'D#5' }]), env(2700, 200, 500), filter('lowpass', 1800, 4), rvX('cathedral', 2.5, 0.5)] },
    ], 0.4),

    // ---------------- WAVE 3: PING-PONG MOVERS ----------------
    arrow_volley: P('Arrow volley', 'Multiple arrows ricocheting.', ['moving', 'combat'], [
      noise('pink'),
      filter('bandpass', 1500, 10, { shape: 'sharkfin', dur: 130, depth: 4000 }),
      env(5, 130, 80),
      pp(90, 0.75, 0.7),
    ], 0.4),

    boss_charge: P('Boss charge', 'Massive wind-up pass.', ['moving', 'combat', 'creature'], [
      noise('brown'),
      filter('bandpass', 200, 6, { shape: 'sharkfin', dur: 600, depth: 1500 }),
      env(50, 600, 400),
      dist(80, 0.5),
      pp(180, 0.55, 0.6),
    ], 0.45),

    plasma_pass: P('Plasma flyby', 'Sci-fi energy beam moving past.', ['moving', 'combat'], [
      tone('sawtooth', [{ t: 0, freq: 'B5' }, { t: 400, freq: 'F#3', ramp: 'exp' }], 12, 80),
      filter('bandpass', 2000, 6),
      env(20, 400, 300),
      pp(70, 0.6, 0.65),
      rvX('hall', 1.5, 0.3),
    ], 0.35),

    ghost_whisper: P('Ghost whisper', 'Eerie filtered breath drifting L/R.', ['creature', 'moving', 'ambience'], [
      noise('pink'),
      filter('bandpass', 800, 8, { shape: 'triangle', dur: 1500, depth: 600 }),
      env(150, 1500, 800),
      pp(200, 0.65, 0.6),
      rvX('cathedral', 3.0, 0.5),
    ], 0.3),

    echo_call: P('Echo chamber call', 'Single tone bouncing through cavern.', 'moving', [
      tone('sine', [{ t: 0, freq: 'A4' }, { t: 200, freq: 'E4', ramp: 'linear' }]),
      env(20, 250, 200),
      pp(220, 0.7, 0.7),
      rvX('cathedral', 4.0, 0.4),
    ], 0.35),

    // ---------------- WAVE 3: BITCRUSHED RETRO ----------------
    chip_punch: P('8-bit punch', 'Crushed brown-noise impact.', ['chiptune', 'combat', 'impact'], [
      noise('brown'),
      filter('lowpass', 600, 1.5, { shape: 'ramp-down', dur: 80, depth: -300 }),
      env(2, 40, 120),
      bc(3, 2500, 1),
    ], 0.45),

    dialog_blip: P('Dialog blip', 'Animal Crossing-style speech tick.', ['chiptune', 'ui'], [
      tone('square', [{ t: 0, freq: 'C5' }, { t: 30, freq: 'E5' }, { t: 60, freq: 'D5' }]),
      env(1, 70, 30),
      bc(3, 4000, 1),
    ], 0.3),

    gameboy_lasergun: P('Game Boy laser', 'Crunchy GB-style sweep.', ['chiptune', 'combat'], [
      tone('square', [{ t: 0, freq: 'A6' }, { t: 250, freq: 'C2', ramp: 'exp' }]),
      env(1, 250, 60),
      bc(2, 3000, 1),
    ], 0.3),

    nes_explosion: P('NES explosion', 'Classic 8-bit blast.', ['chiptune', 'combat', 'impact'], [
      noise('white'),
      filter('lowpass', 1500, 1.5, { shape: 'ramp-down', dur: 500, depth: -1200 }),
      env(2, 100, 500),
      bc(2, 2500, 1),
      dist(60, 0.4),
    ], 0.45),

    arcade_stinger: P('Arcade stinger', 'Boss-intro chip stab.', ['chiptune', 'game-state'], [
      tone('square', [{ t: 0, freq: 'C2' }, { t: 80, freq: 'G2' }, { t: 160, freq: 'C3' }]),
      env(1, 600, 400),
      bc(3, 4000, 1),
      rvX('hall', 1.5, 0.3),
    ], 0.4),

    lo_fi_chime: P('Lo-fi chime', '4-bit crushed bell.', ['chiptune', 'pickup', 'reward'], [
      fm('sine', [{ t: 0, freq: 'A5' }], 1.4, 6, 1500),
      env(1, 1500, 800),
      bc(4, 5000, 1),
      rvX('hall', 1.5, 0.3),
    ], 0.3),

    broken_speaker: P('Broken speaker', 'Bandpassed crushed noise wash.', ['chiptune', 'ambience'], [
      noise('white'),
      filter('bandpass', 1200, 6, { shape: 'triangle', dur: 1500, depth: 400 }),
      env(80, 1200, 400),
      bc(2, 1800, 1),
      dist(40, 0.4),
    ], 0.35),

    modem_handshake: P('Modem handshake', 'Dial-up flavor dual-tone.', ['chiptune', 'ui'], [
      tone('square', [
        { t: 0, freq: 'C5' }, { t: 100, freq: 'F#5' }, { t: 200, freq: 'C5' }, { t: 300, freq: 'F#5' },
        { t: 400, freq: 'A5' }, { t: 500, freq: 'D#5' }, { t: 600, freq: 'A5' }, { t: 700, freq: 'D#5' },
      ]),
      env(1, 800, 100),
      bc(3, 4000, 1),
    ], 0.3),

    // ---------------- WAVE 3: REVERB SPACE VARIANTS ----------------
    clap_room: P('Hand clap (room)', 'Indoor live clap.', 'drums', [
      noise('white'),
      filter('bandpass', 1500, 4),
      env(1, 30, 80),
      rvX('room', 0.6, 0.4),
    ], 0.45),

    whisper_cathedral: P('Whisper (cathedral)', 'Breathy noise in a vast space.', ['creature', 'ambience'], [
      noise('pink'),
      filter('bandpass', 1200, 6, { shape: 'triangle', dur: 1500, depth: 400 }),
      env(80, 1200, 600),
      rvX('cathedral', 4.0, 0.6),
    ], 0.3),

    drip_spring: P('Water drip (spring)', 'Boingy spring-tank droplet.', 'ambience', [
      tone('sine', [{ t: 0, freq: 'A5' }, { t: 30, freq: 'A6' }]),
      env(1, 60, 250),
      rvX('spring', 1.8, 0.6),
    ], 0.35),

    footstep_metalplate: P('Footstep metal (plate)', 'Boot on metal plate floor.', ['footstep', 'movement'], [
      noise('white'),
      filter('bandpass', 2200, 12, { shape: 'ramp-down', dur: 80, depth: -200 }),
      env(1, 30, 200),
      rvX('plate', 1.2, 0.5),
    ], 0.4),

    scream_tunnel: P('Scream (tunnel)', 'Long descending tone in a tunnel.', ['creature', 'ambience'], [
      tone('sawtooth', [{ t: 0, freq: 'A4' }, { t: 800, freq: 'A2', ramp: 'exp' }], 8, 8),
      filter('bandpass', 1200, 6),
      env(20, 800, 800),
      rvX('tunnel', 3.0, 0.6),
    ], 0.4),

    // ---------------- WAVE 3: DRUM KIT ADDITIONS ----------------
    rimshot_high: PV('High rimshot', 'Sharper rimshot variant.', ['drums', 'impact'], [
      { gain: 0.4, nodes: [tone('triangle', [{ t: 0, freq: 'C5' }, { t: 30, freq: 'A4', ramp: 'exp' }]), env(1, 30, 50)] },
      { gain: 0.5, nodes: [noise('white'), filter('highpass', 5000, 2), env(1, 5, 40)] },
    ], 0.4),

    cowbell: P('Cowbell', 'FM tuned-metal cowbell.', 'drums', [
      fm('square', [{ t: 0, freq: 'C5' }], 2.7, 4, 200),
      env(1, 200, 200),
    ], 0.35),

    bongo_low: PV('Bongo low', 'Soft hand-drum hit.', 'drums', [
      { gain: 0.6, nodes: [tone('sine', [{ t: 0, freq: 'F2' }, { t: 100, freq: 'A1', ramp: 'exp' }]), env(1, 80, 150)] },
      { gain: 0.2, nodes: [noise('pink'), filter('lowpass', 600, 2), env(1, 30, 60)] },
    ], 0.45),

    bongo_high: PV('Bongo high', 'Higher hand-drum hit.', 'drums', [
      { gain: 0.6, nodes: [tone('sine', [{ t: 0, freq: 'A2' }, { t: 100, freq: 'C2', ramp: 'exp' }]), env(1, 80, 150)] },
      { gain: 0.2, nodes: [noise('pink'), filter('lowpass', 800, 2), env(1, 30, 60)] },
    ], 0.45),

    conga: PV('Conga', 'Latin hand-drum hit with body.', 'drums', [
      { gain: 0.6, nodes: [tone('sine', [{ t: 0, freq: 'D2' }, { t: 150, freq: 'F1', ramp: 'exp' }]), env(1, 100, 200), dist(20, 0.3)] },
      { gain: 0.3, nodes: [noise('pink'), filter('lowpass', 700, 2), env(1, 40, 100)] },
    ], 0.45),

    clave: P('Clave', 'Sharp wood-clack.', 'drums', [
      fm('square', [{ t: 0, freq: 'C5' }], 1.5, 4, 30),
      env(1, 30, 60),
    ], 0.4),

    tambourine: P('Tambourine', 'Short sizzle with slight ring.', 'drums', [
      noise('white'),
      filter('highpass', 5000, 4),
      env(1, 10, 200),
      rvX('plate', 0.5, 0.3),
    ], 0.35),

    // ---------------- WAVE 3: HUMANIZED ----------------
    rain_humanized: withRandom(P('Rain (varied drops)', 'Random droplet sizes and timing.', 'ambience', [
      tone('sine', [{ t: 0, freq: 'A5' }, { t: 30, freq: 'A6' }]),
      env(1, 60, 250),
      rvX('cathedral', 2.5, 0.5),
    ], 0.35), { pitch: 0.3, time: 0.4, filter: 0, gain: 0.4 }),

    typing_humanized: withRandom(P('Keyboard tick (humanized)', 'Natural typing variation.', 'ui', [
      noise('white'),
      filter('bandpass', 4000, 14),
      env(1, 2, 10),
    ], 0.35), { pitch: 0, time: 0.5, filter: 0.3, gain: 0.3 }),

    applause_humanized: withRandom(P('Applause clap (humanized)', 'One natural-feeling clap (play repeatedly).', 'ambience', [
      noise('white'),
      filter('bandpass', 1500, 4),
      env(1, 30, 80),
      rvX('hall', 1.0, 0.4),
    ], 0.4), { pitch: 0, time: 0.4, filter: 0.4, gain: 0.4 }),

    crowd_murmur: P('Crowd murmur', 'Distant low filtered chatter.', 'ambience', [
      noise('pink'),
      filter('bandpass', 600, 2, { shape: 'triangle', dur: 2000, depth: 300 }),
      env(200, 2000, 800),
      rvX('hall', 2.0, 0.5),
    ], 0.25),

    // ---------------- WAVE 3: ENVIRONMENT ----------------
    wind_strong: P('Strong wind', 'Sustained gusty howl.', 'ambience', [
      noise('pink'),
      filter('bandpass', 500, 6, { shape: 'triangle', dur: 3000, depth: 1200 }),
      env(400, 2500, 1500),
    ], 0.4),

    wind_gusty: PV('Gusty wind', 'Layered howl with whistling overtone.', 'ambience', [
      { gain: 0.6, nodes: [noise('brown'), filter('lowpass', 600, 2, { shape: 'triangle', dur: 2500, depth: 400 }), env(300, 2200, 1200)] },
      { gain: 0.3, nodes: [noise('pink'), filter('bandpass', 1500, 8, { shape: 'triangle', dur: 2200, depth: 600 }), env(400, 2000, 1000)] },
    ], 0.4),

    rain_heavy: P('Heavy rain', 'Dense downpour.', 'ambience', [
      noise('white'),
      filter('bandpass', 2500, 1.5),
      env(300, 3000, 1000),
    ], 0.35),

    thunder_distant: P('Distant thunder', 'Low rolling rumble far away.', 'ambience', [
      noise('brown'),
      filter('lowpass', 200, 2, { shape: 'triangle', dur: 2500, depth: 100 }),
      env(200, 2200, 1500),
      dist(40, 0.3),
      rvX('cathedral', 4.0, 0.5),
    ], 0.45),

    creek_stream: P('Creek stream', 'Babbling-water white-noise wash.', 'ambience', [
      noise('white'),
      filter('bandpass', 2500, 4, { shape: 'triangle', dur: 2500, depth: 1000 }),
      env(300, 2500, 800),
    ], 0.3),

    ocean_waves: PV('Ocean waves', 'Soft beach swell with high spray.', 'ambience', [
      { gain: 0.7, nodes: [noise('brown'), filter('lowpass', 800, 2, { shape: 'triangle', dur: 3500, depth: 600 }), env(500, 3000, 1500)] },
      { gain: 0.3, nodes: [noise('white'), filter('highpass', 4000, 1.5), env(500, 3000, 1500)] },
    ], 0.4),

    campfire: P('Campfire', 'Crackling fire bed.', 'ambience', [
      noise('brown'),
      filter('bandpass', 1500, 4, { shape: 'triangle', dur: 1500, depth: 800 }),
      env(100, 1500, 600),
      dist(40, 0.3),
    ], 0.3),

    // ---------------- WAVE 3: MUSIC BOX LULLABY ----------------
    music_box_lullaby: P('Music box (Twinkle)', 'Twinkle-Twinkle melody — child lullaby.', ['music', 'ambience'], [
      tone('triangle', [
        { t: 0, freq: 'C5' }, { t: 350, freq: 'C5' },
        { t: 700, freq: 'G5' }, { t: 1050, freq: 'G5' },
        { t: 1400, freq: 'A5' }, { t: 1750, freq: 'A5' },
        { t: 2100, freq: 'G5' },
        { t: 2800, freq: 'F5' }, { t: 3150, freq: 'F5' },
        { t: 3500, freq: 'E5' }, { t: 3850, freq: 'E5' },
        { t: 4200, freq: 'D5' }, { t: 4550, freq: 'D5' },
        { t: 4900, freq: 'C5' },
      ]),
      env(5, 5300, 800),
      ch(1.5, 0.005, 0.4),
      rvX('hall', 2.0, 0.5),
    ], 0.3),

    music_box_brahms: P('Brahms lullaby', 'Iconic Brahms cradle melody opening.', ['music', 'ambience'], [
      tone('triangle', [
        { t: 0, freq: 'G4' }, { t: 350, freq: 'G4' },
        { t: 700, freq: 'B4' },
        { t: 1400, freq: 'G4' }, { t: 1750, freq: 'G4' },
        { t: 2100, freq: 'B4' },
        { t: 2800, freq: 'G4' }, { t: 3150, freq: 'D5' },
        { t: 3500, freq: 'C5' },
        { t: 4200, freq: 'B4' }, { t: 4550, freq: 'A4' },
        { t: 4900, freq: 'A4' }, { t: 5250, freq: 'G4' },
      ]),
      env(5, 5800, 1000),
      ch(1, 0.005, 0.5),
      rvX('cathedral', 3.0, 0.55),
    ], 0.3),

    music_box_descending: P('Descending lullaby', 'Soft descending melody — sleep theme.', ['music', 'ambience'], [
      fm('sine', [
        { t: 0, freq: 'C6' }, { t: 400, freq: 'A5' },
        { t: 800, freq: 'F5' }, { t: 1200, freq: 'D5' },
        { t: 1600, freq: 'C5' }, { t: 2000, freq: 'A4' },
        { t: 2400, freq: 'F4' }, { t: 2800, freq: 'C4' },
      ], 4, 4, 350),
      env(5, 3300, 800),
      rvX('hall', 2.5, 0.55),
    ], 0.3),

    // ---------------- SWING ----------------
    fist_punch_swing: P('Fist punch swing', 'Short low-mid whoosh of a fist through air.', ['swing', 'combat'], [
      noise('pink'),
      filter('bandpass', 500, 4, { shape: 'sharkfin', dur: 110, depth: 2200 }),
      env(5, 100, 80),
    ], 0.4),

    sword_swing: P('Sword swing', 'Bright steel-blade arc.', ['swing', 'combat'], [
      noise('pink'),
      filter('bandpass', 700, 7, { shape: 'sharkfin', dur: 200, depth: 4000 }),
      env(10, 200, 140),
    ], 0.45),

    bat_swing: P('Baseball bat swing', 'Heavier wood-bat arc.', ['swing', 'combat'], [
      noise('pink'),
      filter('bandpass', 350, 4, { shape: 'sharkfin', dur: 280, depth: 1800 }),
      env(20, 280, 200),
    ], 0.5),

    hammer_swing: P('Hammer swing', 'Slow heavy sledge through air.', ['swing', 'combat'], [
      noise('brown'),
      filter('bandpass', 200, 5, { shape: 'sharkfin', dur: 450, depth: 1200 }),
      env(30, 450, 350),
      dist(40, 0.4),
    ], 0.5),

    dagger_flick_swing: P('Dagger flick', 'Quick narrow-blade whip.', ['swing', 'combat'], [
      noise('white'),
      filter('bandpass', 1800, 12, { shape: 'sharkfin', dur: 90, depth: 4500 }),
      env(2, 80, 50),
    ], 0.4),

    axe_swing: PV('Axe swing', 'Heavy chop with metallic overtone.', ['swing', 'combat'], [
      { gain: 0.7, nodes: [noise('brown'), filter('bandpass', 400, 5, { shape: 'sharkfin', dur: 320, depth: 1600 }), env(20, 320, 220)] },
      { gain: 0.25, nodes: [fm('sine', [{ t: 0, freq: 'A5' }], 1.4, 4, 250), env(50, 350, 200), rvX('plate', 0.8, 0.4)] },
    ], 0.45),

    whip_swing: PV('Whip swing', 'Sharp swoosh ending in a crack.', ['swing', 'combat'], [
      { gain: 0.6, nodes: [noise('white'), filter('highpass', 4000, 8, { shape: 'sharkfin', dur: 120, depth: 3000 }), env(2, 100, 60)] },
      { gain: 0.5, nodes: [noise('white'), filter('bandpass', 5000, 14), env(85, 5, 30), dist(40, 0.4)] },
    ], 0.45),

    broom_swing: P('Broom swing', 'Dense bristle sweep through air.', ['swing', 'movement'], [
      noise('pink'),
      filter('bandpass', 1200, 3, { shape: 'sharkfin', dur: 240, depth: 1500 }),
      env(20, 240, 180),
    ], 0.4),

    cane_swing: P('Cane swing', 'Thin wooden whip-stick.', ['swing', 'combat'], [
      noise('white'),
      filter('bandpass', 2200, 10, { shape: 'sharkfin', dur: 130, depth: 3000 }),
      env(2, 110, 80),
    ], 0.4),

    golf_swing: PV('Golf swing', 'Whoosh ending in a sharp click.', ['swing', 'movement', 'impact'], [
      { gain: 0.5, nodes: [noise('pink'), filter('bandpass', 1200, 6, { shape: 'sharkfin', dur: 220, depth: 2500 }), env(15, 220, 140)] },
      { gain: 0.5, nodes: [tone('triangle', [{ t: 220, freq: 'C7' }, { t: 250, freq: 'A6', ramp: 'exp' }]), env(220, 30, 50)] },
    ], 0.45),

    nunchuck_swing: P('Nunchuck swing', 'Rapid double-whoosh from twirling sticks.', ['swing', 'combat'], [
      noise('pink'),
      filter('bandpass', 800, 8, { shape: 'sharkfin', dur: 90, depth: 2500 }),
      env(2, 80, 60),
      pp(70, 0.55, 0.7),
    ], 0.4),

    spear_thrust_swing: P('Spear thrust', 'Directional narrow swoosh.', ['swing', 'combat', 'moving'], [
      noise('pink'),
      filter('bandpass', 1500, 10, { shape: 'sharkfin', dur: 150, depth: 3500 }),
      env(8, 140, 80),
      pp(100, 0.4, 0.4),
    ], 0.4),

    mace_swing: P('Mace swing', 'Thick spiked-club arc.', ['swing', 'combat'], [
      noise('brown'),
      filter('bandpass', 280, 5, { shape: 'sharkfin', dur: 380, depth: 1400 }),
      env(25, 380, 300),
      dist(50, 0.4),
    ], 0.5),

    karate_kick_swing: P('Karate kick', 'Leg cutting through air.', ['swing', 'combat', 'movement'], [
      noise('pink'),
      filter('bandpass', 600, 4, { shape: 'sharkfin', dur: 200, depth: 2200 }),
      env(15, 200, 160),
    ], 0.4),

    backhand_swing: P('Backhand swing', 'Reverse-direction quick swat.', ['swing', 'combat'], [
      noise('pink'),
      filter('bandpass', 900, 8, { shape: 'reverse-sharkfin', dur: 180, depth: 3000 }),
      env(5, 170, 120),
    ], 0.4),

    uppercut_swing: P('Uppercut swing', 'Rising arc — fist coming up.', ['swing', 'combat'], [
      noise('pink'),
      filter('bandpass', 400, 5, { shape: 'ramp-up', dur: 220, depth: 2800 }),
      env(15, 220, 160),
    ], 0.4),

    roundhouse_swing: P('Roundhouse kick', 'Long arcing leg sweep with stereo movement.', ['swing', 'combat', 'moving'], [
      noise('pink'),
      filter('bandpass', 600, 6, { shape: 'sharkfin', dur: 320, depth: 2800 }),
      env(20, 320, 200),
      pp(120, 0.45, 0.5),
    ], 0.45),

    lasso_swing: P('Lasso twirl', 'Cyclical overhead rope swing.', ['swing', 'movement'], [
      noise('pink'),
      filter('bandpass', 800, 6, { shape: 'triangle', dur: 1200, depth: 1500 }),
      env(50, 1100, 300),
    ], 0.35),

    fan_swing: P('Paper fan swing', 'Thin paper sweep.', ['swing', 'movement'], [
      noise('white'),
      filter('highpass', 3000, 4, { shape: 'sharkfin', dur: 180, depth: 2500 }),
      env(10, 180, 130),
    ], 0.35),

    slingshot_swing: P('Slingshot release', 'Tight elastic snap with stereo flick.', ['swing', 'combat'], [
      noise('white'),
      filter('bandpass', 2500, 12, { shape: 'sharkfin', dur: 90, depth: 3500 }),
      env(2, 80, 80),
      pp(60, 0.5, 0.4),
    ], 0.4),

    // ---------------- JUMP ----------------
    jump_high: P('High jump', 'Tall pitch leap — soaring upward.', ['jump', 'movement'], [
      tone('square', [{ t: 0, freq: 'E3' }, { t: 130, freq: 'E7', ramp: 'linear' }]),
      env(1, 130, 40),
    ], 0.35),

    jump_long: P('Long jump', 'Extended ascending sweep.', ['jump', 'movement'], [
      tone('square', [{ t: 0, freq: 'A3' }, { t: 280, freq: 'C7', ramp: 'linear' }]),
      env(1, 280, 80),
    ], 0.35),

    jump_pad_boing: P('Jump pad boing', 'Bouncy puzzle-game launch pad.', ['jump', 'movement'], [
      tone('sine', [{ t: 0, freq: 'C5' }, { t: 200, freq: 'G6', ramp: 'exp' }]),
      env(1, 220, 250),
      rvX('hall', 1.5, 0.4),
    ], 0.4),

    trampoline_jump: PV('Trampoline bounce', 'Rubbery wobble with chorus shimmer.', ['jump', 'movement'], [
      { gain: 0.7, nodes: [tone('sine', [{ t: 0, freq: 'A3' }, { t: 250, freq: 'D5', ramp: 'exp' }]), env(1, 280, 200), ch(3, 0.005, 0.6)] },
      { gain: 0.4, nodes: [tone('triangle', [{ t: 0, freq: 'A4' }, { t: 250, freq: 'D6', ramp: 'exp' }]), env(1, 280, 200), ch(3, 0.005, 0.6)] },
    ], 0.4),

    frog_hop: P('Frog hop', 'Cute low-mid leap with a dip.', ['jump', 'movement', 'creature'], [
      tone('square', [{ t: 0, freq: 'G3' }, { t: 60, freq: 'E3', ramp: 'linear' }, { t: 160, freq: 'A4', ramp: 'linear' }]),
      env(1, 170, 60),
    ], 0.35),

    cartoon_squeak_jump: P('Cartoon squeak jump', 'High squeaky comedic leap.', ['jump', 'movement'], [
      tone('sine', [{ t: 0, freq: 'A5' }, { t: 100, freq: 'D7', ramp: 'exp' }]),
      env(1, 120, 80),
    ], 0.3),

    wall_jump_kick: PV('Wall jump', 'Whoosh + sharp push-off tap.', ['jump', 'movement', 'combat'], [
      { gain: 0.5, nodes: [noise('pink'), filter('bandpass', 1200, 6, { shape: 'sharkfin', dur: 100, depth: 3000 }), env(2, 100, 80)] },
      { gain: 0.5, nodes: [tone('square', [{ t: 0, freq: 'C4' }, { t: 130, freq: 'C6', ramp: 'linear' }]), env(1, 130, 40)] },
    ], 0.4),

    super_jump_charged: PV('Super charged jump', 'Buildup hum then powerful release.', ['jump', 'movement', 'magic'], [
      { gain: 0.4, nodes: [tone('sawtooth', [{ t: 0, freq: 'C3' }, { t: 250, freq: 'C4', ramp: 'linear' }]), filter('lowpass', 600, 4), env(20, 250, 80)] },
      { gain: 0.6, nodes: [tone('square', [{ t: 250, freq: 'A3' }, { t: 450, freq: 'A6', ramp: 'linear' }]), env(250, 200, 60)] },
    ], 0.4),

    spring_jump_metal: P('Spring jump', 'FM metallic spring bounce.', ['jump', 'movement'], [
      fm('sine', [{ t: 0, freq: 'A3' }, { t: 200, freq: 'A5', ramp: 'exp' }], 2.7, 5, 250),
      env(1, 220, 200),
      rvX('spring', 1.5, 0.5),
    ], 0.35),

    slime_squish_jump: PV('Slime squish jump', 'Wobbly pitched leap with squishy noise body.', ['jump', 'movement', 'creature'], [
      { gain: 0.6, nodes: [tone('sine', [{ t: 0, freq: 'F3' }, { t: 200, freq: 'C5', ramp: 'exp' }], 12, 30), env(1, 200, 150)] },
      { gain: 0.3, nodes: [noise('brown'), filter('bandpass', 800, 4, { shape: 'sharkfin', dur: 200, depth: 1000 }), env(5, 200, 100)] },
    ], 0.4),

    // ---------------- JUMP (realistic air-whoosh) ----------------
    jump_air_light: P('Light air jump', 'Quick whoosh of air past a light leap.', ['jump', 'movement'], [
      noise('pink'),
      filter('bandpass', 800, 5, { shape: 'sharkfin', dur: 180, depth: 2500 }),
      env(10, 180, 120),
    ], 0.4),

    jump_air_heavy: P('Heavy air jump', 'Slower deeper whoosh of a weighted lift.', ['jump', 'movement'], [
      noise('brown'),
      filter('bandpass', 400, 4, { shape: 'sharkfin', dur: 280, depth: 1800 }),
      env(20, 280, 250),
    ], 0.45),

    jump_air_breath: PV('Breath jump', 'Layered air past body — no tonal grunt.', ['jump', 'movement'], [
      { gain: 0.6, nodes: [noise('pink'), filter('bandpass', 700, 5, { shape: 'sharkfin', dur: 220, depth: 2400 }), env(10, 220, 150)] },
      { gain: 0.4, nodes: [noise('brown'), filter('bandpass', 250, 3, { shape: 'sharkfin', dur: 240, depth: 800 }), env(15, 240, 200)] },
    ], 0.4),

    leap_forward_air: P('Forward leap (air)', 'Forward bound — air rushing past with subtle stereo flick.', ['jump', 'movement', 'moving'], [
      noise('pink'),
      filter('bandpass', 700, 6, { shape: 'sharkfin', dur: 250, depth: 3000 }),
      env(15, 250, 180),
      pp(90, 0.35, 0.4),
    ], 0.4),

    vertical_lift_air: P('Vertical lift', 'Air rising as you jump up — rising filter shape.', ['jump', 'movement'], [
      noise('pink'),
      filter('bandpass', 600, 5, { shape: 'ramp-up', dur: 220, depth: 2800 }),
      env(15, 220, 160),
    ], 0.4),

    descent_air: P('Descent (falling air)', 'Air rushing past during a fall.', ['jump', 'movement'], [
      noise('pink'),
      filter('bandpass', 1500, 4, { shape: 'ramp-down', dur: 350, depth: -1200 }),
      env(20, 350, 250),
    ], 0.4),

    acrobatic_flip_air: PV('Acrobatic flip', 'Two layered air-passes for a rotating leap.', ['jump', 'movement', 'moving'], [
      { gain: 0.6, nodes: [noise('pink'), filter('bandpass', 900, 6, { shape: 'sharkfin', dur: 280, depth: 2800 }), env(15, 280, 180)] },
      { gain: 0.4, nodes: [noise('white'), filter('highpass', 3000, 4, { shape: 'sharkfin', dur: 280, depth: 2000 }), env(15, 280, 180), pp(140, 0.4, 0.5)] },
    ], 0.4),

    vault_air: P('Vault clear', 'Quick obstacle-clearing air-pass.', ['jump', 'movement'], [
      noise('pink'),
      filter('bandpass', 1100, 7, { shape: 'sharkfin', dur: 160, depth: 3200 }),
      env(8, 160, 100),
    ], 0.4),

    parkour_jump_air: PV('Parkour jump', 'Body whoosh with cloth-flutter overtone.', ['jump', 'movement'], [
      { gain: 0.6, nodes: [noise('pink'), filter('bandpass', 600, 5, { shape: 'sharkfin', dur: 230, depth: 2500 }), env(12, 230, 160)] },
      { gain: 0.35, nodes: [noise('white'), filter('highpass', 4000, 6, { shape: 'sharkfin', dur: 200, depth: 2200 }), env(20, 200, 120)] },
    ], 0.4),

    dive_plunge_air: P('Dive plunge', 'Long descent — sustained air rushing past.', ['jump', 'movement'], [
      noise('pink'),
      filter('bandpass', 1200, 4, { shape: 'ramp-down', dur: 600, depth: -800 }),
      env(50, 600, 400),
    ], 0.4),

    // ---------------- MAGIC (elements, potions, mechanics) ----------------
    lightning_bolt: PV('Lightning bolt', 'Sharp electric crack with descending screech.', ['magic', 'combat'], [
      { gain: 0.6, nodes: [noise('white'), filter('bandpass', 3000, 4, { shape: 'sharkfin', dur: 80, depth: -2000 }), env(1, 30, 200), dist(100, 0.6), rvX('plate', 1.0, 0.4)] },
      { gain: 0.5, nodes: [tone('sawtooth', [{ t: 0, freq: 'C7' }, { t: 200, freq: 'A2', ramp: 'exp' }]), env(1, 200, 150), dist(60, 0.4)] },
    ], 0.45),

    earth_spell: PV('Earth spell', 'Sub-rumble with cathedral impact.', ['magic', 'combat'], [
      { gain: 0.7, nodes: [tone('sine', [{ t: 0, freq: 'A1' }, { t: 700, freq: 'D1', ramp: 'exp' }], 4, 6), env(50, 600, 500), dist(60, 0.5)] },
      { gain: 0.5, nodes: [noise('brown'), filter('lowpass', 300, 2), env(5, 200, 800), rvX('cathedral', 2.5, 0.5)] },
    ], 0.5),

    wind_spell: P('Wind spell', 'Airy spiraling whoosh with chorus.', ['magic', 'movement'], [
      noise('pink'),
      filter('bandpass', 1200, 5, { shape: 'sharkfin', dur: 800, depth: 3000 }),
      env(80, 700, 400),
      ch(1.5, 0.008, 0.5),
      rvX('hall', 1.5, 0.4),
    ], 0.4),

    water_spell: PV('Water spell', 'Bubbling rising water magic.', ['magic'], [
      { gain: 0.6, nodes: [tone('sine', [{ t: 0, freq: 'A3' }, { t: 400, freq: 'A5', ramp: 'exp' }], 8, 20), env(20, 400, 300)] },
      { gain: 0.3, nodes: [noise('white'), filter('bandpass', 2500, 6, { shape: 'sharkfin', dur: 400, depth: 1500 }), env(20, 400, 200)] },
    ], 0.4),

    poison_bubble_spell: PV('Poison bubble', 'Acidic low wobble with bubble pops.', ['magic', 'combat'], [
      { gain: 0.6, nodes: [fm('sawtooth', [{ t: 0, freq: 'A2' }], 1.5, 5, 300), env(20, 500, 300), filter('lowpass', 800, 4)] },
      { gain: 0.3, nodes: [noise('brown'), filter('bandpass', 600, 8, { shape: 'triangle', dur: 500, depth: 400 }), env(10, 500, 200)] },
    ], 0.4),

    shadow_spell: P('Shadow spell', 'Dark descending whoosh.', ['magic', 'combat'], [
      tone('sawtooth', [{ t: 0, freq: 'A4' }, { t: 600, freq: 'A1', ramp: 'exp' }], 4, 5),
      filter('lowpass', 1000, 4),
      env(20, 600, 500),
      dist(80, 0.5),
      rvX('cathedral', 3.0, 0.55),
    ], 0.4),

    holy_light_spell: PV('Holy light', 'Bright shimmering triad in cathedral.', ['magic', 'reward'], [
      { gain: 0.5, nodes: [tone('sine', [{ t: 0, freq: 'C5' }]), env(50, 1500, 1200), ch(2, 0.005, 0.6)] },
      { gain: 0.5, nodes: [tone('sine', [{ t: 0, freq: 'E5' }]), env(80, 1500, 1200), ch(2, 0.005, 0.6)] },
      { gain: 0.5, nodes: [tone('sine', [{ t: 0, freq: 'G5' }]), env(110, 1500, 1200), ch(2, 0.005, 0.6), rvX('cathedral', 4.0, 0.6)] },
    ], 0.4),

    arcane_blast: P('Arcane blast', 'Pure raw-magic energy zap.', ['magic', 'combat'], [
      fm('sine', [{ t: 0, freq: 'C5' }, { t: 200, freq: 'C7', ramp: 'linear' }], 1.5, 8, 250),
      env(10, 250, 350),
      rvX('hall', 2.0, 0.4),
    ], 0.35),

    potion_uncork: PV('Potion uncork', 'Pop of a cork + tonal pluck.', ['magic', 'pickup'], [
      { gain: 0.5, nodes: [noise('white'), filter('bandpass', 3500, 12, { shape: 'sharkfin', dur: 30, depth: 0 }), env(1, 15, 40)] },
      { gain: 0.4, nodes: [tone('triangle', [{ t: 0, freq: 'A6' }, { t: 30, freq: 'C7' }]), env(1, 40, 100)] },
    ], 0.4),

    potion_drink: PV('Potion drink', 'Gulp + magical effect sparkle.', ['magic', 'pickup'], [
      { gain: 0.5, nodes: [noise('pink'), filter('bandpass', 400, 4, { shape: 'sharkfin', dur: 400, depth: 800 }), env(30, 350, 200), dist(30, 0.3)] },
      { gain: 0.4, nodes: [tone('sine', [{ t: 350, freq: 'C5' }, { t: 450, freq: 'E5' }, { t: 550, freq: 'G5' }, { t: 650, freq: 'C6' }]), env(350, 350, 350), rvX('hall', 1.5, 0.4)] },
    ], 0.4),

    potion_brew: PV('Potion brew', 'Sustained cauldron bubbling.', ['magic', 'ambience'], [
      { gain: 0.5, nodes: [noise('pink'), filter('bandpass', 700, 8, { shape: 'triangle', dur: 2000, depth: 600 }), env(100, 1800, 600)] },
      { gain: 0.3, nodes: [tone('sine', [{ t: 0, freq: 'A3' }], 4, 30), filter('lowpass', 1500, 4), env(150, 1700, 500)] },
    ], 0.35),

    potion_smash: PV('Potion smash', 'Glass shatter releasing magical shimmer.', ['magic', 'impact'], [
      { gain: 0.5, nodes: [noise('white'), filter('highpass', 3500, 6, { shape: 'ramp-down', dur: 250, depth: 2000 }), env(1, 80, 300), rvX('plate', 1.2, 0.4)] },
      { gain: 0.4, nodes: [tone('sine', [{ t: 60, freq: 'C7' }, { t: 200, freq: 'A6' }, { t: 350, freq: 'E7' }]), env(60, 350, 400), rvX('hall', 2.0, 0.5)] },
    ], 0.45),

    wand_wave: PV('Wand wave', 'Quick high whoosh + sparkle.', ['magic'], [
      { gain: 0.5, nodes: [noise('white'), filter('bandpass', 2500, 8, { shape: 'sharkfin', dur: 200, depth: 3000 }), env(5, 180, 100)] },
      { gain: 0.4, nodes: [tone('sine', [{ t: 100, freq: 'E6' }, { t: 180, freq: 'A6' }, { t: 260, freq: 'E7' }]), env(100, 200, 250), rvX('hall', 1.5, 0.4)] },
    ], 0.35),

    rune_activate: PV('Rune activate', 'Low hum building into ascending chime.', ['magic'], [
      { gain: 0.5, nodes: [tone('sawtooth', [{ t: 0, freq: 'C2' }]), filter('lowpass', 600, 4), env(50, 800, 300), dist(40, 0.4)] },
      { gain: 0.4, nodes: [tone('sine', [{ t: 400, freq: 'C5' }, { t: 600, freq: 'G5' }, { t: 800, freq: 'C6' }]), env(400, 600, 400), rvX('cathedral', 2.5, 0.5)] },
    ], 0.4),

    magic_circle: PV('Magic circle', 'Mystical sustained hum being drawn.', ['magic', 'ambience'], [
      { gain: 0.4, nodes: [tone('sawtooth', [{ t: 0, freq: 'A2' }], 0.4, 2), filter('lowpass', 800, 4), env(150, 2200, 800), ch(1, 0.005, 0.5)] },
      { gain: 0.3, nodes: [tone('sine', [{ t: 0, freq: 'A4' }], 6, 8), env(200, 2200, 800), rvX('cathedral', 3.0, 0.5)] },
    ], 0.35),

    levitation: PV('Levitation', 'Airy sustained tones lifting off.', ['magic', 'movement'], [
      { gain: 0.4, nodes: [tone('sine', [{ t: 0, freq: 'C5' }, { t: 1500, freq: 'G5', ramp: 'linear' }]), env(150, 1800, 1200), ch(2, 0.008, 0.6)] },
      { gain: 0.4, nodes: [tone('sine', [{ t: 0, freq: 'C5' }, { t: 1500, freq: 'C6', ramp: 'linear' }], 6, 4), env(180, 1800, 1200), ch(2, 0.008, 0.6), rvX('cathedral', 3.5, 0.55)] },
    ], 0.35),

    polymorph: P('Polymorph', 'Swirling pitched transformation.', ['magic'], [
      tone('sawtooth', [
        { t: 0, freq: 'A4' }, { t: 200, freq: 'C6', ramp: 'linear' },
        { t: 400, freq: 'D4', ramp: 'linear' }, { t: 600, freq: 'A6', ramp: 'linear' },
        { t: 800, freq: 'C4', ramp: 'linear' }, { t: 1000, freq: 'F#5', ramp: 'linear' },
      ], 8, 30),
      filter('bandpass', 1500, 4),
      env(20, 1000, 400),
      ch(3, 0.01, 0.6),
      rvX('hall', 2.0, 0.5),
    ], 0.35),

    time_stop_spell: P('Time stop', 'Pitch slowing to a halt.', ['magic'], [
      tone('sine', [{ t: 0, freq: 'A4' }, { t: 1200, freq: 'A0', ramp: 'exp' }], 4, 8),
      env(20, 1200, 600),
      ch(2, 0.008, 0.5),
      rvX('cathedral', 3.0, 0.6),
    ], 0.35),

    fairy_chime: P('Fairy chime', 'Tiny twinkly arpeggio.', ['magic', 'pickup'], [
      fm('sine', [
        { t: 0, freq: 'E7' }, { t: 80, freq: 'A7' }, { t: 160, freq: 'C7' }, { t: 240, freq: 'E7' },
      ], 4, 5, 800),
      env(1, 350, 600),
      rvX('hall', 2.0, 0.55),
    ], 0.3),

    necrotic_drain: PV('Necrotic drain', 'Life-draining descending wail.', ['magic', 'combat'], [
      { gain: 0.5, nodes: [tone('sawtooth', [{ t: 0, freq: 'D5' }, { t: 800, freq: 'D2', ramp: 'exp' }], 5, 15), filter('lowpass', 1500, 4), env(20, 800, 600), dist(60, 0.4)] },
      { gain: 0.4, nodes: [noise('brown'), filter('bandpass', 400, 4, { shape: 'ramp-down', dur: 800, depth: -200 }), env(20, 800, 400), rvX('cathedral', 3.5, 0.5)] },
    ], 0.4),

    // ---------------- CRAFTING / INVENTORY ----------------
    anvil_hit: PV('Anvil hit', 'Hammer on anvil with metallic ring.', ['crafting', 'impact'], [
      { gain: 0.6, nodes: [noise('white'), filter('bandpass', 2500, 12, { shape: 'ramp-down', dur: 60, depth: -200 }), env(1, 30, 100), dist(30, 0.3)] },
      { gain: 0.5, nodes: [fm('sine', [{ t: 0, freq: 'A5' }], 1.5, 5, 600), env(1, 600, 800), rvX('plate', 1.5, 0.5)] },
    ], 0.45),

    forge_bellows: P('Forge bellows', 'Sustained breathy air feeding the forge.', ['crafting', 'ambience'], [
      noise('pink'),
      filter('bandpass', 400, 4, { shape: 'triangle', dur: 1800, depth: 250 }),
      env(200, 1500, 600),
    ], 0.3),

    item_place: P('Item place down', 'Soft thud setting item on surface.', ['inventory'], [
      noise('brown'),
      filter('lowpass', 600, 2),
      env(2, 30, 80),
    ], 0.4),

    item_equip_armor: PV('Equip armor', 'Metal clinking onto body.', ['inventory'], [
      { gain: 0.5, nodes: [noise('white'), filter('bandpass', 2500, 10, { shape: 'ramp-down', dur: 80, depth: -300 }), env(1, 30, 120)] },
      { gain: 0.4, nodes: [fm('sine', [{ t: 0, freq: 'D6' }], 2.5, 3, 100), env(1, 120, 200), rvX('room', 0.6, 0.3)] },
    ], 0.4),

    item_equip_weapon: PV('Equip weapon', 'Metallic snap with low resonance.', ['inventory'], [
      { gain: 0.5, nodes: [noise('white'), filter('bandpass', 1500, 8, { shape: 'ramp-down', dur: 80, depth: -200 }), env(1, 30, 100)] },
      { gain: 0.4, nodes: [fm('sine', [{ t: 0, freq: 'A4' }], 1.4, 4, 200), env(1, 200, 250), rvX('plate', 0.8, 0.3)] },
    ], 0.4),

    item_drop: P('Item drop', 'Quick brown thud.', ['inventory'], [
      noise('brown'),
      filter('lowpass', 400, 2, { shape: 'ramp-down', dur: 60, depth: -100 }),
      env(1, 40, 120),
    ], 0.45),

    item_stack: PV('Item stack', 'Two quick metallic ticks merging.', ['inventory', 'pickup'], [
      { gain: 0.5, nodes: [fm('sine', [{ t: 0, freq: 'C6' }], 2.7, 3, 60), env(1, 50, 60)] },
      { gain: 0.4, nodes: [fm('sine', [{ t: 60, freq: 'E6' }], 2.7, 3, 60), env(60, 50, 60)] },
    ], 0.35),

    recipe_complete: P('Recipe complete', 'Three-note ascending success chime.', ['crafting', 'reward'], [
      tone('sine', [{ t: 0, freq: 'C5' }, { t: 100, freq: 'E5' }, { t: 200, freq: 'G5' }]),
      env(1, 320, 350),
      rvX('hall', 1.2, 0.4),
    ], 0.35),

    smelt_complete: PV('Smelt complete', 'Low satisfying ingot ring.', ['crafting', 'reward'], [
      { gain: 0.5, nodes: [tone('sine', [{ t: 0, freq: 'C4' }, { t: 200, freq: 'G4' }]), env(1, 250, 300)] },
      { gain: 0.5, nodes: [fm('sine', [{ t: 0, freq: 'C5' }], 1.4, 5, 800), env(1, 800, 600), rvX('plate', 1.5, 0.5)] },
    ], 0.4),

    gather_ore: PV('Gather ore', 'Metal chunk breaking from vein.', ['crafting'], [
      { gain: 0.6, nodes: [noise('white'), filter('bandpass', 1800, 12, { shape: 'ramp-down', dur: 100, depth: -400 }), env(1, 50, 200), dist(40, 0.4)] },
      { gain: 0.4, nodes: [fm('sine', [{ t: 0, freq: 'F#5' }], 1.4, 5, 300), env(1, 300, 400), rvX('plate', 0.8, 0.4)] },
    ], 0.4),

    dig_dirt: P('Dig dirt', 'Shovel into soft earth.', ['crafting', 'movement'], [
      noise('brown'),
      filter('lowpass', 700, 2, { shape: 'ramp-down', dur: 200, depth: -300 }),
      env(5, 100, 250),
    ], 0.4),

    harvest_plant: PV('Harvest plant', 'Plant pluck — leafy snap + tiny chime.', ['crafting'], [
      { gain: 0.5, nodes: [noise('pink'), filter('bandpass', 2500, 8, { shape: 'sharkfin', dur: 80, depth: -1000 }), env(1, 50, 80)] },
      { gain: 0.3, nodes: [tone('triangle', [{ t: 0, freq: 'E6' }, { t: 60, freq: 'A6' }]), env(1, 80, 150)] },
    ], 0.4),

    fishing_cast: P('Fishing cast', 'Line whooshes out over water.', ['crafting', 'movement'], [
      noise('pink'),
      filter('bandpass', 1500, 6, { shape: 'sharkfin', dur: 300, depth: 2500 }),
      env(20, 280, 200),
    ], 0.35),

    fishing_catch: P('Fishing catch', 'Triumphant catch chime.', ['crafting', 'reward'], [
      tone('sine', [
        { t: 0, freq: 'C5' }, { t: 80, freq: 'E5' }, { t: 160, freq: 'G5' }, { t: 240, freq: 'C6' },
      ]),
      env(1, 400, 500),
      rvX('hall', 1.5, 0.45),
    ], 0.35),

    // ---------------- HORROR / TENSION ----------------
    distant_scratch: P('Distant scratch', 'Claws scraping on a faraway wall.', ['horror', 'ambience'], [
      noise('white'),
      filter('bandpass', 4500, 14, { shape: 'sharkfin', dur: 80, depth: -1500 }),
      env(1, 50, 100),
      rvX('cathedral', 2.5, 0.55),
    ], 0.3),

    wood_creak_ominous: P('Ominous wood creak', 'Slow groaning floorboard.', ['horror', 'ambience'], [
      noise('pink'),
      filter('bandpass', 600, 12, { shape: 'ramp-up', dur: 1500, depth: 700 }),
      env(50, 1500, 350),
    ], 0.35),

    heartbeat_pulse_slow: P('Slow heartbeat', 'Tense lub-dub repeating into the dark.', ['horror', 'ambience', 'creature'], [
      tone('sine', [{ t: 0, freq: 'A1' }, { t: 80, freq: 'F1', ramp: 'exp' }]),
      env(1, 100, 200),
      dist(40, 0.4),
      dl(900, 0.75, 0.7),
    ], 0.5),

    jumpscare_stinger: PV('Jumpscare stinger', 'Sudden violent stab — heart-attack hit.', ['horror', 'impact', 'combat'], [
      { gain: 0.5, nodes: [noise('white'), filter('bandpass', 2000, 4, { shape: 'sharkfin', dur: 100, depth: -1500 }), env(1, 80, 600), dist(100, 0.6), rvX('plate', 1.2, 0.4)] },
      { gain: 0.6, nodes: [tone('sawtooth', [{ t: 0, freq: 'A2' }, { t: 250, freq: 'D#2', ramp: 'linear' }]), env(1, 300, 600), dist(80, 0.5), filter('lowpass', 1200, 4)] },
      { gain: 0.5, nodes: [noise('brown'), filter('lowpass', 200, 2), env(1, 100, 800), dist(60, 0.4), rvX('cathedral', 2.5, 0.5)] },
    ], 0.5),

    breathing_closeup: P('Close-up breathing', 'Heavy breath right beside the mic.', ['horror', 'ambience', 'creature'], [
      noise('brown'),
      filter('bandpass', 500, 3, { shape: 'triangle', dur: 1500, depth: 600 }),
      env(100, 1400, 500),
    ], 0.4),

    whispers_overlapping: PV('Overlapping whispers', 'Many voices murmuring at once.', ['horror', 'ambience', 'creature'], [
      { gain: 0.5, nodes: [noise('pink'), filter('bandpass', 1500, 8, { shape: 'triangle', dur: 1800, depth: 500 }), env(80, 1700, 500), pp(220, 0.6, 0.5)] },
      { gain: 0.4, nodes: [noise('pink'), filter('bandpass', 1200, 8, { shape: 'triangle', dur: 1800, depth: 400 }), env(120, 1700, 500), pp(310, 0.55, 0.5), rvX('cathedral', 2.5, 0.4)] },
    ], 0.3),

    distant_door_creak: P('Distant door creak', 'Far-away hinge groan in a stone hall.', ['horror', 'ambience'], [
      noise('pink'),
      filter('bandpass', 700, 14, { shape: 'ramp-up', dur: 1100, depth: 600 }),
      env(80, 1000, 350),
      rvX('cathedral', 3.5, 0.6),
    ], 0.3),

    paranormal_whoosh: P('Paranormal whoosh', 'Cold sudden chill — something passed by.', ['horror', 'ambience', 'magic'], [
      noise('pink'),
      filter('bandpass', 1000, 5, { shape: 'reverse-sharkfin', dur: 500, depth: 2000 }),
      env(50, 500, 400),
      ch(2, 0.008, 0.6),
      rvX('cathedral', 3.0, 0.55),
    ], 0.35),

    demonic_growl: P('Demonic growl', 'Low menacing rumble from beyond.', ['horror', 'creature'], [
      tone('sawtooth', [{ t: 0, freq: 'A1' }, { t: 1500, freq: 'F1', ramp: 'linear' }], 4, 8),
      filter('lowpass', 400, 5),
      env(30, 1500, 600),
      dist(150, 0.6),
      rvX('cathedral', 3.0, 0.5),
    ], 0.45),

    footstep_snow: withRandom(P('Footstep snow', 'Soft crunch of boot on fresh snow.', ['footstep', 'movement', 'ambience'], [
      noise('pink'),
      filter('lowpass', 1892, 0.1, { shape: 'ramp-down', dur: 50, depth: -100 }),
      env(61, 45, 139),
    ], 0.45), { pitch: 0.32, time: 0.09, filter: 0.18, gain: 0.055 }),

  };

  const PRESET_ORDER = Object.keys(PRESETS);

  window.PRESETS = PRESETS;
  window.PRESET_ORDER = PRESET_ORDER;
})();
