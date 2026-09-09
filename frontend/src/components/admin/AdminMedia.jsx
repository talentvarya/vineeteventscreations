import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trash2, Plus, Pencil, Film, ImageIcon, Loader2, ArrowUp, ArrowDown, X } from "lucide-react";
import { api, mediaSrc } from "@/lib/api";
import { Uploader } from "@/components/Uploader";

const CATEGORIES = [
  { id: "weddings", label: "Weddings" },
  { id: "indian", label: "Indian Artists" },
  { id: "international", label: "International" },
  { id: "mascots", label: "Mascots" },
  { id: "pyro", label: "Special FX" },
  { id: "soundlight", label: "Sound & Light" },
];

const emptyForm = { title: "", category: "weddings", is_reel: false, storage_path: null, kind: "image", url: null };

export const AdminMedia = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null); // media id being edited, or null

  const load = () => {
    setLoading(true);
    api.get("/media").then((res) => setItems(res.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const save = async () => {
    if (!form.storage_path) {
      toast.error("Please upload a file first");
      return;
    }
    setSaving(true);
    try {
      await api.post("/admin/media", {
        title: form.title || "Untitled",
        category: form.category,
        kind: form.kind,
        is_reel: form.is_reel,
        storage_path: form.storage_path,
      });
      toast.success("Media added");
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not add media");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (m) => {
    setForm({ title: m.title || "", category: m.category, is_reel: !!m.is_reel, storage_path: null, kind: m.kind, url: m.url });
    setEditing(m.id);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const payload = { title: form.title || "Untitled", category: form.category, is_reel: form.is_reel };
      if (form.storage_path) payload.storage_path = form.storage_path;
      await api.patch(`/admin/media/${editing}`, payload);
      toast.success("Media updated");
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Remove this media?")) return;
    const prev = items;
    setItems((l) => l.filter((i) => i.id !== id));
    try {
      await api.delete(`/admin/media/${id}`);
      toast.success("Media removed");
    } catch {
      setItems(prev);
      toast.error("Delete failed");
    }
  };

  const move = async (idx, dir) => {
    const current = items[idx];
    const target = items[idx + dir];
    if (!current || !target) return;
    const reordered = [...items];
    reordered[idx] = target;
    reordered[idx + dir] = current;
    setItems(reordered);
    try {
      await Promise.all([
        api.patch(`/admin/media/${current.id}`, { sort_order: target.sort_order ?? (idx + dir) }),
        api.patch(`/admin/media/${target.id}`, { sort_order: current.sort_order ?? idx }),
      ]);
      load();
    } catch {
      toast.error("Reorder failed");
      load();
    }
  };

  const fieldCls = "w-full bg-[#1e0f18] border border-yellow-500/20 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-yellow-500/60";

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="glass-card rounded-2xl p-5 border border-yellow-500/15 h-fit">
        <h3 className="font-display font-bold text-yellow-400 mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Media</h3>
        <Uploader
          testId="media-uploader"
          preview={form.url}
          onUploaded={(d) => setForm((f) => ({ ...f, storage_path: d.storage_path, kind: d.kind, url: d.url }))}
        />
        <div className="space-y-3 mt-4">
          <input data-testid="media-title-input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Title / Caption" className={fieldCls} />
          <select data-testid="media-category-select" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className={fieldCls}>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input data-testid="media-reel-checkbox" type="checkbox" checked={form.is_reel} onChange={(e) => setForm((f) => ({ ...f, is_reel: e.target.checked }))} className="accent-yellow-500 w-4 h-4" />
            Show in Instagram feed (reel)
          </label>
          <button data-testid="media-save-button" onClick={save} disabled={saving} className="w-full btn-glow bg-gradient-to-r from-yellow-500 to-amber-600 text-[#0A0508] font-bold py-2.5 rounded-full disabled:opacity-60">
            {saving ? "Saving..." : "Add to Gallery"}
          </button>
        </div>
      </div>

      <div className="lg:col-span-2">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-yellow-500 animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {items.map((m, idx) => (
              <div key={m.id} data-testid={`media-item-${m.id}`} className="group relative aspect-square rounded-xl overflow-hidden border border-yellow-500/15">
                {m.kind === "video" ? (
                  <video src={mediaSrc(m.url)} muted className="w-full h-full object-cover" />
                ) : (
                  <img src={mediaSrc(m.url)} alt={m.title} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-end gap-1">
                    <button data-testid={`media-up-${m.id}`} onClick={() => move(idx, -1)} disabled={idx === 0} className="w-8 h-8 rounded-full bg-black/70 flex items-center justify-center text-yellow-300 disabled:opacity-30">
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button data-testid={`media-down-${m.id}`} onClick={() => move(idx, 1)} disabled={idx === items.length - 1} className="w-8 h-8 rounded-full bg-black/70 flex items-center justify-center text-yellow-300 disabled:opacity-30">
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button data-testid={`media-edit-${m.id}`} onClick={() => openEdit(m)} className="w-8 h-8 rounded-full bg-black/70 flex items-center justify-center text-yellow-300">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button data-testid={`media-delete-${m.id}`} onClick={() => remove(m.id)} className="w-8 h-8 rounded-full bg-red-500/80 flex items-center justify-center text-white">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-white font-semibold">#{idx + 1} · {m.title}</div>
                </div>
                <div className="absolute top-2 left-2 flex gap-1 pointer-events-none">
                  <span className="text-[10px] bg-black/60 text-yellow-300 px-1.5 py-0.5 rounded">{m.category}</span>
                  {m.is_reel && <span className="text-[10px] bg-fuchsia-600/80 text-white px-1.5 py-0.5 rounded flex items-center gap-0.5"><Film className="w-3 h-3" /> reel</span>}
                </div>
              </div>
            ))}
            {items.length === 0 && <div className="col-span-3 text-center text-slate-400 py-16 flex flex-col items-center gap-2"><ImageIcon className="w-10 h-10 text-yellow-500/40" /> No media yet. Upload above.</div>}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => { setEditing(null); setForm(emptyForm); }}>
          <div className="relative w-full max-w-md glass-card rounded-2xl p-6 gold-border-glow max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setEditing(null); setForm(emptyForm); }} className="absolute top-4 right-4 text-slate-400 hover:text-yellow-400"><X className="w-6 h-6" /></button>
            <h3 className="font-display text-xl font-bold gold-gradient-text mb-4">Edit Media</h3>
            <Uploader testId="media-edit-uploader" preview={form.url} label="Replace File (optional)" onUploaded={(d) => setForm((f) => ({ ...f, storage_path: d.storage_path, kind: d.kind, url: d.url }))} />
            <div className="space-y-3 mt-4">
              <input data-testid="media-edit-title-input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Title / Caption" className={fieldCls} />
              <select data-testid="media-edit-category-select" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className={fieldCls}>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input data-testid="media-edit-reel-checkbox" type="checkbox" checked={form.is_reel} onChange={(e) => setForm((f) => ({ ...f, is_reel: e.target.checked }))} className="accent-yellow-500 w-4 h-4" />
                Show in Instagram feed (reel)
              </label>
              <button data-testid="media-edit-save-button" onClick={saveEdit} disabled={saving} className="w-full btn-glow bg-gradient-to-r from-yellow-500 to-amber-600 text-[#0A0508] font-bold py-2.5 rounded-full disabled:opacity-60">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
