'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

interface PriceEntry {
  checked_at: string
  price: number | null
  stock_status: string
}

interface PriceChartProps {
  data: PriceEntry[]
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${day}.${month} ${hours}:${minutes}`
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr)
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  return `${day}.${month}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-lg px-3 py-2 text-xs"
        style={{
          background: '#1a1a2e',
          border: '1px solid rgba(139,92,246,0.3)',
        }}
      >
        <p className="mb-1 text-[#64748b]">{formatDate(label)}</p>
        <p className="font-semibold text-[#a78bfa]">{payload[0].value.toFixed(2)} &euro;</p>
      </div>
    )
  }
  return null
}

export default function PriceChart({ data }: PriceChartProps) {
  const filtered = data.filter((entry) => entry.price !== null)

  if (filtered.length < 2) {
    return (
      <div
        className="flex items-center justify-center rounded-xl py-12 card-v"
      >
        <p className="text-sm text-[#64748b]">Nedostatok dát pre graf</p>
      </div>
    )
  }

  const chartData = filtered.map((entry) => ({
    checked_at: entry.checked_at,
    price: entry.price,
  }))

  return (
    <div className="rounded-xl p-4 card-v">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis
            dataKey="checked_at"
            tickFormatter={formatDateShort}
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={{ stroke: '#333' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => `${v}€`}
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#a855f7"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#a855f7', stroke: '#1a1a2e', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
