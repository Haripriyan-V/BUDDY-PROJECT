/**
 * BUDDY 2.0 AI Vision Service
 * Real-time Human Detection, Object Association, Temporal Stability Tracking,
 * and Multi-Stage Scene Question Answering.
 */
import { CHARACTER_STATES } from '../utils/characterStates.js';
import { isWatchCandidate, CONFIDENCE_STATES } from './watchRecognitionService.js';

export { CONFIDENCE_STATES };

/**
 * 80 Object Classes supported by the pretrained COCO-SSD detector model.
 * BUDDY will only claim detection for these supported classes.
 * Note: Watches (wristwatches, smartwatches) are absent from COCO and require second-stage inspection.
 */
export const COCO_CLASSES = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
  'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat',
  'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack',
  'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
  'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
  'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
  'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair',
  'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse',
  'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink', 'refrigerator',
  'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
];

/**
 * Calibrated class-specific confidence thresholds.
 * - Books often score 0.30-0.45 when held at angles; lower threshold prevents missed books.
 * - Clocks have a higher threshold to prevent falsely claiming a wristwatch is a wall clock.
 */
export const CLASS_THRESHOLDS = {
  person: 0.38,
  book: 0.30,
  laptop: 0.36,
  'cell phone': 0.35,
  bottle: 0.36,
  cup: 0.36,
  backpack: 0.36,
  handbag: 0.36,
  clock: 0.46,
  scissors: 0.35,
  default: 0.40,
};

/**
 * Friendly icons for common classroom and Science Expo everyday items.
 */
export const CLASS_ICONS = {
  person: '👤',
  book: '📖',
  bottle: '🧴',
  cup: '☕',
  'cell phone': '📱',
  laptop: '💻',
  backpack: '🎒',
  handbag: '👜',
  chair: '🪑',
  keyboard: '⌨️',
  mouse: '🖱️',
  'sports ball': '⚽',
  umbrella: '☂️',
  scissors: '✂️',
  apple: '🍎',
  banana: '🍌',
  sandwich: '🥪',
  tv: '📺',
  clock: '⏰',
  watch: '⌚',
};

/**
 * Returns a friendly emoji for a detected object class.
 */
export function getClassIcon(className) {
  return CLASS_ICONS[className?.toLowerCase()] || '📦';
}

/**
 * Calculates 2D Euclidean distance between two bounding box centers.
 */
export function calculateBoxDistance(boxA, boxB) {
  const centerAX = boxA[0] + boxA[2] / 2;
  const centerAY = boxA[1] + boxA[3] / 2;
  const centerBX = boxB[0] + boxB[2] / 2;
  const centerBY = boxB[1] + boxB[3] / 2;
  return Math.hypot(centerAX - centerBX, centerAY - centerBY);
}

/**
 * Calculates geometric intersection and overlap between two bounding boxes: [x, y, width, height]
 */
export function calculateOverlap(boxA, boxB) {
  const x1 = Math.max(boxA[0], boxB[0]);
  const y1 = Math.max(boxA[1], boxB[1]);
  const x2 = Math.min(boxA[0] + boxA[2], boxB[0] + boxB[2]);
  const y2 = Math.min(boxA[1] + boxA[3], boxB[1] + boxB[3]);

  if (x2 <= x1 || y2 <= y1) return 0;
  return (x2 - x1) * (y2 - y1);
}

/**
 * Calculates Intersection over Union (IoU) between two bounding boxes.
 */
export function calculateIoU(boxA, boxB) {
  const overlap = calculateOverlap(boxA, boxB);
  if (overlap <= 0) return 0;
  const areaA = boxA[2] * boxA[3];
  const areaB = boxB[2] * boxB[3];
  const union = areaA + areaB - overlap;
  return union > 0 ? overlap / union : 0;
}

/**
 * Generates candidate Hand/Wrist Region of Interest (ROI) proposals from detected people.
 * Allows targeted second-pass high-resolution inference for small held objects and wristwatches.
 */
export function generateHandRegionProposals(people = [], frameWidth = 1280, frameHeight = 720) {
  const proposals = [];

  people.forEach((p, idx) => {
    const [px, py, pw, ph] = p.bbox;

    // Left hand / wrist region
    const leftX = Math.max(0, px - pw * 0.15);
    const leftY = Math.min(frameHeight, py + ph * 0.42);
    const leftW = Math.min(frameWidth - leftX, pw * 0.45);
    const leftH = Math.min(frameHeight - leftY, ph * 0.42);

    if (leftW > 30 && leftH > 30) {
      proposals.push({
        id: `roi_hand_l_${idx + 1}`,
        personId: p.id,
        side: 'left',
        bbox: [Math.round(leftX), Math.round(leftY), Math.round(leftW), Math.round(leftH)],
        source: 'roi_wrist',
      });
    }

    // Right hand / wrist region
    const rightX = Math.max(0, px + pw * 0.7);
    const rightY = Math.min(frameHeight, py + ph * 0.42);
    const rightW = Math.min(frameWidth - rightX, pw * 0.45);
    const rightH = Math.min(frameHeight - rightY, ph * 0.42);

    if (rightW > 30 && rightH > 30) {
      proposals.push({
        id: `roi_hand_r_${idx + 1}`,
        personId: p.id,
        side: 'right',
        bbox: [Math.round(rightX), Math.round(rightY), Math.round(rightW), Math.round(rightH)],
        source: 'roi_wrist',
      });
    }

    // Center chest/holding area (where books and laptops are held)
    const centerX = Math.max(0, px + pw * 0.15);
    const centerY = Math.min(frameHeight, py + ph * 0.35);
    const centerW = Math.min(frameWidth - centerX, pw * 0.7);
    const centerH = Math.min(frameHeight - centerY, ph * 0.45);

    if (centerW > 40 && centerH > 40) {
      proposals.push({
        id: `roi_held_c_${idx + 1}`,
        personId: p.id,
        side: 'center',
        bbox: [Math.round(centerX), Math.round(centerY), Math.round(centerW), Math.round(centerH)],
        source: 'roi_hand_held',
      });
    }
  });

  return proposals;
}

/**
 * Temporal Prediction Tracker:
 * Smooths coordinates using Exponential Moving Average (EMA), eliminates single-frame
 * flicker transients, and provides calibrated confidence states.
 */
export class TemporalPredictionTracker {
  constructor(options = {}) {
    this.alpha = options.alpha !== undefined ? options.alpha : 0.65; // Smoothing factor
    this.maxAge = options.maxAge || 4;    // Frames of absence before dropping track
    this.minHits = options.minHits || 2;  // Frames to confirm detection
    this.tracks = new Map();
    this.nextTrackId = 1;
  }

  update(rawDetections = []) {
    const matchedTrackIds = new Set();
    const updatedPredictions = [];

    // Match each incoming detection to an existing track using IoU and class equality
    rawDetections.forEach((det) => {
      let bestTrack = null;
      let highestIoU = 0.22; // Minimum IoU to associate across consecutive frames

      for (const [trackId, track] of this.tracks.entries()) {
        if (track.class === det.class) {
          const iou = calculateIoU(track.bbox, det.bbox);
          if (iou > highestIoU) {
            highestIoU = iou;
            bestTrack = { trackId, track };
          }
        }
      }

      if (bestTrack) {
        // Update existing track with smoothed coordinates (EMA)
        const track = bestTrack.track;
        track.bbox = [
          Math.round(this.alpha * det.bbox[0] + (1 - this.alpha) * track.bbox[0]),
          Math.round(this.alpha * det.bbox[1] + (1 - this.alpha) * track.bbox[1]),
          Math.round(this.alpha * det.bbox[2] + (1 - this.alpha) * track.bbox[2]),
          Math.round(this.alpha * det.bbox[3] + (1 - this.alpha) * track.bbox[3]),
        ];
        track.score = Math.round((this.alpha * det.score + (1 - this.alpha) * track.score) * 100) / 100;
        track.hits += 1;
        track.age = 0;
        matchedTrackIds.add(bestTrack.trackId);

        updatedPredictions.push({
          ...det,
          id: bestTrack.trackId,
          bbox: track.bbox,
          score: track.score,
          isStable: track.hits >= this.minHits,
          hits: track.hits,
        });
      } else {
        // New track initialized
        const newTrackId = this.nextTrackId++;
        this.tracks.set(newTrackId, {
          class: det.class,
          bbox: [...det.bbox],
          score: det.score,
          hits: 1,
          age: 0,
        });
        matchedTrackIds.add(newTrackId);

        updatedPredictions.push({
          ...det,
          id: newTrackId,
          isStable: false,
          hits: 1,
        });
      }
    });

    // Age out unmatched tracks
    for (const [trackId, track] of this.tracks.entries()) {
      if (!matchedTrackIds.has(trackId)) {
        track.age += 1;
        if (track.age > this.maxAge) {
          this.tracks.delete(trackId);
        }
      }
    }

    return updatedPredictions;
  }

  reset() {
    this.tracks.clear();
    this.nextTrackId = 1;
  }
}

/**
 * Analyzes raw COCO-SSD detections and applies geometric heuristics to determine:
 * - Number of people in view.
 * - Objects that are actively being held by a detected person.
 * - Objects near a person vs independent room objects.
 * - Watch candidate status on wrist/hand regions.
 * - Calibrated confidence states (confirmed, possible, unclear, unsupported).
 */
export function associateDetections(rawDetections = [], options = {}) {
  const { minConfidence, useClassThresholds = true } = options;

  // Filter valid detections using class-specific thresholds
  const validDetections = (rawDetections || []).filter((d) => {
    if (!d || !Array.isArray(d.bbox) || d.bbox.length !== 4) return false;
    const rawClass = (d.class || '').toLowerCase().trim();
    const threshold = minConfidence !== undefined
      ? minConfidence
      : useClassThresholds
        ? (CLASS_THRESHOLDS[rawClass] || CLASS_THRESHOLDS.default)
        : 0.40;
    return (d.score || 0) >= threshold;
  });

  const peopleDetections = [];
  const objectDetections = [];

  validDetections.forEach((item, index) => {
    const rawClass = (item.class || '').toLowerCase().trim();
    const entry = {
      id: item.id || index + 1,
      class: rawClass,
      score: Math.round((item.score || 0) * 100) / 100,
      bbox: [
        Math.round(item.bbox[0]),
        Math.round(item.bbox[1]),
        Math.round(item.bbox[2]),
        Math.round(item.bbox[3]),
      ],
      area: Math.round(item.bbox[2] * item.bbox[3]),
      isStable: item.isStable !== undefined ? item.isStable : true,
    };

    if (rawClass === 'person') {
      peopleDetections.push(entry);
    } else {
      objectDetections.push(entry);
    }
  });

  // Assign people labels (Person 1, Person 2, ...) sorted by left-to-right position
  peopleDetections.sort((a, b) => a.bbox[0] - b.bbox[0]);
  const people = peopleDetections.map((p, idx) => ({
    ...p,
    label: `Person ${idx + 1}`,
    heldObjects: [],
    nearObjects: [],
  }));

  // Analyze each object relative to detected people
  const processedObjects = objectDetections.map((obj) => {
    let bestPerson = null;
    let highestContainment = 0;
    let closestDistance = Infinity;
    let bestRelationship = 'independent';

    people.forEach((person) => {
      const [, py, pw, ph] = person.bbox;
      const [, oy, , oh] = obj.bbox;
      const overlapArea = calculateOverlap(person.bbox, obj.bbox);
      const containment = obj.area > 0 ? overlapArea / obj.area : 0;
      const distance = calculateBoxDistance(person.bbox, obj.bbox);

      // Check if vertical center of object is in the plausible arm/torso/hand zone
      const objCenterY = oy + oh * 0.5;
      const isInHoldingZone = objCenterY >= py + ph * 0.25 && objCenterY <= py + ph * 0.95;
      const isReasonableSizeRatio = obj.area <= person.area * 0.65;

      // Cautious Held Heuristic
      const isHeld = containment >= 0.35 && isInHoldingZone && isReasonableSizeRatio;

      if (isHeld && containment > highestContainment) {
        highestContainment = containment;
        bestPerson = person;
        bestRelationship = 'held';
      } else if (!bestPerson && (containment >= 0.15 || distance < Math.max(pw, ph) * 0.45)) {
        if (distance < closestDistance) {
          closestDistance = distance;
          bestPerson = person;
          bestRelationship = 'near';
        }
      }
    });

    // Check if this object is a candidate wristwatch / wearable misclassified or detected
    const watchCheck = isWatchCandidate(obj, bestPerson);
    const isWatch = watchCheck.isCandidate;

    // Calibrated Confidence State:
    let confidenceState = CONFIDENCE_STATES.POSSIBLE;
    if (isWatch) {
      confidenceState = CONFIDENCE_STATES.UNSUPPORTED; // absent from COCO vocabulary
    } else if (obj.score >= 0.65) {
      confidenceState = CONFIDENCE_STATES.CONFIRMED;
    } else if (obj.score < 0.38) {
      confidenceState = CONFIDENCE_STATES.UNCLEAR;
    }

    const enhancedObj = {
      ...obj,
      relationship: bestRelationship,
      associatedPerson: bestPerson ? bestPerson.label : null,
      associatedPersonId: bestPerson ? bestPerson.id : null,
      confidenceState,
      isWatchCandidate: isWatch,
      watchInspectionReason: watchCheck.reason || null,
      displayLabel: isWatch ? 'Watch Candidate (Inspect)' : obj.class,
    };

    if (bestPerson && bestRelationship === 'held') {
      bestPerson.heldObjects.push({
        id: obj.id,
        class: enhancedObj.displayLabel,
        rawClass: obj.class,
        score: obj.score,
        bbox: obj.bbox,
        confidenceState,
        isWatchCandidate: isWatch,
      });
    } else if (bestPerson && bestRelationship === 'near') {
      bestPerson.nearObjects.push({
        id: obj.id,
        class: enhancedObj.displayLabel,
        rawClass: obj.class,
        score: obj.score,
        bbox: obj.bbox,
        confidenceState,
        isWatchCandidate: isWatch,
      });
    }

    return enhancedObj;
  });

  // Calculate object frequency counts
  const objectCounts = {};
  processedObjects.forEach((obj) => {
    objectCounts[obj.class] = (objectCounts[obj.class] || 0) + 1;
  });

  // Build clean scene summary text for vision context
  const heldItemsList = [];
  people.forEach((p) => {
    if (p.heldObjects.length > 0) {
      const names = p.heldObjects.map((h) => `${h.class} (${Math.round(h.score * 100)}%)`).join(', ');
      heldItemsList.push(`${p.label} is holding ${names}`);
    }
  });

  const objectsSummary = Object.entries(objectCounts)
    .map(([cls, count]) => `${count} ${cls}${count > 1 ? 's' : ''}`)
    .join(', ');

  const sceneContextText = [
    `People Count: ${people.length}.`,
    objectsSummary ? `Visible Objects: ${objectsSummary}.` : 'No additional everyday objects detected.',
    heldItemsList.length > 0 ? `Held Relationships: ${heldItemsList.join('; ')}.` : 'No held objects confirmed.',
  ].join(' ');

  // Generate hand/wrist region proposals
  const handProposals = generateHandRegionProposals(people);

  return {
    peopleCount: people.length,
    people,
    objects: processedObjects,
    objectCounts,
    heldList: heldItemsList,
    handProposals,
    sceneContextText,
    timestamp: Date.now(),
  };
}

/**
 * Mode A: Local Detection Question Answering.
 * Answers questions that can be reliably answered directly from real-time bounding boxes and counts.
 * Explicitly and truthfully handles watches (absent from COCO) and books.
 */
export function answerDetectionQuery(userQuery, sceneData, language = 'en') {
  if (!userQuery || typeof userQuery !== 'string') {
    return { matched: false };
  }

  const query = userQuery.toLowerCase().trim();
  const { peopleCount = 0, people = [], objectCounts = {}, objects = [] } = sceneData || {};

  // 1. People count intent
  const isPeopleQuery =
    query.includes('how many people') ||
    query.includes('how many students') ||
    query.includes('how many persons') ||
    query.includes('how many human') ||
    query.includes('number of people') ||
    query.includes('anyone here') ||
    query.includes('who is in front') ||
    query.includes('who do you see') ||
    query.includes('எத்தனை பேர்') || // Tamil
    query.includes('ஆட்கள்') ||
    query.includes('कितने लोग') || // Hindi
    query.includes('लोग दिख रहे') ||
    query.includes('ఎంతమంది') || // Telugu
    query.includes('వ్యక్తులు') ||
    query.includes('എത്ര പേരുണ്ട്') || // Malayalam
    query.includes('ಎಷ್ಟು ಜನರಿದ್ದಾರೆ') || // Kannada
    query.includes('কতজন মানুষ') || // Bengali
    query.includes('cuántas personas') || // Spanish
    query.includes('cuantas personas') ||
    query.includes('combien de personnes') || // French
    query.includes('wie viele personen'); // German

  if (isPeopleQuery) {
    return generatePeopleCountResponse(peopleCount, language);
  }

  // 2. Watch & Wristwear Intent (Truthful handling of COCO limitation)
  const isWatchQuery =
    query.includes('watch') ||
    query.includes('wristwatch') ||
    query.includes('smartwatch') ||
    query.includes('வாட்ச்') ||
    query.includes('கைக்கடிகாரம்') ||
    query.includes('घड़ी') ||
    query.includes('वाच') ||
    query.includes('reloj');

  if (isWatchQuery) {
    // Check if any object was flagged as a watch candidate or near wrist
    const watchCandidate = (objects || []).find((o) => o.isWatchCandidate);
    if (watchCandidate) {
      const messages = {
        en: "I observe a small watch candidate on the wrist! Because pretrained COCO-SSD does not include a dedicated watch class, please click 'Capture & Inspect' for specialized AI identification of your watch!",
        ta: "கையில் ஒரு வாட்ச் தெரிகிறது! வழக்கமான COCO மாதிரியில் வாட்ச் பிரிவு இல்லாததால், உங்கள் வாட்ச்சை துல்லியமாக அறிய 'Capture & Inspect' என்பதை கிளிக் செய்யவும்!",
        hi: "कलाई पर घड़ी जैसी वस्तु दिख रही है! सामान्य मॉडल में घड़ी का अलग वर्ग न होने के कारण, सटीक पहचान के लिए कृपया 'Capture & Inspect' पर क्लिक करें!",
      };
      return {
        matched: true,
        text: messages[language] || messages.en,
        expression: CHARACTER_STATES.CURIOUS,
        requiresInspection: true,
        targetType: 'watch',
      };
    }

    const notFoundMessages = {
      en: "I do not see a watch clearly in front of the camera right now. Please hold your watch closer to the camera and click 'Capture & Inspect'!",
      ta: "தற்போது கேமரா முன் வாட்ச் தெளிவாக தெரியவில்லை. தயவுசெய்து உங்கள் வாட்ச்சை அருகில் காட்டி 'Capture & Inspect' செய்யவும்!",
      hi: "मुझे अभी कैमरे में घड़ी साफ़ नहीं दिख रही है। कृपया घड़ी को पास लाएं और 'Capture & Inspect' दबाएं!",
    };
    return {
      matched: true,
      text: notFoundMessages[language] || notFoundMessages.en,
      expression: CHARACTER_STATES.CONFUSED,
      requiresInspection: true,
      targetType: 'watch',
    };
  }

  // 3. Book Intent (Confirmation + Inspection offer)
  const isBookQuery =
    query.includes('book') ||
    query.includes('notebook') ||
    query.includes('textbook') ||
    query.includes('புத்தகம்') ||
    query.includes('किताब') ||
    query.includes('పుస్తకం') ||
    query.includes('ಪುಸ್ತಕ');

  if (isBookQuery) {
    const bookCount = objectCounts['book'] || 0;
    if (bookCount > 0) {
      const messages = {
        en: `Yes! I detected ${bookCount} book${bookCount > 1 ? 's' : ''} in view! 📖 If you would like me to read the title or inspect the cover, click 'Capture & Inspect'!`,
        ta: `ஆம்! நான் ${bookCount} புத்தகத்தை கண்டறிந்தேன்! 📖 அட்டையை படிக்க அல்லது ஆய்வு செய்ய 'Capture & Inspect' கிளிக் செய்யவும்!`,
        hi: `हाँ! मुझे ${bookCount} किताब दिखाई दे रही है! 📖 शीर्षक पढ़ने या आवरण की जांच के लिए 'Capture & Inspect' पर क्लिक करें!`,
      };
      return {
        matched: true,
        text: messages[language] || messages.en,
        expression: CHARACTER_STATES.HAPPY,
        requiresInspection: false,
        canInspectBook: true,
      };
    }
    return {
      matched: true,
      text: "I do not detect a book in view right now. Hold it clearly facing the camera, or use 'Capture & Inspect' if it is a notebook or small booklet!",
      expression: CHARACTER_STATES.CONFUSED,
      requiresInspection: false,
    };
  }

  // 4. Visible objects list intent
  const isObjectsListQuery =
    query.includes('what objects') ||
    query.includes('which objects') ||
    query.includes('what can you see') ||
    query.includes('what do you see') ||
    query.includes('list objects') ||
    query.includes('tell me what you see') ||
    query.includes('என்ன பொருட்கள்') ||
    query.includes('பொருட்களை') ||
    query.includes('क्या वस्तुएं') ||
    query.includes('चीजें दिख रही') ||
    query.includes('ఏ వస్తువులు') ||
    query.includes('ഏതൊക്കെ വസ്തുക്കൾ') ||
    query.includes('ಯಾವ ವಸ್ತುಗಳು') ||
    query.includes('কী কী বস্তু') ||
    query.includes('qué objetos') ||
    query.includes('que objets') ||
    query.includes('welche objekte');

  if (isObjectsListQuery) {
    return generateObjectsListResponse(peopleCount, objectCounts, language);
  }

  // 5. Held object intent
  const isHeldQuery =
    query.includes('holding') ||
    query.includes('in hand') ||
    query.includes('carrying') ||
    query.includes('கையில்') ||
    query.includes('வைத்திருக்கி') ||
    query.includes('पकड़ा हुआ') ||
    query.includes('हाथ में') ||
    query.includes('చేతిలో') ||
    query.includes('കയ്യിൽ') ||
    query.includes('ಕೈಯಲ್ಲಿ') ||
    query.includes('হাতে') ||
    query.includes('sosteniendo') ||
    query.includes('dans la main') ||
    query.includes('in der hand');

  if (isHeldQuery) {
    return generateHeldObjectsResponse(people);
  }

  // 6. Specific object check or count for other COCO classes
  for (const itemClass of COCO_CLASSES) {
    if (itemClass === 'person' || itemClass === 'book') continue;
    const singular = itemClass;
    const plural = `${itemClass}s`;

    if (query.includes(singular) || query.includes(plural)) {
      const count = objectCounts[itemClass] || 0;
      return generateSpecificObjectResponse(itemClass, count, language);
    }
  }

  // If question requires detailed visual reasoning (Mode B: colors, text, diagrams, actions), return matched: false
  return {
    matched: false,
    requiresVQA: true,
    suggestion: 'To analyze fine details, colors, diagrams, or read text, capture a frame using "Capture & Inspect"!',
  };
}

function generatePeopleCountResponse(count, language) {
  const responses = {
    en: count === 0
      ? 'I do not detect any people in front of the camera right now. Step closer so I can see you! 👋'
      : count === 1
        ? 'I can see 1 person in front of the camera right now! Hello there! 👋'
        : `I can see ${count} people in front of the camera right now! Welcome everyone! 👋✨`,
    ta: count === 0
      ? 'தற்போது கேமராவின் முன் யாரும் தெரியவில்லை. சற்று அருகில் வாருங்கள்! 👋'
      : count === 1
        ? 'தற்போது கேமராவின் முன் 1 நபர் தெரிகிறார்! வணக்கம்! 👋'
        : `தற்போது கேமராவின் முன் ${count} நபர்கள் தெளிவாகத் தெரிகிறார்கள்! உங்கள் அனைவரையும் வரவேற்கிறேன்! 👋✨`,
    hi: count === 0
      ? 'मुझे अभी कैमरे के सामने कोई व्यक्ति नहीं दिख रहा है। थोड़ा पास आइए! 👋'
      : count === 1
        ? 'मुझे अभी कैमरे के सामने 1 व्यक्ति दिखाई दे रहा है! नमस्ते! 👋'
        : `मुझे अभी कैमरे के सामने ${count} लोग दिखाई दे रहे हैं! आप सभी का स्वागत है! 👋✨`,
    te: count === 0
      ? 'ప్రస్తుతం కెమెరా ముందు ఎవరూ కనిపించడం లేదు. దయచేసి కొంచెం దగ్గరకు రండి! 👋'
      : count === 1
        ? 'ప్రస్తుతం కెమెరా ముందు 1 వ్యక్తి కనిపిస్తున్నారు! నమస్కారం! 👋'
        : `ప్రస్తుతం కెమెరా ముందు ${count} మంది వ్యక్తులు కనిపిస్తున్నారు! అందరికీ స్వాగతం! 👋✨`,
    ml: count === 0
      ? 'ഇപ്പോൾ ക്യാമറയ്ക്ക് മുന്നിൽ ആരെയും കാണുന്നില്ല. കുറച്ചുകൂടി അടുത്തേക്ക് വരൂ! 👋'
      : count === 1
        ? 'ഇപ്പോൾ ക്യാമറയ്ക്ക് മുന്നിൽ 1 ആളെ കാണുന്നുണ്ട്! നമസ്കാരം! 👋'
        : `ഇപ്പോൾ ക്യാമറയ്ക്ക് മുന്നിൽ ${count} പേരെ കാണുന്നുണ്ട്! എല്ലാവർക്കും സ്വാഗതം! 👋✨`,
    kn: count === 0
      ? 'ಪ್ರಸ್ತುತ ಕ್ಯಾಮೆರಾ ಮುಂದೆ ಯಾರೂ ಕಾಣುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಹತ್ತಿರ ಬನ್ನಿ! 👋'
      : count === 1
        ? 'ಪ್ರಸ್ತುತ ಕ್ಯಾಮೆರಾ ಮುಂದೆ 1 ವ್ಯಕ್ತಿ ಕಾಣಿಸುತ್ತಿದ್ದಾರೆ! ನಮಸ್ಕಾರ! 👋'
        : `ಪ್ರಸ್ತುತ ಕ್ಯಾಮೆರಾ ಮುಂದೆ ${count} ಜನರು ಕಾಣಿಸುತ್ತಿದ್ದಾರೆ! ಎಲ್ಲರಿಗೂ ಸ್ವಾಗತ! 👋✨`,
    bn: count === 0
      ? 'বর্তমানে ক্যামেরার সামনে কাউকে দেখা যাচ্ছে না। একটু কাছে আসুন! 👋'
      : count === 1
        ? 'বর্তমানে ক্যামেরার সামনে ১ জন মানুষকে দেখা যাচ্ছে! নমস্কার! 👋'
        : `বর্তমানে ক্যামেরার সামনে ${count} জন মানুষ দেখা যাচ্ছে! আপনাদের সবাইকে স্বাগতম! 👋✨`,
    es: count === 0
      ? 'No detecto a ninguna persona frente a la cámara en este momento. ¡Acércate un poco! 👋'
      : count === 1
        ? '¡Veo a 1 persona frente a la cámara en este momento! ¡Hola! 👋'
        : `¡Veo a ${count} personas frente a la cámara en este momento! ¡Bienvenidos todos! 👋✨`,
    fr: count === 0
      ? "Je ne détecte personne devant la caméra pour le moment. Approchez-vous ! 👋"
      : count === 1
        ? "Je vois 1 personne devant la caméra en ce moment ! Bonjour ! 👋"
        : `Je vois ${count} personnes devant la caméra en ce moment ! Bienvenue à tous ! 👋✨`,
    de: count === 0
      ? 'Ich sehe im Moment niemanden vor der Kamera. Komm ein Stück näher! 👋'
      : count === 1
        ? 'Ich sehe gerade 1 Person vor der Kamera! Hallo! 👋'
        : `Ich sehe gerade ${count} Personen vor der Kamera! Herzlich willkommen! 👋✨`,
  };

  return {
    matched: true,
    text: responses[language] || responses.en,
    expression: count > 0 ? CHARACTER_STATES.HAPPY : CHARACTER_STATES.CURIOUS,
    requiresVQA: false,
    peopleCount: count,
  };
}

function generateObjectsListResponse(peopleCount, objectCounts, language) {
  const entries = Object.entries(objectCounts);

  if (entries.length === 0) {
    const emptyMsgs = {
      en: peopleCount > 0
        ? `I see ${peopleCount} ${peopleCount === 1 ? 'person' : 'people'}, but no supported everyday objects are currently detected.`
        : 'I do not detect any supported objects or people in front of the camera right now.',
      ta: peopleCount > 0
        ? `நான் ${peopleCount} நபர்களைக் காண்கிறேன், ஆனால் வேறு அன்றாடப் பொருட்கள் எதுவும் தற்போது கண்டறியப்படவில்லை.`
        : 'தற்போது கேமராவின் முன் எந்தப் பொருட்களும் கண்டறியப்படவில்லை.',
      hi: peopleCount > 0
        ? `मुझे ${peopleCount} लोग दिख रहे हैं, लेकिन कोई अन्य समर्थित वस्तु अभी नहीं दिख रही है।`
        : 'मुझे अभी कैमरे के सामने कोई समर्थित वस्तु नहीं दिख रही है।',
    };
    return {
      matched: true,
      text: emptyMsgs[language] || emptyMsgs.en,
      expression: CHARACTER_STATES.CURIOUS,
      requiresVQA: false,
    };
  }

  const listFormatted = entries
    .map(([cls, count]) => `${count} ${cls}${count > 1 ? 's' : ''}`)
    .join(', ');

  const responses = {
    en: `Right now I observe: ${listFormatted}${peopleCount > 0 ? `, along with ${peopleCount} ${peopleCount === 1 ? 'person' : 'people'}` : ''}! 🔍`,
    ta: `தற்போது நான் காண்பவை: ${listFormatted}${peopleCount > 0 ? `, மற்றும் ${peopleCount} நபர்(கள்)` : ''}! 🔍`,
    hi: `अभी मुझे दिखाई दे रहे हैं: ${listFormatted}${peopleCount > 0 ? `, साथ में ${peopleCount} लोग` : ''}! 🔍`,
    es: `En este momento observo: ${listFormatted}${peopleCount > 0 ? `, junto con ${peopleCount} persona(s)` : ''}! 🔍`,
  };

  return {
    matched: true,
    text: responses[language] || responses.en,
    expression: CHARACTER_STATES.HAPPY,
    requiresVQA: false,
  };
}

function generateHeldObjectsResponse(people) {
  const heldRelationships = [];

  people.forEach((p) => {
    if (p.heldObjects && p.heldObjects.length > 0) {
      const heldNames = p.heldObjects.map((h) => h.class).join(' and ');
      heldRelationships.push(`${p.label} appears to be holding a ${heldNames}`);
    }
  });

  if (heldRelationships.length > 0) {
    const text = heldRelationships.join('. ') + '.';
    return {
      matched: true,
      text,
      expression: CHARACTER_STATES.EXCITED,
      requiresVQA: false,
    };
  }

  // Check near objects
  const nearList = [];
  people.forEach((p) => {
    if (p.nearObjects && p.nearObjects.length > 0) {
      const nearNames = p.nearObjects.map((n) => n.class).join(' and ');
      nearList.push(`a ${nearNames} is visible near ${p.label}`);
    }
  });

  if (nearList.length > 0) {
    return {
      matched: true,
      text: `I cannot confirm an object is firmly held in hand, but ${nearList.join(', ')}.`,
      expression: CHARACTER_STATES.CURIOUS,
      requiresVQA: false,
    };
  }

  return {
    matched: true,
    text: 'I do not detect anyone holding an object in front of the camera right now. Hold an object like a book or bottle clearly in front of you!',
    expression: CHARACTER_STATES.CURIOUS,
    requiresVQA: false,
  };
}

function generateSpecificObjectResponse(objectClass, count, language) {
  if (count > 0) {
    const responses = {
      en: `Yes! I can clearly detect ${count} ${objectClass}${count > 1 ? 's' : ''} in the camera view right now! ${getClassIcon(objectClass)}`,
      ta: `ஆம்! நான் தற்போது கேமராவில் ${count} ${objectClass} கண்டறிகிறேன்! ${getClassIcon(objectClass)}`,
      hi: `हाँ! मुझे अभी कैमरे में ${count} ${objectClass} साफ़ दिखाई दे रहा है! ${getClassIcon(objectClass)}`,
    };
    return {
      matched: true,
      text: responses[language] || responses.en,
      expression: CHARACTER_STATES.HAPPY,
      requiresVQA: false,
    };
  }

  return {
    matched: true,
    text: `No, I do not see any ${objectClass} in front of the camera at the moment. Try bringing it closer into view!`,
    expression: CHARACTER_STATES.CONFUSED,
    requiresVQA: false,
  };
}
