/**
 * EditBuddy - Video Editing Learning Path (8 Levels)
 * Beginner-friendly curriculums with plain explanations, practical 'when & why',
 * visual tutorial scripts, guided tasks, hints, and transparent scoring rubrics.
 */

export const VIDEO_LEVELS = [
  {
    id: 1,
    title: 'Open a Video & Understand the Timeline',
    shortTitle: 'Meet the Timeline',
    tagline: 'Learn how video editors see time and motion.',
    difficulty: 'Absolute Beginner',
    xpReward: 50,
    badgeAwarded: 'Timeline Scout ⏱️',
    recommendedMediaId: 'v-skate-jump',
    unlockedTools: ['playback', 'scrubber', 'compare'],
    explanation: {
      what: 'A video is a sequence of still photos playing quickly in front of your eyes (like a flipbook). The Timeline below shows time moving from left (the beginning) to right (the end). The blue vertical line is the Playhead, showing the exact frame on screen.',
      why: 'Before cutting or adding music, you need to comfortably scrub through time to find the exact moment an action starts or finishes.',
      tutorialSteps: [
        'Press the big Play button in the bottom bar to watch the footage roll.',
        'Drag the blue Playhead back and forth across the timeline to scrub quickly to any second.',
        'Notice the time readout: mm:ss.ms showing your current frame.'
      ]
    },
    task: {
      instruction: 'Welcome to the Video Studio! Press Play to watch the clip, and drag the timeline playhead to find the peak action moment.',
      requirementsText: 'Play the video and scrub the timeline playhead.',
      criteria: {
        playedVideo: true,
        scrubbedTimeline: true
      }
    },
    hints: [
      { step: 1, text: 'Click the pink Play button at the bottom center to start video playback.' },
      { step: 2, text: 'Click anywhere on the gray timeline strip or drag the blue playhead handle.' },
      { step: 3, text: 'Watch the timer numbers update as you jump through different moments!' }
    ],
    scoringRubric: {
      passThreshold: 90,
      tipsOnFail: 'Make sure to hit Play and click along the timeline strip to scrub through the video.',
      proTip: 'Scrubbing is the fastest way video editors find the good parts among hours of raw footage!'
    }
  },
  {
    id: 2,
    title: 'Trim the Start & End (Top and Tail)',
    shortTitle: 'Trim Start & End',
    tagline: 'Cut out awkward opening pauses and shaky camera endings.',
    difficulty: 'Beginner',
    xpReward: 75,
    badgeAwarded: 'Clean Cutter ✂️',
    recommendedMediaId: 'v-skate-jump',
    unlockedTools: ['trim', 'playback', 'scrubber'],
    explanation: {
      what: 'Trimming shortens a video clip without splitting it. You grab the start handle (In Point) and pull it forward, or grab the end handle (Out Point) and pull it backward.',
      why: 'Whenever someone starts recording a phone video, there is almost always 1 to 2 seconds of awkward hesitation before the action starts, and shaky fumbling when reaching for the stop button. Trimming cleans that up instantly.',
      tutorialSteps: [
        'Notice the pink Trim Region box on the timeline with handles on the left and right.',
        'Drag the Left Trim Handle to skip the awkward opening delay (trim at least 1.5 seconds from start).',
        'Drag the Right Trim Handle inward to trim off the ending camera shake.',
        'Press Play to watch your sleek, punchy trimmed clip!'
      ]
    },
    task: {
      instruction: 'Trim the fat! Drag the left handle inward by at least 1.5s to cut the delayed start, and pull the right handle inward to trim the end shake.',
      requirementsText: 'Trim at least 1.5s from start AND trim the end handle.',
      criteria: {
        minStartTrimSec: 1.5,
        adjustedEndTrim: true
      }
    },
    hints: [
      { step: 1, text: 'Hover over the left edge of the pink timeline highlight until your cursor changes to an arrow.' },
      { step: 2, text: 'Drag the left handle to the right until the start time reads 00:02 or higher.' },
      { step: 3, text: 'Drag the right handle slightly to the left, then hit Play to check your clean edit!' }
    ],
    scoringRubric: {
      passThreshold: 90,
      tipsOnFail: 'Make sure you drag the start trim handle inward by at least 1.5 seconds and tighten the end handle.',
      proTip: 'In social reels, the first 2 seconds decide if people keep watching. Start right as the action happens!'
    }
  },
  {
    id: 3,
    title: 'Split & Arrange Clips',
    shortTitle: 'Split Clips',
    tagline: 'Slice long takes and cut out boring middle sections.',
    difficulty: 'Beginner to Intermediate',
    xpReward: 85,
    badgeAwarded: 'Razor Master 🔪',
    recommendedMediaId: 'v-dance-crew',
    unlockedTools: ['split', 'trim', 'playback', 'scrubber'],
    explanation: {
      what: 'The Split tool (often called the Razor or Blade) cuts one single video clip into two separate segments at the exact position of your playhead.',
      why: 'What if an embarrassing mistake happened right in the middle of a 20-second video? Splitting lets you cut out the boring or ruined middle part while keeping the great start and finish!',
      tutorialSteps: [
        'Move the Playhead to the exact moment you want to make a cut.',
        'Click the "Split at Playhead" button (or press S).',
        'You now have two independent clip blocks that you can trim or reorder!'
      ]
    },
    task: {
      instruction: 'Move the playhead to the middle of the dance routine and perform a Split to divide the take into two clips.',
      requirementsText: 'Perform at least 1 Split cut along the timeline.',
      criteria: {
        splitCount: 1
      }
    },
    hints: [
      { step: 1, text: 'Drag the playhead to roughly the middle of the timeline (around 5s to 8s).' },
      { step: 2, text: 'Click the "✂️ Split at Playhead" button located above the timeline track.' },
      { step: 3, text: 'You will see the clip split into Clip 1 and Clip 2!' }
    ],
    scoringRubric: {
      passThreshold: 90,
      tipsOnFail: 'Move the playhead to any middle point and click the "Split at Playhead" button.',
      proTip: 'Always split right on the beat of movement or a breath so the transition looks completely natural.'
    }
  },
  {
    id: 4,
    title: 'Add Background Music & Sound',
    shortTitle: 'Add Music',
    tagline: 'Give your video emotion and rhythm with soundtracks.',
    difficulty: 'Intermediate',
    xpReward: 95,
    badgeAwarded: 'Beat Conductor 🎵',
    recommendedMediaId: 'v-dance-crew',
    unlockedTools: ['audio', 'trim', 'split', 'playback'],
    explanation: {
      what: 'Background music sets the emotional tone of a video. You can select curated royalty-free tracks, preview their vibe, and adjust the audio volume level.',
      why: 'Silent videos feel lifeless. Upbeat tracks add energy to dance or sports reels, while gentle acoustic tracks make travel and campus memories heartfelt.',
      tutorialSteps: [
        'Open the Audio tab on the right sidebar.',
        'Choose a music track (Lo-Fi Campus Chill, Energetic Beat, Sunny Acoustic).',
        'Use the Volume slider to balance the music so it supports the video without overwhelming it.'
      ]
    },
    task: {
      instruction: 'Add a background soundtrack to your video! Select any music track from the Audio panel and adjust the soundtrack volume to between 40% and 80%.',
      requirementsText: 'Select an audio track and set volume between 40% and 80%.',
      criteria: {
        hasAudioTrack: true,
        minVolume: 40,
        maxVolume: 80
      }
    },
    hints: [
      { step: 1, text: 'Click on the "Audio" tab in the right sidebar.' },
      { step: 2, text: 'Click on any track like "Energetic Beat" or "Lo-Fi Campus Chill" to assign it.' },
      { step: 3, text: 'Adjust the Music Volume slider to roughly 60%.' }
    ],
    scoringRubric: {
      passThreshold: 90,
      tipsOnFail: 'Select an audio track from the list and set the volume slider between 40% and 80%.',
      proTip: 'If your video has people speaking, keep background music under 30% volume so voices remain crystal clear!'
    }
  },
  {
    id: 5,
    title: 'Add Text & Lower-Third Captions',
    shortTitle: 'Text & Captions',
    tagline: 'Keep viewers hooked even with sound turned off.',
    difficulty: 'Intermediate',
    xpReward: 105,
    badgeAwarded: 'Caption King 💬',
    recommendedMediaId: 'v-robotics-demo',
    unlockedTools: ['text', 'audio', 'trim', 'split', 'playback'],
    explanation: {
      what: 'Text overlays in video place titles, speaker names (lower-thirds), or subtitles directly over the moving footage with readable background pills.',
      why: 'Over 70% of people watch social media videos on mobile with sound muted! Adding clear captions ensures your message connects even in silence.',
      tutorialSteps: [
        'Open the Text tab.',
        'Enter caption text (e.g. "Tech Fest Final Round 🤖").',
        'Toggle high-contrast background pill or bold font style so it remains readable over moving backgrounds.'
      ]
    },
    task: {
      instruction: 'Add an on-screen caption title to your video clip. Type at least 4 characters and pick a caption position (Bottom or Center).',
      requirementsText: 'Add a video text caption with at least 4 characters.',
      criteria: {
        hasCaptionText: true,
        minTextLength: 4
      }
    },
    hints: [
      { step: 1, text: 'Click on the "Text & Captions" tab in the right-hand panel.' },
      { step: 2, text: 'Type a snappy title like "Robot Battle" or "Campus Finals" into the input box.' },
      { step: 3, text: 'Choose "Bottom Lower-Third" for standard caption positioning.' }
    ],
    scoringRubric: {
      passThreshold: 90,
      tipsOnFail: 'Add caption text with at least 4 characters in the Text tab and verify it overlays the video.',
      proTip: 'Keep video captions short and punchy. Aim for 3 to 6 words at a time so viewers can read them in a glance.'
    }
  },
  {
    id: 6,
    title: 'Add Simple Transitions',
    shortTitle: 'Transitions',
    tagline: 'Smoothly bridge cuts with cinematic dissolves and wipes.',
    difficulty: 'Intermediate',
    xpReward: 115,
    badgeAwarded: 'Transition Alchemist 🔄',
    recommendedMediaId: 'v-dance-crew',
    unlockedTools: ['transitions', 'split', 'trim', 'text', 'audio', 'playback'],
    explanation: {
      what: 'A transition is a visual effect placed between two clips or at the beginning/ending of a video. Common styles include Fade to Black, Cross Dissolve (smooth blend), and Zoom.',
      why: 'Hard cuts can sometimes feel abrupt or jarring. A gentle dissolve creates a smooth, professional passage of time or scene change.',
      tutorialSteps: [
        'Open the Transitions tab on the right sidebar.',
        'Choose a transition type like "Cross Dissolve" or "Zoom Blur".',
        'Play the video over the transition point to watch the smooth visual morphing!'
      ]
    },
    task: {
      instruction: 'Apply a transition effect (Cross Dissolve, Fade to Black, or Zoom Blur) to your video project.',
      requirementsText: 'Apply any transition style other than standard hard cut.',
      criteria: {
        hasTransition: true,
        notNoneTransition: true
      }
    },
    hints: [
      { step: 1, text: 'Click the "Transitions" tab on the right sidebar.' },
      { step: 2, text: 'Click on "Cross Dissolve" or "Fade to Black" to select it.' },
      { step: 3, text: 'Press Play from the start to preview how smoothly the scene flows!' }
    ],
    scoringRubric: {
      passThreshold: 90,
      tipsOnFail: 'Select a transition effect such as Cross Dissolve or Fade in the Transitions tab.',
      proTip: 'Less is more with transitions! When in doubt, a simple Cross Dissolve or clean hard cut always looks most professional.'
    }
  },
  {
    id: 7,
    title: 'Adjust Video Speed & Motion Pacing',
    shortTitle: 'Speed & Pacing',
    tagline: 'Create dramatic slow-motion and energetic timelapse montages.',
    difficulty: 'Intermediate to Advanced',
    xpReward: 125,
    badgeAwarded: 'Time Bender ⚡',
    recommendedMediaId: 'v-skate-jump',
    unlockedTools: ['speed', 'trim', 'audio', 'text', 'transitions', 'playback'],
    explanation: {
      what: 'Speed control alters playback rate. Slow Motion (0.5x) stretches time to emphasize athletic moves or emotional climaxes. Fast-Forward (1.5x or 2.0x) speeds up walking, setup, or routines.',
      why: 'Varying speed transforms ordinary footage into cinematic highlights. A skater landing a trick in 0.5x slow-mo lets viewers appreciate every nuance of balance and skill.',
      tutorialSteps: [
        'Open the Speed tab on the right sidebar.',
        'Select a speed preset: 0.5x (Dramatic Slow-Mo), 1.5x (Brisk Pacing), or 2.0x (Speedy Montage).',
        'Play the video to feel how the rhythm and dramatic weight immediately change!'
      ]
    },
    task: {
      instruction: 'Change the video speed multiplier to either 0.5x (Slow-Motion) or 1.5x/2.0x (Fast) and play through the clip.',
      requirementsText: 'Change speed multiplier from 1.0x to 0.5x, 1.5x, or 2.0x.',
      criteria: {
        changedSpeed: true,
        notDefaultSpeed: true
      }
    },
    hints: [
      { step: 1, text: 'Click on the "Speed" tab in the right sidebar.' },
      { step: 2, text: 'Click the "0.5x Slow-Mo" button to give the action cinematic drama.' },
      { step: 3, text: 'Press Play and watch how gracefully the movement unfolds!' }
    ],
    scoringRubric: {
      passThreshold: 90,
      tipsOnFail: 'Select a speed setting different from 1.0x (try 0.5x or 1.5x) and press Play.',
      proTip: 'Save slow motion for the climactic peak moment—never the whole video—so the payoff feels truly special!'
    }
  },
  {
    id: 8,
    title: 'Capstone: Complete a Short Video Project',
    shortTitle: 'Capstone Video',
    tagline: 'Assemble a complete polished 10-second social reel from start to finish.',
    difficulty: 'Advanced Mastery',
    xpReward: 200,
    badgeAwarded: 'Certified Video Buddy 🎬',
    recommendedMediaId: 'v-dance-crew',
    unlockedTools: ['trim', 'split', 'audio', 'text', 'transitions', 'speed', 'playback'],
    explanation: {
      what: 'This is your Video Capstone project! You will combine all the skills you have learned: trimming the head and tail, choosing a rhythm track, overlaying a title caption, and applying a smooth transition.',
      why: 'This full pipeline is identical to how content creators, social media managers, and filmmakers build viral short-form videos every single day.',
      tutorialSteps: [
        'Step 1: Trim the clip to its best 6 to 10 seconds of action.',
        'Step 2: Add background music that matches the energy.',
        'Step 3: Overlay an engaging title caption.',
        'Step 4: Add a sleek transition effect.'
      ]
    },
    task: {
      instruction: 'Build a complete short video project! Apply trim handles, add an audio track, include an on-screen caption, and apply a transition effect.',
      requirementsText: 'Trim applied + Audio track selected + Caption added + Transition applied.',
      criteria: {
        appliedTrim: true,
        hasAudioTrack: true,
        hasCaptionText: true,
        hasTransition: true
      }
    },
    hints: [
      { step: 1, text: 'Drag the left and right trim handles to tighten the clip duration.' },
      { step: 2, text: 'Choose an audio track under the Audio tab.' },
      { step: 3, text: 'Add a title under Text and select a transition under Transitions!' }
    ],
    scoringRubric: {
      passThreshold: 90,
      tipsOnFail: 'Ensure you have applied a trim, chosen an audio track, added caption text, and picked a transition style.',
      proTip: 'Congratulations on completing Video Editing! You have mastered the exact editing fundamentals used across modern cinema and short-form video creation.'
    }
  }
];
