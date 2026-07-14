import { useState, useEffect } from "react";
import { User, Package, MapPin, Heart, Trash2, RotateCcw, ShieldCheck, Phone, LogOut, Bell, Search, Download } from "lucide-react";
import { styles } from "../styles/styles";
import { TOWNS } from "../data/constants";
import { townLabel, pname, money } from "../utils/helpers";
import { storage } from "../utils/storage";
import { generateOtp, OTP_TTL_MS } from "../utils/auth";
import { isPushSupported, isCurrentlySubscribed, subscribeToPush, unsubscribeFromPush } from "../utils/push";

export default function AccountPage({
  t, lang, customer, customerRecord, allProducts,
  onUpdateName, onChangePhone, onAddAddress, onRemoveAddress,
  onToggleFavorite, onReorder, onLogout,
}) {
  const [tab, setTab] = useState("profile");

  // --- Profile: name -------------------------------------------------------
  const [name, setName] = useState(customer?.name || "");
  const [nameSaved, setNameSaved] = useState(false);
  useEffect(() => setName(customer?.name || ""), [customer?.name]);

  const saveName = async () => {
    if (!name.trim()) return;
    await onUpdateName(name.trim());
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  // --- Profile: change phone number (requires OTP on the new number) ------
  const [changingPhone, setChangingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [phaseOtp, setPhaseOtp] = useState(false);
  const [otpRecord, setOtpRecord] = useState(null);
  const [otpInput, setOtpInput] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const sendPhoneOtp = () => {
    if (!/^\d{10}$/.test(newPhone)) {
      setPhoneError(t.otpInvalid);
      return;
    }
    setPhoneError("");
    setOtpRecord({ code: generateOtp(), expiresAt: Date.now() + OTP_TTL_MS });
    setOtpInput("");
    setPhaseOtp(true);
  };

  const verifyPhoneOtp = async () => {
    if (!otpRecord || Date.now() > otpRecord.expiresAt) { setPhoneError(t.otpExpired); return; }
    if (otpInput !== otpRecord.code) { setPhoneError(t.otpInvalid); return; }
    await onChangePhone(newPhone);
    setChangingPhone(false);
    setPhaseOtp(false);
    setNewPhone("");
    setOtpRecord(null);
  };

  // --- Push notifications ----------------------------------------------------
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushError, setPushError] = useState("");

  useEffect(() => {
    if (isPushSupported()) {
      isCurrentlySubscribed().then(setPushSubscribed);
    }
  }, []);

  const togglePush = async () => {
    setPushError("");
    setPushLoading(true);
    try {
      if (pushSubscribed) {
        await unsubscribeFromPush(customer?.token);
        setPushSubscribed(false);
      } else {
        await subscribeToPush(customer?.token);
        setPushSubscribed(true);
      }
    } catch (e) {
      setPushError(e.message || "Something went wrong.");
    }
    setPushLoading(false);
  };

  // --- Orders ---------------------------------------------------------------
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await storage.get("vr-veg-orders", true);
      const all = res && res.value ? JSON.parse(res.value) : [];
      setOrders(all.filter((o) => o.phone === customer?.phone).slice().reverse());
    } catch (e) {
      setOrders([]);
    }
    setLoadingOrders(false);
  };

  useEffect(() => { loadOrders(); }, [customer?.phone]);

  const itemsSummary = (items) =>
    items.map((i) => `${lang === "te" ? i.te : i.name} ×${i.qty}kg`).join(", ");

  // --- Addresses --------------------------------------------------------
  const [newLabel, setNewLabel] = useState("");
  const [newTown, setNewTown] = useState(TOWNS[0].key);
  const [newArea, setNewArea] = useState("");

  const submitAddress = async () => {
    if (!newArea.trim()) return;
    await onAddAddress({ label: newLabel.trim() || t.addressDefaultLabel, town: newTown, area: newArea.trim() });
    setNewLabel("");
    setNewArea("");
  };

  // --- Favorites --------------------------------------------------------
  const favoriteProducts = (customerRecord?.favorites || [])
    .map((id) => allProducts.find((p) => p.id === id))
    .filter(Boolean);

  const rateOrder = async (orderId, rating) => {
    try {
      await fetch(`/api/orders/${orderId}/rating`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      });
      const res = await storage.get("vr-veg-orders", true);
      const all = res && res.value ? JSON.parse(res.value) : [];
      const updated = all.map(o => o.id === orderId ? { ...o, deliveryRating: rating } : o);
      await storage.set("vr-veg-orders", JSON.stringify(updated), true);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, deliveryRating: rating } : o));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={styles.accountWrap}>
      <div style={styles.accountTabs}>
        <button style={{ ...styles.accountTabBtn, ...(tab === "profile" ? styles.accountTabBtnActive : {}) }} onClick={() => setTab("profile")}><User size={14} /> {t.tabProfile}</button>
        <button style={{ ...styles.accountTabBtn, ...(tab === "orders" ? styles.accountTabBtnActive : {}) }} onClick={() => { setTab("orders"); loadOrders(); }}><Package size={14} /> {t.tabOrders}</button>
        <button style={{ ...styles.accountTabBtn, ...(tab === "addresses" ? styles.accountTabBtnActive : {}) }} onClick={() => setTab("addresses")}><MapPin size={14} /> {t.tabAddresses}</button>
        <button style={{ ...styles.accountTabBtn, ...(tab === "favorites" ? styles.accountTabBtnActive : {}) }} onClick={() => setTab("favorites")}><Heart size={14} /> {t.tabFavorites}</button>
      </div>

      {tab === "profile" && (
        <div style={styles.checkoutCard}>
          <h3 style={styles.sectionTitle}><User size={16} /> {t.profileTitle}</h3>
          <label style={styles.inputLabel}>{t.nameLabel}</label>
          <input style={styles.textInput} value={name} onChange={(e) => setName(e.target.value)} />
          <button style={styles.primaryBtn} onClick={saveName}>{t.saveName}</button>
          {nameSaved && <p style={styles.savedToast}>{t.saved}</p>}

          <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--sage-line)" }}>
            <label style={styles.inputLabel}><Phone size={13} /> {t.phoneLabel}</label>
            <p style={{ fontSize: 15, fontWeight: 600, margin: "4px 0 10px" }}>+91 {customer?.phone}</p>

            {!changingPhone ? (
              <div style={{ display: "flex", gap: 10 }}>
                <button style={styles.secondaryBtnSmall} onClick={() => setChangingPhone(true)}>{t.changeNumber}</button>
                <button style={{ ...styles.dangerBtnSmall }} onClick={onLogout}><LogOut size={13} /> {t.logout}</button>
              </div>
            ) : !phaseOtp ? (
              <>
                <label style={styles.inputLabel}>{t.newPhoneLabel}</label>
                <input style={styles.textInput} value={newPhone} maxLength={10} onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ""))} />
                {phoneError && <p style={styles.errorText}>{phoneError}</p>}
                <div style={styles.checkoutNavRow}>
                  <button style={styles.secondaryBtn} onClick={() => { setChangingPhone(false); setPhoneError(""); }}>{t.back}</button>
                  <button style={styles.primaryBtn} disabled={!/^\d{10}$/.test(newPhone)} onClick={sendPhoneOtp}>{t.sendOtpBtn}</button>
                </div>
              </>
            ) : (
              <>
                <label style={styles.inputLabel}><ShieldCheck size={13} /> {t.otpLabel}</label>
                <div style={styles.demoOtpBox}>{t.demoOtpNote} <b style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16 }}>{otpRecord?.code}</b></div>
                <input style={styles.textInput} placeholder={t.otpPh} value={otpInput} maxLength={4} onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))} />
                {phoneError && <p style={styles.errorText}>{phoneError}</p>}
                <div style={styles.checkoutNavRow}>
                  <button style={styles.secondaryBtn} onClick={() => setPhaseOtp(false)}>{t.back}</button>
                  <button style={styles.primaryBtn} disabled={otpInput.length !== 4} onClick={verifyPhoneOtp}>{t.verifyOtpBtn}</button>
                </div>
              </>
            )}
          </div>

          {isPushSupported() && (
            <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--sage-line)" }}>
              <label style={styles.inputLabel}><Bell size={13} /> {t.notificationsLabel}</label>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 6 }}>
                <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0 }}>{t.notificationsHint}</p>
                <button
                  style={{ ...styles.secondaryBtnSmall, whiteSpace: "nowrap", opacity: pushLoading ? 0.6 : 1 }}
                  disabled={pushLoading}
                  onClick={togglePush}
                >
                  {pushLoading ? "…" : (pushSubscribed ? t.notificationsOn : t.notificationsOff)}
                </button>
              </div>
              {pushError && <p style={styles.errorText}>{pushError}</p>}
            </div>
          )}
        </div>
      )}

      {tab === "orders" && (
        <div>
          {loadingOrders ? (
            <p style={{ color: "var(--ink-soft)", fontSize: 13.5 }}>…</p>
          ) : orders.length === 0 ? (
            <p style={{ color: "var(--ink-soft)", fontSize: 13.5 }}>{t.noOrders}</p>
          ) : (
            orders.map((o) => (
              <div key={o.id} style={styles.orderCard}>
                <div style={styles.orderCardHeader}>
                  <span style={{ fontWeight: 700 }}>{t.orderNo} #{o.id}</span>
                  <span style={{ color: "var(--ink-soft)", fontSize: 12.5 }}>{o.placedAt}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "4px 0" }}>{itemsSummary(o.items)}</p>
                <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--bg-soft)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 500 }}>Rate your delivery:</span>
                  <div style={{ display: 'flex', gap: 12, fontSize: 20 }}>
                    {['😠', '😐', '🤩'].map(emoji => (
                      <button
                        key={emoji}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: o.deliveryRating === emoji ? 1 : o.deliveryRating ? 0.3 : 1, transform: o.deliveryRating === emoji ? 'scale(1.2)' : 'none', transition: 'all 0.2s' }}
                        onClick={() => rateOrder(o.id, emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={styles.orderCardFooter}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, width: '100%' }}>
                  <button 
                    style={{ ...styles.secondaryBtn, flex: 1, marginRight: 8, padding: '8px', fontSize: 13 }}
                    onClick={() => onReorder(o)}
                  >
                    <Search size={14} style={{ marginRight: 4 }} /> Reorder
                  </button>
                  <button 
                    style={{ ...styles.secondaryBtn, flex: 1, marginLeft: 8, padding: '8px', fontSize: 13 }}
                    onClick={() => window.open(`/api/orders/${o.id}/invoice`, '_blank')}
                  >
                    <Download size={14} style={{ marginRight: 4 }} /> Receipt
                  </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "addresses" && (
        <div style={styles.checkoutCard}>
          <h3 style={styles.sectionTitle}><MapPin size={16} /> {t.savedAddresses}</h3>
          {(customerRecord?.addresses || []).length === 0 ? (
            <p style={{ color: "var(--ink-soft)", fontSize: 13.5 }}>{t.noAddresses}</p>
          ) : (
            (customerRecord.addresses).map((a) => (
              <div key={a.id} style={styles.addressRow}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{a.label}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{a.area}, {townLabel(a.town, lang)}</div>
                </div>
                <button style={styles.dangerBtnSmall} onClick={() => onRemoveAddress(a.id)}><Trash2 size={13} /> {t.removeItem}</button>
              </div>
            ))
          )}

          <h4 style={{ ...styles.sectionTitle, marginTop: 20, fontSize: 14 }}>{t.addNewAddress}</h4>
          <label style={styles.inputLabel}>{t.addressLabelField}</label>
          <input style={styles.textInput} placeholder={t.addressLabelPh} value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
          <label style={styles.inputLabel}>{t.townLabel}</label>
          <select style={styles.selectInput} value={newTown} onChange={(e) => setNewTown(e.target.value)}>
            {TOWNS.map((tw) => <option key={tw.key} value={tw.key}>{townLabel(tw.key, lang)}</option>)}
          </select>
          <label style={styles.inputLabel}>{t.addrTitle}</label>
          <textarea style={styles.textarea} rows={3} placeholder={t.areaPh} value={newArea} onChange={(e) => setNewArea(e.target.value)} />
          <button style={styles.primaryBtn} disabled={!newArea.trim()} onClick={submitAddress}>{t.saveAddress}</button>
        </div>
      )}

      {tab === "favorites" && (
        <div>
          {favoriteProducts.length === 0 ? (
            <p style={{ color: "var(--ink-soft)", fontSize: 13.5 }}>{t.noFavorites}</p>
          ) : (
            <div style={styles.grid}>
              {favoriteProducts.map((p) => (
                <div key={p.id} style={styles.card}>
                  <div style={styles.cardTop}>
                    {p.image ? <img src={p.image} alt={pname(p, lang)} style={styles.cardImage} /> : <span style={styles.cardEmoji}>{p.emoji}</span>}
                    <button style={styles.favoriteBtnStatic} onClick={() => onToggleFavorite(p.id)}><Heart size={16} fill="var(--tomato)" color="var(--tomato)" /></button>
                  </div>
                  <h3 style={styles.cardName}>{pname(p, lang)}</h3>
                  <div style={styles.priceTag}>{money(p.price)} <span style={styles.perUnit}>/ {p.unit}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
