import { ShoppingCart, Search, ChevronLeft, User, Mic } from "lucide-react";
import { useState } from "react";
import { styles } from "../styles/styles";

export default function Header({ cartCount, onCartClick, onAccountClick, query, setQuery, showBack, onBack, showSearch, t }) {
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript.replace(/\.$/, ''));
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  return (
    <header style={styles.header}>
      <div style={styles.headerRow} className="responsive-header">
        {showBack ? (
          <button style={styles.backBtn} onClick={onBack}><ChevronLeft size={18} /> {t.back}</button>
        ) : (
          <div style={styles.logo}>
            <span style={styles.logoMark} className="responsive-title">VR</span>
            <span style={styles.logoWord} className="responsive-title">Vegetables</span>
          </div>
        )}
        {showSearch && (
          <div style={{ ...styles.searchWrap, paddingRight: 8 }} className="responsive-search">
            <Search size={16} color="var(--ink-soft)" />
            <input
              type="text"
              placeholder={t.search}
              style={styles.searchInput}
              className="responsive-text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button 
              onClick={startListening} 
              style={{
                background: isListening ? '#ffe4e6' : 'transparent',
                border: 'none', 
                padding: 6, 
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: isListening ? '#e11d48' : 'var(--ink-soft)',
                transition: 'all 0.2s ease'
              }}
              title="Voice Search"
            >
              <Mic size={16} />
            </button>
          </div>
        )}
        {onAccountClick && (
          <button style={styles.iconCircleBtn} onClick={onAccountClick} aria-label="My Account">
            <User size={18} />
          </button>
        )}
        <button style={styles.cartBtn} onClick={onCartClick} aria-label="Open basket">
          <ShoppingCart size={19} />
          {cartCount > 0 && <span style={styles.cartBadge}>{cartCount}</span>}
        </button>
      </div>
    </header>
  );
}

