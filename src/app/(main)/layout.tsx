import BottomNav from '@/components/ui/BottomNav'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full flex-1 flex flex-col pb-[64px] bg-bg-warm">
      <main className="w-full flex-1 flex flex-col">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
