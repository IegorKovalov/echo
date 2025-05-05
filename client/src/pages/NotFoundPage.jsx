import { ArrowLeft, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
	return (
		<div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-gray-950 px-4 text-center">
			<Sparkles className="h-16 w-16 text-purple-500 mb-6" />
			<h1 className="text-4xl font-bold text-white mb-4">404</h1>
			<h2 className="text-2xl font-semibold text-gray-200 mb-6">
				Page not found
			</h2>
			<p className="text-gray-400 max-w-md mb-8">
				The page you're looking for doesn't exist or has been moved.
			</p>

			<div className="flex flex-col sm:flex-row gap-4 mb-8">
				<Link
					to="/"
					className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-center font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500/20"
				>
					<ArrowLeft className="h-5 w-5" />
					Back to home
				</Link>
				<Link
					to="/search"
					className="flex items-center justify-center gap-2 rounded-lg bg-gray-800 px-6 py-3 text-center font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-500/20"
				>
					<Search className="h-5 w-5" />
					Search for content
				</Link>
			</div>
		</div>
	);
}
