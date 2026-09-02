"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export type Option = { label: string; value: string }

export function FormSelect({
  name,
  id,
  options,
  placeholder,
  value,
  defaultValue,
  onValueChange,
  required,
  className,
}: {
  name?: string
  id?: string
  options: Option[]
  placeholder?: string
  value?: string | null
  defaultValue?: string
  onValueChange?: (v: string) => void
  required?: boolean
  className?: string
}) {
  return (
    <Select
      name={name}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(v) => onValueChange?.(v as string)}
      required={required}
      items={options}
    >
      <SelectTrigger id={id} className={cn("h-11 w-full text-base", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
