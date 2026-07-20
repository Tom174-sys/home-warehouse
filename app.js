// 家倉 App v4 - 多人同步版 (Firebase Realtime Database)
let items = [];
let categories = {};
let currentFilter = 'all';
let editingId = null;
let selectedCategory = 'food';
let selectedLocation = '';
let detailItemId = null;
let deferredPrompt = null;
let currentImageData = null;
let outItemId = null;
let selectedNewCatIcon = '📦';
let selectedNewCatColor = '#95a5a6';

// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyAjDrVLSXuMLLGF-Fj1_5WF4ECoeTI3VCc",
  authDomain: "shakag691827.firebaseapp.com",
  databaseURL: "https://shakag691827-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "shakag691827",
  storageBucket: "shakag691827.firebasestorage.app",
  messagingSenderId: "134411778110",
  appId: "1:134411778110:web:1ebd665ea459f114a5f96f"
};

let db = null;
let familyRef = null;
let currentFamily = null;
let currentPassword = null;
let isOnline = true;
let syncTimeout = null;

const defaultCategories = {
  food: { icon: '🍎', color: '#ff6b6b', bg: '#fff0f0', label: '食品' },
  clothes: { icon: '👕', color: '#9b59b6', bg: '#f5f0ff', label: '衣物' },
  electronics: { icon: '💻', color: '#3498db', bg: '#f0f8ff', label: '電器' },
  medicine: { icon: '💊', color: '#e74c3c', bg: '#fff0f0', label: '藥品' },
  other: { icon: '📦', color: '#95a5a6', bg: '#f5f5f5', label: '其他' }
};

const iconOptions = ['📦','🍎','👕','💻','💊','🧊','🚪','📥','🏠','🧴','🧹','🪴','🐶','🐱','🧸','📚','✏️','🎨','🎮','🎧','📱','🔌','🔋','💡','🕯️','🧯','🛠️','🔧','🔨','⛏️','🪛','🪜','🧰','🧲','🪝','🪣','🧺','🧻','🧼','🧽','🪒','🪥','🧷','🧵','🧶','🪡','🪢','🧣','🧤','🧥','🧦','👗','👘','🥻','🩱','🩲','🩳','👙','👚','👛','👜','👝','🛍️','🎒','👞','👟','🥾','🥿','👠','👡','🩰','👢','👑','👒','🎩','🎓','🧢','🪖','⛑️','📿','💄','💍','💎','🔇','🔈','🔉','🔊','📢','📣','📯','🔔','🔕','🎼','🎵','🎶','🎙️','🎚️','🎛️','🎤','📻','🎷','🪗','🎸','🎹','🎺','🎻','🪕','🥁','🪘','☎️','📞','📟','📠','🖥️','🖨️','⌨️','🖱️','🖲️','💽','💾','💿','📀','🧮','🎥','🎞️','📽️','🎬','📺','📷','📸','📹','📼','🔍','🔎','🏮','🪔','📔','📕','📖','📗','📘','📙','📓','📒','📃','📜','📄','📰','🗞️','📑','🔖','🏷️','💰','🪙','💴','💵','💶','💷','💸','💳','🧾','💹','✉️','📧','📨','📩','📤','📥','📫','📪','📬','📭','📮','🗳️','✒️','🖋️','🖊️','🖌️','🖍️','📝','💼','📁','📂','🗂️','📅','📆','🗒️','🗓️','📇','📈','📉','📊','📋','📌','📍','📎','🖇️','📏','📐','✂️','🗃️','🗄️','🗑️','🔒','🔓','🔏','🔐','🔑','🗝️','🗡️','⚔️','🔫','🏹','🛡️','🔩','⚙️','🗜️','⚖️','🦯','🔗','⛓️','⚗️','🧪','🧫','🧬','🔬','🔭','📡','💉','🩸','🩹','🩺','🌡️','🚽','🚰','🚿','🛁','🛀','🛎️','🚪','🪑','🛋️','🛏️','🛌','🖼️','🪞','🪟','🛒','🎁','🎈','🎏','🎀','🪄','🪅','🎊','🎉','🎎','🏆','🎖️','🏅','🥇','🥈','🥉','⚽','⚾','🥎','🏀','🏐','🏈','🏉','🎾','🥏','🎳','🏏','🏑','🏒','🥍','🏓','🏸','🥊','🥋','🥅','⛳','⛸️','🎣','🤿','🎽','🛹','🛼','🛷','⛷️','🏂','🪂','🏋️','🤼','🤽','🤾','🤺','🏇','🏌️','🏄','🏊','🚣','🧗','🚵','🚴'];

const colorOptions = ['#e74c3c','#e67e22','#f1c40f','#2ecc71','#1abc9c','#3498db','#9b59b6','#ff6b6b','#ff9f43','#feca57','#48dbfb','#0abde3','#10ac84','#00d2d3','#5f27cd','#341f97','#54a0ff','#2e86de','#1dd1a1','#10ac84','#ff6b81','#ff4757','#7bed9f','#70a1ff','#5352ed','#ff6348','#ff7f50','#ffa502','#747d8c','#57606f','#2f3542','#576574','#222f3e'];

// ========== 初始化 ==========
function init() {
  // 檢查是否已登入
  const savedFamily = localStorage.getItem('hw_family');
  const savedPassword = localStorage.getItem('hw_password');

  if (savedFamily && savedPassword) {
    currentFamily = savedFamily;
    currentPassword = savedPassword;
    document.getElementById('familyDisplayName').textContent = currentFamily + '的家倉';
    showMainApp();
    initFirebase();
  }

  setupInstallPrompt();
  setupOfflineDetection();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

function initFirebase() {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();

    // 使用家庭名稱+密碼的雜湊作為資料庫路徑
    const path = 'families/' + hashFamily(currentFamily, currentPassword);
    familyRef = db.ref(path);

    // 監聽資料變化（即時同步）
    familyRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.categories) categories = data.categories;
        else categories = JSON.parse(JSON.stringify(defaultCategories));
        if (data.items) items = data.items;
        else items = [];
      } else {
        // 新家庭，建立預設資料
        categories = JSON.parse(JSON.stringify(defaultCategories));
        items = getDefaultItems();
        saveToCloud();
      }

      renderCategoryTabs();
      renderCategorySelects();
      renderItems();
      updateStats();
      checkExpiringItems();
      updateSyncStatus('online');
    });

    // 監聽連線狀態
    db.ref('.info/connected').on('value', (snap) => {
      isOnline = snap.val() === true;
      updateSyncStatus(isOnline ? 'online' : 'offline');
    });

  } catch(e) {
    console.error('Firebase init error:', e);
    // 離線模式
    loadFromLocal();
    updateSyncStatus('offline');
  }
}

function hashFamily(name, password) {
  // 簡單的雜湊，實際使用時建議用更安全的方案
  let hash = 0;
  const str = name + '|' + password;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'family_' + Math.abs(hash).toString(36);
}

// ========== 登入 ==========
function doLogin() {
  const name = document.getElementById('familyName').value.trim();
  const password = document.getElementById('familyPassword').value.trim();

  if (!name || !password) {
    showLoginError('請輸入家庭名稱和密碼');
    return;
  }

  if (password.length < 4) {
    showLoginError('密碼至少需要 4 個字元');
    return;
  }

  currentFamily = name;
  currentPassword = password;

  localStorage.setItem('hw_family', currentFamily);
  localStorage.setItem('hw_password', currentPassword);

  document.getElementById('familyDisplayName').textContent = currentFamily + '的家倉';
  showMainApp();
  initFirebase();
}

function showLoginError(msg) {
  const err = document.getElementById('loginError');
  err.textContent = msg;
  err.classList.add('show');
  setTimeout(() => err.classList.remove('show'), 3000);
}

function showMainApp() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('mainApp').style.display = 'block';
}

function doLogout() {
  if (!confirm('確定要登出嗎？')) return;
  localStorage.removeItem('hw_family');
  localStorage.removeItem('hw_password');
  location.reload();
}

// ========== 資料同步 ==========
function saveToCloud() {
  if (!familyRef || !isOnline) {
    saveToLocal();
    return;
  }

  updateSyncStatus('syncing');

  familyRef.set({
    categories: categories,
    items: items,
    lastUpdate: Date.now()
  }).then(() => {
    updateSyncStatus('online');
  }).catch(() => {
    updateSyncStatus('offline');
    saveToLocal();
  });
}

function saveToLocal() {
  localStorage.setItem('hw_categories', JSON.stringify(categories));
  localStorage.setItem('hw_items', JSON.stringify(items));
}

function loadFromLocal() {
  const catSaved = localStorage.getItem('hw_categories');
  const itemSaved = localStorage.getItem('hw_items');
  if (catSaved) { try { categories = JSON.parse(catSaved); } catch(e) {} }
  if (itemSaved) { try { items = JSON.parse(itemSaved); } catch(e) {} }

  renderCategoryTabs();
  renderCategorySelects();
  renderItems();
  updateStats();
  checkExpiringItems();
}

function updateSyncStatus(status) {
  const el = document.getElementById('syncStatus');
  const settingsEl = document.getElementById('settingsSyncStatus');
  el.classList.remove('syncing', 'online', 'offline');
  el.classList.add('show');

  if (status === 'syncing') {
    el.classList.add('syncing');
    el.textContent = '🔄 同步中...';
    if (settingsEl) settingsEl.textContent = '同步中...';
  } else if (status === 'online') {
    el.classList.add('online');
    el.textContent = '✅ 已同步';
    if (settingsEl) settingsEl.textContent = '已連線';
    setTimeout(() => el.classList.remove('show'), 2000);
  } else {
    el.classList.add('offline');
    el.textContent = '⚠️ 離線';
    if (settingsEl) settingsEl.textContent = '離線模式';
  }
}

// ========== 工具函數 ==========
function getDefaultItems() {
  const today = new Date();
  const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 5);
  const nextMonth = new Date(today); nextMonth.setMonth(nextMonth.getMonth() + 1);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today); twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  return [
    { id: 1, name: '全脂牛奶', category: 'food', qty: 2, unit: '瓶', location: '冰箱', buyDate: formatDate(twoDaysAgo), expiry: formatDate(nextWeek), note: '7-11 購入', image: '', added: formatDate(twoDaysAgo) },
    { id: 2, name: '感冒藥', category: 'medicine', qty: 1, unit: '盒', location: '櫥櫃', buyDate: formatDate(yesterday), expiry: formatDate(nextMonth), note: '上次感冒剩的', image: '', added: formatDate(yesterday) },
    { id: 3, name: '無線耳機', category: 'electronics', qty: 1, unit: '個', location: '抽屜', buyDate: '', expiry: '', note: 'AirPods Pro 2', image: '', added: formatDate(today) },
    { id: 4, name: 'T恤', category: 'clothes', qty: 3, unit: '件', location: '衣櫃', buyDate: formatDate(yesterday), expiry: '', note: 'Uniqlo 白色', image: '', added: formatDate(yesterday) },
    { id: 5, name: '醬油', category: 'food', qty: 1, unit: '瓶', location: '櫥櫃', buyDate: formatDate(twoDaysAgo), expiry: formatDate(nextMonth), note: '龜甲萬', image: '', added: formatDate(twoDaysAgo) }
  ];
}

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

function getDaysUntilExpiry(expiryDate) {
  if (!expiryDate) return null;
  const exp = new Date(expiryDate);
  const today = new Date(); today.setHours(0,0,0,0);
  return Math.ceil((exp - today) / (1000*60*60*24));
}

function getDaysSinceBuy(buyDate) {
  if (!buyDate) return null;
  const buy = new Date(buyDate);
  const today = new Date(); today.setHours(0,0,0,0);
  return Math.floor((today - buy) / (1000*60*60*24));
}

function getExpiryBadge(days) {
  if (days === null) return '';
  if (days < 0) return '<span class="expiry-badge danger">已過期 ' + Math.abs(days) + ' 天</span>';
  if (days <= 3) return '<span class="expiry-badge danger">⚠️ 剩 ' + days + ' 天</span>';
  if (days <= 7) return '<span class="expiry-badge warning">剩 ' + days + ' 天</span>';
  return '<span class="expiry-badge safe">剩 ' + days + ' 天</span>';
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ========== 圖片上傳 ==========
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { alert('圖片太大，請選擇 2MB 以下的圖片'); return; }

  const reader = new FileReader();
  reader.onload = (e) => {
    currentImageData = e.target.result;
    const area = document.getElementById('imgUploadArea');
    area.classList.add('has-img');
    area.innerHTML = `<img src="${currentImageData}" alt="預覽"><button class="img-remove" onclick="event.stopPropagation();removeImage()">×</button>`;
  };
  reader.readAsDataURL(file);
}

function removeImage() {
  currentImageData = null;
  const area = document.getElementById('imgUploadArea');
  area.classList.remove('has-img');
  area.innerHTML = '<span class="img-upload-icon">📷</span><span class="img-upload-text">點擊上傳照片</span><span class="img-upload-hint">支援 JPG、PNG</span>';
  document.getElementById('imgInput').value = '';
}

// ========== 分類渲染 ==========
function renderCategoryTabs() {
  const scroll = document.getElementById('catScroll');
  let html = `<button class="cat-btn ${currentFilter === 'all' ? 'active' : ''}" data-cat="all" onclick="filterCategory('all')">全部</button>`;

  for (const [key, cfg] of Object.entries(categories)) {
    const isDefault = defaultCategories[key] !== undefined;
    const delBtn = isDefault ? '' : `<span class="cat-delete" onclick="event.stopPropagation();deleteCategory('${key}')">×</span>`;
    html += `<button class="cat-btn ${currentFilter === key ? 'active' : ''}" data-cat="${key}" onclick="filterCategory('${key}')">${cfg.icon} ${cfg.label}${delBtn}</button>`;
  }

  html += `<button class="cat-btn" style="background:rgba(255,255,255,0.15)" onclick="openCatModal()">➕ 新增</button>`;
  scroll.innerHTML = html;
}

function renderCategorySelects() {
  const group = document.getElementById('catSelectGroup');
  let html = '';
  for (const [key, cfg] of Object.entries(categories)) {
    html += `<button class="cat-select ${selectedCategory === key ? 'selected' : ''}" data-cat="${key}" onclick="setCategory('${key}')">${cfg.icon} ${cfg.label}</button>`;
  }
  html += `<button class="add-cat-btn" onclick="openCatModal()">➕ 新增分類</button>`;
  group.innerHTML = html;
}

// ========== 新增分類 ==========
function openCatModal() {
  selectedNewCatIcon = '📦';
  selectedNewCatColor = '#95a5a6';
  document.getElementById('newCatName').value = '';

  const iconPicker = document.getElementById('iconPicker');
  iconPicker.innerHTML = iconOptions.slice(0, 40).map(icon => 
    `<button class="icon-option ${icon === selectedNewCatIcon ? 'selected' : ''}" onclick="selectNewCatIcon('${icon}')">${icon}</button>`
  ).join('');

  const colorPicker = document.getElementById('colorPicker');
  colorPicker.innerHTML = colorOptions.map(color => 
    `<button class="color-option ${color === selectedNewCatColor ? 'selected' : ''}" style="background:${color}" onclick="selectNewCatColor('${color}')"></button>`
  ).join('');

  document.getElementById('catModal').classList.add('show');
}

function closeCatModal() {
  document.getElementById('catModal').classList.remove('show');
}

function selectNewCatIcon(icon) {
  selectedNewCatIcon = icon;
  document.querySelectorAll('.icon-option').forEach(btn => {
    btn.classList.toggle('selected', btn.textContent === icon);
  });
}

function selectNewCatColor(color) {
  selectedNewCatColor = color;
  document.querySelectorAll('.color-option').forEach(btn => {
    btn.classList.toggle('selected', btn.style.background === color);
  });
}

function saveNewCategory() {
  const name = document.getElementById('newCatName').value.trim();
  if (!name) { alert('請輸入分類名稱'); return; }

  const key = 'cat_' + Date.now();
  categories[key] = {
    icon: selectedNewCatIcon,
    color: selectedNewCatColor,
    bg: selectedNewCatColor + '20',
    label: name
  };

  saveToCloud();
  renderCategoryTabs();
  renderCategorySelects();
  closeCatModal();
  showToast(`分類「${name}」已建立`);
}

function deleteCategory(key) {
  const cat = categories[key];
  if (!cat) return;
  if (!confirm(`確定要刪除「${cat.label}」分類嗎？該分類下的物品將變為「其他」。`)) return;

  items.forEach(item => {
    if (item.category === key) item.category = 'other';
  });

  delete categories[key];
  saveToCloud();

  if (currentFilter === key) currentFilter = 'all';
  renderCategoryTabs();
  renderCategorySelects();
  renderItems();
  updateStats();
  showToast(`分類「${cat.label}」已刪除`);
}

// ========== 渲染列表 ==========
function renderItems(searchTerm = '') {
  const list = document.getElementById('itemsList');
  const empty = document.getElementById('emptyState');

  let filtered = items;
  if (currentFilter !== 'all') filtered = filtered.filter(i => i.category === currentFilter);
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(i => i.name.toLowerCase().includes(term) || i.location.toLowerCase().includes(term) || (i.note && i.note.toLowerCase().includes(term)));
  }

  filtered.sort((a, b) => {
    const da = getDaysUntilExpiry(a.expiry);
    const db = getDaysUntilExpiry(b.expiry);
    if (da === null && db === null) return 0;
    if (da === null) return 1;
    if (db === null) return -1;
    return da - db;
  });

  if (filtered.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    document.getElementById('itemCount').textContent = '0 件物品';
    return;
  }

  empty.style.display = 'none';
  list.innerHTML = filtered.map(item => {
    const cfg = categories[item.category] || categories.other;
    const days = getDaysUntilExpiry(item.expiry);
    const buyDays = getDaysSinceBuy(item.buyDate);
    const isExpiring = days !== null && days <= 7 && days >= 0;
    const isExpired = days !== null && days < 0;
    const isFresh = buyDays !== null && buyDays <= 3;

    let imgHtml = item.image ? `<img src="${item.image}" alt="${escapeHtml(item.name)}">` : `<span class="item-icon-fallback">${cfg.icon}</span>`;
    let freshBadge = (isFresh && (item.category === 'food' || (categories[item.category] && categories[item.category].label.includes('食')))) ? '<span class="fresh-badge">新鮮</span>' : '';

    let buyInfo = '';
    if (item.buyDate) {
      if (buyDays === 0) buyInfo = '<span class="buy-date">今天買入</span>';
      else if (buyDays === 1) buyInfo = '<span class="buy-date">昨天買入</span>';
      else buyInfo = `<span class="buy-date">${buyDays}天前買入</span>`;
    }

    return `<div class="item-card ${isExpiring ? 'expiring' : ''} ${isExpired ? 'expired' : ''} ${isFresh ? 'fresh' : ''}">
      <div class="item-img-wrap" onclick="event.stopPropagation();openDetail(${item.id})">${freshBadge}${imgHtml}</div>
      <div class="item-info" onclick="openDetail(${item.id})">
        <div class="item-name">${escapeHtml(item.name)}</div>
        <div class="item-meta">
          <span>📍 ${escapeHtml(item.location)}</span>
          <span>📦 ${item.qty}${escapeHtml(item.unit)}</span>
          ${buyInfo}
          ${getExpiryBadge(days)}
        </div>
      </div>
      <button class="out-btn" onclick="event.stopPropagation();quickOut(${item.id})">出倉</button>
    </div>`;
  }).join('');

  document.getElementById('itemCount').textContent = `${filtered.length} 件物品`;
}

function filterCategory(cat) {
  currentFilter = cat;
  renderCategoryTabs();
  renderItems(document.getElementById('searchInput').value);
}

function searchItems() {
  renderItems(document.getElementById('searchInput').value);
}

// ========== 過期提醒 ==========
function checkExpiringItems() {
  const expiring = items.filter(i => {
    const days = getDaysUntilExpiry(i.expiry);
    return days !== null && days <= 7;
  });

  const alertDiv = document.getElementById('expiryAlert');
  if (expiring.length > 0) {
    alertDiv.style.display = 'block';
    alertDiv.innerHTML = `<div class="expiry-alert-inner">
      <span style="font-size:24px">⚠️</span>
      <div>
        <div class="expiry-alert-text">有 ${expiring.length} 件物品即將過期</div>
        <div class="expiry-alert-sub">請盡快使用或檢查</div>
      </div>
    </div>`;
  } else {
    alertDiv.style.display = 'none';
  }
}

function updateStats() {
  document.getElementById('statTotal').textContent = items.length;
  const expiring = items.filter(i => {
    const days = getDaysUntilExpiry(i.expiry);
    return days !== null && days <= 7 && days >= 0;
  }).length;
  document.getElementById('statExpiring').textContent = expiring;
  document.getElementById('statLocations').textContent = new Set(items.map(i => i.location)).size;
}

// ========== 新增/編輯 ==========
function openAddModal() {
  editingId = null;
  currentImageData = null;
  document.getElementById('modalTitle').textContent = '📦 新增物品';
  document.getElementById('itemName').value = '';
  document.getElementById('itemQty').value = '1';
  document.getElementById('itemUnit').value = '';
  document.getElementById('itemLocation').value = '';
  document.getElementById('itemBuyDate').value = formatDate(new Date());
  document.getElementById('itemExpiry').value = '';
  document.getElementById('itemNote').value = '';
  removeImage();
  selectedCategory = Object.keys(categories)[0] || 'other';
  selectedLocation = '';
  updateCategorySelection();
  document.querySelectorAll('.loc-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('addModal').classList.add('show');
}

function closeModal() {
  document.getElementById('addModal').classList.remove('show');
  editingId = null;
  currentImageData = null;
}

function setCategory(cat) {
  selectedCategory = cat;
  updateCategorySelection();
}

function updateCategorySelection() {
  document.querySelectorAll('.cat-select').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.cat === selectedCategory);
  });
}

function setLocation(loc) {
  selectedLocation = loc;
  document.getElementById('itemLocation').value = loc;
  document.querySelectorAll('.loc-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.textContent.includes(loc));
  });
}

function saveItem() {
  const name = document.getElementById('itemName').value.trim();
  if (!name) { alert('請輸入物品名稱'); return; }

  const item = {
    id: editingId || Date.now(),
    name: name,
    category: selectedCategory,
    qty: parseInt(document.getElementById('itemQty').value) || 1,
    unit: document.getElementById('itemUnit').value.trim() || '個',
    location: document.getElementById('itemLocation').value.trim() || '未指定',
    buyDate: document.getElementById('itemBuyDate').value,
    expiry: document.getElementById('itemExpiry').value,
    note: document.getElementById('itemNote').value.trim(),
    image: currentImageData || (editingId ? items.find(i => i.id === editingId)?.image || '' : ''),
    added: editingId ? (items.find(i => i.id === editingId)?.added || formatDate(new Date())) : formatDate(new Date())
  };

  if (editingId) {
    const idx = items.findIndex(i => i.id === editingId);
    if (idx >= 0) items[idx] = item;
  } else {
    items.push(item);
  }

  saveToCloud();
  closeModal();
  renderItems();
  updateStats();
  checkExpiringItems();
  showToast(editingId ? '物品已更新' : '物品已入倉');
}

// ========== 詳情 ==========
function openDetail(id) {
  detailItemId = id;
  const item = items.find(i => i.id === id);
  if (!item) return;

  const cfg = categories[item.category] || categories.other;
  const days = getDaysUntilExpiry(item.expiry);
  const buyDays = getDaysSinceBuy(item.buyDate);

  const imgDiv = document.getElementById('detailImg');
  if (item.image) {
    imgDiv.innerHTML = `<img src="${item.image}" alt="${escapeHtml(item.name)}">`;
  } else {
    imgDiv.innerHTML = `<span class="detail-icon-fallback">${cfg.icon}</span>`;
    imgDiv.style.background = `linear-gradient(135deg, #2c3e50 0%, #4a6741 100%)`;
  }

  const catEl = document.getElementById('detailCategory');
  catEl.textContent = `${cfg.icon} ${cfg.label}`;
  catEl.style.background = cfg.bg || cfg.color + '20';
  catEl.style.color = cfg.color;

  document.getElementById('detailName').textContent = item.name;
  document.getElementById('detailQty').textContent = `數量：${item.qty} ${item.unit}`;
  document.getElementById('detailLocation').textContent = item.location;

  const buyRow = document.getElementById('detailBuyDateRow');
  if (item.buyDate) {
    buyRow.style.display = 'flex';
    let text = item.buyDate;
    if (buyDays !== null) {
      if (buyDays === 0) text += '（今天）';
      else if (buyDays === 1) text += '（昨天）';
      else text += `（${buyDays} 天前）`;
    }
    document.getElementById('detailBuyDate').textContent = text;
  } else {
    buyRow.style.display = 'none';
  }

  if (item.expiry) {
    document.getElementById('detailExpiryRow').style.display = 'flex';
    let text = item.expiry;
    if (days !== null) {
      if (days < 0) text += ` ⚠️ 已過期 ${Math.abs(days)} 天`;
      else if (days === 0) text += ' ⚠️ 今天到期';
      else if (days <= 3) text += ` ⚠️ 還剩 ${days} 天`;
      else text += `（還剩 ${days} 天）`;
    }
    const expEl = document.getElementById('detailExpiry');
    expEl.textContent = text;
    expEl.style.color = days !== null && days <= 3 ? '#e74c3c' : '#1c1c1e';
  } else {
    document.getElementById('detailExpiryRow').style.display = 'none';
  }

  document.getElementById('detailNote').textContent = item.note || '暫無備註';
  document.getElementById('detailModal').classList.add('show');
}

function closeDetailModal() {
  document.getElementById('detailModal').classList.remove('show');
  detailItemId = null;
}

function editItem() {
  if (!detailItemId) return;
  const item = items.find(i => i.id === detailItemId);
  if (!item) return;

  closeDetailModal();
  editingId = detailItemId;
  currentImageData = item.image || null;

  document.getElementById('modalTitle').textContent = '✏️ 編輯物品';
  document.getElementById('itemName').value = item.name;
  document.getElementById('itemQty').value = item.qty;
  document.getElementById('itemUnit').value = item.unit;
  document.getElementById('itemLocation').value = item.location;
  document.getElementById('itemBuyDate').value = item.buyDate;
  document.getElementById('itemExpiry').value = item.expiry;
  document.getElementById('itemNote').value = item.note;

  if (item.image) {
    const area = document.getElementById('imgUploadArea');
    area.classList.add('has-img');
    area.innerHTML = `<img src="${item.image}" alt="預覽"><button class="img-remove" onclick="event.stopPropagation();removeImage()">×</button>`;
  } else {
    removeImage();
  }

  selectedCategory = item.category;
  updateCategorySelection();

  document.querySelectorAll('.loc-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.textContent.includes(item.location));
  });

  document.getElementById('addModal').classList.add('show');
}

function deleteItem() {
  if (!detailItemId) return;
  if (!confirm('確定要刪除這件物品嗎？')) return;
  items = items.filter(i => i.id !== detailItemId);
  saveToCloud();
  closeDetailModal();
  renderItems();
  updateStats();
  checkExpiringItems();
  showToast('物品已刪除');
}

// ========== 出倉 ==========
function quickOut(id) {
  outItemId = id;
  const item = items.find(i => i.id === id);
  if (!item) return;
  document.getElementById('confirmOutText').textContent = `「${item.name}」將從倉庫中移除`;
  document.getElementById('confirmOutModal').classList.add('show');
}

function confirmOut() {
  if (!detailItemId) return;
  outItemId = detailItemId;
  const item = items.find(i => i.id === detailItemId);
  if (!item) return;
  document.getElementById('confirmOutText').textContent = `「${item.name}」將從倉庫中移除`;
  document.getElementById('confirmOutModal').classList.add('show');
}

function closeConfirmOut() {
  document.getElementById('confirmOutModal').classList.remove('show');
  outItemId = null;
}

function doOut() {
  if (!outItemId) return;
  const item = items.find(i => i.id === outItemId);
  items = items.filter(i => i.id !== outItemId);
  saveToCloud();
  closeConfirmOut();
  closeDetailModal();
  renderItems();
  updateStats();
  checkExpiringItems();
  showToast(item ? `「${item.name}」已出倉` : '已出倉');
}

// ========== 設定 ==========
function openSettings() {
  document.getElementById('settingsFamilyName').textContent = currentFamily;
  document.getElementById('settingsModal').classList.add('show');
}

function closeSettings() {
  document.getElementById('settingsModal').classList.remove('show');
}

// ========== PWA ==========
function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    setTimeout(() => {
      if (!localStorage.getItem('installDismissed_v4')) {
        document.getElementById('installBanner').classList.add('show');
      }
    }, 3000);
  });
  window.addEventListener('appinstalled', () => {
    document.getElementById('installBanner').classList.remove('show');
    deferredPrompt = null;
  });
}

function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choice) => {
      if (choice.outcome === 'accepted') deferredPrompt = null;
      document.getElementById('installBanner').classList.remove('show');
    });
  } else {
    alert('請使用瀏覽器的「加入主畫面」功能來安裝 App');
  }
}

function dismissInstall() {
  document.getElementById('installBanner').classList.remove('show');
  localStorage.setItem('installDismissed_v4', 'true');
}

function setupOfflineDetection() {
  function updateOnlineStatus() {
    const bar = document.getElementById('offlineBar');
    if (navigator.onLine) {
      bar.classList.remove('show');
      if (!isOnline && db) {
        isOnline = true;
        // 重新連線時嘗試同步
        saveToCloud();
      }
    } else {
      bar.classList.add('show');
      isOnline = false;
      updateSyncStatus('offline');
    }
  }
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
}

init();
