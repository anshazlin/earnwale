import { NextResponse } from "next/server";
import { requireAuth, authErrorResponse } from "@/lib/auth";
import { COURSE_MODULES, hasTradingAccess } from "@/lib/trading-course";
import { prisma } from "@/lib/prisma";
export const dynamic="force-dynamic";
export async function GET(req:Request) {
  try{
    const {user}=await requireAuth(req);
    if(!hasTradingAccess(user.plan)) return NextResponse.json({error:"Access denied"},{status:403});
    const p=new URL(req.url).searchParams;
    if(p.get("config")==="1") {
      const ids=COURSE_MODULES.map(m=>"module-"+m.id).concat(["handbook","workbook"]);
      const available=await Promise.all(ids.map(id=>prisma.courseAsset.findUnique({where:{id}})));
      const ready=new Set(available.filter((item:{id:string,url:string}|null)=>Boolean(item?.url)).map((item:{id:string}|null)=>item!.id));
      return NextResponse.json({
        videos:COURSE_MODULES.map(m=>({id:m.id,available:ready.has("module-"+m.id)})),
        downloads:["handbook","workbook"].filter(id=>ready.has(id)),
      },{headers:{"Cache-Control":"private, no-store"}});
    }
    const file=p.get("file");
    const id=Number(p.get("module")??0);
    const isVideo=!file && Number.isInteger(id) && id>=1 && id<=6;
    const assetId=isVideo?"module-"+id:((file==="handbook"||file==="workbook")?file:null);
    const item=assetId?await prisma.courseAsset.findUnique({where:{id:assetId}}):null;
    const source=typeof item?.url==="string"?item.url:undefined;
    if(!source) return NextResponse.json({error:"Course resource is not yet available"},{status:503});
    const parsed=new URL(source);
    if(parsed.protocol!=="https:" || !parsed.hostname.endsWith(".public.blob.vercel-storage.com")) return NextResponse.json({error:"Media configuration error"},{status:503});
    const headers=new Headers();
    if(isVideo){const range=req.headers.get("range");if(range) headers.set("Range",range);}
    // Use a protected streaming endpoint, not a client-bundled URL. Configure
    // storage with private/signed upstream credentials before production launch.
    const upstream=await fetch(parsed.toString(),{headers,cache:"no-store",redirect:"error"});
    if(!upstream.ok && upstream.status!==206) return NextResponse.json({error:"Media is unavailable"},{status:502});
    const outgoing=new Headers({
      "Content-Type":isVideo?"video/mp4":"application/pdf",
      "Cache-Control":"private, no-store",
      "X-Content-Type-Options":"nosniff",
      "Content-Disposition":isVideo?"inline":'attachment; filename="Earnwale-'+(file==="handbook"?"Handbook":"Trading-Workbook")+'.pdf"',
    });
    for(const h of ["content-range","accept-ranges","content-length"]) {
      const value=upstream.headers.get(h);if(value)outgoing.set(h,value);
    }
    return new Response(upstream.body,{status:upstream.status,headers:outgoing});
  }catch(e){return authErrorResponse(e);}
}
