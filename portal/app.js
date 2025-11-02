// ... (JavaScript คงเดิมทั้งหมด) ...
const dynamicSectionsContainer = document.getElementById('dynamic-sections-container');
const searchBox = document.getElementById('search-box');
const layoutGridBtn = document.getElementById('layout-grid-btn');
const layoutCompactBtn = document.getElementById('layout-compact-btn');
const layoutListBtn = document.getElementById('layout-list-btn');
const fontSizeIncreaseBtn = document.getElementById('font-size-increase-btn');
const fontSizeDecreaseBtn = document.getElementById('font-size-decrease-btn');
const fontSizeDisplay = document.getElementById('font-size-display');
const resetDefaultsBtn = document.getElementById('reset-defaults-btn');
const headerDate = document.getElementById('header-date');
const headerTime = document.getElementById('header-time');
const profileToggleBtn = document.getElementById('profile-toggle-btn');
const adminToggleBtn = document.getElementById('admin-toggle-btn');
const addCategoryBtn = document.getElementById('add-category-btn');
const addAppBtn = document.getElementById('add-app-btn');
const modalOverlay = document.getElementById('admin-modal-overlay');
const modalContent = document.getElementById('admin-modal-content');
const modalTitle = document.getElementById('admin-modal-title');
const modalForm = document.getElementById('admin-modal-form');
const modalSaveBtn = document.getElementById('admin-modal-save-btn');
const modalCancelBtn = document.getElementById('admin-modal-cancel-btn');
const modalCloseBtn = document.getElementById('admin-modal-close-btn');
let allCategories = [];
let sortableInstances = [];
const BASE_FONT_SIZE = 16;
function openModal() { modalOverlay.classList.remove('hidden'); setTimeout(() => { modalOverlay.classList.remove('opacity-0'); modalContent.classList.remove('scale-95', 'opacity-0'); }, 10); }
function closeModal() { modalOverlay.classList.add('opacity-0'); modalContent.classList.add('scale-95', 'opacity-0'); setTimeout(() => { modalOverlay.classList.add('hidden'); modalForm.innerHTML = ''; modalSaveBtn.onclick = null; }, 300); }
[modalCancelBtn, modalCloseBtn].forEach(btn => btn.onclick = closeModal);
modalOverlay.onclick = (e) => { if (e.target === modalOverlay) closeModal(); };
function showCategoryModal(category = null) {
    const isEditing = category !== null; modalTitle.textContent = isEditing ? 'แก้ไขหมวดหมู่' : 'สร้างหมวดหมู่ใหม่'; modalForm.innerHTML = `<div><label for="category-name" class="block text-sm font-medium text-gray-700">ชื่อหมวดหมู่</label><input type="text" id="category-name" class="modal-input mt-1" value="${isEditing ? category.title : ''}" required></div><div><label for="category-emoji" class="block text-sm font-medium text-gray-700">Emoji</label><input type="text" id="category-emoji" class="modal-input mt-1" value="${isEditing ? category.emoji : ''}"></div>`; modalSaveBtn.onclick = () => { const name = document.getElementById('category-name').value; if (!name) return alert('กรุณาใส่ชื่อหมวดหมู่'); const emoji = document.getElementById('category-emoji').value; if (isEditing) { const cat = allCategories.find(c => c.id === category.id); if (cat) { cat.title = name; cat.emoji = emoji; } } else { const newCat = { id: 'cat_' + Date.now(), title: name, emoji: emoji, order: allCategories.length, apps: [] }; allCategories.push(newCat); } closeModal(); renderPortal(); }; openModal();
}
function showAppModal(app = null, currentCategoryId = null) {
    const isEditing = app !== null; modalTitle.textContent = isEditing ? 'แก้ไขแอปพลิเคชัน' : 'สร้างแอปใหม่'; const categoryOptions = allCategories.sort((a, b) => a.order - b.order).map(cat => `<option value="${cat.id}" ${cat.id === currentCategoryId ? 'selected' : ''}>${cat.title}</option>`).join(''); modalForm.innerHTML = `<div><label for="app-category" class="block text-sm font-medium text-gray-700">หมวดหมู่</label><select id="app-category" class="modal-input mt-1">${categoryOptions}</select></div><div><label for="app-name" class="block text-sm font-medium text-gray-700">ชื่อแอป</label><input type="text" id="app-name" class="modal-input mt-1" value="${isEditing ? app.name : ''}" required></div><div><label for="app-desc" class="block text-sm font-medium text-gray-700">คำอธิบาย</label><input type="text" id="app-desc" class="modal-input mt-1" value="${isEditing ? app.description : ''}"></div><div><label for="app-url" class="block text-sm font-medium text-gray-700">URL</label><input type="url" id="app-url" class="modal-input mt-1" value="${isEditing ? app.url : ''}" required></div><div><label for="app-icon" class="block text-sm font-medium text-gray-700">Icon URL (หรือ SVG)</label><textarea id="app-icon" rows="3" class="modal-input mt-1">${isEditing ? app.icon : ''}</textarea></div><div><label for="app-external" class="block text-sm font-medium text-gray-700"><input type="checkbox" id="app-external" class="mr-2" ${isEditing && app.isExternal ? 'checked' : (isEditing ? '' : 'checked')}> เปิดในแท็บใหม่</label></div>`; modalSaveBtn.onclick = () => { const newCategoryId = document.getElementById('app-category').value; const name = document.getElementById('app-name').value; if (!newCategoryId || !name) return alert('กรุณากรอกข้อมูลให้ครบ'); const appData = { name, description: document.getElementById('app-desc').value, url: document.getElementById('app-url').value, icon: document.getElementById('app-icon').value, isExternal: document.getElementById('app-external').checked }; if (isEditing) { const oldCat = allCategories.find(c => c.id === currentCategoryId); const appIndex = oldCat.apps.findIndex(a => a.id === app.id); if (appIndex === -1) return alert('ไม่พบแอป'); if (currentCategoryId === newCategoryId) { Object.assign(oldCat.apps[appIndex], appData); } else { const [movedApp] = oldCat.apps.splice(appIndex, 1); Object.assign(movedApp, appData); const newCat = allCategories.find(c => c.id === newCategoryId); movedApp.order = newCat.apps.length; newCat.apps.push(movedApp); } } else { const newCat = allCategories.find(c => c.id === newCategoryId); const newApp = { id: 'app_' + Date.now(), ...appData, order: newCat.apps.length }; newCat.apps.push(newApp); } closeModal(); renderPortal(); }; openModal();
}
addCategoryBtn.onclick = () => showCategoryModal(null, allCategories[0]?.id);
addAppBtn.onclick = () => showAppModal(null, allCategories[0]?.id);
adminToggleBtn.addEventListener('click', () => { document.body.classList.toggle('admin-mode'); adminToggleBtn.classList.toggle('admin-mode-active'); adminToggleBtn.querySelector('span').textContent = document.body.classList.contains('admin-mode') ? 'Exit Admin Mode' : 'Admin Mode'; document.body.classList.remove('profile-open'); renderPortal(); });
function attachAdminEventListeners() { document.querySelectorAll('.edit-category-btn').forEach(btn => btn.onclick = (e) => { e.stopPropagation(); const cat = allCategories.find(c => c.id === btn.dataset.categoryId); if (cat) showCategoryModal(cat); }); document.querySelectorAll('.edit-app-btn').forEach(btn => btn.onclick = (e) => { e.stopPropagation(); const { appId, categoryId } = btn.dataset; const app = allCategories.find(c => c.id === categoryId)?.apps.find(a => a.id === appId); if (app) showAppModal(app, categoryId); }); document.querySelectorAll('.delete-app-btn').forEach(btn => btn.onclick = (e) => { e.stopPropagation(); if (!confirm('ยืนยันการลบแอป?')) return; const { appId, categoryId } = btn.dataset; const cat = allCategories.find(c => c.id === categoryId); if (!cat) return; const appIndex = cat.apps.findIndex(a => a.id === appId); if (appIndex > -1) { cat.apps.splice(appIndex, 1); renderPortal(); } }); document.querySelectorAll('.delete-category-btn').forEach(btn => btn.onclick = (e) => { e.stopPropagation(); const cat = allCategories.find(c => c.id === btn.dataset.categoryId); if (cat.apps.length > 0) return alert('ต้องลบแอปทั้งหมดในหมวดนี้ก่อน'); if (!confirm(`ยืนยันการลบหมวดหมู่ "${cat.title}"?`)) return; const catIndex = allCategories.findIndex(c => c.id === cat.id); if (catIndex > -1) { allCategories.splice(catIndex, 1); renderPortal(); } }); }
function initializeAllSortables() { destroyAllSortables(); const containerSortable = new Sortable(dynamicSectionsContainer, { animation: 150, handle: '.drag-handle.category-handle', onEnd: (evt) => { dynamicSectionsContainer.querySelectorAll('.category-section').forEach((section, index) => { const cat = allCategories.find(c => c.id === section.dataset.categoryId); if(cat) cat.order = index; }); }}); sortableInstances.push(containerSortable); document.querySelectorAll('.apps-container').forEach(container => { const appSortable = new Sortable(container, { group: 'apps', animation: 150, handle: '.drag-handle.app-handle', onEnd: handleAppSortEnd, }); sortableInstances.push(appSortable); }); }
function handleAppSortEnd(evt) { const { item, from, to, oldIndex, newIndex } = evt; const appId = item.dataset.appId; const fromCategoryId = from.closest('.category-section').dataset.categoryId; const toCategoryId = to.closest('.category-section').dataset.categoryId; const fromCat = allCategories.find(c => c.id === fromCategoryId); const appIndex = fromCat.apps.findIndex(a => a.id === appId); if (appIndex === -1) return; const [app] = fromCat.apps.splice(appIndex, 1); const toCat = allCategories.find(c => c.id === toCategoryId); toCat.apps.splice(newIndex, 0, app); fromCat.apps.forEach((a, index) => a.order = index); if (fromCategoryId !== toCategoryId) { toCat.apps.forEach((a, index) => a.order = index); } }
function destroyAllSortables() { sortableInstances.forEach(i => i.destroy()); sortableInstances = []; }
function createAppCard(app, categoryId) { const appCard = document.createElement('div'); appCard.className = 'app-card'; appCard.dataset.appId = app.id; const defaultIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500"><path d="M21.25 16.25V7.75a2 2 0 00-2-2H4.75a2 2 0 00-2 2v8.5a2 2 0 002 2h14.5a2 2 0 002-2zM2.75 8.75h18.5"/><path d="M7 11.75h3m-3 3h6"/></svg>`; let iconHtml = defaultIcon; if (app.icon && app.icon.trim().startsWith('<svg')) { iconHtml = app.icon; } else if (app.icon && (app.icon.startsWith('http') || app.icon.startsWith('/') || app.icon.startsWith('data:'))) { iconHtml = `<img src="${app.icon}" alt="${app.name} icon" class="">`; } const dragHandle = `<div class="drag-handle app-handle"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="19" r="1"></circle><circle cx="5" cy="5" r="1"></circle><circle cx="5" cy="12" r="1"></circle><circle cx="5" cy="19" r="1"></circle></svg></div>`; const adminControls = `<div class="admin-controls absolute top-2 right-2 gap-1 z-10"><button data-app-id="${app.id}" data-category-id="${categoryId}" class="edit-app-btn bg-yellow-400 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm hover:bg-yellow-500">✏️</button><button data-app-id="${app.id}" data-category-id="${categoryId}" class="delete-app-btn bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm hover:bg-red-600">X</button></div>`; appCard.innerHTML = `${dragHandle}<a href="${app.url}" target="${app.isExternal ? '_blank' : '_self'}" rel="noopener noreferrer" class="flex-grow flex items-center p-4"><div class="app-icon mr-4 flex-shrink-0 w-10 h-10 flex items-center justify-center">${iconHtml}</div><div class="text-left"><h3 class="app-title">${app.name}</h3><p class="app-info">${app.description}</p></div></a>${adminControls}`; appCard.querySelector('a').onclick = (e) => { if (document.body.classList.contains('admin-mode')) e.preventDefault(); }; return appCard; }
function renderPortal() { const isAdminMode = document.body.classList.contains('admin-mode'); dynamicSectionsContainer.innerHTML = ''; allCategories.sort((a, b) => a.order - b.order).forEach(category => { const section = document.createElement('section'); section.className = 'category-section mb-10'; section.dataset.categoryId = category.id; if (category.apps.length === 0 && !isAdminMode) return; const dragHandle = `<div class="drag-handle category-handle"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="19" r="1"></circle><circle cx="5" cy="5" r="1"></circle><circle cx="5" cy="12" r="1"></circle><circle cx="5" cy="19" r="1"></circle></svg></div>`; const adminCategoryControls = `<button data-category-id="${category.id}" class="edit-category-btn text-gray-500 hover:text-blue-500 ml-4 text-xs p-1 rounded-full">✏️</button><button data-category-id="${category.id}" class="delete-category-btn text-gray-500 hover:text-red-500 ml-1 text-xs p-1 rounded-full">🗑️</button>`; section.innerHTML = `<div class="flex items-center mb-4 border-b border-blue-200/50 pb-2">${dragHandle}<h2 class="category-title text-xl text-primary">${category.emoji || '📁'} ${category.title}</h2>${isAdminMode ? adminCategoryControls : ''}</div><div class="apps-container"></div>`; const gridContainer = section.querySelector('.apps-container'); (category.apps || []).sort((a,b) => a.order - b.order).forEach(app => gridContainer.appendChild(createAppCard(app, category.id))); dynamicSectionsContainer.appendChild(section); }); isAdminMode ? (attachAdminEventListeners(), initializeAllSortables()) : destroyAllSortables(); adminToggleBtn.classList.toggle('admin-mode-active', isAdminMode); adminToggleBtn.querySelector('span').textContent = isAdminMode ? 'Exit Admin Mode' : 'Admin Mode'; }
function applyLayout(layoutName) { document.body.classList.remove('layout-grid', 'layout-compact', 'layout-list'); document.body.classList.add(`layout-${layoutName}`); [layoutGridBtn, layoutCompactBtn, layoutListBtn].forEach(btn => btn.classList.remove('active')); document.getElementById(`layout-${layoutName}-btn`).classList.add('active'); localStorage.setItem('portalLayout', layoutName); }
function updateFontSizeDisplay() { const currentSize = parseFloat(localStorage.getItem('portalFontSize')) || BASE_FONT_SIZE; const percentage = Math.round((currentSize / BASE_FONT_SIZE) * 100); fontSizeDisplay.textContent = `${percentage}%`; document.documentElement.style.fontSize = `${currentSize}px`; }
function changeFontSize(delta) { let currentSize = parseFloat(localStorage.getItem('portalFontSize')) || BASE_FONT_SIZE; let newSize = currentSize + delta; if (newSize < 12) newSize = 12; if (newSize > 20) newSize = 20; localStorage.setItem('portalFontSize', newSize); updateFontSizeDisplay(); }
function handleSearch() { const searchTerm = searchBox.value.toLowerCase().trim(); document.querySelectorAll('.category-section').forEach(section => { let hasVisibleApp = false; section.querySelectorAll('.app-card').forEach(card => { const isVisible = card.textContent.toLowerCase().includes(searchTerm); card.style.display = isVisible ? 'flex' : 'none'; if(isVisible) hasVisibleApp = true; }); section.style.display = hasVisibleApp || document.body.classList.contains('admin-mode') ? 'block' : 'none'; }); }
function updateDateTime() { const now = new Date(); const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Bangkok' }; const timeOptions = { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'Asia/Bangkok' }; let thaiDate = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', dateOptions).format(now); let time = now.toLocaleTimeString('en-US', timeOptions); if (headerDate) headerDate.textContent = thaiDate; if (headerTime) headerTime.textContent = time; }
document.addEventListener('DOMContentLoaded', () => {
    fetch('firebase-data-modified.json')
        .then(response => { if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); } return response.json(); })
        .then(data => { allCategories = Object.values(data.categories); allCategories.forEach((cat, cIdx) => { cat.id = cat.id || `cat_${cIdx}`; cat.apps.forEach((app, aIdx) => { app.id = app.id || `app_${cIdx}_${aIdx}`; }); }); renderPortal(); })
        .catch(error => { console.error("Error fetching data:", error); dynamicSectionsContainer.innerHTML = `<p class="text-red-500">Error: ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบไฟล์ 'firebase-data-modified.json'</p>`; })
        .finally(() => { setupUIControls(); });

    function setupUIControls() {
        const defaultLayout = 'grid'; applyLayout(localStorage.getItem('portalLayout') || defaultLayout); updateFontSizeDisplay(); layoutGridBtn.addEventListener('click', () => applyLayout('grid')); layoutCompactBtn.addEventListener('click', () => applyLayout('compact')); layoutListBtn.addEventListener('click', () => applyLayout('list')); fontSizeIncreaseBtn.addEventListener('click', () => changeFontSize(1)); fontSizeDecreaseBtn.addEventListener('click', () => changeFontSize(-1)); searchBox.addEventListener('input', handleSearch); resetDefaultsBtn.addEventListener('click', () => { applyLayout(defaultLayout); localStorage.setItem('portalFontSize', BASE_FONT_SIZE); updateFontSizeDisplay(); }); updateDateTime(); setInterval(updateDateTime, 1000); profileToggleBtn.addEventListener('click', (e) => { e.stopPropagation(); document.body.classList.toggle('profile-open'); }); document.addEventListener('click', (e) => { const dropdown = document.getElementById('profile-dropdown'); if (dropdown && !profileToggleBtn.contains(e.target) && !dropdown.contains(e.target)) { document.body.classList.remove('profile-open'); } });
    }
});

// === THEME MANAGER (non-destructive append) ===
(function(){
  const KEY_THEME = 'portal_theme';
  const KEY_PREFIX = 'portal_theme_custom_';
  const VARS = {
    bg: '--bg', surface: '--surface', text: '--text', accent: '--accent',
    radius: '--radius', blur: '--glass-blur', shadow: '--shadow-color'
  };
  function setVar(name, cssVar, value){
    if(value==null || value===''){
      document.documentElement.style.removeProperty(cssVar);
      localStorage.removeItem(KEY_PREFIX+name);
    }else{
      document.documentElement.style.setProperty(cssVar, value);
      localStorage.setItem(KEY_PREFIX+name, value);
    }
  }
  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY_THEME, theme); // Save the theme to localStorage
    document.querySelectorAll('input[name="theme"]')?.forEach(r=> r.checked = (r.value===theme));
  }
  // expose theme apis
  window.applyTheme = applyTheme;
  window.__PORTAL_THEME_KEY = KEY_THEME;
  function loadTheme(){
    let t = localStorage.getItem(KEY_THEME);
    if(!t){ t = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'; }
    applyTheme(t);
    for(const [k, cssVar] of Object.entries(VARS)){
      const v = localStorage.getItem(KEY_PREFIX+k);
      if(v) document.documentElement.style.setProperty(cssVar, v);
    }
  }
  const PALETTES = [
    {bg:'#e9f0ff', surface:'#ffffff', accent:'#2563eb'},
    {bg:'#ebf7ef', surface:'#ffffff', accent:'#16a34a'},
    {bg:'#fbf7ef', surface:'#ffffff', accent:'#d97706'},
    {bg:'#f6f2ff', surface:'#ffffff', accent:'#a78bfa'},
    {bg:'#0b1120', surface:'rgba(15,23,42,0.72)', accent:'#60a5fa'},
    {bg:'#f4f6f9', surface:'#ffffff', accent:'#334155'},
    {bg:'#e6f7ff', surface:'#ffffff', accent:'#0ea5e9'},
    {bg:'#f7f5f2', surface:'#ffffff', accent:'#b45309'},
    {bg:'#07071a', surface:'rgba(10,10,40,.82)', accent:'#22d3ee'},
    {bg:'#ffffff', surface:'#ffffff', accent:'#000000'}
  ];
  document.addEventListener('DOMContentLoaded', ()=>{
    loadTheme();
    const panel = document.getElementById('theme-panel');
    const mini = document.getElementById('theme-toggle-mini');
    const closeBtn = document.getElementById('close-theme');
    function openPanel(){ panel?.classList.add('show'); panel?.classList.remove('hidden'); }
    function closePanel(){ panel?.classList.remove('show'); }
    mini?.addEventListener('click', openPanel);
    closeBtn?.addEventListener('click', closePanel);
    document.querySelectorAll('input[name="theme"]')?.forEach(r=>{
      r.addEventListener('change', e=>{
        const theme = e.target.value;
        localStorage.setItem(KEY_THEME, theme);
        applyTheme(theme);
      });
    });
    const grid = document.getElementById('palette-grid');
    if(grid){
      grid.innerHTML = '';
      PALETTES.forEach(p=>{
        const sw = document.createElement('div');
        sw.className = 'palette-swatch';
        sw.style.background = `linear-gradient(135deg, ${p.bg} 0 50%, ${p.accent} 50% 100%)`;
        sw.title = `bg:${p.bg} / accent:${p.accent}`;
        sw.addEventListener('click', ()=>{
          setVar('bg', VARS.bg, p.bg);
          setVar('surface', VARS.surface, p.surface);
          setVar('accent', VARS.accent, p.accent);
        });
        grid.appendChild(sw);
      });
    }
    const bg = document.getElementById('customBg');
    const surface = document.getElementById('customSurface');
    const text = document.getElementById('customText');
    const accent = document.getElementById('customAccent');
    const radius = document.getElementById('radiusRange');
    const blur = document.getElementById('blurRange');
    const shadow = document.getElementById('shadowRange');
    const resetThemeBtn = document.getElementById('reset-theme');
    const resetColorsBtn = document.getElementById('reset-color');
    bg?.addEventListener('input', e=> setVar('bg', VARS.bg, e.target.value));
    surface?.addEventListener('input', e=> setVar('surface', VARS.surface, e.target.value));
    text?.addEventListener('input', e=> setVar('text', VARS.text, e.target.value));
    accent?.addEventListener('input', e=> setVar('accent', VARS.accent, e.target.value));
    radius?.addEventListener('input', e=> setVar('radius', VARS.radius, `${e.target.value}px`));
    blur?.addEventListener('input', e=> setVar('blur', VARS.blur, `${e.target.value}px`));
    shadow?.addEventListener('input', e=>{
      const alpha = Math.max(0, Math.min(100, parseInt(e.target.value,10))) / 100;
      setVar('shadow', VARS.shadow, `rgba(2, 6, 23, ${alpha})`);
    });
    resetThemeBtn?.addEventListener('click', ()=>{
      localStorage.setItem(KEY_THEME, 'glass');
      applyTheme('glass');
      for(const [k, cssVar] of Object.entries(VARS)){
        document.documentElement.style.removeProperty(cssVar);
        localStorage.removeItem(KEY_PREFIX+k);
      }
    });
    resetColorsBtn?.addEventListener('click', ()=>{
      ['bg','surface','text','accent'].forEach(k=>{
        const cssVar = VARS[k];
        document.documentElement.style.removeProperty(cssVar);
        localStorage.removeItem(KEY_PREFIX+k);
      });
    });
  });
})();

// === THEME MODE (System / Light / Dark) ===
(function(){
  const KEY_MODE = 'portal_theme_mode'; // 'system' | 'default' | 'dark'
  const systemQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function applyMode(mode){
    localStorage.setItem(KEY_MODE, mode);
    if(mode === 'system'){
      const isDark = systemQuery ? systemQuery.matches : false;
      document.documentElement.dataset.mode = 'system';
      const targetTheme = isDark ? 'dark' : 'glass';
      applyTheme(targetTheme);
    }else if(mode === 'dark'){
      document.documentElement.dataset.mode = 'dark';
      applyTheme('dark');
    }else{ // 'default'
      const currentTheme = localStorage.getItem(KEY_THEME) || 'glass';
      applyTheme(currentTheme);
    }
  }

  function initMode(){
    const saved = localStorage.getItem(KEY_MODE) || 'system';
    document.querySelectorAll('input[name="theme-mode"]').forEach(el=>{
      el.checked = (el.value === saved);
      el.addEventListener('change', (e)=> applyMode(e.target.value));
    });
    applyMode(saved);
    if(systemQuery){
      systemQuery.addEventListener('change', ()=>{
        if((localStorage.getItem(KEY_MODE) || 'system') === 'system'){
          applyMode('system');
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', initMode);
})();


// === THEME MODE CONTROLLER v2 ===
(function(){
  const KEY_MODE = 'portal_theme_mode';
  const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  let bound = false;

  function systemHandler(){
    const isDark = mq && mq.matches;
    const targetTheme = isDark ? 'dark' : 'light';
    window.applyTheme?.(targetTheme);
    document.documentElement.dataset.mode = 'system';
    const r = document.querySelector('input[name="theme-mode"][value="system"]');
    if(r) r.checked = true;
  }
  function enableSystem(){
    localStorage.setItem(KEY_MODE, 'system');
    systemHandler();
    if(mq && !bound){ mq.addEventListener('change', systemHandler); bound = true; }
  }
  function disableSystem(){
    if(mq && bound){ mq.removeEventListener('change', systemHandler); bound = false; }
  }
  function setMode(mode){
    if(mode === 'system'){ enableSystem(); return; }
    if(mode === 'dark'){
      disableSystem();
      localStorage.setItem(KEY_MODE, 'dark');
      window.applyTheme?.('dark');
      document.documentElement.dataset.mode = 'dark';
      const r = document.querySelector('input[name="theme-mode"][value="dark"]');
      if(r) r.checked = true;
      return;
    }
    // default
    disableSystem();
    localStorage.setItem(KEY_MODE, 'default');
    const t = localStorage.getItem(window.__PORTAL_THEME_KEY || 'portal_theme') || 'glass';
    window.applyTheme?.(t);
    document.documentElement.dataset.mode = 'default';
    const r = document.querySelector('input[name="theme-mode"][value="default"]');
    if(r) r.checked = true;
  }

  // Delegated listener for theme-mode radios
  document.addEventListener('change', (e)=>{
    const el = e.target;
    if(el && el.name === 'theme-mode'){ setMode(el.value); }
    if(el && el.name === 'theme'){
      // Choosing a preset sets default mode
      localStorage.setItem(window.__PORTAL_THEME_KEY || 'portal_theme', el.value);
      window.applyTheme?.(el.value);
      setMode('default');
    }
  });

  // On load
  const saved = localStorage.getItem(KEY_MODE) || 'system';
  (saved==='system') ? enableSystem() : setMode(saved);

  // export
  window.__ThemeModeController = { setMode, enableSystem, disableSystem };
})();
