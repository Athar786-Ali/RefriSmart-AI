"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Trash2, Package } from "lucide-react";
import { imgSrc, expiryDate, toDataUrl, inp, btn } from "./_types";
import type { SectionProps, NewProd } from "./_types";

const CERT = "Tested & Certified: Cooling system and compressor working properly.";
const MAX  = 100 * 1024 * 1024;
const INIT: NewProd = { title:"",description:"",price:"",imageUrl:"",serialNumber:"",stockQty:"1",productType:"NEW",conditionScore:"",ageMonths:"",warrantyType:"BRAND",warrantyExpiry:"",warrantyCertificateUrl:"" };

export function ProductsSection({ stats, setStats, API }: SectionProps) {
  const [prod, setProd] = useState<NewProd>(INIT);
  const [ageY, setAgeY] = useState("0");
  const [ageM, setAgeM] = useState("0");
  const [wDur, setWDur] = useState("12");
  const [wUnit, setWUnit] = useState<"MONTHS"|"YEARS">("MONTHS");
  const [uploading, setUploading] = useState(false);
  const [priceAI,  setPriceAI]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const uploadImg = async (f: File) => {
    const fileData = await toDataUrl(f);
    const r = await fetch(`${API}/admin/upload-image`, { method:"POST", headers:{"Content-Type":"application/json"}, credentials:"include", body:JSON.stringify({ fileData, fileName:f.name }) });
    const p = await r.json().catch(() => ({}));
    if (!r.ok || !p?.imageUrl) throw new Error(p?.error || "Upload failed.");
    return p.imageUrl as string;
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith("image/")) return toast.error("Select an image file.");
    if (f.size > MAX) return toast.error("File too large (max 100 MB).");
    setUploading(true);
    try { const url = await uploadImg(f); setProd(p => ({ ...p, imageUrl: url })); toast.success("Image uploaded."); }
    catch (e: any) { toast.error(e.message || "Upload failed."); }
    finally { setUploading(false); }
  };

  const suggestPrice = async () => {
    if (!prod.price) return toast.error("Enter base price first.");
    const am = (Number(ageY||0)*12) + Number(ageM||0);
    setPriceAI(true);
    try {
      const r = await fetch(`${API}/admin/suggest-price`, { method:"POST", headers:{"Content-Type":"application/json"}, credentials:"include", body:JSON.stringify({ basePrice:prod.price, conditionScore:prod.conditionScore, ageMonths:am, productType:prod.productType, title:prod.title }) });
      const p = await r.json();
      if (!r.ok) return toast.error(p?.error || "AI price failed.");
      setProd(x => ({ ...x, price: String(p.suggestedPrice || x.price) }));
      toast.success(`AI Range: ₹${p.recommendedMin}–₹${p.recommendedMax} · Confidence ${Math.round((p.confidenceScore||0)*100)}%`);
    } catch { toast.error("AI price failed."); }
    finally { setPriceAI(false); }
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prod.imageUrl) return toast.error("Upload product image first.");
    setSubmitting(true);
    try {
      const R  = prod.productType === "REFURBISHED";
      const am = (Number(ageY||0)*12) + Number(ageM||0);
      const payload = { ...prod, conditionScore:R?(prod.conditionScore||"9"):"", ageMonths:R?String(am):"", warrantyType:R?(prod.warrantyType||"SHOP"):prod.warrantyType, warrantyExpiry:expiryDate(wDur, wUnit), warrantyCertificateUrl:R?(prod.warrantyCertificateUrl.trim()||CERT):prod.warrantyCertificateUrl, stockQty:R?"1":prod.stockQty };
      const r  = await fetch(`${API}/admin/add-product`, { method:"POST", headers:{"Content-Type":"application/json"}, credentials:"include", body:JSON.stringify(payload) });
      const p  = await r.json().catch(() => null);
      if (!r.ok) return toast.error(p?.error || "Failed to add product.");
      toast.success("Product listed!");
      setProd(INIT); setAgeY("0"); setAgeM("0"); setWDur("12"); setWUnit("MONTHS");
      if (p?.product) setStats(s => s ? { ...s, latestProducts:[p.product,...s.latestProducts], totalProducts:(s.totalProducts||0)+1 } : s);
    } catch { toast.error("Failed to add product."); }
    finally { setSubmitting(false); }
  };

  const deleteProd = async (id: string) => {
    const ok = await new Promise<boolean>(res => { toast("Remove this product?", { duration:8000, action:{ label:"Yes, remove", onClick:()=>res(true) }, cancel:{ label:"Cancel", onClick:()=>res(false) }, onDismiss:()=>res(false) }); });
    if (!ok) return;
    try {
      const r = await fetch(`${API}/admin/delete-product/${id}`, { method:"DELETE", credentials:"include" });
      if (!r.ok) { const p = await r.json().catch(()=>({})); return toast.error(p?.error||"Delete failed."); }
      toast.success("Product removed.");
      setStats(s => s ? { ...s, latestProducts:s.latestProducts.filter(p => p.id!==id), totalProducts:Math.max(0,(s.totalProducts||1)-1) } : s);
    } catch { toast.error("Delete failed."); }
  };

  const R = prod.productType === "REFURBISHED";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Add product form */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <h3 className="text-lg font-black text-white mb-5">Add New Product</h3>
        <form onSubmit={addProduct} className="space-y-4">
          {/* Type toggle */}
          <div className="flex gap-3">
            {(["NEW","REFURBISHED"] as const).map(t => (
              <button key={t} type="button"
                onClick={() => { setProd(p => ({ ...p, productType:t, conditionScore:t==="REFURBISHED"?(p.conditionScore||"9"):"", warrantyType:t==="REFURBISHED"?"SHOP":"BRAND" })); if(t==="REFURBISHED"){setWDur("6");setWUnit("MONTHS");}else{setWDur("12");setWUnit("MONTHS");} }}
                className={`px-5 py-2 rounded-xl text-sm font-bold border transition-all ${prod.productType===t?"bg-cyan-500/20 border-cyan-500/40 text-cyan-300":"border-slate-700 text-slate-400 hover:text-white"}`}>
                {t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required value={prod.title} onChange={e=>setProd(p=>({...p,title:e.target.value}))} placeholder="Product title *" className={inp} />
            <div className="flex gap-2">
              <input required value={prod.price} onChange={e=>setProd(p=>({...p,price:e.target.value}))} placeholder="Price ₹ *" type="number" min="0" className={inp} />
              <button type="button" onClick={suggestPrice} disabled={priceAI}
                className={btn("border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 whitespace-nowrap shrink-0")}>
                {priceAI ? <Loader2 className="w-4 h-4 animate-spin" /> : "AI Price"}
              </button>
            </div>
            <textarea value={prod.description} onChange={e=>setProd(p=>({...p,description:e.target.value}))} placeholder="Description" rows={3} className={`${inp} resize-none`} />
            <div className="space-y-3">
              <input value={prod.serialNumber} onChange={e=>setProd(p=>({...p,serialNumber:e.target.value}))} placeholder="Serial / model number" className={inp} />
              {!R && <input value={prod.stockQty} onChange={e=>setProd(p=>({...p,stockQty:e.target.value}))} placeholder="Stock qty" type="number" min="1" className={inp} />}
            </div>

            {R && <>
              <input value={prod.conditionScore} onChange={e=>setProd(p=>({...p,conditionScore:e.target.value}))} placeholder="Condition score (1-10)" type="number" min="1" max="10" className={inp} />
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1.5 block">Age of appliance</label>
                <div className="flex gap-2">
                  <select value={ageY} onChange={e=>setAgeY(e.target.value)} className={inp}>{Array.from({length:16},(_,i)=><option key={i} value={i}>{i} yr</option>)}</select>
                  <select value={ageM} onChange={e=>setAgeM(e.target.value)} className={inp}>{Array.from({length:12},(_,i)=><option key={i} value={i}>{i} mo</option>)}</select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1.5 block">Warranty type</label>
                <select value={prod.warrantyType} onChange={e=>setProd(p=>({...p,warrantyType:e.target.value as "BRAND"|"SHOP"|""}))} className={inp}>
                  <option value="BRAND">Brand Warranty</option>
                  <option value="SHOP">Shop Warranty</option>
                </select>
              </div>
              <textarea value={prod.warrantyCertificateUrl} onChange={e=>setProd(p=>({...p,warrantyCertificateUrl:e.target.value}))} placeholder={CERT} rows={2} className={`${inp} resize-none`} />
            </>}

            <div>
              <label className="text-xs font-bold text-slate-400 mb-1.5 block">Warranty duration</label>
              <div className="flex gap-2">
                <select value={wDur} onChange={e=>setWDur(e.target.value)} className={inp}>
                  {["3","6","9","12","18","24","36"].map(v=><option key={v} value={v}>{v}</option>)}
                </select>
                <select value={wUnit} onChange={e=>setWUnit(e.target.value as "MONTHS"|"YEARS")} className={inp}>
                  <option value="MONTHS">Months</option>
                  <option value="YEARS">Years</option>
                </select>
              </div>
            </div>

            {/* Image upload */}
            <div>
              <label className="text-xs font-bold text-slate-400 mb-1.5 block">Product image *</label>
              <div className="flex items-center gap-3">
                <label className={`flex-1 ${btn("border-dashed border-slate-600 bg-slate-800/50 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 cursor-pointer text-center")} py-3`}>
                  {uploading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</span> : "Choose Image"}
                  <input type="file" accept="image/*" className="hidden" onChange={onFile} />
                </label>
                {prod.imageUrl && <img src={prod.imageUrl} alt="preview" className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0" />}
              </div>
            </div>
          </div>

          <button type="submit" disabled={submitting||uploading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-sm shadow-lg shadow-blue-900/30 disabled:opacity-50 transition-all">
            {submitting ? "Adding…" : "List Product"}
          </button>
        </form>
      </div>

      {/* Product inventory */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-white">Current Inventory</h3>
          <span className="text-xs font-bold bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-full">{stats?.totalProducts ?? 0} products</span>
        </div>
        <div className="space-y-3 max-h-96 overflow-auto pr-1">
          {(stats?.latestProducts ?? []).map(p => (
            <div key={p.id} className="flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-900 p-3 hover:border-cyan-500/20 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                {imgSrc(p.images) ? <img src={imgSrc(p.images)!} alt={p.title} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-slate-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{p.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-cyan-400 font-bold">₹{Number(p.price||0).toLocaleString("en-IN")}</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${p.productType==="REFURBISHED"?"border-orange-500/30 text-orange-400 bg-orange-500/10":"border-blue-500/30 text-blue-400 bg-blue-500/10"}`}>{p.productType??"NEW"}</span>
                  {p.stockQty != null && <span className="text-[9px] text-slate-500">Stock: {p.stockQty}</span>}
                </div>
              </div>
              <button onClick={() => deleteProd(p.id)} className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all shrink-0" title="Remove product">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {!stats?.latestProducts?.length && <p className="text-slate-500 text-sm">No products listed yet.</p>}
        </div>
      </div>
    </div>
  );
}
