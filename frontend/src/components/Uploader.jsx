import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { api, mediaSrc } from "@/lib/api";
import { toast } from "sonner";

// Uploads a file to /admin/upload and returns { storage_path, kind, url } via onUploaded
export const Uploader = ({ onUploaded, preview, label = "Upload Photo / Reel", testId = "uploader" }) => {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);

  const handle = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await api.post("/admin/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      onUploaded(data);
      toast.success("File uploaded");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Upload failed");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div>
      <input ref={ref} type="file" accept="image/*,video/*" className="hidden" onChange={handle} data-testid={`${testId}-input`} />
      <button
        type="button"
        data-testid={`${testId}-button`}
        onClick={() => ref.current?.click()}
        disabled={busy}
        className="w-full border-2 border-dashed border-yellow-500/30 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-yellow-300 hover:bg-yellow-500/5 transition-colors disabled:opacity-60"
      >
        {busy ? <Loader2 className="w-7 h-7 animate-spin" /> : <Upload className="w-7 h-7" />}
        <span className="text-sm font-semibold">{busy ? "Uploading..." : label}</span>
        <span className="text-xs text-slate-500">Images or short videos (max 60MB)</span>
      </button>
      {preview && (
        <div className="mt-3 rounded-lg overflow-hidden border border-yellow-500/20 h-40">
          <img src={mediaSrc(preview)} alt="preview" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
};
