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

// ─── API ENGINE (DO NOT TOUCH) ───────────────────────────────────────────────
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

// ─── STYLES (MOTION GRAPHICS ENGINE) ─────────────────────────────────────────
const GlobalStyle = ({ dark, accent }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    
    :root {
      --bg: ${dark ? "#050505" : "#fdfdfd"};
      --text: ${dark ? "#ffffff" : "#0a0a0a"};
      --muted: ${dark ? "rgba(128,128,128,0.6)" : "rgba(80,80,80,0.6)"};
      --accent: ${accent || "#ff6b35"};
      --border: ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"};
      --glass: ${dark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.7)"};
    }

    body { 
      background: var(--bg); color: var(--text); 
      font-family: 'DM Sans', sans-serif; 
      transition: background 0.5s ease;
    }

    /* 🌊 LIQUID MORPHING BACKGROUND */
    .morph-bg {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      z-index: -1; filter: blur(80px); opacity: 0.4;
    }

    .blob {
      position: absolute; width: 500px; height: 500px;
      background: var(--accent);
      border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
      animation: morph 12s linear infinite alternate;
    }

    @keyframes morph {
      0% { border-radius: 40% 60% 70% 30% / 40% 40% 60% 50%; transform: translate(0,0) rotate(0deg); }
      50% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; transform: translate(20vw, 10vh) rotate(180deg); }
      100% { border-radius: 30% 70% 30% 70% / 50% 70% 30% 50%; transform: translate(-10vw, 20vh) rotate(360deg); }
    }

    /* 🎢 PARALLAX SCROLL EFFECTS */
    .parallax-item {
      transition: transform 0.2s cubic-bezier(0,0,0,1);
      will-change: transform;
    }

    .glass { 
      background: var(--glass); backdrop-filter: blur(25px); 
      -webkit-backdrop-filter: blur(25px);
      border: 1px solid var(--border); border-radius: 30px; 
      padding: 24px; transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .card-hover:hover {
      transform: translateY(-12px) scale(1.02) !important;
      border-color: var(--accent);
      box-shadow: 0 30px 60px rgba(0,0,0,0.3);
    }

    .gradient-text {
      background: linear-gradient(135deg, var(--accent), #ffd200);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }

    .btn-art {
      background: var(--accent); color: #fff; border: none; padding: 18px 40px;
      border-radius: 20px; font-family: 'Syne', sans-serif; font-weight: 800;
      cursor: pointer; transition: 0.4s; text-transform: uppercase; letter-spacing: 2px;
    }

    .grid {
      display: grid; gap: 30px; width: 100%;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }

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

  const clickRef = useRef(0);
  const timerRef = useRef(null);

  const fetchAll = async () => { setResources(await db.getAll()); };
  
  useEffect(() => { 
    fetchAll();
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSecretAccess = () => {
    clickRef.current += 1;
    if (clickRef.current >= 5) { setPage("admin"); clickRef.current = 0; }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { clickRef.current = 0; }, 1200);
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
      
      {/* 🌊 MORPHING BG */}
      <div className="morph-bg">
        <div className="blob" style={{ left: '10%', top: '20%' }} />
        <div className="blob" style={{ right: '5%', bottom: '10%', animationDelay: '-6s', background: '#4ecdc4' }} />
      </div>

      {/* Navbar */}
      <nav style={{ position: "fixed", top: 0, width: "100%", zIndex: 2000, padding: "25px 6%", display: "flex", justifyContent: "space-between", alignItems: "center", backdropFilter: "blur(15px)" }}>
        <div onClick={handleSecretAccess} style={{ cursor: "pointer", fontFamily: "Syne", fontWeight: 800, fontSize: "1.4rem" }}>
          Creator<span className="gradient-text">Hub</span>
        </div>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <button onClick={() => setPage("browse")} style={{ background: "none", border: "none", color: "var(--text)", fontWeight: 800, fontSize: "0.75rem", letterSpacing: "2px", cursor: "pointer", fontFamily: "Syne" }}>ARCHIVE</button>
          <button onClick={() => setDark(!dark)} style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer" }}>{dark ? "🌚" : "🌞"}</button>
        </div>
      </nav>

      <div style={{ paddingTop: "120px", paddingBottom: "100px" }}>
        
        {/* HERO */}
        {page === "home" && (
          <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "15vh 20px", textAlign: "center" }}>
            <h1 className="parallax-item" style={{ fontSize: "clamp(3rem, 12vw, 7rem)", fontFamily: "Syne", fontWeight: 800, lineHeight: 0.85, marginBottom: "40px", transform: `translateY(${scrollY * 0.2}px)` }}>
              Beyond <br/><span className="gradient-text">Limits</span>
            </h1>
            <p style={{ color: "var(--muted)", maxWidth: "500px", margin: "0 auto 50px", fontSize: "1.2rem" }}>
              A high-motion digital vault for creators.
            </p>
            <button className="btn-art" onClick={() => setPage("browse")}>EXPLORE</button>
          </main>
        )}

        {/* BROWSE */}
        {page === "browse" && (
          <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
            <div style={{ textAlign: "center", marginBottom: "60px" }}>
              <h2 style={{ fontFamily: "Syne", fontSize: "3rem", marginBottom: "20px" }}>Library</h2>
              <input className="input-art" style={{ maxWidth: "500px" }} placeholder="Search Archive..." onChange={e => setSearch(e.target.value)} />
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginTop: "20px" }}>
                <button className={`pill-art ${activeCat === 'all' ? 'active' : ''}`} onClick={() => setActiveCat("all")}>All</button>
                {CATEGORIES.map(c => (
                  <button key={c.id} className={`pill-art ${activeCat === c.id ? 'active' : ''}`} onClick={() => setActiveCat(c.id)}>{c.icon} {c.label}</button>
                ))}
              </div>
            </div>

            <div className="grid">
              {filtered.map((r, i) => (
                <div 
                  key={r.id} 
                  className="glass card-hover parallax-item" 
                  style={{ transform: `translateY(${(scrollY - (i * 100)) * 0.05}px)`, cursor: "pointer" }}
                  onClick={() => { setDetailItem(r); setPage("detail"); }}
                >
                  <div style={{ fontSize: "3.5rem", textAlign: "center", marginBottom: "20px" }}>{CATEGORIES.find(c => c.id === r.category)?.icon}</div>
                  <h3 style={{ fontFamily: "Syne", fontSize: "1.2rem", marginBottom: "10px" }}>{r.title}</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", opacity: 0.6 }}>
                    <span>{r.price}</span>
                    <span>⬇️ {r.downloads || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </main>
        )}

        {/* DETAIL */}
        {page === "detail" && detailItem && (
          <main style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px" }}>
            <button onClick={() => setPage("browse")} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontWeight: 800, marginBottom: "30px", fontFamily: "Syne" }}>← RETURN</button>
            <div className="glass">
               <h1 style={{ fontFamily: "Syne", fontSize: "3rem", marginBottom: "20px", lineHeight: 1 }}>{detailItem.title}</h1>
               <p style={{ color: "var(--muted)", lineHeight: 1.8, marginBottom: "40px", fontSize: "1.2rem" }}>{detailItem.description}</p>
               <a href={detailItem.download_link} target="_blank" rel="noreferrer" className="btn-art" style={{ textDecoration: "none", display: "block", textAlign: "center" }}>DOWNLOAD NOW</a>
            </div>
          </main>
        )}

        {/* ADMIN */}
        {page === "admin" && (
          <main style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px" }}>
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

// ─── ADMIN HELPERS (STABLE) ──────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const handleAuth = async () => {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST", headers: { apikey: SUPABASE_ANON, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass })
    });
    const d = await r.json();
    if (r.ok) onLogin(d); else alert("Denied");
  };
  return (
    <div className="glass" style={{ padding: "40px", textAlign: "center" }}>
      <h3 style={{ fontFamily: "Syne", marginBottom: "30px" }}>Vault Login</h3>
      <input placeholder="Admin ID" className="input-art" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Passkey" className="input-art" onChange={e => setPass(e.target.value)} />
      <button className="btn-art" style={{ width: "100%" }} onClick={handleAuth}>LOGIN</button>
    </div>
  );
}

function AdminDashboard({ resources, token, onUpdate, onLogout }) {
  const [f, setF] = useState({ title: "", description: "", category: "video", download_link: "", price: "Free" });
  const [editId, setEditId] = useState(null);

  const save = async () => {
    if(!f.title || !f.download_link) return alert("Title and Link Required");
    const ok = await db.upsert(f, token, editId);
    if(ok) {
      alert("Synced"); setF({ title: "", description: "", category: "video", download_link: "", price: "Free" });
      setEditId(null); onUpdate();
    }
  };

  return (
    <div style={{ display: "grid", gap: "30px" }}>
      <div className="glass">
        <h3 style={{ fontFamily: "Syne", marginBottom: "20px" }}>{editId ? "Edit" : "Add"} Item</h3>
        <input placeholder="Title" value={f.title} className="input-art" onChange={e => setF({...f, title: e.target.value})} />
        <textarea placeholder="Description" value={f.description} className="input-art" style={{ height: "120px", resize: "none" }} onChange={e => setF({...f, description: e.target.value})} />
        <input placeholder="Download URL" value={f.download_link} className="input-art" onChange={e => setF({...f, download_link: e.target.value})} />
        <select className="input-art" value={f.category} onChange={e => setF({...f, category: e.target.value})}>
           {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <button className="btn-art" style={{ width: "100%" }} onClick={save}>{editId ? "UPDATE" : "DEPLOY"}</button>
      </div>
      <div className="glass">
        {resources.map(r => (
          <div key={r.id} style={{ display: "flex", justifyContent: "space-between", padding: "15px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontWeight: 700 }}>{r.title}</span>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => { setF(r); setEditId(r.id); }} style={{ color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 800 }}>Edit</button>
              <button onClick={async () => { if(confirm("Purge?")) { await db.delete(r.id, token); onUpdate(); } }} style={{ color: "red", background: "none", border: "none", cursor: "pointer", fontWeight: 800 }}>Del</button>
            </div>
          </div>
        ))}
        <button onClick={onLogout} style={{ marginTop: "20px", width: "100%", background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontWeight: 800 }}>LOGOUT</button>
      </div>
    </div>
  );
}
