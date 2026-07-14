(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/Tracking.jsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Tracking
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check.js [client] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [client] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.js [client] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.js [client] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/package.js [client] (ecmascript) <export default as Package>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/truck.js [client] (ecmascript) <export default as Truck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$MapContainer$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/MapContainer.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$TileLayer$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/TileLayer.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/Marker.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Polyline$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/Polyline.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$hooks$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/hooks.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$styles$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/styles/styles.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$constants$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/constants.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$helpers$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/helpers.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/leaflet/dist/leaflet-src.js [client] (ecmascript)");
// ─── Fix default leaflet icons ─────────────────────────────────────────────────
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$images$2f$marker$2d$icon$2e$png__$28$static__in__ecmascript$2c$__tag__client$29$__ = __turbopack_context__.i("[project]/node_modules/leaflet/dist/images/marker-icon.png (static in ecmascript, tag client)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$images$2f$marker$2d$shadow$2e$png__$28$static__in__ecmascript$2c$__tag__client$29$__ = __turbopack_context__.i("[project]/node_modules/leaflet/dist/images/marker-shadow.png (static in ecmascript, tag client)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
;
;
;
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].Marker.prototype.options.icon = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].icon({
    iconUrl: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$images$2f$marker$2d$icon$2e$png__$28$static__in__ecmascript$2c$__tag__client$29$__["default"],
    shadowUrl: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$images$2f$marker$2d$shadow$2e$png__$28$static__in__ecmascript$2c$__tag__client$29$__["default"],
    iconSize: [
        25,
        41
    ],
    iconAnchor: [
        12,
        41
    ]
});
// Custom icon factory with pulse effect
const makeIcon = (emoji, size = 36, addPulse = false)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].divIcon({
        html: `<div style="font-size:${size}px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));${addPulse ? 'animation: pulse 1.5s infinite;' : ''}">${emoji}</div>`,
        iconSize: [
            size,
            size
        ],
        iconAnchor: [
            size / 2,
            size
        ],
        className: ""
    });
const STORE_ICON = makeIcon("🏪");
const HOME_ICON = makeIcon("🏠");
const RIDER_ICON = makeIcon("🛵", 36, true); // Added pulse effect
// ─── Map re-centering child component ─────────────────────────────────────────
function MapController({ center, zoom = 14 }) {
    _s();
    const map = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$hooks$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMap"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MapController.useEffect": ()=>{
            map.flyTo(center, zoom, {
                duration: 1.2
            });
        }
    }["MapController.useEffect"], [
        center[0],
        center[1]
    ]);
    return null;
}
_s(MapController, "IoceErwr5KVGS9kN4RQ1bOkYMAg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$hooks$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMap"]
    ];
});
_c = MapController;
// ─── Static Tirupati-area coords ──────────────────────────────────────────────
const STORE_LOC = [
    13.6288,
    79.4192
];
const HOME_LOC = [
    13.6200,
    79.4300
];
// Interpolate coordinates for animation
const interpolate = (start, end, progress)=>{
    return [
        start[0] + (end[0] - start[0]) * progress,
        start[1] + (end[1] - start[1]) * progress
    ];
};
function Tracking({ t, lang, orderId, area, town, slot, total, cartItems, onNewOrder, socket }) {
    _s1();
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])("pending");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isOfflineMode, setIsOfflineMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [riderLoc, setRiderLoc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(STORE_LOC);
    const [eta, setEta] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(15); // ETA in mins
    // Initial fetch
    const fetchStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Tracking.useCallback[fetchStatus]": async ()=>{
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
            } finally{
                setLoading(false);
            }
        }
    }["Tracking.useCallback[fetchStatus]"], [
        orderId
    ]);
    // Socket.IO real-time updates + fallback polling
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Tracking.useEffect": ()=>{
            fetchStatus();
            if (socket && !isOfflineMode) {
                socket.emit("join_order", orderId);
                socket.on("status_change", {
                    "Tracking.useEffect": ({ orderId: oid, status: s })=>{
                        if (oid === orderId) setStatus(s);
                    }
                }["Tracking.useEffect"]);
                return ({
                    "Tracking.useEffect": ()=>socket.off("status_change")
                })["Tracking.useEffect"];
            } else if (!isOfflineMode) {
                const int = setInterval(fetchStatus, 5000);
                return ({
                    "Tracking.useEffect": ()=>clearInterval(int)
                })["Tracking.useEffect"];
            }
        }
    }["Tracking.useEffect"], [
        orderId,
        socket,
        fetchStatus,
        isOfflineMode
    ]);
    // Offline Simulator
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Tracking.useEffect": ()=>{
            if (!isOfflineMode) return;
            let timer1 = setTimeout({
                "Tracking.useEffect.timer1": ()=>setStatus("processing")
            }["Tracking.useEffect.timer1"], 3000);
            let timer2 = setTimeout({
                "Tracking.useEffect.timer2": ()=>setStatus("out_for_delivery")
            }["Tracking.useEffect.timer2"], 6000);
            let timer3 = setTimeout({
                "Tracking.useEffect.timer3": ()=>setStatus("delivered")
            }["Tracking.useEffect.timer3"], 16000);
            return ({
                "Tracking.useEffect": ()=>{
                    clearTimeout(timer1);
                    clearTimeout(timer2);
                    clearTimeout(timer3);
                }
            })["Tracking.useEffect"];
        }
    }["Tracking.useEffect"], [
        isOfflineMode
    ]);
    // Rider Animation
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Tracking.useEffect": ()=>{
            if (status === "out_for_delivery") {
                let startTs = null;
                const duration = 10000; // 10 seconds to reach home
                let animFrame;
                const animate = {
                    "Tracking.useEffect.animate": (timestamp)=>{
                        if (!startTs) startTs = timestamp;
                        const progress = Math.min((timestamp - startTs) / duration, 1);
                        setRiderLoc(interpolate(STORE_LOC, HOME_LOC, progress));
                        setEta(Math.ceil(15 * (1 - progress)));
                        if (progress < 1) {
                            animFrame = requestAnimationFrame(animate);
                        }
                    }
                }["Tracking.useEffect.animate"];
                animFrame = requestAnimationFrame(animate);
                return ({
                    "Tracking.useEffect": ()=>cancelAnimationFrame(animFrame)
                })["Tracking.useEffect"];
            } else if (status === "delivered") {
                setRiderLoc(HOME_LOC);
                setEta(0);
            } else {
                setRiderLoc(STORE_LOC);
            }
        }
    }["Tracking.useEffect"], [
        status
    ]);
    let stageIndex = 0;
    if (status === "processing") stageIndex = 1;
    else if (status === "out_for_delivery") stageIndex = 2;
    else if (status === "delivered") stageIndex = 3;
    const currentCenter = status === "out_for_delivery" ? riderLoc : status === "delivered" ? HOME_LOC : STORE_LOC;
    const showRider = status === "out_for_delivery" || status === "delivered";
    const handleDownloadInvoice = ()=>{
        fetch(`/api/orders/${orderId}/invoice`).then((r)=>r.blob()).then((blob)=>{
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `invoice-${orderId}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        }).catch(()=>alert("Invoice generation is offline in demo mode."));
    };
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$styles$2e$js__$5b$client$5d$__$28$ecmascript$29$__["styles"].trackingWrap,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 300
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                textAlign: "center"
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontSize: 40,
                        marginBottom: 12
                    },
                    children: "🥦"
                }, void 0, false, {
                    fileName: "[project]/src/components/Tracking.jsx",
                    lineNumber: 147,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        color: "var(--ink-soft)",
                        fontSize: 14
                    },
                    children: "Loading order details…"
                }, void 0, false, {
                    fileName: "[project]/src/components/Tracking.jsx",
                    lineNumber: 148,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Tracking.jsx",
            lineNumber: 146,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/Tracking.jsx",
        lineNumber: 145,
        columnNumber: 5
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$styles$2e$js__$5b$client$5d$__$28$ecmascript$29$__["styles"].trackingWrap,
            padding: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    height: "45vh",
                    width: "100%",
                    position: "relative",
                    zIndex: 0,
                    backgroundColor: "#e2e8f0"
                },
                children: [
                    status !== "cancelled" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$MapContainer$2e$js__$5b$client$5d$__$28$ecmascript$29$__["MapContainer"], {
                        center: currentCenter,
                        zoom: status === "out_for_delivery" ? 15 : 14,
                        style: {
                            height: "100%",
                            width: "100%"
                        },
                        zoomControl: false,
                        scrollWheelZoom: false,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MapController, {
                                center: currentCenter,
                                zoom: status === "out_for_delivery" ? 15 : 14
                            }, void 0, false, {
                                fileName: "[project]/src/components/Tracking.jsx",
                                lineNumber: 169,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$TileLayer$2e$js__$5b$client$5d$__$28$ecmascript$29$__["TileLayer"], {
                                url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                                attribution: "© OpenStreetMap"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Tracking.jsx",
                                lineNumber: 170,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Marker"], {
                                position: STORE_LOC,
                                icon: STORE_ICON
                            }, void 0, false, {
                                fileName: "[project]/src/components/Tracking.jsx",
                                lineNumber: 175,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Marker"], {
                                position: HOME_LOC,
                                icon: HOME_ICON
                            }, void 0, false, {
                                fileName: "[project]/src/components/Tracking.jsx",
                                lineNumber: 176,
                                columnNumber: 13
                            }, this),
                            showRider && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Marker"], {
                                position: riderLoc,
                                icon: RIDER_ICON
                            }, void 0, false, {
                                fileName: "[project]/src/components/Tracking.jsx",
                                lineNumber: 177,
                                columnNumber: 27
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Polyline$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Polyline"], {
                                positions: [
                                    STORE_LOC,
                                    HOME_LOC
                                ],
                                pathOptions: {
                                    color: "#16a34a",
                                    weight: 4,
                                    dashArray: "8 8",
                                    opacity: 0.6
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/Tracking.jsx",
                                lineNumber: 178,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Tracking.jsx",
                        lineNumber: 162,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            position: "absolute",
                            top: 20,
                            left: "50%",
                            transform: "translateX(-50%)",
                            zIndex: 1000,
                            backgroundColor: "rgba(255,255,255,0.95)",
                            padding: "8px 16px",
                            borderRadius: 30,
                            fontSize: 14,
                            fontWeight: 700,
                            boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                            color: status === "delivered" ? "#15803d" : status === "out_for_delivery" ? "#7e22ce" : "#b45309",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            whiteSpace: "nowrap",
                            backdropFilter: "blur(4px)"
                        },
                        children: [
                            status === "pending" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                        size: 16
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Tracking.jsx",
                                        lineNumber: 190,
                                        columnNumber: 38
                                    }, this),
                                    " Preparing order…"
                                ]
                            }, void 0, true),
                            status === "processing" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"], {
                                        size: 16
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Tracking.jsx",
                                        lineNumber: 191,
                                        columnNumber: 41
                                    }, this),
                                    " Packing your veggies…"
                                ]
                            }, void 0, true),
                            status === "out_for_delivery" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__["Truck"], {
                                        size: 16
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Tracking.jsx",
                                        lineNumber: 192,
                                        columnNumber: 47
                                    }, this),
                                    " Arriving in ",
                                    eta,
                                    " mins"
                                ]
                            }, void 0, true),
                            status === "delivered" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                                        size: 16
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Tracking.jsx",
                                        lineNumber: 193,
                                        columnNumber: 40
                                    }, this),
                                    " Delivered! Enjoy 🎉"
                                ]
                            }, void 0, true)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Tracking.jsx",
                        lineNumber: 183,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Tracking.jsx",
                lineNumber: 157,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    flex: 1,
                    backgroundColor: "#fff",
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    marginTop: -24,
                    position: "relative",
                    zIndex: 10,
                    padding: 24,
                    boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
                    overflowY: "auto"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 20
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        style: {
                                            margin: 0,
                                            fontSize: 22,
                                            fontWeight: 700,
                                            color: "var(--ink)"
                                        },
                                        children: t.orderConfirmed
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Tracking.jsx",
                                        lineNumber: 205,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            margin: "4px 0 0",
                                            color: "var(--ink-soft)",
                                            fontSize: 14
                                        },
                                        children: [
                                            t.orderNo,
                                            " #",
                                            orderId
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Tracking.jsx",
                                        lineNumber: 206,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Tracking.jsx",
                                lineNumber: 204,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    textAlign: "right"
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontSize: 20,
                                        fontWeight: 700,
                                        color: "var(--primary)"
                                    },
                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$helpers$2e$js__$5b$client$5d$__$28$ecmascript$29$__["money"])(total)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Tracking.jsx",
                                    lineNumber: 209,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/Tracking.jsx",
                                lineNumber: 208,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Tracking.jsx",
                        lineNumber: 203,
                        columnNumber: 9
                    }, this),
                    status === "cancelled" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            textAlign: "center",
                            padding: "40px 0"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                                size: 60,
                                color: "var(--danger)",
                                style: {
                                    margin: "0 auto 16px"
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/Tracking.jsx",
                                lineNumber: 215,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: {
                                    margin: 0,
                                    fontSize: 22
                                },
                                children: "Order Cancelled"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Tracking.jsx",
                                lineNumber: 216,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    color: "var(--ink-soft)",
                                    marginTop: 8
                                },
                                children: "This order has been cancelled."
                            }, void 0, false, {
                                fileName: "[project]/src/components/Tracking.jsx",
                                lineNumber: 217,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Tracking.jsx",
                        lineNumber: 214,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginBottom: 30,
                                    padding: 20,
                                    backgroundColor: "var(--bg)",
                                    borderRadius: 16
                                },
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$constants$2e$js__$5b$client$5d$__$28$ecmascript$29$__["STAGE_KEYS"].map((key, idx)=>{
                                    const Icon = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$constants$2e$js__$5b$client$5d$__$28$ecmascript$29$__["STAGE_ICONS"][idx];
                                    const active = idx <= stageIndex;
                                    const isCurrent = idx === stageIndex;
                                    const stageDesc = [
                                        "Order received at store.",
                                        "Items are being packed fresh.",
                                        "Rider is heading your way! 🛵",
                                        "Successfully delivered. 🥗"
                                    ][idx];
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$styles$2e$js__$5b$client$5d$__$28$ecmascript$29$__["styles"].trackRow,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$styles$2e$js__$5b$client$5d$__$28$ecmascript$29$__["styles"].trackIconCol,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$styles$2e$js__$5b$client$5d$__$28$ecmascript$29$__["styles"].trackIconBox,
                                                            ...active ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$styles$2e$js__$5b$client$5d$__$28$ecmascript$29$__["styles"].trackIconBoxActive : {},
                                                            ...isCurrent ? {
                                                                boxShadow: "0 0 0 4px rgba(22,163,74,0.2)",
                                                                transform: "scale(1.1)"
                                                            } : {},
                                                            transition: "all 0.4s ease"
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                            size: 20
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/Tracking.jsx",
                                                            lineNumber: 237,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Tracking.jsx",
                                                        lineNumber: 231,
                                                        columnNumber: 23
                                                    }, this),
                                                    idx < __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$constants$2e$js__$5b$client$5d$__$28$ecmascript$29$__["STAGE_KEYS"].length - 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$styles$2e$js__$5b$client$5d$__$28$ecmascript$29$__["styles"].trackLineVertical,
                                                            ...idx < stageIndex ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$styles$2e$js__$5b$client$5d$__$28$ecmascript$29$__["styles"].trackLineVerticalActive : {},
                                                            transition: "background 0.6s ease"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Tracking.jsx",
                                                        lineNumber: 240,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/Tracking.jsx",
                                                lineNumber: 230,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$styles$2e$js__$5b$client$5d$__$28$ecmascript$29$__["styles"].trackContentCol,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                        style: {
                                                            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$styles$2e$js__$5b$client$5d$__$28$ecmascript$29$__["styles"].trackStageTitle,
                                                            ...active ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$styles$2e$js__$5b$client$5d$__$28$ecmascript$29$__["styles"].trackStageTitleActive : {}
                                                        },
                                                        children: t[key]
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Tracking.jsx",
                                                        lineNumber: 248,
                                                        columnNumber: 23
                                                    }, this),
                                                    isCurrent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        style: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$styles$2e$js__$5b$client$5d$__$28$ecmascript$29$__["styles"].trackStageDesc,
                                                        children: stageDesc
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Tracking.jsx",
                                                        lineNumber: 251,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/Tracking.jsx",
                                                lineNumber: 247,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, key, true, {
                                        fileName: "[project]/src/components/Tracking.jsx",
                                        lineNumber: 229,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/components/Tracking.jsx",
                                lineNumber: 222,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: {
                                    fontSize: 16,
                                    marginBottom: 12,
                                    borderBottom: "1px solid var(--border)",
                                    paddingBottom: 8
                                },
                                children: "Order Details"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Tracking.jsx",
                                lineNumber: 259,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 10,
                                    marginBottom: 20
                                },
                                children: cartItems.map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: 15,
                                                    fontWeight: 500
                                                },
                                                children: [
                                                    i.product.emoji,
                                                    " ",
                                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$helpers$2e$js__$5b$client$5d$__$28$ecmascript$29$__["pname"])(i.product, lang)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/Tracking.jsx",
                                                lineNumber: 263,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: 14,
                                                    color: "var(--ink-soft)",
                                                    fontWeight: 600
                                                },
                                                children: [
                                                    i.qty,
                                                    i.product.unit === "kg" ? "kg" : ""
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/Tracking.jsx",
                                                lineNumber: 264,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, i.key, true, {
                                        fileName: "[project]/src/components/Tracking.jsx",
                                        lineNumber: 262,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/Tracking.jsx",
                                lineNumber: 260,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: 14,
                                    color: "var(--ink-soft)",
                                    margin: "0 0 24px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    backgroundColor: "var(--bg)",
                                    padding: 12,
                                    borderRadius: 10
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                        size: 16,
                                        color: "var(--primary)"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Tracking.jsx",
                                        lineNumber: 270,
                                        columnNumber: 15
                                    }, this),
                                    " ",
                                    area,
                                    ", ",
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$helpers$2e$js__$5b$client$5d$__$28$ecmascript$29$__["townLabel"])(town, lang)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Tracking.jsx",
                                lineNumber: 269,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    gap: 12,
                                    flexWrap: "wrap"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        style: {
                                            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$styles$2e$js__$5b$client$5d$__$28$ecmascript$29$__["styles"].secondaryBtnSmall,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 6,
                                            flex: 1,
                                            padding: 14,
                                            fontSize: 15
                                        },
                                        onClick: handleDownloadInvoice,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                                size: 18
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Tracking.jsx",
                                                lineNumber: 277,
                                                columnNumber: 17
                                            }, this),
                                            " Invoice"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Tracking.jsx",
                                        lineNumber: 275,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        style: {
                                            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$styles$2e$js__$5b$client$5d$__$28$ecmascript$29$__["styles"].checkoutPlaceBtn,
                                            flex: 1,
                                            padding: 14,
                                            fontSize: 15
                                        },
                                        onClick: onNewOrder,
                                        children: t.newOrder
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Tracking.jsx",
                                        lineNumber: 279,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Tracking.jsx",
                                lineNumber: 274,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Tracking.jsx",
                lineNumber: 198,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Tracking.jsx",
        lineNumber: 154,
        columnNumber: 5
    }, this);
}
_s1(Tracking, "UJe0WB05CUnMSeHKG897bx0tk74=");
_c1 = Tracking;
var _c, _c1;
__turbopack_context__.k.register(_c, "MapController");
__turbopack_context__.k.register(_c1, "Tracking");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/Tracking.jsx [client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/components/Tracking.jsx [client] (ecmascript)"));
}),
]);

//# sourceMappingURL=src_components_Tracking_jsx_00ajxaf._.js.map