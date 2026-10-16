import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Eye,
  Sparkles,
  Send,
  Volume2,
  AlertCircle,
  ShieldCheck,
  Zap,
  Search,
  ThumbsUp,
  ThumbsDown,
  Download,
  Sun,
  CheckCircle2,
} from 'lucide-react';
import { CameraPreview } from './CameraPreview.jsx';
import { VisionControls } from './VisionControls.jsx';
import { useCamera } from '../../hooks/useCamera.js';
import { useObjectDetection } from '../../hooks/useObjectDetection.js';
import { answerDetectionQuery, getClassIcon } from '../../services/visionService.js';
import {
  buildInspectionPrompt,
  classifyWatchCrop,
  classifyBookCrop,
} from '../../services/watchRecognitionService.js';
import {
  recordDetectionFeedback,
  getFeedbackStatistics,
  getExportableFeedbackDataset,
} from '../../services/feedbackService.js';
import { sendMessageToBuddy } from '../../services/conversationService.js';
import { CHARACTER_STATES } from '../../utils/characterStates.js';
import { getLanguageConfig } from '../../utils/languages.js';

export function BuddyVision({
  isOpen,
  onClose,
  language = 'en',
  personality = 'playful',
  visitorName = '',
  onBuddySpeak,
  onUpdateCharacterState,
  onAwardXP,
}) {
  const [isMirrored, setIsMirrored] = useState(true);
  const [showHandRois, setShowHandRois] = useState(false);
  const [capturedSnapshot, setCapturedSnapshot] = useState(null);
  const [userQuery, setUserQuery] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [vqaResponse, setVqaResponse] = useState(null);
  const [vqaError, setVqaError] = useState(null);

  // Second-Stage "Capture & Inspect" State
  const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);
  const [inspectTargetType, setInspectTargetType] = useState('watch'); // 'watch' | 'book' | 'small_object'
  const [selectedRoiId, setSelectedRoiId] = useState('full');
  const [inspectResult, setInspectResult] = useState(null);
  const [isInspecting, setIsInspecting] = useState(false);

  // User Feedback State
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState('');
  const [feedbackCorrectionOpenFor, setFeedbackCorrectionOpenFor] = useState(null);
  const [feedbackTrueLabelInput, setFeedbackTrueLabelInput] = useState('');
  const [feedbackStats, setFeedbackStats] = useState(() => getFeedbackStatistics());

  // Camera stream hook
  const {
    videoRef,
    isStreaming,
    isLoading: isCameraLoading,
    error: cameraError,
    lightingCondition,
    startCamera,
    stopCamera,
    toggleFacingMode,
    captureFrame,
    devices,
  } = useCamera();

  // Object detection inference hook
  const {
    isModelLoading,
    isModelReady,
    loadingStatus,
    modelError,
    initModel,
    modelTier,
    setModelTier,
    isPaused,
    togglePause,
    performanceMode,
    setPerformanceMode,
    fps,
    sceneData,
    peopleCount,
    objectCounts,
  } = useObjectDetection({
    videoRef,
    isStreaming,
  });

  // Start model initialization when vision modal opens
  useEffect(() => {
    if (isOpen) {
      initModel();
      if (onUpdateCharacterState) {
        onUpdateCharacterState(CHARACTER_STATES.CURIOUS);
      }
    }
  }, [isOpen, initModel, onUpdateCharacterState]);

  // Clean up camera immediately on close or unmount
  const handleClose = useCallback(() => {
    stopCamera();
    setCapturedSnapshot(null);
    setVqaResponse(null);
    setVqaError(null);
    setIsInspectModalOpen(false);
    setInspectResult(null);
    if (onUpdateCharacterState) {
      onUpdateCharacterState(CHARACTER_STATES.IDLE);
    }
    onClose();
  }, [stopCamera, onClose, onUpdateCharacterState]);

  // Quick Action: Capture snapshot from the live video
  const handleCaptureSnapshot = useCallback(() => {
    if (!isStreaming) return;
    const snap = captureFrame({ quality: 0.88, maxWidth: 840 });
    if (snap) {
      setCapturedSnapshot(snap);
      if (onAwardXP) onAwardXP(5);
    }
  }, [isStreaming, captureFrame, onAwardXP]);

  // Open "Capture & Inspect" Zoom Mode
  const handleOpenInspect = useCallback(
    (suggestedTarget = 'watch', roiId = 'full') => {
      if (!isStreaming) return;
      setSelectedRoiId(roiId);
      setInspectTargetType(suggestedTarget);

      let cropBox = null;
      if (roiId !== 'full') {
        if (roiId === 'candidate') {
          const candidate =
            suggestedTarget === 'watch'
              ? sceneData?.objects?.find((o) => o.isWatchCandidate)
              : sceneData?.objects?.find((o) => o.class === 'book');
          if (candidate?.bbox) cropBox = candidate.bbox;
        } else {
          const roi = sceneData?.handProposals?.find((p) => p.id === roiId);
          if (roi?.bbox) cropBox = roi.bbox;
        }
      }

      const snap = captureFrame({ quality: 0.94, maxWidth: 1024, crop: cropBox });
      if (snap) {
        setCapturedSnapshot(snap);
        setIsInspectModalOpen(true);

        // Run local classifier immediately on crop
        let localEval = null;
        if (suggestedTarget === 'watch') {
          localEval = classifyWatchCrop(snap.canvas);
        } else if (suggestedTarget === 'book') {
          localEval = classifyBookCrop(snap.canvas);
        }

        const candidateObj =
          suggestedTarget === 'watch'
            ? sceneData?.objects?.find((o) => o.isWatchCandidate)
            : sceneData?.objects?.find((o) => o.class === 'book');

        const detClass =
          candidateObj?.class || (suggestedTarget === 'watch' ? 'unsupported_in_stage1' : 'none');
        const detScore = candidateObj?.score || 0;

        setInspectResult({
          targetType: suggestedTarget,
          roiId,
          detectorStage: {
            class:
              detClass === 'unsupported_in_stage1'
                ? 'Unsupported in Stage 1 Detector (No COCO Watch class)'
                : detClass,
            confidence: detScore ? `${Math.round(detScore * 100)}%` : 'N/A',
            note:
              suggestedTarget === 'watch'
                ? 'COCO-SSD only supports clocks, not wristwatches.'
                : 'COCO-SSD lightweight detector.',
          },
          localClassifier: localEval,
          visualStage: null,
          timestamp: Date.now(),
        });

        if (onUpdateCharacterState) {
          onUpdateCharacterState(CHARACTER_STATES.CURIOUS);
        }
      }
    },
    [isStreaming, captureFrame, sceneData, onUpdateCharacterState]
  );

  // Switch inspection ROI or zoom region
  const handleSelectRoi = useCallback(
    (roiId) => {
      setSelectedRoiId(roiId);
      let cropBox = null;
      if (roiId === 'candidate') {
        const candidate =
          inspectTargetType === 'watch'
            ? sceneData?.objects?.find((o) => o.isWatchCandidate)
            : sceneData?.objects?.find((o) => o.class === 'book');
        if (candidate?.bbox) cropBox = candidate.bbox;
      } else if (roiId !== 'full') {
        const roi = sceneData?.handProposals?.find((p) => p.id === roiId);
        if (roi?.bbox) cropBox = roi.bbox;
      }

      const snap = captureFrame({ quality: 0.94, maxWidth: 1024, crop: cropBox });
      if (snap) {
        setCapturedSnapshot(snap);
        let localEval = null;
        if (inspectTargetType === 'watch') {
          localEval = classifyWatchCrop(snap.canvas);
        } else if (inspectTargetType === 'book') {
          localEval = classifyBookCrop(snap.canvas);
        }

        setInspectResult((prev) => ({
          ...prev,
          roiId,
          localClassifier: localEval,
          visualStage: null,
        }));
      }
    },
    [captureFrame, inspectTargetType, sceneData]
  );

  // Execute Second-Stage Visual Deep Inspection
  const handleRunDeepInspect = useCallback(async () => {
    if (!capturedSnapshot?.dataUrl) return;

    setIsInspecting(true);
    setVqaError(null);

    if (onUpdateCharacterState) {
      onUpdateCharacterState(CHARACTER_STATES.THINKING);
    }

    try {
      // Find candidate detector evidence if available
      const watchCandidate = sceneData?.objects?.find((o) => o.isWatchCandidate);
      const bookCandidate = sceneData?.objects?.find((o) => o.class === 'book');
      const targetObj = inspectTargetType === 'watch' ? watchCandidate : bookCandidate;

      const detectorPrediction =
        targetObj?.class || (inspectTargetType === 'watch' ? 'unsupported_in_stage1' : 'unspecified');
      const detectorConfidence = targetObj?.score || 0;

      // Build structured prompt for second-stage visual recognition
      const prompt = buildInspectionPrompt(inspectTargetType, {
        detectorPrediction,
        detectorConfidence,
        contextText: sceneData?.sceneContextText || '',
      });

      // Send to multi-modal vision-capable backend
      const response = await sendMessageToBuddy(prompt, {
        personality,
        language,
        visitorName,
        image: capturedSnapshot.dataUrl,
        visionContext: `Second-stage deep inspection for ${inspectTargetType}. Candidate: ${detectorPrediction}`,
      });

      setIsInspecting(false);

      if (response.isError) {
        setVqaError(response.text);
        if (onUpdateCharacterState) onUpdateCharacterState(CHARACTER_STATES.ERROR);
        return;
      }

      setInspectResult((prev) => ({
        ...prev,
        visualStage: {
          identification: response.text,
          status: 'Analyzed with Stage 2 Visual AI',
        },
        timestamp: Date.now(),
      }));

      if (onUpdateCharacterState) onUpdateCharacterState(CHARACTER_STATES.HAPPY);
      if (onBuddySpeak) onBuddySpeak(response.text, language);
      if (onAwardXP) onAwardXP(20);
    } catch (err) {
      setIsInspecting(false);
      setVqaError(err.message || 'Inspection failed.');
      if (onUpdateCharacterState) onUpdateCharacterState(CHARACTER_STATES.ERROR);
    }
  }, [
    capturedSnapshot,
    inspectTargetType,
    sceneData,
    personality,
    language,
    visitorName,
    onUpdateCharacterState,
    onBuddySpeak,
    onAwardXP,
  ]);

  // Handle User Prediction Feedback (Correct / Incorrect / Not Sure)
  const handleProvideFeedback = useCallback(
    (item, feedbackType, trueLabel = null) => {
      recordDetectionFeedback({
        predictedClass: item.class || item.displayLabel || inspectTargetType,
        confidence: item.score || 0,
        feedback: feedbackType,
        trueLabel: trueLabel || (feedbackType === 'correct' ? item.class : null),
        relationship: item.relationship || 'independent',
        confidenceState: item.confidenceState || 'unknown',
        stage: item.stage || 'stage1_detector',
      });

      setFeedbackStats(getFeedbackStatistics());
      setFeedbackCorrectionOpenFor(null);
      setFeedbackTrueLabelInput('');
      setFeedbackSuccessMsg(
        feedbackType === 'correct'
          ? '✓ Thank you! Verified as correct.'
          : feedbackType === 'incorrect'
            ? `✓ Feedback recorded (True label: ${trueLabel || 'Unknown'}).`
            : '✓ Feedback recorded.'
      );

      setTimeout(() => setFeedbackSuccessMsg(''), 3000);
      if (onAwardXP) onAwardXP(2);
    },
    [inspectTargetType, onAwardXP]
  );

  // Handle Export Feedback Dataset
  const handleExportFeedback = useCallback(() => {
    const dataset = getExportableFeedbackDataset();
    const blob = new Blob([JSON.stringify(dataset, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buddy_vision_feedback_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Handle asking a visual question (combining Mode A real-time heuristic & Mode B deep vision VQA)
  const handleAskQuestion = useCallback(
    async (customText) => {
      const queryText = (customText || userQuery || '').trim();
      if (!queryText) return;

      setUserQuery('');
      setIsAsking(true);
      setVqaError(null);

      if (onUpdateCharacterState) {
        onUpdateCharacterState(CHARACTER_STATES.THINKING);
      }

      try {
        // Mode A Check: Can this query be accurately resolved directly from real-time detection results?
        const modeAResult = answerDetectionQuery(queryText, sceneData, language);

        if (modeAResult.matched) {
          const reply = {
            text: modeAResult.text,
            expression: modeAResult.expression || CHARACTER_STATES.HAPPY,
            mode: 'Real-Time Detections (Local Mode A)',
            timestamp: Date.now(),
          };

          setVqaResponse(reply);
          setIsAsking(false);

          if (onUpdateCharacterState) onUpdateCharacterState(reply.expression);
          if (onBuddySpeak) onBuddySpeak(reply.text, language);
          if (onAwardXP) onAwardXP(10);
          return;
        }

        // Mode B: Deep Visual Question Answering via Vision-capable LLM
        let frameToSend = capturedSnapshot?.dataUrl;
        if (!frameToSend && isStreaming) {
          const autoSnap = captureFrame({ quality: 0.82, maxWidth: 800 });
          if (autoSnap) {
            setCapturedSnapshot(autoSnap);
            frameToSend = autoSnap.dataUrl;
          }
        }

        const aiResponse = await sendMessageToBuddy(queryText, {
          personality,
          language,
          visitorName,
          image: frameToSend || null,
          visionContext: sceneData?.sceneContextText || null,
        });

        setIsAsking(false);

        if (aiResponse.isError) {
          setVqaError(aiResponse.text);
          if (onUpdateCharacterState) onUpdateCharacterState(CHARACTER_STATES.ERROR);
          return;
        }

        const reply = {
          text: aiResponse.text,
          expression: aiResponse.expression || CHARACTER_STATES.HAPPY,
          mode: frameToSend ? 'AI Vision Understanding (Mode B)' : 'Detector Grounded Conversation',
          timestamp: Date.now(),
        };

        setVqaResponse(reply);

        if (onUpdateCharacterState) onUpdateCharacterState(reply.expression);
        if (onBuddySpeak) onBuddySpeak(reply.text, language);
        if (onAwardXP) onAwardXP(15);
      } catch (err) {
        setIsAsking(false);
        setVqaError(err.message || 'Failed to process visual question.');
        if (onUpdateCharacterState) onUpdateCharacterState(CHARACTER_STATES.ERROR);
      }
    },
    [
      userQuery,
      sceneData,
      language,
      personality,
      visitorName,
      capturedSnapshot,
      isStreaming,
      captureFrame,
      onBuddySpeak,
      onUpdateCharacterState,
      onAwardXP,
    ]
  );

  if (!isOpen) return null;

  const detectedObjectsList = Object.entries(objectCounts || {});
  const langConfig = getLanguageConfig(language);
  const watchCandidates = sceneData?.objects?.filter((o) => o.isWatchCandidate) || [];

  // Preset Science Expo questions
  const expoPresetQuestions = [
    { id: 'q1', text: 'How many people are in front of the camera?' },
    { id: 'q2', text: 'Can you recognize this watch or book?' },
    { id: 'q3', text: 'What is the student holding?' },
    { id: 'q4', text: 'Is there a bottle or notebook in the scene?' },
    { id: 'q5', text: 'Describe everything you observe in front of you.' },
  ];

  return (
    <div className="vision-modal-backdrop" role="dialog" aria-modal="true">
      <div className="vision-dashboard-window">
        {/* Top Header */}
        <header className="vision-dash-header">
          <div className="vision-dash-title-group">
            <div className="vision-halo-icon">
              <Eye size={22} className="eye-icon-pulse" />
            </div>
            <div>
              <h2 className="vision-dash-title">BUDDY AI VISION</h2>
              <p className="vision-dash-subtitle">
                Two-Stage Visual Intelligence: Real-Time Detector + High-Accuracy Deep Inspection
              </p>
            </div>
          </div>

          <div className="vision-header-actions">
            {/* Model Status Pill */}
            <div className="vision-model-pill">
              <Zap size={14} className={isModelReady ? 'zap-ready' : 'zap-loading'} />
              <span>
                {isModelReady
                  ? modelTier === 'standard'
                    ? 'COCO-SSD MobileNet V2 (Standard)'
                    : 'COCO-SSD Lite (Fast)'
                  : loadingStatus || 'Loading Model...'}
              </span>
            </div>

            {/* Language Tag */}
            <div className="vision-lang-pill">
              <span>{langConfig?.flag}</span>
              <span>{langConfig?.nativeName}</span>
            </div>

            {/* Close Button */}
            <button
              id="vision-btn-close-modal"
              className="vision-close-btn"
              onClick={handleClose}
              title="Close AI Vision and release camera"
              aria-label="Close AI Vision"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Dashboard Grid Content */}
        <div className="vision-dash-grid">
          {/* Left Column: Camera Feed & Vision Controls */}
          <section className="vision-col-left">
            <CameraPreview
              videoRef={videoRef}
              isStreaming={isStreaming}
              isLoading={isCameraLoading || isModelLoading}
              error={cameraError || modelError}
              sceneData={sceneData}
              isPaused={isPaused}
              isMirrored={isMirrored}
              fps={fps}
              lightingCondition={lightingCondition}
              showHandRois={showHandRois}
              onStartCamera={() => startCamera()}
              onRetry={() => {
                if (cameraError) startCamera();
                if (modelError) initModel();
              }}
            />

            <VisionControls
              isStreaming={isStreaming}
              isPaused={isPaused}
              performanceMode={performanceMode}
              isMirrored={isMirrored}
              devices={devices}
              modelTier={modelTier}
              showHandRois={showHandRois}
              onStartCamera={() => startCamera()}
              onStopCamera={stopCamera}
              onTogglePause={togglePause}
              onCaptureFrame={handleCaptureSnapshot}
              onOpenInspect={() => handleOpenInspect('watch')}
              onToggleMirror={() => setIsMirrored((prev) => !prev)}
              onSelectPerformance={setPerformanceMode}
              onSelectModelTier={setModelTier}
              onToggleFacing={toggleFacingMode}
              onToggleHandRois={() => setShowHandRois((prev) => !prev)}
            />

            {/* Camera Clarity & Distance Guide */}
            <div className="vision-guidance-bar">
              <Sun size={15} className="guidance-icon" />
              <span>
                <strong>Best Accuracy:</strong> Hold books/watches 30–50cm away with steady lighting. For small watches or text, use <strong>Capture & Inspect</strong>.
              </span>
            </div>

            {/* Privacy Assurance Bar */}
            <div className="vision-privacy-bar">
              <ShieldCheck size={16} className="privacy-shield-icon" />
              <span>
                <strong>Privacy Guaranteed:</strong> Real-time detection runs entirely in your browser. Video is never streamed to external servers. Frames are only sent when you click Inspect or Ask.
              </span>
            </div>
          </section>

          {/* Right Column: Live Detections, Deep Inspect Card & Visual Q&A */}
          <section className="vision-col-right">
            {/* Live Observation Card */}
            <div className="vision-card observation-card">
              <div className="card-header-bar">
                <h3 className="card-heading">
                  <Eye size={16} /> Live Scene Observations
                </h3>
                <div className="card-header-tags">
                  {watchCandidates.length > 0 && (
                    <span className="watch-candidate-pill" onClick={() => handleOpenInspect('watch')}>
                      ⌚ Watch Candidate Detected!
                    </span>
                  )}
                  <span className="live-pill">
                    {isStreaming ? (isPaused ? 'PAUSED' : 'ACTIVE') : 'OFFLINE'}
                  </span>
                </div>
              </div>

              {/* People Summary */}
              <div className="observation-section">
                <h4 className="section-subheading">
                  👥 People Detected: <strong>{peopleCount}</strong>
                </h4>
                {sceneData?.people && sceneData.people.length > 0 ? (
                  <div className="people-chips-grid">
                    {sceneData.people.map((p) => (
                      <div key={p.id} className="person-chip">
                        <span className="chip-label">{p.label}</span>
                        {p.heldObjects.length > 0 && (
                          <span className="chip-held">
                            ✋ Holding:{' '}
                            {p.heldObjects
                              .map((h) => `${getClassIcon(h.rawClass || h.class)} ${h.class}`)
                              .join(', ')}
                          </span>
                        )}
                        {p.heldObjects.length === 0 && p.nearObjects.length > 0 && (
                          <span className="chip-near">
                            Near:{' '}
                            {p.nearObjects
                              .map((n) => `${getClassIcon(n.rawClass || n.class)} ${n.class}`)
                              .join(', ')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-scene-hint">
                    {isStreaming
                      ? 'No people detected in frame yet. Stand in front of the camera!'
                      : 'Start the camera to begin detection.'}
                  </p>
                )}
              </div>

              {/* Objects Summary */}
              <div className="observation-section">
                <div className="section-title-row">
                  <h4 className="section-subheading">📦 Visible Everyday Objects</h4>
                  {detectedObjectsList.length > 0 && (
                    <span className="objects-total-tag">
                      {sceneData?.objects?.length || 0} items
                    </span>
                  )}
                </div>

                {detectedObjectsList.length > 0 ? (
                  <div className="objects-chips-grid">
                    {sceneData?.objects?.map((obj) => (
                      <div
                        key={obj.id}
                        className={`object-chip ${obj.isWatchCandidate ? 'watch-candidate-chip' : ''}`}
                      >
                        <span className="chip-icon">
                          {obj.isWatchCandidate ? '⌚' : getClassIcon(obj.class)}
                        </span>
                        <span className="chip-name">{obj.displayLabel || obj.class}</span>
                        <span className="chip-score">{Math.round(obj.score * 100)}%</span>

                        {/* Interactive Feedback Buttons */}
                        <div className="chip-feedback-actions">
                          <button
                            className="chip-fb-btn btn-fb-thumb"
                            title="Correct prediction"
                            onClick={() => handleProvideFeedback(obj, 'correct')}
                          >
                            <ThumbsUp size={12} />
                          </button>
                          <button
                            className="chip-fb-btn btn-fb-thumb"
                            title="Incorrect prediction"
                            onClick={() =>
                              setFeedbackCorrectionOpenFor(
                                feedbackCorrectionOpenFor === obj.id ? null : obj.id
                              )
                            }
                          >
                            <ThumbsDown size={12} />
                          </button>
                          {obj.isWatchCandidate && (
                            <button
                              className="chip-fb-btn btn-fb-inspect"
                              title="Deep Inspect this candidate"
                              onClick={() => handleOpenInspect('watch')}
                            >
                              <Search size={12} />
                            </button>
                          )}
                        </div>

                        {/* Dropdown Correction Input */}
                        {feedbackCorrectionOpenFor === obj.id && (
                          <div className="inline-feedback-popover">
                            <span className="popover-title">What is it actually?</span>
                            <div className="popover-choices">
                              {['Wristwatch', 'Smartwatch', 'Book', 'Notebook', 'Phone', 'Bottle'].map(
                                (label) => (
                                  <button
                                    key={label}
                                    className="popover-choice-btn"
                                    onClick={() => handleProvideFeedback(obj, 'incorrect', label)}
                                  >
                                    {label}
                                  </button>
                                )
                              )}
                            </div>
                            <div className="popover-custom-row">
                              <input
                                type="text"
                                placeholder="Other label..."
                                className="popover-input"
                                value={feedbackTrueLabelInput}
                                onChange={(e) => setFeedbackTrueLabelInput(e.target.value)}
                              />
                              <button
                                className="popover-save-btn"
                                onClick={() =>
                                  handleProvideFeedback(
                                    obj,
                                    'incorrect',
                                    feedbackTrueLabelInput || 'Unknown'
                                  )
                                }
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-scene-hint">
                    {isStreaming
                      ? 'Hold up a supported item (book, bottle, phone, laptop) or a watch for inspection!'
                      : 'Everyday objects will appear here once the camera is running.'}
                  </p>
                )}

                {/* Feedback Toast Notification */}
                {feedbackSuccessMsg && (
                  <div className="feedback-toast">
                    <CheckCircle2 size={14} />
                    <span>{feedbackSuccessMsg}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Second-Stage "Capture & Inspect" Card */}
            {isInspectModalOpen && (
              <div className="vision-card inspect-card">
                <div className="card-header-bar">
                  <h3 className="card-heading">
                    <Search size={16} /> Second-Stage Object Inspection
                  </h3>
                  <button
                    className="inspect-close-btn"
                    onClick={() => setIsInspectModalOpen(false)}
                    title="Close Inspect Mode"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="inspect-controls-bar">
                  <span className="inspect-label">Target Category:</span>
                  <div className="inspect-target-tabs">
                    <button
                      className={`inspect-tab-btn ${inspectTargetType === 'watch' ? 'active' : ''}`}
                      onClick={() => handleOpenInspect('watch', selectedRoiId)}
                    >
                      ⌚ Wristwatch / Smartwatch
                    </button>
                    <button
                      className={`inspect-tab-btn ${inspectTargetType === 'book' ? 'active' : ''}`}
                      onClick={() => handleOpenInspect('book', selectedRoiId)}
                    >
                      📖 Book / Document
                    </button>
                    <button
                      className={`inspect-tab-btn ${inspectTargetType === 'small_object' ? 'active' : ''}`}
                      onClick={() => handleOpenInspect('small_object', selectedRoiId)}
                    >
                      🔍 Small Object / Handheld
                    </button>
                  </div>
                </div>

                {/* Region of Interest (ROI) Selector Tabs */}
                <div className="inspect-roi-selector-bar">
                  <span className="inspect-label">Inspection Region:</span>
                  <div className="inspect-roi-tabs">
                    <button
                      className={`inspect-roi-tab-btn ${selectedRoiId === 'full' ? 'active' : ''}`}
                      onClick={() => handleSelectRoi('full')}
                    >
                      🖼️ Full Frame
                    </button>

                    {/* Candidate Object ROI (if detected) */}
                    {sceneData?.objects?.some((o) => (inspectTargetType === 'watch' ? o.isWatchCandidate : o.class === 'book')) && (
                      <button
                        className={`inspect-roi-tab-btn ${selectedRoiId === 'candidate' ? 'active' : ''}`}
                        onClick={() => handleSelectRoi('candidate')}
                      >
                        🎯 Target Candidate ROI
                      </button>
                    )}

                    {/* Hand / Wrist Proposals */}
                    {sceneData?.handProposals?.map((roi) => (
                      <button
                        key={roi.id}
                        className={`inspect-roi-tab-btn ${selectedRoiId === roi.id ? 'active' : ''}`}
                        onClick={() => handleSelectRoi(roi.id)}
                      >
                        {roi.source === 'roi_wrist'
                          ? `🎯 ${roi.side === 'left' ? 'Left' : 'Right'} Wrist ROI`
                          : '🎯 Chest Holding ROI'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frame Preview with Zoom & ROI Options */}
                {capturedSnapshot && (
                  <div className="inspect-preview-container">
                    <div className="inspect-image-wrapper">
                      <img
                        src={capturedSnapshot.dataUrl}
                        alt="Captured scene for inspection"
                        className="inspect-snapshot-img"
                      />
                      <span className="inspect-zoom-badge">
                        {capturedSnapshot.isCropped ? '🔍 Enlarged ROI Crop' : '📸 Full Camera Frame'}
                      </span>
                    </div>

                    {/* Quick Morphological / Local Classifier Summary */}
                    <div className="inspect-stage1-box">
                      <span className="stage-badge">Stage 1: Real-Time Detector Status</span>
                      <p className="stage-desc">
                        {inspectTargetType === 'watch'
                          ? 'Pretrained COCO-SSD has NO watch class (only wall clocks). Hand/wrist ROI crop is required for high-accuracy watch identification.'
                          : 'COCO-SSD detects books, but perspective distortion and cover art require crop inspection.'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="inspect-action-row">
                  <button
                    id="vision-btn-run-deep-inspect"
                    className="inspect-execute-btn"
                    onClick={handleRunDeepInspect}
                    disabled={isInspecting}
                  >
                    <Sparkles size={16} />
                    <span>{isInspecting ? 'Deep Inspecting with Visual AI...' : 'Ask BUDDY to Deep Inspect'}</span>
                  </button>
                </div>

                {/* Multi-Stage Inspect Results Display */}
                {inspectResult && (
                  <div className="inspect-result-box">
                    <div className="result-header">
                      <span className="result-title">🎯 Multi-Stage Visual Recognition Pipeline</span>
                      <span className="result-badge">
                        {inspectResult.visualStage ? inspectResult.visualStage.status : 'Local Classification Ready'}
                      </span>
                    </div>

                    <div className="inspect-stages-grid">
                      {/* Stage 1: Detector Output */}
                      <div className="inspect-stage-card stage-detector">
                        <div className="stage-title-row">
                          <span className="stage-badge">Stage 1: Real-Time Detector (COCO-SSD)</span>
                          <span className="field-val" style={{ color: '#00f2fe' }}>
                            {inspectResult.detectorStage.confidence}
                          </span>
                        </div>
                        <span className="field-label">Predicted Class: <strong>{inspectResult.detectorStage.class}</strong></span>
                        <p className="stage-desc">{inspectResult.detectorStage.note}</p>
                      </div>

                      {/* Stage 2: Specialized Local Classifier (On-Device) */}
                      {inspectResult.localClassifier && (
                        <div className="inspect-stage-card stage-classifier">
                          <div className="stage-title-row">
                            <span className="stage-badge" style={{ color: '#ffb703' }}>
                              Stage 2: Specialized Local Classifier (On-Device)
                            </span>
                            <span className="field-val" style={{ color: '#ffb703' }}>
                              {Math.round(inspectResult.localClassifier.confidence * 100)}% [{inspectResult.localClassifier.confidenceState.toUpperCase()}]
                            </span>
                          </div>
                          <span className="field-label">
                            Category: <strong>{inspectResult.localClassifier.category}</strong>
                          </span>
                          <p className="stage-desc">{inspectResult.localClassifier.description}</p>
                        </div>
                      )}

                      {/* Stage 2: Multimodal Visual AI (Backend VQA) */}
                      <div className="inspect-stage-card stage-visual-ai">
                        <div className="stage-title-row">
                          <span className="stage-badge" style={{ color: '#00f59b' }}>
                            Stage 2: High-Accuracy Multimodal AI (VQA)
                          </span>
                          <span className="field-val" style={{ color: '#00f59b' }}>
                            {inspectResult.visualStage ? 'Verified' : 'Pending Action'}
                          </span>
                        </div>
                        <p className="field-body">
                          {inspectResult.visualStage
                            ? inspectResult.visualStage.identification
                            : 'Click "Ask BUDDY to Deep Inspect" above to run deep multimodal visual reasoning and text/dial analysis on this crop.'}
                        </p>
                      </div>
                    </div>

                    {/* Feedback on Inspection */}
                    <div className="inspect-feedback-row">
                      <span className="fb-prompt">Was this inspection accurate?</span>
                      <button
                        className="inspect-fb-btn"
                        onClick={() =>
                          handleProvideFeedback(
                            { class: inspectTargetType, stage: 'stage2_deep_inspect' },
                            'correct'
                          )
                        }
                      >
                        <ThumbsUp size={13} /> Yes
                      </button>
                      <button
                        className="inspect-fb-btn"
                        onClick={() =>
                          handleProvideFeedback(
                            { class: inspectTargetType, stage: 'stage2_deep_inspect' },
                            'incorrect'
                          )
                        }
                      >
                        <ThumbsDown size={13} /> No
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Visual Question Answering (VQA) Card */}
            <div className="vision-card vqa-card">
              <div className="card-header-bar">
                <h3 className="card-heading">
                  <Sparkles size={16} /> Visual Question Answering
                </h3>
                {capturedSnapshot && <span className="snapshot-tag">📸 Frame Captured</span>}
              </div>

              {/* Quick Science Expo Questions */}
              <div className="quick-prompts-container">
                <p className="quick-prompts-label">Try asking BUDDY:</p>
                <div className="quick-prompts-scroll">
                  {expoPresetQuestions.map((q) => (
                    <button
                      key={q.id}
                      className="quick-prompt-btn"
                      onClick={() => handleAskQuestion(q.text)}
                      disabled={isAsking || !isStreaming}
                    >
                      {q.text}
                    </button>
                  ))}
                </div>
              </div>

              {/* Captured Frame Thumbnail Preview */}
              {capturedSnapshot && (
                <div className="snapshot-preview-row">
                  <img
                    src={capturedSnapshot.dataUrl}
                    alt="Captured scene frame"
                    className="snapshot-thumbnail"
                  />
                  <div className="snapshot-info">
                    <span className="snap-time">
                      Captured at {new Date(capturedSnapshot.timestamp).toLocaleTimeString()}
                    </span>
                    <button className="snap-clear-btn" onClick={() => setCapturedSnapshot(null)}>
                      Clear Frame
                    </button>
                  </div>
                </div>
              )}

              {/* Question Input Form */}
              <form
                className="vqa-input-bar"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskQuestion();
                }}
              >
                <input
                  id="vision-question-input"
                  type="text"
                  className="vqa-text-input"
                  placeholder="Ask BUDDY anything about what it sees in the camera..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  disabled={isAsking}
                />
                <button
                  id="vision-btn-submit-question"
                  type="submit"
                  className="vqa-submit-btn"
                  disabled={isAsking || (!userQuery.trim() && !isStreaming)}
                >
                  <Send size={16} />
                  <span>{isAsking ? 'Thinking...' : 'Ask'}</span>
                </button>
              </form>

              {/* Error Notice */}
              {vqaError && (
                <div className="vqa-error-notice">
                  <AlertCircle size={16} />
                  <span>{vqaError}</span>
                </div>
              )}

              {/* AI Response Card */}
              {vqaResponse && (
                <div className="vqa-response-bubble">
                  <div className="response-header">
                    <span className="response-buddy-tag">🤖 BUDDY:</span>
                    <span className="response-mode-badge">{vqaResponse.mode}</span>
                    {onBuddySpeak && (
                      <button
                        className="vqa-replay-audio-btn"
                        onClick={() => onBuddySpeak(vqaResponse.text, language)}
                        title="Replay Voice Audio"
                      >
                        <Volume2 size={16} />
                      </button>
                    )}
                  </div>
                  <p className="response-body-text">{vqaResponse.text}</p>
                </div>
              )}

              {/* Feedback Statistics Footer */}
              {feedbackStats.total > 0 && (
                <div className="feedback-stats-bar">
                  <span>
                    Model Feedback Accuracy: <strong>{feedbackStats.precision}%</strong> ({feedbackStats.correct}/{feedbackStats.total} verified)
                  </span>
                  <button className="export-dataset-btn" onClick={handleExportFeedback} title="Download feedback dataset">
                    <Download size={13} /> Export JSON
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
