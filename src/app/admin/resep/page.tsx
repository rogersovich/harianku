'use client'

import React, { useEffect, useState } from 'react'
import { Card, Button, Input } from '@/components/ui/CustomComponents'
import { BookOpen, Plus, Trash2, Edit2, ShieldAlert, RefreshCw, X, ArrowLeft, Clock, Utensils, Camera } from 'lucide-react'
import { toast } from 'sonner'

interface Ingredient {
  name: string
  amount: number
  unit: string
  price_per_unit: number | null
}

interface Recipe {
  id: string
  name: string
  description: string | null
  category_id: string | null
  estimated_time_minutes: number | null
  servings: number
  steps: string[]
  categories?: {
    id: string
    name: string
    color: string
  } | null
  recipe_ingredients?: Ingredient[]
  recipe_photos?: {
    url: string
  }[]
}

interface Category {
  id: string
  name: string
  color: string
}

export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [estimatedTime, setEstimatedTime] = useState('30')
  const [servings, setServings] = useState('1')
  const [photoUrl, setPhotoUrl] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', amount: 1, unit: 'g', price_per_unit: null }])
  const [steps, setSteps] = useState<string[]>([''])

  const uploadFile = async (file: File) => {
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
        toast.success('Foto berhasil diunggah! 📸')
      } else {
        toast.error(data.error || 'Gagal mengunggah foto')
      }
    } catch (err) {
      toast.error('Koneksi upload bermasalah')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await uploadFile(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      dragActive === false && setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('image/')) {
        await uploadFile(file)
      } else {
        toast.warning('Hanya file gambar yang diperbolehkan!')
      }
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [resRecipes, resCategories] = await Promise.all([
        fetch('/api/admin/resep'),
        fetch('/api/admin/categories')
      ])

      const dataRecipes = await resRecipes.json()
      const dataCategories = await resCategories.json()


      if (resRecipes.ok) setRecipes(dataRecipes)
      if (resCategories.ok) setCategories(dataCategories)
    } catch (err) {
      toast.error('Gagal memuat data resep/kategori')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setDescription('')
    setCategoryId('')
    setEstimatedTime('30')
    setServings('1')
    setPhotoUrl('')
    setIngredients([{ name: '', amount: 1, unit: 'g', price_per_unit: null }])
    setSteps([''])
    setIsFormOpen(false)
  }

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: 1, unit: 'g', price_per_unit: null }])
  }

  const handleRemoveIngredient = (index: number) => {
    const nextIng = [...ingredients]
    nextIng.splice(index, 1)
    setIngredients(nextIng)
  }

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: any) => {
    const nextIng = [...ingredients]
    if (field === 'amount') {
      nextIng[index][field] = value === '' ? 0 : Number(value)
    } else if (field === 'price_per_unit') {
      nextIng[index][field] = value === '' ? null : Number(value)
    } else {
      nextIng[index][field] = value as any
    }
    setIngredients(nextIng)
  }

  const handleAddStep = () => {
    setSteps([...steps, ''])
  }

  const handleRemoveStep = (index: number) => {
    const nextSteps = [...steps]
    nextSteps.splice(index, 1)
    setSteps(nextSteps)
  }

  const handleStepChange = (index: number, value: string) => {
    const nextSteps = [...steps]
    nextSteps[index] = value
    setSteps(nextSteps)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.warning('Nama resep wajib diisi!')
      return
    }

    const filteredIngredients = ingredients.filter(ing => ing.name.trim() !== '')
    const filteredSteps = steps.filter(step => step.trim() !== '')

    setSaving(true)
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        category_id: categoryId || null,
        estimated_time_minutes: estimatedTime ? Number(estimatedTime) : null,
        servings: Number(servings),
        steps: filteredSteps,
        ingredients: filteredIngredients,
        photo_url: photoUrl.trim() || null
      }

      const url = editingId ? `/api/admin/resep/${editingId}` : '/api/admin/resep'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast.success(editingId ? 'Resep starter berhasil diperbarui!' : 'Resep starter baru berhasil dibuat!')
        resetForm()
        fetchData()
      } else {
        const json = await res.json()
        toast.error(json.error || 'Gagal menyimpan resep')
      }
    } catch (err) {
      toast.error('Masalah koneksi')
    } finally {
      setSaving(false)
    }
  }

  const handleEditInit = (recipe: Recipe) => {
    setEditingId(recipe.id)
    setName(recipe.name)
    setDescription(recipe.description || '')
    setCategoryId(recipe.category_id || '')
    setEstimatedTime(String(recipe.estimated_time_minutes || 30))
    setServings(String(recipe.servings || 1))
    setPhotoUrl(recipe.recipe_photos?.[0]?.url || '')
    setIngredients(
      recipe.recipe_ingredients && recipe.recipe_ingredients.length > 0
        ? recipe.recipe_ingredients.map(i => ({ ...i, price_per_unit: i.price_per_unit ? Number(i.price_per_unit) : null }))
        : [{ name: '', amount: 1, unit: 'g', price_per_unit: null }]
    )
    setSteps(recipe.steps && recipe.steps.length > 0 ? recipe.steps : [''])
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus resep starter ini?')) return

    try {
      const res = await fetch(`/api/admin/resep/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        toast.success('Resep starter berhasil dihapus! 🗑️')
        if (editingId === id) resetForm()
        fetchData()
      } else {
        toast.error('Gagal menghapus resep')
      }
    } catch (err) {
      toast.error('Koneksi terganggu')
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-20 bg-bg-warm gap-3">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-semibold text-text-secondary">Memuat data resep starter...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 pb-16 space-y-6">
      {/* Header */}
      <header className="border-b border-border-subtle pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-text-primary flex items-center gap-1.5">
            <BookOpen className="w-5 h-5 text-primary" /> Kelola Resep Starter
          </h1>
          <p className="text-xs text-text-secondary">Sediakan menu makanan bawaan default bagi pengguna baru</p>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-1.5 px-4 h-9 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Resep
          </button>
        )}
      </header>

      {isFormOpen ? (
        /* Form View */
        <Card className="p-6 bg-white border-border-subtle shadow-sm max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-center border-b border-border-subtle/50 pb-3">
            <button
              onClick={resetForm}
              className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary cursor-pointer font-bold"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
            </button>
            <h3 className="text-sm font-extrabold text-text-primary">
              {editingId ? 'Edit Resep Starter' : 'Tambah Resep Starter Baru'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Basic Info Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="recipeName"
                label="Nama Resep *"
                placeholder="Misal: Sup Sayur Bening"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <div className="flex flex-col gap-1.5">
                <label htmlFor="recipeCat" className="text-xs font-semibold text-text-secondary">Kategori Resep</label>
                <select
                  id="recipeCat"
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="h-[48px] bg-surface-alt border border-border-subtle rounded-lg px-2.5 text-xs focus:outline-hidden cursor-pointer text-text-primary"
                >
                  <option value="">Pilih Kategori...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="estTime"
                type="number"
                label="Estimasi Waktu (Menit)"
                value={estimatedTime}
                onChange={e => setEstimatedTime(e.target.value)}
              />
              <Input
                id="servings"
                type="number"
                label="Jumlah Porsi"
                value={servings}
                onChange={e => setServings(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary">Foto Utama Resep</label>
              
              <div 
                className={`relative w-40 h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                  dragActive 
                    ? 'border-primary bg-primary-light/10 scale-[1.01]' 
                    : 'border-border-subtle bg-surface-alt hover:bg-primary-light/5'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={uploadingPhoto}
                  id="photo-upload"
                />

                {photoUrl ? (
                  <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden z-20 flex items-center justify-center bg-black/5">
                    <img src={photoUrl} className="w-full h-full object-cover" alt="Preview resep" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoUrl('');
                      }}
                      className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 cursor-pointer transition-colors shadow-md z-30"
                      title="Hapus Foto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center p-4">
                    <Camera className={`w-8 h-8 mb-2 transition-colors ${dragActive ? 'text-primary' : 'text-text-secondary'}`} />
                    <p className="text-xs font-bold text-text-primary">
                      {dragActive ? 'Lepaskan gambar di sini' : 'Tarik & lepas gambar di sini'}
                    </p>
                    <p className="text-[10px] text-text-secondary mt-1">
                      Atau klik untuk memilih file dari komputer Anda
                    </p>
                  </div>
                )}

                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-white/80 rounded-2xl flex flex-col items-center justify-center gap-2 z-30">
                    <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                    <span className="text-[10px] text-primary font-bold">Mengunggah foto...</span>
                  </div>
                )}
              </div>
            </div>



            <div className="flex flex-col gap-1.5">
              <label htmlFor="desc" className="text-xs font-semibold text-text-secondary">Deskripsi Singkat Resep</label>
              <textarea
                id="desc"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Tuliskan cerita singkat atau instruksi penyajian awal di sini..."
                className="w-full h-[65px] bg-surface-alt border border-border-subtle rounded-lg p-2.5 text-xs text-text-primary focus:outline-hidden focus:border-primary"
              />
            </div>

            {/* Ingredients Section */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center border-b border-border-subtle/50 pb-2">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Bahan - Bahan</h4>
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="text-[11px] font-bold text-primary hover:text-primary-dark flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Bahan
                </button>
              </div>

              <div className="space-y-2">
                {ingredients.map((ing, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-surface-alt/45 p-2 rounded-lg border border-border-subtle/50">
                    <input
                      type="text"
                      placeholder="Nama bahan (misal: Bawang Merah)"
                      value={ing.name}
                      onChange={e => handleIngredientChange(idx, 'name', e.target.value)}
                      className="flex-2 h-9 px-2.5 bg-white border border-border-subtle rounded-md text-xs focus:outline-hidden text-text-primary"
                    />
                    <input
                      type="number"
                      placeholder="Porsi"
                      value={ing.amount || ''}
                      onChange={e => handleIngredientChange(idx, 'amount', e.target.value)}
                      className="flex-1 h-9 px-2 bg-white border border-border-subtle rounded-md text-xs focus:outline-hidden text-text-primary"
                    />
                    <input
                      type="text"
                      placeholder="Satuan (g, butir)"
                      value={ing.unit}
                      onChange={e => handleIngredientChange(idx, 'unit', e.target.value)}
                      className="flex-1 h-9 px-2 bg-white border border-border-subtle rounded-md text-xs focus:outline-hidden text-text-primary"
                    />
                    <input
                      type="number"
                      placeholder="Harga Satuan"
                      value={ing.price_per_unit || ''}
                      onChange={e => handleIngredientChange(idx, 'price_per_unit', e.target.value)}
                      className="flex-1.5 h-9 px-2 bg-white border border-border-subtle rounded-md text-xs focus:outline-hidden text-text-primary"
                    />
                    {ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(idx)}
                        className="p-1.5 text-text-secondary hover:text-danger cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Steps Section */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center border-b border-border-subtle/50 pb-2">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Langkah Memasak</h4>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="text-[11px] font-bold text-primary hover:text-primary-dark flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Langkah
                </button>
              </div>

              <div className="space-y-2">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex gap-2 items-start bg-surface-alt/45 p-2 rounded-lg border border-border-subtle/50">
                    <span className="w-6 h-6 bg-primary-light text-primary rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-1.5">
                      {idx + 1}
                    </span>
                    <textarea
                      placeholder={`Jelaskan langkah ke-${idx + 1}...`}
                      value={step}
                      onChange={e => handleStepChange(idx, e.target.value)}
                      className="flex-1 min-h-[40px] bg-white border border-border-subtle rounded-md p-2 text-xs focus:outline-hidden text-text-primary"
                    />
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        className="p-1.5 text-text-secondary hover:text-danger cursor-pointer mt-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Button */}
            <div className="flex gap-3 pt-4 border-t border-border-subtle/50 justify-end">
              <Button
                type="button"
                onClick={resetForm}
                className="h-10 text-xs bg-surface-alt hover:bg-border-subtle/50 text-text-secondary rounded-lg w-auto px-6"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="h-10 text-xs bg-primary hover:bg-primary-dark text-white rounded-lg w-auto px-8 font-bold"
              >
                {saving ? 'Menyimpan...' : editingId ? 'Simpan Resep' : 'Buat Resep Starter'}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        /* List View */
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Daftar Resep Starter ({recipes.length})</h2>

          {recipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map((recipe) => (
                <Card 
                  key={recipe.id}
                  className="p-0 bg-white border-border-subtle shadow-sm flex flex-col justify-between overflow-hidden relative"
                >
                  {/* Photo area */}
                  <div className="h-32 bg-surface-alt relative">
                    {recipe.recipe_photos?.[0]?.url ? (
                      <img 
                        src={recipe.recipe_photos[0].url} 
                        className="w-full h-full object-cover" 
                        alt={recipe.name} 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-disabled">
                        <BookOpen className="w-12 h-12 stroke-[1.5]" />
                      </div>
                    )}
                    {recipe.categories && (
                      <span 
                        className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold text-white shadow-xs"
                        style={{ backgroundColor: recipe.categories.color }}
                      >
                        {recipe.categories.name}
                      </span>
                    )}
                  </div>

                  {/* Details Area */}
                  <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-text-primary line-clamp-1">{recipe.name}</h4>
                      <p className="text-[10px] text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                        {recipe.description || 'Tidak ada deskripsi.'}
                      </p>
                      
                      <div className="flex gap-3 text-[9px] font-bold text-text-secondary mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-text-disabled" />
                          {recipe.estimated_time_minutes || 0} mnt
                        </span>
                        <span className="flex items-center gap-1">
                          <Utensils className="w-3 h-3 text-text-disabled" />
                          {recipe.servings || 1} porsi
                        </span>
                        <span>
                          • {recipe.recipe_ingredients?.length || 0} bahan
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 border-t border-border-subtle/50 pt-2.5 mt-2">
                      <button
                        onClick={() => handleEditInit(recipe)}
                        className="p-1.5 rounded-md hover:bg-primary-light/30 text-text-secondary hover:text-primary cursor-pointer transition-colors"
                        title="Edit Resep"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(recipe.id)}
                        className="p-1.5 rounded-md hover:bg-red-50 text-text-secondary hover:text-danger cursor-pointer transition-colors"
                        title="Hapus Resep"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-border-subtle bg-white rounded-xl py-12 px-4 text-center">
              <ShieldAlert className="w-8 h-8 text-text-disabled mx-auto mb-2" />
              <p className="text-xs text-text-secondary font-semibold">Belum ada resep starter.</p>
              <p className="text-[10px] text-text-disabled mt-1">Klik tombol "Tambah Resep" di kanan atas untuk membuat menu master default.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
