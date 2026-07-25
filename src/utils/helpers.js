import { CATEGORIES, TOWNS } from "../data/constants";

export const money = (n) => `₹${Number(n) % 1 !== 0 ? Number(n).toFixed(2) : Number(n)}`;

export const catLabel = (key, lang) => (CATEGORIES.find((c) => c.key === key) || {})[lang] || key;

export const townLabel = (key, lang) => (TOWNS.find((t) => t.key === key) || {})[lang] || key;

export const pname = (p, lang) => (lang === "te" ? p.te : p.name);
