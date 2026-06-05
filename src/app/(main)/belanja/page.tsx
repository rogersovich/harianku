'use client'

import React, { useEffect, useState } from 'react'
import useRouter from 'next/navigation'
import { Card, Button } from '@/components/ui/CustomComponents'
import { 
  ArrowLeft, RefreshCw, ShoppingBag, 
  Check, CheckSquare, Square 
} from 'lucide-react'
import { getWeekStartAndEnd, formatIndonesianDate } from '@/lib/utils/date'
import { toast } from 'sonner'

interface ShoppingItem {
  name: string
  amountNeeded: number
  unit: string
  estimatedCost: number | null
  checked?: boolean
}

export default function ShoppingListPage() {
  const { start: weekStart } = getWeekStartAndEnd()
  
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const fetchShoppingList = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/belanja?week=${weekStart}`)
      const json = await res.json()
      if (res.ok) {
        if (json.shoppingList) {
          setItems(json.shoppingList.map((i: any) => ({ ...i, checked: false })))
          setMessage('')
        } else if (json.message) {
          setItems([])
          setMessage(json.message)
        }
      } else {
        toast.error('Gagal membuat daftar belanja')
      }
    } catch (err) {
      toast.error('Masalah koneksi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShoppingList()
  }, [])

  const handleToggleCheck = (index: number) => {
    const updated = [...items]
    updated[index].checked = !updated[index].checked
    setItems(updated)
  }

  // Calculate estimated total price of UNCHECKED items (or all items)
  const totalCost = items
    .filter(item => !item.checked && item.estimatedCost)
    .reduce((sum, item) => sum + (item.estimatedCost || 0), 0)

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center min-h-[80vh] gap-3">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-semibold text-text-secondary">Merangkum daftar belanjaan...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col p-5 space-y-4 bg-bg-warm min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/stok"
            className="w-10 h-10 bg-white rounded-full border border-border-subtle flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text-primary">🛒 Daftar Belanja</h1>
            <p className="text-[10px] text-text-secondary">Periode: Senin {weekStart.split('-')[2]} s/d Minggu</p>
          </div>
        </div>
        <button
          onClick={fetchShoppingList}
          className="w-9 h-9 bg-white border border-border-subtle rounded-full flex items-center justify-center text-text-secondary hover:text-primary active:scale-95 transition-all cursor-pointer"
          title="Segarkan daftar"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      {/* Main List */}
      <div className="flex-1 flex flex-col">
        {items.length > 0 ? (
          <div className="space-y-4">
            <Card className="divide-y divide-border-subtle">
              {items.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleToggleCheck(index)}
                  className="w-full py-3.5 flex items-center justify-between text-left focus:outline-hidden cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {item.checked ? (
                      <div className="w-5 h-5 rounded-md bg-accent/25 border border-accent flex items-center justify-center text-accent">
                        <Check className="w-3.5 h-3.5 stroke-[3px]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-md border border-border-subtle bg-surface-alt" />
                    )}
                    
                    <div className="space-y-0.5">
                      <span className={`text-xs font-bold ${item.checked ? 'line-through text-text-disabled' : 'text-text-primary'}`}>
                        {item.name}
                      </span>
                      {item.estimatedCost && (
                        <p className="text-[10px] text-text-secondary">
                          Estimasi: Rp {item.estimatedCost.toLocaleString('id-ID')}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <span className={`text-xs font-extrabold ${item.checked ? 'text-text-disabled' : 'text-primary'}`}>
                    {item.amountNeeded} {item.unit}
                  </span>
                </button>
              ))}
            </Card>

            {/* Total Summary */}
            {totalCost > 0 && (
              <Card className="bg-primary-light/35 border-primary/20 flex justify-between items-center py-4">
                <div>
                  <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Estimasi Total Belanja</h4>
                  <p className="text-sm font-extrabold text-primary">Rp {totalCost.toLocaleString('id-ID')}</p>
                </div>
                <span className="text-[10px] text-text-secondary font-semibold italic">Unchecked items only</span>
              </Card>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center py-16 text-center gap-3">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center text-3xl">
              🎉
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                {message || 'Semua Bahan Cukup!'}
              </h3>
              <p className="text-xs text-text-secondary max-w-[220px] mx-auto mt-0.5 leading-relaxed">
                {message ? 'Isi jadwal makan di meal planner terlebih dahulu.' : 'Bahan masakan untuk jadwal minggu ini sudah lengkap di dapurmu.'}
              </p>
            </div>
            {message && (
              <Link
                href="/meal-planner"
                className="px-4 py-2 bg-primary text-white font-semibold rounded-full text-xs hover:opacity-90 active:scale-95 transition-all shadow-badge"
              >
                Atur Meal Planner
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Simple client wrapper for Link imports
import Link from 'next/link'
