export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-teal-200 rounded-full" />
          <div className="absolute inset-0 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-slate-500 text-sm">Yüklənir...</p>
      </div>
    </div>
  )
}
