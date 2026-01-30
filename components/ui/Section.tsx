import { ReactNode } from 'react'
import clsx from 'clsx'

interface SectionProps {
  children: ReactNode
  className?: string
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  background?: 'white' | 'black' | 'transparent'
}

export default function Section({
  children,
  className,
  containerSize = 'xl',
  background = 'transparent',
}: SectionProps) {
  const containerSizes = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  }
  
  const backgrounds = {
    white: 'bg-white',
    black: 'bg-black',
    transparent: 'bg-transparent',
  }
  
  return (
    <section className={clsx('py-12 md:py-20', backgrounds[background], className)}>
      <div className={clsx('mx-auto px-4 sm:px-6 lg:px-8', containerSizes[containerSize])}>
        {children}
      </div>
    </section>
  )
}
