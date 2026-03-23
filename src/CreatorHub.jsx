import { useState, useEffect, useRef, useMemo } from "react";

// ─── DATA STORE ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "video", label: "Video Packs", icon: "🎬", color: "#ff6b35" },
  { id: "study", label: "Study Materials", icon: "📚", color: "#4ecdc4" },
  { id: "productivity", label: "Productivity", icon: "⚡", color: "#ffe66d" },
  { id: "reels", label: "Reel Packs", icon: "🎞️", color: "#a8edea" },
];

const initialResources = [
  {
    id: 1, title: "Cinematic LUT Pack Vol.1", category: "video",
    description: "50 professional cinematic LUTs for DaVinci Resolve, Premiere & FCPX. Achieve Hollywood-grade color grades instantly.",
    tags: ["LUTs", "Color Grading", "DaVinci"], price: "Free",
    trending: true, premium: false, isNew: true,
    downloadLink: "#download-1",
    thumbnail: null, downloads: 12400,
  },
  {
    id: 2, title: "Smooth Glitch Transitions", category: "video",
    description: "120 smooth glitch & RGB shift transitions. Compatible with Premiere Pro, Final Cut & CapCut.",
    tags: ["Transitions", "Glitch", "CapCut"], price: "Premium",
    trending: true, premium: true, isNew: false,
    downloadLink: "#download-2",
    thumbnail: null, downloads: 8900,
  },
  {
    id: 3, title: "Ultimate Study Planner 2025", category: "study",
    description: "Notion-powered study planner with habit trackers, subject boards, exam countdowns, and weekly reviews.",
    tags: ["Notion", "Planner", "Students"], price: "Free",
    trending: true, premium: false, isNew: true,
    downloadLink: "#download-3",
    thumbnail: null, downloads: 21000,
  },
  {
    id: 4, title: "Aesthetic Notion Dashboard", category: "productivity",
    description: "Minimal Notion workspace template with linked databases, kanban boards, and daily journal blocks.",
    tags: ["Notion", "Dashboard", "Workspace"], price: "Free",
    trending: false, premium: false, isNew: true,
    downloadLink: "#download-4",
    thumbnail: null, downloads: 15300,
  },
  {
    id: 5, title: "Viral Anime Edit Pack", category: "reels",
    description: "60+ pre-cut anime clips with beat-sync markers, speed ramps, and overlay effects ready to drop in.",
    tags: ["Anime", "Edits", "Viral"], price: "Premium",
    trending: true, premium: true, isNew: false,
    downloadLink: "#download-5",
    thumbnail: null, downloads: 31200,
  },
  {
    id: 6, title: "Physics Notes – Class 12", category: "study",
    description: "Complete handwritten-style PDF notes for Class 12 Physics. Covers all NCERT chapters with solved examples.",
    tags: ["Physics", "Notes", "PDF"], price: "Free",
    trending: false, premium: false, isNew: true,
    downloadLink: "#download-6",
    thumbnail: null, downloads: 9800,
  },
  {
    id: 7, title: "Morning Routine System", category: "productivity",
    description: "Notion + PDF habit system for designing your perfect morning. Includes 30-day challenge tracker.",
    tags: ["Habits", "Routine", "PDF"], price: "Free",
    trending: false, premium: false, isNew: false,
    downloadLink: "#download-7",
    thumbnail: null, downloads: 7200,
  },
  {
    id: 8, title: "Cinematic B-Roll Pack", category: "reels",
    description: "200+ 4K b-roll clips – urban, nature, travel & lifestyle. Royalty-free, drag-and-drop ready.",
    tags: ["B-Roll", "4K", "Royalty Free"], price: "Premium",
    trending: true, premium: true, isNew: true,
    downloadLink: "#download-8",
    thumbnail: null, downloads: 18600,
  },
  {
    id: 9, title: "Overlay & VHS Pack", category: "video",
    description: "80 retro VHS, grain, and light-leak overlays. Perfect for aesthetic reels and YouTube vlogs.",
    tags: ["Overlays", "VHS", "Retro"], price: "Free",
    trending: false, premium: false, isNew: false,
    downloadLink: "#download-9",
    thumbnail: null, downloads: 5400,
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const formatNum = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n;

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, "-");
}

// ─── THUMBNAIL PLACEHOLDER ───────────────────────────────────────────────────
function Thumb({ resource, size = "full" }) {
  const catColor = CATEGORIES.find((c) => c.id === resource.category)?.color || "#ff6b35";
  const catIcon  = CATEGORIES.find((c) => c.id === resource.category)?.icon  || "📦";
  return (
    <div style={{
      width: "100%", paddingBottom: size === "full" ? "56.25%" : "60%",
      position: "relative", borderRadius: "12px", overflow: "hidden",
      background: `linear-gradient(135deg, ${catColor}22 0%, ${catColor}08 100%)`,
      border: `1px solid ${catColor}33`,
    }}>
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "8px",
      }}>
        <span style={{ fontSize: size === "full" ? "3.5rem" : "2.5rem" }}>{catIcon}</span>
        <span style={{
          fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em",
          color: catColor, textTransform: "uppercase", opacity: 0.8,
        }}>
          {resource.category}
        </span>
      </div>
      {resource.premium && (
        <span style={{
          position: "absolute", top: "10px", right: "10px",
          background: "linear-gradient(135deg,#f7971e,#ffd200)",
          color: "#000", fontSize: "0.6rem", fontWeight: 800,
          padding: "3px 8px", borderRadius: "20px", letterSpacing: "0.1em",
        }}>PREMIUM</span>
      )}
      {resource.isNew && !resource.premium && (
        <span style={{
          position: "absolute", top: "10px", right: "10px",
          background: "linear-gradient(135deg,#11998e,#38ef7d)",
          color: "#000", fontSize: "0.6rem", fontWeight: 800,
          padding: "3px 8px", borderRadius: "20px", letterSpacing: "0.1em",
        }}>NEW</span>
      )}
    </div>
  );
}

// ─── GLOBAL CSS ──────────────────────────────────────────────────────────────
const GlobalStyle = ({ dark }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }

    :root {
      --bg:       ${dark ? "#0a0a0f" : "#f4f3ee"};
      --bg2:      ${dark ? "#111118" : "#ede8df"};
      --bg3:      ${dark ? "#18181f" : "#e5dfd3"};
      --surface:  ${dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.72)"};
      --surface2: ${dark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.9)"};
      --border:   ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"};
      --text:     ${dark ? "#f0ede8" : "#1a1814"};
      --muted:    ${dark ? "#7a7a8a" : "#7a7670"};
      --accent:   #ff6b35;
      --accent2:  #4ecdc4;
      --gold:     #ffd200;
      --radius:   14px;
      --shadow:   ${dark ? "0 4px 30px rgba(0,0,0,0.5)" : "0 4px 30px rgba(0,0,0,0.1)"};
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      line-height: 1.6;
      transition: background 0.4s, color 0.4s;
      overflow-x: hidden;
    }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 3px; }

    /* Glass card */
    .glass {
      background: var(--surface);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--border);
      border-radius: var(--radius);
    }

    /* Hover lift */
    .lift {
      transition: transform 0.25s cubic-bezier(.25,.46,.45,.94), box-shadow 0.25s;
    }
    .lift:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 40px rgba(255,107,53,0.18);
    }

    /* Fade-in animation */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fadeUp 0.55s cubic-bezier(.25,.46,.45,.94) both; }
    .delay-1 { animation-delay: 0.1s; }
    .delay-2 { animation-delay: 0.2s; }
    .delay-3 { animation-delay: 0.3s; }
    .delay-4 { animation-delay: 0.4s; }

    @keyframes pulse-glow {
      0%,100% { box-shadow: 0 0 0 0 rgba(255,107,53,0.4); }
      50%      { box-shadow: 0 0 20px 6px rgba(255,107,53,0.15); }
    }

    /* Gradient text */
    .gradient-text {
      background: linear-gradient(135deg, #ff6b35, #ffd200);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Buttons */
    .btn-primary {
      background: linear-gradient(135deg, #ff6b35, #ff4500);
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 12px 24px;
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      font-size: 0.875rem;
      letter-spacing: 0.04em;
      cursor: pointer;
      transition: all 0.25s;
      text-transform: uppercase;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(255,107,53,0.4);
    }
    .btn-secondary {
      background: var(--surface2);
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px 24px;
      font-family: 'Syne', sans-serif;
      font-weight: 600;
      font-size: 0.875rem;
      letter-spacing: 0.03em;
      cursor: pointer;
      transition: all 0.25s;
    }
    .btn-secondary:hover {
      border-color: var(--accent);
      color: var(--accent);
      transform: translateY(-2px);
    }

    /* Download btn */
    .btn-download {
      background: linear-gradient(135deg,#11998e,#38ef7d);
      color: #000;
      border: none;
      border-radius: 10px;
      padding: 10px 20px;
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 0.8rem;
      letter-spacing: 0.06em;
      cursor: pointer;
      transition: all 0.25s;
      text-transform: uppercase;
      display: flex; align-items: center; gap: 6px;
      animation: pulse-glow 2.5s infinite;
    }
    .btn-download:hover {
      transform: scale(1.04);
      box-shadow: 0 8px 24px rgba(56,239,125,0.35);
    }

    /* Tag chips */
    .tag {
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 3px 10px;
      font-size: 0.7rem;
      font-weight: 500;
      color: var(--muted);
      letter-spacing: 0.05em;
    }

    /* Nav */
    nav a { text-decoration: none; color: var(--text); }

    /* Search */
    .search-input {
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 10px 16px 10px 40px;
      color: var(--text);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s;
      width: 100%;
    }
    .search-input:focus { border-color: var(--accent); }
    .search-input::placeholder { color: var(--muted); }

    /* Filter pill */
    .filter-pill {
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 30px;
      padding: 7px 16px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
      font-family: 'Syne', sans-serif;
      color: var(--text);
    }
    .filter-pill.active, .filter-pill:hover {
      background: var(--accent);
      border-color: var(--accent);
      color: #fff;
    }

    /* ── RESPONSIVE BREAKPOINTS ────────────────────────────────
       xs:  0–480px   phones portrait
       sm:  481–768px phones landscape / small tablets
       md:  769–1024px tablets
       lg:  1025px+   desktop
    ──────────────────────────────────────────────────────── */

    /* ── Large tablet / small laptop (769–1024px) ── */
    @media (max-width: 1024px) {
      .hero-title  { font-size: 2.4rem !important; line-height: 1.15 !important; }
      .grid-3      { grid-template-columns: repeat(2, 1fr) !important; }
      .grid-4      { grid-template-columns: repeat(2, 1fr) !important; }
      .detail-grid { grid-template-columns: 1fr !important; }
      .admin-grid  { grid-template-columns: 1fr !important; }
      .admin-form-sticky { position: static !important; }
      .browse-head { font-size: 1.8rem !important; }
    }

    /* ── Small tablet / phone landscape (481–768px) ── */
    @media (max-width: 768px) {
      .hero-title  { font-size: 2rem !important; line-height: 1.2 !important; }
      .grid-3      { grid-template-columns: repeat(2, 1fr) !important; }
      .grid-4      { grid-template-columns: repeat(2, 1fr) !important; }
      .hide-mobile { display: none !important; }
      .hero-stats  { gap: 16px !important; }
      .browse-head { font-size: 1.6rem !important; }
      .tg-section  { padding: 28px 20px !important; }
      .detail-grid { grid-template-columns: 1fr !important; }
      .admin-grid  { grid-template-columns: 1fr !important; }
      .admin-form-sticky { position: static !important; }
    }

    /* ── Phone portrait (0–480px) ── */
    @media (max-width: 480px) {
      .hero-title  { font-size: 1.55rem !important; line-height: 1.18 !important; }
      .grid-3      { grid-template-columns: 1fr !important; }
      .grid-4      { grid-template-columns: 1fr 1fr !important; }
      .cat-grid    { grid-template-columns: 1fr 1fr !important; }
      .hero-btns   { flex-direction: column !important; width: 100% !important; }
      .hero-btns a,
      .hero-btns button { width: 100% !important; text-align: center !important; box-sizing: border-box !important; }
      .hero-stats  { gap: 12px !important; flex-wrap: wrap !important; justify-content: center !important; }
      .browse-head { font-size: 1.4rem !important; }
      .filter-row  { overflow-x: auto !important; flex-wrap: nowrap !important; justify-content: flex-start !important; padding-bottom: 6px !important; }
      .sort-row    { overflow-x: auto !important; flex-wrap: nowrap !important; justify-content: flex-start !important; padding-bottom: 4px !important; }
      .filter-pill { flex-shrink: 0 !important; }
      .detail-grid { grid-template-columns: 1fr !important; }
      .admin-grid  { grid-template-columns: 1fr !important; }
      .admin-form-sticky { position: static !important; }
      .section-header { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
      .tg-section  { padding: 24px 16px !important; }
    }

    /* ── Hide scrollbars on filter/sort rows ── */
    @media (max-width: 768px) {
      .filter-row::-webkit-scrollbar,
      .sort-row::-webkit-scrollbar { display: none; }
      .filter-row, .sort-row { -ms-overflow-style: none; scrollbar-width: none; }
    }
  `}</style>
);

// ─── NAVBAR ──────────────────────────────────────────────────────────────────
function Navbar({ dark, toggleDark, page, setPage }) {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const clickCount = useRef(0);
  const clickTimer = useRef(null);

  const handleLogoClick = () => {
    setMenuOpen(false);
    clickCount.current += 1;
    clearTimeout(clickTimer.current);
    if (clickCount.current >= 5) {
      clickCount.current = 0;
      setPage("admin");
    } else {
      setPage("home");
      clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 1200);
    }
  };

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [page]);

  const bg = (scrolled || menuOpen)
    ? (dark ? "rgba(10,10,15,0.96)" : "rgba(244,243,238,0.96)")
    : "transparent";

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      background: bg,
      backdropFilter: (scrolled || menuOpen) ? "blur(24px)" : "none",
      borderBottom: (scrolled || menuOpen) ? "1px solid var(--border)" : "none",
      transition: "background 0.3s, border 0.3s",
    }}>
      <style>{`
        .nav-desktop { display: flex !important; }
        .nav-hamburger { display: none !important; }
        @media (max-width: 768px) {
          .nav-desktop   { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>

      {/* ── Main bar ── */}
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "0 18px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 58,
      }}>
        {/* Logo */}
        <button onClick={handleLogoClick} style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "9px",
            background: "linear-gradient(135deg,#ff6b35,#ffd200)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.95rem", fontWeight: 900, color: "#000",
          }}>C</div>
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.05rem", letterSpacing: "-0.02em" }}>
            Creator<span className="gradient-text">Hub</span>
          </span>
        </button>

        {/* Desktop links */}
        <div className="nav-desktop" style={{ gap: 6, alignItems: "center" }}>
          {[["home","Home"],["browse","Browse"]].map(([p,label]) => (
            <button key={p} onClick={() => setPage(p)} style={{
              background: page === p ? "var(--surface2)" : "none",
              border: page === p ? "1px solid var(--border)" : "1px solid transparent",
              borderRadius: 8, padding: "6px 14px",
              fontFamily: "'Syne',sans-serif", fontWeight: 600,
              fontSize: "0.82rem", cursor: "pointer",
              color: page === p ? "var(--accent)" : "var(--text)",
              transition: "all 0.2s",
            }}>{label}</button>
          ))}
          <a href="#telegram" style={{
            background: "linear-gradient(135deg,#0088cc,#00b4e6)",
            color: "#fff", borderRadius: 8, padding: "6px 14px",
            fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "0.8rem",
            textDecoration: "none", letterSpacing: "0.04em",
          }}>📲 Telegram</a>
          <button onClick={toggleDark} style={{
            background: "var(--surface2)", border: "1px solid var(--border)",
            borderRadius: 8, width: 34, height: 34,
            cursor: "pointer", fontSize: "0.95rem",
          }}>{dark ? "☀️" : "🌙"}</button>
        </div>

        {/* Mobile: dark toggle + hamburger */}
        <div className="nav-hamburger" style={{ alignItems: "center", gap: 8 }}>
          <button onClick={toggleDark} style={{
            background: "var(--surface2)", border: "1px solid var(--border)",
            borderRadius: 8, width: 34, height: 34,
            cursor: "pointer", fontSize: "0.9rem",
          }}>{dark ? "☀️" : "🌙"}</button>
          <button onClick={() => setMenuOpen(o => !o)} style={{
            background: "var(--surface2)", border: "1px solid var(--border)",
            borderRadius: 8, width: 34, height: 34, cursor: "pointer",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "4px",
          }}>
            {[
              menuOpen ? "rotate(45deg) translate(4px,4px)"  : "none",
              null,
              menuOpen ? "rotate(-45deg) translate(4px,-4px)" : "none",
            ].map((transform, i) => transform === null ? (
              <span key={i} style={{
                display: "block", width: 15, height: 2,
                background: "var(--text)", borderRadius: 2,
                opacity: menuOpen ? 0 : 1, transition: "all 0.25s",
              }}/>
            ) : (
              <span key={i} style={{
                display: "block", width: 15, height: 2,
                background: "var(--text)", borderRadius: 2,
                transform, transition: "all 0.25s",
              }}/>
            ))}
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown ── */}
      <div style={{
        maxHeight: menuOpen ? "280px" : "0",
        overflow: "hidden",
        transition: "max-height 0.35s cubic-bezier(.25,.46,.45,.94)",
        borderTop: menuOpen ? "1px solid var(--border)" : "none",
      }}>
        <div style={{ padding: "10px 16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
          {[["home","🏠  Home"],["browse","🔍  Browse Resources"]].map(([p,label]) => (
            <button key={p} onClick={() => setPage(p)} style={{
              background: page === p ? "rgba(255,107,53,0.08)" : "var(--surface2)",
              border: `1px solid ${page === p ? "rgba(255,107,53,0.3)" : "var(--border)"}`,
              borderRadius: 10, padding: "12px 16px", textAlign: "left",
              fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: "0.9rem",
              cursor: "pointer", color: page === p ? "var(--accent)" : "var(--text)",
            }}>{label}</button>
          ))}
          <a href="#telegram" onClick={() => setMenuOpen(false)} style={{
            background: "linear-gradient(135deg,rgba(0,136,204,0.12),rgba(0,180,230,0.06))",
            border: "1px solid rgba(0,136,204,0.25)",
            borderRadius: 10, padding: "12px 16px",
            fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "0.9rem",
            textDecoration: "none", color: "#00b4e6", display: "block",
          }}>📲  Join Telegram</a>
        </div>
      </div>
    </nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero({ setPage }) {
  return (
    <section style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", flexDirection: "column", textAlign: "center",
      padding: "80px 20px 50px", position: "relative", overflow: "hidden", width: "100%",
    }}>
      {/* BG orbs */}
      <div style={{
        position: "absolute", width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(255,107,53,0.18) 0%,transparent 70%)",
        top: "10%", left: "20%", filter: "blur(60px)", pointerEvents: "none",
      }}/>
      <div style={{
        position: "absolute", width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(78,205,196,0.14) 0%,transparent 70%)",
        bottom: "15%", right: "15%", filter: "blur(60px)", pointerEvents: "none",
      }}/>

      {/* Badge */}
      <div className="fade-up glass" style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "6px 16px", borderRadius: 30, marginBottom: 28,
        fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.06em",
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "#38ef7d", boxShadow: "0 0 8px #38ef7d",
          display: "inline-block", animation: "pulse-glow 2s infinite",
        }}/>
        1,200+ Free Resources · Updated Weekly
      </div>

      <h1 className="fade-up delay-1 hero-title" style={{
        fontFamily: "'Syne',sans-serif", fontWeight: 800,
        fontSize: "clamp(1.6rem,3.8vw,3.2rem)",
        lineHeight: 1.1, letterSpacing: "-0.03em",
        maxWidth: 820, marginBottom: 20,
      }}>
        All-in-One Free Resource Hub<br/>
        <span className="gradient-text">for Creators & Students</span>
      </h1>

      <p className="fade-up delay-2" style={{
        fontSize: "clamp(0.88rem,1.5vw,1.05rem)", color: "var(--muted)", maxWidth: 560,
        lineHeight: 1.7, marginBottom: 36,
      }}>
        Video packs, study notes, Notion templates, anime edits & more —
        all curated, all free (or premium), zero fluff.
      </p>

      <div className="fade-up delay-3 hero-btns" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button className="btn-primary" onClick={() => setPage("browse")} style={{ padding: "14px 30px", fontSize: "0.95rem" }}>
          🚀 Browse Packs
        </button>
        <a href="#telegram" className="btn-secondary" style={{ padding: "14px 30px", fontSize: "0.95rem", textDecoration: "none", color: "var(--text)" }}>
          📲 Join Telegram
        </a>
      </div>

      {/* Stats row */}
      <div className="fade-up delay-4" style={{
        display: "flex", gap: 32, marginTop: 60, flexWrap: "wrap", justifyContent: "center", className: "hero-stats",
      }}>
        {[["120k+","Downloads"],["1.2k+","Resources"],["12","Categories"],["Free","Always"]].map(([v,l]) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.1rem,2.5vw,1.6rem)" }}
              className="gradient-text">{v}</div>
            <div style={{ color: "var(--muted)", fontSize: "0.78rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── RESOURCE CARD ───────────────────────────────────────────────────────────
function ResourceCard({ resource, onClick }) {
  const cat = CATEGORIES.find((c) => c.id === resource.category);
  return (
    <div className="glass lift" onClick={() => onClick(resource)} style={{
      cursor: "pointer", overflow: "hidden", position: "relative",
    }}>
      <Thumb resource={resource} size="card" />
      <div style={{ padding: "14px 16px 16px" }}>
        {/* Category + price */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{
            fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: cat?.color || "var(--accent)",
          }}>{cat?.icon} {cat?.label}</span>
          <span style={{
            fontSize: "0.68rem", fontWeight: 800, padding: "2px 8px",
            borderRadius: 20, letterSpacing: "0.06em",
            background: resource.premium
              ? "linear-gradient(135deg,#f7971e22,#ffd20022)"
              : "rgba(56,239,125,0.12)",
            color: resource.premium ? "#ffd200" : "#38ef7d",
            border: `1px solid ${resource.premium ? "#ffd20033" : "#38ef7d33"}`,
          }}>{resource.price}</span>
        </div>
        <h3 style={{
          fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "0.95rem",
          letterSpacing: "-0.01em", marginBottom: 6, lineHeight: 1.3,
        }}>{resource.title}</h3>
        <p style={{ fontSize: "0.78rem", color: "var(--muted)", lineHeight: 1.5, marginBottom: 12,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{resource.description}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
            ⬇️ {formatNum(resource.downloads)}
          </span>
          {resource.trending && (
            <span style={{
              fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px",
              background: "rgba(255,107,53,0.12)", color: "var(--accent)",
              border: "1px solid rgba(255,107,53,0.25)", borderRadius: 20,
              letterSpacing: "0.08em",
            }}>🔥 TRENDING</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SECTION HEADER ──────────────────────────────────────────────────────────
function SectionHeader({ title, sub, action, onAction }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
      <div>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.2rem,2.5vw,1.5rem)", letterSpacing: "-0.02em" }}>
          {title}
        </h2>
        {sub && <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: 4 }}>{sub}</p>}
      </div>
      {action && (
        <button onClick={onAction} style={{
          background: "none", border: "1px solid var(--border)", borderRadius: 8,
          padding: "6px 14px", cursor: "pointer", color: "var(--accent)",
          fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: "0.8rem",
          transition: "all 0.2s",
        }}>{action} →</button>
      )}
    </div>
  );
}

// ─── HOMEPAGE ─────────────────────────────────────────────────────────────────
function HomePage({ resources, setPage, setDetailResource }) {
  const trending  = resources.filter((r) => r.trending).slice(0, 4);
  const newUploads = resources.filter((r) => r.isNew).slice(0, 4);

  const goDetail = (r) => { setDetailResource(r); setPage("detail"); };
  const goAll    = ()  => setPage("browse");

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>
      <Hero setPage={setPage} />

      {/* Categories */}
      <section style={{ marginBottom: 64 }}>
        <SectionHeader title="Browse Categories" sub="Everything you need, organized." />
        <div className="grid-4 cat-grid" style={{
          display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16,
        }}>
          {CATEGORIES.map((cat) => {
            const count = resources.filter((r) => r.category === cat.id).length;
            return (
              <div key={cat.id} className="glass lift" onClick={() => setPage("browse")} style={{
                padding: "22px 20px", cursor: "pointer",
                borderLeft: `3px solid ${cat.color}`,
              }}>
                <div style={{ fontSize: "1.8rem", marginBottom: 10 }}>{cat.icon}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "clamp(0.8rem,1.5vw,0.95rem)", marginBottom: 4 }}>
                  {cat.label}
                </div>
                <div style={{ color: "var(--muted)", fontSize: "0.75rem" }}>{count} resources</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trending */}
      <section style={{ marginBottom: 64 }}>
        <SectionHeader title="🔥 Trending Resources" sub="Most downloaded this week" action="See All" onAction={goAll} />
        <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
          {trending.map((r) => <ResourceCard key={r.id} resource={r} onClick={goDetail} />)}
        </div>
      </section>

      {/* New */}
      <section style={{ marginBottom: 64 }}>
        <SectionHeader title="✨ New Uploads" sub="Fresh content just dropped" action="See All" onAction={goAll} />
        <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
          {newUploads.map((r) => <ResourceCard key={r.id} resource={r} onClick={goDetail} />)}
        </div>
      </section>

      {/* Telegram CTA */}
      <section id="telegram" className="glass tg-section" style={{
        background: "linear-gradient(135deg,rgba(0,136,204,0.12),rgba(0,180,230,0.06))",
        border: "1px solid rgba(0,136,204,0.2)",
        borderRadius: 20, padding: "40px 40px", textAlign: "center",
        marginBottom: 64,
      }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>📲</div>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.8rem", marginBottom: 10 }}>
          Never Miss a Drop
        </h2>
        <p style={{ color: "var(--muted)", maxWidth: 440, margin: "0 auto 24px", lineHeight: 1.7 }}>
          Join 48,000+ creators on our Telegram. Get instant alerts when new packs drop — for free.
        </p>
        <a href="#" className="btn-primary" style={{
          display: "inline-block", textDecoration: "none",
          background: "linear-gradient(135deg,#0088cc,#00b4e6)",
          padding: "14px 32px", fontSize: "0.95rem",
        }}>
          Join Telegram Channel →
        </a>
      </section>

      {/* Ad placeholder */}
      <div style={{
        border: "1px dashed var(--border)", borderRadius: 14,
        padding: "20px", textAlign: "center", color: "var(--muted)",
        fontSize: "0.75rem", letterSpacing: "0.08em", marginBottom: 40,
      }}>
        AD PLACEMENT · 728×90 Banner
      </div>
    </main>
  );
}

// ─── BROWSE / LISTING PAGE ────────────────────────────────────────────────────
function BrowsePage({ resources, setPage, setDetailResource }) {
  const [search, setSearch]     = useState("");
  const [catFilter, setCat]     = useState("all");
  const [sortBy, setSort]       = useState("trending");

  const filtered = useMemo(() => {
    let list = [...resources];
    if (catFilter !== "all") list = list.filter((r) => r.category === catFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (sortBy === "trending") list.sort((a,b) => b.downloads - a.downloads);
    else if (sortBy === "new") list.sort((a,b) => (b.isNew?1:0) - (a.isNew?1:0));
    else if (sortBy === "free") list.sort((a,b) => (a.premium?1:0)-(b.premium?1:0));
    return list;
  }, [resources, catFilter, search, sortBy]);

  const goDetail = (r) => { setDetailResource(r); setPage("detail"); };

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 24px 80px" }}>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <h1 className="browse-head" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "2.2rem", letterSpacing: "-0.03em", marginBottom: 8 }}>
          Browse All Resources
        </h1>
        <p style={{ color: "var(--muted)" }}>Find exactly what you need from {resources.length}+ curated packs</p>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20, maxWidth: 500, margin: "0 auto 20px" }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: "1rem" }}>🔍</span>
        <input
          className="search-input"
          placeholder="Search resources, tags…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="filter-row" style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 16 }}>
        <button className={`filter-pill${catFilter==="all"?" active":""}`} onClick={() => setCat("all")}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c.id} className={`filter-pill${catFilter===c.id?" active":""}`}
            onClick={() => setCat(c.id)}>{c.icon} {c.label}</button>
        ))}
      </div>

      {/* Sort */}
      <div className="sort-row" style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 36 }}>
        {[["trending","🔥 Trending"],["new","✨ Newest"],["free","🎁 Free First"]].map(([v,l]) => (
          <button key={v} onClick={() => setSort(v)} style={{
            background: sortBy===v ? "var(--accent)" : "var(--surface2)",
            border: `1px solid ${sortBy===v ? "var(--accent)" : "var(--border)"}`,
            borderRadius: 8, padding: "6px 14px",
            fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: "0.78rem",
            cursor: "pointer", color: sortBy===v ? "#fff" : "var(--text)", transition: "all 0.2s",
          }}>{l}</button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>🔍</div>
          <p>No resources found. Try a different search or filter.</p>
        </div>
      ) : (
        <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {filtered.map((r) => <ResourceCard key={r.id} resource={r} onClick={goDetail} />)}
        </div>
      )}
    </main>
  );
}

// ─── DETAIL PAGE ──────────────────────────────────────────────────────────────
function DetailPage({ resource, resources, setPage, setDetailResource }) {
  if (!resource) { setPage("browse"); return null; }
  const cat = CATEGORIES.find((c) => c.id === resource.category);
  const related = resources.filter((r) => r.category === resource.category && r.id !== resource.id).slice(0, 3);

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 24px 80px" }}>
      <button onClick={() => setPage("browse")} style={{
        background: "none", border: "1px solid var(--border)", borderRadius: 8,
        padding: "7px 14px", cursor: "pointer", color: "var(--muted)",
        fontFamily: "'Syne',sans-serif", fontSize: "0.8rem", marginBottom: 28,
        transition: "all 0.2s",
      }}>← Back to Browse</button>

      <div className="detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32 }}>
        {/* Left */}
        <div>
          <Thumb resource={resource} size="full" />
          <div style={{ marginTop: 24 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {resource.tags.map((t) => <span key={t} className="tag">{t}</span>)}
            </div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.9rem",
              letterSpacing: "-0.02em", marginBottom: 12 }}>{resource.title}</h1>
            <p style={{ color: "var(--muted)", lineHeight: 1.8, fontSize: "0.95rem" }}>{resource.description}</p>
          </div>
        </div>

        {/* Right: sidebar */}
        <div>
          <div className="glass" style={{ padding: 24, position: "sticky", top: 84 }}>
            <div style={{ marginBottom: 20 }}>
              <span style={{ color: cat?.color, fontFamily: "'Syne',sans-serif", fontWeight: 700,
                fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {cat?.icon} {cat?.label}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ color: "var(--muted)", fontSize: "0.72rem", marginBottom: 2 }}>Price</div>
                <div style={{
                  fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.2rem",
                  color: resource.premium ? "#ffd200" : "#38ef7d",
                }}>{resource.price}</div>
              </div>
              <div>
                <div style={{ color: "var(--muted)", fontSize: "0.72rem", marginBottom: 2 }}>Downloads</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.2rem" }}>
                  {formatNum(resource.downloads)}
                </div>
              </div>
            </div>

            <a href={resource.downloadLink} className="btn-download" style={{
              width: "100%", justifyContent: "center", textDecoration: "none",
              padding: "14px", fontSize: "0.9rem", borderRadius: 12, marginBottom: 12,
            }}>
              ⬇️ Download Now
            </a>
            <a href="#telegram" style={{
              display: "block", textAlign: "center",
              color: "var(--muted)", fontSize: "0.78rem", textDecoration: "none",
              padding: "8px",
            }}>📲 Get updates on Telegram</a>

            <div style={{ borderTop: "1px solid var(--border)", marginTop: 20, paddingTop: 20 }}>
              {resource.trending && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: "0.8rem" }}>
                  <span>🔥</span><span style={{ color: "var(--accent)" }}>Trending this week</span>
                </div>
              )}
              {resource.isNew && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem" }}>
                  <span>✨</span><span style={{ color: "#38ef7d" }}>Newly added</span>
                </div>
              )}
            </div>

            {/* Ad */}
            <div style={{
              marginTop: 20, border: "1px dashed var(--border)", borderRadius: 10,
              padding: "12px", textAlign: "center", color: "var(--muted)",
              fontSize: "0.65rem", letterSpacing: "0.08em",
            }}>AD · 300×250</div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section style={{ marginTop: 60 }}>
          <SectionHeader title="Related Resources" sub={`More from ${cat?.label}`} />
          <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {related.map((r) => <ResourceCard key={r.id} resource={r} onClick={(res) => { setDetailResource(res); window.scrollTo(0,0); }} />)}
          </div>
        </section>
      )}
    </main>
  );
}

// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────
const SUPABASE_URL     = "https://umnytptisqdvesspzlqd.supabase.co";
const SUPABASE_ANON    = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtbnl0cHRpc3FkdmVzc3B6bHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNTM0MDMsImV4cCI6MjA4OTgyOTQwM30.lt-MSfi6afdjZKTJhvhfT7OPqc4yHSaZo9lp5aLUQTg";
const AUTH             = `${SUPABASE_URL}/auth/v1`;

// Light Supabase auth wrapper — no SDK needed
const sbAuth = {
  async signIn(email, password) {
    const r = await fetch(`${AUTH}/token?grant_type=password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON },
      body: JSON.stringify({ email, password }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error_description || d.msg || "Login failed");
    return d; // { access_token, refresh_token, user, expires_in }
  },

  async signOut(token) {
    await fetch(`${AUTH}/logout`, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` },
    });
  },

  async refreshSession(refresh_token) {
    const r = await fetch(`${AUTH}/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON },
      body: JSON.stringify({ refresh_token }),
    });
    const d = await r.json();
    if (!r.ok) return null;
    return d;
  },

  async getUser(token) {
    const r = await fetch(`${AUTH}/user`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return null;
    return r.json();
  },
};

const SESSION_KEY = "ch_supabase_session";

// ─── ADMIN LOGIN GATE (Supabase) ──────────────────────────────────────────────
function AdminGate({ children }) {
  const [session,    setSession]    = useState(null);
  const [checking,   setChecking]   = useState(true);
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [error,      setError]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [shake,      setShake]      = useState(false);
  const [showPass,   setShowPass]   = useState(false);

  // On mount: restore + validate saved session
  useEffect(() => {
    (async () => {
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);

        // Check if access token still valid
        const user = await sbAuth.getUser(saved.access_token);
        if (user) {
          setSession(saved);
        } else {
          // Try refresh
          const fresh = await sbAuth.refreshSession(saved.refresh_token);
          if (fresh) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(fresh));
            setSession(fresh);
          } else {
            localStorage.removeItem(SESSION_KEY);
          }
        }
      } catch (_) {
        localStorage.removeItem(SESSION_KEY);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  const login = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true); setError("");
    try {
      const data = await sbAuth.signIn(email.trim(), password);
      localStorage.setItem(SESSION_KEY, JSON.stringify(data));
      setSession(data);
    } catch (e) {
      setError(e.message);
      setShake(true);
      setPassword("");
      setTimeout(() => setShake(false), 600);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try { await sbAuth.signOut(session?.access_token); } catch (_) {}
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setEmail(""); setPassword(""); setError("");
  };

  // ── Checking saved session ──
  if (checking) return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{
        width: 36, height: 36, border: "3px solid var(--border)",
        borderTopColor: "var(--accent)", borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Verifying session…</p>
    </main>
  );

  // ── Authenticated ──
  if (session) return children({ logout, user: session.user });

  // ── Login form ──
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "24px" }}>
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-9px)} 40%{transform:translateX(9px)}
          60%{transform:translateX(-6px)} 80%{transform:translateX(6px)}
        }
        .shake { animation: shake 0.5s ease; }
      `}</style>

      <div className={`glass${shake ? " shake" : ""}`} style={{
        padding: "44px 40px", maxWidth: 400, width: "100%", textAlign: "center",
      }}>
        {/* Lock icon */}
        <div style={{
          width: 60, height: 60, borderRadius: "16px", margin: "0 auto 20px",
          background: "linear-gradient(135deg,rgba(255,107,53,0.2),rgba(255,210,0,0.1))",
          border: "1px solid rgba(255,107,53,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem",
        }}>🔐</div>

        <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800,
          fontSize: "1.5rem", marginBottom: 6 }}>Admin Login</h2>
        <p style={{ color: "var(--muted)", fontSize: "0.82rem", marginBottom: 30, lineHeight: 1.6 }}>
          Authenticated via Supabase.<br/>Your credentials never touch this code.
        </p>

        {/* Email */}
        <div style={{ position: "relative", marginBottom: 10 }}>
          <span style={{ position: "absolute", left: 13, top: "50%",
            transform: "translateY(-50%)", fontSize: "1rem", pointerEvents: "none" }}>✉️</span>
          <input
            type="email" placeholder="Admin email" value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && login()}
            autoFocus
            style={{
              width: "100%", background: "var(--surface2)",
              border: `1px solid ${error ? "#ff3b30" : "var(--border)"}`,
              borderRadius: 10, padding: "12px 14px 12px 40px",
              color: "var(--text)", fontFamily: "'DM Sans',sans-serif",
              fontSize: "0.92rem", outline: "none", transition: "border-color 0.2s",
            }}
          />
        </div>

        {/* Password */}
        <div style={{ position: "relative", marginBottom: error ? 8 : 20 }}>
          <span style={{ position: "absolute", left: 13, top: "50%",
            transform: "translateY(-50%)", fontSize: "1rem", pointerEvents: "none" }}>🔑</span>
          <input
            type={showPass ? "text" : "password"} placeholder="Password" value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && login()}
            style={{
              width: "100%", background: "var(--surface2)",
              border: `1px solid ${error ? "#ff3b30" : "var(--border)"}`,
              borderRadius: 10, padding: "12px 44px 12px 40px",
              color: "var(--text)", fontFamily: "'DM Sans',sans-serif",
              fontSize: "0.92rem", outline: "none", transition: "border-color 0.2s",
            }}
          />
          <button onClick={() => setShowPass(!showPass)} style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", fontSize: "1rem",
            opacity: 0.5,
          }}>{showPass ? "🙈" : "👁️"}</button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.25)",
            borderRadius: 8, padding: "8px 12px", marginBottom: 16,
            color: "#ff3b30", fontSize: "0.78rem", textAlign: "left",
          }}>❌ {error}</div>
        )}

        {/* Submit */}
        <button className="btn-primary" onClick={login} disabled={loading}
          style={{ width: "100%", padding: "13px", fontSize: "0.9rem",
            opacity: loading ? 0.75 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading
            ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={{ width: 14, height: 14, border: "2px solid #fff",
                  borderTopColor: "transparent", borderRadius: "50%",
                  animation: "spin 0.7s linear infinite", display: "inline-block" }}/>
                Signing in…
              </span>
            : "Sign In →"}
        </button>

        <p style={{ color: "var(--muted)", fontSize: "0.72rem", marginTop: 20, lineHeight: 1.6 }}>
          🔒 Secured by Supabase Auth · Session auto-expires
        </p>
      </div>
    </main>
  );
}

// ─── ADMIN FIELD (must be outside AdminPage to avoid focus loss) ──────────────
function AdminField({ label, field, type = "text", options, form, setForm }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label ? (
        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)",
          textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</label>
      ) : null}
      {options ? (
        <select value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "9px 12px", color: "var(--text)",
            fontFamily: "'DM Sans',sans-serif", fontSize: "0.9rem", outline: "none" }}>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : type === "textarea" ? (
        <textarea value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          rows={3} style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "9px 12px", color: "var(--text)",
            fontFamily: "'DM Sans',sans-serif", fontSize: "0.9rem", outline: "none", resize: "vertical" }} />
      ) : type === "checkbox" ? (
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.checked })}
            style={{ width: 16, height: 16, accentColor: "var(--accent)" }} />
          <span style={{ fontSize: "0.85rem" }}>Yes</span>
        </label>
      ) : (
        <input type={type} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "9px 12px", color: "var(--text)",
            fontFamily: "'DM Sans',sans-serif", fontSize: "0.9rem", outline: "none" }} />
      )}
    </div>
  );
}

// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────
function AdminPage({ resources, setResources, logout, user }) {
  const empty = { id: Date.now(), title: "", category: "video", description: "", tags: "",
    price: "Free", trending: false, premium: false, isNew: true, downloadLink: "", downloads: 0 };
  const [form, setForm]   = useState(empty);
  const [editing, setEd]  = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const save = () => {
    if (!form.title || !form.description) { showToast("❌ Title & description required"); return; }
    const entry = {
      ...form,
      id: editing ?? Date.now(),
      tags: typeof form.tags === "string" ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : form.tags,
    };
    if (editing) {
      setResources((prev) => prev.map((r) => r.id === editing ? entry : r));
      showToast("✅ Resource updated!");
    } else {
      setResources((prev) => [entry, ...prev]);
      showToast("✅ Resource added!");
    }
    setForm(empty); setEd(null);
  };

  const del = (id) => {
    if (window.confirm("Delete this resource?")) {
      setResources((prev) => prev.filter((r) => r.id !== id));
      showToast("🗑️ Deleted");
    }
  };

  const edit = (r) => {
    setEd(r.id);
    setForm({ ...r, tags: Array.isArray(r.tags) ? r.tags.join(", ") : r.tags });
    window.scrollTo(0, 0);
  };



  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px 80px" }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "var(--surface2)", border: "1px solid var(--border)",
          borderRadius: 10, padding: "10px 22px", zIndex: 999,
          fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: "0.85rem",
          boxShadow: "var(--shadow)", backdropFilter: "blur(20px)",
        }}>{toast}</div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "2rem" }}>
          ⚙️ Admin Panel
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {user?.email && (
            <span style={{ fontSize: "0.75rem", color: "var(--muted)",
              background: "var(--surface2)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "5px 10px" }}>
              ✅ {user.email}
            </span>
          )}
          <button onClick={logout}
            style={{
              background: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.25)",
              borderRadius: 8, padding: "7px 14px", cursor: "pointer",
              fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: "0.78rem", color: "#ff3b30",
            }}>🔓 Logout</button>
        </div>
      </div>
      <p style={{ color: "var(--muted)", marginBottom: 36 }}>Add, edit, or remove resources from CreatorHub</p>

      <div className="admin-grid" style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 32 }}>
        {/* Form */}
        <div className="glass" className="admin-form-sticky" style={{ padding: 24, height: "fit-content", position: "sticky", top: 84 }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1rem", marginBottom: 20 }}>
            {editing ? "✏️ Edit Resource" : "➕ Add Resource"}
          </h2>
          <AdminField label="Title" field="title" form={form} setForm={setForm} />
          <AdminField label="Category" field="category" options={CATEGORIES.map(cat => ({ value: cat.id, label: `${cat.icon} ${cat.label}` }))} form={form} setForm={setForm} />
          <AdminField label="Description" field="description" type="textarea" form={form} setForm={setForm} />
          <AdminField label="Tags (comma-separated)" field="tags" form={form} setForm={setForm} />
          <AdminField label="Price" field="price" options={[{value:"Free",label:"Free"},{value:"Premium",label:"Premium"}]} form={form} setForm={setForm} />
          <AdminField label="Download Link" field="downloadLink" form={form} setForm={setForm} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize:"0.7rem",fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:6}}>Trending</label>
              <AdminField label="" field="trending" type="checkbox" form={form} setForm={setForm} />
            </div>
            <div>
              <label style={{ fontSize:"0.7rem",fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:6}}>Premium</label>
              <AdminField label="" field="premium" type="checkbox" form={form} setForm={setForm} />
            </div>
            <div>
              <label style={{ fontSize:"0.7rem",fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:6}}>New</label>
              <AdminField label="" field="isNew" type="checkbox" form={form} setForm={setForm} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary" onClick={save} style={{ flex: 1, padding: "11px" }}>
              {editing ? "Update" : "Add Resource"}
            </button>
            {editing && (
              <button className="btn-secondary" onClick={() => { setForm(empty); setEd(null); }} style={{ padding: "11px 14px" }}>
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1rem", marginBottom: 16 }}>
            All Resources ({resources.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {resources.map((r) => {
              const cat = CATEGORIES.find((c) => c.id === r.category);
              return (
                <div key={r.id} className="glass" style={{
                  padding: "14px 18px", display: "flex", alignItems: "center",
                  gap: 14, justifyContent: "space-between",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "0.9rem",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.title}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.7rem", color: cat?.color }}>{cat?.icon} {cat?.label}</span>
                      {r.trending && <span style={{ fontSize: "0.65rem", color: "var(--accent)" }}>🔥 Trending</span>}
                      {r.premium  && <span style={{ fontSize: "0.65rem", color: "#ffd200" }}>⭐ Premium</span>}
                      {r.isNew    && <span style={{ fontSize: "0.65rem", color: "#38ef7d" }}>✨ New</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => edit(r)} style={{
                      background: "var(--surface2)", border: "1px solid var(--border)",
                      borderRadius: 8, padding: "6px 12px", cursor: "pointer",
                      fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: "0.75rem", color: "var(--text)",
                    }}>✏️ Edit</button>
                    <button onClick={() => del(r.id)} style={{
                      background: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.25)",
                      borderRadius: 8, padding: "6px 12px", cursor: "pointer",
                      fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: "0.75rem", color: "#ff3b30",
                    }}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer({ setPage }) {
  return (
    <footer style={{
      borderTop: "1px solid var(--border)",
      background: "var(--bg2)",
      padding: "40px 24px",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 24, marginBottom: 32 }}>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.2rem", marginBottom: 8 }}>
              Creator<span className="gradient-text">Hub</span>
            </div>
            <p style={{ color: "var(--muted)", fontSize: "0.82rem", maxWidth: 280, lineHeight: 1.6 }}>
              The free resource hub for creators and students. Video packs, study notes, templates & more.
            </p>
          </div>
          <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
            {[
              ["Navigate", [["Home","home"],["Browse","browse"],["Admin","admin"]]],
              ["Categories", CATEGORIES.map(c => [c.label,"browse"])],
            ].map(([heading, links]) => (
              <div key={heading}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "0.8rem",
                  textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, color: "var(--muted)" }}>
                  {heading}
                </div>
                {links.map(([label, page]) => (
                  <div key={label} style={{ marginBottom: 8 }}>
                    <button onClick={() => setPage(page)} style={{
                      background: "none", border: "none", color: "var(--text)",
                      fontSize: "0.85rem", cursor: "pointer", padding: 0, transition: "color 0.2s",
                    }}>{label}</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20,
          display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p style={{ color: "var(--muted)", fontSize: "0.78rem" }}>
            © 2025 CreatorHub · Made with ❤️ for creators
          </p>
        <p style={{ color: "var(--muted)", fontSize: "0.78px", opacity: 0.01 }}>
          <button onClick={() => setPage("admin")} style={{ background:"none",border:"none",cursor:"default",color:"transparent",fontSize:"1px" }}>admin</button>
        </p>
        <p style={{ color: "var(--muted)", fontSize: "0.78rem" }}>
          All resources for educational & creative use
        </p>
        </div>
      </div>
    </footer>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark]               = useState(true);
  const [page, setPage]               = useState("home");
  const [resources, setResources]     = useState(initialResources);
  const [detailResource, setDetailRes] = useState(null);

  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  return (
    <>
      <GlobalStyle dark={dark} />
      <Navbar
        dark={dark} toggleDark={() => setDark(!dark)}
        page={page} setPage={setPage}
        searchVal="" setSearchVal={() => {}}
      />

      {page === "home" && (
        <HomePage
          resources={resources}
          setPage={setPage}
          setDetailResource={setDetailRes}
        />
      )}
      {page === "browse" && (
        <BrowsePage
          resources={resources}
          setPage={setPage}
          setDetailResource={setDetailRes}
        />
      )}
      {page === "detail" && (
        <DetailPage
          resource={detailResource}
          resources={resources}
          setPage={setPage}
          setDetailResource={setDetailRes}
        />
      )}
      {page === "admin" && (
        <AdminGate>
          {({ logout, user }) => (
            <AdminPage
              resources={resources}
              setResources={setResources}
              logout={logout}
              user={user}
            />
          )}
        </AdminGate>
      )}

      <Footer setPage={setPage} />
    </>
  );
}
