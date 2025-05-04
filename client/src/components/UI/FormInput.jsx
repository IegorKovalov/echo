import { forwardRef } from "react";

const FormInput = forwardRef(
	(
		{
			id,
			name,
			label,
			type = "text",
			placeholder,
			value,
			onChange,
			onBlur,
			error,
			icon,
			disabled = false,
			required = false,
			className = "",
			...props
		},
		ref
	) => {
		return (
			<div className="space-y-2">
				{label && (
					<label
						htmlFor={id}
						className="block text-sm font-medium text-gray-300"
					>
						{label}
						{required && <span className="ml-1 text-red-400">*</span>}
					</label>
				)}

				<div className="relative">
					{icon && (
						<span className="absolute left-3 top-2.5 text-gray-500">
							{icon}
						</span>
					)}

					<input
						ref={ref}
						id={id}
						name={name}
						type={type}
						placeholder={placeholder}
						value={value}
						onChange={onChange}
						onBlur={onBlur}
						disabled={disabled}
						required={required}
						className={`
            w-full rounded-md border border-gray-800 
            ${icon ? "pl-10" : "pl-3"} pr-3 py-2
            ${
							disabled
								? "bg-gray-900 opacity-60 cursor-not-allowed"
								: "bg-gray-800"
						} 
            text-white placeholder-gray-500
            focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500
            ${
							error
								? "border-red-800 focus:border-red-800 focus:ring-red-800"
								: ""
						}
            ${className}
          `}
						{...props}
					/>
				</div>

				{error && <p className="text-sm text-red-400">{error}</p>}
			</div>
		);
	}
);

FormInput.displayName = "FormInput";

export default FormInput;
