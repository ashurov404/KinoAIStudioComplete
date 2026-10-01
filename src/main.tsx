import React,{useEffect,useMemo,useRef,useState}from'react';
import{createRoot}from'react-dom/client';
import{createClient}from'@supabase/supabase-js';
import{Film,Clapperboard,Sparkles,Users,FolderKanban,Settings,UserCircle,Shield,Plus,Play,Save,Menu,X,ChevronRight,CheckCircle2,Clock3,Layers3,Wand2,LogOut,MapPin,Bot,Handshake,Bell,CreditCard,Eye,MessageSquare,KeyRound,Check,XCircle,Upload,Send,BookOpen,Info,Mail,Lock,Palette,Globe,Volume2,Copy,Image as ImageIcon}from'lucide-react';
import'./styles.css';
import{postStudioJob}from'./services/studioApi';

const URL=import.meta.env.VITE_SUPABASE_URL||localStorage.getItem('VITE_SUPABASE_URL')||'';
const KEY=import.meta.env.VITE_SUPABASE_ANON_KEY||localStorage.getItem('VITE_SUPABASE_ANON_KEY')||'';
const sb=URL&&KEY?createClient(URL,KEY):null;
const ADMIN='ashurovabdulqodir10@gmail.com';
const createAdminSession=()=>({
  user:{id:'studio-admin-local',email:ADMIN,user_metadata:{full_name:'Administrator',avatar_url:''}},
  email:ADMIN,
  isAdmin:true,
  isLocalAdmin:true
});
const PAYMENT_CARD='9860 0803 9422 9159';
const PAYMENT_NAME='Mamadaliyeva Sanamhon';
const uid=()=>crypto.randomUUID();
const UI_TEXT:any={
  uz:{home:'Bosh sahifa',create:'Kino yaratish',projects:'Loyihalar',integrations:'API ulash',collab:'Hamkorlik',partners:'Hamkorlar / Reklama',profile:'Profil',settings:'Sozlamalar',login:'Kirish',signup:'Ro‘yxatdan o‘tish',logout:'Chiqish',menu:'MENU',online:'AKKAUNT ONLINE',needLogin:'Yaratish uchun akkaunt kerak',account:'AKKAUNT',settingsTitle:'Sozlamalar',profileManage:'Profilni boshqarish',language:'Til',notifications:'Bildirishnomalar',notificationsOn:'Bildirishnomalarni yoqish',appearance:'Ko‘rinish',light:'Yorug‘',dark:'Qorong‘i',system:'Tizim',security:'Xavfsizlik',securityText:'Server maxfiy kalitlari foydalanuvchi interfeysida ko‘rsatilmaydi.',securityManage:'Xavfsizlikni boshqarish',aiVoice:'AI ovozi',aiVoiceText:'AI javoblari va kino dialoglari uchun ovoz profilini tanlang.',neutral:'Oddiy',warm:'Iliq',cinematic:'Kinematik',accountSection:'Akkaunt',save:'Saqlash',cancel:'Bekor qilish',currentPassword:'Joriy parol',newPassword:'Yangi parol',changePassword:'Parolni o‘zgartirish',passwordChanged:'Parol yangilandi.',wrongPassword:'Joriy parol noto‘g‘ri.',passwordLength:'Yangi parol kamida 6 belgidan iborat bo‘lsin.'},
  en:{home:'Home',create:'Create Movie',projects:'Projects',integrations:'API Connect',collab:'Collaboration',partners:'Partners / Ads',profile:'Profile',settings:'Settings',login:'Log in',signup:'Sign up',logout:'Log out',menu:'MENU',online:'ACCOUNT ONLINE',needLogin:'Account required to create',account:'ACCOUNT',settingsTitle:'Settings',profileManage:'Manage profile',language:'Language',notifications:'Notifications',notificationsOn:'Enable notifications',appearance:'Appearance',light:'Light',dark:'Dark',system:'System',security:'Security',securityText:'Server secret keys are never shown in the user interface.',securityManage:'Security settings',aiVoice:'AI voice',aiVoiceText:'Choose the voice profile for AI replies and movie dialogue.',neutral:'Neutral',warm:'Warm',cinematic:'Cinematic',accountSection:'Account',save:'Save',cancel:'Cancel',currentPassword:'Current password',newPassword:'New password',changePassword:'Change password',passwordChanged:'Password updated.',wrongPassword:'Current password is incorrect.',passwordLength:'New password must be at least 6 characters.'},
  ru:{home:'Главная',create:'Создать кино',projects:'Проекты',integrations:'API подключение',collab:'Сотрудничество',partners:'Партнёры / Реклама',profile:'Профиль',settings:'Настройки',login:'Войти',signup:'Регистрация',logout:'Выйти',menu:'МЕНЮ',online:'АККАУНТ ONLINE',needLogin:'Для создания нужен аккаунт',account:'АККАУНТ',settingsTitle:'Настройки',profileManage:'Управление профилем',language:'Язык',notifications:'Уведомления',notificationsOn:'Включить уведомления',appearance:'Вид',light:'Светлая',dark:'Тёмная',system:'Система',security:'Безопасность',securityText:'Секретные серверные ключи не отображаются в интерфейсе пользователя.',securityManage:'Настройки безопасности',aiVoice:'Голос AI',aiVoiceText:'Выберите голосовой профиль для ответов AI и диалогов фильма.',neutral:'Нейтральный',warm:'Тёплый',cinematic:'Кинематографичный',accountSection:'Аккаунт',save:'Сохранить',cancel:'Отмена',currentPassword:'Текущий пароль',newPassword:'Новый пароль',changePassword:'Изменить пароль',passwordChanged:'Пароль обновлён.',wrongPassword:'Текущий пароль неверен.',passwordLength:'Новый пароль должен содержать минимум 6 символов.'}
};
const getLang=()=>read('kino_settings',{language:'uz'}).language||'uz';
const T=(key:string,lang=getLang())=>UI_TEXT[lang]?.[key]??UI_TEXT.uz[key]??key;
const read=(k:string,d:any)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const write=(k:string,v:any)=>localStorage.setItem(k,JSON.stringify(v));

type Character={id:string;name:string;role:string;height:number;skin:string;hair:string;cloth:string;accent:string;face:string;voice:string;gender:string;age:number;notes:string};
type Shot={id:string;title:string;duration:number;camera:string;lighting:string;environment:string;action:string;dialogue:string;emotion:string;characterIds:string[];locationId?:string};
type Location={id:string;name:string;type:string;description:string;public:boolean};
type Project={id:string;title:string;style:string;status:string;script:string;characters:Character[];locations:Location[];shots:Shot[];createdAt:string;ownerName?:string;ownerEmail?:string;public?:boolean;videoUrl?:string};
type Rule={id:string;text:string;active:boolean;createdAt:string};
type Payment={id:string;email:string;kind:'advertising'|'collaboration';amount:string;status:'pending'|'approved'|'rejected';receiptName:string;createdAt:string;note?:string};

const newChar=(name='Sardor'):Character=>({id:uid(),name,role:'Bosh qahramon',height:1.72,skin:'#b97852',hair:'#17191f',cloth:'#26334b',accent:'#d98d4d',face:'natural',voice:(read('kino_settings',{aiVoice:'neutral'}).aiVoice||'neutral'),gender:'male',age:25,notes:''});
const starter=():Project=>{const c=newChar();const l={id:uid(),name:'Asosiy lokatsiya',type:'cinematic',description:'Ssenariy asosida yaratiladigan muhit.',public:false};return{id:uid(),title:'Yangi kino',style:'Photorealistic Cinematic',status:'draft',script:'',characters:[c],locations:[l],shots:[],createdAt:new Date().toISOString(),public:false}};

function analyzeScript(text:string,p:Project){
 const clean=text.trim(); if(!clean)return p;
 const sentences=clean.split(/(?<=[.!?])\s+/).filter(Boolean);
 const chars=p.characters.length?p.characters:[newChar()];
 const loc=p.locations[0]||{id:uid(),name:'Asosiy lokatsiya',type:'cinematic',description:'',public:false};
 const shots=sentences.slice(0,30).map((s,i)=>({id:uid(),title:`${String(i+1).padStart(2,'0')} — ${s.slice(0,50)}`,duration:Math.max(3,Math.min(20,Math.round(4+s.length/45))),camera:['24mm · wide · dolly','50mm · medium · tracking','85mm · close-up · orbit'][i%3],lighting:'Key + fill + rim · volumetric',environment:loc.name,action:s,dialogue:'',emotion:['neutral','curious','tense','hopeful'][i%4],characterIds:chars.map(c=>c.id),locationId:loc.id}));
 return {...p,script:clean,status:'analyzed',shots};
}

function App(){
 const[page,setPage]=useState('home'),[open,setOpen]=useState(false),[session,setSession]=useState<any>(null),[project,setProject]=useState<Project>(()=>read('kino_active_project',starter())),[projects,setProjects]=useState<Project[]>([]),[script,setScript]=useState(''),[saved,setSaved]=useState(false),[authMode,setAuthMode]=useState<'login'|'signup'>('login'),[email,setEmail]=useState(''),[pass,setPass]=useState(''),[fullName,setFullName]=useState(''),[nickname,setNickname]=useState(''),[avatar,setAvatar]=useState(''),[verifyCode,setVerifyCode]=useState(''),[msg,setMsg]=useState(''),[isAdmin,setIsAdmin]=useState(false),[rules,setRules]=useState<Rule[]>(()=>read('kino_rules',[])),[config,setConfig]=useState<any>(()=>read('kino_config',{})),[theme,setTheme]=useState(()=>read('kino_settings',{language:'uz',notifications:true,theme:'dark'}).theme||'light'),[language,setLanguage]=useState(()=>getLang());
 useEffect(()=>{
   const local=localStorage.getItem('kino_session');
   if(local){setSession(JSON.parse(local));}
   else{
     const admin=createAdminSession();
     localStorage.setItem('kino_session',JSON.stringify(admin));
     setSession(admin);
   }
   if(sb){
     sb.auth.getSession().then(({data})=>{
       if(data.session && data.session.user?.email?.toLowerCase()===ADMIN)setSession(data.session);
     });
     const sub=sb.auth.onAuthStateChange((_e,s)=>{
       if(s?.user?.email?.toLowerCase()===ADMIN)setSession(s);
       else if(!s && localStorage.getItem('kino_session'))setSession(JSON.parse(localStorage.getItem('kino_session')!));
     });
     return()=>sub.data.subscription.unsubscribe()
   }
 },[]);
 useEffect(()=>{const prefs=read('kino_settings',{theme:'dark',language:'uz'});const t=prefs.theme==='system'?(window.matchMedia?.('(prefers-color-scheme: dark)').matches?'dark':'light'):prefs.theme||'light';setTheme(t);setLanguage(prefs.language||'uz');document.documentElement.dataset.theme=t;document.documentElement.lang=prefs.language||'uz';
   const onSettings=(e:any)=>{const d=e.detail||{};if(d.language){setLanguage(d.language);document.documentElement.lang=d.language;}if(d.theme){setTheme(d.theme);document.documentElement.dataset.theme=d.theme;}if(d.aiVoice){setProject((prev:any)=>({...prev,characters:(prev.characters||[]).map((c:any)=>({...c,voice:d.aiVoice}))}));}};
   window.addEventListener('kino-settings-change',onSettings);return()=>window.removeEventListener('kino-settings-change',onSettings);
 },[]);
 useEffect(()=>{document.documentElement.dataset.theme=theme;},[theme]);
 useEffect(()=>{if(project?.id)write('kino_active_project',project);},[project]);
 useEffect(()=>{if(session){setIsAdmin((session.user?.email||session.email||'').toLowerCase()===ADMIN||!!session.isAdmin);loadProjects();(async()=>{if(sb&&session.user?.id&&!session.isLocalAdmin){const{data}=await sb.from('studio_profiles').select('*').eq('studio_user_id',session.user.id).maybeSingle();if(data){setFullName(data.studio_full_name||'');setNickname(data.studio_username||'');setAvatar(data.studio_avatar_data||'');setSession((x:any)=>x?{...x,user:{...x.user,user_metadata:{...(x.user?.user_metadata||{}),full_name:data.studio_full_name,avatar_url:data.studio_avatar_data}}}:x)}}})()}},[session?.user?.id]);
 useEffect(()=>{const protectedPages=['create','projects','integrations','collab','partners','settings'];if(protectedPages.includes(page)&&!session)setPage('home')},[page,session]);
 async function loadProjects(){if(session?.isLocalAdmin){setProjects(read('kino_local_projects',[]));return}if(!sb||!session?.user?.id){setProjects(read('kino_local_projects',[]));return}const{data}=await sb.from('studio_projects').select('*').eq('studio_owner_id',session.user.id).order('studio_created_at',{ascending:false});const base=(data||[]).map((p:any)=>({...starter(),id:p.studio_project_id,title:p.studio_name,status:p.studio_status,script:p.studio_description||'',createdAt:p.studio_created_at,ownerName:p.studio_owner_name,ownerEmail:p.studio_owner_email,public:p.studio_public}));const{data:ctx}=await sb.from('studio_project_context').select('studio_project_id,studio_context').eq('studio_user_id',session.user.id);const byId:any={};(ctx||[]).forEach((x:any)=>{if(x.studio_context?.project)byId[x.studio_project_id]=x.studio_context.project});setProjects(base.map((p:any)=>byId[p.id]?{...p,...byId[p.id]}:p));}
 async function save(){const u=session?.user||session;const item={...project,script,ownerName:u?.user_metadata?.full_name||u?.name||u?.email,ownerEmail:u?.email};const arr=read('kino_local_projects',[]);write('kino_local_projects',[item,...arr.filter((x:any)=>x.id!==item.id)]);setProjects([item,...arr.filter((x:any)=>x.id!==item.id)]);if(sb&&u?.id&&!session?.isLocalAdmin){await sb.from('studio_projects').upsert({studio_project_id:item.id,studio_owner_id:u.id,studio_name:item.title,studio_description:item.script,studio_status:item.status,studio_created_at:item.createdAt,studio_updated_at:new Date().toISOString(),studio_public:item.public??false,studio_owner_name:item.ownerName,studio_owner_email:item.ownerEmail});await sb.from('studio_project_context').upsert({studio_project_id:item.id,studio_user_id:u.id,studio_script:item.script,studio_context:{project:item},studio_updated_at:new Date().toISOString()});}setSaved(true);setTimeout(()=>setSaved(false),1200)}
 async function auth(){
   if(email.trim().toLowerCase()===ADMIN){
     const admin=createAdminSession();
     localStorage.setItem('kino_session',JSON.stringify(admin));
     setSession(admin);setIsAdmin(true);setMsg('Administrator rejimi faol.');return;
   }
   if(!email||pass.length<6){setMsg('Email va kamida 6 belgili parol kiriting.');return}
   if(authMode==='signup' && !fullName.trim()){setMsg('Avval ismingizni kiriting.');return}
   if(sb){
     if(authMode==='signup'){
       const r=await sb.auth.signUp({email,password:pass,options:{data:{full_name:fullName.trim(),username:nick}}});
       if(r.error){setMsg(r.error.message);return}
       if(r.data.user){
         if(avatar) await sb.from('studio_profiles').upsert({studio_user_id:r.data.user.id,studio_full_name:fullName.trim(),studio_avatar_data:avatar,studio_email:email});
         else await sb.from('studio_profiles').upsert({studio_user_id:r.data.user.id,studio_full_name:fullName.trim(),studio_email:email});
       }
       if(r.data.session){setSession(r.data.session);setMsg('Akkaunt yaratildi.')}
       else setMsg('Email tasdiqlash kodi yuborildi. Emailingizni tasdiqlab, keyin kiring.');
     }else{
       const r=await sb.auth.signInWithPassword({email,password:pass});
       if(r.error){setMsg(r.error.message);return}
       setSession(r.data.session);
     }
     return;
   }
   const users=read('kino_local_users',[]);let u=users.find((x:any)=>x.email===email);
   if(authMode==='signup'){
     if(u){setMsg('Bu email allaqachon mavjud.');return}
     u={id:uid(),email,password:pass,name:fullName.trim(),avatar,isAdmin:email.toLowerCase()===ADMIN,verified:false};
     write('kino_local_users',[...users,u]);const code=String(Math.floor(100000+Math.random()*900000));write('kino_pending_verify',{email,code,name:fullName.trim(),avatar});setMsg(`Tasdiqlash kodi: ${code}`);return
   }else if(!u||u.password!==pass){setMsg('Email yoki parol noto‘g‘ri.');return}
   const sess={user:{id:u.id,email:u.email,user_metadata:{full_name:u.name,avatar_url:u.avatar}},email:u.email,isAdmin:u.isAdmin};
   write('kino_session',sess);setSession(sess);
 } 
 async function verifyEmail(){if(!verifyCode.trim()){setMsg('Emailga kelgan tasdiqlash kodini kiriting.');return false}if(!sb){const p=read('kino_pending_verify',null);if(!p||p.email!==email||p.code!==verifyCode.trim()){setMsg('Tasdiqlash kodi noto‘g‘ri.');return false}const users=read('kino_local_users',[]).map((u:any)=>u.email===email?{...u,verified:true,avatar}:u);write('kino_local_users',users);const u=users.find((x:any)=>x.email===email);const sess={user:{id:u.id,email:u.email,user_metadata:{full_name:u.name,avatar_url:u.avatar}},email:u.email,isAdmin:u.isAdmin};write('kino_session',sess);setSession(sess);localStorage.removeItem('kino_pending_verify');return true} const r=await sb.auth.verifyOtp({email,token:verifyCode.trim(),type:'signup'});if(r.error){setMsg(r.error.message);return false}setSession(r.data.session);if(r.data.user)await sb.from('studio_profiles').upsert({studio_user_id:r.data.user.id,studio_full_name:fullName.trim(),studio_email:email,studio_avatar_data:avatar||null});return true}
 function logout(){
   if(session?.isLocalAdmin){
     const admin=createAdminSession();
     localStorage.setItem('kino_session',JSON.stringify(admin));
     setSession(admin);setIsAdmin(true);setPage('home');return;
   }
   localStorage.removeItem('kino_session');sb?.auth.signOut();setSession(null);setIsAdmin(false);setPage('home')
 }
 const go=(n:string)=>{setPage(n);setOpen(false)};
 const nav:any[]=[['home',T('home',language),Clapperboard],['create',T('create',language),Film],['projects',T('projects',language),FolderKanban],['integrations',T('integrations',language),Bot],['collab',T('collab',language),Handshake],['partners',T('partners',language),CreditCard],['profile',T('profile',language),UserCircle],['settings',T('settings',language),Settings]];
 return <div className="app"><aside className={'side '+(open?'open':'')}><div className="brand"><div className="logo"><Film/></div><b>KINO AI<small>STUDIO</small></b><button className="icon mobileX" onClick={()=>setOpen(false)}><X/></button></div><div className="label">{T('menu',language)}</div>{nav.map(([n,t,I])=><button key={n} className={'nav '+(page===n?'sel':'')} onClick={()=>{if(n!=='home'&&!session){go('profile');setMsg('Bu bo‘lim uchun ro‘yxatdan o‘ting yoki tizimga kiring.')}else go(n)}}><I size={18}/><span>{t}</span>{page===n&&<ChevronRight size={14}/>}</button>)}<div className="bottom">{session?<button className="nav" onClick={logout}><LogOut size={18}/><span>{T('logout',language)}</span></button>:<div className="online">● KIRISH KERAK<small>{T('needLogin',language)}</small></div>}</div></aside><main><header><button className="icon menu" onClick={()=>setOpen(true)}><Menu/></button><span>KINO AI STUDIO / {nav.find(x=>x[0]===page)?.[1]||T('home',language)}</span><div>{session?<em>● {isAdmin?'ADMIN':'AKKAUNT'} ONLINE</em>:<><button className="ghost" onClick={()=>go('profile')}>{T('login',language)}</button><button className="primary sm" onClick={()=>{setAuthMode('signup');go('profile')}}>{T('signup',language)}</button></>}</div></header>
 {page==='home'&&<Home go={go} session={session}/>} 
 {page==='create'&&<Create project={project} setProject={setProject} script={script} setScript={setScript} save={save} saved={saved} config={config} setPage={go} session={session} isAdmin={isAdmin}/>} 
 {page==='projects'&&<Projects projects={projects} setProject={(p:any)=>{setProject(p);write('kino_active_project',p)}} go={go}/>} 
 
 {page==='integrations'&&<Integrations/>} {page==='collab'&&<Collab go={go}/>} {page==='partners'&&<Partners go={go}/>} {page==='profile'&&<Profile session={session} mode={authMode} setProject={setProject} setMode={setAuthMode} email={email} setEmail={setEmail} pass={pass} setPass={setPass} fullName={fullName} setFullName={setFullName} nickname={nickname} setNickname={setNickname} avatar={avatar} setAvatar={setAvatar} verifyCode={verifyCode} setVerifyCode={setVerifyCode} verifyEmail={verifyEmail} msg={msg} auth={auth} projects={projects} go={go}/>} {page==='settings'&&<SettingsPage session={session} logout={logout} setAuthMode={setAuthMode} go={go} language={language}/>}
 </main><nav className="mobileNav">{nav.slice(0,5).map(([n,t,I]:any,i:number)=><button key={n} className={(page===n?'active ':'')+(n==='create'?'createMobile':'')} onClick={()=>{if(n!=='home'&&!session){go('profile');setMsg('Bu bo‘lim uchun ro‘yxatdan o‘ting yoki tizimga kiring.')}else go(n)}}><I/><span>{t}</span></button>)}</nav></div>
}

function Home({go,session}:any){return <div className="page studioDashboard"><section className="hero studioHero"><div className="heroText"><div className="eyebrow">KINO AI STUDIO · CREATOR PLATFORM</div><h1>G‘oyangizni<br/><span>kinoga aylantiring.</span></h1><p>AI bilan ssenariy yozing, qahramonlarni yarating, kadrlarni rejalashtiring va loyihangizni bitta professional kino studiyasida boshqaring.</p><div className="heroActions">{session?<button className="primary" onClick={()=>go('create')}><Sparkles size={17}/> Kino yaratishni boshlash <ChevronRight size={16}/></button>:<><button className="primary" onClick={()=>go('profile')}><UserCircle size={17}/> Boshlash</button><button className="ghost" onClick={()=>go('profile')}><KeyRound size={17}/> Kirish</button></>}</div><div className="heroMeta"><span><span className="liveDot"/> AI Studio online</span><span>•</span><span>3D cinematic workflow</span><span>•</span><span>Creative workspace</span></div></div><div className="heroVisual"><img src="/kino-studio-placeholder.svg" alt="Kino AI Studio cinematic preview"/><div className="heroVisualShade"/><div className="heroVisualBadge"><Clapperboard size={15}/><span><b>AI CINEMA</b><small>Studio preview</small></span></div><div className="heroPlay"><Play size={20}/></div></div></section><section className="studioQuick"><button className="studioQuickCard" onClick={()=>go('create')}><span className="quickIcon"><Sparkles/></span><span><b>AI Ssenariy</b><small>G‘oyadan professional ssenariygacha</small></span><ChevronRight/></button><button className="studioQuickCard" onClick={()=>go('create')}><span className="quickIcon"><Layers3/></span><span><b>Kadr rejasi</b><small>Sahna, kamera va continuity</small></span><ChevronRight/></button><button className="studioQuickCard" onClick={()=>go('create')}><span className="quickIcon"><Film/></span><span><b>Video generatsiya</b><small>Kino loyihasini keyingi bosqichga o‘tkazing</small></span><ChevronRight/></button><button className="studioQuickCard" onClick={()=>go('projects')}><span className="quickIcon"><FolderKanban/></span><span><b>Loyihalar</b><small>Barcha kinolar bitta joyda</small></span><ChevronRight/></button></section><div className="head studioSectionHead"><div><div className="eyebrow">WORKSPACE</div><h2>Kino yaratishning barcha bosqichlari</h2></div><button className="ghost" onClick={()=>go('create')}>Studio'ni ochish <ChevronRight size={15}/></button></div><div className="cards studioFeatureGrid"><div className="card studioFeature"><Sparkles/><b>AI bilan ssenariy</b><p>AI Kino Studio siz bilan suhbatlashib, g‘oyani sahnalar va dialoglarga aylantiradi.</p><span>01</span></div><div className="card studioFeature"><Users/><b>Personajlar</b><p>Reference rasmlar, xarakter, kiyim va identity ma’lumotlarini loyihaga bog‘lang.</p><span>02</span></div><div className="card studioFeature"><Layers3/><b>Sahnalar va kadrlar</b><p>Har bir shot uchun kamera, yorug‘lik, muhit, harakat va emotion rejasini yarating.</p><span>03</span></div><div className="card studioFeature"><Film/><b>Cinematic Studio</b><p>Loyiha, preview, ssenariy va keyingi ishlab chiqarish jarayonini yagona workspace'da boshqaring.</p><span>04</span></div></div><section className="studioBottomGrid"><div className="panel studioManifesto"><div className="eyebrow">YOUR CREATIVE SPACE</div><h3>Oddiy chat emas. Kino studiyasi.</h3><p>Instagram'dagi creator tajribasi, ChatGPT'dagi qulay AI suhbat va zamonaviy AI generatorlarning workflow'ini Kino AI Studio ichida bitta tizimga birlashtiramiz.</p><div className="manifestoTags"><span>AI CHAT</span><span>SCREENPLAY</span><span>STORYBOARD</span><span>PROJECTS</span><span>3D CINEMA</span></div></div><div className="panel studioProjectPreview"><div className="previewHead"><div><div className="eyebrow">LATEST PROJECT</div><b>Yangi kino loyihasi</b></div><button className="icon" onClick={()=>go('projects')}><ChevronRight/></button></div><div className="previewThumb"><img src="/kino-studio-placeholder.svg" alt="Project preview"/><div><Play size={18}/></div></div><div className="previewStats"><span><b>01</b><small>Sahna</small></span><span><b>00:00</b><small>Davomiylik</small></span><span><b>AI</b><small>Workflow</small></span></div></div></section></div>}
const continuityWarnings=(p:any)=>{const warnings:string[]=[];if(!p?.script?.trim())warnings.push('Ssenariy kiritilmagan.');return warnings};

function Create({project,setProject,script,setScript,save,saved,config,setPage,session,isAdmin}:any){
 const[busy,setBusy]=useState(false),[adminMode,setAdminMode]=useState(false),[chat,setChat]=useState<{role:string,text:string,id?:string,image?:string}[]>(()=>read(`kino_chat_${project.id}`,[])),[composer,setComposer]=useState(''),[refImage,setRefImage]=useState(''),[refCharacter,setRefCharacter]=useState('');
 const chatLogRef=useRef<HTMLDivElement|null>(null);
 const composerRef=useRef<HTMLTextAreaElement|null>(null);
 useEffect(()=>{const el=chatLogRef.current;if(el)el.scrollTo({top:el.scrollHeight,behavior:'smooth'})},[chat,busy,refImage]);
 const wait=(ms:number)=>new Promise<void>(resolve=>setTimeout(resolve,ms));
 useEffect(()=>{const local=read(`kino_chat_${project.id}`,[]);setChat(local);(async()=>{if(sb&&session?.user?.id){const{data}=await sb.from('studio_chat_messages').select('*').eq('studio_owner_id',session.user.id).eq('studio_project_id',project.id).order('studio_created_at',{ascending:true});if(data?.length){const loaded=data.map((m:any)=>({id:m.studio_message_id,role:m.studio_role,text:m.studio_content||''}));setChat(loaded);write(`kino_chat_${project.id}`,loaded)}}})()},[session?.user?.id,project.id]);
 useEffect(()=>{const cmd=(e:any)=>{const c=e.detail||localStorage.getItem('kino_pending_command');if(c){setComposer(c);localStorage.removeItem('kino_pending_command');setTimeout(()=>ask(c),80)}};window.addEventListener('kino-open-command',cmd);const c=localStorage.getItem('kino_pending_command');if(c){setComposer(c);localStorage.removeItem('kino_pending_command');setTimeout(()=>ask(c),80)}return()=>window.removeEventListener('kino-open-command',cmd)},[project.id]);
 const persistChat=async(role:string,text:string,image?:string)=>{const item={id:uid(),role,text,image};setChat(x=>{const next=[...x,item];write(`kino_chat_${project.id}`,next);return next});if(sb&&session?.user?.id)await sb.from('studio_chat_messages').insert({studio_message_id:item.id,studio_owner_id:session.user.id,studio_project_id:project.id,studio_role:role,studio_content:text||'📷 Reference rasm'})};
 const ask=async(text:string)=>{
   const clean=text.trim();if(!clean||busy)return;
   const started=Date.now();
   composerRef.current?.blur();
   if(document.activeElement instanceof HTMLElement)document.activeElement.blur();
   await persistChat('user',clean);setComposer('');setBusy(true);
   const api=config.apiUrl||import.meta.env.VITE_STUDIO_API_URL||`http://${window.location.hostname}:8787`;
   if(isAdmin && (adminMode || clean.toLowerCase()==='/admin' || /^(ha|yo\?q|yo‘q|yoq|bekor|tasdiq|tasdiqlayman|yes|no)$/i.test(clean))){
     try{
       const rr=await fetch(api.replace(/\/$/,'')+'/admin/command',{method:'POST',headers:{'Content-Type':'application/json',...(config.clientKey?{'X-Client-Key':config.clientKey}:{})},body:JSON.stringify({command:clean,email:session?.user?.email||session?.email,chatId:session?.user?.id||'studio-admin-local'})});
       const rj=await rr.json();
       if(!rr.ok)throw new Error(rj?.error||'ADMIN_ERROR');
       await wait(Math.max(0,2200-(Date.now()-started)));
       if(clean.toLowerCase()==='/admin' || rj.next==='awaiting_request' || rj.next==='awaiting_approval')setAdminMode(true);else if(rj.next==='done'||rj.next==='cancelled')setAdminMode(false);
       await persistChat('ai',rj.message||`Admin buyrug‘i qabul qilindi: ${rj.plan?.target||'all'} · ${rj.plan?.action||'require'}`);
     }catch(e:any){await wait(Math.max(0,2200-(Date.now()-started)));await persistChat('ai',e.name==='TypeError'?'Admin serveriga ulanish amalga oshmadi.':e.message==='ADMIN_ONLY'?'Bu buyruq faqat administrator uchun mavjud.':'Admin buyrug‘ini bajarishda xatolik yuz berdi.');}
     setBusy(false);return;
   }
   try{
     if(!api)throw new Error('AI_UNAVAILABLE');
     const history=[...chat,{role:'user',text:clean}].slice(-20);
     const rr=await fetch(api.replace(/\/$/,'')+'/ai/script',{method:'POST',headers:{'Content-Type':'application/json',...(config.clientKey?{'X-Client-Key':config.clientKey}:{})},body:JSON.stringify({userText:clean,history,project,rules:read('kino_rules',[])})});
     const rj=await rr.json();if(!rr.ok)throw new Error(rj?.error||'AI_UNAVAILABLE');
     const aiText=rj?.reply||rj?.choices?.[0]?.message?.content||'';
     if(!aiText)throw new Error('AI_UNAVAILABLE');
     await wait(Math.max(0,2200-(Date.now()-started)));
     await persistChat('ai',aiText);
     const looksLikeScript=/(ssenariy|sahna|shot|scene|dialog|kamera|personaj|qahramon|storyboard)/i.test(clean);
     if(looksLikeScript){
       const productionScript=[project.script?.trim(),clean].filter(Boolean).join('\n\n');
       const p=analyzeScript(productionScript,{...project,script:productionScript});
       setProject(p);setScript(productionScript);
     }
     if(sb&&session?.user?.id)await sb.from('studio_project_context').upsert({studio_project_id:project.id,studio_user_id:session.user.id,studio_script:project.script||'',studio_context:{project,chat:[...history,{role:'ai',text:aiText}]},studio_updated_at:new Date().toISOString()});
   }catch(e:any){
     await wait(Math.max(0,2200-(Date.now()-started)));
     const friendly=e.name==='TypeError'?'AI serveriga ulanish amalga oshmadi. Iltimos, serverni qayta ishga tushiring.':e.message==='AI_UNAVAILABLE'||e.message==='AI_TEMPORARILY_UNAVAILABLE'?'Hozircha AI javob bera olmayapti. Bir ozdan keyin yana urinib ko‘ring.':(e.message||'Hozircha javob berib bo‘lmadi.');
     await persistChat('ai',friendly);
   }finally{setBusy(false)}
 };
 const addRef=()=>document.getElementById(`kino-ref-${project.id}`)?.click();
 const handleRef=(e:any)=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=async()=>{const data=String(r.result||'');setRefImage(data);setRefCharacter('');await persistChat('user','📷 Reference rasm',data);await persistChat('ai','📷 Reference rasm yuborildi. Qaysi ssenariy qahramoniga biriktiramiz?')};r.readAsDataURL(f);e.target.value=''};
 const chooseRefCharacter=(name:string)=>{setRefCharacter(name);setRefImage('');persistChat('user',`Qahramon tanlandi: ${name}`);persistChat('ai',`Reference rasm ${name} qahramoniga biriktirildi. Endi kino ssenariysi va sahnalarini davom ettiramiz.`)};
 return <div className="page aiCreatePage">

 <section className="kinoChatShell">
   <div className="kinoChatTop"><button className="chatMenuButton" onClick={()=>setPage('home')} aria-label="Orqaga"><ChevronRight className="backIcon"/></button><div className="kinoBrand"><span className="kinoBrandMark"><Film size={17}/></span><div><b>Kino AI</b><small>STUDIO</small></div></div><div className="kinoTopActions"><span className="kinoOnline">● ONLINE</span><button className="icon" onClick={save} title="Saqlash"><Save size={17}/></button></div></div>
   <div className="kinoChatLog" ref={chatLogRef}>
     {chat.length===0&&<div className="kinoWelcome"><div className="kinoWelcomeIcon"><Sparkles size={20}/></div><h2>Salom! 🎬</h2><p>Bugun qanday kino yaratamiz? G‘oyangizni ayting — birga ssenariy, personajlar va sahnalarni ishlab chiqamiz.</p><div className="kinoQuick"><button onClick={()=>setComposer('Yangi kino g‘oyam bor, uni birga ssenariyga aylantiraylik.')}>G‘oyadan boshlash</button><button onClick={()=>setComposer('Menga kino uchun personaj va voqea tuzishda yordam ber.')}>Personaj yaratish</button></div></div>}
     {chat.map((m,i)=><div className={'kinoMessage '+m.role} key={m.id||i}>{m.role==='ai'&&<span className="kinoAvatar"><Sparkles size={13}/></span>}<div className="kinoMessageBody"><span className="kinoMessageName">{m.role==='ai'?'Kino AI':m.role==='user'?'Siz':'Studio'}</span>{m.image&&<div className="kinoReferenceImage"><img src={m.image} alt="Reference rasm"/></div>}{m.text&&<div className="kinoMessageText">{m.text}</div>}</div></div>)}
     {busy&&<div className="kinoMessage ai"><span className="kinoAvatar"><Sparkles size={13}/></span><div className="kinoTyping"><i></i><i></i><i></i></div></div>}
   </div>
   {refImage&&<section className="panel refCharacterPicker"><div className="head"><div><div className="eyebrow">REFERENCE</div><h3>Qaysi qahramon?</h3></div></div><p>Faqat ssenariyda mavjud qahramonlar ko‘rsatiladi.</p><div className="refCharacterGrid">{project.characters.map((c:any)=><button key={c.id} className={refCharacter===c.name?'active':''} onClick={()=>chooseRefCharacter(c.name)}><Users size={16}/>{c.name}</button>)}</div></section>}
   <input id={`kino-ref-${project.id}`} type="file" accept="image/*" style={{display:'none'}} onChange={handleRef}/>
   <div className="kinoComposerWrap"><div className="kinoComposer"><button className="composerPlus" onClick={addRef} aria-label="Reference"><Plus size={21}/></button><textarea ref={composerRef} value={composer} onChange={e=>setComposer(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask(composer)}}} placeholder="Kino haqida yozing..." rows={1}/><button className="composerSend" disabled={!composer.trim()||busy} onClick={()=>ask(composer)} aria-label="Yuborish"><Send size={17}/></button></div><small>AI Kino Studio bilan kino yaratish, ssenariy va sahnalar haqida suhbatlashing.</small></div>
 </section>
 <div className="grid kinoTools" style={{marginTop:14}}><section className="panel"><b>Personajlar</b>{project.characters.map(c=><div className="shot" key={c.id}><Users/><div><b>{c.name}</b><small>{c.role}</small></div><i>IDENTITY</i></div>)}<button className="ghost" onClick={()=>{const name=prompt('Personaj ismi');if(name)setProject((p:any)=>({...p,characters:[...p.characters,newChar(name)]}))}}><Plus/> Personaj qo‘shish</button></section><section className="panel"><b>Sahna va shotlar</b>{project.shots.length===0?<p>AI suhbat davomida kino tafsilotlari aniqlangach, sahnalar shu yerda paydo bo‘ladi.</p>:project.shots.map(s=><div className="shot" key={s.id}><span>{s.title.split(' ')[0]}</span><div><b>{s.title}</b><small>{s.camera} · {s.duration}s · {s.emotion}</small></div><i>READY</i></div>)}</section></div>
 </div>
}
function Projects({projects,setProject,go}:any){
 const[q,setQ]=useState('');const[people,setPeople]=useState<any[]>([]);const[selected,setSelected]=useState<any>(null);const[publicMovies,setPublicMovies]=useState<any[]>([]);const[searching,setSearching]=useState(false);
 const searchPeople=async()=>{const term=q.trim().replace(/^@/,'').toLowerCase();if(!term){setPeople([]);setSelected(null);return}setSearching(true);try{let rows:any[]=[];if(sb){const r=await sb.from('studio_profiles').select('*').limit(100);if(!r.error)rows=r.data||[]}const local=read('kino_local_users',[]).map((u:any)=>({studio_user_id:u.id,studio_full_name:u.name,studio_username:u.username||u.email?.split('@')[0],studio_email:u.email,studio_avatar_data:u.avatar}));const merged=[...rows,...local].filter((x:any)=>String(x.studio_username||'').toLowerCase()===term||String(x.studio_full_name||'').toLowerCase().includes(term)||String(x.studio_email||'').toLowerCase().startsWith(term+'@'));setPeople(Array.from(new Map(merged.map((x:any)=>[x.studio_user_id||x.studio_email,x])).values()).slice(0,10));}finally{setSearching(false)}};
 const openPerson=async(person:any)=>{setSelected(person);setPeople([]);let movies:any[]=[];if(sb&&person.studio_user_id){const r=await sb.from('studio_projects').select('*').eq('studio_owner_id',person.studio_user_id).eq('studio_public',true).order('studio_created_at',{ascending:false});if(!r.error)movies=r.data||[]}const local=read('kino_local_projects',[]).filter((x:any)=>String(x.ownerEmail||'').toLowerCase()===String(person.studio_email||'').toLowerCase()&&x.public!==false);const base=(movies.length?movies:local).map((p:any)=>({...p,id:p.studio_project_id||p.id,title:p.studio_name||p.title,script:p.studio_description||p.script||'',ownerName:person.studio_full_name,ownerEmail:person.studio_email}));setPublicMovies(base)};
 const filtered=projects.filter((p:any)=>String(p.title||'').toLowerCase().includes(q.toLowerCase())||String(p.ownerName||'').toLowerCase().includes(q.toLowerCase()));
 if(selected)return <div className="page profilePage"><div className="head"><div><div className="eyebrow">PROFILE</div><h2>Foydalanuvchi profili</h2></div><button className="ghost" onClick={()=>setSelected(null)}>← Loyihalarga qaytish</button></div><section className="profileInstagram publicProfile"><div className="profileTop"><div className="profileAvatarWrap">{selected.studio_avatar_data?<img src={selected.studio_avatar_data} className="profileAvatar"/>:<UserCircle className="profileAvatarFallback"/>}</div><div className="profileIdentity"><h2>@{selected.studio_username||String(selected.studio_email||'user').split('@')[0]}</h2><b>{selected.studio_full_name||''}</b><div className="profileStats publicOnly"><div><b>{publicMovies.length}</b><span>Kinolar</span></div></div></div></div><div className="profileMovies"><div className="profileMoviesHead"><b>Kinolar</b><span>{publicMovies.length}</span></div><div className="movieGrid">{publicMovies.map((p:any)=><article className="profileMovie" key={p.id} onClick={()=>{setProject(p);go('create')}}><div className="profileMovieCover"><Film/></div><b>{p.title||'Kino'}</b></article>)}</div>{!publicMovies.length&&<p className="muted">Bu foydalanuvchining ochiq kinolari hozircha yo‘q.</p>}</div></section></div>;
 return <div className="page"><div className="head"><div><div className="eyebrow">PROJECTS</div><h2>Loyihalar</h2></div><div className="projectSearch"><input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')searchPeople()}} placeholder="@username qidirish..."/><button className="icon" onClick={searchPeople}><Eye size={17}/></button></div></div>{q&&<section className="panel peopleSearchPanel"><b>{searching?'Qidirilmoqda...':'Foydalanuvchilar'}</b>{!searching&&people.length===0&&<p className="muted">Aniq username bilan qidirib ko‘ring, masalan @abdulqodir.</p>}{people.map((person:any)=><button className="personResult" key={person.studio_user_id||person.studio_email} onClick={()=>openPerson(person)}><span className="personAvatar">{person.studio_avatar_data?<img src={person.studio_avatar_data}/>:<UserCircle/>}</span><span><b>@{person.studio_username||String(person.studio_email||'user').split('@')[0]}</b><small>{person.studio_full_name||''}</small></span><ChevronRight/></button>)}</section>}{filtered.length===0?<section className="panel"><b>{q?'Kino topilmadi.':'Hali loyiha yo‘q.'}</b><p>{q?'Yuqoridagi username qidiruvidan foydalaning.':'Kino yaratishni boshlang.'}</p></section>:filtered.map((p:any)=><section className="panel project" key={p.id}><div className="thumb"><Film/></div><div><b>{p.title}</b><p>{p.status} · {p.shots?.length||0} shot</p></div><button className="ghost" onClick={()=>{setProject(p);go('create')}}>Ochish</button></section>)}</div>}
function Integrations(){
 const[rule,setRule]=useState('');
 const[created,setCreated]=useState(()=>localStorage.getItem('kino_studio_api_key')||'');
 const[copied,setCopied]=useState(false);
 const createKey=async()=>{const k='kys_'+crypto.randomUUID().replaceAll('-','');setCreated(k);setCopied(false);localStorage.setItem('kino_studio_api_key',k);if(sb){try{const u=(await sb.auth.getUser()).data.user;if(u){const r=await sb.from('studio_api_keys').upsert({studio_user_id:u.id,studio_key:k,studio_label:'Default API key'});if(r.error)console.warn(r.error.message)}}catch{}}};
 const copyKey=async()=>{if(!created)return;try{await navigator.clipboard?.writeText(created);setCopied(true);setTimeout(()=>setCopied(false),1400)}catch{}};
 return <div className="page"><div className="head"><div><div className="eyebrow">DEVELOPER</div><h2>API ulash</h2></div></div><section className="panel apiGuide"><div className="apiIcon"><KeyRound/></div><h3>API kalit olishdan oldin qoidalar</h3><p>01 yoki 02 bo‘limini bosib tegishli API qoidalarini ko‘ring. Keyin 03 orqali haqiqiy kalit oling.</p><div className="apiSteps"><button onClick={()=>setRule('01 — API kalit akkauntingizga bog‘lanadi. Uni faqat ishonchli server yoki Termux kabi xavfsiz joyda saqlang.')}><b>01</b><span>API kalit qoidalari</span></button><button onClick={()=>setRule('02 — Server maxfiy kalitlari oddiy foydalanuvchiga ko‘rsatilmaydi. API so‘rovlari siz belgilagan qoidalarga bo‘ysunadi.')}><b>02</b><span>Xavfsizlik va foydalanish</span></button></div>{rule&&<div className="notice">{rule}</div>}<div className="apiStepThree apiStepThreeKey"><div><b>03</b><span>{created||'API kalit olish'}</span>{created&&<button className="apiCopyButton" onClick={copyKey} title="Nusxalash" aria-label="Nusxalash">{copied?<Check size={15}/>:<Copy size={15}/>}</button>}</div><button className="primary" onClick={createKey}><KeyRound/> {created?'Kalitni yangilash':'API kalit olish'}</button></div></section></div>}
function Collab({go}:any){const openAd=(kind:'PRO'|'MAX')=>{const cmd=`/${kind} Reklama`;localStorage.setItem('kino_pending_command',cmd);go('create');};return <div className="page"><div className="head"><div><div className="eyebrow">COLLABORATION</div><h2>Hamkorlik</h2></div></div><section className="panel"><h3>Hamkorlik paketlari</h3><div className="planGrid"><button className="planCard" onClick={()=>alert('PRO hamkorlik qoidalari')}><b>PRO</b><span>Hamkorlik qoidalarini ko‘rish</span></button><button className="planCard" onClick={()=>alert('MAX hamkorlik qoidalari')}><b>MAX</b><span>Kengaytirilgan hamkorlik qoidalarini ko‘rish</span></button></div><div className="row adPlanButtons"><button className="primary" onClick={()=>openAd('PRO')}>PRO REKLAMA</button><button className="primary" onClick={()=>openAd('MAX')}>MAX REKLAMA</button></div></section></div>}
function Partners({go}:any){
 const profiles=read('kino_partner_profiles',Array.from({length:12},(_,i)=>({id:i+1,name:['Nova Media','FrameLab','UzBrand','CinePro','Motion House','Pixel Art','Silk Road Media','Urban Ads','Vision Studio','Creative Hub','Media One','Kadr Agency'][i],avatar:`https://i.pravatar.cc/120?img=${i+10}`,views:1200+i*743,ads:4+i%7,joined:`2026-${String((i%9)+1).padStart(2,'0')}`,placements:['1.2M','850K','2.4M','970K','1.8M','640K','3.1M','1.1M','2.7M','760K','1.5M','2.2M'][i],reach:['12.8M','9.4M','18.2M','7.6M','14.5M','6.9M','21.3M','10.7M','16.1M','8.3M','13.6M','19.4M'][i],rate:[39,47,31,54,42,61,28,45,36,58,41,33][i]})));
 return <div className="page"><div className="head"><div><div className="eyebrow">BUSINESS</div><h2>Hamkorlar / Reklama</h2></div></div><section className="panel"><h3>Hamkor profillari</h3><div className="partnerGrid">{profiles.map((x:any)=><article className="partnerCard" key={x.id}><img src={x.avatar} alt=""/><div><b>{x.name}</b><small>{x.ads} ta reklama · {x.views.toLocaleString()} ko‘rish</small><small>Kinoga qo‘yishlar: {x.placements}</small><small>Ko‘rishlar: {x.reach}</small><small>Kayipsent: {x.rate}%</small><small>Hamkor: {x.joined}</small></div></article>)}</div></section></div>}
function Profile({session,mode,setMode,email,setEmail,pass,setPass,msg,auth,projects,setProject,go,fullName,setFullName,nickname,setNickname,avatar,setAvatar,verifyCode,setVerifyCode,verifyEmail}:any){
 const[method,setMethod]=useState<'google'|'phone'|'email'|''>('');
 const[stage,setStage]=useState(mode==='signup'?1:0);
 const[localMsg,setLocalMsg]=useState('');
 const[pending,setPending]=useState<any>(null);
 const[password2,setPassword2]=useState('');
 const[oauthBusy,setOauthBusy]=useState(false);
 const[avatarMenu,setAvatarMenu]=useState(false);
 const passwordOK=pass.length>=8&&/\d/.test(pass)&&/[^A-Za-z0-9]/.test(pass);

 useEffect(()=>{
   if(mode==='signup' && !method)setStage(1);
 },[mode,method]);

 const pick=(e:any)=>{
   const f=e.target.files?.[0];if(!f)return;
   const r=new FileReader();
   r.onload=()=>setAvatar(String(r.result||''));
   r.readAsDataURL(f);
 };

 const clear=()=>{
   setLocalMsg('');setVerifyCode('');setPassword2('');
 };

 const startGoogle=async()=>{
   setMethod('google');setOauthBusy(true);setLocalMsg('');
   if(!sb){setLocalMsg('Google orqali kirish uchun Supabase Auth sozlanishi kerak.');setOauthBusy(false);return}
   const r=await sb.auth.signInWithOAuth({
     provider:'google',
     options:{
       redirectTo:window.location.origin,
       queryParams:{prompt:'select_account',access_type:'offline'}
     }
   });
   if(r.error)setLocalMsg(r.error.message);
   setOauthBusy(false);
 };

 const startEmail=()=>{setMethod('email');setStage(mode==='signup'?2:2);clear()};
 const startPhone=()=>{setMethod('phone');setStage(mode==='signup'?2:2);clear()};

 const register=async()=>{
   if(!fullName.trim()){setLocalMsg('Ism va familiyani kiriting.');return}
   const nick=nickname.trim().replace(/^@/,'').toLowerCase();
   if(!/^[a-z0-9_]{3,24}$/.test(nick)){setLocalMsg('Nick 3–24 belgi: faqat a-z, 0-9 va _ bo‘lsin.');return}
   if(!passwordOK){setLocalMsg('Parol kamida 8 belgi, 1 ta raqam va 1 ta maxsus belgidan iborat bo‘lishi kerak. Masalan: Abdulqodir_1');return}
   if(password2!==pass){setLocalMsg('Parollar mos emas.');return}
   if(!sb){setLocalMsg('Supabase ulanishi mavjud emas.');return}

   if(method==='email'){
     const r=await sb.auth.signUp({email:email.trim(),password:pass,options:{data:{full_name:fullName.trim(),username:nick}}});
     if(r.error){setLocalMsg(r.error.message);return}
     if(r.data.user){
       if(r.data.session)localStorage.setItem('kino_session',JSON.stringify(r.data.session));
       await sb.from('studio_profiles').upsert({studio_user_id:r.data.user.id,studio_full_name:fullName.trim(),studio_username:nick,studio_email:r.data.user.email||email.trim(),studio_avatar_data:avatar||null});
     }
     setStage(5);
     setLocalMsg('Ro‘yxatdan o‘tish muvaffaqiyatli.');
     return;
   }

   if(method==='phone'){
     const r=await sb.auth.signInWithOtp({
       phone:email.trim(),
       options:{shouldCreateUser:true,data:{full_name:fullName.trim()}}
     });
     if(r.error){setLocalMsg(r.error.message);return}
     setPending({type:'phone-signup',value:email.trim()});
     setStage(4);
     setLocalMsg('Telefon raqamingizga SMS tasdiqlash kodi yuborildi.');
   }
 };

 const verifyReal=async()=>{
   if(!verifyCode.trim()){setLocalMsg('Tasdiqlash kodini kiriting.');return}
   if(!sb||!pending){setLocalMsg('Tasdiqlash sessiyasi topilmadi.');return}
   const r=(pending.type==='email-signup')
     ?await sb.auth.verifyOtp({email:pending.value,token:verifyCode.trim(),type:'email'})
     :(pending.type==='phone-signup')
       ?await sb.auth.verifyOtp({phone:pending.value,token:verifyCode.trim(),type:'sms'})
       :null;
   if(!r){setLocalMsg('Tasdiqlash sessiyasi topilmadi.');return}
   if(r.error){setLocalMsg(r.error.message);return}
   if(r.data.user){
     setFullName(r.data.user.user_metadata?.full_name||fullName);
     if(r.data.session){
       localStorage.setItem('kino_session',JSON.stringify(r.data.session));
       const pw=await sb.auth.updateUser({password:pass,data:{full_name:fullName.trim()}});
       if(pw.error){setLocalMsg(pw.error.message);return}
     }
     await sb.from('studio_profiles').upsert({
       studio_user_id:r.data.user.id,
       studio_full_name:fullName.trim(),
       studio_email:r.data.user.email||null,
       studio_avatar_data:avatar||null
     });
   }
   setStage(5);
   setLocalMsg('Tasdiqlandi. Endi profil rasmini qo‘shing.');
 };

 const saveProfile=async()=>{
   if(!avatar){setLocalMsg('Profil rasmini tanlang.');return}
   const u=(await sb?.auth.getUser())?.data?.user;
   if(u)await sb.from('studio_profiles').upsert({
     studio_user_id:u.id,
     studio_full_name:fullName.trim(),
     studio_username:nickname.trim().replace(/^@/,'').toLowerCase(),
     studio_email:u.email||email,
     studio_avatar_data:avatar
   });
   write('kino_profile',{name:fullName,email,avatar,method});
   setLocalMsg('Profil saqlandi. Xush kelibsiz, '+fullName+'!');
   setTimeout(()=>go('create'),350);
 };

 const loginEmail=async()=>{
   if(!email||!pass){setLocalMsg('Email va parolni kiriting.');return}
   if(!sb){setLocalMsg('Supabase ulanishi mavjud emas.');return}
   const r=await sb.auth.signInWithPassword({email:email.trim(),password:pass});
   if(r.error){setLocalMsg(r.error.message);return}
   if(r.data.session)localStorage.setItem('kino_session',JSON.stringify(r.data.session));
   setLocalMsg('Kirish muvaffaqiyatli.');
   setTimeout(()=>go('create'),350);
 };

 const loginPhone=async()=>{
   if(!email){setLocalMsg('Telefon raqamini kiriting.');return}
   if(!sb){setLocalMsg('Supabase ulanishi mavjud emas.');return}
   const r=await sb.auth.signInWithOtp({phone:email.trim(),options:{shouldCreateUser:false}});
   if(r.error){setLocalMsg(r.error.message);return}
   setPending({type:'login-phone',value:email.trim()});
   setStage(6);
   setLocalMsg('Telefoningizga tasdiqlash kodi yuborildi.');
 };

 const verifyLogin=async()=>{
   if(!sb||!pending||!verifyCode.trim())return;
   const r=pending.type==='login-email'
     ?await sb.auth.verifyOtp({email:pending.value,token:verifyCode.trim(),type:'email'})
     :await sb.auth.verifyOtp({phone:pending.value,token:verifyCode.trim(),type:'sms'});
   if(r.error){setLocalMsg(r.error.message);return}
   if(r.data.session){
     localStorage.setItem('kino_session',JSON.stringify(r.data.session));
     setLocalMsg('Kirish muvaffaqiyatli.');
     setTimeout(()=>go('create'),350);
   }
 };

 if(session&&!session.isLocalAdmin&&!read('kino_profile',null))return <div className="page authPage"><div className="authTitle"><div className="eyebrow">GOOGLE / ACCOUNT SETUP</div><h2>Profilni yakunlang</h2><p>Akkaunt tasdiqlandi. Endi ism va profil rasmini saqlang.</p></div><section className="panel authbox"><label>ISM VA FAMILIYA</label><input value={fullName||session.user?.user_metadata?.full_name||''} onChange={e=>setFullName(e.target.value)} placeholder="Ism va familiya"/><label>PROFIL RASMI</label><input type="file" accept="image/*" onChange={pick}/>{avatar&&<img src={avatar} className="avatarPreview"/>}<button className="primary full" disabled={!fullName.trim()||!avatar} onClick={saveProfile}>Profilni saqlash</button>{(localMsg||msg)&&<div className="notice">{localMsg||msg}</div>}</section></div>;

 const updateAvatar=async(data:string)=>{setAvatar(data);const u=(await sb?.auth.getUser())?.data?.user;if(u)await sb?.from('studio_profiles').upsert({studio_user_id:u.id,studio_full_name:fullName.trim(),studio_username:nickname.trim().replace(/^@/,'').toLowerCase(),studio_email:u.email||email,studio_avatar_data:data||null});const next={...session,avatar:data,user:{...session.user,user_metadata:{...(session.user?.user_metadata||{}),avatar_url:data}}};localStorage.setItem('kino_session',JSON.stringify(next));setLocalMsg(data?'Avatar almashtirildi.':'Avatar o‘chirildi.');setAvatarMenu(false);setTimeout(()=>setLocalMsg(''),1200)};
 const pickAvatar=()=>document.getElementById('profile-avatar-input')?.click();
 if(session)return <div className="page profilePage"><section className="profileInstagram"><div className="profileTop"><div className="profileAvatarWrap profileAvatarButton"><button className="profileAvatarTap" onClick={()=>setAvatarMenu(v=>!v)} aria-label="Avatar menyusi">{session.user?.user_metadata?.avatar_url||session.avatar?<img src={session.user?.user_metadata?.avatar_url||session.avatar} className="profileAvatar"/>:<UserCircle className="profileAvatarFallback"/>}<span className="profileAvatarEdit"><Upload size={16}/></span></button>{avatarMenu&&<div className="avatarActionMenu"><button onClick={pickAvatar}><Upload size={15}/> Rasmni almashtirish</button><button onClick={()=>updateAvatar('')}><XCircle size={15}/> Rasmni o‘chirish</button><button onClick={()=>setAvatarMenu(false)}>Bekor qilish</button></div>}<input id="profile-avatar-input" type="file" accept="image/*" style={{display:'none'}} onChange={async(e)=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=async()=>{await updateAvatar(String(r.result||''))};r.readAsDataURL(f);e.target.value=''}}/></div><div className="profileIdentity"><h2>@{nickname||session.user?.user_metadata?.username||String(session.user?.email||session.email||'user').split('@')[0]}</h2><b>{session.user?.user_metadata?.full_name||fullName||session.user?.email||session.email}</b><div className="profileStats"><div><b>{projects.length}</b><span>Kinolar</span></div><div><b>{read('kino_saved_movies',[]).length}</b><span>Saqlangan kinolar</span></div><div><b>{read('kino_ssk',[]).length}</b><span>S.S.K</span></div></div></div></div>{localMsg&&<div className="notice profileAvatarNotice">{localMsg}</div>}<div className="profileMovies"><div className="profileMoviesHead"><b>Kinolar</b><span>{projects.length}</span></div>{projects.length?<div className="movieGrid">{projects.map((p:any)=><article className="profileMovie" key={p.id} onClick={()=>{setProject(p);setTimeout(()=>go('create'),0);}}><div className="profileMovieCover">{p.videoUrl?<video src={p.videoUrl} muted playsInline preload="metadata"/>:<img src="/kino-studio-placeholder.svg" alt="Kino AI Studio"/>}</div><b>{p.title||'Kino'}</b></article>)}</div>:<div className="profileEmptyMovie"><img src="/kino-studio-placeholder.svg" alt="Kino AI Studio"/><b>Yangi kino</b><span>Kino AI Studio’da birinchi filmingizni yarating.</span><button className="primary" onClick={()=>go('create')}><Film size={16}/> Kino yaratish</button></div>}</div></section></div>;

 return <div className="page authPage">
  <div className="authTitle"><div className="eyebrow">KINO AI STUDIO</div><h2>{mode==='login'?'Xush kelibsiz':'Professional akkaunt yarating'}</h2><p>{mode==='login'?'Kirish usulini tanlang.':'Ro‘yxatdan o‘tish usulini tanlang.'}</p></div>
  <section className="panel authbox">
   {!method&&<div className="authMethods">
    <h3>{mode==='login'?'Kirish':'Ro‘yxatdan o‘tish'}</h3>
    <button className="primary full" onClick={startGoogle} disabled={oauthBusy}>Google orqali</button>
    <button className="ghost full" onClick={startPhone}>Telefon orqali</button>
    <button className="ghost full" onClick={startEmail}>E-mail orqali</button>
   </div>}

   {method&&mode==='signup'&&stage===2&&<div>
    <div className="stepper"><span className="on">1 Usul</span><span className="on">2 Ma’lumot</span><span>3 Kod</span><span>4 Profil</span></div>
    <label>{method==='phone'?'TELEFON RAQAMI':'E-MAIL'}</label>
    <input value={email} onChange={e=>setEmail(e.target.value)} placeholder={method==='phone'?'+998 XX XXX XX XX':'email@example.com'}/>
    <label>ISM VA FAMILIYA</label>
    <input value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Ism va familiya"/>
    <label>UNIKAL NICK</label>
    <input value={nickname} onChange={e=>setNickname(e.target.value.replace(/[^a-zA-Z0-9_@]/g,'').replace(/^@+/,'').toLowerCase())} placeholder="@abdulqodir"/>
    <label>PAROL</label>
    <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Abdulqodir_1"/>
    <small>Kamida 8 belgi + 1 raqam + 1 maxsus belgi.</small>
    <label>PAROLNI QAYTA KIRITING</label>
    <input type="password" value={password2} onChange={e=>setPassword2(e.target.value)} placeholder="Parolni qayta kiriting"/>
    <button className="primary full" disabled={!email||!fullName||!nickname||!passwordOK||password2!==pass} onClick={register}>Ro‘yxatdan o‘tish</button>
   </div>}

   {method&&mode==='signup'&&stage===4&&<div>
    <h3>Tasdiqlash kodi</h3><p>{pending?.value} ga yuborilgan 6 xonali kodni kiriting.</p>
    <input value={verifyCode} onChange={e=>setVerifyCode(e.target.value)} inputMode="numeric" placeholder="6 xonali kod"/>
    <button className="primary full" onClick={verifyReal}>Tasdiqlash</button>
   </div>}

   {method&&mode==='signup'&&stage===5&&<div>
    <h3>Profil rasmi</h3>
    <input type="file" accept="image/*" onChange={pick}/>
    {avatar&&<img src={avatar} className="avatarPreview"/>}
    <button className="primary full" onClick={saveProfile}>Profilni saqlash</button>
   </div>}

   {method&&mode==='login'&&stage===2&&<div>
    <label>{method==='phone'?'TELEFON RAQAMI':'E-MAIL'}</label>
    <input value={email} onChange={e=>setEmail(e.target.value)} placeholder={method==='phone'?'+998 XX XXX XX XX':'example@gmail.com'}/>
    {method==='email'&&<><label>PAROL</label><input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••"/><button className="primary full" onClick={loginEmail}>Kirish va kod olish</button></>}
    {method==='phone'&&<button className="primary full" onClick={loginPhone}>SMS kod olish</button>}
   </div>}

   {method&&mode==='login'&&stage===6&&<div>
    <h3>Qo‘shimcha tasdiqlash</h3><p>Tasdiqlash kodini kiriting.</p>
    <input value={verifyCode} onChange={e=>setVerifyCode(e.target.value)} inputMode="numeric" placeholder="Tasdiqlash kodi"/>
    <button className="primary full" onClick={verifyLogin}>Tasdiqlash va kirish</button>
   </div>}

   {method==='google'&&<div className="panel" style={{marginTop:12}}>
     <h3>Google akkaunt</h3>
     <p>Google oynasida telefoningizdagi mavjud akkauntlardan birini tanlang. Tanlangan akkaunt bilan davom etiladi.</p>
     <button className="primary full" onClick={startGoogle} disabled={oauthBusy}>{oauthBusy?'Google ochilmoqda…':'Google orqali davom etish'}</button>
   </div>}

   {(localMsg||msg)&&<div className="notice">{localMsg||msg}</div>}
   {method&&<button className="text" onClick={()=>{setMethod('');setStage(mode==='signup'?1:0);clear()}}>← Boshqa usul</button>}
   <button className="text" onClick={()=>{setMode(mode==='login'?'signup':'login');setMethod('');setStage(1);clear()}}>{mode==='login'?'Yangi akkaunt yaratish':'Akkauntim bor — kirish'}</button>
  </section>
 </div>
}
function SettingsPage({session,logout,setAuthMode,go,language}:any){
 const defaults={language:'uz',notifications:true,theme:'dark',aiVoice:'neutral'};
 const[prefs,setPrefs]=useState(()=>read('kino_settings',defaults));
 const[securityOpen,setSecurityOpen]=useState(false),[currentPassword,setCurrentPassword]=useState(''),[newPassword,setNewPassword]=useState(''),[notice,setNotice]=useState('');
 const tr=(k:string)=>T(k,prefs.language||language);
 const applyTheme=(v:string)=>{const t=v==='system'?(window.matchMedia?.('(prefers-color-scheme: dark)').matches?'dark':'light'):v;document.documentElement.dataset.theme=t;};
 const savePref=async(k:string,v:any)=>{
   const n={...prefs,[k]:v};setPrefs(n);write('kino_settings',n);
   if(k==='theme')applyTheme(v);
   if(k==='language'){document.documentElement.lang=v;setTimeout(()=>window.location.reload(),0);}
   if(k==='notifications' && v && 'Notification' in window){
     try{const perm=Notification.permission==='granted'?'granted':await Notification.requestPermission();if(perm==='granted')new Notification('Kino AI Studio',{body:tr('notificationsOn')});}catch{}
   }
   window.dispatchEvent(new CustomEvent('kino-settings-change',{detail:{[k]:k==='theme'?((v==='system')?(window.matchMedia?.('(prefers-color-scheme: dark)').matches?'dark':'light'):v):v}}));
 };
 const changePassword=async()=>{
   if(newPassword.length<6){setNotice(tr('passwordLength'));return}
   const u=session?.user||session;
   if(sb&&u?.id){
     const r=await sb.auth.updateUser({password:newPassword});
     if(r.error){setNotice(r.error.message);return}
   }else{
     const users=read('kino_local_users',[]);const email=u?.email||session?.email;const user=users.find((x:any)=>x.email===email);
     if(!user||user.password!==currentPassword){setNotice(tr('wrongPassword'));return}
     write('kino_local_users',users.map((x:any)=>x.email===email?{...x,password:newPassword}:x));
   }
   setCurrentPassword('');setNewPassword('');setSecurityOpen(false);setNotice(tr('passwordChanged'));
 };
 return <div className="page">
   <div className="head"><div><div className="eyebrow">{tr('account')}</div><h2>{tr('settingsTitle')}</h2></div></div>
   <section className="panel settingsGrid">
    <div><UserCircle/><h3>{tr('profile')}</h3><p>{session?.user?.user_metadata?.full_name||session?.user?.email||session?.email}</p><button className="ghost" onClick={()=>go('profile')}>{tr('profileManage')}</button></div>
    <div><Globe/><h3>{tr('language')}</h3><select value={prefs.language} onChange={e=>savePref('language',e.target.value)}><option value="uz">O‘zbekcha</option><option value="en">English</option><option value="ru">Русский</option></select></div>
    <div><Bell/><h3>{tr('notifications')}</h3><label className="switch"><input type="checkbox" checked={prefs.notifications} onChange={e=>savePref('notifications',e.target.checked)}/><span>{tr('notificationsOn')}</span></label>{'Notification' in window&&<small className="settingStatus">{Notification.permission==='granted'?'✓ Browser bildirishnomalari ruxsat etilgan':Notification.permission==='denied'?'✕ Browser bildirishnomalari bloklangan':''}</small>}</div>
    <div><Palette/><h3>{tr('appearance')}</h3><select value={prefs.theme} onChange={e=>savePref('theme',e.target.value)}><option value="light">{tr('light')}</option><option value="dark">{tr('dark')}</option><option value="system">{tr('system')}</option></select></div>
    <div><Lock/><h3>{tr('security')}</h3><p>{tr('securityText')}</p><button className="ghost" onClick={()=>{setSecurityOpen(true);setNotice('')}}>{tr('securityManage')}</button></div>
    <div><Volume2/><h3>{tr('aiVoice')}</h3><p>{tr('aiVoiceText')}</p><select value={prefs.aiVoice||'neutral'} onChange={e=>savePref('aiVoice',e.target.value)}><option value="neutral">{tr('neutral')}</option><option value="warm">{tr('warm')}</option><option value="cinematic">{tr('cinematic')}</option></select></div>
   </section>
   <section className="panel" style={{marginTop:14}}><h3>{tr('accountSection')}</h3><p>{session?.user?.email||session?.email}</p><button className="primary" onClick={logout}>{tr('logout')}</button>{notice&&<div className="notice">{notice}</div>}</section>
   {securityOpen&&<div className="apiModal"><section className="panel securityModal"><Lock/><h3>{tr('changePassword')}</h3>{!(sb&&(session?.user||session)?.id)&&<><label>{tr('currentPassword')}</label><input type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)}/></>}<label>{tr('newPassword')}</label><input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="••••••••"/><div className="securityActions"><button className="ghost" onClick={()=>setSecurityOpen(false)}>{tr('cancel')}</button><button className="primary" onClick={changePassword}>{tr('save')}</button></div>{notice&&<div className="notice">{notice}</div>}</section></div>}
 </div>
}
function Admin({compact=false}:any){const[payments,setPayments]=useState<Payment[]>(()=>read('kino_payments',[]));useEffect(()=>{(async()=>{if(sb){const{data}=await sb.from('studio_ad_payment_requests').select('*').order('created_at',{ascending:false});if(data)setPayments(data.map((p:any)=>({id:p.id,email:p.user_email,kind:p.kind,amount:p.amount_text||'',status:p.status,receiptName:p.receipt_name||'',createdAt:p.created_at})))}})()},[]);const act=async(id:string,ok:boolean)=>{const next=payments.map(p=>p.id===id?{...p,status:ok?'approved':'rejected'}:p);setPayments(next);write('kino_payments',next);const p=next.find(x=>x.id===id);if(sb&&p){await sb.from('studio_ad_payment_requests').update({status:p.status,reviewed_at:new Date().toISOString()}).eq('id',id)}};return <section className="panel adminPanel"><div className="head"><div><div className="eyebrow">ADMIN</div><h3>To‘lovlarni tasdiqlash</h3></div><span className="status">/admin</span></div>{payments.length===0?<p>Hozircha reklama/hamkorlik to‘lovi so‘rovi yo‘q.</p>:payments.map(p=><div className="shot" key={p.id}><CreditCard/><div><b>{p.email}</b><small>{p.kind} · {p.createdAt}</small><small>Chek: {p.receiptName}</small></div>{p.status==='pending'?<><button className="ghost" onClick={()=>act(p.id,true)}><Check/> Tasdiqlash</button><button className="ghost" onClick={()=>act(p.id,false)}><XCircle/> Rad etish</button></>:<i>{p.status}</i>}</div>)}</section>}
createRoot(document.getElementById('root')!).render(<App/>);
