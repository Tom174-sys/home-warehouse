// 家倉 App v5 - 方案1 完整版 (Firebase Realtime Database)
// 修復：出倉邏輯、新增：出倉歷史、批量操作、數量調整、數據導出導入

let items = [];
let outHistory = [];
let actionHistory = [];  // 操作歷史：入倉、出倉、編輯、刪除、數量變更
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

// 批量操作相關
let batchMode = false;
let selectedItems = new Set();

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
  const savedFamily = localStorage.getItem('hw_family');
  const savedPassword = localStorage.getItem('hw_password');

  if (savedFamily && savedPassword) {
    currentFamily = savedFamily;
    currentPassword = savedPassword;
    document.getElementById('familyDisplayName').textContent = currentFamily + '的家倉';
    showMainApp();
    // 先載入本地資料，確保介面可立即使用
    loadFromLocal();
    // 在背景嘗試連接 Firebase，失敗也不影響使用
    setTimeout(() => {
      try {
        if (typeof firebase !== 'undefined' && firebase.initializeApp) {
          initFirebase();
        } else {
          console.warn('Firebase SDK 未載入，使用離線模式');
          updateSyncStatus('offline');
        }
      } catch(e) {
        console.warn('Firebase 未連接，使用離線模式:', e.message);
        updateSyncStatus('offline');
      }
    }, 500);
  }

  setupInstallPrompt();
  setupOfflineDetection();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

function initFirebase() {
  // 檢查 Firebase SDK 是否已載入
  if (typeof firebase === 'undefined') {
    console.warn('Firebase SDK 未載入，使用離線模式');
    updateSyncStatus('offline');
    return;
  }

  try {
    // 初始化 Firebase（如果尚未初始化）
    if (!firebase.apps || !firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.database();

    const path = 'families/' + hashFamily(currentFamily, currentPassword);
    familyRef = db.ref(path);

    // 先載入本地資料，確保介面立即顯示
    loadFromLocal();

    // 嘗試連線 Firebase
    familyRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const remoteTime = data.lastUpdate || 0;
        const localTime = parseInt(localStorage.getItem('hw_lastUpdate') || '0');

        if (remoteTime >= localTime) {
          if (data.categories) categories = data.categories;
          else categories = JSON.parse(JSON.stringify(defaultCategories));
          if (data.items) items = data.items;
          else items = [];
          if (data.outHistory) outHistory = data.outHistory;
          else outHistory = [];
          if (data.actionHistory) actionHistory = data.actionHistory;
          else actionHistory = [];

          saveToLocal();
        }
      } else {
        // 雲端沒有資料，檢查本地
        const localItems = localStorage.getItem('hw_items_v3');
        if (!localItems || JSON.parse(localItems).length === 0) {
          categories = JSON.parse(JSON.stringify(defaultCategories));
          items = getDefaultItems();
          outHistory = [];
          actionHistory = [];
          saveToCloud();
        }
      }

      renderCategoryTabs();
      renderCategorySelects();
      renderItems();
      updateStats();
      checkExpiringItems();
      updateSyncStatus('online');
    }, (error) => {
      // Firebase 讀取失敗（權限問題等），使用本地模式
      console.warn('Firebase 讀取失敗，使用離線模式:', error.message);
      loadFromLocal();
      renderCategoryTabs();
      renderCategorySelects();
      renderItems();
      updateStats();
      checkExpiringItems();
      updateSyncStatus('offline');
    });

    db.ref('.info/connected').on('value', (snap) => {
      isOnline = snap.val() === true;
      updateSyncStatus(isOnline ? 'online' : 'offline');
    });

  } catch(e) {
    console.error('Firebase init error:', e);
    loadFromLocal();
    renderCategoryTabs();
    renderCategorySelects();
    renderItems();
    updateStats();
    checkExpiringItems();
    updateSyncStatus('offline');
  }
}

function hashFamily(name, password) {
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
  console.log('doLogin called');
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
  console.log('Login successful, mainApp shown');

  // 先載入本地資料（如果有）
  loadFromLocal();

  // 嘗試初始化 Firebase（背景執行，不阻塞）
  setTimeout(() => {
    try { initFirebase(); } catch(e) { console.warn('Firebase 未連接，使用離線模式'); }
  }, 100);
}

function showLoginError(msg) {
  const err = document.getElementById('loginError');
  err.textContent = msg;
  err.classList.add('show');
  setTimeout(() => err.classList.remove('show'), 3000);
}

function showMainApp() {
  console.log('showMainApp called');
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('mainApp').style.display = 'block';
  console.log('mainApp display set to block');
}

function doLogout() {
  if (!confirm('確定要登出嗎？')) return;
  localStorage.removeItem('hw_family');
  localStorage.removeItem('hw_password');
  location.reload();
}

// ========== 資料同步 ==========
function saveToCloud() {
  const now = Date.now();
  localStorage.setItem('hw_lastUpdate', now.toString());
  saveToLocal();

  // 檢查 Firebase 是否可用
  if (typeof firebase === 'undefined' || !familyRef || !isOnline) {
    updateSyncStatus('offline');
    return;
  }

  updateSyncStatus('syncing');

  familyRef.set({
    categories: categories,
    items: items,
    outHistory: outHistory,
    actionHistory: actionHistory,
    lastUpdate: now
  }).then(() => {
    updateSyncStatus('online');
  }).catch((err) => {
    console.warn('同步失敗，已保存到本地:', err.message);
    updateSyncStatus('offline');
    saveToLocal();
  });
}

function saveToLocal() {
  localStorage.setItem('hw_categories_v3', JSON.stringify(categories));
  localStorage.setItem('hw_items_v3', JSON.stringify(items));
  localStorage.setItem('hw_outHistory_v3', JSON.stringify(outHistory));
  localStorage.setItem('hw_actionHistory_v3', JSON.stringify(actionHistory));
}

function loadFromLocal() {
  const catSaved = localStorage.getItem('hw_categories_v3');
  const itemSaved = localStorage.getItem('hw_items_v3');
  const histSaved = localStorage.getItem('hw_outHistory_v3');
  const actionSaved = localStorage.getItem('hw_actionHistory_v3');
  if (catSaved) { try { categories = JSON.parse(catSaved); } catch(e) {} }
  if (itemSaved) { try { items = JSON.parse(itemSaved); } catch(e) {} }
  if (histSaved) { try { outHistory = JSON.parse(histSaved); } catch(e) {} }
  if (actionSaved) { try { actionHistory = JSON.parse(actionSaved); } catch(e) {} }

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
    { id: 1, name: '全脂牛奶', category: 'food', qty: 2, unit: '瓶', price: 24.5, location: '冰箱', buyDate: formatDate(twoDaysAgo), expiry: formatDate(nextWeek), note: '7-11 購入', image: '', added: formatDate(twoDaysAgo) },
    { id: 2, name: '感冒藥', category: 'medicine', qty: 1, unit: '盒', price: 68.0, location: '櫥櫃', buyDate: formatDate(yesterday), expiry: formatDate(nextMonth), note: '上次感冒剩的', image: '', added: formatDate(yesterday) },
    { id: 3, name: '無線耳機', category: 'electronics', qty: 1, unit: '個', price: 1899.0, location: '抽屜', buyDate: '', expiry: '', note: 'AirPods Pro 2', image: '', added: formatDate(today) },
    { id: 4, name: 'T恤', category: 'clothes', qty: 3, unit: '件', price: 99.0, location: '衣櫃', buyDate: formatDate(yesterday), expiry: '', note: 'Uniqlo 白色', image: '', added: formatDate(yesterday) },
    { id: 5, name: '醬油', category: 'food', qty: 1, unit: '瓶', price: 32.0, location: '櫥櫃', buyDate: formatDate(twoDaysAgo), expiry: formatDate(nextMonth), note: '龜甲萬', image: '', added: formatDate(twoDaysAgo) }
  ];
}

function formatDate(date) {
  const options = { timeZone: 'Asia/Hong_Kong', year: 'numeric', month: '2-digit', day: '2-digit' };
  const parts = new Intl.DateTimeFormat('zh-HK', options).formatToParts(date);
  const year = parts.find(p => p.type === 'year').value;
  const month = parts.find(p => p.type === 'month').value;
  const day = parts.find(p => p.type === 'day').value;
  return `${year}-${month}-${day}`;
}

// Parse a YYYY-MM-DD string as Hong Kong timezone midnight
// This ensures consistent date calculations regardless of browser timezone
function parseHKDate(dateString) {
  if (!dateString) return null;
  // Extract year, month, day from the string
  const [year, month, day] = dateString.split('-').map(Number);
  // Create date using HK timezone explicitly via Intl
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Hong_Kong',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  });
  // Use the date parts to construct a timestamp that represents HK midnight
  // We construct an ISO string with the correct date and treat it as HK time
  const hkDate = new Date(`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}T00:00:00+08:00`);
  return hkDate;
}

// Get today's date as HK timezone midnight
function getTodayHKDate() {
  const now = new Date();
  const hkFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Hong_Kong',
    year: 'numeric', month: '2-digit', day: '2-digit'
  });
  const parts = hkFormatter.formatToParts(now);
  const year = parts.find(p => p.type === 'year').value;
  const month = parts.find(p => p.type === 'month').value;
  const day = parts.find(p => p.type === 'day').value;
  return new Date(`${year}-${month}-${day}T00:00:00+08:00`);
}

function getTodayHK() {
  return formatDate(new Date());
}

function getDaysUntilExpiry(expiryDate) {
  if (!expiryDate) return null;
  // Parse expiryDate as HK timezone midnight for consistent calculation
  const exp = parseHKDate(expiryDate);
  const today = getTodayHKDate();
  return Math.ceil((exp - today) / (1000*60*60*24));
}

function getDaysSinceBuy(buyDate) {
  if (!buyDate) return null;
  // Parse buyDate as HK timezone midnight to avoid UTC offset issues
  const buy = parseHKDate(buyDate);
  const today = getTodayHKDate();
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

  const area = document.getElementById('imgUploadArea');
  area.innerHTML = '<span class="img-upload-icon">🔄</span><span class="img-upload-text">正在壓縮圖片...</span>';

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const maxWidth = 800;
      const maxHeight = 800;
      const quality = 0.7;

      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f0f0f5';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const compressedData = canvas.toDataURL('image/jpeg', quality);
      const originalSize = Math.round(e.target.result.length / 1024);
      const compressedSize = Math.round(compressedData.length / 1024);

      currentImageData = compressedData;
      area.classList.add('has-img');
      area.innerHTML = '<img src="' + currentImageData + '" alt="預覽"><button class="img-remove" onclick="event.stopPropagation();removeImage()">×</button>';

      showToast('圖片已壓縮 ' + originalSize + 'KB → ' + compressedSize + 'KB');
    };
    img.src = e.target.result;
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
  let html = '<button class="cat-btn ' + (currentFilter === 'all' ? 'active' : '') + '" data-cat="all" onclick="filterCategory(\'all\')">全部</button>';

  for (const [key, cfg] of Object.entries(categories)) {
    const isDefault = defaultCategories[key] !== undefined;
    const delBtn = isDefault ? '' : '<span class="cat-delete" onclick="event.stopPropagation();deleteCategory(\'' + key + '\')">×</span>';
    html += '<button class="cat-btn ' + (currentFilter === key ? 'active' : '') + '" data-cat="' + key + '" onclick="filterCategory(\'' + key + '\')">' + cfg.icon + ' ' + cfg.label + delBtn + '</button>';
  }

  html += '<button class="cat-btn" style="background:rgba(255,255,255,0.15)" onclick="openCatModal()">➕ 新增</button>';
  scroll.innerHTML = html;
}

function renderCategorySelects() {
  const group = document.getElementById('catSelectGroup');
  let html = '';
  for (const [key, cfg] of Object.entries(categories)) {
    html += '<button class="cat-select ' + (selectedCategory === key ? 'selected' : '') + '" data-cat="' + key + '" onclick="setCategory(\'' + key + '\')">' + cfg.icon + ' ' + cfg.label + '</button>';
  }
  html += '<button class="add-cat-btn" onclick="openCatModal()">➕ 新增分類</button>';
  group.innerHTML = html;
}

// ========== 新增分類 ==========
function openCatModal() {
  selectedNewCatIcon = '📦';
  selectedNewCatColor = '#95a5a6';
  document.getElementById('newCatName').value = '';

  const iconPicker = document.getElementById('iconPicker');
  iconPicker.innerHTML = iconOptions.slice(0, 40).map(icon => 
    '<button class="icon-option ' + (icon === selectedNewCatIcon ? 'selected' : '') + '" onclick="selectNewCatIcon(\'' + icon + '\')">' + icon + '</button>'
  ).join('');

  const colorPicker = document.getElementById('colorPicker');
  colorPicker.innerHTML = colorOptions.map(color => 
    '<button class="color-option ' + (color === selectedNewCatColor ? 'selected' : '') + '" style="background:' + color + '" onclick="selectNewCatColor(\'' + color + '\')"></button>'
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
  showToast('分類「' + name + '」已建立');
}

function deleteCategory(key) {
  const cat = categories[key];
  if (!cat) return;
  if (!confirm('確定要刪除「' + cat.label + '」分類嗎？該分類下的物品將變為「其他」。')) return;

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
  showToast('分類「' + cat.label + '」已刪除');
}

// ========== 批量操作 ==========
function toggleBatchMode() {
  batchMode = !batchMode;
  selectedItems.clear();
  const btn = document.getElementById('batchModeBtn');
  const bar = document.getElementById('batchBar');

  if (batchMode) {
    btn.textContent = '❌';
    btn.style.background = '#D4574A';
    btn.style.color = 'white';
    btn.style.borderColor = 'transparent';
    bar.style.display = 'flex';
  } else {
    btn.textContent = '☑️';
    btn.style.background = '';
    btn.style.color = '';
    btn.style.borderColor = '';
    bar.style.display = 'none';
  }

  renderItems(document.getElementById('searchInput').value);
}

function toggleSelectItem(id, event) {
  if (event) event.stopPropagation();
  if (selectedItems.has(id)) {
    selectedItems.delete(id);
  } else {
    selectedItems.add(id);
  }
  updateBatchBar();
  renderItems(document.getElementById('searchInput').value);
}

function updateBatchBar() {
  const count = selectedItems.size;
  document.getElementById('batchCount').textContent = '已選 ' + count + ' 件';
  document.getElementById('batchOutBtn').disabled = count === 0;
}

function batchOut() {
  if (selectedItems.size === 0) return;
  if (!confirm('確定要將選中的 ' + selectedItems.size + ' 件物品出倉嗎？')) return;

  const now = getTodayHK();
  const count = selectedItems.size;
  selectedItems.forEach(id => {
    const item = items.find(i => i.id === id);
    if (item) {
      outHistory.unshift({
        ...item,
        outDate: now,
        outId: Date.now() + Math.random()
      });
    }
  });

  if (outHistory.length > 200) outHistory = outHistory.slice(0, 200);

  const batchItems = items.filter(i => selectedItems.has(i.id));
  items = items.filter(i => !selectedItems.has(i.id));
  batchItems.forEach(item => {
    addActionHistory('out', item, '批量出倉（共 ' + count + ' 件）');
  });
  selectedItems.clear();
  saveToCloud();
  renderItems();
  updateStats();
  checkExpiringItems();
  showToast('已將 ' + count + ' 件物品出倉');
  toggleBatchMode();
}

// ========== 渲染列表 ==========
function renderItems(searchTerm) {
  searchTerm = searchTerm || '';
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
    const isSelected = selectedItems.has(item.id);

    let imgHtml = item.image ? '<img src="' + item.image + '" alt="' + escapeHtml(item.name) + '">' : '<span class="item-icon-fallback">' + cfg.icon + '</span>';
    let freshBadge = (isFresh && (item.category === 'food' || (categories[item.category] && categories[item.category].label.includes('食')))) ? '<span class="fresh-badge">新鮮</span>' : '';

    let buyInfo = '';
    if (item.buyDate) {
      if (buyDays === 0) buyInfo = '<span class="buy-date">今天買入</span>';
      else if (buyDays === 1) buyInfo = '<span class="buy-date">昨天買入</span>';
      else buyInfo = '<span class="buy-date">' + buyDays + '天前買入</span>';
    }

    const batchCheckbox = batchMode ? '<div class="batch-check ' + (isSelected ? 'checked' : '') + '">' + (isSelected ? '✓' : '') + '</div>' : '';
    const outBtn = batchMode ? '' : '<button class="out-btn" onclick="event.stopPropagation();quickOut(' + item.id + ')">出倉</button>';
    const qtyControls = !batchMode ? '<div class="qty-controls"><button class="qty-btn" onclick="event.stopPropagation();adjustQty(' + item.id + ', -1)">−</button><span class="qty-display">' + item.qty + '</span><button class="qty-btn" onclick="event.stopPropagation();adjustQty(' + item.id + ', 1)">+</button></div>' : '';

    const clickAction = batchMode ? 'toggleSelectItem(' + item.id + ', event)' : 'openDetail(' + item.id + ')';

    return '<div class="item-card ' + (isExpiring ? 'expiring ' : '') + (isExpired ? 'expired ' : '') + (isFresh ? 'fresh ' : '') + (isSelected ? 'selected-batch ' : '') + (batchMode ? 'batch-mode' : '') + '">' +
      batchCheckbox +
      '<div class="item-img-wrap" onclick="' + clickAction + '">' + freshBadge + imgHtml + '</div>' +
      '<div class="item-info" onclick="' + clickAction + '">' +
        '<div class="item-name">' + escapeHtml(item.name) + '</div>' +
        '<div class="item-meta">' +
          '<span>📍 ' + escapeHtml(item.location) + '</span>' +
          '<span>📦 ' + item.qty + escapeHtml(item.unit) + '</span>' +
          (item.price && item.price > 0 ? '<span>💰 $' + item.price.toFixed(2) + '</span>' : '') +
          buyInfo +
          getExpiryBadge(days) +
        '</div>' +
        qtyControls +
      '</div>' +
      outBtn +
    '</div>';
  }).join('');

  document.getElementById('itemCount').textContent = filtered.length + ' 件物品';
}

function filterCategory(cat) {
  currentFilter = cat;
  renderCategoryTabs();
  renderItems(document.getElementById('searchInput').value);
}

function searchItems() {
  renderItems(document.getElementById('searchInput').value);
}

// ========== 數量調整 ==========
function adjustQty(id, delta) {
  const item = items.find(i => i.id === id);
  if (!item) return;

  const newQty = item.qty + delta;
  if (newQty <= 0) {
    quickOut(id);
    return;
  }

  const oldQty = item.qty;
  item.qty = newQty;
  addActionHistory('qty_change', item, '數量從 ' + oldQty + ' 變更為 ' + newQty);
  saveToCloud();
  renderItems(document.getElementById('searchInput').value);
  updateStats();
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
    alertDiv.innerHTML = '<div class="expiry-alert-inner"><span style="font-size:24px">⚠️</span><div><div class="expiry-alert-text">有 ' + expiring.length + ' 件物品即將過期</div><div class="expiry-alert-sub">請盡快使用或檢查</div></div></div>';
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
  document.getElementById('itemPrice').value = '';
  document.getElementById('itemLocation').value = '';
  document.getElementById('itemBuyDate').value = getTodayHK();
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

  const isEditing = !!editingId;
  const existingItem = isEditing ? items.find(i => i.id === editingId) : null;

  const priceVal = document.getElementById('itemPrice').value.trim();
  const item = {
    id: editingId || Date.now(),
    name: name,
    category: selectedCategory,
    qty: parseInt(document.getElementById('itemQty').value) || 1,
    unit: document.getElementById('itemUnit').value.trim() || '個',
    price: priceVal ? parseFloat(priceVal) : null,
    location: document.getElementById('itemLocation').value.trim() || '未指定',
    buyDate: document.getElementById('itemBuyDate').value,
    expiry: document.getElementById('itemExpiry').value,
    note: document.getElementById('itemNote').value.trim(),
    image: currentImageData || (existingItem ? existingItem.image || '' : ''),
    added: existingItem ? existingItem.added || getTodayHK() : getTodayHK()
  };

  if (isEditing) {
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

  if (isEditing) {
    addActionHistory('edit', item, '編輯物品資訊');
    showToast('物品已更新');
  } else {
    addActionHistory('in', item, '新增物品入倉');
    showToast('物品已入倉');
  }
}

// ========== 詳情 ==========
function openDetail(id) {
  if (batchMode) return;
  detailItemId = id;
  const item = items.find(i => i.id === id);
  if (!item) return;

  const cfg = categories[item.category] || categories.other;
  const days = getDaysUntilExpiry(item.expiry);
  const buyDays = getDaysSinceBuy(item.buyDate);

  const imgDiv = document.getElementById('detailImg');
  if (item.image) {
    imgDiv.innerHTML = '<img src="' + item.image + '" alt="' + escapeHtml(item.name) + '">';
    imgDiv.style.background = '';
  } else {
    imgDiv.innerHTML = '<span class="detail-icon-fallback">' + cfg.icon + '</span>';
    imgDiv.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
  }

  const catEl = document.getElementById('detailCategory');
  catEl.textContent = cfg.icon + ' ' + cfg.label;
  catEl.style.background = cfg.bg || cfg.color + '20';
  catEl.style.color = cfg.color;
  catEl.style.border = '1px solid ' + (cfg.color || '#c9a96e') + '40';

  document.getElementById('detailName').textContent = item.name;
  document.getElementById('detailQty').textContent = '數量：' + item.qty + ' ' + item.unit;

  const priceEl = document.getElementById('detailPrice');
  const priceRow = document.getElementById('detailPriceRow');
  const priceValue = document.getElementById('detailPriceValue');
  if (item.price && item.price > 0) {
    priceEl.textContent = '💰 HK$ ' + item.price.toFixed(2);
    priceEl.style.display = 'block';
    priceRow.style.display = 'flex';
    priceValue.textContent = 'HK$ ' + item.price.toFixed(2);
  } else {
    priceEl.style.display = 'none';
    priceRow.style.display = 'none';
  }

  document.getElementById('detailLocation').textContent = item.location;

  const buyRow = document.getElementById('detailBuyDateRow');
  if (item.buyDate) {
    buyRow.style.display = 'flex';
    let text = item.buyDate;
    if (buyDays !== null) {
      if (buyDays === 0) text += '（今天）';
      else if (buyDays === 1) text += '（昨天）';
      else text += '（' + buyDays + ' 天前）';
    }
    document.getElementById('detailBuyDate').textContent = text;
  } else {
    buyRow.style.display = 'none';
  }

  if (item.expiry) {
    document.getElementById('detailExpiryRow').style.display = 'flex';
    let text = item.expiry;
    if (days !== null) {
      if (days < 0) text += ' ⚠️ 已過期 ' + Math.abs(days) + ' 天';
      else if (days === 0) text += ' ⚠️ 今天到期';
      else if (days <= 3) text += ' ⚠️ 還剩 ' + days + ' 天';
      else text += '（還剩 ' + days + ' 天）';
    }
    const expEl = document.getElementById('detailExpiry');
    expEl.textContent = text;
    expEl.style.color = days !== null && days <= 3 ? '#e57373' : '#e8e4dc';
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
  document.getElementById('itemPrice').value = item.price || '';
  document.getElementById('itemLocation').value = item.location;
  document.getElementById('itemBuyDate').value = item.buyDate;
  document.getElementById('itemExpiry').value = item.expiry;
  document.getElementById('itemNote').value = item.note;

  if (item.image) {
    currentImageData = item.image;
    const area = document.getElementById('imgUploadArea');
    area.classList.add('has-img');
    area.innerHTML = '<img src="' + item.image + '" alt="預覽"><button class="img-remove" onclick="event.stopPropagation();removeImage()">×</button>';
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
  const item = items.find(i => i.id === detailItemId);
  if (!confirm('確定要刪除這件物品嗎？')) return;
  items = items.filter(i => i.id !== detailItemId);
  if (item) {
    addActionHistory('delete', item, '直接刪除物品（非出倉）');
  }
  saveToCloud();
  closeDetailModal();
  renderItems();
  updateStats();
  checkExpiringItems();
  showToast('物品已刪除');
}

// ========== 出倉（修復版）==========
function quickOut(id) {
  outItemId = id;
  const item = items.find(i => i.id === id);
  if (!item) return;
  document.getElementById('confirmOutText').textContent = '「' + item.name + '」將從倉庫中移除';
  document.getElementById('confirmOutModal').classList.add('show');
}

function confirmOut() {
  if (!detailItemId) return;
  outItemId = detailItemId;
  const item = items.find(i => i.id === detailItemId);
  if (!item) return;
  document.getElementById('confirmOutText').textContent = '「' + item.name + '」將從倉庫中移除';
  document.getElementById('confirmOutModal').classList.add('show');
}

function closeConfirmOut() {
  document.getElementById('confirmOutModal').classList.remove('show');
  outItemId = null;
}

function doOut() {
  if (!outItemId) return;
  const item = items.find(i => i.id === outItemId);

  if (item) {
    outHistory.unshift({
      ...item,
      outDate: getTodayHK(),
      outId: Date.now()
    });
    if (outHistory.length > 200) outHistory = outHistory.slice(0, 200);
  }

  items = items.filter(i => i.id !== outItemId);
  saveToCloud();
  closeConfirmOut();
  closeDetailModal();
  renderItems();
  updateStats();
  checkExpiringItems();
  if (item) {
    addActionHistory('out', item, '物品出倉');
    showToast('「' + item.name + '」已出倉');
  } else {
    showToast('已出倉');
  }
}

// ========== 出倉歷史 ==========
function openHistoryModal() {
  renderOutHistory();
  document.getElementById('historyModal').classList.add('show');
}

function closeHistoryModal() {
  document.getElementById('historyModal').classList.remove('show');
}

function renderOutHistory() {
  const list = document.getElementById('historyList');
  const empty = document.getElementById('historyEmpty');
  const searchTerm = document.getElementById('outHistorySearch') ? document.getElementById('outHistorySearch').value.trim().toLowerCase() : '';

  let filtered = outHistory;
  if (searchTerm) {
    filtered = outHistory.filter(h => h.name.toLowerCase().includes(searchTerm));
  }

  if (filtered.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  list.innerHTML = filtered.map(h => {
    const cfg = categories[h.category] || categories.other;
    return '<div class="history-item"><div class="history-icon">' + cfg.icon + '</div><div class="history-info"><div class="history-name">' + escapeHtml(h.name) + '</div><div class="history-meta">📦 ' + h.qty + escapeHtml(h.unit) + ' · 📍 ' + escapeHtml(h.location) + ' · 🗓️ 出倉於 ' + h.outDate + '</div></div><button class="history-restore" onclick="restoreItem(\'' + h.outId + '\')">↩️</button></div>';
  }).join('');
}

function restoreItem(outId) {
  const histItem = outHistory.find(h => h.outId == outId);
  if (!histItem) return;

  const restored = { ...histItem };
  delete restored.outDate;
  delete restored.outId;
  restored.id = Date.now();

  items.push(restored);
  outHistory = outHistory.filter(h => h.outId != outId);

  addActionHistory('restore', restored, '從出倉歷史恢復入倉');
  saveToCloud();
  renderOutHistory();
  renderItems();
  updateStats();
  showToast('「' + restored.name + '」已恢復入倉');
}

function clearHistory() {
  if (!confirm('確定要清空所有出倉歷史嗎？此操作無法復原。')) return;
  outHistory = [];
  saveToCloud();
  renderOutHistory();
  showToast('出倉歷史已清空');
}

// ========== 操作歷史記錄 ==========
function addActionHistory(type, itemData, details) {
  const action = {
    id: 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
    type: type,           // 'in' 入倉, 'out' 出倉, 'edit' 編輯, 'delete' 刪除, 'qty_change' 數量變更
    itemName: itemData.name || '',
    itemCategory: itemData.category || 'other',
    itemQty: itemData.qty || 0,
    itemUnit: itemData.unit || '個',
    itemLocation: itemData.location || '',
    timestamp: Date.now(),
    date: getTodayHK(),
    time: new Date().toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit' }),
    details: details || ''
  };

  actionHistory.unshift(action);
  // 保留最近 500 條記錄
  if (actionHistory.length > 500) {
    actionHistory = actionHistory.slice(0, 500);
  }
  saveToCloud();
}

function getActionIcon(type) {
  const icons = {
    'in': '📥',
    'out': '📤',
    'edit': '✏️',
    'delete': '🗑️',
    'qty_change': '🔢',
    'restore': '↩️'
  };
  return icons[type] || '📝';
}

function getActionLabel(type) {
  const labels = {
    'in': '入倉',
    'out': '出倉',
    'edit': '編輯',
    'delete': '刪除',
    'qty_change': '數量變更',
    'restore': '恢復入倉'
  };
  return labels[type] || '操作';
}

function getActionColor(type) {
  const colors = {
    'in': '#5A9E6E',
    'out': '#D4574A',
    'edit': '#D4A03A',
    'delete': '#8A8580',
    'qty_change': '#3498db',
    'restore': '#5A9E6E'
  };
  return colors[type] || '#95a5a6';
}


// ========== 操作歷史彈窗 ==========
function openActionHistoryModal() {
  renderActionHistory();
  document.getElementById('actionHistoryModal').classList.add('show');
}

function closeActionHistoryModal() {
  document.getElementById('actionHistoryModal').classList.remove('show');
}

function renderActionHistory() {
  const list = document.getElementById('actionHistoryList');
  const empty = document.getElementById('actionHistoryEmpty');
  const filter = document.getElementById('actionHistoryFilter').value;
  const searchTerm = document.getElementById('actionHistorySearch').value.trim().toLowerCase();

  let filtered = actionHistory;
  if (filter !== 'all') {
    filtered = filtered.filter(a => a.type === filter);
  }
  if (searchTerm) {
    filtered = filtered.filter(a => a.itemName.toLowerCase().includes(searchTerm));
  }

  if (filtered.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    document.getElementById('actionHistoryCount').textContent = '0 條記錄';
    return;
  }

  empty.style.display = 'none';
  document.getElementById('actionHistoryCount').textContent = filtered.length + ' 條記錄';

  list.innerHTML = filtered.map(a => {
    const cfg = categories[a.itemCategory] || categories.other;
    const color = getActionColor(a.type);
    return '<div class="action-history-item" style="border-left:4px solid ' + color + '">' +
      '<div class="action-history-icon" style="background:' + color + '20;color:' + color + '">' + getActionIcon(a.type) + '</div>' +
      '<div class="action-history-info">' +
        '<div class="action-history-header">' +
          '<span class="action-history-name">' + escapeHtml(a.itemName) + '</span>' +
          '<span class="action-history-type" style="background:' + color + '20;color:' + color + '">' + getActionLabel(a.type) + '</span>' +
        '</div>' +
        '<div class="action-history-meta">' +
          '<span>' + cfg.icon + ' ' + cfg.label + '</span>' +
          '<span>📦 ' + a.itemQty + escapeHtml(a.itemUnit) + '</span>' +
          (a.itemPrice ? '<span>💰 $' + a.itemPrice.toFixed(2) + '</span>' : '') +
          '<span>📍 ' + escapeHtml(a.itemLocation) + '</span>' +
        '</div>' +
        (a.details ? '<div class="action-history-detail">' + escapeHtml(a.details) + '</div>' : '') +
        '<div class="action-history-time">' + a.date + ' ' + a.time + '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function filterActionHistory() {
  renderActionHistory();
}

function clearActionHistory() {
  if (!confirm('確定要清空所有操作歷史嗎？此操作無法復原。')) return;
  actionHistory = [];
  saveToCloud();
  renderActionHistory();
  showToast('操作歷史已清空');
}

// ========== 日曆模式 ==========
let calendarCurrentDate = new Date();
let calendarSelectedDate = null;

function openCalendarModal() {
  calendarCurrentDate = new Date();
  renderCalendar();
  document.getElementById('calendarModal').classList.add('show');
}

function closeCalendarModal() {
  document.getElementById('calendarModal').classList.remove('show');
  document.getElementById('calendarDayDetail').style.display = 'none';
}

function changeCalendarMonth(delta) {
  calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + delta);
  renderCalendar();
}

function renderCalendar() {
  const year = calendarCurrentDate.getFullYear();
  const month = calendarCurrentDate.getMonth();

  // 更新月份標題
  const monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  document.getElementById('calendarMonthLabel').textContent = year + '年' + monthNames[month];

  const grid = document.getElementById('calendarGrid');
  grid.innerHTML = '';

  // 計算日曆範圍
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDay.getDay(); // 0=Sunday
  const daysInMonth = lastDay.getDate();

  // 上個月的尾端日期
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  // 收集當月所有 actionHistory 資料
  const monthActions = {};
  let monthIn = 0, monthOut = 0, monthChange = 0;

  actionHistory.forEach(action => {
    const actionDate = new Date(action.date);
    if (actionDate.getFullYear() === year && actionDate.getMonth() === month) {
      const day = actionDate.getDate();
      if (!monthActions[day]) monthActions[day] = [];
      monthActions[day].push(action);

      if (action.type === 'in') monthIn++;
      else if (action.type === 'out') monthOut++;
      else if (action.type === 'qty_change') monthChange++;
    }
  });

  // 更新統計
  document.getElementById('calStatIn').textContent = monthIn;
  document.getElementById('calStatOut').textContent = monthOut;
  document.getElementById('calStatChange').textContent = monthChange;

  // 填充上個月尾端
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const cell = createCalendarCell(day, true);
    grid.appendChild(cell);
  }

  // 填充當月
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = createCalendarCell(day, false, monthActions[day], isCurrentMonth && day === today.getDate());
    grid.appendChild(cell);
  }

  // 填充下個月開頭
  const totalCells = startDayOfWeek + daysInMonth;
  const remainingCells = 42 - totalCells; // 6行 x 7列
  for (let day = 1; day <= remainingCells; day++) {
    const cell = createCalendarCell(day, true);
    grid.appendChild(cell);
  }
}

function createCalendarCell(day, isOtherMonth, actions, isToday) {
  const cell = document.createElement('div');
  cell.className = 'calendar-day' + (isOtherMonth ? ' other-month' : '') + (isToday ? ' today' : '');

  const number = document.createElement('div');
  number.className = 'calendar-day-number';
  number.textContent = day;
  cell.appendChild(number);

  if (actions && actions.length > 0) {
    const dots = document.createElement('div');
    dots.className = 'calendar-day-dots';

    const hasIn = actions.some(a => a.type === 'in');
    const hasOut = actions.some(a => a.type === 'out');
    const hasQty = actions.some(a => a.type === 'qty_change');
    const hasEdit = actions.some(a => a.type === 'edit');

    if (hasIn) dots.innerHTML += '<span class="calendar-dot in"></span>';
    if (hasOut) dots.innerHTML += '<span class="calendar-dot out"></span>';
    if (hasQty) dots.innerHTML += '<span class="calendar-dot qty"></span>';
    if (hasEdit && !hasIn && !hasOut && !hasQty) dots.innerHTML += '<span class="calendar-dot edit"></span>';

    cell.appendChild(dots);

    // 點擊顯示當天詳情
    cell.onclick = function() {
      showCalendarDayDetail(day, actions);
    };
  }

  return cell;
}

function showCalendarDayDetail(day, actions) {
  const detail = document.getElementById('calendarDayDetail');
  const title = document.getElementById('calendarDayTitle');
  const list = document.getElementById('calendarDayList');

  const year = calendarCurrentDate.getFullYear();
  const month = calendarCurrentDate.getMonth() + 1;
  title.textContent = year + '年' + month + '月' + day + '日 變動記錄 (' + actions.length + ' 筆)';

  list.innerHTML = actions.map(a => {
    const cfg = categories[a.itemCategory] || categories.other;
    const color = getActionColor(a.type);
    return '<div class="calendar-day-detail-item" style="border-left:3px solid ' + color + '">' +
      '<div class="calendar-day-detail-icon" style="background:' + color + '20;color:' + color + '">' + getActionIcon(a.type) + '</div>' +
      '<div class="calendar-day-detail-info">' +
        '<div class="calendar-day-detail-name">' + escapeHtml(a.itemName) + ' <span style="font-size:11px;color:var(--text-muted);font-weight:500;">' + getActionLabel(a.type) + '</span></div>' +
        '<div class="calendar-day-detail-meta">' + cfg.icon + ' ' + cfg.label + ' · 📦 ' + a.itemQty + escapeHtml(a.itemUnit) + (a.itemPrice ? ' · 💰 $' + a.itemPrice.toFixed(2) : '') + ' · 📍 ' + escapeHtml(a.itemLocation) + '</div>' +
        (a.details ? '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">' + escapeHtml(a.details) + '</div>' : '') +
      '</div>' +
    '</div>';
  }).join('');

  detail.style.display = 'block';
  detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}



// ========== 數據導出/導入 ==========
function exportData() {
  const data = {
    family: currentFamily,
    exportDate: getTodayHK(),
    categories: categories,
    items: items,
    outHistory: outHistory
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '家倉備份_' + currentFamily + '_' + getTodayHK() + '.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('數據已導出');
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!data.items) {
          alert('無效的備份檔案');
          return;
        }
        if (!confirm('確定要導入「' + (data.family || '未知家庭') + '」的備份嗎？這將覆蓋當前數據。')) return;

        if (data.categories) categories = data.categories;
        if (data.items) items = data.items;
        if (data.outHistory) outHistory = data.outHistory;

        saveToCloud();
        renderCategoryTabs();
        renderCategorySelects();
        renderItems();
        updateStats();
        checkExpiringItems();
        showToast('數據導入成功');
      } catch (err) {
        alert('導入失敗：' + err.message);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// ========== 設定 ==========
function openSettings() {
  document.getElementById('settingsFamilyName').textContent = currentFamily;
  document.getElementById('settingsModal').classList.add('show');
}

function closeSettings() {
  document.getElementById('settingsModal').classList.remove('show');
}





// ========== 條碼掃描功能 ==========
let barcodeScanner = null;
let isScanning = false;

// 條碼資料庫查詢 - 多源查詢提升香港覆蓋率
// 依序查詢：Open Food Facts → Open Beauty Facts → Open Pet Food Facts → Open Products Facts → UPC Database
// 本地條碼快取（掃描過的條碼會保存，下次掃描即時返回）
function getBarcodeCache() {
  try {
    const cache = localStorage.getItem('hw_barcode_cache');
    return cache ? JSON.parse(cache) : {};
  } catch(e) { return {}; }
}

function saveBarcodeCache(cache) {
  try {
    localStorage.setItem('hw_barcode_cache', JSON.stringify(cache));
  } catch(e) {}
}

function addToBarcodeCache(barcode, data) {
  const cache = getBarcodeCache();
  cache[barcode] = { ...data, cachedAt: Date.now() };
  // 最多保留 200 條快取
  const keys = Object.keys(cache);
  if (keys.length > 200) {
    const oldest = keys.sort((a, b) => (cache[a].cachedAt || 0) - (cache[b].cachedAt || 0))[0];
    delete cache[oldest];
  }
  saveBarcodeCache(cache);
}

// 條碼資料庫查詢 - 多源查詢提升香港覆蓋率
// 依序查詢：本地快取 → Open Food Facts → Open Beauty Facts → Open Pet Food Facts → Open Products Facts
async function lookupBarcode(barcode) {
  // 1. 先查本地快取
  const cache = getBarcodeCache();
  if (cache[barcode]) {
    showToast('📦 從快取載入產品資料');
    return { ...cache[barcode], fromCache: true };
  }

  showToast('🔍 正在查詢條碼資料...');

  const sources = [
    { name: 'Open Food Facts', url: `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,brands,categories_tags,image_url,image_front_url,quantity,packaging,labels_tags`, mapper: mapOpenFoodFacts },
    { name: 'Open Beauty Facts', url: `https://world.openbeautyfacts.org/api/v2/product/${barcode}.json?fields=product_name,brands,categories_tags,image_url,image_front_url,quantity,packaging,labels_tags`, mapper: mapOpenBeautyFacts },
    { name: 'Open Pet Food Facts', url: `https://world.openpetfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,brands,categories_tags,image_url,image_front_url,quantity,packaging,labels_tags`, mapper: mapOpenPetFoodFacts },
    { name: 'Open Products Facts', url: `https://world.openproductsfacts.org/api/v2/product/${barcode}.json?fields=product_name,brands,categories_tags,image_url,image_front_url,quantity,packaging,labels_tags`, mapper: mapOpenProductsFacts }
  ];

  for (const source of sources) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6秒超時

      const response = await fetch(source.url, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'User-Agent': 'HomeWarehouseApp/1.0' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const data = await response.json();
      const result = source.mapper(data, barcode);

      if (result && result.found) {
        // 保存到快取
        addToBarcodeCache(barcode, result);
        showToast(`✅ 從 ${source.name} 找到產品`);
        return result;
      }
    } catch (err) {
      console.warn(`${source.name} 查詢失敗:`, err.message);
      continue;
    }
  }

  return { found: false };
}

// Open Food Facts 映射
function mapOpenFoodFacts(data, barcode) {
  if (data.status !== 1 || !data.product) return null;
  const p = data.product;
  return {
    found: true,
    name: p.product_name || '',
    brand: p.brands || '',
    category: mapFoodCategory(p.categories_tags),
    image: p.image_url || p.image_front_url || '',
    quantity: p.quantity || '',
    packaging: p.packaging || '',
    source: 'Open Food Facts'
  };
}

// Open Beauty Facts 映射
function mapOpenBeautyFacts(data, barcode) {
  if (data.status !== 1 || !data.product) return null;
  const p = data.product;
  return {
    found: true,
    name: p.product_name || '',
    brand: p.brands || '',
    category: mapBeautyCategory(p.categories_tags),
    image: p.image_url || p.image_front_url || '',
    quantity: p.quantity || '',
    packaging: p.packaging || '',
    source: 'Open Beauty Facts'
  };
}

// Open Pet Food Facts 映射
function mapOpenPetFoodFacts(data, barcode) {
  if (data.status !== 1 || !data.product) return null;
  const p = data.product;
  return {
    found: true,
    name: p.product_name || '',
    brand: p.brands || '',
    category: 'food',
    image: p.image_url || p.image_front_url || '',
    quantity: p.quantity || '',
    packaging: p.packaging || '',
    source: 'Open Pet Food Facts'
  };
}

// Open Products Facts 映射
function mapOpenProductsFacts(data, barcode) {
  if (data.status !== 1 || !data.product) return null;
  const p = data.product;
  return {
    found: true,
    name: p.product_name || '',
    brand: p.brands || '',
    category: mapProductsCategory(p.categories_tags),
    image: p.image_url || p.image_front_url || '',
    quantity: p.quantity || '',
    packaging: p.packaging || '',
    source: 'Open Products Facts'
  };
}

// 食品分類映射
function mapFoodCategory(categories) {
  if (!categories || !Array.isArray(categories)) return 'food';
  const cats = categories.map(c => c.toLowerCase());
  if (cats.some(c => c.includes('medicine') || c.includes('drug') || c.includes('pharmaceutical') || c.includes('vitamin') || c.includes('supplement'))) return 'medicine';
  if (cats.some(c => c.includes('electronics') || c.includes('appliance') || c.includes('device'))) return 'electronics';
  if (cats.some(c => c.includes('clothing') || c.includes('apparel') || c.includes('fashion') || c.includes('textile'))) return 'clothes';
  return 'food';
}

// 美容/護膚分類映射
function mapBeautyCategory(categories) {
  if (!categories || !Array.isArray(categories)) return 'other';
  const cats = categories.map(c => c.toLowerCase());
  if (cats.some(c => c.includes('medicine') || c.includes('drug') || c.includes('pharmaceutical'))) return 'medicine';
  return 'other';
}

// 一般產品分類映射
function mapProductsCategory(categories) {
  if (!categories || !Array.isArray(categories)) return 'other';
  const cats = categories.map(c => c.toLowerCase());
  if (cats.some(c => c.includes('food') || c.includes('beverage') || c.includes('drink'))) return 'food';
  if (cats.some(c => c.includes('medicine') || c.includes('drug') || c.includes('pharmaceutical'))) return 'medicine';
  if (cats.some(c => c.includes('electronics') || c.includes('appliance') || c.includes('device'))) return 'electronics';
  if (cats.some(c => c.includes('clothing') || c.includes('apparel') || c.includes('fashion') || c.includes('textile'))) return 'clothes';
  return 'other';
}

// 打開條碼掃描器
function openBarcodeScanner() {
  document.getElementById('barcodeModal').classList.add('show');
  startBarcodeScan();
}

// 關閉條碼掃描器
function closeBarcodeScanner() {
  stopBarcodeScan();
  document.getElementById('barcodeModal').classList.remove('show');
  document.getElementById('barcodeResult').style.display = 'none';
}

// 開始掃描
function startBarcodeScan() {
  const reader = document.getElementById('barcodeReader');
  const status = document.getElementById('scanStatus');

  if (isScanning) return;
  isScanning = true;

  status.textContent = '正在啟動相機...';
  status.className = 'scan-status scanning';

  // 使用 html5-qrcode 庫
  if (typeof Html5Qrcode === 'undefined') {
    loadScript('https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js')
      .then(() => initScanner(reader, status))
      .catch(() => {
        status.textContent = '無法載入掃描器，請手動輸入條碼';
        status.className = 'scan-status error';
        showManualInput();
      });
  } else {
    initScanner(reader, status);
  }
}

// 載入外部腳本
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// 初始化掃描器
function initScanner(reader, status) {
  barcodeScanner = new Html5Qrcode('barcodeReader');

  const config = {
    fps: 10,
    qrbox: { width: 250, height: 150 },
    aspectRatio: 1.0,
    formatsToSupport: [
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.EAN_8,
      Html5QrcodeSupportedFormats.UPC_A,
      Html5QrcodeSupportedFormats.UPC_E,
      Html5QrcodeSupportedFormats.CODE_128,
      Html5QrcodeSupportedFormats.CODE_39
    ]
  };

  barcodeScanner.start(
    { facingMode: 'environment' },
    config,
    onBarcodeDetected,
    onScanFailure
  ).then(() => {
    status.textContent = '請將條碼對準框內';
    status.className = 'scan-status ready';
  }).catch(err => {
    console.error('Camera error:', err);
    status.textContent = '無法開啟相機，請檢查權限或手動輸入';
    status.className = 'scan-status error';
    showManualInput();
    isScanning = false;
  });
}

// 掃描失敗回調（持續掃描中，非錯誤）
function onScanFailure(error) {
  // 持續掃描中，不需要處理
}

// 偵測到條碼
let lastScannedBarcode = '';
let scanCooldown = false;

function onBarcodeDetected(decodedText, decodedResult) {
  if (scanCooldown) return;
  if (decodedText === lastScannedBarcode) return;

  lastScannedBarcode = decodedText;
  scanCooldown = true;

  // 停止掃描
  stopBarcodeScan();

  const status = document.getElementById('scanStatus');
  status.textContent = '已掃描：' + decodedText;
  status.className = 'scan-status success';

  // 查詢產品資料
  lookupAndFill(decodedText);

  // 3秒後可重新掃描
  setTimeout(() => { scanCooldown = false; }, 3000);
}

// 停止掃描
function stopBarcodeScan() {
  if (barcodeScanner && isScanning) {
    barcodeScanner.stop().catch(() => {});
    isScanning = false;
  }
}

// 顯示手動輸入
function showManualInput() {
  document.getElementById('manualInputArea').style.display = 'block';
}

// 手動輸入條碼
function manualBarcodeLookup() {
  const input = document.getElementById('manualBarcodeInput');
  const barcode = input.value.trim();
  if (!barcode) { alert('請輸入條碼號碼'); return; }
  lookupAndFill(barcode);
}

// 查詢並填充表單
async function lookupAndFill(barcode) {
  const resultArea = document.getElementById('barcodeResult');
  const resultContent = document.getElementById('barcodeResultContent');

  resultArea.style.display = 'block';
  resultContent.innerHTML = '<div style="text-align:center;padding:20px">🔍 查詢中...</div>';

  const data = await lookupBarcode(barcode);

  if (data.found) {
    // 顯示查詢結果
    let html = '<div class="barcode-product-card">';
    if (data.image) {
      html += '<img src="' + data.image + '" alt="產品圖片" class="barcode-product-img">';
    }
    html += '<div class="barcode-product-info">';
    html += '<div class="barcode-product-name">' + escapeHtml(data.name) + '</div>';
    if (data.brand) html += '<div class="barcode-product-brand">' + escapeHtml(data.brand) + '</div>';
    if (data.quantity) html += '<div class="barcode-product-qty">規格：' + escapeHtml(data.quantity) + '</div>';
    if (data.fromCache) html += '<div class="barcode-product-source">📦 來自本地快取</div>';
    else html += '<div class="barcode-product-source">資料來源：' + data.source + '</div>';
    html += '</div></div>';

    html += '<div style="display:flex;gap:10px;margin-top:16px">';
    html += '<button class="btn btn-primary" style="flex:1" onclick="confirmBarcodeAdd(\'' + barcode + '\', \'' + escapeHtml(data.name).replace(/'/g, "\'") + '\', \'' + data.category + '\', \'' + (data.image || '') + '\', \'' + escapeHtml(data.quantity || '').replace(/'/g, "\'") + '\')">✅ 確認入倉</button>';
    html += '<button class="btn" style="flex:1" onclick="retryBarcodeScan()">🔄 重新掃描</button>';
    html += '</div>';

    resultContent.innerHTML = html;

    // 預填充資料供確認使用
    window._barcodeData = {
      barcode: barcode,
      name: data.name,
      category: data.category,
      image: data.image,
      quantity: data.quantity,
      brand: data.brand
    };
  } else {
    // 產品未找到 - 提供更好的 UX，讓用戶直接輸入名稱
    let html = '<div style="text-align:center;padding:20px">';
    html += '<div style="font-size:48px;margin-bottom:12px">😕</div>';
    html += '<div style="font-size:16px;font-weight:700;color:var(--text-primary);margin-bottom:8px">資料庫中暫無此產品</div>';
    html += '<div style="font-size:13px;color:var(--text-secondary);margin-bottom:16px">條碼：' + barcode + '<br>您可以手動輸入產品名稱後入倉</div>';

    // 輸入名稱的欄位
    html += '<div style="margin-bottom:12px;">';
    html += '<input id="manualProductName" class="form-input" type="text" placeholder="輸入產品名稱（例如：維他檸檬茶）" style="text-align:center;">';
    html += '</div>';

    html += '<div style="display:flex;gap:10px">';
    html += '<button class="btn btn-primary" style="flex:1" onclick="confirmBarcodeAddWithName(\'' + barcode + '\')">➕ 入倉</button>';
    html += '<button class="btn" style="flex:1" onclick="retryBarcodeScan()">🔄 重新掃描</button>';
    html += '</div></div>';

    resultContent.innerHTML = html;

    // 聚焦到輸入框
    setTimeout(() => {
      const input = document.getElementById('manualProductName');
      if (input) input.focus();
    }, 100);
  }
}

// 用戶手動輸入名稱後入倉
function confirmBarcodeAddWithName(barcode) {
  const nameInput = document.getElementById('manualProductName');
  const name = nameInput ? nameInput.value.trim() : '';

  // 關閉掃描器
  closeBarcodeScanner();

  // 打開新增物品彈窗
  openAddModal();

  // 填充資料
  if (name) document.getElementById('itemName').value = name;

  // 嘗試 AI 分類（基於名稱）
  if (name) {
    // 簡單關鍵字分類
    const lowerName = name.toLowerCase();
    if (lowerName.includes('藥') || lowerName.includes('丸') || lowerName.includes('膠囊')) selectedCategory = 'medicine';
    else if (lowerName.includes('衫') || lowerName.includes('褲') || lowerName.includes('衣服')) selectedCategory = 'clothes';
    else if (lowerName.includes('電') || lowerName.includes('機') || lowerName.includes('器')) selectedCategory = 'electronics';
    else if (lowerName.includes('餅') || lowerName.includes('糖') || lowerName.includes('飲') || lowerName.includes('茶') || lowerName.includes('水') || lowerName.includes('奶')) selectedCategory = 'food';
    updateCategorySelection();
  }

  // 在備註中添加條碼資訊
  const noteEl = document.getElementById('itemNote');
  const barcodeNote = '條碼：' + barcode;
  noteEl.value = barcodeNote;

  showToast('📦 請輸入產品資料後儲存');
}

// 重新掃描
function retryBarcodeScan() {
  document.getElementById('barcodeResult').style.display = 'none';
  document.getElementById('manualBarcodeInput').value = '';
  lastScannedBarcode = '';
  scanCooldown = false;
  startBarcodeScan();
}

// 確認條碼入倉
function confirmBarcodeAdd(barcode, name, category, image, quantity) {
  // 關閉掃描器
  closeBarcodeScanner();

  // 打開新增物品彈窗
  openAddModal();

  // 填充資料
  if (name) document.getElementById('itemName').value = name;
  if (category) {
    selectedCategory = category;
    updateCategorySelection();
  }
  if (image) {
    currentImageData = image;
    const area = document.getElementById('imgUploadArea');
    area.classList.add('has-img');
    area.innerHTML = '<img src="' + image + '" alt="產品圖片"><button class="img-remove" onclick="event.stopPropagation();removeImage()">×</button>';
  }

  // 嘗試解析數量
  if (quantity) {
    const qtyMatch = quantity.match(/(\d+)/);
    if (qtyMatch) {
      document.getElementById('itemQty').value = qtyMatch[1];
    }
    const unitMatch = quantity.match(/\d+\s*(\w+)/);
    if (unitMatch) {
      document.getElementById('itemUnit').value = unitMatch[1];
    }
  }

  // 嘗試從 Open Food Facts 獲取價格（目前資料庫不直接提供，留空讓用戶填寫）
  document.getElementById('itemPrice').value = '';

  // 在備註中添加條碼資訊
  const noteEl = document.getElementById('itemNote');
  const existingNote = noteEl.value;
  const barcodeNote = '條碼：' + barcode;
  noteEl.value = existingNote ? existingNote + '\n' + barcodeNote : barcodeNote;

  showToast('📦 已帶入條碼資料，請確認後儲存');
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
