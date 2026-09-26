/**
 * computeBands
 *
 * Takes raw FFT byte-frequency data from an AnalyserNode and returns
 * normalised band values { bass, mid, treble, level } all in [0, 1].
 *
 * Bands are mapped from *frequency (Hz)*, not raw bin thirds, so that a
 * human voice — whose energy sits mostly below ~4 kHz — actually drives
 * all three bands instead of dumping everything into "bass".
 *
 *   bass   ~20  .. 250  Hz
 *   mid    ~250 .. 2000 Hz
 *   treble ~2000.. 6000 Hz
 *   level  ~20  .. 6000 Hz  (broadband voice loudness)
 *
 * Applies exponential smoothing toward previous values.
 */
export interface Bands {
  bass: number;
  mid: number;
  treble: number;
  level: number;
}

// Perceptual band edges in Hz. Chosen for speech, not music mastering.
const BASS_HZ: [number, number] = [20, 250];
const MID_HZ: [number, number] = [250, 2000];
const TREBLE_HZ: [number, number] = [2000, 6000];

const DEFAULT_SAMPLE_RATE = 48000;

function averageBins(data: Uint8Array, start: number, end: number): number {
  const clampedStart = Math.max(0, Math.min(start, data.length));
  const clampedEnd = Math.max(clampedStart, Math.min(end, data.length));
  if (clampedEnd <= clampedStart) return 0;
  let sum = 0;
  for (let i = clampedStart; i < clampedEnd; i++) {
    sum += data[i];
  }
  return sum / (clampedEnd - clampedStart) / 255;
}

/**
 * Average the byte-frequency energy over a frequency window [loHz, hiHz).
 * `binHz` is the width of one FFT bin: sampleRate / fftSize, where
 * fftSize = frequencyBinCount * 2 = data.length * 2.
 */
function averageHz(
  data: Uint8Array,
  loHz: number,
  hiHz: number,
  binHz: number
): number {
  // Ensure at least a one-bin window even when resolution is coarse.
  const lo = Math.floor(loHz / binHz);
  const hi = Math.max(lo + 1, Math.ceil(hiHz / binHz));
  return averageBins(data, lo, hi);
}

export function computeBands(
  frequencyData: Uint8Array,
  prev: Bands | null = null,
  smoothing: number = 0.8,
  sampleRate: number = DEFAULT_SAMPLE_RATE
): Bands {
  const len = frequencyData.length;
  if (len === 0) {
    return { bass: 0, mid: 0, treble: 0, level: 0 };
  }

  // data.length === frequencyBinCount === fftSize / 2
  const binHz = sampleRate / (len * 2);

  const rawBass = averageHz(frequencyData, BASS_HZ[0], BASS_HZ[1], binHz);
  const rawMid = averageHz(frequencyData, MID_HZ[0], MID_HZ[1], binHz);
  const rawTreble = averageHz(frequencyData, TREBLE_HZ[0], TREBLE_HZ[1], binHz);
  // Broadband loudness across the whole voice span (better proxy than the
  // mean of three unevenly sized bands).
  const rawLevel = averageHz(frequencyData, BASS_HZ[0], TREBLE_HZ[1], binHz);

  if (!prev) {
    return { bass: rawBass, mid: rawMid, treble: rawTreble, level: rawLevel };
  }

  // Exponential smoothing: keep `smoothing` of previous, add the rest from raw.
  const s = smoothing;
  return {
    bass: prev.bass * s + rawBass * (1 - s),
    mid: prev.mid * s + rawMid * (1 - s),
    treble: prev.treble * s + rawTreble * (1 - s),
    level: prev.level * s + rawLevel * (1 - s),
  };
}

/**
 * bandsFromThirds
 *
 * For byte-frequency arrays that are ALREADY limited to the voice range
 * (e.g. the ElevenLabs conversation SDK returns data "focused on 100-8000 Hz"),
 * a Hz→bin mapping over a full 0-Nyquist spectrum would be wrong. Here the
 * whole array is voice, so splitting it into thirds gives sensible
 * low / mid / high bands directly.
 */
export function bandsFromThirds(data: Uint8Array): Bands {
  const len = data.length;
  if (len === 0) return { bass: 0, mid: 0, treble: 0, level: 0 };
  const third = Math.floor(len / 3);
  return {
    bass: averageBins(data, 0, third),
    mid: averageBins(data, third, third * 2),
    treble: averageBins(data, third * 2, len),
    level: averageBins(data, 0, len),
  };
}

/** Component-wise maximum of two band sets (e.g. combine user mic + AI voice). */
export function maxBands(a: Bands, b: Bands): Bands {
  return {
    bass: Math.max(a.bass, b.bass),
    mid: Math.max(a.mid, b.mid),
    treble: Math.max(a.treble, b.treble),
    level: Math.max(a.level, b.level),
  };
}
