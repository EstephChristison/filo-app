import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";

// ═══════════════════════════════════════════════════════════════════
// FILO — AI-Powered Landscape Design Platform
// Complete SaaS Application
// ═══════════════════════════════════════════════════════════════════

// ─── Context & State Management ──────────────────────────────────
const AppContext = createContext(null);

const useApp = () => useContext(AppContext);

// ─── Mock Data ───────────────────────────────────────────────────
const PLANTS_DB = [
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
];

const MOCK_PROJECTS = [
  { id: "PRJ-001", client: "Johnson Residence", address: "4521 River Oaks Blvd", status: "design_review", areas: ["Front Yard", "Side Yard"], date: "2026-03-25", total: 12450 },
  { id: "PRJ-002", client: "Chen Family Estate", address: "1892 Memorial Dr", status: "estimate_approved", areas: ["Front Yard", "Back Yard"], date: "2026-03-22", total: 28900 },
  { id: "PRJ-003", client: "Martinez Property", address: "7744 Tanglewood Ln", status: "submittal_sent", areas: ["Front Yard"], date: "2026-03-18", total: 8750 },
  { id: "PRJ-004", client: "Williams Home", address: "3310 Piping Rock Ln", status: "completed", areas: ["Front Yard", "Back Yard", "Side Yard"], date: "2026-03-10", total: 34200 },
];

const STATUS_MAP = {
  photo_upload: { label: "Photos", color: "#6B7280", step: 1 },
  plant_detection: { label: "Detection", color: "#F59E0B", step: 2 },
  design_questionnaire: { label: "Questionnaire", color: "#8B5CF6", step: 3 },
  design_generation: { label: "Designing", color: "#3B82F6", step: 4 },
  design_review: { label: "Review", color: "#EC4899", step: 5 },
  estimate_pending: { label: "Estimate", color: "#F97316", step: 6 },
  estimate_approved: { label: "Approved", color: "#10B981", step: 7 },
  submittal_sent: { label: "Submitted", color: "#06B6D4", step: 8 },
  completed: { label: "Complete", color: "#059669", step: 9 },
};

const CRM_OPTIONS = ["Jobber", "ServiceTitan", "LMN", "Aspire", "SingleOps", "Housecall Pro", "Arborgold", "Service Autopilot", "Yardbook"];

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
function Sidebar({ page, setPage, mobileOpen, setMobileOpen }) {
  const navItems = [
    { section: "Core", items: [
      { id: "dashboard", icon: "📊", label: "Dashboard" },
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
      <div className="sidebar-footer">
        <div className="avatar">EC</div>
        <div className="info">
          <div className="name">Esteph Christison</div>
          <div className="role">Admin • King's Garden</div>
        </div>
      </div>
    </div>
  );
}

// ─── Top Bar ─────────────────────────────────────────────────────
function TopBar({ page, setMobileOpen }) {
  const titles = {
    dashboard: "Dashboard", projects: "Projects", "new-project": "New Project",
    clients: "Clients", plants: "Plant Library", templates: "Templates",
    estimates: "Estimates", submittals: "Submittals", crm: "CRM Integration",
    settings: "Settings", billing: "Billing", team: "Team",
  };
  return (
    <div className="topbar">
      <button className="topbar-toggle" onClick={() => setMobileOpen(o => !o)}>☰</button>
      <div className="topbar-breadcrumb">
        FILO / <span>{titles[page] || "Dashboard"}</span>
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
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiReady, setApiReady] = useState(false);
  const apiRef = useRef(null);
  const fileInputRefs = useRef({});

  // Form data
  const [project, setProject] = useState({
    clientName: "", address: "", phone: "", email: "",
    areas: [],
    sun: "", style: "", specialRequests: "", lighting: false, hardscape: false,
  });

  // File selections (not yet uploaded)
  const [selectedFiles, setSelectedFiles] = useState({}); // { areaName: File[] }

  // API response data persisted across steps
  const [clientId, setClientId] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [areaMap, setAreaMap] = useState({}); // { areaName: { id, ...areaData } }
  const [uploadedPhotos, setUploadedPhotos] = useState({}); // { areaName: photoData[] }
  const [detectedPlants, setDetectedPlants] = useState([]); // from AI detection
  const [plantMarks, setPlantMarks] = useState({}); // { plantId: 'keep' | 'remove' }
  const [removalCost, setRemovalCost] = useState("350.00");
  const [design, setDesign] = useState(null);
  const [designPlants, setDesignPlants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [estimate, setEstimate] = useState(null);
  const [estimateApproved, setEstimateApproved] = useState(false);
  const [submittal, setSubmittal] = useState(null);
  const [exportData, setExportData] = useState(null);

  // Load API module
  useEffect(() => {
    import("./api.js").then(mod => { apiRef.current = mod.default; setApiReady(true); }).catch(console.error);
  }, []);

  const totalSteps = 10;
  const stepTitles = ["Client Info", "Property Areas", "Photo Upload", "Plant Detection", "Design Options", "AI Design", "Review & Adjust", "Estimate", "Submittal", "CRM Push"];

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
          const areas = Object.keys(selectedFiles);
          if (areas.length === 0) {
            // Allow skipping if no photos (will use placeholder)
            setStep(4);
            break;
          }
          const allPhotos = {};
          for (const areaName of areas) {
            const files = selectedFiles[areaName];
            if (!files || files.length === 0) continue;
            const areaData = areaMap[areaName];
            if (!areaData) continue;
            const photos = await api.files.uploadPhotos(areaData.id, files);
            allPhotos[areaName] = photos;
          }
          setUploadedPhotos(allPhotos);
          // Fetch detected plants (AI detection is triggered server-side on upload)
          // Give it a moment, then fetch
          try {
            const firstArea = Object.values(areaMap)[0];
            if (firstArea) {
              const existing = await api.existingPlants.list(firstArea.id);
              setDetectedPlants(existing || []);
              // Initialize marks
              const marks = {};
              (existing || []).forEach(p => { marks[p.id] = p.mark || 'keep'; });
              setPlantMarks(marks);
            }
          } catch (e) {
            console.log("Plant detection not yet complete:", e.message);
          }
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
          // Save design preferences to project
          if (projectId) {
            await api.projects.update(projectId, {
              sun_exposure: project.sun,
              design_style: project.style,
              special_requests: project.specialRequests,
              include_lighting: project.lighting,
              include_hardscape: project.hardscape,
            });
            // Trigger AI design generation
            await api.projects.updateStatus(projectId, 'design_generation');
            try {
              const designResult = await api.projects.generateDesign(projectId);
              setDesign(designResult.design || designResult);
              setDesignPlants(designResult.plants || designResult.design?.plants || []);
              if (designResult.design?.id) {
                setChatMessages([{ role: 'ai', text: 'Your design is ready! I\'ve selected plants based on your preferences and the property conditions. You can ask me to make changes — try "swap all shrubs for native species" or "add more color near the walkway".' }]);
              }
            } catch (e) {
              console.log("Design generation error:", e.message);
              setChatMessages([{ role: 'ai', text: 'Design generation encountered an issue. You can still proceed and make adjustments manually.' }]);
            }
          }
          setStep(6);
          break;
        }
        case 6: {
          // Move to review (design should be ready)
          setStep(7);
          break;
        }
        case 7: {
          // Generate estimate
          if (projectId) {
            try {
              const est = await api.projects.generateEstimate(projectId);
              setEstimate(est.estimate || est);
            } catch (e) {
              console.log("Estimate generation error:", e.message);
            }
          }
          setStep(8);
          break;
        }
        case 8: {
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
          setStep(9);
          break;
        }
        case 9: {
          // Final step — export / CRM push
          if (projectId) {
            await api.projects.updateStatus(projectId, 'completed');
            try {
              const exp = await api.projects.exportAll(projectId);
              setExportData(exp);
            } catch (e) { console.log("Export error:", e.message); }
          }
          setStep(10);
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
    setSelectedFiles(prev => ({
      ...prev,
      [areaName]: [...(prev[areaName] || []), ...Array.from(files)],
    }));
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
      case 3: return selectedFiles && Object.values(selectedFiles).some(f => f.length > 0) ? "Upload & Detect Plants →" : "Skip Photos →";
      case 4: return "Save & Continue →";
      case 5: return "Generate AI Design →";
      case 6: return "Review Design →";
      case 7: return "Generate Estimate →";
      case 8: return "Approve & Create Submittal →";
      case 9: return "Complete Project →";
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
        <div style={{ display: "flex", gap: 8 }}>
          {step > 1 && step < 10 && <button className="btn btn-secondary" onClick={handleBack} disabled={loading}>← Back</button>}
          {step < totalSteps && (
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
                  <div className="upload-zone" onClick={() => fileInputRefs.current[area]?.click()}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--filo-green)'; }}
                    onDragLeave={e => { e.currentTarget.style.borderColor = ''; }}
                    onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = ''; handleFileSelect(area, e.dataTransfer.files); }}
                    style={{ cursor: 'pointer' }}>
                    <input type="file" ref={el => fileInputRefs.current[area] = el} multiple accept="image/jpeg,image/png,image/heic,image/webp"
                      style={{ display: 'none' }} onChange={e => { handleFileSelect(area, e.target.files); e.target.value = ''; }} />
                    <div className="icon">📷</div>
                    <p><strong>Tap to upload</strong> or drag and drop photos</p>
                    <p style={{ fontSize: 12, marginTop: 4 }}>JPG, PNG, HEIC up to 25MB each</p>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                    {(selectedFiles[area] || []).map((file, idx) => (
                      <div key={idx} style={{
                        width: 100, height: 100, borderRadius: "var(--radius-sm)",
                        background: "var(--filo-slate)", overflow: "hidden",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, color: "white", fontWeight: 500, position: "relative"
                      }}>
                        <img src={URL.createObjectURL(file)} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onLoad={e => URL.revokeObjectURL(e.target.src)} />
                        <button onClick={(e) => { e.stopPropagation(); removeFile(area, idx); }}
                          style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.6)", border: "none", color: "white", borderRadius: "50%", width: 20, height: 20, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.6)", padding: "2px 4px", fontSize: 9, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                          {file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ padding: 16, background: "#FEF3C7", borderRadius: "var(--radius-sm)", fontSize: 13, color: "#92400E" }}>
                Photos upload to Supabase Storage and AI plant detection runs automatically on the server.
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Existing Plant Detection — REAL data */}
        {step === 4 && (
          <div className="card scale-in">
            <div className="card-header"><h3 style={{ fontFamily: "var(--font-display)" }}>Existing Plant Detection</h3></div>
            <div className="card-body">
              {detectedPlants.length > 0 ? (
                <>
                  <p style={{ fontSize: 14, color: "var(--filo-grey)", marginBottom: 20 }}>AI has detected existing plants. Mark plants to <span style={{ color: "var(--filo-green)", fontWeight: 600 }}>KEEP</span> or <span style={{ color: "var(--filo-red)", fontWeight: 600 }}>REMOVE</span>.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                    {detectedPlants.map(plant => {
                      const mark = plantMarks[plant.id] || 'keep';
                      return (
                        <div key={plant.id} style={{
                          padding: 12, borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "space-between",
                          border: `2px solid ${mark === 'keep' ? 'var(--filo-green)' : 'var(--filo-red)'}`,
                          background: mark === 'keep' ? 'var(--filo-green-pale)' : '#FEE2E2',
                        }}>
                          <div>
                            <span style={{ fontWeight: 600 }}>{plant.common_name || plant.botanical_name || 'Unknown Plant'}</span>
                            {plant.confidence && <span style={{ fontSize: 11, color: "var(--filo-grey)", marginLeft: 8 }}>({Math.round(plant.confidence * 100)}% confidence)</span>}
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button className={`btn btn-sm ${mark === 'keep' ? 'btn-primary' : 'btn-ghost'}`}
                              onClick={() => setPlantMarks(prev => ({ ...prev, [plant.id]: 'keep' }))}>Keep</button>
                            <button className={`btn btn-sm ${mark === 'remove' ? 'btn-primary' : 'btn-ghost'}`}
                              style={mark === 'remove' ? { background: 'var(--filo-red)' } : {}}
                              onClick={() => setPlantMarks(prev => ({ ...prev, [plant.id]: 'remove' }))}>Remove</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
                    <div style={{ flex: 1, padding: 12, background: "var(--filo-green-pale)", borderRadius: "var(--radius-sm)" }}>
                      {Object.values(plantMarks).filter(m => m === 'keep').length} plants to keep
                    </div>
                    <div style={{ flex: 1, padding: 12, background: "#FEE2E2", borderRadius: "var(--radius-sm)" }}>
                      {Object.values(plantMarks).filter(m => m === 'remove').length} plants to remove
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🌿</div>
                  <p style={{ color: "var(--filo-grey)", marginBottom: 8 }}>No plants detected yet.</p>
                  <p style={{ fontSize: 13, color: "var(--filo-silver)" }}>
                    {Object.keys(uploadedPhotos).length > 0
                      ? "AI plant detection is processing. You can proceed and come back later."
                      : "Upload photos in the previous step to enable AI plant detection."}
                  </p>
                </div>
              )}
              <div style={{ marginTop: 16 }}>
                <label className="form-label">Removal cost (lump sum line item)</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>$</span>
                  <input className="form-input" style={{ width: 120 }} value={removalCost}
                    onChange={e => setRemovalCost(e.target.value)} />
                  <span style={{ fontSize: 13, color: "var(--filo-grey)" }}>Haul away included</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Design Questionnaire */}
        {step === 5 && (
          <div className="card scale-in" style={{ maxWidth: 600 }}>
            <div className="card-header"><h3 style={{ fontFamily: "var(--font-display)" }}>Design Preferences</h3></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Sun Exposure</label>
                <div className="pill-group">
                  {["Full Sun", "Partial Shade", "Full Shade"].map(opt => (
                    <span key={opt} className={cn("pill", project.sun === opt && "active")}
                      onClick={() => updateProject({ sun: opt })}>{opt}</span>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Design Style</label>
                <div className="pill-group">
                  {["Formal / Symmetrical", "Naturalistic / Cottage", "Modern / Minimalist", "Tropical", "Desert / Xeriscape"].map(opt => (
                    <span key={opt} className={cn("pill", project.style === opt && "active")}
                      onClick={() => updateProject({ style: opt })}>{opt}</span>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Specific Plant Requests</label>
                <textarea className="form-input" placeholder="e.g. I want red knockout roses along the walkway..."
                  value={project.specialRequests} onChange={e => updateProject({ specialRequests: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Additional Features</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div className="toggle-wrap">
                    <div className={cn("toggle", project.lighting && "on")} onClick={() => updateProject({ lighting: !project.lighting })}></div>
                    <span style={{ fontSize: 14 }}>Landscape Lighting</span>
                  </div>
                  <div className="toggle-wrap">
                    <div className={cn("toggle", project.hardscape && "on")} onClick={() => updateProject({ hardscape: !project.hardscape })}></div>
                    <span style={{ fontSize: 14 }}>Hardscape Changes</span>
                  </div>
                </div>
              </div>
              <div style={{ padding: 16, background: "var(--filo-green-pale)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--filo-green)" }}>
                Clicking next saves these preferences and triggers the AI design engine.
              </div>
            </div>
          </div>
        )}

        {/* Step 6: AI Design Generation — REAL */}
        {step === 6 && (
          <div className="scale-in">
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-body" style={{ textAlign: "center", padding: 60 }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🌿</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 8 }}>
                  {design ? "AI Design Complete" : "AI Design in Progress"}
                </h3>
                <p style={{ color: "var(--filo-grey)", marginBottom: 24, maxWidth: 500, margin: "0 auto 24px" }}>
                  {design
                    ? "Your landscape design has been generated. Click 'Review Design' to make adjustments."
                    : "FILO is analyzing the uploaded photos, selecting plants based on sun exposure, architecture, and your style preferences..."
                  }
                </p>
                {!design && (
                  <div className="progress-bar" style={{ maxWidth: 400, margin: "0 auto", marginBottom: 12 }}>
                    <div className="progress-fill" style={{ width: "100%", animation: "none" }}></div>
                  </div>
                )}
              </div>
            </div>

            {designPlants.length > 0 && (
              <div className="card">
                <div className="card-header"><h3 style={{ fontFamily: "var(--font-display)" }}>Design Preview — Plant Selection</h3></div>
                <div className="card-body">
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {designPlants.map((p, i) => (
                      <span key={i} style={{ fontSize: 12, background: "var(--filo-offwhite)", padding: "6px 12px", borderRadius: 12 }}>
                        🌿 {p.common_name || p.plant_name || p.name} {p.quantity ? `× ${p.quantity}` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 7: Review & Adjust — REAL chat */}
        {step === 7 && (
          <div className="scale-in" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24 }}>
            <div>
              <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header">
                  <h3 style={{ fontFamily: "var(--font-display)" }}>Design Canvas</h3>
                </div>
                <div className="card-body">
                  <div className="design-canvas" style={{ minHeight: 450 }}>
                    <div className="house"></div>
                    <div className="bed-area">
                      {(designPlants.length > 0 ? designPlants : PLANTS_DB).slice(0, 8).map((plant, i) => (
                        <div key={plant.id || i} className="design-plant" title={plant.common_name || plant.name}
                          style={{
                            left: `${8 + (i * 12)}%`, top: `${10 + (i % 3) * 25}%`,
                            fontSize: (plant.category === "tree" || plant.type === "tree") ? 36 : 24,
                          }}>
                          {plant.img || "🌿"}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header"><h3 style={{ fontFamily: "var(--font-display)" }}>Plant Palette</h3></div>
                <div className="card-body">
                  <div className="plant-grid">
                    {(designPlants.length > 0 ? designPlants : PLANTS_DB).slice(0, 6).map((p, i) => (
                      <div key={p.id || i} className="plant-card">
                        <div className="plant-icon">{p.img || "🌿"}</div>
                        <div className="plant-name">{p.common_name || p.name}</div>
                        <div className="plant-meta">{p.size || p.container_size || '3-gal'} • {p.sun_requirement || p.sun || 'full'} sun</div>
                        {(p.price || p.unit_cost) && <div className="plant-price">{fmt(p.price || p.unit_cost)}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="chat-panel" style={{ height: 500 }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--filo-light)", fontWeight: 600, fontSize: 14 }}>
                  AI Design Assistant
                </div>
                <div className="chat-messages">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`chat-msg ${msg.role === 'user' ? 'user' : 'ai'}`}>
                      {msg.text}
                    </div>
                  ))}
                  {chatMessages.length === 0 && (
                    <div className="chat-msg ai">
                      Your design is ready for review. Tell me what changes you'd like — try "swap all shrubs for native species" or "add more color."
                    </div>
                  )}
                </div>
                <div className="chat-input-bar">
                  <input className="form-input" placeholder="Type a design change..." style={{ flex: 1 }}
                    value={chatInput} onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleChatSend()} />
                  <button className="btn btn-primary btn-sm" onClick={handleChatSend}>Send</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 8: Estimate — REAL data */}
        {step === 8 && (
          <div className="scale-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontFamily: "var(--font-display)" }}>Bill of Materials (Internal)</h3>
              </div>
              <div className="card-body">
                {estimate?.line_items ? (
                  <table>
                    <thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
                    <tbody>
                      {estimate.line_items.filter(li => li.category === 'plant' || li.line_type === 'plant').map((li, i) => (
                        <tr key={i}>
                          <td>{li.description || li.name}</td>
                          <td>{li.quantity}</td>
                          <td>{fmt(li.unit_cost || li.unit_price)}</td>
                          <td style={{ fontWeight: 600 }}>{fmt(li.total || (li.quantity * (li.unit_cost || li.unit_price)))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ textAlign: "center", padding: 40, color: "var(--filo-grey)" }}>
                    <p>Estimate data will appear here once generated.</p>
                    {!estimate && <p style={{ fontSize: 12, marginTop: 8 }}>If generation failed, you can still proceed.</p>}
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 style={{ fontFamily: "var(--font-display)" }}>Customer Estimate</h3>
                <span className="status-badge" style={{ background: estimateApproved ? "var(--filo-green-pale)" : "#FEF3C7", color: estimateApproved ? "var(--filo-green)" : "#92400E" }}>
                  {estimateApproved ? "Approved" : "Draft"}
                </span>
              </div>
              <div className="card-body">
                {estimate ? (
                  <>
                    <div className="estimate-section">
                      {(estimate.line_items || []).map((li, i) => (
                        <div className="estimate-row" key={i}>
                          <span>{li.description || li.name} {li.quantity > 1 ? `× ${li.quantity}` : ''}</span>
                          <span style={{ fontWeight: 500 }}>{fmt(li.total || (li.quantity * (li.unit_cost || li.unit_price || 0)))}</span>
                        </div>
                      ))}
                    </div>
                    <div className="estimate-section" style={{ borderTop: "1px solid var(--filo-light)", paddingTop: 12 }}>
                      {estimate.subtotal && <div className="estimate-row"><span>Subtotal</span><span>{fmt(estimate.subtotal)}</span></div>}
                      {estimate.tax && <div className="estimate-row"><span>Tax</span><span>{fmt(estimate.tax)}</span></div>}
                      <div className="estimate-row total"><span>Total</span><span className="estimate-total">{fmt(estimate.total || estimate.grand_total || 0)}</span></div>
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
        )}

        {/* Step 9: Submittal — REAL data */}
        {step === 9 && (
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

        {/* Step 10: Complete */}
        {step === 10 && (
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
                <button className="btn btn-secondary" onClick={() => setPage && setPage('projects')}>View Projects</button>
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
  return (
    <div className="fade-in">
      <div className="page-header"><div><h2>Settings</h2><p>Manage your FILO workspace</p></div></div>
      <div className="page-body">
        <div className="tabs" style={{ maxWidth: 500 }}>
          {[["company", "Company"], ["pricing", "Pricing"], ["tax", "Tax & Terms"], ["design", "Design Defaults"]].map(([val, label]) => (
            <button key={val} className={cn("tab-btn", tab === val && "active")} onClick={() => setTab(val)}>{label}</button>
          ))}
        </div>

        {tab === "company" && (
          <div className="card" style={{ maxWidth: 600 }}>
            <div className="card-body">
              <div className="form-group"><label className="form-label">Company Name</label><input className="form-input" defaultValue="King's Garden Landscaping" /></div>
              <div className="form-group">
                <label className="form-label">Logo</label>
                <div className="upload-zone" style={{ padding: 20 }}><p>📷 Click to upload company logo</p></div>
              </div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" defaultValue="(713) 555-0100" /></div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" defaultValue="info@kingsgarden.com" /></div>
              <div className="form-group"><label className="form-label">License Number</label><input className="form-input" defaultValue="TX-4800A / LI#25321" /></div>
              <div className="form-group"><label className="form-label">Geographic Location</label><input className="form-input" defaultValue="Houston, TX (USDA Zone 9a)" /></div>
              <button className="btn btn-primary">Save Changes</button>
            </div>
          </div>
        )}

        {tab === "pricing" && (
          <div className="card" style={{ maxWidth: 600 }}>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Labor Pricing Method</label>
                <select className="form-input">
                  <option>Per Gallon</option>
                  <option>Per Estimated Man Hours</option>
                  <option>Lump Sum</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group"><label className="form-label">Material Markup %</label><input className="form-input" defaultValue="35" /></div>
                <div className="form-group"><label className="form-label">Delivery Fee</label><input className="form-input" defaultValue="150.00" /></div>
                <div className="form-group"><label className="form-label">Soil Amendment / cy</label><input className="form-input" defaultValue="95.00" /></div>
                <div className="form-group"><label className="form-label">Mulch / cy</label><input className="form-input" defaultValue="85.00" /></div>
                <div className="form-group"><label className="form-label">Edging / lf</label><input className="form-input" defaultValue="8.00" /></div>
                <div className="form-group"><label className="form-label">Removal Base Fee</label><input className="form-input" defaultValue="350.00" /></div>
              </div>
              <button className="btn btn-primary">Save Pricing</button>
            </div>
          </div>
        )}

        {tab === "tax" && (
          <div className="card" style={{ maxWidth: 600 }}>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Include Tax on Estimates?</label>
                <div className="toggle-wrap" style={{ marginTop: 8 }}>
                  <div className="toggle on"></div><span>Yes</span>
                </div>
              </div>
              <div className="form-group"><label className="form-label">Tax Rate (%)</label><input className="form-input" defaultValue="8.25" /></div>
              <div className="form-group">
                <label className="form-label">Default Terms & Conditions</label>
                <textarea className="form-input" rows={6} defaultValue="50% deposit required to schedule work. Balance due upon completion. All plant material guaranteed for 1 year from installation date with proper watering. Payment by check, ACH, or credit card." />
              </div>
              <button className="btn btn-primary">Save</button>
            </div>
          </div>
        )}

        {tab === "design" && (
          <div className="card" style={{ maxWidth: 600 }}>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Default Design Style</label>
                <div className="pill-group">
                  {["Formal / Symmetrical", "Naturalistic / Cottage", "Modern / Minimalist", "Tropical", "Desert / Xeriscape"].map(opt => (
                    <span key={opt} className={cn("pill", opt === "Naturalistic / Cottage" && "active")}>{opt}</span>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Nursery Availability List</label>
                <div className="upload-zone" style={{ padding: 20 }}><p>📄 Upload PDF, Excel, CSV, or plain text</p></div>
              </div>
              <button className="btn btn-primary">Save Defaults</button>
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
        <div><h2>Design Templates</h2><p>Saved design configurations and plant palettes</p></div>
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
function LoginPage({ onLogin, onShowRegister }) {
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
      if (step === 1 || step === 2 || step === 3 || step === 5 || step === 6) {
        // Save company profile fields
        const fields = {};
        if (step === 1) { fields.name = co.name; }
        if (step === 2) { fields.phone = co.phone; fields.email = co.email; fields.license_number = co.license_number; }
        if (step === 3) { fields.city = co.city; fields.state = co.state; fields.usda_zone = co.usda_zone; fields.default_design_style = co.design_style; }
        if (step === 5) { fields.labor_pricing_method = co.labor_pricing_method; fields.material_markup_pct = parseFloat(co.material_markup_pct) || 35; fields.delivery_fee = parseFloat(co.delivery_fee) || 150; }
        if (step === 6) { fields.tax_enabled = co.tax_enabled; fields.tax_rate = parseFloat(co.tax_rate) || 0.0825; fields.default_terms = co.default_terms; fields.warranty_terms = co.warranty_terms; }
        await apiRef.current.company.update(fields);

        // Upload logo if selected on step 1
        if (step === 1 && logoFile) {
          try {
            await apiRef.current.files.upload(logoFile, 'logo');
          } catch (e) { console.log('Logo upload:', e.message); }
        }
      }
      if (step === 4 && nurseryInputRef.current?.files?.[0]) {
        try {
          await apiRef.current.plants.importList(nurseryInputRef.current.files[0]);
        } catch (e) { console.log('Nursery import:', e.message); }
      }
      setStep(s => s + 1);
    } catch (err) {
      console.error('Onboarding save error:', err);
      setError(err.message);
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group"><label className="form-label">City</label><input className="form-input" placeholder="Houston" value={co.city} onChange={e => update('city', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">State</label><input className="form-input" placeholder="TX" value={co.state} onChange={e => update('state', e.target.value)} /></div>
            </div>
            <div className="form-group"><label className="form-label">USDA Zone</label><input className="form-input" placeholder="e.g. 9a" value={co.usda_zone} onChange={e => update('usda_zone', e.target.value)} /></div>
            <div className="form-group">
              <label className="form-label">Default Design Style</label>
              <div className="pill-group">
                {["Formal", "Naturalistic", "Modern", "Tropical", "Xeriscape"].map(s => (
                  <span key={s} className={cn("pill", co.design_style === s && "active")} onClick={() => update('design_style', s)}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        )}
        {step === 4 && (
          <div>
            <input type="file" ref={nurseryInputRef} accept=".pdf,.csv,.txt,.xlsx,.xls" style={{ display: 'none' }}
              onChange={e => e.target.files?.[0] && setError(null)} />
            <div className="upload-zone" style={{ cursor: 'pointer' }} onClick={() => nurseryInputRef.current?.click()}>
              <div className="icon">📄</div>
              <p>{nurseryInputRef.current?.files?.[0]?.name || "Upload nursery availability list"}<br/><span style={{ fontSize: 12 }}>PDF, Excel, CSV, or plain text</span></p>
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
  const [view, setView] = useState("loading"); // loading | login | register | onboarding | app
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
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
    setView("app"); // Skip onboarding check for login (they already completed it)
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
    dashboard: <DashboardPage setPage={setPage} />,
    projects: <ProjectsPage setPage={setPage} />,
    "new-project": <NewProjectPage />,
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

  if (view === "login") return (
    <>
      <style>{STYLES}</style>
      <LoginPage onLogin={handleLogin} onShowRegister={() => setView("register")} />
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
          <Sidebar page={page} setPage={setPage} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
          {mobileOpen && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 45 }} onClick={() => setMobileOpen(false)} />}
          <div className={cn("main-content")}>
            <TopBar page={page} setMobileOpen={setMobileOpen} />
            {pages[page] || <DashboardPage setPage={setPage} />}
          </div>
        </div>
      </AppContext.Provider>
    </>
  );
}
