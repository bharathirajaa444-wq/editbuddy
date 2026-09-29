/**
 * EditBuddy - Video Editor Engine
 * Interactive, beginner-friendly video workspace with custom animated
 * procedural playback, timeline scrubber, trim handles, clip splitting,
 * audio soundtrack mixing, text/captions, speed control, and transitions.
 */

import { audioManager } from '../engine/audioManager.js';

export class VideoEditor {
  constructor(videoContainer, overlayCanvas, options = {}) {
    this.container = videoContainer;
    this.overlayCanvas = overlayCanvas;
    this.ctx = overlayCanvas.getContext('2d');
    this.onStateChange = options.onStateChange || (() => {});
    this.onTimeUpdate = options.onTimeUpdate || (() => {});

    this.mediaPreset = null;
    this.videoElement = null;
    this.isProcedural = true;

    // Playback State
    this.isPlaying = false;
    this.currentTime = 0;
    this.totalDuration = 12; // in seconds
    this.playbackSpeed = 1.0; // 0.5, 1.0, 1.5, 2.0
    this.animationFrameId = null;
    this.lastTimestamp = null;
    this.isComparing = false;

    // Edit State
    this.state = {
      trimStart: 0,
      trimEnd: 12,
      splitCount: 0,
      splits: [],
      audioTrack: null,     // { id, name, bpm }
      audioVolume: 60,      // 0 - 100
      captionText: '',
      captionPosition: 'bottom', // 'bottom', 'center', 'top'
      transition: 'none',   // 'none', 'crossfade', 'fade-black', 'zoom'
      playbackSpeed: 1.0,
      hasPlayed: false,
      hasScrubbed: false,
      totalDuration: 12
    };
  }

  loadMedia(media) {
    this.stop();
    this.mediaPreset = media;
    this.totalDuration = media.durationSec || 12;

    this.state = {
      trimStart: 0,
      trimEnd: this.totalDuration,
      splitCount: 0,
      splits: [],
      audioTrack: null,
      audioVolume: 60,
      captionText: '',
      captionPosition: 'bottom',
      transition: 'none',
      playbackSpeed: 1.0,
      hasPlayed: false,
      hasScrubbed: false,
      totalDuration: this.totalDuration
    };

    if (media.isUserUploaded && media.url) {
      this.isProcedural = false;
      this._setupHtmlVideo(media.url);
    } else {
      this.isProcedural = true;
      this._setupProceduralCanvas();
    }

    this.seekTo(0);
    this.onStateChange(this.getState());
  }

  getState() {
    return { ...this.state, totalDuration: this.totalDuration };
  }

  _setupHtmlVideo(url) {
    let video = this.container.querySelector('video#editor-video');
    if (!video) {
      video = document.createElement('video');
      video.id = 'editor-video';
      video.playsInline = true;
      video.muted = true;
      this.container.prepend(video);
    }
    video.src = url;
    video.load();
    this.videoElement = video;
  }

  _setupProceduralCanvas() {
    // Hide standard video if present, use overlay canvas for scene drawing
    const existingVideo = this.container.querySelector('video#editor-video');
    if (existingVideo) {
      existingVideo.style.display = 'none';
    }
    this._resizeCanvas();
  }

  _resizeCanvas() {
    const rect = this.container.getBoundingClientRect();
    const w = rect.width || 640;
    const h = rect.height || 360;
    this.overlayCanvas.width = w;
    this.overlayCanvas.height = h;
  }

  // --- Playback Controls ---

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.state.hasPlayed = true;
    this.lastTimestamp = performance.now();

    if (this.state.audioTrack && !this.isComparing) {
      audioManager.playTrack(this.state.audioTrack.id, this.state.audioVolume / 100);
    }

    if (this.videoElement && !this.isProcedural) {
      this.videoElement.playbackRate = this.state.playbackSpeed;
      this.videoElement.play().catch(() => {});
    }

    this._loop();
    this.onStateChange(this.getState());
  }

  pause() {
    this.isPlaying = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.videoElement && !this.isProcedural) {
      this.videoElement.pause();
    }
    audioManager.stopMusic();
    this.onStateChange(this.getState());
  }

  togglePlay() {
    if (this.isPlaying) this.pause();
    else this.play();
  }

  stop() {
    this.pause();
    this.currentTime = this.state.trimStart;
    this.seekTo(this.currentTime);
  }

  seekTo(seconds) {
    this.currentTime = Math.max(0, Math.min(seconds, this.totalDuration));
    if (this.videoElement && !this.isProcedural) {
      this.videoElement.currentTime = this.currentTime;
    }
    this.renderFrame();
    this.onTimeUpdate(this.currentTime, this.totalDuration);
  }

  scrub(normalizedFraction) {
    this.state.hasScrubbed = true;
    const targetSec = normalizedFraction * this.totalDuration;
    this.seekTo(targetSec);
    this.onStateChange(this.getState());
  }

  _loop() {
    if (!this.isPlaying) return;

    const now = performance.now();
    const deltaSec = (now - this.lastTimestamp) / 1000;
    this.lastTimestamp = now;

    // Advance time by delta * speed
    this.currentTime += deltaSec * this.state.playbackSpeed;

    // Loop back within trim boundaries
    const startBound = this.isComparing ? 0 : this.state.trimStart;
    const endBound = this.isComparing ? this.totalDuration : this.state.trimEnd;

    if (this.currentTime >= endBound) {
      this.currentTime = startBound;
      if (this.videoElement && !this.isProcedural) {
        this.videoElement.currentTime = startBound;
      }
    }

    this.renderFrame();
    this.onTimeUpdate(this.currentTime, this.totalDuration);

    this.animationFrameId = requestAnimationFrame(() => this._loop());
  }

  // --- Timeline & Trim Adjustments ---

  setTrimStart(sec) {
    const val = Math.max(0, Math.min(sec, this.state.trimEnd - 1));
    this.state.trimStart = Math.round(val * 10) / 10;
    if (this.currentTime < this.state.trimStart) {
      this.seekTo(this.state.trimStart);
    }
    this.onStateChange(this.getState());
  }

  setTrimEnd(sec) {
    const val = Math.max(this.state.trimStart + 1, Math.min(sec, this.totalDuration));
    this.state.trimEnd = Math.round(val * 10) / 10;
    if (this.currentTime > this.state.trimEnd) {
      this.seekTo(this.state.trimStart);
    }
    this.onStateChange(this.getState());
  }

  splitAtCurrentTime() {
    this.state.splitCount++;
    this.state.splits.push(Math.round(this.currentTime * 10) / 10);
    this.onStateChange(this.getState());
  }

  // --- Audio Track ---

  setAudioTrack(track) {
    this.state.audioTrack = track;
    if (this.isPlaying && !this.isComparing) {
      audioManager.playTrack(track.id, this.state.audioVolume / 100);
    }
    this.onStateChange(this.getState());
  }

  setAudioVolume(volPercent) {
    this.state.audioVolume = parseInt(volPercent, 10);
    audioManager.setMusicVolume(this.state.audioVolume);
    this.onStateChange(this.getState());
  }

  // --- Text & Caption ---

  setCaptionText(text) {
    this.state.captionText = text;
    this.renderFrame();
    this.onStateChange(this.getState());
  }

  setCaptionPosition(pos) {
    this.state.captionPosition = pos;
    this.renderFrame();
    this.onStateChange(this.getState());
  }

  // --- Speed ---

  setSpeed(speedMultiplier) {
    this.state.playbackSpeed = parseFloat(speedMultiplier);
    if (this.videoElement && !this.isProcedural) {
      this.videoElement.playbackRate = this.state.playbackSpeed;
    }
    this.onStateChange(this.getState());
  }

  // --- Transitions ---

  setTransition(transitionName) {
    this.state.transition = transitionName;
    this.renderFrame();
    this.onStateChange(this.getState());
  }

  // --- Compare Mode ---

  startComparing() {
    this.isComparing = true;
    audioManager.stopMusic();
    this.renderFrame();
  }

  stopComparing() {
    this.isComparing = false;
    if (this.isPlaying && this.state.audioTrack) {
      audioManager.playTrack(this.state.audioTrack.id, this.state.audioVolume / 100);
    }
    this.renderFrame();
  }

  // --- Frame Renderer ---

  renderFrame() {
    const w = this.overlayCanvas.width || 640;
    const h = this.overlayCanvas.height || 360;
    this.ctx.clearRect(0, 0, w, h);

    if (this.isProcedural) {
      this._renderProceduralScene(w, h);
    }

    // If Comparing, draw raw indicator and skip overlays
    if (this.isComparing) {
      this._drawOriginalBadge(w, h);
      return;
    }

    // 1. Transition effect preview at start or splits
    if (this.state.transition !== 'none') {
      this._applyTransitionEffect(w, h);
    }

    // 2. Caption Text Overlay
    if (this.state.captionText && this.state.captionText.trim()) {
      this._drawCaptionOverlay(w, h);
    }

    // 3. Audio playing indicator badge
    if (this.state.audioTrack && this.isPlaying) {
      this._drawAudioWaveBadge(w, h);
    }
  }

  _renderProceduralScene(w, h) {
    const t = this.currentTime;
    const sceneType = this.mediaPreset?.sceneType || 'skate';

    // Background gradient motion
    const grad = this.ctx.createLinearGradient(0, 0, w, h);
    if (sceneType === 'skate') {
      const shift = Math.sin(t * 1.5) * 20;
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.5, '#431407');
      grad.addColorStop(1, '#831843');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, w, h);

      // Skater motion simulation
      const skateX = ((t * 80) % (w + 140)) - 70;
      const jumpProgress = Math.sin((t * 2) % Math.PI);
      const skateY = h * 0.72 - (jumpProgress > 0 ? jumpProgress * 80 : 0);

      // Floor & Rails
      this.ctx.fillStyle = '#1c1917';
      this.ctx.fillRect(0, h * 0.75, w, h * 0.25);
      this.ctx.fillStyle = '#f59e0b';
      this.ctx.fillRect(0, h * 0.74, w, 4);

      // Skater figure
      this.ctx.font = '54px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('🛹', skateX, skateY);
      this.ctx.fillText('🏃', skateX, skateY - 34);

    } else if (sceneType === 'dance') {
      // Energetic dance crew strobe lighting
      const beat = Math.sin(t * 4);
      grad.addColorStop(0, beat > 0.3 ? '#4c1d95' : '#1e1b4b');
      grad.addColorStop(1, beat > 0.6 ? '#db2777' : '#0f172a');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, w, h);

      // Stage Spotlights
      this.ctx.save();
      this.ctx.globalAlpha = 0.25;
      this.ctx.fillStyle = '#ec4899';
      this.ctx.beginPath();
      this.ctx.moveTo(w * 0.2, 0);
      this.ctx.lineTo(w * 0.1, h);
      this.ctx.lineTo(w * 0.4, h);
      this.ctx.fill();

      this.ctx.fillStyle = '#38bdf8';
      this.ctx.beginPath();
      this.ctx.moveTo(w * 0.8, 0);
      this.ctx.lineTo(w * 0.6, h);
      this.ctx.lineTo(w * 0.9, h);
      this.ctx.fill();
      this.ctx.restore();

      // Dancers in motion
      const dancers = ['🕺', '💃', '🕺'];
      dancers.forEach((d, idx) => {
        const dx = w * (0.35 + idx * 0.15) + Math.sin(t * 6 + idx) * 16;
        const dy = h * 0.72 + Math.abs(Math.sin(t * 8 + idx)) * -20;
        this.ctx.font = '50px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(d, dx, dy);
      });

    } else if (sceneType === 'drone') {
      // Campus aerial flyover
      const zoom = 1 + (t % 10) * 0.05;
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(0.4, '#bae6fd');
      grad.addColorStop(0.42, '#15803d');
      grad.addColorStop(1, '#064e3b');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, w, h);

      // Buildings sweeping under
      const sweepY = (t * 24) % 120;
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      this.ctx.fillRect(w * 0.3, h * 0.45 + sweepY, 140, 70);
      this.ctx.fillRect(w * 0.6, h * 0.55 + sweepY, 180, 80);

      // Drone crosshair
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.arc(w / 2, h / 2, 28, 0, Math.PI * 2);
      this.ctx.stroke();
    } else {
      // Default energetic motion
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#334155');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, w, h);

      const sphereX = (w * 0.5) + Math.sin(t * 3) * (w * 0.3);
      this.ctx.fillStyle = '#ec4899';
      this.ctx.beginPath();
      this.ctx.arc(sphereX, h * 0.5, 36, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Timecode stamp in top-left
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    this.ctx.fillRect(16, 16, 94, 28);
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.font = 'bold 13px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    const ms = Math.floor((t % 1) * 10);
    this.ctx.fillText(`${m}:${s.toString().padStart(2, '0')}.${ms}`, 24, 30);
  }

  _drawCaptionOverlay(w, h) {
    const text = this.state.captionText.trim();
    if (!text) return;

    this.ctx.save();
    this.ctx.font = 'bold 22px Outfit, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const textWidth = this.ctx.measureText(text).width;
    let posY = h * 0.82;
    if (this.state.captionPosition === 'center') posY = h * 0.5;
    if (this.state.captionPosition === 'top') posY = h * 0.18;

    // Background pill
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    this.ctx.beginPath();
    this.ctx.roundRect(w / 2 - textWidth / 2 - 20, posY - 20, textWidth + 40, 40, 10);
    this.ctx.fill();

    // Text
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(text, w / 2, posY);
    this.ctx.restore();
  }

  _drawAudioWaveBadge(w, h) {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
    this.ctx.beginPath();
    this.ctx.roundRect(w - 180, 16, 164, 32, 16);
    this.ctx.fill();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 12px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(`🎵 ${this.state.audioTrack.name.slice(0, 16)}`, w - 98, 32);
    this.ctx.restore();
  }

  _applyTransitionEffect(w, h) {
    const elapsedInClip = this.currentTime - this.state.trimStart;
    if (elapsedInClip < 1.0) {
      // Transition is triggering during first 1.0 second
      const progress = 1.0 - (elapsedInClip / 1.0); // 1.0 down to 0.0

      this.ctx.save();
      if (this.state.transition === 'fade-black') {
        this.ctx.fillStyle = `rgba(0, 0, 0, ${progress})`;
        this.ctx.fillRect(0, 0, w, h);
      } else if (this.state.transition === 'crossfade') {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${progress * 0.7})`;
        this.ctx.fillRect(0, 0, w, h);
      } else if (this.state.transition === 'zoom') {
        this.ctx.strokeStyle = `rgba(56, 189, 248, ${progress * 0.8})`;
        this.ctx.lineWidth = progress * 24;
        this.ctx.strokeRect(0, 0, w, h);
      }
      this.ctx.restore();
    }
  }

  _drawOriginalBadge(w, h) {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.roundRect(w / 2 - 90, 24, 180, 44, 22);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 15px -apple-system, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('RAW FOOTAGE', w / 2, 46);
    this.ctx.restore();
  }
}
