/**
 * EditBuddy - Scoring & Evaluation Engine
 * An educational tutor evaluation prototype that inspects the learner's
 * current photo or video edits against the specific lesson's rubric.
 *
 * Requirements:
 * - Fair, encouraging, and beginner-friendly (does not penalize harmless creative exploration).
 * - Generates an objective score from 0% to 100%.
 * - Highlights 2-3 things the learner did well.
 * - Provides 1-2 constructive suggestions when improvement is needed.
 * - Score > 90% is strictly required to unlock the subsequent level!
 */

export class ScoringEngine {
  /**
   * Evaluate a photo editing task attempt
   * @param {Object} lesson Lesson definition with criteria & scoring rubric
   * @param {Object} editState Current state of photo editor adjustments
   * @returns {Object} Evaluation outcome
   */
  static evaluatePhotoTask(lesson, editState) {
    const { criteria, scoringRubric } = lesson;
    let score = 0;
    const strengths = [];
    const suggestions = [];

    // Base engagement score for opening and working in the editor
    score += 40;
    strengths.push('Great job diving into the workspace and interacting with the tools!');

    // 1. Level 1: Canvas Inspection & Compare
    if (criteria.requireCompareToggle) {
      if (editState.compareCount > 0) {
        score += 55;
        strengths.push('You actively used the "Hold to Compare" tool to inspect before/after differences.');
      } else {
        suggestions.push('Press and hold the "Hold to View Original" button at the top-right to inspect your canvas.');
      }
    }

    // 2. Level 2: Crop & Straighten
    if (criteria.minStraightenAbs !== undefined) {
      const absStraighten = Math.abs(editState.straightenAngle || 0);
      if (absStraighten >= criteria.minStraightenAbs) {
        score += 30;
        strengths.push(`Adjusted the straighten angle by ${editState.straightenAngle}° to align the horizon line.`);
      } else {
        suggestions.push(`Tilt the straighten slider by at least ±${criteria.minStraightenAbs}° to level the tilted horizon.`);
      }
    }

    if (criteria.appliedCrop) {
      if (editState.cropRatio && editState.cropRatio !== 'original') {
        score += 25;
        strengths.push(`Applied a clean ${editState.cropRatio.toUpperCase()} crop ratio to frame the subject.`);
      } else if (criteria.minStraightenAbs === undefined) {
        // If crop was explicitly required
        if (editState.cropApplied) {
          score += 25;
          strengths.push('Cropped the image to improve visual focus.');
        } else {
          suggestions.push('Choose a crop aspect ratio (like 1:1 Square or 4:5 Portrait) to frame your photo.');
        }
      }
    }

    // 3. Level 3: Brightness
    if (criteria.minBrightness !== undefined) {
      const b = editState.brightness || 0;
      if (b >= criteria.minBrightness && b <= criteria.maxBrightness) {
        score += 55;
        strengths.push(`Balanced Brightness beautifully at +${b}%, revealing shadow details without blowing out the sky.`);
      } else if (b > criteria.maxBrightness) {
        score += 20;
        strengths.push('You found the brightness slider and experimented with light.');
        suggestions.push(`Brightness is set to +${b}%, which washes out the sky. Lower it to between +20% and +50% for natural lighting.`);
      } else {
        score += Math.max(0, Math.round((b / criteria.minBrightness) * 30));
        suggestions.push(`Brightness is currently at +${b}%. Increase it to at least +${criteria.minBrightness}% so the foreground details become visible.`);
      }
    }

    // 4. Level 4: Contrast & Color
    if (criteria.minContrast !== undefined && criteria.minSaturation !== undefined) {
      const c = editState.contrast || 0;
      const s = editState.saturation || 0;

      if (c >= criteria.minContrast) {
        score += 28;
        strengths.push(`Gave the image depth with a punchy +${c}% Contrast boost.`);
      } else {
        suggestions.push(`Boost Contrast to at least +${criteria.minContrast}% to remove the flat milky look.`);
      }

      if (s >= criteria.minSaturation) {
        score += 28;
        strengths.push(`Vibrance is lively with +${s}% Saturation.`);
      } else {
        suggestions.push(`Boost Saturation to at least +${criteria.minSaturation}% to make the colors radiant.`);
      }
    }

    // 5. Level 5: Text Overlay
    if (criteria.hasText) {
      const textLen = (editState.textOverlay?.text || '').trim().length;
      if (textLen >= (criteria.minTextLength || 4)) {
        score += 55;
        strengths.push(`Added a clear headline "${editState.textOverlay.text}" with styled typography.`);
      } else {
        suggestions.push(`Type a headline with at least ${criteria.minTextLength || 4} characters in the Text tab.`);
      }
    }

    // 6. Level 6: Filters
    if (criteria.filterSelected && criteria.notOriginalFilter) {
      if (editState.activeFilter && editState.activeFilter !== 'original') {
        score += 35;
        strengths.push(`Applied the stylish "${editState.activeFilter}" filter preset.`);
      } else {
        suggestions.push('Pick an aesthetic filter preset other than "Original" to establish a mood.');
      }
    }

    // 7. Level 7: Poster & Stickers
    if (criteria.hasSticker) {
      if (editState.sticker) {
        score += 25;
        strengths.push(`Placed the "${editState.sticker}" badge sticker to highlight the event.`);
      } else {
        suggestions.push('Add a decorative sticker or badge from the Stickers tab.');
      }
    }

    // 8. Level 8 & Projects: Full Capstone
    if (criteria.adjustedLight) {
      if (Math.abs(editState.brightness || 0) > 10 || Math.abs(editState.contrast || 0) > 10) {
        score += 15;
        strengths.push('Fine-tuned lighting and exposure values.');
      } else {
        suggestions.push('Adjust either Brightness or Contrast by at least ±10% to calibrate exposure.');
      }
    }

    if (criteria.adjustedColorOrFilter) {
      if ((editState.activeFilter && editState.activeFilter !== 'original') || Math.abs(editState.saturation || 0) > 10) {
        score += 15;
        strengths.push('Applied cohesive color grading.');
      } else {
        suggestions.push('Select an aesthetic filter preset or enhance color saturation.');
      }
    }

    // Cap score at 100%
    score = Math.min(100, Math.max(0, score));

    // Generous fallback if learner accomplished all criteria
    if (suggestions.length === 0 && score < 95) {
      score = 96;
    }

    const isPassed = score > 90; // Strictly > 90% required

    return {
      score,
      isPassed,
      strengths,
      suggestions: suggestions.length > 0 ? suggestions : ['Your creative instincts look fantastic! Ready for the next challenge.'],
      proTip: scoringRubric.proTip || 'Consistent practice builds instinctual editing speed!'
    };
  }

  /**
   * Evaluate a video editing task attempt
   * @param {Object} lesson Lesson definition with criteria & scoring rubric
   * @param {Object} editState Current state of video editor adjustments
   * @returns {Object} Evaluation outcome
   */
  static evaluateVideoTask(lesson, editState) {
    const { criteria, scoringRubric } = lesson;
    let score = 0;
    const strengths = [];
    const suggestions = [];

    // Base score for workspace interaction
    score += 40;
    strengths.push('Nice work navigating the video timeline and player controls!');

    // 1. Level 1: Timeline Scrubber & Playback
    if (criteria.playedVideo && criteria.scrubbedTimeline) {
      if (editState.hasPlayed) {
        score += 30;
        strengths.push('Played through the footage to assess motion and timing.');
      } else {
        suggestions.push('Press the Play button to review the raw video playback.');
      }

      if (editState.hasScrubbed) {
        score += 26;
        strengths.push('Scrubbed the playhead across the timeline to inspect individual frames.');
      } else {
        suggestions.push('Click and drag across the timeline track to scrub the playhead.');
      }
    }

    // 2. Level 2: Trim Start & End
    if (criteria.minStartTrimSec !== undefined) {
      const startTrim = editState.trimStart || 0;
      if (startTrim >= criteria.minStartTrimSec) {
        score += 30;
        strengths.push(`Trimmed ${startTrim.toFixed(1)}s off the start to cut the delayed beginning.`);
      } else {
        suggestions.push(`Drag the left trim handle inward by at least ${criteria.minStartTrimSec} seconds.`);
      }
    }

    if (criteria.adjustedEndTrim) {
      if (editState.trimEnd && editState.trimEnd < (editState.totalDuration - 0.5)) {
        score += 26;
        strengths.push('Tightened the ending trim handle to remove trailing shake.');
      } else {
        suggestions.push('Drag the right trim handle inward slightly to cut the ending shake.');
      }
    }

    // 3. Level 3: Split Clips
    if (criteria.splitCount !== undefined) {
      if (editState.splitCount >= criteria.splitCount) {
        score += 55;
        strengths.push(`Successfully executed ${editState.splitCount} razor cut(s) at key moments.`);
      } else {
        suggestions.push('Position the playhead in the middle and click "Split at Playhead".');
      }
    }

    // 4. Level 4: Background Music
    if (criteria.hasAudioTrack) {
      if (editState.audioTrack) {
        score += 35;
        strengths.push(`Selected the "${editState.audioTrack.name}" soundtrack to establish musical rhythm.`);
      } else {
        suggestions.push('Select an audio track from the Audio panel.');
      }

      if (criteria.minVolume !== undefined) {
        const v = editState.audioVolume || 0;
        if (v >= criteria.minVolume && v <= criteria.maxVolume) {
          score += 22;
          strengths.push(`Audio volume balanced comfortably at ${v}%.`);
        } else {
          suggestions.push(`Set audio volume between ${criteria.minVolume}% and ${criteria.maxVolume}%.`);
        }
      }
    }

    // 5. Level 5: Text / Lower-Third Captions
    if (criteria.hasCaptionText) {
      const capLen = (editState.captionText || '').trim().length;
      if (capLen >= (criteria.minTextLength || 4)) {
        score += 55;
        strengths.push(`Overlayed on-screen caption "${editState.captionText}" for sound-off viewers.`);
      } else {
        suggestions.push(`Type an on-screen caption of at least ${criteria.minTextLength || 4} characters.`);
      }
    }

    // 6. Level 6: Transitions
    if (criteria.hasTransition && criteria.notNoneTransition) {
      if (editState.transition && editState.transition !== 'none') {
        score += 55;
        strengths.push(`Applied the smooth "${editState.transition}" visual transition.`);
      } else {
        suggestions.push('Select a transition effect such as Cross Dissolve or Fade.');
      }
    }

    // 7. Level 7: Speed
    if (criteria.changedSpeed && criteria.notDefaultSpeed) {
      if (editState.playbackSpeed && editState.playbackSpeed !== 1.0) {
        score += 55;
        strengths.push(`Adjusted video speed to ${editState.playbackSpeed}x for tailored motion pacing.`);
      } else {
        suggestions.push('Change playback speed to 0.5x (Slow-Mo) or 1.5x/2.0x (Fast) in the Speed tab.');
      }
    }

    // 8. Level 8 & Projects: Full Capstone
    if (criteria.appliedTrim) {
      if ((editState.trimStart > 0.5) || (editState.trimEnd && editState.trimEnd < (editState.totalDuration - 0.5))) {
        score += 15;
        strengths.push('Trimmed footage for tight social pacing.');
      } else {
        suggestions.push('Trim the clip using the timeline handles.');
      }
    }

    score = Math.min(100, Math.max(0, score));

    if (suggestions.length === 0 && score < 95) {
      score = 96;
    }

    const isPassed = score > 90; // Strictly > 90% required

    return {
      score,
      isPassed,
      strengths,
      suggestions: suggestions.length > 0 ? suggestions : ['Flawless video execution! Your storytelling skills are sharp.'],
      proTip: scoringRubric.proTip || 'Pacing is everything in video editing. When in doubt, cut 1 second sooner!'
    };
  }
}
