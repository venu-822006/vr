import { X, MapPin, HelpCircle } from "lucide-react";
import { styles } from "../styles/styles";

export default function FAQModal({ open, onClose, t }) {
  if (!open) return null;

  return (
    <>
      <div style={styles.overlay} onClick={onClose} />
      <div style={{ ...styles.paymentModal, ...styles.paymentModalOpen, height: 'auto', maxHeight: '80vh', top: '50%', transform: 'translate(-50%, -50%)' }}>
        <div style={styles.paymentModalHeader}>
          <h3 style={styles.paymentModalTitle}><HelpCircle size={18} /> FAQ & Delivery Area</h3>
          <button style={styles.iconBtn} onClick={onClose}><X size={20} /></button>
        </div>
        <div style={{ padding: 16, overflowY: 'auto' }}>
          
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--leaf-deep)', marginBottom: 8 }}>
              <MapPin size={14} /> Delivery Areas
            </h4>
            <p style={{ fontSize: 13, color: 'var(--ink-main)', lineHeight: 1.5 }}>
              We currently deliver fresh vegetables across Tirupati, covering major areas like MR Palli, KT Road, SVU Campus, and Bairagipatteda. If your area is within Tirupati city limits, we've got you covered!
            </p>
          </div>

          <div style={{ marginBottom: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--leaf-deep)', marginBottom: 4 }}>What is the minimum order amount?</h4>
            <p style={{ fontSize: 13, color: 'var(--ink-main)' }}>The minimum order amount for free home delivery is ₹150.</p>
          </div>

          <div style={{ marginBottom: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--leaf-deep)', marginBottom: 4 }}>When will I receive my order?</h4>
            <p style={{ fontSize: 13, color: 'var(--ink-main)' }}>You can select a preferred delivery slot during checkout. We usually deliver on the same day for early orders, or the next morning.</p>
          </div>

          <div style={{ marginBottom: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--leaf-deep)', marginBottom: 4 }}>What payment methods do you accept?</h4>
            <p style={{ fontSize: 13, color: 'var(--ink-main)' }}>We accept Cash on Delivery (COD), UPI (PhonePe, GPay, Paytm), and major Credit/Debit cards.</p>
          </div>

        </div>
      </div>
    </>
  );
}
