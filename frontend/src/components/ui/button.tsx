import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, ...props }, ref) => {
		return (
			<button
				className={cn(
					"bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50",
					className
				)}
				ref={ref}
				{...props}
			/>
		)
	}
)
Button.displayName = "Button"
