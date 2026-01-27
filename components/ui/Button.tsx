// GEN ALIXIR - Button Component
// Composant bouton réutilisable avec variantes

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          {
            // Variantes
            'bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500':
              variant === 'primary',
            'bg-secondary-500 text-white hover:bg-secondary-600 focus-visible:ring-secondary-500':
              variant === 'secondary',
            'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 focus-visible:ring-primary-500':
              variant === 'outline',
            'text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500':
              variant === 'ghost',
            
            // Tailles
            'text-sm px-3 py-1.5': size === 'sm',
            'text-base px-4 py-2': size === 'md',
            'text-lg px-6 py-3': size === 'lg',
            
            // Largeur
            'w-full': fullWidth,
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;
