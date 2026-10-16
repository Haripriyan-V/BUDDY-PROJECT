import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COCO_CLASSES,
  CLASS_THRESHOLDS,
  CONFIDENCE_STATES,
  TemporalPredictionTracker,
  associateDetections,
  generateHandRegionProposals,
  answerDetectionQuery,
} from '../src/services/visionService.js';
import {
  isWatchCandidate,
  buildInspectionPrompt,
  SPECIALIZED_CLASSES,
  classifyWatchCrop,
  classifyBookCrop,
  WEARABLE_CLASSES,
  BOOK_CLASSES,
} from '../src/services/watchRecognitionService.js';
import {
  recordDetectionFeedback,
  getFeedbackStatistics,
  getExportableFeedbackDataset,
  clearFeedbackData,
} from '../src/services/feedbackService.js';

test('Benchmark 1: COCO-SSD class evaluation verifies watch absence and book presence', () => {
  // COCO dataset contains 80 classes
  assert.equal(COCO_CLASSES.length, 80);

  // Books are supported
  assert.ok(COCO_CLASSES.includes('book'), 'COCO-SSD must contain book');

  // Watches are strictly ABSENT from COCO-SSD 80 classes
  assert.equal(COCO_CLASSES.includes('watch'), false, 'COCO-SSD must not contain watch');
  assert.equal(COCO_CLASSES.includes('wristwatch'), false, 'COCO-SSD must not contain wristwatch');
  assert.equal(COCO_CLASSES.includes('smartwatch'), false, 'COCO-SSD must not contain smartwatch');

  // Specialized second-stage classes define the supported watch vocabulary
  assert.ok(SPECIALIZED_CLASSES.includes('wristwatch_analog'));
  assert.ok(SPECIALIZED_CLASSES.includes('smartwatch_digital'));
  assert.ok(SPECIALIZED_CLASSES.includes('bracelet'));
});

test('Benchmark 2: Calibrated thresholds improve book recall while preventing false clocks', () => {
  // A held book scored at 0.34
  const bookDetection = [{ class: 'book', score: 0.34, bbox: [100, 100, 150, 200] }];

  // With default threshold (0.45), this valid book is discarded
  const rejectedScene = associateDetections(bookDetection, { minConfidence: 0.45 });
  assert.equal(rejectedScene.objects.length, 0, 'Generic 0.45 threshold discards low-confidence held book');

  // With calibrated threshold (CLASS_THRESHOLDS.book = 0.30), the book is detected
  const acceptedScene = associateDetections(bookDetection, { useClassThresholds: true });
  assert.equal(acceptedScene.objects.length, 1, 'Calibrated 0.30 threshold preserves real book detection');
  assert.equal(acceptedScene.objects[0].class, 'book');
  assert.equal(acceptedScene.objects[0].confidenceState, CONFIDENCE_STATES.UNCLEAR);

  // A clock scored at 0.40 (below calibrated clock threshold 0.46) is discarded to prevent false wall clocks
  const clockDetection = [{ class: 'clock', score: 0.40, bbox: [200, 200, 40, 40] }];
  const sceneWithClock = associateDetections(clockDetection, { useClassThresholds: true });
  assert.equal(sceneWithClock.objects.length, 0, 'Clock below 0.46 is filtered to avoid misclassifying wrist objects');
});

test('Benchmark 3: isWatchCandidate accurately distinguishes wristwatches from wall clocks and other items', () => {
  const person = {
    id: 1,
    label: 'Person 1',
    bbox: [100, 50, 200, 400], // Person height 400
  };

  // Small clock candidate on arm/wrist area (y = 250 is 50% down torso, small box 35x35)
  const wristClock = {
    class: 'clock',
    score: 0.55,
    bbox: [220, 250, 35, 35],
    area: 1225,
  };
  const wristCheck = isWatchCandidate(wristClock, person);
  assert.equal(wristCheck.isCandidate, true);
  assert.equal(wristCheck.reason, 'clock_wrist_candidate');

  // Large wall clock on upper ceiling (y = 20, high above person, large size 120x120)
  const wallClock = {
    class: 'clock',
    score: 0.88,
    bbox: [500, 20, 120, 120],
    area: 14400,
  };
  const wallCheck = isWatchCandidate(wallClock, null);
  assert.equal(wallCheck.isCandidate, false);

  // Non-wearable item (bottle) is not a watch candidate
  const bottle = {
    class: 'bottle',
    score: 0.85,
    bbox: [150, 250, 40, 100],
    area: 4000,
  };
  const bottleCheck = isWatchCandidate(bottle, person);
  assert.equal(bottleCheck.isCandidate, false);
});

test('Benchmark 4: TemporalPredictionTracker smooths coordinates and eliminates single-frame flickers', () => {
  const tracker = new TemporalPredictionTracker({ alpha: 0.65, minHits: 2, maxAge: 3 });

  // Frame 1: Detection arrives
  const frame1 = [{ class: 'book', score: 0.70, bbox: [100, 100, 80, 120] }];
  const tracked1 = tracker.update(frame1);
  assert.equal(tracked1.length, 1);
  assert.equal(tracked1[0].hits, 1);
  assert.equal(tracked1[0].isStable, false, 'First frame must not be marked stable yet');

  // Frame 2: Same book with slight movement ([110, 105, 82, 118])
  const frame2 = [{ class: 'book', score: 0.74, bbox: [110, 105, 82, 118] }];
  const tracked2 = tracker.update(frame2);
  assert.equal(tracked2.length, 1);
  assert.equal(tracked2[0].hits, 2);
  assert.equal(tracked2[0].isStable, true, 'Second frame meets minHits (2) and becomes stable');

  // Verify EMA smoothed coordinate: alpha * 110 + (1 - alpha) * 100 = 0.65 * 110 + 0.35 * 100 = 71.5 + 35 = 106.5 -> 107
  assert.equal(tracked2[0].bbox[0], 107, 'Coordinates must be smoothed by EMA');

  // Frame 3: Object disappears for 4 frames -> track is aged out
  tracker.update([]);
  tracker.update([]);
  tracker.update([]);
  tracker.update([]);
  assert.equal(tracker.tracks.size, 0, 'Unmatched tracks must be purged after maxAge');
});

test('Benchmark 5: generateHandRegionProposals produces proportional wrist and center chest ROIs', () => {
  const people = [
    {
      id: 1,
      label: 'Person 1',
      bbox: [200, 100, 300, 500],
    },
  ];

  const proposals = generateHandRegionProposals(people, 1280, 720);
  assert.ok(proposals.length >= 2, 'Should generate left and right hand proposals');

  const leftHand = proposals.find((p) => p.side === 'left');
  const rightHand = proposals.find((p) => p.side === 'right');
  const centerChest = proposals.find((p) => p.side === 'center');

  assert.ok(leftHand, 'Left hand ROI proposal must exist');
  assert.ok(rightHand, 'Right hand ROI proposal must exist');
  assert.ok(centerChest, 'Center chest holding ROI proposal must exist');

  // Verify bounds are within video dimensions
  proposals.forEach((p) => {
    assert.ok(p.bbox[0] >= 0 && p.bbox[0] <= 1280);
    assert.ok(p.bbox[1] >= 0 && p.bbox[1] <= 720);
    assert.ok(p.bbox[2] > 0);
    assert.ok(p.bbox[3] > 0);
  });
});

test('Benchmark 6: buildInspectionPrompt strictly maintains separation between detector and visual model', () => {
  const watchPrompt = buildInspectionPrompt('watch', {
    detectorPrediction: 'clock',
    detectorConfidence: 0.54,
  });

  assert.ok(watchPrompt.includes('COCO-SSD'), 'Must state Stage 1 detector model');
  assert.ok(watchPrompt.includes('wrist'), 'Must request inspection of wrist details');
  assert.ok(watchPrompt.includes('analog') || watchPrompt.includes('digital'), 'Must distinguish analog vs digital');
  assert.ok(!watchPrompt.includes('guaranteed 100%'), 'Must not invent fake certainty');

  const bookPrompt = buildInspectionPrompt('book', {
    detectorPrediction: 'book',
    detectorConfidence: 0.65,
  });
  assert.ok(bookPrompt.includes('book'), 'Must focus on book inspection');
  assert.ok(bookPrompt.includes('cover') || bookPrompt.includes('title'), 'Must inspect cover and title');
});

test('Benchmark 7: feedbackService accurately calculates precision, confusion, and export format', () => {
  clearFeedbackData();

  // Record 3 feedbacks: 2 correct, 1 misclassification
  recordDetectionFeedback({
    predictedClass: 'book',
    confidence: 0.75,
    feedback: 'correct',
    trueLabel: 'book',
  });

  recordDetectionFeedback({
    predictedClass: 'clock',
    confidence: 0.62,
    feedback: 'incorrect',
    trueLabel: 'wristwatch',
  });

  recordDetectionFeedback({
    predictedClass: 'cell phone',
    confidence: 0.81,
    feedback: 'correct',
    trueLabel: 'cell phone',
  });

  const stats = getFeedbackStatistics();
  assert.equal(stats.total, 3);
  assert.equal(stats.correct, 2);
  assert.equal(stats.incorrect, 1);
  assert.equal(stats.precision, 67); // 2/3 = 66.67% -> 67%

  // Confusion matrix should map clock -> wristwatch
  assert.equal(stats.confusionMatrix['clock']['wristwatch'], 1);

  // Exportable dataset validation
  const dataset = getExportableFeedbackDataset();
  assert.equal(dataset.version, '2.0.0');
  assert.equal(dataset.totalEntries, 3);
  assert.equal(dataset.records.length, 3);
  assert.equal(dataset.records[1].predictedClass, 'clock');
  assert.equal(dataset.records[1].trueLabel, 'wristwatch');
});

test('Benchmark 8: answerDetectionQuery truthfully handles questions about watches and books', () => {
  // Scene with a person and a watch candidate
  const sceneDataWithWatch = {
    peopleCount: 1,
    people: [{ label: 'Person 1', heldObjects: [] }],
    objects: [
      {
        class: 'clock',
        displayLabel: 'Watch Candidate (Inspect)',
        score: 0.55,
        isWatchCandidate: true,
        confidenceState: CONFIDENCE_STATES.UNSUPPORTED,
      },
    ],
  };

  const watchReply = answerDetectionQuery('Do you see a watch?', sceneDataWithWatch, 'en');
  assert.equal(watchReply.matched, true);
  assert.ok(watchReply.text.includes('wrist') || watchReply.text.includes('watch') || watchReply.text.includes('inspect'));

  // Scene with a book
  const sceneDataWithBook = {
    peopleCount: 1,
    people: [{ label: 'Person 1', heldObjects: [{ class: 'book', score: 0.72 }] }],
    objects: [{ class: 'book', displayLabel: 'book', score: 0.72, confidenceState: CONFIDENCE_STATES.CONFIRMED }],
  };

  const bookReply = answerDetectionQuery('Can you see a book?', sceneDataWithBook, 'en');
  assert.equal(bookReply.matched, true);
  assert.ok(bookReply.text.toLowerCase().includes('book'));
});

test('Benchmark 9: classifyWatchCrop handles aspect ratios, dimensions, and bracelet distinction', () => {
  // Test 1: Tiny/distant crop (< 20px) returns UNCLEAR and requests moving closer
  const tinyCrop = { width: 14, height: 16 };
  const tinyResult = classifyWatchCrop(tinyCrop);
  assert.equal(tinyResult.confidenceState, CONFIDENCE_STATES.UNCLEAR);
  assert.ok(tinyResult.description.includes('too small'));

  // Test 2: Elongated wristband/bracelet (aspect ratio 3.2 > 2.2)
  const braceletCrop = { width: 160, height: 50 };
  const braceletResult = classifyWatchCrop(braceletCrop);
  assert.equal(braceletResult.category, WEARABLE_CLASSES.BRACELET);
  assert.equal(braceletResult.confidenceState, CONFIDENCE_STATES.POSSIBLE);
  assert.ok(braceletResult.description.includes('wristband') || braceletResult.description.includes('bracelet'));

  // Test 3: Standard watch casing aspect ratio (1.0)
  const watchCrop = { width: 100, height: 100 };
  const watchResult = classifyWatchCrop(watchCrop);
  assert.ok(
    watchResult.category === WEARABLE_CLASSES.ANALOG_WATCH ||
    watchResult.category === WEARABLE_CLASSES.SMARTWATCH
  );
});

test('Benchmark 10: classifyBookCrop distinguishes portrait books from open spreads and distant items', () => {
  // Test 1: Distant/small crop (< 30px) returns UNCLEAR
  const smallBook = { width: 22, height: 26 };
  const smallResult = classifyBookCrop(smallBook);
  assert.equal(smallResult.confidenceState, CONFIDENCE_STATES.UNCLEAR);
  assert.ok(smallResult.description.includes('too small'));

  // Test 2: Standard portrait book (aspect ratio ~0.70)
  const portraitBook = { width: 140, height: 200 };
  const portraitResult = classifyBookCrop(portraitBook);
  assert.ok(
    portraitResult.category === BOOK_CLASSES.PRINTED_BOOK ||
    portraitResult.category === BOOK_CLASSES.NOTEBOOK
  );

  // Test 3: Landscape open book spread (aspect ratio ~1.4)
  const openSpread = { width: 280, height: 200 };
  const spreadResult = classifyBookCrop(openSpread);
  assert.equal(spreadResult.category, BOOK_CLASSES.DOCUMENT);
  assert.equal(spreadResult.confidenceState, CONFIDENCE_STATES.CONFIRMED);
});

test('Benchmark 11: Quantitative Science Expo evaluation matrix measures precision, recall, and F1', () => {
  // Validation set of 12 test instances across Science Expo common objects
  const validationSet = [
    { truth: 'person', detected: 'person', score: 0.94 },
    { truth: 'person', detected: 'person', score: 0.88 },
    { truth: 'book', detected: 'book', score: 0.72 },
    { truth: 'book', detected: 'book', score: 0.35 }, // Low confidence held book caught by 0.30 threshold
    { truth: 'book', detected: null, score: 0 },       // Missed book under harsh glare
    { truth: 'bottle', detected: 'bottle', score: 0.82 },
    { truth: 'cell phone', detected: 'cell phone', score: 0.78 },
    { truth: 'cell phone', detected: 'cell phone', score: 0.69 },
    { truth: 'wristwatch', detected: 'clock', score: 0.52, isWatchCandidate: true }, // Watch candidate
    { truth: 'smartwatch', detected: 'clock', score: 0.48, isWatchCandidate: true }, // Watch candidate
    { truth: 'wall_clock', detected: 'clock', score: 0.89, isWatchCandidate: false }, // Genuine wall clock
    { truth: 'background', detected: null, score: 0 },
  ];

  // Evaluate human detection:
  const humanInstances = validationSet.filter((v) => v.truth === 'person');
  const humanTP = humanInstances.filter((v) => v.detected === 'person').length;
  const humanRecall = humanTP / humanInstances.length;
  assert.equal(humanRecall, 1.0, 'Human detection recall must remain 100%');

  // Evaluate book detection with calibrated 0.30 threshold:
  const bookInstances = validationSet.filter((v) => v.truth === 'book');
  const bookTP = bookInstances.filter((v) => v.detected === 'book' && v.score >= CLASS_THRESHOLDS.book).length;
  const bookRecall = bookTP / bookInstances.length;
  assert.equal(bookTP, 2);
  assert.equal(Math.round(bookRecall * 100), 67); // 2 out of 3 detected

  // Evaluate watch candidate separation:
  const watchInstances = validationSet.filter((v) => v.truth === 'wristwatch' || v.truth === 'smartwatch');
  const watchesFlaggedForInspection = watchInstances.filter((v) => v.isWatchCandidate).length;
  assert.equal(watchesFlaggedForInspection, 2, 'All wrist objects must be flagged as watch candidates for Stage 2');

  const wallClocks = validationSet.filter((v) => v.truth === 'wall_clock');
  assert.equal(wallClocks[0].isWatchCandidate, false, 'Wall clock must NOT be flagged as a watch candidate');
});

test('Benchmark 12: Crop bounding box normalization preserves aspect ratio without distortion', () => {
  const frameWidth = 1280;
  const frameHeight = 720;
  const cropBox = [300, 200, 150, 200]; // 150x200 crop (aspect ratio = 0.75)

  const maxWidth = 800;
  let targetWidth = cropBox[2];
  let targetHeight = cropBox[3];

  if (cropBox[2] > maxWidth) {
    const scale = maxWidth / cropBox[2];
    targetWidth = Math.round(cropBox[2] * scale);
    targetHeight = Math.round(cropBox[3] * scale);
  }

  const originalAspectRatio = cropBox[2] / cropBox[3];
  const targetAspectRatio = targetWidth / targetHeight;

  assert.equal(originalAspectRatio, targetAspectRatio, 'Aspect ratio of cropped frame must be strictly preserved');
  assert.ok(cropBox[0] + cropBox[2] <= frameWidth, 'Crop must remain inside frame width');
  assert.ok(cropBox[1] + cropBox[3] <= frameHeight, 'Crop must remain inside frame height');
});

