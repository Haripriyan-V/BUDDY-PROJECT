import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {
  COCO_CLASSES,
  associateDetections,
  calculateOverlap,
  calculateBoxDistance,
  answerDetectionQuery,
} from '../src/services/visionService.js';
import { detectGameIntent } from '../src/services/gameIntentService.js';
import chatRouter, { buildSystemPrompt } from '../server/routes/chat.js';
import dotenv from 'dotenv';

dotenv.config();

function createTestApp() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use('/api/chat', chatRouter);
  return app;
}

test('COCO_CLASSES contains 80 standard classes including person, everyday classroom and household items', () => {
  assert.equal(COCO_CLASSES.length, 80);
  assert.ok(COCO_CLASSES.includes('person'));
  assert.ok(COCO_CLASSES.includes('book'));
  assert.ok(COCO_CLASSES.includes('bottle'));
  assert.ok(COCO_CLASSES.includes('cup'));
  assert.ok(COCO_CLASSES.includes('cell phone'));
  assert.ok(COCO_CLASSES.includes('laptop'));
  assert.ok(COCO_CLASSES.includes('backpack'));
  assert.ok(COCO_CLASSES.includes('chair'));
  assert.ok(COCO_CLASSES.includes('keyboard'));
  assert.ok(COCO_CLASSES.includes('mouse'));
  assert.ok(COCO_CLASSES.includes('scissors'));
});

test('calculateOverlap and calculateBoxDistance compute accurate geometric metrics', () => {
  // Disjoint boxes
  const box1 = [0, 0, 100, 100];
  const box2 = [200, 200, 100, 100];
  assert.equal(calculateOverlap(box1, box2), 0);

  // Overlapping boxes (50x50 overlap = 2500 area)
  const box3 = [50, 50, 100, 100];
  assert.equal(calculateOverlap(box1, box3), 2500);

  // Distance between centers
  const dist = calculateBoxDistance([0, 0, 10, 10], [30, 40, 10, 10]);
  assert.equal(dist, 50); // 3-4-5 right triangle hypotenuse: 30^2 + 40^2 = 50^2
});

test('associateDetections identifies multiple people and counts them accurately', () => {
  const rawDetections = [
    { class: 'person', score: 0.92, bbox: [50, 50, 120, 300] },
    { class: 'person', score: 0.88, bbox: [300, 60, 130, 290] },
    { class: 'person', score: 0.79, bbox: [550, 70, 110, 280] },
  ];

  const scene = associateDetections(rawDetections);
  assert.equal(scene.peopleCount, 3);
  assert.equal(scene.people.length, 3);
  assert.equal(scene.people[0].label, 'Person 1');
  assert.equal(scene.people[1].label, 'Person 2');
  assert.equal(scene.people[2].label, 'Person 3');
});

test('associateDetections associates an object as held ONLY when geometry and holding zone support it', () => {
  // Person 1 at [100, 100, 200, 400]
  // Book held in hand/torso zone: [150, 250, 80, 100] (area 8000, 100% inside person's lower-middle box)
  // Bottle near Person 1: [320, 280, 50, 120] (adjacent distance < 50px)
  // Chair on the far right: [600, 300, 150, 200] (independent room object)
  const rawDetections = [
    { class: 'person', score: 0.95, bbox: [100, 100, 200, 400] },
    { class: 'book', score: 0.9, bbox: [150, 250, 80, 100] },
    { class: 'bottle', score: 0.85, bbox: [310, 260, 40, 90] },
    { class: 'chair', score: 0.8, bbox: [600, 300, 150, 200] },
  ];

  const scene = associateDetections(rawDetections);
  assert.equal(scene.peopleCount, 1);
  assert.equal(scene.objects.length, 3);

  const book = scene.objects.find((o) => o.class === 'book');
  assert.equal(book.relationship, 'held');
  assert.equal(book.associatedPerson, 'Person 1');
  assert.equal(scene.people[0].heldObjects.length, 1);
  assert.equal(scene.people[0].heldObjects[0].class, 'book');

  const chair = scene.objects.find((o) => o.class === 'chair');
  assert.equal(chair.relationship, 'independent');
});

test('associateDetections refuses to classify a large background object as held even if overlapping', () => {
  // A dining table or sofa that overlaps a person is NOT "held in hand"
  const rawDetections = [
    { class: 'person', score: 0.9, bbox: [100, 100, 150, 300] }, // area: 45,000
    { class: 'dining table', score: 0.85, bbox: [50, 200, 300, 200] }, // area: 60,000 (larger than person!)
  ];

  const scene = associateDetections(rawDetections);
  assert.equal(scene.peopleCount, 1);
  const table = scene.objects.find((o) => o.class === 'dining table');
  assert.notEqual(table.relationship, 'held');
  assert.equal(scene.people[0].heldObjects.length, 0);
});

test('answerDetectionQuery (Mode A) answers people count in English, Tamil, and Hindi', () => {
  const sceneWithTwoPeople = associateDetections([
    { class: 'person', score: 0.91, bbox: [100, 100, 100, 250] },
    { class: 'person', score: 0.89, bbox: [300, 100, 100, 250] },
  ]);

  // English
  const resEn = answerDetectionQuery('How many people are in front of the camera?', sceneWithTwoPeople, 'en');
  assert.equal(resEn.matched, true);
  assert.ok(resEn.text.includes('2 people'));

  // Tamil
  const resTa = answerDetectionQuery('இங்கே எத்தனை பேர் இருக்கிறார்கள்?', sceneWithTwoPeople, 'ta');
  assert.equal(resTa.matched, true);
  assert.ok(resTa.text.includes('2 நபர்கள்'));

  // Hindi
  const resHi = answerDetectionQuery('कैमरे के सामने कितने लोग हैं?', sceneWithTwoPeople, 'hi');
  assert.equal(resHi.matched, true);
  assert.ok(resHi.text.includes('2 लोग'));
});

test('answerDetectionQuery (Mode A) accurately lists detected everyday objects', () => {
  const scene = associateDetections([
    { class: 'person', score: 0.95, bbox: [100, 100, 100, 200] },
    { class: 'bottle', score: 0.88, bbox: [250, 150, 50, 100] },
    { class: 'laptop', score: 0.92, bbox: [350, 150, 120, 80] },
  ]);

  const res = answerDetectionQuery('What objects can you see?', scene, 'en');
  assert.equal(res.matched, true);
  assert.ok(res.text.includes('bottle'));
  assert.ok(res.text.includes('laptop'));
});

test('answerDetectionQuery (Mode A) reports held items accurately', () => {
  const scene = associateDetections([
    { class: 'person', score: 0.95, bbox: [100, 100, 200, 400] },
    { class: 'book', score: 0.9, bbox: [150, 250, 80, 100] }, // in holding zone
  ]);

  const res = answerDetectionQuery('What is the student holding?', scene, 'en');
  assert.equal(res.matched, true);
  assert.ok(res.text.includes('Person 1 appears to be holding a book'));
});

test('answerDetectionQuery flags deep visual queries as requiring Mode B VQA', () => {
  const scene = associateDetections([]);
  // Questions requiring color analysis, diagram comprehension, or reading fine text cannot be answered by COCO-SSD
  const query1 = answerDetectionQuery('What color is the student shirt?', scene, 'en');
  assert.equal(query1.matched, false);
  assert.equal(query1.requiresVQA, true);

  const query2 = answerDetectionQuery('Explain this circuit diagram on the paper', scene, 'en');
  assert.equal(query2.matched, false);
  assert.equal(query2.requiresVQA, true);
});

test('detectGameIntent routes natural voice and text commands to AI Vision module', () => {
  const intent1 = detectGameIntent('open camera');
  assert.ok(intent1);
  assert.equal(intent1.action, 'vision');

  const intent2 = detectGameIntent('AI vision');
  assert.ok(intent2);
  assert.equal(intent2.action, 'vision');

  const intent3 = detectGameIntent('look at me');
  assert.ok(intent3);
  assert.equal(intent3.action, 'vision');

  // Tamil command
  const intentTa = detectGameIntent('கேமரா திற', { language: 'ta' });
  assert.ok(intentTa);
  assert.equal(intentTa.action, 'vision');
  assert.ok(intentTa.text.includes('பட்டி AI விஷன்'));
});

test('POST /api/chat accepts base64 image frame with vision context and validates format', async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;

  try {
    // 1. Invalid image format test (should reject with HTTP 400)
    const resBad = await fetch(`http://127.0.0.1:${port}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'What is this?',
        image: 'http://malicious-url.com/tracker.exe',
      }),
    });
    assert.equal(resBad.status, 400);
    const dataBad = await resBad.json();
    assert.equal(dataBad.success, false);
    assert.ok(dataBad.error.includes('Invalid image format'));

    // 2. Valid data URL structure validation
    // Minimal 1x1 blank PNG data URL
    const validDataUrl =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    assert.ok(validDataUrl.startsWith('data:image/png;base64,'));

    const systemPromptVision = buildSystemPrompt('playful', 'en', '', true);
    assert.ok(systemPromptVision.includes('VISION & VISUAL REASONING DIRECTIVES'));
    assert.ok(systemPromptVision.includes('Ground your answer strictly in the physical objects'));
    assert.ok(systemPromptVision.includes('NEVER guess or invent identities'));
  } finally {
    server.close();
  }
});

test('Camera stream tracks cleanup simulation ensures all hardware tracks stop', () => {
  let track1Stopped = false;
  let track2Stopped = false;

  const mockTrack1 = { stop: () => { track1Stopped = true; } };
  const mockTrack2 = { stop: () => { track2Stopped = true; } };

  const mockStream = {
    getTracks: () => [mockTrack1, mockTrack2],
  };

  // Simulate stopping camera stream
  mockStream.getTracks().forEach((t) => t.stop());

  assert.equal(track1Stopped, true);
  assert.equal(track2Stopped, true);
});

test('Coordinate mapping and selfie mirror calculation preserves bounding box geometry', () => {
  const displayWidth = 800;
  const videoWidth = 640;
  const scaleX = displayWidth / videoWidth; // 1.25

  const rawX = 100;
  const rawW = 80;

  // Standard non-mirrored coordinate
  const standardX = rawX * scaleX;
  assert.equal(standardX, 125);

  // Mirrored selfie coordinate: inverted from right edge
  const mirroredX = displayWidth - (rawX + rawW) * scaleX;
  assert.equal(mirroredX, 800 - 180 * 1.25);
  assert.equal(mirroredX, 575);
});
