import { useState, useEffect } from "react";

// ─── SUPABASE CONFIG ─────────────────────────────
const SUPABASE_URL = "https://umnytptisqdvesspzlqd.supabase.co";
const SUPABASE_KEY = "YOUR_ANON_KEY";

// ─── API ─────────────────────────────
async function fetchResources() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/resources?select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  return res.json();
}

async function addResource(data) {
  await fetch(`${SUPABASE_URL}/rest/v1/resources`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(data),
  });
}

// ─── UI ─────────────────────────────
const styles = {
  bg: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top,#1a1a2e,#0f0f14)",
    color: "#fff",
    fontFamily: "sans-serif",
  },
  glass: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(14px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "18px",
  },
};

// ─── NAVBAR ─────────────────────────────
function Navbar({ setPage }) {
  return (
    <div style={{
      ...styles.glass,
      padding: "14px 24px",
      margin: 20,
      display: "flex",
      justifyContent: "space-between"
    }}>
      <b>🔥 CreatorHub</b>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setPage("home")}>Home</button>
        <button onClick={() => setPage("browse")}>Browse</button>
        <button onClick={() => setPage("admin")}>Admin</button>
      </div>
    </div>
  );
}

// ─── HERO ─────────────────────────────
function Hero({ setPage }) {
  return (
    <div style={{ textAlign: "center", padding: 80 }}>
      <h1 style={{
        fontSize: "3rem",
        background: "linear-gradient(90deg,#ff6b35,#ffd200)",
        WebkitBackgroundClip: "text",
        color: "transparent"
      }}>
        Free Editing Assets 🚀
      </h1>

      <p style={{ opacity: 0.7 }}>
        10GB+ packs for creators — totally free
      </p>

      <button
        onClick={() => setPage("browse")}
        style={{
          marginTop: 20,
          padding: "14px 30px",
          borderRadius: 12,
          border: "none",
          background: "linear-gradient(135deg,#ff6b35,#ffd200)",
          color: "#000",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Explore Now →
      </button>
    </div>
  );
}

// ─── CARD ─────────────────────────────
function Card({ r }) {
  return (
    <div style={{
      ...styles.glass,
      padding: 18,
      transition: "0.3s",
    }}>
      <h3>{r.title}</h3>
      <p style={{ opacity: 0.7 }}>{r.description}</p>

      <div style={{ marginTop: 10 }}>
        ⬇ {r.downloads}
      </div>

      {r.trending && <div>🔥 Trending</div>}
      {r.premium && <div>⭐ Premium</div>}
    </div>
  );
}

// ─── HOME ─────────────────────────────
function Home({ setPage, resources }) {
  return (
    <div>
      <Hero setPage={setPage} />

      <div style={{ padding: 20 }}>
        <h2>🔥 Trending</h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
          gap: 20
        }}>
          {resources.filter(r => r.trending).map(r => (
            <Card key={r.id} r={r} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── BROWSE ─────────────────────────────
function Browse({ resources }) {
  return (
    <div style={{ padding: 20 }}>
      <h2>All Resources</h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
        gap: 20
      }}>
        {resources.map(r => <Card key={r.id} r={r} />)}
      </div>
    </div>
  );
}

// ─── ADMIN ─────────────────────────────
function Admin({ setRefresh }) {
  const [title, setTitle] = useState("");

  const submit = async () => {
    await addResource({
      title,
      description: "New resource",
      category: "video",
      tags: [],
      price: "Free",
      downloads: 0,
    });

    setTitle("");
    setRefresh(prev => !prev);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Panel</h2>

      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title"
      />

      <button onClick={submit}>Add to DB</button>
    </div>
  );
}

// ─── APP ─────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [resources, setResources] = useState([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    fetchResources().then(setResources);
  }, [refresh]);

  return (
    <div style={styles.bg}>
      <Navbar setPage={setPage} />

      {page === "home" && <Home setPage={setPage} resources={resources} />}
      {page === "browse" && <Browse resources={resources} />}
      {page === "admin" && <Admin setRefresh={setRefresh} />}
    </div>
  );
}
