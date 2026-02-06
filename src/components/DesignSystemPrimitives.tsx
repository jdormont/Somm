import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = '', hover = true }: CardProps) {
  return (
    <div
      className={`
        bg-wine-slate-900/80 backdrop-blur-md rounded-2xl
        border border-white/10
        ${hover ? 'hover:border-champagne-400/30 hover:shadow-2xl hover:shadow-champagne-400/5 transition-all duration-500 ease-out' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  variant?: 'match' | 'value' | 'premium';
  className?: string;
}

export function Badge({ children, variant = 'match', className = '' }: BadgeProps) {
  const variants = {
    match: 'bg-champagne-400/10 border-champagne-400/20 text-champagne-400',
    value: 'bg-vine-green/10 border-vine-green/20 text-vine-green',
    premium: 'bg-somm-red-500/10 border-somm-red-500/20 text-somm-red-500',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-3 py-1.5 rounded-full
        text-xs font-sans font-medium uppercase tracking-wider
        border ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function SommButton({
  children,
  variant = 'primary',
  className = '',
  onClick,
  disabled = false,
}: ButtonProps) {
  const variants = {
    primary: `
      bg-somm-red-900 text-champagne-100
      border border-somm-red-500/30
      hover:bg-somm-red-500 hover:border-champagne-400/50
      hover:shadow-lg hover:shadow-somm-red-500/20
    `,
    secondary: `
      bg-wine-slate-900/60 text-champagne-100/80
      border border-white/10
      hover:border-champagne-400/30 hover:text-champagne-100
    `,
    ghost: `
      text-champagne-100/60
      hover:text-champagne-100 hover:bg-white/5
    `,
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-3 rounded-xl
        font-sans text-sm font-medium tracking-wide
        transition-all duration-500 ease-out
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

interface HeadingProps {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4;
  className?: string;
}

export function SerifHeading({ children, level = 1, className = '' }: HeadingProps) {
  const sizes = {
    1: 'text-5xl sm:text-6xl',
    2: 'text-4xl sm:text-5xl',
    3: 'text-3xl sm:text-4xl',
    4: 'text-2xl sm:text-3xl',
  };

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag
      className={`
        font-serif font-light leading-tight
        text-champagne-100
        ${sizes[level]}
        ${className}
      `}
    >
      {children}
    </Tag>
  );
}

interface TextProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'muted';
  className?: string;
}

export function BodyText({ children, variant = 'primary', className = '' }: TextProps) {
  const variants = {
    primary: 'text-champagne-100',
    secondary: 'text-champagne-100/80',
    tertiary: 'text-champagne-100/60',
    muted: 'text-champagne-100/50',
  };

  return (
    <p className={`font-sans tracking-wide ${variants[variant]} ${className}`}>
      {children}
    </p>
  );
}

interface DividerProps {
  className?: string;
}

export function Divider({ className = '' }: DividerProps) {
  return (
    <div className={`border-t border-white/5 ${className}`} />
  );
}

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`min-h-screen bg-wine-slate-950 ${className}`}>
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-8">
        {children}
      </div>
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  centered = false,
  className = '',
}: SectionHeaderProps) {
  return (
    <header className={`mb-12 ${centered ? 'text-center' : ''} ${className}`}>
      <SerifHeading level={1} className="mb-4">
        {title}
      </SerifHeading>
      {subtitle && (
        <BodyText variant="tertiary" className="text-lg">
          {subtitle}
        </BodyText>
      )}
    </header>
  );
}
