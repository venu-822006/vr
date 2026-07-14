import { useState, useEffect } from "react";
import { MapPin, Clock, CreditCard, Wallet, Banknote, ChevronRight, CheckCircle2, ChevronDown, Tag, Truck } from "lucide-react";
import { styles } from "../styles/styles";
import { TOWNS, SLOTS } from "../data/constants";
import { townLabel, pname, money } from "../utils/helpers";
import Row from "./Row";
import PaymentOption from "./PaymentOption";

export default function Checkout({
  t, lang, town, setTown, area, setArea, slot, setSlot,
  payment, setPayment, cartItems, subtotal, deliveryFee, total,
  onPlaceOrder, placingOrder, onCancel, savedAddresses, onSaveAddress,
}) {
  const [couponCode, setCouponCode] = useState("");
  const [couponState, setCouponState] = useState(null); // { discount, discountType, discountValue, couponId } | null
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const discount = couponState?.discount || 0;
  const finalTotal = Math.max(0, total - discount);

  const applyCoupon = async () => {
    setCouponError(""); setCouponState(null);
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), orderTotal: subtotal })
      });
      const data = await res.json();
      if (res.ok) { setCouponState(data); }
      else { setCouponError(data.error || 'Invalid coupon'); }
    } catch (e) { setCouponError('Network error'); }
    setCouponLoading(false);
  };
  const [saveThisAddress, setSaveThisAddress] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const applySavedAddress = (a) => {
    setTown(a.town);
    setArea(a.area);
  };

  useEffect(() => {
    if (savedAddresses && savedAddresses.length > 0 && !area.trim()) {
      setTown(savedAddresses[0].town);
      setArea(savedAddresses[0].area);
    }
  }, [savedAddresses]);

  const handlePlaceOrder = async () => {
    if (saveThisAddress && area.trim()) {
      await onSaveAddress({ label: t.addressDefaultLabel, town, area: area.trim() });
    }
    onPlaceOrder({ discount, couponId: couponState?.couponId || null, finalTotal });
  };

  const getPaymentIcon = (id) => {
    if (id === 'cod') return <Banknote size={18} color="var(--leaf-deep)" />;
    if (id === 'upi') return <Wallet size={18} color="var(--leaf-deep)" />;
    return <CreditCard size={18} color="var(--leaf-deep)" />;
  };

  const getPaymentLabel = (id) => {
    if (id === 'cod') return t.cod;
    if (id === 'upi') return t.upi;
    return t.card;
  };

  const getEta = () => {
    if (slot && slot !== "As soon as possible") {
      return slot;
    }
    const hour = new Date().getHours();
    if (hour < 10) return "Today by 2:00 PM";
    if (hour < 16) return "Today by 8:00 PM";
    return "Tomorrow by 10:00 AM";
  };

  return (
    <div style={styles.checkoutWrap}>
      
      {/* Delivery Address Section */}
      <div style={styles.checkoutSection}>
        <h3 style={styles.checkoutHeader}><MapPin size={18} /> {t.addrTitle}</h3>
        <div style={styles.checkoutAddressBox}>
          {savedAddresses && savedAddresses.length > 0 && (
            <div style={styles.checkoutSavedAddrChips}>
              {savedAddresses.map((a) => (
                <button key={a.id} style={styles.savedAddrChip} onClick={() => applySavedAddress(a)}>
                  <MapPin size={12} /> {a.label}
                </button>
              ))}
            </div>
          )}
          <select aria-label="Select town" style={styles.checkoutInput} value={town} onChange={(e) => setTown(e.target.value)}>
            {TOWNS.map((tw) => <option key={tw.key} value={tw.key}>{townLabel(tw.key, lang)}</option>)}
          </select>
          <textarea aria-label="Delivery area details" style={styles.checkoutTextarea} rows={3} placeholder={t.areaPh} value={area} onChange={(e) => setArea(e.target.value)} />
          {onSaveAddress && (
            <label style={styles.checkboxRow}>
              <input type="checkbox" checked={saveThisAddress} onChange={(e) => setSaveThisAddress(e.target.checked)} aria-label="Save this address" />
              {t.saveThisAddress}
            </label>
          )}
        </div>
      </div>

      {/* Delivery Time / Slots */}
      <div style={styles.checkoutSection}>
        <h3 style={styles.checkoutHeader}><Clock size={18} /> {t.slotTitle}</h3>
        <div style={styles.checkoutSlotRow} role="radiogroup" aria-label="Select delivery slot">
          {SLOTS.map((s) => (
            <button type="button" role="radio" aria-checked={slot === s} key={s} style={{ ...styles.checkoutSlotPill, ...(slot === s ? styles.checkoutSlotPillActive : {}) }} onClick={() => setSlot(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Order Summary & Bill */}
      <div style={styles.checkoutSection}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ ...styles.checkoutHeader, margin: 0 }}>{t.reviewTitle}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--leaf-deep)', fontSize: 12, fontWeight: 600, background: 'var(--sage-bg)', padding: '4px 8px', borderRadius: 12, border: '1px solid var(--sage-line)' }}>
            <Truck size={14} />
            ETA: {getEta()}
          </div>
        </div>
        <div style={styles.checkoutItemsList}>
          {cartItems.map((i) => (
            <div key={i.key} style={styles.checkoutItemRow}>
              <span style={styles.checkoutItemName}>
                <span style={{ fontSize: 18 }} aria-hidden="true">{i.product.emoji}</span>
                {pname(i.product, lang)} × {i.qty}kg{i.mode === "wholesale" ? ` (${t.wholesale})` : ""}
              </span>
              <span style={styles.checkoutItemPrice}>{money(i.price * i.qty)}</span>
            </div>
          ))}
        </div>
        <Row label={t.subtotal} value={money(subtotal)} />
        <Row label={t.delivery} value={deliveryFee === 0 ? t.free : money(deliveryFee)} />
        {discount > 0 && <Row label={`🏷 Coupon (${couponCode.toUpperCase()})`} value={`-${money(discount)}`} />}
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--sage-line)" }}>
          <Row label={t.total} value={money(finalTotal)} bold />
        </div>
        {/* Coupon input */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Tag size={14} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--ink-soft)' }} aria-hidden="true" />
            <input
              aria-label="Promo code"
              style={{ ...styles.checkoutInput, paddingLeft: 32, margin: 0 }}
              placeholder="Promo code"
              value={couponCode}
              onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponState(null); setCouponError(''); }}
            />
          </div>
          <button type="button" aria-label="Apply promo code" style={{ ...styles.secondaryBtnSmall, whiteSpace: 'nowrap' }} onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()}>
            {couponLoading ? '…' : 'Apply'}
          </button>
        </div>
        {couponError && <p style={{ ...styles.errorText, margin: '4px 0 0' }}>{couponError}</p>}
        {couponState && <p style={{ color: 'var(--leaf-deep)', fontSize: 12, margin: '4px 0 0', fontWeight: 600 }}>✅ {money(discount)} discount applied!</p>}
      </div>

      <button style={styles.cancelLink} onClick={onCancel}>{t.cancelShopping}</button>

      {/* Sticky Footer */}
      <div style={styles.checkoutStickyFooter}>
        <div style={styles.checkoutFooterInner}>
          <div style={styles.checkoutPayRow} onClick={() => setShowPaymentModal(true)}>
            <div style={styles.checkoutPayLeft}>
              {getPaymentIcon(payment)} {getPaymentLabel(payment)}
            </div>
            <div style={styles.checkoutPayChange}>CHANGE <ChevronDown size={14} style={{ verticalAlign: "-2px" }} /></div>
          </div>
          <div style={styles.checkoutActionRow}>
            <div style={styles.checkoutTotalCol}>
              <span style={styles.checkoutTotalLabel}>To Pay</span>
              <span style={styles.checkoutTotalAmount}>{money(finalTotal)}</span>
            </div>
            <button 
              style={{ ...styles.checkoutPlaceBtn, ...(!area.trim() || cartItems.length === 0 || placingOrder || subtotal < 150 ? styles.checkoutPlaceBtnDisabled : {}) }}
              disabled={!area.trim() || cartItems.length === 0 || placingOrder || subtotal < 150}
              onClick={handlePlaceOrder}
            >
              {placingOrder ? t.placingOrder : t.placeOrder} <ChevronRight size={18} />
            </button>
          </div>
          {subtotal < 150 && (
            <div style={{ color: "var(--tomato)", fontSize: 12, textAlign: "center", marginTop: -4, fontWeight: 600 }}>
              Minimum order of {money(150)} required for delivery.
            </div>
          )}
        </div>
      </div>

      {/* Payment Selection Drawer */}
      {showPaymentModal && <div style={styles.overlay} onClick={() => setShowPaymentModal(false)} />}
      <div style={{ ...styles.paymentModal, ...(showPaymentModal ? styles.paymentModalOpen : {}) }}>
        <div style={styles.paymentModalHeader}>
          <h3 style={styles.paymentModalTitle}>{t.paymentTitle}</h3>
          <button style={styles.iconBtn} onClick={() => setShowPaymentModal(false)}><ChevronDown size={24} /></button>
        </div>
        <div style={styles.paymentModalGrid}>
          <PaymentOption id="cod" icon={Banknote} label={t.cod} current={payment} setPayment={(p) => { setPayment(p); setShowPaymentModal(false); }} />
          <PaymentOption id="upi" icon={Wallet} label={t.upi} current={payment} setPayment={(p) => { setPayment(p); setShowPaymentModal(false); }} />
          <PaymentOption id="card" icon={CreditCard} label={t.card} current={payment} setPayment={(p) => { setPayment(p); setShowPaymentModal(false); }} />
        </div>
      </div>

    </div>
  );
}
