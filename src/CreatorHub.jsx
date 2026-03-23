import { useState, useEffect, useMemo, useRef } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://umnytptisqdvesspzlqd.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtbnl0cHRpc3FkdmVzc3B6bHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNTM0MDMsImV4cCI6MjA4OTgyOTQwM30.lt-MSfi6afdjZKTJhvhfT7OPqc4yHSaZo9lp5aLUQTg";
const SESSION_KEY = "ch_supabase_session";

const CATEGORIES = [
  { id: "video", label: "Video Packs", icon: "🎬", color: "#ff6b35" },
  { id: "study", label: "Study Materials", icon: "📚", color: "#4ecdc4" },
  { id: "productivity", label: "Productivity", icon: "⚡", color: "#ffe66d" },
  { id: "reels", label: "Reel Packs", icon: "🎞️", color: "#a8edea" },
];

// ─── API HELPERS ─────────────────────────────────────────────────────────────
const db = {
  async getAll() {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/resources?select=*&order=created_at.desc`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` }
    });
    return r.ok ? r.json() : [];
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
const GlobalStyle = ({ dark }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    :root {
      --bg: ${dark ? "#0a0a0f" : "#f4f3ee"};
      --text: ${dark ? "#f0ede8" : "#1a1814"};
      --muted: ${dark ? "#7a7a8a" : "#7a7670"};
      --accent: #ff6b35;
      --border: ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"};
      --surface: ${dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.72)"};
      --surface2: ${dark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.9)"};
    }

    body { 
      background: var(--bg); 
      color: var(--text); 
      font-family: 'DM Sans', sans-serif; 
      transition: background 0.4s;
      overflow-x: hidden;
    }

    .glass { background: var(--surface); backdrop-filter: blur(20px); border: 1px solid var(--border); border-radius: 14px; }
    
    .gradient-text {
      background: linear-gradient(135deg, #ff6b35, #ffd200);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .fade-up { animation: fadeUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
    .delay-1 { animation-delay: 0.1s; }
    .delay-2 { animation-delay: 0.2s; }

    .lift { transition: transform 0.3s ease, box-shadow 0.3s ease; cursor: pointer; }
    .lift:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(255,107,53,0.15); }

    .btn-primary { 
      background: linear-gradient(135deg, #ff6b35, #ff4500); 
      color: #fff; border: none; padding: 12px 28px; 
      border-radius: 10px; font-family: 'Syne', sans-serif; 
      font-weight: 800; cursor: pointer; transition: 0.2s;
    }
    .btn-primary:hover { transform: scale(1.05); }

    .search-input {
      width: 100%; max-width: 500px; padding: 14px 20px;
      border-radius: 12px; border: 1px solid var(--border);
      background: var(--surface2); color: var(--text);
      outline: none; transition: 0.2s;
    }
    .search-input:focus { border-color: var(--accent); }

    .filter-pill {
      padding: 8px 18px; border-radius: 25px; border: 1px solid var(--border);
      background: var(--surface); cursor: pointer; font-size: 0.85rem;
      font-weight: 600; transition: 0.2s; color: var(--text);
    }
    .filter-pill.active { background: var(--accent); color: white; border-color: var(--accent); }
  `}</style>
);

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(true);
  const [page, setPage] = useState("home");
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [detailRes, setDetailRes] = useState(null);
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem(SESSION_KEY)));

  const refresh = async () => { setResources(await db.getAll()); };
  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    return resources.filter(r => {
      const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === "all" || r.category === catFilter;
      return matchSearch && matchCat;
    });
  }, [resources, search, catFilter]);

  return (
    <>
      <GlobalStyle dark={dark} />
      
      {/* Navigation */}
      <nav style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000, padding: "18px 24px", background: "var(--bg)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div onClick={() => setPage("home")} style={{ cursor: "pointer", fontFamily: "Syne", fontWeight: 800, fontSize: "1.2rem" }}>
          Creator<span className="gradient-text">Hub</span>
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <button onClick={() => setPage("browse")} style={{ background: "none", border: "none", color: "var(--text)", cursor: "pointer", fontWeight: 700, fontFamily: "Syne", fontSize: "0.9rem" }}>BROWSE</button>
          <button onClick={() => setDark(!dark)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem" }}>{dark ? "☀️" : "🌙"}</button>
        </div>
      </nav>

      <div style={{ paddingTop: 100 }}>
        
        {/* HOME PAGE */}
        {page === "home" && (
          <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center", padding: "80px 20px" }}>
            <div className="fade-up glass" style={{ display: "inline-block", padding: "6px 16px", borderRadius: 30, fontSize: "0.8rem", fontWeight: 700, marginBottom: 20 }}>
              🚀 1,200+ Resources for FREE
            </div>
            <h1 className="fade-up delay-1" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", fontFamily: "Syne", fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>
              The Ultimate Hub for <br/><span className="gradient-text">Creators & Students</span>
            </h1>
            <p className="fade-up delay-2" style={{ color: "var(--muted)", maxWidth: 600, margin: "0 auto 40px", fontSize: "1.1rem" }}>
              High-quality video packs, study materials, and productivity templates delivered instantly via Supabase.
            </p>
            <button className="fade-up delay-2 btn-primary" onClick={() => setPage("browse")}>EXPLORE RESOURCES</button>
          </div>
        )}

        {/* BROWSE PAGE */}
        {page === "browse" && (
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px" }}>
            <div style={{ textAlign: "center", marginBottom: 50 }}>
              <h2 style={{ fontFamily: "Syne", fontSize: "2.5rem", marginBottom: 20 }}>Browse Library</h2>
              <input 
                className="search-input" 
                placeholder="Search packs, templates, tags..." 
                onChange={e => setSearch(e.target.value)}
              />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 25 }}>
                <button className={`filter-pill ${catFilter === 'all' ? 'active' : ''}`} onClick={() => setCatFilter("all")}>All</button>
                {CATEGORIES.map(c => (
                  <button key={c.id} className={`filter-pill ${catFilter === c.id ? 'active' : ''}`} onClick={() => setCatFilter(c.id)}>
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid-3">
              {filtered.map((r, i) => (
                <div key={r.id} className="glass lift fade-up" style={{ animationDelay: `${i * 0.05}s`, overflow: "hidden" }} onClick={() => { setDetailRes(r); setPage("detail"); }}>
                  <div style={{ height: 160, background: `linear-gradient(45deg, ${CATEGORIES.find(c => c.id === r.category)?.color}33, transparent)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>
                    {CATEGORIES.find(c => c.id === r.category)?.icon}
                  </div>
                  <div style={{ padding: 20 }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--accent)", textTransform: "uppercase", marginBottom: 5 }}>{r.category}</div>
                    <h3 style={{ fontSize: "1.1rem", fontFamily: "Syne" }}>{r.title}</h3>
                    <div style={{ marginTop: 15, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                       <span style={{ fontSize: "0.8rem", color: "#38ef7d", fontWeight: 700 }}>{r.price}</span>
                       <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>⬇️ {r.downloads || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DETAIL PAGE */}
        {page === "detail" && detailRes && (
          <div className="fade-up" style={{ maxWidth: 800, margin: "0 auto", padding: 40 }}>
            <button onClick={() => setPage("browse")} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontWeight: 800, marginBottom: 30 }}>← BACK TO LIBRARY</button>
            <div className="glass" style={{ padding: 40 }}>
               <h1 style={{ fontFamily: "Syne", fontSize: "2.5rem", marginBottom: 15 }}>{detailRes.title}</h1>
               <p style={{ color: "var(--muted)", lineHeight: 1.8, fontSize: "1.1rem", marginBottom: 30 }}>{detailRes.description}</p>
               <a href={detailRes.download_link} className="btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>DOWNLOAD NOW</a>
            </div>
          </div>
        )}

        {/* ADMIN PAGE */}
        {page === "admin" && (
          <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
            {!session ? (
              <AdminLogin onLogin={(s) => { setSession(s); localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }} />
            ) : (
              <AdminPanel resources={resources} token={session.access_token} onUpdate={refresh} onLogout={() => { setSession(null); localStorage.removeItem(SESSION_KEY); }} />
            )}
          </div>
        )}
      </div>

      <footer style={{ marginTop: 100, padding: 60, textAlign: "center", borderTop: "1px solid var(--border)" }}>
        <p style={{ opacity: 0.4, fontSize: "0.9rem" }}>© 2026 CreatorHub — All Assets Provided Free</p>
        <button onClick={() => setPage("admin")} style={{ opacity: 0, cursor: "default" }}>admin</button>
      </footer>
    </>
  );
}

// ─── ADMIN HELPERS ───────────────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const handle = async () => {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST", headers: { apikey: SUPABASE_ANON, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass })
    });
    const d = await r.json();
    if (r.ok) onLogin(d); else alert("Invalid Credentials");
  };
  return (
    <div className="glass" style={{ maxWidth: 400, margin: "0 auto", padding: 40, textAlign: "center" }}>
      <h3 style={{ fontFamily: "Syne", marginBottom: 20 }}>Admin Secure Access</h3>
      <input placeholder="Email" className="search-input" style={{ marginBottom: 15 }} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" className="search-input" style={{ marginBottom: 20 }} onChange={e => setPass(e.target.value)} />
      <button className="btn-primary" style={{ width: "100%" }} onClick={handle}>SIGN IN</button>
    </div>
  );
}

function AdminPanel({ resources, token, onUpdate, onLogout }) {
  const [form, setForm] = useState({ title: "", description: "", category: "video", download_link: "", price: "Free" });
  const [editId, setEditId] = useState(null);

  const save = async () => {
    await db.upsert(form, token, editId);
    setForm({ title: "", description: "", category: "video", download_link: "", price: "Free" });
    setEditId(null);
    onUpdate();
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 30 }}>
      <div className="glass" style={{ padding: 25 }}>
        <h3 style={{ fontFamily: "Syne", marginBottom: 20 }}>{editId ? "Update" : "Add"} Resource</h3>
        <input placeholder="Title" value={form.title} className="search-input" style={{ marginBottom: 10 }} onChange={e => setForm({...form, title: e.target.value})} />
        <textarea placeholder="Description" value={form.description} className="search-input" style={{ height: 100, marginBottom: 10 }} onChange={e => setForm({...form, description: e.target.value})} />
        <input placeholder="Download URL" value={form.download_link} className="search-input" style={{ marginBottom: 10 }} onChange={e => setForm({...form, download_link: e.target.value})} />
        <select className="search-input" value={form.category} style={{ marginBottom: 20 }} onChange={e => setForm({...form, category: e.target.value})}>
           {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <button className="btn-primary" style={{ width: "100%" }} onClick={save}>{editId ? "UPDATE" : "PUBLISH"}</button>
        <button onClick={onLogout} style={{ marginTop: 20, background: "none", border: "none", color: "red", cursor: "pointer", fontWeight: 700 }}>LOGOUT</button>
      </div>
      <div>
        <h3 style={{ fontFamily: "Syne", marginBottom: 20 }}>Manage Resources</h3>
        {resources.map(r => (
          <div key={r.id} className="glass" style={{ padding: "15px 20px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600 }}>{r.title}</span>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setForm(r); setEditId(r.id); }} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer" }}>Edit</button>
              <button onClick={async () => { if(confirm("Delete?")) { await db.delete(r.id, token); onUpdate(); } }} style={{ background: "none", border: "none", color: "red", cursor: "pointer" }}>Del</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
