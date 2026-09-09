import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trash2, Plus, Pencil, Star, Loader2, Quote, PlayCircle, X } from "lucide-react";
import { api, mediaSrc } from "@/lib/api";
import { Uploader } from "@/components/Uploader";

const emptyForm = { name: "", role: "", rating: 5, text: "", kind: "text", storage_path: null, url: null };

export const AdminTestimonials = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null); // testimonial id being edited, or null

  const load = () => {
    setLoading(true);
    api.get("/testimonials").then((res) => setItems(res.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const save = async () => {
    if (!form.name.trim() || !form.text.trim()) {
      toast.error("Enter client name and review text");
      return;
    }
    setSaving(true);
    const payload = { name: form.name, role: form.role, rating: form.rating, text: form.text, kind: form.storage_path ? "video" : "text" };
    if (form.storage_path) payload.storage_path = form.storage_path;
    try {
      await api.post("/admin/testimonials", payload);
      toast.success("Testimonial added");
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not add");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (t) => {
    setForm({ name: t.name, role: t.role || "", rating: t.rating || 5, text: t.text || "", kind: t.kind, storage_path: null, url: t.url });
    setEditing(t.id);
  };

  const saveEdit = async () => {
    if (!form.name.trim() || !form.text.trim()) {
      toast.error("Enter client name and review text");
      return;
    }
    setSaving(true);
    const payload = { name: form.name, role: form.role, rating: form.rating, text: form.text };
    if (form.storage_path) payload.storage_path = form.storage_path;
    try {
      await api.patch(`/admin/testimonials/${editing}`, payload);
      toast.success("Testimonial updated");
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
    if (!window.confirm("Remove this testimonial?")) return;
    const prev = items;
    setItems((l) => l.filter((i) => i.id !== id));
    try { await api.delete(`/admin/testimonials/${id}`); toast.success("Removed"); }
    catch { setItems(prev); toast.error("Delete failed"); }
  };

  const fieldCls = "w-full bg-[#1e0f18] border border-yellow-500/20 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-yellow-500/60";

  const RatingPicker = ({ value, onChange, testPrefix }) => (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-400">Rating:</span>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} data-testid={`${testPrefix}-${n}`} onClick={() => onChange(n)} type="button">
          <Star className={`w-5 h-5 ${n <= value ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}`} />
        </button>
      ))}
    </div>
  );

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="glass-card rounded-2xl p-5 border border-yellow-500/15 h-fit">
        <h3 className="font-display font-bold text-yellow-400 mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Review</h3>
        <div className="space-y-3">
          <input data-testid="testimonial-name-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Client Name" className={fieldCls} />
          <input data-testid="testimonial-role-input" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} placeholder="Event & City (e.g. Wedding, Dehradun)" className={fieldCls} />
          <RatingPicker value={form.rating} onChange={(n) => setForm((f) => ({ ...f, rating: n }))} testPrefix="testimonial-rating" />
          <textarea data-testid="testimonial-text-input" value={form.text} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))} placeholder="Review text..." rows={4} className={fieldCls} />
          <div>
            <p className="text-xs text-slate-400 mb-2">Optional: upload a video testimonial</p>
            <Uploader testId="testimonial-uploader" preview={form.kind === "video" ? null : null} label="Upload Video (optional)" onUploaded={(d) => setForm((f) => ({ ...f, storage_path: d.storage_path, url: d.url, kind: "video" }))} />
            {form.storage_path && <p className="text-xs text-green-400 mt-2">Video attached ✓</p>}
          </div>
          <button data-testid="testimonial-save-button" onClick={save} disabled={saving} className="w-full btn-glow bg-gradient-to-r from-yellow-500 to-amber-600 text-[#0A0508] font-bold py-2.5 rounded-full disabled:opacity-60">
            {saving ? "Saving..." : "Add Testimonial"}
          </button>
        </div>
      </div>

      <div className="lg:col-span-2">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-yellow-500 animate-spin" /></div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {items.map((t) => (
              <div key={t.id} data-testid={`admin-testimonial-${t.id}`} className="glass-card rounded-2xl p-5 border border-yellow-500/15 relative">
                <div className="absolute top-3 right-3 flex gap-2">
                  <button data-testid={`testimonial-edit-${t.id}`} onClick={() => openEdit(t)} className="text-yellow-300/80 hover:text-yellow-300">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button data-testid={`testimonial-delete-${t.id}`} onClick={() => remove(t.id)} className="text-red-400/70 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {t.kind === "video" && t.url ? (
                  <video src={mediaSrc(t.url)} controls className="w-full aspect-video object-cover rounded-lg mb-3 bg-black" />
                ) : (
                  <Quote className="w-8 h-8 text-yellow-500/30 mb-2" />
                )}
                <div className="flex gap-1 mb-2">
                  {[...Array(t.rating || 5)].map((_, k) => <Star key={k} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                  {t.kind === "video" && <PlayCircle className="w-4 h-4 text-fuchsia-400 ml-1" />}
                </div>
                <p className="text-slate-300 text-sm italic mb-3 line-clamp-4">"{t.text}"</p>
                <div className="font-display font-bold text-yellow-400 text-sm">{t.name}</div>
                <div className="text-slate-500 text-xs">{t.role}</div>
              </div>
            ))}
            {items.length === 0 && <div className="col-span-2 text-center text-slate-400 py-16">No testimonials yet.</div>}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => { setEditing(null); setForm(emptyForm); }}>
          <div className="relative w-full max-w-md glass-card rounded-2xl p-6 gold-border-glow max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setEditing(null); setForm(emptyForm); }} className="absolute top-4 right-4 text-slate-400 hover:text-yellow-400"><X className="w-6 h-6" /></button>
            <h3 className="font-display text-xl font-bold gold-gradient-text mb-4">Edit Testimonial</h3>
            <div className="space-y-3">
              <input data-testid="testimonial-edit-name-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Client Name" className={fieldCls} />
              <input data-testid="testimonial-edit-role-input" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} placeholder="Event & City" className={fieldCls} />
              <RatingPicker value={form.rating} onChange={(n) => setForm((f) => ({ ...f, rating: n }))} testPrefix="testimonial-edit-rating" />
              <textarea data-testid="testimonial-edit-text-input" value={form.text} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))} placeholder="Review text..." rows={4} className={fieldCls} />
              <div>
                <p className="text-xs text-slate-400 mb-2">Replace video (optional)</p>
                <Uploader testId="testimonial-edit-uploader" preview={null} label="Upload New Video" onUploaded={(d) => setForm((f) => ({ ...f, storage_path: d.storage_path, url: d.url, kind: "video" }))} />
                {form.storage_path && <p className="text-xs text-green-400 mt-2">New video attached ✓</p>}
              </div>
              <button data-testid="testimonial-edit-save-button" onClick={saveEdit} disabled={saving} className="w-full btn-glow bg-gradient-to-r from-yellow-500 to-amber-600 text-[#0A0508] font-bold py-2.5 rounded-full disabled:opacity-60">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
