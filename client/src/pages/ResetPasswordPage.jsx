import { ArrowLeft, Eye, Lock, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function ResetPasswordPage() {
	const { token } = useParams();
	const { resetPassword, loading } = useAuth();
	const { showSuccess, showError } = useToast();
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [formError, setFormError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setFormError("");

		if (!password || !confirmPassword) {
			setFormError("Please enter both password fields");
			showError("Please enter both password fields");
			return;
		}

		if (password.length < 8) {
			setFormError("Password must be at least 8 characters long");
			showError("Password must be at least 8 characters long");
			return;
		}

		if (password !== confirmPassword) {
			setFormError("Passwords do not match");
			showError("Passwords do not match");
			return;
		}

		try {
			await resetPassword(token, password, confirmPassword);
			showSuccess(
				"Password reset successful! You can now login with your new password."
			);
			// Redirect is handled in AuthContext
		} catch (err) {
			const errorMessage =
				err.message || "Password reset failed. Please try again.";
			setFormError(errorMessage);
			showError(errorMessage);
		}
	};

	return (
		<div className="flex min-h-screen flex-col bg-gray-950">
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
						<h1 className="text-3xl font-bold text-white">Reset password</h1>
						<p className="text-gray-400">
							Create a new password for your account
						</p>
					</div>

					{formError && (
						<div className="rounded-md bg-red-900/30 p-3 border border-red-900">
							<p className="text-sm text-red-400">{formError}</p>
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-300"
							>
								New password
							</label>
							<div className="relative">
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="w-full rounded-md border border-gray-800 bg-gray-900 pl-10 pr-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
								/>
								<Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
								<button
									type="button"
									className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-300"
									onClick={() => setShowPassword(!showPassword)}
								>
									<Eye className="h-4 w-4" />
									<span className="sr-only">Show password</span>
								</button>
							</div>
							<p className="text-xs text-gray-500">
								Password must be at least 8 characters long
							</p>
						</div>

						<div className="space-y-2">
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-gray-300"
							>
								Confirm new password
							</label>
							<div className="relative">
								<input
									id="confirmPassword"
									type={showPassword ? "text" : "password"}
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className="w-full rounded-md border border-gray-800 bg-gray-900 pl-10 pr-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
								/>
								<Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
							</div>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full rounded-md bg-gradient-to-r from-purple-600 to-blue-600 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-70"
						>
							{loading ? "Resetting Password..." : "Reset Password"}
						</button>
					</form>

					<div className="text-center">
						<Link
							to="/login"
							className="inline-flex items-center text-sm text-purple-400 hover:text-purple-300"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to login
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
