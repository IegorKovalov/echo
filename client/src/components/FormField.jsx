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
		<div>
			<label htmlFor={id}>
				{label}
				{required && <span>*</span>}
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
			/>
			{error && <div>{error}</div>}
		</div>
	);
};

export default FormField;
