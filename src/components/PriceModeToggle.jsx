import { styles } from "../styles/styles";

export default function PriceModeToggle({ priceMode, setPriceMode, t }) {
  return (
    <div style={styles.modeWrap}>
      <div style={styles.modeToggle}>
        <button style={{ ...styles.modeBtn, ...(priceMode === "retail" ? styles.modeBtnActive : {}) }} onClick={() => setPriceMode("retail")}>{t.retail}</button>
        <button style={{ ...styles.modeBtn, ...(priceMode === "wholesale" ? styles.modeBtnActive : {}) }} onClick={() => setPriceMode("wholesale")}>{t.wholesale}</button>
      </div>
      {priceMode === "wholesale" && <p style={styles.bulkNote}>{t.bulkNote}</p>}
    </div>
  );
}
