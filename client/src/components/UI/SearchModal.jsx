import { Search, Sparkles, User, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Card from "./Card";

export default function SearchModal({ isOpen, onClose, anchorRect }) {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [searching, setSearching] = useState(false);
	const modalRef = useRef(null);
	const inputRef = useRef(null);

	// Focus the search input when the modal opens
	useEffect(() => {
		if (isOpen && inputRef.current) {
			setTimeout(() => {
				inputRef.current.focus();
			}, 100);
		}
	}, [isOpen]);

	// Close the modal when clicking outside
	useEffect(() => {
		function handleClickOutside(event) {
			if (modalRef.current && !modalRef.current.contains(event.target)) {
				onClose();
			}
		}

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, onClose]);

	// Close on escape key
	useEffect(() => {
		const handleEsc = (event) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEsc);
		}
		return () => {
			document.removeEventListener("keydown", handleEsc);
		};
	}, [isOpen, onClose]);

	// This is a placeholder function that will be replaced with actual search logic later
	const handleSearch = (e) => {
		e.preventDefault();
		if (!searchQuery.trim()) return;

		setSearching(true);

		// Simulate search delay
		setTimeout(() => {
			// Just a placeholder result
			setSearchResults([]);
			setSearching(false);
		}, 1000);
	};

	if (!isOpen) return null;

	// Position the search bubble relative to the navbar button
	const style = anchorRect
		? {
				position: "fixed",
				top: `${anchorRect.bottom + 12}px`,
				left: "50%",
				transform: "translateX(-50%)",
				zIndex: 100,
				maxWidth: "500px",
				width: "90%",
		  }
		: {};

	return (
		<>
			<div
				className="fixed inset-0 z-40 bg-transparent"
				onClick={onClose}
			></div>
			<div
				ref={modalRef}
				className="rounded-xl border border-gray-800/50 bg-gray-900/90 backdrop-blur-sm shadow-xl transform transition-all duration-200 ease-out z-50"
				style={{
					...style,
					boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4)",
				}}
			>
				{/* Small decorative arrow pointing up to navbar */}
				<div
					className="absolute w-4 h-4 bg-gray-900/90 backdrop-blur-sm border-t border-l border-gray-800/50 transform rotate-45 -translate-y-2"
					style={{
						top: "0",
						left: "50%",
						marginLeft: "-8px",
					}}
				></div>

				<div className="p-5">
					{/* Search Form */}
					<form onSubmit={handleSearch} className="flex gap-2 mb-4">
						<div className="relative flex-1">
							<input
								ref={inputRef}
								type="text"
								placeholder="Search for users, posts, or topics..."
								className="w-full rounded-lg border border-gray-800/80 bg-gray-900/50 pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors duration-200"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
						</div>
						<button
							type="submit"
							className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:ring-offset-1 focus:ring-offset-gray-900 shadow-md shadow-purple-900/10 transition-all duration-200"
							disabled={searching || !searchQuery.trim()}
						>
							{searching ? "Searching..." : "Search"}
						</button>
					</form>

					<p className="text-xs text-gray-400 mb-3">
						This is a placeholder. Search functionality will be implemented
						later.
					</p>

					{/* Search Results */}
					<div
						className="max-h-80 overflow-y-auto"
						style={{ minHeight: searchQuery ? "100px" : "0" }}
					>
						{searching ? (
							<div className="text-center py-8">
								<Sparkles className="mx-auto h-6 w-6 animate-pulse text-purple-500" />
								<p className="mt-3 text-sm text-gray-300">Searching...</p>
							</div>
						) : searchQuery && searchResults.length === 0 ? (
							<div className="rounded-lg bg-gray-900/50 border border-gray-800/50 p-5 text-center shadow-md">
								<div className="mx-auto mb-3 h-12 w-12 rounded-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-3 flex items-center justify-center">
									<Users className="h-6 w-6 text-gray-500" />
								</div>
								<h3 className="text-sm font-medium text-white">
									No results found
								</h3>
								<p className="mt-2 text-xs text-gray-400">
									No matches for "{searchQuery}"
								</p>
							</div>
						) : searchQuery ? (
							<div className="space-y-3">
								<div className="p-3 flex items-center gap-3 rounded-lg border border-gray-800/50 bg-gray-900/40 hover:bg-gray-800/30 transition-colors duration-200">
									<div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-700/30 to-blue-700/30 flex items-center justify-center shadow-md">
										<User className="h-5 w-5 text-gray-300" />
									</div>
									<div>
										<h4 className="font-medium text-white">User Name</h4>
										<p className="text-xs text-gray-400">@username</p>
									</div>
								</div>

								<div className="text-center py-4 rounded-lg border border-gray-800/50 bg-gray-900/40">
									<p className="text-sm text-gray-300">
										Actual search functionality coming soon
									</p>
								</div>
							</div>
						) : null}
					</div>
				</div>
			</div>
		</>
	);
}
