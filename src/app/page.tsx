import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Utensils, Activity, Sparkles, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-bg-warm min-h-screen">
      {/* Top Header / Brand */}
      <header className="flex justify-between items-center py-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍳</span>
          <span className="text-xl font-bold text-text-primary tracking-tight">HarianKu</span>
        </div>
        <Link 
          href="/login"
          className="text-sm font-semibold text-primary bg-primary-light px-4 py-2 rounded-full hover:opacity-90 active:scale-95 transition-all"
        >
          Masuk
        </Link>
      </header>

      {/* Hero Content */}
      <main className="flex-1 flex flex-col justify-center items-center text-center gap-6 my-8">
        <div className="relative">
          {/* Decorative shapes / emojis */}
          <span className="absolute -top-6 -left-6 text-4xl animate-bounce">🥗</span>
          <span className="absolute -bottom-6 -right-6 text-4xl animate-bounce delay-200">🏃</span>
          
          <div className="w-48 h-48 bg-primary-light/50 rounded-full flex items-center justify-center shadow-pink-subtle">
            <span className="text-8xl">🍳</span>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold text-text-primary leading-tight">
            Makan Teratur,<br />
            Gerak Rutin,<br />
            Satu App! 🎉
          </h1>
          <p className="text-sm text-text-secondary max-w-[280px] mx-auto leading-relaxed">
            Rencanakan menu mingguanmu, pantau stok bahan dapur, dan lacak olahraga harian dengan mudah dan ceria!
          </p>
        </div>

        <Link
          href="/login"
          className="w-full max-w-[280px] h-[48px] bg-primary text-white hover:bg-primary-dark rounded-full font-semibold text-sm flex items-center justify-center gap-2 shadow-badge active:scale-97 transition-all"
        >
          Mulai Sekarang <ArrowRight className="w-4.5 h-4.5" />
        </Link>
      </main>

      {/* Features Showcase */}
      <footer className="space-y-4">
        <h2 className="text-xs font-bold text-text-secondary/70 uppercase tracking-widest text-center">
          ✨ Fitur Unggulan
        </h2>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-4 bg-white p-4 rounded-[16px] border border-border-subtle shadow-pink-subtle">
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-xl">
              🍽️
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Meal Planner Mingguan</h3>
              <p className="text-xs text-text-secondary">Jadwalkan menu Senin-Minggu minim ribet</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-4 rounded-[16px] border border-border-subtle shadow-pink-subtle">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-xl">
              💪
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Workout Tracker</h3>
              <p className="text-xs text-text-secondary">Catat olahraga harian dengan bukti foto & streak</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-4 rounded-[16px] border border-border-subtle shadow-pink-subtle">
            <div className="w-10 h-10 rounded-full bg-primary-light/40 flex items-center justify-center text-xl">
              🛒
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Stok & Belanja Otomatis</h3>
              <p className="text-xs text-text-secondary">Auto-generate daftar belanja dan kurangi stok bahan</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
