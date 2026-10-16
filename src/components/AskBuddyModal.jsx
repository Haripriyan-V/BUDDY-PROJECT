import React, { useState } from 'react';
import { BookOpen, X, Sparkles } from 'lucide-react';

const TOPIC_CATEGORIES = [
  {
    category: 'Physics',
    icon: '⚡',
    questions: [
      { text: "What is Newton's third law?", hint: 'Action and equal opposite reaction' },
      { text: "What is gravity?", hint: 'Space-time curvature and mass' },
      { text: "What is the speed of light?", hint: '300,000 km/s cosmic speed limit' },
    ],
  },
  {
    category: 'Biology',
    icon: '🌱',
    questions: [
      { text: 'How does photosynthesis work?', hint: 'Plants converting sunlight to energy' },
      { text: 'What is inside DNA?', hint: 'Genetic code recipe (A, T, C, G)' },
      { text: 'Why are mitochondria the powerhouse of cells?', hint: 'ATP biological fuel generation' },
    ],
  },
  {
    category: 'Chemistry',
    icon: '⚛️',
    questions: [
      { text: 'What is inside an atom?', hint: 'Protons, neutrons, and electron clouds' },
      { text: 'Why does ice float on water?', hint: 'Hydrogen bonding and density expansion' },
      { text: 'What is the periodic table?', hint: 'Elements organized by atomic number' },
    ],
  },
  {
    category: 'Space',
    icon: '🌌',
    questions: [
      { text: 'How do black holes bend gravity?', hint: 'Singularities and event horizons' },
      { text: 'How long is a day on Venus?', hint: 'Longer than an entire year on Venus!' },
      { text: 'How do solar panels work in space?', hint: 'Photovoltaic effect on satellites' },
    ],
  },
  {
    category: 'Tech & AI',
    icon: '🤖',
    questions: [
      { text: 'How does Artificial Intelligence learn?', hint: 'Machine learning & neural networks' },
      { text: 'What are quantum computers?', hint: 'Qubits and quantum superposition' },
      { text: 'How do robots make decisions?', hint: 'Sensors, feedback loops & algorithms' },
    ],
  },
];

export function AskBuddyModal({ onSelectQuestion, onClose }) {
  const [activeCategory, setActiveCategory] = useState('Physics');

  const selectedCategoryData = TOPIC_CATEGORIES.find((c) => c.category === activeCategory) || TOPIC_CATEGORIES[0];

  return (
    <div className="ask-modal-backdrop" onClick={onClose}>
      <div className="ask-card-glass" onClick={(e) => e.stopPropagation()}>
        <div className="ask-header">
          <div className="ask-title-wrap">
            <BookOpen size={20} className="book-icon" />
            <h3>ASK BUDDY • SCIENCE EXAM & TOPIC HELPER</h3>
          </div>
          <button className="ask-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <p className="ask-subtitle">
          Select a concept topic or tap <strong>Daily Discovery</strong> to hear a verified cosmic fact!
        </p>

        {/* Quick Discovery Button */}
        <div style={{ marginBottom: '14px' }}>
          <button
            className="daily-discovery-btn"
            onClick={() => {
              onSelectQuestion('Tell me a daily discovery fact!');
              onClose();
            }}
          >
            <Sparkles size={16} />
            <span>Hear A Daily Cosmic Discovery! 🌟</span>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="ask-category-tabs">
          {TOPIC_CATEGORIES.map((cat, idx) => (
            <button
              key={idx}
              className={`ask-cat-btn ${activeCategory === cat.category ? 'cat-active' : ''}`}
              onClick={() => setActiveCategory(cat.category)}
            >
              <span>{cat.icon}</span>
              <span>{cat.category}</span>
            </button>
          ))}
        </div>

        {/* Questions for active category */}
        <div className="ask-chips-grid">
          {selectedCategoryData.questions.map((item, idx) => (
            <button
              key={idx}
              className="ask-chip-btn"
              onClick={() => {
                onSelectQuestion(item.text);
                onClose();
              }}
            >
              <span className="chip-icon">{selectedCategoryData.icon}</span>
              <div className="chip-details">
                <span className="chip-question">"{item.text}"</span>
                <span className="chip-subject">{item.hint}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
