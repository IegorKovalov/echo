import { CheckIcon, InfoIcon, LoaderIcon, XIcon } from "lucide-react";
import React, { createContext, useContext } from "react";
import toast, { Toaster } from "react-hot-toast";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
	const baseToastStyle = {
		background: "hsl(var(--card))",
		color: "hsl(var(--card-foreground))",
		border: "1px solid hsl(var(--border))",
		borderRadius: "var(--radius)",
		padding: "12px 16px",
		maxWidth: "350px",
		boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
	};

	const showSuccess = (message) => {
		toast.custom(
			(t) => (
				<div
					className={`${t.visible ? "animate-enter" : "animate-leave"}`}
					style={{
						...baseToastStyle,
						display: "flex",
						alignItems: "center",
						gap: "8px",
					}}
				>
					<CheckIcon size={18} color="hsl(var(--primary))" />
					<span>{message}</span>
				</div>
			),
			{ duration: 4000 }
		);
	};

	const showError = (message) => {
		toast.custom(
			(t) => (
				<div
					className={`${t.visible ? "animate-enter" : "animate-leave"}`}
					style={{
						...baseToastStyle,
						display: "flex",
						alignItems: "center",
						gap: "8px",
					}}
				>
					<XIcon size={18} color="hsl(var(--destructive))" />
					<span>{message}</span>
				</div>
			),
			{ duration: 5000 }
		);
	};

	const showInfo = (message) => {
		toast(message, {
			duration: 3000,
			style: baseToastStyle,
			icon: <InfoIcon size={18} color="hsl(var(--accent-foreground))" />,
		});
	};

	const showLoading = (promise, options) => {
		const opts = options || {};

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
			style: baseToastStyle,
			icon: <LoaderIcon size={18} className="animate-spin" />,
			success: {
				duration: 4000,
				style: baseToastStyle,
				icon: <CheckIcon size={18} />,
				iconTheme: {
					primary: "hsl(var(--primary))",
					secondary: "hsl(var(--background))",
				},
			},
			error: {
				duration: 5000,
				style: baseToastStyle,
				icon: <XIcon size={18} />,
				iconTheme: {
					primary: "hsl(var(--destructive))",
					secondary: "hsl(var(--background))",
				},
			},
			loading: {
				style: baseToastStyle,
				icon: <LoaderIcon size={18} className="animate-spin" />,
				iconTheme: {
					primary: "hsl(var(--muted-foreground))",
					secondary: "hsl(var(--background))",
				},
			},
			position: "bottom-right",
		});
	};

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
