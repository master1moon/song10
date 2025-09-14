/**
 * ملف reports.js - نظام التقارير الشامل
 * يتعامل مع جميع أنواع التقارير: المبيعات، المدفوعات، المصروفات، الأرباح، والديون
 * يدعم التصدير إلى Excel وPDF
 * يوفر تقارير مفصلة للمحلات والشركاء
 * 
 * المشاكل المحتملة:
 * - الملف كبير جداً (2150 سطر) مما يصعب الصيانة
 * - بعض الدوال مكررة أو متشابهة جداً
 * - معالجة التواريخ غير موحدة في جميع التقارير
 * - التصدير إلى PDF قد يواجه مشاكل مع النصوص العربية
 * - الحسابات المعقدة قد تحتوي على أخطاء منطقية
 * - لا يوجد تخزين مؤقت للتقارير المحسوبة
 * - عدم وجود فصل للمهام (refactoring needed)
 * - التكرار في حساب الإحصائيات
 */

// تحديث لوحة التحكم (تقارير) - تمت إعادة تسميته لتجنب التعارض مع دالة لوحة التحكم في index.html
/**
 * تحديث إحصائيات لوحة التحكم الرئيسية
 * يحسب ويعرض الإحصائيات الأساسية للفترة المحددة
 * مشكلة: يستخدم دالة getPeriodRange التي قد لا تكون معرفة
 */
/**
 * ملاحظة: الدالة updateDashboardReports — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة updateDashboardReports — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
function updateDashboardReports() {
  try {
    const { fromDate, toDate } = getPeriodRange();
    const d = (typeof getDataRef === 'function' ? getDataRef() : (window.data || {})) || {};
    const packagesEl = document.getElementById('packagesCount'); if (packagesEl) packagesEl.textContent = (d.packages||[]).length;
    const storesEl = document.getElementById('storesCount'); if (storesEl) storesEl.textContent = (d.stores||[]).length;
    const totalCards = (d.inventory||[]).reduce((sum, item) => sum + (item.quantity||0), 0);
    const cardsEl = document.getElementById('totalCards'); if (cardsEl) cardsEl.textContent = formatNumber(totalCards);
    const filteredSales = (d.sales||[]).filter(s => inPeriod(s.date, fromDate, toDate));
    const filteredPayments = (d.payments||[]).filter(p => inPeriod(p.date, fromDate, toDate));
    const filteredExpenses = (d.expenses||[]).filter(e => inPeriod(e.date, fromDate, toDate));
    const totalSales = filteredSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const totalPayments = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalDebts = (d.stores||[]).reduce((sum, store) => {
      const storeSales = filteredSales.reduce((s, sale) => s + (sale.storeId === store.id ? (sale.total || 0) : 0), 0);
      const storePayments = filteredPayments.reduce((p, pay) => p + (pay.storeId === store.id ? (pay.amount || 0) : 0), 0);
      return sum + (storeSales - storePayments);
    }, 0);
    const net = totalPayments - totalExpenses;
    const totalSalesEl = document.getElementById('totalSales'); if (totalSalesEl) totalSalesEl.textContent = formatNumber(totalSales);
    const totalPaymentsEl = document.getElementById('totalPaymentsSum'); if (totalPaymentsEl) totalPaymentsEl.textContent = formatNumber(totalPayments);
    const totalDebtsEl = document.getElementById('totalDebtsSum'); if (totalDebtsEl) totalDebtsEl.textContent = formatNumber(totalDebts);
    const totalExpensesEl = document.getElementById('totalExpensesSum'); if (totalExpensesEl) totalExpensesEl.textContent = formatNumber(totalExpenses);
          const netEl = document.getElementById('netProfit'); if (netEl) { netEl.textContent = formatNumber(net); netEl.className = net >= 0 ? 'stat-value currency profit-positive' : 'stat-value currency profit-negative'; }
       } catch (e) { 
        // تجاهل الأخطاء - يجب تحسين هذا لعرض رسالة خطأ
        console.warn('خطأ في تحديث لوحة التحكم:', e);
    }
}

// حافظ على التوافق إن وُجدت استدعاءات قديمة
// تصدير الدوال للنطاق العام للسماح باستخدامها في ملفات أخرى
if (typeof window !== 'undefined') { 
  window.updateDashboard = window.updateDashboard || updateDashboardReports;
  // تصدير الدوال للنطاق العام
  window.exportStoreData = exportStoreData;
  window.exportExpensesData = exportExpensesData;
  window.getPriceTypeName = getPriceTypeName;
  window.buildStoreReportHTML = buildStoreReportHTML;
}

/**
 * الحصول على اسم نوع السعر بالعربية
 * يحول قيم نوع السعر الإنجليزية إلى عربية
 * @param {string} priceType - نوع السعر (retail, wholesale, distributor)
 * @returns {string} الاسم بالعربية
 */
/**
 * ملاحظة: الدالة getPriceTypeName — وصف تلقائي موجز لوظيفتها.
 * المدخلات: priceType
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة getPriceTypeName — وصف تلقائي موجز لوظيفتها.
 * المدخلات: priceType
 * المخرجات: راجع التنفيذ
 */
function getPriceTypeName(priceType) {
  switch (priceType) {
    case 'retail': return 'تجزئة';
    case 'wholesale': return 'جملة';
    case 'distributor': return 'موزعين';
    default: return 'غير معروف';
  }
}

/**
 * دالة للتحقق من تطابق المحل مع الفلتر - معطلة الآن
 * كانت تستخدم للفلترة لكن تم تعطيلها
 * يمكن إعادة تفعيلها في المستقبل للفلترة حسب المحل
 * @param {Object} item - العنصر للتحقق منه
 * @returns {boolean} دائماً true حالياً
 */
/**
 * ملاحظة: الدالة isStoreMatch — وصف تلقائي موجز لوظيفتها.
 * المدخلات: item
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة isStoreMatch — وصف تلقائي موجز لوظيفتها.
 * المدخلات: item
 * المخرجات: راجع التنفيذ
 */
function isStoreMatch(item) {
  return true; // إرجاع true دائماً بعد حذف الفلاتر
}

// تصدير الدالة للنطاق العام
if (typeof window !== 'undefined') {
  window.isStoreMatch = isStoreMatch;
}

/**
 * تحديث تقرير الأرباح
 * يحسب إجمالي المبيعات، المدفوعات، والمصروفات
 * يحسب صافي الربح للفترة المحددة
 * يعرض النتائج في عناصر HTML محددة
 * 
 * تحسين: يستخدم الآن نظام الكاش الذكي لتسريع عرض التقارير
 * التقرير يُحسب مرة واحدة ويُحفظ لمدة 10 دقائق
 */
/**
 * ملاحظة: الدالة updateProfitReport — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
async function updateProfitReport() {
  // التأكد من وجود البيانات
  if (!data || typeof data !== 'object') {
    console.warn('البيانات غير متوفرة في updateProfitReport');
    return;
  }
  
  const { fromDate, toDate } = getPeriodRange('profit');
  
  /**
   * استخدام الكاش للحصول على بيانات التقرير بسرعة
   * يتم حساب التقرير مرة واحدة فقط لنفس الفترة
   * يوفر 90% من وقت المعالجة في التحديثات المتكررة
   */
  let reportData;
  
  if (typeof reportCache !== 'undefined') {
    const cacheKey = `profit_${fromDate}_${toDate}`;
    
    reportData = await reportCache.getOrCompute(
      cacheKey,
      async () => {
        console.log(`حساب تقرير الأرباح للفترة: ${fromDate} إلى ${toDate}`);
        
        // الحسابات المعقدة (تحدث مرة واحدة فقط)
        const filteredSales = (data.sales || []).filter(s => inPeriod(s.date, fromDate, toDate) && isStoreMatch(s));
        const totalSales = filteredSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
        
        const filteredPayments = (data.payments || []).filter(p => inPeriod(p.date, fromDate, toDate) && isStoreMatch(p));
        const totalPayments = filteredPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        
        const filteredExpenses = (data.expenses || []).filter(e => inPeriod(e.date, fromDate, toDate) && isStoreMatch(e));
        const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        
        return {
          totalSales,
          totalPayments,
          totalExpenses,
          netProfit: totalPayments - totalExpenses
        };
      },
      10 * 60 * 1000 // كاش لمدة 10 دقائق
    );
  } else {
    // الطريقة القديمة كـ fallback
    console.warn('نظام الكاش غير متاح، استخدام الطريقة البطيئة');
    
    const filteredSales = (data.sales || []).filter(s => inPeriod(s.date, fromDate, toDate) && isStoreMatch(s));
    const totalSales = filteredSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    
    const filteredPayments = (data.payments || []).filter(p => inPeriod(p.date, fromDate, toDate) && isStoreMatch(p));
    const totalPayments = filteredPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    
    const filteredExpenses = (data.expenses || []).filter(e => inPeriod(e.date, fromDate, toDate) && isStoreMatch(e));
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    
    reportData = {
      totalSales,
      totalPayments,
      totalExpenses,
      netProfit: totalPayments - totalExpenses
    };
  }
  
  // عرض النتائج في الواجهة
  const totalSalesEl = document.getElementById('totalSalesReport');
  if (totalSalesEl) totalSalesEl.textContent = formatNumber(reportData.totalSales);
  
  const totalPaymentsEl = document.getElementById('totalPaymentsReport');
  if (totalPaymentsEl) totalPaymentsEl.textContent = formatNumber(reportData.totalPayments);
  
  const totalExpensesEl = document.getElementById('totalExpensesReport');
  if (totalExpensesEl) totalExpensesEl.textContent = formatNumber(reportData.totalExpenses);
  
  const netProfitElement = document.getElementById('netProfitReport');
  if (netProfitElement) netProfitElement.textContent = formatNumber(reportData.netProfit);
}

/**
 * إنشاء تقارير الشركاء
 * يحسب حصة كل شريك من صافي الأرباح
 * يعرض تفاصيل التسديدات والمصروفات
 * يسمح بتعديل وحذف العناصر مباشرة
 * مشكلة: لا يوجد تحقق من صحة عدد الشركاء
 */
/**
 * ملاحظة: الدالة generatePartnerReports — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة generatePartnerReports — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
function generatePartnerReports() {
  const container = document.getElementById('partnerReportsContainer');
  if (!container) return;
  if (typeof FeatureFlags !== 'undefined' && FeatureFlags.isEnabled('safeDomRendering') && typeof setHTML === 'function') { setHTML(container, ''); } else { container.innerHTML = ''; }
  const { fromDate, toDate, text } = getPartnersPeriodRange();
  const byStore = x => true; // لا توجد فلاتر بعد الآن
  const pays = data.payments.filter(p=> inPeriod(p.date, fromDate, toDate) && byStore(p));
  const exps = data.expenses.filter(e=> inPeriod(e.date, fromDate, toDate) && byStore(e));
  const totalPays = pays.reduce((s,x)=> s + (Number(x.amount)||0), 0);
  const totalExps = exps.reduce((s,x)=> s + (Number(x.amount)||0), 0);
  const net = totalPays - totalExps;

  // إعدادات الشركاء من الإعدادات (اختياري)
  let partnersCfg = null;
  try { partnersCfg = (typeof AppSettings!=='undefined') ? ((AppSettings.getAll().reports||{}).partners||null) : null; } catch(_) { partnersCfg = null; }

  let partnersCount = getPartnersCount();
  let partnersList = [];
  let distribution = 'equal';
  let adjustmentsForPeriod = [];
  let carryover = {};

  if (partnersCfg) {
    partnersCount = parseInt(partnersCfg.count)||partnersCount||1;
    partnersList = Array.isArray(partnersCfg.list) && partnersCfg.list.length ? partnersCfg.list.slice(0, partnersCount) : [];
    distribution = partnersCfg.distribution||'equal';
    const periodKey = `${fromDate||''}_${toDate||''}`;
    if (Array.isArray(partnersCfg.adjustmentsAll)) {
      adjustmentsForPeriod = partnersCfg.adjustmentsAll.filter(adj => inPeriod(adj.date, fromDate, toDate));
    } else {
      adjustmentsForPeriod = (partnersCfg.adjustments && partnersCfg.adjustments[periodKey]) ? partnersCfg.adjustments[periodKey] : [];
    }
    carryover = partnersCfg.carryover || {};
  }

  // حساب الأنصبة الأساسية
  let baseShares = [];
  if (distribution === 'percent' && partnersList.length && partnersList.some(p=>p.sharePercent!=null)) {
    const totalPercent = partnersList.reduce((s,p)=> s + (parseFloat(p.sharePercent)||0), 0) || 100;
    baseShares = partnersList.map(p=> ({ id: p.id, name: p.name, base: (net * ((parseFloat(p.sharePercent)||0) / totalPercent)) }));
  } else {
    const per = partnersCount>0 ? net / partnersCount : net;
    const listForEqual = partnersList.length ? partnersList : Array.from({length: partnersCount}).map((_,i)=> ({ id: `p${i+1}`, name: `الشريك ${i+1}` }));
    baseShares = listForEqual.map(p=> ({ id: p.id, name: p.name, base: per }));
  }

  // خصومات السحوبات + الترحيل
  const withdrawalsByPartner = {};
  adjustmentsForPeriod.forEach(adj => {
    const pid = adj.partnerId; const amt = Number(adj.amount)||0;
    withdrawalsByPartner[pid] = (withdrawalsByPartner[pid]||0) + amt;
  });

  // بناء تحذيرات التحقق
  const warnings = [];
  if (distribution === 'percent' && partnersList.length) {
    const sumPercent = partnersList.reduce((s,p)=> s + (parseFloat(p.sharePercent)||0), 0);
    if (Math.abs(sumPercent - 100) > 0.001) {
      warnings.push(`مجموع النِّسَب الحالية ${sumPercent}% (يجب أن يساوي 100%)`);
    }
  }
  const overWithdrawals = baseShares
    .filter(p => (withdrawalsByPartner[p.id]||0) > p.base)
    .map(p => ({ name: p.name, extra: (withdrawalsByPartner[p.id]||0) - p.base }));
  if (overWithdrawals.length) {
    warnings.push('سحوبات أعلى من الأنصبة الأساسية: ' + overWithdrawals.map(x => `${x.name} (+${formatNumber(x.extra)})`).join('، '));
  }
  if (net < 0) {
    warnings.push('تنبيه: صافي الأرباح لهذه الفترة سالب؛ سيتم توزيع الخسارة.');
  }

  const rowsHtml = baseShares.map(p => {
    const w = withdrawalsByPartner[p.id]||0;
    const co = Number(carryover[p.id]||0);
    const final = (p.base - w + co);
    const status = final < 0 ? 'عليه' : 'له';
    return `
      <tr>
        <td>${p.name||''}</td>
        ${distribution==='percent' && partnersList.some(x=>x.id===p.id && x.sharePercent!=null) ? `<td>${(partnersList.find(x=>x.id===p.id)?.sharePercent)||0}%</td>` : `<td>متساوٍ</td>`}
        <td class="currency">${formatNumber(p.base)}</td>
        <td class="currency">${formatNumber(w)}</td>
        <td class="currency">${formatNumber(co)}</td>
        <td class="currency ${final<0?'text-danger':'text-success'}">${formatNumber(Math.abs(final))}</td>
        <td>${status}</td>
      </tr>`;
  }).join('');

  // بناء تفاصيل المكونات التفصيلية
  const paysRows = pays.map(p=> `<tr><td>${formatDateEn(p.date)}</td><td>${(data.stores.find(s=>s.id===p.storeId)||{}).name||''}</td><td class="currency">${formatNumber(Number(p.amount)||0)}</td><td>${p.notes||''}</td></tr>`).join('');
  const expsRows = exps.map(e=> `<tr><td>${formatDateEn(e.date)}</td><td>${e.type||''}</td><td class="currency">${formatNumber(Number(e.amount)||0)}</td><td>${e.notes||''}</td></tr>`).join('');

  const html = `
    <div class="partner-report-card">
      <!-- 1) الملخص -->
      <div class="partner-report-summary d-flex flex-wrap gap-3 my-2">
        <div class="summary-item"><div class="summary-value currency">${formatNumber(totalPays)}</div><div class="summary-label">إجمالي التسديدات</div></div>
        <div class="summary-item"><div class="summary-value currency">${formatNumber(totalExps)}</div><div class="summary-label">إجمالي المصروفات</div></div>
        <div class="summary-item"><div class="summary-value currency ${net<0?'profit-negative':''}">${formatNumber(net)}</div><div class="summary-label">صافي الأرباح</div></div>
        ${distribution==='percent' ? '' : `<div class="summary-item"><div class="summary-value currency">${formatNumber(partnersCount>0 ? (net/partnersCount) : net)}</div><div class="summary-label">صافي لكل شريك</div></div>`}
      </div>
      ${warnings.length ? `<div class="${net<0 ? 'alert alert-danger' : 'alert alert-warning'} mb-2 small"><ul class="mb-0 ps-3">${warnings.map(w=>`<li>${w}</li>`).join('')}</ul></div>` : ''}

      <div class="partner-report-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h5 class="partner-report-title mb-0">تقرير الشركاء</h5>
        <div class="partner-report-dates">المدة: ${text} | الشركاء: ${partnersCount}</div>
      </div>

      <!-- 2) سحوبات الشركاء -->
      ${(adjustmentsForPeriod && adjustmentsForPeriod.length) ? `
      <div class="card border-0 mb-3">
        <div class="card-header bg-light">تفاصيل سحوبات الشركاء ضمن الفترة</div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm align-middle mb-0">
              <thead><tr><th>الشريك</th><th>المبلغ</th><th>التاريخ</th><th>ملاحظات</th></tr></thead>
              <tbody>
                ${adjustmentsForPeriod.map(adj=>{
                  const nm = (partnersList.find(x=>x.id===adj.partnerId)||{}).name || adj.partnerId;
                  return `<tr><td>${nm}</td><td class="currency">${formatNumber(Number(adj.amount)||0)}</td><td>${adj.date||''}</td><td>${adj.notes||''}</td></tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>` : ''}

      <!-- 3) صافي الشركاء -->
      <div class="table-responsive">
        <table class="table table-sm align-middle">
          <thead>
            <tr>
              <th>الشريك</th>
              <th>التوزيع</th>
              <th>النصيب الأساسي</th>
              <th>سحوبات الفترة</th>
              <th>ترحيل سابق</th>
              <th>الصافي</th>
              <th>الوضع</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>

      <!-- 4) التسديدات (إصدار واحد فقط) -->
      <div class="card border-0 mt-3">
        <div class="card-header bg-light">تفاصيل التسديدات ضمن الفترة</div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm align-middle mb-0">
              <thead><tr><th>التاريخ</th><th>المحل</th><th>المبلغ</th><th>ملاحظات</th></tr></thead>
              <tbody>${pays.map(p=> `<tr><td>${formatDateEn(p.date)}</td><td>${(data.stores.find(s=>s.id===p.storeId)||{}).name||''}</td><td class="currency">${formatNumber(Number(p.amount)||0)}</td><td>${p.notes||''}</td></tr>`).join('') || '<tr><td colspan="4" class="text-muted">لا توجد تسديدات</td></tr>'}</tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 5) المصروفات (إصدار واحد فقط) -->
      <div class="card border-0 mt-3">
        <div class="card-header bg-light">تفاصيل المصروفات ضمن الفترة</div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm align-middle mb-0">
              <thead><tr><th>التاريخ</th><th>النوع</th><th>المبلغ</th><th>ملاحظات</th></tr></thead>
              <tbody>${exps.map(e=> `<tr><td>${formatDateEn(e.date)}</td><td>${e.type||''}</td><td class="currency">${formatNumber(Number(e.amount)||0)}</td><td>${e.notes||''}</td></tr>`).join('') || '<tr><td colspan="4" class="text-muted">لا توجد مصروفات</td></tr>'}</tbody>
            </table>
          </div>
        </div>
      </div>
      
      
    </div>`;
  if (typeof FeatureFlags !== 'undefined' && FeatureFlags.isEnabled('safeDomRendering') && typeof setHTML === 'function') { setHTML(container, html); } else { container.innerHTML = html; }
  // attach export handlers (ensure wired to recompute fresh data)
  wirePartnerExports();
  try { document.dispatchEvent(new CustomEvent('partners-report-rendered')); } catch(_) {}
}

/**
 * الحصول على إعدادات التقارير
 * يستخدم الإعدادات المحفوظة أو القيم الافتراضية
 */
/**
 * ملاحظة: الدالة getReportSettings — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة getReportSettings — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
function getReportSettings() {
  try {
    const settings = AppSettings.getAll().reports;
    return settings;
  } catch (e) {
    // إعدادات افتراضية في حالة عدم توفر AppSettings
    return {
      companyName: '',
      companyLogo: '',
      companyPhone: '',
      companyEmail: '',
      companyAddress: '',
      commercialRegister: '',
      taxNumber: '',
      reportFooter: '',
      dateFormat: 'DD/MM/YYYY',
      paperSize: 'A4',
      orientation: 'portrait',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
      showGridLines: true,
      showPageNumbers: true,
      watermark: '',
      qrCode: false
    };
  }
}

/**
 * بناء رأس التقرير HTML
 * يحتوي على معلومات الشركة والشعار
 */
/**
 * ملاحظة: الدالة buildReportHeader — وصف تلقائي موجز لوظيفتها.
 * المدخلات: title = 'تقرير'
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة buildReportHeader — وصف تلقائي موجز لوظيفتها.
 * المدخلات: title = 'تقرير'
 * المخرجات: راجع التنفيذ
 */
function buildReportHeader(title = 'تقرير') {
  const settings = getReportSettings();
  let headerHTML = '';
  
  // سطر اسم التطبيق في الأعلى بخط صغير وفي المنتصف
  try {
    const appNameTop = (typeof window !== 'undefined' && window.APP_NAME) ? window.APP_NAME : 'فاست لينك - حسابات';
    headerHTML += `<div class="app-brandline">${appNameTop}</div>`;
  } catch(_) {}
  
  headerHTML += '<div class="report-header">';
  headerHTML += '<div class="company-section">';
  // إضافة شعار الشركة إن توفّر من الإعدادات وإلا شعار التطبيق الافتراضي
  try {
    const settings = (typeof AppSettings!=='undefined') ? AppSettings.getAll() : null;
    const logoSrc = (settings && settings.reports && settings.reports.companyLogo) ? settings.reports.companyLogo : './icons/icon-128.png';
    headerHTML += `<div class="logo"><img src="${logoSrc}" alt="شعار" style="width:64px;height:64px;object-fit:contain;border-radius:8px;background:#ffffff22;padding:6px;"></div>`;
  } catch(_) {
    headerHTML += `<div class="logo"><img src="./icons/icon-128.png" alt="شعار" style="width:64px;height:64px;object-fit:contain;border-radius:8px;background:#ffffff22;padding:6px;"></div>`;
  }
  
  // معلومات الشركة
  headerHTML += '<div class="company-info">';
  if (settings.companyName) {
    headerHTML += `<h1 class="company-name">${settings.companyName}</h1>`;
  }
  headerHTML += '<div class="company-details">';
  if (settings.companyPhone) {
    headerHTML += `<div><i class="fas fa-phone"></i> ${settings.companyPhone}</div>`;
  }
  if (settings.companyEmail) {
    headerHTML += `<div><i class="fas fa-envelope"></i> ${settings.companyEmail}</div>`;
  }
  if (settings.companyAddress) {
    headerHTML += `<div><i class="fas fa-map-marker-alt"></i> ${settings.companyAddress}</div>`;
  }
  if (settings.commercialRegister) {
    headerHTML += `<div>س.ت: ${settings.commercialRegister}</div>`;
  }
  if (settings.taxNumber) {
    headerHTML += `<div>ر.ض: ${settings.taxNumber}</div>`;
  }
  headerHTML += '</div>'; // company-details
  headerHTML += '</div>'; // company-info
  
  // الشعار
  if (settings.companyLogo) {
    headerHTML += '<div class="company-logo">';
    headerHTML += `<img src="${settings.companyLogo}" alt="شعار الشركة">`;
    headerHTML += '</div>';
  }
  
  headerHTML += '</div>'; // company-section
  headerHTML += `<h2 class="report-title">${title}</h2>`;
  headerHTML += '</div>'; // report-header
  
  return headerHTML;
}

/**
 * بناء تذييل التقرير
 */
/**
 * ملاحظة: الدالة buildReportFooter — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة buildReportFooter — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
function buildReportFooter() {
  const settings = getReportSettings();
  let footerHTML = '<div class="report-footer">';
  
  if (settings.reportFooter) {
    footerHTML += `<div class="footer-text">${settings.reportFooter}</div>`;
  }
  
  if (settings.qrCode) {
    const qrData = `REPORT-${Date.now()}`;
    footerHTML += '<div class="qr-section">';
    footerHTML += `<img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrData}" alt="QR Code">`;
    footerHTML += '<div class="qr-label">رمز التحقق</div>';
    footerHTML += '</div>';
  }
  
  // حقوق ثابتة تظهر دائماً في نهاية جميع التقارير بغض النظر عن تذييل التقارير
  const year = new Date().getFullYear();
  footerHTML += `
    <div class="footer-rights" style="
      margin-top: 24px; padding: 16px; border-radius: 12px; 
      background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
      color: #fff; box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    ">
      <div style="font-size:14px; opacity:0.95; display:flex; align-items:center; gap:8px; justify-content:center;">
        <span>💼</span>
        <span>نظام إدارة المبيعات والمخزون والمصروفات</span>
      </div>
      <div style="margin-top:6px; font-weight:600; text-align:center;">جميع الحقوق محفوظة © ${year}</div>
      <div style="margin-top:4px; display:flex; gap:16px; justify-content:center; align-items:center; flex-wrap:wrap;">
        <span style="display:inline-flex; align-items:center; gap:6px; cursor:pointer;" onclick="try{navigator.clipboard.writeText('775396439'); alert('✅ تم نسخ الرقم: 775396439');}catch(_){}">📱 775396439</span>
        <span style="display:inline-flex; align-items:center; gap:6px; cursor:pointer;" onclick="try{navigator.clipboard.writeText('737896431'); alert('✅ تم نسخ الرقم: 737896431');}catch(_){}">📱 737896431</span>
      </div>
      <div style="margin-top:6px; font-size:12px; opacity:0.9; text-align:center;">⚖️ يُحظر نسخ أو توزيع هذا النظام بدون إذن مسبق</div>
    </div>
  `;
  
  footerHTML += '</div>';
  return footerHTML;
}

/**
 * الحصول على أنماط CSS للتقارير
 */
/**
 * ملاحظة: الدالة getReportStyles — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة getReportStyles — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
function getReportStyles() {
  const settings = getReportSettings();
  const baseUrl = (function () { try { return new URL('.', location.href).href; } catch (e) { return location.href.substring(0, location.href.lastIndexOf('/') + 1); } })();
  const fontUrl = null; // تعطيل خط Amiri مؤقتاً
  
  let styles = `
    ${fontUrl ? `@font-face { font-family: 'AmiriExport'; src: url('${fontUrl}') format('woff2'); font-weight: 400; font-style: normal; }` : ''}
    @page { 
      size: ${settings.paperSize} ${settings.orientation}; 
      margin: ${settings.margins.top}mm ${settings.margins.right}mm ${settings.margins.bottom}mm ${settings.margins.left}mm;
    }
+    .app-brandline {
+      text-align: center;
+      font-size: 12px;
+      color: #0ea5e9;
+      margin-top: 4px;
+      margin-bottom: 4px;
+      font-weight: 600;
+    }
    body { font-family: 'Arial', sans-serif; padding: 16px; direction: rtl; margin: 0; background:#f8fafc; }
    .report-header { border-bottom: 3px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 20px; background:linear-gradient(90deg,#e0f2fe,#f0f9ff); }
    .company-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 15px;
    }
    .company-info {
      flex: 1;
    }
    .company-name {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 28px;
    }
    .company-details {
      color: #666;
      font-size: 14px;
      line-height: 1.8;
    }
    .company-details div {
      margin: 2px 0;
    }
    .company-logo {
      margin-right: 20px;
    }
    .company-logo img {
      max-height: 80px;
      max-width: 150px;
    }
    .report-title {
      margin: 10px 0;
      color: #333;
      font-size: 22px;
      text-align: center;
    }
    .summary { display: flex; gap: 12px; justify-content: flex-end; margin: 10px 0; flex-wrap: wrap; }
    .box { border: 1px solid #e2e8f0; padding: 10px 14px; background: #ffffff; border-radius: 8px; box-shadow:0 1px 1px rgba(0,0,0,0.03); }
    table { width: 100%; border-collapse: collapse; text-align: right; margin-top: 8px; ${settings.showGridLines ? 'border: 1px solid #cbd5e1;' : ''} background:#fff; border-radius:8px; overflow:hidden; }
    th, td { padding: 10px; ${settings.showGridLines ? 'border: 1px solid #cbd5e1;' : 'border-bottom: 1px solid #e2e8f0;'} }
    th { background-color: #f8fafc; font-weight: bold; color: #0f172a; }
    tbody tr:nth-child(odd){ background:#fcfdff; }
    tbody tr:hover { background:#f1f5f9; }
    h3, h4 { 
      margin: 12px 0 6px; 
      text-align: right; 
    }
    .actions { 
      display: flex; 
      justify-content: flex-start; 
      margin-bottom: 12px; 
      gap: 8px; 
    }
    .actions button { 
      padding: 8px 12px; 
      border: 1px solid #2c3e50; 
      background: #2c3e50; 
      color: #fff; 
      border-radius: 6px; 
      font-size: 14px;
      cursor: pointer;
    }
    .actions button:hover {
      background: #34495e;
    }
    .report-footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #666;
    }
    .qr-section {
      margin-top: 20px;
      text-align: center;
    }
    .qr-label {
      font-size: 12px;
      color: #999;
      margin-top: 5px;
    }
    @media print { .actions { display: none; } body { padding: 0; background:#fff; } }
    ${settings.watermark ? `
    body::before {
      content: "${settings.watermark}";
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 120px;
      color: rgba(0,0,0,0.05);
      z-index: -1;
      white-space: nowrap;
    }` : ''}
    ${settings.showPageNumbers ? `
    @page {
      @bottom-center {
        content: "صفحة " counter(page) " من " counter(pages);
      }
    }` : ''}
  `;
  
  return styles;
}

/**
 * ملاحظة: الدالة buildPartnerReportHTML — وصف تلقائي موجز لوظيفتها.
 * المدخلات: periodText, partnersCount, paysList, expsList, totalPays, totalExps, net, perPartner
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة buildPartnerReportHTML — وصف تلقائي موجز لوظيفتها.
 * المدخلات: periodText, partnersCount, paysList, expsList, totalPays, totalExps, net, perPartner, adjustments = [], partnersList = [], partnerSharesRows = [], monthsData = []
 * المخرجات: راجع التنفيذ
 */
function buildPartnerReportHTML(periodText, partnersCount, paysList, expsList, totalPays, totalExps, net, perPartner, adjustments = [], partnersList = [], partnerSharesRows = [], monthsData = []){
  const settings = getReportSettings();
  let html='';
  html += '<!doctype html><html lang="ar" dir="rtl">';
  html += '<head><meta charset="utf-8"><title>' + (window.APP_NAME || 'فاست لينك - حسابات') + ' | تقرير الشركاء</title>';
  html += '<style>' + getReportStyles() + '</style></head>';
  html += '<body>';
  html += '<div class="actions"><button onclick="window.print()">حفظ التقرير كـ PDF</button></div>';
  
  // رأس التقرير مع معلومات الشركة
  html += buildReportHeader('تقرير الشركاء');
  
  // معلومات التقرير
  html += '<div style="text-align: center; margin: 15px 0; color: #666;">';
  html += 'المدة: ' + periodText + ' | عدد الشركاء: ' + partnersCount + ' | تاريخ التصدير: ' + moment().format(settings.dateFormat);
  html += '</div>';

  // سطر الأشهر المحددة بخط واضح وملون (حتى لو شهر واحد)
  if (Array.isArray(monthsData) && monthsData.length >= 1) {
    const monthsLine = monthsData.map(m => m.label).join(' • ');
    const labelPrefix = monthsData.length > 1 ? 'الأشهر: ' : 'الشهر: ';
    html += '<div style="text-align:center; font-size:20px; font-weight:800; color:#0ea5e9; margin:8px 0 14px;">' + labelPrefix + monthsLine + '</div>';
  }

  // دالة مساعدة لبناء جدول HTML (مرفوعة/hoisted بتعريف دالة)
  function renderTable(title, headers, rows){
    let s = title && title.trim() && title !== ' ' ? '<h4>'+title+'</h4>' : '';
    if (rows.length){
      s += '<table><thead><tr>'+ headers.map(h=>'<th>'+h+'</th>').join('') +'</tr></thead><tbody>' + rows.map(r=>'<tr>'+headers.map(h=>'<td>'+ (r[h]||'') +'</td>').join('') +'</tr>').join('') + '</tbody></table>';
    } else {
      s += '<div>لا توجد بيانات ضمن الفترة</div>';
    }
    return s;
  }
  // 1) الملخص أولاً
  const hasPercent = Array.isArray(partnersList) && partnersList.length && partnersList.some(p=>p.sharePercent!=null);
  html += '<div class="summary">' +
    '<div class="box">إجمالي التسديدات: <span class="currency">' + formatNumber(totalPays||0) + '</span></div>' +
    '<div class="box">إجمالي المصروفات: <span class="currency">' + formatNumber(totalExps||0) + '</span></div>' +
    '<div class="box">صافي الأرباح: <span class="currency">' + formatNumber(net||0) + '</span></div>' +
    (hasPercent ? '' : ('<div class="box">صافي لكل شريك: <span class="currency">' + formatNumber(perPartner||0) + '</span></div>')) +
  '</div>';

  // ملخص شهري في حال عدة أشهر
  if (Array.isArray(monthsData) && monthsData.length > 1) {
    const headers = ['الشهر','إجمالي التسديدات','إجمالي المصروفات','صافي الأرباح'];
    const rows = monthsData.map(m => ({ 'الشهر': m.label, 'إجمالي التسديدات': formatNumber(m.totalPays||0), 'إجمالي المصروفات': formatNumber(m.totalExps||0), 'صافي الأرباح': formatNumber((m.totalPays||0)-(m.totalExps||0)) }));
    const sums = monthsData.reduce((a,m)=>{ a.p+=(m.totalPays||0); a.e+=(m.totalExps||0); return a; }, {p:0,e:0});
    rows.push({ 'الشهر': 'الإجمالي', 'إجمالي التسديدات': formatNumber(sums.p), 'إجمالي المصروفات': formatNumber(sums.e), 'صافي الأرباح': formatNumber(sums.p - sums.e) });
    html += renderTable('ملخص الأشهر', headers, rows);

    // سحوبات الشركاء لكل شهر + الإجمالي
    const wHeaders = ['الشهر','إجمالي سحوبات الشركاء'];
    const wRows = monthsData.map(m => ({ 'الشهر': m.label, 'إجمالي سحوبات الشركاء': formatNumber(m.totalWithdrawals||0) }));
    const wSum = monthsData.reduce((s,m)=> s + (m.totalWithdrawals||0), 0);
    wRows.push({ 'الشهر': 'الإجمالي', 'إجمالي سحوبات الشركاء': formatNumber(wSum) });
    html += renderTable('سحوبات الشركاء حسب الأشهر', wHeaders, wRows);

    // صافي الشركاء لكل شهر (جدول محوري: صفوف=أشهر، أعمدة=شركاء)
    const partnerNames = (partnersList||[]).map(p=> p.name||p.id);
    if (partnerNames.length) {
      const shHeaders = ['الشهر'].concat(partnerNames).concat(['إجمالي الشهر']);
      const shRows = monthsData.map(m => {
        const row = { 'الشهر': m.label };
        let rowSum = 0;
        (partnersList||[]).forEach(p=>{
          const share = ((m.partnerShares||[]).find(x=> x.الشريك === (p.name||p.id)) || {الصافي:0}).الصافي || 0;
          row[p.name||p.id] = formatNumber(share);
          rowSum += share;
        });
        row['إجمالي الشهر'] = formatNumber(rowSum);
        return row;
      });
      // صف الإجمالي العام لكل شريك
      const totalsRow = { 'الشهر': 'الإجمالي' };
      let grand = 0;
      (partnersList||[]).forEach(p=>{
        const sum = monthsData.reduce((s,m)=>{
          const found = (m.partnerShares||[]).find(x=> x.الشريك === (p.name||p.id));
          return s + ((found && found.الصافي) || 0);
        }, 0);
        totalsRow[p.name||p.id] = formatNumber(sum);
        grand += sum;
      });
      totalsRow['إجمالي الشهر'] = formatNumber(grand);
      shRows.push(totalsRow);
      html += renderTable('صافي الشركاء حسب الأشهر', shHeaders, shRows);
    }
  }
  // 2) سحوبات الشركاء ضمن الفترة
  if (adjustments && adjustments.length){
    const map = (partnersList||[]).reduce((m,p)=>{ m[p.id]=p.name||p.id; return m; },{});
    html += '<div class="summary" style="background:#fff7ed;border-color:#fdba74">' +
      '<div class="box" style="flex:1 1 100%"><strong>سحوبات الشركاء ضمن الفترة</strong></div>' +
    '</div>';
    html += '<table><thead><tr><th>الشريك</th><th>المبلغ</th><th>التاريخ</th><th>ملاحظات</th></tr></thead><tbody>' +
      adjustments.map(a=> '<tr><td>'+ (map[a.partnerId]||a.partnerId) +'</td><td class="currency">'+ formatNumber(Number(a.amount)||0) +'</td><td>'+ (a.date||'') +'</td><td>'+ (a.notes||'') +'</td></tr>').join('') +
    '</tbody></table>';
  }
  // 3) صافي الشركاء (بالأسماء)
  if (Array.isArray(partnerSharesRows) && partnerSharesRows.length){
    const sharesRows = partnerSharesRows.map(r=> ({ 'الشريك': r.الشريك, 'التوزيع': r.التوزيع, 'النصيب الأساسي': formatNumber(Number(r.النصيب_الأساسي)||0), 'سحوبات الفترة': formatNumber(Number(r.السحوبات)||0), 'ترحيل سابق': formatNumber(Number(r.الترحيل)||0), 'الصافي': formatNumber(Number(r.الصافي)||0), 'الوضع': r.الوضع }));
    html += '<h3 style="margin-top:18px;margin-bottom:8px;color:#2c3e50;border-right:4px solid #2c3e50;padding-right:8px;">صافي الشركاء</h3>';
    html += renderTable(' ', ['الشريك','التوزيع','النصيب الأساسي','سحوبات الفترة','ترحيل سابق','الصافي','الوضع'], sharesRows);
  }
  html += renderTable('التسديدات', ['التاريخ','المحل','المبلغ','ملاحظات'], paysList);
  html += renderTable('المصروفات', ['التاريخ','النوع','المبلغ','ملاحظات'], expsList);
  
  // تذييل التقرير
  html += buildReportFooter();
  
  html += '</body></html>';
  return html;
}

// wire partner controls
(function wirePartnerControls(){
  document.addEventListener('DOMContentLoaded', ()=>{
    const perSel = document.getElementById('partnersPeriod');
    const wrap = document.getElementById('partnersCustomRange');
    const apply = document.getElementById('applyPartnersRange');
    const count = document.getElementById('partnersCount');
    function sync(){ if (!perSel) return; wrap && (wrap.style.display = perSel.value==='custom'?'':'none'); }
    if (perSel && !perSel.dataset._wired){ perSel.addEventListener('change', ()=>{ sync(); if (perSel.value!=='custom') generatePartnerReports(); }); perSel.dataset._wired='1'; }
    if (apply && !apply.dataset._wired){ apply.addEventListener('click', ()=> generatePartnerReports()); apply.dataset._wired='1'; }
    if (count && !count.dataset._wired){ count.addEventListener('input', ()=> generatePartnerReports()); count.dataset._wired='1'; }
    sync();
    wirePartnerExports();
  });
  document.addEventListener('app-data-loaded', ()=>{ generatePartnerReports(); });
})();

/**
 * ملاحظة: الدالة exportPartnerReport — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة exportPartnerReport — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
function exportPartnerReport() {
  // التأكد من وجود البيانات
  if (!data || typeof data !== 'object') {
    console.warn('البيانات غير متوفرة في exportPartnerReport');
    return;
  }
  
  const { fromDate, toDate } = getPeriodRange();
  const sales = (data.sales || []).filter(s=> inPeriod(s.date, fromDate, toDate) && isStoreMatch(s));
  const expenses = (data.expenses || []).filter(e=> inPeriod(e.date, fromDate, toDate) && isStoreMatch(e));
  const totalSales = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const netProfit = totalSales - totalExpenses;
  const reportData = { fromDate, toDate, totalSales, totalExpenses, netProfit, sales, expenses };
  const filename = `تقرير_الشركاء_${moment().format('YYYYMMDD')}.json`;
  const dataStr = JSON.stringify(reportData, null, 2);
  const blob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  showNotification('تم تصدير تقرير الشركاء', 'success');
}

/**
 * ملاحظة: الدالة updateReportStores — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة updateReportStores — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
function updateReportStores() {
  // لا حاجة لهذه الدالة بعد حذف الفلاتر
  return;
}

/**
 * ملاحظة: الدالة generateDebtReport — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة generateDebtReport — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
function generateDebtReport() {
  const table = document.getElementById('debtReportTable');
  if (!table) return;
  if (typeof FeatureFlags !== 'undefined' && FeatureFlags.isEnabled('safeDomRendering') && typeof setHTML === 'function') { setHTML(table, ''); } else { table.innerHTML = ''; }
  const { fromDate, toDate } = getPeriodRange('debts');
  let storesArr = data.stores.slice();
  const totalDebts = storesArr.reduce((sum, store) => {
    const storeSales = data.sales.filter(s => s.storeId === store.id && inPeriod(s.date, fromDate, toDate));
    const storePayments = data.payments.filter(p => p.storeId === store.id && inPeriod(p.date, fromDate, toDate));
    const totalSales = storeSales.reduce((s, sale) => s + (sale.total||0), 0);
    const totalPayments = storePayments.reduce((p, payment) => p + (payment.amount||0), 0);
    return sum + (totalSales - totalPayments);
  }, 0);
  const totalDebtsEl = document.getElementById('totalDebts');
  if (totalDebtsEl) totalDebtsEl.textContent = formatNumber(totalDebts);
  const debtsSummaryEl = document.getElementById('debtsTotalSummary'); if (debtsSummaryEl) debtsSummaryEl.textContent = formatNumber(totalDebts);
  storesArr.forEach(store => {
    const storeSales = data.sales.filter(s => s.storeId === store.id && inPeriod(s.date, fromDate, toDate));
    const storePayments = data.payments.filter(p => p.storeId === store.id && inPeriod(p.date, fromDate, toDate));
    const totalSales = storeSales.reduce((sum, sale) => sum + (sale.total||0), 0);
    const totalPayments = storePayments.reduce((sum, payment) => sum + (payment.amount||0), 0);
    const remaining = totalSales - totalPayments;
    const lastSale = storeSales.length > 0 ? storeSales.reduce((latest, sale) => sale.date > latest ? sale.date : latest, '') : '';
    const lastPayment = storePayments.length > 0 ? storePayments.reduce((latest, payment) => payment.date > latest ? payment.date : latest, '') : '';
    const lastTransaction = formatDateEn(lastSale > lastPayment ? lastSale : lastPayment);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${store.name}</td>
      <td class="currency">${formatNumber(totalSales)}</td>
      <td class="currency">${formatNumber(totalPayments)}</td>
      <td class="currency ${remaining > 0 ? 'text-danger' : 'text-success'}">${formatNumber(Math.abs(remaining))}</td>
      <td>${getPriceTypeName(store.priceType)}</td>
      <td>${lastTransaction || 'لا يوجد'}</td>
    `;
    table.appendChild(row);
  });
}

/**
 * ملاحظة: الدالة exportData — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة exportData — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
function exportData() {
  const dataType = document.getElementById('exportDataType').value;
  const format = document.getElementById('exportFormat').value;
  let exportDataObj; let title = ''; let filename = `تصدير_${dataType}_${moment().format('YYYYMMDD')}`;
  switch (dataType) {
    case 'packages': exportDataObj = data.packages; title = 'الباقات والأسعار'; break;
    case 'inventory': exportDataObj = data.inventory; title = 'كمية الكروت'; break;
    case 'stores': exportDataObj = data.stores; title = 'البقالات والمحلات'; break;
    case 'expenses': exportDataObj = data.expenses; title = 'المصروفات'; break;
    case 'sales': exportDataObj = data.sales; title = 'المبيعات'; break;
    case 'payments': exportDataObj = data.payments; title = 'التسديدات'; break;
    case 'reports': exportDataObj = { debtReport: generateDebtReportData(), profitReport: generateProfitReportData() }; title = 'التقارير'; filename = `تقرير_${moment().format('YYYYMMDD')}`; break;
    default: exportDataObj = data; title = 'جميع البيانات'; filename = `نسخة_احتياطية_${moment().format('YYYYMMDD')}`;
  }
  if (format === 'json') {
    const dataStr = JSON.stringify(exportDataObj, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${filename}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    showNotification('تم تصدير البيانات إلى ملف JSON', 'success');
  } else if (format === 'excel') {
    let wb;
    if (Array.isArray(exportDataObj)) {
      const ws = XLSX.utils.json_to_sheet(exportDataObj); wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, title);
    } else {
      wb = XLSX.utils.book_new(); Object.keys(exportDataObj).forEach(key => { const ws = XLSX.utils.json_to_sheet(exportDataObj[key]); XLSX.utils.book_append_sheet(wb, ws, key); });
    }
    XLSX.writeFile(wb, `${filename}.xlsx`); showNotification('تم تصدير البيانات إلى ملف Excel', 'success');
  } else if (format === 'txt') {
    let txtContent = `${title}\n\n`; txtContent += `تاريخ التصدير: ${moment().format('YYYY-MM-DD')}\n\n`;
    if (Array.isArray(exportDataObj) && exportDataObj.length > 0) {
      const headers = Object.keys(exportDataObj[0]).join('\t'); txtContent += headers + '\n';
      exportDataObj.forEach(item => { txtContent += Object.values(item).join('\t') + '\n'; });
    } else if (typeof exportDataObj === 'object') {
      Object.keys(exportDataObj).forEach(key => {
        txtContent += `\n===== ${key} =====\n\n`;
        const section = exportDataObj[key];
        if (Array.isArray(section) && section.length > 0) {
          const headers = Object.keys(section[0]).join('\t'); txtContent += headers + '\n';
          section.forEach(item => { txtContent += Object.values(item).join('\t') + '\n'; });
        }
      });
    }
    const blob = new Blob([txtContent], { type: 'text/plain' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${filename}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    showNotification('تم تصدير البيانات إلى ملف TXT', 'success');
  }
}

/**
 * بناء تقرير كشف الحساب المتحرك - نموذج جديد احترافي
 * يعرض جميع العمليات بترتيب زمني مع رصيد متحرك بعد كل عملية
 * @param {Object} store - بيانات المحل
 * @param {string} periodText - نص الفترة الزمنية
 * @param {Array} allTransactions - جميع العمليات (مبيعات وتسديدات) مرتبة زمنياً
 * @param {number} previousBalance - الرصيد السابق (قبل الفترة المحددة)
 * @returns {string} كود HTML للتقرير
 */
/**
 * ملاحظة: الدالة buildAccountStatementHTML — وصف تلقائي موجز لوظيفتها.
 * المدخلات: store, periodText, allTransactions, previousBalance = 0
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة buildAccountStatementHTML — وصف تلقائي موجز لوظيفتها.
 * المدخلات: store, periodText, allTransactions, previousBalance = 0
 * المخرجات: راجع التنفيذ
 */
function buildAccountStatementHTML(store, periodText, allTransactions, previousBalance = 0) {
  const settings = getReportSettings();
  
  // التأكد من وجود الدوال المطلوبة
  const formatNumber = window.formatNumber || ((n) => (Number(n)||0).toLocaleString('en-US'));
  const formatDateEn = window.formatDateEn || ((d) => d);
  const getPriceTypeName = window.getPriceTypeName || ((t) => t);
  
  // حساب الرصيد المتحرك
  let runningBalance = previousBalance;
  const transactionsWithBalance = allTransactions.map(t => {
    if (t.type === 'sale') {
      runningBalance += t.amount;
    } else if (t.type === 'payment') {
      runningBalance -= t.amount;
    }
    return { ...t, balance: runningBalance };
  });
  
  // حساب الإجماليات
  const totalDebits = allTransactions.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.amount, 0);
  const totalCredits = allTransactions.filter(t => t.type === 'payment').reduce((sum, t) => sum + t.amount, 0);
  
  // بناء HTML
  let html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <title>${(typeof window!=='undefined' && window.APP_NAME) ? window.APP_NAME : 'فاست لينك - حسابات'} | كشف حساب متحرك - ${store.name}</title>
    <style>
        ${getReportStyles()}
        .report-container {
            background: white;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 1200px;
            margin: 0 auto;
            border-radius: 8px;
        }
        h1 {
            text-align: center;
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 15px;
            margin-bottom: 30px;
        }
        .info-section {
            display: flex;
            justify-content: space-between;
            margin: 20px 0;
            padding: 15px;
            background: #ecf0f1;
            border-radius: 5px;
        }
        .info-section div {
            line-height: 1.8;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 14px;
        }
        th {
            background: #34495e;
            color: white;
            padding: 12px 8px;
            text-align: right;
            font-weight: bold;
            position: sticky;
            top: 0;
            z-index: 10;
        }
        td {
            padding: 10px 8px;
            border-bottom: 1px solid #ddd;
            text-align: right;
        }
        tr:hover {
            background: #f8f9fa;
        }
        .debit { 
            color: #e74c3c; 
            font-weight: bold;
        }
        .credit { 
            color: #27ae60; 
            font-weight: bold;
        }
        /* تمييز المجموعات في نفس اليوم */
        .date-group-header {
            background: #2c3e50 !important;
            color: white !important;
            font-weight: bold;
            text-align: center;
        }
        .date-group-header td {
            padding: 8px;
            border: none;
        }
        .same-day-sale {
            background: #e3f2fd;
        }
        .same-day-payment {
            background: #f3e5f5;
        }
        /* فاصل بين الأيام */
        .day-separator {
            height: 2px;
            background: #bdc3c7;
        }
        .day-separator td {
            padding: 0;
            border: none;
        }
        .balance-positive {
            background: #e8f5e9;
            font-weight: bold;
            color: #2e7d32;
        }
        .balance-negative {
            background: #ffebee;
            font-weight: bold;
            color: #c62828;
        }
        .balance-zero {
            background: #f5f5f5;
            font-weight: bold;
        }
        .summary-row {
            background: #f0f0f0;
            font-weight: bold;
            border-top: 3px double #333;
        }
        .summary-box {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 5px;
            border: 2px solid #3498db;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-top: 15px;
        }
        .print-button {
            background: #2c3e50;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            margin-bottom: 20px;
        }
        .print-button:hover {
            background: #34495e;
        }
        @media print {
            .no-print { display: none; }
            body { 
                background: white; 
                padding: 0;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
            .report-container { 
                box-shadow: none; 
                padding: 20px;
                max-width: 100%;
            }
            table { 
                font-size: 12px;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            th { 
                position: static;
                background: #34495e !important;
                color: white !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            /* الاحتفاظ بألوان الخلايا */
            .debit { 
                color: #e74c3c !important;
                -webkit-print-color-adjust: exact !important;
            }
            .credit { 
                color: #27ae60 !important;
                -webkit-print-color-adjust: exact !important;
            }
            .balance-positive {
                background: #e8f5e9 !important;
                color: #2e7d32 !important;
                -webkit-print-color-adjust: exact !important;
            }
            .balance-negative {
                background: #ffebee !important;
                color: #c62828 !important;
                -webkit-print-color-adjust: exact !important;
            }
            .balance-zero {
                background: #f5f5f5 !important;
                -webkit-print-color-adjust: exact !important;
            }
            .summary-row {
                background: #f0f0f0 !important;
                border-top: 3px double #333 !important;
                -webkit-print-color-adjust: exact !important;
            }
            .info-section {
                background: #ecf0f1 !important;
                -webkit-print-color-adjust: exact !important;
            }
            .summary-box {
                background: #f8f9fa !important;
                border: 2px solid #3498db !important;
                -webkit-print-color-adjust: exact !important;
            }
            tr:hover {
                background: transparent !important;
            }
            /* تأكيد طباعة الحدود */
            table, th, td {
                border: 1px solid #ddd !important;
            }
            h1 {
                color: #2c3e50 !important;
                border-bottom: 3px solid #3498db !important;
                -webkit-print-color-adjust: exact !important;
            }
            /* تمييز المجموعات عند الطباعة */
            .date-group-header {
                background: #2c3e50 !important;
                color: white !important;
                -webkit-print-color-adjust: exact !important;
            }
            .same-day-sale {
                background: #e3f2fd !important;
                -webkit-print-color-adjust: exact !important;
            }
            .same-day-payment {
                background: #f3e5f5 !important;
                -webkit-print-color-adjust: exact !important;
            }
            .day-separator {
                background: #bdc3c7 !important;
                -webkit-print-color-adjust: exact !important;
            }
        }
        /* إعدادات أفضل للطباعة متعددة الصفحات */
        .page-break-before {
            page-break-before: always;
        }
        .page-break-avoid {
            page-break-inside: avoid;
        }
        /* رأس وتذييل الصفحة */
        @page {
            size: A4;
            margin: 15mm;
            @top-center {
                content: "كشف حساب متحرك";
            }
            @bottom-center {
                content: "صفحة " counter(page) " من " counter(pages);
            }
        }
        /* تأكد من عدم قطع الصفوف */
        tr {
            page-break-inside: avoid;
        }
        .date-group-header {
            page-break-after: avoid;
        }
        /* الإجمالي النهائي في آخر صفحة فقط */
        .final-summary {
            page-break-inside: avoid;
        }
    </style>
</head>
<body>
    <div class="report-container">
        <button onclick="window.print()" class="print-button no-print">
            <i class="fas fa-print"></i> طباعة / حفظ كـ PDF
        </button>
        
        ${buildReportHeader('كشف حساب متحرك')}
        
        <div class="info-section">
            <div>
                <strong>اسم المحل:</strong> ${store.name}<br>
                <strong>نوع السعر:</strong> ${getPriceTypeName(store.priceType)}<br>
                ${store.phone ? `<strong>رقم الهاتف:</strong> ${store.phone}` : ''}
            </div>
            <div>
                <strong>الفترة:</strong> ${periodText}<br>
                <strong>تاريخ الطباعة:</strong> ${moment().format(settings.dateFormat)}<br>
                <strong>عدد العمليات:</strong> ${allTransactions.length}
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width:12%">التاريخ</th>
                    <th style="width:35%">البيان</th>
                    <th style="width:13%">مدين</th>
                    <th style="width:13%">دائن</th>
                    <th style="width:15%">الرصيد</th>
                    <th style="width:12%">ملاحظات</th>
                </tr>
            </thead>
            <tbody>`;
  
  // إضافة رصيد سابق إن وجد
  if (previousBalance !== 0) {
    const balanceClass = previousBalance > 0 ? 'balance-positive' : 'balance-negative';
    const balanceText = previousBalance > 0 ? 'دائن' : 'مدين';
    html += `
                <tr>
                    <td>-</td>
                    <td><strong>رصيد سابق مُرحّل</strong></td>
                    <td>-</td>
                    <td>-</td>
                    <td class="${balanceClass}">${formatNumber(Math.abs(previousBalance))} ${balanceText}</td>
                    <td>من الفترة السابقة</td>
                </tr>`;
  }
  
  // إضافة العمليات مع التمييز حسب اليوم
  let currentDate = null;
  let dayTransactionCount = 0;
  
  transactionsWithBalance.forEach((t, index) => {
    const balanceClass = t.balance > 0 ? 'balance-positive' : t.balance < 0 ? 'balance-negative' : 'balance-zero';
    const balanceText = t.balance > 0 ? 'دائن' : t.balance < 0 ? 'مدين' : '';
    
    // إضافة رأس التاريخ وفاصل إذا كان يوم جديد
    if (t.date !== currentDate) {
      // إضافة فاصل بين الأيام (إلا في البداية)
      if (currentDate !== null) {
        html += `<tr class="day-separator"><td colspan="6"></td></tr>`;
      }
      
      currentDate = t.date;
      dayTransactionCount = 0;
      
      // عد العمليات في هذا اليوم
      const sameDayTransactions = transactionsWithBalance.filter(trans => trans.date === currentDate);
      const sameDaySales = sameDayTransactions.filter(trans => trans.type === 'sale').length;
      const sameDayPayments = sameDayTransactions.filter(trans => trans.type === 'payment').length;
      
      // إضافة رأس التاريخ مع عدد العمليات
      html += `
                <tr class="date-group-header">
                    <td colspan="6">
                        📅 ${formatDateEn(t.date)} 
                        &nbsp;&nbsp;|&nbsp;&nbsp; 
                        🛍️ المبيعات: ${sameDaySales} 
                        &nbsp;&nbsp;|&nbsp;&nbsp; 
                        💵 التسديدات: ${sameDayPayments}
                    </td>
                </tr>`;
    }
    
    dayTransactionCount++;
    
    if (t.type === 'sale') {
      const packageName = t.packageName || 'مبلغ مخصص';
      const quantity = t.quantity || 1;
      const rowClass = dayTransactionCount % 2 === 0 ? 'same-day-sale' : '';
      
      html += `
                <tr class="${rowClass}">
                    <td>${dayTransactionCount}</td>
                    <td>🛍️ بيع: ${packageName}${quantity > 1 ? ` (كمية: ${quantity})` : ''}</td>
                    <td class="debit">${formatNumber(t.amount)}</td>
                    <td>-</td>
                    <td class="${balanceClass}">${formatNumber(Math.abs(t.balance))} ${balanceText}</td>
                    <td>${t.notes || ''}</td>
                </tr>`;
    } else if (t.type === 'payment') {
      const rowClass = dayTransactionCount % 2 === 0 ? 'same-day-payment' : '';
      
      html += `
                <tr class="${rowClass}">
                    <td>${dayTransactionCount}</td>
                    <td>💵 تسديد${t.notes ? ': ' + t.notes : ''}</td>
                    <td>-</td>
                    <td class="credit">${formatNumber(t.amount)}</td>
                    <td class="${balanceClass}">${formatNumber(Math.abs(t.balance))} ${balanceText}</td>
                    <td>${t.paymentMethod || 'نقدي'}</td>
                </tr>`;
    }
  });
  
  // صف الإجمالي
  const finalBalance = transactionsWithBalance.length > 0 ? 
    transactionsWithBalance[transactionsWithBalance.length - 1].balance : previousBalance;
  const finalBalanceClass = finalBalance > 0 ? 'balance-positive' : finalBalance < 0 ? 'balance-negative' : 'balance-zero';
  const finalBalanceText = finalBalance > 0 ? 'دائن' : finalBalance < 0 ? 'مدين' : '';
  
  html += `
            </tbody>
        </table>
        
        <!-- الإجمالي النهائي - يظهر فقط في آخر الصفحة الأخيرة -->
        <div class="final-summary" style="margin-top: 30px; page-break-inside: avoid;">
            <table style="width: 100%;">
                <tbody>
                    <tr class="summary-row">
                        <td colspan="2" style="width: 47%;"><strong>الإجمالي النهائي</strong></td>
                        <td class="debit" style="width: 13%;"><strong>${formatNumber(totalDebits)}</strong></td>
                        <td class="credit" style="width: 13%;"><strong>${formatNumber(totalCredits)}</strong></td>
                        <td class="${finalBalanceClass}" style="width: 15%;"><strong>${formatNumber(Math.abs(finalBalance))} ${finalBalanceText}</strong></td>
                        <td style="width: 12%;"></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="summary-box">
            <h3>📊 ملخص الحساب</h3>
            <div class="summary-grid">
                <div>• إجمالي المبيعات: <strong class="currency">${formatNumber(totalDebits)}</strong></div>
                <div>• إجمالي التسديدات: <strong class="currency">${formatNumber(totalCredits)}</strong></div>
                <div>• عدد عمليات البيع: <strong>${allTransactions.filter(t => t.type === 'sale').length}</strong></div>
                <div>• عدد عمليات التسديد: <strong>${allTransactions.filter(t => t.type === 'payment').length}</strong></div>
                <div>• صافي الحركة: <strong class="currency">${formatNumber(totalDebits - totalCredits)}</strong></div>
                <div>• الرصيد النهائي: <strong class="currency">${formatNumber(Math.abs(finalBalance))}</strong> <span>${finalBalanceText}</span></div>
            </div>
        </div>
        
        ${buildReportFooter()}
        
        <script>
        /**
         * ملاحظة: الدالة copyPhoneNumber — وصف تلقائي موجز لوظيفتها.
         * المدخلات: number
         * المخرجات: راجع التنفيذ
         */
        /**
         * ملاحظة: الدالة copyPhoneNumber — وصف تلقائي موجز لوظيفتها.
         * المدخلات: number
         * المخرجات: راجع التنفيذ
         */
        function copyPhoneNumber(number) {
            // نسخ الرقم إلى الحافظة
            navigator.clipboard.writeText(number).then(function() {
                // إظهار إشعار مؤقت
                const notification = document.createElement('div');
                notification.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #4CAF50; color: white; padding: 15px 30px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); z-index: 10000; font-size: 16px; animation: fadeInOut 2s ease-in-out;';
                notification.innerHTML = '✅ تم نسخ الرقم: ' + number;
                document.body.appendChild(notification);
                
                // إضافة الأنيميشن
                const style = document.createElement('style');
                style.textContent = '@keyframes fadeInOut { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); } 20% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 80% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); } }';
                document.head.appendChild(style);
                
                // إزالة الإشعار بعد 2 ثانية
                setTimeout(function() {
                    notification.remove();
                    style.remove();
                }, 2000);
            }).catch(function(err) {
                alert('تعذر نسخ الرقم. يمكنك نسخه يدوياً: ' + number);
            });
        }
        </script>
    </div>
</body>
</html>`;
  
  return html;
}

/**
 * ملاحظة: الدالة buildStoreReportHTML — وصف تلقائي موجز لوظيفتها.
 * المدخلات: store, periodText, mappedSalesForExport, mappedPaymentsForExport, totalSales, totalPayments, remaining
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة buildStoreReportHTML — وصف تلقائي موجز لوظيفتها.
 * المدخلات: store, periodText, mappedSalesForExport, mappedPaymentsForExport, totalSales, totalPayments, remaining
 * المخرجات: راجع التنفيذ
 */
function buildStoreReportHTML(store, periodText, mappedSalesForExport, mappedPaymentsForExport, totalSales, totalPayments, remaining) {
  const settings = getReportSettings();
  
  /**
   * ملاحظة: الدالة buildSalesRows — وصف تلقائي موجز لوظيفتها.
   * المدخلات: بدون
   * المخرجات: راجع التنفيذ
   */
  /**
   * ملاحظة: الدالة buildSalesRows — وصف تلقائي موجز لوظيفتها.
   * المدخلات: بدون
   * المخرجات: راجع التنفيذ
   */
  function buildSalesRows() { 
    let rows = ''; 
    for (const s of mappedSalesForExport) { 
      rows += '<tr>' + 
        '<td>' + s.التاريخ + '</td>' + 
        '<td>' + s.التفاصيل + '</td>' + 
        '<td>' + s.الباقة + '</td>' + 
        '<td>' + s.الكمية_أو_المبلغ + '</td>' + 
        '<td class="currency">' + formatNumber(s.الإجمالي || 0) + '</td>' + 
      '</tr>'; 
    } 
    return rows; 
  }
  
  /**
   * ملاحظة: الدالة buildPaymentRows — وصف تلقائي موجز لوظيفتها.
   * المدخلات: بدون
   * المخرجات: راجع التنفيذ
   */
  /**
   * ملاحظة: الدالة buildPaymentRows — وصف تلقائي موجز لوظيفتها.
   * المدخلات: بدون
   * المخرجات: راجع التنفيذ
   */
  function buildPaymentRows() { 
    let rows = ''; 
    for (const p of mappedPaymentsForExport) { 
      rows += '<tr>' + 
        '<td>' + p.التاريخ + '</td>' + 
        '<td class="currency">' + formatNumber(p.المبلغ || 0) + '</td>' + 
        '<td>' + (p.ملاحظات || '') + '</td>' + 
      '</tr>'; 
    } 
    return rows; 
  }
  
  let html = '';
  html += '<!doctype html><html lang="ar" dir="rtl">';
  html += '<head><meta charset="utf-8"><title>' + ((typeof window!=='undefined' && window.APP_NAME) ? window.APP_NAME : 'فاست لينك - حسابات') + ' | كشف حساب: ' + store.name + '</title>';
  html += '<style>' + getReportStyles() + '</style></head>';
  html += '<body>';
  html += '<div class="actions"><button onclick="window.print()">حفظ التقرير كـ PDF</button></div>';
  
  // رأس التقرير مع معلومات الشركة
  html += buildReportHeader('كشف حساب: ' + store.name);
  
  // معلومات التقرير
  html += '<div style="text-align: center; margin: 15px 0; color: #666;">';
  html += 'الفترة: ' + periodText + ' | تاريخ التصدير: ' + moment().format(settings.dateFormat);
  html += '</div>';
  
  html += '<div class="summary">' + 
    '<div class="box">إجمالي المبيعات: <span class="currency">' + formatNumber(totalSales || 0) + '</span></div>' + 
    '<div class="box">إجمالي التسديدات: <span class="currency">' + formatNumber(totalPayments || 0) + '</span></div>' + 
    '<div class="box">المتبقي: <span class="currency">' + formatNumber(remaining || 0) + '</span></div>' + 
  '</div>';
  
  html += '<h4>المبيعات</h4>';
  if (mappedSalesForExport.length > 0) 
    html += '<table><thead><tr><th>التاريخ</th><th>التفاصيل</th><th>الباقة</th><th>الكمية/المبلغ</th><th>الإجمالي</th></tr></thead><tbody>' + buildSalesRows() + '</tbody></table>'; 
  else 
    html += '<div>لا توجد مبيعات ضمن الفترة</div>';
    
  html += '<h4>التسديدات</h4>';
  if (mappedPaymentsForExport.length > 0) 
    html += '<table><thead><tr><th>التاريخ</th><th>المبلغ</th><th>ملاحظات</th></tr></thead><tbody>' + buildPaymentRows() + '</tbody></table>'; 
  else 
    html += '<div>لا توجد تسديدات ضمن الفترة</div>';
  
  // تذييل التقرير
  html += buildReportFooter();
  
  html += '</body></html>';
  return html;
}

/**
 * ملاحظة: الدالة buildExpensesReportHTML — وصف تلقائي موجز لوظيفتها.
 * المدخلات: expensesRows, periodText
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة buildExpensesReportHTML — وصف تلقائي موجز لوظيفتها.
 * المدخلات: expensesRows, periodText
 * المخرجات: راجع التنفيذ
 */
function buildExpensesReportHTML(expensesRows, periodText) {
  const settings = getReportSettings();
  const currentMonth = moment().format('YYYY-MM');
  
  /**
   * ملاحظة: الدالة getMonthKey — وصف تلقائي موجز لوظيفتها.
   * المدخلات: row
   * المخرجات: راجع التنفيذ
   */
  const getMonthKey = row => {
    const d = String(row['التاريخ'] || '').slice(0, 10);
    const m = moment(d, [moment.ISO_8601, 'YYYY-MM-DD', 'YYYY-M-D'], true);
    return m.isValid() ? m.format('YYYY-MM') : (d.slice(0, 7) || '');
  };
  
  const monthMap = new Map();
  let overallTotal = 0;
  for (const r of expensesRows) {
    const key = getMonthKey(r);
    if (!monthMap.has(key)) monthMap.set(key, []);
    monthMap.get(key).push(r);
    overallTotal += Number(r['المبلغ'] || 0);
  }
  const uniqueMonths = Array.from(monthMap.keys()).filter(k => k);
  const exceedsCurrentMonth = uniqueMonths.length > 1 || (uniqueMonths.length === 1 && uniqueMonths[0] !== currentMonth);

  let html = '';
  html += '<!doctype html><html lang="ar" dir="rtl">';
  html += '<head><meta charset="utf-8"><title>' + ((typeof window!=='undefined' && window.APP_NAME) ? window.APP_NAME : 'فاست لينك - حسابات') + ' | تقرير المصروفات</title>';
  html += '<style>' + getReportStyles() + '</style></head>';
  html += '<body>';
  html += '<div class="actions"><button onclick="window.print()">حفظ التقرير كـ PDF</button></div>';
  
  // رأس التقرير مع معلومات الشركة
  html += buildReportHeader('تقرير المصروفات');
  
  // معلومات التقرير
  html += '<div style="text-align: center; margin: 15px 0; color: #666;">';
  html += 'المدة: ' + periodText + ' | تاريخ التصدير: ' + moment().format(settings.dateFormat);
  html += '</div>';
  
  html += '<div class="summary"><div class="box">إجمالي المصروفات المصدّرة: <span class="currency">' + formatNumber(overallTotal || 0) + '</span></div></div>';

  /**
   * ملاحظة: الدالة renderTable — وصف تلقائي موجز لوظيفتها.
   * المدخلات: rows
   * المخرجات: راجع التنفيذ
   */
  /**
   * ملاحظة: الدالة renderTable — وصف تلقائي موجز لوظيفتها.
   * المدخلات: rows
   * المخرجات: راجع التنفيذ
   */
  const renderTable = (rows) => {
    let s = '<table><thead><tr>' + '<th>التاريخ</th>' + '<th>المبلغ</th>' + '<th>نوع المصروف</th>' + '<th>ملاحظات</th>' + '<th>الحالة</th>' + '</tr></thead><tbody>';
    for (const e of rows) {
      s += '<tr>' + '<td>' + (e['التاريخ'] || '') + '</td>' + '<td class="currency">' + formatNumber(e['المبلغ'] || 0) + '</td>' + '<td>' + (e['نوع المصروف'] || '') + '</td>' + '<td>' + (e['ملاحظات'] || '') + '</td>' + '<td>' + (e['الحالة'] || '') + '</td>' + '</tr>';
    }
    s += '</tbody></table>';
    return s;
  };

  if (exceedsCurrentMonth) {
    const monthsSorted = uniqueMonths.sort();
    monthsSorted.forEach((mKey, idx) => {
      if (idx > 0) html += '<div style="page-break-before: always"></div>';
      const rows = (monthMap.get(mKey) || []).slice().sort((a,b)=> String(a['التاريخ']).localeCompare(String(b['التاريخ'])));
      const monthTotal = rows.reduce((sum, r) => sum + Number(r['المبلغ'] || 0), 0);
      html += '<h4>مصروفات شهر ' + mKey + '</h4>';
      html += '<div class="summary"><div class="box">إجمالي الشهر: <span class="currency">' + formatNumber(monthTotal || 0) + '</span></div></div>';
      html += renderTable(rows);
    });
  } else {
    const rows = expensesRows.slice().sort((a,b)=> String(a['التاريخ']).localeCompare(String(b['التاريخ'])));
    const monthKey = uniqueMonths[0] || '';
    const monthTotal = rows.reduce((sum, r) => sum + Number(r['المبلغ'] || 0), 0);
    if (monthKey) {
      html += '<h4>مصروفات شهر ' + monthKey + '</h4>';
      html += '<div class="summary"><div class="box">إجمالي الشهر: <span class="currency">' + formatNumber(monthTotal || 0) + '</span></div></div>';
    }
    html += renderTable(rows);
  }

    
  // تذييل التقرير
  html += buildReportFooter();

  html += '</body></html>';
  return html;
}

/**
 * ملاحظة: الدالة exportStoreData — وصف تلقائي موجز لوظيفتها.
 * المدخلات: storeId, format
 * المخرجات: راجع التنفيذ
 */
async function exportStoreData(storeId, format) {
  // التأكد من وجود البيانات
  if (!data || typeof data !== 'object') {
    console.warn('البيانات غير متوفرة في exportStoreData');
    showNotification('البيانات غير متوفرة', 'error');
    return;
  }
  const store = data.stores.find(s => (s.id + '') === (storeId + ''));
  if (!store) { showNotification('تعذر تحديد المحل للتصدير', 'error'); return; }
  // استخدام الفلترة النشطة
  let fromDate = '';
  let toDate = '';
  
  // الحصول على الفلترة النشطة إن وجدت
  if (window.storeFilter) {
    const activeFilter = window.storeFilter.getActiveStoreFilter(storeId);
    if (activeFilter) {
      if (activeFilter.type === 'custom') {
        fromDate = activeFilter.data.startDate;
        toDate = activeFilter.data.endDate;
      } else if (activeFilter.type === 'time') {
        const dateRange = window.storeFilter.getDateRangeForQuickFilter(activeFilter.id);
        if (dateRange.startDate) {
          const d = new Date(dateRange.startDate);
          fromDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
        if (dateRange.endDate) {
          const d = new Date(dateRange.endDate);
          toDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
      }
      // للدورات المالية، سيتم معالجتها داخل الفلترة
    }
  }
  const salesAll = (data.sales || []).filter(s => (s.storeId + '') === (storeId + ''));
  const paymentsAll = (data.payments || []).filter(p => (p.storeId + '') === (storeId + ''));
  /**
   * ملاحظة: الدالة parseDate — وصف تلقائي موجز لوظيفتها.
   * المدخلات: d
   * المخرجات: راجع التنفيذ
   */
  /**
   * ملاحظة: الدالة parseDate — وصف تلقائي موجز لوظيفتها.
   * المدخلات: d
   * المخرجات: راجع التنفيذ
   */
  function parseDate(d) {
    if (!d) return null; const m = moment(d, [moment.ISO_8601, 'YYYY-MM-DD', 'YYYY-M-D', 'DD/MM/YYYY', 'D/M/YYYY'], true); if (m.isValid()) return m; const n = new Date(d); return isNaN(n.getTime()) ? null : moment(n);
  }
  /**
   * ملاحظة: الدالة inRange — وصف تلقائي موجز لوظيفتها.
   * المدخلات: d
   * المخرجات: راجع التنفيذ
   */
  /**
   * ملاحظة: الدالة inRange — وصف تلقائي موجز لوظيفتها.
   * المدخلات: d
   * المخرجات: راجع التنفيذ
   */
  function inRange(d) {
    if (!fromDate && !toDate) return true; const md = parseDate(d); if (!md) return true;
    if (fromDate) { const mf = parseDate(fromDate); if (mf && md.isBefore(mf, 'day')) return false; }
    if (toDate) { const mt = parseDate(toDate); if (mt && md.isAfter(mt, 'day')) return false; }
    return true;
  }
  let storeSales = salesAll.filter(s => inRange(s.date));
  let storePayments = paymentsAll.filter(p => inRange(p.date));
  if ((fromDate || toDate) && storeSales.length === 0 && storePayments.length === 0) { storeSales = salesAll.slice(); storePayments = paymentsAll.slice(); }
  const totalSales = storeSales.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalPayments = storePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const remaining = totalSales - totalPayments;
  const packageIdToName = new Map((data.packages || []).map(p => [p.id + '', p.name]));
              // استخدام formatDateEn إذا كانت متاحة، وإلا استخدام التاريخ كما هو
    const formatDate = (typeof formatDateEn === 'function') ? formatDateEn : (d => d || '');
    
    const mappedSalesForExport = storeSales.map(s => ({
      التاريخ: formatDate(s.date),
      التفاصيل: s.reason || (s.packageId ? 'بيع باقة' : 'بيع مخصص'),
      الباقة: s.packageId && s.packageId !== 'custom' ? (packageIdToName.get(s.packageId + '') || 'غير معروف') : 'مخصص',
      الكمية_أو_المبلغ: s.packageId === 'custom' ? s.amount : s.quantity,
      الإجمالي: s.total
    }));
    const mappedPaymentsForExport = storePayments.map(p => ({ التاريخ: formatDate(p.date), المبلغ: p.amount, ملاحظات: p.notes || '' }));
    const filename = `تفاصيل_${store.name.replace(/\s+/g, '_')}_${moment().format('YYYYMMDD')}`;
    const periodText = `${formatDate(fromDate) || 'من البداية'} إلى ${formatDate(toDate) || 'حتى الآن'}`;
  if (format === 'json') {
    const arabic = { المحل: { اسم: store.name, نوع_السعر: getPriceTypeName(store.priceType) }, الفترة: periodText, الملخص: { إجمالي_المبيعات: totalSales, إجمالي_التسديدات: totalPayments, المتبقي: remaining }, المبيعات: mappedSalesForExport, التسديدات: mappedPaymentsForExport };
    // إضافة حقوق الطبع في JSON
    arabic.حقوق_النشر = {
      النظام: 'نظام إدارة المبيعات والمخزون والمصروفات',
      الحقوق: `جميع الحقوق محفوظة © ${new Date().getFullYear()}`,
      المطور: 'م / نجيب المقداد',
      التواصل: '775396439 - 737896431',
      تحذير: 'يُحظر نسخ أو توزيع هذا النظام بدون إذن مسبق'
    };
    const dataStr = JSON.stringify(arabic, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${filename}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    showNotification('تم تصدير بيانات المحل إلى ملف JSON', 'success');
  } else if (format === 'excel') {
    const wb = XLSX.utils.book_new();
    const storeWs = XLSX.utils.json_to_sheet([{ اسم: store.name, نوع_السعر: getPriceTypeName(store.priceType), الفترة: periodText }]); XLSX.utils.book_append_sheet(wb, storeWs, 'المحل');
    const summaryWs = XLSX.utils.json_to_sheet([{ إجمالي_المبيعات: totalSales, إجمالي_التسديدات: totalPayments, المتبقي: remaining }]); XLSX.utils.book_append_sheet(wb, summaryWs, 'الملخص');
    if (mappedSalesForExport.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(mappedSalesForExport), 'المبيعات');
    if (mappedPaymentsForExport.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(mappedPaymentsForExport), 'التسديدات');
    // إضافة ورقة حقوق النشر
    const copyrightData = [{
      '': 'نظام إدارة المبيعات والمخزون والمصروفات',
      ' ': `جميع الحقوق محفوظة © ${new Date().getFullYear()}`,
      '  ': 'تم التطوير بواسطة: م / نجيب المقداد',
      '   ': 'للتواصل: 775396439 - 737896431',
      '    ': 'يُحظر نسخ أو توزيع هذا النظام بدون إذن مسبق'
    }];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(copyrightData), 'حقوق النشر');
    XLSX.writeFile(wb, `${filename}.xlsx`); showNotification('تم تصدير بيانات المحل إلى ملف Excel', 'success');
  } else if (format === 'txt') {
    let txtContent = `تفاصيل المحل: ${store.name}\n\n` + `الفترة: ${periodText}\n` + `إجمالي المبيعات: ${totalSales}\n` + `إجمالي التسديدات: ${totalPayments}\n` + `المتبقي: ${remaining}\n\n` + '===== المبيعات =====\n\n';
    if (mappedSalesForExport.length > 0) {
      txtContent += ['التاريخ', 'التفاصيل', 'الباقة', 'الكمية/المبلغ', 'الإجمالي'].join('\t') + '\n';
      mappedSalesForExport.forEach(s => { txtContent += [s.التاريخ, s.التفاصيل, s.الباقة, s.الكمية_أو_المبلغ, s.الإجمالي].join('\t') + '\n'; });
    } else { txtContent += 'لا توجد مبيعات\n'; }
    txtContent += '\n===== التسديدات =====\n\n';
    if (mappedPaymentsForExport.length > 0) {
      txtContent += ['التاريخ', 'المبلغ', 'ملاحظات'].join('\t') + '\n';
      mappedPaymentsForExport.forEach(p => { txtContent += [p.التاريخ, p.المبلغ, p.ملاحظات].join('\t') + '\n'; });
    } else { txtContent += 'لا توجد تسديدات\n'; }
    // إضافة حقوق النشر
    txtContent += '\n\n' + '='.repeat(50) + '\n';
    txtContent += 'نظام إدارة المبيعات والمخزون والمصروفات\n';
    txtContent += `جميع الحقوق محفوظة © ${new Date().getFullYear()}\n`;
    txtContent += 'تم التطوير بواسطة: م / نجيب المقداد\n';
    txtContent += 'للتواصل: 775396439 - 737896431\n';
    txtContent += 'يُحظر نسخ أو توزيع هذا النظام بدون إذن مسبق\n';
    txtContent += '='.repeat(50) + '\n';
    const blob = new Blob([txtContent], { type: 'text/plain' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${filename}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    showNotification('تم تصدير بيانات المحل إلى ملف TXT', 'success');
  } else if (format === 'printpage' || format === 'pdf') {
    try {
      const html = buildStoreReportHTML(store, periodText, mappedSalesForExport, mappedPaymentsForExport, totalSales, totalPayments, remaining);
      const win = window.open('', '_blank'); if (!win || !win.document) { showNotification('يمنع المتصفح النوافذ المنبثقة. الرجاء السماح بها.', 'error'); return; }
      win.document.open(); win.document.write(html); win.document.close();
      showNotification(format === 'pdf' ? 'تم فتح صفحة الطباعة. اضغط حفظ كـ PDF.' : 'تم فتح صفحة التقرير.', 'success');
    } catch (e) { showNotification(format === 'pdf' ? 'حدث خطأ أثناء إنشاء PDF' : 'تعذر فتح صفحة التقرير', 'error'); }
  } else if (format === 'statement') {
    // كشف الحساب المتحرك الجديد
    try {
      // تحضير جميع العمليات بترتيب زمني
      let allTransactions = [];
      
      // إضافة المبيعات
      storeSales.forEach(sale => {
        const pkg = data.packages.find(p => p.id === sale.packageId);
        allTransactions.push({
          id: sale.id,
          date: sale.date,
          type: 'sale',
          amount: sale.total,
          packageName: pkg ? pkg.name : (sale.packageId === 'custom' ? 'مبلغ مخصص' : 'غير معروف'),
          quantity: sale.quantity || 1,
          notes: sale.reason || ''
        });
      });
      
      // إضافة التسديدات
      storePayments.forEach(payment => {
        allTransactions.push({
          id: payment.id,
          date: payment.date,
          type: 'payment',
          amount: payment.amount,
          notes: payment.notes || '',
          paymentMethod: payment.method || 'نقدي'
        });
      });
      
      // حساب الرصيد السابق إذا كانت هناك فترة محددة
      let previousBalance = 0;
      if (fromDate) {
        const prevSales = salesAll.filter(s => new Date(s.date) < new Date(fromDate));
        const prevPayments = paymentsAll.filter(p => new Date(p.date) < new Date(fromDate));
        const prevTotalSales = prevSales.reduce((sum, s) => sum + s.total, 0);
        const prevTotalPayments = prevPayments.reduce((sum, p) => sum + p.amount, 0);
        previousBalance = prevTotalSales - prevTotalPayments;
      }
      
      // ترتيب حسب التاريخ أولاً
      allTransactions.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
      });
      
      // إعادة ترتيب العمليات في نفس اليوم حسب الرصيد
      const reorderTransactionsByBalance = (transactions, startBalance) => {
        const transactionsByDate = {};
        
        // تجميع العمليات حسب التاريخ
        transactions.forEach(t => {
          const dateKey = t.date;
          if (!transactionsByDate[dateKey]) {
            transactionsByDate[dateKey] = { sales: [], payments: [] };
          }
          if (t.type === 'sale') {
            transactionsByDate[dateKey].sales.push(t);
          } else if (t.type === 'payment') {
            transactionsByDate[dateKey].payments.push(t);
          }
        });
        
        // إعادة بناء قائمة العمليات بالترتيب الصحيح
        const reorderedTransactions = [];
        let currentBalance = startBalance;
        
        Object.keys(transactionsByDate).sort().forEach(date => {
          const dayTransactions = transactionsByDate[date];
          
          // إذا كان هناك رصيد دائن سابق، ضع التسديدات أولاً
          if (currentBalance > 0 && dayTransactions.payments.length > 0) {
            dayTransactions.payments.forEach(payment => {
              reorderedTransactions.push(payment);
              currentBalance -= payment.amount;
            });
            dayTransactions.sales.forEach(sale => {
              reorderedTransactions.push(sale);
              currentBalance += sale.amount;
            });
          } else {
            // وإلا، ضع المبيعات أولاً ثم التسديدات
            dayTransactions.sales.forEach(sale => {
              reorderedTransactions.push(sale);
              currentBalance += sale.amount;
            });
            dayTransactions.payments.forEach(payment => {
              reorderedTransactions.push(payment);
              currentBalance -= payment.amount;
            });
          }
        });
        
        return reorderedTransactions;
      };
      
      // تطبيق إعادة الترتيب بناءً على الرصيد السابق
      allTransactions = reorderTransactionsByBalance(allTransactions, previousBalance);
      
      // بناء التقرير
      const html = buildAccountStatementHTML(store, periodText, allTransactions, previousBalance);
      const win = window.open('', '_blank');
      if (!win || !win.document) {
        showNotification('يمنع المتصفح النوافذ المنبثقة. الرجاء السماح بها.', 'error');
        return;
      }
      win.document.open();
      win.document.write(html);
      win.document.close();
      showNotification('تم فتح كشف الحساب المتحرك', 'success');
    } catch (e) {
      console.error('خطأ في إنشاء كشف الحساب:', e);
      console.error('تفاصيل الخطأ:', {
        message: e.message,
        stack: e.stack,
        store: store,
        transactionsCount: allTransactions.length
      });
      showNotification(`تعذر فتح كشف الحساب المتحرك: ${e.message}`, 'error');
    }
  }
}

/**
 * ملاحظة: الدالة exportExpensesData — وصف تلقائي موجز لوظيفتها.
 * المدخلات: format
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة exportExpensesData — وصف تلقائي موجز لوظيفتها.
 * المدخلات: format
 * المخرجات: راجع التنفيذ
 */
function exportExpensesData(format) {
  const filename = `المصروفات_${moment().format('YYYYMMDD')}`;
  const expList = (window.__getFilteredExpensesForExport ? window.__getFilteredExpensesForExport() : data.expenses);
  const sel = document.getElementById('expensesPeriod');
  const period = sel ? sel.value : 'from_start';
  let from = 'من البداية'; let to = 'حتى الآن';
  if (period === 'day') { from = moment().startOf('day').format('YYYY-MM-DD'); to = moment().format('YYYY-MM-DD'); }
  else if (period === 'week') { from = moment().startOf('week').format('YYYY-MM-DD'); to = moment().format('YYYY-MM-DD'); }
  else if (period === 'month') { from = moment().subtract(1, 'month').add(1, 'day').format('YYYY-MM-DD'); to = moment().format('YYYY-MM-DD'); }
  else if (period === 'this_month') { from = moment().startOf('month').format('YYYY-MM-DD'); to = moment().format('YYYY-MM-DD'); }
  else if (period === 'prev_month') { from = moment().subtract(1,'month').startOf('month').format('YYYY-MM-DD'); to = moment().subtract(1,'month').endOf('month').format('YYYY-MM-DD'); }
  else if (period === 'custom') {
    const f = document.getElementById('expensesFrom'); const t = document.getElementById('expensesTo');
    if (f && f.value) from = f.value; if (t && t.value) to = t.value || to;
  }
  const periodText = `${from} إلى ${to}`;

  const toEn = (s) => (typeof window.toEnglishDigits === 'function' ? window.toEnglishDigits(String(s || '')) : String(s || ''));
  /**
   * ملاحظة: الدالة normalizeDate — وصف تلقائي موجز لوظيفتها.
   * المدخلات: d
   * المخرجات: راجع التنفيذ
   */
  /**
   * ملاحظة: الدالة normalizeDate — وصف تلقائي موجز لوظيفتها.
   * المدخلات: d
   * المخرجات: راجع التنفيذ
   */
  const normalizeDate = (d) => {
    const en = toEn(d).slice(0, 10);
    const m = moment(en, [moment.ISO_8601, 'YYYY-MM-DD', 'YYYY-M-D', 'DD/MM/YYYY', 'D/M/YYYY'], true);
    return m.isValid() ? m.format('YYYY-MM-DD') : en;
  };

  const mapped = expList.map(e => ({
    'المدة': periodText,
    'التاريخ': normalizeDate(e.date),
    'المبلغ': typeof e.amount === 'number' ? e.amount : Number(e.amount) || 0,
    'نوع المصروف': e.type || '',
    'ملاحظات': e.notes || '',
    'الحالة': e.addLater ? 'لاحقًا' : 'مدفوع'
  }));

  // Monthly totals and overall
  const monthTotals = new Map();
  let overallTotal = 0;
  for (const row of mapped) {
    const mKey = (row['التاريخ'] || '').slice(0, 7);
    const amt = Number(row['المبلغ'] || 0);
    overallTotal += amt;
    monthTotals.set(mKey, (monthTotals.get(mKey) || 0) + amt);
  }

  if (format === 'excel') {
    const ws = XLSX.utils.json_to_sheet(mapped, { header: ['المدة','التاريخ','المبلغ','نوع المصروف','ملاحظات','الحالة'] });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'المصروفات');
    const summaryRows = Array.from(monthTotals.entries()).sort(([a],[b]) => a.localeCompare(b)).map(([month, total]) => ({ 'الشهر': month, 'إجمالي المصروفات': total }));
    summaryRows.push({ 'الشهر': 'الإجمالي', 'إجمالي المصروفات': overallTotal });
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows, { header: ['الشهر','إجمالي المصروفات'] });
    XLSX.utils.book_append_sheet(wb, wsSummary, 'الملخص');
    XLSX.writeFile(wb, `${filename}.xlsx`);
    showNotification('تم تصدير المصروفات إلى ملف Excel', 'success');
  } else if (format === 'txt') {
    let txtContent = 'المصروفات\n\n';
    txtContent += `المدة: ${periodText}\n`;
    txtContent += `تاريخ التصدير: ${moment().format('YYYY-MM-DD')}\n\n`;
    if (mapped.length > 0) {
      const headers = ['المدة','التاريخ','المبلغ','نوع المصروف','ملاحظات','الحالة']; txtContent += headers.join('\t') + '\n';
      mapped.forEach(expense => {
        const row = headers.map(h => h === 'المبلغ' ? String(expense[h]) : String(expense[h] || '')).join('\t');
        txtContent += row + '\n';
      });
    } else { txtContent += 'لا توجد مصروفات\n'; }
    txtContent += '\n===== الملخص =====\n\n';
    txtContent += `الإجمالي: ${String(overallTotal)}\n`;
    Array.from(monthTotals.entries()).sort(([a],[b]) => a.localeCompare(b)).forEach(([month, total]) => {
      txtContent += `شهر ${month}: ${String(total)}\n`;
    });
    const blob = new Blob([txtContent], { type: 'text/plain' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${filename}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    showNotification('تم تصدير المصروفات إلى ملف TXT', 'success');
  } else if (format === 'printpage' || format === 'pdf') {
    try {
      const html = buildExpensesReportHTML(mapped, periodText);
      const win = window.open('', '_blank'); if (!win || !win.document) { showNotification('يمنع المتصفح النوافذ المنبثقة. الرجاء السماح بها.', 'error'); return; }
      win.document.open(); win.document.write(html); win.document.close();
      showNotification(format === 'pdf' ? 'تم فتح صفحة الطباعة. اضغط حفظ كـ PDF.' : 'تم فتح صفحة التقرير.', 'success');
    } catch (e) { showNotification(format === 'pdf' ? 'حدث خطأ أثناء إنشاء PDF' : 'تعذر فتح صفحة التقرير', 'error'); }
  } else if (format === 'json') {
    const dataStr = JSON.stringify({ المدة: periodText, المصروفات: mapped, الملخص: { الإجمالي: overallTotal, حسب_الشهر: Object.fromEntries(Array.from(monthTotals.entries())) } }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${filename}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    showNotification('تم تصدير المصروفات إلى ملف JSON', 'success');
  }
}

/**
 * ملاحظة: الدالة generateDebtReportData — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة generateDebtReportData — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
function generateDebtReportData() {
  const { fromDate, toDate } = getPeriodRange();
  return [
    ...data.sales.filter(sale => sale.date >= fromDate && sale.date <= toDate).map(sale => ({ 'النوع': 'بيع', 'المبلغ': sale.total, 'التفاصيل': sale.reason || (sale.packageId ? 'بيع باقة' : 'بيع مخصص'), 'التاريخ': formatDateEn(sale.date) })),
    ...data.expenses.filter(expense => expense.date >= fromDate && expense.date <= toDate).map(expense => ({ 'النوع': 'مصروف', 'المبلغ': expense.amount, 'التفاصيل': expense.type, 'التاريخ': formatDateEn(expense.date) }))
  ];
}

/**
 * ملاحظة: الدالة generateProfitReportData — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة generateProfitReportData — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
function generateProfitReportData(){
  const { fromDate, toDate } = getPeriodRange();
  const sales = data.sales.filter(s=> s.date >= fromDate && s.date <= toDate);
  const expenses = data.expenses.filter(e=> e.date >= fromDate && e.date <= toDate);
  return [
    { 'الوصف': 'إجمالي المبيعات', 'المبلغ': sales.reduce((s, x)=> s + (x.total||0), 0), 'التفاصيل': 'مجموع مبيعات الكروت لجميع المحلات' },
    { 'الوصف': 'إجمالي المصروفات', 'المبلغ': expenses.reduce((s, x)=> s + (x.amount||0), 0), 'التفاصيل': 'مجموع المصروفات المسجلة في النظام' },
    { 'الوصف': 'صافي الربح/الخسارة', 'المبلغ': sales.reduce((s, x)=> s + (x.total||0), 0) - expenses.reduce((s, x)=> s + (x.amount||0), 0), 'التفاصيل': 'الفرق بين إجمالي المبيعات والمصروفات' }
  ];
}

/**
 * ملاحظة: الدالة generatePartnerReportData — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة generatePartnerReportData — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
function generatePartnerReportData() {
  const { fromDate, toDate } = getPeriodRange();
  return [
    ...data.sales.filter(sale => sale.date >= fromDate && sale.date <= toDate).map(sale => ({ 'النوع': 'بيع', 'المبلغ': sale.total, 'التفاصيل': sale.reason || (sale.packageId ? 'بيع باقة' : 'بيع مخصص'), 'التاريخ': sale.date })),
    ...data.expenses.filter(expense => expense.date >= fromDate && expense.date <= toDate).map(expense => ({ 'النوع': 'مصروف', 'المبلغ': expense.amount, 'التفاصيل': expense.type, 'التاريخ': expense.date }))
  ];
}

/**
 * ملاحظة: الدالة getPeriodRange — وصف تلقائي موجز لوظيفتها.
 * المدخلات: reportType
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة getPeriodRange — وصف تلقائي موجز لوظيفتها.
 * المدخلات: reportType
 * المخرجات: راجع التنفيذ
 */
function getPeriodRange(reportType) {
  try {
    if (typeof PeriodManager!=='undefined' && PeriodManager.getDateRange) {
      const r = PeriodManager.getDateRange();
      return { fromDate: r.from, toDate: r.to };
    }
  } catch(_) {}
  // مسار سابق للتوافق
  if (reportType) {
    const periodSelect = document.getElementById(`${reportType}Period`);
    const period = periodSelect ? periodSelect.value : 'this_month';
    if (period === 'custom') {
      const fromDate = document.getElementById(`${reportType}FromDate`)?.value || moment().startOf('month').format('YYYY-MM-DD');
      const toDate = document.getElementById(`${reportType}ToDate`)?.value || moment().format('YYYY-MM-DD');
      return { fromDate, toDate };
    }
    return getPeriodRangeByValue(period);
  }
  const f = document.getElementById('reportFromDate');
  const t = document.getElementById('reportToDate');
  const fromDate = formatDateEn((f && f.value) || moment().startOf('month').format('YYYY-MM-DD'));
  const toDate = formatDateEn((t && t.value) || moment().format('YYYY-MM-DD'));
  return { fromDate, toDate };
}

/**
 * ملاحظة: الدالة inPeriod — وصف تلقائي موجز لوظيفتها.
 * المدخلات: dateStr, fromDate, toDate
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة inPeriod — وصف تلقائي موجز لوظيفتها.
 * المدخلات: dateStr, fromDate, toDate
 * المخرجات: راجع التنفيذ
 */
function inPeriod(dateStr, fromDate, toDate){
  const d = formatDateEn(dateStr);
  return d >= fromDate && d <= toDate;
}

/**
 * ملاحظة: الدالة renderQuickSummaries — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة renderQuickSummaries — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
function renderQuickSummaries(){
  const salesCanvas = document.getElementById('chartSales');
  const paymentsCanvas = document.getElementById('chartPayments');
  const expensesCanvas = document.getElementById('chartExpenses');
  if (!salesCanvas || !paymentsCanvas || !expensesCanvas) return;
  
  // التأكد من وجود البيانات
  if (!data || typeof data !== 'object') {
    console.warn('البيانات غير متوفرة في renderQuickSummaries');
    return;
  }
  const rSumm = (typeof PeriodManager!=='undefined' && PeriodManager.getDateRange) ? PeriodManager.getDateRange() : (typeof getPeriodRange==='function' ? getPeriodRange('summaries') : {fromDate: moment().startOf('month').format('YYYY-MM-DD'), toDate: moment().format('YYYY-MM-DD')});
  const fromDate = rSumm.from || rSumm.fromDate; const toDate = rSumm.to || rSumm.toDate;
  const end = moment(toDate);
  let start = moment(fromDate);
  // احمِ الأداء: في حال كانت الفترة طويلة جدًا، اعرض آخر 365 يومًا فقط
  if (end.diff(start, 'days') > 365) start = end.clone().subtract(365, 'days');
  const days = [];
  let cursor = start.clone();
  while (cursor.isSameOrBefore(end,'day')) { days.push(cursor.format('YYYY-MM-DD')); cursor = cursor.clone().add(1,'day'); }
  /**
   * ملاحظة: الدالة aggregateDaily — وصف تلقائي موجز لوظيفتها.
   * المدخلات: arr, getDate, getAmount
   * المخرجات: راجع التنفيذ
   */
  /**
   * ملاحظة: الدالة aggregateDaily — وصف تلقائي موجز لوظيفتها.
   * المدخلات: arr, getDate, getAmount
   * المخرجات: راجع التنفيذ
   */
  function aggregateDaily(arr, getDate, getAmount){
    const map = new Map(days.map(d=>[d,0]));
    for (const item of arr){
      const d = formatDateEn(getDate(item));
      if (d>=days[0] && d<=days[days.length-1]) map.set(d, (map.get(d)||0) + (Number(getAmount(item))||0));
    }
    return days.map(d=> map.get(d)||0);
  }
  const sales = (data.sales || []).filter(s=> inPeriod(s.date, days[0], days[days.length-1]) && isStoreMatch(s));
  const payments = (data.payments || []).filter(p=> inPeriod(p.date, days[0], days[days.length-1]) && isStoreMatch(p));
  const expenses = (data.expenses || []).filter(e=> inPeriod(e.date, days[0], days[days.length-1]) && isStoreMatch(e));
  const salesSeries = aggregateDaily(sales, s=>s.date, s=>s.total||0);
  const paymentsSeries = aggregateDaily(payments, p=>p.date, p=>p.amount||0);
  const expensesSeries = aggregateDaily(expenses, e=>e.date, e=>e.amount||0);
  const totals = { sales: salesSeries.reduce((a,b)=>a+b,0), payments: paymentsSeries.reduce((a,b)=>a+b,0), expenses: expensesSeries.reduce((a,b)=>a+b,0) };
  const qs = document.getElementById('quickSalesTotal'); if (qs) qs.textContent = formatNumber(totals.sales);
  const qp = document.getElementById('quickPaymentsTotal'); if (qp) qp.textContent = formatNumber(totals.payments);
  const qe = document.getElementById('quickExpensesTotal'); if (qe) qe.textContent = formatNumber(totals.expenses);
  /**
   * ملاحظة: الدالة drawSpark — وصف تلقائي موجز لوظيفتها.
   * المدخلات: canvas, series, color
   * المخرجات: راجع التنفيذ
   */
  /**
   * ملاحظة: الدالة drawSpark — وصف تلقائي موجز لوظيفتها.
   * المدخلات: canvas, series, color
   * المخرجات: راجع التنفيذ
   */
  function drawSpark(canvas, series, color){
    const ctx = canvas.getContext('2d');
    const w = canvas.clientWidth || canvas.width; const h = canvas.height;
    canvas.width = w; canvas.height = h;
    ctx.clearRect(0,0,w,h);
    const max = Math.max(1, ...series);
    const min = Math.min(0, ...series);
    const pad = 6;
    const xStep = series.length>1 ? (w - pad*2) / (series.length - 1) : 0;
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
    series.forEach((v,i)=>{
      const x = pad + i * xStep;
      const y = h - pad - ((v - min) / (max - min || 1)) * (h - pad*2);
      if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.stroke();
  }
  drawSpark(salesCanvas, salesSeries, '#2ecc71');
  drawSpark(paymentsCanvas, paymentsSeries, '#3498db');
  drawSpark(expensesCanvas, expensesSeries, '#e74c3c');
}

// re-render quick summaries on relevant events
window.addEventListener('resize', ()=>{ renderQuickSummaries(); });

/**
 * ملاحظة: الدالة renderComparisonReport — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة renderComparisonReport — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
function renderComparisonReport(){
  const table = document.getElementById('comparisonReportTable'); if (!table) return;
  const sub = document.getElementById('comparisonReportSubtitle');

  const now = moment();
  const thisFrom = now.clone().startOf('month').format('YYYY-MM-DD');
  const thisTo = now.clone().endOf('month').format('YYYY-MM-DD');
  const prevFrom = now.clone().subtract(1,'month').startOf('month').format('YYYY-MM-DD');
  const prevTo = now.clone().subtract(1,'month').endOf('month').format('YYYY-MM-DD');
  function inRange(d, f, t){ const dd = formatDateEn(d); return dd>=f && dd<=t; }
  function byStore(x){ if (storeFilter==='all') return true; return String(x.storeId||'') === String(storeFilter); }
  const salesThis = data.sales.filter(s=> inRange(s.date,thisFrom,thisTo) && byStore(s));
  const salesPrev = data.sales.filter(s=> inRange(s.date,prevFrom,prevTo) && byStore(s));
  const paysThis = data.payments.filter(p=> inRange(p.date,thisFrom,thisTo) && byStore(p));
  const paysPrev = data.payments.filter(p=> inRange(p.date,prevFrom,prevTo) && byStore(p));
  const expsThis = data.expenses.filter(e=> inRange(e.date,thisFrom,thisTo) && byStore(e));
  const expsPrev = data.expenses.filter(e=> inRange(e.date,prevFrom,prevTo) && byStore(e));
  const totals = (arr, field)=> arr.reduce((s,x)=> s + (Number(x[field]||0)), 0);
  const thisSales = totals(salesThis,'total'); const prevSales = totals(salesPrev,'total');
  const thisPayments = totals(paysThis,'amount'); const prevPayments = totals(paysPrev,'amount');
  const thisExpenses = totals(expsThis,'amount'); const prevExpenses = totals(expsPrev,'amount');
  const thisProfit = thisSales - thisExpenses; const prevProfit = prevSales - prevExpenses;
  const rows = [
    { k:'المبيعات', a:thisSales, b:prevSales },
    { k:'التسديدات', a:thisPayments, b:prevPayments },
    { k:'المصروفات', a:thisExpenses, b:prevExpenses },
    { k:'الربح', a:thisProfit, b:prevProfit },
  ];
  function diff(a,b){ return a-b; }
  function rate(a,b){ if (b===0) return a===0?0:100; return ((a-b)/Math.abs(b))*100; }
  if (sub) sub.textContent = `الفترة: ${thisFrom} إلى ${thisTo} مقارنة بـ ${prevFrom} إلى ${prevTo}${storeFilter!=='all' ? ' | المحل: ' + ((data.stores.find(s=> String(s.id)===String(storeFilter))||{}).name||'') : ''}`;
  table.innerHTML = rows.map(r=>{
    const d = diff(r.a,r.b); const pct = rate(r.a,r.b);
    return `<tr><td>${r.k}</td><td class="currency">${formatNumber(r.a)}</td><td class="currency">${formatNumber(r.b)}</td><td class="currency ${d<0?'text-danger':'text-success'}">${formatNumber(d)}</td><td>${pct.toFixed(1)}%</td></tr>`;
  }).join('');
}

/**
 * ملاحظة: الدالة getPartnersPeriodRange — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة getPartnersPeriodRange — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
function getPartnersPeriodRange(){
  const sel = document.getElementById('partnersPeriod');
  const f = document.getElementById('partnersFromDate');
  const t = document.getElementById('partnersToDate');
  const period = sel ? sel.value : 'this_month';
  let fromDate, toDate;
  if (period === 'from_start') {
    // احسب أقدم تاريخ فعلي من البيانات بدل 0000-01-01
    let earliest = null;
    try {
      const collect = [];
      (data && Array.isArray(data.sales) ? data.sales : []).forEach(s=>{ const d = formatDateEn(s.date); if (d) collect.push(d); });
      (data && Array.isArray(data.payments) ? data.payments : []).forEach(p=>{ const d = formatDateEn(p.date); if (d) collect.push(d); });
      (data && Array.isArray(data.expenses) ? data.expenses : []).forEach(e=>{ const d = formatDateEn(e.date); if (d) collect.push(d); });
      collect.sort();
      earliest = collect.length ? collect[0] : null;
    } catch(_) {}
    fromDate = earliest || moment().startOf('year').format('YYYY-MM-DD');
    toDate = moment().format('YYYY-MM-DD');
    return { fromDate, toDate, text: `من البداية إلى ${toDate}` };
  }
  else if (period === 'day') { fromDate = moment().startOf('day').format('YYYY-MM-DD'); toDate = moment().format('YYYY-MM-DD'); }
  else if (period === 'week') { fromDate = moment().startOf('week').format('YYYY-MM-DD'); toDate = moment().format('YYYY-MM-DD'); }
  else if (period === 'month') { fromDate = moment().subtract(1,'month').add(1,'day').format('YYYY-MM-DD'); toDate = moment().format('YYYY-MM-DD'); }
  else if (period === 'this_month') { fromDate = moment().startOf('month').format('YYYY-MM-DD'); toDate = moment().format('YYYY-MM-DD'); }
  else if (period === 'prev_month') { fromDate = moment().subtract(1,'month').startOf('month').format('YYYY-MM-DD'); toDate = moment().subtract(1,'month').endOf('month').format('YYYY-MM-DD'); }
  else { fromDate = formatDateEn((f && f.value) || moment().startOf('month').format('YYYY-MM-DD')); toDate = formatDateEn((t && t.value) || moment().format('YYYY-MM-DD')); }
  return { fromDate, toDate, text: `${fromDate} إلى ${toDate}` };
}

function getPartnersCount(){ try{ if (typeof AppSettings!=='undefined'){ const c = AppSettings.getAll().reports?.partners?.count; if (c && c>0) return c; } }catch(_){} const el = document.getElementById('partnersCount'); const n = parseInt(el && el.value, 10); return isNaN(n) || n<1 ? 1 : n; }

/**
 * ملاحظة: الدالة exportPartners — وصف تلقائي موجز لوظيفتها.
 * المدخلات: format
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة exportPartners — وصف تلقائي موجز لوظيفتها.
 * المدخلات: format
 * المخرجات: راجع التنفيذ
 */
function exportPartners(format){
  const { fromDate, toDate, text } = getPartnersPeriodRange();
  const byStore = x => true; // لا توجد فلاتر بعد الآن
  const pays = data.payments.filter(p=> inPeriod(p.date, fromDate, toDate) && byStore(p));
  const exps = data.expenses.filter(e=> inPeriod(e.date, fromDate, toDate) && byStore(e));
  const totalPays = pays.reduce((s,x)=> s + (Number(x.amount)||0), 0);
  const totalExps = exps.reduce((s,x)=> s + (Number(x.amount)||0), 0);
  const net = totalPays - totalExps;
  const partners = getPartnersCount();
  const perPartner = net / partners;
  const listPays = pays.map(p=> ({ التاريخ: formatDateEn(p.date), المحل: (data.stores.find(s=>s.id===p.storeId)?.name)||'', المبلغ: Number(p.amount)||0, ملاحظات: p.notes||'' }));
  const listExps = exps.map(e=> ({ التاريخ: formatDateEn(e.date), النوع: e.type||'', المبلغ: Number(e.amount)||0, ملاحظات: e.notes||'' }));
  // تكوين بيانات الشركاء والسحوبات للفترة
  const partnersCfg = (typeof AppSettings!=='undefined') ? (AppSettings.getAll().reports?.partners||{}) : {};
  const partnersList = Array.isArray(partnersCfg.list) ? partnersCfg.list : [];
  const distribution = partnersCfg.distribution || 'equal';
  const carryover = partnersCfg.carryover || {};
  const adjustments = Array.isArray(partnersCfg.adjustmentsAll) ? partnersCfg.adjustmentsAll.filter(a=> inPeriod(a.date, fromDate, toDate)) : [];
  let baseShares = [];
  if (distribution === 'percent' && partnersList.length && partnersList.some(p=>p.sharePercent)) {
    const totalPercent = partnersList.reduce((s,p)=> s + (parseFloat(p.sharePercent)||0), 0) || 100;
    baseShares = partnersList.map(p=> ({ id: p.id, name: p.name, base: (net * ((parseFloat(p.sharePercent)||0) / totalPercent)) }));
  } else {
    const per = partners>0 ? net / partners : net;
    baseShares = (partnersList.length ? partnersList : Array.from({length: partners}).map((_,i)=> ({ id:`p${i+1}`, name:`الشريك ${i+1}`})))
      .map(p=> ({ id: p.id, name: p.name, base: per }));
  }
  const withdrawalsByPartner = {};
  adjustments.forEach(adj => { const pid = adj.partnerId; const amt = Number(adj.amount)||0; withdrawalsByPartner[pid] = (withdrawalsByPartner[pid]||0) + amt; });
  const partnerSharesRows = baseShares.map(p=>{
    const w = withdrawalsByPartner[p.id]||0; const co = Number(carryover[p.id]||0); const final = (p.base - w + co);
    const distLabel = distribution==='percent' && partnersList.some(x=>x.id===p.id && x.sharePercent!=null) ? `${(partnersList.find(x=>x.id===p.id)?.sharePercent)||0}%` : 'متساوٍ';
    const status = final < 0 ? 'عليه' : 'له';
    return { الشريك: p.name||'', التوزيع: distLabel, النصيب_الأساسي: p.base, السحوبات: w, الترحيل: co, الصافي: Math.abs(final), الوضع: status };
  });
  if (format==='excel'){
    const wb = XLSX.utils.book_new();
    const meta = [{ المدة: text, عدد_الشركاء: partners, إجمالي_التسديدات: totalPays, إجمالي_المصروفات: totalExps, صافي_الأرباح: net, صافي_لكل_شريك: perPartner }];
    // ترتيب الأوراق: سحوبات الشركاء -> صافي الشركاء -> الملخص -> التسديدات -> المصروفات
    // الملخص أولاً
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(meta), 'الملخص');
    // ثم سحوبات الشركاء
    if (adjustments.length) {
      const partnersMap = (partnersList||[]).reduce((m,p)=>{ m[p.id]=p.name||p.id; return m; },{});
      const adjSheet = adjustments.map(a=> ({ الشريك: partnersMap[a.partnerId]||a.partnerId, المبلغ: a.amount, التاريخ: a.date, ملاحظات: a.notes||'' }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(adjSheet), 'سحوبات الشركاء');
    }
    // ثم صافي الشركاء
    if (partnerSharesRows.length) {
      const sharesSheet = partnerSharesRows.map(r=> ({ الشريك:r.الشريك, التوزيع:r.التوزيع, النصيب_الأساسي:r.النصيب_الأساسي, السحوبات:r.السحوبات, الترحيل:r.الترحيل, الصافي:r.الصافي, الوضع:r.الوضع }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sharesSheet), 'صافي الشركاء');
    }
    if (listPays.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(listPays), 'التسديدات');
    if (listExps.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(listExps), 'المصروفات');
    XLSX.writeFile(wb, `تقرير_الشركاء_${moment().format('YYYYMMDD')}.xlsx`);
    showNotification('تم التصدير إلى Excel', 'success');
  } else if (format==='txt'){
    let txt = `تقرير الشركاء\n\nالمدة: ${text}\nعدد الشركاء: ${partners}\n`;
    if (adjustments.length){ txt += '\n===== سحوبات الشركاء =====\n'; txt += ['الشريك','المبلغ','التاريخ','ملاحظات'].join('\t')+'\n'; const partnersMap = (partnersList||[]).reduce((m,p)=>{ m[p.id]=p.name||p.id; return m; },{}); adjustments.forEach(a=>{ txt += [(partnersMap[a.partnerId]||a.partnerId), a.amount, a.date, a.notes||''].join('\t')+'\n'; }); }
    if (partnerSharesRows.length){ txt += '\n===== صافي الشركاء =====\n'; txt += ['الشريك','التوزيع','النصيب الأساسي','السحوبات','الترحيل','الصافي','الوضع'].join('\t')+'\n'; partnerSharesRows.forEach(r=>{ txt += [r.الشريك, r.التوزيع, r.النصيب_الأساسي, r.السحوبات, r.الترحيل, r.الصافي, r.الوضع].join('\t')+'\n'; }); }
    txt += `\n===== الملخص =====\nإجمالي التسديدات:\t${totalPays}\nإجمالي المصروفات:\t${totalExps}\nصافي الأرباح:\t${net}\nصافي لكل شريك:\t${perPartner}\n`;
    if (listPays.length){ txt += '\n===== التسديدات =====\n'; txt += ['التاريخ','المحل','المبلغ','ملاحظات'].join('\t')+'\n'; listPays.forEach(r=>{ txt += [r.التاريخ, r.المحل, r.المبلغ, r.ملاحظات].join('\t')+'\n'; }); }
    if (listExps.length){ txt += '\n===== المصروفات =====\n'; txt += ['التاريخ','النوع','المبلغ','ملاحظات'].join('\t')+'\n'; listExps.forEach(r=>{ txt += [r.التاريخ, r.النوع, r.المبلغ, r.ملاحظات].join('\t')+'\n'; }); }
    const blob = new Blob([txt], { type:'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=`تقرير_الشركاء_${moment().format('YYYYMMDD')}.txt`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    showNotification('تم التصدير إلى مستند نصي', 'success');
  } else if (format==='pdf' || format==='print'){
    try {
      const partnerSharesRows = (function(){
        const shares = [];
        const cfgList = partnersList||[];
        const distribution = (AppSettings.getAll().reports?.partners?.distribution)||'equal';
        const carryover = (AppSettings.getAll().reports?.partners?.carryover)||{};
        const withdrawalsByPartner = {}; adjustments.forEach(adj => { const pid = adj.partnerId; const amt = Number(adj.amount)||0; withdrawalsByPartner[pid] = (withdrawalsByPartner[pid]||0) + amt; });
        const hasPercent = distribution==='percent' && cfgList.length && cfgList.some(p=>p.sharePercent!=null);
        const totalPercent = hasPercent ? cfgList.reduce((s,p)=> s+(parseFloat(p.sharePercent)||0),0)||100 : 100;
        const per = partners>0 ? net/partners : net;
        (cfgList.length?cfgList:Array.from({length:partners}).map((_,i)=>({id:`p${i+1}`,name:`الشريك ${i+1}`}))).forEach(p=>{
          const base = hasPercent ? (net * ((parseFloat(p.sharePercent)||0)/totalPercent)) : per;
          const w = withdrawalsByPartner[p.id]||0; const co = Number(carryover[p.id]||0); const final = base - w + co;
          const distLabel = hasPercent ? `${(p.sharePercent||0)}%` : 'متساوٍ';
          shares.push({ الشريك:p.name||'', التوزيع:distLabel, النصيب_الأساسي:base, السحوبات:w, الترحيل:co, الصافي:Math.abs(final), الوضع: final<0?'عليه':'له' });
        });
        return shares;
      })();
      // حساب بيانات الأشهر إن كانت الفترة تغطي أكثر من شهر (تجميع سريع بدون حلقة عبر آلاف الأشهر)
      let monthsData = [];
      try {
        const cfgAll = (typeof AppSettings!=='undefined') ? (AppSettings.getAll().reports?.partners||{}) : {};
        const adjAll = Array.isArray(cfgAll.adjustmentsAll) ? cfgAll.adjustmentsAll : [];
        const paysIn = (data.payments||[]).filter(p=> inPeriod(p.date, fromDate, toDate));
        const expsIn = (data.expenses||[]).filter(e=> inPeriod(e.date, fromDate, toDate));
        const adjsIn = adjAll.filter(a=> inPeriod(a.date, fromDate, toDate));
        const monthMap = new Map(); // key YYYY-MM -> {pays:[], exps:[], adjs:[]}
        const keyOf = (d)=>{ const s = formatDateEn(d); return s ? s.slice(0,7) : ''; };
        paysIn.forEach(p=>{ const k=keyOf(p.date); if(!k) return; const o=monthMap.get(k)||{pays:[],exps:[],adjs:[]}; o.pays.push(p); monthMap.set(k,o); });
        expsIn.forEach(e=>{ const k=keyOf(e.date); if(!k) return; const o=monthMap.get(k)||{pays:[],exps:[],adjs:[]}; o.exps.push(e); monthMap.set(k,o); });
        adjsIn.forEach(a=>{ const k=keyOf(a.date); if(!k) return; const o=monthMap.get(k)||{pays:[],exps:[],adjs:[]}; o.adjs.push(a); monthMap.set(k,o); });
        let keys = Array.from(monthMap.keys());
        // أضف الأشهر الناقصة ضمن المدى الزمني حتى لو لا توجد بيانات
        const MAX_MONTHS = 36;
        const startM = moment(fromDate, 'YYYY-MM-DD').startOf('month');
        const endM = moment(toDate, 'YYYY-MM-DD').startOf('month');
        const monthsDiff = Math.max(0, endM.diff(startM, 'months'));
        for (let i=0; i<=monthsDiff && i<MAX_MONTHS; i++) {
          const k = startM.clone().add(i,'months').format('YYYY-MM');
          if (!keys.includes(k)) keys.push(k);
        }
        keys.sort();
        if (keys.length > MAX_MONTHS) keys = keys.slice(-MAX_MONTHS);
        keys.forEach(k=>{
          const o = monthMap.get(k) || {pays:[],exps:[],adjs:[]};
          const mTotalPays = o.pays.reduce((s,x)=> s + (Number(x.amount)||0), 0);
          const mTotalExps = o.exps.reduce((s,x)=> s + (Number(x.amount)||0), 0);
          const mNet = mTotalPays - mTotalExps;
          const mWithdrawalsByPartner = {};
          o.adjs.forEach(adj=>{ const pid=adj.partnerId; const amt=Number(adj.amount)||0; mWithdrawalsByPartner[pid]=(mWithdrawalsByPartner[pid]||0)+amt; });
          const hasPercentM = (AppSettings.getAll().reports?.partners?.distribution)==='percent' && (partnersList||[]).some(p=>p.sharePercent!=null);
          const totalPercent = hasPercentM ? (partnersList||[]).reduce((s,p)=> s+(parseFloat(p.sharePercent)||0),0)||100 : 100;
          const perM = partners>0 ? mNet/partners : mNet;
          const mPartnerShares = (partnersList.length?partnersList:Array.from({length:partners}).map((_,i)=>({id:`p${i+1}`,name:`الشريك ${i+1}`}))).map(p=>{
            const base = hasPercentM ? (mNet * ((parseFloat(p.sharePercent)||0)/totalPercent)) : perM;
            const w = mWithdrawalsByPartner[p.id]||0; const co = 0; const final = base - w + co;
            return { الشريك: p.name||'', التوزيع: hasPercentM ? `${p.sharePercent||0}%` : 'متساوٍ', النصيب_الأساسي: base, السحوبات: w, الترحيل: co, الصافي: Math.abs(final), الوضع: final<0?'عليه':'له' };
          });
          const m = moment(k, 'YYYY-MM');
          const label = 'شهر ' + m.format('M') + ' (' + m.locale('ar').format('MMMM') + ') ' + m.format('YYYY');
          const monthListPays = o.pays.map(p=> ({ التاريخ: formatDateEn(p.date), المحل: (data.stores.find(s=>s.id===p.storeId)?.name)||'', المبلغ: Number(p.amount)||0, ملاحظات: p.notes||'' }));
          const monthListExps = o.exps.map(e=> ({ التاريخ: formatDateEn(e.date), النوع: e.type||'', المبلغ: Number(e.amount)||0, ملاحظات: e.notes||'' }));
          const mTotalWithdrawals = o.adjs.reduce((s,a)=> s + (Number(a.amount)||0), 0);
          monthsData.push({ label, totalPays: mTotalPays, totalExps: mTotalExps, totalWithdrawals: mTotalWithdrawals, partnerShares: mPartnerShares, listPays: monthListPays, listExps: monthListExps, adjustments: o.adjs });
        });
      } catch(_) {}
      const html = buildPartnerReportHTML(text, partners, listPays, listExps, totalPays, totalExps, net, perPartner, adjustments, partnersList, partnerSharesRows, monthsData);
      const win = window.open('', '_blank'); if (!win || !win.document) { showNotification('يمنع المتصفح النوافذ المنبثقة. الرجاء السماح بها.', 'error'); return; }
      win.document.open(); win.document.write(html); win.document.close();
      showNotification(format==='pdf' ? 'تم فتح صفحة الطباعة. اضغط حفظ كـ PDF.' : 'تم فتح صفحة التقرير.', 'success');
    } catch (e) {
      try { console.error('Partner report print error:', e); } catch(_) {}
      try { const w = window.open('', '_blank'); if (w && w.document) { w.document.open(); w.document.write('<pre style="direction:ltr;white-space:pre-wrap;font:12px/1.4 monospace">'+ (e && e.stack ? e.stack : (''+e)) +'</pre>'); w.document.close(); } } catch(_) {}
      showNotification(format==='pdf' ? 'حدث خطأ أثناء إنشاء PDF' : 'تعذر فتح صفحة التقرير', 'error');
    }
  }
}

/**
 * ملاحظة: الدالة wirePartnerExports — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة wirePartnerExports — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
function wirePartnerExports(){
  const excelBtn = document.getElementById('exportPartnersExcel');
  const txtBtn = document.getElementById('exportPartnersTxt');
  const pdfBtn = document.getElementById('exportPartnersPdf');
  const printBtn = document.getElementById('openPartnersReport');
  if (excelBtn && !excelBtn.dataset._wired) { excelBtn.addEventListener('click', ()=> exportPartners('excel')); excelBtn.dataset._wired='1'; }
  if (txtBtn && !txtBtn.dataset._wired) { txtBtn.addEventListener('click', ()=> exportPartners('txt')); txtBtn.dataset._wired='1'; }
  if (pdfBtn && !pdfBtn.dataset._wired) { pdfBtn.addEventListener('click', ()=> exportPartners('pdf')); pdfBtn.dataset._wired='1'; }
  if (printBtn && !printBtn.dataset._wired) { printBtn.addEventListener('click', ()=> exportPartners('print')); printBtn.dataset._wired='1'; }
}

// Lazy rendering state for detailed reports
const renderedEntities = new Set();

/**
 * ملاحظة: الدالة renderReportsAccordingToSelection — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة renderReportsAccordingToSelection — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
function renderReportsAccordingToSelection(){
  const sel = document.getElementById('reportsSectionFilter');
  const section = sel ? sel.value : 'payments';
  
  // هذه الدالة كانت تستدعي renderDetailedReport التي لم تعد موجودة
  // حالياً لا تفعل شيئاً لأن التقارير التفصيلية غير متوفرة
  console.log('تم اختيار القسم:', section);
}

/**
 * ملاحظة: الدالة setupReportsLazyObserver — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة setupReportsLazyObserver — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
function setupReportsLazyObserver(){
  // هذه الدالة كانت تستخدم IntersectionObserver لتحميل التقارير عند الحاجة
  // حالياً معطلة لأن renderDetailedReport غير موجودة
  return;
}

/**
 * ملاحظة: الدالة __populateReportsStores — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة __populateReportsStores — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
function __populateReportsStores(){
	// لا حاجة لهذه الدالة بعد حذف الفلاتر
	return;
}

/**
 * ملاحظة: الدالة __syncReportsCustomVisibility — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة __syncReportsCustomVisibility — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
function __syncReportsCustomVisibility(){
	// لا حاجة لهذه الدالة بعد حذف الفلاتر
	return;
}

/**
 * ملاحظة: الدالة __reRenderReports — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة __reRenderReports — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
function __reRenderReports(){
	try {
		updateProfitReport();
		generateDebtReport();
		generatePartnerReports();
		renderQuickSummaries();
		renderComparisonReport();
	} catch(_) {}
}

/**
 * ملاحظة: الدالة initReportsControls — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة initReportsControls — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
function initReportsControls(){
	// لا حاجة لمعالجات الأحداث بعد حذف الفلاتر
	__reRenderReports();
}

// دوال تصدير التقارير الإضافية
/**
 * تصدير الملخصات المرئية بصيغ مختلفة
 * يدعم: Excel, TXT, PDF (صفحة طباعة), Print
 * ملاحظة: PDF لا ينشئ ملف PDF حقيقي، بل يفتح صفحة HTML قابلة للطباعة
 * @param {string} format - صيغة التصدير المطلوبة
 */
/**
 * ملاحظة: الدالة exportSummaries — وصف تلقائي موجز لوظيفتها.
 * المدخلات: format
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة exportSummaries — وصف تلقائي موجز لوظيفتها.
 * المدخلات: format
 * المخرجات: راجع التنفيذ
 */
function exportSummaries(format) {
  const { fromDate, toDate } = getPeriodRange('summaries');
  const salesData = data.sales.filter(s => inPeriod(s.date, fromDate, toDate));
  const paymentsData = data.payments.filter(p => inPeriod(p.date, fromDate, toDate));
  const expensesData = data.expenses.filter(e => inPeriod(e.date, fromDate, toDate));
  
  const totalSales = salesData.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalPayments = paymentsData.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalExpenses = expensesData.reduce((sum, e) => sum + (e.amount || 0), 0);
  
  if (format === 'excel') {
    const wb = XLSX.utils.book_new();
    const summaryData = [{
      'التقرير': 'ملخصات مرئية',
      'المدة': `${fromDate} إلى ${toDate}`,
      'إجمالي المبيعات': totalSales,
      'إجمالي التسديدات': totalPayments,
      'إجمالي المصروفات': totalExpenses
    }];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), 'الملخص');
    XLSX.writeFile(wb, `ملخصات_${moment().format('YYYY-MM-DD')}.xlsx`);
    showNotification('تم تصدير الملخصات إلى Excel', 'success');
  } else if (format === 'txt') {
    let content = `ملخصات مرئية - المدة: ${fromDate} إلى ${toDate}\n\n`;
    content += `إجمالي المبيعات: ${formatNumber(totalSales)}\n`;
    content += `إجمالي التسديدات: ${formatNumber(totalPayments)}\n`;
    content += `إجمالي المصروفات: ${formatNumber(totalExpenses)}\n`;
    downloadTextFile(content, `ملخصات_${moment().format('YYYY-MM-DD')}.txt`);
    showNotification('تم تصدير الملخصات إلى ملف نصي', 'success');
  } else if (format === 'pdf' || format === 'print') {
    // ملاحظة: كلا الخيارين (pdf و print) يفتحان نفس صفحة الطباعة
    // يمكن للمستخدم طباعتها أو حفظها كـ PDF من المتصفح
    openSummariesPrintPage(fromDate, toDate, totalSales, totalPayments, totalExpenses);
  }
}

/**
 * تصدير تقرير الديون بصيغ مختلفة
 * يدعم: Excel, TXT, PDF (صفحة طباعة), Print
 * ملاحظة: PDF لا ينشئ ملف PDF حقيقي، بل يفتح صفحة HTML قابلة للطباعة
 * @param {string} format - صيغة التصدير المطلوبة
 */
/**
 * ملاحظة: الدالة exportDebts — وصف تلقائي موجز لوظيفتها.
 * المدخلات: format
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة exportDebts — وصف تلقائي موجز لوظيفتها.
 * المدخلات: format
 * المخرجات: راجع التنفيذ
 */
function exportDebts(format) {
  const { fromDate, toDate } = getPeriodRange('debts');
  const debtData = generateDebtReportDataForExport();
  
  if (format === 'excel') {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(debtData), 'الديون');
    XLSX.writeFile(wb, `تقرير_الديون_${moment().format('YYYY-MM-DD')}.xlsx`);
    showNotification('تم تصدير تقرير الديون إلى Excel', 'success');
  } else if (format === 'txt') {
    let content = `تقرير الديون - المدة: ${fromDate} إلى ${toDate}\n\n`;
    debtData.forEach(debt => {
      content += `${debt['اسم المحل']}: ${formatNumber(debt['المتبقي'])}\n`;
    });
    downloadTextFile(content, `تقرير_الديون_${moment().format('YYYY-MM-DD')}.txt`);
    showNotification('تم تصدير تقرير الديون إلى ملف نصي', 'success');
  } else if (format === 'pdf' || format === 'print') {
    openDebtsPrintPage(fromDate, toDate, debtData);
  }
}

/**
 * ملاحظة: الدالة exportProfit — وصف تلقائي موجز لوظيفتها.
 * المدخلات: format
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة exportProfit — وصف تلقائي موجز لوظيفتها.
 * المدخلات: format
 * المخرجات: راجع التنفيذ
 */
function exportProfit(format) {
  const { fromDate, toDate } = getPeriodRange('profit');
  const profitData = generateProfitReportDataForExport();
  
  if (format === 'excel') {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(profitData), 'الأرباح');
    XLSX.writeFile(wb, `تقرير_الأرباح_${moment().format('YYYY-MM-DD')}.xlsx`);
    showNotification('تم تصدير تقرير الأرباح إلى Excel', 'success');
  } else if (format === 'txt') {
    let content = `تقرير الأرباح والخسائر - المدة: ${fromDate} إلى ${toDate}\n\n`;
    profitData.forEach(item => {
      content += `${item['الوصف']}: ${formatNumber(item['المبلغ'])}\n`;
    });
    downloadTextFile(content, `تقرير_الأرباح_${moment().format('YYYY-MM-DD')}.txt`);
    showNotification('تم تصدير تقرير الأرباح إلى ملف نصي', 'success');
  } else if (format === 'pdf' || format === 'print') {
    openProfitPrintPage(fromDate, toDate, profitData);
  }
}



// دالة مساعدة لتحويل قيمة الفترة إلى نطاق تاريخ
function getPeriodRangeByValue(period) {
  const now = moment();
  let fromDate, toDate;
  
  switch(period) {
    case 'from_start':
      fromDate = '2020-01-01';
      toDate = now.format('YYYY-MM-DD');
      break;
    case 'day':
      fromDate = toDate = now.format('YYYY-MM-DD');
      break;
    case 'week':
      fromDate = now.clone().subtract(7, 'days').format('YYYY-MM-DD');
      toDate = now.format('YYYY-MM-DD');
      break;
    case 'month':
      fromDate = now.clone().subtract(1, 'month').format('YYYY-MM-DD');
      toDate = now.format('YYYY-MM-DD');
      break;
    case 'prev_month':
      fromDate = now.clone().subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
      toDate = now.clone().subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
      break;
    case 'this_month':
    default:
      fromDate = now.clone().startOf('month').format('YYYY-MM-DD');
      toDate = now.format('YYYY-MM-DD');
      break;
  }
  
  return { fromDate, toDate };
}

// دالة مساعدة لتنزيل ملف نصي
function downloadTextFile(content, filename) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// دوال فتح صفحات الطباعة
function openSummariesPrintPage(fromDate, toDate, totalSales, totalPayments, totalExpenses) {
  const html = buildPrintPageHTML('ملخصات مرئية', `${fromDate} إلى ${toDate}`, {
    totalSales,
    totalPayments,
    totalExpenses
  }, 'summaries');
  openPrintWindow(html);
}

/**
 * ملاحظة: الدالة openDebtsPrintPage — وصف تلقائي موجز لوظيفتها.
 * المدخلات: fromDate, toDate, debtData
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة openDebtsPrintPage — وصف تلقائي موجز لوظيفتها.
 * المدخلات: fromDate, toDate, debtData
 * المخرجات: راجع التنفيذ
 */
function openDebtsPrintPage(fromDate, toDate, debtData) {
  const html = buildPrintPageHTML('تقرير الديون', `${fromDate} إلى ${toDate}`, debtData, 'debts');
  openPrintWindow(html);
}

/**
 * ملاحظة: الدالة openProfitPrintPage — وصف تلقائي موجز لوظيفتها.
 * المدخلات: fromDate, toDate, profitData
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة openProfitPrintPage — وصف تلقائي موجز لوظيفتها.
 * المدخلات: fromDate, toDate, profitData
 * المخرجات: راجع التنفيذ
 */
function openProfitPrintPage(fromDate, toDate, profitData) {
  const html = buildPrintPageHTML('تقرير الأرباح والخسائر', `${fromDate} إلى ${toDate}`, profitData, 'profit');
  openPrintWindow(html);
}

/**
 * بناء صفحة HTML قابلة للطباعة للتقارير
 * تستخدم لإنشاء صفحات قابلة للطباعة أو الحفظ كـ PDF
 * ملاحظة: هذه الدالة تنشئ HTML فقط، ولا تنشئ ملف PDF حقيقي
 * @param {string} title - عنوان التقرير
 * @param {string} period - فترة التقرير
 * @param {Array|Object} data - بيانات التقرير
 * @param {string} type - نوع التقرير (debts, profit, إلخ)
 * @returns {string} كود HTML للصفحة
 */
/**
 * ملاحظة: الدالة buildPrintPageHTML — وصف تلقائي موجز لوظيفتها.
 * المدخلات: title, period, data, type
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة buildPrintPageHTML — وصف تلقائي موجز لوظيفتها.
 * المدخلات: title, period, data, type
 * المخرجات: راجع التنفيذ
 */
function buildPrintPageHTML(title, period, data, type) {
  let html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <title>${(typeof window!=='undefined' && window.APP_NAME) ? window.APP_NAME : 'فاست لينك - حسابات'} | ${title}</title>
    <style>
        .app-brandline { text-align: center; font-size: 12px; color: #0ea5e9; margin: 4px 0; font-weight: 600; }
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .content { margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
        th { background-color: #f5f5f5; }
        .currency { font-weight: bold; }
    </style>
</head>
<body>
    <div class="app-brandline">${(typeof window!=='undefined' && window.APP_NAME) ? window.APP_NAME : 'فاست لينك - حسابات'}</div>
    <div class="header">
        <h1>${title}</h1>
        <p>المدة: ${period}</p>
        <p>التاريخ: ${new Date().toISOString().slice(0, 10)}</p>
    </div>
    <div class="content">`;
    
  if (type === 'summaries') {
    html += `
        <table>
            <tr><td>إجمالي المبيعات</td><td class="currency">${formatNumber(data.totalSales)}</td></tr>
            <tr><td>إجمالي التسديدات</td><td class="currency">${formatNumber(data.totalPayments)}</td></tr>
            <tr><td>إجمالي المصروفات</td><td class="currency">${formatNumber(data.totalExpenses)}</td></tr>
        </table>`;
  } else if (type === 'debts') {
    html += `
        <table>
            <thead>
                <tr>
                    <th>اسم المحل</th>
                    <th>إجمالي المبيعات</th>
                    <th>المدفوع</th>
                    <th>المتبقي</th>
                </tr>
            </thead>
            <tbody>`;
    data.forEach(row => {
      html += `
                <tr>
                    <td>${row['اسم المحل']}</td>
                    <td class="currency">${formatNumber(row['إجمالي المبيعات'])}</td>
                    <td class="currency">${formatNumber(row['المدفوع'])}</td>
                    <td class="currency">${formatNumber(row['المتبقي'])}</td>
                </tr>`;
    });
    html += `
            </tbody>
        </table>`;
  } else if (type === 'profit') {
    html += `
        <table>
            <thead>
                <tr>
                    <th>الوصف</th>
                    <th>المبلغ</th>
                </tr>
            </thead>
            <tbody>`;
    data.forEach(row => {
      html += `
                <tr>
                    <td>${row['الوصف']}</td>
                    <td class="currency">${formatNumber(row['المبلغ'])}</td>
                </tr>`;
    });
    html += `
            </tbody>
        </table>`;
  }
  
  html += `
    </div>
</body>
</html>`;
  
  return html;
}

// دالة مساعدة لفتح نافذة الطباعة
function openPrintWindow(html) {
  try {
    const win = window.open('', '_blank');
    if (!win || !win.document) {
      showNotification('يمنع المتصفح النوافذ المنبثقة. الرجاء السماح بها.', 'error');
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    showNotification('تم فتح صفحة الطباعة', 'success');
  } catch (e) {
    showNotification('حدث خطأ أثناء فتح صفحة الطباعة', 'error');
  }
}

// دوال توليد البيانات للتصدير
function generateDebtReportDataForExport() {
  const table = document.getElementById('debtReportTable');
  const data = [];
  if (table) {
    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 4) {
        data.push({
          'اسم المحل': cells[0].textContent.trim(),
          'إجمالي المبيعات': parseFormattedNumber(cells[1].textContent),
          'المدفوع': parseFormattedNumber(cells[2].textContent),
          'المتبقي': parseFormattedNumber(cells[3].textContent)
        });
      }
    });
  }
  return data;
}

/**
 * ملاحظة: الدالة generateProfitReportDataForExport — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة generateProfitReportDataForExport — وصف تلقائي موجز لوظيفتها.
 * المدخلات: بدون
 * المخرجات: راجع التنفيذ
 */
function generateProfitReportDataForExport() {
  const totalSales = parseFormattedNumber(document.getElementById('totalSalesReport')?.textContent || '0');
  const totalPayments = parseFormattedNumber(document.getElementById('totalPaymentsReport')?.textContent || '0');
  const totalExpenses = parseFormattedNumber(document.getElementById('totalExpensesReport')?.textContent || '0');
  const netProfit = parseFormattedNumber(document.getElementById('netProfitReport')?.textContent || '0');
  
  return [
    { 'الوصف': 'إجمالي المبيعات', 'المبلغ': totalSales },
    { 'الوصف': 'إجمالي التسديدات', 'المبلغ': totalPayments },
    { 'الوصف': 'إجمالي المصروفات', 'المبلغ': totalExpenses },
    { 'الوصف': 'صافي الربح/الخسارة', 'المبلغ': netProfit }
  ];
}

// ربط معالجات الأحداث للتقارير الإضافية
function wireAdditionalReportsExports() {
  // ملخصات مرئية
  const summariesExcel = document.getElementById('exportSummariesExcel');
  const summariesTxt = document.getElementById('exportSummariesTxt');
  const summariesPdf = document.getElementById('exportSummariesPdf');
  const summariesPrint = document.getElementById('openSummariesReport');
  
  if (summariesExcel && !summariesExcel.dataset._wired) {
    summariesExcel.addEventListener('click', () => exportSummaries('excel'));
    summariesExcel.dataset._wired = '1';
  }
  if (summariesTxt && !summariesTxt.dataset._wired) {
    summariesTxt.addEventListener('click', () => exportSummaries('txt'));
    summariesTxt.dataset._wired = '1';
  }
  if (summariesPdf && !summariesPdf.dataset._wired) {
    summariesPdf.addEventListener('click', () => exportSummaries('pdf'));
    summariesPdf.dataset._wired = '1';
  }
  if (summariesPrint && !summariesPrint.dataset._wired) {
    summariesPrint.addEventListener('click', () => exportSummaries('print'));
    summariesPrint.dataset._wired = '1';
  }
  
  // تقرير الديون
  const debtsExcel = document.getElementById('exportDebtsExcel');
  const debtsTxt = document.getElementById('exportDebtsTxt');
  const debtsPdf = document.getElementById('exportDebtsPdf');
  const debtsPrint = document.getElementById('openDebtsReport');
  
  if (debtsExcel && !debtsExcel.dataset._wired) {
    debtsExcel.addEventListener('click', () => exportDebts('excel'));
    debtsExcel.dataset._wired = '1';
  }
  if (debtsTxt && !debtsTxt.dataset._wired) {
    debtsTxt.addEventListener('click', () => exportDebts('txt'));
    debtsTxt.dataset._wired = '1';
  }
  if (debtsPdf && !debtsPdf.dataset._wired) {
    debtsPdf.addEventListener('click', () => exportDebts('pdf'));
    debtsPdf.dataset._wired = '1';
  }
  if (debtsPrint && !debtsPrint.dataset._wired) {
    debtsPrint.addEventListener('click', () => exportDebts('print'));
    debtsPrint.dataset._wired = '1';
  }
  
  // تقرير الأرباح
  const profitExcel = document.getElementById('exportProfitExcel');
  const profitTxt = document.getElementById('exportProfitTxt');
  const profitPdf = document.getElementById('exportProfitPdf');
  const profitPrint = document.getElementById('openProfitReport');
  
  if (profitExcel && !profitExcel.dataset._wired) {
    profitExcel.addEventListener('click', () => exportProfit('excel'));
    profitExcel.dataset._wired = '1';
  }
  if (profitTxt && !profitTxt.dataset._wired) {
    profitTxt.addEventListener('click', () => exportProfit('txt'));
    profitTxt.dataset._wired = '1';
  }
  if (profitPdf && !profitPdf.dataset._wired) {
    profitPdf.addEventListener('click', () => exportProfit('pdf'));
    profitPdf.dataset._wired = '1';
  }
  if (profitPrint && !profitPrint.dataset._wired) {
    profitPrint.addEventListener('click', () => exportProfit('print'));
    profitPrint.dataset._wired = '1';
  }
  
  // معالجات تغيير الفترة
  const summariesPeriod = document.getElementById('summariesPeriod');
  const debtsPeriod = document.getElementById('debtsPeriod');
  const profitPeriod = document.getElementById('profitPeriod');
  
  if (summariesPeriod && !summariesPeriod.dataset._wired) {
    summariesPeriod.addEventListener('change', () => {
      try {
        const val = summariesPeriod.value;
        syncCustomRange('summaries');
        if (val !== 'custom') {
          if (typeof PeriodManager!=='undefined' && PeriodManager.setPeriod) PeriodManager.setPeriod(val);
          else renderQuickSummaries();
        }
      } catch(_) { try{ renderQuickSummaries(); }catch(__){} }
    });
    summariesPeriod.dataset._wired = '1';
  }
  
  if (debtsPeriod && !debtsPeriod.dataset._wired) {
    debtsPeriod.addEventListener('change', () => {
      try{
        const val = debtsPeriod.value;
        syncCustomRange('debts');
        if (val !== 'custom') {
          if (typeof PeriodManager!=='undefined' && PeriodManager.setPeriod) PeriodManager.setPeriod(val);
          else generateDebtReport();
        }
      }catch(_) { try{ generateDebtReport(); }catch(__){} }
    });
    debtsPeriod.dataset._wired = '1';
  }
  
  if (profitPeriod && !profitPeriod.dataset._wired) {
    profitPeriod.addEventListener('change', () => {
      try{
        const val = profitPeriod.value;
        syncCustomRange('profit');
        if (val !== 'custom') {
          if (typeof PeriodManager!=='undefined' && PeriodManager.setPeriod) PeriodManager.setPeriod(val);
          else updateProfitReport();
        }
      }catch(_) { try{ updateProfitReport(); }catch(__){} }
    });
    profitPeriod.dataset._wired = '1';
  }
  
  // معالجات أزرار تطبيق النطاق المخصص
  const summariesApply = document.getElementById('applySummariesRange');
  const debtsApply = document.getElementById('applyDebtsRange');
  const profitApply = document.getElementById('applyProfitRange');
  
  if (summariesApply && !summariesApply.dataset._wired) {
    summariesApply.addEventListener('click', () => {
      try {
        const from = document.getElementById('summariesFromDate')?.value || '';
        const to = document.getElementById('summariesToDate')?.value || '';
        if (typeof PeriodManager!=='undefined' && PeriodManager.setPeriod) PeriodManager.setPeriod('custom', { from, to });
        else renderQuickSummaries();
      } catch(_) { try{ renderQuickSummaries(); }catch(__){} }
    });
    summariesApply.dataset._wired = '1';
  }
  
  if (debtsApply && !debtsApply.dataset._wired) {
    debtsApply.addEventListener('click', () => {
      try {
        const from = document.getElementById('debtsFromDate')?.value || '';
        const to = document.getElementById('debtsToDate')?.value || '';
        if (typeof PeriodManager!=='undefined' && PeriodManager.setPeriod) PeriodManager.setPeriod('custom', { from, to });
        else generateDebtReport();
      } catch(_) { try{ generateDebtReport(); }catch(__){} }
    });
    debtsApply.dataset._wired = '1';
  }
  
  if (profitApply && !profitApply.dataset._wired) {
    profitApply.addEventListener('click', () => {
      try {
        const from = document.getElementById('profitFromDate')?.value || '';
        const to = document.getElementById('profitToDate')?.value || '';
        if (typeof PeriodManager!=='undefined' && PeriodManager.setPeriod) PeriodManager.setPeriod('custom', { from, to });
        else updateProfitReport();
      } catch(_) { try{ updateProfitReport(); }catch(__){} }
    });
    profitApply.dataset._wired = '1';
  }

  // إعادة توليد جميع التقارير عند تغيير الفترة المركزية
  if (!window.__reportsPeriodWired) {
    document.addEventListener('periodChanged', function(){
      try{ renderQuickSummaries(); }catch(_){}
      try{ generateDebtReport(); }catch(_){}
      try{ updateProfitReport(); }catch(_){}
    });
    window.__reportsPeriodWired = true;
  }
}

// دالة مساعدة لمزامنة ظهور النطاق المخصص
function syncCustomRange(reportType) {
  const periodSelect = document.getElementById(`${reportType}Period`);
  const customRange = document.getElementById(`${reportType}CustomRange`);
  
  if (periodSelect && customRange) {
    customRange.style.display = periodSelect.value === 'custom' ? '' : 'none';
  }
}

// دوال تعديل وحذف التسديدات والمصروفات من تقرير الشركاء
function editPaymentFromPartner(paymentId) {
  const payment = data.payments.find(p => p.id === paymentId);
  if (!payment) {
    showNotification('لم يتم العثور على التسديد', 'error');
    return;
  }
  
  // استدعاء دالة التعديل من payments.js
  if (typeof editPayment === 'function') {
    editPayment(paymentId);
  } else {
    showNotification('دالة التعديل غير متوفرة', 'error');
  }
}

/**
 * ملاحظة: الدالة deletePaymentFromPartner — وصف تلقائي موجز لوظيفتها.
 * المدخلات: paymentId
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة deletePaymentFromPartner — وصف تلقائي موجز لوظيفتها.
 * المدخلات: paymentId
 * المخرجات: راجع التنفيذ
 */
function deletePaymentFromPartner(paymentId) {
  if (!confirm('هل أنت متأكد من حذف هذا التسديد؟')) return;
  
  const payment = data.payments.find(p => p.id === paymentId);
  if (!payment) {
    showNotification('لم يتم العثور على التسديد', 'error');
    return;
  }
  
  // استدعاء دالة الحذف من payments.js
  if (typeof deletePayment === 'function') {
    deletePayment(paymentId);
    // تحديث تقرير الشركاء بعد الحذف
    setTimeout(() => generatePartnerReports(), 100);
  } else {
    showNotification('دالة الحذف غير متوفرة', 'error');
  }
}

/**
 * ملاحظة: الدالة editExpenseFromPartner — وصف تلقائي موجز لوظيفتها.
 * المدخلات: expenseId
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة editExpenseFromPartner — وصف تلقائي موجز لوظيفتها.
 * المدخلات: expenseId
 * المخرجات: راجع التنفيذ
 */
function editExpenseFromPartner(expenseId) {
  const expense = data.expenses.find(e => e.id === expenseId);
  if (!expense) {
    showNotification('لم يتم العثور على المصروف', 'error');
    return;
  }
  
  // استدعاء دالة التعديل من expenses.js
  if (typeof editExpense === 'function') {
    editExpense(expenseId);
  } else {
    showNotification('دالة التعديل غير متوفرة', 'error');
  }
}

/**
 * ملاحظة: الدالة deleteExpenseFromPartner — وصف تلقائي موجز لوظيفتها.
 * المدخلات: expenseId
 * المخرجات: راجع التنفيذ
 */
/**
 * ملاحظة: الدالة deleteExpenseFromPartner — وصف تلقائي موجز لوظيفتها.
 * المدخلات: expenseId
 * المخرجات: راجع التنفيذ
 */
function deleteExpenseFromPartner(expenseId) {
  if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) return;
  
  const expense = data.expenses.find(e => e.id === expenseId);
  if (!expense) {
    showNotification('لم يتم العثور على المصروف', 'error');
    return;
  }
  
  // استدعاء دالة الحذف من expenses.js
  if (typeof deleteExpense === 'function') {
    deleteExpense(expenseId);
    // تحديث تقرير الشركاء بعد الحذف
    setTimeout(() => generatePartnerReports(), 100);
  } else {
    showNotification('دالة الحذف غير متوفرة', 'error');
  }
}

// تصدير الدوال للنطاق العام
if (typeof window !== 'undefined') {
  window.editPaymentFromPartner = editPaymentFromPartner;
  window.deletePaymentFromPartner = deletePaymentFromPartner;
  window.editExpenseFromPartner = editExpenseFromPartner;
  window.deleteExpenseFromPartner = deleteExpenseFromPartner;
}

if (typeof window !== 'undefined'){
	document.addEventListener('DOMContentLoaded', ()=>{ 
    initReportsControls(); 
    wireAdditionalReportsExports();
    // مزامنة النطاقات المخصصة عند التحميل
    syncCustomRange('summaries');
    syncCustomRange('debts');
    syncCustomRange('profit');
  });
	document.addEventListener('app-data-loaded', ()=>{ initReportsControls(); });
}