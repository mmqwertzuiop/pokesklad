import type { StockStatus } from '@/types/product'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Clock, HelpCircle } from 'lucide-react'

const STATUS_CONFIG: Record<
  StockStatus,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  in_stock: {
    label: 'Skladom',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20',
    icon: CheckCircle2,
  },
  out_of_stock: {
    label: 'Vypredané',
    className: 'bg-red-500/15 text-red-400 border-red-500/25 hover:bg-red-500/20',
    icon: XCircle,
  },
  preorder: {
    label: 'Predobjednávka',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/25 hover:bg-amber-500/20',
    icon: Clock,
  },
  unknown: {
    label: 'Neznámy',
    className: 'bg-gray-500/15 text-gray-400 border-gray-500/25 hover:bg-gray-500/20',
    icon: HelpCircle,
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
  const Icon = config.icon

  return (
    <Badge variant="outline" className={`${config.className} ${className || ''}`}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
      {quantity != null && status === 'in_stock' && (
        <span className="ml-1 opacity-75">({quantity} ks)</span>
      )}
    </Badge>
  )
}
