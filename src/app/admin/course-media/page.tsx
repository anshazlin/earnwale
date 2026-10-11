"use client";
import { upload } from "@vercel/blob/client";
import { useEffect,useState } from "react";
const assets=[
 {path:"academy/starter/module-1.mp4",label:"Module 1 — Financial Markets",type:"video/mp4"},
 {path:"academy/starter/module-2.mp4",label:"Module 2 — How Markets Work",type:"video/mp4"},
 {path:"academy/starter/module-3.mp4",label:"Module 3 — Candlesticks",type:"video/mp4"},
 {path:"academy/starter/module-4.mp4",label:"Module 4 — Support & Resistance",type:"video/mp4"},
 {path:"academy/starter/module-5.mp4",label:"Module 5 — Risk Management",type:"video/mp4"},
 {path:"academy/starter/module-6.mp4",label:"Module 6 — Trading Psychology (corrected)",type:"video/mp4"},
 {path:"academy/starter/handbook.pdf",label:"Beginner Trading Handbook",type:"application/pdf"},
 {path:"academy/starter/workbook.pdf",label:"Worksheets and Quizzes",type:"application/pdf"},
];
export default function AdminCourseMedia(){
 const [status,setStatus]=useState<Record<string,{uploaded:boolean;bytes:number}>>({});
 const [busy,setBusy]=useState<string|null>(null);
 const [message,setMessage]=useState("");
 const [progress,setProgress]=useState<number>(0);
 async function refresh(){
   try{
     const response=await fetch("/api/admin/course-media",{credentials:"include",cache:"no-store"});
     if(!response.ok){setMessage("Admin login is required to manage course media.");return;}
     const data=await response.json();
     setStatus(Object.fromEntries(data.files.map((f:{pathname:string;uploaded:boolean;bytes:number})=>[f.pathname,{uploaded:f.uploaded,bytes:f.bytes}])));
   }catch{setMessage("Could not check media status.");}
 }
 useEffect(()=>{void refresh();},[]);
 async function send(path:string,file:File){
   const needed=path.endsWith(".mp4")?"video/mp4":"application/pdf";
   if(file.type && file.type!==needed){setMessage("Please select the correct MP4/PDF format.");return;}
   setBusy(path);setMessage("");setProgress(0);
   try{
     await upload(path,file,{access:"private",handleUploadUrl:"/api/admin/course-media",
       onUploadProgress:({percentage})=>setProgress(Math.round(percentage))});
     setMessage("Uploaded "+path+". The file is now in private storage.");
     await refresh();
   }catch(e){setMessage("Upload failed: "+(e instanceof Error?e.message:"Try again"));}
   finally{setBusy(null);}
 }
 return <main className="mx-auto max-w-3xl space-y-5 px-4 py-10">
   <h1 className="text-2xl font-bold text-slate-900">Earnwale — Course Media Upload</h1>
   <p className="text-sm text-slate-600">Admin only. Select the correct file for each slot. Files upload directly to private storage; no file is publicly downloadable.</p>
   <p className="text-xs text-amber-800">Module 6 must use VID-20261011-WA0044.mp4, NOT the Trading Hype video. Uploads work one at a time. Use a stable internet connection.</p>
   {assets.map(a=><section key={a.path} className="rounded-xl border border-slate-200 bg-white p-4">
     <div className="flex flex-wrap items-center justify-between gap-2">
       <h2 className="font-semibold text-slate-900">{a.label}</h2>
       <span className="text-sm text-slate-600">{status[a.path]?.uploaded?"Uploaded ("+(status[a.path].bytes/1048576).toFixed(1)+" MB)":"Awaiting upload"}</span>
     </div>
     {!status[a.path]?.uploaded&&<input aria-label={a.label} type="file" accept={a.type==="video/mp4"?".mp4,video/mp4":".pdf,application/pdf"}
       className="mt-3 block w-full text-sm" disabled={busy!==null}
       onChange={e=>{const file=e.target.files?.[0];if(file)void send(a.path,file);e.target.value="";}}/>}
     {busy===a.path&&<p className="mt-2 text-sm text-blue-700">Uploading: {progress}%</p>}
   </section>)}
   {message&&<p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-700" role="status">{message}</p>}
   <button onClick={()=>void refresh()} className="rounded-lg bg-[#071B33] px-4 py-2 text-white">Refresh upload status</button>
 </main>;
}
