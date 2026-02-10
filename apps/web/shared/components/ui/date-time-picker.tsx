"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, X } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/button"
import { Calendar } from "@/shared/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover"

interface DateTimePickerProps {
  value?: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  className?: string
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Selecione data e hora",
  clearable = false,
  disabled = false,
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)

  const date = React.useMemo(() => {
    if (!value) return undefined
    try {
      const d = new Date(value)
      return isNaN(d.getTime()) ? undefined : d
    } catch {
      return undefined
    }
  }, [value])

  const hours = date ? String(date.getHours()).padStart(2, "0") : "12"
  const minutes = date ? String(date.getMinutes()).padStart(2, "0") : "00"

  const updateDateTime = (newDate?: Date, h?: string, m?: string) => {
    if (!newDate) {
      onChange(null)
      return
    }
    const d = new Date(newDate)
    d.setHours(parseInt(h ?? hours), parseInt(m ?? minutes), 0, 0)
    // Format as datetime-local compatible string (YYYY-MM-DDTHH:mm)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    const hr = String(d.getHours()).padStart(2, "0")
    const min = String(d.getMinutes()).padStart(2, "0")
    onChange(`${year}-${month}-${day}T${hr}:${min}`)
  }

  const handleDaySelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      updateDateTime(selectedDate)
    }
  }

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (date) {
      updateDateTime(date, e.target.value, minutes)
    }
  }

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (date) {
      updateDateTime(date, hours, e.target.value)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          {date ? (
            <span className="truncate">
              {format(date, "dd 'de' MMMM 'de' yyyy 'as' HH:mm", { locale: ptBR })}
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
          {clearable && date && (
            <X
              className="ml-auto h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDaySelect}
          defaultMonth={date}
        />
        <div className="border-t border-border px-3 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Horario:</span>
            <select
              value={hours}
              onChange={handleHourChange}
              disabled={!date}
              className="h-8 rounded-md border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {Array.from({ length: 24 }, (_, i) =>
                String(i).padStart(2, "0")
              ).map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <span className="text-sm font-medium">:</span>
            <select
              value={minutes}
              onChange={handleMinuteChange}
              disabled={!date}
              className="h-8 rounded-md border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {Array.from({ length: 60 }, (_, i) =>
                String(i).padStart(2, "0")
              ).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
