import json, time
from playwright.sync_api import sync_playwright
OUT="/workspace/tnk-dev/backups/backup-20261005-0329-server-save-on/"
ids=json.load(open("/tmp/srv/ids.json")); R=ids["report_id"]; X=ids["rx_id"]
JS=r"""async ([R,X])=>{
 const K='AIzaSyDYzK-rOfLVJxZnxTZCeNiY2QEC-UZl20w', B='https://firestore.googleapis.com/v1/projects/thai-news-kr/databases/(default)/documents', D='projects/thai-news-kr/databases/(default)/documents';
 const S=v=>({stringValue:v}), I=v=>({integerValue:String(v)});
 const out=[];
 async function go(name,method,path,body,q){
   const r=await fetch(B+path+'?key='+K+(q||''),{method,headers:{'content-type':'application/json'},body:body?JSON.stringify(body):undefined});
   let t=await r.text(); let st=''; try{const j=JSON.parse(t); st=(j.error&&(j.error.status+': '+j.error.message))||(Array.isArray(j)?JSON.stringify(j).slice(0,160):JSON.stringify(j).slice(0,160));}catch(e){st=t.slice(0,160)}
   out.push({name,method,path,http:r.status,resp:st});
 }
 const commit=(w)=>go(w.n,'POST',':commit',{writes:[w.w]});
 await go('1 신고 읽기(로그인 없음)','GET','/reports/'+R);
 await go('2 신고 목록 읽기(승인함 쿼리, 로그인 없음)','POST',':runQuery',{structuredQuery:{from:[{collectionId:'reports'}],limit:1}});
 await go('3 신고 고치기(update memo)','PATCH','/reports/'+R,{fields:{memo:S('바꿈')}},'&updateMask.fieldPaths=memo&currentDocument.exists=true');
 await go('4 신고 지우기(delete)','DELETE','/reports/'+R);
 await go('5 반응 읽기','GET','/rx/'+X);
 await go('6 반응 고치기(update v)','PATCH','/rx/'+X,{fields:{v:I(-1)}},'&updateMask.fieldPaths=v&currentDocument.exists=true');
 await go('7 반응 지우기(delete)','DELETE','/rx/'+X);
 await commit({n:'8 신고 새로 만들기 — 다른 사이트 url(모양 검사)',w:{update:{name:D+'/reports/zzDeniedProbeUrl',fields:{id:S('probe'),kind:S('article'),type:S('etc'),memo:S('[테스트] 거부 확인'),url:S('https://example.com/'),ed:S('probe')}},updateTransforms:[{fieldPath:'at',setToServerValue:'REQUEST_TIME'}],currentDocument:{exists:true}}});
 await commit({n:'9 반응 새로 만들기 — 허용 안 된 키 uid(개인 정보 막기)',w:{update:{name:D+'/rx/zzDeniedProbeUid',fields:{a:S('test/probe'),k:S('h'),v:I(1),uid:S('someone')}},updateTransforms:[{fieldPath:'at',setToServerValue:'REQUEST_TIME'}],currentDocument:{exists:true}}});
 await go('10 운영자 목록 config/admins 쓰기','PATCH','/config/admins',{fields:{}},'&updateMask.fieldPaths=zzNone&currentDocument.exists=true');
 await go('11 남의 users/{uid} 쓰기(로그인 없음)','PATCH','/users/zzDeniedProbe',{fields:{v:I(1)}},'&currentDocument.exists=true');
 await go('12 규칙에 없는 경로 쓰기(zz_probe)','PATCH','/zz_probe/x',{fields:{a:S('x')}},'&currentDocument.exists=true');
 await go('13 config/admins 읽기(허용되어야 함 — 비교용)','GET','/config/admins');
 return out;}"""
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
    pg=b.new_page(); pg.goto("https://p-max168.github.io/thai-news-kr/?_=%d"%time.time(),wait_until="load")
    res=pg.evaluate(JS,[R,X])
    with open(OUT+"live-denied-writes.txt","w") as f:
        f.write("10-05 %s BKK · 라이브 페이지 안에서 Firestore REST 직접 호출(로그인 없음, 사이트 공개 API 키). reports=%s rx=%s\n"%(time.strftime("%H:%M"),R,X))
        f.write("만들기 시험(8·9·11·12)은 currentDocument.exists=true 를 붙여서, 규칙이 잘못 허용해도 문서가 생기지 않게(404) 함 · 10 은 없는 필드만 지우는 무해 마스크\n")
        for r in res:
            line="%s | %s %s | HTTP %s | %s"%(r["name"],r["method"],r["path"],r["http"],r["resp"]); print(line); f.write(line+"\n")
    b.close()
