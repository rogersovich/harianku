'use client'

import React, { useEffect, useState } from 'react'
import { Card, Button, Input } from '@/components/ui/CustomComponents'
import { Tag, Plus, Trash2, Edit2, ShieldAlert, RefreshCw, X } from 'lucide-react'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  color: string
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#FF6B9D') // Default to brand primary pink

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/categories')
      const json = await res.json()
      if (res.ok) {
        setCategories(json)
      } else {
        toast.error('Gagal mengambil daftar kategori default')
      }
    } catch (err) {
      toast.error('Koneksi terganggu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setColor('#FF6B9D')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !color.trim()) {
      toast.warning('Harap isi semua field wajib!')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: name.trim(),
        color: color.trim()
      }

      const url = editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const json = await res.json()
      if (res.ok) {
        toast.success(editingId ? 'Kategori berhasil diperbarui!' : 'Kategori baru berhasil ditambahkan!')
        resetForm()
        fetchCategories()
      } else {
        toast.error(json.error || 'Gagal menyimpan kategori')
      }
    } catch (err) {
      toast.error('Masalah koneksi')
    } finally {
      setSaving(false)
    }
  }

  const handleEditInit = (cat: Category) => {
    setEditingId(cat.id)
    setName(cat.name)
    setColor(cat.color)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori default ini? User yang sudah terdaftar tidak akan terpengaruh, namun user baru tidak akan mendapatkan kategori ini.')) return

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        toast.success('Kategori default berhasil dihapus! 🗑️')
        if (editingId === id) resetForm()
        fetchCategories()
      } else {
        toast.error('Gagal menghapus kategori default')
      }
    } catch (err) {
      toast.error('Koneksi terganggu')
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-20 bg-bg-warm gap-3">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-semibold text-text-secondary">Memuat data kategori default...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 space-y-6 bg-bg-warm min-h-screen">
      {/* Header */}
      <header className="border-b border-border-subtle pb-4">
        <h1 className="text-lg font-bold text-text-primary flex items-center gap-1.5">
          <Tag className="w-5 h-5 text-primary" /> Kelola Kategori Default
        </h1>
        <p className="text-xs text-text-secondary">Atur daftar kategori default resep bawaan yang otomatis terbuat untuk setiap pengguna baru</p>
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
              {editingId ? 'Edit Kategori Default' : 'Buat Kategori Default'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="catName"
                label="Nama Kategori *"
                placeholder="Misal: Cemilan Protein"
                value={name}
                onChange={e => setName(e.target.value)}
              />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="catColor" className="text-xs font-semibold text-text-secondary">Warna Kategori *</label>
                <div className="flex gap-3 items-center">
                  <input
                    id="catColor"
                    type="color"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border border-border-subtle bg-white p-1"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="flex-1 h-10 px-3 bg-surface-alt border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden focus:border-primary"
                    placeholder="#FF6B9D"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  type="submit" 
                  disabled={saving} 
                  className={`h-10 text-xs w-full rounded-lg font-bold ${
                    editingId ? 'bg-warning hover:opacity-95' : 'bg-primary hover:bg-primary-dark'
                  } text-white`}
                >
                  {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambahkan Kategori'}
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

        {/* Right Column - Categories List */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Daftar Kategori Bawaan ({categories.length})</h2>

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <Card 
                  key={cat.id}
                  className={`p-4 bg-white border-border-subtle shadow-pink-subtle flex flex-col justify-between transition-all ${
                    editingId === cat.id ? 'ring-2 ring-primary/70 border-transparent' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-black/5 shadow-inner"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-extrabold text-text-primary truncate">{cat.name}</h4>
                      <p className="text-[10px] text-text-secondary font-mono mt-0.5">{cat.color}</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-border-subtle/50 mt-4 pt-2.5">
                    <button
                      onClick={() => handleEditInit(cat)}
                      className="p-1.5 rounded-md hover:bg-primary-light/30 text-text-secondary hover:text-primary cursor-pointer transition-colors"
                      title="Edit Kategori"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 rounded-md hover:bg-red-50 text-text-secondary hover:text-danger cursor-pointer transition-colors"
                      title="Hapus Kategori"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-border-subtle bg-white rounded-xl py-12 px-4 text-center">
              <ShieldAlert className="w-8 h-8 text-text-disabled mx-auto mb-2" />
              <p className="text-xs text-text-secondary font-semibold">Belum ada kategori default di database.</p>
              <p className="text-[10px] text-text-disabled mt-1">Gunakan formulir di samping untuk mendaftarkan kategori default pertamamu.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
