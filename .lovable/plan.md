# روابط نظيفة بدون (#) لكل صفحات ريفانس

## الهدف
كل صفحة وخدمة ونموذج يصبح لها رابط مباشر مثل `rifanss.com/health-waiver` يمكن نسخه ومشاركته، مع استمرار عمل كل الروابط القديمة التي فيها (#)، وبدون تغيير التصميم أو المحتوى أو قاعدة البيانات أو الصلاحيات.

## المسارات الجديدة (من الصفحات الموجودة فعلًا)

```text
القديم                                 الجديد
#/                                     /
#/about  #/goal  #/vision  #/message   /about  /goal  /vision  /message
#/mission  #/contact  #/complaints     /mission  /contact  /complaints
#/terms  #/privacy  #/cookies ...      /terms  /privacy  /cookies ... (كل الصفحات النظامية)
#/services                             /services
#/health-waiver (+ waive-info,
  product/bnk-6, waiver-health)        /health-waiver
#/service-page/<id>                    /services/<id>
#/business-field/<id>                  /fields/<id>
#/electronic-services                  /electronic-services
#/electronic-service/<id>              /electronic-services/<id>
#/section/<id>  #/category/<id>        /section/<id>  /category/<id>
#/product/<id>  و  .../apply           /product/<id>  و  /product/<id>/apply
#/service-apply/<id>                   /services/<id>/apply
#/client-card                          /client-card
#/dashboard  #/admin                   /dashboard  /admin (محمية كما هي)
#/contract|invoice|promissory/<id>     /contract/<id> ... (محمية كما هي)
/waiver                                بدون تغيير
```

روابط القفز داخل الصفحة الرئيسية (مثل `#business-fields`) تبقى كما هي لأنها للتمرير فقط.

## طريقة التنفيذ
1. **مصدر الصفحة من الرابط النظيف:** التطبيق يقرأ الصفحة الحالية من مسار الرابط بدل (#)، مع ترجمة الأسماء القديمة للجديدة في ملف واحد.
2. **تحويل تلقائي للروابط القديمة:** أي رابط قديم `rifanss.com/#/...` يتحول فورًا للرابط الجديد مع الحفاظ على المعاملات (مثل `?tab=contracts`). وأي زر داخلي ما زال يستخدم (#) يتحول تلقائيًا، فلا يتعطل أي زر.
3. **تحديث الأزرار والروابط الداخلية** لتشير مباشرة للمسار الجديد، وزر الرجوع في المتصفح يعمل طبيعيًا.
4. **معاينة واتساب لكل صفحة:** كل رابط يُرسل من الخادم بعنوان ووصف وصورة خاصة به (الخدمة باسمها ووصفها وصورتها الذهبية، والصفحات النظامية بعناوينها)، والصفحات الخاصة (لوحة العميل/الإدارة/المستندات) بعنوان عام و noindex.
5. **زر «مشاركة»** في صفحات الخدمات وصفحة الإعفاء: واتساب، نسخ الرابط، وقائمة المشاركة في الجوال. الرابط المنسوخ هو رابط الصفحة الحالية.
6. **الحماية:** لا تغيير على الصلاحيات؛ الصفحات الخاصة تبقى تتطلب الدخول، ولا تُضاف بيانات شخصية في الروابط.
7. **ملف sitemap** بكل الصفحات العامة.

## الاختبار والتقرير
- فتح كل مسار مباشرة وتحديثه على عرض الجوال والكمبيوتر (بلا 404).
- فتح عينة من الروابط القديمة بـ (#) والتأكد من التحويل.
- فحص وسوم المعاينة في رد الخادم لكل نوع صفحة.
- تجربة الدخول، لوحة العميل، لوحة الإدارة، ونموذج طلب.
- تقرير بجدول المسارات ونتيجة كل اختبار. معاينة واتساب الفعلية تظهر بعد النشر.

## تفاصيل تقنية
- المشروع على TanStack Router (لا يُستخدم BrowserRouter من React Router؛ النظام الحالي يدعم الروابط النظيفة والتحديث دون إعدادات استضافة).
- `src/lib/routes.ts`: جدول تحويل legacy hash ↔ clean path + `navigate(path)` عبر history.pushState وحدث popstate.
- `App.tsx`: `route` يُشتق من `pathname+search` إلى المفتاح الداخلي القائم (لتقليل التعديل)، ومستمع `hashchange` يحوّل `#/...` إلى `replaceState` للمسار النظيف.
- استبدال `window.location.hash = '#/…'` و`href="#/…"` في المكونات بـ `navigate()` و`href` نظيفة.
- `src/routes/$.tsx`: `head({ params })` يحسب العنوان/الوصف/og:image/canonical من بيانات الخدمات (ملف بيانات آمن للخادم)، مع إبقاء `ssr:false` للمكون.
- صور الخدمات: نسخ مقصوصة 1200x630 في `public/og/` بروابط مطلقة.
- `src/routes/sitemap[.]xml.ts`.
