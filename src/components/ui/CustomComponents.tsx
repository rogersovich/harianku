import React from 'react'

// --- BUTTON COMPONENT ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'w-full h-[48px] px-6 rounded-full font-semibold text-sm flex items-center justify-center transition-all duration-100 active:scale-97 cursor-pointer'
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark disabled:bg-text-disabled disabled:opacity-60 disabled:cursor-not-allowed',
    secondary: 'bg-primary-light text-primary hover:opacity-90 disabled:bg-text-disabled disabled:opacity-60 disabled:cursor-not-allowed',
    ghost: 'bg-transparent border-[1.5px] border-primary text-primary hover:bg-primary-light/10 disabled:border-text-disabled disabled:text-text-disabled disabled:cursor-not-allowed',
    danger: 'bg-danger text-white hover:opacity-90 disabled:bg-text-disabled disabled:opacity-60 disabled:cursor-not-allowed'
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

// --- CARD COMPONENT ---
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white border border-border-subtle rounded-[16px] shadow-pink-subtle p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

// --- INPUT COMPONENT ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Input: React.FC<InputProps> = ({ label, className = '', id, ...props }) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-text-secondary">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full h-[48px] bg-surface-alt border-1.5 border-border-subtle rounded-[8px] px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:outline-hidden focus:border-primary transition-colors ${className}`}
        {...props}
      />
    </div>
  )
}

// --- CHIP COMPONENT ---
interface ChipProps {
  label: string
  active?: boolean
  onClick?: () => void
  className?: string
}

export const Chip: React.FC<ChipProps> = ({ label, active = false, onClick, className = '' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-[32px] px-3.5 py-1.5 rounded-full text-xs font-medium border flex items-center justify-center whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer ${
        active
          ? 'bg-primary-light text-primary border-primary'
          : 'bg-surface-alt text-text-secondary border-border-subtle hover:bg-border-subtle/30'
      } ${className}`}
    >
      {label}
    </button>
  )
}

// --- BADGE COMPONENT ---
interface BadgeProps {
  emoji: string
  name: string
  description?: string
  locked?: boolean
}

export const Badge: React.FC<BadgeProps> = ({ emoji, name, description, locked = false }) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-light to-primary shadow-badge transition-all duration-300 ${
          locked ? 'grayscale opacity-40 shadow-none' : ''
        }`}
      >
        <span className="text-[28px]">{emoji}</span>
      </div>
      <span className="text-[12px] font-semibold text-text-primary text-center leading-tight">
        {name}
      </span>
      {description && (
        <span className="text-[10px] text-text-secondary text-center leading-none max-w-[80px]">
          {description}
        </span>
      )}
    </div>
  )
}

// --- STREAK COUNTER COMPONENT ---
interface StreakCounterProps {
  type: 'masak' | 'workout'
  count: number
  total?: number
}

export const StreakCounter: React.FC<StreakCounterProps> = ({ type, count, total = 7 }) => {
  const isMasak = type === 'masak'
  
  const bgGradient = isMasak
    ? 'from-secondary to-warning'
    : 'from-accent to-[#3AAD56]'

  return (
    <div className={`flex-1 rounded-[12px] bg-gradient-to-b ${bgGradient} p-3 text-white flex flex-col justify-between shadow-xs min-h-[80px]`}>
      <div className="flex justify-between items-start">
        <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">
          {isMasak ? '🔥 Streak Masak' : '💪 Streak Workout'}
        </span>
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-28px font-bold leading-none">{count}</span>
          <span className="text-xs text-white/70">/ {total} hari</span>
        </div>
        {/* Simple Progress Mini-Bar */}
        <div className="w-full bg-white/30 h-1.5 rounded-full mt-1.5 overflow-hidden">
          <div
            className="bg-white h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min((count / total) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
