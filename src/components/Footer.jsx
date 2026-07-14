import { MapPin, Phone } from "lucide-react";
import { styles } from "../styles/styles";
import { WHATSAPP_NUMBER } from "../data/constants";

export default function Footer({ t, onAccountClick }) {
  const year = new Date().getFullYear();
  const displayPhone = "+" + WHATSAPP_NUMBER.replace(/^91/, "91 ");

  return (
    <footer style={styles.footer}>
      <div style={styles.footerInner}>
        <div style={styles.footerCol}>
          <div style={styles.logo}>
            <span style={styles.logoMark}>VR</span>
            <span style={styles.logoWordSmall}>Venkataramana Vegetables</span>
          </div>
          <p style={styles.footerAbout}>{t.footerAbout}</p>
        </div>

        <div style={styles.footerCol}>
          <h4 style={styles.footerHeading}>{t.footerLinksTitle}</h4>
          <button style={styles.footerLink} onClick={onAccountClick}>{t.footerMyAccount}</button>
        </div>

        <div style={styles.footerCol}>
          <h4 style={styles.footerHeading}>{t.footerContactTitle}</h4>
          <p style={styles.footerContactLine}><Phone size={13} /> {displayPhone}</p>
          <p style={styles.footerContactLine}><MapPin size={13} /> {t.footerServiceArea}</p>
        </div>
      </div>
      <p style={styles.footerCopy}>© {year} Venkataramana Vegetables. {t.footerRights}</p>
    </footer>
  );
}
