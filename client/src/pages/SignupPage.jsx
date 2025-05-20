import { Eye, Lock, Mail, Sparkles, User, UserCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useForm } from "../hooks/useForm";
import LoadingSpinner from "../components/UI/LoadingSpinner";

export default function SignupPage() {
	const { signup, loading: authLoading } = useAuth();
	const { showSuccess, showError } = useToast();
	const [showPassword, setShowPassword] = useState(false);

	const initialValues = {
		firstName: "",
		lastName: "",
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	};

	const validate = (values) => {
		const errors = {};
		if (!values.firstName) errors.firstName = "First name is required";
		if (!values.lastName) errors.lastName = "Last name is required";
		if (!values.username) {
			errors.username = "Username is required";
		} else if (values.username.length < 3) {
			errors.username = "Username must be at least 3 characters";
		}
		if (!values.email) {
			errors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(values.email)) {
			errors.email = "Email address is invalid";
		}
		if (!values.password) {
			errors.password = "Password is required";
		} else if (values.password.length < 8) {
			errors.password = "Password must be at least 8 characters long";
		}
		if (!values.confirmPassword) {
			errors.confirmPassword = "Confirm password is required";
		} else if (values.password !== values.confirmPassword) {
			errors.confirmPassword = "Passwords do not match";
		}
		return errors;
	};

	const handleSignupSubmit = async (values) => {
		try {
			const userData = {
				username: values.username.toLowerCase(),
				email: values.email,
				password: values.password,
				passwordConfirm: values.confirmPassword,
				fullName: `${values.firstName} ${values.lastName}`,
			};
			await signup(userData);
		} catch (err) {
			throw err;
		}
	};

	const form = useForm({
		initialValues,
		validate,
		onSubmit: handleSignupSubmit,
	});

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

					{form.submitError && (
						<div className="rounded-md bg-red-900/30 p-3 border border-red-900">
							<p className="text-sm text-red-400">{form.submitError}</p>
						</div>
					)}

					<form onSubmit={form.handleSubmit} className="space-y-4">
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
										name="firstName"
										placeholder="John"
										value={form.values.firstName}
										onChange={form.handleChange}
										className={`w-full rounded-md border ${form.errors.firstName ? 'border-red-500' : 'border-gray-800'} bg-gray-900 pl-10 pr-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`}
									/>
									<User className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
								</div>
								{form.errors.firstName && (
									<p className="text-xs text-red-400 mt-1">{form.errors.firstName}</p>
								)}
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
										name="lastName"
										placeholder="Doe"
										value={form.values.lastName}
										onChange={form.handleChange}
										className={`w-full rounded-md border ${form.errors.lastName ? 'border-red-500' : 'border-gray-800'} bg-gray-900 pl-10 pr-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`}
									/>
									<User className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
								</div>
								{form.errors.lastName && (
									<p className="text-xs text-red-400 mt-1">{form.errors.lastName}</p>
								)}
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
									name="username"
									placeholder="johndoe"
									type="text"
									value={form.values.username}
									onChange={form.handleChange}
									className={`w-full rounded-md border ${form.errors.username ? 'border-red-500' : 'border-gray-800'} bg-gray-900 pl-10 pr-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`}
								/>
								<UserCircle className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
							</div>
							{form.errors.username && (
								<p className="text-xs text-red-400 mt-1">{form.errors.username}</p>
							)}
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
									name="email"
									placeholder="hello@example.com"
									type="email"
									value={form.values.email}
									onChange={form.handleChange}
									className={`w-full rounded-md border ${form.errors.email ? 'border-red-500' : 'border-gray-800'} bg-gray-900 pl-10 pr-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`}
								/>
								<Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
							</div>
							{form.errors.email && (
								<p className="text-xs text-red-400 mt-1">{form.errors.email}</p>
							)}
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
									name="password"
									type={showPassword ? "text" : "password"}
									value={form.values.password}
									onChange={form.handleChange}
									className={`w-full rounded-md border ${form.errors.password ? 'border-red-500' : 'border-gray-800'} bg-gray-900 pl-10 pr-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`}
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
							{form.errors.password ? (
								<p className="text-xs text-red-400 mt-1">{form.errors.password}</p>
							) : (
								<p className="text-xs text-gray-500">
									Password must be at least 8 characters long
								</p>
							)}
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
									name="confirmPassword"
									type={showPassword ? "text" : "password"}
									value={form.values.confirmPassword}
									onChange={form.handleChange}
									className={`w-full rounded-md border ${form.errors.confirmPassword ? 'border-red-500' : 'border-gray-800'} bg-gray-900 pl-10 pr-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`}
								/>
								<Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
							</div>
							{form.errors.confirmPassword && (
								<p className="text-xs text-red-400 mt-1">{form.errors.confirmPassword}</p>
							)}
						</div>

						<button
							type="submit"
							disabled={authLoading || form.isSubmitting}
							className="w-full rounded-md bg-gradient-to-r from-purple-600 to-blue-600 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-70"
						>
							{authLoading || form.isSubmitting ? "Creating Account..." : "Create Account"}
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
