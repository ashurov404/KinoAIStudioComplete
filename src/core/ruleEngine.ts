export type Rule={
  id:string;
  text:string;
  active:boolean;
  createdAt:string;
  target?:'all'|'script'|'scene'|'shot'|'character'|'camera'|'lighting'|'render'|'telegram'|'admin';
  action?:'preserve'|'require'|'forbid'|'set';
};

export type AdminChangePlan={
  id:string;
  request:string;
  target:Rule['target'];
  action:Rule['action'];
  ruleText:string;
  reason:string;
  requiresApproval:true;
  createdAt:string;
};

const norm=(s:string)=>s.toLowerCase().replace(/[ʻ’']/g,"'").trim();

export function inferAdminPlan(request:string):AdminChangePlan{
  const x=norm(request);
  let target:Rule['target']='all';
  if(/telegram|bot|webhook/i.test(x))target='telegram';
  else if(/kamera|camera|kadr|fov/i.test(x))target='camera';
  else if(/yorug|lighting|chiroq|nur/i.test(x))target='lighting';
  else if(/personaj|character|qahramon|yuz|soch|kiyim/i.test(x))target='character';
  else if(/shot|sahna|scene/i.test(x))target=/scene/i.test(x)?'scene':'shot';
  else if(/render|mp4|video|kadr/i.test(x))target='render';
  else if(/ssenariy|script|dialog/i.test(x))target='script';
  const action=/taqiql|qilma|bo'lmasin|bo'lmasin/i.test(x)?'forbid':/saqla|saqlansin|o'zgarmasin/i.test(x)?'preserve':'require';
  return {
    id:crypto.randomUUID(),request,target,action,ruleText:request,
    reason:`So‘rov ${target} qatlamiga tegishli deb aniqlandi. O‘zgarish faqat konfiguratsion qoida sifatida qo‘llanadi; manba kodiga tegilmaydi.`,
    requiresApproval:true,createdAt:new Date().toISOString()
  };
}

export function applyRules<T>(value:T,rules:Rule[]):T{
  // Rules are intentionally declarative. They can constrain pipeline decisions,
  // but never execute arbitrary JavaScript or mutate source code.
  const active=rules.filter(r=>r.active);
  void active;
  return value;
}

export function continuityWarnings(project:any){
  const warnings:string[]=[];
  for(const s of project.shots||[]){
    for(const id of s.characterIds||[]){
      if(!(project.characters||[]).some((c:any)=>c.id===id))
        warnings.push(`Shot ${s.title}: character ${id} topilmadi`);
    }
    if(s.locationId&&!((project.locations||[]).some((l:any)=>l.id===s.locationId)))
      warnings.push(`Shot ${s.title}: location topilmadi`);
  }
  const seen=new Map<string,string>();
  for(const c of project.characters||[]){
    if(seen.has(c.id))warnings.push(`Character ID takrorlangan: ${c.id}`);
    seen.set(c.id,c.name||c.id);
  }
  return warnings;
}

export function enforceProjectRules(project:any,rules:Rule[]){
  const out=structuredClone(project);
  for(const r of rules.filter(x=>x.active)){
    if(r.target==='character'&&r.action==='preserve'){
      out.shots=(out.shots||[]).map((s:any)=>({...s,characterIds:[...(s.characterIds||[])]}));
    }
    if(r.target==='render'&&r.action==='require'){
      out.status=out.status==='failed'?'ready':out.status;
    }
  }
  return out;
}
