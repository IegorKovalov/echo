import { ArrowLeft, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
	return (
		<div className="flex flex-col min-h-screen items-center justify-center bg-gray-950 px-4 text-center">
			<div className="w-full max-w-md space-y-8 rounded-xl border border-gray-800/50 bg-gray-900/40 backdrop-blur-sm p-10 shadow-xl">
				<div className="flex justify-center">
					<div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-5 flex items-center justify-center">
						<Sparkles className="h-10 w-10 text-purple-500" />
					</div>
				</div>
				
				<div className="space-y-2">
					<h1 className="text-4xl font-bold text-white">404</h1>
					<h2 className="text-xl font-semibold text-gray-200">
						Page not found
					</h2>
					<p className="text-gray-400 mt-2">
						The page you're looking for doesn't exist or has been moved.
					</p>
				</div>

				<div className="flex flex-row gap-4">
					<Link
						to="/"
						className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 text-center font-medium text-white hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all duration-200 shadow-md shadow-purple-900/20"
					>
						<ArrowLeft className="h-5 w-5" />
						Back to home
					</Link>
					<Link
						to="/search"
						className="flex items-center justify-center gap-2 rounded-lg border border-gray-800/80 bg-gray-900/50 px-6 py-3 text-center font-medium text-white hover:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all duration-200"
					>
						<Search className="h-5 w-5" />
						Search for content
					</Link>
				</div>
			</div>
		</div>
	);
}
