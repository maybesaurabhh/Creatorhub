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

// ─── API ENGINE ──────────────────────────────────────────────────────────────
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

// ─── STYLES (THE ARTISTIC FIX) ───────────────────────────────────────────────
const GlobalStyle = ({ dark, accent }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    
    :root {
      --bg: ${dark ? "#050505" : "#fdfdfd"};
      --text: ${dark ? "#ffffff" : "#0a0a0a"};
      --muted: rgba(128,128,128,0.5);
      --accent: ${accent || "#ff6b35"};
      --glass: ${dark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.7)"};
      --border: ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"};
    }

    body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; overflow-x: hidden; }

    /* Floating Liquid BG */
    .orb {
      position: fixed; border-radius: 50%; filter: blur(100px);
      opacity: 0.15; z-index: -1; animation: drift 20s infinite alternate;
    }
    .orb-1 { width: 60vw; height: 60vw; background: var(--accent); top: -10%; left: -10%; }
    .orb-2 { width: 50vw; height: 50vw; background: #4ecdc4; bottom: -10%; right: -10%; animation-delay: -5s; }

    @keyframes drift {
      from { transform: translate(0,0) scale(1); }
      to { transform: translate(10%, 10%) scale(1.1); }
    }

    /* Container & Grid Fix */
    .container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    
    .grid {
      display: grid; gap: 24px;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      width: 100%;
    }

    /* Artistic Cards */
    .card {
      background: var(--glass);
      backdrop-filter: blur(25px);
      border: 1px solid var(--border);
      border-radius: 32px;
      padding: 32px;
      transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .card:hover {
      transform: translateY(-12px);
      border-color: var(--accent);
      box-shadow: 0 30px 60px rgba(0,0,0,0.3);
      background: ${dark ? "rgba(255,255,255,0.06)" : "#fff"};
    }

    .card-icon { font-size: 4rem; margin-bottom: 20px; transition: 0.3s; }
    .card:hover .card-icon { transform: scale(1.1) rotate(5deg); }

    .title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(2.5rem, 8vw, 4.5rem); margin-bottom: 20px; letter-spacing: -0.05em; }
    
    .btn {
      background: var(--accent); color: white; border: none; padding: 16px 32px;
      border-radius: 16px; font-family: 'Syne', sans-serif; font-weight: 800;
      text-transform: uppercase; letter-spacing: 2px; cursor: pointer; transition: 0.3s;
    }
    .btn:hover { transform: scale(1.05); box-shadow: 0 10px 20px rgba(255,107,53,0.3); }

    .search-wrap { max-width: 500px; margin: 0 auto 40px; }
    .input {
      width: 100%; padding: 18px 24px; border-radius: 20px; background: var(--glass);
      border: 1px solid var(--border); color: var(--text); outline: none; font-size: 1rem;
    }
    .input:focus { border-color: var(--accent); }

    .pills { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 20px; scrollbar-width: none; justify-content: center; }
    .pill {
      padding: 10px 20px; border-radius: 40px; background: var(--glass);
      border: 1px solid var(--border); color: var(--text); font-weight: 700;
      font-family: 'Syne', sans-serif; cursor: pointer; white-space: nowrap; transition: 0.3s;
    }
    .pill.active { background: var(--accent); color: white; border-color: var(--accent); }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade-in { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
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

  const clickCount = useRef(0);
  const timer = useRef(null);

  const refresh = async () => setResources(await db.getAll());
  useEffect(() => { refresh(); }, []);

  const handleSecret = () => {
    clickCount.current++;
    if (clickCount.current >= 5) { setPage("admin"); clickCount.current = 0; }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => clickCount.current = 0, 1500);
  };

  const filtered = useMemo(() => {
    return resources.filter(r => {
      const mText = r.title?.toLowerCase().includes(search.toLowerCase());
      const mCat = activeCat === "all" || r.category === activeCat;
      return mText && mCat;
    });
  }, [resources, search, activeCat]);

  return (
    <>
      <GlobalStyle dark={dark} accent={accent} />
      <div className="orb orb-1" /><div className="orb orb-2" />

      {/* Navbar */}
      <nav style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000, padding: "20px 5%", display: "flex", justifyContent: "space-between", alignItems: "center", backdropFilter: "blur(20px)" }}>
        <div onClick={handleSecret} style={{ cursor: "pointer", fontFamily: "Syne", fontWeight: 800, fontSize: "1.2rem" }}>
          Creator<span style={{ color: "var(--accent)" }}>Hub</span>
        </div>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <button onClick={() => setPage("browse")} style={{ background: "none", border: "none", color: "var(--text)", fontWeight: 800, cursor: "pointer", fontFamily: "Syne", fontSize: "0.8rem" }}>BROWSE</button>
          <button onClick={() => setDark(!dark)} style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer" }}>{dark ? "🌚" : "🌞"}</button>
        </div>
      </nav>

      <div style={{ paddingTop: "120px", paddingBottom: "100px" }}>
        
        {/* HOME */}
        {page === "home" && (
          <main className="container fade-in" style={{ textAlign: "center", padding: "10vh 0" }}>
            <h1 className="title">Premium <br/><span style={{ color: "var(--accent)" }}>Vault</span></h1>
            <p style={{ color: "var(--muted)", maxWidth: "500px", margin: "0 auto 40px", fontSize: "1.1rem" }}>Curated digital assets for the next generation of creators.</p>
            <button className="btn" onClick={() => setPage("browse")}>Explore Archive</button>
          </main>
        )}

        {/* BROWSE */}
        {page === "browse" && (
          <main className="container">
            <div className="fade-in" style={{ textAlign: "center", marginBottom: "60px" }}>
              <h1 className="title" style={{ fontSize: "3rem" }}>Library</h1>
              <div className="search-wrap">
                <input className="input" placeholder="Query the archive..." onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="pills">
                <button className={`pill ${activeCat === 'all' ? 'active' : ''}`} onClick={() => setActiveCat("all")}>All Units</button>
                {CATEGORIES.map(c => (
                  <button key={c.id} className={`pill ${activeCat === c.id ? 'active' : ''}`} onClick={() => setActiveCat(c.id)}>{c.icon} {c.label}</button>
                ))}
              </div>
            </div>

            <div className="grid">
              {filtered.map((r, i) => (
                <div key={r.id} className="card fade-in" style={{ animationDelay: `${i * 0.1}s` }} onClick={() => { setDetailItem(r); setPage("detail"); }}>
                  <div className="card-icon">{CATEGORIES.find(c => c.id === r.category)?.icon}</div>
                  <h3 style={{ fontFamily: "Syne", fontSize: "1.3rem", fontWeight: 800, marginBottom: "15px" }}>{r.title}</h3>
                  <div style={{ width: "100%", display: "flex", justifyContent: "space-between", marginTop: "auto", opacity: 0.5, fontSize: "0.85rem", fontWeight: 700 }}>
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
          <main className="container fade-in" style={{ maxWidth: "800px" }}>
            <button onClick={() => setPage("browse")} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontWeight: 800, marginBottom: "30px", fontFamily: "Syne" }}>← RETURN</button>
            <div className="card" style={{ textAlign: "left", alignItems: "flex-start" }}>
               <h1 style={{ fontFamily: "Syne", fontSize: "3rem", marginBottom: "20px", lineHeight: 1 }}>{detailItem.title}</h1>
               <p style={{ color: "var(--muted)", lineHeight: 1.7, fontSize: "1.2rem", marginBottom: "40px" }}>{detailItem.description}</p>
               <a href={detailItem.download_link} target="_blank" rel="noreferrer" className="btn" style={{ textDecoration: "none", width: "100%", textAlign: "center" }}>Download Asset</a>
            </div>
          </main>
        )}

        {/* ADMIN */}
        {page === "admin" && (
          <main className="container" style={{ maxWidth: "500px" }}>
            {!session ? (
              <div className="card fade-in">
                <h2 style={{ fontFamily: "Syne", marginBottom: "30px" }}>Vault Login</h2>
                <input className="input" placeholder="Admin Email" style={{ marginBottom: "15px" }} onChange={e => (window.admEmail = e.target.value)} />
                <input className="input" type="password" placeholder="Passkey" style={{ marginBottom: "30px" }} onChange={e => (window.admPass = e.target.value)} />
                <button className="btn" style={{ width: "100%" }} onClick={async () => {
                   const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
                     method: "POST", headers: { apikey: SUPABASE_ANON, "Content-Type": "application/json" },
                     body: JSON.stringify({ email: window.admEmail, password: window.admPass })
                   });
                   const d = await r.json();
                   if (r.ok) { setSession(d); localStorage.setItem(SESSION_KEY, JSON.stringify(d)); } else alert("Denied");
                }}>Initiate Session</button>
              </div>
            ) : (
              <AdminPanel resources={resources} token={session.access_token} onUpdate={refresh} onLogout={() => { setSession(null); localStorage.removeItem(SESSION_KEY); setPage("home"); }} />
            )}
          </main>
        )}
      </div>
    </>
  );
}

function AdminPanel({ resources, token, onUpdate, onLogout }) {
  const [f, setF] = useState({ title: "", description: "", category: "video", download_link: "", price: "Free" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if(!f.title || !f.download_link) return alert("Title/Link Required");
    setLoading(true);
    const ok = await db.upsert(f, token, editId);
    setLoading(false);
    if(ok) { setF({ title: "", description: "", category: "video", download_link: "", price: "Free" }); setEditId(null); onUpdate(); alert("Synced"); }
  };

  return (
    <div style={{ display: "grid", gap: "30px" }}>
      <div className="card fade-in">
        <h3 style={{ fontFamily: "Syne", marginBottom: "20px" }}>{editId ? "Update" : "Mint"} Asset</h3>
        <input className="input" placeholder="Title" value={f.title} style={{ marginBottom: "12px" }} onChange={e => setF({...f, title: e.target.value})} />
        <textarea className="input" placeholder="Metadata" value={f.description} style={{ height: "120px", marginBottom: "12px", resize: "none" }} onChange={e => setF({...f, description: e.target.value})} />
        <input className="input" placeholder="Download URL" value={f.download_link} style={{ marginBottom: "12px" }} onChange={e => setF({...f, download_link: e.target.value})} />
        <select className="input" value={f.category} style={{ marginBottom: "25px" }} onChange={e => setF({...f, category: e.target.value})}>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <button className="btn" style={{ width: "100%" }} onClick={save}>{loading ? "Syncing..." : "Publish"}</button>
      </div>
      <div className="card fade-in" style={{ animationDelay: "0.2s" }}>
        {resources.map(r => (
          <div key={r.id} style={{ display: "flex", justifyContent: "space-between", width: "100%", padding: "15px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontWeight: 700 }}>{r.title}</span>
            <div style={{ display: "flex", gap: "15px" }}>
              <button onClick={() => { setF(r); setEditId(r.id); window.scrollTo(0,0); }} style={{ color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 800 }}>Edit</button>
              <button onClick={async () => { if(confirm("Purge?")) { await db.delete(r.id, token); onUpdate(); } }} style={{ color: "red", background: "none", border: "none", cursor: "pointer", fontWeight: 800 }}>Del</button>
            </div>
          </div>
        ))}
        <button onClick={onLogout} style={{ marginTop: "30px", opacity: 0.5, background: "none", border: "none", cursor: "pointer", color: "var(--text)", fontWeight: 800 }}>Terminate</button>
      </div>
    </div>
  );
}
