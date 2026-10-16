import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Hook for secure, on-demand webcam lifecycle management.
 * - Guarantees camera tracks are stopped immediately upon closing/unmounting.
 * - Prevents redundant streams.
 * - Provides high-performance off-screen canvas frame snapshots for VQA.
 */
export function useCamera() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' (selfie) or 'environment'
  const [hasPermission, setHasPermission] = useState(null);
  const [devices, setDevices] = useState([]);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Enumerate video devices if permitted
  const enumerateDevices = useCallback(async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevs = allDevices.filter((d) => d.kind === 'videoinput');
        setDevices(videoDevs);
      }
    } catch {
      // Ignored if permissions not yet granted
    }
  }, []);

  // Stop all active camera tracks and release the hardware sensor
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsStreaming(false);
    setIsLoading(false);
  }, []);

  // Start camera stream on explicit user action
  const startCamera = useCallback(
    async (mode = facingMode) => {
      // Clean up any existing stream before starting a new one
      stopCamera();
      setIsLoading(true);
      setError(null);

      // Check browser getUserMedia support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsLoading(false);
        setError({
          type: 'UNSUPPORTED',
          message: 'Camera API (getUserMedia) is not supported in this browser. Please use a modern browser like Chrome, Edge, or Firefox.',
        });
        return;
      }

      // Constraints with graceful fallbacks
      const constraints = {
        audio: false,
        video: {
          facingMode: mode,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
        },
      };

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current
              .play()
              .then(() => {
                setIsStreaming(true);
                setIsLoading(false);
                setHasPermission(true);
                enumerateDevices();
              })
              .catch((playErr) => {
                console.warn('Video play interrupted:', playErr);
                setIsStreaming(true);
                setIsLoading(false);
              });
          };
        } else {
          setIsStreaming(true);
          setIsLoading(false);
          setHasPermission(true);
        }
      } catch (err) {
        console.error('Webcam getUserMedia error:', err);
        setIsLoading(false);
        setIsStreaming(false);

        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setHasPermission(false);
          setError({
            type: 'PERMISSION_DENIED',
            message: 'Camera permission was denied. Please click the camera icon in your browser URL bar to allow camera access.',
          });
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError({
            type: 'NO_CAMERA',
            message: 'No camera hardware found on this computer. Please connect a USB webcam or enable your laptop camera.',
          });
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setError({
            type: 'CAMERA_BUSY',
            message: 'Your camera is currently in use by another app (e.g. Zoom, Teams, or another tab). Please close other apps and try again.',
          });
        } else if (err.name === 'OverconstrainedError') {
          // Retry with minimal constraints
          try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            streamRef.current = fallbackStream;
            if (videoRef.current) {
              videoRef.current.srcObject = fallbackStream;
              await videoRef.current.play();
              setIsStreaming(true);
              setIsLoading(false);
              setHasPermission(true);
              return;
            }
          } catch (retryErr) {
            setError({
              type: 'CONSTRAINT_ERROR',
              message: `Could not initialize camera with requested settings: ${retryErr.message}`,
            });
          }
        } else {
          setError({
            type: 'UNKNOWN',
            message: `Could not access camera: ${err.message || 'Unknown device error'}`,
          });
        }
      }
    },
    [facingMode, stopCamera, enumerateDevices]
  );

  // Lighting condition state
  const [lightingCondition, setLightingCondition] = useState({
    isLowLight: false,
    isOverexposed: false,
    avgLuminance: 128,
    message: null,
  });

  // Evaluate ambient lighting condition from video frames
  const checkLightingCondition = useCallback(() => {
    const video = videoRef.current;
    if (!video || !isStreaming || video.readyState < 2) return null;

    try {
      const sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = 64;
      sampleCanvas.height = 48;
      const ctx = sampleCanvas.getContext('2d');
      if (!ctx) return null;

      ctx.drawImage(video, 0, 0, 64, 48);
      const imgData = ctx.getImageData(0, 0, 64, 48);
      const data = imgData.data;

      let totalLum = 0;
      const count = data.length / 4;
      for (let i = 0; i < data.length; i += 4) {
        totalLum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }
      const avgLum = Math.round(totalLum / count);

      const isLowLight = avgLum < 38;
      const isOverexposed = avgLum > 232;
      const message = isLowLight
        ? '⚠️ Ambient lighting is dark. Please increase room lighting or hold the object closer to the camera.'
        : isOverexposed
          ? '⚠️ Camera has strong glare or overexposure. Adjust angle away from direct backlight.'
          : null;

      const condition = {
        isLowLight,
        isOverexposed,
        avgLuminance: avgLum,
        message,
      };

      setLightingCondition(condition);
      return condition;
    } catch {
      return null;
    }
  }, [isStreaming]);

  // Periodic lighting check every 2 seconds during active streaming
  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      checkLightingCondition();
    }, 2000);
    return () => clearInterval(interval);
  }, [isStreaming, checkLightingCondition]);

  // Switch camera facing mode (front selfie vs rear/external)
  const toggleFacingMode = useCallback(() => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    if (isStreaming) {
      startCamera(nextMode);
    }
  }, [facingMode, isStreaming, startCamera]);

  // Capture a single frame (or an enlarged ROI crop) from the live video stream as base64 JPEG
  const captureFrame = useCallback((options = {}) => {
    const { quality = 0.88, maxWidth = 960, crop = null } = options;
    const video = videoRef.current;

    if (!video || !isStreaming || video.readyState < 2) {
      return null;
    }

    const intrinsicWidth = video.videoWidth || 640;
    const intrinsicHeight = video.videoHeight || 480;

    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = intrinsicWidth;
    let sourceHeight = intrinsicHeight;

    if (Array.isArray(crop) && crop.length === 4) {
      sourceX = Math.max(0, Math.min(intrinsicWidth - 10, crop[0]));
      sourceY = Math.max(0, Math.min(intrinsicHeight - 10, crop[1]));
      sourceWidth = Math.max(10, Math.min(intrinsicWidth - sourceX, crop[2]));
      sourceHeight = Math.max(10, Math.min(intrinsicHeight - sourceY, crop[3]));
    }

    // Scale target if larger than maxWidth while strictly preserving aspect ratio
    let targetWidth = sourceWidth;
    let targetHeight = sourceHeight;
    if (sourceWidth > maxWidth) {
      const scale = maxWidth / sourceWidth;
      targetWidth = Math.round(sourceWidth * scale);
      targetHeight = Math.round(sourceHeight * scale);
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    // Draw full frame or cropped region cleanly onto off-screen canvas
    ctx.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, targetWidth, targetHeight);

    // Export as high-quality base64 data URL
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    return {
      dataUrl,
      width: targetWidth,
      height: targetHeight,
      canvas,
      crop: crop ? [sourceX, sourceY, sourceWidth, sourceHeight] : null,
      isCropped: Boolean(crop),
      timestamp: Date.now(),
    };
  }, [isStreaming]);

  // Ensure all camera hardware tracks are stopped when the component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    isStreaming,
    isLoading,
    error,
    hasPermission,
    facingMode,
    devices,
    lightingCondition,
    startCamera,
    stopCamera,
    toggleFacingMode,
    captureFrame,
    checkLightingCondition,
    clearError: () => setError(null),
  };
}
