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

// ─── STYLES (THE ARTISTIC RESTORATION) ───────────────────────────────────────
const GlobalStyle = ({ dark, accent }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    
    :root {
      --bg: ${dark ? "#050505" : "#fdfdfd"};
      --text: ${dark ? "#ffffff" : "#0a0a0a"};
      --muted: ${dark ? "rgba(128,128,128,0.5)" : "rgba(80,80,80,0.5)"};
      --accent: ${accent || "#ff6b35"};
      --border: ${dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"};
      --glass: ${dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)"};
    }

    body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; overflow-x: hidden; }

    /* Motion Background */
    .motion-bg { position: fixed; inset: 0; z-index: -1; overflow: hidden; }
    .orb { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.15; animation: float 20s infinite alternate; }
    .orb-1 { width: 600px; height: 600px; background: var(--accent); top: -10%; left: -10%; }
    .orb-2 { width: 400px; height: 400px; background: #4ecdc4; bottom: -5%; right: -5%; animation-delay: -5s; }
    @keyframes float { from { transform: translate(0,0) scale(1); } to { transform: translate(50px, 50px) scale(1.1); } }

    /* Hero Fix */
    .hero-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 0 50px; }
    .premium-txt { font-family: 'Syne'; font-size: clamp(3rem, 12vw, 7rem); font-weight: 800; line-height: 0.8; letter-spacing: -0.05em; margin-bottom: 10px; }
    .vault-txt { font-family: 'Syne'; font-size: clamp(2.5rem, 10vw, 5rem); font-weight: 800; color: var(--accent); line-height: 0.8; }

    /* Grid & Cards (The Fix) */
    .grid { display: grid; gap: 24px; width: 100%; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); padding: 20px; }
    .glass { background: var(--glass); backdrop-filter: blur(25px); border: 1px solid var(--border); border-radius: 28px; padding: 30px; transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1); cursor: pointer; text-align: center; }
    .glass:hover { transform: translateY(-10px); border-color: var(--accent); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }

    /* Animations */
    .spring-up { opacity: 0; animation: springUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
    @keyframes springUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }

    .input-art { width: 100%; padding: 18px; border-radius: 18px; border: 1px solid var(--border); background: var(--glass); color: var(--text); font-size: 1rem; margin-bottom: 15px; outline: none; transition: 0.3s; }
    .input-art:focus { border-color: var(--accent); }

    .pill { padding: 10px 20px; border-radius: 40px; background: var(--glass); border: 1px solid var(--border); color: var(--text); font-weight: 700; cursor: pointer; white-space: nowrap; font-family: 'Syne'; }
    .pill.active { background: var(--accent); color: #fff; }
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

  const fetchAll = async () => { setResources(await db.getAll()); };
  useEffect(() => { fetchAll(); }, []);

  const filtered = useMemo(() => {
    return resources.filter(r => {
      const tMatch = r.title?.toLowerCase().includes(search.toLowerCase());
      const cMatch = activeCat === "all" || r.category === activeCat;
      return tMatch && cMatch;
    });
  }, [resources, search, activeCat]);

  return (
    <>
      <GlobalStyle dark={dark} accent={accent} />
      <div className="motion-bg"><div className="orb orb-1"/><div className="orb orb-2"/></div>
      
      <nav style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000, padding: "20px 5%", display: "flex", justifyContent: "space-between", alignItems: "center", backdropFilter: "blur(15px)" }}>
        <h2 onClick={() => setPage("home")} style={{ cursor: "pointer", fontFamily: 'Syne', fontWeight: 800 }}>Creator<span style={{color:'var(--accent)'}}>Hub</span></h2>
        <div style={{ display: "flex", gap: "20px" }}>
          <button onClick={() => setPage("browse")} style={{ background: "none", border: "none", color: "var(--text)", fontWeight: 800, cursor: "pointer" }}>ARCHIVE</button>
          <button onClick={() => setDark(!dark)} style={{ background: "none", border: "none", fontSize: "1.4rem" }}>{dark ? "🌚" : "🌞"}</button>
        </div>
      </nav>

      <div style={{ paddingTop: "100px" }}>
        {page === "home" && (
          <main className="spring-up hero-wrap">
            <div className="premium-txt">Premium</div>
            <div className="vault-txt">Vault</div>
            <p style={{ color: "var(--muted)", marginTop: 20, maxWidth: 500, textAlign: 'center' }}>High-motion assets for modern creators.</p>
            <button className="glass" style={{ marginTop: 40, padding: '15px 40px', background: 'var(--accent)', color: '#fff', fontWeight: 800 }} onClick={() => setPage("browse")}>EXPLORE ARCHIVE</button>
          </main>
        )}

        {page === "browse" && (
          <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
            <div className="spring-up" style={{ textAlign: "center", marginBottom: 50 }}>
              <h1 style={{ fontFamily: 'Syne', fontSize: '3.5rem', marginBottom: 20 }}>Archive</h1>
              <input className="input-art" style={{ maxWidth: 500 }} placeholder="Query data..." onChange={e => setSearch(e.target.value)} />
              <div style={{ display: "flex", gap: 10, justifyContent: "center", overflowX: "auto", padding: 10 }}>
                <button className={`pill ${activeCat === 'all' ? 'active' : ''}`} onClick={() => setActiveCat("all")}>All</button>
                {CATEGORIES.map(c => <button key={c.id} className={`pill ${activeCat === c.id ? 'active' : ''}`} onClick={() => setActiveCat(c.id)}>{c.icon} {c.label}</button>)}
              </div>
            </div>
            <div className="grid">
              {filtered.map((r, i) => (
                <div key={r.id} className="glass spring-up" style={{ animationDelay: `${i * 0.1}s` }} onClick={() => { setDetailItem(r); setPage("detail"); }}>
                  <div style={{ fontSize: "4rem", marginBottom: 15 }}>{CATEGORIES.find(c => c.id === r.category)?.icon}</div>
                  <h3 style={{ fontFamily: 'Syne', fontSize: '1.2rem' }}>{r.title}</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 10 }}>{r.price} • {r.downloads || 0} downloads</p>
                </div>
              ))}
            </div>
          </main>
        )}

        {page === "detail" && detailItem && (
          <main className="spring-up" style={{ maxWidth: 800, margin: "0 auto", padding: 40 }}>
            <button onClick={() => setPage("browse")} style={{ color: 'var(--accent)', background: 'none', border: 'none', fontWeight: 800, cursor: 'pointer', marginBottom: 30 }}>← RETURN</button>
            <div className="glass">
              <h1 style={{ fontFamily: 'Syne', fontSize: '3rem', marginBottom: 20 }}>{detailItem.title}</h1>
              <p style={{ lineHeight: 1.8, color: 'var(--muted)', fontSize: '1.2rem', marginBottom: 40 }}>{detailItem.description}</p>
              <a href={detailItem.download_link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'block', textAlign: 'center', padding: 20, background: 'var(--accent)', color: '#fff', borderRadius: 15, fontWeight: 800 }}>DOWNLOAD ASSET</a>
            </div>
          </main>
        )}

        {page === "admin" && (
          <main style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
            {!session ? (
              <div className="glass spring-up">
                <h2 style={{ fontFamily: 'Syne', marginBottom: 30 }}>Vault Login</h2>
                <input className="input-art" placeholder="Email" onChange={e => (window.email = e.target.value)} />
                <input className="input-art" type="password" placeholder="Passkey" onChange={e => (window.pass = e.target.value)} />
                <button className="input-art" style={{ background: 'var(--accent)', color: '#fff', fontWeight: 800 }} onClick={async () => {
                   const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
                     method: "POST", headers: { apikey: SUPABASE_ANON, "Content-Type": "application/json" },
                     body: JSON.stringify({ email: window.email, password: window.pass })
                   });
                   const d = await r.json();
                   if(r.ok) { setSession(d); localStorage.setItem(SESSION_KEY, JSON.stringify(d)); } else alert("Denied");
                }}>INITIATE</button>
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
  const [editId, setEditId] = useState(null);
  const save = async () => {
    const ok = await db.upsert(f, token, editId);
    if(ok) { setF({ title: "", description: "", category: "video", download_link: "", price: "Free" }); setEditId(null); onUpdate(); alert("Synced"); }
  };
  return (
    <div style={{ display: 'grid', gap: 30 }}>
      <div className="glass">
        <h3 style={{ fontFamily: 'Syne', marginBottom: 20 }}>{editId ? "Modify" : "Mint"} Asset</h3>
        <input placeholder="Title" value={f.title} className="input-art" onChange={e => setF({...f, title: e.target.value})} />
        <textarea placeholder="Description" value={f.description} className="input-art" style={{ height: 120 }} onChange={e => setF({...f, description: e.target.value})} />
        <input placeholder="Link" value={f.download_link} className="input-art" onChange={e => setF({...f, download_link: e.target.value})} />
        <select className="input-art" value={f.category} onChange={e => setF({...f, category: e.target.value})}>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <button className="input-art" style={{ background: 'var(--accent)', color: '#fff', fontWeight: 800 }} onClick={save}>DEPLOY</button>
      </div>
      <div className="glass">
        {resources.map(r => (
          <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 700 }}>{r.title}</span>
            <div style={{ display: 'flex', gap: 15 }}>
              <button onClick={() => { setF(r); setEditId(r.id); }} style={{ color: 'var(--accent)', background: 'none', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Edit</button>
              <button onClick={async () => { if(confirm("Purge?")) { await db.delete(r.id, token); onUpdate(); } }} style={{ color: 'red', background: 'none', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Del</button>
            </div>
          </div>
        ))}
        <button onClick={onLogout} style={{ marginTop: 30, width: '100%', background: 'none', border: 'none', color: 'var(--muted)', fontWeight: 800, cursor: 'pointer' }}>LOGOUT</button>
      </div>
    </div>
  );
}
