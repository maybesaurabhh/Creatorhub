import { useState, useEffect } from "react";

// ================= CONFIG =================
const SUPABASE_URL = "https://umnytptisqdvesspzlqd.supabase.co";
const SUPABASE_KEY = "YOUR_ANON_KEY_HERE";

// ================= FALLBACK DATA =================
const initialResources = [
  {
    id: 1,
    title: "Cinematic LUT Pack",
    category: "video",
    description: "Pro LUTs",
    tags: ["LUT", "Color"],
    price: "Free",
    trending: true,
    premium: false,
    isNew: true,
    downloadLink: "#",
    downloads: 1200,
  },
];

// ================= FETCH =================
async function fetchResources() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/resources`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });

  if (!res.ok) throw new Error("Supabase fetch failed");

  const data = await res.json();

  return data.map((r) => ({
    ...r,
    tags: typeof r.tags === "string"
      ? r.tags.split(",").map((t) => t.trim())
      : [],
  }));
}

// ================= APP =================
export default function App() {
  const [resources, setResources] = useState(initialResources);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchResources();
        if (data.length > 0) setResources(data);
      } catch (err) {
        console.log("Supabase error → using fallback");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div style={{ padding: 40, color: "white", background: "#0f0f1a" }}>
      <h1>🔥 CreatorHub</h1>

      {loading && <p>Loading...</p>}

      <div style={{ marginTop: 20 }}>
        {resources.map((r) => (
          <div
            key={r.id}
            style={{
              border: "1px solid #333",
              padding: 16,
              marginBottom: 12,
              borderRadius: 10,
            }}
          >
            <h3>{r.title}</h3>
            <p>{r.description}</p>
            <p>⬇️ {r.downloads}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
