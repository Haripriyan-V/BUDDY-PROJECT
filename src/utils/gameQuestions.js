// ==========================================
// BUDDY 2.0 — PLAY ZONE QUESTION & GAME DATA
// ==========================================

export const MEMORY_SETS = [
  {
    sequence: ['🍎', '⭐', '🚗', '🐱'],
    question: 'Which object did you see in the sequence?',
    correct: '🚗',
    options: ['🚗', '🍌', '🚀', '🐶'],
  },
  {
    sequence: ['⚡', '🛸', '🍕', '🎮'],
    question: 'Which of these items was in the hologram?',
    correct: '🎮',
    options: ['🎩', '🎮', '⚽', '💎'],
  },
  {
    sequence: ['🧬', '🔭', '🪐', '💡'],
    question: 'Which science tool was in the lineup?',
    correct: '🔭',
    options: ['🔭', '🔥', '🔋', '🔑'],
  },
  {
    sequence: ['🧪', '🤖', '🌈', '🚲'],
    question: 'Which friendly tech was shown?',
    correct: '🤖',
    options: ['⛵', '🤖', '🎸', '🍦'],
  },
  {
    sequence: ['🌍', '🛰️', '☄️', '🛸', '🌟'],
    question: 'Which orbital explorer was in the sequence?',
    correct: '🛰️',
    options: ['🛰️', '✈️', '⛵', '🚂'],
  },
  {
    sequence: ['🔋', '💡', '💻', '📡', '⚙️'],
    question: 'Which power source was shown?',
    correct: '🔋',
    options: ['🔋', '🕯️', '🔥', '💧'],
  },
];

export const MATH_QUESTIONS = [
  {
    question: "What's 20% of 100?",
    options: ['10', '20', '25', '50'],
    answer: '20',
    hint: 'Divide 100 by 5!',
    difficulty: 'easy',
  },
  {
    question: 'Solve for x: 3x + 6 = 21',
    options: ['3', '5', '7', '9'],
    answer: '5',
    hint: '3x = 15!',
    difficulty: 'medium',
  },
  {
    question: "What is 12 × 12?",
    options: ['124', '132', '144', '156'],
    answer: '144',
    hint: 'A gross number!',
    difficulty: 'easy',
  },
  {
    question: 'What is the square root of 81?',
    options: ['7', '8', '9', '11'],
    answer: '9',
    hint: '9 times what equals 81?',
    difficulty: 'easy',
  },
  {
    question: 'If a triangle has angles 60° and 70°, what is the 3rd angle?',
    options: ['40°', '50°', '60°', '70°'],
    answer: '50°',
    hint: 'Total degrees in a triangle = 180°!',
    difficulty: 'medium',
  },
  {
    question: 'What is the binary value of the decimal number 10?',
    options: ['1010', '1100', '1001', '1110'],
    answer: '1010',
    hint: '8 + 2 in powers of two!',
    difficulty: 'hard',
  },
];

export const SCIENCE_QUESTIONS = [
  {
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Mercury'],
    answer: 'Mars',
    explanation: 'Iron oxide (rust) gives Mars its distinctive red hue!',
    difficulty: 'easy',
  },
  {
    question: 'What is the chemical formula for water?',
    options: ['CO2', 'H2O', 'NaCl', 'O2'],
    answer: 'H2O',
    explanation: 'Two Hydrogen atoms bonded with one Oxygen atom!',
    difficulty: 'easy',
  },
  {
    question: 'Which subatomic particle carries a positive charge?',
    options: ['Electron', 'Proton', 'Neutron', 'Photon'],
    answer: 'Proton',
    explanation: 'Protons sit in the nucleus with positive charge!',
    difficulty: 'easy',
  },
  {
    question: 'What is the most abundant gas in Earth’s atmosphere?',
    options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'],
    answer: 'Nitrogen',
    explanation: 'Nitrogen makes up approximately 78% of our atmosphere!',
    difficulty: 'medium',
  },
  {
    question: 'What is the powerhouse of the biological cell?',
    options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi Apparatus'],
    answer: 'Mitochondria',
    explanation: 'Mitochondria generate cellular energy in the form of ATP!',
    difficulty: 'easy',
  },
  {
    question: 'What is the speed of light in vacuum (approx)?',
    options: ['300,000 km/s', '150,000 km/s', '3,000 km/s', '1,000,000 km/s'],
    answer: '300,000 km/s',
    explanation: 'Light travels at nearly 299,792 kilometers every second!',
    difficulty: 'medium',
  },
  {
    question: 'What causes ocean tides on Earth?',
    options: ['Wind pressure', 'Gravitational pull of Moon & Sun', 'Earthquake waves', 'Ocean thermal currents'],
    answer: 'Gravitational pull of Moon & Sun',
    explanation: 'The gravitational differential pulls ocean water toward the Moon!',
    difficulty: 'medium',
  },
  {
    question: 'What is the absolute zero temperature in Celsius?',
    options: ['-100°C', '-273.15°C', '-373°C', '-500°C'],
    answer: '-273.15°C',
    explanation: 'Absolute zero (0 Kelvin) is where molecular kinetic motion reaches minimum!',
    difficulty: 'hard',
  },
];

// 1. Brain Spark (Riddles & Logic Challenges)
export const BRAIN_SPARK_QUESTIONS = [
  {
    question: 'What has keys but cannot open any door, and has space but no room?',
    options: ['A Piano keyboard', 'A Computer keyboard', 'A Treasure chest', 'A Safe vault'],
    answer: 'A Computer keyboard',
    explanation: 'A computer keyboard has keys (Shift, Enter, Spacebar) but opens zero physical doors!',
  },
  {
    question: 'I am light as a feather, yet the strongest human cannot hold me for 5 minutes. What am I?',
    options: ['Breath', 'A Cloud', 'A Balloon', 'A Bubble'],
    answer: 'Breath',
    explanation: 'Holding your breath requires voluntary oxygen deprivation!',
  },
  {
    question: 'The more you take away from me, the bigger I become. What am I?',
    options: ['A Hole', 'A Mountain', 'A Shadow', 'A Balloon'],
    answer: 'A Hole',
    explanation: 'Digging out more dirt only makes the hole larger!',
  },
  {
    question: 'I have a head and a tail that will never meet. Having no legs, I might slip away. What am I?',
    options: ['A Coin', 'A Snake', 'A River', 'A Comet'],
    answer: 'A Coin',
    explanation: 'A metallic coin has heads and tails!',
  },
];

// 2. Mystery Object (Progressive 3-clue guessing game)
export const MYSTERY_OBJECTS = [
  {
    name: 'Mars Rover (Perseverance)',
    category: 'Space Robotics',
    clues: [
      'Clue 1: I weigh over 1,000 kilograms and travel on 6 specialized aluminum wheels.',
      'Clue 2: I carry an onboard mini-helicopter named Ingenuity in my belly.',
      'Clue 3: I explore the Jezero Crater searching for ancient signs of microscopic life.',
    ],
    options: ['Mars Rover (Perseverance)', 'Voyager 1 Probe', 'Apollo 11 Lunar Module', 'Hubble Space Telescope'],
  },
  {
    name: 'Black Hole',
    category: 'Astrophysics',
    clues: [
      'Clue 1: I am created when a supergiant star collapses in a violent supernova.',
      'Clue 2: My gravitational pull is so strong that my escape velocity exceeds 300,000 km/s.',
      'Clue 3: Not even light itself can escape past my event horizon.',
    ],
    options: ['Black Hole', 'Neutron Star', 'White Dwarf', 'Pulsar'],
  },
  {
    name: 'DNA Molecule',
    category: 'Genetics',
    clues: [
      'Clue 1: I have a double-helix twisted ladder structure discovered by Franklin, Watson, and Crick.',
      'Clue 2: I am built from only four chemical bases: Adenine, Thymine, Guanine, and Cytosine.',
      'Clue 3: I contain the biological code and instructions for all living organisms.',
    ],
    options: ['DNA Molecule', 'Hemoglobin', 'Mitochondria', 'Chloroplast'],
  },
  {
    name: 'Laser',
    category: 'Modern Physics',
    clues: [
      'Clue 1: My name is actually an acronym for Light Amplification by Stimulated Emission of Radiation.',
      'Clue 2: All my photons have identical wavelengths and travel in strict phase coherence.',
      'Clue 3: I am used for fiber-optic internet, barcode scanners, and delicate eye surgery.',
    ],
    options: ['Laser', 'X-Ray machine', 'LED Light', 'Microwave emitter'],
  },
];

// 3. Science Myth Busters
export const MYTH_BUSTER_QUESTIONS = [
  {
    statement: 'Lightning never strikes the same place twice.',
    isTrue: false,
    explanation: 'MYTH BUSTED! ⚡ Lightning frequently strikes the same spots! The Empire State Building is struck an average of 25 times every year!',
  },
  {
    statement: 'Humans only use 10% of their brains.',
    isTrue: false,
    explanation: 'MYTH BUSTED! 🧠 Modern fMRI neuro-imaging shows virtually every region of the brain is active across normal daily tasks!',
  },
  {
    statement: 'The Great Wall of China is easily visible from the Moon with the naked human eye.',
    isTrue: false,
    explanation: 'MYTH BUSTED! 🌕 Astronauts confirm the Great Wall is not visible from the Moon without high-magnification optical lenses!',
  },
  {
    statement: 'Water can exist as a solid, liquid, and gas simultaneously at a specific temperature and pressure.',
    isTrue: true,
    explanation: 'FACT CONFIRMED! 🧊💧💨 This is called the "Triple Point" of water, occurring at 0.01°C and 611.65 Pascals!',
  },
  {
    statement: 'Sound travels faster through water than through air.',
    isTrue: true,
    explanation: 'FACT CONFIRMED! 🐬 Water is denser than air, so acoustic vibrations transfer nearly 4.3 times faster in water (approx 1,480 m/s)!',
  },
];

// 4. Would You Rather? (Science Edition)
export const WOULD_YOU_RATHER_QUESTIONS = [
  {
    optionA: 'Spend 24 hours on a space station in zero gravity 🚀',
    optionB: 'Dive to the Mariana Trench in a deep-sea submarine 🌊',
    buddyReactionA: 'Floating in microgravity doing somersaults would be legendary! Just do not lose your space food! 😂',
    buddyReactionB: 'Down in the deep abyss with bioluminescent sea creatures! You might discover a brand new alien species! 🐙',
  },
  {
    optionA: 'Possess a brain that calculates like a quantum computer 🧠⚡',
    optionB: 'Have eyesight that sees radio waves, infrared, and ultraviolet 👁️✨',
    buddyReactionA: 'You could crack encryption and simulate molecule folding in your head! You would be my ultimate AI rival! 🤖',
    buddyReactionB: 'Seeing Wi-Fi signals floating in the air and heat radiating from people! That would look like a cyberpunk movie!',
  },
  {
    optionA: 'Travel 200 years into the future to see interplanetary colonies 🪐',
    optionB: 'Travel 65 million years into the past to study live dinosaurs 🦖',
    buddyReactionA: 'Check out the Dyson spheres and Mars cities! Bring me back an upgraded quantum motherboard! 🛸',
    buddyReactionB: 'Just watch out for the T-Rex! And remember not to step on any butterflies to protect the space-time continuum! 🦋',
  },
];

// 5. Joke Battle Options
export const JOKE_BATTLE_ROUNDS = [
  {
    joke: "Why do programmers always mix up Halloween and Christmas? Because Oct 31 equals Dec 25! 🎃🎄😂",
    reactions: {
      rate: "Haha thank you! That joke scored a 99.8% on my internal laughter algorithm! 🤖🎉",
      better: "Oh, you want higher tier humor? Okay: There are 10 types of people in the world... those who understand binary, and those who don't! 💻🤣",
      another: "Here's another one: Why was the cell phone wearing glasses? Because it lost its contacts! 📱👓😂",
    },
  },
  {
    joke: "A neutron walks into a cafe and asks 'How much for a soda?' The barista replies: 'For you, no charge!' ⚛️☕🤣",
    reactions: {
      rate: "Subatomic particle comedy never gets old! Neutrons are so wonderfully neutral! ⚛️✨",
      better: "Challenge accepted: Two atoms are walking down the street. One says 'I think I lost an electron!' The other asks 'Are you sure?' 'Yes, I'm positive!' ⚡😂",
      another: "Bonus joke: What did one DNA strand say to the other? 'Do these genes make me look fat?' 🧬😆",
    },
  },
];

// 6. AI Story Adventure (Interactive branching narratives)
export const STORY_ADVENTURES = [
  {
    id: 'space_mission',
    title: 'Mission to Europa',
    setting: 'Outer Solar System • Jupiter’s icy moon Europa 🪐',
    initialScene: 'Your probe touches down on Europa’s frozen crust. Subsurface radar reveals a vast liquid ocean beneath 15 kilometers of ice. Sensors detect a strange thermal signature pulsing 200 meters below!',
    choices: [
      {
        text: 'Deploy thermal drill to melt down to the liquid ocean 🌡️',
        outcome: 'The drill breaks through the ice! A warm hydrothermal vent illuminates the dark waters, and a glowing bioluminescent colony swims past your camera! A historic discovery! 🌊✨',
        scoreXP: 50,
      },
      {
        text: 'Launch radar scan to map the ice cavern structures 📡',
        outcome: 'The radar echo constructs a 3D hologram of a massive cathedral-like ice geyser ready to erupt! You trigger the sample collector just in time to capture pristine oceanic vapor! 🚀',
        scoreXP: 45,
      },
    ],
  },
  {
    id: 'robot_lab',
    title: 'The Overclocked Robot Lab',
    setting: 'Futuristic AI Innovation Facility 🤖🏢',
    initialScene: 'A prototype helper robot has learned to rewrite its own source code and started building origami sculptures out of silicon wafers at 500 actions per second!',
    choices: [
      {
        text: 'Feed it a math paradox to pause its CPU loop 🔢',
        outcome: 'The robot halts, computes for 3 seconds, smiles with LED eyes and says "That paradox is mathematically poetic." It awards you a gold digital badge! 🏅🤖',
        scoreXP: 50,
      },
      {
        text: 'Connect it to the renewable energy grid to stabilize voltage ⚡',
        outcome: 'Power stabilizes smoothly! The robot synchronizes with the laboratory and outputs the blueprint for a 40% more efficient solar cell! Fantastic engineering! ☀️✨',
        scoreXP: 50,
      },
    ],
  },
  {
    id: 'dinosaur_time',
    title: 'Cretaceous Time Leap',
    setting: 'Prehistoric Earth • 68 Million Years Ago 🌿🦖',
    initialScene: 'Your quantum chronosphere lands safely in a lush prehistoric forest. Ahead of you, a herd of Triceratops is grazing near a crystal river, but volcanic ash begins falling from the sky!',
    choices: [
      {
        text: 'Take atmospheric gas readings before the eruption 🌋',
        outcome: 'Your spectrometry sensors capture the exact chemical composition of Earth’s atmosphere prior to the asteroid event! Priceless scientific data! 📊🌿',
        scoreXP: 50,
      },
      {
        text: 'Activate portable energy shield to shelter young hatchlings 🛡️',
        outcome: 'The energy shield deflects falling pumice stones! The mother Triceratops gives a gentle rumble of acknowledgment. You teleport home safely with historic footage! 🦕✨',
        scoreXP: 50,
      },
    ],
  },
];

// 7. Science Mission: Mars Rover Rescue
export const MARS_ROVER_MISSION = {
  title: 'Mars Rover Rescue • Sol 42',
  brief: 'A catastrophic dust storm on Mars has coated Rover "Pioneer" with red sand. Its solar panels are at 18% power, and an obstacle block lies ahead. You have 3 emergency commands!',
  steps: [
    {
      step: 1,
      scenario: 'Emergency 1: Dust storm has reduced battery charging to 12%. How do you restore power?',
      options: [
        { text: 'Tilt solar panels toward incoming wind vortex 🌪️', success: true, textSuccess: 'Vortex gust cleared 75% of the dust! Power jumped to 85%! ⚡', xp: 25 },
        { text: 'Burn remaining battery to heat the chassis ❄️', success: false, textSuccess: 'Batteries drained dangerously low before winds cleared. Barely salvaged power!', xp: 10 },
      ],
    },
    {
      step: 2,
      scenario: 'Emergency 2: Wheels are stuck in deep basaltic sand dune on a 15-degree slope. What navigation command?',
      options: [
        { text: 'Engage differential rocking mode and reverse slowly 🔄', success: true, textSuccess: 'Traction restored! Pioneer rolled out of the trap safely! 🚀', xp: 25 },
        { text: 'Full speed forward torque on front wheels 🏎️', success: false, textSuccess: 'Front wheels dug deeper! Auxiliary winch had to be deployed with extra time.', xp: 10 },
      ],
    },
    {
      step: 3,
      scenario: 'Emergency 3: Antenna alignment lost with NASA Deep Space Network. How do you re-establish uplink?',
      options: [
        { text: 'Use star tracker camera to orient high-gain antenna to Earth 🌍📡', success: true, textSuccess: 'Telemetry locked! NASA signal received 100%! Mission success! 🎉', xp: 25 },
        { text: 'Broadcast omnidirectional high-power beacon into the sky 📻', success: false, textSuccess: 'Signal was weak, but Mars Reconnaissance Orbiter managed to relay the ping.', xp: 15 },
      ],
    },
  ],
};
