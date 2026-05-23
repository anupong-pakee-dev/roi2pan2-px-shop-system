export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-zinc-500">
        <span>© {year} PX Shop. ระบบช้อปปิ้ง/จัดการสต็อก — สงวนลิขสิทธิ์</span>
      </div>
    </footer>
  )
}
