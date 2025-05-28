import { ArrowLeft, Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useForm } from "../hooks/useForm";
import LoadingSpinner from "../components/UI/LoadingSpinner";

export default function ForgotPasswordPage() {
	const { forgotPassword, loading: authLoading } = useAuth();
	const { showSuccess, showError } = useToast();
	const [email, setEmail] = useState("");
	const [formError, setFormError] = useState("");
	const [submitted, setSubmitted] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setFormError("");

		if (!email) {
			setFormError("Please enter your email address");
			showError("Please enter your email address");
			return;
		}

		try {
			await forgotPassword(email);
			showSuccess("Reset link sent! Check your email for instructions.");
			setSubmitted(true);
		} catch (err) {
			const errorMessage =
				err.message || "Failed to send reset email. Please try again.";
			setFormError(errorMessage);
			showError(errorMessage);
		}
	};

	if (authLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-950">
				<LoadingSpinner />
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col bg-gray-950">
			<div className="flex flex-1 items-center justify-center p-10">
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
						<h1 className="text-3xl font-bold text-white">Forgot password</h1>
						<p className="text-gray-400">
							Enter your email to receive a password reset link
						</p>
					</div>

					{formError && (
						<div className="rounded-md bg-red-900/30 p-3 border border-red-900">
							<p className="text-sm text-red-400">{formError}</p>
						</div>
					)}

					{submitted ? (
						<div className="space-y-4">
							<div className="rounded-lg bg-green-900/30 p-4 border border-green-900">
								<p className="text-sm text-green-400">
									Reset link sent! Check your email at{" "}
									<span className="font-semibold">{email}</span> for
									instructions to reset your password.
								</p>
							</div>
							<Link
								to="/login"
								className="block w-full rounded-md bg-gradient-to-r from-purple-600 to-blue-600 py-2 text-center text-sm font-medium text-white hover:from-purple-700 hover:to-blue-700"
							>
								Return to Login
							</Link>
						</div>
					) : (
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<label
									htmlFor="email"
									className="block text-sm font-medium text-gray-300"
								>
									Email
								</label>
								<div className="relative">
									<input
										id="email"
										placeholder="hello@example.com"
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="w-full rounded-md border border-gray-800 bg-gray-900 pl-10 pr-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
									/>
									<Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
								</div>
							</div>

							<button
								type="submit"
								disabled={authLoading || form.isSubmitting}
								className="w-full rounded-md bg-gradient-to-r from-purple-600 to-blue-600 py-2.5 text-sm font-medium text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-70"
							>
								{authLoading || form.isSubmitting ? "Sending..." : "Send Reset Link"}
							</button>
						</form>
					)}

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
