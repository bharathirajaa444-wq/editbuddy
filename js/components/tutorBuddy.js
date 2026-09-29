/**
 * EditBuddy - Tutor Mascot ("Buddy")
 * Friendly, cheerful personal tutor that provides speech bubbles,
 * contextual guidance, expressions, and tips throughout the app.
 */

export class TutorBuddy {
  constructor() {
    this.name = 'Buddy';
    this.expressions = {
      happy: '😊',
      excited: '🤩',
      thinking: '🧐',
      encouraging: '💪',
      celebrating: '🎉',
      waving: '👋',
      teaching: '🧑‍🏫',
      camera: '📸',
      video: '🎬'
    };
  }

  getGreeting(progress) {
    if (progress.completedCount === 0) {
      return {
        mood: 'waving',
        emoji: '👋',
        text: 'Hi there! I’m Buddy, your friendly editing tutor. Let’s create something awesome today!'
      };
    }
    if (progress.completedCount >= 10) {
      return {
        mood: 'excited',
        emoji: '🌟',
        text: `Look at you go! ${progress.completedCount} lessons mastered. You’re becoming a real creator!`
      };
    }
    return {
      mood: 'happy',
      emoji: '✨',
      text: `Welcome back! You’re on Level ${progress.currentPhotoLevel}. Ready for another quick win?`
    };
  }

  getMediaPickerTip(mode) {
    if (mode === 'photo') {
      return 'Pick any photo that catches your eye, or tap "Upload from Device" to use your own!';
    }
    if (mode === 'video') {
      return 'Select a video clip with some action, or upload your own favorite video from your phone!';
    }
    return 'Choose a base template to craft your college poster, reel, or memory montage!';
  }

  getLiveEditorGuidance(lesson, editState) {
    const cid = lesson.id;
    const isPhoto = !lesson.mode || lesson.mode === 'photo';

    if (isPhoto) {
      if (cid === 1) {
        if (editState.compareCount > 0) {
          return { done: true, text: 'Awesome! You mastered the Compare button! Ready to submit.' };
        }
        return { done: false, text: 'Try tapping and holding "Hold to Compare" to see the original!' };
      }
      if (cid === 2) {
        const abs = Math.abs(editState.straightenAngle || 0);
        if (abs >= 4) {
          return { done: true, text: `Horizon straightened by ${editState.straightenAngle}°! Looking level!` };
        }
        return { done: false, text: 'Drag the Straighten slider at least ±4° to fix the tilted horizon.' };
      }
      if (cid === 3) {
        const b = editState.brightness || 0;
        if (b >= 20 && b <= 50) {
          return { done: true, text: `Brightness is +${b}%! Perfect balanced exposure!` };
        }
        if (b > 50) {
          return { done: false, text: `Whoa, +${b}% is slightly too bright! Pull it back to between +20% and +50%.` };
        }
        return { done: false, text: `Current brightness: +${b}%. Slide right to reach +20% or more.` };
      }
      if (cid === 4) {
        const c = editState.contrast || 0;
        const s = editState.saturation || 0;
        if (c >= 15 && s >= 15) {
          return { done: true, text: `Contrast (+${c}%) & Saturation (+${s}%) are looking punchy and rich!` };
        }
        return { done: false, text: `Contrast is +${c}% (target +15%), Saturation is +${s}% (target +15%). Keep going!` };
      }
      if (cid === 5) {
        const len = (editState.textOverlay?.text || '').trim().length;
        if (len >= 4) {
          return { done: true, text: `Great headline! "${editState.textOverlay.text}" looks sharp and clear!` };
        }
        return { done: false, text: 'Type a headline with at least 4 letters in the Text tab.' };
      }
      if (cid === 6) {
        if (editState.activeFilter && editState.activeFilter !== 'original') {
          return { done: true, text: `Filter "${editState.activeFilter}" applied! Tap Compare to view the change.` };
        }
        return { done: false, text: 'Click any filter preset like "Golden Hour" or "Vivid Pop"!' };
      }
      if (cid === 7) {
        const hasBadge = !!editState.sticker;
        const hasHeadline = (editState.textOverlay?.text || '').trim().length >= 3;
        if (hasBadge && hasHeadline) {
          return { done: true, text: 'Your poster has a sticker badge and headline! Looks ready for print!' };
        }
        return { done: false, text: 'Add both a sticker badge and headline text to complete your poster.' };
      }
      if (cid === 8) {
        return { done: true, text: 'Apply crop, lighting, color, and title to finish your grand Capstone!' };
      }
    } else {
      // Video
      if (cid === 1) {
        if (editState.hasPlayed && editState.hasScrubbed) {
          return { done: true, text: 'Great! You played the clip and scrubbed the timeline playhead!' };
        }
        return { done: false, text: 'Hit Play to watch, then drag the playhead across the timeline!' };
      }
      if (cid === 2) {
        const tStart = editState.trimStart || 0;
        if (tStart >= 1.5) {
          return { done: true, text: `Trimmed ${tStart.toFixed(1)}s from start! Crisp opening achieved!` };
        }
        return { done: false, text: `Start trimmed: ${tStart.toFixed(1)}s. Drag the left handle to at least 1.5s!` };
      }
      if (cid === 3) {
        if (editState.splitCount >= 1) {
          return { done: true, text: `Cut applied! You made ${editState.splitCount} clean split(s)!` };
        }
        return { done: false, text: 'Scrub to the middle of the clip and click "Split at Playhead"!' };
      }
      if (cid === 4) {
        if (editState.audioTrack && editState.audioVolume >= 40 && editState.audioVolume <= 80) {
          return { done: true, text: `Soundtrack "${editState.audioTrack.name}" set at ${editState.audioVolume}% volume!` };
        }
        return { done: false, text: 'Pick a soundtrack in the Audio tab and set volume between 40% and 80%!' };
      }
      if (cid === 5) {
        const len = (editState.captionText || '').trim().length;
        if (len >= 4) {
          return { done: true, text: `Caption "${editState.captionText}" looks great on screen!` };
        }
        return { done: false, text: 'Type an on-screen caption of at least 4 letters in the Text tab!' };
      }
      if (cid === 6) {
        if (editState.transition && editState.transition !== 'none') {
          return { done: true, text: `Transition "${editState.transition}" applied! Preview from the start!` };
        }
        return { done: false, text: 'Choose a transition like Cross Dissolve or Fade in the Transitions tab!' };
      }
      if (cid === 7) {
        if (editState.playbackSpeed && editState.playbackSpeed !== 1.0) {
          return { done: true, text: `Playback speed set to ${editState.playbackSpeed}x! Watch the new rhythm!` };
        }
        return { done: false, text: 'Choose 0.5x (Slow-Mo) or 1.5x/2.0x in the Speed tab!' };
      }
      if (cid === 8) {
        return { done: true, text: 'Trim, add music, add captions, and choose a transition for your Capstone!' };
      }
    }

    return { done: false, text: 'Take your time experimenting! Buddy is here to help.' };
  }
}

export const tutorBuddy = new TutorBuddy();
