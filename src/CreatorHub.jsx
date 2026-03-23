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

// ─── API HELPERS ─────────────────────────────────────────────────────────────
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
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
  },
  async delete(id, token) {
    await fetch(`${SUPABASE_URL}/rest/v1/resources?id=eq.${id}`, {
      method: "DELETE",
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` }
    });
  }
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const GlobalStyle = ({ dark, accent }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    
    :root {
      --bg: ${dark ? "#050505" : "#fdfdfd"};
      --text: ${dark ? "#ffffff" : "#0a0a0a"};
      --muted: ${dark ? "#808080" : "#606060"};
      --accent: ${accent || "#ff6b35"};
      --border: ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"};
      --glass: ${dark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.7)"};
    }

    body { 
      background: var(--bg); 
      color: var(--text); 
      font-family: 'DM Sans', sans-serif; 
      transition: background 0.6s ease;
      overflow-x: hidden;
    }

    /* 🌊 MOTION BACKGROUND SYSTEM */
    .motion-container {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      z-index: -1; overflow: hidden; background: var(--bg);
    }

    .orb {
      position: absolute; border-radius: 50%; filter: blur(100px);
      opacity: ${dark ? 0.15 : 0.1}; mix-blend-mode: screen;
      animation: float 25s infinite alternate ease-in-out;
    }

    .orb-1 { width: 600px; height: 600px; background: var(--accent); top: -10%; left: -10%; }
    .orb-2 { width: 500px; height: 500px; background: #4ecdc4; bottom: -10%; right: -10%; animation-delay: -5s; }
    .orb-3 { width: 400px; height: 400px; background: #a855f7; top: 40%; left: 50%; animation-delay: -10s; }

    @keyframes float {
      0% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(100px, 50px) scale(1.1); }
      100% { transform: translate(-50px, 100px) scale(0.9); }
    }

    /* 💎 UI POLISH */
    .glass { 
      background: var(--glass); 
      backdrop-filter: blur(30px); 
      -webkit-backdrop-filter: blur(30px);
      border: 1px solid var(--border); 
      border-radius: 28px; 
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    
    .gradient-text {
      background: linear-gradient(135deg, var(--accent) 0%, #ffd200 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .spring-up { 
      opacity: 0;
      animation: springUp 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; 
    }

    @keyframes springUp {
      from { opacity: 0; transform: translateY(60px) scale(0.9); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .card-art:hover {
      transform: translateY(-15px) scale(1.03);
      border-color: var(--accent);
      box-shadow: 0 40px 80px rgba(0,0,0,0.4);
    }

    .btn-art {
      background: var(--accent);
      color: #fff; border: none; padding: 20px 40px;
      border-radius: 20px; font-family: 'Syne', sans-serif;
      font-weight: 800; cursor: pointer; transition: 0.4s;
      text-transform: uppercase; letter-spacing: 3px;
      box-shadow: 0 15px 35px ${accent}40;
    }
    .btn-art:hover { transform: translateY(-5px); box-shadow: 0 25px 50px ${accent}60; }
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

  const clickRef = useRef(0);
  const timerRef = useRef(null);

  const fetchAll = async () => { setResources(await db.getAll()); };
  useEffect(() => { fetchAll(); }, []);

  const handleSecretAccess = () => {
    clickRef.current += 1;
    if (clickRef.current >= 5) {
      setPage("admin");
      clickRef.current = 0;
    }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { clickRef.current = 0; }, 1200);
  };

  const filtered = useMemo(() => {
    return resources.filter(r => {
      const matchText = r.title.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCat === "all" || r.category === activeCat;
      return matchText && matchCat;
    });
  }, [resources, search, activeCat]);

  return (
    <>
      <GlobalStyle dark={dark} accent={accent} />
      
      {/* 🌊 MOTION BACKGROUND */}
      <div className="motion-container">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      
      {/* Navbar */}
      <nav style={{ position: "fixed", top: 0, width: "100%", zIndex: 2000, padding: "25px 6%", display: "flex", justifyContent: "space-between", alignItems: "center", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--border)" }}>
        <div onClick={handleSecretAccess} style={{ cursor: "pointer", fontFamily: "Syne", fontWeight: 800, fontSize: "1.8rem", letterSpacing: "-0.06em" }}>
          Creator<span className="gradient-text">Hub</span>
        </div>
        <div style={{ display: "flex", gap: "25px", alignItems: "center" }}>
          <button onClick={() => setPage("browse")} style={{ background: "none", border: "none", color: "var(--text)", fontWeight: 800, fontSize: "0.8rem", letterSpacing: "3px", cursor: "pointer", fontFamily: "Syne" }}>DASHBOARD</button>
          <div onClick={() => setAccent(accent === "#ff6b35" ? "#a855f7" : "#ff6b35")} style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--accent)", cursor: "pointer", border: "2px solid white" }} />
          <button onClick={() => setDark(!dark)} style={{ background: "none", border: "none", fontSize: "1.6rem", cursor: "pointer" }}>{dark ? "🌚" : "🌞"}</button>
        </div>
      </nav>

      <div style={{ paddingTop: "140px" }}>
        
        {/* HOME */}
        {page === "home" && (
          <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "10vh 24px", textAlign: "center" }}>
            <h1 className="spring-up" style={{ fontSize: "clamp(3.5rem, 12vw, 7.5rem)", fontFamily: "Syne", fontWeight: 800, lineHeight: 0.8, marginBottom: "50px", letterSpacing: "-0.07em" }}>
              The Future of <br/><span className="gradient-text">Workflow</span>
            </h1>
            <p className="spring-up" style={{ animationDelay: "0.2s", color: "var(--muted)", maxWidth: "600px", margin: "0 auto 60px", fontSize: "1.3rem", fontWeight: 400, lineHeight: 1.6 }}>
              A living archive of digital assets. Experience a fluid interface designed for the next generation of creators.
            </p>
            <button className="spring-up btn-art" style={{ animationDelay: "0.4s" }} onClick={() => setPage("browse")}>EXPLORE ARCHIVE</button>
          </main>
        )}

        {/* BROWSE */}
        {page === "browse" && (
          <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px 24px" }}>
            <div className="spring-up" style={{ textAlign: "center", marginBottom: "80px" }}>
              <h2 style={{ fontFamily: "Syne", fontSize: "4rem", marginBottom: "40px", letterSpacing: "-0.05em" }}>Archive</h2>
              <input 
                className="search-art" 
                placeholder="Query the database..." 
                onChange={e => setSearch(e.target.value)}
              />
              <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "center", marginTop: "40px" }}>
                <button className={`pill-art ${activeCat === 'all' ? 'active' : ''}`} onClick={() => setActiveCat("all")}>All Units</button>
                {CATEGORIES.map(c => (
                  <button key={c.id} className={`pill-art ${activeCat === c.id ? 'active' : ''}`} onClick={() => setActiveCat(c.id)}>
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid-art">
              {filtered.map((r, i) => (
                <div key={r.id} className="glass card-art spring-up" style={{ animationDelay: `${i * 0.12}s`, overflow: "hidden" }} onClick={() => { setDetailItem(r); setPage("detail"); }}>
                  <div style={{ height: "240px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "5rem" }}>
                    {CATEGORIES.find(c => c.id === r.category)?.icon}
                  </div>
                  <div style={{ padding: "35px" }}>
                    <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "3px", marginBottom: "15px" }}>{r.category}</p>
                    <h3 style={{ fontSize: "1.5rem", fontFamily: "Syne", fontWeight: 800 }}>{r.title}</h3>
                    <div style={{ marginTop: "25px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                       <span style={{ fontSize: "1.1rem", color: "#38ef7d", fontWeight: 800 }}>{r.price}</span>
                       <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--glass)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>⬇️</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        )}

        {/* DETAIL */}
        {page === "detail" && detailItem && (
          <main className="spring-up" style={{ maxWidth: "1000px", margin: "0 auto", padding: "60px 24px" }}>
            <button onClick={() => setPage("browse")} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontWeight: 800, marginBottom: "50px", fontFamily: "Syne", letterSpacing: "3px" }}>← RETURN</button>
            <div className="glass" style={{ padding: "80px" }}>
               <h1 style={{ fontFamily: "Syne", fontSize: "clamp(3rem, 7vw, 5rem)", marginBottom: "40px", fontWeight: 800, lineHeight: 0.85 }}>{detailItem.title}</h1>
               <p style={{ color: "var(--muted)", lineHeight: 1.8, fontSize: "1.4rem", marginBottom: "60px" }}>{detailItem.description}</p>
               <a href={detailItem.download_link} target="_blank" rel="noreferrer" className="btn-art" style={{ textDecoration: "none", display: "block", textAlign: "center" }}>DOWNLOAD ASSET</a>
            </div>
          </main>
        )}

        {/* ADMIN */}
        {page === "admin" && (
          <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" }}>
            {!session ? (
              <AdminAuth accent={accent} onLogin={(s) => { setSession(s); localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }} />
            ) : (
              <AdminDashboard resources={resources} token={session.access_token} onUpdate={fetchAll} onLogout={() => { setSession(null); localStorage.removeItem(SESSION_KEY); setPage("home"); }} />
            )}
          </main>
        )}
      </div>

      <footer style={{ marginTop: "150px", padding: "120px 24px", textAlign: "center", borderTop: "1px solid var(--border)" }}>
        <h2 style={{ fontFamily: "Syne", fontSize: "1.8rem", fontWeight: 800, marginBottom: "20px" }}>CreatorHub</h2>
        <p style={{ opacity: 0.3, fontSize: "1rem", letterSpacing: "2px" }}>OPERATING ON SUPABASE CLOUD • 2026</p>
      </footer>
    </>
  );
}

// ─── ADMIN SUBSYSTEMS ────────────────────────────────────────────────────────
function AdminAuth({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const handleAuth = async () => {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST", headers: { apikey: SUPABASE_ANON, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass })
    });
    const d = await r.json();
    if (r.ok) onLogin(d); else alert("Signature Rejected");
  };
  return (
    <div className="glass spring-up" style={{ maxWidth: "500px", margin: "0 auto", padding: "60px", textAlign: "center" }}>
      <h3 style={{ fontFamily: "Syne", fontSize: "2rem", marginBottom: "50px" }}>System Access</h3>
      <input placeholder="Admin ID" className="search-art" style={{ marginBottom: "20px" }} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Passkey" className="search-art" style={{ marginBottom: "40px" }} onChange={e => setPass(e.target.value)} />
      <button className="btn-art" style={{ width: "100%" }} onClick={handleAuth}>INITIATE</button>
    </div>
  );
}

function AdminDashboard({ resources, token, onUpdate, onLogout }) {
  const [f, setF] = useState({ title: "", description: "", category: "video", download_link: "", price: "Free" });
  const [editId, setEditId] = useState(null);

  const saveItem = async () => {
    await db.upsert(f, token, editId);
    setF({ title: "", description: "", category: "video", download_link: "", price: "Free" });
    setEditId(null);
    onUpdate();
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "60px" }}>
      <div className="glass" style={{ padding: "50px" }}>
        <h3 style={{ fontFamily: "Syne", marginBottom: "40px" }}>{editId ? "Update" : "Add"} Entry</h3>
        <input placeholder="Title" value={f.title} className="search-art" style={{ marginBottom: "20px" }} onChange={e => setF({...f, title: e.target.value})} />
        <textarea placeholder="Metadata / Description" value={f.description} className="search-art" style={{ height: "180px", marginBottom: "20px", resize: "none" }} onChange={e => setF({...f, description: e.target.value})} />
        <input placeholder="Cloud Source URL" value={f.download_link} className="search-art" style={{ marginBottom: "30px" }} onChange={e => setF({...f, download_link: e.target.value})} />
        <button className="btn-art" style={{ width: "100%" }} onClick={saveItem}>{editId ? "OVERWRITE" : "DEPLOY"}</button>
        <button onClick={onLogout} style={{ marginTop: "40px", opacity: 0.5, background: "none", border: "none", color: "var(--text)", cursor: "pointer", fontWeight: 800, fontSize: "0.8rem", letterSpacing: "2px" }}>TERMINATE SESSION</button>
      </div>
      
      <div className="glass" style={{ padding: "50px" }}>
        <h3 style={{ fontFamily: "Syne", marginBottom: "40px" }}>Cloud Sync</h3>
        {resources.map(r => (
          <div key={r.id} style={{ display: "flex", justifyContent: "space-between", padding: "25px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontWeight: 800, fontSize: "1.2rem" }}>{r.title}</span>
            <div style={{ display: "flex", gap: "30px" }}>
              <button onClick={() => { setF(r); setEditId(r.id); }} style={{ color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 800 }}>EDIT</button>
              <button onClick={async () => { if(confirm("Purge from cloud?")) { await db.delete(r.id, token); onUpdate(); } }} style={{ color: "red", background: "none", border: "none", cursor: "pointer", fontWeight: 800 }}>DELETE</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
