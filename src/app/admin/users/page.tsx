'use client'

import React, { useEffect, useState } from 'react'
import { Card, Input } from '@/components/ui/CustomComponents'
import { Users, Search, RefreshCw, Calendar, Flame, BookOpen, ShieldAlert, X, Award, Dumbbell, User, Clock, Star } from 'lucide-react'
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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [userDetail, setUserDetail] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'recipes' | 'badges' | 'streaks'>('profile')

  const fetchUserDetail = async (userId: string) => {
    setModalLoading(true)
    setUserDetail(null)
    setActiveTab('profile')
    setIsModalOpen(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`)
      const json = await res.json()
      if (res.ok) {
        setUserDetail(json)
      } else {
        toast.error(json.error || 'Gagal memuat detail pengguna')
        setIsModalOpen(false)
      }
    } catch (err) {
      toast.error('Gagal memuat detail pengguna: Masalah koneksi')
      setIsModalOpen(false)
    } finally {
      setModalLoading(false)
    }
  }

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
    <div className="flex-1 p-6 pb-16 space-y-6">
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
                      <button
                        onClick={() => fetchUserDetail(u.id)}
                        className="font-bold text-text-primary hover:text-primary hover:underline transition-all text-left cursor-pointer focus:outline-hidden"
                      >
                        {u.name}
                      </button>
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

      {/* Modal Detail Pengguna */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4 md:p-6 backdrop-blur-xs">
          <Card className="w-full max-w-2xl max-h-[85vh] p-0 bg-white border border-border-subtle flex flex-col overflow-hidden relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary cursor-pointer transition-colors p-1.5 hover:bg-surface-alt rounded-full z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {modalLoading ? (
              <div className="flex flex-col justify-center items-center py-24 gap-3 w-full">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                <p className="text-xs font-semibold text-text-secondary">Memuat detail pengguna...</p>
              </div>
            ) : userDetail ? (
              <>
                {/* Header info */}
                <div className="p-6 pb-4 border-b border-border-subtle flex items-center gap-4 relative">
                  <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center text-2xl font-black text-primary shadow-inner">
                    {userDetail.user.name ? userDetail.user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-extrabold text-text-primary">{userDetail.user.name}</h2>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        userDetail.user.role === 'admin' 
                          ? 'bg-primary-light text-primary border border-primary/20' 
                          : 'bg-surface-alt text-text-secondary border border-border-subtle'
                      }`}>
                        {userDetail.user.role}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">{userDetail.user.email}</p>
                    <p className="text-[10px] text-text-disabled mt-0.5">ID: {userDetail.user.id}</p>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-2 px-6 py-3 bg-surface-alt border-b border-border-subtle text-center">
                  <div className="flex flex-col items-center justify-center py-1">
                    <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-warning fill-warning/20" /> Streak Tertinggi
                    </span>
                    <span className="text-sm font-bold text-text-primary mt-0.5">
                      {Math.max(
                        0,
                        ...(userDetail.streaks?.map((s: any) => Math.max(s.cooking_streak || 0, s.workout_streak || 0)) || [0])
                      )} Hari
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center py-1 border-x border-border-subtle/50">
                    <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-primary" /> Resep Dibuat
                    </span>
                    <span className="text-sm font-bold text-text-primary mt-0.5">
                      {userDetail.recipes?.length || 0} Resep
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center py-1">
                    <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-secondary" /> Lencana Didapat
                    </span>
                    <span className="text-sm font-bold text-text-primary mt-0.5">
                      {userDetail.badges?.length || 0} Badge
                    </span>
                  </div>
                </div>

                {/* Tabs selection */}
                <div className="flex border-b border-border-subtle bg-white px-2">
                  {[
                    { id: 'profile', label: 'Profil & Info', icon: User },
                    { id: 'recipes', label: 'Resep Dibuat', icon: BookOpen },
                    { id: 'badges', label: 'Lencana', icon: Award },
                    { id: 'streaks', label: 'Riwayat Streak', icon: Flame }
                  ].map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                          isActive 
                            ? 'border-primary text-primary' 
                            : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-alt/50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    )
                  })}
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto bg-bg-warm min-h-[300px]">
                  {activeTab === 'profile' && (
                    <div className="p-6 space-y-4 text-xs">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-3.5 rounded-xl border border-border-subtle">
                          <h4 className="font-extrabold text-text-secondary mb-1">Focus/Goal Utama</h4>
                          <p className="font-bold text-sm text-text-primary">
                            {userDetail.user.goal === 'makan_sehat' && '🥗 Makan Sehat'}
                            {userDetail.user.goal === 'aktif_olahraga' && '🏃 Aktif Olahraga'}
                            {userDetail.user.goal === 'keduanya' && '🔥 Makan Sehat & Olahraga'}
                            {!userDetail.user.goal && 'Belum diatur'}
                          </p>
                        </div>
                        <div className="bg-white p-3.5 rounded-xl border border-border-subtle">
                          <h4 className="font-extrabold text-text-secondary mb-1">Target Workout Mingguan</h4>
                          <p className="font-bold text-sm text-text-primary">
                            🏃‍♂️ {userDetail.user.workout_target_weekly} Kali / Minggu
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-border-subtle space-y-3">
                        <div className="flex justify-between items-center py-1.5 border-b border-border-subtle/30">
                          <span className="text-text-secondary font-semibold">Ulangi Plan Otomatis (Auto-Repeat)</span>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            userDetail.user.auto_repeat_meal 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                              : 'bg-surface-alt text-text-secondary border border-border-subtle'
                          }`}>
                            {userDetail.user.auto_repeat_meal ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-border-subtle/30">
                          <span className="text-text-secondary font-semibold">Tanggal Bergabung</span>
                          <span className="text-text-primary font-bold flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-text-disabled" />
                            {formatDate(userDetail.user.created_at)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1.5">
                          <span className="text-text-secondary font-semibold">Aktivitas Terakhir</span>
                          <span className="text-text-primary font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-text-disabled" />
                            {formatDate(userDetail.user.last_sign_in_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'recipes' && (
                    <div className="p-6 space-y-3">
                      {userDetail.recipes.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {userDetail.recipes.map((r: any) => (
                            <div key={r.id} className="p-3 border border-border-subtle rounded-xl hover:border-primary/30 transition-colors bg-white flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className="font-bold text-xs text-text-primary line-clamp-1">{r.name}</h4>
                                  {r.categories && (
                                    <span
                                      className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase whitespace-nowrap"
                                      style={{
                                        backgroundColor: `${r.categories.color}15`,
                                        color: r.categories.color,
                                        border: `1px solid ${r.categories.color}30`
                                      }}
                                    >
                                      {r.categories.name}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-text-secondary line-clamp-2 mt-1 min-h-[28px]">{r.description || 'Tidak ada deskripsi.'}</p>
                              </div>
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-subtle/50 text-[10px] text-text-secondary">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-text-disabled" />
                                  {r.estimated_time_minutes ? `${r.estimated_time_minutes} mnt` : '-'}
                                </span>
                                {r.rating && (
                                  <span className="flex items-center gap-0.5 text-warning font-bold">
                                    <Star className="w-3 h-3 fill-warning text-warning" />
                                    {r.rating}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center text-text-disabled border border-dashed border-border-subtle bg-white rounded-xl">
                          <BookOpen className="w-8 h-8 mx-auto mb-2 text-text-disabled/60" />
                          <p className="text-xs font-semibold">Belum membuat resep pribadi</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'badges' && (
                    <div className="p-6">
                      {userDetail.badges.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {userDetail.badges.map((b: any) => (
                            <div key={b.id} className="p-3 border border-border-subtle rounded-xl bg-white flex flex-col items-center text-center space-y-1">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-light to-primary flex items-center justify-center text-xl shadow-xs">
                                {b.icon || '🏅'}
                              </div>
                              <h4 className="font-extrabold text-[11px] text-text-primary leading-tight mt-1">{b.name}</h4>
                              <p className="text-[9px] text-text-secondary leading-normal line-clamp-2">{b.description}</p>
                              <span className="text-[8px] text-text-disabled pt-1">
                                Diraih: {new Date(b.earned_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center text-text-disabled border border-dashed border-border-subtle bg-white rounded-xl">
                          <Award className="w-8 h-8 mx-auto mb-2 text-text-disabled/60" />
                          <p className="text-xs font-semibold">Belum mendapatkan lencana</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'streaks' && (
                    <div className="p-6 space-y-3">
                      {userDetail.streaks.length > 0 ? (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {userDetail.streaks.map((s: any) => (
                            <div key={s.id} className="p-3 border border-border-subtle rounded-xl bg-white flex items-center justify-between">
                              <div>
                                <span className="text-[10px] text-text-secondary font-semibold">Minggu Mulai</span>
                                <p className="font-bold text-xs text-text-primary flex items-center gap-1.5 mt-0.5">
                                  <Calendar className="w-3.5 h-3.5 text-text-disabled" />
                                  {new Date(s.week_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                              </div>
                              <div className="flex gap-4">
                                <div className="text-right">
                                  <span className="text-[9px] text-text-secondary font-semibold uppercase tracking-wider block">Masak</span>
                                  <span className="font-black text-xs text-warning flex items-center gap-1 mt-0.5 justify-end">
                                    <Flame className="w-3.5 h-3.5 text-warning fill-warning/20" />
                                    {s.cooking_streak} Hari
                                  </span>
                                </div>
                                <div className="text-right border-l border-border-subtle/60 pl-4">
                                  <span className="text-[9px] text-text-secondary font-semibold uppercase tracking-wider block">Workout</span>
                                  <span className="font-black text-xs text-accent flex items-center gap-1 mt-0.5 justify-end">
                                    <Dumbbell className="w-3.5 h-3.5 text-accent" />
                                    {s.workout_streak} Hari
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center text-text-disabled border border-dashed border-border-subtle bg-white rounded-xl">
                          <Flame className="w-8 h-8 mx-auto mb-2 text-text-disabled/60" />
                          <p className="text-xs font-semibold">Belum memiliki riwayat streak</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col justify-center items-center py-24 gap-3 w-full">
                <ShieldAlert className="w-8 h-8 text-danger" />
                <p className="text-xs font-semibold text-text-secondary">Gagal memuat data detail pengguna.</p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
