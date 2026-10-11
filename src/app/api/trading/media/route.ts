import { NextResponse } from "next/server";
import { requireAuth, authErrorResponse } from "@/lib/auth";
import { COURSE_MODULES, hasTradingAccess } from "@/lib/trading-course";
export const dynamic="force-dynamic";
const VIDEOS: Record<number,string|undefined> = {
  1:process.env.EARNWALE_TRADING_VIDEO_1_URL,
  2:process.env.EARNWALE_TRADING_VIDEO_2_URL,
  3:process.env.EARNWALE_TRADING_VIDEO_3_URL,
  4:process.env.EARNWALE_TRADING_VIDEO_4_URL,
  5:process.env.EARNWALE_TRADING_VIDEO_5_URL,
  6:process.env.EARNWALE_TRADING_VIDEO_6_URL,
};
const DOCUMENTS:Record<string,string|undefined>={
 handbook:process.env.EARNWALE_TRADING_HANDBOOK_URL,
 workbook:process.env.EARNWALE_TRADING_WORKBOOK_URL,
};
export async function GET(req:Request) {
  try{
    const {user}=await requireAuth(req);
    if(!hasTradingAccess(user.plan)) return NextResponse.json({error:"Access denied"},{status:403});
    const p=new URL(req.url).searchParams;
    if(p.get("config")==="1") return NextResponse.json({
      videos: COURSE_MODULES.map(m=>({id:m.id,available:Boolean(VIDEOS[m.id])})),
      downloads:Object.keys(DOCUMENTS).filter(k=>Boolean(DOCUMENTS[k])),
    },{headers:{"Cache-Control":"private, no-store"}});
    const file=p.get("file");
    const id=Number(p.get("module")??0);
    const isVideo=!file && Number.isInteger(id) && id>=1 && id<=6;
    const source=isVideo?VIDEOS[id]:(file && Object.prototype.hasOwnProperty.call(DOCUMENTS,file)?DOCUMENTS[file]:undefined);
    if(!source) return NextResponse.json({error:"Course resource is not yet available"},{status:503});
    const parsed=new URL(source);
    if(parsed.protocol!=="https:") return NextResponse.json({error:"Media configuration error"},{status:503});
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
