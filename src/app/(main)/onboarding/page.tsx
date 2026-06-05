'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Button } from '@/components/ui/CustomComponents'
import { Sparkles, Dumbbell, Salad, Heart } from 'lucide-react'
import { toast } from 'sonner'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [goal, setGoal] = useState<'makan_sehat' | 'aktif_olahraga' | 'keduanya'>('keduanya')
  const [loading, setLoading] = useState(false)

  const handleSelectGoal = (selected: 'makan_sehat' | 'aktif_olahraga' | 'keduanya') => {
    setGoal(selected)
    setStep(2)
  }

  const handleFinish = async (skip = false) => {
    setLoading(true)
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, skip }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success(skip ? 'Onboarding dilewati.' : 'Resep starter berhasil ditambahkan!')
        router.push('/dashboard')
        router.refresh()
      } else {
        toast.error(data.error || 'Terjadi kesalahan.')
      }
    } catch (error) {
      toast.error('Gagal memproses onboarding.')
    } finally {
      setLoading(false)
    }
  }

  const starterRecipesPreview = {
    makan_sehat: [
      'Oatmeal Pisang Cepat 🍌',
      'Salad Ayam Panggang 🥗',
      'Sup Sayur Bening 🥕',
      'Jus Hijau Detoks 🍏',
      'Pepes Tahu Kemangi 🍃',
    ],
    aktif_olahraga: [
      'Smoothie Protein Pisang 🥛',
      'Dada Ayam Panggang & Kentang 🍗',
      'Telur Rebus & Avocado Toast 🥑',
      'Nasi Goreng Quinoa 🍚',
      'Protein Bowl Salmon 🐟',
    ],
    keduanya: [
      'Oatmeal Pisang Cepat 🍌',
      'Salad Ayam Panggang 🥗',
      'Sup Sayur Bening 🥕',
      'Dada Ayam Panggang & Kentang 🍗',
      'Telur Rebus & Avocado Toast 🥑',
    ],
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-bg-warm min-h-screen">
      {/* Top Header */}
      <header className="flex justify-between items-center py-4">
        <div className="flex items-center gap-1">
          <span className="text-xl">🍳</span>
          <span className="text-md font-bold text-text-primary tracking-tight">HarianKu</span>
        </div>
        {step === 1 && (
          <button
            onClick={() => handleFinish(true)}
            disabled={loading}
            className="text-xs font-semibold text-text-secondary hover:text-primary transition-colors cursor-pointer"
          >
            Lewati
          </button>
        )}
      </header>

      {/* Onboarding Flow */}
      <main className="flex-1 flex flex-col justify-center my-4">
        {step === 1 ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-text-primary">Pilih Fokus Utamamu 🎯</h1>
              <p className="text-xs text-text-secondary max-w-[280px] mx-auto">
                Sesuaikan resep starter dan modul harian Anda berdasarkan target yang ingin dicapai.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleSelectGoal('makan_sehat')}
                className="w-full flex items-center justify-between p-4 bg-white border border-border-subtle rounded-[16px] shadow-pink-subtle hover:border-primary/50 transition-all text-left cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-xl">
                    🥗
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">Makan Sehat</h3>
                    <p className="text-[11px] text-text-secondary">Fokus ke resep bernutrisi dan kalori seimbang</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSelectGoal('aktif_olahraga')}
                className="w-full flex items-center justify-between p-4 bg-white border border-border-subtle rounded-[16px] shadow-pink-subtle hover:border-primary/50 transition-all text-left cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-xl">
                    🏃
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">Aktif Olahraga</h3>
                    <p className="text-[11px] text-text-secondary">Fokus ke penambah energi dan nutrisi workout</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSelectGoal('keduanya')}
                className="w-full flex items-center justify-between p-4 bg-white border border-border-subtle rounded-[16px] shadow-pink-subtle hover:border-primary/50 transition-all text-left cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-light/40 flex items-center justify-center text-xl">
                    🔥
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">Keduanya</h3>
                    <p className="text-[11px] text-text-secondary">Jalani pola makan sehat sekaligus rutin olahraga</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-text-primary">Menu Starter Siap! 🎉</h1>
              <p className="text-xs text-text-secondary max-w-[300px] mx-auto">
                Kami telah menyiapkan 5 resep awal yang cocok dengan goal pilihanmu:
              </p>
            </div>

            <Card className="space-y-3">
              <div className="divide-y divide-border-subtle">
                {starterRecipesPreview[goal].map((recipeName, index) => (
                  <div key={index} className="py-2.5 flex items-center gap-3 text-sm text-text-primary font-medium">
                    <span className="text-primary text-xs">#{index + 1}</span>
                    {recipeName}
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex flex-col gap-2">
              <Button
                variant="primary"
                onClick={() => handleFinish(false)}
                disabled={loading}
              >
                {loading ? 'Membuat Profil...' : 'Mulai Perjalanan →'}
              </Button>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-text-secondary hover:underline py-1 cursor-pointer"
              >
                Kembali pilih goal
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Progress Dots */}
      <footer className="flex justify-center items-center gap-2 py-4">
        <span className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-primary' : 'bg-border-subtle'}`} />
        <span className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-primary' : 'bg-border-subtle'}`} />
      </footer>
    </div>
  )
}
