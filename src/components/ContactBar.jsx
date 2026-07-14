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
          style={{ ...styles.contactBtn, background: "#E1306C", zIndex: 100 }}
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
