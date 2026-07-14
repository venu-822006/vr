import { CheckCircle2, Package, Truck, Home } from "lucide-react";

// ---------------------------------------------------------------------------
// CONFIG — contact links & delivery towns
// ---------------------------------------------------------------------------
export const WHATSAPP_NUMBER = "+916281687567"; // country code + number
export const INSTAGRAM_HANDLE = "venkataramana_vegetables";

export const TOWNS = [
  { key: "Tirupati", en: "Tirupati", te: "తిరుపతి" },
  { key: "Bapatla", en: "Bapatla", te: "బాపట్ల" },
  { key: "Chirala", en: "Chirala", te: "చీరాల" },
  { key: "Karlapalem", en: "Karlapalem", te: "కర్లపాలెం" },
  { key: "Cherukupalli", en: "Cherukupalli", te: "చెరుకుపల్లి" },
];

export const CATEGORIES = [
  { key: "All", en: "All", te: "అన్నీ" },
  { key: "Leafy & Herbs", en: "Leafy & Herbs", te: "ఆకుకూరలు & మూలికలు" },
  { key: "Roots & Tubers", en: "Roots & Tubers", te: "దుంపలు" },
  { key: "Gourds & Squash", en: "Gourds & Squash", te: "బీర & సొర కాయలు" },
  { key: "Beans & Pods", en: "Beans & Pods", te: "బీన్స్ & కాయధాన్యాలు" },
  { key: "Other Vegetables", en: "Other Vegetables", te: "ఇతర కూరగాయలు" },
];

export const SLOTS = ["7:00 – 9:00 AM", "9:00 – 11:00 AM", "4:00 – 6:00 PM", "6:00 – 8:00 PM"];

export const STAGE_KEYS = ["stagePlaced", "stagePacked", "stageOut", "stageDelivered"];
export const STAGE_ICONS = [CheckCircle2, Package, Truck, Home];

// Quantity/weight stepping used by the +/- stepper on each product card.
// Retail buyers can now move in half-kilo increments.
export const RETAIL_KG_STEP = 0.5;
export const WHOLESALE_KG_STEP = 5; // bulk rate only kicks in at 5kg+
export const PIECE_STEP = 1; // for "piece" / "bunch" / "100g"-style units

// Units that are sold by weight (kg) and therefore benefit from the quarter-kg
// stepper. Units like "piece", "bunch", "100g" step by whole units instead.
export const WEIGHT_UNITS = ["kg"];
