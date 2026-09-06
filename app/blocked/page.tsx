export default function BlockedPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-black px-6 relative overflow-hidden"
      dir="rtl"
    >
      {/* خلفية حمرا بتنبض */}
      <div className="absolute inset-0 bg-red-900/20 animate-pulse pointer-events-none" />

      {/* خطوط ديكور */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent" />

      {/* المحتوى */}
      <div className="relative z-10 flex flex-col items-center gap-6 max-w-md w-full text-center">

        {/* أيقونة تحذير */}
        <div className="text-red-500 text-6xl animate-bounce select-none">⛔</div>

        {/* العنوان الرئيسي */}
        <h1 className="text-red-500 text-3xl font-black tracking-wide drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">
          ممنوع الدخول
        </h1>

        {/* الصورة */}
        <div className="relative w-64 h-64 rounded-2xl overflow-hidden border-4 border-red-600 shadow-[0_0_30px_rgba(239,68,68,0.6)]">
          <img
            src="/aa.jpeg"
            alt="blocked"
            className="w-full h-full object-cover"
          />
          {/* طبقة حمرا فوق الصورة */}
          <div className="absolute inset-0 bg-red-900/30" />
        </div>

        {/* الكلام */}
        <div className="bg-gray-950 border border-red-800 rounded-2xl px-6 py-6 shadow-[0_0_20px_rgba(239,68,68,0.3)] space-y-3">
          <p className="text-red-400 text-xl font-black leading-relaxed">
            يا اخو شرموط انتا وياها 😂
          </p>
          <p className="text-gray-300 text-base font-bold leading-relaxed">
            لعب مع الاسد صعب
          </p>
          <p className="text-gray-400 text-sm leading-loose">
            راح اخليكم تندمو على اليوم الي فكرتو فيه
            <br />
            تخونو الامانه وتدخل على جميلات
            <br />
            <span className="text-red-500 font-bold">
              تعوني يا قليلن الاصل يا جعانين عيونكم فارغه يا شرميط
            </span>
          </p>
        </div>

        {/* شريط سفلي */}
        <p className="text-gray-700 text-xs">
          الجهاز ده اتحظر نهائياً 🔒
        </p>
      </div>
    </div>
  );
}
