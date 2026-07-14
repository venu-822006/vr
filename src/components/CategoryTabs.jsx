import { styles } from "../styles/styles";
import { CATEGORIES } from "../data/constants";
import { catLabel } from "../utils/helpers";

export default function CategoryTabs({ category, setCategory, lang }) {
  return (
    <div style={styles.tabsWrap}>
      {CATEGORIES.map((c) => (
        <button key={c.key} onClick={() => setCategory(c.key)} style={{ ...styles.tab, ...(category === c.key ? styles.tabActive : {}) }}>
          {catLabel(c.key, lang)}
        </button>
      ))}
    </div>
  );
}
