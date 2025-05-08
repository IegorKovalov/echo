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
	// Common toast styles that use the design system
	const baseToastStyle = {
		background: "hsl(var(--card))",
		color: "hsl(var(--card-foreground))",
		border: "1px solid hsl(var(--border))",
		borderRadius: "var(--radius)",
		padding: "12px 16px",
		maxWidth: "350px",
		boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
	};

	// Success toast notification
	const showSuccess = (message) => {
		toast.success(message, {
			duration: 4000,
			style: {
				...baseToastStyle,
				borderLeft: "4px solid hsl(var(--primary))",
			},
			iconTheme: {
				primary: "hsl(var(--primary))",
				secondary: "hsl(var(--background))",
			},
		});
	};

	// Error toast notification
	const showError = (message) => {
		toast.error(message, {
			duration: 5000,
			style: {
				...baseToastStyle,
				borderLeft: "4px solid hsl(var(--destructive))",
			},
			iconTheme: {
				primary: "hsl(var(--destructive))",
				secondary: "hsl(var(--background))",
			},
		});
	};

	// Info toast notification
	const showInfo = (message) => {
		toast(message, {
			duration: 3000,
			style: {
				...baseToastStyle,
				borderLeft: "4px solid hsl(var(--accent))",
			},
			// Replace the emoji with a custom icon style
			icon: (
				<div
					style={{
						width: "20px",
						height: "20px",
						borderRadius: "50%",
						background: "hsl(var(--accent))",
						color: "hsl(var(--accent-foreground))",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontSize: "14px",
						fontWeight: "bold",
					}}
				>
					i
				</div>
			),
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
			style: baseToastStyle,
			success: {
				duration: 4000,
				style: {
					...baseToastStyle,
					borderLeft: "4px solid hsl(var(--primary))",
				},
				iconTheme: {
					primary: "hsl(var(--primary))",
					secondary: "hsl(var(--background))",
				},
			},
			error: {
				duration: 5000,
				style: {
					...baseToastStyle,
					borderLeft: "4px solid hsl(var(--destructive))",
				},
				iconTheme: {
					primary: "hsl(var(--destructive))",
					secondary: "hsl(var(--background))",
				},
			},
			loading: {
				style: {
					...baseToastStyle,
					borderLeft: "4px solid hsl(var(--muted))",
				},
				iconTheme: {
					primary: "hsl(var(--muted-foreground))",
					secondary: "hsl(var(--background))",
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
					style: baseToastStyle,
				}}
			/>
		</ToastContext.Provider>
	);
};
