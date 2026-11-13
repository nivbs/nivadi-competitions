/** Tiny synthesized sounds (no assets). Audio is best-effort and only runs after a user gesture. */

function ctx(): AudioContext | null {
  try {
    return new window.AudioContext();
  } catch {
    return null;
  }
}

/** Dramatic cymbal crash: filtered white-noise burst with a long decay. */
export function crash() {
  const c = ctx();
  if (!c) return;
  const len = c.sampleRate * 1.6;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 5200;
  const g = c.createGain();
  g.gain.setValueAtTime(0.22, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.5);
  src.connect(hp).connect(g).connect(c.destination);
  src.start();
  src.onended = () => void c.close();
}

/** Comic "bonk": a quick falling sine thump. */
export function bonk() {
  const c = ctx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(320, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(70, c.currentTime + 0.18);
  g.gain.setValueAtTime(0.25, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.22);
  o.connect(g).connect(c.destination);
  o.start();
  o.stop(c.currentTime + 0.25);
  o.onended = () => void c.close();
}
