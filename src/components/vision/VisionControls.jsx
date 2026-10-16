import React from 'react';
import {
  Camera,
  CameraOff,
  Play,
  Pause,
  Camera as SnapIcon,
  Search,
  FlipHorizontal,
  Sliders,
  RefreshCw,
  Crosshair,
  Cpu,
} from 'lucide-react';

export function VisionControls({
  isStreaming,
  isPaused,
  performanceMode,
  isMirrored,
  devices = [],
  modelTier = 'lite',
  showHandRois = false,
  onStartCamera,
  onStopCamera,
  onTogglePause,
  onCaptureFrame,
  onOpenInspect,
  onToggleMirror,
  onSelectPerformance,
  onSelectModelTier,
  onToggleFacing,
  onToggleHandRois,
}) {
  return (
    <div className="vision-controls-toolbar">
      {/* Primary Camera Power Toggle */}
      {isStreaming ? (
        <button
          id="vision-btn-stop-camera"
          className="vision-ctrl-btn btn-power-stop"
          onClick={onStopCamera}
          title="Turn off webcam and stop camera tracks"
        >
          <CameraOff size={16} />
          <span>Stop Camera</span>
        </button>
      ) : (
        <button
          id="vision-btn-start-camera"
          className="vision-ctrl-btn btn-power-start"
          onClick={onStartCamera}
          title="Turn on webcam"
        >
          <Camera size={16} />
          <span>Start Camera</span>
        </button>
      )}

      {/* Detection Pause / Resume */}
      {isStreaming && (
        <button
          id="vision-btn-toggle-pause"
          className={`vision-ctrl-btn ${isPaused ? 'btn-resume' : 'btn-pause'}`}
          onClick={onTogglePause}
          title={isPaused ? 'Resume AI Detection' : 'Pause AI Detection'}
        >
          {isPaused ? <Play size={16} /> : <Pause size={16} />}
          <span>{isPaused ? 'Resume' : 'Pause'}</span>
        </button>
      )}

      {/* Capture Frame Snapshot */}
      {isStreaming && (
        <button
          id="vision-btn-capture-frame"
          className="vision-ctrl-btn btn-capture-frame"
          onClick={onCaptureFrame}
          title="Capture snapshot for visual question answering"
        >
          <SnapIcon size={16} />
          <span>Capture Frame</span>
        </button>
      )}

      {/* Capture and Inspect / Zoom Mode */}
      {isStreaming && (
        <button
          id="vision-btn-inspect-zoom"
          className="vision-ctrl-btn btn-inspect-zoom"
          onClick={onOpenInspect}
          title="Capture frame and deep inspect small objects, watches, or book covers"
        >
          <Search size={16} />
          <span>Capture & Inspect</span>
        </button>
      )}

      {/* Model Tier Selector (Lite vs Standard MobileNet V2) */}
      <div className="vision-ctrl-group model-tier-group" title="Select Detector Model Architecture">
        <Cpu size={14} className="group-icon" />
        <select
          id="vision-model-tier-select"
          className="vision-select"
          value={modelTier}
          onChange={(e) => onSelectModelTier && onSelectModelTier(e.target.value)}
          aria-label="Select Vision Model Tier"
        >
          <option value="lite">⚡ MobileNet V2 Lite (Fast)</option>
          <option value="standard">🎯 Full MobileNet V2 (Accurate)</option>
        </select>
      </div>

      {/* Performance / FPS Throttle Preset */}
      <div className="vision-ctrl-group performance-group" title="Adjust AI Detection Speed & Battery Impact">
        <Sliders size={14} className="group-icon" />
        <select
          id="vision-perf-mode-select"
          className="vision-select"
          value={performanceMode}
          onChange={(e) => onSelectPerformance(e.target.value)}
          aria-label="Select Vision Inference Performance"
        >
          <option value="eco">🌱 Eco (3 FPS)</option>
          <option value="balanced">⚡ Balanced (6 FPS)</option>
          <option value="fast">🚀 Fast (12 FPS)</option>
        </select>
      </div>

      {/* Hand/Wrist ROI Target Proposals Toggle */}
      {isStreaming && (
        <button
          id="vision-btn-toggle-rois"
          className={`vision-icon-btn ${showHandRois ? 'active' : ''}`}
          onClick={onToggleHandRois}
          title={showHandRois ? 'Hide Hand Target ROIs' : 'Show Hand/Wrist Target ROIs'}
          aria-label="Toggle Hand and Wrist Region of Interest targets"
        >
          <Crosshair size={17} />
        </button>
      )}

      {/* Mirror Camera Flip */}
      {isStreaming && (
        <button
          id="vision-btn-toggle-mirror"
          className={`vision-icon-btn ${isMirrored ? 'active' : ''}`}
          onClick={onToggleMirror}
          title={isMirrored ? 'Selfie Flip On' : 'Selfie Flip Off'}
          aria-label="Toggle selfie mirror"
        >
          <FlipHorizontal size={17} />
        </button>
      )}

      {/* Camera Switcher (if multiple cameras detected) */}
      {isStreaming && devices.length > 1 && (
        <button
          id="vision-btn-switch-camera"
          className="vision-icon-btn"
          onClick={onToggleFacing}
          title="Switch front/back camera"
          aria-label="Switch camera device"
        >
          <RefreshCw size={16} />
        </button>
      )}
    </div>
  );
}
