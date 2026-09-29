/**
 * EditBuddy - Main Application Controller
 * Orchestrates navigation, state persistence, media picking,
 * learning paths, interactive editors, scoring, and confetti celebrations.
 */

import { ALBUMS, PHOTO_PRESETS, VIDEO_PRESETS, renderVideoThumbnail, processUserUploadedFile } from './data/mediaLibrary.js';
import { PHOTO_LEVELS } from './data/photoLevels.js';
import { VIDEO_LEVELS } from './data/videoLevels.js';
import { COLLEGE_PROJECTS } from './data/collegeProjects.js';
import { audioManager } from './engine/audioManager.js';
import { ScoringEngine } from './engine/scoringEngine.js';
import { PhotoEditor } from './editors/photoEditor.js';
import { VideoEditor } from './editors/videoEditor.js';
import { tutorBuddy } from './components/tutorBuddy.js';

class EditBuddyApp {
  constructor() {
    this.currentView = 'home'; // 'home', 'picker', 'path', 'editor'
    this.currentMode = 'photo'; // 'photo', 'video', 'college'
    this.currentLevel = null;
    this.selectedMedia = null;
    this.currentAlbum = 'recent';

    this.photoEditor = null;
    this.videoEditor = null;
    this.lastEditState = null;

    this.state = this.loadPersistedState();

    this.initElements();
    this.initConfetti();
    this.bindGlobalEvents();
    this.renderView('home');
  }

  // --- LocalStorage Persistence ---

  loadPersistedState() {
    const defaultState = {
      xp: 0,
      streakDays: 1,
      lastActiveDate: new Date().toDateString(),
      badges: [],
      photoUnlockedLevel: 1,
      videoUnlockedLevel: 1,
      collegeUnlockedCount: 3, // all college projects open to explore
      scores: {}, // e.g. { 'photo-1': 95, 'video-2': 92 }
      stars: {}   // e.g. { 'photo-1': 3 }
    };

    try {
      const saved = localStorage.getItem('editbuddy_learner_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check streak
        const today = new Date().toDateString();
        if (parsed.lastActiveDate !== today) {
          parsed.streakDays = (parsed.streakDays || 1) + 1;
          parsed.lastActiveDate = today;
        }
        return { ...defaultState, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage', e);
    }
    return defaultState;
  }

  saveState() {
    try {
      localStorage.setItem('editbuddy_learner_state', JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save state to localStorage', e);
    }
    this.updateNavStats();
  }

  resetAllProgress() {
    if (confirm('Reset your EditBuddy learning progress back to Level 1?')) {
      localStorage.removeItem('editbuddy_learner_state');
      this.state = this.loadPersistedState();
      this.saveState();
      this.renderView('home');
    }
  }

  // --- Navigation & View Rendering ---

  initElements() {
    this.mainViewContainer = document.getElementById('main-view-container');
    this.modalOverlay = document.getElementById('modal-overlay');
    this.modalContainer = document.getElementById('modal-container');
    this.confettiCanvas = document.getElementById('confetti-canvas');

    this.navXp = document.getElementById('nav-xp-val');
    this.navStreak = document.getElementById('nav-streak-val');
    this.navBadges = document.getElementById('nav-badges-val');
    this.navSoundBtn = document.getElementById('nav-sound-toggle');
    this.navBrand = document.getElementById('nav-brand-btn');

    this.updateNavStats();
  }

  updateNavStats() {
    if (this.navXp) this.navXp.textContent = `${this.state.xp} XP`;
    if (this.navStreak) this.navStreak.textContent = `${this.state.streakDays}d`;
    if (this.navBadges) this.navBadges.textContent = `${this.state.badges.length}`;
  }

  bindGlobalEvents() {
    if (this.navBrand) {
      this.navBrand.addEventListener('click', () => {
        audioManager.playClick();
        if (this.videoEditor) this.videoEditor.stop();
        this.renderView('home');
      });
    }

    if (this.navSoundBtn) {
      this.navSoundBtn.addEventListener('click', () => {
        const isMuted = audioManager.toggleMute();
        this.navSoundBtn.textContent = isMuted ? '🔇' : '🔊';
        this.navSoundBtn.title = isMuted ? 'Sound Muted' : 'Sound On';
        if (!isMuted) audioManager.playClick();
      });
    }

    // Modal background click to close
    if (this.modalOverlay) {
      this.modalOverlay.addEventListener('click', (e) => {
        if (e.target === this.modalOverlay) {
          this.closeModal();
        }
      });
    }

    // Keyboard shortcuts: Space to toggle video play, Esc to close modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
      if (e.code === 'Space' && this.currentView === 'editor' && this.currentMode === 'video') {
        const target = e.target.tagName.toLowerCase();
        if (target !== 'input' && target !== 'textarea') {
          e.preventDefault();
          if (this.videoEditor) this.videoEditor.togglePlay();
        }
      }
    });
  }

  renderView(viewName, params = {}) {
    this.currentView = viewName;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (viewName === 'home') {
      this.renderHomeView();
    } else if (viewName === 'picker') {
      this.renderMediaPickerView(params);
    } else if (viewName === 'path') {
      this.renderLearningPathView(params.mode || this.currentMode);
    } else if (viewName === 'editor') {
      this.renderEditorView(params);
    }
  }

  // ==========================================================================
  // VIEW: Home Screen
  // ==========================================================================

  renderHomeView() {
    const greeting = tutorBuddy.getGreeting({
      completedCount: Object.keys(this.state.scores).length,
      currentPhotoLevel: this.state.photoUnlockedLevel
    });

    const photoCompleted = Math.min(8, this.state.photoUnlockedLevel - 1);
    const videoCompleted = Math.min(8, this.state.videoUnlockedLevel - 1);
    const photoPercent = Math.round((photoCompleted / 8) * 100);
    const videoPercent = Math.round((videoCompleted / 8) * 100);

    this.mainViewContainer.innerHTML = `
      <div class="home-container animate-slide-up">
        <!-- Hero Section with Buddy -->
        <div class="home-hero">
          <div class="hero-text">
            <div class="hero-badge">✨ Your Personal Creative Tutor</div>
            <h1 class="hero-title">Learn Editing,<br><span class="text-gradient-primary">One Step at a Time</span></h1>
            <p class="hero-subtitle">
              No complicated tools or confusing jargon. Learn photo and video editing with friendly guided lessons and supportive feedback.
            </p>
            <div style="display:flex; gap:12px; flex-wrap:wrap;">
              <button class="btn btn-primary btn-lg" id="home-start-photo-btn">
                <span>📷</span> Start Photo Editing
              </button>
              <button class="btn btn-secondary btn-lg" id="home-start-video-btn">
                <span>🎬</span> Start Video Editing
              </button>
            </div>
          </div>

          <div class="hero-mascot-container">
            <div class="buddy-speech-bubble" id="buddy-hero-bubble">${greeting.text}</div>
            <div class="buddy-avatar-wrapper" id="buddy-mascot-btn">
              <div class="buddy-avatar">${greeting.emoji}</div>
            </div>
          </div>
        </div>

        <!-- Mode Choices Header -->
        <div class="section-heading-wrap">
          <div>
            <div class="section-prompt">What would you like to edit?</div>
            <div class="section-subprompt">Select a creative path to begin your personalized journey</div>
          </div>
          <button class="btn btn-ghost" id="home-reset-btn" title="Reset progress to level 1" style="font-size:12px;">
            🔄 Reset Progress
          </button>
        </div>

        <!-- 3 Learning Choices Cards -->
        <div class="mode-cards-grid">
          <!-- 1. Photo Editing Card -->
          <div class="mode-card photo" id="card-mode-photo">
            <div class="mode-icon-box">📷</div>
            <div class="mode-title">Photo Editing</div>
            <p class="mode-desc">
              Master cropping, exposure, vibrant contrast, aesthetic filters, and typography through 8 beginner-friendly levels.
            </p>
            <div class="mode-meta">
              <span>Level ${this.state.photoUnlockedLevel} of 8</span>
              <span class="badge badge-primary">${photoCompleted}/8 Done</span>
            </div>
            <div class="mode-progress-bar">
              <div class="mode-progress-fill" style="width: ${Math.max(5, photoPercent)}%;"></div>
            </div>
            <button class="mode-action-btn">
              <span>Explore Photo Path</span> <span>➔</span>
            </button>
          </div>

          <!-- 2. Video Editing Card -->
          <div class="mode-card video" id="card-mode-video">
            <div class="mode-icon-box">🎬</div>
            <div class="mode-title">Video Editing</div>
            <p class="mode-desc">
              Learn the timeline, trim awkward pauses, add soundtracks, insert captions, and adjust speed for punchy social reels.
            </p>
            <div class="mode-meta">
              <span>Level ${this.state.videoUnlockedLevel} of 8</span>
              <span class="badge badge-secondary">${videoCompleted}/8 Done</span>
            </div>
            <div class="mode-progress-bar">
              <div class="mode-progress-fill" style="width: ${Math.max(5, videoPercent)}%;"></div>
            </div>
            <button class="mode-action-btn">
              <span>Explore Video Path</span> <span>➔</span>
            </button>
          </div>

          <!-- 3. College Edits Card -->
          <div class="mode-card college" id="card-mode-college">
            <div class="mode-icon-box">🎓</div>
            <div class="mode-title">College Edits</div>
            <p class="mode-desc">
              Hands-on real-world college projects! Craft annual fest posters, club recruitment reels, and graduation memory montages.
            </p>
            <div class="mode-meta">
              <span>3 Real Projects</span>
              <span class="badge badge-warning">All Levels</span>
            </div>
            <div class="mode-progress-bar">
              <div class="mode-progress-fill" style="width: 100%;"></div>
            </div>
            <button class="mode-action-btn">
              <span>View Projects</span> <span>➔</span>
            </button>
          </div>
        </div>

        <!-- Learner Dashboard & Badges -->
        <div class="learner-dashboard">
          <div class="dashboard-header">
            <div class="dashboard-title">🏆 Your Learning Journey</div>
            <span class="badge badge-success">Beginner Track Active</span>
          </div>

          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-icon">⭐</div>
              <div class="stat-value">${this.state.xp}</div>
              <div class="stat-label">Total XP Earned</div>
            </div>
            <div class="stat-box">
              <div class="stat-icon">🎯</div>
              <div class="stat-value">${photoCompleted + videoCompleted} / 16</div>
              <div class="stat-label">Levels Completed</div>
            </div>
            <div class="stat-box">
              <div class="stat-icon">🔥</div>
              <div class="stat-value">${this.state.streakDays} Day${this.state.streakDays > 1 ? 's' : ''}</div>
              <div class="stat-label">Learning Streak</div>
            </div>
            <div class="stat-box">
              <div class="stat-icon">🎖️</div>
              <div class="stat-value">${this.state.badges.length}</div>
              <div class="stat-label">Badges Collected</div>
            </div>
          </div>

          <!-- Badges Showcase -->
          ${this.state.badges.length > 0 ? `
            <div style="margin-top:24px; padding-top:20px; border-top:1px solid var(--border-color);">
              <div style="font-size:14px; font-weight:700; margin-bottom:12px; color:var(--text-muted);">EARNED BADGES</div>
              <div style="display:flex; flex-wrap:wrap; gap:10px;">
                ${this.state.badges.map(b => `
                  <span class="badge badge-primary" style="padding:6px 12px; font-size:13px;">${b}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Event listeners
    document.getElementById('home-start-photo-btn').addEventListener('click', () => {
      audioManager.playClick();
      this.renderView('path', { mode: 'photo' });
    });
    document.getElementById('home-start-video-btn').addEventListener('click', () => {
      audioManager.playClick();
      this.renderView('path', { mode: 'video' });
    });
    document.getElementById('card-mode-photo').addEventListener('click', () => {
      audioManager.playClick();
      this.renderView('path', { mode: 'photo' });
    });
    document.getElementById('card-mode-video').addEventListener('click', () => {
      audioManager.playClick();
      this.renderView('path', { mode: 'video' });
    });
    document.getElementById('card-mode-college').addEventListener('click', () => {
      audioManager.playClick();
      this.renderView('path', { mode: 'college' });
    });

    const resetBtn = document.getElementById('home-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetAllProgress());
    }

    const mascotBtn = document.getElementById('buddy-mascot-btn');
    if (mascotBtn) {
      mascotBtn.addEventListener('click', () => {
        audioManager.playSuccess();
        const bubble = document.getElementById('buddy-hero-bubble');
        const quotes = [
          '“Every great photographer started with a blurry picture!”',
          '“Editing isn’t about fixing mistakes—it’s about sharing your vision.”',
          '“Take your time, have fun, and experiment freely!”',
          '“Buddy believes in you! Let’s make something beautiful!”'
        ];
        bubble.textContent = quotes[Math.floor(Math.random() * quotes.length)];
      });
    }
  }

  // ==========================================================================
  // VIEW: Learning Path (Roadmap of Levels)
  // ==========================================================================

  renderLearningPathView(mode) {
    this.currentMode = mode;
    const isPhoto = mode === 'photo';
    const isVideo = mode === 'video';
    const isCollege = mode === 'college';

    let levels = [];
    let title = '';
    let desc = '';
    let icon = '';
    let iconClass = '';

    if (isPhoto) {
      levels = PHOTO_LEVELS;
      title = 'Photo Editing Path';
      desc = 'Step-by-step masterclass: from crop basics to professional polish.';
      icon = '📷';
      iconClass = 'path-icon-photo';
    } else if (isVideo) {
      levels = VIDEO_LEVELS;
      title = 'Video Editing Path';
      desc = 'Learn timelines, trim, audio, captions, and speed for dynamic videos.';
      icon = '🎬';
      iconClass = 'path-icon-video';
    } else {
      levels = COLLEGE_PROJECTS;
      title = 'College Edits Projects';
      desc = 'Hands-on beginner projects: fest posters, club reels, and memories.';
      icon = '🎓';
      iconClass = 'path-icon-college';
    }

    const unlockedThreshold = isPhoto
      ? this.state.photoUnlockedLevel
      : isVideo
      ? this.state.videoUnlockedLevel
      : 999;

    this.mainViewContainer.innerHTML = `
      <div class="path-container animate-slide-up">
        <!-- Back Button -->
        <button class="picker-breadcrumb btn btn-ghost" id="path-back-home" style="margin-bottom:16px;">
          <span>←</span> Back to Home
        </button>

        <!-- Header Card -->
        <div class="path-header">
          <div class="path-info-wrap">
            <div class="path-icon-large ${iconClass}">${icon}</div>
            <div>
              <div class="path-title">${title}</div>
              <div class="path-desc">${desc}</div>
            </div>
          </div>
          <div class="path-overall-stats">
            <div class="path-progress-chip">
              ${isCollege ? '3 Projects Ready' : `Level ${Math.min(8, unlockedThreshold)} of 8`}
            </div>
          </div>
        </div>

        <!-- Levels Roadmap -->
        <div class="levels-roadmap">
          ${levels.map((lvl, index) => {
            const levelNum = lvl.id;
            const isUnlocked = isCollege ? true : levelNum <= unlockedThreshold;
            const isCompleted = isCollege
              ? !!this.state.scores[`college-${lvl.id}`]
              : levelNum < unlockedThreshold || (this.state.scores[`${mode}-${levelNum}`] > 90);
            const isCurrent = !isCollege && levelNum === unlockedThreshold;

            const score = isCollege
              ? this.state.scores[`college-${lvl.id}`]
              : this.state.scores[`${mode}-${levelNum}`];

            const starCount = isCollege
              ? this.state.stars[`college-${lvl.id}`] || 0
              : this.state.stars[`${mode}-${levelNum}`] || 0;

            return `
              <div class="level-card-row">
                <!-- Circular Level Node -->
                <div class="level-node-circle ${isCompleted ? 'completed' : isCurrent ? 'current' : isUnlocked ? 'unlocked' : 'locked'}">
                  ${isCompleted ? '✓' : isCurrent ? '▶' : isUnlocked ? levelNum : '🔒'}
                </div>

                <!-- Level Card Body -->
                <div class="level-card-body ${!isUnlocked ? 'locked' : ''} ${isCurrent ? 'current-card' : ''}" data-level-id="${levelNum}">
                  <div class="level-meta-wrap">
                    <div class="level-badge-row">
                      <span class="level-number-badge">${isCollege ? 'PROJECT' : `LEVEL ${levelNum}`}</span>
                      <span class="badge ${lvl.difficulty.includes('Beginner') ? 'badge-primary' : 'badge-warning'}">${lvl.difficulty}</span>
                      ${score ? `<span class="level-score-badge">Score: ${score}%</span>` : ''}
                    </div>
                    <div class="level-title">${lvl.title}</div>
                    <div class="level-short-desc">${lvl.tagline || lvl.brief || ''}</div>
                  </div>

                  <div class="level-action-wrap">
                    ${starCount > 0 ? `
                      <div class="level-stars">
                        <span class="${starCount >= 1 ? 'star-filled' : ''}">★</span>
                        <span class="${starCount >= 2 ? 'star-filled' : ''}">★</span>
                        <span class="${starCount >= 3 ? 'star-filled' : ''}">★</span>
                      </div>
                    ` : ''}

                    <button class="btn ${isUnlocked ? 'btn-primary' : 'btn-secondary'}" ${!isUnlocked ? 'disabled' : ''}>
                      ${isCompleted ? 'Replay' : isUnlocked ? 'Start Lesson' : 'Locked'}
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    document.getElementById('path-back-home').addEventListener('click', () => {
      audioManager.playClick();
      this.renderView('home');
    });

    // Level card clicks
    const cards = this.mainViewContainer.querySelectorAll('.level-card-body');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const lvlId = card.getAttribute('data-level-id');
        const levelDef = levels.find(l => String(l.id) === String(lvlId));

        if (!card.classList.contains('locked') && levelDef) {
          audioManager.playClick();
          this.currentLevel = levelDef;
          // Step 1: Open Media Picker to let learner select photo/video
          this.renderView('picker', {
            mode: isCollege ? (levelDef.mode || 'photo') : mode,
            level: levelDef
          });
        }
      });
    });
  }

  // ==========================================================================
  // VIEW: Gallery-Style Media Picker
  // ==========================================================================

  renderMediaPickerView(params) {
    const mode = params.mode || this.currentMode;
    const level = params.level || this.currentLevel;
    this.currentMode = mode;
    this.currentLevel = level;

    const isVideo = mode === 'video';
    const presets = isVideo ? VIDEO_PRESETS : PHOTO_PRESETS;
    const tip = tutorBuddy.getMediaPickerTip(mode);

    // Filter presets by active album tab
    const filteredPresets = this.currentAlbum === 'recent'
      ? presets
      : presets.filter(p => p.album === this.currentAlbum);

    // Default select first item or recommended item
    if (!this.selectedMedia || this.selectedMedia.type !== (isVideo ? 'video' : 'photo')) {
      const rec = presets.find(p => p.id === level?.recommendedMediaId);
      this.selectedMedia = rec || presets[0];
    }

    this.mainViewContainer.innerHTML = `
      <div class="picker-container animate-slide-up">
        <!-- Breadcrumb Navigation -->
        <div class="picker-breadcrumb" id="picker-back-btn">
          <span>←</span> Back to ${level ? level.title : 'Learning Path'}
        </div>

        <!-- Header -->
        <div class="picker-header">
          <div class="picker-title-wrap">
            <div>
              <div class="picker-title">
                <span>${isVideo ? '🎬' : '📷'}</span> Select a ${isVideo ? 'Video' : 'Photo'} for this Lesson
              </div>
              <div class="picker-subtitle">${tip}</div>
            </div>
          </div>
        </div>

        <!-- Top Bar: Device Upload & Source Tag -->
        <div class="picker-top-bar">
          <div class="picker-source-badge">
            <span class="source-tag">✓ Demo Gallery Ready</span>
            <span style="font-size:13px; color:var(--text-muted);">Real device upload fully supported</span>
          </div>

          <label class="upload-device-btn">
            <span>📁</span>
            <span>Upload from Device</span>
            <input type="file" id="device-file-input" class="file-hidden-input" accept="${isVideo ? 'video/*' : 'image/*'}" />
          </label>
        </div>

        <!-- Album Folders Bar -->
        <div class="picker-albums-bar">
          ${ALBUMS.map(alb => `
            <div class="album-tab ${this.currentAlbum === alb.id ? 'active' : ''}" data-album-id="${alb.id}">
              <span>${alb.icon}</span>
              <span>${alb.name}</span>
            </div>
          `).join('')}
        </div>

        <!-- Media Grid -->
        <div class="media-grid">
          ${filteredPresets.map(item => `
            <div class="media-item ${this.selectedMedia?.id === item.id ? 'selected' : ''}" data-media-id="${item.id}">
              <div class="media-thumbnail-wrap">
                ${isVideo ? `
                  <canvas class="media-thumb-canvas" id="canvas-thumb-${item.id}" width="300" height="300"></canvas>
                  <div class="video-duration-badge">⏱️ ${item.durationText}</div>
                  <div class="video-play-hint">▶</div>
                ` : `
                  <img class="media-thumb-img" src="${item.url}" alt="${item.title}" loading="lazy" />
                `}
                <div class="media-select-check">✓</div>
                <div class="media-caption">${item.title}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Floating Bottom Confirm Bar -->
        <div class="picker-confirm-bar">
          <div class="picker-selected-info">
            <div style="font-size:32px;">${isVideo ? '🎬' : '🖼️'}</div>
            <div>
              <div class="selected-name">${this.selectedMedia?.title || 'No media selected'}</div>
              <div class="selected-meta">${this.selectedMedia?.description || 'Selected for this task'}</div>
            </div>
          </div>

          <button class="btn btn-primary btn-lg" id="picker-confirm-btn">
            <span>Continue to Lesson</span> <span>➔</span>
          </button>
        </div>
      </div>
    `;

    // Render video thumbnail canvases
    if (isVideo) {
      filteredPresets.forEach(preset => {
        const canvas = document.getElementById(`canvas-thumb-${preset.id}`);
        if (canvas) renderVideoThumbnail(canvas, preset);
      });
    }

    // Album tab switches
    const albumTabs = this.mainViewContainer.querySelectorAll('.album-tab');
    albumTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        audioManager.playClick();
        this.currentAlbum = tab.getAttribute('data-album-id');
        this.renderMediaPickerView(params);
      });
    });

    // Media item clicks
    const mediaItems = this.mainViewContainer.querySelectorAll('.media-item');
    mediaItems.forEach(item => {
      item.addEventListener('click', () => {
        audioManager.playClick();
        const mid = item.getAttribute('data-media-id');
        this.selectedMedia = presets.find(p => p.id === mid);
        this.renderMediaPickerView(params);
      });
    });

    // Real Device File Upload Handler
    const fileInput = document.getElementById('device-file-input');
    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (file) {
          audioManager.playClick();
          try {
            const processed = await processUserUploadedFile(file);
            this.selectedMedia = processed;
            alert(`Loaded your file: "${processed.title}" successfully!`);
            this.renderMediaPickerView(params);
          } catch (err) {
            alert(err.message || 'Could not load file');
          }
        }
      });
    }

    // Back to Path
    document.getElementById('picker-back-btn').addEventListener('click', () => {
      audioManager.playClick();
      this.renderView('path', { mode });
    });

    // Confirm & Open Lesson Modal
    document.getElementById('picker-confirm-btn').addEventListener('click', () => {
      audioManager.playClick();
      this.openLessonModal(level, this.selectedMedia);
    });
  }

  // ==========================================================================
  // MODAL: Lesson Overview & Visual Tutorial
  // ==========================================================================

  openLessonModal(level, media) {
    this.currentLevel = level;
    this.selectedMedia = media;

    const isVideo = this.currentMode === 'video';
    const explanation = level.explanation || {
      what: level.brief || 'Explore this creative project by combining foundational editing tools.',
      why: 'Real-world projects give you the confidence to craft your own personal creations.',
      tutorialSteps: level.tasks || ['Follow the guided task checklist inside the editor workspace.']
    };

    const taskText = level.task ? level.task.instruction : level.brief;
    const taskRequirements = level.task ? level.task.requirementsText : (level.tasks ? level.tasks.join(' + ') : 'Complete the task');

    this.modalContainer.innerHTML = `
      <div class="lesson-modal-dialog">
        <div class="lesson-hero-header">
          <div class="lesson-tag-line">
            <span class="level-number-badge">${level.difficulty}</span>
            <span class="badge badge-primary">+${level.xpReward} XP Reward</span>
          </div>
          <div class="lesson-modal-title">${level.title}</div>
        </div>

        <div class="modal-body">
          <!-- Plain language "What this tool does" -->
          <div class="lesson-section-box">
            <div class="lesson-box-title">
              <span>💡</span> What this tool does
            </div>
            <div class="lesson-box-content">${explanation.what}</div>
          </div>

          <!-- "When & why to use it" -->
          <div class="lesson-section-box">
            <div class="lesson-box-title">
              <span>🎯</span> When and why to use it
            </div>
            <div class="lesson-box-content">${explanation.why}</div>
          </div>

          <!-- Animated / Visual Tutorial Box -->
          <div class="visual-tutorial-box">
            <div class="tutorial-video-header">
              <span>📹 Visual Tutorial Demo</span>
              <span class="badge badge-success">Interactive Guide</span>
            </div>
            <div class="tutorial-video-screen">
              <canvas id="tutorial-anim-canvas" class="tutorial-animation-canvas" width="600" height="220"></canvas>
            </div>
            <div class="tutorial-overlay-steps" id="tutorial-step-caption">
              <span>Step: Watch before-and-after demonstration</span>
              <span id="tut-step-num">1 / 3</span>
            </div>
            <div class="tutorial-controls">
              <button class="tutorial-play-btn" id="tut-replay-btn">
                <span>🔄</span> Replay Tutorial Demo
              </button>
            </div>
          </div>

          <!-- Guided Task Card -->
          <div class="task-card-box">
            <div class="task-card-header">
              <span>📋</span> Your Mission with "${media.title}"
            </div>
            <p style="font-size:14px; color:#064e3b; margin-bottom:12px; line-height:1.5;">${taskText}</p>
            <div style="font-size:12px; font-weight:800; text-transform:uppercase; color:#047857; margin-bottom:6px;">GOAL CRITERIA:</div>
            <div style="background:white; padding:8px 12px; border-radius:8px; font-size:13px; font-weight:700; color:#065f46; border:1px solid #a7f3d0;">
              ✓ ${taskRequirements}
            </div>
          </div>

          <!-- Progressive Hints Accordion -->
          <div class="hints-accordion">
            <div class="hints-header" id="hints-toggle-btn">
              <span>💡 Need a hint before starting? (Click to view)</span>
              <span id="hints-arrow">▼</span>
            </div>
            <div class="hints-content" id="hints-body">
              ${(level.hints || [
                { step: 1, text: 'Look for the highlighted tool tabs on the right sidebar.' },
                { step: 2, text: 'Adjust the sliders gently and watch the canvas respond in real time.' },
                { step: 3, text: 'Use the "Hold to Compare" button to evaluate your progress.' }
              ]).map(h => `
                <div style="margin-bottom:8px;">
                  <span class="hint-step-badge">Hint ${h.step}</span>
                  <span>${h.text}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" id="lesson-modal-cancel-btn">Back</button>
          <button class="btn btn-primary btn-lg" id="lesson-modal-start-btn">
            <span>Open Editor & Try It!</span> <span>➔</span>
          </button>
        </div>
      </div>
    `;

    this.openModal();
    this._runTutorialCanvasAnimation(level, isVideo);

    // Hints accordion toggle
    const hintsToggle = document.getElementById('hints-toggle-btn');
    const hintsBody = document.getElementById('hints-body');
    const hintsArrow = document.getElementById('hints-arrow');
    if (hintsToggle) {
      hintsToggle.addEventListener('click', () => {
        audioManager.playClick();
        const isOpen = hintsBody.classList.toggle('open');
        hintsArrow.textContent = isOpen ? '▲' : '▼';
      });
    }

    // Modal navigation
    document.getElementById('lesson-modal-cancel-btn').addEventListener('click', () => {
      audioManager.playClick();
      this.closeModal();
    });

    document.getElementById('lesson-modal-start-btn').addEventListener('click', () => {
      audioManager.playClick();
      this.closeModal();
      this.renderView('editor', { level, media });
    });

    document.getElementById('tut-replay-btn')?.addEventListener('click', () => {
      audioManager.playClick();
      this._runTutorialCanvasAnimation(level, isVideo);
    });
  }

  _runTutorialCanvasAnimation(level, isVideo) {
    const canvas = document.getElementById('tutorial-anim-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    let step = 0;
    const steps = [
      { text: '1. Original starting preview (needs fine-tuning)', progress: 0.1 },
      { text: '2. Applying targeted adjustments gently', progress: 0.5 },
      { text: '3. Polished, balanced, and ready to share!', progress: 1.0 }
    ];

    const stepLabel = document.getElementById('tutorial-step-caption');

    const drawStep = (idx) => {
      ctx.clearRect(0, 0, w, h);

      // Draw split before / after preview
      const grad = ctx.createLinearGradient(0, 0, w, h);
      if (idx === 0) {
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(1, '#0f172a');
      } else if (idx === 1) {
        grad.addColorStop(0, '#312e81');
        grad.addColorStop(1, '#1e1b4b');
      } else {
        grad.addColorStop(0, '#4338ca');
        grad.addColorStop(1, '#065f46');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Mascot demo icon
      ctx.font = '56px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isVideo ? '🎬' : '📸', w / 2, h / 2 - 10);

      // Banner text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Outfit, sans-serif';
      ctx.fillText(steps[idx].text, w / 2, h - 35);

      if (stepLabel) {
        stepLabel.innerHTML = `<span>${steps[idx].text}</span><span>${idx + 1} / 3</span>`;
      }
    };

    drawStep(0);
    this._tutorialTimer1 = setTimeout(() => drawStep(1), 1200);
    this._tutorialTimer2 = setTimeout(() => drawStep(2), 2400);
  }

  // ==========================================================================
  // VIEW: Interactive Editing Workspace (Photo or Video)
  // ==========================================================================

  renderEditorView(params) {
    const level = params.level || this.currentLevel;
    const media = params.media || this.selectedMedia;
    this.currentLevel = level;
    this.selectedMedia = media;

    const isVideo = this.currentMode === 'video';

    this.mainViewContainer.innerHTML = `
      <div class="editor-layout animate-slide-up">
        <!-- Top Action Bar -->
        <div class="editor-top-bar">
          <div class="editor-info">
            <button class="editor-back-btn" id="editor-back-btn">
              <span>←</span> Exit
            </button>
            <div class="editor-title-box">
              <span class="editor-lesson-tag">${level.difficulty} • ${isVideo ? 'Video Editor' : 'Photo Editor'}</span>
              <span class="editor-lesson-name">${level.title}</span>
            </div>
          </div>

          <div class="editor-global-actions">
            <button class="editor-tool-btn" id="editor-undo-btn" title="Undo change">↩ Undo</button>
            <button class="editor-tool-btn" id="editor-redo-btn" title="Redo change">↪ Redo</button>
            <button class="editor-tool-btn" id="editor-reset-btn" title="Reset all changes">🔄 Reset</button>
            <button class="btn btn-success" id="editor-submit-btn" style="padding:8px 18px; font-size:14px;">
              <span>✓ Submit for Score</span>
            </button>
          </div>
        </div>

        <!-- Buddy's Live Task Guidance Strip -->
        <div class="buddy-guidance-strip">
          <div class="buddy-guidance-left">
            <div class="buddy-guide-avatar">🧑‍🏫</div>
            <div class="buddy-guide-text" id="buddy-guide-text">
              Buddy's ready! ${level.task ? level.task.instruction : level.brief}
            </div>
          </div>
          <div class="buddy-task-checklist-inline">
            <div class="checklist-badge" id="live-task-badge">
              <span>Goal:</span> <span id="live-task-label">In progress...</span>
            </div>
          </div>
        </div>

        <!-- Main Editor Body -->
        <div class="editor-body">
          <!-- Canvas / Video Stage -->
          <div class="editor-stage">
            <button class="compare-floating-btn" id="editor-compare-btn">
              <span>👁️</span> <span>Hold to View Original</span>
            </button>

            <div class="stage-viewport">
              ${isVideo ? `
                <div class="video-viewport-wrapper" id="video-wrapper">
                  <canvas id="video-overlay-canvas" width="640" height="360"></canvas>
                </div>
              ` : `
                <canvas id="photo-canvas" width="800" height="800"></canvas>
              `}
            </div>
          </div>

          <!-- Tools Sidebar (Right) -->
          <div class="editor-tools-sidebar">
            <div class="sidebar-tabs" id="editor-sidebar-tabs">
              <!-- Dynamically populated according to level.unlockedTools -->
            </div>
            <div class="sidebar-controls-body" id="editor-controls-panel">
              <!-- Active tab control inputs -->
            </div>
          </div>
        </div>

        <!-- Video Bottom Timeline (Shown only in Video mode) -->
        ${isVideo ? `
          <div class="video-timeline-area">
            <div class="timeline-playback-bar">
              <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:12px; font-weight:700; color:#94a3b8;">TIMELINE</span>
                <button class="editor-tool-btn" id="timeline-split-btn" style="padding:4px 10px; font-size:12px;">
                  ✂️ Split at Playhead
                </button>
              </div>

              <div class="playback-controls-center">
                <button class="play-pause-btn" id="timeline-play-btn">▶</button>
                <div class="time-readout" id="timeline-time-readout">00:00 / 00:12</div>
              </div>

              <div>
                <span class="badge badge-primary" id="timeline-speed-badge">Speed: 1.0x</span>
              </div>
            </div>

            <!-- Draggable Interactive Track -->
            <div class="timeline-track-wrapper" id="timeline-track">
              <div class="timeline-filmstrip" id="timeline-filmstrip"></div>
              <div class="timeline-trim-region" id="timeline-trim-region" style="left:0%; right:0%;">
                <div class="trim-handle start" id="trim-handle-start" title="Drag to trim start"></div>
                <div class="trim-handle end" id="trim-handle-end" title="Drag to trim end"></div>
              </div>
              <div class="timeline-playhead" id="timeline-playhead" style="left:0%;"></div>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    // Initialize Engine
    if (isVideo) {
      this._initVideoWorkspace(level, media);
    } else {
      this._initPhotoWorkspace(level, media);
    }

    // Top action bar events
    document.getElementById('editor-back-btn').addEventListener('click', () => {
      audioManager.playClick();
      if (this.videoEditor) this.videoEditor.stop();
      this.renderView('path', { mode: this.currentMode });
    });

    document.getElementById('editor-reset-btn').addEventListener('click', () => {
      audioManager.playClick();
      if (this.photoEditor) this.photoEditor.resetState();
      if (this.videoEditor) this.videoEditor.loadMedia(media);
    });

    document.getElementById('editor-undo-btn').addEventListener('click', () => {
      audioManager.playClick();
      if (this.photoEditor) this.photoEditor.undo();
    });

    document.getElementById('editor-redo-btn').addEventListener('click', () => {
      audioManager.playClick();
      if (this.photoEditor) this.photoEditor.redo();
    });

    // Compare Button (Hold to compare)
    const compareBtn = document.getElementById('editor-compare-btn');
    if (compareBtn) {
      const startComp = (e) => {
        e.preventDefault();
        audioManager.playCompare();
        compareBtn.classList.add('active');
        if (this.photoEditor) this.photoEditor.startComparing();
        if (this.videoEditor) this.videoEditor.startComparing();
      };
      const stopComp = (e) => {
        e.preventDefault();
        compareBtn.classList.remove('active');
        if (this.photoEditor) this.photoEditor.stopComparing();
        if (this.videoEditor) this.videoEditor.stopComparing();
      };
      compareBtn.addEventListener('mousedown', startComp);
      compareBtn.addEventListener('mouseup', stopComp);
      compareBtn.addEventListener('mouseleave', stopComp);
      compareBtn.addEventListener('touchstart', startComp);
      compareBtn.addEventListener('touchend', stopComp);
    }

    // Submit for Scoring
    document.getElementById('editor-submit-btn').addEventListener('click', () => {
      audioManager.playClick();
      this._submitTaskForScoring(level);
    });
  }

  // --- Photo Workspace Setup ---

  _initPhotoWorkspace(level, media) {
    const canvas = document.getElementById('photo-canvas');
    this.photoEditor = new PhotoEditor(canvas, {
      onStateChange: (state) => {
        this.lastEditState = state;
        this._updateLiveGuidance(level, state);
      }
    });

    this.photoEditor.loadImage(media.url);
    this._buildPhotoToolTabs(level);
  }

  _buildPhotoToolTabs(level) {
    const tabsContainer = document.getElementById('editor-sidebar-tabs');
    const unlocked = level.unlockedTools || ['light', 'crop'];

    const allTabs = [
      { id: 'crop', name: 'Crop', icon: '📐' },
      { id: 'light', name: 'Light', icon: '☀️' },
      { id: 'color', name: 'Color', icon: '🎨' },
      { id: 'filter', name: 'Filters', icon: '🪄' },
      { id: 'text', name: 'Text', icon: '✍️' },
      { id: 'stickers', name: 'Stickers', icon: '⭐' }
    ];

    tabsContainer.innerHTML = allTabs.map(tab => {
      const isAvailable = unlocked.includes(tab.id) || unlocked.includes('straighten');
      return `
        <button class="tool-tab-btn ${isAvailable ? '' : 'locked'}" data-tab-id="${tab.id}">
          <span>${tab.icon}</span>
          <span>${tab.name}</span>
        </button>
      `;
    }).join('');

    // Default open first unlocked tab
    const firstTab = allTabs.find(t => unlocked.includes(t.id) || unlocked.includes('straighten')) || allTabs[0];
    this._selectPhotoToolTab(firstTab.id);

    tabsContainer.querySelectorAll('.tool-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!btn.classList.contains('locked')) {
          audioManager.playClick();
          this._selectPhotoToolTab(btn.getAttribute('data-tab-id'));
        }
      });
    });
  }

  _selectPhotoToolTab(tabId) {
    const tabs = document.querySelectorAll('.sidebar-tabs .tool-tab-btn');
    tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-tab-id') === tabId));

    const panel = document.getElementById('editor-controls-panel');
    const s = this.photoEditor ? this.photoEditor.getState() : {};

    if (tabId === 'crop') {
      panel.innerHTML = `
        <div class="slider-group">
          <div class="slider-label-row">
            <span>Straighten Horizon</span>
            <span class="slider-value-pill" id="val-straighten">${s.straightenAngle || 0}°</span>
          </div>
          <input type="range" class="custom-range" id="input-straighten" min="-20" max="20" step="1" value="${s.straightenAngle || 0}">
        </div>

        <div style="margin-top:14px;">
          <div class="slider-label-row" style="margin-bottom:8px;">
            <span>Aspect Ratio</span>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <button class="font-btn ${s.cropRatio === 'original' ? 'active' : ''}" id="btn-crop-orig">Original</button>
            <button class="font-btn ${s.cropRatio === '1:1' ? 'active' : ''}" id="btn-crop-1-1">1:1 Square</button>
            <button class="font-btn ${s.cropRatio === '4:5' ? 'active' : ''}" id="btn-crop-4-5">4:5 Portrait</button>
            <button class="font-btn ${s.cropRatio === '16:9' ? 'active' : ''}" id="btn-crop-16-9">16:9 Landscape</button>
          </div>
        </div>
      `;

      document.getElementById('input-straighten').addEventListener('input', (e) => {
        const val = e.target.value;
        document.getElementById('val-straighten').textContent = `${val}°`;
        this.photoEditor.setStraightenAngle(val);
      });

      ['orig', '1-1', '4-5', '16-9'].forEach(ratioKey => {
        const btn = document.getElementById(`btn-crop-${ratioKey}`);
        if (btn) {
          btn.addEventListener('click', () => {
            audioManager.playClick();
            const ratioMap = { 'orig': 'original', '1-1': '1:1', '4-5': '4:5', '16-9': '16:9' };
            this.photoEditor.setCropRatio(ratioMap[ratioKey]);
            this._selectPhotoToolTab('crop');
          });
        }
      });

    } else if (tabId === 'light') {
      panel.innerHTML = `
        <div class="slider-group">
          <div class="slider-label-row">
            <span>Brightness (Exposure)</span>
            <span class="slider-value-pill" id="val-brightness">${s.brightness > 0 ? '+' : ''}${s.brightness || 0}%</span>
          </div>
          <input type="range" class="custom-range" id="input-brightness" min="-100" max="100" value="${s.brightness || 0}">
        </div>

        <div class="slider-group" style="margin-top:16px;">
          <div class="slider-label-row">
            <span>Contrast</span>
            <span class="slider-value-pill" id="val-contrast">${s.contrast > 0 ? '+' : ''}${s.contrast || 0}%</span>
          </div>
          <input type="range" class="custom-range" id="input-contrast" min="-100" max="100" value="${s.contrast || 0}">
        </div>
      `;

      document.getElementById('input-brightness').addEventListener('input', (e) => {
        const val = e.target.value;
        document.getElementById('val-brightness').textContent = `${val > 0 ? '+' : ''}${val}%`;
        this.photoEditor.setBrightness(val);
      });

      document.getElementById('input-contrast').addEventListener('input', (e) => {
        const val = e.target.value;
        document.getElementById('val-contrast').textContent = `${val > 0 ? '+' : ''}${val}%`;
        this.photoEditor.setContrast(val);
      });

    } else if (tabId === 'color') {
      panel.innerHTML = `
        <div class="slider-group">
          <div class="slider-label-row">
            <span>Saturation (Vibrance)</span>
            <span class="slider-value-pill" id="val-saturation">${s.saturation > 0 ? '+' : ''}${s.saturation || 0}%</span>
          </div>
          <input type="range" class="custom-range" id="input-saturation" min="-100" max="100" value="${s.saturation || 0}">
        </div>

        <div class="slider-group" style="margin-top:16px;">
          <div class="slider-label-row">
            <span>Warmth (Temperature)</span>
            <span class="slider-value-pill" id="val-warmth">${s.warmth > 0 ? '+' : ''}${s.warmth || 0}%</span>
          </div>
          <input type="range" class="custom-range" id="input-warmth" min="-100" max="100" value="${s.warmth || 0}">
        </div>
      `;

      document.getElementById('input-saturation').addEventListener('input', (e) => {
        const val = e.target.value;
        document.getElementById('val-saturation').textContent = `${val > 0 ? '+' : ''}${val}%`;
        this.photoEditor.setSaturation(val);
      });

      document.getElementById('input-warmth').addEventListener('input', (e) => {
        const val = e.target.value;
        document.getElementById('val-warmth').textContent = `${val > 0 ? '+' : ''}${val}%`;
        this.photoEditor.setWarmth(val);
      });

    } else if (tabId === 'filter') {
      const filters = [
        { id: 'original', name: 'Original', color: '#64748b' },
        { id: 'golden', name: 'Golden Hour', color: '#f59e0b' },
        { id: 'cool', name: 'Chill Cool', color: '#06b6d4' },
        { id: 'vintage', name: 'Vintage', color: '#d97706' },
        { id: 'bw', name: 'Drama B&W', color: '#334155' },
        { id: 'vivid', name: 'Vivid Pop', color: '#ec4899' }
      ];

      panel.innerHTML = `
        <div class="filter-presets-grid">
          ${filters.map(f => `
            <div class="filter-preset-card ${s.activeFilter === f.id ? 'active' : ''}" data-filter-id="${f.id}">
              <div class="filter-preview-box" style="background:${f.color};"></div>
              <div class="filter-preset-name">${f.name}</div>
            </div>
          `).join('')}
        </div>
      `;

      panel.querySelectorAll('.filter-preset-card').forEach(card => {
        card.addEventListener('click', () => {
          audioManager.playClick();
          const fid = card.getAttribute('data-filter-id');
          this.photoEditor.setFilter(fid);
          this._selectPhotoToolTab('filter');
        });
      });

    } else if (tabId === 'text') {
      const currentText = s.textOverlay?.text || '';
      panel.innerHTML = `
        <div class="text-tool-controls">
          <label style="font-size:13px; font-weight:600; color:#cbd5e1;">Headline / Caption Text</label>
          <input type="text" class="text-input-field" id="input-overlay-text" placeholder="Type headline..." value="${currentText}">

          <div style="font-size:13px; font-weight:600; color:#cbd5e1; margin-top:8px;">Font Family</div>
          <div class="font-select-grid">
            <button class="font-btn ${(s.textOverlay?.font || 'Outfit').includes('Outfit') ? 'active' : ''}" data-font="Outfit, sans-serif">Modern</button>
            <button class="font-btn ${(s.textOverlay?.font || '').includes('serif') ? 'active' : ''}" data-font="Georgia, serif">Editorial</button>
          </div>

          <div style="font-size:13px; font-weight:600; color:#cbd5e1; margin-top:8px;">Color</div>
          <div class="color-swatches-row">
            <div class="color-swatch ${(s.textOverlay?.color || '#ffffff') === '#ffffff' ? 'active' : ''}" style="background:#ffffff;" data-color="#ffffff"></div>
            <div class="color-swatch ${s.textOverlay?.color === '#f59e0b' ? 'active' : ''}" style="background:#f59e0b;" data-color="#f59e0b"></div>
            <div class="color-swatch ${s.textOverlay?.color === '#ec4899' ? 'active' : ''}" style="background:#ec4899;" data-color="#ec4899"></div>
            <div class="color-swatch ${s.textOverlay?.color === '#38bdf8' ? 'active' : ''}" style="background:#38bdf8;" data-color="#38bdf8"></div>
          </div>
        </div>
      `;

      const input = document.getElementById('input-overlay-text');
      input.addEventListener('input', (e) => {
        const text = e.target.value;
        const current = s.textOverlay || {};
        this.photoEditor.setTextOverlay({
          text,
          font: current.font || 'Outfit, sans-serif',
          color: current.color || '#ffffff',
          position: current.position || 'bottom'
        });
      });

      panel.querySelectorAll('.font-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          audioManager.playClick();
          const font = btn.getAttribute('data-font');
          const current = s.textOverlay || {};
          this.photoEditor.setTextOverlay({ ...current, font });
          this._selectPhotoToolTab('text');
        });
      });

      panel.querySelectorAll('.color-swatch').forEach(sw => {
        sw.addEventListener('click', () => {
          audioManager.playClick();
          const color = sw.getAttribute('data-color');
          const current = s.textOverlay || {};
          this.photoEditor.setTextOverlay({ ...current, color });
          this._selectPhotoToolTab('text');
        });
      });

    } else if (tabId === 'stickers') {
      const stickers = [
        { id: 'star', name: 'Fest Star', icon: '⭐' },
        { id: 'seal', name: 'Campus Seal', icon: '🛡️' },
        { id: 'polaroid', name: 'Polaroid Frame', icon: '🖼️' },
        { id: 'border', name: 'Clean Border', icon: '🔲' }
      ];

      panel.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          ${stickers.map(st => `
            <div class="filter-preset-card ${s.sticker === st.id ? 'active' : ''}" data-sticker-id="${st.id}">
              <div style="font-size:32px; margin-bottom:6px;">${st.icon}</div>
              <div class="filter-preset-name">${st.name}</div>
            </div>
          `).join('')}
        </div>
      `;

      panel.querySelectorAll('.filter-preset-card').forEach(card => {
        card.addEventListener('click', () => {
          audioManager.playClick();
          const sid = card.getAttribute('data-sticker-id');
          this.photoEditor.setSticker(sid);
          this._selectPhotoToolTab('stickers');
        });
      });
    }
  }

  // --- Video Workspace Setup ---

  _initVideoWorkspace(level, media) {
    const container = document.getElementById('video-wrapper');
    const overlay = document.getElementById('video-overlay-canvas');

    this.videoEditor = new VideoEditor(container, overlay, {
      onStateChange: (state) => {
        this.lastEditState = state;
        this._updateLiveGuidance(level, state);
      },
      onTimeUpdate: (current, total) => {
        this._updateTimelineTime(current, total);
      }
    });

    this.videoEditor.loadMedia(media);
    this._buildVideoToolTabs(level);
    this._initTimelineControls();
  }

  _buildVideoToolTabs(level) {
    const tabsContainer = document.getElementById('editor-sidebar-tabs');
    const unlocked = level.unlockedTools || ['trim', 'playback'];

    const allTabs = [
      { id: 'trim', name: 'Trim', icon: '✂️' },
      { id: 'audio', name: 'Audio', icon: '🎵' },
      { id: 'text', name: 'Captions', icon: '💬' },
      { id: 'transitions', name: 'Transitions', icon: '🔄' },
      { id: 'speed', name: 'Speed', icon: '⚡' }
    ];

    tabsContainer.innerHTML = allTabs.map(tab => {
      const isAvailable = unlocked.includes(tab.id) || unlocked.includes('playback');
      return `
        <button class="tool-tab-btn ${isAvailable ? '' : 'locked'}" data-tab-id="${tab.id}">
          <span>${tab.icon}</span>
          <span>${tab.name}</span>
        </button>
      `;
    }).join('');

    const firstTab = allTabs.find(t => unlocked.includes(t.id)) || allTabs[0];
    this._selectVideoToolTab(firstTab.id);

    tabsContainer.querySelectorAll('.tool-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!btn.classList.contains('locked')) {
          audioManager.playClick();
          this._selectVideoToolTab(btn.getAttribute('data-tab-id'));
        }
      });
    });
  }

  _selectVideoToolTab(tabId) {
    const tabs = document.querySelectorAll('.sidebar-tabs .tool-tab-btn');
    tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-tab-id') === tabId));

    const panel = document.getElementById('editor-controls-panel');
    const s = this.videoEditor ? this.videoEditor.getState() : {};

    if (tabId === 'trim') {
      panel.innerHTML = `
        <div class="slider-group">
          <div class="slider-label-row">
            <span>Trim Start In-Point</span>
            <span class="slider-value-pill" id="val-trim-start">${(s.trimStart || 0).toFixed(1)}s</span>
          </div>
          <input type="range" class="custom-range" id="input-trim-start" min="0" max="${s.totalDuration - 1}" step="0.1" value="${s.trimStart || 0}">
        </div>

        <div class="slider-group" style="margin-top:16px;">
          <div class="slider-label-row">
            <span>Trim End Out-Point</span>
            <span class="slider-value-pill" id="val-trim-end">${(s.trimEnd || s.totalDuration).toFixed(1)}s</span>
          </div>
          <input type="range" class="custom-range" id="input-trim-end" min="1" max="${s.totalDuration}" step="0.1" value="${s.trimEnd || s.totalDuration}">
        </div>
      `;

      document.getElementById('input-trim-start').addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        document.getElementById('val-trim-start').textContent = `${val.toFixed(1)}s`;
        this.videoEditor.setTrimStart(val);
        this._updateTrimHandles();
      });

      document.getElementById('input-trim-end').addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        document.getElementById('val-trim-end').textContent = `${val.toFixed(1)}s`;
        this.videoEditor.setTrimEnd(val);
        this._updateTrimHandles();
      });

    } else if (tabId === 'audio') {
      const tracks = audioManager.getTracks();
      panel.innerHTML = `
        <div style="font-size:13px; font-weight:700; color:#cbd5e1; margin-bottom:10px;">Select Soundtrack</div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${tracks.map(tr => `
            <div class="filter-preset-card ${s.audioTrack?.id === tr.id ? 'active' : ''}" data-track-id="${tr.id}" style="text-align:left; padding:10px; display:flex; align-items:center; gap:10px;">
              <span style="font-size:22px;">${tr.icon}</span>
              <div style="flex:1;">
                <div style="font-size:13px; font-weight:700; color:white;">${tr.name}</div>
                <div style="font-size:11px; color:#94a3b8;">${tr.vibe}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="slider-group" style="margin-top:18px;">
          <div class="slider-label-row">
            <span>Music Volume</span>
            <span class="slider-value-pill" id="val-audio-vol">${s.audioVolume || 60}%</span>
          </div>
          <input type="range" class="custom-range" id="input-audio-vol" min="0" max="100" value="${s.audioVolume || 60}">
        </div>
      `;

      panel.querySelectorAll('.filter-preset-card').forEach(card => {
        card.addEventListener('click', () => {
          audioManager.playClick();
          const tid = card.getAttribute('data-track-id');
          const track = tracks.find(t => t.id === tid);
          this.videoEditor.setAudioTrack(track);
          this._selectVideoToolTab('audio');
        });
      });

      document.getElementById('input-audio-vol').addEventListener('input', (e) => {
        const val = e.target.value;
        document.getElementById('val-audio-vol').textContent = `${val}%`;
        this.videoEditor.setAudioVolume(val);
      });

    } else if (tabId === 'text') {
      panel.innerHTML = `
        <div class="text-tool-controls">
          <label style="font-size:13px; font-weight:600; color:#cbd5e1;">Caption Overlay</label>
          <input type="text" class="text-input-field" id="input-caption-text" placeholder="Type on-screen caption..." value="${s.captionText || ''}">

          <div style="font-size:13px; font-weight:600; color:#cbd5e1; margin-top:8px;">Position</div>
          <div class="font-select-grid">
            <button class="font-btn ${(s.captionPosition || 'bottom') === 'bottom' ? 'active' : ''}" data-pos="bottom">Bottom Third</button>
            <button class="font-btn ${s.captionPosition === 'center' ? 'active' : ''}" data-pos="center">Center Punch</button>
          </div>
        </div>
      `;

      document.getElementById('input-caption-text').addEventListener('input', (e) => {
        this.videoEditor.setCaptionText(e.target.value);
      });

      panel.querySelectorAll('.font-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          audioManager.playClick();
          const pos = btn.getAttribute('data-pos');
          this.videoEditor.setCaptionPosition(pos);
          this._selectVideoToolTab('text');
        });
      });

    } else if (tabId === 'transitions') {
      const transitions = [
        { id: 'none', name: 'Standard Cut', icon: '✂️' },
        { id: 'crossfade', name: 'Cross Dissolve', icon: '🌫️' },
        { id: 'fade-black', name: 'Fade to Black', icon: '⬛' },
        { id: 'zoom', name: 'Zoom Blur', icon: '🔍' }
      ];

      panel.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          ${transitions.map(tr => `
            <div class="filter-preset-card ${s.transition === tr.id ? 'active' : ''}" data-transition-id="${tr.id}">
              <div style="font-size:26px; margin-bottom:4px;">${tr.icon}</div>
              <div class="filter-preset-name">${tr.name}</div>
            </div>
          `).join('')}
        </div>
      `;

      panel.querySelectorAll('.filter-preset-card').forEach(card => {
        card.addEventListener('click', () => {
          audioManager.playClick();
          const trId = card.getAttribute('data-transition-id');
          this.videoEditor.setTransition(trId);
          this._selectVideoToolTab('transitions');
        });
      });

    } else if (tabId === 'speed') {
      const speeds = [0.5, 1.0, 1.5, 2.0];
      panel.innerHTML = `
        <div style="font-size:13px; font-weight:700; color:#cbd5e1; margin-bottom:10px;">Playback Speed Multiplier</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          ${speeds.map(sp => `
            <button class="font-btn ${(s.playbackSpeed || 1.0) === sp ? 'active' : ''}" data-speed="${sp}">
              ${sp === 0.5 ? '0.5x Slow-Mo' : sp === 1.0 ? '1.0x Normal' : `${sp}x Fast`}
            </button>
          `).join('')}
        </div>
      `;

      panel.querySelectorAll('.font-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          audioManager.playClick();
          const sp = parseFloat(btn.getAttribute('data-speed'));
          this.videoEditor.setSpeed(sp);
          const badge = document.getElementById('timeline-speed-badge');
          if (badge) badge.textContent = `Speed: ${sp}x`;
          this._selectVideoToolTab('speed');
        });
      });
    }
  }

  _initTimelineControls() {
    const playBtn = document.getElementById('timeline-play-btn');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        audioManager.playClick();
        this.videoEditor.togglePlay();
        playBtn.textContent = this.videoEditor.isPlaying ? '⏸' : '▶';
      });
    }

    const splitBtn = document.getElementById('timeline-split-btn');
    if (splitBtn) {
      splitBtn.addEventListener('click', () => {
        audioManager.playClick();
        this.videoEditor.splitAtCurrentTime();
        alert(`Clip split successfully at ${this.videoEditor.currentTime.toFixed(1)}s!`);
      });
    }

    // Timeline track scrubbing
    const track = document.getElementById('timeline-track');
    if (track) {
      track.addEventListener('click', (e) => {
        const rect = track.getBoundingClientRect();
        const frac = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
        this.videoEditor.scrub(frac);
      });
    }
  }

  _updateTimelineTime(current, total) {
    const readout = document.getElementById('timeline-time-readout');
    const playhead = document.getElementById('timeline-playhead');
    const playBtn = document.getElementById('timeline-play-btn');

    if (playBtn && this.videoEditor) {
      playBtn.textContent = this.videoEditor.isPlaying ? '⏸' : '▶';
    }

    if (readout) {
      const curM = Math.floor(current / 60);
      const curS = Math.floor(current % 60);
      const totM = Math.floor(total / 60);
      const totS = Math.floor(total % 60);
      readout.textContent = `${curM}:${curS.toString().padStart(2, '0')} / ${totM}:${totS.toString().padStart(2, '0')}`;
    }

    if (playhead && total > 0) {
      const pct = (current / total) * 100;
      playhead.style.left = `${pct}%`;
    }
  }

  _updateTrimHandles() {
    const region = document.getElementById('timeline-trim-region');
    if (!region || !this.videoEditor) return;
    const s = this.videoEditor.getState();
    const startFrac = (s.trimStart / s.totalDuration) * 100;
    const endFrac = 100 - ((s.trimEnd / s.totalDuration) * 100);
    region.style.left = `${startFrac}%`;
    region.style.right = `${endFrac}%`;
  }

  // --- Live Guidance & Feedback ---

  _updateLiveGuidance(level, editState) {
    const guide = tutorBuddy.getLiveEditorGuidance(level, editState);
    const guideText = document.getElementById('buddy-guide-text');
    const taskBadge = document.getElementById('live-task-badge');
    const taskLabel = document.getElementById('live-task-label');

    if (guideText) guideText.textContent = guide.text;
    if (taskBadge && taskLabel) {
      taskBadge.classList.toggle('complete', guide.done);
      taskLabel.textContent = guide.done ? 'Goal Reached! ✅' : 'Working on it...';
    }
  }

  // ==========================================================================
  // MODAL: Scoring & Results (>90% Unlock Rule)
  // ==========================================================================

  _submitTaskForScoring(level) {
    const isVideo = this.currentMode === 'video';
    const editState = isVideo ? this.videoEditor.getState() : this.photoEditor.getState();

    // Evaluate using intelligent rule-based tutor engine
    const evaluation = isVideo
      ? ScoringEngine.evaluateVideoTask(level, editState)
      : ScoringEngine.evaluatePhotoTask(level, editState);

    const isPassed = evaluation.isPassed; // strictly > 90%
    const score = evaluation.score;

    if (isPassed) {
      audioManager.playSuccess();
      this.triggerConfetti();

      // Unlock progression
      if (!level.mode || level.mode === 'photo') {
        if (level.id >= this.state.photoUnlockedLevel && this.state.photoUnlockedLevel < 8) {
          this.state.photoUnlockedLevel = level.id + 1;
        }
      } else if (level.mode === 'video' || isVideo) {
        if (level.id >= this.state.videoUnlockedLevel && this.state.videoUnlockedLevel < 8) {
          this.state.videoUnlockedLevel = level.id + 1;
        }
      }

      // Add XP & record score
      this.state.xp += level.xpReward || 50;
      const key = `${this.currentMode}-${level.id}`;
      this.state.scores[key] = Math.max(score, this.state.scores[key] || 0);

      // Star rating: 3 stars for 96-100%, 2 stars for 91-95%
      this.state.stars[key] = score >= 96 ? 3 : 2;

      // Award badge if not already collected
      if (level.badgeAwarded && !this.state.badges.includes(level.badgeAwarded)) {
        this.state.badges.push(level.badgeAwarded);
      }

      this.saveState();
    } else {
      audioManager.playEncouraging();
    }

    this.modalContainer.innerHTML = `
      <div class="results-modal-dialog">
        <!-- Result Header -->
        <div class="results-header ${isPassed ? 'pass' : 'retry'}">
          <div class="results-mascot-reaction">${isPassed ? '🎉' : '🧐'}</div>
          <div class="results-title ${isPassed ? 'pass' : 'retry'}">
            ${isPassed ? 'Outstanding Job! Level Cleared!' : 'Almost There! Keep Going!'}
          </div>
          <div class="results-subtitle">
            ${isPassed
              ? 'You demonstrated great control and completed all core lesson goals!'
              : 'You made great progress! A quick adjustment is all you need to reach 90%+ and unlock the next level.'}
          </div>

          <!-- Circular Score Gauge -->
          <div class="score-circle-wrapper">
            <svg class="score-svg" viewBox="0 0 140 140">
              <defs>
                <linearGradient id="scoreGradPass" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#10b981"/>
                  <stop offset="100%" stop-color="#059669"/>
                </linearGradient>
                <linearGradient id="scoreGradRetry" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#f59e0b"/>
                  <stop offset="100%" stop-color="#ea580c"/>
                </linearGradient>
              </defs>
              <circle class="score-bg-circle" cx="70" cy="70" r="60"/>
              <circle class="score-progress-circle" id="score-ring" cx="70" cy="70" r="60"/>
            </svg>
            <div class="score-number-display">
              <span class="score-percent">${score}%</span>
              <span class="score-targetHint" style="font-size:11px; font-weight:700; color:var(--text-muted);">
                ${isPassed ? 'Passed (>90%)' : 'Need >90%'}
              </span>
            </div>
          </div>

          <!-- Unlock Status Pill -->
          <div class="unlock-status-pill ${isPassed ? 'unlocked' : 'locked'}">
            ${isPassed ? '🔓 Next Level Unlocked!' : '🔒 Score Above 90% to Unlock Next Level'}
          </div>
        </div>

        <div class="modal-body" style="padding-top:16px;">
          <!-- What You Did Well -->
          <div class="feedback-box">
            <div class="feedback-section-title good">
              <span>🌟</span> What You Did Well
            </div>
            <ul class="feedback-list">
              ${evaluation.strengths.map(s => `
                <li class="feedback-item">
                  <span class="feedback-icon" style="color:#059669;">✓</span>
                  <span>${s}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <!-- Constructive Improvement Suggestions -->
          ${evaluation.suggestions.length > 0 ? `
            <div class="feedback-box">
              <div class="feedback-section-title improve">
                <span>🎯</span> Buddy's Helpful Guidance
              </div>
              <ul class="feedback-list">
                ${evaluation.suggestions.map(sg => `
                  <li class="feedback-item">
                    <span class="feedback-icon" style="color:#d97706;">💡</span>
                    <span>${sg}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}

          <!-- Pro Tip -->
          <div class="buddy-pro-tip">
            <strong>🧑‍🏫 Buddy's Pro Tip:</strong>
            ${evaluation.proTip}
          </div>
        </div>

        <div class="results-actions">
          ${isPassed ? `
            <button class="btn btn-secondary" id="res-back-path-btn">Learning Path</button>
            <button class="btn results-btn-next btn-lg" id="res-next-level-btn">
              <span>Next Level</span> <span>➔</span>
            </button>
          ` : `
            <button class="btn results-btn-retry btn-lg" id="res-retry-btn">
              <span>🔄 Retry with Guidance</span>
            </button>
          `}
        </div>
      </div>
    `;

    this.openModal();

    // Animate score ring progress
    setTimeout(() => {
      const ring = document.getElementById('score-ring');
      if (ring) {
        const circumference = 2 * Math.PI * 60; // ~377
        const offset = circumference - (score / 100) * circumference;
        ring.style.strokeDashoffset = offset;
      }
    }, 100);

    // Modal actions
    if (isPassed) {
      document.getElementById('res-back-path-btn')?.addEventListener('click', () => {
        audioManager.playClick();
        this.closeModal();
        this.renderView('path', { mode: this.currentMode });
      });

      document.getElementById('res-next-level-btn')?.addEventListener('click', () => {
        audioManager.playClick();
        this.closeModal();
        const nextId = level.id + 1;
        const levels = isVideo ? VIDEO_LEVELS : PHOTO_LEVELS;
        const nextLvl = levels.find(l => l.id === nextId);

        if (nextLvl) {
          this.currentLevel = nextLvl;
          this.renderView('picker', { mode: this.currentMode, level: nextLvl });
        } else {
          this.renderView('path', { mode: this.currentMode });
        }
      });
    } else {
      document.getElementById('res-retry-btn')?.addEventListener('click', () => {
        audioManager.playClick();
        this.closeModal();
        // Returns directly to editor with state intact so learner can make the tweak!
      });
    }
  }

  // --- Modal Helpers ---

  openModal() {
    this.modalOverlay.classList.add('active');
  }

  closeModal() {
    this.modalOverlay.classList.remove('active');
    clearTimeout(this._tutorialTimer1);
    clearTimeout(this._tutorialTimer2);
  }

  // --- Confetti Celebration Effect ---

  initConfetti() {
    if (!this.confettiCanvas) return;
    this.confettiCtx = this.confettiCanvas.getContext('2d');
    this.confettiParticles = [];
  }

  triggerConfetti() {
    if (!this.confettiCanvas) return;
    this.confettiCanvas.width = window.innerWidth;
    this.confettiCanvas.height = window.innerHeight;

    const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#38bdf8', '#8b5cf6'];
    this.confettiParticles = [];

    for (let i = 0; i < 90; i++) {
      this.confettiParticles.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.7) * 18,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        life: 1.0
      });
    }

    if (!this._confettiAnimId) {
      this._animateConfetti();
    }
  }

  _animateConfetti() {
    if (this.confettiParticles.length === 0) {
      this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
      this._confettiAnimId = null;
      return;
    }

    this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);

    for (let i = this.confettiParticles.length - 1; i >= 0; i--) {
      const p = this.confettiParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4; // gravity
      p.rotation += p.rotSpeed;
      p.life -= 0.015;

      if (p.life <= 0 || p.y > window.innerHeight) {
        this.confettiParticles.splice(i, 1);
        continue;
      }

      this.confettiCtx.save();
      this.confettiCtx.translate(p.x, p.y);
      this.confettiCtx.rotate((p.rotation * Math.PI) / 180);
      this.confettiCtx.fillStyle = p.color;
      this.confettiCtx.globalAlpha = p.life;
      this.confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      this.confettiCtx.restore();
    }

    this._confettiAnimId = requestAnimationFrame(() => this._animateConfetti());
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.editBuddyApp = new EditBuddyApp();
});
