import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { requireAdmin, authErrorResponse } from "@/lib/auth";
import { head } from "@vercel/blob";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export const PATHS=[
  "academy/starter/module-1.mp4",
  "academy/starter/module-2.mp4",
  "academy/starter/module-3.mp4",
  "academy/starter/module-4.mp4",
  "academy/starter/module-5.mp4",
  "academy/starter/module-6.mp4",
  "academy/starter/handbook.pdf",
  "academy/starter/workbook.pdf",
] as const;
const valid=(pathname:string)=>PATHS.some(p=>p===pathname);
export async function GET(req:Request){
  try{
    await requireAdmin(req);
    const status=await Promise.all(PATHS.map(async pathname=>{
      try{const b=await head(pathname);return {pathname,uploaded:true,bytes:b.size};}
      catch{return {pathname,uploaded:false,bytes:0};}
    }));
    return Response.json({files:status},{headers:{"Cache-Control":"private, no-store"}});
  }catch(error){return authErrorResponse(error);}
}
export async function POST(req:Request){
  try{
    // Only administrator sessions may mint upload credentials.
    // The webhook may not carry a session, but handleUpload validates its signed payload.
    const body=(await req.json()) as HandleUploadBody;
    if(body.type==="blob.generate-client-token")await requireAdmin(req);
    const output=await handleUpload({
      body,request:req,
      onBeforeGenerateToken:async (pathname)=>{
        if(!valid(pathname))throw Error("Unsupported course asset path");
        return {
          allowedContentTypes:[pathname.endsWith(".mp4")?"video/mp4":"application/pdf"],
          maximumSizeInBytes:150*1024*1024,
          addRandomSuffix:false,
          allowOverwrite:false,
          tokenPayload:JSON.stringify({pathname}),
        };
      },
      onUploadCompleted:async ({blob,tokenPayload})=>{
        const parsed=JSON.parse(tokenPayload||"{}") as {pathname?:string};
        if(!parsed.pathname||!valid(parsed.pathname)||blob.pathname!==parsed.pathname){
          throw Error("Unexpected uploaded asset");
        }
      },
    });
    return Response.json(output,{headers:{"Cache-Control":"no-store"}});
  }catch(error){
    // Do not leak provider tokens or internal upload details to the client.
    if(error instanceof Error && (/Unauthorized|Admin only|session/i.test(error.message)))return authErrorResponse(error);
    return Response.json({error:"Upload could not be completed"},{status:400});
  }
}
