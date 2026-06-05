'use client'

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Button, Input } from '@/components/ui/CustomComponents'
import { ArrowLeft, Plus, Trash2, Check, X, Camera } from 'lucide-react'
import { toast } from 'sonner'

interface IngredientInput {
  name: string
  amount: string
  unit: string
  price_per_unit?: string
  from_stock_id?: string
  stock_current_amount?: number
}

export default function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id: recipeId } = use(params)

  const [step, setStep] = useState(1)
  const [categories, setCategories] = useState<any[]>([])
  const [loadingCats, setLoadingCats] = useState(true)
  const [loadingRecipe, setLoadingRecipe] = useState(true)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [estTime, setEstTime] = useState('30')
  const [servings, setServings] = useState('2')
  const [photoUrl, setPhotoUrl] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  
  // Ingredients State
  const [ingredients, setIngredients] = useState<IngredientInput[]>([
    { name: '', amount: '', unit: 'g' }
  ])

  // Steps State
  const [steps, setSteps] = useState<string[]>([''])
  const [stockItems, setStockItems] = useState<any[]>([])

  const [saving, setSaving] = useState(false)

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch('/api/kategori')
        if (res.ok) {
          const data = await res.json()
          setCategories(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingCats(false)
      }
    }

    const loadData = async () => {
      let currentStocks: any[] = []
      try {
        const res = await fetch('/api/stok')
        if (res.ok) {
          const data = await res.json()
          setStockItems(data)
          currentStocks = data
        }
      } catch (err) {
        console.error(err)
      }

      try {
        const res = await fetch(`/api/resep/${recipeId}`)
        if (res.ok) {
          const data = await res.json()
          setName(data.name || '')
          setDescription(data.description || '')
          setCategoryId(data.category_id || '')
          setTagsInput(data.tags ? data.tags.join(', ') : '')
          setEstTime(data.estimated_time_minutes?.toString() || '30')
          setServings(data.servings?.toString() || '2')
          const referencePhoto = data.recipe_photos?.find((p: any) => p.type === 'reference')
          setPhotoUrl(referencePhoto?.url || '')
          
          if (data.recipe_ingredients && data.recipe_ingredients.length > 0) {
            setIngredients(data.recipe_ingredients.map((ing: any) => {
              const matchingStock = currentStocks.find(
                s => s.name.toLowerCase().trim() === ing.name.toLowerCase().trim()
              )
              return {
                name: ing.name || '',
                amount: ing.amount?.toString() || '',
                unit: ing.unit || 'g',
                price_per_unit: ing.price_per_unit?.toString() || '',
                from_stock_id: matchingStock?.id || undefined,
                stock_current_amount: matchingStock?.amount !== undefined ? matchingStock.amount : undefined
              }
            }))
          }

          if (data.steps && data.steps.length > 0) {
            setSteps(data.steps)
          }
        } else {
          toast.error('Resep tidak ditemukan')
          router.push('/resep')
        }
      } catch (err) {
        toast.error('Gagal memuat detail resep')
      } finally {
        setLoadingRecipe(false)
      }
    }

    fetchCats()
    loadData()
  }, [recipeId, router])

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '', unit: 'g' }])
  }

  const handleRemoveIngredient = (idx: number) => {
    const updated = ingredients.filter((_, i) => i !== idx)
    setIngredients(updated)
  }

  const handleIngredientChange = (idx: number, field: keyof IngredientInput, value: string) => {
    const updated = [...ingredients]
    updated[idx] = { ...updated[idx], [field]: value }
    setIngredients(updated)
  }

  const handleAddStep = () => {
    setSteps([...steps, ''])
  }

  const handleRemoveStep = (idx: number) => {
    const updated = steps.filter((_, i) => i !== idx)
    setSteps(updated)
  }

  const handleStepChange = (idx: number, value: string) => {
    const updated = [...steps]
    updated[idx] = value
    setSteps(updated)
  }

  const handleSaveRecipe = async () => {
    if (!name.trim()) {
      toast.warning('Nama resep wajib diisi!')
      setStep(1)
      return
    }

    if (steps.length === 0 || steps.every(s => !s.trim())) {
      toast.warning('Harap tambahkan minimal 1 langkah memasak!')
      return
    }
    const hasEmptyStep = steps.some(s => !s.trim())
    if (hasEmptyStep) {
      toast.warning('Harap isi semua kolom langkah memasak!')
      return
    }

    const validIngredients = ingredients.filter(ing => ing.name.trim() !== '' && ing.amount !== '')
    const validSteps = steps.filter(s => s.trim() !== '')

    setSaving(true)
    try {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t !== '')
      
      const res = await fetch(`/api/resep/${recipeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          category_id: categoryId || null,
          tags,
          estimated_time_minutes: estTime ? Number(estTime) : null,
          servings: servings ? Number(servings) : 1,
          ingredients: validIngredients,
          steps: validSteps,
          photo_url: photoUrl
        })
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Resep berhasil diperbarui! 🍳')
        router.push(`/resep/${recipeId}`)
        router.refresh()
      } else {
        toast.error(data.error || 'Gagal memperbarui resep')
      }
    } catch (err) {
      toast.error('Masalah koneksi ke server')
    } finally {
      setSaving(false)
    }
  }

  const unitsList = [
    'g', 'kg', 'ons', 'ml', 'l', 'sdm', 'sdt', 'gelas', 'butir', 
    'biji', 'buah', 'potong', 'lembar', 'bungkus', 'kaleng', 
    'botol', 'sachet', 'secukupnya'
  ]

  if (loadingRecipe) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center min-h-[80vh] gap-3 bg-bg-warm">
        <p className="text-xs font-semibold text-text-secondary animate-pulse">Memuat form edit resep...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col p-5 space-y-4 bg-bg-warm min-h-screen">
      {/* Top Navigation */}
      <header className="flex items-center gap-3">
        <button
          onClick={() => {
            if (step > 1) setStep(step - 1)
            else router.push(`/resep/${recipeId}`)
          }}
          className="w-10 h-10 bg-white rounded-full border border-border-subtle flex items-center justify-center cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Edit Resep</h1>
          <p className="text-xs text-text-secondary">Langkah {step} dari 3</p>
        </div>
      </header>

      {/* Progressive Form Screens */}
      <main className="flex-1">
        {step === 1 && (
          <Card className="space-y-4">
            <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              1. Informasi Dasar
            </h2>

            <Input
              id="name"
              label="Nama Resep *"
              placeholder="Misal: Ayam Goreng Mentega"
              value={name}
              onChange={e => setName(e.target.value)}
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="description" className="text-xs font-semibold text-text-secondary">Deskripsi Resep</label>
              <textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Deskripsi singkat atau cerita tentang masakan ini..."
                className="w-full h-[80px] bg-surface-alt border border-border-subtle rounded-lg p-2.5 text-xs text-text-primary focus:outline-hidden focus:border-primary transition-colors resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary">Foto Utama Resep *</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                  disabled={uploadingPhoto}
                />
                <label
                  htmlFor="photo-upload"
                  className="w-16 h-16 bg-surface-alt border border-dashed border-border-subtle rounded-xl flex flex-col items-center justify-center cursor-pointer text-text-secondary hover:bg-primary-light/10 transition-colors"
                >
                  <Camera className="w-5 h-5 text-text-secondary" />
                  <span className="text-[9px] font-bold mt-1">Upload</span>
                </label>
                {photoUrl && (
                  <div className="relative w-16 h-16 rounded-xl border border-border-subtle overflow-hidden">
                    <img src={photoUrl} className="w-full h-full object-cover" alt="Preview resep" />
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

            <div className="grid grid-cols-2 gap-3">
              <Input
                id="estTime"
                type="number"
                label="Waktu Masak (menit)"
                value={estTime}
                onChange={e => setEstTime(e.target.value)}
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
              <label htmlFor="category" className="text-xs font-semibold text-text-secondary">Kategori</label>
              {loadingCats ? (
                <span className="text-xs text-text-secondary">Memuat Kategori...</span>
              ) : (
                <select
                  id="category"
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full h-[48px] bg-surface-alt border border-border-subtle rounded-lg px-4 text-xs text-text-primary focus:outline-hidden focus:border-primary cursor-pointer"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <Input
              id="tags"
              label="Tag (pisahkan dengan koma)"
              placeholder="Misal: cepat, sehat, murah, gurih"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
            />

            <Button
              onClick={() => {
                if (!name.trim()) {
                  toast.warning('Nama resep wajib diisi!')
                  return
                }
                if (!estTime || Number(estTime) <= 0) {
                  toast.warning('Waktu masak harus berupa angka positif!')
                  return
                }
                if (!servings || Number(servings) <= 0) {
                  toast.warning('Jumlah porsi harus berupa angka positif!')
                  return
                }
                if (!photoUrl) {
                  toast.warning('Foto utama resep wajib diunggah!')
                  return
                }
                setStep(2)
              }}
              variant="primary"
              className="mt-2"
            >
              Lanjut ke Bahan-Bahan
            </Button>
          </Card>
        )}
        {step === 2 && (
          <Card className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                2. Bahan-Bahan
              </h2>
            </div>

            {/* Quick stock select component */}
            <div className="space-y-1.5 p-3 bg-surface-alt rounded-xl border border-border-subtle">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                Pilih dari Stok Dapur (Isi Cepat) *
              </span>
              {stockItems.length > 0 ? (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {stockItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        const newIng: IngredientInput = {
                          name: item.name,
                          amount: '',
                          unit: item.unit,
                          price_per_unit: item.price_per_unit ? String(item.price_per_unit) : '',
                          from_stock_id: item.id,
                          stock_current_amount: item.amount
                        }
                        
                        const emptyIdx = ingredients.findIndex(i => !i.name.trim() && !i.from_stock_id)
                        if (emptyIdx !== -1) {
                          const updated = [...ingredients]
                          updated[emptyIdx] = newIng
                          setIngredients(updated)
                        } else {
                          setIngredients([...ingredients, newIng])
                        }
                        toast.success(`${item.name} ditambahkan dari stok!`)
                      }}
                      className="h-[28px] px-2.5 rounded-lg bg-white border border-border-subtle text-[10px] font-bold text-primary hover:bg-primary-light transition-all shrink-0 cursor-pointer"
                    >
                      {item.name} ({item.unit})
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[9px] text-text-secondary leading-normal italic">
                  Kamu belum menambahkan bahan di Stok. Tambahkan stok di Dapur untuk pengisian cepat!
                </p>
              )}
            </div>

            {ingredients.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-border-subtle rounded-2xl bg-surface-alt/55">
                <span className="text-2xl">🥣</span>
                <p className="text-xs text-text-secondary mt-1 font-bold">Belum ada bahan ditambahkan</p>
                <p className="text-[10px] text-text-disabled leading-normal px-4">
                  Pilih bahan dari Stok Dapur di atas untuk pengisian cepat, atau klik + Tambah Bahan di bawah untuk menulis manual.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {ingredients.map((ing, idx) => {
                  if (ing.from_stock_id) {
                    return (
                      <div key={idx} className="bg-white border border-border-subtle p-3 rounded-2xl space-y-2 shadow-pink-subtle relative flex flex-col">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-extrabold text-primary flex items-center gap-1.5 bg-primary-light/45 px-2.5 py-1 rounded-lg">
                            📦 {ing.name}
                          </span>
                          {ing.price_per_unit ? (
                            <span className="text-[10px] bg-secondary-light/45 text-secondary px-2.5 py-1 rounded-full font-bold">
                              Rp {Number(ing.price_per_unit).toLocaleString('id-ID')} / {ing.unit}
                            </span>
                          ) : (
                            <span className="text-[10px] bg-surface-alt text-text-secondary px-2.5 py-1 rounded-full font-semibold">
                              Tanpa harga
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between gap-3 mt-1 pt-1.5 border-t border-dashed border-border-subtle/50">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-text-secondary">Porsi pakai:</span>
                            <input
                              type="number"
                              placeholder="0"
                              value={ing.amount}
                              onChange={e => handleIngredientChange(idx, 'amount', e.target.value)}
                              className="w-16 h-8 px-2 text-xs bg-surface-alt rounded-lg border border-border-subtle focus:outline-hidden text-center font-bold text-primary"
                            />
                            <span className="text-xs font-bold text-text-primary">{ing.unit}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {ing.stock_current_amount !== undefined && (
                              <span className="text-[10px] text-text-secondary bg-surface-alt px-2 py-1 rounded-lg font-medium">
                                Sisa stok: <strong className="text-primary">{ing.stock_current_amount}</strong> {ing.unit}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveIngredient(idx)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                              title="Hapus bahan"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div key={idx} className="flex gap-2 items-center bg-surface-alt p-2 rounded-xl border border-border-subtle">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          placeholder="Nama Bahan (misal: Bawang)"
                          value={ing.name}
                          onChange={e => handleIngredientChange(idx, 'name', e.target.value)}
                          className="w-full h-8 px-2 text-xs bg-white rounded border border-border-subtle focus:outline-hidden"
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Jml"
                            value={ing.amount}
                            onChange={e => handleIngredientChange(idx, 'amount', e.target.value)}
                            className="w-16 h-8 px-2 text-xs bg-white rounded border border-border-subtle focus:outline-hidden"
                          />
                          <select
                            value={ing.unit}
                            onChange={e => handleIngredientChange(idx, 'unit', e.target.value)}
                            className="flex-1 h-8 px-1 text-xs bg-white rounded border border-border-subtle focus:outline-hidden cursor-pointer"
                          >
                            {unitsList.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            placeholder="Harga (opsional)"
                            value={ing.price_per_unit || ''}
                            onChange={e => handleIngredientChange(idx, 'price_per_unit', e.target.value)}
                            className="w-24 h-8 px-2 text-xs bg-white rounded border border-border-subtle focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(idx)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer animate-fade-in"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            <button
              type="button"
              onClick={handleAddIngredient}
              className="w-full h-10 border border-dashed border-primary text-primary hover:bg-primary-light/10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tambah Bahan
            </button>

            <div className="flex gap-2 pt-2">
              <Button onClick={() => setStep(1)} variant="ghost" className="flex-1">
                Kembali
              </Button>
              <Button
                onClick={() => {
                  if (ingredients.length === 0) {
                    toast.warning('Tambahkan minimal 1 bahan makanan!')
                    return
                  }
                  const hasEmptyFields = ingredients.some(ing => !ing.name.trim() || !ing.amount.trim())
                  if (hasEmptyFields) {
                    toast.warning('Harap lengkapi nama dan jumlah bahan yang digunakan!')
                    return
                  }
                  setStep(3)
                }}
                variant="primary"
                className="flex-1"
                disabled={ingredients.length === 0}
              >
                Lanjut ke Langkah
              </Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="space-y-4">
            <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              3. Langkah Memasak
            </h2>

            <div className="space-y-3">
              {steps.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <span className="w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center text-xs font-bold mt-1 shrink-0">
                    {idx + 1}
                  </span>
                  <textarea
                    value={item}
                    onChange={e => handleStepChange(idx, e.target.value)}
                    placeholder="Tulis langkah pengerjaan di sini..."
                    className="flex-1 min-h-[56px] bg-surface-alt border border-border-subtle rounded-lg p-2 text-xs focus:outline-hidden resize-none"
                  />
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg mt-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddStep}
              className="w-full h-10 border border-dashed border-primary text-primary hover:bg-primary-light/10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tambah Langkah
            </button>

            <div className="flex gap-2 pt-2">
              <Button onClick={() => setStep(2)} variant="ghost" className="flex-1">
                Kembali
              </Button>
              <Button onClick={handleSaveRecipe} variant="primary" disabled={saving} className="flex-1">
                {saving ? 'Menyimpan...' : 'Simpan Resep 🍳'}
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
