class AudioEngine {
  constructor() {
    this.ctx = null;
    this.bgmInterval = null;
    this.currentBgm = null;
    this.masterGain = null;
    this.tempo = 130;
    this.bgmTime = 0;
  }

  init() {
    if (this.ctx) return;
    
    // Create AudioContext
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    // Create master gain node
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime); // 50% volume
    this.masterGain.connect(this.ctx.destination);
    
    console.log("🔊 Web Audio API Synthesizer initialized!");
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // ==========================================
  // INSTRUMENTS & SYNTHS (SFX)
  // ==========================================

  /**
   * Generates a noise buffer for thuds and rumbles
   */
  getNoiseBuffer() {
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * Alarm clock ringing sound (annoying dual-frequency square wave)
   */
  playAlarm() {
    this.resume();
    if (!this.ctx) return null;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(880, this.ctx.currentTime); // A5
    
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(885, this.ctx.currentTime); // slightly detuned

    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc1.start();
    osc2.start();

    // Make it beep: beep beep beep...
    const startTime = this.ctx.currentTime;
    const beepInterval = 0.25; // seconds per beep
    for (let i = 0; i < 100; i++) {
      const beepStart = startTime + i * beepInterval * 2;
      gainNode.gain.setValueAtTime(0.15, beepStart);
      gainNode.gain.setValueAtTime(0, beepStart + beepInterval);
    }

    return {
      stop: () => {
        try {
          osc1.stop();
          osc2.stop();
          osc1.disconnect();
          osc2.disconnect();
          gainNode.disconnect();
        } catch(e) {}
      }
    };
  }

  /**
   * Clock ticking (tick-tock)
   * @param {boolean} isTock - Alternates pitch
   */
  playTick(isTock = false) {
    this.resume();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isTock ? 600 : 800, this.ctx.currentTime);

    gainNode.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  /**
   * Heavy thud sound (when stubbing toe)
   */
  playThud() {
    this.resume();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    // Deep pitch slide
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.2);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, this.ctx.currentTime);

    gainNode.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);

    // Noise layer for impact crunch
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer();
    
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(200, this.ctx.currentTime);
    noiseFilter.Q.setValueAtTime(3, this.ctx.currentTime);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start();
    noise.stop(this.ctx.currentTime + 0.12);
  }

  /**
   * GUI click sound
   */
  playClick() {
    this.resume();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);

    gainNode.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  /**
   * Metallic lock click sound (철컥)
   */
  playUnlock() {
    this.resume();
    if (!this.ctx) return;

    // First click (higher pitch metallic snap)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.05);
    gain1.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start();
    osc1.stop(this.ctx.currentTime + 0.06);

    // Second click (delayed lower mechanical snap)
    const delay = 0.04;
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(450, this.ctx.currentTime + delay);
    osc2.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + delay + 0.08);
    gain2.gain.setValueAtTime(0.25, this.ctx.currentTime + delay);
    gain2.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + 0.08);
    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(this.ctx.currentTime + delay);
    osc2.stop(this.ctx.currentTime + delay + 0.09);
  }

  /**
   * Wrong choice buzzer (low harsh synth)
   */
  playBuzzer() {
    this.resume();
    if (!this.ctx) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(100, this.ctx.currentTime);
    
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(103, this.ctx.currentTime); // detuned

    gainNode.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.32);
    osc2.stop(this.ctx.currentTime + 0.32);
  }

  /**
   * Air Conditioner hum / music
   */
  playAirConditionerSong() {
    this.resume();
    if (!this.ctx) return;

    // A short electronic melody resembling a corporate logo song
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    const duration = 0.15;
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * duration);
      
      gainNode.gain.setValueAtTime(0, this.ctx.currentTime + idx * duration);
      gainNode.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + idx * duration + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * duration + duration);
      
      osc.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      osc.start(this.ctx.currentTime + idx * duration);
      osc.stop(this.ctx.currentTime + idx * duration + duration);
    });
  }

  /**
   * Boiler rumble sound (heavy low hum)
   */
  playBoilerRumble() {
    this.resume();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low A

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(80, this.ctx.currentTime);

    gainNode.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 0.4);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.62);
  }

  /**
   * Uplifting two-tone chime
   */
  playOk() {
    this.resume();
    if (!this.ctx) return;

    const notes = [523.25, 783.99]; // C5 -> G5
    const startTime = this.ctx.currentTime;
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.1);

      gainNode.gain.setValueAtTime(0.12, startTime + idx * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.1 + 0.25);

      osc.connect(gainNode);
      gainNode.connect(this.masterGain);

      osc.start(startTime + idx * 0.1);
      osc.stop(startTime + idx * 0.1 + 0.3);
    });
  }

  /**
   * Stage success fanfare (fast triumphant arpeggio)
   */
  playSuccessFanfare() {
    this.resume();
    if (!this.ctx) return;

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
    const duration = 0.08;
    const startTime = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = idx === notes.length - 1 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, startTime + idx * duration);

      const noteVol = idx === notes.length - 1 ? 0.15 : 0.08;
      gainNode.gain.setValueAtTime(noteVol, startTime + idx * duration);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + idx * duration + 0.3);

      osc.connect(gainNode);
      gainNode.connect(this.masterGain);

      osc.start(startTime + idx * duration);
      osc.stop(startTime + idx * duration + 0.35);
    });
  }

  /**
   * Game Over failure sound (sad descending pitch)
   */
  playFailure() {
    this.resume();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime); // A3
    osc.frequency.linearRampToValueAtTime(110, this.ctx.currentTime + 0.8); // Drop an octave

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, this.ctx.currentTime);

    gainNode.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.0);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 1.0);
  }

  /**
   * Bus Engine Rumble (ambient sound for success ending)
   */
  startBusRumble() {
    this.resume();
    if (!this.ctx) return null;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer();
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(60, this.ctx.currentTime);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.2, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    noise.start();
    
    return {
      stop: () => {
        try {
          noise.stop();
          noise.disconnect();
          filter.disconnect();
          gainNode.disconnect();
        } catch(e) {}
      }
    };
  }

  // ==========================================
  // BACKGROUND MUSIC (BGM) SEQUENCER
  // ==========================================

  /**
   * Starts BGM synthesizer
   * @param {string} type - 'fast' (in-game) or 'soft' (ending)
   */
  startBgm(type = 'fast') {
    this.stopBgm();
    this.resume();
    if (!this.ctx) return;

    this.currentBgm = type;
    this.bgmTime = this.ctx.currentTime;
    
    const isFast = (type === 'fast');
    this.tempo = isFast ? 140 : 80;
    const stepDuration = 60 / this.tempo / 4; // 16th notes
    
    // Upbeat electronic base notes and melody
    const fastBass = [110.00, 110.00, 130.81, 130.81, 146.83, 146.83, 164.81, 164.81]; // A2, C3, D3, E3
    const fastMelody = [
      440.00, 0, 440.00, 523.25, 0, 587.33, 0, 659.25,
      587.33, 0, 523.25, 0, 440.00, 0, 392.00, 440.00
    ];
    
    // Soft, sweet indie ballad chords (for headphones ending)
    const softBass = [130.81, 130.81, 196.00, 196.00, 220.00, 220.00, 174.61, 174.61]; // C3, G3, A3, F3
    const softMelody = [
      523.25, 587.33, 659.25, 0, 587.33, 0, 523.25, 0,
      440.00, 0, 392.00, 440.00, 523.25, 0, 0, 0
    ];

    const bassPattern = isFast ? fastBass : softBass;
    const melodyPattern = isFast ? fastMelody : softMelody;

    let step = 0;

    const playStep = () => {
      if (!this.ctx || this.currentBgm !== type) return;

      const lookAhead = 0.1; // schedule 100ms in advance
      while (this.bgmTime < this.ctx.currentTime + lookAhead) {
        // 1. Play Bass on every quarter note (step % 4 === 0)
        if (step % 2 === 0) {
          const bassIdx = Math.floor(step / 2) % bassPattern.length;
          const bassNote = bassPattern[bassIdx];
          
          const bassOsc = this.ctx.createOscillator();
          const bassGain = this.ctx.createGain();
          
          bassOsc.type = 'triangle';
          bassOsc.frequency.setValueAtTime(bassNote, this.bgmTime);
          
          bassGain.gain.setValueAtTime(isFast ? 0.18 : 0.12, this.bgmTime);
          bassGain.gain.exponentialRampToValueAtTime(0.001, this.bgmTime + stepDuration * 1.8);
          
          bassOsc.connect(bassGain);
          bassGain.connect(this.masterGain);
          
          bassOsc.start(this.bgmTime);
          bassOsc.stop(this.bgmTime + stepDuration * 1.9);
        }

        // 2. Play Melody
        const melIdx = step % melodyPattern.length;
        const melNote = melodyPattern[melIdx];
        if (melNote > 0 && (isFast ? Math.random() > 0.15 : true)) {
          const melOsc = this.ctx.createOscillator();
          const melGain = this.ctx.createGain();
          
          melOsc.type = isFast ? 'sine' : 'sine'; // gentle tone
          melOsc.frequency.setValueAtTime(melNote, this.bgmTime);
          
          // Muffle soft BGM slightly (headphones feel)
          if (!isFast) {
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, this.bgmTime); // filter high freq
            melOsc.disconnect();
            melOsc.connect(filter);
            filter.connect(melGain);
          } else {
            melOsc.connect(melGain);
          }
          
          melGain.gain.setValueAtTime(isFast ? 0.07 : 0.05, this.bgmTime);
          melGain.gain.exponentialRampToValueAtTime(0.001, this.bgmTime + stepDuration * (isFast ? 1.5 : 3));
          
          melGain.connect(this.masterGain);
          
          melOsc.start(this.bgmTime);
          melOsc.stop(this.bgmTime + stepDuration * (isFast ? 1.6 : 3.1));
        }

        // Advance to next step
        this.bgmTime += stepDuration;
        step++;
      }
      
      // Schedule next check
      this.bgmInterval = setTimeout(playStep, 25);
    };

    playStep();
  }

  stopBgm() {
    this.currentBgm = null;
    if (this.bgmInterval) {
      clearTimeout(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const audio = new AudioEngine();
export default audio;
