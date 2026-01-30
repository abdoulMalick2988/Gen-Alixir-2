import { ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
}

export default function Card({ children, className, hover = false, glow = false }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6',
        hover && 'transition-all duration-300 hover:scale-105 hover:shadow-lg',
        glow && 'shadow-emerald-glow',
        className
      )}
    >
      {children}
    </div>
  )
}
