'use client'

import React, { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { Card, StreakCounter, Button } from '@/components/ui/CustomComponents'
import { formatIndonesianDate, getWIBDate } from '@/lib/utils/date'
import { getRandomQuote } from '@/lib/quotes'
import { 
  Plus, Check, ChevronRight, BookOpen, Calendar, 
  Package, ShoppingCart, Activity, Dumbbell, 
  Sparkles, CheckCircle2, AlertCircle, RefreshCw,
  Camera, X
} from 'lucide-react'
import { toast } from 'sonner'

interface MealSlot {
  id: string
  day_of_week: number
  slot: 'sarapan' | 'makan_siang' | 'makan_malam' | 'camilan'
  is_cooked: boolean
  recipes?: {
    id: string
    name: string
    estimated_time_minutes: number
    categories?: {
      name: string
      color: string
    }
  }
}

interface DashboardData {
  profile: {
    name: string
    goal: string
    workout_target_weekly: number
  }
  streak: {
    cooking_streak: number
    workout_streak: number
  }
  meals: MealSlot[]
  notes: string
  workout: {
    id?: string
    is_completed: boolean
    type: 'jogging' | 'gym' | 'rumah' | null
    proof_photo_url: string | null
    notes: string
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [noteText, setNoteText] = useState('')
  const [quote, setQuote] = useState('')
  const [isPending, startTransition] = useTransition()

  // Cooking Proof States
  const [cookingSlotId, setCookingSlotId] = useState<string | null>(null)
  const [cookingRecipeName, setCookingRecipeName] = useState<string>('')
  const [cookingPhotoUrl, setCookingPhotoUrl] = useState<string>('')
  const [uploadingCookPhoto, setUploadingCookPhoto] = useState<boolean>(false)
  const [markingCooked, setMarkingCooked] = useState<boolean>(false)

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard')
      const json = await res.json()
      if (res.ok) {
        setData(json)
        setNoteText(json.notes || '')
      } else {
        toast.error('Gagal memuat data dashboard')
      }
    } catch (err) {
      toast.error('Gagal terhubung ke server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    setQuote(getRandomQuote())
  }, [])

  const handleMarkAsCooked = async (slotId: string, resultPhotoUrl?: string) => {
    setMarkingCooked(true)
    try {
      const res = await fetch('/api/meal-plan/slot/cook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId, result_photo_url: resultPhotoUrl || null })
      })
      const json = await res.json()
      if (res.ok && json.success) {
        toast.success('Makanan ditandai sudah dimasak! 🍳')
        
        // Show stock warnings if any
        if (json.warnings && json.warnings.length > 0) {
          json.warnings.forEach((warn: string) => {
            toast.warning(warn, { duration: 5000 })
          })
        }
        
        setCookingSlotId(null)
        setCookingPhotoUrl('')
        fetchDashboardData()
      } else {
        toast.error(json.error || 'Gagal menandai memasak')
      }
    } catch (err) {
      toast.error('Koneksi terganggu')
    } finally {
      setMarkingCooked(false)
    }
  }

  const handleSaveNote = async () => {
    try {
      const res = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: noteText })
      })
      if (res.ok) {
        toast.success('Catatan harian disimpan! 📝')
      }
    } catch (err) {
      toast.error('Gagal menyimpan catatan')
    }
  }

  const getGreeting = () => {
    const hours = getWIBDate().getHours()
    if (hours < 11) return 'Selamat pagi'
    if (hours < 15) return 'Selamat siang'
    if (hours < 18) return 'Selamat sore'
    return 'Selamat malam'
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center min-h-[80vh] gap-3">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-semibold text-text-secondary">Memuat kebahagiaan hari ini...</p>
      </div>
    )
  }

  const name = data?.profile?.name || 'Teman'
  const goal = data?.profile?.goal || 'keduanya'
  
  const slotLabels = {
    sarapan: { label: 'Sarapan', icon: '🌅' },
    makan_siang: { label: 'Makan Siang', icon: '☀️' },
    makan_malam: { label: 'Makan Malam', icon: '🌙' },
    camilan: { label: 'Camilan', icon: '🍰' }
  }

  // Group meals by slot
  const mealSlots: Record<string, MealSlot | null> = {
    sarapan: data?.meals?.find(m => m.slot === 'sarapan') || null,
    makan_siang: data?.meals?.find(m => m.slot === 'makan_siang') || null,
    makan_malam: data?.meals?.find(m => m.slot === 'makan_malam') || null,
    camilan: data?.meals?.find(m => m.slot === 'camilan') || null,
  }

  const showWorkout = goal !== 'makan_sehat'

  return (
    <div className="flex-1 flex flex-col p-5 space-y-5">
      {/* Top Banner Greeting */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-text-primary">
            {getGreeting()}, {name}! 👋
          </h1>
          <p className="text-xs text-text-secondary font-medium mt-0.5">
            {formatIndonesianDate(new Date().toISOString())}
          </p>
        </div>
        <Link
          href="/profil"
          className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center text-sm font-extrabold text-primary shadow-pink-subtle active:scale-95 transition-all cursor-pointer"
        >
          {name[0]?.toUpperCase() || 'U'}
        </Link>
      </header>

      {/* Streak Counters */}
      <section className="flex gap-3">
        <StreakCounter type="masak" count={data?.streak?.cooking_streak || 0} />
        {showWorkout && (
          <StreakCounter 
            type="workout" 
            count={data?.streak?.workout_streak || 0} 
            total={data?.profile?.workout_target_weekly || 3}
          />
        )}
      </section>

      {/* Fast Shortcuts */}
      <section className="grid grid-cols-4 gap-2">
        <Link href="/resep" className="flex flex-col items-center p-2.5 bg-white rounded-xl border border-border-subtle shadow-pink-subtle active:scale-95 transition-all text-center">
          <BookOpen className="w-5 h-5 text-primary mb-1" />
          <span className="text-[10px] font-bold text-text-primary">Resep</span>
        </Link>
        <Link href="/meal-planner" className="flex flex-col items-center p-2.5 bg-white rounded-xl border border-border-subtle shadow-pink-subtle active:scale-95 transition-all text-center">
          <Calendar className="w-5 h-5 text-secondary mb-1" />
          <span className="text-[10px] font-bold text-text-primary">Planner</span>
        </Link>
        <Link href="/stok" className="flex flex-col items-center p-2.5 bg-white rounded-xl border border-border-subtle shadow-pink-subtle active:scale-95 transition-all text-center">
          <Package className="w-5 h-5 text-accent mb-1" />
          <span className="text-[10px] font-bold text-text-primary">Stok</span>
        </Link>
        <Link href="/belanja" className="flex flex-col items-center p-2.5 bg-white rounded-xl border border-border-subtle shadow-pink-subtle active:scale-95 transition-all text-center">
          <ShoppingCart className="w-5 h-5 text-warning mb-1" />
          <span className="text-[10px] font-bold text-text-primary">Belanja</span>
        </Link>
      </section>

      {/* Menu Hari Ini */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
            <span className="mr-1">🍽️</span> Menu Hari Ini
          </h2>
          <Link href="/meal-planner" className="text-xs font-semibold text-primary flex items-center gap-0.5">
            Atur Planner <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <Card className="space-y-3">
          {(Object.keys(mealSlots) as Array<keyof typeof mealSlots>).map((slotKey) => {
            const slotData = mealSlots[slotKey]
            const labelInfo = slotLabels[slotKey as keyof typeof slotLabels]

            return (
              <div key={slotKey} className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 border-b last:border-0 border-dashed border-border-subtle">
                <div className="flex items-start gap-3">
                  <span className="text-md mt-0.5">{labelInfo.icon}</span>
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <h3 className="text-xs font-semibold text-text-secondary">{labelInfo.label}</h3>
                    {slotData?.recipes ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[12px] font-bold text-text-primary truncate">
                          {slotData.recipes.name}
                        </span>
                        <span className="text-[12px] text-text-secondary flex items-center gap-2 mt-0.5">
                          <span>⏳</span>
                          {slotData.recipes.estimated_time_minutes} menit
                          {slotData.recipes.categories && (
                            <span 
                              className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold text-white"
                              style={{ backgroundColor: slotData.recipes.categories.color }}
                            >
                              {slotData.recipes.categories.name}
                            </span>
                          )}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-text-disabled italic">Belum dijadwalkan</span>
                    )}
                  </div>
                </div>

                {slotData?.recipes && (
                  <div className="mt-1">
                    {slotData.is_cooked ? (
                      <span className="text-xs font-bold text-accent flex items-center gap-1 bg-accent/10 py-1.5 px-3.5 rounded-lg w-full justify-center">
                        <Check className="w-4 h-4" /> Sudah Dimasak
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setCookingSlotId(slotData.id)
                          setCookingRecipeName(slotData.recipes?.name || 'Masakan')
                          setCookingPhotoUrl('')
                        }}
                        className="w-full h-8 rounded-lg text-xs font-bold bg-primary-light text-primary hover:opacity-90 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                      >
                        Tandai Dimasak
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </Card>
      </section>

      {/* Workout Hari Ini */}
      {showWorkout && (
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              🏃 Workout Hari Ini
            </h2>
            <Link href="/workout" className="text-xs font-semibold text-primary flex items-center gap-0.5">
              Kelola Workout <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-lg">
                💪
              </div>
              <div>
                <h3 className="text-xs font-semibold text-text-secondary">Aktivitas Hari Ini</h3>
                {data?.workout?.type ? (
                  <p className="text-sm font-bold text-text-primary capitalize">
                    {data.workout.type} {data.workout.is_completed ? ' (Selesai)' : ''}
                  </p>
                ) : (
                  <p className="text-xs text-text-disabled italic">Belum ada olahraga dijadwalkan</p>
                )}
              </div>
            </div>

            <div>
              {data?.workout?.type ? (
                data.workout.is_completed ? (
                  <span className="text-xs font-bold text-accent flex items-center gap-1">
                    <CheckCircle2 className="w-4.5 h-4.5" /> Selesai
                  </span>
                ) : (
                  <Link
                    href="/workout"
                    className="inline-flex items-center justify-center h-8 px-4 rounded-full text-xs font-bold bg-accent text-white hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                  >
                    Upload Bukti
                  </Link>
                )
              ) : (
                <Link
                  href="/workout"
                  className="inline-flex items-center justify-center h-8 px-4 rounded-full text-xs font-bold bg-primary-light text-primary hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  Jadwalkan
                </Link>
              )}
            </div>
          </Card>
        </section>
      )}

      {/* Daily Quote */}
      <section>
        <Card className="bg-secondary/10 border-secondary/30 flex items-start gap-3 p-4">
          <Sparkles className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-text-primary leading-relaxed">
            &ldquo;{quote}&rdquo;
          </p>
        </Card>
      </section>

      {/* Catatan Harian */}
      <section className="space-y-2">
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
          📝 Catatan Hari Ini
        </h2>
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onBlur={handleSaveNote}
          placeholder="Tulis rencana belanja dadakan, evaluasi rasa masakan, atau catatan workout hari ini..."
          className="w-full min-h-[80px] bg-white border border-border-subtle rounded-xl p-3 text-xs text-text-primary placeholder:text-text-secondary focus:outline-hidden focus:border-primary transition-colors resize-none"
        />
      </section>

      {/* Cooking Proof Modal */}
      {cookingSlotId && (
        <div className="fixed inset-0 bg-black/45 z-55 flex items-center justify-center p-6">
          <Card className="w-full max-w-[340px] p-5 space-y-4 relative bg-white">
            <button 
              onClick={() => setCookingSlotId(null)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-text-primary text-center">Hasil Masak Anda? 🍳</h3>
            <p className="text-xs text-text-secondary text-center">
              Unggah foto hasil masakan untuk <strong>{cookingRecipeName}</strong> (opsional) sebelum menandai selesai.
            </p>

            <div className="flex flex-col gap-1.5 items-center py-2">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setUploadingCookPhoto(true)
                  const formData = new FormData()
                  formData.append('file', file)
                  try {
                    const res = await fetch('/api/upload', {
                      method: 'POST',
                      body: formData,
                    })
                    const data = await res.json()
                    if (res.ok && data.url) {
                      setCookingPhotoUrl(data.url)
                      toast.success('Foto masakan diunggah! 📸')
                    } else {
                      toast.error(data.error || 'Gagal mengunggah foto')
                    }
                  } catch (err) {
                    toast.error('Koneksi upload bermasalah')
                  } finally {
                    setUploadingCookPhoto(false)
                  }
                }}
                className="hidden"
                id="cooking-photo-upload"
                disabled={uploadingCookPhoto}
              />
              {!cookingPhotoUrl ? (
                <label
                  htmlFor="cooking-photo-upload"
                  className="w-24 h-24 bg-surface-alt border border-dashed border-border-subtle rounded-xl flex flex-col items-center justify-center cursor-pointer text-text-secondary hover:bg-primary-light/10 transition-colors"
                >
                  <Camera className="w-6 h-6 text-text-secondary" />
                  <span className="text-[10px] font-bold mt-1">Pilih Foto</span>
                </label>
              ) : (
                <div className="relative w-24 h-24 rounded-xl border border-border-subtle overflow-hidden">
                  <img src={cookingPhotoUrl} className="w-full h-full object-cover" alt="Preview masakan" />
                  <button
                    type="button"
                    onClick={() => setCookingPhotoUrl('')}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 cursor-pointer transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {uploadingCookPhoto && <span className="text-[10px] text-primary animate-pulse font-bold mt-1">Mengunggah...</span>}
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => handleMarkAsCooked(cookingSlotId, '')}
                disabled={markingCooked || uploadingCookPhoto}
                className="flex-1 h-10 border border-border-subtle rounded-full text-xs font-semibold text-text-secondary hover:bg-surface-alt transition-colors"
              >
                Lewati Foto
              </button>
              <Button
                onClick={() => handleMarkAsCooked(cookingSlotId, cookingPhotoUrl)}
                disabled={markingCooked || uploadingCookPhoto}
                className="flex-1 !h-10 text-xs"
              >
                {markingCooked ? 'Menyimpan...' : 'Selesai Masak'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
