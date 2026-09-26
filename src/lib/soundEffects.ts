let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

export function playBellSound() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const frequencies = [830, 1245, 1660];
  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + 1.5);

    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = 15;

    gain.gain.setValueAtTime(0, now + i * 0.02);
    gain.gain.linearRampToValueAtTime(0.12 / (i + 1), now + i * 0.02 + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.02);
    osc.stop(now + 2);
  });

  const strikeOsc = ctx.createOscillator();
  const strikeGain = ctx.createGain();
  strikeOsc.type = 'triangle';
  strikeOsc.frequency.setValueAtTime(2500, now);
  strikeOsc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
  strikeGain.gain.setValueAtTime(0.15, now);
  strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  strikeOsc.connect(strikeGain);
  strikeGain.connect(ctx.destination);
  strikeOsc.start(now);
  strikeOsc.stop(now + 0.1);
}

export function playWaterSpraySound() {
  const ctx = getCtx();
  const now = ctx.currentTime;
  const duration = 1.2;

  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    const t = i / ctx.sampleRate;
    const envelope = Math.sin(Math.PI * t / duration);
    const burstEnvelope = 1 + 0.3 * Math.sin(t * 40);
    data[i] = (Math.random() * 2 - 1) * envelope * burstEnvelope;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 3000;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.setValueAtTime(6000, now);
  bandpass.frequency.linearRampToValueAtTime(4000, now + duration);
  bandpass.Q.value = 1.5;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
  gain.gain.setValueAtTime(0.18, now + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  source.connect(highpass);
  highpass.connect(bandpass);
  bandpass.connect(gain);
  gain.connect(ctx.destination);
  source.start(now);
}

export function playSplashSound() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const bufferSize = ctx.sampleRate * 0.5;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.15));
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.setValueAtTime(2000, now);
  lowpass.frequency.exponentialRampToValueAtTime(400, now + 0.4);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

  source.connect(lowpass);
  lowpass.connect(gain);
  gain.connect(ctx.destination);
  source.start(now);

  const thud = ctx.createOscillator();
  const thudGain = ctx.createGain();
  thud.frequency.setValueAtTime(150, now);
  thud.frequency.exponentialRampToValueAtTime(60, now + 0.1);
  thudGain.gain.setValueAtTime(0.15, now);
  thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  thud.connect(thudGain);
  thudGain.connect(ctx.destination);
  thud.start(now);
  thud.stop(now + 0.2);
}

export function playTreatSound() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const bounces = [
    { time: 0, freq: 800, dur: 0.06, vol: 0.15 },
    { time: 0.12, freq: 1000, dur: 0.05, vol: 0.1 },
    { time: 0.2, freq: 1200, dur: 0.04, vol: 0.07 },
    { time: 0.26, freq: 1400, dur: 0.03, vol: 0.04 },
  ];

  bounces.forEach(b => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(b.freq, now + b.time);
    gain.gain.setValueAtTime(b.vol, now + b.time);
    gain.gain.exponentialRampToValueAtTime(0.001, now + b.time + b.dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + b.time);
    osc.stop(now + b.time + b.dur + 0.01);
  });

  const crunchBuf = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
  const crunchData = crunchBuf.getChannelData(0);
  for (let i = 0; i < crunchData.length; i++) {
    crunchData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
  }
  const crunch = ctx.createBufferSource();
  crunch.buffer = crunchBuf;
  const crunchGain = ctx.createGain();
  crunchGain.gain.setValueAtTime(0.08, now + 0.35);
  crunchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
  crunch.connect(crunchGain);
  crunchGain.connect(ctx.destination);
  crunch.start(now + 0.35);
}

export function playToyDropSound() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.3);

  const squeakTimes = [0.15, 0.35];
  squeakTimes.forEach(t => {
    const sq = ctx.createOscillator();
    const sg = ctx.createGain();
    sq.type = 'sine';
    sq.frequency.setValueAtTime(1200, now + t);
    sq.frequency.exponentialRampToValueAtTime(800, now + t + 0.08);
    sg.gain.setValueAtTime(0.06, now + t);
    sg.gain.exponentialRampToValueAtTime(0.001, now + t + 0.1);
    sq.connect(sg);
    sg.connect(ctx.destination);
    sq.start(now + t);
    sq.stop(now + t + 0.12);
  });
}
