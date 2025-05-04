export default function Card({
	children,
	title,
	subtitle,
	headerAction,
	footer,
	className = "",
	...props
}) {
	return (
		<div
			className={`rounded-xl border border-gray-800 bg-gray-900 overflow-hidden ${className}`}
			{...props}
		>
			{(title || subtitle || headerAction) && (
				<div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
					<div>
						{title && (
							<h3 className="text-lg font-medium text-white">{title}</h3>
						)}
						{subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
					</div>
					{headerAction && <div className="flex-shrink-0">{headerAction}</div>}
				</div>
			)}

			<div className="p-4">{children}</div>

			{footer && (
				<div className="border-t border-gray-800 px-4 py-3">{footer}</div>
			)}
		</div>
	);
}
