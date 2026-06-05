'use client'

import React from 'react'
import { Drawer as VaulDrawer } from 'vaul'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  trigger?: React.ReactNode
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  trigger,
}) => {
  return (
    <VaulDrawer.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      {trigger && <VaulDrawer.Trigger asChild>{trigger}</VaulDrawer.Trigger>}
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <VaulDrawer.Content className="bg-white flex flex-col rounded-t-[20px] max-h-[85vh] fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto z-50 focus:outline-hidden">
          <div className="p-4 bg-white rounded-t-[20px] flex flex-col overflow-hidden">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-border-subtle mb-4 cursor-pointer" />
            {title && (
              <VaulDrawer.Title className="text-lg font-bold text-text-primary mb-3 text-center">
                {title}
              </VaulDrawer.Title>
            )}
            <div className="overflow-y-auto pr-1">
              {children}
            </div>
          </div>
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  )
}
