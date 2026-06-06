'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, Button, Input, Badge } from '@/components/ui/CustomComponents'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Edit3, X, RefreshCw, Award, Flame, Dumbbell, History } from 'lucide-react'
import { toast } from 'sonner'

interface ProfileData {
  name: string
  goal: string
  role?: string
}

interface BadgeItem {
  id: string
  name: string
  description: string
  icon: string
  is_earned: boolean
  earned_at: string | null
  hint: string
}

interface StreakItem {
  id: string
  week_start: string
  cooking_streak: number
  workout_streak: number
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [badges, setBadges] = useState<BadgeItem[]>([])
  const [streaks, setStreaks] = useState<StreakItem[]>([])
  const [loading, setLoading] = useState(true)

  // Edit Modal States
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editGoal, setEditGoal] = useState('keduanya')
  const [saving, setSaving] = useState(false)

  const fetchProfileAndBadges = async () => {
    setLoading(true)
    try {
      // Fetch profile basic details
      const profileRes = await fetch('/api/profile')
      const profileJson = await profileRes.json()
      
      // Fetch badges and streaks from pencapaian engine
      const pencapaianRes = await fetch('/api/pencapaian')
      const pencapaianJson = await pencapaianRes.json()

      if (profileRes.ok && pencapaianRes.ok) {
        setProfile(profileJson.profile)
        setEditName(profileJson.profile.name || '')
        setEditGoal(profileJson.profile.goal || 'keduanya')
        
        setBadges(pencapaianJson.badges || [])
        setStreaks(pencapaianJson.streaks || [])
      }
    } catch (err) {
      toast.error('Gagal memuat profil & pencapaian')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfileAndBadges()
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName.trim()) {
      toast.warning('Nama tidak boleh kosong!')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          goal: editGoal
        })
      })
      if (res.ok) {
        toast.success('Profil berhasil diperbarui! 👤')
        setIsEditOpen(false)
        fetchProfileAndBadges()
      } else {
        toast.error('Gagal memperbarui profil')
      }
    } catch (err) {
      toast.error('Masalah koneksi')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Gagal keluar: ' + error.message)
    } else {
      toast.success('Anda berhasil keluar.')
      router.push('/login')
      router.refresh()
    }
  }

  const handleResetTour = () => {
    localStorage.removeItem('harianku_dashboard_tour_completed')
    toast.success('Panduan aplikasi diatur ulang! Mengalihkan ke Dashboard... 🚀')
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center min-h-[80vh] gap-3">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-semibold text-text-secondary">Mempersiapkan piagam Anda...</p>
      </div>
    )
  }

  const goalLabels = {
    makan_sehat: '🥗 Makan Sehat',
    aktif_olahraga: '🏃 Aktif Olahraga',
    keduanya: '🔥 Makan Sehat & Olahraga'
  }

  const latestStreak = streaks[0] || { cooking_streak: 0, workout_streak: 0 }

  return (
    <div className="flex-1 flex flex-col p-5 space-y-5 bg-bg-warm min-h-screen pb-12">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-text-primary">👤 Profilku</h1>
          <p className="text-xs text-text-secondary">Pencapaian & preferensi akunmu</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-9 h-9 bg-white border border-border-subtle rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 active:scale-95 transition-all cursor-pointer"
          title="Keluar Akun"
        >
          <LogOut className="w-4.5 h-4.5" />
        </button>
      </header>

      {/* Admin Quick Link */}
      {profile && profile.role === 'admin' && (
        <Card className="bg-indigo-50 border-indigo-200 p-4 flex justify-between items-center">
          <div className="space-y-0.5">
            <h3 className="text-xs font-extrabold text-indigo-900 flex items-center gap-1">
              🛡️ Kontrol Admin Aktif
            </h3>
            <p className="text-[10px] text-indigo-700">Masuk ke halaman kontrol panel admin.</p>
          </div>
          <Link
            href="/admin/dashboard"
            className="h-8 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer"
          >
            Buka Panel
          </Link>
        </Card>
      )}

      {/* Profile Info Card */}
      {profile && (
        <Card className="flex items-center justify-between p-4 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center text-3xl font-extrabold text-primary shadow-inner">
              {profile.name ? profile.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-text-primary">{profile.name}</h2>
              <p className="text-[10px] text-text-secondary mt-0.5">
                Goal: <span className="font-bold text-primary">{goalLabels[profile.goal as keyof typeof goalLabels] || 'Belum diatur'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditOpen(true)}
            className="p-2 bg-surface-alt hover:bg-border-subtle/55 text-text-secondary rounded-lg active:scale-95 transition-all cursor-pointer"
            title="Edit Profil"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </Card>
      )}

      {/* Replay Tour Guide */}
      <Card className="p-4 bg-white flex justify-between items-center shadow-pink-subtle border-border-subtle">
        <div className="space-y-0.5">
          <h3 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
            🧭 Panduan Aplikasi
          </h3>
          <p className="text-[10px] text-text-secondary">Ulangi penjelasan interaktif seputar fitur HarianKu.</p>
        </div>
        <button
          onClick={handleResetTour}
          className="h-8 px-4 bg-primary-light text-primary hover:opacity-90 active:scale-95 rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer"
        >
          Mulai Panduan
        </button>
      </Card>

      {/* Streak Logs */}
      <section className="space-y-2.5">
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
          <Flame className="w-4.5 h-4.5 text-orange-500" /> Streak Minggu Ini
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Card className="flex items-center gap-3 p-3 bg-white">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-[9px] text-text-secondary font-semibold uppercase tracking-wider">Streak Masak</p>
              <h4 className="text-sm font-bold text-text-primary">{latestStreak.cooking_streak} Hari</h4>
            </div>
          </Card>
          <Card className="flex items-center gap-3 p-3 bg-white">
            <span className="text-2xl">💪</span>
            <div>
              <p className="text-[9px] text-text-secondary font-semibold uppercase tracking-wider">Streak Workout</p>
              <h4 className="text-sm font-bold text-text-primary">{latestStreak.workout_streak} Hari</h4>
            </div>
          </Card>
        </div>
      </section>

      {/* History Shortcuts */}
      <section className="space-y-2.5">
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
          <History className="w-4.5 h-4.5 text-primary" /> Riwayat Aktivitas
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/history/masak" className="block">
            <Card className="p-3.5 hover:border-primary/45 transition-colors cursor-pointer text-center space-y-1 bg-white">
              <span className="text-xl">🍳</span>
              <h4 className="text-xs font-bold text-text-primary">Riwayat Masak</h4>
              <p className="text-[8px] text-text-secondary">Lihat resep yang sudah kamu buat</p>
            </Card>
          </Link>
          <Link href="/history/workout" className="block">
            <Card className="p-3.5 hover:border-accent/45 transition-colors cursor-pointer text-center space-y-1 bg-white">
              <span className="text-xl">🏃‍♂️</span>
              <h4 className="text-xs font-bold text-text-primary">Riwayat Olahraga</h4>
              <p className="text-[8px] text-text-secondary">Evaluasi konsistensi workout-mu</p>
            </Card>
          </Link>
        </div>
      </section>

      {/* Badges and Achievements Grid */}
      <section className="space-y-3 flex-1">
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
          <Award className="w-4.5 h-4.5 text-secondary" /> Koleksi Pencapaianku
        </h2>

        <Card className="p-5">
          {badges.length > 0 ? (
            <div className="grid grid-cols-3 gap-y-6 gap-x-3 justify-items-center">
              {badges.map((badge) => (
                <Badge
                  key={badge.id}
                  emoji={badge.icon}
                  name={badge.name}
                  description={badge.is_earned ? badge.description : badge.hint}
                  locked={!badge.is_earned}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-disabled italic text-center py-6">Belum ada badge yang terdaftar di sistem.</p>
          )}
        </Card>
      </section>

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/45 z-55 flex items-center justify-center p-6">
          <Card className="w-full max-w-[340px] p-5 space-y-4 relative">
            <button 
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-text-primary text-center">Edit Profil 👤</h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <Input
                id="editName"
                label="Nama Lengkap *"
                value={editName}
                onChange={e => setEditName(e.target.value)}
              />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="editGoal" className="text-xs font-semibold text-text-secondary">Fokus/Goal Utama</label>
                <select
                  id="editGoal"
                  value={editGoal}
                  onChange={e => setEditGoal(e.target.value)}
                  className="h-[48px] bg-surface-alt border border-border-subtle rounded-lg px-2 text-xs focus:outline-hidden cursor-pointer"
                >
                  <option value="makan_sehat">🥗 Makan Sehat</option>
                  <option value="aktif_olahraga">🏃 Aktif Olahraga</option>
                  <option value="keduanya">🔥 Keduanya</option>
                </select>
              </div>

              <Button type="submit" variant="primary" disabled={saving} className="mt-2 h-10 text-xs">
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
