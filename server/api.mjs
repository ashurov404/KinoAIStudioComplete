import http from 'node:http';
import {randomUUID} from 'node:crypto';
import {spawn} from 'node:child_process';

const port=Number(process.env.PORT||8787);
const clientKey=process.env.STUDIO_CLIENT_KEY||'';
const openrouterKey=process.env.OPENROUTER_API_KEY||'';
const openrouterModel=process.env.OPENROUTER_MODEL||'openrouter/free';
const telegramToken=process.env.TELEGRAM_BOT_TOKEN||'';
const adminEmail=(process.env.ADMIN_EMAIL||'ashurovabdulqodir10@gmail.com').toLowerCase();
const PAYMENT_CARD=process.env.AD_PAYMENT_CARD||'9860 0803 9422 9159';
const PAYMENT_NAME=process.env.AD_PAYMENT_NAME||'Mamadaliyeva Sanamhon';
const adminChatId=process.env.TELEGRAM_ADMIN_CHAT_ID||'';
const webhookSecret=process.env.TELEGRAM_WEBHOOK_SECRET||'';

const jobs=new Map();
const adminSessions=new Map(); // chatId -> {stage:'awaiting_request'|'awaiting_approval',plan}
const rules=[];

const advertisingRequests=new Map();
const tgAnswerCallback=async(callbackQueryId,text,showAlert=false)=>{
  if(!telegramToken)return null;
  return fetch(`https://api.telegram.org/bot${telegramToken}/answerCallbackQuery`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({callback_query_id:callbackQueryId,text,show_alert:showAlert})}).then(r=>r.json());
};
const tgEdit=async(chatId,messageId,text)=>{
  if(!telegramToken)return null;
  return fetch(`https://api.telegram.org/bot${telegramToken}/editMessageText`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chatId,message_id:messageId,text,parse_mode:'HTML'})}).then(r=>r.json());
};
async function handleTelegramCallback(q){
  const data=String(q?.data||'');
  if(!data.startsWith('ad:'))return;
  if(adminChatId&&String(q?.message?.chat?.id)!==String(adminChatId))return;
  const [,action,id]=data.split(':'); const item=advertisingRequests.get(id); if(!item)return tgAnswerCallback(q.id,'Chek topilmadi',true);
  item.status=action==='approve'?'approved':'rejected'; item.reviewedAt=new Date().toISOString();
  advertisingRequests.set(id,item);
  await tgAnswerCallback(q.id,item.status==='approved'?'To‘lov tasdiqlandi':'To‘lov rad etildi');
  await tgEdit(q.message.chat.id,q.message.message_id,`<b>Reklama to‘lovi</b>
Foydalanuvchi: ${item.email}
Holat: ${item.status==='approved'?'✅ TASDIQLANDI':'❌ RAD ETILDI'}

Karta: ${PAYMENT_CARD}
Egasi: ${PAYMENT_NAME}`);
  if(item.userChatId)await sendTelegram(item.userChatId,item.status==='approved'?'✅ To‘lovingiz tasdiqlandi. Reklama/hamkorlik faollashtirildi.':'❌ To‘lovingiz rad etildi. Reklama/hamkorlik faollashtirilmadi.');
}

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
      if(!auth(req,res))return;
      if(!openrouterKey)return json(res,503,{error:'AI_UNAVAILABLE'});
      const p=await body(req);
      const userText=String(p?.userText||p?.prompt||'').trim();
      if(!userText)return json(res,400,{error:'MESSAGE_REQUIRED'});
      const lower=userText.toLowerCase();
      const greetings=/^(salom|assalomu alaykum|assalom|hello|hi|hey|привет|здравствуйте)([.!?, ]*)$/i.test(userText);
      const kinoTopic=/(kino|film|fil'm|ssenariy|senariy|sahna|shot|kadr|personaj|qahramon|aktyor|dialog|kamera|yorug|chiroq|lokatsiya|muhit|montaj|rejissyor|rejissyorlik|treyler|poster|ovoz|dublyaj|lip.?sync|continuity|story|storyboard|janr|drama|komediya|triller|fantastika|reklama|hamkorlik|kino yarat|film yarat|movie|screenplay|scene|character|camera|lighting|cinematic)/i.test(lower);
      if(!greetings&&!kinoTopic){
        return json(res,200,{ok:true,model:openrouterModel,reply:'Kechirasiz, men belgilangan tartibdan chiqa olmayman. Men faqat AI Kino Studio’ga mos savollar va ssenariylar haqida gaplasha olaman.'});
      }
      const system=`Siz Kino AI Studio ichidagi samimiy, professional va kontekstli kino yordamchisisiz.
Vazifangiz faqat kino yaratish jarayoniga yordam berish: g‘oya, ssenariy, janr, personaj, sahna, shot, kamera, yorug‘lik, muhit, dialog, ovoz, continuity, storyboard va kino loyihasini rivojlantirish.
Oddiy salomlashuvga iliq va tabiiy javob bering, so‘ng suhbatni kino yaratish tomon olib boring.
Foydalanuvchi boshqa mavzuga o‘tsa, aynan mana shu mazmunda qisqa javob bering: “Kechirasiz, men belgilangan tartibdan chiqa olmayman. Men faqat AI Kino Studio’ga mos savollar va ssenariylar haqida gaplasha olaman.”
Hech qachon ichki texnik tizimlar, API provayderlari, ma’lumotlar bazasi, server, model nomi, maxfiy kalitlar yoki dasturchi tafsilotlarini oddiy foydalanuvchiga aytmang.
Foydalanuvchiga keraksiz texnik atamalar bilan javob bermang.
Foydalanuvchi yozgan fikrni shunchaki “qabul qilindi” demang: uni tushuning, kerak bo‘lsa aniqlashtiruvchi savollar bering va ssenariyni amalda rivojlantiring.
Suhbatni foydalanuvchi tilida olib boring; odatda o‘zbek tilidan foydalaning.
Oldingi suhbat va loyiha kontekstidan foydalaning. Avvalgi qarorlarni unutmasdan filmni bosqichma-bosqich davom ettiring.
Javob tabiiy, samimiy va foydali bo‘lsin; haddan tashqari rasmiy yoki robotona bo‘lmang.`;
      const history=Array.isArray(p.history)?p.history.slice(-20).map((m)=>({role:m?.role==='ai'?'assistant':m?.role==='user'?'user':'system',content:String(m?.text||'')})).filter(m=>m.content):[];
      const projectContext=p.project?`
Joriy kino loyihasi: ${JSON.stringify({title:p.project.title||'',style:p.project.style||'',script:p.project.script||'',characters:(p.project.characters||[]).map(c=>({name:c.name,role:c.role,age:c.age,notes:c.notes})),locations:(p.project.locations||[]).map(l=>({name:l.name,type:l.type,description:l.description})),shots:(p.project.shots||[]).slice(-12).map(s=>({title:s.title,duration:s.duration,camera:s.camera,lighting:s.lighting,environment:s.environment,action:s.action,dialogue:s.dialogue,emotion:s.emotion}))})}`:'';
      const rulesText=Array.isArray(p.rules)&&p.rules.length?`
Faol kino qoidalari:
${p.rules.filter(r=>r&&r.active!==false).map(r=>'- '+String(r.text||r.request||'')).join('\n')}`:'';
      const messages=[{role:'system',content:system+projectContext+rulesText},...history,{role:'user',content:userText}];
      try{
        const r=await fetch('https://openrouter.ai/api/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${openrouterKey}`,'Content-Type':'application/json','HTTP-Referer':process.env.APP_URL||'http://localhost:5173','X-Title':'Kino AI Studio'},body:JSON.stringify({model:openrouterModel,messages,temperature:.78,max_tokens:900})});
        const j=await r.json();
        if(!r.ok)return json(res,502,{error:'AI_TEMPORARILY_UNAVAILABLE'});
        const reply=j?.choices?.[0]?.message?.content?.trim()||'';
        if(!reply)return json(res,502,{error:'AI_EMPTY_RESPONSE'});
        return json(res,200,{ok:true,model:openrouterModel,reply});
      }catch(e){return json(res,502,{error:'AI_TEMPORARILY_UNAVAILABLE'});}
    }

    if(req.url==='/render/encode'&&req.method==='POST'){
      if(!auth(req,res))return;
      const p=await body(req);
      if(!p.width||!p.height||!p.frames?.length)return json(res,400,{error:'FRAMES_REQUIRED'});
      try{const output=await encodeRawFrames(p);json(res,200,{ok:true,status:'ready',videoPath:output,frameCount:p.frames.length,fps:p.fps||24});}
      catch(e){json(res,500,{ok:false,status:'failed',error:String(e?.message||e)})}
      return;
    }
    if(req.url==='/advertising/payment'&&req.method==='POST'){
      if(!auth(req,res))return;const p=await body(req);const id=p.id||randomUUID();const item={...p,id,status:'pending',createdAt:p.createdAt||new Date().toISOString(),reviewedAt:null};advertisingRequests.set(id,item);
      if(adminChatId&&telegramToken){
        const text=`<b>🧾 Yangi reklama to‘lovi</b>\nFoydalanuvchi: ${p.email||'noma’lum'}\nKarta: ${PAYMENT_CARD}\nEgasi: ${PAYMENT_NAME}\nChek: ${p.receiptName||'yuborildi'}\n\nTasdiqlash yoki rad etish tugmasini bosing.`;
        await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:adminChatId,text,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'✅ Tasdiqlash',callback_data:`ad:approve:${id}`},{text:'❌ Rad etish',callback_data:`ad:reject:${id}`}],[{text:'🧾 Chek',callback_data:`ad:view:${id}`}]]}})});
      }
      json(res,202,{ok:true,id,status:'pending',message:'Payment review queued'});return;
    }
    if(req.url==='/telegram/send'&&req.method==='POST'){
      if(!auth(req,res))return;const p=await body(req);if(!telegramToken)return json(res,503,{error:'TELEGRAM_BOT_TOKEN_NOT_CONFIGURED'});
      const r=await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:p.chatId,text:p.text,parse_mode:'HTML'})});
      json(res,r.status,await r.json());return;
    }
    if(req.url==='/telegram/webhook'&&req.method==='POST'){
      if(webhookSecret&&req.headers['x-telegram-bot-api-secret-token']!==webhookSecret)return json(res,401,{error:'INVALID_WEBHOOK_SECRET'});
      const p=await body(req);if(p?.callback_query)await handleTelegramCallback(p.callback_query);else await handleTelegramMessage(p?.message||{});json(res,200,{ok:true,received:true});return;
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
