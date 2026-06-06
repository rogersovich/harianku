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
    <div className="flex-1 flex flex-col p-6 space-y-6 bg-bg-warm min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-border-subtle pb-4">
        <div>
          <h1 className="text-lg font-bold text-text-primary flex items-center gap-1.5">
            <Shield className="w-5 h-5 text-primary" /> Admin Control Panel
          </h1>
          <p className="text-xs text-text-secondary">Pantau aktivitas sistem dan kelola konten HarianKu</p>
        </div>
      </header>

      {/* Stats Cards */}
      {stats && (
        <section className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-white border-border-subtle shadow-pink-subtle flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Total Pengguna</span>
              <span className="text-xl font-black text-text-primary">{stats.userCount}</span>
            </div>
          </Card>

          <Card className="p-4 bg-white border-border-subtle shadow-pink-subtle flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-accent" />
            <div>
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Resep Diunggah</span>
              <span className="text-xl font-black text-text-primary">{stats.recipeCount}</span>
            </div>
          </Card>

          <Card className="p-4 bg-white border-border-subtle shadow-pink-subtle flex items-center gap-3 col-span-2">
            <BarChart3 className="w-8 h-8 text-warning" />
            <div>
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Statistik Konsistensi</span>
              <p className="text-xs font-semibold text-text-secondary mt-1">
                Rerata Streak: <span className="font-extrabold text-warning">{stats.avgCookingStreak} hari</span> | Populer: <span className="font-extrabold text-warning">{stats.popularRecipe}</span>
              </p>
            </div>
          </Card>
        </section>
      )}

      {/* Quick Navigation Cards */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Aksi Cepat Manajemen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 bg-white hover:border-primary/50 transition-colors flex flex-col justify-between border-border-subtle shadow-pink-subtle">
            <div>
              <div className="w-10 h-10 rounded-lg bg-primary-light/40 flex items-center justify-center text-primary mb-3">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-text-primary">Manajemen Badge & Reward</h3>
              <p className="text-[10px] text-text-secondary mt-1 leading-relaxed">
                Kelola daftar lencana pencapaian, ubah deskripsi lencana, dan tetapkan syarat trigger kelayakan secara dinamis.
              </p>
            </div>
            <Link
              href="/admin/badges"
              className="mt-4 inline-flex h-8 items-center justify-center px-4 rounded-lg bg-primary hover:bg-primary-dark text-white text-[11px] font-bold transition-all w-fit"
            >
              Kelola Badge
            </Link>
          </Card>

          <Card className="p-4 bg-white hover:border-accent/50 transition-colors flex flex-col justify-between border-border-subtle shadow-pink-subtle">
            <div>
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-text-primary">Manajemen Resep Starter</h3>
              <p className="text-[10px] text-text-secondary mt-1 leading-relaxed">
                Kelola daftar resep bawaan sistem (resep starter) yang akan langsung didapatkan oleh pengguna baru saat pertama kali mendaftar.
              </p>
            </div>
            <Link
              href="/admin/resep"
              className="mt-4 inline-flex h-8 items-center justify-center px-4 rounded-lg bg-accent hover:opacity-90 text-white text-[11px] font-bold transition-all w-fit"
            >
              Kelola Resep
            </Link>
          </Card>
        </div>
      </section>
    </div>
  )
}
