import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Sparkles, LogOut, Search, Trash2, Phone, Mail, Download, Loader2,
  Inbox, Clock, PhoneCall, CheckCircle2, Archive, Pencil, X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { AdminMedia } from "@/components/admin/AdminMedia";
import { AdminArtists } from "@/components/admin/AdminArtists";
import { AdminTestimonials } from "@/components/admin/AdminTestimonials";

const STATUSES = [
  { id: "pending", label: "Pending", color: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
  { id: "contacted", label: "Contacted", color: "text-sky-400 bg-sky-400/10 border-sky-400/30" },
  { id: "booked", label: "Booked", color: "text-green-400 bg-green-400/10 border-green-400/30" },
  { id: "archived", label: "Archived", color: "text-slate-400 bg-slate-400/10 border-slate-400/30" },
];

const statusMeta = (id) => STATUSES.find((s) => s.id === id) || STATUSES[0];

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, contacted: 0, booked: 0, archived: 0 });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState(true);
  const [tab, setTab] = useState("enquiries");

  useEffect(() => {
    if (!loading && !user) navigate("/admin");
  }, [user, loading, navigate]);

  const load = async () => {
    try {
      const [e, s] = await Promise.all([api.get("/admin/enquiries"), api.get("/admin/stats")]);
      setEnquiries(e.data);
      setStats(s.data);
    } catch (err) {
      if (err.response?.status === 401) navigate("/admin");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line
  }, [user]);

  const updateStatus = async (id, status) => {
    const prev = enquiries;
    setEnquiries((list) => list.map((it) => (it.id === id ? { ...it, status } : it)));
    try {
      await api.patch(`/admin/enquiries/${id}`, { status });
      const s = await api.get("/admin/stats");
      setStats(s.data);
      toast.success(`Marked as ${status}`);
    } catch {
      setEnquiries(prev);
      toast.error("Update failed");
    }
  };

  const saveNotes = async (id, notes) => {
    try {
      await api.patch(`/admin/enquiries/${id}`, { notes });
      toast.success("Notes saved");
    } catch {
      toast.error("Could not save notes");
    }
  };

  const saveDetails = async (id, fields) => {
    const prev = enquiries;
    setEnquiries((list) => list.map((it) => (it.id === id ? { ...it, ...fields } : it)));
    try {
      await api.patch(`/admin/enquiries/${id}`, fields);
      toast.success("Enquiry updated");
    } catch (err) {
      setEnquiries(prev);
      toast.error(err.response?.data?.detail || "Update failed");
      throw err;
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this enquiry permanently?")) return;
    const prev = enquiries;
    setEnquiries((list) => list.filter((it) => it.id !== id));
    try {
      await api.delete(`/admin/enquiries/${id}`);
      const s = await api.get("/admin/stats");
      setStats(s.data);
      toast.success("Enquiry deleted");
    } catch {
      setEnquiries(prev);
      toast.error("Delete failed");
    }
  };

  const filtered = useMemo(() => {
    return enquiries.filter((e) => {
      const matchFilter = filter === "all" || e.status === filter;
      const q = query.toLowerCase();
      const matchQuery = !q || [e.name, e.phone, e.email, e.event_type, e.city].some((v) => (v || "").toLowerCase().includes(q));
      return matchFilter && matchQuery;
    });
  }, [enquiries, filter, query]);

  const exportCsv = () => {
    const headers = ["Name", "Phone", "Email", "Event Type", "Date", "City", "Budget", "Status", "Message", "Created"];
    const rows = filtered.map((e) => [e.name, e.phone, e.email, e.event_type, e.event_date, e.city, e.budget, e.status, (e.message || "").replace(/,/g, ";"), e.created_at]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c || ""}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vineet-enquiries-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const KPIS = [
    { label: "Total Enquiries", value: stats.total, icon: Inbox, color: "from-yellow-500 to-amber-600" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "from-amber-500 to-orange-600" },
    { label: "Contacted", value: stats.contacted, icon: PhoneCall, color: "from-sky-500 to-blue-600" },
    { label: "Booked", value: stats.booked, icon: CheckCircle2, color: "from-green-500 to-emerald-600" },
  ];

  if (loading || busy) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0508]">
        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0508]">
      <header className="glass-card border-b border-yellow-500/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <div>
              <div className="font-display font-black gold-gradient-text">Admin Dashboard</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest">Vineet Events</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-slate-300">{user?.email}</span>
            <button data-testid="admin-logout-button" onClick={() => { logout(); navigate("/admin"); }} className="flex items-center gap-2 text-sm font-semibold text-red-400 hover:text-red-300">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-2 mb-8 border-b border-yellow-500/15">
          {[
            { id: "enquiries", label: "Enquiries" },
            { id: "media", label: "Media Gallery" },
            { id: "artists", label: "Artists" },
            { id: "testimonials", label: "Testimonials" },
          ].map((t) => (
            <button
              key={t.id}
              data-testid={`admin-tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`px-4 sm:px-6 py-3 text-sm font-bold border-b-2 -mb-px transition-colors ${
                tab === t.id ? "border-yellow-500 text-yellow-400" : "border-transparent text-slate-400 hover:text-yellow-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "media" && <AdminMedia />}
        {tab === "artists" && <AdminArtists />}
        {tab === "testimonials" && <AdminTestimonials />}

        {tab === "enquiries" && (
        <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {KPIS.map((k) => (
            <div key={k.label} data-testid={`admin-kpi-${k.label.toLowerCase().split(" ")[0]}`} className="glass-card rounded-2xl p-5 border border-yellow-500/15">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center mb-3`}>
                <k.icon className="w-5 h-5 text-[#0A0508]" />
              </div>
              <div className="font-display text-3xl font-black text-white">{k.value}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wide mt-1">{k.label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              data-testid="admin-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, phone, city, event..."
              className="w-full bg-[#1e0f18] border border-yellow-500/20 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-yellow-500/60"
            />
          </div>
          <select
            data-testid="admin-status-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-[#1e0f18] border border-yellow-500/20 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-yellow-500/60"
          >
            <option value="all">All Statuses</option>
            {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <button data-testid="admin-export-csv" onClick={exportCsv} className="flex items-center justify-center gap-2 bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 font-semibold px-5 py-2.5 rounded-lg hover:bg-yellow-500/25 text-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="glass-card rounded-2xl p-16 text-center text-slate-400">
            <Inbox className="w-12 h-12 mx-auto mb-4 text-yellow-500/40" />
            No enquiries found.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((e) => (
              <EnquiryCard key={e.id} enquiry={e} onStatus={updateStatus} onNotes={saveNotes} onDelete={remove} onSaveDetails={saveDetails} />
            ))}
          </div>
        )}
        </>
        )}
      </main>
    </div>
  );
}

const emptyEditForm = { name: "", phone: "", email: "", event_type: "", event_date: "", city: "", budget: "" };

const EnquiryCard = ({ enquiry: e, onStatus, onNotes, onDelete, onSaveDetails }) => {
  const [notes, setNotes] = useState(e.notes || "");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyEditForm);
  const [saving, setSaving] = useState(false);
  const meta = statusMeta(e.status);

  const openEdit = () => {
    setForm({
      name: e.name || "", phone: e.phone || "", email: e.email || "",
      event_type: e.event_type || "", event_date: e.event_date || "",
      city: e.city || "", budget: e.budget || "",
    });
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }
    setSaving(true);
    try {
      await onSaveDetails(e.id, form);
      setEditing(false);
    } catch {
      // error toast already shown by onSaveDetails
    } finally {
      setSaving(false);
    }
  };

  const fieldCls = "w-full bg-[#1e0f18] border border-yellow-500/20 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-yellow-500/60";

  return (
    <div data-testid={`admin-enquiry-${e.id}`} className="glass-card rounded-2xl p-5 border border-yellow-500/15">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-display text-lg font-bold text-yellow-300">{e.name}</h3>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${meta.color}`}>{meta.label}</span>
            {e.source && <span className="text-[10px] text-slate-500 uppercase tracking-wide">via {e.source}</span>}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm text-slate-400">
            <a href={`tel:${e.phone}`} className="flex items-center gap-1.5 hover:text-yellow-300"><Phone className="w-3.5 h-3.5" /> {e.phone}</a>
            {e.email && <a href={`mailto:${e.email}`} className="flex items-center gap-1.5 hover:text-yellow-300"><Mail className="w-3.5 h-3.5" /> {e.email}</a>}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm text-slate-300">
            {e.event_type && <span><span className="text-slate-500">Event:</span> {e.event_type}</span>}
            {e.event_date && <span><span className="text-slate-500">Date:</span> {e.event_date}</span>}
            {e.city && <span><span className="text-slate-500">City:</span> {e.city}</span>}
            {e.budget && <span><span className="text-slate-500">Budget:</span> {e.budget}</span>}
          </div>
          {e.message && <p className="mt-3 text-sm text-slate-400 italic bg-[#1e0f18] rounded-lg px-3 py-2 border border-white/5">"{e.message}"</p>}
        </div>
        <div className="flex gap-1 self-start">
          <button onClick={openEdit} data-testid={`admin-edit-${e.id}`} className="text-yellow-300/80 hover:text-yellow-300 p-2" aria-label="Edit">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(e.id)} data-testid={`admin-delete-${e.id}`} className="text-red-400/70 hover:text-red-400 p-2" aria-label="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s.id}
              data-testid={`admin-status-${s.id}-${e.id}`}
              onClick={() => onStatus(e.id, s.id)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${e.status === s.id ? s.color : "border-white/10 text-slate-400 hover:border-yellow-500/40"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex-1 flex gap-2">
          <input
            value={notes}
            onChange={(ev) => setNotes(ev.target.value)}
            placeholder="Add internal notes..."
            data-testid={`admin-notes-${e.id}`}
            className="flex-1 bg-[#1e0f18] border border-yellow-500/20 rounded-lg px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-yellow-500/60"
          />
          <button onClick={() => onNotes(e.id, notes)} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/25">
            Save
          </button>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setEditing(false)}>
          <div className="relative w-full max-w-md glass-card rounded-2xl p-6 gold-border-glow max-h-[92vh] overflow-y-auto" onClick={(ev) => ev.stopPropagation()}>
            <button onClick={() => setEditing(false)} className="absolute top-4 right-4 text-slate-400 hover:text-yellow-400"><X className="w-6 h-6" /></button>
            <h3 className="font-display text-xl font-bold gold-gradient-text mb-4">Edit Enquiry</h3>
            <div className="space-y-3">
              <input data-testid={`admin-edit-name-${e.id}`} value={form.name} onChange={(ev) => setForm((f) => ({ ...f, name: ev.target.value }))} placeholder="Name" className={fieldCls} />
              <input data-testid={`admin-edit-phone-${e.id}`} value={form.phone} onChange={(ev) => setForm((f) => ({ ...f, phone: ev.target.value }))} placeholder="Phone" className={fieldCls} />
              <input data-testid={`admin-edit-email-${e.id}`} value={form.email} onChange={(ev) => setForm((f) => ({ ...f, email: ev.target.value }))} placeholder="Email" className={fieldCls} />
              <input data-testid={`admin-edit-eventtype-${e.id}`} value={form.event_type} onChange={(ev) => setForm((f) => ({ ...f, event_type: ev.target.value }))} placeholder="Event Type" className={fieldCls} />
              <input data-testid={`admin-edit-eventdate-${e.id}`} value={form.event_date} onChange={(ev) => setForm((f) => ({ ...f, event_date: ev.target.value }))} placeholder="Event Date" className={fieldCls} />
              <input data-testid={`admin-edit-city-${e.id}`} value={form.city} onChange={(ev) => setForm((f) => ({ ...f, city: ev.target.value }))} placeholder="City" className={fieldCls} />
              <input data-testid={`admin-edit-budget-${e.id}`} value={form.budget} onChange={(ev) => setForm((f) => ({ ...f, budget: ev.target.value }))} placeholder="Budget" className={fieldCls} />
              <button data-testid={`admin-edit-save-${e.id}`} onClick={saveEdit} disabled={saving} className="w-full btn-glow bg-gradient-to-r from-yellow-500 to-amber-600 text-[#0A0508] font-bold py-2.5 rounded-full disabled:opacity-60">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
