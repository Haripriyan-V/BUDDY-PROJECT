import React, { useState } from 'react';
import { Send } from 'lucide-react';

export function TextFallback({ onSendMessage, disabled = false, placeholder = "Type a message or question to BUDDY..." }) {
  const [inputVal, setInputVal] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim() || disabled) return;
    onSendMessage(inputVal.trim());
    setInputVal('');
  };

  return (
    <form className="text-fallback-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="text-fallback-input"
        placeholder={placeholder}
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        disabled={disabled}
      />
      <button
        type="submit"
        className="text-fallback-submit"
        disabled={disabled || !inputVal.trim()}
        aria-label="Send message"
      >
        <Send size={18} />
      </button>
    </form>
  );
}
