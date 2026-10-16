// BUDDY Arcade Data Service: High Scores, XP, Achievements & Cosmetic Customization
// Safe guest persistence with localStorage and Expo session reset.

const STORAGE_KEY = 'buddy_arcade_data_v1';

export const ARCADE_ACHIEVEMENTS = [
  {
    id: 'first_flight',
    title: 'First Flight 🚀',
    desc: 'Take to the skies in Buddy Flight',
    icon: '🪶',
    game: 'flight',
    xpReward: 35,
    rewardItem: 'party_hat',
  },
  {
    id: 'sky_explorer',
    title: 'Sky Explorer 🌌',
    desc: 'Pass 10+ obstacles in Buddy Flight',
    icon: '⚡',
    game: 'flight',
    xpReward: 60,
    rewardItem: 'cyber_shades',
  },
  {
    id: 'speed_star',
    title: 'Speed Star 🏃',
    desc: 'Dash over 250m in Robo Run',
    icon: '💨',
    game: 'runner',
    xpReward: 50,
    rewardItem: 'lightning_core',
  },
  {
    id: 'quiz_rocket',
    title: 'Quiz Rocket 🚀',
    desc: 'Power the rocket to orbit with 4+ correct answers',
    icon: '🪐',
    game: 'quiz',
    xpReward: 50,
    rewardItem: 'golden_crown',
  },
  {
    id: 'brain_champion',
    title: 'Brain Champion 🧠',
    desc: 'Complete Brain Flip memory challenge',
    icon: '💎',
    game: 'memory',
    xpReward: 45,
    rewardItem: 'smart_glasses',
  },
  {
    id: 'combo_master',
    title: 'Combo Master 🎯',
    desc: 'Reach a 5x combo streak in Catch the Bots',
    icon: '🔥',
    game: 'bots',
    xpReward: 50,
    rewardItem: 'neon_visor',
  },
  {
    id: 'arcade_explorer',
    title: 'Arcade Explorer 🕹️',
    desc: 'Play all 6 arcade games in Buddy Arcade',
    icon: '🌟',
    game: 'all',
    xpReward: 75,
    rewardItem: 'science_medal',
  },
  {
    id: 'fashion_icon',
    title: 'Fashion Icon 🎨',
    desc: 'Equip any custom outfit item in Buddy Pet Studio',
    icon: '✨',
    game: 'studio',
    xpReward: 30,
    rewardItem: 'aura_violet',
  },
];

export const COSMETIC_ITEMS = {
  hats: [
    { id: 'none', name: 'Original Antenna', icon: '🤖', unlockDesc: 'Default' },
    { id: 'party_hat', name: 'Party Cone', icon: '🥳', unlockDesc: 'Unlock via "First Flight"' },
    { id: 'golden_crown', name: 'Golden King Crown', icon: '👑', unlockDesc: 'Unlock via "Quiz Rocket"' },
    { id: 'astro_halo', name: 'Astronaut Halo', icon: '🛸', unlockDesc: 'Score 15+ in Buddy Flight' },
    { id: 'headphones', name: 'Cyber Beats', icon: '🎧', unlockDesc: 'Reach 350m in Robo Run' },
    { id: 'scholar_cap', name: 'Science Cap', icon: '🎓', unlockDesc: 'Earn 250+ total XP' },
  ],
  glasses: [
    { id: 'none', name: 'Bare Visor', icon: '👀', unlockDesc: 'Default' },
    { id: 'cyber_shades', name: 'Cyber Shades', icon: '🕶️', unlockDesc: 'Unlock via "Sky Explorer"' },
    { id: 'neon_visor', name: 'Neon VR Visor', icon: '🥽', unlockDesc: 'Unlock via "Combo Master"' },
    { id: 'smart_glasses', name: 'Smart Specs', icon: '👓', unlockDesc: 'Unlock via "Brain Champion"' },
  ],
  accessories: [
    { id: 'none', name: 'Standard Arc Core', icon: '🔘', unlockDesc: 'Default' },
    { id: 'lightning_core', name: 'Lightning Reactor', icon: '⚡', unlockDesc: 'Unlock via "Speed Star"' },
    { id: 'science_medal', name: 'Gold Expo Medal', icon: '🎖️', unlockDesc: 'Unlock via "Arcade Explorer"' },
    { id: 'bowtie', name: 'Formal Bowtie', icon: '🎀', unlockDesc: 'Play 3 different games' },
  ],
  auras: [
    { id: 'cyan', name: 'Cyan Neon', hex: '#00f2fe', icon: '🔷', unlockDesc: 'Default' },
    { id: 'violet', name: 'Violet Nova', hex: '#e100ff', icon: '🔮', unlockDesc: 'Unlock via "Fashion Icon"' },
    { id: 'gold', name: 'Solar Gold', hex: '#ffb703', icon: '🌟', unlockDesc: 'Reach Level 3' },
    { id: 'emerald', name: 'Emerald Spark', hex: '#00f59b', icon: '💚', unlockDesc: 'Score 500+ total arcade points' },
  ],
};

const DEFAULT_DATA = {
  highScores: {
    flight: 0,
    runner: 0,
    quiz: 0,
    memory: 0,
    bots: 0,
  },
  stats: {
    gamesPlayed: 0,
    totalArcadeXP: 0,
    gamesPlayedList: [], // ['flight', 'runner', ...]
    obstaclesPassed: 0,
    maxRunnerDistance: 0,
    maxBotCombo: 0,
  },
  unlockedAchievements: [],
  unlockedCosmetics: ['party_hat'], // Give a starter fun cosmetic
  activeOutfit: {
    hat: 'none',
    glasses: 'none',
    accessory: 'none',
    aura: 'cyan',
  },
};

export function getArcadeData() {
  if (typeof window === 'undefined') return { ...DEFAULT_DATA };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DATA };
    const parsed = JSON.parse(raw);
    return {
      highScores: { ...DEFAULT_DATA.highScores, ...(parsed.highScores || {}) },
      stats: { ...DEFAULT_DATA.stats, ...(parsed.stats || {}) },
      unlockedAchievements: Array.isArray(parsed.unlockedAchievements)
        ? parsed.unlockedAchievements
        : [],
      unlockedCosmetics: Array.isArray(parsed.unlockedCosmetics)
        ? parsed.unlockedCosmetics
        : ['party_hat'],
      activeOutfit: { ...DEFAULT_DATA.activeOutfit, ...(parsed.activeOutfit || {}) },
    };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

export function saveArcadeData(data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function getArcadeLevel(totalXP) {
  if (totalXP >= 500) return { level: 5, title: 'Master Pilot 🌌', nextXP: 1000 };
  if (totalXP >= 300) return { level: 4, title: 'Quantum Ace ⚡', nextXP: 500 };
  if (totalXP >= 150) return { level: 3, title: 'Cyber Cadet 🚀', nextXP: 300 };
  if (totalXP >= 50) return { level: 2, title: 'Sparky Rookie 🤖', nextXP: 150 };
  return { level: 1, title: 'Junior Explorer 🌱', nextXP: 50 };
}

// Record score and validate milestones
export function recordGameScore(gameId, score, extra = {}) {
  const data = getArcadeData();
  const currentBest = data.highScores[gameId] || 0;
  const isNewHighScore = score > currentBest;

  if (isNewHighScore) {
    data.highScores[gameId] = score;
  }

  data.stats.gamesPlayed += 1;
  if (!data.stats.gamesPlayedList.includes(gameId)) {
    data.stats.gamesPlayedList.push(gameId);
  }

  // Calculate base XP based on performance
  let earnedXP = 0;
  switch (gameId) {
    case 'flight':
      // 5 XP per gate passed + bonus for high score
      earnedXP = Math.min(80, Math.max(10, score * 5));
      data.stats.obstaclesPassed += score;
      break;
    case 'runner':
      // 1 XP per 10m + star bonus
      earnedXP = Math.min(80, Math.max(15, Math.floor((extra.distance || score) / 8)));
      data.stats.maxRunnerDistance = Math.max(data.stats.maxRunnerDistance || 0, extra.distance || score);
      break;
    case 'quiz':
      earnedXP = Math.min(80, Math.max(15, score * 12));
      break;
    case 'memory':
      earnedXP = Math.min(65, Math.max(20, Math.floor(score)));
      break;
    case 'bots':
      earnedXP = Math.min(75, Math.max(15, Math.floor(score / 15)));
      data.stats.maxBotCombo = Math.max(data.stats.maxBotCombo || 0, extra.maxCombo || 0);
      break;
    default:
      earnedXP = 20;
  }

  if (isNewHighScore && score > 0) {
    earnedXP += 15; // High score bonus
  }

  data.stats.totalArcadeXP += earnedXP;

  // Evaluate achievements
  const newAchievements = [];
  const checkAchievement = (achId, condition) => {
    if (condition && !data.unlockedAchievements.includes(achId)) {
      data.unlockedAchievements.push(achId);
      const ach = ARCADE_ACHIEVEMENTS.find((a) => a.id === achId);
      if (ach) {
        newAchievements.push(ach);
        if (ach.rewardItem && !data.unlockedCosmetics.includes(ach.rewardItem)) {
          data.unlockedCosmetics.push(ach.rewardItem);
        }
      }
    }
  };

  // 1. First Flight
  if (gameId === 'flight') {
    checkAchievement('first_flight', true);
    checkAchievement('sky_explorer', (data.stats.obstaclesPassed || 0) >= 10 || score >= 10);
    if (score >= 15 && !data.unlockedCosmetics.includes('astro_halo')) {
      data.unlockedCosmetics.push('astro_halo');
    }
  }

  // 2. Speed Star
  if (gameId === 'runner') {
    checkAchievement('speed_star', (extra.distance || score) >= 250);
    if ((extra.distance || score) >= 350 && !data.unlockedCosmetics.includes('headphones')) {
      data.unlockedCosmetics.push('headphones');
    }
  }

  // 3. Quiz Rocket
  if (gameId === 'quiz') {
    checkAchievement('quiz_rocket', score >= 4);
  }

  // 4. Brain Champion
  if (gameId === 'memory') {
    checkAchievement('brain_champion', true);
  }

  // 5. Combo Master
  if (gameId === 'bots') {
    checkAchievement('combo_master', (extra.maxCombo || 0) >= 5);
  }

  // 6. Arcade Explorer (played all 6 or 5 playable games)
  checkAchievement(
    'arcade_explorer',
    data.stats.gamesPlayedList.length >= 5
  );

  // Milestone cosmetics based on XP
  if (data.stats.totalArcadeXP >= 250 && !data.unlockedCosmetics.includes('scholar_cap')) {
    data.unlockedCosmetics.push('scholar_cap');
  }

  saveArcadeData(data);

  return {
    isNewHighScore,
    highScore: data.highScores[gameId],
    earnedXP,
    newAchievements,
  };
}

export function setActiveOutfit(newOutfit) {
  const data = getArcadeData();
  data.activeOutfit = { ...data.activeOutfit, ...newOutfit };

  // Check if fashion icon achievement should be unlocked
  const isCustomized =
    data.activeOutfit.hat !== 'none' ||
    data.activeOutfit.glasses !== 'none' ||
    data.activeOutfit.accessory !== 'none' ||
    data.activeOutfit.aura !== 'cyan';

  if (isCustomized && !data.unlockedAchievements.includes('fashion_icon')) {
    data.unlockedAchievements.push('fashion_icon');
    if (!data.unlockedCosmetics.includes('aura_violet')) {
      data.unlockedCosmetics.push('aura_violet');
    }
  }

  saveArcadeData(data);
  return data.activeOutfit;
}

export function resetArcadeSession() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
