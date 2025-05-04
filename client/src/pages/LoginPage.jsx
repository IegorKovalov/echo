import { Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
	const { login, error, loading } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [formError, setFormError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setFormError("");

		if (!email || !password) {
			setFormError("Please enter both email and password");
			return;
		}

		try {
			await login(email, password);
			// Redirect is handled in the auth context
		} catch (err) {
			setFormError(err.message || "Login failed. Please try again.");
		}
	};

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

					{formError && (
						<div className="rounded-md bg-red-900/30 p-3 border border-red-900">
							<p className="text-sm text-red-400">{formError}</p>
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-300"
							>
								Email
							</label>
							<input
								id="email"
								placeholder="hello@example.com"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full rounded-md border border-gray-800 bg-gray-900 px-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
							/>
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
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full rounded-md border border-gray-800 bg-gray-900 px-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
							/>
						</div>
						<button
							type="submit"
							disabled={loading}
							className="w-full rounded-md bg-gradient-to-r from-purple-600 to-blue-600 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-70"
						>
							{loading ? "Signing In..." : "Sign In"}
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
