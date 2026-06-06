'use client'

import React, { useEffect, useState } from 'react'
import { Card, Button, Input } from '@/components/ui/CustomComponents'
import { Award, Plus, Trash2, Edit2, ShieldAlert, RefreshCw, X } from 'lucide-react'
import { toast } from 'sonner'

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  trigger_type: string
  trigger_value: number
}

const TRIGGER_LABELS: Record<string, string> = {
  recipes_created: 'Resep Dibuat',
  meals_cooked: 'Makanan Dimasak',
  workouts_completed: 'Olahraga Selesai',
  stock_items_count: 'Jumlah Bahan Stok'
}

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('🏆')
  const [triggerType, setTriggerType] = useState('recipes_created')
  const [triggerValue, setTriggerValue] = useState('5')

  const fetchBadges = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/reward')
      const json = await res.json()
      if (res.ok) {
        setBadges(json)
      } else {
        toast.error('Gagal mengambil daftar badge')
      }
    } catch (err) {
      toast.error('Koneksi terganggu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBadges()
  }, [])

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setDescription('')
    setIcon('🏆')
    setTriggerType('recipes_created')
    setTriggerValue('5')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !description.trim() || !icon.trim() || !triggerValue) {
      toast.warning('Harap isi semua field wajib!')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        icon: icon.trim(),
        trigger_type: triggerType,
        trigger_value: Number(triggerValue)
      }

      const url = editingId ? `/api/reward/${editingId}` : '/api/reward'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const json = await res.json()
      if (res.ok) {
        toast.success(editingId ? 'Badge berhasil diperbarui! 🏅' : 'Badge baru berhasil ditambahkan! 🏅')
        resetForm()
        fetchBadges()
      } else {
        toast.error(json.error || 'Gagal menyimpan data')
      }
    } catch (err) {
      toast.error('Masalah koneksi')
    } finally {
      setSaving(false)
    }
  }

  const handleEditInit = (badge: Badge) => {
    setEditingId(badge.id)
    setName(badge.name)
    setDescription(badge.description)
    setIcon(badge.icon)
    setTriggerType(badge.trigger_type || 'recipes_created')
    setTriggerValue(String(badge.trigger_value || 5))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus badge ini? Data perolehan user untuk badge ini juga akan terhapus.')) return

    try {
      const res = await fetch(`/api/reward/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        toast.success('Badge berhasil dihapus! 🗑️')
        if (editingId === id) resetForm()
        fetchBadges()
      } else {
        toast.error('Gagal menghapus badge')
      }
    } catch (err) {
      toast.error('Koneksi terganggu')
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-20 bg-bg-warm gap-3">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-semibold text-text-secondary">Memuat data badge...</p>
      </div>
    )
  }

  const groupedBadges = badges.reduce((acc, badge) => {
    const type = badge.trigger_type || 'recipes_created'
    if (!acc[type]) acc[type] = []
    acc[type].push(badge)
    return acc
  }, {} as Record<string, Badge[]>)

  return (
    <div className="flex-1 p-6 space-y-6 bg-bg-warm min-h-screen">
      {/* Header */}
      <header className="border-b border-border-subtle pb-4">
        <h1 className="text-lg font-bold text-text-primary flex items-center gap-1.5">
          <Award className="w-5 h-5 text-primary" /> Kelola Badge & Reward
        </h1>
        <p className="text-xs text-text-secondary">Konfigurasi reward pencapaian otomatis bagi pengguna HarianKu</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column - Form */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-5 bg-white border-border-subtle shadow-pink-subtle relative">
            {editingId && (
              <button
                onClick={resetForm}
                className="absolute top-4 right-4 text-text-secondary hover:text-text-primary cursor-pointer"
                title="Batal Edit"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <h3 className="text-xs font-bold text-text-primary mb-4 uppercase tracking-wider">
              {editingId ? 'Edit Badge Reward' : 'Buat Badge Baru'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Input
                    id="badgeName"
                    label="Nama Badge *"
                    placeholder="Misal: Koki Berbintang"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <Input
                  id="badgeIcon"
                  label="Emoji *"
                  placeholder="🏆"
                  value={icon}
                  onChange={e => setIcon(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="badgeDesc" className="text-xs font-semibold text-text-secondary">Deskripsi Reward *</label>
                <textarea
                  id="badgeDesc"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Deskripsikan pencapaian badge ini secara menarik..."
                  className="w-full h-[65px] bg-surface-alt border border-border-subtle rounded-lg p-2.5 text-xs text-text-primary focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="badgeTrigger" className="text-xs font-semibold text-text-secondary">Kategori Syarat *</label>
                  <select
                    id="badgeTrigger"
                    value={triggerType}
                    onChange={e => setTriggerType(e.target.value)}
                    className="h-[48px] bg-surface-alt border border-border-subtle rounded-lg px-2.5 text-xs focus:outline-hidden cursor-pointer text-text-primary"
                  >
                    <option value="recipes_created">Resep Pribadi Dibuat (Unit)</option>
                    <option value="meals_cooked">Total Menu Dimasak (Kali)</option>
                    <option value="workouts_completed">Total Olahraga Selesai (Kali)</option>
                    <option value="stock_items_count">Jumlah Bahan di Stok Dapur (Jenis)</option>
                  </select>
                </div>
                <Input
                  id="badgeTriggerVal"
                  type="number"
                  label="Target Nilai Syarat *"
                  value={triggerValue}
                  onChange={e => setTriggerValue(e.target.value)}
                  min="1"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  type="submit" 
                  disabled={saving} 
                  className={`h-10 text-xs w-full rounded-lg font-bold ${
                    editingId ? 'bg-warning hover:opacity-95' : 'bg-primary hover:bg-primary-dark'
                  } text-white`}
                >
                  {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambahkan Badge'}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    onClick={resetForm}
                    className="h-10 text-xs bg-surface-alt hover:bg-border-subtle/50 text-text-secondary rounded-lg w-auto px-4"
                  >
                    Batal
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column - Badges List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Daftar Badge Tersedia ({badges.length})</h2>

          {badges.length > 0 ? (
            <div className="space-y-6">
              {Object.keys(TRIGGER_LABELS).map((type) => {
                const badgeList = groupedBadges[type] || []
                if (badgeList.length === 0) return null

                return (
                  <div key={type} className="space-y-3">
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-1.5 flex justify-between items-center">
                      <span>🎯 {TRIGGER_LABELS[type]}</span>
                      <span className="text-[10px] text-primary bg-primary-light/45 px-2.5 py-0.5 rounded-full font-black">{badgeList.length} Badge</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {badgeList.map((badge) => (
                        <Card 
                          key={badge.id}
                          className={`p-4 bg-white border-border-subtle shadow-pink-subtle flex flex-col justify-between transition-all ${
                            editingId === badge.id ? 'ring-2 ring-primary/70 border-transparent' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary-light/30 flex items-center justify-center text-3xl shrink-0">
                              {badge.icon}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-text-primary truncate">{badge.name}</h4>
                              <p className="text-[10px] text-text-secondary mt-1 leading-relaxed line-clamp-2">
                                {badge.description}
                              </p>
                              <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-alt text-text-secondary text-[9px] font-bold">
                                <span>🎯 {TRIGGER_LABELS[badge.trigger_type] || badge.trigger_type}:</span>
                                <span className="text-primary">{badge.trigger_value}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 border-t border-border-subtle/50 mt-4 pt-2.5">
                            <button
                              onClick={() => handleEditInit(badge)}
                              className="p-1.5 rounded-md hover:bg-primary-light/30 text-text-secondary hover:text-primary cursor-pointer transition-colors"
                              title="Edit Badge"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(badge.id)}
                              className="p-1.5 rounded-md hover:bg-red-50 text-text-secondary hover:text-danger cursor-pointer transition-colors"
                              title="Hapus Badge"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="border border-dashed border-border-subtle bg-white rounded-xl py-12 px-4 text-center">
              <ShieldAlert className="w-8 h-8 text-text-disabled mx-auto mb-2" />
              <p className="text-xs text-text-secondary font-semibold">Belum ada badge reward di sistem.</p>
              <p className="text-[10px] text-text-disabled mt-1">Gunakan formulir di samping untuk membuat lencana pertamamu.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

