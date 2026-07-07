import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Lock } from 'lucide-react'

interface PasswordFieldProps {
  id: string
  name?: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  toggleable?: boolean
}

export function PasswordField({ id, name, label, value, onChange, disabled, toggleable = true }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-slate-700">
        {label}
      </Label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          id={id}
          name={name ?? id}
          type={toggleable && visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          required
          disabled={disabled}
          className="h-11 pl-10 pr-10 rounded-xl bg-slate-50/60 border-slate-200 focus-visible:bg-white"
        />
        {toggleable && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-slate-600"
            onClick={() => setVisible((v) => !v)}
            disabled={disabled}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  )
}
