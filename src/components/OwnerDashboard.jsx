import { useState, useEffect, useRef, useMemo } from "react";
import {
  LogOut, Store, Package, PlusCircle, Trash2, KeyRound,
  Search, CheckCircle2, Download, TrendingUp, Tag, Upload,
  AlertTriangle, Users, BarChart3, Flame, Settings, Loader2, Save, X, Eye, Edit, ShieldCheck, CheckSquare
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid, BarChart, Bar, Legend,
  Line, ComposedChart, Cell, PieChart, Pie
} from "recharts";
import { styles } from "../styles/styles";
import { CATEGORIES, TOWNS } from "../data/constants";
import { BLANK_PRODUCT_DRAFT } from "../data/products";
import { pname, townLabel, money } from "../utils/helpers";
import { getOwnerToken, changeOwnerPassword, changeOwnerUsername } from "../utils/ownerAuth";
import LangToggle from "./LangToggle";
import ContactBar from "./ContactBar";

const isStrongPassword = (pwd) => pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd);

export default function OwnerDashboard({
  lang, setLang, t, products, getPrice, onLogout, refreshProducts
}) {
  const [tab, setTab] = useState("orders");
  const [ownerToken, setOwnerToken] = useState("");

  useEffect(() => {
    getOwnerToken().then(setOwnerToken);
  }, []);

  // ---- Stats ---------------------------------------------------------------
  const [stats, setStats] = useState({
    today: { orders: 0, revenue: 0, pending: 0 },
    week: { orders: 0, revenue: 0 },
    month: { orders: 0, revenue: 0 },
    topProducts: [],
    outOfStock: [],
  });
  const [dailyData, setDailyData] = useState([]);

  // ---- Analytics Mock Data (Peak Hours, Customers, Inventory Alerts, P&L) --
  const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const HOURS = Array.from({ length: 16 }, (_, i) => {
    const h = i + 7;
    return h <= 12 ? `${h}AM` : `${h - 12}PM`;
  });

  const [analyticsData, setAnalyticsData] = useState({
    weeklyTrends: [],
    popularVegetables: [],
    townHeatmap: []
  });

  const loadAnalytics = async () => {
    if (!ownerToken) return;
    try {
      const res = await fetch('/api/owner/analytics', { headers: { 'Authorization': `Bearer ${ownerToken}` } });
      if (res.ok) setAnalyticsData(await res.json());
    } catch(e) {}
  };

  useEffect(() => {
    if (tab === 'analytics') loadAnalytics();
  }, [tab, ownerToken]);

  const peakHoursData = useMemo(() => {
    // We repurpose this to show town heatmap if analyticsData is available
    if (analyticsData.townHeatmap.length > 0) {
      // Just a mock transform to fit the UI table
      return analyticsData.townHeatmap.map((t, i) => {
        const row = { hour: townLabel(t.name, lang) };
        DAYS_OF_WEEK.forEach((day, di) => {
          row[day] = Math.min(1, (t.value / 10) * Math.random());
        });
        return row;
      });
    }
    const seed = (r, c) => Math.sin(r * 13 + c * 7 + 42) * 0.5 + 0.5;
    return HOURS.map((hour, hi) => {
      const row = { hour };
      DAYS_OF_WEEK.forEach((day, di) => {
        const base = seed(hi, di);
        const lunchBoost = (hi >= 4 && hi <= 6) ? 0.3 : 0;
        const eveningBoost = (hi >= 9 && hi <= 12) ? 0.25 : 0;
        const weekendBoost = (di >= 5) ? 0.15 : 0;
        row[day] = Math.min(1, Math.max(0, base * 0.6 + lunchBoost + eveningBoost + weekendBoost + Math.random() * 0.15));
      });
      return row;
    });
  }, [analyticsData, lang]);

  const heatmapColor = (val) => {
    if (val < 0.25) return '#dcfce7';
    if (val < 0.45) return '#86efac';
    if (val < 0.6) return '#fbbf24';
    if (val < 0.78) return '#f97316';
    return '#ef4444';
  };

  const heatmapIntensityLabel = (val) => {
    if (val < 0.25) return 'Low';
    if (val < 0.45) return 'Moderate';
    if (val < 0.6) return 'Busy';
    if (val < 0.78) return 'High';
    return 'Peak';
  };

  const topCustomers = stats?.topCustomers || [];

  const customerMedals = ['🥇', '🥈', '🥉'];

  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.stockQty <= (p.lowStockThreshold || 10));
  }, [products]);

  const forecastData = useMemo(() => {
    if (dailyData.length < 7) return [];
    const last7 = dailyData.slice(-7);
    const avgRevenue = Math.round(last7.reduce((s, d) => s + d.revenue, 0) / 7);
    const avgOrders = Math.round(last7.reduce((s, d) => s + d.orders, 0) / 7);
    const forecast = [];
    const now = new Date();
    for (let i = 1; i <= 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const variance = 0.85 + Math.random() * 0.3;
      forecast.push({
        date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        forecastRevenue: Math.round(avgRevenue * variance),
        forecastOrders: Math.round(avgOrders * variance),
      });
    }
    return forecast;
  }, [dailyData]);

  const combinedChartData = useMemo(() => {
    const actual = dailyData.map(d => ({ ...d, forecastRevenue: null }));
    if (forecastData.length > 0 && dailyData.length > 0) {
      const bridge = { ...dailyData[dailyData.length - 1], forecastRevenue: dailyData[dailyData.length - 1].revenue };
      actual[actual.length - 1] = bridge;
    }
    const projected = forecastData.map(d => ({ date: d.date, revenue: null, orders: null, forecastRevenue: d.forecastRevenue }));
    return [...actual, ...projected];
  }, [dailyData, forecastData]);

  const plData = useMemo(() => {
    const monthRevenue = stats.month?.revenue ?? 98000;
    const cost = Math.round(monthRevenue * 0.6);
    const grossProfit = monthRevenue - cost;
    const expenses = 2000;
    const netProfit = grossProfit - expenses;
    return { monthRevenue, cost, grossProfit, expenses, netProfit };
  }, [stats]);

  const plBarData = useMemo(() => [
    { label: 'Revenue', value: plData.monthRevenue, fill: '#16a34a' },
    { label: 'Cost of Goods', value: plData.cost, fill: '#f97316' },
    { label: 'Gross Profit', value: plData.grossProfit, fill: '#22c55e' },
    { label: 'Expenses', value: plData.expenses, fill: '#ef4444' },
    { label: 'Net Profit', value: plData.netProfit, fill: plData.netProfit >= 0 ? '#16a34a' : '#ef4444' },
  ], [plData]);

  // Pulse keyframes injected once
  useEffect(() => {
    if (!document.getElementById('analytics-pulse-keyframes')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'analytics-pulse-keyframes';
      styleEl.textContent = `
        @keyframes analyticsPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.03); }
        }
      `;
      document.head.appendChild(styleEl);
    }
  }, []);

  const loadStats = async () => {
    if (!ownerToken) return;
    try {
      const res = await fetch('/api/stats', { headers: { 'Authorization': `Bearer ${ownerToken}` } });
      if (res.ok) {
        setStats(await res.json());
        return;
      }
    } catch (e) {
      // Fallback demo data
      setStats({
        today: { orders: 12, revenue: 3450, pending: 3 },
        week: { orders: 84, revenue: 24100 },
        month: { orders: 340, revenue: 98000 },
        topProducts: [
          { name: "Tomato", totalQty: 145, revenue: 5800 },
          { name: "Onion", totalQty: 120, revenue: 4200 },
          { name: "Carrot", totalQty: 85, revenue: 4250 }
        ],
        outOfStock: [{ id: 99, name: "Coriander", emoji: "🌿" }]
      });
    }
  };

  const loadDailyStats = async () => {
    if (!ownerToken) return;
    try {
      const res = await fetch('/api/stats/daily', { headers: { 'Authorization': `Bearer ${ownerToken}` } });
      if (res.ok) {
        const rows = await res.json();
        setDailyData(rows.map(r => ({
          date: new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
          revenue: r.revenue,
          orders: r.orders,
        })));
        return;
      }
    } catch (e) {
      // Fallback demo data
      const mock = [];
      const now = new Date();
      for(let i=14; i>=0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        mock.push({
          date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
          revenue: Math.floor(Math.random() * 5000) + 1500,
          orders: Math.floor(Math.random() * 20) + 5
        });
      }
      setDailyData(mock);
    }
  };

  useEffect(() => {
    loadStats();
    const int = setInterval(loadStats, 30000);
    return () => clearInterval(int);
  }, [ownerToken]);

  useEffect(() => {
    if (tab === 'analytics') loadDailyStats();
  }, [tab, ownerToken]);


  // ---- Orders --------------------------------------------------------------
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("all");
  const [groupBy, setGroupBy] = useState("none");

  const loadOrders = async () => {
    if (!ownerToken) return;
    setLoadingOrders(true);
    try {
      const query = new URLSearchParams({ status: orderStatus });
      if (orderSearch) query.append("search", orderSearch);
      const res = await fetch(`/api/orders?${query}`, { headers: { 'Authorization': `Bearer ${ownerToken}` } });
      if (res.ok) setOrders(await res.json());
    } catch (e) { console.error(e); }
    setLoadingOrders(false);
  };

  const groupedOrders = useMemo(() => {
    let result = [...orders];
    if (groupBy === 'town') {
      result.sort((a, b) => a.town.localeCompare(b.town));
    }
    return result;
  }, [orders, groupBy]);

  useEffect(() => {
    loadOrders();
    const int = setInterval(loadOrders, 10000);
    return () => clearInterval(int);
  }, [orderSearch, orderStatus, ownerToken]);

  const updateOrderStatus = async (id, status) => {
    try {
      await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownerToken}` },
        body: JSON.stringify({ status })
      });
      loadOrders();
      loadStats();
    } catch (e) { console.error(e); }
  };

  const [phoneToLog, setPhoneToLog] = useState('');
  
  const handleDuplicateOrder = async () => {
    if (phoneToLog.length !== 10) return;
    try {
      const res = await fetch(`/api/owner/orders/last/${phoneToLog}`, { headers: { 'Authorization': `Bearer ${ownerToken}` }});
      if (!res.ok) {
        alert('No past order found for this number.');
        return;
      }
      const lastOrder = await res.json();
      if (!confirm(`Duplicate order for ${lastOrder.customerName}? (Total: ${money(lastOrder.total)})`)) return;
      
      const postRes = await fetch('/api/owner/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownerToken}` },
        body: JSON.stringify({
          phone: phoneToLog,
          customerName: lastOrder.customerName,
          items: lastOrder.items,
          total: lastOrder.total,
          deliveryFee: lastOrder.deliveryFee || 0,
          town: lastOrder.town,
          area: lastOrder.area,
          payment: 'cod', // assume COD for phone orders
          instructions: lastOrder.instructions || ''
        })
      });
      if (postRes.ok) {
        setPhoneToLog('');
        loadOrders();
        loadStats();
        alert('Order duplicated successfully!');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to duplicate order.');
    }
  };

  const exportCSV = () => {
    fetch('/api/orders/export', { headers: { 'Authorization': `Bearer ${ownerToken}` } })
      .then(async (r) => {
        if (!r.ok) throw new Error('Backend offline');
        return r.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => {
        // Fallback offline CSV generator
        const header = "Order ID,Status,Customer,Phone,Area,Total\n";
        const rows = orders.map(o => `${o.id},${o.status},"${o.customer_name}",${o.phone},"${o.area}",${o.total}`);
        const csv = header + rows.join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `orders-offline-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      });
  };

  const statusBadge = (status) => {
    const map = {
      pending: { bg: '#fef3c7', color: '#b45309' },
      processing: { bg: '#e0f2fe', color: '#0369a1' },
      out_for_delivery: { bg: '#f3e8ff', color: '#7e22ce' },
      delivered: { bg: '#dcfce7', color: '#15803d' },
      cancelled: { bg: '#fee2e2', color: '#b91c1c' },
    };
    return map[status] || {};
  };

  const itemsSummary = (items) =>
    items.map(i => `${lang === "te" ? i.te : i.name} ×${i.qty}${i.mode === "wholesale" ? ` (${t.wholesale})` : ""}`).join(", ");

  // ---- Inventory / Prices --------------------------------------------------
  const [draft, setDraft] = useState({});
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    const init = {};
    products.forEach(p => {
      init[p.id] = { price: p.price, wholesalePrice: p.wholesalePrice || "", inStock: p.inStock, image: p.image || "", stockQty: p.stockQty || 100, lowStockThreshold: p.lowStockThreshold || 10 };
    });
    setDraft(init);
  }, [products]);

  const updateField = (id, field, value) =>
    setDraft(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const handleSavePrices = async () => {
    try {
      for (const p of products) {
        const d = draft[p.id];
        if (!d) continue;
        await fetch(`/api/products/${p.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownerToken}` },
          body: JSON.stringify({
            price: Number(d.price),
            wholesalePrice: d.wholesalePrice ? Number(d.wholesalePrice) : null,
            inStock: d.inStock,
            image: d.image,
            stockQty: Number(d.stockQty),
            lowStockThreshold: Number(d.lowStockThreshold)
          })
        });
      }
      setSavedMsg(true);
      if (refreshProducts) refreshProducts();
      setTimeout(() => setSavedMsg(false), 2500);
    } catch (e) { console.error(e); }
  };

  // ---- Add Vegetable -------------------------------------------------------
  const [newVeg, setNewVeg] = useState(BLANK_PRODUCT_DRAFT);
  const [addError, setAddError] = useState("");
  const [addedMsg, setAddedMsg] = useState(false);
  const updateNewVeg = (field, value) => setNewVeg(prev => ({ ...prev, [field]: value }));

  const submitNewVeg = async () => {
    if (!newVeg.name.trim() || newVeg.price === "" || Number(newVeg.price) <= 0) {
      setAddError(t.fieldRequired); return;
    }
    setAddError("");
    try {
      await fetch(`/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownerToken}` },
        body: JSON.stringify({
          name: newVeg.name.trim(), te: newVeg.te.trim() || newVeg.name.trim(),
          emoji: newVeg.emoji || "🥬", cat: newVeg.cat,
          price: Number(newVeg.price),
          wholesalePrice: newVeg.bulkAvailable && newVeg.wholesalePrice !== "" ? Number(newVeg.wholesalePrice) : null,
          unit: newVeg.unit, bulkAvailable: !!newVeg.bulkAvailable, inStock: true, image: newVeg.image || null,
          stockQty: Number(newVeg.stockQty || 100), lowStockThreshold: Number(newVeg.lowStockThreshold || 10)
        })
      });
      setNewVeg(BLANK_PRODUCT_DRAFT);
      setAddedMsg(true);
      if (refreshProducts) refreshProducts();
      setTimeout(() => setAddedMsg(false), 2500);
    } catch (e) { setAddError("Failed to add product"); }
  };

  const deleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${ownerToken}` } });
      if (refreshProducts) refreshProducts();
    } catch (e) { console.error(e); }
  };

  // ---- Coupons -------------------------------------------------------------
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({ code: '', discountType: 'percent', discountValue: '', minOrder: '' });
  const [couponMsg, setCouponMsg] = useState('');

  const loadCoupons = async () => {
    if (!ownerToken) return;
    try {
      const res = await fetch('/api/coupons', { headers: { 'Authorization': `Bearer ${ownerToken}` } });
      if (res.ok) setCoupons(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => { if (tab === 'coupons') loadCoupons(); }, [tab, ownerToken]);

  const addCoupon = async () => {
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownerToken}` },
        body: JSON.stringify({
          code: newCoupon.code, discountType: newCoupon.discountType,
          discountValue: Number(newCoupon.discountValue), minOrder: Number(newCoupon.minOrder) || 0
        })
      });
      const data = await res.json();
      if (res.ok) {
        setNewCoupon({ code: '', discountType: 'percent', discountValue: '', minOrder: '' });
        setCouponMsg('Coupon created!');
        loadCoupons();
        setTimeout(() => setCouponMsg(''), 2500);
      } else { setCouponMsg(data.error || 'Failed'); }
    } catch (e) { setCouponMsg('Error'); }
  };

  const deleteCoupon = async (id) => {
    await fetch(`/api/coupons/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${ownerToken}` } });
    loadCoupons();
  };

  // ---- Password Change -----------------------------------------------------
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSavedMsg, setPwSavedMsg] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const submitPasswordChange = async () => {
    setPwError("");
    if (newPassword !== confirmPassword) { setPwError(t.passwordMismatch); return; }
    if (!isStrongPassword(newPassword)) { setPwError(t.passwordTooShort); return; }
    setPwSaving(true);
    const result = await changeOwnerPassword(currentPassword, newPassword, ownerToken);
    setPwSaving(false);
    if (!result.success) {
      setPwError(result.error || t.incorrectCurrentPassword);
      return;
    }
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    setPwSavedMsg(true);
    setTimeout(() => setPwSavedMsg(false), 2500);
  };

  const [newUn, setNewUn] = useState("");
  const [unPwd, setUnPwd] = useState("");
  const [unError, setUnError] = useState("");
  const [unSavedMsg, setUnSavedMsg] = useState(false);
  const [unSaving, setUnSaving] = useState(false);

  const submitUsernameChange = async () => {
    setUnError("");
    if (!newUn.trim()) return;
    setUnSaving(true);
    const result = await changeOwnerUsername(newUn, unPwd, ownerToken);
    setUnSaving(false);
    if (!result.success) {
      setUnError(result.error);
      return;
    }
    setNewUn(""); setUnPwd("");
    setUnSavedMsg(true);
    setTimeout(() => setUnSavedMsg(false), 2500);
  };

  // ---- Stat card helper ----------------------------------------------------
  const StatCard = ({ label, value, sub, bg = '#f8fafc', border = '#e2e8f0', color = '#0f172a' }) => (
    <div style={{ flex: 1, minWidth: 140, padding: '14px 16px', backgroundColor: bg, borderRadius: 10, border: `1px solid ${border}` }}>
      <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontWeight: 500 }}>{label}</p>
      <h3 style={{ margin: '4px 0 0', fontSize: 22, color, fontWeight: 700 }}>{value}</h3>
      {sub && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>{sub}</p>}
    </div>
  );

  const [auditLogs, setAuditLogs] = useState([]);
  
  const loadAuditLogs = async () => {
    if (!ownerToken) return;
    try {
      const res = await fetch('/api/owner/audit_logs', { headers: { 'Authorization': `Bearer ${ownerToken}` } });
      if (res.ok) setAuditLogs(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => { if (tab === 'auditLogs') loadAuditLogs(); }, [tab, ownerToken]);

  const TABS = [
    { key: 'orders', label: t.ordersTab },
    { key: 'analytics', label: '📊 Analytics' },
    { key: 'prices', label: t.pricesTab },
    { key: 'add', label: t.addTab },
    { key: 'coupons', label: '🏷 Coupons' },
    { key: 'auditLogs', label: '📋 Logs' },
    { key: 'marketing', label: '📱 Marketing' },
    { key: 'account', label: t.changePasswordTab },
  ];

  return (
    <div className="owner-wrap-responsive" style={styles.ownerWrap}>
      <div style={styles.ownerHeader}>
        <div style={styles.logo}>
          <span style={styles.logoMark}>VR</span>
          <span style={styles.logoWordSmall}>Venkataramana Vegetables</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <LangToggle lang={lang} setLang={setLang} />
          <button style={styles.secondaryBtnSmall} onClick={onLogout}><LogOut size={14} /> {t.logout}</button>
        </div>
      </div>

      <div style={styles.ownerCard}>
        <div className="owner-tabs-responsive" style={styles.ownerTabs}>
          {TABS.map(tb => (
            <button key={tb.key}
              style={{ ...styles.ownerTabBtn, ...(tab === tb.key ? styles.ownerTabBtnActive : {}) }}
              onClick={() => setTab(tb.key)}
            >{tb.label}</button>
          ))}
        </div>

        {/* ---- ALERTS CENTER ---- */}
        {stats?.outOfStock?.length > 0 && (
          <div style={{ 
            margin: '20px 0 10px', padding: 16, backgroundColor: '#fef2f2', 
            border: '1px solid #fecaca', borderRadius: 12, display: 'flex', 
            flexDirection: 'column', gap: 8 
          }}>
            <h4 style={{ margin: 0, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15 }}>
              <span style={{ 
                width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444', 
                boxShadow: '0 0 8px #ef4444', animation: 'pulse 1.5s infinite' 
              }} />
              Critical Alerts ({stats.outOfStock.length} items out of stock)
            </h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {stats.outOfStock.map(p => (
                <span key={p.id} style={{ 
                  backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 10px', 
                  borderRadius: 20, fontSize: 13, fontWeight: 500 
                }}>
                  {p.emoji} {p.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ---- ORDERS TAB ---- */}
        {tab === "orders" && (
          <>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              <StatCard label="Today's Orders" value={stats.today?.orders ?? 0} bg="#f8fafc" border="#e2e8f0" />
              <StatCard label="Today's Revenue" value={money(stats.today?.revenue ?? 0)} bg="#f0fdf4" border="#bbf7d0" color="#15803d" />
              <StatCard label="Pending / Active" value={stats.today?.pending ?? 0} bg="#fffbeb" border="#fef3c7" color="#d97706" />
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                <Search size={16} style={{ position: "absolute", left: 10, top: 12, color: "#94a3b8" }} />
                <input type="text" style={{ ...styles.textInput, paddingLeft: 36, margin: 0 }}
                  placeholder="Search by ID, Phone, or Name..."
                  value={orderSearch} onChange={e => setOrderSearch(e.target.value)} />
              </div>
              <select style={{ ...styles.selectInput, width: "auto", margin: 0 }}
                value={orderStatus} onChange={e => setOrderStatus(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select style={{ ...styles.selectInput, width: "auto", margin: 0 }}
                value={groupBy} onChange={e => setGroupBy(e.target.value)}>
                <option value="none">Sort: Newest First</option>
                <option value="town">Group by Route/Town</option>
              </select>
              <button style={styles.secondaryBtnSmall} onClick={loadOrders}>{t.refresh}</button>
              <button style={{ ...styles.secondaryBtnSmall, display: 'flex', alignItems: 'center', gap: 4 }} onClick={exportCSV}>
                <Download size={13} /> Export CSV
              </button>
              <button style={{ ...styles.secondaryBtnSmall, display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => window.print()}>
                🖨️ Print
              </button>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <input type="text" maxLength={10} style={{ ...styles.textInput, width: 140, margin: 0 }} placeholder="Phone..." value={phoneToLog} onChange={e => setPhoneToLog(e.target.value.replace(/\D/g, ''))} />
                <button style={{ ...styles.primaryBtn, padding: '6px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }} onClick={handleDuplicateOrder}>
                  <PlusCircle size={14} /> Duplicate Last
                </button>
              </div>
            </div>

            {loadingOrders ? (
              <p style={{ color: "var(--ink-soft)", fontSize: 13.5 }}>Loading orders...</p>
            ) : groupedOrders.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--ink-soft)" }}>
                <Package size={32} style={{ opacity: 0.5, marginBottom: 8 }} />
                <p>{t.noOrders}</p>
              </div>
            ) : (
              <div style={styles.ownerTableWrap}>
                <table style={styles.ownerTable}>
                  <thead>
                    <tr>
                      <th style={styles.ownerTh}>{t.colOrderId}</th>
                      <th style={styles.ownerTh}>{t.colCustomer}</th>
                      <th style={styles.ownerTh}>{t.colLocation}</th>
                      <th style={styles.ownerTh}>{t.colItems}</th>
                      <th style={styles.ownerTh}>{t.colTotal}</th>
                      <th style={styles.ownerTh}>Status</th>
                      <th style={styles.ownerTh}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedOrders.map(o => (
                      <tr key={o.id}>
                        <td style={styles.ownerTdName}>
                          {o.id}
                          <div style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 'normal' }}>
                            {new Date(o.placedAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                          </div>
                          {o.substitutionPref && o.substitutionPref !== 'substitute' && (
                            <div style={{ fontSize: 10, color: o.substitutionPref === 'skip' ? '#b45309' : '#1d4ed8', marginTop: 4, fontWeight: 600 }}>
                              {o.substitutionPref === 'skip' ? '⏭️ SKIP OUT-OF-STOCK' : '📞 CALL IF OUT-OF-STOCK'}
                            </div>
                          )}
                          {o.duplicateWarning && <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 700, marginTop: 2, backgroundColor: '#fee2e2', padding: '2px 6px', borderRadius: 4, display: 'inline-block' }}>⚠️ Possible Duplicate</div>}
                        </td>
                        <td style={styles.ownerTd}>
                          {o.customerName}
                          <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{o.phone}</div>
                          <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                            <button 
                              style={{ background: 'none', border: 'none', fontSize: 11, color: '#16a34a', cursor: 'pointer', padding: 0 }}
                              onClick={async () => {
                                const note = prompt("Customer notes (e.g. prefers small items, regular):", o.customerNotes || "");
                                if (note === null) return;
                                try {
                                  await fetch(`/api/owner/customers/${o.phone}/notes`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownerToken}` },
                                    body: JSON.stringify({ notes: note })
                                  });
                                  loadOrders();
                                } catch (e) {}
                              }}
                            >
                              {o.customerNotes ? '📝 Edit Note' : '➕ Add Note'}
                            </button>
                            {o.customerNotes && <span style={{ fontSize: 11, color: '#b45309', fontStyle: 'italic', maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={o.customerNotes}>{o.customerNotes}</span>}
                          </div>
                        </td>
                        <td style={styles.ownerTd}>{o.area}, {townLabel(o.town, lang)}</td>
                        <td style={{ ...styles.ownerTd, minWidth: 200, fontSize: 12 }}>{itemsSummary(o.items)}</td>
                        <td style={styles.ownerTd}>{money(o.total)} <br /><span style={{ fontSize: 11, color: "#64748b" }}>{o.payment?.toUpperCase()}</span></td>
                        <td style={styles.ownerTd}>
                          <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', textTransform: 'capitalize', backgroundColor: statusBadge(o.status).bg, color: statusBadge(o.status).color }}>
                            {o.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={styles.ownerTd}>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {o.status === 'pending' && <button style={{ ...styles.primaryBtn, padding: '4px 8px', fontSize: 11 }} onClick={() => updateOrderStatus(o.id, 'processing')}>Accept & Pack</button>}
                            {o.status === 'processing' && <button style={{ ...styles.primaryBtn, padding: '4px 8px', fontSize: 11 }} onClick={() => updateOrderStatus(o.id, 'out_for_delivery')}>Dispatch</button>}
                            {o.status === 'out_for_delivery' && <button style={{ ...styles.primaryBtn, padding: '4px 8px', fontSize: 11, backgroundColor: '#16a34a' }} onClick={() => updateOrderStatus(o.id, 'delivered')}><CheckCircle2 size={12} style={{ verticalAlign: '-2px' }} /> Delivered</button>}
                            {(o.status === 'pending' || o.status === 'processing') && (
                              <button style={{ ...styles.dangerBtnSmall, padding: '4px 8px', fontSize: 11 }} onClick={() => { if (confirm('Cancel order?')) updateOrderStatus(o.id, 'cancelled'); }}>Cancel</button>
                            )}
                            <button 
                              style={{ ...styles.secondaryBtnSmall, padding: '4px 8px', fontSize: 11, color: o.issue_reported ? '#dc2626' : '#64748b' }} 
                              onClick={async () => {
                                const note = prompt("Report an issue / Complaint Note:", o.issue_note || "");
                                if (note === null) return;
                                try {
                                  await fetch(`/api/owner/orders/${o.id}/issue`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownerToken}` },
                                    body: JSON.stringify({ issue_reported: !!note, issue_note: note })
                                  });
                                  loadOrders();
                                } catch (e) {}
                              }}
                            >
                              {o.issue_reported ? 'Issue Logged' : 'Report Issue'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ---- ANALYTICS TAB ---- */}
        {tab === "analytics" && (
          <>
            <h2 style={styles.sectionTitle}><TrendingUp size={18} /> Analytics</h2>

            <h3 style={{ fontSize: 14, color: '#64748b', margin: '0 0 10px', fontWeight: 600 }}>This Week</h3>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              <StatCard label="Orders" value={stats.week?.orders ?? 0} />
              <StatCard label="Revenue" value={money(stats.week?.revenue ?? 0)} bg="#f0fdf4" border="#bbf7d0" color="#15803d" />
            </div>

            <h3 style={{ fontSize: 14, color: '#64748b', margin: '0 0 10px', fontWeight: 600 }}>This Month</h3>
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              <StatCard label="Orders" value={stats.month?.orders ?? 0} />
              <StatCard label="Revenue" value={money(stats.month?.revenue ?? 0)} bg="#f0fdf4" border="#bbf7d0" color="#15803d" />
            </div>

            {/* Revenue Chart with Forecast */}
            {combinedChartData.length > 0 && (
              <>
                <h3 style={{ fontSize: 14, color: '#64748b', margin: '0 0 12px', fontWeight: 600 }}>📈 Revenue — Last 15 Days + 7-Day Forecast</h3>
                <div style={{ width: '100%', height: 240, marginBottom: 28 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={combinedChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `₹${v}`} width={55} />
                      <Tooltip
                        formatter={(v, name) => {
                          if (v === null) return ['-', name];
                          const label = name === 'forecastRevenue' ? 'Forecast' : 'Revenue';
                          return [`₹${v}`, label];
                        }}
                        contentStyle={{ borderRadius: 8, fontSize: 12 }}
                      />
                      <Legend
                        formatter={(value) => value === 'revenue' ? 'Actual Revenue' : 'Forecast (7-day MA)'}
                        wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} fill="url(#revenueGrad)" connectNulls={false} />
                      <Area type="monotone" dataKey="forecastRevenue" stroke="#f97316" strokeWidth={2} strokeDasharray="6 3" fill="url(#forecastGrad)" connectNulls={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <h3 style={{ fontSize: 14, color: '#64748b', margin: '0 0 12px', fontWeight: 600 }}>📦 Daily Orders — Last 15 Days</h3>
                <div style={{ width: '100%', height: 180, marginBottom: 28 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} width={30} allowDecimals={false} />
                      <Tooltip formatter={(v) => [v, 'Orders']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="orders" fill="#86efac" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            <h3 style={{ fontSize: 14, color: '#64748b', margin: '0 0 10px', fontWeight: 600 }}>🏆 Top Products This Month</h3>
            {(stats.topProducts || []).length === 0 ? (
              <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No orders yet — data will appear here.</p>
            ) : (
              <div style={styles.ownerTableWrap}>
                <table style={styles.ownerTable}>
                  <thead><tr>
                    <th style={styles.ownerTh}>Product</th>
                    <th style={styles.ownerTh}>Qty Sold</th>
                    <th style={styles.ownerTh}>Revenue</th>
                  </tr></thead>
                  <tbody>
                    {stats.topProducts.map((p, i) => (
                      <tr key={i}>
                        <td style={styles.ownerTdName}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  '} {p.name}</td>
                        <td style={styles.ownerTd}>{p.totalQty}</td>
                        <td style={styles.ownerTd}>{money(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {(stats.outOfStock || []).length > 0 && (
              <>
                <h3 style={{ fontSize: 14, color: '#dc2626', margin: '24px 0 10px', fontWeight: 600 }}>⚠️ Out of Stock</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {stats.outOfStock.map(p => (
                    <span key={p.id} style={{ padding: '6px 12px', backgroundColor: '#fee2e2', borderRadius: 8, fontSize: 13, color: '#b91c1c' }}>
                      {p.emoji} {p.name}
                    </span>
                  ))}
                </div>
              </>
            )}

            {/* ---- INVENTORY AUTO-ALERT WIDGET ---- */}
            <div style={{ margin: '32px 0 0' }}>
              <h3 style={{ fontSize: 15, color: '#dc2626', margin: '0 0 14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} style={{ color: '#ef4444' }} />
                Inventory Auto-Alerts
                <span style={{
                  fontSize: 11, backgroundColor: '#fef2f2', color: '#b91c1c', padding: '2px 8px',
                  borderRadius: 12, fontWeight: 600, marginLeft: 4
                }}>{lowStockProducts.length} items</span>
              </h3>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                {lowStockProducts.map((p, i) => (
                  <div key={i} style={{
                    flex: '1 1 200px', maxWidth: 280, padding: '18px 20px',
                    background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                    border: '1.5px solid #fca5a5', borderRadius: 14,
                    animation: 'analyticsPulse 2.5s ease-in-out infinite',
                    animationDelay: `${i * 0.4}s`,
                    boxShadow: '0 4px 16px rgba(239,68,68,0.12)',
                    position: 'relative', overflow: 'hidden'
                  }}>
                    <div style={{ position: 'absolute', top: -8, right: -8, fontSize: 48, opacity: 0.08 }}>{p.emoji}</div>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{p.emoji}</div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#991b1b' }}>{p.name}</p>
                    <p style={{
                      margin: '6px 0 0', fontSize: 12, fontWeight: 600, color: '#ef4444',
                      display: 'flex', alignItems: 'center', gap: 4
                    }}>
                      <Flame size={13} /> Restock needed!
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ---- REAL DATA CHARTS ---- */}
            {analyticsData && (
              <div style={{ margin: '36px 0 0', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: '1 1 300px', minWidth: 300, background: '#fff', padding: 20, borderRadius: 12, border: '1px solid var(--sage-line)' }}>
                  <h3 style={{ fontSize: 15, color: '#64748b', margin: '0 0 14px', fontWeight: 700 }}>
                    📈 Weekly Revenue
                  </h3>
                  <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                      <BarChart data={analyticsData.weeklyTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="revenue" fill="var(--leaf-mid)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={{ flex: '1 1 300px', minWidth: 300, background: '#fff', padding: 20, borderRadius: 12, border: '1px solid var(--sage-line)' }}>
                  <h3 style={{ fontSize: 15, color: '#64748b', margin: '0 0 14px', fontWeight: 700 }}>
                    🥬 Popular Vegetables
                  </h3>
                  <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={analyticsData.popularVegetables || []}
                          dataKey="total_qty"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={50}
                          paddingAngle={2}
                        >
                          {(analyticsData.popularVegetables || []).map((entry, index) => {
                            const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#f97316', '#6366f1', '#ec4899', '#84cc16'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* ---- CUSTOMER SEGMENTATION ---- */}
            <div style={{ margin: '36px 0 0' }}>
              <h3 style={{ fontSize: 15, color: '#64748b', margin: '0 0 14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={18} style={{ color: '#6366f1' }} />
                Top 5 Customers
              </h3>
              <div style={styles.ownerTableWrap}>
                <table style={styles.ownerTable}>
                  <thead><tr>
                    <th style={styles.ownerTh}>#</th>
                    <th style={styles.ownerTh}>Customer</th>
                    <th style={styles.ownerTh}>Phone</th>
                    <th style={styles.ownerTh}>Orders</th>
                    <th style={styles.ownerTh}>Total Spent</th>
                    <th style={styles.ownerTh}>Last Order</th>
                  </tr></thead>
                  <tbody>
                    {topCustomers.map((c, i) => (
                      <tr key={i} style={i < 3 ? { backgroundColor: i === 0 ? '#fffbeb' : i === 1 ? '#f8fafc' : '#fdf4e7' } : {}}>
                        <td style={{ ...styles.ownerTd, fontSize: 18, textAlign: 'center' }}>
                          {i < 3 ? customerMedals[i] : <span style={{ fontSize: 13, color: '#94a3b8' }}>{i + 1}</span>}
                        </td>
                        <td style={{ ...styles.ownerTdName, fontWeight: i < 3 ? 700 : 500 }}>{c.name}</td>
                        <td style={styles.ownerTd}>{c.phone}</td>
                        <td style={styles.ownerTd}>
                          <span style={{
                            backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px',
                            borderRadius: 12, fontSize: 12, fontWeight: 600
                          }}>{c.orders}</span>
                        </td>
                        <td style={{ ...styles.ownerTd, fontWeight: 600, color: '#15803d' }}>{money(c.spent)}</td>
                        <td style={{ ...styles.ownerTd, fontSize: 12, color: '#64748b' }}>
                          {new Date(c.lastOrder).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ---- P&L SUMMARY ---- */}
            <div style={{ margin: '36px 0 0' }}>
              <h3 style={{ fontSize: 15, color: '#64748b', margin: '0 0 14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={18} style={{ color: '#16a34a' }} />
                Profit & Loss — This Month
              </h3>
              <div style={{
                padding: 20, backgroundColor: '#f8fafc', borderRadius: 14,
                border: '1px solid #e2e8f0'
              }}>
                {plBarData.map((item, i) => {
                  const maxVal = plData.monthRevenue;
                  const barWidth = Math.max(3, Math.abs(item.value) / maxVal * 100);
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < plBarData.length - 1 ? 14 : 0 }}>
                      <span style={{ width: 120, fontSize: 13, fontWeight: 500, color: '#374151', textAlign: 'right', flexShrink: 0 }}>
                        {item.label}
                      </span>
                      <div style={{ flex: 1, position: 'relative', height: 26 }}>
                        <div style={{
                          height: '100%', width: `${barWidth}%`, borderRadius: 6,
                          background: item.label === 'Net Profit'
                            ? (item.value >= 0
                              ? 'linear-gradient(90deg, #16a34a, #22c55e)'
                              : 'linear-gradient(90deg, #dc2626, #ef4444)')
                            : item.label === 'Revenue'
                              ? 'linear-gradient(90deg, #16a34a, #4ade80)'
                              : item.label === 'Cost of Goods'
                                ? 'linear-gradient(90deg, #ea580c, #f97316)'
                                : item.label === 'Gross Profit'
                                  ? 'linear-gradient(90deg, #22c55e, #86efac)'
                                  : 'linear-gradient(90deg, #dc2626, #f87171)',
                          transition: 'width 0.6s ease',
                          display: 'flex', alignItems: 'center', paddingLeft: 10,
                        }}>
                          <span style={{
                            fontSize: 12, fontWeight: 700,
                            color: barWidth > 15 ? '#fff' : '#374151',
                            whiteSpace: 'nowrap',
                            ...(barWidth <= 15 ? { position: 'absolute', left: `calc(${barWidth}% + 8px)` } : {})
                          }}>
                            {money(item.value)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', marginTop: 14, padding: '14px 20px',
                borderRadius: 12, border: `2px solid ${plData.netProfit >= 0 ? '#16a34a' : '#ef4444'}`,
                background: plData.netProfit >= 0
                  ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)'
                  : 'linear-gradient(135deg, #fef2f2, #fee2e2)',
              }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: plData.netProfit >= 0 ? '#15803d' : '#b91c1c' }}>
                  {plData.netProfit >= 0 ? '✅ Net Profit' : '❌ Net Loss'}
                </span>
                <span style={{ fontWeight: 800, fontSize: 18, color: plData.netProfit >= 0 ? '#16a34a' : '#dc2626' }}>
                  {money(Math.abs(plData.netProfit))}
                </span>
              </div>
            </div>
          </>
        )}


        {/* ---- INVENTORY / PRICES TAB ---- */}
        {tab === "prices" && (
          <>
            <h2 style={styles.sectionTitle}><Store size={18} /> Inventory & Prices</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: 13.5, marginTop: -6 }}>Manage stock and update prices live.</p>
            <div style={styles.ownerTableWrap}>
              <table style={styles.ownerTable}>
                <thead>
                  <tr>
                    <th style={styles.ownerTh}></th>
                    <th style={styles.ownerTh}>{t.photoCol}</th>
                    <th style={styles.ownerTh}>{t.retailPrice}</th>
                    <th style={styles.ownerTh}>{t.wholesalePrice}</th>
                    <th style={styles.ownerTh}>{t.stockCol}</th>
                    <th style={styles.ownerTh}>Qty</th>
                    <th style={styles.ownerTh}>Alert</th>
                    <th style={styles.ownerTh}>Last Updated</th>
                    <th style={styles.ownerTh}></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} style={draft[p.id]?.inStock === false ? { backgroundColor: '#fff5f5' } : {}}>
                      <td style={styles.ownerTdName}>
                        <span style={{ fontSize: 20, marginRight: 8 }}>{p.emoji}</span>
                        {pname(p, lang)}
                        {draft[p.id]?.inStock === false && (
                          <span style={{ marginLeft: 6, fontSize: 10, backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1px 5px', borderRadius: 4, fontWeight: 600 }}>OUT OF STOCK</span>
                        )}
                      </td>
                      <td style={styles.ownerTd}>
                        <div style={styles.photoCellWrap}>
                          {draft[p.id]?.image ? (
                            <img src={draft[p.id].image} alt="" style={styles.photoThumb} />
                          ) : (
                            <span style={styles.photoThumbEmpty}>{p.emoji}</span>
                          )}
                          <input type="text" style={styles.photoUrlInput} placeholder={t.photoUrlPh}
                            value={draft[p.id]?.image ?? ""} onChange={e => updateField(p.id, "image", e.target.value)} />
                        </div>
                      </td>
                      <td style={styles.ownerTd}>
                        <input type="number" style={styles.priceInput} onFocus={e => e.target.select()}
                          value={draft[p.id]?.price ?? ""} onChange={e => updateField(p.id, "price", e.target.value)} />
                      </td>
                      <td style={styles.ownerTd}>
                        {p.bulkAvailable ? (
                          <input type="number" style={styles.priceInput} onFocus={e => e.target.select()}
                            value={draft[p.id]?.wholesalePrice ?? ""} onChange={e => updateField(p.id, "wholesalePrice", e.target.value)} />
                        ) : (
                          <span style={{ color: "var(--ink-soft)", fontSize: 12.5 }}>{t.notAvailable}</span>
                        )}
                      </td>
                      <td style={styles.ownerTd}>
                        <label style={styles.stockToggle}>
                          <input type="checkbox" checked={draft[p.id]?.inStock !== false}
                            onChange={() => updateField(p.id, "inStock", !draft[p.id]?.inStock)} />
                          {draft[p.id]?.inStock !== false ? t.inStock : t.outOfStock}
                        </label>
                      </td>
                      <td style={styles.ownerTd}>
                        <input type="number" style={{ ...styles.priceInput, width: 50 }} onFocus={e => e.target.select()}
                          value={draft[p.id]?.stockQty ?? ""} onChange={e => updateField(p.id, "stockQty", e.target.value)} />
                      </td>
                      <td style={styles.ownerTd}>
                        <input type="number" style={{ ...styles.priceInput, width: 50 }} onFocus={e => e.target.select()}
                          value={draft[p.id]?.lowStockThreshold ?? ""} onChange={e => updateField(p.id, "lowStockThreshold", e.target.value)} />
                      </td>
                      <td style={styles.ownerTd}>
                        {p.updatedAt && new Date(p.updatedAt) < new Date(Date.now() - 48 * 60 * 60 * 1000) ? (
                          <span style={{ fontSize: 11, color: '#b91c1c', backgroundColor: '#fee2e2', padding: '2px 6px', borderRadius: 10, fontWeight: 600 }}>Needs Review</span>
                        ) : p.updatedAt ? (
                          <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
                            {new Date(p.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </span>
                        ) : null}
                      </td>
                      <td style={styles.ownerTd}>
                        <button style={{ ...styles.dangerBtnSmall, padding: 4 }} onClick={() => deleteProduct(p.id)}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button style={styles.primaryBtn} onClick={handleSavePrices}>{t.savePrices}</button>
            {savedMsg && <p style={styles.savedToast}>{t.saved}</p>}
          </>
        )}

        {/* ---- ADD VEGETABLE TAB ---- */}
        {tab === "add" && (
          <>
            <h2 style={styles.sectionTitle}><PlusCircle size={18} /> {t.addVegTitle}</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: 13.5, marginTop: -6 }}>{t.addVegSub}</p>
            <div style={styles.formGrid}>
              <div>
                <label style={styles.inputLabel}>{t.fieldNameEn}</label>
                <input style={styles.textInput} value={newVeg.name} onChange={e => updateNewVeg("name", e.target.value)} />
              </div>
              <div>
                <label style={styles.inputLabel}>{t.fieldNameTe}</label>
                <input style={styles.textInput} value={newVeg.te} onChange={e => updateNewVeg("te", e.target.value)} />
              </div>
              <div>
                <label style={styles.inputLabel}>{t.fieldEmoji}</label>
                <input style={styles.textInput} value={newVeg.emoji} onChange={e => updateNewVeg("emoji", e.target.value)} maxLength={4} />
              </div>
              <div>
                <label style={styles.inputLabel}>{t.fieldCategory}</label>
                <select style={styles.selectInput} value={newVeg.cat} onChange={e => updateNewVeg("cat", e.target.value)}>
                  {CATEGORIES.filter(c => c.key !== "All").map(c => (
                    <option key={c.key} value={c.key}>{lang === "te" ? c.te : c.en}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={styles.inputLabel}>{t.fieldUnit}</label>
                <select style={styles.selectInput} value={newVeg.unit} onChange={e => updateNewVeg("unit", e.target.value)}>
                  <option value="kg">kg</option>
                  <option value="piece">piece</option>
                  <option value="bunch">bunch</option>
                  <option value="100g">100g</option>
                </select>
              </div>
              <div style={styles.formGridFull}>
                <label style={styles.inputLabel}>{t.fieldImage}</label>
                <input style={styles.textInput} placeholder={t.photoUrlPh} value={newVeg.image} onChange={e => updateNewVeg("image", e.target.value)} />
              </div>
              <div>
                <label style={styles.inputLabel}>{t.fieldRetail}</label>
                <input type="number" style={styles.textInput} value={newVeg.price} onChange={e => updateNewVeg("price", e.target.value)} />
              </div>
              <div style={styles.formGridFull}>
                <label style={styles.checkboxRow}>
                  <input type="checkbox" checked={newVeg.bulkAvailable} onChange={e => updateNewVeg("bulkAvailable", e.target.checked)} />
                  {t.fieldBulk}
                </label>
              </div>
              {newVeg.bulkAvailable && newVeg.unit === "kg" && (
                <div style={styles.formGridFull}>
                  <label style={styles.inputLabel}>{t.fieldWholesale}</label>
                  <input type="number" style={styles.textInput} value={newVeg.wholesalePrice} onChange={e => updateNewVeg("wholesalePrice", e.target.value)} />
                </div>
              )}
              <div>
                <label style={styles.inputLabel}>Stock Quantity</label>
                <input type="number" style={styles.textInput} value={newVeg.stockQty || 100} onChange={e => updateNewVeg("stockQty", e.target.value)} />
              </div>
              <div>
                <label style={styles.inputLabel}>Low Stock Alert At</label>
                <input type="number" style={styles.textInput} value={newVeg.lowStockThreshold || 10} onChange={e => updateNewVeg("lowStockThreshold", e.target.value)} />
              </div>
            </div>
            {addError && <p style={styles.errorText}>{addError}</p>}
            <button style={styles.primaryBtn} onClick={submitNewVeg}>{t.addVegBtn}</button>
            {addedMsg && <p style={styles.savedToast}>{t.addedToast}</p>}
          </>
        )}

        {/* ---- COUPONS TAB ---- */}
        {tab === "coupons" && (
          <>
            <h2 style={styles.sectionTitle}><Tag size={18} /> Coupon Codes</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: 13.5, marginTop: -6 }}>Create discount codes for customers.</p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, padding: 16, backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div>
                <label style={styles.inputLabel}>Code</label>
                <input style={{ ...styles.textInput, textTransform: 'uppercase', margin: 0 }} placeholder="e.g. FRESH10"
                  value={newCoupon.code} onChange={e => setNewCoupon(p => ({ ...p, code: e.target.value.toUpperCase() }))} />
              </div>
              <div>
                <label style={styles.inputLabel}>Type</label>
                <select style={{ ...styles.selectInput, margin: 0 }} value={newCoupon.discountType}
                  onChange={e => setNewCoupon(p => ({ ...p, discountType: e.target.value }))}>
                  <option value="percent">Percentage (%)</option>
                  <option value="flat">Flat (₹)</option>
                </select>
              </div>
              <div>
                <label style={styles.inputLabel}>Value</label>
                <input type="number" style={{ ...styles.textInput, margin: 0 }} placeholder={newCoupon.discountType === 'percent' ? '10' : '50'}
                  value={newCoupon.discountValue} onChange={e => setNewCoupon(p => ({ ...p, discountValue: e.target.value }))} />
              </div>
              <div>
                <label style={styles.inputLabel}>Min Order (₹)</label>
                <input type="number" style={{ ...styles.textInput, margin: 0 }} placeholder="150"
                  value={newCoupon.minOrder} onChange={e => setNewCoupon(p => ({ ...p, minOrder: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button style={styles.primaryBtn} onClick={addCoupon} disabled={!newCoupon.code || !newCoupon.discountValue}>Create</button>
              </div>
            </div>
            {couponMsg && <p style={styles.savedToast}>{couponMsg}</p>}

            <div style={styles.ownerTableWrap}>
              <table style={styles.ownerTable}>
                <thead><tr>
                  <th style={styles.ownerTh}>Code</th>
                  <th style={styles.ownerTh}>Discount</th>
                  <th style={styles.ownerTh}>Min Order</th>
                  <th style={styles.ownerTh}>Uses</th>
                  <th style={styles.ownerTh}></th>
                </tr></thead>
                <tbody>
                  {coupons.map(c => (
                    <tr key={c.id}>
                      <td style={styles.ownerTdName}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{c.code}</span>
                      </td>
                      <td style={styles.ownerTd}>
                        {c.discount_type === 'percent' ? `${c.discount_value}%` : `₹${c.discount_value}`}
                      </td>
                      <td style={styles.ownerTd}>₹{c.min_order}</td>
                      <td style={styles.ownerTd}>{c.uses}{c.max_uses ? `/${c.max_uses}` : ''}</td>
                      <td style={styles.ownerTd}>
                        <button style={{ ...styles.dangerBtnSmall, padding: 4 }} onClick={() => deleteCoupon(c.id)}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                  {coupons.length === 0 && <tr><td colSpan={5} style={{ ...styles.ownerTd, textAlign: 'center', color: 'var(--ink-soft)' }}>No coupons yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ---- AUDIT LOGS TAB ---- */}
        {tab === "auditLogs" && (
          <>
            <h2 style={styles.sectionTitle}>📋 Audit Logs</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: 13.5, margin: '-6px 0 16px' }}>History of pricing and stock changes.</p>
            <div style={styles.ownerTableWrap}>
              <table style={styles.ownerTable}>
                <thead><tr>
                  <th style={styles.ownerTh}>Date & Time</th>
                  <th style={styles.ownerTh}>Action</th>
                  <th style={styles.ownerTh}>Entity ID</th>
                  <th style={styles.ownerTh}>Details</th>
                </tr></thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={styles.ownerTd}>{new Date(log.created_at).toLocaleString()}</td>
                      <td style={styles.ownerTd}>
                        <span style={{ fontWeight: 600, color: log.action_type === 'product_update' ? '#0369a1' : '#b45309' }}>
                          {log.action_type}
                        </span>
                      </td>
                      <td style={styles.ownerTd}>{log.entity_id}</td>
                      <td style={styles.ownerTd}>
                        <pre style={{ margin: 0, fontSize: 11, background: '#f8fafc', padding: '4px 8px', borderRadius: 4, whiteSpace: 'pre-wrap' }}>
                          {JSON.stringify(log.old_data)} ➡️ {JSON.stringify(log.new_data)}
                        </pre>
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && <tr><td colSpan={4} style={{ ...styles.ownerTd, textAlign: 'center' }}>No logs found.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ---- ACCOUNT / PASSWORD TAB ---- */}
        {tab === "account" && (
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div>
              <h2 style={styles.ownerSectionTitle}>Change Username</h2>
              <div style={{ maxWidth: 400 }}>
                <label style={styles.inputLabel}>New Username</label>
                <input type="text" style={styles.textInput} value={newUn} onChange={e => setNewUn(e.target.value)} />
                <label style={styles.inputLabel}>{t.currentPasswordLabel || "Current Password"}</label>
                <input type="password" style={styles.textInput} value={unPwd} onChange={e => setUnPwd(e.target.value)} />
                {unError && <p style={styles.errorText}>{unError}</p>}
                <button style={{...styles.primaryBtn, marginTop: 12}} disabled={!newUn || !unPwd || unSaving} onClick={submitUsernameChange}>
                  {unSaving ? "…" : "Change Username"}
                </button>
                {unSavedMsg && <p style={styles.savedToast}>Username successfully updated!</p>}
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0' }} />

            <div>
              <h2 style={styles.ownerSectionTitle}>{t.changePasswordTab}</h2>
              <div style={{ maxWidth: 400 }}>
                <label style={styles.inputLabel}>{t.currentPasswordLabel || "Current Password"}</label>
                <input type="password" style={styles.textInput} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                <label style={styles.inputLabel}>{t.newPasswordLabel}</label>
                <input type="password" style={styles.textInput} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                <p style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: -6, marginBottom: 12 }}>{t.passwordHint}</p>
                <label style={styles.inputLabel}>{t.confirmPasswordLabel}</label>
                <input type="password" style={styles.textInput} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                {pwError && <p style={styles.errorText}>{pwError}</p>}
                <button style={{...styles.primaryBtn, marginTop: 12}} disabled={!currentPassword || !newPassword || !confirmPassword || pwSaving} onClick={submitPasswordChange}>
                  {pwSaving ? "…" : t.changePasswordBtn}
                </button>
                {pwSavedMsg && <p style={styles.savedToast}>{t.passwordChanged}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
      <ContactBar t={t} />
    </div>
  );
}
