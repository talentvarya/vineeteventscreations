import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trash2, Plus, Pencil, Loader2, X } from "lucide-react";
import { api, mediaSrc } from "@/lib/api";
import { Uploader } from "@/components/Uploader";

const CATEGORIES = ["Bollywood", "Bhangra", "Russian / International", "Live Band", "DJ", "Mascot", "Celebrity"];
const CAT_TO_MEDIA = { Bollywood: "indian", Bhangra: "indian", "Russian / International": "international", "Live Band": "soundlight", DJ: "soundlight", Mascot: "mascots", Celebrity: "indian" };

const emptyForm = { name: "", category: "Bollywood", availability: "Available", bio: "", storage_path: null, image_url: null, url: null };

export const AdminArtists = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // artist id or "new"
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/artists").then((res) => setItems(res.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openNew = () => { setForm(emptyForm); setEditing("new"); };
  const openEdit = (a) => {
    setForm({ name: a.name, category: a.category, availability: a.availability, bio: a.bio, storage_path: a.storage_path, image_url: a.image_url, url: a.url });
    setEditing(a.id);
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error("Enter artist name"); return; }
    if (editing === "new" && !form.storage_path && !form.image_url) { toast.error("Upload a photo"); return; }
    setSaving(true);
    const payload = { name: form.name, category: form.category, availability: form.availability, bio: form.bio };
    if (form.storage_path) payload.storage_path = form.storage_path;
    try {
      if (editing === "new") await api.post("/admin/artists", payload);
      else await api.patch(`/admin/artists/${editing}`, payload);
      toast.success(editing === "new" ? "Artist added" : "Artist updated");
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Remove this artist?")) return;
    const prev = items;
    setItems((l) => l.filter((i) => i.id !== id));
    try { await api.delete(`/admin/artists/${id}`); toast.success("Artist removed"); }
    catch { setItems(prev); toast.error("Delete failed"); }
  };

  const fieldCls = "w-full bg-[#1e0f18] border border-yellow-500/20 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-yellow-500/60";

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-display text-xl font-bold text-yellow-400">Artist Roster ({items.length})</h3>
        <button data-testid="artist-add-button" onClick={openNew} className="btn-glow bg-gradient-to-r from-yellow-500 to-amber-600 text-[#0A0508] font-bold px-5 py-2.5 rounded-full flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Artist
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-yellow-500 animate-spin" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((a) => (
            <div key={a.id} data-testid={`admin-artist-${a.id}`} className="glass-card rounded-2xl overflow-hidden border border-yellow-500/15">
              <div className="relative aspect-[3/4]">
                <img src={mediaSrc(a.url)} alt={a.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#140A10] to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-3">
                  <div className="font-display font-bold text-yellow-300">{a.name}</div>
                  <div className="text-xs text-slate-300">{a.category} • {a.availability}</div>
                </div>
              </div>
              <div className="p-3 flex gap-2">
                <button data-testid={`artist-edit-${a.id}`} onClick={() => openEdit(a)} className="flex-1 text-xs font-semibold py-2 rounded-lg bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 flex items-center justify-center gap-1"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                <button data-testid={`artist-delete-${a.id}`} onClick={() => remove(a.id)} className="text-xs font-semibold py-2 px-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div className="relative w-full max-w-md glass-card rounded-2xl p-6 gold-border-glow max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setEditing(null)} className="absolute top-4 right-4 text-slate-400 hover:text-yellow-400"><X className="w-6 h-6" /></button>
            <h3 className="font-display text-xl font-bold gold-gradient-text mb-4">{editing === "new" ? "Add Artist" : "Edit Artist"}</h3>
            <Uploader testId="artist-uploader" preview={form.url} label="Upload Artist Photo" onUploaded={(d) => setForm((f) => ({ ...f, storage_path: d.storage_path, url: d.url }))} />
            <div className="space-y-3 mt-4">
              <input data-testid="artist-name-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Artist / Group Name" className={fieldCls} />
              <select data-testid="artist-category-select" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className={fieldCls}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input data-testid="artist-availability-input" value={form.availability} onChange={(e) => setForm((f) => ({ ...f, availability: e.target.value }))} placeholder="Availability (e.g. Available on weekends)" className={fieldCls} />
              <textarea data-testid="artist-bio-input" value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} placeholder="Short bio" rows={3} className={fieldCls} />
              <button data-testid="artist-save-button" onClick={save} disabled={saving} className="w-full btn-glow bg-gradient-to-r from-yellow-500 to-amber-600 text-[#0A0508] font-bold py-2.5 rounded-full disabled:opacity-60">
                {saving ? "Saving..." : "Save Artist"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
