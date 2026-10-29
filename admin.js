/**
 * PixelCraft Studio — Admin Panel  v4
 * Password : pixelcraft2026
 *
 * Features
 * ─────────
 * • Edit name, role & photo for every member (original + added)
 * • ADD new team members → card appears in Team section
 * • REMOVE any member including the original 8
 *   - Extra members (id > 8) are purged from storage
 *   - Original members (id 1-8) are hidden on the page; their
 *     slot is tracked in localStorage so the hide survives reload
 * • All changes persist in localStorage / base64 photos
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     CONFIG
  ───────────────────────────────────────────────────────────── */
  var PASS           = 'pixelcraft2026';
  var LS_TEAM_KEY    = 'pcs_team_v4';
  var LS_DEL_KEY     = 'pcs_deleted_v4';   /* tracks removed original IDs */
  var SS_KEY         = 'pcs_auth';
  var ORIG_COUNT     = 8;

  var DEFAULT_TEAM = [
    { id:1, name:'[Name 1]', role:'Chief Executive Officer',  photo:'' },
    { id:2, name:'[Name 2]', role:'Human Resources Manager',  photo:'' },
    { id:3, name:'[Name 3]', role:'IT Manager',               photo:'' },
    { id:4, name:'[Name 4]', role:'Operations Manager',       photo:'' },
    { id:5, name:'[Name 5]', role:'Project Manager',          photo:'' },
    { id:6, name:'[Name 6]', role:'Web Developer',            photo:'' },
    { id:7, name:'[Name 7]', role:'Graphic Designer',         photo:'' },
    { id:8, name:'[Name 8]', role:'Marketing Manager',        photo:'' }
  ];

  /* ─────────────────────────────────────────────────────────────
     STATE
  ───────────────────────────────────────────────────────────── */
  var deletedOrigIds = loadDeletedIds();   /* int[] of removed original IDs */
  var team           = loadTeam();
  var loggedIn       = sessionStorage.getItem(SS_KEY) === '1';
  var nextId         = Math.max.apply(null, [8].concat(team.map(function(m){ return m.id; }))) + 1;

  /* ─────────────────────────────────────────────────────────────
     PERSISTENCE
  ───────────────────────────────────────────────────────────── */
  function loadDeletedIds() {
    try {
      var raw = localStorage.getItem(LS_DEL_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  }

  function saveDeletedIds() {
    localStorage.setItem(LS_DEL_KEY, JSON.stringify(deletedOrigIds));
  }

  function loadTeam() {
    try {
      var raw = localStorage.getItem(LS_TEAM_KEY);
      var delIds = loadDeletedIds();
      if (raw) {
        var parsed = JSON.parse(raw);
        /* Original 8: include only those not deleted */
        var base = DEFAULT_TEAM
          .filter(function (def) { return delIds.indexOf(def.id) === -1; })
          .map(function (def) {
            var saved = parsed.find(function (p) { return p.id === def.id; });
            return saved || JSON.parse(JSON.stringify(def));
          });
        /* Extra members */
        var extras = parsed.filter(function (p) { return p.id > ORIG_COUNT; });
        return base.concat(extras);
      }
      /* First load: all originals unless already deleted */
      return DEFAULT_TEAM
        .filter(function (def) { return delIds.indexOf(def.id) === -1; })
        .map(function (def) { return JSON.parse(JSON.stringify(def)); });
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT_TEAM));
  }

  function saveTeam() {
    localStorage.setItem(LS_TEAM_KEY, JSON.stringify(team));
  }

  /* ─────────────────────────────────────────────────────────────
     PLACEHOLDER
  ───────────────────────────────────────────────────────────── */
  var PH = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">' +
    '<rect width="80" height="80" fill="#f3eafc"/>' +
    '<circle cx="40" cy="29" r="15" fill="#5B2A86"/>' +
    '<ellipse cx="40" cy="63" rx="24" ry="17" fill="#5B2A86"/>' +
    '</svg>'
  );

  /* ─────────────────────────────────────────────────────────────
     APPLY DATA → LIVE PAGE
  ───────────────────────────────────────────────────────────── */
  function applyToPage() {
    /* 1. Hide/show original member slots based on deletedOrigIds */
    for (var oid = 1; oid <= ORIG_COUNT; oid++) {
      var isRemoved = deletedOrigIds.indexOf(oid) !== -1;
      toggleOriginalSlot(oid, isRemoved);
    }

    /* 2. Update all active members */
    team.forEach(function (m) {
      var photo = m.photo || (m.id <= ORIG_COUNT ? 'photo-' + m.id + '.jpg' : '');

      if (m.id <= ORIG_COUNT) {
        setText('org-name-'  + m.id, m.name);
        setText('org-role-'  + m.id, m.role);
        if (m.photo) setSrc('org-photo-' + m.id, m.photo);
        setText('card-name-' + m.id, m.name);
        setText('card-role-' + m.id, m.role);
        if (photo)   setSrc('card-photo-' + m.id, photo);
      } else {
        ensureExtraCard(m);
        setText('card-name-' + m.id, m.name);
        setText('card-role-' + m.id, m.role);
        if (photo)   setSrc('card-photo-' + m.id, photo);
      }
    });

    /* 3. Remove DOM cards for deleted extra members */
    document.querySelectorAll('.member-card[data-extra]').forEach(function (card) {
      var cid = parseInt(card.getAttribute('data-extra'), 10);
      var alive = team.find(function (m) { return m.id === cid; });
      if (!alive) card.parentNode.removeChild(card);
    });
  }

  /* Hide or show a static original member's card + org chart node */
  function toggleOriginalSlot(id, hide) {
    var d = hide ? 'none' : '';

    /* Profile card */
    var nameEl = document.getElementById('card-name-' + id);
    if (nameEl) {
      var card = ancestor(nameEl, 'member-card');
      if (card) card.style.display = d;
    }

    /* Org chart — for CEO hide the whole ceo-row, for others hide the dept-column */
    var orgEl = document.getElementById('org-name-' + id);
    if (orgEl) {
      if (id === 1) {
        /* CEO row */
        var ceoRow = ancestor(orgEl, 'org-ceo-row');
        if (ceoRow) ceoRow.style.display = d;
      } else {
        /* Department column (hides the manager + any sub-branches beneath) */
        var deptCol = ancestor(orgEl, 'org-dept-column');
        if (deptCol) deptCol.style.display = d;
        /* Sub-role: if not in a dept-column, hide just the node card */
        if (!deptCol) {
          var nodeCard = ancestor(orgEl, 'org-node-card');
          if (nodeCard) nodeCard.style.display = d;
        }
      }
    }
  }

  /* Walk up the DOM to find the first ancestor with a given class */
  function ancestor(el, cls) {
    var node = el.parentNode;
    while (node && node !== document.body) {
      if (node.classList && node.classList.contains(cls)) return node;
      node = node.parentNode;
    }
    return null;
  }

  /* Inject a new .member-card into .profiles-grid for extra members */
  function ensureExtraCard(m) {
    if (document.getElementById('card-name-' + m.id)) return;
    var photo = m.photo || PH;
    var grid  = document.querySelector('.profiles-grid');
    if (!grid) return;
    var card  = document.createElement('div');
    card.className = 'member-card fade-up in-view';
    card.setAttribute('data-extra', m.id);
    card.innerHTML =
      '<div class="member-photo-frame">' +
        '<img src="' + photo + '" alt="' + esc(m.name) + '" ' +
        'class="member-img" id="card-photo-' + m.id + '" ' +
        'onerror="this.src=\'' + PH + '\'">' +
      '</div>' +
      '<h3 class="member-name" id="card-name-' + m.id + '">' + esc(m.name) + '</h3>' +
      '<span class="member-position" id="card-role-' + m.id + '">' + esc(m.role) + '</span>';
    grid.appendChild(card);
  }

  function setText(id, val) { var e = document.getElementById(id); if (e && val) e.textContent = val; }
  function setSrc (id, val) { var e = document.getElementById(id); if (e && val) e.src = val; }
  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ─────────────────────────────────────────────────────────────
     STYLES
  ───────────────────────────────────────────────────────────── */
  function injectStyles() {
    var css = [
      '#admFab{position:fixed;bottom:1.75rem;right:1.75rem;width:50px;height:50px;',
      'border-radius:50%;background:#5B2A86;border:none;cursor:pointer;',
      'box-shadow:0 6px 22px rgba(91,42,134,.4);',
      'display:flex;align-items:center;justify-content:center;z-index:8900;',
      'transition:background .25s,transform .2s,box-shadow .2s;}',
      '#admFab:hover{transform:scale(1.1);box-shadow:0 10px 28px rgba(91,42,134,.5);}',
      '#admFab.logged{background:#FF8A3D;}',
      '#admFab svg{width:22px;height:22px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}',

      '.adm-ov{position:fixed;inset:0;background:rgba(42,23,64,.6);',
      'backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);',
      'z-index:9000;display:flex;align-items:center;justify-content:center;',
      'padding:1rem;opacity:0;pointer-events:none;transition:opacity .22s;}',
      '.adm-ov.open{opacity:1;pointer-events:all;}',

      '.adm-box{background:#fff;border-radius:18px;',
      'box-shadow:0 24px 60px rgba(91,42,134,.2);',
      'font-family:inherit;color:#2A1740;position:relative;',
      'animation:admPop .28s cubic-bezier(.22,1,.36,1);}',
      '@keyframes admPop{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}',

      '.adm-x{position:absolute;top:.9rem;right:.9rem;width:32px;height:32px;',
      'border-radius:50%;background:#f3eafc;border:none;cursor:pointer;',
      'font-size:1.1rem;line-height:32px;text-align:center;color:#5B2A86;transition:background .2s;}',
      '.adm-x:hover{background:#ede4f7;}',

      /* Login */
      '#admLogin .adm-box{max-width:390px;width:100%;padding:2.4rem 2rem;text-align:center;}',
      '.adm-lock{width:54px;height:54px;background:#f3eafc;border-radius:14px;',
      'display:flex;align-items:center;justify-content:center;margin:0 auto 1.1rem;}',
      '.adm-lock svg{width:26px;height:26px;stroke:#5B2A86;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}',
      '#admLogin h2{font-size:1.4rem;font-weight:800;margin:0 0 .25rem;}',
      '#admLogin p{font-size:.88rem;color:#645579;margin-bottom:1.4rem;}',
      '.adm-pw{width:100%;padding:.78rem 1rem;border:2px solid #ede4f7;border-radius:10px;',
      'font-size:1rem;font-family:inherit;outline:none;transition:border-color .2s;',
      'margin-bottom:.7rem;box-sizing:border-box;}',
      '.adm-pw:focus{border-color:#5B2A86;}.adm-pw.bad{border-color:#e84393;}',
      '.adm-err{color:#e84393;font-size:.83rem;margin-bottom:.65rem;display:none;}',
      '.adm-err.on{display:block;}',
      '.adm-login-btn{width:100%;padding:.82rem;background:#5B2A86;color:#fff;',
      'border:none;border-radius:11px;font-size:1rem;font-weight:700;font-family:inherit;',
      'cursor:pointer;transition:background .2s,transform .15s;}',
      '.adm-login-btn:hover{background:#3f1961;transform:translateY(-1px);}',

      /* Panel */
      '#admPanel .adm-box{max-width:860px;width:100%;max-height:94vh;',
      'display:flex;flex-direction:column;overflow:hidden;}',
      '.adm-ph{padding:1.4rem 1.8rem .9rem;border-bottom:1px solid #ede4f7;',
      'display:flex;align-items:center;gap:.7rem;flex-shrink:0;flex-wrap:wrap;}',
      '.adm-ph h2{font-size:1.3rem;font-weight:800;margin:0;}',
      '.adm-badge{background:#f3eafc;color:#5B2A86;font-size:.7rem;font-weight:700;',
      'text-transform:uppercase;letter-spacing:.5px;',
      'padding:.22rem .7rem;border-radius:999px;border:1px dashed #7b3bb6;}',
      '.adm-pb{overflow-y:auto;padding:1.2rem 1.8rem;flex:1;}',
      '.adm-pf{padding:.9rem 1.8rem;border-top:1px solid #ede4f7;',
      'display:flex;justify-content:space-between;align-items:center;',
      'flex-shrink:0;gap:.7rem;flex-wrap:wrap;}',

      /* Rows */
      '.adm-row{display:grid;grid-template-columns:66px 1fr 1fr 36px;',
      'gap:.9rem;align-items:center;padding:.85rem 0;border-bottom:1px solid #f5effe;}',
      '.adm-row:last-child{border-bottom:none;}',
      '.adm-pcol{display:flex;flex-direction:column;align-items:center;gap:.3rem;}',
      '.adm-thumb{width:58px;height:58px;border-radius:50%;object-fit:cover;',
      'border:3px solid #ede4f7;cursor:pointer;display:block;transition:border-color .2s,transform .18s;}',
      '.adm-thumb:hover{border-color:#FF8A3D;transform:scale(1.06);}',
      '.adm-chg{font-size:.6rem;color:#FF8A3D;font-weight:700;text-align:center;cursor:pointer;line-height:1.2;}',
      '.adm-chg:hover{text-decoration:underline;}',
      '.adm-fcol{display:flex;flex-direction:column;gap:.42rem;}',
      '.adm-lbl{font-size:.68rem;font-weight:700;color:#645579;',
      'text-transform:uppercase;letter-spacing:.4px;margin-bottom:.05rem;}',
      '.adm-inp{padding:.5rem .72rem;border:1.5px solid #ede4f7;border-radius:9px;',
      'font-size:.91rem;font-family:inherit;outline:none;',
      'color:#2A1740;width:100%;box-sizing:border-box;transition:border-color .2s;}',
      '.adm-inp:focus{border-color:#5B2A86;}',
      '.adm-action-col{display:flex;align-items:center;justify-content:center;}',

      /* Delete button */
      '.adm-del{background:#fff0f5;border:1.5px solid #f9c0d5;border-radius:8px;',
      'width:34px;height:34px;display:flex;align-items:center;justify-content:center;',
      'cursor:pointer;transition:background .18s,border-color .18s,transform .15s;}',
      '.adm-del:hover{background:#ffe0ec;border-color:#e84393;transform:scale(1.1);}',
      '.adm-del svg{width:15px;height:15px;stroke:#e84393;fill:none;',
      'stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}',

      /* Confirm-delete dialog inside panel */
      '#admConfirmBox{position:absolute;inset:0;background:rgba(42,23,64,.55);',
      'backdrop-filter:blur(4px);border-radius:18px;',
      'display:none;align-items:center;justify-content:center;z-index:10;}',
      '#admConfirmBox.show{display:flex;}',
      '.adm-confirm-card{background:#fff;border-radius:14px;padding:2rem 1.8rem;',
      'max-width:340px;width:90%;text-align:center;',
      'box-shadow:0 12px 40px rgba(91,42,134,.25);}',
      '.adm-confirm-card h3{font-size:1.1rem;font-weight:800;margin:0 0 .5rem;color:#2A1740;}',
      '.adm-confirm-card p{font-size:.88rem;color:#645579;margin-bottom:1.4rem;line-height:1.5;}',
      '.adm-confirm-card .adm-warn{color:#e84393;font-weight:700;}',
      '.adm-confirm-btns{display:flex;gap:.75rem;justify-content:center;}',
      '.adm-cancel-btn{background:none;border:1.5px solid #ede4f7;border-radius:9px;',
      'padding:.6rem 1.3rem;font-family:inherit;font-size:.9rem;font-weight:600;',
      'color:#645579;cursor:pointer;transition:border-color .2s;}',
      '.adm-cancel-btn:hover{border-color:#5B2A86;color:#5B2A86;}',
      '.adm-confirm-del-btn{background:#e84393;color:#fff;border:none;border-radius:9px;',
      'padding:.6rem 1.3rem;font-family:inherit;font-size:.9rem;font-weight:700;',
      'cursor:pointer;transition:background .2s,transform .15s;}',
      '.adm-confirm-del-btn:hover{background:#c73080;transform:translateY(-1px);}',

      /* Divider + Add form */
      '.adm-divider{border:none;border-top:2px dashed #ede4f7;margin:1.1rem 0 .9rem;}',
      '#admAddForm{background:#f9f5ff;border-radius:13px;',
      'padding:1.1rem 1.2rem;border:1.5px dashed #c8a8f0;}',
      '#admAddForm h4{font-size:.95rem;font-weight:700;color:#5B2A86;',
      'margin:0 0 .85rem;display:flex;align-items:center;gap:.4rem;}',
      '#admAddForm h4 svg{width:17px;height:17px;stroke:#5B2A86;fill:none;',
      'stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}',
      '.adm-add-grid{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;}',
      '.adm-add-actions{display:flex;gap:.6rem;margin-top:.85rem;align-items:center;flex-wrap:wrap;}',
      '.adm-add-photo-btn{display:flex;align-items:center;gap:.4rem;',
      'background:#fff;border:1.5px solid #ede4f7;border-radius:9px;',
      'padding:.5rem .9rem;font-size:.85rem;font-weight:600;font-family:inherit;',
      'color:#5B2A86;cursor:pointer;transition:border-color .2s;}',
      '.adm-add-photo-btn:hover{border-color:#5B2A86;}',
      '.adm-add-photo-btn svg{width:15px;height:15px;stroke:#5B2A86;fill:none;',
      'stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}',
      '.adm-add-photo-preview{width:40px;height:40px;border-radius:50%;',
      'object-fit:cover;border:2px solid #ede4f7;display:none;}',
      '.adm-add-photo-preview.has-photo{display:block;}',
      '.adm-add-confirm{margin-left:auto;background:#5B2A86;color:#fff;',
      'border:none;border-radius:10px;padding:.55rem 1.4rem;',
      'font-size:.92rem;font-weight:700;font-family:inherit;cursor:pointer;',
      'display:flex;align-items:center;gap:.4rem;transition:background .2s,transform .15s;}',
      '.adm-add-confirm:hover{background:#3f1961;transform:translateY(-1px);}',
      '.adm-add-confirm svg{width:16px;height:16px;stroke:#fff;fill:none;',
      'stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;}',

      /* Footer buttons */
      '.adm-out{background:none;border:1.5px solid #ede4f7;border-radius:9px;',
      'padding:.55rem 1.1rem;font-family:inherit;font-size:.88rem;',
      'color:#645579;cursor:pointer;transition:border-color .2s,color .2s;}',
      '.adm-out:hover{border-color:#e84393;color:#e84393;}',
      '.adm-save{background:#FF8A3D;color:#fff;border:none;border-radius:11px;',
      'padding:.72rem 1.7rem;font-size:.97rem;font-weight:700;font-family:inherit;',
      'cursor:pointer;display:flex;align-items:center;gap:.5rem;',
      'transition:background .2s,transform .15s;}',
      '.adm-save:hover{background:#f07727;transform:translateY(-1px);}',
      '.adm-save svg{width:17px;height:17px;stroke:#fff;fill:none;',
      'stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;}',

      /* Toast */
      '#admToast{position:fixed;bottom:5rem;right:1.75rem;background:#2ecc71;color:#fff;',
      'padding:.7rem 1.25rem;border-radius:11px;font-size:.88rem;font-weight:600;',
      'font-family:inherit;box-shadow:0 6px 20px rgba(46,204,113,.38);z-index:9500;',
      'display:flex;align-items:center;gap:.45rem;',
      'transform:translateY(70px);opacity:0;pointer-events:none;',
      'transition:transform .3s cubic-bezier(.22,1,.36,1),opacity .3s;}',
      '#admToast.on{transform:translateY(0);opacity:1;}',
      '#admToast svg{width:16px;height:16px;stroke:#fff;fill:none;',
      'stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;}',

      '.adm-fi{display:none;}',

      '@media(max-width:600px){',
      '.adm-row{grid-template-columns:56px 1fr 36px}',
      '.adm-pb,.adm-ph,.adm-pf{padding:.9rem}',
      '.adm-add-grid{grid-template-columns:1fr}',
      '}'
    ].join('');

    var s = document.createElement('style');
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ─────────────────────────────────────────────────────────────
     BUILD PANEL ROWS HTML
  ───────────────────────────────────────────────────────────── */
  function rowsHTML() {
    return team.map(function (m) {
      var photo = m.photo || (m.id <= ORIG_COUNT ? 'photo-' + m.id + '.jpg' : PH);
      return '<div class="adm-row" data-id="' + m.id + '">' +
        '<div class="adm-pcol">' +
          '<img class="adm-thumb" id="pt_' + m.id + '" src="' + photo + '" ' +
          'onerror="this.src=\'' + PH + '\'" data-id="' + m.id + '" alt="">' +
          '<span class="adm-chg" data-id="' + m.id + '">Change Photo</span>' +
        '</div>' +
        '<div class="adm-fcol"><div class="adm-lbl">Full Name</div>' +
          '<input class="adm-inp" type="text" id="pn_' + m.id + '" ' +
          'value="' + esc(m.name) + '" placeholder="Full name" maxlength="60">' +
        '</div>' +
        '<div class="adm-fcol"><div class="adm-lbl">Job Title / Role</div>' +
          '<input class="adm-inp" type="text" id="pr_' + m.id + '" ' +
          'value="' + esc(m.role) + '" placeholder="Role" maxlength="60">' +
        '</div>' +
        '<div class="adm-action-col">' +
          '<button class="adm-del" data-id="' + m.id + '" title="Remove this member">' +
            '<svg viewBox="0 0 24 24">' +
              '<polyline points="3 6 5 6 21 6"/>' +
              '<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>' +
              '<path d="M10 11v6"/><path d="M14 11v6"/>' +
              '<path d="M9 6V4h6v2"/>' +
            '</svg>' +
          '</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  /* ─────────────────────────────────────────────────────────────
     INJECT STATIC DOM
  ───────────────────────────────────────────────────────────── */
  function injectUI() {
    /* FAB */
    var fab = document.createElement('button');
    fab.id = 'admFab'; fab.setAttribute('aria-label','Admin Panel'); fab.title = 'Admin Panel';
    fab.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>';
    if (loggedIn) fab.classList.add('logged');
    document.body.appendChild(fab);

    /* Login overlay */
    var loginEl = document.createElement('div');
    loginEl.className = 'adm-ov'; loginEl.id = 'admLogin';
    loginEl.innerHTML =
      '<div class="adm-box" role="dialog" aria-modal="true">' +
        '<button class="adm-x" id="admLX">&times;</button>' +
        '<div class="adm-lock"><svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>' +
        '<h2>Admin Login</h2>' +
        '<p>Enter the password to manage team profiles.</p>' +
        '<div class="adm-err" id="admErr">Wrong password — try again.</div>' +
        '<input class="adm-pw" type="password" id="admPW" placeholder="Password" autocomplete="current-password">' +
        '<button class="adm-login-btn" id="admLOGIN">Login</button>' +
      '</div>';
    document.body.appendChild(loginEl);

    /* Panel overlay shell */
    var panelEl = document.createElement('div');
    panelEl.className = 'adm-ov'; panelEl.id = 'admPanel';
    document.body.appendChild(panelEl);

    /* Toast */
    var toastEl = document.createElement('div');
    toastEl.id = 'admToast';
    toastEl.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg><span>Changes saved!</span>';
    document.body.appendChild(toastEl);

    /* File input for "add new member" photo */
    var addFI = document.createElement('input');
    addFI.type = 'file'; addFI.accept = 'image/*';
    addFI.className = 'adm-fi'; addFI.id = 'admAddFI';
    document.body.appendChild(addFI);
  }

  /* ─────────────────────────────────────────────────────────────
     BUILD PANEL & WIRE EVENTS
  ───────────────────────────────────────────────────────────── */
  var pendingDelId = null;   /* ID waiting for confirmation */
  var addPhotoB64  = '';

  function buildPanel() {
    var el = document.getElementById('admPanel');
    el.innerHTML =
      '<div class="adm-box" role="dialog" aria-modal="true" aria-label="Admin Panel" style="position:relative">' +

        /* Confirm-delete dialog (hidden by default) */
        '<div id="admConfirmBox">' +
          '<div class="adm-confirm-card">' +
            '<h3>Remove Member?</h3>' +
            '<p id="admConfirmMsg">This member will be removed from the team section of the website.</p>' +
            '<div class="adm-confirm-btns">' +
              '<button class="adm-cancel-btn" id="admCancelDel">Cancel</button>' +
              '<button class="adm-confirm-del-btn" id="admConfirmDel">Yes, Remove</button>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="adm-ph">' +
          '<button class="adm-x" id="admPX">&times;</button>' +
          '<h2>Admin Panel</h2>' +
          '<span class="adm-badge">Team Editor</span>' +
        '</div>' +

        '<div class="adm-pb" id="admRows">' +
          rowsHTML() +
          '<hr class="adm-divider">' +
          '<div id="admAddForm">' +
            '<h4><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add New Team Member</h4>' +
            '<div class="adm-add-grid">' +
              '<div><div class="adm-lbl">Full Name</div>' +
                '<input class="adm-inp" type="text" id="addName" placeholder="e.g. Juan dela Cruz" maxlength="60">' +
              '</div>' +
              '<div><div class="adm-lbl">Job Title / Role</div>' +
                '<input class="adm-inp" type="text" id="addRole" placeholder="e.g. Content Writer" maxlength="60">' +
              '</div>' +
            '</div>' +
            '<div class="adm-add-actions">' +
              '<button class="adm-add-photo-btn" id="addPhotoBtn">' +
                '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>Upload Photo</button>' +
              '<img class="adm-add-photo-preview" id="addPhotoPreview" src="" alt="Preview">' +
              '<button class="adm-add-confirm" id="addConfirmBtn">' +
                '<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add Member</button>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="adm-pf">' +
          '<button class="adm-out" id="admLogout">Log Out</button>' +
          '<button class="adm-save" id="admSave">' +
            '<svg viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Save Changes</button>' +
        '</div>' +
      '</div>';

    bindPanelEvents();
    bindFileInputs();
  }

  /* ─────────────────────────────────────────────────────────────
     PANEL EVENTS
  ───────────────────────────────────────────────────────────── */
  function bindPanelEvents() {
    document.getElementById('admPX').addEventListener('click', closePanel);
    document.getElementById('admPanel').addEventListener('click', function (e) {
      if (e.target.id === 'admPanel') closePanel();
    });

    document.getElementById('admLogout').addEventListener('click', function () {
      loggedIn = false;
      sessionStorage.removeItem(SS_KEY);
      var fab = document.getElementById('admFab');
      if (fab) fab.classList.remove('logged');
      closePanel();
    });

    /* ── SAVE CHANGES ── */
    document.getElementById('admSave').addEventListener('click', function () {
      collectInputs();
      saveTeam();
      applyToPage();
      showToast();
    });

    /* ── CONFIRM DELETE DIALOG ── */
    document.getElementById('admCancelDel').addEventListener('click', function () {
      pendingDelId = null;
      document.getElementById('admConfirmBox').classList.remove('show');
    });

    document.getElementById('admConfirmDel').addEventListener('click', function () {
      if (!pendingDelId) return;
      executDelete(pendingDelId);
      pendingDelId = null;
      document.getElementById('admConfirmBox').classList.remove('show');
    });

    /* ── ROW DELEGATION (photo + delete) ── */
    var rows = document.getElementById('admRows');
    rows.addEventListener('click', function (e) {
      /* find the closest element with data-id */
      var target = e.target;
      var id = null;
      while (target && target !== rows) {
        if (target.getAttribute('data-id')) { id = parseInt(target.getAttribute('data-id'), 10); break; }
        target = target.parentNode;
      }
      if (!id) return;

      if (e.target.classList.contains('adm-thumb') || e.target.classList.contains('adm-chg')) {
        var fi = document.getElementById('fi_' + id);
        if (fi) fi.click();
        return;
      }

      /* Delete button or its SVG/path child */
      var delBtn = e.target.closest ? e.target.closest('.adm-del') : null;
      if (!delBtn && e.target.classList.contains('adm-del')) delBtn = e.target;
      if (delBtn) {
        var delId = parseInt(delBtn.getAttribute('data-id'), 10);
        askConfirmDelete(delId);
      }
    });

    /* ── ADD MEMBER FLOW ── */
    addPhotoB64 = '';
    var addFI      = document.getElementById('admAddFI');
    var addPreview = document.getElementById('addPhotoPreview');

    document.getElementById('addPhotoBtn').addEventListener('click', function () {
      addFI.value = ''; addFI.click();
    });

    addFI.addEventListener('change', function () {
      var file = addFI.files[0]; if (!file) return;
      var reader = new FileReader();
      reader.onload = function (ev) {
        addPhotoB64 = ev.target.result;
        addPreview.src = addPhotoB64;
        addPreview.classList.add('has-photo');
      };
      reader.readAsDataURL(file);
    });

    document.getElementById('addConfirmBtn').addEventListener('click', function () {
      var name = (document.getElementById('addName').value || '').trim();
      var role = (document.getElementById('addRole').value || '').trim();
      if (!name) { flash('addName'); return; }
      if (!role) { flash('addRole'); return; }

      var m = { id: nextId++, name: name, role: role, photo: addPhotoB64 || '' };
      team.push(m);
      saveTeam();
      applyToPage();
      showToast();
      buildPanel();

      var newRow = document.querySelector('.adm-row[data-id="' + m.id + '"]');
      if (newRow) newRow.scrollIntoView({ behavior:'smooth', block:'center' });
    });
  }

  function flash(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.style.borderColor = '#e84393';
    el.focus();
    setTimeout(function () { el.style.borderColor = ''; }, 1400);
  }

  /* ─────────────────────────────────────────────────────────────
     DELETE FLOW
  ───────────────────────────────────────────────────────────── */
  function askConfirmDelete(id) {
    pendingDelId = id;
    var m = team.find(function (t) { return t.id === id; });
    var name = m ? m.name : 'this member';
    var msg = document.getElementById('admConfirmMsg');
    if (msg) {
      if (id <= ORIG_COUNT) {
        msg.innerHTML = '<span class="adm-warn">' + esc(name) + '</span> will be hidden from the website. You can restore them by refreshing and re-adding if needed.';
      } else {
        msg.innerHTML = '<span class="adm-warn">' + esc(name) + '</span> will be permanently removed from the Team section.';
      }
    }
    document.getElementById('admConfirmBox').classList.add('show');
  }

  function executDelete(id) {
    if (id <= ORIG_COUNT) {
      /* Original member: hide from page, track in deletedOrigIds */
      team = team.filter(function (m) { return m.id !== id; });
      if (deletedOrigIds.indexOf(id) === -1) deletedOrigIds.push(id);
      saveDeletedIds();
    } else {
      /* Extra member: remove entirely */
      team = team.filter(function (m) { return m.id !== id; });
    }
    saveTeam();
    applyToPage();
    buildPanel();
    showToast();
  }

  /* ─────────────────────────────────────────────────────────────
     COLLECT INPUTS
  ───────────────────────────────────────────────────────────── */
  function collectInputs() {
    team.forEach(function (m) {
      var n = document.getElementById('pn_' + m.id);
      var r = document.getElementById('pr_' + m.id);
      if (n && n.value.trim()) m.name = n.value.trim();
      if (r && r.value.trim()) m.role = r.value.trim();
    });
  }

  /* ─────────────────────────────────────────────────────────────
     FILE INPUTS (per-member photo change)
  ───────────────────────────────────────────────────────────── */
  function bindFileInputs() {
    team.forEach(function (m) {
      var fi = document.getElementById('fi_' + m.id);
      if (!fi) {
        fi = document.createElement('input');
        fi.type = 'file'; fi.accept = 'image/*';
        fi.className = 'adm-fi'; fi.id = 'fi_' + m.id;
        document.body.appendChild(fi);
      }
      /* Clone to remove old listeners */
      var fresh = fi.cloneNode(false);
      fi.parentNode.replaceChild(fresh, fi);

      (function (mid, el) {
        el.addEventListener('change', function () {
          var file = el.files[0]; if (!file) return;
          var reader = new FileReader();
          reader.onload = function (ev) {
            var b64 = ev.target.result;
            var member = team.find(function (t) { return t.id === mid; });
            if (member) member.photo = b64;
            var thumb = document.getElementById('pt_' + mid);
            if (thumb) thumb.src = b64;
            setSrc('org-photo-'  + mid, b64);
            setSrc('card-photo-' + mid, b64);
          };
          reader.readAsDataURL(file);
          el.value = '';
        });
      }(m.id, fresh));
    });
  }

  /* ─────────────────────────────────────────────────────────────
     TOAST
  ───────────────────────────────────────────────────────────── */
  function showToast() {
    var t = document.getElementById('admToast');
    t.classList.add('on');
    clearTimeout(t._t);
    t._t = setTimeout(function () { t.classList.remove('on'); }, 3000);
  }

  /* ─────────────────────────────────────────────────────────────
     OPEN / CLOSE
  ───────────────────────────────────────────────────────────── */
  function openLogin() {
    document.getElementById('admLogin').classList.add('open');
    setTimeout(function () { var p = document.getElementById('admPW'); if (p) p.focus(); }, 80);
  }
  function closeLogin() {
    document.getElementById('admLogin').classList.remove('open');
    var p = document.getElementById('admPW');
    if (p) { p.value = ''; p.classList.remove('bad'); }
    document.getElementById('admErr').classList.remove('on');
  }
  function openPanel() { buildPanel(); document.getElementById('admPanel').classList.add('open'); }
  function closePanel() { document.getElementById('admPanel').classList.remove('open'); }

  /* ─────────────────────────────────────────────────────────────
     LOGIN
  ───────────────────────────────────────────────────────────── */
  function tryLogin() {
    if (document.getElementById('admPW').value === PASS) {
      loggedIn = true;
      sessionStorage.setItem(SS_KEY, '1');
      var fab = document.getElementById('admFab');
      if (fab) fab.classList.add('logged');
      closeLogin();
      openPanel();
    } else {
      var pw = document.getElementById('admPW');
      pw.classList.add('bad');
      document.getElementById('admErr').classList.add('on');
      pw.select();
    }
  }

  /* ─────────────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────────────── */
  function init() {
    applyToPage();
    injectStyles();
    injectUI();

    document.getElementById('admFab').addEventListener('click', function () {
      if (loggedIn) { openPanel(); } else { openLogin(); }
    });
    document.getElementById('admLX').addEventListener('click', closeLogin);
    document.getElementById('admLogin').addEventListener('click', function (e) {
      if (e.target.id === 'admLogin') closeLogin();
    });
    document.getElementById('admLOGIN').addEventListener('click', tryLogin);
    document.getElementById('admPW').addEventListener('keydown', function (e) { if (e.key === 'Enter') tryLogin(); });
    document.getElementById('admPW').addEventListener('input', function () {
      this.classList.remove('bad');
      document.getElementById('admErr').classList.remove('on');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
