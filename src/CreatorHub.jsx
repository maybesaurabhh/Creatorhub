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

// ─── API ENGINE (FIXED SAVE LOGIC) ───────────────────────────────────────────
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
    
    // FIX: Only send the exact columns we want to update. 
    // Sending the 'id' or 'created_at' causes Supabase to reject the save.
    const payload = {
      title: data.title,
      description: data.description,
      category: data.category,
      download_link: data.download_link,
      price: data.price || "Free"
    };

    const r = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
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

// ─── STYLES (PREMIUM UI RESTORED) ────────────────────────────────────────────
const GlobalStyle = ({ dark, accent }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    
    :root {
      --bg: ${dark ? "#07070a" : "#f4f3ee"};
      --text: ${dark ? "#ffffff" : "#121212"};
      --muted: ${dark ? "#888899" : "#666666"};
      --accent: ${accent || "#ff6b35"};
      --border: ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"};
      --glass: ${dark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.8)"};
      --surface: ${dark ? "#121218" : "#ffffff"};
    }

    body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; transition: background 0.4s ease; overflow-x: hidden; }

    /* Subtle Animated Background */
    .motion-bg { position: fixed; inset: 0; z-index: -1; overflow: hidden; }
    .orb { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.15; animation: drift 20s infinite alternate ease-in-out; }
    .orb-1 { width: 50vw; height: 50vw; background: var(--accent); top: -10%; left: -10%; }
    .orb-2 { width: 40vw; height: 40vw; background: #4ecdc4; bottom: -10%; right: -10%; animation-delay: -5s; }
    @keyframes drift { from { transform: translate(0,0); } to { transform: translate(5vw, 5vh); } }

    /* Typography */
    .hero-title { font-family: 'Syne'; font-size: clamp(3rem, 12vw, 6rem); font-weight: 800; line-height: 0.9; letter-spacing: -0.04em; }
    .gradient-text { background: linear-gradient(135deg, var(--accent), #ffd200); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

    /* Grid & Restored Split-Cards */
    .grid { display: grid; gap: 24px; width: 100%; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
    
    .card-pro { 
      background: var(--surface); border: 1px solid var(--border); border-radius: 20px; 
      overflow: hidden; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); cursor: pointer;
    }
    .card-pro:hover { transform: translateY(-8px); border-color: var(--accent); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }

    /* Animations */
    .reveal { opacity: 0; animation: revealUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
    @keyframes revealUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

    /* Inputs & Buttons */
    .input-pro { width: 100%; padding: 16px 20px; border-radius: 14px; border: 1px solid var(--border); background: var(--glass); color: var(--text); font-size: 1rem; margin-bottom: 12px; outline: none; transition: 0.2s; font-family: inherit; }
    .input-pro:focus { border-color: var(--accent); }
    
    .btn-pro { background: var(--accent); color: #fff; border: none; padding: 16px 32px; border-radius: 14px; font-family: 'Syne'; font-weight: 800; cursor: pointer; transition: 0.3s; text-transform: uppercase; letter-spacing: 1px; width: 100%; }
    .btn-pro:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(255,107,53,0.3); }

    .pill { padding: 10px 20px; border-radius: 40px; background: var(--glass); border: 1px solid var(--border); color: var(--text); font-weight: 700; cursor: pointer; white-space: nowrap; font-family: 'Syne'; font-size: 0.85rem; transition: 0.2s; }
    .pill.active { background: var(--accent); color: #fff; border-color: var(--accent); }
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
  const clickTimer = useRef(null);

  const fetchAll = async () => { setResources(await db.getAll()); };
  useEffect(() => { fetchAll(); }, []);

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
      <div className="motion-bg"><div className="orb orb-1"/><div className="orb orb-2"/></div>
      
      <nav style={{ position: "fixed", top: 0, width: "100%", zIndex: 9999, padding: "20px 5%", display: "flex", justifyContent: "space-between", alignItems: "center", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
        <h2 onClick={handleSecretAccess} style={{ cursor: "pointer", fontFamily: 'Syne', fontWeight: 800, fontSize: "1.4rem" }}>
          Creator<span style={{color:'var(--accent)'}}>Hub</span>
        </h2>
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <button onClick={() => setPage("browse")} style={{ background: "none", border: "none", color: "var(--text)", fontWeight: 800, cursor: "pointer", fontSize: "0.8rem" }}>LIBRARY</button>
          <button onClick={() => setDark(!dark)} style={{ background: "none", border: "none", fontSize: "1.3rem", cursor: "pointer" }}>{dark ? "🌚" : "🌞"}</button>
        </div>
      </nav>

      <div style={{ paddingTop: "120px", paddingBottom: "80px", position: "relative", zIndex: 10 }}>
        
        {page === "home" && (
          <main className="reveal" style={{ maxWidth: "1000px", margin: "0 auto", padding: "10vh 24px", textAlign: "center" }}>
            <h1 className="hero-title" style={{ marginBottom: "20px" }}>
              Archive <br/><span className="gradient-text">Infinity</span>
            </h1>
            <p style={{ color: "var(--muted)", margin: "0 auto 40px", maxWidth: "500px", fontSize: "1.1rem", lineHeight: 1.6 }}>
              Premium digital assets tailored for the next generation of creative professionals.
            </p>
            <button className="btn-pro" style={{ width: "auto" }} onClick={() => setPage("browse")}>EXPLORE RESOURCES</button>
          </main>
        )}

        {page === "browse" && (
          <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
            <div className="reveal" style={{ textAlign: "center", marginBottom: "50px" }}>
              <h1 style={{ fontFamily: 'Syne', fontSize: '2.5rem', marginBottom: "25px" }}>The Library</h1>
              <input className="input-pro" style={{ maxWidth: "500px" }} placeholder="Search assets..." onChange={e => setSearch(e.target.value)} />
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", overflowX: "auto", paddingBottom: "10px", marginTop: "15px" }}>
                <button className={`pill ${activeCat === 'all' ? 'active' : ''}`} onClick={() => setActiveCat("all")}>All Units</button>
                {CATEGORIES.map(c => <button key={c.id} className={`pill ${activeCat === c.id ? 'active' : ''}`} onClick={() => setActiveCat(c.id)}>{c.icon} {c.label}</button>)}
              </div>
            </div>
            
            <div className="grid">
              {filtered.map((r, i) => (
                <div key={r.id} className="card-pro reveal" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => { setDetailItem(r); setPage("detail"); }}>
                  {/* RESTORED: Colored Top Half */}
                  <div style={{ height: "160px", background: `linear-gradient(135deg, ${CATEGORIES.find(c => c.id === r.category)?.color}15, transparent)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", borderBottom: "1px solid var(--border)" }}>
                    {CATEGORIES.find(c => c.id === r.category)?.icon}
                  </div>
                  {/* RESTORED: Clean Bottom Half */}
                  <div style={{ padding: "24px", textAlign: "left" }}>
                    <div style={{ color: "var(--accent)", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>{r.category}</div>
                    <h3 style={{ fontFamily: 'Syne', fontSize: '1.2rem', marginBottom: "15px", lineHeight: 1.3 }}>{r.title}</h3>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "15px" }}>
                      <span style={{ color: "#38ef7d", fontWeight: 800, fontSize: "0.9rem" }}>{r.price || "Free"}</span>
                      <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>⬇️ {r.downloads || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        )}

        {page === "detail" && detailItem && (
          <main className="reveal" style={{ maxWidth: "800px", margin: "0 auto", padding: "0 24px" }}>
            <button onClick={() => setPage("browse")} style={{ color: 'var(--accent)', background: 'none', border: 'none', fontWeight: 800, cursor: 'pointer', marginBottom: "30px", fontFamily: 'Syne', letterSpacing: "1px" }}>← BACK TO LIBRARY</button>
            <div className="card-pro" style={{ padding: "40px" }}>
              <div style={{ fontSize: "5rem", marginBottom: "20px" }}>{CATEGORIES.find(c => c.id === detailItem.category)?.icon}</div>
              <h1 style={{ fontFamily: 'Syne', fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: "20px", lineHeight: 1.1 }}>{detailItem.title}</h1>
              <p style={{ lineHeight: 1.7, color: 'var(--muted)', fontSize: '1.1rem', marginBottom: "40px" }}>{detailItem.description}</p>
              <a href={detailItem.download_link} target="_blank" rel="noreferrer" className="btn-pro" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>DOWNLOAD ASSET</a>
            </div>
          </main>
        )}

        {page === "admin" && (
          <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px" }}>
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

// ─── ADMIN HELPERS (FULLY FUNCTIONAL AGAIN) ──────────────────────────────────
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
    if (r.ok) onLogin(d); else alert("Access Denied.");
  };

  return (
    <div className="card-pro reveal" style={{ maxWidth: "450px", margin: "0 auto", padding: "40px", textAlign: "center", background: "var(--glass)" }}>
      <h3 style={{ fontFamily: 'Syne', fontSize: '1.8rem', marginBottom: "30px" }}>Vault Access</h3>
      <input placeholder="Admin ID" className="input-pro" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Passkey" className="input-pro" value={pass} onChange={e => setPass(e.target.value)} />
      <button className="btn-pro" onClick={handleAuth} disabled={loading}>{loading ? "VERIFYING..." : "LOGIN"}</button>
    </div>
  );
}

function AdminDashboard({ resources, token, onUpdate, onLogout }) {
  const [f, setF] = useState({ title: "", description: "", category: "video", download_link: "", price: "Free" });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if(!f.title || !f.download_link) return alert("Title and Link are required.");
    setSaving(true);
    const ok = await db.upsert(f, token, editId);
    setSaving(false);
    if(ok) { 
      setF({ title: "", description: "", category: "video", download_link: "", price: "Free" }); 
      setEditId(null); 
      onUpdate(); 
      alert("Successfully Saved to Cloud!"); 
    } else {
      alert("Error saving data. Check console.");
    }
  };

  return (
    <div className="reveal" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px" }}>
      <div className="card-pro" style={{ padding: "30px", height: "fit-content", background: "var(--glass)" }}>
        <h3 style={{ fontFamily: 'Syne', fontSize: '1.4rem', marginBottom: "25px" }}>{editId ? "Edit" : "Add"} Resource</h3>
        <input placeholder="Title" value={f.title} className="input-pro" onChange={e => setF({...f, title: e.target.value})} />
        <textarea placeholder="Description" value={f.description} className="input-pro" style={{ height: "100px", resize: "none" }} onChange={e => setF({...f, description: e.target.value})} />
        <input placeholder="Download URL" value={f.download_link} className="input-pro" onChange={e => setF({...f, download_link: e.target.value})} />
        <input placeholder="Price (e.g., Free, $5)" value={f.price} className="input-pro" onChange={e => setF({...f, price: e.target.value})} />
        
        <select className="input-pro" value={f.category} onChange={e => setF({...f, category: e.target.value})}>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        
        <button className="btn-pro" onClick={save} disabled={saving}>{saving ? "SYNCING..." : (editId ? "UPDATE CLOUD" : "PUBLISH")}</button>
        {editId && <button onClick={() => { setEditId(null); setF({title:"",description:"",category:"video",download_link:"",price:"Free"}) }} style={{ width: '100%', marginTop: 10, padding: 15, background: 'none', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 14, cursor: 'pointer', fontWeight: 700 }}>CANCEL</button>}
      </div>
      
      <div className="card-pro" style={{ padding: "30px", background: "var(--glass)" }}>
        <h3 style={{ fontFamily: 'Syne', fontSize: '1.4rem', marginBottom: "25px" }}>Inventory</h3>
        <div style={{ maxHeight: "500px", overflowY: "auto", paddingRight: 10 }}>
          {resources.map(r => (
            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{r.title}</div>
                <div style={{ color: 'var(--accent)', fontSize: '0.7rem', textTransform: 'uppercase', marginTop: 4 }}>{r.category}</div>
              </div>
              <div style={{ display: 'flex', gap: "10px" }}>
                <button onClick={() => { setF(r); setEditId(r.id); window.scrollTo(0,0); }} style={{ color: 'var(--text)', background: 'none', border: 'none', fontWeight: 800, cursor: 'pointer', padding: 8 }}>EDIT</button>
                <button onClick={async () => { if(confirm("Delete permanently?")) { await db.delete(r.id, token); onUpdate(); } }} style={{ color: '#ff3b30', background: 'none', border: 'none', fontWeight: 800, cursor: 'pointer', padding: 8 }}>DEL</button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onLogout} style={{ marginTop: "30px", width: '100%', padding: 15, background: 'none', border: 'none', color: '#ff3b30', fontWeight: 800, cursor: 'pointer' }}>LOGOUT</button>
      </div>
    </div>
  );
}
