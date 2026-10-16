import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Check, Lock, Sparkles, RotateCcw, Palette } from 'lucide-react';
import { BuddyScene } from '../BuddyScene';
import {
  COSMETIC_ITEMS,
  getArcadeData,
  setActiveOutfit,
} from '../../services/arcadeService';
import { soundEffects } from '../../services/soundEffects';
import { CHARACTER_STATES } from '../../utils/characterStates';

export function BuddyPetStudio({ onExit, onOutfitChange, setCharacterState }) {
  const [arcadeData, setArcadeData] = useState(() => getArcadeData());
  const [selectedOutfit, setSelectedOutfit] = useState(() => getArcadeData().activeOutfit);
  const [activeCategory, setActiveCategory] = useState('hats'); // 'hats' | 'glasses' | 'accessories' | 'auras'
  const [savedNotification, setSavedNotification] = useState(false);

  useEffect(() => {
    if (setCharacterState) setCharacterState(CHARACTER_STATES.PLAYFUL);
  }, [setCharacterState]);

  const unlockedCosmetics = arcadeData.unlockedCosmetics || [];

  const handleSelectCosmetic = (category, item) => {
    soundEffects.playClick();
    const isUnlocked = item.id === 'none' || item.id === 'cyan' || unlockedCosmetics.includes(item.id);

    if (!isUnlocked) {
      soundEffects.playWrong();
      return;
    }

    const nextOutfit = {
      ...selectedOutfit,
      [category === 'hats'
        ? 'hat'
        : category === 'glasses'
        ? 'glasses'
        : category === 'accessories'
        ? 'accessory'
        : 'aura']: item.id,
    };

    setSelectedOutfit(nextOutfit);
    // Persist immediately
    setActiveOutfit(nextOutfit);
    if (onOutfitChange) onOutfitChange(nextOutfit);

    soundEffects.playCollect();
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2000);

    try {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.7 },
        colors: ['#00f2fe', '#e100ff', '#ffb703'],
      });
    } catch {}
  };

  const handleResetToDefault = () => {
    soundEffects.playClick();
    const defaultOutfit = { hat: 'none', glasses: 'none', accessory: 'none', aura: 'cyan' };
    setSelectedOutfit(defaultOutfit);
    setActiveOutfit(defaultOutfit);
    if (onOutfitChange) onOutfitChange(defaultOutfit);
  };

  return (
    <div className="pet-studio-layout">
      {/* Studio Header */}
      <header className="pet-studio-header">
        <div className="header-left">
          <button
            className="shell-btn-back"
            onClick={() => {
              soundEffects.playClick();
              if (onExit) onExit();
            }}
          >
            <ArrowLeft size={18} />
            <span>Arcade Hub</span>
          </button>
          <div className="studio-title-badge">
            <Palette size={20} className="palette-icon" />
            <div>
              <h2>BUDDY Pet Studio</h2>
              <p>Customize your 3D AI companion with earned arcade achievements!</p>
            </div>
          </div>
        </div>

        <button
          className="btn-reset-wardrobe"
          onClick={handleResetToDefault}
          title="Reset to original robot style"
        >
          <RotateCcw size={16} />
          <span>Reset Default</span>
        </button>
      </header>

      {/* Main Split: Left 3D Interactive Stage, Right Customizer Panel */}
      <div className="pet-studio-content-grid">
        {/* Left Side: Real-time 3D Character Preview */}
        <div className="pet-studio-stage-pane">
          <div className="studio-character-3d-box">
            <BuddyScene
              characterState={CHARACTER_STATES.PLAYFUL}
              isSpeaking={false}
              outfit={selectedOutfit}
            />
          </div>

          <div className="studio-stage-footer-tip">
            <Sparkles size={16} className="spark-spin" />
            <span>Drag or touch around BUDDY to rotate view in full 3D!</span>
          </div>

          {savedNotification && (
            <div className="outfit-saved-toast">
              <Check size={16} />
              <span>Outfit equipped and saved!</span>
            </div>
          )}
        </div>

        {/* Right Side: Wardrobe Categories & Items Grid */}
        <div className="pet-studio-customizer-pane">
          {/* Category Tabs */}
          <div className="studio-category-tabs">
            <button
              className={`cat-tab-btn ${activeCategory === 'hats' ? 'active' : ''}`}
              onClick={() => {
                soundEffects.playClick();
                setActiveCategory('hats');
              }}
            >
              <span>🎩 Hats</span>
            </button>
            <button
              className={`cat-tab-btn ${activeCategory === 'glasses' ? 'active' : ''}`}
              onClick={() => {
                soundEffects.playClick();
                setActiveCategory('glasses');
              }}
            >
              <span>🕶️ Eyewear</span>
            </button>
            <button
              className={`cat-tab-btn ${activeCategory === 'accessories' ? 'active' : ''}`}
              onClick={() => {
                soundEffects.playClick();
                setActiveCategory('accessories');
              }}
            >
              <span>⚡ Accessories</span>
            </button>
            <button
              className={`cat-tab-btn ${activeCategory === 'auras' ? 'active' : ''}`}
              onClick={() => {
                soundEffects.playClick();
                setActiveCategory('auras');
              }}
            >
              <span>🔷 Energy Aura</span>
            </button>
          </div>

          {/* Items Grid for Active Category */}
          <div className="studio-items-grid">
            {COSMETIC_ITEMS[activeCategory].map((item) => {
              const isDefaultItem = item.id === 'none' || item.id === 'cyan';
              const isUnlocked = isDefaultItem || unlockedCosmetics.includes(item.id);

              const currentSelectedId =
                activeCategory === 'hats'
                  ? selectedOutfit.hat
                  : activeCategory === 'glasses'
                  ? selectedOutfit.glasses
                  : activeCategory === 'accessories'
                  ? selectedOutfit.accessory
                  : selectedOutfit.aura;

              const isEquipped = currentSelectedId === item.id;

              return (
                <div
                  key={item.id}
                  className={`wardrobe-item-card ${isEquipped ? 'item-equipped' : ''} ${
                    !isUnlocked ? 'item-locked' : ''
                  }`}
                  onClick={() => handleSelectCosmetic(activeCategory, item)}
                >
                  <div className="item-icon-bubble">
                    <span className="big-item-icon">{item.icon}</span>
                    {!isUnlocked && (
                      <div className="lock-overlay-chip" title={item.unlockDesc}>
                        <Lock size={14} />
                      </div>
                    )}
                    {isEquipped && (
                      <div className="equipped-check-chip">
                        <Check size={14} />
                      </div>
                    )}
                  </div>

                  <div className="item-info-meta">
                    <span className="item-name">{item.name}</span>
                    <span className="item-unlock-status">
                      {isUnlocked ? (isEquipped ? 'Equipped' : 'Tap to Equip') : item.unlockDesc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Educational Note for Science Expo */}
          <div className="studio-expo-note">
            <h4>💡 100% Free & Fair Play</h4>
            <p>
              Every cosmetic in BUDDY Pet Studio is unlocked through science expo gameplay,
              high scores, and learning challenges. No real money or sign-ups!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
