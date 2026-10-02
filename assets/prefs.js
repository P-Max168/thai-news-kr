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

  function normalize(d) {
    var b = blank();
    if (!d || typeof d !== "object") return b;
    for (var k in b) if (d[k] !== undefined) b[k] = d[k];
    b.taste = b.taste || {}; b.taste.w = b.taste.w || {}; b.taste.votes = b.taste.votes || {}; b.taste.vf = b.taste.vf || {};
    b.ui = b.ui || {};
    if (!b.settingsAt && b.onboarded) b.settingsAt = b.updatedAt || 0;
    return b;
  }
  function settingsSig(d) { return JSON.stringify([d.onboarded, d.persona, d.topics]); }

  var doc = normalize(localAdapter.readSync());
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
    adapters: { local: localAdapter }
  };
})(window);
