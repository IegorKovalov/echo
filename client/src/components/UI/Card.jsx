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
			className={`rounded-xl border border-gray-800/30 bg-gray-900/60 backdrop-blur-md shadow-lg ${className}`}
			{...props}
		>
			{(title || subtitle || headerAction) && (
				<div className="flex items-center justify-between border-b border-gray-800/20 px-5 py-4">
					<div>
						{title && (
							<h3 className="text-lg font-medium text-white tracking-tight">{title}</h3>
						)}
						{subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
					</div>
					{headerAction && <div className="flex-shrink-0">{headerAction}</div>}
				</div>
			)}

			<div className="p-5">{children}</div>

			{footer && (
				<div className="border-t border-gray-800/20 px-5 py-4 bg-gray-950/30">{footer}</div>
			)}
		</div>
	);
}
