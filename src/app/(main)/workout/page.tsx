'use client'

import React, { useEffect, useState } from 'react'
import { Card, Button, Input } from '@/components/ui/CustomComponents'
import { Drawer } from '@/components/ui/Drawer'
import { 
  getWeekStartAndEnd, 
  getDayOfWeekWIB, 
  getWIBDateString,
  formatIndonesianDate 
} from '@/lib/utils/date'
import { 
  ChevronLeft, ChevronRight, Dumbbell, Award, 
  CheckCircle2, Plus, Camera, X, RefreshCw 
} from 'lucide-react'
import { toast } from 'sonner'

interface WorkoutLog {
  id?: string
  date: string
  type: 'jogging' | 'gym' | 'rumah'
  proof_photo_url: string | null
  notes: string
  is_completed: boolean
}

export default function WorkoutPage() {
  const [currentWeekDate, setCurrentWeekDate] = useState<Date>(new Date())
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Drawer Completion States
  const [isCompleteOpen, setIsCompleteOpen] = useState(false)
  const [completingDate, setCompletingDate] = useState<string | null>(null)
  const [completingType, setCompletingType] = useState<'jogging' | 'gym' | 'rumah'>('jogging')
  const [notes, setNotes] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  
  // Target Modal States
  const [isTargetOpen, setIsTargetOpen] = useState(false)
  const [newTarget, setNewTarget] = useState('3')

  const [saving, setSaving] = useState(false)

  const { start: mondayStr, end: sundayStr, mondayObject } = getWeekStartAndEnd(currentWeekDate)

  const fetchWorkoutData = async () => {
    setLoading(true)
    try {
      // Fetch logs
      const logRes = await fetch(`/api/workout?week=${mondayStr}`)
      const logData = await logRes.json()
      if (logRes.ok) {
        setLogs(logData)
      }

      // Fetch profile for target weekly
      const profRes = await fetch('/api/dashboard')
      const profData = await profRes.json()
      if (profRes.ok && profData.profile) {
        setProfile(profData.profile)
        setNewTarget(String(profData.profile.workout_target_weekly || 3))
      }
    } catch (err) {
      toast.error('Gagal mengambil data olahraga')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkoutData()
  }, [mondayStr])

  const handleScheduleWorkout = async (dateStr: string, type: 'jogging' | 'gym' | 'rumah') => {
    try {
      const res = await fetch('/api/workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateStr,
          type,
          is_completed: false
        })
      })
      if (res.ok) {
        toast.success(`Jadwal ${type} berhasil ditambahkan! 🏃`)
        fetchWorkoutData()
      } else {
        toast.error('Gagal menjadwalkan workout')
      }
    } catch (err) {
      toast.error('Koneksi bermasalah')
    }
  }

  const handleOpenComplete = (dateStr: string, type: 'jogging' | 'gym' | 'rumah') => {
    setCompletingDate(dateStr)
    setCompletingType(type)
    setNotes('')
    setPhotoUrl('') // Start empty for upload
    setIsCompleteOpen(true)
  }

  const handleCompleteWorkout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!completingDate) return

    if (!photoUrl) {
      toast.warning('Harap unggah foto bukti olahragamu!')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: completingDate,
          type: completingType,
          notes,
          proof_photo_url: photoUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400',
          is_completed: true
        })
      })
      const json = await res.json()
      if (res.ok) {
        toast.success('Workout diselesaikan! Bagus sekali! 💪🎉')
        setIsCompleteOpen(false)
        fetchWorkoutData()
      } else {
        toast.error('Gagal menyelesaikan workout')
      }
    } catch (err) {
      toast.error('Masalah koneksi')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateTarget = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/profile/target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: Number(newTarget) })
      })
      if (res.ok) {
        toast.success('Target mingguan diperbarui! 🎯')
        setIsTargetOpen(false)
        fetchWorkoutData()
      } else {
        toast.error('Gagal memperbarui target')
      }
    } catch (err) {
      toast.error('Masalah koneksi')
    } finally {
      setSaving(false)
    }
  }

  const daysOfWeek = [
    { num: 1, name: 'Senin' },
    { num: 2, name: 'Selasa' },
    { num: 3, name: 'Rabu' },
    { num: 4, name: 'Kamis' },
    { num: 5, name: 'Jumat' },
    { num: 6, name: 'Sabtu' },
    { num: 7, name: 'Minggu' }
  ]

  const completedCount = logs.filter(l => l.is_completed).length
  const weeklyTarget = profile?.workout_target_weekly || 3

  return (
    <div className="flex-1 flex flex-col p-5 space-y-4 bg-bg-warm min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-text-primary">🏃 Workout Tracker</h1>
          <p className="text-xs text-text-secondary">Jadwalkan dan catat olahragamu</p>
        </div>
        <button
          onClick={() => setIsTargetOpen(true)}
          className="w-9 h-9 bg-white border border-border-subtle rounded-full flex items-center justify-center text-text-secondary hover:text-primary active:scale-95 transition-all cursor-pointer"
          title="Set Target Mingguan"
        >
          <Award className="w-4.5 h-4.5" />
        </button>
      </header>

      {/* Target Progress Card */}
      <Card className="flex items-center justify-between py-3.5 bg-primary-light/10 border-primary/20">
        <div className="space-y-1 flex-1 pr-3">
          <h3 className="text-xs font-bold text-text-primary">Progress Target Mingguan</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-primary">{completedCount}</span>
            <span className="text-xs text-text-secondary">/ {weeklyTarget} olahraga selesai</span>
          </div>
          <div className="w-full bg-border-subtle h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min((completedCount / weeklyTarget) * 100, 100)}%` }}
            />
          </div>
        </div>
        <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-2xl shadow-inner shrink-0">
          🏆
        </div>
      </Card>

      {/* Week Navigation */}
      <section className="flex items-center justify-between bg-white border border-border-subtle rounded-full p-1 shadow-pink-subtle">
        <button
          onClick={() => {
            const prev = new Date(mondayObject)
            prev.setDate(mondayObject.getDate() - 7)
            setCurrentWeekDate(prev)
          }}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-alt active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 text-text-secondary" />
        </button>
        <span className="text-xs font-bold text-text-primary">
          {formatIndonesianDate(mondayStr).split(',')[1]} - {formatIndonesianDate(sundayStr).split(',')[1]}
        </span>
        <button
          onClick={() => {
            const next = new Date(mondayObject)
            next.setDate(mondayObject.getDate() + 7)
            setCurrentWeekDate(next)
          }}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-alt active:scale-95 transition-all cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 text-text-secondary" />
        </button>
      </section>

      {/* Daily Logs */}
      {loading ? (
        <div className="flex-1 flex justify-center items-center py-20">
          <RefreshCw className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : (
        <section className="space-y-3">
          {daysOfWeek.map((day) => {
            const dayDate = new Date(mondayObject)
            dayDate.setDate(mondayObject.getDate() + (day.num - 1))
            const dayDateStr = getWIBDateString(dayDate)
            const log = logs.find(l => l.date === dayDateStr)

            return (
              <Card key={day.num} className="flex justify-between items-center p-3.5">
                <div className="space-y-0.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-extrabold text-text-primary">{day.name}</span>
                    <span className="text-[9px] text-text-secondary">
                      {dayDate.getDate()} {dayDate.toLocaleDateString('id-ID', { month: 'short' })}
                    </span>
                  </div>
                  {log ? (
                    <div className="space-y-1.5 mt-1.5">
                      <div className="flex items-center gap-1.5">
                        <Dumbbell className="w-3.5 h-3.5 text-accent" />
                        <span className="text-xs font-bold text-text-primary capitalize">
                          {log.type === 'rumah' ? 'Workout di Rumah' : log.type}
                        </span>
                      </div>
                      {log.notes && (
                        <p className="text-[10px] text-text-secondary italic">
                          &ldquo;{log.notes}&rdquo;
                        </p>
                      )}
                      {log.proof_photo_url && (
                        <div className="w-12 h-12 rounded-lg bg-surface-alt border border-border-subtle overflow-hidden relative shadow-inner">
                          <img 
                            src={log.proof_photo_url} 
                            alt="Workout proof" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[10px] text-text-disabled italic mt-1">Belum dijadwalkan</p>
                  )}
                </div>

                <div>
                  {log ? (
                    log.is_completed ? (
                      <span className="text-xs font-bold text-accent flex items-center gap-1">
                        <CheckCircle2 className="w-4.5 h-4.5" /> Selesai
                      </span>
                    ) : (
                      <button
                        onClick={() => handleOpenComplete(dayDateStr, log.type)}
                        className="h-8 px-3.5 rounded-full text-xs font-bold bg-accent text-white hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Camera className="w-3.5 h-3.5" /> Bukti
                      </button>
                    )
                  ) : (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleScheduleWorkout(dayDateStr, e.target.value as any)
                          e.target.value = ''
                        }
                      }}
                      className="h-8 px-2 bg-surface-alt border border-border-subtle rounded-lg text-[10px] font-bold text-text-secondary focus:outline-hidden cursor-pointer"
                    >
                      <option value="">+ Olahraga</option>
                      <option value="jogging">🏃 Jogging</option>
                      <option value="gym">🏋️ Gym</option>
                      <option value="rumah">🏠 Rumah</option>
                    </select>
                  )}
                </div>
              </Card>
            )
          })}
        </section>
      )}

      {/* Target Setting Modal */}
      {isTargetOpen && (
        <div className="fixed inset-0 bg-black/45 z-55 flex items-center justify-center p-6">
          <Card className="w-full max-w-[300px] p-5 space-y-4 relative">
            <button 
              onClick={() => setIsTargetOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-text-primary text-center">Set Target Mingguan 🎯</h3>
            
            <form onSubmit={handleUpdateTarget} className="space-y-3">
              <Input
                id="newTarget"
                type="number"
                label="Jumlah Hari Workout per Minggu"
                min="1"
                max="7"
                value={newTarget}
                onChange={e => setNewTarget(e.target.value)}
              />
              <Button type="submit" variant="primary" disabled={saving} className="h-10 text-xs">
                {saving ? 'Menyimpan...' : 'Simpan Target'}
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* Drawer: Upload Bukti & Finish Workout */}
      <Drawer
        isOpen={isCompleteOpen}
        onClose={() => setIsCompleteOpen(false)}
        title="Unggah Bukti Selesai Workout 📸"
      >
        <form onSubmit={handleCompleteWorkout} className="space-y-4 pb-4">
          <div className="bg-accent/10 border border-accent/20 p-3.5 rounded-xl text-center">
            <span className="text-xs font-bold text-text-primary">
              Menyelesaikan {completingType === 'rumah' ? 'Workout di Rumah' : completingType} ({completingDate})
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">Foto Bukti Olahraga *</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setUploadingPhoto(true)
                  const formData = new FormData()
                  formData.append('file', file)
                  try {
                    const res = await fetch('/api/upload', {
                      method: 'POST',
                      body: formData,
                    })
                    const data = await res.json()
                    if (res.ok && data.url) {
                      setPhotoUrl(data.url)
                      toast.success('Bukti olahraga berhasil diunggah! 📸')
                    } else {
                      toast.error(data.error || 'Gagal mengunggah bukti')
                    }
                  } catch (err) {
                    toast.error('Koneksi upload bermasalah')
                  } finally {
                    setUploadingPhoto(false)
                  }
                }}
                className="hidden"
                id="workout-photo-upload"
                disabled={uploadingPhoto}
              />
              <label
                htmlFor="workout-photo-upload"
                className="w-16 h-16 bg-surface-alt border border-dashed border-border-subtle rounded-xl flex flex-col items-center justify-center cursor-pointer text-text-secondary hover:bg-primary-light/10 transition-colors"
              >
                <Camera className="w-5 h-5 text-text-secondary" />
                <span className="text-[9px] font-bold mt-1">Upload</span>
              </label>
              {photoUrl && (
                <div className="relative w-16 h-16 rounded-xl border border-border-subtle overflow-hidden">
                  <img src={photoUrl} className="w-full h-full object-cover" alt="Preview bukti" />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="absolute top-0.5 right-0.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 cursor-pointer transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            {uploadingPhoto && <span className="text-[10px] text-primary animate-pulse font-bold">Mengunggah foto...</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="notes" className="text-xs font-semibold text-text-secondary">Catatan Singkat (Opsional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Bagaimana perasaanmu setelah olahraga hari ini? Lelah tapi seru..."
              className="w-full h-[60px] bg-surface-alt border border-border-subtle rounded-lg p-2.5 text-xs focus:outline-hidden"
            />
          </div>

          <Button type="submit" variant="primary" disabled={saving} className="h-11">
            {saving ? 'Mengirim...' : 'Selesaikan Workout! 💪'}
          </Button>
        </form>
      </Drawer>
    </div>
  )
}
