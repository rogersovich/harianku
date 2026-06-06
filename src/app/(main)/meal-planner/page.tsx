'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, Button, Input, Chip } from '@/components/ui/CustomComponents'
import { Drawer } from '@/components/ui/Drawer'
import { 
  getWeekStartAndEnd, 
  getDayOfWeekWIB, 
  getWIBDateString,
  formatIndonesianDate 
} from '@/lib/utils/date'
import { 
  ChevronLeft, ChevronRight, Plus, Trash2, 
  Sparkles, Calendar, BookOpen, Share2, 
  Copy, RefreshCw, X, Download, Info, Clock
} from 'lucide-react'
import { toast } from 'sonner'
import * as htmlToImage from 'html-to-image'

interface Recipe {
  id: string
  name: string
  estimated_time_minutes: number
  category_id?: string
  categories?: {
    name: string
    color: string
  }
}

interface MealSlot {
  id: string
  day_of_week: number
  slot: 'sarapan' | 'makan_siang' | 'makan_malam' | 'camilan'
  is_cooked: boolean
  recipes: Recipe
}

export default function MealPlannerPage() {
  const [currentWeekDate, setCurrentWeekDate] = useState<Date>(new Date())
  const [mealPlanId, setMealPlanId] = useState<string | null>(null)
  const [slots, setSlots] = useState<MealSlot[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [searchRecipeQuery, setSearchRecipeQuery] = useState('')
  const [selectedCatFilter, setSelectedCatFilter] = useState('semua')

  // Drawer states
  const [isSlotDrawerOpen, setIsSlotDrawerOpen] = useState(false)
  const [activeSlotTarget, setActiveSlotTarget] = useState<{ day: number; slot: string } | null>(null)
  
  // Template States
  const [isTemplateDrawerOpen, setIsTemplateDrawerOpen] = useState(false)
  const [templates, setTemplates] = useState<any[]>([])
  const [newTemplateName, setNewTemplateName] = useState('')
  
  // Share States
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [shareFormat, setShareFormat] = useState<'feed' | 'story'>('story')
  const shareAreaRef = useRef<HTMLDivElement>(null)
  const downloadAreaRef = useRef<HTMLDivElement>(null)

  const [loading, setLoading] = useState(true)
  const [recipeLoading, setRecipeLoading] = useState(true)

  const { start: mondayStr, end: sundayStr, mondayObject } = getWeekStartAndEnd(currentWeekDate)

  const fetchWeekPlan = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/meal-plan?week=${mondayStr}`)
      const json = await res.json()
      if (res.ok && json.mealPlan) {
        setMealPlanId(json.mealPlan.id)
        setSlots(json.slots)
      }
    } catch (err) {
      toast.error('Gagal memuat meal plan')
    } finally {
      setLoading(false)
    }
  }

  const fetchRecipes = async () => {
    setRecipeLoading(true)
    try {
      const res = await fetch('/api/resep')
      const data = await res.json()
      if (res.ok) {
        setRecipes(data)
        setFilteredRecipes(data)
      }
      const catRes = await fetch('/api/kategori')
      const catData = await catRes.json()
      if (catRes.ok) {
        setCategories(catData)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setRecipeLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/meal-plan/template')
      const data = await res.json()
      if (res.ok) {
        setTemplates(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchWeekPlan()
  }, [mondayStr])

  useEffect(() => {
    fetchRecipes()
    fetchTemplates()
  }, [])

  // Filter recipes in drawer search
  useEffect(() => {
    let result = [...recipes]
    if (searchRecipeQuery.trim() !== '') {
      result = result.filter(r => r.name.toLowerCase().includes(searchRecipeQuery.toLowerCase()))
    }
    if (selectedCatFilter !== 'semua') {
      result = result.filter(r => r.category_id === selectedCatFilter)
    }
    setFilteredRecipes(result)
  }, [searchRecipeQuery, selectedCatFilter, recipes])

  const handleNextWeek = () => {
    const next = new Date(mondayObject)
    next.setDate(mondayObject.getDate() + 7)
    setCurrentWeekDate(next)
  }

  const handlePrevWeek = () => {
    const prev = new Date(mondayObject)
    prev.setDate(mondayObject.getDate() - 7)
    setCurrentWeekDate(prev)
  }

  const handleOpenSlotAssign = (day: number, slot: string) => {
    setActiveSlotTarget({ day, slot })
    setIsSlotDrawerOpen(true)
  }

  const handleAssignRecipe = async (recipeId: string) => {
    if (!activeSlotTarget || !mealPlanId) return

    try {
      const res = await fetch('/api/meal-plan/slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meal_plan_id: mealPlanId,
          day_of_week: activeSlotTarget.day,
          slot: activeSlotTarget.slot,
          recipe_id: recipeId
        })
      })
      const json = await res.json()
      if (res.ok) {
        toast.success('Resep ditambahkan ke jadwal! 📆')
        setIsSlotDrawerOpen(false)
        fetchWeekPlan()
      } else {
        toast.error(json.error || 'Gagal menambahkan resep')
      }
    } catch (err) {
      toast.error('Masalah jaringan')
    }
  }

  const handleDeleteSlot = async (slotId: string) => {
    try {
      const res = await fetch(`/api/meal-plan/slot/${slotId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        toast.success('Menu dihapus dari slot 🗑️')
        fetchWeekPlan()
      } else {
        toast.error('Gagal menghapus menu')
      }
    } catch (err) {
      toast.error('Masalah jaringan')
    }
  }

  const handleSaveAsTemplate = async () => {
    if (!newTemplateName.trim()) {
      toast.warning('Nama template harus diisi!')
      return
    }
    try {
      const res = await fetch('/api/meal-plan/template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTemplateName,
          meal_plan_id: mealPlanId
        })
      })
      if (res.ok) {
        toast.success('Template berhasil disimpan! 💾')
        setNewTemplateName('')
        fetchTemplates()
      } else {
        const json = await res.json()
        toast.error(json.error || 'Gagal menyimpan template')
      }
    } catch (err) {
      toast.error('Masalah koneksi')
    }
  }

  const handleApplyTemplate = async (templateId: string) => {
    // If target week has data, prompt user (for MVP we just run and warn they can overwrite)
    try {
      const res = await fetch(`/api/meal-plan/template/${templateId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week_start: mondayStr })
      })
      if (res.ok) {
        toast.success('Template berhasil diterapkan ke minggu ini!')
        setIsTemplateDrawerOpen(false)
        fetchWeekPlan()
      } else {
        const json = await res.json()
        toast.error(json.error || 'Gagal menerapkan template')
      }
    } catch (err) {
      toast.error('Masalah koneksi')
    }
  }

  const handleDownloadShare = async () => {
    if (!downloadAreaRef.current) return
    try {
      const width = 320
      const height = downloadAreaRef.current.offsetHeight || (shareFormat === 'story' ? 640 : 360)

      const dataUrl = await htmlToImage.toPng(downloadAreaRef.current, {
        quality: 1,
        pixelRatio: 3, // Meningkatkan resolusi gambar hasil ekspor menjadi 3x (960px lebar) agar tidak pecah/blur
        backgroundColor: '#FFF8FB',
        width: width,
        height: height,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          transform: 'scale(1)',
          transformOrigin: 'top left',
          margin: '0',
          padding: '16px'
        }
      })
      
      const link = document.createElement('a')
      link.download = `HarianKu-Plan-${mondayStr}.png`
      link.href = dataUrl
      link.click()
      toast.success('Gambar plan mingguan diunduh! 📸')
    } catch (err) {
      toast.error('Gagal menghasilkan gambar')
    }
  }

  const slotLabels = {
    sarapan: '🥞 Sarapan',
    makan_siang: '☀️ Siang',
    makan_malam: '🌙 Malam',
    camilan: '🍰 Camilan'
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

  return (
    <div className="flex-1 flex flex-col p-5 space-y-4 bg-bg-warm min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-text-primary"><span className="mr-1">🍽️</span> Meal Planner</h1>
          <p className="text-xs text-text-secondary">Rencanakan nutrisi mingguanmu</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsTemplateDrawerOpen(true)}
            className="w-9 h-9 bg-white border border-border-subtle rounded-full flex items-center justify-center text-text-secondary hover:text-primary active:scale-95 transition-all cursor-pointer"
            title="Template Manager"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="w-9 h-9 bg-white border border-border-subtle rounded-full flex items-center justify-center text-text-secondary hover:text-primary active:scale-95 transition-all cursor-pointer"
            title="Share Plan"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Week Navigation */}
      <section className="flex items-center justify-between bg-white border border-border-subtle rounded-full p-1 shadow-pink-subtle">
        <button
          onClick={handlePrevWeek}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-alt active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 text-text-secondary" />
        </button>
        <span className="text-xs font-bold text-text-primary">
          {formatIndonesianDate(mondayStr).split(',')[1]} - {formatIndonesianDate(sundayStr).split(',')[1]}
        </span>
        <button
          onClick={handleNextWeek}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-alt active:scale-95 transition-all cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 text-text-secondary" />
        </button>
      </section>

      {/* Days List */}
      {loading ? (
        <div className="flex-1 flex justify-center items-center py-20">
          <RefreshCw className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : (
        <section className="space-y-4">
          {daysOfWeek.map((day) => {
            // Get slots for this day
            const daySlots = slots.filter(s => s.day_of_week === day.num)
            
            // Generate daily date
            const dayDate = new Date(mondayObject)
            dayDate.setDate(mondayObject.getDate() + (day.num - 1))
            const dayDateStr = getWIBDateString(dayDate)

            return (
              <Card key={day.num} className="space-y-2.5">
                <div className="flex justify-between items-center border-b border-dashed border-border-subtle pb-1.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-extrabold text-text-primary">{day.name}</span>
                    <span className="text-[10px] text-text-secondary font-medium">
                      {dayDate.getDate()} {dayDate.toLocaleDateString('id-ID', { month: 'short' })}
                    </span>
                  </div>
                </div>

                {/* Slots Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(slotLabels) as Array<keyof typeof slotLabels>).map((slotKey) => {
                    const slotData = daySlots.find(s => s.slot === slotKey)
                    const label = slotLabels[slotKey]

                    return (
                      <div
                        key={slotKey}
                        className={`p-2.5 rounded-xl border flex flex-col justify-between min-h-[72px] transition-colors relative ${
                          slotData
                            ? 'bg-white border-border-subtle'
                            : 'bg-surface-alt border-dashed border-border-subtle hover:border-primary/40'
                        }`}
                      >
                        <div>
                          <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider block">
                            {label}
                          </span>
                          {slotData ? (
                            <span className="text-xs font-bold text-text-primary mt-1 line-clamp-1">
                              {slotData.recipes.name}
                            </span>
                          ) : (
                            <span className="text-[10px] text-text-disabled italic block mt-1">Kosong</span>
                          )}
                        </div>

                        <div className="flex justify-between items-center mt-2.5">
                          {slotData ? (
                            <>
                              <span className="text-[11px] text-text-secondary flex items-center gap-1">
                                <Clock className="w-3 h-3 text-text-disabled" /> {slotData.recipes.estimated_time_minutes}m
                              </span>
                              <button
                                onClick={() => handleDeleteSlot(slotData.id)}
                                className="text-red-400 hover:text-red-600 p-0.5 rounded-lg active:scale-95 transition-all cursor-pointer"
                                title="Hapus menu"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleOpenSlotAssign(day.num, slotKey)}
                              className="text-[9px] font-bold text-primary flex items-center gap-0.5 mt-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> Tambah Menu
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )
          })}
        </section>
      )}

      {/* Drawer: Slot Recipe Picker */}
      <Drawer
        isOpen={isSlotDrawerOpen}
        onClose={() => setIsSlotDrawerOpen(false)}
        title={`Pilih Menu ${activeSlotTarget ? slotLabels[activeSlotTarget.slot as keyof typeof slotLabels] : ''}`}
      >
        <div className="space-y-4 max-h-[70vh] flex flex-col pr-1">
          {/* Search bar inside drawer */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari resep..."
              value={searchRecipeQuery}
              onChange={e => setSearchRecipeQuery(e.target.value)}
              className="w-full h-10 px-3 bg-surface-alt border border-border-subtle rounded-xl text-xs focus:outline-hidden"
            />
          </div>

          {/* Categories select in drawer */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <Chip
              label="Semua"
              active={selectedCatFilter === 'semua'}
              onClick={() => setSelectedCatFilter('semua')}
            />
            {categories.map((c) => (
              <Chip
                key={c.id}
                label={c.name}
                active={selectedCatFilter === c.id}
                onClick={() => setSelectedCatFilter(c.id)}
              />
            ))}
          </div>

          {/* Recipes List in Drawer */}
          {recipeLoading ? (
            <div className="flex justify-center py-6">
              <RefreshCw className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : filteredRecipes.length > 0 ? (
            <div className="space-y-2 overflow-y-auto max-h-[45vh] pr-1">
              {filteredRecipes.map((recipe) => (
                <button
                  key={recipe.id}
                  onClick={() => handleAssignRecipe(recipe.id)}
                  className="w-full p-3 bg-white border border-border-subtle rounded-xl flex items-center justify-between text-left hover:border-primary/50 active:scale-99 transition-all cursor-pointer"
                >
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">{recipe.name}</h4>
                    <span className="text-[9px] text-text-secondary flex items-center gap-1 mt-0.5">
                      ⏱ {recipe.estimated_time_minutes}m
                      {recipe.categories && (
                        <span 
                          className="px-1 py-0.2 rounded-full text-[8px] font-bold text-white"
                          style={{ backgroundColor: recipe.categories.color }}
                        >
                          {recipe.categories.name}
                        </span>
                      )}
                    </span>
                  </div>
                  <Plus className="w-4 h-4 text-primary shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-xs text-text-disabled">Resep tidak ditemukan. Tambahkan resep baru terlebih dahulu.</p>
            </div>
          )}
        </div>
      </Drawer>

      {/* Drawer: Template Manager */}
      <Drawer
        isOpen={isTemplateDrawerOpen}
        onClose={() => setIsTemplateDrawerOpen(false)}
        title="Template Meal Plan"
      >
        <div className="space-y-6 pb-4">
          <p className="text-[11px] text-text-secondary leading-relaxed pt-1">
            Simpan susunan menu minggu ini sebagai template untuk digunakan kembali kapan saja, atau terapkan template yang sudah ada ke jadwal minggu ini.
          </p>

          {/* Create template form */}
          <div className="space-y-2.5">
            <h3 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
              Simpan Jadwal Minggu Ini
            </h3>
            <div className="flex gap-2 items-center bg-surface-alt border border-border-subtle rounded-xl p-1.5 focus-within:border-primary focus-within:bg-white transition-all">
              <input
                type="text"
                placeholder="Nama template (misal: Bulking Akhir Bulan)"
                value={newTemplateName}
                onChange={e => setNewTemplateName(e.target.value)}
                className="flex-1 bg-transparent px-3 py-1.5 text-xs text-text-primary placeholder:text-text-disabled focus:outline-hidden"
              />
              <Button
                variant="primary"
                onClick={handleSaveAsTemplate}
                className="!h-8 !w-auto text-xs px-4 rounded-lg font-bold shrink-0"
              >
                Simpan
              </Button>
            </div>
          </div>

          {/* Templates list */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
              Template Tersimpan
            </h3>
            {templates.length > 0 ? (
              <div className="space-y-2.5 max-h-[35vh] overflow-y-auto pr-1">
                {templates.map((temp) => (
                  <div 
                    key={temp.id} 
                    className="p-3 bg-white border border-border-subtle rounded-xl flex justify-between items-center gap-3 hover:border-primary/30 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-text-primary truncate">{temp.name}</h4>
                        <span className="text-[10px] text-text-secondary block mt-0.5">
                          {temp.slots ? temp.slots.length : 0} menu tersimpan
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => handleApplyTemplate(temp.id)}
                      className="!h-8 text-xs !w-auto px-3.5 rounded-lg font-bold shrink-0"
                    >
                      Terapkan
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-border-subtle rounded-xl py-6 px-4 text-center">
                <p className="text-xs text-text-disabled italic">Belum ada template tersimpan.</p>
              </div>
            )}
          </div>
        </div>
      </Drawer>

      {/* Share Plan Image Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/55 z-50 flex flex-col justify-center items-center p-6">
          <div className="w-full max-w-[500px] bg-white rounded-[20px] p-5 space-y-4 relative flex flex-col max-h-[85vh] overflow-hidden">
            <button 
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-text-primary text-center">Bagikan Rencana Masak 📸</h3>

            {/* Format selector */}
            <div className="flex gap-2">
              <button
                onClick={() => setShareFormat('story')}
                className={`flex-1 h-9 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  shareFormat === 'story'
                    ? 'bg-primary-light text-primary border-primary'
                    : 'bg-white text-text-secondary border-border-subtle'
                }`}
              >
                9:16 Story
              </button>
              <button
                onClick={() => setShareFormat('feed')}
                className={`flex-1 h-9 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  shareFormat === 'feed'
                    ? 'bg-primary-light text-primary border-primary'
                    : 'bg-white text-text-secondary border-border-subtle'
                }`}
              >
                1:1 Feed
              </button>
            </div>

            {/* Generated Image Preview Area */}
            <div className="flex-1 overflow-auto border border-border-subtle rounded-xl p-4 bg-surface-alt flex justify-start md:justify-center">
              <div
                ref={shareAreaRef}
                className={`bg-bg-warm p-4 flex flex-col justify-between text-text-primary select-none w-[320px] shrink-0 mx-auto ${
                  shareFormat === 'story' ? 'min-h-[640px]' : 'min-h-[360px]'
                }`}
              >
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <span className="text-3xl">🍳</span>
                    <h4 className="text-sm font-extrabold tracking-tight">HarianKu Menu</h4>
                    <p className="text-[9px] text-text-secondary">
                      Rencana Masak Mingguan ({mondayStr})
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {daysOfWeek.slice(0, shareFormat === 'story' ? 7 : 4).map((d) => {
                      const dayMeals = slots.filter(s => s.day_of_week === d.num)
                      return (
                        <div key={d.num} className="bg-white/70 p-2.5 rounded-lg border border-border-subtle/50 text-[10px] space-y-1">
                          <span className="font-extrabold text-[10px] text-primary">{d.name}</span>
                          <div className="divide-y divide-border-subtle/30">
                            {dayMeals.length > 0 ? (
                              dayMeals.map(m => (
                                <div key={m.id} className="py-1 flex justify-between items-center font-semibold gap-2 min-w-0">
                                  <span className="shrink-0 text-text-secondary">{slotLabels[m.slot].split(' ')[1]}</span>
                                  <span className="text-text-primary text-right truncate flex-1">{m.recipes.name}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-[9px] italic text-text-disabled py-1">Belum diisi</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="text-center pt-2 text-[8px] text-text-secondary/70 font-bold border-t border-dashed border-border-subtle/70">
                  Dibuat dengan HarianKu App 🍳
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={handleDownloadShare}
                className="h-10 text-xs flex-1 flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Unduh PNG
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Off-screen export container to prevent html-to-image clipping */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '320px', overflow: 'hidden' }}>
        <div
          ref={downloadAreaRef}
          className={`bg-bg-warm p-4 flex flex-col justify-between text-text-primary select-none w-[320px] ${
            shareFormat === 'story' ? 'min-h-[640px]' : 'min-h-[360px]'
          }`}
          style={{ backgroundColor: '#FFF8FB' }}
        >
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <span className="text-3xl">🍳</span>
              <h4 className="text-sm font-extrabold tracking-tight">HarianKu Menu</h4>
              <p className="text-[9px] text-text-secondary">
                Rencana Masak Mingguan ({mondayStr})
              </p>
            </div>

            <div className="space-y-2.5">
              {daysOfWeek.slice(0, shareFormat === 'story' ? 7 : 4).map((d) => {
                const dayMeals = slots.filter(s => s.day_of_week === d.num)
                return (
                  <div key={d.num} className="bg-white/70 p-2.5 rounded-lg border border-border-subtle/50 text-[10px] space-y-1">
                    <span className="font-extrabold text-[10px] text-primary">{d.name}</span>
                    <div className="divide-y divide-border-subtle/30">
                      {dayMeals.length > 0 ? (
                        dayMeals.map(m => (
                          <div key={m.id} className="py-1 flex justify-between items-center font-semibold gap-2 min-w-0">
                            <span className="shrink-0 text-text-secondary">{slotLabels[m.slot].split(' ')[1]}</span>
                            <span className="text-text-primary text-right truncate flex-1">{m.recipes.name}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[9px] italic text-text-disabled py-1">Belum diisi</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="text-center pt-2 text-[8px] text-text-secondary/70 font-bold border-t border-dashed border-border-subtle/70">
            Dibuat dengan HarianKu App 🍳
          </div>
        </div>
      </div>
    </div>
  )
}
