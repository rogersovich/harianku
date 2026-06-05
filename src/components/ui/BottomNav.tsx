'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Dumbbell, Package, BookOpen } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home, color: 'text-primary' },
    { name: 'Resep', href: '/resep', icon: BookOpen, color: 'text-primary' },
    { name: 'Dapur', href: '/stok', icon: Package, color: 'text-accent' },
    { name: 'Masak', href: '/meal-planner', icon: Calendar, color: 'text-secondary' },
    { name: 'Workout', href: '/workout', icon: Dumbbell, color: 'text-accent' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto h-[64px] bg-white border-t border-border-subtle flex items-center justify-around z-50 px-2 shadow-sm">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname.startsWith(item.href)
        const activeColor = item.color
        const dotBgColor = item.color.replace('text-', 'bg-')

        return (
          <Link
            key={item.name}
            href={item.href}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-full transition-colors duration-150 relative"
          >
            <Icon
              className={`w-5 h-5 transition-transform duration-100 ${
                isActive ? `${activeColor} scale-110` : 'text-text-secondary'
              }`}
            />
            <span
              className={`text-[10px] mt-1 font-semibold ${
                isActive ? activeColor : 'text-text-secondary'
              }`}
            >
              {item.name}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
