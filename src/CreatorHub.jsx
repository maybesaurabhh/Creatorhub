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
      transition: background 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      overflow-x: hidden;
    }

    /* Artistic Mesh Background */
    .mesh-bg {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1;
      background: radial-gradient(circle at 20% 30%, ${accent}15 0%, transparent 40%),
                  radial-gradient(circle at 80% 70%, #4ecdc415 0%, transparent 40%);
      filter: blur(80px);
      animation: drift 20s infinite alternate;
    }

    @keyframes drift {
      from { transform: scale(1); }
      to { transform: scale(1.1) rotate(5deg); }
    }

    .glass { 
      background: var(--glass); 
      backdrop-filter: blur(24px); 
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid var(--border); 
      border-radius: 24px; 
    }
    
    .gradient-text {
      background: linear-gradient(135deg, var(--accent) 0%, #ffd200 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* Spring Animations */
    @keyframes springUp {
      0% { opacity: 0; transform: translateY(50px) scale(0.9); }
      70% { transform: translateY(-5px) scale(1.02); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }

    .spring-up { animation: springUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both; }

    .card-art {
      transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
    }
    .card-art:hover {
      transform: translateY(-12px) scale(1.02);
      border-color: var(--accent);
      box-shadow: 0 30px 60px rgba(0,0,0,0.3);
    }

    .btn-art {
      background: var(--accent);
      color: #fff; border: none; padding: 18px 36px;
      border-radius: 18px; font-family: 'Syne', sans-serif;
      font-weight: 800; cursor: pointer; transition: 0.4s;
      text-transform: uppercase; letter-spacing: 2px;
      box-shadow: 0 10px 30px ${accent}40;
    }
    .btn-art:hover { transform: translateY(-3px); box-shadow: 0 20px 40px ${accent}60; }

    .search-art {
      width: 100%; padding: 20px 30px; border-radius: 20px;
      border: 1px solid var(--border); background: var(--glass);
      color: var(--text); font-size: 1.1rem; outline: none; transition: 0.4s;
      font-family: 'Syne', sans-serif;
    }
    .search-art:focus { border-color: var(--accent); background: ${dark ? "rgba(255,255,255,0.06)" : "#fff"}; }

    .pill-art {
      padding: 12px 24px; border-radius: 40px; background: var(--glass);
      border: 1px solid var(--border); color: var(--text); font-weight: 700;
      font-family: 'Syne', sans-serif; cursor: pointer; transition: 0.4s;
    }
    .pill-art.active { background: var(--accent); color: #fff; border-color: var(--accent); transform: translateY(-3px); }

    .grid-art {
      display: grid; gap: 30px; width: 100%;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
      <div className="mesh-bg" />
      
      {/* Navbar */}
      <nav style={{ position: "fixed", top: 0, width: "100%", zIndex: 2000, padding: "20px 6%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div onClick={handleSecretAccess} style={{ cursor: "pointer", fontFamily: "Syne", fontWeight: 800, fontSize: "1.6rem", letterSpacing: "-0.05em" }}>
          Creator<span className="gradient-text">Hub</span>
        </div>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <button onClick={() => setPage("browse")} style={{ background: "none", border: "none", color: "var(--text)", fontWeight: 800, fontSize: "0.8rem", letterSpacing: "2px", cursor: "pointer", fontFamily: "Syne" }}>LIBRARY</button>
          <div onClick={() => setAccent(accent === "#ff6b35" ? "#a855f7" : "#ff6b35")} style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--accent)", cursor: "pointer" }} />
          <button onClick={() => setDark(!dark)} style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer" }}>{dark ? "🌚" : "🌞"}</button>
        </div>
      </nav>

      <div style={{ paddingTop: "120px" }}>
        
        {/* HERO */}
        {page === "home" && (
          <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "12vh 24px", textAlign: "center" }}>
            <h1 className="spring-up" style={{ fontSize: "clamp(3rem, 10vw, 6.5rem)", fontFamily: "Syne", fontWeight: 800, lineHeight: 0.85, marginBottom: "40px", letterSpacing: "-0.06em" }}>
              Crafted for <br/><span className="gradient-text">The Bold</span>
            </h1>
            <p className="spring-up" style={{ animationDelay: "0.15s", color: "var(--muted)", maxWidth: "550px", margin: "0 auto 50px", fontSize: "1.2rem", fontWeight: 500 }}>
              An artistic repository for creators. Premium video packs, curated study notes, and the future of workflow.
            </p>
            <button className="spring-up btn-art" style={{ animationDelay: "0.3s" }} onClick={() => setPage("browse")}>ENTER THE HUB</button>
          </main>
        )}

        {/* BROWSE */}
        {page === "browse" && (
          <main style={{ maxWidth: "1300px", margin: "0 auto", padding: "20px 24px" }}>
            <div className="spring-up" style={{ textAlign: "center", marginBottom: "60px" }}>
              <h2 style={{ fontFamily: "Syne", fontSize: "3.5rem", marginBottom: "30px", letterSpacing: "-0.04em" }}>Explore</h2>
              <input 
                className="search-art" 
                placeholder="Find your next spark..." 
                onChange={e => setSearch(e.target.value)}
              />
              <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "center", marginTop: "30px" }}>
                <button className={`pill-art ${activeCat === 'all' ? 'active' : ''}`} onClick={() => setActiveCat("all")}>Everything</button>
                {CATEGORIES.map(c => (
                  <button key={c.id} className={`pill-art ${activeCat === c.id ? 'active' : ''}`} onClick={() => setActiveCat(c.id)}>
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid-art">
              {filtered.map((r, i) => (
                <div key={r.id} className="glass card-art spring-up" style={{ animationDelay: `${i * 0.1}s`, overflow: "hidden" }} onClick={() => { setDetailItem(r); setPage("detail"); }}>
                  <div style={{ height: "200px", background: `linear-gradient(180deg, ${CATEGORIES.find(c => c.id === r.category)?.color}10, transparent)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4.5rem" }}>
                    {CATEGORIES.find(c => c.id === r.category)?.icon}
                  </div>
                  <div style={{ padding: "30px" }}>
                    <p style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "10px" }}>{r.category}</p>
                    <h3 style={{ fontSize: "1.3rem", fontFamily: "Syne", fontWeight: 800 }}>{r.title}</h3>
                    <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                       <span style={{ fontSize: "1rem", color: "#38ef7d", fontWeight: 800 }}>{r.price}</span>
                       <span style={{ fontSize: "0.8rem", opacity: 0.4 }}>{r.downloads || 0} units</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        )}

        {/* DETAIL */}
        {page === "detail" && detailItem && (
          <main className="spring-up" style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 24px" }}>
            <button onClick={() => setPage("browse")} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontWeight: 800, marginBottom: "40px", fontFamily: "Syne", letterSpacing: "2px" }}>← BACK TO GALLERY</button>
            <div className="glass" style={{ padding: "60px" }}>
               <h1 style={{ fontFamily: "Syne", fontSize: "clamp(2.5rem, 6vw, 4rem)", marginBottom: "30px", fontWeight: 800, lineHeight: 0.9 }}>{detailItem.title}</h1>
               <p style={{ color: "var(--muted)", lineHeight: 1.8, fontSize: "1.3rem", marginBottom: "50px" }}>{detailItem.description}</p>
               <a href={detailItem.download_link} target="_blank" rel="noreferrer" className="btn-art" style={{ textDecoration: "none", display: "block", textAlign: "center" }}>COLLECT ASSET</a>
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

      <footer style={{ marginTop: "100px", padding: "100px 24px", textAlign: "center", background: "var(--glass)" }}>
        <h2 style={{ fontFamily: "Syne", fontSize: "1.5rem", fontWeight: 800, marginBottom: "15px" }}>CreatorHub</h2>
        <p style={{ opacity: 0.3, fontSize: "0.9rem", letterSpacing: "1px" }}>EST. 2026 • BUILT FOR INFINITY</p>
      </footer>
    </>
  );
}

// ─── ADMIN SUBSYSTEMS ────────────────────────────────────────────────────────
function AdminAuth({ onLogin, accent }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const handleAuth = async () => {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST", headers: { apikey: SUPABASE_ANON, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass })
    });
    const d = await r.json();
    if (r.ok) onLogin(d); else alert("Invalid Signature");
  };
  return (
    <div className="glass spring-up" style={{ maxWidth: "450px", margin: "0 auto", padding: "50px", textAlign: "center" }}>
      <h3 style={{ fontFamily: "Syne", fontSize: "1.5rem", marginBottom: "40px" }}>Vault Access</h3>
      <input placeholder="Admin ID" className="search-art" style={{ marginBottom: "15px" }} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Key" className="search-art" style={{ marginBottom: "30px" }} onChange={e => setPass(e.target.value)} />
      <button className="btn-art" style={{ width: "100%" }} onClick={handleAuth}>UNLOCK</button>
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
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "40px" }}>
      <div className="glass" style={{ padding: "40px" }}>
        <h3 style={{ fontFamily: "Syne", marginBottom: "30px" }}>{editId ? "Modify" : "Mint"} Asset</h3>
        <input placeholder="Title" value={f.title} className="search-art" style={{ marginBottom: "15px" }} onChange={e => setF({...f, title: e.target.value})} />
        <textarea placeholder="Description" value={f.description} className="search-art" style={{ height: "150px", marginBottom: "15px", resize: "none" }} onChange={e => setF({...f, description: e.target.value})} />
        <input placeholder="Source Link" value={f.download_link} className="search-art" style={{ marginBottom: "20px" }} onChange={e => setF({...f, download_link: e.target.value})} />
        <button className="btn-art" style={{ width: "100%" }} onClick={saveItem}>{editId ? "UPDATE" : "PUBLISH"}</button>
        <button onClick={onLogout} style={{ marginTop: "30px", opacity: 0.5, background: "none", border: "none", color: "var(--text)", cursor: "pointer", fontWeight: 800 }}>LOGOUT</button>
      </div>
      
      <div className="glass" style={{ padding: "40px" }}>
        <h3 style={{ fontFamily: "Syne", marginBottom: "30px" }}>Live Inventory</h3>
        {resources.map(r => (
          <div key={r.id} style={{ display: "flex", justifyContent: "space-between", padding: "20px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>{r.title}</span>
            <div style={{ display: "flex", gap: "20px" }}>
              <button onClick={() => { setF(r); setEditId(r.id); }} style={{ color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 800 }}>EDIT</button>
              <button onClick={async () => { if(confirm("Destroy?")) { await db.delete(r.id, token); onUpdate(); } }} style={{ color: "red", background: "none", border: "none", cursor: "pointer", fontWeight: 800 }}>DEL</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
