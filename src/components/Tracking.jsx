import { useState, useEffect, useCallback, useRef } from "react";
import { CheckCircle2, MapPin, XCircle, Download, Package, Truck, Clock } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { styles } from "../styles/styles";
import { STAGE_KEYS, STAGE_ICONS } from "../data/constants";
import { townLabel, pname, money } from "../utils/helpers";
import L from "leaflet";

// ─── Fix default leaflet icons ─────────────────────────────────────────────────
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
L.Marker.prototype.options.icon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25,41], iconAnchor: [12,41] });

// Custom icon factory with pulse effect
const makeIcon = (emoji, size = 36, addPulse = false) => L.divIcon({
  html: `<div style="font-size:${size}px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));${addPulse ? 'animation: pulse 1.5s infinite;' : ''}">${emoji}</div>`,
  iconSize: [size, size], iconAnchor: [size/2, size], className: "",
});

const STORE_ICON = makeIcon("🏪");
const HOME_ICON  = makeIcon("🏠");
const RIDER_ICON = makeIcon("🛵", 36, true); // Added pulse effect

// ─── Map re-centering child component ─────────────────────────────────────────
function MapController({ center, zoom = 14 }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center[0], center[1]]);
  return null;
}

// ─── Static Tirupati-area coords ──────────────────────────────────────────────
const STORE_LOC  = [13.6288, 79.4192];
const HOME_LOC   = [13.6200, 79.4300];

// Interpolate coordinates for animation
const interpolate = (start, end, progress) => {
  return [
    start[0] + (end[0] - start[0]) * progress,
    start[1] + (end[1] - start[1]) * progress
  ];
};

export default function Tracking({ t, lang, orderId, area, town, slot, total, cartItems, onNewOrder, socket }) {
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [riderLoc, setRiderLoc] = useState(STORE_LOC);
  const [eta, setEta] = useState(15); // ETA in mins

  // Initial fetch
  const fetchStatus = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
      } else {
        throw new Error("Backend offline");
      }
    } catch (e) { 
      console.warn("Tracking offline. Starting simulator."); 
      setIsOfflineMode(true);
    }
    finally { setLoading(false); }
  }, [orderId]);

  // Socket.IO real-time updates + fallback polling
  useEffect(() => {
    fetchStatus();
    if (socket && !isOfflineMode) {
      socket.emit("join_order", orderId);
      socket.on("status_change", ({ orderId: oid, status: s }) => {
        if (oid === orderId) setStatus(s);
      });
      return () => socket.off("status_change");
    } else if (!isOfflineMode) {
      const int = setInterval(fetchStatus, 5000);
      return () => clearInterval(int);
    }
  }, [orderId, socket, fetchStatus, isOfflineMode]);

  // Offline Simulator
  useEffect(() => {
    if (!isOfflineMode) return;
    let timer1 = setTimeout(() => setStatus("processing"), 3000);
    let timer2 = setTimeout(() => setStatus("out_for_delivery"), 6000);
    let timer3 = setTimeout(() => setStatus("delivered"), 16000);
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
  }, [isOfflineMode]);

  // Rider Animation
  useEffect(() => {
    if (status === "out_for_delivery") {
      let startTs = null;
      const duration = 10000; // 10 seconds to reach home
      let animFrame;

      const animate = (timestamp) => {
        if (!startTs) startTs = timestamp;
        const progress = Math.min((timestamp - startTs) / duration, 1);
        setRiderLoc(interpolate(STORE_LOC, HOME_LOC, progress));
        setEta(Math.ceil(15 * (1 - progress)));
        
        if (progress < 1) {
          animFrame = requestAnimationFrame(animate);
        }
      };
      animFrame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animFrame);
    } else if (status === "delivered") {
      setRiderLoc(HOME_LOC);
      setEta(0);
    } else {
      setRiderLoc(STORE_LOC);
    }
  }, [status]);

  let stageIndex = 0;
  if (status === "processing")       stageIndex = 1;
  else if (status === "out_for_delivery") stageIndex = 2;
  else if (status === "delivered")   stageIndex = 3;

  const currentCenter = status === "out_for_delivery" ? riderLoc : status === "delivered" ? HOME_LOC : STORE_LOC;
  const showRider  = status === "out_for_delivery" || status === "delivered";

  const handleDownloadInvoice = () => {
    fetch(`/api/orders/${orderId}/invoice`)
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${orderId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => alert("Invoice generation is offline in demo mode."));
  };

  if (loading) return (
    <div style={{ ...styles.trackingWrap, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🥦</div>
        <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>Loading order details…</p>
      </div>
    </div>
  );

  return (
    <div style={{ ...styles.trackingWrap, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      
      {/* Zepto-Style Full Bleed Map */}
      <div style={{
        height: "45vh", width: "100%", position: "relative", zIndex: 0,
        backgroundColor: "#e2e8f0"
      }}>
        {status !== "cancelled" && (
          <MapContainer
            center={currentCenter}
            zoom={status === "out_for_delivery" ? 15 : 14}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
            scrollWheelZoom={false}
          >
            <MapController center={currentCenter} zoom={status === "out_for_delivery" ? 15 : 14} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />

            <Marker position={STORE_LOC} icon={STORE_ICON} />
            <Marker position={HOME_LOC} icon={HOME_ICON} />
            {showRider && <Marker position={riderLoc} icon={RIDER_ICON} />}
            <Polyline positions={[STORE_LOC, HOME_LOC]} pathOptions={{ color: "#16a34a", weight: 4, dashArray: "8 8", opacity: 0.6 }} />
          </MapContainer>
        )}

        {/* Dynamic Map Overlay Badge */}
        <div style={{
          position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)",
          zIndex: 1000, backgroundColor: "rgba(255,255,255,0.95)", padding: "8px 16px",
          borderRadius: 30, fontSize: 14, fontWeight: 700, boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
          color: status === "delivered" ? "#15803d" : status === "out_for_delivery" ? "#7e22ce" : "#b45309",
          display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", backdropFilter: "blur(4px)"
        }}>
          {status === "pending" && <><Clock size={16} /> Preparing order…</>}
          {status === "processing" && <><Package size={16} /> Packing your veggies…</>}
          {status === "out_for_delivery" && <><Truck size={16} /> Arriving in {eta} mins</>}
          {status === "delivered" && <><CheckCircle2 size={16} /> Delivered! Enjoy 🎉</>}
        </div>
      </div>

      {/* Bottom Sheet Details */}
      <div style={{ 
        flex: 1, backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, 
        marginTop: -24, position: "relative", zIndex: 10, padding: 24, boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
        overflowY: "auto"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>{t.orderConfirmed}</h2>
            <p style={{ margin: "4px 0 0", color: "var(--ink-soft)", fontSize: 14 }}>{t.orderNo} #{orderId}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: "var(--primary)" }}>{money(total)}</span>
          </div>
        </div>

        {status === "cancelled" ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <XCircle size={60} color="var(--danger)" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ margin: 0, fontSize: 22 }}>Order Cancelled</h3>
            <p style={{ color: "var(--ink-soft)", marginTop: 8 }}>This order has been cancelled.</p>
          </div>
        ) : (
          <>
            {/* Progress steps */}
            <div style={{ marginBottom: 30, padding: 20, backgroundColor: "var(--bg)", borderRadius: 16 }}>
              {STAGE_KEYS.map((key, idx) => {
                const Icon = STAGE_ICONS[idx];
                const active = idx <= stageIndex;
                const isCurrent = idx === stageIndex;
                const stageDesc = ["Order received at store.", "Items are being packed fresh.", "Rider is heading your way! 🛵", "Successfully delivered. 🥗"][idx];
                return (
                  <div style={styles.trackRow} key={key}>
                    <div style={styles.trackIconCol}>
                      <div style={{
                        ...styles.trackIconBox,
                        ...(active ? styles.trackIconBoxActive : {}),
                        ...(isCurrent ? { boxShadow: "0 0 0 4px rgba(22,163,74,0.2)", transform: "scale(1.1)" } : {}),
                        transition: "all 0.4s ease"
                      }}>
                        <Icon size={20} />
                      </div>
                      {idx < STAGE_KEYS.length - 1 && (
                        <div style={{
                          ...styles.trackLineVertical,
                          ...(idx < stageIndex ? styles.trackLineVerticalActive : {}),
                          transition: "background 0.6s ease"
                        }} />
                      )}
                    </div>
                    <div style={styles.trackContentCol}>
                      <h4 style={{ ...styles.trackStageTitle, ...(active ? styles.trackStageTitleActive : {}) }}>
                        {t[key]}
                      </h4>
                      {isCurrent && <p style={styles.trackStageDesc}>{stageDesc}</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order summary */}
            <h3 style={{ fontSize: 16, marginBottom: 12, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>Order Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {cartItems.map(i => (
                <div key={i.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 15, fontWeight: 500 }}>{i.product.emoji} {pname(i.product, lang)}</span>
                  <span style={{ fontSize: 14, color: "var(--ink-soft)", fontWeight: 600 }}>{i.qty}{i.product.unit === "kg" ? "kg" : ""}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: "0 0 24px", display: "flex", alignItems: "center", gap: 6, backgroundColor: "var(--bg)", padding: 12, borderRadius: 10 }}>
              <MapPin size={16} color="var(--primary)" /> {area}, {townLabel(town, lang)}
            </p>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button style={{ ...styles.secondaryBtnSmall, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flex: 1, padding: 14, fontSize: 15 }}
                onClick={handleDownloadInvoice}>
                <Download size={18} /> Invoice
              </button>
              <button style={{ ...styles.checkoutPlaceBtn, flex: 1, padding: 14, fontSize: 15 }} onClick={onNewOrder}>{t.newOrder}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
