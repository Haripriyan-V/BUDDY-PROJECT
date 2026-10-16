// Game Intent Recognition and Dialogue Routing for BUDDY ARCADE
// Maps natural language student phrases and speech queries to arcade games.

import { CHARACTER_STATES } from '../utils/characterStates.js';

export const ARCADE_GAMES_INFO = [
  {
    id: 'flight',
    title: 'BUDDY Flight',
    icon: '🪶',
    category: 'Side-Scroller',
    difficulty: 'All Ages',
    desc: 'Flap through neon energy gates, dodge obstacles, and collect star sparks!',
  },
  {
    id: 'runner',
    title: 'Robo Run',
    icon: '🏃',
    category: 'Endless Runner',
    difficulty: 'Action',
    desc: 'Dash down high-speed cyber tracks! Jump barriers, duck under lasers, and grab shields.',
  },
  {
    id: 'quiz',
    title: 'Quiz Blast',
    icon: '🚀',
    category: 'STEM Rocket Trivia',
    difficulty: 'Mind Blast',
    desc: 'Answer rapid science, space & AI questions to fuel your cartoon rocket to orbit!',
  },
  {
    id: 'memory',
    title: 'Brain Flip',
    icon: '🧠',
    category: 'Memory Match',
    difficulty: 'Focus',
    desc: 'Flip and match glowing holographic science & robot cards against the clock.',
  },
  {
    id: 'bots',
    title: 'Catch the Bots',
    icon: '🎯',
    category: 'Arcade Reflex',
    difficulty: 'Speed',
    desc: 'Tap friendly cyber bots before they disappear! Beware of glitch virus decoys!',
  },
  {
    id: 'studio',
    title: 'BUDDY Pet Studio',
    icon: '🎨',
    category: 'Customization & Rewards',
    difficulty: 'Creative',
    desc: 'Dress BUDDY in unlocked crowns, cyber shades, and neon auras with live 3D preview!',
  },
];

const GAME_LOCALIZED_TEXTS = {
  flight: {
    en: {
      text: 'Pilot mode activated! 🚀 Fasten your thrusters and tap to fly through the cyber gates!',
      button: '🚀 Launch BUDDY Flight',
    },
    ta: {
      text: 'பறக்கும் பயன்முறை செயல்படுத்தப்பட்டது! 🚀 சைபர் வாயில்கள் வழியாக பறக்க தயாராகுங்கள்!',
      button: '🚀 பறக்க தொடங்கு',
    },
    hi: {
      text: 'पायलट मोड शुरू! 🚀 साइबर गेट्स के पार उड़ने के लिए तैयार हो जाएं!',
      button: '🚀 उड़ान शुरू करें',
    },
    te: {
      text: 'పైలట్ మోడ్ ప్రారంభమైంది! 🚀 సైబర్ గేట్ల ద్వారా ఎగరడానికి సిద్ధంగా ఉండండి!',
      button: '🚀 బడ్డీ ఫ్లైట్ ప్రారంభించండి',
    },
    ml: {
      text: 'പൈലറ്റ് മോഡ് സജീവമാക്കി! 🚀 സൈബർ ഗേറ്റുകളിലൂടെ പറക്കാൻ തയ്യാറാകൂ!',
      button: '🚀 ഫ്ലൈറ്റ് ആരംഭിക്കുക',
    },
    kn: {
      text: 'ಪೈಲಟ್ ಮೋಡ್ ಸಕ್ರಿಯಗೊಂಡಿದೆ! 🚀 ಸೈಬರ್ ಗೇಟ್‌ಗಳ ಮೂಲಕ ಹಾರಲು ಸಿದ್ಧರಾಗಿ!',
      button: '🚀 ಬಡ್ಡಿ ಫ್ಲೈಟ್ ಪ್ರಾರಂಭಿಸಿ',
    },
    bn: {
      text: 'পাইলট মোড সক্রিয় হয়েছে! 🚀 সাইবার গেটের মধ্য দিয়ে উড়তে প্রস্তুত হোন!',
      button: '🚀 বাডি ফ্লাইট শুরু করুন',
    },
    es: {
      text: '¡Modo piloto activado! 🚀 ¡Abróchate los propulsores y vuela a través de las puertas cibernéticas!',
      button: '🚀 Iniciar BUDDY Flight',
    },
    fr: {
      text: 'Mode pilote activé ! 🚀 Attachez vos réacteurs et volez à travers les portes cybernétiques !',
      button: '🚀 Lancer BUDDY Flight',
    },
  },
  runner: {
    en: {
      text: 'Hyper-speed tracks engaged! 🏃 Ready to jump, duck, and collect cyber stars?',
      button: '🏃 Launch Robo Run',
    },
    ta: {
      text: 'ரோபோ ரன் வேகம் தயார்! 🏃 குதிக்கவும், நழுவவும், விண்மீன்களை சேகரிக்கவும் தயாரா?',
      button: '🏃 ரோபோ ரன் தொடங்கு',
    },
    hi: {
      text: 'रोबो रन ट्रैक सक्रिय! 🏃 दौड़ें, कूदें और साइबर स्टार्स इकट्ठा करें!',
      button: '🏃 रोबो रन खेलें',
    },
    te: {
      text: 'రోబో రన్ ట్రాక్ సిద్ధంగా ఉంది! 🏃 దూకడానికి మరియు స్టార్స్ సేకరించడానికి సిద్ధమా?',
      button: '🏃 రోబో రన్ ప్రారంభించండి',
    },
    ml: {
      text: 'റോബോ റൺ ട്രാക്ക് തയ്യാർ! 🏃 ചാടാനും സൈബർ നക്ഷത്രങ്ങൾ ശേഖരിക്കാനും തയ്യാറാണോ?',
      button: '🏃 റോബോ റൺ ആരംഭിക്കുക',
    },
    kn: {
      text: 'ರೋಬೋ ರನ್ ಟ್ರ್ಯಾಕ್ ಸಿದ್ಧವಾಗಿದೆ! 🏃 ಜಿಗಿಯಲು ಮತ್ತು ನಕ್ಷತ್ರಗಳನ್ನು ಸಂಗ್ರಹಿಸಲು ಸಿದ್ಧರಿದ್ದೀರಾ?',
      button: '🏃 ರೋಬೋ ರನ್ ಪ್ರಾರಂಭಿಸಿ',
    },
    bn: {
      text: 'রোবো রান ট্র্যাক প্রস্তুত! 🏃 লাফাতে এবং সাইবার তারা সংগ্রহ করতে প্রস্তুত?',
      button: '🏃 রোবো রান শুরু করুন',
    },
    es: {
      text: '¡Pistas de hipervelocidad listas! 🏃 ¿Listo para saltar, agacharte y recolectar estrellas cibernéticas?',
      button: '🏃 Iniciar Robo Run',
    },
    fr: {
      text: 'Pistes hyper-vitesse engagées ! 🏃 Prêt à sauter, esquiver et collecter des étoiles cybernétiques ?',
      button: '🏃 Lancer Robo Run',
    },
  },
  quiz: {
    en: {
      text: 'Rocket propellant loading! 🚀 Let us see if your science brain can launch us to orbit!',
      button: '🚀 Launch Quiz Blast',
    },
    ta: {
      text: 'ராக்கெட் வினாடி வினா தயார்! 🚀 அறிவியல் கேள்விகளுக்கு பதிலளித்து ராக்கெட்டை விண்ணில் செலுத்துங்கள்!',
      button: '🚀 வினாடி வினா தொடங்கு',
    },
    hi: {
      text: 'रॉकेट क्विज़ तैयार है! 🚀 विज्ञान के सवालों के जवाब देकर रॉकेट को कक्षा में लॉन्च करें!',
      button: '🚀 क्विज़ ब्लास्ट खेलें',
    },
    te: {
      text: 'రాకెట్ క్విజ్ సిద్ధంగా ఉంది! 🚀 సైన్స్ ప్రశ్నలకు సమాధానమిచ్చి రాకెట్‌ను లాంచ్ చేయండి!',
      button: '🚀 క్విజ్ బ్లాస్ట్ ప్రారంభించండి',
    },
    ml: {
      text: 'റോക്കറ്റ് ക്വിസ് തയ്യാർ! 🚀 ശാസ്ത്ര ചോദ്യങ്ങൾക്ക് ഉത്തരം നൽകി റോക്കറ്റ് വിക്ഷേപിക്കൂ!',
      button: '🚀 ക്വിസ് ബ്ലാസ്റ്റ് ആരംഭിക്കുക',
    },
    kn: {
      text: 'ರಾಕೆಟ್ ರಸಪ್ರಶ್ನೆ ಸಿದ್ಧವಾಗಿದೆ! 🚀 ವಿಜ್ಞಾನ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ ರಾಕೆಟ್ ಉಡಾವಣೆ ಮಾಡಿ!',
      button: '🚀 ರಸಪ್ರಶ್ನೆ ಬ್ಲಾಸ್ಟ್ ಪ್ರಾರಂಭಿಸಿ',
    },
    bn: {
      text: 'রকেট কুইজ প্রস্তুত! 🚀 বিজ্ঞানের প্রশ্নের উত্তর দিয়ে রকেট উৎক্ষেপণ করুন!',
      button: '🚀 কুইজ ব্লাস্ট শুরু করুন',
    },
    es: {
      text: '¡Cargando propulsor de cohete! 🚀 ¡Veamos si tu mente científica puede llevarnos a la órbita!',
      button: '🚀 Iniciar Quiz Blast',
    },
    fr: {
      text: 'Chargement du propulseur ! 🚀 Voyons si vos connaissances scientifiques peuvent nous mettre en orbite !',
      button: '🚀 Lancer Quiz Blast',
    },
  },
  memory: {
    en: {
      text: 'Neural memory matrix ready! 🧠 How fast can you flip and match the science hologram pairs?',
      button: '🧠 Launch Brain Flip',
    },
    ta: {
      text: 'நினைவாற்றல் போட்டி தயார்! 🧠 அட்டைகளை எவ்வளவு வேகமாக பொருத்துகிறீர்கள் என்று பார்ப்போம்!',
      button: '🧠 நினைவாற்றல் ஆட்டம்',
    },
    hi: {
      text: 'मेमोरी मैच तैयार! 🧠 कार्ड्स को पलटें और विज्ञान के जोड़े तेजी से मिलाएं!',
      button: '🧠 ब्रेन फ्लिप खेलें',
    },
    te: {
      text: 'మెమరీ మ్యాచ్ సిద్ధంగా ఉంది! 🧠 కార్డ్‌లను సరిగ్గా జత చేయండి!',
      button: '🧠 బ్రెయిన్ ఫ్లిప్ ప్రారంభించండి',
    },
    ml: {
      text: 'മെമ്മറി മാച്ച് തയ്യാർ! 🧠 കാർഡുകൾ വേഗത്തിൽ പൊരുത്തപ്പെടുത്തൂ!',
      button: '🧠 ബ്രെയിൻ ഫ്ലിപ്പ് ആരംഭിക്കുക',
    },
    kn: {
      text: 'ಮೆಮೊರಿ ಮ್ಯಾಚ್ ಸಿದ್ಧವಾಗಿದೆ! 🧠 ಕಾರ್ಡ್ ಜೋಡಿಗಳನ್ನು ವೇಗವಾಗಿ ಹೊಂದಿಸಿ!',
      button: '🧠 ಬ್ರೈನ್ ಫ್ಲಿಪ್ ಪ್ರಾರಂಭಿಸಿ',
    },
    bn: {
      text: 'মেমরি ম্যাচ প্রস্তুত! 🧠 কার্ডের জোড়া দ্রুত মেলান!',
      button: '🧠 ব্রেন ফ্লিপ শুরু করুন',
    },
    es: {
      text: '¡Matriz de memoria lista! 🧠 ¿Qué tan rápido puedes emparejar los hologramas científicos?',
      button: '🧠 Iniciar Brain Flip',
    },
    fr: {
      text: 'Matrice de mémoire prête ! 🧠 À quelle vitesse pouvez-vous associer les hologrammes scientifiques ?',
      button: '🧠 Lancer Brain Flip',
    },
  },
  bots: {
    en: {
      text: 'Reflex radar activated! 🎯 Tap the friendly bots at high speed, but watch out for red glitch decoys!',
      button: '🎯 Launch Catch The Bots',
    },
    ta: {
      text: 'ரோபோ பிடி சவால் தயார்! 🎯 நட்பு ரோபோக்களை வேகமாக தட்டுங்கள், சிவப்பு வைரஸ்களை தவிருங்கள்!',
      button: '🎯 ரோபோக்களை பிடி',
    },
    hi: {
      text: 'रिफ्लेक्स रडार सक्रिय! 🎯 फ्रेंडली बॉट्स को तेजी से टैप करें, लाल ग्लिच से बचें!',
      button: '🎯 बॉट्स पकड़ें',
    },
    te: {
      text: 'రిఫ్లెక్స్ రాడార్ సిద్ధంగా ఉంది! 🎯 రోబోట్లను వేగంగా పట్టుకోండి!',
      button: '🎯 రోబోట్లను పట్టుకోండి',
    },
    ml: {
      text: 'റിഫ്ലെക്സ് റഡാർ സജീവം! 🎯 സൗഹൃദ ബോട്ടുകളെ വേഗത്തിൽ ടാപ്പ് ചെയ്യുക!',
      button: '🎯 ബോട്ടുകൾ പിടിക്കുക',
    },
    kn: {
      text: 'ರಿಫ್ಲೆಕ್ಸ್ ರೇಡಾರ್ ಸಕ್ರಿಯವಾಗಿದೆ! 🎯 ರೋಬೋಟ್‌ಗಳನ್ನು ವೇಗವಾಗಿ ಟ್ಯಾಪ್ ಮಾಡಿ!',
      button: '🎯 ಬಾಟ್‌ಗಳನ್ನು ಹಿಡಿಯಿರಿ',
    },
    bn: {
      text: 'রিফ্লেক্স রাডার সক্রিয়! 🎯 বন্ধুত্বপূর্ণ বটগুলোকে দ্রুত ট্যাপ করুন!',
      button: '🎯 বট ধরুন',
    },
    es: {
      text: '¡Radar de reflejos activado! 🎯 ¡Toca los robots amistosos a gran velocidad y esquiva los señuelos rojos!',
      button: '🎯 Iniciar Catch The Bots',
    },
    fr: {
      text: 'Radar à réflexes activé ! 🎯 Touchez les gentils robots à grande vitesse en évitant les pièges rouges !',
      button: '🎯 Lancer Catch The Bots',
    },
  },
  studio: {
    en: {
      text: 'Welcome to BUDDY Pet Studio! 🎨 Want to try on a king crown, cyber shades, or a neon aura?',
      button: '🎨 Open Pet Studio',
    },
    ta: {
      text: 'பட்டி அலங்கார அறைக்கு வருக! 🎨 கிரீடம், கூல் கண்ணாடிகள் அல்லது நியான் ஒளியை அணிந்து பாருங்கள்!',
      button: '🎨 ஸ்டுடியோ திற',
    },
    hi: {
      text: 'बडी पेट स्टूडियो में स्वागत है! 🎨 क्राउन, कूल सनग्लासेस या नियॉन आभा आज़माएं!',
      button: '🎨 पेट स्टूडियो खोलें',
    },
    te: {
      text: 'బడ్డీ పెట్ స్టూడియోకి స్వాగతం! 🎨 కిరీటం మరియు కూల్ షేడ్స్‌ను ప్రయత్నించండి!',
      button: '🎨 స్టూడియో తెరవండి',
    },
    ml: {
      text: 'ബഡ്ഡി പെറ്റ് സ്റ്റുഡിയോയിലേക്ക് സ്വാഗതം! 🎨 കിരീടവും കൂൾ ഷേഡുകളും പരീക്ഷിക്കൂ!',
      button: '🎨 സ്റ്റുഡിയോ തുറക്കുക',
    },
    kn: {
      text: 'ಬಡ್ಡಿ ಪೆಟ್ ಸ್ಟುಡಿಯೋಗೆ ಸುಸ್ವಾಗತ! 🎨 ಕಿರೀಟ ಮತ್ತು ಕೂಲ್ ಶೇಡ್ಸ್‌ಗಳನ್ನು ಧರಿಸಿ ನೋಡಿ!',
      button: '🎨 ಸ್ಟುಡಿಯೋ ತೆರೆಯಿರಿ',
    },
    bn: {
      text: 'বাডি পেট স্টুডিওতে স্বাগতম! 🎨 রাজমুকুট এবং সানগ্লাস পরিয়ে দেখুন!',
      button: '🎨 স্টুডিও খুলুন',
    },
    es: {
      text: '¡Bienvenido a BUDDY Pet Studio! 🎨 ¿Quieres probarte una corona, gafas cyber o un aura de neón?',
      button: '🎨 Abrir Pet Studio',
    },
    fr: {
      text: 'Bienvenue au BUDDY Pet Studio ! 🎨 Envie d’essayer une couronne royale, des lunettes cyber ou une aura néon ?',
      button: '🎨 Ouvrir Pet Studio',
    },
  },
  suggest: {
    en: {
      text: 'Bored? Not on my watch! 🚀 Want to fly through space, race like a robot, or blast off with a science quiz?',
      buttons: [
        { id: 'flight', label: '🪶 Fly with BUDDY' },
        { id: 'runner', label: '🏃 Robo Run' },
        { id: 'quiz', label: '🚀 Quiz Blast' },
        { id: 'arcade', label: '🕹️ All 6 Games' },
      ],
    },
    ta: {
      text: 'அறிவியல் விளையாட்டு விளையாடுவோமா? 🚀 விண்வெளியில் பறக்கலாம், வேகமாக ஓடலாம் அல்லது வினாடி வினா ஆடலாம்!',
      buttons: [
        { id: 'flight', label: '🪶 பறக்கலாம்' },
        { id: 'runner', label: '🏃 ரோபோ ரன்' },
        { id: 'quiz', label: '🚀 வினாடி வினா' },
        { id: 'arcade', label: '🕹️ அனைத்து 6 விளையாட்டுகள்' },
      ],
    },
    hi: {
      text: 'बोर हो रहे हैं? बिल्कुल नहीं! 🚀 क्या आप अंतरिक्ष में उड़ना चाहते हैं, दौड़ना चाहते हैं या विज्ञान क्विज़ खेलना चाहते हैं?',
      buttons: [
        { id: 'flight', label: '🪶 बडी उड़ान' },
        { id: 'runner', label: '🏃 रोबो रन' },
        { id: 'quiz', label: '🚀 क्विज़ ब्लास्ट' },
        { id: 'arcade', label: '🕹️ सभी 6 खेल' },
      ],
    },
  },
  stats: {
    en: {
      text: 'Checking your galactic arcade record! 🏆 Let us inspect your medals, personal bests, and unlocked cosmetics!',
      buttons: [
        { id: 'stats', label: '🏆 View Stats & Medals' },
        { id: 'arcade', label: '🕹️ Open Arcade Hub' },
      ],
    },
    ta: {
      text: 'உங்கள் விளையாட்டு சாதனைகளை சரிபார்க்கிறேன்! 🏆 உங்கள் பதக்கங்களையும் மதிப்பெண்களையும் பாருங்கள்!',
      buttons: [
        { id: 'stats', label: '🏆 சாதனைகள் & பதக்கங்கள்' },
        { id: 'arcade', label: '🕹️ ஆர்கேட் மையம்' },
      ],
    },
    hi: {
      text: 'आपके आर्केड रिकॉर्ड की जांच हो रही है! 🏆 अपने मेडल, रिकॉर्ड्स और अनलॉक की गई चीजें देखें!',
      buttons: [
        { id: 'stats', label: '🏆 मेडल और रिकॉर्ड' },
        { id: 'arcade', label: '🕹️ आर्केड हब' },
      ],
    },
  },
  arcade: {
    en: {
      text: 'Step right into BUDDY ARCADE! 🕹️ 6 full science-expo mini-games ready for action!',
      buttons: [
        { id: 'flight', label: '🪶 Flight' },
        { id: 'runner', label: '🏃 Runner' },
        { id: 'quiz', label: '🚀 Rocket Quiz' },
        { id: 'arcade', label: '🕹️ Open Arcade' },
      ],
    },
    ta: {
      text: 'பட்டி ஆர்கேடிற்கு வருக! 🕹️ 6 அறிவியல் கண்காட்சி விளையாட்டுகள் உங்களுக்காக தயார்!',
      buttons: [
        { id: 'flight', label: '🪶 பறத்தல்' },
        { id: 'runner', label: '🏃 ஓட்டம்' },
        { id: 'quiz', label: '🚀 ராக்கெட் குவிஸ்' },
        { id: 'arcade', label: '🕹️ ஆர்கேட் திற' },
      ],
    },
    hi: {
      text: 'बडी आर्केड में कदम रखें! 🕹️ 6 रोमांचक साइंस गेम्स आपके लिए तैयार हैं!',
      buttons: [
        { id: 'flight', label: '🪶 उड़ान' },
        { id: 'runner', label: '🏃 रनर' },
        { id: 'quiz', label: '🚀 रॉकेट क्विज़' },
        { id: 'arcade', label: '🕹️ आर्केड खोलें' },
      ],
    },
    te: {
      text: 'బడ్డీ ఆర్కేడ్‌కు స్వాగతం! 🕹️ 6 పూర్తి సైన్స్ ఎక్స్‌పో ఆటలు మీకోసం సిద్ధంగా ఉన్నాయి!',
      buttons: [
        { id: 'flight', label: '🪶 ఫ్లైట్' },
        { id: 'runner', label: '🏃 రన్నర్' },
        { id: 'quiz', label: '🚀 రాకెట్ క్విజ్' },
        { id: 'arcade', label: '🕹️ ఆర్కేడ్ తెరువు' },
      ],
    },
  },
  exit: {
    en: {
      text: 'Exiting game mode! 🛑 Returning to our science chat hub. What should we explore next?',
    },
    ta: {
      text: 'விளையாட்டு முடிந்தது! 🛑 நமது அறிவியல் அரட்டைக்குத் திரும்புகிறோம். அடுத்து என்ன ஆராயலாம்?',
    },
    te: {
      text: 'గేమ్ ముగిసింది! 🛑 మన సైన్స్ చాట్ హబ్‌కి తిరిగి వచ్చాము. తర్వాత ఏమి అన్వేషిద్దాం?',
    },
    hi: {
      text: 'गेम मोड से बाहर निकल रहे हैं! 🛑 हमारे मुख्य चैट पर वापस आ गए हैं। आगे क्या जानना चाहेंगे?',
    },
    es: {
      text: '¡Saliendo del modo de juego! 🛑 Regresando a nuestro chat de ciencia. ¿Qué exploramos ahora?',
    },
    fr: {
      text: 'Sortie du mode jeu ! 🛑 Retour à notre espace de discussion scientifique. Que voulons-nous explorer ensuite ?',
    },
  },
  pause: {
    en: {
      text: 'Game paused! ⏸️ Take a breather. Say resume when you are ready to jump back in!',
    },
    ta: {
      text: 'விளையாட்டு இடைநிறுத்தப்பட்டது! ⏸️ தயாரானதும் தொடரலாம் என்று சொல்லுங்கள்!',
    },
    te: {
      text: 'గేమ్ పాజ్ చేయబడింది! ⏸️ సిద్ధంగా ఉన్నప్పుడు కొనసాగించండి అని చెప్పండి!',
    },
    hi: {
      text: 'खेल रुका हुआ है! ⏸️ जब तैयार हों, फिर से शुरू करने को कहें!',
    },
  },
  resume: {
    en: {
      text: 'Game resumed! ▶️ Thrusters back on! Give it your best shot!',
    },
    ta: {
      text: 'விளையாட்டு மீண்டும் தொடங்கியது! ▶️ வெற்றி பெற வாழ்த்துகள்!',
    },
    te: {
      text: 'గేమ్ మళ్లీ ప్రారంభమైంది! ▶️ ఆల్ ది బెస్ట్!',
    },
    hi: {
      text: 'खेल फिर से शुरू! ▶️ अपना सर्वश्रेष्ठ प्रदर्शन दें!',
    },
  },
};

function getGameResponse(gameKey, lang = 'en') {
  const item = GAME_LOCALIZED_TEXTS[gameKey];
  if (!item) return null;
  const localized = item[lang] || item.en;
  return localized;
}

export function detectGameIntent(userMessage, context = {}) {
  if (!userMessage || typeof userMessage !== 'string') return null;
  const text = userMessage.toLowerCase().trim();
  const lang = (context && context.language) || 'en';

  // Guard against questions about games or concepts (e.g. "What is Flappy Bird?", "Why do birds fly?", "What is Quiz Blast?")
  // Questions must NOT launch games; they must be answered as conversational or science questions!
  const isQuestion =
    /^(what is|what's|who is|who's|tell me about|explain|how do|how does|why do|why does|meaning of)\b/i.test(text) ||
    /(பற்றி சொல்|என்றால் என்ன|விளக்கு|பற்றி விளக்கு)/.test(text) ||
    /(గురించి చెప్పు|ఏమిటి|అంటే ఏమిటి|వివరించు)/.test(text) ||
    /(के बारे में बताओ|क्या है|अर्थ क्या है)/.test(text);

  const hasPlayCommand =
    /\b(play|start|launch|open|run|let's play|lets play|can we play|want to play)\b/i.test(text) ||
    /(விளையாடு|விளையாடலாம்|தொடங்கு|திற|ஆடலாம்)/.test(text) ||
    /(ఆడు|ఆడండి|ఆడదాం|ప్రారంభించు|స్టార్ట్|ఓపెన్|ప్లే)/.test(text) ||
    /(खेलो|खेलें|शुरू करो|लॉन्च|ओपन)/.test(text);

  if (isQuestion && !hasPlayCommand) {
    return null;
  }

  // 0. Exit / Close / Stop Game Command
  if (
    text === 'exit' ||
    text === 'stop' ||
    text === 'quit' ||
    text === 'close' ||
    text.includes('exit game') ||
    text.includes('exit the game') ||
    text.includes('close game') ||
    text.includes('close the game') ||
    text.includes('stop game') ||
    text.includes('stop the game') ||
    text.includes('quit game') ||
    text.includes('quit the game') ||
    text.includes('leave game') ||
    text.includes('close arcade') ||
    text.includes('stop playing') ||
    // Tamil
    text.includes('விளையாட்டை நிறுத்து') ||
    text.includes('விளையாட்டை மூடு') ||
    text.includes('ஆர்கேட் மூடு') ||
    text.includes('வெளியேறு') ||
    // Telugu
    text.includes('గేమ్ ఆపు') ||
    text.includes('ఆట ఆపు') ||
    text.includes('గేమ్ ముగించు') ||
    text.includes('నిష్క్రమించు') ||
    text.includes('గేమ్ క్లోజ్') ||
    // Hindi
    text.includes('गेम बंद करो') ||
    text.includes('गेम रोको') ||
    text.includes('खेल बंद करो') ||
    text.includes('बाहर निकलो')
  ) {
    const localized = getGameResponse('exit', lang);
    return {
      isGameIntent: true,
      action: 'exit',
      text: localized.text,
      expression: CHARACTER_STATES.HAPPY,
    };
  }

  // 0.1 Pause Game Command
  if (
    text === 'pause' ||
    text === 'pause game' ||
    text.includes('pause the game') ||
    text.includes('గేమ్ పాజ్') ||
    text.includes('விளையாட்டை இடைநிறுத்து') ||
    text.includes('गेम रोको')
  ) {
    const localized = getGameResponse('pause', lang);
    return {
      isGameIntent: true,
      action: 'pause',
      text: localized.text,
      expression: CHARACTER_STATES.IDLE,
    };
  }

  // 0.2 Resume Game Command
  if (
    text === 'resume' ||
    text === 'resume game' ||
    text.includes('resume the game') ||
    text.includes('continue game') ||
    text.includes('గేమ్ కొనసాగించు') ||
    text.includes('விளையாட்டை தொடர்') ||
    text.includes('गेम जारी रखो')
  ) {
    const localized = getGameResponse('resume', lang);
    return {
      isGameIntent: true,
      action: 'resume',
      text: localized.text,
      expression: CHARACTER_STATES.EXCITED,
    };
  }

  // 0.3 AI Vision / Camera Activation Command
  if (
    text === 'open camera' ||
    text === 'start camera' ||
    text === 'camera on' ||
    text === 'ai vision' ||
    text === 'buddy vision' ||
    text === 'open vision' ||
    text === 'look at me' ||
    text.includes('open the camera') ||
    text.includes('start the camera') ||
    text.includes('turn on camera') ||
    text.includes('turn on the camera') ||
    text.includes('activate vision') ||
    text.includes('can you see me') ||
    text.includes('see me') ||
    // Tamil
    text.includes('கேமரா திற') ||
    text.includes('கேமராவை திற') ||
    text.includes('என்னை பார்') ||
    // Telugu
    text.includes('కెమెరా ఓపెన్') ||
    text.includes('కెమెరా ఆన్') ||
    text.includes('నన్ను చూడు') ||
    // Hindi
    text.includes('कैमरा खोलो') ||
    text.includes('कैमरा ऑन करो') ||
    text.includes('मुझे देखो')
  ) {
    const visionMessages = {
      en: "Activating BUDDY AI Vision! Let's see who is in front of the camera! 👁️✨",
      ta: "பட்டி AI விஷன் தொடங்குகிறது! கேமராவின் முன் யார் இருக்கிறார்கள் என்று பார்ப்போம்! 👁️✨",
      hi: "बडी एआई विज़न सक्रिय हो रहा है! चलिए देखते हैं कैमरे के सामने कौन है! 👁️✨",
      te: "బడ్డీ AI విజన్ ఆన్ అవుతోంది! కెమెరా ముందు ఎవరున్నారో చూద్దాం! 👁️✨",
      ml: "ബഡ്ഡി AI വിഷൻ ആരംഭിക്കുന്നു! ക്യാമറയ്ക്ക് മുന്നിൽ ആരാണെന്ന് നോക്കാം! 👁️✨",
      kn: "ಬಡ್ಡಿ AI ವಿಷನ್ ಪ್ರಾರಂಭವಾಗುತ್ತಿದೆ! ಕ್ಯಾಮೆರಾ ಮುಂದೆ ಯಾರಿದ್ದಾರೆ ಎಂದು ನೋಡೋಣ! 👁️✨",
      bn: "বাডি এআই ভিশন চালু হচ্ছে! ক্যামেরার সামনে কে আছে দেখি! 👁️✨",
      es: "¡Activando BUDDY AI Vision! ¡Veamos quién está frente a la cámara! 👁️✨",
      fr: "Activation de BUDDY AI Vision ! Voyons qui est devant la caméra ! 👁️✨",
      de: "Aktiviere BUDDY AI Vision! Mal sehen, wer vor der Kamera steht! 👁️✨",
    };
    return {
      isGameIntent: true,
      action: 'vision',
      text: visionMessages[lang] || visionMessages.en,
      expression: CHARACTER_STATES.CURIOUS,
      buttons: [{ id: 'vision', label: 'Open Camera 👁️' }],
    };
  }

  // 1. BUDDY Flight (Flappy / Flying)
  if (
    text.includes('flappy') ||
    text.includes('fly with buddy') ||
    text.includes('want to fly') ||
    text.includes('flying game') ||
    text.includes('fly game') ||
    text.includes('buddy flight') ||
    text.includes('flap') ||
    text.includes('pilot mode') ||
    (text.includes('fly') && (text.includes('play') || text.includes('game') || text.includes('start'))) ||
    // Tamil
    text.includes('பறக்கும் விளையாட்டு') ||
    text.includes('பறக்க') ||
    text.includes('பறத்தல்') ||
    // Telugu
    text.includes('ఫ్లై గేమ్') ||
    text.includes('ఎగిరే ఆట') ||
    text.includes('ఎగరడం') ||
    text.includes('బడ్డీ ఫ్లైట్') ||
    // Hindi
    text.includes('उड़ने वाला खेल') ||
    text.includes('उड़ना') ||
    text.includes('उड़ान') ||
    text.includes('उड़ो') ||
    // Spanish / French
    text.includes('juego de volar') ||
    text.includes('jeu de vol')
  ) {
    const localized = getGameResponse('flight', lang);
    return {
      isGameIntent: true,
      gameId: 'flight',
      action: 'launch',
      text: localized.text,
      expression: CHARACTER_STATES.EXCITED,
      buttons: [{ id: 'flight', label: localized.button }],
    };
  }

  // 2. Robo Run (Runner)
  if (
    text.includes('robo run') ||
    text.includes('running game') ||
    text.includes('endless runner') ||
    text.includes('run game') ||
    text.includes('race') ||
    (text.includes('run') && (text.includes('play') || text.includes('game') || text.includes('start'))) ||
    text.includes('jump and slide') ||
    // Tamil
    text.includes('ரோபோ ரன்') ||
    text.includes('ஓடும் விளையாட்டு') ||
    text.includes('ஓடலாம்') ||
    text.includes('ஓடு') ||
    // Telugu
    text.includes('రోబో రన్') ||
    text.includes('పరిగెత్తే ఆట') ||
    text.includes('రన్నర్ గేమ్') ||
    // Hindi
    text.includes('रोबो रन') ||
    text.includes('दौड़ने वाला खेल') ||
    text.includes('दौड़ो') ||
    text.includes('दौड़') ||
    // Spanish / French
    text.includes('juego de carreras') ||
    text.includes('jeu de course')
  ) {
    const localized = getGameResponse('runner', lang);
    return {
      isGameIntent: true,
      gameId: 'runner',
      action: 'launch',
      text: localized.text,
      expression: CHARACTER_STATES.EXCITED,
      buttons: [{ id: 'runner', label: localized.button }],
    };
  }

  // 3. Quiz Blast (Rocket Trivia)
  if (
    text.includes('quiz blast') ||
    text.includes('science quiz') ||
    text.includes('rocket quiz') ||
    text.includes('space quiz') ||
    (text.includes('quiz') && (text.includes('give me') || text.includes('play') || text.includes('start') || text.includes('test'))) ||
    text.includes('test my knowledge') ||
    text.includes('trivia') ||
    // Tamil
    text.includes('வினாடி வினா') ||
    text.includes('வினாடிவினா') ||
    text.includes('குவிஸ்') ||
    text.includes('கேள்வி பதில்') ||
    // Telugu
    text.includes('క్విజ్ బ్లాస్ట్') ||
    text.includes('రాకెట్ క్విజ్') ||
    text.includes('సైన్స్ క్విజ్') ||
    text.includes('క్విజ్') ||
    // Hindi
    text.includes('प्रश्नोत्तरी') ||
    text.includes('क्विज़') ||
    text.includes('क्विज') ||
    text.includes('सवाल जवाब') ||
    // Spanish / French
    text.includes('cuestionario') ||
    text.includes('questionnaire')
  ) {
    const localized = getGameResponse('quiz', lang);
    return {
      isGameIntent: true,
      gameId: 'quiz',
      action: 'launch',
      text: localized.text,
      expression: CHARACTER_STATES.HAPPY,
      buttons: [{ id: 'quiz', label: localized.button }],
    };
  }

  // 4. Brain Flip (Memory Match)
  if (
    text.includes('brain flip') ||
    text.includes('memory') ||
    text.includes('memory game') ||
    text.includes('match card') ||
    text.includes('card matching') ||
    text.includes('flip card') ||
    text.includes('test my memory') ||
    // Tamil
    text.includes('நினைவாற்றல்') ||
    text.includes('பிரைன் பிலிப்') ||
    text.includes('கார்டு மேட்சிங்') ||
    // Telugu
    text.includes('బ్రెయిన్ ఫ్లిప్') ||
    text.includes('మెమరీ గేమ్') ||
    text.includes('కార్డ్ మ్యాచ్') ||
    // Hindi
    text.includes('याददाश्त') ||
    text.includes('मेमोरी गेम') ||
    text.includes('ब्रेन फ्लिप') ||
    // Spanish / French
    text.includes('juego de memoria') ||
    text.includes('jeu de mémoire')
  ) {
    const localized = getGameResponse('memory', lang);
    return {
      isGameIntent: true,
      gameId: 'memory',
      action: 'launch',
      text: localized.text,
      expression: CHARACTER_STATES.CURIOUS,
      buttons: [{ id: 'memory', label: localized.button }],
    };
  }

  // 5. Catch the Bots (Reaction / Reflex)
  if (
    text.includes('catch the bot') ||
    text.includes('catch the bots') ||
    text.includes('reaction game') ||
    text.includes('tap the bot') ||
    text.includes('bot reflex') ||
    text.includes('whack') ||
    (text.includes('reaction') && text.includes('game')) ||
    // Tamil
    text.includes('ரோபோக்களை பிடி') ||
    text.includes('ரோபோ பிடி') ||
    // Telugu
    text.includes('రోబోట్లను పట్టుకో') ||
    text.includes('క్యాచ్ ది బాట్స్') ||
    text.includes('బాట్స్') ||
    // Hindi
    text.includes('बॉट्स पकड़ो') ||
    text.includes('कैच द बॉट्स') ||
    text.includes('रोबोट पकड़ो')
  ) {
    const localized = getGameResponse('bots', lang);
    return {
      isGameIntent: true,
      gameId: 'bots',
      action: 'launch',
      text: localized.text,
      expression: CHARACTER_STATES.EXCITED,
      buttons: [{ id: 'bots', label: localized.button }],
    };
  }

  // 6. BUDDY Pet Studio (Customization / Dress Up)
  if (
    text.includes('pet studio') ||
    text.includes('customize') ||
    text.includes('customise') ||
    text.includes('dress up') ||
    text.includes('outfit') ||
    text.includes('costume') ||
    text.includes('change look') ||
    text.includes('new hat') ||
    text.includes('glasses') ||
    text.includes('wardrobe') ||
    text.includes('fashion') ||
    // Tamil
    text.includes('அலங்கரி') ||
    text.includes('பெட் ஸ்டுடியோ') ||
    text.includes('ஆடை மாற்று') ||
    // Telugu
    text.includes('పెట్ స్టూడియో') ||
    text.includes('అలంకరించు') ||
    text.includes('కిరీటం') ||
    // Hindi
    text.includes('पेट स्टूडियो') ||
    text.includes('सजाओ') ||
    text.includes('कपड़े बदलो')
  ) {
    const localized = getGameResponse('studio', lang);
    return {
      isGameIntent: true,
      gameId: 'studio',
      action: 'launch',
      text: localized.text,
      expression: CHARACTER_STATES.PLAYFUL,
      buttons: [{ id: 'studio', label: localized.button }],
    };
  }

  // 7. Boredom / Suggest Fun Games / Surprise Me
  if (
    text.includes('bored') ||
    text.includes('boring') ||
    text.includes('surprise me') ||
    text.includes('something fun') ||
    text.includes('play something') ||
    text.includes('suggest a game') ||
    text.includes('entertain me') ||
    // Tamil
    text.includes('சலிப்பாக') ||
    text.includes('சலிக்குது') ||
    text.includes('ஆச்சரியப்படுத்து') ||
    // Telugu
    text.includes('బోర్') ||
    text.includes('ఏదైనా ఆడు') ||
    // Hindi
    text.includes('बोर हो') ||
    text.includes('कुछ मजेदार') ||
    text.includes('कुछ खेलें') ||
    // Spanish / French
    text.includes('aburrido') ||
    text.includes('ennuyé')
  ) {
    const localized = getGameResponse('suggest', lang);
    return {
      isGameIntent: true,
      action: 'suggest',
      text: localized.text,
      expression: CHARACTER_STATES.PLAYFUL,
      buttons: localized.buttons,
    };
  }

  // 8. High score / Stats / Achievements
  if (
    text.includes('high score') ||
    text.includes('high scores') ||
    text.includes('best score') ||
    text.includes('my records') ||
    text.includes('leaderboard') ||
    text.includes('achievements') ||
    text.includes('arcade stats') ||
    // Tamil
    text.includes('அதிக மதிப்பெண்') ||
    text.includes('சாதனை') ||
    text.includes('பதக்கம்') ||
    // Telugu
    text.includes('హై స్కోర్') ||
    text.includes('రికార్డు') ||
    text.includes('మెడల్స్') ||
    // Hindi
    text.includes('हाई स्कोर') ||
    text.includes('रिकॉर्ड') ||
    text.includes('उपलब्धियां')
  ) {
    const localized = getGameResponse('stats', lang);
    return {
      isGameIntent: true,
      action: 'stats',
      text: localized.text,
      expression: CHARACTER_STATES.CELEBRATING,
      buttons: localized.buttons,
    };
  }

  // 9. General Arcade / Games command
  if (
    text.includes('arcade') ||
    text.includes('play with buddy') ||
    text.includes('what games') ||
    text.includes('which games') ||
    text.includes('games can i play') ||
    text.includes('show games') ||
    text.includes('open games') ||
    text.includes('play a game') ||
    text.includes('play game') ||
    text.includes("let's play") ||
    text.includes('open the arcade') ||
    text.includes('start a game') ||
    // Tamil: "என்னுடன் ஒரு அறிவியல் விளையாட்டு விளையாடு", "விளையாட்டு விளையாடு", etc.
    text.includes('விளையாட்டு') ||
    text.includes('விளையாடு') ||
    text.includes('கேம்') ||
    // Telugu
    text.includes('ఆటలను చూపించు') ||
    text.includes('ఆర్కేడ్ తెరువు') ||
    text.includes('ఆట ఆడదాం') ||
    text.includes('గేమ్స్') ||
    text.includes('ఆటలు') ||
    // Hindi: "चलो कोई विज्ञान का खेल खेलते हैं", "खेल खेलो", "गेम खेलो", etc.
    text.includes('खेल खेलते') ||
    text.includes('खेल खेलो') ||
    text.includes('गेम खेलो') ||
    text.includes('गेम खेलना') ||
    // Spanish / French
    text.includes('jugar un juego') ||
    text.includes('jouer à un jeu')
  ) {
    const localized = getGameResponse('arcade', lang);
    return {
      isGameIntent: true,
      action: 'arcade',
      text: localized.text,
      expression: CHARACTER_STATES.CELEBRATING,
      buttons: localized.buttons,
    };
  }

  return null;
}
