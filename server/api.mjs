import http from 'node:http';
import {randomUUID} from 'node:crypto';
import {spawn} from 'node:child_process';

const port=Number(process.env.PORT||8787);
const clientKey=process.env.STUDIO_CLIENT_KEY||'';
const openrouterKey=process.env.OPENROUTER_API_KEY||'';
const telegramToken=process.env.TELEGRAM_BOT_TOKEN||'';
const adminEmail=(process.env.ADMIN_EMAIL||'ashurovabdulqodir10@gmail.com').toLowerCase();
const adminChatId=process.env.TELEGRAM_ADMIN_CHAT_ID||'';
const webhookSecret=process.env.TELEGRAM_WEBHOOK_SECRET||'';

const jobs=new Map();
const adminSessions=new Map(); // chatId -> {stage:'awaiting_request'|'awaiting_approval',plan}
const rules=[];

const encodeRawFrames=({frames,width,height,fps,outputPath})=>new Promise((resolve,reject)=>{
  if(!Array.isArray(frames)||!frames.length) return reject(Error('NO_FRAMES'));
  const out=outputPath||`/tmp/kino-${randomUUID()}.mp4`;
  const ff=spawn(process.env.FFMPEG_BIN||'ffmpeg',['-y','-f','rawvideo','-pix_fmt','rgba','-s',`${width}x${height}`,'-r',String(fps||24),'-i','pipe:0','-an','-c:v','libx264','-pix_fmt','yuv420p','-movflags','+faststart',out],{stdio:['pipe','ignore','pipe']});
  let err='';ff.stderr.on('data',d=>err+=d.toString());ff.on('error',reject);ff.on('close',code=>code===0?resolve(out):reject(Error(`FFMPEG_FAILED:${err.slice(-500)}`)));
  try{for(const b64 of frames)ff.stdin.write(Buffer.from(b64,'base64'));ff.stdin.end()}catch(e){ff.kill();reject(e)}
});

const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type,X-Client-Key,Authorization','Access-Control-Allow-Methods':'GET,POST,OPTIONS'});res.end(JSON.stringify(data));};
const body=req=>new Promise((resolve,reject)=>{let s='';req.on('data',c=>s+=c);req.on('end',()=>{try{resolve(s?JSON.parse(s):{})}catch(e){reject(e)}})});
const auth=(req,res)=>{if(clientKey&&req.headers['x-client-key']!==clientKey){json(res,401,{error:'UNAUTHORIZED'});return false}return true};
const isAdmin=(p)=>!!p&&(!adminChatId||String(p.chatId||p.from?.id)===String(adminChatId))&&((p.email||'').toLowerCase()===adminEmail||String(p.chatId||p.from?.id)===String(adminChatId));
const inferPlan=(request)=>{
  const x=String(request||'').toLowerCase();
  let target='all';
  if(/telegram|bot|webhook/.test(x))target='telegram';
  else if(/kamera|camera|fov|kadr/.test(x))target='camera';
  else if(/yorug|lighting|chiroq|nur/.test(x))target='lighting';
  else if(/personaj|character|qahramon|yuz|soch|kiyim/.test(x))target='character';
  else if(/scene|sahna/.test(x))target='scene';
  else if(/shot/.test(x))target='shot';
  else if(/render|mp4|video/.test(x))target='render';
  else if(/ssenariy|script|dialog/.test(x))target='script';
  const action=/taqiql|qilma|bo'lmasin/.test(x)?'forbid':/saqla|saqlansin|o'zgarmasin/.test(x)?'preserve':'require';
  return {id:randomUUID(),request,target,action,requiresApproval:true,createdAt:new Date().toISOString(),
    reason:`${target} qatlamiga deklarativ qoida qo‘shiladi. Bu jarayon manba kodini o‘zgartirmaydi.`};
};
const sendTelegram=async(chatId,text)=>{
  if(!telegramToken)throw Error('TELEGRAM_BOT_TOKEN_NOT_CONFIGURED');
  const r=await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chatId,text,parse_mode:'HTML'})});
  return r.json();
};
const adminReply=async(chatId,text)=>sendTelegram(chatId,text);

async function handleTelegramMessage(message){
  const chatId=String(message?.chat?.id||''); const text=String(message?.text||'').trim();
  if(!chatId)return;
  const authorized=adminChatId?chatId===String(adminChatId):false;
  if(text==='/admin'){
    if(!authorized){await adminReply(chatId,'⛔ Admin ruxsati yo‘q.');return;}
    adminSessions.set(chatId,{stage:'awaiting_request'});
    await adminReply(chatId,'<b>ADMIN MODE</b>\\nQanday o‘zgarish yoki qoida qo‘shamiz? Masalan: “Har bir shotda personaj ko‘rinishi saqlansin”.\\n\\nMen avval qaysi qatlam/funksiyaga taalluqli ekanini va qanday qoida qo‘shilishini aytaman. <b>Siz TASDIQLAMAGUNCHA hech qanday kod o‘zgarmaydi.</b>');
    return;
  }
  const session=adminSessions.get(chatId);
  if(authorized&&session?.stage==='awaiting_request'){
    const plan=inferPlan(text);adminSessions.set(chatId,{stage:'awaiting_approval',plan});
    await adminReply(chatId,`<b>O‘zgarish rejasi</b>\\n• Qatlam: <b>${plan.target}</b>\\n• Amal: <b>${plan.action}</b>\\n• So‘rov: ${plan.request}\\n\\nBu faqat konfiguratsion qoida bo‘ladi. Manba kodiga tegilmaydi.\\n\\nTasdiqlaysizmi? <b>HA</b> / <b>YO‘Q</b>`);
    return;
  }
  if(authorized&&session?.stage==='awaiting_approval'){
    if(/^(ha|tasdiq|tasdiqlayman|yes)$/i.test(text)){
      rules.push({...session.plan,active:true});
      adminSessions.delete(chatId);
      await adminReply(chatId,`✅ Qoida tasdiqlandi va ishchi rule engine'ga qo‘shildi.\\nID: <code>${session.plan.id}</code>\\nKod o‘zgartirilmadi.`);
    }else if(/^(yo'q|yo‘q|yoq|bekor)$/i.test(text)){
      adminSessions.delete(chatId);await adminReply(chatId,'❌ Bekor qilindi. Kod ham, qoida ham o‘zgartirilmadi.');
    }else await adminReply(chatId,'Avval <b>HA</b> yoki <b>YO‘Q</b> deb tasdiqlang.');
    return;
  }
  // Universal bot command bridge.
  if(/^\/kino(?:\s+|$)/i.test(text)){
    const prompt=text.replace(/^\/kino\s*/i,'').trim();
    const job={jobId:randomUUID(),status:'queued',createdAt:new Date().toISOString(),chatId,script:prompt};
    jobs.set(job.jobId,job);
    await adminReply(chatId,`🎬 Kino topshirig‘i qabul qilindi.\nJob: <code>${job.jobId}</code>\nStatus: QUEUED`);
  }
}

const server=http.createServer(async(req,res)=>{
  if(req.method==='OPTIONS'){json(res,204,{});return}
  try{
    if(req.url==='/health'){json(res,200,{ok:true,service:'Kino AI Studio API',engine:'own-software-3d',rules:rules.length,jobs:jobs.size});return}
    if(req.url==='/jobs'&&req.method==='POST'){
      if(!auth(req,res))return;const p=await body(req);const job={jobId:randomUUID(),status:'queued',accepted:true,projectId:p.projectId,script:p.script||'',shots:p.shots||[],createdAt:new Date().toISOString()};
      jobs.set(job.jobId,job);json(res,202,job);return;
    }
    if(req.url.startsWith('/jobs/')&&req.method==='GET'){
      if(!auth(req,res))return;const id=req.url.split('/')[2];const job=jobs.get(id);if(!job)return json(res,404,{error:'JOB_NOT_FOUND'});json(res,200,job);return;
    }
    if(req.url==='/ai/script'&&req.method==='POST'){
      if(!auth(req,res))return;if(!openrouterKey)return json(res,503,{error:'OPENROUTER_NOT_CONFIGURED'});
      const p=await body(req);const r=await fetch('https://openrouter.ai/api/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${openrouterKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:p.model||'openai/gpt-4o-mini',messages:p.messages||[{role:'user',content:p.prompt||''}],temperature:.65})});
      const j=await r.json();json(res,r.status,j);return;
    }

    if(req.url==='/render/encode'&&req.method==='POST'){
      if(!auth(req,res))return;
      const p=await body(req);
      if(!p.width||!p.height||!p.frames?.length)return json(res,400,{error:'FRAMES_REQUIRED'});
      try{const output=await encodeRawFrames(p);json(res,200,{ok:true,status:'ready',videoPath:output,frameCount:p.frames.length,fps:p.fps||24});}
      catch(e){json(res,500,{ok:false,status:'failed',error:String(e?.message||e)})}
      return;
    }
    if(req.url==='/telegram/send'&&req.method==='POST'){
      if(!auth(req,res))return;const p=await body(req);if(!telegramToken)return json(res,503,{error:'TELEGRAM_BOT_TOKEN_NOT_CONFIGURED'});
      const r=await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:p.chatId,text:p.text,parse_mode:'HTML'})});
      json(res,r.status,await r.json());return;
    }
    if(req.url==='/telegram/webhook'&&req.method==='POST'){
      if(webhookSecret&&req.headers['x-telegram-bot-api-secret-token']!==webhookSecret)return json(res,401,{error:'INVALID_WEBHOOK_SECRET'});
      const p=await body(req);await handleTelegramMessage(p?.message||{});json(res,200,{ok:true,received:true});return;
    }
    if(req.url==='/admin/command'&&req.method==='POST'){
      if(!auth(req,res))return;const p=await body(req);
      if(!isAdmin(p))return json(res,403,{error:'ADMIN_ONLY'});
      if(p.command==='/admin'){adminSessions.set(String(p.chatId),{stage:'awaiting_request'});return json(res,200,{ok:true,next:'awaiting_request',message:'Qaysi qoida yoki funksiyani o‘zgartiramiz?'})}
      const plan=inferPlan(p.command);json(res,200,{ok:true,plan,requiresApproval:true});return;
    }
    if(req.url==='/admin/rules'&&req.method==='GET'){
      if(!auth(req,res))return;json(res,200,{rules});return;
    }
    json(res,404,{error:'NOT_FOUND'});
  }catch(e){json(res,500,{error:String(e?.message||e)})}
});
server.listen(port,()=>console.log(`Kino AI Studio API listening on ${port}`));
