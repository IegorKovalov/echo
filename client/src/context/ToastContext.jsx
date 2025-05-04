import React, { createContext, useContext } from "react";
import toast, { Toaster } from "react-hot-toast";

// Create the toast context
const ToastContext = createContext();

/**
 * Custom hook to use the toast context
 */
export const useToast = () => useContext(ToastContext);

/**
 * Toast provider component that makes toast functions available throughout the app
 */
export const ToastProvider = ({ children }) => {
	// Success toast notification
	const showSuccess = (message) => {
		toast.success(message, {
			duration: 4000,
			style: {
				background: "rgba(15, 23, 42, 0.9)",
				color: "#10b981",
				border: "1px solid rgba(16, 185, 129, 0.2)",
			},
			iconTheme: {
				primary: "#10b981",
				secondary: "#0f172a",
			},
		});
	};

	// Error toast notification
	const showError = (message) => {
		toast.error(message, {
			duration: 5000,
			style: {
				background: "rgba(15, 23, 42, 0.9)",
				color: "#ef4444",
				border: "1px solid rgba(239, 68, 68, 0.2)",
			},
			iconTheme: {
				primary: "#ef4444",
				secondary: "#0f172a",
			},
		});
	};

	// Info toast notification
	const showInfo = (message) => {
		toast(message, {
			duration: 3000,
			style: {
				background: "rgba(15, 23, 42, 0.9)",
				color: "#3b82f6",
				border: "1px solid rgba(59, 130, 246, 0.2)",
			},
			icon: "ℹ️",
		});
	};

	// Loading toast notification with promise
	const showLoading = (promise, options) => {
		// Ensure that options is an object
		const opts = options || {};

		// Ensure all messages are strings
		const messages = {
			loading: typeof opts.loading === "string" ? opts.loading : "Loading...",
			success:
				typeof opts.success === "string"
					? opts.success
					: "Completed successfully!",
			error:
				typeof opts.error === "string" ? opts.error : "Something went wrong",
		};

		return toast.promise(promise, messages, {
			// Common styling options
			style: {
				background: "rgba(15, 23, 42, 0.9)",
				color: "#e2e8f0",
				border: "1px solid rgba(30, 41, 59, 0.5)",
			},
			success: {
				duration: 4000,
				iconTheme: {
					primary: "#10b981",
					secondary: "#0f172a",
				},
			},
			error: {
				duration: 5000,
				iconTheme: {
					primary: "#ef4444",
					secondary: "#0f172a",
				},
			},
			position: "bottom-right",
		});
	};

	// Provide all toast functions to components in the app
	return (
		<ToastContext.Provider
			value={{
				showSuccess,
				showError,
				showInfo,
				showLoading,
			}}
		>
			{children}
			<Toaster
				position="bottom-right"
				toastOptions={{
					duration: 4000,
					style: {
						background: "rgba(15, 23, 42, 0.9)",
						color: "#e2e8f0",
						border: "1px solid rgba(30, 41, 59, 0.5)",
						maxWidth: "350px",
						padding: "12px 16px",
					},
				}}
			/>
		</ToastContext.Provider>
	);
};
