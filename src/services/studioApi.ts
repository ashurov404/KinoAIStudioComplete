export type JobPayload={projectId:string;script:string;shots:any[];callbackUrl?:string};
export async function postStudioJob(baseUrl:string,clientKey:string,payload:JobPayload){if(!baseUrl)throw new Error('STUDIO_API_URL_MISSING');const r=await fetch(`${baseUrl.replace(/\/$/,'')}/jobs`,{method:'POST',headers:{'Content-Type':'application/json',...(clientKey?{'X-Client-Key':clientKey}:{})},body:JSON.stringify(payload)});const text=await r.text();if(!r.ok)throw new Error(`STUDIO_API_${r.status}: ${text.slice(0,200)}`);return JSON.parse(text)}
export async function postTelegram(baseUrl:string,clientKey:string,chatId:string,text:string){if(!baseUrl)throw new Error('STUDIO_API_URL_MISSING');const r=await fetch(`${baseUrl.replace(/\/$/,'')}/telegram/send`,{method:'POST',headers:{'Content-Type':'application/json',...(clientKey?{'X-Client-Key':clientKey}:{})},body:JSON.stringify({chatId,text})});if(!r.ok)throw new Error(`TELEGRAM_API_${r.status}`);return r.json()}

export type EncodedVideoResult={ok:boolean;status:string;videoPath?:string;frameCount?:number;fps?:number;error?:string};
export async function encodeRawFrames(baseUrl:string,clientKey:string,frames:string[],width:number,height:number,fps=24):Promise<EncodedVideoResult>{
  if(!baseUrl)throw new Error('STUDIO_API_URL_MISSING');
  const r=await fetch(`${baseUrl.replace(/\/$/,'')}/render/encode`,{
    method:'POST',headers:{'Content-Type':'application/json',...(clientKey?{'X-Client-Key':clientKey}:{})},
    body:JSON.stringify({frames,width,height,fps})
  });
  const j=await r.json();if(!r.ok)throw new Error(j?.error||`RENDER_API_${r.status}`);return j;
}
