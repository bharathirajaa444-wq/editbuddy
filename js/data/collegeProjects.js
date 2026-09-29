/**
 * EditBuddy - College Edits Projects (3 Hands-On Real-World Projects)
 * Specially designed beginner projects:
 * 1. College Fest Event Poster
 * 2. Club Announcement Reel / Short Video
 * 3. College Memories Montage
 */

export const COLLEGE_PROJECTS = [
  {
    id: 'col-1',
    mode: 'photo',
    title: 'College Fest Event Poster',
    tagline: 'Design an eye-catching announcement for the annual cultural extravaganza.',
    icon: '🎪',
    difficulty: 'All Levels Project',
    xpReward: 150,
    badgeAwarded: 'Campus Fest Designer 🎨',
    recommendedMediaId: 'p-festival-lights',
    brief: 'The student council needs an energetic social poster for "IGNITE 2026", the annual campus cultural night! Use stage lighting photos, add a high-contrast title, event badge, and warm stage filter.',
    unlockedTools: ['crop', 'light', 'filter', 'text', 'stickers', 'compare', 'reset'],
    tasks: [
      'Crop image to 1:1 or 4:5 for Instagram flyers',
      'Boost contrast or brightness to make stage lights pop',
      'Add event title text (e.g. "IGNITE 2026")',
      'Add a festive star or campus badge sticker'
    ],
    criteria: {
      appliedCrop: true,
      hasText: true,
      minTextLength: 4,
      hasSticker: true
    },
    scoringRubric: {
      passThreshold: 90,
      tipsOnFail: 'Make sure your poster includes a clear event title, at least one sticker badge, and a focused crop.',
      proTip: 'Event posters succeed when the date and title can be read in under 2 seconds while scrolling fast!'
    }
  },
  {
    id: 'col-2',
    mode: 'video',
    title: 'Club Announcement Reel',
    tagline: 'Create a hype 10-second recruitment reel for your campus club.',
    icon: '🚀',
    difficulty: 'All Levels Project',
    xpReward: 160,
    badgeAwarded: 'Hype Reel Director 🎥',
    recommendedMediaId: 'v-dance-crew',
    brief: 'Recruitment week is here! Transform raw club showcase footage into a punchy 8-10 second social reel with trimmed pacing, upbeat music, a bold caption, and snappy transitions.',
    unlockedTools: ['trim', 'split', 'audio', 'text', 'transitions', 'speed', 'playback'],
    tasks: [
      'Trim the clip down to its punchiest 6 to 10 seconds',
      'Add an energetic background music soundtrack',
      'Add a club recruitment caption (e.g. "Join The Crew ✨")',
      'Apply a quick dynamic transition effect'
    ],
    criteria: {
      appliedTrim: true,
      hasAudioTrack: true,
      hasCaptionText: true,
      minTextLength: 4,
      hasTransition: true
    },
    scoringRubric: {
      passThreshold: 90,
      tipsOnFail: 'Tighten the video trim, add a soundtrack, include your club caption, and apply a transition.',
      proTip: 'Sync your cuts with the music beat drop to make your reel feel twice as energetic!'
    }
  },
  {
    id: 'col-3',
    mode: 'photo',
    title: 'College Memories Montage',
    tagline: 'Craft a sentimental polaroid-style memory of your campus years.',
    icon: '📸',
    difficulty: 'All Levels Project',
    xpReward: 150,
    badgeAwarded: 'Memory Keeper 💖',
    recommendedMediaId: 'p-polaroid-friends',
    brief: 'Graduation is around the corner. Turn casual campus memories with friends into a timeless polaroid keepsake with nostalgic warm grading, sweet captions, and stickers.',
    unlockedTools: ['light', 'color', 'filter', 'text', 'stickers', 'compare', 'reset'],
    tasks: [
      'Apply a warm nostalgia filter or gentle warmth boost',
      'Add a sentimental memory caption (e.g. "Forever Grateful 🎓")',
      'Add a polaroid border or heart/star sticker'
    ],
    criteria: {
      adjustedColorOrFilter: true,
      hasText: true,
      minTextLength: 4,
      hasSticker: true
    },
    scoringRubric: {
      passThreshold: 90,
      tipsOnFail: 'Apply a warm filter or color grading, add your memory quote, and add a decorative sticker.',
      proTip: 'Warm tones evoke comfort and nostalgia. Golden hour filters are the secret to timeless memory keepsakes.'
    }
  }
];
