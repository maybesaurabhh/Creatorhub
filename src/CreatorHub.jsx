import { useState, useEffect, useMemo, useRef } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://umnytptisqdvesspzlqd.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtbnl0cHRpc3FkdmVzc3B6bHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNTM0MDMsImV4cCI6MjA4OTgyOTQwM30.lt-MSfi6afdjZKTJhvhfT7OPqc4yHSaZo9lp5aLUQTg";
const SESSION_KEY = "ch_supabase_session";

const CATEGORIES = [
  { id: "video", label: "Video", icon: "🎬", color: "#ff6b35" },
  { id: "study", label: "Study", icon: "📚", color: "#4ecdc4" },
  { id: "productivity", label: "Productivity", icon: "⚡", color: "#ffe66d" },
  { id: "reels", label: "Reels", icon: "🎞️", color: "#a8edea" },
];

// ─── API ENGINE (BULLETPROOF) ────────────────────────────────────────────────
const db = {
  async getAll() {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/resources?select=*&order=created_at.desc`, {
        headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` }
      });
      return r.ok ? r.json() : [];
    } catch { return []; }
  },
  async upsert(data, token, id = null) {
    const method = id ? "PATCH" : "POST";
    const url = id ? `${SUPABASE_URL}/rest/v1/resources?id=eq.${id}` : `${SUPABASE_URL}/rest/v1/resources`;
    const r = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    return r.ok;
  },
  async delete(id, token) {
    await fetch(`${SUPABASE_URL}/rest/v1/resources?id=eq.${id}`, {
      method: "DELETE",
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` }
    });
  }
};

// ─── STYLES (INSANE TIER + MOBILE SAFE) ──────────────────────────────────────
const GlobalStyle = ({ dark, accent }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    
    :root {
      --bg: ${dark ? "#030305" : "#fdfdfd"};
      --text: ${dark ? "#ffffff" : "#0a0a0a"};
      --muted: ${dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"};
      --accent: ${accent || "#ff6b35"};
      --border: ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"};
      --glass: ${dark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.7)"};
      --glass-hover: ${dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)"};
    }

    body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; overflow-x: hidden; transition: background 0.6s ease; }

    /* 🎥 CINEMATIC GRAIN OVERLAY */
    body::after {
      content: ""; position: fixed; inset: 0; z-index: 9998; pointer-events: none; opacity: 0.03;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    }

    /* 🌊 LIQUID BACKGROUND & AURA */
    .motion-bg { position: fixed; inset: 0; z-index: -2; overflow: hidden; filter: blur(90px); opacity: 0.4; }
    .blob { position: absolute; width: 50vw; height: 50vw; min-width: 400px; min-height: 400px; background: var(--accent); animation: morph 15s infinite alternate ease-in-out; }
    .blob-1 { top: -10%; left: -10%; border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
    .blob-2 { bottom: -10%; right: -10%; background: #a855f7; animation-delay: -5s; border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
    @keyframes morph { 0% { transform: translate(0,0) rotate(0deg) scale(1); } 100% { transform: translate(10vw, 10vh) rotate(90deg) scale(1.1); } }
    
    .aura { position: fixed; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, var(--accent) 0%, transparent 60%); filter: blur(100px); opacity: 0.1; pointer-events: none; z-index: -1; transition: transform 0.2s ease-out; }

    /* 🚀 HERO (ANTI-OVERLAP FLEX) */
    .hero-container { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding-top: 5vh; }
    .premium-title { font-family: 'Syne'; font-size: clamp(3.5rem, 15vw, 8rem); font-weight: 800; line-height: 0.8; letter-spacing: -0.05em; text-transform: uppercase; margin-bottom: 5px; }
    .vault-title { font-family: 'Syne'; font-size: clamp(3rem, 12vw, 6.5rem); font-weight: 800; color: var(--accent); line-height: 0.8; text-transform: uppercase; }

    /* 📦 LAYOUT & COMPONENTS */
    .grid { display: grid; gap: 24px; width: 100%; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
    
    .glass { background: var(--glass); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid var(--border); border-radius: 24px; padding: 30px; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    .card-hover { cursor: pointer; }
    .card-hover:hover { transform: translateY(-12px); background: var(--glass-hover); border-color: var(--accent); box-shadow: 0 25px 50px rgba(0,0,0,0.4); }

    /* ✨ ANIMATIONS */
    .spring-up { opacity: 0; animation: springUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
    @keyframes springUp { from { opacity: 0; transform: translateY(50px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }

    /* 🎛️ CONTROLS */
    .input-art { width: 100%; padding: 18px 24px; border-radius: 16px; border: 1px solid var(--border); background: var(--glass); color: var(--text); font-size: 1rem; margin-bottom: 16px; outline: none; transition: 0.3s; font-family: inherit; }
    .input-art:focus { border-color: var(--accent); background: var(--glass-hover); box-shadow: 0 0 0 4px rgba(255,107,53,0.1); }
    
    .btn-art { background: var(--accent); color: #fff; border: none; padding: 18px 32px; border-radius: 16px; font-family: 'Syne'; font-weight: 800; cursor: pointer; transition: 0.3s; text-transform: uppercase; letter-spacing: 2px; width: 100%; }
    .btn-art:hover:not(:disabled) { transform: translateY(-4px); box-shadow: 0 15px 30px var(--accent)50; filter: brightness(1.2); }
    .btn-art:disabled { opacity: 0.5; cursor: not-allowed; }

    .pill-scroll { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 15px; justify-content: center; scrollbar-width: none; }
    .pill { padding: 12px 24px; border-radius: 40px; background: var(--glass); border: 1px solid var(--border); color: var(--text); font-weight: 700; cursor: pointer; white-space: nowrap; font-family: 'Syne'; transition: 0.3s; }
    .pill.active { background: var(--accent); color: #fff; border-color: var(--accent); transform: scale(1.05); }

    /* ADMIN ISOLATION */
    .admin-grid { display: grid; gap: 40px; grid-template-columns: 1fr; }
    @media (min-width: 900px) { .admin-grid { grid-template-columns: 1fr 1fr; } }
  `}</style>
);

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(true);
  const [accent, setAccent] = useState("#ff6b35");
  const [page, setPage] = useState("home");
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [detailItem, setDetailItem] = useState(null);
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem(SESSION_KEY)));
  const [scrollY, setScrollY] = useState(0);

  // 🛡️ Secret Access Logic
  const clickCount = useRef(0);
  const clickTimer = useRef(null);

  const fetchAll = async () => { setResources(await db.getAll()); };
  
  useEffect(() => { 
    fetchAll();
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSecretAccess = () => {
    clickCount.current += 1;
    clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 1500);
    if (clickCount.current >= 5) {
      setPage("admin");
      clickCount.current = 0;
    }
  };

  const filtered = useMemo(() => {
    return resources.filter(r => {
      const matchText = r.title?.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCat === "all" || r.category === activeCat;
      return matchText && matchCat;
    });
  }, [resources, search, activeCat]);

  return (
    <>
      <GlobalStyle dark={dark} accent={accent} />
      
      {/* 🌊 MOTION ENGINE */}
      <div className="motion-bg"><div className="blob blob-1"/><div className="blob blob-2"/></div>
      <div className="aura" style={{ transform: `translate(10vw, ${scrollY * 0.4}px)` }} />
      
      {/* 🧭 NAVIGATION (Z-INDEX 9999) */}
      <nav style={{ position: "fixed", top: 0, width: "100%", zIndex: 9999, padding: "20px 5%", display: "flex", justifyContent: "space-between", alignItems: "center", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
        <h2 onClick={handleSecretAccess} style={{ cursor: "pointer", fontFamily: 'Syne', fontWeight: 800, fontSize: "1.5rem" }}>
          Creator<span style={{color:'var(--accent)'}}>Hub</span>
        </h2>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <button onClick={() => setPage("browse")} style={{ background: "none", border: "none", color: "var(--text)", fontWeight: 800, cursor: "pointer", letterSpacing: "1px", fontSize: "0.8rem" }}>ARCHIVE</button>
          <div onClick={() => setAccent(accent === "#ff6b35" ? "#a855f7" : "#ff6b35")} style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--accent)", cursor: "pointer", border: "2px solid white" }} />
          <button onClick={() => setDark(!dark)} style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer" }}>{dark ? "🌚" : "🌞"}</button>
        </div>
      </nav>

      <div style={{ paddingTop: "120px", paddingBottom: "100px", position: "relative", zIndex: 10 }}>
        
        {/* 🚀 HERO SECTION */}
        {page === "home" && (
          <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "10vh 24px" }}>
            <div className="hero-container spring-up" style={{ transform: `translateY(${scrollY * 0.2}px)` }}>
              <div className="premium-title">Premium</div>
              <div className="vault-title">Vault</div>
              <p style={{ color: "var(--muted)", margin: "40px 0", maxWidth: "550px", fontSize: "1.2rem", lineHeight: 1.6 }}>
                A highly curated, cloud-synced digital archive for the next generation of visual artists and creators.
              </p>
              <button className="btn-art" style={{ width: "auto" }} onClick={() => setPage("browse")}>ENTER ARCHIVE</button>
            </div>
          </main>
        )}

        {/* 📂 BROWSE SECTION */}
        {page === "browse" && (
          <main style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 24px" }}>
            <div className="spring-up" style={{ textAlign: "center", marginBottom: "60px" }}>
              <h1 style={{ fontFamily: 'Syne', fontSize: 'clamp(2.5rem, 8vw, 4rem)', marginBottom: "30px" }}>The Library</h1>
              <input className="input-art" style={{ maxWidth: "600px" }} placeholder="Query the database..." onChange={e => setSearch(e.target.value)} />
              <div className="pill-scroll">
                <button className={`pill ${activeCat === 'all' ? 'active' : ''}`} onClick={() => setActiveCat("all")}>All Units</button>
                {CATEGORIES.map(c => <button key={c.id} className={`pill ${activeCat === c.id ? 'active' : ''}`} onClick={() => setActiveCat(c.id)}>{c.icon} {c.label}</button>)}
              </div>
            </div>
            
            <div className="grid">
              {filtered.map((r, i) => (
                <div key={r.id} className="glass card-hover spring-up" style={{ animationDelay: `${i * 0.08}s` }} onClick={() => { setDetailItem(r); setPage("detail"); }}>
                  <div style={{ fontSize: "4.5rem", textAlign: "center", marginBottom: "25px" }}>{CATEGORIES.find(c => c.id === r.category)?.icon}</div>
                  <div style={{ color: "var(--accent)", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "10px" }}>{r.category}</div>
                  <h3 style={{ fontFamily: 'Syne', fontSize: '1.3rem', marginBottom: "20px" }}>{r.title}</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "15px" }}>
                    <span style={{ color: "#38ef7d", fontWeight: 800 }}>{r.price}</span>
                    <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>⬇️ {r.downloads || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </main>
        )}

        {/* 🔍 DETAIL SECTION */}
        {page === "detail" && detailItem && (
          <main className="spring-up" style={{ maxWidth: "850px", margin: "0 auto", padding: "0 24px" }}>
            <button onClick={() => setPage("browse")} style={{ color: 'var(--text)', background: 'none', border: 'none', fontWeight: 800, cursor: 'pointer', marginBottom: "40px", fontFamily: 'Syne', letterSpacing: "2px" }}>← RETURN TO GRID</button>
            <div className="glass">
              <div style={{ fontSize: "5rem", marginBottom: "20px" }}>{CATEGORIES.find(c => c.id === detailItem.category)?.icon}</div>
              <h1 style={{ fontFamily: 'Syne', fontSize: 'clamp(2rem, 6vw, 4rem)', marginBottom: "20px", lineHeight: 1 }}>{detailItem.title}</h1>
              <p style={{ lineHeight: 1.8, color: 'var(--muted)', fontSize: '1.2rem', marginBottom: "50px" }}>{detailItem.description}</p>
              <a href={detailItem.download_link} target="_blank" rel="noreferrer" className="btn-art" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>DOWNLOAD ASSET</a>
            </div>
          </main>
        )}

        {/* 🔐 ADMIN SECTION (BULLETPROOF STATE) */}
        {page === "admin" && (
          <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
            {!session ? (
              <AdminLogin onLogin={(s) => { setSession(s); localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }} />
            ) : (
              <AdminDashboard resources={resources} token={session.access_token} onUpdate={fetchAll} onLogout={() => { setSession(null); localStorage.removeItem(SESSION_KEY); setPage("home"); }} />
            )}
          </main>
        )}
      </div>
    </>
  );
}

// ─── ADMIN HELPERS (STRICT STATE MANAGEMENT) ─────────────────────────────────
function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST", headers: { apikey: SUPABASE_ANON, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass })
    });
    const d = await r.json();
    setLoading(false);
    if (r.ok) onLogin(d); else alert("Access Denied. Check Supabase Credentials.");
  };

  return (
    <div className="glass spring-up" style={{ maxWidth: "500px", margin: "0 auto", padding: "50px", textAlign: "center" }}>
      <h3 style={{ fontFamily: 'Syne', fontSize: '2rem', marginBottom: "40px" }}>Vault Access</h3>
      <input placeholder="Admin ID" className="input-art" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Passkey" className="input-art" value={pass} onChange={e => setPass(e.target.value)} />
      <button className="btn-art" onClick={handleAuth} disabled={loading}>{loading ? "VERIFYING..." : "INITIATE SESSION"}</button>
    </div>
  );
}

function AdminDashboard({ resources, token, onUpdate, onLogout }) {
  const [f, setF] = useState({ title: "", description: "", category: "video", download_link: "", price: "Free" });
  const [editId, setEditId] = useState(null);
  const [deploying, setDeploying] = useState(false);

  const save = async () => {
    if(!f.title || !f.download_link) return alert("Title and Cloud Link are mandatory.");
    setDeploying(true);
    const ok = await db.upsert(f, token, editId);
    setDeploying(false);
    if(ok) { 
      setF({ title: "", description: "", category: "video", download_link: "", price: "Free" }); 
      setEditId(null); 
      onUpdate(); 
      alert("Asset Synced to Cloud."); 
    } else {
      alert("Database error. Check Supabase RLS policies.");
    }
  };

  return (
    <div className="admin-grid spring-up">
      <div className="glass" style={{ height: "fit-content" }}>
        <h3 style={{ fontFamily: 'Syne', fontSize: '1.5rem', marginBottom: "30px" }}>{editId ? "Modify" : "Mint"} Asset</h3>
        <input placeholder="Asset Title" value={f.title} className="input-art" onChange={e => setF({...f, title: e.target.value})} />
        <textarea placeholder="Metadata / Description" value={f.description} className="input-art" style={{ height: "140px", resize: "none" }} onChange={e => setF({...f, description: e.target.value})} />
        <input placeholder="Cloud Source URL" value={f.download_link} className="input-art" onChange={e => setF({...f, download_link: e.target.value})} />
        <select className="input-art" value={f.category} onChange={e => setF({...f, category: e.target.value})}>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <button className="btn-art" onClick={save} disabled={deploying}>{deploying ? "SYNCING..." : (editId ? "OVERWRITE CLOUD" : "DEPLOY TO CLOUD")}</button>
        {editId && <button onClick={() => { setEditId(null); setF({title:"",description:"",category:"video",download_link:"",price:"Free"}) }} style={{ width: '100%', marginTop: 15, padding: 15, background: 'none', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 16, cursor: 'pointer', fontWeight: 800 }}>CANCEL EDIT</button>}
      </div>
      
      <div className="glass">
        <h3 style={{ fontFamily: 'Syne', fontSize: '1.5rem', marginBottom: "30px" }}>Cloud Inventory</h3>
        <div style={{ maxHeight: "600px", overflowY: "auto", paddingRight: 10 }}>
          {resources.map(r => (
            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{r.title}</div>
                <div style={{ color: 'var(--accent)', fontSize: '0.7rem', textTransform: 'uppercase', marginTop: 5 }}>{r.category}</div>
              </div>
              <div style={{ display: 'flex', gap: "15px" }}>
                <button onClick={() => { setF(r); setEditId(r.id); window.scrollTo(0,0); }} style={{ color: 'var(--text)', background: 'none', border: 'none', fontWeight: 800, cursor: 'pointer', padding: 10 }}>EDIT</button>
                <button onClick={async () => { if(confirm("Permanently delete from cloud?")) { await db.delete(r.id, token); onUpdate(); } }} style={{ color: '#ff3b30', background: 'none', border: 'none', fontWeight: 800, cursor: 'pointer', padding: 10 }}>DEL</button>
              </div>
            </div>
          ))}
          {resources.length === 0 && <p style={{ color: "var(--muted)" }}>No assets in vault.</p>}
        </div>
        <button onClick={onLogout} style={{ marginTop: "40px", width: '100%', padding: 20, background: 'none', border: 'none', color: '#ff3b30', fontWeight: 800, cursor: 'pointer', letterSpacing: "2px" }}>TERMINATE SECURE SESSION</button>
      </div>
    </div>
  );
}
