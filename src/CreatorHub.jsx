import { useState, useEffect, useMemo } from "react";

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
      headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON, Authorization: `Bearer ${token}`, Prefer: "return=minimal" },
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

// ─── UI COMPONENTS ───────────────────────────────────────────────────────────
const formatNum = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n;

function Thumb({ resource, size = "full" }) {
  const cat = CATEGORIES.find((c) => c.id === resource.category) || CATEGORIES[0];
  return (
    <div style={{ width: "100%", paddingBottom: size === "full" ? "56.25%" : "60%", position: "relative", borderRadius: "12px", overflow: "hidden", background: `linear-gradient(135deg, ${cat.color}22 0%, ${cat.color}08 100%)`, border: `1px solid ${cat.color}33` }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "8px" }}>
        <span style={{ fontSize: size === "full" ? "3.5rem" : "2.5rem" }}>{cat.icon}</span>
        <span style={{ fontSize: "0.6rem", fontWeight: 700, color: cat.color, textTransform: "uppercase" }}>{resource.category}</span>
      </div>
    </div>
  );
}

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
    }
    body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; transition: 0.4s; }
    .glass { background: var(--surface); backdrop-filter: blur(20px); border: 1px solid var(--border); border-radius: 14px; }
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .btn-primary { background: linear-gradient(135deg, #ff6b35, #ff4500); color: #fff; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; cursor: pointer; }
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
      
      {/* Navbar */}
      <nav style={{ position: "fixed", top: 0, width: "100%", zHeight: 100, padding: "15px 24px", background: "var(--bg)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 100 }}>
        <h2 onClick={() => setPage("home")} style={{ cursor: "pointer", fontFamily: "Syne" }}>Creator<span style={{ color: "var(--accent)" }}>Hub</span></h2>
        <div style={{ display: "flex", gap: 20 }}>
          <button onClick={() => setPage("browse")} style={{ background: "none", border: "none", color: "var(--text)", cursor: "pointer", fontWeight: 600 }}>Browse</button>
          <button onClick={() => setDark(!dark)} style={{ background: "none", border: "none", cursor: "pointer" }}>{dark ? "☀️" : "🌙"}</button>
        </div>
      </nav>

      <div style={{ paddingTop: 100, paddingBottom: 100, minHeight: "80vh" }}>
        
        {page === "home" && (
          <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center", padding: "0 20px" }}>
            <h1 style={{ fontSize: "3.5rem", fontFamily: "Syne", marginBottom: 20 }}>Free Resources for Creators</h1>
            <p style={{ color: "var(--muted)", marginBottom: 40 }}>Download video packs, study notes, and templates instantly.</p>
            <button className="btn-primary" onClick={() => setPage("browse")}>Start Browsing →</button>
          </div>
        )}

        {page === "browse" && (
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
            <div style={{ marginBottom: 40, display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
              <input 
                placeholder="Search resources..." 
                style={{ width: "100%", maxWidth: 500, padding: 12, borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)" }}
                onChange={e => setSearch(e.target.value)}
              />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => setCatFilter("all")} style={{ padding: "8px 16px", borderRadius: 20, border: "1px solid var(--border)", background: catFilter === "all" ? "var(--accent)" : "none" }}>All</button>
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => setCatFilter(c.id)} style={{ padding: "8px 16px", borderRadius: 20, border: "1px solid var(--border)", background: catFilter === c.id ? "var(--accent)" : "none" }}>{c.icon} {c.label}</button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <p style={{ textAlign: "center", color: "var(--muted)" }}>No resources found. Try adding some in Admin!</p>
            ) : (
              <div className="grid-3">
                {filtered.map(r => (
                  <div key={r.id} className="glass" style={{ cursor: "pointer", overflow: "hidden" }} onClick={() => { setDetailRes(r); setPage("detail"); }}>
                    <Thumb resource={r} size="card" />
                    <div style={{ padding: 15 }}>
                      <h3 style={{ fontSize: "1rem" }}>{r.title}</h3>
                      <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{r.price} • ⬇️ {formatNum(r.downloads || 0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {page === "detail" && detailRes && (
          <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
            <button onClick={() => setPage("browse")} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", marginBottom: 20 }}>← Back to Browse</button>
            <Thumb resource={detailRes} />
            <h1 style={{ marginTop: 20, fontFamily: "Syne" }}>{detailRes.title}</h1>
            <p style={{ margin: "20px 0", lineHeight: 1.6 }}>{detailRes.description}</p>
            <a href={detailRes.download_link} className="btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>Download Now</a>
          </div>
        )}

        {page === "admin" && (
          <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
            {!session ? (
              <AdminLogin onLogin={(s) => { setSession(s); localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }} />
            ) : (
              <AdminPanel 
                resources={resources} 
                token={session.access_token} 
                onUpdate={refresh} 
                onLogout={() => { setSession(null); localStorage.removeItem(SESSION_KEY); }} 
              />
            )}
          </div>
        )}

      </div>

      <footer style={{ padding: 40, textAlign: "center", borderTop: "1px solid var(--border)" }}>
        <p style={{ opacity: 0.5 }}>© 2026 CreatorHub</p>
        <button onClick={() => setPage("admin")} style={{ opacity: 0, cursor: "default" }}>admin</button>
      </footer>
    </>
  );
}

// ─── ADMIN PANEL COMPONENTS ──────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const handle = async () => {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST", headers: { apikey: SUPABASE_ANON, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass })
    });
    const d = await r.json();
    if (r.ok) onLogin(d); else alert("Login Failed");
  };
  return (
    <div className="glass" style={{ maxWidth: 400, margin: "0 auto", padding: 30 }}>
      <h3>Admin Login</h3>
      <input placeholder="Email" style={{ width: "100%", padding: 10, margin: "10px 0" }} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" style={{ width: "100%", padding: 10, margin: "10px 0" }} onChange={e => setPass(e.target.value)} />
      <button className="btn-primary" style={{ width: "100%" }} onClick={handle}>Login</button>
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
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
      <div className="glass" style={{ padding: 20 }}>
        <h3>{editId ? "Edit" : "Add"} Resource</h3>
        <input placeholder="Title" value={form.title} style={{ width: "100%", padding: 8, margin: "10px 0" }} onChange={e => setForm({...form, title: e.target.value})} />
        <textarea placeholder="Description" value={form.description} style={{ width: "100%", padding: 8, margin: "10px 0" }} onChange={e => setForm({...form, description: e.target.value})} />
        <input placeholder="Download URL" value={form.download_link} style={{ width: "100%", padding: 8, margin: "10px 0" }} onChange={e => setForm({...form, download_link: e.target.value})} />
        <button className="btn-primary" onClick={save}>{editId ? "Update" : "Add Resource"}</button>
        <button onClick={onLogout} style={{ display: "block", marginTop: 20, color: "red", background: "none", border: "none", cursor: "pointer" }}>Logout</button>
      </div>
      <div>
        {resources.map(r => (
          <div key={r.id} className="glass" style={{ padding: 10, marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
            <span>{r.title}</span>
            <div>
              <button onClick={() => { setForm(r); setEditId(r.id); }}>Edit</button>
              <button onClick={async () => { if(confirm("Del?")) { await db.delete(r.id, token); onUpdate(); } }} style={{ color: "red", marginLeft: 10 }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
    });
    return r.ok ? r.json() : null;
  },
};

// ─── API HANDLERS ───────────────────────────────────────────────────────────
const db = {
  async getAll() {
    const r = await fetch(`${REST}?select=*&order=created_at.desc`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` }
    });
    return r.json();
  },
  async upsert(data, token, id = null) {
    const method = id ? "PATCH" : "POST";
    const url = id ? `${REST}?id=eq.${id}` : REST;
    const r = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${token}`,
        Prefer: "return=representation"
      },
      body: JSON.stringify(data)
    });
    return r.json();
  },
  async delete(id, token) {
    await fetch(`${REST}?id=eq.${id}`, {
      method: "DELETE",
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` }
    });
  }
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const formatNum = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n;

// ─── UI COMPONENTS (THUMB, STYLES) ───────────────────────────────────────────
function Thumb({ resource, size = "full" }) {
  const catColor = CATEGORIES.find((c) => c.id === resource.category)?.color || "#ff6b35";
  const catIcon  = CATEGORIES.find((c) => c.id === resource.category)?.icon  || "📦";
  return (
    <div style={{
      width: "100%", paddingBottom: size === "full" ? "56.25%" : "60%",
      position: "relative", borderRadius: "12px", overflow: "hidden",
      background: `linear-gradient(135deg, ${catColor}22 0%, ${catColor}08 100%)`,
      border: `1px solid ${catColor}33`,
    }}>
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "8px",
      }}>
        <span style={{ fontSize: size === "full" ? "3.5rem" : "2.5rem" }}>{catIcon}</span>
        <span style={{
          fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em",
          color: catColor, textTransform: "uppercase", opacity: 0.8,
        }}>{resource.category}</span>
      </div>
      {(resource.premium) && (
        <span style={{
          position: "absolute", top: "10px", right: "10px",
          background: "linear-gradient(135deg,#f7971e,#ffd200)",
          color: "#000", fontSize: "0.6rem", fontWeight: 800,
          padding: "3px 8px", borderRadius: "20px", letterSpacing: "0.1em",
        }}>PREMIUM</span>
      )}
    </div>
  );
}

const GlobalStyle = ({ dark }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: ${dark ? "#0a0a0f" : "#f4f3ee"};
      --bg2: ${dark ? "#111118" : "#ede8df"};
      --text: ${dark ? "#f0ede8" : "#1a1814"};
      --muted: ${dark ? "#7a7a8a" : "#7a7670"};
      --accent: #ff6b35;
      --border: ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"};
      --surface: ${dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.72)"};
      --surface2: ${dark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.9)"};
      --radius: 14px;
    }
    body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; transition: 0.4s; overflow-x: hidden; }
    .glass { background: var(--surface); backdrop-filter: blur(20px); border: 1px solid var(--border); border-radius: var(--radius); }
    .gradient-text { background: linear-gradient(135deg, #ff6b35, #ffd200); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .btn-primary { background: linear-gradient(135deg, #ff6b35, #ff4500); color: #fff; border: none; border-radius: 10px; padding: 12px 24px; font-family: 'Syne', sans-serif; font-weight: 700; cursor: pointer; }
    .btn-download { background: linear-gradient(135deg,#11998e,#38ef7d); color: #000; border: none; border-radius: 10px; padding: 10px 20px; font-family: 'Syne', sans-serif; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px; }
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .tag { background: var(--surface2); border: 1px solid var(--border); border-radius: 20px; padding: 3px 10px; font-size: 0.7rem; color: var(--muted); }
  `}</style>
);

// ─── PAGE COMPONENTS ─────────────────────────────────────────────────────────

function Navbar({ dark, toggleDark, page, setPage }) {
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, padding: "10px 24px", background: "var(--bg)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <button onClick={() => setPage("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: "8px", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>C</div>
        <span style={{ fontFamily: "Syne", fontWeight: 800 }}>Creator<span className="gradient-text">Hub</span></span>
      </button>
      <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
        <button onClick={() => setPage("browse")} style={{ background: "none", border: "none", color: "var(--text)", cursor: "pointer", fontWeight: 600 }}>Browse</button>
        <button onClick={toggleDark} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "5px 10px", cursor: "pointer" }}>{dark ? "☀️" : "🌙"}</button>
      </div>
    </nav>
  );
}

function ResourceCard({ resource, onClick }) {
  return (
    <div className="glass" onClick={() => onClick(resource)} style={{ cursor: "pointer", overflow: "hidden" }}>
      <Thumb resource={resource} size="card" />
      <div style={{ padding: 15 }}>
        <h3 style={{ fontSize: "1rem", marginBottom: 5 }}>{resource.title}</h3>
        <p style={{ fontSize: "0.8rem", color: "var(--muted)", height: "40px", overflow: "hidden" }}>{resource.description}</p>
        <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.7rem", color: "var(--accent)" }}>{resource.price}</span>
          <span style={{ fontSize: "0.7rem" }}>⬇️ {formatNum(resource.downloads || 0)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(true);
  const [page, setPage] = useState("home");
  const [resources, setResources] = useState([]);
  const [detailResource, setDetailRes] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load Data
  const refreshData = async () => {
    const data = await db.getAll();
    setResources(data);
  };

  useEffect(() => {
    refreshData().then(() => setLoading(false));
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) setSession(JSON.parse(saved));
  }, []);

  const handleAdminAction = async () => {
    await refreshData();
  };

  return (
    <>
      <GlobalStyle dark={dark} />
      <Navbar dark={dark} toggleDark={() => setDark(!dark)} page={page} setPage={setPage} />
      
      <div style={{ paddingTop: 80, minHeight: "100vh" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 100 }}>Loading Resources...</div>
        ) : (
          <>
            {page === "home" && (
              <main style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
                <h1 style={{ fontSize: "3rem", textAlign: "center", marginBottom: 40, fontFamily: "Syne" }}>
                  Free Resources for <span className="gradient-text">Creators</span>
                </h1>
                <div className="grid-3">
                  {resources.slice(0, 6).map(r => (
                    <ResourceCard key={r.id} resource={r} onClick={(res) => { setDetailRes(res); setPage("detail"); }} />
                  ))}
                </div>
              </main>
            )}

            {page === "browse" && (
              <main style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
                <div className="grid-3">
                  {resources.map(r => (
                    <ResourceCard key={r.id} resource={r} onClick={(res) => { setDetailRes(res); setPage("detail"); }} />
                  ))}
                </div>
              </main>
            )}

            {page === "detail" && (
               <main style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
                 <button onClick={() => setPage("browse")} style={{ marginBottom: 20, background: "none", border: "1px solid var(--border)", color: "var(--text)", padding: "5px 10px", borderRadius: 5 }}>← Back</button>
                 <Thumb resource={detailResource} />
                 <h1 style={{ marginTop: 20 }}>{detailResource.title}</h1>
                 <p style={{ color: "var(--muted)", margin: "20px 0" }}>{detailResource.description}</p>
                 <a href={detailResource.download_link} className="btn-download" style={{ textDecoration: "none", width: "fit-content" }}>Download Now</a>
               </main>
            )}

            {page === "admin" && (
              <AdminGate session={session} setSession={setSession}>
                <AdminPage 
                  resources={resources} 
                  onUpdate={handleAdminAction} 
                  session={session} 
                  setPage={setPage}
                />
              </AdminGate>
            )}
          </>
        )}
      </div>

      <footer style={{ textAlign: "center", padding: 40, borderTop: "1px solid var(--border)", marginTop: 40 }}>
        <p style={{ opacity: 0.5 }}>© 2026 CreatorHub</p>
        <button onClick={() => setPage("admin")} style={{ opacity: 0, cursor: "default" }}>admin</button>
      </footer>
    </>
  );
}

// ─── ADMIN COMPONENTS ────────────────────────────────────────────────────────

function AdminGate({ children, session, setSession }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const data = await sbAuth.signIn(email, password);
      localStorage.setItem(SESSION_KEY, JSON.stringify(data));
      setSession(data);
    } catch (e) { alert(e.message); }
  };

  if (session) return children;

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", padding: 40 }} className="glass">
      <h2>Admin Login</h2>
      <input type="email" placeholder="Email" style={{ width: "100%", padding: 10, margin: "10px 0" }} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" style={{ width: "100%", padding: 10, margin: "10px 0" }} onChange={e => setPassword(e.target.value)} />
      <button className="btn-primary" style={{ width: "100%" }} onClick={login}>Sign In</button>
    </div>
  );
}

function AdminPage({ resources, onUpdate, session, setPage }) {
  const [form, setForm] = useState({ title: "", description: "", category: "video", price: "Free", download_link: "", tags: [] });
  const [editingId, setEditingId] = useState(null);

  const save = async () => {
    const data = { ...form, tags: Array.isArray(form.tags) ? form.tags : form.tags.split(",").map(t => t.trim()) };
    await db.upsert(data, session.access_token, editingId);
    setForm({ title: "", description: "", category: "video", price: "Free", download_link: "", tags: [] });
    setEditingId(null);
    onUpdate();
  };

  const remove = async (id) => {
    if (confirm("Delete?")) {
      await db.delete(id, session.access_token);
      onUpdate();
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
      <div className="glass" style={{ padding: 20, height: "fit-content" }}>
        <h3>{editingId ? "Edit" : "Add New"} Resource</h3>
        <input placeholder="Title" value={form.title} style={{ width: "100%", margin: "10px 0", padding: 8 }} onChange={e => setForm({ ...form, title: e.target.value })} />
        <textarea placeholder="Description" value={form.description} style={{ width: "100%", margin: "10px 0", padding: 8 }} onChange={e => setForm({ ...form, description: e.target.value })} />
        <input placeholder="Download URL" value={form.download_link} style={{ width: "100%", margin: "10px 0", padding: 8 }} onChange={e => setForm({ ...form, download_link: e.target.value })} />
        <button className="btn-primary" onClick={save}>{editingId ? "Update" : "Create"}</button>
      </div>
      <div>
        {resources.map(r => (
          <div key={r.id} className="glass" style={{ padding: 15, marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
            <span>{r.title}</span>
            <div>
              <button onClick={() => { setForm(r); setEditingId(r.id); }}>Edit</button>
              <button onClick={() => remove(r.id)} style={{ color: "red", marginLeft: 10 }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
