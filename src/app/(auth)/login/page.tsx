'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button, Card, Input } from '@/components/ui/CustomComponents'
import { Mail, Lock, AlertCircle, Sparkles } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

function LoginForm() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  
  const errorMsg = searchParams.get('error')

  useEffect(() => {
    if (errorMsg === 'auth_failed') {
      toast.error('Autentikasi gagal. Silakan coba lagi.')
    }
  }, [errorMsg])

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.warning('Email dan Password harus diisi!')
      return
    }

    setLoading(true)
    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: email.split('@')[0],
          }
        }
      })
      if (error) {
        toast.error(error.message)
      } else {
        if (data.session) {
          toast.success('Pendaftaran berhasil! Mengalihkan ke onboarding...')
          router.push('/onboarding')
        } else {
          toast.success('Pendaftaran berhasil! Silakan cek email konfirmasi atau login.')
          setIsSignUp(false)
        }
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        toast.error(error.message)
      } else if (data.user) {
        toast.success('Selamat datang kembali!')
        // Check onboarding completion and role
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed, role')
          .eq('id', data.user.id)
          .single()

        if (profile?.role === 'admin') {
          router.push('/admin/dashboard')
        } else if (profile?.onboarding_completed) {
          router.push('/dashboard')
        } else {
          router.push('/onboarding')
        }
      }
    }
    setLoading(false)
  }

  return (
    <div className="flex-1 flex flex-col justify-center p-6 bg-bg-warm min-h-screen">
      <div className="w-full space-y-6">
        {/* Branding Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-16 h-16 bg-primary-light rounded-[20px] flex items-center justify-center text-4xl shadow-pink-subtle">
            🍳
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">HarianKu</h1>
          <p className="text-xs text-text-secondary">
            Rencanakan makanan dan olahraga harianmu dengan menyenangkan
          </p>
        </div>

        <Card className="space-y-4">
          <h2 className="text-md font-bold text-text-primary text-center">
            {isSignUp ? 'Buat Akun Baru' : 'Masuk ke HarianKu'}
          </h2>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-[48px] bg-white border border-border-subtle rounded-full text-sm font-semibold text-text-primary flex items-center justify-center gap-2 hover:bg-surface-alt active:scale-97 transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.1.85-2.07 2.18v1.81h3.33c1.94-1.78 3.07-4.4 3.07-7.44z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.89-3.02c-1.08.72-2.47 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.84v3.12C3.81 21.36 7.64 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.27 14.26a7.22 7.22 0 0 1 0-4.52V6.62H1.84a12.01 12.01 0 0 0 0 10.76l3.43-3.12z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.64 0 3.81 2.64 1.84 6.62l3.43 3.12c.95-2.85 3.6-4.99 6.73-4.99z"
              />
            </svg>
            Masuk dengan Google
          </button>

          <div className="flex items-center my-3">
            <hr className="flex-1 border-border-subtle" />
            <span className="px-3 text-[10px] uppercase font-bold text-text-secondary">atau email</span>
            <hr className="flex-1 border-border-subtle" />
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-3">
            <Input
              id="email"
              type="email"
              label="Alamat Email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <Input
              id="password"
              type="password"
              label="Kata Sandi"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            <Button type="submit" variant="primary" disabled={loading} className="mt-2">
              {loading ? 'Memproses...' : isSignUp ? 'Daftar Sekarang' : 'Masuk dengan Email'}
            </Button>
          </form>

          <div className="flex flex-col gap-2 pt-2 items-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              {isSignUp ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar gratis'}
            </button>
            
            <Link
              href="/"
              className="text-[11px] font-bold text-text-secondary hover:text-text-primary hover:underline transition-colors mt-2"
            >
              ← Kembali ke Halaman Utama
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col justify-center items-center min-h-screen">
        <p className="text-xs text-text-secondary animate-pulse">Memuat halaman masuk...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
