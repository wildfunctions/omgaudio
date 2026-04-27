// SynthEngine — modular procedural sound synth
// Exposes a global window.SynthEngine consumed by editor.html and index.html.
(function (root) {
  'use strict';

  const NOISE_COLORS = ['white', 'pink', 'brown'];
  const SHAPES = ['sharkfin', 'reverse-sharkfin', 'triangle', 'ramp-up', 'ramp-down'];
  const FILTER_TYPES = ['bandpass', 'lowpass', 'highpass', 'notch', 'peaking', 'lowshelf', 'highshelf'];
  const WAVEFORMS = ['sine', 'square', 'triangle', 'sawtooth'];

  function makeNoiseBuffer(ac, type, lengthSec) {
    const len = Math.max(1, Math.floor(ac.sampleRate * lengthSec));
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    if (type === 'white') {
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    } else if (type === 'pink') {
      let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886*b0 + w*0.0555179;
        b1 = 0.99332*b1 + w*0.0750759;
        b2 = 0.96900*b2 + w*0.1538520;
        b3 = 0.86650*b3 + w*0.3104856;
        b4 = 0.55000*b4 + w*0.5329522;
        b5 = -0.7616*b5 - w*0.0168980;
        d[i] = (b0+b1+b2+b3+b4+b5+b6 + w*0.5362) * 0.11;
        b6 = w * 0.115926;
      }
    } else {
      let last = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.5;
      }
    }
    return buf;
  }

  function shapeCurve(shapeName, samples) {
    const arr = new Float32Array(samples);
    const safePow = (b, e) => Math.pow(Math.max(0, b), e);
    for (let i = 0; i < samples; i++) {
      const t = i / (samples - 1);
      let v = 0;
      switch (shapeName) {
        case 'sharkfin': v = t < 0.18 ? t / 0.18 : safePow(1 - (t - 0.18) / 0.82, 1.6); break;
        case 'reverse-sharkfin': v = t < 0.82 ? safePow(t / 0.82, 1.6) : 1 - (t - 0.82) / 0.18; break;
        case 'triangle': v = t < 0.5 ? t * 2 : 2 - t * 2; break;
        case 'ramp-up': v = t; break;
        case 'ramp-down': v = 1 - t; break;
      }
      if (!Number.isFinite(v)) v = 0;
      arr[i] = Math.max(0, Math.min(1, v));
    }
    return arr;
  }

  function makeImpulseResponse(ac, decaySec, type) {
    const sr = ac.sampleRate;
    const len = Math.max(1, Math.floor(sr * decaySec));
    const buf = ac.createBuffer(2, len, sr);
    type = type || 'hall';

    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);

      if (type === 'room') {
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 4);
        const refls = [{ t: 0.005, g: 0.6 }, { t: 0.013, g: 0.4 }, { t: 0.022, g: 0.3 }, { t: 0.034, g: 0.2 }];
        for (const r of refls) {
          const idx = Math.floor(r.t * sr);
          if (idx < len) data[idx] += (Math.random() * 2 - 1) * r.g;
        }
      } else if (type === 'hall') {
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
      } else if (type === 'cathedral') {
        let prev = 0;
        for (let i = 0; i < len; i++) {
          const sample = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.4);
          prev = prev * 0.7 + sample * 0.3;
          data[i] = prev;
        }
      } else if (type === 'plate') {
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.1);
        for (let i = len - 1; i > 0; i--) data[i] = data[i] - 0.55 * data[i - 1];
      } else if (type === 'spring') {
        for (let i = 0; i < len; i++) data[i] = 0;
        const periods = [0.018, 0.029, 0.043, 0.067, 0.091];
        for (const period of periods) {
          const periodSamples = Math.max(1, Math.floor(period * sr));
          let amp = 0.5;
          for (let pos = 0; pos < len; pos += periodSamples) {
            data[pos] += (Math.random() * 2 - 1) * amp * Math.pow(1 - pos / len, 1.8);
            amp *= 0.65;
          }
        }
      } else if (type === 'tunnel') {
        for (let i = 0; i < len; i++) {
          const flutter = 1 + 0.3 * Math.sin(i * 2 * Math.PI / (sr * 0.05));
          data[i] = (Math.random() * 2 - 1) * flutter * Math.pow(1 - i / len, 1.8);
        }
      } else {
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      }
    }
    return buf;
  }

  // Music-note → Hz parser. Accepts:
  //   "A4"     (natural)            → 440
  //   "C#4" / "Cs4" / "C♯4"         → 277.18  (sharp; `s` accepted as JSON-friendly alt)
  //   "Bb4" / "B♭4"                 → 466.16  (flat)
  //   "C4#" / "C4b"                 → tolerated (octave-then-accidental)
  //   numbers pass through unchanged
  // Returns null if unparseable.
  function noteToFreq(note) {
    if (note == null) return null;
    if (typeof note === 'number') return Number.isFinite(note) ? note : null;
    if (typeof note !== 'string') return null;
    const s = note.trim();
    if (s === '') return null;
    if (/^-?\d+(\.\d+)?$/.test(s)) return parseFloat(s);
    let m = s.match(/^([A-Ga-g])([#sb♯♭]?)(-?\d+)$/);
    if (m) return _spnToHz(m[1], m[2], parseInt(m[3], 10));
    m = s.match(/^([A-Ga-g])(-?\d+)([#sb♯♭]?)$/);
    if (m) return _spnToHz(m[1], m[3], parseInt(m[2], 10));
    return null;
  }
  function _spnToHz(letter, accidental, octave) {
    const map = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    let semis = map[letter.toUpperCase()];
    if (semis == null) return null;
    if (accidental === '#' || accidental === 's' || accidental === '♯') semis += 1;
    else if (accidental === 'b' || accidental === '♭') semis -= 1;
    const midi = (octave + 1) * 12 + semis;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }
  function freqOf(v) { const f = noteToFreq(v); return f == null ? 440 : f; }

  function makeBitcrushCurve(bits) {
    const n = 4096;
    const levels = Math.pow(2, bits);
    const curve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i * 2 / n) - 1;
      curve[i] = Math.round(x * levels) / levels;
    }
    return curve;
  }

  function makeDistortionCurve(amount) {
    // tanh soft-clipping with drive. As amount increases, drive grows and
    // the curve approaches a square wave; output is normalized to ±1 so the
    // wet path stays audible vs the dry path.
    const n = 2048;
    const curve = new Float32Array(n);
    const drive = 1 + Math.max(0, amount) * 0.2;
    const norm = 1 / Math.tanh(drive);
    for (let i = 0; i < n; i++) {
      const x = (i * 2) / (n - 1) - 1;
      curve[i] = Math.tanh(drive * x) * norm;
    }
    return curve;
  }

  const NODE_DEFS = {
    noise: {
      label: 'Noise generator',
      kind: 'generator',
      defaults: { color: 'pink' },
      ui: () => [
        { key: 'color', label: 'Color', type: 'select', options: NOISE_COLORS },
      ],
      build: (ac, p, totalDur) => {
        const src = ac.createBufferSource();
        src.buffer = makeNoiseBuffer(ac, p.color, totalDur);
        return { in: null, out: src, start: t => src.start(t), stop: t => src.stop(t) };
      },
    },

    fm: {
      label: 'FM (carrier + modulator)',
      kind: 'generator',
      defaults: {
        waveform: 'sine',
        points: [{ t: 0, freq: 'A4' }],
        modRatio: 1,
        modIndex: 5,
        modDecay: 300,
      },
      ui: () => [
        { type: 'note', text: '⚠ Lower Master gain before experimenting. High mod index (>15) + high carrier frequency or irrational ratios can produce piercing inharmonic content — start with modIndex 2–6 and modDecay >100ms, then explore.' },
        { key: 'waveform', label: 'Carrier wave', type: 'select', options: WAVEFORMS },
        { key: 'points', label: 'Carrier freq points', type: 'points' },
        { key: 'modRatio', label: 'Mod ratio', type: 'range', min: 0.1, max: 12, step: 0.05 },
        { key: 'modIndex', label: 'Mod index (depth)', type: 'range', min: 0, max: 40, step: 0.1 },
        { key: 'modDecay', label: 'Mod decay (ms)', type: 'range', min: 5, max: 4000, step: 1 },
      ],
      build: (ac, p) => {
        const carrier = ac.createOscillator();
        carrier.type = p.waveform;
        const mod = ac.createOscillator();
        mod.type = 'sine';
        const modGain = ac.createGain();
        modGain.gain.value = 0;
        mod.connect(modGain).connect(carrier.frequency);
        const points = Array.isArray(p.points) && p.points.length ? p.points : [{ t: 0, freq: 'A4' }];
        return {
          in: null, out: carrier,
          start: t => { carrier.start(t); mod.start(t); },
          stop: t => { carrier.stop(t); mod.stop(t); },
          schedule: (t0) => {
            carrier.frequency.cancelScheduledValues(0);
            mod.frequency.cancelScheduledValues(0);
            modGain.gain.cancelScheduledValues(0);
            const ratio = Math.max(0.01, p.modRatio);
            const firstFreq = Math.max(0.01, freqOf(points[0].freq));
            carrier.frequency.setValueAtTime(firstFreq, t0);
            mod.frequency.setValueAtTime(firstFreq * ratio, t0);
            for (let i = 1; i < points.length; i++) {
              const pt = points[i];
              const tT = t0 + (pt.t || 0) / 1000;
              const f = Math.max(0.01, freqOf(pt.freq));
              const ramp = pt.ramp || 'step';
              if (ramp === 'linear') {
                carrier.frequency.linearRampToValueAtTime(f, tT);
                mod.frequency.linearRampToValueAtTime(f * ratio, tT);
              } else if (ramp === 'exp') {
                carrier.frequency.exponentialRampToValueAtTime(f, tT);
                mod.frequency.exponentialRampToValueAtTime(f * ratio, tT);
              } else {
                carrier.frequency.setValueAtTime(f, tT);
                mod.frequency.setValueAtTime(f * ratio, tT);
              }
            }
            const peakGain = p.modIndex * firstFreq * ratio;
            if (peakGain > 0.001) {
              modGain.gain.setValueAtTime(peakGain, t0);
              modGain.gain.exponentialRampToValueAtTime(0.001, t0 + Math.max(0.005, p.modDecay / 1000));
            } else {
              modGain.gain.setValueAtTime(0, t0);
            }
          },
        };
      },
    },

    tone: {
      label: 'Tone generator',
      kind: 'generator',
      defaults: {
        waveform: 'square',
        points: [{ t: 0, freq: 'A4' }],
        vibratoRate: 0,
        vibratoDepth: 0,
      },
      ui: () => [
        { key: 'waveform', label: 'Waveform', type: 'select', options: WAVEFORMS },
        { key: 'points', label: 'Frequency points', type: 'points' },
        { key: 'vibratoRate', label: 'Vibrato rate (Hz)', type: 'range', min: 0, max: 30, step: 0.1 },
        { key: 'vibratoDepth', label: 'Vibrato depth (Hz)', type: 'range', min: 0, max: 200, step: 1 },
      ],
      build: (ac, p) => {
        const osc = ac.createOscillator();
        osc.type = p.waveform;
        let vib = null, vibGain = null;
        if (p.vibratoRate > 0 && p.vibratoDepth > 0) {
          vib = ac.createOscillator();
          vib.frequency.value = p.vibratoRate;
          vibGain = ac.createGain();
          vibGain.gain.value = p.vibratoDepth;
          vib.connect(vibGain).connect(osc.frequency);
        }
        const points = Array.isArray(p.points) ? p.points : [];
        return {
          in: null, out: osc,
          start: t => { osc.start(t); if (vib) vib.start(t); },
          stop: t => { osc.stop(t); if (vib) vib.stop(t); },
          schedule: (t0) => {
            if (!points.length) { osc.frequency.setValueAtTime(440, t0); return; }
            osc.frequency.cancelScheduledValues(0);
            osc.frequency.setValueAtTime(Math.max(0.01, freqOf(points[0].freq)), t0);
            for (let i = 1; i < points.length; i++) {
              const pt = points[i];
              const tT = t0 + (pt.t || 0) / 1000;
              const f = Math.max(0.01, freqOf(pt.freq));
              const ramp = pt.ramp || 'step';
              if (ramp === 'linear') osc.frequency.linearRampToValueAtTime(f, tT);
              else if (ramp === 'exp') osc.frequency.exponentialRampToValueAtTime(f, tT);
              else osc.frequency.setValueAtTime(f, tT);
            }
          },
        };
      },
    },

    filter: {
      label: 'Filter',
      kind: 'effect',
      defaults: { type: 'bandpass', cutoff: 600, q: 6, modEnabled: true, modShape: 'sharkfin', modDur: 220, modDepth: 3500 },
      ui: () => [
        { key: 'type', label: 'Type', type: 'select', options: FILTER_TYPES },
        { key: 'cutoff', label: 'Cutoff (Hz)', type: 'range', min: 50, max: 10000, step: 1 },
        { key: 'q', label: 'Resonance (Q)', type: 'range', min: 0.1, max: 30, step: 0.1 },
        { key: 'modEnabled', label: 'Sweep cutoff', type: 'checkbox' },
        { key: 'modShape', label: 'Sweep shape', type: 'select', options: SHAPES },
        { key: 'modDur', label: 'Sweep time (ms)', type: 'range', min: 50, max: 2000, step: 1 },
        { key: 'modDepth', label: 'Sweep depth (Hz)', type: 'range', min: -8000, max: 8000, step: 1 },
      ],
      build: (ac, p) => {
        const f = ac.createBiquadFilter();
        f.type = p.type; f.Q.value = p.q;
        return {
          in: f, out: f,
          schedule: (t0) => {
            if (p.modEnabled) {
              const curve = shapeCurve(p.modShape, 256);
              const sweep = new Float32Array(curve.length);
              for (let i = 0; i < curve.length; i++) sweep[i] = Math.max(1, p.cutoff + curve[i] * p.modDepth);
              f.frequency.cancelScheduledValues(0);
              f.frequency.setValueCurveAtTime(sweep, t0, p.modDur / 1000);
            } else {
              f.frequency.value = p.cutoff;
            }
          },
        };
      },
    },

    envelope: {
      label: 'Envelope',
      kind: 'effect',
      defaults: { attack: 15, hold: 220, release: 160 },
      ui: () => [
        { key: 'attack', label: 'Attack (ms)', type: 'range', min: 1, max: 1000, step: 1 },
        { key: 'hold', label: 'Hold (ms)', type: 'range', min: 0, max: 3000, step: 1 },
        { key: 'release', label: 'Release (ms)', type: 'range', min: 20, max: 3000, step: 1 },
      ],
      build: (ac, p) => {
        const g = ac.createGain();
        g.gain.value = 0;
        return {
          in: g, out: g,
          schedule: (t0) => {
            const a = p.attack / 1000, h = p.hold / 1000, r = p.release / 1000;
            g.gain.setValueAtTime(0, t0);
            g.gain.linearRampToValueAtTime(1, t0 + a);
            g.gain.setValueAtTime(1, t0 + a + h);
            g.gain.linearRampToValueAtTime(0, t0 + a + h + r);
          },
          getDuration: () => (p.attack + p.hold + p.release) / 1000,
        };
      },
    },

    distortion: {
      label: 'Distortion',
      kind: 'effect',
      defaults: { amount: 30, wet: 0.5 },
      ui: () => [
        { key: 'amount', label: 'Amount', type: 'range', min: 0, max: 200, step: 1 },
        { key: 'wet', label: 'Wet/dry', type: 'range', min: 0, max: 1, step: 0.01 },
      ],
      build: (ac, p) => {
        const input = ac.createGain();
        const ws = ac.createWaveShaper();
        ws.curve = makeDistortionCurve(p.amount); ws.oversample = '4x';
        const wet = ac.createGain(); wet.gain.value = p.wet;
        const dry = ac.createGain(); dry.gain.value = 1 - p.wet;
        const out = ac.createGain();
        input.connect(dry).connect(out);
        input.connect(ws).connect(wet).connect(out);
        return { in: input, out };
      },
    },

    delay: {
      label: 'Delay',
      kind: 'effect',
      defaults: { time: 180, feedback: 0.4, wet: 0.4 },
      ui: () => [
        { key: 'time', label: 'Time (ms)', type: 'range', min: 1, max: 1500, step: 1 },
        { key: 'feedback', label: 'Feedback', type: 'range', min: 0, max: 0.95, step: 0.01 },
        { key: 'wet', label: 'Wet/dry', type: 'range', min: 0, max: 1, step: 0.01 },
      ],
      build: (ac, p) => {
        const input = ac.createGain();
        const dl = ac.createDelay(2.0); dl.delayTime.value = p.time / 1000;
        const fb = ac.createGain(); fb.gain.value = p.feedback;
        const wet = ac.createGain(); wet.gain.value = p.wet;
        const dry = ac.createGain(); dry.gain.value = 1;
        const out = ac.createGain();
        input.connect(dry).connect(out);
        input.connect(dl);
        dl.connect(fb).connect(dl);
        dl.connect(wet).connect(out);
        return { in: input, out, tail: () => p.time / 1000 / Math.max(0.001, 1 - p.feedback) };
      },
    },

    reverb: {
      label: 'Reverb',
      kind: 'effect',
      defaults: { type: 'hall', decay: 1.5, wet: 0.35 },
      ui: () => [
        { key: 'type', label: 'Space', type: 'select', options: ['room', 'hall', 'cathedral', 'plate', 'spring', 'tunnel'] },
        { key: 'decay', label: 'Decay (s)', type: 'range', min: 0.1, max: 6, step: 0.1 },
        { key: 'wet', label: 'Wet/dry', type: 'range', min: 0, max: 1, step: 0.01 },
      ],
      build: (ac, p) => {
        const input = ac.createGain();
        const conv = ac.createConvolver(); conv.buffer = makeImpulseResponse(ac, p.decay, p.type);
        const wet = ac.createGain(); wet.gain.value = p.wet;
        const dry = ac.createGain(); dry.gain.value = 1;
        const out = ac.createGain();
        input.connect(dry).connect(out);
        input.connect(conv).connect(wet).connect(out);
        return { in: input, out, tail: () => p.decay };
      },
    },

    bitcrusher: {
      label: 'Bitcrusher',
      kind: 'effect',
      defaults: { bits: 4, bandwidth: 4000, wet: 1.0 },
      ui: () => [
        { key: 'bits', label: 'Bit depth', type: 'range', min: 1, max: 16, step: 1 },
        { key: 'bandwidth', label: 'Bandwidth (Hz)', type: 'range', min: 200, max: 16000, step: 100 },
        { key: 'wet', label: 'Wet/dry', type: 'range', min: 0, max: 1, step: 0.01 },
      ],
      build: (ac, p) => {
        const input = ac.createGain();
        const ws = ac.createWaveShaper();
        ws.curve = makeBitcrushCurve(p.bits);
        const lp = ac.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = p.bandwidth; lp.Q.value = 0.7;
        const wet = ac.createGain(); wet.gain.value = p.wet;
        const dry = ac.createGain(); dry.gain.value = 1 - p.wet;
        const out = ac.createGain();
        input.connect(dry).connect(out);
        input.connect(ws).connect(lp).connect(wet).connect(out);
        return { in: input, out };
      },
    },

    pingpong: {
      label: 'Ping-pong delay',
      kind: 'effect',
      defaults: { time: 200, feedback: 0.55, wet: 0.5 },
      ui: () => [
        { key: 'time', label: 'Time (ms)', type: 'range', min: 1, max: 1500, step: 1 },
        { key: 'feedback', label: 'Feedback', type: 'range', min: 0, max: 0.95, step: 0.01 },
        { key: 'wet', label: 'Wet/dry', type: 'range', min: 0, max: 1, step: 0.01 },
      ],
      build: (ac, p) => {
        const input = ac.createGain();
        const dlL = ac.createDelay(2.0); dlL.delayTime.value = p.time / 1000;
        const dlR = ac.createDelay(2.0); dlR.delayTime.value = p.time / 1000;
        const fb = ac.createGain(); fb.gain.value = p.feedback;
        const merger = ac.createChannelMerger(2);
        const wet = ac.createGain(); wet.gain.value = p.wet;
        const dry = ac.createGain(); dry.gain.value = 1;
        const out = ac.createGain();
        input.connect(dry).connect(out);
        input.connect(dlL);
        dlL.connect(merger, 0, 0);
        dlL.connect(dlR);
        dlR.connect(merger, 0, 1);
        dlR.connect(fb);
        fb.connect(dlL);
        merger.connect(wet).connect(out);
        return { in: input, out, tail: () => p.time / 1000 / Math.max(0.001, 1 - p.feedback) };
      },
    },

    chorus: {
      label: 'Chorus',
      kind: 'effect',
      defaults: { rate: 1.5, depth: 0.003, wet: 0.5 },
      ui: () => [
        { key: 'rate', label: 'Rate (Hz)', type: 'range', min: 0.1, max: 8, step: 0.1 },
        { key: 'depth', label: 'Depth (s)', type: 'range', min: 0.0005, max: 0.02, step: 0.0005 },
        { key: 'wet', label: 'Wet/dry', type: 'range', min: 0, max: 1, step: 0.01 },
      ],
      build: (ac, p) => {
        const input = ac.createGain();
        const dl = ac.createDelay(0.05); dl.delayTime.value = 0.015;
        const lfo = ac.createOscillator(); lfo.frequency.value = p.rate;
        const lfoGain = ac.createGain(); lfoGain.gain.value = p.depth;
        lfo.connect(lfoGain).connect(dl.delayTime);
        lfo.start();
        const wet = ac.createGain(); wet.gain.value = p.wet;
        const dry = ac.createGain(); dry.gain.value = 1;
        const out = ac.createGain();
        input.connect(dry).connect(out);
        input.connect(dl).connect(wet).connect(out);
        return { in: input, out, stop: t => lfo.stop(t) };
      },
    },

    phaser: {
      label: 'Phaser',
      kind: 'effect',
      defaults: { rate: 0.5, depth: 800, baseFreq: 600, feedback: 0.5, wet: 0.6 },
      ui: () => [
        { key: 'rate', label: 'Rate (Hz)', type: 'range', min: 0.05, max: 5, step: 0.05 },
        { key: 'depth', label: 'Depth (Hz)', type: 'range', min: 50, max: 4000, step: 10 },
        { key: 'baseFreq', label: 'Base freq', type: 'range', min: 100, max: 4000, step: 10 },
        { key: 'feedback', label: 'Feedback', type: 'range', min: 0, max: 0.9, step: 0.01 },
        { key: 'wet', label: 'Wet/dry', type: 'range', min: 0, max: 1, step: 0.01 },
      ],
      build: (ac, p) => {
        const input = ac.createGain();
        const stages = [];
        for (let i = 0; i < 4; i++) {
          const ap = ac.createBiquadFilter();
          ap.type = 'allpass'; ap.frequency.value = p.baseFreq; ap.Q.value = 1;
          stages.push(ap);
        }
        for (let i = 0; i < stages.length - 1; i++) stages[i].connect(stages[i + 1]);
        input.connect(stages[0]);
        const fb = ac.createGain(); fb.gain.value = p.feedback;
        stages[stages.length - 1].connect(fb).connect(stages[0]);
        const lfo = ac.createOscillator(); lfo.frequency.value = p.rate;
        const lfoGain = ac.createGain(); lfoGain.gain.value = p.depth;
        lfo.connect(lfoGain);
        stages.forEach(s => lfoGain.connect(s.frequency));
        lfo.start();
        const wet = ac.createGain(); wet.gain.value = p.wet;
        const dry = ac.createGain(); dry.gain.value = 1;
        const out = ac.createGain();
        input.connect(dry).connect(out);
        stages[stages.length - 1].connect(wet).connect(out);
        return { in: input, out, stop: t => lfo.stop(t) };
      },
    },
  };

  function clonePatch(p) { return JSON.parse(JSON.stringify(p)); }

  function getCategories(preset) {
    if (!preset) return [];
    if (Array.isArray(preset.categories)) return preset.categories;
    if (preset.category) return [preset.category];
    return [];
  }

  function applyRandom(patch) {
    const r = patch && patch.random;
    if (!r) return patch;
    const any = (r.pitch || r.time || r.filter || r.gain);
    if (!any) return patch;
    const out = clonePatch(patch);
    const jit = (val, amount) => val * (1 + (Math.random() - 0.5) * 2 * amount);
    for (const v of getVoices(out)) {
      for (const node of v.nodes) {
        if (node.type === 'tone' || node.type === 'fm') {
          if (Array.isArray(node.params.points)) {
            for (const p of node.params.points) {
              if (r.pitch && p.freq != null) p.freq = jit(freqOf(p.freq), r.pitch);
              if (r.time && p.t > 0) p.t = jit(p.t, r.time);
            }
          }
        } else if (node.type === 'filter') {
          if (r.filter && node.params.cutoff) node.params.cutoff = Math.max(20, jit(node.params.cutoff, r.filter));
          if (r.time && node.params.modDur) node.params.modDur = Math.max(20, jit(node.params.modDur, r.time));
        } else if (node.type === 'envelope') {
          if (r.time) {
            node.params.attack = Math.max(1, jit(node.params.attack, r.time));
            node.params.hold = Math.max(0, jit(node.params.hold, r.time));
            node.params.release = Math.max(20, jit(node.params.release, r.time));
          }
        }
      }
      if (r.gain && v.gain != null) v.gain = Math.max(0, jit(v.gain, r.gain));
    }
    if (r.gain && out.output && out.output.gain != null) out.output.gain = Math.max(0, jit(out.output.gain, r.gain));
    return out;
  }

  function getVoices(patch) {
    if (Array.isArray(patch.voices)) return patch.voices;
    if (Array.isArray(patch.nodes)) return [{ gain: 1, nodes: patch.nodes }];
    return [];
  }

  function findFirst(patch, type) {
    for (const v of getVoices(patch)) {
      const f = v.nodes.find(n => n.type === type);
      if (f) return f;
    }
    return undefined;
  }

  function computeTotalDuration(patch) {
    let dur = 0.5;
    let tail = 0;
    for (const v of getVoices(patch)) {
      const env = v.nodes.find(n => n.type === 'envelope');
      if (env) {
        const d = (env.params.attack + env.params.hold + env.params.release) / 1000;
        if (d > dur) dur = d;
      }
      const tone = v.nodes.find(n => n.type === 'tone');
      if (tone && Array.isArray(tone.params.points) && tone.params.points.length) {
        const last = tone.params.points[tone.params.points.length - 1];
        const td = (last.t || 0) / 1000;
        if (td > dur) dur = td;
      }
      for (const n of v.nodes) {
        if (n.type === 'reverb') tail = Math.max(tail, n.params.decay);
        if (n.type === 'delay' || n.type === 'pingpong') tail = Math.max(tail, (n.params.time / 1000) * 6);
      }
    }
    return dur + tail + 0.05;
  }

  function buildChain(ac, dest, patchIn) {
    const patch = applyRandom(patchIn);
    const totalDur = computeTotalDuration(patch);
    const t0 = ac.currentTime + 0.02;

    const outGain = ac.createGain();
    outGain.gain.value = patch.output ? patch.output.gain : 0.5;
    outGain.connect(dest);

    for (const voice of getVoices(patch)) {
      const voiceGain = ac.createGain();
      voiceGain.gain.value = voice.gain != null ? voice.gain : 1;
      voiceGain.connect(outGain);

      const built = voice.nodes.map(n => NODE_DEFS[n.type].build(ac, n.params, totalDur));
      let prev = null;
      for (const b of built) {
        if (prev && b.in) prev.out.connect(b.in);
        prev = b;
      }
      if (prev) prev.out.connect(voiceGain);

      for (const b of built) if (b.schedule) b.schedule(t0);
      for (const b of built) {
        if (b.start) b.start(t0);
        if (b.stop) b.stop(t0 + totalDur);
      }
    }

    return { totalDur, t0 };
  }

  function renderOffline(patch, sr) {
    sr = sr || 44100;
    const totalDur = computeTotalDuration(patch);
    const offline = new OfflineAudioContext(1, Math.ceil(sr * (totalDur + 0.1)), sr);
    buildChain(offline, offline.destination, patch);
    return offline.startRendering();
  }

  function encodeWav(buffer, opts) {
    opts = opts || {};
    const ch = buffer.numberOfChannels, sr = buffer.sampleRate, n = buffer.length;
    const dataLen = n * ch * 2;
    const smplLen = opts.loop ? 68 : 0;
    const totalLen = 36 + dataLen + smplLen;
    const ab = new ArrayBuffer(44 + dataLen + smplLen);
    const v = new DataView(ab);
    const ws = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    ws(0, 'RIFF'); v.setUint32(4, totalLen, true); ws(8, 'WAVE');
    ws(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
    v.setUint16(22, ch, true); v.setUint32(24, sr, true);
    v.setUint32(28, sr * ch * 2, true); v.setUint16(32, ch * 2, true); v.setUint16(34, 16, true);
    ws(36, 'data'); v.setUint32(40, dataLen, true);
    let off = 44;
    for (let i = 0; i < n; i++) {
      for (let c = 0; c < ch; c++) {
        const s = Math.max(-1, Math.min(1, buffer.getChannelData(c)[i]));
        v.setInt16(off, s * 0x7fff, true); off += 2;
      }
    }
    if (opts.loop) {
      // smpl chunk — RIFF spec, 1 forward loop spanning the whole file
      ws(off, 'smpl'); off += 4;
      v.setUint32(off, 60, true); off += 4;            // chunk size: 36 + 24
      v.setUint32(off, 0, true); off += 4;             // manufacturer
      v.setUint32(off, 0, true); off += 4;             // product
      v.setUint32(off, Math.round(1e9 / sr), true); off += 4; // sample period (ns)
      v.setUint32(off, 60, true); off += 4;            // MIDI unity note (C4)
      v.setUint32(off, 0, true); off += 4;             // MIDI pitch fraction
      v.setUint32(off, 0, true); off += 4;             // SMPTE format
      v.setUint32(off, 0, true); off += 4;             // SMPTE offset
      v.setUint32(off, 1, true); off += 4;             // num loops
      v.setUint32(off, 0, true); off += 4;             // sampler data
      v.setUint32(off, 0, true); off += 4;             // loop cue id
      v.setUint32(off, 0, true); off += 4;             // loop type (0 = forward)
      v.setUint32(off, 0, true); off += 4;             // loop start sample
      v.setUint32(off, n - 1, true); off += 4;         // loop end sample
      v.setUint32(off, 0, true); off += 4;             // fraction
      v.setUint32(off, 0, true); off += 4;             // play count (0 = infinite)
    }
    return ab;
  }

  // ----- minimal STORE-only ZIP encoder -----
  let _crcTable;
  function _crc32(data) {
    if (!_crcTable) {
      _crcTable = new Uint32Array(256);
      for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
        _crcTable[i] = c;
      }
    }
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) crc = (crc >>> 8) ^ _crcTable[(crc ^ data[i]) & 0xFF];
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }
  function makeZip(entries) {
    // entries: [{ name, data }] where data is Uint8Array
    const enc = new TextEncoder();
    const parts = [];
    const cdParts = [];
    let offset = 0, cdSize = 0;
    for (const entry of entries) {
      const name = enc.encode(entry.name);
      const data = entry.data instanceof Uint8Array ? entry.data : new Uint8Array(entry.data);
      const crc = _crc32(data);
      const lfh = new ArrayBuffer(30);
      const lv = new DataView(lfh);
      lv.setUint32(0, 0x04034b50, true);
      lv.setUint16(4, 20, true);
      lv.setUint16(6, 0, true);
      lv.setUint16(8, 0, true);
      lv.setUint16(10, 0, true);
      lv.setUint16(12, 0, true);
      lv.setUint32(14, crc, true);
      lv.setUint32(18, data.length, true);
      lv.setUint32(22, data.length, true);
      lv.setUint16(26, name.length, true);
      lv.setUint16(28, 0, true);
      parts.push(new Uint8Array(lfh)); parts.push(name); parts.push(data);
      const cdh = new ArrayBuffer(46);
      const cv = new DataView(cdh);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true); cv.setUint16(6, 20, true);
      cv.setUint16(8, 0, true); cv.setUint16(10, 0, true);
      cv.setUint16(12, 0, true); cv.setUint16(14, 0, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true);
      cv.setUint16(28, name.length, true);
      cv.setUint16(30, 0, true); cv.setUint16(32, 0, true);
      cv.setUint16(34, 0, true); cv.setUint16(36, 0, true);
      cv.setUint32(38, 0, true); cv.setUint32(42, offset, true);
      cdParts.push(new Uint8Array(cdh)); cdParts.push(name);
      const entrySize = 30 + name.length + data.length;
      offset += entrySize;
      cdSize += 46 + name.length;
    }
    const eocd = new ArrayBuffer(22);
    const ev = new DataView(eocd);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true); ev.setUint16(6, 0, true);
    ev.setUint16(8, entries.length, true); ev.setUint16(10, entries.length, true);
    ev.setUint32(12, cdSize, true); ev.setUint32(16, offset, true);
    ev.setUint16(20, 0, true);

    let totalSize = offset + cdSize + 22;
    const out = new Uint8Array(totalSize);
    let pos = 0;
    for (const p of parts) { out.set(p, pos); pos += p.length; }
    for (const p of cdParts) { out.set(p, pos); pos += p.length; }
    out.set(new Uint8Array(eocd), pos);
    return out;
  }

  root.SynthEngine = {
    NODE_DEFS, NOISE_COLORS, SHAPES, FILTER_TYPES, WAVEFORMS,
    makeNoiseBuffer, shapeCurve, makeImpulseResponse, makeDistortionCurve, makeBitcrushCurve,
    clonePatch, getVoices, findFirst, computeTotalDuration, buildChain, renderOffline, encodeWav,
    applyRandom, noteToFreq, freqOf, getCategories, makeZip,
  };
})(window);
