"use client";

import { upload } from "@vercel/blob/client";
import { useEffect, useState } from "react";

const ASSETS = [
  { id: "module-1", title: "Module 1 · Introduction to Financial Markets", name: "VID-20261010-WA0025(1).mp4", type: "video/mp4", path: "earnwale/starter/module-1.mp4" },
  { id: "module-2", title: "Module 2 · How Stock Markets Work", name: "VID-20261011-WA0037.mp4", type: "video/mp4", path: "earnwale/starter/module-2.mp4" },
  { id: "module-3", title: "Module 3 · Candlestick Charts", name: "VID-20261011-WA0038.mp4", type: "video/mp4", path: "earnwale/starter/module-3.mp4" },
  { id: "module-4", title: "Module 4 · Support, Resistance and Trends", name: "VID-20261011-WA0039.mp4", type: "video/mp4", path: "earnwale/starter/module-4.mp4" },
  { id: "module-5", title: "Module 5 · Risk Management", name: "VID-20261011-WA0040.mp4", type: "video/mp4", path: "earnwale/starter/module-5.mp4" },
  { id: "module-6", title: "Module 6 · Trading Psychology", name: "VID-20261011-WA0044.mp4", type: "video/mp4", path: "earnwale/starter/module-6.mp4" },
  { id: "handbook", title: "Beginner Trading Handbook", name: "Earnwale_Beginner_Trading_Handbook.pdf", type: "application/pdf", path: "earnwale/starter/handbook.pdf" },
  { id: "workbook", title: "Worksheets and Quizzes", name: "Earnwale_Trading_Worksheets_and_Quizzes.pdf", type: "application/pdf", path: "earnwale/starter/workbook.pdf" },
];
type State = { id: string; ready: boolean; updatedAt: string|null };
export default function TradingAssetsPage() {
  const [current, setCurrent] = useState<State[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState(1);
  const [previewError, setPreviewError] = useState(false);
  async function reload() {
    const res = await fetch("/api/admin/trading-assets", { credentials: "include", cache: "no-store" });
    if (!res.ok) throw new Error("Unable to check course uploads");
    const result = await res.json();
    setCurrent(result.assets ?? []);
  }
  useEffect(() => { void reload().catch(() => setNotice("Unable to check storage. Sign in with your admin account.")); }, []);
  async function send(id: string, file: File) {
    const asset=ASSETS.find(a => a.id === id);
    if (!asset) return;
    if (file.type !== asset.type) { setNotice("Please choose an MP4 video or PDF as indicated."); return; }
    setBusy(id);setNotice("");
    try {
      await upload(asset.path, file, {
        access: "private",
        handleUploadUrl: "/api/admin/trading-assets",
        clientPayload: id,
        multipart: true,
      });
      // The storage completion callback may take a moment to populate Firestore.
      setNotice(asset.title + " uploaded. Refresh the status if it still says pending.");
      await reload();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Upload failed; please retry.");
    } finally { setBusy(null); }
  }
  const selectedPreview = "module-"+preview;
  const canPreview = Boolean(current.find(item => item.id === selectedPreview)?.ready);
  const handbookReady = Boolean(current.find(item => item.id === "handbook")?.ready);
  const workbookReady = Boolean(current.find(item => item.id === "workbook")?.ready);
  return <main className="mx-auto max-w-4xl space-y-5 px-4 py-8">
    <div className="rounded-2xl bg-[#071B33] p-6 text-white">
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">Admin · Earnwale Trading Academy</p>
      <h1 className="mt-2 text-2xl font-bold">Course media uploads</h1>
      <p className="mt-3 text-sm leading-6 text-blue-100">Upload the exact six MP4 videos and two student PDFs. Files go directly from this browser to Vercel Blob, not through the website server. Upload only materials you have reviewed and have rights to distribute.</p>
    </div>
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">The incorrect Decoding the Trading Hype video (WA0042) must NOT be uploaded. Use Trading Psychology (WA0044) for Module 6. Files are sent to a private Blob store. Videos require a valid paid-course login; do not upload material until reviewed.</div>
    {notice && <p role="status" className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800">{notice}</p>}
    <div className="space-y-3">
      {ASSETS.map(asset => {
        const ready=Boolean(current.find(x => x.id===asset.id)?.ready);
        return <div key={asset.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap justify-between gap-3">
            <div><h2 className="font-semibold text-slate-900">{asset.title}</h2><p className="mt-1 text-xs text-slate-500">Select {asset.name}</p></div>
            <span className={"text-sm font-medium "+(ready?"text-green-700":"text-amber-700")}>{ready?"Stored":"Pending"}</span>
          </div>
          <input aria-label={"Upload "+asset.title} type="file" accept={asset.type === "video/mp4" ? ".mp4,video/mp4" : ".pdf,application/pdf"}
            disabled={busy !== null}
            onChange={event=>{ const file=event.target.files?.[0]; if(file) void send(asset.id,file);event.currentTarget.value=""; }}
            className="mt-3 block w-full text-sm text-slate-800 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-white disabled:opacity-60" />
          {busy===asset.id&&<p className="mt-2 text-sm text-blue-700">Uploading file… keep this page open.</p>}
        </div>;
      })}
    </div>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Preview your uploaded course</h2>
          <p className="mt-1 text-sm text-slate-600">Admin preview only. Check playback and PDF readability before opening Starter enrollment. No course purchase is required for the admin account.</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {[1,2,3,4,5,6].map(number=><button key={number} type="button"
          onClick={()=>{setPreview(number);setPreviewError(false);}}
          className={`rounded-lg px-3 py-2 text-sm font-semibold ${number === preview?"bg-[#071B33] text-white":"border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}>
          Module {number}
        </button>)}
      </div>
      {canPreview ? (
        <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl bg-slate-950">
          <video key={preview} controls playsInline preload="none" className="h-full w-full"
            onError={()=>setPreviewError(true)}>
            <source src={`/api/admin/trading-preview?module=${preview}`} type="video/mp4" />
            Your browser does not support video playback.
          </video>
        </div>
      ) : <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Module {preview} has not been verified as ready. Refresh the upload status above.</p>}
      {previewError&&<p role="alert" className="mt-3 text-sm text-rose-700">Video playback failed. Check the upload status and try refreshing the page.</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        {handbookReady&&<a className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white" href="/api/admin/trading-preview?file=handbook" target="_blank" rel="noopener noreferrer">Preview handbook PDF</a>}
        {workbookReady&&<a className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-900" href="/api/admin/trading-preview?file=workbook" target="_blank" rel="noopener noreferrer">Preview worksheets PDF</a>}
      </div>
      <p className="mt-4 text-xs text-slate-500">Only you and enrolled learners can request private media through authenticated endpoints. This admin preview does not enable public purchases.</p>
    </section>
    <button type="button" onClick={()=>void reload()} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Refresh upload status</button>
  </main>;
}
