import type { StockStatus } from '@/types/product'

const STATUS_CONFIG: Record<
  StockStatus,
  { label: string; dotColor: string; textColor: string }
> = {
  in_stock: {
    label: 'Skladom',
    dotColor: 'bg-violet-500',
    textColor: 'text-violet-400',
  },
  out_of_stock: {
    label: 'Vypredané',
    dotColor: 'bg-slate-500',
    textColor: 'text-slate-400',
  },
  preorder: {
    label: 'Predobjednávka',
    dotColor: 'bg-violet-500',
    textColor: 'text-violet-400',
  },
  unknown: {
    label: 'Neznámy',
    dotColor: 'bg-gray-500',
    textColor: 'text-gray-400',
  },
}

export function AvailabilityBadge({
  status,
  quantity,
  className,
}: {
  status: StockStatus
  quantity?: number | null
  className?: string
}) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.unknown

  return (
    <div className={`flex items-center gap-1.5 ${className || ''}`}>
      <span className="relative flex h-2 w-2">
        {status === 'in_stock' && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${config.dotColor} opacity-75`} />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${config.dotColor}`} />
      </span>
      <span className={`text-[11px] font-medium ${config.textColor}`}>
        {config.label}
        {quantity != null && status === 'in_stock' && (
          <span className="ml-1 opacity-70">({quantity})</span>
        )}
      </span>
    </div>
  )
}
