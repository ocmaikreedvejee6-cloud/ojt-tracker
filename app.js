const E=Engine,$=s=>document.querySelector(s),H=36e5;
const DEF={settings:{name:'',school:'',program:'',company:'',required:486,opening:0,openDays:0,daily:8,start:'',days:[1,2,3,4,5],round:1,theme:'light'},records:[],journal:[]};
let S=JSON.parse(JSON.stringify(DEF)),db;
const esc=x=>String(x??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const idb=()=>new Promise((res,rej)=>{const r=indexedDB.open('ojt',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
const load=()=>new Promise(r=>{const q=db.transaction('kv').objectStore('kv').get('state');q.onsuccess=()=>r(q.result);q.onerror=()=>r(null)});
const save=()=>new Promise(r=>{const t=db.transaction('kv','readwrite');t.objectStore('kv').put(S,'state');t.oncomplete=r;t.onerror=()=>{toast('Save failed!');r()}});
function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';setTimeout(()=>t.style.display='none',2500)}
const nid=()=>Date.now()+Math.random();
const tm=t=>t?new Date(t).toLocaleTimeString('en-PH',{hour:'numeric',minute:'2-digit'}):'—';
const dt=k=>new Date(k+'T00:00').toLocaleDateString('en-PH',{year:'numeric',month:'short',day:'numeric',weekday:'short'});
const R=r=>E.rendered(r,S.settings.round);
const done=()=>S.records.filter(r=>r.out);
const total=()=>done().reduce((a,r)=>a+R(r),0)+(S.settings.opening||0)*H;
const open=()=>S.records.find(r=>!r.out);
const today=()=>E.dkey(Date.now());
const sumBy=f=>done().filter(r=>f(E.dkey(r.in))).reduce((a,r)=>a+R(r),0);
const lt=r=>{const[h,m]=(S.settings.startTime||'').split(':');return h!=null&&m!=null&&S.settings.startTime&&new Date(r.in)>new Date(new Date(r.in).setHours(+h,+m,59,0))};
function eta(){const left=S.settings.required*H-total();if(left<=0)return'Completed';const d=S.settings.days;if(!d.length)return'—';let c=new Date(),n=0,g=0;const per=(S.settings.daily||8)*H;while(n<left&&g++<2000){c.setDate(c.getDate()+1);if(d.includes(c.getDay()))n+=per}return c.toLocaleDateString('en-PH',{year:'numeric',month:'long',day:'numeric'})}
const pages={dashboard,tracker,history,calendar,journal,reports,settings,backup},names={dashboard:'Dashboard',tracker:'Time Tracker',history:'Attendance',calendar:'Calendar',journal:'Journal',reports:'Reports',settings:'Settings',backup:'Backup'};
function route(){const p=(location.hash.slice(1)||'dashboard');const pg=pages[p]?p:'dashboard';
$('#nav').innerHTML='<b>⏱ OJT Tracker</b>'+Object.keys(names).map(k=>`<a href="#${k}" class="${k==pg?'on':''}">${names[k]}</a>`).join('')+'<button class="s" id="inst" style="display:none">Install App</button>';
document.documentElement.dataset.theme=S.settings.theme;if(window.dp)$('#inst').style.display='block';$('#inst').onclick=async()=>{dp.prompt();dp=null};
$('#app').innerHTML=pages[pg]();(pages[pg].after||(()=>{}))()}
function dashboard(){const T=total(),req=S.settings.required*H,pct=Math.min(100,T/req*100),o=open(),tk=today();
const wk=new Date();wk.setDate(wk.getDate()-((wk.getDay()+6)%7));const wk0=E.dkey(wk),mo=tk.slice(0,7);
const days=new Set(done().map(r=>E.dkey(r.in))).size+(S.settings.openDays||0),late=done().filter(lt).length;
let ab=0;if(S.settings.start){for(let c=new Date(S.settings.start+'T00:00');E.dkey(c)<tk;c.setDate(c.getDate()+1))if(S.settings.days.includes(c.getDay())&&!S.records.some(r=>E.dkey(r.in)==E.dkey(c)))ab++}
const last=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);const k=E.dkey(d);return[k,sumBy(x=>x==k)]});const mx=Math.max(H,...last.map(l=>l[1]));
return`<h2>Dashboard</h2>${S.settings.name?'':'<div class="alert">Welcome. Open <a href="#settings">Settings</a> to enter your name, required hours (e.g. 598), and the hours and days you have already completed.</div>'}${warn()}<div class="g"><div class="c"><small>Required</small><h3>${S.settings.required}h</h3></div><div class="c"><small>Completed</small><h3>${E.fmt(T)}</h3></div><div class="c"><small>Remaining</small><h3>${E.fmt(Math.max(0,req-T))}</h3></div><div class="c"><small>Days attended</small><h3>${days}</h3></div><div class="c"><small>Absences / Late</small><h3>${ab} / ${late}</h3></div><div class="c"><small>Today</small><h3>${o?(o.breaks.some(b=>b.e==null)?'On break':'Working'):done().some(r=>E.dkey(r.in)==tk)?'Done':'No record'}</h3></div></div>
<div class="c hero"><div class="ring" style="--p:${pct}"><span>${pct.toFixed(0)}%</span></div><div style="flex:1"><b>${E.fmt(T)}</b> of ${S.settings.required}h<div class="bar"><i style="width:${pct}%"></i></div><p><small>Estimated completion: <b>${eta()}</b></small></p></div></div>
<div class="g"><div class="c"><small>This week</small><h3>${E.fmt(sumBy(k=>k>=wk0))}</h3></div><div class="c"><small>This month</small><h3>${E.fmt(sumBy(k=>k.startsWith(mo)))}</h3></div></div>
<div class="c"><small>Last 7 days</small><div class="ch" style="margin-bottom:22px">${last.map(([k,v])=>`<div style="height:${v/mx*100}%" title="${E.fmt(v)}"><span>${k.slice(8)}</span></div>`).join('')}</div></div>`}
function warn(){const o=open();return o&&E.dkey(o.in)!=today()?`<div class="alert">⚠ You forgot to time out on ${dt(E.dkey(o.in))}. <a href="#history">Fix it in Attendance</a>.</div>`:''}
function tracker(){const o=open(),ob=o&&o.breaks.some(b=>b.e==null);
return`<h2>Time Tracker</h2>${warn()}<div class="c"><div class="big" id="clk"></div><p>${o?`Timed in at ${tm(o.in)} (${dt(E.dkey(o.in))})`:'Not timed in'}${o&&o.breaks.length?` · ${o.breaks.length} break(s)`:''}</p>
<div class="row"><button onclick="act('in')" ${o?'disabled':''}>Time In</button><button class="s" onclick="act('bs')" ${!o||ob?'disabled':''}>Start Break</button><button class="s" onclick="act('be')" ${!ob?'disabled':''}>End Break</button><button class="d" onclick="act('out')" ${!o||ob?'disabled':''}>Time Out</button></div><p class="err" id="msg"></p></div>`}
tracker.after=()=>{const f=()=>{const e=$('#clk');if(e)e.textContent=new Date().toLocaleTimeString('en-PH')};f();clearInterval(window.ck);window.ck=setInterval(f,1000)};
async function act(a){const n=Date.now(),o=open();
if(a=='in'){if(o)return err('Already timed in.');S.records.push({id:nid(),in:n,out:null,breaks:[],remarks:''})}
else if(!o)return err('Time in first.');
else if(a=='bs'){if(o.breaks.some(b=>b.e==null))return err('A break is already running.');o.breaks.push({s:n,e:null})}
else if(a=='be'){const b=o.breaks.find(b=>b.e==null);if(!b)return err('No break to end.');b.e=n}
else if(a=='out'){if(o.breaks.some(b=>b.e==null))return err('End your break first.');if(n<=o.in)return err('Invalid time.');o.out=n}
await save();toast('Recorded '+tm(n));route()}
const err=m=>{$('#msg').textContent=m};
let F={q:'',f:'all'};
function status(r){return!r.out?'incomplete':r.adj?'manual':lt(r)?'late':'completed'}
function history(){const rows=S.records.slice().sort((a,b)=>b.in-a.in).filter(r=>(!F.q||E.dkey(r.in).includes(F.q))&&(F.f=='all'||status(r)==F.f||(F.f=='manual'&&r.manual)));
return`<h2>Attendance History</h2>${warn()}<div class="row c"><input type="date" id="fq" value="${F.q}" style="width:auto" onchange="F.q=this.value;route()"><select id="ff" style="width:auto" onchange="F.f=this.value;route()">${['all','completed','incomplete','late','manual'].map(x=>`<option ${F.f==x?'selected':''}>${x}</option>`).join('')}</select><button onclick="quick()">+ Log a day by hours</button><button class="s" onclick="edit()">+ Manual entry (exact times)</button></div>
<div class="c tw"><table><tr><th>Date</th><th>In</th><th>Breaks</th><th>Out</th><th>Rendered</th><th>Status</th><th>Remarks</th><th></th></tr>${rows.map(r=>`<tr><td>${dt(E.dkey(r.in))}</td><td>${tm(r.in)}</td><td>${r.breaks.map(b=>tm(b.s)+'–'+tm(b.e)).join(', ')||'—'}</td><td>${tm(r.out)}${r.out&&E.dkey(r.out)!=E.dkey(r.in)?' (+1)':''}</td><td>${r.out?E.fmt(R(r)):'—'}</td><td><span class="t ${!r.out?'w':'o'}">${status(r)}${r.manual&&r.out?' · manual':''}</span></td><td>${esc(r.remarks)}</td><td><button class="s" onclick="edit(${r.id})">Edit</button> <button class="d" onclick="del(${r.id})">Delete</button></td></tr>`).join('')||'<tr><td colspan=8>No records yet.</td></tr>'}</table></div>`}
const loc=t=>{if(!t)return'';const d=new Date(t-new Date(t).getTimezoneOffset()*6e4);return d.toISOString().slice(0,16)};
const par=v=>v?new Date(v).getTime():null;
function edit(id){const r=S.records.find(x=>x.id==id)||{id:nid(),in:null,out:null,breaks:[],remarks:'',_new:1};
const m=document.createElement('dialog');m.innerHTML=`<h3>${r._new?'Manual entry':'Edit record'}</h3><label>Time in</label><input type="datetime-local" id="e1" value="${loc(r.in)}"><label>Time out (can be next day)</label><input type="datetime-local" id="e2" value="${loc(r.out)}">
<label>Breaks (one per line: start,end as HH:MM — local times on the time-in date, end after start; past midnight uses next day)</label><textarea id="e3" rows=3>${r.breaks.map(b=>new Date(b.s).toTimeString().slice(0,5)+','+(b.e?new Date(b.e).toTimeString().slice(0,5):'')).join('\n')}</textarea>
<label>Adjustment (minutes, +/-) — requires a reason</label><input type="number" id="e4" value="${r.adj||0}"><label>Remarks / reason</label><textarea id="e5" rows=2>${esc(r.remarks)}</textarea><p class="err" id="em"></p><div class="row"><button id="ok">Save</button><button class="s" id="no">Cancel</button></div>`;
document.body.appendChild(m);m.showModal();$('#no').onclick=()=>m.remove();
$('#ok').onclick=async()=>{const n={...r,in:par($('#e1').value),out:par($('#e2').value),adj:+$('#e4').value||0,remarks:$('#e5').value.trim(),manual:r._new||r.manual};delete n._new;
if(n.adj&&!n.remarks)return $('#em').textContent='Enter a reason for the adjustment.';
const bs=[];for(const ln of $('#e3').value.split('\n').filter(x=>x.trim())){const[a,b]=ln.split(',').map(x=>x.trim());if(!/^\d\d:\d\d$/.test(a)||(b&&!/^\d\d:\d\d$/.test(b)))return $('#em').textContent='Break format: HH:MM,HH:MM';
const f=h=>{if(!h)return null;const d=new Date(n.in);const[hh,mm]=h.split(':');d.setHours(+hh,+mm,0,0);if(d<n.in)d.setDate(d.getDate()+1);return d.getTime()};const s=f(a);let e=f(b);if(e!=null&&e<=s)e+=864e5;bs.push({s,e})}
n.breaks=bs;const v=E.validate(n,S.records);if(v.length)return $('#em').textContent=v.join(' ');
if(r._new)S.records.push(n);else S.records[S.records.indexOf(r)]=n;await save();m.remove();toast('Saved');route()}}
async function del(id){if(!confirm('Delete this record? This cannot be undone (download a backup first if unsure).'))return;S.records=S.records.filter(r=>r.id!=id);await save();route()}
let CM=new Date();
function calendar(){const y=CM.getFullYear(),m=CM.getMonth(),f=new Date(y,m,1).getDay(),n=new Date(y,m+1,0).getDate();
return`<h2>Calendar</h2><div class="row c"><button class="s" onclick="CM=new Date(CM.getFullYear(),CM.getMonth()-1,1);route()">‹</button><b>${CM.toLocaleDateString('en-PH',{month:'long',year:'numeric'})}</b><button class="s" onclick="CM=new Date(CM.getFullYear(),CM.getMonth()+1,1);route()">›</button></div><div class="cal">${'SMTWTFS'.split('').map(d=>`<b>${d}</b>`).join('')}${'<div style="visibility:hidden"></div>'.repeat(f)}${[...Array(n)].map((_,i)=>{const k=E.dkey(new Date(y,m,i+1)),rs=S.records.filter(r=>E.dkey(r.in)==k);const h=rs.filter(r=>r.out).reduce((a,r)=>a+R(r),0);return`<div>${i+1}<br>${rs.length?(rs.some(r=>!r.out)?'<span class="t w">open</span>':`<span class="t o">${E.fmt(h)}</span>`):''}</div>`}).join('')}</div>`}
function journal(){const q=(window.JQ||'').toLowerCase(),L=S.journal.slice().sort((a,b)=>b.date.localeCompare(a.date)).filter(j=>JSON.stringify(j).toLowerCase().includes(q));
const fs=[['tasks','Tasks performed'],['skills','Skills learned'],['tools','Equipment / software used'],['problems','Problems encountered'],['solutions','Solutions applied'],['supervisor','Supervisor remarks'],['notes','Additional notes']];
return`<h2>Daily Journal</h2><div class="c"><label>Date</label><input type="date" id="jd" value="${today()}" onchange="jfill()">${fs.map(([k,l])=>`<label>${l}</label><textarea id="j_${k}" rows=2></textarea>`).join('')}<br><button onclick="jsave()">Save entry</button></div><input placeholder="Search journal…" value="${esc(window.JQ||'')}" onchange="JQ=this.value;route()" class="c"><div id="jl">${L.map(j=>`<div class="c"><b>${dt(j.date)}</b> <button class="s" onclick="$('#jd').value='${j.date}';jfill();scrollTo(0,0)">Edit</button> <button class="d" onclick="jdel('${j.date}')">Delete</button>${fs.map(([k,l])=>j[k]?`<p><small>${l}</small><br>${esc(j[k])}</p>`:'').join('')}</div>`).join('')||'<p>No entries.</p>'}</div>`}
journal.after=()=>jfill();
const JF=['tasks','skills','tools','problems','solutions','supervisor','notes'];
function jfill(){const j=S.journal.find(x=>x.date==$('#jd').value)||{};JF.forEach(k=>$('#j_'+k).value=j[k]||'')}
async function jsave(){const e={date:$('#jd').value};JF.forEach(k=>e[k]=$('#j_'+k).value.trim());if(!e.date)return toast('Pick a date');S.journal=S.journal.filter(x=>x.date!=e.date);S.journal.push(e);await save();toast('Journal saved');route()}
async function jdel(d){if(confirm('Delete journal entry for '+d+'?')){S.journal=S.journal.filter(x=>x.date!=d);await save();route()}}
function sorted(){return done().sort((a,b)=>a.in-b.in)}
function table(rows){let cum=0;return`<table><tr><th>Date</th><th>Time in</th><th>Breaks</th><th>Time out</th><th>Break total</th><th>Rendered</th><th>Cumulative</th></tr>${rows.map(r=>{cum+=R(r);return`<tr><td>${E.dkey(r.in)}</td><td>${tm(r.in)}</td><td>${r.breaks.map(b=>tm(b.s)+'–'+tm(b.e)).join(', ')||'—'}</td><td>${tm(r.out)}</td><td>${E.fmt(E.breakMs(r))}</td><td>${E.fmt(R(r))}</td><td>${E.fmt(cum)}</td></tr>`}).join('')}</table>`}
function reports(){return`<h2>Reports & Exports</h2><div class="c row"><label>From</label><input type="date" id="rf" style="width:auto"><label>To</label><input type="date" id="rt" style="width:auto"></div><div class="c row"><button onclick="csv('timesheet')">CSV: Timesheet (Excel)</button><button onclick="csv('weekly')">CSV: Weekly summary</button><button onclick="csv('monthly')">CSV: Monthly summary</button><button onclick="csv('journal')">CSV: Journal</button><button onclick="csv('remaining')">CSV: Remaining hours</button><button class="s" onclick="prt()">Print / Save as PDF</button></div><p><small>The PDF is made with your browser's print dialog → "Save as PDF". Daily report = filter dates to one day.</small></p><div class="pr" id="pa"></div>`}
function range(){const f=$('#rf')?.value||'0000',t=$('#rt')?.value||'9999';return sorted().filter(r=>{const k=E.dkey(r.in);return k>=f&&k<=t})}
function prt(){const s=S.settings,rs=range(),j=S.journal.filter(x=>x.date>=($('#rf').value||'0')&&x.date<=($('#rt').value||'9'));
$('#pa').innerHTML=`<h2>OJT Timesheet</h2><p>Name: ${esc(s.name)} · School: ${esc(s.school)} · Program: ${esc(s.program)}<br>Company: ${esc(s.company)} · Period: ${$('#rf').value||'start'} to ${$('#rt').value||'present'}</p>${table(rs)}<p><b>Total this period: ${E.fmt(rs.reduce((a,r)=>a+R(r),0))}</b> · Overall: ${E.fmt(total())} of ${s.required}h · Remaining: ${E.fmt(Math.max(0,s.required*H-total()))}</p>${j.length?'<h3>Journal</h3>'+j.map(x=>`<p><b>${x.date}</b> — ${esc(x.tasks)} ${x.skills?'| Skills: '+esc(x.skills):''}</p>`).join(''):''}<br><br><p>Student signature: ____________________ &nbsp; Supervisor signature: ____________________</p>`;window.print()}
function dl(name,txt,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type}));a.download=name;a.click()}
const cs=a=>a.map(r=>r.map(c=>'"'+String(c??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
function csv(k){const s=S.settings,rs=range();let rows;
if(k=='timesheet'){let c=0;rows=[['Name',s.name,'School',s.school,'Program',s.program,'Company',s.company],[],['Date','Time In','Breaks','Time Out','Break (min)','Rendered (h)','Cumulative (h)','Remarks']].concat(rs.map(r=>{c+=R(r);return[E.dkey(r.in),tm(r.in),r.breaks.map(b=>tm(b.s)+'-'+tm(b.e)).join('; '),tm(r.out),Math.round(E.breakMs(r)/6e4),(R(r)/H).toFixed(2),(c/H).toFixed(2),r.remarks]}))}
else if(k=='weekly'||k=='monthly'){const m={};rs.forEach(r=>{const d=new Date(r.in);let key=E.dkey(r.in).slice(0,7);if(k=='weekly'){d.setDate(d.getDate()-((d.getDay()+6)%7));key=E.dkey(d)}m[key]=(m[key]||0)+R(r)});rows=[[k=='weekly'?'Week starting':'Month','Hours']].concat(Object.entries(m).sort().map(([a,b])=>[a,(b/H).toFixed(2)]))}
else if(k=='journal')rows=[['Date',...JF]].concat(S.journal.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(j=>[j.date,...JF.map(f=>j[f])]));
else rows=[['Required (h)','Completed (h)','Remaining (h)','Estimated completion'],[s.required,(total()/H).toFixed(2),(Math.max(0,s.required*H-total())/H).toFixed(2),eta()]];
dl('ojt-'+k+'.csv','\ufeff'+cs(rows),'text/csv;charset=utf-8')}
function settings(){const s=S.settings,f=(k,l,t='text')=>`<label>${l}</label><input type="${t}" step="any" id="s_${k}" value="${esc(s[k]??'')}">`;
return`<h2>Settings</h2><div class="c">${f('name','Student name')}${f('school','School')}${f('program','Program')}${f('company','Company')}${f('required','Required OJT hours','number')}${f('openDays','Days already completed before using this app (added to Days attended)','number')}${f('opening','Hours already completed before using this app (added to your total)','number')}${f('daily','Daily target (hours)','number')}${f('start','OJT start date','date')}${f('startTime','Expected time-in (for late detection)','time')}
<label>Work days</label><div class="row">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d,i)=>`<label style="margin:0"><input type="checkbox" class="wd" value="${i}" ${s.days.includes(i)?'checked':''} style="width:auto"> ${d}</label>`).join('')}</div>
<label>Round rendered time to nearest</label><select id="s_round">${[1,5,15,30].map(n=>`<option value="${n}" ${s.round==n?'selected':''}>${n} min${n==1?' (no rounding)':''}</option>`).join('')}</select><label>Theme</label><select id="s_theme"><option ${s.theme=='light'?'selected':''}>light</option><option ${s.theme=='dark'?'selected':''}>dark</option></select><p><small>Breaks are always treated as unpaid and subtracted.</small></p><button onclick="sset()">Save settings</button></div>`}
async function sset(){const s=S.settings;['name','school','program','company','start','startTime','theme'].forEach(k=>s[k]=$('#s_'+k).value);s.required=Math.max(1,+$('#s_required').value||486);s.opening=Math.max(0,+$('#s_opening').value||0);s.openDays=Math.max(0,Math.round(+$('#s_openDays').value||0));s.daily=Math.max(.5,+$('#s_daily').value||8);s.round=+$('#s_round').value;s.days=[...document.querySelectorAll('.wd:checked')].map(x=>+x.value);await save();toast('Settings saved');route()}
function backup(){return`<h2>Backup & Restore</h2><div class="c"><p>⚠ Records live only in this browser on this device. Clearing site data or switching devices loses them. Download backups regularly. Nothing is sent to any server.</p><button onclick="bk()">Download JSON backup</button></div><div class="c"><b>Restore / transfer to another device</b><p><small>Choose a backup file. It is validated first; your current data is replaced only if valid.</small></p><input type="file" accept=".json,application/json" onchange="rs(this.files[0])"><p class="err" id="bm"></p></div>`}
const bk=()=>dl('ojt-backup-'+today()+'.json',JSON.stringify({app:'ojt-tracker',version:1,data:S},null,1),'application/json');
async function rs(f){if(!f)return;try{const j=JSON.parse(await f.text()),d=j.data;if(j.app!='ojt-tracker'||!d||!Array.isArray(d.records)||!Array.isArray(d.journal)||!d.settings)throw'Not a valid OJT Tracker backup.';
for(const r of d.records)if(typeof r.in!='number'||(r.out!=null&&typeof r.out!='number')||!Array.isArray(r.breaks))throw'A record in the file is malformed.';
if(!confirm(`Replace current data with backup (${d.records.length} records, ${d.journal.length} journal entries)?`))return;S={...DEF,...d,settings:{...DEF.settings,...d.settings}};await save();toast('Restored');route()}catch(e){$('#bm').textContent=typeof e=='string'?e:'Invalid JSON file.'}}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();window.dp=e;route()});
window.addEventListener('hashchange',route);
(async()=>{db=await idb();const d=await load();if(d)S={...DEF,...d,settings:{...DEF.settings,...d.settings}};route();
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{})})();

function quick(){const m=document.createElement('dialog');m.innerHTML=`<h3>Log a day by hours</h3><p><small>For days you forgot to record. Enter how many hours you rendered; exact clock times are filled in for you.</small></p><label>Date</label><input type="date" id="q1" value="${S.settings.start||today()}"><label>Hours rendered (e.g. 8 or 7.5)</label><input type="number" step="0.25" id="q2" value="${S.settings.daily||8}"><label>Unpaid break (minutes, 0 for none)</label><input type="number" id="q3" value="60"><label>Start time</label><input type="time" id="q4" value="08:00"><label>Remarks</label><input id="q5" value="Logged manually"><p class="err" id="qm"></p><div class="row"><button id="ok">Add day</button><button class="s" id="no">Cancel</button></div>`;
document.body.appendChild(m);m.showModal();$('#no').onclick=()=>m.remove();
$('#ok').onclick=async()=>{const d=$('#q1').value,h=+$('#q2').value,b=+$('#q3').value||0,st=$('#q4').value||'08:00';
if(!d)return $('#qm').textContent='Pick a date.';if(!(h>0&&h<=24))return $('#qm').textContent='Hours must be between 0 and 24.';
const i=new Date(d+'T'+st).getTime(),o=i+h*H+b*6e4,s=i+Math.min(4,h/2)*H;
const r={id:nid(),in:i,out:o,breaks:b>0?[{s,e:s+b*6e4}]:[],remarks:$('#q5').value.trim()||'Logged manually',manual:1};
const v=E.validate(r,S.records);if(v.length)return $('#qm').textContent=v.join(' ');S.records.push(r);await save();m.remove();toast('Day added');route()}}
