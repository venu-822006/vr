import { styles } from "../styles/styles";

export default function PaymentOption({ id, icon: Icon, label, current, setPayment }) {
  return (
    <button style={{ ...styles.paymentOption, ...(current === id ? styles.paymentOptionActive : {}) }} onClick={() => setPayment(id)}>
      <Icon size={18} /><span>{label}</span>
    </button>
  );
}
