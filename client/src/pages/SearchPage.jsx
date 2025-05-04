import { Search, Sparkles, User, Users } from "lucide-react";
import { useState } from "react";
import Card from "../components/UI/Card";
import { useAuth } from "../context/AuthContext";

export default function SearchPage() {
	const { user, loading } = useAuth();
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [searching, setSearching] = useState(false);

	// This is a placeholder function that will be replaced with actual search logic later
	const handleSearch = (e) => {
		e.preventDefault();
		setSearching(true);

		// Simulate search delay
		setTimeout(() => {
			// Just a placeholder result
			setSearchResults([]);
			setSearching(false);
		}, 1000);
	};

	// If still loading, show loading state
	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-950">
				<div className="text-center">
					<Sparkles className="mx-auto h-12 w-12 animate-pulse text-purple-500" />
					<p className="mt-4 text-gray-400">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col bg-gradient-to-b from-gray-900 to-gray-950">
			<main className="flex-1">
				<div className="container px-4 py-6 max-w-4xl mx-auto">
					<h1 className="text-2xl font-bold text-white mb-6">Search</h1>

					{/* Search Form */}
					<div className="mb-8">
						<form onSubmit={handleSearch} className="flex gap-2">
							<div className="relative flex-1">
								<input
									type="text"
									placeholder="Search for users, posts, or topics..."
									className="w-full rounded-lg border border-gray-700 bg-gray-800 pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
							</div>
							<button
								type="submit"
								className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
								disabled={searching || !searchQuery.trim()}
							>
								{searching ? "Searching..." : "Search"}
							</button>
						</form>
						<p className="text-sm text-gray-400 mt-2">
							This is a placeholder. Actual search functionality will be
							implemented later.
						</p>
					</div>

					{/* Search Results */}
					<div className="space-y-4">
						{searching ? (
							<div className="text-center py-10">
								<Sparkles className="mx-auto h-8 w-8 animate-pulse text-purple-500" />
								<p className="mt-2 text-gray-400">Searching...</p>
							</div>
						) : searchQuery && searchResults.length === 0 ? (
							<Card>
								<div className="p-8 text-center">
									<div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-800 p-4">
										<Users className="h-8 w-8 text-gray-600" />
									</div>
									<h3 className="text-lg font-medium text-white">
										No results found
									</h3>
									<p className="mt-2 text-gray-400">
										No matches found for "{searchQuery}". Try different
										keywords.
									</p>
								</div>
							</Card>
						) : searchQuery ? (
							<Card>
								<div className="p-8 text-center">
									<div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-800 p-4">
										<User className="h-8 w-8 text-gray-600" />
									</div>
									<h3 className="text-lg font-medium text-white">
										Search is a placeholder
									</h3>
									<p className="mt-2 text-gray-400">
										Search functionality will be implemented in a future update.
									</p>
								</div>
							</Card>
						) : null}
					</div>
				</div>
			</main>
		</div>
	);
}
