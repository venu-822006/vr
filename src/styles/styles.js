export const fontFace = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&family=Noto+Sans+Telugu:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; font-family: 'Inter', 'Noto Sans Telugu', sans-serif; }
  button, input, textarea, select { transition: all 0.2s ease; }
  input:focus, textarea:focus, select:focus, button:focus-visible { outline: 2px solid var(--leaf-deep); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
  @keyframes scrollTicker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }
  @keyframes slideDown { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
  @keyframes confettiFall { 0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scaleIn { 0% { transform: scale(0.3); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
  @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
  @keyframes shake { 10%, 90% { transform: translateX(-1px); } 20%, 80% { transform: translateX(2px); } 30%, 50%, 70% { transform: translateX(-4px); } 40%, 60% { transform: translateX(4px); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideRight { from { opacity: 0; transform: translateX(-15px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 70% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
  
  /* Mobile Responsiveness Overrides */
  @media (max-width: 480px) {
    .responsive-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; padding: 12px 10px 20px !important; }
    .responsive-header { flex-wrap: wrap !important; padding: 10px 12px !important; gap: 8px !important; }
    .responsive-search { max-width: 100% !important; flex: 1 1 100% !important; order: 3; padding: 6px 12px !important; margin-top: 2px !important; }
    .responsive-title { font-size: 18px !important; }
    .responsive-text { font-size: 13px !important; }
    .card-emoji-responsive { font-size: 26px !important; }
    .card-title-responsive { font-size: 13px !important; margin-bottom: 4px !important; }
    .card-stepper-btn { width: 28px !important; height: 28px !important; }
    .floating-cart-responsive { bottom: 12px !important; padding: 10px 18px !important; font-size: 13.5px !important; width: calc(100% - 24px) !important; justify-content: center !important; }
    .checkout-wrap-responsive { padding: 16px 14px 150px !important; }
    .checkout-footer-responsive { padding: 12px 14px !important; }
    .owner-wrap-responsive { padding: 14px 10px !important; }
    .owner-tabs-responsive { overflow-x: auto !important; max-width: calc(100vw - 20px) !important; white-space: nowrap !important; scrollbar-width: none; }
  }

  /* Print Styles */
  @media print {
    body { background: white !important; color: black !important; }
    .product-card, .contact-bar, button, select, input, .utility-bar, .header-row, .ticker { display: none !important; }
    table { width: 100% !important; border-collapse: collapse !important; border: 1px solid #ccc !important; }
    th, td { border: 1px solid #ccc !important; padding: 8px !important; color: black !important; }
    th { background: #f0f0f0 !important; font-weight: bold !important; }
    .owner-tabs, .owner-header { display: none !important; }
    .print-only { display: block !important; }
    * { animation: none !important; transition: none !important; box-shadow: none !important; }
  }
`;

export const vars = {
  "--sage-bg": "#EEF1E7", "--sage-line": "#D3DBC7", "--leaf-deep": "#28502F", "--leaf-mid": "#4C7A44",
  "--mustard": "#C98A1E", "--tomato": "#C1440E", "--ink": "#26281F", "--ink-soft": "#6C715D", "--paper": "#FBFAF5",
  "--primary": "#16a34a", "--danger": "#dc2626", "--border": "#D3DBC7", "--bg": "#EEF1E7",
};

export const darkVars = {
  "--sage-bg": "#1a1f16", "--sage-line": "#2d3328", "--leaf-deep": "#4ade80", "--leaf-mid": "#22c55e",
  "--mustard": "#fbbf24", "--tomato": "#f97316", "--ink": "#e8ede0", "--ink-soft": "#9ca38c", "--paper": "#232922",
  "--primary": "#4ade80", "--danger": "#ef4444", "--border": "#2d3328", "--bg": "#1a1f16",
};

export const styles = {
  appRoot: { ...vars, minHeight: "100vh" },
  app: { minHeight: "100vh", background: "var(--sage-bg)", color: "var(--ink)", paddingBottom: 40, position: "relative", overflow: "hidden" },

  ticker: { background: "var(--leaf-deep)", overflow: "hidden", height: 30, display: "flex", alignItems: "center" },
  tickerTrack: { display: "flex", whiteSpace: "nowrap", animation: "scrollTicker 28s linear infinite" },
  tickerItem: { display: "inline-flex", gap: 6, alignItems: "center", color: "#EAF0E2", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, padding: "0 18px", borderRight: "1px solid rgba(255,255,255,0.15)" },

  utilityBar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 20px", background: "var(--leaf-mid)", color: "#fff", fontSize: 12.5 },
  utilityLeft: { display: "flex", alignItems: "center", gap: 6 },
  townSelect: { background: "rgba(255,255,255,0.18) url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\") no-repeat right 6px center", color: "#fff", border: "none", borderRadius: 6, padding: "2px 22px 2px 8px", fontSize: 12.5, fontWeight: 600, appearance: "none", WebkitAppearance: "none", MozAppearance: "none", cursor: "pointer", backgroundSize: "14px" },

  langToggle: { display: "flex", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 14, overflow: "hidden" },
  langBtn: { background: "transparent", color: "inherit", border: "none", padding: "3px 9px", fontSize: 11.5, fontWeight: 700, cursor: "pointer" },
  langBtnActive: { background: "rgba(255,255,255,0.9)", color: "var(--leaf-deep)" },

  header: { background: "var(--paper)", borderBottom: "1px solid var(--sage-line)", position: "sticky", top: 0, zIndex: 5 },
  headerRow: { display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", maxWidth: 1080, margin: "0 auto" },
  logo: { display: "flex", alignItems: "baseline", gap: 8 },
  logoMark: { fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 22, color: "var(--tomato)" },
  logoWord: { fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 16, color: "var(--leaf-deep)", whiteSpace: "nowrap" },
  logoWordSmall: { fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 15, color: "var(--leaf-deep)" },
  backBtn: { display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--leaf-deep)", fontWeight: 600, cursor: "pointer", fontSize: 15, transition: "all 0.2s ease", padding: "4px 8px", borderRadius: 6 },
  backBtnHover: { background: "rgba(40,80,47,0.08)" },
  searchWrap: { flex: 1, display: "flex", alignItems: "center", gap: 8, background: "var(--sage-bg)", border: "1px solid var(--sage-line)", borderRadius: 20, padding: "8px 14px", maxWidth: 420 },
  searchInput: { border: "none", background: "transparent", flex: 1, fontSize: 14, color: "var(--ink)" },
  cartBtn: { position: "relative", background: "var(--leaf-deep)", color: "#fff", border: "none", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)", boxShadow: "0 2px 8px rgba(40,80,47,0.15)" },
  cartBtnHover: { transform: "scale(1.1) rotate(5deg)", boxShadow: "0 6px 16px rgba(40,80,47,0.3)" },
  iconCircleBtn: { background: "var(--sage-bg)", color: "var(--leaf-deep)", border: "1px solid var(--sage-line)", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all 0.2s ease" },
  iconCircleBtnHover: { background: "#fff", borderColor: "var(--leaf-mid)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  cartBadge: { position: "absolute", top: -4, right: -4, background: "var(--tomato)", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 10, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" },

  tabsWrap: { display: "flex", gap: 8, padding: "16px 20px 4px", maxWidth: 1080, margin: "0 auto", overflowX: "auto" },
  tab: { border: "1px solid var(--sage-line)", background: "var(--paper)", padding: "7px 16px", borderRadius: 18, fontSize: 13, fontWeight: 600, color: "var(--ink-soft)", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s ease" },
  tabHover: { background: "var(--sage-bg)", borderColor: "var(--leaf-mid)", transform: "translateY(-2px)" },
  tabActive: { background: "var(--leaf-deep)", color: "#fff", borderColor: "var(--leaf-deep)", boxShadow: "0 4px 12px rgba(40,80,47,0.25)", transform: "translateY(-1px)" },

  modeWrap: { padding: "10px 20px 0", maxWidth: 1080, margin: "0 auto" },
  modeToggle: { display: "inline-flex", border: "1px solid var(--sage-line)", borderRadius: 20, overflow: "hidden" },
  modeBtn: { background: "var(--paper)", border: "none", padding: "7px 18px", fontSize: 13, fontWeight: 700, color: "var(--ink-soft)", cursor: "pointer", transition: "all 0.2s ease" },
  modeBtnHover: { background: "var(--sage-bg)" },
  modeBtnActive: { background: "var(--mustard)", color: "#fff", boxShadow: "0 2px 8px rgba(201,138,30,0.2)" },
  bulkNote: { fontSize: 12, color: "var(--ink-soft)", marginTop: 6 },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, padding: "16px 20px 20px", maxWidth: 1080, margin: "0 auto" },
  emptyState: { gridColumn: "1 / -1", textAlign: "center", color: "var(--ink-soft)", padding: "40px 0", animation: "fadeIn 0.5s ease" },

  card: { background: "var(--paper)", border: "1px solid var(--sage-line)", borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", gap: 10, position: "relative", transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)", animation: "slideUp 0.4s ease backwards" },
  cardHover: { borderColor: "var(--leaf-mid)", boxShadow: "0 10px 24px rgba(40,80,47,0.12)", transform: "translateY(-6px)" },
  favoriteBtn: { position: "absolute", top: 10, right: 10, background: "rgba(255,255,255,0.85)", border: "1px solid var(--sage-line)", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 2, transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)" },
  favoriteBtnHover: { background: "#fff", boxShadow: "0 4px 12px rgba(220,38,38,0.2)", transform: "scale(1.15)", color: "var(--danger)" },
  favoriteBtnStatic: { background: "rgba(255,255,255,0.85)", border: "1px solid var(--sage-line)", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s ease" },
  cardOutOfStock: { opacity: 0.55 },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  cardEmoji: { fontSize: 34 },
  cardImage: { width: 56, height: 56, objectFit: "cover", borderRadius: 10, border: "1px solid var(--sage-line)", background: "#fff" },
  organicBadge: { display: "flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, color: "var(--leaf-mid)", background: "#E3EEDC", padding: "3px 7px", borderRadius: 10 },
  outOfStockBadge: { display: "flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, color: "#8A2B2B", background: "#F6DEDE", padding: "3px 7px", borderRadius: 10 },
  cardBody: { flex: 1 },
  cardName: { fontSize: 14.5, fontWeight: 600, margin: "0 0 8px" },
  priceTag: { display: "inline-block", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 14, background: "#FFF6DE", border: "1px dashed var(--mustard)", color: "#7A5410", padding: "3px 9px", borderRadius: 4 },
  perUnit: { fontWeight: 500, fontSize: 11, opacity: 0.75 },
  cardFooter: {},
  addBtn: { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "var(--leaf-deep)", color: "#fff", border: "none", borderRadius: 10, padding: "8px 0", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)", boxShadow: "0 2px 6px rgba(40,80,47,0.15)" },
  addBtnHover: { transform: "translateY(-2px) scale(1.02)", boxShadow: "0 6px 16px rgba(40,80,47,0.3)" },
  addBtnDisabled: { background: "var(--sage-line)", color: "var(--ink-soft)", cursor: "not-allowed", boxShadow: "none" },
  stepper: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--sage-bg)", borderRadius: 10, padding: "4px 6px" },
  stepBtn: { background: "#fff", border: "1px solid var(--sage-line)", borderRadius: 6, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s ease" },
  stepBtnHover: { background: "var(--sage-bg)", borderColor: "var(--leaf-mid)", color: "var(--leaf-deep)", fontWeight: 700 },
  stepQty: { fontSize: 12.5, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  weightStepHint: { fontSize: 10, color: "var(--ink-soft)", textAlign: "center", marginTop: 2 },
  lineTotal: { fontSize: 11.5, color: "var(--leaf-deep)", textAlign: "center", marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" },

  floatingCart: { position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: "var(--tomato)", color: "#fff", border: "none", borderRadius: 30, padding: "12px 22px", display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 14, boxShadow: "0 8px 22px rgba(193,68,14,0.35)", cursor: "pointer", zIndex: 6, transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)", animation: "slideUp 0.5s ease" },
  floatingCartHover: { transform: "translateX(-50%) translateY(-4px) scale(1.05)", boxShadow: "0 12px 32px rgba(193,68,14,0.45)" },
  floatingCartTotal: { background: "rgba(255,255,255,0.25)", padding: "2px 8px", borderRadius: 12 },

  overlay: { position: "fixed", inset: 0, background: "rgba(38,40,31,0.4)", zIndex: 8 },
  drawer: { position: "fixed", top: 0, right: 0, height: "100%", width: 360, maxWidth: "92vw", background: "var(--paper)", zIndex: 9, boxShadow: "-8px 0 24px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", transition: "transform 0.3s ease" },
  drawerHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 18px 10px", borderBottom: "1px solid var(--sage-line)" },
  iconBtn: { background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)" },
  drawerList: { flex: 1, overflowY: "auto", padding: "8px 14px" },
  drawerItem: { display: "flex", alignItems: "center", gap: 10, padding: "10px 4px", borderBottom: "1px solid var(--sage-bg)" },
  drawerFooter: { padding: "12px 18px 20px", borderTop: "1px solid var(--sage-line)" },
  wholesaleTag: { fontSize: 10, background: "#FFF6DE", color: "#7A5410", padding: "1px 6px", borderRadius: 8, marginLeft: 6, fontWeight: 700 },

  primaryBtn: { width: "100%", background: "var(--leaf-deep)", color: "#fff", border: "none", borderRadius: 10, padding: "12px 0", fontWeight: 700, fontSize: 14.5, cursor: "pointer", marginTop: 10, transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)", boxShadow: "0 4px 12px rgba(40,80,47,0.15)" },
  primaryBtnHover: { transform: "translateY(-3px) scale(1.01)", boxShadow: "0 8px 20px rgba(40,80,47,0.3)" },
  secondaryBtn: { flex: 1, background: "var(--sage-bg)", color: "var(--ink)", border: "1px solid var(--sage-line)", borderRadius: 10, padding: "12px 0", fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all 0.3s ease" },
  secondaryBtnHover: { background: "#fff", borderColor: "var(--leaf-mid)", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", transform: "translateY(-2px)" },
  secondaryBtnSmall: { display: "flex", alignItems: "center", gap: 6, background: "var(--sage-bg)", color: "var(--ink)", border: "1px solid var(--sage-line)", borderRadius: 8, padding: "7px 12px", fontWeight: 600, fontSize: 12.5, cursor: "pointer", transition: "all 0.2s ease" },
  secondaryBtnSmallHover: { background: "#fff", borderColor: "var(--leaf-mid)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  dangerBtnSmall: { display: "flex", alignItems: "center", gap: 6, background: "#F6DEDE", color: "#8A2B2B", border: "1px solid #EBC2C2", borderRadius: 8, padding: "6px 10px", fontWeight: 600, fontSize: 12, cursor: "pointer", transition: "all 0.2s ease" },
  dangerBtnSmallHover: { background: "#EEC9C9", borderColor: "#E0B0B0", boxShadow: "0 1px 4px rgba(138,43,43,0.1)" },

  checkoutWrap: { maxWidth: 560, margin: "0 auto", padding: "24px 20px 140px", display: "flex", flexDirection: "column", gap: 16 },
  checkoutSection: { background: "var(--paper)", border: "1px solid var(--sage-line)", borderRadius: 16, padding: 18 },
  checkoutHeader: { fontSize: 16, fontWeight: 700, margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8, color: "var(--leaf-deep)" },
  checkoutAddressBox: { display: "flex", flexDirection: "column", gap: 10 },
  checkoutSavedAddrChips: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 },
  checkoutInput: { width: "100%", border: "1px solid var(--sage-line)", borderRadius: 10, padding: "10px 12px", fontSize: 14, background: "#fff", fontFamily: "inherit" },
  checkoutTextarea: { width: "100%", border: "1px solid var(--sage-line)", borderRadius: 10, padding: 12, fontSize: 14, resize: "vertical", minHeight: 80, background: "#fff", fontFamily: "inherit" },
  checkoutSlotRow: { display: "flex", overflowX: "auto", gap: 10, paddingBottom: 4, scrollbarWidth: "none" },
  checkoutSlotPill: { flexShrink: 0, padding: "10px 16px", borderRadius: 12, border: "1px solid var(--sage-line)", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s ease" },
  checkoutSlotPillHover: { borderColor: "var(--leaf-mid)", background: "var(--sage-bg)" },
  checkoutSlotPillActive: { background: "var(--leaf-deep)", borderColor: "var(--leaf-deep)", color: "#fff", boxShadow: "0 2px 8px rgba(40,80,47,0.2)" },
  checkoutItemsList: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 14, paddingBottom: 14, borderBottom: "1px dashed var(--sage-line)" },
  checkoutItemRow: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13.5 },
  checkoutItemName: { display: "flex", alignItems: "center", gap: 6, fontWeight: 500 },
  checkoutItemPrice: { fontWeight: 600 },
  checkoutStickyFooter: { position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--paper)", borderTop: "1px solid var(--sage-line)", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12, zIndex: 10, boxShadow: "0 -4px 12px rgba(0,0,0,0.05)" },
  checkoutFooterInner: { maxWidth: 560, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 12 },
  checkoutPayRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "#fff", border: "1px solid var(--sage-line)", borderRadius: 12, cursor: "pointer", transition: "all 0.2s ease" },
  checkoutPayRowHover: { borderColor: "var(--leaf-mid)", boxShadow: "0 2px 8px rgba(40,80,47,0.08)" },
  checkoutPayLeft: { display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600 },
  checkoutPayChange: { fontSize: 12.5, color: "var(--leaf-deep)", fontWeight: 700 },
  checkoutActionRow: { display: "flex", gap: 12 },
  checkoutTotalCol: { display: "flex", flexDirection: "column", justifyContent: "center" },
  checkoutTotalLabel: { fontSize: 11, color: "var(--ink-soft)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 },
  checkoutTotalAmount: { fontSize: 18, fontWeight: 700, color: "var(--ink)" },
  checkoutPlaceBtn: { flex: 1, background: "var(--leaf-deep)", color: "#fff", border: "none", borderRadius: 12, padding: "14px 0", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8, transition: "all 0.2s ease", boxShadow: "0 2px 8px rgba(40,80,47,0.15)" },
  checkoutPlaceBtnHover: { transform: "translateY(-1px)", boxShadow: "0 6px 16px rgba(40,80,47,0.3)" },
  checkoutPlaceBtnDisabled: { background: "var(--sage-line)", color: "var(--ink-soft)", cursor: "not-allowed", boxShadow: "none" },
  paymentModal: { position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--paper)", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: "24px 20px 40px", zIndex: 20, boxShadow: "0 -10px 40px rgba(0,0,0,0.15)", transform: "translateY(100%)", transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)" },
  paymentModalOpen: { transform: "translateY(0)" },
  paymentModalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  paymentModalTitle: { fontSize: 18, fontWeight: 700, margin: 0 },
  paymentModalGrid: { display: "flex", flexDirection: "column", gap: 10 },

  trackingWrap: { maxWidth: 560, margin: "0 auto", padding: "24px 20px 80px" },
  trackingHeader: { textAlign: "center", marginBottom: 24 },
  trackingTitle: { fontSize: 22, fontWeight: 700, color: "var(--leaf-deep)", margin: "0 0 4px" },
  trackingSub: { fontSize: 13.5, color: "var(--ink-soft)", margin: 0 },
  trackingCard: { background: "var(--paper)", border: "1px solid var(--sage-line)", borderRadius: 16, padding: "30px 20px", display: "flex", flexDirection: "column", gap: 0 },
  trackRow: { display: "flex", gap: 16, position: "relative" },
  trackIconCol: { display: "flex", flexDirection: "column", alignItems: "center" },
  trackIconBox: { width: 44, height: 44, borderRadius: "50%", background: "#fff", border: "2px solid var(--sage-line)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-soft)", zIndex: 2, transition: "all 0.4s ease" },
  trackIconBoxActive: { background: "var(--leaf-deep)", borderColor: "var(--leaf-deep)", color: "#fff", boxShadow: "0 0 0 4px rgba(40,80,47,0.15)" },
  trackLineVertical: { width: 2, flex: 1, background: "var(--sage-line)", minHeight: 40, margin: "4px 0" },
  trackLineVerticalActive: { background: "var(--leaf-deep)" },
  trackContentCol: { flex: 1, paddingBottom: 24, paddingTop: 10 },
  trackStageTitle: { fontSize: 15, fontWeight: 600, color: "var(--ink)", margin: "0 0 4px" },
  trackStageTitleActive: { color: "var(--leaf-deep)" },
  trackStageDesc: { fontSize: 13, color: "var(--ink-soft)", margin: 0 },

  ownerLoginFooterLink: { display: "block", margin: "0 auto 20px", background: "none", border: "none", color: "var(--ink-soft)", textDecoration: "underline", cursor: "pointer", fontSize: 12.5 },

  loginWrap: { ...vars, minHeight: "100vh", background: "var(--sage-bg)", display: "flex", flexDirection: "column", padding: "20px 20px 80px" },
  loginTopRow: { display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 420, margin: "0 auto 24px", width: "100%", animation: "fadeIn 0.5s ease" },
  loginCard: { background: "var(--paper)", border: "1px solid var(--sage-line)", borderRadius: 18, padding: 26, maxWidth: 420, margin: "40px auto 0", width: "100%", animation: "scaleIn 0.45s cubic-bezier(0.22, 1, 0.36, 1)" },
  loginTitle: { fontFamily: "'Fraunces', serif", fontSize: 21, color: "var(--leaf-deep)", margin: "0 0 4px", textAlign: "center" },
  loginSub: { fontSize: 13, color: "var(--ink-soft)", textAlign: "center", margin: "0 0 20px" },
  loginTabs: { display: "flex", border: "1px solid var(--sage-line)", borderRadius: 12, overflow: "hidden", marginBottom: 18 },
  loginTab: { flex: 1, background: "#fff", border: "none", padding: "10px 0", fontWeight: 700, fontSize: 13.5, color: "var(--ink-soft)", cursor: "pointer", transition: "all 0.25s ease" },
  loginTabHover: { background: "var(--sage-bg)" },
  loginTabActive: { background: "var(--leaf-deep)", color: "#fff", transform: "scale(1.02)" },
  loginForm: { display: "flex", flexDirection: "column", animation: "slideUp 0.35s ease" },
  loginSpinner: { display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", verticalAlign: "middle", marginRight: 8 },
  inputLabel: { fontSize: 13, fontWeight: 600, color: "var(--ink)", margin: "12px 0 6px", display: "flex", alignItems: "center", gap: 6 },
  textInput: { width: "100%", border: "1px solid var(--sage-line)", borderRadius: 10, padding: "12px 14px", fontSize: 14, background: "#fff", fontFamily: "inherit", transition: "all 0.2s ease" },
  textarea: { width: "100%", border: "1px solid var(--sage-line)", borderRadius: 10, padding: "12px 14px", fontSize: 14, background: "#fff", fontFamily: "inherit", transition: "all 0.2s ease", resize: "vertical", minHeight: 80 },
  selectInput: { width: "100%", border: "1px solid var(--sage-line)", borderRadius: 10, padding: "12px 36px 12px 14px", fontSize: 14, background: "#fff url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234C7A44' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\") no-repeat right 14px center", backgroundSize: "16px", fontFamily: "inherit", transition: "all 0.2s ease", cursor: "pointer", appearance: "none", WebkitAppearance: "none", MozAppearance: "none" },
  textInputFocus: { borderColor: "var(--leaf-mid)", boxShadow: "0 0 0 3px rgba(76,122,68,0.1)" },
  hintText: { fontSize: 12, color: "var(--ink-soft)", marginTop: 10, fontStyle: "italic" },
  errorText: { fontSize: 13, color: "var(--tomato)", fontWeight: 600, marginTop: 8, backgroundColor: "rgba(193,68,14,0.08)", padding: "8px 10px", borderRadius: 6, border: "1px solid rgba(193,68,14,0.2)", animation: "shake 0.4s ease" },
  linkBtn: { background: "none", border: "none", color: "var(--leaf-deep)", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s ease", textDecoration: "none", padding: "2px 0" },
  linkBtnHover: { color: "var(--leaf-mid)" },
  otpFooterRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 4 },

  ownerWrap: { ...vars, minHeight: "100vh", background: "var(--sage-bg)", padding: "20px" },
  ownerHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 820, margin: "0 auto 20px" },
  ownerCard: { background: "var(--paper)", border: "1px solid var(--sage-line)", borderRadius: 16, padding: 22, maxWidth: 820, margin: "0 auto" },
  ownerTabs: { display: "inline-flex", border: "1px solid var(--sage-line)", borderRadius: 12, overflow: "hidden", marginBottom: 16 },
  ownerTabBtn: { background: "#fff", border: "none", padding: "9px 20px", fontWeight: 700, fontSize: 13.5, color: "var(--ink-soft)", cursor: "pointer", transition: "all 0.2s ease" },
  ownerTabBtnHover: { background: "var(--sage-bg)" },
  ownerTabBtnActive: { background: "var(--leaf-deep)", color: "#fff" },
  ownerTableWrap: { overflowX: "auto", margin: "14px 0" },
  ownerTable: { width: "100%", borderCollapse: "collapse" },
  ownerTh: { textAlign: "left", fontSize: 12, color: "var(--ink-soft)", padding: "6px 8px", borderBottom: "1px solid var(--sage-line)" },
  ownerTd: { padding: "6px 8px", borderBottom: "1px solid var(--sage-bg)" },
  ownerTdName: { padding: "6px 8px", borderBottom: "1px solid var(--sage-bg)", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" },
  priceInput: { width: 80, border: "1px solid var(--sage-line)", borderRadius: 8, padding: "6px 8px", fontSize: 13.5, fontFamily: "'JetBrains Mono', monospace" },
  photoCellWrap: { display: "flex", alignItems: "center", gap: 8 },
  photoThumb: { width: 34, height: 34, objectFit: "cover", borderRadius: 8, border: "1px solid var(--sage-line)", flexShrink: 0, background: "#fff" },
  photoThumbEmpty: { width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, borderRadius: 8, border: "1px dashed var(--sage-line)", flexShrink: 0, background: "#fff" },
  photoUrlInput: { flex: 1, minWidth: 140, border: "1px solid var(--sage-line)", borderRadius: 8, padding: "6px 8px", fontSize: 12 },
  savedToast: { textAlign: "center", color: "var(--leaf-deep)", fontWeight: 700, fontSize: 13.5, marginTop: 10 },
  stockToggle: { display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12.5, fontWeight: 600 },

  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 },
  formGridFull: { gridColumn: "1 / -1" },
  checkboxRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 13.5, fontWeight: 600 },
  customVegRow: { display: "flex", alignItems: "center", gap: 10, padding: "8px 4px", borderBottom: "1px solid var(--sage-bg)" },

  contactBar: { position: "fixed", bottom: 20, right: 16, display: "flex", flexDirection: "column", gap: 10, zIndex: 99 },
  contactBtn: { width: 46, height: 46, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px rgba(0,0,0,0.2)", textDecoration: "none" },

  accountWrap: { maxWidth: 640, margin: "0 auto", padding: "20px 20px 8px" },
  accountTabs: { display: "flex", gap: 8, marginBottom: 16, overflowX: "auto" },
  accountTabBtn: { display: "flex", alignItems: "center", gap: 6, border: "1px solid var(--sage-line)", background: "var(--paper)", padding: "8px 14px", borderRadius: 18, fontSize: 13, fontWeight: 600, color: "var(--ink-soft)", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s ease" },
  accountTabBtnHover: { background: "var(--sage-bg)", borderColor: "var(--sage-line)" },
  accountTabBtnActive: { background: "var(--leaf-deep)", color: "#fff", borderColor: "var(--leaf-deep)", boxShadow: "0 2px 8px rgba(40,80,47,0.2)" },

  orderCard: { background: "var(--paper)", border: "1px solid var(--sage-line)", borderRadius: 12, padding: 14, marginBottom: 10 },
  orderCardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  orderCardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 },

  addressRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 4px", borderBottom: "1px solid var(--sage-bg)" },
  savedAddrQuickWrap: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 },
  savedAddrChip: { display: "flex", alignItems: "center", gap: 4, border: "1px solid var(--leaf-mid)", background: "#EAF1E4", color: "var(--leaf-deep)", borderRadius: 14, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease" },
  savedAddrChipHover: { background: "var(--leaf-mid)", color: "#fff", boxShadow: "0 2px 6px rgba(76,122,68,0.2)" },

  footer: { background: "var(--paper)", borderTop: "1px solid var(--sage-line)", marginTop: 10, padding: "24px 20px 14px" },
  footerInner: { display: "flex", flexWrap: "wrap", gap: 28, maxWidth: 1080, margin: "0 auto" },
  footerCol: { flex: "1 1 200px", minWidth: 180 },
  footerAbout: { fontSize: 12.5, color: "var(--ink-soft)", marginTop: 8, lineHeight: 1.5 },
  footerHeading: { fontSize: 12.5, fontWeight: 700, color: "var(--ink)", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.4 },
  footerLink: { display: "block", background: "none", border: "none", color: "var(--leaf-deep)", fontWeight: 600, fontSize: 13, cursor: "pointer", padding: "3px 0", textAlign: "left", transition: "all 0.2s ease" },
  footerLinkHover: { color: "var(--leaf-mid)" },
  footerContactLine: { display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--ink-soft)", margin: "4px 0" },
  footerCopy: { textAlign: "center", fontSize: 11.5, color: "var(--ink-soft)", marginTop: 18, paddingTop: 12, borderTop: "1px solid var(--sage-bg)", maxWidth: 1080, marginLeft: "auto", marginRight: "auto" },
};
