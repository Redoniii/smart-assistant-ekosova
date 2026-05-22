/* eKosova Smart Assist — Content Script
   Injects a floating widget onto rks-gov.net */
(function () {
  'use strict';
  if (document.getElementById('eksa-root')) return;

  const BLUE = '#1d61a1';
  const CYAN = '#7cc5d7';
  const AGENT_PORTAL = 'http://localhost:5173/agent'; // update to deployed URL for production

  // ── SERVICES DATA ──────────────────────────────────────────────
  const SERVICES = [
    {
      id: 'certifikate-lindjes',
      title: 'Certifikatë e Lindjes',
      category: 'Gjendja Civile',
      kw: ['lindje', 'lindjes', 'certifikat', 'fëmijë', 'akt', 'civil', 'lindur', 'regjistrim', 'birth'],
      desc: 'Dokument zyrtar që vërteton lindjen e një personi në Kosovë.',
      docs: ['Letërnjoftim i prindërit', 'Libri familjar'],
      steps: ['Paraqituni në qendrën komunale', 'Dorëzoni dokumentet', 'Paguani tarifën (1€)', 'Merrni certifikatën brenda 1–3 ditëve'],
      time: '1–3 ditë pune',
    },
    {
      id: 'certifikate-vendbanimit',
      title: 'Certifikatë e Vendbanimit',
      category: 'Gjendja Civile',
      kw: ['vendbanim', 'banim', 'adresë', 'jetoj', 'ku jetoj', 'banor', 'vendqëndrim', 'certifikat', 'adresa'],
      desc: 'Vërteton adresën zyrtare të vendbanimit të qytetarit sipas regjistrit civil.',
      docs: ['Letërnjoftim'],
      steps: ['Shkoni në komunën tuaj', 'Kërkoni certifikatën e vendbanimit', 'Paguani tarifën', 'Merrni dokumentin menjëherë ose brenda 1 dite'],
      time: '30 minuta – 1 ditë',
    },
    {
      id: 'nderrim-adrese',
      title: 'Ndërrimi i Adresës',
      category: 'Gjendja Civile',
      kw: ['ndërroj', 'adresë', 'ndrysho', 'lëvizje', 'adres', 'transferim', 'regjistrim adresë', 'ndërrimi'],
      desc: 'Ndryshimi i adresës zyrtare të vendbanimit në regjistrin civil të komunës.',
      docs: ['Letërnjoftim', 'Kontratë qiraje ose dokument pronësie'],
      steps: ['Paraqituni në komunë', 'Plotësoni formularin e ndërrimit', 'Dorëzoni dokumentet mbështetëse', 'Prisni konfirmimin'],
      time: '1–5 ditë pune',
    },
    {
      id: 'dokument-personal',
      title: 'Letërnjoftim / Pasaportë',
      category: 'Dokumentet Personale',
      kw: ['letërnjoftim', 'pasaportë', 'id', 'dokument', 'personal', 'kartë identiteti', 'kartë', 'pasaport', 'rinovim'],
      desc: 'Lëshimi i ri ose rinovimi i letërnjoftimit dhe pasaportës të Kosovës.',
      docs: ['Fotografi biometrike', 'Certifikatë lindjeje', 'Tarifa e shërbimit'],
      steps: ['Aplikoni online në eKosova ose vizitoni zyrën', 'Dorëzoni dokumentet dhe fotografinë', 'Paguani tarifën', 'Prisni 10–15 ditë'],
      time: '10–15 ditë pune',
    },
    {
      id: 'regjistrim-biznesi',
      title: 'Regjistrimi i Biznesit',
      category: 'Biznesi',
      kw: ['biznes', 'regjistrim', 'kompani', 'firmë', 'ndërmarrje', 'hap', 'hapur', 'ARBK', 'sh.p.k', 'tregtia'],
      desc: 'Regjistrimi i ndërmarrjes së re ose ndryshimi i të dhënave të biznesit tuaj.',
      docs: ['Letërnjoftim', 'Adresë e biznesit', 'Statuti (për SH.P.K.)'],
      steps: ['Zgjidhni emrin e disponueshëm të biznesit', 'Plotësoni formularin në ARBK', 'Paguani tarifën e regjistrimit', 'Merrni certifikatën e biznesit'],
      time: '3–7 ditë pune',
    },
    {
      id: 'tatimi-prone',
      title: 'Tatimi në Pronë',
      category: 'Tatimi',
      kw: ['tatim', 'pronë', 'shtëpi', 'prona', 'ATK', 'paguaj', 'taksa', 'deklaratë', 'prone', 'toka'],
      desc: 'Deklarimi dhe pagesa e tatimit vjetor në pronë tek Administrata Tatimore e Kosovës.',
      docs: ['Letërnjoftim', 'Akti i pronësisë / kontrata e blerjes'],
      steps: ['Hyrni në portalin eKosova', 'Deklaroni pronën tuaj', 'Shikoni shumën e tatimit', 'Paguani online ose në bankë'],
      time: '30 minuta',
    },
    {
      id: 'ndihma-sociale',
      title: 'Ndihma Sociale',
      category: 'Mbrojtja Sociale',
      kw: ['ndihmë', 'sociale', 'mbështetje', 'familjare', 'të varfër', 'pension', 'çmim', 'zasilek', 'asistence', 'ekonomike'],
      desc: 'Aplikimi për ndihmë ekonomike dhe mbështetje sociale nga Ministria e Punës.',
      docs: ['Letërnjoftim të gjithë anëtarëve', 'Certifikatë familjare', 'Deklaratë e pasurisë'],
      steps: ['Aplikoni në MPMS ose komunën tuaj', 'Dorëzoni dokumentet e familjes', 'Pritet inspektimi social', 'Vendimi brenda 30 ditëve'],
      time: '15–30 ditë pune',
    },
  ];

  // ── SEARCH ─────────────────────────────────────────────────────
  function normalize(s) {
    return s.toLowerCase()
      .replace(/ë/g, 'e').replace(/ç/g, 'c')
      .replace(/[àáâã]/g, 'a').replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i').replace(/[òóôõ]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[^a-z0-9\s]/g, '');
  }

  function searchServices(query) {
    const q = normalize(query);
    const words = q.split(/\s+/).filter(Boolean);
    return SERVICES.map(svc => {
      let score = 0;
      const title = normalize(svc.title);
      const desc = normalize(svc.desc);
      const kws = svc.kw.map(normalize);
      for (const w of words) {
        if (title.includes(w)) score += 30;
        kws.forEach(k => { if (k.includes(w) || w.includes(k)) score += 25; });
        if (desc.includes(w)) score += 10;
      }
      return { svc, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);
  }

  // ── OPENAI STREAM ───────────────────────────────────────────────
  async function streamAnswer(question, svc, onChunk, onDone, onError) {
    // OPENAI_KEY is injected by apikey.js which loads before this script
    const apiKey = (typeof OPENAI_KEY !== 'undefined' && OPENAI_KEY) || '';
    if (!apiKey) {
      onError('Çelësi API nuk është vendosur. Edito skedarin apikey.js në dosjen e shtesës.');
      return;
    }

    const prompt = `Qytetari pyet: "${question}"
Shërbimi: ${svc.title} (${svc.category})
Përshkrimi: ${svc.desc}
Dokumentet: ${svc.docs.join(', ')}
Hapat: ${svc.steps.map((s, i) => `${i + 1}. ${s}`).join(' | ')}
Koha e pritjes: ${svc.time}

Jep një përgjigje 3–5 fjali në shqip — miqësore, të qartë, pa tituj ose formatim. Drejtpërdrejt te qytetari.`;

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Je Smart Assist i eKosova. Ndihmon qytetarët të gjejnë shërbime publike. Përgjigju shkurt, qartë, në shqip.' },
            { role: 'user', content: prompt },
          ],
          stream: true,
          temperature: 0.4,
          max_tokens: 280,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        onError(`Gabim API (${res.status}): ${txt.slice(0, 120)}`);
        return;
      }

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of dec.decode(value, { stream: true }).split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') { onDone(acc); return; }
          try {
            const c = JSON.parse(data).choices?.[0]?.delta?.content ?? '';
            if (c) { acc += c; onChunk(c); }
          } catch {}
        }
      }
      onDone(acc);
    } catch (e) {
      onError('Gabim lidhje: ' + e.message);
    }
  }

  // ── WIDGET ─────────────────────────────────────────────────────
  const host = document.createElement('div');
  host.id = 'eksa-root';
  host.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;';

  const shadow = host.attachShadow({ mode: 'open' });

  shadow.innerHTML = `
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }

#fab {
  width: 58px; height: 58px;
  background: linear-gradient(135deg, ${BLUE}, ${CYAN});
  border-radius: 50%; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 20px rgba(29,97,161,.45);
  transition: transform .2s, box-shadow .2s;
  margin-left: auto; position: relative;
}
#fab:hover { transform: scale(1.09); box-shadow: 0 6px 28px rgba(29,97,161,.55); }
#fab-icon { font-size: 26px; line-height: 1; }
#fab-pulse {
  position: absolute; inset: -3px; border-radius: 50%;
  border: 2px solid ${CYAN}; opacity: 0;
  animation: pulse 2.5s ease-out infinite;
}
@keyframes pulse { 0%{opacity:.6;transform:scale(1)} 100%{opacity:0;transform:scale(1.4)} }

#panel {
  display: none; flex-direction: column;
  width: 360px; max-height: 540px;
  background: #fff; border-radius: 20px;
  box-shadow: 0 12px 48px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.08);
  border: 1px solid rgba(29,97,161,.12);
  overflow: hidden; margin-bottom: 12px;
}
#panel.open { display: flex; }

#ph {
  background: linear-gradient(135deg, ${BLUE} 0%, ${CYAN} 100%);
  padding: 14px 16px; display: flex; align-items: center; gap: 10px; flex-shrink: 0;
}
.ph-icon { font-size: 24px; }
.ph-title { color: #fff; font-weight: 700; font-size: 15px; }
.ph-sub { color: rgba(255,255,255,.72); font-size: 11px; }
#xbtn {
  margin-left: auto; background: rgba(255,255,255,.2); border: none; color: #fff;
  width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 15px;
  display: flex; align-items: center; justify-content: center; transition: background .2s;
  flex-shrink: 0;
}
#xbtn:hover { background: rgba(255,255,255,.35); }

#sa {
  padding: 12px 14px 10px; border-bottom: 1px solid #f0f4f8; flex-shrink: 0;
}
#sr { display: flex; gap: 8px; }
#si {
  flex: 1; padding: 9px 12px; border: 1.5px solid #e2e8f0; border-radius: 10px;
  font-size: 13px; outline: none; color: #111; background: #f8fafc;
  transition: border-color .2s, background .2s; font-family: inherit;
}
#si:focus { border-color: ${BLUE}; background: #fff; }
#sb {
  padding: 9px 14px; background: ${BLUE}; color: #fff; border: none;
  border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer;
  transition: opacity .18s; white-space: nowrap; font-family: inherit;
}
#sb:hover { opacity: .88; }
#sb:disabled { opacity: .45; cursor: default; }

#chips { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 9px; }
.chip {
  padding: 4px 10px; background: #f1f5f9; border: 1px solid #e2e8f0;
  border-radius: 20px; font-size: 11px; color: #64748b; cursor: pointer;
  transition: background .15s, color .15s; font-family: inherit;
}
.chip:hover { background: rgba(29,97,161,.08); color: ${BLUE}; border-color: rgba(29,97,161,.25); }

#body {
  flex: 1; overflow-y: auto; padding: 14px;
  scroll-behavior: smooth;
}
#body::-webkit-scrollbar { width: 4px; }
#body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }

.empty { text-align: center; padding: 24px 0; }
.empty-ico { font-size: 38px; margin-bottom: 10px; }
.empty p { font-size: 13px; color: #94a3b8; line-height: 1.6; }

.card {
  background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 14px;
}
.cat {
  font-size: 10px; font-weight: 700; color: ${BLUE};
  background: rgba(29,97,161,.08); padding: 2px 8px; border-radius: 20px;
  display: inline-block; margin-bottom: 7px; letter-spacing: .3px;
}
.stitle { font-size: 14px; font-weight: 700; color: #111; margin-bottom: 5px; }
.sdesc { font-size: 12px; color: #64748b; line-height: 1.55; margin-bottom: 8px; }
.meta { font-size: 11px; color: #94a3b8; display: flex; gap: 10px; flex-wrap: wrap; }

.aibox {
  background: linear-gradient(135deg, rgba(29,97,161,.04), rgba(124,197,215,.06));
  border: 1.5px solid rgba(29,97,161,.18); border-radius: 12px;
  padding: 10px 12px; margin-top: 10px;
}
.ailabel {
  font-size: 10px; font-weight: 700; color: ${BLUE}; letter-spacing: .6px;
  margin-bottom: 5px; display: flex; align-items: center; gap: 4px;
}
.aitext { font-size: 13px; color: #1a1a1a; line-height: 1.65; }
.cur {
  display: inline-block; width: 2px; height: 14px;
  background: ${BLUE}; animation: blink 1s infinite; vertical-align: middle; margin-left: 1px;
}
@keyframes blink { 0%,100%{opacity:1}50%{opacity:0} }

.spinner {
  width: 18px; height: 18px; border: 2px solid rgba(29,97,161,.15);
  border-top-color: ${BLUE}; border-radius: 50%;
  animation: spin .7s linear infinite; display: inline-block; vertical-align: middle;
}
@keyframes spin { to { transform: rotate(360deg); } }

.err {
  background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 10px;
  padding: 10px 12px; font-size: 12px; color: #dc2626; line-height: 1.55; margin-top: 8px;
}

.ebtn {
  width: 100%; margin-top: 10px; padding: 10px 14px; border: none;
  background: #fff3f3; color: #dc2626; border: 1.5px solid #fca5a5;
  border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  transition: background .18s; font-family: inherit;
}
.ebtn:hover { background: #fee2e2; }

.nores { text-align: center; padding: 20px 10px; }
.nores p { font-size: 13px; color: #64748b; margin-bottom: 14px; line-height: 1.5; }
</style>

<div id="panel">
  <div id="ph">
    <span class="ph-icon">🤖</span>
    <div><div class="ph-title">Smart Assist</div><div class="ph-sub">eKosova · Ndihmë për shërbime</div></div>
    <button id="xbtn" aria-label="Mbyll">✕</button>
  </div>
  <div id="sa">
    <div id="sr">
      <input id="si" type="text" placeholder="Çfarë shërbimi ju nevojitet?…" autocomplete="off" spellcheck="false"/>
      <button id="sb">Kërko</button>
    </div>
    <div id="chips">
      <span class="chip" data-q="certifikatë lindjes">certifikatë lindjes</span>
      <span class="chip" data-q="ku jetoj vendbanim">vendbanim</span>
      <span class="chip" data-q="letërnjoftim pasaportë">letërnjoftim</span>
      <span class="chip" data-q="ndihmë sociale">ndihmë sociale</span>
      <span class="chip" data-q="regjistrim biznesi">biznes</span>
    </div>
  </div>
  <div id="body">
    <div class="empty">
      <div class="empty-ico">💬</div>
      <p>Shkruani pyetjen tuaj dhe<br>do t'ju ndihmojmë të gjeni<br>shërbimin e duhur.</p>
    </div>
  </div>
</div>

<div style="position:relative;display:flex;justify-content:flex-end;">
  <button id="fab" aria-label="Hap Smart Assist">
    <div id="fab-pulse"></div>
    <span id="fab-icon">💬</span>
  </button>
</div>
`;

  // ── REFS ──
  const fab    = shadow.getElementById('fab');
  const panel  = shadow.getElementById('panel');
  const xbtn   = shadow.getElementById('xbtn');
  const si     = shadow.getElementById('si');
  const sb     = shadow.getElementById('sb');
  const body   = shadow.getElementById('body');

  let isOpen = false;

  function toggle() {
    isOpen = !isOpen;
    if (isOpen) {
      panel.classList.add('open');
      setTimeout(() => si.focus(), 80);
    } else {
      panel.classList.remove('open');
    }
  }

  fab.addEventListener('click', toggle);
  xbtn.addEventListener('click', toggle);

  shadow.querySelectorAll('.chip').forEach(c => {
    c.addEventListener('click', () => {
      si.value = c.dataset.q;
      doSearch(c.dataset.q);
    });
  });

  si.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(si.value.trim()); });
  sb.addEventListener('click', () => doSearch(si.value.trim()));

  // ── SEARCH & RENDER ──
  function doSearch(q) {
    if (!q) return;
    const hits = searchServices(q);
    if (!hits.length) { renderNoResult(q); return; }
    renderResult(hits[0].svc, q);
  }

  function renderResult(svc, question) {
    body.innerHTML = `
      <div class="card">
        <span class="cat">${svc.category}</span>
        <div class="stitle">${svc.title}</div>
        <div class="sdesc">${svc.desc}</div>
        <div class="meta">
          <span>📄 ${svc.docs.join(', ')}</span>
          <span>⏱ ${svc.time}</span>
        </div>
        <div class="aibox">
          <div class="ailabel">🤖 SMART ASSIST</div>
          <div class="aitext" id="at"><span class="spinner"></span></div>
        </div>
        <button class="ebtn" id="esc">🎧 Nuk jam i sigurt — Lidhu me agjentin</button>
      </div>`;

    shadow.getElementById('esc').addEventListener('click', () => escalate(question, svc.id, svc.title));

    const at = shadow.getElementById('at');
    let aiAcc = '';

    streamAnswer(question, svc,
      chunk => { aiAcc += chunk; at.innerHTML = aiAcc + '<span class="cur"></span>'; },
      full  => { at.innerHTML = full || aiAcc; },
      err   => { at.innerHTML = `<div class="err">${err}</div>`; }
    );
  }

  function renderNoResult(q) {
    body.innerHTML = `
      <div class="nores">
        <div style="font-size:36px;margin-bottom:10px">🔍</div>
        <p>Nuk u gjet shërbim për<br><strong>"${q}"</strong><br>Një agjent mund t'ju ndihmojë direkt.</p>
        <button class="ebtn" id="esc" style="max-width:260px;margin:0 auto">🎧 Pyesni një agjent</button>
      </div>`;
    shadow.getElementById('esc').addEventListener('click', () => escalate(q, '', ''));
  }

  function escalate(question, serviceId, serviceTitle) {
    // Step 1 — ask for phone number
    body.innerHTML = `
      <div style="padding:24px 20px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
          <div style="width:36px;height:36px;background:${BLUE};border-radius:10px;
            display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.68 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 1.24h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.75a16 16 0 0 0 6 6l.88-.88a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16l.29.92z"/>
            </svg>
          </div>
          <div>
            <p style="font-size:14px;font-weight:700;color:#1e293b;margin:0;">Lidhuni me agjentin</p>
            <p style="font-size:12px;color:#64748b;margin:0;">Agjenti do t'ju telefonojë</p>
          </div>
        </div>

        <p style="font-size:12px;color:#64748b;margin-bottom:6px;font-weight:600;">
          Numri i telefonit (opsionale)
        </p>
        <input id="phone-inp" type="tel" placeholder="+383 4X XXX XXX"
          style="width:100%;box-sizing:border-box;padding:10px 12px;font-size:14px;
            border:1.5px solid #e2e8f0;border-radius:10px;outline:none;
            font-family:inherit;color:#1e293b;background:#f8fafc;margin-bottom:14px;" />

        <button id="esc-send" style="width:100%;padding:11px;background:${BLUE};color:#fff;
          border:none;border-radius:10px;font-size:14px;font-weight:700;
          cursor:pointer;font-family:inherit;margin-bottom:8px;">
          Dërgo kërkesën
        </button>
        <button id="esc-skip" style="width:100%;padding:9px;background:transparent;color:#94a3b8;
          border:none;font-size:12px;cursor:pointer;font-family:inherit;">
          Dërgo pa numër telefoni
        </button>
      </div>`;

    function submitTicket(phone) {
      const ticket = {
        id: 'req-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        citizenQuestion: question,
        citizenPhone: phone || '',
        matchedServiceId: serviceId || '',
        matchedServiceTitle: serviceTitle || 'E panjohur',
        searchQuery: question,
        simpleMode: false,
        helpRequested: true,
        timestamp: new Date().toISOString(),
        status: 'new',
        confidence: serviceId ? 'high' : 'low',
      };

      chrome.storage.local.get(['ekosova_pending_tickets'], function (result) {
        const existing = result.ekosova_pending_tickets || [];
        chrome.storage.local.set({ ekosova_pending_tickets: [ticket, ...existing] });
      });

      // Step 2 — confirmation screen
      body.innerHTML = `
        <div style="text-align:center;padding:36px 20px;">
          <div style="width:60px;height:60px;background:linear-gradient(135deg,#16a34a,#22c55e);
            border-radius:50%;display:flex;align-items:center;justify-content:center;
            margin:0 auto 16px;box-shadow:0 4px 16px rgba(34,197,94,.3);">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p style="font-size:15px;font-weight:700;color:#15803d;margin-bottom:8px;">Ticket u krijua!</p>
          <p style="font-size:13px;color:#475569;line-height:1.65;margin-bottom:${phone ? '8px' : '20px'}">
            Kërkesa juaj u regjistrua me sukses.<br>Një agjent do t'ju ndihmojë<br>sa më shpejt të jetë e mundur.
          </p>
          ${phone ? `<p style="font-size:12px;color:#64748b;margin-bottom:20px;">
            Do t'ju telefonojmë në: <strong style="color:#1e293b;">${phone}</strong>
          </p>` : ''}
          <button id="esc-back" style="padding:9px 22px;background:${BLUE};color:#fff;border:none;
            border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">
            Pyetje tjetër
          </button>
        </div>`;

      shadow.getElementById('esc-back').addEventListener('click', () => {
        si.value = '';
        body.innerHTML = `
          <div class="empty">
            <div class="empty-ico">💬</div>
            <p>Shkruani pyetjen tuaj dhe<br>do t'ju ndihmojmë të gjeni<br>shërbimin e duhur.</p>
          </div>`;
      });
    }

    shadow.getElementById('phone-inp').addEventListener('focus', function () {
      this.style.borderColor = BLUE;
    });
    shadow.getElementById('phone-inp').addEventListener('blur', function () {
      this.style.borderColor = '#e2e8f0';
    });
    shadow.getElementById('esc-send').addEventListener('click', () => {
      const phone = shadow.getElementById('phone-inp').value.trim();
      submitTicket(phone);
    });
    shadow.getElementById('esc-skip').addEventListener('click', () => submitTicket(''));
    // Allow Enter key to submit
    shadow.getElementById('phone-inp').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitTicket(shadow.getElementById('phone-inp').value.trim());
    });
  }

  // ── MOUNT ──
  document.body.appendChild(host);
})();
