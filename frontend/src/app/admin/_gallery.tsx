"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Trash2, Upload } from "lucide-react";
import { btn } from "./_types";
import type { SectionProps } from "./_types";

const MAX = 100 * 1024 * 1024;

export function GallerySection({ gallery, setGallery, API }: SectionProps) {
  const [file,      setFile]      = useState<File | null>(null);
  const [caption,   setCaption]   = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleting,  setDeleting]  = useState<Record<string, boolean>>({});
  const [drag,      setDrag]      = useState(false);

  const upload = async () => {
    if (!file) return toast.error("Select a file first.");
    if (file.size > MAX) return toast.error("File too large (max 100 MB).");
    setUploading(true);
    try {
      const mediaType: "image" | "video" = file.type.startsWith("video/") ? "video" : "image";
      const formData = new FormData();
      formData.append("media", file);
      if (caption.trim()) {
        formData.append("caption", caption.trim());
      }

      const r = await fetch(`${API}/admin/gallery`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const p = await r.json().catch(() => null);
      if (!r.ok) return toast.error(p?.error || "Upload failed.");
      toast.success("Gallery updated!");
      if (p?.id && p?.imageUrl) {
        setGallery((g) => [
          {
            id: String(p.id),
            imageUrl: String(p.imageUrl),
            mediaType: p.mediaType || mediaType,
            caption: p.caption || caption || null,
            createdAt: p.createdAt || new Date().toISOString(),
          },
          ...g,
        ]);
      }
      setFile(null); setCaption("");
    } catch { toast.error("Upload failed."); }
    finally { setUploading(false); }
  };

  const del = async (id: string) => {
    const prev = [...gallery];
    setDeleting(d => ({ ...d, [id]: true }));
    setGallery(g => g.filter(x => x.id !== id));
    try {
      const r = await fetch(`${API}/admin/gallery/${id}`, { method: "DELETE", credentials: "include" });
      if (!r.ok) { setGallery(prev); toast.error("Delete failed."); }
    } catch { setGallery(prev); toast.error("Delete failed."); }
    finally { setDeleting(d => { const n = { ...d }; delete n[id]; return n; }); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Upload */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <h3 className="text-lg font-black text-white mb-5">Upload to Showcase Gallery</h3>
        <div
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) setFile(f); }}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${drag ? "border-cyan-500 bg-cyan-500/5" : "border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/30"}`}
          onClick={() => document.getElementById("gallery-upload")?.click()}>
          <Upload className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-semibold">{file ? file.name : "Drag & drop or click to select image / video"}</p>
          <p className="text-slate-600 text-xs mt-1">Max 100 MB · Supported: JPG, PNG, WebP, MP4, MOV</p>
          <input id="gallery-upload" type="file" accept="image/*,video/*" className="hidden" onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
        </div>

        {file && (
          <div className="mt-4 space-y-3">
            <input
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Caption (optional)"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500/70 focus:outline-none"
            />
            <div className="flex gap-3">
              <button onClick={upload} disabled={uploading}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : "Upload to Gallery"}
              </button>
              <button onClick={() => setFile(null)} className={btn("border-slate-700 text-slate-400 hover:text-white")}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Gallery grid */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-white">Showcase Gallery</h3>
          <span className="text-xs font-bold bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-full">{gallery.length} items</span>
        </div>

        {gallery.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {gallery.map(item => (
              <div key={item.id} className="relative group rounded-xl overflow-hidden border border-slate-800 aspect-square bg-slate-900">
                {item.mediaType === "video"
                  ? <video src={item.imageUrl} className="w-full h-full object-cover" muted />
                  : <img src={item.imageUrl} alt={item.caption || "gallery"} className="w-full h-full object-cover" />}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  {item.caption && <p className="text-white text-[10px] text-center font-medium line-clamp-2">{item.caption}</p>}
                  <button
                    onClick={() => del(item.id)}
                    disabled={!!deleting[item.id]}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-xs font-bold disabled:opacity-50 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                    {deleting[item.id] ? "…" : "Remove"}
                  </button>
                </div>
                {item.mediaType === "video" && (
                  <div className="absolute top-2 left-2 bg-black/50 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">VIDEO</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-500 text-lg font-semibold">Gallery is empty</p>
            <p className="text-slate-600 text-sm mt-1">Upload images or videos above to populate the showcase.</p>
          </div>
        )}
      </div>
    </div>
  );
}
