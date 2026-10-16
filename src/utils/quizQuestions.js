// Verified educational question bank for Quiz Blast Rocket Mission
// Categorized across AI & ML, Space & Science, CS, Math, and General Knowledge.

export const QUIZ_CATEGORIES = [
  { id: 'all', name: 'All Topics', icon: '🌌' },
  { id: 'ai', name: 'AI & Robotics', icon: '🤖' },
  { id: 'space', name: 'Space & Physics', icon: '🚀' },
  { id: 'cs', name: 'Computer Science', icon: '💻' },
  { id: 'math', name: 'Math & Logic', icon: '📐' },
  { id: 'science', name: 'Nature & Biology', icon: '🔬' },
];

export const QUIZ_QUESTIONS = [
  // AI & Robotics
  {
    id: 'ai_1',
    category: 'ai',
    difficulty: 'easy',
    question: 'What does "AI" stand for in modern computing?',
    options: ['Automated Internet', 'Artificial Intelligence', 'Algorithmic Interface', 'Advanced Integration'],
    correctIndex: 1,
    explanation: 'Artificial Intelligence refers to computer systems engineered to simulate human-like intelligence, such as recognizing speech and learning patterns.',
  },
  {
    id: 'ai_2',
    category: 'ai',
    difficulty: 'medium',
    question: 'What is a "Neural Network" in Machine Learning modeled after?',
    options: ['Spider webs', 'Interconnected brain neurons', 'Telephone telephone cables', 'Quantum atoms'],
    correctIndex: 1,
    explanation: 'Artificial neural networks are computational models loosely inspired by the structure of biological neurons in human brains.',
  },
  {
    id: 'ai_3',
    category: 'ai',
    difficulty: 'hard',
    question: 'Which historical test was devised to evaluate if a machine exhibits intelligent behavior indistinguishable from a human?',
    options: ['Moore Test', 'Turing Test', 'Tesla Benchmark', 'Von Neumann Criterion'],
    correctIndex: 1,
    explanation: 'Alan Turing proposed the Turing Test in 1950 to evaluate whether a computer could converse so naturally that a human judge cannot tell it from a human.',
  },
  {
    id: 'ai_4',
    category: 'ai',
    difficulty: 'medium',
    question: 'What do machine learning models use "Training Data" for?',
    options: ['To cool down the GPU', 'To learn patterns and make predictions', 'To display graphics', 'To recharge batteries'],
    correctIndex: 1,
    explanation: 'Training data provides sample examples that machine learning algorithms analyze to adjust weights and learn underlying patterns.',
  },

  // Space & Physics
  {
    id: 'space_1',
    category: 'space',
    difficulty: 'easy',
    question: 'Which planet is famously known as the "Red Planet" due to iron oxide on its surface?',
    options: ['Venus', 'Jupiter', 'Mars', 'Mercury'],
    correctIndex: 2,
    explanation: 'Mars appears reddish-orange because its soil is rich in iron oxide (rust).',
  },
  {
    id: 'space_2',
    category: 'space',
    difficulty: 'medium',
    question: 'Approximately how long does it take for sunlight to travel from the Sun to Earth?',
    options: ['8 minutes and 20 seconds', '1 hour', '12 seconds', '24 hours'],
    correctIndex: 0,
    explanation: 'Light travels at ~300,000 km/s across roughly 150 million kilometers, taking about 8 minutes and 20 seconds to reach Earth.',
  },
  {
    id: 'space_3',
    category: 'space',
    difficulty: 'medium',
    question: 'What is the theoretical boundary around a black hole beyond which nothing, not even light, can escape?',
    options: ['Singularity', 'Event Horizon', 'Corona Sphere', 'Photon Barrier'],
    correctIndex: 1,
    explanation: 'The event horizon is the threshold where gravitational escape velocity exceeds the speed of light.',
  },
  {
    id: 'space_4',
    category: 'space',
    difficulty: 'hard',
    question: 'Which fundamental force is primarily responsible for keeping planets in orbit around the Sun?',
    options: ['Electromagnetism', 'Strong Nuclear Force', 'Gravity', 'Weak Nuclear Force'],
    correctIndex: 2,
    explanation: 'Gravity is the mutual attractive force between celestial masses described by Newton and Einstein.',
  },

  // Computer Science
  {
    id: 'cs_1',
    category: 'cs',
    difficulty: 'easy',
    question: 'What are the two digits used in the binary numeral system?',
    options: ['1 and 2', '0 and 1', 'A and B', '+ and -'],
    correctIndex: 1,
    explanation: 'Binary is base-2, using only 0 and 1 to represent digital data and processor instructions.',
  },
  {
    id: 'cs_2',
    category: 'cs',
    difficulty: 'medium',
    question: 'Which data structure follows the "First In, First Out" (FIFO) principle?',
    options: ['Stack', 'Queue', 'Tree', 'Graph'],
    correctIndex: 1,
    explanation: 'A Queue operates like a line of people at a counter: the first element added is the first one processed (FIFO).',
  },
  {
    id: 'cs_3',
    category: 'cs',
    difficulty: 'medium',
    question: 'What does "CPU" stand for in hardware architecture?',
    options: ['Central Processing Unit', 'Core Programming Utility', 'Computer Power Unit', 'Central Pixel Ultra'],
    correctIndex: 0,
    explanation: 'The CPU is the central processing unit, the primary microprocessor executing instructions.',
  },
  {
    id: 'cs_4',
    category: 'cs',
    difficulty: 'hard',
    question: 'In computational complexity, what does "O(1)" time complexity mean for an algorithm?',
    options: ['Executes in one second', 'Constant time regardless of input size', 'Linear time', 'Exponential time'],
    correctIndex: 1,
    explanation: 'Constant time O(1) means the runtime remains fixed and does not grow with the size of the input data.',
  },

  // Math & Logic
  {
    id: 'math_1',
    category: 'math',
    difficulty: 'easy',
    question: 'What is the sum of angles inside any standard geometric triangle?',
    options: ['90 degrees', '180 degrees', '270 degrees', '360 degrees'],
    correctIndex: 1,
    explanation: 'In Euclidean geometry, the three interior angles of every flat triangle always sum to exactly 180 degrees.',
  },
  {
    id: 'math_2',
    category: 'math',
    difficulty: 'medium',
    question: 'Which of the following numbers is a Prime number?',
    options: ['9', '15', '21', '29'],
    correctIndex: 3,
    explanation: '29 has exactly two distinct positive divisors: 1 and itself, making it a prime number.',
  },
  {
    id: 'math_3',
    category: 'math',
    difficulty: 'medium',
    question: 'If a runner completes 400 meters in 50 seconds, what is their average speed?',
    options: ['6 m/s', '8 m/s', '10 m/s', '12 m/s'],
    correctIndex: 1,
    explanation: 'Speed = Distance / Time = 400 m / 50 s = 8 meters per second.',
  },
  {
    id: 'math_4',
    category: 'math',
    difficulty: 'hard',
    question: 'What is the value of the mathematical constant Pi (π) rounded to two decimal places?',
    options: ['3.12', '3.14', '3.16', '3.18'],
    correctIndex: 1,
    explanation: 'Pi is the ratio of any circle\'s circumference to its diameter, approximately 3.14159...',
  },

  // Nature & Biology
  {
    id: 'science_1',
    category: 'science',
    difficulty: 'easy',
    question: 'What gas do green plants absorb from the atmosphere during photosynthesis?',
    options: ['Carbon Dioxide (CO2)', 'Oxygen (O2)', 'Helium (He)', 'Nitrogen (N2)'],
    correctIndex: 0,
    explanation: 'Plants absorb carbon dioxide through tiny leaf pores called stomata and release oxygen.',
  },
  {
    id: 'science_2',
    category: 'science',
    difficulty: 'medium',
    question: 'Which cellular organelle is famously called the "Powerhouse of the Cell"?',
    options: ['Ribosome', 'Nucleus', 'Mitochondria', 'Endoplasmic Reticulum'],
    correctIndex: 2,
    explanation: 'Mitochondria produce most of the chemical energy required by the cell in the form of ATP.',
  },
  {
    id: 'science_3',
    category: 'science',
    difficulty: 'medium',
    question: 'Which is the hardest natural mineral known on Earth?',
    options: ['Quartz', 'Diamond', 'Topaz', 'Granite'],
    correctIndex: 1,
    explanation: 'Diamond rates a maximum of 10 on the Mohs mineral hardness scale due to its rigid tetrahedral carbon lattice.',
  },
  {
    id: 'science_4',
    category: 'science',
    difficulty: 'hard',
    question: 'How many chambers does a normal human heart have?',
    options: ['Two', 'Three', 'Four', 'Six'],
    correctIndex: 2,
    explanation: 'The human heart has 4 chambers: two upper atria (left & right) and two lower ventricles (left & right).',
  },
];

// Helper to get randomized shuffled questions
export function getQuizQuestions(category = 'all', count = 5) {
  let pool = QUIZ_QUESTIONS;
  if (category && category !== 'all') {
    pool = QUIZ_QUESTIONS.filter((q) => q.category === category);
    if (pool.length === 0) pool = QUIZ_QUESTIONS;
  }
  // Shuffle pool copy
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length)).map((item) => {
    // Shuffle options while tracking the correct index
    const correctOption = item.options[item.correctIndex];
    const shuffledOptions = [...item.options].sort(() => Math.random() - 0.5);
    const newCorrectIndex = shuffledOptions.indexOf(correctOption);
    return {
      ...item,
      options: shuffledOptions,
      correctIndex: newCorrectIndex,
    };
  });
}
