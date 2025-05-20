import { Sparkles } from "lucide-react";
// import { useState } from "react"; // No longer needed for form fields
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useForm } from "../hooks/useForm"; // Import useForm
import LoadingSpinner from "../components/UI/LoadingSpinner"; // Added

export default function LoginPage() {
	const { login, loading: authLoading } = useAuth(); // Renamed, use this for top-level spinner
	const { showSuccess, showError } = useToast();

	const initialValues = {
		email: "",
		password: "",
	};

	const validate = (values) => {
		const errors = {};
		if (!values.email) {
			errors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(values.email)) {
			errors.email = "Email address is invalid";
		}
		if (!values.password) {
			errors.password = "Password is required";
		}
		return errors;
	};

	const handleLoginSubmit = async (values) => {
		try {
			await login(values.email, values.password);
			showSuccess("Login successful! Welcome back.");
			// Redirect is handled in the auth context
		} catch (err) {
			// Errors from login (e.g., wrong credentials) will be caught by useForm's submitError
			// We can also use showError for a toast if desired, but submitError handles general form error display
			// showError(err.message || "Login failed. Please try again.");
			throw err; // Re-throw to allow useForm to catch it and set submitError
		}
	};

	const form = useForm({
		initialValues,
		validate,
		onSubmit: handleLoginSubmit,
	});

	// Display API error as a toast if it occurs, in addition to inline form error
	// This is an alternative to the old formError state + toast duplication
	// We can rely on the form.submitError for the inline display and AuthContext's own error handling for toasts if preferred.
	// For now, let's use the toast for API errors for consistency with previous behavior.
	// useEffect(() => {
	//  if (form.submitError) {
	//    showError(form.submitError);
	//  }
	// }, [form.submitError, showError]);

	// Top-level loading spinner for initial auth check
	if (authLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-950">
				<LoadingSpinner />
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col md:flex-row bg-gray-950">
			{/* Left Column - Login Form */}
			<div className="flex flex-1 items-center justify-center p-6 md:p-10">
				<div className="w-full max-w-md space-y-8">
					<div className="space-y-2 text-center">
						<div className="flex justify-center">
							<div className="flex items-center gap-2">
								<Sparkles className="h-8 w-8 text-purple-500" />
								<span className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
									Echo
								</span>
							</div>
						</div>
						<h1 className="text-3xl font-bold text-white">Welcome back</h1>
						<p className="text-gray-400">
							Sign in to continue sharing moments that fade away
						</p>
					</div>

					{/* Display general submission error from useForm */}
					{form.submitError && (
						<div className="rounded-md bg-red-900/30 p-3 border border-red-900">
							<p className="text-sm text-red-400">{form.submitError}</p>
						</div>
					)}

					<form onSubmit={form.handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-300"
							>
								Email
							</label>
							<input
								id="email"
								name="email" // Ensure name attribute is present
								placeholder="hello@example.com"
								type="email"
								value={form.values.email}
								onChange={form.handleChange}
								className={`w-full rounded-md border ${form.errors.email ? 'border-red-500' : 'border-gray-800'} bg-gray-900 px-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`}
							/>
							{form.errors.email && (
								<p className="text-xs text-red-400 mt-1">{form.errors.email}</p>
							)}
						</div>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<label
									htmlFor="password"
									className="block text-sm font-medium text-gray-300"
								>
									Password
								</label>
								<Link
									to="/forgot-password"
									className="text-sm text-purple-400 hover:text-purple-300"
								>
									Forgot password?
								</Link>
							</div>
							<input
								id="password"
								name="password" // Ensure name attribute is present
								type="password"
								value={form.values.password}
								onChange={form.handleChange}
								className={`w-full rounded-md border ${form.errors.password ? 'border-red-500' : 'border-gray-800'} bg-gray-900 px-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`}
							/>
							{form.errors.password && (
								<p className="text-xs text-red-400 mt-1">{form.errors.password}</p>
							)}
						</div>
						<button
							type="submit"
							disabled={authLoading || form.isSubmitting} // Keep authLoading here for button state too
							className="w-full rounded-md bg-gradient-to-r from-purple-600 to-blue-600 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-70"
						>
							{authLoading || form.isSubmitting ? "Signing In..." : "Sign In"}
						</button>
					</form>

					<div className="text-center text-sm text-gray-400">
						Don&apos;t have an account?{" "}
						<Link
							to="/signup"
							className="font-medium text-purple-400 hover:text-purple-300"
						>
							Sign up
						</Link>
					</div>
				</div>
			</div>

			{/* Right Column - Hero Image */}
			<div className="hidden flex-1 bg-gradient-to-br from-gray-900 to-black md:block relative overflow-hidden">
				<div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=800')] opacity-10 bg-cover bg-center"></div>
				<div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20"></div>
				<div className="relative flex h-full flex-col items-center justify-center p-10 text-white">
					<div className="max-w-md space-y-6">
						<div className="space-y-2 text-center">
							<h2 className="text-3xl font-bold">
								Share moments that fade away
							</h2>
							<p className="text-gray-400">
								Echo lets you share authentic moments without the pressure of
								permanence. Your posts, voice notes, and interactions disappear
								after a set time.
							</p>
						</div>

						<div className="space-y-4">
							<div className="flex items-center gap-3 bg-gray-900/50 p-4 rounded-lg backdrop-blur-sm">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600/20">
									<Sparkles className="h-5 w-5 text-purple-400" />
								</div>
								<div>
									<h3 className="font-medium text-white">Ephemeral Content</h3>
									<p className="text-sm text-gray-400">
										All posts auto-delete after your chosen timeframe
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
