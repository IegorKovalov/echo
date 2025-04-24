import React, { createContext, useContext, useState } from "react";
import { ToastContainer } from "react-bootstrap";
import CustomToast from "../components/common/CustomToast";

const ToastContext = createContext();

export function ToastProvider({ children }) {
	const [toasts, setToasts] = useState([]);

	const showToast = (message, type) => {
		const id = Date.now();
		setToasts((prev) => [...prev, { id, message, type }]);
		return id;
	};

	const removeToast = (id) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
	};

	return (
		<ToastContext.Provider value={{ showToast, removeToast }}>
			{children}

			<div aria-live="polite" aria-atomic="true" className="position-relative">
				<ToastContainer className="p-3">
					{toasts.map((toast) => (
						<CustomToast
							key={toast.id}
							message={toast.message}
							onClose={() => removeToast(toast.id)}
							toastType={toast.type}
						/>
					))}
				</ToastContainer>
			</div>
		</ToastContext.Provider>
	);
}

export function useToast() {
	return useContext(ToastContext);
}
