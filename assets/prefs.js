/* 태국 뉴스 한눈에 — 사용자 설정 저장소(작은 인터페이스)
 *
 * 기본은 이 기기의 localStorage. Google 로그인(assets/auth.js → assets/fb.js)하면 Firestore 어댑터
 * { name, read() → Promise<doc|null>, write(doc) → Promise } 를 TNStore.attach(adapter, merge) 로 연결한다.
 * 로그인하지 않으면(또는 Firebase 를 못 불러오면) 예전과 똑같이 이 기기에만 저장된다.
 *
 * 문서(doc) 모양 — Firestore users/{uid} 에 그대로(ui 는 이 기기 전용이라 빼고) 저장:
 *   { v:1, onboarded, persona, topics:[topicId…]|null(전체),
 *     taste:{ w:{feature:weight}, votes:{storyKey:±1}, vf:{storyKey:[feature…]} },
 *     ui:{ installHintUntil:ms }, updatedAt: ms(무엇이든 바뀐 시각), settingsAt: ms(persona·topics·onboarded 가 바뀐 시각) }
 */
(function (root) {
  "use strict";
  var KEY = "tnk.profile.v1";
  function blank() { return { v: 1, onboarded: false, persona: null, topics: null, taste: { w: {}, votes: {}, vf: {} }, ui: {}, updatedAt: 0, settingsAt: 0 }; }

  var localAdapter = {
    name: "local",
    readSync: function () {
      try { var s = root.localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; }
    },
    read: function () { return Promise.resolve(this.readSync()); },
    write: function (doc) {
      try { root.localStorage.setItem(KEY, JSON.stringify(doc)); } catch (e) { /* 사생활 보호 모드 등: 이번 세션만 유지 */ }
      return Promise.resolve();
    },
    clear: function () { try { root.localStorage.removeItem(KEY); } catch (e) {} return Promise.resolve(); }
  };

  /* ---------- 옛 주제 id 옮기기(2026-10-03: 파타야·시라차 → 동부(촌부리·라용) 'east') ----------
   * 이 기기·클라우드 문서 모두 읽을 때마다 조용히 바꾼다(중복 제거, 오류 없음). assets/topics.js 의 ALIAS 와 같은 표.
   * - topics: ["pattaya","visa","sriracha"] → ["east","visa"]
   * - taste: 특징 이름 t:/l:pattaya·sriracha → t:/l:east. 가중치는 표(vf)로 다시 세고 vf 없는 옛 몫만 더함(같은 기사가 두 번 세어지지 않게)
   * persona(파타야/시라차 거주자 등)는 그대로 — 페르소나 이름·날씨/내 주변 지역 기본값으로 쓰임. */
  var TOPIC_ALIAS = { pattaya: "east", sriracha: "east" };
  var W_MAX = 6;   // assets/taste.js 와 같은 값
  function featAlias(f) {
    var m = /^([tl]):(.+)$/.exec(f);
    return m && TOPIC_ALIAS[m[2]] ? m[1] + ":" + TOPIC_ALIAS[m[2]] : f;
  }
  function migrate(d) {
    if (!d || typeof d !== "object") return d;
    if (Array.isArray(d.topics)) {
      var out = [];
      d.topics.forEach(function (t) { t = TOPIC_ALIAS[t] || t; if (typeof t === "string" && out.indexOf(t) < 0) out.push(t); });
      d.topics = out;
    }
    var ta = d.taste;
    if (ta && typeof ta === "object") {
      var w = ta.w || {}, vf = ta.vf || {}, votes = ta.votes || {};
      var old = Object.keys(w).filter(function (f) { return featAlias(f) !== f; });
      Object.keys(vf).forEach(function (k) { (vf[k] || []).forEach(function (f) { if (featAlias(f) !== f && old.indexOf(f) < 0) old.push(f); }); });
      if (old.length) {
        var sumVf = function (feat, table) { var n = 0; Object.keys(votes).forEach(function (k) { if ((table[k] || []).indexOf(feat) >= 0) n += votes[k] || 0; }); return n; };
        var targets = {};
        old.forEach(function (f) { targets[featAlias(f)] = 1; });
        var rest = {};
        Object.keys(targets).forEach(function (n) {
          rest[n] = 0;
          Object.keys(w).concat(old).forEach(function (f) {
            if (featAlias(f) === n && rest["_" + f] === undefined) { rest["_" + f] = 1; rest[n] += (w[f] || 0) - sumVf(f, vf); }
          });
        });
        var nvf = {};
        Object.keys(vf).forEach(function (k) {
          var o = []; (vf[k] || []).forEach(function (f) { f = featAlias(f); if (o.indexOf(f) < 0) o.push(f); }); nvf[k] = o;
        });
        old.forEach(function (f) { delete w[f]; });
        Object.keys(targets).forEach(function (n) {
          var v = Math.max(-W_MAX, Math.min(W_MAX, sumVf(n, nvf) + rest[n]));
          if (Math.abs(v) < 1e-9) delete w[n]; else w[n] = v;
        });
        ta.w = w; ta.vf = nvf;
      }
    }
    return d;
  }

  function normalize(d) {
    var b = blank();
    if (!d || typeof d !== "object") return b;
    for (var k in b) if (d[k] !== undefined) b[k] = d[k];
    b.taste = b.taste || {}; b.taste.w = b.taste.w || {}; b.taste.votes = b.taste.votes || {}; b.taste.vf = b.taste.vf || {};
    b.ui = b.ui || {};
    if (!b.settingsAt && b.onboarded) b.settingsAt = b.updatedAt || 0;
    return migrate(b);
  }
  function settingsSig(d) { return JSON.stringify([d.onboarded, d.persona, d.topics]); }

  var doc = normalize(localAdapter.readSync());
  // 옛 주제 id 를 옮겼으면 이 기기 저장값도 바로 고쳐 둠(시각은 그대로 — 다른 기기 설정을 덮지 않게)
  try { var raw0 = root.localStorage.getItem(KEY); if (raw0 && /"(pattaya|sriracha)"|[tl]:(pattaya|sriracha)/.test(raw0.replace(/"persona":"[^"]*"/, ""))) localAdapter.write(doc); } catch (e) {}
  var remotes = [], subs = [];

  function notify(src) { subs.forEach(function (fn) { try { fn(doc, src); } catch (e) { console.warn(e); } }); }
  function writeRemotes() {
    return remotes.map(function (a) { return Promise.resolve().then(function () { return a.write(doc); }).catch(function (e) { console.warn("[TNStore] 원격 저장 실패:", a.name, e); }); });
  }
  function save(sigBefore) {
    doc.updatedAt = Date.now();
    if (sigBefore != null && sigBefore !== settingsSig(doc)) doc.settingsAt = doc.updatedAt;
    var p = [localAdapter.write(doc)].concat(writeRemotes());
    notify("local");
    return Promise.all(p);
  }

  root.TNStore = {
    KEY: KEY,
    get: function () { return doc; },
    /* fn(doc) 안에서 값을 바꾸면 저장 */
    update: function (fn) { var sig = settingsSig(doc); fn(doc); return save(sig); },
    reset: function (fields) {
      var b = blank(), sig = settingsSig(doc);
      (fields || Object.keys(b)).forEach(function (k) { doc[k] = b[k]; });
      return save(sig);
    },
    /* fn(doc, src) — src: "local"(이 기기에서 바뀜) | "remote"(로그인 병합·다른 기기에서 바뀜) */
    subscribe: function (fn) { subs.push(fn); },
    /* 원격 어댑터 연결. merge(local, remote) 가 있으면 그 결과를, 없으면 updatedAt 큰 쪽을 채택하고 양쪽에 저장 */
    attach: function (adapter, merge) {
      remotes = remotes.filter(function (a) { return a.name !== adapter.name; });
      return Promise.resolve(adapter.read()).then(function (r) {
        var next;
        if (r) r = migrate(r);   // 클라우드 문서의 옛 주제 id 도 합치기 전에 옮김
        if (merge) next = merge(doc, r);
        else next = (r && (r.updatedAt || 0) > (doc.updatedAt || 0)) ? r : doc;
        var ui = doc.ui;
        doc = normalize(next); doc.ui = ui || {};   // ui(설치 안내 등)는 이 기기 전용
        localAdapter.write(doc);
        remotes.push(adapter);
        notify("remote");
        return adapter.write(doc);
      });
    },
    /* 다른 기기에서 바뀐 원격 문서를 받음(원격엔 다시 쓰지 않음) */
    applyRemote: function (r) {
      if (!r || (r.updatedAt || 0) <= (doc.updatedAt || 0)) return false;
      var ui = doc.ui; doc = normalize(r); doc.ui = ui || {};
      localAdapter.write(doc); notify("remote");
      return true;
    },
    detach: function (name) { remotes = remotes.filter(function (a) { return a.name !== name; }); },
    adapters: { local: localAdapter },
    migrate: migrate
  };
})(window);
