import React from "react";

const FormField = ({
	id,
	name,
	type = "text",
	label,
	value,
	onChange,
	placeholder,
	error,
	onBlur = null,
	autoComplete = "on",
	required = false,
}) => {
	return (
		<div className="form-field">
			<label htmlFor={id} className="form-label">
				{label}
				{required && <span className="text-red-500 ml-1">*</span>}
			</label>
			<input
				type={type}
				id={id}
				name={name}
				value={value}
				onChange={onChange}
				onBlur={onBlur}
				placeholder={placeholder}
				autoComplete={autoComplete}
				className="form-input"
				required={required}
			/>
			{error && <div className="form-error">{error}</div>}
		</div>
	);
};

export default FormField;
