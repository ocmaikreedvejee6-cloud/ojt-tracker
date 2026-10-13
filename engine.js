(function(g){const M=60000;
const E={
breakMs(r,now){return(r.breaks||[]).reduce((a,b)=>a+Math.max(0,(b.e==null?(now==null?b.s:now):b.e)-b.s),0)},
rendered(r,round){if(!r.out)return 0;let ms=Math.max(0,r.out-r.in-E.breakMs(r));if(round>1){const u=round*M;ms=Math.round(ms/u)*u}return Math.max(0,ms+(r.adj||0)*M)},
fmt(ms){const m=Math.round(ms/M);return Math.floor(m/60)+'h '+String(m%60).padStart(2,'0')+'m'},
dkey(t){const d=new Date(t);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')},
validate(r,all){const e=[];if(!r.in)e.push('Time in is required.');
if(r.out!=null&&r.out<=r.in)e.push('Time out must be after time in (zero or negative duration).');
const bs=(r.breaks||[]).slice().sort((a,b)=>a.s-b.s);let prev=r.in;
for(const b of bs){if(b.e!=null&&b.e<=b.s)e.push('A break ends before it starts.');if(b.s<prev)e.push('Breaks overlap or start before time in.');if(r.out&&b.e!=null&&b.e>r.out)e.push('A break ends after time out.');prev=b.e==null?b.s:b.e}
for(const o of all||[]){if(o.id===r.id)continue;const a1=r.in,a2=r.out||Infinity,b1=o.in,b2=o.out||Infinity;if(a1<b2&&b1<a2)e.push('Overlaps another record ('+E.dkey(o.in)+') - same period would be counted twice.')}
return e}};
if(typeof module!=='undefined')module.exports=E;else g.Engine=E})(this);
