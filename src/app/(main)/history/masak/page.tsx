'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/CustomComponents'
import { ArrowLeft, RefreshCw, Calendar, ChefHat } from 'lucide-react'
import { toast } from 'sonner'

interface CookingHistoryItem {
  id: string
  recipe_id: string | null
  recipe_name_snapshot: string
  recipe_photo_snapshot: string | null
  slot_type: 'sarapan' | 'makan_siang' | 'makan_malam' | 'camilan'
  cooked_at: string
}

interface GroupedHistory {
  [monthYear: string]: CookingHistoryItem[]
}

export default function CookingHistoryPage() {
  const [history, setHistory] = useState<GroupedHistory>({})
  const [loading, setLoading] = useState(true)

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/history/masak')
      const data = await res.json()
      if (res.ok) {
        setHistory(data)
      } else {
        toast.error(data.error || 'Gagal memuat riwayat masak')
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

  const slotLabels: { [key: string]: { label: string; color: string } } = {
    sarapan: { label: '🌅 Sarapan', color: 'bg-amber-50 text-amber-600 border-amber-200' },
    makan_siang: { label: '☀️ Makan Siang', color: 'bg-sky-50 text-sky-600 border-sky-200' },
    makan_malam: { label: '🌙 Makan Malam', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
    camilan: { label: '🍪 Camilan', color: 'bg-rose-50 text-rose-600 border-rose-200' }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
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
            <h1 className="text-xl font-bold text-text-primary">🍳 Riwayat Masak</h1>
            <p className="text-xs text-text-secondary">Daftar masakan lezat yang sudah kamu buat</p>
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
            <p className="text-xs font-semibold text-text-secondary">Mengambil catatan dapur...</p>
          </div>
        ) : months.length > 0 ? (
          <div className="space-y-6">
            {months.map((month) => (
              <div key={month} className="space-y-3">
                <h2 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1.5 bg-white/45 py-1 px-2.5 rounded-md w-fit border border-border-subtle/40">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> {month}
                </h2>
                <div className="space-y-3">
                  {history[month].map((item) => {
                    const slotInfo = slotLabels[item.slot_type] || { label: item.slot_type, color: 'bg-gray-100 text-gray-600' }
                    return (
                      <Card key={item.id} className="flex gap-4 p-3 hover:border-primary/30 transition-all duration-200">
                        <div className="w-16 h-16 rounded-lg bg-surface-alt border border-border-subtle overflow-hidden shrink-0 relative flex items-center justify-center text-text-disabled">
                          {item.recipe_photo_snapshot ? (
                            <img
                              src={item.recipe_photo_snapshot}
                              alt={item.recipe_name_snapshot}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ChefHat className="w-6 h-6 stroke-[1.5]" />
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                          <div>
                            <h3 className="text-xs font-bold text-text-primary truncate">
                              {item.recipe_name_snapshot}
                            </h3>
                            <p className="text-[10px] text-text-secondary mt-0.5">
                              {formatDate(item.cooked_at)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${slotInfo.color}`}>
                              {slotInfo.label}
                            </span>
                            {item.recipe_id && (
                              <Link
                                href={`/resep/${item.recipe_id}`}
                                className="text-[10px] font-bold text-primary hover:underline"
                              >
                                Lihat Resep →
                              </Link>
                            )}
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center py-20 text-center gap-3">
            <div className="w-16 h-16 bg-primary-light/30 rounded-full flex items-center justify-center text-3xl">
              🍳
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Belum Ada Riwayat Masak</h3>
              <p className="text-xs text-text-secondary max-w-[240px] mx-auto mt-1 leading-relaxed">
                Kamu belum pernah mencatat aktivitas memasak resep. Yuk mulai masak dari meal planner!
              </p>
            </div>
            <Link
              href="/meal-planner"
              className="mt-2 px-5 py-2 bg-primary text-white font-semibold rounded-full text-xs hover:opacity-90 active:scale-95 transition-all shadow-badge"
            >
              Atur Rencana Makan
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
