/**
 * EditBuddy - Web Audio Manager
 * Provides 100% self-contained synthesized UI sound cues and
 * royalty-free demo music loops using the Web Audio API.
 * No external MP3 downloads required!
 */

class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.currentMusicNode = null;
    this.musicGainNode = null;
    this.currentTrackId = null;
    this.isPlayingMusic = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.isPlayingMusic) {
      this.stopMusic();
    }
    return this.isMuted;
  }

  // --- UI Sound Effects ---

  playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch (e) {
      console.warn('Audio click error:', e);
    }
  }

  playSuccess() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 fanfare
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;

        const startTime = this.ctx.currentTime + idx * 0.1;
        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.36);
      });
    } catch (e) {
      console.warn('Audio success error:', e);
    }
  }

  playEncouraging() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [440, 554.37, 659.25]; // A major soothing chord
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;

        const startTime = this.ctx.currentTime + idx * 0.08;
        gain.gain.setValueAtTime(0.08, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.52);
      });
    } catch (e) {
      console.warn('Audio encouraging error:', e);
    }
  }

  playCompare() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(420, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch (e) {
      console.warn('Audio compare error:', e);
    }
  }

  // --- Background Music Tracks ---

  getTracks() {
    return [
      { id: 'track-lofi', name: 'Lo-Fi Campus Chill', vibe: 'Mellow study & relaxed edits', bpm: 85, icon: '☕' },
      { id: 'track-beat', name: 'Energetic Dance Beat', vibe: 'Punchy reels & dance moves', bpm: 120, icon: '⚡' },
      { id: 'track-sunny', name: 'Sunny Acoustic', vibe: 'Warm campus vlog & outdoors', bpm: 100, icon: '☀️' },
      { id: 'track-cinematic', name: 'Cinematic Drone Swell', vibe: 'Dramatic landscapes & aerials', bpm: 75, icon: '🚁' }
    ];
  }

  playTrack(trackId, volume = 0.6) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    this.stopMusic();

    this.currentTrackId = trackId;
    this.isPlayingMusic = true;

    try {
      this.musicGainNode = this.ctx.createGain();
      this.musicGainNode.gain.setValueAtTime(Math.max(0.01, Math.min(volume, 1.0)) * 0.15, this.ctx.currentTime);
      this.musicGainNode.connect(this.ctx.destination);

      // Create a rhythm generator loop based on track type
      this._scheduleTrackNotes(trackId);
    } catch (e) {
      console.warn('Play track error:', e);
    }
  }

  setMusicVolume(volPercent) {
    if (!this.musicGainNode || !this.ctx) return;
    const gainVal = (Math.max(0, Math.min(volPercent, 100)) / 100) * 0.2;
    this.musicGainNode.gain.setValueAtTime(gainVal, this.ctx.currentTime);
  }

  stopMusic() {
    this.isPlayingMusic = false;
    this.currentTrackId = null;
    if (this._musicTimer) {
      clearInterval(this._musicTimer);
      this._musicTimer = null;
    }
  }

  _scheduleTrackNotes(trackId) {
    if (!this.isPlayingMusic || !this.ctx) return;

    // Define harmonic chord progression patterns
    let chords = [];
    let speedMs = 1200;

    if (trackId === 'track-lofi') {
      chords = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [196.00, 246.94, 293.66, 349.23]  // G7
      ];
      speedMs = 1400;
    } else if (trackId === 'track-beat') {
      chords = [
        [293.66, 369.99, 440.00], // D
        [246.94, 311.13, 369.99], // Bm
        [196.00, 246.94, 293.66], // G
        [220.00, 277.18, 329.63]  // A
      ];
      speedMs = 700;
    } else if (trackId === 'track-sunny') {
      chords = [
        [329.63, 415.30, 493.88], // E
        [277.18, 329.63, 415.30], // C#m
        [220.00, 277.18, 329.63], // A
        [246.94, 311.13, 369.99]  // B
      ];
      speedMs = 1000;
    } else {
      // Cinematic Drone
      chords = [
        [130.81, 196.00, 261.63, 392.00], // C
        [110.00, 164.81, 220.00, 329.63], // A
        [87.31, 130.81, 174.61, 261.63],  // F
        [98.00, 146.83, 196.00, 293.66]   // G
      ];
      speedMs = 2000;
    }

    let chordIdx = 0;
    const playNextChord = () => {
      if (!this.isPlayingMusic || !this.ctx || !this.musicGainNode) return;
      const currentChord = chords[chordIdx % chords.length];
      chordIdx++;

      currentChord.forEach((freq, noteI) => {
        try {
          const osc = this.ctx.createOscillator();
          const noteGain = this.ctx.createGain();
          osc.type = trackId === 'track-lofi' ? 'sine' : 'triangle';
          osc.frequency.value = freq;

          const t = this.ctx.currentTime + (noteI * 0.04);
          const dur = (speedMs / 1000) * 0.9;
          noteGain.gain.setValueAtTime(0.001, t);
          noteGain.gain.linearRampToValueAtTime(0.06, t + 0.1);
          noteGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

          osc.connect(noteGain);
          noteGain.connect(this.musicGainNode);

          osc.start(t);
          osc.stop(t + dur + 0.1);
        } catch (e) {
          // ignore
        }
      });
    };

    playNextChord();
    this._musicTimer = setInterval(playNextChord, speedMs);
  }
}

export const audioManager = new AudioManager();
