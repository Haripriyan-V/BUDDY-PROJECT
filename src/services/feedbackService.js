/**
 * BUDDY 2.0 Vision Feedback & Evaluation Service
 * Records optional user feedback on object predictions to measure precision,
 * identify misclassification patterns (e.g. watch vs clock, book vs laptop),
 * and provide exportable benchmark telemetry without storing sensitive images.
 */

let inMemoryFeedback = [];

/**
 * Records user feedback on a detection or second-stage prediction.
 */
export function recordDetectionFeedback(feedbackData) {
  const {
    detectionId,
    predictedClass,
    feedback,
    feedbackType, // 'correct' | 'incorrect' | 'unsure'
    correctedClass = '',
    trueLabel = '',
    confidence = 0,
    confidenceState = 'confirmed',
    notes = '',
    targetType = 'object',
    relationship = 'independent',
    stage = 'stage1_detector',
  } = feedbackData || {};

  const resolvedFb = feedback || feedbackType || 'unsure';
  const resolvedTrue = trueLabel || correctedClass || (resolvedFb === 'correct' ? predictedClass : '');

  const entry = {
    id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    detectionId: detectionId || 'unknown',
    predictedClass: predictedClass || 'unknown',
    feedbackType: resolvedFb,
    feedback: resolvedFb,
    correctedClass: resolvedTrue,
    trueLabel: resolvedTrue,
    confidence: Math.round((confidence || 0) * 100) / 100,
    confidenceState,
    targetType,
    relationship,
    stage,
    notes: notes?.trim() || '',
  };

  inMemoryFeedback.push(entry);

  // Keep last 200 entries to prevent memory growth
  if (inMemoryFeedback.length > 200) {
    inMemoryFeedback.shift();
  }

  return entry;
}

/**
 * Calculates real precision, recall indicators, and confusion statistics from recorded feedback.
 */
export function getFeedbackStatistics() {
  const total = inMemoryFeedback.length;
  if (total === 0) {
    return {
      total: 0,
      correct: 0,
      incorrect: 0,
      unsure: 0,
      precision: 0,
      accuracyRate: null,
      correctCount: 0,
      incorrectCount: 0,
      unsureCount: 0,
      perClassStats: {},
      confusionMatrix: {},
      confusionPairs: [],
    };
  }

  let correctCount = 0;
  let incorrectCount = 0;
  let unsureCount = 0;

  const perClass = {};
  const confusionMatrix = {};
  const confusionMap = {};

  inMemoryFeedback.forEach((item) => {
    const rawPredicted = item.predictedClass || 'unknown';
    const cls = rawPredicted.toLowerCase();
    if (!perClass[cls]) {
      perClass[cls] = { total: 0, correct: 0, incorrect: 0, unsure: 0 };
    }
    perClass[cls].total += 1;

    const fb = item.feedback || item.feedbackType;
    if (fb === 'correct') {
      correctCount++;
      perClass[cls].correct += 1;
    } else if (fb === 'incorrect') {
      incorrectCount++;
      perClass[cls].incorrect += 1;

      const rawActual = item.trueLabel || item.correctedClass || 'unknown';
      if (!confusionMatrix[rawPredicted]) {
        confusionMatrix[rawPredicted] = {};
      }
      confusionMatrix[rawPredicted][rawActual] = (confusionMatrix[rawPredicted][rawActual] || 0) + 1;

      const pairKey = `${rawPredicted} -> ${rawActual}`;
      confusionMap[pairKey] = (confusionMap[pairKey] || 0) + 1;
    } else {
      unsureCount++;
      perClass[cls].unsure += 1;
    }
  });

  const evaluated = correctCount + incorrectCount;
  const precision = evaluated > 0 ? Math.round((correctCount / evaluated) * 100) : 0;
  const accuracyRate = precision;

  const confusionPairs = Object.entries(confusionMap).map(([pair, count]) => {
    const [predicted, actual] = pair.split(' -> ');
    return { predicted, actual, count };
  });

  return {
    total,
    correct: correctCount,
    incorrect: incorrectCount,
    unsure: unsureCount,
    precision,
    accuracyRate,
    correctCount,
    incorrectCount,
    unsureCount,
    perClassStats: perClass,
    confusionMatrix,
    confusionPairs,
  };
}

/**
 * Returns full feedback history for export or error analysis.
 */
export function getExportableFeedbackDataset() {
  return {
    version: '2.0.0',
    appName: 'BUDDY 2.0 Vision Evaluation',
    exportDate: new Date().toISOString(),
    totalEntries: inMemoryFeedback.length,
    metrics: getFeedbackStatistics(),
    records: [...inMemoryFeedback],
  };
}

/**
 * Resets recorded feedback for a fresh testing session.
 */
export function clearFeedbackHistory() {
  inMemoryFeedback = [];
}

export const clearFeedbackData = clearFeedbackHistory;
