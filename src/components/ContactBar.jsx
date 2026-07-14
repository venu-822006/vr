import { useState } from "react";
import { MessageCircle, Instagram, HelpCircle } from "lucide-react";
import { styles } from "../styles/styles";
import { WHATSAPP_NUMBER, INSTAGRAM_HANDLE } from "../data/constants";
import FAQModal from "./FAQModal";

export default function ContactBar({ t }) {
  const [faqOpen, setFaqOpen] = useState(false);

  return (
    <>
      <div style={styles.contactBar}>
        <button
          style={{ ...styles.contactBtn, background: "var(--leaf-deep)" }}
          onClick={() => setFaqOpen(true)}
          aria-label="FAQ and Delivery Info"
        >
          <HelpCircle size={20} color="#fff" />
        </button>
        <a
          style={{ ...styles.contactBtn, background: "#3FA85C" }}
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank" rel="noopener noreferrer"
          aria-label={t.whatsappLabel || "WhatsApp"}
        >
          <MessageCircle size={20} color="#fff" />
        </a>
        <a
          style={{ ...styles.contactBtn, background: "linear-gradient(135deg,#F5A623,#C1440E,#8A2BA0)" }}
          href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
          target="_blank" rel="noopener noreferrer"
          aria-label={t.instaLabel || "Instagram"}
        >
          <Instagram size={20} color="#fff" />
        </a>
      </div>
      <FAQModal open={faqOpen} onClose={() => setFaqOpen(false)} t={t} />
    </>
  );
}
