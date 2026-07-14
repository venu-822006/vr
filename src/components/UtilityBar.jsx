import { MapPin } from "lucide-react";
import { styles } from "../styles/styles";
import { TOWNS } from "../data/constants";
import { townLabel } from "../utils/helpers";
import LangToggle from "./LangToggle";

export default function UtilityBar({ lang, setLang, town, setTown, t }) {
  return (
    <div style={styles.utilityBar}>
      <div style={styles.utilityLeft}>
        <MapPin size={13} />
        <span>{t.deliveringTo}</span>
        <select style={styles.townSelect} value={town} onChange={(e) => setTown(e.target.value)}>
          {TOWNS.map((tw) => <option key={tw.key} value={tw.key} style={{background: "#fff", color: "#333"}}>{townLabel(tw.key, lang)}</option>)}
        </select>
      </div>
      <LangToggle lang={lang} setLang={setLang} />
    </div>
  );
}
