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
		<div className="form-group">
			<label htmlFor={id}>
				{label}
				{required && <span className="required">*</span>}
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
				className={error ? "error-input" : ""}
			/>
			{error && <div className="error">{error}</div>}
		</div>
	);
};

export default FormField;
