import { useState, useEffect, useRef, useCallback } from 'react';
import { associateDetections, TemporalPredictionTracker } from '../services/visionService.js';

// Cache for loaded TensorFlow COCO-SSD models keyed by base model
const modelCache = {
  lite_mobilenet_v2: null,
  mobilenet_v2: null,
};
const modelPromiseCache = {
  lite_mobilenet_v2: null,
  mobilenet_v2: null,
};

/**
 * Dynamically loads an external script tag safely if not already present.
 */
function loadScript(src, id) {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      return resolve();
    }
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = (_err) => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

/**
 * Initializes TensorFlow.js and COCO-SSD asynchronously for the requested model tier.
 * @param {'lite_mobilenet_v2' | 'mobilenet_v2'} baseModel
 * @param {Function} [onProgress]
 */
async function getOrInitDetectorModel(baseModel = 'lite_mobilenet_v2', onProgress) {
  if (modelCache[baseModel]) return modelCache[baseModel];
  if (modelPromiseCache[baseModel]) return modelPromiseCache[baseModel];

  modelPromiseCache[baseModel] = (async () => {
    try {
      if (onProgress) onProgress('Loading TensorFlow.js runtime...');
      if (!window.tf) {
        await loadScript(
          'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js',
          'tfjs-script'
        );
      }

      // Check and set best available backend (WebGL with CPU fallback)
      if (window.tf) {
        try {
          await window.tf.setBackend('webgl');
          await window.tf.ready();
        } catch (backendErr) {
          console.warn('WebGL backend unavailable, falling back to CPU:', backendErr);
          try {
            await window.tf.setBackend('cpu');
            await window.tf.ready();
          } catch {}
        }
      }

      if (onProgress) {
        const tierName = baseModel === 'mobilenet_v2' ? 'High-Accuracy MobileNet V2' : 'Fast MobileNet V2 Lite';
        onProgress(`Loading ${tierName} neural weights...`);
      }

      if (!window.cocoSsd) {
        await loadScript(
          'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js',
          'coco-ssd-script'
        );
      }

      if (!window.cocoSsd || !window.cocoSsd.load) {
        throw new Error('COCO-SSD library failed to initialize on window object.');
      }

      const model = await window.cocoSsd.load({
        base: baseModel,
      });

      modelCache[baseModel] = model;
      if (onProgress) onProgress('Model ready! ⚡');
      return model;
    } catch (err) {
      modelPromiseCache[baseModel] = null;
      throw err;
    }
  })();

  return modelPromiseCache[baseModel];
}

export const PERFORMANCE_PRESETS = {
  eco: { interval: 350, label: 'Eco / Battery (3 FPS)' },
  balanced: { interval: 160, label: 'Balanced (6 FPS)' },
  fast: { interval: 80, label: 'Fast (12 FPS)' },
};

/**
 * Custom hook to run scheduled, non-overlapping COCO-SSD object and human detection.
 * Incorporates TemporalPredictionTracker for coordinate smoothing and flicker elimination.
 */
export function useObjectDetection({ videoRef, isStreaming, onDetectionUpdate }) {
  const [modelTier, setModelTier] = useState('lite'); // 'lite' (lite_mobilenet_v2) or 'standard' (mobilenet_v2)
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [modelError, setModelError] = useState(null);

  const [isPaused, setIsPaused] = useState(false);
  const [performanceMode, setPerformanceMode] = useState('balanced');
  const [fps, setFps] = useState(0);

  const [rawDetections, setRawDetections] = useState([]);
  const [sceneData, setSceneData] = useState(() => associateDetections([]));

  const isInferringRef = useRef(false);
  const animationFrameIdRef = useRef(null);
  const lastInferenceTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastFpsCalcTimeRef = useRef(0);
  const isMountedRef = useRef(true);

  // Temporal Tracker to eliminate label flicker and smooth bounding boxes
  const trackerRef = useRef(new TemporalPredictionTracker({ alpha: 0.65, minHits: 2, maxAge: 5 }));

  const activeModelBase = modelTier === 'standard' ? 'mobilenet_v2' : 'lite_mobilenet_v2';
  const activeModelRef = useRef(null);

  // Initialize model on demand or when tier changes
  const initModel = useCallback(async (tierOverride) => {
    const targetTier = tierOverride || modelTier;
    const base = targetTier === 'standard' ? 'mobilenet_v2' : 'lite_mobilenet_v2';

    if (modelCache[base]) {
      activeModelRef.current = modelCache[base];
      setIsModelReady(true);
      return modelCache[base];
    }

    setIsModelLoading(true);
    setModelError(null);
    try {
      const model = await getOrInitDetectorModel(base, (status) => {
        if (isMountedRef.current) setLoadingStatus(status);
      });
      if (isMountedRef.current) {
        activeModelRef.current = model;
        setIsModelReady(true);
        setIsModelLoading(false);
        setLoadingStatus('');
      }
      return model;
    } catch (err) {
      console.error(`Failed to load COCO-SSD model (${base}):`, err);
      if (isMountedRef.current) {
        setIsModelLoading(false);
        setModelError(
          'Could not load the vision AI model. Please check your internet connection and refresh.'
        );
      }
      return null;
    }
  }, [modelTier]);

  // Handle switching model tier
  const handleSetModelTier = useCallback((newTier) => {
    setModelTier(newTier);
    setIsModelReady(Boolean(modelCache[newTier === 'standard' ? 'mobilenet_v2' : 'lite_mobilenet_v2']));
    initModel(newTier);
  }, [initModel]);

  // Reset tracker when paused or stopped
  useEffect(() => {
    if (isPaused || !isStreaming) {
      trackerRef.current.reset();
    }
  }, [isPaused, isStreaming]);

  // Inference loop using requestAnimationFrame + interval throttling + non-overlapping guard
  useEffect(() => {
    isMountedRef.current = true;
    const currentModel = activeModelRef.current || modelCache[activeModelBase];
    if (!isStreaming || !isModelReady || isPaused || !currentModel) {
      return;
    }

    const interval = PERFORMANCE_PRESETS[performanceMode]?.interval || 160;

    const detectLoop = async () => {
      const now = performance.now();

      // FPS calculation every 1 second
      if (lastFpsCalcTimeRef.current === 0) {
        lastFpsCalcTimeRef.current = now;
      } else if (now - lastFpsCalcTimeRef.current >= 1000) {
        const measuredFps = Math.round(
          (frameCountRef.current * 1000) / (now - lastFpsCalcTimeRef.current)
        );
        if (isMountedRef.current) setFps(measuredFps);
        frameCountRef.current = 0;
        lastFpsCalcTimeRef.current = now;
      }

      // Check if enough time has passed and previous inference is finished
      if (now - lastInferenceTimeRef.current >= interval && !isInferringRef.current) {
        const video = videoRef.current;
        if (video && video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
          isInferringRef.current = true;
          lastInferenceTimeRef.current = now;

          try {
            // Run browser-side COCO-SSD inference with a low detector threshold (0.22)
            // so calibrated class thresholds (e.g. book: 0.30) are not cut off prematurely
            const rawPredictions = await currentModel.detect(video, 16, 0.22);

            if (isMountedRef.current) {
              frameCountRef.current += 1;

              // Pass raw predictions through Temporal Prediction Tracker to smooth coordinates
              // and eliminate single-frame flicker
              const smoothedPredictions = trackerRef.current.update(rawPredictions);

              // Apply calibrated class thresholds and geometric association
              const associated = associateDetections(smoothedPredictions, { useClassThresholds: true });
              setRawDetections(rawPredictions);
              setSceneData(associated);

              if (onDetectionUpdate) {
                onDetectionUpdate(associated);
              }
            }
          } catch (inferErr) {
            console.warn('Inference frame dropped:', inferErr);
          } finally {
            isInferringRef.current = false;
          }
        }
      }

      if (isMountedRef.current && isStreaming && !isPaused) {
        animationFrameIdRef.current = requestAnimationFrame(detectLoop);
      }
    };

    animationFrameIdRef.current = requestAnimationFrame(detectLoop);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      isInferringRef.current = false;
    };
  }, [isStreaming, isModelReady, isPaused, performanceMode, videoRef, onDetectionUpdate, activeModelBase]);

  // Clean up on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  return {
    isModelLoading,
    isModelReady,
    loadingStatus,
    modelError,
    initModel,
    modelTier,
    setModelTier: handleSetModelTier,
    isPaused,
    togglePause: () => setIsPaused((prev) => !prev),
    pauseDetection: () => setIsPaused(true),
    resumeDetection: () => setIsPaused(false),
    performanceMode,
    setPerformanceMode,
    fps,
    rawDetections,
    sceneData,
    peopleCount: sceneData.peopleCount,
    objectCounts: sceneData.objectCounts,
    resetTracker: () => trackerRef.current.reset(),
  };
}
