'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/CustomComponents'
import { ArrowLeft, RefreshCw, Calendar, Eye, Dumbbell, X } from 'lucide-react'
import { toast } from 'sonner'

interface WorkoutLog {
  id: string
  date: string
  type: 'jogging' | 'gym' | 'rumah'
  proof_photo_url: string | null
  notes: string | null
  is_completed: boolean
}

interface GroupedWorkouts {
  [monthYear: string]: WorkoutLog[]
}

export default function WorkoutHistoryPage() {
  const [history, setHistory] = useState<GroupedWorkouts>({})
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/history/workout')
      const data = await res.json()
      if (res.ok) {
        setHistory(data)
      } else {
        toast.error(data.error || 'Gagal memuat riwayat olahraga')
      }
    } catch (err) {
      toast.error('Masalah koneksi internet')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const workoutTypes: { [key: string]: { label: string; emoji: string; color: string } } = {
    jogging: { label: 'Jogging', emoji: '🏃‍♂️', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    gym: { label: 'Gym/Fitness', emoji: '🏋️‍♂️', color: 'bg-amber-50 text-amber-600 border-amber-200' },
    rumah: { label: 'Workout Rumah', emoji: '🏠', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    })
  }

  const months = Object.keys(history)

  return (
    <div className="flex-1 flex flex-col p-5 space-y-5 bg-bg-warm min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/profil"
            className="w-10 h-10 bg-white rounded-full border border-border-subtle flex items-center justify-center active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text-primary">💪 Riwayat Olahraga</h1>
            <p className="text-xs text-text-secondary">Catatan konsistensi workout dan bukti fotomu</p>
          </div>
        </div>
        <button
          onClick={fetchHistory}
          className="w-9 h-9 bg-white border border-border-subtle rounded-full flex items-center justify-center text-text-secondary hover:text-primary active:scale-95 transition-all cursor-pointer"
          title="Segarkan data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col justify-center items-center min-h-[50vh] gap-3">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs font-semibold text-text-secondary">Mengambil catatan olahraga...</p>
          </div>
        ) : months.length > 0 ? (
          <div className="space-y-6">
            {months.map((month) => (
              <div key={month} className="space-y-3">
                <h2 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1.5 bg-white/45 py-1 px-2.5 rounded-md w-fit border border-border-subtle/40">
                  <Calendar className="w-3.5 h-3.5 text-accent" /> {month}
                </h2>
                <div className="space-y-3">
                  {history[month].map((item) => {
                    const typeInfo = workoutTypes[item.type] || { label: item.type, emoji: '💪', color: 'bg-gray-100 text-gray-600' }
                    return (
                      <Card key={item.id} className="flex gap-4 p-3 hover:border-accent/30 transition-all duration-200">
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{typeInfo.emoji}</span>
                              <h3 className="text-xs font-extrabold text-text-primary">
                                {typeInfo.label}
                              </h3>
                            </div>
                            <p className="text-[10px] text-text-secondary mt-1">
                              {formatDate(item.date)}
                            </p>
                            {item.notes && (
                              <p className="text-[10px] text-text-secondary mt-2 bg-surface-alt p-2 rounded-md italic border border-border-subtle/40">
                                "{item.notes}"
                              </p>
                            )}
                          </div>
                          <div className="mt-2.5">
                            <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border ${typeInfo.color}`}>
                              Selesai
                            </span>
                          </div>
                        </div>

                        {item.proof_photo_url && (
                          <div
                            onClick={() => setSelectedPhoto(item.proof_photo_url)}
                            className="w-20 h-20 rounded-lg bg-surface-alt border border-border-subtle overflow-hidden shrink-0 relative flex items-center justify-center text-text-disabled cursor-pointer group hover:opacity-90 transition-opacity"
                            title="Klik untuk memperbesar foto bukti"
                          >
                            <img
                              src={item.proof_photo_url}
                              alt="Bukti workout"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        )}
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center py-20 text-center gap-3">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center text-3xl">
              🏃‍♂️
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Belum Ada Riwayat Olahraga</h3>
              <p className="text-xs text-text-secondary max-w-[240px] mx-auto mt-1 leading-relaxed">
                Kamu belum pernah menyelesaikan aktivitas workout. Yuk mulai olahraga hari ini!
              </p>
            </div>
            <Link
              href="/workout"
              className="mt-2 px-5 py-2 bg-accent text-white font-semibold rounded-full text-xs hover:opacity-90 active:scale-95 transition-all shadow-badge"
            >
              Mulai Olahraga
            </Link>
          </div>
        )}
      </div>

      {/* Photo Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/85 z-55 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-full max-h-[85vh] rounded-lg overflow-hidden bg-black flex items-center justify-center">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 w-9 h-9 bg-black/60 hover:bg-black text-white rounded-full flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedPhoto}
              alt="Bukti Workout Terbuka"
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}
