'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, Button, Input } from '@/components/ui/CustomComponents'
import { 
  Plus, AlertTriangle, CheckCircle, Trash2, 
  ShoppingCart, RefreshCw, X, Edit2, BarChart2, Check,
  PiggyBank, Info, TrendingUp, Calendar, ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'

interface StockItem {
  id: string
  name: string
  amount: number
  unit: string
  price_per_unit: number | null
  threshold_amount: number
}

interface ShoppingRestockItem {
  id: string
  name: string
  current_amount: number
  threshold_amount: number
  unit: string
  required_amount: number
  price_per_unit: number
  estimated_cost: number
  checked?: boolean
}

interface WeeklyReport {
  total_expense: number
  average_per_day: number
  most_expensive_recipe: { name: string; cost: number }
  cheapest_recipe: { name: string; cost: number }
  daily_chart_data: { day: string; total: number }[]
}

interface MonthlyReport {
  total_expense: number
  weekly_breakdown: { week: string; total: number }[]
}

export default function StockPage() {
  const [activeTab, setActiveTab] = useState<'stok' | 'belanja' | 'laporan'>('stok')
  const [stock, setStock] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)
  
  // Create Modal states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [unit, setUnit] = useState('g')
  const [price, setPrice] = useState('')
  const [threshold, setThreshold] = useState('0')
  const [saving, setSaving] = useState(false)

  // Edit Modal states
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editItem, setEditItem] = useState<StockItem | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editThreshold, setEditThreshold] = useState('')
  const [editPrice, setEditPrice] = useState('')

  // Restock Tab states
  const [shoppingItems, setShoppingItems] = useState<ShoppingRestockItem[]>([])
  const [restocking, setRestocking] = useState(false)
  const [totalEstimatedCost, setTotalEstimatedCost] = useState(0)

  // Report Tab states
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null)
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null)
  const [loadingReport, setLoadingReport] = useState(false)

  const fetchStock = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stok')
      const data = await res.json()
      if (res.ok) {
        setStock(data)
      }
    } catch (err) {
      toast.error('Gagal memuat stok bahan')
    } finally {
      setLoading(false)
    }
  }

  const fetchShoppingList = async () => {
    try {
      const res = await fetch('/api/belanja')
      const data = await res.json()
      if (res.ok) {
        setShoppingItems((data.items || []).map((item: any) => ({ ...item, checked: true })))
        setTotalEstimatedCost(data.total_estimated_cost || 0)
      }
    } catch (err) {
      toast.error('Gagal memuat daftar belanja restock')
    }
  }

  const fetchReports = async () => {
    setLoadingReport(true)
    try {
      const [weekRes, monthRes] = await Promise.all([
        fetch('/api/laporan/weekly'),
        fetch('/api/laporan/monthly')
      ])
      const weekData = await weekRes.json()
      const monthData = await monthRes.json()

      if (weekRes.ok && monthRes.ok) {
        setWeeklyReport(weekData)
        setMonthlyReport(monthData)
      }
    } catch (err) {
      toast.error('Gagal memuat laporan pengeluaran')
    } finally {
      setLoadingReport(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'stok') {
      fetchStock()
    } else if (activeTab === 'belanja') {
      fetchShoppingList()
    } else if (activeTab === 'laporan') {
      fetchReports()
    }
  }, [activeTab])

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !amount || !unit) {
      toast.warning('Nama, jumlah, dan satuan wajib diisi!')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/stok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          amount: Number(amount),
          unit,
          price_per_unit: price ? Number(price) : null,
          threshold_amount: threshold ? Number(threshold) : 0
        })
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Bahan berhasil ditambahkan ke stok! 📦')
        setIsAddOpen(false)
        setName('')
        setAmount('')
        setPrice('')
        setThreshold('0')
        fetchStock()
      } else {
        toast.error(data.error || 'Gagal menyimpan')
      }
    } catch (err) {
      toast.error('Masalah koneksi')
    } finally {
      setSaving(false)
    }
  }

  const handleOpenEdit = (item: StockItem) => {
    setEditItem(item)
    setEditAmount(String(item.amount))
    setEditThreshold(String(item.threshold_amount))
    setEditPrice(item.price_per_unit ? String(item.price_per_unit) : '')
    setIsEditOpen(true)
  }

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editItem) return

    setSaving(true)
    try {
      const res = await fetch(`/api/stok/${editItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(editAmount),
          threshold_amount: Number(editThreshold),
          price_per_unit: editPrice ? Number(editPrice) : null
        })
      })
      if (res.ok) {
        toast.success('Stok berhasil diupdate! 📦')
        setIsEditOpen(false)
        fetchStock()
      } else {
        toast.error('Gagal update stok')
      }
    } catch (err) {
      toast.error('Masalah koneksi')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteStock = async (id: string) => {
    try {
      const res = await fetch(`/api/stok/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        toast.success('Bahan dihapus dari stok 🗑️')
        setIsEditOpen(false)
        fetchStock()
      } else {
        toast.error('Gagal menghapus')
      }
    } catch (err) {
      toast.error('Masalah koneksi')
    }
  }

  const handleToggleShoppingItem = (id: string) => {
    setShoppingItems(prev => prev.map(item => {
      if (item.id === id) {
        const checked = !item.checked
        return { ...item, checked }
      }
      return item
    }))
  }

  const handleRestockSubmit = async () => {
    const itemsToRestock = shoppingItems.filter(i => i.checked)
    if (itemsToRestock.length === 0) {
      toast.warning('Pilih minimal satu item untuk dibeli!')
      return
    }

    setRestocking(true)
    try {
      const res = await fetch('/api/belanja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsToRestock.map(i => ({
            id: i.id,
            quantityToRestock: i.required_amount
          }))
        })
      })

      if (res.ok) {
        toast.success('Stok bahan berhasil direstock dari pembelanjaan! 🎉')
        fetchShoppingList()
      } else {
        toast.error('Gagal memproses restock')
      }
    } catch (err) {
      toast.error('Masalah koneksi')
    } finally {
      setRestocking(false)
    }
  }

  const unitsList = [
    'g', 'kg', 'ons', 'ml', 'l', 'sdm', 'sdt', 'gelas', 'butir', 
    'biji', 'buah', 'potong', 'lembar', 'bungkus', 'kaleng', 
    'botol', 'sachet', 'secukupnya'
  ]

  const lowStock = stock.filter(item => item.amount <= item.threshold_amount)
  const okayStock = stock.filter(item => item.amount > item.threshold_amount)

  const activeShoppingCost = shoppingItems
    .filter(item => item.checked)
    .reduce((sum, item) => sum + item.estimated_cost, 0)

  // Find max daily total to calibrate graph
  const maxDailyTotal = weeklyReport?.daily_chart_data.reduce((max, d) => Math.max(max, d.total), 0) || 1
  const maxWeeklyTotal = monthlyReport?.weekly_breakdown.reduce((max, w) => Math.max(max, w.total), 0) || 1

  return (
    <div className="flex-1 flex flex-col p-5 space-y-4 bg-bg-warm min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-text-primary">
            <span className="mr-1">📦</span>
            Dapur & Stok
            </h1>
          <p className="text-xs text-text-secondary">Kelola bahan dapur, restock kulkas, dan pantau pengeluaran</p>
        </div>
        {activeTab === 'stok' && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark active:scale-95 transition-all shadow-badge cursor-pointer"
            title="Tambah Bahan"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </header>

      {/* Tabs */}
      <div className="flex bg-white/60 backdrop-blur-xs border border-border-subtle p-1 rounded-full gap-1">
        <button
          onClick={() => setActiveTab('stok')}
          className={`flex-1 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'stok' 
              ? 'bg-primary text-white shadow-xs' 
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Stok Kulkas
        </button>
        <button
          onClick={() => setActiveTab('belanja')}
          className={`flex-1 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'belanja' 
              ? 'bg-primary text-white shadow-xs' 
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Restock Belanja
          {lowStock.length > 0 && (
            <span className="w-4 h-4 text-[9px] font-extrabold bg-red-500 text-white rounded-full flex items-center justify-center">
              {lowStock.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('laporan')}
          className={`flex-1 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'laporan' 
              ? 'bg-primary text-white shadow-xs' 
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Laporan
        </button>
      </div>

      {/* Tab: STOK KULKAS */}
      {activeTab === 'stok' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex-1 flex flex-col justify-center items-center min-h-[40vh] gap-3">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs font-semibold text-text-secondary">Melihat isi kulkas...</p>
            </div>
          ) : (
            <>
              {/* Warning Hampir Habis */}
              {lowStock.length > 0 && (
                <section className="space-y-2">
                  <h2 className="text-xs font-extrabold text-red-500 flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" /> Hampir Habis ({lowStock.length})
                  </h2>
                  <div className="space-y-2">
                    {lowStock.map((item) => (
                      <Card 
                        key={item.id} 
                        onClick={() => handleOpenEdit(item)}
                        className="flex justify-between items-center p-3 bg-red-50/20 border-red-200 cursor-pointer hover:border-red-400 transition-colors"
                      >
                        <div>
                          <h3 className="text-xs font-bold text-text-primary">{item.name}</h3>
                          <p className="text-[11px] text-text-secondary mt-0.5">
                            Sisa: <span className="font-extrabold text-red-500">{item.amount} {item.unit}</span> / batas: {item.threshold_amount} {item.unit}
                          </p>
                          {item.price_per_unit !== null && item.price_per_unit > 0 && (
                            <div className="flex gap-2 text-[10px] text-text-secondary mt-1 font-medium">
                              <span>Harga: Rp {item.price_per_unit.toLocaleString('id-ID')}/{item.unit}</span>
                              <span className="text-text-disabled">•</span>
                              <span>Total: Rp {(item.price_per_unit * item.amount).toLocaleString('id-ID')}</span>
                            </div>
                          )}
                        </div>
                        <Edit2 className="w-4 h-4 text-red-400 shrink-0" />
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* Stock Cukup */}
              <section className="space-y-2">
                <h2 className="text-xs font-extrabold text-accent flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4" /> Stok Cukup ({okayStock.length})
                </h2>
                {okayStock.length > 0 ? (
                  <div className="space-y-2">
                    {okayStock.map((item) => (
                      <Card 
                        key={item.id} 
                        onClick={() => handleOpenEdit(item)}
                        className="flex justify-between items-center p-3 cursor-pointer hover:border-primary/45 transition-colors"
                      >
                        <div>
                          <h3 className="text-xs font-bold text-text-primary">{item.name}</h3>
                          <p className="text-[11px] text-text-secondary mt-0.5">
                            Sisa: <span className="font-bold text-text-primary">{item.amount} {item.unit}</span>
                          </p>
                          {item.price_per_unit !== null && item.price_per_unit > 0 && (
                            <div className="flex gap-2 text-[10px] text-text-secondary mt-1 font-medium">
                              <span>Harga: Rp {item.price_per_unit.toLocaleString('id-ID')}/{item.unit}</span>
                              <span className="text-text-disabled">•</span>
                              <span>Total: Rp {(item.price_per_unit * item.amount).toLocaleString('id-ID')}</span>
                            </div>
                          )}
                        </div>
                        <Edit2 className="w-4 h-4 text-text-disabled shrink-0" />
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-text-disabled italic text-center py-12">Kulkas kosong. Tambahkan bahan makanan pertama Anda.</p>
                )}
              </section>
            </>
          )}
        </div>
      )}

      {/* Tab: RESTOCK BELANJA */}
      {activeTab === 'belanja' && (
        <div className="space-y-4">
          <Card className="bg-amber-50/20 border-amber-200 p-3.5 flex gap-3 items-start">
            <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-text-primary">Bahan Habis & Batas Threshold</h4>
              <p className="text-[10px] text-text-secondary leading-relaxed mt-0.5">
                Halaman ini otomatis melacak bahan dapur yang stoknya berada di bawah batas minimum (threshold) yang kamu tentukan. Beri centang dan klik tombol di bawah untuk mencatat pembelanjaan dan me-restock kulkas sekaligus!
              </p>
            </div>
          </Card>

          {shoppingItems.length > 0 ? (
            <div className="space-y-4">
              <Card className="divide-y divide-border-subtle p-0 overflow-hidden">
                {shoppingItems.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => handleToggleShoppingItem(item.id)}
                    className="p-3.5 flex items-center justify-between hover:bg-surface-alt/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        item.checked 
                          ? 'bg-primary border-primary text-white' 
                          : 'border-border-subtle bg-surface-alt'
                      }`}>
                        {item.checked && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                      </div>
                      <div>
                        <h4 className={`text-xs font-bold ${item.checked ? 'text-text-primary' : 'text-text-disabled line-through'}`}>
                          {item.name}
                        </h4>
                        <p className="text-[9px] text-text-secondary mt-0.5">
                          Sisa: {item.current_amount} {item.unit} / Restock: <span className="font-bold text-primary">+{item.required_amount.toFixed(1)} {item.unit}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-text-primary">
                        Rp {item.estimated_cost.toLocaleString('id-ID')}
                      </span>
                      <p className="text-[9px] text-text-disabled">@Rp{item.price_per_unit}/{item.unit}</p>
                    </div>
                  </div>
                ))}
              </Card>

              {/* Sticky Summary Bar */}
              <Card className="bg-primary-light/35 border-primary/20 flex justify-between items-center py-4">
                <div>
                  <h4 className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Total Estimasi Belanja</h4>
                  <p className="text-sm font-extrabold text-primary">Rp {activeShoppingCost.toLocaleString('id-ID')}</p>
                </div>
                <Button
                  onClick={handleRestockSubmit}
                  disabled={restocking || activeShoppingCost === 0}
                  className="w-fit h-9 px-4 text-xs shadow-badge"
                >
                  {restocking ? 'Membeli...' : 'Restock Kulkas 🎉'}
                </Button>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center py-16 text-center gap-3">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center text-3xl">
                🎉
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Stok Kulkas Aman!</h3>
                <p className="text-xs text-text-secondary max-w-[220px] mx-auto mt-1 leading-relaxed">
                  Semua bahan dapurmu berada di atas batas minimum yang ditentukan. Kulkasmu terisi dengan baik!
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: LAPORAN BUDGET */}
      {activeTab === 'laporan' && (
        <div className="space-y-5">
          {loadingReport ? (
            <div className="flex-1 flex flex-col justify-center items-center min-h-[40vh] gap-3">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs font-semibold text-text-secondary">Menyusun laporan keuangan...</p>
            </div>
          ) : (
            <>
              {/* Ringkasan Bulanan */}
              {monthlyReport && (
                <section className="space-y-3">
                  <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary" /> Laporan Bulanan (Bulan Ini)
                  </h3>
                  <Card className="bg-gradient-to-br from-indigo-50/50 to-purple-50/30 border-indigo-100 p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-indigo-900 font-semibold uppercase tracking-wider">Total Pengeluaran Memasak</p>
                        <h4 className="text-xl font-black text-indigo-700 mt-1">
                          Rp {monthlyReport.total_expense.toLocaleString('id-ID')}
                        </h4>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <PiggyBank className="w-6 h-6" />
                      </div>
                    </div>

                    {/* Chart Mingguan Bulanan */}
                    <div className="space-y-2.5 pt-2">
                      <p className="text-[10px] font-bold text-text-secondary">Distribusi Pengeluaran Per Minggu</p>
                      <div className="space-y-2">
                        {monthlyReport.weekly_breakdown.map((item, idx) => {
                          const percent = (item.total / maxWeeklyTotal) * 100
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="font-semibold text-text-primary">{item.week}</span>
                                <span className="font-extrabold text-indigo-600">Rp {item.total.toLocaleString('id-ID')}</span>
                              </div>
                              <div className="w-full bg-indigo-100/50 h-2 rounded-full overflow-hidden border border-indigo-200/20">
                                <div 
                                  className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                                  style={{ width: `${Math.max(3, percent)}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </Card>
                </section>
              )}

              {/* Laporan Mingguan */}
              {weeklyReport && (
                <section className="space-y-3">
                  <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-accent" /> Ringkasan Mingguan (Senin - Minggu)
                  </h3>
                  
                  {/* Grid Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="p-3 bg-white space-y-1">
                      <span className="text-[9px] text-text-secondary uppercase tracking-wider">Pengeluaran</span>
                      <h4 className="text-sm font-bold text-text-primary">
                        Rp {weeklyReport.total_expense.toLocaleString('id-ID')}
                      </h4>
                    </Card>
                    <Card className="p-3 bg-white space-y-1">
                      <span className="text-[9px] text-text-secondary uppercase tracking-wider">Rata-rata/Hari</span>
                      <h4 className="text-sm font-bold text-accent">
                        Rp {Math.round(weeklyReport.average_per_day).toLocaleString('id-ID')}
                      </h4>
                    </Card>
                  </div>

                  <Card className="p-4 space-y-4">
                    {/* Graph Daily */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-text-secondary">Pengeluaran Masak Harian</p>
                      
                      {/* Playful Vertical bars representation */}
                      <div className="flex justify-between items-end h-28 pt-2 px-1 border-b border-border-subtle bg-surface-alt/30 rounded-lg pb-1">
                        {weeklyReport.daily_chart_data.map((dayItem, idx) => {
                          const heightPercent = (dayItem.total / maxDailyTotal) * 100
                          return (
                            <div key={idx} className="flex flex-col items-center flex-1 group relative">
                              {/* Hover Tooltip */}
                              <div className="absolute bottom-full mb-1 bg-text-primary text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xs">
                                Rp {dayItem.total.toLocaleString('id-ID')}
                              </div>
                              <div 
                                className="w-4.5 bg-primary-light hover:bg-primary rounded-t-xs transition-all duration-300"
                                style={{ height: `${Math.max(4, heightPercent * 0.8)}px` }}
                              />
                              <span className="text-[8px] font-bold text-text-secondary mt-1">
                                {dayItem.day.slice(0, 3)}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Stats recipe */}
                    <div className="divide-y divide-border-subtle text-[10px] space-y-2">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-text-secondary">Masakan Termahal Pekan Ini</span>
                        <div className="text-right">
                          <p className="font-bold text-text-primary">{weeklyReport.most_expensive_recipe.name}</p>
                          <p className="font-extrabold text-red-500">Rp {weeklyReport.most_expensive_recipe.cost.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-1 pt-2">
                        <span className="text-text-secondary">Masakan Terhemat Pekan Ini</span>
                        <div className="text-right">
                          <p className="font-bold text-text-primary">{weeklyReport.cheapest_recipe.name}</p>
                          <p className="font-extrabold text-emerald-600">Rp {weeklyReport.cheapest_recipe.cost.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </section>
              )}
            </>
          )}
        </div>
      )}

      {/* Create Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/45 z-55 flex items-center justify-center p-6">
          <Card className="w-full max-w-[340px] p-5 space-y-4 relative">
            <button 
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-text-primary text-center">Tambah Stok Bahan 📦</h3>
            
            <form onSubmit={handleAddStock} className="space-y-3">
              <Input
                id="name"
                label="Nama Bahan *"
                placeholder="Misal: Bawang Putih, Telur"
                value={name}
                onChange={e => setName(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  id="amount"
                  type="number"
                  label="Jumlah *"
                  placeholder="Misal: 100"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="unit" className="text-xs font-semibold text-text-secondary">Satuan *</label>
                  <select
                    id="unit"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="h-[48px] bg-surface-alt border border-border-subtle rounded-lg px-2 text-xs focus:outline-hidden cursor-pointer"
                  >
                    {unitsList.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  id="threshold"
                  type="number"
                  label="Batas Minimum"
                  value={threshold}
                  onChange={e => setThreshold(e.target.value)}
                />
                <Input
                  id="price"
                  type="number"
                  label="Harga/Satuan (Rp)"
                  placeholder="Opsional"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                />
              </div>

              <Button type="submit" variant="primary" disabled={saving} className="mt-2 h-10 text-xs">
                {saving ? 'Menyimpan...' : 'Simpan Bahan'}
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && editItem && (
        <div className="fixed inset-0 bg-black/45 z-55 flex items-center justify-center p-6">
          <Card className="w-full max-w-[340px] p-5 space-y-4 relative">
            <button 
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-text-primary text-center">Update {editItem.name} 📦</h3>
            
            <form onSubmit={handleUpdateStock} className="space-y-3">
              <Input
                id="editAmount"
                type="number"
                label={`Jumlah Baru (${editItem.unit}) *`}
                value={editAmount}
                onChange={e => setEditAmount(e.target.value)}
              />

              <Input
                id="editThreshold"
                type="number"
                label={`Batas Minimum (${editItem.unit})`}
                value={editThreshold}
                onChange={e => setEditThreshold(e.target.value)}
              />

              <Input
                id="editPrice"
                type="number"
                label="Harga/Satuan (Rp)"
                placeholder="Opsional"
                value={editPrice}
                onChange={e => setEditPrice(e.target.value)}
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleDeleteStock(editItem.id)}
                  className="w-12 h-10 bg-red-50 text-red-500 border border-red-200 rounded-full flex items-center justify-center hover:bg-red-100 active:scale-95 transition-all cursor-pointer"
                  title="Hapus bahan"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <Button type="submit" variant="primary" disabled={saving} className="flex-1 h-10 text-xs">
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
