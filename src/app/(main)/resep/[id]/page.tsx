'use client'

import React, { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Button, Input } from '@/components/ui/CustomComponents'
import { ArrowLeft, Clock, Users, Star, Trash2, Heart, CheckSquare, Edit3, X } from 'lucide-react'
import { toast } from 'sonner'

interface Ingredient {
  id: string
  name: string
  amount: number
  unit: string
}

interface RecipePhoto {
  id: string
  url: string
  type: 'reference' | 'result'
  is_primary: boolean
}

interface RecipeDetail {
  id: string
  name: string
  description: string
  estimated_time_minutes: number
  servings: number
  steps: string[]
  is_favorite: boolean
  rating: number | null
  rating_notes: string | null
  categories?: {
    name: string
    color: string
  }
  recipe_ingredients: Ingredient[]
  recipe_photos?: RecipePhoto[]
}

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id: recipeId } = use(params)
  
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [ratingVal, setRatingVal] = useState<number>(5)
  const [ratingNotes, setRatingNotes] = useState<string>('')
  const [submittingRating, setSubmittingRating] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  const fetchRecipeDetails = async () => {
    try {
      const res = await fetch(`/api/resep/${recipeId}`)
      if (res.ok) {
        const data = await res.json()
        setRecipe(data)
        setRatingVal(data.rating || 5)
        setRatingNotes(data.rating_notes || '')
      } else {
        toast.error('Resep tidak ditemukan')
        router.push('/resep')
      }
    } catch (err) {
      toast.error('Gagal memuat resep')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecipeDetails()
  }, [recipeId])

  const handleToggleFavorite = async () => {
    if (!recipe) return
    const updatedFav = !recipe.is_favorite
    
    // Optimistic update
    setRecipe({ ...recipe, is_favorite: updatedFav })

    try {
      const res = await fetch(`/api/resep/${recipeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: updatedFav }),
      })
      if (!res.ok) {
        // Rollback
        setRecipe({ ...recipe, is_favorite: !updatedFav })
        toast.error('Gagal merubah status favorit')
      } else {
        toast.success(updatedFav ? 'Resep difavoritkan! ❤️' : 'Dihapus dari favorit.')
      }
    } catch (err) {
      setRecipe({ ...recipe, is_favorite: !updatedFav })
      toast.error('Masalah koneksi')
    }
  }

  const handleRateRecipe = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingRating(true)
    try {
      const res = await fetch(`/api/resep/${recipeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: ratingVal, rating_notes: ratingNotes }),
      })
      if (res.ok) {
        toast.success('Ulasan disimpan! ⭐')
        fetchRecipeDetails()
      } else {
        toast.error('Gagal menyimpan ulasan')
      }
    } catch (err) {
      toast.error('Gagal terhubung')
    } finally {
      setSubmittingRating(false)
    }
  }

  const handleDeleteRecipe = async () => {
    try {
      const res = await fetch(`/api/resep/${recipeId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Resep berhasil dihapus 🗑️')
        router.push('/resep')
        router.refresh()
      } else {
        toast.error('Gagal menghapus resep')
      }
    } catch (err) {
      toast.error('Koneksi bermasalah')
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center min-h-[80vh] gap-3 bg-bg-warm">
        <p className="text-xs font-semibold text-text-secondary animate-pulse">Memuat resep detail...</p>
      </div>
    )
  }

  if (!recipe) return null

  return (
    <div className="flex-1 flex flex-col bg-bg-warm p-5 space-y-4">
      {/* Top Bar */}
      <header className="flex justify-between items-center py-2">
        <button
          onClick={() => router.push('/resep')}
          className="w-10 h-10 bg-white rounded-full border border-border-subtle flex items-center justify-center hover:bg-surface-alt active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/resep/${recipeId}/edit`)}
            className="w-10 h-10 bg-white rounded-full border border-border-subtle flex items-center justify-center hover:bg-surface-alt active:scale-95 transition-all cursor-pointer"
            title="Edit Resep"
          >
            <Edit3 className="w-5 h-5 text-text-primary" />
          </button>
          <button
            onClick={handleToggleFavorite}
            className="w-10 h-10 bg-white rounded-full border border-border-subtle flex items-center justify-center hover:bg-surface-alt active:scale-95 transition-all cursor-pointer"
          >
            <Heart className={`w-5 h-5 ${recipe.is_favorite ? 'fill-primary text-primary' : 'text-text-primary'}`} />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-10 h-10 bg-white rounded-full border border-border-subtle flex items-center justify-center hover:bg-red-50 text-red-500 active:scale-95 transition-all cursor-pointer"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Info Card */}
      <Card className="space-y-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-lg font-extrabold text-text-primary leading-tight">
              {recipe.name}
            </h1>
            <div className="flex items-center gap-2">
              {recipe.categories && (
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: recipe.categories.color }}
                >
                  {recipe.categories.name}
                </span>
              )}
            </div>
          </div>
          <div className="w-16 h-16 bg-surface-alt rounded-xl flex items-center justify-center text-4xl shadow-inner overflow-hidden shrink-0 relative border border-border-subtle">
            {recipe.recipe_photos?.find(p => p.type === 'reference') ? (
              <img
                src={recipe.recipe_photos.find(p => p.type === 'reference')?.url}
                alt={recipe.name}
                className="w-full h-full object-cover"
              />
            ) : (
              '🥘'
            )}
          </div>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed">
          {recipe.description || 'Tidak ada deskripsi resep.'}
        </p>

        {/* Specs */}
        <div className="flex gap-4 pt-2 border-t border-dashed border-border-subtle">
          <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary" /> {recipe.estimated_time_minutes || 30} menit
          </span>
          <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
            <Users className="w-4 h-4 text-secondary" /> {recipe.servings || 2} porsi
          </span>
          {recipe.rating && (
            <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
              <Star className="w-4 h-4 text-warning fill-warning" /> {recipe.rating}
            </span>
          )}
        </div>
      </Card>

      {/* Ingredients List */}
      <section className="space-y-2">
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
          🛒 Bahan-Bahan
        </h2>
        <Card className="divide-y divide-border-subtle/55">
          {recipe.recipe_ingredients && recipe.recipe_ingredients.length > 0 ? (
            recipe.recipe_ingredients.map((ing) => (
              <div key={ing.id} className="py-2.5 flex justify-between items-center text-xs font-medium">
                <span className="text-text-primary">{ing.name}</span>
                <span className="text-primary font-bold">{ing.amount} {ing.unit}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-text-disabled italic p-2 text-center">Bahan resep tidak terinci.</p>
          )}
        </Card>
      </section>

      {/* Steps List */}
      <section className="space-y-2">
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
          🍳 Langkah Memasak
        </h2>
        <Card className="space-y-3.5">
          {recipe.steps && recipe.steps.length > 0 ? (
            recipe.steps.map((step, idx) => (
              <div key={idx} className="flex gap-3 text-xs leading-relaxed items-start">
                <span className="w-5 h-5 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-text-primary font-medium">{step}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-text-disabled italic p-2 text-center">Langkah memasak belum terinci.</p>
          )}
        </Card>
      </section>

      {/* Galeri Hasil Masak Kamu */}
      <section className="space-y-2">
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
          📸 Galeri Hasil Masak Kamu
        </h2>
        <Card>
          {recipe.recipe_photos && recipe.recipe_photos.filter(p => p.type === 'result').length > 0 ? (
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
              {recipe.recipe_photos
                .filter(p => p.type === 'result')
                .map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo.url)}
                    className="w-20 h-20 rounded-lg bg-surface-alt border border-border-subtle overflow-hidden shrink-0 relative flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={photo.url}
                      alt="Hasil Masak"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-xs text-text-disabled italic text-center py-4">
              Belum ada foto hasil masak. Masak resep ini dari Meal Planner dan unggah fotomu!
            </p>
          )}
        </Card>
      </section>

      {/* Rate & Review Form */}
      <section className="space-y-2">
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
          ⭐ Nilai Hasil Masak
        </h2>
        <Card>
          <form onSubmit={handleRateRecipe} className="space-y-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary">Beri Rating Masakan:</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingVal(star)}
                    className="p-1 cursor-pointer hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= ratingVal
                          ? 'text-warning fill-warning'
                          : 'text-text-disabled'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="notes" className="text-xs font-bold text-text-secondary">Catatan Evaluasi Rasa:</label>
              <textarea
                id="notes"
                value={ratingNotes}
                onChange={(e) => setRatingNotes(e.target.value)}
                placeholder="Kurang asin, bumbu kurang matang, atau berhasil dimasak dengan sempurna..."
                className="w-full h-[60px] bg-surface-alt border border-border-subtle rounded-lg p-2.5 text-xs text-text-primary placeholder:text-text-secondary focus:outline-hidden focus:border-primary transition-colors resize-none"
              />
            </div>

            <Button type="submit" variant="secondary" disabled={submittingRating} className="h-10 text-xs">
              {submittingRating ? 'Menyimpan...' : 'Simpan Rating & Catatan'}
            </Button>
          </form>
        </Card>
      </section>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">
          <Card className="w-full max-w-[320px] p-5 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto text-xl">
              ⚠️
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-text-primary">Hapus Resep ini?</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Resep ini akan dihapus permanen dari library-mu. Aksi ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex gap-2.5">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
                className="h-10 text-xs flex-1"
              >
                Batal
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteRecipe}
                className="h-10 text-xs flex-1"
              >
                Hapus
              </Button>
            </div>
          </Card>
        </div>
      )}
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
              alt="Bukti Masak Terbuka"
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}
