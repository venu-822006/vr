import { CATEGORIES, TOWNS } from "../data/constants";

export const money = (n) => `₹${Number(n).toFixed(0)}`;

export const catLabel = (key, lang) => (CATEGORIES.find((c) => c.key === key) || {})[lang] || key;

export const townLabel = (key, lang) => (TOWNS.find((t) => t.key === key) || {})[lang] || key;

export const pname = (p, lang) => (lang === "te" ? p.te : p.name);
