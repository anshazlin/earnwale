"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Tx={id:string;amount:number;type:string;description?:string;createdAt?:string};
type Data={wallet:{earnings:number;totalEarned:number;referralCount:number};transactions:Tx[];hasMore:boolean};

export default function WalletPage(){
 const router=useRouter(); const [page,setPage]=useState(1); const [data,setData]=useState<Data|null>(null); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
 useEffect(()=>{let off=false; setLoading(true); setError(""); fetch(`/api/wallet?page=${page}`,{credentials:"include",cache:"no-store"}).then(async r=>{if(r.status===401||r.status===403){router.replace("/login");return null} if(!r.ok)throw new Error();return r.json()}).then(v=>{if(v&&!off)setData(v)}).catch(()=>!off&&setError("Unable to load wallet.")).finally(()=>!off&&setLoading(false));return()=>{off=true}},[page,router]);
 if(loading&&!data)return <Skeleton/>;
 return <div className="space-y-5"><header><h1 className="text-2xl font-semibold text-slate-950">Wallet</h1><p className="mt-1 text-sm text-slate-500">Your authoritative balance and wallet activity.</p></header>
 {error&&<p className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><Card label="Available balance" value={money(data?.wallet.earnings)}/><Card label="Total earned" value={money(data?.wallet.totalEarned)}/><Card label="Referrals" value={String(data?.wallet.referralCount??0)}/></div>
 <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-4 py-3"><h2 className="text-sm font-semibold">Transactions</h2></div><TxList rows={data?.transactions??[]}/></section>
 <Pager page={page} hasMore={!!data?.hasMore} setPage={setPage}/></div>
}
const money=(n?:number)=>`₹${Number(n??0).toLocaleString("en-IN")}`;
function Card({label,value}:{label:string;value:string}){return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-xl font-semibold">{value}</p></div>}
function TxList({rows}:{rows:Tx[]}){if(!rows.length)return <p className="p-8 text-center text-sm text-slate-500">No wallet activity yet.</p>;return <ul className="divide-y divide-slate-100">{rows.map(x=><li key={x.id} className="flex items-center justify-between gap-3 px-4 py-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{x.description||x.type||"Transaction"}</p><p className="text-xs text-slate-500">{x.createdAt?new Date(x.createdAt).toLocaleDateString("en-IN"):"—"}</p></div><p className="shrink-0 text-sm font-semibold">{money(x.amount)}</p></li>)}</ul>}
function Pager({page,hasMore,setPage}:{page:number;hasMore:boolean;setPage:(n:number)=>void}){return <div className="flex justify-between"><button disabled={page===1} onClick={()=>setPage(Math.max(1,page-1))} className="rounded-xl border bg-white px-4 py-2 text-sm disabled:opacity-40">Previous</button><span className="py-2 text-xs text-slate-500">Page {page}</span><button disabled={!hasMore} onClick={()=>setPage(page+1)} className="rounded-xl border bg-white px-4 py-2 text-sm disabled:opacity-40">Next</button></div>}
function Skeleton(){return <div className="space-y-4 animate-pulse"><div className="h-14 rounded-xl bg-slate-200"/><div className="grid grid-cols-2 gap-3"><div className="h-24 rounded-2xl bg-slate-200"/><div className="h-24 rounded-2xl bg-slate-200"/></div><div className="h-64 rounded-2xl bg-slate-200"/></div>}
