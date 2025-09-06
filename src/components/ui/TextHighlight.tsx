'use client'

import { cn } from '@/lib/cn'

interface TextHighlightProps {
	children: React.ReactNode
	variant?: 'default' | 'light'
	className?: string
}

export default function TextHighlight({ 
	children, 
	variant = 'default', 
	className 
}: TextHighlightProps) {
	return (
		<span 
			className={cn(
				'highlight',
				variant === 'light' && 'highlight-light',
				className
			)}
		>
			{children}
		</span>
	)
}
