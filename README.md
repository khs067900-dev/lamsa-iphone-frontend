# لمسه للأجهزة الذكية — Frontend

متجر إلكتروني متكامل لبيع الأجهزة الذكية بالأقساط، مبني بـ **Next.js 15** مع دعم كامل للغة العربية واتجاه RTL.

---

## 🛠 التقنيات المستخدمة

| التقنية | الإصدار | الغرض |
|---|---|---|
| Next.js | 15.x | إطار العمل الرئيسي (App Router) |
| React | 19.0 | مكتبة واجهة المستخدم |
| TypeScript | 5.x | الكتابة الصارمة للأنواع |
| Tailwind CSS | 4.x | التنسيق |
| Zustand | 5.x | إدارة الحالة (Cart + Company) |
| Framer Motion | 12.x | الأنيميشن |
| Swiper | 12.x | السلايدر |
| Lucide React | 1.x | الأيقونات |
| React Icons | 5.x | أيقونات إضافية |
| React Hot Toast | 2.x | الإشعارات |
| Sharp | 0.35 | تحسين الصور |

---

## 🚀 تشغيل المشروع

```bash
# تثبيت الحزم
npm install

# تشغيل بيئة التطوير
npm run dev

# بناء للإنتاج
npm run build

# تشغيل الإنتاج
npm start

# فحص الكود
npm run lint
```
---

## 🔐 نظام المصادقة

المصادقة تعتمد على **JWT Cookie** (`admin_token`) يُرسل من الباك ايند.

- الـ `middleware.ts` يحمي جميع مسارات `/admin/*` تلقائياً
- إذا لم يكن هناك توكن → يُعاد التوجيه إلى `/admin/login`
- إذا كان المستخدم مسجلاً ودخل `/admin/login` → يُعاد التوجيه إلى `/admin/dashboard`
- جميع طلبات الأدمن تمر عبر Route Handlers في `/api/admin/` كـ proxy

---

## 🛒 إدارة السلة

السلة مبنية بـ **Zustand** مع `persist` (تُحفظ في `localStorage`):

```ts
import { useCartStore } from "@/app/store/cartStore";

const { addItem, removeItem, totalItems, totalPrice } = useCartStore();
```

| الدالة | الوصف |
|---|---|
| `addItem(product)` | إضافة منتج (أو زيادة الكمية) |
| `removeItem(id)` | حذف منتج |
| `updateQty(id, qty)` | تحديث الكمية |
| `setCustomer(info)` | حفظ بيانات العميل |
| `clear()` | تفريغ السلة |
| `totalItems()` | إجمالي عدد العناصر |
| `totalPrice()` | إجمالي السعر |

---

## 🗂 التصنيفات والـ Slugs

التصنيفات الديناميكية تعتمد على `categoryConfig.ts` الذي يحتوي على خريطة كاملة من الـ slug إلى فلاتر المنتجات:

```ts
// مثال
"iphone-17-pro-max": {
  label: "ابل ايفون 17 برو ماكس",
  parentLabel: "الهواتف الذكية",
  parentHref: "/smartphones",
  filters: { category: "ابل ايفون 17 برو ماكس" },
}
```

التصنيفات الرئيسية المدعومة:
- 📱 الهواتف الذكية (`/smartphones`)
- 💻 اللابتوبات والشاشات (`/laptops`)
- 📟 الأجهزة اللوحية (`/tablets`)
- 🎧 الصوتيات والسماعات (`/audio`)
- 🎮 بلاي ستيشن (`/playstation`)
- 🎮 الألعاب (`/games`)
- ⌚ ساعات آبل (`/apple-watches`)
- 🔌 الإكسسوارات (`/accessories`)

---

## 🔒 الأمان (Security Headers)

الـ `middleware.ts` يضيف تلقائياً على كل الصفحات:

| الهيدر | القيمة |
|---|---|
| `Content-Security-Policy` | سياسة محكمة لمنع XSS |
| `Strict-Transport-Security` | HSTS في الإنتاج |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Cache-Control` | `no-store` لمسارات الأدمن |

---

## 🌐 SEO والـ Metadata

- **Metadata ديناميكية** تُجلب من بيانات الشركة في الباك ايند
- **Open Graph** و **Twitter Cards** مُعدّة بالكامل
- **Sitemap ديناميكي** في `/sitemap.ts` يشمل جميع المنتجات والتصنيفات
- **robots.ts** يتحكم في فهرسة محركات البحث
- **JSON-LD** (Schema.org) للمنظمة وموقع البحث في الصفحة الرئيسية
- **Cairo Font** من Google Fonts مع دعم العربية واللاتينية

---

## 📡 API Proxy

جميع طلبات الفرونت ايند تمر عبر Route Handlers في `/app/api/` بدلاً من الاتصال المباشر بالباك ايند، مما يحمي عنوان الباك ايند ويضيف طبقة أمان إضافية.

```
المتصفح → /api/admin/products → Route Handler → Backend API
```

دالة `apiFetch` في `lib/api.ts` تتحقق من المسارات المسموح بها قبل أي طلب:

```ts
import { apiFetch } from "@/app/lib/api";

const res = await apiFetch("/api/products", { method: "GET" });
```

---

## 🖨 طباعة الوثائق

لوحة الأدمن تدعم طباعة:
- **الفاتورة** (`/admin/orders/[id]/invoice`)
- **العقد** (`/admin/orders/[id]/contract`)
- **إيصال الاستلام** (`/admin/orders/[id]/receipt`)
- **إشعار الإلغاء** (`/admin/orders/[id]/cancellation`)
- **صفحة الطباعة الكاملة** (`/admin/orders/[id]/print`)

---

## 📲 إشعارات Telegram

عند إتمام أي طلب جديد، يُرسل إشعار تلقائي عبر Telegram Bot إلى الأدمن عبر مسار `/api/notify`.

---

## 🏗 الإنتاج (Deployment)

المشروع مُنشر على **Railway** ويتصل بالباك ايند عبر:

```
NEXT_PUBLIC_API_URL=https://lamsa-backend-production.up.railway.app
BACKEND_URL=https://lamsa-backend-production.up.railway.app
```

الصور مُحسّنة بـ `sharp` وتدعم صيغ `avif` و `webp` مع Remote Patterns لـ Cloudinary وRailway.
