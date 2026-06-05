'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, Chip } from '@/components/ui/CustomComponents'
import { Search, Plus, Clock, RefreshCw, Heart, X, Trash2, Edit } from 'lucide-react'
import { toast } from 'sonner'
import Fuse from 'fuse.js'

interface Recipe {
  id: string
  name: string
  description: string
  estimated_time_minutes: number
  is_favorite: boolean
  is_starter: boolean
  rating: number | null
  categories?: {
    id: string
    name: string
    color: string
  }
  recipe_photos?: Array<{ url: string }>
}

export default function RecipeLibraryPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('semua')
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<'semua' | 'cepat' | 'sedang'>('semua')
  const [onlyFavorites, setOnlyFavorites] = useState(false)

  // Category Manager States
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false)
  const [categoryName, setCategoryName] = useState('')
  const [categoryColor, setCategoryColor] = useState('#FF6B9D')
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [savingCategory, setSavingCategory] = useState(false)

  const fetchRecipesAndCategories = async () => {
    try {
      const recRes = await fetch('/api/resep')
      const recJson = await recRes.json()

      const catRes = await fetch('/api/kategori')
      const catJson = await catRes.json()

      if (recRes.ok) {
        setRecipes(recJson)
        setFilteredRecipes(recJson)
      }
      if (catRes.ok) {
        setCategories(catJson)
      }
    } catch (err) {
      toast.error('Gagal mengambil data resep')
    } finally {
      setLoading(false)
    }
  }

  const presetColors = [
    '#FF6B9D', '#FF8E9C', '#FF9A3C', '#FFD93D', '#6BCB77', '#4D96FF',
    '#9E7676', '#8F71FF', '#8FE3CF', '#C47AFF', '#B4E197', '#FFB3B3'
  ]

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryName.trim()) {
      toast.warning('Nama kategori tidak boleh kosong!')
      return
    }

    setSavingCategory(true)
    try {
      const isEdit = !!editingCategoryId
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch('/api/kategori', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCategoryId,
          name: categoryName.trim(),
          color: categoryColor
        })
      })

      if (res.ok) {
        toast.success(isEdit ? 'Kategori diperbarui! 🎨' : 'Kategori baru ditambahkan! 🎨')
        setCategoryName('')
        setEditingCategoryId(null)
        fetchRecipesAndCategories()
      } else {
        toast.error('Gagal menyimpan kategori')
      }
    } catch (err) {
      toast.error('Koneksi bermasalah')
    } finally {
      setSavingCategory(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/kategori?id=${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        toast.success('Kategori berhasil dihapus 🗑️')
        if (selectedCategory === id) setSelectedCategory('semua')
        fetchRecipesAndCategories()
      } else {
        toast.error('Gagal menghapus kategori')
      }
    } catch (err) {
      toast.error('Koneksi bermasalah')
    }
  }

  useEffect(() => {
    fetchRecipesAndCategories()
  }, [])

  // Apply filters and search
  useEffect(() => {
    let result = [...recipes]

    // Search query with Fuse.js
    if (searchQuery.trim() !== '') {
      const fuse = new Fuse(result, {
        keys: ['name', 'description', 'tags'],
        threshold: 0.4,
      })
      result = fuse.search(searchQuery).map((r) => r.item)
    }

    // Category filter
    if (selectedCategory !== 'semua') {
      result = result.filter((r) => r.categories?.id === selectedCategory)
    }

    // Time filter
    if (selectedTimeFilter === 'cepat') {
      result = result.filter((r) => r.estimated_time_minutes && r.estimated_time_minutes <= 15)
    } else if (selectedTimeFilter === 'sedang') {
      result = result.filter((r) => r.estimated_time_minutes && r.estimated_time_minutes <= 30)
    }

    // Favorite filter
    if (onlyFavorites) {
      result = result.filter((r) => r.is_favorite)
    }

    setFilteredRecipes(result)
  }, [searchQuery, selectedCategory, selectedTimeFilter, onlyFavorites, recipes])

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center min-h-[80vh] gap-3">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-semibold text-text-secondary">Membuka buku resep...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col p-5 space-y-4">
      {/* Top Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-text-primary">🍳 Resepku</h1>
          <p className="text-xs text-text-secondary">Kelola library resep masakan pribadimu</p>
        </div>
        <Link
          href="/resep/baru"
          className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark active:scale-95 transition-all shadow-badge cursor-pointer"
        >
          <Plus className="w-5 h-5" />
        </Link>
      </header>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari resep favoritmu di sini..."
          className="w-full h-[46px] pl-10 pr-10 bg-surface-alt border-1.5 border-border-subtle rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-primary transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-3 w-5 h-5 bg-text-secondary/15 hover:bg-text-secondary/25 rounded-full flex items-center justify-center text-text-secondary transition-colors cursor-pointer"
            title="Bersihkan pencarian"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="flex gap-2 items-center overflow-x-auto pb-1.5 scrollbar-none">
        <Chip
          label="Semua Kategori"
          active={selectedCategory === 'semua'}
          onClick={() => setSelectedCategory('semua')}
        />
        {categories.map((cat) => (
          <Chip
            key={cat.id}
            label={cat.name}
            active={selectedCategory === cat.id}
            onClick={() => setSelectedCategory(cat.id)}
          />
        ))}
        <button
          onClick={() => setIsCategoryManagerOpen(true)}
          className="h-[28px] px-2.5 rounded-lg bg-surface-alt border border-border-subtle text-[10px] font-bold text-text-secondary hover:bg-border-subtle/35 active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-1"
        >
          ⚙️ Kelola
        </button>
      </div>

      {/* Quick Filter Toggles */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOnlyFavorites(!onlyFavorites)}
          className={`h-[32px] px-3.5 rounded-full text-xs font-bold border flex items-center gap-1 cursor-pointer transition-colors ${
            onlyFavorites
              ? 'bg-primary-light text-primary border-primary'
              : 'bg-white text-text-secondary border-border-subtle'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 fill-primary text-primary`} /> Favorit
        </button>

        <button
          onClick={() => setSelectedTimeFilter(selectedTimeFilter === 'cepat' ? 'semua' : 'cepat')}
          className={`h-[32px] px-3.5 rounded-full text-xs font-bold border flex items-center gap-1 cursor-pointer transition-colors ${
            selectedTimeFilter === 'cepat'
              ? 'bg-primary-light text-primary border-primary'
              : 'bg-white text-text-secondary border-border-subtle'
          }`}
        >
          <span>⏳</span> ≤15 Meniit
        </button>

        <button
          onClick={() => setSelectedTimeFilter(selectedTimeFilter === 'sedang' ? 'semua' : 'sedang')}
          className={`h-[32px] px-3.5 rounded-full text-xs font-bold border flex items-center gap-1 cursor-pointer transition-colors ${
            selectedTimeFilter === 'sedang'
              ? 'bg-primary-light text-primary border-primary'
              : 'bg-white text-text-secondary border-border-subtle'
          }`}
        >
          <span>⏳</span> ≤30 Menit
        </button>
      </div>

      {/* Recipes List/Grid */}
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-2 gap-3.5">
          {filteredRecipes.map((recipe) => (
            <Link key={recipe.id} href={`/resep/${recipe.id}`}>
              <Card className="flex flex-col gap-2 p-2.5 h-full hover:border-primary/45 transition-colors cursor-pointer justify-between">
                <div className="space-y-1.5">
                  {/* Photo placeholder or illustration */}
                  <div className="w-full aspect-video bg-surface-alt rounded-lg flex items-center justify-center text-3xl shadow-inner relative overflow-hidden">
                    {recipe.recipe_photos?.[0]?.url ? (
                      <img src={recipe.recipe_photos[0].url} className="w-full h-full object-cover animate-fade-in" alt={recipe.name} />
                    ) : (
                      '🍳'
                    )}
                    {recipe.is_favorite && (
                      <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-white/95 rounded-full flex items-center justify-center shadow-xs">
                        <Heart className="w-3 h-3 fill-primary text-primary" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-text-primary line-clamp-1 leading-snug">
                      {recipe.name}
                    </h3>
                    <p className="text-[10px] text-text-secondary line-clamp-2 mt-0.5 min-h-[28px] leading-tight">
                      {recipe.description || 'Tidak ada deskripsi.'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1.5 border-t border-dashed border-border-subtle">
                  <span className="text-[10px] text-text-secondary flex items-center gap-1">
                    <Clock className="w-3 h-3 text-text-disabled" /> {recipe.estimated_time_minutes || 30}m
                  </span>
                  
                  {recipe.categories && (
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shrink-0"
                      style={{ backgroundColor: recipe.categories.color }}
                    >
                      {recipe.categories.name}
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center items-center py-12 text-center gap-3">
          <span className="text-5xl">🥣</span>
          <div>
            <h3 className="text-sm font-bold text-text-primary">Library Resep Kosong</h3>
            <p className="text-xs text-text-secondary max-w-[200px] mx-auto mt-0.5 leading-relaxed">
              Tambahkan resep pertamamu atau kurangi filter pencarian.
            </p>
          </div>
          <Link
            href="/resep/baru"
            className="px-4 py-2 bg-primary text-white font-semibold rounded-full text-xs hover:opacity-90 active:scale-95 transition-all shadow-badge"
          >
            Tambah Resep Baru
          </Link>
        </div>
      )}

      {/* Category Manager Modal */}
      {isCategoryManagerOpen && (
        <div className="fixed inset-0 bg-black/45 z-55 flex items-center justify-center p-6">
          <Card className="w-full max-w-[340px] p-5 space-y-4 relative bg-white">
            <button 
              onClick={() => {
                setIsCategoryManagerOpen(false)
                setCategoryName('')
                setEditingCategoryId(null)
              }}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-text-primary text-center">
              🎨 Kelola Kategori Resep
            </h3>

            {/* Category Form */}
            <form onSubmit={handleSaveCategory} className="space-y-3 p-3 bg-surface-alt rounded-2xl border border-border-subtle">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                {editingCategoryId ? 'Edit Kategori' : 'Kategori Baru'}
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nama Kategori (misal: Menu Takjil)"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="flex-1 h-9 px-2.5 text-xs bg-white rounded-lg border border-border-subtle focus:outline-hidden focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="h-9 px-3 bg-primary text-white font-bold rounded-lg text-xs hover:opacity-95 active:scale-95 cursor-pointer transition-all"
                >
                  {savingCategory ? '...' : editingCategoryId ? 'Simpan' : 'Tambah'}
                </button>
              </div>

              {/* Color Preset Picker */}
              <div className="space-y-1">
                <span className="text-[9px] text-text-secondary">Pilih Warna Kategori:</span>
                <div className="grid grid-cols-6 gap-2">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCategoryColor(color)}
                      className="w-6 h-6 rounded-full border border-border-subtle flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                      style={{ backgroundColor: color }}
                    >
                      {categoryColor === color && (
                        <span className="text-[10px] text-white">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </form>

            {/* Existing Categories List */}
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                Daftar Kategori Anda
              </span>
              {categories.length === 0 ? (
                <p className="text-[10px] text-text-disabled italic text-center py-2">Belum ada kategori custom.</p>
              ) : (
                <div className="space-y-1.5">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex justify-between items-center p-2 bg-surface-alt rounded-lg border border-border-subtle/45">
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-xs font-bold text-text-primary">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategoryId(cat.id)
                            setCategoryName(cat.name)
                            setCategoryColor(cat.color)
                          }}
                          className="p-1 hover:bg-white text-text-secondary rounded cursor-pointer transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1 hover:bg-red-50 text-red-500 rounded cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
