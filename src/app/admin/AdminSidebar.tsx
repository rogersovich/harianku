'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, LayoutDashboard, Award, BookOpen, Home } from 'lucide-react'

export default function AdminSidebar() {
  const pathname = usePathname()

  const menuItems = [
    {
      name: 'Dasbor Utama',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Kelola Badge & Reward',
      href: '/admin/badges',
      icon: Award,
    },
    {
      name: 'Kelola Resep Starter',
      href: '/admin/resep',
      icon: BookOpen,
    },
  ]

  return (
    <aside className="flex flex-col w-64 bg-white text-text-secondary border-r border-border-subtle shrink-0 h-screen sticky top-0">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-border-subtle gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary">
          <Shield className="w-4 h-4" />
        </div>
        <span className="font-extrabold text-text-primary tracking-tight text-sm">HarianKu Admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? 'bg-primary-light text-primary border border-primary/10 shadow-xs'
                  : 'text-text-secondary hover:bg-primary-light/30 hover:text-primary'
              }`}
            >
              <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-primary' : ''}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border-subtle">
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-primary text-white hover:bg-primary-dark transition-all shadow-pink-subtle"
        >
          <Home className="w-4 h-4" />
          Kembali ke App
        </Link>
      </div>
    </aside>
  )
}
