import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ checked, onCheckedChange, className, ...props }, ref) => {
    return (
      <label className={cn("inline-flex items-center cursor-pointer", className)}>
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onCheckedChange(e.target.checked)}
          ref={ref}
          className="sr-only"
          {...props}
        />
        <span
          className={cn(
            "w-10 h-6 flex items-center bg-gray-300 rounded-full p-1 transition-colors",
            checked ? "bg-blue-600" : "bg-gray-300"
          )}
        >
          <span
            className={cn(
              "bg-white w-4 h-4 rounded-full shadow-md transform transition-transform",
              checked ? "translate-x-4" : "translate-x-0"
            )}
          />
        </span>
      </label>
    )
  }
)
Switch.displayName = "Switch"
