import { CheckCircle, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function SuccessPage() {
	const location = useLocation();
	const {
		title = "Success!",
		message = "Your password has been successfully reset.",
	} = location.state || {};

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
						<div className="flex justify-center my-6">
							<div className="rounded-full bg-green-600/20 p-3">
								<CheckCircle className="h-12 w-12 text-green-500" />
							</div>
						</div>
						<h1 className="text-3xl font-bold text-white">{title}</h1>
						<p className="text-gray-400">{message}</p>
					</div>

					<div className="space-y-4">
						<Link
							to="/login"
							className="block w-full rounded-md bg-gradient-to-r from-purple-600 to-blue-600 py-2 text-center text-sm font-medium text-white hover:from-purple-700 hover:to-blue-700"
						>
							Continue to Login
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
