import Link from 'next/link'

export default function SuccessPage() {
  return (
    <div className="max-w-md mx-auto mt-16 text-center">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="w-20 h-20 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <img src="/logo.png" alt="מכבי שוהם" className="w-14 h-14 object-contain" />
        </div>
        <h1 className="text-2xl font-bold text-navy-900 mb-2">ברוך הבא לקהילה!</h1>
        <p className="text-slate-600 mb-2">
          הפרטים שלך התקבלו בהצלחה.
        </p>
        <p className="text-slate-500 text-sm mb-6">
          הפרופיל שלך ייכנס לאחר אישור מנהל הקהילה — בדרך כלל תוך יום עסקים.
        </p>
        <div className="flex flex-col gap-2">
          <Link href="/"
            className="w-full py-3 bg-navy-800 text-white rounded-xl font-medium hover:bg-navy-700 transition-colors text-sm text-center">
            עבור לדף הבית
          </Link>
          <Link href="/feed"
            className="w-full py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm text-center">
            צפה בפיד הקהילה
          </Link>
        </div>
      </div>
    </div>
  )
}
