/* 태국 뉴스 한눈에 — 사용자 설정 저장소(작은 인터페이스)
 *
 * 지금은 이 기기의 localStorage 에만 저장한다. 나중에 Google 로그인(Firebase)을 붙일 때는
 * 같은 모양의 어댑터 { name, read() → Promise<doc|null>, write(doc) → Promise } 를 만들어
 * TNStore.attach(adapter) 로 연결하면 된다(로컬 문서와 원격 문서를 updatedAt 기준으로 합침).
 *
 * 문서(doc) 모양 — Firestore 의 users/{uid} 문서 하나에 그대로 넣을 수 있게 평평하게 유지:
 *   { v:1, onboarded, persona, topics:[topicId…]|null(전체), taste:{ w:{feature:weight}, votes:{storyKey:±1} },
 *     ui:{ installHint: "dismissed"|undefined }, updatedAt: ms }
 */
(function (root) {
  "use strict";
  var KEY = "tnk.profile.v1";
  function blank() { return { v: 1, onboarded: false, persona: null, topics: null, taste: { w: {}, votes: {} }, ui: {}, updatedAt: 0 }; }

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
    b.taste = b.taste || {}; b.taste.w = b.taste.w || {}; b.taste.votes = b.taste.votes || {};
    b.ui = b.ui || {};
    return b;
  }

  var doc = normalize(localAdapter.readSync());
  var remotes = [], subs = [];

  function save() {
    doc.updatedAt = Date.now();
    var p = [localAdapter.write(doc)];
    remotes.forEach(function (a) { p.push(Promise.resolve(a.write(doc)).catch(function (e) { console.warn("[TNStore] 원격 저장 실패:", a.name, e); })); });
    subs.forEach(function (fn) { try { fn(doc); } catch (e) {} });
    return Promise.all(p);
  }

  root.TNStore = {
    KEY: KEY,
    get: function () { return doc; },
    /* fn(doc) 안에서 값을 바꾸면 저장 */
    update: function (fn) { fn(doc); return save(); },
    reset: function (fields) {
      var b = blank();
      (fields || Object.keys(b)).forEach(function (k) { doc[k] = b[k]; });
      return save();
    },
    subscribe: function (fn) { subs.push(fn); },
    /* 원격 어댑터 연결(예: Firebase). 새 쪽(updatedAt 큰 쪽)을 채택하고 양쪽에 다시 저장 */
    attach: function (adapter) {
      remotes.push(adapter);
      return Promise.resolve(adapter.read()).then(function (r) {
        if (r && (r.updatedAt || 0) > (doc.updatedAt || 0)) { doc = normalize(r); localAdapter.write(doc); subs.forEach(function (fn) { fn(doc); }); }
        else return adapter.write(doc);
      });
    },
    detach: function (name) { remotes = remotes.filter(function (a) { return a.name !== name; }); },
    adapters: { local: localAdapter }
  };
})(window);
