import React from 'react';
import { Camera, AlertTriangle, RefreshCw, Eye } from 'lucide-react';
import { DetectionOverlay } from './DetectionOverlay.jsx';

export function CameraPreview({
  videoRef,
  isStreaming,
  isLoading,
  error,
  sceneData,
  isPaused,
  isMirrored,
  fps,
  lightingCondition = null,
  showHandRois = false,
  onStartCamera,
  onRetry,
}) {
  const peopleCount = sceneData?.peopleCount || 0;
  const objectCount = sceneData?.objects?.length || 0;

  return (
    <div className="vision-camera-preview-container">
      {/* HUD Metrics Header */}
      <div className="vision-hud-bar">
        <div className="hud-badge status-badge">
          <span
            className={`status-dot ${isStreaming ? (isPaused ? 'dot-paused' : 'dot-active') : 'dot-offline'}`}
          />
          <span className="hud-label">
            {isStreaming ? (isPaused ? 'PAUSED' : 'LIVE VISION') : 'STANDBY'}
          </span>
        </div>

        {isStreaming && (
          <div className="hud-counters-group">
            <div className="hud-badge people-badge" title="Number of detected people in frame">
              <span className="hud-icon">👥</span>
              <span className="hud-val">{peopleCount}</span>
              <span className="hud-tag">{peopleCount === 1 ? 'Person' : 'People'}</span>
            </div>

            <div className="hud-badge objects-badge" title="Detected everyday items">
              <span className="hud-icon">📦</span>
              <span className="hud-val">{objectCount}</span>
              <span className="hud-tag">{objectCount === 1 ? 'Object' : 'Objects'}</span>
            </div>

            <div className="hud-badge fps-badge" title="Inference rate">
              <span className="hud-icon">⚡</span>
              <span className="hud-val">{fps}</span>
              <span className="hud-tag">FPS</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Video Viewport */}
      <div className="vision-video-viewport">
        {/* The Live Video Element */}
        <video
          ref={videoRef}
          className={`vision-video-element ${isMirrored ? 'mirrored' : ''}`}
          playsInline
          muted
          autoPlay
          style={{ display: isStreaming ? 'block' : 'none' }}
        />

        {/* Real-time Canvas Detection Overlay */}
        {isStreaming && (
          <DetectionOverlay
            videoRef={videoRef}
            sceneData={sceneData}
            isPaused={isPaused}
            isMirrored={isMirrored}
            isStreaming={isStreaming}
            showHandRois={showHandRois}
          />
        )}

        {/* Ambient Lighting / Glare Warning Banner */}
        {isStreaming && lightingCondition?.message && (
          <div className="vision-lighting-warning-banner" role="status">
            <AlertTriangle size={14} className="lighting-warn-icon" />
            <span>{lightingCondition.message}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="vision-camera-overlay-state">
            <div className="vision-spinner" />
            <p className="vision-state-msg">Connecting to camera sensor...</p>
          </div>
        )}

        {/* Permission Denied / Device Error Screen */}
        {error && (
          <div className="vision-camera-overlay-state vision-error-state">
            <AlertTriangle size={36} className="state-icon-warning" />
            <h4 className="error-title">Camera Notice</h4>
            <p className="error-text">{error.message || 'Unable to access camera.'}</p>
            {onRetry && (
              <button className="vision-btn-retry" onClick={onRetry}>
                <RefreshCw size={16} /> Try Again
              </button>
            )}
          </div>
        )}

        {/* Camera Off / Standby Screen */}
        {!isStreaming && !isLoading && !error && (
          <div className="vision-camera-standby-state">
            <div className="standby-icon-halo">
              <Camera size={44} />
            </div>
            <h3>BUDDY AI Vision Ready</h3>
            <p className="standby-desc">
              Detect students, teachers, and classroom items in real time. Ask BUDDY questions about what it sees!
            </p>
            <div className="standby-privacy-pill">
              <span>🔒 100% Private On-Device Detection. Video is never streamed to external servers.</span>
            </div>
            <button className="vision-btn-primary-start" onClick={onStartCamera}>
              <Eye size={18} />
              <span>Start Camera & Vision</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
