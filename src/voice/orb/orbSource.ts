import type { Bands } from "../audio/computeBands";

/**
 * OrbAudioSource decouples the visual orb from *where* its reactivity comes
 * from. A source returns the target band energies for the current frame, or
 * `null` when there is no active audio (the orb then falls back to its gentle
 * idle animation).
 *
 * Implementations:
 *   - useMicOrbSource            → raw microphone via AnalyserNode
 *   - useElevenLabsOrbSource     → ElevenLabs conversation (user mic + AI voice)
 */
export interface OrbAudioSource {
  /** Target bands for this frame, or null to fall back to idle. */
  getTargetBands: () => Bands | null;
}
