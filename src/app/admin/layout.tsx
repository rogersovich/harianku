import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import React from 'react'
import AdminSidebar from './AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="admin-layout h-screen flex overflow-hidden bg-bg-warm font-sans w-full">
      {/* Permanent Sidebar (Desktop-able) */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto flex flex-col bg-bg-warm">
        {children}
      </main>
    </div>
  )
}
