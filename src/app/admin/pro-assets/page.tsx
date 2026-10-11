"use client";
import { upload } from "@vercel/blob/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PRO_MODULES, PRO_RESOURCES } from "@/lib/pro-course";

const ASSETS=[
 ...PRO_MODULES.map(module=>({
   id:"pro-module-"+module.id,
   title:"P"+module.id+" — "+module.title,
   name:"Earnwale_Pro_P"+String(module.id).padStart(2,"0")+".mp4",
   mime:"video/mp4",
   path:"earnwale/pro/module-"+module.id+".mp4",
 })),
 ...PRO_RESOURCES.map(resource=>({
   id:"pro-"+resource.id,
   title:resource.title,
   name:resource.filename,
   mime:"application/pdf",
   path:"earnwale/pro/"+resource.id+".pdf",
 })),
];
type StoredAsset={id:string;ready:boolean;recorded?:boolean;updatedAt:string|null};

export default function AdminProAssetsPage(){
 const [current,setCurrent]=useState<StoredAsset[]>([]);
 const [notice,setNotice]=useState("");
 const [busy,setBusy]=useState<string|null>(null);
 const [progress,setProgress]=useState(0);
 const [preview,setPreview]=useState(1);
 const [playerError,setPlayerError]=useState(false);
 async function reload(){
   const response=await fetch("/api/admin/pro-assets",{credentials:"include",cache:"no-store"});
   if(!response.ok)throw Error("Sign in with the Earnwale administrator account to check Pro uploads.");
   const data=await response.json() as {assets:StoredAsset[]};
   setCurrent(data.assets??[]);
 }
 useEffect(()=>{void reload().catch(e=>setNotice(e instanceof Error?e.message:"Could not load Pro resources."));},[]);
 async function send(id:string,file:File){
   const asset=ASSETS.find(item=>item.id===id);
   if(!asset)return;
   if(file.type && file.type!==asset.mime){setNotice("Incorrect format. Use an MP4 for video or PDF for handouts.");return;}
   setBusy(id);setNotice("");setProgress(0);
   try{
     await upload(asset.path,file,{
       access:"private",
       handleUploadUrl:"/api/admin/pro-assets",
       clientPayload:asset.id,
       multipart:true,
       onUploadProgress:({percentage})=>setProgress(Math.round(percentage)),
     });
     setNotice(asset.title+" transferred. If its status is Pending, refresh after the storage callback.");
     await reload();
   }catch(error){setNotice(error instanceof Error?error.message:"Upload failed; please try again.");}
   finally{setBusy(null);}
 }
 const ready=(id:string)=>Boolean(current.find(item=>item.id===id)?.ready);
 const readyCount=ASSETS.filter(item=>ready(item.id)).length;
 return <main className="mx-auto max-w-4xl space-y-5 px-4 py-8">
   <div className="rounded-2xl bg-[#071B33] p-6 text-white">
     <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">Earnwale Trading Academy · Admin</p>
     <h1 className="mt-2 text-2xl font-bold">Pro course media · ₹500</h1>
     <p className="mt-3 text-sm leading-6 text-blue-100">Add six new Pro video lessons and five learner PDFs. Files upload to private Vercel Blob and are available only through authenticated routes. Pro checkout stays closed until every resource is tested and approved.</p>
     <p className="mt-4 text-sm font-semibold text-amber-200">Verified Pro resources: {readyCount} / {ASSETS.length}</p>
     <Link href="/admin/trading-assets" className="mt-3 inline-block text-sm text-blue-100 underline underline-offset-4">Back to Starter uploads</Link>
   </div>
   <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
     Generate one video from each numbered NotebookLM Pro source. Check the maths, fictional labels and voiceover before upload. Instructor quiz answers and workbook solutions must never be added as learner resources.
   </div>
   {notice&&<p role="status" className="rounded-xl bg-slate-100 p-4 text-sm text-slate-800">{notice}</p>}
   <section className="space-y-3" aria-label="Upload Pro video lessons and handouts">
     {ASSETS.map(asset=><div key={asset.id} className="rounded-xl border border-slate-200 bg-white p-4">
       <div className="flex flex-wrap items-center justify-between gap-2">
         <div><h2 className="font-semibold text-slate-900">{asset.title}</h2><p className="mt-1 text-xs text-slate-500">{asset.mime==="video/mp4"?"Generate from the matching P-numbered script":"Use the matching learner PDF"} · {asset.name}</p></div>
         <span className={`text-sm font-semibold ${ready(asset.id)?"text-emerald-700":"text-amber-700"}`}>{ready(asset.id)?"Stored":"Pending upload"}</span>
       </div>
       {!ready(asset.id)&&<input type="file" aria-label={"Upload "+asset.title}
         accept={asset.mime==="video/mp4"?".mp4,video/mp4":".pdf,application/pdf"}
         disabled={busy!==null}
         className="mt-3 block w-full text-sm text-slate-700 disabled:opacity-50"
         onChange={event=>{const file=event.currentTarget.files?.[0];if(file)void send(asset.id,file);event.currentTarget.value="";}}/>}
       {busy===asset.id&&<p className="mt-2 text-sm text-blue-700">Uploading... {progress}%. Keep this page open.</p>}
     </div>)}
   </section>
   <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
     <h2 className="text-xl font-bold text-slate-900">Admin-only Pro video preview</h2>
     <p className="mt-1 text-sm text-slate-600">Preview every uploaded Pro lesson without purchasing the ₹500 course.</p>
     <div className="mt-4 flex flex-wrap gap-2">{PRO_MODULES.map(module=>
       <button key={module.id} type="button" onClick={()=>{setPreview(module.id);setPlayerError(false);}}
         className={`rounded-lg px-3 py-2 text-sm font-semibold ${preview===module.id?"bg-[#071B33] text-white":"border border-slate-300 bg-white text-slate-700"}`}>P{module.id}</button>
     )}</div>
     {ready("pro-module-"+preview)
       ? <div className="mt-4 aspect-video overflow-hidden rounded-xl bg-slate-950">
           <video key={preview} controls playsInline preload="none" className="h-full w-full" onError={()=>setPlayerError(true)}>
             <source src={`/api/admin/pro-preview?module=${preview}`} type="video/mp4"/>
             Your browser does not support this video.
           </video>
         </div>
       : <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">P{preview} has not been uploaded yet.</p>}
     {playerError&&<p role="alert" className="mt-3 text-sm text-rose-700">Playback failed. Check the file and try again.</p>}
     <div className="mt-4 flex flex-wrap gap-3">{PRO_RESOURCES.filter(resource=>ready("pro-"+resource.id)).map(resource=>
       <a key={resource.id} href={`/api/admin/pro-preview?file=${resource.id}`} target="_blank" rel="noopener noreferrer"
         className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">Preview {resource.title}</a>
     )}</div>
   </section>
   <button onClick={()=>void reload().catch(()=>setNotice("Unable to refresh Pro files."))} type="button"
     className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Refresh Pro upload status</button>
 </main>;
}
