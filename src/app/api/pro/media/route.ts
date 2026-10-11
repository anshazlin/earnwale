import { NextResponse } from "next/server";
import { requireAuth, authErrorResponse } from "@/lib/auth";
import { PRO_MODULES, PRO_RESOURCES, hasProAccess } from "@/lib/pro-course";
import { prisma } from "@/lib/prisma";
import { get } from "@vercel/blob";
export const dynamic="force-dynamic";
export async function GET(req:Request) {
  try{
    const {user}=await requireAuth(req);
    if(!hasProAccess(user.plan)) return NextResponse.json({error:"Access denied"},{status:403});
    const p=new URL(req.url).searchParams;
    if(p.get("config")==="1") {
      const ids=PRO_MODULES.map(m=>"pro-module-"+m.id).concat(PRO_RESOURCES.map(resource=>"pro-"+resource.id));
      const available=await Promise.all(ids.map(id=>prisma.courseAsset.findUnique({where:{id}})));
      const ready=new Set(available.filter((item:{id:string,url:string}|null)=>typeof item?.url === "string" && item.url.includes(".private.blob.vercel-storage.com")).map((item:{id:string}|null)=>item!.id));
      return NextResponse.json({
        videos:PRO_MODULES.map(m=>({id:m.id,available:ready.has("pro-module-"+m.id)})),
        downloads:PRO_RESOURCES.map(resource=>resource.id).filter(id=>ready.has("pro-"+id)),
      },{headers:{"Cache-Control":"private, no-store"}});
    }
    const file=p.get("file");
    const id=Number(p.get("module")??0);
    const isVideo=!file && Number.isInteger(id) && id>=1 && id<=PRO_MODULES.length;
    const validFile=file!==null && PRO_RESOURCES.some(resource=>resource.id===file);
    const assetId=isVideo?"pro-module-"+id:(validFile?"pro-"+file:null);
    const item=assetId?await prisma.courseAsset.findUnique({where:{id:assetId}}):null;
    const source=typeof item?.url==="string"?item.url:undefined;
    if(!source) return NextResponse.json({error:"Course resource is not yet available"},{status:503});
    const parsed=new URL(source);
    if(parsed.protocol!=="https:" || !parsed.hostname.endsWith(".private.blob.vercel-storage.com"))
      return NextResponse.json({error:"Media origin is not private"},{status:503});
    const forwarded=new Headers();
    if(isVideo){const range=req.headers.get("range");if(range)forwarded.set("Range",range);}
    const blob=await get(source,{access:"private",headers:forwarded});
    if(!blob||!blob.stream)return NextResponse.json({error:"Media is unavailable"},{status:404});
    const outgoing=new Headers({
      "Content-Type":isVideo?"video/mp4":"application/pdf",
      "Cache-Control":"private, no-store",
      "X-Content-Type-Options":"nosniff",
      "Content-Disposition":isVideo?"inline":`attachment; filename="Earnwale-Pro-${file}.pdf"`,
    });
    for(const h of ["content-range","accept-ranges","content-length","etag"]) {
      const value=blob.headers.get(h);if(value)outgoing.set(h,value);
    }
    return new Response(blob.stream,{status:blob.statusCode,headers:outgoing});
  }catch(e){return authErrorResponse(e);}
}
