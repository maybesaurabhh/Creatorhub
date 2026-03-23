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

// ─── API ENGINE (STABLE) ─────────────────────────────────────────────────────
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

// ─── STYLES (NO MORE OVERLAP) ────────────────────────────────────────────────
const GlobalStyle = ({ dark, accent }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    
    :root {
      --bg: ${dark ? "#050505" : "#fdfdfd"};
      --text: ${dark ? "#ffffff" : "#0a0a0a"};
      --accent: ${accent || "#ff6b35"};
      --border: ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"};
      --glass: ${dark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.7)"};
    }

    body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; overflow-x: hidden; }

    /* 🌊 AURA GLOW (FOLLOWS FINGER/SCROLL) */
    .aura {
      position: fixed; width: 400px; height: 400px; border-radius: 50%;
      background: radial-gradient(circle, var(--accent) 0%, transparent 70%);
      filter: blur(80px); opacity: 0.15; pointer-events: none; z-index: -1;
      transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
    }

    /* 🎨 HERO TYPOGRAPHY FIX */
    .hero-container {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0; /* Ensures they don't drift apart */
    }

    .premium-text {
      font-family: 'Syne', sans-serif;
      font-size: clamp(3rem, 15vw, 8rem);
      font-weight: 800;
      line-height: 0.7;
      letter-spacing: -0.05em;
      margin-bottom: -0.2em; /* Tucked closer */
    }

    .vault-text {
      font-family: 'Syne', sans-serif;
      font-size: clamp(2.5rem, 12vw, 6rem);
      font-weight: 800;
      color: var(--accent);
      line-height: 1;
      z-index: 2;
    }

    .glass { 
      background: var(--glass); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px);
      border: 1px solid var(--border); border-radius: 30px; 
      padding: 24px; transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .grid { display: grid; gap: 30px; width: 100%; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
    
    .input-art {
      width: 100%; padding: 18px; border-radius: 18px; border: 1px solid var(--border);
      background: var(--glass); color: var(--text); outline: none; margin-bottom: 15px;
    }
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

  const fetchAll = async () => { setResources(await db.getAll()); };
  
  useEffect(() => { 
    fetchAll();
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      
      {/* 🌊 MOTION AURA */}
      <div className="aura" style={{ transform: `translate(10vw, ${scrollY * 0.5}px)` }} />

      <nav style={{ position: "fixed", top: 0, width: "100%", zIndex: 2000, padding: "20px 6%", display: "flex", justifyContent: "space-between", alignItems: "center", backdropFilter: "blur(15px)" }}>
        <div onClick={() => { if(window.confirm("Admin Vault?")) setPage("admin") }} style={{ cursor: "pointer", fontFamily: "Syne", fontWeight: 800, fontSize: "1.4rem" }}>
          Creator<span style={{ color: "var(--accent)" }}>Hub</span>
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          <button onClick={() => setPage("browse")} style={{ background: "none", border: "none", color: "var(--text)", fontWeight: 800, fontSize: "0.75rem", cursor: "pointer" }}>ARCHIVE</button>
          <button onClick={() => setDark(!dark)} style={{ background: "none", border: "none", fontSize: "1.2rem" }}>{dark ? "🌚" : "🌞"}</button>
        </div>
      </nav>

      <div style={{ paddingTop: "120px" }}>
        
        {/* HOME (FIXED OVERLAP) */}
        {page === "home" && (
          <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "10vh 20px", textAlign: "center" }}>
            <div className="hero-container" style={{ transform: `translateY(${scrollY * 0.15}px)` }}>
              <div className="premium-text">Premium</div>
              <div className="vault-text">Vault</div>
            </div>
            <p style={{ color: "var(--muted)", maxWidth: "500px", margin: "40px auto", fontSize: "1.1rem" }}>
              Curated digital assets for the next generation of creators.
            </p>
            <button className="glass" style={{ cursor: "pointer", padding: "15px 30px", fontWeight: 800, background: "var(--accent)", color: "white" }} onClick={() => setPage("browse")}>
              EXPLORE
            </button>
          </main>
        )}

        {/* BROWSE PAGE */}
        {page === "browse" && (
          <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
            <div style={{ textAlign: "center", marginBottom: "50px" }}>
              <h2 style={{ fontFamily: "Syne", fontSize: "2.5rem", marginBottom: "20px" }}>Archive</h2>
              <input className="input-art" placeholder="Query database..." onChange={e => setSearch(e.target.value)} />
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", overflowX: "auto" }}>
                <button onClick={() => setActiveCat("all")}>All</button>
                {CATEGORIES.map(c => <button key={c.id} onClick={() => setActiveCat(c.id)}>{c.icon} {c.label}</button>)}
              </div>
            </div>
            <div className="grid">
              {filtered.map(r => (
                <div key={r.id} className="glass" onClick={() => { setDetailItem(r); setPage("detail"); }}>
                  <div style={{ fontSize: "3rem", textAlign: "center" }}>{CATEGORIES.find(c => c.id === r.category)?.icon}</div>
                  <h3 style={{ fontFamily: "Syne", marginTop: 10 }}>{r.title}</h3>
                </div>
              ))}
            </div>
          </main>
        )}

        {/* ADMIN PAGE (RE-STABILIZED) */}
        {page === "admin" && (
          <main style={{ maxWidth: "600px", margin: "0 auto" }}>
            {!session ? (
              <div className="glass">
                <h3>Admin ID</h3>
                <input className="input-art" placeholder="Email" onChange={e => (window.email = e.target.value)} />
                <input className="input-art" type="password" placeholder="Passkey" onChange={e => (window.pass = e.target.value)} />
                <button className="input-art" onClick={async () => {
                  const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
                    method: "POST", headers: { apikey: SUPABASE_ANON, "Content-Type": "application/json" },
                    body: JSON.stringify({ email: window.email, password: window.pass })
                  });
                  const d = await r.json();
                  if(r.ok) { setSession(d); localStorage.setItem(SESSION_KEY, JSON.stringify(d)); } else alert("Denied");
                }}>LOGIN</button>
              </div>
            ) : (
              <AdminDashboard resources={resources} token={session.access_token} onUpdate={fetchAll} onLogout={() => { setSession(null); setPage("home"); }} />
            )}
          </main>
        )}
      </div>
    </>
  );
}

function AdminDashboard({ resources, token, onUpdate, onLogout }) {
  const [f, setF] = useState({ title: "", description: "", category: "video", download_link: "", price: "Free" });
  const save = async () => {
    const ok = await db.upsert(f, token);
    if(ok) { setF({ title: "", description: "", category: "video", download_link: "", price: "Free" }); onUpdate(); alert("Saved"); }
  };
  return (
    <div className="glass">
      <input placeholder="Title" value={f.title} className="input-art" onChange={e => setF({...f, title: e.target.value})} />
      <input placeholder="Link" value={f.download_link} className="input-art" onChange={e => setF({...f, download_link: e.target.value})} />
      <button className="input-art" onClick={save}>DEPLOY</button>
      <button onClick={onLogout}>LOGOUT</button>
    </div>
  );
}
