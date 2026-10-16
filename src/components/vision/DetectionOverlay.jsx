import React, { useRef, useEffect } from 'react';
import { getClassIcon, CONFIDENCE_STATES } from '../../services/visionService.js';

/**
 * High-performance canvas overlay that maps AI detections onto the video preview.
 * - Accurately scales bounding box coordinates to CSS dimensions.
 * - Handles mirrored selfie-camera transforms without coordinate drift.
 * - Renders futuristic cyberpunk HUD styling matching BUDDY aesthetics.
 * - Displays calibrated confidence states and Watch Candidate inspect indicators.
 */
export function DetectionOverlay({
  videoRef,
  sceneData,
  isPaused,
  isMirrored = true,
  isStreaming = false,
  showHandRois = false,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to match display size
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    if (!isStreaming || !sceneData) {
      ctx.restore();
      return;
    }

    const videoWidth = video.videoWidth || 640;
    const videoHeight = video.videoHeight || 480;

    // Calculate scale factor between video intrinsic coordinates and canvas client coordinates
    const scaleX = displayWidth / videoWidth;
    const scaleY = displayHeight / videoHeight;

    const { people = [], objects = [], handProposals = [] } = sceneData;

    // Helper to calculate screen coordinate considering mirrored selfie mode
    const getScreenX = (rawX, rawW) => {
      if (isMirrored) {
        // Mirrored coordinate: invert X
        return displayWidth - (rawX + rawW) * scaleX;
      }
      return rawX * scaleX;
    };

    // 0. Optional: Draw Hand/Wrist Region Proposals
    if (showHandRois && handProposals.length > 0) {
      handProposals.forEach((roi) => {
        const [rx, ry, rw, rh] = roi.bbox;
        const sx = getScreenX(rx, rw);
        const sy = ry * scaleY;
        const sw = rw * scaleX;
        const sh = rh * scaleY;

        ctx.save();
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(sx, sy, sw, sh);

        ctx.font = '500 9px "Space Grotesk", sans-serif';
        ctx.fillStyle = 'rgba(0, 242, 254, 0.7)';
        ctx.fillText(roi.source === 'roi_wrist' ? '🎯 Wrist ROI' : '🎯 Hand ROI', sx + 3, sy + 10);
        ctx.restore();
      });
    }

    // 1. Draw People Bounding Boxes (Neon Cyan)
    people.forEach((person) => {
      const [bx, by, bw, bh] = person.bbox;
      const sx = getScreenX(bx, bw);
      const sy = by * scaleY;
      const sw = bw * scaleX;
      const sh = bh * scaleY;

      // Glow effect
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 12;

      // Main box outline
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(sx, sy, sw, sh);

      // Corner tech accents
      const cornerLen = Math.min(20, sw * 0.25, sh * 0.25);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffffff';

      // Top-left
      ctx.beginPath();
      ctx.moveTo(sx, sy + cornerLen);
      ctx.lineTo(sx, sy);
      ctx.lineTo(sx + cornerLen, sy);
      ctx.stroke();

      // Top-right
      ctx.beginPath();
      ctx.moveTo(sx + sw - cornerLen, sy);
      ctx.lineTo(sx + sw, sy);
      ctx.lineTo(sx + sw, sy + cornerLen);
      ctx.stroke();

      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(sx, sy + sh - cornerLen);
      ctx.lineTo(sx, sy + sh);
      ctx.lineTo(sx + cornerLen, sy + sh);
      ctx.stroke();

      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(sx + sw - cornerLen, sy + sh);
      ctx.lineTo(sx + sw, sy + sh);
      ctx.lineTo(sx + sw, sy + sh - cornerLen);
      ctx.stroke();

      // Person Label Pill
      ctx.shadowBlur = 0;
      const labelText = `👤 ${person.label} (${Math.round(person.score * 100)}%)`;
      ctx.font = '600 12px "Space Grotesk", sans-serif';
      const textMetrics = ctx.measureText(labelText);
      const pillWidth = textMetrics.width + 16;
      const pillHeight = 22;

      ctx.fillStyle = 'rgba(0, 242, 254, 0.9)';
      ctx.beginPath();
      ctx.roundRect(sx, Math.max(0, sy - pillHeight - 4), pillWidth, pillHeight, 6);
      ctx.fill();

      ctx.fillStyle = '#050714';
      ctx.fillText(labelText, sx + 8, Math.max(15, sy - 8));
    });

    // 2. Draw Object Bounding Boxes & Association Lines
    objects.forEach((obj) => {
      const [bx, by, bw, bh] = obj.bbox;
      const sx = getScreenX(bx, bw);
      const sy = by * scaleY;
      const sw = bw * scaleX;
      const sh = bh * scaleY;

      const isHeld = obj.relationship === 'held';
      const isNear = obj.relationship === 'near';
      const isWatch = Boolean(obj.isWatchCandidate);

      // Palette:
      // Watch candidate: Amber/Gold with high glow (#ffb703)
      // Confirmed held: Amber/Gold (#ffb703)
      // Confirmed free: Emerald (#00f59b)
      // Possible / Near: Electric Violet (#e100ff)
      // Unclear: Soft Gray/Orange (#f97316)
      let themeColor = '#00f59b';
      let pillBg = 'rgba(0, 245, 155, 0.9)';

      if (isWatch) {
        themeColor = '#ffb703';
        pillBg = 'rgba(255, 183, 3, 0.95)';
      } else if (obj.confidenceState === CONFIDENCE_STATES.UNCLEAR) {
        themeColor = '#f97316';
        pillBg = 'rgba(249, 115, 22, 0.92)';
      } else if (isHeld) {
        themeColor = '#ffb703';
        pillBg = 'rgba(255, 183, 3, 0.92)';
      } else if (isNear || obj.confidenceState === CONFIDENCE_STATES.POSSIBLE) {
        themeColor = '#e100ff';
        pillBg = 'rgba(225, 0, 255, 0.88)';
      }

      const icon = isWatch ? '⌚' : getClassIcon(obj.class);

      // If held, draw connection line to the associated person
      if (isHeld && obj.associatedPerson) {
        const person = people.find((p) => p.label === obj.associatedPerson);
        if (person) {
          const [px, py, pw, ph] = person.bbox;
          const psx = getScreenX(px, pw) + (pw * scaleX) / 2;
          const psy = (py + ph * 0.6) * scaleY; // torso/hand connection anchor
          const objCenterX = sx + sw / 2;
          const objCenterY = sy + sh / 2;

          ctx.save();
          ctx.strokeStyle = isWatch ? 'rgba(255, 183, 3, 0.85)' : 'rgba(255, 183, 3, 0.7)';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(psx, psy);
          ctx.lineTo(objCenterX, objCenterY);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Box outline
      ctx.shadowColor = themeColor;
      ctx.shadowBlur = isWatch ? 14 : 10;
      ctx.strokeStyle = themeColor;
      ctx.lineWidth = isWatch ? 3 : isHeld ? 2.5 : 2;

      if (obj.confidenceState === CONFIDENCE_STATES.UNCLEAR) {
        ctx.setLineDash([4, 4]);
      } else {
        ctx.setLineDash([]);
      }

      ctx.strokeRect(sx, sy, sw, sh);
      ctx.setLineDash([]);

      // Object Label Pill
      ctx.shadowBlur = 0;
      let labelText = '';

      if (isWatch) {
        labelText = `⌚ WATCH CANDIDATE (Inspect)`;
      } else {
        const tagPrefix = isHeld ? '✋ HELD: ' : isNear ? 'NEAR: ' : '';
        const stateSuffix =
          obj.confidenceState === CONFIDENCE_STATES.POSSIBLE
            ? ' [POSSIBLE]'
            : obj.confidenceState === CONFIDENCE_STATES.UNCLEAR
              ? ' [UNCLEAR]'
              : '';
        labelText = `${icon} ${tagPrefix}${obj.class.toUpperCase()} ${Math.round(obj.score * 100)}%${stateSuffix}`;
      }

      ctx.font = '600 11px "Space Grotesk", sans-serif';
      const textMetrics = ctx.measureText(labelText);
      const pillWidth = textMetrics.width + 14;
      const pillHeight = 20;

      ctx.fillStyle = pillBg;
      ctx.beginPath();
      ctx.roundRect(sx, Math.max(0, sy - pillHeight - 3), pillWidth, pillHeight, 5);
      ctx.fill();

      ctx.fillStyle = '#050714';
      ctx.fillText(labelText, sx + 7, Math.max(14, sy - 8));
    });

    // 3. Paused Watermark Overlay
    if (isPaused) {
      ctx.fillStyle = 'rgba(5, 7, 20, 0.45)';
      ctx.fillRect(0, 0, displayWidth, displayHeight);

      ctx.fillStyle = 'rgba(255, 183, 3, 0.95)';
      ctx.font = '700 16px "Outfit", sans-serif';
      const pauseText = '⏸ DETECTION PAUSED';
      const textWidth = ctx.measureText(pauseText).width;
      ctx.fillText(pauseText, (displayWidth - textWidth) / 2, displayHeight / 2);
    }

    ctx.restore();
  }, [videoRef, sceneData, isPaused, isMirrored, isStreaming, showHandRois]);

  return (
    <canvas
      ref={canvasRef}
      className="vision-detection-canvas"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  );
}
