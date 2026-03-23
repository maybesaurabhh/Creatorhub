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
      --border: ${dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"};
      --glass: ${dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)"};
    }

    body { 
      background: var(--bg); 
      color: var(--text); 
      font-family: 'DM Sans', sans-serif; 
      transition: background 0.4s ease;
      overflow-x: hidden;
    }

    /* Motion BG */
    .motion-bg {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      z-index: -1; overflow: hidden; background: var(--bg);
    }
    .orb {
      position: absolute; border-radius: 50%; filter: blur(120px);
      opacity: ${dark ? 0.18 : 0.12};
      animation: float 20s infinite alternate ease-in-out;
    }
    .orb-1 { width: 80vw; height: 80vw; background: var(--accent); top: -20%; left: -20%; }
    .orb-2 { width: 70vw; height: 70vw; background: #4ecdc4; bottom: -10%; right: -10%; animation-delay: -5s; }

    @keyframes float {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(10%, 15%) scale(1.1); }
    }

    /* Layout Components */
    .glass { 
      background: var(--glass); 
      backdrop-filter: blur(30px); 
      -webkit-backdrop-filter: blur(30px);
      border: 1px solid var(--border); 
      border-radius: 28px; 
      padding: 24px;
    }

    .container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .spring-up { 
      opacity: 0;
      animation: springUp 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; 
    }

    @keyframes springUp {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .grid {
      display: grid;
      gap: 20px;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      width: 100%;
    }

    /* Interactive Elements */
    .btn-art {
      background: var(--accent);
      color: #fff; border: none; padding: 16px 32px;
      border-radius: 16px; font-family: 'Syne', sans-serif;
      font-weight: 800; cursor: pointer; transition: 0.3s;
      text-transform: uppercase; letter-spacing: 2px;
      width: 100%;
    }
    .btn-art:hover { transform: translateY(-3px); box-shadow: 0 15px 30px ${accent}40; }

    .input-art {
      width: 100%; 
      padding: 16px 20px; 
      border-radius: 16px;
      border: 1px solid var(--border); 
      background: var(--glass);
      color: var(--text); 
      font-size: 1rem; 
      outline: none; 
      margin-bottom: 12px;
      display: block;
    }
    .input-art:focus { border-color: var(--accent); }

    .pill-art {
      padding: 10px 20px; border-radius: 40px; background: var(--glass);
      border: 1px solid var(--border); color: var(--text); font-weight: 700;
      font-family: 'Syne', sans-serif; cursor: pointer; white-space: nowrap;
    }
    .pill-art.active { background: var(--accent); color: #fff; border-color: var(--accent); }

    .filter-row {
      display: flex; gap: 10px; overflow-x: auto; padding-bottom: 10px;
      scrollbar-width: none; justify-content: flex-start;
    }
    @media (min-width: 768px) { .filter-row { justify-content: center; } }
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
      const matchText = r.title?.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCat === "all" || r.category === activeCat;
      return matchText && matchCat;
    });
  }, [resources, search, activeCat]);

  return (
    <>
      <GlobalStyle dark={dark} accent={accent} />
      <div className="motion-bg"><div className="orb orb-1"/><div className="orb orb-2"/></div>
      
      {/* Navbar */}
      <nav style={{ position: "fixed", top: 0, width: "100%", zIndex: 2000, padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", backdropFilter: "blur(20px)" }}>
        <div onClick={handleSecretAccess} style={{ cursor: "pointer", fontFamily: "Syne", fontWeight: 800, fontSize: "1.2rem" }}>
          Creator<span style={{ color: "var(--accent)" }}>Hub</span>
        </div>
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <button onClick={() => setPage("browse")} style={{ background: "none", border: "none", color: "var(--text)", fontWeight: 800, fontSize: "0.7rem", letterSpacing: "1px", cursor: "pointer" }}>DASHBOARD</button>
          <button onClick={() => setDark(!dark)} style={{ background: "none", border: "none", fontSize: "1.2rem" }}>{dark ? "🌚" : "🌞"}</button>
        </div>
      </nav>

      <div style={{ paddingTop: "100px", paddingBottom: "60px" }}>
        
        {/* HOME PAGE */}
        {page === "home" && (
          <main className="container" style={{ textAlign: "center", padding: "15vh 0" }}>
            <h1 className="spring-up" style={{ fontSize: "clamp(2.5rem, 10vw, 6rem)", fontFamily: "Syne", fontWeight: 800, lineHeight: 0.9, marginBottom: "30px" }}>
              Archive <br/><span style={{ color: "var(--accent)" }}>Infinity</span>
            </h1>
            <p className="spring-up" style={{ animationDelay: "0.2s", color: "var(--muted)", maxWidth: "500px", margin: "0 auto 40px" }}>
              Secure digital assets for the next generation of creators.
            </p>
            <button className="spring-up btn-art" style={{ width: "auto", animationDelay: "0.4s" }} onClick={() => setPage("browse")}>EXPLORE ARCHIVE</button>
          </main>
        )}

        {/* BROWSE PAGE */}
        {page === "browse" && (
          <main className="container">
            <div className="spring-up" style={{ textAlign: "center", marginBottom: "40px" }}>
              <h2 style={{ fontFamily: "Syne", fontSize: "2.5rem", marginBottom: "20px" }}>Archive</h2>
              <input 
                className="input-art" 
                placeholder="Query database..." 
                onChange={e => setSearch(e.target.value)}
              />
              <div className="filter-row">
                <button className={`pill-art ${activeCat === 'all' ? 'active' : ''}`} onClick={() => setActiveCat("all")}>All Units</button>
                {CATEGORIES.map(c => (
                  <button key={c.id} className={`pill-art ${activeCat === c.id ? 'active' : ''}`} onClick={() => setActiveCat(c.id)}>{c.icon} {c.label}</button>
                ))}
              </div>
            </div>

            <div className="grid">
              {filtered.map((r, i) => (
                <div key={r.id} className="glass spring-up" style={{ animationDelay: `${i * 0.1}s`, cursor: "pointer" }} onClick={() => { setDetailItem(r); setPage("detail"); }}>
                  <div style={{ fontSize: "3rem", marginBottom: "15px", textAlign: "center" }}>{CATEGORIES.find(c => c.id === r.category)?.icon}</div>
                  <h3 style={{ fontFamily: "Syne", fontSize: "1.1rem", marginBottom: "10px" }}>{r.title}</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", opacity: 0.6, fontSize: "0.8rem" }}>
                    <span>{r.price}</span>
                    <span>⬇️ {r.downloads || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </main>
        )}

        {/* DETAIL PAGE */}
        {page === "detail" && detailItem && (
          <main className="container" style={{ maxWidth: "700px" }}>
            <button onClick={() => setPage("browse")} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontWeight: 800, marginBottom: "30px" }}>← RETURN</button>
            <div className="glass spring-up">
               <h1 style={{ fontFamily: "Syne", fontSize: "2.5rem", marginBottom: "20px" }}>{detailItem.title}</h1>
               <p style={{ color: "var(--muted)", lineHeight: 1.6, marginBottom: "40px" }}>{detailItem.description}</p>
               <a href={detailItem.download_link} target="_blank" rel="noreferrer" className="btn-art" style={{ textDecoration: "none", display: "block", textAlign: "center" }}>DOWNLOAD ASSET</a>
            </div>
          </main>
        )}

        {/* ADMIN PAGE */}
        {page === "admin" && (
          <main className="container" style={{ maxWidth: "600px" }}>
            {!session ? (
              <div className="glass spring-up">
                <h3 style={{ fontFamily: "Syne", textAlign: "center", marginBottom: "30px" }}>Vault Login</h3>
                <input placeholder="Admin ID" className="input-art" onChange={e => (window.email = e.target.value)} />
                <input type="password" placeholder="Passkey" className="input-art" onChange={e => (window.pass = e.target.value)} />
                <button className="btn-art" onClick={async () => {
                   const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
                     method: "POST", headers: { apikey: SUPABASE_ANON, "Content-Type": "application/json" },
                     body: JSON.stringify({ email: window.email, password: window.pass })
                   });
                   const d = await r.json();
                   if (r.ok) { setSession(d); localStorage.setItem(SESSION_KEY, JSON.stringify(d)); } else alert("Denied");
                }}>INITIATE</button>
              </div>
            ) : (
              <div className="spring-up">
                <div className="glass" style={{ marginBottom: "30px" }}>
                  <h3 style={{ fontFamily: "Syne", marginBottom: "20px" }}>Add Entry</h3>
                  <input placeholder="Title" className="input-art" onChange={e => (window.newTitle = e.target.value)} />
                  <textarea placeholder="Metadata / Description" className="input-art" style={{ height: "120px" }} onChange={e => (window.newDesc = e.target.value)} />
                  <input placeholder="Cloud Source URL" className="input-art" onChange={e => (window.newLink = e.target.value)} />
                  <select className="input-art" onChange={e => (window.newCat = e.target.value)}>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                  <button className="btn-art" onClick={async () => {
                     await db.upsert({ title: window.newTitle, description: window.newDesc, download_link: window.newLink, category: window.newCat || "video" }, session.access_token);
                     alert("Deployed!"); fetchAll();
                  }}>DEPLOY</button>
                </div>
                
                <div className="glass">
                  <h3 style={{ fontFamily: "Syne", marginBottom: "20px" }}>Inventory</h3>
                  {resources.map(r => (
                    <div key={r.id} style={{ display: "flex", justifyContent: "space-between", padding: "15px 0", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ fontWeight: 700 }}>{r.title}</span>
                      <button onClick={async () => { if(confirm("Purge?")) { await db.delete(r.id, session.access_token); fetchAll(); } }} style={{ color: "red", background: "none", border: "none", cursor: "pointer" }}>DEL</button>
                    </div>
                  ))}
                  <button onClick={() => { setSession(null); localStorage.removeItem(SESSION_KEY); setPage("home"); }} style={{ marginTop: "20px", width: "100%", background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontWeight: 800 }}>TERMINATE SESSION</button>
                </div>
              </div>
            )}
          </main>
        )}
      </div>
    </>
  );
}
