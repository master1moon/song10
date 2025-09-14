(function(){
  'use strict';

  function computeMetrics(d){
    const dataRef = d || (typeof getDataRef === 'function' ? getDataRef() : (window.data||{}));
    const sales = dataRef.sales||[]; const payments = dataRef.payments||[]; const expenses = dataRef.expenses||[];
    const stores = dataRef.stores||[]; const inventory = dataRef.inventory||[]; const packages = dataRef.packages||[];
    const totals = {
      sales: sales.reduce((s,x)=> s + (Number(x.total)||0), 0),
      payments: payments.reduce((s,x)=> s + (Number(x.amount)||0), 0),
      expenses: expenses.reduce((s,x)=> s + (Number(x.amount)||0), 0),
      inventoryValue: inventory.reduce((s,x)=> s + (Number(x.quantity)||0) * (Number((packages.find(p=>p.id===x.packageId)||{}).price)||0), 0),
      storesBalance: 0,
      counts: {
        stores: stores.length,
        packages: packages.length,
        inventoryItems: inventory.length,
        sales: sales.length,
        payments: payments.length,
        expenses: expenses.length
      },
      perStore: {}
    };
    totals.storesBalance = stores.reduce((acc, store) => {
      const sSales = sales.filter(s=> s.storeId===store.id).reduce((s,x)=> s + (Number(x.total)||0),0);
      const sPays = payments.filter(p=> p.storeId===store.id).reduce((s,x)=> s + (Number(x.amount)||0),0);
      totals.perStore[store.id] = {
        name: store.name,
        sales: sSales,
        payments: sPays,
        balance: sSales - sPays
      };
      return acc + (sSales - sPays);
    }, 0);
    totals.netProfit = totals.sales - totals.expenses;
    return totals;
  }

  function renderParityPage(){
    const section = document.getElementById('parityCheck');
    if (!section) return;
    const base = (typeof localStorage!=='undefined') ? (localStorage.getItem('baseline_metrics') || '') : '';
    const baseline = base ? ((typeof safeJsonParse==='function' && FeatureFlags && FeatureFlags.isEnabled('safeJsonParse'))? safeJsonParse(base, null) : JSON.parse(base)) : null;
    const current = computeMetrics();
    const issues = computeIssues();
    const fmt = (typeof formatNumber==='function') ? n=> formatNumber(n) : n=> String(n);
    const card = (label, cur, baseVal)=>{
      const same = (baseline && typeof baseVal==='number') ? Math.abs(cur - baseVal) < 0.0001 : true;
      const diff = baseline ? (cur - (baseVal||0)) : 0;
      return `
        <div class="col-md-4">
          <div class="card ${same?'border-success':'border-danger'}">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <div class="fw-bold mb-1">${label}</div>
                  <div class="small text-muted">${baseline? 'الأساس: '+fmt(baseVal||0) : 'لا يوجد أساس محفوظ'}</div>
                </div>
                <div class="text-end">
                  <div class="h5 mb-0">${fmt(cur)}</div>
                  ${baseline? `<div class="small ${diff===0?'text-success':(diff>0?'text-warning':'text-danger')}">فرق: ${fmt(diff)}</div>`:''}
                </div>
              </div>
            </div>
          </div>
        </div>`;
    };
    const countsHtml = (baseline? `
      <div class="card mt-3">
        <div class="card-header bg-light">فروقات العدّادات</div>
        <div class="card-body">
          <div class="row g-3">
            ${['stores','packages','inventoryItems','sales','payments','expenses'].map(key=>{
              const cur = current.counts[key]; const baseVal = (baseline.counts||{})[key]||0; const diff = cur - baseVal; const ok = diff===0;
              return `
                <div class="col-md-4">
                  <div class="d-flex justify-content-between border rounded p-2 ${ok?'border-success':'border-danger'}">
                    <div class="fw-semibold">${key}</div>
                    <div>${cur} ${ok? '<span class="text-success">(مطابق)</span>' : `<span class="text-danger">(فرق: ${diff>0?'+':''}${diff})</span>`}</div>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
      </div>`: '');

    const perStoreHtml = (baseline? (()=>{
      const ids = Object.keys(current.perStore||{});
      if (!ids.length) return '';
      const rows = ids.map(id=>{
        const c = current.perStore[id]; const b = (baseline.perStore||{})[id] || { balance: 0, sales: 0, payments: 0, name: c.name };
        const db = c.balance - (b.balance||0); const ds = c.sales - (b.sales||0); const dp = c.payments - (b.payments||0);
        const ok = (db===0 && ds===0 && dp===0);
        return `<tr class="${ok?'':'table-danger'}"><td>${c.name||id}</td><td class="currency">${fmt(c.sales)}</td><td class="currency">${fmt(c.payments)}</td><td class="currency">${fmt(c.balance)}</td><td class="currency">${fmt(b.balance||0)}</td><td class="currency">${fmt(db)}</td></tr>`;
      }).join('');
      return `
        <div class="card mt-3">
          <div class="card-header bg-light">مطابقة أرصدة المحلات</div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-sm mb-0">
                <thead><tr><th>المحل</th><th>مبيعات الآن</th><th>تسديدات الآن</th><th>الرصيد الآن</th><th>الرصيد الأساس</th><th>فرق الرصيد</th></tr></thead>
                <tbody>${rows || `<tr><td colspan="6" class="text-center text-muted">لا توجد محلات</td></tr>`}</tbody>
              </table>
            </div>
          </div>
        </div>`;
    })() : '');

    const html = `
      <div class="header-bar">
        <h3 class="page-title"><i class="fas fa-balance-scale"></i> فحص التطابق (Parity Check)</h3>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-primary" id="saveBaselineBtn"><i class="fas fa-save"></i> حفظ الأساس الحالي</button>
          <button class="btn btn-sm btn-secondary" id="recomputeBtn"><i class="fas fa-sync"></i> إعادة الحساب</button>
          <button class="btn btn-sm btn-outline-success" id="exportParityBtn"><i class="fas fa-file-export"></i> تصدير النتائج</button>
        </div>
      </div>
      ${issues && issues.summary.total>0 ? `
      <div class="alert ${issues.summary.critical>0?'alert-danger':'alert-warning'}">
        <div class="fw-bold">مشاكل البيانات</div>
        <div class="small">الإجمالي: ${issues.summary.total} | حرجة: ${issues.summary.critical} | تحذيرية: ${issues.summary.warning}</div>
      </div>` : ''}
      <div class="row g-3 mt-1">
        ${card('إجمالي المبيعات', current.sales, baseline && baseline.sales)}
        ${card('إجمالي التسديدات', current.payments, baseline && baseline.payments)}
        ${card('إجمالي المصروفات', current.expenses, baseline && baseline.expenses)}
        ${card('صافي الربح', current.netProfit, baseline && baseline.netProfit)}
        ${card('إجمالي أرصدة المحلات', current.storesBalance, baseline && baseline.storesBalance)}
        ${card('قيمة المخزون التقديرية', current.inventoryValue, baseline && baseline.inventoryValue)}
      </div>
      ${countsHtml}
      ${perStoreHtml}
      ${issues && issues.items.length ? `
      <div class="card mt-3">
        <div class="card-header bg-light">قائمة المشاكل المكتشفة</div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead><tr><th>السبب</th><th>المكان</th><th>التفاصيل</th><th style="width:96px">إجراء</th></tr></thead>
              <tbody>
                ${issues.items.map((it,idx)=>{
                  const place = it.locationLabel || (it.entity==='sale' ? (`البقالات والمحلات › ${it.storeName||'-'} · المبيعات`) : (it.entity==='payment' ? (`البقالات والمحلات › ${it.storeName||'-'} · التسديدات`) : ('المصروفات')));
                  const details = it.detailText || '';
                  const cause = it.message || '';
                  const cls = it.level==='critical'?'table-danger':'table-warning';
                  return `<tr class="${cls}"><td>${cause}</td><td>${place}</td><td>${details}</td><td><button class="btn btn-sm btn-primary issue-goto" data-idx="${idx}"><i class=\"fas fa-location-arrow\"></i> اذهب</button></td></tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>`: ''}
      <div class="alert alert-info mt-3">
        هذه الصفحة للعرض فقط ولا تغيّر أي بيانات حسابية. الهدف هو التأكد من التطابق صفر بالمئة بعد أي تحسينات.
      </div>
    `;
    if (typeof FeatureFlags !== 'undefined' && FeatureFlags.isEnabled('safeDomRendering') && typeof setHTML === 'function') { setHTML(section, html); } else { section.innerHTML = html; }
    const saveBtn = document.getElementById('saveBaselineBtn');
    if (saveBtn) saveBtn.onclick = function(){ try{ localStorage.setItem('baseline_metrics', JSON.stringify(current)); showNotification('تم حفظ الأساس الحالي', 'success'); }catch(_){} };
    const recomputeBtn = document.getElementById('recomputeBtn');
    if (recomputeBtn) recomputeBtn.onclick = renderParityPage;
    const exportBtn = document.getElementById('exportParityBtn');
    if (exportBtn) exportBtn.onclick = function(){
      try {
        const payload = { generatedAt: new Date().toISOString(), current, baseline: baseline||null, issues };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `parity_${Date.now()}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      } catch(_) {}
    };
    // ربط أزرار الذهاب
    document.querySelectorAll('.issue-goto').forEach(btn=>{
      btn.addEventListener('click', function(){
        const idx = Number(this.getAttribute('data-idx'));
        try { gotoParityIssue(issues.items[idx]); } catch(_) {}
      });
    });
  }

  // فحوصات متقدمة للبيانات: قيم، علاقات، تواريخ، تكرارات
  function computeIssues(d){
    const dataRef = d || (typeof getDataRef === 'function' ? getDataRef() : (window.data||{}));
    const sales = dataRef.sales||[]; const payments = dataRef.payments||[]; const expenses = dataRef.expenses||[];
    const stores = dataRef.stores||[]; const packages = dataRef.packages||[];
    const storeIds = new Set(stores.map(s=> String(s.id)));
    const storeMap = stores.reduce((m,s)=>{ m[String(s.id)] = s.name; return m; }, {});
    const packageIds = new Set(packages.map(p=> String(p.id)));
    const packageMap = packages.reduce((m,p)=>{ m[String(p.id)] = p.name; return m; }, {});
    const items = [];
    const add = (level, category, message, ref, ctx)=> items.push(Object.assign({ level, category, message, ref }, ctx||{}));
    const isBadDate = (s)=> { const m = (typeof moment!=='undefined') ? moment(s, [moment.ISO_8601,'YYYY-MM-DD','YYYY-M-D','DD/MM/YYYY','D/M/YYYY'], true) : null; return !s || (m && !m.isValid()); };
    const today = new Date().toISOString().slice(0,10);

    // المبيعات: تحقق من الحقول والمنطق
    const saleKeys = new Set();
    sales.forEach(s=>{
      const ref = s.id || 'sale?';
      const storeName = storeMap[String(s.storeId)] || 'محل غير معروف';
      const pkgName = s.packageId==='custom' ? (s.reason||'مبلغ مخصص') : (packageMap[String(s.packageId)] || (s.packageId? 'باقة محذوفة':'غير محدد'));
      const detail = `المحل: ${storeName} | التاريخ: ${s.date||'-'} | ${s.packageId==='custom'?'المبلغ':'الإجمالي'}: ${Number(s.packageId==='custom'?s.amount:s.total)||0}`;
      const ctx = { entity:'sale', entityId:s.id, storeId:s.storeId, storeName, date:s.date, amount: Number(s.total)||0, packageName: pkgName, locationLabel: `البقالات والمحلات  3e ${storeName}  B7 المبيعات`, detailText: `${s.reason? (s.reason + ' | '): ''}${detail}` };
      if (!s.storeId || !storeIds.has(String(s.storeId))) add('critical','sales','بيع مرتبط بمحل غير موجود', ref, ctx);
      if (!s.packageId && !(s.reason && s.amount>0)) add('critical','sales','بيع بدون باقة ولا مبرر ومبلغ', ref, ctx);
      if (s.packageId && s.packageId!=='custom' && !packageIds.has(String(s.packageId))) add('critical','sales','بيع يشير إلى باقة غير موجودة', ref, ctx);
      if ((Number(s.quantity)<0) || (Number(s.amount)<0) || (Number(s.total)<0)) add('critical','sales','قيم سالبة في البيع', ref, ctx);
      if (isBadDate(s.date) || (s.date && s.date.slice(0,10) > today)) add('warning','sales','تاريخ بيع غير صحيح أو مستقبلي', ref, ctx);
      const dupKey = `${s.storeId}|${s.packageId}|${s.date}|${Number(s.total)||0}`;
      if (saleKeys.has(dupKey)) add('warning','sales','احتمال عملية بيع مكررة', ref, ctx); else saleKeys.add(dupKey);
    });

    // التسديدات
    const payKeys = new Set();
    payments.forEach(p=>{
      const ref = p.id || 'payment?';
      const storeName = storeMap[String(p.storeId)] || 'محل غير معروف';
      const detail = `المحل: ${storeName} | التاريخ: ${p.date||'-'} | المبلغ: ${Number(p.amount)||0}`;
      const ctx = { entity:'payment', entityId:p.id, storeId:p.storeId, storeName, date:p.date, amount: Number(p.amount)||0, locationLabel: `البقالات والمحلات  3e ${storeName}  B7 التسديدات`, detailText: `${p.notes? ('ملاحظات: '+p.notes+' | '): ''}${detail}` };
      if (!p.storeId || !storeIds.has(String(p.storeId))) add('critical','payments','تسديد مرتبط بمحل غير موجود', ref, ctx);
      if (!(Number(p.amount)>0)) add('critical','payments','مبلغ التسديد غير صالح (<=0)', ref, ctx);
      if (isBadDate(p.date) || (p.date && p.date.slice(0,10) > today)) add('warning','payments','تاريخ تسديد غير صحيح أو مستقبلي', ref, ctx);
      const dupKey = `${p.storeId}|${p.date}|${Number(p.amount)||0}|${(p.notes||'').slice(0,20)}`;
      if (payKeys.has(dupKey)) add('warning','payments','احتمال تسديد مكرر', ref, ctx); else payKeys.add(dupKey);
    });

    // المصروفات
    const expKeys = new Set();
    expenses.forEach(e=>{
      const ref = e.id || 'expense?';
      const detail = `التاريخ: ${e.date||'-'} | النوع: ${e.type||'-'} | المبلغ: ${Number(e.amount)||0}`;
      const ctx = { entity:'expense', entityId:e.id, date:e.date, amount:Number(e.amount)||0, expenseType:e.type, locationLabel: 'المصروفات', detailText: `${e.notes? ('ملاحظات: '+e.notes+' | '): ''}${detail}` };
      if (!(e.type && e.type.trim())) add('critical','expenses','مصروف بدون نوع', ref, ctx);
      if (!(Number(e.amount)>=0)) add('critical','expenses','مبلغ المصروف غير صالح (<0)', ref, ctx);
      if (isBadDate(e.date) || (e.date && e.date.slice(0,10) > today)) add('warning','expenses','تاريخ مصروف غير صحيح أو مستقبلي', ref, ctx);
      const dupKey = `${e.type}|${e.date}|${Number(e.amount)||0}|${(e.notes||'').slice(0,20)}`;
      if (expKeys.has(dupKey)) add('warning','expenses','احتمال مصروف مكرر', ref, ctx); else expKeys.add(dupKey);
    });

    // تحقق علاقة إجمالي الأرصدة = مجموع (مبيعات-تسديدات)
    try {
      const mSales = sales.reduce((s,x)=> s + (Number(x.total)||0), 0);
      const mPays = payments.reduce((s,x)=> s + (Number(x.amount)||0), 0);
      const byStore = stores.reduce((acc, st)=>{ const sid=st.id; const sSum=sales.filter(x=>x.storeId===sid).reduce((s,x)=>s+(Number(x.total)||0),0); const pSum=payments.filter(x=>x.storeId===sid).reduce((s,x)=>s+(Number(x.amount)||0),0); acc.total += (sSum - pSum); return acc; }, { total:0 });
      const diff = Math.round((mSales - mPays) - byStore.total);
      if (Math.abs(diff) > 0) add('warning','balances','فرق بين إجمالي (المبيعات-التسديدات) وبين مجموع أرصدة المحلات', `diff=${diff}`);
    } catch(_){}

    const summary = { total: items.length, critical: items.filter(i=>i.level==='critical').length, warning: items.filter(i=>i.level==='warning').length };
    return { summary, items };
  }

  // الانتقال إلى مكان المشكلة وفتحها للتأكيد/التعديل
  function gotoParityIssue(it){
    try {
      if (!it) return;
      if (it.entity === 'sale') {
        if (typeof switchSection === 'function') switchSection('stores', 'البقالات والمحلات');
        if (it.storeId && typeof showStoreDetails === 'function') showStoreDetails(it.storeId);
        setTimeout(()=>{ try { if (it.entityId && typeof editSale === 'function') editSale(it.entityId); } catch(_){} }, 200);
      } else if (it.entity === 'payment') {
        if (typeof switchSection === 'function') switchSection('stores', 'البقالات والمحلات');
        if (it.storeId && typeof showStoreDetails === 'function') showStoreDetails(it.storeId);
        setTimeout(()=>{ try { if (it.entityId && typeof editPayment === 'function') editPayment(it.entityId); } catch(_){} }, 200);
      } else if (it.entity === 'expense') {
        if (typeof switchSection === 'function') switchSection('expenses', 'المصروفات');
        setTimeout(()=>{ try { if (it.entityId && typeof editExpense === 'function') editExpense(it.entityId); else if (typeof renderExpensesTable==='function') renderExpensesTable(); } catch(_){} }, 200);
      }
    } catch(_) {}
  }
  if (typeof window !== 'undefined') { window.gotoParityIssue = gotoParityIssue; }

  function showParitySection(){
    document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
    const link = document.querySelector('[data-section="parityCheck"]');
    if (link) link.classList.add('active');
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    const sec = document.getElementById('parityCheck');
    if (sec) { sec.style.display = 'block'; renderParityPage(); }
    const title = document.querySelector('.page-title'); if (title) title.textContent = 'فحص التطابق (Parity Check)';
  }

  window.ParityCheck = { computeMetrics, render: renderParityPage, show: showParitySection };

})();

