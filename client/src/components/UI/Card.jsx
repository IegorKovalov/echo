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
			className={`rounded-xl border border-gray-800 bg-gray-900 overflow-hidden shadow-md shadow-black/20 backdrop-blur-sm transition-all hover:shadow-lg hover:shadow-black/30 hover:border-gray-700/80 ${className}`}
			{...props}
		>
			{(title || subtitle || headerAction) && (
				<div className="flex items-center justify-between border-b border-gray-800 px-5 py-3.5">
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
				<div className="border-t border-gray-800 px-5 py-3.5 bg-gray-900/50">{footer}</div>
			)}
		</div>
	);
}
