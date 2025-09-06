import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={cn(
          "mt-1 p-2 rounded bg-gray-900 border border-gray-700 w-full text-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50",
          "bg-white text-black border-gray-300 dark:bg-gray-900 dark:text-white",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"
