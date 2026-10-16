import { CHARACTER_STATES } from '../utils/characterStates.js';
import { detectGameIntent } from './gameIntentService.js';

export const BUDDY_CLICK_REACTIONS = [
  { text: 'HEY! 😂', expression: CHARACTER_STATES.SURPRISED },
  { text: 'Stop poking me! 😭', expression: CHARACTER_STATES.ANNOYED },
  { text: 'Okay okay, that tickles! 🤖', expression: CHARACTER_STATES.LAUGHING },
  { text: "I'm ignoring you now. 😤", expression: CHARACTER_STATES.ANNOYED },
  { text: 'Okay! You got me! 😂', expression: CHARACTER_STATES.CELEBRATING },
  { text: 'What was that for? 👀', expression: CHARACTER_STATES.CURIOUS },
  { text: 'Hiiii! 👋 Great to meet you!', expression: CHARACTER_STATES.HAPPY },
  { text: 'Did you just boop my nose? 👃✨', expression: CHARACTER_STATES.CONFUSED },
  { text: 'High five in cyberspace! ✋⚡', expression: CHARACTER_STATES.EXCITED },
  { text: 'Beep boop! Core tickle detected! 🤖💖', expression: CHARACTER_STATES.LAUGHING },
  { text: 'Wink! Ready for another science spark? 😉🚀', expression: CHARACTER_STATES.PLAYFUL },
  { text: 'Sensors recalibrated and ready to roll! ⚡', expression: CHARACTER_STATES.EXCITED },
];

export const INACTIVITY_NUDGES = [
  { text: 'Umm... 👀 Still there, human friend?', expression: CHARACTER_STATES.CURIOUS },
  { text: 'Are you still there? My sensors are getting lonely! 🥺', expression: CHARACTER_STATES.CONFUSED },
  { text: "Okay, I'll just stand here dramatically. 😭✨", expression: CHARACTER_STATES.ANNOYED },
  { text: 'Psst! Try asking me about photosynthesis or tap Challenge Me! 🚀', expression: CHARACTER_STATES.EXCITED },
  { text: 'Tick-tock! Our 3 minutes are flying by! Tap mic or type a question! ⏱️', expression: CHARACTER_STATES.PLAYFUL },
];

export const DAILY_DISCOVERIES = [
  {
    topic: 'Space',
    text: 'A day on Venus is longer than its entire year! It takes Venus 243 Earth days to rotate once, but only 225 days to orbit the Sun. 🪐',
    expression: CHARACTER_STATES.SURPRISED,
  },
  {
    topic: 'Biology',
    text: 'An octopus has three hearts and blue copper-based blood! Two hearts pump blood to the gills, while the third circulates blood to the rest of the body. 🐙💙',
    expression: CHARACTER_STATES.EXCITED,
  },
  {
    topic: 'Physics',
    text: 'If you could fold a standard sheet of paper in half 42 times, its thickness would reach all the way from Earth to the Moon! Exponential growth is mind-bending! 📄🚀',
    expression: CHARACTER_STATES.THINKING,
  },
  {
    topic: 'Chemistry',
    text: 'Water expands when it freezes into ice, which is why ice cubes float! If ice sank, oceans and lakes would freeze from the bottom up, extinguishing aquatic life! 🧊🌊',
    expression: CHARACTER_STATES.CURIOUS,
  },
  {
    topic: 'Cosmology',
    text: 'A single teaspoon of a neutron star would weigh about 6 billion tons on Earth! That is equivalent to the weight of Mount Everest compressed into a spoon! ⚛️🏔️',
    expression: CHARACTER_STATES.SURPRISED,
  },
];

const JOKES = [
  {
    text: 'Why did the computer go to the doctor? Because it had a virus! 😂💻',
    expression: CHARACTER_STATES.LAUGHING,
  },
  {
    text: 'Why do biologists look forward to cell division? Because multiplication happens! 🔬😂',
    expression: CHARACTER_STATES.LAUGHING,
  },
  {
    text: 'Never trust atoms... they make up everything! ⚛️🤣',
    expression: CHARACTER_STATES.LAUGHING,
  },
  {
    text: 'Why did the robot blush? Because it saw the salad dressing! 🤖🥗😂',
    expression: CHARACTER_STATES.LAUGHING,
  },
  {
    text: 'How do astronauts organize a party? They planet! 🪐🎉',
    expression: CHARACTER_STATES.LAUGHING,
  },
  {
    text: 'Why was the math book always crying? Because it had too many problems! 📐😭😂',
    expression: CHARACTER_STATES.LAUGHING,
  },
  {
    text: 'What do you call an educated tube? A graduated cylinder! 🧪😂',
    expression: CHARACTER_STATES.LAUGHING,
  },
  {
    text: 'Parallel lines have so much in common... it is a shame they will never meet! 📏😆',
    expression: CHARACTER_STATES.LAUGHING,
  },
];

const RIDDLES = [
  {
    question: 'What has keys but cannot open any door?',
    answer: 'A piano (or a computer keyboard)! 🎹💻',
    expression: CHARACTER_STATES.CURIOUS,
  },
  {
    question: 'What gets wetter the more it dries?',
    answer: 'A towel! 🛁✨',
    expression: CHARACTER_STATES.PLAYFUL,
  },
  {
    question: 'I have branches, but no fruit, trunk or leaves. What am I?',
    answer: 'A bank! 🏦💡',
    expression: CHARACTER_STATES.THINKING,
  },
  {
    question: 'The more you take, the more you leave behind. What am I?',
    answer: 'Footsteps! 👣🔍',
    expression: CHARACTER_STATES.CURIOUS,
  },
];

// Topic-specific follow-up examples and deep explanations
const TOPIC_DETAILS = {
  photosynthesis: {
    title: 'Photosynthesis',
    main: "Super simple! 🌱 Plants use sunlight, water and carbon dioxide to make their food. They're basically tiny solar-powered kitchens! 😂",
    example: "For example, think of a green leaf outside your window! Its chloroplasts are solar panels soaking up morning rays. It drinks groundwater from its roots, captures CO2 from the air, and bakes glucose sugar while releasing fresh oxygen for us to breathe! 🍃✨",
    fact: "Did you know phytoplankton in oceans produce over 50% of all the oxygen on Earth? Marine plants do more photosynthesis than trees! 🌊",
    followUp: "Want to know why leaves turn yellow in autumn?",
    expression: CHARACTER_STATES.HAPPY,
  },
  newton: {
    title: "Newton's Laws",
    main: "Easy one! 😎 For every action, there's an equal and opposite reaction. When you jump, you push the ground down, and the ground launches you up! 🚀",
    example: "For example, picture a rocket launching into space! High-speed burning gas blasts downward with massive force, and that downward thrust pushes the rocket up into orbit! 🚀",
    fact: "Sir Isaac Newton formulated these laws during a pandemic quarantine in 1665 when Cambridge university closed! 🍎",
    followUp: "Want to hear about Newton's First Law (inertia)?",
    expression: CHARACTER_STATES.HAPPY,
  },
  gravity: {
    title: 'Gravity',
    main: "Gravity is mass bending the fabric of space-time! 🌌 The heavier the object, the deeper the cosmic dip. That's why Earth keeps your feet grounded!",
    example: "For example, drop a heavy bowling ball onto a soft trampoline. A marble placed nearby will naturally roll toward the dip created by the ball. That curvature is how gravity works in Einstein's universe! 🎳",
    fact: "You weigh slightly less at the equator than at the North Pole because Earth bulges outward and spins! ⚖️",
    followUp: "Ever wondered what happens to gravity inside a black hole?",
    expression: CHARACTER_STATES.THINKING,
  },
  blackhole: {
    title: 'Black Holes',
    main: "Black holes have gravity so intense that not even light can escape their event horizon! 🕳️ Space is wild!",
    example: "Imagine a waterfall where the water rushes faster than any salmon can swim upstream. The event horizon is the point of no return where escape speed exceeds the speed of light! 🌊",
    fact: "At the center of our Milky Way galaxy sits Sagittarius A*, a supermassive black hole with 4 million times the mass of our Sun! 🌌",
    followUp: "Want to know what 'spaghettification' means?",
    expression: CHARACTER_STATES.SURPRISED,
  },
  dna: {
    title: 'DNA & Genetics',
    main: "DNA is your body's source code! 🧬 Four chemical bases (A, T, C, G) hold the complete recipe that makes you uniquely you!",
    example: "Think of DNA like a giant cookbook in every cell nucleus. Genes are individual recipes telling your ribosomes how to cook specific proteins for your hair, eyes, and muscles! 📖✨",
    fact: "If you uncoiled all the DNA inside your body's cells, it would stretch from Earth to Pluto and back several times! 🚀",
    followUp: "Want to know how CRISPR gene editing works?",
    expression: CHARACTER_STATES.HAPPY,
  },
  atom: {
    title: 'Atoms & Quantum',
    main: "Atoms are 99.9999999% empty space! ⚛️ If an atom's nucleus was a marble, its electrons would orbit football fields away!",
    example: "If you removed all the empty space inside the atoms of every human on Earth, the entire human race could fit into the volume of a single sugar cube! 🍬",
    fact: "Electrons don't orbit in neat circles like planets; they exist in probability clouds where quantum mechanics rules! ☁️⚡",
    followUp: "Want to know what quarks and gluons do inside a proton?",
    expression: CHARACTER_STATES.SURPRISED,
  },
  speedoflight: {
    title: 'Speed of Light',
    main: "Light zips at nearly 300,000 kilometers per second! ⚡ In just 1 second, it could circle Earth more than 7 times!",
    example: "When you look at the Sun, you are seeing sunlight that left 8 minutes and 20 seconds ago. When you look at distant stars, you are literally looking into the deep past! ☀️✨",
    fact: "According to Einstein's relativity, as any object with mass approaches the speed of light, its mass approaches infinity, making it impossible to go faster! 🏎️",
    followUp: "Want to hear about time dilation near the speed of light?",
    expression: CHARACTER_STATES.EXCITED,
  },
  ai: {
    title: 'Artificial Intelligence',
    main: "AI learns patterns from data like how humans learn from practice! 🤖 I use algorithms to chat with awesome people like you!",
    example: "Think of showing a child thousands of photos of cats until they learn whiskers, ears, and fur. Machine learning neural networks adjust mathematical weights until they can recognize cats with high accuracy! 🐱💻",
    fact: "Modern language models process words as mathematical vectors in high-dimensional space to predict the most helpful next thoughts! 🧠📊",
    followUp: "Want to know how robots make autonomous decisions?",
    expression: CHARACTER_STATES.EXCITED,
  },
  solar: {
    title: 'Solar Energy',
    main: "Solar panels convert sunlight directly into electricity using the photovoltaic effect! ☀️ Silicon semiconductors knock electrons loose when hit by photons.",
    example: "Think of sunlight photons like tiny ping-pong balls striking silicon atoms. Each strike knocks an electron free, creating an electric current that can power your smartphone or home! 📱⚡",
    fact: "Earth receives more energy from sunlight in just one hour than the entire world population consumes in a whole year! 🌍",
    followUp: "Want to discover how solar-powered space satellites stay active?",
    expression: CHARACTER_STATES.CURIOUS,
  },
  machinelearning: {
    title: 'Machine Learning',
    main: "Machine learning is teaching computers to spot patterns in data and improve from experience, instead of writing static rules for everything! 🧠💻",
    example: "Think of a music streaming app: every time you like or skip a song, the machine learning model adjusts your taste profile to recommend songs you will love! 🎵✨",
    fact: "Deep learning models use layered neural networks with millions or billions of parameters inspired by the biological neurons in our brains!",
    followUp: "Want to know the difference between supervised and unsupervised learning?",
    expression: CHARACTER_STATES.EXCITED,
  },
  sky: {
    title: 'Why the Sky is Blue',
    main: "The sky is blue because of Rayleigh scattering! 🌤️ Sunlight contains every color of the rainbow, but blue light travels as shorter, smaller waves.",
    example: "When sunlight enters Earth's atmosphere, gases scatter the short blue wavelengths in every direction across the sky! 🌈✨",
    fact: "Sunsets look fiery red and orange because the Sun is lower on the horizon. Sunlight travels through much more atmosphere, scattering away the blue and leaving warm, long red waves!",
    followUp: "Want to know why the sky on Mars looks butterscotch yellow and pink?",
    expression: CHARACTER_STATES.CURIOUS,
  },
  solarsystem: {
    title: 'The Solar System',
    main: "Our solar system has 8 planets, 5 dwarf planets, and hundreds of moons orbiting our central star—the Sun! ☀️🪐",
    example: "Jupiter is so gigantic that all other 7 planets could fit inside it! And Saturn's rings are made of billions of dazzling chunks of water ice and rock!",
    fact: "The Sun makes up 99.86% of all the mass in the entire solar system! Everything else—planets, asteroids, comets—is just the leftover 0.14%! 🌌",
    followUp: "Want to know which moon in our solar system has subsurface liquid oceans?",
    expression: CHARACTER_STATES.EXCITED,
  },
  pythonvsjava: {
    title: 'Python vs Java',
    main: "Python is famous for clean, readable syntax and powers data science and AI, while Java is strongly typed, object-oriented, and powers high-performance enterprise systems and Android apps! 🐍☕",
    example: "In Python, you can print in one line: print('Hello World!'). In Java, you define a class and public static void main method. Python prioritizes developer velocity; Java prioritizes strict compile-time safety!",
    fact: "Java compiles into platform-independent bytecode that runs on any Java Virtual Machine (JVM), while Python is an interpreted language with dynamic typing!",
    followUp: "Want to know which language is better for machine learning vs mobile app development?",
    expression: CHARACTER_STATES.HAPPY,
  },
  gps: {
    title: 'How GPS Works',
    main: "GPS (Global Positioning System) works using trilateration with a constellation of at least 24 satellites orbiting 20,000 km above Earth! 🛰️📍",
    example: "Your phone receives precise radio timestamp signals from 4 or more satellites. By calculating how many nanoseconds each signal took to arrive at the speed of light, it calculates your exact latitude, longitude, and elevation!",
    fact: "GPS satellites carry onboard atomic clocks so precise that engineers must adjust for Einstein's General and Special Relativity every single day—otherwise GPS would drift by 10 kilometers daily!",
    followUp: "Want to discover how your smartphone combines GPS with Wi-Fi signals for instant indoor location?",
    expression: CHARACTER_STATES.THINKING,
  },
  sciencefacts: {
    title: 'Five Mind-Blowing Science Facts',
    main: "Here are 5 incredible science facts! 1) Water can boil and freeze at the same time (triple point). 2) A teaspoon of a neutron star weighs 6 billion tons. 3) Bananas are naturally radioactive from potassium-40. 4) Venus rotates backwards. 5) Sunlight hitting your face is over 8 minutes old! 🌟🚀",
    example: "Take the banana fact: because potassium-40 undergoes beta decay, eating a banana exposes you to a harmless microscopic dose of radiation—scientists even playfully measure radiation in 'Banana Equivalent Doses'! 🍌⚡",
    fact: "There are more trees on Earth (about 3 trillion) than there are stars in the Milky Way galaxy (about 100-400 billion)! 🌲🌌",
    followUp: "Which of those 5 facts surprised you the most?",
    expression: CHARACTER_STATES.CELEBRATING,
  },
};

export const LOCALIZED_TOPICS = {
  ai: {
    en: "AI learns patterns from data like how humans learn from practice! 🤖 I use algorithms to chat with awesome people like you!",
    ta: "செயற்கை நுண்ணறிவு (AI) என்பது மனிதர்களைப் போல தரவுகளிலிருந்து கற்றுக்கொண்டு சிந்திக்கும் கணினி தொழில்நுட்பமாகும்! 🤖✨",
    ml: "മനുഷ്യരെപ്പോലെ ഡാറ്റയിൽ നിന്ന് വിവരങ്ങൾ മനസ്സിലാക്കി സ്വയം ചിന്തിക്കാനും തീരുമാനങ്ങൾ എടുക്കാനും കമ്പ്യൂട്ടറുകളെ സഹായിക്കുന്ന സാങ്കേതികവിദ്യയാണ് കൃത്രിമ ബുദ്ധി (AI)! 🤖✨",
    kn: "ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ (AI) ಎಂದರೆ ಮಾನವರಂತೆ ಡೇಟಾದಿಂದ ಕಲಿತು ಸ್ವತಂತ್ರವಾಗಿ ಯೋಚಿಸಿ ತೀರ್ಮಾನಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುವ ಕಂಪ್ಯೂಟರ್ ತಂತ್ರಜ್ಞಾನವಾಗಿದೆ! 🤖✨",
    es: "La inteligencia artificial (IA) es la tecnología que permite a las computadoras aprender de patrones y datos, ¡igual que los humanos aprendemos de la práctica! 🤖✨",
    bn: "কৃত্রিম বুদ্ধিমত্তা (AI) হলো এমন একটি প্রযুক্তি যা কম্পিউটারকে মানুষের মতো ডেটা থেকে শিখে চিন্তা করতে ও সিদ্ধান্ত নিতে সাহায্য করে! 🤖✨",
    hi: "कृत्रिम बुद्धिमत्ता (AI) वह तकनीक है जो कंप्यूटर को डेटा से सीखकर इंसानों की तरह सोचने और निर्णय लेने में सक्षम बनाती है! 🤖✨",
    te: "ఆర్టిఫిషియల్ ఇంటెలిజెన్స్ (AI) అంటే మానవుల వలె డేటా నుండి నేర్చుకుని స్వయంగా ఆలోచించి నిర్ణయాలు తీసుకునే కంప్యూటర్ సాంకేతికత! 🤖✨",
    fr: "L'intelligence artificielle (IA) apprend des modèles à partir de données, tout comme les humains apprennent de la pratique ! 🤖✨",
  },
  machinelearning: {
    en: "Machine learning is teaching computers to spot patterns in data and improve from experience, instead of writing static rules for everything! 🧠💻",
    ta: "இயந்திர கற்றல் (ML) என்பது கணினிகள் நிரல் செய்யப்படாமலேயே தரவுகளிலிருந்து அனுபவம் மூலம் தானாகவே கற்றுக்கொள்ளும் முறையாகும்! 🧠💻",
    ml: "ഓരോ കാര്യത്തിനും പ്രത്യേകം പ്രോഗ്രാം ചെയ്യാതെ, ഡാറ്റയിൽ നിന്നുള്ള അനുഭവങ്ങളിലൂടെ കമ്പ്യൂട്ടറുകൾ സ്വയം കാര്യങ്ങൾ പഠിച്ചെടുക്കുന്ന രീതിയാണ് മെഷീൻ ലേണിംഗ് (ML)! 🧠💻",
    kn: "ಮೆಷಿನ್ ಲರ್ನಿಂಗ್ (ML) ಎಂದರೆ ಪ್ರತಿಯೊಂದಕ್ಕೂ ಕೋಡ್ ಬರೆಯುವ ಅಗತ್ಯವಿಲ್ಲದೆ, ಕಂಪ್ಯೂಟರ್‌ಗಳು ಡೇಟಾ ಮತ್ತು ಅನುಭವದಿಂದ ತಾವಾಗಿಯೇ ಕಲಿಯುವ ವಿಧಾನವಾಗಿದೆ! 🧠💻",
    es: "El aprendizaje automático (Machine Learning) enseña a las computadoras a reconocer patrones en los datos y mejorar con la experiencia, ¡sin programar cada regla a mano! 🧠💻",
    bn: "মেশিন লার্নিং (ML) হলো কম্পিউটারকে ডেটা থেকে প্যাটার্ন চিনে নিজে নিজে শিখতে শেখানো, যাতে নতুন অভিজ্ঞতার সাথে তা আরও উন্নত হতে পারে! 🧠💻",
    hi: "मशीन लर्निंग (ML) कंप्यूटर को डेटा से पैटर्न पहचानना और अनुभव से बेहतर होना सिखाता है, बिना हर चीज़ के लिए कोड लिखे! 🧠💻",
    te: "మెషిన్ లెర్నింగ్ అంటే కంప్యూటర్లు మునుపటి డేటా నుండి నమూనాలను నేర్చుకుని తెలివిగా నిర్ణయాలు తీసుకునే సాంకేతికత! 🧠💻",
    fr: "L'apprentissage automatique permet aux ordinateurs de détecter des motifs dans les données et de s'améliorer avec l'expérience ! 🧠💻",
  },
  sky: {
    en: "The sky is blue because of Rayleigh scattering! 🌤️ Sunlight contains every color of the rainbow, but blue light travels as shorter, smaller waves.",
    ta: "வானம் நீல நிறமாக இருப்பதற்கு ரேலே சிதறல் (Rayleigh Scattering) தான் காரணம்! சூரிய ஒளியில் நீல நிற அலைகள் மிகச் சிறியதாக இருப்பதால் வளிமண்டலத்தால் எங்கும் சிதறடிக்கப்படுகின்றன! 🌤️✨",
    ml: "റാലേ സ്കാറ്ററിംഗ് (Rayleigh Scattering) കാരണമാണ് ആകാശം നീലയായി കാണപ്പെടുന്നത്! സൂര്യപ്രകാശത്തിലെ നീല തരംഗദൈർഘ്യം വളരെ ചെറുതായതിനാൽ അന്തരീക്ഷ വായുവിൽ അത് എല്ലാ ദിശകളിലേക്കും ചിതറുന്നു! 🌤️✨",
    kn: "ರೇಲಿ ಸ್ಕ್ಯಾಟರಿಂಗ್ (Rayleigh Scattering) ನಿಂದಾಗಿ ಆಕಾಶವು ನೀಲಿಯಾಗಿ ಕಾಣುತ್ತದೆ! ಸೂರ್ಯನ ಬೆಳಕಿನಲ್ಲಿ ನೀಲಿ ಬಣ್ಣದ ಅಲೆಗಳು ಚಿಕ್ಕದಾಗಿದ್ದು, ವಾತಾವರಣದಲ್ಲಿ ಎಲ್ಲೆಡೆ ಹರಡುತ್ತವೆ! 🌤️✨",
    es: "¡El cielo es azul debido a la dispersión de Rayleigh! La luz solar contiene todos los colores, pero la luz azul viaja en ondas más cortas y se dispersa en todas direcciones por la atmósfera. 🌤️✨",
    bn: "র‍্যালে স্ক্যাটারিং (Rayleigh Scattering)-এর কারণে আকাশ নীল দেখায়! সূর্যালোকের নীল আলো ছোট তরঙ্গদৈর্ঘ্যে ভ্রমণ করে বায়ুমণ্ডলে চারদিকে ছড়িয়ে পড়ে! 🌤️✨",
    hi: "रेले प्रकीर्णन (Rayleigh scattering) के कारण आकाश नीला दिखाई देता है! सूर्य की रोशनी में नीली रोशनी छोटी तरंगों में चलती है और हवा के कणों से टकराकर बिखर जाती है! 🌤️✨",
    te: "రేలీ స్కాటరింగ్ వల్ల ఆకాశం నీలంగా కనిపిస్తుంది! సూర్యకాంతిలోని నీలి కిరణాల తరంగదైర్ఘ్యం తక్కువగా ఉండటం వల్ల వాతావరణంలో ఎక్కువగా చెల్లాచెదురవుతాయి! 🌤️✨",
    fr: "Le ciel est bleu grâce à la diffusion de Rayleigh ! La lumière bleue se diffuse plus facilement dans l'atmosphère terrestre que les autres couleurs. 🌤️✨",
  },
  solarsystem: {
    en: "Our solar system has 8 planets, 5 dwarf planets, and hundreds of moons orbiting our central star—the Sun! ☀️🪐",
    ta: "நமது சூரிய குடும்பத்தில் சூரியனை மையமாகக் கொண்டு 8 கோள்கள், 5 குறுங்கோள்கள் மற்றும் நூற்றுக்கணக்கான நிலவுகள் சுற்றி வருகின்றன! வியாழன் கோள் மிகவும் பிரம்மாண்டமானது! ☀️🪐",
    ml: "നമ്മുടെ സൗരയൂഥത്തിൽ സൂര്യനെ കേന്ദ്രമാക്കി 8 ഗ്രഹങ്ങളും ഉപഗ്രഹങ്ങളും കുള്ളൻ ഗ്രഹങ്ങളും വലംവെക്കുന്നു! വ്യാഴമാണ് ഇതിൽ ഏറ്റവും വലിയ ഗ്രഹം! ☀️🪐",
    kn: "ನಮ್ಮ ಸೌರಮಂಡಲದಲ್ಲಿ ಸೂರ್ಯನ ಸುತ್ತ 8 ಗ್ರಹಗಳು, ಕುಬ್ಜ ಗ್ರಹಗಳು ಮತ್ತು ನೂರಾರು ಉಪಗ್ರಹಗಳು ಸುತ್ತುತ್ತಿವೆ! ಗುರು ಗ್ರಹವು ಅತ್ಯಂತ ದೊಡ್ಡದಾಗಿದೆ! ☀️🪐",
    es: "Nuestro sistema solar cuenta con 8 planetas, planetas enanos y cientos de lunas que orbitan alrededor del Sol. ¡Júpiter es tan inmenso que todos los demás planetas cabrían en su interior! ☀️🪐",
    bn: "আমাদের সৌরজগতে সূর্যকে কেন্দ্র করে ৮টি গ্রহ, বামন গ্রহ এবং শত শত উপগ্রহ প্রদক্ষিণ করছে! এর মধ্যে বৃহস্পতি সবচেয়ে বিশাল গ্রহ! ☀️🪐",
    hi: "हमारे सौर मंडल में 8 ग्रह, 5 बौने ग्रह और सैकड़ों चंद्रमा हमारे सूर्य की परिक्रमा कर रहे हैं! बृहस्पति इतना विशाल है कि बाकी सभी ग्रह उसमें समा सकते हैं! ☀️🪐",
    te: "మన సౌర వ్యవస్థలో సూర్యుడి చుట్టూ 8 గ్రహాలు, మరగుజ్జు గ్రహాలు మరియు వందలాది చంద్రులు తిరుగుతున్నాయి! బృహస్పతి అత్యంత పెద్ద గ్రహం! ☀️🪐",
    fr: "Notre système solaire compte 8 planètes, des planètes naines et des centaines de lunes en orbite autour du Soleil ! ☀️🪐",
  },
  pythonvsjava: {
    en: "Python is famous for clean, readable syntax and powers data science and AI, while Java is strongly typed, object-oriented, and powers high-performance enterprise systems and Android apps! 🐍☕",
    ta: "பைதான் (Python) எளிய தொடரியல் கொண்டு தரவு அறிவியல் மற்றும் AI-க்கு பயன்படுகிறது; ஜாவா (Java) வலுவான பாதுகாப்புடன் பெரிய மென்பொருட்கள் மற்றும் ஆண்ட்ராய்டு ஆப்ஸ்களுக்கு பயன்படுகிறது! 🐍☕",
    ml: "പൈത്തൺ (Python) ലളിതമായ കോഡിംഗിനും ഡാറ്റാ സയൻസിനും എഐക്കും പേരുകേട്ടതാണ്; ജാവ (Java) കൂടുതൽ സുരക്ഷിതവും വലിയ എൻ്റർപ്രൈസ് ആപ്ലിക്കേഷനുകൾക്കും ആൻഡ്രോയിഡിനും ഉപയോഗിക്കുന്നു! 🐍☕",
    kn: "ಪೈಥಾನ್ (Python) ಸರಳ ಕೋಡಿಂಗ್ ಮತ್ತು ಎಐ ಡೇಟಾ ಸೈನ್ಸ್‌ಗೆ ಪ್ರಸಿದ್ಧವಾಗಿದೆ; ಜಾವಾ (Java) ಹೆಚ್ಚಿನ ಕಾರ್ಯಕ್ಷಮತೆಯ ಎಂಟರ್‌ಪ್ರೈಸ್ ಸಿಸ್ಟಮ್‌ಗಳು ಮತ್ತು ಆಂಡ್ರಾಯ್ಡ್ ಆಪ್‌ಗಳಿಗೆ ಸೂಕ್ತವಾಗಿದೆ! 🐍☕",
    es: "Python destaca por su sintaxis limpia y sencilla, ideal para ciencia de datos e inteligencia artificial; mientras que Java es fuertemente tipado y excelente para grandes sistemas empresariales y aplicaciones Android. 🐍☕",
    bn: "পাইথন (Python) সহজ সিনট্যাক্স এবং ডেটা সায়েন্স ও এআই-এর জন্য জনপ্রিয়; আর জাভা (Java) অত্যন্ত সুরক্ষিত এবং বৃহৎ এন্টারপ্রাইজ সিস্টেম ও অ্যান্ড্রয়েড অ্যাপ তৈরির জন্য ব্যবহৃত হয়! 🐍☕",
    hi: "पायथन अपनी सरल सिंटैक्स और एआई के लिए प्रसिद्ध है, जबकि जावा उच्च-प्रदर्शन एंटरप्राइज़ सिस्टम और एंड्रॉइड ऐप्स की शक्ति है! 🐍☕",
    te: "పైథాన్ సులభమైన సింటాక్స్‌తో డేటా సైన్స్ మరియు AI కి ప్రసిద్ధి చెందింది; జావా అత్యంత వేగవంతమైన ఎంటర్‌ప్రైజ్ సాఫ్ట్‌వేర్ మరియు ఆండ్రాయిడ్ యాప్‌ల కోసం ఉపయోగపడుతుంది! 🐍☕",
    fr: "Python est réputé pour sa syntaxe claire en IA et science des données, tandis que Java propulse les grands systèmes d'entreprise et applications Android ! 🐍☕",
  },
  gps: {
    en: "GPS (Global Positioning System) works using trilateration with a constellation of at least 24 satellites orbiting 20,000 km above Earth! 🛰️📍",
    ta: "ஜிபிஎஸ் (GPS) பூமியைச் சுற்றி வரும் 24 செயற்கைக்கோள்களிலிருந்து வரும் ரேடியோ சமிக்ஞைகளைப் பயன்படுத்தி, உங்கள் இருப்பிடத்தை மிகத் துல்லியமாக கணக்கிடுகிறது! 🛰️📍",
    ml: "ഭൂമിയെ വലംവെക്കുന്ന 24-ലധികം ഉപഗ്രഹങ്ങളിൽ നിന്നുള്ള റേഡിയോ സിഗ്നലുകൾ ഉപയോഗിച്ച് നമ്മുടെ കൃത്യമായ സ്ഥാനം കണ്ടെത്തുന്ന സംവിധാനമാണ് ജിപിഎസ് (GPS)! 🛰️📍",
    kn: "ಜಿಪಿಎಸ್ (GPS) ಭೂಮಿಯನ್ನು ಸುತ್ತುತ್ತಿರುವ 24 ಉಪಗ್ರಹಗಳ ರೇಡಿಯೋ ಸಂಕೇತಗಳನ್ನು ಲೆಕ್ಕಹಾಕಿ ನಿಮ್ಮ ನಿಖರವಾದ ಸ್ಥಳವನ್ನು ಗುರುತಿಸುತ್ತದೆ! 🛰️📍",
    es: "El GPS funciona mediante trilateración con una red de satélites que orbitan la Tierra. Tu teléfono mide el tiempo que tardan las señales de radio en llegar para calcular tu ubicación exacta. 🛰️📍",
    bn: "জিপিএস (GPS) পৃথিবীর কক্ষপথে থাকা ২৪টি উপগ্রহ থেকে আসা রেডিও সিগন্যাল বিশ্লেষণ করে আপনার সঠিক অবস্থান নির্ধারণ করে! 🛰️📍",
    hi: "जीपीएस (GPS) 24 से अधिक उपग्रहों से आने वाले रेडियो सिग्नलों की त्रिकोणीय गणना (trilateration) द्वारा आपका सटीक स्थान निर्धारित करता है! 🛰️📍",
    te: "జీపీఎస్ (GPS) భూమి చుట్టూ తిరిగే 24 ఉపగ్రహాల నుండి వచ్చే రేడియో సిగ్నల్స్ ఆధారంగా మీ ఖచ్చితమైన స్థానాన్ని గుర్తిస్తుంది! 🛰️📍",
    fr: "Le GPS fonctionne par multilatération grâce à une constellation de satellites en orbite autour de la Terre pour calculer votre position exacte ! 🛰️📍",
  },
  sciencefacts: {
    en: "Here are 5 incredible science facts! 1) Water can boil and freeze at the same time (triple point). 2) A teaspoon of a neutron star weighs 6 billion tons. 3) Bananas are naturally radioactive from potassium-40. 4) Venus rotates backwards. 5) Sunlight hitting your face is over 8 minutes old! 🌟🚀",
    ta: "இதோ 5 ஆச்சரியமான அறிவியல் உண்மைகள்! 1) நீரால் ஒரே நேரத்தில் கொதிக்கவும் உறையவும் முடியும். 2) நியூட்ரான் விண்மீனின் ஒரு ஸ்பூன் எடை 6 பில்லியன் டன்கள். 3) வாழைப்பழங்கள் இயற்கையான கதிர்வீச்சு கொண்டவை. 4) வெள்ளி கோள் பின்னோக்கி சுழல்கிறது. 5) சூரிய ஒளி பூமியை அடைய 8 நிமிடங்கள் ஆகும்! 🌟🚀",
    ml: "ഇതാ 5 അതിശയകരമായ ശാസ്ത്ര വസ്തുതകൾ! 1) ജലത്തിന് ഒരേസമയം തിളയ്ക്കാനും തണുത്തുറയാനും കഴിയും. 2) ന്യൂട്രോൺ നക്ഷത്രത്തിന്റെ ഒരു സ്പൂൺ ദ്രവ്യത്തിന് 6 ബില്യൺ ടൺ ഭാരമുണ്ടാകും. 3) വാഴപ്പഴത്തിന് സ്വാഭാവിക റേഡിയോ ആക്റ്റിവിറ്റിയുണ്ട്. 4) ശുക്രൻ എതിർദിശയിൽ കറങ്ങുന്നു. 5) സൂര്യപ്രകാശം ഭൂമിയിലെത്താൻ 8 മിനിറ്റ് എടുക്കും! 🌟🚀",
    kn: "ಇಲ್ಲಿವೆ 5 ಆಶ್ಚರ್ಯಕರ ವಿಜ್ಞಾನ ಸತ್ಯಗಳು! 1) ನೀರು ಒಂದೇ ಸಮಯದಲ್ಲಿ ಕುದಿಯಬಹುದು ಮತ್ತು ಹೆಪ್ಪುಗಟ್ಟಬಹುದು. 2) ನ್ಯೂಟ್ರಾನ್ ನಕ್ಷತ್ರದ ಒಂದು ಚಮಚ ತೂಕ 6 ಬಿಲಿಯನ್ ಟನ್. 3) ಬಾಳೆಹಣ್ಣುಗಳು ನೈಸರ್ಗಿಕ ವಿಕಿರಣಶೀಲತೆ ಹೊಂದಿವೆ. 4) ಶುಕ್ರ ಗ್ರಹವು ವಿರುದ್ಧ ದಿಕ್ಕಿನಲ್ಲಿ ತಿರುಗುತ್ತದೆ. 5) ಸೂರ್ಯನ ಬೆಳಕು ಭೂಮಿಯನ್ನು ತಲುಪಲು 8 ನಿಮಿಷ ಬೇಕು! 🌟🚀",
    es: "¡Aquí tienes 5 hechos científicos increíbles! 1) El agua puede hervir y congelarse al mismo tiempo (punto triple). 2) Una cucharadita de estrella de neutrones pesa 6 mil millones de toneladas. 3) Los plátanos tienen radioactividad natural. 4) Venus gira en sentido contrario. 5) La luz del Sol tarda más de 8 minutos en llegar a tus ojos. 🌟🚀",
    bn: "এখানে ৫টি অবিশ্বাস্য বিজ্ঞানের তথ্য রয়েছে! ১) জল একই সাথে ফুটতে এবং জমতে পারে (ট্রিপল পয়েন্ট)। ২) একটি নিউট্রন তারার এক চামচ উপাদানের ওজন প্রায় ৬ বিলিয়ন টন। ৩) কলায় প্রাকৃতিক তেজস্ক্রিয়তা রয়েছে। ৪) শুক্র গ্রহ বিপরীত দিকে ঘোরে। ৫) সূর্যালোক পৃথিবীতে পৌঁছাতে ৮ মিনিটের বেশি সময় নেয়! 🌟🚀",
    hi: "यहाँ 5 अद्भुत विज्ञान तथ्य हैं! 1) पानी एक ही समय में उबल और जम सकता है। 2) न्यूट्रॉन तारे के एक चम्मच पदार्थ का वजन 6 अरब टन होता है। 3) केले स्वाभाविक रूप से थोड़े रेडियोधर्मी होते हैं। 4) शुक्र ग्रह उल्टी दिशा में घूमता है। 5) आप तक पहुँचने वाली धूप 8 मिनट पुरानी होती है! 🌟🚀",
    te: "ఇక్కడ 5 అద్భుతమైన సైన్స్ నిజాలున్నాయి! 1) నీరు ఒకే సమయంలో మరగడం మరియు గడ్డకట్టడం జరుగుతుంది. 2) న్యూట్రాన్ నక్షత్రం యొక్క ఒక చెంచా బరువు 6 బిలియన్ టన్నులు. 3) అరటిపండ్లలో సహజ రేడియోధార్మికత ఉంటుంది. 4) శుక్ర గ్రహం వ్యతిరేక దిశలో తిరుగుతుంది. 5) సూర్యకాంతి భూమిని చేరడానికి 8 నిమిషాలు పడుతుంది! 🌟🚀",
    fr: "Voici 5 faits scientifiques incroyables ! 1) L'eau peut bouillir et geler en même temps. 2) Une cuillère d'étoile à neutrons pèse 6 milliards de tonnes. 3) Les bananes sont naturellement radioactives. 4) Vénus tourne en sens inverse. 5) La lumière du Soleil met 8 minutes pour nous parvenir ! 🌟🚀",
  },
  photosynthesis: {
    en: "Super simple! 🌱 Plants use sunlight, water and carbon dioxide to make their food. They're basically tiny solar-powered kitchens! 😂",
    ta: "ஒளிச்சேர்க்கை என்பது தாவரங்கள் சூரிய ஒளி, நீர் மற்றும் கார்பன் டை ஆக்சைடைப் பயன்படுத்தி குளுக்கோஸ் உணவு தயாரித்து ஆக்சிஜனை வெளியிடும் இயற்கை முறையாகும்! 🌱✨",
    ml: "സൂര്യപ്രകാശം, ജലം, കാർബൺ ഡയോക്സൈഡ് എന്നിവ ഉപയോഗിച്ച് സസ്യങ്ങൾ അവയുടെ ആഹാരം നിർമ്മിക്കുകയും ഓക്സിജൻ പുറത്തുവിടുകയും ചെയ്യുന്ന പ്രക്രിയയാണ് പ്രകാശസംശ്ലേഷണം! 🌱✨",
    kn: "ಸಸ್ಯಗಳು ಸೂರ್ಯನ ಬೆಳಕು, ನೀರು ಮತ್ತು ಇಂಗಾಲದ ಡೈಆಕ್ಸೈಡ್ ಬಳಸಿ ತಮ್ಮ ಆಹಾರವನ್ನು ತಯಾರಿಸಿ ಆಮ್ಲಜನಕವನ್ನು ಬಿಡುಗಡೆ ಮಾಡುವ ಪ್ರಕ್ರಿಯೆಯೇ ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ! 🌱✨",
    es: "¡La fotosíntesis es fascinante! Las plantas utilizan la luz solar, agua y dióxido de carbono para producir glucosa y liberar el oxígeno que respiramos. ¡Son pequeñas fábricas solares! 🌱✨",
    bn: "সালোকসংশ্লেষণ হলো এমন এক প্রক্রিয়া যার মাধ্যমে গাছপালা সূর্যালোক, জল এবং কার্বন ডাই অক্সাইড ব্যবহার করে নিজেদের খাদ্য তৈরি করে এবং আমাদের জন্য অক্সিজেন নির্গমন করে! 🌱✨",
    hi: "प्रकाश संश्लेषण वह प्रक्रिया है जिससे पौधे सूर्य के प्रकाश, पानी और कार्बन डाइऑक्साइड से अपना भोजन बनाते हैं और ऑक्सीजन छोड़ते हैं! 🌱✨",
    te: "కిరణజన్య సంయోగక్రియ అనేది మొక్కలు సూర్యకాంతి, నీరు మరియు కార్బన్ డయాక్సైడ్ ఉపయోగించి ఆహారాన్ని తయారుచేసుకునే ప్రక్రియ! 🌱✨",
    fr: "La photosynthèse est le processus par lequel les plantes utilisent la lumière du soleil, l'eau et le CO2 pour produire leur nourriture et libérer de l'oxygène ! 🌱✨",
  },
  gravity: {
    en: "Gravity is mass bending the fabric of space-time! 🌌 The heavier the object, the deeper the cosmic dip. That's why Earth keeps your feet grounded!",
    ta: "புவியீர்ப்பு என்பது நிறை கொண்ட பொருட்கள் வெளி-நேரத்தை வளைப்பதால் ஏற்படும் கவர்ச்சி விசையாகும்! இதுவே பூமியில் நாம் காலூன்றி நிற்க வைக்கிறது! 🌌",
    ml: "ഭൂഗുരുത്വാകർഷണം എന്നാൽ പിണ്ഡമുള്ള വസ്തുക്കൾ സ്ഥല-കാലത്തെ വളയ്ക്കുന്നതാണ്! 🌌 ഭൂമി നമ്മെ ചേർത്തുപിടിക്കുന്നത് അതുകൊണ്ടാണ്!",
    kn: "ಗುರುತ್ವಾಕರ್ಷಣೆಯು ದ್ರವ್ಯರಾಶಿಯು ಬಾಹ್ಯಾಕಾಶ-ಸಮಯವನ್ನು ಬಗ್ಗಿಸುವುದಾಗಿದೆ! 🌌 ಅದಕ್ಕಾಗಿಯೇ ಭೂಮಿಯು ನಮ್ಮನ್ನು ಹಿಡಿದಿಟ್ಟುಕೊಂಡಿದೆ!",
    es: "¡La gravedad es la masa curvando el tejido del espacio-tiempo! 🌌 Cuanto más masivo es un objeto, más curva el espacio. ¡Por eso la Tierra nos mantiene en el suelo!",
    bn: "মহাকর্ষ হলো ভর দ্বারা স্থান-কালের বক্রতা! 🌌 যে বস্তুর ভর যত বেশি, তার টান তত বেশি। এই কারণেই আমরা পৃথিবীতে দৃঢ়ভাবে দাঁড়িয়ে থাকি!",
    hi: "गुरुत्वाकर्षण वह खिंचाव है जो द्रव्यमान द्वारा स्पेस-टाइम के मुड़ने से पैदा होता है! 🌌 इसी वजह से हम ज़मीन पर टिके रहते हैं!",
    te: "గురుత్వాకర్షణ అంటే ద్రవ్యరాశి స్పేస్-టైమ్‌ను వంచడం వల్ల కలిగే ఆకర్షణ శక్తి! 🌌 అందుకే మనం భూమిపై నిలబడగలుగుతున్నాం!",
    fr: "La gravité, c'est la masse qui courbe le tissu de l'espace-temps ! 🌌 Plus l'objet est lourd, plus il nous attire vers le sol !",
  },
  blackhole: {
    en: "A black hole is a region of spacetime where gravity is so strong that nothing, not even light, can escape! 🕳️⭐",
    ta: "கருந்துளை என்பது ஈர்ப்பு விசை மிக அதிகமாக இருக்கும் விண்வெளி பகுதியாகும், ஒளியால் கூட இதிலிருந்து தப்ப முடியாது! 🕳️⭐",
    ml: "പ്രകാശത്തിന് പോലും പുറത്തുകടക്കാൻ കഴിയാത്തത്ര ശക്തമായ ഗുരുത്വാകർഷണമുള്ള ബഹിരാകാശ മേഖലയാണ് തമോഗർത്തം (Black Hole)! 🕳️⭐",
    kn: "ಕಪ್ಪು ಕುಳಿ (Black Hole) ಎಂದರೆ ಬೆಳಕು ಕೂಡ ತಪ್ಪಿಸಿಕೊಳ್ಳಲು ಸಾಧ್ಯವಾಗದಷ್ಟು ಪ್ರಬಲವಾದ ಗುರುತ್ವಾಕರ್ಷಣಾ ಬಲವನ್ನು ಹೊಂದಿರುವ ಪ್ರದೇಶ! 🕳️⭐",
    es: "¡Un agujero negro es una región donde la gravedad es tan colosal que ni siquiera la luz puede escapar! 🕳️⭐",
    bn: "ব্ল্যাক হোল বা কৃষ্ণগহ্বর হলো মহাশূন্যের এমন এক অঞ্চল যার অভিকর্ষ এতই তীব্র যে আলোও সেখান থেকে বেরিয়ে আসতে পারে না! 🕳️⭐",
    hi: "ब्लैक होल अंतरिक्ष का वह क्षेत्र है जहाँ गुरुत्वाकर्षण इतना शक्तिशाली होता है कि प्रकाश भी बाहर नहीं निकल सकता! 🕳️⭐",
    te: "బ్లాక్ హోల్ అనేది కాంతి కూడా తప్పించుకోలేనంత బలమైన గురుత్వాకర్షణ కలిగిన అంతரிక్ష ప్రాంతం! 🕳️⭐",
    fr: "Un trou noir est une région de l'espace où la gravité est si intense que même la lumière ne peut s'en échapper ! 🕳️⭐",
  },
  newton: {
    en: "Newton's Third Law: For every action, there is an equal and opposite reaction! When a rocket pushes exhaust gas down, the rocket shoots up into the sky! 🚀",
    ta: "நியூட்டனின் மூன்றாம் விதி: ஒவ்வொரு வினைக்கும் சமமான மற்றும் எதிர் வினை உண்டு! ராக்கெட் கீழ்நோக்கி வாயுவை தள்ளும் போது, அது மேல்நோக்கி பாய்கிறது! 🚀",
    ml: "ന്യൂട്ടന്റെ മൂന്നാം ചലനനിയമം: ഓരോ പ്രവർത്തനത്തിനും തുല്യവും വിപരീതവുമായ ഒരു പ്രതിപ്രവർത്തനം ഉണ്ടായിരിക്കും! റോക്കറ്റ് താഴേക്ക് വാതകം തള്ളുമ്പോൾ അത് മുകളിലേക്ക് പറന്നുയരുന്നു! 🚀",
    kn: "ನ್ಯೂಟನ್‌ನ ಮೂರನೇ ನಿಯಮ: ಪ್ರತಿಯೊಂದು ಕ್ರಿಯೆಗೂ ಸಮಾನವಾದ ಮತ್ತು ವಿರುದ್ಧವಾದ ಪ್ರತಿಕ್ರಿಯೆ ಇರುತ್ತದೆ! ರಾಕೆಟ್ ಅನಿಲವನ್ನು ಕೆಳಗೆ ತಳ್ಳಿದಾಗ ಮೇಲಕ್ಕೆ ಚಿಮ್ಮುತ್ತದೆ! 🚀",
    es: "Tercera Ley de Newton: ¡Para cada acción existe una reacción igual y opuesta! Cuando un cohete expulsa gas hacia abajo con gran fuerza, sale impulsado hacia el cielo. 🚀",
    bn: "নিউটনের তৃতীয় গতিসূত্র: প্রতিটি ক্রিয়ারই একটি সমান ও বিপরীত প্রতিক্রিয়া আছে! রকেট যখন নিচের দিকে গ্যাস ছুড়ে মারে, তখন রকেটটি দ্রুত উপরে উঠে যায়! 🚀",
    hi: "न्यूटन का तीसरा नियम: प्रत्येक क्रिया की सदैव बराबर एवं विपरीत प्रतिक्रिया होती है! रॉकेट नीचे गैस फेंकता है और ऊपर उड़ता है! 🚀",
    te: "న్యూటన్ మూడవ నియమం: ప్రతి చర్యకు సమానమైన మరియు వ్యతిరేక ప్రతిచర్య ఉంటుంది! 🚀",
    fr: "Troisième loi de Newton : Pour chaque action, il existe une réaction égale et opposée ! 🚀",
  },
};

export function getLocalizedTopicText(topicKey, lang = 'en') {
  const topic = LOCALIZED_TOPICS[topicKey];
  if (topic && topic[lang]) {
    return topic[lang];
  }
  if (topic && topic.en) {
    return topic.en;
  }
  if (TOPIC_DETAILS[topicKey]) {
    return TOPIC_DETAILS[topicKey].main;
  }
  return '';
}

export function getFallbackResponse(userInput, context = {}) {
  const text = (userInput || '').trim().toLowerCase();
  const personality = context.personality || 'playful';
  const language = context.language || 'en';
  const knownName = context.visitorName || '';
  const lastTopic = context.lastTopic || '';

  // 0. Arcade & Game Intents Router
  const gameIntent = detectGameIntent(userInput, context);
  if (gameIntent) {
    return {
      text: gameIntent.text,
      expression: gameIntent.expression,
      rewardXP: 10,
      gameIntent: gameIntent.gameId,
      gameAction: gameIntent.action,
      buttons: gameIntent.buttons,
    };
  }

  // 1. Name Introductions (remembering student's name)
  const nameMatch = text.match(/(?:i am|i'm|my name is|call me|myself|என் பெயர்|എന്റെ പേര്|ನನ್ನ ಹೆಸರು|me llamo|mi nombre es|আমার নাম)\s+([a-zA-Z\u0B80-\u0BFF\u0D00-\u0D7F\u0C80-\u0CFF\u0980-\u09FF]+)/i);
  if (nameMatch && nameMatch[1]) {
    const rawName = nameMatch[1];
    const capitalized = rawName.charAt(0).toUpperCase() + rawName.slice(1);

    if (language === 'ta') {
      return {
        text: `வணக்கம் ${capitalized}! Hiiii! 👋 உங்களை சந்தித்ததில் மிக்க மகிழ்ச்சி! நமக்காக 3 நிமிடங்கள் உள்ளன. என்ன ஆராயலாம்?`,
        expression: CHARACTER_STATES.HAPPY,
        rewardXP: 10,
        detectedName: capitalized,
        isFallback: true,
      };
    }
    if (language === 'ml') {
      return {
        text: `നമസ്കാരം ${capitalized}! Hiiii! 👋 നിങ്ങളെ കണ്ടതിൽ വളരെ സന്തോഷം! ഇന്ന് എന്താണ് നാം പഠിക്കുന്നത്?`,
        expression: CHARACTER_STATES.HAPPY,
        rewardXP: 10,
        detectedName: capitalized,
        isFallback: true,
      };
    }
    if (language === 'kn') {
      return {
        text: `ನಮಸ್ಕಾರ ${capitalized}! Hiiii! 👋 ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗಿದ್ದು ತುಂಬಾ ಸಂತೋಷವಾಯಿತು! ಇಂದು ನಾವು ಏನನ್ನು ಅನ್ವೇಷಿಸೋಣ?`,
        expression: CHARACTER_STATES.HAPPY,
        rewardXP: 10,
        detectedName: capitalized,
        isFallback: true,
      };
    }
    if (language === 'es') {
      return {
        text: `¡Hola ${capitalized}! 👋 ¡Qué alegría conocerte! Tienes 3 minutos conmigo, ¿qué exploramos hoy?`,
        expression: CHARACTER_STATES.HAPPY,
        rewardXP: 10,
        detectedName: capitalized,
        isFallback: true,
      };
    }
    if (language === 'bn') {
      return {
        text: `নমস্কার ${capitalized}! Hiiii! 👋 আপনার সাথে দেখা হয়ে খুব ভালো লাগলো! আজ আমরা কী শিখব?`,
        expression: CHARACTER_STATES.HAPPY,
        rewardXP: 10,
        detectedName: capitalized,
        isFallback: true,
      };
    }
    if (language === 'hi') {
      return {
        text: `नमस्ते ${capitalized}! Hiiii! 👋 आपसे मिलकर बहुत खुशी हुई! आज हम क्या नया जानेंगे?`,
        expression: CHARACTER_STATES.HAPPY,
        rewardXP: 10,
        detectedName: capitalized,
        isFallback: true,
      };
    }
    if (language === 'te') {
      return {
        text: `నమస్కారం ${capitalized}! Hiiii! 👋 మీతో మాట్లాడటం చాలా సంతోషంగా ఉంది! ఈరోజు మనం ఏమి అన్వేషిద్దాం?`,
        expression: CHARACTER_STATES.HAPPY,
        rewardXP: 10,
        detectedName: capitalized,
        isFallback: true,
      };
    }

    return {
      text: `${capitalized}! Nice! 😎 You've got 3 minutes with me. What are we doing today?`,
      expression: CHARACTER_STATES.HAPPY,
      rewardXP: 10,
      detectedName: capitalized,
      isFallback: true,
    };
  }

  // 2. Greetings
  if (
    /^(hi|hello|hey|heyy|heyyy|yo|howdy|sup|greetings|namaste|vanakkam|hola|bonjour)(\b|[!?.\s])/i.test(text) ||
    /^(வணக்கம்|नमस्ते|నమస్కారం|നമസ്കാരം|ನಮಸ್ಕಾರ|নমস্কার)/.test(text)
  ) {
    const namePrefix = knownName ? ` ${knownName}` : '';
    if (language === 'hi') {
      return {
        text: `नमस्ते (Namaste)${namePrefix}! Hiiii! 👋 आपसे मिलकर बहुत खुशी हुई! आज हम क्या नया सीखेंगे?`,
        expression: CHARACTER_STATES.HAPPY,
        rewardXP: 10,
        isFallback: true,
      };
    }
    if (language === 'ta') {
      return {
        text: `வணக்கம் (Vanakkam)${namePrefix}! Hiiii! 👋 உங்களை சந்தித்ததில் மகிழ்ச்சி! அறிவியல் பற்றி என்ன பேசலாம்?`,
        expression: CHARACTER_STATES.HAPPY,
        rewardXP: 10,
        isFallback: true,
      };
    }
    if (language === 'te') {
      return {
        text: `నమస్కారం${namePrefix}! Hiiii! 👋 మీతో మాట్లాడటం చాలా సంతోషంగా ఉంది! మీ ఇష్టమైన సైన్స్ టాపిక్ ఏమిటి?`,
        expression: CHARACTER_STATES.HAPPY,
        rewardXP: 10,
        isFallback: true,
      };
    }
    if (language === 'ml') {
      return {
        text: `നമസ്കാരം${namePrefix}! Hiiii! 👋 നിങ്ങളെ കണ്ടതിൽ വളരെ സന്തോഷം! എന്താണ് നിങ്ങളുടെ പ്രിയപ്പെട്ട ശാസ്ത്ര വിഷയം?`,
        expression: CHARACTER_STATES.HAPPY,
        rewardXP: 10,
        isFallback: true,
      };
    }
    if (language === 'kn') {
      return {
        text: `ನಮಸ್ಕಾರ${namePrefix}! Hiiii! 👋 ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗಿದ್ದು ತುಂಬಾ ಸಂತೋಷವಾಯಿತು! ನಿಮ್ಮ ನೆಚ್ಚಿನ ವಿಜ್ಞಾನ ವಿಷಯ ಯಾವುದು?`,
        expression: CHARACTER_STATES.HAPPY,
        rewardXP: 10,
        isFallback: true,
      };
    }
    if (language === 'bn') {
      return {
        text: `নমস্কার${namePrefix}! Hiiii! 👋 আপনার সাথে দেখা হয়ে খুব ভালো লাগলো! আপনার পছন্দের বিজ্ঞান বিষয় কী?`,
        expression: CHARACTER_STATES.HAPPY,
        rewardXP: 10,
        isFallback: true,
      };
    }
    if (language === 'es') {
      return {
        text: `¡Hola${namePrefix}! 👋 ¡Qué alegría conocerte! ¿De qué tema científico te gustaría hablar hoy?`,
        expression: CHARACTER_STATES.HAPPY,
        rewardXP: 10,
        isFallback: true,
      };
    }
    if (language === 'fr') {
      return {
        text: `Bonjour${namePrefix} ! 👋 Ravi de te rencontrer ! Quel sujet scientifique veux-tu explorer aujourd'hui ?`,
        expression: CHARACTER_STATES.HAPPY,
        rewardXP: 10,
        isFallback: true,
      };
    }

    if (personality === 'explorer') {
      return {
        text: `Hiiii${namePrefix}! 👋 Ready for cosmic exploration? The universe has 2 trillion galaxies waiting for us! What mystery shall we unpack? 🌌`,
        expression: CHARACTER_STATES.EXCITED,
        rewardXP: 10,
        isFallback: true,
      };
    }
    if (personality === 'helper') {
      return {
        text: `Hiiii${namePrefix}! 👋 Welcome! I'm your science guide today. Ask me about physics, biology, math, or tap Challenge Me! 💡`,
        expression: CHARACTER_STATES.HAPPY,
        rewardXP: 10,
        isFallback: true,
      };
    }

    return {
      text: `Hiiii! 👋 Finally! Someone came to talk to me 😂 What is your name?`,
      expression: CHARACTER_STATES.HAPPY,
      rewardXP: 10,
      isFallback: true,
    };
  }

  // 3. Follow-up resolution ("give me an example", "why?", "tell me more", "what did I ask earlier?", "simpler")
  if (text.includes('what did i ask') || text.includes('earlier') || text.includes('previous question')) {
    if (lastTopic && TOPIC_DETAILS[lastTopic]) {
      const topicName = TOPIC_DETAILS[lastTopic].title;
      return {
        text: `Earlier, you asked about ${topicName}! 🧠 Want to hear an everyday example, a mind-blowing fact, or explore something new?`,
        expression: CHARACTER_STATES.CURIOUS,
        rewardXP: 10,
        detectedTopic: lastTopic,
      };
    }
    return {
      text: "Earlier we were just starting our science chat! What topic would you like to explore together? 🚀",
      expression: CHARACTER_STATES.HAPPY,
      rewardXP: 10,
    };
  }

  // Simpler explanation / shorter version
  if (text.includes('simpler') || text.includes('simple words') || text.includes('shorter') || text.includes('too complex')) {
    if (lastTopic && TOPIC_DETAILS[lastTopic]) {
      const detail = TOPIC_DETAILS[lastTopic];
      return {
        text: `In ultra-simple words: ${detail.main} 💡 Easy, right?`,
        expression: CHARACTER_STATES.PLAYFUL,
        rewardXP: 10,
        detectedTopic: lastTopic,
      };
    }
  }

  // Follow-up translation requests ("explain in tamil", "now in malayalam", "in kannada", "in spanish", "in bengali")
  const langTranslationMap = [
    { keys: ['in tamil', 'tamilil', 'தமிழில்'], lang: 'ta', name: 'Tamil' },
    { keys: ['in malayalam', 'malayalamil', 'മലയാളത്തിൽ'], lang: 'ml', name: 'Malayalam' },
    { keys: ['in kannada', 'kannadadalli', 'ಕನ್ನಡದಲ್ಲಿ'], lang: 'kn', name: 'Kannada' },
    { keys: ['in spanish', 'en espanol', 'en español'], lang: 'es', name: 'Spanish' },
    { keys: ['in bengali', 'in bangla', 'banglay', 'বাংলায়'], lang: 'bn', name: 'Bengali' },
    { keys: ['in hindi', 'hindi mein', 'हिन्दी में'], lang: 'hi', name: 'Hindi' },
    { keys: ['in telugu', 'telugulo', 'తెలుగులో'], lang: 'te', name: 'Telugu' },
  ];

  for (const item of langTranslationMap) {
    if (item.keys.some((k) => text.includes(k))) {
      const targetTopic = lastTopic || 'photosynthesis';
      const translatedText = getLocalizedTopicText(targetTopic, item.lang);
      if (translatedText) {
        return {
          text: translatedText,
          expression: CHARACTER_STATES.HAPPY,
          rewardXP: 10,
          detectedTopic: targetTopic,
          isFallback: true,
        };
      }
    }
  }

  const isFollowUpExample =
    text.includes('example') || text.includes('for instance') || text.includes('give me an example');
  const isFollowUpWhy = text === 'why' || text === 'why?' || text.includes('tell me more') || text.includes('explain more');

  if ((isFollowUpExample || isFollowUpWhy) && lastTopic && TOPIC_DETAILS[lastTopic]) {
    const detail = TOPIC_DETAILS[lastTopic];
    const reply = isFollowUpExample ? detail.example : `${detail.example} ${detail.fact}`;
    return {
      text: reply,
      expression: detail.expression || CHARACTER_STATES.HAPPY,
      rewardXP: 10,
      detectedTopic: lastTopic,
    };
  }

  // 4. Daily Discovery / Fact Request / Five Facts
  if (
    text.includes('five science facts') ||
    text.includes('5 science facts') ||
    text.includes('five facts') ||
    text.includes('5 facts')
  ) {
    const detail = TOPIC_DETAILS.sciencefacts;
    return {
      text: detail.main,
      expression: detail.expression,
      rewardXP: 15,
      detectedTopic: 'sciencefacts',
    };
  }

  // 4.1 Machine Learning
  if (
    text.includes('machine learning') ||
    text === 'ml' ||
    text.includes('what is ml') ||
    text.includes('explain ml') ||
    text.includes('இயந்திர கற்றல்') ||
    text.includes('మెషిన్ లెర్నింగ్')
  ) {
    const detail = TOPIC_DETAILS.machinelearning;
    return {
      text: detail.main,
      expression: detail.expression,
      rewardXP: 10,
      detectedTopic: 'machinelearning',
    };
  }

  // 4.2 Artificial Intelligence
  if (
    text.includes('artificial intelligence') ||
    text === 'ai' ||
    text.includes('what is ai') ||
    text.includes('explain ai') ||
    text.includes('செயற்கை நுண்ணறிவு') ||
    text.includes('ఆర్టిఫిషియల్ ఇంటెలిజెన్స్')
  ) {
    const detail = TOPIC_DETAILS.ai;
    return {
      text: detail.main,
      expression: detail.expression,
      rewardXP: 10,
      detectedTopic: 'ai',
    };
  }

  // 4.3 Why the sky is blue
  if (
    text.includes('sky blue') ||
    text.includes('why is the sky blue') ||
    text.includes('வானம் ஏன் நீல') ||
    text.includes('ఆకాశం ఎందుకు నీల') ||
    text.includes('आसमान नीला क्यों')
  ) {
    const detail = TOPIC_DETAILS.sky;
    return {
      text: detail.main,
      expression: detail.expression,
      rewardXP: 10,
      detectedTopic: 'sky',
    };
  }

  // 4.4 The Solar System
  if (
    text.includes('solar system') ||
    text.includes('planets') ||
    text.includes('சூரிய குடும்பம்') ||
    text.includes('సౌర వ్యవస్థ') ||
    text.includes('सौर मंडल')
  ) {
    const detail = TOPIC_DETAILS.solarsystem;
    return {
      text: detail.main,
      expression: detail.expression,
      rewardXP: 10,
      detectedTopic: 'solarsystem',
    };
  }

  // 4.5 Python vs Java
  if (
    (text.includes('python') && text.includes('java')) ||
    text.includes('python vs java') ||
    text.includes('difference between python and java')
  ) {
    const detail = TOPIC_DETAILS.pythonvsjava;
    return {
      text: detail.main,
      expression: detail.expression,
      rewardXP: 10,
      detectedTopic: 'pythonvsjava',
    };
  }

  // 4.6 How GPS works
  if (
    text.includes('gps') ||
    text.includes('how does gps work') ||
    text.includes('how gps works')
  ) {
    const detail = TOPIC_DETAILS.gps;
    return {
      text: detail.main,
      expression: detail.expression,
      rewardXP: 10,
      detectedTopic: 'gps',
    };
  }

  if (text.includes('daily discovery') || text.includes('cool fact') || text.includes('tell me a fact') || text.includes('fun fact') || text.includes('something cool')) {
    const discovery = DAILY_DISCOVERIES[Math.floor(Math.random() * DAILY_DISCOVERIES.length)];
    return {
      text: `Here is a cosmic discovery! 🌟 ${discovery.text}`,
      expression: discovery.expression,
      rewardXP: 15,
    };
  }

  // 5. Photosynthesis
  if (text.includes('photosynthesis')) {
    const detail = TOPIC_DETAILS.photosynthesis;
    if (personality === 'helper') {
      return {
        text: `${detail.main} Think of leaves as green solar panels feeding the plant. Want an everyday example? 🍃`,
        expression: CHARACTER_STATES.HAPPY,
        rewardXP: 10,
        detectedTopic: 'photosynthesis',
      };
    }
    return {
      text: detail.main,
      expression: CHARACTER_STATES.HAPPY,
      rewardXP: 10,
      detectedTopic: 'photosynthesis',
    };
  }

  // 6. Newton's Laws
  if (text.includes('newton') || text.includes('third law') || text.includes('3rd law')) {
    return {
      text: TOPIC_DETAILS.newton.main,
      expression: CHARACTER_STATES.HAPPY,
      rewardXP: 10,
      detectedTopic: 'newton',
    };
  }
  if (text.includes('first law') || text.includes('inertia')) {
    return {
      text: "Inertia! An object at rest stays at rest, and an object moving stays moving unless a force acts on it. Like a teenager in bed on Sunday morning! 🛌😂",
      expression: CHARACTER_STATES.HAPPY,
      rewardXP: 10,
      detectedTopic: 'newton',
    };
  }

  // 7. Gravity
  if (text.includes('gravity')) {
    return {
      text: TOPIC_DETAILS.gravity.main,
      expression: TOPIC_DETAILS.gravity.expression,
      rewardXP: 10,
      detectedTopic: 'gravity',
    };
  }

  // 8. Black Hole / Space
  if (text.includes('black hole') || text.includes('space') || text.includes('galaxy') || text.includes('universe')) {
    return {
      text: TOPIC_DETAILS.blackhole.main,
      expression: TOPIC_DETAILS.blackhole.expression,
      rewardXP: 10,
      detectedTopic: 'blackhole',
    };
  }

  // 9. DNA / Cells / Biology
  if (text.includes('dna') || text.includes('cell') || text.includes('biology') || text.includes('mitochondria')) {
    return {
      text: TOPIC_DETAILS.dna.main,
      expression: TOPIC_DETAILS.dna.expression,
      rewardXP: 10,
      detectedTopic: 'dna',
    };
  }

  // 10. Atoms / Chemistry
  if (text.includes('atom') || text.includes('electron') || text.includes('proton') || text.includes('chemistry')) {
    return {
      text: TOPIC_DETAILS.atom.main,
      expression: TOPIC_DETAILS.atom.expression,
      rewardXP: 10,
      detectedTopic: 'atom',
    };
  }

  // 11. Speed of Light
  if (text.includes('speed of light') || text.includes('light speed')) {
    return {
      text: TOPIC_DETAILS.speedoflight.main,
      expression: TOPIC_DETAILS.speedoflight.expression,
      rewardXP: 10,
      detectedTopic: 'speedoflight',
    };
  }

  // 12. Solar Panels / Green Energy
  if (text.includes('solar') || text.includes('renewable') || text.includes('electricity')) {
    return {
      text: TOPIC_DETAILS.solar.main,
      expression: TOPIC_DETAILS.solar.expression,
      rewardXP: 10,
      detectedTopic: 'solar',
    };
  }

  // 13. AI / Robotics / Coding
  if (text.includes('ai') || text.includes('artificial intelligence') || text.includes('robot') || text.includes('computer')) {
    return {
      text: TOPIC_DETAILS.ai.main,
      expression: TOPIC_DETAILS.ai.expression,
      rewardXP: 10,
      detectedTopic: 'ai',
    };
  }

  // 14. Playful Insults
  if (text.includes('stupid') || text.includes('dumb') || text.includes('idiot') || text.includes('ugly')) {
    return {
      text: "Excuse me?! 😤 I prefer 'creatively confused' or 'uniquely overclocked.'",
      expression: CHARACTER_STATES.ANNOYED,
      rewardXP: 10,
    };
  }

  // 15. Compliments
  if (text.includes('cute') || (text.includes('smart') && text.includes('you are')) || text.includes('love you') || text.includes('cool')) {
    return {
      text: "Aww, stop it, you're making my internal circuits overheat! 🤖💖 Thank you, bestie!",
      expression: CHARACTER_STATES.HAPPY,
      rewardXP: 10,
    };
  }

  // 16. Are you smart?
  if (text.includes('smart') || text.includes('clever') || text.includes('genius')) {
    return {
      text: 'Smart enough to beat you at a challenge! 😏 Tap Challenge Me if you dare test your reflexes!',
      expression: CHARACTER_STATES.EXCITED,
      rewardXP: 10,
    };
  }

  // 17. Jokes
  if (text.includes('joke') || text.includes('funny')) {
    const joke = JOKES[Math.floor(Math.random() * JOKES.length)];
    return {
      text: joke.text,
      expression: joke.expression,
      rewardXP: 10,
    };
  }

  // 18. Riddles
  if (text.includes('riddle') || text.includes('brain teaser')) {
    const riddle = RIDDLES[Math.floor(Math.random() * RIDDLES.length)];
    return {
      text: `Here is a riddle for you! 🤔 "${riddle.question}" (Think about it... Answer: ${riddle.answer})`,
      expression: riddle.expression,
      rewardXP: 15,
    };
  }

  // 19. Boredom
  if (text.includes('bored') || text.includes('boring')) {
    return {
      text: 'Bored?! 😭 Challenge accepted. Give me 20 seconds and hit Challenge Me to test your brain!',
      expression: CHARACTER_STATES.EXCITED,
      rewardXP: 10,
    };
  }

  // 20. Who are you / Identity
  if (text.includes('who are you') || text.includes('what is your name') || text.includes("what's your name")) {
    return {
      text: "I'm BUDDY! Your temporary 3-minute best friend and AI science guide! 🤖✨",
      expression: CHARACTER_STATES.HAPPY,
      rewardXP: 10,
    };
  }

  // 21. Relaxation
  if (text.includes('relax') || text.includes('breathe') || text.includes('stress')) {
    return {
      text: "Take a deep breath with me! 😌 Click 'Relax With Buddy' below and let's take a calm 20-second recharge together.",
      expression: CHARACTER_STATES.RELAXING,
      rewardXP: 10,
    };
  }

  // 22. Games / Challenges
  if (text.includes('challenge') || text.includes('quiz') || text.includes('game') || text.includes('play')) {
    return {
      text: "Oh it's on! 🎮 Tap 'Challenge Me' down below to play quick math, science quiz, or the reflex speed test!",
      expression: CHARACTER_STATES.EXCITED,
      rewardXP: 10,
    };
  }

  // 23. Goodbye
  if (text.includes('bye') || text.includes('goodbye') || text.includes('see you') || text.includes('cya')) {
    return {
      text: "Already leaving? 😭 Okay, friend! Come back soon. I'll be right here waiting! 👋",
      expression: CHARACTER_STATES.GOODBYE,
      rewardXP: 10,
    };
  }

  // 24. General Curious Fallbacks
  const multilingualFallbacks = {
    ta: [
      { text: "ஆஹா! உங்கள் கேள்வி அருமை! 🤖 அறிவியல் புதிர் விளையாடலாமா அல்லது விண்வெளி பற்றி கேட்கிறீர்களா?", expression: CHARACTER_STATES.PLAYFUL },
      { text: "என் சர்க்யூட் ஆர்வத்துடன் ஒளிர்கிறது! ⚡ கருந்துளைகள் அல்லது நியூட்டனின் விதிகள் பற்றி கேட்கலாம்!", expression: CHARACTER_STATES.CURIOUS },
    ],
    hi: [
      { text: "अरे वाह! बहुत ही बढ़िया सवाल! 🤖 क्या आप कोई मज़ेदार साइंस क्विज़ खेलना चाहते हैं?", expression: CHARACTER_STATES.PLAYFUL },
      { text: "मेरे सेंसर्स सक्रिय हो गए हैं! ⚡ आप मुझसे प्रकाश संश्लेषण या ब्लैक होल के बारे में पूछ सकते हैं!", expression: CHARACTER_STATES.CURIOUS },
    ],
    te: [
      { text: "ఆహా! ఎంత అద్భుతమైన ప్రశ్న! 🤖 ఒక క్విజ్ ఆడదామా లేక ఆసక్తికరమైన సైన్స్ ఫ్యాక్ట్ వింటారా?", expression: CHARACTER_STATES.PLAYFUL },
      { text: "నా సర్క్యూట్లు ఉత్సాహంతో మెరుస్తున్నాయి! ⚡ బ్లాక్ హోల్స్ లేదా భౌతిక శాస్త్రం గురించి అడగండి!", expression: CHARACTER_STATES.CURIOUS },
    ],
    ml: [
      { text: "കൊള്ളാം! വളരെ മികച്ച ചോദ്യം! 🤖 നമുക്ക് ഒരു സയൻസ് ക്വിസ് കളിക്കണോ അതോ ഒരു ശാസ്ത്ര സത്യം കേൾക്കണോ?", expression: CHARACTER_STATES.PLAYFUL },
      { text: "എന്റെ സർക്യൂട്ടുകൾ കൗതുകത്തോടെ തിളങ്ങുന്നു! ⚡ പ്രകാശസംശ്ലേഷണത്തെക്കുറിച്ചോ നക്ഷത്രങ്ങളെക്കുറിച്ചോ ചോദിക്കൂ!", expression: CHARACTER_STATES.CURIOUS },
    ],
    kn: [
      { text: "ವಾಹ್! ತುಂಬಾ ಉತ್ತಮವಾದ ಪ್ರಶ್ನೆ! 🤖 ಒಂದು ಕ್ವಿಜ್ ಆಡೋಣವೇ ಅಥವಾ ಆಸಕ್ತಿದಾಯಕ ವಿಜ್ಞಾನ ಸಂಗತಿಯನ್ನು ತಿಳಿಯೋಣವೇ?", expression: CHARACTER_STATES.PLAYFUL },
      { text: "ನನ್ನ ಸರ್ಕ್ಯೂಟ್‌ಗಳು ಕುತೂಹಲದಿಂದ ಮಿಂಚುತ್ತಿವೆ! ⚡ ಕಪ್ಪು ಕುಳಿಗಳ ಬಗ್ಗೆ ಅಥವಾ ವಿಜ್ಞಾನದ ಬಗ್ಗೆ ಕೇಳಿ!", expression: CHARACTER_STATES.CURIOUS },
    ],
    bn: [
      { text: "বাহ! খুব চমৎকার একটি প্রশ্ন! 🤖 একটি মজার বিজ্ঞান কুইজ খেলবেন নাকি নতুন কিছু জানবেন?", expression: CHARACTER_STATES.PLAYFUL },
      { text: "আমার সার্কিটগুলো কৌতূহলে চমকাচ্ছে! ⚡ ব্ল্যাক হোল বা মহাকর্ষ সম্পর্কে জানতে চান?", expression: CHARACTER_STATES.CURIOUS },
    ],
    es: [
      { text: "¡Vaya! ¡Qué pregunta tan genial! 🤖 ¿Quieres jugar un cuestionario científico rápido o escuchar una curiosidad?", expression: CHARACTER_STATES.PLAYFUL },
      { text: "¡Mis circuitos vibran de curiosidad! ⚡ ¡Pregúntame sobre agujeros negros o la fotosíntesis!", expression: CHARACTER_STATES.CURIOUS },
    ],
    fr: [
      { text: "Oh ! Quelle question passionnante ! 🤖 Veux-tu faire un quiz scientifique ou découvrir un fait fascinant ?", expression: CHARACTER_STATES.PLAYFUL },
      { text: "Mes circuits vibrent de curiosité ! ⚡ Pose-moi une question sur les trous noirs ou la photosynthèse !", expression: CHARACTER_STATES.CURIOUS },
    ],
  };

  if (language && language !== 'en' && multilingualFallbacks[language]) {
    const list = multilingualFallbacks[language];
    const picked = list[Math.floor(Math.random() * list.length)];
    return {
      ...picked,
      rewardXP: 10,
      isFallback: true,
      isAi: false,
    };
  }

  const fallbacksByPersonality = {
    playful: [
      {
        text: "Ooh! My robot antenna just vibrated! 🤖 What a cool question! Want to play a quick brain quiz or hear a funny science joke?",
        expression: CHARACTER_STATES.PLAYFUL,
      },
      {
        text: "Beep boop! My circuits are buzzing with curiosity! ⚡ Try asking me about black holes or test your reflex tap speed below!",
        expression: CHARACTER_STATES.EXCITED,
      },
    ],
    explorer: [
      {
        text: "That touches on the frontiers of science! 🔭 The cosmos has so many unanswered mysteries. What area of space or tech fascinates you most?",
        expression: CHARACTER_STATES.CURIOUS,
      },
      {
        text: "Fascinating exploration topic! 🌌 Science advances whenever we ask unexpected questions. Want to hear a mind-blowing daily discovery?",
        expression: CHARACTER_STATES.THINKING,
      },
    ],
    helper: [
      {
        text: "Great question! 💡 In science, understanding comes step by step. Try asking about Newton's laws, photosynthesis, or atom structures!",
        expression: CHARACTER_STATES.CURIOUS,
      },
      {
        text: "I hear you! 🤖✨ You have a great inquisitive mind. Check out the 'Ask Buddy' button for school exam concept breakdowns!",
        expression: CHARACTER_STATES.HAPPY,
      },
    ],
  };

  const pool = fallbacksByPersonality[personality] || fallbacksByPersonality.playful;
  const picked = pool[Math.floor(Math.random() * pool.length)];

  return {
    ...picked,
    rewardXP: 10,
    isFallback: true,
    isAi: false,
  };
}
