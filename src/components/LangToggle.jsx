import { styles } from "../styles/styles";

export default function LangToggle({ lang, setLang }) {
  return (
    <div style={styles.langToggle}>
      <button style={{ ...styles.langBtn, ...(lang === "en" ? styles.langBtnActive : {}) }} onClick={() => setLang("en")}>EN</button>
      <button style={{ ...styles.langBtn, ...(lang === "te" ? styles.langBtnActive : {}) }} onClick={() => setLang("te")}>తె</button>
    </div>
  );
}
