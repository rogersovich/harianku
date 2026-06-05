'use client'

import React, { useEffect, useState } from 'react'
import { Card, Button, Input } from '@/components/ui/CustomComponents'
import { ArrowLeft, Plus, Shield, Award, BookOpen, Users, BarChart3, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface AdminStats {
  userCount: number
  recipeCount: number
  starterCount: number
  avgCookingStreak: number
  popularRecipe: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Badge Form States
  const [badgeName, setBadgeName] = useState('')
  const [badgeDesc, setBadgeDesc] = useState('')
  const [badgeIcon, setBadgeIcon] = useState('🏆')
  const [badgeTriggerType, setBadgeTriggerType] = useState('cooking_streak_7')
  const [badgeTriggerVal, setBadgeTriggerVal] = useState('7')
  const [savingBadge, setSavingBadge] = useState(false)

  const fetchAdminStats = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/stats')
      const json = await res.json()
      if (res.ok) {
        setStats(json)
      } else {
        toast.error('Gagal memuat statistik admin')
      }
    } catch (err) {
      toast.error('Koneksi terganggu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdminStats()
  }, [])

  const handleCreateBadge = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!badgeName.trim() || !badgeDesc.trim() || !badgeIcon.trim()) {
      toast.warning('Isi semua field untuk membuat badge!')
      return
    }

    setSavingBadge(true)
    try {
      // Mocking save or calling an endpoint (POST /api/reward)
      const res = await fetch('/api/reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: badgeName.trim(),
          description: badgeDesc.trim(),
          icon: badgeIcon.trim(),
          trigger_type: badgeTriggerType,
          trigger_value: Number(badgeTriggerVal)
        })
      })
      if (res.ok) {
        toast.success('Badge baru berhasil dibuat! 🏅')
        setBadgeName('')
        setBadgeDesc('')
        setBadgeIcon('🏆')
        setBadgeTriggerVal('7')
      } else {
        toast.error('Gagal membuat badge')
      }
    } catch (err) {
      toast.error('Koneksi bermasalah')
    } finally {
      setSavingBadge(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center min-h-[80vh] gap-3 bg-bg-warm">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-semibold text-text-secondary">Mengamankan sistem admin...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col p-6 space-y-5 bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-10 h-10 bg-white rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
              <Shield className="w-5 h-5 text-indigo-600" /> Admin Control Panel
            </h1>
            <p className="text-xs text-slate-500">Kelola master resep, reward, dan statistik</p>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      {stats && (
        <section className="grid grid-cols-2 gap-3.5">
          <Card className="p-4 bg-white border-slate-200 shadow-sm flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-500" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Pengguna</span>
              <span className="text-xl font-black text-slate-800">{stats.userCount}</span>
            </div>
          </Card>

          <Card className="p-4 bg-white border-slate-200 shadow-sm flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-green-500" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resep Diunggah</span>
              <span className="text-xl font-black text-slate-800">{stats.recipeCount}</span>
            </div>
          </Card>

          <Card className="p-4 bg-white border-slate-200 shadow-sm flex items-center gap-3 col-span-2">
            <BarChart3 className="w-8 h-8 text-amber-500" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Statistik Konsistensi</span>
              <p className="text-xs font-semibold text-slate-700 mt-1">
                Rerata Streak: <span className="font-extrabold text-amber-600">{stats.avgCookingStreak} hari</span> | Populer: <span className="font-extrabold text-amber-600">{stats.popularRecipe}</span>
              </p>
            </div>
          </Card>
        </section>
      )}

      {/* Manage Badges Form */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
          <Award className="w-4.5 h-4.5 text-indigo-600" /> Buat Badge Reward Baru
        </h2>

        <Card className="p-5 bg-white border-slate-200 shadow-sm">
          <form onSubmit={handleCreateBadge} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Input
                  id="badgeName"
                  label="Nama Badge"
                  placeholder="Misal: Koki Berbintang"
                  value={badgeName}
                  onChange={e => setBadgeName(e.target.value)}
                />
              </div>
              <Input
                id="badgeIcon"
                label="Ikon Emoji"
                placeholder="🏆"
                value={badgeIcon}
                onChange={e => setBadgeIcon(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="badgeDesc" className="text-xs font-semibold text-slate-500">Deskripsi Reward</label>
              <textarea
                id="badgeDesc"
                value={badgeDesc}
                onChange={e => setBadgeDesc(e.target.value)}
                placeholder="Tulis motivasi pencapaian badge ini..."
                className="w-full h-[60px] bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="badgeTrigger" className="text-xs font-semibold text-slate-500">Trigger Kondisi</label>
                <select
                  id="badgeTrigger"
                  value={badgeTriggerType}
                  onChange={e => setBadgeTriggerType(e.target.value)}
                  className="h-[48px] bg-slate-50 border border-slate-200 rounded-lg px-2 text-xs focus:outline-hidden cursor-pointer text-slate-700"
                >
                  <option value="cooking_streak_7">Streak Masak (Hari)</option>
                  <option value="workout_target">Target Workout (Hari)</option>
                </select>
              </div>
              <Input
                id="badgeTriggerVal"
                type="number"
                label="Nilai Syarat"
                value={badgeTriggerVal}
                onChange={e => setBadgeTriggerVal(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={savingBadge} className="h-10 text-xs bg-indigo-600 hover:bg-indigo-700 text-white w-full rounded-full">
              {savingBadge ? 'Menyimpan...' : 'Tambahkan Badge'}
            </Button>
          </form>
        </Card>
      </section>
    </div>
  )
}
