import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { styles } from "../styles/styles";
import { money, pname } from "../utils/helpers";

export default function Ticker({ lang, products }) {
  const items = products.slice(0, 10);
  return (
    <div style={styles.ticker}>
      <div style={styles.tickerTrack}>
        {[...items, ...items].map((p, idx) => (
          <span style={styles.tickerItem} key={idx}>
            <span style={{ opacity: 0.75 }}>{pname(p, lang)}</span>
            <b>{money(p.price)}</b>
            <span style={{ color: p.todayDelta > 0 ? "#e8b93a" : p.todayDelta < 0 ? "#8fd694" : "#9aa88f" }}>
              {p.todayDelta === 0 ? "—" : p.todayDelta > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
