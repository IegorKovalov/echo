import { Eye, Lock, Mail, Sparkles, User, UserCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function SignupPage() {
	const { signup, loading } = useAuth();
	const { showSuccess, showError } = useToast();
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [formError, setFormError] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const handleChange = (e) => {
		const { id, value } = e.target;
		setFormData({
			...formData,
			[id]: value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setFormError("");

		// Validation
		if (
			!formData.firstName ||
			!formData.lastName ||
			!formData.email ||
			!formData.password ||
			!formData.confirmPassword ||
			!formData.username
		) {
			setFormError("Please fill in all fields");
			showError("Please fill in all fields");
			return;
		}

		if (formData.password.length < 8) {
			setFormError("Password must be at least 8 characters long");
			showError("Password must be at least 8 characters long");
			return;
		}

		if (formData.password !== formData.confirmPassword) {
			setFormError("Passwords do not match");
			showError("Passwords do not match");
			return;
		}
		try {
			const userData = {
				username: formData.username.toLocaleLowerCase(),
				email: formData.email,
				password: formData.password,
				passwordConfirm: formData.confirmPassword,
				fullName: `${formData.firstName} ${formData.lastName}`,
			};
			await signup(userData);
			showSuccess("Account created successfully! Welcome to Echo.");
		} catch (err) {
			const errorMessage = err.message || "Signup failed. Please try again.";
			setFormError(errorMessage);
			showError(errorMessage);
		}
	};

	return (
		<div className="flex min-h-screen flex-col md:flex-row bg-gray-950">
			{/* Left Column - Signup Form */}
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
						<h1 className="text-3xl font-bold text-white">Create an account</h1>
						<p className="text-gray-400">
							Join Echo and start sharing moments that matter
						</p>
					</div>

					{formError && (
						<div className="rounded-md bg-red-900/30 p-3 border border-red-900">
							<p className="text-sm text-red-400">{formError}</p>
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<label
									htmlFor="firstName"
									className="block text-sm font-medium text-gray-300"
								>
									First name
								</label>
								<div className="relative">
									<input
										id="firstName"
										placeholder="John"
										value={formData.firstName}
										onChange={handleChange}
										className="w-full rounded-md border border-gray-800 bg-gray-900 pl-10 pr-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
									/>
									<User className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
								</div>
							</div>
							<div className="space-y-2">
								<label
									htmlFor="lastName"
									className="block text-sm font-medium text-gray-300"
								>
									Last name
								</label>
								<div className="relative">
									<input
										id="lastName"
										placeholder="Doe"
										value={formData.lastName}
										onChange={handleChange}
										className="w-full rounded-md border border-gray-800 bg-gray-900 pl-10 pr-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
									/>
									<User className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
								</div>
							</div>
						</div>

						<div className="space-y-2">
							<label
								htmlFor="username"
								className="block text-sm font-medium text-gray-300"
							>
								User name
							</label>
							<div className="relative">
								<input
									id="username"
									placeholder="johndoe"
									type="text"
									value={formData.username}
									onChange={handleChange}
									className="w-full rounded-md border border-gray-800 bg-gray-900 pl-10 pr-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
								/>
								<UserCircle className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
							</div>
						</div>

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
									value={formData.email}
									onChange={handleChange}
									className="w-full rounded-md border border-gray-800 bg-gray-900 pl-10 pr-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
								/>
								<Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
							</div>
						</div>

						<div className="space-y-2">
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-300"
							>
								Password
							</label>
							<div className="relative">
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									value={formData.password}
									onChange={handleChange}
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
								Confirm password
							</label>
							<div className="relative">
								<input
									id="confirmPassword"
									type={showPassword ? "text" : "password"}
									value={formData.confirmPassword}
									onChange={handleChange}
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
							{loading ? "Creating Account..." : "Create Account"}
						</button>
					</form>

					<div className="text-center text-sm text-gray-400">
						Already have an account?{" "}
						<Link
							to="/login"
							className="font-medium text-purple-400 hover:text-purple-300"
						>
							Sign in
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
							<h2 className="text-3xl font-bold">Join the Echo community</h2>
							<p className="text-gray-400">
								Create an account and start sharing moments that matter, without
								the pressure of permanence.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
