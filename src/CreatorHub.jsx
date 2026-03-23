import { useState, useEffect } from "react";

const SUPABASE_URL = "https://umnytptisqdvesspzlqd.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....";
// ─── EMPTY FORM ─────────────────
const getEmpty = () => ({
  title: "",
  category: "video",
  description: "",
  tags: "",
  price: "Free",
  trending: false,
  premium: false,
  isNew: true,
  downloadLink: "",
  downloads: 0
});

export default function App() {
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState(getEmpty());
  const [loading, setLoading] = useState(false);

  // ─── FETCH DATA ─────────────────
  const fetchResources = async () => {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/resources?select=*`,
        {
          headers: {
            apikey: SUPABASE_ANON,
            Authorization: `Bearer ${SUPABASE_ANON}`
          }
        }
      );

      const data = await res.json();
      setResources(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // ─── ADD RESOURCE ─────────────────
  const save = async () => {
    if (!form.title || !form.description) {
      alert("Fill required fields");
      return;
    }

    const entry = {
      title: form.title,
      category: form.category,
      description: form.description,
      tags: form.tags
        ? form.tags.split(",").map(t => t.trim()).filter(Boolean)
        : [],
      price: form.price,
      trending: form.trending,
      premium: form.premium,
      isNew: form.isNew,
      downloadLink: form.downloadLink,
      downloads: 0
    };

    try {
      setLoading(true);

      const res = await fetch(`${SUPABASE_URL}/rest/v1/resources`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON
        },
        body: JSON.stringify(entry)
      });

      if (!res.ok) throw new Error("Insert failed");

      setForm(getEmpty());
      fetchResources();

    } catch (err) {
      console.error(err);
      alert("Error saving");
    } finally {
      setLoading(false);
    }
  };

  // ─── DELETE ─────────────────
  const del = async (id) => {
    if (!window.confirm("Delete?")) return;

    try {
      await fetch(`${SUPABASE_URL}/rest/v1/resources?id=eq.${id}`, {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_ANON
        }
      });

      setResources(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // ─── UI ─────────────────
  return (
    <div style={{ padding: 30, maxWidth: 800, margin: "auto" }}>
      <h1>CreatorHub Admin</h1>

      {/* FORM */}
      <div style={{ marginBottom: 30 }}>
        <input
          placeholder="Title"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />

        <br />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />

        <br />

        <input
          placeholder="Tags (comma separated)"
          value={form.tags}
          onChange={e => setForm({ ...form, tags: e.target.value })}
        />

        <br />

        <input
          placeholder="Download Link"
          value={form.downloadLink}
          onChange={e => setForm({ ...form, downloadLink: e.target.value })}
        />

        <br />

        <button onClick={save} disabled={loading}>
          {loading ? "Saving..." : "Add Resource"}
        </button>
      </div>

      {/* LIST */}
      <h2>Resources</h2>

      {resources.map(r => (
        <div key={r.id} style={{
          border: "1px solid #ccc",
          padding: 10,
          marginBottom: 10
        }}>
          <b>{r.title}</b>
          <p>{r.description}</p>
          <p>Tags: {r.tags?.join(", ")}</p>

          <button onClick={() => del(r.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
