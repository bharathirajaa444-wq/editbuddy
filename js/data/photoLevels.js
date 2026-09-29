/**
 * EditBuddy - Photo Editing Learning Path (8 Levels)
 * Beginner-friendly curriculums with plain explanations, practical 'when & why',
 * visual tutorial scripts, guided tasks, hints, and transparent scoring rubrics.
 */

export const PHOTO_LEVELS = [
  {
    id: 1,
    title: 'Open a Photo & Meet the Editor',
    shortTitle: 'Meet the Editor',
    tagline: 'Get familiar with your new editing playground!',
    difficulty: 'Absolute Beginner',
    xpReward: 50,
    badgeAwarded: 'Editor Explorer 🧭',
    recommendedMediaId: 'p-sunset-dim',
    unlockedTools: ['view', 'compare', 'reset'],
    explanation: {
      what: 'The editor is your creative studio. It has three main areas: the Canvas in the center (where your photo lives), the Tool Sidebar on the right (where all adjustments happen), and the Compare button on top.',
      why: 'Before changing anything, an editor always examines their canvas. Knowing how to zoom, inspect, and peek at the original photo ensures you never lose control of your edits.',
      tutorialSteps: [
        'Notice your selected photo resting comfortably in the center canvas.',
        'Look at the top right: that shiny "Hold to View Original" button lets you compare changes anytime.',
        'At the bottom right, you can always hit "Reset" if you ever want to start over safely.'
      ]
    },
    task: {
      instruction: 'Welcome to EditBuddy! Inspect your photo on the canvas, try pressing and holding "Hold to Compare", and switch between Fit & 100% zoom views.',
      requirementsText: 'Toggle the Compare button at least once and inspect your photo.',
      criteria: {
        requireCompareToggle: true
      }
    },
    hints: [
      { step: 1, text: 'Look at the top-right corner of the canvas area for the button labeled "Hold to View Original".' },
      { step: 2, text: 'Click and hold that button for a moment, then release it to see the live comparison in action.' },
      { step: 3, text: 'You can also test the Reset button at the top right to get comfortable with experimenting safely!' }
    ],
    scoringRubric: {
      passThreshold: 90,
      tipsOnFail: 'Make sure you press the "Hold to Compare" button at least once to inspect your canvas.',
      proTip: 'Professional editors check their original photo every few minutes to make sure they haven’t over-edited!'
    }
  },
  {
    id: 2,
    title: 'Crop & Straighten Horizons',
    shortTitle: 'Crop & Straighten',
    tagline: 'Remove distractions and fix crooked horizons with ease.',
    difficulty: 'Beginner',
    xpReward: 75,
    badgeAwarded: 'Horizon Master 📐',
    recommendedMediaId: 'p-crooked-beach',
    unlockedTools: ['crop', 'straighten', 'compare', 'reset'],
    explanation: {
      what: 'Cropping trims away unwanted clutter around the edges of a picture. Straightening gently tilts the photo so natural lines (like the sea horizon or buildings) look perfectly level.',
      why: 'When people look at a photo, a crooked ocean horizon makes them feel slightly tilted! Cropping helps focus attention directly on your main subject and fits Instagram (1:1 square or 4:5 portrait).',
      tutorialSteps: [
        'Select the Crop tab on the right sidebar.',
        'Drag the angle slider to straighten the tilted horizon so it stays flat and level.',
        'Choose a clean aspect ratio like 1:1 Square or 4:5 Portrait to frame your subject.'
      ]
    },
    task: {
      instruction: 'Straighten the tilted horizon (tilt between +4° and +10° or -4° and -10° to level it) and adjust the crop frame to focus on the scene.',
      requirementsText: 'Adjust straightening angle by at least ±4° and set a crop ratio.',
      criteria: {
        minStraightenAbs: 4,
        appliedCrop: true
      }
    },
    hints: [
      { step: 1, text: 'Click on the "Crop & Rotate" tab in the right sidebar.' },
      { step: 2, text: 'Drag the "Straighten Angle" slider until the horizon line aligns with the grid guides.' },
      { step: 3, text: 'Click the "1:1 Square" button to apply a balanced frame for social media.' }
    ],
    scoringRubric: {
      passThreshold: 90,
      tipsOnFail: 'Try dragging the Straighten slider at least 4 degrees in either direction to level the horizon line.',
      proTip: 'Use the Rule of Thirds grid lines inside the crop box to place points of interest along the line intersections!'
    }
  },
  {
    id: 3,
    title: 'Adjust Brightness & Exposure',
    shortTitle: 'Adjust Brightness',
    tagline: 'Bring shadowed photos back to vibrant life.',
    difficulty: 'Beginner',
    xpReward: 80,
    badgeAwarded: 'Light Bringer ☀️',
    recommendedMediaId: 'p-sunset-dim',
    unlockedTools: ['light', 'crop', 'compare', 'reset'],
    explanation: {
      what: 'Brightness controls the overall amount of light in the entire photo. Moving the slider right reveals details hidden in dark shadows, while moving left calms down glaring light.',
      why: 'Phone cameras often make evening or indoor photos look darker than what your eyes saw in real life. A gentle boost of brightness restores the true feeling of the moment.',
      tutorialSteps: [
        'Open the Light tab in your tools panel.',
        'Locate the "Brightness" slider (starts at 0%).',
        'Slide it gently to the right until hidden trees and ground details become clearly visible (aim for +20% to +45%).',
        'Be careful not to push it to +100%, or the sky will turn into a blown-out white glare!'
      ]
    },
    task: {
      instruction: 'The Campus Sunset photo is too dim to see the ground details. Increase Brightness between +20% and +50% so the foreground is clearly illuminated without blowing out the sky.',
      requirementsText: 'Set Brightness between +20% and +50%.',
      criteria: {
        minBrightness: 20,
        maxBrightness: 50
      }
    },
    hints: [
      { step: 1, text: 'Switch to the "Light" tab in the right-hand panel.' },
      { step: 2, text: 'Find the Brightness slider and drag it to the right.' },
      { step: 3, text: 'Watch the numeric pill: stop when it reads between +25% and +40% for the sweetest natural lighting!' }
    ],
    scoringRubric: {
      passThreshold: 90,
      tipsOnFail: 'Aim for a Brightness boost between +20% and +50%. Avoid extremes so highlights do not wash out.',
      proTip: 'Always check if you can still see soft gradients in the sky. If the sky becomes pure white, pull the slider back a touch.'
    }
  },
  {
    id: 4,
    title: 'Contrast & Colour Vibrance',
    shortTitle: 'Contrast & Colour',
    tagline: 'Make flat, washed-out photos look rich, punchy, and lively.',
    difficulty: 'Beginner to Intermediate',
    xpReward: 90,
    badgeAwarded: 'Color Wizard 🎨',
    recommendedMediaId: 'p-sunset-dim',
    unlockedTools: ['light', 'color', 'crop', 'compare', 'reset'],
    explanation: {
      what: 'Contrast increases the difference between dark and light areas, making shapes pop. Saturation (Colour Vibrance) intensifies colors—making warm sunset oranges glow and green grass flourish.',
      why: 'Without contrast, photos look like they have a milky gray fog over them. Adjusting contrast and warmth makes your photo feel energetic, alive, and ready to share.',
      tutorialSteps: [
        'Go to the Light tab and set Contrast to +20% to give the photo deep, punchy definition.',
        'Switch to the Color tab and set Saturation to +25% so the sunset hues radiate warmth.',
        'Use "Hold to View Original" to see the dramatic difference from the foggy original!'
      ]
    },
    task: {
      instruction: 'Give your photo rich depth! Increase Contrast to between +15% and +40%, and boost Saturation to between +15% and +45%.',
      requirementsText: 'Contrast +15% to +40% AND Saturation +15% to +45%.',
      criteria: {
        minContrast: 15,
        maxContrast: 40,
        minSaturation: 15,
        maxSaturation: 45
      }
    },
    hints: [
      { step: 1, text: 'Under the "Light" tab, move the Contrast slider up to around +25%.' },
      { step: 2, text: 'Under the "Color" tab, move the Saturation slider up to around +30%.' },
      { step: 3, text: 'Notice how the colors immediately stop looking washed out and start singing!' }
    ],
    scoringRubric: {
      passThreshold: 90,
      tipsOnFail: 'Make sure both Contrast (at least +15%) and Saturation (at least +15%) are gently elevated together.',
      proTip: 'Contrast and Saturation work as best friends. Contrast gives the structure, Saturation adds the soul!'
    }
  },
  {
    id: 5,
    title: 'Add Text & Headlines',
    shortTitle: 'Add Text',
    tagline: 'Speak through your photos with clear, stylish typography.',
    difficulty: 'Intermediate',
    xpReward: 100,
    badgeAwarded: 'Typography Pro ✍️',
    recommendedMediaId: 'p-coffee-flatlay',
    unlockedTools: ['text', 'light', 'color', 'compare', 'reset'],
    explanation: {
      what: 'The Text tool allows you to overlay words, event dates, titles, or quotes directly onto your images, choosing fonts, sizes, and colors.',
      why: 'Whether you are making a study note, an announcement, or an Instagram story, readable text turns a regular picture into a message people remember.',
      tutorialSteps: [
        'Click on the Text tab.',
        'Type your message (e.g. "Focus Time ✨" or "Campus Life").',
        'Choose a bold, readable font and a color that contrasts well against the background so it is effortless to read.'
      ]
    },
    task: {
      instruction: 'Add a clean headline overlay to your photo. Type at least 4 characters, choose a font, and pick a high-contrast color.',
      requirementsText: 'Add text overlay with at least 4 characters and customize color/font.',
      criteria: {
        hasText: true,
        minTextLength: 4
      }
    },
    hints: [
      { step: 1, text: 'Open the "Text" tab in the right sidebar.' },
      { step: 2, text: 'Type a catchy title like "Study Hour", "Campus Vibes", or "Coffee Break" into the text box.' },
      { step: 3, text: 'Pick a high-contrast color (white or amber) so your text stands out clearly against the desk.' }
    ],
    scoringRubric: {
      passThreshold: 90,
      tipsOnFail: 'Type at least 4 characters into the text overlay box and confirm it is visible on the canvas.',
      proTip: 'Never place dark text over dark photo areas or light text over light areas. Contrast is king for readability!'
    }
  },
  {
    id: 6,
    title: 'Use Filters Carefully',
    shortTitle: 'Filter Styling',
    tagline: 'Create aesthetic moods without over-processing.',
    difficulty: 'Intermediate',
    xpReward: 110,
    badgeAwarded: 'Aesthetic Artisan 🪄',
    recommendedMediaId: 'p-festival-lights',
    unlockedTools: ['filter', 'light', 'color', 'text', 'compare', 'reset'],
    explanation: {
      what: 'Filters are pre-packaged color gradings that instantly evoke a specific atmosphere: Golden Hour gives warm sunset nostalgia, Chill Breeze cools things down, and Monochrome adds timeless drama.',
      why: 'Beginners often apply the strongest filter at 100% and ruin skin tones and textures. Learning how to pick the right filter gives your feed a unified aesthetic.',
      tutorialSteps: [
        'Open the Filters tab.',
        'Explore the presets: Golden Hour, Vintage Warm, Chill Cool, Dramatic B&W, and Vivid Pop.',
        'Select a filter that complements your photo’s mood.',
        'Adjust the filter intensity so the original photo’s natural beauty still shines through.'
      ]
    },
    task: {
      instruction: 'Apply one of the artistic filter presets (such as "Golden Hour", "Dramatic B&W", or "Vivid Pop") and compare it with the original using the Compare button.',
      requirementsText: 'Apply any creative filter preset and hold Compare.',
      criteria: {
        filterSelected: true,
        notOriginalFilter: true,
        requireCompareToggle: true
      }
    },
    hints: [
      { step: 1, text: 'Click on the "Filters" tab on the right sidebar.' },
      { step: 2, text: 'Click on "Golden Hour", "Vivid Pop", or "Dramatic B&W" to apply the filter style.' },
      { step: 3, text: 'Tap "Hold to View Original" to see how the filter transforms the atmosphere!' }
    ],
    scoringRubric: {
      passThreshold: 90,
      tipsOnFail: 'Pick a filter other than "Original" and test the "Hold to Compare" button to see the change.',
      proTip: 'A great filter should feel like a mood, not a disguise. If people notice the filter before the photo, dial it down!'
    }
  },
  {
    id: 7,
    title: 'Make a Simple Poster or Social Post',
    shortTitle: 'Poster & Social Post',
    tagline: 'Combine framing, stickers, and layout for social media.',
    difficulty: 'Intermediate to Advanced',
    xpReward: 130,
    badgeAwarded: 'Poster Creator 📢',
    recommendedMediaId: 'p-festival-lights',
    unlockedTools: ['stickers', 'text', 'crop', 'filter', 'light', 'color', 'compare', 'reset'],
    explanation: {
      what: 'A poster unites visual storytelling: a cropped composition, calibrated lighting, an engaging title, and graphic stickers/badges to highlight key information.',
      why: 'From college fest announcements to club recruitments and Instagram flyers, combining these elements creates professional, eye-catching graphics effortlessly.',
      tutorialSteps: [
        'Open the Stickers tab and add an event badge or star sticker.',
        'Use the Text tab to add an event headline (e.g. "ANNUAL FEST 2026").',
        'Crop to a balanced 4:5 or 1:1 format ready for social posting.'
      ]
    },
    task: {
      instruction: 'Design a social flyer or poster! Add at least one sticker badge and include a clear headline text overlay.',
      requirementsText: 'Add at least 1 sticker badge and a text headline.',
      criteria: {
        hasSticker: true,
        hasText: true,
        minTextLength: 3
      }
    },
    hints: [
      { step: 1, text: 'Open the "Stickers" tab and click any badge (like the Fest Star or College Seal).' },
      { step: 2, text: 'Switch to the "Text" tab and write an event title like "MUSIC NIGHT" or "LIVE NOW".' },
      { step: 3, text: 'Adjust the text color and font to match your sticker theme!' }
    ],
    scoringRubric: {
      passThreshold: 90,
      tipsOnFail: 'Make sure you have both a decorative sticker badge and a text headline active on your poster.',
      proTip: 'Leave breathing room around the edges of your poster. Crowded posters feel stressful to read!'
    }
  },
  {
    id: 8,
    title: 'Capstone: Complete a Photo Project',
    shortTitle: 'Capstone Project',
    tagline: 'Put everything together: Crop, exposure, color grade, and typography.',
    difficulty: 'Advanced Mastery',
    xpReward: 200,
    badgeAwarded: 'Certified Photo Buddy 🏆',
    recommendedMediaId: 'p-sports-ground',
    unlockedTools: ['crop', 'light', 'color', 'filter', 'text', 'stickers', 'compare', 'reset'],
    explanation: {
      what: 'This is your graduation project for Photo Editing! You will execute a full four-stage editing workflow on your photo: crop alignment, exposure & contrast polish, color grading, and final text branding.',
      why: 'In the real world, professional photos are never just one slider tweak. They are the harmonious result of small, deliberate improvements stacked together.',
      tutorialSteps: [
        'Step 1: Frame the action with a deliberate crop.',
        'Step 2: Balance the lighting (Brightness + Contrast).',
        'Step 3: Grade the colors with a gentle filter or saturation boost.',
        'Step 4: Sign your creation with a tasteful text overlay.'
      ]
    },
    task: {
      instruction: 'Complete the complete photo editing workflow: Apply a crop, adjust Brightness or Contrast, apply a filter or color boost, and add your signature title text.',
      requirementsText: 'Crop + Light adjustment + Color/Filter + Title text.',
      criteria: {
        appliedCrop: true,
        adjustedLight: true,
        adjustedColorOrFilter: true,
        hasText: true
      }
    },
    hints: [
      { step: 1, text: 'First, crop the image to highlight the main subject.' },
      { step: 2, text: 'Second, boost Brightness (+15% or more) and Contrast in the Light tab.' },
      { step: 3, text: 'Third, apply a filter or boost saturation, then add your project title in the Text tab!' }
    ],
    scoringRubric: {
      passThreshold: 90,
      tipsOnFail: 'To pass your Capstone, ensure you have applied a crop, balanced the lighting, enhanced color/filter, and added title text.',
      proTip: 'Congratulations on mastering photo editing! You now possess all the core foundational skills used by digital content creators worldwide.'
    }
  }
];
