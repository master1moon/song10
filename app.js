/**
 * ملف app.js - نظام مزامنة البيانات مع GitHub
 * يتعامل مع إعدادات GitHub، رفع وتحميل البيانات من/إلى Gist
 * يدير Service Worker للعمل بدون اتصال
 * 
 * المشاكل المحتملة:
 * - قد لا يتم تشفير التوكن بشكل صحيح في بعض الحالات
 * - معالجة الأخطاء تحتاج لتحسين (استخدام try/catch فارغ)
 * - لا يوجد تحقق من صلاحية التوكن قبل استخدامه
 * - لا يوجد معالجة لحالة انتهاء صلاحية التوكن
 * - لا يوجد تحقق من حجم البيانات قبل الرفع
 */

// إعدادات GitHub ومزامنة البيانات
// يخزن إعدادات GitHub المطلوبة للمزامنة (التوكن، معرف Gist، اسم الملف، المزامنة التلقائية)
// الكائن يُحمل من التخزين المحلي عند بدء التطبيق
let githubSettings = { token: '', gistId: '', fileName: 'network-cards.json', autoSync: false };

/**
 * تحميل إعدادات GitHub من التخزين المحلي
 * يحاول أولاً تحميل الإعدادات المشفرة، ثم يعود للتحميل العادي إذا فشل
 * يقوم بترحيل البيانات غير المشفرة إلى التشفير إذا كان متاحاً
 */
/**
 * ملاحظة: الدالة loadGithubSettings — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة loadGithubSettings — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
function loadGithubSettings() {
    try {
        // محاولة تحميل الإعدادات المشفرة
        if (window.DataEncryption && window.DataEncryption.loadEncrypted) {
            const encrypted = window.DataEncryption.loadEncrypted('githubSettings');
            if (encrypted) {
                githubSettings = Object.assign(githubSettings, encrypted);
                return;
            }
        }
        
        // التحميل العادي كـ fallback
        const saved = localStorage.getItem('githubSettings');
        if (saved) {
            const parsed = (typeof safeJsonParse === 'function' && typeof FeatureFlags !== 'undefined' && FeatureFlags.isEnabled('safeJsonParse')) ? safeJsonParse(saved, {}) : JSON.parse(saved);
            githubSettings = Object.assign(githubSettings, parsed);
            
            // ترحيل إلى التشفير
            if (window.DataEncryption && window.DataEncryption.saveEncrypted && parsed.token) {
                window.DataEncryption.saveEncrypted('githubSettings', parsed);
            }
        }
    } catch (e) { 
        // تجاهل الأخطاء - يجب تحسين هذا لعرض رسالة للمستخدم
        console.warn('خطأ في تحميل إعدادات GitHub:', e);
    }
}

/**
 * حفظ إعدادات GitHub في التخزين المحلي
 * يحاول الحفظ بشكل مشفر أولاً، ثم يعود للحفظ العادي إذا فشل
 * يعرض إشعاراً بنجاح أو فشل العملية
 */
/**
 * ملاحظة: الدالة saveGithubSettings — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة saveGithubSettings — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
function saveGithubSettings() {
    // حفظ مشفر إذا كان متاحاً
    if (window.DataEncryption && window.DataEncryption.saveEncrypted) {
        const saved = window.DataEncryption.saveEncrypted('githubSettings', githubSettings);
        if (saved) {
            if (typeof showNotification === 'function') {
                showNotification('تم حفظ إعدادات جيت هب بشكل آمن', 'success');
            }
            return;
        }
    }
    
    // الحفظ العادي كـ fallback
    localStorage.setItem('githubSettings', JSON.stringify(githubSettings));
    if (typeof showNotification === 'function') {
        showNotification('تم حفظ إعدادات جيت هب', 'success');
    }
}

/**
 * ملء نموذج إعدادات GitHub بالقيم المحفوظة
 * يتحقق من وجود جميع عناصر النموذج قبل تعبئتها
 */
/**
 * ملاحظة: الدالة populateGithubModal — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة populateGithubModal — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
function populateGithubModal() {
    const tokenEl = document.getElementById('githubToken');
    const gistIdEl = document.getElementById('githubGistId');
    const fileNameEl = document.getElementById('githubFileName');
    const autoSyncEl = document.getElementById('githubAutoSync');
    if (!tokenEl || !gistIdEl || !fileNameEl || !autoSyncEl) return;
    tokenEl.value = githubSettings.token || '';
    gistIdEl.value = githubSettings.gistId || '';
    fileNameEl.value = githubSettings.fileName || 'network-cards.json';
    autoSyncEl.checked = !!githubSettings.autoSync;
}

/**
 * إنشاء Gist جديد على GitHub
 * يتطلب وجود التوكن، ويقوم بإنشاء Gist خاص يحتوي على بيانات التطبيق
 * يحفظ معرف Gist الناتج في الإعدادات
 * @returns {Promise<void>}
 */
/**
 * ملاحظة: الدالة githubCreateGist — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
async function githubCreateGist() {
    if (!githubSettings.token) {
        if (typeof showNotification === 'function') showNotification('يرجى إدخال التوكن أولاً', 'error');
        return;
    }
    const headers = {
        'Authorization': `Bearer ${githubSettings.token}`,
        'Accept': 'application/vnd.github+json'
    };
    const body = {
        description: 'Network Cards App Data',
        public: false,
        files: {
            [githubSettings.fileName || 'network-cards.json']: { content: JSON.stringify((typeof data !== 'undefined') ? data : {}) }
        }
    };
    const res = await fetch('https://api.github.com/gists', { method: 'POST', headers, body: JSON.stringify(body) });
    if (!res.ok) {
        if (typeof showNotification === 'function') showNotification('فشل إنشاء الـ Gist', 'error');
        return;
    }
    const json = await res.json();
    githubSettings.gistId = json.id;
    saveGithubSettings();
    populateGithubModal();
    if (typeof showNotification === 'function') showNotification('تم إنشاء Gist جديد وحفظ المعرف', 'success');
}

/**
 * رفع البيانات الحالية إلى Gist موجود على GitHub
 * يتطلب وجود التوكن ومعرف Gist
 * يستخدم PATCH لتحديث محتوى الملف في Gist
 * @returns {Promise<void>}
 */
/**
 * ملاحظة: الدالة githubUploadData — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
async function githubUploadData() {
    if (!githubSettings.token || !githubSettings.gistId) {
        if (typeof showNotification === 'function') showNotification('يجب إدخال التوكن و Gist ID أولاً', 'error');
        return;
    }
    const headers = {
        'Authorization': `Bearer ${githubSettings.token}`,
        'Accept': 'application/vnd.github+json'
    };
    const body = {
        files: {
            [githubSettings.fileName || 'network-cards.json']: { content: JSON.stringify((typeof data !== 'undefined') ? data : {}) }
        }
    };
    const res = await fetch(`https://api.github.com/gists/${githubSettings.gistId}`, { method: 'PATCH', headers, body: JSON.stringify(body) });
    if (!res.ok) {
        if (typeof showNotification === 'function') showNotification('فشل رفع البيانات إلى جيت هب', 'error');
        return;
    }
    try { localStorage.setItem('lastSyncTime', (typeof moment!=='undefined' ? moment().format('YYYY-MM-DD HH:mm') : new Date().toISOString().slice(0,16).replace('T',' '))); } catch(_){ }
    if (typeof showNotification === 'function') showNotification('تم رفع البيانات إلى جيت هب بنجاح', 'success');
}

/**
 * تحميل البيانات من Gist على GitHub
 * يتطلب معرف Gist (التوكن اختياري للـ Gist العام)
 * يقوم بتحليل البيانات وتحديث جميع الجداول والتقارير
 * @returns {Promise<void>}
 */
/**
 * ملاحظة: الدالة githubDownloadData — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
async function githubDownloadData() {
    if (!githubSettings.gistId) {
        if (typeof showNotification === 'function') showNotification('يرجى إدخال Gist ID أولاً', 'error');
        return;
    }
    const headers = { 'Accept': 'application/vnd.github+json' };
    if (githubSettings.token) headers['Authorization'] = `Bearer ${githubSettings.token}`;
    const metaRes = await fetch(`https://api.github.com/gists/${githubSettings.gistId}`, { headers });
    if (!metaRes.ok) {
        if (typeof FeatureFlags !== 'undefined' && FeatureFlags.isEnabled('enhancedGithubErrors')) {
            const msg = `تعذر الوصول إلى الـ Gist (HTTP ${metaRes.status})`;
            if (typeof showNotification === 'function') showNotification(msg, 'error');
        } else {
            if (typeof showNotification === 'function') showNotification('تعذر الوصول إلى الـ Gist', 'error');
        }
        return;
    }
    const meta = await metaRes.json();
    const fileName = githubSettings.fileName || 'network-cards.json';
    const fileObj = meta.files[fileName] || Object.values(meta.files)[0];
    if (!fileObj || !fileObj.raw_url) {
        if (typeof showNotification === 'function') showNotification('الملف المطلوب غير موجود في الـ Gist', 'error');
        return;
    }
    const rawRes = await fetch(fileObj.raw_url);
    if (!rawRes.ok) {
        if (typeof FeatureFlags !== 'undefined' && FeatureFlags.isEnabled('enhancedGithubErrors')) {
            const msg = `تعذر تنزيل محتوى الملف (HTTP ${rawRes.status})`;
            if (typeof showNotification === 'function') showNotification(msg, 'error');
        } else {
            if (typeof showNotification === 'function') showNotification('تعذر تنزيل محتوى الملف', 'error');
        }
        return;
    }
    const text = await rawRes.text();
    try {
        const parsed = (typeof safeJsonParse === 'function' && typeof FeatureFlags !== 'undefined' && FeatureFlags.isEnabled('safeJsonParse')) ? safeJsonParse(text, {}) : JSON.parse(text);
        if (typeof data !== 'undefined') { data = parsed; } else { window.data = parsed; }
        localStorage.setItem('networkCardsData', JSON.stringify(parsed));
        try { localStorage.setItem('lastSyncTime', (typeof moment!=='undefined' ? moment().format('YYYY-MM-DD HH:mm') : new Date().toISOString().slice(0,16).replace('T',' '))); } catch(_){ }
        if (typeof updateDashboard === 'function') updateDashboard();
        if (typeof renderPackagesTable === 'function') renderPackagesTable();
        if (typeof renderInventoryTable === 'function') renderInventoryTable();
        if (typeof renderStoresList === 'function') renderStoresList();
        if (typeof renderExpensesTable === 'function') renderExpensesTable();
        if (typeof updateReportStores === 'function') updateReportStores();
        if (typeof updateProfitReport === 'function') updateProfitReport();
        if (typeof generateDebtReport === 'function') generateDebtReport();
        if (typeof showNotification === 'function') showNotification('تم تحميل البيانات من جيت هب وتحديث الواجهة', 'success');
    } catch (e) {
        if (typeof showNotification === 'function') showNotification('صيغة بيانات غير صحيحة', 'error');
    }
}

// واجهة مزامنة عامة للاستخدام من الإعدادات
if (typeof window !== 'undefined') {
  window.GithubSync = {
    getSettings() {
      try { return Object.assign({}, githubSettings); } catch(_) { return {}; }
    },
    setSettings(updates) {
      try { githubSettings = Object.assign(githubSettings, updates || {}); return true; } catch(_) { return false; }
    },
    save() { try { saveGithubSettings(); return true; } catch(_) { return false; } },
    load() { try { loadGithubSettings(); return true; } catch(_) { return false; } },
    async createGist() { try { await githubCreateGist(); return true; } catch(_) { return false; } },
    async upload() { try { await githubUploadData(); return true; } catch(_) { return false; } },
    async download() { try { await githubDownloadData(); return true; } catch(_) { return false; } },
    async testConnection() {
      try {
        if (!githubSettings.gistId) {
          return { ok: false, message: 'Gist ID غير مضبوط' };
        }
        const headers = { 'Accept': 'application/vnd.github+json' };
        if (githubSettings.token) headers['Authorization'] = `Bearer ${githubSettings.token}`;
        const res = await fetch(`https://api.github.com/gists/${githubSettings.gistId}`, { headers });
        if (!res.ok) {
          return { ok: false, status: res.status, message: 'تعذر الوصول إلى الـ Gist' };
        }
        const meta = await res.json();
        const fileName = githubSettings.fileName || 'network-cards.json';
        const exists = !!(meta && meta.files && (meta.files[fileName] || Object.values(meta.files||{})[0]));
        return { ok: true, hasFile: exists, message: exists ? 'الاتصال ناجح والملف موجود' : 'الاتصال ناجح لكن الملف غير موجود' };
      } catch (e) {
        return { ok: false, message: 'فشل الاختبار: تحقق من الشبكة أو الإعدادات' };
      }
    }
  };
}

/**
 * معالج حدث تحميل الصفحة
 * يقوم بتحميل إعدادات GitHub وإضافة مستمعي الأحداث للأزرار
 */
document.addEventListener('DOMContentLoaded', () => {
    loadGithubSettings();
    const modalEl = document.getElementById('githubSyncModal');
    if (modalEl) {
        modalEl.addEventListener('show.bs.modal', populateGithubModal);
    }
    const saveBtn = document.getElementById('githubSaveSettingsBtn');
    if (saveBtn) saveBtn.addEventListener('click', () => {
        githubSettings.token = document.getElementById('githubToken').value.trim();
        githubSettings.gistId = document.getElementById('githubGistId').value.trim();
        githubSettings.fileName = document.getElementById('githubFileName').value.trim() || 'network-cards.json';
        githubSettings.autoSync = document.getElementById('githubAutoSync').checked;
        saveGithubSettings();
    });
    const createBtn = document.getElementById('githubCreateGistBtn');
    if (createBtn) createBtn.addEventListener('click', githubCreateGist);
    const uploadBtn = document.getElementById('githubUploadBtn');
    if (uploadBtn) uploadBtn.addEventListener('click', githubUploadData);
    const downloadBtn = document.getElementById('githubDownloadBtn');
    if (downloadBtn) downloadBtn.addEventListener('click', githubDownloadData);
});

/**
 * تسجيل Service Worker للعمل بدون اتصال
 * يتحقق من دعم المتصفح قبل التسجيل
 * يسجل نجاح أو فشل التسجيل في وحدة التحكم
 * يمكّن التطبيق من العمل offline وتحسين الأداء
 * يتعامل مع التخزين المؤقت للملفات الثابتة
 */
// Service Worker registration
(function(){
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./serviceworker.js', { scope: './' })
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(err => {
          console.log('ServiceWorker registration failed: ', err);
        });
    });
  }
})();