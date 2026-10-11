import { get, head } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requireAuth, authErrorResponse } from "@/lib/auth";
import { COURSE_MODULES, hasTradingAccess } from "@/lib/trading-course";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const mediaPath=(id:number)=>`academy/starter/module-${id}.mp4`;
const documents:Record<string,string>={
  handbook:"academy/starter/handbook.pdf",
  workbook:"academy/starter/workbook.pdf",
};
async function available(path:string) {
  try { await head(path); return true; } catch { return false; }
}
export async function GET(req:Request) {
  try{
    const {user}=await requireAuth(req);
    if(!hasTradingAccess(user.plan)) return NextResponse.json({error:"Access denied"},{status:403});
    const p=new URL(req.url).searchParams;
    if(p.get("config")==="1"){
      const present=await Promise.all([...COURSE_MODULES.map(m=>available(mediaPath(m.id))),...Object.values(documents).map(available)]);
      return NextResponse.json({
        videos:COURSE_MODULES.map((m,i)=>({id:m.id,available:present[i]})),
        downloads:Object.keys(documents).filter((name,i)=>present[COURSE_MODULES.length+i])
      },{headers:{"Cache-Control":"private, no-store"}});
    }
    const file=p.get("file"), id=Number(p.get("module")??0);
    const video=!file && Number.isInteger(id) && id>=1 && id<=6;
    const path=video?mediaPath(id):(file && Object.prototype.hasOwnProperty.call(documents,file)?documents[file]:null);
    if(!path)return NextResponse.json({error:"Invalid resource"},{status:400});
    const range=req.headers.get("range");
    if(range && !/^bytes=\d+-\d*$/.test(range))return NextResponse.json({error:"Invalid range"},{status:416});
    const requestedHeaders=new Headers();
    if(range && video)requestedHeaders.set("Range",range);
    const blob=await get(path,{access:"private",headers:requestedHeaders});
    if(!blob||!blob.stream)return NextResponse.json({error:"Resource unavailable"},{status:404});
    const headers=new Headers({
      "Content-Type":video?"video/mp4":"application/pdf",
      "Cache-Control":"private, no-store",
      "X-Content-Type-Options":"nosniff",
      "Content-Disposition":video?"inline":`attachment; filename="Earnwale-${file==="handbook"?"Handbook":"Trading-Workbook"}.pdf"`
    });
    for(const key of ["content-range","accept-ranges","content-length","etag"]){
      const value=blob.headers.get(key); if(value)headers.set(key,value);
    }
    return new Response(blob.stream,{status:blob.statusCode,headers});
  }catch(error){return authErrorResponse(error);}
}
