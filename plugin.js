// Project Inspector 2 — JS-only plugin (no panel.html, no dialog.html)
// Everything is rendered from JS.

(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════
  // CONFIG — add/remove sections and timeline types here
  // ═══════════════════════════════════════════════════════════════════════

  const SECTIONS = [
    { key: 'metadata',      label: 'Metadata',     icon: '📋', fetch: () => tintero.project.getMetadata() },
    { key: 'files',         label: 'Files',         icon: '📄', fetch: () => tintero.project.getFiles() },
    { key: 'characters',    label: 'Characters',    icon: '👤', fetch: () => tintero.project.getCharacters() },
    { key: 'worldbuilding', label: 'World',         icon: '🌍', fetch: () => tintero.project.getWorldbuilding() },
    { key: 'docs',          label: 'Docs',          icon: '📖', fetch: () => tintero.project.getDocs() },
    { key: 'notes',         label: 'Notes',         icon: '📝', fetch: () => tintero.project.getNotes() },
    { key: 'plotGrids',     label: 'Plot Grids',    icon: '🗺️',  fetch: () => tintero.project.getPlotGrids() },
    { key: 'cardboards',    label: 'Cardboards',    icon: '📌', fetch: () => tintero.project.getCardboards() },
    { key: 'collections',   label: 'Collections',   icon: '📂', fetch: () => tintero.project.getCollections() },
    { key: 'tags',          label: 'Tags',          icon: '🏷️',  fetch: () => tintero.project.getTags() },
    { key: 'images',        label: 'Images',        icon: '🖼️',  fetch: () => tintero.project.getImages() },
  ];

  const TIMELINE_TYPES = [
    { type: 'File',          slug: 'file',          icon: '📄', color: '#5b9bd5', key: 'files' },
    { type: 'Character',     slug: 'character',     icon: '👤', color: '#c978db', key: 'characters' },
    { type: 'Worldbuilding', slug: 'worldbuilding', icon: '🌍', color: '#6bc96b', key: 'worldbuilding' },
    { type: 'Document',      slug: 'document',      icon: '📖', color: '#e6a04e', key: 'docs' },
    { type: 'Plot Grid',     slug: 'plot-grid',     icon: '🗺️',  color: '#e06b6b', key: 'plotGrids' },
    { type: 'Cardboard',     slug: 'cardboard',     icon: '📌', color: '#d4a843', key: 'cardboards' },
  ];

  // ═══════════════════════════════════════════════════════════════════════
  // SIDEBAR CSS
  // ═══════════════════════════════════════════════════════════════════════

  const SCSS = `<style>
.pi-container    { font-family: inherit; padding: 4px; }
.pi-title        { font-size: 13px; font-weight: 600; margin-bottom: 12px; color: var(--text-secondary, #a98e6b); text-transform: uppercase; letter-spacing: .5px; }
.pi-description  { font-size: 11px; color: var(--text-tertiary, #a19591); margin-bottom: 16px; line-height: 1.4; }
.pi-actions      { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.pi-btn          { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--dark-tertiary, rgba(255,255,255,.04)); border: 1px solid var(--dark-quaternary, rgba(255,255,255,.08)); border-radius: 6px; cursor: pointer; transition: background .15s, border-color .15s; color: var(--text-primary, #e6d7c2); font-family: inherit; text-align: left; width: 100%; }
.pi-btn:hover    { background: var(--dark-quaternary, rgba(255,255,255,.08)); border-color: var(--accent-color, #c98a48); }
.pi-btn-icon     { width: 32px; height: 32px; border-radius: 6px; background: rgba(201,138,72,.12); display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; color: var(--accent-color, #c98a48); }
.pi-btn-text     { overflow: hidden; }
.pi-btn-label    { font-size: 13px; font-weight: 600; color: var(--text-primary, #e6d7c2); }
.pi-btn-desc     { font-size: 10px; color: var(--text-tertiary, #a19591); margin-top: 2px; }
.pi-divider      { height: 1px; background: var(--dark-quaternary, rgba(255,255,255,.08)); margin: 12px 0; }
.pi-summary-title { font-size: 11px; font-weight: 600; color: var(--text-secondary, #a98e6b); text-transform: uppercase; letter-spacing: .3px; margin-bottom: 8px; }
.pi-stat-row     { display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px; }
.pi-stat-label   { color: var(--text-tertiary, #a19591); }
.pi-stat-value   { color: var(--text-primary, #e6d7c2); font-weight: 500; font-variant-numeric: tabular-nums; }
</style>`;

  // ═══════════════════════════════════════════════════════════════════════
  // DIALOG CSS
  // ═══════════════════════════════════════════════════════════════════════

  const DCSS = `<style>
body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; color: var(--text-primary, #e6d7c2); background: var(--dark-bg, transparent); height: 100vh; overflow: hidden; }

/* ── Data Viewer ── */
.dv-container  { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
.dv-tabs       { display: flex; flex-wrap: wrap; gap: 2px; padding: 8px 12px; background: rgba(0,0,0,.15); border-bottom: 1px solid rgba(255,255,255,.06); }
.dv-tab        { display: flex; align-items: center; gap: 4px; padding: 5px 8px; border: none; background: none; color: var(--text-tertiary, #a19591); font-size: 11px; cursor: pointer; border-radius: 4px; font-family: inherit; transition: background .15s; }
.dv-tab:hover  { background: rgba(255,255,255,.06); }
.dv-tab-active { background: rgba(201,138,72,.15); color: var(--accent-color, #c98a48); }
.dv-tab-icon   { font-size: 13px; }
.dv-tab-label  { font-weight: 500; }
.dv-tab-count  { font-size: 10px; opacity: .7; min-width: 14px; text-align: center; background: rgba(255,255,255,.06); border-radius: 8px; padding: 1px 4px; }
.dv-content    { flex: 1; overflow-y: auto; padding: 12px 16px; }
.dv-empty      { text-align: center; padding: 30px; color: var(--text-tertiary, #a19591); font-size: 13px; }

.dv-item                          { margin-bottom: 4px; border: 1px solid rgba(255,255,255,.06); border-radius: 6px; overflow: hidden; }
.dv-item-header                   { display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; background: rgba(255,255,255,.03); font-size: 13px; list-style: none; }
.dv-item-header::-webkit-details-marker { display: none; }
.dv-item[open] .dv-item-header    { border-bottom: 1px solid rgba(255,255,255,.06); }
.dv-item-name                     { font-weight: 600; color: var(--text-primary, #e6d7c2); }
.dv-item-type                     { font-size: 10px; padding: 1px 6px; border-radius: 3px; background: rgba(201,138,72,.12); color: var(--accent-color, #c98a48); text-transform: uppercase; }
.dv-item-body                     { padding: 8px 12px; font-size: 12px; }

.dv-object     { padding-left: 16px; border-left: 1px solid rgba(255,255,255,.06); }
.dv-field      { padding: 2px 0; line-height: 1.5; }
.dv-key        { color: var(--accent-color, #c98a48); font-weight: 500; }
.dv-colon      { color: #666; }
.dv-string     { color: #6bc96b; word-break: break-word; }
.dv-number     { color: #5b9bd5; }
.dv-bool       { color: #c978db; }
.dv-null       { color: #888; font-style: italic; }
.dv-bracket    { color: #888; }
.dv-comma      { color: #666; }
.dv-more       { color: #888; font-style: italic; padding: 2px 0; }
.dv-array      { padding-left: 16px; border-left: 1px solid rgba(255,255,255,.06); }
.dv-array-item { padding: 2px 0; }
.dv-tags       { display: flex; flex-wrap: wrap; gap: 6px; }
.dv-tag        { font-size: 12px; padding: 3px 10px; border-radius: 12px; background: rgba(201,138,72,.12); color: var(--accent-color, #c98a48); }

/* ── Timeline ── */
.tl-container    { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
.tl-empty        { text-align: center; padding: 40px; color: var(--text-tertiary, #a19591); font-size: 14px; }
.tl-summary      { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: rgba(0,0,0,.15); border-bottom: 1px solid rgba(255,255,255,.06); font-size: 12px; color: var(--text-tertiary, #a19591); }
.tl-summary strong { color: var(--text-primary, #e6d7c2); }
.tl-range        { font-size: 11px; opacity: .7; }
.tl-filters      { display: flex; flex-wrap: wrap; gap: 4px; padding: 8px 16px; border-bottom: 1px solid rgba(255,255,255,.06); }
.tl-filter       { padding: 3px 10px; border: 1px solid rgba(255,255,255,.08); background: none; color: var(--text-tertiary, #a19591); font-size: 11px; border-radius: 12px; cursor: pointer; font-family: inherit; transition: all .15s; }
.tl-filter:hover { border-color: rgba(201,138,72,.3); color: var(--accent-color, #c98a48); }
.tl-filter-active { background: rgba(201,138,72,.15); border-color: rgba(201,138,72,.3); color: var(--accent-color, #c98a48); }
.tl-timeline     { flex: 1; overflow-y: auto; padding: 16px 16px 16px 24px; }

.tl-day          { margin-bottom: 20px; position: relative; }
.tl-day::before  { content: ""; position: absolute; left: 7px; top: 24px; bottom: 0; width: 1px; background: rgba(255,255,255,.08); }
.tl-day-header   { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.tl-day-dot      { width: 15px; height: 15px; border-radius: 50%; background: rgba(201,138,72,.2); border: 2px solid var(--accent-color, #c98a48); flex-shrink: 0; }
.tl-day-label    { font-size: 13px; font-weight: 600; color: var(--text-primary, #e6d7c2); }
.tl-day-count    { font-size: 10px; padding: 1px 6px; border-radius: 8px; background: rgba(255,255,255,.06); color: var(--text-tertiary, #a19591); }

.tl-event             { display: flex; margin-left: 7px; padding-left: 20px; margin-bottom: 6px; }
.tl-event-card        { display: flex; align-items: center; gap: 10px; padding: 7px 10px; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06); border-radius: 6px; flex: 1; transition: background .15s; }
.tl-event-card:hover  { background: rgba(255,255,255,.06); }
.tl-event-icon        { width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
.tl-event-info        { overflow: hidden; flex: 1; }
.tl-event-name        { font-size: 12px; font-weight: 500; color: var(--text-primary, #e6d7c2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tl-event-meta        { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
.tl-event-type        { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .3px; }
.tl-event-time        { font-size: 10px; color: var(--text-tertiary, #a19591); }
</style>`;

  // ═══════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function truncate(s, max) {
    return s.length <= max ? s : s.substring(0, max) + '…';
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function fmtDate(ts) {
    const d = new Date(ts);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function fmtShort(ts) {
    const d = new Date(ts);
    const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${M[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  function fmtDay(ts) {
    const d = new Date(ts);
    const D = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const M = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${D[d.getDay()]}, ${M[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  function fmtTime(ts) {
    const d = new Date(ts);
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // OBJECT TREE RENDERER
  // ═══════════════════════════════════════════════════════════════════════

  const TS_MIN = 946684800000;  // 2000-01-01
  const TS_MAX = 4102444800000; // 2100-01-01

  function rObj(o, depth) {
    if (o === null || o === undefined) return '<span class="dv-null">null</span>';

    if (typeof o === 'string')  return `<span class="dv-string">"${esc(truncate(o, 500))}"</span>`;
    if (typeof o === 'boolean') return `<span class="dv-bool">${o}</span>`;
    if (typeof o === 'number') {
      return (o > TS_MIN && o < TS_MAX)
        ? `<span class="dv-number" title="${o}">${fmtDate(o)}</span>`
        : `<span class="dv-number">${o}</span>`;
    }

    if (Array.isArray(o)) {
      if (!o.length) return '<span class="dv-bracket">[ ]</span>';
      if (depth > 3) return `<span class="dv-bracket">[${o.length} items]</span>`;

      // Flat array of primitives → inline
      if (o.every(v => typeof v === 'string' || typeof v === 'number')) {
        const items = o.slice(0, 20).map(v => rObj(v, depth + 1)).join('<span class="dv-comma">, </span>');
        const more  = o.length > 20 ? `<span class="dv-comma"> ...+${o.length - 20} more</span>` : '';
        return `<span class="dv-bracket">[</span> ${items}${more} <span class="dv-bracket">]</span>`;
      }

      const items = o.slice(0, 50).map(v => `<div class="dv-array-item">${rObj(v, depth + 1)}</div>`).join('');
      const more  = o.length > 50 ? `<div class="dv-more">...+${o.length - 50} more</div>` : '';
      return `<div class="dv-array">${items}${more}</div>`;
    }

    if (typeof o === 'object') {
      const keys = Object.keys(o).filter(k => o[k] !== undefined);
      if (!keys.length) return '<span class="dv-bracket">{ }</span>';
      if (depth > 4) return `<span class="dv-bracket">{${keys.length} fields}</span>`;
      const fields = keys.map(k =>
        `<div class="dv-field"><span class="dv-key">${esc(k)}</span><span class="dv-colon">: </span>${rObj(o[k], depth + 1)}</div>`
      ).join('');
      return `<div class="dv-object">${fields}</div>`;
    }

    return `<span>${esc(String(o))}</span>`;
  }

  function rSection(key, data) {
    if (!data) return '<div class="dv-empty">No data available</div>';
    if (Array.isArray(data) && !data.length) return '<div class="dv-empty">Empty</div>';
    if (key === 'metadata') return rObj(data, 0);
    if (key === 'tags') {
      return '<div class="dv-tags">' + data.map(t => `<span class="dv-tag">${esc(t)}</span>`).join('') + '</div>';
    }
    return data.map((item, i) => {
      const name    = item.name || item.title || item.fileName || item.id || `Item ${i + 1}`;
      const typeTag = item.type ? `<span class="dv-item-type">${esc(item.type)}</span>` : '';
      return `<details class="dv-item"${i === 0 ? ' open' : ''}>
        <summary class="dv-item-header">
          <span class="dv-item-name">${esc(String(name))}</span>${typeTag}
        </summary>
        <div class="dv-item-body">${rObj(item, 0)}</div>
      </details>`;
    }).join('');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // DATA COLLECTION
  // ═══════════════════════════════════════════════════════════════════════

  async function collectAllData() {
    const data = {};
    await Promise.all(
      SECTIONS.map(async ({ key, fetch }) => {
        try {
          const result = await fetch();
          data[key] = result || (key === 'metadata' ? null : []);
        } catch {
          data[key] = key === 'metadata' ? null : [];
        }
      })
    );
    return data;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SIDEBAR
  // ═══════════════════════════════════════════════════════════════════════

  const plugin = new TinteroPlugin();
  const root   = document.getElementById('plugin-root');

  function renderSidebar() {
    root.innerHTML = `${SCSS}
      <div class="pi-container">
        <div class="pi-title">Project Inspector 2</div>
        <div class="pi-description">JS-only plugin. No HTML files.</div>
        <div class="pi-actions">
          <button class="pi-btn" id="btn-data">
            <div class="pi-btn-icon">{ }</div>
            <div class="pi-btn-text">
              <div class="pi-btn-label">Project Data Viewer</div>
              <div class="pi-btn-desc">Browse all project data</div>
            </div>
          </button>
          <button class="pi-btn" id="btn-timeline">
            <div class="pi-btn-icon">⏳</div>
            <div class="pi-btn-text">
              <div class="pi-btn-label">Creation Timeline</div>
              <div class="pi-btn-desc">Chronological view of your project</div>
            </div>
          </button>
        </div>
        <div class="pi-divider"></div>
        <div class="pi-summary-title">Quick Stats</div>
        <div id="pi-stats">
          <div class="pi-stat-row"><span class="pi-stat-label">Loading...</span></div>
        </div>
      </div>`;

    document.getElementById('btn-data').addEventListener('click', openDataViewer);
    document.getElementById('btn-timeline').addEventListener('click', openTimeline);
  }

  async function refreshStats() {
    const el = document.getElementById('pi-stats');
    if (!el) return;

    const rows = await Promise.all(
      SECTIONS
        .filter(s => s.key !== 'metadata')
        .map(async ({ label, fetch }) => {
          try {
            const result = await fetch() || [];
            return { label, value: result.length };
          } catch {
            return null;
          }
        })
    );

    el.innerHTML = rows
      .filter(Boolean)
      .map(r => `<div class="pi-stat-row">
        <span class="pi-stat-label">${r.label}</span>
        <span class="pi-stat-value">${r.value}</span>
      </div>`)
      .join('');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // DIALOG — Data Viewer
  // ═══════════════════════════════════════════════════════════════════════

  async function openDataViewer() {
    try {
      await tintero.ui.openDialog({ title: 'Project Data Viewer', width: 720, height: 560 });
      const data = await collectAllData();
      await tintero.ui.render(buildDataViewerHtml(data));
    } catch (err) {
      tintero.ui.showNotification('Error: ' + err.message, 'error');
    }
  }

  function buildDataViewerHtml(data) {
    const tabs = SECTIONS.map((s, i) => {
      const count = Array.isArray(data[s.key]) ? data[s.key].length : (data[s.key] ? 1 : 0);
      return `<button class="dv-tab${i === 0 ? ' dv-tab-active' : ''}" data-tab="${s.key}">
        <span class="dv-tab-icon">${s.icon}</span>
        <span class="dv-tab-label">${esc(s.label)}</span>
        <span class="dv-tab-count">${count}</span>
      </button>`;
    }).join('');

    const panels = SECTIONS.map((s, i) =>
      `<div class="dv-panel" id="dv-panel-${s.key}"${i ? ' style="display:none"' : ''}>
        ${rSection(s.key, data[s.key])}
      </div>`
    ).join('');

    return `${DCSS}
      <div class="dv-container">
        <div class="dv-tabs" id="dv-tabs">${tabs}</div>
        <div class="dv-content">${panels}</div>
      </div>
      <script>
        document.getElementById('dv-tabs').addEventListener('click', function(e) {
          var b = e.target.closest('.dv-tab');
          if (!b) return;
          var k = b.getAttribute('data-tab');
          document.querySelectorAll('.dv-panel').forEach(function(p) { p.style.display = 'none'; });
          document.querySelectorAll('.dv-tab').forEach(function(t) { t.classList.remove('dv-tab-active'); });
          var el = document.getElementById('dv-panel-' + k);
          if (el) el.style.display = 'block';
          b.classList.add('dv-tab-active');
        });
      <\/script>`;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // DIALOG — Timeline
  // ═══════════════════════════════════════════════════════════════════════

  async function openTimeline() {
    try {
      await tintero.ui.openDialog({ title: 'Creation Timeline', width: 640, height: 520 });
      const data = await collectAllData();
      await tintero.ui.render(buildTimelineHtml(data));
    } catch (err) {
      tintero.ui.showNotification('Error: ' + err.message, 'error');
    }
  }

  function buildTimelineHtml(data) {
    const events = [];

    if (data.metadata && data.metadata.createdAt) {
      events.push({ name: data.metadata.name || 'Project', type: 'Project', typeSlug: 'project', icon: '⭐', color: '#e6a04e', timestamp: data.metadata.createdAt });
    }

    for (const def of TIMELINE_TYPES) {
      const list = data[def.key] || [];
      for (const item of list) {
        if (item.createdAt) {
          events.push({ name: item.name || item.title || 'Untitled', type: def.type, typeSlug: def.slug, icon: def.icon, color: def.color, timestamp: item.createdAt });
        }
      }
    }

    events.sort((a, b) => b.timestamp - a.timestamp);

    if (!events.length) {
      return `${DCSS}<div class="tl-container"><div class="tl-empty">No timestamped items found.</div></div>`;
    }

    // Build filter buttons
    const filterTypes = ['All', ...(data.metadata && data.metadata.createdAt ? ['Project'] : []), ...TIMELINE_TYPES.map(t => t.type)];
    const filters = filterTypes.map((t, i) => {
      const slug = t.toLowerCase().replace(/ /g, '-');
      return `<button class="tl-filter${i === 0 ? ' tl-filter-active' : ''}" data-filter="${slug}">${t}</button>`;
    }).join('');

    // Group by day
    const byDay = {};
    for (const ev of events) {
      const d   = new Date(ev.timestamp);
      const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      if (!byDay[key]) byDay[key] = [];
      byDay[key].push(ev);
    }

    const dayBlocks = Object.keys(byDay).sort((a, b) => b.localeCompare(a)).map(key => {
      const dayEvents = byDay[key];
      const cards = dayEvents.map(ev => `
        <div class="tl-event" data-type="${ev.typeSlug}">
          <div class="tl-event-card">
            <div class="tl-event-icon" style="background:${ev.color}20;color:${ev.color}">${ev.icon}</div>
            <div class="tl-event-info">
              <div class="tl-event-name">${esc(ev.name)}</div>
              <div class="tl-event-meta">
                <span class="tl-event-type" style="color:${ev.color}">${esc(ev.type)}</span>
                <span class="tl-event-time">${fmtTime(ev.timestamp)}</span>
              </div>
            </div>
          </div>
        </div>`).join('');

      return `
        <div class="tl-day">
          <div class="tl-day-header">
            <div class="tl-day-dot"></div>
            <div class="tl-day-label">${fmtDay(dayEvents[0].timestamp)}</div>
            <div class="tl-day-count">${dayEvents.length}</div>
          </div>
          ${cards}
        </div>`;
    }).join('');

    const first = events[events.length - 1];
    const last  = events[0];

    return `${DCSS}
      <div class="tl-container">
        <div class="tl-summary">
          <span>Showing <strong>${events.length}</strong> events</span>
          <span class="tl-range">${fmtShort(first.timestamp)} — ${fmtShort(last.timestamp)}</span>
        </div>
        <div class="tl-filters" id="tl-filters">${filters}</div>
        <div class="tl-timeline">${dayBlocks}</div>
      </div>
      <script>
        document.getElementById('tl-filters').addEventListener('click', function(e) {
          var b = e.target.closest('.tl-filter');
          if (!b) return;
          var t = b.getAttribute('data-filter');
          document.querySelectorAll('.tl-filter').forEach(function(f) { f.classList.remove('tl-filter-active'); });
          b.classList.add('tl-filter-active');
          document.querySelectorAll('.tl-event').forEach(function(ev) {
            ev.style.display = (t === 'all' || ev.getAttribute('data-type') === t) ? '' : 'none';
          });
          document.querySelectorAll('.tl-day').forEach(function(day) {
            var visible = day.querySelectorAll('.tl-event:not([style*="display: none"])');
            day.style.display = visible.length > 0 ? '' : 'none';
          });
        });
      <\/script>`;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════

  plugin.onActivate = async function () {
    renderSidebar();
    await refreshStats();
  };

  plugin.onProjectChange = async function () {
    await refreshStats();
  };

  registerPlugin(plugin);
})();
