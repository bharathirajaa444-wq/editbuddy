/**
 * EditBuddy - Media Library
 * Provides curated demo photos & videos organized into familiar albums,
 * plus helper functions for uploading user-provided device media.
 */

export const ALBUMS = [
  { id: 'recent', name: 'Recent', icon: '🕒' },
  { id: 'camera', name: 'Camera', icon: '📷' },
  { id: 'downloads', name: 'Downloads', icon: '📥' },
  { id: 'screenshots', name: 'Screenshots', icon: '📱' },
  { id: 'whatsapp', name: 'WhatsApp Images', icon: '💬' }
];

// Helper to generate crisp SVG data URLs for sample photography
function createPhotoSvg(title, bgGradient, elementsSvg, subtitle) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
    <defs>
      ${bgGradient}
      <linearGradient id="vignette" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="rgba(0,0,0,0.1)"/>
        <stop offset="70%" stop-color="transparent"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0.6)"/>
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="8" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <rect width="800" height="800" fill="url(#bg)"/>
    ${elementsSvg}
    <rect width="800" height="800" fill="url(#vignette)"/>
    <text x="40" y="740" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="28" font-weight="800" letter-spacing="0.5">${title}</text>
    <text x="40" y="770" fill="#cbd5e1" font-family="-apple-system, sans-serif" font-size="16" font-weight="500">${subtitle || 'EditBuddy Learning Preset'}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 8 Curated Photos tailored to specific lessons
export const PHOTO_PRESETS = [
  {
    id: 'p-sunset-dim',
    title: 'Campus Sunset Walk',
    album: 'camera',
    type: 'photo',
    aspect: '1:1',
    description: 'A dim golden sunset that needs brightness and color pop.',
    url: createPhotoSvg(
      'Campus Sunset Walk',
      `<linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1e1b4b"/>
        <stop offset="40%" stop-color="#431407"/>
        <stop offset="75%" stop-color="#7c2d12"/>
        <stop offset="100%" stop-color="#18181b"/>
      </linearGradient>`,
      `<circle cx="400" cy="460" r="110" fill="#fdba74" opacity="0.85" filter="url(#glow)"/>
       <polygon points="0,520 220,440 380,510 560,420 800,530 800,800 0,800" fill="#1c1917"/>
       <path d="M 280 430 L 300 320 L 320 430 Z M 340 460 L 355 350 L 370 460 Z" fill="#0c0a09"/>
       <rect x="306" y="320" width="8" height="110" fill="#292524"/>
       <circle cx="120" cy="180" r="2" fill="#fff" opacity="0.7"/>
       <circle cx="680" cy="130" r="2.5" fill="#fff" opacity="0.9"/>
       <circle cx="580" cy="220" r="1.5" fill="#fff" opacity="0.5"/>`,
      'Great for adjusting exposure & brightness'
    )
  },
  {
    id: 'p-crooked-beach',
    title: 'Ocean Horizon Walkway',
    album: 'recent',
    type: 'photo',
    aspect: '1:1',
    description: 'A tilted ocean horizon waiting to be straightened and cropped.',
    url: createPhotoSvg(
      'Ocean Horizon Walkway',
      `<linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="45%" stop-color="#7dd3fc"/>
        <stop offset="50%" stop-color="#0369a1"/>
        <stop offset="100%" stop-color="#075985"/>
      </linearGradient>`,
      `<g transform="rotate(-7, 400, 400)">
        <rect x="-100" y="380" width="1000" height="240" fill="#0284c7"/>
        <path d="M -100 420 Q 300 400 900 420 L 900 620 L -100 620 Z" fill="#38bdf8" opacity="0.4"/>
        <polygon points="320,620 400,380 480,380 560,620" fill="#78350f"/>
        <line x1="400" y1="380" x2="320" y2="620" stroke="#fde68a" stroke-width="6"/>
        <line x1="480" y1="380" x2="560" y2="620" stroke="#fde68a" stroke-width="6"/>
       </g>
       <circle cx="650" cy="190" r="45" fill="#fef08a" opacity="0.9"/>`,
      'Ideal for practicing crop & straighten'
    )
  },
  {
    id: 'p-coffee-flatlay',
    title: 'Study Desk & Coffee',
    album: 'downloads',
    type: 'photo',
    aspect: '1:1',
    description: 'A study setup needing contrast boost, warm filters, and sticker notes.',
    url: createPhotoSvg(
      'Study Desk & Coffee',
      `<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#e2e8f0"/>
        <stop offset="100%" stop-color="#cbd5e1"/>
      </linearGradient>`,
      `<rect x="120" y="140" width="380" height="520" rx="16" fill="#f8fafc" stroke="#94a3b8" stroke-width="4"/>
       <line x1="160" y1="220" x2="460" y2="220" stroke="#cbd5e1" stroke-width="3"/>
       <line x1="160" y1="280" x2="460" y2="280" stroke="#cbd5e1" stroke-width="3"/>
       <line x1="160" y1="340" x2="420" y2="340" stroke="#cbd5e1" stroke-width="3"/>
       <line x1="160" y1="400" x2="440" y2="400" stroke="#cbd5e1" stroke-width="3"/>
       <circle cx="600" cy="400" r="100" fill="#78350f" stroke="#fff" stroke-width="12" filter="url(#glow)"/>
       <circle cx="600" cy="400" r="85" fill="#451a03"/>
       <path d="M 580 390 Q 600 370 620 390 Q 640 410 600 420 Z" fill="#d97706" opacity="0.6"/>
       <rect x="520" y="580" width="160" height="24" rx="12" fill="#0284c7"/>`,
      'Perfect for text overlays & warm filters'
    )
  },
  {
    id: 'p-festival-lights',
    title: 'College Cultural Night',
    album: 'camera',
    type: 'photo',
    aspect: '1:1',
    description: 'Concert stage crowd with vibrant neon lights and stage glow.',
    url: createPhotoSvg(
      'College Cultural Night',
      `<linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#18181b"/>
        <stop offset="50%" stop-color="#3b0764"/>
        <stop offset="100%" stop-color="#09090b"/>
      </linearGradient>`,
      `<circle cx="200" cy="280" r="140" fill="#a855f7" opacity="0.3" filter="url(#glow)"/>
       <circle cx="600" cy="260" r="150" fill="#ec4899" opacity="0.35" filter="url(#glow)"/>
       <circle cx="400" cy="220" r="120" fill="#06b6d4" opacity="0.3" filter="url(#glow)"/>
       <polygon points="100,0 260,340 180,340" fill="#c084fc" opacity="0.4"/>
       <polygon points="700,0 540,340 620,340" fill="#f472b6" opacity="0.4"/>
       <path d="M 50 650 Q 80 580 110 650 Q 140 590 170 650 Q 200 570 240 650 Q 300 550 360 650 Q 420 540 480 650 Q 540 560 600 650 Q 660 580 720 650 L 800 650 L 800 800 L 0 800 Z" fill="#09090b"/>
       <circle cx="360" cy="530" r="18" fill="#09090b"/>
       <circle cx="480" cy="520" r="20" fill="#09090b"/>`,
      'Great for bold filters and event posters'
    )
  },
  {
    id: 'p-portrait-shadow',
    title: 'Library Study Portrait',
    album: 'whatsapp',
    type: 'photo',
    aspect: '1:1',
    description: 'A classic portrait shot with shadowed face needing fill light.',
    url: createPhotoSvg(
      'Library Study Portrait',
      `<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#334155"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>`,
      `<rect x="80" y="80" width="640" height="640" rx="320" fill="#f1f5f9" opacity="0.05"/>
       <circle cx="400" cy="340" r="120" fill="#fed7aa"/>
       <path d="M 400 220 Q 360 210 320 270 Q 300 350 300 400 L 400 400 Z" fill="#451a03"/>
       <path d="M 400 220 Q 440 210 480 270 Q 500 350 500 400 L 400 400 Z" fill="#292524"/>
       <path d="M 400 240 Q 360 230 350 280 L 400 280 Z" fill="#1c1917"/>
       <path d="M 240 600 Q 240 480 400 480 Q 560 480 560 600 L 560 760 L 240 760 Z" fill="#0369a1"/>
       <rect x="360" y="440" width="80" height="60" fill="#fed7aa"/>
       <rect x="400" y="220" width="120" height="260" fill="rgba(0,0,0,0.25)"/>`,
      'Practice portrait lighting & warmth'
    )
  },
  {
    id: 'p-sports-ground',
    title: 'Inter-College Football Match',
    album: 'camera',
    type: 'photo',
    aspect: '1:1',
    description: 'Action on the campus turf under bright daylight.',
    url: createPhotoSvg(
      'Inter-College Football Match',
      `<linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="40%" stop-color="#bae6fd"/>
        <stop offset="42%" stop-color="#15803d"/>
        <stop offset="100%" stop-color="#14532d"/>
      </linearGradient>`,
      `<line x1="0" y1="480" x2="800" y2="480" stroke="#ffffff" stroke-width="6" opacity="0.8"/>
       <circle cx="400" cy="620" r="160" fill="none" stroke="#ffffff" stroke-width="6" opacity="0.7"/>
       <circle cx="360" cy="500" r="32" fill="#ffffff" stroke="#000" stroke-width="4"/>
       <polygon points="360,480 375,492 368,510 352,510 345,492" fill="#000"/>
       <circle cx="680" cy="120" r="40" fill="#facc15" filter="url(#glow)"/>`,
      'Vibrant greens & dynamic crop ratios'
    )
  },
  {
    id: 'p-drone-campus',
    title: 'University Main Building',
    album: 'screenshots',
    type: 'photo',
    aspect: '1:1',
    description: 'Aerial architecture photo suited for clean college event flyers.',
    url: createPhotoSvg(
      'University Main Building',
      `<linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="40%" stop-color="#e0f2fe"/>
        <stop offset="42%" stop-color="#059669"/>
        <stop offset="100%" stop-color="#064e3b"/>
      </linearGradient>`,
      `<rect x="180" y="240" width="440" height="260" fill="#f8fafc" stroke="#cbd5e1" stroke-width="4"/>
       <polygon points="400,120 160,240 640,240" fill="#dc2626"/>
       <rect x="360" y="320" width="80" height="180" fill="#475569"/>
       <rect x="220" y="280" width="40" height="60" fill="#38bdf8"/>
       <rect x="300" y="280" width="40" height="60" fill="#38bdf8"/>
       <rect x="460" y="280" width="40" height="60" fill="#38bdf8"/>
       <rect x="540" y="280" width="40" height="60" fill="#38bdf8"/>
       <circle cx="400" cy="180" r="22" fill="#fde047" stroke="#451a03" stroke-width="4"/>`,
      'Ideal for poster layouts and badges'
    )
  },
  {
    id: 'p-polaroid-friends',
    title: 'Graduation Canteen Hangout',
    album: 'whatsapp',
    type: 'photo',
    aspect: '1:1',
    description: 'Candid memory shot with friends ready for nostalgic filters.',
    url: createPhotoSvg(
      'Graduation Hangout',
      `<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fb7185"/>
        <stop offset="50%" stop-color="#f43f5e"/>
        <stop offset="100%" stop-color="#fda4af"/>
      </linearGradient>`,
      `<rect x="140" y="100" width="520" height="560" rx="12" fill="#ffffff" stroke="#f1f5f9" stroke-width="4" filter="url(#glow)"/>
       <rect x="170" y="130" width="460" height="380" fill="#fef08a"/>
       <circle cx="320" cy="300" r="50" fill="#3b82f6"/>
       <circle cx="480" cy="310" r="50" fill="#10b981"/>
       <polygon points="320,210 270,240 370,240" fill="#1e293b"/>
       <polygon points="480,220 430,250 530,250" fill="#1e293b"/>
       <text x="220" y="580" fill="#475569" font-family="'Brush Script MT', cursive, sans-serif" font-size="34">Best Four Years! ✨</text>`,
      'Great for collage & college memories'
    )
  }
];

// 6 Curated Video Presets with duration tags and animated visual canvas generator
export const VIDEO_PRESETS = [
  {
    id: 'v-skate-jump',
    title: 'Skater Kickflip at Campus Plaza',
    album: 'camera',
    type: 'video',
    durationSec: 12,
    durationText: '0:12',
    colorTheme: '#ec4899',
    description: 'An action sequence with an awkward pause at start and shaky end, ideal for trimming & slow-mo.',
    sceneType: 'skate'
  },
  {
    id: 'v-dance-crew',
    title: 'College Fest Hip-Hop Crew',
    album: 'recent',
    type: 'video',
    durationSec: 16,
    durationText: '0:16',
    colorTheme: '#6366f1',
    description: 'Energetic choreography with clear beat drops, ideal for clip splitting, captions, and upbeat music.',
    sceneType: 'dance'
  },
  {
    id: 'v-drone-campus-fly',
    title: 'Golden Hour Campus Aerial',
    album: 'downloads',
    type: 'video',
    durationSec: 20,
    durationText: '0:20',
    colorTheme: '#f59e0b',
    description: 'Cinematic sweeping drone shot across the central library and sports grounds.',
    sceneType: 'drone'
  },
  {
    id: 'v-robotics-demo',
    title: 'Tech Fest Bot Race',
    album: 'camera',
    type: 'video',
    durationSec: 10,
    durationText: '0:10',
    colorTheme: '#06b6d4',
    description: 'Fast-paced mini robot obstacle race, great for speed-ramping and transitions.',
    sceneType: 'robot'
  },
  {
    id: 'v-music-jam',
    title: 'Acoustic Jam by the Trees',
    album: 'whatsapp',
    type: 'video',
    durationSec: 15,
    durationText: '0:15',
    colorTheme: '#10b981',
    description: 'Soothing guitar performance outdoors, great for audio mixing & fade-in effects.',
    sceneType: 'acoustic'
  },
  {
    id: 'v-farewell-cheer',
    title: 'Class of 2026 Cap Toss',
    album: 'recent',
    type: 'video',
    durationSec: 8,
    durationText: '0:08',
    colorTheme: '#8b5cf6',
    description: 'The iconic graduation moment with slow-motion cap toss in the air.',
    sceneType: 'graduation'
  }
];

// Helper to draw realistic thumbnail canvas for video presets
export function renderVideoThumbnail(canvas, preset) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  // Background
  const grad = ctx.createLinearGradient(0, 0, w, h);
  if (preset.sceneType === 'skate') {
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(1, '#831843');
  } else if (preset.sceneType === 'dance') {
    grad.addColorStop(0, '#312e81');
    grad.addColorStop(1, '#581c87');
  } else if (preset.sceneType === 'drone') {
    grad.addColorStop(0, '#0c4a6e');
    grad.addColorStop(1, '#78350f');
  } else if (preset.sceneType === 'robot') {
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#0e7490');
  } else if (preset.sceneType === 'acoustic') {
    grad.addColorStop(0, '#064e3b');
    grad.addColorStop(1, '#047857');
  } else {
    grad.addColorStop(0, '#4c1d95');
    grad.addColorStop(1, '#9d174d');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Animated or thematic visual elements
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.5, w * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Draw scene iconography
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 36px sans-serif';
  const icons = {
    skate: '🛹',
    dance: '💃',
    drone: '🚁',
    robot: '🤖',
    acoustic: '🎸',
    graduation: '🎓'
  };
  ctx.fillText(icons[preset.sceneType] || '🎬', w * 0.5, h * 0.45);

  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(preset.title, w * 0.5, h * 0.78);
  ctx.restore();
}

/**
 * Handle real device media upload (Images or Videos)
 * @param {File} file
 * @returns {Promise<Object>} Formatted media object ready for editor
 */
export function processUserUploadedFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file provided'));

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      return reject(new Error('Please upload a valid image or video file'));
    }

    const objectUrl = URL.createObjectURL(file);
    const mediaId = `user-${Date.now()}`;

    if (isImage) {
      const img = new Image();
      img.onload = () => {
        resolve({
          id: mediaId,
          title: file.name.replace(/\.[^/.]+$/, ''),
          album: 'recent',
          type: 'photo',
          aspect: `${img.width}:${img.height}`,
          description: `Custom image from device (${img.width}x${img.height})`,
          url: objectUrl,
          isUserUploaded: true,
          width: img.width,
          height: img.height
        });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = objectUrl;
    } else {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const durSec = Math.round(video.duration) || 10;
        const mins = Math.floor(durSec / 60);
        const secs = durSec % 60;
        const durText = `${mins}:${secs.toString().padStart(2, '0')}`;

        resolve({
          id: mediaId,
          title: file.name.replace(/\.[^/.]+$/, ''),
          album: 'recent',
          type: 'video',
          durationSec: durSec,
          durationText: durText,
          description: `Custom video from device (${durText})`,
          url: objectUrl,
          isUserUploaded: true,
          videoElement: video,
          sceneType: 'custom'
        });
      };
      video.onerror = () => reject(new Error('Failed to parse video metadata'));
      video.src = objectUrl;
    }
  });
}
