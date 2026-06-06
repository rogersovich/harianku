'use client'

import React, { useEffect, useState } from 'react'
import { Card, Input } from '@/components/ui/CustomComponents'
import { Users, Search, RefreshCw, Calendar, Flame, BookOpen, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

interface AdminUser {
  id: string
  name: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  highest_streak: number
  recipes_count: number
  role: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchUsers = async (search = '') => {
    setLoading(true)
    try {
      const url = search ? `/api/admin/users?search=${encodeURIComponent(search)}` : '/api/admin/users'
      const res = await fetch(url)
      const json = await res.json()
      if (res.ok) {
        setUsers(json)
      } else {
        toast.error('Gagal memuat daftar pengguna')
      }
    } catch (err) {
      toast.error('Masalah koneksi terganggu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers(searchQuery)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex-1 p-6 space-y-6 bg-bg-warm min-h-screen">
      {/* Header */}
      <header className="border-b border-border-subtle pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-text-primary flex items-center gap-1.5">
            <Users className="w-5 h-5 text-primary" /> Manajemen User
          </h1>
          <p className="text-xs text-text-secondary">Lihat aktivitas, streak, dan daftar resep yang dibuat oleh seluruh pengguna</p>
        </div>
      </header>

      {/* Control Bar */}
      <Card className="p-4 bg-white border-border-subtle shadow-pink-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Cari user berdasarkan nama atau email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-surface-alt border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="px-4 h-10 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            Cari
          </button>
        </form>

        <button
          onClick={() => {
            setSearchQuery('')
            fetchUsers('')
          }}
          className="h-10 px-4 border border-border-subtle hover:bg-surface-alt text-text-secondary rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Reset
        </button>
      </Card>

      {/* Users List */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 gap-3">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs font-semibold text-text-secondary">Memuat data pengguna...</p>
        </div>
      ) : users.length > 0 ? (
        <Card className="p-0 bg-white border-border-subtle shadow-pink-subtle overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-alt border-b border-border-subtle text-text-secondary text-[11px] font-extrabold uppercase tracking-wider">
                  <th className="p-4 pl-6">Nama & Email</th>
                  <th className="p-4">Tanggal Join</th>
                  <th className="p-4">Terakhir Aktif</th>
                  <th className="p-4 text-center">Streak Tertinggi</th>
                  <th className="p-4 text-center">Resep Dibuat</th>
                  <th className="p-4 text-right pr-6">Status Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-xs text-text-primary">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-primary-light/5 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-text-primary">{u.name}</div>
                      <div className="text-[10px] text-text-secondary mt-0.5">{u.email}</div>
                    </td>
                    <td className="p-4 text-text-secondary">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-text-disabled" />
                        {formatDate(u.created_at)}
                      </span>
                    </td>
                    <td className="p-4 text-text-secondary">
                      {formatDate(u.last_sign_in_at)}
                    </td>
                    <td className="p-4 text-center font-extrabold text-warning">
                      <span className="inline-flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 fill-warning/20 text-warning" />
                        {u.highest_streak}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-primary">
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-primary" />
                        {u.recipes_count}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        u.role === 'admin' 
                          ? 'bg-primary-light text-primary border border-primary/20' 
                          : 'bg-surface-alt text-text-secondary border border-border-subtle'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="border border-dashed border-border-subtle bg-white rounded-xl py-16 text-center">
          <ShieldAlert className="w-8 h-8 text-text-disabled mx-auto mb-2" />
          <p className="text-xs text-text-secondary font-semibold">Tidak ada pengguna yang cocok dengan kriteria pencarian.</p>
          <p className="text-[10px] text-text-disabled mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
        </div>
      )}
    </div>
  )
}
