import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";

// ═══════════════════════════════════════════════════════════════════
// FILO — AI-Powered Landscape Design Platform
// Complete SaaS Application
// ═══════════════════════════════════════════════════════════════════

// ─── Context & State Management ──────────────────────────────────
const AppContext = createContext(null);

const useApp = () => useContext(AppContext);

// ─── Mock Data (dev only) ────────────────────────────────────────
// These arrays are ONLY populated in local development (import.meta.env.DEV).
// In production builds (Vercel) they are empty — all data comes from the API.
const PLANTS_DB = import.meta.env.DEV ? [
  { id: 1, name: "Loropetalum 'Purple Diamond'", type: "shrub", size: "3-gal", sun: "full", mature_h: "6ft", mature_w: "5ft", bloom: "Pink, Spring", water: "Moderate", price: 28.50, img: "🌸", desc: "Elegant weeping form with burgundy foliage and ribbon-like fuchsia blooms that cascade in spring." },
  { id: 2, name: "Indian Hawthorn 'Clara'", type: "shrub", size: "3-gal", sun: "full", mature_h: "4ft", mature_w: "4ft", bloom: "White/Pink, Spring", water: "Low", price: 22.00, img: "🌺", desc: "Compact evergreen with glossy leaves and delicate star-shaped flowers, thriving in Houston's warmth." },
  { id: 3, name: "Gulf Muhly Grass", type: "ornamental_grass", size: "1-gal", sun: "full", mature_h: "4ft", mature_w: "3ft", bloom: "Pink plumes, Fall", water: "Low", price: 12.50, img: "🌾", desc: "A Texas native with ethereal pink cloud-like plumes that catch autumn light like spun cotton candy." },
  { id: 4, name: "Dwarf Yaupon Holly", type: "shrub", size: "3-gal", sun: "full/partial", mature_h: "5ft", mature_w: "5ft", bloom: "Evergreen", water: "Low", price: 24.00, img: "🌿", desc: "Dense, naturally mounding holly that anchors any design with year-round deep green structure." },
  { id: 5, name: "Knockout Rose 'Double Red'", type: "shrub", size: "3-gal", sun: "full", mature_h: "4ft", mature_w: "4ft", bloom: "Red, Continuous", water: "Moderate", price: 26.00, img: "🌹", desc: "Relentless bloomer delivering waves of velvety red roses from spring through first frost." },
  { id: 6, name: "Agapanthus 'Blue Storm'", type: "perennial", size: "1-gal", sun: "full/partial", mature_h: "3ft", mature_w: "2ft", bloom: "Blue, Summer", water: "Low", price: 14.00, img: "💙", desc: "Dramatic globe-shaped clusters of midnight blue trumpet flowers on sturdy stalks." },
  { id: 7, name: "Asiatic Jasmine", type: "groundcover", size: "1-gal", sun: "partial/shade", mature_h: "1ft", mature_w: "spreading", bloom: "Evergreen groundcover", water: "Low", price: 8.50, img: "🍃", desc: "Dense, cascading groundcover that weaves a living carpet of dark, glossy foliage." },
  { id: 8, name: "Ligustrum 'Sunshine'", type: "shrub", size: "5-gal", sun: "full", mature_h: "6ft", mature_w: "4ft", bloom: "Yellow foliage, Evergreen", water: "Moderate", price: 38.00, img: "✨", desc: "Electric chartreuse foliage that illuminates shaded borders and adds year-round golden glow." },
  { id: 9, name: "Star Jasmine", type: "vine", size: "3-gal", sun: "full/partial", mature_h: "20ft", mature_w: "climbing", bloom: "White, Spring", water: "Moderate", price: 24.00, img: "⭐", desc: "Intensely fragrant white pinwheel flowers drift their perfume across warm evening gardens." },
  { id: 10, name: "Crape Myrtle 'Natchez'", type: "tree", size: "15-gal", sun: "full", mature_h: "25ft", mature_w: "20ft", bloom: "White, Summer", water: "Low", price: 145.00, img: "🌳", desc: "Sculptural cinnamon bark and cascading white summer panicles define this iconic Southern specimen." },
] : [];

const MOCK_PROJECTS = import.meta.env.DEV ? [
  { id: "PRJ-001", client: "Johnson Residence", address: "4521 River Oaks Blvd", status: "design_review", areas: ["Front Yard", "Side Yard"], date: "2026-03-25", total: 12450 },
  { id: "PRJ-002", client: "Chen Family Estate", address: "1892 Memorial Dr", status: "estimate_approved", areas: ["Front Yard", "Back Yard"], date: "2026-03-22", total: 28900 },
  { id: "PRJ-003", client: "Martinez Property", address: "7744 Tanglewood Ln", status: "submittal_sent", areas: ["Front Yard"], date: "2026-03-18", total: 8750 },
  { id: "PRJ-004", client: "Williams Home", address: "3310 Piping Rock Ln", status: "completed", areas: ["Front Yard", "Back Yard", "Side Yard"], date: "2026-03-10", total: 34200 },
] : [];

const STATUS_MAP = {
  photo_upload: { label: "Photos", color: "#6B7280", step: 1 },
  plant_detection: { label: "Bed Prep", color: "#F59E0B", step: 2 },
  design_questionnaire: { label: "Questionnaire", color: "#8B5CF6", step: 3 },
  design_generation: { label: "Designing", color: "#3B82F6", step: 4 },
  design_review: { label: "Review", color: "#EC4899", step: 5 },
  estimate_pending: { label: "Estimate", color: "#F97316", step: 5 },
  estimate_approved: { label: "Approved", color: "#10B981", step: 6 },
  submittal_sent: { label: "Submitted", color: "#06B6D4", step: 7 },
  completed: { label: "Complete", color: "#059669", step: 8 },
};

const CRM_OPTIONS = ["Jobber", "ServiceTitan", "LMN", "Aspire", "SingleOps", "Housecall Pro", "Arborgold", "Service Autopilot", "Yardbook"];

// ─── Error Boundary ─────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null, info: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { this.setState({ info }); console.error('[FILO ErrorBoundary]', error, info?.componentStack); }
  render() {
    if (this.state.hasError) {
      return React.createElement('div', { style: { padding: 40, maxWidth: 600, margin: '40px auto', background: '#FEE2E2', borderRadius: 12, fontFamily: 'system-ui' } },
        React.createElement('h2', { style: { color: '#991B1B', marginBottom: 12 } }, '⚠️ Something went wrong'),
        React.createElement('pre', { style: { fontSize: 12, color: '#991B1B', whiteSpace: 'pre-wrap', wordBreak: 'break-all', marginBottom: 16 } },
          String(this.state.error) + '\n\n' + (this.state.info?.componentStack || '')
        ),
        React.createElement('button', {
          onClick: () => { localStorage.removeItem('filo_wizard_checkpoint'); window.location.reload(); },
          style: { padding: '10px 20px', background: '#991B1B', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }
        }, 'Clear State & Reload')
      );
    }
    return this.props.children;
  }
}

// ─── Utility Functions ───────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const cn = (...classes) => classes.filter(Boolean).join(" ");

// ─── Styles ──────────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@400;500;600;700&display=swap');

:root {
  --filo-black: #0A0E0F;
  --filo-charcoal: #1A1F23;
  --filo-slate: #2A3036;
  --filo-grey: #6B7280;
  --filo-silver: #9CA3AF;
  --filo-light: #E5E7EB;
  --filo-offwhite: #F3F4F6;
  --filo-white: #FFFFFF;
  --filo-green: #2D6A4F;
  --filo-green-light: #40916C;
  --filo-green-bright: #52B788;
  --filo-green-glow: #74C69D;
  --filo-green-pale: #D8F3DC;
  --filo-gold: #C9A84C;
  --filo-gold-light: #E2C97E;
  --filo-amber: #F59E0B;
  --filo-red: #EF4444;
  --filo-blue: #3B82F6;
  --filo-purple: #8B5CF6;
  --filo-cyan: #06B6D4;
  --filo-pink: #EC4899;
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'DM Sans', system-ui, sans-serif;
  --radius: 12px;
  --radius-sm: 8px;
  --radius-lg: 20px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.08);
  --shadow-lg: 0 12px 40px rgba(0,0,0,0.12);
  --shadow-glow: 0 0 40px rgba(45,106,79,0.15);
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: var(--font-body);
  background: var(--filo-offwhite);
  color: var(--filo-charcoal);
  -webkit-font-smoothing: antialiased;
}

/* ─── Scrollbar ─── */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--filo-silver); border-radius: 3px; }

/* ─── Animations ─── */
@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
@keyframes spin { to { transform: rotate(360deg); } }

.fade-in { animation: fadeIn 0.4s ease-out forwards; }
.slide-in { animation: slideIn 0.3s ease-out forwards; }
.scale-in { animation: scaleIn 0.3s ease-out forwards; }

/* ─── Layout ─── */
.app-layout { display: flex; min-height: 100vh; }
.sidebar {
  width: 260px; background: var(--filo-charcoal); color: var(--filo-white);
  display: flex; flex-direction: column; position: fixed; top: 0; left: 0; bottom: 0; z-index: 50;
  transition: transform 0.3s ease;
}
.sidebar-collapsed { transform: translateX(-260px); }
.main-content { flex: 1; margin-left: 260px; transition: margin-left 0.3s ease; }
.main-content.expanded { margin-left: 0; }

/* ─── Sidebar Styles ─── */
.sidebar-brand {
  padding: 24px 20px; display: flex; align-items: center; gap: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.sidebar-brand h1 {
  font-family: var(--font-display); font-size: 28px; font-weight: 700;
  background: linear-gradient(135deg, var(--filo-green-bright), var(--filo-gold));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}
.sidebar-brand .leaf { font-size: 28px; filter: drop-shadow(0 0 8px rgba(82,183,136,0.4)); }
.sidebar-nav { flex: 1; padding: 12px 8px; overflow-y: auto; }
.sidebar-section { margin-bottom: 24px; }
.sidebar-section-title {
  font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;
  color: var(--filo-grey); padding: 8px 12px;
}
.nav-item {
  display: flex; align-items: center; gap: 12px; padding: 10px 12px;
  border-radius: var(--radius-sm); cursor: pointer; transition: all 0.15s ease;
  font-size: 14px; font-weight: 400; color: var(--filo-silver);
  border: none; background: none; width: 100%; text-align: left;
}
.nav-item:hover { background: rgba(255,255,255,0.05); color: var(--filo-white); }
.nav-item.active { background: rgba(45,106,79,0.2); color: var(--filo-green-bright); font-weight: 500; }
.nav-item .icon { font-size: 18px; width: 24px; text-align: center; }
.nav-item .badge {
  margin-left: auto; background: var(--filo-green); color: white;
  font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: 600;
}
.sidebar-footer {
  padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.06);
  display: flex; align-items: center; gap: 12px;
}
.avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: linear-gradient(135deg, var(--filo-green), var(--filo-green-bright));
  display: flex; align-items: center; justify-content: center;
  font-weight: 600; font-size: 14px; color: white;
}
.sidebar-footer .info { flex: 1; }
.sidebar-footer .info .name { font-size: 13px; font-weight: 500; color: var(--filo-white); }
.sidebar-footer .info .role { font-size: 11px; color: var(--filo-grey); }

/* ─── Top Bar ─── */
.topbar {
  height: 64px; background: var(--filo-white); border-bottom: 1px solid var(--filo-light);
  display: flex; align-items: center; padding: 0 24px; gap: 16px;
  position: sticky; top: 0; z-index: 40;
}
.topbar-toggle {
  display: none; background: none; border: none; font-size: 24px; cursor: pointer;
  color: var(--filo-charcoal);
}
.topbar-breadcrumb { font-size: 14px; color: var(--filo-grey); }
.topbar-breadcrumb span { color: var(--filo-charcoal); font-weight: 500; }
.topbar-actions { margin-left: auto; display: flex; align-items: center; gap: 12px; }

/* ─── Buttons ─── */
.btn {
  display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px;
  border-radius: var(--radius-sm); font-family: var(--font-body);
  font-size: 14px; font-weight: 500; cursor: pointer; border: none;
  transition: all 0.2s ease; white-space: nowrap;
}
.btn-primary {
  background: linear-gradient(135deg, var(--filo-green), var(--filo-green-light));
  color: white; box-shadow: 0 2px 8px rgba(45,106,79,0.3);
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(45,106,79,0.4); }
.btn-secondary { background: var(--filo-offwhite); color: var(--filo-charcoal); border: 1px solid var(--filo-light); }
.btn-secondary:hover { background: var(--filo-light); }
.btn-ghost { background: transparent; color: var(--filo-grey); }
.btn-ghost:hover { background: var(--filo-offwhite); color: var(--filo-charcoal); }
.btn-danger { background: var(--filo-red); color: white; }
.btn-gold { background: linear-gradient(135deg, var(--filo-gold), var(--filo-gold-light)); color: var(--filo-charcoal); font-weight: 600; }
.btn-sm { padding: 6px 14px; font-size: 13px; }
.btn-lg { padding: 14px 28px; font-size: 16px; }
.btn-icon { padding: 8px; border-radius: var(--radius-sm); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

/* ─── Cards ─── */
.card {
  background: var(--filo-white); border-radius: var(--radius); border: 1px solid var(--filo-light);
  overflow: hidden; transition: all 0.2s ease;
}
.card:hover { box-shadow: var(--shadow-md); }
.card-header { padding: 20px 24px; border-bottom: 1px solid var(--filo-light); display: flex; align-items: center; justify-content: space-between; }
.card-body { padding: 24px; }
.card-footer { padding: 16px 24px; border-top: 1px solid var(--filo-light); background: var(--filo-offwhite); }

/* ─── Inputs ─── */
.form-group { margin-bottom: 20px; }
.form-label { display: block; font-size: 13px; font-weight: 500; color: var(--filo-slate); margin-bottom: 6px; }
.form-input {
  width: 100%; padding: 10px 14px; border: 1px solid var(--filo-light);
  border-radius: var(--radius-sm); font-family: var(--font-body); font-size: 14px;
  background: var(--filo-white); transition: all 0.2s ease; color: var(--filo-charcoal);
}
.form-input:focus { outline: none; border-color: var(--filo-green-bright); box-shadow: 0 0 0 3px rgba(82,183,136,0.15); }
.form-input::placeholder { color: var(--filo-silver); }
select.form-input { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px; }
textarea.form-input { resize: vertical; min-height: 80px; }

/* ─── Stats ─── */
.stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
.stat-card {
  background: var(--filo-white); border: 1px solid var(--filo-light);
  border-radius: var(--radius); padding: 20px 24px;
}
.stat-card .stat-label { font-size: 12px; font-weight: 500; color: var(--filo-grey); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
.stat-card .stat-value { font-family: var(--font-display); font-size: 32px; font-weight: 600; color: var(--filo-charcoal); }
.stat-card .stat-change { font-size: 12px; margin-top: 4px; }
.stat-card .stat-change.up { color: var(--filo-green); }
.stat-card .stat-change.down { color: var(--filo-red); }

/* ─── Tables ─── */
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--filo-grey); background: var(--filo-offwhite); border-bottom: 1px solid var(--filo-light); }
td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid var(--filo-light); }
tr:hover td { background: rgba(45,106,79,0.02); }
.status-badge {
  display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px;
  border-radius: 20px; font-size: 12px; font-weight: 500;
}

/* ─── Page Header ─── */
.page-header { padding: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
.page-header h2 { font-family: var(--font-display); font-size: 28px; font-weight: 600; color: var(--filo-charcoal); }
.page-header p { font-size: 14px; color: var(--filo-grey); margin-top: 4px; }
.page-body { padding: 0 24px 24px; }

/* ─── Wizard / Steps ─── */
.wizard { max-width: 680px; margin: 0 auto; padding: 40px 24px; }
.wizard-progress { display: flex; align-items: center; margin-bottom: 40px; gap: 4px; }
.wizard-step-dot {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600; transition: all 0.3s ease;
}
.wizard-step-dot.done { background: var(--filo-green); color: white; }
.wizard-step-dot.active { background: var(--filo-green-bright); color: white; box-shadow: 0 0 0 4px rgba(82,183,136,0.2); }
.wizard-step-dot.pending { background: var(--filo-light); color: var(--filo-grey); }
.wizard-connector { flex: 1; height: 2px; background: var(--filo-light); }
.wizard-connector.done { background: var(--filo-green); }
.wizard-title { font-family: var(--font-display); font-size: 24px; font-weight: 600; margin-bottom: 8px; }
.wizard-subtitle { font-size: 14px; color: var(--filo-grey); margin-bottom: 32px; }

/* ─── Upload Zone ─── */
.upload-zone {
  border: 2px dashed var(--filo-light); border-radius: var(--radius);
  padding: 40px; text-align: center; cursor: pointer;
  transition: all 0.2s ease; background: var(--filo-offwhite);
}
.upload-zone:hover { border-color: var(--filo-green-bright); background: var(--filo-green-pale); }
.upload-zone .icon { font-size: 40px; margin-bottom: 12px; }
.upload-zone p { font-size: 14px; color: var(--filo-grey); }

/* ─── Plant Cards ─── */
.plant-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
.plant-card {
  background: var(--filo-white); border: 1px solid var(--filo-light);
  border-radius: var(--radius); padding: 16px; cursor: pointer;
  transition: all 0.2s ease; position: relative;
}
.plant-card:hover { border-color: var(--filo-green-bright); transform: translateY(-2px); box-shadow: var(--shadow-md); }
.plant-card.selected { border-color: var(--filo-green); background: var(--filo-green-pale); }
.plant-card .plant-icon { font-size: 32px; margin-bottom: 8px; }
.plant-card .plant-name { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
.plant-card .plant-meta { font-size: 12px; color: var(--filo-grey); }
.plant-card .plant-price { font-weight: 600; color: var(--filo-green); margin-top: 8px; }

/* ─── Design Canvas ─── */
.design-canvas {
  background: linear-gradient(180deg, #87CEEB 0%, #87CEEB 40%, #8FBC8F 40%, #6B8E5C 100%);
  border-radius: var(--radius); min-height: 400px; position: relative;
  overflow: hidden; border: 1px solid var(--filo-light);
}
.design-canvas .house {
  position: absolute; bottom: 35%; left: 50%; transform: translateX(-50%);
  width: 300px; height: 160px; background: #D4C5A9; border-radius: 4px 4px 0 0;
}
.design-canvas .house::before {
  content: ''; position: absolute; top: -60px; left: -20px; right: -20px;
  border-left: 170px solid transparent; border-right: 170px solid transparent;
  border-bottom: 60px solid #8B7355;
}
.design-canvas .bed-area {
  position: absolute; bottom: 10%; left: 10%; right: 10%; height: 25%;
  background: rgba(101,67,33,0.6); border-radius: 50% 50% 0 0;
  border: 2px dashed rgba(255,255,255,0.4);
}
.design-plant {
  position: absolute; font-size: 24px; cursor: grab;
  transition: transform 0.15s ease;
  user-select: none;
}
.design-plant:hover { transform: scale(1.2); }

/* ─── Chat Panel ─── */
.chat-panel {
  background: var(--filo-white); border: 1px solid var(--filo-light);
  border-radius: var(--radius); display: flex; flex-direction: column; height: 400px;
}
.chat-messages { flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
.chat-msg {
  max-width: 80%; padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.5;
}
.chat-msg.user { align-self: flex-end; background: var(--filo-green); color: white; border-bottom-right-radius: 4px; }
.chat-msg.ai { align-self: flex-start; background: var(--filo-offwhite); color: var(--filo-charcoal); border-bottom-left-radius: 4px; }
.chat-input-bar {
  padding: 12px; border-top: 1px solid var(--filo-light);
  display: flex; gap: 8px;
}
.chat-input-bar input { flex: 1; }

/* ─── Estimate Table ─── */
.estimate-section { margin-bottom: 24px; }
.estimate-section h4 { font-size: 14px; font-weight: 600; color: var(--filo-slate); margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--filo-light); }
.estimate-total { font-family: var(--font-display); font-size: 36px; font-weight: 700; color: var(--filo-green); }
.estimate-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
.estimate-row.total { font-weight: 700; font-size: 16px; border-top: 2px solid var(--filo-charcoal); padding-top: 12px; margin-top: 8px; }

/* ─── Onboarding ─── */
.onboarding-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #0A1A12 0%, #1A2F23 50%, #0A1A12 100%);
  display: flex; align-items: center; justify-content: center; padding: 24px;
}
.onboarding-card {
  background: var(--filo-white); border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg); width: 100%; max-width: 580px;
  padding: 48px; animation: scaleIn 0.4s ease-out;
}

/* ─── Login ─── */
.login-page {
  min-height: 100vh; display: flex;
  background: linear-gradient(135deg, #0A1A12 0%, #1A2F23 50%, #0A1A12 100%);
}
.login-left { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; color: white; }
.login-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px; }
.login-card { background: white; border-radius: var(--radius-lg); padding: 48px; width: 100%; max-width: 420px; box-shadow: var(--shadow-lg); }

/* ─── Tabs ─── */
.tabs { display: flex; gap: 2px; background: var(--filo-offwhite); border-radius: var(--radius-sm); padding: 3px; margin-bottom: 24px; }
.tab-btn {
  flex: 1; padding: 8px 16px; border: none; background: transparent;
  border-radius: 6px; font-family: var(--font-body); font-size: 13px;
  font-weight: 500; color: var(--filo-grey); cursor: pointer; transition: all 0.2s ease;
}
.tab-btn.active { background: white; color: var(--filo-charcoal); box-shadow: var(--shadow-sm); }

/* ─── Modal ─── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100;
  display: flex; align-items: center; justify-content: center; padding: 24px;
  animation: fadeIn 0.2s ease;
}
.modal { background: white; border-radius: var(--radius-lg); max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto; animation: scaleIn 0.3s ease; }
.modal-header { padding: 24px; border-bottom: 1px solid var(--filo-light); display: flex; align-items: center; justify-content: space-between; }
.modal-header h3 { font-family: var(--font-display); font-size: 20px; }
.modal-body { padding: 24px; }
.modal-footer { padding: 16px 24px; border-top: 1px solid var(--filo-light); display: flex; justify-content: flex-end; gap: 12px; }

/* ─── Responsive / Mobile ─── */
@media (max-width: 768px) {
  .sidebar { transform: translateX(-260px); }
  .sidebar.mobile-open { transform: translateX(0); }
  .main-content { margin-left: 0 !important; }
  .topbar-toggle { display: block; }
  .stat-grid { grid-template-columns: repeat(2, 1fr); }
  .page-header h2 { font-size: 22px; }
  .login-page { flex-direction: column; }
  .login-left { display: none; }
  .plant-grid { grid-template-columns: repeat(2, 1fr); }
  .hide-mobile { display: none !important; }
}

/* ─── Pill Selector ─── */
.pill-group { display: flex; flex-wrap: wrap; gap: 8px; }
.pill {
  padding: 8px 16px; border-radius: 20px; border: 1px solid var(--filo-light);
  background: var(--filo-white); font-size: 13px; cursor: pointer;
  transition: all 0.2s ease; font-family: var(--font-body);
}
.pill:hover { border-color: var(--filo-green-bright); }
.pill.active { background: var(--filo-green); color: white; border-color: var(--filo-green); }

/* ─── Toggle ─── */
.toggle-wrap { display: flex; align-items: center; gap: 12px; }
.toggle {
  width: 44px; height: 24px; border-radius: 12px; background: var(--filo-light);
  position: relative; cursor: pointer; transition: background 0.2s ease;
}
.toggle.on { background: var(--filo-green); }
.toggle::after {
  content: ''; position: absolute; top: 2px; left: 2px;
  width: 20px; height: 20px; border-radius: 50%; background: white;
  transition: transform 0.2s ease; box-shadow: var(--shadow-sm);
}
.toggle.on::after { transform: translateX(20px); }

/* ─── Skeleton ─── */
.skeleton {
  background: linear-gradient(90deg, var(--filo-light) 25%, var(--filo-offwhite) 50%, var(--filo-light) 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: var(--radius-sm);
}

/* ─── Progress Bar ─── */
.progress-bar { height: 8px; background: var(--filo-light); border-radius: 4px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, var(--filo-green), var(--filo-green-bright)); border-radius: 4px; transition: width 0.5s ease; }

/* ─── Submittal Preview ─── */
.submittal-preview {
  background: white; border: 1px solid var(--filo-light); border-radius: var(--radius);
  padding: 48px; max-width: 800px; margin: 0 auto;
}
.submittal-cover { text-align: center; padding: 60px 40px; border-bottom: 3px solid var(--filo-green); margin-bottom: 40px; }
.submittal-cover h1 { font-family: var(--font-display); font-size: 36px; color: var(--filo-charcoal); margin-bottom: 8px; }
.submittal-section { margin-bottom: 32px; }
.submittal-section h3 { font-family: var(--font-display); font-size: 20px; margin-bottom: 16px; color: var(--filo-green); }

/* Loading spinner */
.spinner { width: 24px; height: 24px; border: 3px solid var(--filo-light); border-top-color: var(--filo-green); border-radius: 50%; animation: spin 0.8s linear infinite; }
`;

// ═══════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════

// ─── Sidebar ─────────────────────────────────────────────────────
function Sidebar({ page, setPage, mobileOpen, setMobileOpen, user }) {
  const { handleLogout } = useApp();
  const navItems = [
    { section: "Core", items: [
      { id: "projects", icon: "📁", label: "Projects", badge: MOCK_PROJECTS.length },
      { id: "new-project", icon: "✨", label: "New Project" },
      { id: "clients", icon: "👥", label: "Clients" },
    ]},
    { section: "Library", items: [
      { id: "plants", icon: "🌿", label: "Plant Library" },
      { id: "templates", icon: "📋", label: "Templates" },
    ]},
    { section: "Business", items: [
      { id: "estimates", icon: "💰", label: "Estimates" },
      { id: "submittals", icon: "📄", label: "Submittals" },
      { id: "crm", icon: "🔗", label: "CRM Integration" },
    ]},
    { section: "Settings", items: [
      { id: "settings", icon: "⚙️", label: "Settings" },
      { id: "billing", icon: "💳", label: "Billing" },
      { id: "team", icon: "🏢", label: "Team" },
    ]},
  ];

  return (
    <div className={cn("sidebar", mobileOpen && "mobile-open")}>
      <div className="sidebar-brand">
        <span className="leaf">🌿</span>
        <h1>FILO</h1>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(section => (
          <div className="sidebar-section" key={section.section}>
            <div className="sidebar-section-title">{section.section}</div>
            {section.items.map(item => (
              <button key={item.id} className={cn("nav-item", page === item.id && "active")}
                onClick={() => { setPage(item.id); setMobileOpen(false); }}>
                <span className="icon">{item.icon}</span>
                {item.label}
                {item.badge && <span className="badge">{item.badge}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="avatar">{(user?.name || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}</div>
          <div className="info">
            <div className="name">{user?.name || 'User'}</div>
            <div className="role">{user?.role || 'Member'} • {user?.companyName || 'FILO'}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'var(--filo-grey)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: 12, cursor: 'pointer', textAlign: 'center' }}>Sign Out</button>
      </div>
    </div>
  );
}

// ─── Top Bar ─────────────────────────────────────────────────────
function TopBar({ page, setMobileOpen }) {
  const titles = {
    projects: "Projects", "new-project": "New Project",
    clients: "Clients", plants: "Plant Library", templates: "Templates",
    estimates: "Estimates", submittals: "Submittals", crm: "CRM Integration",
    settings: "Settings", billing: "Billing", team: "Team",
  };
  return (
    <div className="topbar">
      <button className="topbar-toggle" onClick={() => setMobileOpen(o => !o)}>☰</button>
      <div className="topbar-breadcrumb">
        FILO / <span>{titles[page] || "Projects"}</span>
      </div>
      <div className="topbar-actions">
        <button className="btn btn-primary btn-sm" onClick={() => {}}>🔔</button>
        <button className="btn btn-secondary btn-sm">❓ Help</button>
      </div>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────
function DashboardPage({ setPage }) {
  const stats = [
    { label: "Active Projects", value: "12", change: "+3 this week", up: true },
    { label: "Estimates Pending", value: "5", change: "$48,200 value", up: true },
    { label: "Revenue This Month", value: "$86,400", change: "+12% vs last month", up: true },
    { label: "Close Rate", value: "72%", change: "-2% vs last month", up: false },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2>Good {new Date().getHours() < 12 ? "morning" : "afternoon"}, Esteph</h2>
          <p>Here's what's happening with King's Garden Landscaping</p>
        </div>
        <button className="btn btn-primary" onClick={() => setPage("new-project")}>
          ✨ New Project
        </button>
      </div>
      <div className="page-body">
        <div className="stat-grid">
          {stats.map((s, i) => (
            <div className="stat-card fade-in" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className={cn("stat-change", s.up ? "up" : "down")}>
                {s.up ? "↑" : "↓"} {s.change}
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>Recent Projects</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage("projects")}>View All →</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Project</th><th>Client</th><th>Status</th><th>Areas</th><th className="hide-mobile">Total</th><th></th></tr>
              </thead>
              <tbody>
                {MOCK_PROJECTS.map(p => (
                  <tr key={p.id} className="fade-in">
                    <td style={{ fontWeight: 500 }}>{p.id}</td>
                    <td>{p.client}<br/><span style={{ fontSize: 12, color: "var(--filo-grey)" }}>{p.address}</span></td>
                    <td>
                      <span className="status-badge" style={{ background: STATUS_MAP[p.status].color + "18", color: STATUS_MAP[p.status].color }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_MAP[p.status].color, display: "inline-block" }}></span>
                        {STATUS_MAP[p.status].label}
                      </span>
                    </td>
                    <td>{p.areas.join(", ")}</td>
                    <td className="hide-mobile" style={{ fontWeight: 600 }}>{fmt(p.total)}</td>
                    <td><button className="btn btn-ghost btn-sm">Open →</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="card">
            <div className="card-header"><h3 style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>AI Design Queue</h3></div>
            <div className="card-body">
              {["Johnson Front Yard", "Chen Back Patio"].map((name, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--filo-light)" }}>
                  <div className="spinner" style={{ width: 20, height: 20 }}></div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{name}</div>
                    <div style={{ fontSize: 12, color: "var(--filo-grey)" }}>Generating design...</div>
                  </div>
                  <div className="progress-bar" style={{ flex: 1, marginLeft: "auto" }}>
                    <div className="progress-fill" style={{ width: `${60 + i * 25}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3 style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>Quick Actions</h3></div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => setPage("new-project")}>🌱 Create New Project</button>
              <button className="btn btn-secondary" onClick={() => setPage("plants")}>🌿 Browse Plant Library</button>
              <button className="btn btn-secondary" onClick={() => setPage("estimates")}>💰 View Pending Estimates</button>
              <button className="btn btn-secondary" onClick={() => setPage("crm")}>🔗 CRM Sync Status</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Projects Page ───────────────────────────────────────────────
function ProjectsPage({ setPage }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? MOCK_PROJECTS : MOCK_PROJECTS.filter(p => p.status === filter);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2>Projects</h2>
          <p>{MOCK_PROJECTS.length} total projects</p>
        </div>
        <button className="btn btn-primary" onClick={() => setPage("new-project")}>✨ New Project</button>
      </div>
      <div className="page-body">
        <div className="tabs" style={{ maxWidth: 600 }}>
          {[["all", "All"], ["design_review", "In Review"], ["estimate_approved", "Approved"], ["completed", "Completed"]].map(([val, label]) => (
            <button key={val} className={cn("tab-btn", filter === val && "active")} onClick={() => setFilter(val)}>{label}</button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {filtered.map((p, i) => (
            <div key={p.id} className="card fade-in" style={{ cursor: "pointer", animationDelay: `${i * 0.05}s` }}>
              <div className="card-body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{p.client}</div>
                    <div style={{ fontSize: 13, color: "var(--filo-grey)" }}>{p.address}</div>
                  </div>
                  <span className="status-badge" style={{ background: STATUS_MAP[p.status].color + "18", color: STATUS_MAP[p.status].color }}>
                    {STATUS_MAP[p.status].label}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--filo-grey)" }}>
                  <span>📐 {p.areas.length} area{p.areas.length > 1 ? "s" : ""}</span>
                  <span>📅 {p.date}</span>
                </div>
                <div style={{ marginTop: 12, fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, color: "var(--filo-green)" }}>{fmt(p.total)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── New Project Wizard ──────────────────────────────────────────
function NewProjectPage() {
  const { setPage } = useApp();

  // ─── Checkpoint: restore saved wizard state on mount ────────────
  const [saved] = useState(() => { try { return JSON.parse(localStorage.getItem('filo_wizard_checkpoint') || 'null'); } catch { return null; } });

  const [step, setStep] = useState(saved?.step || 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiReady, setApiReady] = useState(false);
  const apiRef = useRef(null);
  const fileInputRefs = useRef({});

  // Form data
  const [project, setProject] = useState(saved?.project || {
    clientName: "", address: "", phone: "", email: "",
    areas: [],
    sun: "", style: "", specialRequests: "", lighting: false, hardscape: false,
  });

  // File selections (not yet uploaded — cannot persist File objects across refresh)
  const [selectedFiles, setSelectedFiles] = useState({}); // { areaName: File[] }

  // API response data persisted across steps
  const [clientId, setClientId] = useState(saved?.clientId || null);
  const [projectId, setProjectId] = useState(saved?.projectId || null);
  const [areaMap, setAreaMap] = useState(saved?.areaMap || {}); // { areaName: { id, ...areaData } }
  const [uploadedPhotos, setUploadedPhotos] = useState(saved?.uploadedPhotos || {}); // { areaName: photoData[] }
  const [detectedPlants, setDetectedPlants] = useState(saved?.detectedPlants || []); // from AI detection
  const [plantMarks, setPlantMarks] = useState(saved?.plantMarks || {}); // { plantId: 'keep' | 'remove' }
  const [highlightedPlant, setHighlightedPlant] = useState(null);
  const [editingPlantId, setEditingPlantId] = useState(null);
  const [manualPlantName, setManualPlantName] = useState('');
  const [placingPlant, setPlacingPlant] = useState(false);
  // Draw-to-remove tool state
  const [drawMode, setDrawMode] = useState(false); // 'remove' or false
  const drawModeRef = useRef(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const isDrawingRef = useRef(false);
  const [drawPaths, setDrawPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const currentPathRef = useRef([]);
  const [removalPreview, setRemovalPreview] = useState(null);
  const removalPreviewRef = useRef(null); // Ref mirror — always current, never stale in closures
  // Drawing tool mode — freehand or polygon (shared across all draw tools)
  const [drawToolMode, setDrawToolMode] = useState('freehand'); // 'freehand' | 'polygon'
  const [polygonPoints, setPolygonPoints] = useState([]); // current polygon being drawn

  // Bed Edge tool state
  const [bedPrepSubStep, setBedPrepSubStep] = useState('removal'); // 'removal' | 'bedEdge'
  const [bedEdgePath, setBedEdgePath] = useState([]);
  const [bedEdgeDrawing, setBedEdgeDrawing] = useState(false);
  const bedEdgeDrawingRef = useRef(false);
  const [bedEdgeCurrentPath, setBedEdgeCurrentPath] = useState([]);
  const bedEdgeCurrentPathRef = useRef([]);
  const [bedEdgeStyle, setBedEdgeStyle] = useState('rounded'); // 'square' | 'rounded'
  const [bedEdgeAdjustment, setBedEdgeAdjustment] = useState(0); // -10 to +10 feet
  const [bedEdgePreview, setBedEdgePreview] = useState(null);
  const bedEdgePreviewRef = useRef(null);
  const [generatingBedEdge, setGeneratingBedEdge] = useState(false);
  const [designRenderUrl, setDesignRenderUrl] = useState(null);
  const [adjustPin, setAdjustPin] = useState(null); // { x: %, y: % }
  const [adjustPrompt, setAdjustPrompt] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [adjustRadius, setAdjustRadius] = useState(15); // % of image width
  const [nightModeUrl, setNightModeUrl] = useState(null);
  const [generatingNightMode, setGeneratingNightMode] = useState(false);
  const [hardscapeDrawing, setHardscapeDrawing] = useState(false);
  const [hardscapePaths, setHardscapePaths] = useState([]);
  const [hardscapeCurrentPath, setHardscapeCurrentPath] = useState([]);
  const hardscapeDrawingRef = useRef(false);
  const hardscapeCurrentPathRef = useRef([]);
  const [hardscapePrompt, setHardscapePrompt] = useState('');
  const [applyingHardscape, setApplyingHardscape] = useState(false);
  const [savedPromptsList, setSavedPromptsList] = useState([]);
  const [showSavePromptForm, setShowSavePromptForm] = useState(false);
  const [newPromptName, setNewPromptName] = useState('');
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [generatingRender, setGeneratingRender] = useState(false);
  // Plant placement pins — click photo to mark where specific plants go
  const [plantPins, setPlantPins] = useState([]);
  const [editingPinIdx, setEditingPinIdx] = useState(null);
  const [placingPin, setPlacingPin] = useState(false);
  const removalCanvasRef = useRef(null);
  const canvasRef = useRef(null);
  const photoContainerRef = useRef(null);
  // Drag-and-drop plant markers
  const [draggingPlantId, setDraggingPlantId] = useState(null);
  const [removalCost, setRemovalCost] = useState(saved?.removalCost || "350.00");
  const [design, setDesign] = useState(saved?.design || null);
  const [designPlants, setDesignPlants] = useState(saved?.designPlants || []);
  const [chatMessages, setChatMessages] = useState(saved?.chatMessages || []);
  const [chatInput, setChatInput] = useState("");
  const [estimate, setEstimate] = useState(saved?.estimate || null);
  const [estimateApproved, setEstimateApproved] = useState(saved?.estimateApproved || false);
  const [submittal, setSubmittal] = useState(saved?.submittal || null);
  const [exportData, setExportData] = useState(saved?.exportData || null);

  // Load API module
  useEffect(() => {
    import("./api.js").then(mod => { apiRef.current = mod.default; setApiReady(true); }).catch(console.error);
  }, []);

  // ─── Load saved prompts when reaching AI Design step ───
  useEffect(() => {
    if (step === 5 && apiRef.current) {
      apiRef.current.savedPrompts.list().then(res => {
        setSavedPromptsList(res.prompts || []);
      }).catch(() => {});
    }
  }, [step]);

  // ─── Checkpoint: auto-save wizard state on every step change ───
  useEffect(() => {
    const checkpoint = {
      step, project, clientId, projectId, areaMap, uploadedPhotos,
      detectedPlants, plantMarks, removalCost, design, designPlants,
      chatMessages, estimate, estimateApproved, submittal, exportData,
      savedAt: Date.now(),
    };
    try { localStorage.setItem('filo_wizard_checkpoint', JSON.stringify(checkpoint)); } catch (e) { /* quota */ }
  }, [step, project, clientId, projectId, areaMap, uploadedPhotos, detectedPlants, plantMarks, removalCost, design, designPlants, chatMessages, estimate, estimateApproved, submittal, exportData]);

  const totalSteps = 8;
  const stepTitles = ["Client Info", "Property Areas", "Photo Upload", "Bed Preparation", "AI Design", "Estimate", "Submittal", "CRM Push"];

  const updateProject = (updates) => setProject(p => ({ ...p, ...updates }));

  // ─── Step transition handlers ─────────────────────────────────
  const handleNext = async () => {
    if (!apiRef.current) return;
    const api = apiRef.current;
    setError(null);
    setLoading(true);

    try {
      switch (step) {
        case 1: {
          // Create client
          if (!project.clientName || !project.address) throw new Error("Client name and address are required.");
          const client = await api.clients.create({
            name: project.clientName,
            address: project.address,
            phone: project.phone || null,
            email: project.email || null,
          });
          setClientId(client.id);
          setStep(2);
          break;
        }
        case 2: {
          // Create project + areas
          const areas = project.areas.length > 0 ? project.areas : ["Front Yard"];
          if (!clientId) throw new Error("Client must be created first.");
          const proj = await api.projects.create({
            client_id: clientId,
            name: `${project.clientName} - Landscape Design`,
            address: project.address,
            status: "photo_upload",
          });
          setProjectId(proj.id);
          // Create each area
          const aMap = {};
          for (const areaName of areas) {
            const area = await api.projects.createArea(proj.id, { name: areaName, area_type: areaName.toLowerCase().replace(/[^a-z]/g, '_') });
            aMap[areaName] = area;
          }
          setAreaMap(aMap);
          setStep(3);
          break;
        }
        case 3: {
          // Upload photos for each area
          const fileAreas = Object.keys(selectedFiles).filter(a => selectedFiles[a]?.length > 0);
          if (fileAreas.length === 0) {
            // Skip — no photos selected
            setStep(4);
            break;
          }
          const allPhotos = {};
          let totalUploaded = 0;
          for (const areaName of fileAreas) {
            const files = selectedFiles[areaName];
            const areaData = areaMap[areaName];
            if (!areaData) {
              console.warn(`No area data for "${areaName}", skipping upload`);
              continue;
            }
            try {
              const photos = await api.files.uploadPhotos(areaData.id, files);
              allPhotos[areaName] = Array.isArray(photos) ? photos : (photos?.photos || [photos]);
              totalUploaded += files.length;
            } catch (uploadErr) {
              console.error(`Upload failed for ${areaName}:`, uploadErr.message);
              throw new Error(`Photo upload failed for ${areaName}: ${uploadErr.message}`);
            }
          }
          setUploadedPhotos(allPhotos);
          // Fetch detected plants from ALL areas
          try {
            let allPlants = [];
            for (const area of Object.values(areaMap)) {
              if (area?.id) {
                const existing = await api.existingPlants.list(area.id);
                const plantList = Array.isArray(existing) ? existing : (existing?.plants || []);
                allPlants = allPlants.concat(plantList);
              }
            }
            setDetectedPlants(allPlants);
            const marks = {};
            allPlants.forEach(p => { marks[p.id] = p.mark || 'keep'; });
            setPlantMarks(marks);
          } catch (e) {
            console.log("Plant detection not yet complete:", e.message);
          }
          setError(null);
          setStep(4);
          break;
        }
        case 4: {
          // Save plant marks to backend
          for (const [plantId, mark] of Object.entries(plantMarks)) {
            try {
              await api.existingPlants.mark(plantId, mark, mark === 'remove' ? 'Marked for removal' : '');
            } catch (e) { console.log("Could not mark plant:", e.message); }
          }
          setStep(5);
          break;
        }
        case 5: {
          // AI Design step — save preferences, generate design if not done, then move to Review
          if (projectId) {
            await api.projects.update(projectId, {
              sun_exposure: project.sun,
              design_style: project.style,
              special_requests: project.specialRequests,
              lighting_requested: project.lighting,
              hardscape_changes: project.hardscape,
            });
            // Generate design if not already done
            let finalPlants = designPlants;
            if (!design || designPlants.length === 0) {
              await api.projects.updateStatus(projectId, 'design_generation');
              try {
                const designResult = await api.projects.generateDesign(projectId, {});
                const d = designResult.design || designResult;
                setDesign(d);
                const plants = designResult.plants || d?.plants || [];
                finalPlants = plants;
                if (finalPlants.length === 0 && d?.design_data) {
                  try {
                    const dd = typeof d.design_data === 'string' ? JSON.parse(d.design_data) : d.design_data;
                    finalPlants = dd.plants || [];
                  } catch (e) {}
                }
                setDesignPlants(finalPlants);
              } catch (e) {
                console.log("Design generation error:", e.message);
              }
            }

            // Auto-trigger AI visual render — check localStorage for most-processed image
            const savedBedEdge = (() => { try { return localStorage.getItem('filo_bed_edge_preview'); } catch(e) { return null; } })();
            const savedRemovalPreview = (() => { try { return localStorage.getItem('filo_removal_preview'); } catch(e) { return null; } })();
            if (finalPlants.length > 0 && !designRenderUrl) {
              const photoUrls = Object.values(uploadedPhotos || {}).flat().map(p => p?.file?.cdn_url || p?.cdn_url).filter(Boolean);
              if (photoUrls.length > 0) {
                const photoToUse = savedBedEdge || savedRemovalPreview || photoUrls[0];
                setGeneratingRender(true);
                console.log('[auto-render] Using:', savedBedEdge ? 'BED EDGE PREVIEW' : savedRemovalPreview ? 'REMOVAL PREVIEW' : 'ORIGINAL PHOTO');
                api.designRender.generate(
                  photoToUse,
                  finalPlants,
                  detectedPlants.filter(p => plantMarks[p.id] !== 'remove'),
                  detectedPlants.filter(p => plantMarks[p.id] === 'remove'),
                  project.style || 'naturalistic',
                  design?.narrative || design?.design_notes || '',
                  null
                ).then(result => {
                  console.log('[auto-render] Success, renderUrl length:', result?.renderUrl?.length || 0);
                  setDesignRenderUrl(result.renderUrl);
                }).catch(err => {
                  console.error('Auto design render failed:', err.message);
                  setError('Design render failed: ' + err.message + ' — you can retry from the button below.');
                }).finally(() => {
                  setGeneratingRender(false);
                });
              }
            }
          }
          setStep(6);
          break;
        }
        case 6: {
          // Generate estimate
          if (projectId) {
            try {
              const est = await api.projects.generateEstimate(projectId);
              setEstimate(est.estimate || est);
            } catch (e) {
              console.log("Estimate generation error:", e.message);
            }
          }
          setStep(7);
          break;
        }
        case 7: {
          // Approve estimate and generate submittal
          if (projectId) {
            if (estimate?.id && !estimateApproved) {
              try {
                await api.estimates.approve(estimate.id);
                setEstimateApproved(true);
              } catch (e) { console.log("Estimate approve error:", e.message); }
            }
            try {
              const sub = await api.projects.generateSubmittal(projectId);
              setSubmittal(sub.submittal || sub);
            } catch (e) {
              console.log("Submittal generation error:", e.message);
            }
          }
          setStep(8);
          break;
        }
        case 8: {
          // CRM Push + Final completion
          if (projectId) {
            await api.projects.updateStatus(projectId, 'completed');
            try {
              const exp = await api.projects.exportAll(projectId);
              setExportData(exp);
            } catch (e) { console.log("Export error:", e.message); }
          }
          localStorage.removeItem('filo_wizard_checkpoint');
          setPage('projects');
          break;
        }
        default:
          setStep(s => Math.min(s + 1, totalSteps));
      }
    } catch (err) {
      console.error("Step error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setError(null);
    setStep(s => Math.max(s - 1, 1));
  };

  // Chat handler for design review
  const handleChatSend = async () => {
    if (!chatInput.trim() || !design?.id || !apiRef.current) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    try {
      const result = await apiRef.current.designs.chat(design.id, msg);
      setChatMessages(prev => [...prev, { role: 'ai', text: result.response || result.message || 'Changes applied.' }]);
      if (result.plants) setDesignPlants(result.plants);
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'ai', text: `Sorry, I couldn't process that: ${e.message}` }]);
    }
  };

  // File selection handler
  const handleFileSelect = (areaName, files) => {
    const fileArray = Array.from(files);
    console.log('[FILO] handleFileSelect called:', areaName, fileArray.length, 'files');
    if (fileArray.length === 0) return;
    setSelectedFiles(prev => ({
      ...prev,
      [areaName]: [...(prev[areaName] || []), ...fileArray],
    }));
  };

  // Open native file picker via showOpenFilePicker (fallback for broken input)
  const openFilePicker = async (areaName) => {
    try {
      if (window.showOpenFilePicker) {
        const handles = await window.showOpenFilePicker({
          multiple: true,
          types: [{ description: 'Images', accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.heic', '.webp'] } }],
        });
        const files = await Promise.all(handles.map(h => h.getFile()));
        handleFileSelect(areaName, files);
      } else {
        // Fallback: create a temporary input
        const inp = document.createElement('input');
        inp.type = 'file';
        inp.multiple = true;
        inp.accept = 'image/jpeg,image/png,image/heic,image/webp';
        inp.onchange = () => { if (inp.files?.length) handleFileSelect(areaName, inp.files); };
        inp.click();
      }
    } catch (e) {
      if (e.name !== 'AbortError') console.error('File picker error:', e);
    }
  };

  const removeFile = (areaName, index) => {
    setSelectedFiles(prev => ({
      ...prev,
      [areaName]: (prev[areaName] || []).filter((_, i) => i !== index),
    }));
  };

  // Determine button label
  const getNextLabel = () => {
    if (loading) return "Working...";
    switch (step) {
      case 1: return "Create Client & Continue →";
      case 2: return "Create Project →";
      case 3: { const totalPhotos = Object.values(selectedFiles).reduce((sum, f) => sum + (f?.length || 0), 0); return totalPhotos > 0 ? `Upload ${totalPhotos} Photo${totalPhotos > 1 ? 's' : ''} →` : "Skip Photos →"; }
      case 4: return "Save & Continue →";
      case 5: return "Generate AI Design →";
      case 6: return "Generate Estimate →";
      case 7: return "Approve & Create Submittal →";
      case 8: return "Complete Project →";
      default: return "Continue →";
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2>New Project</h2>
          <p>Step {step} of {totalSteps} — {stepTitles[step - 1]}</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {step > 1 && <button className="btn" style={{ fontSize: 12, padding: "4px 10px", opacity: 0.5 }} onClick={() => { localStorage.removeItem('filo_wizard_checkpoint'); window.location.reload(); }}>Start Fresh</button>}
          {step > 1 && step <= totalSteps && <button className="btn btn-secondary" onClick={handleBack} disabled={loading}>← Back</button>}
          {step <= totalSteps && (
            <button className="btn btn-primary" onClick={handleNext} disabled={loading || !apiReady}>
              {getNextLabel()}
            </button>
          )}
        </div>
      </div>

      <div className="page-body">
        {/* Error Banner */}
        {error && (
          <div style={{ padding: 16, background: "#FEE2E2", borderRadius: "var(--radius-sm)", marginBottom: 20, fontSize: 14, color: "#991B1B", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{error}</span>
            <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>
        )}

        {/* Progress Bar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 32 }}>
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: "100%", height: 4, borderRadius: 2,
                background: i < step ? "var(--filo-green)" : i === step - 1 ? "var(--filo-green-bright)" : "var(--filo-light)",
                transition: "all 0.3s ease"
              }}></div>
              <span style={{ fontSize: 10, color: i <= step - 1 ? "var(--filo-green)" : "var(--filo-silver)", fontWeight: i === step - 1 ? 600 : 400 }}>
                {stepTitles[i]}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Client Info */}
        {step === 1 && (
          <div className="card scale-in" style={{ maxWidth: 600 }}>
            <div className="card-header"><h3 style={{ fontFamily: "var(--font-display)" }}>Client Information</h3></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Client Name *</label>
                <input className="form-input" placeholder="e.g. Johnson Residence" value={project.clientName}
                  onChange={e => updateProject({ clientName: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Property Address *</label>
                <input className="form-input" placeholder="4521 River Oaks Blvd, Houston, TX" value={project.address}
                  onChange={e => updateProject({ address: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" placeholder="(713) 555-0199" value={project.phone}
                    onChange={e => updateProject({ phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" placeholder="client@email.com" value={project.email}
                    onChange={e => updateProject({ email: e.target.value })} />
                </div>
              </div>
              <div style={{ padding: 16, background: "var(--filo-green-pale)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--filo-green)" }}>
                This creates a real client record in your FILO database and syncs to connected CRMs.
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Property Areas */}
        {step === 2 && (
          <div className="card scale-in" style={{ maxWidth: 600 }}>
            <div className="card-header"><h3 style={{ fontFamily: "var(--font-display)" }}>Select Property Areas</h3></div>
            <div className="card-body">
              <p style={{ fontSize: 14, color: "var(--filo-grey)", marginBottom: 20 }}>Which areas of the property need landscaping? Select all that apply.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {["Front Yard", "Back Yard", "Side Yard (Left)", "Side Yard (Right)"].map(area => {
                  const selected = project.areas.includes(area);
                  return (
                    <div key={area} onClick={() => updateProject({ areas: selected ? project.areas.filter(a => a !== area) : [...project.areas, area] })}
                      style={{
                        padding: 16, borderRadius: "var(--radius-sm)", cursor: "pointer",
                        border: `2px solid ${selected ? "var(--filo-green)" : "var(--filo-light)"}`,
                        background: selected ? "var(--filo-green-pale)" : "white",
                        display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s ease"
                      }}>
                      <span style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${selected ? "var(--filo-green)" : "var(--filo-light)"}`,
                        background: selected ? "var(--filo-green)" : "white", display: "flex", alignItems: "center", justifyContent: "center",
                        color: "white", fontSize: 14, fontWeight: 700 }}>
                        {selected && "✓"}
                      </span>
                      <span style={{ fontWeight: 500 }}>{area}</span>
                    </div>
                  );
                })}
              </div>
              {clientId && (
                <div style={{ marginTop: 16, padding: 12, background: "var(--filo-green-pale)", borderRadius: "var(--radius-sm)", fontSize: 12, color: "var(--filo-green)" }}>
                  Client created successfully. This step will create the project and property areas.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Photo Upload — REAL file upload */}
        {step === 3 && (
          <div className="card scale-in">
            <div className="card-header"><h3 style={{ fontFamily: "var(--font-display)" }}>Upload Photos</h3></div>
            <div className="card-body">
              {(project.areas.length > 0 ? project.areas : ["Front Yard"]).map(area => (
                <div key={area} style={{ marginBottom: 24 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>📸 {area}</h4>
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                    padding: 32, border: '2px dashed var(--filo-light)', borderRadius: 'var(--radius-sm)',
                    background: 'var(--filo-green-pale)',
                  }}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--filo-green)'; }}
                    onDragLeave={e => { e.currentTarget.style.borderColor = ''; }}
                    onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = ''; handleFileSelect(area, e.dataTransfer.files); }}
                  >
                    <button type="button" className="btn btn-primary" onClick={() => openFilePicker(area)}
                      style={{ fontSize: 16, padding: '12px 32px' }}>
                      📷 Select Photos
                    </button>
                    <span style={{ fontSize: 13, color: 'var(--filo-grey)' }}>JPG, PNG, HEIC up to 25MB each — or drag and drop</span>
                  </div>
                  {(selectedFiles[area]?.length > 0) && (
                    <div style={{ marginTop: 12 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--filo-green)' }}>
                        ✅ {selectedFiles[area].length} photo(s) ready to upload
                      </p>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {selectedFiles[area].map((file, idx) => (
                          <div key={idx} style={{
                            width: 100, height: 100, borderRadius: "var(--radius-sm)",
                            background: "var(--filo-slate)", overflow: "hidden",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 10, color: "white", fontWeight: 500, position: "relative"
                          }}>
                            <img src={URL.createObjectURL(file)} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onLoad={e => URL.revokeObjectURL(e.target.src)} />
                            <button onClick={() => removeFile(area, idx)}
                              style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.6)", border: "none", color: "white", borderRadius: "50%", width: 20, height: 20, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.6)", padding: "2px 4px", fontSize: 9, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                              {file.name}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button type="button" className="btn btn-secondary" onClick={() => openFilePicker(area)}
                        style={{ marginTop: 8, fontSize: 12 }}>+ Add More Photos</button>
                    </div>
                  )}
                </div>
              ))}
              <div style={{ padding: 16, background: "#FEF3C7", borderRadius: "var(--radius-sm)", fontSize: 13, color: "#92400E" }}>
                Photos upload to Supabase Storage and AI plant detection runs automatically on the server.
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Bed Preparation — Draw removals + Generate preview */}
        {step === 4 && (() => {
          const api = apiRef.current;
          const photoUrls = Object.values(uploadedPhotos || {}).flat().map(p => p?.file?.cdn_url || p?.cdn_url).filter(Boolean);
          const getDrawPoint = (e) => {
            const svg = e.currentTarget || e.target?.closest?.('svg');
            if (!svg) return null;
            const rect = svg.getBoundingClientRect();
            const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
            const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
            return { x: (clientX - rect.left) / rect.width * 1000, y: (clientY - rect.top) / rect.height * 1000 };
          };
          const startDraw = (e) => {
            if (!drawModeRef.current) return;
            if (e.type === 'touchstart') e.preventDefault();
            const pt = getDrawPoint(e);
            if (!pt) return;
            if (drawToolMode === 'polygon') {
              // Polygon mode: click to place points, click near first point to close
              if (polygonPoints.length >= 3) {
                const first = polygonPoints[0];
                if (Math.sqrt((pt.x - first.x) ** 2 + (pt.y - first.y) ** 2) < 30) {
                  setDrawPaths(prev => [...prev, { points: [...polygonPoints], type: 'remove' }]);
                  setPolygonPoints([]);
                  return;
                }
              }
              setPolygonPoints(prev => [...prev, pt]);
            } else {
              isDrawingRef.current = true;
              setIsDrawing(true);
              currentPathRef.current = [pt];
              setCurrentPath([pt]);
            }
          };
          const moveDraw = (e) => {
            if (drawToolMode !== 'freehand' || !isDrawingRef.current || !drawModeRef.current) return;
            if (e.type === 'touchmove') e.preventDefault();
            const pt = getDrawPoint(e);
            if (!pt) return;
            currentPathRef.current = [...currentPathRef.current, pt];
            setCurrentPath(currentPathRef.current);
          };
          const endDraw = () => {
            if (drawToolMode !== 'freehand') return;
            const finalPath = currentPathRef.current;
            if (finalPath.length > 3) setDrawPaths(prev => [...prev, { points: finalPath, type: 'remove' }]);
            isDrawingRef.current = false;
            setIsDrawing(false);
            currentPathRef.current = [];
            setCurrentPath([]);
          };

          // Mask generation for bed prep preview
          const getMaskDataUrl = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 1024; canvas.height = 1024;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 1024, 1024);
            ctx.fillStyle = '#000000';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 50;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            for (const rawPath of drawPaths) {
              const path = Array.isArray(rawPath) ? rawPath : (rawPath?.points || []);
              if (path.length < 2) continue;
              ctx.beginPath();
              ctx.moveTo(path[0].x * 1.024, path[0].y * 1.024);
              for (let i = 1; i < path.length; i++) {
                ctx.lineTo(path[i].x * 1.024, path[i].y * 1.024);
              }
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
            }
            return canvas.toDataURL('image/png');
          };

          const generateBedPrep = async () => {
            if (!api || generatingPreview || drawPaths.length === 0) return;
            setGeneratingPreview(true);
            try {
              const maskDataUrl = getMaskDataUrl();
              const result = await api.removalPreview.generate(
                photoUrls[0], [],
                'Remove plants from drawn areas. Show clean bed with fresh mulch. Keep everything else unchanged.',
                maskDataUrl
              );
              setRemovalPreview(result.previewUrl);
              removalPreviewRef.current = result.previewUrl;
              // NUCLEAR: Also store in localStorage — immune to React closure staleness
              try { localStorage.setItem('filo_removal_preview', result.previewUrl); } catch (e) {}
            } catch (err) {
              console.error('Bed prep generation failed:', err.message);
              alert('Bed prep generation failed: ' + err.message);
            } finally { setGeneratingPreview(false); }
          };

          // Bed edge drawing handlers
          const getBedEdgePoint = (e) => {
            const svg = e.currentTarget || e.target?.closest?.('svg');
            if (!svg) return null;
            const rect = svg.getBoundingClientRect();
            const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
            const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
            return { x: (clientX - rect.left) / rect.width * 1000, y: (clientY - rect.top) / rect.height * 1000 };
          };
          const startBedEdgeDraw = (e) => {
            if (e.type === 'touchstart') e.preventDefault();
            const pt = getBedEdgePoint(e);
            if (!pt) return;
            bedEdgeDrawingRef.current = true;
            setBedEdgeDrawing(true);
            bedEdgeCurrentPathRef.current = [pt];
            setBedEdgeCurrentPath([pt]);
          };
          const moveBedEdgeDraw = (e) => {
            if (!bedEdgeDrawingRef.current) return;
            if (e.type === 'touchmove') e.preventDefault();
            const pt = getBedEdgePoint(e);
            if (!pt) return;
            bedEdgeCurrentPathRef.current = [...bedEdgeCurrentPathRef.current, pt];
            setBedEdgeCurrentPath(bedEdgeCurrentPathRef.current);
          };
          const endBedEdgeDraw = () => {
            const finalPath = bedEdgeCurrentPathRef.current;
            if (finalPath.length > 3) setBedEdgePath(finalPath);
            bedEdgeDrawingRef.current = false;
            setBedEdgeDrawing(false);
            bedEdgeCurrentPathRef.current = [];
            setBedEdgeCurrentPath([]);
          };
          const getBedEdgeMaskDataUrl = () => {
            if (!bedEdgePath || bedEdgePath.length < 3) return null;
            const canvas = document.createElement('canvas');
            canvas.width = 1024; canvas.height = 1024;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 1024, 1024);
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.moveTo(bedEdgePath[0].x * 1.024, bedEdgePath[0].y * 1.024);
            for (let i = 1; i < bedEdgePath.length; i++) {
              ctx.lineTo(bedEdgePath[i].x * 1.024, bedEdgePath[i].y * 1.024);
            }
            ctx.closePath();
            ctx.fill();
            return canvas.toDataURL('image/png');
          };
          const generateBedEdge = async () => {
            if (!api || generatingBedEdge || bedEdgePath.length < 3) return;
            setGeneratingBedEdge(true);
            try {
              const maskDataUrl = getBedEdgeMaskDataUrl();
              // Use localStorage for removal preview (immune to stale closures)
              const lsRemoval = (() => { try { return localStorage.getItem('filo_removal_preview'); } catch(e) { return null; } })();
              const basePhoto = lsRemoval || removalPreview || photoUrls[0];
              console.log('[bed-edge-gen] Base photo source:', lsRemoval ? 'REMOVAL PREVIEW (localStorage)' : removalPreview ? 'REMOVAL PREVIEW (state)' : 'ORIGINAL PHOTO');
              if (!basePhoto) { alert('No photo available — upload a photo first'); setGeneratingBedEdge(false); return; }
              console.log('[bed-edge-gen] Calling API with mask:', !!maskDataUrl, 'style:', bedEdgeStyle);
              const result = await api.bedEdgePreview.generate(basePhoto, maskDataUrl, bedEdgeStyle, bedEdgeAdjustment);
              console.log('[bed-edge-gen] API returned, previewUrl length:', result?.previewUrl?.length || 0);
              if (!result?.previewUrl) throw new Error('No preview image returned from server');
              setBedEdgePreview(result.previewUrl);
              bedEdgePreviewRef.current = result.previewUrl;
              try { localStorage.setItem('filo_bed_edge_preview', result.previewUrl); } catch (e) { console.warn('[bed-edge-gen] localStorage save failed:', e.message); }
            } catch (err) {
              console.error('Bed edge generation failed:', err.message);
              alert('Bed edge generation failed: ' + err.message);
            } finally { setGeneratingBedEdge(false); }
          };

          return (
          <div className="scale-in">
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-header">
                <h3 style={{ fontFamily: "var(--font-display)" }}>Bed Preparation</h3>
                <p style={{ fontSize: 13, color: "var(--filo-grey)", margin: "4px 0 0" }}>
                  Remove unwanted plants, then define the bed edge shape.
                </p>
              </div>
              {/* Sub-step tabs */}
              <div style={{ display: "flex", borderBottom: "1px solid #E5E7EB" }}>
                <button onClick={() => setBedPrepSubStep('removal')}
                  style={{ flex: 1, padding: "12px 16px", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
                    background: bedPrepSubStep === 'removal' ? '#fff' : '#F9FAFB',
                    color: bedPrepSubStep === 'removal' ? '#DC2626' : 'var(--filo-grey)',
                    borderBottom: bedPrepSubStep === 'removal' ? '3px solid #DC2626' : '3px solid transparent' }}>
                  Step A: Plant Removal {removalPreview ? '✓' : ''}
                </button>
                <button onClick={() => setBedPrepSubStep('bedEdge')}
                  style={{ flex: 1, padding: "12px 16px", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
                    background: bedPrepSubStep === 'bedEdge' ? '#fff' : '#F9FAFB',
                    color: bedPrepSubStep === 'bedEdge' ? 'var(--filo-green)' : 'var(--filo-grey)',
                    borderBottom: bedPrepSubStep === 'bedEdge' ? '3px solid var(--filo-green)' : '3px solid transparent' }}>
                  Step B: Bed Edge {bedEdgePreview ? '✓' : ''}
                </button>
              </div>
              <div className="card-body">
                {photoUrls.length > 0 ? (
                  <>
                    {/* ═══ SUB-STEP A: Plant Removal ═══ */}
                    {bedPrepSubStep === 'removal' && (
                      <>
                        {/* Toolbar */}
                        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
                          <button className={`btn btn-sm ${drawMode === 'remove' ? '' : 'btn-ghost'}`}
                            style={drawMode === 'remove' ? { background: '#DC2626', color: '#fff', border: 'none', fontWeight: 600 } : { fontWeight: 600 }}
                            onClick={() => { const next = drawMode === 'remove' ? false : 'remove'; drawModeRef.current = next; setDrawMode(next); setPolygonPoints([]); }}>
                            {drawMode === 'remove' ? '🖌 Drawing — Circle plants to remove' : '🖌 Start Drawing'}
                          </button>
                          <div className="pill-group" style={{ marginLeft: 4 }}>
                            <span className={`pill ${drawToolMode === 'freehand' ? 'active' : ''}`}
                              onClick={() => { setDrawToolMode('freehand'); setPolygonPoints([]); }} style={{ fontSize: 11, padding: "3px 10px" }}>Freehand</span>
                            <span className={`pill ${drawToolMode === 'polygon' ? 'active' : ''}`}
                              onClick={() => { setDrawToolMode('polygon'); setPolygonPoints([]); }} style={{ fontSize: 11, padding: "3px 10px" }}>Polygon</span>
                          </div>
                          {polygonPoints.length > 0 && (
                            <button className="btn btn-sm btn-ghost" onClick={() => setPolygonPoints([])}>Undo Points</button>
                          )}
                          {drawPaths.length > 0 && (
                            <>
                              <button className="btn btn-sm btn-ghost" onClick={() => { setDrawPaths(prev => prev.slice(0, -1)); setRemovalPreview(null); removalPreviewRef.current = null; try { localStorage.removeItem('filo_removal_preview'); } catch(e){} }}>Undo</button>
                              <button className="btn btn-sm btn-ghost" style={{ color: '#DC2626' }} onClick={() => { setDrawPaths([]); setRemovalPreview(null); removalPreviewRef.current = null; try { localStorage.removeItem('filo_removal_preview'); } catch(e){} }}>Clear All</button>
                              <span style={{ fontSize: 12, color: 'var(--filo-grey)' }}>{drawPaths.length} area{drawPaths.length !== 1 ? 's' : ''} marked</span>
                            </>
                          )}
                          <div style={{ flex: 1 }} />
                          {drawPaths.length > 0 && !removalPreview && (
                            <button className="btn btn-sm" onClick={generateBedPrep} disabled={generatingPreview}
                              style={{ background: '#DC2626', color: '#fff', border: 'none', fontWeight: 600, padding: '8px 20px' }}>
                              {generatingPreview ? '⟳ Generating Preview...' : '✨ Generate Removal Preview'}
                            </button>
                          )}
                          {removalPreview && (
                            <button className="btn btn-sm" onClick={() => { setRemovalPreview(null); removalPreviewRef.current = null; try { localStorage.removeItem('filo_removal_preview'); } catch(e){} }} style={{ fontWeight: 600 }}>
                              ← Back to Draw
                            </button>
                          )}
                        </div>

                        {/* Preview result OR drawing canvas */}
                        {removalPreview ? (
                          <div style={{ position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: 12 }}>
                            <img src={removalPreview} alt="Bed Preparation Preview" style={{ width: "100%", display: "block" }} />
                            <div style={{ position: "absolute", top: 12, left: 12, background: "#DC2626", color: "#fff", padding: "4px 12px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                              PLANTS REMOVED
                            </div>
                            <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.6)", color: "#fff", padding: "4px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>FILO AI</div>
                            <button className="btn btn-sm" onClick={generateBedPrep} disabled={generatingPreview}
                              style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(0,0,0,0.7)", color: "#fff", border: "none", fontSize: 11 }}>
                              {generatingPreview ? "Regenerating..." : "Regenerate"}
                            </button>
                          </div>
                        ) : (
                          <>
                            {photoUrls.map((url, photoIdx) => (
                              <div key={photoIdx} style={{
                                position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: 12,
                                border: `2px solid ${drawMode === 'remove' ? '#DC2626' : '#E5E7EB'}`,
                                cursor: drawMode ? 'crosshair' : 'default', userSelect: "none",
                              }}>
                                <img src={url} alt="Property" style={{ width: "100%", display: "block", pointerEvents: "none" }} draggable={false} />
                                <svg
                                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 5 }}
                                  viewBox="0 0 1000 1000" preserveAspectRatio="none"
                                  onMouseDown={startDraw} onMouseMove={moveDraw} onMouseUp={endDraw} onMouseLeave={endDraw}
                                  onTouchStart={startDraw} onTouchMove={moveDraw} onTouchEnd={endDraw}
                                >
                                  {(drawPaths || []).map((path, i) => {
                                    const pts = path?.points || path;
                                    if (!Array.isArray(pts) || pts.length < 2) return null;
                                    return <polygon key={i} points={pts.map(p => `${p.x},${p.y}`).join(' ')}
                                      fill="rgba(220,38,38,0.3)" stroke="#DC2626" strokeWidth="3" strokeDasharray="8,4" />;
                                  })}
                                  {currentPath.length > 1 && drawToolMode === 'freehand' && (
                                    <polyline points={currentPath.map(p => `${p.x},${p.y}`).join(' ')}
                                      fill="none" stroke="#DC2626" strokeWidth="3" strokeDasharray="6,3" />
                                  )}
                                  {polygonPoints.length > 0 && drawToolMode === 'polygon' && drawMode === 'remove' && (
                                    <>
                                      <polyline points={polygonPoints.map(p => `${p.x},${p.y}`).join(' ')}
                                        fill={polygonPoints.length > 2 ? "rgba(220,38,38,0.15)" : "none"} stroke="#DC2626" strokeWidth="3" strokeDasharray="6,3" />
                                      {polygonPoints.map((p, i) => (
                                        <circle key={i} cx={p.x} cy={p.y} r={i === 0 ? 12 : 6}
                                          fill={i === 0 ? "#DC2626" : "#fff"} stroke="#DC2626" strokeWidth="2" />
                                      ))}
                                    </>
                                  )}
                                </svg>
                                {drawMode === 'remove' && (
                                  <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", background: "#DC2626", color: "#fff", padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, zIndex: 25, pointerEvents: "none" }}>
                                    {drawToolMode === 'polygon' ? 'Click to place points — click first point to close' : 'Draw around plants to remove'}
                                  </div>
                                )}
                                {!drawMode && drawPaths.length === 0 && (
                                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", zIndex: 3 }}>
                                    <div style={{ background: "rgba(0,0,0,0.75)", color: "#fff", padding: "12px 24px", borderRadius: 8, fontSize: 14, fontWeight: 600 }}>
                                      Click "Start Drawing" then circle the plants to remove
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </>
                        )}

                        {/* Removal cost */}
                        <div style={{ marginTop: 16 }}>
                          <label className="form-label">Removal & haul-away cost</label>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ fontSize: 14, fontWeight: 500 }}>$</span>
                            <input className="form-input" style={{ width: 120 }} value={removalCost}
                              onChange={e => setRemovalCost(e.target.value)} />
                            <span style={{ fontSize: 13, color: "var(--filo-grey)" }}>Includes haul away</span>
                          </div>
                        </div>

                        {removalPreview && (
                          <div style={{ marginTop: 16, padding: 16, background: "var(--filo-green-pale)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--filo-green)" }}>
                            ✅ Plants removed. Switch to "Step B: Bed Edge" to define the bed shape, or click "Save & Continue" to proceed.
                          </div>
                        )}
                        {!removalPreview && drawPaths.length === 0 && (
                          <div style={{ marginTop: 16, padding: 12, background: "#F9FAFB", borderRadius: "var(--radius-sm)", fontSize: 12, color: "var(--filo-grey)" }}>
                            No plants to remove? Skip to <button onClick={() => setBedPrepSubStep('bedEdge')} style={{ background: "none", border: "none", color: "var(--filo-green)", fontWeight: 600, cursor: "pointer", textDecoration: "underline", fontSize: 12, padding: 0 }}>Bed Edge</button> or click "Save & Continue".
                          </div>
                        )}
                      </>
                    )}

                    {/* ═══ SUB-STEP B: Bed Edge ═══ */}
                    {bedPrepSubStep === 'bedEdge' && (
                      <>
                        {/* Edge style option */}
                        <div style={{ marginBottom: 16 }}>
                          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--filo-charcoal)", display: "block", marginBottom: 4 }}>Edge Style</label>
                          <div className="pill-group">
                            <span className={`pill ${bedEdgeStyle === 'rounded' ? 'active' : ''}`}
                              onClick={() => setBedEdgeStyle('rounded')} style={{ fontSize: 12, padding: "4px 12px" }}>Rounded / Curved</span>
                            <span className={`pill ${bedEdgeStyle === 'square' ? 'active' : ''}`}
                              onClick={() => setBedEdgeStyle('square')} style={{ fontSize: 12, padding: "4px 12px" }}>Square 90°</span>
                          </div>
                        </div>

                        {/* Draw mode toggle */}
                        <div style={{ marginBottom: 12 }}>
                          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--filo-charcoal)", display: "block", marginBottom: 4 }}>Draw Mode</label>
                          <div className="pill-group">
                            <span className={`pill ${drawToolMode === 'freehand' ? 'active' : ''}`}
                              onClick={() => { setDrawToolMode('freehand'); setPolygonPoints([]); }} style={{ fontSize: 12, padding: "4px 12px" }}>Freehand</span>
                            <span className={`pill ${drawToolMode === 'polygon' ? 'active' : ''}`}
                              onClick={() => { setDrawToolMode('polygon'); setPolygonPoints([]); }} style={{ fontSize: 12, padding: "4px 12px" }}>Polygon</span>
                          </div>
                        </div>

                        {/* Generate button — always available (drawing is optional) */}
                        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
                          {bedEdgePath.length > 0 && (
                            <>
                              <span style={{ fontSize: 12, fontWeight: 600, color: "#E97316" }}>✓ Bed edge drawn</span>
                              <button className="btn btn-sm btn-ghost" onClick={() => { setBedEdgePath([]); setBedEdgePreview(null); bedEdgePreviewRef.current = null; try { localStorage.removeItem('filo_bed_edge_preview'); } catch(e){} }}>
                                Clear & Redraw
                              </button>
                            </>
                          )}
                          {bedEdgePath.length === 0 && !bedEdgeDrawing && (
                            <span style={{ fontSize: 12, color: "var(--filo-grey)" }}>
                              Draw the bed perimeter below, then generate
                            </span>
                          )}
                          <div style={{ flex: 1 }} />
                          {bedEdgePath.length > 3 && !bedEdgePreview && (
                            <button className="btn btn-sm" onClick={generateBedEdge} disabled={generatingBedEdge}
                              style={{ background: 'var(--filo-green)', color: '#fff', border: 'none', fontWeight: 600, padding: '8px 20px' }}>
                              {generatingBedEdge ? '⟳ Generating...' : '✨ Update Bed Edge'}
                            </button>
                          )}
                          {bedEdgePreview && (
                            <>
                              <button className="btn btn-sm" onClick={() => { setBedEdgePreview(null); bedEdgePreviewRef.current = null; try { localStorage.removeItem('filo_bed_edge_preview'); } catch(e){} }} style={{ fontWeight: 600 }}>
                                ← Back to Draw
                              </button>
                              <button className="btn btn-sm" onClick={generateBedEdge} disabled={generatingBedEdge}
                                style={{ background: 'var(--filo-green)', color: '#fff', border: 'none', fontWeight: 600, padding: '8px 16px' }}>
                                {generatingBedEdge ? '⟳ Regenerating...' : '⟳ Regenerate'}
                              </button>
                            </>
                          )}
                        </div>

                        {/* Bed edge preview result OR drawing canvas */}
                        {bedEdgePreview ? (
                          <div style={{ position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: 12 }}>
                            <img src={bedEdgePreview} alt="Bed Edge Preview" style={{ width: "100%", display: "block" }} />
                            <div style={{ position: "absolute", top: 12, left: 12, background: "var(--filo-green)", color: "#fff", padding: "4px 12px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                              BED EDGE {bedEdgeStyle === 'square' ? '90°' : 'CURVED'}{bedEdgeAdjustment !== 0 ? ` · ${bedEdgeAdjustment > 0 ? '+' : ''}${bedEdgeAdjustment} ft` : ''}
                            </div>
                            <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.6)", color: "#fff", padding: "4px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>FILO AI</div>
                          </div>
                        ) : (
                          <div style={{
                            position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: 12,
                            border: '2px solid #E97316', cursor: 'crosshair', userSelect: "none",
                          }}>
                            <img src={removalPreview || photoUrls[0]} alt="Property" style={{ width: "100%", display: "block", pointerEvents: "none" }} draggable={false} />
                            <svg
                              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 5 }}
                              viewBox="0 0 1000 1000" preserveAspectRatio="none"
                              onMouseDown={(e) => {
                                if (drawToolMode === 'polygon') {
                                  const pt = getBedEdgePoint(e);
                                  if (!pt) return;
                                  // If clicking near first point and we have 3+, close polygon
                                  if (polygonPoints.length >= 3) {
                                    const first = polygonPoints[0];
                                    const dist = Math.sqrt((pt.x - first.x) ** 2 + (pt.y - first.y) ** 2);
                                    if (dist < 30) {
                                      setBedEdgePath([...polygonPoints]);
                                      setPolygonPoints([]);
                                      return;
                                    }
                                  }
                                  setPolygonPoints(prev => [...prev, pt]);
                                } else {
                                  startBedEdgeDraw(e);
                                }
                              }}
                              onMouseMove={drawToolMode === 'freehand' ? moveBedEdgeDraw : undefined}
                              onMouseUp={drawToolMode === 'freehand' ? endBedEdgeDraw : undefined}
                              onMouseLeave={drawToolMode === 'freehand' ? endBedEdgeDraw : undefined}
                              onTouchStart={(e) => {
                                if (drawToolMode === 'polygon') {
                                  e.preventDefault();
                                  const pt = getBedEdgePoint(e);
                                  if (!pt) return;
                                  if (polygonPoints.length >= 3) {
                                    const first = polygonPoints[0];
                                    const dist = Math.sqrt((pt.x - first.x) ** 2 + (pt.y - first.y) ** 2);
                                    if (dist < 30) {
                                      setBedEdgePath([...polygonPoints]);
                                      setPolygonPoints([]);
                                      return;
                                    }
                                  }
                                  setPolygonPoints(prev => [...prev, pt]);
                                } else {
                                  startBedEdgeDraw(e);
                                }
                              }}
                              onTouchMove={drawToolMode === 'freehand' ? moveBedEdgeDraw : undefined}
                              onTouchEnd={drawToolMode === 'freehand' ? endBedEdgeDraw : undefined}
                            >
                              {bedEdgePath.length > 2 && (
                                <polygon points={bedEdgePath.map(p => `${p.x},${p.y}`).join(' ')}
                                  fill="rgba(233,115,22,0.15)" stroke="#E97316" strokeWidth="3" />
                              )}
                              {bedEdgeCurrentPath.length > 1 && drawToolMode === 'freehand' && (
                                <polyline points={bedEdgeCurrentPath.map(p => `${p.x},${p.y}`).join(' ')}
                                  fill="none" stroke="#E97316" strokeWidth="3" />
                              )}
                              {/* Polygon mode: show points and connecting lines */}
                              {polygonPoints.length > 0 && drawToolMode === 'polygon' && bedEdgePath.length === 0 && (
                                <>
                                  <polyline points={polygonPoints.map(p => `${p.x},${p.y}`).join(' ')}
                                    fill={polygonPoints.length > 2 ? "rgba(233,115,22,0.1)" : "none"} stroke="#E97316" strokeWidth="3" />
                                  {polygonPoints.map((p, i) => (
                                    <circle key={i} cx={p.x} cy={p.y} r={i === 0 ? 12 : 6}
                                      fill={i === 0 ? "#E97316" : "#fff"} stroke="#E97316" strokeWidth="2" />
                                  ))}
                                </>
                              )}
                            </svg>
                            {bedEdgePath.length === 0 && !bedEdgeDrawing && polygonPoints.length === 0 && (
                              <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", background: "#E97316", color: "#fff", padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, zIndex: 25, pointerEvents: "none" }}>
                                {drawToolMode === 'polygon' ? 'Click to place points — click first point to close' : 'Draw around the full bed perimeter'}
                              </div>
                            )}
                          </div>
                        )}

                        {bedEdgePreview && (
                          <div style={{ marginTop: 16, padding: 16, background: "var(--filo-green-pale)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--filo-green)" }}>
                            ✅ Bed edge defined. Click "Save & Continue" to set your design preferences.
                          </div>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: 40, color: "var(--filo-grey)" }}>
                    <p>No photos uploaded. Go back to Photo Upload to add property photos.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          );
        })()}

        {/* Step 5: AI Design — bed prep image + design mode selector + preferences + render */}
        {step === 5 && (() => {
          const LAYER_COLORS = { back: '#2E7D32', middle: '#66BB6A', front: '#A5D6A7' };
          const LAYER_LABELS = { back: 'Back Row — Foundation', middle: 'Middle Row — Color & Texture', front: 'Front Row — Border & Groundcover' };
          const backPlants = designPlants.filter(p => (p.layer || p.notes || '').toLowerCase().includes('back'));
          const middlePlants = designPlants.filter(p => (p.layer || p.notes || '').toLowerCase().includes('middle'));
          const frontPlants = designPlants.filter(p => (p.layer || p.notes || '').toLowerCase().includes('front'));
          const ungrouped = designPlants.filter(p => !['back','middle','front'].some(l => (p.layer || p.notes || '').toLowerCase().includes(l)));
          const layerGroups = [
            ...(backPlants.length ? [{ key:'back', plants: backPlants }] : []),
            ...(middlePlants.length ? [{ key:'middle', plants: middlePlants }] : []),
            ...(frontPlants.length ? [{ key:'front', plants: frontPlants }] : []),
            ...(ungrouped.length && (backPlants.length || middlePlants.length || frontPlants.length) ? [{ key:'other', plants: ungrouped }] : []),
          ];
          const allGrouped = layerGroups.length > 0;
          const photoUrls = Object.values(uploadedPhotos).flat().map(p => p?.file?.cdn_url || p?.cdn_url).filter(Boolean);
          const narrative = design?.narrative || design?.ai_prompt?.narrative || '';

          return (
          <div className="scale-in">
            {/* Bed Prep Image + Plant Placement Pins */}
            {(() => {
              const prepImage = bedEdgePreview || removalPreview;
              const prepLabel = bedEdgePreview ? 'BED EDGE UPDATED — READY FOR DESIGN'
                : removalPreview ? 'PLANTS REMOVED — READY FOR DESIGN' : null;
              const displayImage = prepImage || (photoUrls.length > 0 ? photoUrls[0] : null);
              return (
                <div className="card" style={{ marginBottom: 24 }}>
                  <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Prepared Bed</h3>
                    {displayImage && (
                      <button className={`btn btn-sm ${placingPin ? '' : 'btn-ghost'}`}
                        style={placingPin ? { background: '#7C3AED', color: '#fff', border: 'none', fontWeight: 600 } : { fontWeight: 600 }}
                        onClick={() => setPlacingPin(!placingPin)}>
                        {placingPin ? '📌 Click Photo to Place Pin' : '📌 Mark Plant Locations'}
                      </button>
                    )}
                  </div>
                  <div className="card-body">
                    {displayImage ? (
                      <div style={{ position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden", cursor: placingPin ? 'crosshair' : 'default' }}
                        onClick={(e) => {
                          if (!placingPin) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = ((e.clientX - rect.left) / rect.width) * 100;
                          const y = ((e.clientY - rect.top) / rect.height) * 100;
                          const newPin = { x, y, request: '' };
                          setPlantPins(prev => [...prev, newPin]);
                          setEditingPinIdx(plantPins.length);
                          setPlacingPin(false);
                        }}>
                        <img src={displayImage} alt="Prepared Bed" style={{ width: "100%", display: "block", pointerEvents: "none" }} draggable={false} />
                        {prepLabel && (
                          <div style={{ position: "absolute", top: 12, left: 12, background: "var(--filo-green)", color: "#fff", padding: "4px 12px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{prepLabel}</div>
                        )}
                        {!prepImage && photoUrls.length > 0 && (
                          <div style={{ position: "absolute", top: 12, left: 12, background: "var(--filo-silver)", color: "#fff", padding: "4px 12px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>ORIGINAL PHOTO</div>
                        )}
                        {/* Render plant placement pins */}
                        {plantPins.map((pin, i) => (
                          <div key={i} style={{ position: "absolute", left: `${pin.x}%`, top: `${pin.y}%`, transform: "translate(-50%, -100%)", zIndex: 10, pointerEvents: "auto", cursor: "pointer" }}
                            onClick={(e) => { e.stopPropagation(); setEditingPinIdx(editingPinIdx === i ? null : i); }}>
                            <div style={{ position: "relative" }}>
                              <div style={{ fontSize: 28, lineHeight: 1, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>📌</div>
                              <div style={{ position: "absolute", top: -4, right: -8, background: "#7C3AED", color: "#fff", width: 18, height: 18, borderRadius: "50%", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>
                                {i + 1}
                              </div>
                            </div>
                            {pin.request && editingPinIdx !== i && (
                              <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", background: "rgba(124,58,237,0.9)", color: "#fff", padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600, whiteSpace: "nowrap", marginTop: 2, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>
                                {pin.request}
                              </div>
                            )}
                          </div>
                        ))}
                        {placingPin && plantPins.length === 0 && (
                          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "rgba(124,58,237,0.85)", color: "#fff", padding: "12px 24px", borderRadius: 8, fontSize: 14, fontWeight: 600, pointerEvents: "none" }}>
                            Tap where you want a specific plant
                          </div>
                        )}
                      </div>
                    ) : (
                      <p style={{ color: "var(--filo-grey)", fontSize: 14 }}>No photo available. Go back to Step 3 to upload a property photo.</p>
                    )}

                    {/* Pin editing form */}
                    {editingPinIdx !== null && plantPins[editingPinIdx] && (
                      <div style={{ marginTop: 12, padding: 12, background: "#F5F3FF", borderRadius: "var(--radius-sm)", border: "1px solid #DDD6FE" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <div style={{ background: "#7C3AED", color: "#fff", width: 22, height: 22, borderRadius: "50%", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {editingPinIdx + 1}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#5B21B6" }}>Plant Request — Pin {editingPinIdx + 1}</span>
                          <button className="btn btn-sm btn-ghost" style={{ marginLeft: "auto", fontSize: 11, color: "#DC2626" }}
                            onClick={() => {
                              setPlantPins(prev => prev.filter((_, j) => j !== editingPinIdx));
                              setEditingPinIdx(null);
                            }}>Remove Pin</button>
                        </div>
                        <input className="form-input" autoFocus
                          placeholder="e.g. Red Knockout Roses, Japanese Maple, Dwarf Yaupon Holly..."
                          value={plantPins[editingPinIdx]?.request || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setPlantPins(prev => prev.map((p, j) => j === editingPinIdx ? { ...p, request: val } : p));
                          }}
                          onKeyDown={e => { if (e.key === 'Enter') setEditingPinIdx(null); }}
                          style={{ fontSize: 13, marginBottom: 8 }} />
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn btn-sm" style={{ background: "#7C3AED", color: "#fff", border: "none", fontWeight: 600, fontSize: 12 }}
                            onClick={() => setEditingPinIdx(null)}>Done</button>
                          <button className="btn btn-sm btn-ghost" style={{ fontSize: 12 }}
                            onClick={() => setPlacingPin(true)}>📌 Add Another Pin</button>
                        </div>
                      </div>
                    )}

                    {/* Pin summary list */}
                    {plantPins.length > 0 && editingPinIdx === null && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#5B21B6" }}>Plant Placement Requests ({plantPins.length})</span>
                          <button className="btn btn-sm btn-ghost" style={{ fontSize: 11, marginLeft: "auto" }}
                            onClick={() => { setPlantPins([]); }}>Clear All</button>
                        </div>
                        {plantPins.map((pin, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderBottom: "1px solid #EDE9FE" }}>
                            <div style={{ background: "#7C3AED", color: "#fff", width: 20, height: 20, borderRadius: "50%", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              {i + 1}
                            </div>
                            <span style={{ fontSize: 12, color: pin.request ? "var(--filo-slate)" : "var(--filo-grey)", fontStyle: pin.request ? "normal" : "italic", flex: 1 }}>
                              {pin.request || 'No plant specified — click to edit'}
                            </span>
                            <button className="btn btn-sm btn-ghost" style={{ fontSize: 10, padding: "2px 6px" }}
                              onClick={() => setEditingPinIdx(i)}>Edit</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Design Preferences (inline) */}
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-header"><h3 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Design Preferences</h3></div>
              <div className="card-body">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: 12 }}>Sun Exposure</label>
                    <div className="pill-group">
                      {["Full Sun", "Partial Shade", "Full Shade"].map(opt => (
                        <span key={opt} className={cn("pill", project.sun === opt && "active")}
                          onClick={() => updateProject({ sun: opt })} style={{ fontSize: 12, padding: "4px 10px" }}>{opt}</span>
                      ))}
                    </div>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: 12 }}>Design Style</label>
                    <div className="pill-group">
                      {["Formal", "Naturalistic", "Modern", "Tropical", "Xeriscape", "Mediterranean", "Cottage", "Desert", "Farmhouse", "Transitional"].map(opt => (
                        <span key={opt} className={cn("pill", project.style === opt && "active")}
                          onClick={() => updateProject({ style: opt })} style={{ fontSize: 12, padding: "4px 10px" }}>{opt}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="form-group" style={{ margin: 0, marginBottom: 16 }}>
                  <label className="form-label" style={{ fontSize: 12 }}>Specific Plant Requests</label>
                  {/* Saved Prompts dropdown */}
                  {savedPromptsList.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <select className="form-input" style={{ fontSize: 12, padding: "6px 10px" }}
                        value="" onChange={e => {
                          if (e.target.value) {
                            const sp = savedPromptsList.find(p => String(p.id) === e.target.value);
                            if (sp) updateProject({ specialRequests: (project.specialRequests ? project.specialRequests + '\n' : '') + sp.prompt });
                          }
                        }}>
                        <option value="">📋 Insert saved prompt...</option>
                        {savedPromptsList.map(sp => (
                          <option key={sp.id} value={sp.id}>{sp.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <textarea className="form-input" placeholder="e.g. I want red knockout roses along the walkway, hydrangeas by the front door..."
                    value={project.specialRequests} onChange={e => updateProject({ specialRequests: e.target.value })}
                    style={{ minHeight: 60, fontSize: 13 }} />
                  {/* Save current prompt / manage prompts */}
                  <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
                    {!showSavePromptForm ? (
                      <button className="btn btn-sm btn-ghost" style={{ fontSize: 11 }}
                        onClick={() => { setShowSavePromptForm(true); setNewPromptName(''); }}
                        disabled={!project.specialRequests?.trim()}>
                        💾 Save as Prompt
                      </button>
                    ) : (
                      <>
                        <input className="form-input" placeholder="Prompt name..." value={newPromptName}
                          onChange={e => setNewPromptName(e.target.value)}
                          style={{ fontSize: 12, padding: "4px 8px", width: 180 }} />
                        <button className="btn btn-sm" style={{ fontSize: 11, background: 'var(--filo-green)', color: '#fff', border: 'none' }}
                          disabled={!newPromptName.trim()}
                          onClick={async () => {
                            try {
                              const api = apiRef.current;
                              const saved = await api.savedPrompts.create(newPromptName.trim(), project.specialRequests.trim());
                              setSavedPromptsList(prev => [saved, ...prev]);
                              setShowSavePromptForm(false);
                              setNewPromptName('');
                            } catch (err) { alert('Failed to save prompt: ' + err.message); }
                          }}>Save</button>
                        <button className="btn btn-sm btn-ghost" style={{ fontSize: 11 }}
                          onClick={() => setShowSavePromptForm(false)}>Cancel</button>
                      </>
                    )}
                    {savedPromptsList.length > 0 && (
                      <span style={{ fontSize: 11, color: "var(--filo-grey)", marginLeft: "auto" }}>
                        {savedPromptsList.length} saved prompt{savedPromptsList.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                {/* Generate AI Design button */}
                {!design && !loading && (
                  <button className="btn btn-primary" style={{ width: "100%", fontWeight: 700, padding: "12px 24px" }}
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const api = apiRef.current;
                        if (projectId) {
                          // Combine text requests + pin-based placement requests
                          let fullRequests = project.specialRequests || '';
                          if (plantPins.length > 0) {
                            const pinDescriptions = plantPins
                              .filter(p => p.request?.trim())
                              .map((p, i) => `PIN ${i + 1} (at ${Math.round(p.x)}% from left, ${Math.round(p.y)}% from top): ${p.request.trim()}`)
                              .join('\n');
                            if (pinDescriptions) {
                              fullRequests = fullRequests ? fullRequests + '\n\nSPECIFIC PLANT PLACEMENT REQUESTS:\n' + pinDescriptions : 'SPECIFIC PLANT PLACEMENT REQUESTS:\n' + pinDescriptions;
                            }
                          }
                          await api.projects.update(projectId, {
                            sun_exposure: project.sun,
                            design_style: project.style,
                            special_requests: fullRequests,
                            lighting_requested: project.lighting,
                            hardscape_changes: project.hardscape,
                          });
                          await api.projects.updateStatus(projectId, 'design_generation');
                          const designResult = await api.projects.generateDesign(projectId, {});
                          const d = designResult.design || designResult;
                          setDesign(d);
                          const plants = designResult.plants || d?.plants || [];
                          let finalPlants = plants;
                          if (finalPlants.length === 0 && d?.design_data) {
                            try {
                              const dd = typeof d.design_data === 'string' ? JSON.parse(d.design_data) : d.design_data;
                              finalPlants = dd.plants || [];
                            } catch (e) {}
                          }
                          setDesignPlants(finalPlants);
                          // Auto-trigger visual render after plant list is ready
                          if (finalPlants.length > 0) {
                            const photoUrls = Object.values(uploadedPhotos || {}).flat().map(p => p?.file?.cdn_url || p?.cdn_url).filter(Boolean);
                            if (photoUrls.length > 0) {
                              // Read most-processed preview from localStorage
                              const lsBedEdge = (() => { try { return localStorage.getItem('filo_bed_edge_preview'); } catch(e) { return null; } })();
                              const lsRemoval = (() => { try { return localStorage.getItem('filo_removal_preview'); } catch(e) { return null; } })();
                              const photoToUse = lsBedEdge || lsRemoval || photoUrls[0];
                              console.log('[step5-btn-render] Using:', lsBedEdge ? 'BED EDGE PREVIEW' : lsRemoval ? 'REMOVAL PREVIEW' : 'ORIGINAL PHOTO');
                              setGeneratingRender(true);
                              api.designRender.generate(
                                photoToUse, finalPlants,
                                detectedPlants.filter(p => plantMarks[p.id] !== 'remove'),
                                detectedPlants.filter(p => plantMarks[p.id] === 'remove'),
                                project.style || 'naturalistic',
                                d?.narrative || d?.design_notes || '',
                                null,
                                plantPins.filter(p => p.request?.trim())
                              ).then(result => {
                                setDesignRenderUrl(result.renderUrl);
                              }).catch(err => {
                                console.error('Auto design render failed:', err.message);
                              }).finally(() => { setGeneratingRender(false); });
                            }
                          }
                        }
                      } catch (e) {
                        alert('Design generation failed: ' + e.message);
                      } finally { setLoading(false); }
                    }}>
                    {loading ? '⟳ Generating AI Design...' : '✨ Generate AI Design'}
                  </button>
                )}
                {design && (
                  <div style={{ padding: 12, background: "var(--filo-green-pale)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--filo-green)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>✓</span>
                    <span>AI Design complete — {designPlants.reduce((sum, p) => sum + (p.quantity || 1), 0)} plants selected ({designPlants.length} species). {design?.narrative ? design.narrative.substring(0, 120) + '...' : ''}</span>
                  </div>
                )}
              </div>
            </div>

            {/* AI-Generated Final Design Visualization */}
            {photoUrls.length > 0 && designPlants.length > 0 && (() => {
              const api = apiRef.current;
              const totalPlantCount = designPlants.reduce((sum, p) => sum + (p.quantity || 1), 0);
              const removedPlantsList = detectedPlants.filter(p => plantMarks[p.id] === 'remove');
              const keptPlantsList = detectedPlants.filter(p => plantMarks[p.id] !== 'remove');

              // Build mask from drawPaths (carried from step 4)
              const getMaskFromDrawPaths = () => {
                if (!drawPaths || drawPaths.length === 0) return null;
                const canvas = document.createElement('canvas');
                canvas.width = 1024; canvas.height = 1024;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, 1024, 1024);
                ctx.fillStyle = '#000000';
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 50;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                for (const rawPath of drawPaths) {
                  const path = Array.isArray(rawPath) ? rawPath : (rawPath?.points || []);
                  if (path.length < 2) continue;
                  ctx.beginPath();
                  ctx.moveTo(path[0].x * 1.024, path[0].y * 1.024);
                  for (let i = 1; i < path.length; i++) {
                    ctx.lineTo(path[i].x * 1.024, path[i].y * 1.024);
                  }
                  ctx.closePath();
                  ctx.fill();
                  ctx.stroke();
                }
                return canvas.toDataURL('image/png');
              };

              const generateFinalDesign = async () => {
                if (!api || generatingRender) return;
                setGeneratingRender(true);
                // Read most-processed preview — bed edge > removal > original
                const lsBedEdge = (() => { try { return localStorage.getItem('filo_bed_edge_preview'); } catch(e) { return null; } })();
                const lsRemoval = (() => { try { return localStorage.getItem('filo_removal_preview'); } catch(e) { return null; } })();
                const photoToSend = lsBedEdge || lsRemoval || bedEdgePreviewRef.current || removalPreviewRef.current || photoUrls[0];
                console.log('[generateFinalDesign] Using:', lsBedEdge ? 'BED EDGE' : lsRemoval ? 'REMOVAL' : 'ORIGINAL PHOTO');
                try {
                  const maskDataUrl = getMaskFromDrawPaths();
                  const result = await api.designRender.generate(
                    photoToSend,
                    designPlants,
                    keptPlantsList,
                    removedPlantsList,
                    project.style || 'naturalistic',
                    design?.narrative || design?.design_notes || '',
                    maskDataUrl,
                    plantPins.filter(p => p.request?.trim())
                  );
                  setDesignRenderUrl(result.renderUrl);
                } catch (err) {
                  console.error('Design render failed:', err.message);
                  alert('Design render failed: ' + err.message);
                } finally { setGeneratingRender(false); }
              };

              return (
              <>
                {/* Final Design — new plants installed */}
                <div className="card" style={{ marginBottom: 24 }}>
                  <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Final Design Installed</h3>
                    <button className="btn btn-primary btn-sm" onClick={generateFinalDesign} disabled={generatingRender}
                      style={{ fontWeight: 600 }}>
                      {generatingRender ? '⟳ Rendering Design...' : designRenderUrl ? '⟳ Regenerate Render' : '✨ Generate Design Render'}
                    </button>
                  </div>
                  <div className="card-body">
                    {generatingRender ? (
                      <div style={{ position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                        <img src={photoUrls[0]} alt="Property" style={{ width: "100%", display: "block", filter: "brightness(0.7) blur(2px)" }} />
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
                          <div style={{ width: 48, height: 48, border: "4px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                          <span style={{ color: "#fff", fontSize: 16, fontWeight: 700, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>Rendering AI Design...</span>
                          <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>Gemini AI is painting {totalPlantCount} plants onto your property</span>
                        </div>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                      </div>
                    ) : designRenderUrl ? (
                      <div style={{ position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                        <img src={designRenderUrl} alt="Final Design Render"
                          style={{ width: "100%", display: "block", borderRadius: "var(--radius-md)", cursor: 'crosshair' }}
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = ((e.clientX - rect.left) / rect.width) * 100;
                            const y = ((e.clientY - rect.top) / rect.height) * 100;
                            setAdjustPin({ x, y });
                            setAdjustPrompt('');
                          }}
                        />
                        {/* Pin marker + radius circle */}
                        {adjustPin && (
                          <>
                            <div style={{ position: "absolute", left: `${adjustPin.x}%`, top: `${adjustPin.y}%`, transform: "translate(-50%, -100%)", pointerEvents: "none", zIndex: 10 }}>
                              <div style={{ fontSize: 28, lineHeight: 1, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>📌</div>
                            </div>
                            <div style={{ position: "absolute", left: `${adjustPin.x}%`, top: `${adjustPin.y}%`, transform: "translate(-50%, -50%)", width: `${adjustRadius * 2}%`, height: `${adjustRadius * 2}%`, border: "2px dashed rgba(255,255,255,0.7)", borderRadius: "50%", pointerEvents: "none", zIndex: 9, boxShadow: "0 0 0 1px rgba(0,0,0,0.3)" }} />
                          </>
                        )}
                        <div style={{ position: "absolute", top: 12, left: 12, background: "var(--filo-green)", color: "#fff", padding: "4px 12px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                          FINAL DESIGN — {totalPlantCount} new plants installed
                        </div>
                        <div style={{ position: "absolute", top: 12, right: 12, background: adjustPin ? "rgba(59,130,246,0.85)" : "rgba(0,0,0,0.6)", color: "#fff", padding: "4px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                          {adjustPin ? 'PIN PLACED — Describe change below' : 'TAP IMAGE TO ADJUST'}
                        </div>
                        <button className="btn btn-sm btn-ghost" onClick={() => { setDesignRenderUrl(null); setAdjustPin(null); }}
                          style={{ position: "absolute", bottom: 12, left: 12, background: "rgba(0,0,0,0.7)", color: "#fff", border: "none", fontSize: 11 }}>← Redo</button>
                        <button className="btn btn-sm btn-ghost" onClick={generateFinalDesign} disabled={generatingRender}
                          style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(0,0,0,0.7)", color: "#fff", border: "none", fontSize: 11 }}>
                          {generatingRender ? "Regenerating..." : "Regenerate"}
                        </button>
                      </div>
                    ) : (
                      <div style={{ position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                        <img src={photoUrls[0]} alt="Property" style={{ width: "100%", display: "block", filter: "brightness(0.7) saturate(0.4)" }} />
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>AI render not yet generated</span>
                          <button className="btn btn-primary" onClick={generateFinalDesign} disabled={generatingRender}
                            style={{ fontWeight: 700, padding: "12px 32px", fontSize: 15, boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
                            ✨ Generate AI Design Render
                          </button>
                          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>Uses Gemini AI to paint {totalPlantCount} plants onto your property photo</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Design Adjustments — always visible when render exists */}
                {designRenderUrl && (
                  <div className="card" style={{ marginBottom: 24 }}>
                    <div className="card-header"><h3 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Design Adjustments</h3></div>
                    <div className="card-body">
                      {!adjustPin ? (
                        <p style={{ color: "var(--filo-grey)", fontSize: 14, margin: 0 }}>
                          Tap anywhere on the design above to drop a pin, then describe what you want changed.
                          <br /><span style={{ fontSize: 12 }}>Examples: "Change mulch to blackstar gravel" · "Change mulch to black mulch" · "Replace these shrubs with knockout roses" · "Add a stone border here"</span>
                        </p>
                      ) : (
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                            <span style={{ fontSize: 20 }}>📌</span>
                            <span style={{ fontSize: 13, color: "var(--filo-grey)" }}>
                              Pin placed — tap image to reposition
                            </span>
                            <button className="btn btn-sm btn-ghost" onClick={() => { setAdjustPin(null); setAdjustPrompt(''); }}
                              style={{ marginLeft: "auto", fontSize: 11, color: "var(--filo-grey)" }}>Clear pin</button>
                          </div>
                          {/* Adjustment area size */}
                          <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--filo-grey)", display: "block", marginBottom: 6 }}>Adjustment Area Size</label>
                            <div className="pill-group">
                              {[
                                { value: 5, label: 'XS' },
                                { value: 10, label: 'S' },
                                { value: 15, label: 'M' },
                                { value: 25, label: 'L' },
                                { value: 40, label: 'XL' },
                                { value: 50, label: 'Full' },
                              ].map(opt => (
                                <span key={opt.value} className={cn("pill", adjustRadius === opt.value && "active")}
                                  onClick={() => setAdjustRadius(opt.value)}
                                  style={{ fontSize: 12, padding: "4px 12px", cursor: "pointer" }}>
                                  {opt.label}
                                </span>
                              ))}
                            </div>
                          </div>
                          <textarea className="form-input" placeholder="Describe the change... e.g. 'Change mulch to blackstar gravel', 'Replace with knockout roses', 'Add landscape lighting here'"
                            value={adjustPrompt} onChange={e => setAdjustPrompt(e.target.value)}
                            style={{ minHeight: 60, fontSize: 13, marginBottom: 12 }} />
                          <button className="btn btn-primary" disabled={!adjustPrompt.trim() || adjusting}
                            onClick={async () => {
                              setAdjusting(true);
                              try {
                                const api = apiRef.current;
                                const result = await api.designAdjust.apply(designRenderUrl, adjustPin.x, adjustPin.y, adjustRadius, adjustPrompt);
                                setDesignRenderUrl(result.renderUrl);
                                setAdjustPin(null);
                                setAdjustPrompt('');
                              } catch (err) {
                                console.error('Design adjustment failed:', err.message);
                                alert('Adjustment failed: ' + err.message);
                              } finally { setAdjusting(false); }
                            }}
                            style={{ width: "100%", fontWeight: 700, padding: "12px 24px" }}>
                            {adjusting ? '⟳ Applying Adjustment...' : '✨ Apply Adjustment'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Night Mode — landscape lighting visualization */}
                {designRenderUrl && (
                  <div className="card" style={{ marginBottom: 24 }}>
                    <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Night Mode — Landscape Lighting</h3>
                      <button className="btn btn-sm" onClick={async () => {
                        setGeneratingNightMode(true);
                        try {
                          const api = apiRef.current;
                          const result = await api.nightMode.generate(designRenderUrl);
                          setNightModeUrl(result.renderUrl);
                        } catch (err) {
                          console.error('Night mode failed:', err.message);
                          alert('Night mode generation failed: ' + err.message);
                        } finally { setGeneratingNightMode(false); }
                      }} disabled={generatingNightMode}
                        style={{ background: '#1e293b', color: '#fbbf24', border: 'none', fontWeight: 600, padding: '8px 20px' }}>
                        {generatingNightMode ? '⟳ Generating...' : nightModeUrl ? '⟳ Regenerate Night View' : '🌙 Generate Night View'}
                      </button>
                    </div>
                    <div className="card-body">
                      {generatingNightMode ? (
                        <div style={{ position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                          <img src={designRenderUrl} alt="Design" style={{ width: "100%", display: "block", filter: "brightness(0.3) saturate(0.5)" }} />
                          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
                            <div style={{ width: 48, height: 48, border: "4px solid rgba(255,255,255,0.3)", borderTopColor: "#fbbf24", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                            <span style={{ color: "#fbbf24", fontSize: 16, fontWeight: 700, textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>Generating Night View...</span>
                            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>Adding landscape lighting to your design</span>
                          </div>
                        </div>
                      ) : nightModeUrl ? (
                        <div style={{ position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                          <img src={nightModeUrl} alt="Night Mode Design" style={{ width: "100%", display: "block" }} />
                          <div style={{ position: "absolute", top: 12, left: 12, background: "#1e293b", color: "#fbbf24", padding: "4px 12px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                            NIGHT VIEW — LANDSCAPE LIGHTING
                          </div>
                          <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.6)", color: "#fff", padding: "4px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>FILO AI</div>
                        </div>
                      ) : (
                        <p style={{ color: "var(--filo-grey)", fontSize: 13, margin: 0 }}>
                          Generate a nighttime version of your design with professional landscape lighting — up-lights, path lights, accent lighting, and moonlight effects.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Hardscape Draw Tool */}
                {designRenderUrl && (
                  <div className="card" style={{ marginBottom: 24 }}>
                    <div className="card-header"><h3 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Hardscape Tool</h3></div>
                    <div className="card-body">
                      <p style={{ color: "var(--filo-grey)", fontSize: 13, marginTop: 0, marginBottom: 12 }}>
                        Draw on the design to outline where you want hardscape changes, then describe the material.
                      </p>
                      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
                        <button className="btn btn-sm" onClick={() => { setHardscapeDrawing(!hardscapeDrawing); setPolygonPoints([]); }}
                          style={{ background: hardscapeDrawing ? '#E97316' : 'var(--filo-green)', color: '#fff', border: 'none', fontWeight: 600 }}>
                          {hardscapeDrawing ? '✓ Drawing Mode ON' : '✏️ Start Drawing'}
                        </button>
                        <div className="pill-group" style={{ marginLeft: 4 }}>
                          <span className={`pill ${drawToolMode === 'freehand' ? 'active' : ''}`}
                            onClick={() => { setDrawToolMode('freehand'); setPolygonPoints([]); }} style={{ fontSize: 11, padding: "3px 10px" }}>Freehand</span>
                          <span className={`pill ${drawToolMode === 'polygon' ? 'active' : ''}`}
                            onClick={() => { setDrawToolMode('polygon'); setPolygonPoints([]); }} style={{ fontSize: 11, padding: "3px 10px" }}>Polygon</span>
                        </div>
                        {hardscapePaths.length > 0 && (
                          <button className="btn btn-sm btn-ghost" onClick={() => setHardscapePaths([])}>Clear Drawing</button>
                        )}
                        {polygonPoints.length > 0 && (
                          <button className="btn btn-sm btn-ghost" onClick={() => setPolygonPoints([])}>Undo Points</button>
                        )}
                      </div>
                      <div style={{ position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden", border: hardscapeDrawing ? '2px solid #3B82F6' : '2px solid transparent', cursor: hardscapeDrawing ? 'crosshair' : 'default' }}>
                        <img src={designRenderUrl} alt="Design" style={{ width: "100%", display: "block", pointerEvents: "none" }} draggable={false} />
                        <svg
                          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 5 }}
                          viewBox="0 0 1000 1000" preserveAspectRatio="none"
                          onMouseDown={(e) => {
                            if (!hardscapeDrawing) return;
                            const svg = e.currentTarget; const rect = svg.getBoundingClientRect();
                            const pt = { x: (e.clientX - rect.left) / rect.width * 1000, y: (e.clientY - rect.top) / rect.height * 1000 };
                            if (drawToolMode === 'polygon') {
                              if (polygonPoints.length >= 3) {
                                const first = polygonPoints[0];
                                if (Math.sqrt((pt.x - first.x) ** 2 + (pt.y - first.y) ** 2) < 30) {
                                  setHardscapePaths(prev => [...prev, [...polygonPoints]]);
                                  setPolygonPoints([]);
                                  return;
                                }
                              }
                              setPolygonPoints(prev => [...prev, pt]);
                            } else {
                              hardscapeDrawingRef.current = true;
                              hardscapeCurrentPathRef.current = [pt];
                              setHardscapeCurrentPath([pt]);
                            }
                          }}
                          onMouseMove={(e) => {
                            if (drawToolMode !== 'freehand' || !hardscapeDrawingRef.current) return;
                            const svg = e.currentTarget; const rect = svg.getBoundingClientRect();
                            const pt = { x: (e.clientX - rect.left) / rect.width * 1000, y: (e.clientY - rect.top) / rect.height * 1000 };
                            hardscapeCurrentPathRef.current = [...hardscapeCurrentPathRef.current, pt];
                            setHardscapeCurrentPath(hardscapeCurrentPathRef.current);
                          }}
                          onMouseUp={() => {
                            if (drawToolMode !== 'freehand') return;
                            const finalPath = hardscapeCurrentPathRef.current;
                            if (finalPath.length > 3) setHardscapePaths(prev => [...prev, finalPath]);
                            hardscapeDrawingRef.current = false;
                            hardscapeCurrentPathRef.current = [];
                            setHardscapeCurrentPath([]);
                          }}
                          onMouseLeave={() => {
                            if (drawToolMode !== 'freehand' || !hardscapeDrawingRef.current) return;
                            const finalPath = hardscapeCurrentPathRef.current;
                            if (finalPath.length > 3) setHardscapePaths(prev => [...prev, finalPath]);
                            hardscapeDrawingRef.current = false;
                            hardscapeCurrentPathRef.current = [];
                            setHardscapeCurrentPath([]);
                          }}
                          onTouchStart={(e) => {
                            if (!hardscapeDrawing) return;
                            e.preventDefault();
                            const svg = e.currentTarget; const rect = svg.getBoundingClientRect();
                            const pt = { x: (e.touches[0].clientX - rect.left) / rect.width * 1000, y: (e.touches[0].clientY - rect.top) / rect.height * 1000 };
                            if (drawToolMode === 'polygon') {
                              if (polygonPoints.length >= 3) {
                                const first = polygonPoints[0];
                                if (Math.sqrt((pt.x - first.x) ** 2 + (pt.y - first.y) ** 2) < 30) {
                                  setHardscapePaths(prev => [...prev, [...polygonPoints]]);
                                  setPolygonPoints([]);
                                  return;
                                }
                              }
                              setPolygonPoints(prev => [...prev, pt]);
                            } else {
                              hardscapeDrawingRef.current = true;
                              hardscapeCurrentPathRef.current = [pt];
                              setHardscapeCurrentPath([pt]);
                            }
                          }}
                          onTouchMove={(e) => {
                            if (drawToolMode !== 'freehand' || !hardscapeDrawingRef.current) return;
                            e.preventDefault();
                            const svg = e.currentTarget; const rect = svg.getBoundingClientRect();
                            const pt = { x: (e.touches[0].clientX - rect.left) / rect.width * 1000, y: (e.touches[0].clientY - rect.top) / rect.height * 1000 };
                            hardscapeCurrentPathRef.current = [...hardscapeCurrentPathRef.current, pt];
                            setHardscapeCurrentPath(hardscapeCurrentPathRef.current);
                          }}
                          onTouchEnd={() => {
                            if (drawToolMode !== 'freehand') return;
                            const finalPath = hardscapeCurrentPathRef.current;
                            if (finalPath.length > 3) setHardscapePaths(prev => [...prev, finalPath]);
                            hardscapeDrawingRef.current = false;
                            hardscapeCurrentPathRef.current = [];
                            setHardscapeCurrentPath([]);
                          }}
                        >
                          {hardscapePaths.map((path, i) => (
                            <polygon key={i} points={path.map(p => `${p.x},${p.y}`).join(' ')}
                              fill="rgba(59,130,246,0.2)" stroke="#3B82F6" strokeWidth="3" />
                          ))}
                          {hardscapeCurrentPath.length > 1 && drawToolMode === 'freehand' && (
                            <polyline points={hardscapeCurrentPath.map(p => `${p.x},${p.y}`).join(' ')}
                              fill="none" stroke="#3B82F6" strokeWidth="3" />
                          )}
                          {polygonPoints.length > 0 && drawToolMode === 'polygon' && (
                            <>
                              <polyline points={polygonPoints.map(p => `${p.x},${p.y}`).join(' ')}
                                fill={polygonPoints.length > 2 ? "rgba(59,130,246,0.1)" : "none"} stroke="#3B82F6" strokeWidth="3" />
                              {polygonPoints.map((p, i) => (
                                <circle key={i} cx={p.x} cy={p.y} r={i === 0 ? 12 : 6}
                                  fill={i === 0 ? "#3B82F6" : "#fff"} stroke="#3B82F6" strokeWidth="2" />
                              ))}
                            </>
                          )}
                        </svg>
                        {hardscapeDrawing && hardscapePaths.length === 0 && polygonPoints.length === 0 && (
                          <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", background: "#3B82F6", color: "#fff", padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, zIndex: 25, pointerEvents: "none" }}>
                            Draw around the hardscape area
                          </div>
                        )}
                      </div>
                      {hardscapePaths.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <textarea className="form-input" placeholder="Describe the hardscape... e.g. 'Flagstone walkway', 'Decomposed granite', 'Stone border edging', 'Brick pavers'"
                            value={hardscapePrompt} onChange={e => setHardscapePrompt(e.target.value)}
                            style={{ minHeight: 60, fontSize: 13, marginBottom: 12 }} />
                          <button className="btn btn-primary" disabled={!hardscapePrompt.trim() || applyingHardscape}
                            style={{ width: "100%", fontWeight: 700, padding: "12px 24px" }}
                            onClick={async () => {
                              if (!hardscapePrompt.trim()) return;
                              setApplyingHardscape(true);
                              try {
                                const canvas = document.createElement('canvas');
                                canvas.width = 1024; canvas.height = 1024;
                                const ctx = canvas.getContext('2d');
                                ctx.fillStyle = '#ffffff';
                                ctx.fillRect(0, 0, 1024, 1024);
                                ctx.fillStyle = '#000000';
                                for (const path of hardscapePaths) {
                                  ctx.beginPath();
                                  ctx.moveTo(path[0].x * 1.024, path[0].y * 1.024);
                                  for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x * 1.024, path[i].y * 1.024);
                                  ctx.closePath();
                                  ctx.fill();
                                }
                                const maskDataUrl = canvas.toDataURL('image/png');
                                const api = apiRef.current;
                                const result = await api.hardscape.apply(designRenderUrl, maskDataUrl, hardscapePrompt.trim());
                                if (result?.renderUrl) {
                                  setDesignRenderUrl(result.renderUrl);
                                  setHardscapePaths([]);
                                  setHardscapeDrawing(false);
                                  setHardscapePrompt('');
                                } else {
                                  throw new Error('No render returned');
                                }
                              } catch (err) {
                                console.error('Hardscape failed:', err.message);
                                alert('Hardscape edit failed: ' + err.message);
                              } finally { setApplyingHardscape(false); }
                            }}>
                            {applyingHardscape ? '⟳ Applying Hardscape...' : '✨ Apply Hardscape'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
              );
            })()}

            {designPlants.length > 0 && (
              <>
                {/* Layered Plant List */}
                <div className="card" style={{ marginBottom: 24 }}>
                  <div className="card-header"><h3 style={{ fontFamily: "var(--font-display)" }}>Plant List</h3></div>
                  <div className="card-body" style={{ padding: 0 }}>
                    {allGrouped ? (
                      layerGroups.map(({ key, plants: lp }) => (
                        <div key={key}>
                          <div style={{ padding: "10px 16px", background: (LAYER_COLORS[key] || '#888') + '15', borderBottom: `2px solid ${LAYER_COLORS[key] || '#888'}40`, display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 12, height: 12, borderRadius: 3, background: LAYER_COLORS[key] || '#888' }} />
                            <span style={{ fontSize: 12, fontWeight: 700, color: LAYER_COLORS[key] || '#888', textTransform: "uppercase", letterSpacing: 0.5 }}>{LAYER_LABELS[key] || 'Other Plants'}</span>
                          </div>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                            <tbody>
                              {lp.map((p, i) => {
                                const qty = p.quantity || 1;
                                const cost = parseFloat(p.unit_cost) || 0;
                                return (
                                  <tr key={i} style={{ borderBottom: "1px solid var(--filo-light)" }}>
                                    <td style={{ padding: "10px 16px", width: 40 }}>
                                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: LAYER_COLORS[key] || '#888', color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{i + 1}</div>
                                    </td>
                                    <td style={{ padding: "10px 16px" }}>
                                      <div style={{ fontWeight: 600 }}>{p.common_name || p.plant_name}</div>
                                      {p.botanical_name && <div style={{ fontSize: 12, color: "var(--filo-grey)", fontStyle: "italic" }}>{p.botanical_name}</div>}
                                      {p.spacing_inches && <div style={{ fontSize: 11, color: "var(--filo-silver)" }}>Spacing: {p.spacing_inches}" O.C.</div>}
                                    </td>
                                    <td style={{ padding: "10px 16px", color: "var(--filo-grey)", whiteSpace: "nowrap" }}>{p.container_size || '—'}</td>
                                    <td style={{ padding: "10px 16px", textAlign: "center", fontWeight: 600 }}>{qty}</td>
                                    <td style={{ padding: "10px 16px", textAlign: "right", whiteSpace: "nowrap" }}>{cost > 0 ? fmt(cost) : '—'}</td>
                                    <td style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600, whiteSpace: "nowrap" }}>{cost > 0 ? fmt(cost * qty) : '—'}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ))
                    ) : (
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                        <thead>
                          <tr style={{ background: "var(--filo-offwhite)", borderBottom: "2px solid var(--filo-border)" }}>
                            <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "var(--filo-grey)" }}>#</th>
                            <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "var(--filo-grey)" }}>Plant</th>
                            <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "var(--filo-grey)" }}>Size</th>
                            <th style={{ padding: "10px 16px", textAlign: "center", fontWeight: 600, color: "var(--filo-grey)" }}>Qty</th>
                            <th style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600, color: "var(--filo-grey)" }}>Unit</th>
                            <th style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600, color: "var(--filo-grey)" }}>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {designPlants.map((p, i) => {
                            const qty = p.quantity || 1; const cost = parseFloat(p.unit_cost) || 0;
                            return (
                              <tr key={i} style={{ borderBottom: "1px solid var(--filo-light)" }}>
                                <td style={{ padding: "12px 16px", color: "var(--filo-silver)" }}>{i + 1}</td>
                                <td style={{ padding: "12px 16px" }}>
                                  <div style={{ fontWeight: 600 }}>{p.common_name || p.plant_name}</div>
                                  {p.botanical_name && <div style={{ fontSize: 12, color: "var(--filo-grey)", fontStyle: "italic" }}>{p.botanical_name}</div>}
                                </td>
                                <td style={{ padding: "12px 16px", color: "var(--filo-grey)" }}>{p.container_size || '—'}</td>
                                <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 500 }}>{qty}</td>
                                <td style={{ padding: "12px 16px", textAlign: "right" }}>{cost > 0 ? fmt(cost) : '—'}</td>
                                <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600 }}>{cost > 0 ? fmt(cost * qty) : '—'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                    {/* Totals */}
                    <div style={{ padding: "14px 16px", background: "var(--filo-offwhite)", borderTop: "2px solid var(--filo-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700 }}>Total Plant Material — {designPlants.reduce((s, p) => s + (p.quantity || 1), 0)} plants</span>
                      <span style={{ fontWeight: 700, color: "var(--filo-green)", fontSize: 16 }}>
                        {fmt(designPlants.reduce((s, p) => s + ((parseFloat(p.unit_cost) || 0) * (p.quantity || 1)), 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          );
        })()}

        {/* Step 6: Estimate — REAL data */}
        {step === 6 && (() => {
          // Build line items from designPlants (the actual AI design output)
          const plantLineItems = designPlants.map(p => ({
            description: p.common_name || p.plant_name || p.name || 'Plant',
            botanical: p.botanical_name || '',
            category: 'plant_material',
            quantity: p.quantity || 1,
            container_size: p.container_size || '',
            wholesale_price: parseFloat(p.wholesale_price) || 0,
            retail_price: parseFloat(p.retail_price) || parseFloat(p.wholesale_price) * 1.35 || 0,
            layer: p.layer || '',
          }));
          // Use server estimate line items if available, otherwise build from designPlants
          const serverItems = estimate?.line_items || [];
          const hasServerPlantItems = serverItems.some(li => li.category === 'plant_material' || li.category === 'plant' || li.line_type === 'plant');
          const bomItems = hasServerPlantItems ? serverItems.filter(li => li.category === 'plant_material' || li.category === 'plant' || li.line_type === 'plant') : plantLineItems;
          const laborItems = serverItems.filter(li => li.category === 'labor' || li.line_type === 'labor');
          const otherItems = serverItems.filter(li => !['plant_material', 'plant', 'labor'].includes(li.category) && !['plant', 'labor'].includes(li.line_type));

          const materialTotal = bomItems.reduce((sum, li) => sum + ((li.retail_price || li.unit_cost || li.unit_price || 0) * (li.quantity || 1)), 0);
          const laborTotal = laborItems.reduce((sum, li) => sum + (li.total || (li.quantity * (li.unit_cost || li.unit_price || 0))), 0);
          const otherTotal = otherItems.reduce((sum, li) => sum + (li.total || (li.quantity * (li.unit_cost || li.unit_price || 0))), 0);
          const subtotal = estimate?.subtotal || (materialTotal + laborTotal + otherTotal);
          const taxRate = 0.0825;
          const tax = estimate?.tax_amount || estimate?.tax || (subtotal * taxRate);
          const total = estimate?.total || estimate?.grand_total || (subtotal + tax);

          return (
          <div className="scale-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Bill of Materials — Internal wholesale view */}
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontFamily: "var(--font-display)" }}>Bill of Materials (Internal)</h3>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {bomItems.length > 0 ? (
                  <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--filo-light)", fontSize: 11, textTransform: "uppercase", color: "var(--filo-grey)" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left" }}>Plant</th>
                        <th style={{ padding: "8px 12px", textAlign: "left" }}>Size</th>
                        <th style={{ padding: "8px 8px", textAlign: "center" }}>Qty</th>
                        <th style={{ padding: "8px 8px", textAlign: "right" }}>Wholesale</th>
                        <th style={{ padding: "8px 8px", textAlign: "right" }}>Retail</th>
                        <th style={{ padding: "8px 12px", textAlign: "right" }}>Ext.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bomItems.map((li, i) => {
                        const qty = li.quantity || 1;
                        const ws = parseFloat(li.wholesale_price || li.unit_cost || 0);
                        const rt = parseFloat(li.retail_price || li.unit_price || ws * 1.35);
                        return (
                        <tr key={i} style={{ borderBottom: "1px solid var(--filo-light)" }}>
                          <td style={{ padding: "8px 12px" }}>
                            <div style={{ fontWeight: 600 }}>{li.description || li.name}</div>
                            {li.botanical && <div style={{ fontSize: 11, color: "var(--filo-grey)", fontStyle: "italic" }}>{li.botanical}</div>}
                          </td>
                          <td style={{ padding: "8px 12px", color: "var(--filo-grey)", fontSize: 12 }}>{li.container_size || '—'}</td>
                          <td style={{ padding: "8px 8px", textAlign: "center", fontWeight: 600 }}>{qty}</td>
                          <td style={{ padding: "8px 8px", textAlign: "right", color: "var(--filo-grey)" }}>{fmt(ws)}</td>
                          <td style={{ padding: "8px 8px", textAlign: "right" }}>{fmt(rt)}</td>
                          <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>{fmt(rt * qty)}</td>
                        </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: "2px solid var(--filo-light)", fontWeight: 700 }}>
                        <td colSpan={2} style={{ padding: "10px 12px" }}>Total Materials</td>
                        <td style={{ padding: "10px 8px", textAlign: "center" }}>{bomItems.reduce((s, li) => s + (li.quantity || 1), 0)}</td>
                        <td colSpan={2}></td>
                        <td style={{ padding: "10px 12px", textAlign: "right" }}>{fmt(materialTotal)}</td>
                      </tr>
                    </tfoot>
                  </table>
                ) : (
                  <div style={{ textAlign: "center", padding: 40, color: "var(--filo-grey)" }}>
                    <p>No plant materials in the design. Go back to AI Design to generate a plant list.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Estimate */}
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontFamily: "var(--font-display)" }}>Customer Estimate</h3>
                <span className="status-badge" style={{ background: estimateApproved ? "var(--filo-green-pale)" : "#FEF3C7", color: estimateApproved ? "var(--filo-green)" : "#92400E" }}>
                  {estimateApproved ? "Approved" : "Draft"}
                </span>
              </div>
              <div className="card-body">
                {(bomItems.length > 0 || serverItems.length > 0) ? (
                  <>
                    {/* Plant materials */}
                    {bomItems.length > 0 && (
                      <div className="estimate-section">
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--filo-grey)", marginBottom: 8 }}>Plant Materials</div>
                        {bomItems.map((li, i) => {
                          const qty = li.quantity || 1;
                          const price = parseFloat(li.retail_price || li.unit_price || li.unit_cost || 0);
                          return (
                          <div className="estimate-row" key={`p${i}`}>
                            <span>{li.description || li.name}{qty > 1 ? ` x ${qty}` : ''}{li.container_size ? ` (${li.container_size})` : ''}</span>
                            <span style={{ fontWeight: 500 }}>{fmt(price * qty)}</span>
                          </div>
                          );
                        })}
                      </div>
                    )}
                    {/* Labor */}
                    {laborItems.length > 0 && (
                      <div className="estimate-section" style={{ borderTop: "1px solid var(--filo-light)", paddingTop: 12, marginTop: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--filo-grey)", marginBottom: 8 }}>Labor</div>
                        {laborItems.map((li, i) => (
                          <div className="estimate-row" key={`l${i}`}>
                            <span>{li.description || li.name}{li.quantity > 1 ? ` x ${li.quantity}` : ''}</span>
                            <span style={{ fontWeight: 500 }}>{fmt(li.total || (li.quantity * (li.unit_cost || li.unit_price || 0)))}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Other items */}
                    {otherItems.length > 0 && (
                      <div className="estimate-section" style={{ borderTop: "1px solid var(--filo-light)", paddingTop: 12, marginTop: 8 }}>
                        {otherItems.map((li, i) => (
                          <div className="estimate-row" key={`o${i}`}>
                            <span>{li.description || li.name}{li.quantity > 1 ? ` x ${li.quantity}` : ''}</span>
                            <span style={{ fontWeight: 500 }}>{fmt(li.total || (li.quantity * (li.unit_cost || li.unit_price || 0)))}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Totals */}
                    <div className="estimate-section" style={{ borderTop: "2px solid var(--filo-charcoal)", paddingTop: 12, marginTop: 12 }}>
                      <div className="estimate-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                      <div className="estimate-row"><span>Tax (8.25%)</span><span>{fmt(tax)}</span></div>
                      <div className="estimate-row total"><span>Total</span><span className="estimate-total">{fmt(total)}</span></div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: 40, color: "var(--filo-grey)" }}>
                    Estimate will be generated from the design data.
                  </div>
                )}
                <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
                  <button className="btn btn-primary btn-lg" style={{ flex: 1 }}
                    onClick={() => setEstimateApproved(true)} disabled={estimateApproved}>
                    {estimateApproved ? "Approved" : "Approve Estimate"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          );
        })()}

        {/* Step 7: Submittal — REAL data */}
        {step === 7 && (
          <div className="scale-in">
            <div className="submittal-preview">
              <div className="submittal-cover">
                <div style={{ fontSize: 48, marginBottom: 16 }}>🌿</div>
                <h1>Landscape Design Proposal</h1>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--filo-grey)", marginBottom: 24 }}>
                  Prepared for {project.clientName || "Client"}
                </p>
                <div style={{ fontSize: 14, color: "var(--filo-grey)" }}>
                  {project.address}
                </div>
                <div style={{ marginTop: 16, fontSize: 13, color: "var(--filo-silver)" }}>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>

              {submittal?.narrative && (
                <div className="submittal-section">
                  <h3>Scope of Work</h3>
                  <p style={{ lineHeight: 1.8, color: "var(--filo-slate)" }}>{submittal.narrative}</p>
                </div>
              )}

              {(designPlants.length > 0) && (
                <div className="submittal-section">
                  <h3>Plant Profiles</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                    {designPlants.slice(0, 6).map((p, i) => (
                      <div key={i} style={{ padding: 20, border: "1px solid var(--filo-light)", borderRadius: "var(--radius)" }}>
                        <div style={{ fontSize: 40, marginBottom: 8 }}>{p.img || "🌿"}</div>
                        <h4 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 4 }}>{p.common_name || p.name}</h4>
                        <div style={{ fontSize: 12, color: "var(--filo-grey)", marginBottom: 8 }}>
                          {p.bloom_season || ''} {p.water_requirement || ''} {p.sun_requirement || ''}
                        </div>
                        {p.description && <p style={{ fontSize: 13, fontStyle: "italic", color: "var(--filo-slate)", lineHeight: 1.6 }}>{p.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ textAlign: "center", paddingTop: 32, borderTop: "2px solid var(--filo-green)" }}>
                <span style={{ fontSize: 13, color: "var(--filo-grey)" }}>
                  Generated by FILO
                </span>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24 }}>
              {submittal?.pdf_url && <a href={submittal.pdf_url} target="_blank" rel="noreferrer" className="btn btn-primary btn-lg">Download PDF</a>}
            </div>
          </div>
        )}

        {/* Step 8: CRM Push / Complete */}
        {step === 8 && (
          <div className="card scale-in" style={{ maxWidth: 600, margin: "0 auto" }}>
            <div className="card-body" style={{ textAlign: "center", padding: 60 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 28, marginBottom: 8 }}>Project Complete!</h3>
              <p style={{ color: "var(--filo-grey)", marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>
                All data has been saved to your FILO database.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 360, margin: "0 auto", textAlign: "left" }}>
                {[
                  ["✅", `Client "${project.clientName}" created`],
                  ["✅", `Project with ${Object.keys(areaMap).length} area(s) saved`],
                  ["✅", `${Object.values(uploadedPhotos).flat().length || 0} photos uploaded`],
                  ["✅", design ? "AI design generated" : "Design pending"],
                  ["✅", estimate ? `Estimate: ${fmt(estimate.total || estimate.grand_total || 0)}` : "Estimate pending"],
                  ["✅", submittal ? "Submittal generated" : "Submittal pending"],
                ].map(([icon, text], i) => (
                  <div key={i} className="fade-in" style={{ display: "flex", gap: 12, alignItems: "center", padding: 12, background: "var(--filo-green-pale)", borderRadius: "var(--radius-sm)", animationDelay: `${i * 0.15}s` }}>
                    <span>{icon}</span>
                    <span style={{ fontSize: 14 }}>{text}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center" }}>
                {exportData?.downloadUrl && <a href={exportData.downloadUrl} className="btn btn-primary" target="_blank" rel="noreferrer">Download All</a>}
                <button className="btn btn-secondary" onClick={() => { localStorage.removeItem('filo_wizard_checkpoint'); setPage && setPage('projects'); }}>View Projects</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Plant Library ───────────────────────────────────────────────
function PlantLibraryPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const filtered = PLANTS_DB.filter(p =>
    (filter === "all" || p.type === filter) &&
    (search === "" || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2>Plant Library</h2>
          <p>{PLANTS_DB.length} plants in your availability list</p>
        </div>
        <button className="btn btn-primary">+ Add Plant</button>
      </div>
      <div className="page-body">
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <input className="form-input" style={{ maxWidth: 300 }} placeholder="Search plants..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <div className="pill-group">
            {[["all", "All"], ["shrub", "Shrubs"], ["tree", "Trees"], ["perennial", "Perennials"], ["groundcover", "Groundcover"], ["ornamental_grass", "Grasses"]].map(([val, label]) => (
              <span key={val} className={cn("pill", filter === val && "active")} onClick={() => setFilter(val)}>{label}</span>
            ))}
          </div>
        </div>
        <div className="plant-grid">
          {filtered.map((p, i) => (
            <div key={p.id} className="plant-card fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="plant-icon">{p.img}</div>
              <div className="plant-name">{p.name}</div>
              <div className="plant-meta">{p.size} • {p.sun} sun • {p.mature_h} tall</div>
              <div style={{ fontSize: 12, color: "var(--filo-grey)", marginTop: 4 }}>{p.bloom}</div>
              <div className="plant-price">{fmt(p.price)}</div>
              <p style={{ fontSize: 11, color: "var(--filo-grey)", marginTop: 8, fontStyle: "italic", lineHeight: 1.4 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Estimates Page ──────────────────────────────────────────────
function EstimatesPage() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h2>Estimates</h2><p>Manage all project estimates</p></div>
      </div>
      <div className="page-body">
        <div className="stat-grid">
          <div className="stat-card"><div className="stat-label">Pending Approval</div><div className="stat-value">5</div></div>
          <div className="stat-card"><div className="stat-label">Approved</div><div className="stat-value">18</div></div>
          <div className="stat-card"><div className="stat-label">Total Value</div><div className="stat-value">{fmt(186400)}</div></div>
          <div className="stat-card"><div className="stat-label">Win Rate</div><div className="stat-value">72%</div></div>
        </div>
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Project</th><th>Client</th><th>Amount</th><th>Status</th><th>Date</th><th></th></tr></thead>
              <tbody>
                {MOCK_PROJECTS.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500 }}>{p.id}</td>
                    <td>{p.client}</td>
                    <td style={{ fontWeight: 600 }}>{fmt(p.total)}</td>
                    <td>
                      <span className="status-badge" style={{ background: STATUS_MAP[p.status].color + "18", color: STATUS_MAP[p.status].color }}>
                        {STATUS_MAP[p.status].label}
                      </span>
                    </td>
                    <td>{p.date}</td>
                    <td><button className="btn btn-ghost btn-sm">View →</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Submittals Page ─────────────────────────────────────────────
function SubmittalsPage() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h2>Submittals</h2><p>Professional design proposal documents</p></div>
      </div>
      <div className="page-body">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {MOCK_PROJECTS.slice(0, 3).map((p, i) => (
            <div key={p.id} className="card fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
              <div style={{ height: 160, background: `linear-gradient(135deg, ${STATUS_MAP[p.status].color}22, var(--filo-green-pale))`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 48 }}>📄</span>
              </div>
              <div className="card-body">
                <div style={{ fontWeight: 600 }}>{p.client}</div>
                <div style={{ fontSize: 13, color: "var(--filo-grey)" }}>{p.address}</div>
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <button className="btn btn-primary btn-sm" style={{ flex: 1 }}>📥 Download</button>
                  <button className="btn btn-secondary btn-sm">📧 Email</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CRM Integration ─────────────────────────────────────────────
function CRMPage() {
  const [connected, setConnected] = useState("Jobber");
  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h2>CRM Integration</h2><p>Connect FILO to your CRM for seamless data sync</p></div>
      </div>
      <div className="page-body">
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><h3 style={{ fontFamily: "var(--font-display)" }}>Connected CRM</h3></div>
          <div className="card-body">
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: 16, background: "var(--filo-green-pale)", borderRadius: "var(--radius-sm)", marginBottom: 16 }}>
              <span style={{ fontSize: 32 }}>✅</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 18 }}>{connected}</div>
                <div style={{ fontSize: 13, color: "var(--filo-green)" }}>Connected • Last sync 2 minutes ago</div>
              </div>
              <button className="btn btn-secondary btn-sm" style={{ marginLeft: "auto" }}>Disconnect</button>
            </div>
            <div style={{ fontSize: 13, color: "var(--filo-grey)", padding: 12, background: "var(--filo-offwhite)", borderRadius: "var(--radius-sm)" }}>
              ℹ️ One-way sync: FILO → CRM. Project data, estimates, and submittals are automatically pushed to your CRM. FILO never modifies existing CRM data.
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 style={{ fontFamily: "var(--font-display)" }}>Available CRM Integrations</h3></div>
          <div className="card-body">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              {CRM_OPTIONS.map(crm => (
                <div key={crm} style={{
                  padding: 16, border: `1px solid ${crm === connected ? "var(--filo-green)" : "var(--filo-light)"}`,
                  borderRadius: "var(--radius-sm)", textAlign: "center", cursor: "pointer",
                  background: crm === connected ? "var(--filo-green-pale)" : "white",
                }} onClick={() => setConnected(crm)}>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>{crm}</div>
                  <div style={{ fontSize: 12, color: crm === connected ? "var(--filo-green)" : "var(--filo-grey)" }}>
                    {crm === connected ? "✅ Connected" : "Click to connect"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Clients Page ────────────────────────────────────────────────
function ClientsPage() {
  const clients = [
    { name: "Johnson Residence", address: "4521 River Oaks Blvd", phone: "(713) 555-0199", projects: 2, total: 18450 },
    { name: "Chen Family Estate", address: "1892 Memorial Dr", phone: "(713) 555-0244", projects: 1, total: 28900 },
    { name: "Martinez Property", address: "7744 Tanglewood Ln", phone: "(713) 555-0177", projects: 3, total: 42600 },
    { name: "Williams Home", address: "3310 Piping Rock Ln", phone: "(713) 555-0155", projects: 1, total: 34200 },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h2>Clients</h2><p>{clients.length} clients in your database</p></div>
        <button className="btn btn-primary">+ Add Client</button>
      </div>
      <div className="page-body">
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Client</th><th>Address</th><th>Phone</th><th>Projects</th><th>Revenue</th><th></th></tr></thead>
              <tbody>
                {clients.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td>{c.address}</td>
                    <td>{c.phone}</td>
                    <td>{c.projects}</td>
                    <td style={{ fontWeight: 600, color: "var(--filo-green)" }}>{fmt(c.total)}</td>
                    <td><button className="btn btn-ghost btn-sm">View →</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Settings Page ───────────────────────────────────────────────
function SettingsPage() {
  const [tab, setTab] = useState("company");
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const apiRef = useRef(null);

  useEffect(() => {
    import('./api.js').then(mod => {
      apiRef.current = mod.default;
      mod.default.company.get().then(data => setSettings(data)).catch(console.error);
    });
  }, []);

  const update = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  const save = async (fields) => {
    if (!apiRef.current) return;
    setSaving(true); setMsg(null);
    try {
      await apiRef.current.company.update(fields);
      setMsg('Saved!');
      setTimeout(() => setMsg(null), 2000);
    } catch (e) { setMsg(`Error: ${e.message}`); }
    finally { setSaving(false); }
  };

  if (!settings) return <div className="fade-in"><p>Loading settings...</p></div>;

  return (
    <div className="fade-in">
      <div className="page-header"><div><h2>Settings</h2><p>Manage your FILO workspace</p></div></div>
      {msg && <div style={{ padding: 10, marginBottom: 16, borderRadius: 'var(--radius-sm)', background: msg.startsWith('Error') ? '#FEE2E2' : 'var(--filo-green-pale)', color: msg.startsWith('Error') ? '#991B1B' : 'var(--filo-green)', fontSize: 13 }}>{msg}</div>}
      <div className="page-body">
        <div className="tabs" style={{ maxWidth: 500 }}>
          {[["company", "Company"], ["pricing", "Pricing"], ["tax", "Tax & Terms"], ["design", "Design Defaults"], ["products", "Products & Services"], ["client-import", "Import Clients"]].map(([val, label]) => (
            <button key={val} className={cn("tab-btn", tab === val && "active")} onClick={() => setTab(val)}>{label}</button>
          ))}
        </div>

        {tab === "company" && (
          <div className="card" style={{ maxWidth: 600 }}>
            <div className="card-body">
              <div className="form-group"><label className="form-label">Company Name</label><input className="form-input" value={settings.name || ''} onChange={e => update('name', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={settings.phone || ''} onChange={e => update('phone', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={settings.email || ''} onChange={e => update('email', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">License Number</label><input className="form-input" value={settings.license_number || ''} onChange={e => update('license_number', e.target.value)} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group"><label className="form-label">City</label><input className="form-input" value={settings.city || ''} onChange={e => update('city', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">State</label><input className="form-input" value={settings.state || ''} onChange={e => update('state', e.target.value)} /></div>
              </div>
              <div className="form-group"><label className="form-label">USDA Zone</label><input className="form-input" value={settings.usda_zone || ''} onChange={e => update('usda_zone', e.target.value)} /></div>
              <button className="btn btn-primary" disabled={saving} onClick={() => save({ name: settings.name, phone: settings.phone, email: settings.email, license_number: settings.license_number, city: settings.city, state: settings.state, usda_zone: settings.usda_zone })}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        )}

        {tab === "pricing" && (
          <div className="card" style={{ maxWidth: 600 }}>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Labor Pricing Method</label>
                <select className="form-input" value={settings.labor_pricing_method || 'per_gallon'} onChange={e => update('labor_pricing_method', e.target.value)}>
                  <option value="per_gallon">Per Gallon</option>
                  <option value="per_man_hour">Per Estimated Man Hours</option>
                  <option value="lump_sum">Lump Sum</option>
                </select>
              </div>
              {settings.labor_pricing_method === 'per_gallon' && (
                <div className="form-group" style={{ background: 'var(--filo-green-pale)', padding: 16, borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>Price Per Gallon ($)</label>
                  <p style={{ fontSize: 12, color: 'var(--filo-grey)', marginBottom: 8 }}>Labor cost applied per gallon of plant container size (e.g., a 3-gal plant = 3 × this rate)</p>
                  <input className="form-input" type="number" step="0.01" value={settings.labor_rate_per_gallon ?? ''} onChange={e => update('labor_rate_per_gallon', e.target.value)} placeholder="e.g. 12.50" />
                </div>
              )}
              {settings.labor_pricing_method === 'per_man_hour' && (
                <div className="form-group" style={{ background: 'var(--filo-green-pale)', padding: 16, borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>Hourly Labor Rate ($)</label>
                  <p style={{ fontSize: 12, color: 'var(--filo-grey)', marginBottom: 8 }}>Cost per man-hour for installation labor</p>
                  <input className="form-input" type="number" step="0.01" value={settings.labor_rate_per_hour ?? ''} onChange={e => update('labor_rate_per_hour', e.target.value)} placeholder="e.g. 65.00" />
                </div>
              )}
              {settings.labor_pricing_method === 'lump_sum' && (
                <div className="form-group" style={{ background: 'var(--filo-green-pale)', padding: 16, borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>Default Lump Sum ($)</label>
                  <p style={{ fontSize: 12, color: 'var(--filo-grey)', marginBottom: 8 }}>Default flat-rate labor charge per project</p>
                  <input className="form-input" type="number" step="0.01" value={settings.labor_lump_default ?? ''} onChange={e => update('labor_lump_default', e.target.value)} placeholder="e.g. 2500.00" />
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group"><label className="form-label">Material Markup %</label><input className="form-input" type="number" value={settings.material_markup_pct ?? 35} onChange={e => update('material_markup_pct', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Delivery Fee ($)</label><input className="form-input" type="number" step="0.01" value={settings.delivery_fee ?? 150} onChange={e => update('delivery_fee', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Soil Amendment / cy ($)</label><input className="form-input" type="number" step="0.01" value={settings.soil_amendment_per_cy ?? 95} onChange={e => update('soil_amendment_per_cy', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Mulch / cy ($)</label><input className="form-input" type="number" step="0.01" value={settings.mulch_per_cy ?? 85} onChange={e => update('mulch_per_cy', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Edging / lf ($)</label><input className="form-input" type="number" step="0.01" value={settings.edging_per_lf ?? 8} onChange={e => update('edging_per_lf', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Removal Base Fee ($)</label><input className="form-input" type="number" step="0.01" value={settings.removal_base_fee ?? 350} onChange={e => update('removal_base_fee', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Irrigation Hourly Rate ($)</label><input className="form-input" type="number" step="0.01" value={settings.irrigation_hourly_rate ?? ''} onChange={e => update('irrigation_hourly_rate', e.target.value)} placeholder="e.g. 85.00" /></div>
              </div>
              <button className="btn btn-primary" disabled={saving} onClick={() => save({
                labor_pricing_method: settings.labor_pricing_method,
                labor_rate_per_gallon: parseFloat(settings.labor_rate_per_gallon) || null,
                labor_rate_per_hour: parseFloat(settings.labor_rate_per_hour) || null,
                labor_lump_default: parseFloat(settings.labor_lump_default) || null,
                material_markup_pct: parseFloat(settings.material_markup_pct) || 35,
                delivery_fee: parseFloat(settings.delivery_fee) || 150,
                soil_amendment_per_cy: parseFloat(settings.soil_amendment_per_cy) || 95,
                mulch_per_cy: parseFloat(settings.mulch_per_cy) || 85,
                edging_per_lf: parseFloat(settings.edging_per_lf) || 8,
                removal_base_fee: parseFloat(settings.removal_base_fee) || 350,
                irrigation_hourly_rate: parseFloat(settings.irrigation_hourly_rate) || null,
              })}>{saving ? 'Saving...' : 'Save Pricing'}</button>
            </div>
          </div>
        )}

        {tab === "tax" && (
          <div className="card" style={{ maxWidth: 600 }}>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Include Tax on Estimates?</label>
                <div style={{ marginTop: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={settings.tax_enabled ?? true} onChange={e => update('tax_enabled', e.target.checked)} />
                    <span>{settings.tax_enabled ? 'Yes — tax included' : 'No — tax excluded'}</span>
                  </label>
                </div>
              </div>
              {settings.tax_enabled && (
                <div className="form-group"><label className="form-label">Tax Rate (%)</label><input className="form-input" type="number" step="0.01" value={((settings.tax_rate || 0.0825) * 100).toFixed(2)} onChange={e => update('tax_rate', (parseFloat(e.target.value) || 0) / 100)} /></div>
              )}
              <div className="form-group">
                <label className="form-label">Default Terms & Conditions</label>
                <textarea className="form-input" rows={6} value={settings.default_terms || ''} onChange={e => update('default_terms', e.target.value)} placeholder="50% deposit required to schedule work..." />
              </div>
              <div className="form-group">
                <label className="form-label">Warranty Terms</label>
                <textarea className="form-input" rows={3} value={settings.warranty_terms || ''} onChange={e => update('warranty_terms', e.target.value)} placeholder="1 year plant replacement warranty..." />
              </div>
              <button className="btn btn-primary" disabled={saving} onClick={() => save({
                tax_enabled: settings.tax_enabled, tax_rate: parseFloat(settings.tax_rate) || 0.0825,
                default_terms: settings.default_terms, warranty_terms: settings.warranty_terms,
              })}>{saving ? 'Saving...' : 'Save Tax & Terms'}</button>
            </div>
          </div>
        )}

        {tab === "design" && (
          <div className="card" style={{ maxWidth: 600 }}>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Default Design Style</label>
                <div className="pill-group">
                  {["formal", "naturalistic", "modern", "tropical", "xeriscape", "mediterranean", "cottage", "desert", "farmhouse", "transitional"].map(opt => (
                    <span key={opt} className={cn("pill", settings.default_design_style === opt && "active")}
                      style={{ cursor: 'pointer', textTransform: 'capitalize' }}
                      onClick={() => update('default_design_style', opt)}>{opt}</span>
                  ))}
                </div>
              </div>
              <button className="btn btn-primary" disabled={saving} onClick={() => save({
                default_design_style: settings.default_design_style ? settings.default_design_style.toLowerCase() : null,
              })}>{saving ? 'Saving...' : 'Save Defaults'}</button>
            </div>
          </div>
        )}

        {tab === "products" && (
          <div className="card" style={{ maxWidth: 600 }}>
            <div className="card-body">
              <h3 style={{ fontFamily: "var(--font-display)", marginBottom: 8 }}>Upload Products & Services</h3>
              <p style={{ fontSize: 13, color: "var(--filo-grey)", marginBottom: 16 }}>
                Upload your nursery availability list, price sheet, or product catalog. FILO will parse it and populate your plant library automatically.
              </p>
              <p style={{ fontSize: 12, color: "var(--filo-silver)", marginBottom: 16 }}>
                Supported formats: CSV, Excel (.xlsx), PDF, or plain text. Include plant names, sizes, and pricing for best results.
              </p>
              <input type="file" accept=".csv,.xlsx,.xls,.pdf,.txt" id="products-upload"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !apiRef.current) return;
                  setSaving(true); setMsg(null);
                  try {
                    const result = await apiRef.current.plants.import(file);
                    setMsg(`Imported ${result.imported || 0} products from ${file.name}${result.warnings?.length ? ` (${result.warnings.length} warnings)` : ''}`);
                  } catch (err) { setMsg(`Error: ${err.message}`); }
                  finally { setSaving(false); e.target.value = ''; }
                }}
              />
              <button className="btn btn-primary" disabled={saving} onClick={() => document.getElementById('products-upload')?.click()}>
                {saving ? '⟳ Importing...' : '📄 Upload Product List'}
              </button>
            </div>
          </div>
        )}

        {tab === "client-import" && (
          <div className="card" style={{ maxWidth: 600 }}>
            <div className="card-body">
              <h3 style={{ fontFamily: "var(--font-display)", marginBottom: 8 }}>Import Client Info</h3>
              <p style={{ fontSize: 13, color: "var(--filo-grey)", marginBottom: 16 }}>
                Upload a CSV or Excel file with your client list. FILO will create client records automatically.
              </p>
              <p style={{ fontSize: 12, color: "var(--filo-silver)", marginBottom: 16 }}>
                Required columns: Name, Address. Optional: Phone, Email. First row should be headers.
              </p>
              <input type="file" accept=".csv,.xlsx,.xls" id="clients-upload"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !apiRef.current) return;
                  setSaving(true); setMsg(null);
                  try {
                    const result = await apiRef.current.clients.import(file);
                    setMsg(`Imported ${result.imported || 0} clients from ${file.name}${result.warnings?.length ? ` (${result.warnings.length} warnings)` : ''}`);
                  } catch (err) { setMsg(`Error: ${err.message}`); }
                  finally { setSaving(false); e.target.value = ''; }
                }}
              />
              <button className="btn btn-primary" disabled={saving} onClick={() => document.getElementById('clients-upload')?.click()}>
                {saving ? '⟳ Importing...' : '👥 Upload Client List'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Billing Page ────────────────────────────────────────────────
function BillingPage() {
  return (
    <div className="fade-in">
      <div className="page-header"><div><h2>Billing</h2><p>Manage your FILO subscription</p></div></div>
      <div className="page-body">
        <div className="card" style={{ marginBottom: 24, background: "linear-gradient(135deg, var(--filo-charcoal), var(--filo-slate))", color: "white", border: "none" }}>
          <div className="card-body" style={{ padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, opacity: 0.6, marginBottom: 4 }}>Current Plan</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700 }}>FILO Professional</div>
                <div style={{ opacity: 0.7, marginTop: 4 }}>3 users included • Active since Jan 2026</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 700 }}>$2,500</div>
                <div style={{ opacity: 0.6 }}>/month</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="card">
            <div className="card-header"><h3 style={{ fontFamily: "var(--font-display)", fontSize: 16 }}>Users</h3></div>
            <div className="card-body">
              {[["Esteph Christison", "Admin", "Active"], ["Jack Christison", "Estimator", "Active"], ["Maria Garcia", "Estimator", "Active"]].map(([name, role, status], i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--filo-light)" }}>
                  <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{name.split(" ").map(n => n[0]).join("")}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{name}</div>
                    <div style={{ fontSize: 12, color: "var(--filo-grey)" }}>{role}</div>
                  </div>
                  <span className="status-badge" style={{ background: "#D1FAE5", color: "#059669" }}>{status}</span>
                </div>
              ))}
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }}>+ Add User ($500/mo)</button>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3 style={{ fontFamily: "var(--font-display)", fontSize: 16 }}>Payment Method</h3></div>
            <div className="card-body">
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, background: "var(--filo-offwhite)", borderRadius: "var(--radius-sm)", marginBottom: 16 }}>
                <span style={{ fontSize: 24 }}>💳</span>
                <div>
                  <div style={{ fontWeight: 500 }}>Visa ending in 4242</div>
                  <div style={{ fontSize: 12, color: "var(--filo-grey)" }}>Expires 09/2028</div>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm">Update Payment Method</button>
              <div style={{ marginTop: 16, padding: 12, background: "#FEF3C7", borderRadius: "var(--radius-sm)", fontSize: 12, color: "#92400E" }}>
                ⚠️ If your subscription lapses, all account access will be locked. You can still export documents before cancellation.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Team Page ───────────────────────────────────────────────────
function TeamPage() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h2>Team</h2><p>Manage users and permissions</p></div>
        <button className="btn btn-primary">+ Invite User</button>
      </div>
      <div className="page-body">
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>User</th><th>Role</th><th>Projects</th><th>Last Active</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {[
                  { name: "Esteph Christison", email: "esteph@kingsgarden.com", role: "Admin", projects: 12, last: "Just now", active: true },
                  { name: "Jack Christison", email: "jack@kingsgarden.com", role: "Estimator", projects: 8, last: "2 hours ago", active: true },
                  { name: "Maria Garcia", email: "maria@kingsgarden.com", role: "Estimator", projects: 5, last: "Yesterday", active: true },
                ].map((u, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{u.name.split(" ").map(n => n[0]).join("")}</div>
                        <div><div style={{ fontWeight: 500 }}>{u.name}</div><div style={{ fontSize: 12, color: "var(--filo-grey)" }}>{u.email}</div></div>
                      </div>
                    </td>
                    <td><span className="status-badge" style={{ background: u.role === "Admin" ? "var(--filo-green-pale)" : "var(--filo-offwhite)", color: u.role === "Admin" ? "var(--filo-green)" : "var(--filo-grey)" }}>{u.role}</span></td>
                    <td>{u.projects}</td>
                    <td style={{ fontSize: 13, color: "var(--filo-grey)" }}>{u.last}</td>
                    <td><span className="status-badge" style={{ background: "#D1FAE5", color: "#059669" }}>Active</span></td>
                    <td><button className="btn btn-ghost btn-sm">⋯</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Templates Page ──────────────────────────────────────────────
function TemplatesPage() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h2>Design Templates</h2><p>Saved design configurations and plant lists</p></div>
        <button className="btn btn-primary">+ New Template</button>
      </div>
      <div className="page-body">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {[
            { name: "Houston Classic", style: "Formal", plants: 12, icon: "🏛️" },
            { name: "River Oaks Cottage", style: "Naturalistic", plants: 18, icon: "🌸" },
            { name: "Modern Minimalist", style: "Modern", plants: 6, icon: "◻️" },
            { name: "Tropical Paradise", style: "Tropical", plants: 15, icon: "🌴" },
          ].map((t, i) => (
            <div key={i} className="card fade-in" style={{ cursor: "pointer", animationDelay: `${i * 0.06}s` }}>
              <div style={{ height: 120, background: "linear-gradient(135deg, var(--filo-green-pale), var(--filo-offwhite))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>{t.icon}</div>
              <div className="card-body">
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{t.name}</div>
                <div style={{ fontSize: 13, color: "var(--filo-grey)" }}>{t.style} • {t.plants} plants</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Login Page ──────────────────────────────────────────────────
function LoginPage({ onLogin, onShowRegister, onShowForgotPassword, onShowForgotEmail }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError("Email and password required"); return; }
    setLoading(true);
    setError("");
    try {
      const mod = await import('./api.js');
      const result = await mod.auth.login(email, password);
      onLogin(result.user);
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🌿</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 48, marginBottom: 16, lineHeight: 1.1 }}>FILO</h1>
          <p style={{ fontSize: 20, opacity: 0.8, fontFamily: "var(--font-display)" }}>
            AI-Powered Landscape Design
          </p>
          <p style={{ fontSize: 15, opacity: 0.5, marginTop: 8, maxWidth: 360, margin: "8px auto 0" }}>
            Generate photorealistic designs, professional estimates, and beautiful submittals — all in one platform.
          </p>
        </div>
      </div>
      <div className="login-right">
        <div className="login-card">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 4 }}>Welcome back</h2>
          <p style={{ fontSize: 14, color: "var(--filo-grey)", marginBottom: 32 }}>Sign in to your FILO workspace</p>
          {error && <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="you@company.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, marginTop: -4 }}>
            <span style={{ fontSize: 12, color: "var(--filo-green)", cursor: "pointer" }} onClick={onShowForgotPassword}>Forgot password?</span>
            <span style={{ fontSize: 12, color: "var(--filo-green)", cursor: "pointer" }} onClick={onShowForgotEmail}>Forgot email?</span>
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: "100%", marginBottom: 16, opacity: loading ? 0.6 : 1 }}
            onClick={handleLogin} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <p style={{ fontSize: 13, color: "var(--filo-grey)", textAlign: "center" }}>
            New to FILO? <span style={{ color: "var(--filo-green)", cursor: "pointer", fontWeight: 500 }} onClick={onShowRegister}>Start your free trial →</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Forgot Password Page ────────────────────────────────────────
function ForgotPasswordPage({ onShowLogin }) {
  const [step, setStep] = useState("request"); // request | reset | done
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Check URL for reset token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('reset_token');
    if (t) { setToken(t); setStep("reset"); }
  }, []);

  const handleRequest = async () => {
    if (!email) { setError("Enter your email address"); return; }
    setLoading(true); setError("");
    try {
      const mod = await import('./api.js');
      const result = await mod.auth.forgotPassword(email);
      setMessage(result.message);
      setStep("reset");
    } catch (err) {
      setError(err.message || "Failed to send reset request");
    } finally { setLoading(false); }
  };

  const handleReset = async () => {
    if (!token) { setError("Enter the reset code from your email"); return; }
    if (!password || password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirm) { setError("Passwords don't match"); return; }
    setLoading(true); setError("");
    try {
      const mod = await import('./api.js');
      const result = await mod.auth.resetPassword(token, password);
      setMessage(result.message);
      setStep("done");
    } catch (err) {
      setError(err.message || "Reset failed. Token may be expired.");
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔑</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, marginBottom: 16 }}>Reset Password</h1>
          <p style={{ fontSize: 15, opacity: 0.7 }}>We'll help you get back into your account.</p>
        </div>
      </div>
      <div className="login-right">
        <div className="login-card">
          {step === "request" && <>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 4 }}>Forgot your password?</h2>
            <p style={{ fontSize: 14, color: "var(--filo-grey)", marginBottom: 24 }}>Enter your email and we'll send a reset code.</p>
            {error && <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRequest()} placeholder="you@company.com" />
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: "100%", marginBottom: 16, opacity: loading ? 0.6 : 1 }}
              onClick={handleRequest} disabled={loading}>
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </>}

          {step === "reset" && <>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 4 }}>Enter reset code</h2>
            <p style={{ fontSize: 14, color: "var(--filo-grey)", marginBottom: 8 }}>
              {message || "Check your email for a reset code."}
            </p>
            <p style={{ fontSize: 12, color: "var(--filo-green)", background: "#F0FDF4", padding: "8px 12px", borderRadius: 8, marginBottom: 20 }}>
              Note: While email sending is being configured, check with your administrator for the reset code.
            </p>
            {error && <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}
            <div className="form-group">
              <label className="form-label">Reset Code</label>
              <input className="form-input" type="text" value={token} onChange={e => setToken(e.target.value)}
                placeholder="Paste reset code here" style={{ fontFamily: "monospace", fontSize: 13 }} />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min 8 characters" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleReset()} placeholder="Confirm new password" />
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: "100%", marginBottom: 16, opacity: loading ? 0.6 : 1 }}
              onClick={handleReset} disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>}

          {step === "done" && <>
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 8 }}>Password Reset!</h2>
              <p style={{ fontSize: 14, color: "var(--filo-grey)", marginBottom: 24 }}>{message}</p>
              <button className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={onShowLogin}>
                Back to Sign In
              </button>
            </div>
          </>}

          {step !== "done" && (
            <p style={{ fontSize: 13, color: "var(--filo-grey)", textAlign: "center", marginTop: 8 }}>
              Remember your password? <span style={{ color: "var(--filo-green)", cursor: "pointer", fontWeight: 500 }} onClick={onShowLogin}>Sign in →</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Forgot Email Page ───────────────────────────────────────────
function ForgotEmailPage({ onShowLogin }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    if (!firstName && !lastName && !phone) { setError("Enter at least your name or phone number"); return; }
    setLoading(true); setError(""); setResults(null);
    try {
      const mod = await import('./api.js');
      const result = await mod.auth.forgotEmail({ firstName, lastName, phone });
      setResults(result);
    } catch (err) {
      setError(err.message || "Lookup failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📧</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, marginBottom: 16 }}>Find Your Email</h1>
          <p style={{ fontSize: 15, opacity: 0.7 }}>Look up which email you signed up with.</p>
        </div>
      </div>
      <div className="login-right">
        <div className="login-card">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 4 }}>Forgot your email?</h2>
          <p style={{ fontSize: 14, color: "var(--filo-grey)", marginBottom: 24 }}>Enter your name or phone number to find your account.</p>
          {error && <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-input" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Esteph" />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-input" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Christison" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLookup()} placeholder="832-741-7781" />
          </div>

          <button className="btn btn-primary btn-lg" style={{ width: "100%", marginBottom: 16, opacity: loading ? 0.6 : 1 }}
            onClick={handleLookup} disabled={loading}>
            {loading ? "Searching..." : "Find My Account"}
          </button>

          {results && (
            <div style={{ background: results.maskedEmails.length ? "#F0FDF4" : "#FEF3C7", padding: "14px 16px", borderRadius: 10, marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: results.maskedEmails.length ? "#166534" : "#92400E" }}>
                {results.message}
              </p>
              {results.maskedEmails.map((e, i) => (
                <div key={i} style={{ fontSize: 15, fontFamily: "monospace", padding: "6px 0", color: "#1F2937" }}>{e}</div>
              ))}
            </div>
          )}

          <p style={{ fontSize: 13, color: "var(--filo-grey)", textAlign: "center" }}>
            Remember your email? <span style={{ color: "var(--filo-green)", cursor: "pointer", fontWeight: 500 }} onClick={onShowLogin}>Sign in →</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Invite Accept Page ──────────────────────────────────────────
function InviteAcceptPage({ inviteToken, onAccepted }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    setError("");
    try {
      const mod = await import('./api.js');
      const result = await mod.auth.acceptInvite(inviteToken, password);
      setSuccess(true);
      setTimeout(() => {
        window.history.replaceState({}, '', '/');
        onAccepted(result.user);
      }, 1200);
    } catch (err) {
      setError(err.message || "Invalid or expired invite link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🌿</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 48, marginBottom: 16, lineHeight: 1.1 }}>FILO</h1>
          <p style={{ fontSize: 20, opacity: 0.8, fontFamily: "var(--font-display)" }}>You've been invited to join a team.</p>
        </div>
      </div>
      <div className="login-right">
        <div className="login-card">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 4 }}>Set your password</h2>
          <p style={{ fontSize: 14, color: "var(--filo-grey)", marginBottom: 24 }}>Create a password to activate your account.</p>
          {success && <div style={{ background: "#D1FAE5", color: "#065F46", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>Account activated! Signing you in...</div>}
          {error && <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={confirm}
              onChange={e => setConfirm(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: "100%", opacity: loading ? 0.6 : 1 }}
            onClick={handleSubmit} disabled={loading || success}>
            {loading ? "Activating..." : "Activate Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Register Page ───────────────────────────────────────────────
function RegisterPage({ onRegister, onShowLogin }) {
  const [form, setForm] = useState({ companyName: "", firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleRegister = async () => {
    if (!form.companyName || !form.firstName || !form.lastName || !form.email || !form.password) {
      setError("All fields except phone are required"); return;
    }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords don't match"); return; }
    setLoading(true);
    setError("");
    try {
      const mod = await import('./api.js');
      const result = await mod.auth.register({
        companyName: form.companyName, firstName: form.firstName, lastName: form.lastName,
        email: form.email, phone: form.phone, password: form.password,
      });
      onRegister(result.user);
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🌿</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 48, marginBottom: 16, lineHeight: 1.1 }}>FILO</h1>
          <p style={{ fontSize: 20, opacity: 0.8, fontFamily: "var(--font-display)" }}>Start Your 14-Day Free Trial</p>
          <p style={{ fontSize: 15, opacity: 0.5, marginTop: 8, maxWidth: 360, margin: "8px auto 0" }}>
            No credit card required. Full access to AI design, estimates, and submittals.
          </p>
        </div>
      </div>
      <div className="login-right">
        <div className="login-card" style={{ maxWidth: 420 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 4 }}>Create your account</h2>
          <p style={{ fontSize: 14, color: "var(--filo-grey)", marginBottom: 24 }}>Get started in 60 seconds</p>
          {error && <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}
          <div className="form-group">
            <label className="form-label">Company Name *</label>
            <input className="form-input" placeholder="King's Garden Landscaping" value={form.companyName} onChange={e => update("companyName", e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input className="form-input" placeholder="Esteph" value={form.firstName} onChange={e => update("firstName", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input className="form-input" placeholder="Christison" value={form.lastName} onChange={e => update("lastName", e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="form-input" type="email" placeholder="you@company.com" value={form.email} onChange={e => update("email", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" type="tel" placeholder="(713) 555-0100" value={form.phone} onChange={e => update("phone", e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input className="form-input" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => update("password", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm *</label>
              <input className="form-input" type="password" placeholder="Confirm password" value={form.confirmPassword}
                onChange={e => update("confirmPassword", e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRegister()} />
            </div>
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: "100%", marginBottom: 16, opacity: loading ? 0.6 : 1 }}
            onClick={handleRegister} disabled={loading}>
            {loading ? "Creating account..." : "Start Free Trial"}
          </button>
          <p style={{ fontSize: 13, color: "var(--filo-grey)", textAlign: "center" }}>
            Already have an account? <span style={{ color: "var(--filo-green)", cursor: "pointer", fontWeight: 500 }} onClick={onShowLogin}>Sign in →</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Onboarding Wizard ───────────────────────────────────────────
function OnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const apiRef = useRef(null);
  const logoInputRef = useRef(null);
  const nurseryInputRef = useRef(null);

  const totalSteps = 8;
  const titles = ["Company Info", "Contact", "Location & Style", "Nursery List", "Pricing", "Tax & Terms", "CRM Connect", "Invite Team"];

  // Company profile state
  const [co, setCo] = useState({
    name: '', phone: '', email: '', license_number: '',
    city: '', state: '', usda_zone: '', design_style: '',
    labor_pricing_method: 'lump_sum', material_markup_pct: 35, delivery_fee: 150,
    tax_enabled: true, tax_rate: 0.0825, default_terms: '', warranty_terms: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [nurseryFile, setNurseryFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [selectedCrm, setSelectedCrm] = useState('');
  const [crmApiKey, setCrmApiKey] = useState('');
  const [invites, setInvites] = useState([{ email: '', role: 'estimator' }, { email: '', role: 'estimator' }]);

  const update = (field, value) => setCo(prev => ({ ...prev, [field]: value }));

  // Load API
  useEffect(() => {
    import("./api.js").then(mod => { apiRef.current = mod.default; }).catch(console.error);
  }, []);

  // Save company data when advancing past key steps
  const handleNext = async () => {
    if (!apiRef.current) { setStep(s => s + 1); return; }
    setError(null);
    setSaving(true);
    try {
      // Save company profile fields for relevant steps
      const fields = {};
      if (step === 1) { fields.name = co.name; }
      if (step === 2) { fields.phone = co.phone; fields.email = co.email; fields.license_number = co.license_number; }
      if (step === 3) { fields.city = co.city; fields.state = co.state; fields.usda_zone = co.usda_zone; if (co.design_style) fields.default_design_style = co.design_style.toLowerCase(); }
      if (step === 5) { fields.labor_pricing_method = co.labor_pricing_method; fields.material_markup_pct = parseFloat(co.material_markup_pct) || 35; fields.delivery_fee = parseFloat(co.delivery_fee) || 150; }
      if (step === 6) { fields.tax_enabled = co.tax_enabled; fields.tax_rate = parseFloat(co.tax_rate) || 0.0825; fields.default_terms = co.default_terms; fields.warranty_terms = co.warranty_terms; }
      if (step === 7) { /* CRM Connect — settings saved via CRM UI, nothing extra to persist */ }
      if (Object.keys(fields).length > 0) {
        await apiRef.current.company.update(fields);
      }

      // Upload logo if selected on step 1
      if (step === 1 && logoFile) {
        try {
          await apiRef.current.files.upload(logoFile, 'logo');
        } catch (e) { console.log('Logo upload:', e.message); }
      }
      // Import nursery list on step 4
      if (step === 4 && nurseryFile) {
        try {
          const result = await apiRef.current.plants.importList(nurseryFile);
          console.log('Nursery import result:', result);
        } catch (e) { console.log('Nursery import:', e.message); }
      }
      setStep(s => s + 1);
    } catch (err) {
      console.error('Onboarding save error:', err);
      // Don't block onboarding — save failed but let user continue
      // They can update settings later from the Settings page
      console.warn('Continuing onboarding despite save error');
      setError(`Save failed (${err.message}) — you can update this later in Settings. Continuing...`);
      setTimeout(() => { setError(null); setStep(s => s + 1); }, 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      if (apiRef.current) {
        // Send invites
        for (const inv of invites) {
          if (inv.email.trim()) {
            try { await apiRef.current.auth.invite({ email: inv.email, role: inv.role }); } catch (e) { console.log('Invite error:', e.message); }
          }
        }
        // Mark onboarding complete
        await apiRef.current.company.completeOnboarding();
      }
      onComplete();
    } catch (err) {
      console.error('Onboarding complete error:', err);
      onComplete(); // Still let them in
    } finally {
      setSaving(false);
    }
  };

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="onboarding-bg">
      <div className="onboarding-card">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
          <span style={{ fontSize: 24 }}>🌿</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600 }}>FILO Setup</span>
          <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--filo-grey)" }}>{step} of {totalSteps}</span>
        </div>

        <div className="wizard-progress">
          {Array.from({ length: totalSteps }, (_, i) => (
            <React.Fragment key={i}>
              <div className={cn("wizard-step-dot", i < step - 1 ? "done" : i === step - 1 ? "active" : "pending")}>
                {i < step - 1 ? "✓" : i + 1}
              </div>
              {i < totalSteps - 1 && <div className={cn("wizard-connector", i < step - 1 && "done")}></div>}
            </React.Fragment>
          ))}
        </div>

        <h3 className="wizard-title">{titles[step - 1]}</h3>
        <p className="wizard-subtitle">
          {step === 1 && "Let's set up your company profile."}
          {step === 2 && "How can your clients reach you?"}
          {step === 3 && "Where are you located and what's your style?"}
          {step === 4 && "Upload your nursery availability (optional)."}
          {step === 5 && "Set your default pricing framework."}
          {step === 6 && "Configure tax and default terms."}
          {step === 7 && "Connect your CRM software."}
          {step === 8 && "Invite your team members."}
        </p>

        {error && (
          <div style={{ padding: 12, background: "#FEE2E2", borderRadius: "var(--radius-sm)", marginBottom: 16, fontSize: 13, color: "#991B1B" }}>
            {error}
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input className="form-input" placeholder="King's Garden Landscaping" value={co.name} onChange={e => update('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Company Logo</label>
              <input type="file" ref={logoInputRef} accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleLogoSelect} />
              <div className="upload-zone" style={{ padding: 20, cursor: 'pointer' }} onClick={() => logoInputRef.current?.click()}>
                {logoPreview ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src={logoPreview} alt="Logo preview" style={{ width: 60, height: 60, objectFit: 'contain', borderRadius: 8 }} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{logoFile?.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--filo-grey)' }}>Click to change</p>
                    </div>
                  </div>
                ) : (
                  <p>Click to upload company logo</p>
                )}
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" placeholder="(713) 555-0100" value={co.phone} onChange={e => update('phone', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" placeholder="info@company.com" value={co.email} onChange={e => update('email', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">License Number</label><input className="form-input" placeholder="Optional" value={co.license_number} onChange={e => update('license_number', e.target.value)} /></div>
          </div>
        )}
        {step === 3 && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div className="form-group"><label className="form-label">City</label><input className="form-input" placeholder="Houston" value={co.city} onChange={e => update('city', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">State</label><input className="form-input" placeholder="TX" value={co.state} onChange={e => update('state', e.target.value)} /></div>
              <div className="form-group">
                <label className="form-label">ZIP Code</label>
                <input className="form-input" placeholder="77005" maxLength={5}
                  onChange={async (e) => {
                    const zip = e.target.value.replace(/\D/g, '');
                    e.target.value = zip;
                    if (zip.length === 5) {
                      try {
                        const res = await fetch(`https://phzmapi.org/${zip}.json`);
                        if (res.ok) {
                          const data = await res.json();
                          if (data.zone) update('usda_zone', data.zone);
                        }
                      } catch (err) { console.log('Zone lookup failed:', err.message); }
                    }
                  }} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">USDA Hardiness Zone</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input className="form-input" style={{ maxWidth: 100 }} value={co.usda_zone} readOnly
                  placeholder="..." />
                {co.usda_zone && (
                  <span style={{ fontSize: 13, color: "var(--filo-green)", fontWeight: 600 }}>
                    Zone {co.usda_zone} detected
                  </span>
                )}
                {!co.usda_zone && (
                  <span style={{ fontSize: 12, color: "var(--filo-silver)" }}>Enter ZIP code to auto-detect</span>
                )}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Default Design Style</label>
              <div className="pill-group">
                {["Formal", "Naturalistic", "Modern", "Tropical", "Xeriscape", "Mediterranean", "Cottage", "Desert", "Farmhouse", "Transitional"].map(s => (
                  <span key={s} className={cn("pill", co.design_style === s && "active")} onClick={() => update('design_style', s)}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        )}
        {step === 4 && (
          <div>
            <input type="file" ref={nurseryInputRef} accept=".pdf,.csv,.txt,.xlsx,.xls" style={{ display: 'none' }}
              onChange={e => { if (e.target.files?.[0]) { setNurseryFile(e.target.files[0]); setError(null); } }} />
            <div className="upload-zone" style={{ cursor: 'pointer', borderColor: nurseryFile ? 'var(--filo-green)' : undefined }} onClick={() => nurseryInputRef.current?.click()}>
              <div className="icon">{nurseryFile ? '✅' : '📄'}</div>
              <p>{nurseryFile?.name || "Upload nursery availability list"}<br/><span style={{ fontSize: 12 }}>{nurseryFile ? `${(nurseryFile.size / 1024).toFixed(0)} KB — click Continue to import` : 'PDF, Excel, CSV, or plain text'}</span></p>
            </div>
            <p style={{ fontSize: 12, color: "var(--filo-grey)", marginTop: 12, textAlign: "center" }}>Skip this step to use FILO's default local plant database</p>
          </div>
        )}
        {step === 5 && (
          <div>
            <div className="form-group">
              <label className="form-label">Labor Pricing Method</label>
              <select className="form-input" value={co.labor_pricing_method} onChange={e => update('labor_pricing_method', e.target.value)}>
                <option value="per_gallon">Per Gallon</option>
                <option value="per_man_hour">Per Estimated Man Hours</option>
                <option value="lump_sum">Lump Sum</option>
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group"><label className="form-label">Material Markup %</label><input className="form-input" type="number" value={co.material_markup_pct} onChange={e => update('material_markup_pct', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Delivery Fee</label><input className="form-input" type="number" value={co.delivery_fee} onChange={e => update('delivery_fee', e.target.value)} /></div>
            </div>
          </div>
        )}
        {step === 6 && (
          <div>
            <div className="form-group">
              <label className="form-label">Include Tax?</label>
              <div className="toggle-wrap" style={{ marginTop: 4 }}>
                <div className={cn("toggle", co.tax_enabled && "on")} onClick={() => update('tax_enabled', !co.tax_enabled)}></div>
                <span>{co.tax_enabled ? 'Yes' : 'No'}</span>
              </div>
            </div>
            {co.tax_enabled && <div className="form-group"><label className="form-label">Tax Rate (%)</label><input className="form-input" value={(co.tax_rate * 100).toFixed(2)} onChange={e => update('tax_rate', (parseFloat(e.target.value) || 0) / 100)} /></div>}
            <div className="form-group"><label className="form-label">Default Terms</label><textarea className="form-input" rows={3} placeholder="50% deposit required..." value={co.default_terms} onChange={e => update('default_terms', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Warranty Terms</label><textarea className="form-input" rows={2} placeholder="1 year plant replacement warranty..." value={co.warranty_terms} onChange={e => update('warranty_terms', e.target.value)} /></div>
          </div>
        )}
        {step === 7 && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {CRM_OPTIONS.slice(0, 9).map(crm => (
                <div key={crm} onClick={() => setSelectedCrm(crm)} style={{
                  padding: 12, border: `2px solid ${selectedCrm === crm ? 'var(--filo-green)' : 'var(--filo-light)'}`,
                  background: selectedCrm === crm ? 'var(--filo-green-pale)' : 'white',
                  borderRadius: "var(--radius-sm)", textAlign: "center", cursor: "pointer", fontSize: 13, fontWeight: selectedCrm === crm ? 600 : 400,
                }}>{crm}</div>
              ))}
            </div>
            {selectedCrm && (
              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">{selectedCrm} API Key</label>
                <input className="form-input" placeholder="Paste your CRM API key" value={crmApiKey} onChange={e => setCrmApiKey(e.target.value)} />
              </div>
            )}
            <p style={{ fontSize: 12, color: "var(--filo-grey)", marginTop: 12, textAlign: "center" }}>Skip this step if you don't use a CRM yet</p>
          </div>
        )}
        {step === 8 && (
          <div>
            <p style={{ fontSize: 14, color: "var(--filo-grey)", marginBottom: 16 }}>Your plan includes 3 users. Additional users are $500/mo each.</p>
            {invites.map((inv, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input className="form-input" placeholder={`Team member ${i + 1} email`} style={{ flex: 1 }}
                  value={inv.email} onChange={e => setInvites(prev => prev.map((p, idx) => idx === i ? { ...p, email: e.target.value } : p))} />
                <select className="form-input" style={{ width: 140 }} value={inv.role}
                  onChange={e => setInvites(prev => prev.map((p, idx) => idx === i ? { ...p, role: e.target.value } : p))}>
                  <option value="estimator">Estimator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
          {step > 1 ? <button className="btn btn-secondary" onClick={() => { setError(null); setStep(s => s - 1); }} disabled={saving}>← Back</button> : <div></div>}
          {step < totalSteps ? (
            <button className="btn btn-primary" onClick={handleNext} disabled={saving}>
              {saving ? "Saving..." : "Continue →"}
            </button>
          ) : (
            <button className="btn btn-gold btn-lg" onClick={handleComplete} disabled={saving}>
              {saving ? "Setting up..." : "Launch FILO"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  // Detect invite token in URL path: /invite/:token
  const inviteToken = (() => {
    const m = window.location.pathname.match(/^\/invite\/([a-f0-9-]{36})$/i);
    return m ? m[1] : null;
  })();

  const [view, setView] = useState(inviteToken ? "invite" : "loading"); // loading | invite | login | register | forgot-password | forgot-email | onboarding | app
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("projects");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    if (inviteToken) return; // Don't auto-redirect when accepting an invite
    const checkAuth = async () => {
      try {
        const mod = await import('./api.js');
        if (mod.auth.isLoggedIn()) {
          const storedUser = mod.auth.getUser();
          setUser(storedUser);
          // Check if onboarding is complete
          try {
            const companyData = await mod.company.get();
            if (!companyData.onboarding_completed) {
              setView("onboarding");
            } else {
              setView("app");
            }
          } catch {
            // If company fetch fails, go to app anyway (might be CORS or backend issue)
            setView("app");
          }
        } else {
          setView("login");
        }
      } catch {
        setView("login");
      }
    };
    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setView(userData.onboardingCompleted === false ? "onboarding" : "app");
  };

  const handleRegister = (userData) => {
    setUser(userData);
    setView("onboarding"); // New users always go to onboarding
  };

  const handleLogout = async () => {
    try {
      const mod = await import('./api.js');
      await mod.auth.logout();
    } catch {}
    setUser(null);
    setView("login");
  };

  const pages = {
    projects: <ProjectsPage setPage={setPage} />,
    "new-project": <ErrorBoundary><NewProjectPage /></ErrorBoundary>,
    clients: <ClientsPage />,
    plants: <PlantLibraryPage />,
    templates: <TemplatesPage />,
    estimates: <EstimatesPage />,
    submittals: <SubmittalsPage />,
    crm: <CRMPage />,
    settings: <SettingsPage />,
    billing: <BillingPage />,
    team: <TeamPage />,
  };

  if (view === "loading") return (
    <>
      <style>{STYLES}</style>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--filo-bg)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌿</div>
          <p style={{ fontSize: 14, color: "var(--filo-grey)" }}>Loading FILO...</p>
        </div>
      </div>
    </>
  );

  if (view === "invite") return (
    <>
      <style>{STYLES}</style>
      <InviteAcceptPage inviteToken={inviteToken} onAccepted={handleLogin} />
    </>
  );

  if (view === "login") return (
    <>
      <style>{STYLES}</style>
      <LoginPage onLogin={handleLogin} onShowRegister={() => setView("register")} onShowForgotPassword={() => setView("forgot-password")} onShowForgotEmail={() => setView("forgot-email")} />
    </>
  );

  if (view === "forgot-password") return (
    <>
      <style>{STYLES}</style>
      <ForgotPasswordPage onShowLogin={() => setView("login")} />
    </>
  );

  if (view === "forgot-email") return (
    <>
      <style>{STYLES}</style>
      <ForgotEmailPage onShowLogin={() => setView("login")} />
    </>
  );

  if (view === "register") return (
    <>
      <style>{STYLES}</style>
      <RegisterPage onRegister={handleRegister} onShowLogin={() => setView("login")} />
    </>
  );

  if (view === "onboarding") return (
    <>
      <style>{STYLES}</style>
      <OnboardingWizard onComplete={() => setView("app")} />
    </>
  );

  return (
    <>
      <style>{STYLES}</style>
      <AppContext.Provider value={{ user, setPage, handleLogout }}>
        <div className="app-layout">
          <Sidebar page={page} setPage={setPage} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} user={user} />
          {mobileOpen && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 45 }} onClick={() => setMobileOpen(false)} />}
          <div className={cn("main-content")}>
            <TopBar page={page} setMobileOpen={setMobileOpen} />
            {pages[page] || pages.projects}
          </div>
        </div>
      </AppContext.Provider>
    </>
  );
}
