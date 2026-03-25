// ============================================================
// 通用工具函式
// ============================================================
function el(id) { return document.getElementById(id); }
// 選其他 → 顯示伴隨 input（id命名規則：select_id + '_other'）
function autoToggleOther(selectEl) {
    var inp = el(selectEl.id + '_other');
    if (!inp) return;
    inp.style.display = (selectEl.value === '__other__') ? 'block' : 'none';
}
// 取得下拉值；若選「其他」用自填值，空白則回傳空字串（報告中自動略過）
function getSelectVal(selectId) {
    var sel = el(selectId);
    if (!sel) return '';
    if (sel.value === '__other__') {
        var inp = el(selectId + '_other');
        return (inp && inp.value.trim()) ? inp.value.trim() : '';
    }
    return sel.value;
}
// 民國日期格式化
function toRocDateStr(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return (d.getFullYear() - 1911) + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日';
}
// 文字轉換（用於調查情形）
var titleMap = { '爸爸': '案父', '父親': '案父', '媽媽': '案母', '母親': '案母', '繼父': '案繼父', '繼母': '案繼母', '奶奶': '案祖母', '爺爺': '案祖父' };
function translateText(text) {
    var res = text;
    for (var k in titleMap) res = res.split(k).join(titleMap[k]);
    return res;
}
// 當日受理同步
function syncAcceptDate() {
    if (el('accept_same_day').checked) {
        el('accept_date').value = el('report_date').value;
        // 同步民國年欄
        syncRocFromDate('accept_date', 'accept_date_roc');
    }
}
// 通用：日曆 → 民國年文字欄
function syncRocFromDate(dateId, rocId) {
    var d = el(dateId); var t = el(rocId);
    if (!d || !t || !d.value) return;
    var dd = new Date(d.value);
    t.value = (dd.getFullYear() - 1911) + '/' + String(dd.getMonth() + 1).padStart(2, '0') + '/' + String(dd.getDate()).padStart(2, '0');
}
// 通用：民國年文字欄 → 日曆
function syncDateFromRoc(rocId, dateId) {
    var t = el(rocId); var d = el(dateId);
    if (!t || !d) return;
    var roc = t.value.trim();
    var m = roc.match(/^(\d{2,3})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (!m) return;
    d.value = (parseInt(m[1]) + 1911) + '-' + m[2].padStart(2, '0') + '-' + m[3].padStart(2, '0');
}
// 不後處轉介顯示切換
function toggleNoActionDetail() {
    var v = el('case_action').value;
    el('no_action_detail').classList.toggle('hidden', v !== '不後處');
}
function toggleNoActionOther() {
    var sel = el('no_action_type');
    if (!sel) return;
    var inp = el('no_action_type_other');
    if (!inp) return;
    inp.style.display = sel.value === '__other__' ? 'block' : 'none';
}
// 案情簡述字數更新
function updateSummaryCount(inp) {
    var cnt = el('case_summary_count');
    if (!cnt) return;
    var len = inp.value.length;
    cnt.textContent = len + '/20';
    cnt.style.color = len >= 20 ? '#e74c3c' : '#999';
}
// 常用詞彙附加
function appendPhrase(targetId, selectEl) {
    if (!selectEl.value) return;
    var ta = el(targetId);
    ta.value = (ta.value ? ta.value + '，' : '') + selectEl.value;
    selectEl.value = '';
}
// ============================================================
// 案主相關
// ============================================================
var clientCount = 0;
function makeSelect(id, options, onchangeFn) {
    var sel = document.createElement('select');
    sel.id = id;
    sel.onchange = onchangeFn || null;
    options.forEach(function (o) {
        var opt = document.createElement('option');
        opt.value = o.v; opt.textContent = o.t;
        sel.appendChild(opt);
    });
    return sel;
}
function makeInput(id, type, placeholder, style) {
    var inp = document.createElement('input');
    inp.type = type || 'text';
    inp.id = id;
    if (placeholder) inp.placeholder = placeholder;
    if (style) inp.setAttribute('style', style);
    return inp;
}
function makeTA(id, cls, placeholder) {
    var ta = document.createElement('textarea');
    ta.id = id;
    if (cls) ta.className = cls;
    if (placeholder) ta.placeholder = placeholder;
    return ta;
}
function makeLabel(text, forId) {
    var lbl = document.createElement('label');
    if (forId) lbl.htmlFor = forId;
    lbl.textContent = text;
    return lbl;
}
function makeSmall(text, cls) {
    var s = document.createElement('small');
    s.textContent = text;
    if (cls) s.className = cls;
    return s;
}
function makeDiv(cls, id) {
    var d = document.createElement('div');
    if (cls) d.className = cls;
    if (id) d.id = id;
    return d;
}
function makeCheckRow(cbId, labelText, onChange) {
    var d = makeDiv('inline-check');
    var cb = makeInput(cbId, 'checkbox');
    cb.style.width = 'auto'; cb.style.margin = '0';
    if (onChange) cb.onchange = onChange;
    var lbl = makeLabel(labelText, cbId);
    d.appendChild(cb); d.appendChild(lbl);
    return d;
}
function makeOtherPair(selectId, selectOpts, otherPlaceholder, onChange) {
    var wrapper = makeDiv();
    var sel = makeSelect(selectId, selectOpts, function () { autoToggleOther(this); if (onChange) onChange(this); });
    var inp = makeInput(selectId + '_other', 'text', otherPlaceholder);
    inp.className = 'other-input';
    wrapper.appendChild(sel);
    wrapper.appendChild(inp);
    return wrapper;
}
function addClient() {
    clientCount++;
    var idx = clientCount;
    var container = el('clients-container');
    var card = makeDiv('client-card'); card.id = 'client-card-' + idx;
    var title = makeDiv('client-card-title'); title.textContent = '案主 ' + idx;
    var removeBtn = document.createElement('button');
    removeBtn.className = 'client-remove-btn';
    removeBtn.textContent = '✕ 移除';
    removeBtn.onclick = function () { card.remove(); };
    card.appendChild(title); card.appendChild(removeBtn);
    // 基本資料 row
    var row1 = makeDiv('row');
    // 姓名
    var d1 = makeDiv(); d1.appendChild(makeSmall('姓名', 'field-label'));
    d1.appendChild(makeInput('c' + idx + '_name', 'text', '請輸入案主姓名'));
    row1.appendChild(d1);
    // 生日
    var d2 = makeDiv(); d2.appendChild(makeSmall('出生日期（可選擇或輸入民國 YYY/MM/DD）', 'field-label'));
    var bdRow = makeDiv('roc-date-row');
    var picker = makeInput('c' + idx + '_bdate_picker', 'date');
    picker.style.flex = '1.5'; picker.style.marginBottom = '0';
    picker.onchange = function () { syncRocFromPicker(idx); };
    var orSpan = document.createElement('span'); orSpan.textContent = '或'; orSpan.style.color = '#888'; orSpan.style.fontSize = '0.85em';
    var rocInp = makeInput('c' + idx + '_bdate_roc', 'text', '民國 YYY/MM/DD');
    rocInp.style.flex = '1'; rocInp.style.marginBottom = '0';
    rocInp.onchange = function () { syncPickerFromRoc(idx); };
    bdRow.appendChild(picker); bdRow.appendChild(orSpan); bdRow.appendChild(rocInp);
    d2.appendChild(bdRow);
    row1.appendChild(d2);
    // 監護狀態
    var d3 = makeDiv(); d3.appendChild(makeSmall('監護狀態', 'field-label'));
    var custodyOpts = [
        { v: '雙親共同監護', t: '雙親共同監護' }, { v: '父單獨監護', t: '父單獨監護' }, { v: '母單獨監護', t: '母單獨監護' },
        { v: '祖父母監護', t: '祖父母監護' }, { v: '外祖父母監護', t: '外祖父母監護' }, { v: '寄養家庭監護', t: '寄養家庭監護' },
        { v: '機構安置', t: '機構安置' }, { v: '其他親屬監護', t: '其他親屬監護' }, { v: '__other__', t: '其他' }];
    var custSel = makeSelect('c' + idx + '_custody', custodyOpts, function () { autoToggleOther(this); });
    var custInp = makeInput('c' + idx + '_custody_other', 'text', '請填寫監護狀態'); custInp.className = 'other-input';
    d3.appendChild(custSel); d3.appendChild(custInp);
    row1.appendChild(d3);
    card.appendChild(row1);
    // 就學區塊
    var schoolSec = makeDiv('sub-section');
    var schoolTitle = makeDiv('sub-section-title'); schoolTitle.textContent = '📚 就學狀態';
    schoolSec.appendChild(schoolTitle);
    var inSchoolRow = makeCheckRow('c' + idx + '_in_school', '目前就學中', function () {
        el('c' + idx + '_school_detail').classList.toggle('hidden', !this.checked);
    });
    schoolSec.appendChild(inSchoolRow);
    var schoolDetail = makeDiv('hidden'); schoolDetail.id = 'c' + idx + '_school_detail';
    var snInput = makeInput('c' + idx + '_school_name', 'text', '就學學校名稱'); schoolDetail.appendChild(snInput);
    var stRow = makeDiv('school-type-row');
    // 學制
    var sd1 = makeDiv(); sd1.appendChild(makeSmall('學制', 'field-label'));
    var lvOpts = [{ v: '幼兒園', t: '幼兒園' }, { v: '國小', t: '國小' }, { v: '國中', t: '國中' }, { v: '高中', t: '高中' }, { v: '__other__', t: '其他' }];
    var lvSel = makeSelect('c' + idx + '_school_level', lvOpts, function () { autoToggleOther(this); });
    var lvInp = makeInput('c' + idx + '_school_level_other', 'text', '請填寫學制'); lvInp.className = 'other-input';
    sd1.appendChild(lvSel); sd1.appendChild(lvInp); stRow.appendChild(sd1);
    // 就學類型
    var sd2 = makeDiv(); sd2.appendChild(makeSmall('就學類型', 'field-label'));
    var stOpts = [{ v: '一般生', t: '一般生' }, { v: '特教生（資源班）', t: '特教生（資源班）' }, { v: '特教生（集中式特教班）', t: '特教生（集中式特教班）' }, { v: '__other__', t: '其他' }];
    var stSel = makeSelect('c' + idx + '_school_type', stOpts, function () { autoToggleOther(this); });
    var stInp = makeInput('c' + idx + '_school_type_other', 'text', '請填寫類型'); stInp.className = 'other-input';
    sd2.appendChild(stSel); sd2.appendChild(stInp); stRow.appendChild(sd2);
    // 在校適應
    var sd3 = makeDiv(); sd3.appendChild(makeSmall('在校適應', 'field-label'));
    var adOpts = [{ v: '狀況良好', t: '狀況良好' }, { v: '僅需低度關照', t: '僅需低度關照' }, { v: '輔導室專輔在案', t: '輔導室專輔在案' }, { v: '輔導室開設三級輔導', t: '輔導室開設三級輔導' }, { v: '__other__', t: '其他' }];
    var adSel = makeSelect('c' + idx + '_school_adaption', adOpts, function () { autoToggleOther(this); });
    var adInp = makeInput('c' + idx + '_school_adaption_other', 'text', '請填寫'); adInp.className = 'other-input';
    sd3.appendChild(adSel); sd3.appendChild(adInp); stRow.appendChild(sd3);
    schoolDetail.appendChild(stRow);
    schoolDetail.appendChild(makeSmall('就學質性敘述', 'field-label'));
    schoolDetail.appendChild(makeTA('c' + idx + '_school_desc', 'short', '請描述在校狀況、師生互動、學習表現等...'));
    schoolSec.appendChild(schoolDetail);
    card.appendChild(schoolSec);
    // 身心狀況區塊
    var psychSec = makeDiv('sub-section');
    var psychTitle = makeDiv('sub-section-title'); psychTitle.textContent = '🧠 身心狀況';
    psychSec.appendChild(psychTitle);
    var psychRow = makeDiv('row');
    // 身形
    var pd1 = makeDiv(); pd1.appendChild(makeSmall('身形', 'field-label'));
    var bodyOpts = [{ v: '體態適中', t: '體態適中' }, { v: '圓潤豐腴', t: '圓潤豐腴' }, { v: '壯碩結實', t: '壯碩結實' }, { v: '纖細苗條', t: '纖細苗條' }, { v: '骨感消瘦', t: '骨感消瘦' }, { v: '嬌小精緻', t: '嬌小精緻' }, { v: '高挑修長', t: '高挑修長' }, { v: '矮胖厚實', t: '矮胖厚實' }, { v: '發育遲緩偏小', t: '發育遲緩偏小' }, { v: '__other__', t: '其他' }];
    var bodySel = makeSelect('c' + idx + '_body', bodyOpts, function () { autoToggleOther(this); });
    var bodyInp = makeInput('c' + idx + '_body_other', 'text', '請填寫身形'); bodyInp.className = 'other-input';
    pd1.appendChild(bodySel); pd1.appendChild(bodyInp); psychRow.appendChild(pd1);
    // 性格
    var pd2 = makeDiv(); pd2.appendChild(makeSmall('性格特質', 'field-label'));
    var persOpts = [{ v: '活潑好動', t: '活潑好動' }, { v: '內向文靜', t: '內向文靜' }, { v: '開朗外向', t: '開朗外向' }, { v: '害羞謹慎', t: '害羞謹慎' }, { v: '敏感脆弱', t: '敏感脆弱' }, { v: '固執堅持', t: '固執堅持' }, { v: '衝動易怒', t: '衝動易怒' }, { v: '溫順配合', t: '溫順配合' }, { v: '情緒起伏大', t: '情緒起伏大' }, { v: '退縮封閉', t: '退縮封閉' }, { v: '__other__', t: '其他' }];
    var persSel = makeSelect('c' + idx + '_personality', persOpts, function () { autoToggleOther(this); });
    var persInp = makeInput('c' + idx + '_personality_other', 'text', '請填寫性格'); persInp.className = 'other-input';
    pd2.appendChild(persSel); pd2.appendChild(persInp); psychRow.appendChild(pd2);
    psychSec.appendChild(psychRow);
    // 診斷
    var diagRow = makeCheckRow('c' + idx + '_has_diag', '有診斷疾病', function () {
        el('c' + idx + '_diag_detail').classList.toggle('hidden', !this.checked);
    });
    diagRow.style.marginTop = '8px';
    psychSec.appendChild(diagRow);
    var diagDetail = makeDiv('hidden'); diagDetail.id = 'c' + idx + '_diag_detail';
    var diagList = makeDiv('diagnosis-list');
    var diagOptions = ['注意力缺乏過動症（ADHD）', '亞斯伯格症（ASD）', '對立反抗症（ODD）', '憂鬱症', '躁鬱症'];
    diagOptions.forEach(function (dv) {
        var di = makeDiv('diag-item');
        var cb = makeInput('', 'checkbox'); cb.name = 'c' + idx + '_diag'; cb.value = dv;
        cb.style.width = 'auto'; cb.style.margin = '0';
        di.appendChild(cb); di.appendChild(document.createTextNode(' ' + dv));
        diagList.appendChild(di);
    });
    // 其他診斷
    var diOther = makeDiv('diag-item');
    var diOtherCb = makeInput('c' + idx + '_diag_other_chk', 'checkbox');
    diOtherCb.name = 'c' + idx + '_diag'; diOtherCb.value = '__other__';
    diOtherCb.style.width = 'auto'; diOtherCb.style.margin = '0';
    var diOtherTxt = makeInput('c' + idx + '_diag_other_text', 'text', '請填寫診斷名稱');
    diOtherTxt.style.display = 'none'; diOtherTxt.style.width = 'auto'; diOtherTxt.style.flex = '1'; diOtherTxt.style.margin = '0 0 0 6px'; diOtherTxt.style.padding = '4px 8px';
    diOtherCb.onchange = function () { diOtherTxt.style.display = this.checked ? 'inline-block' : 'none'; };
    diOther.appendChild(diOtherCb); diOther.appendChild(document.createTextNode(' 其他：')); diOther.appendChild(diOtherTxt);
    diagList.appendChild(diOther);
    diagDetail.appendChild(diagList);
    diagDetail.appendChild(makeSmall('用藥情形', 'field-label'));
    diagDetail.appendChild(makeInput('c' + idx + '_medication', 'text', '請填寫藥物名稱、劑量或說明（無則留空）'));
    psychSec.appendChild(diagDetail);
    psychSec.appendChild(makeSmall('身心狀態質性敘述', 'field-label'));
    psychSec.appendChild(makeTA('c' + idx + '_psych_desc', 'short', '請描述案主整體身心狀況、情緒表達、行為觀察等...'));
    card.appendChild(psychSec);
    // 特殊情形區塊
    var specSec = makeDiv('sub-section');
    var specTitle = makeDiv('sub-section-title'); specTitle.textContent = '⚠️ 特殊情形';
    specSec.appendChild(specTitle);
    var specRow = makeCheckRow('c' + idx + '_has_special', '有特殊情形', function () {
        el('c' + idx + '_special_detail').classList.toggle('hidden', !this.checked);
    });
    specSec.appendChild(specRow);
    var specDetail = makeDiv('hidden'); specDetail.id = 'c' + idx + '_special_detail';
    specDetail.appendChild(makeTA('c' + idx + '_special_desc', 'short', '請描述特殊情形之質性敘述...'));
    specSec.appendChild(specDetail);
    card.appendChild(specSec);
    container.appendChild(card);
}
function syncRocFromPicker(idx) {
    var picker = el('c' + idx + '_bdate_picker');
    if (!picker.value) return;
    var d = new Date(picker.value);
    var rocYear = d.getFullYear() - 1911;
    el('c' + idx + '_bdate_roc').value = rocYear + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + String(d.getDate()).padStart(2, '0');
}
function syncPickerFromRoc(idx) {
    var roc = el('c' + idx + '_bdate_roc').value.trim();
    var match = roc.match(/^(\d{2,3})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (!match) return;
    el('c' + idx + '_bdate_picker').value = (parseInt(match[1]) + 1911) + '-' + match[2].padStart(2, '0') + '-' + match[3].padStart(2, '0');
}
// 家庭成員日期同步函式
function syncRocFromPickerFm(idx) {
    var picker = el('fm' + idx + '_bdate_picker');
    if (!picker || !picker.value) return;
    var d = new Date(picker.value);
    var rocYear = d.getFullYear() - 1911;
    el('fm' + idx + '_bdate_roc').value = rocYear + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + String(d.getDate()).padStart(2, '0');
    refreshFamilyLists();
}
function syncPickerFromRocFm(idx) {
    var roc = el('fm' + idx + '_bdate_roc').value.trim();
    var match = roc.match(/^(\d{2,3})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (!match) return;
    el('fm' + idx + '_bdate_picker').value = (parseInt(match[1]) + 1911) + '-' + match[2].padStart(2, '0') + '-' + match[3].padStart(2, '0');
    refreshFamilyLists();
}
// ============================================================
// 案家成員相關
// ============================================================
var familyMemberCount = 0;
var siblingCounters = {};
var siblingTitles = { '兄': ['大哥', '二哥', '三哥', '四哥', '五哥'], '姊': ['大姊', '二姊', '三姊', '四姊', '五姊'], '弟': ['大弟', '二弟', '三弟', '四弟', '五弟'], '妹': ['大妹', '二妹', '三妹', '四妹', '五妹'] };
var siblingBases = ['兄', '姊', '弟', '妹'];
function getSiblingTitle(base) {
    if (!siblingCounters[base]) siblingCounters[base] = 0;
    siblingCounters[base]++;
    var n = siblingCounters[base];
    var titles = siblingTitles[base];
    return '案' + (titles[n - 1] || n + base);
}
var roleOptions = [
    { v: '案父', t: '案父' }, { v: '案母', t: '案母' }, { v: '兄', t: '案兄（自動排序）' }, { v: '姊', t: '案姊（自動排序）' },
    { v: '弟', t: '案弟（自動排序）' }, { v: '妹', t: '案妹（自動排序）' }, { v: '案祖父', t: '案祖父' }, { v: '案祖母', t: '案祖母' },
    { v: '案外祖父', t: '案外祖父' }, { v: '案外祖母', t: '案外祖母' }, { v: '案繼父', t: '案繼父' }, { v: '案法父', t: '案法父' },
    { v: '案繼祖父', t: '案繼祖父' }, { v: '案繼祖母', t: '案繼祖母' }, { v: 'other', t: '其他（自填）' }
];
function addFamilyMember() {
    familyMemberCount++;
    var idx = familyMemberCount;
    var container = el('family-members-container');
    var card = makeDiv('client-card'); card.id = 'fm-card-' + idx;
    var cardTitle = makeDiv('client-card-title'); cardTitle.textContent = '成員 ' + idx; card.appendChild(cardTitle);
    var removeBtn = document.createElement('button'); removeBtn.className = 'client-remove-btn'; removeBtn.textContent = '✕ 移除';
    removeBtn.onclick = function () { card.remove(); refreshFamilyLists(); }; card.appendChild(removeBtn);
    var row1 = makeDiv('row');
    // 稱謂
    var rd1 = makeDiv(); rd1.style.maxWidth = '190px'; rd1.appendChild(makeSmall('稱謂', 'field-label'));
    var roleSel = makeSelect('fm' + idx + '_role', roleOptions, null);
    roleSel.onchange = function () {
        el('fm' + idx + '_role_custom').style.display = (roleSel.value === 'other') ? 'block' : 'none';
        refreshFamilyLists();
    };
    rd1.appendChild(roleSel); row1.appendChild(rd1);
    // 自填稱謂
    var rd2 = makeDiv(); rd2.style.maxWidth = '120px'; rd2.appendChild(makeSmall('自填稱謂', 'field-label'));
    var roleCustom = makeInput('fm' + idx + '_role_custom', 'text', '如：案阿姨'); roleCustom.style.display = 'none';
    rd2.appendChild(roleCustom); row1.appendChild(rd2);
    // 姓名
    var rd3 = makeDiv(); rd3.appendChild(makeSmall('姓名', 'field-label'));
    var nameInp = makeInput('fm' + idx + '_name', 'text', '姓名');
    nameInp.oninput = refreshFamilyLists;
    rd3.appendChild(nameInp); row1.appendChild(rd3);
    // 生日（日曆 + 民國年文字雙輸入）
    var rd4 = makeDiv();
    // 小字提示
    var bdLabel = makeSmall('出生日期', 'field-label');
    var bdHint = makeSmall('★ 可點選日曆，或直接輸入民國年（如111/9/12），按 Tab 切換');
    bdHint.style.color = '#999'; bdHint.style.fontSize = '0.76em'; bdHint.style.display = 'block';
    rd4.appendChild(bdLabel); rd4.appendChild(bdHint);
    var bdRow = makeDiv('roc-date-row');
    var bdPicker = makeInput('fm' + idx + '_bdate_picker', 'date');
    bdPicker.style.flex = '1.5'; bdPicker.style.marginBottom = '0';
    bdPicker.onchange = function () { syncRocFromPickerFm(idx); };
    var orSpanFm = document.createElement('span'); orSpanFm.textContent = '或'; orSpanFm.style.color = '#888'; orSpanFm.style.fontSize = '0.85em';
    var bdRoc = makeInput('fm' + idx + '_bdate_roc', 'text', '民國 YYY/MM/DD');
    bdRoc.style.flex = '1'; bdRoc.style.marginBottom = '0';
    bdRoc.onchange = function () { syncPickerFromRocFm(idx); };
    bdRow.appendChild(bdPicker); bdRow.appendChild(orSpanFm); bdRow.appendChild(bdRoc);
    rd4.appendChild(bdRow); row1.appendChild(rd4);
    // 將舊的 fm+idx+_bdate 給就成員報表讀取用（銀行餘代數）
    card.appendChild(row1);
    // 國籍 row
    var row2 = makeDiv('row');
    var nat1 = makeDiv(); nat1.appendChild(makeSmall('國籍', 'field-label'));
    var natSel = makeSelect('fm' + idx + '_nat', [
        { v: 'local', t: '本國籍（非原住民）' }, { v: 'indigenous', t: '本國籍（原住民）' }, { v: 'foreign', t: '外國籍' }], null);
    natSel.onchange = function () { updateNat(idx); };
    nat1.appendChild(natSel); row2.appendChild(nat1);
    // 族群（hidden）
    var tribeDiv = makeDiv(); tribeDiv.id = 'fm' + idx + '_tribe_div'; tribeDiv.style.display = 'none';
    tribeDiv.appendChild(makeSmall('族群', 'field-label'));
    var tribeOpts = ['阿美族', '排灣族', '布農族', '泰雅族', '魯凱族', '鄒族', '賽夏族', '雅美（達悟）族', '邵族', '噶瑪蘭族', '太魯閣族', '撒奇萊雅族', '賽德克族', '拉阿魯哇族', '卡那卡那富族', '其他'];
    tribeDiv.appendChild(makeSelect('fm' + idx + '_tribe', tribeOpts.map(function (t) { return { v: t, t: t }; }), null));
    row2.appendChild(tribeDiv);
    // 外國籍（hidden）
    var foreignDiv = makeDiv(); foreignDiv.id = 'fm' + idx + '_foreign_div'; foreignDiv.style.display = 'none';
    foreignDiv.appendChild(makeSmall('國籍名稱', 'field-label'));
    foreignDiv.appendChild(makeInput('fm' + idx + '_foreign_name', 'text', '如：越南籍'));
    row2.appendChild(foreignDiv);
    // 歸化（hidden）
    var natDiv = makeDiv(); natDiv.id = 'fm' + idx + '_naturalized_div'; natDiv.style.display = 'none';
    natDiv.style.alignItems = 'center'; natDiv.style.gap = '6px';
    var natCb = makeInput('fm' + idx + '_naturalized', 'checkbox'); natCb.style.width = 'auto'; natCb.style.margin = '0';
    natDiv.appendChild(natCb); natDiv.appendChild(makeLabel('已歸化', 'fm' + idx + '_naturalized'));
    row2.appendChild(natDiv);
    card.appendChild(row2);
    // 工作/照顧 row
    var row3 = makeDiv('row');
    var jr = makeDiv(); jr.appendChild(makeSmall('從事工作 / 職業', 'field-label'));
    jr.appendChild(makeInput('fm' + idx + '_job', 'text', '如：家管、工廠作業員...'));
    row3.appendChild(jr);
    var cgDiv = makeDiv(); cgDiv.style.display = 'flex'; cgDiv.style.alignItems = 'center'; cgDiv.style.gap = '8px'; cgDiv.style.paddingTop = '20px';
    var cgCb = makeInput('fm' + idx + '_caregiver', 'checkbox'); cgCb.style.width = 'auto'; cgCb.style.margin = '0';
    cgCb.onchange = refreshFamilyLists;
    cgDiv.appendChild(cgCb); cgDiv.appendChild(makeLabel('主要照顧者', 'fm' + idx + '_caregiver'));
    row3.appendChild(cgDiv);
    card.appendChild(row3);
    card.appendChild(makeSmall('質性陳述', 'field-label'));
    card.appendChild(makeTA('fm' + idx + '_desc', 'short', '質性描述此成員的互動、態度或狀況...'));
    container.appendChild(card);
    refreshFamilyLists();
}
function updateNat(idx) {
    var val = el('fm' + idx + '_nat').value;
    el('fm' + idx + '_tribe_div').style.display = val === 'indigenous' ? 'block' : 'none';
    el('fm' + idx + '_foreign_div').style.display = val === 'foreign' ? 'block' : 'none';
    el('fm' + idx + '_naturalized_div').style.display = val === 'foreign' ? 'flex' : 'none';
}
function refreshFamilyLists() {
    for (var k in siblingCounters) siblingCounters[k] = 0;
    var cards = document.querySelectorAll('.client-card[id^="fm-card-"]');
    var allMembers = [], siblingMembers = [];
    cards.forEach(function (card) {
        var idx = card.id.replace('fm-card-', '');
        var roleRaw = el('fm' + idx + '_role').value;
        var displayRole;
        if (roleRaw === 'other') {
            displayRole = el('fm' + idx + '_role_custom').value || '其他';
        } else if (siblingBases.includes(roleRaw)) {
            displayRole = getSiblingTitle(roleRaw);
            var t = card.querySelector('.client-card-title');
            if (t) t.textContent = '成員 ' + idx + '（' + displayRole + '）';
        } else {
            displayRole = roleRaw;
        }
        var name = el('fm' + idx + '_name').value;
        var label = name ? displayRole + '（' + name + '）' : displayRole;
        var isCaregiver = el('fm' + idx + '_caregiver').checked;
        allMembers.push({ idx: idx, label: label, displayRole: displayRole, isCaregiver: isCaregiver, roleRaw: roleRaw });
        if (siblingBases.includes(roleRaw)) siblingMembers.push({ idx: idx, label: label });
    });
    var cCards = document.querySelectorAll('.client-card[id^="client-card-"]');
    var clientsForIncome = [];
    cCards.forEach(function (c) {
        var ci = c.id.replace('client-card-', '');
        var n = el('c' + ci + '_name').value || '案主' + ci;
        clientsForIncome.push({ idx: 'c' + ci, label: n });
    });
    // 手足顯示
    el('fam_sibling_section').classList.toggle('hidden', siblingMembers.length === 0);
    el('fam_sibling_check_list').innerHTML = siblingMembers.map(function (m) {
        return '<label class="member-check-item"><input type="checkbox" name="sib_rel" value="' + esc(m.label) + '" style="width:auto; margin:0;"> ' + esc(m.label) + '</label>';
    }).join('');
    el('fam_other_rel_check_list').innerHTML = allMembers.map(function (m) {
        return '<label class="member-check-item"><input type="checkbox" name="other_rel" value="' + esc(m.label) + '" style="width:auto; margin:0;"> ' + esc(m.label) + '</label>';
    }).join('');
    el('fam_caregiver_check_list').innerHTML = allMembers.map(function (m) {
        return '<label class="member-check-item"><input type="checkbox" name="caregiver_sel" value="' + esc(m.label) + '"' + (m.isCaregiver ? ' checked' : '') + ' style="width:auto; margin:0;"> ' + esc(m.label) + '</label>';
    }).join('');
    var allForIncome = clientsForIncome.concat(allMembers);
    el('fam_income_check_list').innerHTML = allForIncome.map(function (m) {
        var fid = 'income_' + m.idx;
        return '<div class="income-row"><input type="checkbox" id="' + fid + '_chk" name="income_sel" style="width:auto; margin:0;"><label for="' + fid + '_chk" style="min-width:120px;">' + esc(m.label) + '</label><input type="number" id="' + fid + '_amt" placeholder="月薪（元）" style="flex:1; margin:0;"></div>';
    }).join('');
    // 行為人下拉
    var perpSel = el('perpetrator_select');
    var prev = perpSel.value;
    perpSel.innerHTML = '<option value="">─ 請選擇行為人 ─</option>' +
        allMembers.map(function (m) { return '<option value="' + esc(m.displayRole) + '">' + esc(m.label) + '</option>'; }).join('') +
        '<option value="__other__">其他</option>';
    perpSel.value = prev;
}
function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
// ============================================================
// 開銷 / 補助
// ============================================================
var expenseCount = 0;
var expenseTypes = ['房租', '房貸', '水電費', '瓦斯費', '電話/網路費', '保險費', '學費', '伙食費', '醫療費', '交通費', '其他'];
function addExpense() {
    expenseCount++;
    var ec = expenseCount;
    var row = makeDiv('expense-row'); row.id = 'exp-row-' + ec;
    var sel = makeSelect('exp' + ec + '_type', expenseTypes.map(function (t) { return { v: t, t: t }; }), null);
    sel.style.flex = '1.2'; sel.style.margin = '0';
    var amt = makeInput('exp' + ec + '_amt', 'number', '金額（元/月）'); amt.style.flex = '1'; amt.style.margin = '0';
    var rmBtn = document.createElement('button'); rmBtn.className = 'remove-small-btn'; rmBtn.textContent = '✕';
    rmBtn.onclick = function () { row.remove(); };
    row.appendChild(sel); row.appendChild(amt); row.appendChild(rmBtn);
    el('expenses-container').appendChild(row);
}
var subsidyCount = 0;
function toggleSubsidy() {
    el('fam_subsidy_detail').classList.toggle('hidden', !el('fam_has_subsidy').checked);
}
var subsidyTypes = ['低收入戶補助', '中低收入戶補助', '租屋補助', '急難救助', '兒童生活補助', '托育補助', '身心障礙補助', '其他補助'];
function addSubsidy() {
    subsidyCount++;
    var sc = subsidyCount;
    var row = makeDiv('subsidy-item'); row.id = 'sub-row-' + sc;
    var sel = makeSelect('sub' + sc + '_type', subsidyTypes.map(function (t) { return { v: t, t: t }; }), null);
    sel.style.flex = '1.5'; sel.style.margin = '0';
    var amt = makeInput('sub' + sc + '_amt', 'number', '金額（元/月）'); amt.style.flex = '1'; amt.style.margin = '0';
    var rmBtn = document.createElement('button'); rmBtn.className = 'remove-small-btn'; rmBtn.textContent = '✕';
    rmBtn.onclick = function () { row.remove(); };
    row.appendChild(sel); row.appendChild(amt); row.appendChild(rmBtn);
    el('subsidy-container').appendChild(row);
}
// ============================================================
// 報告產生
// ============================================================
function generateReport() {
    var r = '';
    // 一、案情來源
    var reportDateRoc = toRocDateStr(el('report_date').value);
    var reportUnit = getSelectVal('report_unit');
    var acceptDateRoc = toRocDateStr(el('accept_date').value);
    var isSameDay = el('accept_same_day').checked;
    r += '一、案情來源：' + (reportDateRoc || '○○年○○月○○日') + '由' + (reportUnit || '○○') + '通報，本中心於' + (isSameDay ? '當日' : (acceptDateRoc || '○○月○○日')) + '受理通報並下派社工進行調查。\n\n';
    // 二、通報史
    var historyText = '';
    var pasteEl = el('history_paste');
    if (pasteEl && pasteEl.value.trim()) {
        var raw = pasteEl.value;
        // 擷取（查詢資料:）以下至（三、）之前的段落
        var startIdx = raw.indexOf('查詢資料:');
        if (startIdx === -1) startIdx = raw.indexOf('查詢資料：');
        var endIdx = raw.indexOf('三、');
        if (startIdx !== -1) {
            // 跟在「查詢資料:」序列符的每一行開始
            var afterKey = raw.indexOf('\n', startIdx);
            var sliceEnd = endIdx !== -1 && endIdx > startIdx ? endIdx : raw.length;
            historyText = raw.substring(afterKey !== -1 ? afterKey + 1 : startIdx, sliceEnd).trim();
        } else {
            historyText = raw.trim();
        }
    }
    r += '二、通報史：' + (historyText || '（未填）') + '\n\n';
    // 三、社工調查結果
    r += '三、社工調查結果\n';
    var eventTime = el('event_datetime').value.replace('T', ' ');
    r += '(一)案發時間：' + (eventTime || '（未填）') + '\n';
    var perpVal = el('perpetrator_select').value;
    var perpetrator = perpVal === '__other__' ? (el('perpetrator_select_other').value.trim() || '') : perpVal;
    r += '(二)行為人：' + (perpetrator || '（未選擇）') + '\n';
    var injuryPart = getSelectVal('injury_part');
    var injurySide = getSelectVal('injury_side');
    var injuryPos = getSelectVal('injury_pos');
    var injuryStatus = getSelectVal('injury_status');
    var isFaded = el('is_faded').checked ? '，傷勢已淡化' : '';
    var injuryText = '';
    if (injuryPart || injuryStatus) {
        injuryText = '案主' + (injurySide || '') + (injuryPos || '') + (injuryPart || '') + '可見' + (injuryStatus || '') + isFaded + '。';
    }
    r += '(三)傷勢狀況：' + (injuryText || '（未填）') + '\n';
    var investigation = '';
    for (var i = 1; i <= 3; i++) {
        var tgt = el('inv_target_' + i);
        if (!tgt) continue;
        var finalTarget = tgt.value;
        if (i === 2 && finalTarget === '其他') { var c2 = el('inv_target_2_custom'); finalTarget = c2 ? c2.value : ''; }
        var txt = el('inv_text_' + i); if (!txt) continue;
        if (txt.value) investigation += finalTarget + '陳述：' + translateText(txt.value) + '。\n';
    }
    var et4 = el('inv_target_4_custom'), ix4 = el('inv_text_4');
    if (ix4 && ix4.value) investigation += (et4 ? et4.value : '') + '陳述：' + translateText(ix4.value) + '。\n';
    r += '(四)調查情形：\n' + (investigation || '（未填）\n') + '\n';
    // 四、案主狀況
    r += '四、案主狀況：\n';
    var cCards = document.querySelectorAll('.client-card[id^="client-card-"]');
    cCards.forEach(function (card, ci) {
        var id = card.id.replace('client-card-', '');
        var name = el('c' + id + '_name').value || '（未填姓名）';
        var rocDate = el('c' + id + '_bdate_roc').value || '（未填）';
        var custody = getSelectVal('c' + id + '_custody');
        var body = getSelectVal('c' + id + '_body');
        var pers = getSelectVal('c' + id + '_personality');
        var pv = el('c' + id + '_bdate_picker').value;
        var ageStr = '';
        if (pv) { var bd = new Date(pv), today = new Date(); var age = today.getFullYear() - bd.getFullYear(); if (today < new Date(today.getFullYear(), bd.getMonth(), bd.getDate())) age--; ageStr = age + '歲'; }
        var prefix = cCards.length > 1 ? '案主' + (ci + 1) + '─' : '';
        r += '(一)基本資料：' + prefix + name + '，' + (ageStr ? ageStr + '，' : '') + '民國' + rocDate + '生';
        if (body) r += '，身形' + body;
        if (pers) r += '，性格' + pers;
        if (custody) r += '，' + custody;
        r += '。\n';
        var psychDesc = el('c' + id + '_psych_desc').value;
        var diagLine = '';
        if (el('c' + id + '_has_diag').checked) {
            var diags = Array.from(document.querySelectorAll('input[name="c' + id + '_diag"]:checked')).map(function (cb) {
                return cb.value === '__other__' ? el('c' + id + '_diag_other_text').value : cb.value;
            }).filter(Boolean);
            var meds = el('c' + id + '_medication').value;
            if (diags.length) diagLine = '經診斷有' + diags.join('、');
            if (meds) diagLine += '，目前用藥：' + meds;
            if (diagLine) diagLine += '。';
        }
        r += '(二)身心狀況：' + diagLine + (psychDesc || '（未填）') + '\n';
        if (el('c' + id + '_in_school').checked) {
            var school = el('c' + id + '_school_name').value;
            var level = getSelectVal('c' + id + '_school_level');
            var stype = getSelectVal('c' + id + '_school_type');
            var adapt = getSelectVal('c' + id + '_school_adaption');
            var sdesc = el('c' + id + '_school_desc').value;
            r += '(三)就學狀況：就讀' + (school || '（未填學校）') + (level ? ' ' + level : '');
            if (stype) r += '，' + stype;
            if (adapt) r += '，在校適應：' + adapt;
            r += '。' + (sdesc || '') + '\n';
        } else {
            r += '(三)就學狀況：目前未就學。\n';
        }
        if (el('c' + id + '_has_special').checked) {
            var sp = el('c' + id + '_special_desc').value;
            if (sp) r += '特殊情形：' + sp + '\n';
        }
    });
    r += '\n';
    // 五、家庭成員
    r += '五、家庭成員：\n' + getFamilyMemberReport() + '\n\n';
    // 六、家庭關係
    r += '六、家庭關係：\n' + getFamilyRelationReport() + '\n';
    // 七、社工評估
    r += '七、社工評估：\n' + getSocialWorkerAssessment(perpetrator);
    el('report_preview').innerText = r;
    el('report_preview').style.display = 'block';
}
function getFamilyMemberReport() {
    for (var k in siblingCounters) siblingCounters[k] = 0;
    var cards = document.querySelectorAll('.client-card[id^="fm-card-"]');
    var careSubject = document.querySelectorAll('.client-card[id^="client-card-"]').length > 1 ? '案主們' : '案主';
    return Array.from(cards).map(function (card) {
        var idx = card.id.replace('fm-card-', '');
        var roleRaw = el('fm' + idx + '_role').value;
        var displayRole = roleRaw === 'other' ? (el('fm' + idx + '_role_custom').value || '其他') : siblingBases.includes(roleRaw) ? getSiblingTitle(roleRaw) : roleRaw;
        var name = el('fm' + idx + '_name').value;
        // 支援新版雙輸入（_bdate_picker）與舊版（_bdate）
        var bdatePickerEl = el('fm' + idx + '_bdate_picker');
        var bdateOldEl = el('fm' + idx + '_bdate');
        var bdate = (bdatePickerEl && bdatePickerEl.value) ? bdatePickerEl.value : (bdateOldEl ? bdateOldEl.value : '');
        var ageStr = '', bdateStr = '';
        if (bdate) {
            var bd = new Date(bdate), today = new Date();
            var age = today.getFullYear() - bd.getFullYear();
            if (today < new Date(today.getFullYear(), bd.getMonth(), bd.getDate())) age--;
            ageStr = age + '歲'; bdateStr = '（' + (bd.getFullYear() - 1911) + '年' + (bd.getMonth() + 1) + '月' + bd.getDate() + '日生）';
        }
        var natVal = el('fm' + idx + '_nat').value, natStr = '';
        if (natVal === 'local') natStr = '本國籍';
        else if (natVal === 'indigenous') natStr = '本國籍' + el('fm' + idx + '_tribe').value;
        else { var fn = el('fm' + idx + '_foreign_name').value || '外國籍'; natStr = el('fm' + idx + '_naturalized').checked ? fn + '歸化' : fn; }
        var job = el('fm' + idx + '_job').value || '（未填職業）';
        var isCaregiver = el('fm' + idx + '_caregiver').checked;
        var desc = el('fm' + idx + '_desc').value;
        var line = displayRole + '：' + name + '，' + ageStr + bdateStr + '，' + natStr + '，' + job;
        if (isCaregiver) line += '，為' + careSubject + '主要照顧者';
        line += desc ? '，' + desc + '。' : '。';
        return line;
    }).join('\n');
}
function getFamilyRelationReport() {
    var struct = getSelectVal('fam_structure');
    var marStatus = getSelectVal('fam_marriage_status');
    var marDesc = el('fam_marriage_desc').value;
    var parentDesc = el('fam_parent_desc').value;
    var sibChecked = Array.from(document.querySelectorAll('input[name="sib_rel"]:checked')).map(function (c) { return c.value; });
    var sibDesc = el('fam_sibling_desc').value;
    var otherChecked = Array.from(document.querySelectorAll('input[name="other_rel"]:checked')).map(function (c) { return c.value; });
    var otherDesc = el('fam_other_rel_desc').value;
    var caregivers = Array.from(document.querySelectorAll('input[name="caregiver_sel"]:checked')).map(function (c) { return c.value; });
    var careDesc = el('fam_care_desc').value;
    var houseOwn = getSelectVal('fam_house_own');
    var houseType = getSelectVal('fam_house_type');
    var houseCond = getSelectVal('fam_house_condition');
    var houseDesc = el('fam_house_desc').value;
    var rpt = '';
    rpt += '(一)家庭結構：' + (struct || '（未填）') + '。\n';
    rpt += '(二)家庭關係：\n';
    rpt += '  1. 婚姻關係（' + (marStatus || '未填') + '）：' + (marDesc || '（未填）') + '\n';
    rpt += '  2. 親子關係：' + (parentDesc || '（未填）') + '\n';
    if (sibChecked.length || sibDesc) rpt += '  3. 手足關係（' + (sibChecked.join('、') || '未特別勾選') + '）：' + (sibDesc || '（未填）') + '\n';
    if (otherChecked.length || otherDesc) rpt += '  4. 其他親屬關係（' + (otherChecked.join('、') || '未特別勾選') + '）：' + (otherDesc || '（未填）') + '\n';
    rpt += '(三)家庭照顧功能（主要照顧者：' + (caregivers.join('、') || '未勾選') + '）：' + (careDesc || '（未填）') + '\n';
    rpt += '(四)居住環境：' + (houseOwn || '') + '，' + (houseType || '') + '，環境' + (houseCond || '') + '。' + (houseDesc || '（未填）') + '\n';
    var incomeItems = [];
    document.querySelectorAll('input[name="income_sel"]:checked').forEach(function (chk) {
        var fid = chk.id.replace('_chk', '');
        var lbl = chk.nextElementSibling ? chk.nextElementSibling.textContent.trim() : '';
        var amt = el(fid + '_amt'); incomeItems.push(lbl + ' 月收入 ' + (amt && amt.value ? amt.value + '元' : '（未填）'));
    });
    var expItems = [];
    document.querySelectorAll('[id^="exp-row-"]').forEach(function (row) {
        var ec = row.id.replace('exp-row-', ''); var t = el('exp' + ec + '_type'); var a = el('exp' + ec + '_amt');
        expItems.push((t ? t.value : '') + (a && a.value ? ' ' + a.value + '元/月' : '（未填）'));
    });
    var subItems = [];
    if (el('fam_has_subsidy').checked) {
        document.querySelectorAll('[id^="sub-row-"]').forEach(function (row) {
            var sc = row.id.replace('sub-row-', ''); var t = el('sub' + sc + '_type'); var a = el('sub' + sc + '_amt');
            subItems.push((t ? t.value : '') + (a && a.value ? '（' + a.value + '元/月）' : ''));
        });
    }
    rpt += '(五)經濟狀況：';
    if (incomeItems.length) rpt += '收入來源：' + incomeItems.join('；') + '。';
    if (expItems.length) rpt += '每月開銷：' + expItems.join('、') + '。';
    if (subItems.length) rpt += '政府補助：' + subItems.join('、') + '。';
    rpt += '\n';
    return rpt;
}
function getSocialWorkerAssessment(perpetrator) {
    var h = Array.from(document.querySelectorAll('input[name="sdm_h"]:checked')).map(function (c) { return '「' + c.value + '」'; });
    var r = Array.from(document.querySelectorAll('#sdm_r input:checked')).map(function (c) { return '「' + c.value + '」'; });
    var safety = el('safety_decision').value;
    var safetyDetail = el('safety_detail').value;
    var risk = el('risk_level').value;
    var action = el('case_action').value;
    var isOpen = action === '開案提供後續處遇';
    var isPlacement = action === '不安全安置' || safety === '不安全';
    var isNoAction = action === '不後處';
    // 案主數量代詞
    var cCards2 = document.querySelectorAll('.client-card[id^="client-card-"]');
    var clientWord = cCards2.length > 1 ? '案主們' : '案主';
    // 案情簡述
    var caseSummary = (el('case_summary') && el('case_summary').value.trim()) ? el('case_summary').value.trim() : '';
    var r1 = '1. 依SDM安全評估表評估，';
    r1 += h.length ? '案主符合' + h.join('、') + '之無助狀態；' : '案主無符合之無助狀態，';
    r1 += r.length ? '案家有符合' + r.join('、') + '之危險因素指標；' : '案家無符合之危險因素指標，';
    if (safety === '留置家中安全無虞') r1 += '評估案主留置家中安全無虞。';
    else if (safety === '有計畫才安全') r1 += '評估案主留置家中需有計畫才安全，已簽屬安全計畫。';
    else r1 += '評估案主留置家中不安全，評估案主未受適當養育照顧，於' + (safetyDetail || '○年○月○日') + '進行保護安置。';
    r1 += '依SDM風險評估表評估，最終決定的風險層級為' + risk + '，採取的服務行動為' + action + '。\n';
    var workerAct = el('worker_service').value;
    var famResp = el('family_response').value;
    var perp = perpetrator || '行為人';
    // 第二點固定格式（三情境）
    var r2 = '2. 本案經調查為' + perp + '對' + clientWord + (caseSummary || '【案情簡述】') + '，';
    if (isPlacement) {
        r2 += '為確保' + clientWord + '人身安全，依兒少權法第56條進行保護安置。';
    } else if (isOpen) {
        r2 += '管教樣態已違反兒少權法第49條。';
    } else {
        r2 += '雖有管教事實，但無違反兒少權法第49條。';
    }
    if (workerAct) r2 += translateText(workerAct) + '，';
    if (famResp) r2 += translateText(famResp) + '。';
    // 案家需求後導語
    if (isPlacement || isOpen) {
        r2 += '評估案家有兒少保護服務需求，擬轉介家處單位提供家庭處遇服務。';
    } else {
        r2 += '評估案家無兒少保護服務需求。';
        var noActSel = el('no_action_type');
        if (noActSel) {
            var noActVal2 = noActSel.value === '__other__'
                ? (el('no_action_type_other') ? el('no_action_type_other').value.trim() : '') : noActSel.value;
            if (noActVal2) {
                var useTrack = ['學校', '成人保護', '性侵害保護'];
                if (useTrack.indexOf(noActVal2) !== -1) {
                    r2 += '擬續由「' + noActVal2 + '」續予追蹤' + clientWord + '受照顧狀況。';
                } else {
                    r2 += '轉介「' + noActVal2 + '」續予提供追蹤輔導服務。';
                }
            }
        }
    }
    var fHr = el('forced_hr').value, sHr = el('stress_hr').value;
    if (fHr > 0 || sHr > 0) {
        r2 += '考量行為人';
        if (fHr > 0) r2 += '仍須提升其親職教養技巧(裁強制親職教育)';
        if (fHr > 0 && sHr > 0) r2 += '並';
        if (sHr > 0) r2 += '仍須建立多元教養方式(轉介親職減壓服務)';
        r2 += '，故裁處';
        if (fHr > 0) r2 += '強制性親職教育' + fHr + '小時';
        if (fHr > 0 && sHr > 0) r2 += '及';
        if (sHr > 0) r2 += '轉介親職減壓服務' + sHr + '小時';
        r2 += '。';
    }
    return r1 + r2;
}
// ============================================================
// 初始化
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    addClient();
    addExpense();
    addSubsidy();
});
