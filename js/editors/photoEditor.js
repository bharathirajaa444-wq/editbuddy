/**
 * EditBuddy - Photo Editor Engine
 * Full-featured, beginner-friendly HTML5 Canvas photo editor.
 * Supports crop/straighten, exposure/light, contrast/color, text overlays,
 * filter presets, stickers, undo/redo, and instant before/after comparison.
 */

export class PhotoEditor {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.onStateChange = options.onStateChange || (() => {});

    this.rawImage = null;
    this.originalDataUrl = null;
    this.isComparing = false;

    // Current Edit State
    this.state = {
      brightness: 0,       // -100 to 100
      contrast: 0,         // -100 to 100
      saturation: 0,       // -100 to 100
      warmth: 0,           // -100 to 100
      straightenAngle: 0,  // -25 to 25 degrees
      cropRatio: 'original', // 'original', '1:1', '4:5', '16:9', 'free'
      cropApplied: false,
      activeFilter: 'original', // 'original', 'golden', 'cool', 'vintage', 'bw', 'vivid'
      textOverlay: null,   // { text, font, color, size, bgPill, x, y }
      sticker: null,       // 'star', 'seal', 'music', 'polaroid', 'border'
      compareCount: 0
    };

    // History for Undo / Redo
    this.history = [];
    this.historyIndex = -1;

    this._saveHistory();
  }

  loadImage(imageUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.rawImage = img;
        this.originalDataUrl = imageUrl;
        this.resetState(false);
        this.render();
        resolve(img);
      };
      img.onerror = (e) => reject(e);
      img.src = imageUrl;
    });
  }

  resetState(notify = true) {
    this.state = {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      warmth: 0,
      straightenAngle: 0,
      cropRatio: 'original',
      cropApplied: false,
      activeFilter: 'original',
      textOverlay: null,
      sticker: null,
      compareCount: 0
    };
    this.history = [];
    this.historyIndex = -1;
    this._saveHistory();
    this.render();
    if (notify) this.onStateChange(this.getState());
  }

  getState() {
    return { ...this.state };
  }

  // --- Adjustments ---

  setBrightness(val) {
    this.state.brightness = parseInt(val, 10);
    this._pushState();
  }

  setContrast(val) {
    this.state.contrast = parseInt(val, 10);
    this._pushState();
  }

  setSaturation(val) {
    this.state.saturation = parseInt(val, 10);
    this._pushState();
  }

  setWarmth(val) {
    this.state.warmth = parseInt(val, 10);
    this._pushState();
  }

  setStraightenAngle(deg) {
    this.state.straightenAngle = parseFloat(deg);
    this._pushState();
  }

  setCropRatio(ratio) {
    this.state.cropRatio = ratio;
    this.state.cropApplied = ratio !== 'original';
    this._pushState();
  }

  setFilter(filterName) {
    this.state.activeFilter = filterName;
    this._pushState();
  }

  setTextOverlay(textData) {
    this.state.textOverlay = textData ? { ...textData } : null;
    this._pushState();
  }

  setSticker(stickerName) {
    this.state.sticker = stickerName === this.state.sticker ? null : stickerName;
    this._pushState();
  }

  // --- Compare Toggle ---

  startComparing() {
    this.isComparing = true;
    this.state.compareCount++;
    this.render();
    this.onStateChange(this.getState());
  }

  stopComparing() {
    this.isComparing = false;
    this.render();
  }

  // --- History (Undo / Redo) ---

  _pushState() {
    this.render();
    this._saveHistory();
    this.onStateChange(this.getState());
  }

  _saveHistory() {
    // Truncate future if branched
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    this.history.push(JSON.parse(JSON.stringify(this.state)));
    if (this.history.length > 20) this.history.shift();
    this.historyIndex = this.history.length - 1;
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.state = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.render();
      this.onStateChange(this.getState());
      return true;
    }
    return false;
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.state = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.render();
      this.onStateChange(this.getState());
      return true;
    }
    return false;
  }

  // --- Rendering Pipeline ---

  render() {
    if (!this.rawImage) return;

    const baseW = this.rawImage.naturalWidth || this.rawImage.width || 800;
    const baseH = this.rawImage.naturalHeight || this.rawImage.height || 800;

    let targetW = baseW;
    let targetH = baseH;

    // Apply aspect ratio crop if not comparing
    if (!this.isComparing && this.state.cropRatio && this.state.cropRatio !== 'original') {
      if (this.state.cropRatio === '1:1') {
        const side = Math.min(baseW, baseH);
        targetW = side;
        targetH = side;
      } else if (this.state.cropRatio === '4:5') {
        if (baseW / baseH > 4 / 5) {
          targetW = Math.round(baseH * (4 / 5));
          targetH = baseH;
        } else {
          targetW = baseW;
          targetH = Math.round(baseW * (5 / 4));
        }
      } else if (this.state.cropRatio === '16:9') {
        if (baseW / baseH > 16 / 9) {
          targetW = Math.round(baseH * (16 / 9));
          targetH = baseH;
        } else {
          targetW = baseW;
          targetH = Math.round(baseW * (9 / 16));
        }
      }
    }

    this.canvas.width = targetW;
    this.canvas.height = targetH;

    this.ctx.clearRect(0, 0, targetW, targetH);
    this.ctx.save();

    // If Comparing, draw original directly
    if (this.isComparing) {
      this.ctx.drawImage(this.rawImage, 0, 0, targetW, targetH);
      this._drawCompareBadge(targetW, targetH);
      this.ctx.restore();
      return;
    }

    // 1. Build CSS filter chain for light/color
    const bFactor = 1 + (this.state.brightness / 100);
    const cFactor = 1 + (this.state.contrast / 100);
    const sFactor = 1 + (this.state.saturation / 100);

    let filterStr = `brightness(${bFactor}) contrast(${cFactor}) saturate(${sFactor})`;

    // Filter Presets
    if (this.state.activeFilter === 'golden') {
      filterStr += ` sepia(0.3) hue-rotate(-15deg)`;
    } else if (this.state.activeFilter === 'cool') {
      filterStr += ` hue-rotate(18deg) saturate(1.2)`;
    } else if (this.state.activeFilter === 'vintage') {
      filterStr += ` sepia(0.45) contrast(0.9) brightness(1.05)`;
    } else if (this.state.activeFilter === 'bw') {
      filterStr += ` grayscale(1) contrast(1.25)`;
    } else if (this.state.activeFilter === 'vivid') {
      filterStr += ` saturate(1.7) contrast(1.15)`;
    }

    this.ctx.filter = filterStr;

    // 2. Straighten rotation
    const angleRad = (this.state.straightenAngle * Math.PI) / 180;
    this.ctx.translate(targetW / 2, targetH / 2);
    if (angleRad !== 0) {
      this.ctx.rotate(angleRad);
    }

    // Draw source image centered
    const sx = Math.max(0, (baseW - targetW) / 2);
    const sy = Math.max(0, (baseH - targetH) / 2);
    this.ctx.drawImage(
      this.rawImage,
      sx, sy, targetW, targetH,
      -targetW / 2, -targetH / 2, targetW, targetH
    );

    this.ctx.restore();

    // 3. Warmth Tint Overlay
    if (this.state.warmth !== 0) {
      this.ctx.save();
      if (this.state.warmth > 0) {
        this.ctx.fillStyle = `rgba(251, 146, 60, ${Math.abs(this.state.warmth) / 350})`;
      } else {
        this.ctx.fillStyle = `rgba(56, 189, 248, ${Math.abs(this.state.warmth) / 350})`;
      }
      this.ctx.fillRect(0, 0, targetW, targetH);
      this.ctx.restore();
    }

    // 4. Stickers & Frame Overlays
    if (this.state.sticker) {
      this._drawSticker(this.state.sticker, targetW, targetH);
    }

    // 5. Text Overlay
    if (this.state.textOverlay && this.state.textOverlay.text) {
      this._drawTextOverlay(this.state.textOverlay, targetW, targetH);
    }
  }

  _drawCompareBadge(w, h) {
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
    this.ctx.fillText('ORIGINAL PHOTO', w / 2, 46);
    this.ctx.restore();
  }

  _drawSticker(stickerType, w, h) {
    this.ctx.save();
    if (stickerType === 'star') {
      // Golden event fest star badge
      const x = w * 0.82;
      const y = h * 0.18;
      this.ctx.fillStyle = '#f59e0b';
      this.ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
      this.ctx.shadowBlur = 16;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 46, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 28px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('⭐', x, y);
    } else if (stickerType === 'seal') {
      // College official badge
      const x = w * 0.82;
      const y = h * 0.2;
      this.ctx.fillStyle = '#4f46e5';
      this.ctx.beginPath();
      this.ctx.arc(x, y, 50, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 42, 0, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 11px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('CAMPUS 2026', x, y - 6);
      this.ctx.font = 'bold 9px sans-serif';
      this.ctx.fillText('OFFICIAL', x, y + 10);
    } else if (stickerType === 'polaroid') {
      // Polaroid vintage border
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 26;
      this.ctx.strokeRect(13, 13, w - 26, h - 26);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, h - 90, w, 90);
    } else if (stickerType === 'border') {
      // Minimalist modern poster frame
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      this.ctx.lineWidth = 8;
      this.ctx.strokeRect(24, 24, w - 48, h - 48);
    }
    this.ctx.restore();
  }

  _drawTextOverlay(overlay, w, h) {
    const text = overlay.text.trim();
    if (!text) return;

    this.ctx.save();
    const fontSize = overlay.size || Math.round(w * 0.065);
    const fontFamily = overlay.font || 'Outfit, sans-serif';
    this.ctx.font = `bold ${fontSize}px ${fontFamily}`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const textMetrics = this.ctx.measureText(text);
    const textWidth = textMetrics.width;

    const posX = overlay.x || w / 2;
    const posY = overlay.y || (overlay.position === 'top' ? h * 0.16 : overlay.position === 'center' ? h * 0.5 : h * 0.84);

    // Optional background pill for contrast
    if (overlay.bgPill !== false) {
      this.ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      const padX = 24;
      const padY = 12;
      this.ctx.beginPath();
      this.ctx.roundRect(
        posX - (textWidth / 2) - padX,
        posY - (fontSize / 2) - padY,
        textWidth + (padX * 2),
        fontSize + (padY * 2),
        14
      );
      this.ctx.fill();
    }

    // Text Shadow
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    this.ctx.shadowBlur = 8;

    this.ctx.fillStyle = overlay.color || '#ffffff';
    this.ctx.fillText(text, posX, posY);
    this.ctx.restore();
  }

  exportDataUrl(format = 'image/png') {
    return this.canvas.toDataURL(format, 0.95);
  }
}
