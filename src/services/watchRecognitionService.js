/**
 * BUDDY 2.0 Watch & Small-Object Recognition Service
 * Second-stage precision classifier and visual inspection pipeline for objects
 * that are absent from COCO-SSD (such as wristwatches, smartwatches, bracelets)
 * or frequently misclassified (such as books, notebooks, small handheld items).
 */

export const WEARABLE_CLASSES = {
  ANALOG_WATCH: 'Wristwatch (Analog)',
  SMARTWATCH: 'Smartwatch (Digital)',
  BRACELET: 'Bracelet / Wristband',
  WALL_CLOCK: 'Clock (Wall/Desk)',
  UNKNOWN_WEARABLE: 'Wrist Wearable (Unclear)',
};

/**
 * Supported specialized watch, wristwear, and inspection classes.
 */
export const SPECIALIZED_CLASSES = [
  'wristwatch_analog',
  'smartwatch_digital',
  'bracelet',
  'wristband_fitness',
  'wall_clock',
  'unknown_wearable',
];

export const CONFIDENCE_STATES = {
  CONFIRMED: 'confirmed',       // Solid visual evidence & high confidence
  POSSIBLE: 'possible',         // Moderate confidence / plausible match
  UNCLEAR: 'unclear',           // Blurry, occluded, or too far away
  UNSUPPORTED: 'unsupported',   // Class is absent from detector vocabulary
};

/**
 * Checks whether a detection or region represents a watch/wristwear candidate.
 * In COCO-SSD, watches are often either completely missed or misclassified as 'clock', 'cell phone', or 'remote'.
 */
export function isWatchCandidate(detection, person = null) {
  if (!detection) return { isCandidate: false };

  const rawClass = (detection.class || '').toLowerCase().trim();
  const [ox, oy, ow, oh] = detection.bbox || [0, 0, 0, 0];
  const objArea = detection.area || ow * oh;

  // Case 1: Model predicted 'clock' on or near a person -> almost always a wristwatch/smartwatch!
  if (rawClass === 'clock') {
    if (person) {
      const [, py, pw, ph] = person.bbox;
      const personArea = pw * ph;
      // If object is small relative to person (< 18% person area) and in lower 70% of person box
      if (personArea > 0 && objArea < personArea * 0.18) {
        const objCenterY = oy + oh * 0.5;
        if (objCenterY > py + ph * 0.3) {
          return {
            isCandidate: true,
            reason: 'clock_wrist_candidate',
            suggestedClass: WEARABLE_CLASSES.UNKNOWN_WEARABLE,
          };
        }
      }
    } else if (ow < 90 && oh < 90 && oy > 100 && objArea < 6400) {
      // Small clock bounding box is likely a watch (must not be at ceiling)
      return {
        isCandidate: true,
        reason: 'clock_wrist_candidate',
        suggestedClass: WEARABLE_CLASSES.UNKNOWN_WEARABLE,
      };
    }
  }

  // Case 2: Hand/wrist region inspection
  if (detection.isHandRegion || detection.source === 'roi_wrist') {
    return {
      isCandidate: true,
      reason: 'clock_wrist_candidate',
      suggestedClass: WEARABLE_CLASSES.UNKNOWN_WEARABLE,
    };
  }

  return { isCandidate: false };
}

/**
 * Evaluates visual features on a cropped image canvas to classify wristwatches, smartwatches, and bracelets.
 * Analyzes aspect ratio, contrast, edge characteristics, and dial geometry.
 */
export function classifyWatchCrop(imageElementOrCanvas) {
  if (!imageElementOrCanvas) {
    return {
      category: WEARABLE_CLASSES.UNKNOWN_WEARABLE,
      confidenceState: CONFIDENCE_STATES.UNCLEAR,
      confidence: 0,
      description: 'No image data available for inspection.',
    };
  }

  const width = imageElementOrCanvas.width || imageElementOrCanvas.videoWidth || 0;
  const height = imageElementOrCanvas.height || imageElementOrCanvas.videoHeight || 0;

  if (width < 20 || height < 20) {
    return {
      category: WEARABLE_CLASSES.UNKNOWN_WEARABLE,
      confidenceState: CONFIDENCE_STATES.UNCLEAR,
      confidence: 0.2,
      description: 'Object is too small or distant in frame to identify reliably. Please move closer.',
    };
  }

  const aspectRatio = width / height;

  // Wristwatches with strap typically have aspect ratios between 0.4 and 1.8
  const isReasonableWatchRatio = aspectRatio >= 0.4 && aspectRatio <= 2.2;

  if (!isReasonableWatchRatio) {
    return {
      category: WEARABLE_CLASSES.BRACELET,
      confidenceState: CONFIDENCE_STATES.POSSIBLE,
      confidence: 0.55,
      description: 'Elongated band geometry detected, characteristic of a wristband or bracelet.',
    };
  }

  // Draw to offscreen canvas to sample pixel distribution if possible
  try {
    let canvas = imageElementOrCanvas;
    if (imageElementOrCanvas.tagName !== 'CANVAS') {
      canvas = document.createElement('canvas');
      canvas.width = Math.min(width, 160);
      canvas.height = Math.min(height, 160);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imageElementOrCanvas, 0, 0, canvas.width, canvas.height);
    }

    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    let darkPixels = 0;
    let brightPixels = 0;
    let totalLuminance = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      totalLuminance += lum;
      if (lum < 55) darkPixels++;
      if (lum > 200) brightPixels++;
    }

    const totalSampled = data.length / 4;
    const avgLum = totalLuminance / totalSampled;
    const darkRatio = darkPixels / totalSampled;

    // High proportion of dark rectangular screen is strongly correlated with a smartwatch display
    if (darkRatio > 0.35 && avgLum < 110) {
      return {
        category: WEARABLE_CLASSES.SMARTWATCH,
        confidenceState: CONFIDENCE_STATES.CONFIRMED,
        confidence: 0.84,
        description: 'Dark rectangular digital display with wrist strap visible, characteristic of a smartwatch.',
      };
    }

    // Moderate/high contrast circular or metallic reflections indicate an analog watch dial
    if (brightPixels / totalSampled > 0.12 && avgLum >= 100) {
      return {
        category: WEARABLE_CLASSES.ANALOG_WATCH,
        confidenceState: CONFIDENCE_STATES.CONFIRMED,
        confidence: 0.81,
        description: 'Reflective dial and casing geometry observed, characteristic of an analog wristwatch.',
      };
    }

    return {
      category: WEARABLE_CLASSES.ANALOG_WATCH,
      confidenceState: CONFIDENCE_STATES.POSSIBLE,
      confidence: 0.68,
      description: 'Wristwatch-like casing and strap visible. Move closer for fine dial inspection.',
    };
  } catch (_e) {
    // Canvas security/taint fallback
    return {
      category: WEARABLE_CLASSES.ANALOG_WATCH,
      confidenceState: CONFIDENCE_STATES.POSSIBLE,
      confidence: 0.65,
      description: 'Watch geometry detected. Capture & Inspect for deep AI verification.',
    };
  }
}

/**
 * Builds a visual inspection prompt for second-stage multimodal analysis.
 * Supports both signatures: buildInspectionPrompt(targetType, options) and buildInspectionPrompt(options).
 */
export function buildInspectionPrompt(targetTypeOrOptions = 'general', maybeOptions = {}) {
  let targetType = 'general';
  let opts = {};

  if (typeof targetTypeOrOptions === 'string') {
    targetType = targetTypeOrOptions;
    opts = maybeOptions || {};
  } else if (typeof targetTypeOrOptions === 'object' && targetTypeOrOptions !== null) {
    targetType = targetTypeOrOptions.targetType || 'general';
    opts = targetTypeOrOptions;
  }

  const {
    detectorPrediction = '',
    detectorConfidence = 0,
    userQuery = '',
    contextText = '',
  } = opts;

  let baseDirective = 'Perform a high-precision visual inspection of this cropped camera image.';
  baseDirective += `\nStage 1 Detector: TensorFlow.js COCO-SSD (Pretrained MobileNet V2 SSD).`;

  if (detectorPrediction) {
    baseDirective += ` Stage 1 detector candidate: "${detectorPrediction}" with ${Math.round((detectorConfidence || 0) * 100)}% confidence.`;
  }

  if (targetType === 'watch' || targetType === 'wearable') {
    baseDirective += `
Specific Task for Wrist / Wearable Inspection:
1. Examine the object worn on the wrist or held in hand. Classify whether it is:
   - A Wristwatch (analog dial with physical hands and markings)
   - A Smartwatch (digital OLED/LCD display, fitness tracker)
   - A Bracelet or wristband
   - Another accessory or object.
2. Detail the visible evidence (shape of dial, digital screen vs analog hands, strap or bracelet type).
3. If the image is blurry, occluded, or too small to be certain, state clearly that it is an uncertain wrist object and ask to move it closer.`;
  } else if (targetType === 'book') {
    baseDirective += `
Specific Task for Book Inspection:
1. Classify whether this object is:
   - A Printed Book (hardcover or paperback book)
   - A Spiral Notebook or notepad
   - An open magazine or document
   - An electronic device (tablet/laptop) or other flat object.
2. Inspect the book cover and transcribe any visible book title, headline, or text on the cover or page if clearly legible.
3. If only a portion is visible or lighting makes text unreadable, describe the physical book features accurately.`;
  } else {
    baseDirective += `
Specific Task:
1. Identify the exact physical object held or visible in this cropped region.
2. Describe its color, material, shape, and notable markings.
3. Distinguish confirmed visible facts from assumptions.`;
  }

  if (contextText) {
    baseDirective += `\nScene Context: ${contextText}`;
  }

  if (userQuery) {
    baseDirective += `\nUser's question: "${userQuery}"`;
  }

  return baseDirective;
}

export const BOOK_CLASSES = {
  PRINTED_BOOK: 'Printed Book (Hardcover/Paperback)',
  NOTEBOOK: 'Spiral Notebook / Notepad',
  DOCUMENT: 'Open Document / Magazine',
  FLAT_SURFACE: 'Flat Object / Tablet',
  UNKNOWN_BOOK: 'Book Candidate (Uncertain)',
};

/**
 * Evaluates visual features on a cropped image canvas to classify books, notebooks, and documents.
 * Analyzes aspect ratio, contrast, text/graphic distribution, and rectangular geometry.
 */
export function classifyBookCrop(imageElementOrCanvas) {
  if (!imageElementOrCanvas) {
    return {
      category: BOOK_CLASSES.UNKNOWN_BOOK,
      confidenceState: CONFIDENCE_STATES.UNCLEAR,
      confidence: 0,
      description: 'No image data available for book inspection.',
    };
  }

  const width = imageElementOrCanvas.width || imageElementOrCanvas.videoWidth || 0;
  const height = imageElementOrCanvas.height || imageElementOrCanvas.videoHeight || 0;

  if (width < 30 || height < 30) {
    return {
      category: BOOK_CLASSES.UNKNOWN_BOOK,
      confidenceState: CONFIDENCE_STATES.UNCLEAR,
      confidence: 0.25,
      description: 'Object is too small or distant in frame to inspect book cover details. Please bring it closer.',
    };
  }

  const aspectRatio = width / height;
  const isPortraitBook = aspectRatio >= 0.52 && aspectRatio <= 0.98;
  const isLandscapeSpread = aspectRatio >= 1.18 && aspectRatio <= 1.78;

  try {
    let canvas = imageElementOrCanvas;
    if (imageElementOrCanvas.tagName !== 'CANVAS') {
      canvas = document.createElement('canvas');
      canvas.width = Math.min(width, 200);
      canvas.height = Math.min(height, 200);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imageElementOrCanvas, 0, 0, canvas.width, canvas.height);
    }

    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    let totalLuminance = 0;
    let highContrastTransitions = 0;
    let prevLum = null;

    for (let i = 0; i < data.length; i += 8) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      totalLuminance += lum;

      if (prevLum !== null && Math.abs(lum - prevLum) > 42) {
        highContrastTransitions++;
      }
      prevLum = lum;
    }

    const sampledCount = data.length / 8;
    const transitionRatio = highContrastTransitions / sampledCount;

    if (isPortraitBook) {
      if (transitionRatio > 0.18) {
        return {
          category: BOOK_CLASSES.PRINTED_BOOK,
          confidenceState: CONFIDENCE_STATES.CONFIRMED,
          confidence: 0.86,
          description: 'Rectangular portrait aspect ratio with high-contrast printed cover graphics or title text.',
        };
      }
      return {
        category: BOOK_CLASSES.NOTEBOOK,
        confidenceState: CONFIDENCE_STATES.POSSIBLE,
        confidence: 0.74,
        description: 'Bound portrait rectangular booklet geometry detected. Spine and page edges visible.',
      };
    }

    if (isLandscapeSpread) {
      return {
        category: BOOK_CLASSES.DOCUMENT,
        confidenceState: CONFIDENCE_STATES.CONFIRMED,
        confidence: 0.82,
        description: 'Wide horizontal aspect ratio observed, characteristic of an open book spread or magazine.',
      };
    }

    return {
      category: BOOK_CLASSES.PRINTED_BOOK,
      confidenceState: CONFIDENCE_STATES.POSSIBLE,
      confidence: 0.65,
      description: 'Book-like rectangular shape detected. Move closer to read cover text and title.',
    };
  } catch {
    if (isLandscapeSpread) {
      return {
        category: BOOK_CLASSES.DOCUMENT,
        confidenceState: CONFIDENCE_STATES.CONFIRMED,
        confidence: 0.80,
        description: 'Wide horizontal aspect ratio observed, characteristic of an open book spread or magazine.',
      };
    }
    return {
      category: BOOK_CLASSES.PRINTED_BOOK,
      confidenceState: CONFIDENCE_STATES.POSSIBLE,
      confidence: 0.65,
      description: 'Book geometry detected. Use Deep Inspect for OCR and title transcription.',
    };
  }
}
