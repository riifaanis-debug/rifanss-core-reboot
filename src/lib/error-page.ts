// Minimal server-rendered fallback page used when SSR fails catastrophically.
export function renderErrorPage(): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>تعذّر تحميل الصفحة</title>
    <style>
      body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
             background:#22042C; color:#fff; font-family:Tahoma, Arial, sans-serif; padding:24px; }
      .box { max-width:420px; text-align:center; }
      h1 { font-size:20px; margin:0 0 8px; color:#C7A969; }
      p { font-size:14px; line-height:1.8; opacity:.85; margin:0 0 20px; }
      a { display:inline-block; background:#C7A969; color:#22042C; text-decoration:none;
          padding:10px 20px; border-radius:10px; font-weight:bold; font-size:14px; }
    </style>
  </head>
  <body>
    <div class="box">
      <h1>تعذّر تحميل الصفحة</h1>
      <p>حدث خطأ غير متوقع أثناء تحميل الصفحة. يمكنك إعادة المحاولة أو العودة إلى الصفحة الرئيسية.</p>
      <a href="/">العودة للرئيسية</a>
    </div>
  </body>
</html>`;
}
