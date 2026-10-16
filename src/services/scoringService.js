export function getPerformanceTitle(xp) {
  if (xp >= 300) return 'Super Explorer 🌟🚀';
  if (xp >= 200) return 'Brain Spark ⚡🧠';
  if (xp >= 120) return 'Quick Thinker 💡✨';
  if (xp >= 60) return 'Science Buddy 🔬🤖';
  return 'Curious Explorer 🧭🌱';
}

export function calculateCompletionScore(xp) {
  const completionBonus = 100;
  const finalXP = xp + completionBonus;
  return {
    finalXP,
    title: getPerformanceTitle(finalXP),
  };
}

export const BADGE_DEFINITIONS = [
  {
    id: 'curious_explorer',
    name: 'Curious Explorer',
    icon: '🧭🌱',
    desc: 'Engaged in meaningful AI questions & dialogue',
  },
  {
    id: 'brain_spark',
    name: 'Brain Spark',
    icon: '⚡🧠',
    desc: 'Solved lightning logic & brain teasers',
  },
  {
    id: 'science_buddy',
    name: 'Science Buddy',
    icon: '🔬🤖',
    desc: 'Mastered STEM concepts & myth busters',
  },
  {
    id: 'quick_thinker',
    name: 'Quick Thinker',
    icon: '💡⏱️',
    desc: 'High speed neural reflex tap registered',
  },
  {
    id: 'mystery_solver',
    name: 'Mystery Solver',
    icon: '🕵️✨',
    desc: 'Cracked mystery clues or memory matrix',
  },
  {
    id: 'cosmic_explorer',
    name: 'Cosmic Explorer',
    icon: '🚀🌌',
    desc: 'Saved Mars Rover or explored deep cosmos',
  },
];

export function calculateEarnedBadges(stats = {}) {
  const {
    xp = 0,
    gamesCompleted = 0,
    conversationsCount = 0,
    bestReaction = null,
    hasSolvedRiddle = false,
    hasScienceDone = false,
    hasMysteryDone = false,
    hasSpaceDone = false,
  } = stats;

  const earned = [];

  // 1. Curious Explorer: chatted with Buddy or earned initial points
  if (conversationsCount >= 2 || xp >= 20) {
    earned.push(BADGE_DEFINITIONS.find((b) => b.id === 'curious_explorer'));
  }

  // 2. Brain Spark: riddle or math done
  if (hasSolvedRiddle || xp >= 100) {
    earned.push(BADGE_DEFINITIONS.find((b) => b.id === 'brain_spark'));
  }

  // 3. Science Buddy: science quiz or myth buster
  if (hasScienceDone || gamesCompleted >= 2) {
    earned.push(BADGE_DEFINITIONS.find((b) => b.id === 'science_buddy'));
  }

  // 4. Quick Thinker: fast reaction or swift solver
  if ((bestReaction && bestReaction < 450) || xp >= 150) {
    earned.push(BADGE_DEFINITIONS.find((b) => b.id === 'quick_thinker'));
  }

  // 5. Mystery Solver: mystery object or memory flash
  if (hasMysteryDone || gamesCompleted >= 3) {
    earned.push(BADGE_DEFINITIONS.find((b) => b.id === 'mystery_solver'));
  }

  // 6. Cosmic Explorer: mars rover / space / high score
  if (hasSpaceDone || xp >= 250) {
    earned.push(BADGE_DEFINITIONS.find((b) => b.id === 'cosmic_explorer'));
  }

  // Always award at least the first badge if session completed
  if (earned.length === 0) {
    earned.push(BADGE_DEFINITIONS[0]);
  }

  return earned;
}
