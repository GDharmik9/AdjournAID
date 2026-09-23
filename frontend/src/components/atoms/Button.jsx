import React from 'react';

/**
 * Atomic Button Component
 * Reusable accessible button with support for variants, sizes, loading state, and icons.
 */
export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  icon = null,
  title = '',
  ariaLabel = '',
  className = '',
  type = 'button',
  ...props
}) {
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm',
  }[size] || 'px-3 py-1.5 text-xs';

  const variantClasses = {
    primary:
      'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm border border-transparent focus:ring-indigo-500',
    secondary:
      'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700',
    outline:
      'bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-300 dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    ghost:
      'bg-transparent hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 dark:hover:bg-slate-800/80 dark:text-slate-400 dark:hover:text-slate-200',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white shadow-sm border border-transparent focus:ring-rose-500',
  }[variant] || variantClasses.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      title={title}
      aria-label={ariaLabel || title}
      className={`inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
    </button>
  );
}
