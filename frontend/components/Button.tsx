
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'solid' | 'outline'
  className?: string
  icon?: React.ComponentType
}

export default function Button({
  label,
  onClick,
  variant = 'solid',
  className = '',
  icon: Icon,
}: ButtonProps) {
  const baseStyle =
    'flex items-center justify-center gap-2 px-6 py-2 rounded font-bold transition-colors duration-200 outline-none'

  const variantStyle =
    variant === 'solid'
      ? 'bg-[#1E40AF] text-white border-2 border-transparent hover:bg-white hover:text-[#1E40AF] hover:border-[#1E40AF]'
      : 'border-2 border-[#1E40AF] text-[#1E40AF] hover:bg-[#1E40AF] hover:text-white'

  return (
    <button onClick={onClick} className={`${baseStyle} ${variantStyle} ${className}`}>
      {Icon && <Icon />}
      {label}
    </button>
  )
}
