'use strict';

/* ------------------------------------------
   DATA
------------------------------------------ */
const SCENARIOS = {
  baseline:    { demand: 45.8, storage: 38.2, demandChg: +3.5, storageChg: -2.1 },
  optimistic:  { demand: 42.1, storage: 41.5, demandChg: +1.2, storageChg: +2.8 },
  pessimistic: { demand: 49.6, storage: 34.0, demandChg: +6.4, storageChg: -6.3 },
};
const YEAR_ADJ = {
  2025: { d: -3.5, s: +2.1 },
  2026: { d:  0,   s:  0   },
  2027: { d: +2.8, s: -1.5 },
  2028: { d: +5.3, s: -3.2 },
};

const RESERVOIRS_BASE = [
  { name:'Indira Sagar',   level:64.2, storage:18545, capacity:58600, pct:31.6, inflow:245, outflow:280, status:'LOW' },
  { name:'Bargi',          level:58.8, storage:8724,  capacity:58600, pct:31.6, inflow:210, outflow:290, status:'NORMAL' },
  { name:'Gandhi Sagar',   level:75.1, storage:6358,  capacity:11200, pct:61.8, inflow:185, outflow:175, status:'NORMAL' },
  { name:'Narmada Valley', level:57.5, storage:6358,  capacity:11000, pct:61.8, inflow:230, outflow:290, status:'LOW' },
  { name:'Tawa Reservoir', level:62.1, storage:2215,  capacity:7265,  pct:44.3, inflow:128, outflow:185, status:'LOW' },
];

const RESERVOIR_LOCATIONS = [
  { name:'Indira Sagar',   lat:22.2633, lng:76.4680, level:64.2, storage:18545, capacity:58600, pct:31.6, inflow:245, outflow:280, status:'LOW',    river:'Narmada',  district:'Khandwa' },
  { name:'Bargi Dam',      lat:23.0469, lng:80.0349, level:58.8, storage:8724,  capacity:58600, pct:31.6, inflow:210, outflow:290, status:'NORMAL', river:'Narmada',  district:'Jabalpur' },
  { name:'Gandhi Sagar',   lat:24.7145, lng:75.5583, level:75.1, storage:6358,  capacity:11200, pct:61.8, inflow:185, outflow:175, status:'NORMAL', river:'Chambal',  district:'Mandsaur' },
  { name:'Narmada Valley', lat:22.6938, lng:77.7523, level:57.5, storage:6358,  capacity:11000, pct:61.8, inflow:230, outflow:290, status:'LOW',    river:'Narmada',  district:'Hoshangabad' },
  { name:'Tawa Reservoir', lat:22.5965, lng:77.9267, level:62.1, storage:2215,  capacity:7265,  pct:44.3, inflow:128, outflow:185, status:'LOW',    river:'Tawa',     district:'Hoshangabad' },
];

const STATUS_COLORS = {
  LOW:      { fill:'#e07830', header:'#c05c18' },
  NORMAL:   { fill:'#27c880', header:'#1e9e62' },
  HIGH:     { fill:'#2e7dd1', header:'#1a5fa8' },
  CRITICAL: { fill:'#e05555', header:'#b83030' },
};

const DISTRICT_FORECAST = [
  { label:'Bhopal',   value:8.4,  max:12 },
  { label:'Indore',   value:9.1,  max:12 },
  { label:'Jabalpur', value:6.7,  max:12 },
  { label:'Gwalior',  value:5.2,  max:12 },
  { label:'Ujjain',   value:4.8,  max:12 },
  { label:'Sagar',    value:3.9,  max:12 },
  { label:'Rewa',     value:4.1,  max:12 },
  { label:'Satna',    value:3.6,  max:12 },
];

const ALERTS = [
  { type:'critical', text:'Indira Sagar storage critically low at 31.6% — emergency review required.',  time:'2 min ago' },
  { type:'warning',  text:'Tawa Reservoir outflow exceeds inflow by 57 Cumec — net deficit detected.',   time:'15 min ago' },
  { type:'info',     text:'Narmada Valley seasonal storage update complete. Data refreshed.',            time:'1 hr ago' },
];

const SUGGESTIONS = [
  { icon:'🚨', text:'Increase controlled release from Gandhi Sagar by 15% to balance Narmada Valley levels.', tag:'urgent' },
  { icon:'💧', text:'Initiate demand-side reduction for industrial users in Khandwa district this week.', tag:'suggest' },
  { icon:'📅', text:'Schedule pre-monsoon inspection for Indira Sagar spillways before June 2026.', tag:'plan' },
  { icon:'📡', text:'Deploy additional IoT flow sensors at Bargi outflow channel for real-time monitoring.', tag:'monitor' },
];

const EVENTS = [
  { day:'10', mon:'Apr', title:'Pre-Monsoon Inspection', desc:'Annual structural check — Indira Sagar & Tawa.' },
  { day:'22', mon:'Apr', title:'CWC Review Meeting',     desc:'Quarterly data submission to Central Water Commission.' },
  { day:'05', mon:'May', title:'Monsoon Preparedness',   desc:'Emergency response drill for all major dams.' },
  { day:'18', mon:'May', title:'Demand Report Deadline', desc:'District-wise water demand report submission.' },
];

const QUICK_ACTIONS = [
  { icon:'📊', label:'Export Data' },
  { icon:'📢', label:'Send Alert' },
  { icon:'🔄', label:'Refresh Feed' },
  { icon:'🖨️', label:'Print Report' },
  { icon:'📍', label:'Add Marker' },
  { icon:'⚙️', label:'Settings' },
];

const REPORTS = [
  { title:'Annual Demand Report 2026',  date:'Generated: Mar 24, 2025' },
  { title:'Reservoir Status Summary',   date:'Generated: Mar 20, 2025' },
  { title:'Monsoon Forecast Q3-Q4',     date:'Generated: Mar 15, 2025' },
  { title:'District-wise Allocation',   date:'Generated: Mar 10, 2025' },
];

const SETTINGS_CONFIG = [
  { label:'Email Notifications',     desc:'Receive alerts for critical reservoir levels', checked:true  },
  { label:'Auto-refresh Dashboard',  desc:'Refresh data every 15 minutes automatically',  checked:true  },
  { label:'Show Deficit Warnings',   desc:'Display prominent warnings when in deficit',    checked:true  },
  { label:'Dark Mode',               desc:'Switch to dark theme (currently active)',       checked:true  },
  { label:'Export as SI Units',      desc:'Use metric SI units in all exports',            checked:false },
];

/* ------------------------------------------
   STATE
------------------------------------------ */
let sortCol = null, sortDir = 'asc', searchQuery = '';
let currentData = [...RESERVOIRS_BASE];
let mapInstance = null, isSatellite = false;
let tileNormal = null, tileSat = null;

/* ------------------------------------------
   UTILS
------------------------------------------ */
const $ = id => document.getElementById(id);
const fmt = n => Number(n).toLocaleString();
const fmtBcm = n => Number(n).toFixed(1);

function pctColor(pct) {
  if (pct >= 70) return '#27c880';
  if (pct >= 45) return '#1ab8c4';
  if (pct >= 30) return '#e07830';
  return '#e05555';
}

function showToast(msg, type = 'success') {
  const toast = $('toast');
  $('toast-icon').textContent = { success:'✓', error:'✗', info:'ℹ' }[type] || '✓';
  $('toast-msg').textContent = msg;
  toast.className = `toast ${type}`;
  void toast.offsetWidth;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => { toast.className = 'toast hidden'; }, 350);
  }, 3000);
}

function openModal(title, bodyHTML, onOk) {
  $('modal-title').textContent = title;
  $('modal-body').innerHTML = bodyHTML;
  $('modal-overlay').classList.remove('hidden');
  $('modal-ok').onclick = () => { closeModal(); if (onOk) onOk(); };
}
function closeModal() { $('modal-overlay').classList.add('hidden'); }

/* ------------------------------------------
   LIVE CLOCK & HEADER STATS
------------------------------------------ */
function initClock() {
  function tick() {
    const now = new Date();
    // Header time
    $('hdr-time').textContent = now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
    // Metric live clock
    const mu = $('metric-updated');
    if (mu) mu.textContent = 'Live: ' + now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit' }).toLowerCase();
    // Footer
    $('footer-updated').textContent =
      now.toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' }) +
      ' · ' + now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }) + ' IST';
  }
  tick();
  setInterval(tick, 1000);
}

/* ------------------------------------------
   TABS
------------------------------------------ */
function initTabs() {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.tab-page').forEach(p => p.classList.add('hidden'));
      $(`page-${tab.dataset.tab}`).classList.remove('hidden');

      const t = tab.dataset.tab;
      if (t === 'forecasts')  renderForecastBars();
      if (t === 'reservoirs') renderReservoirBars();
      if (t === 'analytics')  renderAnalytics();
      if (t === 'reports')    renderReports();
      if (t === 'settings')   renderSettings();
    });
  });
}

/* ------------------------------------------
   RUN FORECAST
------------------------------------------ */
function initRunForecast() {
  const btn = $('btn-run-forecast');
  btn.addEventListener('click', () => {
    const year     = $('forecast-year').value;
    const scenario = $('scenario-type').value;
    const region1  = $('region-1').value;

    btn.disabled = true;
    $('btn-run-text').textContent = 'RUNNING…';
    $('btn-run-spinner').classList.remove('hidden');

    setTimeout(() => {
      btn.disabled = false;
      $('btn-run-text').textContent = 'RUN FORECAST';
      $('btn-run-spinner').classList.add('hidden');

      const sc  = SCENARIOS[scenario];
      const adj = YEAR_ADJ[year] || { d:0, s:0 };
      const demand  = parseFloat((sc.demand  + adj.d).toFixed(1));
      const storage = parseFloat((sc.storage + adj.s).toFixed(1));
      const deficit = parseFloat((storage - demand).toFixed(1));

      $('metric-year').textContent    = year;
      $('metric-demand').textContent  = fmtBcm(demand);
      $('metric-storage').textContent = fmtBcm(storage);
      $('metric-deficit').textContent = (deficit < 0 ? '' : '+') + fmtBcm(deficit);

      const chg = (sc.demandChg + adj.d * 0.5).toFixed(1);
      const demBadge = $('metric-demand-badge');
      demBadge.textContent = chg >= 0 ? `▲ ${chg}% from ${year-1}` : `▼ ${Math.abs(chg)}% from ${year-1}`;
      demBadge.className = `metric-badge ${chg >= 0 ? 'badge-up' : 'badge-down'}`;

      const sChg = (sc.storageChg + adj.s * 0.4).toFixed(1);
      const stBadge = $('metric-storage-badge');
      stBadge.textContent = sChg >= 0 ? `▲ ${sChg}% (Seasonal)` : `▼ ${Math.abs(sChg)}% (Seasonal)`;
      stBadge.className = `metric-badge ${sChg >= 0 ? 'badge-up' : 'badge-down'}`;

      const defBadge = $('metric-deficit-badge');
      if (deficit < 0) {
        defBadge.textContent = 'DEFICIT';
        defBadge.className   = 'metric-badge badge-deficit';
        $('metric-deficit').className = 'metric-value red';
      } else {
        defBadge.textContent = 'SURPLUS';
        defBadge.className   = 'metric-badge badge-surplus';
        $('metric-deficit').className = 'metric-value green';
      }

      const regionLabel = region1 === 'all' ? 'All Regions' : region1.charAt(0).toUpperCase() + region1.slice(1);
      showToast(`Forecast for ${year} (${scenario}, ${regionLabel}) updated!`, 'success');
    }, 1800);
  });
}

/* ------------------------------------------
   RESERVOIR TABLE
------------------------------------------ */
function renderTable(data) {
  const tbody = $('reservoir-tbody');
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--txt-muted);">No reservoirs match your search.</td></tr>`;
    return;
  }
  tbody.innerHTML = data.map(r => {
    const sc = { LOW:'status-low', NORMAL:'status-normal', HIGH:'status-high', CRITICAL:'status-critical' }[r.status] || 'status-low';
    const bc = pctColor(r.pct);
    return `<tr data-name="${r.name}">
      <td>${r.name}</td>
      <td>${r.level}</td>
      <td>${fmt(r.storage)}</td>
      <td>${fmt(r.capacity)}</td>
      <td>
        <div class="pct-bar-wrap">
          <div class="pct-bar"><div class="pct-bar-fill" style="width:${r.pct}%;background:${bc}"></div></div>
          <span class="pct-text">${r.pct}%</span>
        </div>
      </td>
      <td>${r.inflow}</td>
      <td>${r.outflow}</td>
      <td><span class="status-badge ${sc}">${r.status}</span></td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('tr[data-name]').forEach(row => {
    row.addEventListener('click', () => {
      const r = data.find(x => x.name === row.dataset.name);
      if (!r) return;
      openModal(r.name + ' – Details', `
        <table style="width:100%;font-size:13px;border-collapse:collapse;">
          ${[['Current Level',r.level+' M'],['Current Storage',fmt(r.storage)+' MCM'],['Capacity',fmt(r.capacity)+' MCM'],
             ['Storage %',r.pct+'%'],['Inflow',r.inflow+' Cumec'],['Outflow',r.outflow+' Cumec'],
             ['Net Flow',(r.inflow-r.outflow)+' Cumec'],['Status',r.status]]
            .map(([k,v]) => `<tr style="border-bottom:1px solid rgba(255,255,255,0.06)">
              <td style="padding:8px 0;color:#5a6a8a;font-weight:600;text-transform:uppercase;font-size:10.5px;">${k}</td>
              <td style="padding:8px 0;text-align:right;font-weight:600;color:#e8edf8;">${v}</td></tr>`)
            .join('')}
        </table>`);
    });
  });
}

function filterAndRender() {
  let data = [...RESERVOIRS_BASE];
  if (searchQuery) data = data.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
  if (sortCol) {
    data.sort((a, b) => {
      const av = typeof a[sortCol] === 'string' ? a[sortCol].toLowerCase() : a[sortCol];
      const bv = typeof b[sortCol] === 'string' ? b[sortCol].toLowerCase() : b[sortCol];
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }
  currentData = data;
  renderTable(data);
}

function initTable() {
  filterAndRender();

  document.querySelectorAll('thead th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      sortDir = (sortCol === col && sortDir === 'asc') ? 'desc' : 'asc';
      sortCol = col;
      document.querySelectorAll('thead th').forEach(t => t.classList.remove('sorted-asc','sorted-desc'));
      th.classList.add(sortDir === 'asc' ? 'sorted-asc' : 'sorted-desc');
      filterAndRender();
    });
  });

  $('reservoir-search').addEventListener('input', e => {
    searchQuery = e.target.value.trim();
    filterAndRender();
  });

  $('btn-export').addEventListener('click', () => {
    const headers = ['Reservoir Name','Level (M)','Storage (MCM)','Capacity (MCM)','Storage %','Inflow','Outflow','Status'];
    const rows = currentData.map(r => [r.name,r.level,r.storage,r.capacity,r.pct,r.inflow,r.outflow,r.status].join(','));
    const blob = new Blob([[headers.join(','),...rows].join('\n')], { type:'text/csv' });
    const a = Object.assign(document.createElement('a'), { href:URL.createObjectURL(blob), download:'reservoir_status.csv' });
    a.click(); URL.revokeObjectURL(a.href);
    showToast('CSV exported!', 'success');
  });

  $('btn-expand').addEventListener('click', () => {
    openModal('All Reservoirs – Full View', `
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead><tr style="border-bottom:2px solid rgba(255,255,255,0.1);">
            ${['Reservoir','Level (M)','Storage','Capacity','%','Inflow','Outflow','Status']
              .map(h => `<th style="padding:8px 6px;text-align:left;font-size:9.5px;text-transform:uppercase;color:#5a6a8a;">${h}</th>`).join('')}
          </tr></thead>
          <tbody>${RESERVOIRS_BASE.map(r => `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
              <td style="padding:9px 6px;font-weight:600;color:#8a9bc0;">${r.name}</td>
              <td style="padding:9px 6px;color:#e8edf8;">${r.level}</td>
              <td style="padding:9px 6px;color:#e8edf8;">${fmt(r.storage)}</td>
              <td style="padding:9px 6px;color:#e8edf8;">${fmt(r.capacity)}</td>
              <td style="padding:9px 6px;color:#e8edf8;">${r.pct}%</td>
              <td style="padding:9px 6px;color:#e8edf8;">${r.inflow}</td>
              <td style="padding:9px 6px;color:#e8edf8;">${r.outflow}</td>
              <td style="padding:9px 6px;"><span style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;
                background:${{LOW:'rgba(224,120,48,0.15)',NORMAL:'rgba(39,200,128,0.15)',HIGH:'rgba(46,125,209,0.15)',CRITICAL:'rgba(224,85,85,0.15)'}[r.status]};
                color:${{LOW:'#e07830',NORMAL:'#27c880',HIGH:'#2e7dd1',CRITICAL:'#e05555'}[r.status]};">${r.status}</span></td>
            </tr>`).join('')}</tbody>
        </table>
      </div>`);
  });
}

/* ------------------------------------------
   MAP
------------------------------------------ */
function createMarkerIcon(status) {
  const color = STATUS_COLORS[status]?.fill || '#888';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
    <path d="M18 2C10.3 2 4 8.3 4 16c0 10.5 14 26 14 26S32 26.5 32 16C32 8.3 25.7 2 18 2z" fill="${color}" opacity="0.95"/>
    <circle cx="18" cy="16" r="7.5" fill="rgba(0,0,0,0.4)"/>
    <text x="18" y="20" text-anchor="middle" font-size="8" font-weight="700" font-family="Inter,sans-serif" fill="white">DAM</text>
  </svg>`;
  return L.divIcon({ html:svg, iconSize:[36,44], iconAnchor:[18,44], popupAnchor:[0,-46], className:'' });
}

function buildPopup(r) {
  const color  = STATUS_COLORS[r.status]?.fill   || '#888';
  const header = STATUS_COLORS[r.status]?.header || '#555';
  return `<div>
    <div class="map-popup-header" style="background:${header}">${r.name}</div>
    <div class="map-popup-body">
      ${[['River',r.river],['District',r.district],['Level',r.level+' M'],['Storage',fmt(r.storage)+' MCM'],['Capacity',fmt(r.capacity)+' MCM']]
        .map(([k,v]) => `<div class="map-popup-row"><span class="map-popup-key">${k}</span><span class="map-popup-val">${v}</span></div>`).join('')}
      <div class="map-popup-pct-bar"><div class="map-popup-pct-fill" style="width:${r.pct}%;background:${color}"></div></div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:#5a6a8a;margin-top:2px;">
        <span>Storage ${r.pct}%</span>
        <span style="font-weight:700;color:${color}">${r.status}</span>
      </div>
      ${[['Inflow',r.inflow+' Cumec'],['Outflow',r.outflow+' Cumec'],['Net Flow',(r.inflow>=r.outflow?'+':'')+(r.inflow-r.outflow)+' Cumec']]
        .map(([k,v]) => `<div class="map-popup-row"><span class="map-popup-key">${k}</span><span class="map-popup-val">${v}</span></div>`).join('')}
    </div>
  </div>`;
}

function initMap() {
  if (mapInstance) return;
  mapInstance = L.map('reservoir-map', { center:[23.0,77.5], zoom:7, zoomControl:true });

  tileNormal = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:'© OpenStreetMap contributors', maxZoom:18
  }).addTo(mapInstance);

  tileSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution:'© Esri, Maxar', maxZoom:18
  });

  // Dark tile overlay for aesthetic
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    opacity:0, maxZoom:18
  });

  const group = L.layerGroup().addTo(mapInstance);
  RESERVOIR_LOCATIONS.forEach(r => {
    const m = L.marker([r.lat,r.lng], { icon:createMarkerIcon(r.status) });
    m.bindPopup(buildPopup(r), { maxWidth:260, className:'reservoir-popup' });
    m.on('mouseover', function() { this.openPopup(); });
    m.addTo(group);
  });

  const bounds = L.latLngBounds(RESERVOIR_LOCATIONS.map(r => [r.lat,r.lng]));
  mapInstance.fitBounds(bounds.pad(0.2));

  $('btn-map-reset').addEventListener('click', () => {
    mapInstance.fitBounds(bounds.pad(0.2));
    showToast('Map view reset', 'info');
  });

  $('btn-map-satellite').addEventListener('click', () => {
    isSatellite = !isSatellite;
    if (isSatellite) {
      mapInstance.removeLayer(tileNormal);
      tileSat.addTo(mapInstance);
      $('btn-map-satellite').textContent = '🗺 Street';
    } else {
      mapInstance.removeLayer(tileSat);
      tileNormal.addTo(mapInstance);
      $('btn-map-satellite').textContent = '🛰 Satellite';
    }
  });

  setTimeout(() => mapInstance.invalidateSize(), 300);
}

/* ------------------------------------------
   SIDEBAR — ALERTS
------------------------------------------ */
function renderAlerts() {
  $('alert-feed').innerHTML = ALERTS.map(a => `
    <div class="alert-item">
      <span class="alert-dot ${a.type}"></span>
      <div>
        <div class="alert-text">${a.text}</div>
        <div class="alert-time">${a.time}</div>
      </div>
    </div>`).join('');
}

/* ------------------------------------------
   SIDEBAR — WEATHER
------------------------------------------ */
function renderWeather() {
  const el = $('weather-widget');
  el.innerHTML = `
    <div class="weather-main">
      <span class="weather-icon">☀️</span>
      <div>
        <div class="weather-temp">22°C</div>
        <div class="weather-desc">Sunny · Madhya Pradesh</div>
      </div>
    </div>
    <div class="weather-grid">
      <div class="weather-cell"><div class="wc-lbl">Humidity</div><div class="wc-val">38%</div></div>
      <div class="weather-cell"><div class="wc-lbl">Wind</div><div class="wc-val">12 km/h</div></div>
      <div class="weather-cell"><div class="wc-lbl">Rainfall</div><div class="wc-val">0 mm</div></div>
      <div class="weather-cell"><div class="wc-lbl">UV Index</div><div class="wc-val">6 (High)</div></div>
    </div>`;
}

/* ------------------------------------------
   SIDEBAR — DONUT CHART
------------------------------------------ */
function renderDonut() {
  const data = [
    { label:'Low',      count:3, color:'#e07830' },
    { label:'Normal',   count:2, color:'#27c880' },
  ];
  const total = data.reduce((s,d) => s + d.count, 0);
  const cx = 70, cy = 70, r = 48, thickness = 16;
  let angle = -Math.PI / 2;
  let paths = '';

  data.forEach(d => {
    const sweep = (d.count / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(angle + sweep);
    const y2 = cy + r * Math.sin(angle + sweep);
    const large = sweep > Math.PI ? 1 : 0;
    const ri = r - thickness;
    const xi1 = cx + ri * Math.cos(angle + sweep);
    const yi1 = cy + ri * Math.sin(angle + sweep);
    const xi2 = cx + ri * Math.cos(angle);
    const yi2 = cy + ri * Math.sin(angle);
    paths += `<path d="M${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${xi1},${yi1} A${ri},${ri} 0 ${large},0 ${xi2},${yi2} Z"
      fill="${d.color}" opacity="0.9"/>`;
    angle += sweep;
  });

  const svg = $('donut-svg');
  svg.innerHTML = paths + `
    <text x="${cx}" y="${cy-6}" text-anchor="middle" font-size="22" font-weight="700" font-family="Rajdhani,sans-serif" fill="#e8edf8">${total}</text>
    <text x="${cx}" y="${cy+12}" text-anchor="middle" font-size="9" fill="#5a6a8a" font-family="Inter,sans-serif">RESERVOIRS</text>`;

  $('donut-legend').innerHTML = data.map(d => `
    <div class="donut-leg-item">
      <span class="donut-leg-sq" style="background:${d.color}"></span>
      ${d.label} (${d.count})
    </div>`).join('');
}

/* ------------------------------------------
   SIDEBAR — SUGGESTIONS
------------------------------------------ */
function renderSuggestions() {
  $('suggestions-list').innerHTML = SUGGESTIONS.map(s => `
    <div class="suggestion-item">
      <span class="sug-icon">${s.icon}</span>
      <div>
        <div class="sug-text">${s.text}</div>
        <span class="sug-tag tag-${s.tag}">${s.tag}</span>
      </div>
    </div>`).join('');
}

/* ------------------------------------------
   SIDEBAR — EVENTS
------------------------------------------ */
function renderEvents() {
  $('events-list').innerHTML = EVENTS.map(e => `
    <div class="event-item">
      <div class="event-date-badge">
        <div class="event-day">${e.day}</div>
        <div class="event-mon">${e.mon}</div>
      </div>
      <div>
        <div class="event-title">${e.title}</div>
        <div class="event-desc">${e.desc}</div>
      </div>
    </div>`).join('');
}

/* ------------------------------------------
   SIDEBAR — QUICK ACTIONS
------------------------------------------ */
function renderQuickActions() {
  $('quick-actions').innerHTML = QUICK_ACTIONS.map((qa, i) => `
    <button class="qa-btn" data-idx="${i}">
      <span class="qa-btn-icon">${qa.icon}</span>
      ${qa.label}
    </button>`).join('');

  $('quick-actions').querySelectorAll('.qa-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const qa = QUICK_ACTIONS[+btn.dataset.idx];
      if (qa.label === 'Export Data') {
        const headers = ['Reservoir Name','Level (M)','Storage (MCM)','Capacity (MCM)','Storage %','Inflow','Outflow','Status'];
        const rows = RESERVOIRS_BASE.map(r => [r.name,r.level,r.storage,r.capacity,r.pct,r.inflow,r.outflow,r.status].join(','));
        const blob = new Blob([[headers.join(','),...rows].join('\n')], { type:'text/csv' });
        const a = Object.assign(document.createElement('a'), { href:URL.createObjectURL(blob), download:'reservoir_data.csv' });
        a.click();
        showToast('Data exported!', 'success');
      } else if (qa.label === 'Send Alert') {
        openModal('Send Alert', `
          <div style="display:flex;flex-direction:column;gap:12px;">
            <div><label style="font-size:11px;color:#5a6a8a;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:4px;">Alert Type</label>
              <select style="width:100%;padding:8px 10px;background:#0f1a2e;border:1px solid rgba(255,255,255,0.12);border-radius:6px;color:#e8edf8;font-size:13px;">
                <option>Critical Warning</option><option>General Notice</option><option>Scheduled Update</option>
              </select></div>
            <div><label style="font-size:11px;color:#5a6a8a;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:4px;">Message</label>
              <textarea rows="3" style="width:100%;padding:8px 10px;background:#0f1a2e;border:1px solid rgba(255,255,255,0.12);border-radius:6px;color:#e8edf8;font-size:13px;resize:none;" placeholder="Enter alert message…"></textarea></div>
          </div>`, () => showToast('Alert sent to all district officers!', 'success'));
      } else if (qa.label === 'Refresh Feed') {
        showToast('Data feed refreshed!', 'info');
      } else if (qa.label === 'Settings') {
        document.querySelector('[data-tab="settings"]').click();
      } else {
        showToast(`${qa.label} — coming soon!`, 'info');
      }
    });
  });
}

/* ------------------------------------------
   OTHER TABS
------------------------------------------ */
function renderForecastBars() {
  const c = $('forecast-bars');
  if (c.dataset.rendered) return; c.dataset.rendered='1';
  c.innerHTML = DISTRICT_FORECAST.map(d => {
    const w = (d.value / d.max * 100).toFixed(1);
    return `<div class="forecast-bar-row">
      <div class="fbar-label">${d.label}</div>
      <div class="fbar-track"><div class="fbar-fill" style="width:0%" data-w="${w}%">${d.value} BCM</div></div>
    </div>`;
  }).join('');
  requestAnimationFrame(() => {
    c.querySelectorAll('.fbar-fill').forEach((el,i) => setTimeout(() => { el.style.width = el.dataset.w; }, i*80));
  });
}

function renderReservoirBars() {
  const c = $('reservoir-bars');
  if (c.dataset.rendered) return; c.dataset.rendered='1';
  c.innerHTML = RESERVOIRS_BASE.map(r => {
    const color = pctColor(r.pct);
    return `<div class="res-bar-row">
      <div class="res-bar-header">
        <span class="res-bar-name">${r.name}</span>
        <span class="res-bar-pct" style="color:${color}">${r.pct}%</span>
      </div>
      <div class="res-bar-track"><div class="res-bar-fill" style="width:0%;background:${color}" data-w="${r.pct}%"></div></div>
      <div class="res-bar-meta"><span>${fmt(r.storage)} MCM used</span><span>${fmt(r.capacity)} MCM total</span></div>
    </div>`;
  }).join('');
  requestAnimationFrame(() => {
    c.querySelectorAll('.res-bar-fill').forEach((el,i) => setTimeout(() => { el.style.width = el.dataset.w; }, i*100));
  });
}

function renderAnalytics() {
  const c = $('analytics-grid');
  if (c.dataset.rendered) return; c.dataset.rendered='1';
  const cards = [
    { val:'5',    lbl:'Major Reservoirs',    color:'var(--blue)' },
    { val:'3',    lbl:'Low Status Dams',     color:'var(--orange)' },
    { val:'2',    lbl:'Normal Status Dams',  color:'var(--green)' },
    { val:'42.7', lbl:'Avg Storage %',       color:'var(--teal)' },
    { val:'998',  lbl:'Total Inflow (Cumec)',  color:'var(--blue)' },
    { val:'1220', lbl:'Total Outflow (Cumec)', color:'var(--red)' },
  ];
  c.innerHTML = cards.map(x => `
    <div class="a-card">
      <div class="a-val" style="color:${x.color}">${x.val}</div>
      <div class="a-lbl">${x.lbl}</div>
    </div>`).join('');
}

function renderReports() {
  const c = $('report-list');
  if (c.dataset.rendered) return; c.dataset.rendered='1';
  c.innerHTML = REPORTS.map((r,i) => `
    <div class="report-item">
      <div class="report-info">
        <div class="r-title">${r.title}</div>
        <div class="r-date">${r.date}</div>
      </div>
      <div class="report-actions">
        <button class="btn-report" data-action="preview" data-idx="${i}">Preview</button>
        <button class="btn-report primary" data-action="download" data-idx="${i}">Download</button>
      </div>
    </div>`).join('');

  c.querySelectorAll('.btn-report').forEach(btn => {
    btn.addEventListener('click', () => {
      const r = REPORTS[+btn.dataset.idx];
      if (btn.dataset.action === 'preview') {
        openModal(r.title, `<p style="margin-bottom:10px;color:#5a6a8a;">${r.date}</p>
          <p style="background:#0f1a2e;padding:14px;border-radius:6px;font-size:12px;line-height:1.7;color:#8a9bc0;">
          This report summarizes water demand forecasts and reservoir status for Madhya Pradesh.
          All data is sourced from CWC and the MP Water Resources Department. Values in BCM unless stated otherwise.</p>`);
      } else {
        showToast(`Downloading "${r.title}"…`, 'info');
        setTimeout(() => showToast('Download complete!', 'success'), 1500);
      }
    });
  });
}

function applyTheme(dark) {
  if (dark) {
    document.body.classList.remove('light');
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.add('light');
    localStorage.setItem('theme', 'light');
  }
}

function initDarkMode() {
  // Restore saved preference (default = dark to match design)
  const saved = localStorage.getItem('theme');
  if (saved === 'light') {
    document.body.classList.add('light');
    SETTINGS_CONFIG[3].checked = false;
  } else {
    document.body.classList.remove('light');
    SETTINGS_CONFIG[3].checked = true;
  }
}

function renderSettings() {
  const c = $('settings-list');
  if (c.dataset.rendered) return; c.dataset.rendered='1';

  // Sync dark mode checked state with actual body class
  SETTINGS_CONFIG[3].checked = !document.body.classList.contains('light');

  c.innerHTML = SETTINGS_CONFIG.map((s,i) => `
    <div class="setting-row">
      <div class="setting-info">
        <div class="s-label">${s.label}</div>
        <div class="s-desc">${s.desc}</div>
      </div>
      <label class="toggle-wrap">
        <input type="checkbox" id="toggle-${i}" ${s.checked ? 'checked' : ''}>
        <span class="toggle-slider"></span>
      </label>
    </div>`).join('');

  // Wire dark mode toggle (index 3)
  const darkToggle = $('toggle-3');
  if (darkToggle) {
    darkToggle.addEventListener('change', () => {
      applyTheme(darkToggle.checked);
      showToast(darkToggle.checked ? '🌙 Dark mode enabled' : '☀️ Light mode enabled', 'info');
    });
  }

  $('btn-save-settings').addEventListener('click', () => {
    showToast('Settings saved!', 'success');
  });
}

/* ------------------------------------------
   MODAL EVENTS
------------------------------------------ */
function initModal() {
  $('modal-close').addEventListener('click', closeModal);
  $('modal-cancel').addEventListener('click', closeModal);
  $('modal-overlay').addEventListener('click', e => {
    if (e.target === $('modal-overlay')) closeModal();
  });
}

/* ------------------------------------------
   INIT
------------------------------------------ */
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();   // ← apply saved theme first
  initTabs();
  initRunForecast();
  initTable();
  initModal();
  initClock();

  // Sidebar
  renderAlerts();
  renderWeather();
  renderDonut();
  renderSuggestions();
  renderEvents();
  renderQuickActions();

  // Map after layout settles
  setTimeout(initMap, 400);
});
