interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'info', className = '' }: BadgeProps) {
  const variants = {
    success: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300 dark:from-green-900/30 dark:to-green-800/30 dark:text-green-200 dark:border-green-700',
    warning: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300 dark:from-yellow-900/30 dark:to-yellow-800/30 dark:text-yellow-200 dark:border-yellow-700',
    danger: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300 dark:from-red-900/30 dark:to-red-800/30 dark:text-red-200 dark:border-red-700',
    info: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300 dark:from-blue-900/30 dark:to-blue-800/30 dark:text-blue-200 dark:border-blue-700'
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

