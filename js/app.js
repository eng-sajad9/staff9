function renderAppVersion() {
  try {
    var label = document.getElementById('appVersionLabel');
    if (label) {
      label.innerHTML = 'الإصدار: <strong>' + window.APP_VERSION.version + '</strong>' + ' — آخر تحديث: ' + window.APP_VERSION.updated;
    }
    // modal fields
    var mv = document.getElementById('modalVersion'); if (mv) mv.textContent = window.APP_VERSION.version;
    var mu = document.getElementById('modalUpdated'); if (mu) mu.textContent = window.APP_VERSION.updated;
    var mn = document.getElementById('modalNotes'); if (mn) mn.textContent = window.APP_VERSION.notes || '';
  } catch (e) { console && console.warn && console.warn('renderAppVersion error', e); }
}

// Public helpers to update/read the version at runtime.
window.setAppVersion = function (version, updated, notes) {
  if (typeof version === 'object') {
    window.APP_VERSION = Object.assign({}, window.APP_VERSION, version);
  } else {
    if (version) window.APP_VERSION.version = version;
    if (updated) window.APP_VERSION.updated = updated;
    if (notes) window.APP_VERSION.notes = notes;
  }
  renderAppVersion();
};
window.getAppVersion = function () { return Object.assign({}, window.APP_VERSION); };

// Modern Toast Notification Function
// Modern iOS-Style Toast Notification Function
window.showToast = function(titleOrMessage, description = '', type = 'success', duration = 4500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  // Handle legacy single-argument calls intelligently
  let finalTitle = titleOrMessage;
  let finalDesc = description;
  
  if (!description) {
    // If only one argument is provided, try to split it or use it as description
    if (titleOrMessage.length > 25) {
      finalTitle = "تنبيه النظام";
      finalDesc = titleOrMessage;
    } else {
      finalTitle = titleOrMessage;
      finalDesc = "تمت العملية بنجاح"; // Default subtitle for short success messages
      if (type === 'error') finalDesc = "حدث خطأ أثناء المعالجة";
      if (type === 'warning') finalDesc = "يرجى الانتباه لهذه الملاحظة";
      if (type === 'info') finalDesc = "معلومات إضافية لك";
    }
  }

  const toast = document.createElement('div');
  toast.className = `toast-card ${type}`;
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-content">
      <div class="toast-title">${finalTitle}</div>
      <div class="toast-message">${finalDesc}</div>
    </div>
    <button class="toast-close">✕</button>
  `;

  container.appendChild(toast);

  const closeToast = () => {
    toast.classList.add('fade-out');
    toast.addEventListener('animationend', () => {
      toast.remove();
      if (container && container.childNodes.length === 0) {
        container.remove();
      }
    });
  };

  toast.querySelector('.toast-close').onclick = closeToast;

  // iOS-like interaction: click to dismiss
  toast.onclick = (e) => {
    if (!e.target.classList.contains('toast-close')) closeToast();
  };

  if (duration > 0) {
    setTimeout(closeToast, duration);
  }
};

// Fail-safe: Override the native window.alert to always use our premium showToast
window.alert = function(message) {
  let type = 'success';
  let title = "تنبيه النظام";
  
  if (typeof message === 'string') {
    if (message.includes('❌') || message.includes('error') || message.includes('فشل') || message.includes('خطأ')) {
      type = 'error';
      title = "خطأ في النظام";
    } else if (message.includes('⚠️') || message.includes('warning') || message.includes('تنبيه')) {
      type = 'warning';
      title = "تنبيه هام";
    } else if (message.includes('ℹ️') || message.includes('info') || message.includes('معلومات') || message.includes('لا يوجد')) {
      type = 'info';
      title = "إفادة";
    }
  }
  
  window.showToast(title, String(message), type);
};




// Global Variables
let salaryRates = {};

// modal removed: provide a no-op placeholder so other scripts calling it won't crash
function showAppVersionModal(show) {
  // no-op: modal intentionally removed to keep ribbon minimal
  console && console.debug && console.debug('showAppVersionModal called but modal removed');
}

function insertAfter(refNode, newNode) {
  if (refNode && refNode.parentNode) {
    if (refNode.nextSibling) refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
    else refNode.parentNode.appendChild(newNode);
  }
}

// Initialize interactivity and move ribbon under the attendance table if present
function initVersionUI() {
  var ribbon = document.getElementById('appVersionRibbon');
  var backdrop = null;
  var close = null;

  // Prefer to place the ribbon under the employee-stats table if it exists
  try {
    var placed = false;
    // 1) If there's a specific stats container rendered by the page, insert after it
    var statsContainer = document.getElementById('empStatsBelowTable');
    if (statsContainer && ribbon) {
      var container = document.createElement('div');
      container.className = 'app-version-container';
      ribbon.classList.remove('fixed');
      container.appendChild(ribbon);
      insertAfter(statsContainer, container);
      placed = true;
    }

    // 2) If the page builds a table with class 'emp-stats-table-official', insert after that table
    if (!placed) {
      var tbl = document.querySelector('table.emp-stats-table-official');
      if (tbl && ribbon) {
        var container2 = document.createElement('div');
        container2.className = 'app-version-container';
        ribbon.classList.remove('fixed');
        container2.appendChild(ribbon);
        insertAfter(tbl, container2);
        placed = true;
      }
    }

    // 3) fallback to attendanceTable (previous behavior)
    if (!placed) {
      var table = document.getElementById('attendanceTable');
      if (table && ribbon) {
        var container3 = document.createElement('div');
        container3.className = 'app-version-container';
        ribbon.classList.remove('fixed');
        container3.appendChild(ribbon);
        insertAfter(table, container3);
        placed = true;
      }
    }

    // if nothing matched, leave ribbon fixed (fallback)
  } catch (e) { /* ignore placement errors and keep ribbon fixed */ }

  // Keep ribbon non-interactive (plain display). Still allow keyboard focus if needed.
  if (ribbon) {
    ribbon.setAttribute('role', 'status');
    ribbon.setAttribute('tabindex', '0');
    ribbon.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); /* no modal */ } });
  }
  // modal removed; nothing to bind
  renderAppVersion();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initVersionUI);
else initVersionUI();

// ===== Maintenance mode feature =====
// Shows a full-screen black overlay for non-admin users when maintenance is enabled in DB.
(function () {
  async function setMaintenanceState(enabled, reason, message) {
    if (typeof db === 'undefined' || !db || typeof db.ref !== 'function') {
      showToast('خطأ: قاعدة البيانات غير متاحة', 'error');
      return;
    }
    try {
      const payload = { enabled: !!enabled, setBy: currentUser || 'unknown', at: formatDateTimeNoSeconds(new Date()), reason: reason || '', message: message || null };
      await db.ref('system/maintenance').set(payload);
      // write a small signal to force immediate propagation and to support some listeners
      try { await db.ref('system/maintenance/signal').set(Date.now()); } catch (e) { }
      // Apply the state locally immediately (include message if provided)
      try { applyMaintenanceState(payload); } catch (e) { }
      // broadcast to other tabs in same browser for instant feedback
      try { localStorage.setItem('maintenanceSignal', JSON.stringify({ ts: Date.now(), enabled: !!enabled })); } catch (e) { }
      logActivity(enabled ? 'تفعيل وضع الصيانة' : 'إيقاف وضع الصيانة', `وضع الصيانة ${enabled ? 'تفعيل' : 'إيقاف'} من قبل: ${currentUser || 'unknown'}`);
      try { applyMaintenanceState(payload); } catch (e) { }
    } catch (e) { console.error('setMaintenanceState error', e); alert('حدث خطأ أثناء ضبط وضع الصيانة'); }
  }

  var _maintenanceCountdownInterval = null;
  function applyMaintenanceState(state) {
    try {
      const overlay = document.getElementById('maintenanceOverlay');
      const statusText = document.getElementById('maintenanceStatusText');
      const infoEl = document.getElementById('maintenanceInfo');
      const toggleBtn = document.getElementById('toggleMaintenanceBtn');
      const countdownContainer = document.getElementById('maintenanceCountdownContainer');
      const countdownTimer = document.getElementById('maintenanceCountdownTimer');
      const autoToggle = document.getElementById('autoUnlockToggle');
      const autoTimeInput = document.getElementById('autoUnlockTime');
      const autoContainer = document.getElementById('autoUnlockTimeContainer');
      
      const isAdmin = (typeof currentUserRole !== 'undefined' && currentUserRole === 'admin');
      let enabled = state && state.enabled;

      // Check for auto-unlock expiration
      if (enabled && state.autoUnlockEnabled && state.autoUnlockTime) {
        if (Date.now() >= state.autoUnlockTime) {
          enabled = false;
          // Clean up DB if admin is online
          if (isAdmin && typeof db !== 'undefined') {
            db.ref('system/maintenance').update({ enabled: false, autoUnlockEnabled: false });
          }
        }
      }

      if (statusText) statusText.textContent = enabled ? 'مفعل' : 'غير مفعل';
      if (infoEl) infoEl.textContent = enabled ? `تم التفعيل بواسطة ${state.setBy || '—'} في ${state.at || '—'}${state.reason ? (' — ' + state.reason) : ''}` : 'لا توجد ملاحظات';
      
      try {
        const startTimeEl = document.getElementById('maintenanceStartTime');
        if (startTimeEl) startTimeEl.textContent = (state && state.at) ? state.at : 'غير محدد';
      } catch (e) { }

      // Update Admin UI fields
      if (isAdmin) {
        const activateBtn = document.getElementById('activateAutoUnlockBtn');
        const deactivateBtn = document.getElementById('deactivateAutoUnlockBtn');
        const activeNotice = document.getElementById('activeTimerNotice');

        const isAutoEnabled = !!(state && state.autoUnlockEnabled);
        if (activateBtn) activateBtn.style.display = isAutoEnabled ? 'none' : 'block';
        if (deactivateBtn) deactivateBtn.style.display = isAutoEnabled ? 'block' : 'none';
        if (activeNotice) activeNotice.style.display = isAutoEnabled ? 'flex' : 'none';

        if (autoTimeInput && state && state.autoUnlockTime) {
          const d = new Date(state.autoUnlockTime);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          const hh = String(d.getHours()).padStart(2, '0');
          const min = String(d.getMinutes()).padStart(2, '0');
          autoTimeInput.value = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
        }
      }

      // Countdown logic for users (Professional Multi-day support)
      if (_maintenanceCountdownInterval) clearInterval(_maintenanceCountdownInterval);
      if (enabled && state.autoUnlockEnabled && state.autoUnlockTime && !isAdmin) {
        if (countdownContainer) countdownContainer.style.display = 'block';
        const updateTimer = () => {
          const diff = state.autoUnlockTime - Date.now();
          if (diff <= 0) {
            clearInterval(_maintenanceCountdownInterval);
            location.reload();
            return;
          }
          const days = Math.floor(diff / 86400000);
          const hours = Math.floor((diff % 86400000) / 3600000);
          const minutes = Math.floor((diff % 3600000) / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);

          let timeStr = "";
          if (days > 0) timeStr += `${days} يوم و `;
          timeStr += `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
          
          if (countdownTimer) countdownTimer.textContent = timeStr;
        };
        updateTimer();
        _maintenanceCountdownInterval = setInterval(updateTimer, 1000);
      } else {
        if (countdownContainer) countdownContainer.style.display = 'none';
      }

      // Message handling
      try {
        const overlayMsg = document.getElementById('maintenanceMessageText');
        const txtArea = document.getElementById('maintenanceCustomMessage');
        const message = (state && state.message) ? state.message : 'نحن نقوم حالياً بإجراء تحديثات وتحسينات دورية على النظام لضمان أفضل تجربة مستخدم. سيتم إعادة فتح النظام قريباً فور اكتمال المهام. شكراً لصبركم.';
        if (overlayMsg) overlayMsg.textContent = message;
        if (txtArea && document.activeElement !== txtArea) txtArea.value = message;
      } catch (e) { }

      if (toggleBtn) {
        if (enabled) {
          toggleBtn.textContent = 'إيقاف وضع الصيانة (النظام معطل حالياً)';
          toggleBtn.className = 'btn-danger';
        } else {
          toggleBtn.textContent = 'تفعيل وضع الصيانة';
          toggleBtn.className = '';
        }
      }

      // Visibility handling
      if (overlay) {
        if (enabled && !isAdmin) {
          localStorage.setItem('maintenanceEnabled', 'true');
          document.documentElement.classList.add('maintenance-strict');
          overlay.style.display = 'flex';
          overlay.classList.remove('hide');
          requestAnimationFrame(() => { overlay.classList.add('show'); });
          document.documentElement.style.overflow = 'hidden';
        } else {
          localStorage.removeItem('maintenanceEnabled');
          document.documentElement.classList.add('maintenance-transitioning');
          overlay.classList.remove('show');
          overlay.classList.add('hide');
          setTimeout(() => {
            if (!overlay.classList.contains('show')) {
              overlay.style.display = 'none';
              document.documentElement.classList.remove('maintenance-strict');
              document.documentElement.classList.remove('maintenance-transitioning');
            }
            overlay.classList.remove('hide');
          }, 420);
          document.documentElement.style.overflow = '';
        }
      }
    } catch (e) { console.error('applyMaintenanceState error', e); }
  }

  // Ask for confirmation and optionally a reason before toggling maintenance
  window.toggleMaintenanceRequest = function () {
    if (!currentUserRole || currentUserRole !== 'admin') { alert('غير مسموح: هذه الخاصية خاصة بالمدير فقط'); return; }
    if (typeof db === 'undefined' || !db || typeof db.ref !== 'function') { showToast('خطأ: قاعدة البيانات غير متاحة', 'error'); return; }
    db.ref('system/maintenance').once('value').then((snap) => {
      const state = snap.val() || { enabled: false };
      if (!state.enabled) {
        // enabling
        const reason = prompt('أدخل سبب الصيانة (اختياري):', '');
        // Use the custom message from textarea if present
        const msgEl = document.getElementById('maintenanceCustomMessage');
        const customMsg = (msgEl && msgEl.value) ? msgEl.value.trim() : null;
        showConfirmModal('هل تريد تفعيل وضع الصيانة؟', async () => { await setMaintenanceState(true, reason, customMsg); }, null);
      } else {
        // disabling
        showConfirmModal('هل تريد إيقاف وضع الصيانة الآن؟', async () => { await setMaintenanceState(false, ''); }, null);
      }
    });
  };

  // Attach DB listener to reflect real-time changes in UI
  var _maintenanceListenersAttached = false;
  function attachMaintenanceListeners() {
    try {
      if (_maintenanceListenersAttached) return;
      if (typeof db === 'undefined' || !db || typeof db.ref !== 'function') {
        // retry later when db is loaded
        setTimeout(attachMaintenanceListeners, 550);
        return;
      }
      _maintenanceListenersAttached = true;
      db.ref('system/maintenance').on('value', (snap) => {
        applyMaintenanceState(snap.val());
      });
      // Listen for the signal node as well (wakes some clients quicker)
      db.ref('system/maintenance/signal').on('value', async (snap) => {
        try {
          const s = await db.ref('system/maintenance').once('value');
          applyMaintenanceState(s.val());
        } catch (e) { console.warn('signal listener error', e); }
      });
    } catch (e) { console.warn('attachMaintenanceListeners error', e); }
  }
  attachMaintenanceListeners();

  // Make sure overlay is applied if maintenance is already enabled on load
  document.addEventListener('DOMContentLoaded', function () {
    if (typeof db !== 'undefined' && db && typeof db.ref === 'function') {
      db.ref('system/maintenance').once('value').then((snap) => {
        applyMaintenanceState(snap.val());
      }).catch(() => { });
    }
    // Wire button now we are sure the DOM is ready
    try { const btn = document.getElementById('toggleMaintenanceBtn'); if (btn) btn.addEventListener('click', toggleMaintenanceRequest); } catch (e) { }
    try {
      const activateBtn = document.getElementById('activateAutoUnlockBtn');
      const deactivateBtn = document.getElementById('deactivateAutoUnlockBtn');
      const timeInput = document.getElementById('autoUnlockTime');

      if (activateBtn && deactivateBtn) {
        activateBtn.addEventListener('click', async function () {
          if (typeof db === 'undefined' || !db || typeof db.ref !== 'function') return;
          const timeVal = timeInput.value;

          if (!timeVal) return alert('يرجى تحديد التاريخ والوقت أولاً');
          
          const scheduledDate = new Date(timeVal);
          const timestamp = scheduledDate.getTime();
          
          if (timestamp <= Date.now()) {
            return alert('خطأ: لا يمكن اختيار موعد في الماضي. يرجى التأكد من الوقت والتاريخ.');
          }

          try {
            await db.ref('system/maintenance').update({
              autoUnlockEnabled: true,
              autoUnlockTime: timestamp
            });
            showToast('✅ تم تفعيل مؤقت الفتح التلقائي', 'success');
            try { await db.ref('system/maintenance/signal').set(Date.now()); } catch (e) { }
          } catch (err) {
            showToast('❌ فشل في تفعيل المؤقت', 'error');
          }
        });

        deactivateBtn.addEventListener('click', async function () {
          if (typeof db === 'undefined' || !db || typeof db.ref !== 'function') return;
          try {
            await db.ref('system/maintenance').update({
              autoUnlockEnabled: false,
              autoUnlockTime: null
            });
            showToast('⚪ تم إلغاء مؤقت الفتح', 'info');
            try { await db.ref('system/maintenance/signal').set(Date.now()); } catch (e) { }
          } catch (err) {
            showToast('❌ فشل في إلغاء المؤقت', 'error');
          }
        });
      }
    } catch (e) { }

    try {
      const saveBtn = document.getElementById('saveMaintenanceMsgBtn'); if (saveBtn) saveBtn.addEventListener('click', async function () {
        if (!currentUserRole || currentUserRole !== 'admin') return alert('غير مسموح: هذه الخاصية للمدير فقط');
        const txtArea = document.getElementById('maintenanceCustomMessage'); if (!txtArea) return;
        const val = txtArea.value.trim();

        if (typeof db === 'undefined' || !db || typeof db.ref !== 'function') {
          showToast('الجهاز غير متصل بقاعدة البيانات حالياً', 'warning');
          return;
        }

        try {
          await db.ref('system/maintenance').update({
            message: val,
            messageUpdatedBy: currentUser || 'unknown',
            messageUpdatedAt: formatDateTimeNoSeconds(new Date())
          });
          showToast('✅ تم حفظ نص رسالة الصيانة', 'success');
          try { await db.ref('system/maintenance/signal').set(Date.now()); } catch (e) { }
        } catch (e) {
          showToast('❌ فشل في حفظ النص', 'error');
        }
      });
    } catch (e) { }
    // Listen for localStorage broadcasts for cross-tab instant updates
    try {
      window.addEventListener('storage', function (e) {
        if (e.key === 'maintenanceSignal') {
          try {
            db.ref('system/maintenance').once('value').then((snap) => applyMaintenanceState(snap.val())).catch(() => { });
          } catch (err) { }
        }
      });
    } catch (e) { }
  });
})();
// Ensure login box is visible immediately if there's no saved session.
(function () {
  try {
    var saved = localStorage.getItem('loggedUser');
    var lb = document.getElementById('loginBox');
    var main = document.getElementById('mainContent');
    var admin = document.getElementById('adminPanel');
    var loader = document.getElementById('loaderSpinner');
    var sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    var sidebarCloseBtn = document.getElementById('sidebarCloseBtn');

    if (!saved) {
      if (lb) lb.style.display = 'block';
      if (main) main.style.display = 'none';
      if (admin) admin.style.display = 'none';
      if (loader) loader.style.display = 'none';
      if (sidebarToggleBtn) sidebarToggleBtn.style.display = 'none';
      if (sidebarCloseBtn) sidebarCloseBtn.style.display = 'none';
    } else {
      // if session exists, keep loader visible until main UI initializes
      if (loader) loader.style.display = 'flex';
      if (lb) lb.style.display = 'none';
      if (sidebarToggleBtn) sidebarToggleBtn.style.display = 'none'; // Will be managed by updateSidebarVisibility later
    }
  } catch (e) { console && console.warn && console.warn('init loginBox script error', e) }
})();

// دالة عرض/إخفاء جدول احصائيات الكعده مع تبديل الأزرار وحركة scroll
document.addEventListener("DOMContentLoaded", function () {
  var kadahBtn = document.getElementById("showKadahStatsBtn");
  var closeBtn = document.getElementById("closeKadahStatsBtn");
  var wrapper = document.getElementById("kadahStatsTableWrapper");
  if (kadahBtn && closeBtn && wrapper) {
    kadahBtn.onclick = function (e) {
      e.preventDefault();
      renderKadahStatsTable();
      wrapper.style.display = "block";
      setTimeout(function () {
        wrapper.classList.add("show");
        wrapper.scrollIntoView({ behavior: "smooth" });
        kadahBtn.style.display = "none";
        closeBtn.style.display = "inline-block";
      }, 50);
    };
    closeBtn.onclick = function (e) {
      e.preventDefault();
      wrapper.classList.remove("show");
      setTimeout(function () {
        wrapper.style.display = "none";
        kadahBtn.style.display = "inline-block";
        closeBtn.style.display = "none";
        kadahBtn.scrollIntoView({ behavior: "smooth" });
      }, 400);
    };
  }
});

// دالة حساب وعرض احصائيات الكعده لكل موظف
function renderKadahStatsTable() {
  // جلب بيانات تفاصيل الأيام من قاعدة البيانات
  // إذا كان لديك متغير month و year و employees معرفين مسبقاً في الكود
  const monthKey = `${year}_${(month + 1).toString().padStart(2, "0")}`;
  db.ref(`dayDetails/${monthKey}`)
    .once("value")
    .then((snap) => {
      const days = snap.val() || {};
      const stats = {};
      employees.forEach((emp) => {
        stats[emp] = { "600": 0, "22": 0, "مشتركة": 0 };
      });

      function countValueInStats(val, empStats) {
        // val can be string, array, or object. Each non-empty field counts as 0.5
        if (Array.isArray(val)) {
          val.forEach((v) => {
            if (!v) return;
            if (v === "600") empStats["600"] += 0.5;
            if (v === "22") empStats["22"] += 0.5;
            if (v === "مشتركة") empStats["مشتركة"] += 0.5;
          });
        } else if (typeof val === 'object' && val !== null) {
          // support { value: [..] } or { value1:.., value2:.. }
          if (Array.isArray(val.value)) {
            countValueInStats(val.value, empStats);
          } else {
            const v1 = val.value1 || val.v1 || "";
            const v2 = val.value2 || val.v2 || "";
            [v1, v2].forEach((v) => {
              if (!v) return;
              if (v === "600") empStats["600"] += 0.5;
              if (v === "22") empStats["22"] += 0.5;
              if (v === "مشتركة") empStats["مشتركة"] += 0.5;
            });
          }
        } else if (typeof val === 'string' && val) {
          // single string — count as 0.5 (one field)
          if (val === "600") empStats["600"] += 0.5;
          if (val === "22") empStats["22"] += 0.5;
          if (val === "مشتركة") empStats["مشتركة"] += 0.5;
        }
      }

      Object.values(days).forEach((day) => {
        employees.forEach((emp) => {
          const stored = day[emp];
          const val = stored ? stored.value : undefined;
          countValueInStats(val, stats[emp]);
        });
      });
      // بناء صفوف الجدول
      const tbody = document.querySelector("#kadahStatsTable tbody");
      tbody.innerHTML = "";
      employees.forEach((emp) => {
        const row = document.createElement("tr");
        // Always apply the class for each column, even if the value is zero
        row.innerHTML = `
                  <td>${emp}</td>
                  <td class='kadah-600'>${typeof stats[emp]["600"] === "number" ? stats[emp]["600"] : 0}</td>
                  <td class='kadah-22'>${typeof stats[emp]["22"] === "number" ? stats[emp]["22"] : 0}</td>
                  <td class='kadah-msh'>${typeof stats[emp]["مشتركة"] === "number" ? stats[emp]["مشتركة"] : 0}</td>
                `;
        tbody.appendChild(row);
      });
    });
}
// دالة فتح نافذة تفاصيل اليوم
function showDayDetailsModal(dayKey, dayLabel) {
  const modal = document.getElementById("dayDetailsModal");
  const titleDiv = document.getElementById("dayDetailsTitle");
  const tableDiv = document.getElementById("dayDetailsTable");
  const statusDiv = document.getElementById("dayDetailsStatus");
  titleDiv.textContent = `تفاصيل يوم: ${dayLabel}`;
  statusDiv.textContent = "";
  const monthKey = `${year}_${(month + 1).toString().padStart(2, "0")}`;
  db.ref(`dayDetails/${monthKey}/${dayKey}`)
    .once("value")
    .then((snap) => {
      const data = snap.val() || {};
      // استخدم DocumentFragment لتجميع الصفوف
      const fragment = document.createDocumentFragment();
      // رأس الجدول
      const table = document.createElement("table");
      table.className = "day-details-table";
      const thead = document.createElement("thead");
      thead.innerHTML = `<tr><th>الموظف</th><th>الاختيار</th><th>آخر تعديل</th></tr>`;
      table.appendChild(thead);
      const tbody = document.createElement("tbody");
      employees.forEach((emp) => {
        const stored = data[emp] || {};
        const rawVal = stored.value;
        // normalize to two fields: val1, val2
        let val1 = "", val2 = "";
        if (Array.isArray(rawVal)) {
          val1 = rawVal[0] || "";
          val2 = rawVal[1] || "";
        } else if (typeof rawVal === 'object' && rawVal !== null) {
          val1 = rawVal.value1 || rawVal.v1 || "";
          val2 = rawVal.value2 || rawVal.v2 || "";
        } else if (typeof rawVal === 'string') {
          // legacy single value goes to first field
          val1 = rawVal;
          val2 = "";
        }
        const user = data[emp]?.user || "—";
        const time = data[emp]?.time || "—";
        const tr = document.createElement("tr");
        // اسم الموظف
        const tdEmp = document.createElement("td");
        tdEmp.textContent = emp;
        tr.appendChild(tdEmp);
        // قائمة الاختيار - الآن حقلان لكل موظف
        const tdSelect = document.createElement("td");
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.gap = '8px';
        wrapper.style.justifyContent = 'center';
        // create two selects
        for (let idx = 0; idx < 2; idx++) {
          const select = document.createElement("select");
          select.className = "day-details-select";
          select.setAttribute("data-emp", emp);
          select.setAttribute("data-index", String(idx));
          ["—", "600", "22", "مشتركة", "❌"].forEach((optionVal) => {
            const option = document.createElement("option");
            option.value = optionVal === "—" ? "" : optionVal;
            option.textContent = optionVal;
            select.appendChild(option);
          });
          // set selected based on val1/val2
          if (idx === 0 && val1) select.value = val1;
          if (idx === 1 && val2) select.value = val2;
          wrapper.appendChild(select);
        }
        tdSelect.appendChild(wrapper);
        tr.appendChild(tdSelect);
        // آخر تعديل
        const tdEdit = document.createElement("td");
        let userColor =
          user === "admin"
            ? "#1fa745"
            : user === "—"
              ? "#555"
              : "#dc3545";
        function toEnglishDate(str) {
          if (!str || str === "—") return "—";
          return str
            .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
            .replace(/،/g, ",");
        }
        tdEdit.innerHTML = `<span class='day-details-user' style='color:${userColor};font-weight:bold;'>${user}</span><br><span class='day-details-time' style='color:#000;'>${toEnglishDate(
          time
        )}</span>`;
        tr.appendChild(tdEdit);
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      fragment.appendChild(table);
      // زر الحفظ
      const saveBtn = document.createElement("button");
      saveBtn.id = "saveDayDetailsBtn";
      saveBtn.textContent = "💾 حفظ التعديلات";
      saveBtn.style =
        "background:#1976d2;color:white;padding:8px 18px;border:none;border-radius:7px;font-size:16px;margin-top:8px;cursor:pointer;";
      fragment.appendChild(saveBtn);
      tableDiv.innerHTML = "";
      tableDiv.appendChild(fragment);
      modal.style.display = "flex";
      document.getElementById("closeDayDetailsModal").onclick =
        function () {
          modal.style.display = "none";
        };
      saveBtn.onclick = function () {
        const selects = tableDiv.querySelectorAll(".day-details-select");
        const updates = {};
        let changed = false;
        employees.forEach((emp) => {
          const empSelects = Array.from(selects).filter((s) => s.getAttribute("data-emp") === emp).sort((a, b) => a.getAttribute('data-index') - b.getAttribute('data-index'));
          const newV1 = empSelects[0] ? empSelects[0].value : "";
          const newV2 = empSelects[1] ? empSelects[1].value : "";
          const newVal = [newV1, newV2];
          const oldRaw = data[emp]?.value;
          let oldValArr = [];
          if (Array.isArray(oldRaw)) oldValArr = [oldRaw[0] || "", oldRaw[1] || ""];
          else if (typeof oldRaw === 'object' && oldRaw !== null) oldValArr = [oldRaw.value1 || oldRaw.v1 || "", oldRaw.value2 || oldRaw.v2 || ""];
          else if (typeof oldRaw === 'string') oldValArr = [oldRaw, ""];
          else oldValArr = ["", ""];
          const changedForEmp = !(oldValArr[0] === newVal[0] && oldValArr[1] === newVal[1]);
          if (changedForEmp) {
            updates[emp] = {
              value: newVal,
              user: currentUser,
              time: formatDateTimeNoSeconds(new Date()),
            };
            changed = true;
          } else if (data[emp]) {
            updates[emp] = data[emp];
          }
        });
        if (!changed) {
          statusDiv.textContent = "لا يوجد أي تعديل لحفظه.";
          return;
        }
        db.ref(`dayDetails/${monthKey}/${dayKey}`)
          .set(updates)
          .then(() => {
            statusDiv.textContent = "✅ تم حفظ التعديلات";
            setTimeout(() => {
              modal.style.display = "none";
            }, 900);
          })
          .catch((err) => {
            console && console.error && console.error('save dayDetails error', err);
            if (statusDiv) statusDiv.textContent = 'فشل حفظ البيانات: ' + (err && err.message ? err.message : err);
          });
      };
    });
}
// دالة تتحقق أن الشهر المعروض هو الشهر الحالي
function isCurrentMonthSelected() {
  const now = new Date();
  return month === now.getMonth() && year === now.getFullYear();
}

// دالة منع التعديل على الأشهر السابقة
function preventEditIfNotCurrentMonth() {
  if (!isCurrentMonthSelected()) {
    showToast(
      "❌ لا يمكن التعديل أو الحذف أو الإضافة على بيانات الأشهر السابقة.", "warning"
    );
    return false;
  }
  return true;
}
// زر إعدادات الملاحظات (للمدير فقط)
document.getElementById("sidebarNotesSettingsBtn").onclick = function () {
  document.getElementById("sidebarMenu").classList.remove("open");
  setTimeout(showNotesSettingsTab, 100);
};

// نافذة إعدادات الملاحظات
function showNotesSettingsTab() {
  if (currentUserRole !== "admin") {
    alert("غير مصرح لك بإدارة إعدادات الملاحظات.");
    return;
  }
  let modal = document.getElementById("notesSettingsModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "notesSettingsModal";
    modal.style = `position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.18);z-index:8000;display:flex;align-items:center;justify-content:center;`;
    modal.innerHTML = `
        <div style=\"background:#fff;max-width:440px;width:97vw;border-radius:18px;box-shadow:0 8px 32px #0002;padding:30px 18px 18px 18px;position:relative;display:flex;flex-direction:column;animation:fadeIn 0.3s;border:2px solid var(--warning);\">
          <button id=\"closeNotesSettingsBtn\" style=\"position:absolute;top:10px;left:10px;background:#dc3545;color:white;border:none;border-radius:50%;width:32px;height:32px;font-size:18px;cursor:pointer;\">✖</button>
          <div style=\"font-size:20px;color:var(--warning);margin-bottom:18px;font-weight:600;text-align:center;\">⚙️ إعدادات صلاحيات الملاحظات</div>
          <div id=\"notesSettingsContent\" style=\"overflow-y:auto;max-height:60vh;\">جاري التحميل...</div>
        </div>
        
      `;
    document.body.appendChild(modal);
    document.getElementById("closeNotesSettingsBtn").onclick =
      function () {
        modal.remove();
      };
  } else {
    modal.style.display = "flex";
  }
  // تحميل المستخدمين وصلاحياتهم
  db.ref("users")
    .once("value")
    .then((snapshot) => {
      const users = snapshot.val() || {};
      let html = `<table style='width:100%;border-collapse:collapse;margin-bottom:10px;'>
        <tr><th style='background:#f6f6f6;'>المستخدم</th><th style='background:#f6f6f6;'>صلاحية الملاحظات</th></tr>`;
      Object.entries(users).forEach(([username, data]) => {
        if (data.role === "admin" || username === "admin") return;
        const perm = data.notesPermission || "edit";
        html += `<tr>
          <td style='padding:7px 4px;'>${username}</td>
          <td style='padding:7px 4px;'>
            <select data-user='${username}' class='notePermSelect' style='font-size:15px;'>
              <option value='edit' ${perm === "edit" ? "selected" : ""
          }>يستطيع التعديل</option>
              <option value='read' ${perm === "read" ? "selected" : ""
          }>قراءة فقط</option>
              <option value='none' ${perm === "none" ? "selected" : ""
          }>مخفي تمامًا</option>
            </select>
          </td>
        </tr>`;
      });
      html += `</table><div style='font-size:13px;color:#555;'>حدد صلاحية الملاحظات لكل مستخدم. التغيير فوري.</div>`;
      document.getElementById("notesSettingsContent").innerHTML = html;
      Array.from(
        document.getElementsByClassName("notePermSelect")
      ).forEach((sel) => {
        sel.onchange = function () {
          const user = sel.getAttribute("data-user");
          const val = sel.value;
          db.ref("users/" + user + "/notesPermission")
            .set(val)
            .then(() => {
              logActivity(
                "تغيير صلاحية الملاحظات",
                "تم تغيير صلاحية الملاحظات للمستخدم: " +
                user +
                " إلى: " +
                (val === "edit"
                  ? "تعديل"
                  : val === "read"
                    ? "قراءة فقط"
                    : "مخفي")
              );
              updateSidebarVisibility();
            });
        };
      });
    });
}
// زر فتح تبويبة الملاحظات
document.getElementById("sidebarNotesBtn").onclick = function () {
  document.getElementById("sidebarMenu").classList.remove("open");
  setTimeout(showNotesTab, 100);
};

// تبويبة الملاحظات الاحترافية
function showNotesTab() {
  let notesTab = document.getElementById("notesTab");
  if (!notesTab) {
    notesTab = document.createElement("div");
    notesTab.id = "notesTab";
    notesTab.style = `position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.18);z-index:7000;display:flex;align-items:center;justify-content:center;`;
    notesTab.innerHTML = `
        <div style=\"background:#fff;max-width:430px;width:97vw;border-radius:16px;box-shadow:0 8px 32px #0002;padding:28px 18px 18px 18px;position:relative;display:flex;flex-direction:column;animation:fadeIn 0.3s;\">
          <button id=\"closeNotesTabBtn\" style=\"position:absolute;top:10px;left:10px;background:#dc3545;color:white;border:none;border-radius:50%;width:32px;height:32px;font-size:18px;cursor:pointer;\">✖</button>
          <div style=\"font-size:20px;color:#333;margin-bottom:18px;font-weight:600;text-align:center;\">📝 ملاحظات الموظفين</div>
          <div id=\"notesTabContent\" style=\"overflow-y:auto;max-height:60vh;\"></div>
        </div>
        
      `;
    document.body.appendChild(notesTab);
    document.getElementById("closeNotesTabBtn").onclick = function () {
      notesTab.remove();
    };
  } else {
    notesTab.style.display = "flex";
  }
  renderNotesTabContent();
}

// عرض صناديق الملاحظات لكل موظف
function renderNotesTabContent() {
  // إذا تم استدعاء الدالة من نافذة الملاحظات الجانبية، أظهرها هناك، وإلا أظهرها أسفل الجدول
  let notesDiv = document.getElementById("notesTabContent");
  let notesSection = document.getElementById("notesSection");
  if (notesSection && notesSection.style.display !== "none") {
    notesDiv = notesSection.querySelector("#notesTabContent");
  }
  notesDiv.innerHTML = "جاري التحميل...";

  const monthFormatted = String(month + 1).padStart(2, '0');

  // جلب بيانات الملاحظات، الحضور، الرواتب من المسارات الجديدة (الموحدة حسب الشهر)
  Promise.all([
    db.ref(`months/${year}/${monthFormatted}/notes`).once("value"),
    db.ref(`months/${year}/${monthFormatted}/attendance`).once("value"),
    db.ref(`months/${year}/${monthFormatted}/salary`).once("value"),
    db.ref("users/" + currentUser).once("value"),
  ]).then(([notesSnap, attSnap, salSnap, userSnap]) => {
    const notes = notesSnap.val() || {};
    const attendance = attSnap.val() || {};
    const salaries = salSnap.val() || {};
    const userData = userSnap.val() || {};
    const perm = userData.notesPermission || "edit";
    // حساب إحصائيات الحضور لكل موظف
    const stats = {};
    employees.forEach((emp) => {
      stats[emp] = { shift: 0, half: 0, vac: 0 };
    });
    // البيانات الآن من المسار الجديد (months/{year}/{month}/attendance)
    // تصيغة البيانات: { "2026-01-15": { emp001: "حاضر", emp002: "نص" }, ... }
    Object.entries(attendance).forEach(([dateStr, dayData]) => {
      // جميع البيانات هنا بالفعل مفلترة للشهر الحالي من المسار الجديد
      if (dayData && typeof dayData === 'object') {
        employees.forEach((emp) => {
          const val = dayData[emp];
          if (val === "شفت") stats[emp].shift++;
          if (val === "نص") stats[emp].half++;
          if (val === "❌") stats[emp].vac++;
        });
      }
    });
    let html = "";
    employees.forEach((emp) => {
      let noteData = notes[emp];
      let noteText = "";
      let lastUser = "—";
      let lastTime = "—";
      let lastRole = "user";

      if (noteData && typeof noteData === 'object') {
        noteText = noteData.text || "";
        lastUser = noteData.user || "—";
        lastTime = noteData.time || "—";
        lastRole = noteData.role || "user";
      } else {
        noteText = noteData ? noteData : "";
      }

      let isEmpty = noteText.trim() === "";
      let userColor = lastRole === "admin" ? "#1fa745" : "#dc3545";

      html += `<div class="note-box" style="border:1.5px solid #e3eafc; margin:18px 0 22px 0; border-radius:13px; background:linear-gradient(135deg,#f8fafc 70%,#e3eafc 100%); box-shadow:0 2px 12px #3f51b511; transition:box-shadow 0.2s;">`;
      // اسم الموظف
      html += `<div style=\"font-weight:700; color:var(--primary); font-size:18px; padding:13px 16px 0 16px; letter-spacing:0.2px;\">👤 ${emp}</div>`;
      // خانة الملاحظة وزر الحفظ
      if (perm === "edit") {
        html += `<textarea id='noteInput_${emp}' style='width:94%;min-height:60px;margin:13px 3%;border-radius:8px;border:1.2px solid #bfc7e3;padding:9px;font-size:15.5px;resize:vertical;background:#fff;transition:border 0.2s;'>${noteText}</textarea>`;
        html += `<div style='display:flex;align-items:center;justify-content:space-between;margin:0 3% 13px 3%;gap:10px;'>`;
        html += isEmpty
          ? `<span style='color:#b0b0b0;font-size:13px;display:flex;align-items:center;gap:3px;'><span style='font-size:17px;'>🛈</span>لا توجد ملاحظة بعد</span>`
          : `<div style='display:flex;flex-direction:column;gap:1px;flex:1;'>
               <span style='color:${userColor};font-size:12px;font-weight:700;display:flex;align-items:center;gap:4px;'>
                 <span style='font-size:14px;'>👤</span>${lastUser}
               </span>
               <span style='color:#607d8b;font-size:10px;display:flex;align-items:center;gap:4px;opacity:0.8;'>
                 <span style='font-size:14px;'>🕒</span>${lastTime}
               </span>
             </div>`;
        html += `<button class='saveNoteBtn' data-emp='${emp}' style='background:var(--primary);color:white;padding:6px 14px;border:none;border-radius:8px;font-size:13px;cursor:pointer;box-shadow:0 2px 6px #3f51b522;font-weight:600;min-width:70px;flex-shrink:0;'>💾 حفظ</button>`;
        html += `</div>`;
      } else if (perm === "read") {
        html += `<textarea id='noteInput_${emp}' style='width:94%;min-height:60px;margin:13px 3%;border-radius:8px;border:1.2px solid #bfc7e3;padding:9px;font-size:15.5px;background:#f5f7fa;resize:vertical;' readonly>${noteText}</textarea>`;
        html += isEmpty
          ? `<div style='color:#b0b0b0;font-size:13px;padding:0 3% 13px 3%;display:flex;align-items:center;gap:3px;'><span style='font-size:17px;'>🛈</span>لا توجد ملاحظة بعد</div>`
          : `<div style='padding:0 3% 13px 3%;display:flex;flex-direction:column;gap:1px;'>
               <span style='color:${userColor};font-size:12px;font-weight:700;display:flex;align-items:center;gap:4px;'>
                 <span style='font-size:14px;'>👤</span>${lastUser}
               </span>
               <span style='color:#607d8b;font-size:10px;display:flex;align-items:center;gap:4px;opacity:0.8;'>
                 <span style='font-size:14px;'>🕒</span>${lastTime}
               </span>
             </div>`;
      } else {
        html += `<div style='color:#888;font-size:14px;padding:13px;'>لا يوجد صلاحية لعرض الملاحظات</div>`;
      }
      html += `</div>`;
    });
    notesDiv.innerHTML = html;
    // إذا كنا في القسم أسفل الجدول، أظهر القسم
    if (notesSection) notesSection.style.display = "block";
    if (perm === "edit") {
      Array.from(document.getElementsByClassName("saveNoteBtn")).forEach(
        (btn) => {
          btn.onclick = function () {
            const emp = btn.getAttribute("data-emp");
            const noteVal = document.getElementById(
              `noteInput_${emp}`
            ).value;
            const monthFormatted = String(month + 1).padStart(2, '0');
            const payload = {
              text: noteVal,
              user: currentUser,
              role: currentUserRole,
              time: formatDateTimeNoSeconds(new Date())
            };
                db.ref(`months/${year}/${monthFormatted}/notes/${emp}`)
                  .set(payload)
                  .then(() => {
                    showToast("✅ تم حفظ الملاحظة بنجاح", "success");
                    // إعادة رندر المحتوى لتحديث اسم المستخدم والوقت فوراً
                    renderNotesTabContent();
                  })
                  .catch(err => {
                    showToast("❌ فشل حفظ الملاحظة", "error");
                  });
                logActivity(
                  "تعديل ملاحظة موظف",
                  `<span style='color:#007bff;font-weight:bold;'>${emp}</span> | <span style='color:#ffb300;'>${noteVal
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")}</span>`,
                  { type: "note", emp: emp }
                );
          };
        }
      );
    }
  });
}
// عرض الملاحظات أسفل الجدول تلقائياً بعد تحميل الصفحة إذا كان للمستخدم صلاحية
document.addEventListener("DOMContentLoaded", function () {
  // هجرة كلمات المرور القديمة تلقائيًا عند بدء النظام
  if (typeof migrateAllPlaintextUsers === "function") {
    migrateAllPlaintextUsers();
  }
  db.ref("users/" + currentUser)
    .once("value")
    .then((snap) => {
      const data = snap.val() || {};
      const perm = data.notesPermission || "edit";
      if (perm === "edit" || perm === "read") {
        let notesSection = document.getElementById("notesSection");
        if (notesSection) {
          notesSection.style.display = "block";
          renderNotesTabContent();
        }
      }
    });
});
// تحديث ظهور الأزرار حسب الدور وصلاحية المستخدم
function updateSidebarVisibility() {
  const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
  const sidebarMenu = document.getElementById("sidebarMenu");
  const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
  const isAdmin = currentUserRole === "admin";
  try { const maintenanceSection = document.getElementById('maintenanceControl'); if (maintenanceSection) maintenanceSection.style.display = isAdmin ? 'block' : 'none'; } catch (e) { }
  try { const salarySection = document.getElementById('salaryAdminSection'); if (salarySection) salarySection.style.display = hasPermission('salary') ? 'block' : 'none'; } catch (e) { }
  // Show/hide advances admin section and bind add-button safely
  try {
    const advancesSection = document.getElementById('advancesAdminSection');
    const addBtn = document.getElementById('openAddAdvanceBtn');
    if (advancesSection) advancesSection.style.display = hasPermission('advances') ? 'block' : 'none';
    if (addBtn) {
      addBtn.style.display = hasPermission('advances') ? 'inline-block' : 'none';
      addBtn.onclick = function () {
        if (typeof openAddAdvanceForm === 'function') return openAddAdvanceForm();
        // if function not defined yet (load order), try shortly after
        setTimeout(() => { if (typeof openAddAdvanceForm === 'function') openAddAdvanceForm(); }, 200);
      };
    }
  } catch (e) {
    console.warn('Advances visibility update failed', e);
  }
  // أزرار المدير فقط المتبقية
  [
    "sidebarMonthsManagerBtn",
    "sidebarEmpStatsBtn",
    "sidebarDeleteDataBtn",
    "sidebarChangePassBtn",
    "sidebarUserControlBtn",
    "sidebarNotesSettingsBtn",
    "sidebarNotificationsBtn",
    "sidebarPrintTelegramBtn",
  ].forEach((id) => {
    try {
      const el = document.getElementById(id);
      if (el) el.style.display = isAdmin ? "block" : "none";
    } catch (e) { }
  });

  try {
    const sidebarFeaturesTabBtn = document.getElementById("sidebarFeaturesTabBtn");
    if (sidebarFeaturesTabBtn) {
      const canViewLog = window.currentUserData && window.currentUserData.canViewLog === true;
      if (isAdmin || canViewLog) {
        sidebarFeaturesTabBtn.style.display = "block";
        sidebarFeaturesTabBtn.onclick = () => {
          document.getElementById("sidebarMenu").classList.remove("open");
          openActivityLogModal();
        };
      } else {
        sidebarFeaturesTabBtn.style.display = "none";
      }
    }
  } catch (e) {
    console.warn("Features tab button visibility update failed", e);
  }

  try {
    const sidebarAdminBtn = document.getElementById("sidebarAdminBtn");
    const canAdmin = hasPermission('staff') || hasPermission('advances') || hasPermission('salary') || isAdmin;
    if (sidebarAdminBtn) sidebarAdminBtn.style.display = canAdmin ? "block" : "none";
  } catch (e) { }
  // إخفاء قسم إعدادات تيليجرام للمستخدمين العاديين
  try {
    const telegramSection = document.getElementById('telegramSettings');
    if (telegramSection) telegramSection.style.display = isAdmin ? 'block' : 'none';
  } catch (e) { }
  // ربط أحداث الأزرار
  try {
    // زر الإشعارات للمدير
    const notificationsBtn = document.getElementById("sidebarNotificationsBtn");
    if (notificationsBtn) {
      notificationsBtn.onclick = function () {
        document.getElementById("sidebarMenu").classList.remove("open");
        setTimeout(showNotificationsManager, 100);
      };
    }
  } catch (e) { }

  function showNotificationsManager() {
    let modal = document.getElementById("notificationsManagerModal");
    if (modal) {
      modal.style.display = "flex";
      return;
    }
    modal = document.createElement("div");
    modal.id = "notificationsManagerModal";
    modal.style = `position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.18);z-index:9100;display:flex;align-items:center;justify-content:center;`;
    modal.innerHTML = `
    <div style="background:#fff;max-width:420px;width:97vw;border-radius:18px;box-shadow:0 8px 32px #0002;padding:28px 18px 18px 18px;position:relative;display:flex;flex-direction:column;animation:fadeIn 0.3s;">
      <button id="closeNotificationsManagerBtn" style="position:absolute;top:10px;left:10px;background:#dc3545;color:white;border:none;border-radius:50%;width:32px;height:32px;font-size:18px;cursor:pointer;">✖</button>
      <div style="font-size:21px;color:#ff4081;margin-bottom:10px;font-weight:700;text-align:center;letter-spacing:0.2px;">🔔 إرسال إشعار</div>
      <div style="margin-bottom:10px;">
        <label style="font-size:15px;font-weight:500;">المستلم:
          <select id="notificationTarget" multiple style="width:100%;padding:7px 8px;border-radius:6px;border:1px solid #ccc;font-size:15px;margin-top:5px;min-height:38px;max-height:120px;overflow:auto;"></select>
          <div style="font-size:12px;color:#888;margin-top:3px;">يمكنك اختيار أكثر من موظف بالضغط مع Ctrl أو Shift</div>
        </label>
      </div>
      <textarea id="notificationMsg" placeholder="اكتب نص الإشعار هنا..." style="width:100%;min-height:60px;border-radius:7px;border:1px solid #ccc;padding:7px;font-size:15px;margin-bottom:10px;"></textarea>
      <button id="sendNotificationBtn" style="background:#ff4081;color:white;padding:9px 0;border:none;border-radius:8px;font-size:17px;cursor:pointer;font-weight:600;">إرسال الإشعار</button>
    </div>
    
  `;
    document.body.appendChild(modal);
    document.getElementById("closeNotificationsManagerBtn").onclick =
      function () {
        modal.style.display = "none";
      };
    // تحميل المستخدمين
    db.ref("users")
      .once("value")
      .then((snap) => {
        const users = snap.val() || {};
        let sel = document.getElementById("notificationTarget");
        sel.innerHTML = `<option value="all">جميع المستخدمين</option>`;
        Object.keys(users).forEach((u) => {
          if (u !== "admin")
            sel.innerHTML += `<option value="${u}">${u}</option>`;
        });
      });
    document.getElementById("sendNotificationBtn").onclick =
      function () {
        const sel = document.getElementById("notificationTarget");
        const selected = Array.from(sel.selectedOptions).map(
          (opt) => opt.value
        );
        const msg = document
          .getElementById("notificationMsg")
          .value.trim();
        if (!msg) return alert("❌ يرجى كتابة نص الإشعار");
        const notif = { msg, time: Date.now(), from: currentUser };
        if (selected.includes("all")) {
          db.ref("notifications/all")
            .set(notif)
            .then(() => {
              alert("✅ تم إرسال الإشعار للجميع");
              modal.style.display = "none";
            });
        } else if (selected.length > 0) {
          let promises = selected.map((u) =>
            db.ref("notifications/" + u).set(notif)
          );
          Promise.all(promises).then(() => {
            alert("✅ تم إرسال الإشعار للموظفين المحددين");
            modal.style.display = "none";
          });
        } else {
          alert("❌ يرجى اختيار مستلم واحد على الأقل");
        }
      };
  }
  // مراقبة الإشعارات لحظياً للمستخدم الحالي
  window.listenForNotifications = function listenForNotifications() {
    if (!currentUser) return;
    // تجاهل استقبال الإشعارات للمدير
    if (currentUser === "admin") return;
    // إشعار مخصص للمستخدم
    db.ref("notifications/" + currentUser).on("value", (snap) => {
      const notif = snap.val();
      if (notif)
        showNotificationPopup(notif, () => {
          db.ref("notifications/" + currentUser).remove();
        });
    });
    // إشعار عام للجميع
    db.ref("notifications/all").on("value", (snap) => {
      const notif = snap.val();
      if (notif)
        showNotificationPopup(notif, () => {
          db.ref("notifications/all").remove();
        });
    });
  };

  // نافذة منبثقة احترافية للإشعار
  function showNotificationPopup(notif, onOk) {
    let old = document.getElementById("notificationPopup");
    if (old) old.remove();
    const modal = document.createElement("div");
    modal.id = "notificationPopup";
    modal.style = `position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.18);z-index:12000;display:flex;align-items:center;justify-content:center;`;
    let sender = notif.from === "admin" ? "المدير" : notif.from || "";
    modal.innerHTML = `
    <div style="background:linear-gradient(135deg,#e8eaf6 60%,#c5cae9 100%);max-width:370px;width:92vw;padding:32px 20px 22px 20px;border-radius:18px;box-shadow:0 8px 32px #3f51b522;position:relative;text-align:center;animation:fadeIn 0.3s;">
      <button id="closeNotifPopupBtn" style="position:absolute;top:10px;left:10px;background:#3f51b5;color:white;border:none;border-radius:50%;width:32px;height:32px;font-size:18px;cursor:pointer;">✖</button>
      <div style="font-size:21px;color:#3f51b5;margin-bottom:18px;font-weight:700;letter-spacing:0.2px;">🔔 إشعار من ${sender}</div>
      <div style="font-size:16.5px;color:#2d3a4a;line-height:1.8;margin-bottom:16px;background:#e3eafc;border-radius:8px;padding:10px 7px 8px 7px;box-shadow:0 1px 4px #3f51b511;">${notif.msg
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</div>
      <button id="notifOkBtn" style="background:linear-gradient(90deg,#3f51b5 60%,#5c6bc0 100%);color:white;padding:11px 0;border:none;border-radius:8px;font-size:17px;cursor:pointer;box-shadow:0 2px 8px #3f51b522;width:90%;margin-top:8px;font-weight:600;transition:background 0.2s;">حسنًا</button>
    </div>
    
  `;
    document.body.appendChild(modal);
    document.getElementById("notifOkBtn").onclick = () => {
      modal.remove();
      if (onOk) onOk();
    };
    document.getElementById("closeNotifPopupBtn").onclick = () => {
      modal.remove();
      if (onOk) onOk();
    };
  }
  // نافذة إدارة الأشهر الاحترافية
  try {
    const monthsManagerBtn = document.getElementById("sidebarMonthsManagerBtn");
    if (monthsManagerBtn) {
      monthsManagerBtn.onclick = function () {
        document.getElementById("sidebarMenu").classList.remove("open");
        setTimeout(showMonthsManagerModal, 100);
      };
    }
  } catch (e) {
    console.warn('خطأ في ربط زر إدارة الأشهر:', e);
  }

  function showMonthsManagerModal() {
    let modal = document.getElementById("monthsManagerModal");
    if (modal) {
      modal.style.display = "flex";
      return;
    }
    modal = document.createElement("div");
    modal.id = "monthsManagerModal";
    modal.style = `position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.18);z-index:9000;display:flex;align-items:center;justify-content:center;`;
    modal.innerHTML = `
    <div id="monthsManagerModalInner" style="background:#fff;max-width:480px;width:97vw;border-radius:18px;box-shadow:0 8px 32px #0002;padding:24px 10px 14px 10px;position:relative;display:flex;flex-direction:column;animation:fadeIn 0.3s;">
      <button id="closeMonthsManagerBtn" style="position:absolute;top:10px;left:10px;background:#dc3545;color:white;border:none;border-radius:50%;width:32px;height:32px;font-size:18px;cursor:pointer;">✖</button>
      <div style="font-size:21px;color:#1976d2;margin-bottom:10px;font-weight:700;text-align:center;letter-spacing:0.2px;">📅 إدارة الأشهر</div>
      <div id="monthsManagerContent" style="overflow-x:auto;max-height:60vh;padding-bottom:4px;">جاري التحميل...</div>
      <div style="margin-top:12px;text-align:center;display:flex;flex-wrap:wrap;gap:7px;justify-content:center;">
        <button id="addNewMonthBtn" style="background:#1976d2;color:white;padding:10px 16px;border:none;border-radius:8px;font-size:16px;cursor:pointer;">➕ إضافة شهر</button>
        <button id="toggleAutoMonthBtn" style="background:#ffb300;color:#333;padding:10px 16px;border:none;border-radius:8px;font-size:16px;cursor:pointer;">—</button>
      </div>
      <div style="font-size:13px;color:#888;margin-top:10px;text-align:center;">يمكنك إدارة الأشهر، إغلاقها، إخفائها، إضافة ملاحظات، نسخ أو حذف شهر، والمزيد من هنا.</div>
    </div>
    
  `;
    document.body.appendChild(modal);
    document.getElementById("closeMonthsManagerBtn").onclick =
      function () {
        modal.style.display = "none";
      };
    loadMonthsManagerContent();
  }

  function loadMonthsManagerContent() {
    const contentDiv = document.getElementById("monthsManagerContent");
    contentDiv.innerHTML = '<div style="text-align:center;padding:10px;color:#888;">جاري التحميل...</div>';

    Promise.all([
      db.ref("monthsSettings").once("value"),
      db.ref("months").once("value"),
      db.ref("activityLog").once("value"),
    ]).then(([
      settingsSnap,
      monthsSnap,
      logSnap,
    ]) => {
      try {
        const settings = settingsSnap.val() || {
          auto: true,
          closed: {},
          hidden: {},
        };
        const monthsTree = monthsSnap.val() || {};
        const activityLog = logSnap.val() || {};

        // دمج الموظفين من جميع الأشهر
        const allEmployees = {};
        const monthsNotes = {};
        const monthsSet = new Set();

        Object.entries(monthsTree || {}).forEach(([y, monthsObj]) => {
          Object.entries(monthsObj || {}).forEach(([mm, monthObj]) => {
            // mm is expected as "01".."12"
            const mmNum = parseInt(mm);
            if (isNaN(mmNum)) return;
            const mKey = `${y}-${mmNum - 1}`; // match existing key format (year - zeroBasedMonth)
            monthsSet.add(mKey);

            if (monthObj && monthObj.employees) {
              Object.entries(monthObj.employees).forEach(([id, val]) => {
                const name = typeof val === "string" ? val : val.name || "";
                if (name) allEmployees[id] = name;
              });
            }

            // collect month notes summary (store object or empty)
            monthsNotes[mKey] = (monthObj && monthObj.notes) ? monthObj.notes : {};
          });
        });

        // إضافة الأشهر اليدوية
        if (settings.manual && Array.isArray(settings.manual)) {
          settings.manual.forEach((m) => {
            if (typeof m === 'string' && /^\d{4}-\d{1,2}$/.test(m)) {
              monthsSet.add(m);
            }
          });
        }

        // فرز الأشهر من الأقدم للأحدث
        const monthsArr = Array.from(monthsSet).sort((a, b) => {
          const [ya, ma] = a.split("-").map(Number);
          const [yb, mb] = b.split("-").map(Number);
          return ya !== yb ? yb - ya : mb - ma;  // تنازلي
        });

        if (monthsArr.length === 0) {
          contentDiv.innerHTML = '<div style="text-align:center;padding:20px;color:#aaa;">لا توجد بيانات أشهر حتى الآن</div>';
          return;
        }

        let html = `<table style='width:100%;border-collapse:collapse;margin-bottom:10px;'>
                <tr>
                  <th style="width:40%;">الشهر</th>
                  <th style="width:20%;">الحالة</th>
                  <th style="width:15%;">إغلاق</th>
                  <th style="width:15%;">إخفاء</th>
                  <th style="width:10%;">خيارات</th>
                </tr>`;

        monthsArr.forEach((m) => {
          const [y, mo] = m.split("-");
          const yNum = parseInt(y);
          const moNum = parseInt(mo);

          if (isNaN(yNum) || isNaN(moNum) || moNum < 0 || moNum > 11) {
            console.warn('شهر غير صحيح:', m);
            return;
          }

          const label = `${arMonths[moNum]} ${y}`;
          const isClosed = settings.closed && settings.closed[m];
          const isHidden = settings.hidden && settings.hidden[m];
          const isDefault = settings.defaultMonth === m;

          // استخدم monthsTree للحصول على بيانات هذا الشهر
          const mmKey = (moNum + 1).toString().padStart(2, "0");
          const monthObj = (monthsTree[y] && monthsTree[y][mmKey]) || {};
          const empCount = monthObj.employees ? Object.keys(monthObj.employees).length : 0;
          const daysCount = monthObj.attendance ? Object.keys(monthObj.attendance).length : 0;

          const statusColor = isClosed ? '#d32f2f' : '#388e3c';
          const statusText = isClosed ? 'مغلق' : 'مفتوح';

          html += `<tr style="border-bottom:1px solid #e0e0e0;hover:background:#f5f5f5;">
                  <td style="padding:10px 8px;">
                    <span style="font-weight:bold;color:#1976d2;">${label}</span><br>
                    <span style="font-size:12px;color:#888;">👥 ${empCount} | 📅 ${daysCount}</span>
                    ${isDefault ? '<br><span style="color:#1976d2;font-size:11px;font-weight:bold;">⭐ افتراضي</span>' : ''}
                  </td>
                  <td style="padding:10px 8px;">
                    <span style="color:${statusColor};font-weight:bold;font-size:14px;">${statusText}</span>
                  </td>
                  <td style="padding:10px 8px;text-align:center;">
                    <input type='checkbox' data-month='${m}' class='closeMonthChk' ${isClosed ? 'checked' : ''} title="قفل الشهر">
                  </td>
                  <td style="padding:10px 8px;text-align:center;">
                    <input type='checkbox' data-month='${m}' class='hideMonthChk' ${isHidden ? 'checked' : ''} title="إخفاء الشهر">
                  </td>
                  <td style="padding:10px 4px;text-align:center;">
                    <button class='advMonthBtn' data-month='${m}' style='background:#1976d2;color:white;font-size:12px;padding:4px 8px;border-radius:4px;border:none;cursor:pointer;'>⚙️</button>
                  </td>
                </tr>`;
        });

        html += `</table>`;
        contentDiv.innerHTML = html;

        // ربط أحداث إغلاق الشهر
        Array.from(document.getElementsByClassName("closeMonthChk")).forEach((chk) => {
          chk.onchange = function () {
            const m = chk.getAttribute("data-month");
            const status = chk.checked ? 'مغلق' : 'مفتوح';
            db.ref("monthsSettings/closed/" + m).set(chk.checked).then(() => {
              logActivity("تغيير حالة الشهر", `تم تغيير حالة الشهر إلى ${status}`);
            }).catch(err => {
              console.error('خطأ في تحديث حالة الشهر:', err);
              chk.checked = !chk.checked;  // استرجاع الحالة القديمة
              alert('❌ فشل تحديث حالة الشهر');
            });
          };
        });

        // ربط أحداث إخفاء الشهر
        Array.from(document.getElementsByClassName("hideMonthChk")).forEach((chk) => {
          chk.onchange = function () {
            const m = chk.getAttribute("data-month");
            const status = chk.checked ? 'مخفي' : 'مرئي';
            db.ref("monthsSettings/hidden/" + m).set(chk.checked).then(() => {
              logActivity("تغيير رؤية الشهر", `تم تغيير رؤية الشهر إلى ${status}`);
            }).catch(err => {
              console.error('خطأ في تحديث رؤية الشهر:', err);
              chk.checked = !chk.checked;
              alert('❌ فشل تحديث رؤية الشهر');
            });
          };
        });

        // ربط أزرار الخيارات المتقدمة
        Array.from(document.getElementsByClassName("advMonthBtn")).forEach((btn) => {
          btn.onclick = function () {
            const m = btn.getAttribute("data-month");
            showMonthAdvancedOptions(
              m,
              monthsArr,
              settings,
              monthsTree,
              allEmployees,
              monthsNotes,
              activityLog
            );
          };
        });
      } catch (error) {
        console.error('خطأ في تحميل بيانات الأشهر:', error);
        contentDiv.innerHTML = '<div style="color:#d32f2f;padding:10px;">❌ حدث خطأ في تحميل البيانات</div>';
      }
    }).catch(err => {
      console.error('خطأ في جلب بيانات الأشهر:', err);
      contentDiv.innerHTML = '<div style="color:#d32f2f;padding:10px;">❌ خطأ في الاتصال بقاعدة البيانات</div>';
    });

    // زر إضافة شهر جديد
    document.getElementById("addNewMonthBtn").onclick = function () {
      const targetStr = prompt("أدخل السنة والشهر الذي تريد إضافته\nمثال: 2026-5 (مايو 2026)\n\n(استخدم 1-12 للأشهر: 1=يناير، 2=فبراير، ... 12=ديسمبر)");
      if (!targetStr) return;

      if (!/^\d{4}-\d{1,2}$/.test(targetStr)) {
        alert("❌ صيغة غير صحيحة\nالرجاء إدخال السنة ثم شرطة ثم رقم الشهر، مثال: 2026-5");
        return;
      }

      const [tgtY, tgtMo] = targetStr.split("-");
      const tgtMoNum = parseInt(tgtMo);

      if (tgtMoNum < 1 || tgtMoNum > 12) {
        alert("❌ رقم الشهر يجب أن يكون بين 1 و 12");
        return;
      }

      // تحويل لصيغة المفتاح القديم (السنة-الشهر بدءاً من 0)
      const key = `${tgtY}-${tgtMoNum - 1}`;
      
      db.ref("monthsSettings/manual")
        .once("value")
        .then((snap) => {
          let arr = snap.val() || [];
          if (!Array.isArray(arr)) arr = [];
          if (!arr.includes(key)) {
            arr.push(key);
            db.ref("monthsSettings/manual")
              .set(arr)
              .then(() => {
                logActivity("إضافة شهر", `تم إضافة شهر يدوي: ${arMonths[tgtMoNum - 1]} ${tgtY}`);
                loadMonthsManagerContent();
              })
              .catch(err => {
                console.error('خطأ في إضافة الشهر:', err);
                alert('❌ فشل إضافة الشهر');
              });
          } else {
            alert('⚠️ الشهر موجود بالفعل في النظام');
          }
        });
    };

    // زر تفعيل/تعطيل الوضع التلقائي
    db.ref("monthsSettings/auto")
      .once("value")
      .then((snap) => {
        const auto = snap.val() !== false;
        const btn = document.getElementById("toggleAutoMonthBtn");
        btn.textContent = auto
          ? "🔄 تلقائي: مفعل"
          : "⏸️ تلقائي: معطل";
        btn.style.background = auto ? "#4caf50" : "#f44336";
        btn.style.color = "#fff";
        btn.onclick = function () {
          db.ref("monthsSettings/auto")
            .set(!auto)
            .then(() => {
              logActivity("تغيير الوضع التلقائي", auto ? "تم تعطيل الوضع التلقائي" : "تم تفعيل الوضع التلقائي");
              loadMonthsManagerContent();
            })
            .catch(err => {
              console.error('خطأ في تغيير الوضع:', err);
              alert('❌ فشل تغيير الوضع');
            });
        };
      })
      .catch(err => {
        console.error('خطأ في جلب الوضع التلقائي:', err);
      });
  }

  // نافذة الخيارات المتقدمة لكل شهر - محسنة جداً
  function showMonthAdvancedOptions(
    m,
    monthsArr,
    settings,
    monthsTree,
    allEmployees,
    monthsNotes,
    activityLog
  ) {
    let advModal = document.getElementById("monthAdvModal");
    if (advModal) advModal.remove();

    advModal = document.createElement("div");
    advModal.id = "monthAdvModal";
    advModal.style = "position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.3);z-index:9500;display:flex;align-items:center;justify-content:center;";

    const [y, mo] = m.split("-");
    const yNum = parseInt(y);
    const moNum = parseInt(mo);

    if (isNaN(yNum) || isNaN(moNum)) {
      alert('❌ شهر غير صحيح');
      return;
    }

    const label = `${arMonths[moNum]} ${y}`;
    const mmKey = (moNum + 1).toString().padStart(2, "0");
    const monthObj = (monthsTree[y] && monthsTree[y][mmKey]) || {};
    let empCount = monthObj.employees ? Object.keys(monthObj.employees).length : 0;
    let daysCount = monthObj.attendance ? Object.keys(monthObj.attendance).length : 0;

    let note = monthsNotes[m] || "";
    let isClosed = settings.closed && settings.closed[m];
    let isHidden = settings.hidden && settings.hidden[m];
    let isDefault = settings.defaultMonth === m;
    let closeMsg = (settings.closeMsg && settings.closeMsg[m]) || "";

    // سجل النشاطات لهذا الشهر
    let monthLog = Object.entries(activityLog || {})
      .map(([k, v]) => v)
      .filter((l) => l && (l.month === m || (l.details && l.details.includes(m))))
      .slice(-10)  // آخر 10 نشاطات
      .reverse();

    advModal.innerHTML = `
            <div style="background:#fff;max-width:500px;width:97vw;border-radius:16px;box-shadow:0 10px 40px #0003;padding:28px 20px 20px 20px;position:relative;display:flex;flex-direction:column;animation:fadeIn 0.3s;max-height:90vh;overflow-y:auto;">
              <button id="closeMonthAdvModalBtn" style="position:absolute;top:12px;left:12px;background:#dc3545;color:white;border:none;border-radius:50%;width:32px;height:32px;font-size:18px;cursor:pointer;transition:all 0.2s;">✖</button>
              
              <div style="font-size:22px;color:#1976d2;margin-bottom:4px;font-weight:700;text-align:center;">⚙️ إدارة: ${label}</div>
              <div style="font-size:13px;color:#888;margin-bottom:16px;text-align:center;">👥 ${empCount} موظف | 📅 ${daysCount} يوم</div>
              
              <!-- إعدادات أساسية -->
              <div style="background:#f5f7fa;border:1px solid #e0e6ed;border-radius:10px;padding:14px;margin-bottom:14px;">
                <div style="font-size:14px;color:#1976d2;font-weight:bold;margin-bottom:10px;">📌 إعدادات أساسية</div>
                <div style="margin-bottom:10px;">
                  <label style="font-size:12px;font-weight:600;color:#555;">اسم الشهر:</label>
                  <div style="display:flex;gap:8px;margin-top:4px;flex-wrap:wrap;">
                    <input id="renameMonthInput" type="text" value="${label}" style="flex:1;min-width:120px;padding:8px;border-radius:6px;border:1px solid #cdd4e0;font-size:14px;box-sizing:border-box;">
                    <button id="renameMonthBtn" style="background:#1976d2;color:white;padding:8px 14px;border:none;border-radius:6px;cursor:pointer;font-weight:500;white-space:nowrap;">تحديث</button>
                  </div>
                </div>
                <button id="setDefaultMonthBtn" style="width:100%;background:${isDefault ? '#4caf50' : '#e0e6ed'};color:${isDefault ? '#fff' : '#333'};padding:10px;border:none;border-radius:6px;cursor:pointer;font-weight:600;font-size:13px;transition:0.2s;">
                  ${isDefault ? '✅ هذا هو الشهر الافتراضي حالياً' : '⭐ تعيين كشهر افتراضي'}
                </button>
              </div>
              
              <!-- إدارة البيانات -->
              <div style="background:#fff3e0;border:1px solid #ffe0b2;border-radius:10px;padding:14px;margin-bottom:14px;">
                <div style="font-size:14px;color:#f57c00;font-weight:bold;margin-bottom:10px;">🔄 إدارة البيانات</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                  <button id="exportMonthBtn" style="background:#fb8c00;color:white;padding:10px;border:none;border-radius:6px;cursor:pointer;font-weight:500;font-size:13px;white-space:nowrap;">📥 تصدير ملف</button>
                  <button id="importMonthBtn" style="background:#f57c00;color:white;padding:10px;border:none;border-radius:6px;cursor:pointer;font-weight:500;font-size:13px;white-space:nowrap;">📤 استيراد ملف</button>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">
                  <button id="copyMonthBtn" style="background:#ff9800;color:white;padding:10px;border:none;border-radius:6px;cursor:pointer;font-weight:500;font-size:13px;">📋 نسخ كل شيء</button>
                  <button id="copyEmployeesOnlyBtn" style="background:#ffb74d;color:white;padding:10px;border:none;border-radius:6px;cursor:pointer;font-weight:500;font-size:13px;">👥 استنساخ الموظفين فقط</button>
                </div>
              </div>
              
              <!-- منطقة الخطر -->
              <div style="background:#ffebee;border:1px solid #ffcdd2;border-radius:10px;padding:14px;margin-bottom:14px;">
                <div style="font-size:14px;color:#d32f2f;font-weight:bold;margin-bottom:10px;">⚠️ منطقة الخطر</div>
                <button id="deleteMonthBtn" style="width:100%;background:#d32f2f;color:white;padding:10px;border:none;border-radius:6px;cursor:pointer;font-weight:600;font-size:13px;">🗑️ حذف هذا الشهر نهائياً</button>
                ${isHidden ? '<button id="restoreMonthBtn" style="width:100%;margin-top:8px;background:#388e3c;color:white;padding:10px;border:none;border-radius:6px;cursor:pointer;font-weight:600;font-size:13px;">🔄 استعادة الشهر المخفي</button>' : ''}
              </div>
              
              <!-- سجل النشاطات -->
              <div style="font-size:14px;color:#555;font-weight:bold;margin-bottom:8px;padding-right:4px;">📋 آخر النشاطات</div>
              
              <div class="activity-table-wrapper">
                <table class="activity-table">
                  <thead>
                    <tr>
                      <th style="width:18%;">الوقت</th>
                      <th style="width:18%;">المستخدم</th>
                      <th style="width:24%;">النشاط</th>
                      <th style="width:40%;">الوصف</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${monthLog.length
        ? monthLog.map((l) => {
          const timeISO = l.time || '';
          let timeStr = '';
          try { const d = new Date(timeISO || (l.ts || l.timeStamp || Date.now())); if (!isNaN(d)) timeStr = d.toLocaleString('ar'); } catch (e) { }
          const user = l.user || 'نظام';
          const action = l.action || (l.type || 'نشاط');
          const desc = l.details || l.desc || l.description || '-';
          return (`<tr><td class='activity-time'>${timeStr}</td><td><span class='activity-user-badge'>${user}</span></td><td class='activity-action'>${action}</td><td class='activity-desc' title='${desc}'>${desc}</td></tr>`);
        }).join('')
        : '<tr><td colspan="4" style="text-align:center;color:#aaa;padding:20px;">لا توجد نشاطات</td></tr>'
      }
                  </tbody>
                </table>
              </div>
              </div>
            </div>
          `;

    document.body.appendChild(advModal);

    document.getElementById("closeMonthAdvModalBtn").onclick = function () {
      advModal.remove();
    };

    // تحديث اسم الشهر
    document.getElementById("renameMonthBtn").onclick = function () {
      const newName = document.getElementById("renameMonthInput").value.trim();
      if (!newName) {
        alert("❌ الاسم لا يمكن أن يكون فارغاً");
        return;
      }
      db.ref("monthsSettings/renames/" + m)
        .set(newName)
        .then(() => {
          logActivity("تغيير اسم الشهر", `تم تغيير اسم الشهر من ${label} إلى ${newName}`);
          showToast("✅ تم تحديث اسم الشهر");
          advModal.remove();
          loadMonthsManagerContent();
        })
        .catch(err => {
          console.error('خطأ في تحديث الاسم:', err);
          alert('❌ فشل تحديث الاسم');
        });
    };

    // حفظ رسالة الإغلاق
    if (document.getElementById("saveCloseMsgBtn")) {
      document.getElementById("saveCloseMsgBtn").onclick = function () {
        const msg = document.getElementById("closeMsgInput").value;
        db.ref("monthsSettings/closeMsg/" + m)
          .set(msg)
          .then(() => {
            logActivity("تحديث رسالة الإغلاق", `تم تحديث رسالة الإغلاق للشهر: ${label}`);
            showToast("✅ تم حفظ الرسالة");
          })
          .catch(err => {
            console.error('خطأ في حفظ الرسالة:', err);
            alert('❌ فشل حفظ الرسالة');
          });
      };
    }

    // تعيين كافتراضي
    document.getElementById("setDefaultMonthBtn").onclick = function () {
      if (isDefault) {
        showToast("⚠️ هذا الشهر افتراضي بالفعل", "warning");
        return;
      }
      db.ref("monthsSettings/defaultMonth")
        .set(m)
        .then(() => {
          logActivity("تعيين الشهر الافتراضي", `تم تعيين الشهر: ${label} كافتراضي`);
          showToast("✅ تم تعيين الشهر كافتراضي");
          advModal.remove();
          loadMonthsManagerContent();
        })
        .catch(err => {
          console.error('خطأ في تعيين الشهر الافتراضي:', err);
          alert('❌ فشل تعيين الشهر الافتراضي');
        });
    };

    // نسخ البيانات
    document.getElementById("copyMonthBtn").onclick = async function () {
      const targetStr = prompt("أدخل السنة والشهر الهدف\nمثال: 2026-2 (فبراير 2026)\n\n(استخدم 1-12 للأشهر: 1=يناير، 2=فبراير، ... 12=ديسمبر)");
      if (!targetStr) return;

      if (!/^\d{4}-\d{1,2}$/.test(targetStr)) {
        alert("❌ صيغة غير صحيحة\nالصيغة الصحيحة: 2026-2");
        return;
      }

      const [tgtY, tgtMo] = targetStr.split("-");
      const tgtMoNum = parseInt(tgtMo);

      console.log('🔍 تم إدخال:', targetStr);
      console.log('السنة:', tgtY, 'الشهر (1-12):', tgtMoNum);

      if (tgtMoNum < 1 || tgtMoNum > 12) {
        alert("❌ رقم الشهر يجب أن يكون بين 1 و 12\nمثال: 1=يناير، 2=فبراير، 3=مارس");
        return;
      }

      const tgtMoFormatted = tgtMoNum.toString().padStart(2, "0");
      const targetMonth = `${tgtY}-${tgtMoFormatted}`;
      const sourceMoFormatted = (moNum + 1).toString().padStart(2, "0");

      console.log('🔄 معلومات المصدر:', {
        year: y,
        month: moNum,
        monthFormatted: sourceMoFormatted,
        label: label
      });

      console.log('🎯 معلومات الهدف:', {
        year: tgtY,
        month: tgtMoNum,
        monthFormatted: tgtMoFormatted,
        label: arMonths[tgtMoNum - 1]
      });

      if (targetMonth === `${y}-${sourceMoFormatted}`) {
        alert("⚠️ الشهر الهدف هو نفس الشهر المصدر");
        return;
      }

      if (!confirm(`هل تريد نسخ بيانات ${label} إلى ${arMonths[tgtMoNum - 1]} ${tgtY}؟\n\nسيتم نسخ:\n- بيانات الموظفين\n- سجل الحضور\n- السلف والخصومات`)) {
        return;
      }

      console.log('✅ تم تأكيد العملية - جاري النسخ...');

      try {
        // 1️⃣ نسخ الموظفين من المسار الجديد
        console.log('📥 جاري نسخ الموظفين...');
        const sourceEmpPath = `months/${y}/${sourceMoFormatted}/employees`;
        const targetEmpPath = `months/${tgtY}/${tgtMoFormatted}/employees`;
        const legacyEmpKey = `employees_${tgtY}_${tgtMoFormatted}`;

        console.log('  المسار المصدر (جديد):', sourceEmpPath);
        console.log('  المسار الهدف (جديد):', targetEmpPath);
        console.log('  المسار الهدف (قديم):', legacyEmpKey);

        // محاولة قراءة من المسار الجديد أولاً
        let sourceEmpData = {};
        const newEmpSnap = await db.ref(sourceEmpPath).once("value");
        if (newEmpSnap.exists()) {
          sourceEmpData = newEmpSnap.val() || {};
          console.log('  ✅ وجدنا موظفين في المسار الجديد:', Object.keys(sourceEmpData).length);
        } else {
          console.log('  ⚠️ لم نجد موظفين في المسار الجديد، جاري البحث في المسار القديم...');
          // محاولة قراءة من المسار القديم
          const legacyEmpSnap = await db.ref(`employees_${y}_${sourceMoFormatted}`).once("value");
          if (legacyEmpSnap.exists()) {
            sourceEmpData = legacyEmpSnap.val() || {};
            console.log('  ✅ وجدنا موظفين في المسار القديم:', Object.keys(sourceEmpData).length);
          }
        }

        if (Object.keys(sourceEmpData).length > 0) {
          // حفظ في المسار الجديد
          await db.ref(targetEmpPath).set(sourceEmpData);
          console.log('  ✅ تم الحفظ في المسار الجديد');

          // حفظ في المسار القديم للتوافق
          await db.ref(legacyEmpKey).set(sourceEmpData);
          console.log('  ✅ تم الحفظ في المسار القديم');

          console.log('✅ تم نسخ', Object.keys(sourceEmpData).length, 'موظف بنجاح');
        } else {
          console.warn('⚠️ لا توجد موظفين في المصدر للنسخ');
        }

        // 2️⃣ نسخ الحضور
        console.log('📅 جاري نسخ الحضور...');
        const sourceAttendancePath = `months/${y}/${sourceMoFormatted}/attendance`;
        const targetAttendancePath = `months/${tgtY}/${tgtMoFormatted}/attendance`;

        console.log('  المسار المصدر (جديد):', sourceAttendancePath);
        console.log('  المسار الهدف (جديد):', targetAttendancePath);

        // قراءة من المسار الجديد فقط (موحد حسب الشهر)
        let sourceAttendanceData = {};
        const newAttSnap = await db.ref(sourceAttendancePath).once("value");
        if (newAttSnap.exists()) {
          sourceAttendanceData = newAttSnap.val() || {};
          console.log('  ✅ وجدنا بيانات حضور:', Object.keys(sourceAttendanceData).length, 'يوم');
        } else {
          console.log('  ℹ️ لا توجد بيانات حضور لهذا الشهر بعد.');
        }

        // نسخ البيانات
        if (Object.keys(sourceAttendanceData).length > 0) {
          // تحويل مفاتيح الأيام إلى الشهر الجديد
          let targetAttendanceData = {};
          Object.entries(sourceAttendanceData).forEach(([dayKey, dayData]) => {
            const dayNum = dayKey.split("-")[2];
            const newDayKey = `${tgtY}-${tgtMoFormatted}-${dayNum}`;
            targetAttendanceData[newDayKey] = dayData;
          });

          // حفظ في المسار الجديد فقط (بدون المسار القديم لتجنب إنشاء أشهر تلقائية)
          await db.ref(targetAttendancePath).set(targetAttendanceData);
          console.log('✅ تم نسخ', Object.keys(targetAttendanceData).length, 'يوم بنجاح');
        } else {
          console.warn('⚠️ لم يتم العثور على أيام للنسخ');
        }

        // 3️⃣ نسخ السلف والخصومات
        console.log('💰 جاري نسخ السلف والخصومات...');
        const advSourcePath = `advances/${y}/${sourceMoFormatted}`;
        const advTargetPath = `advances/${tgtY}/${tgtMoFormatted}`;
        console.log('  المصدر:', advSourcePath);
        console.log('  الهدف:', advTargetPath);

        const advSnap = await db.ref(advSourcePath).once("value");
        if (advSnap.exists()) {
          const advData = advSnap.val() || {};
          console.log('  عدد السجلات:', Object.keys(advData).length);
          if (Object.keys(advData).length > 0) {
            await db.ref(advTargetPath).set(advData);
            console.log('✅ تم نسخ السلف والخصومات');
          }
        } else {
          console.log('⚠️ لا توجد سلف للنسخ');
        }

        // 4️⃣ إضافة الشهر الهدف إلى إدارة الأشهر
        console.log('📌 جاري إضافة الشهر الهدف إلى المدير...');
        const targetMonthEntry = `${tgtY}-${tgtMoFormatted}`;
        console.log('  إدخال الشهر:', targetMonthEntry);

        const manualMonthsSnap = await db.ref("monthsSettings/manual").once("value");
        let monthsList = manualMonthsSnap.val() || [];

        if (!Array.isArray(monthsList)) {
          monthsList = [];
        }

        console.log('  الأشهر الموجودة حالياً:', monthsList);

        if (!monthsList.includes(targetMonthEntry)) {
          monthsList.push(targetMonthEntry);
          console.log('  جاري إضافة الشهر الجديد...');
          await db.ref("monthsSettings/manual").set(monthsList);
          console.log('✅ تم إضافة الشهر الهدف إلى المدير');
        } else {
          console.log('ℹ️ الشهر موجود بالفعل في المدير');
        }

        console.log('========================================');
        console.log('✅ تم النسخ بنجاح!');
        console.log('========================================');

        logActivity("نسخ البيانات", `تم نسخ بيانات ${label} إلى ${arMonths[tgtMoNum - 1]} ${tgtY}`);
        alert(`✅ تم النسخ بنجاح!\n\n📊 البيانات المنسوخة جاهزة في ${arMonths[tgtMoNum - 1]} ${tgtY}`);

        // إغلاق النافذة وإعادة تحميل مدير الأشهر
        advModal.remove();
        setTimeout(() => loadMonthsManagerContent(), 500);

      } catch (error) {
        console.error('❌ خطأ في النسخ:', error);
        console.error('Stack:', error.stack);
        alert('❌ حدث خطأ في النسخ:\n' + error.message);
      }
    };

    // نسخ الموظفين فقط
    document.getElementById("copyEmployeesOnlyBtn").onclick = async function () {
      const targetStr = prompt("أدخل السنة والشهر الهدف لنقل الموظفين إليه\nمثال: 2026-2 (فبراير 2026)");
      if (!targetStr) return;

      if (!/^\d{4}-\d{1,2}$/.test(targetStr)) {
        alert("❌ صيغة غير صحيحة\nالصيغة الصحيحة: 2026-2");
        return;
      }

      const [tgtY, tgtMo] = targetStr.split("-");
      const tgtMoNum = parseInt(tgtMo);
      if (tgtMoNum < 1 || tgtMoNum > 12) {
        alert("❌ رقم الشهر يجب أن يكون بين 1 و 12");
        return;
      }

      const tgtMoFormatted = tgtMoNum.toString().padStart(2, "0");
      const targetMonth = `${tgtY}-${tgtMoFormatted}`;
      const sourceMoFormatted = (moNum + 1).toString().padStart(2, "0");

      if (targetMonth === `${y}-${sourceMoFormatted}`) {
        alert("⚠️ الشهر الهدف هو نفس الشهر المصدر");
        return;
      }

      if (!confirm(`هل تريد استنساخ أسماء وهيكلية الموظفين فقط من ${label} إلى ${arMonths[tgtMoNum - 1]} ${tgtY}؟\n(لن يتم نسخ الحضور والغياب أو السلف)`)) {
        return;
      }

      try {
        console.log('📥 جاري نسخ الموظفين فقط...');
        const sourceEmpPath = `months/${y}/${sourceMoFormatted}/employees`;
        const targetEmpPath = `months/${tgtY}/${tgtMoFormatted}/employees`;
        const legacyEmpKey = `employees_${tgtY}_${tgtMoFormatted}`;

        let sourceEmpData = {};
        const newEmpSnap = await db.ref(sourceEmpPath).once("value");
        if (newEmpSnap.exists()) {
          sourceEmpData = newEmpSnap.val() || {};
        } else {
          const legacyEmpSnap = await db.ref(`employees_${y}_${sourceMoFormatted}`).once("value");
          if (legacyEmpSnap.exists()) {
            sourceEmpData = legacyEmpSnap.val() || {};
          }
        }

        if (Object.keys(sourceEmpData).length > 0) {
          await db.ref(targetEmpPath).set(sourceEmpData);
          await db.ref(legacyEmpKey).set(sourceEmpData);
          console.log(`✅ تم استنساخ ${Object.keys(sourceEmpData).length} موظف بنجاح`);
        } else {
          alert('⚠️ لا توجد موظفين في هذا الشهر لنسخهم');
          return;
        }

        // إضافة الشهر الهدف إلى إدارة الأشهر
        const targetMonthEntry = `${tgtY}-${tgtMoFormatted}`;
        const manualMonthsSnap = await db.ref("monthsSettings/manual").once("value");
        let monthsList = manualMonthsSnap.val() || [];
        if (!Array.isArray(monthsList)) monthsList = [];
        if (!monthsList.includes(targetMonthEntry)) {
          monthsList.push(targetMonthEntry);
          await db.ref("monthsSettings/manual").set(monthsList);
        }

        logActivity("استنساخ موظفين", `تم نقل الموظفين من ${label} إلى ${arMonths[tgtMoNum - 1]} ${tgtY}`);
        alert(`✅ تم استنساخ الموظفين بنجاح!\nالأسماء جاهزة في ${arMonths[tgtMoNum - 1]} ${tgtY}`);

        advModal.remove();
        setTimeout(() => loadMonthsManagerContent(), 500);

      } catch (error) {
        console.error('❌ خطأ في نقل الموظفين:', error);
        alert('❌ حدث خطأ في النظام:\n' + error.message);
      }
    };

    // تصدير البيانات
    document.getElementById("exportMonthBtn").onclick = async function () {
      try {
        // قراءة بيانات الموظفين من المسار الجديد
        const monthFormatted = (moNum + 1).toString().padStart(2, "0");
        const empPath = `months/${y}/${monthFormatted}/employees`;
        const empSnap = await db.ref(empPath).once("value");
        const employeesData = empSnap.val() || {};

        // قراءة بيانات السلف
        const advPath = `advances/${y}/${monthFormatted}`;
        const advSnap = await db.ref(advPath).once("value");
        const advancesData = advSnap.val() || {};

        const monthData = {
          month: label,
          employees: Object.keys(employeesData).length || empCount,
          days: Object.keys(monthObj.attendance || {}).length || daysCount,
          employeesData: employeesData,
          attendanceData: monthObj.attendance || {},
          advancesData: advancesData,
          notes: note,
          exported: new Date().toISOString()
        };

        const json = JSON.stringify(monthData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${label.replace(/\s+/g, '_')}_export.json`;
        link.click();
        URL.revokeObjectURL(url);

        logActivity("تصدير البيانات", `تم تصدير بيانات ${label}`);
        alert("✅ تم تصدير البيانات");
      } catch (error) {
        console.error('❌ خطأ في التصدير:', error);
        alert('❌ خطأ في التصدير:\n' + error.message);
      }
    };

    // استيراد البيانات
    document.getElementById("importMonthBtn").onclick = function () {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".json";
      fileInput.addEventListener("change", async function (e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
          const text = await file.text();
          const importedData = JSON.parse(text);

          console.log('📂 البيانات المستوردة:', importedData);

          // التحقق من صحة البيانات
          if (!importedData.month || !importedData.attendanceData) {
            alert("❌ ملف غير صحيح! يجب أن يكون من تصدير النظام");
            return;
          }

          if (!confirm(`هل تريد استيراد بيانات ${importedData.month}؟\n\nسيتم استيراد:\n- ${Object.keys(importedData.attendanceData || {}).length} يوم\n- البيانات الموجودة ستُستبدل!`)) {
            return;
          }

          console.log('🔄 جاري الاستيراد...');

          // استخراج السنة والشهر من بيانات الحضور
          const sampleKey = Object.keys(importedData.attendanceData)[0];
          if (!sampleKey || !sampleKey.includes('-')) {
            alert("❌ لا توجد بيانات حضور صحيحة في الملف");
            return;
          }

          const [importYear, importMonth] = sampleKey.split('-').slice(0, 2);
          const importMonthKey = `${importYear}-${(parseInt(importMonth)).toString().padStart(2, "0")}`;
          const importMonthFormatted = parseInt(importMonth).toString().padStart(2, "0");

          console.log('📅 شهر الاستيراد:', importMonthKey);
          console.log('السنة:', importYear, 'الشهر:', importMonthFormatted);

          // 1️⃣ استيراد الموظفين
          console.log('👥 جاري استيراد الموظفين...');
          const targetEmpPath = `months/${importYear}/${importMonthFormatted}/employees`;
          const legacyEmpKey = `employees_${importYear}_${importMonthFormatted}`;

          // قراءة الموظفين من الملف إذا كانت موجودة
          let employeesFromFile = {};
          if (importedData.employeesData && typeof importedData.employeesData === 'object') {
            employeesFromFile = importedData.employeesData;
          } else {
            // محاولة استخراج الموظفين من بيانات الحضور
            const sampleDay = Object.values(importedData.attendanceData)[0] || {};
            Object.keys(sampleDay).forEach(empName => {
              if (empName !== '__editor' && empName !== '__editedAt') {
                employeesFromFile[empName] = { name: empName };
              }
            });
          }

          if (Object.keys(employeesFromFile).length > 0) {
            await db.ref(targetEmpPath).set(employeesFromFile);
            await db.ref(legacyEmpKey).set(employeesFromFile);
            console.log('✅ تم استيراد', Object.keys(employeesFromFile).length, 'موظف');
          }

          // 2️⃣ استيراد الحضور
          console.log('📋 جاري استيراد الحضور...');
          const targetAttendancePath = `months/${importYear}/${importMonthFormatted}/attendance`;

          if (Object.keys(importedData.attendanceData).length > 0) {
            await db.ref(targetAttendancePath).set(importedData.attendanceData);
            console.log('✅ تم استيراد', Object.keys(importedData.attendanceData).length, 'يوم');
          }

          // 3️⃣ استيراد الملاحظات
          if (importedData.notes) {
            console.log('📝 جاري استيراد الملاحظات...');
            await db.ref("monthsNotes/" + importMonthKey).set(importedData.notes);
            console.log('✅ تم استيراد الملاحظات');
          }

          // 4️⃣ استيراد السلف
          if (importedData.advancesData) {
            console.log('💰 جاري استيراد السلف...');
            await db.ref(`advances/${importYear}/${importMonthFormatted}`).set(importedData.advancesData);
            console.log('✅ تم استيراد السلف');
          }

          // 4️⃣ إضافة الشهر المستورد إلى قائمة الأشهر
          console.log('📌 جاري إضافة الشهر إلى المدير...');
          const manualMonthsSnap = await db.ref("monthsSettings/manual").once("value");
          let monthsList = manualMonthsSnap.val() || [];

          if (!Array.isArray(monthsList)) {
            monthsList = [];
          }

          if (!monthsList.includes(importMonthKey)) {
            monthsList.push(importMonthKey);
            await db.ref("monthsSettings/manual").set(monthsList);
            console.log('✅ تم إضافة الشهر إلى المدير');
          }

          console.log('========================================');
          console.log('✅ تم الاستيراد بنجاح!');
          console.log('========================================');

          logActivity("استيراد البيانات", `تم استيراد بيانات ${importedData.month}`);
          alert(`✅ تم الاستيراد بنجاح!\n\n📊 تم استيراد:\n- ${Object.keys(employeesFromFile).length || '؟'} موظف\n- ${Object.keys(importedData.attendanceData).length} يوم`);

          // إغلاق النافذة وإعادة تحميل مدير الأشهر
          advModal.remove();
          setTimeout(() => loadMonthsManagerContent(), 500);

        } catch (error) {
          console.error('❌ خطأ في الاستيراد:', error);
          alert('❌ خطأ في قراءة الملف:\n' + error.message);
        }
      });

      fileInput.click();
    };

    // حذف الشهر
    document.getElementById("deleteMonthBtn").onclick = async function () {
      if (!confirm(`⚠️ هل أنت متأكد من حذف شهر ${label}؟\n\nسيتم حذف:\n- ${empCount} موظف\n- ${daysCount} يوم من البيانات\n\nهذا الإجراء لا يمكن التراجع عنه!`)) {
        return;
      }

      if (!confirm("تأكيد نهائي: هل تريد المتابعة؟")) {
        return;
      }

      // حذف جميع بيانات الشهر من المسارات الجديدة والقديمة
      const newEmpPath = `months/${y}/${mmKey}/employees`;
      await db.ref(newEmpPath).remove().catch(() => { });

      // حذف الحضور (جديد وقديم)
      const attendanceObj = monthObj.attendance || {};
      await Promise.all(Object.keys(attendanceObj).map(dayKey => {
        return Promise.all([
          db.ref(`months/${y}/${mmKey}/attendance/${dayKey}`).remove().catch(() => { }),
          attendanceRefForDay(dayKey).remove().catch(() => { }),
        ]);
      })).catch(() => { });

      // حذف الملاحظة
      await db.ref("monthsNotes/" + m).remove().catch(() => { });

      // حذف العقدة الكاملة للشهر من الشجرة الموحدة
      await db.ref(`months/${y}/${mmKey}`).remove().catch(() => { });

      // حذف أي مفاتيح إعداد مرتبطة بالشهر
      await db.ref(`monthsSettings/renames/${m}`).remove().catch(() => { });
      await db.ref(`monthsSettings/closed/${m}`).remove().catch(() => { });
      await db.ref(`monthsSettings/hidden/${m}`).remove().catch(() => { });
      // إعادة ضبط الافتراضي إذا كان هذا الشهر هو الافتراضي
      const defaultSnap = await db.ref('monthsSettings/defaultMonth').once('value');
      if (defaultSnap.val() === m) { await db.ref('monthsSettings/defaultMonth').remove().catch(() => { }); }

      // حذف من اليدوي
      const manualSnap = await db.ref("monthsSettings/manual").once("value");
      let arr = manualSnap.val() || [];
      if (Array.isArray(arr)) {
        arr = arr.filter((x) => x !== m);
        await db.ref("monthsSettings/manual").set(arr).catch(() => { });
      }

      logActivity("حذف الشهر", `تم حذف شهر: ${label}`);
      alert("✅ تم حذف الشهر نهائياً");
      advModal.remove();
      loadMonthsManagerContent();
    };

    // استعادة الشهر المخفي
    if (document.getElementById("restoreMonthBtn")) {
      document.getElementById("restoreMonthBtn").onclick = function () {
        db.ref("monthsSettings/hidden/" + m)
          .set(false)
          .then(() => {
            logActivity("استعادة الشهر", `تم استعادة شهر: ${label}`);
            alert("✅ تم استعادة الشهر");
            advModal.remove();
            loadMonthsManagerContent();
          })
          .catch(err => {
            console.error('خطأ في استعادة الشهر:', err);
            alert('❌ فشل استعادة الشهر');
          });
      };
    }
  }

  // زر الملاحظات: يظهر فقط إذا كان للمستخدم صلاحية (edit أو read)
  db.ref("users/" + currentUser)
    .once("value")
    .then((snap) => {
      const data = snap.val() || {};
      const perm = data.notesPermission || "edit";
      const notesBtn = document.getElementById("sidebarNotesBtn");
      if (notesBtn) {
        if (perm === "edit" || perm === "read") {
          notesBtn.style.display = "block";
        } else {
          notesBtn.style.display = "none";
        }
      }
    });

  // إزالة زر سجل النشاطات القديم الخاص بالمستخدم لتجنب التعارض والتكرار
  const oldUserLogBtn = document.getElementById("sidebarUserLogBtn");
  if (oldUserLogBtn) {
    oldUserLogBtn.remove();
  }

  if (localStorage.getItem("loggedUser")) {
    sidebarToggleBtn.style.display = sidebarMenu.classList.contains(
      "open"
    )
      ? "none"
      : "flex";
    sidebarCloseBtn.style.display = sidebarMenu.classList.contains("open")
      ? "flex"
      : "none";
  } else {
    sidebarToggleBtn.style.display = "none";
    sidebarCloseBtn.style.display = "none";
    sidebarMenu.classList.remove("open");
  }
}
// زر فتح القائمة الجانبية
document.getElementById("sidebarToggleBtn").onclick = () => {
  document.getElementById("sidebarMenu").classList.add("open");
  document.getElementById("sidebarToggleBtn").style.display = "none";
  document.getElementById("sidebarCloseBtn").style.display = "flex";
  // عرض اسم المستخدم أعلى القائمة
  const sidebarUserName = document.getElementById("sidebarUserName");
  sidebarUserName.textContent = currentUser
    ? "👤 " + currentUser
    : "غير مسجل";
  updateSidebarVisibility();
};
// زر إغلاق القائمة الجانبية
document.getElementById("sidebarCloseBtn").onclick = () => {
  document.getElementById("sidebarMenu").classList.remove("open");
  document.getElementById("sidebarCloseBtn").style.display = "none";
  document.getElementById("sidebarToggleBtn").style.display = "flex";
  updateSidebarVisibility();
};
// ربط أزرار القائمة الجانبية بأزرار الموقع الأصلية
document.getElementById("sidebarAdminBtn").onclick = () => {
  document.getElementById("sidebarMenu").classList.remove("open");
  setTimeout(() => toggleAdminPanel(), 100);
};
document.getElementById("sidebarEmpStatsBtn").onclick = () => {
  document.getElementById("sidebarMenu").classList.remove("open");
  setTimeout(
    () => document.getElementById("toggleEmpStatsBtn").click(),
    100
  );
};
document.getElementById("sidebarDeleteDataBtn").onclick = () => {
  document.getElementById("sidebarMenu").classList.remove("open");
  setTimeout(() => document.getElementById("btnDeleteData").click(), 100);
};

// إخفاء جميع الأزرار الخارجية
document.addEventListener("DOMContentLoaded", () => {
  [
    "toggleEmpStatsBtn",
    "btnDeleteData",
    "btnFeaturesTab",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
  updateSidebarVisibility();
});
window.addEventListener("storage", updateSidebarVisibility);
window.addEventListener("focus", updateSidebarVisibility);
setInterval(updateSidebarVisibility, 1000);

// سجل النشاطات
function logActivity(action, details, extra = {}) {
  const now = new Date();
  // format without seconds
  const time = formatDateTimeNoSeconds(now);
  const timestamp = now.getTime(); // أضفنا timestamp
  let style = "";
  if (extra && extra.type === "note") {
    style = "background:#fffde7;border-left:5px solid #ffb300;";
  }
  db.ref("activityLog").push({
    time,
    timestamp, // هذا سيساعد في تحليل الوقت بشكل صحيح
    action,
    details,
    user: currentUser,
    ...extra,
    style,
  });
}

// تحويل الأرقام العربية إلى إنجليزية
function toEnglishNumbers(str) {
  return str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
}

// Format a Date to 'DD/MM/YYYY HH:MM' (Arabic locale) without seconds
function formatDateTimeNoSeconds(d) {
  try {
    const datePart = toEnglishNumbers(d.toLocaleDateString("ar-EG"));
    const timePart = toEnglishNumbers(
      d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })
    );
    return datePart + " " + timePart;
  } catch (e) {
    // fallback
    return toEnglishNumbers(d.toLocaleDateString("ar-EG")) + " " + toEnglishNumbers(d.toLocaleTimeString("ar-EG"));
  }
}

// دالة توليد وسم الحالة بلون مخصص في سجل النشاطات
function getStatusBadgeHtml(status) {
  const val = (status && status.trim()) || "بدون";
  let bg = "#f1f5f9"; // رصاصي ناعم
  let color = "#475569";
  let border = "#cbd5e1";
  if (val === "شفت") {
    bg = "#f0fdf4"; // أخضر ناعم
    color = "#16a34a";
    border = "#bbf7d0";
  } else if (val === "نصف" || val === "نص") {
    bg = "#fffbeb"; // أصفر ناعم
    color = "#d97706";
    border = "#fef08a";
  } else if (val === "غياب" || val === "❌") {
    bg = "#fef2f2"; // أحمر ناعم
    color = "#dc2626";
    border = "#fecaca";
  } else if (val === "إجازة" || val === "اجازة") {
    bg = "#f0f9ff"; // أزرق ناعم
    color = "#0284c7";
    border = "#bae6fd";
  }
  return `<span style="background:${bg};color:${color};border:1px solid ${border};padding:2.5px 8.5px;border-radius:6px;font-weight:bold;font-size:11.5px;display:inline-block;margin:0 2px;box-shadow:0 1px 2px rgba(0,0,0,0.02);">${val}</span>`;
}

// دالة بديلة لنسخ النصوص متوافقة تماماً مع أجهزة iOS (iPhone / iPad) وفي بيئات HTTP غير الآمنة
function copyTextFallback(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  
  // لمنع لوحة المفاتيح ومنع التكبير التلقائي في iOS
  textArea.setAttribute("readonly", "");
  textArea.style.position = "absolute";
  textArea.style.left = "-9999px";
  textArea.style.top = "0";
  textArea.style.fontSize = "12pt"; 
  
  document.body.appendChild(textArea);
  
  // حفظ قيم الحالات الافتراضية
  const oldContentEditable = textArea.contentEditable;
  const oldReadOnly = textArea.readOnly;
  
  // تهيئة خاصة للتحديد في iOS
  textArea.contentEditable = "true";
  textArea.readOnly = false;
  
  const range = document.createRange();
  range.selectNodeContents(textArea);
  
  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
  }
  
  // التحديد العام
  textArea.setSelectionRange(0, 999999);
  
  // إعادة الحالات لمنع تفاعل الكيبورد
  textArea.contentEditable = oldContentEditable;
  textArea.readOnly = oldReadOnly;
  
  let success = false;
  try {
    success = document.execCommand("copy");
  } catch (err) {
    console.error("Fallback copy failed:", err);
  }
  
  // تنظيف التحديد ومسح العنصر المؤقت
  if (selection) {
    selection.removeAllRanges();
  }
  document.body.removeChild(textArea);
  
  return success;
}

// دالة نسخ نص التعديل بشكل مرتب وخالي من وسوم HTML لإرساله للموظفين
window.copyLogText = function(btn) {
  try {
    const card = btn.closest('.log-card');
    if (!card) return;
    
    // استخراج معلومات السجل من عناصر الواجهة مباشرة
    const user = card.querySelector('.log-card-user').textContent.replace(/^[👤👑]\s*/, '').trim();
    const action = card.querySelector('.log-card-action').textContent.trim();
    const time = card.querySelector('.log-card-time').textContent.replace(/^🕒\s*/, '').trim();
    let details = card.querySelector('.log-card-body').textContent.trim();
    // استبدال علامة الاكس بكلمة "اجازة" فقط عند النسخ
    details = details.replace(/❌/g, "اجازة");
    
    // سطر أفقي كامل مرتب، واضح ومفهوم لأي شخص
    const textToCopy = `📋 نشاط بالنظام | 🕒 الوقت: ${time} | 👤 المسؤول: ${user} | 📝 التفاصيل: ${details}`;

    const onSuccess = () => {
      // تغيير شكل الزر مؤقتاً لتأكيد النسخ
      const oldText = btn.innerHTML;
      btn.innerHTML = "✅ تم النسخ";
      btn.style.background = "#198754";
      btn.style.color = "#ffffff";
      btn.style.borderColor = "#198754";
      setTimeout(() => {
        btn.innerHTML = oldText;
        btn.style.background = "";
        btn.style.color = "";
        btn.style.borderColor = "";
      }, 1500);
    };

    // فحص ما إذا كان المستخدم على جهاز آبل (iOS أو macOS Safari) لاستخدام النسخ المتزامن مباشرة
    const isApple = /ipad|iphone|ipod/i.test(navigator.userAgent) || 
                    (navigator.userAgent.includes("Mac") && "ontouchend" in document) ||
                    /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isApple) {
      // تشغيل النسخ الاحتياطي فوراً وبشكل متزامن لمنع الحظر الأمني في متصفح سفاري
      if (copyTextFallback(textToCopy)) {
        onSuccess();
      } else {
        showToast("❌ فشل نسخ النص", "error");
      }
    } else if (navigator.clipboard && window.isSecureContext) {
      // المحاولة بالـ API الحديثة أولاً للأنظمة الأخرى
      navigator.clipboard.writeText(textToCopy)
        .then(onSuccess)
        .catch(err => {
          console.warn("Clipboard API failed, trying fallback:", err);
          if (copyTextFallback(textToCopy)) {
            onSuccess();
          } else {
            showToast("❌ فشل نسخ النص", "error");
          }
        });
    } else {
      // استخدام الطريقة البديلة مباشرة للأجهزة غير المتوافقة أو السياقات غير الآمنة (مثل HTTP)
      if (copyTextFallback(textToCopy)) {
        onSuccess();
      } else {
        showToast("❌ فشل نسخ النص", "error");
      }
    }
  } catch (e) {
    console.error("Error in copyLogText:", e);
  }
};

// حفظ التعديلات فقط عند وجود تغيير فعلي
async function saveData() {
  if (!currentUserCanEdit) {
    showToast("❌ ليس لديك صلاحية تعديل الجدول.", "error");
    return;
  }
  const days = getDays();
  const monthFormatted = String(month + 1).padStart(2, '0');
  const attendancePath = `months/${year}/${monthFormatted}/attendance`;

  // الموظفين لهذا الشهر فقط من قاعدة البيانات الشهرية
  let monthEmployees = employees.slice();
  try {
    const attendanceSnapshot = await db.ref(attendancePath).once("value");
    const savedData = attendanceSnapshot.val() || {};
    const updatedData = { ...savedData };
    let changes = [];
    let anyChange = false;
    days.forEach((day, dayIndex) => {
      if (!updatedData[day.key]) updatedData[day.key] = {};
      let dayChanged = false;
      monthEmployees.forEach((employee, empIndex) => {
        const selectElement = document.getElementById(
          `d${dayIndex}e${empIndex}`
        );
        if (selectElement) {
          const newValue = selectElement.value;
          const oldValue = (savedData[day.key] && savedData[day.key][employee] !== undefined)
            ? savedData[day.key][employee]
            : "";
          if (newValue !== oldValue) {
            updatedData[day.key][employee] = newValue;
            dayChanged = true;
            anyChange = true;
            changes.push({
              user: currentUser,
              day: day.key,
              employee,
              old: oldValue,
              new: newValue,
              time: formatDateTimeNoSeconds(new Date()),
            });
          }
        }
      });
      if (dayChanged) {
        updatedData[day.key].__editor = currentUser;
        const now = new Date();
        updatedData[day.key].__editedAt = formatDateTimeNoSeconds(now);
      }
    });
    if (!anyChange) {
      showToast("لا يوجد أي تعديل لحفظه.", "info");
      return;
    }
    await db.ref(attendancePath).set(updatedData);
    showToast("✅ تم حفظ التعديلات بنجاح");
    generateTable();
    changes.forEach((change) => {
      logActivity(
        "تعديل جدول الحضور",
        `
          <span style="color:#007bff;font-weight:bold;">${change.user}</span>
          قام بتعديل حضور الموظف
          <span style="color:#673ab7;font-weight:bold;">${change.employee
        }</span>
          في اليوم
          <span style="color:#009688;font-weight:bold;">${change.day}</span>
          من
          ${getStatusBadgeHtml(change.old)}
          إلى
          ${getStatusBadgeHtml(change.new)}
        `,
        { time: change.time, user: change.user }
      );
    });
  } catch (error) {
    console.error("خطأ في حفظ البيانات:", error);
    showToast("❌ خطأ في حفظ البيانات", "error");
  }
}



// Helper: render activity log into a container with a 'عرض المزيد' button
function renderActivityLog(limit, containerId) {
  limit = limit || 30;
  const container = document.getElementById(containerId || 'activityLogBox');
  if (!container) return;
  container.innerHTML = 'جاري التحميل...';
  db.ref('activityLog')
    .limitToLast(limit)
    .once('value')
    .then((snapshot) => {
      const log = snapshot.val() || {};
      let html = `<table class="activity-log-table" style="width:100%;border-collapse:collapse;">
              <tr>
                <th style='background:#f0f0f0;padding:7px;'>الوقت</th>
                <th style='background:#f0f0f0;padding:7px;'>المستخدم</th>
                <th style='background:#f0f0f0;padding:7px;'>النشاط</th>
                <th style='background:#f0f0f0;padding:7px;'>الوصف</th>
              </tr>`;
      Object.values(log).reverse().forEach((item) => {
        let details = item.details || "";
        // simplify descriptions for adding month/employee: remove day counts
        try {
          if (item.action && /شهر/.test(item.action) && /اضاف|أضف|إضافة/.test(item.action)) {
            details = details.replace(/عدد\s*[:\-–]?\s*\d+\s*يوم(?:اً)?/g, "").replace(/\d+\s*يوم(?:اً)?/g, "").trim();
            // if becomes empty, fallback to concise action text
            if (!details) details = item.action;
          }
        } catch (e) { }
        // highlight common change-type words (e.g., شفت, نص)
        try {
          details = details.replace(/(شفت|نص)/g, '<span class="activity-type">$1</span>');
        } catch (e) { }
        // highlight employee names present in global `employees` array
        try {
          const emps = Array.isArray(window.employees) ? window.employees : [];
          emps.forEach((emp) => {
            if (!emp) return;
            const esc = emp.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
            details = details.replace(new RegExp(esc, 'g'), `<span class="activity-emp">${emp}</span>`);
          });
        } catch (e) { }

        html += `<tr style='${item.style || ""}'>
                <td class="activity-time">${toEnglishNumbers(item.time || "")}</td>
                <td><span class="activity-user-badge">${item.user || ""}</span></td>
                <td class="activity-action">${item.action || ""}</td>
                <td class="activity-desc">${details}</td>
              </tr>`;
      });
      html += `</table>`;
      // add 'عرض المزيد' button only when limit < 80
      if (limit < 80) {
        html += `<div style="display:flex;justify-content:center;margin-top:12px;">
                <button id="showMoreActivityBtn" style="background:linear-gradient(90deg,#6a82fb,#283e51);color:#fff;border:none;padding:10px 16px;border-radius:8px;cursor:pointer;box-shadow:0 4px 12px #6a82fb33;font-weight:700;">عرض المزيد</button>
              </div>`;
      }
      container.innerHTML = html;
      // attach click handler
      const moreBtn = document.getElementById('showMoreActivityBtn');
      if (moreBtn) {
        moreBtn.onclick = function () {
          // load last 80 edits
          renderActivityLog(80, containerId);
          // smooth scroll to the log container
          setTimeout(() => {
            container.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 120);
        };
      }
    })
    .catch((err) => {
      container.innerHTML = '<div style="color:#d32f2f;text-align:center;">❌ خطأ في تحميل السجل</div>';
      console.error('Error loading activity log:', err);
    });
}

// Ensure a single, well-styled 'عرض المزيد' button is present in the features tab
function ensureFeaturesShowMoreButton(containerId) {
  try {
    const placeholder = document.getElementById('featuresShowMorePlaceholder');
    if (!placeholder) return;
    // Remove any existing global buttons with the same id to avoid duplicates
    const existing = Array.from(document.querySelectorAll('#featuresShowMoreBtn'));
    existing.forEach((el) => {
      // if it's already inside the current placeholder, keep it
      if (el.parentElement !== placeholder) el.remove();
    });
    // If button already exists inside placeholder, reuse it
    let btn = placeholder.querySelector('#featuresShowMoreBtn');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'featuresShowMoreBtn';
      btn.className = 'features-show-more-btn';
      btn.textContent = 'عرض المزيد';
      placeholder.appendChild(btn);
    }
    // attach handler (idempotent)
    btn.onclick = function () {
      // visually disable while loading
      btn.disabled = true;
      const oldText = btn.textContent;
      btn.textContent = 'جاري التحميل...';
      renderActivityLog(80, containerId || 'activityLogBox');
      setTimeout(() => {
        btn.textContent = oldText;
        btn.disabled = false;
        // hide the button after loading 80 entries
        try { btn.style.display = 'none'; } catch (e) { }
      }, 800);
    };
  } catch (e) {
    console.error('ensureFeaturesShowMoreButton error', e);
  }
}

// Responsive styling for the features-show-more button
if (!document.getElementById('featuresShowMoreStyles')) {
  const fs = document.createElement('style');
  fs.id = 'featuresShowMoreStyles';
  fs.innerHTML = `
          .features-show-more-btn{ background:linear-gradient(90deg,#5b6bff,#2b3b71); color:#fff; border:none; padding:7px 10px; border-radius:6px; cursor:pointer; box-shadow:0 6px 18px rgba(43,59,113,0.14); font-weight:700; font-size:13px; }
          @media (max-width:600px){ .features-show-more-btn{ padding:6px 8px; font-size:12px; border-radius:6px; box-shadow:none; } }
        `;
  document.head.appendChild(fs);
}

// نافذة تحكم صلاحيات سجل النشاطات للمدير
document.getElementById("sidebarUserControlBtn").onclick = function () {
  // إنشاء نافذة منبثقة احترافية
  let modal = document.getElementById("userLogControlModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "userLogControlModal";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100vw";
    modal.style.height = "100vh";
    modal.style.background = "rgba(0,0,0,0.5)";
    modal.style.zIndex = "8000";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.padding = "12px";
    modal.style.backdropFilter = "blur(4px)";
    modal.innerHTML = `
      <div style="background:#fff;max-width:700px;width:100%;border-radius:14px;box-shadow:0 16px 56px rgba(0,0,0,0.28);padding:0;position:relative;max-height:85vh;overflow:hidden;display:flex;flex-direction:column;animation:slideUp 0.3s ease;">
        <!-- رأس -->
        <div style="background:linear-gradient(135deg, #009688 0%, #00796b 100%);color:white;padding:20px 24px;border-bottom:3px solid #26a69a;display:flex;justify-content:space-between;align-items:center;gap:12px;">
          <div>
            <h3 style="margin:0;font-size:20px;font-weight:800;letter-spacing:0.5px;">👥 إدارة صلاحيات سجل النشاطات</h3>
            <p style="margin:4px 0 0 0;font-size:12px;opacity:0.9;">تحكم في من يستطيع رؤية سجل نشاطاته</p>
          </div>
          <button id="closeUserLogControlModal" style="position:absolute;top:14px;right:14px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.2);color:white;border-radius:6px;width:36px;height:36px;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.25)';this.style.borderColor='rgba(255,255,255,0.35)'" onmouseout="this.style.background='rgba(255,255,255,0.15)';this.style.borderColor='rgba(255,255,255,0.2)'">✕</button>
        </div>
        <!-- المحتوى -->
        <div id="userLogControlContent" style="flex:1;overflow-y:auto;padding:24px;background:#f9f9f9;">جاري التحميل...</div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById("closeUserLogControlModal").onclick = function () {
      modal.style.display = "none";
    };
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = "none";
    });
  } else {
    modal.style.display = "flex";
  }

  // تحميل المستخدمين وصلاحياتهم
  db.ref("users")
    .once("value")
    .then((snapshot) => {
      const users = snapshot.val() || {};
      const usersArray = Object.entries(users).filter(([username]) => username !== "admin");

      let html = '';
      if (usersArray.length > 0) {
        html = `
                <table style="width:100%;border-collapse:collapse;background:#fff;margin-bottom:20px;">
                  <thead>
                    <tr style="background:linear-gradient(135deg, #009688 0%, #00796b 100%);color:white;font-weight:700;position:sticky;top:0;z-index:10;">
                      <th style="padding:14px 12px;text-align:right;font-size:12px;border-bottom:2px solid #26a69a;width:40%;">المستخدم</th>
                      <th style="padding:14px 12px;text-align:center;font-size:12px;border-bottom:2px solid #26a69a;width:30%;">الحالة</th>
                      <th style="padding:14px 12px;text-align:center;font-size:12px;border-bottom:2px solid #26a69a;width:30%;">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody>
              `;

        usersArray.forEach(([username, data], idx) => {
          const isEnabled = data.canViewLog;
          const bgColor = idx % 2 === 0 ? '#ffffff' : '#f8f9f9';
          html += `
                  <tr style="background:${bgColor};border-bottom:1px solid #e8e8e8;transition:background 0.2s;" onmouseover="this.style.background='#f0f7f6'" onmouseout="this.style.background='${bgColor}'">
                    <td style="padding:14px 12px;text-align:right;font-size:12px;color:#333;font-weight:600;">
                      <span style="background:linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%);color:#00695c;padding:5px 12px;border-radius:14px;display:inline-block;font-weight:600;">${username}</span>
                    </td>
                    <td style="padding:14px 12px;text-align:center;font-size:12px;">
                      <span style="background:${isEnabled ? 'rgba(76,175,80,0.15)' : 'rgba(244,67,54,0.15)'};color:${isEnabled ? '#2e7d32' : '#c62828'};padding:4px 10px;border-radius:12px;font-weight:600;display:inline-block;">
                        ${isEnabled ? '✓ مفعّل' : '✕ معطّل'}
                      </span>
                    </td>
                    <td style="padding:14px 12px;text-align:center;">
                      <label style="display:inline-flex;align-items:center;gap:8px;cursor:pointer;">
                        <input type="checkbox" ${isEnabled ? 'checked' : ''} onchange="window.setUserLogAccess('${username}', this.checked)" style="cursor:pointer;width:16px;height:16px;">
                        <span style="font-size:11px;color:#666;font-weight:500;">${isEnabled ? 'تعطيل' : 'تفعيل'}</span>
                      </label>
                    </td>
                  </tr>
                `;
        });

        html += `
                  </tbody>
                </table>
              `;
      } else {
        html = '<div style="text-align:center;padding:60px 20px;color:#999;font-size:14px;">لا توجد مستخدمين إضافيين</div>';
      }

      html += `
              <div style="background:#f5f5f5;border-left:4px solid #009688;border-radius:6px;padding:16px;margin-bottom:12px;">
                <p style="margin:0 0 10px 0;font-weight:700;color:#009688;font-size:13px;">📋 شرح الصلاحيات:</p>
                <ul style="margin:0;padding-left:20px;color:#555;font-size:12px;line-height:1.8;">
                  <li><strong>مفعّل (✓):</strong> يرى المستخدم زر سجل النشاطات في قائمته الجانبية ويمكنه رؤية نشاطاته الخاص</li>
                  <li><strong>معطّل (✕):</strong> يختفي الزر من قائمة المستخدم <strong>وأيضاً</strong> تختفي جميع أنشطته من سجل النشاطات الكامل</li>
                  <li><strong>المدير (admin):</strong> يرى جميع الأنشطة دائماً بغض النظر عن الإعدادات</li>
                </ul>
              </div>
              
              <div style="background:#e8f5e9;border-left:4px solid #4caf50;border-radius:6px;padding:16px;">
                <p style="margin:0 0 8px 0;font-weight:700;color:#2e7d32;font-size:13px;">✓ الحالة الحالية:</p>
                <p style="margin:0;color:#2e7d32;font-size:12px;">
                  🟢 هناك <strong>${usersArray.filter(([, d]) => d.canViewLog !== false).length}</strong> مستخدم مفعّل<br>
                  🔴 و <strong>${usersArray.filter(([, d]) => d.canViewLog === false).length}</strong> مستخدم معطّل
                </p>
              </div>
            `;

      document.getElementById("userLogControlContent").innerHTML = html;
      window.setUserLogAccess = function (username, enabled) {
        db.ref("users/" + username + "/canViewLog")
          .set(enabled)
          .then(() => {
            logActivity(
              "تحديث صلاحيات النشاطات",
              `تم ${enabled ? "✓ تفعيل" : "✕ تعطيل"} صلاحية سجل النشاطات للمستخدم: ${username}`
            );
            updateSidebarVisibility();
            // أعد تحميل الجدول
            document.getElementById("sidebarUserControlBtn").click();
          });
      };
    });
};

// ========== إعداد Firebase ==========
const firebaseConfig = {
  apiKey: "AIzaSyDh8KquT-8Slr6B5SAGoyGj2zOEusyiEg4",
  authDomain: "sjad-b3946.firebaseapp.com",
  databaseURL: "https://sjad-b3946-default-rtdb.firebaseio.com",
  projectId: "sjad-b3946",
  storageBucket: "sjad-b3946.appspot.com",
  messagingSenderId: "1001672753514",
  appId: "1:1001672753514:web:eac813b6e25621f5d16513",
  measurementId: "G-EV0NVW2036",
};
firebase.initializeApp(firebaseConfig);
var db = firebase.database();

// Helpers to resolve attendance/employees paths (new unified structure with legacy fallback)
function attendancePathForDay(dayKey) {
  try {
    if (!dayKey || typeof dayKey !== 'string') return `attendance/${dayKey}`;
    const parts = dayKey.split('-');
    if (parts.length >= 3) {
      const y = parts[0];
      const mm = String(Number(parts[1])).padStart(2, '0');
      return `months/${y}/${mm}/attendance/${dayKey}`;
    }
  } catch (e) { }
  return `attendance/${dayKey}`;
}

function attendanceRefForDay(dayKey) {
  return db.ref(attendancePathForDay(dayKey));
}

function monthEmployeesPath(year, mmKey) {
  if (!year || !mmKey) return null;
  return `months/${year}/${mmKey}/employees`;
}

// دوال إدارة قاعدة البيانات
function clearDatabase() {
  // نافذة إدخال كلمة مرور المدير
  let passModal = document.getElementById("adminPassModal");
  if (passModal) passModal.remove();
  passModal = document.createElement("div");
  passModal.id = "adminPassModal";
  passModal.style = `position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.35);z-index:9999;display:flex;align-items:center;justify-content:center;`;
  passModal.innerHTML = `
    <div style=\"background:#fff;max-width:350px;width:90vw;padding:22px 18px 18px 18px;border-radius:14px;box-shadow:0 8px 32px #0002;position:relative;text-align:center;\">
      <button id=\"closeAdminPassModalBtn\" style=\"position:absolute;top:10px;left:10px;background:#dc3545;color:white;border:none;border-radius:50%;width:32px;height:32px;font-size:18px;cursor:pointer;\">✖</button>
      <div style=\"font-size:17px;color:#333;margin-bottom:18px;\">يرجى إدخال كلمة مرور المدير للتأكيد:</div>
      <input id=\"adminPassInput\" type=\"password\" style=\"width:90%;padding:8px 10px;font-size:16px;border-radius:6px;border:1px solid #ccc;margin-bottom:14px;\" />
      <button id=\"adminPassConfirmBtn\" style=\"background:#007bff;color:white;padding:8px 18px;border:none;border-radius:6px;font-size:16px;cursor:pointer;\">تأكيد</button>
    </div>
  `;
  document.body.appendChild(passModal);
  document.getElementById("adminPassConfirmBtn").onclick = function () {
    const adminPass = document.getElementById("adminPassInput").value;
    passModal.remove();
    db.ref("users/admin/password")
      .once("value")
      .then(async (snapshot) => {
        const realAdminPass = snapshot.val();
        const ok = await verifyPassword(realAdminPass, adminPass);
        if (!ok) {
          alert("❌ كلمة المرور غير صحيحة!");
          return;
        }
        if (confirm("هل أنت متأكد من مسح جميع بيانات قاعدة البيانات؟")) {
          db.ref("/")
            .remove()
            .then(async () => {
              // إعادة إنشاء حساب المدير بعد المسح مباشرة بكلمة مرور مشفرة
              const hashObj = await hashPassword("admin");
              await db.ref("users/admin").set({
                password: hashObj,
                role: "admin",
                canEdit: true,
              });
              alert(
                "تم مسح جميع البيانات بنجاح! تم إعادة إنشاء حساب المدير الافتراضي."
              );
            })
            .catch((err) => alert("حدث خطأ أثناء المسح: " + err.message));
        }
      });
  };
  document.getElementById("closeAdminPassModalBtn").onclick =
    function () {
      passModal.remove();
    };
}

let employees = [];
let employeeIds = [];
// ========== استرجاع الجلسة عند تحديث الصفحة ========== (مع مراقبة صلاحية التعديل)
document.addEventListener("DOMContentLoaded", function () {
  // ميزة الإنشاء التلقائي لحساب المدير إذا تم حذفه
  db.ref("users/admin")
    .once("value")
    .then(async (snap) => {
      if (!snap.exists()) {
        let hashObj = null;
        if (typeof hashPassword === "function") {
          hashObj = await hashPassword("admin");
        } else {
          hashObj = "admin";
        }
        await db.ref("users/admin").set({
          password: hashObj,
          role: "admin",
          canEdit: true,
        });
        // Debug message removed: account auto-creation is silent in production
      }
    });

  // إظهار علامة التحميل فقط إذا كان المستخدم مسجل دخول
  var loader = document.getElementById("loaderSpinner");
  if (localStorage.getItem("loggedUser")) {
    loader.style.display = "flex";
    const userObj = JSON.parse(localStorage.getItem("loggedUser"));
    currentUser = userObj.user;
    currentUserRole = userObj.role;
    currentUserCanEdit = userObj.canEdit;
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("mainContent").style.display = "block";
    if (currentUserRole === "admin") {
      document.getElementById("adminPanel").style.display = "none";
      loadUsers();
      updateEmployeeDropdown();
      loadEmployeesTable();
    } else {
      document.getElementById("adminPanel").style.display = "none";
    }
    // جلب بيانات المستخدم وتخزينها في window.currentUserData مع تفعيل التحديث الفوري للصلاحيات
    db.ref("users/" + currentUser)
      .once("value")
      .then((snap) => {
        window.currentUserData = snap.val() || {};
        // تفعيل الاستماع اللحظي للصلاحيات بمجرد تسجيل الدخول التلقائي
        if (typeof startUserPermissionListener === 'function') {
          startUserPermissionListener(currentUser);
        }
        // عند تحميل الموظفين والجدول، إخفِ علامة التحميل فقط بعد اكتمال الجدول
        const empKey = `employees_${year}_${(month + 1)
          .toString()
          .padStart(2, "0")}`;
        loadEmployees(empKey).then(() => {
          generateTable();
          if (typeof tryShowUserEmpStats === "function")
            tryShowUserEmpStats();
        });
      });
    if (typeof checkForcedLogoutOnLogin === "function")
      checkForcedLogoutOnLogin(currentUser);
    if (typeof updateSidebarVisibility === "function")
      updateSidebarVisibility();
    // ensure announcements button visibility is updated after session restore
    if (typeof updateAnnouncementsVisibility === "function")
      updateAnnouncementsVisibility();
    if (typeof loadAvailableMonths === "function") loadAvailableMonths();
    if (typeof listenForNotifications === "function") {
      listenForNotifications();
    } else {
      // تأخير بسيط إذا لم تكن الدالة جاهزة بعد
      setTimeout(() => {
        if (typeof listenForNotifications === "function") {
          listenForNotifications();
        }
      }, 500);
    }

    // مراقبة صلاحية التعديل للمستخدم الحالي وتحديثها فوراً
    if (currentUser !== "admin") {
      db.ref("users/" + currentUser + "/canEdit").on(
        "value",
        function (snap) {
          const newCanEdit = !!snap.val();
          if (currentUserCanEdit !== newCanEdit) {
            currentUserCanEdit = newCanEdit;
            if (!window.currentUserData) window.currentUserData = {};
            window.currentUserData.canEdit = newCanEdit;
            updateEditabilityUI(newCanEdit);
            generateTable();
            if (!currentUserCanEdit) {
              showPermissionRevokedModal();
            }
          }
        }
      );
    }

    function updateEditabilityUI(canEdit) {
      document
        .querySelectorAll("select[data-attendance-select]")
        .forEach((sel) => {
          sel.disabled = !canEdit;
        });
      document
        .querySelectorAll(".btn-edit, .btn-save, .btn-delete, .btn-add")
        .forEach((btn) => {
          btn.disabled = !canEdit;
          if (!canEdit) btn.classList.add("disabled");
          else btn.classList.remove("disabled");
        });
    }
    ["allowedStatsEmps", "canViewSalary"].forEach((key) => {
      db.ref("users/" + currentUser + "/" + key).on(
        "value",
        function (snap) {
          if (!window.currentUserData) window.currentUserData = {};
          window.currentUserData[key] = snap.val();
          const monthFormatted = (typeof month !== 'undefined' ? String(month + 1).padStart(2, '0') : (new Date().getMonth() + 1).toString().padStart(2, '0'));
          const attendancePath = `months/${(typeof year !== 'undefined' ? year : new Date().getFullYear())}/${monthFormatted}/attendance`;
          db.ref(attendancePath).once("value").then((snap2) => {
            calculateStats(snap2.val() || {});
            if (typeof renderUserEmpStats === "function") renderUserEmpStats();
          }).catch(() => { });
        }
      );
    });
  }
});
const statuses = ["", "شفت", "نص", "❌"];
let month = new Date().getMonth();
const year = new Date().getFullYear();
const arMonths = [
  "يناير",
  "فبراير",
  "مارس",
  "إبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];
let currentUser = "";
let currentUserRole = "";
let currentUserCanEdit = false;

// ========== سجل النشاطات ==========
/* duplicate logActivity removed here — using the single shared
   implementation defined earlier which preserves formatting and
   optional styling for note-type entries. */

// ========== جلسة المستخدم ==========
function setSession(userObj) {
  currentUser = userObj.user;
  currentUserRole = userObj.role;
  currentUserCanEdit = userObj.canEdit;
  localStorage.setItem("loggedUser", JSON.stringify(userObj));
  // Ensure UI elements that depend on role (like announcements) update immediately
  try {
    if (typeof updateAnnouncementsVisibility === "function")
      updateAnnouncementsVisibility();
    if (typeof updateSidebarVisibility === "function")
      updateSidebarVisibility();
  } catch (e) {
    console.warn("Failed to update UI after setSession:", e);
  }
}
function clearSession() {
  if (typeof _userListenerRef !== 'undefined' && _userListenerRef && currentUser) {
    try {
      db.ref('users/' + currentUser).off('value', _userListenerRef);
    } catch(e) {}
    _userListenerRef = null;
  }
  window.currentUserData = null;
  currentUser = "";
  currentUserRole = "";
  currentUserCanEdit = false;
  localStorage.removeItem("loggedUser");
}

// ========== رسائل واجهة المستخدم ==========
function showMessage(message, isError = false) {
  const messageDiv = document.getElementById("loginMessage");
  if (!message) {
    messageDiv.innerHTML = "";
    messageDiv.className = "";
    return;
  }
  if (isError) {
    messageDiv.innerHTML = `
      <div style='animation:fadeIn 0.4s; background:linear-gradient(135deg,#fff6f6 60%,#ffe3e3 100%); border-radius:16px; box-shadow:0 6px 24px #d32f2f33; padding:22px 28px; display:flex; align-items:center; gap:18px; border:2.5px solid #d32f2f; margin:16px 0; position:relative;'>
        <span style='display:inline-block; animation:shake 0.5s;'>
          <svg width="38" height="38" viewBox="0 0 38 38" style="display:block;">
            <circle cx="19" cy="19" r="17" fill="#fff" stroke="#d32f2f" stroke-width="2.5"/>
            <line x1="12" y1="12" x2="26" y2="26" stroke="#d32f2f" stroke-width="3.5" stroke-linecap="round">
              <animate attributeName="stroke" values="#d32f2f;#ff1744;#d32f2f" dur="1.2s" repeatCount="indefinite"/>
            </line>
            <line x1="26" y1="12" x2="12" y2="26" stroke="#d32f2f" stroke-width="3.5" stroke-linecap="round">
              <animate attributeName="stroke" values="#d32f2f;#ff1744;#d32f2f" dur="1.2s" repeatCount="indefinite"/>
            </line>
          </svg>
        </span>
        <span style='color:#d32f2f; font-weight:bold; font-size:19px; letter-spacing:0.5px; text-shadow:0 2px 8px #d32f2f22;'>${message}</span>
      </div>
      
    `;
    messageDiv.className = "error";
  } else if (message.includes("جاري تسجيل الدخول")) {
    messageDiv.innerHTML = `
      <div style='animation:fadeIn 0.4s; background:#f6f8fa; border-radius:12px; box-shadow:0 2px 12px #1976d222; padding:13px 18px; display:flex; align-items:center; gap:10px; border:1.5px solid #1976d2; margin:8px 0;'>
        <span class='login-spinner' style='width:24px;height:24px;display:inline-block;'>
          <svg width='24' height='24' viewBox='0 0 50 50' style='animation:spin 0.8s linear infinite;'>
            <circle cx='25' cy='25' r='20' fill='none' stroke='#e3eafc' stroke-width='6'/>
            <circle cx='25' cy='25' r='20' fill='none' stroke='#1976d2' stroke-width='6' stroke-linecap='round' stroke-dasharray='60 90' stroke-dashoffset='0'/>
          </svg>
        </span>
        <span style='color:#1976d2; font-weight:bold; font-size:16px;'>${message}</span>
      </div>
      
    `;
    messageDiv.className = "loading";
  } else {
    messageDiv.innerHTML = `
      <div style='animation:fadeIn 0.4s; background:#e3f0ff; border-radius:12px; box-shadow:0 2px 12px #1976d222; padding:13px 18px; display:flex; align-items:center; gap:10px; border:1.5px solid #1976d2; margin:8px 0;'>
        <span style='color:#1976d2; font-weight:bold; font-size:16px;'>${message}</span>
      </div>
      
    `;
    messageDiv.className = "loading";
  }
}

// ========== تسجيل الدخول ==========
// ========== Welcome Screen Functions ==========
function updateWelcomeScreenData(username) {
  const welcomeScreen = document.getElementById("welcomeScreen");
  if (!welcomeScreen) return;

  // Update welcome screen with user data
  document.getElementById("welcomeAccountName").textContent = username;

  // Get assigned employee for this user from userData
  let employeeName = username;
  if (window.currentUserData && window.currentUserData.assignedEmployee) {
    employeeName = window.currentUserData.assignedEmployee;
  } else if (employees && employees.length > 0) {
    employeeName = employees[0] || username;
  }
  document.getElementById("welcomeEmployeeName").textContent = employeeName;

  // Get attendance counts for current month from savedData
  let shift = 0, halves = 0, vac = 0, salary = 0;

  try {
    // Use global savedData that was set in generateTable
    const data = window.savedData || {};

    // Count attendance for this employee in current month
    Object.entries(data).forEach(([dateStr, day]) => {
      // Skip metadata keys
      if (dateStr.startsWith('__')) return;

      if (day && typeof day === 'object') {
        let parts = dateStr.split("-");
        if (parts.length === 3) {
          let dYear = parseInt(parts[0]);
          let dMonth = parseInt(parts[1]) - 1;
          // Check if this date is in the current month and year
          if (dYear === year && dMonth === month) {
            if (day[employeeName]) {
              const val = day[employeeName];
              if (val === "شفت") shift++;
              else if (val === "نص") halves++;
              else if (val === "❌") vac++;
            }
          }
        }
      }
    });

    // Get salary rates
    let shiftRate = 22000;
    let halfRate = 11000;
    try {
      if (salaryRates && salaryRates[year]) {
        const ratesData = salaryRates[year][(month + 1).toString().padStart(2, '0')];
        if (ratesData) {
          shiftRate = ratesData.shift || 22000;
          halfRate = ratesData.half || 11000;
        }
      }
    } catch (e) {
      console.log("Error getting salary rates:", e);
    }

    salary = (shift * shiftRate) + (halves * halfRate);
  } catch (e) {
    console.error("Error loading welcome screen data:", e);
    // استمر حتى لو حدث خطأ
    shift = 0;
    halves = 0;
    vac = 0;
    salary = 0;
  }

  document.getElementById("welcomeShifts").textContent = shift;
  document.getElementById("welcomeHalves").textContent = halves;
  document.getElementById("welcomeVacations").textContent = vac;
  document.getElementById("welcomeSalary").textContent = salary.toLocaleString() + " د.ع";

  // Show welcome screen
  welcomeScreen.style.display = "flex";
}

function showWelcomeScreen(username) {
  const welcomeScreen = document.getElementById("welcomeScreen");
  if (!welcomeScreen) return;

  // Update welcome screen with user data
  document.getElementById("welcomeAccountName").textContent = username;

  // Get assigned employee for this user from userData
  let employeeName = username;
  if (window.currentUserData && window.currentUserData.assignedEmployee) {
    employeeName = window.currentUserData.assignedEmployee;
  } else if (employees && employees.length > 0) {
    employeeName = employees[0] || username;
  }
  document.getElementById("welcomeEmployeeName").textContent = employeeName;

  // Get attendance counts for current month from savedData
  let shift = 0, vac = 0, salary = 0;

  try {
    // Count attendance for this employee in current month
    if (savedData) {
      Object.entries(savedData).forEach(([dateStr, day]) => {
        let parts = dateStr.split("-");
        if (parts.length === 3) {
          let dYear = parseInt(parts[0]);
          let dMonth = parseInt(parts[1]) - 1;
          if (dYear === year && dMonth === month && day && day[employeeName]) {
            const val = day[employeeName];
            if (val === "شفت") shift++;
            else if (val === "❌") vac++;
          }
        }
      });
    }

    // Get salary rates
    let shiftRate = 22000;
    let halfRate = 11000;
    try {
      if (salaryRates && salaryRates[year]) {
        const ratesData = salaryRates[year][(month + 1).toString().padStart(2, '0')];
        if (ratesData) {
          shiftRate = ratesData.shift || 22000;
          halfRate = ratesData.half || 11000;
        }
      }
    } catch (e) { }

    salary = shift * shiftRate;
  } catch (e) {
    console.error("Error loading welcome screen data:", e);
    // استمر حتى لو حدث خطأ
    shift = 0;
    vac = 0;
    salary = 0;
  }

  document.getElementById("welcomeShifts").textContent = shift;
  document.getElementById("welcomeVacations").textContent = vac;
  document.getElementById("welcomeSalary").textContent = salary.toLocaleString() + " د.ع";

  // Show welcome screen
  welcomeScreen.style.display = "flex";
}

function closeWelcomeScreen() {
  const welcomeScreen = document.getElementById("welcomeScreen");
  if (welcomeScreen) {
    welcomeScreen.style.display = "none";
  }
  // Now show the main content
  document.getElementById("mainContent").style.display = "block";
}

// ====== Supervisor Permissions System ======
window.hasPermission = function(permission) {
  if (typeof currentUserRole !== 'undefined' && currentUserRole === 'admin') return true;
  if (typeof window.currentUserData !== 'undefined' && window.currentUserData.supervisorPermissions) {
    if (window.currentUserData.supervisorPermissions[permission] === true) return true;
  }
  return false;
};

let _userListenerRef = null;
function startUserPermissionListener(username) {
  if (!username) return;
  if (_userListenerRef) db.ref('users/' + currentUser).off('value', _userListenerRef);
  
  _userListenerRef = db.ref('users/' + username).on('value', (snap) => {
    const data = snap.val();
    if (!data) return;
    window.currentUserData = data;
    // Real-time visibility update if permissions are revoked/granted while using the app
    if (typeof updateAdminTabsVisibility === 'function') updateAdminTabsVisibility();
    if (typeof updateSidebarVisibility === 'function') updateSidebarVisibility();
    if (typeof updateAnnouncementsVisibility === 'function') updateAnnouncementsVisibility();
    if (typeof checkForcedLogoutOnLogin === 'function') checkForcedLogoutOnLogin(username);
  });
}

function openSupervisorModal(username, btn) {
  if (currentUserRole !== 'admin') {
    alert("❌ عذراً، الإدارة الرئيسية فقط لها هذه الصلاحية");
    return;
  }
  db.ref('users/' + username).once('value').then(snap => {
    const data = snap.val() || {};
    const perms = data.supervisorPermissions || {};
    
    document.getElementById('supervisorTargetUser').textContent = username;
    document.getElementById('supervisorTargetUser').setAttribute('data-target', username);
    
    document.getElementById('permAdvances').checked = !!perms.advances;
    document.getElementById('permAnnouncements').checked = !!perms.announcements;
    document.getElementById('permStaff').checked = !!perms.staff;
    document.getElementById('permSalary').checked = !!perms.salary;
    
    document.getElementById('supervisorModal').style.display = 'flex';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const closeSupervisorModal = document.getElementById('closeSupervisorModal');
  if (closeSupervisorModal) closeSupervisorModal.onclick = () => document.getElementById('supervisorModal').style.display = 'none';

  const saveBtn = document.getElementById('saveSupervisorBtn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const username = document.getElementById('supervisorTargetUser').getAttribute('data-target');
      if (!username) return;
      
      const perms = {
        advances: document.getElementById('permAdvances').checked,
        announcements: document.getElementById('permAnnouncements').checked,
        staff: document.getElementById('permStaff').checked,
        salary: document.getElementById('permSalary').checked
      };

      saveBtn.textContent = "جاري الحفظ...";
      saveBtn.disabled = true;

      db.ref('users/' + username + '/supervisorPermissions').set(perms).then(() => {
        showToast("✅ تم تحديث صلاحيات المشرف بنجاح");
        logActivity("تعديل صلاحيات المشرف", "تم تعديل صلاحيات المستخدم: " + username);
        document.getElementById('supervisorModal').style.display = 'none';
      }).catch(err => {
        console.error(err);
        showToast("❌ حدث خطأ أثناء حفظ الصلاحيات", "error");
      }).finally(() => {
        saveBtn.textContent = "💾 حفظ التعديلات";
        saveBtn.disabled = false;
      });
    };
  }
});

function login() {
  const username = document
    .getElementById("username")
    .value.trim()
    .toLowerCase();
  const password = document.getElementById("password").value.trim();
  if (!username || !password)
    return showMessage(" يرجى إدخال اسم المستخدم وكلمة المرور", true);
  showMessage(" جاري تسجيل الدخول...");
  db.ref("users/" + username)
    .once("value")
    .then(async (snapshot) => {
      if (!snapshot.exists()) throw new Error("User not found");
      const userData = snapshot.val();
      const storedPass = userData.password;
      // debug logs removed
      const ok = await verifyPassword(storedPass, password);
      if (!ok) throw new Error("Wrong password");
      // If maintenance is enabled in DB, block non-admin users from logging in
      try {
        const mSnap = await db.ref('system/maintenance').once('value');
        const mState = mSnap.val() || { enabled: false };
        if (mState.enabled && (!userData || (userData.role !== 'admin' && username !== 'admin'))) {
          throw new Error('MaintenanceMode');
        }
      } catch (e) { if (e.message === 'MaintenanceMode') throw e; }
      // إذا legacy، حدث كلمة المرور فوراً إلى صيغة hash
      if (typeof storedPass === "string") {
        const hashObj = await hashPassword(password);
        await db.ref("users/" + username + "/password").set(hashObj);
      }
      // Store userData globally first so permissions check works inside setSession
      window.currentUserData = userData;
      setSession({
        user: username,
        role: userData.role || "user",
        canEdit: userData.canEdit !== undefined ? userData.canEdit : true,
      });
      startUserPermissionListener(username);
      showMessage("");
      document.getElementById("loginBox").style.display = "none";

      // Show welcome screen placeholder first
      const welcomeScreen = document.getElementById("welcomeScreen");
      if (welcomeScreen) {
        welcomeScreen.style.display = "flex";
        // Update basic info immediately
        document.getElementById("welcomeAccountName").textContent = username;
      }

      const empKey = `employees_${year}_${(month + 1)
        .toString()
        .padStart(2, "0")}`;
      loadEmployees(empKey).then(() => {
        generateTable();
        // After employees are loaded, update welcome screen with actual data
        setTimeout(() => {
          updateWelcomeScreenData(username);
        }, 100);
      });
      document.getElementById("adminPanel").style.display = "none";
      if (currentUserRole === "admin") {
        loadUsers();
      }
      if (hasPermission('staff') || hasPermission('advances') || hasPermission('salary') || currentUserRole === 'admin') {
        loadEmployeesTable();
        updateEmployeeDropdown();
      }

      // تحميل إعدادات تيليجرام لتفعيل النسخ التلقائي (للمدير فقط)
      if (currentUserRole === "admin") {
        setTimeout(() => {
          if (typeof loadTelegramSettings === 'function') {
            loadTelegramSettings();
          }
        }, 500);
      }
      // update announcements visibility immediately after login UI changes
      if (typeof updateAnnouncementsVisibility === "function")
        updateAnnouncementsVisibility();
      checkForcedLogoutOnLogin(username);
    })
    .catch((error) => {
      showMessage(
        error.message === "User not found"
          ? " اسم المستخدم غير موجود"
          : (
            error.message === 'MaintenanceMode' ? ' هناك خطأ في النظام حاول مجددا في وقت لاحق' : ' كلمة المرور غير صحيحة'
          ),
        true
      );
      console.error("[LOGIN ERROR]", error);
    });
}

function logout() {
  clearSession();
  document.getElementById("loginBox").style.display = "block";
  document.getElementById("mainContent").style.display = "none";
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  showMessage("");
  var sm = document.getElementById("sidebarMenu");
  if (sm) {
    sm.classList.remove("open");
  }
  var stb = document.getElementById("sidebarToggleBtn");
  if (stb) stb.style.display = "none";
  var scb = document.getElementById("sidebarCloseBtn");
  if (scb) scb.style.display = "none";
}

// ========== تحميل الموظفين ==========
function loadEmployees() {
  // إظهار علامة التحميل
  document.getElementById("loaderSpinner").style.display = "flex";
  // new structured path: months/<year>/<MM>/employees
  const mm = (month + 1).toString().padStart(2, "0");
  const empKey = `employees_${year}_${mm}`;
  const newPath = `months/${year}/${mm}/employees`;

  // Helper to migrate a single month from old path to new path (non-destructive)
  function migrateEmployeesForMonthIfNeeded(yearArg, monthArg, oldEmpKey, newPathArg) {
    // Copy data from old path to new path only if new path is empty
    return db
      .ref(newPathArg)
      .once("value")
      .then((newSnap) => {
        if (newSnap.exists()) return Promise.resolve(false); // already migrated
        return db.ref("employees/" + oldEmpKey).once("value").then((oldSnap) => {
          if (!oldSnap.exists()) return false;
          const oldObj = oldSnap.val() || {};
          const toWrite = {};
          Object.entries(oldObj).forEach(([id, name]) => {
            // store as object for future extensibility but keep name exact
            toWrite[id] = { name: name, migratedFrom: `employees/${oldEmpKey}` };
          });
          // write copy to new structured path (non-destructive to old data)
          return db
            .ref(newPathArg)
            .set(toWrite)
            .then(() => true)
            .catch((e) => {
              console.error("Migration write failed:", e);
              return false;
            });
        });
      });
  }

  // Try new structured path first, fallback to legacy path if missing.
  return db
    .ref(newPath)
    .once("value")
    .then((snapshot) => {
      if (snapshot.exists()) {
        const empObj = snapshot.val() || {};
        // empObj may have values either as objects {name:..} or plain strings
        employees = Object.values(empObj).map((v) => (typeof v === "string" ? v : v.name));
        employeeIds = Object.keys(empObj);
        // continue with UI updates below
        return { migrated: false };
      }
      // new path empty -> fallback to old legacy path
      return db
        .ref("employees/" + empKey)
        .once("value")
        .then((oldSnap) => {
          const empObj = oldSnap.exists() ? oldSnap.val() : {};
          employees = Object.values(empObj);
          employeeIds = Object.keys(empObj);
          // attempt to copy to new structured path in background (non-destructive)
          migrateEmployeesForMonthIfNeeded(year, month, empKey, newPath).then((ok) => {
            // migration performed silently; no debug logging
          });
          return { migrated: true };
        });
    })
    .then(() => {
      const theadRow = document.querySelector("#attendanceTable thead tr");
      while (theadRow.children.length > 1) theadRow.removeChild(theadRow.lastChild);
      if (theadRow.children.length > 0) {
        const firstTh = theadRow.children[0];
        firstTh.style.background = "#e3f0ff";
        firstTh.style.color = "#222";
        firstTh.style.fontWeight = "bold";
        firstTh.style.fontSize = "17px";
        firstTh.style.border = "1px solid #b0bec5";
        firstTh.style.boxShadow = "none";
        firstTh.style.letterSpacing = "0.5px";
        firstTh.style.borderRadius = "0";
        firstTh.style.transition = "background 0.2s";
      }
      employees.forEach((emp) => {
        const th = document.createElement("th");
        th.textContent = emp;
        th.style.background = "#e3f0ff";
        th.style.color = "#222";
        th.style.fontWeight = "bold";
        th.style.cursor = "pointer";
        th.title = "عرض التفاصيل";
        th.onclick = function () { showEmployeeDetails(emp); };
        th.style.fontSize = "17px";
        th.style.border = "1px solid #b0bec5";
        th.style.boxShadow = "none";
        th.style.letterSpacing = "0.5px";
        th.style.borderRadius = "0";
        th.style.transition = "background 0.2s";
        theadRow.appendChild(th);
      });
      loadEmployeesTable();
      // expose employees globally for compatibility with admin UI
      try { window.employees = employees; window.employeeIds = employeeIds; } catch (e) { }
      setTimeout(function () {
        document.getElementById("loaderSpinner").style.display = "none";
      }, 350);
    });
}

// ========== جدول الحضور ==========
// نسخ قائمة الموظفين من الشهر السابق إلى الشهر الحالي إذا لم تكن موجودة، مع احترام إعدادات الأشهر
function ensureMonthEmployees() {
  const empKey = `employees_${year}_${(month + 1)
    .toString()
    .padStart(2, "0")}`;
  // تحقق من إعدادات الأشهر
  // لم يعد هناك نسخ تلقائي للموظفين من الشهر السابق
  return Promise.resolve();
}

// استدعاء الدالة عند تغيير الشهر أو السنة
window.addEventListener("DOMContentLoaded", ensureMonthEmployees);
function getDays() {
  const days = [];
  let date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    const dayKey = `${year}-${month + 1}-${date.getDate()}`;
    const dayLabel = `${date.getDate()} ${arMonths[month]
      } (${date.toLocaleDateString("ar-EG", { weekday: "long" })})`;
    days.push({ key: dayKey, label: dayLabel });
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function generateTable() {
  // إظهار علامة التحميل
  document.getElementById("loaderSpinner").style.display = "flex";
  const days = getDays();
  const monthFormatted = String(month + 1).padStart(2, '0');
  const attendancePath = `months/${year}/${monthFormatted}/attendance`;

  // تحديث عنوان الجدول باسم الشهر الحالي
  document.querySelector(
    "#mainContent h2"
  ).textContent = `📋 جدول الحضور - ${arMonths[month]}`;
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";
  // إخفاء رأس عمود التاريخ أثناء التحميل
  var dateHeader = document.getElementById("dateHeaderTh");
  if (dateHeader) dateHeader.style.display = "none";
  db.ref(attendancePath)
    .once("value")
    .then((snapshot) => {
      const savedData = snapshot.val() || {};
      // الموظفين لهذا الشهر فقط من قاعدة البيانات الشهرية
      let monthEmployees = employees.slice();
      days.forEach((day, dayIndex) => {
        const row = document.createElement("tr");
        const dateCell = document.createElement("td");
        let dateContent = toEnglishNumbers(day.label);
        if (savedData[day.key] && savedData[day.key].__editor) {
          const ts = savedData[day.key].__editedAt || "";
          const editor = savedData[day.key].__editor;
          const color = editor === "admin" ? "#1fa745" : "#dc3545";
          dateContent += `<div class='editor-tag' style="color:${color};font-weight:bold;">
          📝 ${editor}${ts ? " - " + toEnglishNumbers(ts) : ""}
        </div>`;
        }
        // عند الضغط على اليوم، افتح نافذة التفاصيل
        // للحفاظ على المظهر القديم تماماً نعيد innerHTML كما كان، ثم نربط الحدث بشكل آمن
        dateCell.innerHTML = `<span style='cursor:pointer;'>${dateContent}</span>`;
        const spanEl = dateCell.querySelector('span');
        if (spanEl) {
          spanEl.addEventListener('click', function () {
            try {
              showDayDetailsModal(day.key, day.label);
            } catch (e) {
              console && console.error && console.error('showDayDetailsModal error', e);
            }
          });
        }
        row.appendChild(dateCell);
        monthEmployees.forEach((employee, empIndex) => {
          const cell = document.createElement("td");
          const select = document.createElement("select");
          select.id = `d${dayIndex}e${empIndex}`;
          statuses.forEach((status) => {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status;
            select.appendChild(option);
          });
          if (
            savedData[day.key] &&
            savedData[day.key][employee] !== undefined
          ) {
            select.value = savedData[day.key][employee];
          }
          if (select.value === "شفت") {
            cell.style.background = "#d4edda";
            cell.style.boxShadow = "none";
            cell.style.color = "";
            select.style.color = "";
          } else if (select.value === "نص") {
            cell.style.background = "#fff9db";
            cell.style.boxShadow = "none";
            cell.style.color = "";
            select.style.color = "";
          } else if (select.value === "\u274c") {
            cell.style.background = "#ffe3e3";
            cell.style.boxShadow = "none";
            cell.style.color = "#d32f2f";
            select.style.color = "#d32f2f";
          } else {
            /* Empty — inset shadow acts as a subtle dashed-style indicator */
            cell.style.background = "#f5f7fa";
            cell.style.boxShadow = "inset 0 0 0 1px #c8d0dc";
            cell.style.color = "";
            select.style.color = "#bbb";
          }
          if (!currentUserCanEdit || !isCurrentMonthSelected()) {
            select.setAttribute("disabled", "disabled");
            select.addEventListener("change", (e) => {
              e.target.value = savedData[day.key]
                ? savedData[day.key][employee]
                : "";
            });
          }
          select.addEventListener("change", function () {
            if (this.value === "شفت") {
              cell.style.background = "#d4edda";
              cell.style.boxShadow = "none";
              cell.style.color = "";
              select.style.color = "";
            } else if (this.value === "نص") {
              cell.style.background = "#fff9db";
              cell.style.boxShadow = "none";
              cell.style.color = "";
              select.style.color = "";
            } else if (this.value === "\u274c") {
              cell.style.background = "#ffe3e3";
              cell.style.boxShadow = "none";
              cell.style.color = "#d32f2f";
              select.style.color = "#d32f2f";
            } else {
              cell.style.background = "#f5f7fa";
              cell.style.boxShadow = "inset 0 0 0 1px #c8d0dc";
              cell.style.color = "";
              select.style.color = "#bbb";
            }
          });
          cell.appendChild(select);
          row.appendChild(cell);
        });
        tbody.appendChild(row);
      });
      // تعطيل زر الحفظ إذا لم يكن الشهر الحالي أو لا يوجد صلاحية
      const saveBtn = document.querySelector(
        'button[onclick="saveData()"]'
      );
      if (saveBtn)
        saveBtn.disabled =
          !currentUserCanEdit || !isCurrentMonthSelected();
      calculateStats(savedData);
      // Save savedData globally for use in other functions
      window.savedData = savedData;
      if (typeof renderUserEmpStats === "function") renderUserEmpStats();
      // إظهار رأس عمود التاريخ بعد اكتمال تحميل الجدول
      if (dateHeader) dateHeader.style.display = "";
      // إخفاء علامة التحميل بعد اكتمال التحميل
      setTimeout(function () {
        document.getElementById("loaderSpinner").style.display = "none";
        // Update welcome screen after all data is loaded
        if (window.currentUser) {
          updateWelcomeScreenData(window.currentUser);
        }
      }, 350);
    });
  // تعطيل جميع select وinput وtextarea وأزرار الحفظ إذا فقدت الصلاحية (احتياطي)
  setTimeout(() => {
    if (!currentUserCanEdit || !isCurrentMonthSelected()) {
      document
        .querySelectorAll(
          "#mainContent select, #mainContent input, #mainContent textarea"
        )
        .forEach((el) => {
          el.setAttribute("disabled", "disabled");
        });
      const saveBtn = document.querySelector(
        'button[onclick="saveData()"]'
      );
      if (saveBtn) saveBtn.disabled = true;
    } else {
      document
        .querySelectorAll(
          "#mainContent select, #mainContent input, #mainContent textarea"
        )
        .forEach((el) => {
          el.removeAttribute("disabled");
        });
      const saveBtn = document.querySelector(
        'button[onclick="saveData()"]'
      );
      if (saveBtn) saveBtn.disabled = false;
    }
  }, 100);
}

// ========== حفظ البيانات ==========

// Unified permission check for editing current month
function canEditCurrentMonth() {
  if (!isCurrentMonthSelected()) {
    showToast("❌ لا يمكن تعديل جدول الحضور لشهر سابق.", "error");
    return false;
  }
  if (!currentUserCanEdit) {
    showToast("❌ ليس لديك صلاحية تعديل الجدول.", "error");
    return false;
  }
  return true;
}

// Unified save function for attendance (days/employees)
async function saveAttendanceData() {
  if (!canEditCurrentMonth()) return;
  const days = getDays();
  const monthFormatted = String(month + 1).padStart(2, '0');
  const attendancePath = `months/${year}/${monthFormatted}/attendance`;

  try {
    const attendanceSnapshot = await db.ref(attendancePath).once("value");
    const savedData = attendanceSnapshot.val() || {};
    const updatedData = { ...savedData };
    let changes = [];
    let anyChange = false;
    days.forEach((day, dayIndex) => {
      if (!updatedData[day.key]) updatedData[day.key] = {};
      let dayChanged = false;
      employees.forEach((employee, empIndex) => {
        const selectElement = document.getElementById(
          `d${dayIndex}e${empIndex}`
        );
        if (selectElement) {
          const newValue = selectElement.value;
          const oldValue = (savedData[day.key] && savedData[day.key][employee] !== undefined)
            ? savedData[day.key][employee]
            : "";
          if (newValue !== oldValue) {
            updatedData[day.key][employee] = newValue;
            dayChanged = true;
            anyChange = true;
            changes.push({
              user: currentUser,
              day: day.key,
              employee,
              old: oldValue,
              new: newValue,
              time: formatDateTimeNoSeconds(new Date()),
            });
          }
        }
      });
      if (dayChanged) {
        updatedData[day.key].__editor = currentUser;
        const now = new Date();
        updatedData[day.key].__editedAt = formatDateTimeNoSeconds(now);
      }
    });
    if (!anyChange) {
      showToast("لا يوجد أي تعديل لحفظه.", "info");
      return;
    }
    await db.ref(attendancePath).set(updatedData);
    showToast("✅ تم حفظ التعديلات بنجاح");
    generateTable();
    changes.forEach((change) => {
      logActivity(
        "تعديل جدول الحضور",
        `
          <span style=\"color:#007bff;font-weight:bold;\">${change.user}</span>
          قام بتعديل حضور الموظف
          <span style=\"color:#673ab7;font-weight:bold;\">${change.employee
        }</span>
          في اليوم
          <span style=\"color:#009688;font-weight:bold;\">${change.day}</span>
          من
          ${getStatusBadgeHtml(change.old)}
          إلى
          ${getStatusBadgeHtml(change.new)}
        `,
        { time: change.time, user: change.user }
      );
    });
  } catch (error) {
    console.error("خطأ في حفظ البيانات:", error);
    showToast("❌ خطأ في حفظ البيانات", "error");
  }
}

// Unified save function for employees (add/update/delete)
async function saveEmployees(newEmployees) {
  if (!canEditCurrentMonth()) return;
  const mm = (month + 1).toString().padStart(2, "0");
  const empKey = `employees_${year}_${mm}`;
  const newPath = `months/${year}/${mm}/employees`;
  try {
    // توليد معرفات فريدة للموظفين الجدد إذا لم تكن موجودة
    let empObj = {};
    newEmployees.forEach((name, idx) => {
      // إذا كان الاسم موجود بالفعل بنفس المعرف، احتفظ به
      let id =
        employeeIds[idx] ||
        "id" + Date.now() + "_" + Math.floor(Math.random() * 10000);
      // store as object for new structured format
      empObj[id] = { name: name };
    });
    // write primary copy to new structured path
    await db.ref(newPath).set(empObj);
    // ALSO keep a legacy-compatible plain string copy under employees/<empKey>
    const legacyObj = {};
    Object.entries(empObj).forEach(([id, obj]) => {
      legacyObj[id] = obj.name;
    });
    await db.ref("employees/" + empKey).set(legacyObj).catch((e) => {
      // non-fatal: log but continue
      console.warn("Failed to write legacy copy for employees:", e);
    });
    // ترتيب حسب الإضافة وليس أبجدي
    employees = Object.values(empObj).map((v) => v.name);
    employeeIds = Object.keys(empObj);
    window.monthEmployees = employees.slice();
    loadEmployeesTable();
    generateTable();
    showToast("✅ تم تحديث الموظفين لهذا الشهر فقط");
    logActivity(
      "تحديث الموظفين",
      `تم تحديث قائمة الموظفين لهذا الشهر: ${employees.join(", ")}`
    );
  } catch (err) {
    console.error(err);
    alert("❌ حدث خطأ أثناء تحديث الموظفين");
  }
}

// Replace old saveData with unified function
function saveData() {
  saveAttendanceData();
}

// ========== إدارة المستخدمين والموظفين ==========
// ========== إدارة المستخدمين ==========
// نافذة تأكيد احترافية
function showConfirmModal(message, onConfirm, onCancel) {
  let oldModal = document.getElementById("customConfirmModal");
  if (oldModal) oldModal.remove();
  const modal = document.createElement("div");
  modal.id = "customConfirmModal";
  modal.style = `position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.35);z-index:9999;display:flex;align-items:center;justify-content:center;`;
  modal.innerHTML = `
    <div style=\"background:#fff;max-width:370px;width:92vw;padding:26px 18px 20px 18px;border-radius:16px;box-shadow:0 8px 32px #0002;position:relative;text-align:center;animation:fadeIn 0.3s;\">
      <button id=\"closeConfirmModalBtn\" style=\"position:absolute;top:10px;left:10px;background:#dc3545;color:white;border:none;border-radius:50%;width:32px;height:32px;font-size:18px;cursor:pointer;transition:background 0.2s;\">✖</button>
      <div style=\"font-size:18px;color:#333;margin-bottom:20px;font-weight:500;\">${message}</div>
      <div style=\"display:flex;gap:12px;justify-content:center;\">
        <button id=\"confirmModalYes\" style=\"background:#007bff;color:white;padding:10px 22px;border:none;border-radius:7px;font-size:17px;cursor:pointer;box-shadow:0 2px 8px #007bff22;transition:background 0.2s;\">تأكيد</button>
        <button id=\"confirmModalNo\" style=\"background:#6c757d;color:white;padding:10px 22px;border:none;border-radius:7px;font-size:17px;cursor:pointer;box-shadow:0 2px 8px #6c757d22;transition:background 0.2s;\">إلغاء</button>
      </div>
    </div>
    
  `;
  document.body.appendChild(modal);
  document.getElementById("confirmModalYes").onclick = () => {
    modal.remove();
    if (onConfirm) onConfirm();
  };
  document.getElementById("confirmModalNo").onclick = () => {
    modal.remove();
    if (onCancel) onCancel();
  };
  document.getElementById("closeConfirmModalBtn").onclick = () => {
    modal.remove();
    if (onCancel) onCancel();
  };
}
// تحميل جدول المستخدمين
// Update employee dropdown with current employees list
function updateEmployeeDropdown() {
  const select = document.getElementById("newUserEmployee");
  if (!select || !employees) return;

  const currentValue = select.value;
  select.innerHTML = '<option value="">-- اختر موظف (اختياري) --</option>';
  employees.forEach(emp => {
    const option = document.createElement("option");
    option.value = emp;
    option.textContent = emp;
    select.appendChild(option);
  });
  select.value = currentValue;
}

// Assign employee to user
async function assignEmployeeToUser(username) {
  if (currentUserRole !== "admin") {
    alert("غير مصرح لك بتعيين موظفين للمستخدمين.");
    return;
  }
  const snap = await db.ref("users/" + username).once("value");
  const targetUser = snap.val();
  if (targetUser && targetUser.role === "admin") {
    alert("لا يمكن التعديل على حساب المدير.");
    return;
  }
  if (!employees || employees.length === 0) {
    alert("❌ لا توجد موظفين محملين");
    return;
  }

  let empSelect = `<select id="empSelect" style="width:100%;padding:8px;border:2px solid #e0e6f8;border-radius:8px;margin:10px 0;">`;
  empSelect += '<option value="">-- لا يوجد تخصيص --</option>';
  employees.forEach(emp => {
    empSelect += `<option value="${emp}">${emp}</option>`;
  });
  empSelect += '</select>';

  const modal = document.createElement("div");
  modal.style = `position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;`;
  modal.innerHTML = `
          <div style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.2);max-width:400px;width:95%;">
            <h3 style="margin:0 0 16px 0;color:#1976d2;text-align:center;">تحديد موظف للمستخدم: <strong>${username}</strong></h3>
            <div style="margin:16px 0;text-align:right;">
              <label style="font-weight:600;color:#333;display:block;margin-bottom:8px;">الموظف المحدد:</label>
              ${empSelect}
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;">
              <button onclick="this.parentElement.parentElement.parentElement.remove()" style="padding:10px 16px;background:#dc3545;color:#fff;border:none;border-radius:8px;cursor:pointer;">إلغاء</button>
              <button onclick="saveEmployeeAssignment('${username}', document.getElementById('empSelect').value, this.parentElement.parentElement.parentElement)" style="padding:10px 16px;background:#28a745;color:#fff;border:none;border-radius:8px;cursor:pointer;">حفظ</button>
            </div>
          </div>
        `;
  document.body.appendChild(modal);
}

async function saveEmployeeAssignment(username, employee, modal) {
  try {
    const updateData = {};
    if (employee) {
      updateData.assignedEmployee = employee;
    } else {
      updateData.assignedEmployee = null;
    }
    await db.ref("users/" + username).update(updateData);
    showToast("✅ تم تحديث الموظف المحدد بنجاح");
    modal.remove();
    loadUsers();
  } catch (err) {
    console.error(err);
    alert("❌ حدث خطأ أثناء حفظ الموظف المحدد");
  }
}

async function loadUsers() {
  const snapshot = await db.ref("users").once("value");
  const users = snapshot.val() || {};
  const tbody = document.getElementById("usersBody");
  tbody.innerHTML = "";

  Object.entries(users).forEach(([username, data]) => {
    const assignedEmp = data.assignedEmployee || null;
    const isMe = username === currentUser;
    const isAdmin = username === 'admin';
    const roleLabel = isAdmin ? "مدير" : (data.role === "supervisor" ? "مشرف" : "مستخدم");
    const roleClass = isAdmin ? "role-admin" : (data.role === "supervisor" ? "role-supervisor" : "role-user");

    const tr = document.createElement("tr");
    tr.className = "user-card-row";
    tr.innerHTML = `
      <td colspan="9" style="padding:0 0 10px 0;border:none;background:transparent;">
        <div class="uc">
          <!-- Top: identity row -->
          <div class="uc-top">
            <div class="uc-avatar ${roleClass}">${username.charAt(0).toUpperCase()}</div>
            <div class="uc-info">
              <div class="uc-name">
                ${username}
                ${isMe ? '<span class="uc-badge uc-badge-me">أنت</span>' : ''}
              </div>
              <div class="uc-meta">
                <span class="uc-badge ${roleClass}">${roleLabel}</span>
                ${assignedEmp ? `<span class="uc-emp">👤 ${assignedEmp}</span>` : ''}
                <span class="uc-status ${data.canEdit ? 'on' : 'off'}">${data.canEdit ? '● مفعّل' : '● للقراءة'}</span>
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="uc-divider"></div>

          <!-- Bottom: actions -->
          <div class="uc-actions">
            <!-- Primary actions -->
            <button class="uc-btn ${data.canEdit ? 'uc-btn-warn' : 'uc-btn-ok'}"
              onclick="toggleUserEdit('${username}', ${data.canEdit})"
              title="${data.canEdit ? 'قفل صلاحية التعديل' : 'فتح صلاحية التعديل'}">
              ${data.canEdit ? '🔒 قفل' : '🔓 فتح'}
            </button>
            <button class="uc-btn uc-btn-teal"
              onclick="assignEmployeeToUser('${username}')"
              title="ربط بموظف">
              👤 موظف
            </button>
            ${!isMe && !isAdmin ? `
            <button class="uc-btn uc-btn-purple"
              onclick="openSupervisorModal('${username}', this)"
              title="إدارة الصلاحيات">
              👑 صلاحيات
            </button>` : ''}

            <!-- Spacer -->
            <span style="flex:1;"></span>

            <!-- Destructive actions -->
            ${!isMe ? `
            <button class="uc-btn uc-btn-ghost"
              onclick="forceLogoutUser('${username}')"
              title="إخراج المستخدم قسراً">
              🚪 إخراج
            </button>
            <button class="uc-btn uc-btn-danger"
              onclick="deleteUser('${username}')"
              title="حذف المستخدم">
              🗑
            </button>` : ''}
          </div>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  updateEmployeeDropdown();
}

// تسجيل خروج إجباري لمستخدم
async function forceLogoutUser(username) {
  if (currentUserRole !== "admin") {
    alert("غير مصرح لك بإجراء وتسجيل خروج المستخدمين.");
    return;
  }
  const snap = await db.ref("users/" + username).once("value");
  const targetUser = snap.val();
  if (targetUser && targetUser.role === "admin") {
    alert("لا يمكن تسجيل الخروج القسري لحساب المدير.");
    return;
  }
  if (username === currentUser) {
    alert("❌ لا يمكنك تسجيل خروج نفسك إجباريًا.");
    return;
  }
  showConfirmModal(
    `هل تريد تسجيل خروج المستخدم ${username} إجباريًا؟`,
    async () => {
      try {
        await db.ref("forcedLogout/" + username).set(true);
        alert("✅ تم إرسال أمر تسجيل الخروج الإجباري.");
        logActivity("تسجيل خروج إجباري", username);
      } catch (err) {
        alert("❌ حدث خطأ أثناء تنفيذ تسجيل الخروج الإجباري");
        console.error(err);
      }
    }
  );
}

// تبديل صلاحية التعديل للمستخدم
async function toggleUserEdit(username, currentCanEdit) {
  if (currentUserRole !== "admin") {
    alert("غير مصرح لك بإجراء هذا التعديل.");
    return;
  }
  const snap = await db.ref("users/" + username).once("value");
  const targetUser = snap.val();
  if (targetUser && targetUser.role === "admin") {
    alert("لا يمكن تعديل صلاحية حساب المدير.");
    return;
  }
  if (username === currentUser) {
    alert("❌ لا يمكنك تغيير صلاحيتك الخاصة.");
    return;
  }
  await db.ref("users/" + username + "/canEdit").set(!currentCanEdit);
  loadUsers();
}



// حذف مستخدم مع نافذة منبثقة أنيقة وإخراج المستخدم فوراً
async function deleteUser(username) {
  if (currentUserRole !== "admin") {
    alert("غير مصرح لك بحذف المستخدمين.");
    return;
  }
  const snap = await db.ref("users/" + username).once("value");
  const targetUser = snap.val();
  if (targetUser && targetUser.role === "admin") {
    alert("لا يمكن حذف حساب المدير.");
    return;
  }
  if (username === currentUser) {
    showPermissionRevokedModal("لا يمكن حذف نفسك.");
    return;
  }
  showDeleteUserModal(username);
}

// دالة لضمان بقاء حساب المدير دائماً
async function ensureAdminAccount() {
  const snap = await db.ref("users").once("value");
  const users = snap.val() || {};
  if (!users.admin) {
    const hashObj = await hashPassword("admin");
    await db.ref("users/admin").set({
      password: hashObj,
      role: "admin",
      canEdit: true,
    });
  }
}

function showDeleteUserModal(username) {
  let oldModal = document.getElementById("deleteUserModal");
  if (oldModal) oldModal.remove();
  const modal = document.createElement("div");
  modal.id = "deleteUserModal";
  modal.style = `position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.25);z-index:9999;display:flex;align-items:center;justify-content:center;`;
  modal.innerHTML = `
    <div style=\"background:linear-gradient(135deg,#fff7f7 60%,#fce4ec 100%);max-width:370px;width:92vw;padding:32px 20px 22px 20px;border-radius:18px;box-shadow:0 8px 32px #e5737333;position:relative;text-align:center;animation:fadeIn 0.3s;\">
      <button id=\"closeDeleteUserModalBtn\" style=\"position:absolute;top:10px;left:10px;background:#e57373;color:white;border:none;border-radius:50%;width:32px;height:32px;font-size:18px;cursor:pointer;transition:background 0.2s;box-shadow:0 2px 8px #e5737322;\">✖</button>
      <div style=\"font-size:21px;color:#d32f2f;margin-bottom:18px;font-weight:700;letter-spacing:0.2px;\">🗑️ حذف مستخدم</div>
      <div style=\"font-size:16.5px;color:#2d3a4a;line-height:1.8;margin-bottom:16px;background:#fff3f3;border-radius:8px;padding:10px 7px 8px 7px;box-shadow:0 1px 4px #e5737311;\">هل أنت متأكد من حذف المستخدم <b style='color:#d32f2f;'>${username}</b>؟<br>سيتم إخراجه فوراً ولن يتمكن من الدخول مجدداً إلا إذا أنشأته من جديد.</div>
      <button id=\"deleteUserConfirmBtn\" style=\"background:linear-gradient(90deg,#d32f2f 60%,#e57373 100%);color:white;padding:11px 0;border:none;border-radius:8px;font-size:17px;cursor:pointer;box-shadow:0 2px 8px #d32f2f22;width:90%;margin-top:8px;font-weight:600;transition:background 0.2s;\">تأكيد الحذف</button>
    </div>
    
  `;
  document.body.appendChild(modal);
  document.getElementById("deleteUserConfirmBtn").onclick = async () => {
    await db.ref("users/" + username).remove();
    await ensureAdminAccount();
    await db.ref("forcedLogout/" + username).set(true);
    if (username === currentUser) {
      localStorage.setItem("accountDeleted", "true");
      clearSession && clearSession();
      location.reload();
      return;
    }
    loadUsers();
    logActivity("حذف مستخدم", username);
    modal.remove();
  };
  // رسالة حذف الحساب عند تحميل الصفحة
  document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem("accountDeleted")) {
      localStorage.removeItem("accountDeleted");
      showAccountDeletedModal();
    }
  });

  // نافذة رسالة حذف الحساب
  function showAccountDeletedModal() {
    const modal = document.createElement("div");
    modal.style = `position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.25);z-index:9999;display:flex;align-items:center;justify-content:center;`;
    modal.innerHTML = `
    <div style="background:#fff3f3;padding:24px 18px;border-radius:12px;box-shadow:0 4px 20px #0002;text-align:center;">
      <div style="font-size:20px;color:#d32f2f;margin-bottom:12px;">❌ تم حذف حسابك</div>
      <div style="font-size:15px;color:#444;">تم حذف حسابك من النظام من قبل المدير.</div>
      <button onclick="this.parentElement.parentElement.remove()" style="margin-top:15px;padding:10px 20px;background:#dc3545;color:#fff;border:none;border-radius:8px;cursor:pointer;">موافق</button>
    </div>
  `;
    document.body.appendChild(modal);
  }
  // عند تحميل الصفحة، إذا accountDeleted=true في localStorage، أظهر رسالة حذف الحساب فقط
  document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem("accountDeleted")) {
      localStorage.removeItem("accountDeleted");
      showAccountDeletedModal();
    }
  });
  document.getElementById("closeDeleteUserModalBtn").onclick = () => {
    modal.remove();
  };
}

// تحديث showPermissionRevokedModal لقبول رسالة مخصصة (اختياري)
const _oldShowPermissionRevokedModal = window.showPermissionRevokedModal;
window.showPermissionRevokedModal = function (msg) {
  if (!msg) return _oldShowPermissionRevokedModal();
  let oldModal = document.getElementById("permRevokedModal");
  if (oldModal) oldModal.remove();
  const modal = document.createElement("div");
  modal.id = "permRevokedModal";
  modal.style = `position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.25);z-index:9999;display:flex;align-items:center;justify-content:center;`;
  modal.innerHTML = `
    <div style=\"background:linear-gradient(135deg,#f7faff 60%,#e3eafc 100%);max-width:370px;width:92vw;padding:32px 20px 22px 20px;border-radius:18px;box-shadow:0 8px 32px #1976d233;position:relative;text-align:center;animation:fadeIn 0.3s;\">
      <button id=\"closePermRevokedModalBtn\" style=\"position:absolute;top:10px;left:10px;background:#e57373;color:white;border:none;border-radius:50%;width:32px;height:32px;font-size:18px;cursor:pointer;transition:background 0.2s;box-shadow:0 2px 8px #e5737322;\">✖</button>
      <div style=\"font-size:19px;color:#d32f2f;margin-bottom:16px;font-weight:600;\">${msg}</div>
      <button id=\"permRevokedOkBtn\" style=\"background:linear-gradient(90deg,#1976d2 60%,#42a5f5 100%);color:white;padding:11px 0;border:none;border-radius:8px;font-size:17px;cursor:pointer;box-shadow:0 2px 8px #1976d222;width:90%;margin-top:8px;font-weight:600;transition:background 0.2s;\">حسناً</button>
    </div>
    
  `;
  document.body.appendChild(modal);
  document.getElementById("permRevokedOkBtn").onclick = () => {
    modal.remove();
  };
  document.getElementById("closePermRevokedModalBtn").onclick = () => {
    modal.remove();
  };
};

// إضافة مستخدم جديد
async function addUser() {
  if (currentUserRole !== "admin") {
    alert("غير مصرح لك بإضافة مستخدمين جدد.");
    return;
  }
  if (!preventEditIfNotCurrentMonth()) return;
  const username = document
    .getElementById("newUserName")
    .value.trim()
    .toLowerCase();
  const password = document.getElementById("newUserPass").value.trim();
  const assignedEmployee = document.getElementById("newUserEmployee").value.trim();
  const canEdit = document.getElementById("newUserCanEdit").checked;
  if (!username || !password) {
    alert("❌ يرجى إدخال اسم المستخدم وكلمة المرور");
    return;
  }
  const snapshot = await db.ref("users/" + username).once("value");
  if (snapshot.exists()) {
    alert("❌ اسم المستخدم موجود مسبقاً");
    return;
  }
  try {
    const hashObj = await hashPassword(password);
    const userData = { password: hashObj, role: "user", canEdit };
    if (assignedEmployee) {
      userData.assignedEmployee = assignedEmployee;
    }
    await db
      .ref("users/" + username)
      .set(userData);
    alert("✅ تم إنشاء المستخدم بنجاح");
    document.getElementById("newUserName").value = "";
    document.getElementById("newUserPass").value = "";
    document.getElementById("newUserEmployee").value = "";
    document.getElementById("newUserCanEdit").checked = true;
    loadUsers();
  } catch (err) {
    console.error(err);
    alert("❌ حدث خطأ أثناء إنشاء المستخدم");
  }
}

// ========== إدارة الموظفين ==========
function showEmployeeDetails(empName) {
  console.log("showEmployeeDetails called with:", empName);

  // Ensure data is loaded before showing details
  if (!window.savedData) {
    console.warn("window.savedData not found");
    alert("⏳ جاري تحميل البيانات، يرجى الانتظار قليلاً");
    return;
  }

  console.log("Current year:", year, "Current month:", month);
  console.log("Saved data keys:", Object.keys(window.savedData));

  // Get attendance count for current month/year using savedData
  let shift = 0, halves = 0, vac = 0, salary = 0;

  try {
    // Use global savedData
    const data = window.savedData || {};

    // Count attendance for this employee in current month
    Object.entries(data).forEach(([dateStr, day]) => {
      // Skip metadata keys
      if (dateStr.startsWith('__')) return;

      if (day && typeof day === 'object') {
        let parts = dateStr.split("-");
        if (parts.length === 3) {
          let dYear = parseInt(parts[0]);
          let dMonth = parseInt(parts[1]) - 1;
          // Check if this date is in the current month and year
          if (dYear === year && dMonth === month) {
            if (day[empName]) {
              const val = day[empName];
              if (val === "شفت") shift++;
              else if (val === "نص") halves++;
              else if (val === "❌") vac++;
            }
          }
        }
      }
    });

    // Get salary rates
    let shiftRate = 22000;
    let halfRate = 11000;
    try {
      if (salaryRates && salaryRates[year]) {
        const ratesData = salaryRates[year][(month + 1).toString().padStart(2, '0')];
        if (ratesData) {
          shiftRate = ratesData.shift || 22000;
          halfRate = ratesData.half || 11000;
        }
      }
    } catch (e) {
      console.log("Error getting salary rates:", e);
    }

    salary = (shift * shiftRate) + (halves * halfRate);
  } catch (e) {
    console.error("Error loading employee details:", e);
  }

  // Get advances
  const advs = (window._advancesMap && window._advancesMap[empName]) ? window._advancesMap[empName] : [];
  const totalAdv = advs.reduce((s, a) => s + Number(a.amount || 0), 0);
  const netSalary = Math.max(0, salary - totalAdv);

  // Update modal
  const nameEl = document.getElementById("empDetailsName");
  const roleEl = document.getElementById("empDetailsRole");
  const shiftsEl = document.getElementById("empDetailsShifts");
  const halvesEl = document.getElementById("empDetailsHalves");
  const vacEl = document.getElementById("empDetailsVacations");
  const salaryEl = document.getElementById("empDetailsSalary");
  const advEl = document.getElementById("empDetailsAdvances");
  const netEl = document.getElementById("empDetailsNetSalary");

  if (nameEl) nameEl.textContent = empName;
  if (roleEl) roleEl.textContent = "موظف";
  if (shiftsEl) shiftsEl.textContent = shift;
  if (halvesEl) halvesEl.textContent = halves;
  if (vacEl) vacEl.textContent = vac;
  if (salaryEl) salaryEl.textContent = salary.toLocaleString() + " د.ع";
  if (advEl) advEl.textContent = totalAdv.toLocaleString() + " د.ع";
  if (netEl) netEl.textContent = netSalary.toLocaleString() + " د.ع";

  // Show modal
  const modal = document.getElementById("employeeDetailsModal");
  if (modal) {
    modal.style.display = "flex";
  } else {
    console.error("Employee details modal not found");
  }
}

function closeEmployeeDetails() {
  document.getElementById("employeeDetailsModal").style.display = "none";
}

// Close modal when clicking outside
document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("employeeDetailsModal");
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        closeEmployeeDetails();
      }
    });
  }
});

function addEmployee() {
  if (!hasPermission('staff')) return;
  const name = document.getElementById("newEmployeeName").value.trim();
  if (!name) {
    alert("❌ يرجى إدخال اسم الموظف");
    return;
  }
  if (employees.includes(name)) {
    alert("❌ الموظف موجود مسبقاً");
    return;
  }
  // الموظف الجديد دائماً يظهر في نهاية الجدول (بدون ترتيب أبجدي)
  const newEmployees = [...employees, name];
  saveEmployees(newEmployees);
  document.getElementById("newEmployeeName").value = "";
}
function loadEmployeesTable() {
  const tbody = document.getElementById("employeesBody");
  tbody.innerHTML = "";
  employees.forEach((emp, idx) => {
    const tr = document.createElement("tr");
    
    const nameTd = document.createElement("td");
    nameTd.textContent = emp;
    nameTd.id = `employeeName_${idx}`;
    nameTd.style.textAlign = "right";
    nameTd.setAttribute("data-label", "اسم الموظف");

    const detailsTd = document.createElement("td");
    detailsTd.style.textAlign = "center";
    detailsTd.setAttribute("data-label", "التفاصيل");
    const detailsBtn = document.createElement("button");
    detailsBtn.innerHTML = "📋";
    detailsBtn.title = "التفاصيل";
    detailsBtn.className = "small-button";
    detailsBtn.style.background = "var(--info)";
    detailsBtn.style.color = "white";
    detailsBtn.style.padding = "6px 10px";
    detailsBtn.onclick = () => showEmployeeDetails(emp);
    detailsTd.appendChild(detailsBtn);

    const editTd = document.createElement("td");
    editTd.style.textAlign = "center";
    editTd.setAttribute("data-label", "تعديل");
    const editBtn = document.createElement("button");
    editBtn.innerHTML = "✏️";
    editBtn.title = "تعديل";
    editBtn.className = "small-button btn-edit";
    editBtn.style.background = "var(--warning)";
    editBtn.style.color = "white";
    editBtn.style.padding = "6px 10px";
    editBtn.onclick = () => enableEmployeeEdit(idx);
    editTd.appendChild(editBtn);

    const actionsTd = document.createElement("td");
    actionsTd.style.textAlign = "center";
    actionsTd.setAttribute("data-label", "حذف");
    // زر الحذف يظهر فقط في الشهر الحالي
    if (typeof isCurrentMonthSelected === "function" && isCurrentMonthSelected()) {
      const deleteBtn = document.createElement("button");
      deleteBtn.innerHTML = "🗑️";
      deleteBtn.title = "حذف";
      deleteBtn.className = "small-button btn-delete";
      deleteBtn.style.background = "var(--danger)";
      deleteBtn.style.color = "white";
      deleteBtn.style.padding = "6px 10px";
      deleteBtn.onclick = () => deleteEmployee(idx);
      actionsTd.appendChild(deleteBtn);
    }

    tr.appendChild(nameTd);
    tr.appendChild(detailsTd);
    tr.appendChild(editTd);
    tr.appendChild(actionsTd);
    tbody.appendChild(tr);
  });
}
// ========== إدارة السلف (قائمة السلف للمدير) ==========
function getAdvPath() {
  const mm = (month + 1).toString().padStart(2, '0');
  return `advances/${year}/${mm}`;
}

function loadAdvancesFromStorage() {
  // Try Firebase first, fallback to localStorage
  const path = getAdvPath();
  if (typeof db !== 'undefined' && db && db.ref) {
    return db.ref(path).once('value').then((snap) => {
      const obj = snap.val() || {};
      // Firebase may store as { id: {employee,amount,...}, ... }
      const arr = Object.keys(obj).length ? Object.entries(obj).map(([id, v]) => ({ id, ...(v || {}) })) : [];
      window._advancesRaw = arr;
      const map = {};
      arr.forEach((a) => { if (!map[a.employee]) map[a.employee] = []; map[a.employee].push(a); });
      window._advancesMap = map;
      // keep a local copy as fallback
      try { localStorage.setItem('advances', JSON.stringify(arr)); } catch (e) { }
      return arr;
    }).catch((e) => {
      console.warn('Firebase advances load failed, falling back to localStorage', e);
      try {
        const raw = localStorage.getItem('advances');
        const arr = raw ? JSON.parse(raw) : [];
        const map = {};
        arr.forEach((a) => { if (!map[a.employee]) map[a.employee] = []; map[a.employee].push(a); });
        window._advancesRaw = arr; window._advancesMap = map; return arr;
      } catch (err) { window._advancesRaw = []; window._advancesMap = {}; return []; }
    });
  }
  // no db available: localStorage only
  try {
    const raw = localStorage.getItem("advances");
    const arr = raw ? JSON.parse(raw) : [];
    const map = {};
    arr.forEach((a) => { if (!map[a.employee]) map[a.employee] = []; map[a.employee].push(a); });
    window._advancesRaw = arr; window._advancesMap = map; return Promise.resolve(arr);
  } catch (e) {
    console.error("Failed to load advances:", e);
    window._advancesRaw = [];
    window._advancesMap = {};
    return Promise.resolve([]);
  }
}

function saveAdvancesToStorage(arr) {
  window._advancesRaw = arr;
  const map = {};
  arr.forEach((a) => { if (!map[a.employee]) map[a.employee] = []; map[a.employee].push(a); });
  window._advancesMap = map;
  try { localStorage.setItem('advances', JSON.stringify(arr)); } catch (e) { }
  // also persist to Firebase if available
  if (typeof db !== 'undefined' && db && db.ref) {
    const path = getAdvPath();
    // convert to object keyed by id
    const obj = {};
    arr.forEach((a) => { const copy = Object.assign({}, a); const id = copy.id || ('adv_' + Date.now()); copy.id = id; delete copy.id; obj[a.id || ('adv_' + Date.now())] = copy; });
    // write full set (simpler sync)
    try { db.ref(path).set(obj).catch(() => { }); } catch (e) { console.warn('adv save to firebase failed', e); }
  }
}

function renderAdvancesTable() {
  const tbody = document.getElementById("advancesBody");
  if (!tbody) return;
  const arr = window._advancesRaw || [];
  tbody.innerHTML = "";
  if (arr.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="padding:12px;text-align:center;color:#666">لا توجد سلف مسجلة</td></tr>`;
    return;
  }
  arr.slice().reverse().forEach((a) => {
    const tr = document.createElement("tr");
    const tdEmp = document.createElement('td'); tdEmp.textContent = a.employee; tdEmp.setAttribute("data-label", "الموظف");
    const tdAmount = document.createElement('td'); tdAmount.textContent = (a.amount || 0).toLocaleString() + ' د.ع'; tdAmount.setAttribute("data-label", "المبلغ");
    const tdDate = document.createElement('td'); tdDate.textContent = a.date || ''; tdDate.setAttribute("data-label", "التاريخ");
    const tdNote = document.createElement('td'); tdNote.textContent = a.note || ''; tdNote.setAttribute("data-label", "ملاحظة");
    const tdActions = document.createElement('td'); tdActions.setAttribute("data-label", "حذف");
    const wrap = document.createElement('div'); wrap.style.display = 'flex'; wrap.style.gap = '6px'; wrap.style.justifyContent = 'flex-end';
    const editBtn = document.createElement('button'); editBtn.className = 'small-button btn-edit'; editBtn.textContent = 'تعديل';
    editBtn.onclick = () => { try { openAddAdvanceForm(encodeURIComponent(JSON.stringify(a))); } catch (e) { console.error(e); } };
    const delBtn = document.createElement('button'); delBtn.className = 'small-button btn-delete'; delBtn.textContent = 'حذف';
    delBtn.onclick = () => deleteAdvance(a.id);
    wrap.appendChild(editBtn); wrap.appendChild(delBtn);
    tdActions.appendChild(wrap);
    tr.appendChild(tdEmp); tr.appendChild(tdAmount); tr.appendChild(tdDate); tr.appendChild(tdNote); tr.appendChild(tdActions);
    tbody.appendChild(tr);
  });
}

function openAddAdvanceForm(existingAdvEncoded) {
  // Build modal
  const modal = document.createElement('div');
  modal.id = 'advanceModal';
  modal.style = 'position:fixed;inset:0;background:rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;z-index:12000;';
  const box = document.createElement('div');
  box.style = 'background:#fff;border-radius:12px;padding:18px;max-width:420px;width:95vw;box-shadow:0 8px 32px rgba(0,0,0,0.12);direction:rtl;text-align:right;';
  box.innerHTML = `
          <h3>➕ تسجيل سلفة جديدة</h3>
          <label for="advanceEmployee">الموظف</label>
          <select id="advanceEmployee"></select>
          <label for="advanceAmount">المبلغ (بدون فواصل)</label>
          <input id="advanceAmount" type="number" min="0" step="1" />
          <label for="advanceDate">التاريخ</label>
          <input id="advanceDate" type="date" />
          <label for="advanceNote">ملاحظة (اختياري)</label>
          <input id="advanceNote" type="text" />
          <div class="modal-actions">
            <button id="cancelAdvance" class="small-button" style="background:#ddd;color:#111">إلغاء</button>
            <button id="saveAdvanceBtn" class="small-button" style="background:#007bff;color:#fff">حفظ السلفة</button>
          </div>
        `;
  modal.appendChild(box);
  document.body.appendChild(modal);

  // populate employees (use the local `employees` array; if empty, try to reload)
  const sel = document.getElementById('advanceEmployee');
  sel.innerHTML = '';
  function fillEmployeesIntoSelect() {
    const list = (typeof employees !== 'undefined' && Array.isArray(employees) && employees.length) ? employees : [];
    if (list.length === 0) {
      sel.innerHTML = `<option value="">-- لا توجد موظفين --</option>`;
      document.getElementById('saveAdvanceBtn').disabled = true;
      return;
    }
    sel.innerHTML = '';
    list.forEach((e) => {
      const opt = document.createElement('option');
      opt.value = e;
      opt.textContent = e;
      sel.appendChild(opt);
    });
    document.getElementById('saveAdvanceBtn').disabled = false;
  }
  fillEmployeesIntoSelect();
  // if empty, try to load from DB (in case loadEmployees hasn't finished yet)
  if ((typeof employees === 'undefined' || employees.length === 0) && typeof loadEmployees === 'function') {
    const mm = (month + 1).toString().padStart(2, '0');
    const empKey = `employees_${year}_${mm}`;
    loadEmployees(empKey).then(() => {
      // expose for compatibility
      try { window.employees = employees; window.employeeIds = employeeIds; } catch (e) { }
      fillEmployeesIntoSelect();
    }).catch(() => { });
  }
  // set default date to today
  const dateInput = document.getElementById('advanceDate');
  const today = new Date().toISOString().slice(0, 10);
  dateInput.value = today;

  // if existingAdvEncoded provided, parse and prefill for edit
  let editingId = null;
  if (existingAdvEncoded) {
    try {
      const decoded = decodeURIComponent(existingAdvEncoded);
      const advObj = JSON.parse(decoded);
      editingId = advObj.id;
      document.getElementById('advanceEmployee').value = advObj.employee || '';
      document.getElementById('advanceAmount').value = advObj.amount || '';
      document.getElementById('advanceDate').value = advObj.date || today;
      document.getElementById('advanceNote').value = advObj.note || '';
      document.getElementById('saveAdvanceBtn').textContent = 'حفظ التعديل';
    } catch (e) { console.warn('Failed to parse existing adv', e); }
  }

  document.getElementById('cancelAdvance').onclick = () => { modal.remove(); };
  document.getElementById('saveAdvanceBtn').onclick = () => {
    const emp = document.getElementById('advanceEmployee').value;
    const amount = Number(document.getElementById('advanceAmount').value || 0);
    const date = document.getElementById('advanceDate').value;
    const note = document.getElementById('advanceNote').value.trim();
    if (!emp) { alert('❌ يرجى اختيار موظف'); return; }
    if (!amount || amount <= 0) { alert('❌ يرجى إدخال مبلغ صالح'); return; }
    const arr = window._advancesRaw ? window._advancesRaw.slice() : [];
    const meta = {
      updatedBy: currentUser,
      updatedAt: new Date().toISOString()
    };
    if (editingId) {
      const idx = arr.findIndex(a => a.id === editingId);
      if (idx !== -1) {
        arr[idx] = Object.assign({}, arr[idx], { employee: emp, amount: amount, date: date, note: note }, meta);
        if (typeof logActivity === 'function') {
          logActivity("تعديل سلفة", `تم تعديل سلفة الموظف: ${emp} لتصبح بقيمة ${amount.toLocaleString()} د.ع بتاريخ ${date}${note ? ' (ملاحظة: ' + note + ')' : ''}`);
        }
      }
    } else {
      const id = 'adv_' + Date.now();
      const newAdv = { 
        id: id, employee: emp, amount: amount, date: date, note: note, 
        createdBy: currentUser, 
        createdAt: new Date().toISOString() 
      };
      arr.push(newAdv);
      if (typeof logActivity === 'function') {
        logActivity("إضافة سلفة", `تم إضافة سلفة جديدة للموظف: ${emp} بقيمة ${amount.toLocaleString()} د.ع بتاريخ ${date}${note ? ' (ملاحظة: ' + note + ')' : ''}`);
      }
    }
    saveAdvancesToStorage(arr);
    renderAdvancesTable();
    modal.remove();
    // update employee stats live (no reload)
    if (typeof db !== 'undefined' && db && db.ref) {
      const monthFormatted = String(month + 1).padStart(2, '0');
      db.ref(`months/${year}/${monthFormatted}/attendance`).once('value').then((snap) => calculateStats(snap.val() || {})).catch(() => { });
    } else {
      // try calling calculateStats with last known attendance if available
      if (window._lastAttendanceSnapshot) calculateStats(window._lastAttendanceSnapshot);
    }
  };
}

function deleteAdvance(id) {
  if (!confirm('هل أنت متأكد من حذف هذه السلفة؟')) return;
  const a = (window._advancesRaw || []).find(x => x.id === id);
  if (a && typeof logActivity === 'function') {
    logActivity("حذف سلفة", `تم حذف سلفة الموظف: ${a.employee} بقيمة ${(a.amount || 0).toLocaleString()} د.ع بتاريخ ${a.date || ''}`);
  }
  const arr = (window._advancesRaw || []).filter(a => a.id !== id);
  saveAdvancesToStorage(arr);
  renderAdvancesTable();
  // remove from firebase if available
  try {
    if (typeof db !== 'undefined' && db && db.ref) {
      const path = getAdvPath();
      db.ref(path + '/' + id).remove().catch(() => { });
    }
  } catch (e) { }
  // update stats live
  if (typeof db !== 'undefined' && db && db.ref) {
    const monthFormatted = String(month + 1).padStart(2, '0');
    db.ref(`months/${year}/${monthFormatted}/attendance`).once('value').then((snap) => calculateStats(snap.val() || {})).catch(() => { });
  } else if (window._lastAttendanceSnapshot) {
    calculateStats(window._lastAttendanceSnapshot);
  }
}

// initialize advances UI (only show to admin)
(function initAdvancesUI() {
  const section = document.getElementById('advancesAdminSection');
  const openBtn = document.getElementById('openAddAdvanceBtn');
  const allowed = hasPermission('advances');
  // load then render
  Promise.resolve(loadAdvancesFromStorage()).then(() => {
    renderAdvancesTable();
    if (!allowed) {
      if (section) section.style.display = 'none';
    } else {
      if (section) section.style.display = 'block';
      if (openBtn) openBtn.onclick = () => openAddAdvanceForm();
    }
  }).catch((e) => { console.warn('initAdvancesUI load failed', e); renderAdvancesTable(); });
})();
function enableEmployeeEdit(index) {
  if (!canEditCurrentMonth()) return;
  const nameTd = document.getElementById(`employeeName_${index}`);
  const oldName = nameTd.textContent;
  nameTd.innerHTML = "";
  const input = document.createElement("input");
  input.type = "text";
  input.value = oldName;
  input.style.width = "80%";
  nameTd.appendChild(input);
  const saveBtn = document.createElement("button");
  saveBtn.textContent = "💾 حفظ";
  saveBtn.className = "small-button btn-edit";
  saveBtn.style.marginLeft = "5px";
  saveBtn.onclick = async () => {
    if (!canEditCurrentMonth()) return;
    const newName = input.value.trim();
    if (!newName) {
      alert("❌ اسم الموظف لا يمكن أن يكون فارغاً");
      return;
    }
    if (employees.includes(newName)) {
      alert("❌ اسم الموظف موجود مسبقاً");
      return;
    }
    // تحديث بيانات الحضور فقط لأيام الشهر الحالي (استخدم المسار الشهري الموحد)
    const days = getDays();
    const monthFormatted = (month + 1).toString().padStart(2, '0');
    const attendancePath = `months/${year}/${monthFormatted}/attendance`;
    const attendanceSnapshot = await db.ref(attendancePath).once("value");
    const attendance = attendanceSnapshot.val() || {};
    days.forEach((day) => {
      const dayKey = day.key;
      if (
        attendance[dayKey] &&
        Object.prototype.hasOwnProperty.call(attendance[dayKey], oldName)
      ) {
        attendance[dayKey][newName] = attendance[dayKey][oldName];
        delete attendance[dayKey][oldName];
      }
    });
    await db.ref(attendancePath).set(attendance);
    // تحديث اسم الموظف في allowedStatsEmps لجميع المستخدمين لهذا الشهر
    const usersSnap = await db.ref("users").once("value");
    const users = usersSnap.val() || {};
    await Promise.all(Object.entries(users).map(async ([username, data]) => {
      if (username === "admin") return;
      const allowed = Array.isArray(data.allowedStatsEmps) ? data.allowedStatsEmps : [];
      if (allowed.includes(oldName)) {
        const updated = allowed.map(e => e === oldName ? newName : e);
        await db.ref("users/" + username + "/allowedStatsEmps").set(updated);
      }
    }));
    const newEmployees = employees.slice();
    newEmployees[index] = newName;
    saveEmployees(newEmployees);
  };
  nameTd.appendChild(saveBtn);
}

// ========== إحصائيات ==========
// ======= Salary helpers / admin =======
window.salariesData = window.salariesData || {};
db.ref('salaries').on('value', function (snap) { try { window.salariesData = snap.val() || {}; } catch (e) { window.salariesData = {}; } try { if (typeof refreshSalariesList === 'function') refreshSalariesList(); if (typeof calculateStats === 'function') calculateStats(window._lastAttendanceSnapshot); } catch (e) { } });

function formatNumberWithCommas(n) {
  if (n === null || n === undefined || n === '') return '';
  const num = typeof n === 'number' ? n : Number(String(n).replace(/[^0-9.-]/g, '')) || 0;
  return num.toLocaleString('en-US');
}
function parseFormattedNumber(s) {
  if (s === null || s === undefined) return null;
  const cleaned = String(s).replace(/[^0-9.-]/g, '');
  if (cleaned.trim() === '') return null;
  return Number(cleaned) || 0;
}

function getRatesForEmployee(emp, y, m) {
  const salaries = window.salariesData || {};
  const monthKey = `${y}_${String(m + 1).padStart(2, '0')}`;
  // month overrides
  if (salaries.months && salaries.months[monthKey]) {
    const monthNode = salaries.months[monthKey];
    if (monthNode.overrides && monthNode.overrides[emp]) return { shift: Number(monthNode.overrides[emp].shift || 0), half: Number(monthNode.overrides[emp].half || 0) };
    if (monthNode.default) return { shift: Number(monthNode.default.shift || 0), half: Number(monthNode.default.half || 0) };
  }
  // per-employee override
  if (salaries.overrides && salaries.overrides[emp]) return { shift: Number(salaries.overrides[emp].shift || 0), half: Number(salaries.overrides[emp].half || 0) };
  // default
  if (salaries.default) return { shift: Number(salaries.default.shift || 22000), half: Number(salaries.default.half || 11000) };
  // fallback
  return { shift: 22000, half: 11000 };
}

async function refreshSalariesList() {
  const container = document.getElementById('salariesListContainer');
  if (!container) return;
  container.innerHTML = 'جاري التحميل...';
  const sal = window.salariesData || {};
  const monthKey = `${year}_${String(month + 1).padStart(2, '0')}`;
  let items = employees.slice(); items.sort((a, b) => a.localeCompare(b));
  let html = '';
  items.forEach(emp => {
    const globalOv = (sal.overrides && sal.overrides[emp]) ? sal.overrides[emp] : null;
    const monthOv = (sal.months && sal.months[monthKey] && sal.months[monthKey].overrides && sal.months[monthKey].overrides[emp]) ? sal.months[monthKey].overrides[emp] : null;
    const ov = monthOv || globalOv || {};
    const shiftVal = ov.shift !== undefined ? formatNumberWithCommas(ov.shift) : '';
    const halfVal = ov.half !== undefined ? formatNumberWithCommas(ov.half) : '';
    html += `<div style="display:flex;gap:8px;align-items:center;padding:6px;border-bottom:1px dashed #eef6fb;">
            <div style="flex:1;min-width:120px;">${emp}</div>
            <div style="width:120px;"><input placeholder="شفت" data-emp="${emp}" class="empShiftOverride" value="${shiftVal}" style="width:100%;padding:6px;border-radius:6px;border:1px solid #e9eef8;" /></div>
            <div style="width:120px;"><input placeholder="نص" data-emp="${emp}" class="empHalfOverride" value="${halfVal}" style="width:100%;padding:6px;border-radius:6px;border:1px solid #e9eef8;" /></div>
            <div style="display:flex;gap:6px;">
              <button class="small-button btn-save-emp-override" data-emp="${emp}" style="background:#28a745;color:#fff">💾</button>
              <button class="small-button btn-clear-emp-override" data-emp="${emp}" style="background:#e53935;color:#fff">🗑️</button>
            </div>
          </div>`;
  });
  container.innerHTML = html;
  Array.from(document.getElementsByClassName('empShiftOverride')).forEach(el => { el.oninput = (e) => { el.value = formatNumberWithCommas(parseFormattedNumber(el.value)); }; });
  Array.from(document.getElementsByClassName('empHalfOverride')).forEach(el => { el.oninput = (e) => { el.value = formatNumberWithCommas(parseFormattedNumber(el.value)); }; });
  Array.from(document.getElementsByClassName('btn-save-emp-override')).forEach(btn => {
    btn.onclick = async function () {
      const emp = this.dataset.emp; const shiftEl = container.querySelector('.empShiftOverride[data-emp="' + emp + '"]'); const halfEl = container.querySelector('.empHalfOverride[data-emp="' + emp + '"]'); const shift = parseFormattedNumber(shiftEl.value); const half = parseFormattedNumber(halfEl.value); if (!shift && !half) { alert('يرجى إدخال قيمة واحدة على الأقل'); return; } const applyCurrent = document.getElementById('applyCurrentMonthSalary').checked; const applyFuture = document.getElementById('applyFutureMonthsSalary').checked; // save override
      await db.ref('salaries/overrides/' + emp).set({ shift: shift === null ? null : shift, half: half === null ? null : half });
      if (applyCurrent) { await db.ref('salaries/months/' + monthKey + '/overrides/' + emp).set({ shift: shift === null ? null : shift, half: half === null ? null : half }); }
      // For future months - we keep it as global override (overrides apply to all months) so if applyFuture explicitly false nothing else to do
      await db.ref('salaries/signal').set({ time: Date.now() }); localStorage.setItem('salariesSignal', Date.now()); refreshSalariesList(); calculateStats(window._lastAttendanceSnapshot);
    };
  });
  Array.from(document.getElementsByClassName('btn-clear-emp-override')).forEach(btn => { btn.onclick = async function () { if (!confirm('هل تريد مسح التعديل لهذا الموظف؟')) return; const emp = this.dataset.emp; const monthKey = `${year}_${String(month + 1).padStart(2, '0')}`; await db.ref('salaries/overrides/' + emp).remove(); await db.ref('salaries/months/' + monthKey + '/overrides/' + emp).remove(); await db.ref('salaries/signal').set({ time: Date.now() }); localStorage.setItem('salariesSignal', Date.now()); refreshSalariesList(); calculateStats(window._lastAttendanceSnapshot); }; });
}

async function initSalaryAdmin() {
  // bind save default button
  const shiftEl = document.getElementById('salaryShiftRate');
  const halfEl = document.getElementById('salaryHalfRate');
  const saveBtn = document.getElementById('saveDefaultSalaryBtn');
  const refreshBtn = document.getElementById('refreshSalariesListBtn');
  // format on input
  [shiftEl, halfEl].forEach(el => { if (!el) return; el.oninput = (e) => { el.value = formatNumberWithCommas(parseFormattedNumber(el.value)); }; el.onblur = (e) => { el.value = formatNumberWithCommas(parseFormattedNumber(el.value)); }; });
  if (refreshBtn) refreshBtn.onclick = refreshSalariesList;
  if (saveBtn) saveBtn.onclick = async function () {
    const s = parseFormattedNumber(shiftEl.value); const h = parseFormattedNumber(halfEl.value); if (!s && !h) { alert('يرجى إدخال قيمة واحدة على الأقل'); return; } const applyCurrent = document.getElementById('applyCurrentMonthSalary').checked; const applyFuture = document.getElementById('applyFutureMonthsSalary').checked; const nowKey = `${year}_${String(month + 1).padStart(2, '0')}`; // update default
    await db.ref('salaries/default').set({ shift: s === null ? null : s, half: h === null ? null : h });
    if (applyCurrent) { await db.ref('salaries/months/' + nowKey + '/default').set({ shift: s === null ? null : s, half: h === null ? null : h }); }
    // applyFuture: updating salaries/default is enough to affect future months
    await db.ref('salaries/signal').set({ time: Date.now() }); localStorage.setItem('salariesSignal', Date.now()); alert('تم الحفظ');
    refreshSalariesList(); calculateStats(window._lastAttendanceSnapshot);
  };
  // when local salaries updates, refresh
  window.addEventListener('storage', (e) => { if (e.key === 'salariesSignal') refreshSalariesList(); });
  refreshSalariesList();
}

// تهيئة حقل الراتب عند تحميل المستخدم
try { document.getElementById('sidebarUserControlBtn').onclick = function () { setTimeout(() => { try { const section = document.getElementById('salaryAdminSection'); if (section) { section.style.display = hasPermission('salary') ? 'block' : 'none'; } } catch (e) { } }, 60); }; } catch (e) { }
// call initSalaryAdmin in the normal init path; if function exists the load will call it
try { initSalaryAdmin(); } catch (e) { }

// 📄 Lazy Load jsPDF و html2canvas عند الحاجة فقط
let pdfLibsLoading = null;
async function loadPDFLibraries() {
  if (window.jsPDF && window.html2canvas) return Promise.resolve();
  if (pdfLibsLoading) return pdfLibsLoading;

  pdfLibsLoading = new Promise((resolve, reject) => {
    let loaded = 0;
    const checkLoaded = () => {
      loaded++;
      if (loaded === 2) resolve();
    };

    // jsPDF الرئيسي
    const script1 = document.createElement('script');
    script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script1.onload = checkLoaded;
    script1.onerror = () => reject(new Error('Failed to load jsPDF'));
    document.head.appendChild(script1);

    // html2canvas
    const script2 = document.createElement('script');
    script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script2.onload = checkLoaded;
    script2.onerror = () => reject(new Error('Failed to load html2canvas'));
    document.head.appendChild(script2);
  });

  return pdfLibsLoading;
}

function calculateStats(savedData) {
  // cache last attendance snapshot so UI updates can reuse it without re-fetch
  try { window._lastAttendanceSnapshot = savedData || {}; } catch (e) { }
  // التأكد من أن savedData هو object صالح
  if (!savedData || typeof savedData !== 'object' || Array.isArray(savedData)) {
    savedData = {};
  }
  // جلب صلاحيات المستخدم الحالي
  db.ref("users/" + currentUser)
    .once("value")
    .then((userSnap) => {
      const userData = userSnap.val() || {};
      const isAdmin = userData.role === "admin";
      const allowedEmps = isAdmin
        ? employees.slice()
        : userData.allowedStatsEmps || [];
      const canViewSalary = isAdmin ? true : !!userData.canViewSalary;

      // 🚀 معالجة سريعة: بناء counts بدون DOM operations
      const counts = {};
      allowedEmps.forEach((e) => {
        counts[e] = { شفت: 0, نص: 0, "❌": 0 };
      });

      // حسابات البيانات
      Object.entries(savedData).forEach(([dateStr, day]) => {
        let parts = dateStr.split("-");
        if (parts.length === 3) {
          let dYear = parseInt(parts[0]);
          let dMonth = parseInt(parts[1]) - 1;
          if (dYear === year && dMonth === month) {
            allowedEmps.forEach((e) => {
              const val = day[e];
              if (val && counts[e][val] !== undefined)
                counts[e][val] += 1;
            });
          }
        }
      });

      // 🚀 تحديث DOM بـ requestIdleCallback (تأخير إلى بعد الرسم الأول)
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          renderStatsDOM(counts, allowedEmps, canViewSalary);
        }, { timeout: 2000 });
      } else {
        // fallback للمتصفحات القديمة
        setTimeout(() => {
          renderStatsDOM(counts, allowedEmps, canViewSalary);
        }, 100);
      }
    });
}


// دالة منفصلة لتحديث DOM (تُستدعى بعد الرسم الأول)
function renderStatsDOM(counts, allowedEmps, canViewSalary) {
  const bestShift = Object.entries(counts).sort(
    (a, b) => b[1]["شفت"] - a[1]["شفت"]
  )[0];
  const bestHalf = Object.entries(counts).sort(
    (a, b) => b[1]["نص"] - a[1]["نص"]
  )[0];
  const mostX = Object.entries(counts).sort(
    (a, b) => b[1]["❌"] - a[1]["❌"]
  )[0];

  // تحديث statsBox
  const statsDiv = document.getElementById("statsBox");
  if (statsDiv) {
    statsDiv.innerHTML = `
            <p><strong>🏆 أكثر موظف شفت:</strong> ${bestShift ? bestShift[0] + ` (${bestShift[1]["شفت"]})` : "—"
      }</p>
            <p><strong>⭐ أكثر موظف نص:</strong> ${bestHalf ? bestHalf[0] + ` (${bestHalf[1]["نص"]})` : "—"
      }</p>
            <p><strong>❌ أكثر موظف غياب:</strong> ${mostX ? mostX[0] + ` (${mostX[1]["❌"]})` : "—"
      }</p>`;
  }

  // تحديث جدول الموظفين
  const empStatsDiv = document.getElementById("empStatsBelowTable");
  if (empStatsDiv) {
    // بناء HTML بدون إضافة تدريجية
    let html = `<div class="emp-stats-bar-official">
            <table class="emp-stats-table-official">
              <thead>
                <tr>
                  <th>الموظف</th>
                  <th>شفت</th>
                  <th>نص</th>
                  <th>إجازة</th>
                  ${canViewSalary ? "<th>الراتب الكلي</th><th>السلف</th><th>صافي الراتب</th>" : ""}
                </tr>
              </thead>
              <tbody>`;

    // متغيرات لحساب المجموع
    let totalSalary = 0;
    let totalAdvances = 0;
    let totalNetSalary = 0;

    // بناء الجدول بالكامل قبل التحديث
    allowedEmps.forEach((emp) => {
      const shift = counts[emp]["شفت"] || 0;
      const half = counts[emp]["نص"] || 0;
      const vac = counts[emp]["❌"] || 0;
      const rates = getRatesForEmployee(emp, year, month);
      const salary = shift * (rates.shift || 22000) + half * (rates.half || 11000);
      const advs = (window._advancesMap && window._advancesMap[emp]) ? window._advancesMap[emp] : [];
      const totalAdv = advs.reduce((s, a) => s + Number(a.amount || 0), 0);
      const netSalary = Math.max(0, salary - totalAdv);

      // تراكم المجاميع
      if (canViewSalary) {
        totalSalary += salary;
        totalAdvances += totalAdv;
        totalNetSalary += netSalary;
      }

      html += `<tr>
              <td class="emp-name-official">${emp}</td>
              <td class="emp-stat-official shift">${shift}</td>
              <td class="emp-stat-official half">${half}</td>
              <td class="emp-stat-official vac">${vac}</td>
              ${canViewSalary ? `<td class="emp-salary-official">${salary.toLocaleString()} د.ع</td><td class="emp-salary-official">${totalAdv.toLocaleString()} د.ع</td><td class="emp-salary-official" style="font-weight:700;color:#0b6">${netSalary.toLocaleString()} د.ع</td>` : ""}
            </tr>`;
    });

    // إضافة صف المجموع إذا كانت الرواتب مرئية
    if (canViewSalary) {
      html += `<tr class="emp-total-row-official">
              <td class="emp-total-label-official">المجموع</td>
              <td colspan="3"></td>
              <td class="emp-salary-official">${totalSalary.toLocaleString()} د.ع</td>
              <td class="emp-salary-official">${totalAdvances.toLocaleString()} د.ع</td>
              <td class="emp-salary-official">${totalNetSalary.toLocaleString()} د.ع</td>
            </tr>`;
    }

    html += `</tbody></table></div>`;

    // تحديث واحد فقط بدلاً من تحديثات متعددة
    empStatsDiv.innerHTML = html;
  }

  // CSS احترافي ومتجاوب
  if (!document.getElementById("empStatsProStyle")) {
    const style = document.createElement("style");
    style.id = "empStatsProStyle";
    style.innerHTML = `
        .emp-stats-bar-official {
          width: 100%;
          margin: 0 auto 18px auto;
          background: #f8f9fa;
          border-radius: 12px;
          box-shadow: 0 1px 8px #e3eafc33;
          padding: 0 0 8px 0;
          overflow-x: auto;
        }
        .emp-stats-table-official {
          width: 100%;
          border-collapse: collapse;
          font-size: 16px;
          background: none;
        }
        .emp-stats-table-official th, .emp-stats-table-official td {
          border: 1px solid #e0e0e0;
          padding: 8px 10px;
          text-align: center;
        }
        .emp-stats-table-official th {
          background: #e3f0ff;
          color: #1976d2;
          font-weight: bold;
          font-size: 17px;
        }
        .emp-name-official {
          color: #1976d2;
          font-weight: 600;
        }
        .emp-stat-official.shift { color: #28a745; font-weight: 500; }
        .emp-stat-official.half { color: #ff9800; font-weight: 500; }
        .emp-stat-official.vac { color: #d32f2f; font-weight: 500; }
        .emp-salary-official {
          color: #388e3c;
          font-weight: bold;
          background: #e8fbe8;
          border-radius: 6px;
        }
        
        /* أنماط صف المجموع - متناسق مع الجدول */
        .emp-total-row-official {
          background: #e3f0ff;
          font-weight: 600;
        }
        
        .emp-total-label-official {
          color: #1976d2;
          font-weight: 700;
          font-size: 16px;
        }
        
        @media (max-width: 900px) {
          .emp-stats-table-official th, .emp-stats-table-official td { font-size: 14px; padding: 6px 4px; }
          .emp-total-row-official { font-size: 14px; }
        }
        @media (max-width: 600px) {
          .emp-stats-bar-official { border-radius: 7px; }
          .emp-stats-table-official th, .emp-stats-table-official td { font-size: 13px; padding: 5px 2px; }
          .emp-total-row-official { font-size: 12px; }
        }
      `;
    document.head.appendChild(style);
  }
  // تأثير ripple احترافي مطور
  if (!window.rippleEffect) {
    window.rippleEffect = function (e, el) {
      // منع تكرار التأثيرات المتداخلة
      if (el.classList.contains("ripple-active")) return;
      el.classList.add("ripple-active");
      let rect = el.getBoundingClientRect();
      let ripple = document.createElement("span");
      ripple.className = "ripple";
      let size = Math.max(rect.width, rect.height) * 1.1;
      ripple.style.width = ripple.style.height = size + "px";
      let x =
        (e.touches ? e.touches[0].clientX : e.clientX) -
        rect.left -
        size / 2;
      let y =
        (e.touches ? e.touches[0].clientY : e.clientY) -
        rect.top -
        size / 2;
      ripple.style.left = x + "px";
      ripple.style.top = y + "px";
      el.appendChild(ripple);
      setTimeout(() => {
        ripple.remove();
        el.classList.remove("ripple-active");
      }, 700);
    };
  }
  // ...existing code...
}

// زر لترحيل كلمات المرور القديمة
// ========== Tabs للأشهر ==========

// زر عائم للأشهر بشكل دائري حديث
const monthsFab = document.createElement("div");
monthsFab.id = "monthsFab";
monthsFab.innerHTML = `<button id="fabMainMonth" class="fab-month"></button><div id="fabMonthsList" style="display:none;"></div>`;
monthsFab.style.position = "fixed";
monthsFab.style.bottom = "22px";
monthsFab.style.left = "22px";
monthsFab.style.zIndex = "9999";
document.body.appendChild(monthsFab);

function loadAvailableMonths() {
  Promise.all([
    db.ref("attendance").once("value"),
    db.ref("monthsSettings/manual").once("value"),
    db.ref("monthsSettings/hidden").once("value"),
    db.ref("users/" + (currentUser || "")).once("value"),
    db.ref("months").once("value"),
    db.ref("monthsSettings/auto").once("value"),
  ]).then(([attSnap, manualSnap, hiddenSnap, userSnap, monthsTreeSnap, autoSnap]) => {
    const data = attSnap.val() || {};
    const manual = manualSnap.val() || [];
    const hidden = hiddenSnap.val() || {};
    const user = userSnap.val() || {};
    const monthsTree = monthsTreeSnap ? monthsTreeSnap.val() || {} : {};
    const autoEnabled = autoSnap.exists() ? autoSnap.val() : true;
    const isAdmin = user.role === "admin";
    const monthsSet = new Set();
    
    // من الهيكل القديم
    Object.keys(data).forEach((key) => {
      const parts = key.split("-");
      if (parts.length === 3) {
        const m = parseInt(parts[1]) - 1;
        const y = parseInt(parts[0]);
        monthsSet.add(`${y}-${m}`);
      }
    });

    // من الهيكل الجديد
    Object.entries(monthsTree).forEach(([y, monthsObj]) => {
      Object.entries(monthsObj).forEach(([mm, monthObj]) => {
        const mmNum = parseInt(mm);
        if (!isNaN(mmNum)) {
          monthsSet.add(`${y}-${mmNum - 1}`); // convert 1..12 to 0..11
        }
      });
    });

    manual.forEach((m) => monthsSet.add(m));
    
    // أضف الشهر الحالي استناداً لميزة الشهر التلقائي
    if (autoEnabled !== false) {
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${now.getMonth()}`;
      monthsSet.add(currentMonthKey);
    }

    let monthsArr = Array.from(monthsSet).sort((a, b) => {
      const [ya, ma] = a.split("-").map(Number),
        [yb, mb] = b.split("-").map(Number);
      return ya !== yb ? ya - yb : ma - mb;
    });
    // إخفاء الأشهر المخفية عن غير المدير
    if (!isAdmin) {
      monthsArr = monthsArr.filter((m) => !hidden[m]);
    }
    renderMonthFab(monthsArr);
  });
}

function renderMonthFab(months) {
  const fabBtn = document.getElementById("fabMainMonth");
  const fabList = document.getElementById("fabMonthsList");
  // الزر الرئيسي: إيموجي فقط
  fabBtn.textContent = "📅";
  fabBtn.title = `تغيير الشهر`;
  fabBtn.style.background = "#007bff";
  fabBtn.style.color = "white";
  fabBtn.style.fontWeight = "bold";
  fabBtn.style.fontSize = "20px";
  fabBtn.style.boxShadow = "0 2px 8px #007bff44";
  fabBtn.style.transition = "box-shadow 0.2s";
  fabBtn.onmouseenter = () =>
    (fabBtn.style.boxShadow = "0 4px 16px #007bff77");
  fabBtn.onmouseleave = () =>
    (fabBtn.style.boxShadow = "0 2px 8px #007bff44");
  fabBtn.onclick = function () {
    fabList.style.display =
      fabList.style.display === "none" ? "flex" : "none";
  };
  fabList.innerHTML = "";
  fabList.style.position = "absolute";
  fabList.style.bottom = "60px";
  fabList.style.left = "0";
  fabList.style.flexDirection = "column";
  fabList.style.gap = "8px";
  fabList.style.alignItems = "flex-start";
  fabList.style.transition = "all 0.2s";
  // تحسين عرض القائمة على الهاتف
  fabList.style.background = "#fff";
  fabList.style.borderRadius = "12px";
  fabList.style.boxShadow = "0 4px 16px #007bff22";
  fabList.style.padding = "8px 6px";
  fabList.style.minWidth = "48px";
  fabList.style.maxHeight = "60vh";
  fabList.style.overflowY = "auto";
  months
    .slice()
    .reverse()
    .forEach((m) => {
      const [y, mo] = m.split("-");
      const btn = document.createElement("button");
      btn.textContent = `${parseInt(mo) + 1}-${y}`; // رقم الشهر والسنة
      btn.className = "fab-month fab-month-mini";
      btn.style.background =
        parseInt(y) === year && parseInt(mo) === month
          ? "#007bff"
          : "#f4f4f4";
      btn.style.color =
        parseInt(y) === year && parseInt(mo) === month ? "white" : "#333";
      btn.title = `${arMonths[parseInt(mo)]} ${y}`;
      btn.style.margin = "2px 0";
      btn.onclick = function () {
        month = parseInt(mo);
        window.year = parseInt(y);
        const empKey = `employees_${year}_${(month + 1)
          .toString()
          .padStart(2, "0")}`;
        loadEmployees(empKey).then(() => {
          generateTable();
          // تحميل وعرض السلف للشهر الجديد
          Promise.resolve(loadAdvancesFromStorage()).then(() => {
            renderAdvancesTable();
          }).catch((e) => { console.warn('Failed to load advances', e); renderAdvancesTable(); });
          renderMonthFab(months);
          fabList.style.display = "none";
        });
      };
      fabList.appendChild(btn);
    });
  // إغلاق القائمة عند الضغط خارجها (للموبايل)
  document.addEventListener("click", function fabListClose(e) {
    if (!fabList.contains(e.target) && e.target !== fabBtn) {
      fabList.style.display = "none";
      document.removeEventListener("click", fabListClose);
    }
  });
}

// CSS للأزرار العائمة
const fabStyle = document.createElement("style");
fabStyle.innerHTML = `
  .fab-month {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    outline: none;
    box-shadow: 0 2px 8px #007bff44;
    background: #007bff;
    color: white;
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0;
    transition: box-shadow 0.2s, background 0.2s, color 0.2s;
  }
  .fab-month-mini {
    width: 36px;
    height: 36px;
    font-size: 16px;
    margin-bottom: 2px;
    background: #f4f4f4;
    color: #333;
    border: 2px solid #007bff22;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, color 0.2s, border 0.2s;
  }
  .fab-month-mini:hover {
    background: #007bff;
    color: white;
    border: 2px solid #007bff;
  }
  @media (max-width: 600px) {
    #monthsFab {
      left: 8px !important;
      bottom: 8px !important;
    }
    .fab-month, .fab-month-mini {
      width: 34px !important;
      height: 34px !important;
      font-size: 15px !important;
    }
    #fabMonthsList {
      min-width: 38px !important;
      padding: 5px 2px !important;
      border-radius: 10px !important;
      box-shadow: 0 2px 8px #007bff22 !important;
      gap: 4px !important;
    }
  }
`;
document.head.appendChild(fabStyle);
if (localStorage.getItem("loggedUser")) {
  loadAvailableMonths();
}

// Admin panel toggling: fixed to work with single click
function toggleAdminPanel() {
  const adminPanel = document.getElementById("adminPanel");
  if (!adminPanel) return;

  if (typeof updateAdminTabsVisibility === "function") {
    updateAdminTabsVisibility();
  }

  const isVisible = adminPanel.style.display !== "none";

  // Close the sidebar menu first if open
  const sidebarMenu = document.getElementById("sidebarMenu");
  if (sidebarMenu && sidebarMenu.classList.contains("open")) {
    sidebarMenu.classList.remove("open");
    const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
    const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
    if (sidebarToggleBtn) sidebarToggleBtn.style.display = "flex";
    if (sidebarCloseBtn) sidebarCloseBtn.style.display = "none";
  }

  if (!isVisible) {
    // Show admin panel
    adminPanel.style.display = "flex";
    try {
      const panelBtn = document.getElementById('aboutPanelEditBtn');
      const isAdmin = (typeof currentUserRole !== 'undefined' && currentUserRole === 'admin');
      if (panelBtn) panelBtn.style.display = isAdmin ? 'flex' : 'none';
    } catch (e) { }
    setTimeout(() => {
      adminPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  } else {
    // Hide admin panel
    adminPanel.style.display = "none";
  }
}

window.updateAdminTabsVisibility = function() {
  const isAdmin = currentUserRole === 'admin';
  
  const btnEmployees = document.querySelector('.admin-tab-btn[data-tab="employees"]');
  const btnAdvances = document.querySelector('.admin-tab-btn[data-tab="advances"]');
  const btnSalary = document.querySelector('.admin-tab-btn[data-tab="salary"]');
  const btnUsers = document.querySelector('.admin-tab-btn[data-tab="users"]');
  const btnSettings = document.querySelector('.admin-tab-btn[data-tab="settings"]');
  
  const paneEmployees = document.getElementById('employees');
  const paneAdvances = document.getElementById('advances');
  const paneSalary = document.getElementById('salary');
  const paneUsers = document.getElementById('users');
  const paneSettings = document.getElementById('settings');

  const canStaff = hasPermission('staff') || isAdmin;
  const canAdvances = hasPermission('advances') || isAdmin;
  const canSalary = hasPermission('salary') || isAdmin;

  if (btnEmployees) btnEmployees.style.display = canStaff ? '' : 'none';
  if (btnAdvances) btnAdvances.style.display = canAdvances ? '' : 'none';
  if (btnSalary) btnSalary.style.display = canSalary ? '' : 'none';
  if (btnUsers) btnUsers.style.display = isAdmin ? '' : 'none';
  if (btnSettings) btnSettings.style.display = isAdmin ? '' : 'none';
  
  // Explicitly hide unauthorized panes
  if (paneEmployees && !canStaff) { paneEmployees.style.display = 'none'; paneEmployees.classList.remove('active'); } else if (paneEmployees) { paneEmployees.style.display = ''; }
  if (paneAdvances && !canAdvances) { paneAdvances.style.display = 'none'; paneAdvances.classList.remove('active'); } else if (paneAdvances) { paneAdvances.style.display = ''; }
  if (paneSalary && !canSalary) { paneSalary.style.display = 'none'; paneSalary.classList.remove('active'); } else if (paneSalary) { paneSalary.style.display = ''; }
  if (paneUsers && !isAdmin) { paneUsers.style.display = 'none'; paneUsers.classList.remove('active'); } else if (paneUsers) { paneUsers.style.display = ''; }
  if (paneSettings && !isAdmin) { paneSettings.style.display = 'none'; paneSettings.classList.remove('active'); } else if (paneSettings) { paneSettings.style.display = ''; }

  const canAdmin = canStaff || canAdvances || canSalary || isAdmin;
  const sidebarAdminBtn = document.getElementById('sidebarAdminBtn');
  if (sidebarAdminBtn) sidebarAdminBtn.style.display = canAdmin ? 'block' : 'none';

  // If panel is open but active tab is hidden/unauthorized, switch to the first available
  const activeBtn = document.querySelector('.admin-tab-btn.active');
  if (!activeBtn || activeBtn.style.display === 'none') {
    if (canStaff) { if (typeof switchAdminTab === 'function') switchAdminTab('employees'); else window.switchAdminTab?.('employees'); }
    else if (canAdvances) { if (typeof switchAdminTab === 'function') switchAdminTab('advances'); else window.switchAdminTab?.('advances'); }
    else if (canSalary) { if (typeof switchAdminTab === 'function') switchAdminTab('salary'); else window.switchAdminTab?.('salary'); }
    else if (isAdmin) { if (typeof switchAdminTab === 'function') switchAdminTab('settings'); else window.switchAdminTab?.('settings'); }
  }
};

// Function to switch admin tabs
window.switchAdminTab = function(tabName) {
  // Guard access
  if (tabName === 'employees' && !hasPermission('staff') && currentUserRole !== 'admin') return;
  if (tabName === 'advances' && !hasPermission('advances') && currentUserRole !== 'admin') return;
  if (tabName === 'salary' && !hasPermission('salary') && currentUserRole !== 'admin') return;
  if ((tabName === 'users' || tabName === 'settings') && currentUserRole !== 'admin') return;

  // Hide all tab panes
  const panes = document.querySelectorAll('.admin-tab-pane');
  panes.forEach(pane => pane.classList.remove('active'));

  // Remove active class from all buttons
  const buttons = document.querySelectorAll('.admin-tab-btn');
  buttons.forEach(btn => btn.classList.remove('active'));

  // Show selected pane
  const selectedPane = document.getElementById(tabName);
  if (selectedPane) {
    selectedPane.classList.add('active');
  }

  // Add active class to clicked button
  const clickedBtn = document.querySelector(`[data-tab="${tabName}"]`);
  if (clickedBtn) {
    clickedBtn.classList.add('active');
  }
}

// ========== سجل النشاطات - دالة محسّنة ==========
async function openActivityLogModal() {
  // إنشاء modal محترف
  let modal = document.getElementById('activityLogModal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'activityLogModal';
  modal.style = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(8px);
          padding: 10px;
        `;

  modal.innerHTML = `
          <style>
            #activityLogModal .log-modal-body {
              display: flex;
              flex-direction: column;
              height: 100%;
              width: 100%;
            }
            /* Search & Filter Bar */
            #activityLogModal .log-filter-bar {
              display: flex;
              gap: 12px;
              padding: 14px 20px;
              background: #f8fafc;
              border-bottom: 1px solid #e2e8f0;
              flex-wrap: wrap;
              align-items: center;
              direction: rtl;
            }
            #activityLogModal .log-filter-item {
              flex: 1;
              min-width: 140px;
            }
            #activityLogModal .log-filter-input {
              width: 100%;
              padding: 10px 14px;
              border-radius: 10px;
              border: 1px solid #cbd5e1;
              font-size: 13px;
              outline: none;
              transition: all 0.2s ease;
              background: #ffffff;
              box-sizing: border-box;
              font-family: inherit;
            }
            #activityLogModal .log-filter-input:focus {
              border-color: #0d47a1;
              box-shadow: 0 0 0 3px rgba(13, 71, 161, 0.1);
            }
            
            /* Timeline / Card list */
            #activityLogModal .log-list-wrapper {
              display: flex;
              flex-direction: column;
              gap: 16px;
              padding: 24px 28px 24px 20px;
              direction: rtl;
              position: relative;
            }
            #activityLogModal .log-list-wrapper::before {
              content: '';
              position: absolute;
              top: 0;
              bottom: 0;
              right: 32px;
              width: 3px;
              background: linear-gradient(to bottom, #cbd5e1 0%, #cbd5e1 85%, transparent 100%);
              border-radius: 4px;
            }
            #activityLogModal .log-card {
              background: #ffffff;
              border-radius: 12px;
              border: 1px solid #e2e8f0;
              padding: 16px 20px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
              display: flex;
              flex-direction: column;
              gap: 10px;
              transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
              border-right: 6px solid #64748b;
              position: relative;
              text-align: right;
              margin-right: 25px; /* مسافة للخط الزمني */
            }
            #activityLogModal .log-card:hover {
              transform: translateX(-4px);
              box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
            }

            /* Timeline dots on cards */
            #activityLogModal .log-card::after {
              content: '';
              position: absolute;
              right: -31px;
              top: 20px;
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background: #64748b;
              border: 3px solid #ffffff;
              box-shadow: 0 0 0 3px #cbd5e1;
              z-index: 2;
              transition: all 0.25s ease;
            }
            #activityLogModal .log-card:hover::after {
              transform: scale(1.3);
            }
            
            /* Left/Right Border & Dot Colors based on categories */
            #activityLogModal .log-card.cat-add { border-right-color: #10b981 !important; }
            #activityLogModal .log-card.cat-add::after { background: #10b981; box-shadow: 0 0 0 3px #d1fae5; }
            #activityLogModal .log-card.cat-add:hover::after { box-shadow: 0 0 0 5px rgba(16, 185, 129, 0.3); }

            #activityLogModal .log-card.cat-delete { border-right-color: #ef4444 !important; }
            #activityLogModal .log-card.cat-delete::after { background: #ef4444; box-shadow: 0 0 0 3px #fee2e2; }
            #activityLogModal .log-card.cat-delete:hover::after { box-shadow: 0 0 0 5px rgba(239, 68, 68, 0.3); }

            #activityLogModal .log-card.cat-edit { border-right-color: #3b82f6 !important; }
            #activityLogModal .log-card.cat-edit::after { background: #3b82f6; box-shadow: 0 0 0 3px #dbeafe; }
            #activityLogModal .log-card.cat-edit:hover::after { box-shadow: 0 0 0 5px rgba(59, 130, 246, 0.3); }

            #activityLogModal .log-card.cat-auth { border-right-color: #8b5cf6 !important; }
            #activityLogModal .log-card.cat-auth::after { background: #8b5cf6; box-shadow: 0 0 0 3px #f3e8ff; }
            #activityLogModal .log-card.cat-auth:hover::after { box-shadow: 0 0 0 5px rgba(139, 92, 246, 0.3); }

            #activityLogModal .log-card.cat-announce { border-right-color: #f59e0b !important; }
            #activityLogModal .log-card.cat-announce::after { background: #f59e0b; box-shadow: 0 0 0 3px #fef3c7; }
            #activityLogModal .log-card.cat-announce:hover::after { box-shadow: 0 0 0 5px rgba(245, 158, 11, 0.3); }

            #activityLogModal .log-card.cat-maintenance { border-right-color: #ec4899 !important; }
            #activityLogModal .log-card.cat-maintenance::after { background: #ec4899; box-shadow: 0 0 0 3px #fce7f3; }
            #activityLogModal .log-card.cat-maintenance:hover::after { box-shadow: 0 0 0 5px rgba(236, 72, 153, 0.3); }

            /* Header inside Card */
            #activityLogModal .log-card-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 12px;
              width: 100%;
            }
            #activityLogModal .log-card-meta {
              display: flex;
              align-items: center;
              gap: 8px;
              flex-wrap: wrap;
              flex: 1;
            }
            #activityLogModal .log-card-user {
              background: #f1f5f9;
              color: #475569;
              padding: 4px 10px;
              border-radius: 8px;
              font-size: 11px;
              font-weight: 700;
              display: inline-flex;
              align-items: center;
              gap: 5px;
              border: 1px solid #e2e8f0;
            }
            #activityLogModal .log-card-user.user-admin {
              background: #fffbeb;
              color: #b45309;
              border-color: #fde68a;
            }
            #activityLogModal .log-card-action {
              font-size: 11px;
              font-weight: 800;
              padding: 4px 10px;
              border-radius: 8px;
              display: inline-flex;
              align-items: center;
              gap: 5px;
              box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            }
            #activityLogModal .log-card.cat-add .log-card-action { background: #d1fae5; color: #065f46; }
            #activityLogModal .log-card.cat-delete .log-card-action { background: #fee2e2; color: #991b1b; }
            #activityLogModal .log-card.cat-edit .log-card-action { background: #dbeafe; color: #1e40af; }
            #activityLogModal .log-card.cat-auth .log-card-action { background: #f3e8ff; color: #6b21a8; }
            #activityLogModal .log-card.cat-announce .log-card-action { background: #fef3c7; color: #92400e; }
            #activityLogModal .log-card.cat-maintenance .log-card-action { background: #fce7f3; color: #9d174d; }
            #activityLogModal .log-card.cat-default .log-card-action { background: #f1f5f9; color: #475569; }

            #activityLogModal .log-card-time {
              font-size: 11px;
              color: #64748b;
              font-weight: 500;
              display: inline-flex;
              align-items: center;
              gap: 5px;
            }
            
            /* Body of Card */
            #activityLogModal .log-card-body {
              font-size: 13.5px;
              color: #334155;
              line-height: 1.6;
              word-break: break-word;
              font-weight: 500;
            }
            
            /* Highlights within the body */
            #activityLogModal .hl-emp {
              background: #eff6ff;
              color: #1e40af;
              padding: 2.5px 8.5px;
              border-radius: 6px;
              font-weight: 800;
              font-size: 11.5px;
              border: 1px solid #bfdbfe;
              display: inline-block;
              margin: 0 2px;
              box-shadow: 0 1px 2px rgba(30, 64, 175, 0.05);
            }
            #activityLogModal .hl-status {
              padding: 2.5px 8.5px;
              border-radius: 6px;
              font-weight: 800;
              font-size: 11.5px;
              border: 1px solid transparent;
              display: inline-block;
              margin: 0 2px;
              box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
            }
            #activityLogModal .hl-status.status-shift {
              background: #f0fdf4;
              color: #16a34a;
              border-color: #bbf7d0;
            }
            #activityLogModal .hl-status.status-half {
              background: #fffbeb;
              color: #d97706;
              border-color: #fef08a;
            }
            #activityLogModal .hl-status.status-absent {
              background: #fef2f2;
              color: #dc2626;
              border-color: #fecaca;
            }
            #activityLogModal .hl-status.status-leave {
              background: #f0f9ff;
              color: #0284c7;
              border-color: #bae6fd;
            }
            #activityLogModal .hl-amount {
              background: #faf5ff;
              color: #7c3aed;
              padding: 2.5px 8.5px;
              border-radius: 6px;
              font-weight: 800;
              font-size: 11.5px;
              border: 1px solid #e9d5ff;
              display: inline-block;
              margin: 0 2px;
              box-shadow: 0 1px 2px rgba(124, 58, 237, 0.05);
            }

            #activityLogModal .log-copy-btn {
              width: auto !important; /* إلغاء التمدد العريض الموروث */
              margin: 0 !important; /* إلغاء الهوامش الموروثة */
              background: #e3f0ff; /* لون أزرق خفيف متناسق مع التطبيق */
              color: #0b74c9; /* لون النص الرئيسي للتطبيق */
              border: 1px solid rgba(11, 116, 201, 0.25);
              padding: 4px 10px;
              border-radius: 6px;
              font-size: 11.5px;
              font-weight: 700;
              cursor: pointer;
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
              display: inline-flex;
              align-items: center;
              gap: 4px;
              font-family: inherit;
              box-shadow: 0 1px 2px rgba(11, 116, 201, 0.05);
              flex-shrink: 0;
            }
            #activityLogModal .log-copy-btn:hover {
              background: #0b74c9;
              color: #ffffff;
              border-color: #0b74c9;
              box-shadow: 0 4px 6px rgba(11, 116, 201, 0.15);
            }
            #activityLogModal .log-copy-btn:active {
              transform: scale(0.95);
            }
            
            /* Custom Scrollbar */
            #activityLogModal #activityLogContent::-webkit-scrollbar {
              width: 6px;
            }
            #activityLogModal #activityLogContent::-webkit-scrollbar-track {
              background: #f1f5f9;
            }
            #activityLogModal #activityLogContent::-webkit-scrollbar-thumb {
              background: #cbd5e1;
              border-radius: 3px;
            }
            #activityLogModal #activityLogContent::-webkit-scrollbar-thumb:hover {
              background: #94a3b8;
            }

            /* Empty state */
            #activityLogModal .log-empty-state {
              text-align: center;
              color: #64748b;
              padding: 60px 20px;
              font-size: 14px;
              font-weight: 500;
            }
            
            @media (max-width: 640px) {
              #activityLogModal .log-filter-bar {
                flex-direction: column;
                align-items: stretch;
                gap: 8px;
                padding: 10px 14px;
              }
              #activityLogModal .log-filter-item {
                width: 100%;
              }
              #activityLogModal .log-list-wrapper {
                padding: 16px 20px 16px 10px;
              }
              #activityLogModal .log-list-wrapper::before {
                right: 24px;
              }
              #activityLogModal .log-card {
                margin-right: 15px;
                padding: 12px 14px;
              }
              #activityLogModal .log-card::after {
                right: -21px;
                width: 8px;
                height: 8px;
                top: 18px;
              }
              #activityLogModal .log-card-header {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: flex-start;
                gap: 8px;
              }
              #activityLogModal .log-copy-btn {
                width: auto !important;
                margin: 0 !important;
                padding: 3px 6px;
                font-size: 10px;
                border-radius: 5px;
              }
            }
          </style>

          <div style="
            background: #ffffff;
            width: 100%;
            max-width: 1000px;
            max-height: 92vh;
            border-radius: 14px;
            box-shadow: 0 16px 56px rgba(0,0,0,0.28);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            animation: slideUp 0.3s ease;
            position: relative;
          ">
            <!-- رأس محسّن وأصغر -->
            <div style="
              background: linear-gradient(135deg, #0d47a1 0%, #1565c0 100%);
              color: white;
              padding: 16px 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 3px solid #42a5f5;
              gap: 12px;
            ">
              <div style="flex: 1; min-width: 200px; text-align: right;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; justify-content: flex-start; direction: rtl;">
                  <h2 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.6px;">📋 سجل النشاطات</h2>
                  <div style="display: flex; align-items: center; gap: 5px; background: rgba(102, 255, 102, 0.2); padding: 4px 10px; border-radius: 16px;">
                    <span style="width: 8px; height: 8px; background: #66ff66; border-radius: 50%; display: inline-block; box-shadow: 0 0 6px #66ff66;"></span>
                    <span style="font-size: 11px; font-weight: 600; color: #66ff66;">متصل</span>
                  </div>
                </div>
                <p style="margin: 0; font-size: 12px; opacity: 0.9;">آخر النشاطات في النظام</p>
              </div>
              <button onclick="document.getElementById('activityLogModal').remove()" style="
                background: rgba(255,255,255,0.15);
                border: 1px solid rgba(255,255,255,0.2);
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 6px 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 6px;
                transition: all 0.2s;
                line-height: 1;
                font-weight: 300;
                width: 36px;
                height: 36px;
                flex-shrink: 0;
              " onmouseover="this.style.background='rgba(255,255,255,0.25)'; this.style.borderColor='rgba(255,255,255,0.35)'" onmouseout="this.style.background='rgba(255,255,255,0.15)'; this.style.borderColor='rgba(255,255,255,0.2)'">✕</button>
            </div>

            <!-- شريط البحث والتصفية -->
            <div class="log-filter-bar" id="logFilterBar" style="display: none;">
              <div class="log-filter-item" id="logUserFilterContainer">
                <select id="logUserFilter" class="log-filter-input">
                  <option value="">👤 كل المستخدمين</option>
                </select>
              </div>
              <div class="log-filter-item">
                <select id="logActionFilter" class="log-filter-input">
                  <option value="">🎯 كل العمليات</option>
                  <option value="add">➕ الإضافة</option>
                  <option value="edit">✏️ التعديل</option>
                  <option value="delete">🗑️ الحذف</option>
                  <option value="auth">🔐 الدخول والخروج</option>
                  <option value="announce">📢 الإعلانات</option>
                  <option value="maintenance">🚧 الصيانة</option>
                </select>
              </div>
            </div>
            
            <!-- المحتوى الرئيسي -->
            <div id="activityLogContent" style="
              flex: 1;
              overflow-y: auto;
              overflow-x: hidden;
              padding: 0;
              direction: rtl;
              background: #f8fafc;
            ">
              <div style="text-align: center; padding: 80px 20px; color: #999;">
                <p style="font-size: 16px;">⏳ جاري تحميل سجلات النشاطات...</p>
              </div>
            </div>
            
            <!-- التذييل مع الإحصائيات والتاريخ -->
            <div style="
              background: linear-gradient(135deg, #f8f9fa 0%, #f0f0f0 100%);
              padding: 16px 20px;
              border-top: 1px solid #e0e0e0;
              display: flex;
              justify-content: space-between;
              align-items: stretch;
              flex-wrap: wrap;
              gap: 16px;
              direction: rtl;
            ">
              <!-- الإحصائيات -->
              <div id="activityLogStats" style="
                display: flex;
                gap: 24px;
                flex-wrap: wrap;
                align-items: center;
              "></div>
              
              <!-- التاريخ والوقت -->
              <div style="
                border-right: 2px solid #d0d0d0;
                padding-right: 20px;
                display: flex;
                flex-direction: column;
                justify-content: center;
              ">
                <div style="text-align: right; direction: rtl;">
                  <div id="activityLogDateTime" style="font-size: 13px; font-weight: 700; color: #0d47a1; line-height: 1.6; font-family: 'Courier New', monospace;"></div>
                </div>
              </div>
            </div>
          </div>
        `;

  document.body.appendChild(modal);

  // تحميل البيانات
  try {
    const userLogViewType = (window.currentUserData && window.currentUserData.logViewType) || 'all';

    const snapshot = await db.ref("activityLog").limitToLast(200).once("value");
    const logs = snapshot.val() || {};
    let allLogs = Object.values(logs).reverse();

    // تصفية الأنشطة بناءً على الصلاحية ودور المستخدم
    if (currentUserRole !== 'admin') {
      if (userLogViewType === 'self') {
        allLogs = allLogs.filter(log => log.user === currentUser);
        const userFilterContainer = document.getElementById('logUserFilterContainer');
        if (userFilterContainer) userFilterContainer.style.display = 'none';
      } else {
        const userFilterContainer = document.getElementById('logUserFilterContainer');
        if (userFilterContainer) userFilterContainer.style.display = 'block';
      }
    } else {
      const userFilterContainer = document.getElementById('logUserFilterContainer');
      if (userFilterContainer) userFilterContainer.style.display = 'block';
    }

    // تعبئة فلتر المستخدمين بالأسماء الفريدة المتاحة
    const userFilterEl = document.getElementById('logUserFilter');
    const uniqueUsersInLogs = [...new Set(allLogs.map(l => l.user || 'مجهول'))];
    uniqueUsersInLogs.forEach(username => {
      const opt = document.createElement('option');
      opt.value = username;
      opt.textContent = `👤 ${username}`;
      userFilterEl.appendChild(opt);
    });

    // إظهار شريط الفلاتر
    const filterBar = document.getElementById('logFilterBar');
    if (filterBar) filterBar.style.display = 'flex';

    // حساب الإحصائيات الإجمالية
    const totalCount = allLogs.length;
    const uniqueUsersCount = uniqueUsersInLogs.length;
    const now = new Date();
    const todayStr = now.toLocaleDateString('ar-SA');
    const todayLogsCount = allLogs.filter(l => {
      const logDate = new Date(l.time || '').toLocaleDateString('ar-SA');
      return logDate === todayStr;
    }).length;

    // عرض الإحصائيات في التذييل
    const statsDiv = document.getElementById('activityLogStats');
    function updateFooterStats(filteredCount) {
      statsDiv.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 18px; font-weight: 800; color: #0d47a1;" id="filteredLogCount">${filteredCount}</div>
          <div style="font-size: 11px; color: #666; margin-top: 2px; font-weight: 500;">المعروضة</div>
        </div>
        <div style="height: 45px; border-right: 2px solid #d0d0d0;"></div>
        <div style="text-align: center;">
          <div style="font-size: 18px; font-weight: 800; color: #10b981;">${totalCount}</div>
          <div style="font-size: 11px; color: #666; margin-top: 2px; font-weight: 500;">الإجمالي</div>
        </div>
        <div style="height: 45px; border-right: 2px solid #d0d0d0;"></div>
        <div style="text-align: center;">
          <div style="font-size: 18px; font-weight: 800; color: #ff9800;">${uniqueUsersCount}</div>
          <div style="font-size: 11px; color: #666; margin-top: 2px; font-weight: 500;">مستخدمون</div>
        </div>
        <div style="height: 45px; border-right: 2px solid #d0d0d0;"></div>
        <div style="text-align: center;">
          <div style="font-size: 18px; font-weight: 800; color: #4caf50;">${todayLogsCount}</div>
          <div style="font-size: 11px; color: #666; margin-top: 2px; font-weight: 500;">اليوم</div>
        </div>
      `;
    }

    // عرض التاريخ والوقت الحالي بشكل صحيح في التذييل
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const dateTimeDiv = document.getElementById('activityLogDateTime');
    dateTimeDiv.innerHTML = `
            ${year}/${month}/${day}<br>
            ${hours}:${minutes}:${seconds}
          `;

    // دوال المساعدة للأنشطة
    function getActionCategory(action) {
      if (!action) return 'default';
      if (action.includes('إعلان')) return 'announce';
      if (action.includes('صيانة')) return 'maintenance';
      if (action.includes('دخول') || action.includes('خروج')) return 'auth';
      if (action.includes('إضافة')) return 'add';
      if (action.includes('حذف')) return 'delete';
      if (action.includes('تعديل') || action.includes('تغيير') || action.includes('تحديث') || action.includes('تعيين')) return 'edit';
      return 'default';
    }

    function getActionIcon(cat) {
      switch(cat) {
        case 'announce': return '📢';
        case 'maintenance': return '🚧';
        case 'auth': return '🔐';
        case 'add': return '➕';
        case 'delete': return '🗑️';
        case 'edit': return '✏️';
        default: return '📝';
      }
    }

    function highlightKeywords(details) {
      if (!details) return '-';
      let html = details;

      // تنظيف واستبدال أوسمة الحالات القديمة والمخزنة في قاعدة البيانات بألوان موحدة
      html = html.replace(/<span style=\\?['"]background:[^"'>]*\\?['"]>(بدون|شفت|نص|نصف|غياب|❌|إجازة|اجازة)<\/span>/g, (match, p1) => {
        return getStatusBadgeHtml(p1);
      });

      // 1. تمييز حالات الحضور
      html = html.replace(/(شفت)/g, '<span class="hl-status status-shift">$1</span>');
      html = html.replace(/(نصف|نص)/g, '<span class="hl-status status-half">$1</span>');
      html = html.replace(/(غياب|❌)/g, '<span class="hl-status status-absent">$1</span>');
      html = html.replace(/(إجازة|اجازة)/g, '<span class="hl-status status-leave">$1</span>');

      // 2. تمييز المبالغ المالية
      html = html.replace(/(\d+[\d,.\s]*\s*د\.ع)/g, '<span class="hl-amount">$1</span>');

      // 3. تمييز أسماء الموظفين من المصفوفة العالمية
      const emps = Array.isArray(window.employees) ? window.employees : [];
      emps.forEach(emp => {
        if (!emp || emp.length < 2) return;
        const escapedEmp = emp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedEmp})`, 'g');
        html = html.replace(regex, '<span class="hl-emp">$1</span>');
      });

      return html;
    }

    // دالة عرض النشاطات المفلترة
    function renderFilteredLogs() {
      const userVal = document.getElementById('logUserFilter').value;
      const actionVal = document.getElementById('logActionFilter').value;

      let filtered = allLogs;

      // تطبيق الفلاتر
      if (userVal) {
        filtered = filtered.filter(l => (l.user || 'مجهول') === userVal);
      }

      if (actionVal) {
        filtered = filtered.filter(l => getActionCategory(l.action) === actionVal);
      }

      // إنشاء كود HTML
      let html = '';
      if (filtered.length > 0) {
        html = '<div class="log-list-wrapper">';
        filtered.forEach(log => {
          let dateTimeStr = '';
          try {
            let d;
            if (log.timestamp && typeof log.timestamp === 'number') {
              d = new Date(log.timestamp);
            } else if (typeof log.time === 'number') {
              d = new Date(log.time);
            } else if (typeof log.time === 'string') {
              dateTimeStr = log.time;
            }

            if (d && !isNaN(d.getTime())) {
              const year = d.getFullYear();
              const monthNum = String(d.getMonth() + 1).padStart(2, '0');
              const dayNum = String(d.getDate()).padStart(2, '0');
              const hours = String(d.getHours()).padStart(2, '0');
              const minutes = String(d.getMinutes()).padStart(2, '0');
              dateTimeStr = `${year}/${monthNum}/${dayNum} ${hours}:${minutes}`;
            } else if (!dateTimeStr) {
              dateTimeStr = 'غير محدد';
            }
          } catch (e) {
            dateTimeStr = log.time || log.timestamp || 'غير محدد';
          }

          const user = log.user || 'مجهول';
          const isUserAdmin = user.toLowerCase() === 'admin';
          const userBadgeClass = isUserAdmin ? 'log-card-user user-admin' : 'log-card-user';
          const userAvatar = isUserAdmin ? '👑' : '👤';

          const action = log.action || 'نشاط';
          const desc = log.details || '-';
          const cat = getActionCategory(action);
          const icon = getActionIcon(cat);
          
          html += `
            <div class="log-card cat-${cat}" style="${log.style || ''}">
              <div class="log-card-header">
                <div class="log-card-meta">
                  <span class="${userBadgeClass}">${userAvatar} ${user}</span>
                  <span class="log-card-action">${icon} ${action}</span>
                  <span class="log-card-time">🕒 ${dateTimeStr}</span>
                </div>
                <button class="log-copy-btn" onclick="window.copyLogText(this)" title="نسخ النشاط">📋 نسخ</button>
              </div>
              <div class="log-card-body">
                ${highlightKeywords(desc)}
              </div>
            </div>
          `;
        });
        html += '</div>';
      } else {
        html = `
          <div class="log-empty-state">
            <div style="font-size: 40px; margin-bottom: 12px;">🔍</div>
            <div>لم يتم العثور على نشاطات مطابقة للبحث</div>
          </div>
        `;
      }

      document.getElementById('activityLogContent').innerHTML = html;
      updateFooterStats(filtered.length);
    }

    // ربط أحداث التصفية
    document.getElementById('logUserFilter').onchange = renderFilteredLogs;
    document.getElementById('logActionFilter').onchange = renderFilteredLogs;

    // العرض الأولي
    renderFilteredLogs();

  } catch (error) {
    console.error('Error loading activity log:', error);
    document.getElementById('activityLogContent').innerHTML = `
            <div style="text-align: center; color: #d32f2f; padding: 80px 20px; background: white; font-size: 14px;">
              ❌ حدث خطأ في تحميل السجل
            </div>
          `;
  }

  // إغلاق عند الضغط خارج الـ modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// ========== دالة الاستيراد العام ==========
function importDataGeneral() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json";
  fileInput.addEventListener("change", async function (e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedData = JSON.parse(text);

      console.log('📂 البيانات المستوردة:', importedData);

      // التحقق من صحة البيانات
      if (!importedData.month || !importedData.attendanceData) {
        alert("❌ ملف غير صحيح! يجب أن يكون من تصدير النظام");
        return;
      }

      if (!confirm(`هل تريد استيراد بيانات ${importedData.month}؟\n\nسيتم استيراد:\n- ${Object.keys(importedData.attendanceData || {}).length} يوم\n- البيانات الموجودة ستُستبدل!`)) {
        return;
      }

      console.log('🔄 جاري الاستيراد...');

      // استخراج السنة والشهر من بيانات الحضور
      const sampleKey = Object.keys(importedData.attendanceData)[0];
      if (!sampleKey || !sampleKey.includes('-')) {
        alert("❌ لا توجد بيانات حضور صحيحة في الملف");
        return;
      }

      const [importYear, importMonth] = sampleKey.split('-').slice(0, 2);
      const importMonthKey = `${importYear}-${(parseInt(importMonth)).toString().padStart(2, "0")}`;
      const importMonthFormatted = parseInt(importMonth).toString().padStart(2, "0");

      console.log('📅 شهر الاستيراد:', importMonthKey);
      console.log('السنة:', importYear, 'الشهر:', importMonthFormatted);

      // 1️⃣ استيراد الموظفين
      console.log('👥 جاري استيراد الموظفين...');
      const targetEmpPath = `months/${importYear}/${importMonthFormatted}/employees`;
      const legacyEmpKey = `employees_${importYear}_${importMonthFormatted}`;

      // قراءة الموظفين من الملف إذا كانت موجودة
      let employeesFromFile = {};
      if (importedData.employeesData && typeof importedData.employeesData === 'object') {
        employeesFromFile = importedData.employeesData;
      } else {
        // محاولة استخراج الموظفين من بيانات الحضور
        const sampleDay = Object.values(importedData.attendanceData)[0] || {};
        Object.keys(sampleDay).forEach(empName => {
          if (empName !== '__editor' && empName !== '__editedAt') {
            employeesFromFile[empName] = { name: empName };
          }
        });
      }

      if (Object.keys(employeesFromFile).length > 0) {
        await db.ref(targetEmpPath).set(employeesFromFile);
        await db.ref(legacyEmpKey).set(employeesFromFile);
        console.log('✅ تم استيراد', Object.keys(employeesFromFile).length, 'موظف');
      }

      // 2️⃣ استيراد الحضور
      console.log('📋 جاري استيراد الحضور...');
      const targetAttendancePath = `months/${importYear}/${importMonthFormatted}/attendance`;

      if (Object.keys(importedData.attendanceData).length > 0) {
        await db.ref(targetAttendancePath).set(importedData.attendanceData);
        console.log('✅ تم استيراد', Object.keys(importedData.attendanceData).length, 'يوم');
      }

      // 3️⃣ استيراد الملاحظات
      if (importedData.notes) {
        console.log('📝 جاري استيراد الملاحظات...');
        await db.ref("monthsNotes/" + importMonthKey).set(importedData.notes);
        console.log('✅ تم استيراد الملاحظات');
      }

      // 4️⃣ إضافة الشهر المستورد إلى قائمة الأشهر
      console.log('📌 جاري إضافة الشهر إلى المدير...');
      const manualMonthsSnap = await db.ref("monthsSettings/manual").once("value");
      let monthsList = manualMonthsSnap.val() || [];

      if (!Array.isArray(monthsList)) {
        monthsList = [];
      }

      if (!monthsList.includes(importMonthKey)) {
        monthsList.push(importMonthKey);
        await db.ref("monthsSettings/manual").set(monthsList);
        console.log('✅ تم إضافة الشهر إلى المدير');
      }

      console.log('========================================');
      console.log('✅ تم الاستيراد بنجاح!');
      console.log('========================================');

      logActivity("استيراد البيانات", `تم استيراد بيانات ${importedData.month}`);
      alert(`✅ تم الاستيراد بنجاح!\n\n📊 تم استيراد:\n- ${Object.keys(employeesFromFile).length || '؟'} موظف\n- ${Object.keys(importedData.attendanceData).length} يوم`);

      // إعادة تحميل الصفحة لعرض البيانات الجديدة
      setTimeout(() => location.reload(), 1000);

    } catch (error) {
      console.error('❌ خطأ في الاستيراد:', error);
      alert('❌ خطأ في قراءة الملف:\n' + error.message);
    }
  });

  fileInput.click();
}

// ========== حذف متقدم ==========
function advancedDelete() {
  // نافذة اختيار العملية بشكل أزرار واضحة
  let modal = document.getElementById("deleteChoiceModal");
  if (modal) modal.remove();
  modal = document.createElement("div");
  modal.id = "deleteChoiceModal";
  modal.style = `position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.35);z-index:9999;display:flex;align-items:center;justify-content:center;`;
  modal.innerHTML = `
    <div style=\"background:#fff;max-width:370px;width:92vw;padding:26px 18px 20px 18px;border-radius:16px;box-shadow:0 8px 32px #0002;position:relative;text-align:center;animation:fadeIn 0.3s;\">
      <button id=\"closeDeleteChoiceModalBtn\" style=\"position:absolute;top:10px;left:10px;background:#dc3545;color:white;border:none;border-radius:50%;width:32px;height:32px;font-size:18px;cursor:pointer;transition:background 0.2s;\">✖</button>
      <div style=\"font-size:18px;color:#333;margin-bottom:20px;font-weight:500;\">اختر العملية التي تريد تنفيذها:</div>
      <div style=\"display:flex;flex-direction:column;gap:10px;align-items:center;\">
        <button class=\"deleteOpBtn\" data-op=\"1\" style=\"background:#e91e63;color:white;padding:10px 22px;border:none;border-radius:7px;font-size:16px;cursor:pointer;\">1 - حذف الموظفين فقط</button>
        <button class=\"deleteOpBtn\" data-op=\"2\" style=\"background:#9c27b0;color:white;padding:10px 22px;border:none;border-radius:7px;font-size:16px;cursor:pointer;\">2 - حذف حسابات المستخدمين</button>
        <button class=\"deleteOpBtn\" data-op=\"3\" style=\"background:#ff9800;color:white;padding:10px 22px;border:none;border-radius:7px;font-size:16px;cursor:pointer;\">3 - حذف التاشيرات (شفت، نص، ❌)</button>
        <button class=\"deleteOpBtn\" data-op=\"4\" style=\"background:#009688;color:white;padding:10px 22px;border:none;border-radius:7px;font-size:16px;cursor:pointer;\">4 - حذف سجل النشاطات</button>
        <button class=\"deleteOpBtn\" data-op=\"5\" style=\"background:#607d8b;color:white;padding:10px 22px;border:none;border-radius:7px;font-size:16px;cursor:pointer;\">5 - حذف كل البيانات</button>
        <button onclick=\"clearDatabase()\" style=\"background:#e53935;color:white;margin-top:10px;width:100%;font-size:15px;padding:8px 0;border-radius:7px;\">🗑️ مسح جميع بيانات قاعدة البيانات</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById("closeDeleteChoiceModalBtn").onclick =
    function () {
      modal.remove();
    };

  Array.from(document.getElementsByClassName("deleteOpBtn")).forEach(
    (btn) => {
      btn.onclick = function () {
        const choice = btn.getAttribute("data-op");
        modal.remove();
        // نافذة إدخال كلمة مرور المدير
        let passModal = document.getElementById("adminPassModal");
        if (passModal) passModal.remove();
        passModal = document.createElement("div");
        passModal.id = "adminPassModal";
        passModal.style = `position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.35);z-index:9999;display:flex;align-items:center;justify-content:center;`;
        passModal.innerHTML = `
        <div style=\"background:#fff;max-width:350px;width:90vw;padding:22px 18px 18px 18px;border-radius:14px;box-shadow:0 8px 32px #0002;position:relative;text-align:center;\">
          <button id=\"closeAdminPassModalBtn\" style=\"position:absolute;top:10px;left:10px;background:#dc3545;color:white;border:none;border-radius:50%;width:32px;height:32px;font-size:18px;cursor:pointer;\">✖</button>
          <div style=\"font-size:17px;color:#333;margin-bottom:18px;\">يرجى إدخال كلمة مرور المدير للتأكيد:</div>
          <input id=\"adminPassInput\" type=\"password\" style=\"width:90%;padding:8px 10px;font-size:16px;border-radius:6px;border:1px solid #ccc;margin-bottom:14px;\" />
          <button id=\"adminPassConfirmBtn\" style=\"background:#007bff;color:white;padding:8px 18px;border:none;border-radius:6px;font-size:16px;cursor:pointer;\">تأكيد</button>
        </div>
      `;
        document.body.appendChild(passModal);
        document.getElementById("adminPassConfirmBtn").onclick =
          async function () {
            const adminPass =
              document.getElementById("adminPassInput").value;
            passModal.remove();
            const snapshot = await db
              .ref("users/admin/password")
              .once("value");
            const realAdminPass = snapshot.val();
            const ok = await verifyPassword(realAdminPass, adminPass);
            if (!ok) {
              alert("❌ كلمة المرور غير صحيحة!");
              return;
            }
            // نافذة تأكيد نهائي
            showConfirmModal(
              "هل أنت متأكد من تنفيذ هذا الإجراء؟ لا يمكن التراجع عنه!",
              () => {
                switch (choice) {
                  case "1": {
                    // حذف موظفي الشهر الحالي فقط
                    const empKey = `employees_${year}_${(month + 1).toString().padStart(2, "0")}`;
                    const monthFormatted = (month + 1).toString().padStart(2, '0');
                    const newEmpPath = `months/${year}/${monthFormatted}/employees`;
                    Promise.all([
                      db.ref("employees/" + empKey).remove().catch(() => { }),
                      db.ref(newEmpPath).remove().catch(() => { }),
                    ])
                      .then(() => alert("✅ تم حذف موظفي الشهر الحالي فقط."))
                      .catch((e) => alert("❌ خطأ في حذف الموظفين: " + e.message));
                    break;
                  }
                  case "2":
                    db.ref("users")
                      .remove()
                      .then(() => alert("✅ تم حذف حسابات المستخدمين."))
                      .catch((e) =>
                        alert(
                          "❌ خطأ في حذف حسابات المستخدمين: " + e.message
                        )
                      );
                    break;
                  case "3": {
                    // حذف التاشيرات (الحضور) للشهر الحالي فقط
                    const days = getDays();
                    const updates = {};
                    days.forEach((day) => {
                      const dayKey = day.key;
                      updates[`attendance/${dayKey}`] = null;
                      // also remove in months structure if possible
                      try {
                        const parts = dayKey.split('-');
                        if (parts.length >= 3) {
                          const y = parts[0];
                          const mm = String(Number(parts[1])).padStart(2, '0');
                          updates[`months/${y}/${mm}/attendance/${dayKey}`] = null;
                        }
                      } catch (e) { }
                    });
                    db.ref()
                      .update(updates)
                      .then(() => alert("✅ تم حذف تاشيرات الشهر الحالي فقط."))
                      .catch((e) => alert("❌ خطأ في حذف التاشيرات: " + e.message));
                    break;
                  }
                  case "4":
                    db.ref("activityLog")
                      .remove()
                      .then(() => alert("✅ تم حذف سجل النشاطات."))
                      .catch((e) =>
                        alert("❌ خطأ في حذف سجل النشاطات: " + e.message)
                      );
                    break;
                  case "5":
                    Promise.all([
                      db.ref("employees").remove().catch(() => { }),
                      db.ref("attendance").remove().catch(() => { }),
                      db.ref("months").remove().catch(() => { }),
                      db.ref("monthsNotes").remove().catch(() => { }),
                      db.ref("activityLog").remove().catch(() => { }),
                      db
                        .ref("users")
                        .once("value")
                        .then((snapshot) => {
                          const users = snapshot.val() || {};
                          const updates = {};
                          Object.keys(users).forEach((username) => {
                            if (username !== currentUser) updates[username] = null;
                          });
                          return db.ref("users").update(updates).catch(() => { });
                        }),
                    ])
                      .then(() => {
                        alert("✅ تم حذف كل البيانات ما عدا حسابك الحالي.");
                      })
                      .catch((e) => {
                        alert("❌ خطأ في حذف البيانات: " + e.message);
                      });
                    break;
                }
              }
            );
          };
        document.getElementById("closeAdminPassModalBtn").onclick =
          function () {
            passModal.remove();
          };
      };
    }
  );
}
function advancedDeleteContinue() {
  Array.from(document.getElementsByClassName("deleteOpBtn")).forEach(
    (btn) => {
      btn.onclick = function () {
        const choice = btn.getAttribute("data-op");
        modal.remove();
        // نافذة إدخال كلمة مرور المدير
        let passModal = document.getElementById("adminPassModal");
        if (passModal) passModal.remove();
        passModal = document.createElement("div");
        passModal.id = "adminPassModal";
        passModal.style = `position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.35);z-index:9999;display:flex;align-items:center;justify-content:center;`;
        passModal.innerHTML = `
        <div style=\"background:#fff;max-width:350px;width:90vw;padding:22px 18px 18px 18px;border-radius:14px;box-shadow:0 8px 32px #0002;position:relative;text-align:center;\">
          <button id=\"closeAdminPassModalBtn\" style=\"position:absolute;top:10px;left:10px;background:#dc3545;color:white;border:none;border-radius:50%;width:32px;height:32px;font-size:18px;cursor:pointer;\">✖</button>
          <div style=\"font-size:17px;color:#333;margin-bottom:18px;\">يرجى إدخال كلمة مرور المدير للتأكيد:</div>
          <input id=\"adminPassInput\" type=\"password\" style=\"width:90%;padding:8px 10px;font-size:16px;border-radius:6px;border:1px solid #ccc;margin-bottom:14px;\" />
          <button id=\"adminPassConfirmBtn\" style=\"background:#007bff;color:white;padding:8px 18px;border:none;border-radius:6px;font-size:16px;cursor:pointer;\">تأكيد</button>
        </div>
      `;
        document.body.appendChild(passModal);
        document.getElementById("adminPassConfirmBtn").onclick =
          async function () {
            const adminPass =
              document.getElementById("adminPassInput").value;
            passModal.remove();
            const snapshot = await db
              .ref("users/admin/password")
              .once("value");
            const realAdminPass = snapshot.val();
            const ok = await verifyPassword(realAdminPass, adminPass);
            if (!ok) {
              alert("❌ كلمة المرور غير صحيحة!");
              return;
            }
            // نافذة تأكيد نهائي
            showConfirmModal(
              "هل أنت متأكد من تنفيذ هذا الإجراء؟ لا يمكن التراجع عنه!",
              () => {
                switch (choice) {
                  case "1": {
                    // حذف موظفي الشهر الحالي فقط
                    const empKey = `employees_${year}_${(month + 1).toString().padStart(2, "0")}`;
                    const monthFormatted = (month + 1).toString().padStart(2, '0');
                    const newEmpPath = `months/${year}/${monthFormatted}/employees`;
                    Promise.all([
                      db.ref("employees/" + empKey).remove().catch(() => { }),
                      db.ref(newEmpPath).remove().catch(() => { }),
                    ])
                      .then(() => alert("✅ تم حذف موظفي الشهر الحالي فقط."))
                      .catch((e) => alert("❌ خطأ في حذف الموظفين: " + e.message));
                    break;
                  }
                  case "2":
                    db.ref("users")
                      .remove()
                      .then(() => alert("✅ تم حذف حسابات المستخدمين."))
                      .catch((e) =>
                        alert(
                          "❌ خطأ في حذف حسابات المستخدمين: " + e.message
                        )
                      );
                    break;
                  case "3": {
                    // حذف التاشيرات (الحضور) للشهر الحالي فقط
                    const days = getDays();
                    const updates = {};
                    days.forEach((day) => {
                      const dayKey = day.key;
                      updates[`attendance/${dayKey}`] = null;
                      try {
                        const parts = dayKey.split('-');
                        if (parts.length >= 3) {
                          const y = parts[0];
                          const mm = String(Number(parts[1])).padStart(2, '0');
                          updates[`months/${y}/${mm}/attendance/${dayKey}`] = null;
                        }
                      } catch (e) { }
                    });
                    db.ref()
                      .update(updates)
                      .then(() => alert("✅ تم حذف تاشيرات الشهر الحالي فقط."))
                      .catch((e) => alert("❌ خطأ في حذف التاشيرات: " + e.message));
                    break;
                  }
                  case "4":
                    db.ref("activityLog")
                      .remove()
                      .then(() => alert("✅ تم حذف سجل النشاطات."))
                      .catch((e) =>
                        alert("❌ خطأ في حذف سجل النشاطات: " + e.message)
                      );
                    break;
                  case "5":
                    Promise.all([
                      db.ref("employees").remove().catch(() => { }),
                      db.ref("attendance").remove().catch(() => { }),
                      db.ref("months").remove().catch(() => { }),
                      db.ref("monthsNotes").remove().catch(() => { }),
                      db.ref("activityLog").remove().catch(() => { }),
                      db
                        .ref("users")
                        .once("value")
                        .then((snapshot) => {
                          const users = snapshot.val() || {};
                          const updates = {};
                          Object.keys(users).forEach((username) => {
                            if (username !== currentUser) updates[username] = null;
                          });
                          return db.ref("users").update(updates).catch(() => { });
                        }),
                    ])
                      .then(() => {
                        alert("✅ تم حذف كل البيانات ما عدا حسابك الحالي.");
                      })
                      .catch((e) => {
                        alert("❌ خطأ في حذف البيانات: " + e.message);
                      });
                    break;
                }
              }
            );
          };
        document.getElementById("closeAdminPassModalBtn").onclick =
          function () {
            passModal.remove();
          };
      };
    }
  );
}

document.addEventListener("DOMContentLoaded", () => {
  const btnDeleteData = document.getElementById("btnDeleteData");
  if (btnDeleteData)
    btnDeleteData.addEventListener("click", advancedDelete);
});

// ========== طرد المستخدم ==========
function checkForcedLogoutOnLogin(userKey) {
  // Modified: automatically clear a forcedLogout flag instead of
  // immediately removing the session and reloading the page.
  // This preserves the logged-in session while removing the server-side
  // forced-logout marker (matches the manual console action you tested).
  return db
    .ref("forcedLogout/" + userKey)
    .once("value")
    .then((snapshot) => {
      if (snapshot.exists()) {
        // If a forced logout marker exists at login time, enforce it: remove marker then logout the session
        return db
          .ref("forcedLogout/" + userKey)
          .remove()
          .then(() => {
            try { logActivity("Forced logout executed at login", userKey); } catch (e) { }
            try { showForcedLogoutModal(); } catch (e) { }
            // perform logout UI update
            try { logout(); } catch (e) { }
            return true;
          })
          .catch((err) => {
            console.error("Failed to remove forcedLogout:", err);
            return false;
          });
      }
      return false;
    });
}

// نافذة أنيقة عند حذف حساب المستخدم من قبل المدير
function showAccountDeletedModal() {
  let oldModal = document.getElementById("accountDeletedModal");
  if (oldModal) oldModal.remove();
  const modal = document.createElement("div");
  modal.id = "accountDeletedModal";
  modal.style = `position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.25);z-index:9999;display:flex;align-items:center;justify-content:center;`;
  modal.innerHTML = `
    <div style=\"background:linear-gradient(135deg,#fff7f7 60%,#fce4ec 100%);max-width:370px;width:92vw;padding:32px 20px 22px 20px;border-radius:18px;box-shadow:0 8px 32px #e5737333;position:relative;text-align:center;animation:fadeIn 0.3s;\">
      <div style=\"font-size:21px;color:#d32f2f;margin-bottom:18px;font-weight:700;letter-spacing:0.2px;\">🚫 تم حذف حسابك</div>
      <div style=\"font-size:16.5px;color:#2d3a4a;line-height:1.8;margin-bottom:16px;background:#fff3f3;border-radius:8px;padding:10px 7px 8px 7px;box-shadow:0 1px 4px #e5737311;\">تم حذف حسابك من قبل المدير.<br>لن تتمكن من الدخول إلا إذا تم إنشاؤه من جديد.</div>
    </div>
    
  `;
  document.body.appendChild(modal);
}

// نافذة أنيقة عند تسجيل خروج المستخدم إجباريًا (احتياط)
function showForcedLogoutModal() {
  let oldModal = document.getElementById("forcedLogoutModal");
  if (oldModal) oldModal.remove();
  const modal = document.createElement("div");
  modal.id = "forcedLogoutModal";
  modal.style = `position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.25);z-index:9999;display:flex;align-items:center;justify-content:center;`;
  modal.innerHTML = `
    <div style=\"background:linear-gradient(135deg,#f7faff 60%,#e3eafc 100%);max-width:370px;width:92vw;padding:32px 20px 22px 20px;border-radius:18px;box-shadow:0 8px 32px #1976d233;position:relative;text-align:center;animation:fadeIn 0.3s;\">
      <div style=\"font-size:21px;color:#1976d2;margin-bottom:18px;font-weight:700;letter-spacing:0.2px;\">🚪 تم تسجيل خروجك</div>
      <div style=\"font-size:16.5px;color:#2d3a4a;line-height:1.8;margin-bottom:16px;background:#f3f7ff;border-radius:8px;padding:10px 7px 8px 7px;box-shadow:0 1px 4px #1976d211;\">تم تسجيل خروجك من قبل المدير.<br>لن تتمكن من استخدام النظام حتى تعيد تسجيل الدخول.</div>
    </div>
    
  `;
  document.body.appendChild(modal);
}
if (localStorage.getItem("loggedUser")) {
  const savedUser = JSON.parse(localStorage.getItem("loggedUser"));
  checkForcedLogoutOnLogin(savedUser.user);
}
setInterval(() => {
  // Periodic check: if there's a forcedLogout marker, perform forced logout
  if (currentUser) {
    db.ref("forcedLogout/" + currentUser)
      .once("value")
      .then((snapshot) => {
        if (snapshot.exists()) {
          // remove the server-side flag and then log the user out locally
          db.ref("forcedLogout/" + currentUser)
            .remove()
            .then(() => {
              try { logActivity("Forced logout executed", currentUser); } catch (e) { }
              try {
                // show a modal explaining the forced logout and clear session
                showForcedLogoutModal();
                logout();
              } catch (e) { console.error('Error during forced logout handling', e); }
            })
            .catch((err) => console.error("Failed to remove forcedLogout:", err));
        }
      });
  }
}, 3000);

// ========== إحصائيات الموظفين للمستخدمين ==========
function setEmpStatsEnabled(enabled) {
  db.ref("settings/showEmpStats").set(enabled ? true : false);
}
function getEmpStatsEnabled() {
  return db
    .ref("settings/showEmpStats")
    .once("value")
    .then((snap) => !!snap.val());
}
function setEmpStatsMode(mode, value) {
  db.ref("settings/empStatsMode").set({ mode, value: value || "" });
}
function getEmpStatsMode() {
  return db
    .ref("settings/empStatsMode")
    .once("value")
    .then((snap) => snap.val() || { mode: "all", value: "" });
}
// نافذة تفاصيل إحصائيات الموظفين للمدير
document.getElementById("toggleEmpStatsBtn").onclick = function () {
  let tab = document.getElementById("empStatsTab");
  tab.style.display = "flex";
  document.getElementById("closeEmpStatsTab").onclick = function () {
    tab.style.display = "none";
  };
  renderEmpStatsTabContent();
};

function renderEmpStatsTabContent() {
  const contentDiv = document.getElementById("empStatsTabContent");
  contentDiv.innerHTML = "جاري التحميل...";

  const empKey = `employees_${year}_${(month + 1).toString().padStart(2, "0")}`;
  Promise.all([
    db.ref("users").once("value"),
    db.ref("employees/" + empKey).once("value"),
  ]).then(([usersSnap, empsSnap]) => {
    const users = usersSnap.val() || {};
    const employeesList = empsSnap.exists() ? Object.values(empsSnap.val()) : [];

    let html = `<div style='font-size:14px;color:var(--text-secondary);margin-bottom:16px;text-align:center;'>حدد الموظفين المسموح عرضهم لكل مستخدم، وخيار عرض الرواتب. التغيير يحفظ فوراً.</div>`;
    html += `<div style='display:flex;flex-direction:column;gap:12px;'>`;

    Object.entries(users).forEach(([username, data]) => {
      if (username === "admin") return;
      const allowedEmps = data.allowedStatsEmps || [];
      const canViewSalary = !!data.canViewSalary;

      html += `
      <div style='background:var(--bg-main);border-radius:10px;padding:14px 16px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;border:1px solid var(--border-color);box-shadow:var(--shadow-sm);transition:all 0.2s;'>
        <div style='display:flex;align-items:center;gap:10px;min-width:140px;'>
          <div style='width:36px;height:36px;background:var(--primary-light);color:var(--primary);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:16px;'>${username.charAt(0).toUpperCase()}</div>
          <span style='font-weight:600;color:var(--text-primary);font-size:15px;'>${username}</span>
        </div>
        
        <div style='flex:1;min-width:180px;display:flex;flex-direction:column;gap:5px;'>
          <label style='font-size:12px;color:var(--text-secondary);font-weight:600;'>الموظفين المسموحين للمستخدم:</label>
          <select multiple data-user='${username}' class='allowedEmpsSelect' style='width:100%;min-height:42px;background:#fff;border:1px solid var(--border-color);border-radius:8px;padding:6px;font-size:14px;color:var(--text-primary);box-shadow:inset 0 1px 2px rgba(0,0,0,0.02);'>
            ${employeesList
          .map(
            (emp) =>
              `<option value='${emp}' ${allowedEmps.includes(emp) ? "selected" : ""} style='padding:4px;'>${emp}</option>`
          )
          .join("")}
          </select>
        </div>

        <div style='display:flex;flex-direction:column;align-items:center;min-width:100px;gap:6px;'>
          <span style='font-size:12px;color:var(--text-secondary);font-weight:600;'>عرض الرواتب</span>
          <label class="switch" style="position:relative;display:inline-block;width:44px;height:24px;">
            <input type='checkbox' data-user='${username}' class='canViewSalaryCheckbox' style="opacity:0;width:0;height:0;" ${canViewSalary ? "checked" : ""} />
            <span class="slider round" style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:#ccc;transition:.4s;border-radius:24px;"></span>
          </label>
        </div>
      </div>`;
    });

    html += `</div>`;
    contentDiv.innerHTML = html;

    // حفظ الموظفين المسموح عرضهم عند التغيير
    Array.from(
      document.getElementsByClassName("allowedEmpsSelect")
    ).forEach((sel) => {
      sel.onchange = function () {
        const user = sel.getAttribute("data-user");
        const selected = Array.from(sel.selectedOptions).map(
          (opt) => opt.value
        );
        // تحديث قاعدة البيانات
        db.ref("users/" + user + "/allowedStatsEmps")
          .set(selected)
          .then(() => {
            logActivity(
              "تغيير صلاحية إحصائيات الموظفين",
              "تم تغيير الموظفين المسموح عرضهم للمستخدم: " +
              user +
              " إلى: " +
              selected.join(", ")
            );
          });
        // إذا كان المستخدم الحالي هو المتأثر، حدث الإحصائيات فوراً (بدون انتظار قاعدة البيانات)
        if (user === currentUser) {
          // تحديث صلاحيات المستخدم الحالي في الذاكرة
          if (window.currentUserData)
            window.currentUserData.allowedStatsEmps = selected;
          // إعادة حساب الإحصائيات فوراً
          db.ref("attendance")
            .once("value")
            .then((snap) => {
              calculateStats(snap.val() || {});
            });
        }
      };
    });
    // حفظ خيار الرواتب عند التغيير
    Array.from(
      document.getElementsByClassName("canViewSalaryCheckbox")
    ).forEach((chk) => {
      chk.onchange = function () {
        const user = chk.getAttribute("data-user");
        const val = chk.checked;
        // تحديث قاعدة البيانات
        db.ref("users/" + user + "/canViewSalary")
          .set(val)
          .then(() => {
            logActivity(
              "تغيير صلاحية الرواتب",
              "تم تغيير صلاحية عرض الرواتب للمستخدم: " +
              user +
              " إلى: " +
              (val ? "نعم" : "لا")
            );
          });
        // إذا كان المستخدم الحالي هو المتأثر، حدث الإحصائيات فوراً (بدون انتظار قاعدة البيانات)
        if (user === currentUser) {
          if (window.currentUserData)
            window.currentUserData.canViewSalary = val;
          db.ref("attendance")
            .once("value")
            .then((snap) => {
              calculateStats(snap.val() || {});
            });
        }
      };
    });
    // مراقبة تغييرات صلاحيات المستخدم الحالي بشكل فوري (Realtime)
    if (typeof window._statsPermsListenerSet === "undefined") {
      window._statsPermsListenerSet = true;
      ["allowedStatsEmps", "canViewSalary"].forEach((key) => {
        db.ref("users/" + currentUser + "/" + key).on(
          "value",
          function () {
            db.ref("attendance")
              .once("value")
              .then((snap) => {
                calculateStats(snap.val() || {});
              });
          }
        );
      });
    }
  });
}

// ========== إحصائيات للمستخدمين ==========
const userEmpStatsDiv = document.createElement("div");
userEmpStatsDiv.id = "userEmpStatsDiv";
userEmpStatsDiv.style.margin = "20px 0";
userEmpStatsDiv.style.padding = "10px";
userEmpStatsDiv.style.background = "#f8f9fa";
userEmpStatsDiv.style.border = "1px solid #ddd";
userEmpStatsDiv.style.borderRadius = "7px";
userEmpStatsDiv.style.display = "none";
document.getElementById("mainContent").appendChild(userEmpStatsDiv);

function renderUserEmpStats() {
  Promise.all([getEmpStatsEnabled(), getEmpStatsMode()]).then(
    ([enabled, modeObj]) => {
      if (!enabled) {
        userEmpStatsDiv.style.display = "none";
        return;
      }
      let allow = false,
        onlyEmp = null;
      if (modeObj.mode === "all") allow = true;
      else if (modeObj.mode === "user" && currentUser === modeObj.value)
        allow = true;
      else if (modeObj.mode === "employee") {
        allow = true;
        onlyEmp = modeObj.value;
      }
      if (!allow) {
        userEmpStatsDiv.style.display = "none";
        return;
      }
      let html = `
      <b>إحصائيات الموظفين:</b>
      <div id='userEmpStatsGrid' style='margin-top:12px;display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:13px;'></div>
      
    `;
      userEmpStatsDiv.innerHTML = html;
      const gridDiv = document.getElementById("userEmpStatsGrid");
      gridDiv.innerHTML =
        "<div style='text-align:center;width:100%;color:#888;'>جاري التحميل...</div>";
      db.ref("attendance")
        .once("value")
        .then((snapshot) => {
          const data = snapshot.val() || {};
          // استخدم صلاحيات المستخدم الحالي من الذاكرة إذا كان هو المتأثر
          let allowedEmps, canViewSalary;
          if (typeof window.currentUserData !== "undefined") {
            allowedEmps = window.currentUserData.allowedStatsEmps || [];
            canViewSalary = !!window.currentUserData.canViewSalary;
          } else {
            allowedEmps = [];
            canViewSalary = false;
          }
          // إذا كان المدير، يرى الجميع
          let showEmps =
            currentUserRole === "admin"
              ? window.monthEmployees
              : allowedEmps;
          // إذا لم يتم تحديد صلاحيات، يرى الجميع
          if (!Array.isArray(showEmps) || showEmps.length === 0)
            showEmps = window.monthEmployees;
          // تحقق من وجود موظفين
          if (!Array.isArray(showEmps) || showEmps.length === 0) {
            gridDiv.innerHTML =
              "<div style='text-align:center;width:100%;color:#888;'>لا يوجد موظفون لهذا الشهر.</div>";
            userEmpStatsDiv.style.display = "block";
            return;
          }
          // تحقق من وجود بيانات حضور للشهر الحالي
          let hasAttendance = false;
          Object.entries(data).forEach(([dateStr, day]) => {
            let parts = dateStr.split("-");
            if (parts.length === 3) {
              let dYear = parseInt(parts[0]);
              let dMonth = parseInt(parts[1]) - 1;
              if (dYear === year && dMonth === month)
                hasAttendance = true;
            }
          });
          if (!hasAttendance) {
            gridDiv.innerHTML =
              "<div style='text-align:center;width:100%;color:#888;'>لا توجد بيانات حضور لهذا الشهر.</div>";
            userEmpStatsDiv.style.display = "block";
            return;
          }
          gridDiv.innerHTML = "";
          showEmps.forEach((emp) => {
            if (onlyEmp && emp !== onlyEmp) return;
            let shift = 0,
              half = 0,
              x = 0;
            Object.entries(data).forEach(([dateStr, day]) => {
              let parts = dateStr.split("-");
              if (parts.length === 3) {
                let dYear = parseInt(parts[0]);
                let dMonth = parseInt(parts[1]) - 1;
                if (dYear === year && dMonth === month) {
                  if (day[emp] === "شفت") shift++;
                  if (day[emp] === "نص") half++;
                  if (day[emp] === "❌") x++;
                }
              }
            });
            const rates = getRatesForEmployee(emp, year, month);
            const salary = shift * (rates.shift || 20000) + half * (rates.half || 10000);
            const card = document.createElement("div");
            card.className = "emp-card";
            card.innerHTML = `
          <div class='emp-name'>${emp}</div>
          <div class='emp-stats'>
            <div class='stat shift'>✅ شفت: <b>${shift}</b></div>
            <div class='stat half'>🌓 نص: <b>${half}</b></div>
            <div class='stat absent'>🏖️ اجازة: <b>${x}</b></div>
          </div>
          ${canViewSalary || currentUserRole === "admin"
                ? `<div class='emp-salary' style='margin-top:8px;font-size:15px;color:#222;background:#e3f7e3;padding:6px 0;border-radius:7px;width:100%;text-align:center;'>💰 الراتب الكلي: <b>${salary.toLocaleString()} د.ع</b></div>`
                : ""
              }
        `;
            gridDiv.appendChild(card);
          });
          userEmpStatsDiv.style.display = "block";
        });
    }
  );
}
function tryShowUserEmpStats() {
  if (
    typeof window.monthEmployees !== "undefined" &&
    window.monthEmployees.length > 0
  )
    renderUserEmpStats();
}
const origLoadEmployees = loadEmployees;
loadEmployees = function () {
  return origLoadEmployees.apply(this, arguments).then(() => {
    if (
      typeof window.monthEmployees !== "undefined" &&
      window.monthEmployees.length > 0
    ) {
      renderUserEmpStats();
    }
  });
};
if (localStorage.getItem("loggedUser")) tryShowUserEmpStats();
db.ref("settings/empStatsMode").on("value", () => renderUserEmpStats());

// ========== تغيير كلمة مرور المدير ==========
// تعديل: السماح فقط للمدير بتغيير كلمة المرور
function changeAdminPassword() {
  const oldPass = document.getElementById("adminOldPass").value;
  const newPass = document.getElementById("adminNewPass").value;
  const statusDiv = document.getElementById("adminPassStatus");
  if (currentUserRole !== "admin") {
    statusDiv.textContent = "❌ فقط المدير يمكنه تغيير كلمة المرور.";
    return;
  }
  if (!oldPass || !newPass) {
    statusDiv.textContent = "يرجى إدخال جميع الحقول.";
    return;
  }
  db.ref("users/admin/password")
    .once("value")
    .then(async (snapshot) => {
      try {
        const stored = snapshot.val();
        // use verifyPassword to support hashed and legacy formats
        const ok = await verifyPassword(stored, oldPass);
        if (!ok) {
          statusDiv.textContent = "كلمة المرور الحالية غير صحيحة.";
          return;
        }
        const hashObj = await hashPassword(newPass);
        await db.ref("users/admin/password").set(hashObj);
        statusDiv.textContent = "✅ تم تغيير كلمة المرور بنجاح.";
        document.getElementById("adminOldPass").value = "";
        document.getElementById("adminNewPass").value = "";
        logActivity(
          "تغيير كلمة مرور المدير",
          `تم تغيير كلمة المرور من قبل: ${currentUser}`
        );
      } catch (err) {
        console.error("Error changing admin password:", err);
        statusDiv.textContent = "❌ حدث خطأ أثناء تغيير كلمة المرور.";
      }
    })
    .catch((err) => {
      console.error("Error reading admin password:", err);
      statusDiv.textContent = "❌ حدث خطأ أثناء تغيير كلمة المرور.";
    });
}

// ========== حذف موظف ==========
// تعديل: السماح فقط للمدير بالحذف والتحقق من وجود الموظف
function deleteEmployee(index) {
  if (!canEditCurrentMonth()) return;
  if (!hasPermission('staff')) {
    alert("❌ عذراً، لا تمتلك صلاحية لحذف الموظفين.");
    return;
  }
  const empName = employees[index];
  if (!empName) {
    alert("❌ الموظف غير موجود.");
    return;
  }
  showConfirmModal(
    `هل أنت متأكد من حذف الموظف \"${empName}\"؟ سيتم حذف جميع بيانات حضوره أيضا.`,
    async () => {
      if (!canEditCurrentMonth()) return;
      const newEmployees = employees.slice();
      newEmployees.splice(index, 1);
      // Remove employee attendance for current month only
      const monthFormatted = String(month + 1).padStart(2, '0');
      const attendancePath = `months/${year}/${monthFormatted}/attendance`;
      const attendanceSnapshot = await db.ref(attendancePath).once("value");
      const attendance = attendanceSnapshot.val() || {};
      Object.keys(attendance).forEach((dayKey) => {
        if (attendance[dayKey] && attendance[dayKey][empName] !== undefined) {
          delete attendance[dayKey][empName];
          if (Object.keys(attendance[dayKey]).length === 0) {
            delete attendance[dayKey];
          }
        }
      });
      await db.ref(attendancePath).set(attendance);
      // Remove employee from allowedStatsEmps for all users
      const usersSnap = await db.ref("users").once("value");
      const users = usersSnap.val() || {};
      await Promise.all(Object.entries(users).map(async ([username, data]) => {
        if (username === "admin") return;
        const allowed = Array.isArray(data.allowedStatsEmps) ? data.allowedStatsEmps : [];
        if (allowed.includes(empName)) {
          const updated = allowed.filter(e => e !== empName);
          await db.ref("users/" + username + "/allowedStatsEmps").set(updated);
        }
      }));
      saveEmployees(newEmployees);
      logActivity(
        "حذف موظف",
        `تم حذف الموظف: ${empName} وجميع بيانات حضوره وصلاحيات ظهوره للمستخدمين`
      );
    }
  );
}

// فتح نافذة تغيير كلمة المرور
document.getElementById("sidebarChangePassBtn").onclick = function () {
  document.getElementById("sidebarMenu").classList.remove("open");
  showChangePassForm();
};

function showChangePassForm() {
  const modal = document.getElementById("changePassModal");
  const formDiv = document.getElementById("changePassForm");
  const statusDiv = document.getElementById("changePassStatus");
  statusDiv.textContent = "";
  // إذا المدير، يمكنه اختيار أي مستخدم أو نفسه
  if (currentUserRole === "admin") {
    db.ref("users")
      .once("value")
      .then((snapshot) => {
        const users = snapshot.val() || {};
        let html = `<div style='margin-bottom:10px;font-size:15px;color:#1976d2;font-weight:bold;'>إدارة المستخدمين وكلمات المرور</div>
        <label style='font-size:14px;'>اختر المستخدم:</label>
        <select id="changePassUser" style="width:100%;margin-bottom:10px;">`;
        Object.keys(users).forEach((u) => {
          html += `<option value="${u}" ${u === currentUser ? "selected" : ""
            }>${u}${u === "admin" ? " (مدير)" : ""}</option>`;
        });
        html += `</select>
        <label style='font-size:14px;'>اسم مستخدم جديد:</label>
        <input type="text" id="changeUserName" placeholder="اكتب اسم المستخدم الجديد (اختياري)" style="margin-bottom:8px;" />
        <label style='font-size:14px;'>كلمة مرور جديدة:</label>
        <input type="password" id="changePassNew" placeholder="اكتب كلمة المرور الجديدة (اختياري)" style="margin-bottom:8px;" />
        <button id="changeUserSubmit" style="background:#2196f3;color:white;width:100%;margin-top:8px;font-size:16px;">حفظ التغييرات</button>
        <button id="resetPassBtn" style="background:#ff9800;color:white;width:100%;margin-top:8px;font-size:16px;">إعادة ضبط كلمة المرور (بدون الحاجة للكلمة القديمة)</button>
        <div style='margin-top:10px;font-size:13px;color:#555;'>يمكنك تغيير اسم المستخدم أو كلمة المرور لأي مستخدم بسهولة.<br>زر إعادة الضبط يسمح لك بتعيين كلمة مرور جديدة مباشرة إذا نسي المستخدم كلمة المرور القديمة.</div>`;
        formDiv.innerHTML = html;
        modal.style.display = "flex";
        // تغيير اسم المستخدم أو كلمة المرور بدون الحاجة لكلمة المرور القديمة
        document.getElementById("changeUserSubmit").onclick =
          async function () {
            const user = document.getElementById("changePassUser").value;
            const newPass =
              document.getElementById("changePassNew").value;
            const newUserName = document
              .getElementById("changeUserName")
              .value.trim();
            let changed = false;
            // تغيير اسم المستخدم إذا تم إدخال اسم جديد ولم يكن مستخدم مسبقًا
            if (newUserName && !users[newUserName]) {
              const userDataSnap = await db
                .ref("users/" + user)
                .once("value");
              const userData = userDataSnap.val();
              await db.ref("users/" + newUserName).set(userData);
              await db.ref("users/" + user).remove();
              statusDiv.textContent = `✅ تم تغيير اسم المستخدم إلى: ${newUserName}`;
              logActivity(
                "تغيير اسم مستخدم",
                `تم تغيير اسم المستخدم من ${user} إلى ${newUserName} بواسطة: ${currentUser}`
              );
              changed = true;
            } else if (newUserName && users[newUserName]) {
              statusDiv.textContent =
                "❌ اسم المستخدم الجديد مستخدم بالفعل.";
              return;
            }
            // تغيير كلمة المرور إذا تم إدخال كلمة مرور جديدة
            if (newPass) {
              const hashObj = await hashPassword(newPass);
              const targetUser =
                newUserName && !users[newUserName] ? newUserName : user;
              await db
                .ref("users/" + targetUser + "/password")
                .set(hashObj);
              statusDiv.textContent +=
                (changed ? "<br>" : "") +
                "✅ تم تغيير كلمة المرور بنجاح.";
              logActivity(
                "تغيير كلمة مرور",
                `تم تغيير كلمة المرور للمستخدم: ${targetUser} بواسطة: ${currentUser}`
              );
              changed = true;
            }
            if (!changed) {
              statusDiv.textContent =
                "يرجى إدخال اسم مستخدم جديد أو كلمة مرور جديدة.";
            }
            document.getElementById("changePassNew").value = "";
            document.getElementById("changeUserName").value = "";
          };
        // إعادة ضبط كلمة المرور بدون الحاجة للكلمة القديمة
        document.getElementById("resetPassBtn").onclick =
          async function () {
            const user = document.getElementById("changePassUser").value;
            let newPass = "";
            // نافذة احترافية لإدخال كلمة المرور الجديدة
            let passModal = document.createElement("div");
            passModal.style =
              "position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.18);z-index:9999;display:flex;align-items:center;justify-content:center;";
            passModal.innerHTML = `<div style='background:#fff;max-width:340px;width:95vw;border-radius:12px;box-shadow:0 8px 32px #0002;padding:22px 18px 18px 18px;position:relative;text-align:center;'>
          <h3 style='color:#ff9800;margin-bottom:12px;'>إعادة ضبط كلمة المرور</h3>
          <div style='margin-bottom:10px;font-size:15px;'>أدخل كلمة المرور الجديدة للمستخدم <b style='color:#1976d2;'>${user}</b>:</div>
          <input type='password' id='newPassInput' style='width:90%;padding:8px 10px;font-size:16px;border-radius:6px;border:1px solid #ccc;margin-bottom:14px;' placeholder='كلمة المرور الجديدة' />
          <button id='confirmNewPassBtn' style='background:#2196f3;color:white;padding:8px 18px;border:none;border-radius:6px;font-size:16px;cursor:pointer;'>تأكيد</button>
          <button id='cancelNewPassBtn' style='background:#dc3545;color:white;padding:8px 18px;border:none;border-radius:6px;font-size:16px;cursor:pointer;margin-left:8px;'>إلغاء</button>
        </div>`;
            document.body.appendChild(passModal);
            document.getElementById("confirmNewPassBtn").onclick =
              async function () {
                newPass = document.getElementById("newPassInput").value;
                if (!newPass) {
                  statusDiv.textContent = "يرجى إدخال كلمة مرور جديدة.";
                  passModal.remove();
                  return;
                }
                const hashObj = await hashPassword(newPass);
                await db.ref("users/" + user + "/password").set(hashObj);
                statusDiv.textContent =
                  "✅ تم إعادة ضبط كلمة المرور بنجاح.";
                logActivity(
                  "إعادة ضبط كلمة مرور",
                  `تم إعادة ضبط كلمة المرور للمستخدم: ${user} بواسطة: ${currentUser}`
                );
                passModal.remove();
              };
            document.getElementById("cancelNewPassBtn").onclick =
              function () {
                passModal.remove();
              };
          };
      });
  } else {
    let html = `
      <input type="text" id="changeUserName" placeholder="اسم مستخدم جديد (اختياري)" style="margin-bottom:8px;" />
      <input type="password" id="changePassOld" placeholder="كلمة المرور الحالية" style="margin-bottom:8px;" />
      <input type="password" id="changePassNew" placeholder="كلمة المرور الجديدة" style="margin-bottom:8px;" />
      <button id="changePassSubmit" style="background:#2196f3;color:white;width:100%;margin-top:8px;">تغيير كلمة المرور</button>
      <button id="resetPassBtn" style="background:#ff9800;color:white;width:100%;margin-top:8px;">إعادة ضبط كلمة المرور (إذا نسيت القديمة)</button>`;
    formDiv.innerHTML = html;
    modal.style.display = "flex";
    document.getElementById("changePassSubmit").onclick =
      async function () {
        const oldPass = document.getElementById("changePassOld").value;
        const newPass = document.getElementById("changePassNew").value;
        const newUserName = document
          .getElementById("changeUserName")
          .value.trim();
        if (!oldPass || !newPass)
          return (statusDiv.textContent = "يرجى إدخال جميع الحقول.");
        const passSnap = await db
          .ref("users/" + currentUser + "/password")
          .once("value");
        const stored = passSnap.val();
        const ok = await verifyPassword(stored, oldPass);
        if (!ok)
          return (statusDiv.textContent =
            "كلمة المرور الحالية غير صحيحة.");
        const hashObj = await hashPassword(newPass);
        await db.ref("users/" + currentUser + "/password").set(hashObj);
        // تغيير اسم المستخدم إذا تم إدخال اسم جديد ولم يكن مستخدم مسبقًا
        const usersSnap = await db.ref("users").once("value");
        const users = usersSnap.val() || {};
        if (newUserName && !users[newUserName]) {
          const userDataSnap = await db
            .ref("users/" + currentUser)
            .once("value");
          const userData = userDataSnap.val();
          await db.ref("users/" + newUserName).set(userData);
          await db.ref("users/" + currentUser).remove();
          statusDiv.textContent = `✅ تم تغيير كلمة المرور واسم المستخدم إلى: ${newUserName}`;
          logActivity(
            "تغيير اسم مستخدم",
            `تم تغيير اسم المستخدم من ${currentUser} إلى ${newUserName}`
          );
        } else {
          statusDiv.textContent = "✅ تم تغيير كلمة المرور بنجاح.";
        }
        logActivity(
          "تغيير كلمة مرور",
          `تم تغيير كلمة المرور للمستخدم: ${currentUser}`
        );
        document.getElementById("changePassOld").value = "";
        document.getElementById("changePassNew").value = "";
        document.getElementById("changeUserName").value = "";
      };
    // إعادة ضبط كلمة المرور إذا نسيت القديمة
    document.getElementById("resetPassBtn").onclick = async function () {
      const newPass = prompt("أدخل كلمة المرور الجديدة:");
      if (!newPass)
        return (statusDiv.textContent = "يرجى إدخال كلمة مرور جديدة.");
      const hashObj = await hashPassword(newPass);
      await db.ref("users/" + currentUser + "/password").set(hashObj);
      statusDiv.textContent = "✅ تم إعادة ضبط كلمة المرور بنجاح.";
      logActivity(
        "إعادة ضبط كلمة مرور",
        `تم إعادة ضبط كلمة المرور للمستخدم: ${currentUser}`
      );
    };
  }
}
document.getElementById("closeChangePassModal").onclick = function () {
  document.getElementById("changePassModal").style.display = "none";
};

// ========== تحديث ظهور الأزرار حسب الدور ==========
// تم دمج دالة updateSidebarVisibility في الأعلى مع منطق موحد وتجنب التكرار

// ========== فتح وإغلاق القائمة الجانبية ==========
document.getElementById("sidebarToggleBtn").onclick = () => {
  document.getElementById("sidebarMenu").classList.add("open");
  document.getElementById("sidebarToggleBtn").style.display = "none";
  document.getElementById("sidebarCloseBtn").style.display = "flex";
  // عرض اسم المستخدم أعلى القائمة
  const sidebarUserName = document.getElementById("sidebarUserName");
  sidebarUserName.innerHTML = currentUser
    ? `<span style="display:inline-flex;align-items:center;gap:7px;">
          <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="User" style="width:22px;height:22px;border-radius:50%;background:#e3f0ff;margin-left:2px;">
          <span style="font-weight:600;color:#fffff;">${currentUser}</span>
             </span>`
    : "غير مسجل";
  updateSidebarVisibility();
};
document.getElementById("sidebarCloseBtn").onclick = () => {
  document.getElementById("sidebarMenu").classList.remove("open");
  document.getElementById("sidebarCloseBtn").style.display = "none";
  document.getElementById("sidebarToggleBtn").style.display = "flex";
  updateSidebarVisibility();
};

// Announcements feature (admin-only)
function updateAnnouncementsVisibility() {
  const btn = document.getElementById("sidebarAnnouncementsBtn");
  if (!btn) return;
  btn.style.display = hasPermission('announcements') ? "block" : "none";
  // Only show the local close button for admin users. Regular users cannot close the announcement.
  const closeBtn = document.getElementById('closeAnnouncementBar');
  if (closeBtn) {
    if (hasPermission('announcements')) {
      closeBtn.style.display = 'flex';
      // delegate precise positioning to a dedicated helper so it can
      // be re-used on resize and other layout changes.
      try {
        if (typeof positionAnnouncementCloseButton === 'function')
          positionAnnouncementCloseButton();
      } catch (e) {
        // fallback: ensure it's visible in the top-right
        closeBtn.style.position = 'absolute';
        closeBtn.style.right = '10px';
        closeBtn.style.top = '8px';
      }
    } else {
      closeBtn.style.display = 'none';
    }
  }
}
// call on load and when user role changes
try {
  updateAnnouncementsVisibility();
} catch (e) { }

// Helper: position the admin-only announcement close button next to the
// sidebar toggle. This is called from updateAnnouncementsVisibility and
// on window resize to keep it aligned.
function positionAnnouncementCloseButton() {
  const closeBtn = document.getElementById('closeAnnouncementBar');
  const toggle = document.getElementById('sidebarToggleBtn');
  if (!closeBtn) return;
  // Default placement (top-right) in case toggle isn't visible
  closeBtn.style.position = 'absolute';
  closeBtn.style.right = '10px';
  closeBtn.style.top = '8px';
  try {
    if (toggle && toggle.getBoundingClientRect) {
      const rect = toggle.getBoundingClientRect();
      // prefer fixed positioning so it follows viewport
      closeBtn.style.position = 'fixed';
      // align vertically with the toggle button
      closeBtn.style.top = rect.top + 'px';
      // place it to the left of the toggle by a small margin
      const leftPos = rect.left - (closeBtn.offsetWidth + 8);
      // if left would go off-screen, keep in top-right
      if (leftPos > 8) {
        closeBtn.style.left = leftPos + 'px';
        closeBtn.style.right = 'auto';
      } else {
        closeBtn.style.left = 'auto';
        closeBtn.style.right = '10px';
      }
    }
  } catch (err) {
    // ignore and keep default
  }
}

// Keep the close button positioned on resize and when the DOM is ready
window.addEventListener('resize', function () {
  try {
    positionAnnouncementCloseButton();
  } catch (e) { }
});
document.addEventListener('DOMContentLoaded', function () {
  try {
    positionAnnouncementCloseButton();
  } catch (e) { }
});

// Non-invasive debug helper: shows current session info in console when
// developer toggles `window.showSessionDebug()` in the console.
// Non-logging helper that returns session info (call .getAnnouncement() to fetch persisted announcement)
window.showSessionDebug = function () {
  return {
    currentUser: currentUser,
    currentUserRole: currentUserRole,
    currentUserCanEdit: currentUserCanEdit,
    getAnnouncement: function () {
      if (typeof db === 'undefined' || !db) return Promise.resolve(null);
      return db.ref('announcements/current').once('value').then(snap => snap.val()).catch(() => null);
    }
  };
};

document.getElementById("sidebarAnnouncementsBtn").onclick = function () {
  document.getElementById("sidebarMenu").classList.remove("open");
  document.getElementById("announceModal").style.display = "flex";
  document.getElementById("announceText").focus();
  // show delete button only to admin
  try {
    const delBtn = document.getElementById('deleteCurrentAnnounceBtn');
    if (delBtn) delBtn.style.display = hasPermission('announcements') ? 'block' : 'none';
  } catch (e) { }
};
document.getElementById("closeAnnounceModal").onclick = function () {
  document.getElementById("announceModal").style.display = "none";
};

// custom duration input handling
(function () {
  const durSel = document.getElementById('announceDuration');
  const modalInner = document.getElementById('announceModal').querySelector('div');
  let customInput = null;
  durSel.addEventListener('change', function () {
    if (this.value === 'custom') {
      if (!customInput) {
        customInput = document.createElement('input');
        customInput.type = 'number';
        customInput.min = '1';
        customInput.placeholder = 'أدخل عدد الدقائق (مثال: 90)';
        customInput.style = 'padding:8px;border-radius:6px;border:1px solid #ccc;width:100%;margin-top:6px;';
        durSel.parentNode.insertBefore(customInput, durSel.nextSibling);
      }
    } else {
      if (customInput) {
        customInput.remove();
        customInput = null;
      }
    }
  });
})();

// Announcement publish logic with DB persistence and listener
let announcementTimer = null;
let announceAnimation = null; // kept for backward compatibility but unused for static mode
function showAnnouncementLocal(text, minutes, opts) {
  if (!text || !text.trim()) return;
  const bar = document.getElementById("announcementBar");
  const inner = document.getElementById("announcementInner");
  // set static text and allow wrapping
  inner.textContent = text.trim();
  // apply formatting options when provided
  if (opts && opts.fontSize) inner.style.fontSize = opts.fontSize + 'px';
  else inner.style.fontSize = '18px';
  if (opts && opts.bgColor) bar.style.background = opts.bgColor;
  else bar.style.background = 'linear-gradient(90deg,#ff8a00,#ff6f00)';
  // make bar visible and allow it to size to content
  bar.style.display = "flex";
  bar.style.alignItems = "center";
  bar.style.justifyContent = "center";
  inner.style.transform = "none";
  // clear any previous timers/animations
  if (announceAnimation) {
    cancelAnimationFrame(announceAnimation);
    announceAnimation = null;
  }
  if (announcementTimer) clearTimeout(announcementTimer);
  const hideMs = minutes > 0 ? minutes * 60 * 1000 : 30 * 1000;
  // ensure the bar height can expand to the text content
  inner.style.display = 'block';
  inner.style.maxWidth = 'calc(100% - 100px)';
  inner.style.overflow = 'visible';
  // schedule hide
  announcementTimer = setTimeout(() => {
    bar.style.display = "none";
    // restore default background when hiding
    bar.style.background = 'linear-gradient(90deg,#ff8a00,#ff6f00)';
    inner.style.fontSize = '18px';
  }, hideMs);
}

// Persist announcement to DB under announcements/current
function publishAnnouncement(text, minutes, persist = true, opts) {
  if (!text || !text.trim()) return;
  const payload = {
    text: text.trim(),
    minutes: minutes,
    from: currentUser || "admin",
    ts: Date.now(),
    opts: opts || {},
  };
  // write to DB so it survives refresh across clients
  if (persist) {
    db.ref('announcements/current').set(payload).catch((e) => console.warn('Failed to persist announcement', e));
    if (typeof logActivity === 'function') {
      logActivity("إرسال إعلان", `تم نشر إعلان نصّه: "${payload.text}" لمدة ${payload.minutes} دقيقة`);
    }
  }
  // show immediately locally (apply formatting if provided)
  showAnnouncementLocal(payload.text, payload.minutes, payload.opts);
  // schedule removal from DB when expired (only if persisted)
  if (persist && minutes > 0) {
    setTimeout(() => {
      // only remove if unchanged
      db.ref('announcements/current').once('value').then(snap => {
        const cur = snap.val();
        if (!cur) return;
        if (cur.ts === payload.ts && cur.text === payload.text) {
          db.ref('announcements/current').remove().catch(() => { });
        }
      });
    }, minutes * 60 * 1000 + 2000);
  }
}

// close button handler
document.getElementById('closeAnnouncementBar').onclick = function () {
  const bar = document.getElementById('announcementBar');
  bar.style.display = 'none';
  if (announceAnimation) cancelAnimationFrame(announceAnimation);
  announceAnimation = null;
  if (announcementTimer) clearTimeout(announcementTimer);
  // If admin closed the bar, remove the persisted announcement so it
  // disappears for everyone.
  try {
    if (hasPermission('announcements')) {
      db.ref('announcements/current').once('value').then(snap => {
        const cur = snap.val();
        if (cur && typeof logActivity === 'function') {
          logActivity("حذف إعلان", `تم إغلاق/إزالة الإعلان النشط: "${cur.text}"`);
        }
        db.ref('announcements/current').remove().catch(() => { });
      });
    }
  } catch (e) { }
};

// Listen for announcement changes so they persist across refresh
db.ref('announcements/current').on('value', function (snap) {
  const val = snap.val();
  if (!val) {
    // clear UI
    const bar = document.getElementById('announcementBar');
    if (bar) bar.style.display = 'none';
    if (announceAnimation) cancelAnimationFrame(announceAnimation);
    announceAnimation = null;
    if (announcementTimer) clearTimeout(announcementTimer);
    return;
  }
  // calculate remaining time based on ts and minutes
  const elapsed = (Date.now() - (val.ts || 0)) / 60000; // minutes
  const remaining = (val.minutes || 0) - elapsed;
  // If already expired, remove from DB
  if (val.minutes > 0 && remaining <= 0) {
    db.ref('announcements/current').remove().catch(() => { });
    return;
  }
  // pass stored opts (bgColor, fontSize, etc.) so formatting persists across reloads
  showAnnouncementLocal(val.text, remaining > 0 ? remaining : 0.5, val.opts || {});
});

document.getElementById("publishAnnounceBtn").onclick = function () {
  const text = document.getElementById("announceText").value;
  const durEl = document.getElementById("announceDuration");
  let minutes = durEl.value === 'custom' && durEl.nextSibling && durEl.nextSibling.value ? parseInt(durEl.nextSibling.value, 10) : parseInt(durEl.value || "60", 10);
  if (!minutes || minutes <= 0) minutes = 60;
  const fontSize = parseInt(document.getElementById('announceFontSize').value, 10) || 18;
  const bgColor = document.getElementById('announceBgColor').value || '';
  const opts = { fontSize, bgColor };
  publishAnnouncement(text, minutes, true, opts);
  document.getElementById("announceModal").style.display = "none";
};
document.getElementById("previewAnnounceBtn").onclick = function () {
  const text = document.getElementById("announceText").value;
  const fontSize = parseInt(document.getElementById('announceFontSize').value, 10) || 18;
  const bgColor = document.getElementById('announceBgColor').value || '';
  const opts = { fontSize, bgColor };
  // preview should not persist — 12 seconds
  publishAnnouncement(text, 0.2, false, opts); // short preview (~12s)
};

// Delete current announcement button handler (in modal)
document.getElementById('deleteCurrentAnnounceBtn').onclick = function () {
  if (!confirm('هل أنت متأكد من حذف الإعلان الحالي؟')) return;
  db.ref('announcements/current').once('value').then(snap => {
    const cur = snap.val();
    if (cur && typeof logActivity === 'function') {
      logActivity("حذف إعلان", `تم حذف الإعلان الحالي: "${cur.text}"`);
    }
    return db.ref('announcements/current').remove();
  })
    .then(() => {
      alert('✅ تم حذف الإعلان الحالي');
      document.getElementById('announceModal').style.display = 'none';
    })
    .catch((e) => {
      console.error(e);
      alert('❌ فشل حذف الإعلان');
    });
};

// ========== ربط أزرار القائمة الجانبية بأزرار الموقع الأصلية ==========
// sidebarAdminBtn handler removed (duplicate) - handled earlier when sidebar is initialized
// document.getElementById("sidebarAdminBtn").onclick = () => {
//   document.getElementById("sidebarMenu").classList.remove("open");
// removed: document.getElementById("toggleAdminBtn").click(); — use toggleAdminPanel() instead
// };
document.getElementById("sidebarEmpStatsBtn").onclick = () => {
  document.getElementById("sidebarMenu").classList.remove("open");
  document.getElementById("toggleEmpStatsBtn").click();
};
document.getElementById("sidebarDeleteDataBtn").onclick = () => {
  document.getElementById("sidebarMenu").classList.remove("open");
  advancedDelete();
};


// نافذة تحكم صلاحيات سجل النشاطات للمدير
document.getElementById("sidebarUserControlBtn").onclick = function () {
  // إنشاء نافذة منبثقة احترافية
  let modal = document.getElementById("userLogControlModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "userLogControlModal";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100vw";
    modal.style.height = "100vh";
    modal.style.background = "rgba(0,0,0,0.35)";
    modal.style.zIndex = "8000";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.innerHTML = `
      <div style="background:#fff;max-width:420px;width:95vw;border-radius:14px;box-shadow:0 8px 32px #0002;padding:28px 20px 20px 20px;position:relative;">
        <button id="closeUserLogControlModal" style="position:absolute;top:10px;left:10px;background:#dc3545;color:white;border:none;border-radius:50%;width:32px;height:32px;font-size:18px;cursor:pointer;">✖</button>
        <h3 style="text-align:center;margin-bottom:18px;color:#009688;">👥 إدارة صلاحيات سجل النشاطات</h3>
        <div id="userLogControlContent" style="min-height:70px;">جاري التحميل...</div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById("closeUserLogControlModal").onclick =
      function () {
        modal.style.display = "none";
      };
  } else {
    modal.style.display = "flex";
  }

  // تحميل المستخدمين وصلاحياتهم
  db.ref("users")
    .once("value")
    .then((snapshot) => {
      const users = snapshot.val() || {};
      let html = `<table style="width:100%;border-collapse:collapse;margin-bottom:10px;">
      <tr>
        <th style="background:#f6f6f6;">المستخدم</th>
        <th style="background:#f6f6f6;">الوصول لسجل النشاطات</th>
        <th style="background:#f6f6f6;">نوع الصلاحية</th>
      </tr>`;
      Object.entries(users).forEach(([username, data]) => {
        if (username === "admin") return; // لا تظهر للمدير نفسه
        html += `<tr>
        <td style="padding:7px 4px;">${username}</td>
        <td style="padding:7px 4px;">
          <label style="display:inline-flex;align-items:center;gap:6px;">
            <input type="checkbox" ${data.canViewLog ? "checked" : ""
          } onchange="window.setUserLogAccess('${username}', this.checked)">
            <span style="font-size:13px;color:${data.canViewLog ? "#28a745" : "#dc3545"
          };">${data.canViewLog ? "مفعل" : "معطل"}</span>
          </label>
        </td>
        <td style="padding:7px 4px;">
          <select onchange="window.setUserLogType('${username}', this.value)" style="font-size:13px;">
            <option value="all" ${!data.logViewType || data.logViewType === "all" ? "selected" : ""
          }>كل السجل</option>
            <option value="self" ${data.logViewType === "self" ? "selected" : ""
          }>سجل المستخدم فقط</option>
          </select>
        </td>
      </tr>`;
      });
      html += `</table>
      <div style="margin-top:10px;font-size:13px;color:#555;">
        عند تفعيل الصلاحية يظهر زر سجل النشاطات للمستخدم في القائمة الجانبية.<br>
        نوع الصلاحية:<br>
        <b>كل السجل:</b> يرى كل النشاطات لجميع المستخدمين.<br>
        <b>سجل المستخدم فقط:</b> يرى فقط نشاطاته هو.<br>
        عند التعطيل يختفي الزر مباشرة من عند المستخدم.
      </div>`;
      document.getElementById("userLogControlContent").innerHTML = html;
      window.setUserLogAccess = function (username, enabled) {
        db.ref("users/" + username + "/canViewLog")
          .set(enabled)
          .then(() => {
            logActivity(
              "تغيير صلاحية سجل النشاطات",
              `تم ${enabled ? "تفعيل" : "تعطيل"
              } سجل النشاطات للمستخدم: ${username}`
            );
            updateSidebarVisibility();
          });
      };
      window.setUserLogType = function (username, type) {
        db.ref("users/" + username + "/logViewType")
          .set(type)
          .then(() => {
            logActivity(
              "تغيير نوع صلاحية سجل النشاطات",
              `تم تغيير نوع الصلاحية للمستخدم: ${username} إلى: ${type === "all" ? "كل السجل" : "سجل المستخدم فقط"
              }`
            );
            updateSidebarVisibility();
          });
      };
    });
};

(function () {
  const table = document.getElementById('attendanceTable');
  if (!table) return;

  const thead = table.querySelector('thead');
  if (!thead) return;

  // Create wrapper and container
  let wrap = document.createElement('div');
  wrap.className = 'sticky-clone-wrap';
  let container = document.createElement('div');
  container.className = 'sticky-clone-table-container';
  let cloneTable = document.createElement('table');
  cloneTable.className = 'sticky-clone-table';
  container.appendChild(cloneTable);
  wrap.appendChild(container);
  document.body.appendChild(wrap);

  let isVisible = false;

  function buildClone() {
    // We'll build an absolutely-positioned header row that mirrors the visible header cells
    container.innerHTML = '';
    const row = document.createElement('div');
    row.className = 'sticky-clone-row';
    container.appendChild(row);
    // create placeholder cells; skip the date column (id='dateHeaderTh') so it won't appear in the fixed header
    const origAllThs = Array.from(thead.querySelectorAll('th'));
    const origThs = origAllThs.filter(th => th.id !== 'dateHeaderTh');
    origThs.forEach((th) => {
      const cell = document.createElement('div');
      cell.className = 'sticky-clone-cell';
      // copy the inner HTML so any icons or multi-line content is preserved
      cell.innerHTML = th.innerHTML;
      // If header is plain text (no child elements), insert a line break after the first word
      // so names like "محمد علاء" render as two lines on small screens.
      try {
        if (th.children.length === 0) {
          const txt = th.textContent.trim();
          if (txt.indexOf(' ') !== -1) {
            const parts = txt.split(/\s+/);
            // keep first word on first line, the rest on second line
            const first = parts.shift();
            const rest = parts.join(' ');
            cell.innerHTML = first + '<br>' + rest;
          }
        }
      } catch (e) { /* fail silently if any node is unexpected */ }
      if (th.getAttribute('dir')) cell.setAttribute('dir', th.getAttribute('dir'));
      row.appendChild(cell);
    });
    syncSizes();
  }

  function syncSizes() {
    const rect = table.getBoundingClientRect();
    // position wrap and set width to match table
    wrap.style.left = rect.left + 'px';
    wrap.style.width = rect.width + 'px';
    container.style.width = '100%';

    const row = container.querySelector('.sticky-clone-row');
    if (!row) return;
    // set row height same as original thead
    const theadRect = thead.getBoundingClientRect();
    row.style.height = theadRect.height + 'px';

    const origAllThs = Array.from(thead.querySelectorAll('th'));
    const origThs = origAllThs.filter(th => th.id !== 'dateHeaderTh');
    const cloneCells = row.querySelectorAll('.sticky-clone-cell');
    origThs.forEach((th, i) => {
      const thRect = th.getBoundingClientRect();
      const left = thRect.left - rect.left;
      const w = thRect.width;
      if (cloneCells[i]) {
        const cs = cloneCells[i];
        cs.style.left = left + 'px';
        cs.style.width = w + 'px';
        // make header slightly smaller than original for compact look
        const isCompact = wrap.classList.contains('compact');
        const headerH = isCompact ? Math.max(30, theadRect.height - 12) : Math.max(36, theadRect.height - 6);
        cs.style.height = headerH + 'px';
        // copy computed styles for visual parity
        const s = window.getComputedStyle(th);
        cs.style.background = s.backgroundColor || th.style.background || '';
        cs.style.color = s.color || th.style.color || '';
        cs.style.fontWeight = s.fontWeight || th.style.fontWeight || '';
        cs.style.fontSize = s.fontSize || th.style.fontSize || '';
        cs.style.paddingLeft = s.paddingLeft;
        cs.style.paddingRight = s.paddingRight;
      }
    });
  }

  function updateVisibility() {
    const rect = table.getBoundingClientRect();
    const show = rect.top < 0 && rect.bottom > 40; // show when table scrolled past top
    if (show && !isVisible) { wrap.classList.add('visible'); isVisible = true; }
    else if (!show && isVisible) { wrap.classList.remove('visible'); wrap.classList.remove('compact'); isVisible = false; }
    // compact mode when scrolled further down for less visual footprint
    const compactThreshold = 260; // px scrolled past table top
    if (rect.top < -compactThreshold) { wrap.classList.add('compact'); } else { wrap.classList.remove('compact'); }
  }

  // Build initially in case header already present
  buildClone(); updateVisibility();

  // Observe changes to thead (employees list may be added dynamically)
  const mo = new MutationObserver(() => { buildClone(); updateVisibility(); });
  mo.observe(thead, { childList: true, subtree: true, characterData: true });

  // Keep in sync on resize / scroll / table changes
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { syncSizes(); updateVisibility(); }, 120); });
  window.addEventListener('scroll', () => { syncSizes(); updateVisibility(); }, { passive: true });

  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => { syncSizes(); updateVisibility(); });
    ro.observe(table);
  }

  // close on print
  if (window.matchMedia) {
    try { window.matchMedia('print').addListener(() => wrap.classList.remove('visible')); } catch (e) { }
  }

  // expose for debugging if needed
  window._stickyHeaderClone = { rebuild: buildClone, sync: syncSizes };
})();

// Fill footer version info from global APP_VERSION and wire Instagram handle
try {
  const app = (window.getAppVersion && window.getAppVersion()) || window.APP_VERSION || {};
  const v = app.version || '—';
  const u = app.updated || '—';
  const fv = document.getElementById('footerVersion'); if (fv) fv.textContent = v;
  const fu = document.getElementById('footerUpdated'); if (fu) fu.textContent = u;
  // set avatar initials from founder name
  const fnEl = document.getElementById('founderName');
  const fn = fnEl ? fnEl.textContent.trim() : 'سجاد رشيد';
  const initials = fn.split(/\s+/).map(s => s[0] || '').slice(0, 2).join('');
  const avatar = document.getElementById('founderAvatar'); if (avatar) avatar.textContent = initials;
  // Instagram: read handle from a data attribute if present, fallback to example
  const igBtn = document.getElementById('founderInstagram');
  const igHandle = (document.getElementById('founderContact') && document.getElementById('founderContact').textContent.trim()) || 'e._mg';
  if (igBtn) {
    igBtn.href = 'https://instagram.com/' + igHandle.replace(/^@/, '');
    igBtn.setAttribute('aria-label', 'تابع ' + fn + ' على إنستغرام');
  }
} catch (e) { console && console.warn && console.warn('footer init error', e); }

// Load persisted founder/app/footer info from DB or localStorage so edits survive page reload
try {
  const applyFounder = (v) => {
    try {
      const fnEl = document.getElementById('founderName'); if (fnEl && v.name) fnEl.textContent = v.name;
      const bioEl = document.getElementById('founderBio'); if (bioEl && v.bio) bioEl.textContent = v.bio;
      let contactEl = document.getElementById('founderContact');
      if (!contactEl) { contactEl = document.createElement('div'); contactEl.id = 'founderContact'; contactEl.style.display = 'none'; document.body.appendChild(contactEl); }
      contactEl.textContent = v.instagram || '';
      const igBtn = document.getElementById('founderInstagram'); if (igBtn && v.instagram) igBtn.href = 'https://instagram.com/' + (v.instagram || '').replace(/^@/, '');
      const avatarEl = document.getElementById('founderAvatar');
      if (avatarEl) {
        // prefer storing avatar as background so we can control positioning
        if (v.avatar) {
          avatarEl.innerHTML = '';
          avatarEl.style.backgroundImage = 'url("' + v.avatar + '")';
          avatarEl.style.backgroundSize = 'cover';
          const ox = v.avatarOffset && typeof v.avatarOffset.x !== 'undefined' ? v.avatarOffset.x : 50;
          const oy = v.avatarOffset && typeof v.avatarOffset.y !== 'undefined' ? v.avatarOffset.y : 50;
          avatarEl.style.backgroundPosition = ox + '% ' + oy + '%';
        } else if (v.name) {
          avatarEl.style.backgroundImage = '';
          avatarEl.textContent = v.name.split(/\s+/).map(s => s[0] || '').slice(0, 2).join('');
        }
      }
    } catch (e) { }
  };

  const applyApp = (a) => {
    try {
      const fv = document.getElementById('footerVersion');
      const fu = document.getElementById('footerUpdated');
      // if a provides values, apply them; otherwise set sensible defaults (requested)
      if (fv) {
        if (a && a.version) fv.textContent = ('v' + String(a.version).replace(/^v/i, ''));
        else if (!fv.textContent || fv.textContent === 'v?') fv.textContent = 'v2.8';
      }
      if (fu) {
        if (a && a.updated) fu.textContent = a.updated;
        else if (!fu.textContent || fu.textContent === '—') fu.textContent = '2025-10-31';
      }
      // apply avatar size if provided
      try {
        if (a && a.avatarSize) {
          const aboutEl = document.querySelector('#aboutUs.pro');
          if (aboutEl && aboutEl.style) aboutEl.style.setProperty('--founder-avatar-size', String(a.avatarSize) + 'px');
          const av = document.getElementById('founderAvatar');
          if (av) { av.style.width = String(a.avatarSize) + 'px'; av.style.height = String(a.avatarSize) + 'px'; av.style.fontSize = (a.avatarSize / 3.2) + 'px'; }
        }
      } catch (e) { }
      // render features if provided
      if (a && Array.isArray(a.features)) {
        const featuresContainer = document.querySelector('#aboutUs .features');
        if (featuresContainer) {
          featuresContainer.innerHTML = '';
          a.features.forEach(f => { const d = document.createElement('div'); d.className = 'feature'; d.textContent = f; featuresContainer.appendChild(d); });
        }
      }
    } catch (e) { }
  };

  const applyFooter = (f) => { try { const fc = document.getElementById('footerCredit'); if (fc && f.credit) fc.textContent = f.credit; } catch (e) { } };

  if (typeof db !== 'undefined' && db && typeof db.ref === 'function') {
    db.ref('settings/founder').once('value').then(snap => { const v = snap.val(); if (v) applyFounder(v); }).catch(() => { });
    db.ref('settings/app').once('value').then(snap => { const a = snap.val(); if (a) applyApp(a); }).catch(() => { });
    db.ref('settings/footer').once('value').then(snap => { const f = snap.val(); if (f) applyFooter(f); }).catch(() => { });
  }

  // fallback to localStorage if present
  try {
    const lf = localStorage.getItem('settings_founder'); if (lf) { const v = JSON.parse(lf); applyFounder(v); }
    const la = localStorage.getItem('settings_app'); if (la) { const a = JSON.parse(la); applyApp(a); }
    const lfc = localStorage.getItem('settings_footer'); if (lfc) { const f = JSON.parse(lfc); applyFooter(f); }
  } catch (e) { }
} catch (e) { }

// Wire the admin-panel About Us editor
(function () {
  const panelBtn = document.getElementById('aboutPanelEditBtn');
  const modal = document.getElementById('aboutPanelEditModal');
  const nameIn = document.getElementById('aboutEditName');
  const bioIn = document.getElementById('aboutEditBio');
  const igIn = document.getElementById('aboutEditIg');
  const saveBtn = document.getElementById('aboutEditSave');
  const cancelBtn = document.getElementById('aboutEditCancel');
  const versionIn = document.getElementById('aboutEditVersion');
  const updatedIn = document.getElementById('aboutEditUpdated');
  const footerCreditIn = document.getElementById('aboutEditFooterCredit');
  const avatarUrlIn = document.getElementById('aboutEditAvatarUrl');
  const avatarFileIn = document.getElementById('aboutEditAvatarFile');
  const avatarPreview = document.getElementById('avatarPreview');
  const avatarSizeIn = document.getElementById('aboutEditAvatarSize');
  const avatarSizeVal = document.getElementById('aboutEditAvatarSizeVal');
  
  // Audio configuration elements
  const audioFileIn = document.getElementById('aboutEditAudioFile');
  const audioFileBtn = document.getElementById('aboutEditAudioFileBtn');
  const audioFileName = document.getElementById('aboutEditAudioFileName');
  const audioUrlIn = document.getElementById('aboutEditAudioUrl');
  let _audioDataURL = null;

  // hold a selected avatar dataURL (from file) so saveChanges can persist it
  let _avatarDataURL = null;
  // avatar offset in percent (0..100) for background-position
  let _avatarOffset = { x: 50, y: 50 };

  function openEditor() {
    // populate from current DOM
    const fn = document.getElementById('founderName');
    const fb = document.getElementById('founderBio');
    const igBtn = document.getElementById('founderInstagram');
    nameIn.value = fn ? fn.textContent.trim() : '';
    bioIn.value = fb ? fb.textContent.trim() : '';
    let handle = '';
    const contactEl = document.getElementById('founderContact');
    if (contactEl) handle = contactEl.textContent.trim();
    else if (igBtn && igBtn.href) try { handle = igBtn.href.split('instagram.com/')[1].replace(/\/+$/, '') } catch (e) { }
    igIn.value = handle || '';
    // app version / updated
    try {
      const fv = document.getElementById('footerVersion');
      const fu = document.getElementById('footerUpdated');
      versionIn.value = (fv && fv.textContent && fv.textContent !== 'v?') ? fv.textContent.replace(/^v/i, '') : ((window.APP_VERSION && window.APP_VERSION.version) || '');
      // try to interpret footerUpdated if present
      if (fu && fu.textContent && fu.textContent !== '—') {
        // if it's in YYYY-MM-DD (from input) keep it; otherwise leave blank
        const d = fu.textContent.trim();
        // naive check for ISO-like
        if (/\d{4}-\d{2}-\d{2}/.test(d)) updatedIn.value = d;
        else updatedIn.value = '';
      } else {
        updatedIn.value = (window.APP_VERSION && window.APP_VERSION.updated) ? window.APP_VERSION.updated.split('T')[0] : '';
      }
    } catch (e) { }
    // footer credit
    try { const fc = document.getElementById('footerCredit'); footerCreditIn.value = fc ? fc.textContent.trim() : ''; } catch (e) { }
    // avatar: show existing image if any
    try {
      _avatarDataURL = null;
      const avatarEl = document.getElementById('founderAvatar');
      let currentAvatarSrc = null;
      if (avatarEl) {
        const bg = avatarEl.style && avatarEl.style.backgroundImage;
        if (bg && bg.indexOf('url(') >= 0) {
          currentAvatarSrc = bg.replace(/^url\(["']?|["']?\)$/g, '').replace(/^url\(|\)$/g, '').replace(/^["']|["']$/g, '');
        } else {
          const img = avatarEl.querySelector && avatarEl.querySelector('img');
          if (img && img.src) currentAvatarSrc = img.src;
        }
      }
      
      if (currentAvatarSrc) {
        renderAvatarPreview(currentAvatarSrc);
      } else {
        // else show initials
        const initials = avatarEl ? avatarEl.textContent.trim() : '';
        renderAvatarPreview(null, initials);
      }
      avatarUrlIn.value = '';
      avatarFileIn.value = null;
      // populate avatar size input and preview
      try {
        let size = 88;
        if (window.APP_VERSION && window.APP_VERSION.avatarSize) size = parseInt(window.APP_VERSION.avatarSize, 10) || size;
        // fallback to existing avatar element size
        const avEl = document.getElementById('founderAvatar');
        if (avEl && avEl.getBoundingClientRect) { size = Math.round(avEl.getBoundingClientRect().width) || size; }
        if (avatarSizeIn) avatarSizeIn.value = size;
        if (avatarSizeVal) avatarSizeVal.textContent = size + 'px';
        if (avatarPreview) { avatarPreview.style.width = size + 'px'; avatarPreview.style.height = size + 'px'; }
      } catch (e) { }
      // populate features textarea from existing chips
      try {
        const featuresContainer = document.querySelector('#aboutUs .features');
        const featTa = document.getElementById('aboutEditFeatures');
        if (featuresContainer && featTa) {
          const items = Array.from(featuresContainer.querySelectorAll('.feature')).map(el => el.textContent.trim()).filter(Boolean);
          featTa.value = items.join('\n');
        }
      } catch (e) { }
      
      // Dynamic on-demand loading of developer audio for the editor
      (async function() {
        if (audioFileName) audioFileName.textContent = 'جاري تحميل بيانات الصوت...';
        _audioDataURL = null;
        if (audioUrlIn) audioUrlIn.value = '';
        if (audioFileIn) audioFileIn.value = '';

        let audioData = null;
        if (typeof db !== 'undefined' && db && typeof db.ref === 'function') {
          try {
            const snap = await db.ref('settings/founder_audio').once('value');
            audioData = snap.val();
          } catch (e) { }
        } else {
          try {
            audioData = localStorage.getItem('settings_founder_audio');
          } catch (e) { }
        }

        if (audioData) {
          if (audioData.startsWith('data:')) {
            _audioDataURL = audioData;
            if (audioFileName) audioFileName.textContent = 'ملف صوتي محلي مخزن';
            if (audioUrlIn) audioUrlIn.value = '';
          } else {
            _audioDataURL = null;
            if (audioUrlIn) audioUrlIn.value = audioData;
            if (audioFileName) audioFileName.textContent = 'لا يوجد ملف صوتي محلي';
          }
        } else {
          _audioDataURL = null;
          if (audioUrlIn) audioUrlIn.value = '';
          if (audioFileName) audioFileName.textContent = 'لا يوجد ملف صوتي محلي';
        }
      })();

    } catch (e) { }
    modal.style.display = 'flex';
  }

  function _applyBackgroundToElement(el, src, offset) {
    if (!el) return;
    if (src) {
      el.innerHTML = '';
      el.style.backgroundImage = 'url("' + src + '")';
      el.style.backgroundSize = 'cover';
      const ox = offset && typeof offset.x !== 'undefined' ? offset.x : 50;
      const oy = offset && typeof offset.y !== 'undefined' ? offset.y : 50;
      el.style.backgroundPosition = ox + '% ' + oy + '%';
    } else {
      // remove background and show initials
      el.style.backgroundImage = '';
      el.innerHTML = '';
    }
  }

  function renderAvatarPreview(src, initials) {
    // Render using background-image so we can control background-position (drag)
    if (src) {
      _applyBackgroundToElement(avatarPreview, src, _avatarOffset);
      avatarPreview.style.cursor = 'grab';
    } else {
      avatarPreview.style.backgroundImage = '';
      avatarPreview.innerHTML = '';
      const span = document.createElement('div');
      span.style.fontWeight = '800';
      // make initials font-size proportional to avatar size if available
      try {
        const sz = (avatarSizeIn && avatarSizeIn.value) ? parseInt(avatarSizeIn.value, 10) : 88;
        span.style.fontSize = (sz / 3.2) + 'px';
      } catch (e) { span.style.fontSize = '28px'; }
      span.style.color = '#082233';
      span.textContent = initials || '';
      avatarPreview.appendChild(span);
      avatarPreview.style.cursor = 'default';
    }
    // Also update the real footer avatar preview if present
    try { const fv = document.getElementById('founderAvatar'); if (fv) { if (src) _applyBackgroundToElement(fv, src, _avatarOffset); else fv.textContent = initials || ''; } } catch (e) { }
  }

  // file input preview handling
  if (avatarFileIn) {
    avatarFileIn.addEventListener('change', function () {
      const f = this.files && this.files[0];
      if (!f) return;
      const fr = new FileReader();
      fr.onload = function (ev) { _avatarDataURL = ev.target.result; renderAvatarPreview(_avatarDataURL); };
      fr.readAsDataURL(f);
    });
  }
  // allow pasting a URL and preview
  if (avatarUrlIn) {
    avatarUrlIn.addEventListener('change', function () { _avatarDataURL = null; renderAvatarPreview(this.value || null); });
  }

  // developer audio input handlers
  if (audioFileBtn && audioFileIn) {
    audioFileBtn.addEventListener('click', function () { audioFileIn.click(); });
  }
  if (audioFileIn) {
    audioFileIn.addEventListener('change', function () {
      const f = this.files && this.files[0];
      if (!f) return;
      if (f.size > 800 * 1024) {
        alert('حجم ملف الصوت يجب أن يكون أقل من 800 كيلوبايت لضمان سرعة أداء النظام.');
        this.value = '';
        return;
      }
      if (audioFileName) audioFileName.textContent = 'جاري قراءة الملف...';
      const fr = new FileReader();
      fr.onload = function (ev) {
        _audioDataURL = ev.target.result;
        if (audioFileName) audioFileName.textContent = f.name + ' (' + Math.round(f.size / 1024) + 'KB)';
        if (audioUrlIn) audioUrlIn.value = '';
      };
      fr.onerror = function () {
        alert('فشلت قراءة ملف الصوت.');
        if (audioFileName) audioFileName.textContent = 'خطأ في قراءة الملف';
      };
      fr.readAsDataURL(f);
    });
  }
  if (audioUrlIn) {
    audioUrlIn.addEventListener('change', function () {
      if (this.value.trim()) {
        _audioDataURL = null;
        if (audioFileName) audioFileName.textContent = 'لا يوجد ملف صوتي محلي';
        if (audioFileIn) audioFileIn.value = '';
      }
    });
  }

  // avatar size slider handling
  if (avatarSizeIn) {
    avatarSizeIn.addEventListener('input', function () {
      const v = parseInt(this.value, 10) || 88;
      if (avatarSizeVal) avatarSizeVal.textContent = v + 'px';
      if (avatarPreview) { avatarPreview.style.width = v + 'px'; avatarPreview.style.height = v + 'px'; }
      const av = document.getElementById('founderAvatar'); if (av) { av.style.width = v + 'px'; av.style.height = v + 'px'; av.style.fontSize = (v / 3.2) + 'px'; }
    });
  }

  // Drag-to-position for avatarPreview (mouse + touch)
  (function () {
    let dragging = false, startX = 0, startY = 0, startOffset = { x: 50, y: 50 };
    function toPercentDelta(dx, dy, el) {
      const w = el.clientWidth || 1; const h = el.clientHeight || 1;
      return { dx: (dx / w) * 100, dy: (dy / h) * 100 };
    }
    function clamp(v) { return Math.max(0, Math.min(100, v)); }

    avatarPreview.addEventListener('mousedown', function (e) {
      if (!avatarPreview.style.backgroundImage) return;
      dragging = true; avatarPreview.style.cursor = 'grabbing';
      startX = e.clientX; startY = e.clientY; startOffset = { x: _avatarOffset.x, y: _avatarOffset.y };
      e.preventDefault();
    });
    document.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      const delta = toPercentDelta(e.clientX - startX, e.clientY - startY, avatarPreview);
      _avatarOffset.x = clamp(startOffset.x + delta.dx);
      _avatarOffset.y = clamp(startOffset.y + delta.dy);
      // apply to preview and footer
      try { _applyBackgroundToElement(avatarPreview, (_avatarDataURL || (avatarUrlIn && avatarUrlIn.value)) || (document.getElementById('founderAvatar') && (document.getElementById('founderAvatar').style.backgroundImage ? document.getElementById('founderAvatar').style.backgroundImage.replace(/^url\(["']?|["']?\)$/g, '') : null)), _avatarOffset); } catch (e) { }
      try { const fv = document.getElementById('founderAvatar'); if (fv) fv.style.backgroundPosition = _avatarOffset.x + '% ' + _avatarOffset.y + '%'; } catch (e) { }
    });
    document.addEventListener('mouseup', function () { if (dragging) { dragging = false; avatarPreview.style.cursor = 'grab'; } });

    // touch support
    avatarPreview.addEventListener('touchstart', function (e) {
      const t = e.touches && e.touches[0]; if (!t) return;
      if (!avatarPreview.style.backgroundImage) return;
      dragging = true; startX = t.clientX; startY = t.clientY; startOffset = { x: _avatarOffset.x, y: _avatarOffset.y };
    });
    avatarPreview.addEventListener('touchmove', function (e) { if (!dragging) return; const t = e.touches && e.touches[0]; if (!t) return; const delta = toPercentDelta(t.clientX - startX, t.clientY - startY, avatarPreview); _avatarOffset.x = clamp(startOffset.x + delta.dx); _avatarOffset.y = clamp(startOffset.y + delta.dy); try { _applyBackgroundToElement(avatarPreview, (_avatarDataURL || (avatarUrlIn && avatarUrlIn.value)) || (document.getElementById('founderAvatar') && (document.getElementById('founderAvatar').style.backgroundImage ? document.getElementById('founderAvatar').style.backgroundImage.replace(/^url\(["']?|["']?\)$/g, '') : null)), _avatarOffset); } catch (e) { }; try { const fv = document.getElementById('founderAvatar'); if (fv) fv.style.backgroundPosition = _avatarOffset.x + '% ' + _avatarOffset.y + '%'; } catch (e) { }; e.preventDefault(); });
    avatarPreview.addEventListener('touchend', function () { dragging = false; });
  })();

  function closeEditor() { modal.style.display = 'none'; }

  async function saveChanges() {
    const newName = nameIn.value.trim();
    const newBio = bioIn.value.trim();
    const newIg = igIn.value.trim().replace(/^@/, '');
    let _featuresLines = [];
    if (!newName) { alert('الرجاء إدخال اسم المؤسس'); return; }
    // update DOM
    const fnEl = document.getElementById('founderName'); if (fnEl) fnEl.textContent = newName;
    const bioEl = document.getElementById('founderBio'); if (bioEl) bioEl.textContent = newBio;
    // avatar: prefer avatarDataURL, else provided URL, else initials
    const avatarEl = document.getElementById('founderAvatar');
    const useUrl = avatarUrlIn && avatarUrlIn.value && avatarUrlIn.value.trim();
    const avatarToUse = _avatarDataURL || (useUrl ? avatarUrlIn.value.trim() : null);
    if (avatarEl) {
      avatarEl.innerHTML = '';
      if (avatarToUse) {
        const img = document.createElement('img'); img.src = avatarToUse; img.style.width = '100%'; img.style.height = '100%'; img.style.objectFit = 'cover'; avatarEl.appendChild(img);
      } else {
        const initials = newName.split(/\s+/).map(s => s[0] || '').slice(0, 2).join(''); avatarEl.textContent = initials;
      }
    }
    // ensure hidden contact element exists
    let contactEl = document.getElementById('founderContact');
    if (!contactEl) { contactEl = document.createElement('div'); contactEl.id = 'founderContact'; contactEl.style.display = 'none'; document.body.appendChild(contactEl); }
    contactEl.textContent = newIg || '';
    const igBtn = document.getElementById('founderInstagram'); if (igBtn) igBtn.href = 'https://instagram.com/' + (newIg || '').replace(/^@/, '');

    // version / updated / footer credit updates
    try {
      // normalize version (strip leading v) and update display with a single 'v' prefix
      const rawVer = (versionIn && versionIn.value) ? versionIn.value.trim() : '';
      const newVer = rawVer.replace(/^v/i, '');
      const newUpd = (updatedIn && updatedIn.value) ? updatedIn.value : '';
      const fv = document.getElementById('footerVersion'); if (fv) fv.textContent = newVer ? ('v' + newVer) : '—';
      const fu = document.getElementById('footerUpdated'); if (fu) fu.textContent = newUpd || '—';
      const fcEl = document.getElementById('footerCredit'); if (fcEl && footerCreditIn) fcEl.textContent = footerCreditIn.value || fcEl.textContent;
      // ensure avatar element uses chosen size
      try {
        const avSize = (avatarSizeIn && avatarSizeIn.value) ? parseInt(avatarSizeIn.value, 10) : null;
        const avEl = document.getElementById('founderAvatar');
        if (avEl && avSize) { avEl.style.width = avSize + 'px'; avEl.style.height = avSize + 'px'; avEl.style.fontSize = (avSize / 3.2) + 'px'; }
      } catch (e) { }
    } catch (e) { }

    // features: read textarea lines and update chips (store into _featuresLines to persist later)
    try {
      const featEl = document.getElementById('aboutEditFeatures');
      if (featEl) {
        _featuresLines = featEl.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        const featuresContainer = document.querySelector('#aboutUs .features');
        if (featuresContainer) {
          featuresContainer.innerHTML = '';
          _featuresLines.forEach(f => { const d = document.createElement('div'); d.className = 'feature'; d.textContent = f; featuresContainer.appendChild(d); });
        }
      }
    } catch (e) { }

    // persist if db available, otherwise fallback to localStorage
    try {
      const founderPayload = { name: newName, bio: newBio, instagram: newIg };
      // determine avatar to persist: prefer newly uploaded dataURL, else provided URL,
      // else preserve existing background-image src if any
      let finalAvatarSrc = null;
      if (_avatarDataURL) finalAvatarSrc = _avatarDataURL;
      else if (avatarUrlIn && avatarUrlIn.value) finalAvatarSrc = avatarUrlIn.value.trim();
      else {
        // try to read existing founderAvatar background-image or img src
        try {
          const avEl = document.getElementById('founderAvatar');
          if (avEl) {
            const bg = avEl.style && avEl.style.backgroundImage;
            if (bg && bg.indexOf('url(') >= 0) { finalAvatarSrc = bg.replace(/^url\(["']?|["']?\)$/g, '').replace(/^url\(|\)$/g, '').replace(/^["']|["']$/g, ''); }
            else {
              const im = avEl.querySelector && avEl.querySelector('img');
              if (im && im.src) finalAvatarSrc = im.src;
            }
          }
        } catch (e) { }
      }
      if (finalAvatarSrc) founderPayload.avatar = finalAvatarSrc;
      // persist avatar offset as percent if available
      try { if (_avatarOffset && typeof _avatarOffset.x !== 'undefined') founderPayload.avatarOffset = { x: Math.round(_avatarOffset.x), y: Math.round(_avatarOffset.y) }; } catch (e) { }
      // store normalized version (without 'v') and avatar size
      const appPayload = { version: (versionIn && versionIn.value) ? versionIn.value.trim().replace(/^v/i, '') : '', updated: (updatedIn && updatedIn.value) ? updatedIn.value : '' };
      try { if (avatarSizeIn && avatarSizeIn.value) appPayload.avatarSize = parseInt(avatarSizeIn.value, 10); } catch (e) { }
      // attach features collected earlier (if any)
      try { if (Array.isArray(_featuresLines) && _featuresLines.length > 0) appPayload.features = _featuresLines; } catch (e) { }
      const footerPayload = { credit: (footerCreditIn && footerCreditIn.value) ? footerCreditIn.value : '' };
      
      let finalAudioValue = '';
      if (_audioDataURL) {
        finalAudioValue = _audioDataURL;
      } else if (audioUrlIn && audioUrlIn.value.trim()) {
        finalAudioValue = audioUrlIn.value.trim();
      }

      if (typeof db !== 'undefined' && db && typeof db.ref === 'function') {
        // write founder and app settings
        await db.ref('settings/founder').set(founderPayload).catch(() => { });
        await db.ref('settings/app').set(appPayload).catch(() => { });
        await db.ref('settings/footer').set(footerPayload).catch(() => { });
        await db.ref('settings/founder_audio').set(finalAudioValue).catch(() => { });
      } else {
        try { localStorage.setItem('settings_founder', JSON.stringify(founderPayload)); } catch (e) { }
        try { localStorage.setItem('settings_app', JSON.stringify(appPayload)); } catch (e) { }
        try { localStorage.setItem('settings_footer', JSON.stringify(footerPayload)); } catch (e) { }
        try {
          if (finalAudioValue) {
            localStorage.setItem('settings_founder_audio', finalAudioValue);
          } else {
            localStorage.removeItem('settings_founder_audio');
          }
        } catch (e) { }
      }
    } catch (e) { console && console.warn && console.warn('Persist founder failed', e); }

    closeEditor();
    // feedback
    try { const t = document.createElement('div'); t.textContent = '✅ تم حفظ التغييرات'; t.style.position = 'fixed'; t.style.bottom = '18px'; t.style.right = '18px'; t.style.background = '#2e7d32'; t.style.color = '#fff'; t.style.padding = '8px 12px'; t.style.borderRadius = '8px'; t.style.zIndex = '16000'; document.body.appendChild(t); setTimeout(() => t.remove(), 1600); } catch (e) { }
  }

  // show inline button only for admin role; keep panelBtn hidden (it still has the click handler)
  try {
    const inlineBtn = document.getElementById('aboutPanelEditInline');
    const isAdmin = (typeof currentUserRole !== 'undefined' && currentUserRole === 'admin');
    if (inlineBtn) inlineBtn.style.display = isAdmin ? 'flex' : 'none';
    if (panelBtn) panelBtn.style.display = 'none';
    // wire inline button to open the editor directly
    if (inlineBtn) inlineBtn.addEventListener('click', openEditor);
  } catch (e) { }

  if (panelBtn) panelBtn.addEventListener('click', openEditor);
  if (cancelBtn) cancelBtn.addEventListener('click', closeEditor);
  if (saveBtn) saveBtn.addEventListener('click', saveChanges);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal && modal.style.display === 'flex') closeEditor(); });
})();

// Founder Avatar Music Playback Controller (On-demand Fetching)
(function () {
  let activeAudio = null;
  let playTimeout = null;
  let isPlaying = false;
  let isFetching = false;

  const avatarEl = document.getElementById('founderAvatar');
  if (!avatarEl) return;

  // Make avatar pointer-events friendly and add title
  avatarEl.style.cursor = 'pointer';
  avatarEl.title = 'اضغط لتشغيل موسيقى المطور (30 ثانية)';

  async function fetchAudioData() {
    if (typeof db !== 'undefined' && db && typeof db.ref === 'function') {
      try {
        const snap = await db.ref('settings/founder_audio').once('value');
        return snap.val();
      } catch (e) {
        console.warn('Failed to fetch founder audio from database', e);
        return null;
      }
    } else {
      try {
        return localStorage.getItem('settings_founder_audio');
      } catch (e) {
        return null;
      }
    }
  }

  function stopMusic() {
    if (activeAudio) {
      try {
        activeAudio.pause();
        activeAudio.currentTime = 0;
      } catch (e) {}
    }
    if (playTimeout) {
      clearTimeout(playTimeout);
      playTimeout = null;
    }
    isPlaying = false;
    avatarEl.classList.remove('playing-music');
  }

  async function playMusic() {
    if (isFetching) return;
    isFetching = true;
    
    // Show a loading state on the avatar (e.g. slight opacity)
    avatarEl.style.opacity = '0.6';
    
    const audioData = await fetchAudioData();
    avatarEl.style.opacity = '1';
    isFetching = false;

    if (!audioData) {
      showToast('⚠️ لم يتم رفع أو تكوين ملف صوتي للمطور بعد.', '#e65100');
      return;
    }

    try {
      activeAudio = new Audio(audioData);
      activeAudio.volume = 0.8;
      
      activeAudio.addEventListener('canplaythrough', () => {
        if (isPlaying) return; // Prevent double trigger
        activeAudio.play().then(() => {
          isPlaying = true;
          avatarEl.classList.add('playing-music');
          
          // Setup 30 seconds limit
          playTimeout = setTimeout(() => {
            stopMusic();
            showToast('🎵 انتهت 30 ثانية من الموسيقى', '#311b92');
          }, 30000);
        }).catch(err => {
          console.error('Playback failed', err);
          showToast('❌ فشل تشغيل الصوت. قد يكون الرابط غير صالح أو المتصفح يمنع التشغيل التلقائي.', '#b71c1c');
          stopMusic();
        });
      });

      activeAudio.addEventListener('error', (e) => {
        console.error('Audio element error', e);
        showToast('❌ خطأ في تحميل ملف الصوت. يرجى التحقق من الرابط أو الملف.', '#b71c1c');
        stopMusic();
      });

    } catch (e) {
      console.error('Audio initialization failed', e);
      showToast('❌ فشل تشغيل ملف الصوت.', '#b71c1c');
      stopMusic();
    }
  }

  avatarEl.addEventListener('click', function (e) {
    e.stopPropagation();
    if (isPlaying) {
      stopMusic();
    } else {
      playMusic();
    }
  });

  function showToast(message, bgColor) {
    const isAdmin = (typeof currentUserRole !== 'undefined' && currentUserRole === 'admin');
    if (!isAdmin) return;

    try {
      const t = document.createElement('div');
      t.textContent = message;
      t.style.position = 'fixed';
      t.style.bottom = '18px';
      t.style.right = '18px';
      t.style.background = bgColor || '#333';
      t.style.color = '#fff';
      t.style.padding = '10px 16px';
      t.style.borderRadius = '8px';
      t.style.zIndex = '16000';
      t.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
      t.style.fontFamily = 'Tajawal, sans-serif';
      t.style.fontSize = '14px';
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 2500);
    } catch (e) {}
  }
})();

(function () {
  'use strict';

  // متغيرات عامة
  let telegramSettings = {
    botToken: '',
    chatId: '',
    autoBackupHours: 48
  };
  let autoBackupInterval = null;
  let lastBackupTime = null;

  // تحميل الإعدادات من Firebase أو localStorage
  async function loadTelegramSettings() {
    try {
      if (typeof db !== 'undefined' && db) {
        const snap = await db.ref('settings/telegram').once('value');
        const saved = snap.val();
        if (saved) {
          telegramSettings = { ...telegramSettings, ...saved };
        }
      } else {
        const saved = localStorage.getItem('telegramSettings');
        if (saved) {
          telegramSettings = { ...telegramSettings, ...JSON.parse(saved) };
        }
      }

      // تحديث واجهة المستخدم
      const tokenInput = document.getElementById('telegramBotToken');
      const chatIdInput = document.getElementById('telegramChatId');
      const hoursInput = document.getElementById('telegramAutoBackupHours');

      if (tokenInput) tokenInput.value = telegramSettings.botToken || '';
      if (chatIdInput) chatIdInput.value = telegramSettings.chatId || '';
      if (hoursInput) hoursInput.value = telegramSettings.autoBackupHours || 48;

      // restore last backup time if present (DB or localStorage)
      try {
        const savedLast = (telegramSettings && telegramSettings.lastBackup) || localStorage.getItem('telegramLastBackup');
        if (savedLast) {
          lastBackupTime = parseInt(savedLast, 10);
          telegramSettings.lastBackup = lastBackupTime;
        }
      } catch (e) { }

      // set toggle state from settings
      try {
        const toggle = document.getElementById('telegramAutoBackupToggle');
        if (toggle) toggle.checked = !!telegramSettings.autoBackupEnabled;
      } catch (e) { }

      // تفعيل النسخ التلقائي إذا كانت الإعدادات موجودة
      if (telegramSettings.botToken && telegramSettings.chatId) {
        if (telegramSettings.autoBackupEnabled) startAutoBackup();
        else updateTelegramNextBackupDisplay();
      }
    } catch (error) {
      console.error('خطأ في تحميل إعدادات تيليجرام:', error);
    }
  }

  // حفظ الإعدادات (مع قراءة حالة التبديل وإظهار إخطار سريع)
  async function saveTelegramSettings() {
    try {
      const tokenInput = document.getElementById('telegramBotToken');
      const chatIdInput = document.getElementById('telegramChatId');
      const hoursInput = document.getElementById('telegramAutoBackupHours');
      const toggleEl = document.getElementById('telegramAutoBackupToggle');

      if (!tokenInput || !chatIdInput || !hoursInput || !toggleEl) return;

      telegramSettings.botToken = tokenInput.value.trim();
      telegramSettings.chatId = chatIdInput.value.trim();
      telegramSettings.autoBackupHours = parseInt(hoursInput.value) || 48;
      telegramSettings.autoBackupEnabled = !!toggleEl.checked;

      if (!telegramSettings.botToken || !telegramSettings.chatId) {
        showToast('❌ يرجى إدخال Bot Token و Chat ID', 'error');
        return;
      }

      // حفظ في Firebase أو localStorage
      if (typeof db !== 'undefined' && db) {
        await db.ref('settings/telegram').set(telegramSettings);
      } else {
        localStorage.setItem('telegramSettings', JSON.stringify(telegramSettings));
      }

      updateTelegramStatus('✅ تم حفظ الإعدادات بنجاح', 'success');
      showToast('تم حفظ إعدادات تيليجرام', 'success');

      // تشغيل/إيقاف النسخ التلقائي حسب الحالة
      if (telegramSettings.autoBackupEnabled) {
        startAutoBackup();
      } else {
        stopAutoBackup();
      }
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات:', error);
      updateTelegramStatus('❌ حدث خطأ في حفظ الإعدادات', 'error');
      showToast('حدث خطأ أثناء حفظ الإعدادات', 'error');
    }
  }

  // تحديث حالة تيليجرام
  function updateTelegramStatus(message, type = 'info') {
    const statusEl = document.getElementById('telegramStatus');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.style.color = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#666';
      setTimeout(() => {
        if (statusEl.textContent === message) {
          statusEl.textContent = '';
        }
      }, 5000);
    }
  }

  // اختبار الاتصال بتيليجرام (تحسين الإخراج)
  async function testTelegramConnection() {
    try {
      const tokenInput = document.getElementById('telegramBotToken');
      const chatIdInput = document.getElementById('telegramChatId');

      if (!tokenInput || !chatIdInput) return;

      const token = tokenInput.value.trim();
      const chatId = chatIdInput.value.trim();

      if (!token || !chatId) {
        showToast('❌ يرجى إدخال Bot Token و Chat ID أولاً', 'error');
        return;
      }

      updateTelegramStatus('🔄 جاري اختبار الاتصال...', 'info');

      // إرسال رسالة اختبار
      const testMessage = '🧪 هذا اختبار للاتصال بتيليجرام من نظام الحضور\n✅ إذا وصلت هذه الرسالة، فالاتصال يعمل بنجاح.';

      const success = await sendTelegramMessage(token, chatId, testMessage);

      if (success) {
        updateTelegramStatus('✅ تم الاتصال بنجاح! تحقق من تيليجرام', 'success');
        showToast('✅ تم الاتصال بنجاح!', 'success');
      } else {
        updateTelegramStatus('❌ فشل الاتصال. تحقق من Token و Chat ID', 'error');
        showToast('❌ فشل الاتصال. تحقق من Token و Chat ID', 'error');
      }
    } catch (error) {
      console.error('خطأ في اختبار الاتصال:', error);
      updateTelegramStatus('❌ حدث خطأ: ' + error.message, 'error');
      showToast('❌ حدث خطأ أثناء اختبار الاتصال', 'error');
    }
  }

  // إرسال رسالة إلى تيليجرام
  async function sendTelegramMessage(token, chatId, message) {
    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });

      const data = await response.json();
      return data.ok === true;
    } catch (error) {
      console.error('خطأ في إرسال الرسالة:', error);
      return false;
    }
  }

  // إرسال ملف PDF إلى تيليجرام
  async function sendPDFToTelegram(pdfBlob, filename) {
    try {
      if (!telegramSettings.botToken || !telegramSettings.chatId) {
        alert('❌ يرجى إعداد تيليجرام أولاً من لوحة التحكم');
        return false;
      }

      // تحويل Blob إلى File
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });

      // إرسال الملف عبر FormData
      const formData = new FormData();
      formData.append('document', file);
      formData.append('chat_id', telegramSettings.chatId);
      formData.append('caption', `📄 ${filename}\n📅 ${new Date().toLocaleDateString('ar-EG')}\n⏰ ${new Date().toLocaleTimeString('ar-EG')}`);

      const url = `https://api.telegram.org/bot${telegramSettings.botToken}/sendDocument`;

      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.ok) {
        return true;
      } else {
        console.error('خطأ من تيليجرام:', data);
        return false;
      }
    } catch (error) {
      console.error('خطأ في إرسال PDF:', error);
      return false;
    }
  }

  // إنشاء PDF من جدول الحضور والإحصائيات
  async function generateAttendancePDF() {
    try {
      // تحميل مكتبات PDF إن لم تكن محملة
      await loadPDFLibraries();

      if (typeof window.jspdf === 'undefined' || typeof html2canvas === 'undefined') {
        alert('❌ فشل تحميل المكتبات المطلوبة');
        return null;
      }

      const { jsPDF } = window.jspdf;

      // استخدام الجدول الفعلي من الصفحة مباشرة
      const attendanceTable = document.getElementById('attendanceTable');
      const mainContent = document.getElementById('mainContent');
      const empStatsDiv = document.getElementById('empStatsBelowTable');
      const statsBox = document.getElementById('statsBox');

      if (!attendanceTable || !mainContent) {
        alert('❌ الجدول غير موجود. يرجى التأكد من تحميل الصفحة بشكل كامل');
        return null;
      }

      // إنشاء container للطباعة
      const printContainer = document.createElement('div');
      printContainer.style.position = 'absolute';
      printContainer.style.left = '-9999px';
      printContainer.style.top = '0px';
      printContainer.style.width = '210mm';
      printContainer.style.backgroundColor = '#fff';
      printContainer.style.padding = '20px';
      printContainer.style.direction = 'rtl';
      printContainer.style.fontFamily = "'Tajawal', sans-serif";
      printContainer.style.fontSize = '14px';
      document.body.appendChild(printContainer);

      // نسخ العنوان
      const title = mainContent.querySelector('h2');
      if (title) {
        const titleClone = title.cloneNode(true);
        titleClone.style.marginTop = '0';
        titleClone.style.marginBottom = '20px';
        titleClone.style.fontFamily = "'Tajawal', sans-serif";
        printContainer.appendChild(titleClone);
      }

      // نسخ الجدول مع جميع الأنماط
      const tableClone = attendanceTable.cloneNode(true);
      tableClone.style.width = '100%';
      tableClone.style.marginBottom = '30px';
      tableClone.style.borderCollapse = 'collapse';
      tableClone.style.fontFamily = "'Tajawal', sans-serif";

      // إظهار رأس التاريخ إذا كان مخفياً
      const dateHeader = tableClone.querySelector('#dateHeaderTh');
      if (dateHeader) {
        dateHeader.style.display = 'table-cell';
      }

      // تحويل جميع select elements إلى نص قبل النسخ
      const allSelects = tableClone.querySelectorAll('select');
      allSelects.forEach(select => {
        // مهم جداً: استخراج القيمة من الجدول الأصلي لأن cloneNode لا ينسخ قيمة الـ select الحالية
        const originalSelect = attendanceTable.querySelector(`#${select.id}`);
        const selectedValue = originalSelect ? originalSelect.value : '';
        
        const parent = select.parentElement;
        if (parent) {
          // الحصول على لون الخلفية والخط من الخلية الأصلية
          const originalCell = originalSelect ? originalSelect.parentElement : null;
          const bgColor = originalCell ? window.getComputedStyle(originalCell).backgroundColor : '';
          const textColor = originalCell ? window.getComputedStyle(originalCell).color : '';

          // إنشاء span يحتوي على القيمة
          const span = document.createElement('span');
          span.textContent = selectedValue;
          span.style.display = 'block';
          span.style.width = '100%';
          span.style.height = '100%';
          span.style.textAlign = 'center';
          span.style.padding = '8px 4px';
          span.style.fontSize = '14px';
          span.style.fontWeight = '700';
          span.style.fontFamily = "'Tajawal', sans-serif";

          // تطبيق الألوان التعريفية
          if (selectedValue === 'شفت') {
            span.style.background = '#d4edda';
            span.style.color = '#155724';
          } else if (selectedValue === 'نص') {
            span.style.background = '#fff9db';
            span.style.color = '#856404';
          } else if (selectedValue === '❌') {
            span.style.background = '#ffe3e3';
            span.style.color = '#d32f2f';
          } else {
            span.style.background = bgColor || '#fdfdfd';
            span.style.color = textColor || '#333';
          }

          parent.replaceChild(span, select);
        }
      });

      // التأكد من أن جميع th elements مرئية ومتساوية العرض
      const allThs = tableClone.querySelectorAll('thead th');
      allThs.forEach(th => {
        th.style.display = 'table-cell';
        th.style.visibility = 'visible';
        th.style.opacity = '1';
        th.style.textAlign = 'center';
        th.style.verticalAlign = 'middle';
        th.style.padding = '10px 5px';
        th.style.whiteSpace = 'nowrap';
        th.style.fontSize = '12px';
        th.style.fontWeight = 'bold';
        th.style.fontFamily = "'Tajawal', sans-serif";
        th.style.letterSpacing = 'normal'; // هام جداً للنصوص العربية
      });

      // التأكد من أن جميع td elements مرئية
      const allTds = tableClone.querySelectorAll('tbody td');
      allTds.forEach(td => {
        td.style.display = 'table-cell';
        td.style.visibility = 'visible';
        td.style.opacity = '1';
        td.style.borderRadius = '0';
        td.style.padding = '5px';
        td.style.textAlign = 'center';
        td.style.verticalAlign = 'middle';
        td.style.fontFamily = "'Tajawal', sans-serif";
        td.style.letterSpacing = 'normal';

        // التأكد من أن المحتوى مرئي
        const span = td.querySelector('span');
        if (span) {
          span.style.display = 'block';
          span.style.visibility = 'visible';
          span.style.opacity = '1';
          span.style.fontFamily = "'Tajawal', sans-serif";
          span.style.letterSpacing = 'normal';
        }
      });

      printContainer.appendChild(tableClone);

      // نسخ الإحصائيات إذا كانت موجودة
      if (statsBox && statsBox.innerHTML && statsBox.innerHTML !== '—') {
        const statsTitle = document.createElement('h3');
        statsTitle.textContent = '📊 الإحصائيات';
        statsTitle.style.marginTop = '20px';
        statsTitle.style.marginBottom = '10px';
        printContainer.appendChild(statsTitle);

        const statsClone = statsBox.cloneNode(true);
        printContainer.appendChild(statsClone);
      }

      // نسخ جدول إحصائيات الموظفين إذا كان موجوداً
      if (empStatsDiv && empStatsDiv.innerHTML.trim()) {
        const empStatsClone = empStatsDiv.cloneNode(true);
        empStatsClone.style.marginTop = '20px';
        printContainer.appendChild(empStatsClone);
      }

      // إضافة معلومات إضافية (فوتر احترافي)
      const footer = document.createElement('div');
      footer.style.marginTop = '40px';
      footer.style.paddingTop = '15px';
      footer.style.borderTop = '1px dashed #bbb';
      footer.style.textAlign = 'center';
      footer.style.fontSize = '12px';
      footer.style.color = '#444';
      footer.style.fontFamily = "'Tajawal', sans-serif";
      footer.innerHTML = `
          <div style="margin-bottom: 8px; font-weight: 700; color: #1a73e8;">
            تم إنشاء التقرير بواسطة: ${currentUser || 'admin'} | وقت الإنشاء: ${formatDateTimeNoSeconds(new Date())}
          </div>
          <div style="font-size: 11px; color: #777; font-weight: 500;">
            تم إنشاء النظام بواسطة المهندس سجاد 🛠️
          </div>
      `;
      printContainer.appendChild(footer);

      // انتظار قليل لضمان تحميل جميع العناصر والخطوط
      await new Promise(resolve => setTimeout(resolve, 1000));

      // تحديث واجهة التقدم
      try { updatePdfProgress(35, ' معالجة الصفحات', 'جاري تنظيم الهوامش والبيانات...'); } catch (e) { }

      // إعدادات مقاسات A4 بالبكسل (تقريبي لـ 96dpi)
      const a4HeightPx = 880; // تقليل الارتفاع لتفادي قطع الصفوف في ذيل الصفحة
      const rows = Array.from(tableClone.querySelectorAll('tbody tr'));
      const theadClone = tableClone.querySelector('thead').cloneNode(true);
      
      const pages = [];
      let currentRows = [];
      let currentHeight = 200; 

      rows.forEach((row, index) => {
        const rowHeight = 42; 
        if (currentHeight + rowHeight > a4HeightPx) {
          pages.push(currentRows);
          currentRows = [row];
          currentHeight = 150 + rowHeight;
        } else {
          currentRows.push(row);
          currentHeight += rowHeight;
        }
        if (index === rows.length - 1) pages.push(currentRows);
      });

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
      const imgWidth = 210;

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) doc.addPage();
        
        const pageContainer = document.createElement('div');
        pageContainer.style.width = '210mm';
        pageContainer.style.minHeight = '297mm';
        pageContainer.style.padding = '25mm 15mm'; // هوامش احترافية
        pageContainer.style.backgroundColor = '#fff';
        pageContainer.style.direction = 'rtl';
        pageContainer.style.fontFamily = "'Tajawal', sans-serif";
        pageContainer.style.boxSizing = 'border-box';
        
        const pageHeader = document.createElement('div');
        pageHeader.style.marginBottom = '20px';
        pageHeader.style.borderBottom = '1px solid #eee';
        pageHeader.style.paddingBottom = '10px';
        pageHeader.innerHTML = `<h2 style="margin:0;font-size:16px;">${title ? title.textContent : 'تقرير الحضور'}</h2>
                                 <p style="margin:5px 0 0 0;font-size:11px;color:#888;">صفحة ${i + 1} من ${pages.length}</p>`;
        pageContainer.appendChild(pageHeader);

        const pageTable = document.createElement('table');
        pageTable.style.width = '100%';
        pageTable.style.borderCollapse = 'collapse';
        pageTable.appendChild(theadClone.cloneNode(true));
        
        const pageTbody = document.createElement('tbody');
        pages[i].forEach(r => pageTbody.appendChild(r.cloneNode(true)));
        pageTable.appendChild(pageTbody);
        pageContainer.appendChild(pageTable);

        document.body.appendChild(pageContainer);
        const canvas = await html2canvas(pageContainer, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png', 0.95);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
        document.body.removeChild(pageContainer);
      }

      // --- صفحة إضافية مخصصة للإحصائيات والرواتب لضمان عدم القص ---
      if ((statsBox && statsBox.innerHTML && statsBox.innerHTML !== '—') || (empStatsDiv && empStatsDiv.innerHTML.trim())) {
        doc.addPage();
        const finalPage = document.createElement('div');
        finalPage.style.width = '210mm';
        finalPage.style.padding = '25mm 15mm';
        finalPage.style.backgroundColor = '#fff';
        finalPage.style.direction = 'rtl';
        finalPage.style.fontFamily = "'Tajawal', sans-serif";

        const finalHeader = document.createElement('div');
        finalHeader.style.marginBottom = '20px';
        finalHeader.style.borderBottom = '2px solid #1a73e8';
        finalHeader.style.paddingBottom = '10px';
        finalHeader.innerHTML = `<h2 style="margin:0;font-size:18px;color:#1a73e8;">💰 التقرير المالي والإحصائي</h2>
                                 <p style="margin:5px 0 0 0;font-size:11px;color:#666;">تفاصيل الرواتب والسلف المستحقة لهذا الشهر</p>`;
        finalPage.appendChild(finalHeader);

        if (statsBox) {
          const sTitle = document.createElement('h3');
          sTitle.textContent = '📊 ملخص الشهر';
          sTitle.style.fontSize = '15px';
          sTitle.style.marginTop = '10px';
          finalPage.appendChild(sTitle);
          finalPage.appendChild(statsBox.cloneNode(true));
        }

        if (empStatsDiv) {
          const eTitle = document.createElement('h3');
          eTitle.textContent = '👥 تفاصيل الموظفين والرواتب';
          eTitle.style.fontSize = '15px';
          eTitle.style.marginTop = '25px';
          finalPage.appendChild(eTitle);
          
          const eClone = empStatsDiv.cloneNode(true);
          eClone.querySelectorAll('table').forEach(t => {
            t.style.width = '100%';
            t.style.borderCollapse = 'collapse';
            t.style.fontSize = '10px';
          });
          finalPage.appendChild(eClone);
        }

        if (footer) finalPage.appendChild(footer.cloneNode(true));

        document.body.appendChild(finalPage);
        const canvasFinal = await html2canvas(finalPage, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgDataFinal = canvasFinal.toDataURL('image/png', 0.95);
        const imgHeightFinal = (canvasFinal.height * imgWidth) / canvasFinal.width;
        doc.addImage(imgDataFinal, 'PNG', 0, 0, imgWidth, imgHeightFinal, undefined, 'FAST');
        document.body.removeChild(finalPage);
      }

      if (printContainer && printContainer.parentNode) document.body.removeChild(printContainer);
      return doc.output('blob');
    } catch (error) {
      console.error('خطأ في إنشاء PDF:', error);
      alert('❌ حدث خطأ في إنشاء PDF: ' + error.message);
      return null;
    }
  }

  // دالة مساعدة للحصول على معدلات الراتب
  function getRatesForEmployee(emp, y, m, salaries) {
    const monthKey = `${y}_${String(m + 1).padStart(2, '0')}`;
    if (salaries.months && salaries.months[monthKey]) {
      const mn = salaries.months[monthKey];
      if (mn.overrides && mn.overrides[emp]) {
        return { shift: Number(mn.overrides[emp].shift || 0), half: Number(mn.overrides[emp].half || 0) };
      }
      if (mn.default) {
        return { shift: Number(mn.default.shift || 0), half: Number(mn.default.half || 0) };
      }
    }
    if (salaries.overrides && salaries.overrides[emp]) {
      return { shift: Number(salaries.overrides[emp].shift || 0), half: Number(salaries.overrides[emp].half || 0) };
    }
    if (salaries.default) {
      return { shift: Number(salaries.default.shift || 22000), half: Number(salaries.default.half || 11000) };
    }
    return { shift: 22000, half: 11000 };
  }

  // طباعة وإرسال PDF
  async function printAndSendPDF() {
    try {
      // تحميل مكتبات PDF قبل الاستخدام
      await loadPDFLibraries();

      if (!telegramSettings.botToken || !telegramSettings.chatId) {
        alert('❌ يرجى إعداد تيليجرام أولاً من لوحة التحكم (Admin Panel)');
        return;
      }
      // Show PDF overlay progress
      startPdfProgress();

      // إنشاء PDF
      updatePdfProgress(20, ' تحضير الهيكل...', 'جاري إعداد قالب التقرير وتجهيز البيانات اللازمة من الواجهة...');
      const pdfBlob = await generateAttendancePDF();
      if (!pdfBlob) {
        completePdfProgress(false, '❌ فشل إنشاء PDF');
        return;
      }

      updatePdfProgress(85, ' جاري الإرسال...', 'يتم الآن الاتصال بخوادم تيليجرام ورفع التقرير النهائي...');

      // إرسال إلى تيليجرام
      const arabicMonths = [
        "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
        "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
      ];
      const monthName = arabicMonths[month] || `شهر_${month + 1}`;
      const now = new Date();
      const timeStr = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}_${String(now.getDate()).padStart(2, '0')}_(${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')})`;
      const filename = `تقرير_حضور_${monthName}_${year}_بتاريخ_${timeStr}.pdf`;
      const sent = await sendPDFToTelegram(pdfBlob, filename);

      if (sent) {
        completePdfProgress(true, '✅ تم إرسال PDF بنجاح');
        showMessage('✅ تم إرسال PDF بنجاح إلى تيليجرام');

        // تحديث وقت آخر نسخة احتياطية
        lastBackupTime = Date.now();
        // persist in settings (DB or localStorage)
        if (typeof db !== 'undefined' && db) {
          await db.ref('settings/telegram/lastBackup').set(lastBackupTime);
        } else {
          localStorage.setItem('telegramLastBackup', lastBackupTime.toString());
        }

        // keep in-memory settings and persist full telegramSettings so scheduler can restore
        try {
          telegramSettings.lastBackup = lastBackupTime;
          await persistTelegramSettings();
          try { updateTelegramNextBackupDisplay(); } catch (e) { }
          showToast('✅ تم إنشاء وإرسال النسخة الاحتياطية', 'success');
        } catch (e) { console.warn('Could not persist telegramSettings.lastBackup', e); }



        // تسجيل في سجل النشاطات
        if (typeof logActivity === 'function') {
          logActivity('إرسال PDF إلى تيليجرام', `تم إرسال تقرير PDF بنجاح: ${filename}`);
        }
      } else {
        completePdfProgress(false, '❌ فشل إرسال PDF');
        showMessage('❌ فشل إرسال PDF إلى تيليجرام. تحقق من الإعدادات', true);
      }
    } catch (error) {
      console.error('خطأ في طباعة وإرسال PDF:', error);
      completePdfProgress(false, '❌ حدث خطأ: ' + (error.message || 'غير معروف'));
      showMessage('❌ حدث خطأ: ' + error.message, true);
    }
  }

  // بدء النسخ التلقائي (جدولة محسنة مع تسحيل الوقت)
  function startAutoBackup() {
    // clear previous timer
    try { if (autoBackupInterval) { clearTimeout(autoBackupInterval); autoBackupInterval = null; } } catch (e) { }

    // إذا كانت النسخ التلقائي معطلة، لا تقم بالجدولة
    if (!telegramSettings.autoBackupEnabled) {
      console.log('🔕 النسخ التلقائي معطل');
      try { updateTelegramNextBackupDisplay(); } catch (e) { }
      return;
    }

    if (!telegramSettings.botToken || !telegramSettings.chatId) {
      return;
    }

    const hours = Math.max(1, (parseInt(telegramSettings.autoBackupHours, 10) || 48));
    const msWindow = hours * 60 * 60 * 1000;

    // compute next run based on lastBackupTime (persisted) so scheduler survives reloads
    const now = Date.now();
    let nextRunAt = (telegramSettings && telegramSettings.lastBackup) ? (telegramSettings.lastBackup + msWindow) : (lastBackupTime ? (lastBackupTime + msWindow) : (now + msWindow));

    let waitMs = nextRunAt - now;
    if (isNaN(waitMs) || waitMs <= 0) {
      // if overdue or invalid, run soon (1s)
      waitMs = 1000;
    }

    autoBackupInterval = setTimeout(async function autoBackupRunner() {
      try {
        console.log('🔁 فحص قفل النسخ التلقائي قبل التنفيذ...');
        let canProceed = true;
        
        // التحقق من أن لا أحد غيرنا يقوم بالنسخ حالياً (قفل في قاعدة البيانات)
        if (typeof db !== 'undefined' && db && db.ref) {
          const lockRef = db.ref('settings/telegram/backupLock');
          const lockSnap = await lockRef.once('value');
          const lastLockTime = parseInt(lockSnap.val() || 0, 10);
          
          // إذا كان هنالك عملية نسخ حدثت خلال آخر 3 دقائق، يتم إلغاء التنفيذ الحالي لمنع التكرار
          if (Date.now() - lastLockTime < 180000) {
            console.log('⛔ النسخ قيد التنفيذ حالياً من قبل متصفح آخر أو تم تواً. سيتم المتابعة لاحقاً.');
            canProceed = false;
          } else {
            // تسجيل وقتنا كقفل جديد للآخرين
            await lockRef.set(Date.now());
          }
        }
        
        if (canProceed) {
          console.log('🔁 تنفيذ النسخ التلقائي الآن');
          await printAndSendPDF();
        }
      } catch (err) { console.error('خطأ في النسخ التلقائي:', err); }
      
      try {
        // after running (or attempt), schedule next based on updated lastBackup
        const after = Date.now();
        telegramSettings.lastBackup = after;
        await persistTelegramSettings();
      } catch (e) { console.warn('Could not persist lastBackup after auto run', e); }
      
      // schedule next
      startAutoBackup();
    }, waitMs);

    console.log(`✅ تم تفعيل النسخ التلقائي، سيتم التنفيذ بعد ${Math.round(waitMs / 1000)} ثانية (تقريباً ${hours} ساعة)`);
    // update next backup hint
    try { updateTelegramNextBackupDisplay(); } catch (e) { }
  }

  // عرض مساعد: وقت قريب/بعيد بالنسبة للزمن
  function relativeTimeFromNow(ts) {
    try {
      const diff = Math.floor((ts - Date.now()) / 1000);
      if (isNaN(diff)) return '';
      const adiff = Math.abs(diff);
      if (adiff < 60) return diff > 0 ? `بعد ${adiff} ثانية` : `منذ ${adiff} ثانية`;
      const mins = Math.floor(adiff / 60); if (mins < 60) return diff > 0 ? `بعد ${mins} دقيقة` : `منذ ${mins} دقيقة`;
      const hrs = Math.floor(mins / 60); if (hrs < 24) return diff > 0 ? `بعد ${hrs} ساعة` : `منذ ${hrs} ساعة`;
      const days = Math.floor(hrs / 24); return diff > 0 ? `بعد ${days} يوم` : `منذ ${days} يوم`;
    } catch (e) { return ''; }
  }

  // show small toasts
  function showToast(message, type = 'info', timeout = 3800) {
    try {
      let wrap = document.querySelector('.toast-wrap');
      if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
      const t = document.createElement('div'); t.className = 'toast ' + (type || 'info'); t.textContent = message; wrap.appendChild(t);
      // trigger show
      setTimeout(() => t.classList.add('toast-show'), 10);
      setTimeout(() => { t.classList.remove('toast-show'); setTimeout(() => t.remove(), 200); }, timeout);
    } catch (e) { console.warn('toast error', e); }
  }

  // تحديث عرض موعد النسخة التالي (نص تاريج ووقت نسبي)
  function updateTelegramNextBackupDisplay() {
    try {
      const el = document.getElementById('telegramNextBackup'); if (!el) return;
      const rel = document.getElementById('telegramNextBackupRelative');
      const enabled = !!telegramSettings.autoBackupEnabled;
      const hrs = parseInt(telegramSettings.autoBackupHours, 10) || 0;
      const last = parseInt(telegramSettings.lastBackup || lastBackupTime || 0, 10) || 0;
      if (!enabled || !hrs || !last) { el.textContent = 'النسخة المجدولة: -'; if (rel) rel.textContent = ''; return; }
      const next = last + hrs * 3600 * 1000;
      const d = new Date(next);
      el.textContent = 'النسخة المجدولة: ' + d.toLocaleString(); if (rel) rel.textContent = relativeTimeFromNow(next);
    } catch (e) { console.warn('updateTelegramNextBackupDisplay error', e); }
  }

  // refresh next backup display periodically
  setInterval(() => { try { updateTelegramNextBackupDisplay(); } catch (e) { } }, 60000);

  // إيقاف النسخ التلقائي
  function stopAutoBackup() {
    if (autoBackupInterval) {
      clearTimeout(autoBackupInterval);
      autoBackupInterval = null;
      console.log('⏹️ تم إيقاف النسخ التلقائي');
      updateTelegramNextBackupDisplay();
    }
  }

  // ربط الأحداث
  document.addEventListener('DOMContentLoaded', function () {
    // تحميل الإعدادات عند تحميل الصفحة (للمدير فقط)
    setTimeout(() => {
      if (typeof currentUserRole !== 'undefined' && currentUserRole === 'admin') {
        if (typeof loadTelegramSettings === 'function') loadTelegramSettings();
      }
    }, 1000);

    // زر حفظ الإعدادات
    const saveBtn = document.getElementById('saveTelegramSettingsBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', saveTelegramSettings);
    }

    // زر اختبار الاتصال
    const testBtn = document.getElementById('testTelegramBtn');
    if (testBtn) {
      testBtn.addEventListener('click', testTelegramConnection);
    }

    // زر الطباعة والإرسال
    const printBtn = document.getElementById('sidebarPrintTelegramBtn');
    if (printBtn) {
      printBtn.addEventListener('click', function () {
        document.getElementById('sidebarMenu').classList.remove('open');
        printAndSendPDF();
      });
    }

    // ربط تبديل النسخ التلقائي (مباشر)
    const autoToggle = document.getElementById('telegramAutoBackupToggle');
    if (autoToggle) {
      autoToggle.addEventListener('change', async function (e) {
        try {
          telegramSettings.autoBackupEnabled = !!e.target.checked;
          // persist immediately
          if (typeof db !== 'undefined' && db) await db.ref('settings/telegram').set(telegramSettings);
          else localStorage.setItem('telegramSettings', JSON.stringify(telegramSettings));
          if (telegramSettings.autoBackupEnabled) startAutoBackup(); else stopAutoBackup();
          showToast(telegramSettings.autoBackupEnabled ? 'تم تفعيل النسخ التلقائي' : 'تم إيقاف النسخ التلقائي', 'info');
        } catch (err) { console.warn('toggle error', err); }
      });
    }
  });

  // تحديث ظهور زر الطباعة حسب الصلاحيات
  function updatePrintButtonVisibility() {
    const printBtn = document.getElementById('sidebarPrintTelegramBtn');
    if (printBtn) {
      const isAdmin = (typeof currentUserRole !== 'undefined' && currentUserRole === 'admin');
      printBtn.style.display = isAdmin ? 'block' : 'none';
    }
  }

  // دمج مع دالة updateSidebarVisibility الموجودة
  const originalUpdateSidebarVisibility = window.updateSidebarVisibility;
  if (typeof originalUpdateSidebarVisibility === 'function') {
    window.updateSidebarVisibility = function () {
      originalUpdateSidebarVisibility();
      updatePrintButtonVisibility();
    };
  } else {
    // إذا لم تكن موجودة، أنشئ واحدة بسيطة
    window.updateSidebarVisibility = updatePrintButtonVisibility;
  }

  // تحديث فوري
  setTimeout(updatePrintButtonVisibility, 1000);
  setInterval(updatePrintButtonVisibility, 2000);

  // ===== PDF progress helpers =====
  function startPdfProgress() {
    const overlay = document.getElementById('pdfProgressOverlay');
    if (!overlay) return;
    document.getElementById('pdfProgressBar').style.width = '6%';
    document.getElementById('pdfProgressText').textContent = 'جاري التحضير...';
    try {
      const pEl = document.getElementById('pdfProgressPercent');
      if (pEl) pEl.textContent = '6%';
      const icon = document.getElementById('pdfProgressIcon');
      icon.textContent = '';
      icon.classList.add('spin');
      document.getElementById('pdfProgressDetails').textContent = 'يرجى الانتظار، يتم تجميع البيانات الأولية...';
    } catch (e) { }
    document.getElementById('pdfProgressCloseBtn').style.display = 'none';
    overlay.style.display = 'flex';
    try { const printBtn = document.getElementById('sidebarPrintTelegramBtn'); if (printBtn) { printBtn.disabled = true; printBtn.style.opacity = '0.6'; } } catch (e) { }
  }
  function updatePdfProgress(percent, text, detail) {
    const overlay = document.getElementById('pdfProgressOverlay');
    if (!overlay || overlay.style.display === 'none') return;
    const p = Math.min(100, Math.max(0, percent));
    document.getElementById('pdfProgressBar').style.width = p + '%';
    const pEl = document.getElementById('pdfProgressPercent');
    if (pEl) pEl.textContent = Math.round(p) + '%';
    if (text) document.getElementById('pdfProgressText').textContent = text;
    if (detail !== undefined) {
      const detEl = document.getElementById('pdfProgressDetails');
      if (detEl) detEl.textContent = detail;
    }
  }
  function completePdfProgress(success, text, detail) {
    const overlay = document.getElementById('pdfProgressOverlay');
    if (!overlay) return;
    document.getElementById('pdfProgressBar').style.width = success ? '100%' : '100%';
    try {
      const pEl = document.getElementById('pdfProgressPercent');
      if (pEl) pEl.textContent = success ? '100%' : '100%';
      const icon = document.getElementById('pdfProgressIcon');
      icon.classList.remove('spin');
      icon.textContent = success ? '✅' : '❌';
      document.getElementById('pdfProgressText').textContent = text || (success ? 'اكتمل الإرسال' : 'فشل التصدير');
      const detEl = document.getElementById('pdfProgressDetails');
      if (detEl) {
        if (detail !== undefined) {
          detEl.textContent = detail;
        } else {
          detEl.textContent = success ? 'تم رفع التقرير إلى تيليجرام بنجاح.' : 'حدث خطأ أثناء رفع التقرير.';
        }
      }
    } catch (e) { }
    const closeBtn = document.getElementById('pdfProgressCloseBtn');
    closeBtn.style.display = 'inline-block';
    closeBtn.onclick = function () { overlay.style.display = 'none'; };
    try { const printBtn = document.getElementById('sidebarPrintTelegramBtn'); if (printBtn) { printBtn.disabled = false; printBtn.style.opacity = ''; } } catch (e) { }
    // auto-hide after short delay on success
    if (success) { setTimeout(() => { try { overlay.style.display = 'none'; } catch (e) { } }, 2600); }
  }

  // Allow closing overlay with Escape when close button visible
  document.addEventListener('keydown', function (e) { try { const overlay = document.getElementById('pdfProgressOverlay'); const closeBtn = document.getElementById('pdfProgressCloseBtn'); if (!overlay || overlay.style.display === 'none') return; if (e.key === 'Escape' && closeBtn && closeBtn.style.display !== 'none') { overlay.style.display = 'none'; } } catch (e) { } });


})();

(function () {
  const el = document.getElementById('aboutUs');
  function isLoggedIn() {
    try { return !!(window.currentUser || localStorage.getItem('loggedUser')); } catch (e) { return false; }
  }

  // ensure hidden by default (inline style already set) and show only when confirmed
  try {
    if (!el) return;
    el.style.display = isLoggedIn() ? '' : 'none';
  } catch (e) { }

  // keep track of previous state and update only on change to avoid flicker
  let last = isLoggedIn();
  function update() {
    try {
      const cur = isLoggedIn();
      if (cur !== last) {
        last = cur;
        el.style.display = cur ? '' : 'none';
      }
    } catch (e) { }
  }

  // Poll for changes (lightweight) so logout/login reflect immediately
  setInterval(update, 400);

  // Patch localStorage.setItem to react when loggedUser is changed programmatically
  try {
    const origSet = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      origSet.apply(this, arguments);
      if (k === 'loggedUser') update();
    };
  } catch (e) { }

  // Expose manual toggler and listen for custom events
  window.toggleAboutVisibility = function () { try { el.style.display = isLoggedIn() ? '' : 'none'; } catch (e) { } };
  window.addEventListener('user:login', update);
  window.addEventListener('user:logout', update);
})();
// ===== Welcome Screen Live Clock =====
function updateWelcomeClock() {
  const clockEl = document.getElementById('clockText');
  const dateEl = document.getElementById('dateText');
  if (!clockEl) return;
  const now = new Date();

  const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

  clockEl.textContent = now.toLocaleDateString('ar-IQ', dateOptions) + ' - ' + now.toLocaleTimeString('ar-IQ', timeOptions);

  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString('ar-IQ', dateOptions);
  }
}
setInterval(updateWelcomeClock, 1000);
updateWelcomeClock();